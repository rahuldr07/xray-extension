import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  IconArrowDown,
  IconArrowUp,
  IconChevronDown,
  IconChevronRight,
  IconClock,
  IconCopy,
  IconDatabase,
  IconFilter,
  IconFilterOff,
  IconPin,
  IconSearch,
  IconServer,
  IconWorld,
} from '@tabler/icons-react';
import { EmptyState } from '../common/EmptyState';
import { RequestDetail } from '../detail/RequestDetail';
import { LogDetail } from '../detail/LogDetail';
import { JsonView } from '../detail/JsonView';
import { usePanelStore } from '../../store';
import {
  buildApiListSummary,
  buildEntryListItems,
  duration,
  entryGroupLabel,
  entryGroupStats,
  entryPath,
  getEntryContentType,
  getEntryDomain,
  getEntryFlags,
  isApi,
  type ApiEntryFlag,
  type EntryListItem,
  type ApiListSummary,
} from '../../models/entries';
import type { ApiGroupingMode, ApiQuickFilter, SortField, XrayEntry } from '../../types';
import { copyText, entryRequest, formatBytes, formatTime, methodClass, preview, statusClass } from '../../utils';

const iconProps = { size: 16, stroke: 1.8 } as const;

const quickFilters: Array<{ id: ApiQuickFilter; label: string }> = [
  { id: 'errors', label: 'Errors' },
  { id: 'slow', label: 'Slow' },
];

