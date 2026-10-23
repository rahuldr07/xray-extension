import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { IconArrowDown, IconArrowUp, IconKey } from '@tabler/icons-react';
import { displayCell } from '../../models/sqlValues';
import {
  COLUMN_RESIZE_MIN_PX,
  columnTypeLabel,
  columnWidths,
  indexColumnWidth,
  type SortState,
} from '../../models/sqlGrid';
import type { QueryResult, SqlCell } from '../../models/sqlTypes';

const ROW_HEIGHT = 26;
const HEADER_HEIGHT = 40;
// The grid's monospace data font at 12 px; header labels use it too, so one width per character.
const CHAR_PX = 7.3;
const measure = (text: string) => text.length * CHAR_PX;

export interface SelectedCell {
  row: number;
  col: number;
}

// Rows and columns are both virtualized, so a 50,000-row result or a wide table mounts only what
// is visible. Cells are plain text nodes; nothing a database returns is ever parsed as markup.
// `rows` is the view (filtered and sorted); widths come from the result's own first rows, so a sort
// or filter never makes the columns jump. Mount it with a key per column set: widths reset with it.
export function ResultGrid({
  result,
  rows: viewRows,
  sort,
  onSort,
  pkColumns,
  inspected,
  onInspect,
}: {
  result: QueryResult;
  rows: SqlCell[][];
  sort: SortState | null;
  onSort(col: number): void;
  pkColumns: ReadonlySet<string>;
  inspected: SelectedCell | null;
  onInspect(cell: SelectedCell): void;
}): React.ReactElement {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const autoWidths = useMemo(() => columnWidths(result.columns, result.rows, measure), [result.columns, result.rows]);
  const [overrides, setOverrides] = useState<Record<number, number>>({});
  const widths = useMemo(() => autoWidths.map((w, i) => overrides[i] ?? w), [autoWidths, overrides]);
  const indexWidth = indexColumnWidth(viewRows.length, measure);
  // The keyboard's place in the grid: the one cell in the tab order.
  const [active, setActive] = useState<SelectedCell>({ row: 0, col: 0 });
  const focusPending = useRef(false);
  const resizing = useRef<{ col: number; startX: number; startWidth: number } | null>(null);

  // The virtualizers return fresh functions each render, so the compiler skips this component; the
  // grid is not memoized by design (the rule reports only the first call).
  // eslint-disable-next-line react-hooks/incompatible-library
  const rows = useVirtualizer({
    count: viewRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
    initialRect: { width: 1000, height: 400 },
  });
  const columns = useVirtualizer({
    horizontal: true,
    count: result.columns.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (i) => widths[i] ?? 120,
    overscan: 3,
    initialRect: { width: 1000, height: 400 },
  });
  // Variable widths: re-measure whenever one changes (auto or dragged).
  useEffect(() => {
    columns.measure();
  }, [columns, widths]);

  const activeRow = Math.min(active.row, Math.max(0, viewRows.length - 1));
  const activeCol = Math.min(active.col, Math.max(0, result.columns.length - 1));

  useEffect(() => {
    if (!focusPending.current) return;
    focusPending.current = false;
    scrollRef.current?.querySelector<HTMLElement>(`[data-cell="${activeRow}:${activeCol}"]`)?.focus({ preventScroll: true });
  });

  const width = indexWidth + columns.getTotalSize();
  const virtualColumns = columns.getVirtualItems();

  function moveTo(row: number, col: number): void {
    const r = Math.max(0, Math.min(viewRows.length - 1, row));
    const c = Math.max(0, Math.min(result.columns.length - 1, col));
    setActive({ row: r, col: c });
    rows.scrollToIndex(r);
    columns.scrollToIndex(c);
    focusPending.current = true;
  }

  function onGridKeyDown(e: React.KeyboardEvent<HTMLDivElement>): void {
    const target = e.target as HTMLElement;
    if (target.getAttribute('role') !== 'gridcell') return;
    const page = Math.max(1, Math.floor((scrollRef.current?.clientHeight ?? 400) / ROW_HEIGHT) - 2);
    const moves: Record<string, [number, number]> = {
      ArrowUp: [activeRow - 1, activeCol],
      ArrowDown: [activeRow + 1, activeCol],
      ArrowLeft: [activeRow, activeCol - 1],
      ArrowRight: [activeRow, activeCol + 1],
      PageUp: [activeRow - page, activeCol],
      PageDown: [activeRow + page, activeCol],
      Home: [activeRow, 0],
      End: [activeRow, result.columns.length - 1],
    };
    const to = moves[e.key];
    if (to) {
      e.preventDefault();
      moveTo(to[0], to[1]);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      onInspect({ row: activeRow, col: activeCol });
    }
  }

  return (
    <div
      ref={scrollRef}
      className="xray-sql-grid"
      role="grid"
      aria-label="Query results"
      aria-rowcount={viewRows.length + 1}
      aria-colcount={result.columns.length + 1}
      onKeyDown={onGridKeyDown}
    >
      <div style={{ width, height: HEADER_HEIGHT + rows.getTotalSize(), position: 'relative' }}>
        <div className="xray-sql-grid-head" role="row" aria-rowindex={1} style={{ width, height: HEADER_HEIGHT }}>
          <div className="xray-sql-grid-index" role="columnheader" style={{ width: indexWidth, height: HEADER_HEIGHT }}>
            #
          </div>
          {virtualColumns.map((col) => {
            const column = result.columns[col.index];
            const sorted = sort?.col === col.index ? sort.dir : null;
            const pk = pkColumns.has(column.name);
            return (
              <div
                key={col.key}
                className={`xray-sql-grid-th${sorted ? ' sorted' : ''}`}
                role="columnheader"
                aria-colindex={col.index + 2}
                aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none'}
                tabIndex={0}
                title={`${column.name}${column.type ? ` ${column.type}` : ''} — click to sort`}
                style={{ left: indexWidth + col.start, width: col.size, height: HEADER_HEIGHT }}
                onClick={() => onSort(col.index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSort(col.index);
                  }
                }}
              >
                <span className="xray-sql-th-name">
                  {pk && <IconKey size={12} stroke={2} role="img" aria-label="primary key" className="xray-sql-th-key" />}
                  <span className="xray-sql-th-label">{column.name}</span>
                  {sorted &&
                    (sorted === 'asc' ? (
                      <IconArrowUp size={12} stroke={2.2} aria-hidden="true" className="xray-sql-th-sort" />
                    ) : (
                      <IconArrowDown size={12} stroke={2.2} aria-hidden="true" className="xray-sql-th-sort" />
                    ))}
                </span>
                <span className="xray-sql-th-type">{columnTypeLabel(column.type)}</span>
                {/* Pointer-only: drag to resize, double-click to fit the content again. */}
                <span
                  className="xray-sql-col-resize"
                  aria-hidden="true"
                  onClick={(e) => e.stopPropagation()}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setOverrides(({ [col.index]: _dropped, ...rest }) => rest);
                  }}
                  onPointerDown={(e) => {
                    if (e.button !== 0) return;
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.setPointerCapture(e.pointerId);
                    resizing.current = { col: col.index, startX: e.clientX, startWidth: widths[col.index] };
                  }}
                  onPointerMove={(e) => {
                    const drag = resizing.current;
                    if (!drag || drag.col !== col.index) return;
                    const next = Math.max(COLUMN_RESIZE_MIN_PX, Math.round(drag.startWidth + e.clientX - drag.startX));
                    setOverrides((prev) => (prev[drag.col] === next ? prev : { ...prev, [drag.col]: next }));
                  }}
                  onPointerUp={(e) => {
                    resizing.current = null;
                    e.currentTarget.releasePointerCapture(e.pointerId);
                  }}
                  onPointerCancel={() => {
                    resizing.current = null;
                  }}
                />
              </div>
            );
          })}
        </div>
        {rows.getVirtualItems().map((row) => {
          const cells = viewRows[row.index];
          return (
            <div
              key={row.key}
              className="xray-sql-grid-row"
              role="row"
              aria-rowindex={row.index + 2}
              style={{ top: HEADER_HEIGHT + row.start, height: row.size, width }}
            >
              <div className="xray-sql-grid-index" role="rowheader" style={{ width: indexWidth, height: row.size }}>
                {row.index + 1}
              </div>
              {virtualColumns.map((col) => {
                const shown = displayCell(cells[col.index] ?? null, result.columns[col.index].type);
                const isInspected = inspected?.row === row.index && inspected.col === col.index;
                const isActive = activeRow === row.index && activeCol === col.index;
                return (
                  <div
                    key={col.key}
                    role="gridcell"
                    aria-colindex={col.index + 2}
                    aria-selected={isInspected}
                    tabIndex={isActive ? 0 : -1}
                    data-cell={`${row.index}:${col.index}`}
                    className={`xray-sql-grid-cell kind-${shown.kind}${isInspected ? ' selected' : ''}`}
                    style={{ left: indexWidth + col.start, width: col.size, height: row.size }}
                    onClick={() => {
                      setActive({ row: row.index, col: col.index });
                      onInspect({ row: row.index, col: col.index });
                    }}
                  >
                    {shown.text.length > 400 ? shown.text.slice(0, 400) : shown.text}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
