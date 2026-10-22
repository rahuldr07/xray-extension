import type { XrayEntry } from '../types';
import { preview } from '../utils';
import { LosslessNumber } from './jsonText';
import { TreeBranch, TreeLeaf, type TreeChild, type TreeTone } from './treeDisplay';

/*
 * The typed log model (spec J7): the stable form content/console-capture.js emits,
 * content/content.js checks and rebuilds, the store keeps, persistence and Session JSON
 * carry unchanged, and this module renders. It is JSON-safe end to end.
 *
 * A log entry that has `logArgCount` (an integer >= 0) holds typed values: with one
 * argument `logData` is that value, otherwise it is the list of arguments, so
 * console.log([1,2,3]) and console.log(1,2,3) stay distinct. `objectRefs[i]` is the
 * "Load full object" handle of argument `objectRefArgs[i]`.
 *
 * A value is JSON. Strings, finite numbers, booleans, null, arrays and plain objects are
 * themselves. Every other value is an envelope, an object with the reserved key "$xray":
 *   {"$xray":"undefined"}
 *   {"$xray":"number","value":"NaN"|"Infinity"|"-Infinity"|"-0"}
 *   {"$xray":"bigint","value":"<decimal digits, optional leading ->"}        exact
 *   {"$xray":"function","name":"<name>"}                                       "" when anonymous
 *   {"$xray":"symbol","description":"<description>"}
 *   {"$xray":"date","iso":"<ISO 8601>"|null}                                   null: Invalid Date
 *   {"$xray":"dom","text":"<tag#id.class>"}
 *   {"$xray":"circular"}                                                       a cycle back to an ancestor
 *   {"$xray":"unreadable"}                                                     a getter or proxy refused, or BigInt
 *                                                                              digits past the character budget
 *   {"$xray":"depth","type"?:"array"|"object","class"?:s,"length"?:n}          not expanded (depth or budget)
 *   {"$xray":"string","value":"<prefix>","length":n}                           a string cut to its prefix
 *   {"$xray":"array","items":[…],"length":n}                                   an array cut to its first items
 *   {"$xray":"object","class"?:s,"entries":[[key,value],…],"omitted"?:n}       a class instance, an object cut
 *        to its first keys, or an object that itself has the "$xray" key (listed, so it
 *        reads as data: the escape that makes the encoding unforgeable)
 *   {"$xray":"map","size":n,"entries":[[key,value],…]}                         first entries
 *   {"$xray":"set","size":n,"values":[…]}                                      first values
 *   {"$xray":"error","name":s,"message":s,"stack"?:s,"entries"?:[…],"omitted"?:n,"cause"?:value,
 *        "getters"?:["name"|"message"|"stack"]}                                 page accessors, never read
 *   {"$xray":"typedarray","type":"Uint8Array"|…|"ArrayBuffer"|"DataView","length":n,"values"?:[…]}
 *
 * Console results add (shared/console-helpers.js encodeResult, console round 2 — the Logs never
 * emit these; `function` and `dom` gain optional fields, so a Logs envelope stays valid):
 *   {"$xray":"function","name":s,"params":s,"async":b,"kind":"function"|"class"|"arrow"|"native",
 *        "source"?:s,"wrappedByXray"?:true}                                   source: first 4,000 chars
 *   {"$xray":"dom","tag":s,"id":s,"classes":[s],"attrs":[[name,value]],"text":s,"children":[dom],"more":n}
 *        a snapshot: text content (200 chars), child elements (50, three levels), `more` left out
 *   {"$xray":"web","cls":"Response"|"Headers"|…,"fields":{…},"entries"?:[[k,v],…],"size"?:n}
 *   {"$xray":"promise","state":"fulfilled"|"rejected"|"pending","value"?:value}
 *   {"$xray":"instance","cls":s,"entries":[[key,value],…],"omitted"?:n,"getters":[name,…]}
 *        an object with accessors (cls "" when plain): its own data entries and its accessors' names,
 *        own and inherited — never their values
 *   {"$xray":"accessor"}                                                       an accessor member, never read: "(…)"
 *
 * Bounds belong to the encoder (per console call: values and characters; per value: depth,
 * items, string and key length); a cut is metadata (`length`, `size`, `omitted`, a `string`
 * or `depth` envelope), never in-band text. content.js checks in the same units with
 * higher limits, so it passes the encoder's output unchanged.
 *
 * No logged value can produce an envelope: the encoder lists any object that has a "$xray"
 * key as an `object` envelope. "__type__" and "__xray_ref__" are ordinary keys here, and no
 * marker is ever added to a value. Entries without `logArgCount` predate the model
 * (persisted or imported sessions, hand-built entries) and are read from their historical
 * shapes by decodeLegacyLogValue.
 */

export const LOG_TYPE_KEY = '$xray';

export type LogKind =
  | 'undefined' | 'number' | 'bigint' | 'function' | 'symbol' | 'date' | 'dom' | 'circular' | 'unreadable'
  | 'depth' | 'string' | 'array' | 'object' | 'map' | 'set' | 'error' | 'typedarray' | 'web' | 'promise' | 'instance' | 'accessor';

const KINDS = new Set<string>([
  'undefined', 'number', 'bigint', 'function', 'symbol', 'date', 'dom', 'circular', 'unreadable',
  'depth', 'string', 'array', 'object', 'map', 'set', 'error', 'typedarray', 'web', 'promise', 'instance', 'accessor',
]);

/** What LogDetail shows: nothing, one value, or a list of arguments. */
export type LogPayload =
  | { kind: 'empty'; label: string }
  | { kind: 'value'; value: unknown }
  | { kind: 'args'; values: unknown[] };

export interface LogErrorInfo {
  name: string;
  message: string;
  stack: string;
  /** One-line text of the cause, when the Error has one. */
  cause?: string;
}

type Bag = Record<string, unknown>;

const MAX_TEXT_DEPTH = 32;
const MAX_DISPLAY_DEPTH = 64;
const REPEAT_KEY_CHARS = 4_000;

