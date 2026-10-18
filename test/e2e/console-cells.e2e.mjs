import assert from 'node:assert/strict';
import { existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { before, after } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';

// Console command cells (spec C1–C5) and run state (P11) on the real App, store,
// virtualized stream and stylesheet. Only the evaluation bridge (XRAY_Console),
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
      import styles from './src/panel/styles.css';
      const USERS = [{id:1,name:'Ada'},{id:2,name:'Linus'}];
      const RESPONSES = {
        answer: {type:'number',result:42},
        users: {type:'array',result:USERS},
        nested: {type:'object',result:{meta:{page:1,tags:['a','b']},ok:true}},
        'res.data.length': {type:'error',error:{message:"Cannot read properties of undefined (reading 'length')"}},
        multi: {type:'string',result:'two lines'},
        // Spec J8: the engine hands the panel the typed model (Task 4's "$xray" envelopes).
        bigres: {type:'bigint',result:{$xray:'bigint',value:'9007199254740993'}},
        specials: {type:'array',result:[{$xray:'number',value:'NaN'},{$xray:'number',value:'-0'},{$xray:'undefined'},{$xray:'number',value:'Infinity'}]},
        amap: {type:'object',result:{$xray:'map',size:1,entries:[[1,{a:1}]]}},
        capped: {type:'array',result:{$xray:'array',items:Array(1000).fill(1),length:5000},truncated:true},
        forged: {type:'object',result:{$xray:'object',entries:[['$xray','bigint'],['value','1']]}},
        // Audit #28: data shaped like the old table() marker is data.
        lookalike: {type:'object',result:{__xr_render:'table',data:[{a:1},{a:2}]}},
      };
      window.cells = {
        root: null, calls: [], vars: {}, copied: null, pending: null,
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
              if (code === 'slow') return new Promise(resolve => { self.pending = resolve; });
              return Promise.resolve(RESPONSES[code] || RESPONSES[code.split('\\n')[0]] || {type:'undefined'});
            },
          };
          usePanelStore.setState({open:true,activeTab:'console',consoleMiniTab:'console',
            selectedId:null,expandedId:null,entries:[],consoleEvents:[],recording:true,consoleDraft:'',
            settings:{...usePanelStore.getState().settings,panelWidth:width,theme}});
          flushSync(() => {
            usePanelStore.getState().addEntry({id:'context',type:'api',method:'GET',status:200,
              source:'fetch',url:'https://example.test/users',urlPath:'/users',timestamp:1000,duration:100,size:1000,
              responseHeaders:{'content-type':'application/json'},responseRaw:'{"ok":true}'});
            usePanelStore.getState().addConsoleEvent({id:'log-1',type:'log',level:'info',timestamp:1000,message:'page says hello'});
            usePanelStore.setState({selectedId:'context'});
            createRoot(mount).render(<App mode={mode} />);
          });
        },
        tab(name) { flushSync(() => usePanelStore.setState({activeTab:name})); },
        draft(code) { flushSync(() => usePanelStore.getState().setConsoleDraft(code)); },
        confirmation(on) { flushSync(() => usePanelStore.setState({ settings: { ...usePanelStore.getState().settings, confirmDestructiveActions: on } })); },
        draftValue() { return usePanelStore.getState().consoleDraft; },
        // How long the current run has been going (store time), or -1 with none.
        runAge() { const run = usePanelStore.getState().consoleRun; return run ? Date.now() - run.startedAt : -1; },
        resolvePending(value) { const resolve = this.pending; this.pending = null; resolve?.(value); },
        query(selector) { return this.root.querySelector(selector); },
        cells() { return [...this.root.querySelectorAll('.xray-command-cell')]; },
        // Centre of an element (optionally inside cell N), scrolled into view first.
        box(selector, cellIndex) {
          const scope = cellIndex == null ? this.root : this.cells()[cellIndex];
          const el = selector ? scope?.querySelector(selector) : scope;
          if (!el) return null;
          el.scrollIntoView({block:'nearest'});
          const r = el.getBoundingClientRect();
          return {x:r.x + r.width / 2, y:r.y + r.height / 2, width:r.width, height:r.height};
        },
        cellText(i) { return this.cells()[i]?.textContent || ''; },
        streamText() { return this.query('.xray-console-stream')?.textContent || ''; },
        has(selector, cellIndex) {
          const scope = cellIndex == null ? this.root : this.cells()[cellIndex];
          return Boolean(scope?.querySelector(selector));
        },
        attr(selector, name, cellIndex) {
          const scope = cellIndex == null ? this.root : this.cells()[cellIndex];
          return scope?.querySelector(selector)?.getAttribute(name) ?? null;
        },
        headers(cellIndex) {
          return [...(this.cells()[cellIndex]?.querySelectorAll('table th') || [])].map(th => th.textContent);
        },
        colHeaders(cellIndex) {
          return [...(this.cells()[cellIndex]?.querySelectorAll('table thead th[scope="col"]') || [])].map(th => th.textContent);
        },
        activeLabel() {
          let el = this.root.activeElement || document.activeElement;
          return el?.getAttribute?.('aria-label') || el?.tagName || null;
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
  await page.setContent('<style>body{margin:0;min-height:100vh}</style>');
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(args => window.cells.setup(args.shadow, args.mode, args.width, args.theme), { ...fixture, width, theme });
  await page.waitForFunction(() => window.cells.query('.xray-console-run'));
  return page;
}

