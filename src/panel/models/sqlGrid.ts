// Result-grid decisions: auto column widths, client-side sort and filter over the loaded rows, the
// filtered summary, and the text "Copy value" puts on the clipboard. Pure logic; keep React and the
// runtime out of this file.

import { parseJson, printJson } from './jsonText';
import { displayCell, isTruncatedBlob } from './sqlValues';
import type { ResultColumn, SchemaTree, SqlCell } from './sqlTypes';

export const COLUMN_MIN_PX = 64;
export const COLUMN_MAX_PX = 480;
/** The narrowest a user can drag a column. */
export const COLUMN_RESIZE_MIN_PX = 48;
/** Rows sampled for auto widths. */
export const WIDTH_SAMPLE_ROWS = 50;
// Cell padding (8 px a side), plus room in the header for the sort arrow and the key icon.
const CELL_PAD_PX = 16;
const HEADER_EXTRA_PX = 22;
// Longer values are cut in the grid anyway; measuring them would only hit the clamp.
const SAMPLE_CHARS = 80;

export type SortDir = 'asc' | 'desc';
export interface SortState {
  col: number;
  dir: SortDir;
}

export type Measure = (text: string) => number;

/** The label under a column name: its declared type, or an em dash when it has none. */
export function columnTypeLabel(type: string): string {
  return type.trim() ? type.trim().toUpperCase() : '—';
}

function clampWidth(px: number): number {
  return Math.round(Math.min(COLUMN_MAX_PX, Math.max(COLUMN_MIN_PX, px)));
}

/** A width per column from its header (name and type) and the first rows' display text. */
export function columnWidths(columns: readonly ResultColumn[], rows: readonly SqlCell[][], measure: Measure): number[] {
  const sample = rows.slice(0, WIDTH_SAMPLE_ROWS);
  return columns.map((column, i) => {
    let widest = Math.max(measure(column.name), measure(columnTypeLabel(column.type))) + HEADER_EXTRA_PX;
    for (const row of sample) {
      const text = displayCell(row[i] ?? null, column.type).text;
      const firstLine = text.slice(0, SAMPLE_CHARS);
      widest = Math.max(widest, measure(firstLine) + CELL_PAD_PX);
    }
    return clampWidth(widest);
  });
}

/** The row-number column: as wide as its largest number, and never wide. */
export function indexColumnWidth(rowCount: number, measure: Measure): number {
  return Math.round(Math.min(72, Math.max(40, measure(String(Math.max(1, rowCount))) + CELL_PAD_PX)));
}

/** Header clicks cycle a column: ascending, descending, unsorted. */
export function nextSort(current: SortState | null, col: number): SortState | null {
  if (!current || current.col !== col) return { col, dir: 'asc' };
  return current.dir === 'asc' ? { col, dir: 'desc' } : null;
}

