import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { before, after } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { PANEL_CSS } from '../helpers/panel-css.mjs';
import { setStandardsContent } from '../helpers/standards-page.mjs';

// Spec J9 (plan Task 8) in the real App, store and stylesheet, document and closed shadow: a page
// captures API bodies and a battery of typed console values (the real content/console-capture.js),
// the store writes the session the way it does every 4 s, and a second page restores that write
// (what chrome.storage keeps: its JSON). Tree and Table work on the restored text, an integer past
// 2^53 keeps its digits, keys keep their order, typed logs read as they did. A session stored before
// J9 restores too, its cuts as banners ("legacy session restore"). Only chrome.storage is stubbed.
const projectRoot = fileURLToPath(new URL('../../', import.meta.url));
const CAPTURE_SOURCE = readFileSync(new URL('../../content/console-capture.js', import.meta.url), 'utf8');
const { outputFiles } = await build({
  stdin: {
    resolveDir: projectRoot, loader: 'jsx',
    contents: `
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      import { flushSync } from 'react-dom';
      import { App } from './src/panel/App';
      import { usePanelStore } from './src/panel/store';
      const styles = ${JSON.stringify(PANEL_CSS)};

      window.sr = {
        root: null, stored: {}, writes: 0,
        async setup(shadow, stored) {
          this.stored = stored;
          const self = this;
          // chrome.storage keeps a value's JSON, and gives every object back with its keys sorted.
          const kept = (value) => JSON.parse(JSON.stringify(value, (name, item) => (item && typeof item === 'object' && !Array.isArray(item)
            ? Object.fromEntries(Object.keys(item).sort().map((k) => [k, item[k]])) : item)));
          window.XRAY_Store = {
            get: async (key) => (key in self.stored ? kept(self.stored[key]) : null),
            set: async (key, value) => {
              if (self.full && key === 'session_envelope') throw Object.assign(new Error('storage-write-failed'), { code: 'storage-write-failed', reason: 'quota' });
              self.stored[key] = kept(value);
              if (key === 'session_envelope') self.writes += 1;
            },
          };
          window.XRAY_Console = {
            init() {}, setContext() {}, navigateHistory() { return null; }, setVar() {}, getVar() { return undefined; }, getScope() { return {}; },
            execute() { return Promise.resolve({ type: 'undefined' }); },
          };
          // The HUD's capture listener, in short: one store commit per capture batch.
          window.addEventListener('message', (event) => {
            const data = event.data;
            if (event.source !== window || !data || !data.__xray_capture__ || data.token !== window.__XRAY_BRIDGE_TOKEN__) return;
            if (data.batch && Array.isArray(data.entries)) usePanelStore.getState().addEntries(data.entries);
          });
          await usePanelStore.getState().restorePreferences();
          const host = document.body.appendChild(document.createElement('div'));
          host.style.width = '1400px'; host.style.height = '100vh';
          this.root = shadow ? host.attachShadow({ mode: 'closed' }) : document;
          const sheet = document.createElement('style'); sheet.textContent = styles;
          (shadow ? this.root : document.head).appendChild(sheet);
          const mount = shadow ? this.root.appendChild(document.createElement('div')) : host;
          mount.className = 'xray-app-root';
          usePanelStore.setState({ open: true, activeTab: 'api', detailTab: 'response', detailView: 'tree',
            settings: { ...usePanelStore.getState().settings, panelWidth: 1400, firstRunDismissed: true } });
          flushSync(() => createRoot(mount).render(<App mode={shadow ? 'hud' : 'window'} />));
        },
        add(entries) { flushSync(() => usePanelStore.getState().addEntries(entries)); },
        entries() { return usePanelStore.getState().entries; },
        logIds() { return usePanelStore.getState().entries.filter((entry) => entry.type === 'log').map((entry) => entry.id); },
        state(name, ...args) { flushSync(() => usePanelStore.getState()[name](...args)); },
        notice() { return usePanelStore.getState().sessionSaveNotice; },
        q(selector) { return this.root.querySelector(selector); },
        text(selector) { return this.root.querySelector(selector)?.textContent ?? null; },
        treeRows() {
          return [...this.root.querySelectorAll('.xray-request-detail [role="tree"] [role="treeitem"]')].map((row) => ({
            level: Number(row.getAttribute('aria-level')),
            key: row.querySelector('.xray-json-key')?.textContent ?? null,
            value: row.querySelector('.xray-json-value')?.textContent ?? null,
          }));
        },
        table() {
          const el = this.root.querySelector('.xray-request-detail .xray-table');
          return el ? { headers: [...el.querySelectorAll('th')].map((th) => th.textContent), first: [...(el.querySelector('tbody tr')?.querySelectorAll('td') ?? [])].map((td) => td.textContent) } : null;
        },
        rowText(id) { return this.root.querySelector('#xray-log-option-' + CSS.escape(id) + ' .xray-path')?.textContent ?? null; },
        // Body lengths and cuts, held by the panel and as last saved (small to carry back).
        bodies(list) { return list.map((e) => [e.id, typeof e.responseRaw === 'string' ? e.responseRaw.length : -1, e.responseTruncated ?? null]); },
        held() { return this.bodies(usePanelStore.getState().entries); },
        storageFull(value) { this.full = value; },
        saved() { const env = this.stored.session_envelope; return { version: env?.schemaVersion, bodies: this.bodies(env?.entries || []) }; },
      };
    `,
  },
  bundle: true, format: 'iife', write: false, loader: { '.css': 'text' },
  define: { 'process.env.NODE_ENV': '"production"' },
});

