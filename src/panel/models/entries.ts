import type { ApiGroupingMode, ApiQuickFilter, SortField, SortOrder, XrayEntry } from '../types';
import { entryResponse, preview, safeStringify } from '../utils';

export type ApiEntryFlag = 'error' | 'slow' | 'repeated' | 'large' | 'empty' | 'pinned' | 'drift' | 'graphql' | 'ws' | 'mocked' | 'replayed';

export interface EntryListItem {
  key: string;
  entry: XrayEntry;
  // Precomputed once per pipeline run so virtualized rows don't redo O(n)
  // group scans and full-body parses on every commit.
  flags: ApiEntryFlag[];
  groupKey?: string;
  groupCount?: number;
  groupExpanded?: boolean;
  groupChild?: boolean;
  groupStats?: EndpointGroup;
}

export interface ApiListSummary {
  total: number;
  errors: number;
  slow: number;
  pinned: number;
  avgDuration: number;
  totalBytes: number;
  topEndpoint: string;
  repeatedEndpoints: number;
}

export interface EntryGroupStats {
  count: number;
  errors: number;
  avgDuration: number;
  maxDuration: number;
}

export interface EndpointGroup {
  key: string;
  path: string;
  entries: XrayEntry[];
  latestEntry: XrayEntry;
  count: number;
  errors: number;
  avgDuration: number;
  maxDuration: number;
  totalBytes: number;
  lastSeen: number;
  methods: string[];
  sources: string[];
}

export interface EntryListOptions {
  mode: 'api' | 'logs';
  entries: XrayEntry[];
  query: string;
  statusFilters: ReadonlySet<string>;
  typeFilters: ReadonlySet<string>;
  methodFilters?: ReadonlySet<string>;
  expandedGroups: ReadonlySet<string>;
  pinnedIds: ReadonlySet<string>;
  sortField: SortField;
  sortOrder: SortOrder;
  slowThresholdMs?: number;
  apiQuickFilter?: ApiQuickFilter;
  apiGroupingMode?: ApiGroupingMode;
}

export function isApi(entry: XrayEntry): boolean {
  return entry.type === 'api';
}

export function isLog(entry: XrayEntry): boolean {
  return entry.type === 'log';
}

export function entryPath(entry: XrayEntry): string {
  return String(entry.urlPath || entry.url || '(unknown)');
}

// Grouping key: GraphQL requests collapse to `path#operationName` so distinct
// operations don't all pile under a single POST /graphql row.
export function entryGroupPath(entry: XrayEntry): string {
  const path = entryPath(entry);
  if (entry.graphql?.operationName) return `${path}#${entry.graphql.operationName}`;
  return path;
}

export function entryGroupLabel(entry: XrayEntry): string {
  if (entry.graphql?.operationName) {
    return `${entry.graphql.operationType} ${entry.graphql.operationName}`;
  }
  return entryPath(entry);
}

export function getEntryDomain(entry: XrayEntry): string {
  const url = String(entry.url || '');
  if (!url) return '';
  try {
    return new URL(url).host;
  } catch {
    return '';
  }
}

function headerValue(headers: unknown, name: string): string {
  if (!headers || typeof headers !== 'object') return '';
  const lowerName = name.toLowerCase();
  const found = Object.entries(headers as Record<string, unknown>).find(([key]) => key.toLowerCase() === lowerName);
  return found ? String(found[1] ?? '') : '';
}

export function getEntryContentType(entry: XrayEntry): string {
  return String(
    entry.contentType ||
    headerValue(entry.responseHeaders, 'content-type') ||
    headerValue(entry.requestHeaders, 'content-type') ||
    '',
  );
}

export function duration(entry: XrayEntry | null): number {
  return Math.max(0, Number(entry?.duration) || 0);
}

export function statusRange(entry: XrayEntry): string {
  const status = Number(entry.status) || 0;
  if (status >= 500) return '5xx';
  if (status >= 400) return '4xx';
  if (status >= 300) return '3xx';
  if (status >= 200) return '2xx';
  return 'other';
}

