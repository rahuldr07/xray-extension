import type { XrayEntry } from '../types';
import { buildCurl, buildFetch, entryRequest, entryResponse, safeStringify, schema } from '../utils';

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
  | 'session-har';

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
  { label: 'Session', formats: ['session-json', 'session-csv', 'session-har'] },
];

export const exportFormats: ExportFormat[] = exportGroups.flatMap((group) => group.formats);

export const exportMeta: Record<ExportFormat, ExportMeta> = {
  curl: { title: 'cURL command', desc: 'Universal shell command with method, headers, and body.', extension: 'sh' },
  fetch: { title: 'fetch() request', desc: 'Async JavaScript request with status handling.', extension: 'ts' },
  axios: { title: 'Axios request', desc: 'Axios call with method, URL, headers, and body.', extension: 'ts' },
  json: { title: 'Selected JSON', desc: 'Captured request metadata plus parsed response.', extension: 'json' },
  raw: { title: 'Raw response', desc: 'The selected response body as text or JSON.', extension: 'txt' },
  schema: { title: 'Response schema', desc: 'Inferred structural schema from the selected response.', extension: 'json' },
  mock: { title: 'Mock response', desc: 'Generated mock payload using XRAY helpers when available.', extension: 'json' },
  typescript: { title: 'TypeScript type', desc: 'Static TypeScript shape inferred from response data.', extension: 'ts' },
  zod: { title: 'Zod schema', desc: 'Runtime validation schema inferred from response data.', extension: 'ts' },
  jest: { title: 'Jest test', desc: 'Starter test with mocked response behavior.', extension: 'test.ts' },
  msw: { title: 'MSW handler', desc: 'Mock Service Worker handler for the captured endpoint.', extension: 'ts' },
  playwright: { title: 'Playwright test', desc: 'API test that re-fires the request and asserts its status.', extension: 'spec.ts' },
  'session-json': { title: 'Session JSON', desc: 'All captured entries in XRAY session format.', extension: 'json' },
  'session-csv': { title: 'Session CSV', desc: 'Flat API request summary for spreadsheets.', extension: 'csv' },
  'session-har': { title: 'Session HAR', desc: 'HTTP Archive compatible export.', extension: 'har' },
};

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

export function buildAxios(entry: XrayEntry | null): string {
  if (!entry) return '// Select an API request first';
  const method = String(entry.method || 'GET').toLowerCase();
  const body = entryRequest(entry);
  const options = {
    method,
    url: String(entry.url || ''),
    headers: headerObject(entry),
    ...(body == null ? {} : { data: body }),
  };
  return `import axios from 'axios';\n\nconst response = await axios(${safeStringify(options, 2, 120_000)});\nconst data = response.data;`;
}

