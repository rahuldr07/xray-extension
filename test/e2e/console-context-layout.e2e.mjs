import assert from 'node:assert/strict';
import { existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { before, after } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';

// Catch prompt/context tracks stealing the command width or output height. Use
// the real App, virtualized stream, store and stylesheet at both supported roots.
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
      window.consoleLayout = {
        setup(shadow, selected, mode = 'window', theme = 'operator') {
          const host = document.body.appendChild(document.createElement('div'));
          if (mode === 'hud') {
            host.style.width = '1600px';
            host.style.height = '100vh';
          }
          this.root = shadow ? host.attachShadow({mode:'closed'}) : document;
          const sheet = document.createElement('style'); sheet.textContent = styles;
          (shadow ? this.root : document.head).appendChild(sheet);
          const mount = shadow ? this.root.appendChild(document.createElement('div')) : host;
          mount.className = 'xray-app-root';
          window.XRAY_Store = {get:async()=>null,set:async()=>{}};
           usePanelStore.setState({open:true,activeTab:'console',consoleMiniTab:'console',
            selectedId:null,expandedId:null,entries:[],consoleEvents:[],recording:true,
            consoleDraft:'Object.keys(res)',snippets:[{id:'snippet',title:'Inspect response',code:'Object.keys(res)'}],
            settings:{...usePanelStore.getState().settings,panelWidth:960,theme}});
          flushSync(() => {
            usePanelStore.getState().addEntry({id:'context',type:'api',method:'GET',status:200,
              source:'fetch',url:'https://example.test/'+ 'long-endpoint-'.repeat(35),
              urlPath:'/'+ 'long-endpoint-'.repeat(35),timestamp:1000,duration:100,size:1000,
              responseHeaders:{'content-type':'application/json'},responseRaw:'{"ok":true}'});
            for (let i=0;i<80;i++) usePanelStore.getState().addConsoleEvent({
              id:'log-'+i,type:'log',level:'info',timestamp:1000+i,message:'Output message '+i});
            usePanelStore.setState({selectedId:selected?'context':null});
             createRoot(mount).render(<App mode={mode} />);
          });
        },
        query(selector) { return this.root.querySelector(selector); },
        // n more page logs: only the level chips' counts (and so their widths) change.
        moreLogs(n) {
          const events = usePanelStore.getState().consoleEvents;
          const extra = Array.from({length:n}, (_, i) => ({id:'more-'+i,type:'log',level:i % 2 ? 'warn' : 'error',timestamp:2000+i,message:'More '+i}));
          flushSync(() => usePanelStore.setState({consoleEvents:[...events, ...extra]}));
        },
        levels() {
          const row = this.query('.xray-console-levels');
          return {overflow: row.dataset.overflow, clipped: row.scrollWidth > row.clientWidth + 1, scrollWidth: row.scrollWidth, clientWidth: row.clientWidth};
        },
        snippetCount() { return usePanelStore.getState().snippets.length; },
        selectedId() { return usePanelStore.getState().selectedId; },
        draftValue() { return usePanelStore.getState().consoleDraft; },
         dragPanel(width) {
           const handle = this.query('.xray-resize-handle');
           if (!handle) return false;
           const rect = handle.getBoundingClientRect();
           const startX = rect.left + rect.width / 2;
           return {startX,targetX:startX + this.query('.xray-panel').getBoundingClientRect().width - width,y:Math.max(40, rect.top + 40)};
         },
         draft(multiline) {
           flushSync(()=>usePanelStore.getState().setConsoleDraft(multiline
             ? Array.from({length:12},(_,i)=>'// editable command line '+i).join('\\n')
             : 'Object.keys(res)'));
         },
         structured() {
           flushSync(() => usePanelStore.setState({consoleEvents:[
             {id:'structured',type:'log',level:'info',timestamp:3000,message:'preview text',data:{nested:{needle:'bounded-nested-value'}}},
             {id:'args',type:'log',level:'info',timestamp:3001,message:'args preview',args:[{nested:{needle:'bounded-args-value'}}]},
           ]}));
         },
         network() {
           const entry = {id:'network-row',type:'api',method:'GET',status:404,source:'fetch',url:'https://example.test/network-row',urlPath:'/network-row',timestamp:4000,duration:120,size:512};
           flushSync(() => usePanelStore.setState({consoleMiniTab:'network',entries:[entry],consoleEvents:[{id:'network-event',type:'network',level:'info',timestamp:4000,message:'GET /network-row',args:[entry]}]}));
         },
         empty() {
           flushSync(() => usePanelStore.setState({consoleEvents:[],consoleDraft:'',snippets:[{id:'s1',title:'Keys',code:'Object.keys(res)'}]}));
         },
         budgeted() {
           flushSync(() => usePanelStore.setState({consoleEvents:[
             {id:'budgeted',type:'log',level:'info',timestamp:3002,message:'m'.repeat(20000),data:{needle:'bounded-data-value'},args:[{needle:'bounded-args-value'}]},
           ]}));
         },
         snapshot() {
          const rect=el=>{ if (!el) return {width:0,height:0}; const r=el.getBoundingClientRect(); return {
            x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom,
            scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,
            display:getComputedStyle(el).display}; };
          const stream=this.query('.xray-console-stream');
          const prompt=this.query('.xray-prompt');
          const head=this.query('.xray-console-head');
          return {
             panel:rect(this.query('.xray-panel')),head:rect(head),prompt:rect(prompt),
             commandRow:rect(this.query('.xray-prompt-command-row')),contextRow:rect(this.query('.xray-prompt-context-row')),
            title:rect(this.query('.xray-console-title')),stream:rect(stream),
            controls:[...head.querySelectorAll('button'),...prompt.querySelectorAll('textarea,button,.xray-context-line'),
              this.query('.xray-statusbar')]
              .map(el=>({name:el.getAttribute('aria-label')||el.textContent,...rect(el)})),
            command:rect(this.query('[aria-label="Console command"]')),
             context:rect(this.query('.xray-context-line')),
             picker:rect(this.query('[aria-label="Console request context"]')),
             inspect:this.query('button[aria-label="Inspect in API"]') ? rect(this.query('button[aria-label="Inspect in API"]')) : null,
             filter:rect(this.query('.xray-filter-chips')),snippetsButton:rect(this.query('.xray-snippet-trigger')),statusbar:rect(this.query('.xray-statusbar')),
            top:stream.scrollTop,scrollHeight:stream.scrollHeight,
             messages:[...stream.querySelectorAll('.xray-console-message')].map(el=>el.textContent),
             documentTop:document.scrollingElement.scrollTop,
             promptChildren:[...prompt.children].map(el=>({tag:el.tagName,class:el.className,position:getComputedStyle(el).position,rect:rect(el)})),
           };
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

const screenshotDir = '/tmp/omnirush/console-slider';
mkdirSync(screenshotDir, { recursive: true });

for (const [theme, label] of [['light-lab', 'light'], ['midnight', 'dark']]) {
  test(`captures ${label} narrow dragged panel`, async t => {
    const page = await browser.newPage({ viewport: { width: 1800, height: 700 } });
    t.after(() => page.close());
    await page.setContent('<style>body{margin:0;min-height:100vh}</style>');
    await page.addScriptTag({ content: outputFiles[0].text });
    await page.evaluate(args => window.consoleLayout.setup(args.shadow, true, args.mode, args.theme), { shadow:true, selected:true, mode:'hud', theme });
    const drag = await page.evaluate(() => window.consoleLayout.dragPanel(360));
    await page.mouse.move(drag.startX, drag.y);
    await page.mouse.down();
    await page.mouse.move(drag.targetX, drag.y);
    await page.mouse.up();
    await page.waitForTimeout(120);
    await page.screenshot({ path: `${screenshotDir}/console-${label}-360.png` });
  });
}

for (const throws of [false, true]) {
  test(`explicit Run reveals its output despite filters (${throws ? 'bridge rejection' : 'result'})`, async t => {
    const page = await browser.newPage({ viewport: { width: 960, height: 700 } });
    t.after(() => page.close());
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addScriptTag({ content: outputFiles[0].text });
    await page.evaluate(throws => {
      window.consoleLayout.setup(false, true);
      window.XRAY_Console = { execute: async () => {
        if (throws) throw new Error('bridge disconnected');
        return {type:'result',result:'explicit result'};
      } };
    }, throws);
    await page.getByRole('button', {name:/^Warnings/}).click();
    await page.getByLabel('Filter console messages').fill('will not match');
    await page.getByRole('button', {name:'Run',exact:true}).click();
    await page.waitForTimeout(200);
    assert.match(await page.locator('.xray-console-stream').innerText(), throws ? /bridge disconnected|XRAY console execution failed/ : /explicit result/);
    assert.equal(await page.getByLabel('Filter console messages').inputValue(), '');
    if (throws) assert.equal(await page.getByLabel('Console command', {exact:true}).inputValue(), 'Object.keys(res)');
    assert.deepEqual(errors, []);
  });
}

test('legacy network mini-tab state keeps Console output-first without a request ledger', async t => {
  const page = await browser.newPage({ viewport: { width: 960, height: 700 } });
  t.after(() => page.close());
  await page.setContent('<style>body{margin:0}</style>');
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(() => window.consoleLayout.setup(false, false));
  await page.evaluate(() => window.consoleLayout.network());
  assert.equal(await page.getByRole('button', { name: 'Network', exact: true }).count(), 0);
  assert.equal(await page.locator('.xray-network, .xray-network-row, .xray-mini-tab').count(), 0);
  assert.equal(await page.locator('.xray-console-stream').count(), 1);
  await page.evaluate(() => { window.XRAY_Console = { execute: async () => ({ type:'result', result:'network-run-output' }) }; });
  await page.getByRole('button', { name:'Run', exact:true }).click();
  await page.waitForFunction(() => window.consoleLayout.root.querySelector('.xray-console-stream')?.textContent.includes('network-run-output'), null, { timeout: 3000 });
});

for (const fixtureRoot of [
  { shadow:false, mode:'window', label:'document' },
  { shadow:true, mode:'hud', label:'closed shadow' },
]) {
  test(`console filtering searches bounded nested data and args (${fixtureRoot.label})`, async t => {
    const page = await browser.newPage({ viewport: { width: 960, height: 700 } });
    t.after(() => page.close());
    await page.setContent('<style>body{margin:0}</style>');
    await page.addScriptTag({ content: outputFiles[0].text });
    await page.evaluate(args => window.consoleLayout.setup(args.shadow, false, args.mode), fixtureRoot);
    await page.evaluate(() => window.consoleLayout.structured());
    const setFilter = value => page.evaluate(value => {
      const input = window.consoleLayout.query('[aria-label="Filter console messages"]');
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }, value);
    await setFilter('bounded-nested-value');
    assert.deepEqual(await page.evaluate(() => [...window.consoleLayout.root.querySelectorAll('.xray-console-message')].map(el => el.textContent)), ['preview text']);
    await setFilter('bounded-args-value');
    assert.deepEqual(await page.evaluate(() => [...window.consoleLayout.root.querySelectorAll('.xray-console-message')].map(el => el.textContent)), ['args preview']);
  });
}

for (const fixtureRoot of [
  { shadow:false, mode:'window', label:'document' },
  { shadow:true, mode:'hud', label:'closed shadow' },
]) {
  test(`console filtering keeps data and args searchable beside a long message (${fixtureRoot.label})`, async t => {
    const page = await browser.newPage({ viewport: { width: 960, height: 700 } });
    t.after(() => page.close());
    await page.setContent('<style>body{margin:0}</style>');
    await page.addScriptTag({ content: outputFiles[0].text });
    await page.evaluate(args => window.consoleLayout.setup(args.shadow, false, args.mode), fixtureRoot);
    await page.evaluate(() => window.consoleLayout.budgeted());
    const setFilter = value => page.evaluate(value => {
      const input = window.consoleLayout.query('[aria-label="Filter console messages"]');
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }, value);
    for (const value of ['bounded-data-value', 'bounded-args-value']) {
      await setFilter(value);
      await page.waitForFunction(() => window.consoleLayout.root.querySelectorAll('.xray-console-message').length === 1);
    }
  });
}

async function wheel(page, delta) {
  const box = await page.evaluate(() => window.consoleLayout.snapshot().stream);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, delta);
  await page.waitForTimeout(100);
}

for (const fixture of [
  { shadow:false, mode:'window', label:'window document' },
  { shadow:true, mode:'hud', label:'hud closed shadow' },
]) {
  for (const [width, height] of [[360, 350], [420, 350], [360, 700], [420, 700], [760, 700], [960, 700], [1600, 1000], [960, 350]]) {
    for (const selected of [false, true]) {
      test(`Console output and context controls fit ${fixture.label} ${width}x${height} (${selected ? 'selected' : 'unselected'})`, async t => {
        const viewportWidth = fixture.shadow ? Math.max(1800, width + 100) : width;
        const page = await browser.newPage({ viewport: { width:viewportWidth, height } });
        t.after(() => page.close());
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.setContent('<style>body{margin:0;min-height:3000px}</style>');
        await page.addScriptTag({ content: outputFiles[0].text });
        await page.evaluate(args => window.consoleLayout.setup(args.shadow, args.selected, args.mode), { ...fixture, selected });
        await page.waitForTimeout(250);
        if (fixture.mode === 'hud') {
          const drag = await page.evaluate(width => window.consoleLayout.dragPanel(width), width);
          assert.ok(drag, 'HUD panel resize handle did not mount');
          await page.mouse.move(drag.startX, drag.y);
          await page.mouse.down();
          await page.mouse.move(drag.targetX, drag.y);
          await page.mouse.up();
          await page.waitForTimeout(50);
        }
        try {
          await page.waitForFunction(() => window.consoleLayout.query('.xray-console-row'));
        } catch (error) {
          throw new Error(`${error.message}; page errors: ${errors.join(' | ')}; body: ${(await page.locator('body').innerHTML()).slice(0, 3000)}`);
        }
        for (const multiline of [false, true]) {
          await page.evaluate(multiline => window.consoleLayout.draft(multiline), multiline);
          await page.waitForTimeout(100);
           const state = await page.evaluate(() => window.consoleLayout.snapshot());
           assert.ok(state.stream.height >= 28, `output viewport collapsed: ${JSON.stringify(state)}`);
            assert.ok(state.command.width >= 100, `command too narrow: ${JSON.stringify(state.command)}`);
            assert.ok(state.commandRow.width > 0 && state.contextRow.width > 0, `prompt rows did not mount: ${JSON.stringify(state)}`);
            assert.ok(state.contextRow.bottom <= state.commandRow.y + 1, `context line must sit above the command row: ${JSON.stringify(state)}`);
            assert.ok(state.commandRow.bottom <= state.prompt.bottom + 1, `context row escapes prompt: ${JSON.stringify(state)}`);
            assert.notEqual(state.context.display, 'none', 'request context remains visible on narrow panels');
            assert.ok(state.picker.width > 0 && state.picker.height > 0, `request picker hidden: ${JSON.stringify(state)}`);
            assert.ok(state.filter.width > 0 && state.filter.scrollWidth >= state.filter.clientWidth, `filter strip missing: ${JSON.stringify(state)}`);
            assert.ok(state.snippetsButton.width > 0 && state.snippetsButton.right <= state.commandRow.right + 1, `Snippets menu button missing or clipped: ${JSON.stringify(state)}`);
            assert.ok(state.statusbar.height <= 32, `status bar wrapped: ${JSON.stringify(state.statusbar)}`);
           const promptItems = state.promptChildren.filter((item) => item.position !== 'absolute' && item.rect.width > 1 && item.rect.height > 1);
           for (let i = 0; i < promptItems.length; i += 1) {
             for (let j = i + 1; j < promptItems.length; j += 1) {
               const a = promptItems[i].rect;
               const b = promptItems[j].rect;
               assert.ok(a.right <= b.x + 1 || b.right <= a.x + 1 || a.bottom <= b.y + 1 || b.bottom <= a.y + 1,
                 `prompt controls overlap: ${JSON.stringify({ a: promptItems[i], b: promptItems[j], width, height })}`);
             }
           }
          for (const box of [state.title, ...state.controls]) {
            assert.ok(box.width > 0 && box.height > 0 && box.x >= state.panel.x - 1 && box.y >= -1 && box.right <= viewportWidth + 1 && box.bottom <= height + 1,
              `control clipped: ${JSON.stringify(box)}`);
          }
           for (const box of [state.head, state.prompt, state.commandRow, state.contextRow]) {
            assert.ok(box.scrollWidth <= box.clientWidth + 1, `console chrome overflows: ${JSON.stringify(box)}`);
          }
          // Real keyboard focus and pointer selection must be reachable without
          // scrolling the host page or losing the command/output viewport.
          const picker = (await page.evaluateHandle(() => window.consoleLayout.query('[aria-label="Console request context"]'))).asElement();
          await picker.focus();
          assert.equal(await picker.evaluate(el => el.getRootNode().activeElement === el), true);
          // P1: the picker is a disclosure; Enter opens it, Enter in the filter picks.
          await page.keyboard.press('Enter');
          await page.waitForFunction(() => window.consoleLayout.query('.xray-context-option'));
          await page.keyboard.press('Enter');
          await page.waitForFunction(() => !window.consoleLayout.query('.xray-context-menu'));
          assert.equal(await picker.evaluate(el => el.getRootNode().activeElement === el), true, 'focus returns to the picker');
          assert.equal(await page.evaluate(() => window.consoleLayout.selectedId()), 'context', 'the picked request is selected');
          await picker.dispose();
        }
        await wheel(page, -10000);
        let state = await page.evaluate(() => window.consoleLayout.snapshot());
        assert.equal(state.top, 0, 'wheel reaches oldest output');
        assert.ok(state.messages.includes('Output message 0'));
        await wheel(page, 10000);
        state = await page.evaluate(() => window.consoleLayout.snapshot());
        assert.ok(state.top > 0 && state.top + state.stream.height >= state.scrollHeight - 2, 'wheel reaches newest output');
        assert.ok(state.messages.includes('Output message 79'));
        assert.equal(state.documentTop, 0, 'output scrolling stays inside XRAY');
        assert.deepEqual(errors, []);
      });
    }
  }
}

test('Console example commands only fill the prompt; Snippets menu renames by keyboard', async t => {
  const page = await browser.newPage({ viewport: { width: 760, height: 700 } });
  t.after(() => page.close());
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setContent('<style>body{margin:0}</style>');
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(() => {
    window.consoleLayout.setup(false, false);
    window.executed = 0;
    window.XRAY_Console = { setContext(){}, execute: async () => { window.executed += 1; return {type:'result',result:'ran'}; } };
    window.consoleLayout.empty();
  });
  const examples = page.getByRole('group', { name: 'Example commands' }).getByRole('button');
  assert.deepEqual(await examples.allInnerTexts(), ['res', 'schema(res)', 'Object.keys(res)', '$help']);
  await examples.nth(1).click();
  assert.equal(await page.getByLabel('Console command', { exact: true }).inputValue(), 'schema(res)');
  assert.equal(await page.evaluate(() => window.executed), 0, 'example click must not execute');
  assert.equal(await page.locator('.xray-console-row').count(), 0, 'example click must not log a command');
  // A non-empty draft is never clobbered: the example goes on a new line below it.
  await examples.nth(0).click();
  assert.equal(await page.getByLabel('Console command', { exact: true }).inputValue(), 'schema(res)\nres');
  assert.equal(await page.evaluate(() => window.executed), 0);

  // Snippets menu: keyboard-only rename.
  const trigger = page.getByRole('button', { name: 'Saved snippets menu' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const menu = page.getByRole('group', { name: 'Saved console snippets' });
  assert.equal(await menu.count(), 1);
  await page.getByRole('button', { name: 'Rename snippet Keys' }).focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Control+A');
  await page.keyboard.type('Renamed');
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Rename snippet Renamed' }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Rename snippet Renamed' }).evaluate(el => el.getRootNode().activeElement === el), true, 'committing a rename keeps focus in the menu');
  // Escape cancels an inline rename: nothing is committed, the menu stays open and
  // focus lands on the row's Rename button instead of <body>.
  await page.keyboard.press('Enter');
  await page.keyboard.type(' discarded');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Rename snippet Renamed' }).waitFor();
  assert.equal(await menu.count(), 1, 'Escape in a rename keeps the menu open');
  assert.equal(await page.getByRole('button', { name: 'Rename snippet Renamed' }).evaluate(el => el.getRootNode().activeElement === el), true, 'cancelling a rename returns focus to Rename');
  // Same for naming a new snippet: focus returns to Save snippet.
  await page.getByRole('button', { name: 'Save snippet' }).focus();
  await page.keyboard.press('Enter');
  await page.getByLabel('Snippet name').waitFor();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Save snippet' }).waitFor();
  assert.equal(await menu.count(), 1);
  assert.equal(await page.getByRole('button', { name: 'Save snippet' }).evaluate(el => el.getRootNode().activeElement === el), true, 'cancelling a new name returns focus to Save snippet');
  assert.equal(await page.evaluate(() => window.consoleLayout.snippetCount()), 1, 'cancelled naming saves nothing');
  await page.keyboard.press('Escape');
  assert.equal(await menu.count(), 0, 'Escape closes the menu');
  assert.equal(await trigger.evaluate(el => el.getRootNode().activeElement === el), true, 'focus returns to the trigger');
  assert.deepEqual(errors, []);
});

test('level chips: the overflow fade follows scroll and count changes; listeners are installed once', async t => {
  // At 640 the five chips just fit; more messages widen the counts until they do not.
  const page = await browser.newPage({ viewport: { width: 640, height: 700 } });
  t.after(() => page.close());
  await page.setContent('<style>body{margin:0}</style>');
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(() => window.consoleLayout.setup(false, true));
  await page.waitForFunction(() => window.consoleLayout.query('.xray-console-levels'));
  assert.deepEqual(await page.evaluate(() => [window.consoleLayout.levels().overflow, window.consoleLayout.levels().clipped]), ['none', false]);
  // Count how often the row gains a listener from here on.
  await page.evaluate(() => {
    const row = window.consoleLayout.query('.xray-console-levels');
    window.levelListeners = 0;
    const add = row.addEventListener.bind(row);
    row.addEventListener = (...args) => { window.levelListeners += 1; return add(...args); };
  });
  await page.evaluate(() => window.consoleLayout.moreLogs(20000));
  await page.waitForFunction(() => window.consoleLayout.levels().overflow === 'end');
  assert.equal(await page.evaluate(() => window.consoleLayout.levels().clipped), true);
  assert.equal(await page.evaluate(() => window.levelListeners), 0, 'a count change re-measures without re-installing listeners');
  await page.evaluate(() => { const row = window.consoleLayout.query('.xray-console-levels'); row.scrollLeft = row.scrollWidth; });
  await page.waitForFunction(() => window.consoleLayout.levels().overflow === 'start');
});

for (const width of [420, 760]) {
  test(`Console level chips and status bar stay on one line at ${width}`, async t => {
    const page = await browser.newPage({ viewport: { width, height: 700 } });
    t.after(() => page.close());
    await page.setContent('<style>body{margin:0}</style>');
    await page.addScriptTag({ content: outputFiles[0].text });
    await page.evaluate(() => window.consoleLayout.setup(false, true));
    const chips = await page.evaluate(() => {
      const row = window.consoleLayout.query('.xray-console-levels');
      const rows = new Set([...row.querySelectorAll('.xray-chip')].map(el => Math.round(el.getBoundingClientRect().top)));
      return { rows: rows.size, clipped: row.scrollWidth > row.clientWidth, inside: row.getBoundingClientRect().right <= window.innerWidth + 1 };
    });
    assert.equal(chips.rows, 1, 'chips share one row');
    assert.ok(chips.inside, 'chip row stays inside the panel');
    const bar = await page.evaluate(() => {
      const el = window.consoleLayout.query('.xray-statusbar');
      return { height: el.getBoundingClientRect().height, scrollWidth: el.scrollWidth, clientWidth: el.clientWidth };
    });
    assert.ok(bar.height <= 32, `status bar wrapped: ${JSON.stringify(bar)}`);
    assert.ok(bar.scrollWidth <= bar.clientWidth + 1, `status bar overflows: ${JSON.stringify(bar)}`);
  });
}
