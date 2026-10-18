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
