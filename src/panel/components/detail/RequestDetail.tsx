import React from 'react';
import {
  IconBookmark,
  IconBraces,
  IconChartBar,
  IconCode,
  IconCopy,
  IconDownload,
  IconFileDiff,
  IconKey,
  IconPlugConnected,
  IconRepeat,
  IconRoute,
  IconSearch,
  IconSend,
  IconSparkles,
  IconTable,
  IconTerminal2,
  IconTimeline,
  IconX,
} from '@tabler/icons-react';
import { EmptyState } from '../common/EmptyState';
import { usePanelStore } from '../../store';
import type { WsFrame, XrayEntry } from '../../types';
import { detailValue, detailViews, gridRows, structuralDiff, timingPhases } from '../../models/detail';
import { buildVizSpec, formatVizValue } from '../../models/viz';
import { duration, entryGroupPath, entryPath } from '../../models/entries';
import { extractJwts } from '../../models/lenses';
import { getResponseOperations, type ResponseOperation } from '../../models/operations';
import { copyText, entryResponse, formatBytes, formatTime, methodClass, preview, safeStringify, schema, statusClass } from '../../utils';
import { JsonView } from './JsonView';

const iconProps = { size: 16, stroke: 1.8 } as const;

type ResponseTab = 'response' | 'headers' | 'cookies' | 'timeline' | 'frames' | 'initiator' | 'tokens';

const responseTabs: Array<{ id: ResponseTab; label: string }> = [
  { id: 'response', label: 'Preview' },
  { id: 'headers', label: 'Headers' },
  { id: 'cookies', label: 'Cookies' },
  { id: 'frames', label: 'Frames' },
  { id: 'initiator', label: 'Initiator' },
  { id: 'tokens', label: 'Tokens' },
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
  { label: 'Send', ids: ['send-console', 'save-snippet', 'export'] },
] as const;

function jwtSourceLabel(source: string): string {
  if (source.startsWith('requestHeaders')) return 'Request header';
  if (source.startsWith('responseHeaders')) return 'Response header';
  if (source.startsWith('requestBody')) return 'Request body';
  return 'Response body';
}

interface WorkerDetailAnalysis {
  schema?: unknown;
  diff?: unknown;
  grid?: ReturnType<typeof gridRows>;
  durationMs?: number;
  engine?: string;
}