let browser;
before(async () => {
  const executablePath = process.env.XRAY_BROWSER_EXECUTABLE ||
    (!existsSync(chromium.executablePath()) && existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined);
  browser = await chromium.launch({ executablePath, headless: true });
});
after(async () => { await browser?.close(); });

// A response of about 32,300 characters (audit #15) with an integer past 2^53 and keys out of order.
function bigBody() {
  const rows = [];
  let text = '';
  for (let i = 0; text.length < 32_300; i++) {
    rows.push(`{"id":9007199254740993,"name":"row-${i}","note":"${'n'.repeat(40)}"}`);
    text = `{"zeta":1,"data":[${rows.join(',')}],"alpha":2}`;
  }
  return text;
}
const api = (id, responseRaw, extra = {}) => ({ id, type: 'api', method: 'GET', status: 200, url: 'https://example.test/' + id, urlPath: '/' + id,
  source: 'fetch', timestamp: 1_700_000_000_000, duration: 5, size: responseRaw.length, responseHeaders: { 'content-type': 'application/json' }, responseRaw, ...extra });

const LOGS = [
  ['bigint', 'console.log(10n)', '10n'],
  ['nan', 'console.log(NaN)', 'NaN'],
  ['negzero', 'console.log(-0)', '-0'],
  ['undef', 'console.log(undefined)', 'undefined'],
  ['map', "console.log(new Map([['k', { v: 1 }], ['n', 2n]]))", 'Map(2) {"k" => {"v":1}, "n" => 2n}'],
  ['error', "console.log(new Error('outer', { cause: new Error('inner') }))", 'Error: outer'],
  ['bytes', 'console.log(new Uint8Array([1, 2, 3]))', 'Uint8Array(3) [1,2,3]'],
  ['multi', "console.log(1, 'two', { three: 3 })", '1 two {"three":3}'],
  ['nested', 'console.log({ big: 12345678901234567890n, list: [NaN, -Infinity] })', '{"big":12345678901234567890n,"list":[NaN,-Infinity]}'],
  // chrome.storage sorts keys; the log is saved as its JSON text, so the order logged comes back.
  ['order', 'console.log({ b: 1, a: 2, nested: { z: 1, y: 2 } })', '{"b":1,"a":2,"nested":{"z":1,"y":2}}'],
];