const secondaryQuickFilters: Array<{ id: ApiQuickFilter; label: string }> = [
  { id: 'repeated', label: 'Repeated' },
  { id: 'pinned', label: 'Pinned' },
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

const requestContextTabs: Array<{ id: RequestContextTab; label: string }> = [
  { id: 'request', label: 'Request' },
  { id: 'params', label: 'Params' },
  { id: 'headers', label: 'Headers' },
  { id: 'body', label: 'Body' },
  { id: 'timeline', label: 'Timeline' },
];

function useEntryListItems(mode: 'api' | 'logs'): EntryListItem[] {
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

  return useMemo(() => buildEntryListItems({
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
  }), [apiGroupingMode, apiQuickFilter, entries, expandedGroups, methodFilters, mode, pinnedIds, query, slowThresholdMs, sortField, sortOrder, statusFilters, typeFilters]);
}

export function EntriesWorkspace({ mode }: { mode: 'api' | 'logs' }): React.ReactElement {
  if (mode === 'api') return <ApiWorkspace />;
  return <LogsWorkspace />;
}

function ApiWorkspace(): React.ReactElement {
  const entries = usePanelStore((state) => state.entries);
  const selectedId = usePanelStore((state) => state.selectedId);
  const apiDetailOpen = usePanelStore((state) => state.apiDetailOpen);
  const selectEntry = usePanelStore((state) => state.selectEntry);
  const setApiDetailOpen = usePanelStore((state) => state.setApiDetailOpen);
  const togglePinned = usePanelStore((state) => state.togglePinned);
  const toggleGroup = usePanelStore((state) => state.toggleGroup);
  const pinnedIds = usePanelStore((state) => state.pinnedIds);
  const compactRows = usePanelStore((state) => state.settings.compactRows);
  const slowThresholdMs = usePanelStore((state) => state.settings.slowThresholdMs);
  const showHostInPath = usePanelStore((state) => state.settings.showHostInPath);
  const sortField = usePanelStore((state) => state.sortField);
  const sortOrder = usePanelStore((state) => state.sortOrder);
  const rows = useEntryListItems('api');
  const selected = selectedId ? entries.find((entry) => entry.id === selectedId && entry.type === 'api') || null : null;
  const maxDuration = useMemo(() => Math.max(100, ...entries.filter(isApi).map((entry) => duration(entry))), [entries]);
  const summary = useMemo(() => buildApiListSummary(entries, pinnedIds, slowThresholdMs), [entries, pinnedIds, slowThresholdMs]);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const getItemKey = useCallback((index: number) => rows[index]?.key || index, [rows]);
  const estimateSize = useCallback(() => (compactRows ? 42 : 68), [compactRows]);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    getItemKey,
    overscan: 14,
  });

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

  const handleSelect = useCallback((entry: XrayEntry) => {
    selectEntry(entry.id);
    setApiDetailOpen(true);
  }, [selectEntry, setApiDetailOpen]);

  const handleToggleGroup = useCallback((groupKey?: string) => {
    if (groupKey) toggleGroup(groupKey);
  }, [toggleGroup]);

  const handleTogglePinned = useCallback((id: string) => togglePinned(id), [togglePinned]);

  // Arrow-key navigation through the (possibly grouped) request rows, like the
  // DevTools network panel. Navigation only moves the selection — Enter opens
  // the drawer, and a drawer the user closed stays closed while arrowing.
  function handleListKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Enter') return;
    if (!rows.length) return;
    const currentIndex = rows.findIndex((row) => row.entry.id === selectedId);
    if (event.key === 'Enter') {
      if (currentIndex >= 0) { setApiDetailOpen(true); event.preventDefault(); }
      return;
    }
    event.preventDefault();
    const delta = event.key === 'ArrowDown' ? 1 : -1;
    const nextIndex = currentIndex < 0
      ? (delta === 1 ? 0 : rows.length - 1)
      : Math.min(rows.length - 1, Math.max(0, currentIndex + delta));
    const next = rows[nextIndex];
    if (!next) return;
    selectEntry(next.entry.id, { openDetail: false });
    virtualizer.scrollToIndex(nextIndex, { align: 'auto' });
  }

  return (
    <section className={`xray-api-workspace ${selected && apiDetailOpen ? 'detail-open' : ''}`}>
      <div className="xray-api-body">
        <div className="xray-api-collection-pane">
          <ApiCollectionHeader summary={summary} visibleCount={rows.length} />
          <ApiInspectorToolbar summary={summary} />
          <div className="xray-api-main">
            <ApiTableHeader />
            <div className="xray-api-table-scroll" ref={parentRef} tabIndex={0} role="listbox" aria-label="Captured requests" onKeyDown={handleListKeyDown} onScroll={handleListScroll}>
              <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
                {virtualizer.getVirtualItems().map((item) => {
                  const row = rows[item.index];
                  const entry = row.entry;
                  return (
                    <div key={item.key} data-index={item.index} ref={virtualizer.measureElement} style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${item.start}px)` }}>
                      <ApiRequestRow
                        row={row}
                        entries={entries}
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
              {!rows.length && <EmptyState label="No API requests yet" hint="Browse the page or trigger a call — fetch, XHR, GraphQL, and WebSocket traffic streams in here live. Press Ctrl/⌘+K to jump anywhere." />}
            </div>
            {newCount > 0 && (
              <button className="xray-newmsg-pill xray-newreq-pill" onClick={jumpToTop}>
                <IconArrowUp size={14} stroke={2} />{newCount} new
              </button>
            )}
          </div>
        </div>
        <RequestContextPane entry={selected} />
        <ApiDetailDrawer entry={selected && apiDetailOpen ? selected : null} onClose={() => setApiDetailOpen(false)} />
      </div>
    </section>
  );
}

function LogsWorkspace(): React.ReactElement {
  const entries = usePanelStore((state) => state.entries);
  const selectedId = usePanelStore((state) => state.selectedId);
  const selectEntry = usePanelStore((state) => state.selectEntry);
  const togglePinned = usePanelStore((state) => state.togglePinned);
  const pinnedIds = usePanelStore((state) => state.pinnedIds);
  const rows = useEntryListItems('logs');
  const selected = selectedId ? entries.find((entry) => entry.id === selectedId) || null : null;
  const parentRef = useRef<HTMLDivElement | null>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 46,
    getItemKey: (index) => rows[index]?.key || index,
    measureElement: (element) => element.getBoundingClientRect().height,
    overscan: 10,
  });

  return (
    <section className="xray-split">
      <div className="xray-list-panel">
        <ListControls mode="logs" />
        <div className="xray-virtual-list" ref={parentRef}>
          <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
            {virtualizer.getVirtualItems().map((item) => {
              const row = rows[item.index];
              return (
                <div key={item.key} data-index={item.index} ref={virtualizer.measureElement} style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${item.start}px)` }}>
                  <LogRow row={row} selected={selectedId === row.entry.id} pinned={pinnedIds.has(row.entry.id)} onSelect={() => selectEntry(row.entry.id)} onTogglePinned={() => togglePinned(row.entry.id)} />
                </div>
              );
            })}
          </div>
          {!rows.length && <EmptyState label="No logs captured" hint="Page console.log output and captured objects land here — trigger some activity on the page to populate the list." />}
        </div>
        <MobileSelectedDetail entry={selected} />
      </div>
      <div className="xray-detail-panel">{selected ? <LogDetail entry={selected} /> : <EmptyState label="Select an entry" hint="Pick a log on the left to inspect its arguments and expand nested objects." />}</div>
    </section>
  );
}

