import assert from 'node:assert/strict';
import { existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { before, after } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { PANEL_CSS } from '../helpers/panel-css.mjs';
import { setStandardsContent } from '../helpers/standards-page.mjs';

// The prompt editor (spec P3–P7, P9) on the real App, store, panel keyboard and
// stylesheet. Only the evaluation bridge (XRAY_Console) and persistence are stubbed;
// `calls` counts every execute() so previews, suggestions and chips can prove they
// never evaluate.
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
      const BODY = {users:[{id:1,name:'Ada',email:'ada@x.io'},{id:2,name:'Lin',email:'lin@x.io'}], meta:{page:1}};
      const BIG = Array.from({length:200}, (_, i) => ({id:i, name:'User ' + i}));
      window.ed = {
        root: null, calls: [], vars: {}, history: [], historyIndex: -1,
        setup(shadow, mode, width, theme = 'xray-dark', hidden = false) {
          const host = document.body.appendChild(document.createElement('div'));
          this.host = host;
          if (mode === 'hud') { host.style.width = width + 'px'; host.style.height = '100vh'; }
          // The injected in-page panel mounts while hidden and is shown later.
          if (hidden) host.style.display = 'none';
          this.root = shadow ? host.attachShadow({mode:'closed'}) : document;
          const sheet = document.createElement('style'); sheet.textContent = styles;
          (shadow ? this.root : document.head).appendChild(sheet);
          const mount = shadow ? this.root.appendChild(document.createElement('div')) : host;
          mount.className = 'xray-app-root';
          window.XRAY_Store = {get:async()=>null,set:async()=>{}};
          const self = this;
          window.XRAY_Console = {
            init(){}, setContext(){},
            // Same walk as panel/console.js navigateHistory (newest first).
            navigateHistory(dir) {
              if (!self.history.length) return null;
              if (dir === 'up' && self.historyIndex < self.history.length - 1) self.historyIndex++;
              else if (dir === 'down' && self.historyIndex > -1) self.historyIndex--;
              return self.historyIndex === -1 ? '' : self.history[self.historyIndex];
            },
            setVar(name, value){ self.vars[name] = value; },
            getVar(name){ return self.vars[name]; },
            getScope(){ return {...self.vars}; },
            execute(code) {
              self.calls.push(code);
              self.history.unshift(code); self.historyIndex = -1;
              return Promise.resolve(code === 'big' ? {type:'array',result:BIG} : {type:'number',result:42});
            },
          };
          usePanelStore.setState({open:true,activeTab:'console',consoleMiniTab:'console',
            selectedId:null,expandedId:null,entries:[],consoleEvents:[],recording:true,consoleDraft:'',
            settings:{...usePanelStore.getState().settings,panelWidth:width,theme}});
          installPanelKeyboard({ dismissible: true, getRoot: () => self.root });
          flushSync(() => {
            usePanelStore.getState().addEntry({id:'context',type:'api',method:'POST',status:200,
              source:'fetch',url:'https://example.test/users',urlPath:'/users',timestamp:1000,duration:100,size:1000,
              responseHeaders:{'content-type':'application/json'},responseRaw:JSON.stringify(BODY),
              requestBody:JSON.stringify({filter:{active:true}})});
            // A later call to the same endpoint is selected, so 'context' is its previous call (P8 Diff starter).
            usePanelStore.getState().addEntry({id:'later',type:'api',method:'POST',status:200,
              source:'fetch',url:'https://example.test/users',urlPath:'/users',timestamp:2000,duration:90,size:1000,
              responseHeaders:{'content-type':'application/json'},responseRaw:JSON.stringify(BODY),
              requestBody:JSON.stringify({filter:{active:true}})});
            usePanelStore.setState({selectedId:'later'});
            createRoot(mount).render(<App mode={mode} />);
          });
        },
        draft(code) { flushSync(() => usePanelStore.getState().setConsoleDraft(code)); },
        show() { this.host.style.display = ''; },
        resize(width) {
          this.host.style.width = width + 'px';
          flushSync(() => usePanelStore.setState({settings:{...usePanelStore.getState().settings, panelWidth:width}}));
        },
        // Task 4: statuses 200, 200, 404 and paths /api/users x2, /api/missing. 'later' stays selected (it serves res).
        seedCaptured() {
          const mk = (id, status, urlPath, timestamp) => ({id, type:'api', method:'GET', status, source:'fetch',
            url:'https://example.test' + urlPath, urlPath, timestamp, duration:50, size:1000,
            responseHeaders:{'content-type':'application/json'}, responseRaw:JSON.stringify(BODY)});
          flushSync(() => usePanelStore.setState({selectedId:'later', entries:[mk('later', 200, '/api/users', 2000), mk('u2', 200, '/api/users', 1500), mk('m1', 404, '/api/missing', 1000)]}));
        },
        noEntries() { flushSync(() => usePanelStore.setState({selectedId:null, entries:[]})); },
        select(id) { flushSync(() => usePanelStore.setState({selectedId:id})); },
        // Other captured calls after the selection (pushes older calls out of the engine's window).
        addOthers(n) { flushSync(() => usePanelStore.getState().addEntries(Array.from({length:n}, (_, i) => ({id:'other' + i,type:'api',method:'GET',status:200,
          source:'fetch',url:'https://example.test/other/' + i,urlPath:'/other/' + i,timestamp:3000 + i,duration:5,size:10,responseRaw:'{}'})))); },
        // A page log, so the stream is no longer empty (no evaluation involved).
        seedLog() { flushSync(() => usePanelStore.getState().addConsoleEvent({id:'log_' + Math.random(),type:'log',level:'log',timestamp:Date.now(),message:'page says hi'})); },
        snippets() { return usePanelStore.getState().snippets.map(s => s.code); },
        groupLabels(name) {
          const group = this.root.querySelector('[role="group"][aria-label="' + name + '"]');
          return group ? [...group.querySelectorAll('button')].map(b => b.textContent.trim()) : null;
        },
        button(name) { return this.root.querySelector('button[aria-label="' + name + '"]'); },
        clickByText(groupName, text) {
          const group = this.root.querySelector('[role="group"][aria-label="' + groupName + '"]');
          const b = [...group.querySelectorAll('button')].find(x => x.textContent.trim() === text);
          b.classList.add('probe-click');
        },
        rect(selector) {
          const el = this.root.querySelector(selector);
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return {top:r.top, bottom:r.bottom, height:r.height, width:r.width, visible: r.height > 0 && getComputedStyle(el).visibility !== 'hidden'};
        },
        gutter() { const g = this.root.querySelector('.xray-editor-gutter'); return g ? g.textContent : null; },
        expanded() { return !!this.root.querySelector('.xray-editor.is-expanded'); },
        draftValue() { return usePanelStore.getState().consoleDraft; },
        storeOpen() { return usePanelStore.getState().open; },
        query(selector) { return this.root.querySelector(selector); },
        queryAll(selector) { return [...this.root.querySelectorAll(selector)]; },
        field() { return this.root.querySelector('textarea[aria-label="Console command"]'); },
        active() { return this.root.activeElement || document.activeElement; },
        focusedIsField() { const a = this.active(); return a === this.field() && a.tagName === 'TEXTAREA'; },
        caret() { const f = this.field(); return [f.selectionStart, f.selectionEnd]; },
        setCaret(i) { const f = this.field(); f.focus(); f.setSelectionRange(i, i); },
        listbox() {
          const box = this.root.querySelector('[role="listbox"]');
          if (!box) return null;
          return {
            options: [...box.querySelectorAll('[role="option"]')].map(o => o.querySelector('.xray-editor-option-label')?.textContent ?? o.textContent),
            selected: [...box.querySelectorAll('[role="option"][aria-selected="true"]')].map(o => o.id),
            activedescendant: this.field().getAttribute('aria-activedescendant'),
            controls: this.field().getAttribute('aria-controls'),
            id: box.id,
          };
        },
        // Listbox, its active option and the viewport, for on-screen checks.
        listGeometry() {
          const box = this.root.querySelector('[role="listbox"]');
          if (!box) return null;
          const r = box.getBoundingClientRect();
          const a = box.querySelector('[aria-selected="true"]').getBoundingClientRect();
          const f = this.root.querySelector('.xray-editor-field').getBoundingClientRect();
          // The caret's line box inside the textarea (12px/18px, padding-top 8px).
          const ta = this.field(); const cs = getComputedStyle(ta); const lh = parseFloat(cs.lineHeight);
          const lineIndex = ta.value.slice(0, ta.selectionStart).split('\\n').length - 1;
          const lineTop = ta.getBoundingClientRect().top + parseFloat(cs.paddingTop) + lineIndex * lh - ta.scrollTop;
          return { list: {top:r.top, bottom:r.bottom, left:r.left, right:r.right}, active: {top:a.top, bottom:a.bottom},
            caretLine: {top:lineTop, bottom:lineTop + lh},
            field: {top:f.top, bottom:f.bottom, left:f.left, right:f.right}, vw: innerWidth, vh: innerHeight,
            count: box.querySelectorAll('[role="option"]').length, last: box.lastElementChild.getAttribute('aria-selected') };
        },
        hint() { return this.root.querySelector('.xray-editor-hint')?.textContent ?? null; },
        hintParam() { return this.root.querySelector('.xray-editor-hint .xray-editor-hint-param')?.textContent ?? null; },
        hintNote() { return this.root.querySelector('.xray-editor-hint .xray-editor-hint-note')?.textContent ?? null; },
        optionDetails() { return [...this.root.querySelectorAll('[role="listbox"] [role="option"]')].map(o => o.querySelector('.xray-editor-option-detail')?.textContent ?? ''); },
        overlay() {
          const el = this.root.querySelector('.xray-editor-highlight');
          if (!el) return null;
          return { hidden: el.getAttribute('aria-hidden'), pointer: getComputedStyle(el).pointerEvents, text: el.textContent };
        },
        fieldBox() {
          const f = this.field();
          return { height: f.getBoundingClientRect().height, scrollHeight: f.scrollHeight, clientHeight: f.clientHeight,
            lineHeight: parseFloat(getComputedStyle(f).lineHeight) };
        },
        // Resolved token colours vs the theme's own tokens, painted on a probe in the same root.
        colours() {
          const panel = this.root.querySelector('.xray-panel');
          const probe = document.createElement('span');
          panel.appendChild(probe);
          const token = name => { probe.style.color = 'var(' + name + ')'; return getComputedStyle(probe).color; };
          const expected = {keyword: token('--xray-mauve'), string: token('--xray-green'), number: token('--xray-peach'),
            comment: token('--xray-hint'), punct: token('--xray-subtext'), plain: token('--xray-text')};
          probe.remove();
          const actual = {};
          for (const kind of Object.keys(expected)) {
            const span = this.root.querySelector('.xray-editor-highlight .xray-tok-' + kind);
            actual[kind] = span ? getComputedStyle(span).color : null;
          }
          const f = this.field();
          return { expected, actual, fieldColor: getComputedStyle(f).color, caret: getComputedStyle(f).caretColor };
        },
        inspector() { return this.root.querySelector('.xray-inspector'); },
        cells() { return [...this.root.querySelectorAll('.xray-command-cell')]; },
        box(selector) {
          const el = this.root.querySelector(selector);
          if (!el) return null;
          el.scrollIntoView({block:'nearest'});
          const r = el.getBoundingClientRect();
          return {x:r.x + r.width / 2, y:r.y + r.height / 2, width:r.width, height:r.height};
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

async function open(t, fixture, width, height = 760, theme, hidden = false) {
  const page = await browser.newPage({ viewport: { width, height } });
  t.after(() => page.close());
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  t.after(() => assert.deepEqual(errors, [], 'page errors'));
  await setStandardsContent(page, '<style>body{margin:0;min-height:100vh}</style>');
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(args => window.ed.setup(args.shadow, args.mode, args.width, args.theme, args.hidden), { ...fixture, width, theme, hidden });
  await page.waitForFunction(() => window.ed.field());
  await page.evaluate(() => window.ed.field().focus());
  return page;
}

const ev = (page, fn, arg) => page.evaluate(fn, arg);
const calls = page => ev(page, () => window.ed.calls.length);
const draft = page => ev(page, () => window.ed.draftValue());
async function clearDraft(page) {
  await ev(page, () => window.ed.draft(''));
  await ev(page, () => window.ed.field().focus());
}

const FIXTURES = [
  { shadow:false, mode:'window', label:'document' },
  { shadow:true, mode:'hud', label:'closed shadow' },
];

for (const fixture of FIXTURES) {
  test(`the textarea stays the focused, labelled input under an aria-hidden overlay (${fixture.label})`, async t => {
    const page = await open(t, fixture, 960);
    await page.keyboard.type('const x = 1');
    assert.equal(await ev(page, () => window.ed.focusedIsField()), true, 'typing keeps focus on the labelled textarea');
    const overlay = await ev(page, () => window.ed.overlay());
    assert.ok(overlay, 'colouring overlay is rendered');
    assert.equal(overlay.hidden, 'true');
    assert.equal(overlay.pointer, 'none');
    assert.match(overlay.text, /const x = 1/);
    assert.equal(await ev(page, () => window.ed.field().getAttribute('placeholder')), 'Type JavaScript · Shift+Enter for a new line');
  });

  test(`Shift+Enter adds a line, Enter runs (${fixture.label})`, async t => {
    const page = await open(t, fixture, 960);
    await page.keyboard.type('1 +');
    await page.keyboard.press('Shift+Enter');
    await page.keyboard.type('2');
    assert.equal(await draft(page), '1 +\n2');
    assert.equal(await calls(page), 0);
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.ed.calls.length === 1);
    assert.deepEqual(await ev(page, () => window.ed.calls), ['1 +\n2']);
    assert.equal(await draft(page), '');
  });

  test(`suggestions: listbox with aria-activedescendant; Tab, Enter accept; Escape dismisses (${fixture.label})`, async t => {
    const page = await open(t, fixture, 960);
    await page.keyboard.type('res.users[0].em');
    await page.waitForFunction(() => window.ed.listbox());
    let list = await ev(page, () => window.ed.listbox());
    assert.ok(list.options.includes('email'), `email suggested: ${JSON.stringify(list)}`);
    assert.ok(list.activedescendant, 'textarea names the active option');
    assert.deepEqual(list.selected, [list.activedescendant]);
    assert.equal(list.controls, list.id);
    // A plain textarea is not a combobox: aria-expanded is not a supported state on it (M2).
    assert.equal(await ev(page, () => window.ed.field().hasAttribute('aria-expanded')), false, 'no aria-expanded on the textarea');
    assert.equal(await ev(page, () => window.ed.focusedIsField()), true, 'focus stays in the textarea');
    await page.keyboard.press('Tab');
    assert.equal(await draft(page), 'res.users[0].email');
    assert.equal(await ev(page, () => window.ed.listbox()), null, 'accepting closes the list');
    assert.equal(await ev(page, () => window.ed.focusedIsField()), true, 'Tab accepted instead of moving focus');

    await clearDraft(page);
    await page.keyboard.type('res.us');
    await page.waitForFunction(() => window.ed.listbox());
    await page.keyboard.press('Escape');
    assert.equal(await ev(page, () => window.ed.listbox()), null, 'Escape dismisses');
    assert.equal(await draft(page), 'res.us', 'Escape keeps the draft');
    assert.equal(await ev(page, () => window.ed.storeOpen()), true, 'Escape does not close the panel');
    assert.equal(await ev(page, () => window.ed.focusedIsField()), true);

    await clearDraft(page);
    await page.keyboard.type('res.us');
    await page.waitForFunction(() => window.ed.listbox());
    await page.keyboard.press('Enter');
    assert.equal(await draft(page), 'res.users', 'Enter with the list open accepts');
    assert.equal(await calls(page), 0, 'Enter with the list open does not run');
    assert.equal(await ev(page, () => window.ed.cells().length), 0);

    // ↓ moves the active option.
    await clearDraft(page);
    await page.keyboard.type('res.');
    await page.waitForFunction(() => window.ed.listbox()?.options.length >= 2);
    list = await ev(page, () => window.ed.listbox());
    await page.keyboard.press('ArrowDown');
    const moved = await ev(page, () => window.ed.listbox());
    assert.notEqual(moved.activedescendant, list.activedescendant);
    await page.keyboard.press('Tab');
    assert.equal(await draft(page), 'res.' + moved.options[1]);
    assert.equal(await calls(page), 0, 'suggestions never evaluate');
  });

  test(`signature hint inside a helper call; live preview only for plain paths (${fixture.label})`, async t => {
    const page = await open(t, fixture, 960);
    await page.keyboard.type('diff(');
    await page.waitForFunction(() => window.ed.hint());
    // The static helper table (and $help) document diff as diff(a, b).
    assert.match(await ev(page, () => window.ed.hint()), /diff\(a, b\)/);

    await clearDraft(page);
    await ev(page, () => window.ed.draft('res.users[0].email'));
    await page.waitForFunction(() => window.ed.hint());
    assert.match(await ev(page, () => window.ed.hint()), /→ "ada@x\.io"/);
    assert.match(await ev(page, () => window.ed.hint()), /from captured data/);
    await ev(page, () => window.ed.draft('req.filter.active'));
    assert.match(await ev(page, () => window.ed.hint()), /→ true/);
    await ev(page, () => window.ed.draft('res.users'));
    assert.match(await ev(page, () => window.ed.hint()), /→ Array\(2\)/);
    await ev(page, () => window.ed.draft('res.users.map(u=>u)'));
    assert.equal(await ev(page, () => window.ed.hint()), null, 'non-path draft shows no preview');
    await ev(page, () => window.ed.draft('res.missing'));
    assert.equal(await ev(page, () => window.ed.hint()), null, 'unresolved path shows no preview');
    assert.equal(await calls(page), 0, 'previews never evaluate');
  });

  test(`↑ on line 1 recalls history; ↑ on line 2 moves the caret (${fixture.label})`, async t => {
    const page = await open(t, fixture, 960);
    await ev(page, () => { window.ed.history = ['older']; });
    await page.keyboard.type('a');
    await page.keyboard.press('Shift+Enter');
    await page.keyboard.type('b');
    await page.keyboard.press('ArrowUp');
    assert.equal(await draft(page), 'a\nb', '↑ on line 2 does not touch history');
    assert.deepEqual(await ev(page, () => window.ed.caret()), [1, 1], 'caret moved to line 1');
    await page.keyboard.press('ArrowUp');
    assert.equal(await draft(page), 'older', '↑ on line 1 recalls history');
    await page.keyboard.press('ArrowDown');
    assert.equal(await draft(page), 'a\nb', '↓ past the newest entry restores the draft');
    assert.equal(await calls(page), 0);
  });

  test(`helper chips insert at the caret without running (${fixture.label})`, async t => {
    const page = await open(t, fixture, 960);
    // Role queries cannot pierce the closed shadow root, so read the group from inside it.
    const labels = await ev(page, () => {
      const group = window.ed.query('[role="group"][aria-label="Insert into command"]');
      return group ? [...group.querySelectorAll('button')].map(b => b.textContent) : [];
    });
    for (const label of ['res', 'req', 'schema(res)', '$prev', '$help']) assert.ok(labels.includes(label), `chip ${label}: ${labels}`);
    await ev(page, () => window.ed.draft('xy'));
    await ev(page, () => window.ed.setCaret(1));
    await ev(page, () => window.ed.queryAll('.xray-editor-chip').find(b => b.textContent === 'schema(res)').classList.add('probe'));
    const chip = await ev(page, () => window.ed.box('.xray-editor-chip.probe'));
    await page.mouse.click(chip.x, chip.y);
    assert.equal(await draft(page), 'xschema(res)y');
    assert.deepEqual(await ev(page, () => window.ed.caret()), [12, 12]);
    assert.equal(await ev(page, () => window.ed.focusedIsField()), true);
    assert.equal(await calls(page), 0, 'chips never evaluate');
    // Saved variables join the chips.
    await ev(page, () => { window.ed.vars.temp1 = {a:1}; window.ed.vars.$_ = 5; });
    await page.keyboard.type(' ');
    await page.waitForFunction(() => [...window.ed.root.querySelectorAll('.xray-editor-chip')].some(b => b.textContent === 'temp1'));
  });
}

for (const fixture of FIXTURES) {
  test(`mounted hidden, then shown: the field is a full line, not collapsed; it re-fits on resize (${fixture.label})`, async t => {
    const page = await open(t, fixture, 960, 760, undefined, true);
    await ev(page, () => window.ed.show());
    // A frame for the shown panel to lay out (and a ResizeObserver to report).
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const fits = box => box.scrollHeight <= box.clientHeight + 1;
    let box = await ev(page, () => {
      const f = window.ed.field(); const cs = getComputedStyle(f);
      return { ...window.ed.fieldBox(), padding: parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom), placeholder: f.placeholder, value: f.value };
    });
    assert.equal(box.value, '', 'empty draft: the placeholder shows');
    assert.ok(box.height >= box.lineHeight + box.padding - 1, `one full line tall: ${JSON.stringify(box)}`);
    assert.ok(fits(box), `placeholder not clipped: ${JSON.stringify(box)}`);
    // A long line wraps more at a narrower panel: the field grows to fit it.
    await ev(page, () => window.ed.draft('res.users.filter(u => u.email.endsWith("@x.io")).map(u => ({ id: u.id, name: u.name, email: u.email }))'));
    box = await ev(page, () => window.ed.fieldBox());
    assert.ok(fits(box), `fits at 960: ${JSON.stringify(box)}`);
    const wide = box.height;
    // Narrower panel: the viewport (the pop-out window) and the HUD host both shrink.
    await page.setViewportSize({ width: 480, height: 760 });
    await ev(page, () => window.ed.resize(480));
    await page.waitForFunction(() => { const b = window.ed.fieldBox(); return b.scrollHeight <= b.clientHeight + 1; }, null, { timeout: 2000 });
    box = await ev(page, () => window.ed.fieldBox());
    assert.ok(box.height > wide, `grew when the panel narrowed: ${JSON.stringify({ wide, box })}`);
    await page.setViewportSize({ width: 960, height: 760 });
    await ev(page, () => window.ed.resize(960));
    await page.waitForFunction(h => Math.abs(window.ed.fieldBox().height - h) <= 1, wide, { timeout: 2000 });
  });
}

test('editor grows to 8 lines, then scrolls', async t => {
  const page = await open(t, FIXTURES[0], 960, 900);
  const lines = n => Array.from({ length: n }, (_, i) => 'line ' + i).join('\n');
  await ev(page, code => window.ed.draft(code), lines(1));
  const one = await ev(page, () => window.ed.fieldBox());
  await ev(page, code => window.ed.draft(code), lines(8));
  const eight = await ev(page, () => window.ed.fieldBox());
  assert.ok(Math.abs(eight.height - one.height - 7 * one.lineHeight) <= 2, `8 lines grow by 7 line heights: ${JSON.stringify({ one, eight })}`);
  assert.ok(eight.scrollHeight <= eight.clientHeight + 1, 'no scroll at 8 lines');
  await ev(page, code => window.ed.draft(code), lines(12));
  const twelve = await ev(page, () => window.ed.fieldBox());
  assert.ok(Math.abs(twelve.height - eight.height) <= 1, `stops growing past 8 lines: ${JSON.stringify({ eight, twelve })}`);
  assert.ok(twelve.scrollHeight > twelve.clientHeight + 10, 'scrolls past 8 lines');
});

test('with the inspector open, Escape closes only the suggestion list', async t => {
  const page = await open(t, FIXTURES[1], 1600, 900);
  await page.keyboard.type('big');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.ed.query('button[aria-label="Open in inspector"]'));
  const box = await ev(page, () => window.ed.box('button[aria-label="Open in inspector"]'));
  await page.mouse.click(box.x, box.y);
  await page.waitForFunction(() => window.ed.inspector());
  await ev(page, () => window.ed.field().focus());
  await page.keyboard.type('res.us');
  await page.waitForFunction(() => window.ed.listbox());
  await page.keyboard.press('Escape');
  assert.equal(await ev(page, () => window.ed.listbox()), null, 'list closed');
  assert.ok(await ev(page, () => Boolean(window.ed.inspector())), 'inspector stays open');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !window.ed.inspector());
});

