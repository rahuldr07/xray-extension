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
  // The context travels as tagged JSON text and the result comes back as typed JSON text
  // (spec J8) — the shapes panel/console.js sends and revives.
  const evaluate = async (code, context) => {
    const out = await worker.evaluate(([id, source, text]) => _evaluateConsoleInTab(id, source, text), [tabId, code, JSON.stringify(context)]);
    assert.equal(typeof out.result, 'string', JSON.stringify(out));
    return JSON.parse(out.result);
  };
  const run = (code) => evaluate(code, { currentEntry: entry, entries: [entry], scope: {}, pins: {} });

  assert.equal(await run('1+1'), 2);
  assert.equal(await run('document.title'), 'Eval fixture');
  assert.equal(await run('res.users.length'), 2);
  assert.equal(await run('const x = 2; x * 3'), 6);

  // P2: a pinned request travels in context.pins and evaluates in the page as its
  // parsed response body (helpers inlined by the real background path).
  // Pins travel as { id, body } — the shape panel/console.js sends.
  const pinned = { id: 'p1', body: JSON.stringify({ orders: [{ id: 'o1' }, { id: 'o2' }, { id: 'o3' }] }) };
  const runPinned = (code) => evaluate(code, { currentEntry: entry, entries: [entry], scope: {}, pins: { a: pinned } });
  assert.equal(await runPinned('a.orders.length'), 3);
  assert.equal(await runPinned('a.orders[1].id + ":" + res.users.length'), 'o2:2');
});

// Spec J8 through the real debugger (CDP returnByValue): the context goes in as tagged JSON text
// and every result comes back as typed JSON text, so nothing on the way reorders keys, rounds
// integers or drops values JSON cannot hold.
test('console values cross the debugger exactly: res.id, key order, NaN/-0/undefined, shared refs, Map, caps', async (t) => {
  const server = http.createServer((_req, res) => {
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end('<!doctype html><title>J8 fixture</title><h1>x</h1>');
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
  const current = { id: 'e1', type: 'api', method: 'GET', url: 'http://127.0.0.1/api', urlPath: '/api', status: 200, responseRaw: '{"id":9007199254740993}' };
  const contextText = JSON.stringify({
    currentEntry: current, entries: [current], pins: {},
    scope: { temp1: [{ $xray: 'bigint', value: '12345678901234567890' }, { $xray: 'number', value: '-0' }] },
    values: { res: { id: { $xray: 'bigint', value: '9007199254740993' } }, req: JSON.parse('{"__proto__":{"polluted":true},"n":1}') },
  });
  const run = (code) => worker.evaluate(([id, source, text]) => _evaluateConsoleInTab(id, source, text), [tabId, code, contextText]);

  const id = await run('res.id');
  assert.equal(id.type, 'bigint', JSON.stringify(id));
  assert.equal(id.result, '{"$xray":"bigint","value":"9007199254740993"}');
  assert.equal((await run('res.id === 9007199254740993n')).result, 'true');
  assert.equal((await run('({ b: 1, a: 2, "10": 3, "2": 4, "-1": 5 })')).result, '{"2":4,"10":3,"b":1,"a":2,"-1":5}', 'the page key order');
  assert.equal((await run('[NaN, -0, undefined, 1 / 0]')).result,
    '[{"$xray":"number","value":"NaN"},{"$xray":"number","value":"-0"},{"$xray":"undefined"},{"$xray":"number","value":"Infinity"}]');
  assert.equal((await run('const s = { x: 1 }; ({ a: s, b: s })')).result, '{"a":{"x":1},"b":{"x":1}}', 'a repeated reference is not [Circular]');
  assert.equal((await run('new Map([[1, { a: 1 }]])')).result, '{"$xray":"map","size":1,"entries":[[1,{"a":1}]]}');
  const capped = await run('Array(5000).fill(1)');
  assert.equal(capped.truncated, true);
  const cut = JSON.parse(capped.result);
  assert.deepEqual([cut.$xray, cut.length, cut.items.length], ['array', 5000, 1000], 'the cap is stated as metadata');
  assert.equal((await run('"a\\ud800b"')).result, '"a\\ud800b"', 'a lone surrogate survives the transport');
  assert.equal((await run('Object.keys(req).join()')).result, '"__proto__,n"');
  assert.equal((await run('req.polluted')).type, 'undefined', '__proto__ is a key, never the prototype');
  assert.equal((await run('temp1[0] === 12345678901234567890n && Object.is(temp1[1], -0)')).result, 'true', 'saved variables are revived');
  assert.equal((await run('_.groupBy([{ n: "constructor" }, { n: "__proto__" }, { n: "constructor" }], "n")')).result,
    '{"constructor":[{"n":"constructor"},{"n":"constructor"}],"__proto__":[{"n":"__proto__"}]}');
  const table = await run('table([{ a: 1 }])');
  assert.equal(table.render, 'table');
  assert.equal(table.result, '[{"a":1}]');
});
