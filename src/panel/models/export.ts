import type { XrayEntry, XrayEntry as PanelEntry } from '../types';
import { bodyExportNode, buildCurl, buildFetch, buildMockPayload, entryRequest, entryResponse, exportBodyText, formCode, formExport, formHeaders, partialNotes, plainNode, safeStringify, schema } from '../utils';
import { XRAY_VERSION } from '../version';
import { bodyDoc, requestBody as capturedRequest, responseBody as capturedResponse } from './capturedBody';
import { isSensitiveName, MAX_PLAN_BODY, snapshotExperimentNode, snapshotExperimentValue } from './experiments';
import { boundedItems, ownValue } from './investigations';
import { parseJson, printJson, toValue, type JsonEntry, type JsonNode, type JsonObjectNode } from './jsonText';
import { isTypedLog, logPlain } from './logValue';
import { replayBody } from './replayBody';

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

/** [[name, value], …] with string names: the shape of captured FormData pairs. */
function isFormPairs(value: unknown[]): boolean {
  return value.length > 0 && value.every((pair) => Array.isArray(pair) && pair.length === 2 && typeof pair[0] === 'string');
}

/** A projected body: the plain value buildShareSafeSession hands out, and the nodes the export prints. */
interface SafeBody {
  value: unknown;
  node: JsonNode;
}

/** One entry's projected bodies as nodes, by field, for the lossless print (spec J10). */
interface SafeEntryBodies {
  requestBody?: JsonNode;
  /** The request body is FormData fields (redacted pairs): the HAR writes them as params. */
  requestForm?: boolean;
  response?: JsonNode;
  variables?: JsonNode;
  args?: JsonNode[];
  logData?: JsonNode;
}

/** Detached outbound projection. Local persistence/import never consumes this path.
 * Reuse the experiment snapshot's 20k-char / 1,000-node / depth-6 limits, then
 * remove export-specific diagnostics and query values. Never truncate raw text.
 */
export function buildShareSafeSession(entries: PanelEntry[]): ShareSafeSessionProjection {
  return projectShareSafe(entries).projection;
}

/**
 * The share-safe projection plus each entry's bodies as nodes. A captured text is redacted over its
 * lossless parse (spec J10) — the same budgets and rules as a value — so the export prints every
 * lexeme and member order as captured; a body that exists only as a value keeps the value path.
 */