function ApiCollectionHeader({ summary, visibleCount }: { summary: ApiListSummary; visibleCount: number }): React.ReactElement {
  return (
    <div className="xray-api-collection-head">
      <div className="xray-api-collection-title">
        <span>Captured Requests</span>
        <strong>{summary.total} APIs</strong>
      </div>
      <div className="xray-api-env-pill" title="Environment inferred from captured browser traffic">
        <IconWorld {...iconProps} />
        <span>Live page</span>
      </div>
      <div className="xray-api-summary-strip" aria-label="Captured request summary">
        <SummaryPill tone="ok" icon={<IconDatabase {...iconProps} />} label="Visible" value={String(visibleCount)} />
        <SummaryPill tone={summary.errors ? 'error' : 'ok'} icon={<IconServer {...iconProps} />} label="Errors" value={String(summary.errors)} />
        <SummaryPill tone={summary.slow ? 'warn' : 'ok'} icon={<IconClock {...iconProps} />} label="Avg" value={`${Math.round(summary.avgDuration)}ms`} />
        <SummaryPill tone="info" icon={<IconDatabase {...iconProps} />} label="Bytes" value={formatBytes(summary.totalBytes)} />
      </div>
    </div>
  );
}

function SummaryPill({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: 'ok' | 'warn' | 'error' | 'info' }): React.ReactElement {
  return (
    <span className={`xray-api-summary-pill ${tone}`}>
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </span>
  );
}

