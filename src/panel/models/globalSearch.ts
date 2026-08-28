import type { XrayEntry } from '../types';
import { entryRequest, entryResponse, safeStringify } from '../utils';

export interface GlobalSearchMatch {
  id: string;
  entry: XrayEntry;
  /** Which part of the entry matched (URL, Response body, Headers, …). */
  field: string;
  /** A short excerpt of the matched text, with ellipses when trimmed. */
  snippet: string;
  /** Offset + length of the match inside `snippet`, for highlighting. */
  matchStart: number;
  matchLength: number;
}

export interface GlobalSearchResult {
  matches: GlobalSearchMatch[];
  /** Non-null when the query is a regex that failed to compile. */
  error: string | null;
  /** True when results were capped at MAX_MATCHES. */
  truncated: boolean;
}

export interface GlobalSearchOptions {
  regex?: boolean;
  caseSensitive?: boolean;
}

const MAX_MATCHES = 200;
const SNIPPET_RADIUS = 44;
// Cap how much of any one body we scan so a giant response can't stall the search.
const FIELD_SCAN_CHARS = 20_000;

// The searchable fields of an entry, in priority order. The first one that matches
// is what the result row reports, so URL/method come before bulky bodies.
function entryFields(entry: XrayEntry): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  const push = (label: string, value: string | undefined | null): void => {
    if (value) out.push([label, value.length > FIELD_SCAN_CHARS ? value.slice(0, FIELD_SCAN_CHARS) : value]);
  };
  const stringify = (value: unknown): string => (typeof value === 'string' ? value : safeStringify(value, 0, FIELD_SCAN_CHARS));

  push('Method', entry.method ? String(entry.method).toUpperCase() : '');
  push('URL', String(entry.url || entry.urlPath || ''));
  if (entry.status) push('Status', String(entry.status));
  if (entry.requestHeaders && typeof entry.requestHeaders === 'object') push('Request headers', stringify(entry.requestHeaders));
  const reqBody = entryRequest(entry);
  if (reqBody != null) push('Request body', stringify(reqBody));
  if (entry.responseHeaders && typeof entry.responseHeaders === 'object') push('Response headers', stringify(entry.responseHeaders));
  const resBody = entryResponse(entry);
  if (resBody != null) push('Response body', stringify(resBody));
  if (entry.message) push('Message', String(entry.message));
  return out;
}

function locate(text: string, needleLower: string, query: string, re: RegExp | null, caseSensitive: boolean): { index: number; length: number } | null {
  if (re) {
    re.lastIndex = 0;
    const m = re.exec(text);
    return m ? { index: m.index, length: m[0].length || 1 } : null;
  }
  const haystack = caseSensitive ? text : text.toLowerCase();
  const idx = haystack.indexOf(caseSensitive ? query : needleLower);
  return idx >= 0 ? { index: idx, length: query.length } : null;
}

// Search across every captured entry's method/URL/status/headers/bodies/message.
// Newest entries first. Plain substring by default; regex when opts.regex is set.
export function searchEntries(entries: XrayEntry[], query: string, opts: GlobalSearchOptions = {}): GlobalSearchResult {
  const q = String(query || '').trim();
  if (!q) return { matches: [], error: null, truncated: false };

  const caseSensitive = !!opts.caseSensitive;
  let re: RegExp | null = null;
  if (opts.regex) {
    try {
      re = new RegExp(q, caseSensitive ? '' : 'i');
    } catch {
      return { matches: [], error: 'Invalid regular expression', truncated: false };
    }
  }
  const needleLower = q.toLowerCase();

  const matches: GlobalSearchMatch[] = [];
  // Tracks whether the cap stopped the scan with entries still unexamined. Deriving
  // truncation from `matches.length >= MAX_MATCHES` alone reported truncation for a
  // search that found exactly MAX_MATCHES and had in fact scanned everything.
  let stoppedEarly = false;
  for (let i = entries.length - 1; i >= 0; i--) {
    if (matches.length >= MAX_MATCHES) { stoppedEarly = true; break; }
    const entry = entries[i];
    for (const [field, text] of entryFields(entry)) {
      const hit = locate(text, needleLower, q, re, caseSensitive);
      if (!hit) continue;
      const start = Math.max(0, hit.index - SNIPPET_RADIUS);
      const end = Math.min(text.length, hit.index + hit.length + SNIPPET_RADIUS);
      const prefix = start > 0 ? '…' : '';
      const suffix = end < text.length ? '…' : '';
      // Replace control whitespace 1:1 so match offsets stay exact for highlighting.
      const body = text.slice(start, end).replace(/[\n\r\t]/g, ' ');
      matches.push({
        id: entry.id,
        entry,
        field,
        snippet: prefix + body + suffix,
        matchStart: prefix.length + (hit.index - start),
        matchLength: Math.min(hit.length, end - hit.index),
      });
      break; // one match per entry
    }
  }
  return { matches, error: null, truncated: stoppedEarly };
}
