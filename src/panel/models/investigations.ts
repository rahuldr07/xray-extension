import type { ApiGroupingMode, ApiQuickFilter, ExperimentCheck, ExperimentPlan, SortField, SortOrder, XrayEntry } from '../types';
import { createExperiment, evaluateExperiment, snapshotExperimentValue } from './experiments';

export const MAX_INVESTIGATIONS = 25;
export const MAX_SCENARIOS = 20;
export const MAX_SCENARIO_STEPS = 20;
export const MAX_ASSERTIONS = 50;
export const MAX_SCENARIO_RUNS = 20;
export const MAX_INVESTIGATION_REFS = 500;
export const MAX_INVESTIGATION_TITLE = 160;
export const MAX_INVESTIGATION_NOTES = 4_000;

export interface EntryRef {
  entryId: string;
  sessionId: string;
  method: string;
  path: string;
  origin: string;
  status: number;
}
export type InvestigationEntryRef = EntryRef;
export interface InvestigationFilters {
  apiSearchQuery: string;
  apiQuickFilter: ApiQuickFilter;
  apiGroupingMode: ApiGroupingMode;
  methodFilters: string[];
  statusFilters: string[];
  typeFilters: string[];
  sortField: SortField;
  sortOrder: SortOrder;
}
export interface AssertionSpec {
  id: string;
  label: string;
  entryRef: EntryRef;
  check: ExperimentCheck;
}
export type AssertionOutcome = 'passed' | 'failed' | 'unavailable';
export interface AssertionResult {
  id: string;
  outcome: AssertionOutcome;
  type: ExperimentCheck['type'];
  expected: string | number | boolean;
  actual: string | number | boolean;
  reason?: string;
}
export interface ScenarioStep {
  id: string;
  label: string;
  source: EntryRef;
  plan: ExperimentPlan;
  checks: ExperimentCheck[];
}
export interface ScenarioSpec {
  id: string;
  title: string;
  steps: ScenarioStep[];
}
export interface RunSummary {
  id: string;
  scenarioId: string;
  stepId: string;
  experimentId: string;
  status: 'running' | 'passed' | 'failed' | 'unavailable' | 'cancelled' | 'interrupted';
  startedAt: number;
  finishedAt?: number;
  observedEntryId?: string;
  results: AssertionResult[];
  reason?: string;
}
export interface SavedInvestigation {
  id: string;
  title: string;
  notes: string;
  sourceSessionId: string;
  createdAt: number;
  updatedAt: number;
  entryRefs: EntryRef[];
  selectedEntryId: string | null;
  pinnedEntryIds: string[];
  compareLeftId: string | null;
  compareRightId: string | null;
  filters: InvestigationFilters;
  findingIds: string[];
  assertions: AssertionSpec[];
  scenarios: ScenarioSpec[];
  runs: RunSummary[];
}
export interface InvestigationStore {
  schemaVersion: 1;
  investigations: SavedInvestigation[];
}
export interface CreateInvestigationInput {
  sessionId: string;
  entries: readonly XrayEntry[];
  selectedId?: string | null;
  pinnedIds?: Iterable<string>;
  compareLeftId?: string | null;
  compareRightId?: string | null;
  filters?: unknown;
  findingIds?: Iterable<string>;
  title?: string;
  notes?: string;
  now?: number;
}

