// The results grid's cell and row range selection (spec §1: "Copy selection or all"), and what a
// copy of it holds. Pure logic; keep React and the runtime out of this file.
//
// The grid works in view positions (the filtered, sorted rows it shows); `order` maps a view row to
// its source row in the result. A selection is kept as source rows plus a column range, so it
// survives a sort, a filter (rows filtered out leave it) and Fetch more (rows are only appended).

import { countTruncatedBlobs, toCsv, toInsertCopy, toJsonRows, truncatedBlobNotice } from './sqlValues';
import type { QueryResult, ResultColumn, SqlCell, SqlDialect } from './sqlTypes';

/** A cell in view position. */
export interface GridPoint {
  row: number;
  col: number;
}

export interface GridSelection {
  /** The selected source rows, ascending. */
  rows: number[];
  left: number;
  right: number;
  /** Where the selection started, as a source row and column: Shift extends from here. */
  anchor: { row: number; col: number };
}

export type CopyFormat = 'CSV' | 'JSON' | 'INSERT';

/** The most cells one copy holds, so a copy stays synchronous and bounded. */
export const COPY_CELL_LIMIT = 200_000;
export const COPY_CAPPED_NOTICE = 'Copied the first 200,000 cells; narrow the selection to copy the rest.';

/** The rectangle from `anchor` to `focus` (view positions), as source rows and columns. */
export function selectRange(order: readonly number[], anchor: GridPoint, focus: GridPoint): GridSelection {
  const top = Math.max(0, Math.min(anchor.row, focus.row));
  const bottom = Math.min(order.length - 1, Math.max(anchor.row, focus.row));
  return {
    rows: order.slice(top, bottom + 1).sort((a, b) => a - b),
    left: Math.min(anchor.col, focus.col),
    right: Math.max(anchor.col, focus.col),
    anchor: { row: order[anchor.row] ?? order[top], col: anchor.col },
  };
}

// The anchor's view position: where it is shown now, else the active cell (its row was filtered out).
function anchorAt(sel: GridSelection | null, order: readonly number[], active: GridPoint): GridPoint {
  if (!sel) return active;
  const row = order.indexOf(sel.anchor.row);
  return row < 0 ? active : { row, col: sel.anchor.col };
}

/** Shift+click or Shift+arrow: from the selection's anchor, or from the active cell, to `to`. */
export function extendSelection(sel: GridSelection | null, order: readonly number[], active: GridPoint, to: GridPoint): GridSelection {
  return selectRange(order, anchorAt(sel, order, active), to);
}

/** Ctrl/⌘+A: every shown row and column. */
export function selectAll(order: readonly number[], colCount: number): GridSelection | null {
  if (!order.length || colCount <= 0) return null;
  return selectRange(order, { row: 0, col: 0 }, { row: order.length - 1, col: colCount - 1 });
}

/** A row number: that whole row, or with Shift every row from the anchor (or active) row to it. */
export function selectRows(
  sel: GridSelection | null,
  order: readonly number[],
  activeRow: number,
  to: number,
  colCount: number,
  extend: boolean,
): GridSelection {
  const from = extend ? anchorAt(sel, order, { row: activeRow, col: 0 }).row : to;
  const out = selectRange(order, { row: from, col: 0 }, { row: to, col: Math.max(0, colCount - 1) });
  return out;
}

/** Whether the cell at a source row and column is selected, with a lookup built once per selection. */
export function selectionLookup(sel: GridSelection | null): (sourceRow: number, col: number) => boolean {
  if (!sel) return () => false;
  const rows = new Set(sel.rows);
  return (sourceRow, col) => col >= sel.left && col <= sel.right && rows.has(sourceRow);
}

/** The selection after the view changed: rows no longer shown leave it; none left, no selection. */
export function reconcileSelection(sel: GridSelection | null, order: readonly number[], colCount: number): GridSelection | null {
  if (!sel || colCount <= 0) return null;
  const shown = new Set(order);
  const rows = sel.rows.filter((r) => shown.has(r));
  if (!rows.length) return null;
  const right = Math.min(sel.right, colCount - 1);
  if (sel.left > right) return null;
  if (rows.length === sel.rows.length && right === sel.right) return sel;
  return { ...sel, rows, right };
}

