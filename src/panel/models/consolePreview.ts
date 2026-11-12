import { domLabel, functionLabel, logKind, regexpLabel } from './logValue';

/*
 * The DevTools-style one-line preview of a console value in the typed model (models/logValue.ts;
 * console round 2, spec §1). Used by collapsed results and by the eager preview under the prompt,
 * so it is pure: no DOM, no state, never throws on a typed value.
 *
 * Rules:
 *  - Top level: a container lists its first entries — `Array(500) [0, 1, 2, 3, 4, …]`,
 *    `{id: 1, name: 'Ada'}`, `Point {x: 1}`, `Response {status: 200, …}`, `Headers(2) {'a' => '1'}`,
 *    `Map(2) {'k' => 1}`, `Set(1) {1}`, `Promise {<fulfilled>: 5}`, `Uint8Array(3) [1, 2, 3]`.
 *  - At most PREVIEW_ITEMS (5) entries, and only whole entries while the line (with its closing
 *    `, …}`) stays within `max`; anything left out is one `…`.
 *  - Inside a container a value is short: strings single-quoted, `Array(n)`, `{…}`, a class name
 *    (`Response`, `Promise`), `Headers(n)`, `ƒ name`, `<div#app.main>`, `/ab+c/gi`.
 *  - Keys are bare when they are identifiers, else single-quoted.
 *  - Functions: logValue's functionLabel, shared with the text and Copy — `ƒ formatPrice(cents,
 *    currency = 'EUR')`, `async ƒ load(url)`, `(a) => {…}`, `class Foo`, `ƒ fetch() [native code]`,
 *    XRAY's wrapper `ƒ fetch() — wrapped by XRAY`.
 *  - Class instances list accessors by name, `Account {id: 7, x: (…)}` (their values are never read).
 *  - The whole line is never longer than `max` (default 120): a longer one is cut (never inside a
 *    surrogate pair) and ends in `…`.
 */

export const PREVIEW_MAX = 120;
export const PREVIEW_ITEMS = 5;

type Bag = Record<string, unknown>;

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

function own(value: object, key: string): unknown {
  return Object.prototype.hasOwnProperty.call(value, key) ? (value as Bag)[key] : undefined;
}

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function count(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : undefined;
}

function list(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function pairs(value: unknown): Array<[unknown, unknown]> {
  return list(value).filter((pair): pair is [unknown, unknown] => Array.isArray(pair) && pair.length === 2);
}

function record(value: unknown): Bag {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Bag) : {};
}

function quote(text: string): string {
  return `'${JSON.stringify(text).slice(1, -1).replace(/\\"/g, '"').replace(/'/g, "\\'")}'`;
}

function keyText(key: string): string {
  return IDENTIFIER.test(key) ? key : quote(key);
}

/** `head{a, b, …}` with whole entries while the line fits in `max`, at most PREVIEW_ITEMS of them. */
function listed(head: string, open: string, close: string, pieces: string[], total: number, max: number): string {
  let text = head + open;
  let shown = 0;
  for (const piece of pieces.slice(0, PREVIEW_ITEMS)) {
    const next = text + (shown ? ', ' : '') + piece;
    const more = shown + 1 < total;
    if ((next + (more ? ', …' : '') + close).length > max) break;
    text = next;
    shown += 1;
  }
  if (shown < total) text += (shown ? ', ' : '') + '…';
  return text + close;
}

function errorText(value: Bag): string {
  const name = str(own(value, 'name'), 'Error');
  const message = str(own(value, 'message'));
  return message ? `${name}: ${message}` : name;
}

function dateText(value: Bag): string {
  const local = own(value, 'local');
  if (typeof local === 'string') return local;
  const iso = own(value, 'iso');
  return typeof iso === 'string' ? iso : 'Invalid Date';
}

/** Whether a `web` value lists entries (Headers, URLSearchParams, FormData) rather than fields. */
function webEntries(value: Bag): boolean {
  return Array.isArray(own(value, 'entries'));
}

function webSize(value: Bag): number {
  const entries = pairs(own(value, 'entries'));
  return Math.max(count(own(value, 'size')) ?? entries.length, entries.length);
}

function scalarText(value: unknown): string | null {
  switch (typeof value) {
    case 'string': return quote(value);
    case 'number': return Object.is(value, -0) ? '-0' : String(value);
    case 'boolean': return String(value);
    case 'undefined': return 'undefined';
    case 'bigint': return `${value}n`;
    case 'symbol': return String(value);
    case 'function': return 'ƒ';
    default: return value === null ? 'null' : null;
  }
}

/** A value inside a container. */
function short(value: unknown): string {
  const scalar = scalarText(value);
  if (scalar !== null) return scalar;
  if (Array.isArray(value)) return `Array(${value.length})`;
  const bag = value as Bag;
  const kind = logKind(value);
  switch (kind) {
    case null: return '{…}';
    case 'object': return str(own(bag, 'class')) || '{…}';
    case 'array': return `Array(${count(own(bag, 'length')) ?? list(own(bag, 'items')).length})`;
    case 'web': {
      const cls = str(own(bag, 'cls'), 'Object');
      if (cls === 'RegExp') return regexpLabel(bag);
      return webEntries(bag) ? `${cls}(${webSize(bag)})` : cls;
    }
    case 'instance': return str(own(bag, 'cls')) || '{…}';
    case 'promise': return 'Promise';
    case 'function': {
      if (own(bag, 'kind') === 'class') return `class ${str(own(bag, 'name'))}`.trim();
      const name = str(own(bag, 'name'));
      return name ? `ƒ ${name}` : 'ƒ';
    }
    case 'map': return `Map(${count(own(bag, 'size')) ?? 0})`;
    case 'set': return `Set(${count(own(bag, 'size')) ?? 0})`;
    case 'typedarray': return `${str(own(bag, 'type'), 'TypedArray')}(${count(own(bag, 'length')) ?? 0})`;
    case 'depth': {
      if (own(bag, 'type') === 'array') return count(own(bag, 'length')) === undefined ? '[…]' : `Array(${count(own(bag, 'length'))})`;
      return str(own(bag, 'class')) || '{…}';
    }
    default: return typed(kind, bag);
  }
}