export function RequestDetail({ entry, compact = false, onClose }: { entry: XrayEntry; compact?: boolean; onClose?: () => void }): React.ReactElement {
  const detailView = usePanelStore((state) => state.detailView);
  const setDetailView = usePanelStore((state) => state.setDetailView);
  const detailTab = usePanelStore((state) => state.detailTab);
  const setDetailTab = usePanelStore((state) => state.setDetailTab);
  const insertConsoleCommand = usePanelStore((state) => state.insertConsoleCommand);
  const saveSnippet = usePanelStore((state) => state.saveSnippet);
  const setExportOpen = usePanelStore((state) => state.setExportOpen);
  const showToast = usePanelStore((state) => state.showToast);
  // Subscribe to the COUNT, not the array: every WS frame patch re-minted the
  // entries array and re-ran the drift/operations pipeline while the drawer was
  // open. Lookups read the fresh array via getState() inside memos instead.
  const entriesLength = usePanelStore((state) => state.entries.length);
  const replayEntry = usePanelStore((state) => state.replayEntry);
  const openReplayEditor = usePanelStore((state) => state.openReplayEditor);
  const openExplain = usePanelStore((state) => state.openExplain);
  const [responseTab, setResponseTab] = React.useState<ResponseTab>('response');
  const cookies = React.useMemo(() => cookieSummary(entry), [entry]);
  const hasCookies = Object.keys(cookies).length > 0;
  const jwts = React.useMemo(() => extractJwts(entry), [entry]);
  const hasFrames = Array.isArray(entry.wsFrames);
  const hasInitiator = Array.isArray(entry.initiator) && entry.initiator.length > 0;
  const driftFrom = React.useMemo(
    () => entry.driftFromId ? usePanelStore.getState().entries.find((candidate) => candidate.id === entry.driftFromId) || null : null,
    [entry.driftFromId, entriesLength],
  );
  const activeValue = React.useMemo(() => {
    if (responseTab === 'headers') return headerSummary(entry);
    if (responseTab === 'cookies') return cookies;
    if (responseTab === 'timeline') return timelineSummary(entry);
    return detailValue(entry, detailTab);
  }, [cookies, detailTab, entry, responseTab]);
  const operations = React.useMemo(() => getResponseOperations(entry, usePanelStore.getState().entries), [entry, entriesLength]);
  const groupedOperations = React.useMemo(() => groupResponseOperations(operations), [operations]);
  // Diff pairs against the recorded drift baseline when one exists; otherwise
  // the previous call on the same endpoint (grouped per GraphQL operation).
  const previous = React.useMemo(
    () => driftFrom ?? previousSameEndpoint(entry, usePanelStore.getState().entries),
    [driftFrom, entry, entriesLength],
  );
  const previousValue = React.useMemo(() => previous ? entryResponse(previous) : null, [previous]);
  const [workerAnalysis, setWorkerAnalysis] = React.useState<WorkerDetailAnalysis | null>(null);

  // The active tab survives selection changes so comparing the same facet
  // across requests doesn't require re-clicking; only tabs that don't apply to
  // the new entry fall back to the preview.
  React.useEffect(() => {
    setResponseTab((tab) => {
      if (tab === 'frames' && !hasFrames) return 'response';
      if (tab === 'initiator' && !hasInitiator) return 'response';
      if (tab === 'tokens' && !jwts.length) return 'response';
      return tab;
    });
  }, [entry.id, hasFrames, hasInitiator, jwts.length]);

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
      // Always land on the headers grid — leaving a diff/schema view active
      // rendered that view over the header summary instead.
      setDetailView('tree');
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
    if (operation.kind === 'snippet' && operation.command) {
      saveSnippet({ title: `${entry.method || 'GET'} ${entryPath(entry)}`, code: operation.command });
      showToast('Saved to Console snippets.');
      return;
    }
    if (operation.kind === 'copy') {
      const text = operation.command ?? operation.lazyCommand?.();
      if (!text) return;
      await copyText(text);
      showToast(operation.toast || `${operation.label} copied.`);
      return;
    }
    if (operation.kind === 'export') {
      setExportOpen(true);
      showToast('Export opened.');
    }
  }

  const visibleResponseTabs = responseTabs.filter((tab) => {
    if (tab.id === 'cookies') return hasCookies;
    if (tab.id === 'frames') return hasFrames;
    if (tab.id === 'initiator') return hasInitiator;
    if (tab.id === 'tokens') return jwts.length > 0;
    return true;
  });
  const status = Number(entry.status) || 0;

  function replayNow(): void {
    replayEntry(entry);
  }

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
          {driftFrom && (
            <div className="xray-drift-banner" role="status">
              <IconRoute {...iconProps} />
              <span>Response schema changed versus the previous call to this endpoint.</span>
              <button className="xray-chip" onClick={() => { setResponseTab('response'); setDetailTab('response'); setDetailView('diff'); }}>View diff</button>
            </div>
          )}
          <div className="xray-detail-actionbar" aria-label="Request actions">
            <button className="xray-chip xray-operation-chip" onClick={replayNow} title="Replay this request from the page"><IconRepeat {...iconProps} />Replay</button>
            <button className="xray-chip xray-operation-chip" onClick={() => openReplayEditor(entry)} title="Edit method, headers, or body then replay"><IconRepeat {...iconProps} />Edit &amp; Replay</button>
            <button className="xray-chip xray-operation-chip" onClick={() => openExplain(entry)} title="Explain this request with AI"><IconSparkles {...iconProps} />Explain</button>
            <button className="xray-chip xray-operation-chip" onClick={() => usePanelStore.getState().addRule({ label: `${entry.method || 'GET'} ${entryPath(entry)}`, match: { url: String(entry.urlPath || entry.url || ''), method: String(entry.method || '') }, action: { type: 'mock', status: Number(entry.status) || 200, body: typeof entryResponse(entry) === 'string' ? String(entryResponse(entry)) : safeStringify(entryResponse(entry), 2, 100_000), headers: {}, delayMs: 0 } })} title="Create a mock rule from this response"><IconPlugConnected {...iconProps} />Mock this</button>
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
        {!compact && responseTab === 'frames' && <FramesView frames={entry.wsFrames || []} state={entry.wsState} />}
        {!compact && responseTab === 'initiator' && <InitiatorView entry={entry} />}
        {!compact && responseTab === 'tokens' && <TokensView jwts={jwts} />}
        {(compact || (responseTab !== 'frames' && responseTab !== 'initiator' && responseTab !== 'tokens')) && (
          <>
            {(compact || detailView === 'tree') && <TreeContent compact={compact} entry={entry} detailTab={detailTab} responseTab={responseTab} activeValue={activeValue} hasFrames={hasFrames} />}
            {!compact && detailView === 'grid' && <GridView value={activeValue} workerGrid={workerAnalysis?.grid} />}
            {!compact && detailView === 'raw' && <RawView value={activeValue} />}
            {!compact && detailView === 'schema' && <SchemaView value={activeValue} workerSchema={workerAnalysis?.schema} />}
            {!compact && detailView === 'diff' && <DiffView current={activeValue} previous={previousValue} baselineId={driftFrom?.id || null} baselineIsDrift={!!driftFrom} />}
            {!compact && detailView === 'viz' && <VizView value={activeValue} />}
            {!compact && detailView === 'waterfall' && <WaterfallView entry={entry} />}
            {!compact && detailView === 'headers' && <HeadersView entry={entry} />}
          </>
        )}
      </div>
      {!compact && (
        <div className="xray-detail-footer">
          <button className="xray-action-btn" onClick={() => insertConsoleCommand('res')}><IconSend {...iconProps} />Console</button>
          <button className="xray-action-btn" onClick={() => saveSnippet({ title: `${entry.method || 'GET'} ${entryPath(entry)}`, code: 'schema(res)' })}><IconBookmark {...iconProps} />Snippet</button>
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
  if (operation.kind === 'snippet') return <IconBookmark {...iconProps} />;
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

// Pair by entryGroupPath (path#operationName) so GraphQL operations sharing
// one /graphql endpoint never diff against a different operation.
function previousSameEndpoint(entry: XrayEntry, entries: XrayEntry[]): XrayEntry | null {
  const groupPath = entryGroupPath(entry);
  return entries
    .filter((candidate) => candidate.id !== entry.id && candidate.type === 'api' && entryGroupPath(candidate) === groupPath)
    .filter((candidate) => Number(candidate.timestamp) <= Number(entry.timestamp || Date.now()))
    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))[0] || null;
}

