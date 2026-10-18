import type { XrayEntry, XrayEntry as PanelEntry } from '../types';
import { buildCurl, buildFetch, buildMockPayload, entryRequest, entryResponse, safeStringify, schema } from '../utils';
import { XRAY_VERSION } from '../version';
import { isSensitiveName, MAX_PLAN_BODY, snapshotExperimentValue } from './experiments';
import { boundedItems, ownValue } from './investigations';

export type ExportFormat =
  | 'curl'
  | 'fetch'
  | 'axios'
  | 'json'
  | 'raw'
  | 'schema'
  | 'mock'
  | 'typescript'
  | 'zod'
  | 'jest'
  | 'msw'
  | 'playwright'
  | 'session-json'
  | 'session-csv'
  | 'session-har'
  | 'session-json-safe'
  | 'session-har-safe';

export type ShareSafeFormat = 'session-json-safe' | 'session-har-safe';

export interface ShareSafeSessionProjection {
  entries: PanelEntry[];
  redactedCount: number;
  omittedCount: number;
}

export interface ShareSafeExport extends Omit<ShareSafeSessionProjection, 'entries'> {
  text: string;
  omittedEntryCount: number;
}

export interface ExportMeta {
  title: string;
  desc: string;
  extension: string;
}

export interface ExportGroup {
  label: string;
  formats: ExportFormat[];
}

export const exportGroups: ExportGroup[] = [
  { label: 'Request', formats: ['curl', 'fetch', 'axios'] },
  { label: 'Response', formats: ['json', 'raw', 'schema', 'mock'] },
  { label: 'Types', formats: ['typescript', 'zod'] },
  { label: 'Tests', formats: ['jest', 'msw', 'playwright'] },
  { label: 'Session', formats: ['session-json', 'session-csv', 'session-har', 'session-json-safe', 'session-har-safe'] },
];

export const exportFormats: ExportFormat[] = exportGroups.flatMap((group) => group.formats);

export const exportMeta: Record<ExportFormat, ExportMeta> = {
  curl: { title: 'cURL command', desc: 'Shell command with method, headers and body. Credentials were redacted at capture; add your own.', extension: 'sh' },
  fetch: { title: 'fetch() request', desc: 'fetch() call with method, headers and body.', extension: 'ts' },
  axios: { title: 'Axios request', desc: 'Axios call with method, URL, headers, and body.', extension: 'ts' },
  json: { title: 'Selected JSON', desc: 'Captured request metadata plus parsed response.', extension: 'json' },
  raw: { title: 'Raw response', desc: 'The selected response body as text or JSON.', extension: 'txt' },
  schema: { title: 'Response schema', desc: 'Inferred structural schema from the selected response.', extension: 'json' },
  mock: { title: 'Mock response', desc: 'Captured URL, method, status and response as JSON.', extension: 'json' },
  typescript: { title: 'TypeScript type', desc: 'Static TypeScript shape inferred from response data.', extension: 'ts' },
  zod: { title: 'Zod schema', desc: 'Runtime validation schema inferred from response data.', extension: 'ts' },
  jest: { title: 'Jest test', desc: 'Jest scaffold that mocks fetch with the captured response.', extension: 'test.ts' },
  msw: { title: 'MSW handler', desc: 'Mock Service Worker handler for the captured endpoint.', extension: 'ts' },
  playwright: { title: 'Playwright test', desc: 'API test that re-fires the request and asserts its status.', extension: 'spec.ts' },
  'session-json': { title: 'Session JSON', desc: 'Full captured entries for local restore. May include credentials and private payloads.', extension: 'json' },
  'session-csv': { title: 'Session CSV', desc: 'One row per API request (logs excluded), including full URLs.', extension: 'csv' },
  'session-har': { title: 'Session HAR', desc: 'Legacy HTTP Archive export with captured headers and bodies.', extension: 'har' },
  'session-json-safe': { title: 'Share-safe session JSON', desc: 'Bounded, redacted session with structured stream frames. Opaque text and diagnostics are omitted. Review before sharing.', extension: 'json' },
  'session-har-safe': { title: 'Share-safe HTTP HAR', desc: 'Bounded, redacted HTTP requests only. Streams and logs are omitted. Review before sharing.', extension: 'har' },
};

