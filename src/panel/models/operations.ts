import type { DetailView, XrayEntry } from '../types';
import { duration, entryGroupPath, entryPath, isApi } from './entries';
import { buildCurl, buildFetch, buildMockPayload, entryResponse, entrySchema, safeStringify } from '../utils';

export interface ResponseOperation {
  id: string;
  label: string;
  kind: 'view' | 'console' | 'snippet' | 'copy' | 'export' | 'select';
  command?: string;
  // Copy payloads that are expensive to build (full 500KB bodies, mock
  // payloads) are produced on click, not on every render of the action bar.
  lazyCommand?: () => string;
  view?: DetailView;
  toast?: string;
  priority: number;
  entryId?: string;
}

function isObjectLike(value: unknown): boolean {
  return !!value && typeof value === 'object';
}

function isEmptyResponse(value: unknown): boolean {
  if (value == null || value === '') return true;
  if (Array.isArray(value)) return value.length === 0;
  if (isObjectLike(value)) return Object.keys(value as Record<string, unknown>).length === 0;
  return false;
}

function isLargePayload(entry: XrayEntry, value: unknown): boolean {
  if (Number(entry.size) > 80_000) return true;
  return safeStringify(value, 0, 120_000).length > 80_000;
}

function sameEndpoint(a: XrayEntry, b: XrayEntry): boolean {
  return isApi(a) && isApi(b) && entryGroupPath(a) === entryGroupPath(b);
}

function previousSameEndpoint(entry: XrayEntry, entries: XrayEntry[]): XrayEntry | null {
  const before = entries
    .filter((candidate) => candidate.id !== entry.id && sameEndpoint(candidate, entry))
    .filter((candidate) => Number(candidate.timestamp) <= Number(entry.timestamp || Date.now()))
    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
  return before[0] || null;
}

function hasSchemaDrift(entry: XrayEntry, entries: XrayEntry[]): boolean {
  // Drift was already detected at capture time — no need to re-derive it.
  if (entry.driftFromId) return true;
  const previous = previousSameEndpoint(entry, entries);
  if (!previous) return false;
  return safeStringify(entrySchema(previous), 0, 20_000) !== safeStringify(entrySchema(entry), 0, 20_000);
}

function pushUnique(operations: ResponseOperation[], operation: ResponseOperation): void {
  const index = operations.findIndex((item) => item.id === operation.id);
  if (index === -1) {
    operations.push(operation);
    return;
  }
  // On collision keep the HIGHER-priority variant rather than merely the first one
  // pushed. Branch order was effectively load-bearing: a request that was both slow
  // AND drifted kept the slow branch's `compare-previous` (priority 78, kind
  // 'console') and discarded the drift branch's (87, kind 'view', view 'diff'), so
  // its button could not open the diff — while a merely-drifted request got the
  // right one. `schema` was pinned at 75 instead of the drift branch's 86 the same way.
  if (operation.priority > operations[index].priority) operations[index] = operation;
}

