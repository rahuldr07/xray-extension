export type PathSegment = string | number;
export interface PlainPath { root: string; segments: PathSegment[] }

export interface Suggestion {
  label: string;
  insert: string;
  detail: string;
  kind: 'helper' | 'variable' | 'property' | 'method' | 'index' | 'value';
  group?: string;
  caret?: number;
  from?: number;
}

export type ValueSource = 'status' | 'endpoint' | 'keys' | 'duration';
export interface HelperParam { name: string; description: string; values?: ValueSource }
export type HelperGroup = 'Request data' | 'Find entries' | 'Transform' | 'Output';
export interface HelperInfo { name: string; signature: string; description: string; group: HelperGroup; params?: HelperParam[] }
export interface CapturedSummary { statuses: { code: number; count: number }[]; endpoints: { path: string; count: number }[]; durations: number[] }

export interface Starter { label: string; insert: string; caretOffset?: number }

export type TokenKind = 'keyword' | 'string' | 'number' | 'comment' | 'punct' | 'plain';
export interface Token { kind: TokenKind; text: string }

const IDENT = /^[A-Za-z_$][\w$]*$/;
const ROOT = /^(?:res|req|[a-f]|temp\d+|\$_)/;
const MAX_SUGGESTIONS = 30;
const UNION_SCAN = 1000;
const ARRAY_METHODS = ['map', 'filter', 'find', 'some', 'every', 'includes', 'slice', 'join', 'at'];
const ARRAY_CALLBACKS = new Set(['map', 'filter', 'find', 'some', 'every']);
const STRING_METHODS = ['includes', 'startsWith', 'endsWith', 'slice', 'split', 'trim', 'toLowerCase', 'toUpperCase', 'replace', 'match'];

const RD: HelperGroup = 'Request data';
const FE: HelperGroup = 'Find entries';
const TR: HelperGroup = 'Transform';
const OUT: HelperGroup = 'Output';

function helper(name: string, group: HelperGroup, description: string, params?: HelperParam[]): HelperInfo {
  const signature = params ? `${name}(${params.map((p) => p.name).join(', ')})` : name;
  return params ? { name, signature, description, group, params } : { name, signature, description, group };
}

export const HELPERS: HelperInfo[] = [
  helper('res', RD, 'Parsed response body of the selected request.'),
  helper('req', RD, 'Parsed request body of the selected request.'),
  helper('entry', RD, 'The full captured entry for the selected request.'),
  helper('schema', TR, 'Infer a structural schema of a value.', [{ name: 'x', description: 'Value to describe.' }]),
  helper('diff', TR, 'Structural diff of two values.', [{ name: 'a', description: 'The baseline value.' }, { name: 'b', description: 'The value to compare against a.' }]),
  helper('pick', TR, 'Copy of obj with only the listed keys.', [{ name: 'obj', description: 'Object to copy from.' }, { name: 'keys', description: 'Array of key names to keep.', values: 'keys' }]),
  helper('omit', TR, 'Copy of obj without the listed keys.', [{ name: 'obj', description: 'Object to copy from.' }, { name: 'keys', description: 'Array of key names to drop.', values: 'keys' }]),
  helper('flatten', TR, 'Flatten nested keys into dotted paths.', [{ name: 'obj', description: 'Object to flatten.' }]),
  helper('toTable', OUT, 'Render an array of objects as a table.', [{ name: 'rows', description: 'Array of objects to show.' }]),
  helper('table', OUT, 'Alias of toTable: render rows as a table.', [{ name: 'rows', description: 'Array of objects to show.' }]),
  helper('csv', OUT, 'Alias of toCSV: convert rows to CSV text.', [{ name: 'rows', description: 'Array of objects to convert.' }]),
  helper('prev', RD, 'Response body of the previous call to this endpoint.'),
  helper('next', RD, 'Response body of the next call to this endpoint.'),
  helper('toCSV', OUT, 'Convert an array of objects to CSV text.', [{ name: 'rows', description: 'Array of objects to convert.' }]),
  helper('copy', OUT, 'Copy a value to the clipboard.', [{ name: 'x', description: 'Value to copy.' }]),
  helper('$prev', FE, 'Previous captured entry in the list.', []),
  helper('$next', FE, 'Next captured entry in the list.', []),
  helper('$all', FE, 'Every captured entry.', []),
  helper('$errors', FE, 'Entries with a status of 400 or above.', []),
  helper('$slow', FE, 'Entries slower than ms milliseconds.', [{ name: 'ms = 1000', description: 'Duration threshold in milliseconds.', values: 'duration' }]),
  helper('$status', FE, 'Entries with the given status code.', [{ name: 'code', description: 'HTTP status code to match.', values: 'status' }]),
  helper('$endpoint', FE, 'Entries whose URL path contains the text.', [{ name: 'path', description: 'Text the URL path must contain.', values: 'endpoint' }]),
  helper('$help', OUT, 'List all console helpers.'),
  helper('$curl', OUT, 'Copy-ready cURL command for the selected request.'),
  helper('$fetch', OUT, 'Copy-ready fetch() snippet for the selected request.'),
  helper('$mock', OUT, 'Build a mock response from an entry.', [{ name: 'entry?', description: 'Entry to mock; defaults to the selected request.' }]),
];

