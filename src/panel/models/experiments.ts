import type {
  ExperimentCheck,
  ExperimentCheckResult,
  ExperimentEvaluation,
  ExperimentPlan,
  ExperimentRecord,
} from '../types';

export type { ExperimentCheck, ExperimentCheckResult, ExperimentEvaluation, ExperimentPlan, ExperimentRecord } from '../types';

export const MAX_EXPERIMENTS = 50;
export const MAX_PLAN_BODY = 20_000;
export const MAX_PLAN_HEADERS = 50;
export const MAX_ERROR_REASON = 500;

const REDACTED = '[REDACTED]';
const MAX_URL = 2_048;
const MAX_HEADER_NAME = 128;
const MAX_HEADER_VALUE = 1_000;
const MAX_METHOD = 12;
const MAX_VALUE_NODES = 1_000;
const MAX_VALUE_DEPTH = 6;
// Matched against the name lowercased with non-alphanumerics stripped. Long
// stems match anywhere; short synonyms only as the whole name or a key suffix,
// so `author`, `passenger` and `compass` stay readable.
const SENSITIVE_STEM = /authorization|cookie|password|passwd|passcode|secret|token|apikey|privatekey|sessionid|jwt|credential|csrf|xsrf|bearer/;
const SENSITIVE_EXACT = /^(?:pass|pwd|pin|auth|otp|sid|sig|signature)$|(?:access|client|account|signing|encryption|auth)key$/;

export function isSensitiveName(name: string): boolean {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  return SENSITIVE_STEM.test(normalized) || SENSITIVE_EXACT.test(normalized);
}
const SECRET_VALUE = /bearer\s+[^\s,;]+/gi;

let idCounter = 0;

interface ExperimentInput {
  id?: string;
  title?: unknown;
  baselineEntryId?: unknown;
  baselineId?: unknown;
  baselineUrl?: unknown;
  baseline?: { id?: unknown; url?: unknown; response?: unknown; responseDecrypted?: unknown };
  baselineEntry?: { id?: unknown; url?: unknown; response?: unknown; responseDecrypted?: unknown };
  method?: unknown;
  url?: unknown;
  headers?: unknown;
  body?: unknown;
  mockRuleId?: unknown;
  retargetAcknowledged?: boolean;
  plan?: Partial<ExperimentPlan> & { retargetAcknowledged?: boolean; acknowledgeRetarget?: boolean };
  checks?: unknown;
  expectedChecks?: unknown;
  now?: number;
  createdAt?: number;
  baselineResponse?: unknown;
}

interface ExperimentEntry {
  id?: unknown;
  status?: unknown;
  responseRaw?: unknown;
  responseDecrypted?: unknown;
  replayOf?: unknown;
  mockRuleId?: unknown;
  mocked?: unknown;
}

function modelError(code: string, message: string): Error & { code: string } {
  const error = new Error(message) as Error & { code: string };
  error.code = code;
  return error;
}

function nowOf(value: unknown, fallback = Date.now()): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function nextId(): string {
  idCounter += 1;
  return `experiment_${Date.now().toString(36)}_${idCounter.toString(36)}`;
}

function plainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function redactJwt(value: string): string {
  const tokens = /[a-z0-9_-]+/gi;
  const suffix = /eyJ[a-z0-9_-]+\.[a-z0-9_-]+/iy;
  const output: string[] = [];
  let cursor = 0;
  let token: RegExpExecArray | null;
  // Scan whole base64url runs once, rather than retrying every embedded eyJ
  // prefix when a long segment has no dot or an incomplete signature.
  while ((token = tokens.exec(value))) {
    const prefix = token[0].toLowerCase().indexOf('eyj');
    if (prefix < 0 || prefix + 3 >= token[0].length || value[tokens.lastIndex] !== '.') continue;
    suffix.lastIndex = tokens.lastIndex + 1;
    if (!suffix.exec(value)) continue;
    output.push(value.slice(cursor, token.index + prefix), REDACTED);
    cursor = suffix.lastIndex;
    tokens.lastIndex = cursor;
  }
  output.push(value.slice(cursor));
  return output.join('');
}