export function buildApiListSummary(entries: XrayEntry[], pinnedIds: ReadonlySet<string>, slowThresholdMs = 500): ApiListSummary {
  const apis = entries.filter(isApi);
  const totalDuration = apis.reduce((sum, entry) => sum + duration(entry), 0);
  const endpointCounts = new Map<string, number>();
  apis.forEach((entry) => {
    const path = entryPath(entry);
    endpointCounts.set(path, (endpointCounts.get(path) || 0) + 1);
  });
  const topEndpoint = Array.from(endpointCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'No endpoint yet';
  return {
    total: apis.length,
    errors: apis.filter((entry) => Number(entry.status) >= 400).length,
    slow: apis.filter((entry) => duration(entry) >= slowThresholdMs).length,
    pinned: apis.filter((entry) => pinnedIds.has(entry.id)).length,
    avgDuration: apis.length ? totalDuration / apis.length : 0,
    totalBytes: apis.reduce((sum, entry) => sum + (Number(entry.size) || 0), 0),
    topEndpoint,
    repeatedEndpoints: Array.from(endpointCounts.values()).filter((count) => count >= 3).length,
  };
}

// Group stats are memoized per entries-array identity: the store replaces the
// array on every commit, so one O(n) pass serves every row/filter/flag lookup
// for that commit instead of an O(n) scan per call site.
const groupStatsCache = new WeakMap<readonly XrayEntry[], Map<string, EntryGroupStats>>();

function groupStatsMap(entries: XrayEntry[]): Map<string, EntryGroupStats> {
  let map = groupStatsCache.get(entries);
  if (map) return map;
  map = new Map();
  const totals = new Map<string, number>();
  for (const entry of entries) {
    if (!isApi(entry)) continue;
    const key = entryGroupPath(entry);
    const stats = map.get(key) || { count: 0, errors: 0, avgDuration: 0, maxDuration: 0 };
    const time = duration(entry);
    stats.count += 1;
    if (Number(entry.status) >= 400) stats.errors += 1;
    stats.maxDuration = Math.max(stats.maxDuration, time);
    totals.set(key, (totals.get(key) || 0) + time);
    map.set(key, stats);
  }
  for (const [key, stats] of map) {
    stats.avgDuration = stats.count ? (totals.get(key) || 0) / stats.count : 0;
  }
  groupStatsCache.set(entries, map);
  return map;
}

export function entryGroupStats(entry: XrayEntry, entries: XrayEntry[]): EntryGroupStats {
  return groupStatsMap(entries).get(entryGroupPath(entry)) || { count: 0, errors: 0, avgDuration: 0, maxDuration: 0 };
}

// Body-derived flags parse/stringify up to 250KB — cache per entry object
// (entries are immutable between patches; updateEntry mints a new object).
const bodyFlagCache = new WeakMap<XrayEntry, { empty: boolean; large: boolean }>();

function bodyFlags(entry: XrayEntry): { empty: boolean; large: boolean } {
  const cached = bodyFlagCache.get(entry);
  if (cached) return cached;
  const raw = entry.responseDecrypted ?? entry.responseRaw ?? entry.response;

  let empty = false;
  if (Number(entry.status) === 204 || raw == null || raw === '') {
    empty = true;
  } else {
    const parsed = entryResponse(entry);
    if (Array.isArray(parsed)) empty = parsed.length === 0;
    else if (parsed && typeof parsed === 'object') empty = Object.keys(parsed as Record<string, unknown>).length === 0;
  }

  let large = Number(entry.size) >= 100_000;
  if (!large) {
    if (typeof raw === 'string') large = raw.length >= 100_000;
    else if (raw != null) large = safeStringify(raw, 0, 120_000).length >= 100_000;
  }

  const flags = { empty, large };
  bodyFlagCache.set(entry, flags);
  return flags;
}

function isEmptyApiResponse(entry: XrayEntry): boolean {
  return bodyFlags(entry).empty;
}

function isLargeApiPayload(entry: XrayEntry): boolean {
  return bodyFlags(entry).large;
}

export function getEntryFlags(entry: XrayEntry, entries: XrayEntry[], pinnedIds: ReadonlySet<string> = new Set(), slowThresholdMs = 500): ApiEntryFlag[] {
  if (!isApi(entry)) return pinnedIds.has(entry.id) ? ['pinned'] : [];
  const flags: ApiEntryFlag[] = [];
  const status = Number(entry.status) || 0;
  const stats = entryGroupStats(entry, entries);
  if (status >= 400) flags.push('error');
  if (entry.driftFromId) flags.push('drift');
  if (entry.mocked) flags.push('mocked');
  if (entry.replayed) flags.push('replayed');
  if (entry.graphql) flags.push('graphql');
  if (entry.source === 'ws' || entry.source === 'sse') flags.push('ws');
  if (duration(entry) >= slowThresholdMs) flags.push('slow');
  if (stats.count >= 3) flags.push('repeated');
  if (isLargeApiPayload(entry)) flags.push('large');
  if (isEmptyApiResponse(entry)) flags.push('empty');
  if (pinnedIds.has(entry.id)) flags.push('pinned');
  return flags;
}

export function matchesApiQuickFilter(
  entry: XrayEntry,
  filter: ApiQuickFilter,
  entries: XrayEntry[],
  pinnedIds: ReadonlySet<string> = new Set(),
  slowThresholdMs = 500,
): boolean {
  if (filter === 'all') return true;
  if (filter === 'drift') return !!entry.driftFromId;
  if (filter === 'graphql') return !!entry.graphql;
  if (filter === 'ws') return entry.source === 'ws' || entry.source === 'sse';
  if (filter === 'mocked') return !!entry.mocked;
  if (filter === 'replayed') return !!entry.replayed;
  // Direct predicates: routing these through the full flag machinery made an
  // active chip O(n) body work per entry per commit.
  if (filter === 'errors') return (Number(entry.status) || 0) >= 400;
  if (filter === 'slow') return duration(entry) >= slowThresholdMs;
  if (filter === 'pinned') return pinnedIds.has(entry.id);
  if (filter === 'repeated') return entryGroupStats(entry, entries).count >= 3;
  if (filter === 'large') return isLargeApiPayload(entry);
  if (filter === 'empty') return isEmptyApiResponse(entry);
  return true;
}

// The search haystack (URL parse, header scan, logData stringify) is cached
// per entry object — rebuilt only when an entry is patched, not per keystroke
// per commit.
const haystackCache = new WeakMap<XrayEntry, string>();

export function matchesEntry(entry: XrayEntry, query: string): boolean {
  if (!query) return true;
  let haystack = haystackCache.get(entry);
  if (haystack === undefined) {
    haystack = [
      entry.method,
      entry.status,
      entry.url,
      entry.urlPath,
      entry.source,
      getEntryDomain(entry),
      getEntryContentType(entry),
      entry.logLevel,
      entry.message,
      preview(entry.logData, 240),
    ].join(' ').toLowerCase();
    haystackCache.set(entry, haystack);
  }
  return haystack.includes(query.toLowerCase());
}

export function buildEndpointGroups(entries: XrayEntry[]): EndpointGroup[] {
  const groups = new Map<string, XrayEntry[]>();
  entries.filter(isApi).forEach((entry) => {
    const path = entryGroupPath(entry);
    const items = groups.get(path) || [];
    items.push(entry);
    groups.set(path, items);
  });

  return Array.from(groups.entries()).map(([groupKey, groupEntries]) => {
    const sorted = groupEntries.slice().sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
    const totalDuration = sorted.reduce((sum, entry) => sum + duration(entry), 0);
    const path = entryGroupLabel(sorted[0]);
    return {
      key: 'api:' + groupKey,
      path,
      entries: sorted,
      latestEntry: sorted[0],
      count: sorted.length,
      errors: sorted.filter((entry) => Number(entry.status) >= 400).length,
      avgDuration: sorted.length ? totalDuration / sorted.length : 0,
      maxDuration: sorted.reduce((max, entry) => Math.max(max, duration(entry)), 0),
      totalBytes: sorted.reduce((sum, entry) => sum + (Number(entry.size) || 0), 0),
      lastSeen: Number(sorted[0]?.timestamp) || 0,
      methods: Array.from(new Set(sorted.map((entry) => String(entry.method || 'GET').toUpperCase()))),
      sources: Array.from(new Set(sorted.map((entry) => String(entry.source || 'fetch').toLowerCase()))),
    };
  });
}

export function compareEntries(a: XrayEntry, b: XrayEntry, field: SortField, order: SortOrder): number {
  const dir = order === 'asc' ? 1 : -1;
  const value = (entry: XrayEntry): string | number => {
    if (field === 'method') return String(entry.method || '');
    if (field === 'status') return Number(entry.status) || 0;
    if (field === 'url') return entryPath(entry);
    if (field === 'duration') return Number(entry.duration) || 0;
    if (field === 'size') return Number(entry.size) || 0;
    return Number(entry.timestamp) || 0;
  };
  const av = value(a);
  const bv = value(b);
  if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
  return String(av).localeCompare(String(bv)) * dir;
}

export function buildEntryListItems(options: EntryListOptions): EntryListItem[] {
  const {
    mode,
    entries,
    query,
    statusFilters,
    typeFilters,
    methodFilters = new Set<string>(),
    expandedGroups,
    pinnedIds,
    sortField,
    sortOrder,
    slowThresholdMs = 500,
    apiQuickFilter = 'all',
    apiGroupingMode = 'endpoint',
  } = options;

  const base = entries.filter(mode === 'api' ? isApi : isLog)
    .filter((entry) => matchesEntry(entry, query))
    .filter((entry) => mode !== 'api' || matchesApiQuickFilter(entry, apiQuickFilter, entries, pinnedIds, slowThresholdMs))
    .filter((entry) => mode !== 'api' || !methodFilters.size || methodFilters.has(String(entry.method || 'GET').toUpperCase()))
    .filter((entry) => mode !== 'api' || !statusFilters.size || statusFilters.has(statusRange(entry)))
    .filter((entry) => mode !== 'api' || !typeFilters.size || typeFilters.has(String(entry.source || 'fetch').toLowerCase()));

  const pinnedFirst = (a: XrayEntry, b: XrayEntry): number => {
    const ap = pinnedIds.has(a.id) ? 1 : 0;
    const bp = pinnedIds.has(b.id) ? 1 : 0;
    return bp - ap || compareEntries(a, b, sortField, sortOrder);
  };

  // Flags are computed once per pipeline run here — virtualized rows render
  // them as data instead of re-deriving O(n) group scans per row per commit.
  const flagsFor = (entry: XrayEntry): ApiEntryFlag[] => getEntryFlags(entry, entries, pinnedIds, slowThresholdMs);

  if (mode === 'logs') {
    return base.slice().sort(pinnedFirst).map((entry) => ({ key: entry.id, entry, flags: flagsFor(entry) }));
  }

  if (apiGroupingMode === 'flat') {
    return base.slice().sort(pinnedFirst).map((entry) => ({ key: entry.id, entry, flags: flagsFor(entry) }));
  }

  // Grouped mode: order the GROUPS (pinned-containing first, then by their
  // latest entry under the active sort) and emit each header followed by its
  // children contiguously. The previous global re-sort of the flattened rows
  // interleaved unrelated group headers between a parent and its children.
  const groups = buildEndpointGroups(base).sort((groupA, groupB) => {
    const aPinned = groupA.entries.some((entry) => pinnedIds.has(entry.id)) ? 1 : 0;
    const bPinned = groupB.entries.some((entry) => pinnedIds.has(entry.id)) ? 1 : 0;
    return bPinned - aPinned || compareEntries(groupA.latestEntry, groupB.latestEntry, sortField, sortOrder);
  });

  const rows: EntryListItem[] = [];
  groups.forEach((group) => {
    const sorted = group.entries.slice().sort(pinnedFirst);
    const expanded = expandedGroups.has(group.key);
    rows.push({
      key: group.key,
      entry: sorted[0],
      flags: flagsFor(sorted[0]),
      groupKey: group.key,
      groupCount: sorted.length,
      groupExpanded: expanded,
      groupStats: group,
    });
    if (expanded && sorted.length > 1) {
      sorted.slice(1).forEach((entry) => rows.push({
        key: entry.id,
        entry,
        flags: flagsFor(entry),
        groupKey: group.key,
        groupChild: true,
      }));
    }
  });

  return rows;
}