function ApiInspectorToolbar({ summary }: { summary: ApiListSummary }): React.ReactElement {
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
  const driftCount = useMemo(() => entries.reduce((count, entry) => count + (entry.driftFromId ? 1 : 0), 0), [entries]);

  // Clicking an active quick filter deselects it — previously the only way out
  // was "All"/Reset, which also destroyed sort, grouping, and the search text.
  const pickQuickFilter = (id: ApiQuickFilter): void => setApiQuickFilter(apiQuickFilter === id ? 'all' : id);
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
      <button key={filter.id} className={`xray-chip ${apiQuickFilter === filter.id ? 'active' : ''}`} onClick={() => pickQuickFilter(filter.id)} aria-pressed={apiQuickFilter === filter.id}>
        {filter.label}
        {count != null && count > 0 && <span className="xray-chip-count">{count}</span>}
      </button>
    );
  };

  return (
    <div className="xray-api-toolbar">
      <label className="xray-search xray-api-search">
        <IconSearch {...iconProps} />
        <input className="xray-input" value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Filter method, status, path, domain, source, content type..." />
      </label>
      <div className="xray-filter-chips xray-api-primary-filters" aria-label="Primary API filters">
        <button className={`xray-chip ${apiQuickFilter === 'all' && !methodFilters.size && !typeFilters.size && !statusFilters.size ? 'active' : ''}`} onClick={clearApiFilters}>
          All
        </button>
        {['GET', 'POST'].map((method) => (
          <button key={method} className={`xray-chip ${methodFilters.has(method) ? 'active' : ''}`} onClick={() => toggleMethod(method)}>
            {method}
          </button>
        ))}
        {['xhr', 'fetch'].map((type) => <button key={type} className={`xray-chip ${typeFilters.has(type) ? 'active' : ''}`} onClick={() => toggleType(type)}>{type === 'xhr' ? 'XHR' : 'Fetch'}</button>)}
        {quickFilters.map(renderQuickChip)}
      </div>
      <div className="xray-api-secondary-controls">
        <div className="xray-filter-chips compact" aria-label="Status and source filters">
          <span className="xray-filter-label"><IconFilter {...iconProps} />Match</span>
          {['2xx', '3xx', '4xx', '5xx'].map((status) => <button key={status} className={`xray-chip ${statusFilters.has(status) ? 'active' : ''}`} onClick={() => toggleStatus(status)}>{status}</button>)}
          {secondaryQuickFilters.map(renderQuickChip)}
        </div>
        <div className="xray-filter-chips compact" aria-label="API sort and grouping">
          <span className="xray-filter-label">Sort</span>
          {sortOptions.map((field) => (
            <button key={field.id} className={`xray-chip ${sortField === field.id ? 'active' : ''}`} onClick={() => setSort(field.id)} aria-pressed={sortField === field.id}>
              {field.label}
              {sortField === field.id && (sortOrder === 'asc' ? <IconArrowUp size={13} stroke={2.2} /> : <IconArrowDown size={13} stroke={2.2} />)}
            </button>
          ))}
          {(['flat', 'endpoint'] as ApiGroupingMode[]).map((grouping) => (
            <button key={grouping} className={`xray-chip ${apiGroupingMode === grouping ? 'active' : ''}`} onClick={() => setApiGroupingMode(grouping)}>
              {grouping === 'flat' ? 'Flat' : 'Endpoint Groups'}
            </button>
          ))}
          <button className="xray-chip" onClick={clearApiFilters}><IconFilterOff {...iconProps} />Reset</button>
        </div>
      </div>
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
      <span>Tools</span>
    </div>
  );
}

