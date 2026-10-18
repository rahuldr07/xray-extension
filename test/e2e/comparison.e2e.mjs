import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { before, after } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { hostify, loadWorker } from '../unit/runtime/vm-load.mjs';

// Real components, store and modal keyboard ownership; only extension boundaries
// are stubbed. Removing the comparison actions/evidence must fail these tests.
const { outputFiles } = await build({
  stdin: {
    resolveDir: fileURLToPath(new URL('../../', import.meta.url)), loader: 'jsx',
    contents: `
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      import { flushSync } from 'react-dom';
      import { RequestDetail } from './src/panel/components/detail/RequestDetail';
      import { CommandPalette } from './src/panel/components/shell/CommandPalette';
      import { installPanelKeyboard } from './src/panel/runtime/panelKeyboard';
      import { usePanelStore } from './src/panel/store';
      import styles from './src/panel/styles.css';
      const left = {id:'left',type:'api',method:'GET',url:'https://one.test/users',urlPath:'/users',
        source:'fetch',status:200,duration:12,size:100,timestamp:1,
        requestHeaders:{authorization:'[redacted]','x-before':'old'},requestBody:{page:1},
        responseHeaders:{'content-type':'application/json'},responseRaw:'{"count":1,"removed":true}'};
      const right = {id:'right',type:'api',method:'POST',url:'https://two.test/graphql',urlPath:'/graphql',
        graphql:{operationType:'mutation',operationName:'Save'},source:'xhr',status:503,duration:80,size:220,timestamp:2,
        requestHeaders:{authorization:'[redacted]','x-after':'new'},requestBody:{page:2},
        responseHeaders:{'content-type':'text/plain'},responseRaw:'{"count":2,"added":true}'};
      function Fixture() {
        const entries=usePanelStore(s=>s.entries);
        const selected=usePanelStore(s=>s.selectedId);
        const tab=usePanelStore(s=>s.activeTab);
        const entry=entries.find(e=>e.id===selected);
        return <div className="xray-theme-scope xray-theme-operator"><div className="xray-panel xray-mode-window xray-open">
          {tab==='api' && entry?.type==='api' && <RequestDetail entry={entry} />}
          <button id="outside">Outside</button><CommandPalette />
        </div></div>;
      }
      window.compareTest={
        calls:{replay:0,console:0,rules:0,storage:0,bridge:0},errors:[],
         setup(shadow) {
           const host=document.body.appendChild(document.createElement('div'));
           this.root=shadow ? host.attachShadow({mode:'closed'}) : document;
          const sheet=document.createElement('style');sheet.textContent=styles;
          (shadow ? this.root : document.head).appendChild(sheet);
          const mount=shadow ? this.root.appendChild(document.createElement('div')) : host;
          window.XRAY_Store={get:async()=>null,set:()=>{this.calls.storage++;}};
          window.addEventListener('message',()=>{this.calls.bridge++;});
          window.addEventListener('error',event=>this.errors.push(event.message));
          window.addEventListener('unhandledrejection',event=>this.errors.push(String(event.reason)));
           if (this.useWorkerDiff && !this.workerAbsent) {
             window.XRAY_Worker={detailAnalysis:async()=>this.workerResult};
           }
           const detailEntries=this.useWorkerDiff ? [left,{...left,id:'baseline',responseRaw:'{"count":0}'},right,{id:'log',type:'log',message:'fixture'}] : [left,right,{id:'log',type:'log',message:'fixture'}];
           usePanelStore.setState({entries:detailEntries,selectedId:'left',
            open:true,activeTab:'api',apiDetailOpen:true,detailView:'schema',detailTab:'response',consoleDraft:'unchanged',
            replayEntry:()=>this.calls.replay++,insertConsoleCommand:()=>this.calls.console++,addRule:()=>{this.calls.rules++;}});
          installPanelKeyboard({dismissible:true,getRoot:()=>this.root});
          flushSync(()=>createRoot(mount).render(<Fixture />));
        },
        set(state){flushSync(()=>usePanelStore.setState(state));},
        action(name,...args){flushSync(()=>usePanelStore.getState()[name](...args));},
        focus(selector){const el=this.root.querySelector(selector);if(!el)throw new Error('Missing '+selector);el.focus();},
        choose(side,id){const el=this.root.querySelector('[aria-label="'+side+' comparison request"]');el.value=id;el.dispatchEvent(new Event('change',{bubbles:true}));},
        focusButton(text){const el=[...this.root.querySelectorAll('button')].find(b=>b.textContent.trim()===text || b.getAttribute('aria-label')===text || b.querySelector('.xray-command-label')?.textContent===text);if(!el)throw new Error('Missing button '+text);el.focus();},
        equalStatus(){this.set({entries:[left,{...right,status:200,duration:12}]});},
        unavailable(){
          const cyclic={name:'cycle'};cyclic.self=cyclic;
          this.set({entries:[{...left,requestBody:cyclic,responseRaw:'x'.repeat(20050)}, {...right,requestBody:undefined,responseRaw:null}]});
        },
        snapshot(){
          const s=usePanelStore.getState(),root=this.root,dialog=root.querySelector('.xray-compare-modal');
          return {left:s.compareLeftId??null,right:s.compareRightId??null,compareOpen:!!s.compareOpen,
            selected:s.selectedId,view:s.detailView,tab:s.detailTab,draft:s.consoleDraft,activeTab:s.activeTab,
            open:s.open,drawer:s.apiDetailOpen,entries:s.entries.map(e=>e.id),rules:s.rules,calls:this.calls,errors:this.errors,
            dialogs:[...root.querySelectorAll('[role="dialog"]')].map(el=>el.getAttribute('aria-label')),
            text:dialog?.textContent||'',focus:root.activeElement?.getAttribute('aria-label')||root.activeElement?.textContent?.trim(),
            focusInDialog:!!dialog?.contains(root.activeElement),
            leftValue:root.querySelector('[aria-label="Left comparison request"]')?.value,
            rightValue:root.querySelector('[aria-label="Right comparison request"]')?.value,
            options:[...root.querySelectorAll('[aria-label="Left comparison request"] option')].map(o=>o.value),
            optionText:[...root.querySelectorAll('[aria-label="Left comparison request"] option')].map(o=>o.textContent),
            results:[...root.querySelectorAll('.xray-compare-result')].map(el=>el.className.replace('xray-compare-result ','')+':'+el.textContent),
            equalToggle:root.querySelector('.xray-compare-equal-toggle')?.textContent||null,
            capturedOpen:!!root.querySelector('.xray-compare-captured')?.open,
            rows:[...root.querySelectorAll('.xray-command-label')].map(el=>el.textContent),
            changed:root.querySelector('[aria-label="Response body differences"]')?.textContent};
        }
      };
    `,
  }, loader: { '.css': 'text' }, bundle: true, format: 'iife', write: false,
});

