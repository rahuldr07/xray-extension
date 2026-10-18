/* E3: the utils.ts fallbacks must equal the shared generators. Separate file:
   loading the shared helpers mutates globalThis.window for the whole process. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { utils, apiEntry } from './harness.mjs';

test('fallback cURL / fetch / mock equal the shared generator output', () => {
  const entry = apiEntry({
    method: 'POST', url: "https://x.test/a?b=1&c='q'",
    requestHeaders: { 'content-type': 'application/json', 'x-id': '7' },
    requestBody: '{"a":1}', status: 201, responseRaw: '{"ok":true}',
  });
  assert.equal(globalThis.window.XRAY_ConsoleHelpers, undefined);
  const fallback = { curl: utils.buildCurl(entry), fetch: utils.buildFetch(entry), mock: utils.buildMockPayload(entry) };
  for (const f of ['shared/utils.js', 'shared/console-helpers.js']) {
    vm.runInThisContext(fs.readFileSync(new URL(`../../${f}`, import.meta.url), 'utf8'), { filename: f });
  }
  assert.ok(globalThis.window.XRAY_ConsoleHelpers?.generateCurl, 'shared helpers loaded');
  assert.equal(fallback.curl, utils.buildCurl(entry));
  assert.equal(fallback.fetch, utils.buildFetch(entry));
  assert.equal(fallback.mock, utils.buildMockPayload(entry));
});

test('J10 parity on captured request text: the fallbacks and the shared generators send the same raw text', () => {
  const texts = ['"hello"', 'null', 'false', '', '{\n  "a": 1\n}', '{"b":1,"a":2,"10":3,"2":4}', '{"id": 9007199254740993}'];
  for (const text of texts) {
    const entry = apiEntry({ method: 'POST', requestHeaders: { 'content-type': 'application/json' }, requestBodyKind: 'text', requestBodyText: text, requestBody: { a: 1 } });
    const shared = globalThis.window.XRAY_ConsoleHelpers;
    assert.ok(shared?.generateCurl, 'shared helpers loaded by the test above');
    globalThis.window.XRAY_ConsoleHelpers = undefined;
    const fallback = { curl: utils.buildCurl(entry), fetch: utils.buildFetch(entry) };
    globalThis.window.XRAY_ConsoleHelpers = shared;
    assert.equal(fallback.curl, utils.buildCurl(entry), JSON.stringify(text));
    assert.equal(fallback.fetch, utils.buildFetch(entry), JSON.stringify(text));
    assert.ok(fallback.curl.includes(`--data-raw '${text.replace(/'/g, "'\\''")}'`), JSON.stringify(text));
  }
});

test('Final fix I2 parity on FormData: the fallbacks and the shared generators rebuild the same form', () => {
  const pairs = [['user', 'bob'], ['note', "it's a;type=x @/etc/passwd\nline 2"], ['avatar', { file: 'a\u2028.png', size: 4, type: 'image/png' }], ['a=b', 'eq']];
  const form = (extra = {}) => apiEntry({ method: 'POST', url: 'https://x.test/upload', requestBodyKind: 'formdata', requestBodyText: 'rendering',
    requestHeaders: { 'Content-Type': 'multipart/form-data; boundary=----captured', 'X-Csrf': 'abc' }, requestBody: pairs.map((pair) => [...pair]), ...extra });
  const cases = { form: form(), unkept: form({ requestBody: undefined }), cut: form({ requestTruncated: { totalChars: 9, keptChars: 5 } }),
    files: form({ requestBody: [['f', { file: 'x', size: 1, type: '' }]] }), get: form({ method: 'GET' }) };
  const shared = globalThis.window.XRAY_ConsoleHelpers;
  assert.ok(shared?.generateCurl, 'shared helpers loaded by the first test');
  for (const [name, entry] of Object.entries(cases)) {
    globalThis.window.XRAY_ConsoleHelpers = undefined;
    const fallback = { curl: utils.buildCurl(entry), fetch: utils.buildFetch(entry) };
    globalThis.window.XRAY_ConsoleHelpers = shared;
    assert.equal(fallback.curl, utils.buildCurl(entry), `${name}: cURL`);
    assert.equal(fallback.fetch, utils.buildFetch(entry), `${name}: fetch`);
  }
  const curl = shared.generateCurl(cases.form);
  assert.ok(curl.includes("--form-string 'user=bob'") && !curl.includes('--data-raw') && !/multipart/i.test(curl), curl);
  assert.ok(shared.generateFetch(cases.form).includes('form.append("user", "bob");'));
});

test('Addendum parity: a request value too deep for JSON.stringify is left out with the same note by both', () => {
  let value = [];
  for (let i = 1; i < 100_000; i++) value = [value];
  const entry = apiEntry({ method: 'POST', url: 'https://x.test/old', requestHeaders: {}, requestBodyKind: undefined, requestBodyText: undefined, requestBody: { data: value } });
  const shared = globalThis.window.XRAY_ConsoleHelpers;
  assert.ok(shared?.generateCurl, 'shared helpers loaded by the first test');
  const helpers = { curl: shared.generateCurl(entry), fetch: shared.generateFetch(entry) };
  globalThis.window.XRAY_ConsoleHelpers = undefined;
  const fallback = { curl: utils.buildCurl(entry), fetch: utils.buildFetch(entry) };
  globalThis.window.XRAY_ConsoleHelpers = shared;
  assert.deepEqual(helpers, fallback);
  assert.match(helpers.curl, /^# Partial: the request body is nested too deeply to print as JSON, so it is left out\.\ncurl /);
});
