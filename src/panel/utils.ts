import type { ConsoleEvent, XrayEntry } from './types';
import { bodyDoc, bodyValue, requestBody, responseBody, type CapturedBody } from './models/capturedBody';
import { LosslessNumber, parseJson, printJson, toValue, type JsonNode } from './models/jsonText';

/**
 * A body the user typed or a file supplied (Edit & Replay, HAR import) as the value it is sent or
 * stored as: text that starts like an object or array and parses as one JSON document becomes that
 * value; anything else stays as it is, '' and nullish become null. A document holding an integer
 * JavaScript cannot hold exactly (past Number.MAX_SAFE_INTEGER) stays its text too, so it is sent
 * and stored as written instead of rounded.
 */
export function parseBody(value: unknown): unknown {
  if (value == null || value === '') return null;
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed || (!trimmed.startsWith('{') && !trimmed.startsWith('['))) return value;
  const doc = parseJson(trimmed);
  if (!doc.ok || doc.kind !== 'json') return value;
  const parsed = toValue(doc.root);
  return holdsLosslessNumber(parsed) ? value : parsed;
}

/** Whether toValue wrapped any number of this value (iterative: values can be arbitrarily deep). */
function holdsLosslessNumber(value: unknown): boolean {
  const pending: unknown[] = [value];
  while (pending.length > 0) {
    const current = pending.pop();
    if (current instanceof LosslessNumber) return true;
    if (current && typeof current === 'object') {
      for (const child of Object.values(current)) if (child && typeof child === 'object') pending.push(child);
    }
  }
  return false;
}

export function clampNumber(value: unknown, fallback: number, min: number, max: number): number {
  // Number(null), Number([]) and Number('') are all 0 — finite — so the old
  // `!Number.isFinite` guard never reached the fallback and clamped instead:
  // a stored `maxEntries: null` became 50, the floor, rather than the 1000 default.
  // Only a real number or a numeric string counts as a value here.
  if (typeof value === 'string' && value.trim() === '') return fallback;
  if (typeof value !== 'number' && typeof value !== 'string') return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

// Parsing a 250KB responseRaw per call site per commit was the dominant cost
// under streaming traffic. Entries are immutable between patches (updateEntry
// mints a new object), so caching by object identity is self-invalidating.
const entryResponseCache = new WeakMap<object, unknown>();
const entryRequestCache = new WeakMap<object, unknown>();
const entrySchemaCache = new WeakMap<object, unknown>();

/**
 * The response body as a plain value, read from the captured text with the lossless parser
 * (models/capturedBody.ts): integers past Number.MAX_SAFE_INTEGER are LosslessNumber; any top-level
 * JSON value parses when the content type says JSON; non-JSON and truncated bodies stay text.
 */
export function entryResponse(entry: XrayEntry | null): unknown {
  if (!entry) return null;
  if (entryResponseCache.has(entry)) return entryResponseCache.get(entry);
  const parsed = bodyValue(responseBody(entry));
  entryResponseCache.set(entry, parsed);
  return parsed;
}

export function entrySchema(entry: XrayEntry | null): unknown {
  if (!entry) return null;
  if (entrySchemaCache.has(entry)) return entrySchemaCache.get(entry);
  const result = schema(entryResponse(entry));
  entrySchemaCache.set(entry, result);
  return result;
}

/** The request body as a plain value: requestBodyText by requestBodyKind (J4), as entryResponse reads text. */
export function entryRequest(entry: XrayEntry | null): unknown {
  if (!entry) return null;
  if (entryRequestCache.has(entry)) return entryRequestCache.get(entry);
  const parsed = bodyValue(requestBody(entry));
  entryRequestCache.set(entry, parsed);
  return parsed;
}

// toLocaleTimeString constructs a fresh Intl formatter per call — measurable at
// ~30 visible rows × every store commit during traffic bursts. One shared
// formatter plus a per-second string cache makes repeat calls ~free.
const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour12: false,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});
const timeCache = new Map<number, string>();
// The latest instant a Date can hold. Intl throws a RangeError past it (and for NaN or
// ±Infinity), so one bad timestamp from an import, the HUD or a hand-built entry used to
// unmount the row that showed it.
const MAX_DATE_MS = 8.64e15;

export function formatTime(timestamp?: number): string {
  const time = Number(timestamp || Date.now());
  if (!Number.isFinite(time) || Math.abs(time) > MAX_DATE_MS) return '—';
  const second = Math.floor(time / 1000);
  const cached = timeCache.get(second);
  if (cached !== undefined) return cached;
  if (timeCache.size > 512) timeCache.clear();
  const formatted = timeFormatter.format(time);
  timeCache.set(second, formatted);
  return formatted;
}

