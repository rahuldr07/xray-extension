import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { before, after } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { PANEL_CSS } from '../helpers/panel-css.mjs';
import { setStandardsContent } from '../helpers/standards-page.mjs';

// Final fix C1 on the real App, store and stylesheet, in the document and in a closed shadow root,
// with shared/console-helpers.js loaded as every extension surface loads it. A response nested
// 100,000 levels deep (the spec's fixture, 200,000 characters, under the capture cap) used to unmount
// the whole panel — through a live capture and again after every reload, since the session saves it.
// Now the panel stays (five tabs) and Tree and Raw show the body. And any computation that still
// fails outside the views lands in the root error boundary, whose fallback offers Reload panel and
// Clear session (confirmed as every destructive action is). Only chrome.storage and the console
// engine are stubbed.
const projectRoot = fileURLToPath(new URL('../../', import.meta.url));
const HELPERS_SOURCE = readFileSync(new URL('../../shared/console-helpers.js', import.meta.url), 'utf8');
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

      const DEPTH = 100000;
      const api = (id, responseRaw, extra) => ({ id, type: 'api', method: 'GET', status: 200, url: 'https://example.test/' + id, urlPath: '/' + id,
        source: 'fetch', timestamp: Date.now(), duration: 5, size: responseRaw.length, responseHeaders: { 'content-type': 'application/json' },
        responseRaw, requestBodyKind: 'none', ...extra });

      window.dj = {
        root: null, stored: {}, writes: 0, armed: false,
        async setup(shadow, stored) {
          this.stored = stored || {};
          const self = this;
          // chrome.storage keeps a value's JSON, and gives every object back with its keys sorted.
          const kept = (value) => JSON.parse(JSON.stringify(value, (name, item) => (item && typeof item === 'object' && !Array.isArray(item)
            ? Object.fromEntries(Object.keys(item).sort().map((k) => [k, item[k]])) : item)));
          window.XRAY_Store = {
            get: async (key) => (key in self.stored ? kept(self.stored[key]) : null),
            set: async (key, value) => { self.stored[key] = kept(value); if (key === 'session_envelope') self.writes += 1; },
          };
          window.XRAY_Console = {
            init() {}, setContext() {}, navigateHistory() { return null; }, setVar() {}, getVar() { return undefined; }, getScope() { return {}; },
            execute() { return Promise.resolve({ type: 'undefined' }); },
          };
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
        addDeep() { flushSync(() => usePanelStore.getState().addEntries([api('deep', '['.repeat(DEPTH) + ']'.repeat(DEPTH))])); },
        // An entry whose URL throws once armed: reading it fails in the shell's session index, outside
        // every view's own boundary — a stand-in for any computation that still fails at the root.
        addTrap() {
          const self = this;
          const trap = { ...api('trap', '{"ok":true}') };
          delete trap.url;
          Object.defineProperty(trap, 'url', { enumerable: true, get() { if (self.armed) throw new Error('root boom'); return 'https://example.test/trap'; } });
          flushSync(() => usePanelStore.setState({ entries: [api('ok', '{"fine":true}'), trap] }));
        },
        // An imported entry (a session file, or one saved before J4) keeps its request body as a value
        // with no kind or text; this one is nested 100,000 levels deep. Import takes it in by restoreEntries.
        importDeepValue() {
          let value = [];
          for (let i = 1; i < DEPTH; i++) value = [value];
          const entry = { ...api('old', '{"ok":true}'), method: 'POST', imported: true, requestHeaders: { 'content-type': 'application/json' }, requestBody: { data: value } };
          delete entry.requestBodyKind;
          flushSync(() => usePanelStore.getState().restoreEntries([entry]));
        },
        // A new entries array: the shell rebuilds its index (and reads the trap).
        touch() { flushSync(() => usePanelStore.setState({ entries: [...usePanelStore.getState().entries] })); },
        state(name, ...args) { flushSync(() => usePanelStore.getState()[name](...args)); },
        settings(patch) { flushSync(() => usePanelStore.setState({ settings: { ...usePanelStore.getState().settings, ...patch } })); },
        entryIds() { return usePanelStore.getState().entries.map((entry) => entry.id); },
        entry(id) { return usePanelStore.getState().entries.find((entry) => entry.id === id); },
        q(selector) { return this.root.querySelector(selector); },
        all(selector) { return [...this.root.querySelectorAll(selector)]; },
        text(selector) { return this.q(selector)?.textContent ?? null; },
        count(selector) { return this.root.querySelectorAll(selector).length; },
        box(selector, label) {
          const el = this.all(selector).find((node) => label == null || node.textContent.trim() === label || node.textContent.includes(label));
          if (!el) return null;
          el.scrollIntoView({ block: 'nearest' });
          const r = el.getBoundingClientRect();
          return { x: r.x + r.width / 2, y: r.y + r.height / 2, width: r.width, height: r.height };
        },
        treeLevels() { return this.all('.xray-request-detail [role="tree"] [role="treeitem"]').map((row) => Number(row.getAttribute('aria-level'))); },
        rawHead() {
          const rows = this.all('.xray-raw [data-raw-row]').sort((a, b) => Number(a.dataset.rawRow) - Number(b.dataset.rawRow));
          return rows.length ? rows[0].querySelector('.xray-json-line-text').textContent : null;
        },
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

async function open(t, shadow, stored = {}, { rootFailures = false } = {}) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  t.after(() => page.close());
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  // React reports what a boundary caught with console.error; only the deliberate root failure may.
  const reported = [];
  page.on('console', (message) => { if (message.type() === 'error') reported.push(message.text()); });
  t.after(() => {
    assert.deepEqual(errors, [], 'no error may escape to the page');
    if (!rootFailures) assert.deepEqual(reported, [], 'nothing failed to render');
    else assert.ok(reported.every((text) => text.includes('root boom')), reported.join(' | '));
  });
  await setStandardsContent(page, '<style>body{margin:0;min-height:100vh}</style>');
  await page.addScriptTag({ content: HELPERS_SOURCE });
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(([value, data]) => window.dj.setup(value, data), [shadow, stored]);
  await page.waitForFunction(() => Boolean(window.dj.q('[role="tablist"]')));
  return page;
}

const dj = (page, name, ...args) => page.evaluate(([method, values]) => window.dj[method](...values), [name, args]);
const tabs = (page) => dj(page, 'count', '[role="tab"]');

async function click(page, selector, label) {
  const box = await page.evaluate(([s, l]) => window.dj.box(s, l), [selector, label ?? null]);
  assert.ok(box, `no element for ${selector}${label ? ` labelled "${label}"` : ''}`);
  assert.ok(box.width > 0 && box.height > 0, `${selector} is not visible`);
  await page.mouse.click(box.x, box.y);
}

/** The deep entry opens; Tree shows its first levels and Raw its text. */
async function treeAndRaw(page) {
  await dj(page, 'state', 'selectEntry', 'deep');
  await page.waitForFunction(() => (window.dj.text('.xray-request-detail h3') || '') === '/deep', null, { timeout: 8000 });
  await click(page, '[aria-label="Body views"] button', 'Tree');
  await page.waitForFunction(() => window.dj.treeLevels().length > 0, null, { timeout: 8000 });
  assert.equal(Math.max(...await dj(page, 'treeLevels')), 5, 'Tree: four levels open by default');
  await click(page, '[aria-label="Body views"] button', 'Raw');
  await page.waitForFunction(() => window.dj.rawHead() !== null, null, { timeout: 8000 });
  assert.match(await dj(page, 'rawHead'), /^\[{20}/, 'Raw: the captured text');
  assert.equal(await tabs(page), 5, 'the panel is still mounted');
}

for (const shadow of [false, true]) {
  const surface = shadow ? 'closed shadow' : 'document';

  test(`a 100,000-deep response captured live keeps the panel mounted; Tree and Raw show it (${surface})`, async (t) => {
    const page = await open(t, shadow);
    assert.equal(await tabs(page), 5);
    await dj(page, 'addDeep');
    assert.equal(await tabs(page), 5, 'five tabs after the capture');
    assert.deepEqual(await dj(page, 'entryIds'), ['deep']);
    await treeAndRaw(page);
  });

  test(`a saved 100,000-deep response restores after a reload; the panel stays mounted (${surface})`, async (t) => {
    const first = await open(t, shadow);
    await dj(first, 'addDeep');
    // The debounced session write (4 s), as the panel makes it.
    await first.waitForFunction(() => window.dj.writes > 0, null, { timeout: 10000 });
    const stored = await first.evaluate(() => window.dj.stored);
    assert.equal(stored.session_envelope.entries.length, 1);
    assert.equal(stored.session_envelope.entries[0].responseRaw.length, 200_000, 'saved whole');

    const reloaded = await open(t, shadow, stored);
    assert.deepEqual(await dj(reloaded, 'entryIds'), ['deep'], 'restored');
    assert.equal(await tabs(reloaded), 5, 'five tabs after the restore');
    await treeAndRaw(reloaded);
  });

  test(`Addendum: an imported entry whose request body is a 100,000-deep value opens; Copy cURL says the body is left out (${surface})`, async (t) => {
    const page = await open(t, shadow);
    await dj(page, 'importDeepValue');
    assert.deepEqual(await dj(page, 'entryIds'), ['old']);
    await dj(page, 'state', 'selectEntry', 'old');
    await page.waitForFunction(() => (window.dj.text('.xray-request-detail h3') || '') === '/old', null, { timeout: 8000 });
    assert.equal(await tabs(page), 5, 'selecting it keeps the panel');
    assert.equal(await dj(page, 'count', '.xray-root-fallback'), 0);
    // The Request facet shows the value as a tree.
    await click(page, '.xray-request-detail .xray-detail-tab', 'Request');
    await page.waitForFunction(() => window.dj.treeLevels().length > 0, null, { timeout: 8000 });
    assert.equal(await tabs(page), 5);
    // Copy cURL (the shared helpers, as on every surface) leaves the body out and says why.
    const curl = await page.evaluate(() => window.XRAY_ConsoleHelpers.generateCurl(window.dj.entry('old')));
    assert.match(curl, /^# Partial: the request body is nested too deeply to print as JSON, so it is left out\.\ncurl /);
  });

  test(`a failure outside the views shows the root fallback: Reload panel retries, Clear session asks first, then clears (${surface})`, async (t) => {
    const page = await open(t, shadow, {}, { rootFailures: true });
    await dj(page, 'addTrap');
    assert.equal(await tabs(page), 5);

    await page.evaluate(() => { window.dj.armed = true; window.dj.touch(); });
    await page.waitForFunction(() => Boolean(window.dj.q('.xray-root-fallback')), null, { timeout: 4000 });
    assert.equal(await tabs(page), 0, 'the panel itself failed');
    const fallback = await page.evaluate(() => {
      const r = window.dj.q('.xray-root-fallback').getBoundingClientRect();
      return { width: r.width, height: r.height, role: window.dj.q('.xray-root-fallback').getAttribute('role'), text: window.dj.text('.xray-root-fallback') };
    });
    assert.ok(fallback.width > 200 && fallback.height > 50, `the fallback is visible: ${fallback.width}×${fallback.height}`);
    assert.equal(fallback.role, 'alert');
    assert.match(fallback.text, /XRAY couldn't show the panel/);

    // Still failing: Reload panel shows the fallback again.
    await click(page, '.xray-root-fallback button', 'Reload panel');
    await page.waitForFunction(() => Boolean(window.dj.q('.xray-root-fallback')), null, { timeout: 4000 });
    assert.equal(await tabs(page), 0);
    // Fixed: Reload panel brings the panel back, entries intact.
    await page.evaluate(() => { window.dj.armed = false; });
    await click(page, '.xray-root-fallback button', 'Reload panel');
    await page.waitForFunction(() => window.dj.count('[role="tab"]') === 5, null, { timeout: 4000 });
    assert.equal(await dj(page, 'count', '.xray-root-fallback'), 0);
    assert.deepEqual(await dj(page, 'entryIds'), ['ok', 'trap']);

    // Clear session asks first (the confirmation setting is on by default); Cancel keeps everything.
    await page.evaluate(() => { window.dj.armed = true; window.dj.touch(); });
    await page.waitForFunction(() => Boolean(window.dj.q('.xray-root-fallback')), null, { timeout: 4000 });
    await click(page, '.xray-root-fallback button', 'Clear session');
    await page.waitForFunction(() => /Clear the captured session\?/.test(window.dj.text('.xray-root-fallback') || ''), null, { timeout: 4000 });
    await click(page, '.xray-root-fallback button', 'Cancel');
    await page.waitForFunction(() => !/Clear the captured session\?/.test(window.dj.text('.xray-root-fallback') || ''), null, { timeout: 4000 });
    assert.deepEqual(await dj(page, 'entryIds'), ['ok', 'trap'], 'Cancel clears nothing');
    // Confirmed: the session is cleared and the panel comes back.
    await click(page, '.xray-root-fallback button', 'Clear session');
    await page.waitForFunction(() => /Clear the captured session\?/.test(window.dj.text('.xray-root-fallback') || ''), null, { timeout: 4000 });
    await click(page, '.xray-root-fallback .xray-btn.danger', 'Clear session');
    await page.waitForFunction(() => window.dj.count('[role="tab"]') === 5, null, { timeout: 4000 });
    assert.deepEqual(await dj(page, 'entryIds'), []);
    assert.equal(await dj(page, 'count', '.xray-root-fallback'), 0);

    // With confirmations turned off in Settings, Clear session clears at once.
    await dj(page, 'settings', { confirmDestructiveActions: false });
    await dj(page, 'addTrap');
    await page.evaluate(() => { window.dj.armed = true; window.dj.touch(); });
    await page.waitForFunction(() => Boolean(window.dj.q('.xray-root-fallback')), null, { timeout: 4000 });
    await click(page, '.xray-root-fallback button', 'Clear session');
    await page.waitForFunction(() => window.dj.count('[role="tab"]') === 5, null, { timeout: 4000 });
    assert.deepEqual(await dj(page, 'entryIds'), []);
  });
}
