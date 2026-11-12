import React, { useMemo, useState } from 'react';
import { IconChevronDown, IconLayoutSidebarRightExpand, IconWindowMaximize } from '@tabler/icons-react';
import { JsonView } from '../detail/JsonView';
import {
  cellText,
  describeCommandResult,
  resultDisplay,
  resultJsonText,
  resultRows,
  tableCell,
  TABLE_MAX_ROWS,
  type DescribedResult,
} from '../../models/consoleResults';
import { logDisplay, logKind, logValueText } from '../../models/logValue';
import { TreeLeaf } from '../../models/treeDisplay';

export type ResultViewMode = 'table' | 'tree' | 'json';

// A command result is the typed log model (spec J8): plain JSON plus "$xray" envelopes for what
// JSON cannot hold. It is shown as the Logs show those values — 10n, NaN, undefined, Map(2) —
// never as an envelope; the JSON view and Copy use the JSON projection (models/consoleResults.ts).

const LEAF_CLASS: Record<TreeLeaf['tone'], string> = {
  string: 'xray-json-string',
  number: 'xray-json-number',
  bool: 'xray-json-bool',
  null: 'xray-json-null',
  typed: 'xray-json-typed',
  muted: 'xray-json-muted',
  source: 'xray-json-source',
};

/** An inline scalar's text: a string quoted, a typed value as the Logs write it (`10n`, `ƒ f()`). */
function scalarText(value: unknown): string {
  if (typeof value === 'string') return JSON.stringify(value);
  if (value === undefined) return 'undefined';
  if (value !== null && typeof value === 'object') return logValueText(value);
  return String(value);
}

function scalarClass(value: unknown): string {
  if (typeof value === 'string') return 'xray-json-string';
  if (typeof value === 'number') return 'xray-json-number';
  if (typeof value === 'boolean') return 'xray-json-bool';
  if (logKind(value)) {
    const shown = logDisplay(value);
    if (shown instanceof TreeLeaf) return LEAF_CLASS[shown.tone];
  }
  return 'xray-json-null';
}

/** A text result's body: a long string, or a cut one's first characters and an ellipsis. */
function textBody(value: unknown): string {
  return typeof value === 'string' ? value : logValueText(value, { top: true, limit: 1_000_000 });
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
          {shown.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => {
                const text = cellText(tableCell(row, column));
                return <td key={column} title={text.length > 40 ? text : undefined}>{text}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > shown.length && <p className="xray-result-more">+{rows.length - shown.length} more</p>}
    </div>
  );
}

/** A console cap, stated ("Showing 1,000 of 5,000 items"). */
export function ResultNotice({ notice }: { notice: string | null }): React.ReactElement | null {
  return notice ? <span className="xray-result-notice">{notice}</span> : null;
}

/**
 * One command result. Scalars render as a single inline line (the cell puts it in
 * its header); text, tables and trees render a toolbar — type badge, view switch,
 * the caller's `actions` — above the body. The view choice can be controlled so it
 * survives the virtualized row unmounting.
 */
export function ResultView({ value: rawValue, type, described, table, onOpenInspector, inspectId, actions, view, onViewChange }: {
  value: unknown;
  type: string;
  /** Pass when already computed (CommandCell) to avoid describing twice. */
  described?: DescribedResult;
  /** table() returned the value (the out-of-band flag): lay its rows out as a table. */
  table?: boolean;
  /** When given, a big object/array renders as a summary with Open in inspector (C6). */
  onOpenInspector?: (value: unknown) => void;
  /** Tags the Open in inspector control so closing the inspector can return focus to it. */
  inspectId?: string;
  actions?: React.ReactNode;
  view?: ResultViewMode;
  onViewChange?: (view: ResultViewMode) => void;
}): React.ReactElement {
  const own = useMemo(
    () => described ?? describeCommandResult(rawValue, type, table),
    [described, rawValue, type, table],
  );
  const { value, description } = own;
  const [localView, setLocalView] = useState<ResultViewMode | null>(null);
  // C6 / G16: a big result's one-line preview opens inline on demand (buckets for a big array).
  const [bigOpen, setBigOpen] = useState(false);
  const tableAllowed = description.kind === 'table';
  const requested = view ?? localView;
  const current: ResultViewMode = requested && (requested !== 'table' || tableAllowed)
    ? requested
    : tableAllowed ? 'table' : 'tree';
  const jsonText = useMemo(
    () => (current === 'json' && description.kind !== 'scalar' && description.kind !== 'text' ? resultJsonText(value) : ''),
    [current, description.kind, value],
  );
  const isBig = !!onOpenInspector && description.big && (description.kind === 'tree' || description.kind === 'table');
  const treeShown = isBig ? bigOpen : current === 'tree';
  // The console Tree (spec §1): bare keys, > 5 keys/items collapsed to a preview, buckets.
  const display = useMemo(
    () => (treeShown && (description.kind === 'tree' || description.kind === 'table') ? resultDisplay(value) : null),
    [treeShown, description.kind, value],
  );
  // The one-line summary is the console preview (describeResult); the open Tree shows the value itself.
  const bigPreview = description.summary;
  const choose = (next: ResultViewMode): void => {
    setLocalView(next);
    onViewChange?.(next);
  };

  if (description.kind === 'scalar') {
    const text = scalarText(value);
    return (
      <span className="xray-result-inline">
        <span className="xray-result-arrow" aria-hidden="true">→</span>
        <code className={`xray-result-scalar ${scalarClass(value)}`} title={text}>{text}</code>
        <span className="xray-result-badge">{description.badge}</span>
        {actions}
      </span>
    );
  }

  // C6: a big object/array is a badge, its one-line preview and Open in inspector; the preview's
  // arrow opens it inline (G16: a big array in [0 … 99] buckets).
  if (isBig && onOpenInspector) {
    return (
      <div className="xray-result is-big">
        <div className="xray-result-bar">
          <span className="xray-result-badge">{description.badge}</span>
          <ResultNotice notice={description.notice} />
          <span className="xray-result-actions">{actions}</span>
        </div>
        <div className="xray-result-big">
          <button
            type="button"
            className="xray-icon-btn xray-result-expand"
            aria-expanded={bigOpen}
            aria-label={bigOpen ? 'Collapse result' : 'Expand result'}
            title={bigOpen ? 'Collapse' : 'Expand inline'}
            onClick={() => setBigOpen((open) => !open)}
          >
            <IconChevronDown size={14} stroke={2.2} className={`xray-json-chevron ${bigOpen ? '' : 'closed'}`} />
          </button>
          {bigOpen
            ? <span className="xray-result-summary" aria-hidden="true" />
            : <code className="xray-result-summary" title={bigPreview}>{bigPreview}</code>}
          <button type="button" className="xray-btn xray-result-inspect" aria-label="Open in inspector" data-inspect-id={inspectId} onClick={() => onOpenInspector(value)}>
            <IconLayoutSidebarRightExpand size={15} stroke={1.8} /><span>Open in inspector</span>
          </button>
        </div>
        {bigOpen && display !== null && (
          <div className="xray-result-body">
            <JsonView value={display} variant="console" rootOpen />
          </div>
        )}
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
        <ResultNotice notice={description.notice} />
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
          <pre className="xray-result-text">{textBody(value)}</pre>
        ) : current === 'table' ? (
          <ResultTable rows={resultRows(value) ?? []} columns={description.columns} />
        ) : current === 'json' ? (
          <pre className="xray-json xray-result-json">{jsonText}</pre>
        ) : (
          <JsonView value={display} variant="console" />
        )}
      </div>
    </div>
  );
}