/** `next` is `prev` with rows appended (Fetch more), not a new result. */
export function isAppended(prev: QueryResult | null, next: QueryResult | null): boolean {
  if (!prev || !next || prev.columns !== next.columns || next.rows.length < prev.rows.length) return false;
  const n = prev.rows.length;
  return n === 0 || (next.rows[0] === prev.rows[0] && next.rows[n - 1] === prev.rows[n - 1]);
}

export interface SelectionSlice {
  columns: ResultColumn[];
  rows: SqlCell[][];
  /** The source row of each copied row. */
  sourceRows: number[];
  /** The source column of each copied column. */
  sourceCols: number[];
  /** The copy stopped at COPY_CELL_LIMIT cells (whole rows, in view order). */
  capped: boolean;
}

/**
 * The selected rows and columns (every shown row and column without a selection), in view order,
 * at most `limit` cells: the first whole rows that fit.
 */
export function selectionSlice(
  sel: GridSelection | null,
  columns: readonly ResultColumn[],
  rows: readonly SqlCell[][],
  order: readonly number[],
  limit = COPY_CELL_LIMIT,
): SelectionSlice {
  const lookup = sel ? new Set(sel.rows) : null;
  let sourceRows = lookup ? order.filter((r) => lookup.has(r)) : order.slice();
  let sourceCols: number[] = [];
  const left = sel ? sel.left : 0;
  const right = sel ? Math.min(sel.right, columns.length - 1) : columns.length - 1;
  for (let c = left; c <= right; c++) sourceCols.push(c);
  let capped = false;
  if (sourceRows.length * sourceCols.length > limit) {
    capped = true;
    if (sourceCols.length > limit) sourceCols = sourceCols.slice(0, limit);
    sourceRows = sourceRows.slice(0, Math.max(1, Math.floor(limit / sourceCols.length)));
  }
  return {
    columns: sourceCols.map((c) => columns[c]),
    rows: sourceRows.map((r) => sourceCols.map((c) => rows[r]?.[c] ?? null)),
    sourceRows,
    sourceCols,
    capped,
  };
}

/**
 * How many text values in the copied rows and columns were cut to fit (over 1 MB, or halved to fit
 * a helper message). Exact from the result's per-cell marks (an empty list: none cut); a helper that
 * sends none gives only a total, which counts only for a copy of every row and column.
 */
export function countCutText(
  result: Pick<QueryResult, 'rows' | 'columns' | 'truncatedCells' | 'cutCells'>,
  sourceRows: readonly number[],
  sourceCols: readonly number[],
): number {
  if (result.cutCells) {
    if (!result.cutCells.length) return 0;
    const rowSet = new Set(sourceRows);
    const colSet = new Set(sourceCols);
    return result.cutCells.filter(([r, c]) => rowSet.has(r) && colSet.has(c)).length;
  }
  const everything = new Set(sourceRows).size === result.rows.length && new Set(sourceCols).size === result.columns.length;
  return everything ? result.truncatedCells : 0;
}

export function cutTextNotice(count: number): string {
  return `${count} long text values were cut`;
}

/**
 * The copy of a slice in `format`, and its notices, each its own line (R9/R14): the blob notice
 * word for word, then the cut-text one.
 */
export function copySlice(
  format: CopyFormat,
  result: Pick<QueryResult, 'rows' | 'columns' | 'truncatedCells' | 'cutCells'>,
  slice: SelectionSlice,
  table: string,
  dialect: SqlDialect,
): { text: string; notices: string[] } {
  let text: string;
  let blobs: number;
  if (format === 'INSERT') {
    const out = toInsertCopy(table, slice.columns, slice.rows, dialect);
    text = out.text;
    blobs = out.truncatedBlobs;
  } else {
    text = format === 'CSV' ? toCsv(slice.columns, slice.rows) : toJsonRows(slice.columns, slice.rows);
    blobs = countTruncatedBlobs(slice.rows);
  }
  const notices: string[] = [];
  if (blobs) notices.push(truncatedBlobNotice(blobs));
  const cut = countCutText(result, slice.sourceRows, slice.sourceCols);
  if (cut) notices.push(cutTextNotice(cut));
  return { text, notices };
}
