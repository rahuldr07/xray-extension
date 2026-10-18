import type { XrayEntry } from '../types';
import { entryRequest, entryResponse, safeStringify } from '../utils';
import { requestBody, responseBody } from './capturedBody';
import { LosslessNumber } from './jsonText';

export interface ComparisonOptions {
  /** Maximum structural changes retained in any section. */
  maxDifferences?: number;
  /**
   * A body longer than this many characters reads as truncated. Unset by default: a body is
   * truncated when its capture or the saved session says so (metadata, spec J6/J9), whatever its length.
   */
  maxBodyChars?: number;
  /** Maximum object/array depth walked for structural evidence. */
  maxDepth?: number;
}

export interface ComparisonValue<T = unknown> {
  left: T | undefined;
  right: T | undefined;
  equal: boolean | null;
  changed: boolean | null;
}

export interface StructuralChange {
  path: string;
  kind: 'added' | 'removed' | 'changed';
  before?: unknown;
  after?: unknown;
}

export interface ComparisonSection {
  left: unknown;
  right: unknown;
  equal: boolean | null;
  changed: boolean | null;
  differences: StructuralChange[];
  notices: string[];
}

export interface ComparisonIdentity {
  equal: boolean;
  changed: boolean;
  fields: Record<string, ComparisonValue>;
  differences: StructuralChange[];
  notices: string[];
}

export interface ComparisonResult {
  identity: ComparisonIdentity;
  status: ComparisonValue<number | undefined>;
  timing: ComparisonValue<number | undefined>;
  size: ComparisonValue<number | undefined>;
  requestHeaders: ComparisonSection;
  requestBody: ComparisonSection;
  responseHeaders: ComparisonSection;
  responseBody: ComparisonSection;
  notices: string[];
}

const DEFAULT_MAX_DIFFERENCES = 200;
const DEFAULT_MAX_DEPTH = 8;
const REDACTED = '[redacted]';

function scalar<T>(left: T | undefined, right: T | undefined): ComparisonValue<T> {
  const equal = Object.is(left, right);
  return { left, right, equal, changed: !equal };
}

/** An object or array to walk. A LosslessNumber (an integer past 2^53 kept as written) is a number. */
function isObject(value: unknown): value is object {
  return value !== null && typeof value === 'object' && !(value instanceof LosslessNumber);
}

/** Scalars: Object.is, and a LosslessNumber by its lexeme, so 9007199254740992 and …993 differ. */
function sameScalar(left: unknown, right: unknown): boolean {
  if (left instanceof LosslessNumber || right instanceof LosslessNumber) {
    return left instanceof LosslessNumber && right instanceof LosslessNumber && left.raw === right.raw;
  }
  return Object.is(left, right);
}

function isRedacted(value: unknown): boolean {
  return typeof value === 'string' && value.trim().toLowerCase() === REDACTED;
}

function containsRedacted(value: unknown, seen = new Set<object>()): boolean {
  if (isRedacted(value)) return true;
  if (!isObject(value)) return false;
  if (seen.has(value)) return false;
  seen.add(value);
  if (Array.isArray(value)) return value.some((item) => containsRedacted(item, seen));
  return Object.values(value).some((item) => containsRedacted(item, seen));
}

function containsCycle(value: unknown, ancestors: object[] = [], seen = new Set<object>()): boolean {
  if (!isObject(value)) return false;
  if (ancestors.includes(value)) return true;
  if (seen.has(value)) return false;
  seen.add(value);
  const next = [...ancestors, value];
  if (Array.isArray(value)) return value.some((item) => containsCycle(item, next, seen));
  return Object.values(value).some((item) => containsCycle(item, next, seen));
}

function snapshot(value: unknown, depth = 0, ancestors: object[] = []): unknown {
  if (!isObject(value)) return value;
  if (ancestors.includes(value)) return '[Circular]';
  if (depth >= DEFAULT_MAX_DEPTH) return '[Depth limited]';
  const nextAncestors = [...ancestors, value];
  if (Array.isArray(value)) return value.slice(0, 50).map((item) => snapshot(item, depth + 1, nextAncestors));
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(value).sort()) out[key] = snapshot((value as Record<string, unknown>)[key], depth + 1, nextAncestors);
  return out;
}

function printable(value: unknown): unknown {
  if (!isObject(value)) return value;
  return safeStringify(value, 0, 2_000);
}

interface WalkState {
  differences: StructuralChange[];
  notices: string[];
  maxDifferences: number;
  maxDepth: number;
  cycleNoted: Set<string>;
}