function redactString(value: string, limit: number): string {
  const clean = redactJwt(value.replace(SECRET_VALUE, REDACTED));
  const keys = /["']?[\w.-]+["']?/g;
  const delimiter = /\s*[:=]\s*/y;
  const secret = /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[^\s,;&]+/y;
  const output: string[] = [];
  let cursor = 0;
  let key: RegExpExecArray | null;
  // Separating token recognition from sensitive-name/delimiter checks avoids
  // overlapping wildcard retries on delimiter-free alphanumeric strings.
  while ((key = keys.exec(clean))) {
    if (!isSensitiveName(key[0])) continue;
    delimiter.lastIndex = keys.lastIndex;
    if (!delimiter.exec(clean)) continue;
    secret.lastIndex = delimiter.lastIndex;
    if (!secret.exec(clean)) continue;
    output.push(clean.slice(cursor, key.index), `${key[0]}=${REDACTED}`);
    cursor = secret.lastIndex;
    keys.lastIndex = cursor;
  }
  output.push(clean.slice(cursor));
  return output.join('').slice(0, limit);
}

interface ValueSnapshot {
  value: unknown;
  reason?: string;
}

// Count serialized punctuation, keys and scalars as well as nodes. Abandon the
// whole snapshot on budget exhaustion, rather than manufacturing equal prefixes.
function snapshotValue(value: unknown): ValueSnapshot {
  let chars = 0;
  let nodes = 0;
  let reason: string | undefined;
  const seen = new WeakSet<object>();
  function charge(count: number): void {
    chars += count;
    if (chars > MAX_PLAN_BODY) throw '[TRUNCATED]';
  }
  function string(value: string): string {
    if (value.length > MAX_PLAN_BODY) throw '[TRUNCATED]';
    const clean = redactString(value, MAX_PLAN_BODY);
    if (clean !== value || /\[(?:REDACTED|TRUNCATED|CIRCULAR|UNAVAILABLE)\]/i.test(value)) reason = 'redacted or incomplete data';
    charge(JSON.stringify(clean).length);
    return clean;
  }
  function visit(value: unknown, depth: number): unknown {
    nodes += 1;
    if (nodes > MAX_VALUE_NODES || depth > MAX_VALUE_DEPTH) throw '[TRUNCATED]';
    if (value === null || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value))) {
      charge(JSON.stringify(value).length);
      return value;
    }
    if (typeof value === 'string') return string(value);
    if (!value || typeof value !== 'object') throw '[UNAVAILABLE]';
    if (seen.has(value)) throw '[CIRCULAR]';
    const array = Array.isArray(value);
    if (!array && Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) throw '[UNAVAILABLE]';
    seen.add(value);
    charge(2);
    const output: unknown[] | Record<string, unknown> = array ? [] : {};
    if (array) {
      if (value.length > MAX_VALUE_NODES - nodes) throw '[TRUNCATED]';
      for (let index = 0; index < value.length; index += 1) {
        if (index) charge(1);
        const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
        if (!descriptor || !('value' in descriptor)) throw '[UNAVAILABLE]';
        (output as unknown[]).push(visit(descriptor.value, depth + 1));
      }
    } else {
      let count = 0;
      // Avoid Object.entries: it would allocate/read every property before the
      // budget can stop processing a wide object (including invoking getters).
      for (const key in value) {
        if (!Object.prototype.hasOwnProperty.call(value, key)) continue;
        count += 1;
        if (nodes >= MAX_VALUE_NODES || key.length > MAX_HEADER_NAME) throw '[TRUNCATED]';
        charge(JSON.stringify(key).length + 1 + (count > 1 ? 1 : 0));
        const descriptor = Object.getOwnPropertyDescriptor(value, key);
        if (!descriptor || !('value' in descriptor)) throw '[UNAVAILABLE]';
        const sensitive = isSensitiveName(key);
        if (sensitive) reason = 'redacted data';
        const item = visit(sensitive ? REDACTED : descriptor.value, depth + 1);
        Object.defineProperty(output, key, { value: item, enumerable: true });
      }
    }
    seen.delete(value);
    return Object.freeze(output);
  }
  try {
    return { value: visit(value, 0), ...(reason ? { reason } : {}) };
  } catch (marker) {
    const value = marker === '[TRUNCATED]' || marker === '[CIRCULAR]' ? marker : '[UNAVAILABLE]';
    return { value, reason: value === '[TRUNCATED]' ? 'size, node or depth budget exceeded' : value === '[CIRCULAR]' ? 'cyclic data' : 'unsupported data' };
  }
}

// Investigation authoring/persistence uses the same bounded privacy projection.
export const snapshotExperimentValue = snapshotValue;

