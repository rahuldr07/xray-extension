import React, { useEffect, useMemo, useRef, useState } from 'react';
import { IconCopy, IconFilter, IconX } from '@tabler/icons-react';
import { resultSummary, usePanelSqlStore, type SqlBottomTab } from '../../sqlStore';
import { clampMaxRows, countTruncatedBlobs, displayCell, toCsv, toInsertCopy, toJsonRows, truncatedBlobNotice } from '../../models/sqlValues';
import { parseJson, toValue } from '../../models/jsonText';
import { cellCopyText, filteredSummary, filterRows, nextSort, sortRows, type SortState } from '../../models/sqlGrid';
import type { QueryResult, SchemaTree, SqlCell } from '../../models/sqlTypes';
import { JsonView } from '../detail/JsonView';
import { ResultGrid, type SelectedCell } from './ResultGrid';

type CopyFormat = 'CSV' | 'JSON' | 'INSERT';

function copyText(format: CopyFormat, result: QueryResult, table: string): { text: string; truncated: number } {
  if (format === 'INSERT') {
    const { text, truncatedBlobs } = toInsertCopy(table, result.columns, result.rows, 'sqlite');
    return { text, truncated: truncatedBlobs };
  }
  const text = format === 'CSV' ? toCsv(result.columns, result.rows) : toJsonRows(result.columns, result.rows);
  return { text, truncated: countTruncatedBlobs(result.rows) };
}

function Inspector({
  result,
  rows,
  cell,
  onClose,
  onToast,
}: {
  result: QueryResult;
  rows: SqlCell[][];
  cell: SelectedCell;
  onClose(): void;
  onToast(...lines: string[]): void;
}): React.ReactElement {
  const column = result.columns[cell.col];
  const raw = rows[cell.row]?.[cell.col] ?? null;
  const shown = displayCell(raw, column?.type);
  const json = React.useMemo(() => {
    if (shown.kind !== 'json') return null;
    const doc = parseJson(shown.text);
    return doc.ok ? { value: toValue(doc.root) } : null;
  }, [shown.kind, shown.text]);

  async function copyValue(): Promise<void> {
    const { text, truncatedBlob } = cellCopyText(raw, column?.type);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      onToast('Could not copy to the clipboard.');
      return;
    }
    // R9: a cut blob copies only its preview bytes, and says so in the notice's own words.
    if (truncatedBlob) onToast('Copied the value.', truncatedBlobNotice(1));
    else onToast('Copied the value.');
  }

  return (
    <aside className="xray-sql-inspector" aria-label="Cell inspector">
      <header className="xray-sql-inspector-head">
        <span className="xray-sql-inspector-title">
          {column?.name ?? ''} <span className="xray-sql-muted">row {cell.row + 1} · {shown.kind}</span>
        </span>
        <button className="xray-btn xray-btn-sm" onClick={() => void copyValue()}>
          <IconCopy size={13} stroke={1.8} aria-hidden="true" />
          Copy value
        </button>
        <button className="xray-icon-btn" aria-label="Close cell inspector" title="Close (Escape)" onClick={onClose}>
          <IconX size={14} stroke={1.8} />
        </button>
      </header>
      <div className="xray-sql-inspector-body">
        {json ? <JsonView value={json.value} /> : <pre className="xray-sql-inspector-text">{shown.text}</pre>}
        {shown.truncated && <p className="xray-sql-muted">Showing the first 65,536 characters.</p>}
      </div>
    </aside>
  );
}

function MaxRowsInput(): React.ReactElement {
  const maxRows = usePanelSqlStore((s) => s.tabs.find((t) => t.id === s.activeTabId)?.maxRows ?? 1000);
  const setMaxRows = usePanelSqlStore((s) => s.setMaxRows);
  const [draft, setDraft] = useState(String(maxRows));
  const [shown, setShown] = useState(maxRows);
  // A tab switch or a clamp changes the stored value: reset the draft during render.
  if (shown !== maxRows) {
    setShown(maxRows);
    setDraft(String(maxRows));
  }

  function commit(): void {
    const value = clampMaxRows(Number(draft));
    setMaxRows(value);
    setDraft(String(value));
  }

  return (
    <label className="xray-sql-field xray-sql-max-rows-field" title="The most rows a query returns (1–50,000)">
      <span>Max rows</span>
      <input
        className="xray-input xray-sql-max-rows"
        type="number"
        min={1}
        max={50000}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
        }}
      />
    </label>
  );
}

