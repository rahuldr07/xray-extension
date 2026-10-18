import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { before, after } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { setStandardsContent } from '../helpers/standards-page.mjs';

const { outputFiles } = await build({
  stdin: { resolveDir: fileURLToPath(new URL('../../', import.meta.url)), loader: 'ts', contents: `
    import { usePanelStore } from './src/panel/store';
    const values = {}, writes = [], messages = [], errors = [];
    const holds = {}, releases = {};
    let failRead = false, failWrite = false;
    window.addEventListener('unhandledrejection', e => errors.push(String(e.reason)));
    window.__XRAY_bridgeToken = 'fixture';
    window.postMessage = message => messages.push(message);
    window.XRAY_Store = {
      get: async key => { const value = values[key]; if (holds['get:'+key]) await new Promise(r => releases['get:'+key] = r);
        if (failRead) throw Error('Bearer private-storage-secret'); return value; },
      set: async (key, value) => { if (holds['set:'+key]) await new Promise(r => releases['set:'+key] = r);
        if (failWrite) throw Error('Bearer private-storage-secret');
        values[key] = structuredClone(value); writes.push({key,value:structuredClone(value)}); }
    };
    const baseline = { id:'baseline',type:'api',method:'POST',status:200,url:'https://example.test/api?token=secret-query#secret-fragment',
      timestamp:1,duration:600,responseRaw:{ok:true}, requestHeaders:{authorization:'Bearer secret-auth'},requestBody:{password:'secret-body'} };
    window.storeTest = {
      call(name,...args) { return usePanelStore.getState()[name](...args); },
      setup() { this.call('addEntry',baseline); this.call('selectEntry','baseline'); },
      set(patch) { usePanelStore.setState(patch); },
      add(patch) { this.call('addEntry',{...baseline,timestamp:Date.now(),...patch}); },
      storage(key,value) { values[key]=value; },
      hold(kind,key) { holds[kind+':'+key]=true; },
      release(kind,key) { holds[kind+':'+key]=false; releases[kind+':'+key]?.(); },
      failure(read,write) { failRead=read; failWrite=write; },
      restoreStart() { this.restoring=this.call('restorePreferences'); },
      async restored() { await this.restoring; },
      snap() { const s=usePanelStore.getState();return {sessionId:s.session.sessionId,findings:s.findings,synthesis:s.findingSynthesisIds,
        store:s.investigationStore,storageState:s.investigationStorageState,entries:s.entries,selectedId:s.selectedId,
        pins:[...s.pinnedIds],compare:[s.compareLeftId,s.compareRightId],filters:[...s.methodFilters],experiments:s.experiments,rules:s.rules,
        toast:s.toastMessage,messages,writes,values,errors}; }
    };
  ` }, bundle: true, format: 'iife', write: false,
});
let browser;
before(async () => {
  const executablePath = process.env.XRAY_BROWSER_EXECUTABLE || (!existsSync(chromium.executablePath()) && existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined);
  browser = await chromium.launch({ executablePath, headless: true });
});
after(async () => { await browser?.close(); });
async function fixture(t, setup = true) {
  const page = await browser.newPage();
  t.after(() => page.close());
  await setStandardsContent(page, '<main>Real store fixture</main>');
  await page.addScriptTag({ content: outputFiles[0].text });
  if (setup) await page.evaluate(() => window.storeTest.setup());
  return page;
}
const call = (page, name, ...args) => page.evaluate(({name,args}) => window.storeTest.call(name,...args), {name,args});
const snap = page => page.evaluate(() => window.storeTest.snap());
const add = (page, patch) => page.evaluate(patch => window.storeTest.add(patch), patch);
async function prepare(page, plan = {}, checks = [{type:'status',expected:200}]) {
  const id = await call(page,'saveInvestigation','Recipe');
  await call(page,'addInvestigationScenario',id,'baseline',plan,checks);
  const scenario = (await snap(page)).store.investigations[0].scenarios[0];
  return {id,scenarioId:scenario.id,stepId:scenario.steps[0].id};
}
const run = (page, recipe) => call(page,'runScenarioStep',recipe.id,recipe.scenarioId,recipe.stepId);
const receipts = state => state.store.investigations[0].runs;