test('with the inspector open, Escape during a history recall restores the draft only', async t => {
  const page = await open(t, FIXTURES[1], 1600, 900);
  await page.keyboard.type('big');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.ed.query('button[aria-label="Open in inspector"]'));
  const box = await ev(page, () => window.ed.box('button[aria-label="Open in inspector"]'));
  await page.mouse.click(box.x, box.y);
  await page.waitForFunction(() => window.ed.inspector());
  await ev(page, () => window.ed.draft('mine'));
  await ev(page, () => window.ed.setCaret(0));
  await page.keyboard.press('ArrowUp');
  assert.equal(await draft(page), 'big', '↑ recalls history');
  await page.keyboard.press('Escape');
  assert.equal(await draft(page), 'mine', 'Escape restores the draft');
  assert.ok(await ev(page, () => Boolean(window.ed.inspector())), 'the same Escape leaves the inspector open');
  assert.equal(await ev(page, () => window.ed.focusedIsField()), true);
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !window.ed.inspector());
  assert.equal(await draft(page), 'mine');
  assert.equal(await ev(page, () => window.ed.storeOpen()), true, 'the panel stays open');
});

for (const fixture of FIXTURES) {
  test(`accepting a suggestion and inserting a chip are undoable (${fixture.label})`, async t => {
    const page = await open(t, fixture, 960);
    await page.keyboard.type('res.us');
    await page.waitForFunction(() => window.ed.listbox());
    await page.keyboard.press('Tab');
    assert.equal(await draft(page), 'res.users');
    await page.keyboard.press('Control+z');
    assert.equal(await draft(page), 'res.us', 'undo restores the text before the accept');

    await ev(page, () => window.ed.draft('xy'));
    await ev(page, () => window.ed.setCaret(1));
    await ev(page, () => window.ed.queryAll('.xray-editor-chip').find(b => b.textContent === 'schema(res)').classList.add('probe'));
    const chip = await ev(page, () => window.ed.box('.xray-editor-chip.probe'));
    await page.mouse.click(chip.x, chip.y);
    assert.equal(await draft(page), 'xschema(res)y');
    assert.deepEqual(await ev(page, () => window.ed.caret()), [12, 12]);
    await page.keyboard.press('Control+z');
    assert.equal(await draft(page), 'xy', 'undo removes the chip text');
    assert.equal(await calls(page), 0);
  });
}

