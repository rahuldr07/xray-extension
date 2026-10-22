import { isCompleteCommand } from './consoleAssist';
import { previewLine } from './consolePreview';

/*
 * Eager preview (console round 2, spec §4, Task 8): which drafts the Console may evaluate in the
 * page while the user types, and how the page's answer becomes the grey line under the prompt.
 * Pure: the editor supplies the sender and the clock.
 *
 * The page never hands XRAY a value: XRAY's own projector in the scope (shared/console-scope.js
 * `preview`) builds typed-model text — the model a Run's result uses (models/logValue.ts) — with
 * descriptor reads only, and it is read by value. previewLine turns it into the same one line a
 * collapsed result shows.
 *
 * Eligibility is deliberately strict. A draft the page cannot compile reaches CDP as a SyntaxError,
 * and CDP describes it by running the page's own Error.prepareStackTrace — whose message can quote a
 * token of the draft — so only a single complete expression that also passes a cheap structural
 * check is ever sent (the worker checks again: console-scope.js `previewable`).
 */

/** The pause after the last edit before the page is asked (spec §4). */
export const EAGER_DEBOUNCE_MS = 150;
/** The longest draft previewed. */
export const PREVIEW_DRAFT_MAX = 2000;

type Tok = { t: 'name' | 'num' | 'str' | 'tmpl' | 're' | 'punct'; v: string; dot: boolean };

// Statements and declarations: never previewed.
const STATEMENT = new Set(['const', 'let', 'var', 'function', 'class', 'if', 'for', 'while', 'do', 'switch', 'try', 'throw', 'return', 'break', 'continue', 'debugger', 'import', 'export', 'with']);
// Words that end no value (an operand must follow), and words that start none (they join two).
const NOT_VALUE_END = new Set(['typeof', 'void', 'delete', 'new', 'await', 'yield', 'async', 'in', 'of', 'instanceof', 'return', 'throw', 'case', 'else', 'do', 'extends', 'const', 'let', 'var', 'function', 'class', 'if', 'for', 'while', 'switch', 'try', 'catch', 'finally', 'export', 'import', 'default']);
const NOT_VALUE_START = new Set(['in', 'of', 'instanceof']);
// A loop inside a function body could spin, and the typing path never terminates: not previewed.
const LOOPS = new Set(['for', 'while', 'do']);
// Operators that write: never at depth 0.
const WRITES = new Set(['=', '+=', '-=', '*=', '/=', '%=', '**=', '<<=', '>>=', '>>>=', '&=', '|=', '^=', '&&=', '||=', '??=', '++', '--']);
const PUNCTS = ['>>>=', '...', '===', '!==', '**=', '<<=', '>>=', '>>>', '&&=', '||=', '??=', '=>', '==', '!=', '<=', '>=', '&&', '||', '??', '?.', '++', '--', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '**', '<<', '>>'];
const ID_START = /[\p{ID_Start}$_]/u;
const ID_PART = /[\p{ID_Continue}$‌‍]/u;

function valueEnd(tok: Tok | undefined): boolean {
  if (!tok) return false;
  if (tok.t === 'punct') return tok.v === ')' || tok.v === ']' || tok.v === '}';
  if (tok.t === 'name') return tok.dot || !NOT_VALUE_END.has(tok.v);
  return true;
}

function valueStart(tok: Tok): boolean {
  if (tok.t === 'name') return tok.dot || !NOT_VALUE_START.has(tok.v);
  return tok.t === 'num' || tok.t === 'str' || tok.t === 're';
}

// A numeric literal JavaScript accepts (`1.2.3`, `1.toString`, legacy octal `017` are not).
const NUMBER = /^(?:0[xX][\da-fA-F](?:_?[\da-fA-F])*n?|0[oO][0-7](?:_?[0-7])*n?|0[bB][01](?:_?[01])*n?|(?:0|[1-9](?:_?\d)*)n|(?:(?:0|[1-9](?:_?\d)*)(?:\.(?:\d(?:_?\d)*)?)?|\.\d(?:_?\d)*)(?:[eE][+-]?\d(?:_?\d)*)?)$/;
// Words a script-level expression can never use here: `super.x`, `import(…)` / `import.meta`.
const FORBIDDEN = new Set(['super', 'import']);