async function click(page, selector, cellIndex) {
  const box = await page.evaluate(([s, i]) => window.cells.box(s, i), [selector, cellIndex ?? null]);
  assert.ok(box, `no element for ${selector} in cell ${cellIndex}`);
  assert.ok(box.width > 0 && box.height > 0, `${selector} is not visible`);
  await page.mouse.click(box.x, box.y);
}

async function run(page, code) {
  await page.evaluate(code => window.cells.draft(code), code);
  await click(page, '.xray-console-run');
}

const cellCount = page => page.evaluate(() => window.cells.cells().length);
const cellText = (page, i) => page.evaluate(i => window.cells.cellText(i), i);
const has = (page, selector, i) => page.evaluate(([s, i]) => window.cells.has(s, i), [selector, i ?? null]);
const attr = (page, selector, name, i) => page.evaluate(([s, n, i]) => window.cells.attr(s, n, i), [selector, name, i ?? null]);
const calls = page => page.evaluate(() => window.cells.calls.slice());

async function waitForCellText(page, i, pattern) {
  await page.waitForFunction(([i, source]) => new RegExp(source).test(window.cells.cellText(i)), [i, pattern.source], { timeout: 4000 });
}

for (const fixture of [
  { shadow:false, mode:'window', label:'document' },
  { shadow:true, mode:'hud', label:'closed shadow' },
]) {
  for (const width of [420, 1600]) {
    const label = `${fixture.label} ${width}`;

    test(`a scalar result renders once, inside the command's cell (${label})`, async t => {
      const page = await open(t, fixture, width);
      await run(page, 'answer');
      await waitForCellText(page, 0, /42/);
      assert.equal(await cellCount(page), 1, 'one cell per command');
      const text = await cellText(page, 0);
      assert.match(text, /answer/);
      assert.match(text, /number/);
      // A run time ("42 ms") or a log's clock time ("10:42:05") can contain 42 too: count the value only.
      const stream = (await page.evaluate(() => window.cells.streamText())).replace(/\d+ ms|\d\d:\d\d:\d\d/g, '');
      assert.equal((stream.match(/42/g) || []).length, 1, `42 must appear once in the stream: ${stream}`);
      assert.equal(await has(page, '.xray-console-row.result'), false, 'no separate result row');
      assert.match(stream, /page says hello/, 'page logs keep rendering');
      assert.deepEqual(await page.evaluate(() => window.cells.vars.$_), 42, '$_ holds the last successful result');
      assert.match(await page.evaluate(() => window.cells.cells()[0].querySelector('.xray-cell-time')?.textContent || ''), /^\d+ ms$/, 'run time shown');
    });

    test(`a multi-line command shows its first line and a line count (${label})`, async t => {
      const page = await open(t, fixture, width);
      await run(page, 'multi\n// second line\n// third line');
      await waitForCellText(page, 0, /two lines/);
      assert.equal(await page.evaluate(() => window.cells.cells()[0].querySelector('.xray-cell-command').textContent), 'multi');
      assert.equal(await page.evaluate(() => window.cells.cells()[0].querySelector('.xray-cell-lines')?.textContent), '3 lines');
    });

    test(`array of objects renders a table; Tree/JSON switch; Copy and Save as variable (${label})`, async t => {
      const page = await open(t, fixture, width);
      await run(page, 'users');
      await page.waitForFunction(() => window.cells.has('table', 0));
      assert.deepEqual(await page.evaluate(() => window.cells.colHeaders(0)), ['id', 'name'], 'column headers in thead');
      assert.equal(await attr(page, 'table', 'aria-label', 0), 'Result table');
      assert.deepEqual(await page.evaluate(() => window.cells.headers(0)), ['id', 'name']);
      assert.match(await cellText(page, 0), /array · 2 items/);
      assert.equal(await attr(page, 'button[aria-label="Table view"]', 'aria-pressed', 0), 'true');
      await click(page, 'button[aria-label="Tree view"]', 0);
      assert.equal(await attr(page, 'button[aria-label="Tree view"]', 'aria-pressed', 0), 'true');
      assert.equal(await attr(page, 'button[aria-label="Table view"]', 'aria-pressed', 0), 'false');
      assert.equal(await has(page, '.xray-json-tree', 0), true);
      assert.equal(await has(page, 'table', 0), false);
      await click(page, 'button[aria-label="JSON view"]', 0);
      assert.equal(await attr(page, 'button[aria-label="JSON view"]', 'aria-pressed', 0), 'true');
      assert.match(await cellText(page, 0), /"name": "Ada"/);
      await click(page, 'button[aria-label="Copy result"]', 0);
      await page.waitForFunction(() => window.cells.copied !== null);
      assert.deepEqual(JSON.parse(await page.evaluate(() => window.cells.copied)), [{id:1,name:'Ada'},{id:2,name:'Linus'}]);
      await click(page, 'button[aria-label="Save as variable"]', 0);
      await waitForCellText(page, 0, /temp1/);
      assert.equal(await page.evaluate(() => window.cells.activeLabel()), 'Copy result', 'focus stays in the cell after Save');
      assert.deepEqual(await page.evaluate(() => window.cells.vars.temp1), [{id:1,name:'Ada'},{id:2,name:'Linus'}]);
    });

    test(`typed results show their values, never envelopes; caps are stated (J8, ${label})`, async t => {
      const page = await open(t, fixture, width);
      await run(page, 'bigres');
      await waitForCellText(page, 0, /9007199254740993n/);
      assert.match(await cellText(page, 0), /bigint/);
      await click(page, 'button[aria-label="Copy result"]', 0);
      await page.waitForFunction(() => window.cells.copied !== null);
      assert.equal(await page.evaluate(() => window.cells.copied), '9007199254740993n');
      assert.deepEqual(await page.evaluate(() => window.cells.vars.$_), {$xray:'bigint',value:'9007199254740993'}, '$_ keeps the typed value for the page');

      await run(page, 'specials');
      await page.waitForFunction(() => window.cells.has('.xray-json-tree', 1));
      const specials = await cellText(page, 1);
      for (const text of ['NaN', '-0', 'undefined', 'Infinity']) assert.ok(specials.includes(text), `${text} in ${specials}`);
      assert.doesNotMatch(specials, /null/);

      await run(page, 'amap');
      await waitForCellText(page, 2, /Map\(1\)/);
      assert.match(await cellText(page, 2), /Map · 1 entries|Map · 1 entry/);

      await run(page, 'capped');
      await waitForCellText(page, 3, /Showing 1,000 of 5,000 items/);
      assert.match(await cellText(page, 3), /array · 5000 items/);

      await run(page, 'forged');
      await waitForCellText(page, 4, /object · 2 keys/);
      await click(page, 'button[aria-label="JSON view"]', 4);
      assert.match(await cellText(page, 4), /"\$xray": "bigint"/, 'a listed object shows its own "$xray" key as data');
      const stream = await page.evaluate(() => window.cells.streamText());
      assert.equal((stream.match(/\$xray/g) || []).length, 1, `no envelope leaks: ${stream}`);
      assert.equal(await page.evaluate(() => window.cells.query('.xray-prompt > .xray-visually-hidden[aria-live]').textContent.includes('$xray":"bigint')), true, 'the announcement reads the data');

      await run(page, 'lookalike');
      await waitForCellText(page, 5, /object · 2 keys/);
      assert.equal(await has(page, 'table', 5), false, 'a "__xr_render" key is not a render instruction');
      assert.deepEqual(await page.evaluate(() => window.cells.vars.$_), {__xr_render:'table',data:[{a:1},{a:2}]}, '$_ is the object itself');
    });

    test(`an object result defaults to Tree with no Table option (${label})`, async t => {
      const page = await open(t, fixture, width);
      await run(page, 'nested');
      await page.waitForFunction(() => window.cells.has('.xray-json-tree', 0));
      assert.equal(await has(page, 'button[aria-label="Table view"]', 0), false);
      assert.equal(await attr(page, 'button[aria-label="Tree view"]', 'aria-pressed', 0), 'true');
      assert.match(await cellText(page, 0), /object · 2 keys/);
    });

    test(`an error shows its message and a local hint, without a fake stack (${label})`, async t => {
      const page = await open(t, fixture, width);
      await run(page, 'res.data.length');
      await waitForCellText(page, 0, /Cannot read properties/);
      const text = await cellText(page, 0);
      assert.match(text, /res is the response body itself\. Try Object\.keys\(res\)\./);
      assert.doesNotMatch(text, /No stack trace available/);
      assert.equal(await has(page, '.xray-cell-stack', 0), false, 'no stack disclosure without a real stack');
      assert.equal(await cellCount(page), 1);
    });

    test(`Re-run, Edit in prompt and Delete cell (${label})`, async t => {
      const page = await open(t, fixture, width);
      await run(page, 'answer');
      await waitForCellText(page, 0, /42/);
      await click(page, 'button[aria-label="Re-run"]', 0);
      await page.waitForFunction(() => window.cells.cells().length === 2 && /42/.test(window.cells.cellText(1)));
      assert.deepEqual(await calls(page), ['answer', 'answer']);
      await page.evaluate(() => window.cells.draft(''));
      await click(page, 'button[aria-label="Edit in prompt"]', 0);
      assert.equal(await page.evaluate(() => window.cells.draftValue()), 'answer');
      await page.waitForFunction(() => window.cells.query('[aria-label="Console command"]').value === 'answer');
      await click(page, 'button[aria-label="More cell actions"]', 1);
      assert.equal(await attr(page, 'button[aria-label="More cell actions"]', 'aria-expanded', 1), 'true');
      await click(page, 'button[aria-label="Delete cell"]', 1);
      await page.waitForFunction(() => window.cells.cells().length === 1);
      assert.deepEqual(await calls(page), ['answer', 'answer'], 'delete does not evaluate');
    });

    test(`a slow run shows Running…, offers Cancel after 2 s, and drops the late result (${label})`, async t => {
      const page = await open(t, fixture, width);
      await run(page, 'slow');
      await waitForCellText(page, 0, /Running…/);
      assert.equal(await page.evaluate(() => window.cells.cells()[0].querySelector('button[aria-label="Re-run"]').disabled), true, 'Re-run disabled while running');
      assert.deepEqual(await calls(page), ['slow'], 'execute called once');
      assert.equal(await has(page, 'button[aria-label="Cancel run"]'), false, 'no Cancel before 2 s');
      await page.waitForFunction(() => window.cells.query('button[aria-label="Cancel run"]'), null, { timeout: 4000 });
      assert.ok(await page.evaluate(() => window.cells.runAge()) >= 2000, 'Cancel appears after 2 s');
      await click(page, 'button[aria-label="Cancel run"]');
      await waitForCellText(page, 0, /Cancelled/);
      await page.evaluate(() => window.cells.resolvePending({type:'number',result:777}));
      await page.waitForTimeout(150);
      const text = await cellText(page, 0);
      assert.match(text, /Cancelled/);
      assert.doesNotMatch(text, /777/);
      assert.doesNotMatch(await page.evaluate(() => window.cells.streamText()), /777/);
      assert.equal(await page.evaluate(() => window.cells.vars.$_), undefined, 'a discarded result does not become $_');
      assert.equal(await has(page, 'button[aria-label="Cancel run"]'), false);
      assert.equal(await attr(page, '.xray-console-run', 'aria-label'), 'Run');
      await run(page, 'answer');
      await page.waitForFunction(() => window.cells.cells().length === 2 && /42/.test(window.cells.cellText(1)), null, { timeout: 4000 });
      assert.deepEqual(await calls(page), ['slow', 'answer'], 'Run works after Cancel');
    });

    test(`Clear console mid-run frees the prompt and drops the late result (${label})`, async t => {
      const page = await open(t, fixture, width);
      await run(page, 'slow');
      await waitForCellText(page, 0, /Running…/);
      // Clear is a menu (spec S6); "Clear everything" is the old single action.
      await click(page, 'button[aria-label="Clear console"]');
      await page.waitForFunction(() => window.cells.query('[aria-label="Clear console options"]'));
      const everything = await page.evaluate(() => {
        const el = [...window.cells.root.querySelectorAll('[aria-label="Clear console options"] button')].find(b => b.textContent.trim() === 'Clear everything');
        const r = el.getBoundingClientRect();
        return {x:r.x + r.width / 2, y:r.y + r.height / 2};
      });
      await page.mouse.click(everything.x, everything.y);
      await page.waitForFunction(() => window.cells.query('.xray-confirm-modal'));
      assert.match(await page.evaluate(() => window.cells.query('.xray-confirm-message').textContent), /saved variables/);
      await click(page, '.xray-confirm-modal .xray-btn.danger');
      await page.waitForFunction(() => window.cells.cells().length === 0);
      await page.evaluate(() => window.cells.draft('answer'));
      assert.equal(await page.evaluate(() => window.cells.query('.xray-console-run').disabled), false, 'Run enabled at once');
      assert.equal(await attr(page, '.xray-console-run', 'aria-label'), 'Run');
      assert.equal(await has(page, 'button[aria-label="Cancel run"]'), false);
      await page.evaluate(() => window.cells.resolvePending({type:'number',result:777}));
      await page.waitForTimeout(150);
      assert.doesNotMatch(await page.evaluate(() => window.cells.streamText()), /777/, 'no orphan result row');
      assert.equal(await page.evaluate(() => window.cells.vars.$_), undefined);
      await click(page, '.xray-console-run');
      await page.waitForFunction(() => window.cells.cells().length === 1 && /42/.test(window.cells.cellText(0)), null, { timeout: 4000 });
      assert.deepEqual(await calls(page), ['slow', 'answer']);
    });

    test(`Clear console follows Confirm destructive actions through the real control (${label})`, async t => {
      for (const confirmation of [true, false]) {
        const page = await open(t, fixture, width);
        await page.evaluate(on => window.cells.confirmation(on), confirmation);
        await run(page, 'answer');
        await page.waitForFunction(() => window.cells.cells().length === 1 && /42/.test(window.cells.cellText(0)), null, { timeout: 4000 });
        await click(page, 'button[aria-label="Clear console"]');
        await page.waitForFunction(() => window.cells.query('[aria-label="Clear console options"]'));
        const everything = await page.evaluate(() => {
          const el = [...window.cells.root.querySelectorAll('[aria-label="Clear console options"] button')].find(b => b.textContent.trim() === 'Clear everything');
          const r = el.getBoundingClientRect();
          return {x:r.x + r.width / 2, y:r.y + r.height / 2};
        });
        await page.mouse.click(everything.x, everything.y);
        if (confirmation) {
          await page.waitForFunction(() => window.cells.query('.xray-confirm-modal'));
          assert.equal(await page.evaluate(() => window.cells.cells().length), 1, 'nothing cleared until confirmed');
        } else {
          await page.waitForFunction(() => window.cells.cells().length === 0);
          assert.equal(await page.evaluate(() => Boolean(window.cells.query('.xray-confirm-modal'))), false, 'runs immediately, no dialog');
        }
      }
    });

    test(`leaving the Console mid-run keeps Running…, Cancel and the run guard (${label})`, async t => {
      const page = await open(t, fixture, width);
      await run(page, 'slow');
      await waitForCellText(page, 0, /Running…/);
      await page.evaluate(() => window.cells.tab('api'));
      await page.waitForFunction(() => !window.cells.query('.xray-console-run'));
      // Away from the Console (nothing of it is mounted) until the run is 2 s old.
      await page.waitForFunction(() => window.cells.runAge() >= 2050, null, { timeout: 4000 });
      await page.evaluate(() => window.cells.tab('console'));
      await page.waitForFunction(() => window.cells.query('.xray-console-run'));
      await waitForCellText(page, 0, /Running…/);
      assert.equal(await has(page, 'button[aria-label="Cancel run"]'), true, 'Cancel shows at once after 2 s elapsed away');
      assert.equal(await page.evaluate(() => window.cells.query('.xray-console-run').disabled), true, 'Run disabled');
      assert.equal(await page.evaluate(() => window.cells.cells()[0].querySelector('button[aria-label="Re-run"]').disabled), true);
      await page.evaluate(() => window.cells.draft('answer'));
      await page.evaluate(() => window.cells.query('[aria-label="Console command"]').focus());
      await page.keyboard.press('Enter');
      await page.waitForTimeout(100);
      assert.deepEqual(await calls(page), ['slow'], 'no concurrent second run');
      await click(page, 'button[aria-label="Cancel run"]');
      await waitForCellText(page, 0, /Cancelled/);
      await page.evaluate(() => window.cells.resolvePending({type:'number',result:777}));
      await page.waitForTimeout(150);
      assert.doesNotMatch(await page.evaluate(() => window.cells.streamText()), /777/);
    });
  }
}