function noticeOnce(state: WalkState, notice: string): void {
  if (!state.notices.includes(notice)) state.notices.push(notice);
}

function walk(left: unknown, right: unknown, path: string, depth: number, state: WalkState, leftAncestors: object[], rightAncestors: object[]): void {
  if (state.differences.length >= state.maxDifferences) return;
  if (left === undefined && right === undefined) return;
  if (left === undefined) {
    state.differences.push({ path, kind: 'added', after: printable(right) });
    return;
  }
  if (right === undefined) {
    state.differences.push({ path, kind: 'removed', before: printable(left) });
    return;
  }
  if (isRedacted(left) || isRedacted(right)) {
    noticeOnce(state, `Redacted value unavailable at ${path || '(root)'}`);
    return;
  }
  if (isObject(left) && leftAncestors.includes(left)) {
    if (!state.cycleNoted.has('left')) {
      state.cycleNoted.add('left');
      noticeOnce(state, 'Cyclic value unavailable on left');
    }
    return;
  }
  if (isObject(right) && rightAncestors.includes(right)) {
    if (!state.cycleNoted.has('right')) {
      state.cycleNoted.add('right');
      noticeOnce(state, 'Cyclic value unavailable on right');
    }
    return;
  }
  const leftIsObject = isObject(left);
  const rightIsObject = isObject(right);
  if (!leftIsObject || !rightIsObject) {
    if (!sameScalar(left, right)) state.differences.push({ path, kind: 'changed', before: printable(left), after: printable(right) });
    return;
  }
  if (depth >= state.maxDepth) {
    if (safeStringify(left, 0, 2_000) !== safeStringify(right, 0, 2_000)) {
      state.differences.push({ path, kind: 'changed', before: printable(left), after: printable(right) });
    }
    noticeOnce(state, `Structural comparison depth limited at ${path || '(root)'}`);
    return;
  }
  if (Array.isArray(left) !== Array.isArray(right)) {
    state.differences.push({ path, kind: 'changed', before: printable(left), after: printable(right) });
    return;
  }

  const nextLeft = [...leftAncestors, left];
  const nextRight = [...rightAncestors, right];
  if (Array.isArray(left) && Array.isArray(right)) {
    const length = Math.max(left.length, right.length);
    for (let index = 0; index < Math.min(length, 50); index += 1) {
      walk(left[index], right[index], `${path}[${index}]`, depth + 1, state, nextLeft, nextRight);
    }
    if (length > 50) noticeOnce(state, `Array comparison limited to 50 items at ${path || '(root)'}`);
    return;
  }
  const keys = Array.from(new Set([...Object.keys(left), ...Object.keys(right)])).sort();
  const leftRecord = left as Record<string, unknown>;
  const rightRecord = right as Record<string, unknown>;
  for (const key of keys) {
    walk(leftRecord[key], rightRecord[key], path ? `${path}.${key}` : key, depth + 1, state, nextLeft, nextRight);
  }
}

function section(
  label: string,
  left: unknown,
  right: unknown,
  options: Required<Pick<ComparisonOptions, 'maxDifferences' | 'maxDepth'>>,
  missing: { left: boolean; right: boolean } = { left: false, right: false },
  truncated: { left: boolean; right: boolean } = { left: false, right: false },
): ComparisonSection {
  const notices: string[] = [];
  // Absent on both sides is a like-for-like match (e.g. two bodiless GETs), not unavailable evidence.
  if (missing.left && !missing.right) notices.push(`${label} missing on left`);
  if (missing.right && !missing.left) notices.push(`${label} missing on right`);
  if (truncated.left) notices.push(`${label} truncated on left`);
  if (truncated.right) notices.push(`${label} truncated on right`);
  if (containsRedacted(left)) notices.push(`${label} contains redacted values; unavailable for comparison`);
  if (containsRedacted(right)) notices.push(`${label} contains redacted values; unavailable for comparison`);
  if (containsCycle(left)) notices.push(`${label} contains cyclic values; unavailable for comparison`);
  if (containsCycle(right)) notices.push(`${label} contains cyclic values; unavailable for comparison`);

  const state: WalkState = { differences: [], notices, maxDifferences: options.maxDifferences, maxDepth: options.maxDepth, cycleNoted: new Set() };
  walk(left, right, '', 0, state, [], []);
  const unavailable = state.notices.some((notice) => /redacted|cyclic|truncated|missing|limited/i.test(notice));
  const equal = state.differences.length === 0 && !unavailable ? true : state.differences.length > 0 ? false : null;
  return {
    left: snapshot(left),
    right: snapshot(right),
    equal,
    changed: equal === null ? null : !equal,
    differences: state.differences,
    notices: state.notices,
  };
}

