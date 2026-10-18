import type { DetailView, RequestTiming, XrayEntry } from '../types';
import { printJson, type JsonArrayNode, type JsonNode, type JsonObjectNode } from './jsonText';

function duration(entry: XrayEntry): number {
  return Math.max(0, Number(entry.duration) || 0);
}

export const detailViews: DetailView[] = ['tree', 'grid', 'raw', 'schema', 'diff', 'viz', 'waterfall', 'headers'];

export interface TimingPhase {
  label: string;
  ms: number;
  className: string;
}

// Break a request's timing into phases for the waterfall bar. Uses real Resource
// Timing when the interceptor captured it, otherwise falls back to a single
// wall-clock duration bar.
export function timingPhases(entry: XrayEntry): { phases: TimingPhase[]; totalMs: number; real: boolean } {
  const timing: RequestTiming | null | undefined = entry.timing;
  if (timing && Number(timing.totalMs) > 0) {
    const phases: TimingPhase[] = [
      { label: 'DNS', ms: Number(timing.dnsMs) || 0, className: 'dns' },
      { label: 'Connect', ms: Math.max(0, (Number(timing.connectMs) || 0) - (Number(timing.tlsMs) || 0)), className: 'connect' },
      { label: 'TLS', ms: Number(timing.tlsMs) || 0, className: 'tls' },
      { label: 'Wait (TTFB)', ms: Number(timing.ttfbMs) || 0, className: 'ttfb' },
      { label: 'Download', ms: Number(timing.downloadMs) || 0, className: 'download' },
    ].filter((phase) => phase.ms > 0);
    return { phases, totalMs: Number(timing.totalMs), real: true };
  }
  const total = duration(entry);
  return { phases: [{ label: 'Total', ms: total, className: 'total' }], totalMs: total, real: false };
}

// ── One node model for Table, Schema, Diff and Visualize (spec §2 J3, §8 J11) ─────────────────────
// Every surface — the docked panel, the HUD, the pop-out and DevTools — reads a body through these
// functions from the lossless parser's nodes (capturedBody.bodyNode). The DevTools worker used to keep
// its own copies, which picked the first array, typed to another depth and diffed to another depth.

/**
 * An object's members as JSON.parse reads them: a repeated key keeps its first position and its last
 * value. A Map, so `__proto__` and `constructor` are keys like any other.
 */
export function objectMembers(node: JsonObjectNode): Map<string, JsonNode> {
  const members = new Map<string, JsonNode>();
  for (const entry of node.entries) members.set(entry.key, entry.value);
  return members;
}

/**
 * The array a payload is "really" about: the value itself when it is an array, otherwise its largest
 * non-empty array member (the first array when every one is empty), otherwise null.
 *
 * Picking the FIRST array meant `{errors: [], data: [...25 rows]}` rendered an empty Table and "No
 * numeric fields to chart" — a verdict on a property neither view had looked at. GraphQL, JSON:API and
 * `{warnings: [], items: [...]}` all put an empty array first. Table and Visualize share this choice.
 */
export function rowArrayNode(node: JsonNode | null): JsonArrayNode | null {
  if (!node) return null;
  if (node.t === 'arr') return node;
  if (node.t !== 'obj') return null;
  let first: JsonArrayNode | null = null;
  let best: JsonArrayNode | null = null;
  for (const value of objectMembers(node).values()) {
    if (value.t !== 'arr') continue;
    first ??= value;
    if (value.items.length > 0 && (best === null || value.items.length > best.items.length)) best = value;
  }
  return best ?? first;
}

/**
 * One line of text for a node: a string as itself, a number by its lexeme (9007199254740993, -0, 1.0
 * and 5e-324 as written), anything else as compact lossless JSON; cut at `limit` characters with "...".
 */
export function nodeText(node: JsonNode, limit = Infinity): string {
  const text = node.t === 'str' ? node.value : node.t === 'num' ? node.raw : printJson(node);
  return text.length > limit ? text.slice(0, limit) + '...' : text;
}

const count = (value: number): string => value.toLocaleString('en-US');

// ── Table ──────────────────────────────────────────────────────────────────────────────────────

export const TABLE_MAX_ROWS = 200;
/** Each shown row contributes at most its first this many keys as columns. */
export const TABLE_MAX_ROW_KEYS = 20;
const TABLE_CELL_CHARS = 160;

