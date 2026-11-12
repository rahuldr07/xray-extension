import { CATALOG_GLOBALS, KEYWORDS as CATALOG_KEYWORDS, catalogMembers, ownerOfType, type CatalogEntry } from './consoleCatalog';
import { LosslessNumber } from './jsonText';

export type PathSegment = string | number;
export interface PlainPath { root: string; segments: PathSegment[] }

export interface Suggestion {
  label: string;
  insert: string;
  detail: string;
  kind: 'helper' | 'variable' | 'property' | 'method' | 'index' | 'value' | 'function' | 'class' | 'keyword' | 'namespace';
  group?: string;
  caret?: number;
  from?: number;
  /** `name(params)` for a callable. */
  signature?: string;
  /** One-line description. */
  doc?: string;
  /** Where the name comes from (spec §3); none means captured data or an XRAY helper. */
  source?: 'captured' | 'declared' | 'live' | 'catalog';
}

/** A name the page holds (spec §3 source 4), as the background lists it: descriptors only, never read. */
export interface LiveName { name: string; kind: 'function' | 'property' | 'getter' | 'class'; own: boolean; params?: string; native?: boolean }
/** A name an earlier command declared in the tab's scope (spec §2), with its declaration kind. */
export interface DeclaredName { name: string; kind: string }
/** The page's members of one plain path; `type` names a primitive's type (its prototype comes from the catalogue). */
export interface LiveMembers { expr: string; names: LiveName[]; type?: string; /** The path stopped at an accessor (never evaluated). */ getter?: boolean }
/** What the page told the editor so far: the members of the path being completed, its globals, the declared names. */
export interface LiveKnowledge {
  members?: LiveMembers | null;
  globals?: LiveName[] | null;
  declared?: DeclaredName[] | null;
  /** The globals are current and whole (fresh, no Run since, not capped): only then may Enter be relaxed. */
  complete?: boolean;
}

export type ValueSource = 'status' | 'endpoint' | 'keys' | 'duration';
export interface HelperParam { name: string; description: string; values?: ValueSource }
export type HelperGroup = 'Request data' | 'Find entries' | 'Transform' | 'Output';
export interface HelperInfo { name: string; signature: string; description: string; group: HelperGroup; params?: HelperParam[] }
export interface CapturedSummary { statuses: { code: number; count: number }[]; endpoints: { path: string; count: number }[]; durations: number[] }

export interface Starter { label: string; insert: string; caretOffset?: number }

export type TokenKind = 'keyword' | 'string' | 'number' | 'comment' | 'punct' | 'plain' | 'regex';
export interface Token { kind: TokenKind; text: string }

const IDENT = /^[A-Za-z_$][\w$]*$/;
const ROOT = /^(?:res|req|[a-f]|temp\d+|\$_)/;
const ROOT_NAME = /^(?:res|req|[a-f]|temp\d+|\$_)$/;
const MAX_SUGGESTIONS = 30;
// Member lists hold a whole prototype (an array has ~40 methods besides its item keys).
const MAX_MEMBERS = 100;
const UNION_SCAN = 1000;
// The array methods listed first; the rest follow the item keys under their own header.
const ARRAY_COMMON = new Set(['map', 'filter', 'find', 'some', 'every', 'includes', 'slice', 'join', 'at']);
const ARRAY_MORE = 'more array methods';
// Array methods whose insert is a callback template (`map(x => x.)`).
const ARRAY_CALLBACKS = new Set(['map', 'filter', 'find', 'findIndex', 'findLast', 'findLastIndex', 'some', 'every', 'forEach', 'flatMap']);
// Array methods whose callback parameter takes the item shape (G11); `reduce` uses its second parameter.
const LAMBDA_METHODS = new Set(['map', 'filter', 'find', 'findLast', 'some', 'every', 'forEach', 'flatMap', 'reduce']);
// Comparators: both parameters take the item shape.
const COMPARATORS = new Set(['sort', 'toSorted']);
// Names for the global object: `window.document` completes like `document`.
const GLOBAL_OBJECTS = new Set(['window', 'globalThis', 'self']);

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
  return rootMatch ? parseFrom(text, rootMatch[0]) : null;
}

/** A path from any identifier root (`u.address`, `document.body`). */
function parseAnyPath(text: string): PlainPath | null {
  const rootMatch = /^[A-Za-z_$][\w$]*/.exec(text);
  return rootMatch ? parseFrom(text, rootMatch[0]) : null;
}

function parseFrom(text: string, root: string): PlainPath | null {
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
    // A LosslessNumber is a BigInt in the page (spec J8): a number, with no members.
    if (cur === null || typeof cur !== 'object' || cur instanceof LosslessNumber) return { found: false, value: undefined };
    if (Array.isArray(cur) && seg === 'length') { cur = cur.length; continue; }
    if (!Object.prototype.hasOwnProperty.call(cur, seg)) return { found: false, value: undefined };
    cur = (cur as Record<string | number, unknown>)[seg];
  }
  return { found: true, value: cur };
}

/* ------------------------------- suggestions ------------------------------ */

