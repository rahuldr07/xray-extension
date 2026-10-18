import type { BodyTruncation, FormDataPair, RequestBodyKind, XrayEntry } from '../types';
import { parseBody } from '../utils';
import { legacySuffix } from './capturedBody';

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

/**
 * The request body from HAR postData (spec J10): its text verbatim as the request text — what views,
 * Replay and a re-export read — with the parsed copy beside it as before. An in-band
 * "\n... truncated N chars" suffix (exports made before J6) becomes truncation metadata.
 */
function postDataFields(postData: Record<string, unknown> | undefined): Pick<XrayEntry, 'requestBody' | 'requestBodyText' | 'requestBodyKind' | 'requestTruncated'> {
  const text = postData?.text;
  if (typeof text !== 'string') return formParams(postData) ?? { requestBody: null };
  const legacy = legacySuffix(text);
  const kept = legacy ? text.slice(0, legacy.kept) : text;
  const mime = typeof postData?.mimeType === 'string' ? postData.mimeType.toLowerCase() : '';
  const kind: RequestBodyKind = mime.startsWith('application/x-www-form-urlencoded') ? 'urlencoded' : 'text';
  const truncated: BodyTruncation | undefined = legacy ? { keptChars: legacy.kept, totalChars: legacy.kept + legacy.omitted } : undefined;
  return {
    requestBody: legacy ? kept : kind === 'urlencoded' ? kept : parseBody(kept),
    requestBodyText: kept,
    requestBodyKind: kind,
    ...(truncated ? { requestTruncated: truncated } : {}),
  };
}

/**
 * The params of a multipart postData without text (XRAY's HAR writes FormData that way, final fix I2)
 * as the FormData fields capture records: [name, value | {file, size, type}] in order, with the same
 * `name=value` text rendering. A file's size was not exported, so it reads 0.
 */
function formParams(postData: Record<string, unknown> | undefined): Pick<XrayEntry, 'requestBody' | 'requestBodyText' | 'requestBodyKind'> | null {
  const params = postData?.params;
  const mime = typeof postData?.mimeType === 'string' ? postData.mimeType.toLowerCase() : '';
  if (!Array.isArray(params) || !mime.startsWith('multipart/form-data')) return null;
  const pairs: FormDataPair[] = [];
  const lines: string[] = [];
  for (const param of params as unknown[]) {
    if (!param || typeof param !== 'object') continue;
    const { name, value, fileName, contentType } = param as Record<string, unknown>;
    const key = String(name ?? '');
    if (typeof fileName === 'string') {
      const file = { file: fileName, size: 0, type: typeof contentType === 'string' ? contentType : '' };
      pairs.push([key, file]);
      lines.push(`${key}=[file "${file.file}", ${file.type || 'no type'}, ${file.size} bytes]`);
    } else {
      const text = String(value ?? '');
      pairs.push([key, text]);
      lines.push(`${key}=${text}`);
    }
  }
  return { requestBodyKind: 'formdata', requestBody: pairs, requestBodyText: lines.join('\n') };
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
  const sent = postDataFields(postData);
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
    ...sent,
    responseRaw: typeof content?.text === 'string' ? content.text : null,
    responseDecrypted: null,
    imported: true,
    pinned: false,
  };
}

/**
 * A session entry from a file: marked `imported`, and never `legacySession` — that flag (set when a
 * saved pre-J9 session is migrated, spec J9) exempts an entry from the session budget, and an
 * exported session may carry it.
 */
function importedEntry(entry: XrayEntry): XrayEntry {
  const { legacySession: _legacy, ...rest } = entry;
  return { ...rest, imported: true };
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
      .map(importedEntry);
    return { entries, format: 'session' };
  }

  // Bare array of entries
  if (Array.isArray(parsed)) {
    const entries = parsed
      .filter((entry): entry is XrayEntry => !!entry && typeof entry === 'object' && typeof (entry as XrayEntry).id === 'string')
      .map(importedEntry);
    if (entries.length) return { entries, format: 'session' };
  }

  return { entries: [], format: 'unknown', error: 'Unrecognized file. Expected a HAR file or XRAY session export.' };
}
