import React, { useMemo, useState } from 'react';
import { IconLayoutSidebarRightExpand, IconWindowMaximize } from '@tabler/icons-react';
import { JsonView } from '../detail/JsonView';
import { describeResult, formatResultBytes, tableColumns, TABLE_MAX_ROWS, type ResultDescription } from '../../models/consoleResults';
import { safeStringify } from '../../utils';

export type ResultViewMode = 'table' | 'tree' | 'json';

const JSON_TEXT_LIMIT = 200_000;

/**
 * `table(rows)` / `toTable(rows)` come back as a render marker around the rows. The
 * marker only steers rendering: `$_`, saved variables and inspector paths use the rows.
 */
export function unwrap(value: unknown): { value: unknown; forceTable: boolean } {
  if (value && typeof value === 'object' && !Array.isArray(value) &&
    (value as Record<string, unknown>).__xr_render === 'table') {
    const data = (value as Record<string, unknown>).data;
    return { value: data, forceTable: Array.isArray(data) && !!tableColumns(data) };
  }
  return { value, forceTable: false };
}

// The evaluator serializes these to strings ("[Function: f]", "12n", "Symbol(x)");
// their badge comes from the evaluator's type, and they display unquoted.
const STRINGIFIED_TYPES = new Set(['function', 'bigint', 'symbol']);

export interface DescribedResult {
  value: unknown;
  description: ResultDescription;
  /** Display the (string) value as-is, without JSON quotes. */
  raw: boolean;
}

/** Describe a command result once; the cell and the view share it. */
export function describeCommandResult(rawValue: unknown, type: string, truncated = false): DescribedResult {
  const { value, forceTable } = unwrap(rawValue);
  let description = describeResult(value, type);
  if (forceTable && description.kind !== 'table') {
    description = { ...description, kind: 'table', columns: tableColumns(value as unknown[]) ?? [] };
  }
  if (typeof value === 'string' && STRINGIFIED_TYPES.has(type)) {
    return { value, description: { ...description, kind: 'scalar', badge: type }, raw: true };
  }
  // An object too large for the transfer limit arrives as clipped JSON text.
  if (typeof value === 'string' && truncated && (type === 'object' || type === 'array')) {
    description = { ...description, badge: `${type} · truncated JSON · ${formatResultBytes(description.bytes)}` };
  }
  return { value, description, raw: false };
}

/** What Copy puts on the clipboard: scalars raw, everything else as formatted JSON. */
export function resultCopyText(raw: unknown): string {
  const { value } = unwrap(raw);
  if (typeof value === 'string') return value;
  if (value === undefined) return 'undefined';
  if (value === null || typeof value !== 'object') return String(value);
  try {
    const json = JSON.stringify(value, null, 2);
    if (json !== undefined) return json;
  } catch {
    // Cyclic or otherwise unserializable: fall through to the bounded serializer.
  }
  return safeStringify(value, 2, JSON_TEXT_LIMIT);
}

function scalarText(value: unknown): string {
  if (typeof value === 'string') return JSON.stringify(value);
  if (value === undefined) return 'undefined';
  return String(value);
}

function scalarClass(value: unknown): string {
  if (typeof value === 'string') return 'xray-json-string';
  if (typeof value === 'number') return 'xray-json-number';
  if (typeof value === 'boolean') return 'xray-json-bool';
  return 'xray-json-null';
}

function cellText(value: unknown): string {
  if (value === undefined) return '';
  if (value === null) return 'null';
  if (Array.isArray(value)) return `Array(${value.length})`;
  if (typeof value === 'object') return '{…}';
  return String(value);
}

