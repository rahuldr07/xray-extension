import type { XrayEntry } from '../types';
import { parseBody } from '../utils';

export interface ImportResult {
  entries: XrayEntry[];
  format: 'har' | 'session' | 'unknown';
  error?: string;
}

function headerArrayToObject(headers: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (Array.isArray(headers)) {
    headers.forEach((header) => {
      if (header && typeof header === 'object' && 'name' in header) {
        out[String((header as { name: unknown }).name)] = String((header as { value: unknown }).value ?? '');
      }
    });
  }
  return out;
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// The HAR spec uses `time: -1` for "unknown", and -1 is truthy, so a plain
// `Number(time) || Number(wait) || 0` skipped the fallback and imported a NEGATIVE
// duration. The list UI clamps it to 0 on display, but a HAR re-export wrote -1
// straight back out.
//
// `> 0` rather than `>= 0` deliberately preserves the original fallback for
// `time: 0`, which the old truthiness check already handled correctly: a zero there
// is in practice an unset field, and timings.wait is the better answer. The only
// inputs whose behaviour changes are the negative ones.
function harDuration(time: unknown, wait: unknown): number {
  for (const candidate of [time, wait]) {
    const value = Number(candidate);
    if (Number.isFinite(value) && value > 0) return Math.round(value);
  }
  return 0;
}

function harEntryToXray(harEntry: Record<string, unknown>): XrayEntry | null {
  const request = harEntry.request as Record<string, unknown> | undefined;
  const response = harEntry.response as Record<string, unknown> | undefined;
  if (!request) return null;
  const url = String(request.url || '');
  let urlPath = url;
  try { urlPath = new URL(url).pathname; } catch { /* keep url */ }
  const content = response?.content as Record<string, unknown> | undefined;
  const postData = request.postData as Record<string, unknown> | undefined;
  const requestBody = parseBody(postData?.text ?? null);
  const timings = harEntry.timings as Record<string, unknown> | undefined;
  return {
    id: newId('har'),
    type: 'api',
    timestamp: harEntry.startedDateTime ? Date.parse(String(harEntry.startedDateTime)) || Date.now() : Date.now(),
    source: 'import',
    method: String(request.method || 'GET'),
    url,
    urlPath,
    status: Number(response?.status) || 0,
    duration: harDuration(harEntry.time, timings?.wait),
    size: Number(content?.size) || 0,
    requestHeaders: headerArrayToObject(request.headers),
    responseHeaders: headerArrayToObject(response?.headers),
    requestBody,
    responseRaw: typeof content?.text === 'string' ? content.text : null,
    responseDecrypted: null,
    imported: true,
    pinned: false,
  };
}

export function parseImport(text: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { entries: [], format: 'unknown', error: 'File is not valid JSON.' };
  }

  // HAR file
  const log = (parsed as { log?: { entries?: unknown } })?.log;
  if (log && Array.isArray(log.entries)) {
    const entries = log.entries
      .map((entry) => harEntryToXray(entry as Record<string, unknown>))
      .filter((entry): entry is XrayEntry => !!entry);
    return { entries, format: 'har' };
  }

  // XRAY session export: { entries: [...] }
  const sessionEntries = (parsed as { entries?: unknown })?.entries;
  if (Array.isArray(sessionEntries)) {
    const entries = sessionEntries
      .filter((entry): entry is XrayEntry => !!entry && typeof entry === 'object' && typeof (entry as XrayEntry).id === 'string')
      .map((entry) => ({ ...entry, imported: true }));
    return { entries, format: 'session' };
  }

  // Bare array of entries
  if (Array.isArray(parsed)) {
    const entries = parsed
      .filter((entry): entry is XrayEntry => !!entry && typeof entry === 'object' && typeof (entry as XrayEntry).id === 'string')
      .map((entry) => ({ ...entry, imported: true }));
    if (entries.length) return { entries, format: 'session' };
  }

  return { entries: [], format: 'unknown', error: 'Unrecognized file. Expected a HAR file or XRAY session export.' };
}