/** ISO time for a timestamp: null when there is none, "—" outside the Date range. */
export function isoTimestamp(timestamp: unknown): string | null {
  if (timestamp === undefined || timestamp === null || timestamp === 0) return null;
  const time = Number(timestamp);
  if (!Number.isFinite(time) || Math.abs(time) > MAX_DATE_MS) return '—';
  return new Date(time).toISOString();
}

// Captured object previews carry an internal __xray_ref__ marker used to fetch
// the full object lazily. It must never surface in user-facing JSON.
export function stripXrayRefs(value: unknown, depth = 6): unknown {
  if (value == null || typeof value !== 'object' || depth <= 0) return value;
  if (Array.isArray(value)) return value.map((item) => stripXrayRefs(item, depth - 1));
  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (key === '__xray_ref__') continue;
    out[key] = stripXrayRefs(item, depth - 1);
  }
  return out;
}

export function formatBytes(value: unknown): string {
  const bytes = Number(value) || 0;
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + 'mb';
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + 'kb';
  return bytes + 'b';
}

export function preview(value: unknown, limit = 220): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'string') return value.length > limit ? value.slice(0, limit) + '...' : value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    const text = JSON.stringify(value);
    return text.length > limit ? text.slice(0, limit) + '...' : text;
  } catch {
    return String(value);
  }
}

/**
 * JSON.stringify that survives cycles and BigInt, truncating past `limit`.
 *
 * Pass `Infinity` for a whole-file export. The truncation appends a plain-English
 * suffix, which makes the result *not JSON* -- fine for a preview pane, fatal for a
 * file. Session JSON and HAR used to pass a 500,000-char limit and wrote the result
 * straight to disk, so a session of ~305 ordinary entries produced a download that
 * XRAY's own importer rejected with "File is not valid JSON."
 */
export function safeStringify(value: unknown, space = 2, limit = 80_000): string {
  // Ancestors along the CURRENT branch. A WeakSet that only ever grew reported the
  // second sibling reference to one object as circular, so
  // `{first: shared, second: shared}` serialised as
  // `{"first":{"a":1},"second":"[Circular]"}` — a wrong answer for acyclic data.
  // `this` inside a non-arrow replacer is the object the key was read from, which
  // is what lets the stack be unwound back to the current parent.
  const ancestors: object[] = [];
  let text = '';

  try {
    text = JSON.stringify(value, function (this: unknown, _key: string, child: unknown) {
      if (typeof child === 'bigint') return child.toString() + 'n';
      if (child && typeof child === 'object') {
        while (ancestors.length > 0 && ancestors[ancestors.length - 1] !== this) ancestors.pop();
        if (ancestors.includes(child as object)) return '[Circular]';
        ancestors.push(child as object);
      }
      return child;
    }, space) ?? 'undefined';
  } catch {
    // JSON.stringify overflows the stack a few thousand levels down, and so does String() of a
    // nested array (Array.prototype.join recurses). Render paths call this (the search index, the
    // list's body flags), so it never throws.
    try {
      text = String(value);
    } catch {
      text = '[unserializable]';
    }
  }

  if (text.length <= limit) return text;
  return text.slice(0, limit) + `\n... truncated ${text.length - limit} chars`;
}

export function methodClass(method?: string): string {
  return (method || 'GET').toLowerCase();
}

export function statusClass(status?: number): 'ok' | 'warn' | 'error' | '' {
  const value = Number(status) || 0;
  if (value >= 400) return 'error';
  if (value >= 300) return 'warn';
  if (value >= 200) return 'ok';
  return '';
}

export function eventEntry(event: ConsoleEvent, entries?: readonly XrayEntry[]): XrayEntry | null {
  if (event.type !== 'network') return null;
  // Network events retain a legacy args snapshot for compatibility, but the API
  // ledger is authoritative after response/status/timing patches. When the live
  // entries are available, resolve by id and never render the stale snapshot.
  if (event.entryId && entries) return entries.find((entry) => entry.id === event.entryId) || null;
  return event.args?.[0] && typeof event.args[0] === 'object'
    ? event.args[0] as XrayEntry
    : null;
}

// POSIX single-quote quoting, matching generateCurl in shared/console-helpers.js.
// JSON.stringify was used here, which produces DOUBLE quotes — and a double-quoted
// shell word still evaluates $(...) and backticks, so a captured URL could run
// commands when the operator pasted the result.
function shellQuote(value: unknown): string {
  return `'${String(value ?? '').replace(/'/g, "'\\''")}'`;
}

