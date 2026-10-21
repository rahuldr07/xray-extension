// Engine values to lossless cells, cell rendering, and the CSV / JSON / INSERT copy formats.
// Pure logic; keep React and the runtime out of this file.

import { parseJson } from './jsonText';
import { DEFAULT_MAX_ROWS, MAX_MAX_ROWS } from './sqlTypes';
import type { ResultColumn, SqlCell, SqlDialect } from './sqlTypes';

export const CELL_DISPLAY_LIMIT = 65536;
const BLOB_PREVIEW_BYTES = 256;

type Blob = { hex: string; length: number };
export type CellKind = 'null' | 'number' | 'text' | 'blob' | 'boolean' | 'json';

function isBlob(cell: SqlCell): cell is Blob {
  return typeof cell === 'object' && cell !== null;
}

export function toCell(raw: unknown): SqlCell {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'bigint') return raw.toString();
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : String(raw);
  if (typeof raw === 'boolean') return raw;
  if (raw instanceof Uint8Array) {
    let hex = '';
    const n = Math.min(raw.length, BLOB_PREVIEW_BYTES);
    for (let i = 0; i < n; i++) hex += raw[i].toString(16).padStart(2, '0');
    return { hex, length: raw.length };
  }
  return String(raw);
}

export function displayCell(cell: SqlCell): { text: string; truncated: boolean; kind: CellKind } {
  if (cell === null) return { text: 'NULL', truncated: false, kind: 'null' };
  if (typeof cell === 'number') return { text: String(cell), truncated: false, kind: 'number' };
  if (typeof cell === 'boolean') return { text: String(cell), truncated: false, kind: 'boolean' };
  if (isBlob(cell)) {
    return { text: `\\x${cell.hex}… (${cell.length} bytes)`, truncated: false, kind: 'blob' };
  }
  const truncated = cell.length > CELL_DISPLAY_LIMIT;
  const text = truncated ? cell.slice(0, CELL_DISPLAY_LIMIT) : cell;
  const head = cell.trimStart()[0];
  // The shared lossless parser, not JSON.parse: this repo reads every JSON text through it.
  const json = (head === '{' || head === '[') && parseJson(cell).ok;
  return { text, truncated, kind: json ? 'json' : 'text' };
}

function csvField(cell: SqlCell): string {
  if (cell === null) return '';
  const s = isBlob(cell) ? cell.hex : String(cell);
  return /[,"\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(columns: ResultColumn[], rows: SqlCell[][]): string {
  const lines = [columns.map((c) => csvField(c.name)).join(',')];
  for (const row of rows) lines.push(row.map(csvField).join(','));
  return lines.join('\r\n');
}

export function toJsonRows(columns: ResultColumn[], rows: SqlCell[][]): string {
  const objects = rows.map((row) => {
    const o: Record<string, SqlCell> = {};
    columns.forEach((c, i) => {
      o[c.name] = row[i] ?? null;
    });
    return o;
  });
  return JSON.stringify(objects, null, 2);
}

export function quoteIdent(name: string, dialect: SqlDialect): string {
  const q = dialect === 'mysql' ? '`' : '"';
  return q + name.split(q).join(q + q) + q;
}

function sqlLiteral(cell: SqlCell): string {
  if (cell === null) return 'NULL';
  if (typeof cell === 'number') return String(cell);
  if (typeof cell === 'boolean') return cell ? 'TRUE' : 'FALSE';
  if (isBlob(cell)) return `X'${cell.hex}'`;
  return `'${cell.replace(/'/g, "''")}'`;
}

export function toInsertStatements(
  table: string,
  columns: ResultColumn[],
  rows: SqlCell[][],
  dialect: SqlDialect,
): string {
  const head = `INSERT INTO ${quoteIdent(table, dialect)} (${columns.map((c) => quoteIdent(c.name, dialect)).join(', ')}) VALUES (`;
  return rows.map((row) => `${head}${row.map(sqlLiteral).join(', ')});`).join('\n');
}

// R9: a blob preview is cut at BLOB_PREVIEW_BYTES, so a cut blob carries less hex than its length.
export function isTruncatedBlob(cell: SqlCell): cell is Blob {
  return isBlob(cell) && cell.hex.length < cell.length * 2;
}

export function countTruncatedBlobs(rows: SqlCell[][]): number {
  let n = 0;
  for (const row of rows) for (const cell of row) if (isTruncatedBlob(cell)) n++;
  return n;
}

export function truncatedBlobNotice(count: number): string {
  return `${count} blob values were truncated to ${BLOB_PREVIEW_BYTES} bytes`;
}

// INSERT copy: one statement per row, each row with cut blobs preceded by one comment line listing
// their full sizes. Built per row, so a text literal containing a newline is never split.
export function toInsertCopy(
  table: string,
  columns: ResultColumn[],
  rows: SqlCell[][],
  dialect: SqlDialect,
): { text: string; truncatedBlobs: number } {
  const lines: string[] = [];
  let truncatedBlobs = 0;
  for (const row of rows) {
    const sizes = row.filter(isTruncatedBlob).map((cell) => `${cell.length} bytes`);
    if (sizes.length) lines.push(`-- blob truncated: ${sizes.join(', ')}`);
    truncatedBlobs += sizes.length;
    lines.push(toInsertStatements(table, columns, [row], dialect));
  }
  return { text: lines.join('\n'), truncatedBlobs };
}

export function clampMaxRows(n: number): number {
  if (Number.isNaN(n)) return DEFAULT_MAX_ROWS;
  return Math.min(MAX_MAX_ROWS, Math.max(1, Math.trunc(n)));
}
