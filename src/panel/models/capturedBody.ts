/**
 * A facet's body as captured (docs/superpowers/specs/2026-10-14-json-fidelity-design.md §2–3, J2–J6).
 *
 * The captured text is the source of truth: the Raw view shows it verbatim, the Tree renders its
 * lossless parse, and entryResponse/entryRequest (utils.ts) derive their plain values from the same
 * parse. This module says what a body is — text (and how it was sent), a value with no text, bytes
 * that are not text, or nothing — with its truncation: metadata from capture or the saved session
 * (J6, J9), or, for an imported entry, the in-band "\n... truncated N chars" suffix capture wrote
 * before J6 (read back as metadata, never shown as text). An imported file carries no version; a
 * saved session is migrated by its schema version instead (sessionStore.ts upgradeLegacyEntry), so a
 * captured or restored body that really ends in that phrase is never read as cut.
 *
 * Parsing: JSON content types always parse; any other text only when it looks like JSON (the spec's
 * heuristic, extended to scalars). A truncated body never parses — its prefix is not the JSON that
 * was sent. One bounded cache of parsed docs, keyed by text, serves every view; views parse a big body
 * off the render path (bodyNeedsDeferredParse).
 */
import type { BinaryBodyDescriptor, BodyTruncation, FormDataPair, StreamBodyDescriptor, XrayEntry } from '../types';
import { fromValue, parseJson, toValue, type JsonDoc, type JsonEntry, type JsonNode, type JsonObjectNode } from './jsonText';

export type BodySide = 'response' | 'request';
/** none: no body; text: captured text; value: a body that exists only as a value; binary: bytes that are not text. */
export type BodyKind = 'none' | 'text' | 'value' | 'binary';
/** How a text body was sent (requestBodyKind): plain text, URLSearchParams, or a rendering of FormData fields. */
export type BodyFormat = 'text' | 'urlencoded' | 'formdata';

export interface CapturedBody {
  side: BodySide;
  kind: BodyKind;
  format: BodyFormat;
  /** The captured text, verbatim ('' for a kind without text; '' is also a real empty body). */
  text: string;
  /** The media type from the facet's headers, lowercased, without parameters ('' when unknown). */
  contentType: string;
  truncation: BodyTruncation | null;
  /** The truncation was read from an in-band suffix (an entry stored before J6). */
  legacyTruncation: boolean;
  /** kind 'value': a decrypted value or a request body stored before J4 as its parsed value. */
  value?: unknown;
  /** kind 'binary': the descriptor captured instead of the bytes. */
  binary?: BinaryBodyDescriptor | StreamBodyDescriptor;
  /** format 'formdata': the fields as captured. */
  pairs?: FormDataPair[];
  /** The body shown is the decrypted response (responseDecrypted), not the captured text. */
  decrypted?: boolean;
  /** XHR responseType 'json': the text was rebuilt from the parsed response, not the bytes received. */
  reserialized?: boolean;
  /** The capture kept the entry but lost part of it (entry.captureDegraded): the body may be missing or partial. */
  degraded?: boolean;
}

// --------------------------------------------------------------- body model

const bodyCache = new WeakMap<object, { response?: CapturedBody; request?: CapturedBody }>();

export function entryBody(entry: XrayEntry, side: BodySide): CapturedBody {
  return side === 'request' ? requestBody(entry) : responseBody(entry);
}

export function responseBody(entry: XrayEntry): CapturedBody {
  const cached = bodyCache.get(entry);
  if (cached?.response) return cached.response;
  const body = flagDegraded(entry, readResponse(entry));
  bodyCache.set(entry, { ...cached, response: body });
  return body;
}

export function requestBody(entry: XrayEntry): CapturedBody {
  const cached = bodyCache.get(entry);
  if (cached?.request) return cached.request;
  const body = flagDegraded(entry, readRequest(entry));
  bodyCache.set(entry, { ...cached, request: body });
  return body;
}

function flagDegraded(entry: XrayEntry, body: CapturedBody): CapturedBody {
  return entry.captureDegraded === true ? { ...body, degraded: true } : body;
}

function emptyBody(side: BodySide, contentType: string): CapturedBody {
  return { side, kind: 'none', format: 'text', text: '', contentType, truncation: null, legacyTruncation: false };
}

