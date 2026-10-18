import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { before, after } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';

const { outputFiles } = await build({
  stdin: { resolveDir: fileURLToPath(new URL('../../', import.meta.url)), loader: 'jsx', contents: `
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    import { flushSync } from 'react-dom';
    import { Rules } from './src/panel/components/rules/Rules';
    import { usePanelStore } from './src/panel/store';
    import styles from './src/panel/styles.css';
    const baseline={id:'baseline',type:'api',method:'GET',status:200,url:'https://example.test/api?token=private-query',urlPath:'/api',timestamp:1,
      responseRaw:{ok:true},requestHeaders:{authorization:'Bearer private-auth'},requestBody:{password:'private-body'}};
    const messages=[],writes={};
    window.XRAY_Store={get:async key=>writes[key],set:async(key,value)=>{writes[key]=JSON.parse(JSON.stringify(value));}};
    window.postMessage=message=>messages.push(message);
    window.investigationTest={
      async setup(shadow,saved){if(saved)writes.saved_investigations=saved;window.__XRAY_bridgeToken='fixture-token';await usePanelStore.getState().restorePreferences();messages.length=0;
        const host=document.body.appendChild(document.createElement('div'));this.root=shadow?host.attachShadow({mode:'closed'}):document;
        const sheet=document.createElement('style');sheet.textContent=styles;(shadow?this.root:document.head).appendChild(sheet);
        const mount=shadow?this.root.appendChild(document.createElement('div')):host;
        usePanelStore.setState({entries:[baseline],selectedId:'baseline',activeTab:'rules',rulesSubTab:'investigations',open:true});
        flushSync(()=>createRoot(mount).render(<div className="xray-theme-scope xray-theme-operator"><div className="xray-panel xray-mode-window xray-open"><Rules/></div></div>));},
      click(text,index=0){const b=[...this.root.querySelectorAll('button')].filter(b=>b.textContent.trim()===text)[index];
        if(!b)throw Error('Missing '+text);if(b.disabled)throw Error('Disabled '+text);b.scrollIntoView();b.focus();
        const r=b.getBoundingClientRect();if(!r.width||!r.height)throw Error('Hidden '+text);return {x:r.left+r.width/2,y:r.top+r.height/2};},
      field(label,value){const l=[...this.root.querySelectorAll('label')].find(l=>l.querySelector('span')?.textContent===label);
        const el=l?.querySelector('input,textarea,select');if(!el)throw Error('Missing field '+label);
        if(el instanceof HTMLSelectElement){el.value=value;el.dispatchEvent(new Event('change',{bubbles:true}));}
        else {Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el),'value').set.call(el,value);el.dispatchEvent(new Event('input',{bubbles:true}));}},
      details(text){const s=[...this.root.querySelectorAll('summary')].find(s=>s.textContent===text);if(!s)throw Error('Missing '+text);s.click();},
      add(entry){usePanelStore.getState().addEntry({type:'api',url:baseline.url,urlPath:'/api',method:'GET',timestamp:Date.now(),...entry});},
      patch(state){usePanelStore.setState(state);},
      session(id){usePanelStore.setState({session:{...usePanelStore.getState().session,sessionId:id}});},
      action(name,...args){return usePanelStore.getState()[name](...args);},
      async reloadSaved(){const saved=JSON.parse(JSON.stringify(writes.saved_investigations));
        window.XRAY_Store.get=async key=>key==='saved_investigations'?saved:undefined;
        usePanelStore.setState({investigationStore:{schemaVersion:1,investigations:[]}});
        await usePanelStore.getState().restorePreferences();},
      snapshot(){const s=usePanelStore.getState(),panel=this.root.querySelector('[aria-label="Saved investigations"]');return {
        investigations:s.investigationStore?.investigations,storage:s.investigationStorageState,experiments:s.experiments,rules:s.rules,messages,writes,
        selected:s.selectedId,session:s.session.sessionId,text:panel?.textContent??'',notice:(()=>{const n=panel?.querySelector('.xray-notice');return n?{role:n.getAttribute('role'),tone:n.className}:null;})(),
        disabledButtons:panel?[...panel.querySelectorAll('button')].filter(b=>b.disabled).map(b=>b.textContent.trim()):[],
        overflow:panel?panel.scrollWidth>panel.clientWidth:false,
        controls:panel?[...panel.querySelectorAll('button,input,select,textarea,summary')].filter(el=>el.getClientRects().length).map(el=>{const r=el.getBoundingClientRect();return {text:el.textContent,disabled:el.disabled,left:r.left,right:r.right,width:r.width};}):[]};}
    };
  ` }, loader: { '.css': 'text' }, bundle: true, format: 'iife', write: false,
});
let browser;
before(async () => {
  const executablePath = process.env.XRAY_BROWSER_EXECUTABLE || (!existsSync(chromium.executablePath()) && existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined);
  browser = await chromium.launch({ executablePath, headless: true });
});
after(async () => { await browser?.close(); });
async function fixture(t, { shadow = false, width = 960, saved } = {}) {
  const page = await browser.newPage({ viewport: { width, height: 800 } });
  t.after(() => page.close());
  await page.setContent('<style>body{margin:0}</style>');
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(({shadow,saved}) => window.investigationTest.setup(shadow,saved), {shadow,saved});
  return page;
}
const snap = page => page.evaluate(() => window.investigationTest.snapshot());
async function click(page, text, index = 0) {
  const point = await page.evaluate(({ text, index }) => window.investigationTest.click(text, index), { text, index });
  await page.mouse.click(point.x, point.y);
  await page.waitForTimeout(30);
}
async function field(page, label, value) {
  await page.evaluate(({ label, value }) => window.investigationTest.field(label, value), { label, value });
  await page.waitForTimeout(20);
}
async function details(page, text) {
  await page.evaluate(text => window.investigationTest.details(text), text);
  await page.waitForTimeout(20);
}
async function reveal(page) { await click(page, 'Save current context'); }
async function saveOpen(page) { await field(page, 'Investigation title', 'API regression'); await click(page, 'Save investigation'); }
async function save(page) { await reveal(page); await saveOpen(page); }
async function scenario(page) {
  await details(page, 'Prepare scenario');
  await field(page, 'Scenario request', 'baseline');
  await click(page, 'Add scenario');
}