async function open(t, shadow, stored = {}) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  t.after(() => page.close());
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  t.after(() => assert.deepEqual(errors, [], 'no error may escape to the page'));
  await setStandardsContent(page, '<style>body{margin:0;min-height:100vh}</style>');
  await page.addScriptTag({ content: CAPTURE_SOURCE });
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(([value, data]) => window.sr.setup(value, data), [shadow, stored]);
  await page.waitForFunction(() => Boolean(window.sr.q('[role="tablist"]')));
  return page;
}

const sr = (page, name, ...args) => page.evaluate(([method, values]) => window.sr[method](...values), [name, args]);

async function show(page, id, tab, view) {
  await sr(page, 'state', 'selectEntry', id);
  await sr(page, 'state', 'setDetailTab', tab);
  await sr(page, 'state', 'setDetailView', view);
  await page.waitForFunction((value) => (window.sr.text('.xray-request-detail h3') || '') === '/' + value, id);
}

// The reviewer's probe (fix round 1): about 15,000 characters of JSON per response, 400 responses.
function probeBody(i) {
  const rows = [];
  let text = '';
  for (let r = 0; text.length < 15_000; r++) {
    rows.push(`{"id":${i * 1_000 + r},"name":"item-${r}","tags":["a","b"],"note":"${'n'.repeat(60)}"}`);
    text = `{"page":${i},"items":[${rows.join(',')}]}`;
  }
  return text;
}

test('Fix 2 (ruling): a v1 session of 400 × 15 KB responses stays whole on every save; new captures share what is left; a quota error says so; eviction frees budget', async (t) => {
  const bodies = Array.from({ length: 400 }, (_, i) => probeBody(i));
  const v1 = { schemaVersion: 1, sessionId: 'probe', createdAt: 1, updatedAt: 2, source: {}, entries: bodies.map((body, i) => api(`p${i}`, body, { timestamp: 1_700_000_000_000 + i })) };
  const page = await open(t, false, { session_envelope: v1 });
  const legacyWhole = (list) => list.filter(([id]) => /^p\d+$/.test(id)).every(([id, length, cut]) => length === bodies[Number(id.slice(1))].length && cut === null);
  const held = await sr(page, 'held');
  assert.equal(held.length, 400);
  assert.ok(legacyWhole(held), 'migration keeps every body v1 kept, uncut');
  await show(page, 'p0', 'response', 'tree');
  await page.waitForFunction(() => window.sr.treeRows().some((row) => row.key === '"items"'));
  assert.doesNotMatch(await sr(page, 'text', '.xray-request-detail .xray-detail-content'), /truncated/i, 'the oldest body is whole and parses');

  // Save 1 (the restore schedules it): every legacy body whole.
  await page.waitForFunction(() => window.sr.writes >= 1, null, { timeout: 8000 });
  let saved = await sr(page, 'saved');
  assert.equal(saved.version, 2);
  assert.equal(saved.bodies.length, 400);
  assert.ok(legacyWhole(saved.bodies), 'first save: all 400 whole');

  // Save 2, with a new 50 KB capture: legacy still whole; the new body gets what is left (none) — the 2 KB floor.
  await sr(page, 'add', [api('fresh', 'f'.repeat(50_000))]);
  await page.waitForFunction(() => window.sr.writes >= 2, null, { timeout: 8000 });
  saved = await sr(page, 'saved');
  assert.ok(legacyWhole(saved.bodies), 'second save: all 400 whole');
  assert.deepEqual(saved.bodies.find(([id]) => id === 'fresh'), ['fresh', 2_048, { totalChars: 50_000, keptChars: 2_048 }]);

  // A real quota error on a save with the exemption: the notice, and nothing is cut.
  await sr(page, 'storageFull', true);
  await sr(page, 'add', [api('fresh-2', '{"small":true}')]);
  await page.waitForFunction(() => window.sr.notice() !== null, null, { timeout: 8000 });
  assert.equal(await sr(page, 'notice'), "Couldn't save the session — the browser's storage for XRAY is full.");
  assert.ok(legacyWhole(await sr(page, 'held')), 'the panel still holds every legacy body whole');
  assert.ok(legacyWhole((await sr(page, 'saved')).bodies), 'and the last save is intact');
  await sr(page, 'storageFull', false);

  // Legacy entries leaving through maxEntries free their share: the new body is saved whole again.
  const writes = await page.evaluate(() => window.sr.writes);
  await sr(page, 'state', 'updateSettings', { maxEntries: 50 });
  await sr(page, 'state', 'confirmPending'); // "Lower Max entries?" — the user confirms the deletion
  await page.waitForFunction((count) => window.sr.writes > count, writes, { timeout: 8000 });
  saved = await sr(page, 'saved');
  const legacyLeft = saved.bodies.filter(([id]) => /^p\d+$/.test(id)).length;
  assert.ok(legacyLeft < 50, `${legacyLeft} legacy entries left`);
  assert.ok(legacyWhole(saved.bodies), 'the ones left are still whole');
  assert.deepEqual(saved.bodies.find(([id]) => id === 'fresh'), ['fresh', 50_000, null], 'the freed budget holds the new body whole');
  assert.equal(await sr(page, 'notice'), null, 'a successful save ends the failure streak');
});