const BROWSE_ORDER: Record<HelperGroup, string[]> = {
  'Request data': ['res', 'req', 'entry', 'prev', 'next'],
  'Find entries': ['$all', '$errors', '$slow', '$status', '$endpoint', '$prev', '$next'],
  Transform: ['schema', 'diff', 'pick', 'omit', 'flatten'],
  Output: ['table', 'toTable', 'csv', 'toCSV', 'copy', '$curl', '$fetch', '$mock', '$help'],
};

/* ---------------------------------- paths --------------------------------- */

export function parsePlainPath(code: string): PlainPath | null {
  const text = String(code ?? '').trim();
  const rootMatch = ROOT.exec(text);
  if (!rootMatch) return null;
  const root = rootMatch[0];
  let i = root.length;
  if (i < text.length && !'.['.includes(text[i])) return null;
  const segments: PathSegment[] = [];
  while (i < text.length) {
    const ch = text[i];
    if (ch === '.') {
      const m = /^[A-Za-z_$][\w$]*/.exec(text.slice(i + 1));
      if (!m) return null;
      segments.push(m[0]);
      i += 1 + m[0].length;
    } else if (ch === '[') {
      const rest = text.slice(i + 1);
      const num = /^(\d+)\]/.exec(rest);
      if (num) {
        segments.push(Number(num[1]));
        i += 1 + num[0].length;
        continue;
      }
      const quote = rest[0];
      if (quote !== '"' && quote !== "'") return null;
      let key = '';
      let j = 1;
      let closed = false;
      while (j < rest.length) {
        const c = rest[j];
        if (c === '\\' && j + 1 < rest.length) { key += rest[j + 1]; j += 2; continue; }
        if (c === quote) { closed = true; break; }
        key += c;
        j++;
      }
      if (!closed || rest[j + 1] !== ']') return null;
      segments.push(key);
      i += 1 + j + 2;
    } else {
      return null;
    }
  }
  return { root, segments };
}

export function formatPath(root: string, segments: PathSegment[]): string {
  let out = root;
  for (const seg of segments) {
    if (typeof seg === 'number') out += `[${seg}]`;
    else if (IDENT.test(seg)) out += `.${seg}`;
    else out += `[${JSON.stringify(seg)}]`;
  }
  return out;
}

export function resolvePath(path: PlainPath, roots: Record<string, unknown>): { found: boolean; value: unknown } {
  if (!path || !roots || !Object.prototype.hasOwnProperty.call(roots, path.root)) return { found: false, value: undefined };
  let cur: unknown = roots[path.root];
  for (const seg of path.segments) {
    if (cur === null || typeof cur !== 'object') return { found: false, value: undefined };
    if (Array.isArray(cur) && seg === 'length') { cur = cur.length; continue; }
    if (!Object.prototype.hasOwnProperty.call(cur, seg)) return { found: false, value: undefined };
    cur = (cur as Record<string | number, unknown>)[seg];
  }
  return { found: true, value: cur };
}