// Fallbacks below mirror generateCurl / generateFetch in shared/console-helpers.js exactly
// (a unit test pins parity), so a surface that did not load the shared script (or loaded it
// late) exports the same text.
//
// The body is the request text as captured (spec J10) — false, null and "" included, never a
// re-serialization of the parsed copy. An entry saved before J4 has only that copy: any value
// but null and "" is sent as its JSON. A FormData is rebuilt from its fields (formExport); a
// binary body keeps its captured shape. A value JSON.stringify cannot print — nested too deep for the
// stack (a session file or a session saved before J4 can hold one) — is { note }: the export says the
// body is left out instead of throwing while the selected entry renders.
function requestCodeText(entry: XrayEntry): string | { note: string } | null {
  const method = entry.method || 'GET';
  if (method === 'GET' || method === 'HEAD') return null;
  const kind = entry.requestBodyKind;
  if (kind === 'none') return null;
  if ((kind === 'text' || kind === 'urlencoded') && typeof entry.requestBodyText === 'string') return entry.requestBodyText;
  const body: unknown = entry.requestBody;
  if (body === undefined || body === null || body === '') return null;
  if (typeof body === 'string') return body;
  try {
    return codeJson(body);
  } catch (error) {
    return { note: error instanceof RangeError ? 'the request body is nested too deeply to print as JSON, so it is left out'
      : 'the request body could not be printed as JSON, so it is left out' };
  }
}

/** JSON.stringify as the console helpers' _json writes it: a BigInt as its digits; String() for no JSON. */
function codeJson(value: unknown): string {
  const text = JSON.stringify(value, (_key: string, item: unknown) => {
    if (typeof item !== 'bigint') return item;
    const rawJSON = (JSON as unknown as { rawJSON?: (text: string) => unknown }).rawJSON;
    return typeof rawJSON === 'function' ? rawJSON.call(JSON, String(item)) : String(item);
  }) as string | undefined;
  return text === undefined ? String(value) : text;
}

/**
 * A FormData body as code exports rebuild it (spec J4; final fix I2): the text fields in the order
 * sent, and why the export is partial — a file (never captured), fields not kept with the entry, a
 * form cut at capture. null when the request is not a FormData. Mirrors _formFields in
 * shared/console-helpers.js.
 */
export interface FormExport {
  fields: Array<[string, string]>;
  notes: string[];
  /** The fields were kept, so the export sends a form. */
  sent: boolean;
}

export function formExport(entry: XrayEntry): FormExport | null {
  const method = entry.method || 'GET';
  if (entry.requestBodyKind !== 'formdata' || method === 'GET' || method === 'HEAD') return null;
  const fields: Array<[string, string]> = [];
  const notes: string[] = [];
  const pairs: unknown = entry.requestBody;
  if (!Array.isArray(pairs)) notes.push('the form fields were not kept with this entry, so the body is left out');
  else {
    for (const pair of pairs as unknown[]) {
      if (!Array.isArray(pair) || pair.length < 2) continue;
      const name = String(pair[0]);
      const value: unknown = pair[1];
      if (value && typeof value === 'object') {
        const file = value as { file?: unknown; size?: unknown; type?: unknown };
        notes.push(`the file in field ${noteText(name)} (${noteText(file.file ?? '')}, ${noteText(file.type ?? '')}, ${Number(file.size) || 0} bytes) was not captured`);
      } else {
        fields.push([name, String(value ?? '')]);
      }
    }
  }
  if (entry.requestTruncated) notes.push('the form was cut at capture, so its last field may be short and later fields are missing');
  return { fields, notes, sent: Array.isArray(pairs) };
}

/**
 * Page data inside a comment: quoted, every line break escaped (JSON.stringify escapes \n and \r;
 * U+2028 and U+2029 end a JavaScript comment too), so it can never end the comment early.
 */