export interface TableData {
  /** The union of each shown row's first TABLE_MAX_ROW_KEYS keys, in first-seen order. */
  columns: string[];
  /** The object rows shown (at most TABLE_MAX_ROWS). */
  rows: JsonObjectNode[];
  /** Text per shown row and column: nodeText (lexemes), '' for a key the row does not have. */
  cells: string[][];
  /** Object rows in the chosen array (N). */
  totalRows: number;
  /** Distinct keys across all of those rows (K). */
  totalColumns: number;
  /** "Showing R of N rows · C of K columns" whenever a cap hides rows or columns; else null. */
  notice: string | null;
}

/**
 * The Table for a body: the object rows of its row array (rowArrayNode), or the object itself when it
 * has no array member. Items that are not objects are not rows.
 */
export function tableFromNode(node: JsonNode | null): TableData {
  const array = rowArrayNode(node);
  const items: JsonNode[] = array ? array.items : node && node.t === 'obj' ? [node] : [];
  const objects = items.filter((item): item is JsonObjectNode => item.t === 'obj');
  const rows = objects.slice(0, TABLE_MAX_ROWS);
  const columnSet = new Set<string>();
  const rowMembers = rows.map((row) => {
    const members = objectMembers(row);
    let taken = 0;
    for (const key of members.keys()) {
      if (taken++ >= TABLE_MAX_ROW_KEYS) break;
      columnSet.add(key);
    }
    return members;
  });
  const allKeys = new Set<string>(columnSet);
  for (const row of objects) for (const entry of row.entries) allKeys.add(entry.key);
  const columns = Array.from(columnSet);
  const cells = rowMembers.map((members) => columns.map((column) => {
    const value = members.get(column);
    return value ? nodeText(value, TABLE_CELL_CHARS) : '';
  }));
  const capped = objects.length > rows.length || allKeys.size > columns.length;
  return {
    columns,
    rows,
    cells,
    totalRows: objects.length,
    totalColumns: allKeys.size,
    notice: capped ? `Showing ${count(rows.length)} of ${count(objects.length)} rows · ${count(columns.length)} of ${count(allKeys.size)} columns` : null,
  };
}

// ── Schema ─────────────────────────────────────────────────────────────────────────────────────

/** Levels typed before the schema says "any" — the console helpers' schema() limit, so both agree. */
export const SCHEMA_MAX_DEPTH = 5;

/**
 * The Schema view's type summary, from nodes: 42 → "number", true → "boolean", null → "null",
 * "hi" → "string", [] → "array", an array → [its first item's schema], an object → its members'
 * schemas (each defined as an own property, so `__proto__` stays a key). Same shape and depth as
 * schema() in shared/console-helpers.js; a missing body reads as null.
 */
export function schemaFromNode(node: JsonNode | null, depth = 0): unknown {
  if (depth > SCHEMA_MAX_DEPTH) return 'any';
  if (!node || node.t === 'null') return 'null';
  if (node.t === 'arr') return node.items.length ? [schemaFromNode(node.items[0], depth + 1)] : 'array';
  if (node.t === 'obj') {
    const out: Record<string, unknown> = {};
    for (const [key, value] of objectMembers(node)) {
      Object.defineProperty(out, key, { value: schemaFromNode(value, depth + 1), writable: true, enumerable: true, configurable: true });
    }
    return out;
  }
  return node.t === 'num' ? 'number' : node.t === 'str' ? 'string' : 'boolean';
}

// ── Diff ───────────────────────────────────────────────────────────────────────────────────────

/** Containers deeper than this are compared whole: a difference below is one change, with a notice. */
export const DIFF_MAX_DEPTH = 8;
export const DIFF_MAX_LINES = 200;
/** Array items compared one by one; the rest is compared whole and summarized as `path[…]`. */
export const DIFF_ARRAY_WINDOW = 50;

export interface NodeDiffLine {
  path: string;
  kind: 'added' | 'removed' | 'changed';
  before?: JsonNode;
  after?: JsonNode;
}

export interface NodeDiff {
  lines: NodeDiffLine[];
  /** Why the diff is not the whole story: a depth, array or line limit hid detail. Empty when complete. */
  notices: string[];
}

type DiffTask =
  | { tail?: undefined; previous: JsonNode | null; current: JsonNode | null; path: string; depth: number }
  | { tail: true; previous: JsonArrayNode; current: JsonArrayNode; path: string };

/**
 * Path-level structural diff of two bodies (null: absent): added, removed and changed members. Numbers
 * compare by lexeme (9007199254740992 ≠ 9007199254740993, 1.0 ≠ 1, 0 ≠ -0), strings by their decoded
 * text, objects by key regardless of order (a repeated key as JSON.parse reads it). Bounded by depth,
 * by an array window and by `maxLines`, and every bound that hides a difference adds a notice — an
 * empty result with no notices means the two bodies are equal. Iterative.
 */