let browser;
before(async () => {
  const executablePath = process.env.XRAY_BROWSER_EXECUTABLE ||
    (!existsSync(chromium.executablePath()) && existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined);
  browser = await chromium.launch({ executablePath, headless: true });
});
after(async () => { await browser?.close(); });
async function fixture(t, { shadow = false, width = 960, workerDiff = false, workerAbsent = false,
  workerResult = { diff: { previous: 'raw-worker-previous', current: 'raw-worker-current', structuralDiff: [{ type: 'changed', path: 'count', from: 1, to: 2 }] } },
} = {}) {
  const page = await browser.newPage({ viewport: { width, height: 700 } });
  t.after(() => page.close());
  await page.setContent('<style>body{margin:0}</style>');
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(options => Object.assign(window.compareTest, options), { useWorkerDiff: workerDiff, workerAbsent, workerResult });
  await page.evaluate(shadow => window.compareTest.setup(shadow), shadow);
  return page;
}

test('valid worker diff renders bounded structural lines and ignores raw worker snapshots', async t => {
  const page = await fixture(t, { workerDiff: true });
  await set(page, { detailView: 'diff', detailTab: 'response' });
  await page.waitForTimeout(50);
  const diff = page.locator('.xray-diff');
  await diff.waitFor();
  const text = await diff.textContent();
  assert.match(text, /count/);
  assert.match(text, /1/);
  assert.match(text, /2/);
  assert.doesNotMatch(text, /raw-worker-(?:previous|current)/);
});

