import type { ApiGroupingMode, ApiQuickFilter, SortField, SortOrder, XrayEntry } from '../types';
import { entryResponse, preview, safeStringify } from '../utils';

export type ApiEntryFlag = 'error' | 'slow' | 'repeated' | 'large' | 'empty' | 'pinned';

export interface EntryListItem {
  key: string;
  entry: XrayEntry;
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

export function buildApiListSummary(entries: XrayEntry[], pinnedIds: ReadonlySet<string>): ApiListSummary {
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
    slow: apis.filter((entry) => duration(entry) > 500).length,
    pinned: apis.filter((entry) => pinnedIds.has(entry.id)).length,
    avgDuration: apis.length ? totalDuration / apis.length : 0,
    totalBytes: apis.reduce((sum, entry) => sum + (Number(entry.size) || 0), 0),
    topEndpoint,
    repeatedEndpoints: Array.from(endpointCounts.values()).filter((count) => count >= 3).length,
  };
}

export function entryGroupStats(entry: XrayEntry, entries: XrayEntry[]): EntryGroupStats {
  const group = entries.filter((candidate) => isApi(candidate) && entryPath(candidate) === entryPath(entry));
  const totalDuration = group.reduce((sum, item) => sum + duration(item), 0);
  return {
    count: group.length,
    errors: group.filter((item) => Number(item.status) >= 400).length,
    avgDuration: group.length ? totalDuration / group.length : 0,
    maxDuration: group.reduce((max, item) => Math.max(max, duration(item)), 0),
  };
}

function isEmptyApiResponse(entry: XrayEntry): boolean {
  if (Number(entry.status) === 204) return true;
  const raw = entry.responseDecrypted ?? entry.responseRaw ?? entry.response;
  if (raw == null || raw === '') return true;
  const parsed = entryResponse(entry);
  if (Array.isArray(parsed)) return parsed.length === 0;
  if (parsed && typeof parsed === 'object') return Object.keys(parsed as Record<string, unknown>).length === 0;
  return false;
}

function isLargeApiPayload(entry: XrayEntry): boolean {
  if (Number(entry.size) >= 100_000) return true;
  const raw = entry.responseDecrypted ?? entry.responseRaw ?? entry.response;
  if (typeof raw === 'string' && raw.length >= 100_000) return true;
  return safeStringify(raw, 0, 120_000).length >= 100_000;
}

export function getEntryFlags(entry: XrayEntry, entries: XrayEntry[], pinnedIds: ReadonlySet<string> = new Set(), slowThresholdMs = 500): ApiEntryFlag[] {
  if (!isApi(entry)) return pinnedIds.has(entry.id) ? ['pinned'] : [];
  const flags: ApiEntryFlag[] = [];
  const status = Number(entry.status) || 0;
  const stats = entryGroupStats(entry, entries);
  if (status >= 400) flags.push('error');
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
  return getEntryFlags(entry, entries, pinnedIds, slowThresholdMs).includes(filter === 'errors' ? 'error' : filter);
}

export function matchesEntry(entry: XrayEntry, query: string): boolean {
  if (!query) return true;
  const haystack = [
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
  return haystack.includes(query.toLowerCase());
}

export function buildEndpointGroups(entries: XrayEntry[]): EndpointGroup[] {
  const groups = new Map<string, XrayEntry[]>();
  entries.filter(isApi).forEach((entry) => {
    const path = entryPath(entry);
    const items = groups.get(path) || [];
    items.push(entry);
    groups.set(path, items);
  });

  return Array.from(groups.entries()).map(([path, groupEntries]) => {
    const sorted = groupEntries.slice().sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
    const totalDuration = sorted.reduce((sum, entry) => sum + duration(entry), 0);
    return {
      key: 'api:' + path,
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

  if (mode === 'logs') {
    return base.slice().sort(pinnedFirst).map((entry) => ({ key: entry.id, entry }));
  }

  if (apiGroupingMode === 'flat') {
    return base.slice().sort(pinnedFirst).map((entry) => ({ key: entry.id, entry }));
  }

  const rows: EntryListItem[] = [];
  buildEndpointGroups(base).forEach((group) => {
    const sorted = group.entries.slice().sort(pinnedFirst);
    const expanded = expandedGroups.has(group.key);
    rows.push({
      key: group.key,
      entry: sorted[0],
      groupKey: group.key,
      groupCount: sorted.length,
      groupExpanded: expanded,
      groupStats: group,
    });
    if (expanded && sorted.length > 1) {
      sorted.slice(1).forEach((entry) => rows.push({
        key: entry.id,
        entry,
        groupKey: group.key,
        groupChild: true,
      }));
    }
  });

  return rows.sort((a, b) => {
    const ap = pinnedIds.has(a.entry.id) ? 1 : 0;
    const bp = pinnedIds.has(b.entry.id) ? 1 : 0;
    return bp - ap || compareEntries(a.entry, b.entry, sortField, sortOrder);
  });
}
