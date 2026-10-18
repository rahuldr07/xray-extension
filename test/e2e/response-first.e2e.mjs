import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { before, after } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';

// The production component/store/keyboard run in Chromium, including a closed
// shadow root. Only unavailable extension/clipboard boundaries are stubbed.
const { outputFiles } = await build({
  stdin: {
    resolveDir: fileURLToPath(new URL('../../', import.meta.url)), loader: 'jsx',
    contents: `
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      import { flushSync } from 'react-dom';
      import { RequestDetail } from './src/panel/components/detail/RequestDetail';
      import { ModalShell } from './src/panel/components/common/ModalShell';
      import { installPanelKeyboard } from './src/panel/runtime/panelKeyboard';
      import { usePanelStore } from './src/panel/store';
      import styles from './src/panel/styles.css';
      const base = { id:'one', type:'api', method:'GET', status:200,
        url:'https://example.test/widgets?full=' + 'long-'.repeat(45), urlPath:'/widgets',
        timestamp:200, duration:950, size:100, source:'fetch',
        responseRaw: JSON.stringify({items:[{id:1,amount:30},{id:2,amount:40}]}),
        requestBody: JSON.stringify({query:'first'}),
        requestHeaders:{cookie:'fixture=one'}, responseHeaders:{'content-type':'application/json'},
        initiator:['at load (https://example.test/app.js:10:2)'],
        jwtLenses:[{source:'requestHeaders.authorization', header:{alg:'HS256'}, payload:{sub:'fixture'}}],
      };
      function Fixture() {
        const entries = usePanelStore(s=>s.entries);
        const selected = usePanelStore(s=>s.selectedId);
        const explain = usePanelStore(s=>s.explainEntry);
        return <div className="xray-theme-scope xray-theme-xray-dark"><div className="xray-panel xray-mode-window xray-open">
          <RequestDetail entry={entries.find(e=>e.id===selected) || entries[0]} compact={window.responseTest.compact} onClose={()=>usePanelStore.getState().setApiDetailOpen(false)} />
          <button id="outside">Outside</button>
          {explain && <ModalShell title="Explain fixture" onClose={()=>usePanelStore.getState().closeExplain()}><button>Analyze fixture</button></ModalShell>}
        </div></div>;
      }
      window.responseTest = {
        calls: {replay:0}, copied:[], deny:false, compact:false, pageEscapes:0,
        setup(shadow, state, compact) {
          this.compact=compact;
          const host=document.body.appendChild(document.createElement('div'));
          const root=shadow ? host.attachShadow({mode:'closed'}) : document;
          this.root=root;
          const sheet=document.createElement('style'); sheet.textContent=styles;
          (shadow ? root : document.head).appendChild(sheet);
          const mount=shadow ? root.appendChild(document.createElement('div')) : host;
          Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{
            if (this.deny) throw new Error('Clipboard denied'); this.copied.push(text);
          }}});
          usePanelStore.setState({entries:[base], selectedId:'one', open:true, activeTab:'api', apiDetailOpen:true,
            detailTab:'response',detailView:'tree',replayEntry:()=>this.calls.replay++, ...state});
          installPanelKeyboard({dismissible:true,getRoot:()=>root});
          document.addEventListener('keydown',event=>{if(event.key==='Escape') this.pageEscapes++;});
          flushSync(()=>createRoot(mount).render(<Fixture />));
        },
        set(state) {flushSync(()=>usePanelStore.setState(state));},
        settings(patch) {flushSync(()=>usePanelStore.getState().updateSettings(patch));},
        entry(entry) {
          const value={...base,...entry};
          flushSync(()=>usePanelStore.setState({entries:[...usePanelStore.getState().entries.filter(e=>e.id!==value.id),value],selectedId:value.id}));
        },
        focus(text) { const button=[...this.root.querySelectorAll('button')].find(b=>b.textContent.trim()===text); if(!button) throw new Error('Missing button '+text); button.focus(); },
        snapshot() {
          const s=usePanelStore.getState();
          return {drawer:s.apiDetailOpen,open:s.open,selected:s.selectedId,tab:s.detailTab,view:s.detailView,
            draft:s.consoleDraft,activeTab:s.activeTab,rules:s.rules,toast:s.toastMessage,explain:!!s.explainEntry,
            calls:this.calls,copied:this.copied,pageEscapes:this.pageEscapes, focus:this.root.activeElement?.textContent?.trim(),
            expanded:this.root.querySelector('[aria-controls][aria-label="More actions"]')?.getAttribute('aria-expanded'),
            facet:this.root.querySelector('[aria-label="Request facets"] [aria-pressed="true"]')?.textContent,
            content:this.root.querySelector('.xray-detail-content')?.textContent,
            actions:[...this.root.querySelectorAll('[aria-label="Secondary request actions"] button')].map(b=>b.textContent.trim()),
            separators:this.root.querySelectorAll('[aria-label="Secondary request actions"] .xray-menu-sep[aria-hidden="true"]').length,
            fit:(()=>{const m=this.root.querySelector('[aria-label="Secondary request actions"]'),d=this.root.querySelector('.xray-request-detail');if(!m)return null;const a=m.getBoundingClientRect(),b=d.getBoundingClientRect();return {top:a.top,bottom:a.bottom,left:a.left,right:a.right,dTop:b.top,dBottom:b.bottom,dLeft:b.left,dRight:b.right,scrolls:m.scrollHeight>m.clientHeight,uppercase:getComputedStyle(m.querySelector('button')).textTransform};})()};
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
async function fixture(t, { shadow = false, state = {}, compact = false, width = 960 } = {}) {
  const page = await browser.newPage({ viewport: { width, height: 700 } });
  t.after(() => page.close());
  await page.setContent('<style>body{margin:0}</style>');
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(args => window.responseTest.setup(args.shadow, args.state, args.compact), { shadow, state, compact });
  return page;
}
const snap = page => page.evaluate(() => window.responseTest.snapshot());
const click = async (page, text) => {
  await page.evaluate(text => window.responseTest.focus(text), text);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(30);
};
const entry = (page, value) => page.evaluate(value => window.responseTest.entry(value), value);

test('one primary facet navigation and one common action row leave response first', async t => {
  const page = await fixture(t);
  assert.deepEqual(await page.locator('[aria-label="Request facets"] button').allTextContents(), ['Response','Request','Headers','Timing','Cookies','Initiator','Tokens']);
  assert.deepEqual(await page.locator('[aria-label="Body views"] button').allTextContents(), ['Tree','Raw','Table','Schema','Diff','Visualize']);
  assert.deepEqual(await page.locator('[aria-label="Request actions"] > button, [aria-label="Request actions"] > div > button').allTextContents(), ['Copy','Export','Console','More actions']);
  assert.equal(await page.locator('.xray-detail-footer, .xray-smart-ops').count(), 0);
  assert.equal((await snap(page)).facet, 'Response');
  assert.ok((await snap(page)).content.includes('amount'));
  const recommendations = await page.locator('[aria-label="Recommended actions"] button').allTextContents();
  assert.ok(recommendations.length <= 2);
  assert.ok(!recommendations.some(text => ['Schema','Table','Visualize','Timing','Headers','Copy','Export','Console'].includes(text)));
  await click(page,'Metadata');
  assert.ok(await page.getByRole('textbox', { name:'Full request URL' }).inputValue().then(value=>value.includes('long-'.repeat(45))));
  assert.equal((await snap(page)).selected,'one');
});

test('legacy preferences and body modes survive specialized facets and new entries', async t => {
  for (const [detailTab,detailView,expected] of [['request','schema','Request'],['request','headers','Headers'],['headers','waterfall','Timing']]) {
    const page = await fixture(t,{state:{detailTab,detailView}});
    assert.equal((await snap(page)).facet,expected);
  }
  const page=await fixture(t);
  await click(page,'Schema'); await click(page,'Headers');
  assert.equal(await page.locator('[aria-label="Body views"]').count(),0);
  await click(page,'Timing'); await click(page,'Request');
  assert.equal((await snap(page)).view,'schema');
  assert.ok((await snap(page)).content.includes('query'));
  await entry(page,{id:'two',requestBody:'{"second":2}'});
  assert.equal((await snap(page)).facet,'Request');
  assert.equal((await snap(page)).view,'schema');
  assert.ok((await snap(page)).content.includes('second'));
  for (const mode of ['Tree','Raw','Table','Schema','Diff','Visualize']) {
    await click(page,mode);
    assert.equal(await page.getByRole('button',{name:mode,exact:true}).getAttribute('aria-pressed'),'true');
  }
});

test('conditional facets disappear without stale entry content; missing and plain bodies are explicit', async t => {
  const page=await fixture(t);
  for (const facet of ['Cookies','Initiator','Tokens','Frames']) {
    await entry(page,{id:'special-'+facet,wsFrames:[{dir:'in',ts:1,preview:'stream-fixture',size:14}]});
    await click(page,facet);
    await entry(page,{id:'bare-'+facet,requestHeaders:{},initiator:[],jwtLenses:[],wsFrames:undefined,responseRaw:'plain next response'});
    assert.equal((await snap(page)).facet,'Response');
    assert.equal((await snap(page)).content,'plain next response');
  }
  await entry(page,{id:'empty',responseRaw:null});
  assert.ok((await snap(page)).content.includes('No response body captured'));
  await click(page,'Request'); await entry(page,{id:'no-request',requestBody:null});
  assert.ok((await snap(page)).content.includes('No request body captured'));
  await click(page,'Response');
  await entry(page,{id:'stream',responseRaw:null,wsFrames:[],wsState:'connecting'});
  assert.ok((await snap(page)).content.includes('Frames'));
  await click(page,'Frames');
  assert.ok((await snap(page)).content.includes('Waiting for stream frames'));
});

for (const shadow of [false,true]) {
  test(`More actions is a compact grouped menu that stays inside the panel and scrolls when short (${shadow?'closed shadow':'document'})`, async t=>{
    const page=await fixture(t,{shadow});
    await click(page,'More actions');
    let open=await snap(page);
    // Initial focus skips Replay (it sends immediately): a double Enter must never replay.
    assert.equal(open.focus,'Edit & Replay','focus moves to the first item that does not send on open');
    await page.keyboard.press('ArrowDown');
    assert.equal((await snap(page)).focus,'Prepare experiment');
    await page.keyboard.press('ArrowUp'); await page.keyboard.press('ArrowUp');
    assert.equal((await snap(page)).focus,'Replay','Replay is still one ArrowUp away');
    await page.keyboard.press('ArrowUp');
    assert.equal((await snap(page)).focus,'Open comparison','ArrowUp wraps');
    await page.keyboard.press('Home');
    assert.equal((await snap(page)).focus,'Replay');
    await page.keyboard.press('End');
    assert.equal((await snap(page)).focus,'Open comparison');
    await page.keyboard.press('Home');
    assert.equal(open.separators,3,'run | analyse | copy | compare dividers');
    const order=['Replay','Edit & Replay','Prepare experiment','Explain','Save investigation','Create disabled mock rule','Copy cURL','Copy fetch','Copy mock JSON','Save Snippet','Set as comparison left','Set as comparison right','Open comparison'];
    assert.deepEqual(open.actions.filter(a=>order.includes(a)),order,'S11 group order');
    assert.ok(open.fit.top>=open.fit.dTop&&open.fit.bottom<=open.fit.dBottom&&open.fit.left>=open.fit.dLeft&&open.fit.right<=open.fit.dRight,'menu inside the detail panel');
    assert.equal(open.fit.uppercase,'none');
    await page.keyboard.press('Escape');
    await page.setViewportSize({width:960,height:300});
    await click(page,'More actions');
    open=await snap(page);
    assert.ok(open.fit.top>=open.fit.dTop-1&&open.fit.bottom<=open.fit.dBottom+1,'short panel: still inside');
    assert.ok(open.fit.scrolls,'short panel: menu scrolls');
    await page.keyboard.press('Escape');
    assert.equal((await snap(page)).focus,'More actions','Escape returns focus to the trigger');
  });

  test(`More is inert, keyboard reachable, and Escape closes only disclosure (${shadow?'closed shadow':'document'})`, async t=>{
    const page=await fixture(t,{shadow});
    const before=await snap(page);
    await page.evaluate(()=>window.responseTest.focus('More actions'));
    await page.keyboard.press('Enter');
    await page.waitForTimeout(30);
    const open=await snap(page);
    assert.equal(open.expanded,'true');
    assert.deepEqual(open.calls,before.calls);
    assert.deepEqual(open.rules,before.rules);
    assert.equal(open.explain,false);
    assert.equal(open.draft,before.draft);
    for(const label of ['Replay','Edit & Replay','Explain','Create disabled mock rule','Copy cURL','Copy fetch','Copy mock JSON','Save Snippet']) assert.ok(open.actions.includes(label),label);
    assert.equal((await snap(page)).focus,'Edit & Replay','opening moves focus to the first item that does not send');
    await page.keyboard.press('Escape');
    const closed=await snap(page);
    assert.equal(closed.expanded,'false');
    assert.equal(closed.focus,'More actions');
    assert.equal(closed.drawer,true);
    assert.equal(closed.open,true);
    await click(page,'More actions'); await page.mouse.click(1,1);
    await page.waitForFunction(()=>window.responseTest.snapshot().expanded==='false');
    assert.equal((await snap(page)).expanded,'false');
    assert.equal((await snap(page)).drawer,true);
    await click(page,'More actions'); await click(page,'Explain');
    assert.equal((await snap(page)).explain,true);
    await page.keyboard.press('Escape');
    assert.equal((await snap(page)).explain,false);
    assert.equal((await snap(page)).drawer,true);
    await click(page,'More actions');
    await page.evaluate(()=>window.responseTest.set({explainEntry:{id:'external-modal'}}));
    await page.keyboard.press('Escape');
    assert.equal((await snap(page)).explain,false);
    assert.equal((await snap(page)).expanded,'true');
    assert.equal((await snap(page)).drawer,true);
    await page.keyboard.press('Escape');
    assert.equal((await snap(page)).expanded,'false');
  });
}

for (const shadow of [false,true]) test(`More actions returns focus to its trigger after an item and Tab leaves the group (${shadow?'closed shadow':'document'})`, async t=>{
  const page=await fixture(t,{shadow});
  const focused=()=>page.evaluate(()=>{const a=window.responseTest.root.activeElement;return a?.getAttribute('aria-label')||a?.textContent?.trim()||a?.tagName;});
  await click(page,'More actions'); await click(page,'Copy cURL');
  assert.equal((await snap(page)).expanded,'false');
  assert.equal(await focused(),'More actions','activating an item returns focus to the trigger, not <body>');
  await click(page,'More actions'); await click(page,'Explain');
  assert.equal((await snap(page)).explain,true);
  await page.keyboard.press('Escape');
  assert.equal(await focused(),'More actions','a modal opened from the menu restores focus to the trigger');
  await click(page,'More actions');
  await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Tab');
  assert.equal((await snap(page)).expanded,'false','Tab out of the menu closes it');
  assert.equal(await focused(),'Close selected request detail','Tab moves past the whole group');
  await click(page,'More actions');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Shift+Tab');
  assert.equal((await snap(page)).expanded,'false','Shift+Tab out of the menu closes it');
  assert.equal(await focused(),'More actions');
});

test('a disclosure left on a hidden panel does not swallow page Escape',async t=>{
  const page=await fixture(t);
  await click(page,'More actions');
  await page.evaluate(()=>window.responseTest.set({open:false,apiDetailOpen:false}));
  await page.keyboard.press('Escape');
  assert.equal((await snap(page)).pageEscapes,1);
});

test('copy receipts describe inspected content, denials and bounded previews; mocks report disabled acceptance', async t=>{
  const page=await fixture(t);
  await click(page,'Request'); await click(page,'Copy');
  assert.ok((await snap(page)).copied.at(-1).includes('first'));
  assert.ok((await snap(page)).toast.includes('Request'));
  await page.evaluate(()=>{window.responseTest.deny=true;});
  await click(page,'Copy'); assert.match((await snap(page)).toast,/Copy failed/);
  await click(page,'Headers');
  await page.getByRole('button',{name:'Copy cookie value'}).click();
  await page.waitForTimeout(30); assert.match((await snap(page)).toast,/Copy failed/);
  await click(page,'Initiator'); await page.getByRole('button',{name:'Copy stack frame'}).click();
  await page.waitForTimeout(30); assert.match((await snap(page)).toast,/Copy failed/);
  await page.evaluate(()=>{window.responseTest.deny=false;});
  await click(page,'Response');
  await entry(page,{id:'large',responseRaw:JSON.stringify({large:'x'.repeat(510000)}),size:510000});
  await click(page,'More actions'); await click(page,'Copy response preview');
  assert.match((await snap(page)).copied.at(-1),/truncated/);
  assert.match((await snap(page)).toast,/preview.*truncated/i);
  await click(page,'More actions'); await click(page,'Create disabled mock rule');
  assert.equal((await snap(page)).rules.length,1);
  assert.equal((await snap(page)).rules[0].enabled,false);
  assert.match((await snap(page)).toast,/disabled.*truncated/i);
  await page.evaluate(()=>window.responseTest.set({rules:Array.from({length:50},(_,i)=>({id:'capacity-'+i,enabled:false}))}));
  await click(page,'More actions'); await click(page,'Create disabled mock rule');
  assert.equal((await snap(page)).rules.length,50);
  assert.match((await snap(page)).toast,/limit|not created/i);
});

test('GraphQL diffs retain operation baseline and drift jump', async t=>{
  const page=await fixture(t);
  await entry(page,{id:'baseline',urlPath:'/graphql',timestamp:100,graphql:{operationName:'Widgets',operationType:'query'},responseRaw:'{"widgets":1}'});
  await entry(page,{id:'other-operation',urlPath:'/graphql',timestamp:150,graphql:{operationName:'Users',operationType:'query'},responseRaw:'{"users":1}'});
  await entry(page,{id:'current',urlPath:'/graphql',timestamp:200,graphql:{operationName:'Widgets',operationType:'query'},responseRaw:'{"widgets":2}',driftFromId:'baseline'});
  await click(page,'View diff');
  assert.ok((await snap(page)).content.includes('widgets'));
  assert.ok(!(await snap(page)).content.includes('users'));
  await click(page,'Jump to baseline'); assert.equal((await snap(page)).selected,'baseline');
  await entry(page,{id:'without-drift',urlPath:'/graphql',timestamp:250,graphql:{operationName:'Widgets',operationType:'query'},responseRaw:'{"widgets":3}',driftFromId:null});
  await click(page,'Diff');
  assert.ok((await snap(page)).content.includes('widgets'));
  assert.ok(!(await snap(page)).content.includes('users'));
});

test('explicit More actions invoke once and all secondary clipboard denials are caught', async t=>{
  const page=await fixture(t);
  for (const label of ['Copy cURL','Copy fetch','Copy mock JSON']) {
    await page.evaluate(()=>{window.responseTest.deny=true;});
    await click(page,'More actions'); await click(page,label);
    assert.match((await snap(page)).toast,/Copy failed/);
    assert.equal((await snap(page)).copied.length,0);
    await page.evaluate(()=>{window.responseTest.deny=false;});
    await click(page,'More actions'); await click(page,label);
    assert.equal((await snap(page)).copied.length,1);
    await page.evaluate(()=>{window.responseTest.copied=[];});
  }
  await click(page,'More actions'); await click(page,'Replay');
  assert.equal((await snap(page)).calls.replay,1);
  assert.equal((await snap(page)).expanded,'false');
  await click(page,'Console');
  assert.equal((await snap(page)).activeTab,'console');
  assert.equal((await snap(page)).draft,'res');
  assert.equal((await snap(page)).selected,'one');
});

test('recommendations use configured slow threshold and do not resurrect an old conditional facet', async t=>{
  const page=await fixture(t);
  await page.evaluate(()=>window.responseTest.settings({slowThresholdMs:1000}));
  assert.equal(await page.locator('[aria-label="Recommended actions"] button').count(),0);
  await page.evaluate(()=>window.responseTest.settings({slowThresholdMs:900}));
  assert.ok((await page.locator('[aria-label="Recommended actions"] button').allTextContents()).includes('Similar Calls'));
  await page.evaluate(()=>window.responseTest.set({detailTab:'response',detailView:'raw'}));
  await click(page,'Initiator');
  await page.evaluate(()=>window.responseTest.set({detailTab:'request',detailView:'schema'}));
  assert.equal((await snap(page)).facet,'Request');
  await page.evaluate(()=>window.responseTest.set({detailTab:'response',detailView:'raw'}));
  assert.equal((await snap(page)).facet,'Response');
});

test('compact Log detail keeps only its original content surface', async t=>{
  const page=await fixture(t,{compact:true});
  assert.equal(await page.locator('[aria-label="Request facets"], [aria-label="Request actions"], .xray-detail-hero').count(),0);
  assert.ok((await snap(page)).content.includes('amount'));
});

for (const width of [960,1600]) {
  test(`closed detail disclosures give response at least half the standalone detail at ${width}×700`, async t=>{
    const page=await fixture(t,{width});
    const measurement=await page.locator('.xray-request-detail').evaluate(detail=>{
      const body=detail.querySelector('.xray-detail-content');
      return {detail:detail.getBoundingClientRect().height,body:body.getBoundingClientRect().height};
    });
    const ratio=measurement.body/measurement.detail;
    t.diagnostic(`standalone ${width}×700 response/detail=${ratio.toFixed(3)} (${measurement.body}/${measurement.detail}px)`);
    assert.ok(ratio>=0.5);
  });
}

for (const shadow of [false,true]) test(`a double Enter on More actions never replays (${shadow?'closed shadow':'document'})`, async t=>{
  const page=await fixture(t,{shadow});
  const before=await snap(page);
  await page.evaluate(()=>window.responseTest.focus('More actions'));
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(30);
  const after=await snap(page);
  assert.deepEqual(after.calls,before.calls,'nothing was sent or replayed');
});