// Until the first inspection in this page session the Results toolbar says cells can be opened.
let inspectedOnce = false;

function primaryKeyColumns(schema: SchemaTree | null, table: string | null): ReadonlySet<string> {
  if (!schema || !table) return EMPTY_SET;
  const node = schema.schemas.find((s) => s.name === 'main')?.tables.find((t) => t.name === table);
  return node ? new Set(node.columns.filter((c) => c.pk).map((c) => c.name)) : EMPTY_SET;
}
const EMPTY_SET: ReadonlySet<string> = new Set();

function ResultsView(): React.ReactElement {
  const result = usePanelSqlStore((s) => s.result);
  const resultTable = usePanelSqlStore((s) => s.resultTable);
  const schema = usePanelSqlStore((s) => s.schema);
  const [filter, setFilter] = useState('');
  const [sortState, setSortState] = useState<{ result: QueryResult; sort: SortState | null } | null>(null);
  const [selection, setSelection] = useState<{ rows: SqlCell[][]; cell: SelectedCell } | null>(null);
  const [hint, setHint] = useState(!inspectedOnce);
  const [toast, setToast] = useState<string[] | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  // A new result starts unsorted; the filter text stays, visible in its field.
  const sort = sortState && sortState.result === result ? sortState.sort : null;
  const viewRows = useMemo(() => (result ? sortRows(filterRows(result.rows, filter), sort) : []), [result, filter, sort]);
  const pkColumns = useMemo(() => primaryKeyColumns(schema, resultTable), [schema, resultTable]);

  if (!result) {
    return (
      <div className="xray-sql-results">
        <div className="xray-sql-results-head">
          <MaxRowsInput />
        </div>
        <p className="xray-sql-empty">Run a query, or click a table on the left to preview it.</p>
      </div>
    );
  }
  const cell = selection && selection.rows === viewRows ? selection.cell : null;
  const filtering = filter.trim() !== '';

  function showToast(...lines: string[]): void {
    setToast(lines);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }

  async function copy(format: CopyFormat): Promise<void> {
    if (!result) return;
    // Copies what is shown: the filtered, sorted rows.
    const { text, truncated } = copyText(format, { ...result, rows: viewRows }, resultTable ?? 'query_result');
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      showToast('Could not copy to the clipboard.');
      return;
    }
    const copied = `Copied ${viewRows.length} rows as ${format}.`;
    // R9/R14: the truncation notice is its own message, word for word.
    if (truncated) showToast(copied, truncatedBlobNotice(truncated));
    else showToast(copied);
  }

  function inspect(next: SelectedCell): void {
    inspectedOnce = true;
    setHint(false);
    setSelection({ rows: viewRows, cell: next });
  }

  const hasColumns = result.columns.length > 0;
  const columnsKey = result.columns.map((c) => `${c.name}\u0000${c.type}`).join('\u0001');
  return (
    <div className="xray-sql-results">
      <div className="xray-sql-results-head">
        <span className="xray-sql-results-summary">
          {filtering && hasColumns ? filteredSummary(viewRows.length, result.rows.length, result.durationMs) : resultSummary(result)}
          {result.hasMore ? ' · more rows available, Run with higher limit' : ''}
        </span>
        <MaxRowsInput />
        {hasColumns && (
          <label className="xray-sql-filter">
            <IconFilter size={13} stroke={1.8} aria-hidden="true" />
            <input
              className="xray-input"
              type="search"
              aria-label="Filter rows"
              placeholder="Filter rows"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </label>
        )}
        {hasColumns && hint && !toast && <span className="xray-sql-hint">Click a cell to inspect it</span>}
        <span className="xray-spacer" />
        {toast && (
          <span className="xray-sql-toast" role="status">
            {toast.map((line) => (
              <span key={line} className="xray-sql-toast-line">
                {line}
              </span>
            ))}
          </span>
        )}
        {hasColumns && (
          <div className="xray-sql-copy" role="group" aria-label="Copy results">
            <span className="xray-sql-muted">Copy</span>
            {(['CSV', 'JSON', 'INSERT'] as const).map((format) => (
              <button key={format} className="xray-btn xray-btn-sm" onClick={() => void copy(format)} aria-label={`Copy as ${format}`}>
                {format}
              </button>
            ))}
          </div>
        )}
      </div>
      {hasColumns ? (
        <div
          className="xray-sql-results-body"
          onKeyDown={(e) => {
            if (e.key === 'Escape' && cell) {
              e.preventDefault();
              setSelection(null);
            }
          }}
        >
          <ResultGrid
            key={columnsKey}
            result={result}
            rows={viewRows}
            sort={sort}
            onSort={(col) => setSortState({ result, sort: nextSort(sort, col) })}
            pkColumns={pkColumns}
            inspected={cell}
            onInspect={inspect}
          />
          {cell && <Inspector result={result} rows={viewRows} cell={cell} onClose={() => setSelection(null)} onToast={showToast} />}
        </div>
      ) : (
        <p className="xray-sql-empty">The statement returned no rows.</p>
      )}
    </div>
  );
}

