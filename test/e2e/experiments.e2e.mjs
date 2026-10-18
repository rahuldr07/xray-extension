import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { before, after } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { PANEL_CSS } from '../helpers/panel-css.mjs';
import { setStandardsContent } from '../helpers/standards-page.mjs';

const { outputFiles } = await build({
  stdin: { resolveDir: fileURLToPath(new URL('../../', import.meta.url)), loader: 'jsx', contents: `
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    import { flushSync } from 'react-dom';
    import { Rules } from './src/panel/components/rules/Rules';
    import { RequestDetail } from './src/panel/components/detail/RequestDetail';
    import { ReplayModal } from './src/panel/components/replay/ReplayModal';
    import { usePanelStore } from './src/panel/store';
    const styles = ${JSON.stringify(PANEL_CSS)};
     const baseline = {id:'baseline',type:'api',method:'GET',status:200,url:'https://example.test/api?token=secret-query',
       urlPath:'/api',timestamp:1,responseRaw:{ok:true},requestHeaders:{authorization:'Bearer secret-auth'},requestBody:{password:'secret-body'}};
    const messages=[], writes={};
    window.XRAY_Store={get:async key=>writes[key],set:async (key,value)=>{writes[key]=JSON.parse(JSON.stringify(value));}};
    window.postMessage=message=>messages.push(message);
    function Fixture(){const tab=usePanelStore(s=>s.activeTab);return <div className="xray-theme-scope xray-theme-xray-dark"><div className="xray-panel xray-mode-window xray-open">
       {tab==='rules'?<Rules/>:<RequestDetail entry={window.__XRAY_experimentEntry}/>}<ReplayModal/>
    </div></div>;}
    window.experimentTest={
       setup(shadow,bridge,configuredEntry){if(bridge)window.__XRAY_bridgeToken='fixture-token';window.__XRAY_experimentEntry=configuredEntry || baseline;const host=document.body.appendChild(document.createElement('div'));
        this.root=shadow?host.attachShadow({mode:'closed'}):document;
        const sheet=document.createElement('style');sheet.textContent=styles;(shadow?this.root:document.head).appendChild(sheet);
        const mount=shadow?this.root.appendChild(document.createElement('div')):host;
         usePanelStore.setState({entries:[window.__XRAY_experimentEntry],selectedId:window.__XRAY_experimentEntry.id,activeTab:'api',open:true});
        flushSync(()=>createRoot(mount).render(<Fixture/>));},
      click(text,index=0){const buttons=[...this.root.querySelectorAll('button')].filter(b=>b.textContent.trim()===text);const b=buttons[index];if(!b)throw Error('Missing '+text);b.focus();b.click();},
      draft(plan={},checks=[{type:'status',expected:200}]){return usePanelStore.getState().draftExperiment(baseline,plan,checks);},
      action(name,id){return usePanelStore.getState()[name](id);},
      add(entry){usePanelStore.getState().addEntry({type:'api',timestamp:Date.now(),...entry});},
      patch(entry){usePanelStore.getState().updateEntry(entry);},
      rule(rule){usePanelStore.setState({rules:[rule]});},
      restore(){return usePanelStore.getState().restorePreferences();},
      snapshot(){const s=usePanelStore.getState();return {experiments:s.experiments,rules:s.rules,messages,writes,entries:s.entries.length,toast:s.toastMessage,
        text:this.root.querySelector('.xray-experiments')?.textContent,overflow:this.root.querySelector('.xray-experiments')?.scrollWidth>this.root.querySelector('.xray-experiments')?.clientWidth};}
    };
   ` }, loader: { '.css': 'text' }, bundle: true, format: 'iife', write: false,
});

let browser;
before(async () => {
  const executablePath = process.env.XRAY_BROWSER_EXECUTABLE || (!existsSync(chromium.executablePath()) && existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined);
  browser = await chromium.launch({ executablePath, headless: true });
});
after(async () => { await browser?.close(); });
async function fixture(t, { shadow = false, width = 960, bridge = true, entry } = {}) {
  const page = await browser.newPage({ viewport: { width, height: 800 } });
  t.after(() => page.close());
  page.setDefaultTimeout(3000);
  await setStandardsContent(page, '<style>body{margin:0}</style>');
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(({ shadow, bridge, entry }) => window.experimentTest.setup(shadow, bridge, entry), { shadow, bridge, entry });
  return page;
}
const snap = page => page.evaluate(() => window.experimentTest.snapshot());
async function click(page, text, index = 0) {
  await page.evaluate(({ text, index }) => window.experimentTest.click(text, index), { text, index });
  await page.waitForTimeout(30);
}
const action = (page, name, id) => page.evaluate(({ name, id }) => window.experimentTest.action(name, id), { name, id });
const draft = (page, plan = {}, checks) => page.evaluate(({ plan, checks }) => window.experimentTest.draft(plan, checks), { plan, checks });
const add = (page, entry) => page.evaluate(entry => window.experimentTest.add(entry), entry);
const mock = (patch = {}) => ({ id: 'mock-one', label: 'Fixture', enabled: false, match: { url: '/api', method: 'GET' }, action: { type: 'mock', status: 201, body: '{}', headers: {}, delayMs: 0 }, ...patch });