function readResponse(entry: XrayEntry): CapturedBody {
  const contentType = mediaType(headerValue(entry.responseHeaders, 'content-type') || (typeof entry.contentType === 'string' ? entry.contentType : ''));
  const imported = entry.imported === true;
  const decrypted = entry.responseDecrypted;
  if (decrypted !== undefined && decrypted !== null) {
    if (typeof decrypted === 'string') {
      return { ...textBody('response', decrypted, contentType, metadataTruncation(entry.responseDecryptedTruncated), imported), decrypted: true };
    }
    return { ...emptyBody('response', contentType), kind: 'value', value: decrypted, decrypted: true };
  }
  const raw = entry.responseRaw ?? entry.response;
  if (raw === undefined || raw === null) {
    const binary = entry.responseBinary;
    if (isBinaryDescriptor(binary)) return { ...emptyBody('response', contentType), kind: 'binary', binary };
    return emptyBody('response', contentType);
  }
  if (typeof raw !== 'string') return { ...emptyBody('response', contentType), kind: 'value', value: raw };
  const body = textBody('response', raw, contentType, metadataTruncation(entry.responseTruncated), imported);
  return entry.bodyReserialized === true ? { ...body, reserialized: true } : body;
}

function readRequest(entry: XrayEntry): CapturedBody {
  const contentType = mediaType(headerValue(entry.requestHeaders, 'content-type'));
  const kind = entry.requestBodyKind;
  const truncation = metadataTruncation(entry.requestTruncated);
  if (kind === 'none') return emptyBody('request', contentType);
  if (kind === 'binary') {
    const binary = entry.requestBody;
    if (isBinaryDescriptor(binary)) return { ...emptyBody('request', contentType), kind: 'binary', binary };
    return emptyBody('request', contentType);
  }
  const text = entry.requestBodyText;
  if (typeof text === 'string') {
    // A saved session may keep FormData's text rendering without its fields (J9): it is then that text.
    if (kind === 'formdata' && Array.isArray(entry.requestBody)) {
      return { ...textBody('request', text, contentType, truncation, false), format: 'formdata', pairs: entry.requestBody as FormDataPair[] };
    }
    if (kind === 'urlencoded') return { ...textBody('request', text, contentType, truncation, false), format: 'urlencoded' };
    return textBody('request', text, contentType, truncation, false);
  }
  // Stored before J4: the request body is its text, or the value the interceptor parsed it into.
  const legacy = entry.requestBody;
  if (legacy === undefined || legacy === null || legacy === '') return emptyBody('request', contentType);
  if (typeof legacy === 'string') return textBody('request', legacy, contentType, truncation, entry.imported === true);
  return { ...emptyBody('request', contentType), kind: 'value', value: legacy };
}

/** `readSuffix`: the entry is imported data, which may predate J6 (see the module comment). */
function textBody(side: BodySide, text: string, contentType: string, truncation: BodyTruncation | null, readSuffix: boolean): CapturedBody {
  if (!truncation && readSuffix) {
    const legacy = legacySuffix(text);
    if (legacy) {
      return {
        side, kind: 'text', format: 'text', text: text.slice(0, legacy.kept), contentType,
        truncation: { keptChars: legacy.kept, totalChars: legacy.kept + legacy.omitted }, legacyTruncation: true,
      };
    }
  }
  return { side, kind: 'text', format: 'text', text, contentType, truncation, legacyTruncation: false };
}

const SUFFIX_HEAD = '\n... truncated ';
const SUFFIX_TAIL = ' chars';

/** The in-band suffix capture appended before J6: "\n... truncated 688891 chars" at the very end. */
export function legacySuffix(text: string): { kept: number; omitted: number } | null {
  if (!text.endsWith(SUFFIX_TAIL)) return null;
  const at = text.lastIndexOf(SUFFIX_HEAD);
  if (at < 0) return null;
  const digits = text.slice(at + SUFFIX_HEAD.length, text.length - SUFFIX_TAIL.length);
  if (!/^\d{1,15}$/.test(digits)) return null;
  return { kept: at, omitted: Number(digits) };
}

