import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  IconAdjustmentsHorizontal,
  IconArrowDown,
  IconArrowLeft,
  IconArrowUp,
  IconChevronDown,
  IconChevronRight,
  IconLayoutList,
  IconLayoutRows,
  IconCopy,
  IconFilter,
  IconFilterOff,
  IconPin,
  IconSearch,
  IconX,
} from '@tabler/icons-react';
import { EmptyState } from '../common/EmptyState';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { FirstRun } from '../common/FirstRun';
import { PaneDivider, usePaneSplit } from '../common/PaneDivider';
import { RequestDetail } from '../detail/RequestDetail';
import { LogDetail } from '../detail/LogDetail';
import { JsonView } from '../detail/JsonView';
import { usePanelStore } from '../../store';
import {
  buildApiListSummary,
  buildEntryListModel,
  duration,
  entryGroupPath,
  entryGroupLabel,
  entryGroupStats,
  entryPath,
  getEntryContentType,
  getEntryDomain,
  isApi,
  matchesApiQuickFilter,
  type ApiEntryFlag,
  type EntryListItem,
  type EntryListModel,
  type ApiListSummary,
} from '../../models/entries';
import { levelBucket, logLevelFilters, matchesLevel, type LevelFilter } from '../../models/logLevels';
import { buildSessionIndex, type SessionIndex } from '../../models/sessionIndex';
import { logEntryText } from '../../models/logValue';
import type { ApiGroupingMode, ApiQuickFilter, SortField, XrayEntry } from '../../types';
import { copyText, entryRequest, formatBytes, formatTime, methodClass, statusClass } from '../../utils';

const iconProps = { size: 16, stroke: 1.8 } as const;

const quickFilters: Array<{ id: ApiQuickFilter; label: string }> = [
  { id: 'errors', label: 'Errors' },
  { id: 'slow', label: 'Slow' },
  { id: 'pinned', label: 'Pinned' },
];

const secondaryQuickFilters: Array<{ id: ApiQuickFilter; label: string }> = [
  { id: 'repeated', label: 'Repeated' },
  { id: 'large', label: 'Large' },
  { id: 'empty', label: 'Empty' },
  { id: 'drift', label: 'Drift' },
  { id: 'graphql', label: 'GraphQL' },
  { id: 'ws', label: 'Streams' },
  { id: 'mocked', label: 'Mocked' },
  { id: 'replayed', label: 'Replays' },
];

const sortOptions: Array<{ id: SortField; label: string }> = [
  { id: 'timestamp', label: 'Latest' },
  { id: 'duration', label: 'Slowest' },
  { id: 'status', label: 'Status' },
  { id: 'size', label: 'Size' },
];

const flagLabels: Record<ApiEntryFlag, string> = {
  error: 'Error',
  slow: 'Slow',
  repeated: 'Repeated',
  large: 'Large',
  empty: 'Empty',
  pinned: 'Pinned',
  drift: 'Drift',
  graphql: 'GraphQL',
  ws: 'Stream',
  mocked: 'Mocked',
  replayed: 'Replay',
};

type RequestContextTab = 'request' | 'params' | 'headers' | 'body' | 'timeline';

// Split-divider bounds. 0 persis

const requestContextTabs: Array<{ id: RequestContextTab; label: string }> = [
  { id: 'request', label: 'Request' },
  { id: 'params', label: 'Params' },
  { id: 'headers', label: 'Headers' },
  { id: 'body', label: 'Body' },
  { id: 'timeline', label: 'Timeline' },
];

// Clicking the active quick filter (chip or summary shortcut) turns it off.
function toggledQuickFilter(current: ApiQuickFilter, id: ApiQuickFilter): ApiQuickFilter {
  return current === id ? 'all' : id;
}

function useEntryListModel(mode: 'api' | 'logs'): EntryListModel {
  const entries = usePanelStore((state) => state.entries);
  const query = usePanelStore((state) => state.apiSearchQuery.trim());
  const statusFilters = usePanelStore((state) => state.statusFilters);
  const typeFilters = usePanelStore((state) => state.typeFilters);
  const methodFilters = usePanelStore((state) => state.methodFilters);
  const expandedGroups = usePanelStore((state) => state.expandedGroups);
  const pinnedIds = usePanelStore((state) => state.pinnedIds);
  const sortField = usePanelStore((state) => state.sortField);
  const sortOrder = usePanelStore((state) => state.sortOrder);
  const apiQuickFilter = usePanelStore((state) => state.apiQuickFilter);
  const apiGroupingMode = usePanelStore((state) => state.apiGroupingMode);
  const slowThresholdMs = usePanelStore((state) => state.settings.slowThresholdMs);
  const index = useMemo(() => buildSessionIndex(entries), [entries]);

  return useMemo(() => buildEntryListModel({
    mode,
    entries,
    query,
    statusFilters,
    typeFilters,
    methodFilters,
    expandedGroups,
    pinnedIds,
    sortField,
    sortOrder,
    slowThresholdMs,
    apiQuickFilter,
    apiGroupingMode,
    index,
  }), [apiGroupingMode, apiQuickFilter, entries, expandedGroups, index, methodFilters, mode, pinnedIds, query, slowThresholdMs, sortField, sortOrder, statusFilters, typeFilters]);
}

// Below 600px the detail replaces the list pane. When the detail appears, focus moves
// to its way back if the detail was opened from the list, or if focus is on the
// now-hidden list or already lost (<body>, or nothing inside a shadow root) — e.g. a
// stale drawer flag picked up by ArrowDown, or a selection made by search/palette.
// Focus that is already elsewhere (inside the drawer, another control) stays put.
function focusBackIfListHidden(list: HTMLElement | null, paneSelector: string, back: HTMLElement | null, fromList: boolean): void {
  const pane = list?.closest(paneSelector);
  if (!list || !pane || pane.getClientRects().length) return;
  const root = list.getRootNode() as Document | ShadowRoot;
  const active = root.activeElement;
  const pageActive = list.ownerDocument.activeElement;
  const lost = active
    ? active === list.ownerDocument.body || pane.contains(active)
    : !pageActive || pageActive === list.ownerDocument.body;
  if (fromList || lost) back?.focus();
}

export function EntriesWorkspace({ mode }: { mode: 'api' | 'logs' }): React.ReactElement {
  if (mode === 'api') return <ApiWorkspace />;
  return <LogsWorkspace />;
}