for (const [theme, label] of [['xray-light', 'light'], ['midnight', 'dark'], ['xray-dark', 'default']]) {
  test(`token colours come from theme tokens (${label})`, async t => {
    const page = await open(t, FIXTURES[1], 960, 760, theme);
    await ev(page, () => window.ed.draft('const s = "x" + 1; // note\nfoo'));
    const c = await ev(page, () => window.ed.colours());
    assert.deepEqual(c.actual, c.expected);
    assert.equal(c.fieldColor, 'rgba(0, 0, 0, 0)', 'textarea text is transparent over the overlay');
    assert.equal(c.caret, c.expected.plain, 'caret uses the text token');
  });
}

/* ── Task 8: smart starters (P8) and the expanded editor (P10) ─────────────── */

const shotDir = fileURLToPath(new URL('../../output/console-redesign/final/', import.meta.url));

const STARTERS = ['Table of users', 'Count users', 'Find user by id', 'Diff with previous call', 'Schema'];

async function clickIn(page, group, text) {
  await ev(page, a => window.ed.clickByText(a.group, a.text), { group, text });
  const box = await ev(page, () => window.ed.box('.probe-click'));
  await ev(page, () => window.ed.query('.probe-click').classList.remove('probe-click'));
  await page.mouse.click(box.x, box.y);
}

