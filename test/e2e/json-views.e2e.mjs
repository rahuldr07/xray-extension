import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { before, after } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { PANEL_CSS } from '../helpers/panel-css.mjs';
import { setStandardsContent } from '../helpers/standards-page.mjs';

// API detail Raw and Tree views (spec §2 J2, J3 tree, J13; plan Task 5) on the real App, store and
// stylesheet, in the document and in a closed shadow root. Raw is the captured text verbatim (Pretty
// prints it losslessly, Copy copies what is shown, invalid JSON is marked); Tree renders the lossless
// parser's nodes (lexemes, source order, duplicate keys), windowed, with a bounded Expand all; bidi
// controls are shown as escapes; truncated bodies say so and never pose as complete JSON. Only
// persistence and the clipboard are stubbed.
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

      // The audit's 5 MB generator (output/json-audit/fixtures.mjs.txt), verbatim.
      function hugeArrayBytes(targetBytes) {
        const items = [];
        let size = 2;
        for (let i = 0; size < targetBytes; i++) {
          const item = { id: i, name: 'item-' + i, note: 'lorem ipsum dolor sit amet '.repeat(3) };
          const text = JSON.stringify(item);
          items.push(text);
          size += text.length + 1;
        }
        return '[' + items.join(',') + ']';
      }
      const RLO = String.fromCharCode(0x202e);
      const prefix = '[' + '{"id":12345,"v":"abcdefghij"},'.repeat(10000).slice(0, 249999);
      const FIX = {
        keyorder: '{"b":1,"a":2,"10":3,"2":4,"-1":5}',
        dupkeys: '{"a":1,"a":2}',
        floats: '{"a": 0.1, "big": 1e400, "negz": -0, "one": 1.0, "e5": 1E5, "tiny": 5e-324}',
        bigint: '{"id": 9007199254740993, "n": 12345678901234567890, "neg": -9007199254740993}',
        rtl: '{"escaped":"abc \\\\u202eRTL","literal":"def ' + RLO + 'LIT","k' + RLO + '":1}',
        invalid: '{"a": 1, "b": }',
        ndjson: '{"a":1}\\n{"a":2}\\n{"a":3}\\n',
        deep: '['.repeat(2000) + ']'.repeat(2000),
        truncated: prefix,
        legacy: prefix + '\\n... truncated 688891 chars',
      };
      const now = Date.now();
      let order = 0;
      const api = (id, responseRaw, extra) => ({ id, type: 'api', method: 'GET', status: 200,
        url: 'https://example.test/' + id, urlPath: '/' + id, source: 'fetch', timestamp: now - 100000 + (order++) * 10,
        duration: 12, size: typeof responseRaw === 'string' ? responseRaw.length : 0,
        responseHeaders: { 'content-type': 'application/json' }, responseRaw, ...extra });
      const post = (id, fields) => api(id, '{"ok":true}', { method: 'POST', requestHeaders: { 'content-type': 'application/json' }, ...fields });

      window.jv = {
        root: null, copied: [], tasks: [], observer: null, FIX,
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
          Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (text) => { self.copied.push(text); } } });
          const entries = [
            api('keyorder', FIX.keyorder), api('dupkeys', FIX.dupkeys), api('floats', FIX.floats), api('bigint', FIX.bigint),
            api('rtl', FIX.rtl), api('invalid', FIX.invalid), api('deep', FIX.deep),
            api('ndjson', FIX.ndjson, { responseHeaders: { 'content-type': 'application/x-ndjson' } }),
            api('truncated', FIX.truncated, { responseTruncated: { totalChars: 938891, keptChars: 250000 } }),
            // An imported file may predate J6 and has no version; only imported data is read for the
            // old in-band suffix (a saved session is migrated by its schema version, spec J9).
            api('legacy', FIX.legacy, { imported: true }),
            post('req-text', { requestBodyKind: 'text', requestBodyText: '{"id": 9007199254740993, "b":1, "a":2}', requestBody: { id: 9007199254740992, b: 1, a: 2 } }),
            post('req-null', { requestBodyKind: 'text', requestBodyText: 'null', requestBody: null }),
            post('req-form', { requestBodyKind: 'formdata', requestBodyText: 'a=1\\nf=[file "x.png", image/png, 4 bytes]\\na=2',
              requestBody: [['a', '1'], ['f', { file: 'x.png', size: 4, type: 'image/png' }], ['a', '2']] }),
            post('req-urlenc', { requestBodyKind: 'urlencoded', requestBodyText: 'q=a+b&q=c', requestBody: 'q=a+b&q=c' }),
            post('req-binary', { requestBodyKind: 'binary', requestBody: { binary: true, size: 2048, base64Prefix: 'iVBORw0KGgo=' } }),
            api('degraded', '{"partial":true}', { captureDegraded: true }),
            // Spec J16: a text frame past 2,000 chars keeps its first 2,000, the cut as metadata.
            api('socket', '', { source: 'ws', url: 'wss://example.test/socket', wsState: 'open', responseHeaders: {}, wsFrames: [
              { dir: 'in', ts: now - 2000, preview: '{"seq":1,"id":9007199254740993}', size: 31 },
              { dir: 'in', ts: now - 1000, preview: 'w'.repeat(2000), size: 2518, truncated: { totalChars: 2518, keptChars: 2000 } },
            ] }),
          ];
          usePanelStore.setState({ open: true, activeTab: 'api', consoleMiniTab: 'console', selectedId: null, expandedId: null,
            entries, consoleEvents: [], recording: true, detailTab: 'response', detailView: 'tree',
            settings: { ...usePanelStore.getState().settings, panelWidth: width, firstRunDismissed: true } });
          installPanelKeyboard({ dismissible: false, getRoot: () => this.root });
          flushSync(() => createRoot(mount).render(<App mode={mode} />));
        },
        addBig() {
          const body = hugeArrayBytes(5 * 1024 * 1024);
          this.bigBody = body;
          flushSync(() => usePanelStore.setState({ entries: [...usePanelStore.getState().entries, api('big', body)] }));
          return body.length;
        },
        // Idle callbacks queue until released, so a big body stays "Parsing…" for as long as a test needs.
        holdIdle() {
          this.idle = [];
          this.nativeIdle = [window.requestIdleCallback, window.cancelIdleCallback];
          window.requestIdleCallback = (task) => { this.idle.push(task); return this.idle.length; };
          window.cancelIdleCallback = (id) => { this.idle[id - 1] = null; };
        },
        releaseIdle() {
          [window.requestIdleCallback, window.cancelIdleCallback] = this.nativeIdle;
          // The held tasks run now; any task they queue goes to the real requestIdleCallback.
          for (let i = 0; i < this.idle.length; i++) {
            const task = this.idle[i];
            this.idle[i] = null;
            if (task) task({ didTimeout: false, timeRemaining: () => 50 });
          }
        },
        select(id) { flushSync(() => usePanelStore.getState().selectEntry(id)); },
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
        // Raw: the shown rows in order; a row continuing a long line joins without a newline.
        rawText() {
          const rows = this.all('.xray-raw [data-raw-row]').sort((a, b) => Number(a.dataset.rawRow) - Number(b.dataset.rawRow));
          return rows.map((row, i) => (i > 0 && row.hasAttribute('data-cont') ? '' : (i > 0 ? '\\n' : '')) + row.querySelector('.xray-json-line-text').textContent).join('');
        },
        treeRows() {
          return this.all('.xray-request-detail [role="tree"] [role="treeitem"]').map((row) => ({
            level: Number(row.getAttribute('aria-level')),
            key: row.querySelector('.xray-json-key')?.textContent ?? null,
            value: row.querySelector('.xray-json-value')?.textContent ?? null,
            tags: [...row.querySelectorAll('.xray-json-tag')].map((tag) => tag.textContent),
            expanded: row.getAttribute('aria-expanded'),
          }));
        },
        startTasks() {
          this.tasks = [];
          this.observer = new PerformanceObserver((list) => { for (const entry of list.getEntries()) this.tasks.push(Math.round(entry.duration)); });
          this.observer.observe({ type: 'longtask' });
        },
        stopTasks() { this.observer?.disconnect(); return this.tasks; },
        active() { const a = this.root.activeElement; return a ? { level: a.getAttribute('aria-level'), text: a.textContent } : null; },
        toast() { return usePanelStore.getState().toastMessage; },
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

