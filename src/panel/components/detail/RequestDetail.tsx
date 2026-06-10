import React from 'react';
import { IconCopy, IconDownload, IconNotebook, IconSend, IconX } from '@tabler/icons-react';
import { EmptyState } from '../common/EmptyState';
import { usePanelStore } from '../../store';
import type { XrayEntry } from '../../types';
import { detailValue, detailViews, gridRows, vizSummary } from '../../models/detail';
import { duration, entryPath } from '../../models/entries';
import { getResponseOperations, type ResponseOperation } from '../../models/operations';
import { copyText, entryResponse, formatBytes, methodClass, preview, safeStringify, schema, statusClass } from '../../utils';
import { JsonView } from './JsonView';

const iconProps = { size: 16, stroke: 1.8 } as const;

export function RequestDetail({ entry, compact = false, onClose }: { entry: XrayEntry; compact?: boolean; onClose?: () => void }): React.ReactElement {
  const detailView = usePanelStore((state) => state.detailView);
  const setDetailView = usePanelStore((state) => state.setDetailView);
  const detailTab = usePanelStore((state) => state.detailTab);
  const setDetailTab = usePanelStore((state) => state.setDetailTab);
  const insertConsoleCommand = usePanelStore((state) => state.insertConsoleCommand);
  const addNotebookCell = usePanelStore((state) => state.addNotebookCell);
  const setExportOpen = usePanelStore((state) => state.setExportOpen);
  const showToast = usePanelStore((state) => state.showToast);
  const entries = usePanelStore((state) => state.entries);
  const activeValue = detailValue(entry, detailTab);
  const operations = React.useMemo(() => getResponseOperations(entry, entries), [entries, entry]);
  const previous = React.useMemo(() => previousSameEndpoint(entry, entries), [entry, entries]);

  async function copyActiveValue(): Promise<void> {
    await copyText(typeof activeValue === 'string' ? activeValue : safeStringify(activeValue, 2, 500_000));
    showToast('Response copied.');
  }

  async function runOperation(operation: ResponseOperation): Promise<void> {
    if (operation.kind === 'view') {
      if (operation.id === 'request') setDetailTab('request');
      else if (operation.id === 'headers') setDetailTab('headers');
      else setDetailTab('response');
      if (operation.view) setDetailView(operation.view);
      showToast(`${operation.label} opened.`);
      return;
    }
    if (operation.kind === 'console' && operation.command) {
      insertConsoleCommand(operation.command);
      showToast(`${operation.label} inserted in Console.`);
      return;
    }
    if (operation.kind === 'notebook' && operation.command) {
      addNotebookCell({ title: operation.label, code: operation.command });
      showToast(`${operation.label} sent to Notebook.`);
      return;
    }
    if (operation.kind === 'copy' && operation.command) {
      await copyText(operation.command);
      showToast(operation.toast || `${operation.label} copied.`);
    }
  }

  return (
    <div className={`xray-request-detail ${compact ? 'compact' : ''}`}>
      {!compact && (
        <>
          <div className="xray-detail-hero">
            <span className={`xray-method ${methodClass(entry.method)}`}>{entry.method || 'GET'}</span>
            <h3>{entryPath(entry)}</h3>
            <span className={`xray-status ${statusClass(Number(entry.status))}`}>{entry.status || entry.logLevel || 'log'}</span>
            <span className="xray-muted">{Math.round(duration(entry))}ms</span>
            <span className="xray-muted">{formatBytes(entry.size)}</span>
            {onClose && <button className="xray-icon-btn" aria-label="Close selected request detail" onClick={onClose}><IconX {...iconProps} /></button>}
          </div>
          <div className="xray-detail-nav">
            <div className="xray-detail-tabs">
              {(['response', 'request', 'headers'] as const).map((tab) => <button key={tab} className={`xray-detail-tab ${detailTab === tab ? 'active' : ''}`} onClick={() => setDetailTab(tab)}>{tab}</button>)}
            </div>
            <div className="xray-detail-views">
              {detailViews.map((view) => <button key={view} className={`xray-chip ${detailView === view ? 'active' : ''}`} onClick={() => setDetailView(view)}>{view}</button>)}
            </div>
          </div>
        </>
      )}
      <div className="xray-detail-content">
        {(compact || detailView === 'tree') && <JsonView value={activeValue} />}
        {!compact && detailView === 'grid' && <GridView value={activeValue} />}
        {!compact && detailView === 'raw' && <pre className="xray-json">{typeof activeValue === 'string' ? activeValue : safeStringify(activeValue)}</pre>}
        {!compact && detailView === 'schema' && <JsonView value={schema(activeValue)} />}
        {!compact && detailView === 'diff' && <DiffView current={activeValue} previous={previous ? entryResponse(previous) : null} />}
        {!compact && detailView === 'viz' && <VizView value={activeValue} />}
        {!compact && detailView === 'waterfall' && <WaterfallView entry={entry} />}
        {!compact && detailView === 'headers' && <JsonView value={{ requestHeaders: entry.requestHeaders || {}, responseHeaders: entry.responseHeaders || {} }} />}
      </div>
      {!compact && (
        <div className="xray-detail-footer">
          <div className="xray-smart-ops" aria-label="Smart response operations">
            <span>Smart</span>
            {operations.slice(0, 6).map((operation) => (
              <button key={operation.id} className="xray-chip" onClick={() => void runOperation(operation)}>
                {operation.label}
              </button>
            ))}
          </div>
          <button className="xray-action-btn" onClick={() => insertConsoleCommand('res')}><IconSend {...iconProps} />Console</button>
          <button className="xray-action-btn" onClick={() => addNotebookCell({ title: `${entry.method || 'GET'} ${entryPath(entry)}`, code: 'schema(res)' })}><IconNotebook {...iconProps} />Notebook</button>
          <button className="xray-action-btn" onClick={() => void copyActiveValue()}><IconCopy {...iconProps} />Copy</button>
          <button className="xray-action-btn primary" onClick={() => setExportOpen(true)}><IconDownload {...iconProps} />Export</button>
        </div>
      )}
    </div>
  );
}

