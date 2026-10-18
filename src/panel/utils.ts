import type { ConsoleEvent, XrayEntry } from './types';

export function parseBody(value: unknown): unknown {
  if (value == null || value === '') return null;
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed || (!trimmed.startsWith('{') && !trimmed.startsWith('['))) return value;
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
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
const entrySchemaCache = new WeakMap<object, unknown>();

export function entryResponse(entry: XrayEntry | null): unknown {
  if (!entry) return null;
  if (entryResponseCache.has(entry)) return entryResponseCache.get(entry);
  const parsed = parseBody(entry.responseDecrypted ?? entry.responseRaw ?? entry.response ?? null);
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

export function entryRequest(entry: XrayEntry | null): unknown {
  if (!entry) return null;
  return parseBody(entry.requestBody ?? null);
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

export function formatTime(timestamp?: number): string {
  const time = timestamp || Date.now();
  const second = Math.floor(time / 1000);
  const cached = timeCache.get(second);
  if (cached !== undefined) return cached;
  if (timeCache.size > 512) timeCache.clear();
  const formatted = timeFormatter.format(time);
  timeCache.set(second, formatted);
  return formatted;
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
    text = String(value);
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

// Fallbacks below mirror generateCurl / generateFetch / buildMock in
// shared/console-helpers.js exactly (a unit test pins parity), so a surface that did
// not load the shared script (or loaded it late) exports the same text.
function requestBodyText(entry: XrayEntry): string | null {
  const method = entry.method || 'GET';
  if (!entry.requestBody || method === 'GET' || method === 'HEAD') return null;
  return typeof entry.requestBody === 'string' ? entry.requestBody : JSON.stringify(entry.requestBody);
}

export function buildCurl(entry: XrayEntry | null): string {
  if (window.XRAY_ConsoleHelpers?.generateCurl) return window.XRAY_ConsoleHelpers.generateCurl(entry);
  if (!entry) return '// No request selected';
  let command = `curl ${shellQuote(entry.url || '')} \\\n  -X ${shellQuote(entry.method || 'GET')}`;
  for (const [key, value] of Object.entries(entry.requestHeaders || {})) {
    command += ` \\\n  -H ${shellQuote(`${String(key)}: ${String(value)}`)}`;
  }
  const body = requestBodyText(entry);
  if (body != null) command += ` \\\n  --data-raw ${shellQuote(body)}`;
  return command;
}

export function buildFetch(entry: XrayEntry | null): string {
  if (window.XRAY_ConsoleHelpers?.generateFetch) return window.XRAY_ConsoleHelpers.generateFetch(entry);
  if (!entry) return '// No request selected';
  const options: Record<string, unknown> = { method: entry.method || 'GET', headers: entry.requestHeaders || {} };
  const body = requestBodyText(entry);
  if (body != null) options.body = body;
  return `fetch(${JSON.stringify(entry.url || '')}, ${JSON.stringify(options, null, 2)})`;
}

export function buildMockPayload(entry: XrayEntry | null, limit = Infinity): string {
  let mock: unknown;
  if (window.XRAY_ConsoleHelpers?.buildMock) mock = window.XRAY_ConsoleHelpers.buildMock(entry);
  else if (!entry || entry.type !== 'api') mock = '// Select an API request first';
  else {
    mock = {
      url: entry.url || '',
      method: (entry.method || 'GET').toUpperCase(),
      status: Number(entry.status) || 200,
      response: parseBody(entry.responseDecrypted || entry.responseRaw),
    };
  }
  return safeStringify(mock, 2, limit);
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
  if (window.XRAY_ConsoleHelpers?.schema) return window.XRAY_ConsoleHelpers.schema(value);
  if (value === null) return 'null';
  if (Array.isArray(value)) return value.length ? [schema(value[0])] : 'array';
  if (typeof value === 'object') {
    return Object.fromEntries(Object.entries(value || {}).map(([key, child]) => [key, schema(child)]));
  }
  return typeof value;
}