async function clickButton(page, name) {
  const box = await ev(page, n => { const b = window.ed.button(n); b.classList.add('probe-btn'); const r = window.ed.box('.probe-btn'); b.classList.remove('probe-btn'); return r; }, name);
  await page.mouse.click(box.x, box.y);
}

for (const fixture of FIXTURES) {
  test(`starters: the empty state offers chips from res; a click fills the draft with the caret placed, never runs (${fixture.label})`, async t => {
    const page = await open(t, fixture, 960);
    assert.deepEqual(await ev(page, () => window.ed.groupLabels('Starter commands')), STARTERS);
    // No repeated chip rows: the empty state's starters replace the row above the
    // editor; the helper chips (different content) stay under it.
    assert.equal(await ev(page, () => window.ed.queryAll('[role="group"][aria-label="Starter commands"]').length), 1);
    assert.ok(await ev(page, () => window.ed.groupLabels('Insert into command')));
    await clickIn(page, 'Starter commands', 'Find user by id');
    const insert = 'res.users.find(u => u.id === )';
    assert.equal(await draft(page), insert);
    assert.deepEqual(await ev(page, () => window.ed.caret()), [insert.length - 1, insert.length - 1], 'caret before )');
    assert.equal(await ev(page, () => window.ed.focusedIsField()), true);
    assert.equal(await calls(page), 0, 'starters never evaluate');
    assert.equal(await ev(page, () => window.ed.cells().length), 0);
    // No request selected: the fixed examples, and no helper chips repeating them.
    await ev(page, () => { window.ed.draft(''); window.ed.select(null); });
    assert.deepEqual(await ev(page, () => window.ed.groupLabels('Example commands')), ['res', 'schema(res)', 'Object.keys(res)', '$help']);
    assert.equal(await ev(page, () => window.ed.groupLabels('Starter commands')), null);
    assert.equal(await ev(page, () => window.ed.groupLabels('Insert into command')), null, 'helper chips would repeat the examples');
  });

  test(`starters: a row above the editor while the draft is empty (${fixture.label})`, async t => {
    const page = await open(t, fixture, 960);
    await ev(page, () => window.ed.seedLog());
    const labels = await ev(page, () => window.ed.groupLabels('Starter commands'));
    assert.deepEqual(labels, STARTERS);
    const row = await ev(page, () => window.ed.rect('.xray-starter-row'));
    const field = await ev(page, () => window.ed.rect('.xray-editor-field'));
    assert.ok(row && row.bottom <= field.top + 1, `row sits above the editor: ${JSON.stringify({ row, field })}`);
    assert.ok(await ev(page, () => window.ed.groupLabels('Insert into command')), 'helper chips stay under the editor');
    await clickIn(page, 'Starter commands', 'Table of users');
    assert.equal(await draft(page), 'table(res.users)');
    assert.equal(await ev(page, () => window.ed.groupLabels('Starter commands')), null, 'row hides once the draft is not empty');
    assert.equal(await calls(page), 0);
    // Without a previous same-endpoint call there is no Diff starter.
    await ev(page, () => { window.ed.draft(''); window.ed.select('context'); });
    assert.deepEqual(await ev(page, () => window.ed.groupLabels('Starter commands')), ['Table of users', 'Count users', 'Find user by id', 'Schema']);
    // No request selected: no starter row.
    await ev(page, () => window.ed.select(null));
    assert.equal(await ev(page, () => window.ed.groupLabels('Starter commands')), null);
    // The engine sends only the newest 300 entries: once the previous call falls out
    // of that window, `prev` would be null, so Diff is not offered.
    await ev(page, () => window.ed.select('later'));
    assert.ok((await ev(page, () => window.ed.groupLabels('Starter commands'))).includes('Diff with previous call'));
    await ev(page, () => window.ed.addOthers(299));
    // 301 entries: 'context' (the previous call) is outside the window, 'later' inside.
    assert.deepEqual(await ev(page, () => window.ed.groupLabels('Starter commands')), ['Table of users', 'Count users', 'Find user by id', 'Schema']);
    assert.equal(await calls(page), 0);
  });

  test(`expanded editor: auto-closing brackets and quotes, no double insert, undo stays native (${fixture.label})`, async t => {
    const page = await open(t, fixture, 1600, 900);
    await page.keyboard.press('Control+ArrowUp');
    assert.equal(await ev(page, () => window.ed.expanded()), true);
    await page.keyboard.type('(');
    assert.equal(await draft(page), '()');
    assert.deepEqual(await ev(page, () => window.ed.caret()), [1, 1]);
    await page.keyboard.type(')');
    assert.equal(await draft(page), '()', 'typing the closer steps over it');
    assert.deepEqual(await ev(page, () => window.ed.caret()), [2, 2]);
    await page.keyboard.type(' "ab"');
    assert.equal(await draft(page), '() "ab"');
    await page.keyboard.type(' [{');
    assert.equal(await draft(page), '() "ab" [{}]');
    assert.equal(await ev(page, () => window.ed.listbox()), null, 'an auto-inserted pair does not open suggestions');
    await page.keyboard.press('Backspace');
    assert.equal(await draft(page), '() "ab" []', 'Backspace inside an empty pair removes both');
    await page.keyboard.press('Control+z');
    assert.equal(await draft(page), '() "ab" [{}]', 'undo restores the pair');
    // A programmatic edit never opens the suggestion list (here `res[` would).
    await ev(page, () => window.ed.draft(''));
    await ev(page, () => window.ed.setCaret(0));
    await page.keyboard.type('res[');
    assert.equal(await draft(page), 'res[]');
    assert.equal(await ev(page, () => window.ed.listbox()), null, 'auto-close does not open suggestions');
    await ev(page, () => window.ed.draft('() "ab" [{}]'));
    // An apostrophe after a letter is not paired.
    await ev(page, () => window.ed.draft('don'));
    await ev(page, () => window.ed.setCaret(3));
    await page.keyboard.type("'");
    assert.equal(await draft(page), "don'");
    // Keys that are part of an IME composition are left alone.
    await ev(page, () => window.ed.draft(''));
    await ev(page, () => { const f = window.ed.field(); f.focus(); f.dispatchEvent(new KeyboardEvent('keydown', { key: '(', bubbles: true, isComposing: true })); });
    assert.equal(await draft(page), '');
    assert.equal(await calls(page), 0);
  });
}

