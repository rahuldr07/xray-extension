/* Task 2 (E1-E8): export correctness. Runs against the local fallbacks (no
   XRAY_ConsoleHelpers), like the rest of the export suite. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { exportModel as E, apiEntry } from './harness.mjs';

const { XRAY_VERSION } = await import('../../src/panel/version.ts');

const require = createRequire(import.meta.url);
const { transformSync } = require('esbuild');

const SIZES = { '240 KB': 240 * 1024, '2 MB': 2 * 1024 * 1024 };

function bigEntry(bytes, overrides = {}) {
  const row = { id: 1, label: 'x'.repeat(100), ok: true };
  const rows = Array.from({ length: Math.ceil(bytes / 120) }, (_, i) => ({ ...row, id: i }));
  const raw = JSON.stringify({ rows });
  return apiEntry({
    method: 'POST', url: 'https://x.test/big?page=1', urlPath: '/big',
    requestHeaders: { 'content-type': 'application/json' },
    requestBody: raw, responseRaw: raw, responseHeaders: { 'content-type': 'application/json' },
    ...overrides,
  });
}

for (const [label, bytes] of Object.entries(SIZES)) {
  test(`exports at ${label}: JSON parses, generated code transforms, omission marker past 1 MB`, () => {
    const entry = bigEntry(bytes);
    const selected = JSON.parse(E.exportText(entry, [entry], 'json'));
    assert.equal(selected.response.rows.length, Math.ceil(bytes / 120), 'Selected JSON carries the full response');
    for (const key of ['responseRaw', 'response', 'responseDecrypted']) {
      assert.equal(key in selected.entry, false, `entry.${key} omitted from Selected JSON`);
    }
    const mock = JSON.parse(E.exportText(entry, [entry], 'mock'));
    assert.equal(mock.response.rows.length, Math.ceil(bytes / 120), 'Mock carries the full response');
    for (const format of ['jest', 'msw', 'playwright']) {
      const code = E.exportText(entry, [entry], format);
      assert.doesNotThrow(() => transformSync(code, { loader: 'ts' }), `${format} parses`);
      if (bytes > 1024 * 1024) assert.match(code, /\/\* body omitted: \d+ KB — see the JSON export \*\//, `${format} marker`);
      else assert.doesNotMatch(code, /body omitted/, `${format} embeds the full body`);
    }
    assert.ok(E.exportText(entry, [entry], 'session-json').length > bytes);
  });
}

test('share-safe keeps body keys but still drops top-level diagnostics', () => {
  // E4: diagnostic-looking keys are payload data on every payload surface.
  const payload = { message: 'hi', error: { code: 4 }, config: { a: 1 }, stack: 's', provider: 'p' };
  const entry = apiEntry({
    method: 'POST', requestBody: JSON.stringify(payload), responseRaw: JSON.stringify(payload),
    graphql: { operationType: 'query', operationName: 'Q', variables: payload },
    errorMessage: 'boom', provider: 'secret-provider', __internal: 1,
  });
  const ws = apiEntry({ source: 'ws', method: 'WS', url: 'wss://x.test/s', wsFrames: [{ dir: 'in', ts: 1, size: 9, preview: JSON.stringify(payload) }] });
  const out = JSON.parse(E.buildShareSafeExport([entry, ws], 'session-json-safe').text);
  const e = out.entries[0];
  for (const [surface, value] of [['request body', e.requestBody], ['response body', e.response],
    ['GraphQL variables', e.graphql.variables], ['WS frame', JSON.parse(out.entries[1].wsFrames[0].preview)]]) {
    assert.deepEqual(value, payload, surface);
  }
  assert.equal('errorMessage' in e, false);
  assert.equal('provider' in e, false);
  assert.equal('__internal' in e, false);
});

test('share-safe drops Error message/stack and diagnostics from log args and logData', () => {
  // The shape content/console-capture.js emits for console.error(new Error(...)).
  const err = () => ({
    __type__: 'Error', name: 'Error', message: 'User bob@example.com not found',
    stack: 'Error: User bob@example.com not found\n    at https://app.test/main.js?token=abc:10:5)',
    __xray_ref__: 'xrl_1', config: { apiKey: 'private-api-key' }, detail: 'kept',
  });
  const log = { id: 'l1', type: 'log', timestamp: 1, logLevel: 'error', args: [err(), 'plain'], logData: err() };
  const text = E.buildShareSafeExport([log], 'session-json-safe').text;
  for (const leak of ['bob@example.com', 'main.js', 'at https', 'xrl_1', '%3A10%3A5', 'private-api-key']) {
    assert.equal(text.includes(leak), false, `share-safe export leaks ${leak}`);
  }
  const e = JSON.parse(text).entries[0];
  for (const value of [e.args[0], e.logData]) {
    assert.equal('message' in value, false);
    assert.equal('stack' in value, false);
    assert.equal('config' in value, false);
    assert.equal(value.name, 'Error');
    assert.equal(value.detail, 'kept');
  }
});

test('Final fix I1: share-safe reduces a typed Error (spec J7) to its name: no own properties, cause, message or stack', () => {
  // console.error(axiosError) as console-capture.js + content.js deliver it: response data in own properties.
  const axios = () => ({ $xray: 'error', name: 'AxiosError', message: 'Request failed for bob@example.com', stack: 'AxiosError: at https://app.test/x.js',
    entries: [['code', 'ERR_BAD_REQUEST'], ['response', { $xray: 'object', class: 'Object', entries: [['data', { email: 'alice@example.com', note: 'card 4111 1111 1111 1111' }], ['status', 400]] }]],
    cause: 'lookup failed for carol@example.com' });
  const log = (logData, logArgCount) => ({ id: 'l', type: 'log', timestamp: 1, logLevel: 'error', logArgCount, logData });
  const single = log(axios(), 1);
  const args = log(['request failed', axios(), { wrapped: axios(), list: [axios()] }], 3);
  const chained = log({ $xray: 'error', name: 'Error', message: 'outer', entries: [], cause: axios() }, 1);
  const text = E.buildShareSafeExport([single, args, chained], 'session-json-safe').text;
  for (const leak of ['alice@example.com', '4111', 'carol@example.com', 'bob@example.com', 'ERR_BAD_REQUEST', 'app.test', 'outer']) {
    assert.equal(text.includes(leak), false, `share-safe export leaks ${leak}`);
  }
  const [one, many, chain] = JSON.parse(text).entries;
  assert.deepEqual(one.logData, { name: 'AxiosError' });
  assert.deepEqual(many.logData, ['request failed', { name: 'AxiosError' }, { wrapped: { name: 'AxiosError' }, list: [{ name: 'AxiosError' }] }]);
  assert.deepEqual(chain.logData, { name: 'Error' }, 'the cause goes too, with its own fields');
  // Every dropped field is counted (message, stack, two own properties, cause), as the card states.
  const omitted = (entry) => E.buildShareSafeSession([entry]).omittedCount;
  assert.equal(omitted(single) - omitted(log({ ok: true }, 1)), 5);
});

test('share-safe query allow-list keeps page=1, redacts token=x', () => {
  const entry = apiEntry({ url: 'https://x.test/a?page=1&token=x&Limit=5&other=y' });
  const out = JSON.parse(E.buildShareSafeExport([entry], 'session-json-safe').text);
  const url = new URL(out.entries[0].url);
  assert.equal(url.searchParams.get('page'), '1');
  assert.equal(url.searchParams.get('Limit'), '5');
  assert.equal(url.searchParams.get('token'), '[REDACTED]');
  assert.equal(url.searchParams.get('other'), '[REDACTED]');
});

test('QUERY_ALLOW parity with content/interceptor.js', () => {
  const src = fs.readFileSync(new URL('../../content/interceptor.js', import.meta.url), 'utf8');
  const m = src.match(/const QUERY_ALLOW = \/(.+)\/([a-z]*);/);
  assert.ok(m, 'interceptor defines QUERY_ALLOW');
  assert.equal(E.QUERY_ALLOW.source, m[1]);
  assert.equal(E.QUERY_ALLOW.flags, m[2]);
});

test('HAR fidelity', () => {
  const form = apiEntry({
    method: 'POST', url: 'https://x.test/form?a=1&b=two%20words', statusText: 'Created', status: 201,
    requestHeaders: { 'Content-Type': 'application/x-www-form-urlencoded' }, requestBody: 'a=1&b=two%20words',
  });
  const noType = apiEntry({ method: 'POST', requestBody: '{"k":1}', requestHeaders: {} });
  const ws = apiEntry({ method: 'WS', source: 'ws', url: 'wss://x.test/s', status: 101 });
  const har = JSON.parse(E.buildSessionHar([form, noType, ws]));
  assert.equal(har.log.entries.length, 2, 'WS entry excluded');
  assert.equal(har.log.creator.version, XRAY_VERSION);
  const r = har.log.entries[0].request;
  assert.equal(r.postData.text, 'a=1&b=two%20words');
  assert.equal(r.postData.mimeType, 'application/x-www-form-urlencoded');
  assert.equal(r.bodySize, 'a=1&b=two%20words'.length);
  assert.deepEqual(r.queryString, [{ name: 'a', value: '1' }, { name: 'b', value: 'two words' }]);
  assert.equal(har.log.entries[0].response.statusText, 'Created');
  assert.equal(har.log.entries[1].request.postData.mimeType, 'application/octet-stream');
  assert.equal(har.log.entries[1].request.postData.text, '{"k":1}');
});

test('CSV keeps zeros and neutralises formulas', () => {
  const e = apiEntry({ id: '=cmd', status: 0, duration: 0, size: 0, url: '+SUM(1)' });
  const [, row] = E.buildSessionCsv([e]).split('\n');
  const cells = row.split(',');
  assert.equal(cells[0], "'=cmd");
  assert.deepEqual(cells.slice(2, 3), ['0']);
  assert.equal(cells[3], "'+SUM(1)");
  assert.deepEqual(cells.slice(5, 7), ['0', '0']);
  assert.match(E.exportMeta['session-csv'].desc, /^One row per API request \(logs excluded\), including full URLs\.$/);
});

test('Playwright skips the body assertion for an empty body', () => {
  const e = apiEntry({ method: 'DELETE', status: 204, responseRaw: '', responseHeaders: {} });
  const code = E.exportText(e, [e], 'playwright');
  assert.doesNotMatch(code, /response\.(json|text)\(\)|toBeTruthy/);
  const full = apiEntry();
  assert.match(E.exportText(full, [full], 'playwright'), /toBeTruthy/);
});

test('MSW url drops the query; unavailable for WS/SSE', () => {
  const e = apiEntry({ url: 'https://x.test/a/b?x=1&y=2#h' });
  const code = E.exportText(e, [e], 'msw');
  assert.match(code, /http\.get\("https:\/\/x\.test\/a\/b"/);
  const ws = apiEntry({ method: 'WS', source: 'ws', url: 'wss://x.test/s' });
  const sse = apiEntry({ method: 'GET', source: 'sse' });
  assert.ok(E.exportUnavailableReason(ws, 'msw'));
  assert.ok(E.exportUnavailableReason(sse, 'msw'));
  assert.equal(E.exportUnavailableReason(e, 'msw'), null);
  assert.equal(E.exportUnavailableReason(ws, 'curl'), null);
  assert.match(E.exportText(ws, [ws], 'msw'), /^\/\/ MSW handlers need an HTTP request/);
});

test('honest labels and Jest description', () => {
  const m = E.exportMeta;
  assert.equal(m.jest.desc, 'Jest scaffold that mocks fetch with the captured response.');
  assert.equal(m.curl.desc, 'Shell command with method, headers and body. Credentials were redacted at capture; add your own.');
  assert.equal(m.fetch.desc, 'fetch() call with method, headers and body.');
  assert.equal(m.mock.desc, 'Captured URL, method, status and response as JSON.');
});

test('preview cap is separate from the full text', () => {
  const long = 'a'.repeat(E.EXPORT_PREVIEW_CAP + 500);
  const p = E.previewText(long);
  assert.ok(p.length < long.length);
  assert.match(p, /\.\.\. truncated 500 chars$/);
  assert.equal(E.previewText('short'), 'short');
});

test('session filenames use local time', () => {
  const d = new Date(2026, 9, 14, 3, 4, 5);
  assert.equal(E.sessionFilename('session', 'json', d), 'xray-session-20261014-030405.json');
  assert.equal(E.sessionFilename('share-safe', 'har', d), 'xray-session-share-safe-20261014-030405.har');
});
