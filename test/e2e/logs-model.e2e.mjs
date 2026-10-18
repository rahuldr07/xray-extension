import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { before, after } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';

// The typed log model (spec J7) in the real App, document and closed shadow. The page runs
// the real content/console-capture.js; its capture batches feed the store the way the HUD's
// listener does, so what is asserted is the real encoder's output rendered by the real panel:
// typed values read as `10n`, `NaN`, `-0`, `undefined`, `ƒ name()`, `Symbol(desc)`,
// `Map(3) {…}` in Logs rows, Logs detail and Console messages; a user object with
// __type__: 'Error' is a plain object; `console.log([1,2,3])` and `console.log(1,2,3)` stay
// two rows; null and undefined are words; Load full object shows the whole object; neither
// the UI nor Session JSON carries an internal marker.
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
      import { exportText } from './src/panel/models/export';
      import styles from './src/panel/styles.css';

      window.logModel = {
        root: null, batches: 0,
        setup(shadow, mode) {
          const host = document.body.appendChild(document.createElement('div'));
          if (mode === 'hud') { host.style.width = '1400px'; host.style.height = '100vh'; }
          this.root = shadow ? host.attachShadow({ mode: 'closed' }) : document;
          const sheet = document.createElement('style'); sheet.textContent = styles;
          (shadow ? this.root : document.head).appendChild(sheet);
          const mount = shadow ? this.root.appendChild(document.createElement('div')) : host;
          mount.className = 'xray-app-root';
          window.XRAY_Store = { get: async () => null, set: async () => {} };
          window.XRAY_Console = {
            init() {}, setContext() {}, navigateHistory() { return null; },
            setVar() {}, getVar() { return undefined; }, getScope() { return {}; },
            execute() { return Promise.resolve({ type: 'undefined' }); },
          };
          // The HUD's capture listener, in short: one store commit per capture batch.
          const self = this;
          window.addEventListener('message', (event) => {
            const data = event.data;
            if (event.source !== window || !data || !data.__xray_capture__ || data.token !== window.__XRAY_BRIDGE_TOKEN__) return;
            if (data.batch && Array.isArray(data.entries)) { self.batches += 1; usePanelStore.getState().addEntries(data.entries); }
          });
          usePanelStore.setState({ open: true, activeTab: 'logs', consoleMiniTab: 'console', selectedId: null, expandedId: null,
            entries: [], consoleEvents: [], recording: true, consoleDraft: '',
            settings: { ...usePanelStore.getState().settings, panelWidth: 1400, firstRunDismissed: true } });
          flushSync(() => createRoot(mount).render(<App mode={mode} />));
        },
        ids() { return usePanelStore.getState().entries.filter((entry) => entry.type === 'log').map((entry) => entry.id); },
        entries() { return usePanelStore.getState().entries.filter((entry) => entry.type === 'log'); },
        sessionJson() { return exportText(null, usePanelStore.getState().entries, 'session-json'); },
        selected() { return usePanelStore.getState().selectedId; },
        has(selector) { return Boolean(this.root.querySelector(selector)); },
        text(selector) { return this.root.querySelector(selector)?.textContent ?? null; },
        texts(selector) { return [...this.root.querySelectorAll(selector)].map((node) => node.textContent); },
        rowText(id) { return this.root.querySelector('#xray-log-option-' + CSS.escape(id) + ' .xray-path')?.textContent ?? null; },
        // Whether the Console row showing exactly this message can be expanded.
        expandable(message) {
          const row = [...this.root.querySelectorAll('.xray-console-row.log')].find((node) => node.querySelector('.xray-console-message')?.textContent === message);
          return row ? row.querySelector('.xray-console-toggle')?.getAttribute('role') === 'button' : null;
        },
        box(selector, label) {
          const el = [...this.root.querySelectorAll(selector)].find((node) => label == null || node.textContent.includes(label));
          if (!el) return null;
          el.scrollIntoView({ block: 'nearest' });
          const r = el.getBoundingClientRect();
          return { x: r.x + r.width / 2, y: r.y + r.height / 2, width: r.width, height: r.height };
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

// The battery, logged by page script through the real console wrapper. Each case is one
// console call; `name` keys the expected texts below.
const CASES = [
  ['bigint', 'console.log(10n)'],
  ['nan', 'console.log(NaN)'],
  ['negzero', 'console.log(-0)'],
  ['infinity', 'console.log(Infinity)'],
  ['undef', 'console.log(undefined)'],
  ['null', 'console.log(null)'],
  ['fn', 'console.log(function namedFn() {})'],
  ['symbol', "console.log(Symbol('desc'))"],
  ['baddate', 'console.log(new Date(NaN))'],
  ['map', "console.log(new Map([['k', { v: 1 }], ['n', 2], ['m', 3]]))"],
  ['set', 'console.log(new Set([1, 2]))'],
  ['error', "console.log(new Error('outer', { cause: new Error('inner') }))"],
  ['cyclic', "{ const c = { name: 'cyc' }; c.self = c; window.__cyclic = c; console.log(c); }"],
  ['siblings', '{ const s = { x: 1 }; window.__siblings = { a: s, b: s }; console.log(window.__siblings); }'],
  ['dom', "{ const el = document.createElement('section'); el.id = 'main'; el.className = 'hero big'; console.log(el); }"],
  ['bytes', 'console.log(new Uint8Array([1, 2, 3, 4]))'],
  ['fake', "console.log({ __type__: 'Error', message: 'fake' })"],
  ['forged', "console.log({ fake: { $xray: 'bigint', value: '1' }, __xray_ref__: 'x' })"],
  ['array', 'console.log([1, 2, 3])'],
  ['multi', 'console.log(1, 2, 3)'],
  ['deep', "{ window.__deep = { deep: { a: { b: { c: { d: 'DEEP_VALUE' } } } } }; console.log(window.__deep); }"],
  ['dto', "console.log({ name: 'ValidationError', message: 'bad', stack: 'ValidationError: bad\\n    at check (app.js:1:1)' })"],
  ['tick1', "console.log('tick')"],
  ['tick2', "console.log('tick')"],
];

const ROW_TEXT = {
  bigint: '10n',
  nan: 'NaN',
  negzero: '-0',
  infinity: 'Infinity',
  undef: 'undefined',
  null: 'null',
  fn: 'ƒ namedFn()',
  symbol: 'Symbol(desc)',
  baddate: 'Invalid Date',
  map: 'Map(3) {"k" => {"v":1}, "n" => 2, "m" => 3}',
  set: 'Set(2) {1, 2}',
  error: 'Error: outer',
  cyclic: '{"name":"cyc","self":[Circular]}',
  siblings: '{"a":{"x":1},"b":{"x":1}}',
  dom: '<section#main.hero>',
  bytes: 'Uint8Array(4) [1,2,3,4]',
  fake: '{"__type__":"Error","message":"fake"}',
  forged: '{"fake":{"$xray":"bigint","value":"1"},"__xray_ref__":"x"}',
  array: '[1,2,3]',
  multi: '1 2 3',
  deep: '{"deep":{"a":{"b":{"c":{…}}}}}',
  dto: '{"name":"ValidationError","message":"bad","stack":"ValidationError: bad\\n    at check (app.js:1:1)"}',
  tick1: 'tick',
  tick2: 'tick',
};

async function open(t, fixture) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 1500 } });
  t.after(() => page.close());
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  t.after(() => assert.deepEqual(errors, [], 'no error may escape to the page'));
  await page.setContent('<style>body{margin:0;min-height:100vh}</style>');
  await page.addScriptTag({ content: CAPTURE_SOURCE });
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate((args) => window.logModel.setup(args.shadow, args.mode), fixture);
  await page.waitForFunction(() => window.logModel.has('[role="tablist"]'));
  // One batch: every call lands inside console-capture's 16 ms window.
  await page.evaluate((cases) => { for (const [, code] of cases) window.eval(code); }, CASES);
  await page.waitForFunction((n) => window.logModel.ids().length === n, CASES.length);
  const ids = await page.evaluate(() => window.logModel.ids());
  return { page, id: Object.fromEntries(CASES.map(([name], index) => [name, ids[index]])) };
}