function body(entry: XrayEntry, request: boolean, maxChars: number): { value: unknown; missing: boolean; truncated: boolean } {
  // The body as captured (capturedBody.ts): a JSON `null` or `false` request body is a body (J4); a
  // cut is metadata from capture or the saved session, or an imported entry's in-band suffix, read
  // back there (J6, J9). The length alone says nothing: a saved session keeps long bodies whole.
  const captured = request ? requestBody(entry) : responseBody(entry);
  const missing = captured.kind === 'none' || (captured.kind === 'text' && captured.text === '');
  let truncated = !!captured.truncation;
  if (!truncated && Number.isFinite(maxChars)) {
    const size = captured.kind === 'text' ? captured.text.length
      : captured.kind === 'value' ? safeStringify(captured.value, 0, maxChars + 1).length : 0;
    truncated = size > maxChars;
  }
  return { value: request ? entryRequest(entry) : entryResponse(entry), missing, truncated };
}

function finiteNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function identityFor(entry: XrayEntry, other: XrayEntry): ComparisonIdentity {
  const fields: Record<string, ComparisonValue> = {};
  const values: Record<string, string | undefined> = {
    method: entry.method ? String(entry.method).toUpperCase() : undefined,
    url: entry.url,
    urlPath: entry.urlPath,
    source: entry.source,
    graphql: entry.graphql ? `${entry.graphql.operationType}:${entry.graphql.operationName}` : undefined,
  };
  const otherValues: Record<string, string | undefined> = {
    method: other.method ? String(other.method).toUpperCase() : undefined,
    url: other.url,
    urlPath: other.urlPath,
    source: other.source,
    graphql: other.graphql ? `${other.graphql.operationType}:${other.graphql.operationName}` : undefined,
  };
  for (const key of ['method', 'url', 'urlPath', 'source', 'graphql']) fields[key] = scalar(values[key], otherValues[key]);
  const differences = Object.entries(fields)
    .filter(([, value]) => value.changed)
    .map(([path, value]) => ({ path, kind: 'changed' as const, before: value.left, after: value.right }));
  return { fields, differences, notices: [], equal: differences.length === 0, changed: differences.length > 0 };
}

export function compareEntries(left: XrayEntry, right: XrayEntry, options: ComparisonOptions = {}): ComparisonResult {
  const maxDifferences = Math.max(1, Math.floor(options.maxDifferences ?? DEFAULT_MAX_DIFFERENCES));
  const maxBodyChars = options.maxBodyChars === undefined ? Infinity : Math.max(1, Math.floor(options.maxBodyChars));
  const maxDepth = Math.max(1, Math.floor(options.maxDepth ?? DEFAULT_MAX_DEPTH));
  const sectionOptions = { maxDifferences, maxDepth };
  const leftRequest = body(left, true, maxBodyChars);
  const rightRequest = body(right, true, maxBodyChars);
  const leftResponse = body(left, false, maxBodyChars);
  const rightResponse = body(right, false, maxBodyChars);
  const requestHeaders = section('Request headers', left.requestHeaders, right.requestHeaders, sectionOptions);
  const requestBody = section('Request body', leftRequest.value, rightRequest.value, sectionOptions, { left: leftRequest.missing, right: rightRequest.missing }, { left: leftRequest.truncated, right: rightRequest.truncated });
  const responseHeaders = section('Response headers', left.responseHeaders, right.responseHeaders, sectionOptions);
  const responseBody = section('Response body', leftResponse.value, rightResponse.value, sectionOptions, { left: leftResponse.missing, right: rightResponse.missing }, { left: leftResponse.truncated, right: rightResponse.truncated });
  const result: ComparisonResult = {
    identity: identityFor(left, right),
    status: scalar(finiteNumber(left.status), finiteNumber(right.status)),
    timing: scalar(finiteNumber(left.duration ?? left.timing?.totalMs), finiteNumber(right.duration ?? right.timing?.totalMs)),
    size: scalar(finiteNumber(left.size), finiteNumber(right.size)),
    requestHeaders,
    requestBody,
    responseHeaders,
    responseBody,
    notices: [],
  };
  for (const item of [requestHeaders, requestBody, responseHeaders, responseBody]) {
    for (const notice of item.notices) if (!result.notices.includes(notice)) result.notices.push(notice);
  }
  return result;
}