test('scenario dispatch waits for the initial storage version check', async t => {
  const page = await fixture(t, false);
  await page.evaluate(() => {
    const t = window.storeTest;
    t.storage('saved_investigations', { schemaVersion: 99, investigations: [] });
    t.hold('get', 'saved_investigations');
    t.setup();
    const id = t.call('saveInvestigation', 'Pending version');
    t.call('addInvestigationScenario', id, 'baseline');
    const scenario = t.snap().store.investigations[0].scenarios[0];
    t.call('runScenarioStep', id, scenario.id, scenario.steps[0].id);
  });
  assert.equal((await snap(page)).messages.length, 0, 'unknown schema cannot start irreversible page work');
  await page.evaluate(() => window.storeTest.release('get', 'saved_investigations'));
  await page.waitForTimeout(300);
  assert.equal((await snap(page)).storageState, 'unsupported');
  assert.equal((await snap(page)).messages.length, 0, 'finishing a version check never auto-runs');
});

test('findings reconcile before eviction, after patches/import/threshold changes, and navigate retained evidence only', async t => {
  const page = await fixture(t);
  let state = await snap(page);
  assert.equal(state.findings.findings.some(f => f.kind==='slow'),true);
  const finding = state.findings.findings[0];
  await call(page,'dismissFinding',finding.id);
  assert.equal((await snap(page)).findings.dismissals[finding.id],finding.fingerprint);
  await call(page,'restoreFinding',finding.id);
  await call(page,'openFindingSynthesis',[finding.id,finding.id,'missing']);
  assert.deepEqual((await snap(page)).synthesis,[finding.id]);
  await call(page,'closeFindingSynthesis');
  await call(page,'updateSettings',{maxEntries:50,slowThresholdMs:1000});
  assert.equal((await snap(page)).findings.findings.find(f=>f.id===finding.id).active,false);
  await call(page,'updateEntry',{id:'baseline',status:503,duration:1100});
  await page.waitForTimeout(80);
  assert.ok((await snap(page)).findings.findings.some(f=>f.kind==='http-error'));
  await call(page,'restoreEntries',[{id:'import',type:'api',url:'https://example.test/import',status:500,duration:1}]);
  assert.ok((await snap(page)).findings.findings.some(f=>f.evidence.some(e=>e.entryId==='import')));
  await page.evaluate(() => { window.storeTest.call('selectEntry',null);window.storeTest.call('addEntries',Array.from({length:51},(_,i)=>({id:'e'+i,type:'api',url:'https://example.test/'+i,status:200,duration:1,timestamp:i+10}))); });
  state = await snap(page);
  assert.equal(state.entries.some(e=>e.id==='baseline'),false);
  await call(page,'openFindingEvidence',finding.id,'baseline');
  assert.equal((await snap(page)).selectedId,null);
});