export function noteText(value: unknown): string {
  return JSON.stringify(String(value)).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

/** `// Partial: …` lines (`#` for a shell) ahead of an export that is not the whole request. */
export function partialNotes(notes: readonly string[], marker = '//'): string {
  return notes.map((note) => `${marker} Partial: ${note}.\n`).join('');
}

/**
 * The headers an export sends with a FormData: the captured multipart Content-Type goes, since its
 * boundary belongs to the original body; curl, fetch, Axios and Playwright write their own.
 */
export function formHeaders(entry: XrayEntry): Record<string, unknown> {
  const headers: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(entry.requestHeaders || {})) {
    if (String(key).toLowerCase() === 'content-type' && /^\s*multipart\//i.test(String(value))) continue;
    Object.defineProperty(headers, key, { value, writable: true, enumerable: true, configurable: true });
  }
  return headers;
}

/** The JavaScript that rebuilds the form: `const form = new FormData();` and one append per text field. */
export function formCode(fields: ReadonlyArray<[string, string]>, indent = ''): string {
  return [`${indent}const form = new FormData();\n`, ...fields.map(([name, value]) => `${indent}form.append(${JSON.stringify(name)}, ${JSON.stringify(value)});\n`)].join('');
}

/**
 * A form field as curl's argument, as a browser's FormData sends it: the multipart encoding writes
 * every line break as CRLF, so one with a line break is $'…'-quoted (the CR survives a paste) and its
 * breaks normalized; anything else is single-quoted.
 */
function formArg(text: string): string {
  if (!/[\r\n]/.test(text)) return shellQuote(text);
  const crlf = text.replace(/\r\n|\r|\n/g, '\r\n');
  return `$'${crlf.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r/g, '\\r').replace(/\n/g, '\\n')}'`;
}

export function buildCurl(entry: XrayEntry | null): string {
  if (window.XRAY_ConsoleHelpers?.generateCurl) return window.XRAY_ConsoleHelpers.generateCurl(entry);
  if (!entry) return '// No request selected';
  const form = formExport(entry);
  const body = form ? null : requestCodeText(entry);
  // --form-string takes the value literally: -F reads a value starting with @ or < from a local file
  // and cuts one at ";type=". A name ends at its first "=", so such a name cannot be sent.
  const notes = form ? partialNotes([...form.notes, ...form.fields.filter(([name]) => name.includes('='))
    .map(([name]) => `field ${noteText(name)} is left out: curl cannot send a name that contains "="`)], '#')
    : body !== null && typeof body === 'object' ? partialNotes([body.note], '#') : '';
  let command = `${notes}curl ${shellQuote(entry.url || '')} \\\n  -X ${shellQuote(entry.method || 'GET')}`;
  for (const [key, value] of Object.entries(form ? formHeaders(entry) : entry.requestHeaders || {})) {
    command += ` \\\n  -H ${shellQuote(`${String(key)}: ${String(value)}`)}`;
  }
  if (form) {
    for (const [name, value] of form.fields) {
      if (!name.includes('=')) command += ` \\\n  --form-string ${formArg(`${name}=${value}`)}`;
    }
    return command;
  }
  if (typeof body === 'string') command += ` \\\n  --data-raw ${shellQuote(body)}`;
  return command;
}

export function buildFetch(entry: XrayEntry | null): string {
  if (window.XRAY_ConsoleHelpers?.generateFetch) return window.XRAY_ConsoleHelpers.generateFetch(entry);
  if (!entry) return '// No request selected';
  const form = formExport(entry);
  if (form) {
    const options = JSON.stringify({ method: entry.method || 'GET', headers: formHeaders(entry) }, null, 2);
    const notes = partialNotes(form.notes);
    if (!form.sent) return `${notes}fetch(${JSON.stringify(entry.url || '')}, ${options})`;
    return `${notes}${formCode(form.fields)}\nfetch(${JSON.stringify(entry.url || '')}, ${options.replace(/\n\}$/, ',\n  "body": form\n}')})`;
  }
  const options: Record<string, unknown> = { method: entry.method || 'GET', headers: entry.requestHeaders || {} };
  const body = requestCodeText(entry);
  if (typeof body === 'string') options.body = body;
  const note = body !== null && typeof body === 'object' ? partialNotes([body.note]) : '';
  return `${note}fetch(${JSON.stringify(entry.url || '')}, ${JSON.stringify(options, null, 2)})`;
}

/**
 * Captured URL, method, status and response as JSON (the Mock export and Copy mock JSON). The response
 * is embedded through printJson (spec J10): every lexeme as captured, members in source order.
 */
export function buildMockPayload(entry: XrayEntry | null, limit = Infinity): string {
  if (!entry || entry.type !== 'api') return safeStringify('// Select an API request first', 2, limit);
  const text = printJson({ t: 'obj', entries: [
    { key: 'url', value: plainNode(entry.url || '') },
    { key: 'method', value: plainNode(String(entry.method || 'GET').toUpperCase()) },
    { key: 'status', value: plainNode(Number(entry.status) || 200) },
    { key: 'response', value: bodyExportNode(responseBody(entry)) },
  ] }, { indent: 2 });
  return text.length <= limit ? text : text.slice(0, limit) + `\n... truncated ${text.length - limit} chars`;
}

/**
 * A plain value (export metadata) as nodes, with safeStringify's rules for what JSON cannot hold: NaN
 * and ±Infinity become null, a cycle "[Circular]", a BigInt its digits with an "n". Exports compose
 * these with a body's lossless parse and print the whole with printJson.
 */
export function plainNode(value: unknown): JsonNode {
  const doc = parseJson(safeStringify(value, 0, Infinity));
  return doc.ok && doc.kind === 'json' ? doc.root : { t: 'null' };
}

/**
 * A body as nodes for an export (spec J10) — the value entryResponse/entryRequest give, but kept
 * lossless: a JSON text's parse (lexemes, member order and duplicates as captured), text that is not
 * JSON (or was cut) as one string, a value without text through plainNode, FormData fields and a
 * request's binary descriptor as captured; null for no body, an empty text, or bytes.
 */
export function bodyExportNode(body: CapturedBody): JsonNode {
  if (body.kind === 'none' || (body.kind === 'text' && body.text === '')) return { t: 'null' };
  if (body.kind === 'binary') return body.side === 'request' && body.binary ? plainNode(body.binary) : { t: 'null' };
  if (body.kind === 'value') return plainNode(body.value);
  if (body.format === 'formdata') return plainNode(body.pairs ?? body.text);
  if (body.format === 'urlencoded') return { t: 'str', value: body.text };
  const doc = bodyDoc(body);
  return doc && doc.ok ? doc.root : { t: 'str', value: body.text };
}

/**
 * A body's text for an export: the captured text verbatim (as kept, when it was cut); a value without
 * text printed as JSON with `indent`; '' for no body and for bytes.
 */
export function exportBodyText(body: CapturedBody, indent = 0): string {
  if (body.kind === 'text') return body.text;
  if (body.kind === 'value') return printJson(plainNode(body.value), { indent });
  return '';
}

export async function copyText(text: string): Promise<void> {
  if (typeof navigator === 'undefined' || typeof navigator.clipboard?.writeText !== 'function') {
    throw new Error('Clipboard is unavailable.');
  }
  await navigator.clipboard.writeText(text);
}

export function downloadText(filename: string, text: string, mime = 'text/plain;charset=utf-8'): void {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function schema(value: unknown): unknown {
  if (window.XRAY_ConsoleHelpers?.schema) return window.XRAY_ConsoleHelpers.schema(schemaSample(value, 0));
  return schemaOf(value, 0);
}

// Levels the fallback types before it says "any": MAX_SCHEMA_DEPTH in shared/console-helpers.js, so a
// surface without the helpers infers the same shape — and a deeply nested body (100,000 levels) has a
// shape instead of overflowing the stack.
const FALLBACK_SCHEMA_DEPTH = 5;

function schemaOf(value: unknown, depth: number): unknown {
  if (depth > FALLBACK_SCHEMA_DEPTH) return 'any';
  if (value instanceof LosslessNumber) return 'number';
  if (value === null) return 'null';
  if (Array.isArray(value)) return value.length ? [schemaOf(value[0], depth + 1)] : 'array';
  if (typeof value === 'object') {
    return Object.fromEntries(Object.entries(value || {}).map(([key, child]) => [key, schemaOf(child, depth + 1)]));
  }
  return typeof value;
}

// The console helpers' schema samples the first item of each array down to depth 5. Along that
// sample, a LosslessNumber becomes the number it approximates, so it types as "number" rather than
// as an object with a "raw" string. Copy-on-write: a value without one is passed through as it is.
const SCHEMA_SAMPLE_DEPTH = 6;

function schemaSample(value: unknown, depth: number): unknown {
  if (value instanceof LosslessNumber) return value.valueOf();
  if (!value || typeof value !== 'object' || depth > SCHEMA_SAMPLE_DEPTH) return value;
  if (Array.isArray(value)) {
    if (!value.length) return value;
    const first = schemaSample(value[0], depth + 1);
    return first === value[0] ? value : [first];
  }
  let copy: Record<string, unknown> | null = null;
  for (const [key, child] of Object.entries(value)) {
    const sampled = schemaSample(child, depth + 1);
    if (sampled === child) continue;
    copy ??= Object.defineProperties({}, Object.getOwnPropertyDescriptors(value)) as Record<string, unknown>;
    Object.defineProperty(copy, key, { value: sampled, writable: true, enumerable: true, configurable: true });
  }
  return copy ?? value;
}
