import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { before, after } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';

// Crash safety (spec J12) on the real App, store and stylesheet: one bad value never
// unmounts the panel. A NaN log used to send JsonView into an endless re-render; a value
// that throws while rendering now lands in an error boundary ("This value couldn't be
// displayed.", Copy raw, Try again) and the rest of the panel keeps working. Only
// persistence, the clipboard and the Console evaluation bridge are stubbed.
const { outputFiles } = await build({
  stdin: {
    resolveDir: fileURLToPath(new URL('../../', import.meta.url)), loader: 'jsx',
    contents: `
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      import { flushSync } from 'react-dom';
      import { App } from './src/panel/App';
      import { usePanelStore } from './src/panel/store';
      import { installPanelKeyboard } from './src/panel/runtime/panelKeyboard';
      import styles from './src/panel/styles.css';

      // Renders like any object until armed; then reading 'boom' throws, as a view
      // walking its keys would. toJSON keeps every JSON.stringify path (row previews,
      // Copy raw) away from the getter.
      const trap = () => ({
        toJSON() { return { raw: 'copy-me' }; },
        get boom() { if (window.crash.armed) throw new Error('render boom'); return 1; },
      });

      window.crash = {
        root: null, copied: null, armed: false,
        setup(shadow, mode, width) {
          const host = document.body.appendChild(document.createElement('div'));
          if (mode === 'hud') { host.style.width = width + 'px'; host.style.height = '100vh'; }
          this.root = shadow ? host.attachShadow({ mode: 'closed' }) : document;
          const sheet = document.createElement('style'); sheet.textContent = styles;
          (shadow ? this.root : document.head).appendChild(sheet);
          const mount = shadow ? this.root.appendChild(document.createElement('div')) : host;
          mount.className = 'xray-app-root';
          window.XRAY_Store = { get: async () => null, set: async () => {} };
          const self = this;
          Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (text) => { self.copied = text; } } });
          const results = { trapped: { type: 'object', result: trap() }, answer: { type: 'number', result: 42 } };
          window.XRAY_Console = {
            init() {}, setContext() {}, navigateHistory() { return null; },
            setVar() {}, getVar() { return undefined; }, getScope() { return {}; },
            execute(code) { return Promise.resolve(results[code] || { type: 'undefined' }); },
          };
          const now = Date.now();
          const entries = [
            { id: 'api-ok', type: 'api', method: 'GET', status: 200, url: 'https://example.test/ok', urlPath: '/ok', source: 'fetch',
              timestamp: now - 5000, duration: 12, size: 11, responseHeaders: { 'content-type': 'application/json' }, responseRaw: '{"ok":true}' },
            // A frame whose preview is not text: the Frames pane cannot render it.
            { id: 'api-ws', type: 'api', method: 'GET', status: 101, url: 'wss://example.test/socket', urlPath: '/socket', source: 'ws',
              timestamp: now - 4000, duration: 0, wsState: 'open', wsFrames: [{ dir: 'in', ts: now - 3900, size: 7, preview: { not: 'text' } }] },
            { id: 'log-hello', type: 'log', logLevel: 'log', timestamp: now - 3000, logData: 'hello from the page' },
            { id: 'log-nan', type: 'log', logLevel: 'log', timestamp: now - 2000, logData: NaN },
            { id: 'log-trap', type: 'log', logLevel: 'warn', timestamp: now - 1000, logData: trap() },
          ];
          usePanelStore.setState({ open: true, activeTab: 'logs', consoleMiniTab: 'console', selectedId: null, expandedId: null,
            entries, consoleEvents: [], recording: true, consoleDraft: '',
            settings: { ...usePanelStore.getState().settings, panelWidth: width, firstRunDismissed: true } });
          // Escape layers (the Console inspector) as main.tsx installs them; the panel itself stays.
          installPanelKeyboard({ dismissible: false, getRoot: () => this.root });
          flushSync(() => createRoot(mount).render(<App mode={mode} />));
        },
        has(selector) { return Boolean(this.root.querySelector(selector)); },
        text(selector) { return this.root.querySelector(selector)?.textContent ?? null; },
        count(selector) { return this.root.querySelectorAll(selector).length; },
        // Centre of the first element matching the selector (and containing the text),
        // scrolled into view: closed shadow roots are out of reach of page locators.
        box(selector, label) {
          const el = [...this.root.querySelectorAll(selector)].find((node) => label == null || node.textContent.includes(label));
          if (!el) return null;
          el.scrollIntoView({ block: 'nearest' });
          const r = el.getBoundingClientRect();
          return { x: r.x + r.width / 2, y: r.y + r.height / 2, width: r.width, height: r.height };
        },
        active() { const a = this.root.activeElement; return a ? (a.getAttribute('aria-label') || a.textContent.trim()) : null; },
        draft(code) { flushSync(() => usePanelStore.getState().setConsoleDraft(code)); },
        toast() { return usePanelStore.getState().toastMessage; },
      };
    `,
  },
  bundle: true, format: 'iife', write: false, loader: { '.css': 'text' },
  // Production React, as vite builds dist/. The development build logs every changed
  // prop for the Performance panel by reading it, so it would trip the armed test
  // value itself; a captured value can never throw on read, and shipped React never reads props.
  define: { 'process.env.NODE_ENV': '"production"' },
});