// The template starting at `i`: its end and the source of each `${…}` substitution (checked like a
// draft of its own: fix round 1), or null when it is not closed.
function template(src: string, i: number): { end: number; subs: string[] } | null {
  const subs: string[] = [];
  let j = i + 1;
  while (j < src.length) {
    const c = src[j];
    if (c === '\\') { j += 2; continue; }
    if (c === '`') return { end: j + 1, subs };
    if (c === '$' && src[j + 1] === '{') {
      let depth = 0;
      const start = j + 2;
      j = start;
      let closed = false;
      while (j < src.length) {
        const d = src[j];
        if (d === '"' || d === "'") {
          let k = j + 1;
          while (k < src.length && src[k] !== d) k += src[k] === '\\' ? 2 : 1;
          j = k + 1;
          continue;
        }
        if (d === '`') {
          const inner = template(src, j);
          if (!inner) return null;
          j = inner.end;
          continue;
        }
        if (d === '{') depth++;
        else if (d === '}') {
          if (depth === 0) { closed = true; break; }
          depth--;
        }
        j++;
      }
      if (!closed) return null;
      subs.push(src.slice(start, j));
      j++;
      continue;
    }
    j++;
  }
  return null;
}

// A draft's tokens (isCompleteCommand has already checked strings, templates, regex literals,
// comments and brackets), or null — also when a regex literal or a number would not compile, or a
// template substitution is not itself a previewable expression.
function lex(src: string): Tok[] | null {
  const out: Tok[] = [];
  let i = 0;
  const push = (t: Tok['t'], v: string) => {
    const prev = out[out.length - 1];
    out.push({ t, v, dot: t === 'name' && !!prev && prev.t === 'punct' && (prev.v === '.' || prev.v === '?.') });
  };
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c === '/' && src[i + 1] === '/') {
      const end = src.indexOf('\n', i);
      i = end < 0 ? src.length : end;
      continue;
    }
    if (c === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i + 2);
      if (end < 0) return null;
      i = end + 2;
      continue;
    }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < src.length && src[j] !== c && src[j] !== '\n') j += src[j] === '\\' ? 2 : 1;
      if (src[j] !== c) return null;
      push('str', '');
      i = j + 1;
      continue;
    }
    if (c === '`') {
      const found = template(src, i);
      if (!found || !found.subs.every((sub) => expressionOk(sub))) return null;
      push('tmpl', '');
      i = found.end;
      continue;
    }
    if (ID_START.test(c)) {
      let j = i + 1;
      while (j < src.length && ID_PART.test(src[j])) j++;
      push('name', src.slice(i, j));
      i = j;
      continue;
    }
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] ?? ''))) {
      let j = i + 1;
      while (j < src.length && (/[\w.]/.test(src[j]) || ((src[j] === '+' || src[j] === '-') && /[eE]/.test(src[j - 1]) && !/^0[xX]/.test(src.slice(i, j))))) j++;
      if (!NUMBER.test(src.slice(i, j))) return null;
      push('num', src.slice(i, j));
      i = j;
      continue;
    }
    if (c === '/' && !valueEnd(out[out.length - 1])) {
      let j = i + 1;
      let inClass = false;
      while (j < src.length && src[j] !== '\n') {
        const d = src[j];
        if (d === '\\') { j += 2; continue; }
        if (inClass) { if (d === ']') inClass = false; } else if (d === '[') inClass = true;
        else if (d === '/') break;
        j++;
      }
      if (src[j] !== '/') return null;
      const body = src.slice(i + 1, j);
      j++;
      const flagsStart = j;
      while (j < src.length && /[a-z]/i.test(src[j])) j++;
      // An invalid regular expression's SyntaxError quotes its source: never sent.
      try {
        new RegExp(body, src.slice(flagsStart, j));
      } catch {
        return null;
      }
      push('re', '');
      i = j;
      continue;
    }
    const multi = PUNCTS.find((p) => src.startsWith(p, i) && !(p === '?.' && /[0-9]/.test(src[i + 2] ?? '')));
    push('punct', multi ?? c);
    i += multi ? multi.length : 1;
  }
  return out;
}

