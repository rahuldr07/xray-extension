import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { before, after } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { PANEL_CSS } from '../helpers/panel-css.mjs';
import { setStandardsContent } from '../helpers/standards-page.mjs';

// API detail Table, Schema, Diff and Visualize, and the global search (spec §2 J3, J14, J15; §8 J11;
// plan Task 6) on the real App, store and stylesheet, in the document and in a closed shadow root.
// They read the lossless parser's nodes: integers past 2^53 keep their digits, -0 and 5e-324 are shown
// as written, a capped Table and a stopped Diff say so, the search finds the captured text. Every
// surface uses the same panel-side models: with a DevTools worker present (stubbed with the answers
// the old worker gave) nothing changes and the worker is never asked. Only persistence, the clipboard
// and that worker are stubbed.
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
      const styles = ${JSON.stringify(PANEL_CSS)};

      const nest = (leaf, levels) => (levels === 0 ? leaf : { a: nest(leaf, levels - 1) });
      const FIX = {
        envelope: '{"errors":[],"data":[{"id":9007199254740993,"name":"a"},{"id":2,"name":"b"}]}',
        many: '[' + Array.from({ length: 1200 }, (_, i) => '{"i":' + i + ',"v":"x"}').join(',') + ']',
        wide: JSON.stringify([Object.fromEntries(Array.from({ length: 40 }, (_, i) => ['c' + i, i]))]),
        floats: '{"negz":-0,"tiny":5e-324,"one":1.0}',
        pretty: '{\\n  "a": 1,\\n  "id": 9007199254740993\\n}',
        diffA: '{"id":9007199254740992,"same":1}',
        diffB: '{"id":9007199254740993,"same":1}',
        deepA: JSON.stringify(nest('x', 12)),
        deepB: JSON.stringify(nest('y', 12)),
      };
      const now = Date.now();
      let order = 0;
      const api = (id, responseRaw, extra) => ({ id, type: 'api', method: 'GET', status: 200,
        url: 'https://example.test/' + id, urlPath: '/' + id, source: 'fetch', timestamp: now - 100000 + (order++) * 10,
        duration: 12, size: responseRaw.length, responseHeaders: { 'content-type': 'application/json' }, responseRaw, ...extra });
      const at = (path) => ({ url: 'https://example.test' + path, urlPath: path });

      window.nv = {
        root: null, copied: [], workerCalls: 0, FIX,
        setup(shadow, mode, width, worker) {
          const host = document.body.appendChild(document.createElement('div'));
          if (mode === 'hud') { host.style.width = width + 'px'; host.style.height = '100vh'; }
          this.root = shadow ? host.attachShadow({ mode: 'closed' }) : document;
          const sheet = document.createElement('style'); sheet.textContent = styles;
          (shadow ? this.root : document.head).appendChild(sheet);
          const mount = shadow ? this.root.appendChild(document.createElement('div')) : host;
          mount.className = 'xray-app-root';
          window.XRAY_Store = { get: async () => null, set: async () => {} };
          const self = this;
          Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (text) => { self.copied.push(text); } } });
          if (worker) {
            // What the DevTools worker used to answer for the envelope: the FIRST array (no rows), a
            // "string" schema and its own diff. The panel must not ask it, so none of this may show.
            window.XRAY_Worker = {
              isReady: () => true,
              detailAnalysis: async () => { self.workerCalls++; return { grid: { objects: [], columns: [] }, schema: 'stale-worker-schema', diff: { structuralDiff: [{ type: 'changed', path: 'stale-worker-path', from: 1, to: 2 }] } }; },
              computeStats: async () => { self.workerCalls++; return {}; },
              search: async (q, entries) => { self.workerCalls++; return entries; },
            };
          }
          const entries = [
            api('envelope', FIX.envelope), api('many', FIX.many), api('wide', FIX.wide),
            api('scalar-42', '42'), api('scalar-true', 'true'), api('scalar-null', 'null'), api('scalar-hi', '"hi"'),
            api('floats', FIX.floats), api('pretty', FIX.pretty),
            api('diff-a', FIX.diffA, at('/diff')), api('diff-b', FIX.diffB, at('/diff')),
            api('deep-a', FIX.deepA, at('/deep')), api('deep-b', FIX.deepB, at('/deep')),
            api('cut-a', '[{"id":1},{"i', { ...at('/cut'), responseTruncated: { totalChars: 900, keptChars: 13 } }),
            api('cut-b', '[{"id":1}]', at('/cut')),
            api('cuttext-a', '<html><body>first part', { ...at('/cuttext'), responseHeaders: { 'content-type': 'text/html' }, responseTruncated: { totalChars: 900, keptChars: 22 } }),
            api('cuttext-b', '<html><body>complete</body></html>', { ...at('/cuttext'), responseHeaders: { 'content-type': 'text/html' } }),
          ];
          usePanelStore.setState({ open: true, activeTab: 'api', consoleMiniTab: 'console', selectedId: null, expandedId: null,
            entries, consoleEvents: [], recording: true, detailTab: 'response', detailView: 'tree',
            settings: { ...usePanelStore.getState().settings, panelWidth: width, firstRunDismissed: true } });
          installPanelKeyboard({ dismissible: false, getRoot: () => this.root });
          flushSync(() => createRoot(mount).render(<App mode={mode} />));
        },
        select(id) { flushSync(() => usePanelStore.getState().selectEntry(id)); },
        selected() { return usePanelStore.getState().selectedId; },
        openSearch() { flushSync(() => usePanelStore.getState().setGlobalSearchOpen(true)); this.q('[aria-label="Search captured traffic"]').focus(); },
        q(selector) { return this.root.querySelector(selector); },
        all(selector) { return [...this.root.querySelectorAll(selector)]; },
        text(selector) { return this.q(selector)?.textContent ?? null; },
        has(selector) { return Boolean(this.q(selector)); },
        box(selector, label) {
          const el = this.all(selector).find((node) => label == null || node.textContent.trim() === label || node.textContent.includes(label));
          if (!el) return null;
          el.scrollIntoView({ block: 'nearest' });
          const r = el.getBoundingClientRect();
          return { x: r.x + r.width / 2, y: r.y + r.height / 2, width: r.width, height: r.height };
        },
        content() { return this.text('.xray-request-detail .xray-detail-content') || ''; },
        table() {
          const table = this.q('.xray-request-detail .xray-table');
          return {
            notice: this.text('.xray-request-detail .xray-table-notice'),
            headers: table ? [...table.querySelectorAll('th')].map((th) => th.textContent) : [],
            rows: table ? [...table.querySelectorAll('tbody tr')].map((tr) => [...tr.querySelectorAll('td')].map((td) => td.textContent)) : [],
          };
        },
        diff() {
          return {
            head: this.text('.xray-request-detail .xray-diff-head'),
            notices: this.all('.xray-request-detail .xray-diff .xray-body-notice').map((el) => el.textContent),
            lines: this.all('.xray-request-detail .xray-diff-line').map((line) => [line.classList[1], line.querySelector('.xray-diff-path').textContent,
              line.querySelector('.xray-diff-before')?.textContent ?? null, line.querySelector('.xray-diff-after')?.textContent ?? null]),
          };
        },
        viz() {
          return {
            title: this.text('.xray-request-detail .xray-viz-head h3'),
            bars: this.all('.xray-request-detail .xray-viz-row').map((row) => [row.querySelector('.xray-viz-label').textContent, row.querySelector('.xray-viz-value').textContent]),
          };
        },
        search() {
          return this.all('.xray-gsearch-row').map((row) => [row.querySelector('.xray-gsearch-path').textContent, row.querySelector('.xray-gsearch-snippet')?.textContent ?? '']);
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

async function open(t, fixture, { width = 1400, worker = false } = {}) {
  const page = await browser.newPage({ viewport: { width, height: 800 } });
  t.after(() => page.close());
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  t.after(() => assert.deepEqual(errors, [], 'no error may escape to the page'));
  await setStandardsContent(page, '<style>body{margin:0;min-height:100vh}</style>');
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(args => window.nv.setup(args.shadow, args.mode, args.width, args.worker), { ...fixture, width, worker });
  await page.waitForFunction(() => window.nv.has('[aria-label="Captured requests"]'));
  return page;
}

const evaluate = (page, fn, arg) => page.evaluate(fn, arg);
const waitFor = (page, fn, arg, timeout = 5000) => page.waitForFunction(fn, arg, { timeout });

async function click(page, selector, label) {
  const box = await evaluate(page, ([s, l]) => window.nv.box(s, l), [selector, label ?? null]);
  assert.ok(box, `no element for ${selector}${label ? ` labelled "${label}"` : ''}`);
  assert.ok(box.width > 0 && box.height > 0, `${selector} is not visible`);
  await page.mouse.click(box.x, box.y);
}

async function select(page, id, path = '/' + id) {
  await evaluate(page, value => window.nv.select(value), id);
  await waitFor(page, ([value, heading]) => window.nv.selected() === value && (window.nv.text('.xray-request-detail h3') || '') === heading, [id, path]);
}

// Selecting a view is idempotent; under a saturated CPU a click can land while the drawer is still
// laying out (the same helper as json-views.e2e.mjs).
async function view(page, name) {
  for (let attempt = 1; ; attempt++) {
    await click(page, '[aria-label="Body views"] button', name);
    try {
      await waitFor(page, value => window.nv.q('[aria-label="Body views"] [aria-pressed="true"]')?.textContent === value, name, 2500);
      return;
    } catch (error) {
      if (attempt === 3) throw error;
    }
  }
}

async function copy(page) {
  const before = await evaluate(page, () => window.nv.copied.length);
  await click(page, '.xray-detail-actions button', 'Copy');
  await waitFor(page, count => window.nv.copied.length > count, before);
  return evaluate(page, () => window.nv.copied.at(-1));
}

for (const fixture of [
  { shadow: false, mode: 'window', label: 'document' },
  { shadow: true, mode: 'hud', label: 'closed shadow' },
]) {
  const surface = fixture.label;

  test(`Table shows the rows of the largest array with exact digits; a capped Table says so (${surface})`, async t => {
    const page = await open(t, fixture);
    await select(page, 'envelope');
    await view(page, 'Table');
    await waitFor(page, () => window.nv.table().rows.length > 0);
    assert.deepEqual(await evaluate(page, () => window.nv.table()), {
      notice: null, headers: ['id', 'name'], rows: [['9007199254740993', 'a'], ['2', 'b']],
    });
    // Copy gives what the Table shows: its rows and columns (values as written) and its notice.
    const copiedText = await copy(page);
    assert.ok(copiedText.includes('"id": 9007199254740993'), `Copy keeps the digits: ${copiedText.slice(0, 80)}`);
    const copied = JSON.parse(copiedText);
    assert.deepEqual(Object.keys(copied), ['rows', 'notices']);
    assert.deepEqual(copied.rows.map(row => [Object.keys(row), row.name]), [[['id', 'name'], 'a'], [['id', 'name'], 'b']]);
    assert.deepEqual(copied.notices, []);
    await select(page, 'many');
    await waitFor(page, () => window.nv.table().notice !== null);
    const many = await evaluate(page, () => window.nv.table());
    assert.equal(many.notice, 'Showing 200 of 1,200 rows · 2 of 2 columns');
    assert.equal(many.rows.length, 200);
    const manyCopy = JSON.parse(await copy(page));
    assert.equal(manyCopy.rows.length, 200, 'the rows shown, not all 1,200');
    assert.deepEqual(manyCopy.notices, ['Showing 200 of 1,200 rows · 2 of 2 columns']);
    await select(page, 'wide');
    await waitFor(page, () => /20 of 40 columns/.test(window.nv.table().notice || ''));
    assert.equal((await evaluate(page, () => window.nv.table())).notice, 'Showing 1 of 1 rows · 20 of 40 columns');
    const wideCopy = JSON.parse(await copy(page));
    assert.equal(Object.keys(wideCopy.rows[0]).length, 20, 'the columns shown, not all 40');
    assert.deepEqual(wideCopy.notices, ['Showing 1 of 1 rows · 20 of 40 columns']);
  });

  test(`Schema types a top-level 42, true, null and "hi" from the parse (${surface})`, async t => {
    const page = await open(t, fixture);
    await select(page, 'scalar-42');
    await view(page, 'Schema');
    for (const [id, type] of [['scalar-42', 'number'], ['scalar-true', 'boolean'], ['scalar-null', 'null'], ['scalar-hi', 'string']]) {
      await select(page, id);
      await waitFor(page, expected => window.nv.content().includes(expected), `"${type}"`);
      assert.equal((await evaluate(page, () => window.nv.content())).trim().replace(/^Expand allCollapse all/, ''), `"${type}"`, id);
    }
  });

  test(`Diff compares lexemes (…992 ≠ …993) and states a depth limit instead of "no differences" (${surface})`, async t => {
    const page = await open(t, fixture);
    await select(page, 'diff-b', '/diff');
    await view(page, 'Diff');
    await waitFor(page, () => window.nv.diff().lines.length > 0);
    assert.deepEqual(await evaluate(page, () => window.nv.diff()), {
      head: '1 difference vs the previous call', notices: [], lines: [['changed', 'id', '9007199254740992', '9007199254740993']],
    });
    await select(page, 'deep-b', '/deep');
    await waitFor(page, () => window.nv.diff().notices.length > 0);
    const deep = await evaluate(page, () => window.nv.diff());
    assert.equal(deep.lines.length, 1);
    assert.equal(deep.lines[0][1], 'a.a.a.a.a.a.a.a.a');
    assert.match(deep.notices[0], /^Compared 8 levels deep: a\.a\.a\.a\.a\.a\.a\.a\.a differs below that depth/);
    assert.doesNotMatch(deep.head, /No structural differences/);
    const copied = JSON.parse(await copy(page));
    assert.equal(copied.differences.length, 1);
    assert.deepEqual(copied.notices, deep.notices, 'Copy carries the notice too');
    // A truncated previous body is not the JSON that was sent: no diff against it, and it says so.
    await select(page, 'cut-b', '/cut');
    await waitFor(page, () => /Diff unavailable: the previous body was truncated/.test(window.nv.content()));
    assert.equal(await evaluate(page, () => window.nv.all('.xray-request-detail .xray-diff-line').length), 0);
    assert.deepEqual(JSON.parse(await copy(page)), { differences: [], notices: ['Diff unavailable: the previous body was truncated'] });
    // The same for a cut body that is not JSON: never a diff against its prefix.
    await select(page, 'cuttext-b', '/cuttext');
    await waitFor(page, () => /Diff unavailable: the previous body was truncated/.test(window.nv.content()));
    assert.equal(await evaluate(page, () => window.nv.all('.xray-request-detail .xray-diff-line').length), 0);
    // No earlier call: Copy says so, as the view does.
    await select(page, 'floats');
    await waitFor(page, () => /No previous matching response/.test(window.nv.content()));
    assert.deepEqual(JSON.parse(await copy(page)), { differences: [], notices: ['No previous matching response'] });
  });

  test(`Visualize shows -0 and 5e-324 as written (${surface})`, async t => {
    const page = await open(t, fixture);
    await select(page, 'floats');
    await view(page, 'Visualize');
    await waitFor(page, () => window.nv.viz().bars.length === 3);
    assert.deepEqual(await evaluate(page, () => window.nv.viz()), { title: '3 numeric fields', bars: [['negz', '-0'], ['tiny', '5e-324'], ['one', '1']] });
  });

  test(`search finds pretty spacing, the compact form and the exact digits of the captured text (${surface})`, async t => {
    const page = await open(t, fixture);
    await evaluate(page, () => window.nv.openSearch());
    for (const query of ['"a": 1', '"a":1', '9007199254740993']) {
      await evaluate(page, () => window.nv.q('[aria-label="Search captured traffic"]').select());
      await page.keyboard.type(query);
      await waitFor(page, () => window.nv.search().some(([path]) => path.startsWith('/pretty')));
      const row = (await evaluate(page, () => window.nv.search())).find(([path]) => path.startsWith('/pretty'));
      assert.equal(row[0], '/prettyResponse body', query);
      assert.ok(row[1].includes(query), `snippet shows "${query}": ${row[1]}`);
    }
    // The rounded digits are only in the body that really has them (diff-a), never in /pretty.
    await evaluate(page, () => window.nv.q('[aria-label="Search captured traffic"]').select());
    await page.keyboard.type('9007199254740992');
    await waitFor(page, () => window.nv.search().some(([path]) => path.startsWith('/diff')));
    assert.deepEqual((await evaluate(page, () => window.nv.search())).map(([path]) => path), ['/diffResponse body']);
  });

  test(`a DevTools worker changes nothing: same Table, Schema and Diff, never asked (${surface})`, async t => {
    const page = await open(t, fixture, { worker: true });
    await select(page, 'envelope');
    await view(page, 'Table');
    await waitFor(page, () => window.nv.table().rows.length > 0);
    assert.deepEqual((await evaluate(page, () => window.nv.table())).rows, [['9007199254740993', 'a'], ['2', 'b']]);
    await view(page, 'Schema');
    await waitFor(page, () => window.nv.content().includes('"errors"'));
    assert.doesNotMatch(await evaluate(page, () => window.nv.content()), /stale-worker/);
    await select(page, 'diff-b', '/diff');
    await view(page, 'Diff');
    await waitFor(page, () => window.nv.diff().lines.length > 0);
    assert.deepEqual((await evaluate(page, () => window.nv.diff())).lines, [['changed', 'id', '9007199254740992', '9007199254740993']]);
    await page.waitForTimeout(100);
    assert.equal(await evaluate(page, () => window.nv.workerCalls), 0, 'the panel never asks the worker for a table, schema or diff');
  });
}
