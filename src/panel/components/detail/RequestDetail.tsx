import React from 'react';
import {
  IconBraces,
  IconChartBar,
  IconCode,
  IconCopy,
  IconDownload,
  IconFileDiff,
  IconNotebook,
  IconSend,
  IconTable,
  IconTerminal2,
  IconTimeline,
  IconX,
} from '@tabler/icons-react';
import { EmptyState } from '../common/EmptyState';
import { usePanelStore } from '../../store';
import type { XrayEntry } from '../../types';
import { detailValue, detailViews, gridRows, vizSummary } from '../../models/detail';
import { duration, entryPath } from '../../models/entries';
import { getResponseOperations, type ResponseOperation } from '../../models/operations';
import { copyText, entryResponse, formatBytes, methodClass, preview, safeStringify, schema, statusClass } from '../../utils';
import { JsonView } from './JsonView';

const iconProps = { size: 16, stroke: 1.8 } as const;

type ResponseTab = 'response' | 'headers' | 'cookies' | 'timeline';

const responseTabs: Array<{ id: ResponseTab; label: string }> = [
  { id: 'response', label: 'Preview' },
  { id: 'headers', label: 'Headers' },
  { id: 'cookies', label: 'Cookies' },
  { id: 'timeline', label: 'Timeline' },
];

const viewLabels: Record<string, string> = {
  tree: 'Tree',
  raw: 'Raw',
  grid: 'Table',
  schema: 'Schema',
  diff: 'Diff',
  viz: 'Visualize',
  waterfall: 'Waterfall',
  headers: 'Headers',
};

const operationGroups = [
  { label: 'Inspect', ids: ['inspect-error', 'schema', 'table', 'visualize', 'headers', 'waterfall', 'request'] },
  { label: 'Transform', ids: ['compare-previous', 'diff', 'mock', 'related-errors', 'similar-calls', 'slow-calls'] },
  { label: 'Copy', ids: ['copy-curl', 'copy-fetch', 'copy-full'] },
  { label: 'Send', ids: ['send-console', 'send-notebook', 'export'] },
] as const;

