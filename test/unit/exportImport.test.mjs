/* Behavioural tests for src/panel/models/export.ts + import.ts, including the
   buildSessionHar -> parseImport round-trip. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { exportModel as E, importModel as I, apiEntry, logEntry, assertSchemaFallback } from './harness.mjs';

const {
  buildAxios,
  buildSessionCsv,
  buildSessionHar,
  buildTypeScriptShape,
  buildZodSchema,
  exportFormats,
  exportGroups,
  exportMeta,
  exportText,
  filenameForExport,
  mimeForExport,
} = E;
const { parseImport } = I;

const NO_SELECTION = '// Select an API request first';

const richEntry = () => apiEntry({
  method: 'POST',
  url: 'https://api.example.com/v1/orders?page=2',
  urlPath: '/v1/orders',
  status: 201,
  duration: 137,
  size: 42,
  requestHeaders: { 'content-type': 'application/json', 'x-trace': 'abc' },
  responseHeaders: { 'content-type': 'application/json; charset=utf-8' },
  requestBody: '{"sku":"A1","qty":2}',
  responseRaw: '{"id":7,"items":[{"sku":"A1","qty":2}],"ok":true}',
});

// ------------------------------------------------------------------ metadata

test('exportFormats is the flattened group list and every format has metadata', () => {
  assert.deepEqual(exportFormats, exportGroups.flatMap((group) => group.formats));
  assert.equal(new Set(exportFormats).size, exportFormats.length, 'no duplicated formats');
  for (const format of exportFormats) {
    const meta = exportMeta[format];
    assert.ok(meta && meta.title && meta.desc && meta.extension, `missing metadata for ${format}`);
  }
  assert.deepEqual(Object.keys(exportMeta).sort(), [...exportFormats].sort());
});

test('mimeForExport maps each format to a sane content type', () => {
  assert.equal(mimeForExport('session-csv'), 'text/csv;charset=utf-8');
  for (const format of ['session-har', 'session-json', 'json', 'schema', 'mock']) {
    assert.equal(mimeForExport(format), 'application/json;charset=utf-8', format);
  }
  assert.equal(mimeForExport('raw'), 'text/plain;charset=utf-8');
  assert.equal(mimeForExport('curl'), 'text/x-shellscript;charset=utf-8');
  assert.equal(mimeForExport('typescript'), 'text/typescript;charset=utf-8');
});

test('filenameForExport sanitizes the path and always yields a usable name', () => {
  assert.equal(filenameForExport(apiEntry({ urlPath: '/v1/users' }), 'curl'), 'xray-v1-users-curl.sh');
  assert.equal(filenameForExport(apiEntry({ urlPath: '', url: 'https://api.example.com/a/b' }), 'json'), 'xray-api-example-com-a-b-json.json');
  assert.equal(filenameForExport(null, 'session-har'), 'xray-session-session-har.har');
  assert.equal(filenameForExport(apiEntry({ urlPath: '///', url: '' }), 'raw'), 'xray-session-raw.txt', 'a path of only separators degrades to "session"');
  const long = filenameForExport(apiEntry({ urlPath: '/' + 'a'.repeat(500) }), 'raw');
  assert.ok(long.length < 100, `expected a bounded filename, got ${long.length} chars`);
});

// -------------------------------------------------------- exportText matrix

test('exportText produces non-empty output for every format on a real entry', () => {
  assertSchemaFallback(assert);
  const entry = richEntry();
  const entries = [entry, apiEntry(), logEntry()];
  for (const format of exportFormats) {
    const text = exportText(entry, entries, format);
    assert.equal(typeof text, 'string', `${format} must return a string`);
    assert.ok(text.length > 0, `${format} returned an empty string`);
    assert.notEqual(text, NO_SELECTION, `${format} should not report "no selection" for a real API entry`);
  }
});

test('exportText: entry-scoped formats refuse a log entry or a null selection, session formats do not', () => {
  const entries = [apiEntry(), logEntry()];
  const entryScoped = exportFormats.filter((format) => !format.startsWith('session-'));
  for (const format of entryScoped) {
    assert.equal(exportText(null, entries, format), NO_SELECTION, `${format} with no selection`);
    assert.equal(exportText(logEntry(), entries, format), NO_SELECTION, `${format} with a log entry`);
  }
  for (const format of ['session-json', 'session-csv', 'session-har']) {
    assert.notEqual(exportText(null, entries, format), NO_SELECTION, `${format} works without a selection`);
  }
});

test('exportText curl/fetch use the local fallback when XRAY_ConsoleHelpers is absent', () => {
  const entry = richEntry();
  // Single-quoted: a double-quoted shell word still evaluates $(...) and backticks.
  assert.equal(exportText(entry, [entry], 'curl'), "curl 'https://api.example.com/v1/orders?page=2' -X 'POST'");
  assert.equal(exportText(entry, [entry], 'fetch'), 'fetch("https://api.example.com/v1/orders?page=2")');
});

test('exportText schema / typescript / zod all describe the same inferred shape', () => {
  const entry = richEntry();
  assert.deepEqual(JSON.parse(exportText(entry, [entry], 'schema')), {
    id: 'number',
    items: [{ sku: 'string', qty: 'number' }],
    ok: 'boolean',
  });
  const ts = exportText(entry, [entry], 'typescript');
  assert.match(ts, /^export type XrayResponse = \{/);
  assert.match(ts, /"id": number;/);
  assert.match(ts, /"items": \{[\s\S]*"sku": string;[\s\S]*\}\[\];/);

  const zod = exportText(entry, [entry], 'zod');
  assert.match(zod, /^import \{ z \} from 'zod';/);
  assert.match(zod, /export const xrayResponseSchema = z\.object\(\{/);
  assert.match(zod, /z\.array\(z\.object\(/);
});

test('buildTypeScriptShape / buildZodSchema handle scalars, nulls, arrays and empty arrays', () => {
  assert.equal(buildTypeScriptShape('text'), 'export type XrayResponse = string;');
  assert.equal(buildTypeScriptShape(null), 'export type XrayResponse = null;');
  assert.equal(buildTypeScriptShape([1, 2]), 'export type XrayResponse = number[];');
  assert.equal(buildTypeScriptShape([]), 'export type XrayResponse = unknown;', 'an empty array degrades to unknown');
  assert.equal(buildTypeScriptShape({ a: true }, 'Custom'), 'export type Custom = {\n  "a": boolean;\n};');

  assert.match(buildZodSchema('text'), /= z\.string\(\);$/);
  assert.match(buildZodSchema(null), /= z\.null\(\);$/);
  assert.match(buildZodSchema([]), /= z\.unknown\(\);$/);
  assert.match(buildZodSchema({ a: 1 }, 'my response'), /export const myResponseSchema =/);
});

test('exportText raw prefers the decrypted body and passes strings through untouched', () => {
  const decrypted = apiEntry({ responseRaw: '{"encrypted":true}', responseDecrypted: '{"plain":1}' });
  assert.equal(exportText(decrypted, [decrypted], 'raw'), '{"plain":1}');
  const text = apiEntry({ responseRaw: 'plain text body', responseDecrypted: null });
  assert.equal(exportText(text, [text], 'raw'), 'plain text body');
});

test('exportText mock falls back to the parsed response body', () => {
  const entry = richEntry();
  assert.deepEqual(JSON.parse(exportText(entry, [entry], 'mock')), { id: 7, items: [{ sku: 'A1', qty: 2 }], ok: true });
});

test('buildAxios emits a valid options object', () => {
  const entry = richEntry();
  const text = buildAxios(entry);
  assert.match(text, /^import axios from 'axios';/);
  const options = JSON.parse(text.slice(text.indexOf('axios(') + 6, text.lastIndexOf(')')));
  assert.deepEqual(options, {
    method: 'post',
    url: 'https://api.example.com/v1/orders?page=2',
    headers: { 'content-type': 'application/json', 'x-trace': 'abc' },
    data: { sku: 'A1', qty: 2 },
  });
  assert.equal(buildAxios(null), NO_SELECTION);
  const noBody = apiEntry({ requestBody: null, method: 'GET' });
  assert.ok(!buildAxios(noBody).includes('"data"'), 'no data key when there is no request body');
});

test('exportText jest / msw / playwright embed the captured status, url and body', () => {
  const entry = richEntry();
  for (const format of ['jest', 'msw', 'playwright']) {
    const text = exportText(entry, [entry], format);
    assert.ok(text.includes('https://api.example.com/v1/orders?page=2'), `${format} must carry the url`);
    assert.ok(text.includes('201'), `${format} must carry the status`);
  }
  assert.match(exportText(entry, [entry], 'msw'), /http\.post\(/);
  assert.match(exportText(entry, [entry], 'msw'), /HttpResponse\.json\(/);
  assert.match(exportText(entry, [entry], 'playwright'), /request\.post\(/);
  assert.match(exportText(entry, [entry], 'jest'), /ok: true/);
  assert.match(exportText(apiEntry({ status: 500, responseRaw: '{}' }), [], 'jest'), /ok: false/);
});

test('exportText playwright uses request.fetch() for non-convenience verbs and skips a GET body', () => {
  const options = apiEntry({ method: 'OPTIONS', requestBody: '{"a":1}', requestHeaders: {} });
  const text = exportText(options, [options], 'playwright');
  assert.match(text, /request\.fetch\(/);
  assert.match(text, /"method": "OPTIONS"/);
  assert.match(text, /"data"/);

  const get = apiEntry({ method: 'GET', requestBody: '{"a":1}', requestHeaders: {} });
  const getText = exportText(get, [get], 'playwright');
  assert.match(getText, /request\.get\(/);
  assert.ok(!getText.includes('"data"'), 'a GET must not carry a request body');
});

test('exportText msw falls back to a plain HttpResponse for non-JSON content types', () => {
  const csv = apiEntry({ responseHeaders: { 'content-type': 'text/csv' }, contentType: 'text/csv', responseRaw: 'a,b\n1,2' });
  const text = exportText(csv, [csv], 'msw');
  assert.match(text, /new HttpResponse\(/);
  assert.ok(!text.includes('HttpResponse.json('));
});

// ------------------------------------------------------------- session CSV

test('buildSessionCsv emits a header row, one row per API entry, and quotes correctly', () => {
  const clean = apiEntry({ id: 'a', method: 'GET', status: 200, url: 'https://x/y', source: 'fetch', duration: 5, size: 6, timestamp: 1_700_000_000_000 });
  const nasty = apiEntry({ id: 'b', method: 'POST', status: 500, url: 'https://x/y?q=1,2', source: 'xhr', duration: 7, size: 8, timestamp: 1_700_000_000_000 });
  const csv = buildSessionCsv([clean, nasty, logEntry()]);
  const rows = csv.split('\n');
  assert.equal(rows.length, 3, 'header + 2 API rows (the log entry is excluded)');
  assert.equal(rows[0], 'id,method,status,url,source,durationMs,sizeBytes,timestamp');
  assert.equal(rows[1], 'a,GET,200,https://x/y,fetch,5,6,2023-11-14T22:13:20.000Z');
  assert.ok(rows[2].includes('"https://x/y?q=1,2"'), 'a value containing a comma is quoted');

  const quoted = buildSessionCsv([apiEntry({ url: 'https://x/"q"', timestamp: 1 })]);
  assert.ok(quoted.includes('"https://x/""q"""'), 'embedded quotes are doubled');
});

test('buildSessionCsv on an empty list is just the header', () => {
  assert.equal(buildSessionCsv([]), 'id,method,status,url,source,durationMs,sizeBytes,timestamp');
  assert.equal(buildSessionCsv([logEntry()]), 'id,method,status,url,source,durationMs,sizeBytes,timestamp');
});

// ------------------------------------------------------------- session HAR

test('buildSessionHar emits a well-formed HAR log with only API entries', () => {
  const entry = richEntry();
  const har = JSON.parse(buildSessionHar([entry, logEntry()]));
  assert.equal(har.log.version, '1.2');
  assert.equal(har.log.creator.name, 'XRAY');
  assert.equal(har.log.entries.length, 1);

  const [harEntry] = har.log.entries;
  assert.equal(harEntry.startedDateTime, new Date(entry.timestamp).toISOString());
  assert.equal(harEntry.time, 137);
  assert.equal(harEntry.request.method, 'POST');
  assert.equal(harEntry.request.url, entry.url);
  assert.deepEqual(harEntry.request.headers, [
    { name: 'content-type', value: 'application/json' },
    { name: 'x-trace', value: 'abc' },
  ]);
  assert.equal(harEntry.response.status, 201);
  assert.equal(harEntry.response.content.mimeType, 'application/json; charset=utf-8');
  assert.deepEqual(JSON.parse(harEntry.response.content.text), { id: 7, items: [{ sku: 'A1', qty: 2 }], ok: true });
  assert.equal(harEntry.timings.wait, 137);
});

// ------------------------------------------------------------- parseImport

test('parseImport rejects non-JSON and unrecognized shapes', () => {
  assert.deepEqual(parseImport('not json'), { entries: [], format: 'unknown', error: 'File is not valid JSON.' });
  const unknown = parseImport('{"something":1}');
  assert.equal(unknown.format, 'unknown');
  assert.equal(unknown.entries.length, 0);
  assert.match(unknown.error, /Expected a HAR file or XRAY session export/);
  assert.equal(parseImport('[]').format, 'unknown', 'an empty bare array is not a session');
  assert.equal(parseImport('[{"no":"id"}]').format, 'unknown', 'entries must carry a string id');
});

test('parseImport reads an XRAY session export and marks entries imported', () => {
  const source = [apiEntry({ id: 'keep-me' }), { not: 'an entry' }, logEntry({ id: 'log-1' })];
  const result = parseImport(JSON.stringify({ entries: source }));
  assert.equal(result.format, 'session');
  assert.deepEqual(result.entries.map((entry) => entry.id), ['keep-me', 'log-1']);
  assert.ok(result.entries.every((entry) => entry.imported === true));
});

test('parseImport reads a bare array of entries', () => {
  const result = parseImport(JSON.stringify([apiEntry({ id: 'bare-1' })]));
  assert.equal(result.format, 'session');
  assert.equal(result.entries[0].id, 'bare-1');
  assert.equal(result.entries[0].imported, true);
});

test('parseImport reads a HAR file, deriving urlPath and header maps', () => {
  const har = {
    log: {
      entries: [{
        startedDateTime: '2023-11-14T22:13:20.000Z',
        time: 250,
        request: {
          method: 'PUT',
          url: 'https://api.example.com/v2/items/9?x=1',
          headers: [{ name: 'Accept', value: 'application/json' }, { name: 'Bad' }],
          postData: { text: '{"a":1}' },
        },
        response: {
          status: 204,
          headers: [{ name: 'Content-Type', value: 'application/json' }],
          content: { size: 512, text: '{"ok":true}' },
        },
      }],
    },
  };
  const { entries, format } = parseImport(JSON.stringify(har));
  assert.equal(format, 'har');
  const [entry] = entries;
  assert.match(entry.id, /^har_/);
  assert.equal(entry.type, 'api');
  assert.equal(entry.source, 'import');
  assert.equal(entry.imported, true);
  assert.equal(entry.timestamp, Date.parse('2023-11-14T22:13:20.000Z'));
  assert.equal(entry.method, 'PUT');
  assert.equal(entry.urlPath, '/v2/items/9', 'the query string is dropped from urlPath');
  assert.equal(entry.status, 204);
  assert.equal(entry.duration, 250);
  assert.equal(entry.size, 512);
  assert.deepEqual(entry.requestHeaders, { Accept: 'application/json', Bad: '' });
  assert.deepEqual(entry.responseHeaders, { 'Content-Type': 'application/json' });
  assert.deepEqual(entry.requestBody, { a: 1 });
  assert.equal(entry.responseRaw, '{"ok":true}');
});

test('parseImport falls back to timings.wait and tolerates a missing response', () => {
  const har = { log: { entries: [
    { request: { url: 'https://x/a', method: 'GET' }, timings: { wait: 88 } },
    { response: { status: 200 } },
    { request: { url: 'not a url' } },
  ] } };
  const { entries } = parseImport(JSON.stringify(har));
  assert.equal(entries.length, 2, 'a HAR entry with no request is skipped');
  assert.equal(entries[0].duration, 88);
  assert.equal(entries[0].status, 0);
  assert.equal(entries[1].urlPath, 'not a url', 'an unparseable url is kept as-is');
});

test('SUSPECTED BUG import.ts:46 — HAR time: -1 ("unknown" in the HAR spec) becomes a negative duration', () => {
  const har = { log: { entries: [
    { request: { url: 'https://x/a', method: 'GET' }, time: -1, timings: { wait: 120 } },
    { request: { url: 'https://x/b', method: 'GET' }, time: 0, timings: { wait: 120 } },
  ] } };
  const { entries } = parseImport(JSON.stringify(har));
  // -1 is truthy, so `Number(time) || Number(timings.wait)` never reaches the
  // wait fallback and a nonsensical negative duration is imported.
  assert.equal(entries[0].duration, -1, 'HAR "unknown" is imported as -1ms');
  // time: 0 IS falsy, so that path does fall back correctly.
  assert.equal(entries[1].duration, 120, 'time: 0 correctly falls back to timings.wait');
});

test('a -1 duration survives into the panel models that consume it', async () => {
  const { entries: entriesModel } = await import('./harness.mjs');
  const har = { log: { entries: [{ request: { url: 'https://x/a', method: 'GET' }, time: -1, response: { status: 200 } }] } };
  const [imported] = parseImport(JSON.stringify(har)).entries;
  assert.equal(imported.duration, -1);
  // entries.duration() clamps at 0, so the list UI is protected...
  assert.equal(entriesModel.duration(imported), 0);
  // ...but the raw field is what the HAR re-export writes back out.
  assert.equal(JSON.parse(buildSessionHar([imported])).log.entries[0].time, -1);
});

// -------------------------------------------------- export -> import round-trip

test('ROUND-TRIP buildSessionHar -> parseImport preserves the wire-visible fields', () => {
  const original = richEntry();
  const [restored] = parseImport(buildSessionHar([original, logEntry()])).entries;

  assert.equal(restored.method, original.method);
  assert.equal(restored.url, original.url);
  assert.equal(restored.status, original.status);
  assert.equal(restored.duration, original.duration);
  assert.equal(restored.size, original.size);
  assert.equal(restored.timestamp, original.timestamp);
  assert.equal(restored.urlPath, '/v1/orders');
  assert.deepEqual(restored.requestHeaders, original.requestHeaders);
  assert.deepEqual(restored.responseHeaders, original.responseHeaders);
  assert.deepEqual(restored.requestBody, JSON.parse(original.requestBody));
  assert.deepEqual(JSON.parse(restored.responseRaw), JSON.parse(original.responseRaw));
  assert.equal(restored.type, 'api');
  assert.equal(restored.imported, true);
});

test('ROUND-TRIP a HAR round-trip is stable on a second pass', () => {
  const original = richEntry();
  const once = parseImport(buildSessionHar([original])).entries;
  const twice = parseImport(buildSessionHar(once)).entries;
  const stable = (entry) => ({
    method: entry.method, url: entry.url, urlPath: entry.urlPath, status: entry.status,
    duration: entry.duration, size: entry.size, timestamp: entry.timestamp,
    requestHeaders: entry.requestHeaders, responseHeaders: entry.responseHeaders,
    requestBody: entry.requestBody, responseRaw: entry.responseRaw,
  });
  assert.deepEqual(stable(twice[0]), stable(once[0]));
});

test('ROUND-TRIP exportText session-json -> parseImport preserves ids and both entry types', () => {
  const api = richEntry();
  const log = logEntry({ message: 'a log line' });
  const text = exportText(null, [api, log], 'session-json');
  const result = parseImport(text);
  assert.equal(result.format, 'session');
  assert.deepEqual(result.entries.map((entry) => entry.id), [api.id, log.id]);
  assert.equal(result.entries[0].responseRaw, api.responseRaw);
  assert.equal(result.entries[1].message, 'a log line');
});

test('ROUND-TRIP an empty session exports and re-imports without error', () => {
  const text = exportText(null, [], 'session-json');
  assert.deepEqual(parseImport(text), { entries: [], format: 'session' });
  const har = exportText(null, [], 'session-har');
  assert.deepEqual(parseImport(har), { entries: [], format: 'har' });
});
