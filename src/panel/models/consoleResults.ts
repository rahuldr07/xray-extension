import type { XrayEntry } from '../types';
import { entryRequest, entryResponse, safeStringify } from '../utils';
import { LosslessNumber } from './jsonText';
import { LOG_TYPE_KEY, logKind, logPlain, logValueText } from './logValue';

/*
 * Console command results (spec J8). A result is the typed log model (models/logValue.ts): plain
 * JSON, with every value JSON cannot hold as a "$xray" envelope — 10n, NaN, -0, undefined, Map,
 * Set, Error, a cut array or string — exactly as the page serialized it (shared/console-helpers.js
 * encodeResult). This module describes, lays out and projects such values; it never shows an
 * envelope. It also encodes the other direction: a body value from the lossless parser as the
 * typed value the page revives (an integer past 2^53 becomes a BigInt there).
 */

export type ResultKind = 'scalar' | 'text' | 'table' | 'tree';

export interface ResultDescription {
  kind: ResultKind;
  badge: string;
  big: boolean;
  bytes: number;
  count: number | null;
  summary: string;
  columns: string[];
  /** A console cap, stated ("Showing 1,000 of 5,000 items"); null when the value is whole. */
  notice: string | null;
}

export const BIG_ITEM_LIMIT = 50;
export const BIG_BYTES_LIMIT = 20 * 1024;
export const TEXT_CHAR_LIMIT = 120;
export const TABLE_MAX_COLUMNS = 12;
export const TABLE_SAMPLE = 20;
export const TABLE_MAX_ROWS = 100;
/** The JSON view's text is cut here (a view, never stored); Copy takes more. */
export const RESULT_JSON_LIMIT = 200_000;
const COPY_LIMIT = 2_000_000;
const SUMMARY_LIMIT = 80;

type Bag = Record<string, unknown>;

/**
 * Console size label ("25 kb"). Deliberately not the shared utils.formatBytes,
 * which renders "25.0kb" and is used by the Network-style size columns.
 */
export function formatResultBytes(n: number): string {
  const bytes = Number(n) || 0;
  if (bytes >= 1024 * 1024) return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} mb`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} kb`;
  return `${bytes} b`;
}