let counter = 0;
function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}`;
}

// Persisted data is never spread/read through accessors. These helpers project
// known own data properties, including array slots, before calling experiments.
export function ownValue(value: unknown, key: string): unknown {
  if (!value || typeof value !== 'object') return undefined;
  try {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor && 'value' in descriptor ? descriptor.value : undefined;
  } catch { return undefined; }
}

function hasAccessor(value: unknown, key: string): boolean {
  if (!value || typeof value !== 'object') return false;
  try { const descriptor = Object.getOwnPropertyDescriptor(value, key); return !!descriptor && !('value' in descriptor); } catch { return true; }
}

export function dataRecord(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  try { return Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null; } catch { return false; }
}

export function boundedItems(value: unknown, limit: number, newest = false): unknown[] {
  if (!Array.isArray(value)) return [];
  const length = ownValue(value, 'length');
  if (typeof length !== 'number') return [];
  const output: unknown[] = [];
  const start = newest ? Math.max(0, length - limit) : 0;
  for (let index = start; index < Math.min(length, start + limit); index += 1) output.push(ownValue(value, String(index)));
  return output;
}

export function cleanText(value: unknown, limit: number, fallback = ''): string {
  if (typeof value !== 'string') return fallback;
  // Free-form text can include URLs: their query values/userinfo are never facts.
  // Slice to the caller's limit first: the snapshot budget charges JSON escapes, so
  // escape-heavy text near 20k would otherwise collapse to a bare [TRUNCATED].
  let text = value.slice(0, limit).replace(/https?:\/\/[^\s<>"']+/gi, url => {
    try { return createExperiment({ id: 'projection', baselineEntryId: 'projection', baselineUrl: url, plan: { url, method: 'GET', headers: {} } }).plan.url; } catch { return '[UNAVAILABLE]'; }
  });
  let clean = String(snapshotExperimentValue(text).value);
  while (clean === '[TRUNCATED]' && text.length > 1) {
    text = text.slice(0, Math.floor(text.length / 2));
    clean = String(snapshotExperimentValue(text).value);
  }
  return clean.slice(0, limit);
}

export function safeId(value: unknown): string {
  if (typeof value !== 'string' || !value || value.length > 200) return '';
  const clean = cleanText(value, 200);
  return clean === value && !/\[(?:REDACTED|TRUNCATED|CIRCULAR|UNAVAILABLE)\]/i.test(clean) ? clean : '';
}

function dataMethod(value: unknown, key: PropertyKey): ((...args: unknown[]) => unknown) | null {
  try {
    let current = value;
    for (let depth = 0; current && typeof current === 'object' && depth < 6; depth += 1) {
      const descriptor = Object.getOwnPropertyDescriptor(current, key);
      if (descriptor) return 'value' in descriptor && typeof descriptor.value === 'function' ? descriptor.value : null;
      current = Object.getPrototypeOf(current);
    }
  } catch { /* Invalid iteration metadata is inert. */ }
  return null;
}

export function stringIds(value: unknown, limit: number, allowIterable = false): string[] {
  let items = boundedItems(value, limit);
  if (!Array.isArray(value) && (value instanceof Set || allowIterable)) {
    items = [];
    try {
      const iterate = dataMethod(value, Symbol.iterator);
      const iterator = iterate?.call(value);
      const next = dataMethod(iterator, 'next');
      if (next) for (let index = 0; index < limit; index += 1) {
        const item = next.call(iterator);
        if (ownValue(item, 'done') === true) break;
        items.push(ownValue(item, 'value'));
      }
    } catch { /* A malformed iterable cannot break creation or persistence. */ }
  }
  return [...new Set(items.map(safeId).filter(Boolean))];
}

export function normalizeFilters(value: unknown): InvestigationFilters {
  const quick = ownValue(value, 'apiQuickFilter');
  const sort = ownValue(value, 'sortField');
  return {
    apiSearchQuery: cleanText(ownValue(value, 'apiSearchQuery'), 500),
    apiQuickFilter: typeof quick === 'string' && ['all', 'errors', 'slow', 'repeated', 'pinned', 'large', 'empty', 'drift', 'graphql', 'ws', 'mocked', 'replayed'].includes(quick) ? quick as ApiQuickFilter : 'all',
    apiGroupingMode: ownValue(value, 'apiGroupingMode') === 'flat' ? 'flat' : 'endpoint',
    methodFilters: stringIds(ownValue(value, 'methodFilters'), 20).filter(item => /^[A-Z]{1,12}$/.test(item)),
    statusFilters: stringIds(ownValue(value, 'statusFilters'), 10).filter(item => ['2xx', '3xx', '4xx', '5xx', 'other'].includes(item)),
    typeFilters: stringIds(ownValue(value, 'typeFilters'), 10).filter(item => ['fetch', 'xhr', 'ws', 'sse'].includes(item)),
    sortField: typeof sort === 'string' && ['timestamp', 'method', 'status', 'url', 'duration', 'size'].includes(sort) ? sort as SortField : 'timestamp',
    sortOrder: ownValue(value, 'sortOrder') === 'asc' ? 'asc' : 'desc',
  };
}

export function makeEntryRef(entry: XrayEntry, sessionId: string): EntryRef {
  const entryId = safeId(ownValue(entry, 'id'));
  const session = safeId(sessionId);
  if (!entryId || !session) throw new Error('Entry and session IDs are required.');
  let origin = '';
  let path = cleanText(ownValue(entry, 'urlPath'), 2_048).split(/[?#]/)[0];
  const url = ownValue(entry, 'url');
  if (typeof url === 'string') {
    try {
      const parsed = new URL(url);
      if (['http:', 'https:'].includes(parsed.protocol)) {
        origin = parsed.origin;
        path = cleanText(parsed.pathname, 2_048);
      }
    } catch { /* Unavailable URL metadata does not change reference identity. */ }
  }
  const status = ownValue(entry, 'status');
  return { entryId, sessionId: session, method: cleanText(ownValue(entry, 'method'), 12, 'GET').toUpperCase(), path, origin, status: typeof status === 'number' && Number.isInteger(status) && status >= 0 && status <= 599 ? status : 0 };
}

export function resolveEntryRef(ref: EntryRef | unknown, sessionId: string, entries: readonly XrayEntry[]): XrayEntry | null {
  const id = safeId(ownValue(ref, 'entryId'));
  const sourceSessionId = safeId(ownValue(ref, 'sessionId'));
  if (!id || !sourceSessionId || sourceSessionId !== safeId(sessionId)) return null;
  for (const entry of boundedItems(entries, 5_000)) if (ownValue(entry, 'id') === id) return entry as XrayEntry;
  return null;
}

export function normalizeCheck(value: unknown): ExperimentCheck | null {
  if (!dataRecord(value)) return null;
  const type = ownValue(value, 'type');
  const expected = ownValue(value, 'expected');
  const mode = ownValue(value, 'mode');
  if (type !== 'status' && type !== 'response' && type !== 'structural') return null;
  if (type === 'status' && (typeof expected !== 'number' || !Number.isInteger(expected) || expected < 100 || expected > 599)) return null;
  if (type === 'response' && typeof expected !== 'boolean') return null;
  if (type === 'structural' && hasAccessor(value, 'expected')) return { type, mode: mode === 'contains' || mode === 'schema' ? mode : 'equal', expected: '[UNAVAILABLE]' };
  const check = { type, expected, mode };
  return createExperiment({ id: 'projection', baselineEntryId: 'projection', baselineUrl: 'https://projection.invalid/', plan: { method: 'GET', url: 'https://projection.invalid/', headers: {} }, checks: [check] }).checks[0] || null;
}

function responseBaseline(entry: unknown): unknown {
  let value = ownValue(entry, 'responseDecrypted') ?? ownValue(entry, 'responseRaw');
  if (value === undefined || value === '') return '[UNAVAILABLE]';
  if (ownValue(entry, 'responseDecrypted') == null && typeof value === 'string' && value.length <= 20_000) {
    try { value = JSON.parse(value); } catch { /* Scalar text uses shared sanitization. */ }
  }
  return snapshotExperimentValue(value).value;
}

export function createAssertion(entry: XrayEntry, sessionId: string, check: ExperimentCheck, label?: string): AssertionSpec {
  const normalized = normalizeCheck(check);
  if (!normalized) throw new Error('A valid assertion check is required.');
  if (normalized.type === 'structural' && normalized.expected === undefined) normalized.expected = responseBaseline(entry);
  return { id: nextId('assertion'), label: cleanText(label, MAX_INVESTIGATION_TITLE, `${normalized.type} check`), entryRef: makeEntryRef(entry, sessionId), check: normalized };
}

function unavailable(spec: AssertionSpec, reason: string): AssertionResult {
  const check = spec.check;
  return { id: spec.id, type: check.type, outcome: 'unavailable', expected: check.type === 'structural' ? check.mode : check.expected, actual: 'unavailable', reason };
}

export function evaluateAssertions(specs: readonly AssertionSpec[], entry: XrayEntry | null | unknown, baseline?: XrayEntry): AssertionResult[] {
  const results: AssertionResult[] = [];
  for (const value of boundedItems(specs, MAX_ASSERTIONS)) {
    const id = safeId(ownValue(value, 'id'));
    const check = normalizeCheck(ownValue(value, 'check'));
    if (!id || !check) continue;
    const spec = { id, check } as AssertionSpec;
    if (!dataRecord(entry)) { results.push(unavailable(spec, 'Observed entry unavailable.')); continue; }
    if (check.type !== 'status' && (hasAccessor(entry, 'responseRaw') || hasAccessor(entry, 'responseDecrypted'))) { results.push(unavailable(spec, 'Observed response unavailable.')); continue; }
    const status = ownValue(entry, 'status');
    if (check.type === 'status' && (typeof status !== 'number' || !Number.isInteger(status) || status < 100 || status > 599)) { results.push(unavailable(spec, 'Observed status unavailable.')); continue; }
    // Structural data flows directly to the bounded snapshotter through safe own
    // properties; no full-entry copy or arbitrary payload getter is evaluated.
    const observed = { status, responseRaw: ownValue(entry, 'responseRaw'), responseDecrypted: ownValue(entry, 'responseDecrypted') };
    const source = baseline ? { responseRaw: ownValue(baseline, 'responseRaw'), responseDecrypted: ownValue(baseline, 'responseDecrypted') } : undefined;
    const record = createExperiment({ id: 'evaluation', baselineEntryId: 'projection', baselineUrl: 'https://projection.invalid/', plan: { method: 'GET', url: 'https://projection.invalid/', headers: {} }, checks: [check] });
    const result = evaluateExperiment(record, observed, source).checks[0];
    results.push({ id, type: result.type, outcome: result.reason ? 'unavailable' : result.passed ? 'passed' : 'failed', expected: result.expected as AssertionResult['expected'], actual: result.actual as AssertionResult['actual'], ...(result.reason ? { reason: result.reason } : {}) });
  }
  return results;
}

export function createInvestigation(input: CreateInvestigationInput): SavedInvestigation {
  const sourceSessionId = safeId(ownValue(input, 'sessionId'));
  if (!sourceSessionId) throw new Error('A session ID is required.');
  const selectedEntryId = safeId(ownValue(input, 'selectedId')) || null;
  const pinnedEntryIds = stringIds(ownValue(input, 'pinnedIds'), MAX_INVESTIGATION_REFS, true);
  const compareLeftId = safeId(ownValue(input, 'compareLeftId')) || null;
  const compareRightId = safeId(ownValue(input, 'compareRightId')) || null;
  const wanted = new Set([selectedEntryId, compareLeftId, compareRightId, ...pinnedEntryIds].filter(Boolean));
  const entryRefs: EntryRef[] = [];
  for (const entry of boundedItems(ownValue(input, 'entries'), 5_000)) {
    const id = safeId(ownValue(entry, 'id'));
    if (!wanted.has(id) || entryRefs.length >= MAX_INVESTIGATION_REFS) continue;
    wanted.delete(id);
    entryRefs.push(makeEntryRef(entry as XrayEntry, sourceSessionId));
  }
  const now = ownValue(input, 'now');
  const timestamp = typeof now === 'number' && Number.isFinite(now) && now >= 0 ? now : Date.now();
  return { id: nextId('investigation'), title: cleanText(ownValue(input, 'title'), MAX_INVESTIGATION_TITLE, 'Investigation'), notes: cleanText(ownValue(input, 'notes'), MAX_INVESTIGATION_NOTES), sourceSessionId, createdAt: timestamp, updatedAt: timestamp, entryRefs, selectedEntryId, pinnedEntryIds, compareLeftId, compareRightId, filters: normalizeFilters(ownValue(input, 'filters')), findingIds: stringIds(ownValue(input, 'findingIds'), 100, true), assertions: [], scenarios: [], runs: [] };
}

export function normalizeScenarioPlan(value: unknown, baselineUrl: string, preserveCapturedUrl = false): ExperimentPlan {
  const target = ownValue(value, 'url');
  const mockRuleId = ownValue(value, 'mockRuleId');
  if (target !== undefined && typeof target !== 'string') throw new Error('Invalid plan URL.');
  if (mockRuleId !== undefined && !safeId(mockRuleId)) throw new Error('Invalid plan mock rule ID.');
  const headers = snapshotExperimentValue(ownValue(value, 'headers')).value;
  const projected: Record<string, string> = {};
  if (dataRecord(headers)) {
    for (const key of Object.keys(headers as object).slice(0, 50)) {
      const item = ownValue(headers, key);
      if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') Object.defineProperty(projected, key, { value: String(item), enumerable: true });
    }
  }
  const body = ownValue(value, 'body');
  const plan = createExperiment({ id: 'projection', baselineEntryId: 'projection', baselineUrl, plan: {
    method: typeof ownValue(value, 'method') === 'string' ? ownValue(value, 'method') as string : 'GET',
    url: typeof ownValue(value, 'url') === 'string' ? ownValue(value, 'url') as string : baselineUrl,
    headers: projected,
    ...(body !== undefined ? { body: snapshotExperimentValue(body).value } : {}),
    mockRuleId: safeId(mockRuleId) || undefined,
    retargetAcknowledged: ownValue(value, 'retargetAcknowledged') === true,
    ...(typeof ownValue(value, 'timeoutMs') === 'number' ? { timeoutMs: ownValue(value, 'timeoutMs') as number } : {}),
  } }).plan;
  if (preserveCapturedUrl) plan.preserveCapturedUrl = true;
  return plan;
}

export function createScenario(investigation: SavedInvestigation, entry: XrayEntry, plan?: Partial<ExperimentPlan>, checks?: ExperimentCheck[]): ScenarioSpec {
  for (const key of ['method', 'url', 'headers', 'body', 'mockRuleId', 'retargetAcknowledged', 'timeoutMs']) if (hasAccessor(plan, key)) throw new Error('Invalid plan accessor.');
  if (boundedItems(ownValue(investigation, 'scenarios'), MAX_SCENARIOS).length >= MAX_SCENARIOS) throw new Error('Scenario limit is 20.');
  const sessionId = safeId(ownValue(investigation, 'sourceSessionId'));
  const source = makeEntryRef(entry, sessionId);
  const url = ownValue(entry, 'url');
  if (typeof url !== 'string') throw new Error('Source URL unavailable.');
  const requested = ownValue(plan, 'url');
  const projected = {
    method: ownValue(plan, 'method') ?? ownValue(entry, 'method'),
    url: requested === undefined ? url : requested,
    headers: ownValue(plan, 'headers') ?? ownValue(entry, 'requestHeaders'),
    body: ownValue(plan, 'body') === undefined ? ownValue(entry, 'requestBody') : ownValue(plan, 'body'),
    mockRuleId: ownValue(plan, 'mockRuleId'),
    retargetAcknowledged: ownValue(plan, 'retargetAcknowledged'),
    timeoutMs: ownValue(plan, 'timeoutMs'),
  };
  const safePlan = normalizeScenarioPlan(projected, url, requested === undefined || requested === url);
  const defaultChecks: ExperimentCheck[] = [{ type: 'status', expected: source.status >= 100 ? source.status : 200 }, { type: 'response', expected: true }];
  const safeChecks = boundedItems(checks ?? defaultChecks, 10).flatMap(value => {
    const clean = normalizeCheck(value);
    return clean ? [createAssertion(entry, sessionId, clean).check] : [];
  });
  return { id: nextId('scenario'), title: 'Reproduce request', steps: [{ id: nextId('step'), label: `${source.method} ${source.path}`, source, plan: safePlan, checks: safeChecks }] };
}