function ApiWorkspace(): React.ReactElement {
  const firstRunDismissed = usePanelStore((state) => state.settings.firstRunDismissed);
  const entries = usePanelStore((state) => state.entries);
  const selectedId = usePanelStore((state) => state.selectedId);
  const apiDetailOpen = usePanelStore((state) => state.apiDetailOpen);
  const selectEntry = usePanelStore((state) => state.selectEntry);
  const setApiDetailOpen = usePanelStore((state) => state.setApiDetailOpen);
  const togglePinned = usePanelStore((state) => state.togglePinned);
  const toggleGroup = usePanelStore((state) => state.toggleGroup);
  const expandedGroups = usePanelStore((state) => state.expandedGroups);
  const pinnedIds = usePanelStore((state) => state.pinnedIds);
  const compactRows = usePanelStore((state) => state.settings.compactRows);
  const slowThresholdMs = usePanelStore((state) => state.settings.slowThresholdMs);
  const index = useMemo(() => buildSessionIndex(entries), [entries]);
  const showHostInPath = usePanelStore((state) => state.settings.showHostInPath);
  const sortField = usePanelStore((state) => state.sortField);
  const sortOrder = usePanelStore((state) => state.sortOrder);
  const apiSplit = usePanelStore((state) => state.settings.apiSplit);
  const updateSettings = usePanelStore((state) => state.updateSettings);
  const { rows, matchingApiCount } = useEntryListModel('api');
  const hasApiEntries = useMemo(() => entries.some(isApi), [entries]);
  const selected = selectedId ? entries.find((entry) => entry.id === selectedId && entry.type === 'api') || null : null;
  const activeApiId = selected?.type === 'api' ? selected.id : null;
  const maxDuration = useMemo(() => Math.max(100, ...entries.filter(isApi).map((entry) => duration(entry))), [entries]);
  // Existing contract: buildApiListSummary(entries, pinnedIds, slowThresholdMs)
  const summary = useMemo(() => buildApiListSummary(entries, pinnedIds, slowThresholdMs, index), [entries, index, pinnedIds, slowThresholdMs]);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const getItemKey = useCallback((index: number) => rows[index]?.key || index, [rows]);
  const estimateSize = useCallback(() => (compactRows ? 32 : 44), [compactRows]);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    getItemKey,
    overscan: 14,
  });

  // Search and the command palette only select entries. Reveal the owning
  // endpoint here so grouping remains a list concern, then scroll after the
  // child rows have been materialized by the virtualizer.
  // Reveal once per selection: live traffic re-deriving `rows` must not snap the
  // list back to the selection, and a manual collapse must not be undone.
  const revealedIdRef = useRef<string | null>(null);
  const revealFrameRef = useRef(0);
  useEffect(() => () => cancelAnimationFrame(revealFrameRef.current), []);
  useEffect(() => {
    if (!selected) { revealedIdRef.current = null; return; }
    if (revealedIdRef.current === selected.id) return;
    const visibleIndex = rows.findIndex((row) => row.entry.id === selected.id);
    if (visibleIndex >= 0) {
      revealedIdRef.current = selected.id;
      cancelAnimationFrame(revealFrameRef.current);
      revealFrameRef.current = requestAnimationFrame(() => virtualizer.scrollToIndex(visibleIndex, { align: 'auto' }));
      return;
    }
    const groupKey = `api:${entryGroupPath(selected)}`;
    const group = rows.find((row) => row.groupKey === groupKey && !row.groupChild);
    // Expanding re-runs this effect, which then scrolls. Anything else (e.g. the
    // row is filtered out) cannot be revealed, so stop trying for this selection.
    if (group && !expandedGroups.has(groupKey)) toggleGroup(groupKey);
    else revealedIdRef.current = selected.id;
  }, [expandedGroups, rows, selected, toggleGroup, virtualizer]);

  // Under the default LATEST sort, new requests insert at the TOP. When the
  // user has scrolled down to read something, don't shift rows under them —
  // count arrivals into a jump pill instead.
  const followsTop = sortField === 'timestamp' && sortOrder === 'desc';
  const awayFromTopRef = useRef(false);
  const [newCount, setNewCount] = useState(0);
  const lastTotalRef = useRef(0);

  useEffect(() => {
    const total = summary.total;
    const delta = total - lastTotalRef.current;
    lastTotalRef.current = total;
    if (delta > 0 && followsTop && awayFromTopRef.current) {
      setNewCount((count) => count + delta);
    }
  }, [summary.total, followsTop]);

  const handleListScroll = useCallback(() => {
    const el = parentRef.current;
    if (!el) return;
    const away = el.scrollTop > 120;
    awayFromTopRef.current = away;
    if (!away) setNewCount(0);
  }, []);

  const jumpToTop = useCallback(() => {
    setNewCount(0);
    awayFromTopRef.current = false;
    const el = parentRef.current;
    if (el) el.scrollTop = 0;
  }, []);

  // Below 600px the detail replaces the list. Opening from the list moves focus
  // into the detail (the list is no longer rendered), and closing it — Back, the
  // header close, Escape or anything else — puts focus back on the list with the
  // selection scrolled into view whenever focus was in the detail or got lost.
  const backRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLElement | null>(null);
  const openedFromListRef = useRef(false);
  const restoreListFocusRef = useRef(false);
  const detailShown = Boolean(selected && apiDetailOpen);
  const shownIdRef = useRef<string | null>(null);
  const shownId = detailShown && selected ? selected.id : null;
  useLayoutEffect(() => { shownIdRef.current = shownId; }, [shownId]);

  // Only a click/Enter that actually opens (or changes) the detail may move focus
  // later; re-activating the row already shown changes nothing, so it arms nothing.
  const armOpenFromList = useCallback((id: string) => {
    openedFromListRef.current = shownIdRef.current !== id;
  }, []);

  const handleSelect = useCallback((entry: XrayEntry) => {
    armOpenFromList(entry.id);
    selectEntry(entry.id);
    setApiDetailOpen(true);
  }, [armOpenFromList, selectEntry, setApiDetailOpen]);

  const closeDetail = useCallback(() => {
    restoreListFocusRef.current = true;
    setApiDetailOpen(false);
  }, [setApiDetailOpen]);

  useEffect(() => {
    if (!detailShown) return;
    const fromList = openedFromListRef.current;
    openedFromListRef.current = false;
    focusBackIfListHidden(parentRef.current, '.xray-api-collection-pane', backRef.current, fromList);
  }, [detailShown, selected?.id]);

  const wasShownRef = useRef(detailShown);
  useEffect(() => {
    const wasShown = wasShownRef.current;
    wasShownRef.current = detailShown;
    if (detailShown || !wasShown) return;
    const requested = restoreListFocusRef.current;
    restoreListFocusRef.current = false;
    const list = parentRef.current;
    if (!list) return;
    const root = list.getRootNode() as Document | ShadowRoot;
    const active = root.activeElement;
    const pageActive = list.ownerDocument.activeElement;
    // Lost focus: the focused control was unmounted with the detail (Escape, an
    // evicted entry …), leaving <body> — or nothing inside a shadow root.
    const lost = active
      ? active === list.ownerDocument.body || Boolean(drawerRef.current?.contains(active))
      : !pageActive || pageActive === list.ownerDocument.body;
    if (!requested && !lost) return;
    list.focus({ preventScroll: true });
    const index = rows.findIndex((row) => row.entry.id === selectedId);
    if (index >= 0) virtualizer.scrollToIndex(index, { align: 'auto' });
  }, [detailShown, rows, selectedId, virtualizer]);

  const handleToggleGroup = useCallback((groupKey?: string) => {
    if (groupKey) toggleGroup(groupKey);
  }, [toggleGroup]);

  const handleTogglePinned = useCallback((id: string) => togglePinned(id), [togglePinned]);

  // Draggable list/detail split. apiSplit (0 = auto) drives the grid's first
  // column via a CSS var; the hook keeps the divider's max and the applied
  // width clamped to the CURRENT container width so an outer resize can never
  // starve the detail pane. Container queries still override the whole grid
  // when the panel stacks.
  const split = usePaneSplit({ stored: apiSplit, varName: '--xray-api-split', minList: 260, minRest: 340 });
  // 600-900px stacks the list over the detail. The list share is session-local
  // (percent of the body height) and never drops below 40%.
  const [listShare, setListShare] = useState(50);
  const [liveShare, setLiveShare] = useState<number | null>(null);
  const share = liveShare ?? listShare;
  const bodyStyle = { ...split.splitStyle, '--xray-api-vlist': `${share}fr`, '--xray-api-vrest': `${100 - share}fr` } as React.CSSProperties;
  const percentPerPx = useCallback(() => 100 / Math.max(1, split.containerRef.current?.getBoundingClientRect().height || 1), [split.containerRef]);

  // Arrow-key navigation through the (possibly grouped) request rows, like the
  // DevTools network panel. Navigation only moves the selection — Enter opens
  // the drawer, and a drawer the user closed stays closed while arrowing.
  // One screen's worth of rows for PageUp/PageDown. A fixed step keeps the jump
  // predictable regardless of row density.
  const PAGE_STEP = 10;

  function handleListKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
    if (event.target instanceof HTMLElement && event.target !== event.currentTarget && event.target.closest('button, input, textarea, select, a, [role="button"]')) return;
    const navKeys = ['ArrowDown', 'ArrowUp', 'Home', 'End', 'PageDown', 'PageUp'];
    const isNav = navKeys.includes(event.key);
    // Space previously fell through to the native scroller, which scrolled the
    // viewport while the selection stayed put — the selected row would silently
    // scroll out of view. It now activates the selected row, matching Enter.
    if (!isNav && event.key !== 'Enter' && event.key !== ' ') return;
    if (!rows.length) return;
    const currentIndex = rows.findIndex((row) => row.entry.id === selectedId);

    if (event.key === 'Enter' || event.key === ' ') {
      if (currentIndex >= 0) { armOpenFromList(rows[currentIndex].entry.id); setApiDetailOpen(true); event.preventDefault(); }
      return;
    }

    event.preventDefault();
    const last = rows.length - 1;
    let nextIndex: number;
    if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = last;
    else {
      const delta =
        event.key === 'ArrowDown' ? 1
          : event.key === 'ArrowUp' ? -1
            : event.key === 'PageDown' ? PAGE_STEP
              : -PAGE_STEP;
      nextIndex = currentIndex < 0
        ? (delta > 0 ? 0 : last)
        : Math.min(last, Math.max(0, currentIndex + delta));
    }
    const next = rows[nextIndex];
    if (!next) return;
    selectEntry(next.entry.id, { openDetail: false });
    virtualizer.scrollToIndex(nextIndex, { align: 'auto' });
  }

  return (
    <section className={`xray-api-workspace ${detailShown ? 'detail-open' : ''}`}>
      <div className="xray-api-body" style={bodyStyle} ref={split.containerRef}>
        <div className="xray-api-collection-pane" ref={split.paneRef}>
          <PaneDivider
            label="Resize request list"
            value={split.value}
            min={split.min}
            max={split.max}
            onLiveChange={split.setLive}
            onCommit={(next) => { split.setLive(null); updateSettings({ apiSplit: next }); }}
            onReset={() => { split.setLive(null); updateSettings({ apiSplit: 0 }); }}
          />
          {detailShown && (
            <PaneDivider
              orientation="horizontal"
              label="Resize request list height"
              value={share}
              min={40}
              max={75}
              step={5}
              valueText={(value) => `List height ${value}%`}
              unitsPerPx={percentPerPx}
              onLiveChange={setLiveShare}
              onCommit={(next) => { setLiveShare(null); setListShare(next); }}
              onReset={() => { setLiveShare(null); setListShare(50); }}
            />
          )}
          <ApiSummaryLine summary={summary} matchingCount={matchingApiCount} />
          <ApiInspectorToolbar summary={summary} index={index} />
          <div className="xray-api-main">
            <ApiTableHeader />
            <div className="xray-api-table-scroll" ref={parentRef} tabIndex={0} role="listbox" aria-label="Captured requests" aria-activedescendant={activeApiId ? `xray-api-option-${activeApiId}` : undefined} onKeyDown={handleListKeyDown} onScroll={handleListScroll}>
              <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
                {virtualizer.getVirtualItems().map((item) => {
                  const row = rows[item.index];
                  const entry = row.entry;
                  return (
                    <div key={item.key} data-index={item.index} ref={virtualizer.measureElement} style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${item.start}px)` }}>
                      <ApiRequestRow
                        row={row}
                         entries={entries}
                         index={index}
                        maxDuration={maxDuration}
                        selected={selectedId === entry.id}
                        pinned={pinnedIds.has(entry.id)}
                        slowThresholdMs={slowThresholdMs}
                        showHostInPath={showHostInPath}
                        onSelect={handleSelect}
                        onToggleGroup={handleToggleGroup}
                        onTogglePinned={handleTogglePinned}
                      />
                    </div>
                  );
                })}
              </div>
              {!rows.length && (firstRunDismissed || hasApiEntries
                ? <EmptyState
                    label={hasApiEntries ? 'No matching API requests' : 'No API requests yet'}
                    hint={hasApiEntries ? 'Try a different query or clear the active filters.' : 'Browse the page or trigger a call. Fetch, XHR, GraphQL and WebSocket traffic streams in here live. Press Ctrl/Cmd+K to jump anywhere.'}
                    action={hasApiEntries ? <button className="xray-btn" onClick={() => { usePanelStore.getState().setApiSearchQuery(''); usePanelStore.getState().clearApiFilters(); }}>Clear search</button> : undefined}
                  />
                : <FirstRun />)}
            </div>
            {newCount > 0 && (
              <button className="xray-newmsg-pill xray-newreq-pill" onClick={jumpToTop}>
                <IconArrowUp size={14} stroke={2} />{newCount} new
              </button>
            )}
          </div>
        </div>
        <RequestContextPane entry={selected} />
        <ApiDetailDrawer entry={detailShown ? selected : null} onClose={closeDetail} backRef={backRef} drawerRef={drawerRef} />
      </div>
    </section>
  );
}

function LogsWorkspace(): React.ReactElement {
  const entries = usePanelStore((state) => state.entries);
  const selectedId = usePanelStore((state) => state.selectedId);
  const logDetailOpen = usePanelStore((state) => state.logDetailOpen);
  const selectEntry = usePanelStore((state) => state.selectEntry);
  const setLogDetailOpen = usePanelStore((state) => state.setLogDetailOpen);
  const togglePinned = usePanelStore((state) => state.togglePinned);
  const pinnedIds = usePanelStore((state) => state.pinnedIds);
  const logsSplit = usePanelStore((state) => state.settings.logsSplit);
  const updateSettings = usePanelStore((state) => state.updateSettings);
  const logsSplitState = usePaneSplit({ stored: logsSplit, varName: '--xray-logs-split', minList: 240, minRest: 300 });
  const { rows: listRows } = useEntryListModel('logs');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const rows = useMemo(
    () => (levelFilter === 'all' ? listRows : listRows.filter((row) => matchesLevel({ type: 'log', level: row.entry.logLevel }, levelFilter))),
    [levelFilter, listRows],
  );
  const levelCounts = useMemo(() => {
    const counts: Record<LevelFilter, number> = { all: 0, log: 0, warn: 0, error: 0, result: 0 };
    for (const entry of entries) {
      if (entry.type !== 'log') continue;
      counts.all += 1;
      counts[levelBucket({ type: 'log', level: entry.logLevel })] += 1;
    }
    return counts;
  }, [entries]);
  const hasLogEntries = levelCounts.all > 0;
  const selected = selectedId ? entries.find((entry) => entry.id === selectedId && entry.type === 'log') || null : null;
  const setApiSearchQuery = usePanelStore((state) => state.setApiSearchQuery);
  const clearApiFilters = usePanelStore((state) => state.clearApiFilters);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32,
    getItemKey: (index) => rows[index]?.key || index,
    measureElement: (element) => element.getBoundingClientRect().height,
    overscan: 10,
  });
  const selectedLogId = selected?.type === 'log' ? selected.id : null;
  const PAGE_STEP = 10;

  const revealedLogIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!selectedLogId) { revealedLogIdRef.current = null; return; }
    if (revealedLogIdRef.current === selectedLogId) return;
    const index = rows.findIndex((row) => row.entry.id === selectedLogId);
    if (index >= 0) {
      revealedLogIdRef.current = selectedLogId;
      virtualizer.scrollToIndex(index, { align: 'auto' });
    }
  }, [rows, selectedLogId, virtualizer]);

  // The detail shows once a log is opened (click, Enter/Space, search, palette);
  // arrowing only moves the selection. Below 600px it replaces the list: opening
  // from the list moves focus to the way back, and closing it (Back, the header
  // close, Escape) returns focus to the list with the selection in view.
  const detailShown = Boolean(selected && logDetailOpen);
  const backRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLElement | null>(null);
  const openedFromListRef = useRef(false);
  const restoreListFocusRef = useRef(false);
  const shownIdRef = useRef<string | null>(null);
  const shownId = detailShown && selected ? selected.id : null;
  useLayoutEffect(() => { shownIdRef.current = shownId; }, [shownId]);

  const armOpenFromList = useCallback((id: string) => {
    openedFromListRef.current = shownIdRef.current !== id;
  }, []);

  const closeDetail = useCallback(() => {
    restoreListFocusRef.current = true;
    setLogDetailOpen(false);
  }, [setLogDetailOpen]);

  useEffect(() => {
    if (!detailShown) return;
    const fromList = openedFromListRef.current;
    openedFromListRef.current = false;
    focusBackIfListHidden(parentRef.current, '.xray-list-panel', backRef.current, fromList);
  }, [detailShown, selected?.id]);

  // logDetailOpen is not persisted, but it outlives its log: Clear, eviction or a
  // selection on another tab would otherwise leave it true, and the next arrow
  // selection would open (and, below 600px, swap in) the detail unasked.
  useEffect(() => {
    if (logDetailOpen && !selected) setLogDetailOpen(false);
  }, [logDetailOpen, selected, setLogDetailOpen]);

  const wasShownRef = useRef(detailShown);
  useEffect(() => {
    const wasShown = wasShownRef.current;
    wasShownRef.current = detailShown;
    if (detailShown || !wasShown) return;
    const requested = restoreListFocusRef.current;
    restoreListFocusRef.current = false;
    const list = parentRef.current;
    if (!list) return;
    const root = list.getRootNode() as Document | ShadowRoot;
    const active = root.activeElement;
    const pageActive = list.ownerDocument.activeElement;
    // Lost focus: the focused control was unmounted with the detail (Escape …).
    const lost = active
      ? active === list.ownerDocument.body || Boolean(drawerRef.current?.contains(active))
      : !pageActive || pageActive === list.ownerDocument.body;
    if (!requested && !lost) return;
    list.focus({ preventScroll: true });
    const index = rows.findIndex((row) => row.entry.id === selectedId);
    if (index >= 0) virtualizer.scrollToIndex(index, { align: 'auto' });
  }, [detailShown, rows, selectedId, virtualizer]);

  // A filter that hides the open log would leave a detail for a row nobody can see:
  // clear the selection (and with it the detail) instead.
  const handleLevelFilter = (next: LevelFilter): void => {
    setLevelFilter(next);
    if (selected && !matchesLevel({ type: 'log', level: selected.logLevel }, next)) {
      selectEntry(null);
      setLogDetailOpen(false);
    }
  };

  const handleSelect = useCallback((id: string) => {
    armOpenFromList(id);
    selectEntry(id);
  }, [armOpenFromList, selectEntry]);

  // 600-900px stacks the list over the detail; the list share is session-local.
  const [listShare, setListShare] = useState(50);
  const [liveShare, setLiveShare] = useState<number | null>(null);
  const share = liveShare ?? listShare;
  const bodyStyle = { ...logsSplitState.splitStyle, '--xray-logs-vlist': `${share}fr`, '--xray-logs-vrest': `${100 - share}fr` } as React.CSSProperties;
  const percentPerPx = useCallback(() => 100 / Math.max(1, logsSplitState.containerRef.current?.getBoundingClientRect().height || 1), [logsSplitState.containerRef]);

  function handleListKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
    if (event.target instanceof HTMLElement && event.target !== event.currentTarget && event.target.closest('button, input, textarea, select, a, [role="button"]')) return;
    const navigationKeys = ['ArrowDown', 'ArrowUp', 'Home', 'End', 'PageDown', 'PageUp'];
    if (!navigationKeys.includes(event.key) && event.key !== 'Enter' && event.key !== ' ') return;
    if (!rows.length) return;
    const currentIndex = rows.findIndex((row) => row.entry.id === selectedLogId);
    if (event.key === 'Enter' || event.key === ' ') {
      // A focused row (e.g. reached by pointer or AT) wins; otherwise the active log,
      // falling back to the first row when the selection belongs to another tab.
      const option = event.target instanceof HTMLElement ? event.target.closest('[role="option"]') : null;
      const optionIndex = option ? rows.findIndex((row) => `xray-log-option-${row.entry.id}` === option.id) : -1;
      const index = optionIndex >= 0 ? optionIndex : currentIndex >= 0 ? currentIndex : 0;
      armOpenFromList(rows[index].entry.id);
      selectEntry(rows[index].entry.id);
      event.preventDefault();
      return;
    }
    event.preventDefault();
    const last = rows.length - 1;
    const delta = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : event.key === 'PageDown' ? PAGE_STEP : event.key === 'PageUp' ? -PAGE_STEP : 0;
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? last : Math.min(last, Math.max(0, currentIndex < 0 ? (delta >= 0 ? 0 : last) : currentIndex + delta));
    const next = rows[nextIndex];
    if (!next) return;
    selectEntry(next.entry.id, { openDetail: false });
    virtualizer.scrollToIndex(nextIndex, { align: 'auto' });
  }

  return (
    <section className={`xray-split xray-logs-workspace ${detailShown ? 'detail-open' : ''}`} style={bodyStyle} ref={logsSplitState.containerRef}>
      <div className="xray-list-panel" ref={logsSplitState.paneRef}>
        <PaneDivider
          label="Resize log list"
          value={logsSplitState.value}
          min={logsSplitState.min}
          max={logsSplitState.max}
          onLiveChange={logsSplitState.setLive}
          onCommit={(next) => { logsSplitState.setLive(null); updateSettings({ logsSplit: next }); }}
          onReset={() => { logsSplitState.setLive(null); updateSettings({ logsSplit: 0 }); }}
        />
        {detailShown && (
          <PaneDivider
            orientation="horizontal"
            label="Resize log list height"
            value={share}
            min={40}
            max={75}
            step={5}
            valueText={(value) => `List height ${value}%`}
            unitsPerPx={percentPerPx}
            onLiveChange={setLiveShare}
            onCommit={(next) => { setLiveShare(null); setListShare(next); }}
            onReset={() => { setLiveShare(null); setListShare(50); }}
          />
        )}
        <LogsToolbar levelFilter={levelFilter} onLevelFilter={handleLevelFilter} counts={levelCounts} />
        <div
          className="xray-virtual-list xray-logs-list"
          ref={parentRef}
          tabIndex={0}
          role="listbox"
          aria-label="Captured logs"
          aria-activedescendant={selectedLogId ? `xray-log-option-${selectedLogId}` : undefined}
          onKeyDown={handleListKeyDown}
        >
          <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
            {virtualizer.getVirtualItems().map((item) => {
              const row = rows[item.index];
              return (
                <div key={item.key} data-index={item.index} ref={virtualizer.measureElement} style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${item.start}px)` }}>
                  <LogRow row={row} selected={selectedLogId === row.entry.id} pinned={pinnedIds.has(row.entry.id)} onSelect={() => handleSelect(row.entry.id)} onTogglePinned={() => togglePinned(row.entry.id)} />
                </div>
              );
            })}
          </div>
          {!rows.length && <EmptyState
            label={hasLogEntries ? 'No matching logs' : 'No logs captured'}
            hint={hasLogEntries ? 'Try a different query or clear the active filters.' : 'Page console.log output and captured objects land here - trigger some activity on the page to populate the list.'}
            action={hasLogEntries ? <button className="xray-btn" onClick={() => { setApiSearchQuery(''); clearApiFilters(); setLevelFilter('all'); }}>Clear search</button> : undefined}
          />}
        </div>
      </div>
      <aside ref={drawerRef} className="xray-detail-panel xray-logs-detail" aria-label="Selected log detail">
        {/* Below 600px the detail replaces the list; this is the way back (CSS shows it only there). */}
        {selected && detailShown && <div className="xray-logs-detail-back">
          <button ref={backRef} type="button" className="xray-btn xray-api-back-btn" aria-label="Back to logs" onClick={closeDetail}><IconArrowLeft {...iconProps} />Logs</button>
        </div>}
        <div className="xray-logs-detail-body">{selected && detailShown ? <LogDetail entry={selected} onClose={closeDetail} /> : null}</div>
      </aside>
    </section>
  );
}