function sanitizeUrl(value: string): string {
  const parsed = new URL(value);
  parsed.username = '';
  parsed.password = '';
  parsed.hash = '';
  for (const key of parsed.searchParams.keys()) parsed.searchParams.set(key, REDACTED);
  return parsed.toString().slice(0, MAX_URL);
}

function parseUrl(value: unknown): URL {
  if (typeof value !== 'string' || !value.trim()) throw modelError('INVALID_URL', 'Experiment URL is required.');
  let parsed: URL;
  try { parsed = new URL(value); } catch { throw modelError('INVALID_URL', 'Experiment URL is invalid.'); }
  if (!['http:', 'https:'].includes(parsed.protocol)) throw modelError('INVALID_URL', 'Experiment URL must use http or https.');
  return parsed;
}

function sanitizeHeaders(input: unknown): Record<string, string> {
  const output: Record<string, string> = {};
  if (!plainObject(input)) return output;
  for (const [key, value] of Object.entries(input).slice(0, MAX_PLAN_HEADERS)) {
    const name = key.slice(0, MAX_HEADER_NAME);
    if (!name) continue;
    const text = String(value);
    output[name] = isSensitiveName(name) ? REDACTED : redactString(text, MAX_HEADER_VALUE);
  }
  return output;
}

function sanitizePlan(input: ExperimentInput['plan'], baselineUrl: unknown): ExperimentPlan {
  const source = input || {};
  const target = parseUrl(source.url);
  const origin = parseUrl(baselineUrl);
  const acknowledged = source.retargetAcknowledged === true || source.acknowledgeRetarget === true;
  if (target.origin !== origin.origin && !acknowledged) {
    throw modelError('CROSS_ORIGIN', 'Experiment URL is cross-origin; explicitly acknowledge retargeting before arming.');
  }
  const method = typeof source.method === 'string' && source.method.trim() ? source.method.trim().toUpperCase().slice(0, MAX_METHOD) : 'GET';
  const plan: ExperimentPlan = {
    method,
    url: sanitizeUrl(target.toString()),
    headers: sanitizeHeaders(source.headers),
  };
  if (source.body !== undefined) plan.body = snapshotValue(source.body).value;
  if (typeof source.mockRuleId === 'string' && source.mockRuleId.trim()) plan.mockRuleId = source.mockRuleId.trim().slice(0, 200);
  if (acknowledged) plan.retargetAcknowledged = true;
  if (source.preserveCapturedUrl === true) plan.preserveCapturedUrl = true;
  if (source.timeoutMs !== undefined) plan.timeoutMs = Math.max(1, Math.min(120_000, Math.round(nowOf(source.timeoutMs, 30_000))));
  return plan;
}

function sanitizeChecks(input: unknown): ExperimentCheck[] {
  if (!Array.isArray(input)) return [];
  return input.slice(0, 10).flatMap((value): ExperimentCheck[] => {
    if (!plainObject(value)) return [];
    const type = value.type || value.kind;
    if (type === 'status') {
      const expected = Math.round(Number(value.expected));
      return Number.isFinite(expected) && expected >= 100 && expected <= 599 ? [{ type: 'status', expected }] : [];
    }
    if (type === 'response' || type === 'presence' || type === 'responsePresence') {
      return [{ type: 'response', expected: value.expected !== false }];
    }
    if (type === 'structural' || type === 'structure') {
      const mode = value.mode === 'contains' || value.mode === 'schema' ? value.mode : 'equal';
      return [{ type: 'structural', mode, ...(value.expected !== undefined ? { expected: snapshotValue(value.expected).value } : {}) }];
    }
    return [];
  });
}

function checkActive(records: readonly ExperimentRecord[] | undefined, baselineEntryId: string, selfId?: string): boolean {
  return Array.isArray(records) && records.some(record => record.id !== selfId && record.baselineEntryId === baselineEntryId && record.status === 'running');
}

function updated(record: ExperimentRecord, patch: Partial<ExperimentRecord>, time?: unknown): ExperimentRecord {
  return { ...record, ...patch, updatedAt: nowOf(time, record.updatedAt) };
}

export function canCreateExperiment(records: readonly ExperimentRecord[] | unknown): boolean {
  return Array.isArray(records) && records.length < MAX_EXPERIMENTS;
}

