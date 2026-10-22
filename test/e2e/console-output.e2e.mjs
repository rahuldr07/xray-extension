// Console round 2, Task 2 (spec §1): how command results read, through the REAL extension — the
// unpacked build, its closed-shadow HUD and the chrome.debugger path — on a real page. Covers the
// collapsed one-line previews (> 5 keys), bare keys, Set values without indices, Array(500)
// buckets, DOM and function expansion, lazy getters that never run, the top-level promise header
// (fulfilled / pending at the cap) and the located top-level throw. The closed shadow root is
// reached through CDP (DOM.getDocument pierce), as output/console-audit/probe.mjs.txt does.

import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { build } from 'esbuild';
import { PANEL_CSS } from '../helpers/panel-css.mjs';
import { setStandardsContent } from '../helpers/standards-page.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const PAGE = `<!doctype html><html><head><title>Console output fixture</title></head><body>
<div id="app" class="main" data-role="shell">Hello <p>first</p><p class="second">second</p><span>third</span></div>
<script>
window.formatPrice = function formatPrice(cents, currency = 'EUR') { return (cents / 100).toFixed(2) + ' ' + currency; };
window.__ran = false;
window.Account = class Account { constructor() { this.id = 7; } get balance() { window.__ran = true; return 100; } };
</script></body></html>`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function openConsole(t) {
  const server = http.createServer((req, res) => {
    if (req.url.startsWith('/api/users')) {
      res.writeHead(200, { 'content-type': 'application/json', 'x-trace': 'abc' });
      res.end(JSON.stringify({ users: [{ id: 1 }] }));
      return;
    }
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end(PAGE);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xray-e2e-output-'));
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: true, channel: 'chromium', viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce',
    args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`, '--no-sandbox'],
  });
  t.after(async () => {
    await context.close();
    server.close();
    fs.rmSync(userDataDir, { recursive: true, force: true });
  });
  const page = context.pages()[0] || await context.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await sleep(1200);
  await page.keyboard.press('Control+Shift+X');
  const cdp = await context.newCDPSession(page);
  let rootId = null;

  async function resolveRoot() {
    for (let attempt = 0; attempt < 40; attempt++) {
      const { root: doc } = await cdp.send('DOM.getDocument', { depth: -1, pierce: true });
      const found = [];
      const walk = (node) => {
        for (const shadow of node.shadowRoots || []) { found.push(shadow); walk(shadow); }
        for (const child of node.children || []) walk(child);
      };
      walk(doc);
      for (const shadow of found) {
        const { object } = await cdp.send('DOM.resolveNode', { backendNodeId: shadow.backendNodeId });
        const ok = await cdp.send('Runtime.callFunctionOn', {
          objectId: object.objectId, returnByValue: true,
          functionDeclaration: 'function(){ return !!this.host && this.host.id === "__xray_root__" && !!this.querySelector(".xray-panel"); }',
        });
        if (ok.result.value) { rootId = object.objectId; return; }
      }
      await sleep(250);
    }
    throw new Error('XRAY shadow root not found');
  }
  await resolveRoot();

  // Runs `body` with `this` = the HUD's closed shadow root.
  async function inPanel(body, ...args) {
    const call = () => cdp.send('Runtime.callFunctionOn', {
      objectId: rootId, functionDeclaration: `function(...args){ ${body} }`,
      arguments: args.map((value) => ({ value })), returnByValue: true, awaitPromise: true,
    });
    let out;
    try { out = await call(); } catch { await resolveRoot(); out = await call(); }
    if (out.exceptionDetails) throw new Error(JSON.stringify(out.exceptionDetails).slice(0, 400));
    return out.result.value;
  }
  async function click(selector, text, scope = 'this') {
    const point = await inPanel(`const [sel, text] = args; const base = ${scope}; if (!base) return null;
      const els = [...base.querySelectorAll(sel)].filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
      const el = text ? els.find((e) => e.textContent.includes(text) || e.getAttribute('aria-label') === text) : els[0];
      if (!el) return null; el.scrollIntoView({ block: 'center' }); const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };`, selector, text || null);
    assert.ok(point, `nothing to click: ${selector} ${text || ''}`);
    await page.mouse.click(point.x, point.y);
    await sleep(150);
  }
  const cellCount = () => inPanel('return this.querySelectorAll(".xray-command-cell").length');
  async function run(code, waitMs = 6000) {
    const before = await cellCount();
    await click('[aria-label="Console command"]');
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.insertText(code);
    await sleep(150);
    if (await inPanel('return !!this.querySelector(".xray-editor-suggestions")')) { await page.keyboard.press('Escape'); await sleep(80); }
    await page.keyboard.press('Enter');
    const deadline = Date.now() + waitMs;
    while (Date.now() < deadline) {
      const done = await inPanel(`const cells = this.querySelectorAll('.xray-command-cell'); const c = cells[cells.length - 1];
        return cells.length > ${before} && !!c && !c.classList.contains('is-running') && !!c.querySelector('.xray-cell-time');`);
      if (done) return;
      await sleep(100);
    }
    throw new Error(`no result for ${code}`);
  }
  // The last cell: `this` there is the cell.
  const LAST = '[...this.querySelectorAll(".xray-command-cell")].at(-1)';
  const last = (body) => inPanel(`const cell = ${LAST}; ${body}`);

  await sleep(800);
  if (await inPanel('return !!this.querySelector("button.xray-firstrun-dismiss")')) await click('button.xray-firstrun-dismiss');
  await click('#xray-tab-console');
  await sleep(400);
  return { page, run, last, click, LAST, inPanel };
}