export function getResponseOperations(entry: XrayEntry, entries: XrayEntry[]): ResponseOperation[] {
  const response = entryResponse(entry);
  const status = Number(entry.status) || 0;
  const path = entryPath(entry);
  const samePath = entries.filter((candidate) => candidate.id !== entry.id && sameEndpoint(candidate, entry));
  const errors = entries.filter((candidate) => isApi(candidate) && Number(candidate.status) >= 400);
  const operations: ResponseOperation[] = [];

  if (status >= 400) {
    pushUnique(operations, { id: 'inspect-error', label: 'Inspect Error', kind: 'view', view: 'tree', priority: 100 });
    pushUnique(operations, { id: 'compare-previous', label: 'Compare Previous', kind: 'console', command: 'diff(prev, res)', priority: 95 });
    if (errors.length) pushUnique(operations, { id: 'related-errors', label: 'Related Errors', kind: 'console', command: `$errors().filter(e => (e.urlPath || e.url || '').includes(${JSON.stringify(path)}))`, priority: 90 });
  }

  if (duration(entry) > 500) {
    pushUnique(operations, { id: 'similar-calls', label: 'Similar Calls', kind: 'console', command: `$endpoint(${JSON.stringify(path)})`, priority: 82 });
    pushUnique(operations, { id: 'waterfall', label: 'Waterfall', kind: 'view', view: 'waterfall', priority: 80 });
    pushUnique(operations, { id: 'compare-previous', label: 'Compare Previous', kind: 'console', command: 'diff(prev, res)', priority: 78 });
  }

  if (Array.isArray(response) || isObjectLike(response)) {
    pushUnique(operations, { id: 'schema', label: 'Schema', kind: 'view', view: 'schema', command: 'schema(res)', priority: 75 });
    pushUnique(operations, { id: 'table', label: 'Table', kind: 'view', view: 'grid', command: 'table(res.items || res)', priority: 74 });
    pushUnique(operations, { id: 'visualize', label: 'Visualize', kind: 'view', view: 'viz', command: 'table(res.items || res)', priority: 73 });
  }

  if (hasSchemaDrift(entry, entries)) {
    pushUnique(operations, { id: 'diff', label: 'Diff', kind: 'view', view: 'diff', command: 'diff(prev, res)', priority: 88 });
    pushUnique(operations, { id: 'compare-previous', label: 'Compare Previous', kind: 'view', view: 'diff', command: 'diff(prev, res)', priority: 87 });
    pushUnique(operations, { id: 'schema', label: 'Schema', kind: 'view', view: 'schema', command: 'schema(res)', priority: 86 });
  }

  if (isLargePayload(entry, response)) {
    pushUnique(operations, { id: 'copy-full', label: 'Copy Full', kind: 'copy', lazyCommand: () => safeStringify(response, 2, 500_000), toast: 'Full response copied.', priority: 70 });
    pushUnique(operations, { id: 'schema', label: 'Schema', kind: 'view', view: 'schema', command: 'schema(res)', priority: 69 });
  }

  if (isEmptyResponse(response)) {
    pushUnique(operations, { id: 'headers', label: 'Headers', kind: 'view', view: 'headers', priority: 65 });
    pushUnique(operations, { id: 'request', label: 'Request', kind: 'view', view: 'raw', priority: 64 });
    if (samePath.length) pushUnique(operations, { id: 'similar-calls', label: 'Similar Calls', kind: 'console', command: `$endpoint(${JSON.stringify(path)})`, priority: 63 });
  }

  if (samePath.length >= 3) {
    pushUnique(operations, { id: 'similar-calls', label: 'Similar Calls', kind: 'console', command: `$endpoint(${JSON.stringify(path)})`, priority: 62 });
    pushUnique(operations, { id: 'waterfall', label: 'Waterfall', kind: 'view', view: 'waterfall', priority: 61 });
    pushUnique(operations, { id: 'slow-calls', label: 'Slow Calls', kind: 'console', command: '$slow(500)', priority: 60 });
  }

  pushUnique(operations, { id: 'copy-curl', label: 'Copy cURL', kind: 'copy', command: buildCurl(entry), toast: 'cURL copied.', priority: 45 });
  pushUnique(operations, { id: 'copy-fetch', label: 'Copy fetch', kind: 'copy', command: buildFetch(entry), toast: 'fetch snippet copied.', priority: 44 });
  pushUnique(operations, { id: 'mock', label: 'Mock', kind: 'copy', lazyCommand: () => buildMockPayload(entry), toast: 'Mock response copied.', priority: 43 });
  pushUnique(operations, { id: 'send-console', label: 'Send to Console', kind: 'console', command: 'res', priority: 43 });
  pushUnique(operations, { id: 'save-snippet', label: 'Save Snippet', kind: 'snippet', command: 'schema(res)', priority: 42 });
  pushUnique(operations, { id: 'export', label: 'Export', kind: 'export', priority: 41 });

  return operations.sort((a, b) => b.priority - a.priority).slice(0, 14);
}