test('save/open are inert sanitized context snapshots; Clear preserves recipes and wrong-session IDs refuse until explicit rebind', async t => {
  const page = await fixture(t);
  await call(page,'togglePinned','baseline');await call(page,'setComparisonEntry','left','baseline');await call(page,'toggleMethodFilter','POST');
  const recipe = await prepare(page);
  await call(page,'addInvestigationAssertion',recipe.id,'baseline',{type:'structural',mode:'equal'});
  assert.equal((await call(page,'evaluateInvestigationAssertions',recipe.id))[0].outcome,'passed');
  await call(page,'clearSession');await add(page,{id:'baseline'});
  await call(page,'openInvestigation',recipe.id);
  let state = await snap(page);
  assert.equal(state.selectedId,null);assert.deepEqual(state.pins,[]);assert.deepEqual(state.compare,[null,null]);assert.deepEqual(state.filters,['POST']);
  assert.equal((await call(page,'evaluateInvestigationAssertions',recipe.id))[0].outcome,'unavailable');
  await run(page,recipe);
  assert.equal((await snap(page)).experiments.length,0);
  await call(page,'rebindScenarioStep',recipe.id,recipe.scenarioId,recipe.stepId,'baseline');
  assert.equal((await snap(page)).messages.filter(m=>m.__xray_replay__).length,0);
  await run(page,recipe);
  state=await snap(page);assert.equal(receipts(state)[0].status,'running');assert.equal(state.messages.filter(m=>m.__xray_replay__).length,1);
  await page.waitForTimeout(400);
  const stored=(await snap(page)).values.saved_investigations;
  assert.ok(stored);assert.equal(JSON.stringify(stored).includes('secret-'),false);assert.equal(JSON.stringify(stored).includes('responseRaw'),false);
});

test('step runs associate via experiments, freeze tri-state scalars and never advance the next step', async t => {
  const page = await fixture(t);
  const recipe = await prepare(page,{},[{type:'status',expected:200},{type:'structural',mode:'equal'}]);
  await call(page,'addScenarioStep',recipe.id,recipe.scenarioId,'baseline');
  assert.equal((await snap(page)).store.investigations[0].scenarios[0].steps.length,2);
  await add(page,{id:'old',replayOf:'baseline'});
  await run(page,recipe);await add(page,{id:'unrelated',status:500});
  assert.equal(receipts(await snap(page))[0].status,'running');
  await add(page,{id:'pending',replayOf:'baseline',status:undefined,responseRaw:undefined});
  await call(page,'updateEntry',{id:'pending',status:200,responseRaw:{ok:true}});await page.waitForTimeout(80);
  let state=await snap(page);
  assert.equal(receipts(state)[0].status,'passed');assert.equal(receipts(state)[0].observedEntryId,'pending');assert.ok(receipts(state)[0].results.every(r=>r.outcome==='passed'));
  assert.equal(state.experiments.length,1);assert.equal(state.messages.filter(m=>m.__xray_replay__).length,1);
  await run(page,recipe);await add(page,{id:'redacted',replayOf:'baseline',responseRaw:{password:'secret-body'}});
  state=await snap(page);assert.equal(receipts(state)[1].status,'unavailable');assert.equal(receipts(state)[1].results[1].outcome,'unavailable');
  assert.equal(JSON.stringify(receipts(state)).includes('secret-'),false);
});

test('edited target intent survives sanitation; missing route/cap/active baseline cannot manufacture success', async t => {
  const page=await fixture(t);const recipe=await prepare(page,{url:'https://example.test/api?token=edited-secret'});
  await run(page,recipe);
  let state=await snap(page);assert.equal(state.messages[0].request.url.includes('secret-'),false);
  await run(page,recipe);state=await snap(page);assert.equal(state.messages.length,1);assert.equal(receipts(state).filter(r=>r.status==='running').length,1);
  await call(page,'cancelScenarioStep',recipe.id,receipts(state)[0].id);
  await page.evaluate(() => { delete window.__XRAY_bridgeToken; });
  await run(page,recipe);state=await snap(page);assert.equal(receipts(state).at(-1).status,'unavailable');assert.equal(state.messages.length,1);
  await page.evaluate(() => { const s=window.storeTest.snap();window.storeTest.set({experiments:Array.from({length:50},(_,i)=>({...s.experiments[0],id:'cap'+i,status:'draft'}))}); });
  await run(page,recipe);assert.equal((await snap(page)).experiments.length,50);assert.notEqual(receipts(await snap(page)).at(-1).status,'passed');
});