test('expanded editor: Ctrl+↑ toggles; line numbers; ≥ 50% of the Console at 1600; collapsing keeps the draft', async t => {
  const page = await open(t, FIXTURES[0], 1600, 900);
  await ev(page, () => window.ed.seedLog());
  await ev(page, () => window.ed.draft('a\nb\nc'));
  await ev(page, () => window.ed.field().focus());
  assert.equal(await ev(page, () => window.ed.gutter()), null, 'no gutter collapsed');
  await page.keyboard.press('Control+ArrowUp');
  assert.equal(await ev(page, () => window.ed.expanded()), true);
  assert.equal(await ev(page, () => window.ed.gutter()), '123');
  assert.equal(await ev(page, () => window.ed.focusedIsField()), true, 'focus stays in the textarea');
  const field = await ev(page, () => window.ed.rect('.xray-editor-field'));
  const consoleBox = await ev(page, () => window.ed.rect('.xray-console-workspace'));
  assert.ok(field.height >= consoleBox.height * 0.5, `editor ≥ 50% of the Console: ${JSON.stringify({ field, consoleBox })}`);
  assert.ok((await ev(page, () => window.ed.rect('.xray-console-stream-wrap'))).height > 40, 'the stream stays visible at 1600');
  const toggle = await ev(page, () => window.ed.button('Expand editor').getAttribute('aria-pressed'));
  assert.equal(toggle, 'true');
  await page.keyboard.press('Control+ArrowUp');
  assert.equal(await ev(page, () => window.ed.expanded()), false);
  assert.equal(await draft(page), 'a\nb\nc', 'draft intact');
  assert.equal(await ev(page, () => window.ed.gutter()), null);
  // The toggle button does the same.
  await clickButton(page, 'Expand editor');
  assert.equal(await ev(page, () => window.ed.expanded()), true);
  assert.equal(await calls(page), 0);
});