interface WorkerDetailAnalysis {
  schema?: unknown;
  diff?: unknown;
  grid?: ReturnType<typeof gridRows>;
  viz?: ReturnType<typeof vizSummary>;
  durationMs?: number;
  engine?: string;
}

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
  const [responseTab, setResponseTab] = React.useState<ResponseTab>('response');
  const cookies = React.useMemo(() => cookieSummary(entry), [entry]);
  const hasCookies = Object.keys(cookies).length > 0;
  const activeValue = React.useMemo(() => {
    if (responseTab === 'headers') return headerSummary(entry);
    if (responseTab === 'cookies') return cookies;
    if (responseTab === 'timeline') return timelineSummary(entry);
    return detailValue(entry, detailTab);
  }, [cookies, detailTab, entry, responseTab]);
  const operations = React.useMemo(() => getResponseOperations(entry, entries), [entries, entry]);
  const groupedOperations = React.useMemo(() => groupResponseOperations(operations), [operations]);
  const previous = React.useMemo(() => previousSameEndpoint(entry, entries), [entry, entries]);
  const previousValue = React.useMemo(() => previous ? entryResponse(previous) : null, [previous]);
  const [workerAnalysis, setWorkerAnalysis] = React.useState<WorkerDetailAnalysis | null>(null);

  React.useEffect(() => {
    setResponseTab('response');
  }, [entry.id]);

  React.useEffect(() => {
    let cancelled = false;
    setWorkerAnalysis(null);
    if (!window.XRAY_Worker?.detailAnalysis) return;
    window.XRAY_Worker.detailAnalysis(activeValue, previousValue)
      .then((analysis) => {
        if (!cancelled && analysis && typeof analysis === 'object') setWorkerAnalysis(analysis as WorkerDetailAnalysis);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [activeValue, previousValue]);

  React.useEffect(() => {
    if (responseTab === 'cookies' && !hasCookies) setResponseTab('response');
  }, [hasCookies, responseTab]);

  function selectResponseTab(tab: ResponseTab): void {
    setResponseTab(tab);
    if (tab === 'headers') {
      setDetailTab('headers');
      if (detailView === 'headers' || detailView === 'waterfall') setDetailView('tree');
      return;
    }
    setDetailTab('response');
    if (tab === 'timeline') {
      setDetailView('waterfall');
      return;
    }
    if (detailView === 'headers' || detailView === 'waterfall') setDetailView('tree');
  }

  function selectDetailView(view: typeof detailViews[number]): void {
    setDetailView(view);
    if (view === 'headers') {
      setDetailTab('headers');
      setResponseTab('headers');
      return;
    }
    if (view === 'waterfall') {
      setDetailTab('response');
      setResponseTab('timeline');
      return;
    }
    setDetailTab('response');
    setResponseTab('response');
  }

  async function copyActiveValue(): Promise<void> {
    await copyText(typeof activeValue === 'string' ? activeValue : safeStringify(activeValue, 2, 500_000));
    showToast('Response copied.');
  }

  async function runOperation(operation: ResponseOperation): Promise<void> {
    if (operation.kind === 'view') {
      if (operation.id === 'headers' || operation.view === 'headers') {
        setResponseTab('headers');
        setDetailTab('headers');
        setDetailView('tree');
      } else if (operation.view === 'waterfall') {
        setResponseTab('timeline');
        setDetailTab('response');
        setDetailView('waterfall');
      } else {
        setResponseTab('response');
        setDetailTab(operation.id === 'request' ? 'request' : 'response');
        if (operation.view) setDetailView(operation.view);
      }
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
      return;
    }
    if (operation.kind === 'export') {
      setExportOpen(true);
      showToast('Export opened.');
    }
  }

  const visibleResponseTabs = responseTabs.filter((tab) => tab.id !== 'cookies' || hasCookies);
  const status = Number(entry.status) || 0;

  return (
    <div className={`xray-request-detail ${compact ? 'compact' : ''}`}>
      {!compact && (
        <>
          <div className="xray-detail-hero">
            <div className="xray-response-heading">
              <span className={`xray-method ${methodClass(entry.method)}`}>{entry.method || 'GET'}</span>
              <h3>{entryPath(entry)}</h3>
            </div>
            <div className="xray-response-chips">
              <span className={`xray-response-chip ${statusClass(status)}`}>{entry.status || entry.logLevel || 'log'}</span>
              <span className="xray-response-chip">{Math.round(duration(entry))}ms</span>
              <span className="xray-response-chip">{formatBytes(entry.size)}</span>
            </div>
            {onClose && <button className="xray-icon-btn" aria-label="Close selected request detail" onClick={onClose}><IconX {...iconProps} /></button>}
          </div>
          <div className="xray-detail-nav">
            <div className="xray-detail-tabs" aria-label="Response tabs">
              {visibleResponseTabs.map((tab) => <button key={tab.id} className={`xray-detail-tab ${responseTab === tab.id ? 'active' : ''}`} onClick={() => selectResponseTab(tab.id)}>{tab.label}</button>)}
            </div>
            <div className="xray-detail-views" aria-label="View modes">
              {detailViews.map((view) => <button key={view} className={`xray-chip ${detailView === view ? 'active' : ''}`} onClick={() => selectDetailView(view)}>{viewLabels[view] || view}</button>)}
            </div>
          </div>
          <div className="xray-operation-groups xray-smart-ops" aria-label="Smart response operations">
            {groupedOperations.map((group) => (
              <div key={group.label} className="xray-operation-group">
                <span>{group.label}</span>
                <div className="xray-operation-bar">
                  {group.operations.map((operation) => (
                    <button key={operation.id} className={`xray-chip xray-operation-chip ${operation.kind}`} onClick={() => void runOperation(operation)}>
                      <OperationIcon operation={operation} />
                      {operation.label.replace('Send to ', '')}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <div className="xray-detail-content">
        {(compact || detailView === 'tree') && <JsonView value={compact ? detailValue(entry, detailTab) : activeValue} />}
        {!compact && detailView === 'grid' && <GridView value={activeValue} workerGrid={workerAnalysis?.grid} />}
        {!compact && detailView === 'raw' && <pre className="xray-json">{typeof activeValue === 'string' ? activeValue : safeStringify(activeValue)}</pre>}
        {!compact && detailView === 'schema' && <JsonView value={workerAnalysis?.schema ?? schema(activeValue)} />}
        {!compact && detailView === 'diff' && <DiffView current={activeValue} previous={previousValue} workerDiff={workerAnalysis?.diff} />}
        {!compact && detailView === 'viz' && <VizView value={activeValue} workerViz={workerAnalysis?.viz} workerMeta={workerAnalysis} />}
        {!compact && detailView === 'waterfall' && <WaterfallView entry={entry} />}
        {!compact && detailView === 'headers' && <JsonView value={headerSummary(entry)} />}
      </div>
      {!compact && (
        <div className="xray-detail-footer">
          <button className="xray-action-btn" onClick={() => insertConsoleCommand('res')}><IconSend {...iconProps} />Console</button>
          <button className="xray-action-btn" onClick={() => addNotebookCell({ title: `${entry.method || 'GET'} ${entryPath(entry)}`, code: 'schema(res)' })}><IconNotebook {...iconProps} />Notebook</button>
          <button className="xray-action-btn" onClick={() => void copyActiveValue()}><IconCopy {...iconProps} />Copy</button>
          <button className="xray-action-btn primary" onClick={() => setExportOpen(true)}><IconDownload {...iconProps} />Export</button>
        </div>
      )}
    </div>
  );
}

function groupResponseOperations(operations: ResponseOperation[]): Array<{ label: string; operations: ResponseOperation[] }> {
  const seen = new Set<string>();
  const groups = operationGroups.map((group) => {
    const ids = group.ids as readonly string[];
    const items = operations.filter((operation) => ids.includes(operation.id));
    items.forEach((operation) => seen.add(operation.id));
    return { label: group.label, operations: items };
  }).filter((group) => group.operations.length);
  const other = operations.filter((operation) => !seen.has(operation.id));
  return other.length ? [...groups, { label: 'More', operations: other }] : groups;
}

function OperationIcon({ operation }: { operation: ResponseOperation }): React.ReactElement {
  if (operation.id === 'schema') return <IconBraces {...iconProps} />;
  if (operation.id === 'table') return <IconTable {...iconProps} />;
  if (operation.id === 'visualize') return <IconChartBar {...iconProps} />;
  if (operation.id === 'diff' || operation.id === 'compare-previous') return <IconFileDiff {...iconProps} />;
  if (operation.id === 'waterfall') return <IconTimeline {...iconProps} />;
  if (operation.kind === 'copy') return <IconCopy {...iconProps} />;
  if (operation.kind === 'console') return <IconTerminal2 {...iconProps} />;
  if (operation.kind === 'notebook') return <IconNotebook {...iconProps} />;
  if (operation.kind === 'export') return <IconDownload {...iconProps} />;
  return <IconCode {...iconProps} />;
}

function headerSummary(entry: XrayEntry): unknown {
  return {
    requestHeaders: entry.requestHeaders || {},
    responseHeaders: entry.responseHeaders || {},
  };
}

function timelineSummary(entry: XrayEntry): unknown {
  return {
    startedAt: entry.timestamp ? new Date(entry.timestamp).toISOString() : null,
    durationMs: Math.round(duration(entry)),
    status: entry.status || null,
    size: Number(entry.size) || 0,
    source: entry.source || 'fetch',
  };
}

function cookieSummary(entry: XrayEntry): Record<string, string> {
  const requestCookie = headerValue(entry.requestHeaders, 'cookie');
  const responseCookie = headerValue(entry.responseHeaders, 'set-cookie');
  return {
    ...(requestCookie ? { requestCookie } : {}),
    ...(responseCookie ? { setCookie: responseCookie } : {}),
  };
}

function headerValue(headers: unknown, name: string): string {
  if (!headers || typeof headers !== 'object') return '';
  const lowerName = name.toLowerCase();
  const match = Object.entries(headers as Record<string, unknown>).find(([key]) => key.toLowerCase() === lowerName);
  return match ? String(match[1] ?? '') : '';
}

function previousSameEndpoint(entry: XrayEntry, entries: XrayEntry[]): XrayEntry | null {
  return entries
    .filter((candidate) => candidate.id !== entry.id && candidate.type === 'api' && entryPath(candidate) === entryPath(entry))
    .filter((candidate) => Number(candidate.timestamp) <= Number(entry.timestamp || Date.now()))
    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))[0] || null;
}

function GridView({ value, workerGrid }: { value: unknown; workerGrid?: ReturnType<typeof gridRows> }): React.ReactElement {
  const { objects, columns } = workerGrid || gridRows(value);
  if (!objects.length) return <EmptyState label="No object rows found" />;
  return (
    <table className="xray-table">
      <thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
      <tbody>{objects.map((row, index) => <tr key={index}>{columns.map((column) => <td key={column}>{preview(row[column], 160)}</td>)}</tr>)}</tbody>
    </table>
  );
}

function VizView({ value, workerViz, workerMeta }: { value: unknown; workerViz?: ReturnType<typeof vizSummary>; workerMeta?: WorkerDetailAnalysis | null }): React.ReactElement {
  return <JsonView value={{ ...(workerViz || vizSummary(value)), engine: workerMeta?.engine || 'main-thread-fallback', durationMs: workerMeta?.durationMs ?? null }} />;
}

function WaterfallView({ entry }: { entry: XrayEntry }): React.ReactElement {
  return (
    <div className="xray-card">
      <h3>Timing</h3>
      <div className="xray-timing"><span className="xray-bar-track"><span className="xray-bar" style={{ width: `${Math.min(100, Math.max(8, duration(entry) / 10))}%` }} /></span><span>{Math.round(duration(entry))}ms</span></div>
    </div>
  );
}

function DiffView({ current, previous, workerDiff }: { current: unknown; previous: unknown; workerDiff?: unknown }): React.ReactElement {
  if (previous == null) {
    return <EmptyState label="No previous matching response" />;
  }
  return <JsonView value={workerDiff || { previous, current, previousSchema: schema(previous), currentSchema: schema(current) }} />;
}