test('cancel, timeout, deletion and Clear delegate experiment-owned mock cleanup and reject late evidence', async t => {
  const page=await fixture(t);
  await page.evaluate(() => window.storeTest.set({rules:[{id:'mock',label:'Mock',enabled:false,match:{url:'/api',method:'POST'},action:{type:'mock',status:200,body:'{}',headers:{},delayMs:0}}]}));
  const recipe=await prepare(page,{mockRuleId:'mock',timeoutMs:50});
  await run(page,recipe);assert.equal((await snap(page)).rules[0].enabled,true);
  await page.waitForTimeout(90);let state=await snap(page);assert.equal(receipts(state)[0].status,'failed');assert.equal(state.rules[0].enabled,false);
  await run(page,recipe);state=await snap(page);await call(page,'cancelScenarioStep',recipe.id,receipts(state).at(-1).id);
  await add(page,{id:'late',mocked:true,mockRuleId:'mock'});assert.equal(receipts(await snap(page)).at(-1).status,'cancelled');
  await run(page,recipe);await call(page,'removeInvestigationScenario',recipe.id,recipe.scenarioId);state=await snap(page);assert.equal(state.rules[0].enabled,false);
  await call(page,'addInvestigationScenario',recipe.id,'baseline',{mockRuleId:'mock'});
  const scenario=(await snap(page)).store.investigations[0].scenarios[0];await run(page,{id:recipe.id,scenarioId:scenario.id,stepId:scenario.steps[0].id});
  await call(page,'clearSession');await add(page,{id:'baseline'});await add(page,{id:'new-session-late',mocked:true,mockRuleId:'mock'});
  state=await snap(page);assert.equal(state.rules[0].enabled,false);assert.notEqual(receipts(state).at(-1).status,'passed');
  await call(page,'deleteInvestigation',recipe.id);assert.equal((await snap(page)).store.investigations.length,0);
});

test('delayed restores cannot resurrect cleared ledger, local edits/deletes or overwrite active mock rules', async t => {
  const page=await fixture(t);const recipe=await prepare(page);await page.waitForTimeout(400);
  await page.evaluate(() => { const s=window.storeTest.snap();window.storeTest.storage('finding_state',s.findings);window.storeTest.storage('session_envelope',{schemaVersion:1,sessionId:s.sessionId,entries:s.entries});window.storeTest.hold('get','saved_investigations');window.storeTest.hold('get','traffic_rules');window.storeTest.restoreStart(); });
  await call(page,'updateInvestigation',recipe.id,{title:'Local edit'});await call(page,'deleteInvestigation',recipe.id);await call(page,'clearSession');
  await page.evaluate(() => {window.storeTest.set({rules:[{id:'active',enabled:true,match:{url:'/api',method:'GET'},action:{type:'mock',status:200,body:'{}',headers:{},delayMs:0}}]});window.storeTest.release('get','saved_investigations');window.storeTest.release('get','traffic_rules');return window.storeTest.restored();});
  let state=await snap(page);assert.equal(state.store.investigations.length,0);assert.equal(state.findings.findings.length,0);assert.equal(state.entries.length,0);assert.equal(state.rules[0].id,'active');
  await page.waitForTimeout(400);state=await snap(page);assert.equal(state.values.saved_investigations.investigations.length,0);
});

test('serialized writes land in mutation order and Clear supersedes an in-flight old finding snapshot', async t => {
  const page=await fixture(t);await page.evaluate(() => {window.storeTest.hold('set','saved_investigations');window.storeTest.hold('set','finding_state');});
  const id=await call(page,'saveInvestigation','First');await page.waitForTimeout(350);
  await call(page,'updateInvestigation',id,{title:'Last'});await call(page,'clearSession');
  await page.evaluate(() => {window.storeTest.release('set','saved_investigations');window.storeTest.release('set','finding_state');});await page.waitForTimeout(400);
  const state=await snap(page);assert.equal(state.values.saved_investigations.investigations[0].title,'Last');assert.equal(state.values.finding_state.sessionId,state.sessionId);assert.equal(state.values.finding_state.findings.length,0);
});