test('saved investigations live in a Rules sub-tab; the save form is revealed on demand', async t => {
  const page = await fixture(t);
  const tabs = await page.evaluate(() => [...window.investigationTest.root.querySelectorAll('[role="tab"]')].map(tab => ({ text: tab.textContent, selected: tab.getAttribute('aria-selected') })));
  assert.deepEqual(tabs.map(tab => tab.text), ['Rules0', 'Experiments0', 'Investigations0']);
  assert.deepEqual(tabs.map(tab => tab.selected), ['false', 'false', 'true']);
  assert.match((await snap(page)).text, /Saved investigations|No saved investigations/);
  const hasForm = () => page.evaluate(() => [...window.investigationTest.root.querySelectorAll('label span')].some(span => span.textContent === 'Investigation title'));
  assert.equal(await hasForm(), false, 'form is not always open');
  await reveal(page);
  assert.equal(await hasForm(), true);
  await click(page, 'Cancel');
  assert.equal(await hasForm(), false);
  assert.equal((await snap(page)).investigations.length, 0);
});

test('deep links land on the right Rules section without running anything', async t => {
  const page = await fixture(t); await save(page);
  const section = () => page.evaluate(() => window.investigationTest.root.querySelector('[role="tab"][aria-selected="true"]').textContent);
  await page.evaluate(() => window.investigationTest.patch({ rulesSubTab: 'rules' }));
  await page.evaluate(() => window.investigationTest.action('openInvestigation', window.investigationTest.snapshot().investigations[0].id));
  assert.match(await section(), /^Investigations/);
  await page.evaluate(() => window.investigationTest.action('draftExperiment', { id: 'baseline', type: 'api', method: 'GET', status: 200, url: 'https://example.test/api', urlPath: '/api', timestamp: 1, responseRaw: { ok: true } }));
  assert.match(await section(), /^Experiments/);
  assert.equal((await snap(page)).messages.length, 0, 'drafting never submits');
  await page.evaluate(() => window.investigationTest.action('addRule'));
  assert.match(await section(), /^Rules/);
});