test('expanded editor fills the Console height at 420', async t => {
  const page = await open(t, FIXTURES[1], 420, 760);
  await ev(page, () => window.ed.seedLog());
  await page.keyboard.press('Control+ArrowUp');
  assert.equal(await ev(page, () => window.ed.expanded()), true);
  const field = await ev(page, () => window.ed.rect('.xray-editor-field'));
  const consoleBox = await ev(page, () => window.ed.rect('.xray-console-workspace'));
  const stream = await ev(page, () => window.ed.rect('.xray-console-stream-wrap'));
  assert.equal(stream.visible, false, 'the stream steps aside');
  assert.ok(field.height >= consoleBox.height * 0.6, `editor fills the Console: ${JSON.stringify({ field, consoleBox })}`);
  assert.ok(field.bottom <= consoleBox.bottom, 'nothing overflows the Console');
  // Running from the full-height editor steps it aside so the result is visible.
  await ev(page, () => window.ed.draft('1+1'));
  await ev(page, () => window.ed.field().focus());
  await page.keyboard.press('Control+Enter');
  await page.waitForFunction(() => window.ed.cells().length === 1);
  assert.equal(await ev(page, () => window.ed.expanded()), false);
  assert.equal((await ev(page, () => window.ed.rect('.xray-console-stream-wrap'))).visible, true, 'stream is back');
  assert.ok((await ev(page, () => window.ed.rect('.xray-command-cell'))).visible, 'the result cell is painted');
  assert.equal(await draft(page), '1+1', 'draft intact');
  assert.deepEqual(await ev(page, () => window.ed.calls), ['1+1']);
});

for (const height of [760, 360]) {
  test(`expanded editor at 420×${height}: the suggestion list stays on screen inside the field, active option visible`, async t => {
    const page = await open(t, FIXTURES[1], 420, height);
    await ev(page, () => window.ed.seedLog());
    // Saved variables temp1…temp20: a full list (8 suggestions).
    await ev(page, () => { for (let i = 1; i <= 20; i += 1) window.ed.vars['temp' + i] = i; });
    // The HUD slides in: measure once it has settled.
    await page.waitForFunction(() => window.ed.query('.xray-panel').getBoundingClientRect().right <= innerWidth + 0.5);
    await page.keyboard.press('Control+ArrowUp');
    assert.equal(await ev(page, () => window.ed.expanded()), true);
    await page.keyboard.type('te');
    await page.waitForFunction(() => window.ed.listbox()?.options.length >= 8);
    const inside = g => g.list.top >= 0 && g.list.left >= 0 && g.list.bottom <= g.vh && g.list.right <= g.vw &&
      g.list.top >= g.field.top && g.list.bottom <= g.field.bottom && g.list.left >= g.field.left && g.list.right <= g.field.right;
    const visible = g => g.active.top >= g.list.top - 0.5 && g.active.bottom <= g.list.bottom + 0.5;
    let geo = await ev(page, () => window.ed.listGeometry());
    assert.ok(inside(geo), `listbox within the viewport and the field: ${JSON.stringify(geo)}`);
    assert.ok(visible(geo), `first option visible: ${JSON.stringify(geo)}`);
    const clearOfCaret = g => g.list.top >= g.caretLine.bottom - 0.5 || g.list.bottom <= g.caretLine.top + 0.5;
    assert.ok(clearOfCaret(geo), `the list does not cover the line being typed: ${JSON.stringify(geo)}`);
    mkdirSync(shotDir, { recursive: true });
    await page.screenshot({ path: `${shotDir}/expanded-420x${height}-suggestions.png` });
    // ↑ wraps to the last option; in a short pane it starts below the fold and the list scrolls to it.
    await page.keyboard.press('ArrowUp');
    geo = await ev(page, () => window.ed.listGeometry());
    assert.equal(geo.last, 'true', 'the last option is active');
    assert.ok(visible(geo), `active option visible: ${JSON.stringify(geo)}`);
    assert.ok(inside(geo), 'still on screen');
    // On a later line of a longer draft the list follows the caret's line.
    await page.keyboard.press('Escape');
    await ev(page, () => window.ed.draft('a\nb\nc\n'));
    await ev(page, () => window.ed.setCaret(6));
    await page.keyboard.type('te');
    await page.waitForFunction(() => window.ed.listbox()?.options.length >= 8);
    geo = await ev(page, () => window.ed.listGeometry());
    assert.ok(inside(geo) && clearOfCaret(geo) && visible(geo), `line 4: ${JSON.stringify(geo)}`);
    // Collapsed, the list still opens above the field.
    await page.keyboard.press('Escape');
    await page.keyboard.press('Control+ArrowUp');
    assert.equal(await ev(page, () => window.ed.expanded()), false);
    await page.keyboard.type('m');
    await page.waitForFunction(() => window.ed.listbox());
    geo = await ev(page, () => window.ed.listGeometry());
    assert.ok(geo.list.bottom <= geo.field.top + 1, `collapsed: above the field: ${JSON.stringify(geo)}`);
    assert.equal(await calls(page), 0);
  });
}

test('expanded editor: Format re-indents; Ctrl+Enter runs all; Run selection runs only the selection; Save as snippet', async t => {
  const page = await open(t, FIXTURES[1], 1600, 900);
  await page.keyboard.press('Control+ArrowUp');
  await ev(page, () => window.ed.draft('if (ok) {\nlog("{");\n      }'));
  await ev(page, () => window.ed.setCaret(0));
  await clickButton(page, 'Format');
  assert.equal(await draft(page), 'if (ok) {\n  log("{");\n}');
  assert.equal(await ev(page, () => window.ed.listbox()), null, 'Format does not open suggestions');
  assert.equal(await calls(page), 0, 'Format never evaluates');

  // Enter is a newline in the expanded editor; Ctrl+Enter runs all.
  await ev(page, () => window.ed.draft('1 +'));
  await ev(page, () => window.ed.setCaret(3));
  await page.keyboard.press('Enter');
  await page.keyboard.type('2');
  assert.equal(await draft(page), '1 +\n2');
  assert.equal(await calls(page), 0);
  await page.keyboard.press('Control+Enter');
  await page.waitForFunction(() => window.ed.calls.length === 1);
  assert.deepEqual(await ev(page, () => window.ed.calls), ['1 +\n2']);
  await page.waitForFunction(() => window.ed.cells().length === 1);
  assert.equal(await draft(page), '1 +\n2', 'the expanded draft survives Run all');
  assert.equal(await ev(page, () => window.ed.expanded()), true);

  // Run selection: only the selected text runs, through the same run path.
  assert.equal(await ev(page, () => window.ed.button('Run selection').disabled), true, 'Run selection waits for a selection');
  await ev(page, () => window.ed.draft('one\n2 + 3\nthree'));
  await ev(page, () => { const f = window.ed.field(); f.focus(); f.setSelectionRange(4, 9); f.dispatchEvent(new Event('select', { bubbles: true })); });
  await page.waitForFunction(() => !window.ed.button('Run selection').disabled);
  await clickButton(page, 'Run selection');
  await page.waitForFunction(() => window.ed.calls.length === 2);
  assert.deepEqual(await ev(page, () => window.ed.calls), ['1 +\n2', '2 + 3']);
  assert.equal(await draft(page), 'one\n2 + 3\nthree');
  await page.waitForFunction(() => window.ed.cells().length === 2);

  // Save as snippet adds the draft to Snippets.
  const before = await ev(page, () => window.ed.snippets());
  await clickButton(page, 'Save as snippet');
  const after = await ev(page, () => window.ed.snippets());
  assert.equal(after.length, before.length + 1);
  assert.ok(after.includes('one\n2 + 3\nthree'));
  assert.equal(await calls(page), 2);
});