test('unsupported versions are guarded before normalization or writes including Clear and pre-load local saves', async t => {
  const page=await fixture(t,false);
  await page.evaluate(() => {window.storeTest.storage('saved_investigations',{schemaVersion:2,keep:'future'});window.storeTest.storage('finding_state',{schemaVersion:2,keep:'future'});window.storeTest.setup();});
  await call(page,'saveInvestigation','Before load');await call(page,'restorePreferences');await call(page,'clearSession');await page.waitForTimeout(400);
  const state=await snap(page);assert.equal(state.storageState,'unsupported');assert.equal(state.values.saved_investigations.keep,'future');assert.equal(state.values.finding_state.keep,'future');assert.equal(state.writes.some(w=>['saved_investigations','finding_state'].includes(w.key)),false);
});

test('write/read/unavailable failures expose sanitized receipts without unhandled promises or fake saved claims', async t => {
  for (const mode of ['write','read','unavailable']) {
    const page=await fixture(t,false);
    await page.evaluate(mode => {if(mode==='unavailable')delete window.XRAY_Store;else window.storeTest.failure(mode==='read',mode==='write');window.storeTest.setup();},mode);
    await call(page,'restorePreferences');const id=await call(page,'saveInvestigation','Failure');await page.waitForTimeout(400);
    const state=await snap(page);assert.equal(state.storageState,mode==='unavailable'?'unavailable':'failed');assert.equal(state.values.saved_investigations,undefined);assert.equal(JSON.stringify(state).includes('private-storage-secret'),false);assert.deepEqual(state.errors,[]);
    assert.equal(/^Investigation saved[.!]/i.test(state.toast||''),false);if(mode==='unavailable')assert.equal(id,null);
  }
});

test('restoring a running scalar receipt marks interrupted and never resumes a scenario', async t => {
  const page=await fixture(t);const recipe=await prepare(page);await run(page,recipe);await page.waitForTimeout(400);
  const saved=(await snap(page)).values.saved_investigations;
  const reload=await fixture(t,false);await reload.evaluate(saved => window.storeTest.storage('saved_investigations',saved),saved);await call(reload,'restorePreferences');
  const state=await snap(reload);assert.equal(receipts(state)[0].status,'interrupted');assert.equal(state.messages.filter(m=>m.__xray_replay__).length,0);
});

test('reload restores same-session dismissal history and retained context; bounded authoring/removal preserves step order', async t => {
  const page=await fixture(t);const finding=(await snap(page)).findings.findings[0];await call(page,'dismissFinding',finding.id);
  await call(page,'togglePinned','baseline');await call(page,'setComparisonEntry','right','baseline');
  const recipe=await prepare(page);await call(page,'addInvestigationAssertion',recipe.id,'baseline',{type:'status',expected:200});
  await call(page,'addScenarioStep',recipe.id,recipe.scenarioId,'baseline',{url:'https://example.test/second'});
  const authored=await snap(page);const steps=authored.store.investigations[0].scenarios[0].steps;assert.notEqual(steps[0].id,steps[1].id);assert.equal(steps[1].plan.url,'https://example.test/second');
  await page.waitForTimeout(400);const stored=await snap(page);
  const reload=await fixture(t,false);await reload.evaluate(s => {window.storeTest.storage('session_envelope',{schemaVersion:1,sessionId:s.sessionId,entries:s.entries});window.storeTest.storage('finding_state',s.values.finding_state);window.storeTest.storage('saved_investigations',s.values.saved_investigations);},stored);
  await call(reload,'restorePreferences');await call(reload,'openInvestigation',recipe.id);
  let state=await snap(reload);assert.equal(state.selectedId,'baseline');assert.deepEqual(state.pins,['baseline']);assert.deepEqual(state.compare,[null,'baseline']);assert.equal(state.findings.dismissals[finding.id],finding.fingerprint);assert.equal(state.experiments.length,0);
  const assertion=state.store.investigations[0].assertions[0];await call(reload,'removeInvestigationAssertion',recipe.id,assertion.id);assert.equal((await snap(reload)).store.investigations[0].assertions.length,0);
  await reload.evaluate(id => {for(let i=0;i<25;i++)window.storeTest.call('saveInvestigation','Bounded '+i);window.storeTest.call('addInvestigationScenario',id,'baseline',{url:'https://other.test/no-ack'});},recipe.id);
  state=await snap(reload);assert.equal(state.store.investigations.length,25);assert.equal(state.store.investigations[0].scenarios.length,1);assert.equal(state.messages.filter(m=>m.__xray_replay__).length,0);
});