const diffState = page => page.evaluate(() => {
  const root = window.compareTest.root;
  return {
    text: root.querySelector('.xray-diff')?.textContent,
    lines: [...root.querySelectorAll('.xray-diff-line')].map(line => ({
      kind: line.classList[1], path: line.querySelector('.xray-diff-path').textContent,
      before: line.querySelector('.xray-diff-before')?.textContent,
      after: line.querySelector('.xray-diff-after')?.textContent,
    })),
    errors: window.compareTest.errors,
  };
});

for (const shadow of [false, true]) {
  test(`real worker producer diff maps all three row variants (${shadow ? 'closed shadow' : 'document'})`, async t => {
    const producer = loadWorker();
    const result = hostify(producer.detailAnalysis(
      { changed: 'worker-new', added: 'worker-added' },
      { changed: 'worker-old', removed: 'worker-removed' },
    ));
    result.diff.previous = 'raw-worker-previous';
    result.diff.current = 'raw-worker-current';
    const page = await fixture(t, { shadow, workerDiff: true, workerResult: result });
    await set(page, { detailView: 'diff', detailTab: 'response' });
    const state = await diffState(page);
    assert.deepEqual(state.lines, [
      { kind: 'changed', path: 'changed', before: 'worker-old', after: 'worker-new' },
      { kind: 'removed', path: 'removed', before: 'worker-removed', after: undefined },
      { kind: 'added', path: 'added', before: undefined, after: 'worker-added' },
    ]);
    assert.doesNotMatch(state.text, /raw-worker-(?:previous|current)/);
    assert.deepEqual(state.errors, []);
  });
}

test('malformed and unavailable worker output uses the bounded synchronous detail diff', async t => {
  const invalid = [
    null,
    { structuralDiff: 'raw-worker-current' },
    { structuralDiff: [{ type: 'changed', path: 'invalid', from: 'worker-old' }] },
    { structuralDiff: [{ type: 'changed', path: 'invalid', to: 'worker-new' }] },
    { structuralDiff: [{ type: 'added', path: 'invalid', to: 'wrong-field' }] },
    { structuralDiff: [{ type: 'removed', path: 'invalid', from: 'wrong-field' }] },
    { structuralDiff: [{ type: 'unknown', path: 'invalid', value: true }] },
    { structuralDiff: [{ type: 'added', path: 12, value: true }] },
    { structuralDiff: [{ type: 'added', path: 'x'.repeat(501), value: true }] },
    { structuralDiff: [null] },
    { structuralDiff: [...Array.from({ length: 200 }, (_, i) => ({ type: 'added', path: `worker-${i}`, value: i })), { type: 'added', path: 'invalid' }] },
  ];
  for (const diff of invalid) {
    const page = await fixture(t, { workerDiff: true, workerResult: { diff } });
    await set(page, { detailView: 'diff', detailTab: 'response' });
    const state = await diffState(page);
    assert.deepEqual(state.lines, [
      { kind: 'changed', path: 'count', before: '0', after: '1' },
      { kind: 'added', path: 'removed', before: undefined, after: 'true' },
    ], 'an invalid worker diff falls back as a whole');
    assert.deepEqual(state.errors, []);
    await page.close();
  }

  const page = await fixture(t, { workerDiff: true, workerAbsent: true });
  const baseline = { id: 'fallback-before', type: 'api', urlPath: '/fallback', timestamp: 1, responseRaw: '{}' };
  const current = { ...baseline, id: 'fallback-after', timestamp: 2, responseRaw: JSON.stringify(Object.fromEntries(Array.from({ length: 350 }, (_, i) => [`field-${i}`, i]))) };
  await set(page, { entries: [baseline, current], selectedId: current.id, detailView: 'diff' });
  assert.equal((await diffState(page)).lines.length, 200, 'fallback line cap stays 200');
});

