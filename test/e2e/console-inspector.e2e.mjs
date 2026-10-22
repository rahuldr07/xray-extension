import assert from 'node:assert/strict';
import { existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { before, after } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { PANEL_CSS } from '../helpers/panel-css.mjs';
import { setStandardsContent } from '../helpers/standards-page.mjs';

// Big results and the inspector (spec C6–C7) on the real App, store, virtualized
// stream, panel keyboard and stylesheet. Only the evaluation bridge (XRAY_Console),
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
      const users = n => Array.from({length:n}, (_, i) => ({id:i, name:'User ' + i, email:'user' + i + '@example.test'}));
      const BODY = {users:users(500), meta:{page:1,total:500}, 'a b':1, '':2};
      const RESPONSES = {
        res: {type:'object',result:BODY},
        'res.users': {type:'array',result:BODY.users},
        huge: {type:'array',result:Array.from({length:5000}, (_, i) => ({id:i, tags:['x','y'], nested:{deep:{value:i}}}))},
        small: {type:'object',result:{a:1,b:[1,2]}},
        wide: {type:'array',result:Array.from({length:70000}, (_, i) => ({a:i, b:i, c:i}))},
      };
      window.insp = {
        root: null, calls: [], vars: {}, copied: null, evaluate: false,
        setup(shadow, mode, width, theme = 'xray-dark') {
          const host = document.body.appendChild(document.createElement('div'));
          if (mode === 'hud') { host.style.width = width + 'px'; host.style.height = '100vh'; }
          this.root = shadow ? host.attachShadow({mode:'closed'}) : document;
          const sheet = document.createElement('style'); sheet.textContent = styles;
          (shadow ? this.root : document.head).appendChild(sheet);
          const mount = shadow ? this.root.appendChild(document.createElement('div')) : host;
          mount.className = 'xray-app-root';
          window.XRAY_Store = {get:async()=>null,set:async()=>{}};
          Object.defineProperty(navigator, 'clipboard', {configurable:true, value:{writeText:async text=>{this.copied=text;}}});
          const self = this;
          window.XRAY_Console = {
            init(){}, setContext(){}, navigateHistory(){ return null; },
            setVar(name, value){ self.vars[name] = value; },
            getVar(name){ return self.vars[name]; },
            getScope(){ return {...self.vars}; },
            execute(code) {
              self.calls.push(code);
              if (RESPONSES[code] || !self.evaluate) return Promise.resolve(RESPONSES[code] || {type:'undefined'});
              // Opt-in evaluation against the same body, with the runtime's table() (rows
              // flagged out of band, spec J8) and the console scope, so inserted paths are really run.
              const tables = new WeakSet();
              const table = rows => { const out = Array.isArray(rows) ? rows.slice() : []; tables.add(out); return out; };
              const names = Object.keys(self.vars);
              try {
                const value = new Function('res', 'table', ...names, 'return (' + code + ');')(BODY, table, ...names.map(n => self.vars[n]));
                const type = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
                return Promise.resolve({type, result:value, ...(tables.has(value) ? {render:'table'} : {})});
              } catch (error) {
                return Promise.resolve({type:'error', error:{message:error.name + ': ' + error.message}});
              }
            },
          };
          usePanelStore.setState({open:true,activeTab:'console',consoleMiniTab:'console',
            selectedId:null,expandedId:null,entries:[],consoleEvents:[],recording:true,consoleDraft:'',
            settings:{...usePanelStore.getState().settings,panelWidth:width,theme}});
          installPanelKeyboard({ dismissible: true, getRoot: () => self.root });
          flushSync(() => {
            usePanelStore.getState().addEntry({id:'context',type:'api',method:'GET',status:200,
              source:'fetch',url:'https://example.test/users',urlPath:'/users',timestamp:1000,duration:100,size:1000,
              responseHeaders:{'content-type':'application/json'},responseRaw:'{"ok":true}'});
            usePanelStore.setState({selectedId:'context'});
            createRoot(mount).render(<App mode={mode} />);
          });
        },
        addBigLog() {
          flushSync(() => usePanelStore.getState().addConsoleEvent({id:'log-big',type:'log',level:'info',timestamp:2000,
            message:'loaded users', args:['loaded users', users(120)]}));
        },
        storeOpen() { return usePanelStore.getState().open; },
        clear(scope) { flushSync(() => usePanelStore.getState().clearConsole(scope)); },
        draft(code) { flushSync(() => usePanelStore.getState().setConsoleDraft(code)); },
        draftValue() { return usePanelStore.getState().consoleDraft; },
        query(selector) { return this.root.querySelector(selector); },
        queryAll(selector) { return [...this.root.querySelectorAll(selector)]; },
        cells() { return [...this.root.querySelectorAll('.xray-command-cell')]; },
        cellText(i) { return this.cells()[i]?.textContent || ''; },
        inspector() { return this.root.querySelector('.xray-inspector'); },
        rect(selector) {
          const el = typeof selector === 'string' ? this.root.querySelector(selector) : selector;
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return {left:r.left, right:r.right, top:r.top, bottom:r.bottom, width:r.width, height:r.height};
        },
        box(selector, cellIndex) {
          const scope = cellIndex == null ? this.root : this.cells()[cellIndex];
          const el = selector ? scope?.querySelector(selector) : scope;
          if (!el) return null;
          el.scrollIntoView({block:'nearest'});
          const r = el.getBoundingClientRect();
          return {x:r.x + r.width / 2, y:r.y + r.height / 2, width:r.width, height:r.height};
        },
        // A tree row's select button, by its key text as rendered (e.g. '"name"', '0').
        rowBox(keyText, nth = 0) {
          const keys = [...this.inspector().querySelectorAll('.xray-json-key')].filter(k => k.textContent === keyText);
          const row = keys[nth]?.closest('[role="treeitem"]');
          if (!row) return null;
          row.scrollIntoView({block:'nearest'});
          const r = row.getBoundingClientRect();
          return {x:r.x + Math.min(r.width / 2, 60), y:r.y + r.height / 2, width:r.width, height:r.height};
        },
        visibleKeys() {
          return [...this.inspector().querySelectorAll('.xray-json-key')].map(k => k.textContent);
        },
        activeLabel() {
          const el = this.root.activeElement || document.activeElement;
          return el?.getAttribute?.('aria-label') || el?.textContent?.trim() || el?.tagName || null;
        },
        // The focused tree row: its key text ('root' for the top row), or null outside the tree.
        activeRow() {
          const el = this.root.activeElement || document.activeElement;
          if (!el?.closest?.('[role="tree"]') || el.getAttribute('role') !== 'treeitem') return null;
          if (el.classList.contains('xray-json-more-row')) return 'more';
          return el.getAttribute('aria-level') === '1' ? 'root' : el.querySelector('.xray-json-key')?.textContent ?? null;
        },
        treeStops() {
          return this.inspector().querySelectorAll('[role="tree"] [tabindex="0"]').length;
        },
        openConfirm() {
          usePanelStore.getState().requestConfirmation({title:'Test dialog', message:'Over the inspector', confirmLabel:'OK', onConfirm(){}});
        },
        tab(name) { flushSync(() => usePanelStore.setState({activeTab:name})); },
        activeInspectId() {
          const el = this.root.activeElement || document.activeElement;
          return el?.getAttribute?.('data-inspect-id') || null;
        },
        // C7 performance: click → inspector committed and painted.
        async timeOpen(cellIndex) {
          const button = this.cells()[cellIndex].querySelector('button[aria-label="Open in inspector"]');
          const start = performance.now();
          button.click();
          await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
          return {ms: performance.now() - start, rows: this.inspector()?.querySelectorAll('.xray-json-row').length ?? -1};
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

async function open(t, fixture, width, height = 760, theme) {
  const page = await browser.newPage({ viewport: { width, height } });
  t.after(() => page.close());
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  t.after(() => assert.deepEqual(errors, [], 'page errors'));
  await setStandardsContent(page, '<style>body{margin:0;min-height:100vh}</style>');
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(args => window.insp.setup(args.shadow, args.mode, args.width, args.theme), { ...fixture, width, theme });
  await page.waitForFunction(() => window.insp.query('.xray-console-run'));
  return page;
}

async function click(page, selector, cellIndex) {
  const box = await page.evaluate(([s, i]) => window.insp.box(s, i), [selector, cellIndex ?? null]);
  assert.ok(box, `no element for ${selector} in cell ${cellIndex}`);
  assert.ok(box.width > 0 && box.height > 0, `${selector} is not visible`);
  await page.mouse.click(box.x, box.y);
}

async function clickRow(page, keyText, nth = 0) {
  const box = await page.evaluate(([k, n]) => window.insp.rowBox(k, n), [keyText, nth]);
  assert.ok(box, `no tree row for ${keyText}`);
  await page.mouse.click(box.x, box.y);
}

async function run(page, code) {
  const before = await page.evaluate(() => window.insp.cells().length);
  await page.evaluate(code => window.insp.draft(code), code);
  await click(page, '.xray-console-run');
  await page.waitForFunction(n => window.insp.cells().length === n + 1 && !/Running…/.test(window.insp.cellText(n)), before, { timeout: 4000 });
}

async function openInspector(page, cellIndex = 0) {
  await click(page, 'button[aria-label="Open in inspector"]', cellIndex);
  await page.waitForFunction(() => window.insp.inspector());
}

const has = (page, selector) => page.evaluate(s => Boolean(window.insp.query(s)), selector);
const footerPath = page => page.evaluate(() => window.insp.inspector()?.querySelector('.xray-inspector-path')?.textContent || '');

for (const fixture of [
  { shadow:false, mode:'window', label:'document' },
  { shadow:true, mode:'hud', label:'closed shadow' },
]) {
  test(`a big result shows a summary and Open in inspector, not an inline tree (${fixture.label})`, async t => {
    const page = await open(t, fixture, 1600);
    await run(page, 'res');
    const cell = await page.evaluate(() => {
      const el = window.insp.cells()[0];
      return {
        text: el.textContent,
        tree: Boolean(el.querySelector('.xray-json-tree')),
        views: Boolean(el.querySelector('[aria-label="Result view"]')),
        open: el.querySelectorAll('button[aria-label="Open in inspector"]').length,
        summary: el.querySelector('.xray-result-summary')?.textContent || '',
      };
    });
    assert.match(cell.text, /object · 4 keys · \d+ kb/, 'type badge with size');
    // The one-line preview the console writes everywhere (consolePreview.previewLine, spec §1).
    assert.match(cell.summary, /^\{users: Array\(500\), meta: \{…\}/, `shape summary: ${cell.summary}`);
    assert.equal(cell.tree, false, 'no inline tree for a big result');
    assert.equal(cell.views, false, 'no Table/Tree/JSON switch for a big result');
    assert.equal(cell.open, 1, 'one Open in inspector control');
    assert.equal(await has(page, '.xray-inspector'), false, 'inspector closed until asked');

    await run(page, 'small');
    assert.equal(await page.evaluate(() => Boolean(window.insp.cells()[1].querySelector('.xray-json-tree'))), true, 'small results stay inline');
  });

  test(`docked at 1600: inspector right of the stream, resizable, both visible (${fixture.label})`, async t => {
    const page = await open(t, fixture, 1600);
    await run(page, 'res');
    await openInspector(page);
    const geo = await page.evaluate(() => ({
      stream: window.insp.rect('.xray-console-stream'),
      inspector: window.insp.rect('.xray-inspector'),
      role: window.insp.inspector().getAttribute('role'),
      label: window.insp.inspector().getAttribute('aria-label'),
      back: Boolean(window.insp.inspector().querySelector('button[aria-label="Back to console"]')),
    }));
    assert.ok(geo.stream.width > 300, `stream visible: ${JSON.stringify(geo.stream)}`);
    assert.ok(geo.inspector.width >= 320, `inspector visible: ${JSON.stringify(geo.inspector)}`);
    assert.ok(geo.inspector.left >= geo.stream.right - 1, 'inspector sits right of the stream');
    assert.equal(geo.role, 'complementary');
    assert.match(geo.label, /^Inspector: res$/);
    assert.equal(geo.back, false, 'no Back control when docked');
    // Resizable with the shared PaneDivider (keyboard: ArrowLeft widens the inspector).
    const divider = '[role="separator"][aria-label^="Resize inspector"]';
    assert.equal(await has(page, divider), true, 'divider present when docked');
    await page.evaluate(s => window.insp.query(s).focus(), divider);
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(50);
    const wider = await page.evaluate(() => window.insp.rect('.xray-inspector').width);
    assert.ok(wider > geo.inspector.width + 30, `inspector widened: ${geo.inspector.width} → ${wider} (${await page.evaluate(s => window.insp.query(s).getAttribute('aria-valuenow'), divider)})`);
  });

  test(`overlay at 420: covers the Console with a Back control (${fixture.label})`, async t => {
    const page = await open(t, fixture, 420);
    await run(page, 'res');
    await openInspector(page);
    const geo = await page.evaluate(() => ({
      workspace: window.insp.rect('.xray-console-workspace'),
      inspector: window.insp.rect('.xray-inspector'),
      role: window.insp.inspector().getAttribute('role'),
      divider: Boolean(window.insp.query('[role="separator"][aria-label^="Resize inspector"]')),
    }));
    assert.equal(geo.role, 'dialog');
    assert.equal(geo.divider, false, 'no divider in overlay mode');
    for (const side of ['left', 'right', 'top', 'bottom']) {
      assert.ok(Math.abs(geo.workspace[side] - geo.inspector[side]) <= 1, `overlay ${side}: ${JSON.stringify(geo)}`);
    }
    assert.equal(await page.evaluate(() => window.insp.inspector().contains(window.insp.root.activeElement)), true, 'focus moves into the overlay');
    assert.equal(await page.evaluate(() => window.insp.query('.xray-console-column').inert), true, 'the Console under the overlay is inert');
    await click(page, '.xray-inspector button[aria-label="Back to console"]');
    await page.waitForFunction(() => !window.insp.inspector());
    assert.equal(await page.evaluate(() => window.insp.activeLabel()), 'Open in inspector', 'Back returns focus to the opener');
    assert.equal(await page.evaluate(() => window.insp.query('.xray-console-column').inert), false, 'inert lifts on close');
  });

  test(`first paint under 500 ms for a 5,000-item array (${fixture.label})`, async t => {
    const page = await open(t, fixture, 1600);
    await run(page, 'huge');
    const timing = await page.evaluate(() => window.insp.timeOpen(0));
    assert.ok(timing.rows > 0, 'tree rendered');
    assert.ok(timing.rows < 400, `bounded initial rendering: ${timing.rows} rows`);
    assert.ok(timing.ms < 500, `first paint ${Math.round(timing.ms)} ms`);
    assert.match(await page.evaluate(() => window.insp.inspector().textContent), /Show \d+ more/, 'chunked children');
  });

  for (const width of [1600, 420]) {
    test(`filter, select, Copy path, Use in prompt; Escape returns focus (${fixture.label} ${width})`, async t => {
      const page = await open(t, fixture, width);
      await run(page, 'res');
      await openInspector(page);
      // Selecting nodes shows the full path, rooted at the cell's expression.
      await clickRow(page, '"a b"');
      assert.equal(await footerPath(page), 'res["a b"]');
      await clickRow(page, '""');
      assert.equal(await footerPath(page), 'res[""]');
      await click(page, '.xray-inspector .xray-json-toggle[title="Expand users"]');
      await click(page, '.xray-inspector .xray-json-toggle[title="Expand [0]"]');
      await clickRow(page, '"name"');
      assert.equal(await footerPath(page), 'res.users[0].name');
      assert.equal(await page.evaluate(() => window.insp.inspector().querySelector('[aria-selected="true"] .xray-json-key')?.textContent), '"name"');
      await click(page, '.xray-inspector button[aria-label="Copy path"]');
      await page.waitForFunction(() => window.insp.copied !== null);
      assert.equal(await page.evaluate(() => window.insp.copied), 'res.users[0].name');

      // Filter narrows the visible nodes to matching keys and their ancestors.
      await page.evaluate(() => window.insp.inspector().querySelector('input[aria-label="Filter keys and paths"]').focus());
      await page.keyboard.type('name');
      await page.waitForFunction(() => !window.insp.visibleKeys().includes('"email"'));
      const keys = await page.evaluate(() => window.insp.visibleKeys());
      assert.ok(keys.includes('"name"'), 'matching keys stay');
      assert.ok(!keys.includes('"meta"') && !keys.includes('"a b"'), `non-matching branches hidden: ${keys.slice(0, 12)}`);
      assert.ok(keys.filter(k => k === '"name"').length >= 50, 'matches beneath array items are revealed');

      // Use in prompt inserts the path at the caret of the Console command.
      await page.evaluate(() => {
        window.insp.draft('len()');
        const field = window.insp.query('[aria-label="Console command"]');
        field.focus();
        field.setSelectionRange(4, 4);
      });
      await click(page, '.xray-inspector button[aria-label="Use in prompt"]');
      await page.waitForFunction(() => window.insp.draftValue() === 'len(res.users[0].name)');
      assert.equal(await page.evaluate(() => window.insp.activeLabel()), 'Console command', 'focus lands in the prompt');
      assert.deepEqual(await page.evaluate(() => window.insp.calls.slice()), ['res'], 'nothing evaluates');
      if (width < 900) {
        // The overlay covered the prompt, so Use in prompt closed it.
        assert.equal(await has(page, '.xray-inspector'), false);
        await openInspector(page);
      }

      // Escape closes the inspector (not the panel) and focus returns to the cell's button.
      await page.evaluate(() => window.insp.inspector().querySelector('input[aria-label="Filter keys and paths"]').focus());
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => !window.insp.inspector());
      assert.equal(await page.evaluate(() => window.insp.activeLabel()), 'Open in inspector');
      assert.equal(await page.evaluate(() => window.insp.activeInspectId()), await page.evaluate(() => window.insp.cells()[0].dataset.commandId));
      assert.equal(await page.evaluate(() => window.insp.storeOpen()), true, 'panel stays open');
    });
  }

  test(`Escape order: open menu → inspector → panel (${fixture.label})`, async t => {
    const page = await open(t, fixture, 1600);
    await run(page, 'res');
    await openInspector(page);
    await click(page, 'button[aria-label="More cell actions"]', 0);
    assert.equal(await page.evaluate(() => window.insp.cells()[0].querySelector('button[aria-label="More cell actions"]').getAttribute('aria-expanded')), 'true');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(50);
    assert.equal(await page.evaluate(() => window.insp.cells()[0].querySelector('button[aria-label="More cell actions"]').getAttribute('aria-expanded')), 'false', 'menu closes first');
    assert.equal(await has(page, '.xray-inspector'), true, 'inspector still open');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !window.insp.inspector());
    assert.equal(await page.evaluate(() => window.insp.storeOpen()), true, 'panel still open');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !window.insp.storeOpen());
  });

  test(`opening another big result replaces the inspected value; big page logs offer the inspector (${fixture.label})`, async t => {
    const page = await open(t, fixture, 1600);
    await run(page, 'res');
    await run(page, 'res.users');
    await openInspector(page, 0);
    await clickRow(page, '"a b"');
    await openInspector(page, 1);
    await page.waitForFunction(() => window.insp.inspector().getAttribute('aria-label') === 'Inspector: res.users');
    assert.equal(await page.evaluate(() => window.insp.queryAll('.xray-inspector').length), 1, 'one inspector');
    assert.match(await footerPath(page), /^Select a node/, 'selection resets for the new value');
    await page.evaluate(() => window.insp.addBigLog());
    await page.waitForFunction(() => window.insp.query('.xray-console-row button[aria-label="Open in inspector"]'));
    await click(page, '.xray-console-row button[aria-label="Open in inspector"]');
    await page.waitForFunction(() => window.insp.inspector().getAttribute('aria-label') === 'Inspector: loaded users');
    assert.equal(await page.evaluate(() => window.insp.query('.xray-console-row .xray-console-toggle').getAttribute('aria-expanded')), 'false', 'the button does not toggle the row');
    await clickRow(page, '0');
    assert.equal(await footerPath(page), '[0]', 'page-log paths are relative to the logged value');
    assert.equal(await page.evaluate(() => window.insp.inspector().querySelector('button[aria-label="Use in prompt"]')?.disabled), true, 'no expression to prefix');
  });

  test(`a table() result: $_, Save as variable and inspector paths use the rows; the render flag is out of band (${fixture.label})`, async t => {
    const page = await open(t, fixture, 1600);
    await page.evaluate(() => { window.insp.evaluate = true; });
    // The "Table of users" starter inserts exactly this (console-editor covers the chip).
    await run(page, 'table(res.users)');
    assert.equal(await page.evaluate(() => window.insp.cells()[0].querySelector('button[aria-label="Open in inspector"]') !== null), true);
    const last = await page.evaluate(() => ({ array: Array.isArray(window.insp.vars.$_), length: window.insp.vars.$_?.length, marker: window.insp.vars.$_?.__xr_render ?? null }));
    assert.deepEqual(last, { array: true, length: 500, marker: null }, '$_ holds the rows');
    const announced = await page.evaluate(() => window.insp.query('.xray-prompt > .xray-visually-hidden[aria-live]').textContent);
    assert.match(announced, /^Result: \[/, `announces the rows: ${announced}`);
    assert.doesNotMatch(announced, /__xr_render/);
    await run(page, '$_.length');
    assert.match(await page.evaluate(() => window.insp.cellText(1)), /500/, '$_.length is the row count');

    await openInspector(page, 0);
    await click(page, '.xray-inspector .xray-json-toggle[title="Expand [3]"]');
    await clickRow(page, '"name"');
    assert.equal(await footerPath(page), '(table(res.users))[3].name', 'table() evaluates to the rows: no .data hop');
    await page.evaluate(() => { window.insp.draft(''); window.insp.query('[aria-label="Console command"]').focus(); });
    await click(page, '.xray-inspector button[aria-label="Use in prompt"]');
    await page.waitForFunction(() => window.insp.draftValue() === '(table(res.users))[3].name');
    await click(page, '.xray-console-run');
    await page.waitForFunction(() => window.insp.cells().length === 3 && !/Running…/.test(window.insp.cellText(2)), null, { timeout: 4000 });
    const text = await page.evaluate(() => window.insp.cellText(2));
    assert.match(text, /"User 3"/, `the inserted path evaluates: ${text}`);
    assert.doesNotMatch(text, /TypeError/);

    // Saved as a variable, the rows are stored and the inspector re-roots at the name.
    await click(page, 'button[aria-label="Save as variable"]', 0);
    await page.waitForFunction(() => window.insp.vars.temp1 !== undefined);
    assert.deepEqual(await page.evaluate(() => [Array.isArray(window.insp.vars.temp1), window.insp.vars.temp1.length, window.insp.vars.temp1.__xr_render ?? null]), [true, 500, null]);
    await page.waitForFunction(() => window.insp.inspector()?.querySelector('.xray-inspector-path')?.textContent === 'temp1[3].name');
    await run(page, 'temp1[3].name');
    assert.match(await page.evaluate(() => window.insp.cellText(3)), /"User 3"/);
  });

  test(`the inspector closes when its cell leaves the stream: Delete cell, Clear (${fixture.label})`, async t => {
    const page = await open(t, fixture, 1600);
    await run(page, 'res');
    await openInspector(page);
    // Delete cell from the cell's More menu.
    await click(page, 'button[aria-label="More cell actions"]', 0);
    await click(page, 'button[aria-label="Delete cell"]', 0);
    await page.waitForFunction(() => window.insp.cells().length === 0);
    await page.waitForFunction(() => !window.insp.inspector(), null, { timeout: 2000 });
    assert.equal(await page.evaluate(() => window.insp.activeLabel()), 'Console command', 'focus lands in the prompt');

    // Clear page logs keeps a command's inspector; Clear my commands closes it.
    await run(page, 'res');
    await openInspector(page);
    await page.evaluate(() => window.insp.clear('page'));
    await page.waitForTimeout(50);
    assert.equal(await has(page, '.xray-inspector'), true, 'Clear page logs leaves a command cell (and its inspector)');
    await page.evaluate(() => window.insp.clear('commands'));
    await page.waitForFunction(() => !window.insp.inspector(), null, { timeout: 2000 });

    // A page log's inspector closes with Clear page logs; Clear everything closes a command's.
    await page.evaluate(() => window.insp.addBigLog());
    await page.waitForFunction(() => window.insp.query('.xray-console-row button[aria-label="Open in inspector"]'));
    await click(page, '.xray-console-row button[aria-label="Open in inspector"]');
    await page.waitForFunction(() => window.insp.inspector());
    await page.evaluate(() => window.insp.clear('page'));
    await page.waitForFunction(() => !window.insp.inspector(), null, { timeout: 2000 });
    await run(page, 'res');
    await openInspector(page);
    await page.evaluate(() => window.insp.clear('all'));
    await page.waitForFunction(() => !window.insp.inspector(), null, { timeout: 2000 });
    assert.equal(await page.evaluate(() => window.insp.storeOpen()), true, 'the panel stays open');
  });

  test(`the tree is one keyboard stop with arrow navigation (${fixture.label})`, async t => {
    const page = await open(t, fixture, 1600);
    await run(page, 'res');
    await openInspector(page);
    assert.equal(await page.evaluate(() => window.insp.treeStops()), 1, 'exactly one tab stop in the tree');
    assert.equal(await page.evaluate(() => window.insp.inspector().querySelectorAll('.xray-json-toggle[tabindex], button.xray-json-toggle').length), 0, 'chevrons are not tab stops');
    // Tab from the filter: past the Expand/Collapse all buttons, onto the tree's one stop.
    for (let i = 0; i < 4 && !(await page.evaluate(() => window.insp.activeRow())); i++) await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => window.insp.activeRow()), 'root');
    const key = async k => { await page.keyboard.press(k); await page.waitForTimeout(30); return page.evaluate(() => window.insp.activeRow()); };
    assert.equal(await key('ArrowRight'), '"users"', 'Right on an open branch moves to its first child');
    assert.equal(await key('ArrowRight'), '"users"', 'Right on a closed branch expands it');
    assert.equal(await page.evaluate(() => window.insp.root.activeElement?.getAttribute('aria-expanded') ?? document.activeElement?.getAttribute('aria-expanded')), 'true');
    assert.equal(await key('ArrowRight'), '0');
    assert.equal(await key('ArrowDown'), '1');
    assert.equal(await key('ArrowUp'), '0');
    await key('Enter');
    assert.equal(await footerPath(page), 'res.users[0]');
    assert.equal(await page.evaluate(() => window.insp.inspector().querySelector('[aria-selected="true"] .xray-json-key')?.textContent), '0');
    assert.equal(await page.evaluate(() => window.insp.treeStops()), 1, 'still one stop after moving');
    assert.equal(await key('ArrowLeft'), '"users"', 'Left on a closed node moves to its parent');
    assert.equal(await key('ArrowLeft'), '"users"', 'Left on an open branch collapses it');
    assert.equal(await page.evaluate(() => window.insp.visibleKeys().includes('0')), false);
    assert.equal(await key('End'), '""');
    assert.equal(await key('Home'), 'root');
    await key(' ');
    assert.equal(await footerPath(page), 'res', 'Space selects too');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => window.insp.activeRow()), null, 'Tab leaves the tree');
    assert.equal(await page.evaluate(() => window.insp.activeLabel()), 'Copy path');
  });

  test(`a no-op key on the active row does not pull focus back from the filter (${fixture.label})`, async t => {
    const page = await open(t, fixture, 1600);
    await run(page, 'res');
    await openInspector(page);
    await page.evaluate(() => window.insp.inspector().querySelector('[role="tree"] [tabindex="0"]').focus());
    assert.equal(await page.evaluate(() => window.insp.activeRow()), 'root');
    await page.keyboard.press('Home');
    assert.equal(await page.evaluate(() => window.insp.activeRow()), 'root', 'Home on the first row is a no-op');
    for (let i = 0; i < 4 && (await page.evaluate(() => window.insp.activeLabel())) !== 'Filter keys and paths'; i++) {
      await page.keyboard.press('Shift+Tab');
    }
    assert.equal(await page.evaluate(() => window.insp.activeLabel()), 'Filter keys and paths');
    await page.keyboard.type('nam', { delay: 30 });
    await page.waitForTimeout(80);
    assert.equal(await page.evaluate(() => window.insp.activeLabel()), 'Filter keys and paths', 'focus stays in the filter');
    assert.equal(await page.evaluate(() => window.insp.inspector().querySelector('input[aria-label="Filter keys and paths"]').value), 'nam');
  });

  test(`Show more is reachable from the keyboard and keeps focus in place (${fixture.label})`, async t => {
    const page = await open(t, fixture, 1600);
    await run(page, 'huge');
    await openInspector(page);
    await page.evaluate(() => window.insp.inspector().querySelector('[role="tree"] [tabindex="0"]').focus());
    await page.keyboard.press('End');
    await page.waitForTimeout(30);
    assert.equal(await page.evaluate(() => window.insp.activeRow()), 'more');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.insp.activeRow() === '100');
    assert.match(await page.evaluate(() => window.insp.inspector().textContent), /Show 100 more · 4800 hidden/);
  });

  test(`a filter over a huge value says it was limited (${fixture.label})`, async t => {
    const page = await open(t, fixture, 1600);
    await run(page, 'wide');
    await openInspector(page);
    await page.evaluate(() => window.insp.inspector().querySelector('input[aria-label="Filter keys and paths"]').focus());
    await page.keyboard.type('b');
    await page.waitForFunction(() => /Filter limited to the first 200,000 nodes/.test(window.insp.inspector().textContent), null, { timeout: 8000 });
  });

  test(`a dialog over the inspector takes Escape first; the layer leaves with the inspector (${fixture.label})`, async t => {
    const page = await open(t, fixture, 1600);
    await run(page, 'res');
    await openInspector(page);
    await page.evaluate(() => window.insp.openConfirm());
    await page.waitForFunction(() => window.insp.query('[role="dialog"].xray-confirm-modal, .xray-confirm-modal'));
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !window.insp.query('.xray-confirm-modal'));
    assert.equal(await has(page, '.xray-inspector'), true, 'the dialog closed, not the inspector');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !window.insp.inspector());
    // Unmounted with the Console tab: no stale layer keeps the panel from closing.
    await openInspector(page);
    await page.evaluate(() => window.insp.tab('rules'));
    await page.waitForFunction(() => !window.insp.query('.xray-console-run'));
    await page.evaluate(() => document.body.focus());
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !window.insp.storeOpen());
  });
}

const shotDir = fileURLToPath(new URL('../../output/console-redesign/task-5/', import.meta.url));
mkdirSync(shotDir, { recursive: true });
for (const [width, theme] of [[1600, 'xray-dark'], [760, 'xray-light'], [420, 'midnight']]) {
  test(`screenshot: big result and inspector (${width}, ${theme})`, async t => {
    const page = await open(t, { shadow:false, mode:'window' }, width, 760, theme);
    await run(page, 'small');
    await run(page, 'res');
    await page.screenshot({ path: `${shotDir}/big-result-${width}.png` });
    await openInspector(page, 1);
    await click(page, '.xray-inspector .xray-json-toggle[title="Expand users"]');
    await click(page, '.xray-inspector .xray-json-toggle[title="Expand [0]"]');
    await clickRow(page, '"name"');
    await page.waitForTimeout(80);
    await page.screenshot({ path: `${shotDir}/inspector-${width}.png` });
  });
}