// The structural check of one expression (a draft, or a template substitution inside it).
function expressionOk(src: string): boolean {
  if (!src.trim()) return false;
  const toks = lex(src);
  if (!toks || !toks.length) return false;
  const first = toks[0];
  if (first.t === 'punct' && first.v === '{') return false;
  if (first.t === 'name' && STATEMENT.has(first.v)) return false;
  if (first.t === 'name' && first.v === 'async' && toks[1]?.t === 'name' && toks[1].v === 'function') return false;
  let depth = 0;
  // Per open bracket: its kind and the `?` still waiting for their `:` (`0 ? 1 : 2 : 3` is refused;
  // a `:` with none waiting belongs to an object literal, so only inside `{`).
  const frames: Array<{ open: string; q: number }> = [{ open: '', q: 0 }];
  for (let k = 0; k < toks.length; k++) {
    const tok = toks[k];
    if (tok.t === 'name' && !tok.dot && (tok.v === 'await' || tok.v === 'yield' || LOOPS.has(tok.v) || FORBIDDEN.has(tok.v))) return false;
    if (tok.t === 'name' && !tok.dot && tok.v === 'new' && toks[k + 1]?.t === 'punct' && toks[k + 1].v === '.') return false;
    if (k > 0 && valueEnd(toks[k - 1]) && valueStart(tok)) return false;
    if (tok.t === 'punct') {
      const frame = frames[frames.length - 1];
      if (tok.v === '(' || tok.v === '[' || tok.v === '{') {
        depth++;
        frames.push({ open: tok.v, q: 0 });
      } else if (tok.v === ')' || tok.v === ']' || tok.v === '}') {
        depth--;
        if (depth < 0 || frame.q !== 0) return false;
        frames.pop();
      } else if (tok.v === '?') frame.q++;
      else if (tok.v === ':') {
        if (frame.q > 0) frame.q--;
        else if (frame.open !== '{') return false;
      } else if (depth === 0 && (tok.v === ';' || WRITES.has(tok.v))) return false;
    } else if (depth === 0 && tok.t === 'name' && !tok.dot && tok.v === 'delete') return false;
  }
  return depth === 0 && frames[0].q === 0;
}

/**
 * Whether the page may preview `draft`: a single complete expression (isCompleteCommand) of at most
 * PREVIEW_DRAFT_MAX characters, with no `await`, no loop (`for`, `while`, `do`: one could spin, and
 * the typing path never terminates), no `super`/`import`/`new.target`, no statement or declaration
 * at its start, no `{` at its start (a block, not an object), no `;`, assignment, `++`, `--` or
 * `delete` at depth 0, no two values side by side (`a b`, `a\nb`), no unmatched `:`, every number
 * and regex literal valid — and every template substitution the same, recursively (fix round 1):
 * what would not compile is never sent.
 */
export function previewEligible(draft: string): boolean {
  const src = String(draft ?? '');
  return !!src.trim() && src.length <= PREVIEW_DRAFT_MAX && isCompleteCommand(src) && expressionOk(src);
}

/**
 * When to ask the page about `draft`, and whether that request may attach the debugger: never
 * before 2 non-space characters, then after a 150 ms pause (spec §4 session policy — Chrome shows
 * its debugging bar, so never on focus alone or one character).
 */
export function eagerDelay(draft: string): { ms: number; attach: true } | null {
  if (String(draft ?? '').replace(/\s/g, '').length < 2) return null;
  return { ms: EAGER_DEBOUNCE_MS, attach: true };
}

function parsed(text: unknown): { ok: true; value: unknown } | null {
  if (typeof text !== 'string' || !text) return null;
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return null;
  }
}

/**
 * The page's answer (`value` or `thrown`: typed-model text) as the line to show: `{ text }` (the
 * one-line preview, without the arrow) or `{ error }` (`Uncaught TypeError: …`), or null.
 */
export function previewTexts(answer: { value?: unknown; thrown?: unknown } | null | undefined): { text: string } | { error: string } | null {
  if (!answer || typeof answer !== 'object') return null;
  const value = parsed(answer.value);
  if (value) return { text: previewLine(value.value) };
  const thrown = parsed(answer.thrown);
  if (thrown) return { error: `Uncaught ${previewLine(thrown.value)}` };
  return null;
}
