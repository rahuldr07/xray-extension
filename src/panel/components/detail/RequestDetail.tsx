import React from 'react';
import {
  IconBookmark,
  IconBraces,
  IconChartBar,
  IconCode,
  IconCopy,
  IconDots,
  IconDownload,
  IconFileDiff,
  IconInfoCircle,
  IconKey,
  IconPin,
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
import type { DetailView, WsFrame, XrayEntry } from '../../types';
import { detailValue, gridRows, structuralDiff, timingPhases, type DiffLine } from '../../models/detail';
import { bodyViews, isBodyView, resolveDetailFacet, type DetailFacet } from '../../models/detailNavigation';
import { buildVizSpec, formatVizValue } from '../../models/viz';
import { duration, entryGroupPath, entryPath } from '../../models/entries';
import { extractJwts } from '../../models/lenses';
import { getResponseOperations, type ResponseOperation } from '../../models/operations';
import { isReplayableEntry } from '../../models/replayability';
import { buildCurl, buildFetch, buildMockPayload, copyText, entryResponse, formatBytes, formatTime, methodClass, preview, safeStringify, schema, statusClass } from '../../utils';
import { JsonView } from './JsonView';
import { focusFirstItem, handleMenuKeyDown, useMenuDismiss } from '../common/menuBehavior';

const iconProps = { size: 16, stroke: 1.8 } as const;

const responseTabs: Array<{ id: DetailFacet; label: string }> = [
  { id: 'response', label: 'Response' },
  { id: 'request', label: 'Request' },
  { id: 'headers', label: 'Headers' },
  { id: 'timing', label: 'Timing' },
  { id: 'frames', label: 'Frames' },
  { id: 'cookies', label: 'Cookies' },
  { id: 'initiator', label: 'Initiator' },
  { id: 'tokens', label: 'Tokens' },
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
  const compareLeftId = usePanelStore((state) => state.compareLeftId);
  const compareRightId = usePanelStore((state) => state.compareRightId);
  const setComparisonEntry = usePanelStore((state) => state.setComparisonEntry);
  const openComparison = usePanelStore((state) => state.openComparison);
  const slowThresholdMs = usePanelStore((state) => state.settings.slowThresholdMs);
  const rememberedBodyView = React.useRef(isBodyView(detailView) ? detailView : 'tree');
  const [conditional, setConditional] = React.useState<{ facet: DetailFacet; tab: typeof detailTab; view: DetailView } | null>(null);
  const [metadataOpen, setMetadataOpen] = React.useState(false);
  const [moreOpen, setMoreOpen] = React.useState(false);
  const detailRef = React.useRef<HTMLDivElement>(null);
  const moreRef = React.useRef<HTMLDivElement>(null);
  const moreTriggerRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [menuFit, setMenuFit] = React.useState<{ placement: 'up' | 'down'; maxHeight?: number; maxWidth?: number }>({ placement: 'up' });
  const moreId = React.useId();
  const metadataId = React.useId();
  const replayable = isReplayableEntry(entry);
  const cookies = React.useMemo(() => cookieSummary(entry), [entry]);
  const hasCookies = Object.keys(cookies).length > 0;
  const jwts = React.useMemo(() => extractJwts(entry), [entry]);
  const hasFrames = Array.isArray(entry.wsFrames);
  const hasInitiator = Array.isArray(entry.initiator) && entry.initiator.length > 0;
  const requestedFacet = conditional && conditional.tab === detailTab && conditional.view === detailView
    ? conditional.facet : resolveDetailFacet(detailTab, detailView);
  const facetAvailable = (facet: DetailFacet): boolean => {
    if (facet === 'frames') return hasFrames;
    if (facet === 'cookies') return hasCookies;
    if (facet === 'initiator') return hasInitiator;
    if (facet === 'tokens') return jwts.length > 0;
    return true;
  };
  // Derive the fallback during render, so a new entry never paints stale facet
  // content while waiting for an effect. The effect makes the fallback durable.
  const responseTab = facetAvailable(requestedFacet) ? requestedFacet : 'response';
  const bodyView = isBodyView(detailView) ? detailView : 'tree';
  const driftFrom = React.useMemo(
    () => entry.driftFromId ? usePanelStore.getState().entries.find((candidate) => candidate.id === entry.driftFromId) || null : null,
    [entry.driftFromId, entriesLength],
  );
  const activeValue = React.useMemo(() => {
    if (responseTab === 'headers') return headerSummary(entry);
    if (responseTab === 'cookies') return cookies;
    if (responseTab === 'timing') return timelineSummary(entry);
    if (responseTab === 'frames') return entry.wsFrames || [];
    if (responseTab === 'initiator') return entry.initiator || [];
    if (responseTab === 'tokens') return jwts;
    return detailValue(entry, compact ? detailTab : responseTab === 'request' ? 'request' : 'response');
  }, [compact, cookies, detailTab, entry, jwts, responseTab]);
  const operations = React.useMemo(() => getResponseOperations(entry, usePanelStore.getState().entries, slowThresholdMs), [entry, entriesLength, slowThresholdMs]);
  const secondaryOperations = React.useMemo(() => {
    // View operations have a direct facet/body-mode entry point. Console/Export
    // already live in the common row. Preserve all other applicable operations.
    const items = operations.filter((op) => op.kind !== 'view' && op.id !== 'send-console' && op.kind !== 'export');
    const required: ResponseOperation[] = [
      { id: 'copy-curl', label: 'Copy cURL', kind: 'copy', lazyCommand: () => buildCurl(entry), toast: 'cURL copied.', priority: 45 },
      { id: 'copy-fetch', label: 'Copy fetch', kind: 'copy', lazyCommand: () => buildFetch(entry), toast: 'fetch snippet copied.', priority: 44 },
      { id: 'mock', label: 'Copy mock JSON', kind: 'copy', lazyCommand: () => buildMockPayload(entry), priority: 43 },
      { id: 'save-snippet', label: 'Save Snippet', kind: 'snippet', command: 'schema(res)', priority: 42 },
    ];
    for (const op of required) if (!items.some((item) => item.id === op.id)) items.push(op);
    return items
      .filter((op) => replayable || !['copy-curl', 'copy-fetch', 'mock'].includes(op.id))
      .map((op) => op.id === 'copy-full' ? { ...op, label: 'Copy response preview' } : op.id === 'mock' ? { ...op, label: 'Copy mock JSON' } : op);
  }, [entry, operations, replayable]);
  const recommendations = secondaryOperations.filter((op) => ['compare-previous', 'related-errors', 'similar-calls', 'slow-calls'].includes(op.id)).slice(0, 2);
  const moreOperations = secondaryOperations.filter((op) => !recommendations.some((item) => item.id === op.id));
  // More-actions groups after the fixed run/analyse items: other analysis, then copy/save.
  const copyOrder = ['copy-curl', 'copy-fetch', 'mock', 'save-snippet'];
  const isCopyOperation = (op: ResponseOperation): boolean => op.kind === 'copy' || op.kind === 'snippet';
  const analyseOperations = moreOperations.filter((op) => !isCopyOperation(op));
  const copyOperations = moreOperations.filter(isCopyOperation).sort((a, b) => {
    const rank = (op: ResponseOperation): number => { const i = copyOrder.indexOf(op.id); return i < 0 ? -1 : i; };
    return rank(a) - rank(b);
  });
  // Diff pairs against the recorded drift baseline when one exists; otherwise
  // the previous call on the same endpoint (grouped per GraphQL operation).
  const previous = React.useMemo(
    () => driftFrom ?? previousSameEndpoint(entry, usePanelStore.getState().entries),
    [driftFrom, entry, entriesLength],
  );
  const previousValue = React.useMemo(() => previous ? detailValue(previous, responseTab === 'request' ? 'request' : 'response') : null, [previous, responseTab]);
  // Tagged with the inputs it was computed for, so a previous entry's diff/schema
  // is never shown during the render before the clearing effect runs.
  const [workerResult, setWorkerResult] = React.useState<{ active: unknown; previous: unknown; analysis: WorkerDetailAnalysis } | null>(null);
  const workerAnalysis = workerResult && workerResult.active === activeValue && workerResult.previous === previousValue ? workerResult.analysis : null;
  const workerDiff = React.useMemo(() => normalizeWorkerDiff(workerAnalysis?.diff), [workerAnalysis?.diff]);

  React.useEffect(() => {
    if (isBodyView(detailView)) rememberedBodyView.current = detailView;
  }, [detailView]);

  React.useEffect(() => {
    if (conditional && (conditional.tab !== detailTab || conditional.view !== detailView)) setConditional(null);
    if (requestedFacet !== responseTab) {
      setConditional(null);
      setDetailTab('response');
      setDetailView(rememberedBodyView.current);
    }
  }, [conditional, detailTab, detailView, requestedFacet, responseTab, setDetailTab, setDetailView]);

  React.useEffect(() => { setMoreOpen(false); setMetadataOpen(false); }, [entry.id]);

  // Open towards whichever side of the trigger has more room inside this panel and
  // scroll the menu when neither side fits it, so every item stays reachable.
  React.useLayoutEffect(() => {
    if (!moreOpen || !detailRef.current || !moreTriggerRef.current || !menuRef.current) return;
    const bounds = detailRef.current.getBoundingClientRect();
    const trigger = moreTriggerRef.current.getBoundingClientRect();
    const gap = 8;
    const above = trigger.top - bounds.top - gap;
    const below = bounds.bottom - trigger.bottom - gap;
    const needed = menuRef.current.scrollHeight + 2;
    const placement = above >= needed || above >= below ? 'up' : 'down';
    setMenuFit({ placement, maxHeight: Math.max(120, Math.floor(Math.min(needed, placement === 'up' ? above : below))), maxWidth: Math.max(160, Math.floor(bounds.width - 16)) });
  }, [moreOpen]);

  // Disclosure of buttons (not an ARIA menu): focus moves in on open; the keyboard,
  // Escape and outside-press behaviour is shared in menuBehavior.ts. Initial focus
  // skips items that act immediately (Replay sends at once), so a double Enter on
  // the trigger can never replay; Edit & Replay only opens the editor.
  React.useEffect(() => {
    if (!moreOpen) return;
    const safe = menuRef.current?.querySelector<HTMLElement>('button:not(:disabled):not([data-sends-immediately])');
    if (safe) safe.focus(); else focusFirstItem(menuRef.current);
  }, [moreOpen]);
  useMenuDismiss(moreOpen, moreRef, moreTriggerRef, () => setMoreOpen(false), undefined, true);

  // Closing from an activated item returns focus to the trigger; an item that opens
  // a modal therefore hands the modal the trigger as its restore target.
  function closeMenu(): void {
    setMoreOpen(false);
    moreTriggerRef.current?.focus();
  }

  function onMenuKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
    handleMenuKeyDown(event, menuRef.current, moreRef.current, moreTriggerRef.current, () => setMoreOpen(false));
  }

  React.useEffect(() => {
    let cancelled = false;
    setWorkerResult(null);
    if (!window.XRAY_Worker?.detailAnalysis) return;
    window.XRAY_Worker.detailAnalysis(activeValue, previousValue)
      .then((analysis) => {
        if (!cancelled && analysis && typeof analysis === 'object') setWorkerResult({ active: activeValue, previous: previousValue, analysis: analysis as WorkerDetailAnalysis });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [activeValue, previousValue]);

  function selectResponseTab(tab: DetailFacet): void {
    if (tab !== 'response' && tab !== 'request' && tab !== 'headers' && tab !== 'timing') {
      setConditional({ facet: tab, tab: detailTab, view: detailView });
      return;
    }
    setConditional(null);
    if (tab === 'headers') {
      setDetailTab('headers');
      setDetailView('headers');
      return;
    }
    if (tab === 'timing') {
      setDetailTab('response');
      setDetailView('waterfall');
      return;
    }
    setDetailTab(tab);
    setDetailView(rememberedBodyView.current);
  }

  function selectDetailView(view: DetailView): void {
    setConditional(null);
    setDetailView(view);
    if (view === 'headers') {
      setDetailTab('headers');
      return;
    }
    if (view === 'waterfall') {
      setDetailTab('response');
      return;
    }
    rememberedBodyView.current = isBodyView(view) ? view : rememberedBodyView.current;
    setDetailTab(responseTab === 'request' ? 'request' : 'response');
  }

  async function copyActiveValue(): Promise<void> {
    let value = activeValue;
    const body = responseTab === 'request' || responseTab === 'response';
    if (body && bodyView === 'schema') value = workerAnalysis?.schema ?? schema(activeValue);
    if (body && bodyView === 'grid') value = (workerAnalysis?.grid ?? gridRows(activeValue)).objects;
    if (body && bodyView === 'diff') value = previousValue == null ? [] : structuralDiff(previousValue, activeValue);
    if (body && bodyView === 'viz') value = buildVizSpec(activeValue);
    const text = typeof value === 'string' ? value : safeStringify(value, 2, 500_000);
    const label = responseTabs.find((tab) => tab.id === responseTab)?.label || 'Content';
    await copyWithReceipt(text, `${label}${body && bodyView !== 'tree' && bodyView !== 'raw' ? ` ${viewLabels[bodyView]}` : ''} copied${isTruncated(text) ? ' as a truncated preview' : ''}.`, showToast);
  }

  async function runOperation(operation: ResponseOperation): Promise<void> {
    setMoreOpen(false);
    if (operation.kind === 'view') {
      if (operation.id === 'headers' || operation.view === 'headers') {
        selectResponseTab('headers');
      } else if (operation.view === 'waterfall') {
        selectResponseTab('timing');
      } else {
        setConditional(null);
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
      const receipt = operation.id === 'copy-full'
        ? `Response preview copied${isTruncated(text) ? ' (truncated)' : ''}.`
        : `${operation.id === 'mock' ? 'Mock JSON' : operation.label.replace(/^Copy /, '')} copied${isTruncated(text) ? ' as a truncated preview' : ''}.`;
      await copyWithReceipt(text, receipt, showToast);
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

  function createMock(): void {
    setMoreOpen(false);
    const value = entryResponse(entry);
    const serialized = typeof value === 'string' ? value : safeStringify(value, 2, 100_000);
    const body = serialized.length > 100_000 ? serialized.slice(0, 100_000) : serialized;
    const truncated = serialized.length > 100_000 || isTruncated(body);
    const receipt = usePanelStore.getState().addRule({
      label: `${entry.method || 'GET'} ${entryPath(entry)}`,
      match: { url: String(entry.urlPath || entry.url || ''), method: String(entry.method || '') },
      action: { type: 'mock', status: Number(entry.status) || 200, body, headers: {}, delayMs: 0 },
    });
    showToast(receipt.accepted ? `Created disabled mock rule${truncated ? ' with truncated response preview' : ''}.` : 'Mock rule not created: rule limit reached.');
  }

  // P2: the pinned request becomes `a`…`f` in the Console (its parsed response body).
  function pinInConsole(): void {
    const state = usePanelStore.getState();
    const existing = state.consolePins.find((pin) => pin.entryId === entry.id);
    const name = state.pinConsoleRequest(entry.id);
    if (!name) return; // refused: the store has shown why (limit of 6)
    showToast(existing ? `Already pinned as ${name} in Console.` : `Pinned as ${name} in Console.`);
  }

  function prepareConsole(): void {
    const commands: Record<DetailFacet, string> = {
      response: 'res', request: 'req', headers: '({ requestHeaders: entry.requestHeaders, responseHeaders: entry.responseHeaders })',
      timing: 'entry.timing', frames: 'entry.wsFrames', cookies: '({ requestHeaders: entry.requestHeaders, responseHeaders: entry.responseHeaders })',
      initiator: 'entry.initiator', tokens: 'entry.jwtLenses',
    };
    insertConsoleCommand(commands[responseTab]);
  }

  function replayNow(): void {
    replayEntry(entry);
  }

  return (
    <div ref={detailRef} className={`xray-request-detail ${compact ? 'compact' : ''}`}>
      {!compact && (
        <>
          <div className="xray-detail-hero">
            <div className="xray-response-heading">
              <span className={`xray-method ${methodClass(entry.method)}`}>{entry.method || 'GET'}</span>
              <h3 title={String(entry.url || entry.urlPath || '')}>{entryPath(entry)}</h3>
            </div>
            <div className="xray-response-chips">
              <span className={`xray-response-chip ${statusClass(status)}`}>{entry.status || entry.logLevel || 'log'}</span>
              <span className="xray-response-chip">{Math.round(duration(entry))}ms</span>
              <span className="xray-response-chip">{formatBytes(entry.size)}</span>
              {entry.mocked && <span className="xray-api-flag mocked">Mocked</span>}
              {entry.replayed && <span className="xray-api-flag replayed">Replayed</span>}
              {entry.imported && <span className="xray-api-flag">Imported</span>}
              {hasFrames && <span className="xray-api-flag">{entry.wsState || 'Streaming'}</span>}
            </div>
            <button className="xray-action-btn xray-detail-action" aria-expanded={metadataOpen} aria-controls={metadataId} title="Metadata" onClick={() => setMetadataOpen((open) => !open)}><IconInfoCircle {...iconProps} /><span className="xray-detail-action-label">Metadata</span></button>
            <div className="xray-detail-actions" role="group" aria-label="Request actions">
              <button className="xray-action-btn xray-detail-action" title="Copy the inspected content" onClick={() => void copyActiveValue()}><IconCopy {...iconProps} /><span className="xray-detail-action-label">Copy</span></button>
              <button className="xray-action-btn xray-detail-action primary" title="Export" onClick={() => setExportOpen(true)}><IconDownload {...iconProps} /><span className="xray-detail-action-label">Export</span></button>
              <button className="xray-action-btn xray-detail-action" title="Send to Console" onClick={prepareConsole}><IconSend {...iconProps} /><span className="xray-detail-action-label">Console</span></button>
              <div ref={moreRef} className="xray-detail-more">
                <button ref={moreTriggerRef} className="xray-action-btn xray-detail-action" aria-label="More actions" title="More actions" aria-expanded={moreOpen} aria-controls={moreId} onClick={() => setMoreOpen((open) => !open)}><IconDots {...iconProps} /><span className="xray-detail-action-label">More actions</span></button>
                {moreOpen && <div id={moreId} ref={menuRef} className="xray-detail-action-list" data-placement={menuFit.placement} style={{ maxHeight: menuFit.maxHeight, maxWidth: menuFit.maxWidth }} role="group" aria-label="Secondary request actions" onKeyDown={onMenuKeyDown}>
                  {replayable && <>
                    <button className="xray-menu-item" data-sends-immediately="" onClick={() => { closeMenu(); replayNow(); }}><IconRepeat {...iconProps} />Replay</button>
                    <button className="xray-menu-item" onClick={() => { closeMenu(); openReplayEditor(entry); }}><IconRepeat {...iconProps} />Edit &amp; Replay</button>
                    <button className="xray-menu-item" onClick={() => { closeMenu(); usePanelStore.getState().draftExperiment(entry); }}><IconRepeat {...iconProps} />Prepare experiment</button>
                    <div className="xray-menu-sep" aria-hidden="true" />
                  </>}
                  <button className="xray-menu-item" onClick={() => { closeMenu(); openExplain(entry); }}><IconSparkles {...iconProps} />Explain</button>
                  {entry.type === 'api' && <button className="xray-menu-item" title="Keep this request as a Console variable (its response body)" onClick={() => { closeMenu(); pinInConsole(); }}><IconPin {...iconProps} />Pin in Console</button>}
                  <button className="xray-menu-item" onClick={() => { closeMenu(); const state = usePanelStore.getState(); state.selectEntry(entry.id); if (state.saveInvestigation()) state.setActiveTab('rules'); }}><IconBookmark {...iconProps} />Save investigation</button>
                  {replayable && <button className="xray-menu-item" onClick={() => { closeMenu(); createMock(); }}><IconPlugConnected {...iconProps} />Create disabled mock rule</button>}
                  {analyseOperations.map((operation) => <button key={operation.id} className="xray-menu-item" onClick={() => { closeMenu(); void runOperation(operation); }}><OperationIcon operation={operation} />{operation.label}</button>)}
                  {copyOperations.length > 0 && <div className="xray-menu-sep" aria-hidden="true" />}
                  {copyOperations.map((operation) => <button key={operation.id} className="xray-menu-item" onClick={() => { closeMenu(); void runOperation(operation); }}><OperationIcon operation={operation} />{operation.label}</button>)}
                  <div className="xray-menu-sep" aria-hidden="true" />
                  <button className="xray-menu-item" aria-pressed={compareLeftId === entry.id} onClick={() => { setComparisonEntry('left', entry.id); closeMenu(); }}><IconFileDiff {...iconProps} />Set as comparison left</button>
                  <button className="xray-menu-item" aria-pressed={compareRightId === entry.id} onClick={() => { setComparisonEntry('right', entry.id); closeMenu(); }}><IconFileDiff {...iconProps} />Set as comparison right</button>
                  <button className="xray-menu-item" onClick={() => { closeMenu(); openComparison(); }}><IconFileDiff {...iconProps} />Open comparison</button>
                </div>}
              </div>
            </div>
            {onClose && <button className="xray-icon-btn xray-detail-close" aria-label="Close selected request detail" onClick={onClose}><IconX {...iconProps} /></button>}
          </div>
          {metadataOpen && <div id={metadataId} className="xray-detail-metadata">
            <label>Full URL<input className="xray-input" aria-label="Full request URL" readOnly value={String(entry.url || entry.urlPath || '')} /></label>
            <span className="xray-muted">{entry.source || 'fetch'} · {formatTime(entry.timestamp)}{entry.graphql?.operationName ? ` · ${entry.graphql.operationName}` : ''}</span>
            {entry.replayOf && <span className="xray-muted">Replay of {entry.replayOf}</span>}
            {entry.mockRuleId && <span className="xray-muted">Mock rule {entry.mockRuleId}</span>}
          </div>}
          {(compareLeftId || compareRightId) && <div className="xray-detail-comparison" role="group" aria-label="Comparison selection">
            <span className="xray-muted">Left {compareLeftId ? 'selected' : 'not selected'} · Right {compareRightId ? 'selected' : 'not selected'}</span>
            <button className="xray-chip" onClick={() => { setMoreOpen(false); openComparison(); }}>Open comparison</button>
          </div>}
          {driftFrom && (
            <div className="xray-drift-banner" role="status">
              <IconRoute {...iconProps} />
              <span>Response schema changed versus the previous call to this endpoint.</span>
              <button className="xray-chip" onClick={() => { setConditional(null); setDetailTab('response'); setDetailView('diff'); }}>View diff</button>
            </div>
          )}
          <div className="xray-detail-nav">
            <div className="xray-detail-tabs" role="group" aria-label="Request facets">
              {visibleResponseTabs.map((tab) => <button key={tab.id} aria-pressed={responseTab === tab.id} className={`xray-detail-tab ${responseTab === tab.id ? 'active' : ''}`} onClick={() => selectResponseTab(tab.id)}>{tab.label}</button>)}
            </div>
            {(responseTab === 'response' || responseTab === 'request') && <div className="xray-detail-views" role="group" aria-label="Body views">
              {bodyViews.map((view) => <button key={view} aria-pressed={bodyView === view} className={`xray-chip ${bodyView === view ? 'active' : ''}`} onClick={() => selectDetailView(view)}>{viewLabels[view] || view}</button>)}
            </div>}
          </div>
          {recommendations.length > 0 && <div className="xray-detail-recommendations" role="group" aria-label="Recommended actions">
            {recommendations.map((operation) => <button key={operation.id} className="xray-chip xray-operation-chip" onClick={() => void runOperation(operation)}><OperationIcon operation={operation} />{operation.label}</button>)}
          </div>}
        </>
      )}
      <div className="xray-detail-content">
        {!compact && responseTab === 'frames' && <FramesView frames={entry.wsFrames || []} state={entry.wsState} />}
        {!compact && responseTab === 'initiator' && <InitiatorView entry={entry} />}
        {!compact && responseTab === 'tokens' && <TokensView jwts={jwts} />}
        {!compact && responseTab === 'headers' && <HeadersView entry={entry} />}
        {!compact && responseTab === 'timing' && <WaterfallView entry={entry} />}
        {!compact && responseTab === 'cookies' && <JsonView value={cookies} />}
        {(compact || responseTab === 'response' || responseTab === 'request') && (
          <>
            {!compact && (activeValue == null || activeValue === '') ? <EmptyState label={hasFrames && responseTab === 'response' ? 'Streaming entry' : `No ${responseTab} body captured`} hint={hasFrames && responseTab === 'response' ? 'Open Frames to inspect the stream messages.' : 'The capture contains no body for this facet.'} /> : <>
              {(compact || bodyView === 'tree') && <TreeContent compact={compact} entry={entry} detailTab={detailTab} responseTab={responseTab} activeValue={activeValue} hasFrames={hasFrames} />}
              {!compact && bodyView === 'grid' && <GridView value={activeValue} workerGrid={workerAnalysis?.grid} />}
              {!compact && bodyView === 'raw' && <RawView value={activeValue} />}
              {!compact && bodyView === 'schema' && <SchemaView value={activeValue} workerSchema={workerAnalysis?.schema} />}
              {!compact && bodyView === 'diff' && <DiffView current={activeValue} previous={previousValue} workerDiff={workerDiff} baselineId={driftFrom?.id || null} baselineIsDrift={!!driftFrom} />}
              {!compact && bodyView === 'viz' && <VizView value={activeValue} />}
            </>}
          </>
        )}
      </div>
    </div>
  );
}

function isTruncated(text: string): boolean {
  return /\n\.\.\. truncated \d+ chars$/.test(text);
}

// Worker messages are an untrusted transport boundary. Accept only the bounded
// structural metadata and scalar previews; never render workerAnalysis.diff's
// raw previous/current payload snapshots.
function normalizeWorkerDiff(value: unknown): DiffLine[] | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const rows = (value as { structuralDiff?: unknown }).structuralDiff;
  // The producer returns at most 500 rows. Validate the entire bounded message,
  // even the rows beyond the existing 200-line display cap.
  if (!Array.isArray(rows) || rows.length > 500) return null;
  const lines: DiffLine[] = [];
  for (const row of rows) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return null;
    const candidate = row as { type?: unknown; path?: unknown; from?: unknown; to?: unknown; value?: unknown };
    if ((candidate.type !== 'added' && candidate.type !== 'removed' && candidate.type !== 'changed')
      || typeof candidate.path !== 'string' || candidate.path.length > 500) return null;
    const required = candidate.type === 'changed' ? ['from', 'to'] : ['value'];
    // Undefined is a valid structured-cloned value; absence or an accessor is not.
    if (!required.every(key => {
      const descriptor = Object.getOwnPropertyDescriptor(row, key);
      return descriptor && 'value' in descriptor;
    })) return null;
    if (lines.length >= 200) continue;
    const line: DiffLine = { path: candidate.path, kind: candidate.type };
    if (candidate.type === 'added') line.after = boundedWorkerValue(candidate.value);
    else if (candidate.type === 'removed') line.before = boundedWorkerValue(candidate.value);
    else {
      line.before = boundedWorkerValue(candidate.from);
      line.after = boundedWorkerValue(candidate.to);
    }
    lines.push(line);
  }
  return lines;
}

function boundedWorkerValue(value: unknown): unknown {
  if (typeof value === 'string') return value.length > 2_000 ? `${value.slice(0, 2_000)}…` : value;
  if (value === null || typeof value === 'number' || typeof value === 'boolean' || value === undefined) return value;
  return preview(value, 2_000);
}

async function copyWithReceipt(text: string, receipt: string, showToast: (message: string) => void): Promise<void> {
  try {
    await copyText(text);
    showToast(receipt);
  } catch (error) {
    showToast(`Copy failed: ${error instanceof Error ? error.message : String(error)}`);
  }
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
  responseTab: DetailFacet;
  activeValue: unknown;
  hasFrames: boolean;
}): React.ReactElement {
  if (compact) return <JsonView value={detailValue(entry, detailTab as never)} />;
  if (responseTab === 'headers') return <HeadersView entry={entry} />;
  // Non-JSON bodies (HTML, plain text) read as text, not as one giant
  // JSON-escaped string literal.
  if (typeof activeValue === 'string') return <pre className="xray-json xray-json-text">{activeValue}</pre>;
  if (activeValue == null && hasFrames && responseTab === 'response') {
    return <EmptyState label="Streaming entry" hint="This is a WebSocket/SSE stream - open the Frames tab to inspect the messages." />;
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
        <input className="xray-input" aria-label="Filter request and response headers" placeholder="Filter headers…" value={filter} onChange={(event) => setFilter(event.currentTarget.value)} />
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
                      onClick={() => void copyWithReceipt(String(value ?? ''), `${key} copied.`, showToast)}
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
                onClick={() => void copyWithReceipt(frame, 'Frame copied.', showToast)}
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

const DiffView = React.memo(function DiffView({ current, previous, workerDiff, baselineId, baselineIsDrift }: {
  current: unknown;
  previous: unknown;
  workerDiff?: DiffLine[] | null;
  baselineId: string | null;
  baselineIsDrift: boolean;
}): React.ReactElement {
  const selectEntry = usePanelStore((state) => state.selectEntry);
  const lines = React.useMemo(() => (previous == null ? [] : workerDiff ?? structuralDiff(previous, current)), [current, previous, workerDiff]);
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