function TreeContent({ compact, entry, detailTab, responseTab, activeValue, hasFrames }: {
  compact: boolean;
  entry: XrayEntry;
  detailTab: string;
  responseTab: ResponseTab;
  activeValue: unknown;
  hasFrames: boolean;
}): React.ReactElement {
  if (compact) return <JsonView value={detailValue(entry, detailTab as never)} />;
  if (responseTab === 'headers') return <HeadersView entry={entry} />;
  // Non-JSON bodies (HTML, plain text) read as text, not as one giant
  // JSON-escaped string literal.
  if (typeof activeValue === 'string') return <pre className="xray-json xray-json-text">{activeValue}</pre>;
  if (activeValue == null && hasFrames && responseTab === 'response') {
    return <EmptyState label="Streaming entry" hint="This is a WebSocket/SSE stream — open the Frames tab to inspect the messages." />;
  }
  return <JsonView value={activeValue} />;
}

function RawView({ value }: { value: unknown }): React.ReactElement {
  const text = React.useMemo(() => (typeof value === 'string' ? value : safeStringify(value)), [value]);
  return <pre className="xray-json">{text}</pre>;
}

function SchemaView({ value, workerSchema }: { value: unknown; workerSchema?: unknown }): React.ReactElement {
  const inferred = React.useMemo(() => workerSchema ?? schema(value), [workerSchema, value]);
  return <JsonView value={inferred} />;
}

