import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { before, after } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { PANEL_CSS } from '../helpers/panel-css.mjs';
import { setStandardsContent } from '../helpers/standards-page.mjs';

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
      const styles = ${JSON.stringify(PANEL_CSS)};
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
        return <div className="xray-theme-scope xray-theme-xray-dark"><div className="xray-panel xray-mode-window xray-open">
          {tab==='api' && entry?.type==='api' && <RequestDetail entry={entry} />}
          <button id="outside">Outside</button><CommandPalette />
        </div></div>;
      }
      window.compareTest={
        calls:{replay:0,console:0,rules:0,storage:0,bridge:0},errors:[],workerCalls:0,
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
             // A DevTools worker on the surface: the Diff must not ask it (JSON fidelity J11).
             window.XRAY_Worker={detailAnalysis:async()=>{this.workerCalls++;return this.workerResult;}};
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
  await setStandardsContent(page, '<style>body{margin:0}</style>');
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(options => Object.assign(window.compareTest, options), { useWorkerDiff: workerDiff, workerAbsent, workerResult });
  await page.evaluate(shadow => window.compareTest.setup(shadow), shadow);
  return page;
}

const diffState = page => page.evaluate(() => {
  const root = window.compareTest.root;
  return {
    text: root.querySelector('.xray-diff')?.textContent,
    notices: [...root.querySelectorAll('.xray-diff .xray-body-notice')].map(el => el.textContent),
    lines: [...root.querySelectorAll('.xray-diff-line')].map(line => ({
      kind: line.classList[1], path: line.querySelector('.xray-diff-path').textContent,
      before: line.querySelector('.xray-diff-before')?.textContent,
      after: line.querySelector('.xray-diff-after')?.textContent,
    })),
    errors: window.compareTest.errors,
    workerCalls: window.compareTest.workerCalls,
  };
});

// The Diff view is the panel's own node diff on every surface (JSON fidelity spec J11): a DevTools
// worker is never asked, so neither a valid nor a malformed worker answer can change what it shows.
for (const shadow of [false, true]) {
  test(`the Diff is the panel's own, whatever a worker on the surface would answer (${shadow ? 'closed shadow' : 'document'})`, async t => {
    const answers = [
      { diff: { previous: 'raw-worker-previous', current: 'raw-worker-current', structuralDiff: [{ type: 'changed', path: 'count', from: 1, to: 2 }] } },
      { diff: { structuralDiff: [] } },
      { diff: { structuralDiff: 'raw-worker-current' } },
      null,
    ];
    for (const workerResult of answers) {
      const page = await fixture(t, { shadow, workerDiff: true, workerResult });
      await set(page, { detailView: 'diff', detailTab: 'response' });
      await page.waitForFunction(() => window.compareTest.root.querySelectorAll('.xray-diff-line').length > 0);
      const state = await diffState(page);
      assert.deepEqual(state.lines, [
        { kind: 'changed', path: 'count', before: '0', after: '1' },
        { kind: 'added', path: 'removed', before: undefined, after: 'true' },
      ], 'baseline {"count":0} against left {"count":1,"removed":true}');
      assert.deepEqual(state.notices, []);
      assert.doesNotMatch(state.text, /raw-worker-(?:previous|current)/);
      assert.equal(state.workerCalls, 0, 'the worker is never asked');
      assert.deepEqual(state.errors, []);
      await page.close();
    }
  });
}

test('the Diff states its line cap and says "No structural differences" only for equal bodies', async t => {
  const page = await fixture(t, { workerDiff: true, workerAbsent: true });
  const baseline = { id: 'fallback-before', type: 'api', urlPath: '/fallback', timestamp: 1, responseRaw: '{}' };
  const current = { ...baseline, id: 'fallback-after', timestamp: 2, responseRaw: JSON.stringify(Object.fromEntries(Array.from({ length: 350 }, (_, i) => [`field-${i}`, i]))) };
  await set(page, { entries: [baseline, current], selectedId: current.id, detailView: 'diff' });
  await page.waitForFunction(() => window.compareTest.root.querySelectorAll('.xray-diff-line').length > 0);
  let state = await diffState(page);
  assert.equal(state.lines.length, 200, 'line cap stays 200');
  assert.deepEqual(state.notices, ['Showing the first 200 differences; the diff stopped there.']);
  const same = { ...baseline, id: 'same-after', timestamp: 3, responseRaw: '{}' };
  await set(page, { entries: [baseline, same], selectedId: same.id, detailView: 'diff' });
  await page.waitForFunction(() => /No structural differences/.test(window.compareTest.root.querySelector('.xray-diff')?.textContent || ''));
  state = await diffState(page);
  assert.deepEqual([state.lines, state.notices], [[], []]);
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