test('authoring and explicit edit save are inert, sanitized; reopen and delete never execute', async t => {
  const page = await fixture(t);
  await reveal(page);
  await field(page, 'Investigation notes', 'Review https://example.test/api?token=private-notes');
  await saveOpen(page);
  let state = await snap(page);
  assert.equal(state.investigations.length, 1);
  assert.equal(state.investigations[0].title, 'API regression');
  assert.equal(JSON.stringify(state.investigations).includes('private-'), false);
  await details(page, 'Edit title and notes');
  await field(page, 'Saved title', 'Edited regression');
  assert.equal((await snap(page)).investigations[0].title, 'API regression');
  await click(page, 'Save changes');
  assert.equal((await snap(page)).investigations[0].title, 'Edited regression');
  await click(page, 'Reopen context');
  state = await snap(page);
  assert.equal(state.selected, 'baseline');
  assert.equal(state.messages.length, 0);
  assert.equal(state.experiments.length, 0);
  await click(page, 'Delete investigation');
  assert.equal((await snap(page)).investigations.length, 0);
});

test('assertions evaluate passed, failed and unavailable without substituting missing evidence', async t => {
  const page = await fixture(t); await save(page); await details(page, 'Author assertion');
  await field(page, 'Assertion request', 'baseline'); await click(page, 'Add assertion');
  await field(page, 'Assertion status', '500'); await click(page, 'Add assertion');
  await field(page, 'Assertion type', 'response'); await click(page, 'Add assertion');
  await field(page, 'Assertion type', 'structural'); await click(page, 'Add assertion');
  await click(page, 'Evaluate assertions');
  assert.match((await snap(page)).text, /passed/); assert.match((await snap(page)).text, /failed/);
  await page.evaluate(() => window.investigationTest.patch({entries:[]}));
  await click(page, 'Evaluate assertions');
  assert.match((await snap(page)).text, /unavailable/);
  assert.equal((await snap(page)).messages.length, 0);
});

test('ordered replay steps execute one at a time, explicit next only; receipts and cancellation are honest', async t => {
  const page = await fixture(t); await save(page); await scenario(page);
  await details(page, 'Add ordered step'); await field(page, 'Step request', 'baseline'); await click(page, 'Add step');
  assert.equal((await snap(page)).messages.length, 0);
  assert.equal((await snap(page)).investigations[0].scenarios[0].steps.length, 2);
  await click(page, 'Run step', 0);
  assert.equal((await snap(page)).messages.length, 1);
  await page.evaluate(() => window.investigationTest.add({id:'observed',replayOf:'baseline',status:200,responseRaw:{ok:true}}));
  await page.waitForTimeout(40);
  assert.equal((await snap(page)).investigations[0].runs[0].status, 'passed');
  assert.equal((await snap(page)).messages.length, 1);
  await click(page, 'Run next step');
  assert.equal((await snap(page)).messages.length, 2);
  await click(page, 'Cancel waiting');
  assert.equal((await snap(page)).investigations[0].runs.at(-1).status, 'cancelled');
  assert.match((await snap(page)).text, /cannot recall/);
});

test('missing session references disable execution until explicit rebind; observed evidence availability is session aware', async t => {
  const page = await fixture(t); await save(page); await scenario(page);
  await page.evaluate(() => window.investigationTest.session('other-session'));
  // Replace the session identity without changing retained entry IDs: identities must not silently match.
  assert.match((await snap(page)).text, /unavailable/);
  assert.ok((await snap(page)).disabledButtons.includes('Run step'));
  await details(page, 'Explicitly rebind baseline');
  await field(page, 'Rebind request', 'baseline'); await click(page, 'Rebind step');
  await click(page, 'Run step'); await click(page, 'Cancel waiting');
  assert.equal((await snap(page)).messages.length, 1);
});