async function open(t, fixture, width = 1400) {
  const page = await browser.newPage({ viewport: { width, height: 800 } });
  t.after(() => page.close());
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  t.after(() => assert.deepEqual(errors, [], 'no error may escape to the page'));
  await setStandardsContent(page, '<style>body{margin:0;min-height:100vh}</style>');
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(args => window.jv.setup(args.shadow, args.mode, args.width), { ...fixture, width });
  await page.waitForFunction(() => window.jv.has('[aria-label="Captured requests"]'));
  return page;
}

async function click(page, selector, label) {
  const box = await page.evaluate(([s, l]) => window.jv.box(s, l), [selector, label ?? null]);
  assert.ok(box, `no element for ${selector}${label ? ` labelled "${label}"` : ''}`);
  assert.ok(box.width > 0 && box.height > 0, `${selector} is not visible`);
  await page.mouse.click(box.x, box.y);
}

const evaluate = (page, fn, arg) => page.evaluate(fn, arg);
const waitFor = (page, fn, arg, timeout = 5000) => page.waitForFunction(fn, arg, { timeout });

async function select(page, id) {
  await evaluate(page, value => window.jv.select(value), id);
  await waitFor(page, value => (window.jv.text('.xray-request-detail h3') || '') === '/' + value, id);
}