function projectShareSafe(entries: PanelEntry[]): { projection: ShareSafeSessionProjection; bodies: SafeEntryBodies[] } {
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
  // The node form of clean(), over a snapshot of a lossless parse: strings and keys are cleaned the
  // same way; numbers, booleans, null, duplicate keys and member order stay as parsed.
  function cleanNode(node: JsonNode, diagnostics: boolean): JsonNode {
    if (node.t === 'str') {
      const cleaned = String(clean(node.value));
      return cleaned === node.value ? node : { t: 'str', value: cleaned };
    }
    if (node.t === 'arr') return { t: 'arr', items: node.items.map((item) => cleanNode(item, diagnostics)) };
    if (node.t !== 'obj') return node;
    const members: JsonEntry[] = [];
    for (const member of node.entries) {
      if (diagnostics && DIAGNOSTIC_FIELD.test(member.key)) { omit(); continue; }
      const key = String(clean(member.key));
      members.push({
        key,
        value: isSensitiveName(member.key) ? { t: 'str', value: redact() } : cleanNode(member.value, diagnostics),
        ...(member.dup ? { dup: true } : {}),
        ...(member.keyRaw !== undefined && key === member.key ? { keyRaw: member.keyRaw } : {}),
      });
    }
    return { t: 'obj', entries: members };
  }
  const plain = (value: unknown): SafeBody => ({ value, node: plainNode(value) });
  function omitted(): SafeBody {
    const marker = omit();
    return { value: marker, node: { t: 'str', value: marker } };
  }
  /** `diagnostics` drops diagnostic keys (log args/logData only, never bodies). */
  function body(value: unknown, diagnostics = false): SafeBody {
    if (value == null) return { value: null, node: { t: 'null' } };
    if (typeof value === 'string') {
      if (value.length > MAX_PLAN_BODY) return omitted();
      const doc = parseJson(value);
      // Text that is not one JSON document — or JSON-encoded opaque text — is still opaque text.
      if (!doc.ok || doc.kind !== 'json' || doc.root.t === 'str') return omitted();
      const node = cleanNode(snapshotExperimentNode(doc.root).node, diagnostics);
      return { value: toValue(node), node };
    }
    return plain(clean(snapshotExperimentValue(value).value, diagnostics));
  }
  // A captured request body (spec J4) that is not text: FormData arrives as [name, value | file]
  // pairs, and a value under a sensitive name is redacted like a sensitive object key (also for
  // pair-shaped bodies without a kind). A binary descriptor keeps its size only, since its
  // base64Prefix is the body's first bytes. A request saved before J4 is its parsed value.
  function requestBody(value: unknown, kind: unknown): SafeBody & { form?: boolean } {
    if (!value || typeof value !== 'object') return body(value);
    const snapshot = snapshotExperimentValue(value).value;
    if (Array.isArray(snapshot) && (kind === 'formdata' || isFormPairs(snapshot))) {
      return { ...plain(snapshot.map((pair) => {
        if (!Array.isArray(pair) || typeof pair[0] !== 'string') return clean(pair);
        return [clean(pair[0]), isSensitiveName(pair[0]) ? redact() : clean(pair[1])];
      })), form: true };
    }
    if (snapshot && typeof snapshot === 'object' && !Array.isArray(snapshot) && ownValue(snapshot, 'binary') === true
      && ownValue(snapshot, 'base64Prefix') !== undefined) {
      omit();
      const descriptor: Record<string, unknown> = Object.create(null);
      descriptor.binary = true;
      descriptor.size = number(ownValue(snapshot, 'size'));
      return plain(descriptor);
    }
    return plain(clean(snapshot));
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
  const safeBodies: SafeEntryBodies[] = [];
  for (const input of boundedItems(entries, 500, true)) {
    const type = ownValue(input, 'type');
    if (type !== 'api' && type !== 'log') { omit(); continue; }
    const entry: PanelEntry = { id: `share-${safeEntries.length + 1}`, type, timestamp: number(ownValue(input, 'timestamp')) };
    // Explicit allowlist: no raw bodies, ids, errors, providers, lenses or runtime
    // fields can escape by spreading an entry, even on a future schema addition.
    const included = new Set(['id', 'type', 'timestamp']);
    function field(name: string): unknown { included.add(name); return ownValue(input, name); }
    const bodies: SafeEntryBodies = {};
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
      // The request body is the captured text (spec J10), never the parsed copy a saved session
      // key-sorted. The kind and the text only steer the projection; neither is exported (both
      // still count as omitted).
      const kind = ownValue(input, 'requestBodyKind');
      const sentText = ownValue(input, 'requestBodyText');
      const requestValue = field('requestBody');
      const request: SafeBody & { form?: boolean } = (kind === 'text' || kind === 'urlencoded') && typeof sentText === 'string' ? body(sentText) : requestBody(requestValue, kind);
      entry.requestBody = request.value;
      bodies.requestBody = request.node;
      if (request.form) bodies.requestForm = true;
      // Normalize all response aliases into one sanitized field, with existing
      // decrypted/raw/response precedence. Never export the unused aliases.
      const decrypted = field('responseDecrypted');
      const raw = field('responseRaw');
      const response = body(decrypted ?? raw ?? field('response'));
      entry.response = response.value;
      bodies.response = response.node;
      const frames = field('wsFrames');
      if (Array.isArray(frames)) {
        omittedCount += Math.max(0, frames.length - 50);
        entry.wsFrames = boundedItems(frames, 50, true).map(frame => ({
          dir: choice(ownValue(frame, 'dir'), ['in', 'out'], 'in') as 'in' | 'out',
          ts: number(ownValue(frame, 'ts')), size: number(ownValue(frame, 'size')),
          // The lossless printer (spec J16): a frame's integers and key order as received.
          preview: printJson(body(ownValue(frame, 'preview')).node),
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
        const variables = ownValue(graphql, 'variables') !== undefined ? body(ownValue(graphql, 'variables')) : null;
        if (variables) bodies.variables = variables.node;
        entry.graphql = {
          operationType: typeof operationType === 'string' ? String(clean(operationType)) : '',
          operationName: typeof operationName === 'string' ? String(clean(operationName)) : '',
          ...(variables ? { variables: variables.value } : {}),
        };
      }
    } else {
      entry.logLevel = choice(field('logLevel'), ['log', 'info', 'warn', 'error', 'debug'], 'log') as PanelEntry['logLevel'];
      if (field('message') != null) entry.message = omit();
      const args = field('args');
      if (Array.isArray(args)) {
        omittedCount += Math.max(0, args.length - 20);
        const safeArgs = boundedItems(args, 20).map(arg => body(arg, true));
        entry.args = safeArgs.map((arg) => arg.value);
        bodies.args = safeArgs.map((arg) => arg.node);
      }
      // A typed log (spec J7) is flattened to plain JSON first: every typed value becomes its
      // text and a class instance or Map an object keyed by its keys, so the key-based
      // redaction below still sees each key (an envelope lists them inside arrays). An Error,
      // at any depth, is its name alone (logPlain 'share'); what it drops is counted as omitted.
      const logData = ownValue(input, 'logData');
      const typedLog = isTypedLog({ logArgCount: ownValue(input, 'logArgCount') as number | undefined });
      if (field('logData') != null) {
        const dropped = { omitted: 0 };
        const safeLog = body(typedLog ? logPlain(logData, 'share', dropped) : logData, true);
        omittedCount += dropped.omitted;
        entry.logData = safeLog.value;
        bodies.logData = safeLog.node;
      }
    }
    let keys = 0;
    for (const key in input as object) {
      if (++keys > 1_000) { omit(); break; }
      if (Object.prototype.hasOwnProperty.call(input, key) && !included.has(key)) omit();
    }
    safeEntries.push(entry);
    safeBodies.push(bodies);
  }
  return { projection: { entries: safeEntries, redactedCount, omittedCount }, bodies: safeBodies };
}

function memberValue(node: JsonNode | undefined, key: string): JsonNode | undefined {
  return node?.t === 'obj' ? node.entries.find((member) => member.key === key)?.value : undefined;
}

/** Sets `key` (replacing the first member of that name, else appending it). */
function setMember(node: JsonObjectNode, key: string, value: JsonNode): void {
  const member = node.entries.find((item) => item.key === key);
  if (member) member.value = value;
  else node.entries.push({ key, value });
}

/** A projected entry as nodes: its plain fields, its bodies as their redacted lossless nodes. */
function safeEntryNode(entry: PanelEntry, bodies: SafeEntryBodies): JsonNode {
  const node = plainNode(entry);
  if (node.t !== 'obj') return node;
  if (bodies.requestBody) setMember(node, 'requestBody', bodies.requestBody);
  if (bodies.response) setMember(node, 'response', bodies.response);
  if (bodies.logData) setMember(node, 'logData', bodies.logData);
  const graphql = memberValue(node, 'graphql');
  if (bodies.variables && graphql?.t === 'obj') setMember(graphql, 'variables', bodies.variables);
  const args = memberValue(node, 'args');
  if (bodies.args && args?.t === 'arr') args.items = bodies.args;
  return node;
}

/**
 * A projected entry with its bodies as text, for the HAR: printed losslessly; a marker string as itself.
 * FormData stays its redacted fields, which the HAR writes as params (never a JSON text of them).
 */
function safeHarEntry(entry: PanelEntry, bodies: SafeEntryBodies): PanelEntry {
  const text = (node: JsonNode | undefined): string | null => !node || node.t === 'null' ? null : node.t === 'str' ? node.value : printJson(node);
  if (bodies.requestForm) return { ...entry, requestBodyKind: 'formdata', responseRaw: text(bodies.response) };
  const request = text(bodies.requestBody);
  return {
    ...entry,
    requestBodyKind: request === null ? 'none' : 'text',
    ...(request === null ? {} : { requestBodyText: request }),
    responseRaw: text(bodies.response),
  };
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
  const { projection, bodies } = projectShareSafe(included);
  const omittedCount = projection.omittedCount + omittedEntryCount;
  // Bodies print from their redacted nodes (spec J10): integers, lexemes and member order as captured.
  const text = format === 'session-har-safe'
    ? buildSessionHar(projection.entries.map((entry, index) => safeHarEntry(entry, bodies[index])))
    : printJson({ t: 'obj', entries: [
      { key: 'entries', value: { t: 'arr', items: projection.entries.map((entry, index) => safeEntryNode(entry, bodies[index])) } },
      { key: 'redactedCount', value: plainNode(projection.redactedCount) },
      { key: 'omittedCount', value: plainNode(omittedCount) },
    ] }, { indent: 2 });
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

/** The response Content-Type header (any case), else the entry's contentType, else application/json. */
function responseContentType(entry: XrayEntry | null): string {
  for (const [name, value] of Object.entries(asRecord(entry?.responseHeaders))) {
    if (name.toLowerCase() === 'content-type' && value != null && String(value).trim()) return String(value);
  }
  return String(entry?.contentType ?? 'application/json');
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

/**
 * A JSON expression for a body inside generated code, printed from its lossless parse (spec J10):
 * every lexeme and member order as captured. Huge bodies become a marker + null.
 */
function embedJson(node: JsonNode): string {
  const text = printJson(node, { indent: 2 });
  return text.length > MAX_EMBED_BODY ? omittedBody(text.length) : text;
}

/** A JS string literal for a body's captured text; huge bodies become a marker + null. */
function embedText(text: string): string {
  return text.length > MAX_EMBED_BODY ? omittedBody(text.length) : JSON.stringify(text);
}

/**
 * The request body generated code sends (spec J10): the request text as captured, false, null and ""
 * included. A binary descriptor keeps its captured shape; a FormData is rebuilt from its fields
 * (formExport) before this is asked.
 */
function requestCodeBody(entry: XrayEntry): unknown {
  const request = capturedRequest(entry);
  if (request.kind === 'binary' || request.format === 'formdata') return entryRequest(entry);
  return replayBody(entry).text;
}

/** Options as JSON with one more member whose value is code (the `form` the export builds). */
function optionsWithCode(options: Record<string, unknown>, key: string, code: string): string {
  const base = safeStringify(options, 2, Infinity);
  const member = `${JSON.stringify(key)}: ${code}`;
  return base === '{}' ? `{\n  ${member}\n}` : base.replace(/\n\}$/, `,\n  ${member}\n}`);
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
  const form = formExport(entry);
  if (form) {
    // Axios writes the multipart Content-Type (and its boundary) for a FormData.
    const options = { method, url: String(entry.url || ''), headers: formHeaders(entry) };
    const config = form.sent ? optionsWithCode(options, 'data', 'form') : safeStringify(options, 2, Infinity);
    return `${partialNotes(form.notes)}import axios from 'axios';\n\n${form.sent ? `${formCode(form.fields)}\n` : ''}const response = await axios(${config});\nconst data = response.data;`;
  }
  const body = requestCodeBody(entry);
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

/** content.text is the response text exactly as captured (spec J10); a value without text is printed. */
function harContent(entry: XrayEntry): { size: number; mimeType: string; text: string } {
  const text = exportBodyText(capturedResponse(entry), 2);
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

interface HarParam {
  name: string;
  value?: string;
  fileName?: string;
  contentType?: string;
}

type HarPostData = { mimeType: string; text: string } | { mimeType: string; params: HarParam[]; comment?: string };

/**
 * A FormData as HAR 1.2 params, in order (final fix I2): a text field by name and value, a file by its
 * name and type (its bytes were never captured). Never `text` — the multipart bytes were not captured
 * either, and params and text exclude each other. The comment says what is missing.
 */
function harFormData(entry: XrayEntry): HarPostData {
  const pairs: unknown = entry.requestBody;
  const params: HarParam[] = [];
  for (const pair of Array.isArray(pairs) ? pairs as unknown[] : []) {
    if (!Array.isArray(pair) || pair.length < 2) continue;
    const name = String(pair[0]);
    const value: unknown = pair[1];
    if (value && typeof value === 'object') {
      const file = value as { file?: unknown; type?: unknown };
      params.push({ name, fileName: String(file.file ?? ''), ...(file.type ? { contentType: String(file.type) } : {}) });
    } else {
      params.push({ name, value: String(value ?? '') });
    }
  }
  const missing: string[] = [];
  if (!Array.isArray(pairs)) missing.push('The form fields were not kept with this entry.');
  if (entry.requestTruncated) missing.push('The form was cut at capture; later fields are missing.');
  if (params.some((param) => param.fileName !== undefined)) missing.push('Files were not captured.');
  return { mimeType: 'multipart/form-data', params, ...(missing.length ? { comment: missing.join(' ') } : {}) };
}

/**
 * postData.text is the request text exactly as captured (spec J10), an empty text included; FormData
 * is its fields as params (harFormData); a binary descriptor and a request saved before J4 as its value
 * are written as before.
 */
function harPostData(entry: XrayEntry): { bodySize: number; postData?: HarPostData } {
  const method = entry.method || 'GET';
  if (entry.requestBodyKind === 'formdata' && method !== 'GET' && method !== 'HEAD') return { bodySize: -1, postData: harFormData(entry) };
  const request = capturedRequest(entry);
  let text: string | null = null;
  if (request.kind === 'text' && request.format !== 'formdata') text = request.text;
  else if (request.kind !== 'none') {
    const raw = entry.requestBody;
    if (raw != null && raw !== '') text = typeof raw === 'string' ? raw : safeStringify(raw, 0, Infinity);
  }
  if (text === null) return { bodySize: 0 };
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
  const response = capturedResponse(entry);
  return `global.fetch = jest.fn();\n\ndescribe(${JSON.stringify(String(entry.urlPath || entry.url || 'captured request'))}, () => {\n  beforeEach(() => {\n    (global.fetch as jest.Mock).mockResolvedValue({\n      ok: ${Number(entry.status) < 400},\n      status: ${Number(entry.status) || 200},\n      headers: { get: () => ${JSON.stringify(responseContentType(entry))} },\n      json: async () => (${embedJson(bodyExportNode(response))}),\n      text: async () => ${embedText(exportBodyText(response))},\n    });\n  });\n\n  afterEach(() => jest.clearAllMocks());\n\n  it('handles the captured response', async () => {\n    const response = await fetch(${JSON.stringify(String(entry.url || entry.urlPath || ''))});\n    expect(response.status).toBe(${Number(entry.status) || 200});\n  });\n});`;
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
  const body = capturedResponse(entry);
  const isJson = responseContentType(entry).toLowerCase().includes('json');
  const response = isJson
    ? `HttpResponse.json(${embedJson(bodyExportNode(body))}, { status: ${Number(entry.status) || 200} })`
    : `new HttpResponse(${embedText(exportBodyText(body))}, { status: ${Number(entry.status) || 200} })`;
  return `import { http, HttpResponse } from 'msw';\n\nexport const handlers = [\n  http.${method}(${JSON.stringify(mswUrl(entry))}, async () => {\n    return ${response};\n  }),\n];`;
}

function buildPlaywright(entry: XrayEntry | null): string {
  if (!entry) return '// Select an API request first';
  const method = String(entry.method || 'GET').toLowerCase();
  const url = String(entry.url || entry.urlPath || '');
  const status = Number(entry.status) || 200;
  const title = `${String(entry.method || 'GET').toUpperCase()} ${String(entry.urlPath || url || 'request')}`;
  const form = formExport(entry);
  const headers = form ? formHeaders(entry) : headerObject(entry);
  // Playwright's APIRequestContext has get/post/put/patch/delete/head convenience
  // methods; anything else goes through the generic request.fetch(url, { method }).
  const convenience = ['get', 'post', 'put', 'patch', 'delete', 'head'].includes(method);
  const options: Record<string, unknown> = {};
  if (!convenience) options.method = String(entry.method || 'GET').toUpperCase();
  if (Object.keys(headers).length) options.headers = headers;
  let optsArg: string;
  if (form) {
    // A FormData passed as `multipart`: Playwright writes the Content-Type and its boundary.
    optsArg = form.sent ? `, ${optionsWithCode(options, 'multipart', 'form')}` : Object.keys(options).length ? `, ${safeStringify(options, 2, Infinity)}` : '';
  } else {
    const body = requestCodeBody(entry);
    const sendsBody = body != null && method !== 'get' && method !== 'head';
    optsArg = Object.keys(options).length || sendsBody ? `, ${stringifyWithBody(options, 'data', sendsBody ? body : null)}` : '';
  }
  const call = convenience
    ? `request.${method}(${JSON.stringify(url)}${optsArg})`
    : `request.fetch(${JSON.stringify(url)}${optsArg})`;
  const isJson = responseContentType(entry).toLowerCase().includes('json');
  // A 204/304/empty 200 has no body: response.json() would throw on it.
  const captured = entryResponse(entry);
  const hasBody = captured != null && captured !== '';
  const bodyLines = hasBody ? `\n  const body = await response.${isJson ? 'json' : 'text'}();\n  expect(body).toBeTruthy();` : '';
  const formLines = form?.sent ? formCode(form.fields, '  ') : '';
  return `${form ? partialNotes(form.notes) : ''}import { test, expect } from '@playwright/test';\n\ntest(${JSON.stringify(title)}, async ({ request }) => {\n${formLines}  const response = await ${call};\n  expect(response.status()).toBe(${status});${bodyLines}\n});`;
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

/**
 * Schema, TypeScript and Zod infer types by recursion. The Export modal builds the text during render,
 * so a value too deep for the stack (a RangeError) says so instead of unmounting the panel; the schema
 * walk itself stops at a fixed depth (utils.ts schema), so this is the guard behind that guard.
 */
function typedExport(what: string, build: () => string): string {
  try {
    return build();
  } catch (error) {
    if (error instanceof RangeError) return `// The response is too deeply nested to export as ${what}.`;
    throw error;
  }
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
  if (format === 'schema') return typedExport('a schema', () => safeStringify(schema(entryResponse(entry)), 2, Infinity));
  if (format === 'mock') return buildMockPayload(entry);
  if (format === 'typescript') return typedExport('TypeScript', () => buildTypeScriptShape(entryResponse(entry)));
  if (format === 'zod') return typedExport('a Zod schema', () => buildZodSchema(entryResponse(entry)));
  if (format === 'jest') return buildJest(entry);
  if (format === 'msw') return buildMsw(entry);
  if (format === 'playwright') return buildPlaywright(entry);
  if (format === 'raw') {
    const raw = entry.responseDecrypted ?? entry.responseRaw ?? entryResponse(entry);
    return typeof raw === 'string' ? raw : safeStringify(raw, 2, Infinity);
  }
  return selectedJson(entry);
}

/**
 * Selected JSON: the entry's fields, its request body and its response embedded through printJson
 * (spec J10) — every lexeme, duplicate key and member order as captured. The response is exported
 * once, as `response`; the raw aliases would repeat it.
 */
function selectedJson(entry: XrayEntry): string {
  const { responseRaw: _raw, response: _alias, responseDecrypted: _dec, ...rest } = entry;
  const entryNode = plainNode(rest);
  const request = capturedRequest(entry);
  const requestDoc = request.kind === 'text' && request.format === 'text' ? bodyDoc(request) : null;
  if (entryNode.t === 'obj' && requestDoc?.ok) setMember(entryNode, 'requestBody', requestDoc.root);
  return printJson({ t: 'obj', entries: [
    { key: 'entry', value: entryNode },
    { key: 'response', value: bodyExportNode(capturedResponse(entry)) },
  ] }, { indent: 2 });
}