test('mock authoring stays disabled until explicit run; timeout cleans up its rule and shows a scalar receipt', async t => {
  const page = await fixture(t); await save(page);
  await page.evaluate(() => window.investigationTest.patch({rules:[
    {id:'mock-one',label:'Mock fixture',enabled:false,match:{url:'/api',method:'GET'},action:{type:'mock',status:200,body:'{}',headers:{},delayMs:0}},
    {id:'enabled-mock',label:'Enabled fixture',enabled:true,match:{url:'/api',method:'GET'},action:{type:'mock',status:200,body:'{}',headers:{},delayMs:0}},
    {id:'invalid-mock',label:'Invalid fixture',enabled:false,match:{url:'re:[',method:'GET'},action:{type:'mock',status:200,body:'{}',headers:{},delayMs:0}},
  ]}));
  await details(page, 'Prepare scenario'); await field(page, 'Scenario request', 'baseline');
  await field(page, 'Scenario execution', 'mock');
  const options = await page.evaluate(() => [...window.investigationTest.root.querySelectorAll('select')].find(el=>el.closest('label')?.querySelector('span')?.textContent==='Scenario mock rule').textContent);
  assert.equal(options.includes('Enabled fixture'), false); assert.equal(options.includes('Invalid fixture'), false);
  await field(page, 'Scenario mock rule', 'mock-one'); await field(page, 'Scenario timeout (ms)', '2000'); await click(page, 'Add scenario');
  assert.equal((await snap(page)).rules[0].enabled, false); assert.equal((await snap(page)).messages.length, 0);
  await click(page, 'Run step');
  assert.equal((await snap(page)).rules[0].enabled, true);
  await page.waitForFunction(() => window.investigationTest.snapshot().investigations[0].runs[0]?.status === 'failed');
  const state = await snap(page);
  assert.equal(state.rules[0].enabled, false);
  assert.equal(state.investigations[0].runs[0].status, 'failed');
  assert.match(state.text, /unavailable/);
  assert.equal(state.messages.filter(message => message.__xray_replay__).length, 0);
});

test('failed checks are retained; evicted observed entries are unavailable without replaying', async t => {
  const page = await fixture(t); await save(page); await scenario(page); await click(page, 'Run step');
  await page.evaluate(() => window.investigationTest.add({id:'failed-observation',replayOf:'baseline',status:500,responseRaw:{ok:false}}));
  await page.waitForTimeout(40);
  assert.equal((await snap(page)).investigations[0].runs[0].status, 'failed');
  assert.match((await snap(page)).text, /Observed evidence: failed-observation/);
  await page.evaluate(() => window.investigationTest.patch({entries:[]}));
  assert.match((await snap(page)).text, /Observed evidence: unavailable/);
  assert.equal((await snap(page)).messages.length, 1);
});

test('save/reload and Clear preserve investigation recipes; restored running receipts are interrupted and never resumed', async t => {
  const page = await fixture(t); await save(page); await scenario(page); await click(page, 'Run step');
  await page.waitForTimeout(350);
  const state = await snap(page);
  assert.ok(state.writes.saved_investigations);
  const reloaded = await fixture(t, { saved: state.writes.saved_investigations });
  assert.equal((await snap(reloaded)).investigations[0].runs[0].status, 'interrupted');
  assert.equal((await snap(reloaded)).messages.length, 0, 'fresh runtime never resumes a stored run');
  assert.equal((await snap(page)).messages.filter(message => message.__xray_replay__).length, 1);
  await page.evaluate(() => window.investigationTest.action('clearSession'));
  assert.equal((await snap(page)).investigations.length, 1);
  assert.ok((await snap(page)).disabledButtons.includes('Run step'));
});

test('storage failures never claim a disk save and unsupported data disables edits', async t => {
  const page = await fixture(t);
  for (const storage of ['unavailable','failed','unsupported']) {
    await page.evaluate(investigationStorageState => window.investigationTest.patch({investigationStorageState}), storage);
    const state = await snap(page);
    assert.match(state.text, storage==='unavailable'?/panel only/:storage==='failed'?/not confirmed persisted/:/unsupported version/);
    // Runtime-changing warnings/errors are live regions.
    assert.equal(state.notice.role, storage==='unavailable'?'status':'alert');
    if (storage==='unsupported') assert.ok(state.disabledButtons.includes('Save current context'));
  }
  await page.evaluate(() => window.investigationTest.patch({investigationStorageState:'ready'}));
  // The static ready state is a plain notice, not a live region.
  const ready = await snap(page);
  assert.ok(ready.notice && ready.notice.role === null);
  assert.equal((await snap(page)).messages.length, 0);
});

test('document and closed-shadow controls remain reachable without overflow at 360/960/1600', async t => {
  for (const shadow of [false, true]) for (const width of [360, 960, 1600]) {
    const page = await fixture(t, {shadow,width}); await save(page); await scenario(page);
    await details(page, 'Edit title and notes'); await details(page, 'Author assertion'); await details(page, 'Add ordered step');
    const state = await snap(page);
    assert.equal(state.overflow, false, JSON.stringify({shadow,width}));
    assert.ok(state.controls.length > 20);
    for (const control of state.controls) assert.ok(control.width > 0 && control.left >= -1 && control.right <= width + 1, JSON.stringify({shadow,width,control}));
    assert.equal(state.messages.length, 0);
    await click(page, 'Delete investigation');
  }
});
