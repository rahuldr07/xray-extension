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

export function safeStringify(value: unknown, space = 2, limit = 80_000): string {
  const seen = new WeakSet<object>();
  let text = '';

  try {
    text = JSON.stringify(value, (_key, child) => {
      if (typeof child === 'bigint') return child.toString() + 'n';
      if (child && typeof child === 'object') {
        if (seen.has(child)) return '[Circular]';
        seen.add(child);
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

export function eventEntry(event: ConsoleEvent): XrayEntry | null {
  return event.type === 'network' && event.args?.[0] && typeof event.args[0] === 'object'
    ? event.args[0] as XrayEntry
    : null;
}

export function buildCurl(entry: XrayEntry | null): string {
  if (window.XRAY_ConsoleHelpers?.generateCurl) return window.XRAY_ConsoleHelpers.generateCurl(entry);
  if (!entry) return '// Select an API request first';
  return `curl ${JSON.stringify(entry.url || '')} -X ${(entry.method || 'GET').toUpperCase()}`;
}

export function buildFetch(entry: XrayEntry | null): string {
  if (window.XRAY_ConsoleHelpers?.generateFetch) return window.XRAY_ConsoleHelpers.generateFetch(entry);
  if (!entry) return '// Select an API request first';
  return `fetch(${JSON.stringify(entry.url || '')})`;
}

export function buildMockPayload(entry: XrayEntry | null): string {
  const mock = window.XRAY_ConsoleHelpers?.buildMock?.(entry) || entryResponse(entry);
  return safeStringify(mock, 2, 120_000);
}

export async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard?.writeText?.(text);
  } catch {}
}

export function downloadText(filename: string, text: string, mime = 'text/plain;charset=utf-8'): void {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
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