test('detail draft and explicit arm are inert; only Run sends replay with baseline identity', async t => {
  const page = await fixture(t);
  await click(page, 'More actions');
  await click(page, 'Prepare experiment');
  let state = await snap(page);
  assert.equal(state.experiments[0].status, 'draft');
  assert.equal(state.messages.length, 0);
  await click(page, 'Arm');
  assert.equal((await snap(page)).experiments[0].status, 'armed');
  assert.equal((await snap(page)).messages.length, 0);
  await click(page, 'Run');
  state = await snap(page);
  assert.equal(state.experiments[0].status, 'running');
  assert.equal(state.messages.length, 1);
  assert.equal(state.messages[0].request.replayOf, 'baseline');
  assert.equal(state.messages[0].request.url, 'https://example.test/api?token=secret-query', 'unchanged replay preserves captured URL for MAIN origin-pinned restoration');
  assert.equal(state.messages[0].request.headers.authorization, '[redacted]');
  assert.equal(state.text.includes('secret-'), false);
  assert.equal(JSON.stringify(state.experiments).includes('secret-'), false);
  assert.equal(JSON.stringify(state.writes.experiment_records).includes('secret-'), false);
});

test('association ignores unrelated and pre-run entries, evaluates structure against baseline, and keeps first result', async t => {
  const page = await fixture(t);
  await add(page, { id: 'old', replayOf: 'baseline', status: 200 });
  const id = await draft(page, {}, [{ type: 'status', expected: 200 }, { type: 'structural', mode: 'equal' }]);
  await action(page, 'armExperiment', id); await action(page, 'runExperiment', id);
  await add(page, { id: 'unrelated', status: 200 });
  assert.equal((await snap(page)).experiments[0].status, 'running');
  await add(page, { id: 'pending', replayOf: 'baseline' });
  assert.equal((await snap(page)).experiments[0].status, 'running');
  await page.evaluate(() => window.experimentTest.patch({ id: 'pending', status: 200, responseRaw: { ok: true } }));
  await page.waitForTimeout(80);
  let record = (await snap(page)).experiments[0];
  assert.equal(record.status, 'observed');
  assert.equal(record.observedEntryId, 'pending');
  assert.ok(record.checkResults.every(check => check.passed));
  await add(page, { id: 'later', replayOf: 'baseline', status: 500 });
  record = (await snap(page)).experiments[0];
  assert.equal(record.observedEntryId, 'pending');
});

test('duplicate baseline runs, invalid URLs, unacknowledged retarget, missing routes, and enabled/invalid mocks refuse side effects', async t => {
  const page = await fixture(t);
  for (const url of ['', 'oops', 'https://other.test/api']) assert.equal(await draft(page, { url }), null);
  const a = await draft(page); const b = await draft(page);
  await action(page, 'armExperiment', a); await action(page, 'armExperiment', b);
  await action(page, 'runExperiment', a); await action(page, 'runExperiment', b);
  assert.equal((await snap(page)).messages.length, 1);
  assert.equal((await snap(page)).experiments[1].status, 'armed');
  await action(page, 'cancelExperiment', a);
  const cross = await draft(page, { url: 'https://other.test/api', retargetAcknowledged: true });
  assert.ok(cross); await action(page, 'armExperiment', cross); await action(page, 'runExperiment', cross);
  assert.equal((await snap(page)).messages[1].request.url, 'https://other.test/api');
  await action(page, 'cancelExperiment', cross);
  const unavailable = await fixture(t, { bridge: false });
  const noRoute = await draft(unavailable); await action(unavailable, 'armExperiment', noRoute); await action(unavailable, 'runExperiment', noRoute);
  assert.equal((await snap(unavailable)).experiments[0].status, 'failed');
  assert.equal((await snap(unavailable)).messages.length, 0);
  for (const rule of [mock({ enabled: true }), mock({ match: { url: 're:[', method: '' } })]) {
    const id = await draft(page, { mockRuleId: rule.id });
    await page.evaluate(rule => window.experimentTest.rule(rule), rule);
    await action(page, 'armExperiment', id); await action(page, 'runExperiment', id);
    assert.equal((await snap(page)).experiments.find(record => record.id === id).status, 'failed');
  }
});

