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
import { extendSelection, selectAll, selectionLookup, selectRows, type GridSelection } from '../../models/sqlSelection';
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
// The range selection (models/sqlSelection.ts) is kept as source rows (`order` maps a view row to
// its source row), so a sort or filter keeps it: Shift+click or Shift+arrows
// extend it, a row number selects its row (Shift+click extends), Ctrl/⌘+A selects all and
// Ctrl/⌘+C asks the pane to copy it (or the active cell).
export function ResultGrid({
  result,
  rows: viewRows,
  order,
  sort,
  onSort,
  pkColumns,
  inspected,
  onInspect,
  selection,
  onSelect,
  onCopy,
}: {
  result: QueryResult;
  rows: SqlCell[][];
  order: readonly number[];
  sort: SortState | null;
  onSort(col: number): void;
  pkColumns: ReadonlySet<string>;
  inspected: SelectedCell | null;
  onInspect(cell: SelectedCell): void;
  selection: GridSelection | null;
  onSelect(selection: GridSelection | null): void;
  onCopy(active: SelectedCell): void;
}): React.ReactElement {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const autoWidths = useMemo(() => columnWidths(result.columns, result.rows, measure), [result.columns, result.rows]);
  const [overrides, setOverrides] = useState<Record<number, number>>({});
  const widths = useMemo(() => autoWidths.map((w, i) => overrides[i] ?? w), [autoWidths, overrides]);
  const indexWidth = indexColumnWidth(viewRows.length, measure);
  // The keyboard's place in the grid (APG grid pattern): one roving tab stop among the cells, and one
  // among the column headers. ArrowUp from the first row enters the header; ArrowDown leaves it.
  const [active, setActive] = useState<SelectedCell>({ row: 0, col: 0 });
  const [headCol, setHeadCol] = useState(0);
  const focusPending = useRef<'cell' | 'head' | null>(null);
  // Forces the render that runs the focus effect when a move lands on the current position.
  const [, setMoves] = useState(0);
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
  const activeHead = Math.min(headCol, Math.max(0, result.columns.length - 1));

  useEffect(() => {
    const pending = focusPending.current;
    if (!pending) return;
    focusPending.current = null;
    const selector = pending === 'head' ? `[data-head="${activeHead}"]` : `[data-cell="${activeRow}:${activeCol}"]`;
    scrollRef.current?.querySelector<HTMLElement>(selector)?.focus({ preventScroll: true });
  });

  const width = indexWidth + columns.getTotalSize();
  const selected = useMemo(() => selectionLookup(selection), [selection]);
  const virtualColumns = columns.getVirtualItems();

  function moveTo(row: number, col: number): void {
    setMoves((n) => n + 1);
    onSelect(null);
    const c = Math.max(0, Math.min(result.columns.length - 1, col));
    columns.scrollToIndex(c);
    if (row < 0 || !viewRows.length) {
      setHeadCol(c);
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
      focusPending.current = 'head';
      return;
    }
    const r = Math.min(viewRows.length - 1, row);
    setActive({ row: r, col: c });
    rows.scrollToIndex(r);
    focusPending.current = 'cell';
  }

  function onHeadKeyDown(e: React.KeyboardEvent<HTMLDivElement>): void {
    const moves: Record<string, number> = {
      ArrowLeft: activeHead - 1,
      ArrowRight: activeHead + 1,
      Home: 0,
      End: result.columns.length - 1,
    };
    if (e.key in moves) {
      e.preventDefault();
      moveTo(-1, moves[e.key]);
    } else if (e.key === 'ArrowDown' && viewRows.length) {
      e.preventDefault();
      moveTo(0, activeHead);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSort(activeHead);
    }
  }

  // Shift+arrow: the selection's far corner moves, within the cells (never into the header).
  function extendTo(row: number, col: number): void {
    setMoves((n) => n + 1);
    const r = Math.max(0, Math.min(viewRows.length - 1, row));
    const c = Math.max(0, Math.min(result.columns.length - 1, col));
    onSelect(extendSelection(selection, order, { row: activeRow, col: activeCol }, { row: r, col: c }));
    setActive({ row: r, col: c });
    columns.scrollToIndex(c);
    rows.scrollToIndex(r);
    focusPending.current = 'cell';
  }

  function onGridKeyDown(e: React.KeyboardEvent<HTMLDivElement>): void {
    const target = e.target as HTMLElement;
    if (target.getAttribute('role') === 'columnheader') {
      onHeadKeyDown(e);
      return;
    }
    if (target.getAttribute('role') !== 'gridcell') return;
    const mod = e.ctrlKey || e.metaKey;
    if (mod && !e.altKey && !e.shiftKey && (e.key === 'a' || e.key === 'A')) {
      e.preventDefault();
      onSelect(selectAll(order, result.columns.length));
      return;
    }
    if (mod && !e.altKey && !e.shiftKey && (e.key === 'c' || e.key === 'C')) {
      e.preventDefault();
      onCopy({ row: activeRow, col: activeCol });
      return;
    }
    if (e.key === 'Escape' && selection) {
      // The first Escape clears the selection; the next closes the inspector.
      e.preventDefault();
      e.stopPropagation();
      onSelect(null);
      return;
    }
    const page = Math.max(1, Math.floor((scrollRef.current?.clientHeight ?? 400) / ROW_HEIGHT) - 2);
    const moves: Record<string, [number, number]> = {
      // From the first row, up enters the header row.
      ArrowUp: [activeRow - 1, activeCol],
      ArrowDown: [activeRow + 1, activeCol],
      ArrowLeft: [activeRow, activeCol - 1],
      ArrowRight: [activeRow, activeCol + 1],
      PageUp: [Math.max(0, activeRow - page), activeCol],
      PageDown: [activeRow + page, activeCol],
      Home: [activeRow, 0],
      End: [activeRow, result.columns.length - 1],
    };
    const to = moves[e.key];
    if (to && e.shiftKey) {
      e.preventDefault();
      extendTo(to[0], to[1]);
    } else if (to) {
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
      aria-multiselectable="true"
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
                tabIndex={activeHead === col.index ? 0 : -1}
                data-head={col.index}
                onFocus={() => setHeadCol(col.index)}
                title={`${column.name}${column.type ? ` ${column.type}` : ''} — click to sort`}
                style={{ left: indexWidth + col.start, width: col.size, height: HEADER_HEIGHT }}
                onClick={() => {
                  setHeadCol(col.index);
                  onSort(col.index);
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
              className={`xray-sql-grid-row${inspected?.row === row.index ? ' inspected' : ''}`}
              role="row"
              aria-rowindex={row.index + 2}
              style={{ top: HEADER_HEIGHT + row.start, height: row.size, width }}
            >
              <div
                className="xray-sql-grid-index"
                role="rowheader"
                title="Click to select the row, Shift+click to select rows"
                style={{ width: indexWidth, height: row.size }}
                onMouseDown={(e) => {
                  if (e.shiftKey) e.preventDefault();
                }}
                onClick={(e) => {
                  onSelect(selectRows(selection, order, activeRow, row.index, result.columns.length, e.shiftKey));
                  // Focus follows the active cell, so Ctrl/⌘+C and Ctrl/⌘+A work next.
                  setMoves((n) => n + 1);
                  setActive({ row: row.index, col: activeCol });
                  focusPending.current = 'cell';
                }}
              >
                {row.index + 1}
              </div>
              {virtualColumns.map((col) => {
                const shown = displayCell(cells[col.index] ?? null, result.columns[col.index].type);
                const isInspected = inspected?.row === row.index && inspected.col === col.index;
                const isActive = activeRow === row.index && activeCol === col.index;
                const inSelection = selected(order[row.index], col.index);
                return (
                  <div
                    key={col.key}
                    role="gridcell"
                    aria-colindex={col.index + 2}
                    // With a range, selected means in the range; else the inspected cell.
                    aria-selected={selection ? inSelection : isInspected}
                    tabIndex={isActive ? 0 : -1}
                    data-cell={`${row.index}:${col.index}`}
                    onFocus={() => {
                      if (!isActive) setActive({ row: row.index, col: col.index });
                    }}
                    className={`xray-sql-grid-cell kind-${shown.kind}${isInspected ? ' selected' : ''}${inSelection ? ' in-selection' : ''}`}
                    style={{ left: indexWidth + col.start, width: col.size, height: row.size }}
                    onMouseDown={(e) => {
                      // Shift+click extends the range; keep the browser from selecting text.
                      if (e.shiftKey) e.preventDefault();
                    }}
                    onClick={(e) => {
                      const at = { row: row.index, col: col.index };
                      if (e.shiftKey) {
                        onSelect(extendSelection(selection, order, { row: activeRow, col: activeCol }, at));
                        setMoves((n) => n + 1);
                        setActive(at);
                        focusPending.current = 'cell';
                        return;
                      }
                      onSelect(null);
                      setActive(at);
                      onInspect(at);
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