export function capExperiments(records: readonly ExperimentRecord[] | unknown): ExperimentRecord[] {
  return Array.isArray(records) ? records.slice(0, MAX_EXPERIMENTS) as ExperimentRecord[] : [];
}

export const normalizeExperiments = capExperiments;

export function hasActiveRun(records: readonly ExperimentRecord[] | unknown, baselineEntryId: string): boolean {
  return checkActive(Array.isArray(records) ? records : undefined, baselineEntryId);
}

export function createExperiment(input: ExperimentInput): ExperimentRecord {
  if (!input || typeof input !== 'object') throw modelError('INVALID_EXPERIMENT', 'Experiment input is required.');
  const baseline = input.baseline || input.baselineEntry;
  const baselineEntryId = typeof input.baselineEntryId === 'string' && input.baselineEntryId ? input.baselineEntryId : input.baselineId || baseline?.id;
  if (typeof baselineEntryId !== 'string' || !baselineEntryId) throw modelError('INVALID_BASELINE', 'A baseline entry is required.');
  const baselineUrl = input.baselineUrl ?? baseline?.url;
  const planInput = input.plan || {
    method: input.method as string,
    url: input.url as string,
    headers: input.headers as Record<string, string>,
    body: input.body,
    mockRuleId: input.mockRuleId as string,
    retargetAcknowledged: input.retargetAcknowledged,
  };
  const plan = sanitizePlan(planInput, baselineUrl);
  const timestamp = nowOf(input.now ?? input.createdAt);
  const record: ExperimentRecord = {
    id: typeof input.id === 'string' && input.id ? input.id : nextId(),
    title: typeof input.title === 'string' ? input.title.slice(0, 160) : 'Experiment',
    status: 'draft',
    baselineEntryId,
    plan,
    checks: sanitizeChecks(input.checks ?? input.expectedChecks),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  return record;
}

export function armExperiment(record: ExperimentRecord, timeOrOptions?: unknown): ExperimentRecord {
  if (record.status !== 'draft') throw modelError('INVALID_TRANSITION', `Cannot arm an experiment from ${record.status}.`);
  return updated(record, { status: 'armed' }, typeof timeOrOptions === 'object' ? (timeOrOptions as { now?: unknown })?.now : timeOrOptions);
}

export function startExperiment(record: ExperimentRecord, activeRecordsOrTime?: readonly ExperimentRecord[] | number, time?: number): ExperimentRecord {
  if (record.status !== 'armed') throw modelError('INVALID_TRANSITION', `Experiment must be armed before it can start; current status is ${record.status}.`);
  const activeRecords = Array.isArray(activeRecordsOrTime) ? activeRecordsOrTime : undefined;
  if (checkActive(activeRecords, record.baselineEntryId, record.id)) throw modelError('ACTIVE_RUN', 'Another experiment run is already active for this baseline.');
  const timestamp = Array.isArray(activeRecordsOrTime) ? time : activeRecordsOrTime;
  return updated(record, { status: 'running', startedAt: nowOf(timestamp) }, timestamp);
}

function responseValue(entry: ExperimentEntry): unknown {
  return entry.responseDecrypted != null ? entry.responseDecrypted : entry.responseRaw;
}

function responseSnapshot(entry: ExperimentEntry): ValueSnapshot {
  let value = responseValue(entry);
  if (value === undefined || value === '') return { value: undefined, reason: 'response missing' };
  if (entry.responseDecrypted == null && typeof value === 'string') {
    if (value.length > MAX_PLAN_BODY) return { value: '[TRUNCATED]', reason: 'size budget exceeded' };
    try { value = JSON.parse(value); } catch { /* Non-JSON responses remain scalar strings. */ }
  }
  return snapshotValue(value);
}

// Inputs are detached, fully validated bounded snapshots, never raw graphs.
function compareValues(expected: unknown, actual: unknown, mode: 'equal' | 'contains' | 'schema'): boolean {
  if (expected === null || actual === null) return expected === actual;
  if (typeof expected !== 'object' || typeof actual !== 'object') return mode === 'schema' ? typeof expected === typeof actual : expected === actual;
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) return false;
    if (mode === 'schema') return expected.length && actual.length ? compareValues(expected[0], actual[0], mode) : expected.length === actual.length;
    if (mode === 'contains' ? expected.length > actual.length : expected.length !== actual.length) return false;
    return expected.every((item, index) => compareValues(item, actual[index], mode));
  }
  if (Array.isArray(actual)) return false;
  const keys = Object.keys(expected as object).sort();
  if (mode !== 'contains' && keys.length !== Object.keys(actual as object).length) return false;
  return keys.every(key => Object.prototype.hasOwnProperty.call(actual, key) && compareValues((expected as Record<string, unknown>)[key], (actual as Record<string, unknown>)[key], mode));
}