test('mock Run alone enables a valid disabled rule and only mocked matching evidence resolves it', async t => {
  const page = await fixture(t);
  await page.evaluate(rule => window.experimentTest.rule(rule), mock());
  const id = await draft(page, { mockRuleId: 'mock-one' }, [{ type: 'status', expected: 201 }]);
  await action(page, 'armExperiment', id);
  assert.equal((await snap(page)).rules[0].enabled, false);
  assert.equal((await snap(page)).messages.length, 0);
  await action(page, 'runExperiment', id);
  assert.equal((await snap(page)).rules[0].enabled, true);
  assert.equal((await snap(page)).messages.filter(message => message.__xray_replay__).length, 0);
  assert.equal((await snap(page)).experiments[0].status, 'running');
  await add(page, { id: 'not-mocked', mockRuleId: 'mock-one', status: 201 });
  await add(page, { id: 'wrong-rule', mockRuleId: 'other', mocked: true, status: 201 });
  assert.equal((await snap(page)).experiments[0].status, 'running');
  await add(page, { id: 'observed-mock', mockRuleId: 'mock-one', mocked: true, status: 201 });
  const state = await snap(page);
  assert.equal(state.experiments[0].status, 'observed');
  assert.equal(state.experiments[0].checkResults[0].passed, true);
  assert.equal(state.rules[0].enabled, false);
});

test('timeout, captured network failure and cancellation are honest; deletion preserves traffic and cap is 50', async t => {
  const page = await fixture(t);
  const timed = await draft(page, { timeoutMs: 50 }); await action(page, 'armExperiment', timed); await action(page, 'runExperiment', timed);
  await page.waitForTimeout(90);
  assert.equal((await snap(page)).experiments[0].errorCode, 'TIMEOUT');
  const failed = await draft(page); await action(page, 'armExperiment', failed); await action(page, 'runExperiment', failed);
  await add(page, { id: 'failed-network', replayOf: 'baseline', status: 0 });
  assert.equal((await snap(page)).experiments[1].status, 'failed');
  const cancelled = await draft(page); await action(page, 'armExperiment', cancelled); await action(page, 'runExperiment', cancelled); await action(page, 'cancelExperiment', cancelled);
  await add(page, { id: 'after-cancel', replayOf: 'baseline', status: 200 });
  assert.equal((await snap(page)).experiments[2].status, 'cancelled');
  const entries = (await snap(page)).entries;
  await action(page, 'deleteExperiment', cancelled);
  assert.equal((await snap(page)).entries, entries);
  for (let i = 0; i < 48; i++) await draft(page);
  assert.equal((await snap(page)).experiments.length, 50);
  assert.equal(await draft(page), null);
});

test('experiment UI controls remain reachable in document and closed-shadow at 360/960/1600 widths', async t => {
  for (const shadow of [false, true]) for (const width of [360, 960, 1600]) {
    const page = await fixture(t, { shadow, width });
    await click(page, 'More actions'); await click(page, 'Prepare experiment');
    await click(page, 'Arm'); await click(page, 'Cancel'); await click(page, 'Delete');
    assert.equal((await snap(page)).experiments.length, 0);
    assert.equal((await snap(page)).overflow, false);
    assert.equal((await snap(page)).messages.length, 0);
  }
});

test('structural checks parse captured JSON with null decrypted bodies and do not compare every JSON string as the same schema', async t => {
  const page = await fixture(t);
  const id = await draft(page, {}, [{ type: 'structural', mode: 'schema' }]);
  await action(page, 'armExperiment', id); await action(page, 'runExperiment', id);
  await add(page, { id: 'different-shape', replayOf: 'baseline', status: 200, responseRaw: '{"different":1}', responseDecrypted: null });
  assert.equal((await snap(page)).experiments[0].checkResults[0].passed, false);
  const equal = await draft(page, {}, [{ type: 'structural', mode: 'equal' }]);
  await action(page, 'armExperiment', equal); await action(page, 'runExperiment', equal);
  await add(page, { id: 'equal-json', replayOf: 'baseline', status: 200, responseRaw: '{"ok":true}', responseDecrypted: null });
  assert.equal((await snap(page)).experiments[1].checkResults[0].passed, true);
});