function own(value: object, key: string): unknown {
  return Object.prototype.hasOwnProperty.call(value, key) ? (value as Bag)[key] : undefined;
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

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

const thousands = (n: number): string => n.toLocaleString('en-US');

function isPlainObject(value: unknown): value is Bag {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/** An array result's items with its whole length: a plain array, or a cut array's first items. */
function arrayView(value: unknown): { items: unknown[]; length: number } | null {
  if (Array.isArray(value)) return { items: value, length: value.length };
  if (logKind(value) !== 'array') return null;
  const items = list(own(value as object, 'items'));
  return { items, length: Math.max(count(own(value as object, 'length')) ?? items.length, items.length) };
}

/** An object result's members: a plain object's keys, or a listed object's entries (and how many in all). */
function objectView(value: unknown): { entries: Array<[string, unknown]>; total: number; cls: string } | null {
  if (!isPlainObject(value)) return null;
  const kind = logKind(value);
  if (kind === null) {
    const keys = Object.keys(value);
    return { entries: keys.map((key) => [key, value[key]]), total: keys.length, cls: '' };
  }
  if (kind !== 'object') return null;
  const entries = pairs(own(value, 'entries')).map(([key, item]): [string, unknown] => [String(key), item]);
  return { entries, total: entries.length + (count(own(value, 'omitted')) ?? 0), cls: str(own(value, 'class')) };
}

/** The rows Table shows: an array result's items (a cut array's first items), else null. */
export function resultRows(value: unknown): unknown[] | null {
  return arrayView(value)?.items ?? null;
}

/** A row's cells as [column, value] when the row is an object (plain or listed), else null. */
function rowEntries(row: unknown): Array<[string, unknown]> | null {
  return objectView(row)?.entries ?? null;
}

/**
 * Columns when at least 80% of the first 20 rows are objects (with `any`, when one is: table()
 * asked for a table). The union of their keys in first-seen order, at most 12.
 */
export function tableColumns(rows: unknown[], options: { any?: boolean } = {}): string[] | null {
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const sample = rows.slice(0, TABLE_SAMPLE);
  const records = sample.map(rowEntries).filter((entries): entries is Array<[string, unknown]> => entries !== null);
  if (!records.length || (!options.any && records.length / sample.length < 0.8)) return null;
  const columns: string[] = [];
  const seen = new Set<string>();
  for (const entries of records) {
    for (const [key] of entries) {
      if (seen.has(key)) continue;
      seen.add(key);
      columns.push(key);
    }
  }
  if (!columns.length) return null;
  return columns.slice(0, TABLE_MAX_COLUMNS);
}

/** A row's value in a column (undefined when the row has no such key). */
export function tableCell(row: unknown, column: string): unknown {
  if (isPlainObject(row) && logKind(row) === null) return own(row, column);
  return rowEntries(row)?.find(([key]) => key === column)?.[1];
}

/** One table cell's text: scalars as written, typed values as the Logs show them, containers by size. */
export function cellText(value: unknown): string {
  if (value === undefined) return '';
  if (value === null) return 'null';
  if (Array.isArray(value)) return `Array(${value.length})`;
  if (typeof value !== 'object') return String(value);
  const kind = logKind(value);
  const bag = value as Bag;
  if (kind === 'array') return `Array(${arrayView(value)?.length ?? 0})`;
  if (kind === 'map' || kind === 'set') return `${kind === 'map' ? 'Map' : 'Set'}(${count(own(bag, 'size')) ?? 0})`;
  if (kind === 'typedarray') return `${str(own(bag, 'type'), 'TypedArray')}(${count(own(bag, 'length')) ?? 0})`;
  if (kind && kind !== 'object') return logValueText(value, { top: true, limit: 200 });
  return '{…}';
}

function serializedLength(value: unknown): number {
  if (typeof value === 'string') return value.length;
  try {
    const json = JSON.stringify(value);
    return json === undefined ? 0 : json.length;
  } catch {
    return 0;
  }
}

function clip(text: string, limit = SUMMARY_LIMIT): string {
  return text.length > limit ? text.slice(0, limit - 1) + '…' : text;
}

function shortValue(value: unknown): string {
  if (Array.isArray(value)) return `Array(${value.length})`;
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value.length > 16 ? value.slice(0, 15) + '…' : value);
  if (typeof value !== 'object') return String(value);
  const kind = logKind(value);
  if (kind === null || kind === 'object') return '{…}';
  if (kind === 'error') return str(own(value, 'name'), 'Error');
  return clip(cellText(value), 24);
}

function summarizeArray(view: { items: unknown[]; length: number }): string {
  const head = `Array(${view.length})`;
  if (!view.length) return head + ' []';
  let text = head + ' [';
  for (let i = 0; i < view.items.length && i < 3; i++) {
    const piece = shortValue(view.items[i]);
    if (text.length + piece.length + 6 > SUMMARY_LIMIT) break;
    text += (i ? ', ' : ' ') + piece;
  }
  return clip(text + (view.length > 3 ? ', … ]' : ' ]'));
}

function summarizeObject(view: { entries: Array<[string, unknown]>; total: number; cls: string }): string {
  if (!view.total) return view.cls ? `${view.cls} {}` : '{}';
  let text = view.cls ? `${view.cls} {` : '{';
  let shown = 0;
  for (const [key, item] of view.entries) {
    const piece = `${key}: ${shortValue(item)}`;
    if (text.length + piece.length + 7 > SUMMARY_LIMIT) break;
    text += (shown ? ', ' : ' ') + piece;
    shown++;
  }
  return clip(text + (shown < view.total ? ', … }' : ' }'));
}

function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

function withBytes(label: string, bytes: number): string {
  return bytes >= 1024 ? `${label} · ${formatResultBytes(bytes)}` : label;
}

/** The badge of a typed scalar: its JavaScript type as the Console names it. */
const SCALAR_BADGES: Record<string, string> = {
  undefined: 'undefined', number: 'number', bigint: 'bigint', function: 'function', symbol: 'symbol',
  date: 'date', dom: 'element', unreadable: 'unreadable', circular: 'circular', depth: 'value',
};

export function describeResult(value: unknown, type: string): ResultDescription {
  const bytes = serializedLength(value);
  const array = arrayView(value);
  if (array) {
    const columns = tableColumns(array.items);
    return {
      kind: columns ? 'table' : 'tree',
      badge: withBytes(`array · ${plural(array.length, 'item', 'items')}`, bytes),
      big: array.length > BIG_ITEM_LIMIT || bytes > BIG_BYTES_LIMIT,
      bytes,
      count: array.length,
      summary: summarizeArray(array),
      columns: columns ?? [],
      notice: array.items.length < array.length ? `Showing ${thousands(array.items.length)} of ${thousands(array.length)} items` : null,
    };
  }
  const object = objectView(value);
  if (object) {
    return {
      kind: 'tree',
      badge: withBytes(`${object.cls || 'object'} · ${plural(object.total, 'key', 'keys')}`, bytes),
      big: object.total > BIG_ITEM_LIMIT || bytes > BIG_BYTES_LIMIT,
      bytes,
      count: object.total,
      summary: summarizeObject(object),
      columns: [],
      notice: object.entries.length < object.total ? `Showing ${thousands(object.entries.length)} of ${thousands(object.total)} keys` : null,
    };
  }

  const kind = logKind(value);
  const bag = value as Bag;
  if (kind === 'map' || kind === 'set' || kind === 'typedarray') {
    const items = kind === 'map' ? pairs(own(bag, 'entries')) : list(own(bag, 'values'));
    const total = Math.max(count(own(bag, kind === 'typedarray' ? 'length' : 'size')) ?? items.length, items.length);
    const [one, many] = kind === 'map' ? ['entry', 'entries'] : kind === 'set' ? ['value', 'values'] : ['item', 'items'];
    const name = kind === 'map' ? 'Map' : kind === 'set' ? 'Set' : str(own(bag, 'type'), 'TypedArray');
    const expandable = kind !== 'typedarray' || Array.isArray(own(bag, 'values'));
    return {
      kind: expandable ? 'tree' : 'scalar',
      badge: withBytes(`${name} · ${plural(total, one, many)}`, bytes),
      big: total > BIG_ITEM_LIMIT || bytes > BIG_BYTES_LIMIT,
      bytes,
      count: total,
      summary: clip(logValueText(value, { limit: SUMMARY_LIMIT })),
      columns: [],
      notice: expandable && items.length < total ? `Showing ${thousands(items.length)} of ${thousands(total)} ${many}` : null,
    };
  }
  if (kind === 'error') {
    return {
      kind: 'tree', badge: str(own(bag, 'name'), 'Error'), big: bytes > BIG_BYTES_LIMIT, bytes, count: null,
      summary: clip(logValueText(value, { limit: SUMMARY_LIMIT })), columns: [], notice: null,
    };
  }
  if (kind === 'string') {
    const prefix = str(own(bag, 'value'));
    const length = Math.max(count(own(bag, 'length')) ?? prefix.length, prefix.length);
    return {
      kind: 'text',
      badge: withBytes(`string · ${plural(length, 'char', 'chars')}`, bytes),
      big: bytes > BIG_BYTES_LIMIT,
      bytes,
      count: length,
      summary: clip(JSON.stringify(prefix + '…')),
      columns: [],
      notice: `Showing the first ${thousands(prefix.length)} of ${thousands(length)} characters`,
    };
  }
  if (kind) {
    return {
      kind: 'scalar', badge: SCALAR_BADGES[kind] ?? kind, big: false, bytes, count: null,
      summary: clip(logValueText(value, { limit: SUMMARY_LIMIT })), columns: [], notice: null,
    };
  }

  if (typeof value === 'string') {
    const long = value.length > TEXT_CHAR_LIMIT;
    return {
      kind: long ? 'text' : 'scalar',
      badge: withBytes(`string · ${plural(value.length, 'char', 'chars')}`, bytes),
      big: bytes > BIG_BYTES_LIMIT,
      bytes,
      count: value.length,
      summary: clip(JSON.stringify(value)),
      columns: [],
      notice: null,
    };
  }

  const badge = value === null ? 'null' : value === undefined ? 'undefined' : (typeof value === 'number' || typeof value === 'boolean') ? typeof value : (type || typeof value);
  return {
    kind: 'scalar',
    badge,
    big: false,
    bytes,
    count: null,
    summary: String(value),
    columns: [],
    notice: null,
  };
}

/** A described result: what CommandCell and ResultView share. */
export interface DescribedResult {
  value: unknown;
  description: ResultDescription;
}

/**
 * Describe a command result once. `table` is the out-of-band flag table() sets (spec J8): rows
 * with any object among them render as a table. (A cut is stated by the value itself.)
 */
export function describeCommandResult(value: unknown, type: string, table = false): DescribedResult {
  let description = describeResult(value, type);
  const rows = resultRows(value);
  if (table && description.kind !== 'table' && rows) {
    const columns = tableColumns(rows, { any: true });
    if (columns) description = { ...description, kind: 'table', columns };
  }
  return { value, description };
}

/** One line of text for a result (the stream's message, the announcement): strings as they are. */
export function resultText(value: unknown, limit = SUMMARY_LIMIT): string {
  return logValueText(value, { top: true, limit });
}

/**
 * The JSON view: pretty JSON of the result, never its envelopes. An integer past 2^53 keeps its
 * digits and -0 its sign (JSON numbers); NaN, ±Infinity, undefined and other typed values JSON
 * cannot hold are written as their text; a Map as an object keyed by its keys.
 */
export function resultJsonText(value: unknown, limit = RESULT_JSON_LIMIT): string {
  let projected: unknown;
  try {
    projected = logPlain(value, 'json');
  } catch {
    projected = value;
  }
  return safeStringify(projected, 2, limit);
}

/**
 * What Copy puts on the clipboard: a string as it is (a cut string: the characters kept, no "…"
 * added), a typed scalar as its text, anything else as the JSON view's text.
 */
export function resultCopyText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value === null || typeof value !== 'object') return value === undefined ? 'undefined' : String(value);
  const kind = logKind(value);
  if (kind === 'string') return str(own(value, 'value'));
  if (kind && !['array', 'object', 'map', 'set', 'error', 'typedarray'].includes(kind)) return logValueText(value, { top: true, limit: COPY_LIMIT });
  return resultJsonText(value, COPY_LIMIT);
}

