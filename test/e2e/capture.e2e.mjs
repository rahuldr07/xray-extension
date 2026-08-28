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