test('editing sanitized query URL does not silently substitute the baseline query; mock timeout/cancel disable owned rules', async t => {
  const page = await fixture(t);
  const edited = await draft(page, { url: 'https://example.test/api?token=edited-secret' });
  await action(page, 'armExperiment', edited); await action(page, 'runExperiment', edited);
  assert.notEqual((await snap(page)).messages[0].request.url, 'https://example.test/api?token=secret-query');
  assert.equal((await snap(page)).messages[0].request.url.includes('edited-secret'), false);
  await action(page, 'cancelExperiment', edited);
  for (const cancel of [false, true]) {
    await page.evaluate(rule => window.experimentTest.rule(rule), mock());
    const id = await draft(page, { mockRuleId: 'mock-one', timeoutMs: cancel ? 30000 : 50 });
    await action(page, 'armExperiment', id); await action(page, 'runExperiment', id);
    if (cancel) await action(page, 'cancelExperiment', id); else await page.waitForTimeout(90);
    assert.equal((await snap(page)).rules[0].enabled, false);
  }
});

test('Replay editor and disabled rule prepare hooks remain inert and restore never resumes a persisted run', async t => {
  const page = await fixture(t);
  await click(page, 'More actions'); await click(page, 'Edit & Replay'); await click(page, 'Prepare experiment');
  const id = (await snap(page)).experiments[0].id;
  assert.equal((await snap(page)).messages.length, 0);
  await click(page, 'New rule');
  await page.getByLabel('URL contains / re:pattern').fill('/api');
  await click(page, 'Prepare mock experiment');
  assert.equal((await snap(page)).experiments[1].plan.mockRuleId, (await snap(page)).rules[0].id);
  assert.equal((await snap(page)).rules[0].enabled, false);
  assert.equal((await snap(page)).messages.filter(message => message.__xray_replay__).length, 0);
  await action(page, 'armExperiment', id); await action(page, 'runExperiment', id);
  await page.evaluate(() => { const state = window.experimentTest.snapshot(); window.experimentTest.saved = JSON.parse(JSON.stringify(state.writes.experiment_records)); });
  const before = (await snap(page)).messages.filter(message => message.__xray_replay__).length;
  await page.evaluate(async () => {
    // Simulate a reload via the private storage boundary, not a production auto-run.
    const saved = window.experimentTest.saved;
    window.XRAY_Store.get = async key => key === 'experiment_records' ? saved : undefined;
    const records = window.experimentTest.snapshot().experiments;
    for (const record of records) window.experimentTest.action('deleteExperiment', record.id);
    await window.experimentTest.restore();
  });
  assert.equal((await snap(page)).experiments[0].status, 'failed');
  assert.equal((await snap(page)).experiments[0].errorCode, 'INTERRUPTED');
  assert.equal((await snap(page)).messages.filter(message => message.__xray_replay__).length, before);
});

for (const entry of [
  { id: 'ws', type: 'api', source: 'ws', url: 'wss://example.test/socket', urlPath: '/socket', wsFrames: [] },
  { id: 'sse', type: 'api', source: 'sse', url: 'https://example.test/events', urlPath: '/events', wsFrames: [] },
  { id: 'log', type: 'log', source: 'console', url: 'https://example.test/log', urlPath: '/log', message: 'captured log' },
  { id: 'missing-url', type: 'api', urlPath: '/api' },
  { id: 'file-url', type: 'api', url: 'file:///tmp/api', urlPath: '/api' },
  { id: 'malformed-url', type: 'api', url: 'https://[broken', urlPath: '/api' },
]) {
  test(`${entry.id} details hide HTTP-only replay, experiment, and mock actions`, async t => {
    const page = await fixture(t, { entry });
    await click(page, 'More actions');
    const labels = await page.locator('.xray-detail-action-list button').allTextContents();
    for (const forbidden of ['Replay', 'Edit & Replay', 'Prepare experiment', 'Create disabled mock rule', 'Copy mock JSON', 'Copy cURL', 'Copy fetch']) {
      assert.equal(labels.some(label => label.trim() === forbidden), false, `${entry.id} exposes ${forbidden}`);
    }
    assert.ok(labels.includes('Save investigation'));
    assert.ok(labels.includes('Explain'));
    const state = await snap(page);
    assert.equal(state.messages.length, 0);
    assert.equal(state.experiments.length, 0);
    assert.equal(state.rules.length, 0);
  });
}

