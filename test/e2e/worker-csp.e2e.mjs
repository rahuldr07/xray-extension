import assert from 'node:assert/strict';
import test from 'node:test';
import http from 'node:http';
import fs from 'node:fs';
import { chromium } from 'playwright';

const clientSource = fs.readFileSync(new URL('../../shared/worker-client.js', import.meta.url), 'utf8');

test('strict script-src fallback leaves content-page workers unavailable without blob attempts', async (t) => {
  const policy = "script-src 'self'; object-src 'none'";
  let workerRequests = 0;
  const server = http.createServer((req, res) => {
    if (req.url === '/shared/worker-client.js') {
      res.writeHead(200, { 'content-type': 'application/javascript' });
      res.end(clientSource);
      return;
    }
    if (req.url.startsWith('/workers/')) workerRequests += 1;
    res.writeHead(200, { 'content-type': 'text/html', 'content-security-policy': policy });
    res.end('<!doctype html><title>Strict worker CSP</title><script src="/shared/worker-client.js"></script>');
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  t.after(() => browser.close());
  const page = await browser.newPage();
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    // Only the extension runtime URL is mocked. Chromium enforces the real page
    // CSP, origin rules and native Worker constructor; no CSP bypass is enabled.
    window.chrome ||= {};
    window.chrome.runtime = { getURL: (path) => `chrome-extension://fixture/${path}` };
    window.__workerAttempts = 0;
    window.__blobAttempts = 0;
    window.__workerViolations = [];
    const NativeWorker = window.Worker;
    window.Worker = class extends NativeWorker {
      constructor(...args) {
        window.__workerAttempts += 1;
        super(...args);
      }
    };
    const createObjectURL = URL.createObjectURL.bind(URL);
    URL.createObjectURL = (...args) => {
      window.__blobAttempts += 1;
      return createObjectURL(...args);
    };
    document.addEventListener('securitypolicyviolation', (event) => {
      window.__workerViolations.push(event.effectiveDirective);
    });
  });
  const response = await page.goto(`http://127.0.0.1:${server.address().port}/`);
  assert.equal(response.headers()['content-security-policy'], policy);
  const result = await page.evaluate(async () => {
    const client = window.XRAY_Worker;
    const health = await Promise.race([
      client.init(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Readiness did not settle')), 1500)),
    ]);
    await client.whenReady();
    await client.init();
    return {
      health,
      ready: client.isReady(),
      attempts: window.__workerAttempts,
      blobs: window.__blobAttempts,
      violations: window.__workerViolations,
      pending: client.__testing.pendingCount(),
      detail: await client.detailAnalysis({ private: 'captured payload' }),
      search: await client.search('match', [{ id: 'match' }, { id: 'other' }]),
    };
  });
  assert.deepEqual(errors, []);
  assert.equal(result.health.state, 'unavailable');
  assert.equal(result.health.lastErrorCode, 'worker-origin-unavailable');
  assert.equal(result.health.restartCount, 0);
  assert.equal(result.ready, false);
  assert.equal(result.attempts, 0);
  assert.equal(result.blobs, 0);
  assert.equal(result.pending, 0);
  assert.equal(result.detail, null);
  assert.deepEqual(result.search, [{ id: 'match' }]);
  assert.deepEqual(result.violations, []);
  assert.equal(workerRequests, 0);
  assert.equal(JSON.stringify(result.health).includes('captured payload'), false);
});