// S16: one summary line instead of summary cards. The request count is the live
// status; the error and slow counts are shortcuts for the Errors/Slow filters.
function ApiSummaryLine({ summary, matchingCount }: { summary: ApiListSummary; matchingCount: number }): React.ReactElement {
  const apiQuickFilter = usePanelStore((state) => state.apiQuickFilter);
  const setApiQuickFilter = usePanelStore((state) => state.setApiQuickFilter);
  const plural = (count: number, word: string): string => `${count} ${word}${count === 1 ? '' : 's'}`;
  const countText = matchingCount === summary.total ? plural(summary.total, 'request') : `${matchingCount} of ${plural(summary.total, 'request')}`;
  const shortcut = (id: 'errors' | 'slow', count: number, text: string): React.ReactElement => (count > 0
    ? <button type="button" className={`xray-api-summary-link ${id} ${apiQuickFilter === id ? 'active' : ''}`} aria-label={`Show ${text}`} aria-pressed={apiQuickFilter === id} title={apiQuickFilter === id ? 'Show all requests' : `Show only ${id === 'errors' ? 'errors' : 'slow requests'}`} onClick={() => setApiQuickFilter(toggledQuickFilter(apiQuickFilter, id))}>{text}</button>
    : <span className="xray-api-summary-muted">{text}</span>);

  return (
    <div className="xray-api-summary-line" role="group" aria-label="Captured request summary">
      <span className="xray-api-request-count" role="status">{countText}</span>
      <span className="xray-api-summary-sep" aria-hidden="true"> · </span>
      {shortcut('errors', summary.errors, plural(summary.errors, 'error'))}
      <span className="xray-api-summary-sep" aria-hidden="true"> · </span>
      {shortcut('slow', summary.slow, `${summary.slow} slow`)}
      <span className="xray-api-summary-sep" aria-hidden="true"> · </span>
      <span className="xray-api-summary-stat">avg {Math.round(summary.avgDuration)}ms</span>
      <span className="xray-api-summary-sep" aria-hidden="true"> · </span>
      <span className="xray-api-summary-stat">{formatBytes(summary.totalBytes)}</span>
    </div>
  );
}