test('valid empty worker diff and explicit null/undefined/falsy fields are not rejected', async t => {
  for (const rows of [[], [
    { type: 'added', path: 'null', value: null },
    { type: 'removed', path: 'undefined', value: undefined },
    { type: 'changed', path: 'falsy', from: 0, to: false },
  ]]) {
    const page = await fixture(t, { workerDiff: true, workerResult: { diff: { structuralDiff: rows } } });
    await set(page, { detailView: 'diff' });
    const state = await diffState(page);
    assert.equal(state.lines.length, rows.length);
    if (!rows.length) assert.match(state.text, /No structural differences/);
    else assert.deepEqual(state.lines, [
      { kind: 'added', path: 'null', before: undefined, after: 'null' },
      { kind: 'removed', path: 'undefined', before: 'undefined', after: undefined },
      { kind: 'changed', path: 'falsy', before: '0', after: 'false' },
    ]);
  }
});
const snap = page => page.evaluate(() => window.compareTest.snapshot());
const set = (page, value) => page.evaluate(value => window.compareTest.set(value), value);
async function click(page, text) {
  await page.evaluate(text => window.compareTest.focusButton(text), text);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(30);
}
async function palette(page, query, label) {
  await page.keyboard.press('ControlOrMeta+k');
  await page.evaluate(() => window.compareTest.focus('.xray-command-search input'));
  await page.keyboard.insertText(query);
  assert.ok((await snap(page)).rows.includes(label), `palette exposes ${label}`);
  await click(page, label);
}
async function selectPair(page) {
  await click(page, 'More actions'); await click(page, 'Set as comparison left');
  await set(page, { selectedId: 'right' });
  await click(page, 'More actions'); await click(page, 'Set as comparison right');
}

