import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { before, after } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { PANEL_CSS } from '../helpers/panel-css.mjs';
import { setStandardsContent } from '../helpers/standards-page.mjs';

// The request context line, picker and pins (spec P1–P2) on the real App, store,
// panel keyboard and stylesheet. Only the evaluation bridge (XRAY_Console) and
// persistence are stubbed; `calls` counts every execute() so picking, pinning and
// previews can prove they never evaluate, and `pins` records what the store hands
// the engine.
const { outputFiles } = await build({
  stdin: {
    resolveDir: fileURLToPath(new URL('../../', import.meta.url)), loader: 'jsx',
    contents: `
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      import { flushSync } from 'react-dom';
      import { App } from './src/panel/App';
      import { usePanelStore } from './src/panel/store';
      import { serializePanelPreferences } from './src/panel/models/panelPersistence';
      import { installPanelKeyboard } from './src/panel/runtime/panelKeyboard';
      const styles = ${JSON.stringify(PANEL_CSS)};
      const USERS = {users:[{id:1,name:'Ada'},{id:2,name:'Lin'}]};
      const api = (id, path, extra = {}) => ({id,type:'api',method:'GET',status:200,source:'fetch',
        url:'https://example.test' + path,urlPath:path,timestamp:Date.now() - 60000,duration:40,size:512,
        responseHeaders:{'content-type':'application/json'},responseRaw:JSON.stringify({path}),...extra});
      window.cx = {
        root: null, calls: [], pins: [],
        setup(shadow, mode, width, selected = 'users') {
          const host = document.body.appendChild(document.createElement('div'));
          if (mode === 'hud') { host.style.width = width + 'px'; host.style.height = '100vh'; }
          this.root = shadow ? host.attachShadow({mode:'closed'}) : document;
          const sheet = document.createElement('style'); sheet.textContent = styles;
          (shadow ? this.root : document.head).appendChild(sheet);
          const mount = shadow ? this.root.appendChild(document.createElement('div')) : host;
          mount.className = 'xray-app-root';
          window.XRAY_Store = {get:async()=>null,set:async()=>{}};
          const self = this;
          window.XRAY_Console = {
            init(){}, setContext(){}, navigateHistory(){ return null; },
            setVar(){}, getVar(){}, getScope(){ return {}; }, clearVariables(){},
            setPins(pins){ self.pins.push(Object.fromEntries(Object.entries(pins).map(([k, v]) => [k, v.id]))); },
            execute(code){ self.calls.push(code); return Promise.resolve({type:'number',result:1}); },
          };
          usePanelStore.setState({open:true,activeTab:'console',consoleMiniTab:'console',
            selectedId:null,expandedId:null,entries:[],consoleEvents:[],consolePins:[],recording:true,consoleDraft:'',
            settings:{...usePanelStore.getState().settings,panelWidth:width,maxEntries:50}});
          installPanelKeyboard({ dismissible: true, getRoot: () => self.root });
          flushSync(() => {
            usePanelStore.getState().addEntries([
              api('users', '/api/users', {size:14 * 1024, responseRaw:JSON.stringify(USERS)}),
              api('orders', '/api/orders', {status:201, method:'POST'}),
              api('health', '/api/health'),
              ...Array.from({length:6}, (_, i) => api('p' + i, '/api/page/' + i)),
            ]);
            usePanelStore.setState({selectedId:selected});
            createRoot(mount).render(<App mode={mode} />);
          });
        },
        store() { return usePanelStore.getState(); },
        set(patch) { flushSync(() => usePanelStore.setState(patch)); },
        select(id) { flushSync(() => usePanelStore.setState({selectedId:id})); },
        pin(id) { let out; flushSync(() => { out = usePanelStore.getState().pinConsoleRequest(id); }); return out; },
        evict(count) {
          flushSync(() => usePanelStore.getState().addEntries(Array.from({length:count}, (_, i) => api('n' + i + '_' + Math.random().toString(36).slice(2), '/api/new/' + i))));
        },
        prefs() { return JSON.stringify(serializePanelPreferences(usePanelStore.getState())); },
        draft(code) { flushSync(() => usePanelStore.getState().setConsoleDraft(code)); },
        query(selector) { return this.root.querySelector(selector); },
        queryAll(selector) { return [...this.root.querySelectorAll(selector)]; },
        line() { return this.root.querySelector('.xray-context-line')?.textContent ?? null; },
        trigger() { return this.root.querySelector('[aria-label="Console request context"]'); },
        active() { return this.root.activeElement || document.activeElement; },
        activeLabel() { const a = this.active(); return a?.getAttribute('aria-label') || a?.textContent?.trim() || a?.tagName; },
        options() { return [...this.root.querySelectorAll('.xray-context-option')].map(o => o.textContent.replace(/\\s+/g, ' ').trim()); },
        chips() { return [...this.root.querySelectorAll('.xray-pin-chip')].map(c => c.querySelector('.xray-pin-chip-name')?.textContent); },
        field() { return this.root.querySelector('textarea[aria-label="Console command"]'); },
        hint() { return this.root.querySelector('.xray-editor-hint')?.textContent ?? null; },
        click(selector) { this.root.querySelector(selector).click(); },
        clickText(selector, text) { [...this.root.querySelectorAll(selector)].find(el => el.textContent.trim().includes(text)).click(); },
        box(selector) {
          const el = this.root.querySelector(selector);
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return {x:r.x, y:r.y, right:r.right, bottom:r.bottom, width:r.width, height:r.height};
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

async function open(t, fixture, width = 960, selected = 'users', height = 760) {
  const page = await browser.newPage({ viewport: { width, height } });
  t.after(() => page.close());
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  t.after(() => assert.deepEqual(errors, [], 'page errors'));
  await setStandardsContent(page, '<style>body{margin:0;min-height:100vh}</style>');
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(args => window.cx.setup(args.shadow, args.mode, args.width, args.selected), { ...fixture, width, selected });
  await page.waitForFunction(() => window.cx.trigger());
  return page;
}

const ev = (page, fn, arg) => page.evaluate(fn, arg);
const calls = page => ev(page, () => window.cx.calls.length);

const FIXTURES = [
  { shadow:false, mode:'window', label:'document' },
  { shadow:true, mode:'hud', label:'closed shadow' },
];

for (const fixture of FIXTURES) {
  test(`context line summarises the selected request; none selected says plain JavaScript (${fixture.label})`, async t => {
    const page = await open(t, fixture);
    const line = await ev(page, () => window.cx.line());
    assert.ok(line.includes('res = GET /api/users · 200 · 14 kb'), `summary: ${line}`);
    assert.equal(await ev(page, () => !!window.cx.query('button[aria-label="Inspect in API"]')), true);
    assert.equal(await ev(page, () => window.cx.trigger().tagName), 'BUTTON');
    assert.equal(await ev(page, () => window.cx.trigger().getAttribute('aria-expanded')), 'false');
    assert.equal(await ev(page, () => window.cx.trigger().hasAttribute('aria-haspopup')), false, 'a disclosure, not an ARIA menu');
    if (!fixture.shadow) {
      // Label in name (WCAG 2.5.3): the accessible name contains the visible text.
      assert.equal(await page.getByRole('button', { name: 'Console request context Change', exact: true }).count(), 1);
    }

    await ev(page, () => window.cx.select(null));
    const empty = await ev(page, () => window.cx.line());
    assert.ok(empty.includes('No request selected · plain JavaScript only'), `empty: ${empty}`);
    assert.match(await ev(page, () => window.cx.trigger().textContent), /Pick request/);
    if (!fixture.shadow) assert.equal(await page.getByRole('button', { name: 'Console request context Pick request', exact: true }).count(), 1);
    assert.equal(await ev(page, () => !!window.cx.query('button[aria-label="Inspect in API"]')), false);
    assert.equal(await calls(page), 0);
  });

  test(`picker filters as you type, Enter selects, Escape closes to the trigger (${fixture.label})`, async t => {
    const page = await open(t, fixture);
    await ev(page, () => window.cx.draft('res.users'));
    await ev(page, () => window.cx.trigger().click());
    await page.waitForFunction(() => window.cx.options().length > 0);
    assert.equal(await ev(page, () => window.cx.trigger().getAttribute('aria-expanded')), 'true');
    assert.equal(await ev(page, () => window.cx.active().getAttribute('aria-label')), 'Filter requests', 'focus starts in the filter');
    assert.equal((await ev(page, () => window.cx.options())).length, 9);
    await page.keyboard.type('orders');
    await page.waitForFunction(() => window.cx.options().length === 1);
    assert.match((await ev(page, () => window.cx.options()))[0], /POST\s*\/api\/orders/);
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => !window.cx.query('.xray-context-menu'));
    let state = await ev(page, () => ({ selected: window.cx.store().selectedId, draft: window.cx.store().consoleDraft, tab: window.cx.store().activeTab }));
    assert.deepEqual(state, { selected: 'orders', draft: 'res.users', tab: 'console' });
    assert.equal(await ev(page, () => window.cx.active() === window.cx.trigger()), true, 'focus returns to the picker control');
    assert.ok((await ev(page, () => window.cx.line())).includes('res = POST /api/orders · 201'));

    // Arrow keys move from the filter into the list and between options.
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.cx.options().length > 0);
    await page.keyboard.type('health');
    await page.keyboard.press('ArrowDown');
    assert.match(await ev(page, () => window.cx.active().textContent), /\/api\/health/);
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.cx.store().selectedId === 'health');

    // Escape closes the picker only — the panel stays open.
    await ev(page, () => window.cx.trigger().click());
    await page.waitForFunction(() => window.cx.options().length > 0);
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !window.cx.query('.xray-context-menu'));
    assert.equal(await ev(page, () => window.cx.store().open), true);
    assert.equal(await ev(page, () => window.cx.active() === window.cx.trigger()), true);
    assert.equal(await calls(page), 0, 'picking never evaluates');
  });

  test(`Pin request adds chips a then b; the 7th is refused with a notice; chips unpin (${fixture.label})`, async t => {
    const page = await open(t, fixture);
    await ev(page, () => window.cx.trigger().click());
    await page.waitForFunction(() => window.cx.query('.xray-context-pin'));
    await ev(page, () => window.cx.click('.xray-context-pin'));
    await page.waitForFunction(() => window.cx.chips().length === 1);
    assert.deepEqual(await ev(page, () => window.cx.chips()), ['a']);
    assert.equal(await ev(page, () => !window.cx.query('.xray-context-menu')), true, 'pinning closes the picker');

    await ev(page, () => window.cx.select('orders'));
    await ev(page, () => window.cx.trigger().click());
    await page.waitForFunction(() => window.cx.query('.xray-context-pin'));
    await ev(page, () => window.cx.click('.xray-context-pin'));
    await page.waitForFunction(() => window.cx.chips().length === 2);
    assert.deepEqual(await ev(page, () => window.cx.chips()), ['a', 'b']);
    assert.deepEqual(await ev(page, () => window.cx.pins.at(-1)), { a: 'users', b: 'orders' });

    for (const id of ['p0', 'p1', 'p2', 'p3']) await ev(page, id => window.cx.pin(id), id);
    assert.deepEqual(await ev(page, () => window.cx.chips()), ['a', 'b', 'c', 'd', 'e', 'f']);
    await ev(page, () => window.cx.select('p4'));
    await ev(page, () => window.cx.trigger().click());
    await page.waitForFunction(() => window.cx.query('.xray-context-pin'));
    await ev(page, () => window.cx.click('.xray-context-pin'));
    await page.waitForFunction(() => /6 pins/.test(window.cx.store().toastMessage || ''));
    assert.equal((await ev(page, () => window.cx.chips())).length, 6, 'no 7th chip');

    // The remove button names the request too (chips show only the letter when narrow).
    assert.equal(await ev(page, () => window.cx.query('.xray-pin-chip-remove').getAttribute('aria-label')), 'Unpin a (GET /api/users)');
    await ev(page, () => window.cx.click('button[aria-label^="Unpin b "]'));
    await page.waitForFunction(() => window.cx.chips().length === 5);
    assert.deepEqual(await ev(page, () => window.cx.chips()), ['a', 'c', 'd', 'e', 'f']);
    assert.equal(await calls(page), 0);
    // Session-only: nothing about pins reaches the persisted preferences.
    const prefs = await ev(page, () => window.cx.prefs());
    assert.doesNotMatch(prefs, /consolePins|"users"/);
  });

  test(`an evicted pinned request drops its chip with a notice; no request falls back to plain JS (${fixture.label})`, async t => {
    const page = await open(t, fixture, 960, 'orders');
    await ev(page, () => window.cx.pin('users'));
    assert.deepEqual(await ev(page, () => window.cx.chips()), ['a']);
    await ev(page, () => window.cx.evict(45));
    await page.waitForFunction(() => window.cx.chips().length === 0);
    assert.equal(await ev(page, () => window.cx.store().toastMessage), 'Pin a removed: request no longer captured');
    assert.deepEqual(await ev(page, () => window.cx.pins.at(-1)), {});
    await ev(page, () => window.cx.select(null));
    assert.ok((await ev(page, () => window.cx.line())).includes('No request selected'));
  });
}

test('pinned bodies feed suggestions and the live preview without evaluating', async t => {
  const page = await open(t, FIXTURES[0], 960, 'orders');
  await ev(page, () => window.cx.pin('users'));
  await ev(page, () => window.cx.field().focus());
  await page.keyboard.type('a.users[0].name');
  await page.waitForFunction(() => window.cx.hint());
  // Final review M-2: the local preview is the Run's one line (previewLine), not a second formatter.
  assert.equal(await ev(page, () => window.cx.hint()), "→ 'Ada' (from captured data)");
  for (const [draft, want] of [['a.users[0]', "→ {id: 1, name: 'Ada'} (from captured data)"], ['a.users', '→ Array(2) [{…}, {…}] (from captured data)']]) {
    await ev(page, () => { window.cx.field().select(); });
    await page.keyboard.type(draft);
    await page.waitForFunction((text) => window.cx.hint() === text, want, { timeout: 3000 }).catch(() => {});
    assert.equal(await ev(page, () => window.cx.hint()), want);
  }
  // `a` is offered as a chip and as a variable.
  assert.equal(await ev(page, () => [...window.cx.queryAll('[aria-label="Insert into command"] button')].some(b => b.textContent.trim() === 'a')), true);
  assert.equal(await calls(page), 0);
});

test('request detail More actions pins the request in the Console', async t => {
  const page = await open(t, FIXTURES[0], 1280);
  await ev(page, () => window.cx.set({ activeTab: 'api', apiDetailOpen: true, selectedId: 'orders' }));
  await page.waitForFunction(() => window.cx.query('button[aria-label="More actions"]'));
  await ev(page, () => window.cx.click('button[aria-label="More actions"]'));
  await page.waitForFunction(() => window.cx.query('.xray-detail-action-list'));
  await ev(page, () => window.cx.clickText('.xray-detail-action-list .xray-menu-item', 'Pin in Console'));
  await page.waitForFunction(() => window.cx.store().consolePins.length === 1);
  assert.deepEqual(await ev(page, () => window.cx.store().consolePins), [{ name: 'a', entryId: 'orders' }]);
  assert.match(await ev(page, () => window.cx.store().toastMessage), /Pinned as a/);
  assert.equal(await calls(page), 0);
});

for (const width of [420, 760, 1600]) {
  test(`context line with six pins stays inside the prompt at ${width}px`, async t => {
    const page = await open(t, { shadow:false, mode:'window' }, width);
    for (const id of ['users', 'orders', 'p0', 'p1', 'p2', 'p3']) await ev(page, id => window.cx.pin(id), id);
    const state = await ev(page, () => ({
      prompt: window.cx.box('.xray-prompt'), line: window.cx.box('.xray-context-line'),
      trigger: window.cx.box('[aria-label="Console request context"]'), chips: window.cx.queryAll('.xray-pin-chip').map(c => { const r = c.getBoundingClientRect(); return {x:r.x,right:r.right,width:r.width}; }),
      overflow: (() => { const l = window.cx.query('.xray-context-line'); return l.scrollWidth - l.clientWidth; })(),
    }));
    assert.ok(state.overflow <= 1, `context line overflows: ${JSON.stringify(state)}`);
    if (width === 1600) {
      // The request's age is shown on the line (it collapses first when space is tight).
      const age = await ev(page, () => ({ text: window.cx.query('.xray-context-age')?.textContent, box: window.cx.box('.xray-context-age') }));
      assert.equal(age.text, ' · 1m ago');
      assert.ok(age.box.width > 40, `age visible: ${JSON.stringify(age)}`);
    }
    assert.ok(state.trigger.width > 0 && state.trigger.right <= state.line.right + 1, `picker control clipped: ${JSON.stringify(state)}`);
    assert.equal(state.chips.length, 6);
    for (const chip of state.chips) assert.ok(chip.width > 0 && chip.right <= state.line.right + 1, `chip clipped: ${JSON.stringify(state)}`);
    // The picker opens inside the panel.
    await ev(page, () => window.cx.trigger().click());
    await page.waitForFunction(() => window.cx.query('.xray-context-menu'));
    const menu = await ev(page, () => window.cx.box('.xray-context-menu'));
    assert.ok(menu.x >= -1 && menu.right <= width + 1 && menu.y >= -1, `picker menu off-screen: ${JSON.stringify(menu)}`);
  });
}

test('a request captured more than a day ago shows its date, not "Nd ago"', async t => {
  const page = await open(t, FIXTURES[0], 1600);
  const age = () => ev(page, () => window.cx.query('.xray-context-age')?.textContent);
  const stamp = ts => ev(page, ts => window.cx.set({ entries: window.cx.store().entries.map(e => e.id === 'users' ? { ...e, timestamp: ts } : e) }), ts);
  await stamp(Date.UTC(2025, 2, 5, 12));
  assert.equal(await age(), ' · on 5 Mar 2025', 'another year includes the year');
  await stamp(Date.now() - 2 * 86_400_000);
  assert.match(await age(), /^ · on \d{1,2} [A-Z][a-z]{2}( \d{4})?$/);
  await stamp(Date.now() - 3 * 3_600_000);
  assert.equal(await age(), ' · 3h ago', 'within a day it stays relative');
  assert.equal(await calls(page), 0);
});