let browser;
before(async () => {
  const executablePath = process.env.XRAY_BROWSER_EXECUTABLE ||
    (!existsSync(chromium.executablePath()) && existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined);
  browser = await chromium.launch({ executablePath, headless: true });
});
after(async () => { await browser?.close(); });

const FALLBACK = "This value couldn't be displayed.";

async function open(t, fixture, width = 1400) {
  const page = await browser.newPage({ viewport: { width, height: 760 } });
  t.after(() => page.close());
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  t.after(() => assert.deepEqual(errors, [], 'no error may escape to the page'));
  await page.setContent('<style>body{margin:0;min-height:100vh}</style>');
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(args => window.crash.setup(args.shadow, args.mode, args.width), { ...fixture, width });
  await page.waitForFunction(() => window.crash.has('[role="tablist"]'));
  return page;
}

async function click(page, selector, label) {
  const box = await page.evaluate(([s, l]) => window.crash.box(s, l), [selector, label ?? null]);
  assert.ok(box, `no element for ${selector}${label ? ` containing "${label}"` : ''}`);
  assert.ok(box.width > 0 && box.height > 0, `${selector} is not visible`);
  await page.mouse.click(box.x, box.y);
}

const has = (page, selector) => page.evaluate(s => window.crash.has(s), selector);

async function waitForText(page, selector, needle) {
  await page.waitForFunction(([s, n]) => (window.crash.text(s) || '').includes(n), [selector, needle], { timeout: 4000 });
}

async function assertPanelMounted(page) {
  assert.equal(await page.evaluate(() => window.crash.count('[role="tab"]')), 5, 'the panel and its tabs are still mounted');
}