const shotDir = fileURLToPath(new URL('../../output/console-redesign/task-4/', import.meta.url));
mkdirSync(shotDir, { recursive: true });
for (const [width, theme] of [[1600, 'xray-dark'], [760, 'xray-light'], [420, 'midnight']]) {
  test(`screenshot: scalar, table, tree, error and running cells (${width}, ${theme})`, async t => {
    const page = await open(t, { shadow:false, mode:'window' }, width, 900, theme);
    for (const [index, code] of ['answer', 'users', 'nested', 'res.data.length'].entries()) {
      await run(page, code);
      await page.waitForFunction(n => window.cells.cells().length === n && !/Running…/.test(window.cells.cellText(n - 1)), index + 1, { timeout: 4000 });
    }
    await run(page, 'slow');
    await waitForCellText(page, 4, /Running…/);
    await page.waitForFunction(() => window.cells.query('button[aria-label="Cancel run"]'), null, { timeout: 4000 });
    await page.screenshot({ path: `${shotDir}/cells-${width}.png` });
    // Bottom cell: the More menu opens upward, over the previous cell.
    await click(page, 'button[aria-label="More cell actions"]', 3);
    await page.waitForTimeout(80);
    await page.screenshot({ path: `${shotDir}/cells-${width}-menu-bottom.png` });
    await page.keyboard.press('Escape');
    await page.evaluate(() => window.cells.resolvePending({type:'undefined'}));
    await page.waitForTimeout(200);
    // Top of the stream: the scalar cell, with its More menu opening downward.
    await page.evaluate(() => { window.cells.query('.xray-console-stream').scrollTop = 0; });
    await page.waitForTimeout(120);
    await click(page, 'button[aria-label="More cell actions"]', 0);
    await page.waitForTimeout(80);
    await page.screenshot({ path: `${shotDir}/cells-${width}-top.png` });
  });
}
