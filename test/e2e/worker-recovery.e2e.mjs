import assert from 'node:assert/strict';
import test from 'node:test';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('capture receipts report aggregate acceptance/drop counts without payload fields', async (t) => {
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end('<!doctype html><title>worker recovery fixture</title>');
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xray-worker-recovery-'));
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: true,
    channel: 'chromium',
    args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`, '--no-sandbox'],
  });
  t.after(async () => {
    await context.close();
    server.close();
    fs.rmSync(userDataDir, { recursive: true, force: true });
  });

  const page = await context.newPage();
  await page.addInitScript(() => {
    window.__xrayReceipts = [];
    window.addEventListener('message', (event) => {
      if (event.source === window && event.data?.__xray_capture_receipt__) {
        window.__xrayReceipts.push(event.data.receipt);
      }
    });
  });
  await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.__XRAY_BRIDGE_TOKEN__ === 'string');

  await page.evaluate(() => {
    const token = window.__XRAY_BRIDGE_TOKEN__;
    window.postMessage({ __xray_capture__: true, token, entry: { id: 'e2e-receipt', type: 'api' } }, '*');
    window.postMessage({ __xray_capture__: true, token, entry: { id: 7, type: 'api' } }, '*');
  });
  await page.waitForFunction(() => window.__xrayReceipts.length >= 2);
  const receipts = await page.evaluate(() => window.__xrayReceipts);
  const serialized = JSON.stringify(receipts);
  assert.match(serialized, /accepted/);
  assert.match(serialized, /dropped/);
  assert.equal(serialized.includes('e2e-receipt'), false);
  assert.equal(serialized.includes('url'), false);
  assert.equal(serialized.includes('headers'), false);
  assert.equal(serialized.includes('body'), false);
});