function has(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function own(value: object, key: string): unknown {
  return has(value, key) ? (value as Bag)[key] : undefined;
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

function define(target: Bag, key: string, value: unknown): void {
  // defineProperty, so an own "__proto__" key stays data instead of a prototype.
  Object.defineProperty(target, key, { value, enumerable: true, configurable: true, writable: true });
}

function functionName(fn: unknown): string {
  try {
    const name = (fn as { name?: unknown }).name;
    return typeof name === 'string' ? name : '';
  } catch {
    return '';
  }
}

/** The envelope's kind, or null when the value is not a typed value. */
export function logKind(value: unknown): LogKind | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  if (value instanceof TreeLeaf || value instanceof TreeBranch) return null;
  const kind = own(value, LOG_TYPE_KEY);
  return typeof kind === 'string' && KINDS.has(kind) ? (kind as LogKind) : null;
}

/**
 * Whether a console argument has more to show than its one line: a plain object or array,
 * or a typed container (Map, Set, Error, a cut array or object, a typed array with values).
 * A typed scalar (`10n`, `undefined`, `ƒ f()`) does not, as a native value never did.
 */
export function logHasDetail(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const kind = logKind(value);
  if (kind === null) return true;
  if (kind === 'typedarray') return Array.isArray(own(value, 'values'));
  if (kind === 'web') return own(value, 'cls') !== 'RegExp';
  // A pending promise has nothing but its state: `Promise {<pending>}` is all there is.
  if (kind === 'promise') return has(value, 'value');
  return kind === 'array' || kind === 'object' || kind === 'map' || kind === 'set' || kind === 'error' || kind === 'instance';
}

function record(value: unknown): Bag {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Bag) : {};
}

/** An accessor an instance lists by name only: its value was never read. */
const LAZY: unique symbol = Symbol('lazy accessor');

/** An instance's own entries, then its accessors (LAZY). */
function instanceMembers(value: Bag): Array<[string, unknown]> {
  const entries = pairs(own(value, 'entries')).map(([key, item]): [string, unknown] => [String(key), item]);
  const getters = list(own(value, 'getters')).filter((name): name is string => typeof name === 'string');
  return [...entries, ...getters.map((name): [string, unknown] => [name, LAZY])];
}

/** A console-result envelope's `fields` as [key, value] pairs, in order. */
function fieldPairs(value: Bag): Array<[string, unknown]> {
  const fields = record(own(value, 'fields'));
  return Object.keys(fields).map((key): [string, unknown] => [key, fields[key]]);
}

/** `<div#app.main>`: a snapshot's tag, id and classes; a Logs envelope's own text. */
export function domLabel(value: Bag): string {
  const tag = own(value, 'tag');
  if (typeof tag !== 'string') return str(own(value, 'text'), '<element>');
  const id = str(own(value, 'id'));
  const classes = list(own(value, 'classes')).filter((name): name is string => typeof name === 'string');
  return `<${tag}${id ? '#' + id : ''}${classes.map((name) => '.' + name).join('')}>`;
}

/**
 * A function's one line, the same in text, Copy and the collapsed preview: `ƒ f(a, b = 1)`,
 * `async ƒ load(url)`, `(a) => {…}`, `class Foo`, `ƒ fetch() [native code]`, `ƒ fetch() — wrapped by XRAY`.
 */
export function functionLabel(value: Bag): string {
  const name = str(own(value, 'name'));
  const params = str(own(value, 'params'));
  const kind = own(value, 'kind');
  if (own(value, 'wrappedByXray') === true) return `ƒ ${name}() — wrapped by XRAY`;
  if (kind === 'class') return `class ${name || 'anonymous'}`;
  if (kind === 'native') return `ƒ ${name}() [native code]`;
  const prefix = own(value, 'async') === true ? 'async ' : '';
  if (kind === 'arrow') return `${prefix}(${params}) => {…}`;
  return `${prefix}ƒ ${name || 'anonymous'}(${params})`;
}

/** `/ab+c/gi` from a RegExp projection. */
export function regexpLabel(value: Bag): string {
  const fields = record(own(value, 'fields'));
  return `/${str(own(fields, 'source'), '(?:)')}/${str(own(fields, 'flags'))}`;
}