/* ------------------------------- suggestions ------------------------------ */

function typeLabel(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function fuzzyScore(label: string, partial: string): number {
  if (!partial) return 1;
  const l = label.toLowerCase();
  const p = partial.toLowerCase();
  if (l.startsWith(p)) return 3;
  let at = 0;
  for (const ch of p) {
    at = l.indexOf(ch, at);
    if (at < 0) return 0;
    at++;
  }
  return 1;
}

function method(name: string, insert: string, caret: number, detail: string): Suggestion {
  return { label: name, insert, detail, kind: 'method', caret };
}

function arrayMembers(items: unknown[], from: number): Suggestion[] {
  const objects = isRecord(items[0]);
  const out: Suggestion[] = items.length ? [{ label: '[0]', insert: '[0]', detail: 'first item', kind: 'index', from: from - 1 }] : [];
  out.push({ label: 'length', insert: 'length', detail: String(items.length), kind: 'property' });
  for (const name of ARRAY_METHODS) {
    if (ARRAY_CALLBACKS.has(name)) {
      const insert = `${name}(x => x${objects ? '.' : ''})`;
      out.push(method(name, insert, insert.length - 1, `${name}(x => …)`));
    } else {
      out.push(method(name, `${name}()`, name.length + 1, `${name}(…)`));
    }
  }
  const scanned = items.length > UNION_SCAN ? items.slice(0, UNION_SCAN) : items;
  const seen = new Map<string, { count: number; type: string }>();
  let n = 0;
  for (const item of scanned) {
    if (!isRecord(item)) continue;
    n++;
    for (const key of Object.keys(item)) {
      const value = item[key];
      const hit = seen.get(key);
      if (!hit) seen.set(key, { count: 1, type: value === undefined ? '' : typeLabel(value) });
      else {
        hit.count++;
        if (!hit.type && value !== undefined) hit.type = typeLabel(value);
      }
    }
  }
  const group = items.length > UNION_SCAN ? 'keys across first 1,000 items' : `keys across ${n} item${n === 1 ? '' : 's'}`;
  for (const [key, { count, type }] of seen) {
    const access = IDENT.test(key) ? `.${key}` : `[${JSON.stringify(key)}]`;
    out.push({ label: key, insert: `map(x => x${access})`, detail: `${count}/${n} · ${type || 'undefined'}`, kind: 'property', group });
  }
  return out;
}

function stringMembers(value: string): Suggestion[] {
  return [
    { label: 'length', insert: 'length', detail: String(value.length), kind: 'property' },
    ...STRING_METHODS.map((name) => method(name, `${name}()`, name.length + 1, `${name}(…)`)),
  ];
}

function rankFlat<T extends { label: string }>(items: T[], partial: string): T[] {
  return items
    .map((item, index) => ({ item, index, score: fuzzyScore(item.label, partial) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((r) => r.item);
}

/** Ungrouped items first, then each group in its original order, each ranked within itself (spec B3). */
function rank<T extends { label: string; group?: string }>(items: T[], partial: string): T[] {
  const buckets = new Map<string | undefined, T[]>([[undefined, []]]);
  for (const item of items) {
    const bucket = buckets.get(item.group);
    if (bucket) bucket.push(item);
    else buckets.set(item.group, [item]);
  }
  return [...buckets.values()].flatMap((bucket) => rankFlat(bucket, partial));
}

const TRAILING_PATH = /(?:^|[^\w$.\]])((?:res|req|[a-f]|temp\d+|\$_)(?:\.[A-Za-z_$][\w$]*|\[\d+\]|\["(?:[^"\\]|\\.)*"\]|\['(?:[^'\\]|\\.)*'\])*)$/;

type Context = 'member' | 'argument' | 'identifier' | 'browse' | 'none';
interface Frame { ch: string; start: number; argStarts: number[] }
interface ArgScan { helper: HelperInfo; index: number; argStart: number; quote: '' | '"' | "'" | '`'; quoteAt: number; frames: Frame[]; open: number }

/** A string token without its closing quote (a backslash escapes the next character). */
function isOpenString(token: Token | undefined): boolean {
  if (!token || token.kind !== 'string') return false;
  const q = token.text[0];
  for (let i = 1; i < token.text.length; i++) {
    if (token.text[i] === '\\') i++;
    else if (token.text[i] === q) return false;
  }
  return true;
}

/** Whether the caret sits inside an unclosed string. Comments are skipped, as in the highlighter. */
function inString(text: string): boolean {
  const tokens = tokenize(text);
  return isOpenString(tokens[tokens.length - 1]);
}

function scanArgument(draft: string, caret: number): ArgScan | null {
  const text = String(draft ?? '').slice(0, Math.max(0, caret));
  const stack: Frame[] = [];
  let quote: '' | '"' | "'" | '`' = '';
  let quoteAt = -1;
  const skipSpace = (i: number) => { while (i < text.length && /\s/.test(text[i])) i++; return i; };
  // Walk the highlighter's tokens: brackets inside strings and comments do not count, and
  // only a trailing unclosed string puts the caret inside a quote.
  const tokens = tokenize(text);
  let i = 0;
  tokens.forEach((token, t) => {
    const at = i;
    i += token.text.length;
    if (token.kind === 'string') {
      if (t === tokens.length - 1 && isOpenString(token)) { quote = token.text[0] as '"' | "'" | '`'; quoteAt = at; }
      return;
    }
    if (token.kind !== 'punct') return;
    const ch = token.text;
    const top = stack[stack.length - 1];
    if (ch === '(' || ch === '[' || ch === '{') stack.push({ ch, start: at, argStarts: [at + 1] });
    else if (ch === ')' || ch === ']' || ch === '}') stack.pop();
    else if (ch === ',' && top) top.argStarts.push(at + 1);
  });
  // The innermost open bracket may be a `[` inside the call, so find the innermost `(`.
  let open = stack.length - 1;
  while (open >= 0 && stack[open].ch !== '(') open--;
  if (open < 0) return null;
  const call = stack[open];
  const m = /([A-Za-z_$][\w$]*)\s*$/.exec(text.slice(0, call.start));
  if (!m) return null;
  if (m.index > 0 && text[m.index - 1] === '.') return null;
  const found = HELPERS.find((h) => h.name === m[1]);
  if (!found) return null;
  const index = call.argStarts.length - 1;
  return { helper: found, index, argStart: skipSpace(call.argStarts[index]), quote, quoteAt, frames: stack, open };
}

export function argumentAt(draft: string, caret: number): { helper: HelperInfo; index: number; argStart: number; quote: '' | '"' | "'" | '`' } | null {
  const r = scanArgument(draft, caret);
  return r ? { helper: r.helper, index: r.index, argStart: r.argStart, quote: r.quote } : null;
}

export function summarizeCaptured(entries: ReadonlyArray<{ type?: string; status?: number; url?: string; urlPath?: string; duration?: number }>): CapturedSummary {
  const statuses = new Map<number, number>();
  const endpoints = new Map<string, number>();
  const durations: number[] = [];
  for (const e of entries || []) {
    if (!e || e.type !== 'api') continue;
    if (typeof e.status === 'number' && Number.isFinite(e.status)) statuses.set(e.status, (statuses.get(e.status) || 0) + 1);
    let path = String(e.urlPath || e.url || '');
    if (!e.urlPath && path) {
      try { path = new URL(path).pathname; } catch { path = path.replace(/[?#].*$/, ''); }
    } else path = path.replace(/[?#].*$/, '');
    if (path) endpoints.set(path, (endpoints.get(path) || 0) + 1);
    if (typeof e.duration === 'number' && Number.isFinite(e.duration)) durations.push(e.duration);
  }
  return {
    statuses: [...statuses].map(([code, count]) => ({ code, count })).sort((a, b) => b.count - a.count || a.code - b.code),
    endpoints: [...endpoints].map(([path, count]) => ({ path, count })).sort((a, b) => b.count - a.count || (a.path < b.path ? -1 : a.path > b.path ? 1 : 0)),
    durations,
  };
}

function durationSuggestions(durations: number[]): Suggestion[] {
  const out: Suggestion[] = [];
  const add = (label: string, detail: string) => {
    if (!out.some((o) => o.label === label)) out.push({ label, insert: label, detail, kind: 'value' });
  };
  add('500', 'default');
  add('1000', 'default');
  const sorted = durations.filter((d) => Number.isFinite(d) && d >= 0).sort((a, b) => a - b);
  if (sorted.length) {
    const round = (v: number) => String(Math.round(v / 10) * 10);
    const p95 = round(sorted[Math.ceil(0.95 * sorted.length) - 1]);
    const slowest = round(sorted[sorted.length - 1]);
    if (p95 !== slowest) add(p95, 'p95');
    add(slowest, 'slowest');
  }
  return out;
}

/** A string literal body for `value` inside `quote`: escaped like JSON (control characters too). */
function escapeIn(value: string, quote: string): string {
  const body = JSON.stringify(value).slice(1, -1);
  if (quote === '"') return body;
  const unescaped = body.replace(/\\(.)/g, (m, c: string) => (c === '"' ? '"' : m)).split(quote).join(`\\${quote}`);
  return quote === '`' ? unescaped.replace(/\$\{/g, '\\${') : unescaped;
}

const OPERATOR = new Set(['=', '<', '>', '+', '-', '*', '/', '%', '!', '&', '|', '?', ':', '^', '~']);

/**
 * The text before the caret ends a complete token — a closed string, a number followed by
 * whitespace, or an operator — so the argument's value is already written.
 */
function endsComplete(text: string): boolean {
  const tokens = tokenize(text);
  let last = tokens[tokens.length - 1];
  const spaced = !!last && last.kind === 'plain' && !last.text.trim();
  if (spaced) last = tokens[tokens.length - 2];
  if (!last) return false;
  if (last.kind === 'string') return !isOpenString(last);
  if (last.kind === 'number') return spaced;
  return last.kind === 'punct' && OPERATOR.has(last.text);
}

function argumentValues(scan: ArgScan, text: string, caret: number, ctx: { roots: Record<string, unknown>; captured?: CapturedSummary }): { from: number; items: Suggestion[] } | null {
  const param = scan.helper.params?.[scan.index];
  if (!param?.values) return null;
  if (endsComplete(text)) return { from: caret, items: [] };
  const word = /[\w$]*$/.exec(text)?.[0] ?? '';
  if (param.values === 'keys') {
    const bracket = scan.frames[scan.frames.length - 1];
    if (scan.index !== 1 || bracket?.ch !== '[' || scan.frames[scan.open] !== scan.frames[scan.frames.length - 2] || bracket.start !== scan.argStart) return null;
    const call = scan.frames[scan.open];
    const firstArg = text.slice(call.argStarts[0], (call.argStarts[1] ?? 0) - 1).trim();
    const parsed = parsePlainPath(firstArg);
    const hit = parsed ? resolvePath(parsed, ctx.roots || {}) : { found: false, value: undefined };
    let source: unknown = hit.value;
    if (Array.isArray(source)) source = source.find(isRecord);
    if (!hit.found || !isRecord(source)) return { from: caret, items: [] };
    const q = scan.quote;
    const typed = q ? text.slice(scan.quoteAt + 1) : word;
    const from = q ? scan.quoteAt + 1 : caret - word.length;
    const listed = new Set<string>();
    const body = text.slice(bracket.start + 1, q ? scan.quoteAt : from);
    for (const m of body.matchAll(/(["'])((?:\\.|(?!\1)[^\\])*)\1/g)) listed.add(m[2].replace(/\\(.)/g, '$1'));
    const keys = Object.keys(source)
      .filter((k) => !listed.has(k))
      .map((k) => ({ label: k, insert: q ? `${escapeIn(k, q)}${q}` : `'${escapeIn(k, "'")}'`, detail: typeLabel((source as Record<string, unknown>)[k]), kind: 'value' as const }));
    return { from, items: rank(keys, typed).slice(0, MAX_SUGGESTIONS) };
  }
  if (param.values === 'endpoint') {
    const q = scan.quote;
    const typed = q ? text.slice(scan.quoteAt + 1) : word;
    const from = q ? scan.quoteAt + 1 : caret - word.length;
    const items = (ctx.captured?.endpoints ?? []).map((e) => ({
      label: e.path,
      insert: q ? `${escapeIn(e.path, q)}${q}` : `'${escapeIn(e.path, "'")}'`,
      detail: `×${e.count}`,
      kind: 'value' as const,
    }));
    return { from, items: rank(items, typed).slice(0, MAX_SUGGESTIONS) };
  }
  const from = caret - word.length;
  if (scan.quote) return { from: caret, items: [] };
  if (param.values === 'status') {
    const items = (ctx.captured?.statuses ?? []).map((s) => ({
      label: String(s.code),
      insert: String(s.code),
      detail: s.code >= 400 ? `×${s.count} · error` : `×${s.count}`,
      kind: 'value' as const,
    }));
    return { from, items: rank(items, word).slice(0, MAX_SUGGESTIONS) };
  }
  if (!ctx.captured) return { from, items: [] };
  const items = durationSuggestions(ctx.captured.durations);
  return { from, items: rank(items, word).slice(0, MAX_SUGGESTIONS) };
}

function browseItems(variables: string[], roots: Record<string, unknown>): Suggestion[] {
  const out: Suggestion[] = [];
  const seen = new Set<string>();
  for (const group of Object.keys(BROWSE_ORDER) as HelperGroup[]) {
    for (const name of BROWSE_ORDER[group]) {
      const h = HELPERS.find((x) => x.name === name);
      if (!h) continue;
      seen.add(name);
      const item: Suggestion = { label: name, insert: name, detail: h.description, kind: 'helper', group };
      if (h.params) {
        item.insert = h.params.length ? `${name}(` : `${name}()`;
        item.caret = name.length + (h.params.length ? 1 : 2);
      }
      out.push(item);
    }
  }
  const addVariable = (name: string, detail: string) => {
    if (seen.has(name)) return;
    seen.add(name);
    out.push({ label: name, insert: name, detail, kind: 'variable', group: 'Variables' });
  };
  for (const name of variables || []) addVariable(name, 'saved variable');
  for (const name of Object.keys(roots || {})) addVariable(name, typeLabel(roots[name]));
  return out;
}

export function suggest(
  draft: string,
  caret: number,
  ctx: { roots: Record<string, unknown>; variables: string[]; captured?: CapturedSummary; manual?: boolean },
): { from: number; items: Suggestion[]; context: Context } {
  const text = String(draft ?? '').slice(0, Math.max(0, caret));
  let from = text.length;
  while (from > 0 && /[\w$]/.test(text[from - 1])) from--;
  const partial = text.slice(from);
  const before = text.slice(0, from);

  let memberBase: string | null = null;
  let quote = '';
  let bracket = false;
  if (before.endsWith('.')) {
    memberBase = before.slice(0, -1);
  } else {
    const m = /^(.*)\[(["']?)$/s.exec(before);
    if (m) { memberBase = m[1]; quote = m[2]; bracket = true; }
  }

  const scan = scanArgument(text, text.length);
  if (scan && (scan.quote || memberBase === null || scan.helper.params?.[scan.index]?.values === 'keys')) {
    const hit = argumentValues(scan, text, text.length, ctx);
    // No value matches an identifier being typed (`$status(r`): complete it as an identifier.
    if (hit && (hit.items.length || scan.quote || !partial || /^\d/.test(partial))) return { ...hit, context: 'argument' };
  }

  if (inString(text) && !(bracket && quote)) return { from, items: [], context: scan ? 'argument' : 'none' };

  if (memberBase !== null) {
    const none = { from, items: [] as Suggestion[], context: 'member' as Context };
    const pm = TRAILING_PATH.exec(memberBase);
    const parsed = pm ? parsePlainPath(pm[1]) : null;
    if (!parsed) return none;
    const hit = resolvePath(parsed, ctx.roots || {});
    const target = hit.value;
    if (hit.found && !bracket) {
      if (Array.isArray(target)) return { from, items: rank(arrayMembers(target, from), partial).slice(0, MAX_SUGGESTIONS), context: 'member' };
      if (typeof target === 'string') return { from, items: rank(stringMembers(target), partial).slice(0, MAX_SUGGESTIONS), context: 'member' };
    }
    if (!hit.found || target === null || typeof target !== 'object' || Array.isArray(target)) return none;
    const props: Suggestion[] = [];
    for (const key of Object.keys(target)) {
      if (!bracket && !IDENT.test(key)) continue;
      const insert = bracket ? (quote ? `${escapeIn(key, quote)}${quote}]` : `${JSON.stringify(key)}]`) : key;
      props.push({ label: key, insert, detail: typeLabel((target as Record<string, unknown>)[key]), kind: 'property' });
    }
    return { from, items: rank(props, partial).slice(0, MAX_SUGGESTIONS), context: 'member' };
  }

  if (/["'`]/.test(before.slice(-1))) return { from, items: [], context: scan ? 'argument' : 'none' };
  if (!partial) {
    if (ctx.manual && (before === '' || /[\s=+\-*/%!&|?:<>(,;{^~]$/.test(before))) {
      return { from, items: browseItems(ctx.variables, ctx.roots), context: 'browse' };
    }
    return { from, items: [], context: scan ? 'argument' : 'none' };
  }
  if (/^\d/.test(partial)) return { from, items: [], context: scan ? 'argument' : 'none' };

  const candidates: Suggestion[] = HELPERS.map((h) => ({ label: h.name, insert: h.name, detail: h.description, kind: 'helper' as const }));
  const seen = new Set(candidates.map((c) => c.label));
  const addVariable = (name: string, detail: string) => {
    if (seen.has(name)) return;
    seen.add(name);
    candidates.push({ label: name, insert: name, detail, kind: 'variable' });
  };
  for (const name of ctx.variables || []) addVariable(name, 'saved variable');
  for (const name of Object.keys(ctx.roots || {})) addVariable(name, typeLabel(ctx.roots[name]));
  return { from, items: rank(candidates, partial).slice(0, MAX_SUGGESTIONS), context: 'identifier' };
}

/* ------------------------------ signature hint ----------------------------- */

export function signatureAt(draft: string, caret: number): { name: string; signature: string; description: string; params: HelperParam[]; index: number } | null {
  const a = scanArgument(draft, caret);
  if (!a) return null;
  return { name: a.helper.name, signature: a.helper.signature, description: a.helper.description, params: a.helper.params ?? [], index: a.index };
}

/* -------------------------------- error hints ------------------------------ */

function editDistance(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length];
}

export function errorHint(message: string, command: string, hasRequest: boolean): string | null {
  const msg = String(message ?? '');
  const cmd = String(command ?? '');
  if (/SyntaxError|Unexpected (?:token|end of|identifier|string|number)|Invalid or unexpected token|missing \) after/i.test(msg)) {
    return 'Check brackets and quotes. Shift+Enter adds a new line.';
  }
  if (!hasRequest && /(?:^|[^\w$.])(?:res|req)\b/.test(cmd)) return 'No request selected. Pick one above.';
  if (/Cannot read propert(?:y|ies) of (?:undefined|null)/i.test(msg) && /^\s*res\./.test(cmd)) {
    return 'res is the response body itself. Try Object.keys(res).';
  }
  const undef = /([A-Za-z_$][\w$]*) is not defined/.exec(msg);
  if (undef) {
    const word = undef[1];
    let best = '';
    let bestDist = Infinity;
    for (const name of HELPERS.map((h) => h.name)) {
      const d = editDistance(word.toLowerCase(), name.toLowerCase());
      if (d < bestDist) { bestDist = d; best = name; }
    }
    if (best && bestDist > 0 && bestDist <= 2 && bestDist < word.length) return `Did you mean \`${best}\`?`;
  }
  return null;
}

/* --------------------------------- starters -------------------------------- */

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isObjectArray(value: unknown): value is Record<string, unknown>[] {
  return Array.isArray(value) && value.length > 0 && isRecord(value[0]);
}

function singular(key: string): string {
  if (/(?:us|ss)$/.test(key)) return key;
  if (/ies$/.test(key) && key.length > 3) return key.slice(0, -3) + 'y';
  if (/[^s]s$/.test(key)) return key.slice(0, -1);
  return 'item';
}

function findArray(res: unknown): { segments: string[]; items: Record<string, unknown>[] } | null {
  if (isObjectArray(res)) return { segments: [], items: res };
  if (!isRecord(res)) return null;
  const keys = Object.keys(res);
  for (const key of keys) if (isObjectArray(res[key])) return { segments: [key], items: res[key] as Record<string, unknown>[] };
  for (const key of keys) {
    const child = res[key];
    if (!isRecord(child)) continue;
    for (const inner of Object.keys(child)) if (isObjectArray(child[inner])) return { segments: [key, inner], items: child[inner] as Record<string, unknown>[] };
  }
  return null;
}

export function starters(res: unknown, hasPrevious: boolean): Starter[] {
  if (res === undefined || res === null) return [];
  const out: Starter[] = [];
  const found = findArray(res);
  if (found) {
    const path = formatPath('res', found.segments);
    const last = found.segments[found.segments.length - 1];
    const noun = last ? singular(last) : 'item';
    const plural = last || 'items';
    const v = /^[a-z]/i.test(noun) ? noun[0].toLowerCase() : 'i';
    out.push({ label: `Table of ${plural}`, insert: `table(${path})` });
    out.push({ label: `Count ${plural}`, insert: `${path}.length` });
    if (Object.prototype.hasOwnProperty.call(found.items[0], 'id')) {
      const insert = `${path}.find(${v} => ${v}.id === )`;
      out.push({ label: `Find ${noun} by id`, insert, caretOffset: insert.length - 1 });
    }
  }
  if (hasPrevious) out.push({ label: 'Diff with previous call', insert: 'diff(prev, res)' });
  out.push({ label: 'Schema', insert: 'schema(res)' });
  return out.slice(0, 5);
}

/* --------------------------------- tokenizer ------------------------------- */

const KEYWORDS = new Set(['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'new', 'typeof', 'instanceof', 'in', 'of', 'await', 'async', 'class', 'try', 'catch', 'finally', 'throw', 'true', 'false', 'null', 'undefined', 'this', 'delete', 'void', 'yield']);
const PUNCT = '{}()[];,.=<>+-*/%!&|?:^~';

export function tokenize(code: string): Token[] {
  const src = String(code ?? '');
  const out: Token[] = [];
  const push = (kind: TokenKind, text: string) => {
    if (!text) return;
    const last = out[out.length - 1];
    if (last && last.kind === kind && (kind === 'plain')) last.text += text;
    else out.push({ kind, text });
  };
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    const next = src[i + 1];
    if (ch === '/' && next === '/') {
      let j = src.indexOf('\n', i);
      if (j < 0) j = src.length;
      push('comment', src.slice(i, j));
      i = j;
    } else if (ch === '/' && next === '*') {
      const end = src.indexOf('*/', i + 2);
      const j = end < 0 ? src.length : end + 2;
      push('comment', src.slice(i, j));
      i = j;
    } else if (ch === '"' || ch === "'" || ch === '`') {
      let j = i + 1;
      while (j < src.length && src[j] !== ch) {
        if (src[j] === '\\') j++;
        else if (src[j] === '\n' && ch !== '`') break;
        j++;
      }
      j = Math.min(src.length, j + (src[j] === ch ? 1 : 0));
      push('string', src.slice(i, j));
      i = j;
    } else if (/\d/.test(ch)) {
      const m = /^(?:0[xX][\da-fA-F_]+|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?n?)/.exec(src.slice(i));
      const text = m ? m[0] : ch;
      push('number', text);
      i += text.length;
    } else if (/[A-Za-z_$]/.test(ch)) {
      const m = /^[\w$]+/.exec(src.slice(i)) as RegExpExecArray;
      push(KEYWORDS.has(m[0]) ? 'keyword' : 'plain', m[0]);
      i += m[0].length;
    } else if (PUNCT.includes(ch)) {
      push('punct', ch);
      i++;
    } else {
      push('plain', ch);
      i++;
    }
  }
  return out;
}