function MessagesView(): React.ReactElement {
  const messages = usePanelSqlStore((s) => s.messages);
  const error = usePanelSqlStore((s) => s.error);
  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    // Braced: Chromium's scrollIntoView now returns a promise, which React rejects as a cleanup.
    endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [messages]);

  return (
    <div className="xray-sql-messages" role="log" aria-label="Messages">
      {messages.length === 0 && <p className="xray-sql-empty">No messages yet.</p>}
      {messages.map((message, i) => (
        <div key={i} className={`xray-sql-message${error && i === messages.length - 1 && message.endsWith(error.message) ? ' error' : ''}`}>
          {message}
        </div>
      ))}
      {error && (error.hint || error.detail) && (
        <div className="xray-sql-message xray-sql-muted">{[error.hint, error.detail].filter(Boolean).join(' · ')}</div>
      )}
      <div ref={endRef} />
    </div>
  );
}

function HistoryView(): React.ReactElement {
  const history = usePanelSqlStore((s) => s.history);
  const connection = usePanelSqlStore((s) => s.connection);
  const { updateTabSql } = usePanelSqlStore.getState();

  if (!connection) return <p className="xray-sql-empty">History is kept per database file.</p>;
  if (!history.length) return <p className="xray-sql-empty">Queries you run on {connection.name} appear here.</p>;
  return (
    <ul className="xray-sql-history" aria-label="Query history">
      {history.map((item, i) => (
        <li key={`${item.at}-${i}`}>
          <button
            className="xray-sql-history-item"
            title="Load into the editor"
            onClick={() => {
              const s = usePanelSqlStore.getState();
              updateTabSql(s.activeTabId, item.sql);
            }}
          >
            <code className="xray-sql-history-sql">{item.sql}</code>
            <span className={`xray-sql-history-meta${item.ok ? '' : ' error'}`}>
              {new Date(item.at).toLocaleTimeString()} ·{' '}
              {item.ok ? `${item.rowCount ?? 0} rows · ${item.durationMs} ms` : (item.error ?? 'failed')}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

const TABS: { id: SqlBottomTab; label: string }[] = [
  { id: 'results', label: 'Results' },
  { id: 'messages', label: 'Messages' },
  { id: 'history', label: 'History' },
];

export function ResultsPane(): React.ReactElement {
  const bottomTab = usePanelSqlStore((s) => s.bottomTab);
  const running = usePanelSqlStore((s) => !!s.running);
  const setBottomTab = usePanelSqlStore((s) => s.setBottomTab);

  return (
    <section className="xray-sql-bottom" aria-label="Output">
      <div className="xray-sql-bottom-tabs" role="tablist" aria-label="Output">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            id={`xray-sql-tab-${tab.id}`}
            aria-selected={bottomTab === tab.id}
            aria-controls="xray-sql-bottom-panel"
            className={`xray-tab${bottomTab === tab.id ? ' active' : ''}`}
            onClick={() => setBottomTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
        <span className="xray-spacer" />
        {running && (
          <span className="xray-sql-running" role="status">
            Running…
          </span>
        )}
      </div>
      <div className="xray-sql-bottom-panel" id="xray-sql-bottom-panel" role="tabpanel" aria-labelledby={`xray-sql-tab-${bottomTab}`}>
        {bottomTab === 'results' && <ResultsView />}
        {bottomTab === 'messages' && <MessagesView />}
        {bottomTab === 'history' && <HistoryView />}
      </div>
    </section>
  );
}