/** Capture and the saved session give a total; a cut a session made before J9 has none (keptChars alone). */
function metadataTruncation(value: unknown): BodyTruncation | null {
  if (!value || typeof value !== 'object') return null;
  const { keptChars, totalChars, totalBytes } = value as Record<string, unknown>;
  if (!isCount(keptChars)) return null;
  const out: BodyTruncation = { keptChars };
  if (isCount(totalChars)) out.totalChars = totalChars;
  if (isCount(totalBytes)) out.totalBytes = totalBytes;
  return out;
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function isBinaryDescriptor(value: unknown): value is BinaryBodyDescriptor | StreamBodyDescriptor {
  return !!value && typeof value === 'object' && (value as { binary?: unknown }).binary === true;
}

function headerValue(headers: unknown, name: string): string {
  if (!headers || typeof headers !== 'object') return '';
  for (const [key, value] of Object.entries(headers as Record<string, unknown>)) {
    if (key.toLowerCase() === name) return value == null ? '' : String(value);
  }
  return '';
}

function mediaType(value: string): string {
  const semicolon = value.indexOf(';');
  return (semicolon < 0 ? value : value.slice(0, semicolon)).trim().toLowerCase();
}

// ------------------------------------------------------------ JSON or not

const JSON_TYPE = /^(?:application|text)\/(?:x-)?(?:[\w.!#$&^-]+\+)?json(?:-seq)?$/;
const LINE_TYPES = new Set(['application/x-ndjson', 'application/jsonl']);

export function isJsonContentType(type: string): boolean {
  return JSON_TYPE.test(type) || LINE_TYPES.has(type);
}

const XSSI_GUARDS = [")]}'", 'while(1);', 'for(;;);', 'for (;;);'];

/** Starts (after a BOM and whitespace) like a JSON value or an XSSI guard. */
export function looksLikeJson(text: string): boolean {
  let i = text.charCodeAt(0) === 0xfeff ? 1 : 0;
  while (i < text.length) {
    const c = text.charCodeAt(i);
    if (c !== 0x20 && c !== 0x09 && c !== 0x0a && c !== 0x0d) break;
    i++;
  }
  if (i >= text.length) return false;
  const c = text[i];
  if ('{["-0123456789'.includes(c)) return true;
  for (const guard of XSSI_GUARDS) if (text.startsWith(guard, i)) return true;
  for (const word of ['true', 'false', 'null']) {
    if (text.startsWith(word, i)) return !/[\w$]/.test(text.charAt(i + word.length));
  }
  return false;
}

/** Views parse this body as JSON: a whole (not truncated), non-empty text that is JSON by type or by look. */
export function parsesAsJson(body: CapturedBody): boolean {
  return body.kind === 'text' && body.format === 'text' && body.text !== '' && !body.truncation &&
    (isJsonContentType(body.contentType) || looksLikeJson(body.text));
}

// ---------------------------------------------------------------- doc cache

/**
 * A body this long parses in an idle callback, with a "Parsing…" state, when it is not cached yet.
 * Below it (every captured body: the capture cap is 250,000 characters) the parse takes a few
 * milliseconds during render.
 */
export const DEFER_PARSE_CHARS = 1_000_000;
// Bounded by count and by the text they hold: a parsed 5 MB body holds tens of MB of nodes.
const DOC_CACHE_ENTRIES = 16;
const DOC_CACHE_CHARS = 12_000_000;
const docCache = new Map<string, Map<string, JsonDoc>>();
let docCacheChars = 0;

/** The parse is the same for every media type except the record-based ones. */
function parseMode(contentType: string): string {
  return LINE_TYPES.has(contentType) || contentType === 'application/json-seq' ? contentType : '';
}

/** A record-based media type (NDJSON, JSON Lines, JSON text sequences): its parse is a list of documents. */
export function readsRecords(contentType: string): boolean {
  return parseMode(contentType) !== '';
}

/** The cached doc: undefined when not parsed yet, null when the body does not parse as JSON. */
export function peekBodyDoc(body: CapturedBody): JsonDoc | null | undefined {
  if (!parsesAsJson(body)) return null;
  const docs = docCache.get(body.text);
  const doc = docs?.get(parseMode(body.contentType));
  if (!doc) return undefined;
  docCache.delete(body.text); // most recently used last
  docCache.set(body.text, docs as Map<string, JsonDoc>);
  return doc;
}

/** The body's lossless parse (cached), or null when it does not parse as JSON. Never throws. */
export function bodyDoc(body: CapturedBody): JsonDoc | null {
  const cached = peekBodyDoc(body);
  if (cached !== undefined) return cached;
  const doc = parseJson(body.text, { contentType: body.contentType });
  let docs = docCache.get(body.text);
  if (!docs) {
    docs = new Map();
    docCache.set(body.text, docs);
    docCacheChars += body.text.length;
  }
  docs.set(parseMode(body.contentType), doc);
  for (const [text] of docCache) {
    if (docCache.size <= 1 || (docCache.size <= DOC_CACHE_ENTRIES && docCacheChars <= DOC_CACHE_CHARS)) break;
    docCache.delete(text);
    docCacheChars -= text.length;
  }
  return doc;
}

/** A body big enough to parse off the render path, and not parsed yet. */
export function bodyNeedsDeferredParse(body: CapturedBody): boolean {
  return body.text.length > DEFER_PARSE_CHARS && peekBodyDoc(body) === undefined;
}

// ------------------------------------------------------------------- values

/**
 * The plain value entryResponse/entryRequest give: the lossless parse as JavaScript (toValue: integers
 * past Number.MAX_SAFE_INTEGER are LosslessNumber) when the body parses, else the text; FormData
 * pairs; a request's binary descriptor; null for no body (and for an empty text, as before).
 */
export function bodyValue(body: CapturedBody): unknown {
  if (body.kind === 'value') return body.value;
  if (body.kind === 'binary') return body.side === 'request' ? body.binary ?? null : null;
  if (body.kind === 'none' || body.text === '') return null;
  if (body.format === 'formdata') return body.pairs ?? body.text;
  if (body.format === 'urlencoded') return body.text;
  const doc = bodyDoc(body);
  return doc && doc.ok ? toValue(doc.root) : body.text;
}

const builtNodes = new WeakMap<CapturedBody, JsonNode>();

/**
 * The body as nodes — what Table, Schema, Diff and Visualize read (J3, J11): a JSON body's lossless
 * parse (the doc every view shares), FormData or URL-encoded fields in the order sent, any other text
 * as one string, and a body that exists only as a value through fromValue (a decrypted value, a
 * request body stored before J4, a binary request's descriptor; a binary response reads as JSON null,
 * as bodyValue says). Null when there is no body: none, or an empty text. Built nodes are kept per
 * body, so a view keeps its state across renders.
 */
export function bodyNode(body: CapturedBody): JsonNode | null {
  if (body.kind === 'none' || (body.kind === 'text' && body.text === '')) return null;
  if (body.kind === 'text' && body.format === 'text') {
    const doc = bodyDoc(body);
    if (doc && doc.ok) return doc.root;
  }
  let node = builtNodes.get(body);
  if (!node) {
    if (body.kind !== 'text') node = fromValue(bodyValue(body));
    else if (body.format === 'formdata') node = formDataNode(body.pairs ?? []);
    else if (body.format === 'urlencoded') node = urlEncodedNode(body.text);
    else node = stringNode(body.text);
    builtNodes.set(body, node);
  }
  return node;
}

/**
 * What "Copy raw" gives when a body view fails to render (J12): the captured text — without a
 * legacy in-band suffix — the value, or the binary descriptor; null for no body.
 */
export function bodyRawValue(body: CapturedBody): unknown {
  if (body.kind === 'text') return body.text;
  if (body.kind === 'value') return body.value;
  if (body.kind === 'binary') return body.binary ?? null;
  return null;
}

// ----------------------------------------------------------------- display

const count = (value: number): string => value.toLocaleString('en-US');

/** "Response truncated: showing the first 250,000 of 938,891 characters" (null when whole). */
export function truncationNotice(body: CapturedBody): string | null {
  const cut = body.truncation;
  if (!cut) return null;
  const facet = body.side === 'request' ? 'Request' : 'Response';
  const shown = count(body.text.length);
  if (typeof cut.totalChars === 'number') return `${facet} truncated: showing the first ${shown} of ${count(cut.totalChars)} characters`;
  if (typeof cut.totalBytes === 'number') return `${facet} truncated: showing the first ${shown} characters of ${count(cut.totalBytes)} bytes`;
  return `${facet} truncated: showing the first ${shown} characters`;
}

function stringNode(value: string): JsonNode {
  return { t: 'str', value };
}

function numberNode(value: number): JsonNode {
  const safe = Number.isFinite(value) ? value : 0;
  return { t: 'num', raw: String(safe), value: safe, exact: true };
}

function objectNode(members: Array<[string, JsonNode]>): JsonObjectNode {
  const seen = new Set<string>();
  const entries: JsonEntry[] = [];
  for (const [key, value] of members) {
    const entry: JsonEntry = { key, value };
    if (seen.has(key)) entry.dup = true;
    else seen.add(key);
    entries.push(entry);
  }
  return { t: 'obj', entries };
}

/** FormData fields as an object node in field order; a repeated name is marked like a duplicate key. */
export function formDataNode(pairs: readonly unknown[]): JsonObjectNode {
  const members: Array<[string, JsonNode]> = [];
  for (const pair of pairs) {
    if (!Array.isArray(pair) || pair.length < 2) continue;
    const value = pair[1] as unknown;
    if (value && typeof value === 'object' && 'file' in value) {
      const file = value as { file?: unknown; size?: unknown; type?: unknown };
      members.push([String(pair[0]), objectNode([
        ['file', stringNode(String(file.file ?? ''))],
        ['size', numberNode(Number(file.size))],
        ['type', stringNode(String(file.type ?? ''))],
      ])]);
    } else {
      members.push([String(pair[0]), stringNode(typeof value === 'string' ? value : String(value))]);
    }
  }
  return objectNode(members);
}

/** URL-encoded parameters as an object node in order (`+` and %XX decoded); repeats marked. */
export function urlEncodedNode(text: string): JsonObjectNode {
  const members: Array<[string, JsonNode]> = [];
  for (const [key, value] of new URLSearchParams(text)) members.push([key, stringNode(value)]);
  return objectNode(members);
}