for (const shadow of [false, true]) {
  const surface = shadow ? 'closed shadow' : 'document';

  test(`a saved session restores bodies and typed logs exactly: Tree, Table, big integers, key order (${surface})`, async (t) => {
    const first = await open(t, shadow);
    const body = bigBody();
    await sr(first, 'add', [
      api('big', body),
      api('bigint', '{"id": 9007199254740993, "b": 1, "a": 2}'),
      api('post', '{"ok":true}', { method: 'POST', requestBodyKind: 'text', requestBodyText: '{"z":1,"id":12345678901234567890}', requestBody: { z: 1, id: 12345678901234567000 },
        requestHeaders: { 'content-type': 'application/json' } }),
      api('upload', '{"ok":true}', { method: 'POST', requestBodyKind: 'binary', requestBody: { binary: true, size: 4, base64Prefix: 'AAECAw==' } }),
    ]);
    await first.evaluate((cases) => { for (const [, code] of cases) window.eval(code); }, LOGS);
    await first.waitForFunction((n) => window.sr.logIds().length === n, LOGS.length);
    // The debounced session write (4 s), as the panel makes it.
    await first.waitForFunction(() => window.sr.writes > 0, null, { timeout: 8000 });
    const stored = await first.evaluate(() => window.sr.stored);
    assert.equal(stored.session_envelope.schemaVersion, 2);
    assert.equal(await sr(first, 'notice'), null, 'the save succeeded');
    const logIds = await sr(first, 'logIds');

    const second = await open(t, shadow, stored);
    const restored = await sr(second, 'entries');
    assert.equal(restored.find((entry) => entry.id === 'big').responseRaw, body, 'the captured text, every character');

    // Keys at the top of the tree, in the order the tree lists them (the tree is windowed: "alpha"
    // comes after every row of "data").
    const topKeys = (rows) => {
      const keyed = rows.filter((row) => row.key);
      const level = Math.min(...keyed.map((row) => row.level));
      return keyed.filter((row) => row.level === level).map((row) => row.key);
    };
    await show(second, 'big', 'response', 'tree');
    await second.waitForFunction(() => window.sr.treeRows().some((row) => row.key === '"data"'));
    assert.deepEqual(topKeys(await sr(second, 'treeRows')).slice(0, 2), ['"zeta"', '"data"'], 'keys keep their source order');
    await sr(second, 'state', 'setDetailView', 'grid');
    await second.waitForFunction(() => Boolean(window.sr.table()));
    const table = await sr(second, 'table');
    assert.deepEqual(table.headers.slice(0, 3), ['id', 'name', 'note']);
    assert.equal(table.first[0], '9007199254740993', 'Table reads the restored text: the digits are exact');
    assert.doesNotMatch(await sr(second, 'text', '.xray-request-detail .xray-detail-content'), /truncated/i);

    await show(second, 'bigint', 'response', 'tree');
    await second.waitForFunction(() => window.sr.treeRows().some((row) => row.key === '"a"'));
    const rows = await sr(second, 'treeRows');
    assert.equal(rows.find((row) => row.key === '"id"').value, '9007199254740993');
    assert.deepEqual(topKeys(rows), ['"id"', '"b"', '"a"']);

    await show(second, 'post', 'request', 'tree');
    await second.waitForFunction(() => window.sr.treeRows().some((row) => row.key === '"id"'));
    assert.equal((await sr(second, 'treeRows')).find((row) => row.key === '"id"').value, '12345678901234567890', 'the request text, not the rounded parse');

    await sr(second, 'state', 'setActiveTab', 'logs');
    await second.waitForFunction((id) => Boolean(window.sr.rowText(id)), logIds[0]);
    for (const [index, [name, , text]] of LOGS.entries()) {
      assert.equal(await sr(second, 'rowText', logIds[index]), text, `${name} reads as it did before the reload`);
    }
  });

  test(`legacy session restore: a session stored before J9 loads, its cuts shown as banners (${surface})`, async (t) => {
    const kept = ('{"rows":[' + '"x",'.repeat(5_000)).slice(0, 20_000);
    const stored = {
      session_envelope: { schemaVersion: 1, sessionId: 'old', createdAt: 1, updatedAt: 2, source: {}, entries: [
        api('suffix', '[1,2,3\n... truncated 500 chars', { size: 600 }),
        api('cut', kept + '…', { size: 32_300 }),
        api('task3', kept + '…', { responseTruncated: { totalChars: 938_891, keptChars: 250_000 }, size: 938_891 }),
        api('parsed-req', '{}', { method: 'POST', requestBody: { b: 1, a: 2 }, requestHeaders: { 'content-type': 'application/json' } }),
        { id: 'ref-log', type: 'log', logLevel: 'log', timestamp: 1_700_000_000_000, logData: { a: 1, __xray_ref__: 'r1' } },
        { id: 'error-log', type: 'log', logLevel: 'error', timestamp: 1_700_000_000_000, logData: { __type__: 'Error', name: 'TypeError', message: 'boom', stack: 'TypeError: boom' } },
        { id: 'fn-log', type: 'log', logLevel: 'log', timestamp: 1_700_000_000_000, logData: '[Function: load]' },
      ] },
    };
    const page = await open(t, shadow, stored);
    const banner = async (id, text) => {
      await show(page, id, 'response', 'tree');
      await page.waitForFunction((value) => (window.sr.text('.xray-request-detail .xray-detail-content') || '').includes(value), text);
      assert.equal((await sr(page, 'treeRows')).length, 0, `${id}: no tree for a cut body`);
    };
    await banner('suffix', 'Response truncated: showing the first 6 of 506 characters');
    await banner('cut', 'Response truncated: showing the first 20,000 characters of 32,300 bytes');
    await banner('task3', 'Response truncated: showing the first 20,000 of 938,891 characters');
    await show(page, 'parsed-req', 'request', 'tree');
    await page.waitForFunction(() => window.sr.treeRows().some((row) => row.key === '"a"'));
    await sr(page, 'state', 'setActiveTab', 'logs');
    await page.waitForFunction(() => Boolean(window.sr.rowText('fn-log')));
    assert.equal(await sr(page, 'rowText', 'ref-log'), '{"a":1}');
    assert.equal(await sr(page, 'rowText', 'error-log'), 'TypeError: boom');
    assert.equal(await sr(page, 'rowText', 'fn-log'), 'ƒ load()');
    assert.doesNotMatch(await sr(page, 'text', '.xray-panel'), /__xray_ref__|__type__/);
  });
}