function previousSameEndpoint(entry: XrayEntry, entries: XrayEntry[]): XrayEntry | null {
  return entries
    .filter((candidate) => candidate.id !== entry.id && candidate.type === 'api' && entryPath(candidate) === entryPath(entry))
    .filter((candidate) => Number(candidate.timestamp) <= Number(entry.timestamp || Date.now()))
    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))[0] || null;
}

function GridView({ value }: { value: unknown }): React.ReactElement {
  const { objects, columns } = gridRows(value);
  if (!objects.length) return <EmptyState label="No object rows found" />;
  return (
    <table className="xray-table">
      <thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
      <tbody>{objects.map((row, index) => <tr key={index}>{columns.map((column) => <td key={column}>{preview(row[column], 160)}</td>)}</tr>)}</tbody>
    </table>
  );
}

function VizView({ value }: { value: unknown }): React.ReactElement {
  return <JsonView value={vizSummary(value)} />;
}

function WaterfallView({ entry }: { entry: XrayEntry }): React.ReactElement {
  return (
    <div className="xray-card">
      <h3>Timing</h3>
      <div className="xray-timing"><span className="xray-bar-track"><span className="xray-bar" style={{ width: `${Math.min(100, Math.max(8, duration(entry) / 10))}%` }} /></span><span>{Math.round(duration(entry))}ms</span></div>
    </div>
  );
}

function DiffView({ current, previous }: { current: unknown; previous: unknown }): React.ReactElement {
  if (previous == null) {
    return <EmptyState label="No previous matching response" />;
  }
  return <JsonView value={{ previous, current, previousSchema: schema(previous), currentSchema: schema(current) }} />;
}