function typeLabel(value: unknown): string {
  if (value === null) return 'null';
  // The roots hold the panel's lossless parse; the page holds an integer past 2^53 as a BigInt.
  if (value instanceof LosslessNumber) return 'bigint';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

export interface RankMatch { tier: 0 | 1 | 2 | 3 | 4 | 5; indices: number[] }

const range = (start: number, n: number): number[] => Array.from({ length: n }, (_, i) => start + i);

// Character classes for word starts, by char code (no regex per label character).
const SEP = 0;
const UPPER = 1;
const LOWER = 2;
const DIGIT = 3;
const OTHER = 4; // non-ASCII: part of a word, never a hump
function charClass(code: number): number {
  if (code >= 65 && code <= 90) return UPPER;
  if (code >= 97 && code <= 122) return LOWER;
  if (code >= 48 && code <= 57) return DIGIT;
  return code > 127 ? OTHER : SEP;
}

/** Index 0, after a separator, a camelCase hump, or the last capital of an acronym (`XMLHttp` → H). */
function isWordStart(label: string, i: number): boolean {
  if (i === 0) return true;
  const cur = charClass(label.charCodeAt(i));
  if (cur === SEP) return false;
  const prev = charClass(label.charCodeAt(i - 1));
  if (prev === SEP) return true;
  if (cur !== UPPER) return false;
  if (prev === LOWER || prev === DIGIT) return true;
  return prev === UPPER && i + 1 < label.length && charClass(label.charCodeAt(i + 1)) === LOWER;
}

/**
 * Cheap reject (no allocation): false only when `q` (lower case) is certainly not a
 * case-insensitive subsequence of `label`. Any non-ASCII character defers to the full
 * match, since lower-casing it is not a one-character ASCII fold.
 */
function maybeSubsequence(q: string, label: string): boolean {
  let at = 0;
  for (let i = 0; i < q.length; i++) {
    const want = q.charCodeAt(i);
    if (want > 127) return true;
    for (;;) {
      if (at >= label.length) return false;
      let c = label.charCodeAt(at++);
      if (c > 127) return true;
      if (c >= 65 && c <= 90) c += 32;
      if (c === want) break;
    }
  }
  return true;
}

/**
 * Each query character either continues the current word or starts a later word
 * (`qSA` → q·uery S·elector A·ll, `qsel` → q·uery Sel·ector). Failed states are memoised,
 * so the search is O(query × label²) at worst.
 */
function wordBoundaryMatch(q: string, raw: string, l: string): number[] | null {
  const failed = new Set<number>();
  const walk = (qi: number, from: number, cont: boolean): number[] | null => {
    if (qi === q.length) return [];
    const key = (qi * (l.length + 1) + from) * 2 + (cont ? 1 : 0);
    if (failed.has(key)) return null;
    if (cont && from < l.length && l[from] === q[qi]) {
      const rest = walk(qi + 1, from + 1, true);
      if (rest) return [from, ...rest];
    }
    for (let p = from; p < l.length; p++) {
      if (l[p] !== q[qi] || !isWordStart(raw, p)) continue;
      const rest = walk(qi + 1, p + 1, true);
      if (rest) return [p, ...rest];
    }
    failed.add(key);
    return null;
  };
  return walk(0, 0, false);
}

// rank() asks with one query for every label: lower-case it once.
let lastQuery = '';
let lastLower = '';

/**
 * Match tier of a label for a typed query, case-insensitive (spec §3): 5 exact, 4 prefix,
 * 3 word boundary / camelCase, 2 contiguous substring, 1 subsequence (only for a query of
 * 3+ characters), 0 an empty query; null when it does not match. `indices` are the matched
 * label characters. Labels that cannot match are rejected before anything is allocated.
 */
export function rankMatch(query: string, label: string): RankMatch | null {
  const typed = String(query ?? '');
  if (!typed) return { tier: 0, indices: [] };
  if (typed !== lastQuery) { lastQuery = typed; lastLower = typed.toLowerCase(); }
  const q = lastLower;
  const raw = String(label ?? '');
  if (!maybeSubsequence(q, raw)) return null;
  const l = raw.toLowerCase();
  if (l === q) return { tier: 5, indices: range(0, l.length) };
  if (l.startsWith(q)) return { tier: 4, indices: range(0, q.length) };
  // Lower-casing can change the length of some Unicode text; then only the other tiers apply.
  const wb = raw.length === l.length ? wordBoundaryMatch(q, raw, l) : null;
  if (wb) return { tier: 3, indices: wb };
  const at = l.indexOf(q);
  if (at >= 0) return { tier: 2, indices: range(at, q.length) };
  if (q.length < 3) return null;
  const indices: number[] = [];
  let from = 0;
  for (const ch of q) {
    const hit = l.indexOf(ch, from);
    if (hit < 0) return null;
    indices.push(hit);
    from = hit + 1;
  }
  return { tier: 1, indices };
}

/**
 * A catalogue entry as a suggestion. A callable inserts `name(` with the caret inside on
 * every path (spec §3), with or without parameters; a class does so only after `new`
 * (`new Da` → `Date(`), elsewhere it is a name (`Object` for `Object.keys`).
 */
function catalogSuggestion(e: CatalogEntry, call: boolean, owner: string): Suggestion {
  // The row's icon already says the kind (Task 5), so the detail is the return type, else the
  // owner (`Array` for `Array.prototype`, `global` for a global); keywords say `keyword`.
  const where = e.kind === 'keyword' ? 'keyword' : owner.replace(/\.prototype$/, '');
  const item: Suggestion = { label: e.name, insert: e.name, detail: e.returns ?? where, kind: e.kind, doc: e.doc, source: 'catalog' };
  // The popup row shows `(params)` from the signature (Task 5).
  if (e.signature) item.signature = e.signature;
  if (e.signature && (call || e.kind === 'method' || e.kind === 'function')) {
    item.insert = `${e.name}(`;
    item.caret = e.name.length + 1;
  }
  return item;
}

const catalogCache = new Map<string, Suggestion[]>();

/** Suggestions for an owner's catalogue members (`Object`, `Array.prototype`), built once. */
function catalogSuggestions(owner: string): Suggestion[] {
  let list = catalogCache.get(owner);
  if (!list) {
    list = catalogMembers(owner).map((e) => catalogSuggestion(e, false, owner));
    catalogCache.set(owner, list);
  }
  return list;
}

const identifierCatalog: Array<Suggestion[] | null> = [null, null];
/** Globals, then keywords, as identifier-position suggestions (built once); after `new`, classes are calls. */
function catalogIdentifiers(afterNew: boolean): Suggestion[] {
  const at = afterNew ? 1 : 0;
  identifierCatalog[at] ??= [...CATALOG_GLOBALS, ...CATALOG_KEYWORDS].map((e) => catalogSuggestion(e, afterNew, 'global'));
  return identifierCatalog[at] as Suggestion[];
}

function arrayMembers(items: unknown[], from: number): Suggestion[] {
  const objects = isRecord(items[0]);
  const out: Suggestion[] = items.length ? [{ label: '[0]', insert: '[0]', detail: 'first item', kind: 'index', from: from - 1 }] : [];
  out.push({ label: 'length', insert: 'length', detail: String(items.length), kind: 'property' });
  const more: Suggestion[] = [];
  for (const m of catalogSuggestions('Array.prototype')) {
    if (m.label === 'length') continue;
    const target = ARRAY_COMMON.has(m.label) ? out : more;
    if (ARRAY_CALLBACKS.has(m.label)) {
      const insert = `${m.label}(x => x${objects ? '.' : ''})`;
      // The row shows the signature's `(params)` (Task 5); the detail stays the return type.
      target.push({ ...m, insert, caret: insert.length - 1 });
    } else {
      target.push(m);
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
  // Captured item keys rank before the less common methods (spec §3 source priority).
  for (const m of more) out.push({ ...m, group: ARRAY_MORE });
  return out;
}

function stringMembers(value: string): Suggestion[] {
  return [
    { label: 'length', insert: 'length', detail: String(value.length), kind: 'property' },
    ...catalogSuggestions('String.prototype').filter((m) => m.label !== 'length'),
  ];
}

/** Recency score of a label: higher for a more recent accept, 0 when never accepted. */
export type RecencyScore = (label: string) => number;

interface Ranked<T> { item: T; index: number; tier: number; recent: number; source: number }

// Spec §3 source priority: captured (and XRAY's helpers) > declared > live > catalogue.
const SOURCE_RANK: Record<string, number> = { captured: 0, declared: 1, live: 2, catalog: 3 };

function compareRanked<T extends { label: string }>(a: Ranked<T>, b: Ranked<T>): number {
  if (a.tier !== b.tier) return b.tier - a.tier;
  // An empty query keeps the source order (browse groups, array members, values by count).
  if (a.tier === 0) return a.index - b.index;
  if (a.recent !== b.recent) return b.recent - a.recent;
  if (a.source !== b.source) return a.source - b.source;
  if (a.item.label.length !== b.item.label.length) return a.item.label.length - b.item.label.length;
  if (a.item.label !== b.item.label) return a.item.label < b.item.label ? -1 : 1;
  return a.index - b.index;
}

/**
 * Ungrouped items first, then each group in its original order, each ranked within itself
 * (spec B3). Tiers (spec §3): exact > prefix > word boundary > substring > subsequence; the
 * two weakest are fallbacks — substring and subsequence matches are offered only when the
 * list has no prefix or word-boundary match, subsequence only when nothing better exists.
 * Within a tier: recently accepted > source (captured > declared > live > catalogue) >
 * shorter > alphabetical.
 */
// Object.prototype's legacy names (`__defineGetter__`, `__lookupSetter__`, `__proto__` …) and any other
// `__x__` name the page answers: hidden unless the typed prefix starts with "_" (final review M-1).
// Only the page's and the catalogue's names: a captured key such as `__meta__` is the user's data.
const LEGACY_NAME = /^__[\w$]+__$/;
const hiddenLegacy = (item: { label: string; source?: string }, partial: string): boolean =>
  (item.source === 'live' || item.source === 'catalog') && item.label.startsWith('__') && !partial.startsWith('_') && LEGACY_NAME.test(item.label);

function rank<T extends { label: string; group?: string; source?: string }>(items: T[], partial: string, recency?: RecencyScore): T[] {
  const ranked: Ranked<T>[] = [];
  let best = 0;
  items.forEach((item, index) => {
    if (hiddenLegacy(item, partial)) return;
    const match = rankMatch(partial, item.label);
    if (!match) return;
    if (match.tier > best) best = match.tier;
    ranked.push({ item, index, tier: match.tier, recent: match.tier && recency ? recency(item.label) || 0 : 0, source: item.source ? SOURCE_RANK[item.source] ?? 0 : 0 });
  });
  const floor = best >= 3 ? 3 : best;
  const buckets = new Map<string | undefined, Ranked<T>[]>([[undefined, []]]);
  for (const r of ranked) {
    if (r.tier < floor) continue;
    const bucket = buckets.get(r.item.group);
    if (bucket) bucket.push(r);
    else buckets.set(r.item.group, [r]);
  }
  return [...buckets.values()].flatMap((bucket) => bucket.sort(compareRanked).map((r) => r.item));
}

// A plain path (identifier root, `.name`, `[0]`, `["key"]`) ending the text.
const TRAILING_PATH = /(?:^|[^\w$.\]])([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\[\d+\]|\["(?:[^"\\]|\\.)*"\]|\['(?:[^'\\]|\\.)*'\])*)$/;

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

/** Whether the text ends inside a comment: a `//` line comment or an unclosed block comment. */
function inComment(text: string): boolean {
  const tokens = tokenize(text);
  const last = tokens[tokens.length - 1];
  if (!last || last.kind !== 'comment') return false;
  return last.text.startsWith('//') || last.text.length < 4 || !last.text.endsWith('*/');
}

/** Whether the caret sits inside an unclosed string. Comments are skipped, as in the highlighter. */
function inString(text: string): boolean {
  const tokens = tokenize(text);
  return isOpenString(tokens[tokens.length - 1]);
}

/**
 * The brackets still open at the end of `text`, walking the highlighter's tokens: brackets
 * inside strings and comments do not count, and only a trailing unclosed string puts the
 * caret inside a quote.
 */
function scanFrames(text: string): { stack: Frame[]; quote: '' | '"' | "'" | '`'; quoteAt: number } {
  const stack: Frame[] = [];
  let quote: '' | '"' | "'" | '`' = '';
  let quoteAt = -1;
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
  return { stack, quote, quoteAt };
}

function scanArgument(draft: string, caret: number): ArgScan | null {
  const text = String(draft ?? '').slice(0, Math.max(0, caret));
  const { stack, quote, quoteAt } = scanFrames(text);
  const skipSpace = (i: number) => { while (i < text.length && /\s/.test(text[i])) i++; return i; };
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

/* ------------------------- lambdas, owners, values ------------------------ */

type Scope = Record<string, unknown>;

/** Resolve a path: a lambda parameter in scope first, then a captured root. */
function lookup(path: PlainPath, roots: Record<string, unknown>, scope: Scope | null): { found: boolean; value: unknown } {
  if (scope && Object.prototype.hasOwnProperty.call(scope, path.root)) {
    return scope[path.root] === UNKNOWN ? { found: false, value: undefined } : resolvePath(path, scope);
  }
  if (!ROOT_NAME.test(path.root)) return { found: false, value: undefined };
  return resolvePath(path, roots || {});
}

/** The item shape of an array: its records merged (first non-null value per key), else its first item. */
function itemSample(items: unknown[]): unknown {
  if (!items.length) return undefined;
  let merged: Record<string, unknown> | null = null;
  const scanned = items.length > UNION_SCAN ? items.slice(0, UNION_SCAN) : items;
  for (const item of scanned) {
    if (!isRecord(item)) continue;
    // No prototype: a captured `__proto__` key stays an ordinary key.
    merged ??= Object.create(null) as Record<string, unknown>;
    for (const key of Object.keys(item)) {
      const current = merged[key];
      if (current === undefined || current === null) merged[key] = item[key];
    }
  }
  return merged ?? items[0];
}

// An arrow head opening an argument: `x =>` or `(params) =>` (no nested parentheses).
const ARROW_HEAD = /^\s*(?:(?:async\s+)?([A-Za-z_$][\w$]*)|(?:async\s*)?\(([^()]*)\))\s*=>/;
const IDENT_ONLY = /^[A-Za-z_$][\w$]*$/;
// An arrow parameter whose value is not known: it hides a captured root of the same name.
const UNKNOWN: unique symbol = Symbol('unknown');

/** The names an arrow head binds: plain, destructured or defaulted (`x`, `{id}`, `a = 1`); defaults' own names are skipped. */
function headParams(head: RegExpExecArray): { names: string[]; plain: (string | null)[] } {
  if (head[1]) return { names: [head[1]], plain: [head[1]] };
  const names: string[] = [];
  const plain: (string | null)[] = [];
  for (const part of head[2].split(',')) {
    const binding = part.split('=')[0].trim();
    plain.push(IDENT_ONLY.test(binding.replace(/^\.\.\./, '')) && !binding.startsWith('...') ? binding : null);
    for (const m of binding.matchAll(/[A-Za-z_$][\w$]*/g)) names.push(m[0]);
  }
  return { names, plain };
}

/**
 * The lambda parameters in scope at the end of `text`, outer to inner: each open
 * `<path>.map(u => …` (spec §3 source 5) whose path resolves — through captured roots or
 * an outer parameter — to an array binds its parameter to the array's item shape.
 */
function lambdaScope(text: string, stack: Frame[], roots: Record<string, unknown>): { scope: Scope; last: { param: string; sample: unknown } | null } {
  const scope: Scope = Object.create(null) as Scope;
  let last: { param: string; sample: unknown } | null = null;
  for (const frame of stack) {
    if (frame.ch !== '(') continue;
    // The argument the caret is in, when it is an arrow function: its parameters hide pins.
    const head = ARROW_HEAD.exec(text.slice(frame.argStarts[frame.argStarts.length - 1]));
    if (!head) continue;
    const { names, plain } = headParams(head);
    // The first argument of an array method binds the item shape (spec §3 source 5). The
    // callee resolves in the enclosing scope, before this head's own names hide anything.
    const bound = frame.argStarts.length === 1 ? itemBinding(text, frame, plain, roots, scope) : null;
    for (const name of names) scope[name] = UNKNOWN;
    if (!bound) continue;
    for (const param of bound.params) {
      scope[param] = bound.sample;
      last = { param, sample: bound.sample };
    }
  }
  return { scope, last };
}

/** The item shape and the parameters it binds for `<captured array path>.<method>(head =>`. */
function itemBinding(text: string, frame: Frame, plain: (string | null)[], roots: Record<string, unknown>, scope: Scope): { params: string[]; sample: unknown } | null {
  const before = text.slice(0, frame.start).replace(/\s+$/, '');
  const call = /\.([A-Za-z]+)$/.exec(before);
  if (!call || !(LAMBDA_METHODS.has(call[1]) || COMPARATORS.has(call[1]))) return null;
  // reduce's item is its second parameter; a comparator's are its first two.
  const params = (call[1] === 'reduce' ? [plain[1]] : COMPARATORS.has(call[1]) ? plain.slice(0, 2) : [plain[0]]).filter((p): p is string => !!p);
  if (!params.length) return null;
  const pm = TRAILING_PATH.exec(before.slice(0, call.index));
  const path = pm ? parseAnyPath(pm[1]) : null;
  if (!path) return null;
  const hit = lookup(path, roots, scope);
  if (!hit.found || !Array.isArray(hit.value)) return null;
  const sample = itemSample(hit.value);
  return sample === undefined ? null : { params, sample };
}

/**
 * G11: the innermost array-callback parameter open at the caret and its item shape
 * (`res.users.filter(u => u.` → `u` with the users' keys), or null.
 */
export function inferLambdaParam(draft: string, caret: number, roots: Record<string, unknown>): { param: string; sample: unknown } | null {
  const text = String(draft ?? '').slice(0, Math.max(0, caret));
  return lambdaScope(text, scanFrames(text).stack, roots || {}).last;
}

/**
 * The page expression each open lambda parameter stands for (`rows.filter(r =>` → `r` is
 * `rows[0]`), outer to inner; `null` for a parameter whose array is not a plain path. Used
 * only to ask the page (live completion) when captured data does not answer.
 */
function lambdaSources(text: string, stack: Frame[]): Map<string, string | null> {
  const sources = new Map<string, string | null>();
  for (const frame of stack) {
    if (frame.ch !== '(') continue;
    const head = ARROW_HEAD.exec(text.slice(frame.argStarts[frame.argStarts.length - 1]));
    if (!head) continue;
    const { names, plain } = headParams(head);
    let source: string | null = null;
    let params: string[] = [];
    const before = text.slice(0, frame.start).replace(/\s+$/, '');
    const call = frame.argStarts.length === 1 ? /\.([A-Za-z]+)$/.exec(before) : null;
    if (call && (LAMBDA_METHODS.has(call[1]) || COMPARATORS.has(call[1]))) {
      params = (call[1] === 'reduce' ? [plain[1]] : COMPARATORS.has(call[1]) ? plain.slice(0, 2) : [plain[0]]).filter((p): p is string => !!p);
      const pm = TRAILING_PATH.exec(before.slice(0, call.index));
      const path = pm ? parseAnyPath(pm[1]) : null;
      const base = path ? (sources.has(path.root) ? sources.get(path.root) ?? null : path.root) : null;
      if (path && base !== null) source = `${base}${formatPath('', path.segments)}[0]`;
    }
    for (const name of names) sources.set(name, null);
    for (const param of params) sources.set(param, source);
  }
  return sources;
}

/**
 * What to ask the page for at the caret (spec §3 source 4): the members of a plain path that
 * captured data does not answer (`appState.` → `appState`; `rows.filter(r => r.` → `rows[0]`),
 * or the page globals for a bare identifier (`expr: null`; `window.` too). Null when nothing
 * should be asked: captured roots and pins, a call result (it could have side effects — the
 * catalogue's return types answer those), strings, comments, numbers.
 */
export function liveRequestFor(draft: string, caret: number, roots: Record<string, unknown>): { expr: string | null } | null {
  const text = String(draft ?? '').slice(0, Math.max(0, caret));
  if (inComment(text) || inString(text)) return null;
  let from = text.length;
  while (from > 0 && /[\w$]/.test(text[from - 1])) from--;
  const partial = text.slice(from);
  const before = text.slice(0, from);
  if (before.endsWith('.')) {
    const pm = TRAILING_PATH.exec(before.slice(0, -1));
    const parsed = pm ? parseAnyPath(pm[1]) : null;
    if (!parsed) return null;
    const stack = scanFrames(text).stack;
    const { scope } = lambdaScope(text, stack, roots || {});
    if (lookup(parsed, roots || {}, scope).found) return null;
    const sources = lambdaSources(text, stack);
    if (sources.has(parsed.root)) {
      const source = sources.get(parsed.root);
      return source ? { expr: `${source}${formatPath('', parsed.segments)}` } : null;
    }
    if (ROOT_NAME.test(parsed.root) || Object.prototype.hasOwnProperty.call(roots || {}, parsed.root)) return null;
    if (GLOBAL_OBJECTS.has(parsed.root) && !parsed.segments.length) return { expr: null };
    return { expr: formatPath(parsed.root, parsed.segments) };
  }
  if (!partial || /^\d/.test(partial) || /["'`]$/.test(before)) return null;
  return { expr: null };
}

/** What the list says when the path stops at a getter (live completion never evaluates one). */
export const GETTER_NOTE = 'getter — not evaluated';

/** A page name as a suggestion: a callable inserts `name(` (caret inside), a class only after `new`. */
function liveSuggestion(n: LiveName, member: boolean, afterNew = false): Suggestion {
  const call = n.kind === 'function' || (n.kind === 'class' && afterNew);
  const kind: Suggestion['kind'] = n.kind === 'class' ? 'class' : n.kind === 'function' ? (member ? 'method' : 'function') : member ? 'property' : 'variable';
  // A built-in the catalogue does not list (`fetchLater`) ranks with the catalogue, never above it;
  // the page's own names rank above the catalogue (spec §3 source priority).
  const item: Suggestion = { label: n.name, insert: n.name, detail: n.kind === 'getter' ? 'getter' : n.own ? n.kind : 'inherited', kind, source: n.native ? 'catalog' : 'live' };
  if (n.params) item.signature = `${n.name}${n.params}`;
  if (call) {
    item.insert = `${n.name}(`;
    item.caret = n.name.length + 1;
  }
  return item;
}

// The page globals as suggestions, built once per answer (up to 5,000 names; fix round 2).
const globalsMemo: { list: LiveName[] | null; items: Suggestion[] }[] = [{ list: null, items: [] }, { list: null, items: [] }];
function globalSuggestions(list: LiveName[] | null | undefined, afterNew: boolean): Suggestion[] {
  if (!list) return [];
  const memo = globalsMemo[afterNew ? 1 : 0];
  if (memo.list !== list) {
    memo.list = list;
    memo.items = list.filter((n) => IDENT.test(n.name)).map((n) => liveSuggestion(n, false, afterNew));
  }
  return memo.items;
}

/** A declared name (spec §3 source 2): its declaration kind as the detail. */
function declaredSuggestion(d: DeclaredName, afterNew: boolean): Suggestion {
  const kind: Suggestion['kind'] = d.kind === 'function' ? 'function' : d.kind === 'class' ? 'class' : 'variable';
  const item: Suggestion = { label: d.name, insert: d.name, detail: d.kind, kind, source: 'declared' };
  if (d.kind === 'function' || (d.kind === 'class' && afterNew)) {
    item.insert = `${d.name}(`;
    item.caret = d.name.length + 1;
  }
  return item;
}

/** The live member suggestions for `expr` (null: the globals) — only when the page's answer is for that very path. */
function liveMembersFor(live: LiveKnowledge | undefined, expr: string | null): { items: Suggestion[]; type?: string; getter?: boolean } | null {
  if (!live) return null;
  if (expr === null) return live.globals ? { items: live.globals.filter((n) => IDENT.test(n.name)).map((n) => liveSuggestion(n, true)) } : null;
  const members = live.members;
  if (!members || members.expr !== expr) return null;
  return { items: members.names.filter((n) => IDENT.test(n.name)).map((n) => liveSuggestion(n, true)), type: members.type, getter: members.getter };
}

/**
 * The catalogue owner of a call's result (`document.querySelector('a')` → Element,
 * `fetch(u)` → Promise, `new URL(x)` → URL.prototype), from the catalogue's declared return
 * types only — a call is never evaluated for completion (ruling). Chains (`….closest('b')`).
 */
function callResultOwner(text: string, roots: Record<string, unknown>, depth = 0): string | null {
  const t = text.replace(/\s+$/, '');
  if (depth > 4 || !t.endsWith(')')) return null;
  const frames = scanFrames(t.slice(0, -1)).stack;
  const open = frames[frames.length - 1];
  if (!open || open.ch !== '(') return null;
  const callee = t.slice(0, open.start).replace(/\s+$/, '');
  const member = /^([\s\S]*)\.([A-Za-z_$][\w$]*)$/.exec(callee);
  let entry: CatalogEntry | undefined;
  if (member) {
    let owner: string | null;
    if (member[1].replace(/\s+$/, '').endsWith(')')) owner = callResultOwner(member[1], roots, depth + 1);
    else {
      const pm = TRAILING_PATH.exec(member[1]);
      const path = pm ? parseAnyPath(pm[1]) : null;
      const hit = path ? lookup(path, roots, null) : { found: false, value: undefined };
      owner = path ? (hit.found ? valueOwner(hit.value) : ROOT_NAME.test(path.root) ? null : catalogOwner(path)) : null;
    }
    entry = owner ? catalogMembers(owner).find((e) => e.name === member[2] && !!e.signature) : undefined;
  } else {
    const name = /(?:^|[^\w$.])([A-Za-z_$][\w$]*)$/.exec(callee);
    if (!name) return null;
    // `new URL(x)` is a URL: its prototype's members.
    if (/(?:^|[^\w$.])new\s+[A-Za-z_$][\w$]*$/.test(callee)) return catalogMembers(`${name[1]}.prototype`).length ? `${name[1]}.prototype` : null;
    entry = CATALOG_GLOBALS.find((e) => e.name === name[1] && !!e.signature);
  }
  return ownerOfType(entry?.returns);
}

/**
 * The catalogue owner of a plain path made of global names (`Object`, `document.body`,
 * `window.location`, `Array.prototype`), following the `returns` type of each property.
 */
function catalogOwner(path: PlainPath): string | null {
  const segs: PathSegment[] = [path.root, ...path.segments];
  let i = 0;
  while (i < segs.length - 1 && GLOBAL_OBJECTS.has(String(segs[i]))) i++;
  let owner = String(segs[i]);
  if (!catalogMembers(owner).length) {
    owner = ownerOfType(CATALOG_GLOBALS.find((e) => e.name === owner)?.returns) ?? '';
    if (!owner) return null;
  }
  for (const seg of segs.slice(i + 1)) {
    if (typeof seg !== 'string') return null;
    if (seg === 'prototype') {
      if (!catalogMembers(`${owner}.prototype`).length) return null;
      owner = `${owner}.prototype`;
      continue;
    }
    const entry = catalogMembers(owner).find((e) => e.name === seg && !e.signature);
    const next = ownerOfType(entry?.returns);
    if (!next) return null;
    owner = next;
  }
  return owner;
}

/** The prototype owner for a captured value's runtime type. */
function valueOwner(value: unknown): string | null {
  if (Array.isArray(value)) return 'Array.prototype';
  if (typeof value === 'string') return 'String.prototype';
  if (typeof value === 'number') return 'Number.prototype';
  return null;
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
// Keywords that are whole values; the rest (`typeof`, `new`, `await`, …) wait for an operand.
const VALUE_KEYWORDS = new Set(['true', 'false', 'null', 'undefined', 'this']);

/**
 * The text before the caret ends a complete token — a closed string, an operator, or a
 * number, identifier, value keyword or closing bracket followed by whitespace — so the
 * argument's value is already written (issue #5: `$status(res ` and `$status(true `).
 */
function endsComplete(text: string): boolean {
  const tokens = tokenize(text);
  let last = tokens[tokens.length - 1];
  // The tokenizer merges adjacent plain text, so `res ` is one token.
  if (last && last.kind === 'plain' && /[A-Za-z_$][\w$]*\s+$/.test(last.text)) return true;
  const spaced = !!last && last.kind === 'plain' && !last.text.trim();
  if (spaced) last = tokens[tokens.length - 2];
  if (!last) return false;
  if (last.kind === 'string') return !isOpenString(last);
  if (last.kind === 'number' || last.kind === 'regex') return spaced;
  if (last.kind === 'keyword') return spaced && VALUE_KEYWORDS.has(last.text);
  if (spaced && last.kind === 'punct' && (last.text === ')' || last.text === ']' || last.text === '}')) return true;
  return last.kind === 'punct' && OPERATOR.has(last.text);
}

function argumentValues(scan: ArgScan, text: string, caret: number, ctx: { roots: Record<string, unknown>; captured?: CapturedSummary; recency?: RecencyScore }): { from: number; items: Suggestion[] } | null {
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
    return { from, items: rank(keys, typed, ctx.recency).slice(0, MAX_SUGGESTIONS) };
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
    return { from, items: rank(items, typed, ctx.recency).slice(0, MAX_SUGGESTIONS) };
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
    return { from, items: rank(items, word, ctx.recency).slice(0, MAX_SUGGESTIONS) };
  }
  if (!ctx.captured) return { from, items: [] };
  const items = durationSuggestions(ctx.captured.durations);
  return { from, items: rank(items, word, ctx.recency).slice(0, MAX_SUGGESTIONS) };
}

/** A helper as a suggestion: a callable inserts `name(` (or `name()`) with the caret inside, on every path (bug 3). */
function helperSuggestion(h: HelperInfo, group?: string): Suggestion {
  const item: Suggestion = { label: h.name, insert: h.name, detail: h.description, kind: 'helper' };
  if (group) item.group = group;
  if (h.params) {
    item.insert = h.params.length ? `${h.name}(` : `${h.name}()`;
    item.caret = h.name.length + (h.params.length ? 1 : 2);
  }
  return item;
}

function browseItems(variables: string[], roots: Record<string, unknown>): Suggestion[] {
  const out: Suggestion[] = [];
  const seen = new Set<string>();
  for (const group of Object.keys(BROWSE_ORDER) as HelperGroup[]) {
    for (const name of BROWSE_ORDER[group]) {
      const h = HELPERS.find((x) => x.name === name);
      if (!h) continue;
      seen.add(name);
      out.push(helperSuggestion(h, group));
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
  ctx: { roots: Record<string, unknown>; variables: string[]; captured?: CapturedSummary; manual?: boolean; recency?: RecencyScore; live?: LiveKnowledge },
): { from: number; items: Suggestion[]; context: Context; note?: string } {
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

  // Nothing is offered while writing a comment.
  if (inComment(text)) return { from, items: [], context: 'none' };
  const scan = scanArgument(text, text.length);
  if (scan && (scan.quote || memberBase === null || scan.helper.params?.[scan.index]?.values === 'keys')) {
    const hit = argumentValues(scan, text, text.length, ctx);
    // No value matches an identifier being typed (`$status(r`): complete it as an identifier.
    if (hit && (hit.items.length || scan.quote || !partial || /^\d/.test(partial))) return { ...hit, context: 'argument' };
  }

  if (inString(text) && !(bracket && quote)) return { from, items: [], context: scan ? 'argument' : 'none' };

  if (memberBase !== null) {
    const none = { from, items: [] as Suggestion[], context: 'member' as Context };
    const listed = (items: Suggestion[]) => ({ from, items: rank(items, partial, ctx.recency).slice(0, MAX_MEMBERS), context: 'member' as Context });
    const pm = TRAILING_PATH.exec(memberBase);
    const parsed = pm ? parseAnyPath(pm[1]) : null;
    if (!parsed) {
      // A call's result: the catalogue's declared return type (never the page, ruling).
      const owner = bracket ? null : callResultOwner(memberBase, ctx.roots || {});
      return owner ? listed(catalogSuggestions(owner)) : none;
    }
    // A lambda parameter shadows a captured root of the same name (`a => a.`).
    const { scope } = lambdaScope(text, scanFrames(text).stack, ctx.roots || {});
    const hit = lookup(parsed, ctx.roots || {}, scope);
    const target = hit.value;
    if (!hit.found) {
      // Not captured data: a global from the static catalogue (`Object.`, `document.`), merged
      // with what the page answered for this very path (spec §3 source 4) — catalogue entries
      // keep their docs, the page adds the names the catalogue does not know.
      const shadowed = Object.prototype.hasOwnProperty.call(scope, parsed.root);
      let owner = bracket || shadowed || ROOT_NAME.test(parsed.root) ? null : catalogOwner(parsed);
      const target = bracket || !ctx.live ? null : liveRequestFor(draft, caret, ctx.roots || {});
      const page = target ? liveMembersFor(ctx.live, target.expr) : null;
      owner ??= ownerOfType(page?.type);
      const catalog = owner ? catalogSuggestions(owner) : [];
      const known = new Set(catalog.map((item) => item.label));
      const items = [...catalog, ...(page?.items ?? []).filter((item) => !known.has(item.label))];
      if (items.length) return listed(items);
      // The page stopped at an accessor: say so quietly instead of an empty silence (fix round 2).
      return page?.getter ? { ...none, note: GETTER_NOTE } : none;
    }
    if (!bracket) {
      if (Array.isArray(target)) return listed(arrayMembers(target, from));
      if (typeof target === 'string') return listed(stringMembers(target));
      const owner = valueOwner(target);
      if (owner) return listed(catalogSuggestions(owner));
    }
    if (!hit.found || target === null || typeof target !== 'object' || Array.isArray(target) || target instanceof LosslessNumber) return none;
    const props: Suggestion[] = [];
    for (const key of Object.keys(target)) {
      if (!bracket && !IDENT.test(key)) continue;
      const insert = bracket ? (quote ? `${escapeIn(key, quote)}${quote}]` : `${JSON.stringify(key)}]`) : key;
      props.push({ label: key, insert, detail: typeLabel((target as Record<string, unknown>)[key]), kind: 'property' });
    }
    return listed(props);
  }

  if (/["'`]/.test(before.slice(-1))) return { from, items: [], context: scan ? 'argument' : 'none' };
  if (!partial) {
    if (ctx.manual && (before === '' || /[\s=+\-*/%!&|?:<>(,;{^~]$/.test(before))) {
      return { from, items: browseItems(ctx.variables, ctx.roots), context: 'browse' };
    }
    return { from, items: [], context: scan ? 'argument' : 'none' };
  }
  if (/^\d/.test(partial)) return { from, items: [], context: scan ? 'argument' : 'none' };

  const candidates: Suggestion[] = HELPERS.map((h) => helperSuggestion(h));
  const seen = new Set(candidates.map((c) => c.label));
  const addVariable = (name: string, detail: string) => {
    if (seen.has(name)) return;
    seen.add(name);
    candidates.push({ label: name, insert: name, detail, kind: 'variable' });
  };
  for (const name of ctx.variables || []) addVariable(name, 'saved variable');
  for (const name of Object.keys(ctx.roots || {})) addVariable(name, typeLabel(ctx.roots[name]));
  const afterNew = /(?:^|[^\w$.])new\s+$/.test(before);
  const add = (item: Suggestion) => {
    if (seen.has(item.label)) return;
    seen.add(item.label);
    candidates.push(item);
  };
  // Names earlier commands declared (spec §3 source 2): they shadow the catalogue, as in the page.
  for (const d of ctx.live?.declared ?? []) if (IDENT.test(d.name)) add(declaredSuggestion(d, afterNew));
  // The static catalogue: globals, then keywords (identifier position only, never after `.`).
  for (const item of catalogIdentifiers(afterNew)) add(item);
  // The page's own globals (spec §3 source 4); a name the catalogue knows keeps its entry.
  for (const item of globalSuggestions(ctx.live?.globals, afterNew)) add(item);
  return { from, items: rank(candidates, partial, ctx.recency).slice(0, MAX_SUGGESTIONS), context: 'identifier' };
}

/* --------------------------------- Enter rule ------------------------------- */

/**
 * The end of the regex literal whose opening `/` is at `start`: the index after its closing
 * `/` and flags, or -1 when the line (or the text) ends first. A `/` inside a class `[…]`
 * or after a backslash does not close it. Whether a `/` opens a regex at all is the caller's call
 * (after a value it is division). Shared by `isCompleteCommand` and `tokenize`.
 */
function regexLiteralEnd(src: string, start: number): number {
  let inClass = false;
  for (let j = start + 1; j < src.length; j++) {
    const r = src[j];
    if (r === '\\') { if (src[j + 1] === '\n') return -1; j++; continue; }
    if (r === '\n') return -1;
    if (r === '[') inClass = true;
    else if (r === ']') inClass = false;
    else if (r === '/' && !inClass) {
      let end = j + 1;
      while (end < src.length && /[A-Za-z]/.test(src[end])) end++;
      return end;
    }
  }
  return -1;
}

// Keywords after which the command still needs more (`typeof `, `new`, `return`).
const CONTINUES = new Set(['typeof', 'new', 'await', 'async', 'in', 'of', 'instanceof', 'void', 'delete', 'return', 'const', 'let', 'var', 'function', 'class', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'throw', 'try', 'catch', 'finally', 'yield']);
const OPENER: Record<string, string> = { ')': '(', ']': '[', '}': '{' };

/**
 * Whether a draft reads as a finished command: something is written (a comment counts),
 * every bracket and `${` is closed, no string, template, regex literal or block comment
 * is left open, and it does not end on an operator, `.`, `,` or a keyword that needs an
 * operand. A `/` after a value is division, anywhere else it starts a regex literal (whose
 * brackets do not count). A cheap syntactic scan, not a parse.
 */
export function isCompleteCommand(draft: string): boolean {
  const src = String(draft ?? '');
  // '(' '[' '{' brackets, '${' a template expression, '`' template text.
  const stack: string[] = [];
  let last: 'none' | 'value' | 'op' | 'keyword' = 'none';
  let afterDot = false;
  let comment = false;
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (stack[stack.length - 1] === '`') {
      if (c === '\\') i += 2;
      else if (c === '`') { stack.pop(); last = 'value'; i++; }
      else if (c === '$' && src[i + 1] === '{') { stack.push('${'); last = 'op'; i += 2; }
      else i++;
      continue;
    }
    const next = src[i + 1];
    if (/\s/.test(c)) { i++; continue; }
    if (c === '/' && next === '/') {
      const end = src.indexOf('\n', i);
      i = end < 0 ? src.length : end;
      comment = true;
      continue;
    }
    if (c === '/' && next === '*') {
      const end = src.indexOf('*/', i + 2);
      if (end < 0) return false;
      i = end + 2;
      comment = true;
      continue;
    }
    const wasDot = afterDot;
    afterDot = false;
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < src.length && src[j] !== c && src[j] !== '\n') j += src[j] === '\\' ? 2 : 1;
      if (j >= src.length || src[j] !== c) return false;
      i = j + 1;
      last = 'value';
      continue;
    }
    if (c === '`') { stack.push('`'); i++; continue; }
    if (c === '/' && last !== 'value') {
      const end = regexLiteralEnd(src, i);
      if (end < 0) return false;
      i = end;
      last = 'value';
      continue;
    }
    if (c === '(' || c === '[' || c === '{') { stack.push(c); last = 'op'; i++; continue; }
    if (c === ')' || c === ']' || c === '}') {
      const open = stack.pop();
      i++;
      if (c === '}' && open === '${') continue; // back in the template's text
      if (open !== OPENER[c]) return false;
      last = 'value';
      continue;
    }
    const word = /^[A-Za-z_$][\w$]*/.exec(src.slice(i, i + 64));
    if (word) {
      let end = i + word[0].length;
      while (end < src.length && /[\w$]/.test(src[end])) end++;
      const name = src.slice(i, end);
      last = !wasDot && CONTINUES.has(name) ? 'keyword' : 'value';
      i = end;
      continue;
    }
    const num = /^(?:0[xX][\da-fA-F_]+|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?n?|\.\d[\d_]*)/.exec(src.slice(i, i + 64));
    if (num && /[\d.]/.test(c)) { i += num[0].length; last = 'value'; continue; }
    if (c === ';') { last = 'value'; i++; continue; }
    // Postfix `x++` / `x--` leaves a value; anywhere else they are operators.
    if ((c === '+' || c === '-') && next === c && last === 'value') { i += 2; continue; }
    if (c === '.') afterDot = true;
    last = 'op';
    i++;
  }
  if (stack.length) return false;
  if (last === 'none') return comment;
  return last === 'value';
}

/**
 * Issue #5 / spec §3: whether Enter accepts the active suggestion instead of running.
 * Never without a list. A selection moved with ↑/↓ accepts. Otherwise the list takes
 * Enter only while the token under the caret is still being completed: an `exact` token
 * (supplied by the editor: it already equals a suggestion's name) is finished whatever the
 * rest of the draft, and `$` alone (the `$`-helper list) is a name in its own right — page
 * jQuery, unless it is a member or index position (`res.$` → `$ref`) — so both run
 * (collapsed) or break the line (expanded). A `guess` — the active suggestion is a
 * catalogue name offered for a bare identifier — never takes Enter either: the typed
 * name may be a page global the catalogue does not know (`big` is not `BigInt(`).
 */
export function shouldEnterAccept(state: { listOpen: boolean; navigated: boolean; draft: string; caret: number; exact?: boolean; guess?: boolean }): boolean {
  if (!state.listOpen) return false;
  if (state.navigated) return true;
  if (state.exact || state.guess) return false;
  const text = String(state.draft ?? '').slice(0, Math.max(0, state.caret));
  const token = /[\w$]*$/.exec(text)?.[0] ?? '';
  if (token !== '$') return true;
  // A member or index `$` (`res.$`, `x['$`) is the start of a key such as `$ref`: accept.
  return /(?:\.|\[["'`]?)$/.test(text.slice(0, text.length - 1));
}

/**
 * Whether the active suggestion is a catalogue *guess* for a bare identifier, which never
 * takes Enter (Task 4): the typed name may be a page global the catalogue does not know
 * (`big` is not `BigInt(`). Once the page's globals are known (Task 7 ruling) it is a guess
 * only while the typed token is one of them or a declared name — `fet` + Enter then accepts `fetch(`.
 */
export function catalogGuess(item: Pick<Suggestion, 'source'> | undefined, context: string | undefined, token: string, live?: LiveKnowledge | null): boolean {
  if (context !== 'identifier' || item?.source !== 'catalog') return false;
  // Stale (a Run since), partial or capped globals are unknown (fix round 1, review Important 1).
  if (!live?.globals || live.complete !== true) return true;
  return live.globals.some((n) => n.name === token) || (live.declared ?? []).some((d) => d.name === token);
}

/* ------------------------------ signature hint ----------------------------- */

/** Top-level parameters of a signature (`fetch(input, init?)` → `input`, `init?`); callback shapes stay whole. */
function signatureParams(signature: string): HelperParam[] {
  const inner = signature.slice(signature.indexOf('(') + 1, -1);
  const out: HelperParam[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i <= inner.length; i++) {
    const c = inner[i];
    if (c === '(' || c === '[' || c === '{') depth++;
    else if (c === ')' || c === ']' || c === '}') depth--;
    else if ((c === ',' && depth === 0) || i === inner.length) {
      const name = inner.slice(start, i).trim();
      if (name) out.push({ name, description: '' });
      start = i + 1;
    }
  }
  return out;
}

/**
 * The signature hint at the caret (spec §3, G10): an XRAY helper, a catalogue global
 * (`fetch(`, `new URL(`), a catalogue member (`JSON.stringify(`, `document.querySelector(`)
 * or a method of a captured value by its runtime type (`res.users.map(`, with `roots`).
 */
export function signatureAt(
  draft: string,
  caret: number,
  roots: Record<string, unknown> = {},
  live?: LiveKnowledge | null,
): { name: string; signature: string; description: string; params: HelperParam[]; index: number } | null {
  const a = scanArgument(draft, caret);
  if (a) return { name: a.helper.name, signature: a.helper.signature, description: a.helper.description, params: a.helper.params ?? [], index: a.index };
  const text = String(draft ?? '').slice(0, Math.max(0, caret));
  const { stack } = scanFrames(text);
  // The innermost call we know; an unknown inner call (`fetch(foo(a, `) defers to the enclosing one.
  for (let open = stack.length - 1; open >= 0; open--) {
    if (stack[open].ch !== '(') continue;
    const hint = callHint(text, stack, open, roots || {}, live);
    if (hint) return hint;
  }
  return null;
}

type Hint = { name: string; signature: string; description: string; params: HelperParam[]; index: number };

function callHint(text: string, stack: Frame[], open: number, roots: Record<string, unknown>, live?: LiveKnowledge | null): Hint | null {
  const call = stack[open];
  const index = call.argStarts.length - 1;
  const pm = TRAILING_PATH.exec(text.slice(0, call.start).replace(/\s+$/, ''));
  const path = pm ? parseAnyPath(pm[1]) : null;
  if (!path) return null;
  let entry: CatalogEntry | undefined;
  if (!path.segments.length) {
    const h = HELPERS.find((x) => x.name === path.root);
    if (h?.params) return { name: h.name, signature: h.signature, description: h.description, params: h.params, index };
    entry = CATALOG_GLOBALS.find((e) => e.name === path.root);
    // A page function (spec §3): its parameter list from its source, as live completion read it.
    const page = entry ? undefined : live?.globals?.find((n) => n.name === path.root && n.kind === 'function' && n.params);
    if (page?.params) entry = { name: page.name, kind: 'function', signature: `${page.name}${page.params}`, doc: 'Page function' };
  } else {
    const name = path.segments[path.segments.length - 1];
    if (typeof name !== 'string') return null;
    const base: PlainPath = { root: path.root, segments: path.segments.slice(0, -1) };
    const { scope } = lambdaScope(text, stack.slice(0, open), roots);
    const hit = lookup(base, roots, scope);
    const shadowed = Object.prototype.hasOwnProperty.call(scope, base.root);
    const owner = hit.found ? valueOwner(hit.value) : shadowed || ROOT_NAME.test(base.root) ? null : catalogOwner(base);
    entry = owner ? catalogMembers(owner).find((e) => e.name === name) : undefined;
  }
  if (!entry?.signature) return null;
  const params = signatureParams(entry.signature);
  // Past the last parameter of a rest list (`Math.max(1, 2, `) the rest parameter stays active.
  const rest = params.length && params[params.length - 1].name.startsWith('...') && index >= params.length;
  return { name: entry.name, signature: entry.signature, description: entry.doc, params, index: rest ? params.length - 1 : index };
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

/**
 * A one-line hint under an error. Did-you-mean (`x is not defined`) searches the helpers and
 * `known`: the names earlier commands declared and the page globals live completion has seen.
 */
export function errorHint(message: string, command: string, hasRequest: boolean, known: readonly string[] = []): string | null {
  const msg = String(message ?? '');
  const cmd = String(command ?? '');
  if (/SyntaxError|Unexpected (?:token|end of|identifier|string|number)|Invalid or unexpected token|missing \) after/i.test(msg)) {
    return 'Check brackets and quotes. Shift+Enter adds a new line.';
  }
  if (!hasRequest && /(?:^|[^\w$.])(?:res|req)\b/.test(cmd)) return 'No request selected. Pick one above.';
  if (/serialize a BigInt|mix BigInt and other types/i.test(msg)) {
    return 'Integers past 2^53 are BigInt here (9007199254740993n): use copy(x) to copy them, Number(x) or String(x) to convert.';
  }
  if (/Cannot read propert(?:y|ies) of (?:undefined|null)/i.test(msg) && /^\s*res\./.test(cmd)) {
    return 'res is the response body itself. Try Object.keys(res).';
  }
  const undef = /([A-Za-z_$][\w$]*) is not defined/.exec(msg);
  if (undef) {
    const word = undef[1];
    let best = '';
    let bestDist = Infinity;
    for (const name of [...known, ...HELPERS.map((h) => h.name)]) {
      const d = editDistance(word.toLowerCase(), name.toLowerCase());
      if (d < bestDist) { bestDist = d; best = name; }
    }
    if (best && bestDist > 0 && bestDist <= 2 && bestDist < word.length) return `Did you mean \`${best}\`?`;
  }
  return null;
}

/* --------------------------------- starters -------------------------------- */

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof LosslessNumber);
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

/**
 * Whether a `/` after these tokens is division (it follows a value) rather than the start of
 * a regex literal: after an identifier, number, string, regex, value keyword, `)`, `]`, `}`
 * or a postfix `++`/`--`. The same call `isCompleteCommand` makes.
 */
function afterValue(out: Token[], end = out.length): boolean {
  let t = end - 1;
  // Comments and whitespace in between do not count.
  while (t >= 0 && (out[t].kind === 'comment' || (out[t].kind === 'plain' && !out[t].text.trim()))) t--;
  const last = out[t];
  if (!last) return false;
  // Plain text merges identifiers, spaces and stray characters: an identifier (non-ASCII
  // letters included) at its end is a value; a backslash, `#` or `@` is not.
  if (last.kind === 'plain') return /[\w$\u0080-\uffff]$/.test(last.text.trimEnd());
  if (last.kind === 'number' || last.kind === 'string' || last.kind === 'regex') return true;
  if (last.kind === 'keyword') return !CONTINUES.has(last.text);
  if (last.text === ')' || last.text === ']' || last.text === '}') return true;
  // Postfix `x++` / `x--`: the pair follows a value.
  if ((last.text === '+' || last.text === '-') && out[t - 1]?.kind === 'punct' && out[t - 1].text === last.text) return afterValue(out, t - 1);
  return false;
}

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
    if (ch === '/' && next !== '/' && next !== '*' && !afterValue(out)) {
      // A regex literal; one still being typed runs to the end of its line.
      let j = regexLiteralEnd(src, i);
      if (j < 0) { j = src.indexOf('\n', i); if (j < 0) j = src.length; }
      push('regex', src.slice(i, j));
      i = j;
    } else if (ch === '/' && next === '/') {
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