for (const shadow of [false, true]) {
  const surface = shadow ? 'closed shadow' : 'document';
  test(`detail selections compare unrelated requests without side effects (${surface})`, async t => {
    const page = await fixture(t, { shadow });
    await selectPair(page);
    let state = await snap(page);
    assert.equal(state.left, 'left'); assert.equal(state.right, 'right');
    assert.equal(state.compareOpen, false, 'assigning a side does not open or run anything');
    const before = state;
    await click(page, 'More actions'); await click(page, 'Open comparison');
    state = await snap(page);
    assert.deepEqual(state.dialogs, ['Compare requests']);
    for (const label of ['Identity', 'Status', 'Timing', 'Size', 'Request headers', 'Request body', 'Response headers', 'Response body']) assert.ok(state.text.includes(label), label);
    for (const evidence of ['https://one.test/users', 'https://two.test/graphql', '200', '503', '12ms', '80ms', '100b', '220b', 'count', 'removed', 'added']) assert.ok(state.text.includes(evidence), evidence);
    assert.match(state.text, /redacted.*unavailable/i);
    assert.deepEqual(state.calls, before.calls);
    for (const field of ['selected', 'view', 'tab', 'draft', 'entries', 'rules']) assert.deepEqual(state[field], before[field], field);
    assert.deepEqual(state.errors, []);
    await click(page, 'Swap comparison sides');
    state = await snap(page);
    assert.equal(state.leftValue, 'right'); assert.equal(state.rightValue, 'left');
    assert.match(state.changed, /removed/); assert.match(state.changed, /added/);
    await click(page, 'Clear comparison');
    state = await snap(page);
    assert.equal(state.left, null); assert.equal(state.right, null); assert.equal(state.compareOpen, false);
    assert.equal(state.selected, 'right'); assert.equal(state.view, 'schema');
  });

  test(`compare shows method/path/status options, colour-coded results and collapses equal rows (${surface})`, async t => {
    const page = await fixture(t, { shadow });
    await selectPair(page);
    await page.evaluate(() => window.compareTest.equalStatus());
    await click(page, 'More actions'); await click(page, 'Open comparison');
    let state = await snap(page);
    for (const text of state.optionText.slice(1)) assert.match(text, /^[A-Z]+ \/\S* · \d{3} · \d{2}:\d{2}:\d{2}$/, `option ${text} is method path · status · capture time (two captures of one endpoint stay distinguishable)`);
    for (const id of ['left', 'right']) assert.ok(!state.optionText.some(text => text.includes(`· ${id}`) || text === id), 'no internal ids');
    assert.ok(state.results.some(r => r.startsWith('changed:Changed')), 'changed result is classed');
    assert.ok(!state.results.some(r => r.startsWith('equal:')), 'equal rows start collapsed');
    assert.match(state.equalToggle, /^Show \d+ equal fields?$/);
    await click(page, state.equalToggle);
    state = await snap(page);
    assert.ok(state.results.some(r => r.startsWith('equal:Equal')), 'equal rows appear when expanded');
    assert.equal(state.equalToggle, 'Hide equal fields');
  });

  test(`palette assigns explicit sides and retains comparison across list views (${surface})`, async t => {
    const page = await fixture(t, { shadow });
    await palette(page, 'comparison left', 'Compare left');
    await set(page, { selectedId: 'right' });
    await palette(page, 'comparison right', 'Compare right');
    await set(page, { activeTab: 'logs', apiGroupingMode: 'endpoint', apiSearchQuery: 'hidden' });
    await palette(page, 'open comparison', 'Open comparison');
    const state = await snap(page);
    assert.equal(state.left, 'left'); assert.equal(state.right, 'right');
    assert.equal(state.activeTab, 'logs'); assert.equal(state.selected, 'right');
    assert.deepEqual(state.options, ['', 'left', 'right'], 'only retained API entries are offered');
    assert.equal(state.calls.replay + state.calls.console + state.calls.rules, 0);
    await page.keyboard.press('Escape');
    assert.equal((await snap(page)).compareOpen, false);
    await palette(page, 'clear comparison', 'Clear comparison');
    assert.equal((await snap(page)).left, null); assert.equal((await snap(page)).right, null);
  });

  test(`comparison owns focus, Tab and Escape above detail/command layers (${surface})`, async t => {
    const page = await fixture(t, { shadow });
    await selectPair(page);
    await click(page, 'More actions'); await click(page, 'Open comparison');
    assert.equal((await snap(page)).focusInDialog, true);
    await page.evaluate(() => window.compareTest.focusButton('Clear comparison'));
    await page.keyboard.press('Tab');
    assert.equal((await snap(page)).focus, 'Close Compare requests');
    await page.keyboard.press('Shift+Tab');
    assert.equal((await snap(page)).focus, 'Clear comparison');
    await page.evaluate(() => window.compareTest.focus('.xray-compare-captured summary'));
    await page.keyboard.press('Enter');
    assert.equal((await snap(page)).capturedOpen, true);
    await page.keyboard.press('ControlOrMeta+k');
    assert.deepEqual((await snap(page)).dialogs, ['Compare requests', 'Command center']);
    await page.keyboard.press('Escape');
    assert.equal((await snap(page)).compareOpen, true);
    assert.equal((await snap(page)).focusInDialog, true);
    assert.equal((await snap(page)).capturedOpen, true, 'palette does not remount or reset comparison evidence');
    await page.keyboard.press('Escape');
    const state = await snap(page);
    assert.equal(state.compareOpen, false); assert.equal(state.drawer, true); assert.equal(state.open, true);
    assert.equal(state.left, 'left'); assert.equal(state.right, 'right');
    // The menu item that opened it no longer exists; carried fix (a) hands the
    // modal the More actions trigger as its restore target.
    assert.equal(state.focus, 'More actions', 'close restores focus to persistent detail trigger');
    // The comparison banner's own "Open comparison" chip is a separate opener and
    // gets focus back when the modal closes.
    await page.evaluate(() => window.compareTest.focus('.xray-detail-comparison button'));
    await page.keyboard.press('Enter');
    assert.equal((await snap(page)).focusInDialog, true);
    await page.keyboard.press('Escape');
    assert.equal((await snap(page)).compareOpen, false);
    assert.equal((await snap(page)).focus, 'Open comparison', 'banner chip opener regains focus');
  });
}

