// shared/console-scope.js — the Console's CDP-held scope (console round 2, spec §2).
//
// Declarations persist between commands. The service worker (background.js, via importScripts)
// creates one scope object per tab with Runtime.evaluate(returnByValue:false) and keeps only its
// objectId, a random key and a random suffix; the page never holds a reference to it. Every
// command then runs through Runtime.callFunctionOn against that object:
//
//   - buildScopeExpression(helperSource, key): the scope, built once with syntax only (no
//     page-realm function is called on its objects). A prototype-less object whose only member,
//     open(key), hands out the API: global, begin, value, finish, take, get, set, define. Values
//     live in closures. The helper module is evaluated here against a shadowed `window`.
//   - planRun(code, known, suffix): one command, as a STRICT, non-async function whose wrapper
//     names end in the scope's suffix. The scope names the command uses become locals read from
//     the scope; the body runs and hands its last expression to a closure; its top-level
//     declarations (and bare top-level assignments to new names, REPL-style) are exported back as
//     live cells. Whether the value is a promise is CDP's answer (INSPECT_FUNCTION → RemoteObject
//     subtype), the answer is encoded by FINISH_FUNCTION and read by TAKE_FUNCTION.
//   - declaredNames(code): the command's top-level bindings, found by a depth-0 scanner that
//     understands strings, templates, comments, regex literals and destructuring patterns.
//   - contextFor / encodeContext: the context members a command names, as ordered pairs.
//
// Threat model C-1: no XRAY frame is sloppy and there is no `with` (a page's
// Error.prepareStackTrace / `.caller` sees nothing); no XRAY object passes through a promise or a
// page-realm function; the command's value is never asked for `then`.
//
// Pure: no chrome.*, no DOM. Published on the global (`self` in the worker).
(function () {
  'use strict';

  const ID_START = /[\p{ID_Start}$_]/u;
  const ID_PART = /[\p{ID_Continue}$\u200c\u200d]/u;
  const SPACE = /\s/;
  const NEWLINE = /[\n\r\u2028\u2029]/;
  // Words after which a `/` starts a regex literal rather than a division.
  const REGEX_AFTER_WORD = new Set(['return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void', 'throw', 'case', 'do', 'else', 'yield', 'await']);
  // A token on a new line that continues the previous expression (no semicolon insertion).
  const CONTINUES = new Set(['.', '?.', '(', '[', '?', ':', '+', '-', '*', '/', '%', '&', '|', '^', '<', '>', '=', '==', '===', '=>', ',', '`']);

  // ── tokens ──────────────────────────────────────────────────────────────────────────────

  function skipString(code, i) {
    const quote = code[i];
    for (let j = i + 1; j < code.length; j++) {
      const ch = code[j];
      if (ch === '\\') { j++; continue; }
      if (ch === quote || ch === '\n') return j + 1;
    }
    return code.length;
  }

  function skipComment(code, i) {
    if (code[i + 1] === '/') {
      const end = code.indexOf('\n', i);
      return end === -1 ? code.length : end;
    }
    const end = code.indexOf('*/', i + 2);
    return end === -1 ? code.length : end + 2;
  }

  // Code inside `${ … }` up to its closing brace (nested strings, templates and comments skipped).
  function skipTemplateCode(code, i) {
    let depth = 0;
    while (i < code.length) {
      const ch = code[i];
      if (ch === '"' || ch === "'") { i = skipString(code, i); continue; }
      if (ch === '`') { i = skipTemplate(code, i); continue; }
      if (ch === '/' && (code[i + 1] === '/' || code[i + 1] === '*')) { i = skipComment(code, i); continue; }
      if (ch === '{') depth++;
      else if (ch === '}') {
        if (depth === 0) return i + 1;
        depth--;
      }
      i++;
    }
    return code.length;
  }

  function skipTemplate(code, i) {
    let j = i + 1;
    while (j < code.length) {
      const ch = code[j];
      if (ch === '\\') { j += 2; continue; }
      if (ch === '`') return j + 1;
      if (ch === '$' && code[j + 1] === '{') { j = skipTemplateCode(code, j + 2); continue; }
      j++;
    }
    return code.length;
  }

  function skipRegex(code, i) {
    let inClass = false;
    for (let j = i + 1; j < code.length; j++) {
      const ch = code[j];
      if (ch === '\\') { j++; continue; }
      if (ch === '\n') return j;
      if (inClass) { if (ch === ']') inClass = false; continue; }
      if (ch === '[') { inClass = true; continue; }
      if (ch === '/') {
        let k = j + 1;
        while (k < code.length && /[a-z]/i.test(code[k])) k++;
        return k;
      }
    }
    return code.length;
  }

  function regexAllowed(prev) {
    if (!prev) return true;
    if (prev.t === 'punct') return prev.v !== ')' && prev.v !== ']' && prev.v !== '}';
    if (prev.t === 'name') return REGEX_AFTER_WORD.has(prev.v);
    return false;
  }

  // Tokens: { t: 'name' | 'punct' | 'str' | 'tmpl' | 're' | 'num', v, nl } — `nl` when a line
  // break precedes the token. Literals are opaque: nothing inside them is ever a declaration.
  function tokenize(code) {
    const tokens = [];
    let nl = false;
    let start = 0;
    // `at`: where the token starts, so adjacent operator characters (`+=`, `++`) can be told apart.
    const push = (t, v) => {
      tokens.push({ t, v, nl, at: start });
      nl = false;
    };
    let i = 0;
    while (i < code.length) {
      const ch = code[i];
      if (NEWLINE.test(ch)) { nl = true; i++; continue; }
      if (SPACE.test(ch)) { i++; continue; }
      if (ch === '/' && (code[i + 1] === '/' || code[i + 1] === '*')) {
        const end = skipComment(code, i);
        // An unterminated block comment (eager preview never sends one: it would not compile).
        if (code[i + 1] === '*' && (end < i + 4 || code[end - 2] !== '*' || code[end - 1] !== '/')) tokens.unterminated = true;
        if (NEWLINE.test(code.slice(i, end))) nl = true;
        i = end;
        continue;
      }
      start = i;
      if (ch === '"' || ch === "'") { i = skipString(code, i); push('str', ''); continue; }
      if (ch === '`') { i = skipTemplate(code, i); push('tmpl', ''); continue; }
      if (ID_START.test(ch)) {
        let j = i + 1;
        while (j < code.length && ID_PART.test(code[j])) j++;
        push('name', code.slice(i, j));
        i = j;
        continue;
      }
      if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(code[i + 1] || ''))) {
        let j = i + 1;
        // An exponent's sign belongs to the number (\`1e-5\`).
        while (j < code.length && (/[\w.]/.test(code[j]) || ((code[j] === '+' || code[j] === '-') && /[eE]/.test(code[j - 1]) && !/^0[xX]/.test(code.slice(i, j))))) j++;
        push('num', code.slice(i, j));
        i = j;
        continue;
      }
      if (ch === '/' && regexAllowed(tokens[tokens.length - 1])) { i = skipRegex(code, i); push('re', ''); continue; }
      if (code.startsWith('...', i)) { push('punct', '...'); i += 3; continue; }
      if (code.startsWith('?.', i) && !/[0-9]/.test(code[i + 2] || '')) { push('punct', '?.'); i += 2; continue; }
      if (ch === '=') {
        let j = i + 1;
        if (code[j] === '>') { push('punct', '=>'); i += 2; continue; }
        while (code[j] === '=') j++;
        push('punct', code.slice(i, j));
        i = j;
        continue;
      }
      push('punct', ch);
      i++;
    }
    return tokens;
  }

  // ── declarations ────────────────────────────────────────────────────────────────────────

  const OPEN = new Set(['(', '[', '{']);
  const CLOSE = new Set([')', ']', '}']);

  /**
   * The top-level (depth-0) bindings a command declares, in order: `const`/`let`/`var`
   * (incl. object and array destructuring with defaults and rest), `function` (also async and
   * generator) and `class`. Nested blocks, function bodies and `for (let …)` heads are ignored,
   * as is anything inside strings, templates, comments and regex literals. Limit: a `var` inside
   * a nested block hoists to the top in JS but is not found here.
   */
  function declarations(code) {
    const toks = tokenize(String(code || ''));
    const out = [];
    const at = (k) => toks[k];
    const is = (k, v) => !!toks[k] && toks[k].t === 'punct' && toks[k].v === v;

    // Past an initialiser or default: the next depth-0 `,` or `;`, a closing bracket of the
    // enclosing pattern, or a line break that ends the statement.
    function skipExpression(k) {
      const start = k;
      let depth = 0;
      while (k < toks.length) {
        const tok = toks[k];
        if (tok.t === 'punct' && OPEN.has(tok.v)) depth++;
        else if (tok.t === 'punct' && CLOSE.has(tok.v)) {
          if (depth === 0) return k;
          depth--;
        } else if (depth === 0 && tok.t === 'punct' && (tok.v === ',' || tok.v === ';')) return k;
        else if (depth === 0 && tok.nl && k > start) {
          const prev = toks[k - 1];
          const prevOpen = prev.t === 'punct' && !CLOSE.has(prev.v);
          const continues = (tok.t === 'punct' && CONTINUES.has(tok.v)) || (tok.t === 'name' && (tok.v === 'in' || tok.v === 'instanceof'));
          if (!prevOpen && !continues) return k;
        }
        k++;
      }
      return k;
    }

    // Past a balanced bracket group starting at k (a computed key).
    function skipGroup(k) {
      let depth = 0;
      while (k < toks.length) {
        const tok = toks[k];
        if (tok.t === 'punct' && OPEN.has(tok.v)) depth++;
        else if (tok.t === 'punct' && CLOSE.has(tok.v)) {
          depth--;
          if (depth <= 0) return k + 1;
        }
        k++;
      }
      return k;
    }

    function binding(k, kind) {
      const tok = at(k);
      if (!tok) return k;
      if (tok.t === 'name') {
        out.push({ name: tok.v, kind });
        return k + 1;
      }
      if (is(k, '[')) return arrayPattern(k + 1, kind);
      if (is(k, '{')) return objectPattern(k + 1, kind);
      return k;
    }

    function withDefault(k) {
      return is(k, '=') ? skipExpression(k + 1) : k;
    }

    function arrayPattern(k, kind) {
      while (k < toks.length) {
        if (is(k, ']')) return k + 1;
        if (is(k, ',')) { k++; continue; }
        const before = k;
        k = is(k, '...') ? binding(k + 1, kind) : binding(k, kind);
        k = withDefault(k);
        if (k === before) k++;
      }
      return k;
    }

    function objectPattern(k, kind) {
      while (k < toks.length) {
        if (is(k, '}')) return k + 1;
        if (is(k, ',')) { k++; continue; }
        const before = k;
        if (is(k, '...')) {
          k = binding(k + 1, kind);
        } else if (is(k, '[')) {
          k = skipGroup(k);
          if (is(k, ':')) k = binding(k + 1, kind);
        } else if (is(k + 1, ':')) {
          k = binding(k + 2, kind);
        } else if (at(k).t === 'name') {
          out.push({ name: at(k).v, kind });
          k++;
        }
        k = withDefault(k);
        if (k === before) k++;
      }
      return k;
    }

    function declarators(k, kind) {
      while (k < toks.length) {
        const before = k;
        k = withDefault(binding(k, kind));
        if (!is(k, ',')) return k === before ? k + 1 : k;
        k++;
      }
      return k;
    }

    const statementStart = (k) => {
      if (k === 0) return true;
      const prev = toks[k - 1];
      if (prev.t === 'punct' && (prev.v === ';' || prev.v === '}')) return true;
      return toks[k].nl && !(prev.t === 'punct' && (prev.v === '.' || prev.v === '?.'));
    };

    let depth = 0;
    let k = 0;
    while (k < toks.length) {
      const tok = toks[k];
      if (tok.t === 'punct') {
        if (OPEN.has(tok.v)) depth++;
        else if (CLOSE.has(tok.v)) depth = Math.max(0, depth - 1);
        k++;
        continue;
      }
      if (depth === 0 && tok.t === 'name' && statementStart(k)) {
        const next = at(k + 1);
        if ((tok.v === 'const' || tok.v === 'let' || tok.v === 'var') && next &&
            (next.t === 'name' ? !(next.v === 'in' || next.v === 'instanceof' || next.v === 'of') : is(k + 1, '{') || is(k + 1, '['))) {
          k = declarators(k + 1, tok.v);
          continue;
        }
        if (tok.v === 'function' || (tok.v === 'async' && next?.t === 'name' && next.v === 'function' && !next.nl)) {
          let n = tok.v === 'async' ? k + 2 : k + 1;
          if (is(n, '*')) n++;
          if (at(n)?.t === 'name') out.push({ name: at(n).v, kind: 'function' });
          k = n + 1;
          continue;
        }
        if (tok.v === 'class') {
          if (next?.t === 'name' && next.v !== 'extends') out.push({ name: next.v, kind: 'class' });
          k += 2;
          continue;
        }
      }
      k++;
    }
    return out;
  }

  function declaredNames(code) {
    const seen = new Set();
    const names = [];
    for (const { name } of declarations(code)) {
      if (seen.has(name)) continue;
      seen.add(name);
      names.push(name);
    }
    return names;
  }

  // ── the command body (the last expression is the result, like DevTools) ─────────────────

  // Index just past the last top-level statement separator (`;` or newline outside
  // brackets, strings, template literals and comments), or -1. Lets multi-statement input
  // return its final expression the way DevTools does: `const x = 2; x * 3` -> 6.
  function lastStatementStart(code) {
    let depth = 0;
    let quote = '';
    let last = -1;
    let prev = '';
    let prev2 = '';
    for (let i = 0; i < code.length; i++) {
      const ch = code[i];
      const next = code[i + 1];
      if (quote) {
        if (ch === '\\') { i++; continue; }
        if (ch === quote) quote = '';
        continue;
      }
      if (ch === '/' && next === '/') {
        const end = code.indexOf('\n', i);
        if (end === -1) break;
        i = end - 1;
        continue;
      }
      if (ch === '/' && next === '*') {
        const end = code.indexOf('*/', i + 2);
        if (end === -1) break;
        i = end + 1;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') { quote = ch; prev = ch; prev2 = ''; continue; }
      if (ch === '(' || ch === '[' || ch === '{') depth++;
      else if (ch === ')' || ch === ']' || ch === '}') depth = Math.max(0, depth - 1);
      else if (depth === 0 && ch === ';') last = i + 1;
      else if (depth === 0 && ch === '\n' && !continuesAcross(code, i, prev, prev2)) last = i + 1;
      if (!/\s/.test(ch)) { prev2 = prev; prev = ch; }
    }
    return last;
  }

  // A depth-0 newline that does not end the statement: the line before ends in an operator
  // (`1 +⏎2`, `a,⏎b` — not `x++`/`x--`, and not `/`, which may end a regex literal), or the next line starts with `.`/`?.` or a
  // binary-only operator (`res.users⏎  .map(…)`) — issue #15.
  function continuesAcross(code, i, prev, prev2) {
    if (prev && '+-*%=<>&|^!~?:,.'.includes(prev) && !((prev === '+' || prev === '-') && prev2 === prev)) return true;
    let j = i + 1;
    while (j < code.length && /\s/.test(code[j])) j++;
    const next = code[j];
    const after = code[j + 1];
    if (next === '.' && after !== '.') return true;
    if (next === '?' && (after === '.' || after === '?')) return true;
    return !!next && '*%=<>&|^,'.includes(next);
  }

  // The command's last expression is handed to the run (`__xrayBox(value)` records it in a
  // closure), never returned: a value returned from an async function goes through promise
  // resolution, where a page's `then` getter could read or replace it (threat model C-1). The
  // run then sees that the value is a promise and labels the cell `Promise · fulfilled in N ms`
  // (spec §1). A user's explicit top-level `return` ends the command with no value.
  const DEFAULT_BOX = '__xrayBox';
  const RETURN_CLOSE = '));';
  const STATEMENT_START = /^(const|let|var|if|for|while|do|switch|try|throw|class|function|return|break|continue|debugger|import|export)\b/;

  function isExpression(code) {
    const trimmed = String(code || '').trim();
    return !trimmed.includes(';') && !trimmed.includes('\n') && !STATEMENT_START.test(trimmed);
  }

  // The body that runs the command, and where its text sits in it: `map(line, col)` (1-based, in
  // the body) gives the position in the command, or null for text the wrapper added. Lines before
  // the returned tail are the command's own lines; the tail moves to a line of its own after
  // `return __xrayBox((`.
  function userSource(trimmed, box = DEFAULT_BOX) {
    const RETURN_OPEN = `${box}((`;
    const identity = (line, col) => ({ line, col });
    if (isExpression(trimmed)) {
      return {
        body: `${RETURN_OPEN}${trimmed}${RETURN_CLOSE}`,
        map: (line, col) => (line === 1 && col > RETURN_OPEN.length && col <= RETURN_OPEN.length + trimmed.length
          ? { line: 1, col: col - RETURN_OPEN.length }
          : null),
      };
    }
    const body = trimmed.replace(/[;\s]+$/, '');
    const start = lastStatementStart(body);
    if (start <= 0) {
      // One top-level statement whose `;` and newlines all sit inside brackets, braces or
      // strings (`[1, 2].map(x => { const y = x; return y })`, a multi-line call or object
      // literal): an expression unless a keyword or a block opens it (issue #15).
      if (!body || STATEMENT_START.test(body) || /^async\s+function\b/.test(body) || /^[{}\])]/.test(body)) return { body: trimmed, map: identity };
      return {
        body: `${RETURN_OPEN}${body}${RETURN_CLOSE}`,
        map: (line, col) => {
          if (line > 1) return { line, col };
          return col > RETURN_OPEN.length ? { line: 1, col: col - RETURN_OPEN.length } : null;
        },
      };
    }
    const tail = body.slice(start).trim();
    // Strip leading line comments so `// note\nexpr` still returns expr.
    const tailCode = tail.replace(/^(\/\/[^\n]*\n\s*)+/, '');
    // The tail is a single top-level statement, so only its leading keyword decides.
    // A tail that starts with `{` is a block statement (`var a = 1; { var b = 2 }`), not an object.
    if (!tailCode || tailCode.startsWith('//') || STATEMENT_START.test(tailCode) || /^[{}\])]/.test(tailCode)) {
      return { body: trimmed, map: identity };
    }
    const head = body.slice(0, start);
    // tailCode is the end of `body` (only leading space and comments were dropped).
    const tailAt = body.length - tailCode.length;
    const before = body.slice(0, tailAt);
    const tailLine = before.split('\n').length;
    const tailCol = tailAt - before.lastIndexOf('\n');
    const bodyTailLine = head.split('\n').length + 1;
    return {
      body: `${head}\n${RETURN_OPEN}${tailCode}${RETURN_CLOSE}`,
      map: (line, col) => {
        if (line < bodyTailLine) return { line, col };
        if (line > bodyTailLine) return { line: tailLine + line - bodyTailLine, col };
        return col > RETURN_OPEN.length ? { line: tailLine, col: col - RETURN_OPEN.length + tailCol - 1 } : null;
      },
    };
  }

  // ── names a command reads and writes ────────────────────────────────────────────────────

  // Strict-mode words that can never be a binding name in generated code.
  const RESERVED = new Set(('break case catch class const continue debugger default delete do else enum export extends false ' +
    'finally for function if import in instanceof new null return super switch this throw true try typeof var void while ' +
    'with yield let static implements interface package private protected public await arguments eval undefined NaN Infinity').split(' '));
  const NAME = /^[\p{ID_Start}$_][\p{ID_Continue}$‌‍]*$/u;
  // Operators that combine with `=` into an assignment (`+=`, `**=`, `??=` …); `<=`, `>=`, `!=` are not.
  const COMPOUND = new Set(['+', '-', '*', '/', '%', '**', '<<', '>>', '>>>', '&', '|', '^', '&&', '||', '??']);

  /** A name generated code may bind: an identifier (Unicode too) that is not a reserved word. */
  function bindable(name) {
    return typeof name === 'string' && NAME.test(name) && !RESERVED.has(name);
  }

  const memberAccess = (prev) => !!prev && prev.t === 'punct' && (prev.v === '.' || prev.v === '?.');
  const adjacent = (a, b) => !!a && !!b && b.at === a.at + a.v.length;

  // Whether the punctuation from toks[k] on is an assignment operator (`=`, `+=`, `>>>=` …).
  function assignsAt(toks, k) {
    let op = '';
    for (let j = k; j < toks.length && toks[j].t === 'punct'; j++) {
      if (j > k && !adjacent(toks[j - 1], toks[j])) return false;
      op += toks[j].v;
      if (toks[j].v === '=') return op === '=' || COMPOUND.has(op.slice(0, -1));
      if (op.length > 3) return false;
    }
    return false;
  }

  /** Every identifier the command names (not a property after `.`) — over-inclusive by design. */
  function referencedNames(code) {
    const toks = tokenize(String(code || ''));
    const out = new Set();
    for (let k = 0; k < toks.length; k++) {
      if (toks[k].t === 'name' && !memberAccess(toks[k - 1])) out.add(toks[k].v);
    }
    return out;
  }

  /** Identifiers the command assigns anywhere (`x = …`, `x += …`, `x++`, `--x`). */
  function assignedNames(code) {
    const toks = tokenize(String(code || ''));
    const out = new Set();
    const isPunct = (tok, v) => !!tok && tok.t === 'punct' && tok.v === v;
    for (let k = 0; k < toks.length; k++) {
      const tok = toks[k];
      if (tok.t !== 'name' || memberAccess(toks[k - 1])) continue;
      const after = toks[k + 1];
      const step = (a, b, sign) => isPunct(a, sign) && isPunct(b, sign) && adjacent(a, b);
      if ((after && after.t === 'punct' && assignsAt(toks, k + 1)) ||
          step(after, toks[k + 2], '+') || step(after, toks[k + 2], '-') ||
          step(toks[k - 2], toks[k - 1], '+') || step(toks[k - 2], toks[k - 1], '-')) out.add(tok.v);
    }
    return out;
  }

  /**
   * Bare top-level assignments (`x = 1`, `x += 2` at the start of a depth-0 statement). A name
   * the scope does not know becomes a REPL declaration (like `var`), never a page global.
   */
  function statementAssignments(code) {
    const toks = tokenize(String(code || ''));
    const out = [];
    let depth = 0;
    for (let k = 0; k < toks.length; k++) {
      const tok = toks[k];
      if (tok.t === 'punct') {
        if (OPEN.has(tok.v)) depth++;
        else if (CLOSE.has(tok.v)) depth = Math.max(0, depth - 1);
        continue;
      }
      if (depth !== 0 || tok.t !== 'name') continue;
      const prev = toks[k - 1];
      const start = k === 0 || (prev.t === 'punct' && (prev.v === ';' || prev.v === '}')) || (tok.nl && !memberAccess(prev));
      if (start && toks[k + 1]?.t === 'punct' && assignsAt(toks, k + 1) && !out.includes(tok.v)) out.push(tok.v);
    }
    return out;
  }

  /**
   * The names a context provides: the runtime helpers (`helperNames`, by default the one list,
   * shared/console-helpers.js RUNTIME_NAMES, which the worker loads first), its saved variables,
   * its pins a–f.
   */
  function contextNames(context, helperNames) {
    const plain = (value) => (value && typeof value === 'object' && !Array.isArray(value) ? value : null);
    const shared = globalThis.XRAY_ConsoleHelpers && globalThis.XRAY_ConsoleHelpers.RUNTIME_NAMES;
    const helpers = Array.isArray(helperNames) ? helperNames : Array.isArray(shared) ? shared : [];
    const names = new Set(helpers.filter(bindable));
    const saved = plain(context && context.scope);
    if (saved) for (const name of Object.keys(saved)) if (bindable(name)) names.add(name);
    const pins = plain(context && context.pins);
    if (pins) for (const name of Object.keys(pins)) if (/^[a-f]$/.test(name)) names.add(name);
    return [...names];
  }

  // ── what the worker sends ───────────────────────────────────────────────────────────────

  // Which context members a runtime name needs (shared/console-helpers.js createRuntime; every name
  // here is in its RUNTIME_NAMES, test/unit/consoleScope.test.mjs). A name in none of these lists
  // (pick, omit, schema, help …) needs no context at all.
  const VALUE_OF = { res: 'res', response: 'res', $res: 'res', req: 'req', request: 'req', $req: 'req', prev: 'prev', next: 'next' };
  const NEEDS_CURRENT = new Set(['entry', '$r', 'headers', '$headers', '$h', 'responseHeaders', 'requestHeaders', '$rh', '$url', '$params',
    '$statusCode', '$time', '$size', '$method', '$curl', '$fetch', '$mock', 'mock', 'prevEntry', 'nextEntry', '$similar', 'similar', '$prev', '$next']);
  const NEEDS_ENTRIES = new Set(['$all', 'all', '$similar', 'similar', '$prev', '$next', '$errors', 'errors', '$slow', 'slow', '$status',
    '$endpoint', '$domain', 'prevEntry', 'nextEntry']);

  /**
   * Worker side: the part of the context a command uses — `names` are the context names it
   * references (not its own declarations). Only those saved variables, pins and typed values
   * travel; the selected entry and the entry list only when a named helper reads them. Every
   * root key is present (null or empty), so the page side never reads a missing key.
   */
  function contextFor(context, names) {
    const plain = (value) => (value && typeof value === 'object' && !Array.isArray(value) ? value : null);
    const own = (holder, key) => !!holder && Object.prototype.hasOwnProperty.call(holder, key);
    const full = plain(context) || {};
    const values = plain(full.values);
    const saved = plain(full.scope);
    const pins = plain(full.pins);
    const out = { currentEntry: null, entries: [], values: {}, scope: {}, pins: {} };
    let current = false;
    let entries = false;
    for (const name of names || []) {
      if (own(saved, name)) out.scope[name] = saved[name];
      if (/^[a-f]$/.test(name) && own(pins, name)) out.pins[name] = pins[name];
      if (Object.prototype.hasOwnProperty.call(VALUE_OF, name)) {
        const key = VALUE_OF[name];
        if (own(values, key)) out.values[key] = values[key];
        else if (key === 'prev' || key === 'next') { current = true; entries = true; } else current = true;
      }
      if (NEEDS_CURRENT.has(name)) current = true;
      if (NEEDS_ENTRIES.has(name)) { current = true; entries = true; }
    }
    if (current && plain(full.currentEntry)) out.currentEntry = full.currentEntry;
    if (entries && Array.isArray(full.entries)) out.entries = full.entries;
    return out;
  }

  /**
   * Worker side: the context as a CDP argument value that survives the trip exactly. Chrome
   * passes an argument object as a dictionary — keys sorted, a "__proto__" key turned into a
   * prototype — so every object travels as `{ t: 'o', v: [key, value, …] }` (its own keys in
   * order) and every array as `{ t: 'a', v: [items] }`; the scope rebuilds both with syntax only.
   */
  function encodeContext(value) {
    const walk = (node, depth) => {
      if (node === null || typeof node !== 'object') return node;
      if (depth > 400) return null;
      if (Array.isArray(node)) return { t: 'a', v: node.map((item) => walk(item, depth + 1)) };
      const pairs = [];
      for (const key of Object.keys(node)) pairs.push(key, walk(node[key], depth + 1));
      return { t: 'o', v: pairs };
    };
    return walk(value, 0);
  }

  // ── builders ────────────────────────────────────────────────────────────────────────────

  // The line just before the command's own text in a run function; stack frames and compile
  // errors are mapped from the lines after it (background.js _mapConsoleStack).
  const BODY_MARKER = '// __xray:command';
  /** What a run function returns when the page could only start it after its deadline (it ran nothing). */
  const SKIPPED = 'xray:skipped';

  /**
   * The `functionDeclaration` for Runtime.callFunctionOn(scope) that starts one command. It is
   * STRICT and not async: it returns the command's promise, which resolves to `undefined` once
   * the command, its top-level promise and its encoding are done; the answer is then read with a
   * second, synchronous call (TAKE_FUNCTION). No XRAY object is ever returned through, or
   * resolved into, a promise (a page's `then`/`constructor` hooks would read or forge it), and
   * no XRAY frame is sloppy (a page's Error.prepareStackTrace / `.caller` would reach it).
   *
   * There is no `with`: the scope names the command references become locals read from the
   * scope — context names (res, req, pins, saved variables, helpers; read-only) and earlier
   * declarations (`const` for consts; read live through the declaring command's closure). The
   * body's top-level declarations are exported back when it ends (each in its own try, so a name
   * still in its TDZ is skipped); earlier declarations it assigns are written back. A bare
   * top-level assignment to a name the scope does not know sets the page global when the page
   * has one, and is otherwise a REPL declaration — never a new page global.
   *
   * `known`: { context: string[] (names this run's context provides), declared: { name: kind } }.
   * Arguments: the scope key and the context members the command uses (contextFor, encodeContext).
   *
   * Answers { text (that function), needed (the context names the command uses: contextFor's
   * `names`), box (its box's name, for userSource's line map) }. `suffix` (per scope, random) makes
   * every name the wrapper adds unknown to the command: no user name collides with one, and the
   * scope key is never readable as a plain identifier.
   */
  function planRun(code, known = {}, suffix = 'x') {
    const trimmed = String(code || '').trim();
    const tag = /^[a-z0-9]+$/i.test(String(suffix)) ? String(suffix) : 'x';
    const id = (name) => `__x${tag}_${name}`;
    const K = { key: id('key'), context: id('context'), deadline: id('deadline'), g: id('g'), api: id('api'), run: id('run'), box: id('box'), out: id('export'), error: id('error'), value: id('value') };
    const kinds = new Map();
    for (const { name, kind } of declarations(trimmed)) if (bindable(name)) kinds.set(name, kind);
    const declared = known && known.declared && typeof known.declared === 'object' ? known.declared : {};
    const declaredKind = (name) => (Object.prototype.hasOwnProperty.call(declared, name) ? declared[name] : null);
    const scopeNames = new Set([...(Array.isArray(known.context) ? known.context : []), ...Object.keys(declared)].filter(bindable));
    const implicit = statementAssignments(trimmed).filter((name) => bindable(name) && !scopeNames.has(name) && !kinds.has(name));
    const assigned = assignedNames(trimmed);
    const bound = [...referencedNames(trimmed)].filter((name) => scopeNames.has(name) && !kinds.has(name));
    const needed = bound.filter((name) => !declaredKind(name));
    const quote = (name) => JSON.stringify(name);
    const bindings = bound.map((name) => {
      const kind = declaredKind(name);
      return `${!kind || kind === 'const' ? 'const' : 'let'} ${name} = ${K.api}.get(${quote(name)});`;
    }).join('\n  ');
    const writeBack = bound
      .filter((name) => declaredKind(name) && declaredKind(name) !== 'const' && assigned.has(name))
      .map((name) => `try { ${K.api}.set(${quote(name)}, ${name}); } catch {}`)
      .join(' ');
    const define = (name, kind) => `try { void ${name}; ${K.api}.define(${quote(name)}, () => ${name}, ${kind === 'const' ? 'null' : `(${K.value}) => { ${name} = ${K.value}; }`}, ${quote(kind)}); } catch {}`;
    const exports = [...kinds.entries()].map(([name, kind]) => define(name, kind)).join(' ');
    // An implicit name is the page's global when the page has one (read at the start, written
    // back at the end), else a REPL `var` exported like a declaration.
    const implicitStart = implicit
      .map((name, i) => `const ${id(`global${i}`)} = ${quote(name)} in ${K.g}; var ${name} = ${id(`global${i}`)} ? ${K.g}[${quote(name)}] : undefined;`)
      .join('\n    ');
    const implicitEnd = implicit
      .map((name, i) => `if (${id(`global${i}`)}) { try { ${K.g}[${quote(name)}] = ${name}; } catch {} } else { ${define(name, 'var')} }`)
      .join(' ');
    const body = userSource(trimmed, K.box).body;
    // The command's promise resolves to `undefined` once its statements and exports are done;
    // what its value is (a native promise or not) the worker asks CDP, never the page.
    const text = `function (${K.key}, ${K.context}, ${K.deadline}) {
  'use strict';
  const ${K.api} = this.open(${K.key});
  if (${K.api}.late(${K.deadline})) return ${JSON.stringify(SKIPPED)};
  const ${K.g} = ${K.api}.global;
  const ${K.run} = ${K.api}.begin(${K.context}, ${JSON.stringify(needed)});
  const ${K.box} = ${K.run}.box;
  ${bindings}
  let ${K.out} = null;
  return (async function () {
    ${implicitStart}
    try {
      ${exports ? `${K.out} = () => { ${exports} };` : ''}
${BODY_MARKER}
${body}
    } catch (${K.error}) {
      ${K.run}.fail(${K.error});
    } finally {
      ${writeBack} ${implicitEnd}
      if (${K.out}) ${K.out}();
      ${K.run}.ran();
    }
  })();
}`;
    return { text, needed, box: K.box };
  }

  /** The value a finished command produced, as a CDP RemoteObject (its `subtype` says promise). */
  const INSPECT_FUNCTION = "function (key) { 'use strict'; return this.open(key).value(); }";
  /** Encodes the answer (mode: value | fulfilled | rejected | pending); resolves to undefined. */
  const FINISH_FUNCTION = "function (key, mode, settled) { 'use strict'; return this.open(key).finish(mode, settled); }";

  /** The synchronous call that reads a command's answer (a prototype-less record, by value). */
  const TAKE_FUNCTION = "function (key) { 'use strict'; return this.open(key).take(); }";

  /**
   * The expression that creates a tab's scope (Runtime.evaluate, returnByValue:false): an
   * object whose only member, open(key), hands the command API to the holder of `key` (a random
   * string the worker keeps). STRICT and built with syntax only — prototype-less object
   * literals, `in`, `for…in` over prototype-less objects, spread, direct calls of its own
   * closures — so XRAY's own path never calls a page-realm function or reads a page-realm
   * prototype: no Object.create/freeze/defineProperty, no Reflect, no Array methods, no timers,
   * no promise it creates carries a value. The helper module runs here once, against a shadowed
   * `window` (never the page global); it is applied to the context only for a command that names
   * a context helper, and to the command's value for its encoding (see threat model C-1).
   */
  // The preview projector's JSON escapes (\", \\ and the control characters), as a prototype-less
  // object literal inlined into the scope: in the page, quoting is a table lookup.
  const PREVIEW_ESCAPES_SOURCE = (() => {
    const table = { '"': '\\"', '\\': '\\\\' };
    for (let c = 0; c < 32; c++) table[String.fromCharCode(c)] = JSON.stringify(String.fromCharCode(c)).slice(1, -1);
    return `{ __proto__: null, ${JSON.stringify(table).slice(1)}`;
  })();

  function buildScopeExpression(helperSource, key) {
    return `(() => {
  'use strict';
  // The helper module is an IIFE whose only global write is
  // \`window.XRAY_ConsoleHelpers\`. Shadowing \`window\` with a local, prototype-less object
  // captures that write here instead of reading — or touching — the page's global.
  const __helpers = (() => {
    const window = { __proto__: null };
    ${helperSource}
    return window.XRAY_ConsoleHelpers;
  })();
  const __key = ${JSON.stringify(String(key || ''))};
  // Runtime.evaluate runs this as a script: the arrow's \`this\` is the global object itself.
  const __global = this;

  // ── Live completion (Task 7, fix round 1): the typing path ──────────────────────────────────
  // Walks a plain path and lists names IN THE PAGE with descriptor reads only, using natives
  // taken now; follows data properties only (an accessor ends the walk: no page getter runs) and
  // answers one string built here with concatenation — so CDP never describes (and so never
  // formats, through a page's Error.prepareStackTrace) a page or declared value. The natives are
  // checked by their source text; a page that replaced one at load turns the walk off ('X').
  const __gopd = Object.getOwnPropertyDescriptor;
  const __gpo = Object.getPrototypeOf;
  const __gopn = Object.getOwnPropertyNames;
  const __apply = Reflect.apply;
  const __toSource = Function.prototype.toString;
  const __hasOwn = Object.prototype.hasOwnProperty;
  const __isArray = Array.isArray;
  const __isView = ArrayBuffer.isView;
  // Task 7 round 3: every run and walk carries the worker's deadline; one the page could only
  // start after it (a page busy past the cap) does nothing. Date.now taken now and native-checked
  // (round 4): a page clock replaced before this (MockDate, fake timers) is never called — the
  // guard is then off on this page. One clock with the worker's: no grace.
  const __now = Date.now;
  let __walkable = false;
  try {
    const nativeText = (fn, name) => __apply(__toSource, fn, []) === 'function ' + name + '() { [native code] }';
    __walkable = nativeText(__gopd, 'getOwnPropertyDescriptor') && nativeText(__gpo, 'getPrototypeOf') && nativeText(__gopn, 'getOwnPropertyNames')
      && nativeText(__apply, 'apply') && nativeText(__toSource, 'toString') && nativeText(__hasOwn, 'hasOwnProperty')
      && nativeText(__isArray, 'isArray') && nativeText(__isView, 'isView');
  } catch {
    __walkable = false;
  }
  let __nowNative = false;
  try {
    __nowNative = __apply(__toSource, __toSource, []) === 'function toString() { [native code] }'
      && __apply(__toSource, __now, []) === 'function now() { [native code] }';
  } catch {
    __nowNative = false;
  }
  const late = (deadline) => __nowNative && typeof deadline === 'number' && __now() > deadline;
  const LIVE_SCAN = 3000;
  const LIVE_MAX = 500;
  // The globals are never cut silently: all of them, up to this hard bound (then \`capped\`).
  const GLOBALS_MAX = 5000;
  const PARAMS_MAX = 200;
  const SOURCE_MAX = 4000;
  const MISSING = { __proto__: null };
  const ACCESSOR = { __proto__: null };
  const isRef = (v) => v !== null && (typeof v === 'object' || typeof v === 'function');
  const ownField = (d, k) => __apply(__hasOwn, d, [k]);
  // The value of the first property named \`key\` on \`v\`'s chain: a data property's value, else
  // ACCESSOR (never read) or MISSING.
  const dataValue = (v, key) => {
    // An Error's \`stack\` is never read, whatever shape V8 gives it (formatting it would run the
    // page's Error.prepareStackTrace).
    if (key === 'stack') return ACCESSOR;
    let o = v;
    for (let depth = 0; isRef(o) && depth < 64; depth++) {
      const d = __gopd(o, key);
      if (d !== undefined) return ownField(d, 'value') ? d.value : ACCESSOR;
      o = __gpo(o);
    }
    return MISSING;
  };
  const isIdentChar = (c) => (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c === '_' || c === '$';
  const isSpace = (c) => c === ' ' || c === '\\n' || c === '\\t' || c === '\\r';
  const startsWord = (s, w) => {
    for (let k = 0; k < w.length; k++) if (s[k] !== w[k]) return false;
    return s[w.length] === undefined || !isIdentChar(s[w.length]);
  };
  const NATIVE_TAIL = '[native code] }';
  // A function's shape from its source (read by index, at most SOURCE_MAX characters):
  // native, class, or a function with its parameter list (at most PARAMS_MAX characters).
  const shape = (fn) => {
    let src = '';
    try { src = __apply(__toSource, fn, []); } catch { return { kind: 'f', native: false, params: '', arrow: false, async: false }; }
    const n = src.length;
    let native = n >= NATIVE_TAIL.length;
    for (let k = 0; native && k < NATIVE_TAIL.length; k++) if (src[n - NATIVE_TAIL.length + k] !== NATIVE_TAIL[k]) native = false;
    if (native) return { kind: 'f', native: true, params: '', arrow: false, async: false };
    if (startsWord(src, 'class')) return { kind: 'c', native: false, params: '', arrow: false, async: false };
    const limit = n < SOURCE_MAX ? n : SOURCE_MAX;
    let i = 0;
    const isAsync = startsWord(src, 'async');
    if (isAsync) { i = 5; while (i < limit && isSpace(src[i])) i++; }
    let j = i;
    while (j < limit && isIdentChar(src[j])) j++;
    if (j > i) {
      let k = j;
      while (k < limit && isSpace(src[k])) k++;
      if (src[k] === '=' && src[k + 1] === '>') {
        let name = '';
        for (let m = i; m < j; m++) name += src[m];
        return { kind: 'f', native: false, params: '(' + name + ')', arrow: true, async: isAsync };
      }
    }
    let open = i;
    while (open < limit && src[open] !== '(') open++;
    let out = '';
    let depth = 0;
    let gap = false;
    let quote = '';
    for (let p = open; p < limit; p++) {
      if (out.length >= PARAMS_MAX - 2) return { kind: 'f', native: false, params: out + '…)', arrow: false, async: isAsync };
      const c = src[p];
      if (quote) {
        out += c;
        if (c === '\\\\' && p + 1 < limit) { p++; out += src[p]; } else if (c === quote) quote = '';
        continue;
      }
      if (c === '/' && (src[p + 1] === '/' || src[p + 1] === '*')) {
        const block = src[p + 1] === '*';
        p += 2;
        while (p < limit && !(block ? src[p] === '*' && src[p + 1] === '/' : src[p] === '\\n')) p++;
        if (block) p++;
        gap = true;
        continue;
      }
      if (isSpace(c)) { gap = true; continue; }
      if (gap && out.length && out[out.length - 1] !== '(') out += ' ';
      gap = false;
      out += c;
      if (c === '"' || c === "'" || c === '\\u0060') quote = c;
      else if (c === '(' || c === '[' || c === '{') depth++;
      else if (c === ')' || c === ']' || c === '}') {
        depth--;
        if (depth === 0) {
          // An arrow: \`=>\` follows its parameter list (Task 8: the preview's \`(a) => {…}\`).
          let k = p + 1;
          while (k < limit && isSpace(src[k])) k++;
          return { kind: 'f', native: false, params: out, arrow: src[k] === '=' && src[k + 1] === '>', async: isAsync };
        }
      }
    }
    return { kind: 'f', native: false, params: '()', arrow: false, async: isAsync };
  };
  const entry = (kind, own, native, name, params) => kind + (own ? '1' : '0') + (native ? '1' : '0') + name.length + ':' + name + params.length + ':' + params;
  // Own and inherited names (the global object: its own only, the page's names before the
  // built-ins, never cut below GLOBALS_MAX), at most LIVE_MAX otherwise, scanning at most
  // LIVE_SCAN; \`capped\` when a bound was hit. An array, a typed array or an array-like longer
  // than LIVE_SCAN is never asked for its own names (getOwnPropertyNames would build every index
  // name: an Emscripten heap froze the page for seconds) — its \`length\` is listed instead; a
  // smaller array-like's index names are skipped and do not count toward the scan.
  const listNames = (v, globals) => {
    const max = globals ? GLOBALS_MAX : LIVE_MAX;
    const scanMax = globals ? GLOBALS_MAX : LIVE_SCAN;
    const seen = { __proto__: null };
    const builtIns = { __proto__: null };
    let page = '';
    let count = 0;
    let built = 0;
    let scanned = 0;
    let capped = false;
    let o = v;
    for (let depth = 0; isRef(o) && depth < 32 && !capped; depth++) {
      let skipOwn = false;
      if (!globals) {
        if (__isView(o)) skipOwn = true;
        else {
          // An array with items (Array.prototype is an empty array: its methods are listed), or an
          // array-like longer than the scan.
          const lengthDescriptor = __gopd(o, 'length');
          const n = lengthDescriptor !== undefined && ownField(lengthDescriptor, 'value') ? lengthDescriptor.value : undefined;
          if (typeof n === 'number' && (__isArray(o) ? n > 0 : n > LIVE_SCAN)) skipOwn = true;
        }
      }
      if (skipOwn) {
        // An array's own \`length\` (a typed array's is on its prototype, listed there).
        if (!__isView(o) && !('length' in seen)) {
          seen.length = 1;
          page += entry('p', depth === 0, false, 'length', '');
          count++;
        }
      } else {
        const list = __gopn(o);
        const n = list.length;
        for (let i = 0; i < n; i++) {
          const name = list[i];
          if (typeof name !== 'string' || (name[0] >= '0' && name[0] <= '9')) continue;
          if (scanned >= scanMax || count + built >= max) { capped = true; break; }
          scanned++;
          if (name === '__proto__' || name in seen) continue;
          seen[name] = 1;
          // Never read: listed as what it usually is.
          if (name === 'stack') { page += entry('g', depth === 0, false, name, ''); count++; continue; }
          const d = __gopd(o, name);
          if (d === undefined) continue;
          let kind = 'p';
          let native = false;
          let params = '';
          if (!ownField(d, 'value')) {
            kind = 'g';
            const get = d.get;
            native = typeof get === 'function' && shape(get).native;
          } else if (typeof d.value === 'function') {
            const s = shape(d.value);
            native = s.native;
            kind = s.kind === 'c' || (native && name[0] >= 'A' && name[0] <= 'Z') ? 'c' : 'f';
            params = s.params;
          }
          const text = entry(kind, depth === 0, native, name, params);
          if (globals && native) { builtIns[built] = text; built++; } else { page += text; count++; }
        }
      }
      if (globals) break;
      o = __gpo(o);
    }
    for (let i = 0; i < built; i++) page += builtIns[i];
    return 'L' + (capped ? '1' : '0') + page;
  };
  // \`path\`: [root, mode, ...segments] or null (the globals). mode 1: a declared root, read from the
  // scope; 2: a top-level let/const/class name (Runtime.globalLexicalScopeNames) — the binding is
  // read first, as identifier resolution would; 0: a property on the global object's chain, else
  // read as an identifier. \`read\` reads the root as an identifier (no page code runs to read a
  // binding). Answers 'L…' (names), 'T<type>' (a primitive, or nothing there), 'G' (stopped at an
  // accessor: never evaluated) or 'X' (the walk is off).
  const walk = (path, read, deadline) => {
    if (late(deadline)) return 'S';
    if (!__walkable) return 'X';
    if (path === null) return listNames(__global, true);
    const readRoot = () => {
      try { return typeof read === 'function' ? read() : MISSING; } catch { return MISSING; }
    };
    let v = MISSING;
    if (path[1] === 1) v = api.get(path[0]);
    else {
      if (path[1] === 2) v = readRoot();
      if (v === MISSING) {
        v = dataValue(__global, path[0]);
        if (v === ACCESSOR) return 'G';
        if (v === MISSING && path[1] !== 2) v = readRoot();
        if (v === MISSING) return 'T';
      }
    }
    for (let i = 2; i < path.length; i++) {
      if (!isRef(v)) return 'T';
      v = dataValue(v, path[i]);
      if (v === ACCESSOR) return 'G';
      if (v === MISSING) return 'T';
    }
    if (v === null) return 'Tnull';
    return isRef(v) ? listNames(v, false) : 'T' + typeof v;
  };

  // ── Eager preview (Task 8): the projector ─────────────────────────────────────────────────
  // The draft's value (or what it threw) as typed-model text (models/logValue.ts — the panel's
  // previewLine draws it), built here with concatenation: own descriptors only, never a page
  // getter (an accessor is \`(…)\`), never \`stack\`, never \`then\`, and the natives taken now, each
  // checked by its source text — the brand checks below are the engine's own (Map/Set \`size\`,
  // typed-array \`length\`, Date \`getTime\`, Node \`nodeType\`) or prototype identity (a typed
  // array's name; a RegExp, whose flag getters run only once it is known to be one), never the page's. Only natives V8 lets run under its side-effect check are used:
  // it refuses RegExp \`source\`, the typed-array \`@@toStringTag\` getter, Symbol \`description\`
  // and Element \`localName\`/\`id\`/\`getAttribute\` (spike output/console-round2/task-8), so a
  // regular expression shows its flags only (\`/…/gi\`) and an element its tag (\`<div>\`). Bounded:
  // the first PREVIEW_ITEMS members, one level deep. A Proxy reached here runs its own
  // getPrototypeOf/ownKeys/getOwnPropertyDescriptor traps (C-1 (i)); never get/has/apply.
  const PREVIEW_ITEMS = 5;
  // A string is cut at the panel's line length (previewLine, 120): the panel then cuts the line
  // where it cuts a Run's, so preview and Run read the same (final review M-3).
  const PREVIEW_STRING = 120;
  const PREVIEW_SCAN = 3000;
  const ESCAPES = ${PREVIEW_ESCAPES_SOURCE};
  const pv = { __proto__: null };
  let __previewable = false;
  try {
    const nativeFn = (fn) => {
      if (typeof fn !== 'function') return false;
      const src = __apply(__toSource, fn, []);
      const n = src.length;
      if (n < NATIVE_TAIL.length) return false;
      for (let k = 0; k < NATIVE_TAIL.length; k++) if (src[n - NATIVE_TAIL.length + k] !== NATIVE_TAIL[k]) return false;
      return true;
    };
    const getterOf = (owner, key) => {
      const d = __gopd(owner, key);
      return d !== undefined && ownField(d, 'get') ? d.get : undefined;
    };
    const dataOf = (owner, key) => {
      const d = __gopd(owner, key);
      return d !== undefined && ownField(d, 'value') ? d.value : undefined;
    };
    const MapCtor = dataOf(__global, 'Map');
    const SetCtor = dataOf(__global, 'Set');
    const DateCtor = dataOf(__global, 'Date');
    const RegExpCtor = dataOf(__global, 'RegExp');
    const ErrorCtor = dataOf(__global, 'Error');
    const promiseCtor = dataOf(__global, 'Promise');
    const SymbolCtor = dataOf(__global, 'Symbol');
    const ObjectCtor = dataOf(__global, 'Object');
    const U8 = dataOf(__global, 'Uint8Array');
    // Checked before they are called (once, here, on fresh empty collections only).
    if (!nativeFn(MapCtor) || !nativeFn(SetCtor)) throw 0;
    const mapProto = dataOf(MapCtor, 'prototype');
    const setProto = dataOf(SetCtor, 'prototype');
    pv.mapSize = getterOf(mapProto, 'size');
    pv.mapEntries = dataOf(mapProto, 'entries');
    pv.mapNext = dataOf(__gpo(__apply(pv.mapEntries, new MapCtor(), [])), 'next');
    pv.setSize = getterOf(setProto, 'size');
    pv.setValues = dataOf(setProto, 'values');
    pv.setNext = dataOf(__gpo(__apply(pv.setValues, new SetCtor(), [])), 'next');
    const typedProto = __gpo(dataOf(U8, 'prototype'));
    pv.taLength = getterOf(typedProto, 'length');
    // An ArrayBuffer's byte length (final review M-3: \`ArrayBuffer(8)\`, as a Run shows it); a
    // replaced getter leaves buffers as instances.
    const BufferCtor = dataOf(__global, 'ArrayBuffer');
    const bufferBytes = BufferCtor === undefined ? undefined : getterOf(dataOf(BufferCtor, 'prototype'), 'byteLength');
    pv.bufferBytes = nativeFn(bufferBytes) ? bufferBytes : null;
    // Each typed array's prototype and name (its @@toStringTag getter is refused under the check).
    pv.taNames = { __proto__: null };
    pv.taProtos = { __proto__: null };
    pv.taCount = 0;
    const taNames = ['Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array', 'Uint16Array', 'Int32Array', 'Uint32Array', 'Float16Array', 'Float32Array', 'Float64Array', 'BigInt64Array', 'BigUint64Array'];
    for (let k = 0; k < taNames.length; k++) {
      const ctor = dataOf(__global, taNames[k]);
      if (ctor === undefined) continue;
      pv.taProtos[pv.taCount] = dataOf(ctor, 'prototype');
      pv.taNames[pv.taCount] = taNames[k];
      pv.taCount++;
    }
    const dateProto = dataOf(DateCtor, 'prototype');
    pv.dateTime = dataOf(dateProto, 'getTime');
    pv.dateIso = dataOf(dateProto, 'toISOString');
    pv.dateText = dataOf(dateProto, 'toString');
    const reProto = dataOf(RegExpCtor, 'prototype');
    pv.reProto = reProto;
    pv.reFlags = { __proto__: null };
    pv.reFlagCount = 0;
    const flagNames = ['hasIndices', 'd', 'global', 'g', 'ignoreCase', 'i', 'multiline', 'm', 'dotAll', 's', 'unicode', 'u', 'unicodeSets', 'v', 'sticky', 'y'];
    for (let k = 0; k < flagNames.length; k += 2) {
      const get = getterOf(reProto, flagNames[k]);
      if (get !== undefined) {
        if (!nativeFn(get)) throw 0;
        pv.reFlags[pv.reFlagCount] = get;
        pv.reFlags[pv.reFlagCount + 1] = flagNames[k + 1];
        pv.reFlagCount += 2;
      }
    }
    pv.symbolText = dataOf(dataOf(SymbolCtor, 'prototype'), 'toString');
    pv.errorProto = dataOf(ErrorCtor, 'prototype');
    pv.promiseProto = dataOf(promiseCtor, 'prototype');
    pv.objectProto = dataOf(ObjectCtor, 'prototype');
    __previewable = __walkable && nativeFn(MapCtor) && nativeFn(SetCtor) && nativeFn(pv.mapSize) && nativeFn(pv.mapEntries) && nativeFn(pv.mapNext)
      && nativeFn(pv.setSize) && nativeFn(pv.setValues) && nativeFn(pv.setNext) && nativeFn(pv.taLength)
      && nativeFn(pv.dateTime) && nativeFn(pv.dateIso) && nativeFn(pv.dateText) && nativeFn(pv.symbolText)
      && nativeFn(ErrorCtor) && nativeFn(promiseCtor) && nativeFn(ObjectCtor) && nativeFn(DateCtor) && nativeFn(RegExpCtor);
    // DOM nodes (none in a worker or a test realm): their tag, id and class from the engine's own
    // accessors; without them a node shows as an instance.
    const NodeCtor = dataOf(__global, 'Node');
    if (NodeCtor !== undefined) {
      const nodeProto = dataOf(NodeCtor, 'prototype');
      const dom = { __proto__: null, nodeType: getterOf(nodeProto, 'nodeType'), nodeName: getterOf(nodeProto, 'nodeName') };
      if (nativeFn(dom.nodeType) && nativeFn(dom.nodeName)) pv.dom = dom;
    }
  } catch {
    __previewable = false;
  }
  // A brand check by the engine's own accessor: { v } when \`self\` has the slot, else null.
  const brand = (fn, self) => {
    try { return { __proto__: null, v: __apply(fn, self, []) }; } catch { return null; }
  };
  // Text by index (no String.prototype method of the page's is ever called).
  const sub = (text, from, to) => {
    let out = '';
    for (let k = from; k < to && k < text.length; k++) out += text[k];
    return out;
  };
  const cut = (text) => {
    if (text.length <= PREVIEW_STRING) return text;
    let end = PREVIEW_STRING;
    const last = text[end - 1];
    if (last >= '\\ud800' && last <= '\\udbff') end--;
    return sub(text, 0, end);
  };
  const q = (text) => {
    let out = '"';
    for (let k = 0; k < text.length; k++) {
      const c = text[k];
      out += c in ESCAPES ? ESCAPES[c] : c;
    }
    return out + '"';
  };
  const T = (kind) => '{"$xray":"' + kind + '"';
  const ownData = (v, key) => {
    const d = __gopd(v, key);
    return d !== undefined && ownField(d, 'value') ? d.value : undefined;
  };
  const ownString = (v, key) => {
    const value = ownData(v, key);
    return typeof value === 'string' ? value : '';
  };
  const scalar = (v) => {
    if (v === null) return 'null';
    const t = typeof v;
    if (t === 'string') return q(cut(v));
    if (t === 'number') {
      const special = v !== v ? 'NaN' : v === 1 / 0 ? 'Infinity' : v === -1 / 0 ? '-Infinity' : v === 0 && 1 / v < 0 ? '-0' : '';
      return special ? T('number') + ',"value":"' + special + '"}' : '' + v;
    }
    if (t === 'boolean') return v ? 'true' : 'false';
    if (t === 'undefined') return T('undefined') + '}';
    if (t === 'bigint') return T('bigint') + ',"value":"' + v + '"}';
    if (t === 'symbol') {
      // \`Symbol(desc)\` from the engine's own toString: the description is what is inside.
      const d = brand(pv.symbolText, v);
      const text = d && typeof d.v === 'string' ? d.v : 'Symbol()';
      return T('symbol') + ',"description":' + q(cut(sub(text, 7, text.length - 1))) + '}';
    }
    return null;
  };
  const functionModel = (fn) => {
    const name = cut(ownString(fn, 'name'));
    const s = shape(fn);
    if (s.native) return T('function') + ',"name":' + q(name) + ',"kind":"native"}';
    if (s.kind === 'c') return T('function') + ',"name":' + q(name) + ',"kind":"class"}';
    const p = s.params;
    const params = p.length >= 2 && p[0] === '(' && p[p.length - 1] === ')' ? sub(p, 1, p.length - 1) : p;
    return T('function') + ',"name":' + q(name) + ',"kind":"' + (s.arrow ? 'arrow' : 'function') + '"' + (s.async ? ',"async":true' : '') + ',"params":' + q(params) + '}';
  };
  const inChain = (v, proto) => {
    let o = v;
    for (let depth = 0; isRef(o) && depth < 64; depth++) {
      o = __gpo(o);
      if (o === proto) return true;
    }
    return false;
  };
  // What the value is, by the engine's brand checks (never a tag or method the page could define).
  const classify = (v) => {
    if (typeof v === 'function') return 'function';
    if (__isArray(v)) return 'array';
    if (__isView(v) && brand(pv.taLength, v)) return 'typed';
    if (brand(pv.mapSize, v)) return 'map';
    if (brand(pv.setSize, v)) return 'set';
    if (brand(pv.dateTime, v)) return 'date';
    if (pv.bufferBytes && brand(pv.bufferBytes, v)) return 'buffer';
    // By its prototype: a flag getter on anything else is refused under the side-effect check.
    if (__gpo(v) === pv.reProto) return 'regexp';
    if (pv.dom && brand(pv.dom.nodeType, v)) return 'dom';
    const proto = __gpo(v);
    if (proto === null || proto === pv.objectProto) return 'plain';
    if (inChain(v, pv.errorProto)) return 'error';
    if (inChain(v, pv.promiseProto)) return 'promise';
    return 'instance';
  };
  const className = (v) => {
    const ctor = dataValue(v, 'constructor');
    return typeof ctor === 'function' ? cut(ownString(ctor, 'name')) : '';
  };
  const lengthOf = (v) => {
    const n = ownData(v, 'length');
    return typeof n === 'number' && n >= 0 ? n : 0;
  };
  const errorModel = (v) => {
    const name = dataValue(v, 'name');
    const message = dataValue(v, 'message');
    return T('error') + ',"name":' + q(typeof name === 'string' ? cut(name) : 'Error') + ',"message":' + q(typeof message === 'string' ? cut(message) : '') + '}';
  };
  const dateModel = (v) => {
    const time = __apply(pv.dateTime, v, []);
    if (time !== time) return T('date') + '}';
    return T('date') + ',"local":' + q(__apply(pv.dateText, v, [])) + ',"iso":' + q(__apply(pv.dateIso, v, [])) + '}';
  };
  // Its flags only: V8 refuses the \`source\` getter under the side-effect check.
  const regexpModel = (v) => {
    let flags = '';
    for (let k = 0; k < pv.reFlagCount; k += 2) {
      const on = brand(pv.reFlags[k], v);
      if (on && on.v === true) flags += pv.reFlags[k + 1];
    }
    return T('web') + ',"cls":"RegExp","fields":{"source":"…","flags":' + q(flags) + '}}';
  };
  const typedName = (v) => {
    const proto = __gpo(v);
    for (let k = 0; k < pv.taCount; k++) if (pv.taProtos[k] === proto) return pv.taNames[k];
    return className(v) || 'TypedArray';
  };
  const LOWER = { __proto__: null, A: 'a', B: 'b', C: 'c', D: 'd', E: 'e', F: 'f', G: 'g', H: 'h', I: 'i', J: 'j', K: 'k', L: 'l', M: 'm', N: 'n', O: 'o', P: 'p', Q: 'q', R: 'r', S: 's', T: 't', U: 'u', V: 'v', W: 'w', X: 'x', Y: 'y', Z: 'z' };
  // A node by its nodeName: an element's tag (\`<div>\`), else \`#text\`, \`#document\` … (V8 refuses
  // localName, id and getAttribute under the side-effect check).
  const domModel = (v) => {
    const type = __apply(pv.dom.nodeType, v, []);
    const name = __apply(pv.dom.nodeName, v, []);
    const text = typeof name === 'string' ? cut(name) : '';
    if (type !== 1) return T('dom') + ',"text":' + q(text) + '}';
    let tag = '';
    for (let k = 0; k < text.length; k++) tag += text[k] in LOWER ? LOWER[text[k]] : text[k];
    return T('dom') + ',"tag":' + q(tag) + ',"classes":[]}';
  };
  const bufferModel = (v) => T('typedarray') + ',"type":"ArrayBuffer","length":' + __apply(pv.bufferBytes, v, []) + '}';
  const accessorModel = T('accessor') + '}';
  // A value inside a container: short.
  const short = (v) => {
    const s = scalar(v);
    if (s !== null) return s;
    try {
      switch (classify(v)) {
        case 'function': return functionModel(v);
        case 'array': return T('depth') + ',"type":"array","length":' + lengthOf(v) + '}';
        case 'typed': return T('typedarray') + ',"type":' + q(typedName(v)) + ',"length":' + __apply(pv.taLength, v, []) + '}';
        case 'buffer': return bufferModel(v);
        case 'map': return T('map') + ',"size":' + __apply(pv.mapSize, v, []) + '}';
        case 'set': return T('set') + ',"size":' + __apply(pv.setSize, v, []) + '}';
        case 'date': return dateModel(v);
        case 'regexp': return regexpModel(v);
        case 'dom': return domModel(v);
        case 'error': return errorModel(v);
        case 'promise': return T('promise') + '}';
        case 'plain': return T('depth') + '}';
        default: return T('depth') + ',"class":' + q(className(v)) + '}';
      }
    } catch {
      return T('unreadable') + '}';
    }
  };
  const item = (d) => (d === undefined ? T('undefined') + '}' : ownField(d, 'value') ? short(d.value) : accessorModel);
  // Own enumerable string-keyed members: the first PREVIEW_ITEMS data members as [key, value],
  // accessors by name in \`getters\` (never read), and how many there are.
  const members = (v) => {
    const names = __gopn(v);
    const n = names.length;
    let entries = '';
    let getters = '';
    let shown = 0;
    let gettersShown = 0;
    let total = 0;
    let scanned = 0;
    let capped = false;
    for (let k = 0; k < n; k++) {
      if (scanned >= PREVIEW_SCAN) { capped = true; break; }
      scanned++;
      const name = names[k];
      if (typeof name !== 'string') continue;
      const d = __gopd(v, name);
      if (d === undefined || !(ownField(d, 'enumerable') && d.enumerable === true)) continue;
      total++;
      const accessor = !ownField(d, 'value');
      if (accessor) {
        if (gettersShown < PREVIEW_ITEMS) { getters += (gettersShown ? ',' : '') + q(cut(name)); gettersShown++; }
        continue;
      }
      if (shown < PREVIEW_ITEMS) {
        entries += (shown ? ',' : '') + '[' + q(cut(name)) + ',' + short(d.value) + ']';
        shown++;
      }
    }
    return { __proto__: null, entries, getters, gettersShown, omitted: total - shown - gettersShown + (capped ? 1 : 0) };
  };
  // An instance's class accessors (its prototypes up to Object.prototype, skipping built-in ones),
  // by name only: never read.
  const classGetters = (v, own) => {
    let out = own.getters;
    let count = own.gettersShown;
    let more = 0;
    const seen = { __proto__: null };
    let o = __gpo(v);
    for (let depth = 0; isRef(o) && o !== pv.objectProto && depth < 8; depth++) {
      const ctor = ownData(o, 'constructor');
      if (!(typeof ctor === 'function' && shape(ctor).native)) {
        const names = __gopn(o);
        const n = names.length < PREVIEW_SCAN ? names.length : PREVIEW_SCAN;
        for (let k = 0; k < n; k++) {
          const name = names[k];
          if (typeof name !== 'string' || name === '__proto__' || name in seen) continue;
          seen[name] = 1;
          const d = __gopd(o, name);
          if (d === undefined || ownField(d, 'value')) continue;
          // Shadowed by an own property of the value: listed there, not here.
          if (__gopd(v, name) !== undefined) continue;
          if (count < PREVIEW_ITEMS) { out += (count ? ',' : '') + q(cut(name)); count++; } else more++;
        }
      }
      o = __gpo(o);
    }
    return { __proto__: null, text: out, more };
  };
  const top = (v) => {
    const s = scalar(v);
    if (s !== null) return s;
    // The global object: listing its own names would materialise lazy built-ins (\`Temporal\`),
    // which V8 counts as a side effect.
    if (v === __global) return T('instance') + ',"cls":"Window","entries":[],"omitted":1}';
    switch (classify(v)) {
      case 'function': return functionModel(v);
      case 'array': {
        const length = lengthOf(v);
        let items = '';
        for (let k = 0; k < length && k < PREVIEW_ITEMS; k++) items += (k ? ',' : '') + item(__gopd(v, k));
        return T('array') + ',"length":' + length + ',"items":[' + items + ']}';
      }
      case 'buffer': return bufferModel(v);
      case 'typed': {
        const length = __apply(pv.taLength, v, []);
        let values = '';
        for (let k = 0; k < length && k < PREVIEW_ITEMS; k++) values += (k ? ',' : '') + item(__gopd(v, k));
        return T('typedarray') + ',"type":' + q(typedName(v)) + ',"length":' + length + ',"values":[' + values + ']}';
      }
      case 'map': {
        const size = __apply(pv.mapSize, v, []);
        const it = __apply(pv.mapEntries, v, []);
        let entries = '';
        for (let k = 0; k < PREVIEW_ITEMS; k++) {
          const step = __apply(pv.mapNext, it, []);
          if (ownData(step, 'done') !== false) break;
          const pair = ownData(step, 'value');
          entries += (k ? ',' : '') + '[' + item(__gopd(pair, 0)) + ',' + item(__gopd(pair, 1)) + ']';
        }
        return T('map') + ',"size":' + size + ',"entries":[' + entries + ']}';
      }
      case 'set': {
        const size = __apply(pv.setSize, v, []);
        const it = __apply(pv.setValues, v, []);
        let values = '';
        for (let k = 0; k < PREVIEW_ITEMS; k++) {
          const step = __apply(pv.setNext, it, []);
          if (ownData(step, 'done') !== false) break;
          values += (k ? ',' : '') + item(__gopd(step, 'value'));
        }
        return T('set') + ',"size":' + size + ',"values":[' + values + ']}';
      }
      case 'date': return dateModel(v);
      case 'regexp': return regexpModel(v);
      case 'dom': return domModel(v);
      case 'error': return errorModel(v);
      case 'promise': return T('instance') + ',"cls":"Promise","entries":[],"omitted":1}';
      case 'plain': {
        // Own accessors go after the data members, by name, as the Run's encoder lists them.
        const own = members(v);
        if (own.gettersShown) return T('instance') + ',"cls":"","entries":[' + own.entries + '],"getters":[' + own.getters + '],"omitted":' + own.omitted + '}';
        return T('object') + ',"entries":[' + own.entries + '],"omitted":' + own.omitted + '}';
      }
      default: {
        const own = members(v);
        const getters = classGetters(v, own);
        return T('instance') + ',"cls":' + q(className(v)) + ',"entries":[' + own.entries + '],"getters":[' + getters.text + '],"omitted":' + (own.omitted + getters.more) + '}';
      }
    }
  };
  // 'V' + the value's model, 'E' + what was thrown, 'X' when the preview is off on this page (a
  // native replaced before the scope existed) or the value could not be read.
  const preview = (v) => {
    if (!__previewable) return 'X';
    try { return 'V' + top(v); } catch { return 'X'; }
  };
  const thrown = (e) => {
    if (!__previewable) return 'X';
    try { return 'E' + (isRef(e) && typeof e !== 'function' && inChain(e, pv.errorProto) ? errorModel(e) : top(e)); } catch { return 'X'; }
  };

  // Declared names: name -> { get, set, kind }, closures over the declaring command's bindings.
  const cells = { __proto__: null };
  // This run's context values: name -> value.
  let context = { __proto__: null };
  // The latest run (runs are serialized per tab by the worker).
  let current = null;

  // A prototype-less copy of an object's own enumerable keys (spread: no built-in is called).
  const own = (value) => (value !== null && typeof value === 'object' ? { __proto__: null, ...value } : { __proto__: null });

  // The context as encodeContext sent it, rebuilt in key order with syntax only: an object's
  // keys go into a prototype-less target (no setter anywhere on the way; "__proto__" stays a
  // key), then spread into a plain object; arrays are filled in place (their indices exist).
  const decode = (node, depth) => {
    if (node === null || typeof node !== 'object') return node;
    if (depth > 400) return null;
    const list = node.v;
    if (node.t === 'a') {
      for (let i = 0; i < list.length; i++) list[i] = decode(list[i], depth + 1);
      return list;
    }
    const target = { __proto__: null };
    for (let i = 0; i + 1 < list.length; i += 2) target[list[i]] = decode(list[i + 1], depth + 1);
    return { ...target };
  };

  // The context values the command uses, from the members the worker sent.
  const refresh = (input, needed) => {
    const next = { __proto__: null };
    context = next;
    if (!needed || !needed.length || input === null || typeof input !== 'object') return;
    const root = own(decode(input, 0));
    // Prototype-less containers: a page's Object.prototype never answers a missing key.
    const sent = { __proto__: null, currentEntry: root.currentEntry, entries: root.entries, values: own(root.values), scope: own(root.scope), pins: own(root.pins) };
    const revived = __helpers.reviveContext(sent);
    const runtime = own(__helpers.createRuntime(revived, (text) => {
      try { navigator.clipboard?.writeText?.(text); } catch {}
    }));
    for (let i = 0; i < needed.length; i++) {
      const name = needed[i];
      // Saved variables (temp1…, $_) win over runtime names, as Object.assign did.
      if (name in sent.scope) next[name] = sent.scope[name];
      else if (name in runtime) next[name] = runtime[name];
    }
  };

  // What the command threw: its message and stack when it has them as data (a Proxy whose
  // getters throw has neither), and the thrown value itself as typed JSON text, so the cell
  // reads \`Uncaught Error: x\`, \`Uncaught 5\` or \`Uncaught {a: 1}\` (spec §1).
  const thrownRecord = (err) => {
    let text = null;
    try { text = __helpers.thrownText(err); } catch { text = null; }
    const message = text ? text.message : '';
    const stack = text ? text.stack : '';
    let value;
    try { value = __helpers.encodeEnd(__helpers.encodeBegin(err)).result; } catch {}
    const error = { __proto__: null, message, stack, thrown: true };
    if (typeof value === 'string') error.value = value;
    // Neither a message nor an encoding: the cell says the value could not be read.
    else if (!message) error.unreadable = true;
    return { __proto__: null, type: 'error', error };
  };
  // Typed JSON text (shared/console-helpers.js): the record carries a string, so no
  // browser-side dictionary sorts its keys or drops what JSON cannot hold. A value the encoder
  // cannot read is XRAY's failure, never the page's exception.
  const encodedRecord = (job) => {
    try {
      const out = __helpers.encodeEnd(job);
      const record = { __proto__: null, type: out.type, result: out.result, truncated: out.truncated === true };
      if (out.render === 'table') record.render = 'table';
      return record;
    } catch (err) {
      let detail = '';
      try { detail = \`\${err?.message || err}\`; } catch {}
      return { __proto__: null, type: 'error', error: { __proto__: null, message: "XRAY couldn't display this value: " + detail, stack: '', internal: true } };
    }
  };
  const declaredKinds = () => {
    const out = { __proto__: null };
    for (const name in cells) out[name] = cells[name].kind;
    return out;
  };

  const begin = (input, needed) => {
    refresh(input, needed);
    const run = { __proto__: null, state: 'running', boxed: false, value: undefined, failed: false, error: undefined, record: null, promiseState: null };
    current = run;
    return {
      __proto__: null,
      box: (value) => {
        run.boxed = true;
        run.value = value;
      },
      fail: (err) => {
        run.failed = true;
        run.error = err;
      },
      ran: () => {
        if (run.state === 'running') run.state = 'ran';
      },
    };
  };

  // The latest run's value for the worker to classify (only an object can be a promise).
  const value = () => {
    const run = current;
    if (!run || run.failed || !run.boxed) return undefined;
    const v = run.value;
    return v !== null && (typeof v === 'object' || typeof v === 'function') ? v : undefined;
  };

  // Encodes the latest run's answer: its value, the value its native promise settled with
  // (CDP awaited it, never the page's \`then\`), the reason it was rejected, or the still-pending
  // promise itself. Nested promises are flushed with \`await undefined\` only.
  const finish = async (mode, settled) => {
    const run = current;
    if (!run || run.state !== 'ran') return;
    run.state = 'encoding';
    if (mode === 'fulfilled' || mode === 'rejected' || mode === 'pending') run.promiseState = mode;
    if (run.failed) run.record = thrownRecord(run.error);
    else if (mode === 'rejected') run.record = thrownRecord(settled);
    else {
      let job = null;
      try {
        job = __helpers.encodeBegin(mode === 'fulfilled' ? settled : run.value);
      } catch (err) {
        let detail = '';
        try { detail = \`\${err?.message || err}\`; } catch {}
        run.record = { __proto__: null, type: 'error', error: { __proto__: null, message: "XRAY couldn't display this value: " + detail, stack: '', internal: true } };
      }
      if (job !== null) {
        for (; __helpers.encodePending(job); __helpers.encodeRound(job)) {
          for (let tick = 0; tick < __helpers.ENCODE_TICKS; tick++) await undefined;
        }
        run.record = encodedRecord(job);
      }
    }
    run.state = 'done';
  };

  // The latest run's state and answer, synchronously, as a prototype-less record read by value.
  const take = () => {
    const run = current;
    const out = { __proto__: null, state: run ? run.state : 'none', declared: declaredKinds() };
    if (run && run.state === 'done') {
      out.answer = run.record;
      if (run.promiseState) out.promise = run.promiseState;
    }
    return out;
  };

  const api = {
    __proto__: null,
    // The real global: this script's own \`this\`, never a page-replaceable \`globalThis\`.
    global: __global,
    begin,
    value,
    finish,
    take,
    // A declared name (live, through its declaring command's closure), else this run's context.
    get: (name) => (name in cells ? cells[name].get() : name in context ? context[name] : undefined),
    set: (name, value) => {
      if (name in cells && cells[name].set) cells[name].set(value);
    },
    // A name the user declared: it shadows the context from now on (REPL semantics).
    define: (name, get, set, kind) => {
      cells[name] = { __proto__: null, get, set, kind };
    },
    // Live completion: descriptor reads only (see walk above).
    walk,
    // Eager preview (Task 8): the projector. A preview never sets the context (fix round 1): it
    // reads only what the user's last Run revived (\`get\`).
    preview,
    thrown,
    // A run or walk that begins after its deadline (round 3).
    late,
  };
  return {
    __proto__: null,
    open: (key) => {
      if (key !== __key) throw 'XRAY console scope: wrong key';
      return api;
    },
  };
})()`;
  }

  // ── live completion (spec §3 source 4, Task 7; fix round 1) ───────────────────────────────

  // A plain path: an identifier, then `.name`, `?.name`, `[0]` or a quoted key — no call, no
  // operator, no template. Nothing else ever reaches the page as a completion (ruling: a call
  // can have side effects, so call results chain through the catalogue's return types).
  const LIVE_PATH = /^([\p{ID_Start}$_][\p{ID_Continue}$‌‍]*)((?:\??\.[\p{ID_Start}$_][\p{ID_Continue}$‌‍]*|\[(?:0|[1-9]\d{0,8})\]|\["(?:[^"\\\n]|\\.)*"\]|\['(?:[^'\\\n]|\\.)*'\])*)$/u;
  const LIVE_SEGMENT = /\??\.([\p{ID_Start}$_][\p{ID_Continue}$‌‍]*)|\[(0|[1-9]\d{0,8})\]|\["((?:[^"\\\n]|\\.)*)"\]|\['((?:[^'\\\n]|\\.)*)'\]/uy;
  const LIVE_PATH_MAX = 300;

  // A quoted key's text (the escapes a JS string literal allows; an unknown escape is the character).
  function unquote(body) {
    let out = '';
    for (let i = 0; i < body.length; i++) {
      const ch = body[i];
      if (ch !== '\\') { out += ch; continue; }
      const next = body[++i];
      if (next === 'n') out += '\n';
      else if (next === 't') out += '\t';
      else if (next === 'r') out += '\r';
      else if (next === 'u' && /^[0-9a-f]{4}$/i.test(body.slice(i + 1, i + 5))) { out += String.fromCharCode(parseInt(body.slice(i + 1, i + 5), 16)); i += 4; }
      else if (next !== undefined) out += next;
    }
    return out;
  }

  /** A plain path as { root, segments } (strings, or numbers for `[n]`), or null. */
  function livePath(expr) {
    if (typeof expr !== 'string' || expr.length > LIVE_PATH_MAX) return null;
    const match = LIVE_PATH.exec(expr);
    if (!match || !bindable(match[1])) return null;
    const segments = [];
    const rest = match[2];
    LIVE_SEGMENT.lastIndex = 0;
    while (LIVE_SEGMENT.lastIndex < rest.length) {
      const m = LIVE_SEGMENT.exec(rest);
      if (!m) return null;
      if (m[1] !== undefined) segments.push(m[1]);
      else if (m[2] !== undefined) segments.push(Number(m[2]));
      else segments.push(unquote(m[3] !== undefined ? m[3] : m[4]));
    }
    return { root: match[1], segments };
  }

  /**
   * The completion call for Runtime.callFunctionOn(scope, …, returnByValue: true): its
   * `functionDeclaration` and its second argument, the path as data — `[root, declared (1|0),
   * ...segments]`, or null for the page globals. The function is STRICT, takes no context and
   * hands the walk to the scope (`walk`, buildScopeExpression): descriptor reads only, with
   * natives taken when the scope was created; data properties only — an accessor ends the walk,
   * so no page getter runs; the answer is one string built by XRAY's own code (no remote object
   * of a page or declared value is ever created). A root that is not declared and not a property
   * on the global object's chain is read as an identifier (a top-level let/const/class binding:
   * no page code runs to read one). Refused (null): not a plain path, or a context name (res,
   * pins, helpers — the panel answers those from captured data) the user has not declared.
   */
  function planComplete(expr, known = {}, suffix = 'x') {
    const tag = /^[a-z0-9]+$/i.test(String(suffix)) ? String(suffix) : 'x';
    const key = `__x${tag}_key`;
    const pathArg = `__x${tag}_path`;
    const deadlineArg = `__x${tag}_deadline`;
    const head = `function (${key}, ${pathArg}, ${deadlineArg}) {\n  'use strict';\n  try {\n`;
    const tail = `  } catch {\n    return null;\n  }\n}`;
    if (expr === null) return { text: `${head}    return this.open(${key}).walk(null, null, ${deadlineArg});\n${tail}`, path: null };
    const path = livePath(expr);
    if (!path) return null;
    const declared = !!(known && known.declared && typeof known.declared === 'object' && Object.prototype.hasOwnProperty.call(known.declared, path.root));
    if (!declared && Array.isArray(known && known.context) && known.context.includes(path.root)) return null;
    const lexical = !declared && Array.isArray(known && known.lexical) && known.lexical.includes(path.root);
    const read = declared ? 'null' : `() => ${path.root}`;
    return { text: `${head}    return this.open(${key}).walk(${pathArg}, ${read}, ${deadlineArg});\n${tail}`, path: [path.root, declared ? 1 : lexical ? 2 : 0, ...path.segments] };
  }

  const LIVE_CAP = 500;
  // The globals list's hard bound (the page sets \`capped\` past it).
  const LIVE_GLOBALS_MAX = 5000;
  const LIVE_KINDS = { f: 'function', p: 'property', g: 'getter', c: 'class' };

  /**
   * Worker side: the walk's answer string as { names: [{ name, kind, own, params?, native? }],
   * type?, capped } — or null when it is no answer (refused, not native-checked, malformed).
   * Format (built in the page with string concatenation only): `L` then `1|0` (capped), then
   * entries `<kind><own><native><nameLength>:<name><paramsLength>:<params>`; or `T<type>`
   * for a primitive (or an accessor/missing segment: `T`); `X` refused.
   */
  function decodeLive(text) {
    if (typeof text !== 'string' || !text.length) return null;
    if (text === 'G') return { names: [], capped: false, getter: true };
    if (text[0] === 'T') return text.length > 1 ? { names: [], type: text.slice(1), capped: false } : { names: [], capped: false };
    if (text[0] !== 'L') return null;
    const names = [];
    let i = 2;
    const field = () => {
      const colon = text.indexOf(':', i);
      if (colon < 0) throw new Error('bad');
      const length = Number(text.slice(i, colon));
      if (!Number.isInteger(length) || length < 0) throw new Error('bad');
      const value = text.slice(colon + 1, colon + 1 + length);
      i = colon + 1 + length;
      return value;
    };
    try {
      while (i < text.length && names.length < LIVE_GLOBALS_MAX) {
        const kind = LIVE_KINDS[text[i]];
        const own = text[i + 1] === '1';
        const native = text[i + 2] === '1';
        if (!kind) return null;
        i += 3;
        const name = field();
        const params = field();
        const entry = { name, kind, own };
        if (params) entry.params = params;
        if (native) entry.native = true;
        names.push(entry);
      }
    } catch {
      return null;
    }
    return { names, capped: text[1] === '1' };
  }

  // ── eager preview (spec §4, Task 8) ─────────────────────────────────────────────────────────

  const PREVIEW_MAX = 2000;
  const PREVIEW_STATEMENT = new Set(['const', 'let', 'var', 'function', 'class', 'if', 'for', 'while', 'do', 'switch', 'try', 'throw', 'return', 'break', 'continue', 'debugger', 'import', 'export', 'with']);
  // Words that end no value (an operand must follow) and words that start none (they join two).
  const NOT_VALUE_END = new Set(['typeof', 'void', 'delete', 'new', 'await', 'yield', 'async', 'in', 'of', 'instanceof', 'return', 'throw', 'case', 'else', 'do', 'extends', 'const', 'let', 'var', 'function', 'class', 'if', 'for', 'while', 'switch', 'try', 'catch', 'finally', 'export', 'import', 'default']);
  const NOT_VALUE_START = new Set(['in', 'of', 'instanceof']);

  // A numeric literal JavaScript accepts (`1.2.3`, `1.toString`, legacy octal `017` are not).
  const NUMBER = /^(?:0[xX][\da-fA-F](?:_?[\da-fA-F])*n?|0[oO][0-7](?:_?[0-7])*n?|0[bB][01](?:_?[01])*n?|(?:0|[1-9](?:_?\d)*)n|(?:(?:0|[1-9](?:_?\d)*)(?:\.(?:\d(?:_?\d)*)?)?|\.\d(?:_?\d)*)(?:[eE][+-]?\d(?:_?\d)*)?)$/;

  // The `${…}` substitutions of the template at `i` (each checked as a draft of its own).
  function templateSubs(code, i) {
    const subs = [];
    let j = i + 1;
    while (j < code.length) {
      const ch = code[j];
      if (ch === '\\') { j += 2; continue; }
      if (ch === '`') return subs;
      if (ch === '$' && code[j + 1] === '{') {
        const end = skipTemplateCode(code, j + 2);
        subs.push(code.slice(j + 2, end - 1));
        j = end;
        continue;
      }
      j++;
    }
    return subs;
  }

  // Whether the regex literal at `i` compiles (an invalid one's SyntaxError quotes its source).
  function regexValid(code, i) {
    const end = skipRegex(code, i);
    let close = end;
    while (close > i && code[close - 1] !== '/') close--;
    if (close <= i + 1) return false;
    try {
      new RegExp(code.slice(i + 1, close - 1), code.slice(close, end));
      return true;
    } catch {
      return false;
    }
  }

  function regexClosed(code, i) {
    let inClass = false;
    for (let j = i + 1; j < code.length; j++) {
      const ch = code[j];
      if (ch === '\\') { j++; continue; }
      if (ch === '\n') return false;
      if (inClass) { if (ch === ']') inClass = false; continue; }
      if (ch === '[') { inClass = true; continue; }
      if (ch === '/') return true;
    }
    return false;
  }

  /**
   * Whether a draft may be previewed (the worker's own check; the panel's is consoleEager.ts
   * previewEligible): one complete expression of at most 2,000 characters — no `await`, no loop, no
   * statement or declaration at its start, no `{` at its start, no `;`, assignment, `++`, `--` or
   * `delete` at depth 0, every literal and bracket closed, no two values side by side, not ending on
   * an operator. What would not compile is never sent: CDP describes a SyntaxError through the
   * page's own Error.prepareStackTrace, and its message can quote a token of the draft.
   */
  function previewable(code) {
    const src = String(code || '').trim();
    if (!src || String(code || '').length > PREVIEW_MAX) return false;
    const toks = tokenize(src);
    if (toks.unterminated || !toks.length) return false;
    const valueEnd = (tok) => {
      if (!tok) return false;
      if (tok.t === 'punct') return tok.v === ')' || tok.v === ']' || tok.v === '}';
      if (tok.t === 'name') return tok.dot || !NOT_VALUE_END.has(tok.v);
      return true;
    };
    const valueStart = (tok) => (tok.t === 'name' ? tok.dot || !NOT_VALUE_START.has(tok.v) : tok.t === 'num' || tok.t === 'str' || tok.t === 're');
    const first = toks[0];
    if (first.t === 'punct' && first.v === '{') return false;
    if (first.t === 'name' && PREVIEW_STATEMENT.has(first.v)) return false;
    if (first.t === 'name' && first.v === 'async' && toks[1] && toks[1].t === 'name' && toks[1].v === 'function') return false;
    let depth = 0;
    // Per open bracket: its kind and the `?` still waiting for their `:` (a `:` with none waiting
    // belongs to an object literal, so only inside `{`).
    const frames = [{ open: '', q: 0 }];
    for (let k = 0; k < toks.length; k++) {
      const tok = toks[k];
      tok.dot = tok.t === 'name' && memberAccess(toks[k - 1]);
      if (tok.t === 'str') {
        const end = skipString(src, tok.at);
        if (end - 1 <= tok.at || src[end - 1] !== src[tok.at]) return false;
      } else if (tok.t === 'tmpl') {
        const end = skipTemplate(src, tok.at);
        if (end - 1 <= tok.at || src[end - 1] !== '`') return false;
        // Fix round 1: each substitution is checked as a draft of its own (loops, compile checks).
        if (!templateSubs(src, tok.at).every((sub) => previewable(sub))) return false;
      } else if (tok.t === 're' && (!regexClosed(src, tok.at) || !regexValid(src, tok.at))) return false;
      else if (tok.t === 'num' && !NUMBER.test(tok.v)) return false;
      // A loop inside a function body could spin, and the typing path never terminates; \`super\`,
      // \`import\` and \`new.target\` never compile here.
      if (tok.t === 'name' && !tok.dot && (tok.v === 'await' || tok.v === 'yield' || tok.v === 'for' || tok.v === 'while' || tok.v === 'do' || tok.v === 'super' || tok.v === 'import')) return false;
      if (tok.t === 'name' && !tok.dot && tok.v === 'new' && toks[k + 1] && toks[k + 1].t === 'punct' && toks[k + 1].v === '.') return false;
      if (k > 0 && valueEnd(toks[k - 1]) && valueStart(tok)) return false;
      if (tok.t === 'punct') {
        const frame = frames[frames.length - 1];
        // A ternary `?`: not `?.`, not part of `??` / `??=`.
        const ternary = tok.v === '?' && !(toks[k + 1] && toks[k + 1].v === '?' && adjacent(tok, toks[k + 1])) && !(toks[k - 1] && toks[k - 1].v === '?' && adjacent(toks[k - 1], tok));
        if (ternary) frame.q++;
        else if (tok.v === ':') {
          if (frame.q > 0) frame.q--;
          else if (frame.open !== '{') return false;
        }
        if (OPEN.has(tok.v)) {
          depth++;
          frames.push({ open: tok.v, q: 0 });
        } else if (CLOSE.has(tok.v)) {
          depth--;
          if (depth < 0 || frame.q !== 0) return false;
          frames.pop();
        } else if (depth === 0) {
          if (tok.v === ';') return false;
          // An operator's first character: `=`, `+=`, `>>>=`, `??=` … or `++`/`--` write.
          const prev = toks[k - 1];
          const starts = !(prev && prev.t === 'punct' && adjacent(prev, tok) && !CLOSE.has(prev.v));
          if (starts && assignsAt(toks, k)) return false;
          const next = toks[k + 1];
          if ((tok.v === '+' || tok.v === '-') && next && next.t === 'punct' && next.v === tok.v && adjacent(tok, next)) return false;
        }
      } else if (depth === 0 && tok.t === 'name' && !tok.dot && tok.v === 'delete') return false;
    }
    const last = toks[toks.length - 1];
    return depth === 0 && frames[0].q === 0 && valueEnd(last);
  }

  /**
   * The preview call for Runtime.callFunctionOn(scope, …, throwOnSideEffect: true, returnByValue:
   * true), or null when the draft may not be previewed: `{ text, needed }` — `needed` are the
   * context names the draft uses. The typing path never sends or refreshes the context (fix round 1,
   * ruling option C): those names read what the user's last explicit Run revived in the scope, and
   * the worker previews such a draft only when that Run's members are the current ones. The function
   * is STRICT, binds the scope names the draft names as locals (the run
   * builder's rule; nothing is written back), evaluates the draft in a strict inner function (its
   * `this` is undefined) and hands the value — or what it threw, caught here — to the scope's own
   * projector, whose answer is one string: CDP never describes a page or declared value.
   */
  function planPreview(code, known = {}, suffix = 'x') {
    const trimmed = String(code || '').trim();
    if (!previewable(code)) return null;
    const tag = /^[a-z0-9]+$/i.test(String(suffix)) ? String(suffix) : 'x';
    const id = (name) => `__x${tag}_${name}`;
    const K = { key: id('key'), deadline: id('deadline'), api: id('api'), value: id('value'), error: id('error') };
    const declared = known && known.declared && typeof known.declared === 'object' ? known.declared : {};
    const declaredKind = (name) => (Object.prototype.hasOwnProperty.call(declared, name) ? declared[name] : null);
    const scopeNames = new Set([...(Array.isArray(known && known.context) ? known.context : []), ...Object.keys(declared)].filter(bindable));
    const bound = [...referencedNames(trimmed)].filter((name) => scopeNames.has(name));
    const needed = bound.filter((name) => !declaredKind(name));
    const bindings = bound.map((name) => {
      const kind = declaredKind(name);
      return `\n  ${!kind || kind === 'const' ? 'const' : 'let'} ${name} = ${K.api}.get(${JSON.stringify(name)});`;
    }).join('');
    const text = `function (${K.key}, ${K.deadline}) {
  'use strict';
  const ${K.api} = this.open(${K.key});
  if (${K.api}.late(${K.deadline})) return 'S';${bindings}
  let ${K.value};
  try {
    ${K.value} = (function () {
      'use strict';
      return (
${trimmed}
      );
    })();
  } catch (${K.error}) {
    return ${K.api}.thrown(${K.error});
  }
  return ${K.api}.preview(${K.value});
}`;
    return { text, needed };
  }


  /** Worker side: a preview answer as { value } or { thrown } (typed-model text), or null (nothing to show). */
  function decodePreview(text) {
    if (typeof text !== 'string' || text.length < 2) return null;
    if (text[0] === 'V') return { value: text.slice(1) };
    if (text[0] === 'E') return { thrown: text.slice(1) };
    return null;
  }

  const api = {
    CONTEXT_MEMBERS: { valueOf: VALUE_OF, current: [...NEEDS_CURRENT], entries: [...NEEDS_ENTRIES] },
    BODY_MARKER,
    SKIPPED,
    planComplete,
    planPreview,
    previewable,
    decodePreview,
    livePath,
    decodeLive,
    LIVE_CAP,
    LIVE_GLOBALS_MAX,
    declarations,
    declaredNames,
    referencedNames,
    assignedNames,
    statementAssignments,
    contextNames,
    contextFor,
    encodeContext,
    TAKE_FUNCTION,
    INSPECT_FUNCTION,
    FINISH_FUNCTION,
    bindable,
    isExpression,
    userSource,
    planRun,
    buildScopeExpression,
  };
  (typeof self !== 'undefined' ? self : globalThis).XRAY_ConsoleScope = api;
})();