/** The Copy toast: a console cap's cut is said ("Copied 1,000 of 5,000 items."), since the copy holds only what was kept. */
export function resultCopyToast(value: unknown, type: string): string {
  let notice: string | null = null;
  try {
    notice = describeResult(value, type).notice;
  } catch {
    notice = null;
  }
  return notice ? `${notice.replace(/^Showing\b/, 'Copied')}.` : 'Copied result.';
}

// ── Panel → page: a body value as the page revives it ─────────────────────────────

/**
 * A value from the lossless parser in the typed model the page revives (shared/console-helpers.js
 * reviveContext): an integer the parser kept as a LosslessNumber (past 2^53) becomes a bigint
 * envelope — a BigInt in the page — and an object that has the "$xray" key is listed as an `object`
 * envelope, so it stays data. Keys are defined, never assigned: "__proto__" stays a key.
 */
export function encodeConsoleValue(value: unknown): unknown {
  if (value instanceof LosslessNumber) {
    const dot = value.raw.indexOf('.');
    return { [LOG_TYPE_KEY]: 'bigint', value: dot < 0 ? value.raw : value.raw.slice(0, dot) };
  }
  switch (typeof value) {
    case 'string':
    case 'boolean':
      return value;
    case 'number':
      if (Number.isFinite(value) && !Object.is(value, -0)) return value;
      return { [LOG_TYPE_KEY]: 'number', value: Object.is(value, -0) ? '-0' : String(value) };
    case 'bigint':
      return { [LOG_TYPE_KEY]: 'bigint', value: String(value) };
    case 'object':
      break;
    default:
      return { [LOG_TYPE_KEY]: 'undefined' };
  }
  if (value === null) return null;
  if (Array.isArray(value)) return value.map(encodeConsoleValue);
  const keys = Object.keys(value);
  if (keys.includes(LOG_TYPE_KEY)) {
    return { [LOG_TYPE_KEY]: 'object', entries: keys.map((key) => [key, encodeConsoleValue((value as Bag)[key])]) };
  }
  const out: Bag = {};
  for (const key of keys) {
    Object.defineProperty(out, key, { value: encodeConsoleValue((value as Bag)[key]), enumerable: true, configurable: true, writable: true });
  }
  return out;
}

const bodyValues = new WeakMap<object, { response?: unknown; request?: unknown }>();

/**
 * An entry's response or request body as the Console context carries it (`res`, `req`, `prev`,
 * `next`, pins): the lossless parse every view reads (entryResponse / entryRequest), encoded.
 * Cached per entry (entries are immutable between patches). May throw for a pathologically deep
 * body; the engine then sends the raw text and the page parses it.
 */
export function consoleBodyValue(entry: XrayEntry, side: 'response' | 'request'): unknown {
  const cached = bodyValues.get(entry);
  if (cached && Object.prototype.hasOwnProperty.call(cached, side)) return cached[side];
  const value = encodeConsoleValue(side === 'request' ? entryRequest(entry) : entryResponse(entry));
  bodyValues.set(entry, { ...cached, [side]: value });
  return value;
}