// Task 3 (autocomplete): accept ranges, groups, Ctrl+Space browse, live region.
const optionLabels = page => ev(page, () => window.ed.queryAll('[role="listbox"] [role="option"]').map(o => o.querySelector('.xray-editor-option-label').textContent));
const groupNames = page => ev(page, () => window.ed.queryAll('[role="listbox"] [role="group"]').map(g => {
  const header = g.getAttribute('aria-labelledby') && window.ed.root.getElementById
    ? window.ed.root.getElementById(g.getAttribute('aria-labelledby'))
    : window.ed.root.querySelector('#' + CSS.escape(g.getAttribute('aria-labelledby')));
  return header ? header.textContent : null;
}));
const live = page => ev(page, () => window.ed.query('.xray-editor-live')?.textContent ?? null);

for (const fixture of FIXTURES) {
  test(`Ctrl+Space browses grouped helpers (${fixture.label})`, async t => {
    const page = await open(t, fixture, 960);
    await page.keyboard.press('Control+Space');
    await page.waitForFunction(() => window.ed.listbox());
    assert.deepEqual(await groupNames(page), ['Request data', 'Find entries', 'Transform', 'Output']);
    const first = await ev(page, () => window.ed.listbox());
    assert.equal(first.activedescendant, first.selected[0]);
    await page.keyboard.press('ArrowDown');
    const second = await ev(page, () => window.ed.listbox());
    assert.notEqual(second.activedescendant, first.activedescendant);
    assert.ok(await ev(page, () => window.ed.query('#' + CSS.escape(window.ed.field().getAttribute('aria-activedescendant'))).getAttribute('role')) === 'option', 'headers never become the active descendant');
    // Walk to $status and accept.
    const labels = await optionLabels(page);
    const target = labels.indexOf('$status');
    assert.ok(target >= 0, `$status offered: ${labels}`);
    for (let i = 1; i < target; i += 1) await page.keyboard.press('ArrowDown');
    if (target === 0) await page.keyboard.press('ArrowUp');
    await page.keyboard.press('Enter');
    assert.equal(await draft(page), '$status(');
    assert.deepEqual(await ev(page, () => window.ed.caret()), [8, 8]);
    assert.equal(await calls(page), 0);
  });

  test(`array key plucks with map (${fixture.label})`, async t => {
    const page = await open(t, fixture, 960);
    await page.keyboard.type('res.users.');
    await page.waitForFunction(() => window.ed.listbox());
    const labels = await optionLabels(page);
    assert.ok(labels.includes('[0]'), `[0] offered: ${labels}`);
    assert.deepEqual(await groupNames(page), ['keys across 2 items']);
    const target = await ev(page, () => window.ed.queryAll('[role="listbox"] [role="group"] [role="option"] .xray-editor-option-label').map(e => e.textContent).indexOf('email'));
    assert.ok(target >= 0);
    const flat = await ev(page, () => window.ed.queryAll('[role="listbox"] [role="option"]').map(o => o.querySelector('.xray-editor-option-label').textContent));
    const index = flat.lastIndexOf('email');
    for (let i = 0; i < index; i += 1) await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    assert.equal(await draft(page), 'res.users.map(x => x.email)');
    assert.equal(await calls(page), 0);
  });

  test(`method template places the caret (${fixture.label})`, async t => {
    const page = await open(t, fixture, 960);
    await page.keyboard.type('res.users.fil');
    await page.waitForFunction(() => window.ed.listbox());
    await page.keyboard.press('Enter');
    assert.equal(await draft(page), 'res.users.filter(x => x.)');
    await page.keyboard.type('id');
    assert.equal(await draft(page), 'res.users.filter(x => x.id)');
  });

  test(`accept replaces only the typed range (${fixture.label})`, async t => {
    const page = await open(t, fixture, 960);
    await ev(page, () => window.ed.draft('res.users..length'));
    await ev(page, () => window.ed.setCaret(10));
    await page.keyboard.press('Control+Space');
    await page.waitForFunction(() => window.ed.listbox());
    const labels = await optionLabels(page);
    const index = labels.indexOf('[0]');
    assert.ok(index >= 0, `[0] offered: ${labels}`);
    for (let i = 0; i < index; i += 1) await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    assert.equal(await draft(page), 'res.users[0].length');
  });

  test(`live region announces counts, singular for one (${fixture.label})`, async t => {
    const page = await open(t, fixture, 960);
    assert.equal(await ev(page, () => window.ed.query('.xray-editor-live').getAttribute('aria-live')), 'polite');
    await page.keyboard.type('res.users.');
    await page.waitForFunction(() => window.ed.listbox());
    const n = await ev(page, () => window.ed.queryAll('[role="listbox"] [role="option"]').length);
    assert.equal(await live(page), `${n} suggestions`);
    await clearDraft(page);
    await ev(page, () => window.ed.draft('res.meta.pag'));
    await ev(page, () => window.ed.setCaret(12));
    await page.keyboard.press('Control+Space');
    await page.waitForFunction(() => window.ed.listbox());
    assert.equal(await ev(page, () => window.ed.queryAll('[role="listbox"] [role="option"]').length), 1);
    assert.equal(await live(page), '1 suggestion');
    await page.keyboard.press('Escape');
    await clearDraft(page);
    await page.keyboard.type('zzz');
    await page.keyboard.press('Control+Space');
    await page.waitForFunction(() => window.ed.query('.xray-editor-live').textContent === 'No suggestions');
    // The empty manual open is visible too: a non-interactive row, not an option.
    const row = await ev(page, () => {
      const el = window.ed.query('.xray-editor-suggestions-empty');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { text: el.textContent, role: el.getAttribute('role'), visible: r.height > 0 && r.width > 0, options: window.ed.queryAll('[role="option"]').length };
    });
    assert.ok(row, 'empty-state row rendered');
    assert.equal(row.text, 'No suggestions');
    assert.notEqual(row.role, 'option');
    assert.ok(row.visible, 'empty-state row is visible');
    assert.equal(row.options, 0);
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => window.ed.query('.xray-editor-live').textContent === '');
    assert.equal(await ev(page, () => window.ed.query('.xray-editor-suggestions-empty')), null, 'row gone after Escape');
    await clearDraft(page);
    await page.keyboard.type('res.users.');
    await page.waitForFunction(() => window.ed.listbox());
    await page.keyboard.press('Escape');
    assert.equal(await live(page), '');
  });

  test(`$status( offers captured codes (${fixture.label})`, async t => {
    const page = await open(t, fixture, 960);
    await ev(page, () => window.ed.seedCaptured());
    await page.keyboard.type('$status(');
    await page.waitForFunction(() => window.ed.listbox());
    assert.deepEqual(await optionLabels(page), ['200', '404']);
    assert.deepEqual(await ev(page, () => window.ed.optionDetails()), ['×2', '×1 · error']);
    await page.keyboard.press('Enter');
    assert.equal(await draft(page), '$status(200');
    assert.equal(await calls(page), 0);
  });

  test(`$endpoint( offers captured paths (${fixture.label})`, async t => {
    const page = await open(t, fixture, 960);
    await ev(page, () => window.ed.seedCaptured());
    await page.keyboard.type("$endpoint('");
    await page.waitForFunction(() => window.ed.listbox());
    assert.equal((await optionLabels(page))[0], '/api/users');
    await page.keyboard.press('Enter');
    assert.equal(await draft(page), "$endpoint('/api/users'");
  });

  test(`pick offers keys of its first argument (${fixture.label})`, async t => {
    const page = await open(t, fixture, 960);
    await ev(page, () => window.ed.seedCaptured());
    await page.keyboard.type("pick(res, ['");
    await page.waitForFunction(() => window.ed.listbox());
    assert.deepEqual(await optionLabels(page), ['users', 'meta']);
  });

  test(`hint highlights the active argument (${fixture.label})`, async t => {
    const page = await open(t, fixture, 960);
    await page.keyboard.type('diff(a, ');
    await page.waitForFunction(() => window.ed.hintParam());
    assert.equal(await ev(page, () => window.ed.hintParam()), 'b');
    assert.equal(await ev(page, () => window.ed.hintNote()), 'The value to compare against a.');
    assert.match(await ev(page, () => window.ed.hint()), /diff\(a, b\)/);
    await clearDraft(page);
    await page.keyboard.type('diff(');
    await page.waitForFunction(() => window.ed.hintParam());
    assert.equal(await ev(page, () => window.ed.hintParam()), 'a');
    assert.equal(await ev(page, () => window.ed.hintNote()), 'The baseline value.');
  });

  test(`no entries, no value list (${fixture.label})`, async t => {
    const page = await open(t, fixture, 960);
    await ev(page, () => window.ed.noEntries());
    await ev(page, () => window.ed.field().focus());
    await page.keyboard.type('$status(');
    await page.waitForTimeout(150);
    assert.equal(await ev(page, () => window.ed.listbox()), null);
  });
}