function ApiInspectorToolbar({ summary, index }: { summary: ApiListSummary; index: SessionIndex }): React.ReactElement {
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const query = usePanelStore((state) => state.apiSearchQuery);
  const setQuery = usePanelStore((state) => state.setApiSearchQuery);
  const apiQuickFilter = usePanelStore((state) => state.apiQuickFilter);
  const setApiQuickFilter = usePanelStore((state) => state.setApiQuickFilter);
  const apiGroupingMode = usePanelStore((state) => state.apiGroupingMode);
  const setApiGroupingMode = usePanelStore((state) => state.setApiGroupingMode);
  const statusFilters = usePanelStore((state) => state.statusFilters);
  const typeFilters = usePanelStore((state) => state.typeFilters);
  const methodFilters = usePanelStore((state) => state.methodFilters);
  const toggleMethod = usePanelStore((state) => state.toggleMethodFilter);
  const toggleStatus = usePanelStore((state) => state.toggleStatusFilter);
  const toggleType = usePanelStore((state) => state.toggleTypeFilter);
  const clearApiFilters = usePanelStore((state) => state.clearApiFilters);
  const setSort = usePanelStore((state) => state.setSort);
  const sortField = usePanelStore((state) => state.sortField);
  const sortOrder = usePanelStore((state) => state.sortOrder);
  const entries = usePanelStore((state) => state.entries);
  // Existing contract: entries.reduce((count, entry) => count + (isApi(entry) && matchesApiQuickFilter(entry, 'drift', entries) ? 1 : 0), 0)
  const driftCount = useMemo(() => entries.reduce((count, entry) => count + (isApi(entry) && matchesApiQuickFilter(entry, 'drift', entries, new Set(), 500, index) ? 1 : 0), 0), [entries, index]);

  // Clicking an active quick filter deselects it — previously the only way out
  // was "All"/Reset, which also destroyed sort, grouping, and the search text.
  const pickQuickFilter = (id: ApiQuickFilter): void => setApiQuickFilter(toggledQuickFilter(apiQuickFilter, id));
  const chipCount = (id: ApiQuickFilter): number | null => {
    if (id === 'errors') return summary.errors;
    if (id === 'slow') return summary.slow;
    if (id === 'pinned') return summary.pinned;
    if (id === 'repeated') return summary.repeatedEndpoints;
    if (id === 'drift') return driftCount;
    return null;
  };
  const renderQuickChip = (filter: { id: ApiQuickFilter; label: string }): React.ReactElement => {
    const count = chipCount(filter.id);
    return (
      <button key={filter.id} className={`xray-chip ${apiQuickFilter === filter.id ? 'active' : ''}`} onClick={() => pickQuickFilter(filter.id)} aria-label={filter.label} aria-pressed={apiQuickFilter === filter.id} title={count == null ? undefined : `${count} session ${filter.id === 'repeated' ? 'repeated endpoints' : `${filter.label.toLowerCase()} requests`}`}>
        {filter.label}
        {count != null && count > 0 && <span className="xray-chip-count">{count}</span>}
      </button>
    );
  };

  const activeFilters: Array<{ key: string; label: string; name: string; remove(): void }> = [];
  if (query.trim()) activeFilters.push({ key: 'query', label: `Search: ${query}`, name: 'search', remove: () => setQuery('') });
  if (apiQuickFilter !== 'all') {
    const label = [...quickFilters, ...secondaryQuickFilters].find((filter) => filter.id === apiQuickFilter)?.label || apiQuickFilter;
    activeFilters.push({ key: 'quick', label, name: label, remove: () => setApiQuickFilter('all') });
  }
  methodFilters.forEach((method) => activeFilters.push({ key: `method:${method}`, label: method, name: method, remove: () => toggleMethod(method) }));
  typeFilters.forEach((type) => {
    const label = type === 'xhr' ? 'XHR' : type === 'fetch' ? 'Fetch' : type.toUpperCase();
    activeFilters.push({ key: `source:${type}`, label, name: label, remove: () => toggleType(type) });
  });
  statusFilters.forEach((status) => activeFilters.push({ key: `status:${status}`, label: status, name: status, remove: () => toggleStatus(status) }));
  const clearFilters = (): void => { setQuery(''); clearApiFilters(); };
  const allPredicates = apiQuickFilter === 'all' && !methodFilters.size && !typeFilters.size && !statusFilters.size;

  // S17: one toolbar row — search, quick chips, the active (removable) filters,
  // Clear filters and the Filters & Sort icon toggle. The secondary filters open
  // below as a full-width panel; active ones stay visible when it is collapsed.
  const advancedCount = methodFilters.size + typeFilters.size + statusFilters.size + (secondaryQuickFilters.some((filter) => filter.id === apiQuickFilter) ? 1 : 0);
  return (
    <div className="xray-api-toolbar">
      <label className="xray-search xray-api-search">
        <IconSearch {...iconProps} />
        <input className="xray-input" aria-label="Search API requests" value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Filter method, status, path, domain, source, content type..." />
      </label>
      <div className="xray-api-filter-row">
        <div className="xray-filter-chips xray-api-primary-filters" role="group" aria-label="Primary API filters">
          <button className={`xray-chip ${allPredicates ? 'active' : ''}`} onClick={clearApiFilters} aria-pressed={allPredicates}>
            All
          </button>
          {quickFilters.map(renderQuickChip)}
        </div>
        {activeFilters.length > 0 && <div className="xray-filter-chips xray-api-active-filters" role="group" aria-label="Active API filters">
          {activeFilters.map((filter) => <button key={filter.key} className="xray-chip active xray-api-filter-remove" aria-label={`Remove ${filter.name} filter`} onClick={filter.remove} title={filter.label}><span className="xray-api-filter-label">{filter.label}</span><IconX size={13} stroke={2} /></button>)}
        </div>}
        <button className="xray-icon-btn xray-api-clear-filters" onClick={clearFilters} disabled={!activeFilters.length} title="Clear filters"><IconFilterOff {...iconProps} /><span className="xray-visually-hidden">Clear filters</span></button>
        <section className="xray-api-filters-collapsible">
          <button type="button" className={`xray-icon-btn xray-api-filters-toggle ${filtersExpanded ? 'active' : ''}`} aria-expanded={filtersExpanded} aria-controls="xray-api-secondary-filters" title={advancedCount ? `Filters & sort (${advancedCount} active)` : 'Filters & sort'} onClick={() => setFiltersExpanded((expanded) => !expanded)}>
            <IconAdjustmentsHorizontal {...iconProps} />
            <span className="xray-visually-hidden">Filters &amp; Sort</span>
          </button>
        </section>
      </div>
      {filtersExpanded && <div id="xray-api-secondary-filters" className="xray-api-secondary-panel">
        <div className="xray-api-secondary-controls">
          <div className="xray-filter-chips compact" role="group" aria-label="Method, status and source filters">
            <span className="xray-filter-label"><IconFilter {...iconProps} />Match</span>
            {['GET', 'POST'].map((method) => <button key={method} className={`xray-chip ${methodFilters.has(method) ? 'active' : ''}`} onClick={() => toggleMethod(method)} aria-pressed={methodFilters.has(method)}>{method}</button>)}
            {['xhr', 'fetch'].map((type) => <button key={type} className={`xray-chip ${typeFilters.has(type) ? 'active' : ''}`} onClick={() => toggleType(type)} aria-pressed={typeFilters.has(type)}>{type === 'xhr' ? 'XHR' : 'Fetch'}</button>)}
            {['2xx', '3xx', '4xx', '5xx'].map((status) => <button key={status} className={`xray-chip ${statusFilters.has(status) ? 'active' : ''}`} onClick={() => toggleStatus(status)} aria-pressed={statusFilters.has(status)}>{status}</button>)}
            {secondaryQuickFilters.map(renderQuickChip)}
          </div>
          <div className="xray-filter-chips compact" role="group" aria-label="API sort and grouping">
            <span className="xray-filter-label">Sort</span>
            {sortOptions.map((field) => (
              <button key={field.id} className={`xray-chip ${sortField === field.id ? 'active' : ''}`} onClick={() => setSort(field.id)} aria-pressed={sortField === field.id}>
                {field.label}
                {sortField === field.id && (sortOrder === 'asc' ? <IconArrowUp size={13} stroke={2.2} /> : <IconArrowDown size={13} stroke={2.2} />)}
              </button>
            ))}
            {(['flat', 'endpoint'] as ApiGroupingMode[]).map((grouping) => (
              <button key={grouping} className={`xray-chip ${apiGroupingMode === grouping ? 'active' : ''}`} onClick={() => setApiGroupingMode(grouping)} aria-pressed={apiGroupingMode === grouping}>
                {grouping === 'flat' ? 'Flat' : 'Endpoint Groups'}
              </button>
            ))}
          </div>
        </div>
      </div>}
    </div>
  );
}