const REDACTED = '[REDACTED]';
const OMITTED = '[OMITTED]';
// Log args/logData only (E4: never inside request/response bodies, GraphQL variables
// or WS frames). Error-shaped log values carry message/stack text the user never chose
// to share, e.g. console.error(new Error('User bob@example.com not found')).
const DIAGNOSTIC_FIELD = /error|exception|stack|message|provider|config|runtime|diagnostic|internal|^__/i;
// Query parameters whose values are not credentials. KEEP IN STEP with QUERY_ALLOW in
// content/interceptor.js (a plain MAIN-world script that cannot import this module);
// test/unit/exportCorrectness.test.mjs asserts the two are identical.
export const QUERY_ALLOW = /^(page|limit|offset|sort|order|q|query|search|filter|lang|locale|format|v|version|id|ids)$/i;
/** On-screen preview cap. Copy and Download always use the full text. */
export const EXPORT_PREVIEW_CAP = 120_000;
/** Generated code embeds a body up to this many characters; beyond it, a marker and null. */
const MAX_EMBED_BODY = 1024 * 1024;

export function previewText(text: string): string {
  return text.length <= EXPORT_PREVIEW_CAP
    ? text
    : text.slice(0, EXPORT_PREVIEW_CAP) + `\n... truncated ${text.length - EXPORT_PREVIEW_CAP} chars`;
}

function pad2(n: number): string { return String(n).padStart(2, '0'); }

/** `xray-session-YYYYMMDD-HHmmss.ext` / `xray-session-share-safe-…` in local time. */
export function sessionFilename(kind: 'session' | 'share-safe', extension: string, date: Date = new Date()): string {
  const stamp = `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}-${pad2(date.getHours())}${pad2(date.getMinutes())}${pad2(date.getSeconds())}`;
  return `xray-session${kind === 'share-safe' ? '-share-safe' : ''}-${stamp}.${extension}`;
}

/** Why a format cannot be produced for this entry, or null. */
export function exportUnavailableReason(entry: unknown, format: ExportFormat): string | null {
  if (format === 'msw' && entry && ownValue(entry, 'type') === 'api' && !isHttpEntry(entry)) return 'MSW handlers need an HTTP request';
  return null;
}

export function isShareSafeFormat(format: ExportFormat): format is ShareSafeFormat {
  return format === 'session-json-safe' || format === 'session-har-safe';
}

/** Detached outbound projection. Local persistence/import never consumes this path.
 * Reuse the experiment snapshot's 20k-char / 1,000-node / depth-6 limits, then
 * remove export-specific diagnostics and query values. Never truncate raw text.
 */