export function ResultTable({ rows, columns }: { rows: unknown[]; columns: string[] }): React.ReactElement {
  const shown = rows.slice(0, TABLE_MAX_ROWS);
  return (
    <div className="xray-result-table-wrap">
      <table className="xray-table xray-result-table" aria-label="Result table">
        <thead>
          <tr>{columns.map((column) => <th key={column} scope="col">{column}</th>)}</tr>
        </thead>
        <tbody>
          {shown.map((row, index) => {
            const record = row && typeof row === 'object' ? row as Record<string, unknown> : {};
            return (
              <tr key={index}>
                {columns.map((column) => {
                  const text = cellText(record[column]);
                  return <td key={column} title={text.length > 40 ? text : undefined}>{text}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {rows.length > shown.length && <p className="xray-result-more">+{rows.length - shown.length} more</p>}
    </div>
  );
}

/**
 * One command result. Scalars render as a single inline line (the cell puts it in
 * its header); text, tables and trees render a toolbar — type badge, view switch,
 * the caller's `actions` — above the body. The view choice can be controlled so it
 * survives the virtualized row unmounting.
 */
export function ResultView({ value: rawValue, type, described, truncated, onOpenInspector, inspectId, actions, view, onViewChange }: {
  value: unknown;
  type: string;
  /** Pass when already computed (CommandCell) to avoid describing twice. */
  described?: DescribedResult;
  truncated?: boolean;
  /** When given, a big object/array renders as a summary with Open in inspector (C6). */
  onOpenInspector?: (value: unknown) => void;
  /** Tags the Open in inspector control so closing the inspector can return focus to it. */
  inspectId?: string;
  actions?: React.ReactNode;
  view?: ResultViewMode;
  onViewChange?: (view: ResultViewMode) => void;
}): React.ReactElement {
  const own = useMemo(
    () => described ?? describeCommandResult(rawValue, type, truncated),
    [described, rawValue, type, truncated],
  );
  const { value, description, raw } = own;
  const [localView, setLocalView] = useState<ResultViewMode | null>(null);
  const tableAllowed = description.kind === 'table';
  const requested = view ?? localView;
  const current: ResultViewMode = requested && (requested !== 'table' || tableAllowed)
    ? requested
    : tableAllowed ? 'table' : 'tree';
  const jsonText = useMemo(
    () => (current === 'json' && description.kind !== 'scalar' && description.kind !== 'text' ? safeStringify(value, 2, JSON_TEXT_LIMIT) : ''),
    [current, description.kind, value],
  );
  const choose = (next: ResultViewMode): void => {
    setLocalView(next);
    onViewChange?.(next);
  };

  if (description.kind === 'scalar') {
    return (
      <span className="xray-result-inline">
        <span className="xray-result-arrow" aria-hidden="true">→</span>
        <code className={`xray-result-scalar ${raw ? 'xray-json-punct' : scalarClass(value)}`} title={raw ? String(value) : scalarText(value)}>{raw ? String(value) : scalarText(value)}</code>
        <span className="xray-result-badge">{description.badge}</span>
        {actions}
      </span>
    );
  }

  // C6: a big object/array is a badge, a one-line shape summary and Open in inspector.
  if (onOpenInspector && description.big && (description.kind === 'tree' || description.kind === 'table')) {
    return (
      <div className="xray-result is-big">
        <div className="xray-result-bar">
          <span className="xray-result-badge">{description.badge}</span>
          <span className="xray-result-actions">{actions}</span>
        </div>
        <div className="xray-result-big">
          <code className="xray-result-summary" title={description.summary}>{description.summary}</code>
          <button type="button" className="xray-btn xray-result-inspect" aria-label="Open in inspector" data-inspect-id={inspectId} onClick={() => onOpenInspector(value)}>
            <IconLayoutSidebarRightExpand size={15} stroke={1.8} /><span>Open in inspector</span>
          </button>
        </div>
      </div>
    );
  }

  const modes: Array<{ id: ResultViewMode; label: string }> = description.kind === 'text'
    ? []
    : [...(tableAllowed ? [{ id: 'table' as const, label: 'Table' }] : []), { id: 'tree', label: 'Tree' }, { id: 'json', label: 'JSON' }];

  return (
    <div className="xray-result">
      <div className="xray-result-bar">
        <span className="xray-result-badge">{description.badge}</span>
        {modes.length > 0 && (
          <div className="xray-result-views" role="group" aria-label="Result view">
            {modes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                className="xray-result-view-btn"
                aria-label={`${mode.label} view`}
                aria-pressed={current === mode.id}
                onClick={() => choose(mode.id)}
              >
                {mode.label}
              </button>
            ))}
          </div>
        )}
        <span className="xray-result-actions">
          {onOpenInspector && (
            <button type="button" className="xray-icon-btn xray-result-action" aria-label="Open in inspector" title="Open in inspector" data-inspect-id={inspectId} onClick={() => onOpenInspector(value)}>
              <IconWindowMaximize size={15} stroke={1.8} />
            </button>
          )}
          {actions}
        </span>
      </div>
      <div className="xray-result-body">
        {description.kind === 'text' ? (
          <pre className="xray-result-text">{String(value)}</pre>
        ) : current === 'table' ? (
          <ResultTable rows={value as unknown[]} columns={description.columns} />
        ) : current === 'json' ? (
          <pre className="xray-json xray-result-json">{jsonText}</pre>
        ) : (
          <JsonView value={value} />
        )}
      </div>
    </div>
  );
}
