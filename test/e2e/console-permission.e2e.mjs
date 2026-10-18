/* global chrome, _evaluateConsoleInTab */
// Console execution runs through chrome.debugger (Runtime.evaluate). Chrome cannot make
// `debugger` an optional permission — it is ignored in optional_permissions and
// chrome.permissions.request rejects — so it is required. These tests load the real
// unpacked extension and prove a fresh install can actually execute console commands.

import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

async function launch() {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xray-e2e-'));
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: true,
    channel: 'chromium',
    args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`, '--no-sandbox'],
  });
  const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker', { timeout: 30_000 }));
  return { context, userDataDir, worker };
}

test('a fresh install has the debugger API and every background listener registered', async (t) => {
  const { context, userDataDir, worker } = await launch();
  t.after(async () => {
    await context.close();
    fs.rmSync(userDataDir, { recursive: true, force: true });
  });
  const state = await worker.evaluate(async () => ({
    debuggerApi: typeof chrome.debugger?.attach,
    granted: await chrome.permissions.contains({ permissions: ['debugger'] }),
    onMessage: chrome.runtime.onMessage.hasListeners(),
    onConnect: chrome.runtime.onConnect.hasListeners(),
    onCommand: chrome.commands.onCommand.hasListeners(),
    onClicked: chrome.action.onClicked.hasListeners(),
  }));
  assert.deepEqual(state, { debuggerApi: 'function', granted: true, onMessage: true, onConnect: true, onCommand: true, onClicked: true });
});

test('a fresh install evaluates console commands in the inspected page', async (t) => {
  const server = http.createServer((_req, res) => {
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end('<!doctype html><title>Eval fixture</title><h1>x</h1>');
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { context, userDataDir, worker } = await launch();
  t.after(async () => {
    await context.close();
    server.close();
    fs.rmSync(userDataDir, { recursive: true, force: true });
  });
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  const tabId = await worker.evaluate(async () => (await chrome.tabs.query({})).find((tab) => /127\.0\.0\.1/.test(tab.url || ''))?.id);
  const entry = { id: 'e1', type: 'api', method: 'GET', url: 'http://127.0.0.1/api', urlPath: '/api', status: 200, responseDecrypted: { users: [{ id: 1 }, { id: 2 }] } };
  const run = (code) => worker.evaluate(([id, source, current]) => _evaluateConsoleInTab(id, source, { currentEntry: current, entries: [current], scope: {}, pins: {} }), [tabId, code, entry]);

  assert.equal((await run('1+1')).result, 2);
  assert.equal((await run('document.title')).result, 'Eval fixture');
  assert.equal((await run('res.users.length')).result, 2);
  assert.equal((await run('const x = 2; x * 3')).result, 6);

  // P2: a pinned request travels in context.pins and evaluates in the page as its
  // parsed response body (helpers inlined by the real background path).
  // Pins travel as { id, body } — the shape panel/console.js sends.
  const pinned = { id: 'p1', body: JSON.stringify({ orders: [{ id: 'o1' }, { id: 'o2' }, { id: 'o3' }] }) };
  const runPinned = (code) => worker.evaluate(([id, source, current, pin]) => _evaluateConsoleInTab(id, source, { currentEntry: current, entries: [current], scope: {}, pins: { a: pin } }), [tabId, code, entry, pinned]);
  assert.equal((await runPinned('a.orders.length')).result, 3);
  assert.equal((await runPinned('a.orders[1].id + ":" + res.users.length')).result, 'o2:2');
});