export function buildSessionCsv(entries: XrayEntry[]): string {
  const escape = (value: unknown): string => {
    const text = String(value ?? '');
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const rows = entries.filter((entry) => entry.type === 'api').map((entry) => [
    entry.id,
    entry.method || '',
    entry.status || '',
    entry.url || entry.urlPath || '',
    entry.source || '',
    entry.duration || '',
    entry.size || '',
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
  const text = body == null ? '' : typeof body === 'string' ? body : safeStringify(body, 2, 120_000);
  // Measure the string actually emitted: `size` was computed from the compact form
  // while `text` is written pretty-printed, so the two disagreed on every real body.
  return { size: Number(entry.size) || text.length, mimeType: responseContentType(entry), text };
}

export function buildSessionHar(entries: XrayEntry[]): string {
  const harEntries = entries.filter((entry) => entry.type === 'api').map((entry) => ({
    startedDateTime: isoOrEmpty(entry.timestamp, new Date().toISOString()),
    time: Number(entry.duration) || 0,
    request: {
      method: entry.method || 'GET',
      url: entry.url || entry.urlPath || '',
      httpVersion: 'HTTP/1.1',
      headers: Object.entries(headerObject(entry)).map(([name, value]) => ({ name, value: String(value) })),
      queryString: [],
      cookies: [],
      headersSize: -1,
      bodySize: entry.requestBody ? safeStringify(entry.requestBody, 0).length : 0,
      postData: entry.requestBody ? { mimeType: 'application/json', text: safeStringify(entryRequest(entry), 2, 120_000) } : undefined,
    },
    response: {
      status: Number(entry.status) || 0,
      statusText: '',
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
  return safeStringify({ log: { version: '1.2', creator: { name: 'XRAY', version: 'react-preview' }, entries: harEntries } }, 2, Infinity);
}

function buildJest(entry: XrayEntry | null): string {
  if (!entry) return '// Select an API request first';
  const data = entryResponse(entry);
  return `global.fetch = jest.fn();\n\ndescribe(${JSON.stringify(String(entry.urlPath || entry.url || 'captured request'))}, () => {\n  beforeEach(() => {\n    (global.fetch as jest.Mock).mockResolvedValue({\n      ok: ${Number(entry.status) < 400},\n      status: ${Number(entry.status) || 200},\n      headers: { get: () => ${JSON.stringify(responseContentType(entry))} },\n      json: async () => (${safeStringify(data, 2, 120_000)}),\n      text: async () => ${JSON.stringify(typeof data === 'string' ? data : safeStringify(data, 0, 120_000))},\n    });\n  });\n\n  afterEach(() => jest.clearAllMocks());\n\n  it('handles the captured response', async () => {\n    const response = await fetch(${JSON.stringify(String(entry.url || entry.urlPath || ''))});\n    expect(response.status).toBe(${Number(entry.status) || 200});\n  });\n});`;
}

function buildMsw(entry: XrayEntry | null): string {
  if (!entry) return '// Select an API request first';
  const method = String(entry.method || 'GET').toLowerCase();
  const data = entryResponse(entry);
  const isJson = responseContentType(entry).toLowerCase().includes('json');
  const response = isJson
    ? `HttpResponse.json(${safeStringify(data, 2, 120_000)}, { status: ${Number(entry.status) || 200} })`
    : `new HttpResponse(${JSON.stringify(typeof data === 'string' ? data : safeStringify(data, 0, 120_000))}, { status: ${Number(entry.status) || 200} })`;
  return `import { http, HttpResponse } from 'msw';\n\nexport const handlers = [\n  http.${method}(${JSON.stringify(String(entry.url || entry.urlPath || ''))}, async () => {\n    return ${response};\n  }),\n];`;
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
  if (body != null && method !== 'get' && method !== 'head') options.data = body;
  const optsArg = Object.keys(options).length ? `, ${safeStringify(options, 2, 120_000)}` : '';
  const call = convenience
    ? `request.${method}(${JSON.stringify(url)}${optsArg})`
    : `request.fetch(${JSON.stringify(url)}${optsArg})`;
  const isJson = responseContentType(entry).toLowerCase().includes('json');
  const bodyLine = isJson ? '  const body = await response.json();' : '  const body = await response.text();';
  return `import { test, expect } from '@playwright/test';\n\ntest(${JSON.stringify(title)}, async ({ request }) => {\n  const response = await ${call};\n  expect(response.status()).toBe(${status});\n${bodyLine}\n  expect(body).toBeTruthy();\n});`;
}

export function filenameForExport(entry: XrayEntry | null, format: ExportFormat): string {
  const path = String(entry?.urlPath || entry?.url || 'session')
    .replace(/^https?:\/\//, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'session';
  const meta = exportMeta[format];
  return `xray-${path}-${format}.${meta.extension}`;
}

export function mimeForExport(format: ExportFormat): string {
  if (format === 'session-csv') return 'text/csv;charset=utf-8';
  if (format === 'session-har' || format === 'session-json' || format === 'json' || format === 'schema' || format === 'mock') {
    return 'application/json;charset=utf-8';
  }
  if (format === 'raw') return 'text/plain;charset=utf-8';
  if (format === 'curl') return 'text/x-shellscript;charset=utf-8';
  return 'text/typescript;charset=utf-8';
}

export function exportText(entry: XrayEntry | null, entries: XrayEntry[], format: ExportFormat): string {
  if (format === 'session-json') return safeStringify({ entries }, 2, Infinity);
  if (format === 'session-csv') return buildSessionCsv(entries);
  if (format === 'session-har') return buildSessionHar(entries);
  // Log entries have no URL/method/response, so every entry-scoped format
  // would render nonsense like `curl "" -X GET` for them.
  if (!entry || entry.type !== 'api') return '// Select an API request first';
  if (format === 'curl') return buildCurl(entry);
  if (format === 'fetch') return buildFetch(entry);
  if (format === 'axios') return buildAxios(entry);
  if (format === 'schema') return safeStringify(schema(entryResponse(entry)));
  if (format === 'mock') {
    const mock = window.XRAY_ConsoleHelpers?.buildMock?.(entry) || entryResponse(entry);
    return safeStringify(mock, 2, 120_000);
  }
  if (format === 'typescript') return buildTypeScriptShape(entryResponse(entry));
  if (format === 'zod') return buildZodSchema(entryResponse(entry));
  if (format === 'jest') return buildJest(entry);
  if (format === 'msw') return buildMsw(entry);
  if (format === 'playwright') return buildPlaywright(entry);
  if (format === 'raw') {
    const raw = entry.responseDecrypted ?? entry.responseRaw ?? entryResponse(entry);
    return typeof raw === 'string' ? raw : safeStringify(raw, 2, 120_000);
  }
  return safeStringify(entry ? { entry, response: entryResponse(entry) } : { entries }, 2, 120_000);
}
