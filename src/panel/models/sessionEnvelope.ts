import type { RuntimeHealth, RuntimeHealthState, SessionEnvelope, SessionSource, XrayEntry } from '../types';
import { deserializeSessionEntries, serializeSessionEntries, upgradeLegacyEntry } from './sessionStore';

/** 2 (spec J9): bodies saved as text with truncation metadata, logs in the typed model. */
export const SESSION_SCHEMA_VERSION = 2 as const;

const RUNTIME_STATES: RuntimeHealthState[] = ['unknown', 'healthy', 'degraded', 'unavailable'];
const MAX_METADATA_CHARS = 200;
const MAX_ERROR_CODE_CHARS = 80;

export interface SessionEnvelopeOptions {
  sessionId?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
  now?: unknown;
  source?: unknown;
  entries?: unknown;
  runtime?: unknown;
}

export interface RuntimeHealthUpdate {
  health?: unknown;
  captureRouteState?: unknown;
  captureRoute?: unknown;
  workerState?: unknown;
  worker?: unknown;
  lastEventAt?: unknown;
  lastErrorCode?: unknown;
  accepted?: unknown;
  dropped?: unknown;
  acceptedCount?: unknown;
  droppedCount?: unknown;
}

export interface SessionSummary {
  entryCount: number;
  apiCount: number;
  logCount: number;
  lastEntryAt: number | null;
}

function finiteTimestamp(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback;
}

function boundedString(value: unknown, max: number): string | undefined {
  if (typeof value !== 'string' || !value) return undefined;
  return value.slice(0, max);
}

function sanitizeOrigin(value: unknown): string | undefined {
  const text = boundedString(value, MAX_METADATA_CHARS);
  if (!text) return undefined;
  try {
    const url = new URL(text);
    if (url.origin === 'null') return undefined;
    return url.origin;
  } catch {
    return undefined;
  }
}

function sanitizeSource(value: unknown): SessionSource {
  if (!value || typeof value !== 'object') return {};
  const source = value as Record<string, unknown>;
  const origin = sanitizeOrigin(source.origin ?? source.url);
  const title = boundedString(source.title, MAX_METADATA_CHARS);
  return {
    ...(origin ? { origin } : {}),
    ...(title ? { title } : {}),
  };
}

function sanitizeState(value: unknown, fallback: RuntimeHealthState): RuntimeHealthState {
  return typeof value === 'string' && RUNTIME_STATES.includes(value as RuntimeHealthState)
    ? value as RuntimeHealthState
    : fallback;
}

function sanitizeErrorCode(value: unknown): string | null {
  if (typeof value !== 'string' || !value || value.length > MAX_ERROR_CODE_CHARS) return null;
  return /^[A-Za-z0-9_.-]+$/.test(value) ? value : null;
}

function nonNegativeCount(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : fallback;
}

function sanitizeRuntime(value: unknown): RuntimeHealth {
  const runtime = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const lastEventAt = finiteTimestamp(runtime.lastEventAt, -1);
  return {
    health: sanitizeState(runtime.health, 'unknown'),
    captureRouteState: sanitizeState(runtime.captureRouteState ?? runtime.captureRoute, 'unknown'),
    workerState: sanitizeState(runtime.workerState ?? runtime.worker, 'unknown'),
    lastEventAt: lastEventAt < 0 ? null : lastEventAt,
    lastErrorCode: sanitizeErrorCode(runtime.lastErrorCode),
    acceptedCount: nonNegativeCount(runtime.acceptedCount),
    droppedCount: nonNegativeCount(runtime.droppedCount),
  };
}

function newSessionId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  } catch {
    // Fall through to a non-secret local identifier when crypto is unavailable.
  }
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Bounded entries in the stored form (sessionStore.ts): what a write sends to chrome.storage. */
function boundedEntries(value: unknown): XrayEntry[] {
  return serializeSessionEntries(deserializeSessionEntries(value));
}

export function summarizeSessionEntries(entries: XrayEntry[]): SessionSummary {
  const safeEntries = Array.isArray(entries) ? entries : [];
  const timestamps = safeEntries
    .map((entry) => finiteTimestamp(entry?.timestamp, -1))
    .filter((timestamp) => timestamp >= 0);
  return {
    entryCount: safeEntries.length,
    apiCount: safeEntries.filter((entry) => entry?.type === 'api').length,
    logCount: safeEntries.filter((entry) => entry?.type === 'log').length,
    lastEntryAt: timestamps.length ? Math.max(...timestamps) : null,
  };
}

