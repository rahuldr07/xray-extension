// End-to-end capture test: loads the unpacked extension into a real Chromium,
// serves a page that makes a real fetch, and asserts the interceptor captured it.
//
// Deliberately NOT named *.test.mjs, so `npm test` does not pick it up — this needs a
// browser. Run it with `npm run test:e2e`.
//
// Two environment caveats, both documented in CONTRIBUTING.md and both handled here:
//   * background.js and content scripts are cached per profile, so a stale profile
//     silently tests old code. Every run gets a fresh mkdtemp profile.
//   * --no-sandbox is required where the ms-playwright executable's ACLs stop the
//     sandbox spawning child processes.

import assert from 'node:assert/strict';
import test from 'node:test';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const PAGE_HTML = `<!doctype html>
<html><head><title>XRAY e2e fixture</title></head>
<body><h1>fixture</h1></body></html>`;

function startFixtureServer() {
  const server = http.createServer((req, res) => {
    if (req.url === '/api/widgets') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ widgets: [{ id: 1, name: 'first' }] }));
      return;
    }
    // Body-fidelity fixtures: POST echo target, a JSON body for XHR responseType json/blob,
    // UTF-8 JSON bytes for arraybuffer, and bytes that are not UTF-8.
    const path = String(req.url).split('?')[0];
    const fixtures = {
      '/api/echo': ['application/json', '{"ok":true}'],
      '/api/xhrjson': ['application/json', '{"viaXhrJson":true,"id":9007199254740993}'],
      '/api/utf8bytes': ['application/octet-stream', Buffer.from('{"bytes":1}')],
      '/api/binary': ['application/octet-stream', Buffer.from([0xff, 0xfe, 0x00, 0x01])],
    };
    if (fixtures[path]) {
      req.resume();
      req.on('end', () => {
        res.writeHead(200, { 'content-type': fixtures[path][0], 'cache-control': 'no-store' });
        res.end(fixtures[path][1]);
      });
      return;
    }
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end(PAGE_HTML);
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

async function launch() {
  // A fresh profile every run: Chrome caches background.js and content scripts, so
  // reusing one means testing whatever code was loaded the first time.
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xray-e2e-'));
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: true,
    // Must be the full Chromium build. Playwright's default headless binary is the
    // headless shell, which cannot load extensions at all — the symptom is that the
    // MV3 service worker never registers and every wait times out.
    channel: 'chromium',
    args: [
      `--disable-extensions-except=${root}`,
      `--load-extension=${root}`,
      '--no-sandbox',
    ],
  });
  return { context, userDataDir };
}

test('extension loads, wraps fetch, and captures a real request', async (t) => {
  const { server, port } = await startFixtureServer();
  const { context, userDataDir } = await launch();

  t.after(async () => {
    await context.close();
    server.close();
    fs.rmSync(userDataDir, { recursive: true, force: true });
  });

  // MV3 registers the service worker lazily; it may already be up by the time we look.
  const worker =
    context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker', { timeout: 30_000 }));
  assert.match(worker.url(), /^chrome-extension:\/\/[a-p]{32}\/background\.js$/, 'service worker should be the extension background');

  const page = await context.newPage();

  // Runs before page scripts, in the MAIN world — the same realm the interceptor
  // posts capture messages into.
  await page.addInitScript(() => {
    window.__e2eCaptured = [];
    window.addEventListener('message', (event) => {
      if (event.source !== window) return;
      if (event.data?.__xray_capture__ && event.data.entry) {
        window.__e2eCaptured.push(event.data.entry);
      }
    });
  });

  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded' });

  // The interceptor must be installed in the page realm at document_start.
  const installed = await page.evaluate(() => ({
    hasToken: typeof window.__XRAY_BRIDGE_TOKEN__ === 'string' && window.__XRAY_BRIDGE_TOKEN__.length > 0,
    fetchIsWrapped: !/\[native code\]/.test(window.fetch.toString()),
  }));
  assert.equal(installed.hasToken, true, 'bridge token should be published into the page realm');
  assert.equal(installed.fetchIsWrapped, true, 'window.fetch should be wrapped by the interceptor');

  await page.evaluate(async () => {
    const res = await fetch('/api/widgets');
    return res.json();
  });

  await page.waitForFunction(() => window.__e2eCaptured.length > 0, null, { timeout: 10_000 });

  const entries = await page.evaluate(() => window.__e2eCaptured);
  const widgets = entries.find((entry) => String(entry.url).includes('/api/widgets'));

  assert.ok(widgets, `expected a capture for /api/widgets, got ${entries.map((e) => e.url).join(', ')}`);
  assert.equal(widgets.method, 'GET');
  assert.equal(widgets.type, 'api');
});