export function buildShareSafeSession(entries: PanelEntry[]): ShareSafeSessionProjection {
  let redactedCount = 0;
  let omittedCount = Math.max(0, entries.length - 500);
  function omit(): string { omittedCount++; return OMITTED; }
  function redact(): string { redactedCount++; return REDACTED; }
  function url(value: unknown): string {
    if (typeof value !== 'string' || value.length > 2_048) return omit();
    try {
      const absolute = /^[a-z][a-z\d+.-]*:/i.test(value);
      const parsed = new URL(value, 'https://xray.invalid');
      if (!['http:', 'https:', 'ws:', 'wss:'].includes(parsed.protocol)) return omit();
      if (parsed.username || parsed.password) redact();
      if (parsed.hash) redact();
      parsed.username = ''; parsed.password = ''; parsed.hash = '';
      const query = new URLSearchParams();
      for (const [name, value] of parsed.searchParams) query.append(name, QUERY_ALLOW.test(name) ? value : redact());
      parsed.search = query.toString();
      return absolute ? parsed.toString() : `${parsed.pathname}${parsed.search}`;
    } catch { return omit(); }
  }
  // Only called on the already bounded, inert clone, never a captured object.
  function clean(value: unknown, diagnostics = false): unknown {
    if (typeof value === 'string') {
      if (/^\[(?:TRUNCATED|CIRCULAR|UNAVAILABLE)\]$/.test(value)) return omit();
      redactedCount += value.split(REDACTED).length - 1;
      if (/^(?:[a-z][a-z\d+.-]*:\/\/|\/|\?)[^\s<>"']*$/i.test(value)) return url(value);
      return value.replace(/\b[a-z][a-z\d+.-]*:\/\/[^\s<>"']+/gi, match => url(match));
    }
    if (Array.isArray(value)) return value.map(item => clean(item, diagnostics));
    if (value && typeof value === 'object') {
      const result: Record<string, unknown> = Object.create(null);
      for (const [key, item] of Object.entries(value)) {
        if (diagnostics && DIAGNOSTIC_FIELD.test(key)) { omit(); continue; }
        const safeKey = String(clean(key));
        result[safeKey] = isSensitiveName(key) ? redact() : clean(item, diagnostics);
      }
      return result;
    }
    return value;
  }
  /** `diagnostics` drops diagnostic keys (log args/logData only, never bodies). */
  function body(value: unknown, diagnostics = false): unknown {
    if (value == null) return null;
    if (typeof value === 'string') {
      if (value.length > MAX_PLAN_BODY) return omit();
      try { value = JSON.parse(value); } catch { return omit(); }
      // JSON-encoded opaque text is still opaque text.
      if (typeof value === 'string') return omit();
    }
    return clean(snapshotExperimentValue(value).value, diagnostics);
  }
  function headers(value: unknown): Record<string, unknown> {
    const snapshot = snapshotExperimentValue(value ?? {}).value;
    if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) { omit(); return {}; }
    const result: Record<string, unknown> = Object.create(null);
    let count = 0;
    for (const [name, item] of Object.entries(snapshot)) {
      if (++count > 50) { omit(); break; }
      // Unknown headers can be custom auth credentials. Only MIME declarations
      // with a narrow grammar may retain values; even Location is redacted.
      const mime = /^(?:[a-z0-9!#$&^_.+-]+|\*)\/(?:[a-z0-9!#$&^_.+-]+|\*)(?:;\s*charset=(?:utf-8|us-ascii))?$/i;
      const allowed = /^(?:content-type|accept)$/i.test(name) && typeof item === 'string' && item.length <= 128 && mime.test(item);
      result[String(clean(name))] = allowed ? item : redact();
    }
    return result;
  }
  function number(value: unknown): number {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;
  }
  function safeMime(value: unknown): string | undefined {
    const mime = /^(?:[a-z0-9!#$&^_.+-]+|\*)\/(?:[a-z0-9!#$&^_.+-]+|\*)(?:;\s*charset=(?:utf-8|us-ascii))?$/i;
    return typeof value === 'string' && value.length <= 128 && mime.test(value) ? value : undefined;
  }
  function upper(value: unknown): unknown {
    return typeof value === 'string' ? value.toUpperCase() : value;
  }
  function choice(value: unknown, allowed: string[], fallback: string): string {
    if (typeof value === 'string' && allowed.includes(value)) return value;
    if (value != null) omit();
    return fallback;
  }
  const safeEntries: PanelEntry[] = [];
  for (const input of boundedItems(entries, 500, true)) {
    const type = ownValue(input, 'type');
    if (type !== 'api' && type !== 'log') { omit(); continue; }
    const entry: PanelEntry = { id: `share-${safeEntries.length + 1}`, type, timestamp: number(ownValue(input, 'timestamp')) };
    // Explicit allowlist: no raw bodies, ids, errors, providers, lenses or runtime
    // fields can escape by spreading an entry, even on a future schema addition.
    const included = new Set(['id', 'type', 'timestamp']);
    function field(name: string): unknown { included.add(name); return ownValue(input, name); }
    if (type === 'api') {
      entry.method = choice(upper(field('method')), ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'CONNECT', 'TRACE', 'WS', 'SSE'], 'GET');
      entry.source = choice(field('source'), ['fetch', 'xhr', 'ws', 'sse', 'import'], 'import');
      entry.url = url(field('url') ?? field('urlPath') ?? '');
      const path = field('urlPath');
      if (typeof path === 'string') entry.urlPath = url(path);
      entry.status = number(field('status'));
      entry.duration = number(field('duration'));
      entry.size = number(field('size'));
      const contentType = safeMime(field('contentType'));
      if (contentType) entry.contentType = contentType;
      entry.requestHeaders = headers(field('requestHeaders'));
      entry.responseHeaders = headers(field('responseHeaders'));
      entry.requestBody = body(field('requestBody'));
      // Normalize all response aliases into one sanitized field, with existing
      // decrypted/raw/response precedence. Never export the unused aliases.
      const decrypted = field('responseDecrypted');
      const raw = field('responseRaw');
      const response = field('response');
      entry.response = body(decrypted ?? raw ?? response);
      const frames = field('wsFrames');
      if (Array.isArray(frames)) {
        omittedCount += Math.max(0, frames.length - 50);
        entry.wsFrames = boundedItems(frames, 50, true).map(frame => ({
          dir: choice(ownValue(frame, 'dir'), ['in', 'out'], 'in') as 'in' | 'out',
          ts: number(ownValue(frame, 'ts')), size: number(ownValue(frame, 'size')),
          preview: JSON.stringify(body(ownValue(frame, 'preview'))),
        }));
      }
      const wsState = field('wsState');
      if (wsState != null) entry.wsState = choice(wsState, ['connecting', 'open', 'closed', 'error'], 'closed') as PanelEntry['wsState'];
      const closeCode = field('wsCloseCode');
      if (typeof closeCode === 'number' && Number.isFinite(closeCode) && closeCode >= 0) entry.wsCloseCode = Math.floor(closeCode);
      const timing = field('timing');
      if (timing && typeof timing === 'object' && !Array.isArray(timing)) {
        const safeTiming: Record<string, number> = Object.create(null);
        for (const name of ['startTime', 'totalMs', 'dnsMs', 'connectMs', 'tlsMs', 'ttfbMs', 'downloadMs', 'transferSize']) {
          const value = ownValue(timing, name);
          if (typeof value === 'number' && Number.isFinite(value) && value >= 0) safeTiming[name] = value;
        }
        entry.timing = safeTiming;
      }
      const graphql = field('graphql');
      if (graphql && typeof graphql === 'object' && !Array.isArray(graphql)) {
        const operationType = ownValue(graphql, 'operationType');
        const operationName = ownValue(graphql, 'operationName');
        entry.graphql = {
          operationType: typeof operationType === 'string' ? String(clean(operationType)) : '',
          operationName: typeof operationName === 'string' ? String(clean(operationName)) : '',
          ...(ownValue(graphql, 'variables') !== undefined ? { variables: body(ownValue(graphql, 'variables')) } : {}),
        };
      }
    } else {
      entry.logLevel = choice(field('logLevel'), ['log', 'info', 'warn', 'error', 'debug'], 'log') as PanelEntry['logLevel'];
      if (field('message') != null) entry.message = omit();
      const args = field('args');
      if (Array.isArray(args)) {
        omittedCount += Math.max(0, args.length - 20);
        entry.args = boundedItems(args, 20).map(arg => body(arg, true));
      }
      if (field('logData') != null) entry.logData = body(ownValue(input, 'logData'), true);
    }
    let keys = 0;
    for (const key in input as object) {
      if (++keys > 1_000) { omit(); break; }
      if (Object.prototype.hasOwnProperty.call(input, key) && !included.has(key)) omit();
    }
    safeEntries.push(entry);
  }
  return { entries: safeEntries, redactedCount, omittedCount };
}

export function isHttpEntry(entry: unknown): boolean {
  if (ownValue(entry, 'type') !== 'api') return false;
  const source = ownValue(entry, 'source');
  const method = ownValue(entry, 'method');
  const url = ownValue(entry, 'url');
  if ([source, method].some(value => typeof value === 'string' && /^(?:ws|wss|websocket|sse|eventsource)$/i.test(value))) return false;
  if (typeof url === 'string' && /^wss?:/i.test(url)) return false;
  const headers = ownValue(entry, 'responseHeaders');
  const contentTypes: unknown[] = [ownValue(entry, 'contentType')];
  if (headers && typeof headers === 'object') {
    for (const name in headers as object) {
      if (name.toLowerCase() === 'content-type') contentTypes.push(ownValue(headers, name));
    }
  }
  return !contentTypes.some(value => typeof value === 'string' && /^text\/event-stream\b/i.test(value));
}

export function buildShareSafeExport(entries: PanelEntry[], format: ShareSafeFormat): ShareSafeExport {
  // Filter before projecting: omitted streams consume neither HAR body budget nor
  // redaction receipts. HAR represents HTTP only, never synthetic frame requests.
  const retained = boundedItems(entries, 500, true) as PanelEntry[];
  const included = format === 'session-har-safe' ? retained.filter(isHttpEntry) : retained;
  const omittedEntryCount = entries.length - included.length;
  const projection = buildShareSafeSession(included);
  const omittedCount = projection.omittedCount + omittedEntryCount;
  const text = format === 'session-har-safe'
    ? buildSessionHar(projection.entries)
    : JSON.stringify({ ...projection, omittedCount }, null, 2);
  return { text, redactedCount: projection.redactedCount, omittedCount, omittedEntryCount };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function typeName(input: string): string {
  const cleaned = input.replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  return cleaned || 'XrayResponse';
}

function headerObject(entry: XrayEntry | null): Record<string, unknown> {
  return asRecord(entry?.requestHeaders);
}

function responseContentType(entry: XrayEntry | null): string {
  const headers = asRecord(entry?.responseHeaders);
  const value = headers['content-type'] ?? headers['Content-Type'] ?? entry?.contentType ?? 'application/json';
  return String(value);
}

export function buildTypeScriptShape(value: unknown, name = 'XrayResponse'): string {
  const shape = schema(value);
  function toType(input: unknown, depth = 0): string {
    if (input === 'string') return 'string';
    if (input === 'number') return 'number';
    if (input === 'boolean') return 'boolean';
    if (input === 'null') return 'null';
    if (Array.isArray(input)) return `${toType(input[0], depth + 1)}[]`;
    if (input && typeof input === 'object') {
      const pad = '  '.repeat(depth + 1);
      const close = '  '.repeat(depth);
      return `{\n${Object.entries(input as Record<string, unknown>).map(([key, child]) => `${pad}${JSON.stringify(key)}: ${toType(child, depth + 1)};`).join('\n')}\n${close}}`;
    }
    return 'unknown';
  }
  return `export type ${name} = ${toType(shape)};`;
}

export function buildZodSchema(value: unknown, name = 'XrayResponse'): string {
  const shape = schema(value);
  function toZod(input: unknown): string {
    if (input === 'string') return 'z.string()';
    if (input === 'number') return 'z.number()';
    if (input === 'boolean') return 'z.boolean()';
    if (input === 'null') return 'z.null()';
    if (Array.isArray(input)) return `z.array(${toZod(input[0])})`;
    if (input && typeof input === 'object') {
      const fields = Object.entries(input as Record<string, unknown>)
        .map(([key, child]) => `  ${JSON.stringify(key)}: ${toZod(child)},`)
        .join('\n');
      return `z.object({\n${fields}\n})`;
    }
    return 'z.unknown()';
  }
  return `import { z } from 'zod';\n\nexport const ${typeName(name).charAt(0).toLowerCase()}${typeName(name).slice(1)}Schema = ${toZod(shape)};`;
}

function omittedBody(chars: number): string {
  return `/* body omitted: ${Math.max(1, Math.round(chars / 1024))} KB — see the JSON export */ null`;
}

/** A JSON expression for a body inside generated code; huge bodies become a marker + null. */
function embedJson(value: unknown): string {
  const text = safeStringify(value, 2, Infinity);
  return text.length > MAX_EMBED_BODY ? omittedBody(text.length) : text;
}

/** A JS string literal for a body's text; huge bodies become a marker + null. */
function embedText(value: unknown): string {
  const text = typeof value === 'string' ? value : safeStringify(value, 0, Infinity);
  return text.length > MAX_EMBED_BODY ? omittedBody(text.length) : JSON.stringify(text);
}

/** Stringify an options object, attaching `body` under `key` unless it is oversize. */
function stringifyWithBody(options: Record<string, unknown>, key: string, body: unknown): string {
  if (body == null) return safeStringify(options, 2, Infinity);
  const bodyText = safeStringify(body, 2, Infinity);
  if (bodyText.length <= MAX_EMBED_BODY) return safeStringify({ ...options, [key]: body }, 2, Infinity);
  const base = safeStringify(options, 2, Infinity);
  const marker = `${JSON.stringify(key)}: ${omittedBody(bodyText.length)}`;
  return base === '{}' ? `{\n  ${marker}\n}` : base.replace(/\n?\}$/, `,\n  ${marker}\n}`);
}

export function buildAxios(entry: XrayEntry | null): string {
  if (!entry) return '// Select an API request first';
  const method = String(entry.method || 'GET').toLowerCase();
  const body = entryRequest(entry);
  const options = { method, url: String(entry.url || ''), headers: headerObject(entry) };
  return `import axios from 'axios';\n\nconst response = await axios(${stringifyWithBody(options, 'data', body)});\nconst data = response.data;`;
}

export function buildSessionCsv(entries: XrayEntry[]): string {
  const escape = (value: unknown): string => {
    let text = String(value ?? '');
    // CSV injection: a spreadsheet evaluates a cell that starts with = + - @.
    if (typeof value === 'string' && /^[=+\-@]/.test(text)) text = `'${text}`;
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const rows = entries.filter((entry) => entry.type === 'api').map((entry) => [
    entry.id,
    entry.method || '',
    entry.status ?? '',
    entry.url || entry.urlPath || '',
    entry.source || '',
    entry.duration ?? '',
    entry.size ?? '',
    isoOrEmpty(entry.timestamp),
  ]);
  return [['id', 'method', 'status', 'url', 'source', 'durationMs', 'sizeBytes', 'timestamp'], ...rows]
    .map((row) => row.map(escape).join(','))
    .join('\n');
}

/**
 * `new Date(x).toISOString()` throws RangeError outside the ECMAScript time range, and
 * both session exports are computed in a `useMemo` during render with no error boundary
 * anywhere in the panel -- so one imported entry carrying an ISO-string or microsecond
 * timestamp blanked the whole panel when the user picked Session CSV or Session HAR.
 */
const MAX_TIME_MS = 8.64e15;

function isoOrEmpty(value: unknown, fallback = ''): string {
  const ms = Number(value);
  if (!Number.isFinite(ms) || Math.abs(ms) > MAX_TIME_MS) return fallback;
  return new Date(ms).toISOString();
}

function harContent(entry: XrayEntry): { size: number; mimeType: string; text: string } {
  const body = entryResponse(entry);
  const text = body == null ? '' : typeof body === 'string' ? body : safeStringify(body, 2, Infinity);
  // Measure the string actually emitted: `size` was computed from the compact form
  // while `text` is written pretty-printed, so the two disagreed on every real body.
  return { size: Number(entry.size) || text.length, mimeType: responseContentType(entry), text };
}

function harQueryString(url: string): Array<{ name: string; value: string }> {
  try {
    return Array.from(new URL(url, 'https://xray.invalid').searchParams, ([name, value]) => ({ name, value }));
  } catch { return []; }
}

function requestContentType(entry: XrayEntry): string {
  for (const [name, value] of Object.entries(headerObject(entry))) {
    if (name.toLowerCase() === 'content-type' && value != null && String(value).trim()) return String(value);
  }
  return 'application/octet-stream';
}

/** postData is the request body exactly as captured (not a re-serialised parse). */
function harPostData(entry: XrayEntry): { bodySize: number; postData?: { mimeType: string; text: string } } {
  const raw = entry.requestBody;
  if (raw == null || raw === '') return { bodySize: 0 };
  const text = typeof raw === 'string' ? raw : safeStringify(raw, 0, Infinity);
  return { bodySize: text.length, postData: { mimeType: requestContentType(entry), text } };
}

export function buildSessionHar(entries: XrayEntry[]): string {
  const harEntries = entries.filter(isHttpEntry).map((entry) => ({
    startedDateTime: isoOrEmpty(entry.timestamp, new Date().toISOString()),
    time: Number(entry.duration) || 0,
    request: {
      method: entry.method || 'GET',
      url: entry.url || entry.urlPath || '',
      httpVersion: 'HTTP/1.1',
      headers: Object.entries(headerObject(entry)).map(([name, value]) => ({ name, value: String(value) })),
      queryString: harQueryString(entry.url || entry.urlPath || ''),
      cookies: [],
      headersSize: -1,
      ...harPostData(entry),
    },
    response: {
      status: Number(entry.status) || 0,
      statusText: typeof entry.statusText === 'string' ? entry.statusText : '',
      httpVersion: 'HTTP/1.1',
      headers: Object.entries(asRecord(entry.responseHeaders)).map(([name, value]) => ({ name, value: String(value) })),
      cookies: [],
      // A 204/304/empty-200 has no body. safeStringify(null) is the 4-character string
      // "null", so every body-less response used to export as a 4-byte JSON body that
      // Chrome DevTools, Charles and XRAY's own importer all showed as real content.
      content: harContent(entry),
      redirectURL: '',
      headersSize: -1,
      bodySize: Number(entry.size) || -1,
    },
    cache: {},
    timings: {
      blocked: 0,
      dns: -1,
      connect: -1,
      send: 0,
      wait: Number(entry.duration) || 0,
      receive: 0,
      ssl: -1,
    },
  }));
  return safeStringify({ log: { version: '1.2', creator: { name: 'XRAY', version: XRAY_VERSION }, entries: harEntries } }, 2, Infinity);
}

function buildJest(entry: XrayEntry | null): string {
  if (!entry) return '// Select an API request first';
  const data = entryResponse(entry);
  return `global.fetch = jest.fn();\n\ndescribe(${JSON.stringify(String(entry.urlPath || entry.url || 'captured request'))}, () => {\n  beforeEach(() => {\n    (global.fetch as jest.Mock).mockResolvedValue({\n      ok: ${Number(entry.status) < 400},\n      status: ${Number(entry.status) || 200},\n      headers: { get: () => ${JSON.stringify(responseContentType(entry))} },\n      json: async () => (${embedJson(data)}),\n      text: async () => ${embedText(data)},\n    });\n  });\n\n  afterEach(() => jest.clearAllMocks());\n\n  it('handles the captured response', async () => {\n    const response = await fetch(${JSON.stringify(String(entry.url || entry.urlPath || ''))});\n    expect(response.status).toBe(${Number(entry.status) || 200});\n  });\n});`;
}

/** MSW matches on path; a query string in the pattern never matches (MSW warns about it). */
function mswUrl(entry: XrayEntry): string {
  return String(entry.url || entry.urlPath || '').replace(/[?#].*$/s, '');
}

function buildMsw(entry: XrayEntry | null): string {
  if (!entry) return '// Select an API request first';
  const unavailable = exportUnavailableReason(entry, 'msw');
  if (unavailable) return `// ${unavailable}`;
  const method = String(entry.method || 'GET').toLowerCase();
  const data = entryResponse(entry);
  const isJson = responseContentType(entry).toLowerCase().includes('json');
  const response = isJson
    ? `HttpResponse.json(${embedJson(data)}, { status: ${Number(entry.status) || 200} })`
    : `new HttpResponse(${embedText(data)}, { status: ${Number(entry.status) || 200} })`;
  return `import { http, HttpResponse } from 'msw';\n\nexport const handlers = [\n  http.${method}(${JSON.stringify(mswUrl(entry))}, async () => {\n    return ${response};\n  }),\n];`;
}

function buildPlaywright(entry: XrayEntry | null): string {
  if (!entry) return '// Select an API request first';
  const method = String(entry.method || 'GET').toLowerCase();
  const url = String(entry.url || entry.urlPath || '');
  const status = Number(entry.status) || 200;
  const title = `${String(entry.method || 'GET').toUpperCase()} ${String(entry.urlPath || url || 'request')}`;
  const headers = headerObject(entry);
  const body = entryRequest(entry);
  // Playwright's APIRequestContext has get/post/put/patch/delete/head convenience
  // methods; anything else goes through the generic request.fetch(url, { method }).
  const convenience = ['get', 'post', 'put', 'patch', 'delete', 'head'].includes(method);
  const options: Record<string, unknown> = {};
  if (!convenience) options.method = String(entry.method || 'GET').toUpperCase();
  if (Object.keys(headers).length) options.headers = headers;
  const sendsBody = body != null && method !== 'get' && method !== 'head';
  const optsArg = Object.keys(options).length || sendsBody ? `, ${stringifyWithBody(options, 'data', sendsBody ? body : null)}` : '';
  const call = convenience
    ? `request.${method}(${JSON.stringify(url)}${optsArg})`
    : `request.fetch(${JSON.stringify(url)}${optsArg})`;
  const isJson = responseContentType(entry).toLowerCase().includes('json');
  // A 204/304/empty 200 has no body: response.json() would throw on it.
  const captured = entryResponse(entry);
  const hasBody = captured != null && captured !== '';
  const bodyLines = hasBody ? `\n  const body = await response.${isJson ? 'json' : 'text'}();\n  expect(body).toBeTruthy();` : '';
  return `import { test, expect } from '@playwright/test';\n\ntest(${JSON.stringify(title)}, async ({ request }) => {\n  const response = await ${call};\n  expect(response.status()).toBe(${status});${bodyLines}\n});`;
}

export function filenameForExport(entry: XrayEntry | null, format: ExportFormat): string {
  if (isShareSafeFormat(format)) return `xray-${format}.${exportMeta[format].extension}`;
  const path = String(entry?.urlPath || entry?.url || 'session')
    .replace(/^https?:\/\//, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'session';
  const meta = exportMeta[format];
  return `xray-${path}-${format}.${meta.extension}`;
}

export function mimeForExport(format: ExportFormat): string {
  if (isShareSafeFormat(format)) return 'application/json;charset=utf-8';
  if (format === 'session-csv') return 'text/csv;charset=utf-8';
  if (format === 'session-har' || format === 'session-json' || format === 'json' || format === 'schema' || format === 'mock') {
    return 'application/json;charset=utf-8';
  }
  if (format === 'raw') return 'text/plain;charset=utf-8';
  if (format === 'curl') return 'text/x-shellscript;charset=utf-8';
  return 'text/typescript;charset=utf-8';
}

export function exportText(entry: XrayEntry | null, entries: XrayEntry[], format: ExportFormat): string {
  if (isShareSafeFormat(format)) return buildShareSafeExport(entries, format).text;
  if (format === 'session-json') return safeStringify({ entries }, 2, Infinity);
  if (format === 'session-csv') return buildSessionCsv(entries);
  if (format === 'session-har') return buildSessionHar(entries);
  // Log entries have no URL/method/response, so every entry-scoped format
  // would render nonsense like `curl "" -X GET` for them.
  if (!entry || entry.type !== 'api') return '// Select an API request first';
  if (format === 'curl') return buildCurl(entry);
  if (format === 'fetch') return buildFetch(entry);
  if (format === 'axios') return buildAxios(entry);
  if (format === 'schema') return safeStringify(schema(entryResponse(entry)), 2, Infinity);
  if (format === 'mock') return buildMockPayload(entry);
  if (format === 'typescript') return buildTypeScriptShape(entryResponse(entry));
  if (format === 'zod') return buildZodSchema(entryResponse(entry));
  if (format === 'jest') return buildJest(entry);
  if (format === 'msw') return buildMsw(entry);
  if (format === 'playwright') return buildPlaywright(entry);
  if (format === 'raw') {
    const raw = entry.responseDecrypted ?? entry.responseRaw ?? entryResponse(entry);
    return typeof raw === 'string' ? raw : safeStringify(raw, 2, Infinity);
  }
  // The parsed response is exported once, as `response`; the raw aliases would repeat it.
  const { responseRaw: _raw, response: _alias, responseDecrypted: _dec, ...rest } = entry;
  return safeStringify({ entry: rest, response: entryResponse(entry) }, 2, Infinity);
}