for (const fixture of [
  { shadow: false, mode: 'window', label: 'document' },
  { shadow: true, mode: 'hud', label: 'closed shadow' },
]) {
  const surface = fixture.label;

  test(`a NaN log row click keeps the panel mounted and shows NaN (${surface})`, async t => {
    const page = await open(t, fixture);
    await click(page, '#xray-log-option-log-nan');
    await waitForText(page, '.xray-log-detail-body', 'NaN');
    await assertPanelMounted(page);
    assert.equal(await has(page, '.xray-render-fallback'), false, 'NaN renders as a value, not as a failure');
    // The list still selects: another log opens normally.
    await click(page, '#xray-log-option-log-hello');
    await waitForText(page, '.xray-log-detail-body', 'hello from the page');
  });

  test(`a log value that throws while rendering shows the fallback with Copy raw; the panel stays usable (${surface})`, async t => {
    const page = await open(t, fixture);
    await page.evaluate(() => { window.crash.armed = true; });
    await click(page, '#xray-log-option-log-trap');
    await waitForText(page, '.xray-log-detail', FALLBACK);
    await assertPanelMounted(page);
    assert.equal(await has(page, '.xray-log-detail-head'), true, 'the log header (level, close) stays');
    assert.equal(await page.evaluate(() => window.crash.root.querySelector('.xray-render-fallback')?.getAttribute('role')), 'alert');

    await click(page, '.xray-render-fallback button', 'Copy raw');
    await page.waitForFunction(() => window.crash.copied !== null, null, { timeout: 4000 });
    assert.match(await page.evaluate(() => window.crash.copied), /copy-me/, 'Copy raw copies the value as JSON');
    assert.equal(await page.evaluate(() => window.crash.toast()), 'Raw value copied.');

    // Still failing: Try again shows the fallback again, and keeps focus on Try again.
    await click(page, '.xray-render-fallback button', 'Try again');
    await waitForText(page, '.xray-log-detail', FALLBACK);
    assert.equal(await page.evaluate(() => window.crash.active()), 'Try again');
    // Fixed: Try again renders the value.
    await page.evaluate(() => { window.crash.armed = false; });
    await click(page, '.xray-render-fallback button', 'Try again');
    await waitForText(page, '.xray-log-detail-body', 'boom');
    assert.equal(await has(page, '.xray-render-fallback'), false);

    // A different log resets the boundary, even while the bad value stays bad.
    await click(page, '#xray-log-option-log-hello');
    await waitForText(page, '.xray-log-detail-body', 'hello from the page');
    await page.evaluate(() => { window.crash.armed = true; });
    await click(page, '#xray-log-option-log-trap');
    await waitForText(page, '.xray-log-detail', FALLBACK);
    await click(page, '#xray-log-option-log-hello');
    await waitForText(page, '.xray-log-detail-body', 'hello from the page');
    assert.equal(await has(page, '.xray-render-fallback'), false);
    // The tabs still switch. (Disarmed first: the test value is readable from every
    // workspace, which no captured value ever is.)
    await page.evaluate(() => { window.crash.armed = false; });
    await click(page, '[role="tab"]', 'API');
    await page.waitForFunction(() => window.crash.has('[aria-label="Captured requests"]'), null, { timeout: 4000 });
    await click(page, '[role="tab"]', 'Logs');
    await page.waitForFunction(() => window.crash.has('[aria-label="Captured logs"]'), null, { timeout: 4000 });
  });

  test(`a stream frame that cannot render shows the fallback in the Frames pane; the facets stay usable (${surface})`, async t => {
    const page = await open(t, fixture);
    await click(page, '[role="tab"]', 'API');
    await click(page, '[role="option"]', '/socket');
    await page.waitForFunction(() => window.crash.has('.xray-request-detail'), null, { timeout: 4000 });
    await click(page, '.xray-request-detail .xray-detail-tab', 'Frames');
    await waitForText(page, '.xray-detail-content', FALLBACK);
    await assertPanelMounted(page);
    assert.equal(await has(page, '[aria-label="Request facets"]'), true, 'the facet tabs stay');

    await click(page, '.xray-render-fallback button', 'Copy raw');
    await page.waitForFunction(() => window.crash.copied !== null, null, { timeout: 4000 });
    assert.match(await page.evaluate(() => window.crash.copied), /"not": "text"/, 'Copy raw copies the frames');

    // Another facet replaces the failed pane.
    await click(page, '.xray-request-detail .xray-detail-tab', 'Headers');
    await page.waitForFunction(() => window.crash.has('.xray-headers-view'), null, { timeout: 4000 });
    assert.equal(await has(page, '.xray-render-fallback'), false);
    // And another request opens normally.
    await click(page, '[role="option"]', '/ok');
    await page.waitForFunction(() => (window.crash.text('.xray-request-detail h3') || '') === '/ok', null, { timeout: 4000 });
  });

  test(`a Console result that throws while rendering shows the fallback in its cell; the Console keeps running (${surface})`, async t => {
    const page = await open(t, fixture);
    await click(page, '[role="tab"]', 'Console');
    await page.waitForFunction(() => window.crash.has('.xray-console-run'), null, { timeout: 4000 });
    await page.evaluate(() => { window.crash.armed = true; window.crash.draft('trapped'); });
    await click(page, '.xray-console-run');
    await waitForText(page, '.xray-command-cell', FALLBACK);
    await assertPanelMounted(page);

    await click(page, '.xray-command-cell .xray-render-fallback button', 'Copy raw');
    await page.waitForFunction(() => window.crash.copied !== null, null, { timeout: 4000 });
    assert.match(await page.evaluate(() => window.crash.copied), /copy-me/);

    await page.evaluate(() => window.crash.draft('answer'));
    await click(page, '.xray-console-run');
    await page.waitForFunction(() => window.crash.count('.xray-command-cell') === 2 && (window.crash.root.querySelectorAll('.xray-command-cell')[1].textContent || '').includes('42'), null, { timeout: 4000 });
  });

  test(`a value that throws in the inspector shows the fallback there; the inspector still closes (${surface})`, async t => {
    const page = await open(t, fixture);
    await click(page, '[role="tab"]', 'Console');
    await page.waitForFunction(() => window.crash.has('.xray-console-run'), null, { timeout: 4000 });
    // Disarmed, the result renders as a tree with Open in inspector.
    await page.evaluate(() => window.crash.draft('trapped'));
    await click(page, '.xray-console-run');
    await page.waitForFunction(() => window.crash.has('.xray-command-cell [aria-label="Open in inspector"]'), null, { timeout: 4000 });
    await page.evaluate(() => { window.crash.armed = true; });
    await click(page, '.xray-command-cell [aria-label="Open in inspector"]');
    await waitForText(page, '.xray-inspector', FALLBACK);
    await assertPanelMounted(page);
    assert.equal(await has(page, '.xray-inspector-head'), true, 'the header and its close control stay');

    await click(page, '.xray-inspector .xray-render-fallback button', 'Copy raw');
    await page.waitForFunction(() => window.crash.copied !== null, null, { timeout: 4000 });
    assert.match(await page.evaluate(() => window.crash.copied), /copy-me/);

    // Escape (the inspector's layer) closes it…
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !window.crash.has('.xray-inspector'), null, { timeout: 4000 });
    await assertPanelMounted(page);
    // …and so does its close control.
    await click(page, '.xray-command-cell [aria-label="Open in inspector"]');
    await waitForText(page, '.xray-inspector', FALLBACK);
    await click(page, '[aria-label="Close inspector"], [aria-label="Back to console"]');
    await page.waitForFunction(() => !window.crash.has('.xray-inspector'), null, { timeout: 4000 });
    await assertPanelMounted(page);
  });
}
