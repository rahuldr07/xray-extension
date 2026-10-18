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
import { ErrorBoundary } from '../common/ErrorBoundary';
import { visibleText } from '../common/VisibleText';
import { usePanelStore } from '../../store';
import type { DetailView, WsFrame, XrayEntry } from '../../types';
import { diffNodes, nodeText, objectMembers, schemaFromNode, tableFromNode, timingPhases } from '../../models/detail';
import { bodyViews, isBodyView, resolveDetailFacet, type DetailFacet } from '../../models/detailNavigation';
import { buildVizSpecFromNode, vizValueText } from '../../models/viz';
import { duration, entryGroupPath, entryPath } from '../../models/entries';
import { extractJwts } from '../../models/lenses';
import { getResponseOperations, type ResponseOperation } from '../../models/operations';
import { isReplayableEntry } from '../../models/replayability';
import {
  DEFER_PARSE_CHARS,
  bodyDoc,
  bodyNode,
  bodyRawValue,
  entryBody,
  isJsonContentType,
  looksLikeJson,
  parsesAsJson,
  truncationNotice,
  type BodySide,
  type CapturedBody,
} from '../../models/capturedBody';
import { describeJsonError, printJson, type JsonDoc, type JsonNode } from '../../models/jsonText';
import { buildCurl, buildFetch, buildMockPayload, copyText, entryRequest, entryResponse, exportBodyText, formatBytes, formatTime, isoTimestamp, methodClass, safeStringify, statusClass } from '../../utils';
import { JsonNodeTree, JsonView } from './JsonView';
import { RawText, type RawMark, type RawTextHandle } from './RawText';
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
  // The facet's body as captured (J2–J6): what Raw shows verbatim and the Tree parses. A big body
  // parses off the render path; until then its views say "Parsing…".
  const bodySide: BodySide = (compact ? detailTab === 'request' : responseTab === 'request') ? 'request' : 'response';
  const bodyFacet = compact || responseTab === 'response' || responseTab === 'request';
  // Compact (no facet or view switch) shows the body's Tree through the same path.
  const shownView = compact ? 'tree' : bodyView;
  const body = bodyFacet ? entryBody(entry, bodySide) : null;
  const responseReady = usePreparedBody(entry, 'response');
  const requestReady = usePreparedBody(bodySide === 'request' ? entry : null, 'request');
  const bodyReady = bodySide === 'request' ? requestReady : responseReady;
  const doc = React.useMemo(() => (body && bodyReady ? bodyDoc(body) : null), [body, bodyReady]);
  const [rawPretty, setRawPretty] = React.useState(false);
  const driftFrom = React.useMemo(
    () => entry.driftFromId ? usePanelStore.getState().entries.find((candidate) => candidate.id === entry.driftFromId) || null : null,
    [entry.driftFromId, entriesLength],
  );
  // What Copy and Copy raw give on a facet that is not a body (body facets copy from the body itself).
  const activeValue = React.useMemo(() => {
    if (responseTab === 'headers') return headerSummary(entry);
    if (responseTab === 'cookies') return cookies;
    if (responseTab === 'timing') return timelineSummary(entry);
    if (responseTab === 'frames') return entry.wsFrames || [];
    if (responseTab === 'initiator') return entry.initiator || [];
    if (responseTab === 'tokens') return jwts;
    return undefined;
  }, [cookies, entry, jwts, responseTab]);
  // Table, Schema, Diff and Visualize read the body's nodes — the same model, the same code, on every
  // surface (spec J3, J11): the DevTools worker no longer computes its own table, schema or diff.
  const node = React.useMemo(() => (body && bodyReady ? bodyNode(body) : null), [body, bodyReady]);
  const operations = React.useMemo(
    () => (responseReady ? getResponseOperations(entry, usePanelStore.getState().entries, slowThresholdMs) : []),
    [entry, entriesLength, responseReady, slowThresholdMs],
  );
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
  const previousReady = usePreparedBody(previous, bodySide);
  const previousBody = previous ? entryBody(previous, bodySide) : null;
  const previousNode = React.useMemo(() => (previousBody && previousReady ? bodyNode(previousBody) : null), [previousBody, previousReady]);
  // A cut previous body (JSON or not) is not what was sent: Diff never compares against its prefix.
  const previousCut = !!previousBody?.truncation;

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
    const isBody = responseTab === 'request' || responseTab === 'response';
    const label = responseTabs.find((tab) => tab.id === responseTab)?.label || 'Content';
    // Tree and Raw copy the body as captured (Raw: the pretty text while Pretty is on) — never a
    // re-serialized value, which would round 9007199254740993 and reorder keys. So does a view that
    // cannot show this body (a truncated JSON body, a body still parsing): never a fake "string"
    // schema, [] or undefined.
    const blocked = isBody && !!body && bodyView !== 'tree' && bodyView !== 'raw' &&
      bodyBlock(body, bodyView === 'diff' ? bodyReady && (!previous || previousReady) : bodyReady) !== null;
    if (isBody && body && (bodyView === 'tree' || bodyView === 'raw' || blocked)) {
      const text = bodyCopyText(body, doc, bodyView === 'raw' && rawPretty && bodyReady);
      const cut = body.truncation ? ` (truncated: the first ${body.text.length.toLocaleString('en-US')} characters)` : '';
      await copyWithReceipt(text, `${label} copied${cut}.`, showToast);
      return;
    }
    // Table, Schema, Diff and Visualize copy what they show, printed from the nodes (exact lexemes).
    const text = isBody ? bodyViewCopyText(bodyView, node, previousNode, previousCut) : typeof activeValue === 'string' ? activeValue : safeStringify(activeValue, 2, 500_000);
    await copyWithReceipt(text, `${label}${isBody ? ` ${viewLabels[bodyView]}` : ''} copied${isTruncated(text) ? ' as a truncated preview' : ''}.`, showToast);
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
    // The rule serves the captured response text exactly (spec J10): lexemes and key order as received.
    const captured = entryBody(entry, 'response');
    const serialized = exportBodyText(captured, 2);
    const body = serialized.length > 100_000 ? serialized.slice(0, 100_000) : serialized;
    const truncated = serialized.length > 100_000 || !!captured.truncation;
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
      <div className={`xray-detail-content${bodyFacet && (shownView === 'tree' || shownView === 'raw') ? ' has-pane' : ''}`}>
        {/* J12: a pane that fails to render keeps the facets and views above it usable. */}
        <ErrorBoundary resetKeys={[entry.id, responseTab, bodyView]} raw={() => (body ? bodyRawValue(body) : activeValue)}>
          {!compact && responseTab === 'frames' && <FramesView frames={entry.wsFrames || []} state={entry.wsState} />}
          {!compact && responseTab === 'initiator' && <InitiatorView entry={entry} />}
          {!compact && responseTab === 'tokens' && <TokensView jwts={jwts} />}
          {!compact && responseTab === 'headers' && <HeadersView entry={entry} />}
          {!compact && responseTab === 'timing' && <WaterfallView entry={entry} />}
          {!compact && responseTab === 'cookies' && <JsonView value={cookies} />}
          {bodyFacet && body && <BodyNotices body={body} />}
          {bodyFacet && body && (
            body.kind === 'none' ? <EmptyState label={hasFrames && responseTab === 'response' ? 'Streaming entry' : `No ${compact ? bodySide : responseTab} body captured`} hint={hasFrames && responseTab === 'response' ? 'Open Frames to inspect the stream messages.' : 'The capture contains no body for this facet.'} />
              : body.kind === 'text' && body.text === '' && !body.truncation ? <EmptyState label={`Empty ${compact ? bodySide : responseTab} body`} hint="The body was captured and has no characters." />
                : <>
                  {shownView === 'tree' && <BodyTreeView body={body} doc={doc} ready={bodyReady} onShowRaw={() => selectDetailView('raw')} />}
                  {shownView === 'raw' && <RawView body={body} doc={doc} ready={bodyReady} pretty={rawPretty} onPretty={setRawPretty} />}
                  {shownView === 'grid' && (bodyBlock(body, bodyReady) ? <BlockedBody body={body} view="Table" onShowRaw={() => selectDetailView('raw')} /> : <TableView node={node} />)}
                  {shownView === 'schema' && (bodyBlock(body, bodyReady) ? <BlockedBody body={body} view="Schema" onShowRaw={() => selectDetailView('raw')} /> : <SchemaView node={node} />)}
                  {shownView === 'diff' && (bodyBlock(body, bodyReady && (!previous || previousReady)) ? <BlockedBody body={body} view="Diff" onShowRaw={() => selectDetailView('raw')} /> : <DiffView current={node} previous={previousNode} previousTruncated={previousCut} baselineId={driftFrom?.id || null} baselineIsDrift={!!driftFrom} />)}
                  {shownView === 'viz' && (bodyBlock(body, bodyReady) ? <BlockedBody body={body} view="Visualize" onShowRaw={() => selectDetailView('raw')} /> : <VizView node={node} />)}
                </>
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
}

// ── Body preparation: a big body parses off the render path (spec §1, J1) ──────────────────────

const preparedBodies = new WeakMap<object, Set<BodySide>>();

/** Runs `task` when the main thread is idle (within 100 ms); returns its cancel. */
function whenIdle(task: () => void): () => void {
  // Taken now, so the cancel undoes this very request whatever happens to the globals meanwhile.
  const request = window.requestIdleCallback;
  const cancel = window.cancelIdleCallback;
  if (typeof request === 'function' && typeof cancel === 'function') {
    const id = request.call(window, task, { timeout: 100 });
    return () => cancel.call(window, id);
  }
  const id = window.setTimeout(task, 0);
  return () => window.clearTimeout(id);
}

/**
 * Whether the entry's body on `side` is ready to show: always for a body under DEFER_PARSE_CHARS
 * (it parses during render in a few milliseconds); for a bigger JSON body, once two idle tasks have
 * parsed it (the doc every view shares) and derived its plain value (entryResponse/entryRequest), so
 * selecting a 5 MB response never blocks input for the whole parse.
 */
function usePreparedBody(entry: XrayEntry | null, side: BodySide): boolean {
  const body = entry ? entryBody(entry, side) : null;
  const pending = !!entry && !!body && body.text.length > DEFER_PARSE_CHARS && parsesAsJson(body) && !preparedBodies.get(entry)?.has(side);
  const [, setPrepared] = React.useState(0);
  React.useEffect(() => {
    if (!pending || !entry || !body) return undefined;
    let cancelled = false;
    let cancelValue: (() => void) | null = null;
    const cancelParse = whenIdle(() => {
      bodyDoc(body);
      if (cancelled) return;
      cancelValue = whenIdle(() => {
        if (side === 'request') entryRequest(entry);
        else entryResponse(entry);
        const sides = preparedBodies.get(entry) ?? new Set<BodySide>();
        sides.add(side);
        preparedBodies.set(entry, sides);
        if (!cancelled) setPrepared((count) => count + 1);
      });
    });
    return () => {
      cancelled = true;
      cancelParse();
      cancelValue?.();
    };
  }, [pending, entry, body, side]);
  return !pending;
}

/** A truncated body that is JSON (by type or look): its prefix is not the JSON that was sent. */
function isTruncatedJson(body: CapturedBody): boolean {
  return !!body.truncation && (isJsonContentType(body.contentType) || looksLikeJson(body.text));
}

/** What Copy gives for the Tree and Raw views: the captured text, the pretty text, a value as JSON. */
function bodyCopyText(body: CapturedBody, doc: JsonDoc | null, pretty: boolean): string {
  if (body.kind === 'value') return safeStringify(body.value, 2, Infinity);
  if (body.kind === 'binary') return binaryText(body);
  if (pretty && doc && doc.ok) return prettyText(doc);
  return body.text;
}

const textNode = (value: string): JsonNode => ({ t: 'str', value });

const DIFF_PREVIOUS_TRUNCATED = 'Diff unavailable: the previous body was truncated';
const DIFF_NO_PREVIOUS = 'No previous matching response';
const TABLE_EMPTY = 'No object rows found';

/** `{ "<key>": …, "notices": [ … ] }`, printed with every number as written. */
function withNotices(key: string, items: JsonNode[], notices: readonly string[]): string {
  return printJson({ t: 'obj', entries: [
    { key, value: { t: 'arr', items } },
    { key: 'notices', value: { t: 'arr', items: notices.map(textNode) } },
  ] }, { indent: 2 });
}

/**
 * What Copy gives in Table, Schema, Diff and Visualize: what the view shows, printed from the body's
 * nodes so every number keeps its lexeme — the rows and columns the Table shows with its cap notice,
 * the schema, the differences with the notices that qualify them (or the view's empty state), the chart.
 */
function bodyViewCopyText(view: DetailView, node: JsonNode | null, previous: JsonNode | null, previousTruncated: boolean): string {
  if (view === 'grid') {
    const table = tableFromNode(node);
    const rows: JsonNode[] = table.rows.map((row) => {
      const members = objectMembers(row);
      return { t: 'obj', entries: table.columns.flatMap((key) => {
        const value = members.get(key);
        return value ? [{ key, value }] : [];
      }) };
    });
    return withNotices('rows', rows, table.notice ? [table.notice] : rows.length ? [] : [TABLE_EMPTY]);
  }
  if (view === 'schema') return safeStringify(schemaFromNode(node), 2, Infinity);
  if (view === 'viz') return safeStringify(buildVizSpecFromNode(node), 2, Infinity);
  const { lines, notices } = previousTruncated ? { lines: [], notices: [DIFF_PREVIOUS_TRUNCATED] }
    : previous ? diffNodes(previous, node) : { lines: [], notices: [DIFF_NO_PREVIOUS] };
  const differences: JsonNode[] = lines.map((line) => ({
    t: 'obj',
    entries: [
      { key: 'path', value: textNode(line.path) },
      { key: 'kind', value: textNode(line.kind) },
      ...(line.before ? [{ key: 'before', value: line.before }] : []),
      ...(line.after ? [{ key: 'after', value: line.after }] : []),
    ],
  }));
  return withNotices('differences', differences, notices);
}

/** Pretty text up to this size is printed during render; a bigger body in an idle task. */
const PRETTY_SYNC_CHARS = 200_000;

/** printJson(root, {indent: 2}); NDJSON prints each document and joins them with newlines. */
function prettyText(doc: JsonDoc): string {
  if (!doc.root) return '';
  if (doc.kind === 'ndjson' && doc.root.t === 'arr') return doc.root.items.map((item) => printJson(item, { indent: 2 })).join('\n');
  return printJson(doc.root, { indent: 2 });
}

function binaryText(body: CapturedBody): string {
  const binary = body.binary;
  if (!binary) return '';
  if ('stream' in binary) return 'Streamed body (ReadableStream): not captured';
  return `Binary body: ${binary.size.toLocaleString('en-US')} bytes, not UTF-8 text. First 64 bytes (base64): ${binary.base64Prefix}`;
}

/**
 * Said once, above every body view (and above "No … body captured"): a truncated capture, a degraded
 * capture (entry.captureDegraded: part of the entry was lost), a re-serialized XHR json response, a
 * decrypted response.
 */
function BodyNotices({ body }: { body: CapturedBody }): React.ReactElement | null {
  const notices: Array<{ tone: 'info' | 'warning'; text: string }> = [];
  const cut = truncationNotice(body);
  if (cut) notices.push({ tone: 'warning', text: cut });
  if (body.degraded) notices.push({ tone: 'warning', text: 'Part of this entry could not be captured, so this body may be missing or incomplete.' });
  if (body.reserialized) notices.push({ tone: 'info', text: 'Rebuilt from the parsed response (XHR responseType "json"), not the text received.' });
  if (body.decrypted) notices.push({ tone: 'info', text: 'Showing the decrypted response.' });
  if (!notices.length) return null;
  return (
    <div className="xray-body-notices">
      {notices.map((notice) => <p key={notice.text} className={`xray-body-notice ${notice.tone}`} role="note">{notice.text}</p>)}
    </div>
  );
}

/**
 * Why Tree, Table, Schema, Diff and Visualize cannot show a body yet: a cut JSON body is not the JSON
 * that was sent (never a fake "string" schema), and a big body is still parsing. Null: they can.
 */
function bodyBlock(body: CapturedBody, ready: boolean): 'truncated' | 'parsing' | null {
  if (isTruncatedJson(body)) return 'truncated';
  if (!ready) return 'parsing';
  return null;
}

function BlockedBody({ body, view, onShowRaw }: { body: CapturedBody; view: string; onShowRaw: () => void }): React.ReactElement {
  if (!isTruncatedJson(body)) return <p className="xray-body-status" role="status">Parsing {formatBytes(body.text.length)}…</p>;
  return (
    <EmptyState
      label={`${view} unavailable for a truncated body`}
      hint={`The capture kept the first ${body.text.length.toLocaleString('en-US')} characters, which is not the complete JSON. Raw shows them.`}
      action={<button type="button" className="xray-chip" onClick={onShowRaw}>Show Raw</button>}
    />
  );
}

function BinaryBody({ body }: { body: CapturedBody }): React.ReactElement {
  const binary = body.binary;
  if (binary && 'stream' in binary) {
    return <EmptyState label="Streamed body" hint="The body was a ReadableStream; reading it would consume the page's stream, so it was not captured." />;
  }
  return (
    <div className="xray-card xray-binary-body">
      <h3>Binary body · {(binary?.size ?? 0).toLocaleString('en-US')} bytes</h3>
      <p className="xray-muted">Not UTF-8 text, so it is described rather than shown. First 64 bytes, base64:</p>
      <code className="xray-binary-prefix">{binary?.base64Prefix || '(empty)'}</code>
    </div>
  );
}

function treeLabel(body: CapturedBody): string {
  return `${body.side === 'request' ? 'Request' : 'Response'} JSON`;
}

function docNotes(doc: JsonDoc): React.ReactNode {
  const notes: string[] = [];
  if (doc.kind === 'ndjson' && doc.root?.t === 'arr') notes.push(`NDJSON · ${doc.root.items.length.toLocaleString('en-US')} ${doc.root.items.length === 1 ? 'document' : 'documents'}`);
  if (doc.duplicates) notes.push(`${doc.duplicates.toLocaleString('en-US')} duplicate ${doc.duplicates === 1 ? 'key' : 'keys'}`);
  if (doc.inexactNumbers) notes.push(`${doc.inexactNumbers.toLocaleString('en-US')} ${doc.inexactNumbers === 1 ? 'number' : 'numbers'} inexact in JS`);
  if (doc.prefix) notes.push(`XSSI guard ${doc.prefix} removed`);
  if (!notes.length) return null;
  return notes.map((note) => <span key={note} className="xray-json-note">{note}</span>);
}

/** The Tree for a body: the lossless parse, FormData/URL-encoded fields, a value, or the text itself. */
function BodyTreeView({ body, doc, ready, onShowRaw }: { body: CapturedBody; doc: JsonDoc | null; ready: boolean; onShowRaw: () => void }): React.ReactElement {
  if (body.kind === 'value') return <div className="xray-body-scroll"><JsonView value={body.value} /></div>;
  if (body.kind === 'binary') return <BinaryBody body={body} />;
  if (body.format === 'formdata' || body.format === 'urlencoded') {
    return (
      <div className="xray-body-pane">
        {body.format === 'formdata' && <p className="xray-body-notice info" role="note">FormData fields in the order sent; a file is described by its name, size and type. The multipart body itself is not captured.</p>}
        <JsonNodeTree root={bodyNode(body) as JsonNode} label={body.format === 'formdata' ? 'FormData fields' : 'URL-encoded parameters'} />
      </div>
    );
  }
  if (bodyBlock(body, ready)) return <BlockedBody body={body} view="Tree" onShowRaw={onShowRaw} />;
  if (doc && doc.root && (doc.ok || doc.kind === 'ndjson')) {
    return (
      <div className="xray-body-pane">
        {!doc.ok && <p className="xray-body-notice warning" role="note">Not every line is valid JSON: {describeJsonError(doc.error)}. The tree shows the lines that parsed; Raw marks the error.</p>}
        <JsonNodeTree root={doc.root} label={treeLabel(body)} notes={docNotes(doc)} />
      </div>
    );
  }
  if (doc && !doc.ok && looksLikeJson(body.text)) {
    return (
      <div className="xray-body-pane">
        <p className="xray-body-notice warning" role="note">Not valid JSON: {describeJsonError(doc.error)}. <button type="button" className="xray-link-btn" onClick={onShowRaw}>Show in Raw</button></p>
        <RawText text={body.text} label={`${body.side === 'request' ? 'Request' : 'Response'} text`} />
      </div>
    );
  }
  // Not JSON (HTML, plain text…): the text as it is.
  return <RawText text={body.text} gutter={false} label={`${body.side === 'request' ? 'Request' : 'Response'} text`} />;
}

/**
 * Raw: the body as captured, verbatim (J2) — windowed, never cut below the capture cap. Pretty shows
 * printJson(root, {indent: 2}) (every lexeme, key order and duplicate kept). Invalid JSON is marked at
 * its line and column. A body that is not text says what it is.
 */
function RawView({ body, doc, ready, pretty, onPretty }: {
  body: CapturedBody;
  doc: JsonDoc | null;
  ready: boolean;
  pretty: boolean;
  onPretty: (pretty: boolean) => void;
}): React.ReactElement {
  const handle = React.useRef<RawTextHandle>(null);
  const canPretty = ready && !!doc && doc.ok;
  const wantPretty = pretty && canPretty;
  // A big body is printed in an idle task (showing the text as captured meanwhile), so the click
  // that turns Pretty on is not one long task.
  const big = body.text.length > PRETTY_SYNC_CHARS;
  const syncPretty = React.useMemo(() => (wantPretty && doc && !big ? prettyText(doc) : null), [wantPretty, doc, big]);
  const [idlePretty, setIdlePretty] = React.useState<{ doc: JsonDoc; text: string } | null>(null);
  React.useEffect(() => {
    if (!wantPretty || !doc || !big || idlePretty?.doc === doc) return undefined;
    return whenIdle(() => setIdlePretty({ doc, text: prettyText(doc) }));
  }, [wantPretty, doc, big, idlePretty]);
  const prettyShown = syncPretty ?? (wantPretty && idlePretty?.doc === doc ? idlePretty.text : null);
  const formatting = wantPretty && prettyShown === null;
  const showPretty = prettyShown !== null;
  const valueShown = React.useMemo(() => (body.kind === 'value' ? safeStringify(body.value, 2, Infinity) : null), [body]);
  if (body.kind === 'binary') return <BinaryBody body={body} />;
  const mark: RawMark | null = !showPretty && doc && !doc.ok ? { offset: doc.error.pos, message: describeJsonError(doc.error) } : null;
  const facet = body.side === 'request' ? 'Request' : 'Response';
  return (
    <div className="xray-body-pane">
      <div className="xray-raw-toolbar" role="group" aria-label="Raw view">
        <button
          type="button"
          className="xray-json-tree-btn"
          aria-pressed={wantPretty}
          disabled={!canPretty}
          title={canPretty ? 'Indent the JSON, keeping every number, string and key as written' : ready ? 'Pretty needs a complete, valid JSON body' : 'Parsing…'}
          onClick={() => onPretty(!pretty)}
        >
          Pretty
        </button>
        {mark && <span className="xray-raw-error">Invalid JSON: {mark.message}</span>}
        {mark && <button type="button" className="xray-json-tree-btn" onClick={() => handle.current?.reveal(mark.offset)}>Go to error</button>}
        {!ready && <span className="xray-json-note" role="status">Parsing…</span>}
        {formatting && <span className="xray-json-note" role="status">Formatting…</span>}
        {showPretty && doc?.prefix && <span className="xray-json-note">XSSI guard {doc.prefix} not shown</span>}
        {body.kind === 'value' && <span className="xray-json-note">Not captured as text: the value as JSON.</span>}
        {body.format === 'formdata' && <span className="xray-json-note">FormData fields as name=value lines; the multipart body itself is not captured.</span>}
      </div>
      <RawText text={prettyShown ?? valueShown ?? body.text} mark={mark} label={`${facet} body`} handle={handle} />
    </div>
  );
}

function isTruncated(text: string): boolean {
  return /\n\.\.\. truncated \d+ chars$/.test(text);
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
    // toISOString throws outside the Date range; an imported or HUD entry can carry anything.
    startedAt: isoTimestamp(entry.timestamp),
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

function SchemaView({ node }: { node: JsonNode | null }): React.ReactElement {
  const inferred = React.useMemo(() => schemaFromNode(node), [node]);
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

/** The Table: the body's object rows, cells by lexeme; says "Showing R of N rows · C of K columns" when capped. */
function TableView({ node }: { node: JsonNode | null }): React.ReactElement {
  const table = React.useMemo(() => tableFromNode(node), [node]);
  if (!table.rows.length) return <EmptyState label={TABLE_EMPTY} />;
  return (
    <div className="xray-table-view">
      {table.notice && <p className="xray-body-notice info xray-table-notice" role="note">{table.notice}</p>}
      <table className="xray-table">
        <thead><tr>{table.columns.map((column) => <th key={column}>{visibleText(column)}</th>)}</tr></thead>
        <tbody>{table.cells.map((cells, index) => <tr key={index}>{cells.map((cell, column) => <td key={table.columns[column]}>{visibleText(cell)}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function VizView({ node }: { node: JsonNode | null }): React.ReactElement {
  const spec = React.useMemo(() => buildVizSpecFromNode(node), [node]);
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
          <div className="xray-viz-row" key={index} title={`${bar.label}: ${vizValueText(bar)}`}>
            <span className="xray-viz-label">{bar.label}</span>
            <span className="xray-viz-track">
              <span className={`xray-viz-fill ${bar.negative ? 'negative' : ''}`} style={{ width: `${Math.max(2, (Math.abs(bar.value) / denom) * 100)}%` }} />
            </span>
            <span className="xray-viz-value">{vizValueText(bar)}</span>
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

/** A frame cut at capture says so beside its size (spec J16: the cut is metadata, never an in-band "…"). */
function frameCutText(cut: NonNullable<WsFrame['truncated']>): string {
  const kept = Number(cut.keptChars).toLocaleString('en-US');
  return typeof cut.totalChars === 'number' ? `first ${kept} of ${cut.totalChars.toLocaleString('en-US')} characters` : `first ${kept} characters`;
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
            {frame.truncated && <span className="xray-frame-cut xray-muted">{frameCutText(frame.truncated)}</span>}
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

/**
 * Diff against the drift baseline or the previous call: diffNodes (lexemes, never a silent stop). A
 * notice says when a depth, array or line limit hid detail; "No structural differences" only when the
 * comparison was complete.
 */
const DiffView = React.memo(function DiffView({ current, previous, previousTruncated, baselineId, baselineIsDrift }: {
  current: JsonNode | null;
  previous: JsonNode | null;
  previousTruncated: boolean;
  baselineId: string | null;
  baselineIsDrift: boolean;
}): React.ReactElement {
  const selectEntry = usePanelStore((state) => state.selectEntry);
  const result = React.useMemo(() => (previous && !previousTruncated ? diffNodes(previous, current) : null), [current, previous, previousTruncated]);
  const jump = baselineId && <button className="xray-chip" onClick={() => selectEntry(baselineId)}>Jump to baseline</button>;
  if (previousTruncated) {
    return <EmptyState label={DIFF_PREVIOUS_TRUNCATED} hint="Its capture kept only a prefix, which is not the JSON that was sent; Diff compares complete bodies." action={jump || undefined} />;
  }
  if (!result) {
    return <EmptyState label={DIFF_NO_PREVIOUS} hint="A second call to this endpoint (or a recorded drift baseline) is needed to diff against." />;
  }
  const { lines, notices } = result;
  const against = baselineIsDrift ? 'the drift baseline' : 'the previous call';
  return (
    <div className="xray-diff">
      <div className="xray-diff-head">
        <span className="xray-muted">
          {lines.length
            ? `${lines.length} difference${lines.length === 1 ? '' : 's'} vs ${against}`
            : notices.length ? `No differences listed vs ${against}` : 'No structural differences'}
        </span>
        {jump}
      </div>
      {notices.length > 0 && (
        <div className="xray-body-notices">
          {notices.map((notice) => <p key={notice} className="xray-body-notice warning" role="note">{visibleText(notice)}</p>)}
        </div>
      )}
      {lines.length > 0 && (
        <div className="xray-diff-lines">
          {lines.map((line, index) => (
            <div key={index} className={`xray-diff-line ${line.kind}`}>
              <span className="xray-diff-kind">{line.kind === 'added' ? '+' : line.kind === 'removed' ? '−' : '±'}</span>
              <code className="xray-diff-path">{line.path ? visibleText(line.path) : '(root)'}</code>
              {line.kind !== 'added' && <code className="xray-diff-before">{line.before ? visibleText(nodeText(line.before, 90)) : ''}</code>}
              {line.kind !== 'removed' && <code className="xray-diff-after">{line.after ? visibleText(nodeText(line.after, 90)) : ''}</code>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