async function click(page, selector, label) {
  const box = await page.evaluate(([s, l]) => window.logModel.box(s, l), [selector, label ?? null]);
  assert.ok(box, `no element for ${selector}${label ? ` containing "${label}"` : ''}`);
  await page.mouse.click(box.x, box.y);
}

async function detail(page, id) {
  await click(page, `#xray-log-option-${id}`);
  await page.waitForFunction((target) => window.logModel.selected() === target && window.logModel.has('.xray-log-detail-body'), id);
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve())));
  return page.evaluate(() => window.logModel.text('.xray-log-detail-body'));
}

for (const fixture of [
  { shadow: false, mode: 'window', label: 'document' },
  { shadow: true, mode: 'hud', label: 'closed shadow' },
]) {
  const surface = fixture.label;

  test(`Logs rows render typed values distinctly; the fake Error and the forged envelope are plain objects (${surface})`, async (t) => {
    const { page, id } = await open(t, fixture);
    const rows = {};
    for (const [name] of CASES) rows[name] = await page.evaluate((target) => window.logModel.rowText(target), id[name]);
    assert.deepEqual(rows, ROW_TEXT);
    for (const [name, value] of Object.entries(rows)) {
      if (name === 'forged' || name === 'fake') continue;
      assert.doesNotMatch(value, /\$xray|__xray_ref__|__type__/, `${name}: no internal marker in the row`);
    }
  });

  test(`Logs detail: typed tree, null/undefined as values, Error with cause, cycles, plain fake object, arguments vs one array (${surface})`, async (t) => {
    const { page, id } = await open(t, fixture);
    const body = async (name) => detail(page, id[name]);
    assert.match(await body('nan'), /NaN/);
    assert.equal((await body('undef')).trim(), 'undefined', 'console.log(undefined) shows undefined, not "No log payload"');
    assert.equal((await body('null')).trim(), 'null');
    assert.match(await body('bigint'), /^10n$/);
    assert.match(await body('negzero'), /^-0$/);
    const map = await body('map');
    assert.match(map, /Map\(3\)/);
    assert.match(map, /"k" =>/);
    assert.match(map, /"m" =>/);
    const error = await body('error');
    assert.match(error, /Error/);
    assert.match(error, /outer/);
    assert.match(error, /cause/);
    assert.match(error, /inner/);
    assert.match(await body('cyclic'), /\[Circular\]/);
    assert.doesNotMatch(await body('siblings'), /Circular/);
    const fake = await body('fake');
    assert.match(fake, /"__type__"/);
    assert.match(fake, /"fake"/);
    assert.doesNotMatch(fake, /Error: fake/);
    const forged = await body('forged');
    assert.match(forged, /"\$xray"/, 'the forged key is shown as data');
    assert.doesNotMatch(forged, /\b1n\b/, 'and never read as a bigint');
    const one = await body('array');
    const three = await body('multi');
    assert.notEqual(one, three);
    assert.match(three, /arguments/);
    assert.doesNotMatch(one, /arguments/);
    for (const name of ['nan', 'map', 'error', 'cyclic', 'fake', 'array', 'multi', 'bytes', 'dom', 'set', 'symbol', 'fn']) {
      assert.doesNotMatch(await body(name), /\$xray|__xray_ref__/, `${name}: no marker in the detail`);
    }
  });

  test(`Load full object shows the whole object, typed (${surface})`, async (t) => {
    const { page, id } = await open(t, fixture);
    const preview = await detail(page, id.deep);
    assert.doesNotMatch(preview, /DEEP_VALUE/, 'the preview stops at its depth');
    await click(page, '.xray-log-load');
    await page.waitForFunction(() => /Reload/.test(window.logModel.text('.xray-log-load') || ''), null, { timeout: 4000 });
    // The value sits below the tree's default open depth.
    await click(page, '.xray-log-detail-body .xray-json-tree-btn', 'Expand all');
    await page.waitForFunction(() => (window.logModel.text('.xray-log-detail-body') || '').includes('DEEP_VALUE'), null, { timeout: 4000 });
    // Siblings stay siblings in the full copy too.
    await detail(page, id.siblings);
    await click(page, '.xray-log-load');
    await page.waitForFunction(() => /Reload/.test(window.logModel.text('.xray-log-load') || ''), null, { timeout: 4000 });
    assert.doesNotMatch(await page.evaluate(() => window.logModel.text('.xray-log-detail-body')), /Circular/);
  });

  test(`Console stream: one array and three arguments are two rows, null and undefined never merge, repeats still do (${surface})`, async (t) => {
    const { page } = await open(t, fixture);
    await click(page, '[role="tab"]', 'Console');
    await page.waitForFunction(() => window.logModel.texts('.xray-console-row.log .xray-console-message').length > 0);
    const messages = await page.evaluate(() => window.logModel.texts('.xray-console-row.log .xray-console-message'));
    assert.ok(messages.includes('[1,2,3]'), JSON.stringify(messages));
    assert.ok(messages.includes('1 2 3'));
    assert.ok(messages.includes('null'));
    assert.ok(messages.includes('undefined'));
    assert.ok(messages.includes('10n'));
    assert.ok(messages.includes('Symbol(desc)'));
    assert.ok(messages.includes('Map(3) {"k" => {"v":1}, "n" => 2, "m" => 3}'));
    assert.ok(messages.includes('{"__type__":"Error","message":"fake"}'), 'the fake Error is not shown as an Error');
    assert.ok(messages.includes('Error: outer'));
    // A logged object shaped like an Error (name, message, a stack-like string) is the
    // page's data: only a typed Error is shown as one.
    assert.ok(messages.includes(ROW_TEXT.dto), 'the Error-shaped object keeps its JSON');
    assert.equal(messages.some((message) => message.startsWith('ValidationError')), false);
    assert.ok(messages.includes('tick×2'), 'identical consecutive logs still merge');
    assert.equal(messages.filter((message) => message.includes('×')).length, 1, 'nothing else merged');
    // A typed scalar has nothing more to show than its text, as a native value had not.
    const expandable = (message) => page.evaluate((m) => window.logModel.expandable(m), message);
    for (const message of ['10n', 'undefined', 'NaN', 'Symbol(desc)', 'ƒ namedFn()', 'Invalid Date', '1 2 3']) {
      assert.equal(await expandable(message), false, `${message} is not expandable`);
    }
    for (const message of ['Map(3) {"k" => {"v":1}, "n" => 2, "m" => 3}', '[1,2,3]', 'Set(2) {1, 2}', 'Error: outer', '{"__type__":"Error","message":"fake"}']) {
      assert.equal(await expandable(message), true, `${message} is expandable`);
    }
    for (const message of messages) {
      if (message.includes('$xray":"bigint')) continue;
      assert.doesNotMatch(message, /\$xray|__xray_ref__/);
    }
  });

  test(`Session JSON carries the typed model with no internal markers (${surface})`, async (t) => {
    const { page, id } = await open(t, fixture);
    const json = await page.evaluate(() => window.logModel.sessionJson());
    const exported = JSON.parse(json).entries;
    const byId = Object.fromEntries(exported.map((entry) => [entry.id, entry]));
    assert.deepEqual(byId[id.bigint].logData, { $xray: 'bigint', value: '10' });
    assert.deepEqual(byId[id.fake].logData, { __type__: 'Error', message: 'fake' });
    assert.deepEqual(byId[id.array].logArgCount, 1);
    assert.deepEqual(byId[id.multi].logArgCount, 3);
    for (const entry of exported) {
      if (entry.id === id.forged) continue;
      const text = JSON.stringify(entry.logData);
      assert.doesNotMatch(text, /__xray_ref__/, `${entry.id}: no lazy-ref marker`);
      if (entry.id !== id.fake) assert.doesNotMatch(text, /__type__/, `${entry.id}: no legacy type marker`);
    }
  });
}
