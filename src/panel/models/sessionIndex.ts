import type { XrayEntry } from '../types';
import { entryRequest, entryResponse, preview, safeStringify } from '../utils';

export type PanelEntry = XrayEntry;

export interface SearchDocument {
  id: string;
  entry: PanelEntry;
  fields: Array<[string, string]>;
  searchText: string;
  searchTextComplete: boolean;
  bodyFlags: { empty: boolean; large: boolean };
}

export interface EndpointGroupSummary {
  key: string;
  path: string;
  entries: PanelEntry[];
  latestEntry: PanelEntry;
  count: number;
  errors: number;
  avgDuration: number;
  maxDuration: number;
  totalBytes: number;
  lastSeen: number;
  methods: string[];
  sources: string[];
}

export interface EntryGroupStats {
  count: number;
  errors: number;
  avgDuration: number;
  maxDuration: number;
}

export interface SessionIndex {
  entries: readonly PanelEntry[];
  apiCount: number;
  logCount: number;
  errorCount: number;
  totalBytes: number;
  endpointGroups: Map<string, EndpointGroupSummary>;
  groupStats: Map<string, EntryGroupStats>;
  searchDocuments: Map<string, SearchDocument>;
}

export const MAX_INDEXED_SEARCH_DOCUMENTS = 1000;
export const SEARCH_FIELD_SCAN_CHARS = 20_000;
export const LIST_SEARCH_CACHE_CHARS = 20_000;

const indexCache = new WeakMap<readonly PanelEntry[], SessionIndex>();

function isApi(entry: PanelEntry): boolean {
  return entry.type === 'api';
}

function entryPath(entry: PanelEntry): string {
  return String(entry.urlPath || entry.url || '(unknown)');
}

function groupPath(entry: PanelEntry): string {
  const path = entryPath(entry);
  return entry.graphql?.operationName ? `${path}#${entry.graphql.operationName}` : path;
}

function groupLabel(entry: PanelEntry): string {
  return entry.graphql?.operationName
    ? `${entry.graphql.operationType} ${entry.graphql.operationName}`
    : entryPath(entry);
}

function duration(entry: PanelEntry): number {
  return Math.max(0, Number(entry.duration) || 0);
}

function headerValue(headers: unknown, name: string): string {
  if (!headers || typeof headers !== 'object') return '';
  const lowerName = name.toLowerCase();
  const found = Object.entries(headers as Record<string, unknown>).find(([key]) => key.toLowerCase() === lowerName);
  return found ? String(found[1] ?? '') : '';
}

function contentType(entry: PanelEntry): string {
  return String(
    entry.contentType ||
    headerValue(entry.responseHeaders, 'content-type') ||
    headerValue(entry.requestHeaders, 'content-type') ||
    '',
  );
}

function getDomain(entry: PanelEntry): string {
  const url = String(entry.url || '');
  if (!url) return '';
  try { return new URL(url).host; } catch { return ''; }
}

function bodyFlags(entry: PanelEntry, response: unknown, responseText: string | null): { empty: boolean; large: boolean } {
  const raw = entry.responseDecrypted ?? entry.responseRaw ?? entry.response;
  let empty = Number(entry.status) === 204 || raw == null || raw === '';
  if (!empty) {
    if (Array.isArray(response)) empty = response.length === 0;
    else if (response && typeof response === 'object') empty = Object.keys(response as Record<string, unknown>).length === 0;
  }

  let large = Number(entry.size) >= 100_000;
  if (!large) {
    if (typeof raw === 'string') large = raw.length >= 100_000;
    else if (raw != null) large = (responseText || '').length >= 100_000;
  }
  return { empty, large };
}

function buildSearchFields(entry: PanelEntry, responseText: string | null, request: unknown): Array<[string, string]> {
  const fields: Array<[string, string]> = [];
  const push = (label: string, value: unknown): void => {
    if (value == null || value === '') return;
    const text = typeof value === 'string' ? value : safeStringify(value, 0, SEARCH_FIELD_SCAN_CHARS);
    if (text) fields.push([label, text.length > SEARCH_FIELD_SCAN_CHARS ? text.slice(0, SEARCH_FIELD_SCAN_CHARS) : text]);
  };

  if (entry.method) push('Method', String(entry.method).toUpperCase());
  push('URL', String(entry.url || entry.urlPath || ''));
  if (entry.status) push('Status', String(entry.status));
  if (entry.requestHeaders && typeof entry.requestHeaders === 'object') push('Request headers', entry.requestHeaders);
  if (request != null) push('Request body', request);
  if (entry.responseHeaders && typeof entry.responseHeaders === 'object') push('Response headers', entry.responseHeaders);
  if (responseText != null) push('Response body', responseText);
  if (entry.message) push('Message', String(entry.message));
  return fields;
}