function ApiTableHeader(): React.ReactElement {
  return (
    <div className="xray-api-table-head" role="row">
      <span>Method</span>
      <span>Request</span>
      <span>Status</span>
      <span>Timing</span>
      <span className="xray-api-table-tools"><DensityToggle /></span>
    </div>
  );
}

// Quick per-list switch between the two-line (expanded) and single-line
// (compact) row modes — the same `compactRows` setting the Settings panel
// exposes, surfaced where the list actually is.
function DensityToggle(): React.ReactElement {
  const compactRows = usePanelStore((state) => state.settings.compactRows);
  const updateSettings = usePanelStore((state) => state.updateSettings);
  return (
    <button
      className="xray-icon-btn xray-density-toggle"
      aria-label="Compact rows"
      aria-pressed={compactRows}
      title={compactRows ? 'Switch to comfortable rows' : 'Switch to compact rows'}
      onClick={() => updateSettings({ compactRows: !compactRows })}
    >
      {compactRows ? <IconLayoutRows {...iconProps} /> : <IconLayoutList {...iconProps} />}
    </button>
  );
}

const ApiRequestRow = React.memo(function ApiRequestRow({
  row,
  entries,
  index,
  maxDuration,
  selected,
  pinned,
  slowThresholdMs,
  showHostInPath,
  onSelect,
  onToggleGroup,
  onTogglePinned,
}: {
  row: EntryListItem;
  entries: XrayEntry[];
  index: SessionIndex;
  maxDuration: number;
  selected: boolean;
  pinned: boolean;
  slowThresholdMs: number;
  showHostInPath: boolean;
  onSelect(entry: XrayEntry): void;
  onToggleGroup(groupKey?: string): void;
  onTogglePinned(id: string): void;
}): React.ReactElement {
  const entry = row.entry;
  const showToast = usePanelStore((state) => state.showToast);
  const status = Number(entry.status) || 0;
  const path = entryPath(entry);
  // GraphQL rows show `query GetUser` instead of an undifferentiated POST /graphql.
  const label = entryGroupLabel(entry);
  const domain = getEntryDomain(entry) || 'local';
  const type = String(entry.source || 'fetch').toLowerCase();
  const sourceLabel = type === 'xhr' ? 'XHR' : type === 'fetch' ? 'fetch' : type;
  // Existing row contract: entryGroupStats(entry, entries)
  const stats = row.groupStats || entryGroupStats(entry, entries, index);
  const displayBytes = row.groupStats?.totalBytes ?? entry.size;
  const flags = row.flags;
  const pct = Math.max(8, Math.min(100, duration(entry) / maxDuration * 100));
  const isGroup = Boolean(row.groupCount && row.groupCount > 1 && !row.groupChild);
  const contentType = getEntryContentType(entry) || 'response';

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(entry);
    }
  }

  async function copyPath(event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
    event.stopPropagation();
    try {
      await copyText(String(entry.url || path));
      showToast('Request URL copied.');
    } catch {
      showToast('Could not copy request URL.');
    }
  }

  return (
      <div
        id={`xray-api-option-${entry.id}`}
        className={`xray-api-row ${selected ? 'selected' : ''} ${row.groupChild ? 'child' : ''} ${pinned ? 'pinned' : ''} ${isGroup ? 'group' : ''} ${status >= 400 ? 'has-error' : ''} ${duration(entry) >= slowThresholdMs ? 'has-slow' : ''}`}
      role="option"
      aria-selected={selected}
      tabIndex={-1}
      onClick={() => onSelect(entry)}
      onKeyDown={handleKeyDown}
    >
      <span className={`xray-method ${methodClass(entry.method)}`}>{String(entry.method || 'GET').toUpperCase().replace('DELETE', 'DEL')}</span>
      {/* S18: one line — the path keeps priority; flags, then the dimmed meta give way first. */}
      <span className="xray-api-path-cell">
        <span className="xray-path" title={String(entry.url || path)}>{label}</span>
        <ApiFlagPills flags={flags} />
        <span className="xray-entry-meta">
          {isGroup ? `${stats.count} calls · ${stats.errors} errors · avg ${Math.round(stats.avgDuration)}ms` : `${showHostInPath ? domain : contentType} · ${sourceLabel} · ${formatBytes(displayBytes)} · ${formatTime(entry.timestamp)}`}
        </span>
      </span>
      <span className={`xray-status ${statusClass(status)}`}>{entry.status || '---'}</span>
      <span className="xray-entry-duration">
        <span className="xray-bar-track"><span className={`xray-bar ${duration(entry) >= slowThresholdMs ? 'slow' : ''} ${status >= 400 ? 'error' : ''}`} style={{ width: `${pct}%` }} /></span>
        <span>{Math.round(duration(entry))}ms</span>
      </span>
      <span className="xray-api-row-actions">
        {row.groupCount && row.groupCount > 1 && (
        <button className="xray-icon-btn" aria-label={row.groupExpanded ? 'Collapse endpoint group' : 'Expand endpoint group'} onClick={(event) => { event.stopPropagation(); onToggleGroup(row.groupKey); }}>
            {row.groupExpanded ? <IconChevronDown {...iconProps} /> : <IconChevronRight {...iconProps} />}
          </button>
        )}
        <button className="xray-icon-btn" aria-label="Copy request URL" onClick={(event) => void copyPath(event)}><IconCopy {...iconProps} /></button>
        <button className={`xray-icon-btn ${pinned ? 'active' : ''}`} aria-label={pinned ? 'Unpin request' : 'Pin request'} aria-pressed={pinned} onClick={(event) => { event.stopPropagation(); onTogglePinned(entry.id); }}>
          <IconPin {...iconProps} />
        </button>
      </span>
    </div>
  );
});