test('missing/evicted entries and partial captured evidence stay explicit; invalid selection is inert', async t => {
  const page = await fixture(t);
  await selectPair(page);
  await page.evaluate(() => window.compareTest.unavailable());
  await click(page, 'More actions'); await click(page, 'Open comparison');
  let state = await snap(page);
  for (const reason of ['cyclic', 'missing', 'truncated', 'redacted']) assert.match(state.text, new RegExp(reason, 'i'));
  await page.evaluate(() => window.compareTest.action('setComparisonEntry', 'left', 'log'));
  assert.equal((await snap(page)).left, 'left');
  await set(page, { entries: [] });
  state = await snap(page);
  assert.match(state.text, /no longer retained/i);
  assert.ok(!state.text.includes('No structural differences'), 'eviction is not equality');
  await click(page, 'Clear comparison');
  await palette(page, 'open comparison', 'Open comparison');
  assert.match((await snap(page)).text, /select.*left.*right/i);
});

test('comparison selectors cover retained API entries without changing detail or executing commands', async t => {
  const page = await fixture(t, { shadow: true });
  await palette(page, 'open comparison', 'Open comparison');
  const before = await snap(page);
  await page.evaluate(() => window.compareTest.choose('Left', 'right'));
  await page.evaluate(() => window.compareTest.choose('Right', 'right'));
  let state = await snap(page);
  assert.equal(state.left, 'right'); assert.equal(state.right, 'right');
  assert.match(state.text, /No structural differences in captured evidence/);
  assert.equal(state.selected, before.selected); assert.equal(state.view, before.view);
  assert.deepEqual(state.calls, before.calls);
  await page.evaluate(() => window.compareTest.choose('Right', ''));
  state = await snap(page);
  assert.equal(state.right, null); assert.match(state.text, /Select a left and right request/);
});

test('oversized plain captured values render a bounded preview with a truncation receipt', async t => {
  const page = await fixture(t);
  await set(page, { entries: [
    { id: 'left', type: 'api', method: 'GET', responseRaw: 'x'.repeat(60000) },
    { id: 'right', type: 'api', method: 'POST', responseRaw: 'y'.repeat(60000) },
  ] });
  await selectPair(page);
  await click(page, 'Open comparison');
  const values = await page.evaluate(() => [...window.compareTest.root.querySelectorAll('.xray-compare-modal pre')].map(el => el.textContent));
  assert.ok(values.every(value => value.length <= 20200), 'every plain evidence preview is bounded to 20,000 characters plus receipt');
  assert.match((await snap(page)).text, /truncated/i);
});

for (const shadow of [false, true]) for (const width of [360, 960, 1600]) {
  test(`comparison evidence and controls fit ${width}px (${shadow ? 'closed shadow' : 'document'})`, async t => {
    const page = await fixture(t, { shadow, width });
    await selectPair(page);
    await click(page, 'More actions'); await click(page, 'Open comparison');
    const measure = await page.evaluate(() => {
      const root = window.compareTest.root, dialog = root.querySelector('.xray-compare-modal');
      const r = dialog.getBoundingClientRect();
      return { left: r.left, right: r.right, width: innerWidth, overflow: dialog.scrollWidth > dialog.clientWidth + 1,
        bodyOverflow: root.querySelector('.xray-compare-body').scrollWidth > root.querySelector('.xray-compare-body').clientWidth + 1,
        controls: [...dialog.querySelectorAll('button,select')].map(el => { const b=el.getBoundingClientRect(); return b.left >= r.left && b.right <= r.right + 1; }) };
    });
    assert.ok(measure.left >= 0 && measure.right <= measure.width);
    assert.equal(measure.overflow, false); assert.equal(measure.bodyOverflow, false);
    assert.ok(measure.controls.every(Boolean), 'all controls remain within modal');
    await click(page, 'Swap comparison sides');
    await click(page, 'Clear comparison');
    assert.equal((await snap(page)).compareOpen, false);
  });
}
