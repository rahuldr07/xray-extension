import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { displayCell } from '../../models/sqlValues';
import type { QueryResult } from '../../models/sqlTypes';

const ROW_HEIGHT = 26;
const HEADER_HEIGHT = 28;
const INDEX_WIDTH = 56;
const COLUMN_WIDTH = 180;

export interface SelectedCell {
  row: number;
  col: number;
}

// Rows and columns are both virtualized, so a 50,000-row result or a wide table mounts only what
// is visible. Cells are plain text nodes; nothing a database returns is ever parsed as markup.
export function ResultGrid({
  result,
  selected,
  onSelect,
}: {
  result: QueryResult;
  selected: SelectedCell | null;
  onSelect(cell: SelectedCell): void;
}): React.ReactElement {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  // The virtualizers return fresh functions each render, so the compiler skips this component; the
  // grid is not memoized by design (the rule reports only the first call).
  // eslint-disable-next-line react-hooks/incompatible-library
  const rows = useVirtualizer({
    count: result.rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
    initialRect: { width: 1000, height: 400 },
  });
  const columns = useVirtualizer({
    horizontal: true,
    count: result.columns.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => COLUMN_WIDTH,
    overscan: 3,
    initialRect: { width: 1000, height: 400 },
  });
  const width = INDEX_WIDTH + columns.getTotalSize();
  const virtualColumns = columns.getVirtualItems();

  return (
    <div
      ref={scrollRef}
      className="xray-sql-grid"
      role="grid"
      aria-label="Query results"
      aria-rowcount={result.rows.length + 1}
      aria-colcount={result.columns.length + 1}
    >
      <div style={{ width, height: HEADER_HEIGHT + rows.getTotalSize(), position: 'relative' }}>
        <div className="xray-sql-grid-head" role="row" aria-rowindex={1} style={{ width, height: HEADER_HEIGHT }}>
          <div className="xray-sql-grid-index" role="columnheader" style={{ width: INDEX_WIDTH, height: HEADER_HEIGHT }}>
            #
          </div>
          {virtualColumns.map((col) => {
            const column = result.columns[col.index];
            return (
              <div
                key={col.key}
                className="xray-sql-grid-th"
                role="columnheader"
                aria-colindex={col.index + 2}
                title={column.type ? `${column.name} ${column.type}` : column.name}
                style={{ left: INDEX_WIDTH + col.start, width: col.size, height: HEADER_HEIGHT }}
              >
                {column.name}
              </div>
            );
          })}
        </div>
        {rows.getVirtualItems().map((row) => {
          const cells = result.rows[row.index];
          return (
            <div
              key={row.key}
              className="xray-sql-grid-row"
              role="row"
              aria-rowindex={row.index + 2}
              style={{ top: HEADER_HEIGHT + row.start, height: row.size, width }}
            >
              <div className="xray-sql-grid-index" role="rowheader" style={{ width: INDEX_WIDTH, height: row.size }}>
                {row.index + 1}
              </div>
              {virtualColumns.map((col) => {
                const shown = displayCell(cells[col.index] ?? null, result.columns[col.index].type);
                const isSelected = selected?.row === row.index && selected.col === col.index;
                return (
                  <div
                    key={col.key}
                    role="gridcell"
                    aria-colindex={col.index + 2}
                    aria-selected={isSelected}
                    className={`xray-sql-grid-cell kind-${shown.kind}${isSelected ? ' selected' : ''}`}
                    style={{ left: INDEX_WIDTH + col.start, width: col.size, height: row.size }}
                    onClick={() => onSelect({ row: row.index, col: col.index })}
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