function ApiFlagPills({ flags }: { flags: ApiEntryFlag[] }): React.ReactElement {
  if (!flags.length) return <span className="xray-api-flags muted">None</span>;
  const visible = flags.slice(0, 3);
  return (
    <span className="xray-api-flags" title={flags.map((flag) => flagLabels[flag]).join(', ')}>
      {visible.map((flag) => <span key={flag} className={`xray-api-flag ${flag}`}>{flagLabels[flag]}</span>)}
      {flags.length > visible.length && <span className="xray-api-flag more">+{flags.length - visible.length}</span>}
    </span>
  );
}

const RequestContextPane = React.memo(function RequestContextPane({ entry }: { entry: XrayEntry | null }): React.ReactElement {
  // The tab deliberately survives selection changes: arrowing through rows
  // while comparing Params/Headers keeps the pane on the same facet.
  const [activeTab, setActiveTab] = React.useState<RequestContextTab>('request');

  // Memoized so a stable value identity reaches the memoized JsonView — a
  // fresh object per render forced a re-stringify + re-tokenize per commit.
  const query = useMemo(() => (entry ? requestQueryParams(entry) : {}), [entry]);
  const contextValue = useMemo(() => (entry ? requestContextValue(entry, activeTab, query) : null), [entry, activeTab, query]);

  if (!entry) {
    return (
      <aside className="xray-request-context-pane empty" aria-label="Selected request context">
        <EmptyState label="Select a request" hint="Pick a request from the list to inspect its response, headers, timing, and smart operations." />
      </aside>
    );
  }

  const status = Number(entry.status) || 0;
  const path = entryPath(entry);
  const domain = getEntryDomain(entry) || 'local';

  return (
    <aside className="xray-request-context-pane" aria-label="Selected request context">
      <div className="xray-request-context-head">
        <span className="xray-pane-kicker">Request Context</span>
        <div className="xray-request-line">
          <span className={`xray-method ${methodClass(entry.method)}`}>{String(entry.method || 'GET').toUpperCase()}</span>
          <code title={String(entry.url || path)}>{path}</code>
        </div>
        <div className="xray-request-meta-grid">
          <span><strong>Host</strong>{domain}</span>
          <span><strong>Status</strong><b className={`xray-status ${statusClass(status)}`}>{entry.status || '---'}</b></span>
          <span><strong>Time</strong>{Math.round(duration(entry))}ms</span>
          <span><strong>Size</strong>{formatBytes(entry.size)}</span>
        </div>
      </div>
      <div className="xray-detail-tabs xray-request-tabs" role="group" aria-label="Request tabs">
        {requestContextTabs.map((tab) => (
          <button key={tab.id} className={`xray-detail-tab ${activeTab === tab.id ? 'active' : ''}`} aria-pressed={activeTab === tab.id} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>
      <div className="xray-request-context-content">
        <JsonView value={contextValue} />
      </div>
      <div className="xray-request-context-footer">
        <span>{String(entry.source || 'fetch').toUpperCase()}</span>
        <span>{getEntryContentType(entry) || 'unknown content'}</span>
      </div>
    </aside>
  );
});

function requestQueryParams(entry: XrayEntry): Record<string, string> {
  const url = String(entry.url || '');
  if (!url) return {};
  try {
    return Object.fromEntries(new URL(url).searchParams.entries());
  } catch {
    return {};
  }
}

function requestContextValue(entry: XrayEntry, tab: RequestContextTab, query: Record<string, string>): unknown {
  if (tab === 'params') return query;
  if (tab === 'headers') return entry.requestHeaders || {};
  if (tab === 'body') return entryRequest(entry);
  if (tab === 'timeline') {
    return {
      startedAt: formatTime(entry.timestamp),
      durationMs: Math.round(duration(entry)),
      status: entry.status || null,
      source: entry.source || 'fetch',
      size: Number(entry.size) || 0,
    };
  }

  return {
    method: String(entry.method || 'GET').toUpperCase(),
    url: entry.url || entry.urlPath || '',
    path: entryPath(entry),
    source: entry.source || 'fetch',
    status: entry.status || null,
    contentType: getEntryContentType(entry) || null,
  };
}

function ApiDetailDrawer({ entry, onClose, backRef, drawerRef }: { entry: XrayEntry | null; onClose(): void; backRef: React.RefObject<HTMLButtonElement | null>; drawerRef: React.RefObject<HTMLElement | null> }): React.ReactElement {
  return (
    <aside ref={drawerRef} className={`xray-api-detail-drawer ${entry ? '' : 'empty'}`} aria-label="Selected API request detail">
      {/* Below 600px the detail replaces the list; this is the way back (CSS shows it only there). */}
      {entry && <div className="xray-api-detail-back">
        <button ref={backRef} type="button" className="xray-btn xray-api-back-btn" aria-label="Back to requests" onClick={onClose}><IconArrowLeft {...iconProps} />Requests</button>
      </div>}
      <div className="xray-api-drawer-body">
        {/* J12: RequestDetail keeps a failing pane to itself; this catches anything above it. */}
        {entry ? (
          <ErrorBoundary resetKeys={[entry.id]} raw={() => entry}>
            <RequestDetail entry={entry} onClose={onClose} />
          </ErrorBoundary>
        ) : <EmptyState label="Nothing selected" hint="Choose a request to open the detail drawer - preview, schema, diff, replay, and more." />}
      </div>
    </aside>
  );
}

function LogRow({
  row,
  selected,
  pinned,
  onSelect,
  onTogglePinned,
}: {
  row: EntryListItem;
  selected: boolean;
  pinned: boolean;
  onSelect(): void;
  onTogglePinned(): void;
}): React.ReactElement {
  const entry = row.entry;
  const level = entry.logLevel || 'log';
  // Spec J7: typed values as `10n`, `NaN`, `undefined`, `ƒ name()`…; never internal markers.
  const text = useMemo(() => logEntryText(entry, 160), [entry]);

  // S22: fixed tracks — level, time, message (ellipsis), pin — so the time can never
  // run into the message.
  return (
    <div id={`xray-log-option-${entry.id}`} className={`xray-entry-row ${selected ? 'selected' : ''} ${pinned ? 'pinned' : ''}`} role="option" tabIndex={-1} aria-selected={selected} onClick={onSelect}>
      <span className={`xray-log-row-level ${level}`}>{level}</span>
      <span className="xray-log-row-time">{formatTime(entry.timestamp)}</span>
      <span className="xray-entry-main">
        <span className="xray-path" title={text}>{text}</span>
      </span>
      <button className={`xray-pin ${pinned ? 'active' : ''}`} aria-label={pinned ? 'Unpin log' : 'Pin log'} aria-pressed={pinned} onClick={(event) => { event.stopPropagation(); onTogglePinned(); }}>
        <IconPin {...iconProps} />
      </button>
    </div>
  );
}

// S23: the same level chips as Console, beside the search.
function LogsToolbar({ levelFilter, onLevelFilter, counts }: { levelFilter: LevelFilter; onLevelFilter(next: LevelFilter): void; counts: Record<LevelFilter, number> }): React.ReactElement {
  const query = usePanelStore((state) => state.apiSearchQuery);
  const setQuery = usePanelStore((state) => state.setApiSearchQuery);

  return (
    <div className="xray-logs-toolbar">
      <label className="xray-search xray-logs-search">
        <IconSearch {...iconProps} />
        <input className="xray-input" aria-label="Search logs" value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Search logs…" />
      </label>
      <div className="xray-filter-chips xray-logs-levels" role="group" aria-label="Log level filters">
        {logLevelFilters.map((filter) => (
          <button key={filter.id} className={`xray-chip ${levelFilter === filter.id ? 'active' : ''}`} aria-pressed={levelFilter === filter.id} onClick={() => onLevelFilter(filter.id)}>
            {filter.label}
            <span className="xray-chip-count">{counts[filter.id]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