export function diffNodes(previous: JsonNode | null, current: JsonNode | null, maxLines = DIFF_MAX_LINES): NodeDiff {
  const lines: NodeDiffLine[] = [];
  const notices: string[] = [];
  const note = (text: string): void => {
    if (!notices.includes(text)) notices.push(text);
  };
  let stopped = false;
  const add = (line: NodeDiffLine): boolean => {
    if (lines.length >= maxLines) {
      stopped = true;
      note(`Showing the first ${count(maxLines)} differences; the diff stopped there.`);
      return false;
    }
    lines.push(line);
    return true;
  };
  const tasks: DiffTask[] = [{ previous, current, path: '', depth: 0 }];
  while (tasks.length > 0 && !stopped) {
    const task = tasks.pop() as DiffTask;
    if (task.tail) {
      const before = task.previous.items;
      const after = task.current.items;
      let differs = before.length !== after.length;
      for (let index = DIFF_ARRAY_WINDOW; !differs && index < before.length; index++) differs = !nodesEqual(before[index], after[index]);
      if (differs && add({ path: `${task.path}[…]`, kind: 'changed', before: itemCount(before.length), after: itemCount(after.length) })) {
        note(`Compared the first ${DIFF_ARRAY_WINDOW} items of ${task.path || '(root)'} one by one; later differences are summarized as ${task.path}[…].`);
      }
      continue;
    }
    const { previous: before, current: after, path, depth } = task;
    if (!before && !after) continue;
    if (!before) {
      add({ path, kind: 'added', after: after as JsonNode });
      continue;
    }
    if (!after) {
      add({ path, kind: 'removed', before });
      continue;
    }
    const sameContainer = (before.t === 'obj' && after.t === 'obj') || (before.t === 'arr' && after.t === 'arr');
    if (!sameContainer) {
      if (!nodesEqual(before, after)) add({ path, kind: 'changed', before, after });
      continue;
    }
    if (depth > DIFF_MAX_DEPTH) {
      if (!nodesEqual(before, after) && add({ path, kind: 'changed', before, after })) {
        note(`Compared ${DIFF_MAX_DEPTH} levels deep: ${path} differs below that depth and is shown as one change.`);
      }
      continue;
    }
    if (before.t === 'arr' && after.t === 'arr') {
      const length = Math.max(before.items.length, after.items.length);
      if (length > DIFF_ARRAY_WINDOW) tasks.push({ tail: true, previous: before, current: after, path });
      for (let index = Math.min(length, DIFF_ARRAY_WINDOW) - 1; index >= 0; index--) {
        tasks.push({ previous: before.items[index] ?? null, current: after.items[index] ?? null, path: `${path}[${index}]`, depth: depth + 1 });
      }
      continue;
    }
    const beforeMembers = objectMembers(before as JsonObjectNode);
    const afterMembers = objectMembers(after as JsonObjectNode);
    const keys = Array.from(new Set([...beforeMembers.keys(), ...afterMembers.keys()]));
    for (let index = keys.length - 1; index >= 0; index--) {
      const key = keys[index];
      tasks.push({ previous: beforeMembers.get(key) ?? null, current: afterMembers.get(key) ?? null, path: path ? `${path}.${key}` : key, depth: depth + 1 });
    }
  }
  return { lines, notices };
}

function itemCount(length: number): JsonNode {
  return { t: 'str', value: `${length} items` };
}

/** Deep equality with diffNodes' rules (lexemes, decoded strings, members by key). Iterative. */
export function nodesEqual(a: JsonNode, b: JsonNode): boolean {
  const pending: Array<[JsonNode, JsonNode]> = [[a, b]];
  while (pending.length > 0) {
    const [x, y] = pending.pop() as [JsonNode, JsonNode];
    if (x === y) continue;
    if (x.t !== y.t) return false;
    if (x.t === 'arr') {
      const other = (y as JsonArrayNode).items;
      if (x.items.length !== other.length) return false;
      for (let index = 0; index < other.length; index++) pending.push([x.items[index], other[index]]);
    } else if (x.t === 'obj') {
      const mine = objectMembers(x);
      const theirs = objectMembers(y as JsonObjectNode);
      if (mine.size !== theirs.size) return false;
      for (const [key, value] of mine) {
        const other = theirs.get(key);
        if (!other) return false;
        pending.push([value, other]);
      }
    } else if (x.t === 'num') {
      if (x.raw !== (y as typeof x).raw) return false;
    } else if (x.t === 'str' || x.t === 'bool') {
      if (x.value !== (y as typeof x).value) return false;
    }
  }
  return true;
}
