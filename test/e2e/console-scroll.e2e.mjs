import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { before, after } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';

// Real wheel scrolling over Console results, the stream and the inspector. A nested
// element that is a scroll container but cannot scroll (e.g. a JSON tree body with
// overflow-x:auto, whose overflow-y therefore computes to auto) used to swallow the
// wheel under the panel-wide `overscroll-behavior: contain`, so nothing scrolled.
const { outputFiles } = await build({
  stdin: {
    resolveDir: fileURLToPath(new URL('../../', import.meta.url)), loader: 'jsx',
    contents: `
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      import { flushSync } from 'react-dom';
      import { App } from './src/panel/App';
      import { usePanelStore } from './src/panel/store';
      import styles from './src/panel/styles.css';
      const TALL = { rows: Array.from({ length: 40 }, (_, i) => ({ n: i, label: 'row ' + i })) };
      // Over the big-result limit, and an object, so the inspector opens on its tree view.
      const BIG = Object.fromEntries(Array.from({ length: 300 }, (_, i) => ['key' + i, 'value ' + i]));
      window.sx = {
        root: null,
        setup(shadow) {
          const host = document.body.appendChild(document.createElement('div'));
          this.root = shadow ? host.attachShadow({ mode: 'closed' }) : document;
          const sheet = document.createElement('style'); sheet.textContent = styles;
          (shadow ? this.root : document.head).appendChild(sheet);
          const mount = shadow ? this.root.appendChild(document.createElement('div')) : host;
          mount.className = 'xray-app-root';
          window.XRAY_Store = { get: async () => null, set: async () => {} };
          window.XRAY_Console = {
            init() {}, setContext() {}, navigateHistory() { return null; }, setVar() {}, getVar() {}, getScope() { return {}; },
            execute(code) {
              if (code === 'tall') return Promise.resolve({ type: 'object', result: TALL });
              if (code === 'big') return Promise.resolve({ type: 'object', result: BIG });
              return Promise.resolve({ type: 'number', result: 1 });
            },
          };
          usePanelStore.setState({ open: true, activeTab: 'console', consoleMiniTab: 'console', selectedId: null, expandedId: null,
            entries: [], consoleEvents: [], recording: true, consoleDraft: '' });
          flushSync(() => {
            for (let i = 0; i < 60; i++) usePanelStore.getState().addConsoleEvent({ id: 'log-' + i, type: 'log', level: 'info', timestamp: 1000 + i, message: 'page line ' + i });
            createRoot(mount).render(<App mode="window" />);
          });
        },
        q(selector) { return this.root.querySelector(selector); },
        scrollTop(selector) { const el = this.q(selector); return el ? Math.round(el.scrollTop) : null; },
        // A point well inside the element, scrolled into the viewport first.
        point(selector, dy = 40) {
          const el = this.q(selector); if (!el) return null;
          el.scrollIntoView({ block: 'nearest' });
          const r = el.getBoundingClientRect();
          return { x: r.x + r.width / 2, y: Math.min(r.y + dy, r.bottom - 10) };
        },
      };
    `,
  },
  bundle: true, format: 'iife', write: false, loader: { '.css': 'text' },
});

let browser;
before(async () => {
  const executablePath = process.env.XRAY_BROWSER_EXECUTABLE ||
    (!existsSync(chromium.executablePath()) && existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined);
  browser = await chromium.launch({ executablePath, headless: true });
});
after(async () => { await browser?.close(); });

async function fixture(t, shadow) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  t.after(() => page.close());
  await page.setContent('<style>body{margin:0}</style>');
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(shadow => window.sx.setup(shadow), shadow);
  return page;
}

async function run(page, code) {
  const box = await page.evaluate(() => window.sx.point('[aria-label="Console command"]', 10));
  await page.mouse.click(box.x, box.y);
  await page.keyboard.type(code);
  await page.keyboard.press('Enter');
}

async function wheelAt(page, point, deltaY) {
  await page.mouse.move(point.x, point.y);
  await page.mouse.wheel(0, deltaY);
  await page.waitForTimeout(250);
}

for (const shadow of [false, true]) {
  const label = shadow ? 'closed shadow' : 'document';

  test(`wheel over a tall tree result scrolls the result, then hands off to the stream (${label})`, async t => {
    const page = await fixture(t, shadow);
    await run(page, 'tall');
    await page.waitForFunction(() => window.sx.q('.xray-command-cell .xray-result-body'));
    const body = '.xray-command-cell .xray-result-body';
    const overTree = await page.evaluate(sel => window.sx.point(sel, 60), body);
    await wheelAt(page, overTree, 200);
    assert.ok((await page.evaluate(sel => window.sx.scrollTop(sel), body)) > 0, 'wheel down over the tree must scroll the result body');

    // Back at the result's top, wheeling up again must scroll the message list.
    await page.evaluate(sel => { window.sx.q(sel).scrollTop = 0; }, body);
    const streamBefore = await page.evaluate(() => window.sx.scrollTop('.xray-console-stream'));
    assert.ok(streamBefore > 0, 'fixture: the stream starts scrolled to the newest output');
    await wheelAt(page, overTree, -400);
    const streamAfter = await page.evaluate(() => window.sx.scrollTop('.xray-console-stream'));
    assert.ok(streamAfter < streamBefore, `wheel up over a result at its top must scroll the stream (${streamBefore} → ${streamAfter})`);
  });

  test(`wheel over the inspector tree scrolls the inspector (${label})`, async t => {
    const page = await fixture(t, shadow);
    await run(page, 'big');
    await page.waitForFunction(() => [...window.sx.root.querySelectorAll('button')].some(b => /Open in inspector/.test(b.textContent)));
    await page.evaluate(() => [...window.sx.root.querySelectorAll('button')].find(b => /Open in inspector/.test(b.textContent)).click());
    await page.waitForFunction(() => window.sx.q('.xray-inspector-body'));
    const before = await page.evaluate(() => window.sx.scrollTop('.xray-inspector-body'));
    const point = await page.evaluate(() => window.sx.point('.xray-inspector-body .xray-json-tree-body', 120));
    await wheelAt(page, point, 400);
    const afterScroll = await page.evaluate(() => window.sx.scrollTop('.xray-inspector-body'));
    assert.ok(afterScroll > before, `wheel over the inspector tree must scroll it (${before} → ${afterScroll})`);
  });
}