function HeadersView({ entry }: { entry: XrayEntry }): React.ReactElement {
  const [filter, setFilter] = React.useState('');
  const showToast = usePanelStore((state) => state.showToast);
  const sections = React.useMemo(() => ([
    { label: 'Request headers', headers: Object.entries((entry.requestHeaders as Record<string, unknown>) || {}) },
    { label: 'Response headers', headers: Object.entries((entry.responseHeaders as Record<string, unknown>) || {}) },
  ]), [entry]);
  const trimmed = filter.trim().toLowerCase();

  return (
    <div className="xray-headers-view">
      <label className="xray-search xray-headers-filter">
        <IconSearch {...iconProps} />
        <input className="xray-input" placeholder="Filter headers..." value={filter} onChange={(event) => setFilter(event.currentTarget.value)} />
      </label>
      {sections.map((section) => {
        const rows = section.headers.filter(([key, value]) => !trimmed || key.toLowerCase().includes(trimmed) || String(value ?? '').toLowerCase().includes(trimmed));
        return (
          <section key={section.label} className="xray-headers-section">
            <h4>{section.label}<span className="xray-muted"> {rows.length}</span></h4>
            {rows.length === 0 ? <p className="xray-muted">{trimmed ? 'No headers match.' : 'No headers captured.'}</p> : (
              <div className="xray-headers-grid">
                {rows.map(([key, value]) => (
                  <div key={key} className="xray-header-row">
                    <span className="xray-header-name">{key}</span>
                    <span className="xray-header-value" title={String(value ?? '')}>{String(value ?? '')}</span>
                    <button
                      className="xray-icon-btn"
                      aria-label={`Copy ${key} value`}
                      onClick={() => { void copyText(String(value ?? '')); showToast(`${key} copied.`); }}
                    >
                      <IconCopy size={13} stroke={2} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
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

function VizView({ value }: { value: unknown }): React.ReactElement {
  const spec = React.useMemo(() => buildVizSpec(value), [value]);
  if (spec.kind === 'none' || !spec.bars.length) {
    return <EmptyState label={spec.title} />;
  }
  const denom = spec.maxAbs || 1;
  return (
    <div className="xray-viz" role="figure" aria-label={spec.title}>
      <div className="xray-viz-head">
        <h3>{spec.title}</h3>
        {spec.subtitle && <span className="xray-muted">{spec.subtitle}</span>}
      </div>
      <div className="xray-viz-bars">
        {spec.bars.map((bar, index) => (
          <div className="xray-viz-row" key={index} title={`${bar.label}: ${formatVizValue(bar.value)}`}>
            <span className="xray-viz-label">{bar.label}</span>
            <span className="xray-viz-track">
              <span className={`xray-viz-fill ${bar.negative ? 'negative' : ''}`} style={{ width: `${Math.max(2, (Math.abs(bar.value) / denom) * 100)}%` }} />
            </span>
            <span className="xray-viz-value">{formatVizValue(bar.value)}</span>
          </div>
        ))}
      </div>
      {spec.truncated > 0 && <p className="xray-muted xray-viz-foot">+{spec.truncated} more not shown</p>}
    </div>
  );
}

function WaterfallView({ entry }: { entry: XrayEntry }): React.ReactElement {
  const { phases, totalMs, real } = timingPhases(entry);
  const denom = Math.max(1, totalMs);
  return (
    <div className="xray-card xray-waterfall-card">
      <div className="xray-waterfall-head">
        <h3>Timing</h3>
        <span className="xray-muted">{real ? 'Resource Timing' : 'Wall clock'} · {Math.round(totalMs)}ms</span>
      </div>
      <div className="xray-waterfall-track">
        {phases.map((phase) => (
          <span
            key={phase.label}
            className={`xray-waterfall-seg ${phase.className}`}
            style={{ width: `${Math.max(1, (phase.ms / denom) * 100)}%` }}
            title={`${phase.label}: ${Math.round(phase.ms)}ms`}
          />
        ))}
      </div>
      <ul className="xray-waterfall-legend">
        {phases.map((phase) => (
          <li key={phase.label}>
            <span className={`xray-waterfall-dot ${phase.className}`} />
            <span>{phase.label}</span>
            <strong>{Math.round(phase.ms)}ms</strong>
          </li>
        ))}
      </ul>
      {entry.timing?.transferSize ? <p className="xray-muted">Transfer size {formatBytes(entry.timing.transferSize)}</p> : null}
    </div>
  );
}

function FramesView({ frames, state }: { frames: WsFrame[]; state?: string }): React.ReactElement {
  if (!frames.length) {
    return <EmptyState label={state === 'connecting' ? 'Waiting for stream frames…' : 'No frames captured'} />;
  }
  return (
    <div className="xray-frames">
      <div className="xray-frames-head">
        <span className={`xray-ws-state ${state || ''}`}>{state || 'stream'}</span>
        <span className="xray-muted">{frames.length} frames</span>
      </div>
      <div className="xray-frames-list">
        {frames.slice().reverse().map((frame, index) => (
          // Frames append-only: keying by original position keeps existing DOM
          // rows stable when a new frame arrives (reversed indexes rewrote all
          // 200 rows per flush).
          <div key={frames.length - index} className={`xray-frame-row ${frame.dir}`}>
            <span className={`xray-frame-dir ${frame.dir}`}>{frame.dir === 'in' ? '↓ in' : '↑ out'}</span>
            <span className="xray-frame-time">{formatTime(frame.ts)}</span>
            <span className="xray-frame-size">{formatBytes(frame.size)}</span>
            <code className="xray-frame-preview">{frame.preview}</code>
          </div>
        ))}
      </div>
    </div>
  );
}

function parseInitiatorFrame(frame: string): { fn: string; location: string } {
  const match = frame.match(/^\s*(?:at\s+)?(.*?)\s*\(?((?:https?|chrome-extension|webpack|file):[^)\s]+)\)?\s*$/);
  if (match && match[2]) return { fn: match[1] || '(anonymous)', location: match[2] };
  return { fn: frame, location: '' };
}

function InitiatorView({ entry }: { entry: XrayEntry }): React.ReactElement {
  const showToast = usePanelStore((state) => state.showToast);
  const initiator = entry.initiator || [];
  if (!initiator.length) return <EmptyState label="No initiator captured" />;
  return (
    <div className="xray-card">
      <h3>Call stack</h3>
      <p className="xray-muted">Where this request was initiated from on the page.</p>
      <ol className="xray-initiator-list">
        {initiator.map((frame, index) => {
          const parsed = parseInitiatorFrame(frame);
          return (
            <li key={index} className="xray-initiator-frame">
              <span className="xray-initiator-fn">{parsed.fn}</span>
              {parsed.location && <code className="xray-initiator-loc" title={parsed.location}>{parsed.location}</code>}
              <button
                className="xray-icon-btn"
                aria-label="Copy stack frame"
                onClick={() => { void copyText(frame); showToast('Frame copied.'); }}
              >
                <IconCopy size={13} stroke={2} />
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function TokensView({ jwts }: { jwts: ReturnType<typeof extractJwts> }): React.ReactElement {
  if (!jwts.length) return <EmptyState label="No JWT tokens found" />;
  return (
    <div className="xray-tokens">
      {jwts.map((jwt, index) => (
        <div key={index} className="xray-card xray-token-card">
          <div className="xray-token-head">
            <span className="xray-token-source"><IconKey {...iconProps} />{jwtSourceLabel(jwt.source)}</span>
            {jwt.expiresAt && <span className={`xray-token-exp ${jwt.expired ? 'expired' : 'valid'}`}>{jwt.expired ? 'Expired' : 'Valid'} · exp {jwt.expiresAt}</span>}
          </div>
          <div className="xray-token-body">
            <div>
              <span className="xray-token-label">Header</span>
              <JsonView value={jwt.header} />
            </div>
            <div>
              <span className="xray-token-label">Payload</span>
              <JsonView value={jwt.payload} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const DiffView = React.memo(function DiffView({ current, previous, baselineId, baselineIsDrift }: {
  current: unknown;
  previous: unknown;
  baselineId: string | null;
  baselineIsDrift: boolean;
}): React.ReactElement {
  const selectEntry = usePanelStore((state) => state.selectEntry);
  const lines = React.useMemo(() => (previous == null ? [] : structuralDiff(previous, current)), [previous, current]);
  if (previous == null) {
    return <EmptyState label="No previous matching response" hint="A second call to this endpoint (or a recorded drift baseline) is needed to diff against." />;
  }
  return (
    <div className="xray-diff">
      <div className="xray-diff-head">
        <span className="xray-muted">
          {lines.length
            ? `${lines.length} difference${lines.length === 1 ? '' : 's'} vs ${baselineIsDrift ? 'the drift baseline' : 'the previous call'}`
            : 'No structural differences'}
        </span>
        {baselineId && (
          <button className="xray-chip" onClick={() => selectEntry(baselineId)}>Jump to baseline</button>
        )}
      </div>
      {lines.length > 0 && (
        <div className="xray-diff-lines">
          {lines.map((line, index) => (
            <div key={index} className={`xray-diff-line ${line.kind}`}>
              <span className="xray-diff-kind">{line.kind === 'added' ? '+' : line.kind === 'removed' ? '−' : '±'}</span>
              <code className="xray-diff-path">{line.path || '(root)'}</code>
              {line.kind !== 'added' && <code className="xray-diff-before">{preview(line.before, 90)}</code>}
              {line.kind !== 'removed' && <code className="xray-diff-after">{preview(line.after, 90)}</code>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