test('sensitive request headers are redacted before the entry leaves the page realm', async (t) => {
  const { server, port } = await startFixtureServer();
  const { context, userDataDir } = await launch();

  t.after(async () => {
    await context.close();
    server.close();
    fs.rmSync(userDataDir, { recursive: true, force: true });
  });

  context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker', { timeout: 30_000 }));

  const page = await context.newPage();
  await page.addInitScript(() => {
    window.__e2eCaptured = [];
    window.addEventListener('message', (event) => {
      if (event.source !== window) return;
      if (event.data?.__xray_capture__ && event.data.entry) {
        window.__e2eCaptured.push(event.data.entry);
      }
    });
  });

  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded' });

  const SECRET = 'Bearer e2e-super-secret-token';
  await page.evaluate(async (secret) => {
    await fetch('/api/widgets', { headers: { Authorization: secret, 'X-Api-Key': 'e2e-key' } });
  }, SECRET);

  await page.waitForFunction(() => window.__e2eCaptured.some((e) => String(e.url).includes('/api/widgets')), null, {
    timeout: 10_000,
  });

  const entry = await page.evaluate(() =>
    window.__e2eCaptured.find((e) => String(e.url).includes('/api/widgets')),
  );

  // This is the invariant the whole MAIN/ISOLATED split exists to protect: the raw
  // credential must never appear in an entry that has left the page realm.
  const serialized = JSON.stringify(entry);
  assert.ok(!serialized.includes('e2e-super-secret-token'), 'raw Authorization value must not leave the page realm');
  assert.ok(!serialized.includes('e2e-key'), 'raw x-api-key value must not leave the page realm');

  const headers = entry.requestHeaders ?? {};
  const authKey = Object.keys(headers).find((k) => k.toLowerCase() === 'authorization');
  assert.ok(authKey, 'the Authorization header name should still be reported');
  assert.equal(headers[authKey], '[redacted]', 'the Authorization value should be redacted');
});

