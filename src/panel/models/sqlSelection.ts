// The results grid's cell and row range selection (spec §1: "Copy selection or all"), and what a
// copy of it holds. Pure logic; keep React and the runtime out of this file.
//
// Positions are in view coordinates (the filtered, sorted rows the grid shows); `order` maps a view
// row to its source row in the result, which is where the cut-cell marks point.

import { countTruncatedBlobs, toCsv, toInsertCopy, toJsonRows, truncatedBlobNotice } from './sqlValues';
import type { QueryResult, ResultColumn, SqlCell, SqlDialect } from './sqlTypes';

export interface GridPoint {
  row: number;
  col: number;
}

/** A rectangle from the cell the selection started at (anchor) to the one it reaches (focus). */
export interface GridSelection {
  anchor: GridPoint;
  focus: GridPoint;
}

export type CopyFormat = 'CSV' | 'JSON' | 'INSERT';

export function selectionBounds(sel: GridSelection): { top: number; bottom: number; left: number; right: number } {
  return {
    top: Math.min(sel.anchor.row, sel.focus.row),
    bottom: Math.max(sel.anchor.row, sel.focus.row),
    left: Math.min(sel.anchor.col, sel.focus.col),
    right: Math.max(sel.anchor.col, sel.focus.col),
  };
}

export function isCellSelected(sel: GridSelection | null, row: number, col: number): boolean {
  if (!sel) return false;
  const b = selectionBounds(sel);
  return row >= b.top && row <= b.bottom && col >= b.left && col <= b.right;
}

/** More than one cell: what the copy menu offers as "Copy selection". */
export function hasRange(sel: GridSelection | null): sel is GridSelection {
  return !!sel && (sel.anchor.row !== sel.focus.row || sel.anchor.col !== sel.focus.col);
}

/** Shift+click or Shift+arrow: from the selection's anchor, or from the active cell, to `to`. */
export function extendSelection(sel: GridSelection | null, active: GridPoint, to: GridPoint): GridSelection {
  return { anchor: sel ? sel.anchor : active, focus: to };
}

export function selectAll(rowCount: number, colCount: number): GridSelection | null {
  if (rowCount <= 0 || colCount <= 0) return null;
  return { anchor: { row: 0, col: 0 }, focus: { row: rowCount - 1, col: colCount - 1 } };
}

/** Whole rows from `anchorRow` to `focusRow` (a row-header click, or Shift+click to extend). */
export function selectRows(anchorRow: number, focusRow: number, colCount: number): GridSelection {
  return { anchor: { row: anchorRow, col: 0 }, focus: { row: focusRow, col: Math.max(0, colCount - 1) } };
}

/** A selection fitted to the grid's current size; null when nothing is left to select. */
export function clampSelection(sel: GridSelection | null, rowCount: number, colCount: number): GridSelection | null {
  if (!sel || rowCount <= 0 || colCount <= 0) return null;
  const fit = (p: GridPoint) => ({ row: Math.min(p.row, rowCount - 1), col: Math.min(p.col, colCount - 1) });
  return { anchor: fit(sel.anchor), focus: fit(sel.focus) };
}

export interface SelectionSlice {
  columns: ResultColumn[];
  rows: SqlCell[][];
  /** The source row of each copied row. */
  sourceRows: number[];
  /** The source column of each copied column. */
  sourceCols: number[];
}

/** The selected rows and columns (every shown row and column without a selection), in view order. */
export function selectionSlice(
  sel: GridSelection | null,
  columns: readonly ResultColumn[],
  rows: readonly SqlCell[][],
  order: readonly number[],
): SelectionSlice {
  const b = sel ? selectionBounds(sel) : { top: 0, bottom: order.length - 1, left: 0, right: columns.length - 1 };
  const sourceRows = order.slice(b.top, b.bottom + 1);
  const sourceCols: number[] = [];
  for (let c = b.left; c <= b.right && c < columns.length; c++) sourceCols.push(c);
  return {
    columns: sourceCols.map((c) => columns[c]),
    rows: sourceRows.map((r) => sourceCols.map((c) => rows[r]?.[c] ?? null)),
    sourceRows,
    sourceCols,
  };
}

/**
 * How many text values in the copied rows and columns were cut to fit (over 1 MB, or halved to fit
 * a helper message). Exact from the result's per-cell marks; a helper that sends none gives only a
 * total, which counts only for a copy of every row and column.
 */
export function countCutText(
  result: Pick<QueryResult, 'rows' | 'columns' | 'truncatedCells' | 'cutCells'>,
  sourceRows: readonly number[],
  sourceCols: readonly number[],
): number {
  if (result.cutCells) {
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
