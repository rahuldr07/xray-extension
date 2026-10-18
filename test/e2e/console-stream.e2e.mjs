import assert from 'node:assert/strict';
import { existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { before, after } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';

// Console stream (spec S1–S6) on the real App, store, virtualized stream and
// stylesheet: one timeline of command cells and page logs, filter chips with
// counts, repeat collapsing, source locations, jump-to-latest and Clear ▾.
// Only the evaluation bridge (XRAY_Console) and persistence are stubbed.
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
      const RESPONSES = {
        answer: {type:'number',result:42},
        'users.filter(u => u.active)': {type:'array',result:[{id:1}]},
        'res.data.length': {type:'error',error:{message:"Cannot read properties of undefined (reading 'length')"}},
      };
      const ERROR_ARG = {__type__:'Error',name:'TypeError',message:'x is undefined',
        stack:'TypeError: x is undefined\\n    at render (https://example.test/static/main.js:30:12)\\n    at boot (https://example.test/static/vendor.js:9:1)'};
      let seq = 0;
      const log = (message, level = 'log', extra = {}) => ({id:'log-' + (++seq), type:'log', level, timestamp:1000 + seq, message, ...extra});
      window.stream = {
        root: null, calls: [], vars: {}, cleared: 0,
        fixtures: {
          // 2 commands (1 failed), 6 page logs (1 warning, 1 error).
          mixed() {
            return [
              log('boot ok'),
              {id:'c1', type:'command', level:'info', timestamp:1100, message:'users.filter(u => u.active)', args:['users.filter(u => u.active)'], commandId:'c1'},
              {id:'res_c1', type:'result', level:'info', timestamp:1101, message:'[{"id":1}]', data:[{id:1}], commandId:'c1', resultType:'array'},
              log('fetching users', 'info'),
              log('deprecated api', 'warn'),
              {id:'c2', type:'command', level:'info', timestamp:1200, message:'res.data.length', args:['res.data.length'], commandId:'c2'},
              {id:'res_c2', type:'error', level:'error', timestamp:1201, message:"Cannot read properties of undefined (reading 'length')", data:{message:"Cannot read properties of undefined (reading 'length')"}, commandId:'c2'},
              log('TypeError: x is undefined', 'error', {args:[ERROR_ARG]}),
              log('cache miss'),
              log('render done'),
            ];
          },
          repeats() {
            return [log('poll start'), ...Array.from({length:14}, () => log('heartbeat')), log('poll end')];
          },
          big() {
            const big = Object.fromEntries(Array.from({length:60}, (_, i) => ['key' + i, i]));
            return [log('small'), log('big state', 'log', {args:[big]})];
          },
          showcase() {
            return [...this.mixed(), ...Array.from({length:14}, () => log('heartbeat: socket alive')), log('poll end'),
              ...this.big()];
          },
          mixedTail() { return [...this.mixed(), ...this.many(60)]; },
          many(n = 80) { return Array.from({length:n}, (_, i) => log('line ' + i)); },
        },
        setup(shadow, mode, width, fixture, theme = 'operator') {
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
            setVar(name, value){ self.vars[name] = value; },
            getVar(name){ return self.vars[name]; },
            getScope(){ return {...self.vars}; },
            clearVariables(){ self.cleared += 1; self.vars = {}; },
            execute(code) { self.calls.push(code); return Promise.resolve(RESPONSES[code] || {type:'undefined'}); },
          };
          usePanelStore.setState({open:true,activeTab:'console',consoleMiniTab:'console',
            selectedId:null,expandedId:null,entries:[],consoleEvents:this.fixtures[fixture](),recording:true,consoleDraft:'',
            settings:{...usePanelStore.getState().settings,panelWidth:width,theme}});
          flushSync(() => createRoot(mount).render(<App mode={mode} />));
        },
        append(n, prefix = 'burst') {
          const events = Array.from({length:n}, (_, i) => log(prefix + ' ' + i));
          flushSync(() => usePanelStore.setState({consoleEvents:[...usePanelStore.getState().consoleEvents, ...events]}));
        },
        draft(code) { flushSync(() => usePanelStore.getState().setConsoleDraft(code)); },
        query(selector) { return this.root.querySelector(selector); },
        all(selector) { return [...this.root.querySelectorAll(selector)]; },
        cells() { return this.all('.xray-command-cell'); },
        logRows() { return this.all('.xray-console-row'); },
        chips() { return this.all('.xray-console-levels .xray-chip').map(b => b.textContent); },
        box(selector) {
          const el = typeof selector === 'string' ? this.query(selector) : selector;
          if (!el) return null;
          el.scrollIntoView({block:'nearest'});
          const r = el.getBoundingClientRect();
          return {x:r.x + r.width / 2, y:r.y + r.height / 2, width:r.width, height:r.height};
        },
        buttonBox(text) {
          const el = this.all('button').find(b => b.textContent.trim().startsWith(text));
          return el ? this.box(el) : null;
        },
        stream() { return this.query('.xray-console-stream'); },
        streamText() { return this.stream()?.textContent || ''; },
        atBottom() { const el = this.stream(); return el.scrollHeight - el.scrollTop - el.clientHeight < 48; },
        active() { const el = this.root.activeElement || document.activeElement; return el?.getAttribute?.('aria-label') || el?.tagName || null; },
        eventTypes() { return usePanelStore.getState().consoleEvents.map(e => e.type); },
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

async function open(t, { shadow, mode }, width, fixtureName, height = 760, theme) {
  const page = await browser.newPage({ viewport: { width, height } });
  t.after(() => page.close());
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  t.after(() => assert.deepEqual(errors, [], 'page errors'));
  await page.setContent('<style>body{margin:0;min-height:100vh}</style>');
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(args => window.stream.setup(args.shadow, args.mode, args.width, args.fixtureName, args.theme), { shadow, mode, width, fixtureName, theme });
  await page.waitForFunction(() => window.stream.query('.xray-console-run'));
  return page;
}

async function clickBox(page, box, what) {
  assert.ok(box, `no element for ${what}`);
  assert.ok(box.width > 0 && box.height > 0, `${what} is not visible`);
  await page.mouse.click(box.x, box.y);
}
const click = async (page, selector) => clickBox(page, await page.evaluate(s => window.stream.box(s), selector), selector);
const clickButton = async (page, text) => clickBox(page, await page.evaluate(t => window.stream.buttonBox(t), text), text);
const ev = (page, fn, arg) => page.evaluate(fn, arg);
const scrollTop = page => page.evaluate(() => window.stream.stream().scrollTop);
// Resolves once the stream's scrollTop and scrollHeight have not moved for 10
// animation frames — longer than the pin settle beats (2 frames + 80 ms).
const waitStable = page => page.evaluate(() => new Promise(resolve => {
  const el = window.stream.stream();
  let last = '';
  let same = 0;
  const tick = () => {
    const now = el.scrollTop + ':' + el.scrollHeight;
    same = now === last ? same + 1 : 0;
    last = now;
    if (same >= 10) resolve();
    else requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}));

for (const fixture of [
  { shadow:false, mode:'window', label:'document' },
  { shadow:true, mode:'hud', label:'closed shadow' },
]) {
  for (const width of [420, 1600]) {
    const label = `${fixture.label} ${width}`;

    test(`chips count cells once and page logs per message; My commands shows only cells (${label})`, async t => {
      const page = await open(t, fixture, width, 'mixed');
      assert.deepEqual(await ev(page, () => window.stream.chips()),
        ['All8', 'My commands2', 'Page logs6', 'Warnings1', 'Errors2']);
      // S1: one chronological timeline — cells sit between the page logs around them.
      const order = await ev(page, () => [...window.stream.stream().querySelectorAll('.xray-command-cell, .xray-console-row')]
        .map(el => el.classList.contains('xray-command-cell') ? 'cell' : 'log'));
      assert.deepEqual(order, ['log', 'cell', 'log', 'log', 'cell', 'log', 'log', 'log']);
      await clickButton(page, 'My commands');
      await page.waitForFunction(() => window.stream.logRows().length === 0);
      assert.equal(await ev(page, () => window.stream.cells().length), 2);
      await clickButton(page, 'Page logs');
      await page.waitForFunction(() => window.stream.cells().length === 0);
      assert.equal(await ev(page, () => window.stream.logRows().length), 6);
      await clickButton(page, 'Errors');
      await page.waitForFunction(() => window.stream.cells().length === 1);
      assert.equal(await ev(page, () => window.stream.logRows().length), 1, 'the page error and the failed command');
      assert.match(await ev(page, () => window.stream.cells()[0].textContent), /res\.data\.length/);
    });

    test(`text filter matches command source, also under a level chip (${label})`, async t => {
      const page = await open(t, fixture, width, 'mixed');
      const input = fixture.shadow ? null : page.getByLabel('Filter console messages');
      if (input) await input.fill('u.active');
      else {
        await click(page, 'input[aria-label="Filter console messages"]');
        await page.keyboard.type('u.active');
      }
      await page.waitForFunction(() => window.stream.cells().length === 1 && window.stream.logRows().length === 0);
      assert.match(await ev(page, () => window.stream.cells()[0].textContent), /users\.filter/);
      // Errors + a query matching the failed command's source (not its message).
      await ev(page, () => { const el = window.stream.query('input[aria-label="Filter console messages"]'); el.select(); });
      await page.keyboard.type('data.len');
      await clickButton(page, 'Errors');
      await page.waitForFunction(() => window.stream.cells().length === 1);
      assert.match(await ev(page, () => window.stream.cells()[0].textContent), /res\.data\.length/);
    });

    test(`14 identical consecutive logs collapse into one ×14 line (${label})`, async t => {
      const page = await open(t, fixture, width, 'repeats');
      assert.equal(await ev(page, () => window.stream.logRows().length), 3);
      const badge = await ev(page, () => window.stream.logRows()[1].querySelector('.xray-repeat-badge')?.textContent);
      assert.equal(badge, '×14');
      assert.deepEqual(await ev(page, () => window.stream.chips()), ['All16', 'My commands0', 'Page logs16', 'Warnings0', 'Errors0']);
      assert.match(await ev(page, () => window.stream.all('.xray-console-levels .xray-chip')[2].title), /including repeats/, 'the count says repeats count individually');
    });

    test(`a page error shows its main.js:30 source; a big object offers Open in inspector (${label})`, async t => {
      const page = await open(t, fixture, width, 'mixed');
      const sources = await ev(page, () => window.stream.all('.xray-console-row .xray-console-source').map(el => el.textContent));
      assert.deepEqual(sources, ['main.js:30'], 'only the row that carries a location shows one');
      await page.close();
      const big = await open(t, fixture, width, 'big');
      assert.equal(await ev(big, () => window.stream.all('.xray-console-row button[aria-label="Open in inspector"]').length), 1);
      await click(big, '.xray-console-row button[aria-label="Open in inspector"]');
      await big.waitForFunction(() => window.stream.query('.xray-inspector'));
    });

    test(`Clear ▾: my commands, then page logs, each confirmed (${label})`, async t => {
      const page = await open(t, fixture, width, 'mixed');
      await click(page, 'button[aria-label="Clear console"]');
      assert.equal(await ev(page, () => window.stream.query('button[aria-label="Clear console"]').getAttribute('aria-expanded')), 'true');
      assert.deepEqual(await ev(page, () => window.stream.all('[role="group"][aria-label="Clear console options"] button').map(b => b.textContent.trim())),
        ['Clear everything', 'Clear my commands', 'Clear page logs']);
      await clickButton(page, 'Clear my commands');
      await page.waitForFunction(() => window.stream.query('.xray-confirm-modal'));
      assert.match(await ev(page, () => window.stream.query('.xray-confirm-message').textContent), /Page logs stay/);
      await click(page, '.xray-confirm-modal .xray-btn.danger');
      await page.waitForFunction(() => window.stream.cells().length === 0);
      assert.equal(await ev(page, () => window.stream.logRows().length), 6, 'page logs remain');
      assert.equal(await ev(page, () => window.stream.cleared), 1, 'saved variables cleared with commands');
      await click(page, 'button[aria-label="Clear console"]');
      await clickButton(page, 'Clear page logs');
      await page.waitForFunction(() => window.stream.query('.xray-confirm-modal'));
      assert.match(await ev(page, () => window.stream.query('.xray-confirm-message').textContent), /commands, results and saved variables stay/);
      await click(page, '.xray-confirm-modal .xray-btn.danger');
      await page.waitForFunction(() => window.stream.logRows().length === 0);
      assert.equal(await ev(page, () => window.stream.cleared), 1, 'clearing page logs keeps variables');
    });
  }

  test(`scrolled up: 300 appended logs keep scroll and focus; the pill jumps to latest (${fixture.label})`, async t => {
    const page = await open(t, fixture, 760, 'many');
    await page.waitForFunction(() => window.stream.atBottom());
    await waitStable(page);
    await ev(page, () => window.stream.query('[aria-label="Console command"]').focus());
    await ev(page, () => { window.stream.stream().scrollTop = 200; });
    await waitStable(page);
    const before = await scrollTop(page);
    assert.ok(Math.abs(before - 200) <= 1, `scrolled up to 200 (got ${before})`);
    assert.equal(await ev(page, () => window.stream.active()), 'Console command');
    await ev(page, () => window.stream.append(300));
    await page.waitForFunction(() => /^300 new messages/.test(window.stream.query('.xray-newmsg-pill')?.textContent || ''));
    await waitStable(page);
    const after = await scrollTop(page);
    assert.ok(Math.abs(after - before) <= 1, `scroll position held (${before} -> ${after})`);
    assert.equal(await ev(page, () => window.stream.active()), 'Console command', 'editor keeps focus');
    const pill = await ev(page, () => window.stream.query('.xray-newmsg-pill')?.textContent || '');
    assert.match(pill, /^300 new messages/);
    assert.match(pill, /Jump to latest/);
    await click(page, '.xray-newmsg-pill');
    await page.waitForFunction(() => !window.stream.query('.xray-newmsg-pill') && /burst 299/.test(window.stream.streamText()));
    await waitStable(page);
    assert.equal(await ev(page, () => window.stream.atBottom()), true, 'jumped to the bottom');
  });

  test(`scrolled up: expanding a row and switching a cell's view keep the scroll position (${fixture.label})`, async t => {
    const page = await open(t, fixture, 760, 'mixedTail');
    await page.waitForFunction(() => window.stream.atBottom());
    await waitStable(page);
    await ev(page, () => { window.stream.stream().scrollTop = 20; });
    await waitStable(page);
    const before = await scrollTop(page);
    assert.ok(Math.abs(before - 20) <= 1, `scrolled up to 20 (got ${before})`);
    // Expand the TypeError line (its stack) — a row in view, below the scroll offset.
    await click(page, '.xray-console-row.is-error .xray-console-toggle');
    await page.waitForFunction(() => window.stream.query('.xray-console-row.is-error .xray-detail'));
    await waitStable(page);
    assert.ok(Math.abs(await scrollTop(page) - before) <= 1, 'expanding a row keeps the position');
    await click(page, '.xray-command-cell button[aria-label="Tree view"]');
    await page.waitForFunction(() => window.stream.query('.xray-command-cell button[aria-label="Tree view"]')?.getAttribute('aria-pressed') === 'true');
    await waitStable(page);
    assert.ok(Math.abs(await scrollTop(page) - before) <= 1, 'switching to Tree keeps the position');
    await click(page, '.xray-command-cell button[aria-label="Table view"]');
    await page.waitForFunction(() => window.stream.query('.xray-command-cell button[aria-label="Table view"]')?.getAttribute('aria-pressed') === 'true');
    await waitStable(page);
    assert.ok(Math.abs(await scrollTop(page) - before) <= 1, 'switching back to Table keeps the position');
    assert.equal(await ev(page, () => Boolean(window.stream.query('.xray-newmsg-pill'))), false, 'no new-messages pill for a re-layout');
  });

  test(`at the bottom, appended logs are followed (${fixture.label})`, async t => {
    const page = await open(t, fixture, 760, 'many');
    await page.waitForFunction(() => window.stream.atBottom());
    await waitStable(page);
    for (const n of [1, 20, 120]) {
      await ev(page, n => window.stream.append(n, 'follow' + n), n);
      await page.waitForFunction(n => new RegExp('follow' + n + ' ' + (n - 1) + '$').test(window.stream.logRows().at(-1)?.querySelector('.xray-console-message')?.textContent || ''), n);
      await waitStable(page);
      assert.equal(await ev(page, () => window.stream.atBottom()), true, `still at the bottom after ${n} appended`);
      assert.equal(await ev(page, () => Boolean(window.stream.query('.xray-newmsg-pill'))), false);
    }
  });

  test(`running a command while scrolled up scrolls to its cell (${fixture.label})`, async t => {
    const page = await open(t, fixture, 760, 'many');
    await ev(page, () => { window.stream.stream().scrollTop = 0; });
    await page.waitForTimeout(120);
    await ev(page, () => window.stream.draft('answer'));
    await click(page, '.xray-console-run');
    await page.waitForFunction(() => window.stream.cells().length === 1 && /42/.test(window.stream.cells()[0].textContent));
    await page.waitForTimeout(200);
    assert.equal(await ev(page, () => window.stream.atBottom()), true);
    const visible = await ev(page, () => {
      const cell = window.stream.cells()[0].getBoundingClientRect();
      const box = window.stream.stream().getBoundingClientRect();
      return cell.top >= box.top - 1 && cell.bottom <= box.bottom + 1;
    });
    assert.ok(visible, 'the new cell is in view');
  });
}

const shotDir = fileURLToPath(new URL('../../output/console-redesign/task-9/', import.meta.url));
mkdirSync(shotDir, { recursive: true });
for (const [width, theme] of [[1600, 'operator'], [760, 'light-lab'], [420, 'midnight']]) {
  test(`screenshot: mixed stream with ×14 repeats, the pill and the Clear ▾ menu (${width}, ${theme})`, async t => {
    const page = await open(t, { shadow:false, mode:'window' }, width, 'showcase', 760, theme);
    await page.waitForTimeout(150);
    await page.screenshot({ path: `${shotDir}/stream-${width}.png` });
    await ev(page, () => window.stream.append(60, 'tail'));
    await ev(page, () => { window.stream.stream().scrollTop = 0; });
    await page.waitForTimeout(120);
    await ev(page, () => window.stream.append(12, 'more'));
    await page.waitForTimeout(150);
    await page.screenshot({ path: `${shotDir}/pill-${width}.png` });
    await click(page, 'button[aria-label="Clear console"]');
    await page.waitForTimeout(80);
    await page.screenshot({ path: `${shotDir}/clear-menu-${width}.png` });
  });
}