/** Typed values that read the same at the top level and inside a container. */
function typed(kind: string, value: Bag): string {
  switch (kind) {
    case 'undefined': return 'undefined';
    case 'number': return str(own(value, 'value'), 'NaN');
    case 'bigint': return `${str(own(value, 'value'), '0')}n`;
    case 'symbol': return `Symbol(${str(own(value, 'description'))})`;
    case 'date': return dateText(value);
    case 'dom': return domLabel(value);
    case 'error': return errorText(value);
    case 'circular': return '[Circular]';
    case 'accessor': return '(…)';
    case 'unreadable': return '[unreadable]';
    case 'string': return `${quote(str(own(value, 'value'))).slice(0, -1)}…'`;
    case 'function': return functionLabel(value);
    default: return '…';
  }
}

function fieldPieces(entries: Array<[unknown, unknown]>): string[] {
  return entries.map(([key, item]) => `${keyText(String(key))}: ${short(item)}`);
}

function arrowPieces(entries: Array<[unknown, unknown]>): string[] {
  return entries.map(([key, item]) => `${short(key)} => ${short(item)}`);
}

function top(value: unknown, max: number): string {
  const scalar = scalarText(value);
  if (scalar !== null) return typeof value === 'function' ? 'ƒ anonymous()' : scalar;
  if (Array.isArray(value)) return listed(`Array(${value.length}) `, '[', ']', value.map(short), value.length, max);
  const bag = value as Bag;
  const kind = logKind(value);
  switch (kind) {
    case null: {
      const keys = Object.keys(bag);
      return listed('', '{', '}', fieldPieces(keys.map((key) => [key, bag[key]])), keys.length, max);
    }
    case 'array': {
      const items = list(own(bag, 'items'));
      const length = Math.max(count(own(bag, 'length')) ?? items.length, items.length);
      return listed(`Array(${length}) `, '[', ']', items.map(short), length, max);
    }
    case 'object': {
      const entries = pairs(own(bag, 'entries'));
      const cls = str(own(bag, 'class'));
      return listed(cls ? `${cls} ` : '', '{', '}', fieldPieces(entries), entries.length + (count(own(bag, 'omitted')) ?? 0), max);
    }
    case 'web': {
      const cls = str(own(bag, 'cls'), 'Object');
      const fields = record(own(bag, 'fields'));
      if (cls === 'RegExp') return regexpLabel(bag);
      if (webEntries(bag)) return listed(`${cls}(${webSize(bag)}) `, '{', '}', arrowPieces(pairs(own(bag, 'entries'))), webSize(bag), max);
      const entries = Object.keys(fields).map((key): [string, unknown] => [key, fields[key]]);
      return listed(`${cls} `, '{', '}', fieldPieces(entries), entries.length, max);
    }
    case 'instance': {
      // Own entries, then accessors by name only: their values were never read (DevTools' lazy (…)).
      const entries = pairs(own(bag, 'entries'));
      const getters = list(own(bag, 'getters')).filter((name): name is string => typeof name === 'string');
      const pieces = [...fieldPieces(entries), ...getters.map((name) => `${keyText(name)}: (…)`)];
      const total = pieces.length + (count(own(bag, 'omitted')) ?? 0);
      const cls = str(own(bag, 'cls'));
      return listed(cls ? `${cls} ` : '', '{', '}', pieces, total, max);
    }
    case 'promise': {
      const state = str(own(bag, 'state'), 'pending');
      return Object.prototype.hasOwnProperty.call(bag, 'value') && state !== 'pending'
        ? `Promise {<${state}>: ${short(own(bag, 'value'))}}`
        : `Promise {<${state}>}`;
    }
    case 'map': {
      const entries = pairs(own(bag, 'entries'));
      const size = Math.max(count(own(bag, 'size')) ?? entries.length, entries.length);
      return listed(`Map(${size}) `, '{', '}', arrowPieces(entries), size, max);
    }
    case 'set': {
      const values = list(own(bag, 'values'));
      const size = Math.max(count(own(bag, 'size')) ?? values.length, values.length);
      return listed(`Set(${size}) `, '{', '}', values.map(short), size, max);
    }
    case 'typedarray': {
      const type = str(own(bag, 'type'), 'TypedArray');
      const length = count(own(bag, 'length')) ?? 0;
      const values = own(bag, 'values');
      return Array.isArray(values) ? listed(`${type}(${length}) `, '[', ']', values.map(short), length, max) : `${type}(${length})`;
    }
    case 'depth': return short(value);
    default: return typed(kind, bag);
  }
}

/** A typed console value as one DevTools-style line of at most `max` (120) characters. */
export function previewLine(value: unknown, opts: { max?: number } = {}): string {
  const max = Math.max(1, Math.floor(opts.max ?? PREVIEW_MAX));
  let text: string;
  try {
    text = top(value, max);
  } catch {
    text = '…';
  }
  if (text.length <= max) return text;
  let kept = max - 1;
  // Never end on the first half of a surrogate pair (an emoji cut in two).
  const code = text.charCodeAt(kept - 1);
  if (kept > 0 && code >= 0xd800 && code <= 0xdbff) kept -= 1;
  return text.slice(0, kept) + '…';
}