// Selecting a view is idempotent, so a second click tells a lost click (the next one works) from a
// view that never selects (none does). Both fail the test: a lost click is a bug to find, not to mask
// with a quiet retry (final fix M8; Task 6 saw none in 204 clicks).
async function view(page, name) {
  for (let attempt = 1; ; attempt++) {
    await click(page, '[aria-label="Body views"] button', name);
    try {
      await waitFor(page, value => window.jv.q('[aria-label="Body views"] [aria-pressed="true"]')?.textContent === value, name, 2500);
    } catch (error) {
      if (attempt === 3) throw error;
      continue;
    }
    assert.equal(attempt, 1, `the ${name} view needed ${attempt} clicks: a click was lost`);
    return;
  }
}

async function facet(page, name) {
  await click(page, '.xray-request-detail .xray-detail-tab', name);
}

const rawText = page => evaluate(page, () => window.jv.rawText());
const treeRows = page => evaluate(page, () => window.jv.treeRows());
const rows = page => waitFor(page, () => window.jv.all('.xray-request-detail [role="treeitem"]').length > 0);
const raw = page => waitFor(page, () => window.jv.all('.xray-raw [data-raw-row]').length > 0);
const copied = page => evaluate(page, () => window.jv.copied.at(-1) ?? null);

// Long clipboard texts are compared by length and their first 60 characters, so a failure stays readable.
const summary = text => (typeof text === 'string' ? `${text.length}:${text.slice(0, 60)}` : String(text));
async function copiedHead(page) {
  const before = await evaluate(page, () => window.jv.copied.length);
  await click(page, '.xray-detail-actions button', 'Copy');
  await waitFor(page, count => window.jv.copied.length > count, before);
  return summary(await copied(page));
}
const headOf = async (page, id) => summary(await evaluate(page, key => window.jv.FIX[key], id));

async function copy(page) {
  const before = await evaluate(page, () => window.jv.copied.length);
  await click(page, '.xray-detail-actions button', 'Copy');
  await waitFor(page, count => window.jv.copied.length > count, before);
  return copied(page);
}