test('save waits for initial version read; delayed local authoring and deletion are never replaced by older persisted recipes', async t => {
  const original=await fixture(t);const recipe=await prepare(original);await pageWait(original);const saved=(await snap(original)).values.saved_investigations;
  for(const mutation of ['update','delete','save']) {
    const page=await fixture(t,false);await page.evaluate(saved => {window.storeTest.storage('saved_investigations',saved);window.storeTest.set({investigationStore:saved});window.storeTest.hold('get','saved_investigations');window.storeTest.restoreStart();},saved);
    if(mutation==='update')await call(page,'updateInvestigation',recipe.id,{title:'Local title'});
    if(mutation==='delete')await call(page,'deleteInvestigation',recipe.id);
    if(mutation==='save')await call(page,'saveInvestigation','Local new');
    await page.waitForTimeout(350);assert.equal((await snap(page)).writes.some(w=>w.key==='saved_investigations'),false);
    await page.evaluate(() => {window.storeTest.release('get','saved_investigations');return window.storeTest.restored();});await page.waitForTimeout(100);
    const state=await snap(page);assert.equal(state.storageState,'ready');
    if(mutation==='update')assert.equal(state.store.investigations[0].title,'Local title');
    if(mutation==='delete')assert.equal(state.store.investigations.length,0);
    if(mutation==='save')assert.equal(state.store.investigations.at(-1).title,'Local new');
    assert.deepEqual(state.values.saved_investigations,state.store);
  }
});

async function pageWait(page) { await page.waitForTimeout(400); }

test('a restore begun after a local unsaved edit/delete still cannot replace that mutation with stale disk state', async t => {
  const page=await fixture(t);const recipe=await prepare(page);await pageWait(page);
  const finding=(await snap(page)).findings.findings[0];await call(page,'dismissFinding',finding.id);await call(page,'restorePreferences');
  assert.equal((await snap(page)).findings.dismissals[finding.id],finding.fingerprint);
  await call(page,'updateInvestigation',recipe.id,{title:'Unsaved newest'});await call(page,'restorePreferences');
  assert.equal((await snap(page)).store.investigations[0].title,'Unsaved newest');
  await call(page,'deleteInvestigation',recipe.id);await call(page,'restorePreferences');assert.equal((await snap(page)).store.investigations.length,0);
});

test('pre-load local creation/deletion preserves unrelated saved recipes in the eventual atomic envelope', async t => {
  const original=await fixture(t);const first=await call(original,'saveInvestigation','First');await call(original,'saveInvestigation','Other');await pageWait(original);
  const saved=(await snap(original)).values.saved_investigations;
  const page=await fixture(t,false);await page.evaluate(saved => {window.storeTest.storage('saved_investigations',saved);window.storeTest.hold('get','saved_investigations');},saved);
  await call(page,'saveInvestigation','New local');await call(page,'deleteInvestigation',first);await page.waitForTimeout(350);
  await page.evaluate(() => window.storeTest.release('get','saved_investigations'));await page.waitForTimeout(150);
  const state=await snap(page);assert.deepEqual(state.store.investigations.map(i=>i.title),['Other','New local']);assert.deepEqual(state.values.saved_investigations,state.store);
});