function evaluateCheck(check: ExperimentCheck, entry: ExperimentEntry, baseline?: ExperimentEntry): ExperimentCheckResult {
  const response = responseValue(entry);
  if (check.type === 'status') return { type: check.type, passed: Number(entry.status) === check.expected, expected: check.expected, actual: Number(entry.status) || 0 };
  if (check.type === 'response') {
    const present = response !== undefined && response !== null && response !== '';
    return { type: check.type, passed: present === check.expected, expected: check.expected, actual: present };
  }
  const expected = check.expected !== undefined ? snapshotValue(check.expected) : baseline ? responseSnapshot(baseline) : { value: undefined, reason: 'baseline response missing' };
  const actual = responseSnapshot(entry);
  if (expected.reason || actual.reason) {
    return { type: check.type, passed: false, expected: check.mode, actual: 'unavailable', reason: `Structural comparison unavailable: ${expected.reason ? `expected ${expected.reason}` : `actual ${actual.reason}`}.` };
  }
  const passed = compareValues(expected.value, actual.value, check.mode);
  return { type: check.type, passed, expected: check.mode, actual: passed ? 'match' : 'different' };
}

export function evaluateExperiment(record: ExperimentRecord, observed: ExperimentEntry, baseline?: ExperimentEntry): ExperimentEvaluation {
  const checks = record.checks.map(check => evaluateCheck(check, observed, baseline));
  return { passed: checks.every(check => check.passed), checks };
}

export function observeExperiment(record: ExperimentRecord, entry: ExperimentEntry, time?: number): ExperimentRecord {
  if (record.status !== 'running') throw modelError('INVALID_TRANSITION', `Cannot observe an experiment from ${record.status}.`);
  if (typeof entry?.id !== 'string' || !entry.id) throw modelError('INVALID_OBSERVATION', 'Observed entry must have an id.');
  const matchesMock = typeof record.plan.mockRuleId === 'string' && entry.mockRuleId === record.plan.mockRuleId && entry.mocked === true;
  const matchesReplay = !record.plan.mockRuleId && entry.replayOf === record.baselineEntryId;
  if (!matchesMock && !matchesReplay) throw modelError('OBSERVATION_MISMATCH', 'Observed entry does not match this experiment.');
  const evaluation = evaluateExperiment(record, entry);
  return updated(record, { status: 'observed', observedEntryId: entry.id, checkResults: evaluation.checks }, time);
}

export function failExperiment(record: ExperimentRecord, reasonOrOptions?: unknown, time?: number): ExperimentRecord {
  if (record.status !== 'running') throw modelError('INVALID_TRANSITION', `Cannot fail an experiment from ${record.status}.`);
  const options = reasonOrOptions && typeof reasonOrOptions === 'object' ? reasonOrOptions as { code?: unknown; reason?: unknown; now?: unknown } : undefined;
  const reason = typeof reasonOrOptions === 'string' ? reasonOrOptions : options?.reason;
  return updated(record, { status: 'failed', errorCode: typeof options?.code === 'string' ? options.code.slice(0, 80) : 'FAILED', errorReason: String(reason || 'Experiment failed').slice(0, MAX_ERROR_REASON) }, options?.now ?? time);
}

export function cancelExperiment(record: ExperimentRecord, reasonOrOptions?: unknown, time?: number): ExperimentRecord {
  if (['observed', 'failed', 'cancelled'].includes(record.status)) throw modelError('INVALID_TRANSITION', `Cannot cancel an experiment from ${record.status}.`);
  const options = reasonOrOptions && typeof reasonOrOptions === 'object' ? reasonOrOptions as { reason?: unknown; now?: unknown } : undefined;
  const reason = typeof reasonOrOptions === 'string' ? reasonOrOptions : options?.reason;
  return updated(record, { status: 'cancelled', errorCode: 'CANCELLED', errorReason: String(reason || 'Experiment cancelled').slice(0, MAX_ERROR_REASON) }, options?.now ?? time);
}