/** Whether the entry's logData is in the typed model (rather than a pre-model shape). */
export function isTypedLog(entry: Pick<XrayEntry, 'logArgCount'>): boolean {
  const value = entry.logArgCount;
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function typedNumber(value: number): unknown {
  if (Number.isFinite(value) && !Object.is(value, -0)) return value;
  return { [LOG_TYPE_KEY]: 'number', value: Object.is(value, -0) ? '-0' : String(value) };
}

// ── Legacy shapes ──────────────────────────────────────────────────────────────
// What console-capture.js emitted before the model: `__xray_ref__` on top-level previews,
// `{__type__:'Error'|'Date'|'Map'|'Set'|'table'|<class>, …}`, "[Function: name]",
// "[...]", "[Circular]", "... +N more" array tails, "+N more keys", "... (N chars)"
// string tails, native NaN/-0/BigInt/undefined at the top level, and Task 1's interim
// `{__type__:'function', name}`. Only entries without logArgCount are read this way: in
// the model, those keys and strings are the user's data.
const LEGACY_FUNCTION = /^\[Function: ([\s\S]*)\]$/;
const LEGACY_MORE_ITEMS = /^\.\.\. \+(\d+) more$/;
const LEGACY_MORE_KEYS = /^\+(\d+) more keys$/;
const LEGACY_LONG_STRING = /^([\s\S]{500})\.\.\. \((\d+) chars\)$/;
const LEGACY_DROPPED = new Set(['__xray_ref__', '__type__']);

function legacyString(value: string): unknown {
  const fn = LEGACY_FUNCTION.exec(value);
  if (fn) return { [LOG_TYPE_KEY]: 'function', name: fn[1] === 'anonymous' ? '' : fn[1] };
  if (value === '[...]') return { [LOG_TYPE_KEY]: 'depth' };
  if (value === '[Circular]') return { [LOG_TYPE_KEY]: 'circular' };
  if (value === '[Error accessing property]' || value === '[Error copying]') return { [LOG_TYPE_KEY]: 'unreadable' };
  const long = LEGACY_LONG_STRING.exec(value);
  if (long) return { [LOG_TYPE_KEY]: 'string', value: long[1], length: Number(long[2]) };
  return value;
}

/** A pre-model value (persisted or imported sessions, hand-built entries) in the typed model. */
export function decodeLegacyLogValue(value: unknown): unknown {
  return legacy(value, 0, []);
}

function legacyEntries(record: Bag, keys: string[], depth: number, seen: object[]): Array<[string, unknown]> {
  return keys.map((key) => [key, legacy(record[key], depth + 1, seen)]);
}

function legacy(value: unknown, depth: number, seen: object[]): unknown {
  switch (typeof value) {
    case 'string': return legacyString(value);
    case 'number': return typedNumber(value);
    case 'boolean': return value;
    case 'undefined': return { [LOG_TYPE_KEY]: 'undefined' };
    case 'bigint': return { [LOG_TYPE_KEY]: 'bigint', value: String(value) };
    case 'symbol': return { [LOG_TYPE_KEY]: 'symbol', description: String(value).slice(7, -1) };
    case 'function': return { [LOG_TYPE_KEY]: 'function', name: functionName(value) };
    default: break;
  }
  if (value === null) return null;
  const object = value as object;
  if (depth > MAX_DISPLAY_DEPTH) return { [LOG_TYPE_KEY]: 'depth' };
  if (seen.includes(object)) return { [LOG_TYPE_KEY]: 'circular' };
  seen.push(object);
  try {
    return legacyObject(object, depth, seen);
  } finally {
    seen.pop();
  }
}

function legacyObject(value: object, depth: number, seen: object[]): unknown {
  if (Array.isArray(value)) {
    const last = value[value.length - 1];
    const more = typeof last === 'string' ? LEGACY_MORE_ITEMS.exec(last) : null;
    const items = (more ? value.slice(0, -1) : value).map((item) => legacy(item, depth + 1, seen));
    return more ? { [LOG_TYPE_KEY]: 'array', items, length: items.length + Number(more[1]) } : items;
  }
  const tag = Object.prototype.toString.call(value);
  if (tag === '[object Date]') {
    const time = (value as Date).getTime();
    return { [LOG_TYPE_KEY]: 'date', iso: Number.isNaN(time) ? null : new Date(time).toISOString() };
  }
  if (tag === '[object Map]') {
    const map = value as Map<unknown, unknown>;
    return { [LOG_TYPE_KEY]: 'map', size: map.size, entries: Array.from(map, ([key, item]) => [legacy(key, depth + 1, seen), legacy(item, depth + 1, seen)]) };
  }
  if (tag === '[object Set]') {
    const set = value as Set<unknown>;
    return { [LOG_TYPE_KEY]: 'set', size: set.size, values: Array.from(set, (item) => legacy(item, depth + 1, seen)) };
  }
  if (value instanceof Error) {
    return { [LOG_TYPE_KEY]: 'error', name: str(value.name, 'Error'), message: str(value.message), ...(typeof value.stack === 'string' ? { stack: value.stack } : {}) };
  }
  const record = value as Bag;
  // Old captures never made envelopes: an own "$xray" key is the page's data, listed (the
  // encoder's escape) so it can never read as a typed value.
  if (has(record, LOG_TYPE_KEY)) {
    return { [LOG_TYPE_KEY]: 'object', entries: legacyEntries(record, Object.keys(record), depth, seen) };
  }
  const type = own(record, '__type__');
  const moreKeys = LEGACY_MORE_KEYS.exec(str(own(record, '...')));
  const keys = Object.keys(record).filter((key) => !LEGACY_DROPPED.has(key) && !(moreKeys && key === '...'));
  const omitted = moreKeys ? Number(moreKeys[1]) : 0;
  if (typeof type === 'string') {
    if (type === 'Error') {
      const rest = keys.filter((key) => key !== 'name' && key !== 'message' && key !== 'stack');
      const stack = own(record, 'stack');
      return {
        [LOG_TYPE_KEY]: 'error', name: str(own(record, 'name'), 'Error'), message: str(own(record, 'message')),
        ...(typeof stack === 'string' ? { stack } : {}),
        ...(rest.length ? { entries: legacyEntries(record, rest, depth, seen) } : {}),
      };
    }
    if (type === 'Date') {
      const iso = own(record, 'iso');
      return { [LOG_TYPE_KEY]: 'date', iso: typeof iso === 'string' && iso !== 'Invalid Date' ? iso : null };
    }
    if (type === 'function') return { [LOG_TYPE_KEY]: 'function', name: str(own(record, 'name')) };
    if (type === 'table') return legacy(own(record, 'data'), depth + 1, seen);
    // Map and Set previews never carried their contents.
    if ((type === 'Map' || type === 'Set') && keys.length === 0) return { [LOG_TYPE_KEY]: 'depth', type: 'object', class: type };
    return { [LOG_TYPE_KEY]: 'object', class: type, entries: legacyEntries(record, keys, depth, seen), ...(omitted ? { omitted } : {}) };
  }
  if (omitted) return { [LOG_TYPE_KEY]: 'object', entries: legacyEntries(record, keys, depth, seen), omitted };
  const out: Bag = {};
  for (const key of keys) define(out, key, legacy(record[key], depth + 1, seen));
  return out;
}

// ── Arguments ──────────────────────────────────────────────────────────────────
const argsCache = new WeakMap<object, unknown[]>();

/**
 * The console arguments of a log entry as typed values. Pre-model entries are decoded
 * (and an array there is the argument list, as it always was, unless it carries the old
 * array preview's "... +N more" tail).
 */
export function logArgs(entry: XrayEntry): unknown[] {
  const cached = argsCache.get(entry);
  if (cached) return cached;
  let args: unknown[];
  if (isTypedLog(entry)) {
    if (entry.logArgCount === 1) args = [entry.logData];
    else args = Array.isArray(entry.logData) ? entry.logData : entry.logData === undefined ? [] : [entry.logData];
  } else if (Array.isArray(entry.args)) {
    args = entry.args.map(decodeLegacyLogValue);
  } else if (Array.isArray(entry.logData)) {
    const decoded = decodeLegacyLogValue(entry.logData);
    args = Array.isArray(decoded) ? decoded : [decoded];
  } else if (entry.logData === null) {
    args = [null];
  } else {
    args = [decodeLegacyLogValue(entry.logData ?? entry.message ?? '')];
  }
  argsCache.set(entry, args);
  return args;
}

/** What LogDetail shows for the entry. */
export function logPayload(entry: XrayEntry): LogPayload {
  if (isTypedLog(entry)) {
    const args = logArgs(entry);
    if (entry.logArgCount === 1) return { kind: 'value', value: args[0] };
    return args.length ? { kind: 'args', values: args } : { kind: 'empty', label: 'No arguments' };
  }
  const data = entry.logData !== undefined ? entry.logData : entry.args ?? entry.message ?? null;
  if (data == null) return { kind: 'empty', label: 'No log payload' };
  return { kind: 'value', value: decodeLegacyLogValue(data) };
}

/**
 * The payload with each loaded full object in its argument's place. A handle that
 * answered null (the page no longer holds the object) keeps its preview.
 */
export function logPayloadWithFull(entry: XrayEntry, resolved: readonly unknown[]): LogPayload {
  const refs = Array.isArray(entry.objectRefs) ? entry.objectRefs : [];
  const positions = entry.objectRefArgs;
  if (isTypedLog(entry) && Array.isArray(positions) && positions.length === refs.length) {
    const args = logArgs(entry).slice();
    positions.forEach((at, index) => {
      if (resolved[index] != null && at >= 0 && at < args.length) args[at] = resolved[index];
    });
    return entry.logArgCount === 1 ? { kind: 'value', value: args[0] } : { kind: 'args', values: args };
  }
  // Without positions (a pre-model or degraded entry): the loaded objects themselves. An
  // answer is always in the typed model (content.js rebuilds it), whatever the entry's age.
  return { kind: 'value', value: resolved.length === 1 ? resolved[0] : [...resolved] };
}

// ── Text ───────────────────────────────────────────────────────────────────────
class TextOut {
  private readonly parts: string[] = [];
  private size = 0;
  private readonly limit: number;

  constructor(limit: number) {
    this.limit = limit;
  }

  get full(): boolean {
    return this.size > this.limit;
  }

  push(text: string): void {
    if (this.full) return;
    this.parts.push(text);
    this.size += text.length;
  }

  text(): string {
    const text = this.parts.join('');
    return text.length > this.limit ? text.slice(0, this.limit) + '…' : text;
  }
}

function depthText(value: Bag): string {
  const type = own(value, 'type');
  const cls = str(own(value, 'class'));
  const length = count(own(value, 'length'));
  if (type === 'array') return length === undefined ? '[…]' : `Array(${length})`;
  if (type === 'object') {
    if (!cls) return '{…}';
    return length === undefined ? `${cls} {…}` : `${cls}(${length}) {…}`;
  }
  return '…';
}

function writeList(items: readonly unknown[], out: TextOut, depth: number, separator: string): void {
  items.forEach((item, index) => {
    if (index) out.push(separator);
    writeText(item, out, false, depth + 1);
  });
}

function writeTyped(kind: LogKind, value: Bag, out: TextOut, top: boolean, depth: number): void {
  switch (kind) {
    case 'undefined': out.push('undefined'); return;
    case 'number': out.push(str(own(value, 'value'), 'NaN')); return;
    case 'bigint': out.push(`${str(own(value, 'value'), '0')}n`); return;
    case 'function': out.push(functionLabel(value)); return;
    case 'symbol': out.push(`Symbol(${str(own(value, 'description'))})`); return;
    case 'date': out.push(typeof own(value, 'iso') === 'string' ? str(own(value, 'iso')) : 'Invalid Date'); return;
    case 'dom': out.push(domLabel(value)); return;
    case 'circular': out.push('[Circular]'); return;
    case 'accessor': out.push('(…)'); return;
    case 'web':
    case 'instance': {
      if (kind === 'web' && own(value, 'cls') === 'RegExp') { out.push(regexpLabel(value)); return; }
      const cls = str(own(value, 'cls'), 'Object');
      const entries = own(value, 'entries');
      if (kind === 'web' && Array.isArray(entries)) {
        const items = pairs(entries);
        out.push(`${cls}(${Math.max(count(own(value, 'size')) ?? items.length, items.length)}) {`);
        items.forEach(([key, item], index) => {
          if (index) out.push(', ');
          writeText(key, out, false, depth + 1);
          out.push(' => ');
          writeText(item, out, false, depth + 1);
        });
        out.push('}');
        return;
      }
      out.push(kind === 'instance' && !str(own(value, 'cls')) ? '{' : `${cls} {`);
      const members: Array<[string, unknown]> = kind === 'instance' ? instanceMembers(value) : fieldPairs(value);
      members.forEach(([key, item], index) => {
        if (index) out.push(',');
        out.push(`${JSON.stringify(key)}:`);
        if (item === LAZY) out.push('(…)');
        else writeText(item, out, false, depth + 1);
      });
      if (kind === 'instance' && (count(own(value, 'omitted')) ?? 0) > 0) out.push(`${members.length ? ',' : ''}…${count(own(value, 'omitted'))} more`);
      out.push('}');
      return;
    }
    case 'promise': {
      const state = str(own(value, 'state'), 'pending');
      out.push(`Promise {<${state}>`);
      if (has(value, 'value') && state !== 'pending') {
        out.push(': ');
        writeText(own(value, 'value'), out, false, depth + 1);
      }
      out.push('}');
      return;
    }
    case 'unreadable': out.push('[unreadable]'); return;
    case 'depth': out.push(depthText(value)); return;
    case 'string': {
      const text = str(own(value, 'value'));
      out.push(top ? `${text}…` : `${JSON.stringify(text).slice(0, -1)}…"`);
      return;
    }
    case 'array': {
      const items = list(own(value, 'items'));
      const more = (count(own(value, 'length')) ?? items.length) - items.length;
      out.push('[');
      writeList(items, out, depth, ',');
      if (more > 0) out.push(`${items.length ? ',' : ''}…${more} more`);
      out.push(']');
      return;
    }
    case 'object': {
      const cls = str(own(value, 'class'));
      const entries = pairs(own(value, 'entries'));
      const omitted = count(own(value, 'omitted')) ?? 0;
      out.push(cls ? `${cls} {` : '{');
      entries.forEach(([key, item], index) => {
        if (index) out.push(',');
        out.push(`${JSON.stringify(String(key))}:`);
        writeText(item, out, false, depth + 1);
      });
      if (omitted > 0) out.push(`${entries.length ? ',' : ''}…${omitted} more`);
      out.push('}');
      return;
    }
    case 'map':
    case 'set': {
      const isMap = kind === 'map';
      const items = isMap ? pairs(own(value, 'entries')) : list(own(value, 'values'));
      const size = Math.max(count(own(value, 'size')) ?? items.length, items.length);
      out.push(`${isMap ? 'Map' : 'Set'}(${size}) {`);
      items.forEach((item, index) => {
        if (index) out.push(', ');
        if (isMap) {
          const [key, entryValue] = item as [unknown, unknown];
          writeText(key, out, false, depth + 1);
          out.push(' => ');
          writeText(entryValue, out, false, depth + 1);
        } else {
          writeText(item, out, false, depth + 1);
        }
      });
      if (size > items.length) out.push(items.length ? ', …' : '…');
      out.push('}');
      return;
    }
    case 'error': {
      const name = str(own(value, 'name'), 'Error');
      const message = str(own(value, 'message'));
      out.push(message ? `${name}: ${message}` : name);
      return;
    }
    case 'typedarray': {
      const type = str(own(value, 'type'), 'TypedArray');
      const length = count(own(value, 'length')) ?? 0;
      out.push(`${type}(${length})`);
      const values = own(value, 'values');
      if (!Array.isArray(values)) return;
      out.push(' [');
      writeList(values, out, depth, ',');
      if (length > values.length) out.push(values.length ? ',…' : '…');
      out.push(']');
      return;
    }
  }
}

function writeText(value: unknown, out: TextOut, top: boolean, depth: number): void {
  if (out.full) return;
  if (depth > MAX_TEXT_DEPTH) { out.push('…'); return; }
  switch (typeof value) {
    case 'string': out.push(top ? value : JSON.stringify(value)); return;
    case 'number': out.push(Object.is(value, -0) ? '-0' : String(value)); return;
    case 'boolean': out.push(String(value)); return;
    case 'undefined': out.push('undefined'); return;
    case 'bigint': out.push(`${value}n`); return;
    case 'symbol': out.push(String(value)); return;
    case 'function': out.push(`ƒ ${functionName(value) || 'anonymous'}()`); return;
    default: break;
  }
  if (value === null) { out.push('null'); return; }
  if (value instanceof TreeLeaf) { out.push(value.text); return; }
  const kind = logKind(value);
  if (kind) { writeTyped(kind, value as Bag, out, top, depth); return; }
  if (Array.isArray(value)) {
    out.push('[');
    writeList(value, out, depth, ',');
    out.push(']');
    return;
  }
  out.push('{');
  Object.keys(value as object).forEach((key, index) => {
    if (out.full) return;
    if (index) out.push(',');
    out.push(`${JSON.stringify(key)}:`);
    writeText((value as Bag)[key], out, false, depth + 1);
  });
  out.push('}');
}

/**
 * One line of text for a value: `10n`, `NaN`, `-0`, `undefined`, `ƒ name()`,
 * `Symbol(desc)`, `Map(3) {"k" => 1, …}`, `TypeError: boom`; plain data as compact JSON.
 * `top` writes a string as it is (a console argument), else quoted. Past `limit`
 * characters the text ends with "…".
 */
export function logValueText(value: unknown, options: { top?: boolean; limit?: number } = {}): string {
  const out = new TextOut(options.limit ?? 10_000);
  writeText(value, out, options.top ?? false, 0);
  return out.text();
}

/** Console arguments as the console prints them: each one as text, separated by spaces. */
export function logArgsText(args: readonly unknown[], limit = 600): string {
  const out = new TextOut(limit);
  args.forEach((arg, index) => {
    if (index) out.push(' ');
    writeText(arg, out, true, 0);
  });
  return out.text();
}

/**
 * A log row's text: its message when it has one, else its arguments. Never throws: a
 * value that cannot be read (only a hand-built one can) falls back to the old preview.
 */
export function logEntryText(entry: XrayEntry, limit = 240): string {
  if (typeof entry.message === 'string') return preview(entry.message, limit);
  try {
    return logArgsText(logArgs(entry), limit);
  } catch {
    return preview(entry.logData, limit);
  }
}

const SEARCH_TERM_DEPTH = 6;
const SEARCH_TERMS_PER_LEVEL = 50;

/**
 * Words a search must find that a value's one-line text leaves out or may cut: the keys of a plain
 * object, the keys an object envelope lists and a Map's string keys — and the same inside array
 * items, Set values, Map keys and values and object values. An Error prints only "Name: message", so
 * its listed properties come with their values ("code: E_OUTER") and its `cause` with its own text
 * ("Error: inner failure") and keys.
 */
function collectSearchTerms(value: unknown, terms: string[], depth: number): void {
  if (depth > SEARCH_TERM_DEPTH || !value || typeof value !== 'object') return;
  const kind = logKind(value);
  if (kind === null) {
    if (Array.isArray(value)) {
      for (const item of value.slice(0, SEARCH_TERMS_PER_LEVEL)) collectSearchTerms(item, terms, depth + 1);
      return;
    }
    for (const key of Object.keys(value).slice(0, SEARCH_TERMS_PER_LEVEL)) {
      terms.push(key);
      collectSearchTerms((value as Bag)[key], terms, depth + 1);
    }
    return;
  }
  const bag = value as Bag;
  if (kind === 'object' || kind === 'error' || kind === 'map') {
    for (const [key, item] of pairs(own(bag, 'entries')).slice(0, SEARCH_TERMS_PER_LEVEL)) {
      if (typeof key === 'string') terms.push(kind === 'error' ? `${key}: ${logValueText(item, { top: true, limit: 200 })}` : key);
      else collectSearchTerms(key, terms, depth + 1);
      collectSearchTerms(item, terms, depth + 1);
    }
  }
  const items = kind === 'array' ? own(bag, 'items') : kind === 'set' ? own(bag, 'values') : null;
  for (const item of list(items).slice(0, SEARCH_TERMS_PER_LEVEL)) collectSearchTerms(item, terms, depth + 1);
  if (kind === 'error' && has(bag, 'cause')) {
    const cause = own(bag, 'cause');
    terms.push(logValueText(cause, { top: true, limit: 200 }));
    collectSearchTerms(cause, terms, depth + 1);
  }
}

/**
 * The arguments' text for search haystacks (the message is indexed on its own), followed by the keys
 * inside typed values (collectSearchTerms), each part at most `limit` characters. Never throws.
 */
export function logSearchText(entry: XrayEntry, limit = 240): string {
  if (entry.type !== 'log') return preview(entry.logData, limit);
  try {
    const args = logArgs(entry);
    const text = logArgsText(args, limit);
    const terms: string[] = [];
    for (const arg of args) collectSearchTerms(arg, terms, 0);
    let extra = '';
    for (const term of terms) {
      if (extra.length + term.length + 1 > limit) break;
      extra += (extra ? ' ' : '') + term;
    }
    return extra ? `${text} ${extra}` : text;
  } catch {
    return preview(entry.logData, limit);
  }
}

/**
 * Two consecutive logs repeat (Console ×N) only when their arguments are identical, value
 * and type: '1 2 3' and 1, 2, 3 read the same but are not. undefined when the arguments
 * are too large to compare cheaply (such logs merge on their message alone, as before).
 */
export function logRepeatKey(args: readonly unknown[]): string | undefined {
  // The replacer stops the walk as soon as the key would be too long (it throws), so a
  // log storm of large previews never serializes them whole.
  let budget = REPEAT_KEY_CHARS;
  try {
    const key = JSON.stringify(args, (name: string, value: unknown) => {
      budget -= name.length + (typeof value === 'string' ? value.length : 4);
      if (budget < 0) throw new RangeError('repeat key too long');
      return typeof value === 'bigint' ? `${value}n` : value;
    });
    return typeof key === 'string' && key.length <= REPEAT_KEY_CHARS ? key : undefined;
  } catch {
    return undefined;
  }
}

/** Copy raw for Console page-log arguments: their plain projection (typed values as text), never envelopes. */
export function logCopyValue(args: readonly unknown[]): unknown {
  return args.length === 1 ? logPlain(args[0], 'text') : args.map((arg) => logPlain(arg, 'text'));
}

/** Copy raw for a typed payload: its text, never the model's envelopes. */
export function logCopyText(payload: LogPayload): string {
  if (payload.kind === 'empty') return '';
  if (payload.kind === 'value') return logValueText(payload.value, { top: true, limit: 500_000 });
  return logArgsText(payload.values, 500_000);
}

// ── Display tree (JSON viewer) ─────────────────────────────────────────────────
function leaf(text: string, tone: TreeTone, hint?: string): TreeLeaf {
  return new TreeLeaf(text, tone, hint);
}

/** The tooltip of a lazy accessor's "(…)": its value was never read, so nothing can run. */
export const GETTER_HINT = 'Getter — not run, to avoid side effects';

function lazyLeaf(): TreeLeaf {
  return leaf('(…)', 'muted', GETTER_HINT);
}

/**
 * How the display tree is built. `console` is the Console's result Tree (spec §1, console round
 * 2): every container is a branch carrying its typed value (`source`, for its collapsed one-line
 * preview), Set entries have no indices, arrays past BUCKET_SIZE items are grouped in `[0 … 99]`
 * buckets, and a DOM snapshot or a function with source opens to its parts. The Logs and the
 * inspector build the plain tree.
 */
export interface DisplayOptions {
  console?: boolean;
}

const BUCKET_SIZE = 100;
// A bucket's key (React key and path) cannot collide with an index or a real key.
const BUCKET_KEY = '\u0000bucket';

/** A big array's children grouped by 100, each group keyed apart and labelled `[start … end]`. */
function bucketed(children: TreeChild[]): TreeChild[] {
  if (children.length <= BUCKET_SIZE) return children;
  const out: TreeChild[] = [];
  for (let start = 0; start < children.length; start += BUCKET_SIZE) {
    const slice = children.slice(start, start + BUCKET_SIZE);
    out.push({
      key: BUCKET_KEY + start,
      label: `[${start} … ${start + slice.length - 1}]`,
      value: new TreeBranch('array', '', slice, slice.length, { bucket: true }),
    });
  }
  return out;
}

/** A DOM snapshot's parts: its attributes, its text and its child elements (each again a node). */
function domDisplay(value: Bag, child: (item: unknown) => unknown): TreeBranch {
  const parts: Array<{ name: string; value: unknown }> = [];
  const attrs = pairs(own(value, 'attrs'));
  if (attrs.length) {
    const named = namedChildren(attrs.map(([name, item]) => ({ name: String(name), value: typeof item === 'string' ? item : child(item) })));
    parts.push({ name: 'attributes', value: new TreeBranch('object', '', named, named.length) });
  }
  const text = own(value, 'text');
  if (typeof text === 'string' && text) parts.push({ name: 'text', value: text });
  const kids = list(own(value, 'children'));
  const more = count(own(value, 'more')) ?? 0;
  if (kids.length || more) {
    parts.push({
      name: 'children',
      value: new TreeBranch('array', '', [...kids.map((item, index) => ({ key: index, value: child(item) })), ...moreChild(more)], kids.length + more),
    });
  }
  return new TreeBranch('object', domLabel(value), namedChildren(parts), parts.length, { closed: true });
}

// The "… N more" note after a cut container's children. Its key (a React key and path
// segment) cannot collide with a real key named "…".
const MORE_KEY = '\u0000more';

function moreChild(hidden: number): TreeChild[] {
  return hidden > 0 ? [{ key: MORE_KEY, label: '', value: leaf(`… ${hidden} more`, 'muted') }] : [];
}

/**
 * Named children keyed by their names when every name is unique (so a path reads `.code`, as it
 * does in the page), else by position (an Error's own "message" beside its message field, a forged
 * envelope that lists a key twice). The name is kept either way for display.
 */
function namedChildren(children: Array<{ name: string; value: unknown }>): TreeChild[] {
  const names = children.map((child) => child.name);
  const unique = new Set(names).size === names.length && !names.includes(MORE_KEY);
  return children.map((child, index) => ({ key: unique ? child.name : index, name: child.name, value: child.value }));
}

function typedDisplay(kind: LogKind, value: Bag, depth: number, seen: object[], options: DisplayOptions): unknown {
  const child = (item: unknown): unknown => display(item, depth + 1, seen, options);
  switch (kind) {
    case 'undefined': return leaf('undefined', 'null');
    case 'number': return leaf(str(own(value, 'value'), 'NaN'), 'number');
    case 'bigint': return leaf(`${str(own(value, 'value'), '0')}n`, 'number');
    case 'function': {
      const source = own(value, 'source');
      if (options.console && typeof source === 'string' && source) {
        return new TreeBranch('object', functionLabel(value), [{ key: 'source', label: '', value: leaf(source, 'source') }], 1, { closed: true, bare: true });
      }
      return leaf(logValueText(value), 'typed');
    }
    case 'dom':
      if (options.console && typeof own(value, 'tag') === 'string') return domDisplay(value, child);
      return leaf(logValueText(value), 'typed');
    case 'symbol':
    case 'date':
      return leaf(logValueText(value), 'typed');
    case 'web': {
      if (own(value, 'cls') === 'RegExp') return leaf(regexpLabel(value), 'typed');
      const cls = str(own(value, 'cls'), 'Object');
      const entries = own(value, 'entries');
      if (Array.isArray(entries)) {
        const items = pairs(entries);
        const size = Math.max(count(own(value, 'size')) ?? items.length, items.length);
        return new TreeBranch('object', `${cls}(${size})`, [
          ...items.map(([key, item], index) => ({ key: index, label: `${logValueText(key, { limit: 200 })} =>`, value: child(item) })),
          ...moreChild(size - items.length),
        ], size);
      }
      const fields = fieldPairs(value);
      return new TreeBranch('object', cls, namedChildren(fields.map(([name, item]) => ({ name, value: child(item) }))), fields.length);
    }
    case 'instance': {
      const members = instanceMembers(value);
      const omitted = count(own(value, 'omitted')) ?? 0;
      return new TreeBranch('object', str(own(value, 'cls')), [
        ...namedChildren(members.map(([name, item]) => ({ name, value: item === LAZY ? lazyLeaf() : child(item) }))),
        ...moreChild(omitted),
      ], members.length + omitted);
    }
    case 'promise': {
      const fields: Array<{ name: string; value: unknown }> = [{ name: '[[PromiseState]]', value: str(own(value, 'state'), 'pending') }];
      if (has(value, 'value')) fields.push({ name: '[[PromiseResult]]', value: child(own(value, 'value')) });
      return new TreeBranch('object', 'Promise', namedChildren(fields), fields.length);
    }
    case 'accessor':
      return lazyLeaf();
    case 'circular':
    case 'unreadable':
    case 'depth':
      return leaf(logValueText(value), 'muted');
    case 'string': {
      const text = str(own(value, 'value'));
      const length = count(own(value, 'length')) ?? text.length;
      return leaf(`${JSON.stringify(text).slice(0, -1)}…" (${length.toLocaleString('en-US')} chars)`, 'string');
    }
    case 'array': {
      const items = list(own(value, 'items'));
      const length = Math.max(count(own(value, 'length')) ?? items.length, items.length);
      const children = items.map((item, index): TreeChild => ({ key: index, value: child(item) }));
      return new TreeBranch('array', '', [...(options.console ? bucketed(children) : children), ...moreChild(length - items.length)], length);
    }
    case 'object': {
      const entries = pairs(own(value, 'entries'));
      const omitted = count(own(value, 'omitted')) ?? 0;
      return new TreeBranch('object', str(own(value, 'class')),
        [...namedChildren(entries.map(([key, item]) => ({ name: String(key), value: child(item) }))), ...moreChild(omitted)], entries.length + omitted);
    }
    case 'map': {
      const entries = pairs(own(value, 'entries'));
      const size = Math.max(count(own(value, 'size')) ?? entries.length, entries.length);
      return new TreeBranch('object', `Map(${size})`, [
        ...entries.map(([key, item], index) => ({ key: index, label: `${logValueText(key, { limit: 200 })} =>`, value: child(item) })),
        ...moreChild(size - entries.length),
      ], size);
    }
    case 'set': {
      const values = list(own(value, 'values'));
      const size = Math.max(count(own(value, 'size')) ?? values.length, values.length);
      // The console shows a Set's values without indices, as DevTools does.
      const label = options.console ? { label: '' } : {};
      return new TreeBranch('array', `Set(${size})`, [...values.map((item, index) => ({ key: index, ...label, value: child(item) })), ...moreChild(size - values.length)], size);
    }
    case 'error': {
      // Keyed by position: an Error's own "message", "stack" or "cause" property sits beside
      // the fields of the same name.
      // A page accessor for name, message or stack was never read: listed as "(…)" in its place.
      const lazy = list(own(value, 'getters')).filter((name): name is string => typeof name === 'string');
      const fields: Array<{ name: string; value: unknown }> = [];
      if (!lazy.includes('message')) fields.push({ name: 'message', value: str(own(value, 'message')) });
      const stack = own(value, 'stack');
      if (typeof stack === 'string') fields.push({ name: 'stack', value: stack });
      for (const name of lazy) fields.push({ name, value: lazyLeaf() });
      for (const [key, item] of pairs(own(value, 'entries'))) fields.push({ name: String(key), value: child(item) });
      if (has(value, 'cause')) fields.push({ name: 'cause', value: child(own(value, 'cause')) });
      const children = namedChildren(fields);
      // The "… N more" note sits after the listed entries, before the cause.
      const hidden = moreChild(count(own(value, 'omitted')) ?? 0);
      if (hidden.length) children.splice(has(value, 'cause') ? children.length - 1 : children.length, 0, ...hidden);
      return new TreeBranch('object', str(own(value, 'name'), 'Error'), children);
    }
    case 'typedarray': {
      const values = own(value, 'values');
      const type = str(own(value, 'type'), 'TypedArray');
      const length = count(own(value, 'length')) ?? 0;
      if (!Array.isArray(values)) return leaf(`${type}(${length})`, 'typed');
      return new TreeBranch('array', `${type}(${length})`, [...values.map((item, index) => ({ key: index, value: child(item) })), ...moreChild(length - values.length)], length);
    }
  }
}

function display(value: unknown, depth: number, seen: object[], options: DisplayOptions): unknown {
  switch (typeof value) {
    case 'string':
    case 'boolean':
      return value;
    case 'number': return Number.isFinite(value) && !Object.is(value, -0) ? value : leaf(Object.is(value, -0) ? '-0' : String(value), 'number');
    case 'undefined': return leaf('undefined', 'null');
    case 'bigint': return leaf(`${value}n`, 'number');
    case 'symbol': return leaf(String(value), 'typed');
    case 'function': return leaf(`ƒ ${functionName(value) || 'anonymous'}()`, 'typed');
    default: break;
  }
  if (value === null) return null;
  if (value instanceof TreeLeaf || value instanceof TreeBranch) return value;
  const object = value as object;
  if (depth > MAX_DISPLAY_DEPTH) return leaf('…', 'muted');
  if (seen.includes(object)) return leaf('[Circular]', 'muted');
  seen.push(object);
  try {
    const kind = logKind(object);
    if (kind) {
      const shown = typedDisplay(kind, object as Bag, depth, seen, options);
      // The console Tree previews a collapsed branch from the value it shows.
      return options.console && shown instanceof TreeBranch
        ? new TreeBranch(shown.kind, shown.label, shown.children, shown.count, { source: object, closed: shown.closed, bare: shown.bare })
        : shown;
    }
    if (Array.isArray(object)) {
      if (!options.console) return object.map((item) => display(item, depth + 1, seen, options));
      const children = object.map((item, index): TreeChild => ({ key: index, value: display(item, depth + 1, seen, options) }));
      return new TreeBranch('array', '', bucketed(children), object.length, { source: object });
    }
    if (options.console) {
      const keys = Object.keys(object);
      const named = namedChildren(keys.map((key) => ({ name: key, value: display((object as Bag)[key], depth + 1, seen, options) })));
      return new TreeBranch('object', '', named, keys.length, { source: object });
    }
    const out: Bag = {};
    for (const key of Object.keys(object)) define(out, key, display((object as Bag)[key], depth + 1, seen, options));
    return out;
  } finally {
    seen.pop();
  }
}

/**
 * The value the JSON viewer renders: plain JSON stays plain, typed values become display
 * nodes (`10n`, `ƒ load()`, `Map(3)` with `"k" =>` children, an Error with its cause).
 */
export function logDisplay(value: unknown, options: DisplayOptions = {}): unknown {
  return display(value, 0, [], options);
}

/** LogDetail's tree: one value as itself; several arguments under an "arguments" branch. */
export function logPayloadDisplay(payload: LogPayload): unknown {
  if (payload.kind === 'value') return logDisplay(payload.value);
  if (payload.kind === 'args') return new TreeBranch('array', 'arguments', payload.values.map((value, index) => ({ key: index, value: logDisplay(value) })));
  return null;
}

/** A Console log event's arguments as the stream's expanded row shows them. */
export function logArgsDisplay(args: readonly unknown[]): unknown {
  return args.length === 1 ? logDisplay(args[0]) : logPayloadDisplay({ kind: 'args', values: [...args] });
}

// ── Plain projections ──────────────────────────────────────────────────────────
// 'native': plain JS values: undefined, NaN, ±Infinity, -0 and BigInt become the JS values;
// a Map its [key, value] pairs.
// 'text': for share-safe export, which redacts by key and only takes JSON: every typed
// scalar becomes its text and a Map an object keyed by its keys, so redaction sees them.
// 'json': as 'text', except that what JSON can write exactly is written as a number — a BigInt
// as its digits and -0 as -0 (LosslessNumber) — for the Console's JSON view and Copy (spec J8).
// 'share': as 'text', except that an Error is its name alone, for the share-safe export (as before the
// typed model): its message, stack, own properties and cause are whatever the page put there — an
// HTTP client's response data, emails, tokens — so they are left out and counted in `omitted`.
type PlainMode = 'native' | 'text' | 'json' | 'share';

/** What a 'share' projection left out, for the export's omitted count. */
export interface PlainOmissions {
  omitted: number;
}

const BIGINT_DIGITS = /^-?\d+$/;

/** A JSON number lexeme for a BigInt's digits or -0, when the mode writes JSON numbers exactly. */
function jsonNumber(raw: string, mode: PlainMode): LosslessNumber | null {
  if (mode !== 'json' || !(raw === '-0' || BIGINT_DIGITS.test(raw))) return null;
  try {
    return new LosslessNumber(raw);
  } catch {
    return null;
  }
}

function plain(value: unknown, mode: PlainMode, depth: number, seen: object[], omissions?: PlainOmissions): unknown {
  if (value === null || typeof value !== 'object') {
    if (typeof value === 'string' || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value) && !Object.is(value, -0))) return value;
    if (mode === 'native') return value;
    if (typeof value === 'bigint' || Object.is(value, -0)) return jsonNumber(Object.is(value, -0) ? '-0' : String(value), mode) ?? logValueText(value);
    return logValueText(value);
  }
  if (depth > MAX_DISPLAY_DEPTH) return '…';
  if (seen.includes(value)) return '[Circular]';
  seen.push(value);
  try {
    return plainObject(value, mode, depth, seen, omissions);
  } finally {
    seen.pop();
  }
}

