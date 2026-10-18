import type { XrayEntry } from '../types';
import { buildSessionIndex, entrySearchFields, getIndexedSearchDocument, type SearchFieldFilter, type SessionIndex } from './sessionIndex';

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
  /** Restrict scanning to these stable field names. Omit to scan all fields. */
  fields?: readonly GlobalSearchField[];
  /** Reuse the identity-stable session index owned by the current panel render. */
  index?: SessionIndex;
}

export type GlobalSearchField =
  | 'method'
  | 'url'
  | 'status'
  | 'requestHeaders'
  | 'requestBody'
  | 'responseHeaders'
  | 'responseBody'
  | 'message'
  | 'headers'
  | 'body'
  | 'request'
  | 'response'
  | 'identity'
  | 'all'
  // Display labels are accepted for callers that persist the visible field name.
  | 'Method'
  | 'URL'
  | 'Status'
  | 'Request headers'
  | 'Request body'
  | 'Response headers'
  | 'Response body'
  | 'Message';

const MAX_MATCHES = 200;
const SNIPPET_RADIUS = 44;

/**
 * Which fields a search scans, as a predicate over normalised names ('Response body' and
 * 'responseBody' are both 'responsebody'): every field when `fields` is omitted.
 */
function fieldSelection(fields?: readonly GlobalSearchField[]): SearchFieldFilter {
  if (fields === undefined) return () => true;
  const selected = new Set(fields.map((field) => String(field).toLowerCase().replace(/ /g, '')));
  return (name: string): boolean => {
    if (selected.has('all')) return true;
    const normalized = name.toLowerCase().replace(/ /g, '');
    if (selected.has(normalized)) return true;
    if (selected.has('headers') && normalized.endsWith('headers')) return true;
    if (selected.has('body') && normalized.endsWith('body')) return true;
    if (selected.has('request') && normalized.startsWith('request')) return true;
    if (selected.has('response') && normalized.startsWith('response')) return true;
    return selected.has('identity') && ['method', 'url', 'status'].includes(normalized);
  };
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
  const index = opts.index ?? buildSessionIndex(entries);
  const wants = fieldSelection(opts.fields);

  const matches: GlobalSearchMatch[] = [];
  // Tracks whether the cap stopped the scan with entries still unexamined. Deriving
  // truncation from `matches.length >= MAX_MATCHES` alone reported truncation for a
  // search that found exactly MAX_MATCHES and had in fact scanned everything.
  let stoppedEarly = false;
  for (let i = entries.length - 1; i >= 0; i--) {
    if (matches.length >= MAX_MATCHES) { stoppedEarly = true; break; }
    const entry = entries[i];
    // The document cap limits retained derived data, not searchable entries.
    // Misses use the same bounded field derivation transiently, without backfill.
    const document = getIndexedSearchDocument(entry, index);
    const fields = document ? document.fields : entrySearchFields(entry, wants);
    for (const [field, text] of fields) {
      if (!wants(field)) continue;
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