const ApiRequestRow = React.memo(function ApiRequestRow({
  row,
  entries,
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
  const status = Number(entry.status) || 0;
  const path = entryPath(entry);
  // GraphQL rows show `query GetUser` instead of an undifferentiated POST /graphql.
  const label = entryGroupLabel(entry);
  const domain = getEntryDomain(entry) || 'local';
  const type = String(entry.source || 'fetch').toLowerCase();
  const stats = row.groupStats || entryGroupStats(entry, entries);
  const displayBytes = row.groupStats?.totalBytes ?? entry.size;
  const flags = row.flags;
  const pct = Math.max(8, Math.min(100, duration(entry) / maxDuration * 100));
  const isGroup = Boolean(row.groupCount && row.groupCount > 1 && !row.groupChild);
  const contentType = getEntryContentType(entry) || 'response';

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(entry);
    }
  }

  async function copyPath(event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
    event.stopPropagation();
    await copyText(String(entry.url || path));
  }

  return (
    <div
      className={`xray-api-row ${selected ? 'selected' : ''} ${row.groupChild ? 'child' : ''} ${pinned ? 'pinned' : ''} ${isGroup ? 'group' : ''} ${status >= 400 ? 'has-error' : ''} ${duration(entry) >= slowThresholdMs ? 'has-slow' : ''}`}
      role="option"
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      onClick={() => onSelect(entry)}
      onKeyDown={handleKeyDown}
    >
      <span className={`xray-method ${methodClass(entry.method)}`}>{String(entry.method || 'GET').toUpperCase().replace('DELETE', 'DEL')}</span>
      <span className="xray-api-path-cell">
        <span className="xray-path" title={String(entry.url || path)}>{label}</span>
        <span className="xray-entry-meta">
          {isGroup ? `${stats.count} calls - ${stats.errors} errors - avg ${Math.round(stats.avgDuration)}ms` : `${showHostInPath ? domain : contentType} - ${type.toUpperCase()} - ${formatBytes(displayBytes)} - ${formatTime(entry.timestamp)}`}
        </span>
        <ApiFlagPills flags={flags} />
      </span>
      <span className={`xray-status ${statusClass(status)}`}>{entry.status || '---'}</span>
      <span className="xray-entry-duration">
        <span className="xray-bar-track"><span className={`xray-bar ${duration(entry) >= slowThresholdMs ? 'slow' : ''} ${status >= 400 ? 'error' : ''}`} style={{ width: `${pct}%` }} /></span>
        <span>{Math.round(duration(entry))}ms</span>
      </span>
      <span className="xray-api-row-actions">
        {row.groupCount && row.groupCount > 1 && (
          <button className="xray-icon-btn" tabIndex={-1} aria-label={row.groupExpanded ? 'Collapse endpoint group' : 'Expand endpoint group'} onClick={(event) => { event.stopPropagation(); onToggleGroup(row.groupKey); }}>
            {row.groupExpanded ? <IconChevronDown {...iconProps} /> : <IconChevronRight {...iconProps} />}
          </button>
        )}
        <button className="xray-icon-btn" tabIndex={-1} aria-label="Copy request URL" onClick={(event) => void copyPath(event)}><IconCopy {...iconProps} /></button>
        <button className={`xray-icon-btn ${pinned ? 'active' : ''}`} tabIndex={-1} aria-label={pinned ? 'Unpin request' : 'Pin request'} onClick={(event) => { event.stopPropagation(); onTogglePinned(entry.id); }}>
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
      <div className="xray-detail-tabs xray-request-tabs" aria-label="Request tabs">
        {requestContextTabs.map((tab) => (
          <button key={tab.id} className={`xray-detail-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
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

function ApiDetailDrawer({ entry, onClose }: { entry: XrayEntry | null; onClose(): void }): React.ReactElement {
  return (
    <aside className={`xray-api-detail-drawer ${entry ? '' : 'empty'}`} aria-label="Selected API request detail">
      <div className="xray-api-drawer-body">
        {entry ? <RequestDetail entry={entry} onClose={onClose} /> : <EmptyState label="Nothing selected" hint="Choose a request to open the detail drawer — preview, schema, diff, replay, and more." />}
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
  const status = Number(entry.status) || 0;
  return (
    <button className={`xray-entry-row ${selected ? 'selected' : ''} ${pinned ? 'pinned' : ''}`} onClick={onSelect}>
      <span className={`xray-status-dot ${statusClass(status)}`} />
      <span className={`xray-method ${methodClass(entry.method)}`}>{entry.logLevel || 'log'}</span>
      <span className={`xray-status ${statusClass(status)}`}>{formatTime(entry.timestamp)}</span>
      <span className="xray-entry-main">
        <span className="xray-path">{preview(entry.message ?? entry.logData, 160)}</span>
      </span>
      <span className={`xray-pin ${pinned ? 'active' : ''}`} onClick={(event) => { event.stopPropagation(); onTogglePinned(); }}>
        <IconPin {...iconProps} />
      </span>
    </button>
  );
}

function MobileSelectedDetail({ entry }: { entry: XrayEntry | null }): React.ReactElement | null {
  if (!entry) return null;
  return <div className="xray-mobile-detail-panel">{entry.type === 'log' ? <LogDetail entry={entry} /> : <RequestDetail entry={entry} />}</div>;
}

function ListControls({ mode }: { mode: 'api' | 'logs' }): React.ReactElement {
  const query = usePanelStore((state) => state.apiSearchQuery);
  const setQuery = usePanelStore((state) => state.setApiSearchQuery);

  return (
    <div className="xray-list-controls">
      <label className="xray-search">
        <IconSearch {...iconProps} />
        <input className="xray-input" value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder={mode === 'api' ? 'Search path, method, status...' : 'Search logs...'} />
      </label>
    </div>
  );
}