function buildSearchDocument(entry: PanelEntry): SearchDocument {
  const response = entryResponse(entry);
  const request = entryRequest(entry);
  const responseText = response == null ? null : typeof response === 'string' ? response : safeStringify(response, 0, 120_000);
  const fields = buildSearchFields(entry, responseText, request);
  const searchText = [
    entry.method,
    entry.status,
    entry.url,
    entry.urlPath,
    entry.source,
    getDomain(entry),
    contentType(entry),
    entry.logLevel,
    entry.message,
    preview(entry.logData, 240),
  ].join(' ').toLowerCase();
  const searchTextComplete = searchText.length <= LIST_SEARCH_CACHE_CHARS;
  // An incomplete prefix cannot represent legacy list matching. Retain no large
  // concatenated string (or slice backed by it); matchesEntry derives it on demand.
  return { id: entry.id, entry, fields, searchText: searchTextComplete ? searchText : '', searchTextComplete, bodyFlags: bodyFlags(entry, response, responseText) };
}

function buildIndex(entries: readonly PanelEntry[]): SessionIndex {
  let apiCount = 0;
  let logCount = 0;
  let errorCount = 0;
  let totalBytes = 0;
  const grouped = new Map<string, PanelEntry[]>();
  const groupStats = new Map<string, EntryGroupStats>();

  for (const entry of entries) {
    if (!isApi(entry)) {
      logCount += 1;
      continue;
    }
    apiCount += 1;
    if (Number(entry.status) >= 400) errorCount += 1;
    totalBytes += Number(entry.size) || 0;
    const path = groupPath(entry);
    const groupEntries = grouped.get(path) || [];
    groupEntries.push(entry);
    grouped.set(path, groupEntries);

    const stats = groupStats.get(path) || { count: 0, errors: 0, avgDuration: 0, maxDuration: 0 };
    const time = duration(entry);
    stats.count += 1;
    if (Number(entry.status) >= 400) stats.errors += 1;
    stats.maxDuration = Math.max(stats.maxDuration, time);
    stats.avgDuration += time;
    groupStats.set(path, stats);
  }

  for (const stats of groupStats.values()) stats.avgDuration = stats.count ? stats.avgDuration / stats.count : 0;

  const endpointGroups = new Map<string, EndpointGroupSummary>();
  for (const [path, groupEntries] of grouped) {
    const sorted = groupEntries.slice().sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
    const latestEntry = sorted[0];
    endpointGroups.set(path, {
      key: `api:${path}`,
      path: groupLabel(latestEntry),
      entries: sorted,
      latestEntry,
      count: sorted.length,
      errors: sorted.filter((entry) => Number(entry.status) >= 400).length,
      avgDuration: sorted.length ? sorted.reduce((sum, entry) => sum + duration(entry), 0) / sorted.length : 0,
      maxDuration: sorted.reduce((max, entry) => Math.max(max, duration(entry)), 0),
      totalBytes: sorted.reduce((sum, entry) => sum + (Number(entry.size) || 0), 0),
      lastSeen: Number(latestEntry.timestamp) || 0,
      methods: Array.from(new Set(sorted.map((entry) => String(entry.method || 'GET').toUpperCase()))),
      sources: Array.from(new Set(sorted.map((entry) => String(entry.source || 'fetch').toLowerCase()))),
    });
  }

  // Retention can reach 5,000; only the newest 1,000 search documents are cached.
  // Consumers derive misses transiently so this budget never restricts coverage.
  const searchDocuments = new Map<string, SearchDocument>();
  const searchable = entries.slice(Math.max(0, entries.length - MAX_INDEXED_SEARCH_DOCUMENTS));
  for (const entry of searchable) searchDocuments.set(entry.id, buildSearchDocument(entry));

  return { entries, apiCount, logCount, errorCount, totalBytes, endpointGroups, groupStats, searchDocuments };
}

export function buildSessionIndex(entries: readonly PanelEntry[]): SessionIndex {
  const cached = indexCache.get(entries);
  if (cached) return cached;
  const index = buildIndex(entries);
  indexCache.set(entries, index);
  return index;
}

export function getIndexedBodyFlags(entry: PanelEntry, index: SessionIndex): { empty: boolean; large: boolean } | undefined {
  return getIndexedSearchDocument(entry, index)?.bodyFlags;
}

export function getIndexedSearchDocument(entry: PanelEntry, index: SessionIndex): SearchDocument | undefined {
  const document = index.searchDocuments.get(entry.id);
  return document?.entry === entry ? document : undefined;
}