// JSON fidelity J4/J5 (audit #5, #6, #7, #18): every request body kind and every XHR
// responseType arrives as text or a descriptor, through Chrome's own structured clone.
test('request bodies of every kind and XHR json/arraybuffer/blob responses arrive as text or descriptors', async (t) => {
  const { server, port } = await startFixtureServer();
  const { context, userDataDir } = await launch();

  t.after(async () => {
    await context.close();
    server.close();
    fs.rmSync(userDataDir, { recursive: true, force: true });
  });

  context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker', { timeout: 30_000 }));

  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.addInitScript(() => {
    window.__e2eCaptured = [];
    window.addEventListener('message', (event) => {
      if (event.source !== window) return;
      if (event.data?.__xray_capture__ && event.data.entry && !event.data.update) {
        window.__e2eCaptured.push(event.data.entry);
      }
    });
  });

  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded' });

  const outcomes = await page.evaluate(async () => {
    const json = '{"id":9007199254740993}';
    const form = new FormData();
    form.append('json', json);
    form.append('upload', new File([new Uint8Array([137, 80, 78, 71])], 'x.png', { type: 'image/png' }));
    const post = (q, body) => fetch(`/api/echo?req=${q}`, { method: 'POST', body }).then((r) => r.text());
    const xhr = (path, responseType, body) => new Promise((resolve) => {
      const x = new XMLHttpRequest();
      x.open(body === undefined ? 'GET' : 'POST', path);
      x.responseType = responseType;
      x.onloadend = () => resolve(x.status);
      x.send(body);
    });
    const xhrForm = new FormData();
    xhrForm.append('a', '1');
    // One burst, no awaits in between: all of it lands inside one 16 ms window.
    const results = await Promise.allSettled([
      post('formdata', form),
      post('urlsearch', new URLSearchParams({ id: '9007199254740993', q: 'a b' })),
      post('uint8', new TextEncoder().encode(json)),
      post('blob', new Blob([json], { type: 'application/json' })),
      post('binary', new Uint8Array([0xff, 0xfe, 0x00])),
      post('jsonstring', '"hello"'),
      fetch(new Request('/api/echo?req=request-obj', { method: 'POST', body: '{"id": 9007199254740993, "b":1}' })).then((r) => r.text()),
      fetch(new Request('/api/echo?req=request-get')).then((r) => r.text()),
      xhr('/api/echo?req=xhr-formdata', '', xhrForm),
      xhr('/api/echo?req=xhr-document', '', document),
      xhr('/api/xhrjson?res=json', 'json'),
      xhr('/api/utf8bytes?res=arraybuffer', 'arraybuffer'),
      xhr('/api/xhrjson?res=blob', 'blob'),
      xhr('/api/binary?res=binary', 'arraybuffer'),
    ]);
    return results.map((result) => result.status);
  });
  assert.deepEqual(outcomes, Array(14).fill('fulfilled'), 'the page sees no error');

  const expected = ['req=formdata', 'req=urlsearch', 'req=uint8', 'req=blob', 'req=binary', 'req=jsonstring', 'req=request-obj', 'req=request-get',
    'req=xhr-formdata', 'req=xhr-document', 'res=json', 'res=arraybuffer', 'res=blob', 'res=binary'];
  await page.waitForFunction((keys) => keys.every((key) => window.__e2eCaptured.some((e) => String(e.url).includes(key))), expected, { timeout: 10_000 })
    .catch(() => {});
  const entries = await page.evaluate(() => window.__e2eCaptured);
  const missing = expected.filter((key) => !entries.some((e) => String(e.url).includes(key)));
  assert.deepEqual(missing, [], `every capture arrives (missing: ${missing.join(', ')})`);
  const entry = (key) => entries.find((e) => String(e.url).includes(key));

  assert.equal(entry('req=formdata').requestBodyKind, 'formdata');
  assert.deepEqual(entry('req=formdata').requestBody, [['json', '{"id":9007199254740993}'], ['upload', { file: 'x.png', size: 4, type: 'image/png' }]]);
  assert.equal(entry('req=urlsearch').requestBodyText, 'id=9007199254740993&q=a+b');
  assert.equal(entry('req=uint8').requestBodyText, '{"id":9007199254740993}');
  assert.equal(entry('req=blob').requestBodyText, '{"id":9007199254740993}');
  assert.deepEqual(entry('req=binary').requestBody, { binary: true, size: 3, base64Prefix: '//4A' });
  assert.equal(entry('req=jsonstring').requestBodyText, '"hello"');
  assert.equal(entry('req=request-obj').requestBodyText, '{"id": 9007199254740993, "b":1}', 'a Request body is read as text');
  assert.equal(entry('req=request-get').requestBodyKind, 'none', 'a bodiless Request is no body');
  assert.equal(entry('req=xhr-formdata').requestBodyText, 'a=1');
  assert.equal(entry('req=xhr-document').requestBodyKind, 'text');
  assert.match(entry('req=xhr-document').requestBodyText, /^<!DOCTYPE html><html>[\s\S]*<h1>fixture<\/h1>/, 'a Document body is captured serialized, not as "[object HTMLDocument]"');
  assert.equal(entry('res=json').responseRaw, JSON.stringify(JSON.parse('{"viaXhrJson":true,"id":9007199254740993}')));
  assert.equal(entry('res=json').bodyReserialized, true);
  assert.equal(entry('res=arraybuffer').responseRaw, '{"bytes":1}');
  assert.equal(entry('res=blob').responseRaw, '{"viaXhrJson":true,"id":9007199254740993}');
  assert.equal(entry('res=binary').responseRaw, null);
  assert.equal(entry('res=binary').size, 4);
  assert.deepEqual(entry('res=binary').responseBinary, { binary: true, size: 4, base64Prefix: '//4AAQ==' }, 'bytes that are not UTF-8 carry a descriptor');
  // Nothing posted carries a live binary object (the store and chrome.storage cannot keep them).
  const binaryFields = await page.evaluate(() => window.__e2eCaptured.filter((e) => JSON.stringify(e, (key, value) => (
    value instanceof ArrayBuffer || ArrayBuffer.isView(value) || value instanceof Blob ? '__BINARY__' : value)).includes('__BINARY__')).map((e) => e.url));
  assert.deepEqual(binaryFields, []);
  assert.deepEqual(pageErrors, []);
});