const NUMERIC_TEXT = /^\s*[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?\s*$/;
const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

// SQLite's own order between storage classes: numbers, then text, then blobs. NULLs are handled apart.
function rank(cell: Exclude<SqlCell, null>): 0 | 1 | 2 {
  if (typeof cell === 'number' || typeof cell === 'boolean') return 0;
  if (typeof cell === 'string') return NUMERIC_TEXT.test(cell) ? 0 : 1;
  return 2;
}

function asNumber(cell: Exclude<SqlCell, null>): number {
  if (typeof cell === 'boolean') return cell ? 1 : 0;
  return Number(cell);
}

function compareCells(a: Exclude<SqlCell, null>, b: Exclude<SqlCell, null>): number {
  const ra = rank(a);
  const rb = rank(b);
  if (ra !== rb) return ra - rb;
  if (ra === 0) {
    const d = asNumber(a) - asNumber(b);
    if (d !== 0) return d;
    // Past 2^53 two digit strings can read as one number: fall back to their text.
    return typeof a === 'string' && typeof b === 'string' ? collator.compare(a, b) : 0;
  }
  if (ra === 1) return collator.compare(a as string, b as string);
  return (a as { hex: string }).hex < (b as { hex: string }).hex ? -1 : (a as { hex: string }).hex > (b as { hex: string }).hex ? 1 : 0;
}

function sortedIndexes(rows: readonly SqlCell[][], indexes: readonly number[], sort: SortState | null): number[] {
  if (!sort) return indexes.slice();
  const sign = sort.dir === 'asc' ? 1 : -1;
  return indexes.slice().sort((x, y) => {
    const a = rows[x][sort.col] ?? null;
    const b = rows[y][sort.col] ?? null;
    if (a === null || b === null) {
      if (a === b) return x - y;
      return a === null ? 1 : -1;
    }
    return sign * compareCells(a, b) || x - y;
  });
}

/** The rows sorted by one column (stable), NULLs last in either direction. Never mutates `rows`. */
export function sortRows(rows: readonly SqlCell[][], sort: SortState | null): SqlCell[][] {
  return sortedIndexes(rows, rows.map((_, i) => i), sort).map((i) => rows[i]);
}

/** Indexes of the rows with a cell whose displayed text contains `query` (case-insensitive). */
export function filterIndexes(rows: readonly SqlCell[][], columns: readonly ResultColumn[], query: string): number[] {
  const q = query.trim().toLowerCase();
  const out: number[] = [];
  for (let i = 0; i < rows.length; i++) {
    if (!q || rows[i].some((cell, c) => displayCell(cell, columns[c]?.type).text.toLowerCase().includes(q))) out.push(i);
  }
  return out;
}

/** The loaded rows whose displayed text contains `query`. */
export function filterRows(rows: readonly SqlCell[][], columns: readonly ResultColumn[], query: string): SqlCell[][] {
  return filterIndexes(rows, columns, query).map((i) => rows[i]);
}

/** What the grid shows, as indexes into the result's rows: filtered, then sorted. */
export function viewOrder(rows: readonly SqlCell[][], columns: readonly ResultColumn[], query: string, sort: SortState | null): number[] {
  return sortedIndexes(rows, filterIndexes(rows, columns, query), sort);
}

/** Identifies a result's column set: widths, sort and the inspected cell reset when it changes. */
export function columnsKey(columns: readonly ResultColumn[]): string {
  return columns.map((c) => `${c.name}\u0000${c.type}`).join('\u0001');
}

/** Primary-key column names of a previewed main-schema table; empty for a query or a view. */
export function primaryKeyColumns(schema: SchemaTree | null, table: string | null): ReadonlySet<string> {
  if (!schema || !table) return new Set();
  const node = schema.schemas.find((s) => s.name === 'main')?.tables.find((t) => t.name === table);
  return new Set(node ? node.columns.filter((c) => c.pk).map((c) => c.name) : []);
}

/** "12 of 100 rows · 5 ms": the Results summary while a filter hides rows. */
export function filteredSummary(shown: number, total: number, durationMs: number): string {
  return `${shown} of ${total} rows · ${Math.round(durationMs)} ms`;
}

/** What "Copy value" writes: JSON pretty-printed, a blob as \x hex like the cell, else as displayed. */
export function cellCopyText(cell: SqlCell, columnType = ''): { text: string; truncatedBlob: boolean } {
  if (cell === null) return { text: 'NULL', truncatedBlob: false };
  if (typeof cell === 'object') return { text: `\\x${cell.hex}`, truncatedBlob: isTruncatedBlob(cell) };
  if (typeof cell === 'string') {
    const shown = displayCell(cell, columnType);
    if (shown.kind === 'json') {
      const doc = parseJson(cell);
      if (doc.ok) return { text: printJson(doc.root, { indent: 2 }), truncatedBlob: false };
    }
    return { text: cell, truncatedBlob: false };
  }
  return { text: String(cell), truncatedBlob: false };
}