function plainObject(value: object, mode: PlainMode, depth: number, seen: object[], omissions?: PlainOmissions): unknown {
  const next = (item: unknown): unknown => plain(item, mode, depth + 1, seen, omissions);
  const record = (entries: Array<[unknown, unknown]>): Bag => {
    const out: Bag = {};
    for (const [key, item] of entries) define(out, typeof key === 'string' ? key : logValueText(key), next(item));
    return out;
  };
  const kind = logKind(value);
  if (!kind) {
    if (Array.isArray(value)) return value.map(next);
    return record(Object.keys(value).map((key) => [key, (value as Bag)[key]]));
  }
  const bag = value as Bag;
  switch (kind) {
    case 'undefined':
      return mode === 'native' ? undefined : 'undefined';
    case 'number':
      return mode === 'native' ? Number(str(own(bag, 'value'), 'NaN')) : jsonNumber(str(own(bag, 'value')), mode) ?? logValueText(bag);
    case 'bigint':
      if (mode === 'native') {
        try { return BigInt(str(own(bag, 'value'), '0')); } catch { return logValueText(bag); }
      }
      return jsonNumber(str(own(bag, 'value')), mode) ?? logValueText(bag);
    case 'string':
      return `${str(own(bag, 'value'))}…`;
    case 'array':
      return list(own(bag, 'items')).map(next);
    case 'object':
      return record(pairs(own(bag, 'entries')));
    case 'map':
      return mode === 'native' ? pairs(own(bag, 'entries')).map(([key, item]) => [next(key), next(item)]) : record(pairs(own(bag, 'entries')));
    case 'set':
      return list(own(bag, 'values')).map(next);
    case 'error': {
      if (mode === 'share') {
        if (omissions) {
          omissions.omitted += (has(bag, 'message') ? 1 : 0) + (typeof own(bag, 'stack') === 'string' ? 1 : 0)
            + pairs(own(bag, 'entries')).length + (has(bag, 'cause') ? 1 : 0);
        }
        return record([['name', str(own(bag, 'name'), 'Error')]]);
      }
      const out = record([['name', str(own(bag, 'name'), 'Error')], ['message', str(own(bag, 'message'))]]);
      if (typeof own(bag, 'stack') === 'string') define(out, 'stack', own(bag, 'stack'));
      for (const [key, item] of pairs(own(bag, 'entries'))) define(out, String(key), next(item));
      if (has(bag, 'cause')) define(out, 'cause', next(own(bag, 'cause')));
      return out;
    }
    case 'typedarray':
      return Array.isArray(own(bag, 'values')) ? list(own(bag, 'values')).map(next) : logValueText(bag);
    case 'web':
      if (own(bag, 'cls') === 'RegExp') return logValueText(bag);
      return Array.isArray(own(bag, 'entries')) ? record(pairs(own(bag, 'entries'))) : record(fieldPairs(bag));
    case 'instance':
      return record(instanceMembers(bag).map(([key, item]): [unknown, unknown] => [key, item === LAZY ? '(…)' : item]));
    case 'promise': {
      const out = record([['state', str(own(bag, 'state'), 'pending')]]);
      if (has(bag, 'value')) define(out, 'value', next(own(bag, 'value')));
      return out;
    }
    default:
      return logValueText(bag);
  }
}

/** A typed value as plain data: see the modes above. `omissions` counts what a 'share' projection left out. */
export function logPlain(value: unknown, mode: PlainMode = 'native', omissions?: PlainOmissions): unknown {
  return plain(value, mode, 0, [], omissions);
}

/** The typed Error a value is, or null. A plain object with error-like keys is not one. */
export function logErrorInfo(value: unknown): LogErrorInfo | null {
  if (logKind(value) !== 'error') return null;
  const bag = value as Bag;
  return {
    name: str(own(bag, 'name'), 'Error'),
    message: str(own(bag, 'message')),
    stack: str(own(bag, 'stack')),
    ...(has(bag, 'cause') ? { cause: logValueText(own(bag, 'cause'), { limit: 500 }) } : {}),
  };
}