for (const fixture of [
  { shadow: false, mode: 'window', label: 'document' },
  { shadow: true, mode: 'hud', label: 'closed shadow' },
]) {
  const surface = fixture.label;

  test(`Raw shows the captured text verbatim; Copy copies it; Pretty prints it losslessly (${surface})`, async t => {
    const page = await open(t, fixture);
    const FIX = await evaluate(page, () => window.jv.FIX);
    await select(page, 'keyorder');
    await view(page, 'Raw');
    for (const id of ['keyorder', 'dupkeys', 'floats']) {
      await select(page, id);
      await raw(page);
      assert.equal(await rawText(page), FIX[id], `${id}: Raw is the captured text`);
    }
    assert.equal(await copy(page), FIX.floats, 'Copy copies the captured text');
    await click(page, '.xray-raw-toolbar button', 'Pretty');
    const pretty = '{\n  "a": 0.1,\n  "big": 1e400,\n  "negz": -0,\n  "one": 1.0,\n  "e5": 1E5,\n  "tiny": 5e-324\n}';
    await waitFor(page, text => window.jv.rawText() === text, pretty);
    assert.equal(await copy(page), pretty, 'Copy copies the pretty text while Pretty is on');
    await select(page, 'dupkeys');
    await waitFor(page, () => window.jv.rawText() === '{\n  "a": 1,\n  "a": 2\n}');
  });

  test(`Tree renders the parser's nodes: exact digits, source order, duplicate keys, lexemes (${surface})`, async t => {
    const page = await open(t, fixture);
    await select(page, 'bigint');
    await rows(page);
    const big = await treeRows(page);
    const byKey = Object.fromEntries(big.filter(row => row.key).map(row => [row.key, row]));
    assert.equal(byKey['"id"'].value, '9007199254740993');
    assert.deepEqual(byKey['"id"'].tags, ['inexact in JS']);
    assert.equal(byKey['"n"'].value, '12345678901234567890');
    assert.equal(byKey['"neg"'].value, '-9007199254740993');

    await select(page, 'keyorder');
    await waitFor(page, () => window.jv.treeRows().some(row => row.key === '"-1"'));
    assert.deepEqual((await treeRows(page)).filter(row => row.key).map(row => row.key), ['"b"', '"a"', '"10"', '"2"', '"-1"']);

    await select(page, 'dupkeys');
    await waitFor(page, () => window.jv.treeRows().filter(row => row.key === '"a"').length === 2);
    assert.deepEqual((await treeRows(page)).filter(row => row.key).map(row => [row.key, row.value, row.tags]),
      [['"a"', '1', []], ['"a"', '2', ['duplicate']]]);

    await select(page, 'floats');
    await waitFor(page, () => window.jv.treeRows().some(row => row.key === '"tiny"'));
    const floats = Object.fromEntries((await treeRows(page)).filter(row => row.key).map(row => [row.key, [row.value, row.tags]]));
    assert.deepEqual(floats, {
      '"a"': ['0.1', []], '"big"': ['1e400', ['inexact in JS']], '"negz"': ['-0', ['inexact in JS']],
      '"one"': ['1.0', []], '"e5"': ['1E5', []], '"tiny"': ['5e-324', []],
    });

    await select(page, 'ndjson');
    await waitFor(page, () => window.jv.treeRows().length >= 4);
    assert.match(await evaluate(page, () => window.jv.text('.xray-request-detail .xray-json-tree')), /NDJSON · 3 documents/);
  });

  test(`2,000-deep Expand all stays responsive and reaches the innermost level (${surface})`, async t => {
    const page = await open(t, fixture);
    await select(page, 'deep');
    await rows(page);
    assert.equal(Math.max(...(await treeRows(page)).map(row => row.level)), 5, 'four levels open by default');
    await evaluate(page, () => window.jv.startTasks());
    const started = Date.now();
    await click(page, '.xray-request-detail .xray-json-tree-btn', 'Expand all');
    await waitFor(page, () => window.jv.treeRows().length > 20 && window.jv.treeRows().every(row => row.expanded !== 'false'));
    // Keyboard: End moves to the last row, the innermost [] at level 2,000, scrolling it into view.
    await evaluate(page, () => window.jv.q('.xray-request-detail [role="treeitem"][tabindex="0"]').focus());
    await page.keyboard.press('End');
    await waitFor(page, () => window.jv.active()?.level === '2000');
    const elapsed = Date.now() - started;
    const tasks = await evaluate(page, () => window.jv.stopTasks());
    t.diagnostic(`Expand all + End: ${elapsed} ms; long tasks: [${tasks.join(', ')}] ms`);
    assert.ok(elapsed < 3000, `Expand all and End took ${elapsed} ms`);
    assert.ok(Math.max(0, ...tasks) < 200, `long tasks: ${tasks.join(', ')} ms`);
    assert.ok((await evaluate(page, () => window.jv.all('.xray-request-detail [role="treeitem"]').length)) < 400, 'rows are windowed');
  });

  test(`a 5 MB body stays responsive: Tree, Expand all, Raw and Pretty without a long task over 200 ms (${surface})`, async t => {
    const page = await open(t, fixture);
    const length = await evaluate(page, () => window.jv.addBig());
    assert.ok(length > 5_000_000);
    await evaluate(page, () => window.jv.startTasks());
    await evaluate(page, () => window.jv.select('big'));
    await waitFor(page, () => window.jv.treeRows().some(row => row.key === '"note"'), null, 15000);
    await click(page, '.xray-request-detail .xray-json-tree-btn', 'Expand all');
    // Windowed: the "Show 100 more" row after the first 100 items mounts once scrolled to.
    await evaluate(page, () => { const scroller = window.jv.q('.xray-request-detail .xray-json-vscroll'); scroller.scrollTop = scroller.scrollHeight; });
    await waitFor(page, () => window.jv.has('.xray-request-detail .xray-json-more-row'));
    await view(page, 'Raw');
    await raw(page);
    await click(page, '.xray-raw-toolbar button', 'Pretty');
    await waitFor(page, () => window.jv.rawText().startsWith('[\n  {\n    "id": 0,'), null, 15000);
    const tasks = await evaluate(page, () => window.jv.stopTasks());
    t.diagnostic(`5 MB select → Tree → Expand all → Raw → Pretty: long tasks [${tasks.join(', ')}] ms`);
    assert.ok(Math.max(0, ...tasks) < 200, `long tasks: ${tasks.join(', ')} ms`);
    assert.ok((await evaluate(page, () => window.jv.all('.xray-raw [data-raw-row]').length)) < 400, 'Raw rows are windowed');
  });

  test(`bidi controls show as visible escapes in Tree, Raw and Table (${surface})`, async t => {
    const page = await open(t, fixture);
    const RLO = String.fromCharCode(0x202e);
    await select(page, 'rtl');
    await rows(page);
    const tree = await evaluate(page, () => window.jv.text('.xray-request-detail [role="tree"]'));
    assert.ok(!tree.includes(RLO), 'no raw U+202E in the Tree');
    assert.match(tree, /"abc \\u202ERTL"/);
    assert.match(tree, /"def \\u202ELIT"/);
    assert.match(tree, /"k\\u202E"/);
    assert.ok(await evaluate(page, () => window.jv.all('.xray-request-detail [role="tree"] .xray-bidi').length >= 3));
    await view(page, 'Raw');
    await raw(page);
    const rawShown = await evaluate(page, () => window.jv.text('.xray-raw'));
    assert.ok(!rawShown.includes(RLO), 'no raw U+202E in Raw');
    assert.ok(await evaluate(page, () => window.jv.all('.xray-raw .xray-bidi').length >= 2));
    assert.equal(await copy(page), await evaluate(page, () => window.jv.FIX.rtl), 'Copy still copies the exact text');
    await view(page, 'Table');
    await waitFor(page, () => window.jv.has('.xray-request-detail .xray-table'));
    const table = await evaluate(page, () => window.jv.text('.xray-request-detail .xray-table'));
    assert.ok(!table.includes(RLO), 'no raw U+202E in Table');
    assert.match(table, /\\u202E/);
    // Search results: the snippet around the match shows the escape too.
    await evaluate(page, () => window.jv.openSearch());
    await page.keyboard.type('LIT');
    await waitFor(page, () => window.jv.all('.xray-gsearch-snippet').some(el => el.textContent.includes('LIT')));
    const snippets = await evaluate(page, () => window.jv.all('.xray-gsearch-snippet').map(el => el.textContent).join('\n'));
    assert.ok(!snippets.includes(RLO), 'no raw U+202E in search results');
    assert.match(snippets, /def \\u202ELIT/);
  });

  test(`truncated bodies show the banner; Tree and Table are unavailable; Raw shows the prefix (${surface})`, async t => {
    const page = await open(t, fixture);
    const BANNER = 'Response truncated: showing the first 250,000 of 938,891 characters';
    for (const id of ['truncated', 'legacy']) {
      await select(page, id);
      await view(page, 'Tree');
      await waitFor(page, text => (window.jv.text('.xray-request-detail .xray-detail-content') || '').includes(text), BANNER);
      assert.equal(await evaluate(page, () => window.jv.all('.xray-request-detail [role="treeitem"]').length), 0, `${id}: no tree for a cut body`);
      assert.match(await evaluate(page, () => window.jv.text('.xray-request-detail .xray-detail-content')), /Tree unavailable/);
      await view(page, 'Table');
      assert.match(await evaluate(page, () => window.jv.text('.xray-request-detail .xray-detail-content')), /Table unavailable/);
      assert.equal(await copiedHead(page), await headOf(page, 'truncated'), `${id}: Copy in an unavailable Table copies the captured text`);
      await view(page, 'Schema');
      const schema = await evaluate(page, () => window.jv.text('.xray-request-detail .xray-detail-content'));
      assert.match(schema, /Schema unavailable/);
      assert.ok(!/"string"/.test(schema), 'never a fake "string" schema');
      assert.equal(await copiedHead(page), await headOf(page, 'truncated'), `${id}: Copy in an unavailable Schema copies the captured text, not "string"`);
      assert.match(await evaluate(page, () => window.jv.toast()), /truncated: the first 250,000 characters/);
      await view(page, 'Raw');
      await raw(page);
      assert.ok((await evaluate(page, () => window.jv.text('.xray-request-detail .xray-detail-content'))).includes(BANNER));
      const prefix = await evaluate(page, () => window.jv.FIX.truncated);
      assert.equal(await copy(page), prefix, `${id}: Copy copies the captured prefix, no suffix`);
    }
    // A degraded capture says so above the body.
    await select(page, 'degraded');
    await waitFor(page, () => /could not be captured/.test(window.jv.text('.xray-request-detail .xray-detail-content') || ''));
  });

  test(`Copy while a big body is parsing copies the captured text, in every view (${surface})`, async t => {
    const page = await open(t, fixture);
    await evaluate(page, () => window.jv.addBig());
    await evaluate(page, () => window.jv.holdIdle());
    await evaluate(page, () => window.jv.select('big'));
    await waitFor(page, () => /Parsing/.test(window.jv.text('.xray-request-detail .xray-detail-content') || ''));
    for (const name of ['Schema', 'Table', 'Diff', 'Visualize', 'Tree']) {
      await view(page, name);
      assert.match(await evaluate(page, () => window.jv.text('.xray-request-detail .xray-detail-content')), /Parsing/, `${name} waits for the parse`);
      const head = await copiedHead(page);
      assert.equal(head, summary(await evaluate(page, () => window.jv.bigBody)), `${name}: Copy gives the captured text, not undefined or []`);
    }
    await evaluate(page, () => window.jv.releaseIdle());
    await waitFor(page, () => window.jv.treeRows().some(row => row.key === '"note"'), null, 15000);
  });

  test(`request facet: requestBodyText verbatim, a "null" body, FormData, URL-encoded and binary bodies (${surface})`, async t => {
    const page = await open(t, fixture);
    await select(page, 'req-text');
    await facet(page, 'Request');
    await rows(page);
    const text = Object.fromEntries((await treeRows(page)).filter(row => row.key).map(row => [row.key, row.value]));
    assert.deepEqual(text, { '"id"': '9007199254740993', '"b"': '1', '"a"': '2' });
    await view(page, 'Raw');
    await raw(page);
    assert.equal(await rawText(page), '{"id": 9007199254740993, "b":1, "a":2}');
    await view(page, 'Tree');

    await select(page, 'req-null');
    await rows(page);
    assert.deepEqual((await treeRows(page)).map(row => row.value), ['null']);
    assert.ok(!(await evaluate(page, () => window.jv.text('.xray-request-detail .xray-detail-content'))).includes('No request body captured'));

    await select(page, 'req-form');
    await waitFor(page, () => window.jv.treeRows().some(row => row.key === '"f"'));
    const form = (await treeRows(page)).filter(row => row.key && row.level === 2).map(row => [row.key, row.value, row.tags]);
    assert.deepEqual(form.map(([key]) => key), ['"a"', '"f"', '"a"']);
    assert.deepEqual(form[2][2], ['duplicate']);
    assert.match(await evaluate(page, () => window.jv.text('.xray-request-detail .xray-detail-content')), /FormData/);

    await select(page, 'req-urlenc');
    await waitFor(page, () => window.jv.treeRows().filter(row => row.key === '"q"').length === 2);
    assert.deepEqual((await treeRows(page)).filter(row => row.key).map(row => [row.key, row.value]), [['"q"', '"a b"'], ['"q"', '"c"']]);

    await select(page, 'req-binary');
    await waitFor(page, () => /Binary body/.test(window.jv.text('.xray-request-detail .xray-detail-content') || ''));
    assert.match(await evaluate(page, () => window.jv.text('.xray-request-detail .xray-detail-content')), /2,048 bytes/);
  });

  test(`Frames: a frame cut at capture says how much was kept; a whole frame does not (${surface})`, async t => {
    const page = await open(t, fixture);
    await select(page, 'socket');
    await facet(page, 'Frames');
    await waitFor(page, () => window.jv.all('.xray-frame-row').length === 2);
    const frames = await evaluate(page, () => window.jv.all('.xray-frame-row').map((row) => ({
      preview: row.querySelector('.xray-frame-preview')?.textContent ?? null,
      cut: row.querySelector('.xray-frame-cut')?.textContent ?? null,
    })));
    // Newest first.
    assert.deepEqual(frames.map((frame) => frame.cut), ['first 2,000 of 2,518 characters', null]);
    assert.equal(frames[0].preview, 'w'.repeat(2000), 'the kept characters, nothing added in-band');
    assert.equal(frames[1].preview, '{"seq":1,"id":9007199254740993}');
  });

  test(`invalid JSON: Raw marks the error at its line and column; Pretty is unavailable (${surface})`, async t => {
    const page = await open(t, fixture);
    await select(page, 'invalid');
    await waitFor(page, () => /Unexpected token \} at line 1, col 15/.test(window.jv.text('.xray-request-detail .xray-detail-content') || ''));
    await view(page, 'Raw');
    await raw(page);
    assert.equal(await rawText(page), '{"a": 1, "b": }');
    assert.match(await evaluate(page, () => window.jv.text('.xray-raw-toolbar')), /Unexpected token \} at line 1, col 15/);
    assert.equal(await evaluate(page, () => window.jv.text('.xray-raw mark.xray-raw-mark')), '}');
    assert.equal(await evaluate(page, () => window.jv.all('.xray-raw-toolbar button').find(b => b.textContent.includes('Pretty'))?.disabled), true);
  });
}