test('restore started during an active mock cannot replace its rule with an older disabled storage snapshot', async t => {
  const page=await fixture(t);const rule={id:'mock',label:'Mock',enabled:false,match:{url:'/api',method:'POST'},action:{type:'mock',status:200,body:'{}',headers:{},delayMs:0}};
  await page.evaluate(rule => window.storeTest.set({rules:[rule]}),rule);const recipe=await prepare(page,{mockRuleId:'mock'});await run(page,recipe);
  await page.evaluate(rule => window.storeTest.storage('traffic_rules',[rule]),rule);await call(page,'restorePreferences');
  assert.equal((await snap(page)).rules[0].enabled,true);
  const runId=receipts(await snap(page))[0].id;await call(page,'cancelScenarioStep',recipe.id,runId);assert.equal((await snap(page)).rules[0].enabled,false);
});

test('aggregate recipe envelope is atomic and bounded at 1 MB when step authoring reaches the limit', async t => {
  const page=await fixture(t);const id=await call(page,'saveInvestigation','Large bounded recipe');
  await page.evaluate(id => {
    const plan={body:'!'.repeat(19500)};
    for(let s=0;s<3;s++) {
      window.storeTest.call('addInvestigationScenario',id,'baseline',plan);
      const scenarios=window.storeTest.snap().store.investigations[0].scenarios;
      const scenario=scenarios.at(-1);if(!scenario)break;
      for(let step=1;step<20;step++)window.storeTest.call('addScenarioStep',id,scenario.id,'baseline',plan);
    }
  },id);
  const state=await snap(page);const count=state.store.investigations[0].scenarios.reduce((n,s)=>n+s.steps.length,0);
  assert.ok(count>40&&count<60);assert.ok(Buffer.byteLength(JSON.stringify(state.store))<=1_000_000);
  assert.equal(state.messages.filter(m=>m.__xray_replay__).length,0);
  await pageWait(page);assert.deepEqual((await snap(page)).values.saved_investigations,state.store);
  await page.evaluate(() => {
    const store=structuredClone(window.storeTest.snap().store);let room=997000-new TextEncoder().encode(JSON.stringify(store)).length;
    for(const scenario of store.investigations[0].scenarios)for(const step of scenario.steps) {
      const extra=Math.min(room,19998-step.plan.body.length);if(extra>0){step.plan.body+='!'.repeat(extra);room-=extra;}
    }
    store.investigations[0].notes='!'.repeat(Math.max(0,Math.min(4000,room)));window.storeTest.set({investigationStore:store});
  });
  const beforeRun=(await snap(page)).store;const firstScenario=beforeRun.investigations[0].scenarios[0];
  await run(page,{id,scenarioId:firstScenario.id,stepId:firstScenario.steps[0].id});assert.equal(receipts(await snap(page))[0].status,'running');
  await call(page,'updateInvestigation',id,{notes:'!'.repeat(beforeRun.investigations[0].notes.length+1500)});
  assert.equal((await snap(page)).store.investigations[0].notes,beforeRun.investigations[0].notes,'authoring must preserve reserved terminal receipt capacity');
  await call(page,'cancelScenarioStep',id,receipts(await snap(page))[0].id);
  const submitted=(await snap(page)).messages.filter(m=>m.__xray_replay__).length;
  await page.evaluate(() => {
    const store=structuredClone(window.storeTest.snap().store);let room=999980-new TextEncoder().encode(JSON.stringify(store)).length;
    for(const scenario of store.investigations[0].scenarios)for(const step of scenario.steps) {
      const extra=Math.min(room,19998-step.plan.body.length);if(extra>0){step.plan.body+='!'.repeat(extra);room-=extra;}
    }
    store.investigations[0].notes='!'.repeat(Math.min(4000,room));window.storeTest.set({investigationStore:store});
  });
  const near=(await snap(page)).store;assert.ok(Buffer.byteLength(JSON.stringify(near))>999900);
  const scenario=near.investigations[0].scenarios[0];await run(page,{id,scenarioId:scenario.id,stepId:scenario.steps[0].id});
  assert.equal((await snap(page)).messages.filter(m=>m.__xray_replay__).length,submitted,'receipt capacity refusal must happen before experiment dispatch');
});