function sessionOptions(options: SessionEnvelopeOptions = {}): Required<Pick<SessionEnvelopeOptions, 'now'>> & SessionEnvelopeOptions {
  const now = finiteTimestamp(options.now, Date.now());
  return { ...options, now };
}

/** The envelope as written: entries bounded, in the stored form (sessionStore.ts). */
export function createSessionEnvelope(options: SessionEnvelopeOptions = {}): SessionEnvelope {
  const normalized = sessionOptions(options);
  const createdAt = finiteTimestamp(normalized.createdAt, normalized.now as number);
  const updatedAt = finiteTimestamp(normalized.updatedAt, createdAt);
  const entries = boundedEntries(normalized.entries);
  const summary = summarizeSessionEntries(entries);
  return {
    schemaVersion: SESSION_SCHEMA_VERSION,
    sessionId: boundedString(normalized.sessionId, MAX_METADATA_CHARS) || newSessionId(),
    createdAt,
    updatedAt,
    source: sanitizeSource(normalized.source),
    ...summary,
    entries,
    runtime: sanitizeRuntime(normalized.runtime),
  };
}

export function migrateSessionEnvelope(value: unknown, options: SessionEnvelopeOptions = {}): SessionEnvelope {
  const normalized = sessionOptions(options);
  const input = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
  const legacyEntries = Array.isArray(value)
    ? value
    : input && Array.isArray(input.entries)
      ? input.entries
      : input && Array.isArray(input.session_entries)
        ? input.session_entries
        : [];
  // A session saved before J9 (version 1, no version, or the bare array) carries its cuts in band;
  // they become metadata once, here. A current (or newer) session is never read that way, so a body
  // that really ends in "…" or "\n... truncated N chars" stays as it is. No save ever cuts what the old
  // session kept: its entries are flagged legacySession (sessionStore.ts upgradeLegacyEntry).
  const version = input?.schemaVersion;
  const legacy = !(typeof version === 'number' && version >= SESSION_SCHEMA_VERSION);
  const envelope = createSessionEnvelope({
    ...normalized,
    sessionId: input?.sessionId ?? normalized.sessionId,
    createdAt: input?.createdAt ?? normalized.createdAt,
    updatedAt: input?.updatedAt ?? normalized.updatedAt,
    source: input?.source ?? normalized.source,
    entries: legacy ? legacyEntries.map(upgradeLegacyEntry) : legacyEntries,
    runtime: input?.runtime ?? normalized.runtime,
  });
  // Restored, the entries are the panel's: a log's stored JSON text is its typed value again.
  return { ...envelope, entries: deserializeSessionEntries(envelope.entries) };
}

export function updateRuntimeHealth(current: RuntimeHealth, update: RuntimeHealthUpdate = {}): RuntimeHealth {
  const runtime = sanitizeRuntime(current);
  const acceptedDelta = nonNegativeCount(update.accepted);
  const droppedDelta = nonNegativeCount(update.dropped);
  const acceptedCount = typeof update.acceptedCount === 'number'
    ? nonNegativeCount(update.acceptedCount)
    : runtime.acceptedCount + acceptedDelta;
  const droppedCount = typeof update.droppedCount === 'number'
    ? nonNegativeCount(update.droppedCount)
    : runtime.droppedCount + droppedDelta;
  const eventTime = finiteTimestamp(update.lastEventAt, -1);
  return {
    health: sanitizeState(update.health, runtime.health),
    captureRouteState: sanitizeState(update.captureRouteState ?? update.captureRoute, runtime.captureRouteState),
    workerState: sanitizeState(update.workerState ?? update.worker, runtime.workerState),
    lastEventAt: eventTime < 0 ? runtime.lastEventAt : eventTime,
    lastErrorCode: update.lastErrorCode === undefined ? runtime.lastErrorCode : sanitizeErrorCode(update.lastErrorCode),
    acceptedCount,
    droppedCount,
  };
}

export function clearSessionEnvelope(options: SessionEnvelopeOptions = {}): SessionEnvelope {
  return createSessionEnvelope({ ...options, entries: [], runtime: undefined });
}
