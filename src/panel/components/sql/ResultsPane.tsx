import React, { useEffect, useRef, useState } from 'react';
import { IconX } from '@tabler/icons-react';
import { resultSummary, usePanelSqlStore, type SqlBottomTab } from '../../sqlStore';
import { countTruncatedBlobs, displayCell, toCsv, toInsertCopy, toJsonRows, truncatedBlobNotice } from '../../models/sqlValues';
import { parseJson, toValue } from '../../models/jsonText';
import type { QueryResult } from '../../models/sqlTypes';
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

function Inspector({ result, cell, onClose }: { result: QueryResult; cell: SelectedCell; onClose(): void }): React.ReactElement {
  const column = result.columns[cell.col];
  const shown = displayCell(result.rows[cell.row]?.[cell.col] ?? null, column?.type);
  const json = React.useMemo(() => {
    if (shown.kind !== 'json') return null;
    const doc = parseJson(shown.text);
    return doc.ok ? { value: toValue(doc.root) } : null;
  }, [shown.kind, shown.text]);

  return (
    <aside className="xray-sql-inspector" aria-label="Cell inspector">
      <header className="xray-sql-inspector-head">
        <span className="xray-sql-inspector-title">
          {column?.name ?? ''} <span className="xray-sql-muted">row {cell.row + 1} · {shown.kind}</span>
        </span>
        <button className="xray-icon-btn" aria-label="Close cell inspector" onClick={onClose}>
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

function ResultsView(): React.ReactElement {
  const result = usePanelSqlStore((s) => s.result);
  const resultTable = usePanelSqlStore((s) => s.resultTable);
  const [selection, setSelection] = useState<{ result: QueryResult; cell: SelectedCell } | null>(null);
  const [toast, setToast] = useState<string[] | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  if (!result) return <p className="xray-sql-empty">Run a query to see results here.</p>;
  const cell = selection && selection.result === result ? selection.cell : null;

  function showToast(...lines: string[]): void {
    setToast(lines);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }

  async function copy(format: CopyFormat): Promise<void> {
    if (!result) return;
    const { text, truncated } = copyText(format, result, resultTable ?? 'query_result');
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      showToast('Could not copy to the clipboard.');
      return;
    }
    const copied = `Copied ${result.rows.length} rows as ${format}.`;
    // R9/R14: the truncation notice is its own message, word for word.
    if (truncated) showToast(copied, truncatedBlobNotice(truncated));
    else showToast(copied);
  }

  const hasColumns = result.columns.length > 0;
  return (
    <div className="xray-sql-results">
      <div className="xray-sql-results-head">
        <span className="xray-sql-results-summary">
          {resultSummary(result)}
          {result.hasMore ? ' · more rows available, Run with higher limit' : ''}
        </span>
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
        <div className="xray-sql-results-body">
          <ResultGrid result={result} selected={cell} onSelect={(c) => setSelection({ result, cell: c })} />
          {cell && <Inspector result={result} cell={cell} onClose={() => setSelection(null)} />}
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