test('Edit & Replay preserves a redacted authorization placeholder and never dispatches its secret', async t => {
  const page = await fixture(t, { entry: {
    id: 'redacted', type: 'api', source: 'fetch', method: 'POST', status: 200,
    url: 'https://example.test/api', urlPath: '/api', requestHeaders: { authorization: '[redacted]', 'x-client': 'visible' },
    requestBody: { ok: true }, responseRaw: { ok: true },
  } });
  await click(page, 'More actions');
  const labels = await page.locator('.xray-detail-action-list button').allTextContents();
  for (const allowed of ['Replay', 'Edit & Replay', 'Prepare experiment', 'Create disabled mock rule', 'Copy mock JSON', 'Copy cURL', 'Copy fetch']) {
    assert.ok(labels.includes(allowed), `HTTP entry is missing ${allowed}`);
  }
  await page.setViewportSize({ width: 420, height: 900 });
  await click(page, 'Edit & Replay');
  const geo = await page.evaluate(() => {
    const body = document.querySelector('.xray-replay-body'), input = document.querySelector('[aria-label="Replay URL"]'), select = document.querySelector('[aria-label="Replay method"]');
    return { body: body.clientWidth, input: input.getBoundingClientRect().width, selectBottom: select.getBoundingClientRect().bottom, inputTop: input.getBoundingClientRect().top };
  });
  assert.ok(geo.input >= geo.body - 30, `URL field is full width at 420 (${geo.input} of ${geo.body})`);
  assert.ok(geo.inputTop >= geo.selectBottom - 1, 'URL field sits on its own row below the method');
  assert.equal(await page.locator('.xray-replay-headers').inputValue(), 'authorization: [redacted]\nx-client: visible');
  await page.locator('.xray-replay-headers').fill('authorization: [redacted]\nx-client: edited');
  await page.getByLabel('Replay URL', { exact: true }).fill('https://example.test/edited');
  assert.equal((await snap(page)).messages.length, 0, 'opening and editing never sends a replay');
  const ack = page.getByRole('checkbox', { name: /Acknowledge cross-origin/ });
  assert.equal(await ack.count(), 0, 'a same-origin edit does not ask for the cross-origin acknowledgement');
  await page.getByLabel('Replay URL', { exact: true }).fill('https://other.test/edited');
  assert.equal(await ack.count(), 1, 'a different origin shows the acknowledgement');
  await page.getByLabel('Replay URL', { exact: true }).fill('https://example.test/edited');
  assert.equal(await ack.count(), 0);
  // An acknowledgement for origin B must not carry over to origin C.
  await page.getByLabel('Replay URL', { exact: true }).fill('https://b.test/x');
  await ack.check();
  await page.getByLabel('Replay URL', { exact: true }).fill('https://c.test/x');
  assert.equal(await ack.isChecked(), false, 'a new origin needs a fresh acknowledgement');
  await page.getByLabel('Replay URL', { exact: true }).fill('https://example.test/edited');
  await click(page, 'Send replay');
  const state = await snap(page);
  assert.equal(state.messages.length, 1);
  assert.equal(state.messages[0].request.headers.authorization, '[redacted]');
  assert.equal(state.messages[0].request.headers['x-client'], 'edited');
  assert.equal(state.messages[0].request.url, 'https://example.test/edited');
  assert.equal(state.messages[0].request.replayOf, 'redacted');
  assert.equal(JSON.stringify(state.messages).includes('secret'), false);
});

// JSON fidelity Task 9 (J10): plans are made from the lossless parse, so an integer past 2^53 is held
// as the snapshot's bigint envelope — the card shows its digits, never the internal {"$xray": …} shape.
for (const shadow of [false, true]) {
  test(`J10 the experiment card shows a big-integer plan body as its digits (${shadow ? 'closed shadow' : 'document'})`, async t => {
    const entry = { id: 'bigbase', type: 'api', method: 'POST', status: 200, url: 'https://example.test/api', urlPath: '/api', timestamp: 1,
      responseRaw: '{"ok":true}', requestHeaders: {}, requestBodyKind: 'text', requestBodyText: '{"id":9007199254740993,"b":1}', requestBody: { b: 1, id: 9007199254740992 } };
    const page = await fixture(t, { shadow, entry });
    await click(page, 'More actions');
    await click(page, 'Prepare experiment');
    const state = await snap(page);
    assert.equal(state.experiments.length, 1);
    assert.match(state.text, /"id": 9007199254740993/);
    assert.doesNotMatch(state.text, /\$xray|9007199254740992/);
  });
}