test('results read like a JS console through the real debugger (closed-shadow HUD)', { timeout: 120_000 }, async (t) => {
  const { page, run, last, click, LAST } = await openConsole(t);
  const rows = () => last('return [...cell.querySelectorAll(".xray-json-row")].map((row) => row.textContent.replace(/\\s+/g, " ").trim());');

  // Response: a web object, collapsed to its DevTools-style preview (more than 5 fields).
  await run("await fetch('/api/users')");
  const response = await last('return { badge: cell.querySelector(".xray-result-badge")?.textContent, preview: cell.querySelector(".xray-json-preview")?.textContent };');
  assert.equal(response.badge, 'Response');
  assert.match(response.preview, /^Response \{status: 200, ok: true/, response.preview);

  // Headers: two entries stay open, keyed `name =>`.
  await run("new Headers({ 'content-type': 'application/json', a: '1' })");
  assert.match((await rows()).join('\n'), /"content-type" => "application\/json"/);

  // > 5 keys: one collapsed line with an expand arrow; opened, keys are bare unless they are not identifiers.
  await run("({ id: 1, name: 'Ada', email: 'a@x.test', role: 'admin', active: true, 'content-type': 'json' })");
  let collapsed = await last('const row = cell.querySelector(".xray-json-branch"); return { text: row.textContent, open: row.closest("[aria-expanded]").getAttribute("aria-expanded") };');
  assert.equal(collapsed.open, 'false');
  assert.equal(collapsed.text, "{id: 1, name: 'Ada', email: 'a@x.test', role: 'admin', active: true, …}");
  await click('.xray-json-branch', null, LAST);
  const keys = await last('return [...cell.querySelectorAll(".xray-json-key")].map((key) => key.textContent);');
  assert.deepEqual(keys, ['id', 'name', 'email', 'role', 'active', '"content-type"']);

  // A Set lists its values without indices.
  await run('new Set([1])');
  assert.deepEqual((await rows()).filter((row) => row && row !== '}' && row !== ']'), ['Set(1) [', '1']);

  // Array(500): a big result's preview opens inline into [0 … 99] buckets.
  await run('Array.from({ length: 500 }, (_, i) => i)');
  assert.equal(await last('return cell.querySelector(".xray-result-summary")?.textContent;'), 'Array(500) [0, 1, 2, 3, 4, …]');
  assert.equal(await last('return !!cell.querySelector(".xray-json-tree");'), false, 'no tree until asked');
  await click('button[aria-label="Expand result"]', null, LAST);
  assert.equal(await last('return cell.querySelector(".xray-result-summary")?.textContent;'), '', 'the open Tree is the only copy of the value');
  const buckets = await last('return [...cell.querySelectorAll(".xray-json-branch .xray-json-key")].map((key) => key.textContent);');
  assert.deepEqual(buckets, ['[0 … 99]', '[100 … 199]', '[200 … 299]', '[300 … 399]', '[400 … 499]']);
  await click('.xray-json-branch', '[400 … 499]', LAST);
  const inBucket = await rows();
  assert.ok(inBucket.includes('400: 400') && inBucket.includes('499: 499'), inBucket.slice(0, 12).join(' | '));

  // A DOM node opens to its attributes, text and child elements.
  await run("document.getElementById('app')");
  assert.equal(await last('return cell.querySelector(".xray-json-preview")?.textContent;'), '<div#app.main>');
  await click('.xray-json-branch', '<div#app.main>', LAST);
  const dom = (await rows()).join('\n');
  assert.match(dom, /attributes: \{\nid: "app"\nclass: "main"\n"data-role": "shell"/);
  assert.match(dom, /text: "Hello firstsecondthird"/, 'the text content, as the node holds it');
  assert.match(dom, /children: \[\n0: <p>\n1: <p\.second>\n2: <span>/);

  // A function opens to its source.
  await run('formatPrice');
  assert.equal(await last('return cell.querySelector(".xray-json-preview")?.textContent;'), "ƒ formatPrice(cents, currency = 'EUR')");
  await click('.xray-json-branch', 'formatPrice', LAST);
  assert.match(await last('return cell.querySelector(".xray-json-source")?.textContent || "";'), /toFixed\(2\)/);

  // A lazy getter is "(…)" with a tooltip; clicking it runs nothing.
  await run('new Account()');
  const lazy = await last('const el = [...cell.querySelectorAll(".xray-json-value")].find((v) => v.textContent.startsWith("(…)")); return el ? { title: el.getAttribute("title"), text: el.textContent } : null;');
  assert.equal(lazy.title, 'Getter — not run, to avoid side effects');
  assert.equal(lazy.text, '(…) (Getter — not run, to avoid side effects)', 'the note is text for screen readers too (visually hidden)');
  await click('.xray-json-value', '(…)', LAST);
  assert.equal(await page.evaluate(() => window.__ran), false, 'the getter never ran');

  // A top-level promise: awaited, and the header says it was one.
  await run('Promise.resolve(5)');
  const promise = await last('return { header: cell.querySelector(".xray-cell-promise")?.textContent, value: cell.querySelector(".xray-result-scalar")?.textContent };');
  assert.match(promise.header, /^Promise · fulfilled in \d+ ms$/);
  assert.equal(promise.value, '5');

  // A top-level throw: Uncaught, located in the command.
  await run("throw new Error('x')");
  const thrown = await last('return { line: cell.querySelector(".xray-cell-error-line")?.textContent, loc: cell.querySelector(".xray-cell-error-loc")?.textContent };');
  assert.match(thrown.line, /^Uncaught Error: x/);
  assert.equal(thrown.loc, 'at <anonymous>:1:7');
  // A thrown value that is not an Error reads as itself.
  await run('throw 5');
  assert.match(await last('return cell.querySelector(".xray-cell-error-line")?.textContent;'), /^Uncaught 5/);
  await run('throw { a: 1 }');
  assert.match(await last('return cell.querySelector(".xray-cell-error-line")?.textContent;'), /^Uncaught \{a: 1\}/);

  // Still pending at the 10 s cap: Promise {<pending>} with a note, never an "Execution timeout".
  await run('new Promise(() => {})', 16_000);
  const pending = await last('return { header: cell.querySelector(".xray-cell-promise")?.textContent, value: cell.querySelector(".xray-result-scalar")?.textContent, note: cell.querySelector(".xray-cell-note")?.textContent, error: !!cell.querySelector(".xray-cell-error-line") };');
  assert.deepEqual(pending, { header: 'Promise · pending', value: 'Promise {<pending>}', note: 'Still pending after 10 s', error: false });

  // The session survived all of it: one more command runs.
  await run('1 + 1');
  assert.equal(await last('return cell.querySelector(".xray-result-scalar")?.textContent;'), '2');
});

// The document surface: the real App and stylesheet on a page, each command evaluated in that
// page and encoded by the real helper module (shared/console-helpers.js encodeResult), as the
// debugger path does — only the transport is short-circuited.
const { outputFiles } = await build({
  stdin: {
    resolveDir: root, loader: 'jsx',
    contents: `
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      import { flushSync } from 'react-dom';
      import { App } from './src/panel/App';
      import { usePanelStore } from './src/panel/store';
      const styles = ${JSON.stringify(PANEL_CSS)};
      window.doc = {
        root: document,
        setup() {
          const sheet = document.createElement('style'); sheet.textContent = styles; document.head.appendChild(sheet);
          const mount = document.body.appendChild(document.createElement('div'));
          mount.className = 'xray-app-root';
          window.XRAY_Store = { get: async () => null, set: async () => {} };
          window.XRAY_Console = {
            init() {}, setContext() {}, navigateHistory() { return null; }, setVar() {}, getVar() {}, getScope() { return {}; },
            async execute(code) {
              const encoded = await window.XRAY_ConsoleHelpers.encodeResult((0, eval)(code));
              return { type: encoded.type, result: JSON.parse(encoded.result), truncated: encoded.truncated };
            },
          };
          usePanelStore.setState({ open: true, activeTab: 'console', consoleMiniTab: 'console', entries: [], consoleEvents: [], consoleDraft: '',
            settings: { ...usePanelStore.getState().settings, panelWidth: 1000 } });
          flushSync(() => createRoot(mount).render(<App mode="window" />));
        },
        draft(code) { flushSync(() => usePanelStore.getState().setConsoleDraft(code)); },
      };
    `,
  },
  bundle: true, format: 'iife', write: false, loader: { '.css': 'text' },
});

test('results read like a JS console in the document surface (real encoder)', { timeout: 60_000 }, async (t) => {
  const executablePath = process.env.XRAY_BROWSER_EXECUTABLE ||
    (!fs.existsSync(chromium.executablePath()) && fs.existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined);
  const browser = await chromium.launch({ executablePath, headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1000, height: 900 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await setStandardsContent(page, '<style>body{margin:0;min-height:100vh}</style><div id="app" class="main">Hi <b>there</b></div>' +
    '<script>window.formatPrice = function formatPrice(cents, currency = "EUR") { return cents; }; window.__ran = false;' +
    'window.Account = class Account { constructor() { this.id = 7; } get balance() { window.__ran = true; return 1; } };</script>');
  await page.addScriptTag({ content: fs.readFileSync(path.join(root, 'shared/console-helpers.js'), 'utf8') });
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(() => window.doc.setup());
  await page.waitForSelector('.xray-console-run');
  async function run(code) {
    const before = await page.locator('.xray-command-cell').count();
    await page.evaluate((text) => window.doc.draft(text), code);
    await page.click('.xray-console-run');
    await page.waitForFunction((n) => {
      const cells = document.querySelectorAll('.xray-command-cell');
      return cells.length > n && !!cells[cells.length - 1].querySelector('.xray-cell-time');
    }, before);
  }
  const cell = () => page.locator('.xray-command-cell').last();

  await run("({ id: 1, name: 'Ada', email: 'a@x.test', role: 'admin', active: true, 'content-type': 'json' })");
  assert.equal(await cell().locator('.xray-json-preview').textContent(), "{id: 1, name: 'Ada', email: 'a@x.test', role: 'admin', active: true, …}");
  await cell().locator('.xray-json-branch').first().click();
  assert.deepEqual(await cell().locator('.xray-json-key').allTextContents(), ['id', 'name', 'email', 'role', 'active', '"content-type"']);

  await run('new Set([1, 2])');
  assert.deepEqual(await cell().locator('.xray-json-key').allTextContents(), [], 'no indices on Set values');

  await run('Array.from({ length: 500 }, (_, i) => i)');
  await cell().locator('button[aria-label="Expand result"]').click();
  assert.deepEqual(await cell().locator('.xray-json-branch .xray-json-key').allTextContents(), ['[0 … 99]', '[100 … 199]', '[200 … 299]', '[300 … 399]', '[400 … 499]']);

  await run("document.getElementById('app')");
  await cell().locator('.xray-json-branch').first().click();
  assert.match((await cell().locator('.xray-json-tree-body').textContent()).replace(/\s+/g, ' '), /attributes: \{.*text: "Hi there".*children: \[.*<b>/);

  await run('formatPrice');
  await cell().locator('.xray-json-branch').first().click();
  assert.match(await cell().locator('.xray-json-source').textContent(), /return cents;/);

  await run('new Account()');
  const lazy = cell().locator('.xray-json-value', { hasText: '(…)' });
  assert.equal(await lazy.getAttribute('title'), 'Getter — not run, to avoid side effects');
  await lazy.click();
  assert.equal(await page.evaluate(() => window.__ran), false);
  assert.deepEqual(errors, []);
});