// Final fix wave (whole-branch review).
for (const fixture of FIXTURES) {
  test(`filtered keys: one header per group, groups after ungrouped options (${fixture.label})`, async t => {
    const page = await open(t, fixture, 960);
    await page.keyboard.type('res.users.e');
    await page.waitForFunction(() => window.ed.listbox());
    const names = await groupNames(page);
    assert.deepEqual(names, [...new Set(names)], `no duplicate group headers: ${names}`);
    const order = await ev(page, () => [...window.ed.query('[role="listbox"]').children].map(li => li.getAttribute('role')));
    const firstGroup = order.indexOf('group');
    assert.ok(firstGroup >= 0, `a group is shown: ${order}`);
    assert.ok(order.slice(firstGroup).every(role => role === 'group'), `no ungrouped option after a group: ${order}`);
    assert.equal(await calls(page), 0);
  });

  test(`expanded editor: accepting a quoted value does not double the closer (${fixture.label})`, async t => {
    const page = await open(t, fixture, 1600, 900);
    await ev(page, () => window.ed.seedCaptured());
    await page.keyboard.press('Control+ArrowUp');
    assert.equal(await ev(page, () => window.ed.expanded()), true);
    await page.keyboard.type("$endpoint('");
    assert.equal(await draft(page), "$endpoint('')");
    await page.keyboard.press('Control+Space');
    await page.waitForFunction(() => window.ed.listbox());
    assert.equal((await optionLabels(page))[0], '/api/users');
    await page.keyboard.press('Enter');
    assert.equal(await draft(page), "$endpoint('/api/users')");
    await ev(page, () => window.ed.draft(''));
    await ev(page, () => window.ed.setCaret(0));
    await page.keyboard.type('res["');
    assert.equal(await draft(page), 'res[""]');
    await page.keyboard.press('Control+Space');
    await page.waitForFunction(() => window.ed.listbox());
    assert.equal((await optionLabels(page))[0], 'users');
    await page.keyboard.press('Enter');
    assert.equal(await draft(page), 'res["users"]');
    assert.equal(await calls(page), 0);
  });

  test(`a finished argument does not reopen the list: Enter runs (${fixture.label})`, async t => {
    const page = await open(t, fixture, 960);
    await ev(page, () => window.ed.seedCaptured());
    await page.keyboard.type('$status(200 ');
    await page.waitForTimeout(100);
    assert.equal(await ev(page, () => window.ed.listbox()), null, 'no value list after a finished number');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.ed.calls.length === 1);
    assert.deepEqual((await ev(page, () => window.ed.calls)).map(c => c.trim()), ['$status(200']);
  });

  test(`expanded editor: "No suggestions" sits at the caret line (${fixture.label})`, async t => {
    const page = await open(t, fixture, 1600, 900);
    await page.keyboard.press('Control+ArrowUp');
    assert.equal(await ev(page, () => window.ed.expanded()), true);
    await ev(page, () => window.ed.draft('a\nb\nzzz'));
    await ev(page, () => window.ed.setCaret(7));
    await page.keyboard.press('Control+Space');
    await page.waitForFunction(() => window.ed.query('.xray-editor-suggestions-empty'));
    const geo = await ev(page, () => {
      const row = window.ed.query('.xray-editor-suggestions-empty').getBoundingClientRect();
      const ta = window.ed.field(); const cs = getComputedStyle(ta); const lh = parseFloat(cs.lineHeight);
      const lineIndex = ta.value.slice(0, ta.selectionStart).split('\n').length - 1;
      const lineTop = ta.getBoundingClientRect().top + parseFloat(cs.paddingTop) + lineIndex * lh - ta.scrollTop;
      return { rowTop: row.top, lineTop, lh, lineIndex };
    });
    assert.equal(geo.lineIndex, 2, 'caret on line 3');
    assert.ok(Math.abs(geo.rowTop - geo.lineTop) <= 2 * geo.lh, `row within 2 lines of the caret line: ${JSON.stringify(geo)}`);
    assert.equal(await calls(page), 0);
  });

  test(`Ctrl+Space stays open while typing an identifier (${fixture.label})`, async t => {
    const page = await open(t, fixture, 960);
    await page.keyboard.press('Control+Space');
    await page.waitForFunction(() => window.ed.listbox());
    await page.keyboard.type('s');
    await page.waitForTimeout(100);
    const list = await ev(page, () => window.ed.listbox());
    assert.ok(list, 'list still open after one character');
    assert.ok(list.options.includes('schema'), `schema offered: ${list?.options}`);
    await page.keyboard.press('Escape');
    assert.equal(await ev(page, () => window.ed.listbox()), null);
    // A non-identifier character ends the manual open; the 2-character gate is back.
    await page.keyboard.press('Control+Space');
    await page.waitForFunction(() => window.ed.listbox());
    await page.keyboard.type(' x');
    await page.waitForTimeout(100);
    assert.equal(await ev(page, () => window.ed.listbox()), null);
    assert.equal(await calls(page), 0);
  });
}
