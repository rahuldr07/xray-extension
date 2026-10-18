import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { before, after } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';

// Real search model, store, modal and stylesheet. Synthetic retained traffic only.
// Closed-shadow controls are focused through the fixture, then operated by keyboard.
const { outputFiles } = await build({
  stdin: {
    resolveDir: fileURLToPath(new URL('../../', import.meta.url)), loader: 'jsx',
    contents: `
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      import { flushSync } from 'react-dom';
       import { GlobalSearch } from './src/panel/components/search/GlobalSearch';
       import { EntriesWorkspace } from './src/panel/components/api/EntriesWorkspace';
      import { installPanelKeyboard } from './src/panel/runtime/panelKeyboard';
      import { usePanelStore } from './src/panel/store';
      import styles from './src/panel/styles.css';
      const api=(id,extra={})=>({id,type:'api',method:'GET',status:200,url:'https://example.test/'+id,
        urlPath:'/'+id,source:'fetch',timestamp:1,duration:12,size:80,responseRaw:'{}',...extra});
      const entries=[
        api('url',{url:'https://example.test/NeedleURL'}),
        api('request-header',{requestHeaders:{'x-test':'NeedleHeader'}}),
        api('response-header',{responseHeaders:{'x-test':'NeedleHeader'}}),
        api('request',{requestBody:{value:'NeedleRequest'}}),
        api('response',{responseRaw:'{"value":"NeedleResponse"}'}),
        {id:'log',type:'log',logLevel:'info',message:'NeedleMessage',timestamp:2},
        api('multi',{url:'https://example.test/NeedleMulti',requestHeaders:{'x-test':'NeedleMulti'},
          requestBody:'NeedleMulti',responseRaw:'NeedleMulti'}),
      ];
      window.searchFieldsTest={
        setup(shadow){
          const host=document.body.appendChild(document.createElement('div'));
          this.root=shadow?host.attachShadow({mode:'closed'}):document;
          const sheet=document.createElement('style');sheet.textContent=styles;
          (shadow?this.root:document.head).appendChild(sheet);
          window.XRAY_Store={get:async()=>null,set:async()=>{}};
          usePanelStore.setState({entries,open:true,activeTab:'logs',globalSearchOpen:true,
            selectedId:null,apiDetailOpen:false,detailView:'schema',detailTab:'response'});
          installPanelKeyboard({dismissible:true,getRoot:()=>this.root});
          flushSync(()=>createRoot(shadow?this.root.appendChild(document.createElement('div')):host).render(
             <div className="xray-theme-scope xray-theme-operator"><div className="xray-panel xray-mode-window xray-open" style={{width:'1000px',height:'760px'}}>
               <EntriesWorkspace mode="api" /><GlobalSearch />
            </div></div>
          ));
        },
        focus(selector){const el=this.root.querySelector(selector);if(!el)throw new Error('Missing '+selector);el.focus();},
        scope(value){const el=this.root.querySelector('[aria-label="Search field"]');
          if(!el)throw new Error('Missing accessible search field selector');
          el.value=value;el.dispatchEvent(new Event('change',{bubbles:true}));},
        retain(ids){flushSync(()=>usePanelStore.setState({entries:entries.filter(e=>ids.includes(e.id))}));},
        reset(){flushSync(()=>usePanelStore.setState({entries}));},
         bounded(){flushSync(()=>usePanelStore.setState({entries:[
          api('within',{responseRaw:'x'.repeat(19000)+'Needle'}),
          api('beyond',{responseRaw:'x'.repeat(20000)+'Needle'}),
          api('missing',{responseRaw:null}),
         ]}));},
         scopeCases(){flushSync(()=>usePanelStore.setState({entries:[
           api('method',{method:'POST'}),
           api('status',{status:404}),
           {id:'message-scope',type:'log',logLevel:'info',message:'NeedleMessageScope',timestamp:2},
         ]}));},
         many(){flushSync(()=>usePanelStore.setState({entries:Array.from({length:205},(_,i)=>api('many'+i,{responseRaw:'Needle'}))}));},
         groupedSelection(){flushSync(()=>usePanelStore.setState({entries:[
           api('newer',{url:'https://example.test/grouped',urlPath:'/grouped',timestamp:3,responseRaw:'newer'}),
           api('older',{url:'https://example.test/grouped',urlPath:'/grouped',timestamp:1,responseRaw:'OlderNeedle'}),
         ],activeTab:'api',apiGroupingMode:'endpoint',expandedGroups:new Set(),selectedId:null,apiDetailOpen:false,globalSearchOpen:true}));},
         selectedLog(){flushSync(()=>usePanelStore.setState({entries:[
           api('api-selected-log',{url:'https://example.test/api-selected-log'}),
           {id:'selected-log',type:'log',logLevel:'info',message:'selected log',timestamp:2},
         ],activeTab:'api',selectedId:'selected-log',apiDetailOpen:false,globalSearchOpen:false}));},
        reopen(){flushSync(()=>usePanelStore.getState().setGlobalSearchOpen(true));},
        snapshot(){const s=usePanelStore.getState(),root=this.root,dialog=root.querySelector('.xray-gsearch-modal');
          const rows=[...root.querySelectorAll('.xray-gsearch-row')];
          return {open:s.globalSearchOpen,selected:s.selectedId,tab:s.activeTab,detail:s.apiDetailOpen,view:s.detailView,
             text:dialog?.textContent||'',query:root.querySelector('.xray-gsearch-input input')?.value,
            scope:root.querySelector('select')?.value,
            options:[...root.querySelectorAll('select option')].map(el=>[el.value,el.textContent]),
            rows:rows.map(el=>({path:el.querySelector('.xray-gsearch-path')?.firstChild?.textContent,
              field:el.querySelector('.xray-gsearch-field')?.textContent,hit:el.querySelector('mark')?.textContent})),
            active:rows.findIndex(el=>el.classList.contains('active')),
            regex:root.querySelector('[title="Match with a regular expression"]')?.getAttribute('aria-pressed'),
            caseSensitive:root.querySelector('[title="Case-sensitive matching"]')?.getAttribute('aria-pressed'),
             error:root.querySelector('[role="alert"]')?.textContent,
             live:[...root.querySelectorAll('[aria-live]')].map(el=>el.textContent),
             queryLabel:root.querySelector('input')?.getAttribute('aria-label')};},
         groupedSnapshot(){const s=usePanelStore.getState(),root=this.root;return {selected:s.selectedId,expanded:[...s.expandedGroups],child:root.querySelector('.xray-api-row.child')?.getAttribute('aria-selected'),childText:root.querySelector('.xray-api-row.child')?.textContent||'',detail:s.apiDetailOpen};},
         apiListSnapshot(){const list=this.root.querySelector('.xray-api-table-scroll');return {active:list?.getAttribute('aria-activedescendant')||null};},
        layout(){const dialog=this.root.querySelector('.xray-gsearch-modal'),r=dialog.getBoundingClientRect();
          return {left:r.left,right:r.right,width:innerWidth,overflow:dialog.scrollWidth>dialog.clientWidth+1,
            controls:[...dialog.querySelectorAll('input,select,button')].map(el=>{
              const b=el.getBoundingClientRect();return {name:el.getAttribute('aria-label')||el.textContent,
                reachable:b.width>0&&b.left>=r.left-1&&b.right<=r.right+1};})};},
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

async function fixture(t, shadow, width) {
  const page = await browser.newPage({ viewport: { width, height: 800 } });
  t.after(() => page.close());
  page.on('pageerror', error => assert.fail(error.message));
  await page.setContent('<style>body{margin:0}</style>');
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(shadow => window.searchFieldsTest.setup(shadow), shadow);
  return page;
}
const snap = page => page.evaluate(() => window.searchFieldsTest.snapshot());
async function focus(page, selector) {
  await page.evaluate(selector => window.searchFieldsTest.focus(selector), selector);
}
async function query(page, text) {
  await focus(page, '.xray-gsearch-input input');
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.insertText(text);
}
async function scope(page, value, shadow) {
  if (shadow) await page.evaluate(value => window.searchFieldsTest.scope(value), value);
  else await page.getByRole('combobox', { name: 'Search field', exact: true }).selectOption(value);
}
async function toggle(page, title) {
  await focus(page, '[title="' + title + '"]');
  await page.keyboard.press('Space');
}
async function key(page, value) {
  await focus(page, '.xray-gsearch-input input');
  await page.keyboard.press(value);
}
async function count(page, expected) {
  await page.waitForFunction(expected => window.searchFieldsTest.snapshot().rows.length === expected, expected);
}

for (const shadow of [false, true]) for (const width of [360, 1600]) {
  const surface = `${shadow ? 'closed shadow' : 'document'}, ${width}px`;

  test(`field scoping keeps regex/case, highlights and opening a matched entry (${surface})`, async t => {
    const page = await fixture(t, shadow, width);
    let state = await snap(page);
    assert.equal(state.scope, 'all', 'all captured fields remain the default');
    assert.ok(state.queryLabel, 'query has an accessible name');
     assert.deepEqual(state.options, [['all', 'All fields'], ['method', 'Method'], ['url', 'URL'], ['status', 'Status'], ['headers', 'Headers'],
       ['requestBody', 'Request body'], ['responseBody', 'Response body'], ['message', 'Message']]);
    await query(page, 'needle');
    await count(page, 7);
    for (const [value, fields] of [['url', ['URL', 'URL']],
      ['headers', ['Request headers', 'Response headers', 'Request headers']],
      ['requestBody', ['Request body', 'Request body']], ['responseBody', ['Response body', 'Response body']]]) {
      await scope(page, value, shadow);
      await count(page, fields.length);
      state = await snap(page);
      assert.deepEqual(state.rows.map(row => row.field), fields);
      assert.ok(state.rows.every(row => row.hit === 'Needle'));
      assert.equal(state.active, 0, 'changing fields starts at the first match');
      assert.equal(state.query, 'needle');
    }
    await toggle(page, 'Match with a regular expression');
    await toggle(page, 'Case-sensitive matching');
    await query(page, 'Needle(Response|Multi)');
    await count(page, 2);
    assert.deepEqual((await snap(page)).rows.map(row => row.hit), ['NeedleMulti', 'NeedleResponse']);
    await scope(page, 'url', shadow);
    await count(page, 1);
    state = await snap(page);
    assert.equal(state.regex, 'true'); assert.equal(state.caseSensitive, 'true');
    await scope(page, 'responseBody', shadow);
    await key(page, 'ArrowDown');
    assert.equal((await snap(page)).active, 1);
    await query(page, 'needle(response|multi)');
    await count(page, 0);
    await toggle(page, 'Case-sensitive matching');
    await count(page, 2);
    await query(page, '[');
    await count(page, 0);
    assert.match((await snap(page)).error, /invalid regular expression/i);
    await key(page, 'End'); await key(page, 'ArrowUp'); await key(page, 'Enter');
    state = await snap(page);
    assert.equal(state.open, true); assert.equal(state.selected, null);
     await query(page, 'NeedleResponse');
     await count(page, 1);
     assert.ok((await snap(page)).live.some(text => /active result 1 of 1/i.test(text)));
     await key(page, 'Enter');
    state = await snap(page);
    assert.equal(state.open, false); assert.equal(state.selected, 'response');
     assert.equal(state.tab, 'api'); assert.equal(state.detail, true); assert.equal(state.view, 'schema');
    await page.evaluate(() => window.searchFieldsTest.reopen());
    await query(page, 'NeedleMessage');
    await scope(page, 'all', shadow);
    await count(page, 1);
    await focus(page, '.xray-gsearch-row');
    await page.keyboard.press('Enter');
    state = await snap(page);
    assert.equal(state.open, false); assert.equal(state.selected, 'log'); assert.equal(state.tab, 'logs');
  });

  test(`method, status, and message scopes expose concise result announcements (${surface})`, async t => {
    const page = await fixture(t, shadow, width);
    await page.evaluate(() => window.searchFieldsTest.scopeCases());
    for (const [scopeValue, queryValue, expectedId] of [['method', 'post', 'method'], ['status', '404', 'status'], ['message', 'NeedleMessageScope', 'message-scope']]) {
      await scope(page, scopeValue, shadow);
      await query(page, queryValue);
      await count(page, 1);
      const state = await snap(page);
      assert.equal(state.rows[0].field, scopeValue === 'method' ? 'Method' : scopeValue === 'status' ? 'Status' : 'Message');
      assert.ok(state.live.some(text => /1 match/i.test(text)));
      assert.ok(state.live.some(text => /active result 1 of 1/i.test(text)));
      await key(page, 'Enter');
      assert.equal((await snap(page)).selected, expectedId);
      await page.evaluate(() => window.searchFieldsTest.reopen());
    }
  });

  test(`selecting an older child expands its endpoint group and keeps detail selection (${surface})`, async t => {
    const page = await fixture(t, shadow, width);
    await page.evaluate(() => window.searchFieldsTest.groupedSelection());
    await query(page, 'OlderNeedle');
    await count(page, 1);
    await key(page, 'Enter');
    if (width < 600) {
      // S20: below 600px the detail replaces the list, so the child row is only
      // rendered once "Requests" returns to the list — it must then be revealed.
      await page.waitForFunction(() => window.searchFieldsTest.groupedSnapshot().detail === true);
      await page.evaluate(() => window.searchFieldsTest.root.querySelector('[aria-label="Back to requests"]').click());
      await page.waitForFunction(() => window.searchFieldsTest.groupedSnapshot().child === 'true');
      const back = await page.evaluate(() => window.searchFieldsTest.groupedSnapshot());
      assert.equal(back.selected, 'older');
      assert.equal(back.expanded.length, 1);
      return;
    }
    await page.waitForFunction(() => window.searchFieldsTest.groupedSnapshot().child === 'true');
    const state = await page.evaluate(() => window.searchFieldsTest.groupedSnapshot());
    assert.equal(state.selected, 'older');
    assert.equal(state.child, 'true');
    assert.equal(state.detail, true);
    assert.equal(state.expanded.length, 1);
  });

  test(`API list omits an active descendant when a log is selected (${surface})`, async t => {
    const page = await fixture(t, shadow, width);
    await page.evaluate(() => window.searchFieldsTest.selectedLog());
    assert.equal((await page.evaluate(() => window.searchFieldsTest.apiListSnapshot())).active, null);
  });

  test(`empty navigation recovers and live results clamp the active index (${surface})`, async t => {
    const page = await fixture(t, shadow, width);
    await query(page, 'Needle');
    await count(page, 7);
    await key(page, 'End');
    assert.equal((await snap(page)).active, 6);
    await page.evaluate(() => window.searchFieldsTest.retain(['response', 'multi']));
    await count(page, 2);
    assert.equal((await snap(page)).active, 1, 'eviction clamps to the last retained match');
    await key(page, 'ArrowDown');
    assert.equal((await snap(page)).active, 0);
    await key(page, 'ArrowUp');
    assert.equal((await snap(page)).active, 1);
    await key(page, 'Home');
    assert.equal((await snap(page)).active, 0);
    await page.evaluate(() => window.searchFieldsTest.retain([]));
    await count(page, 0);
    for (const value of ['End', 'ArrowUp', 'ArrowDown', 'Home', 'Enter']) await key(page, value);
    assert.equal((await snap(page)).open, true); assert.equal((await snap(page)).selected, null);
    await key(page, 'End');
    await page.evaluate(() => window.searchFieldsTest.retain(['url']));
    await count(page, 1);
    assert.equal((await snap(page)).active, 0, 'arrival after zero matches has a valid active result');
    await page.evaluate(() => window.searchFieldsTest.reset());
    await count(page, 7);
    await key(page, 'End');
    await scope(page, 'headers', shadow);
    await count(page, 3);
    assert.equal((await snap(page)).active, 0);
    await query(page, 'NeedleURL');
    await count(page, 0);
    assert.match((await snap(page)).text, /no matches/i);
    await key(page, 'Enter');
    assert.equal((await snap(page)).selected, null);
    await scope(page, 'url', shadow);
    await count(page, 1);
    await key(page, 'Enter');
    assert.equal((await snap(page)).selected, 'url');
  });

  test(`bounded evidence and controls remain visible and reachable (${surface})`, async t => {
    const page = await fixture(t, shadow, width);
    const state = await snap(page);
    assert.match(state.text, /retained.*captured/i);
    assert.match(state.text, /20,000 characters per field/i);
    assert.match(state.text, /200 matching entries/i);
    assert.match(state.text, /missing.*redacted.*truncated.*uncaptured/i);
    const layout = await page.evaluate(() => window.searchFieldsTest.layout());
    assert.ok(layout.left >= 0 && layout.right <= width, JSON.stringify(layout));
    assert.equal(layout.overflow, false, JSON.stringify(layout));
    assert.ok(layout.controls.every(control => control.reachable), JSON.stringify(layout));
    await focus(page, '[aria-label="Search field"]');
     await page.keyboard.press('Home');
     await page.keyboard.press('ArrowDown');
     await page.keyboard.press('ArrowDown');
     await page.keyboard.press('Tab');
    assert.equal((await snap(page)).scope, 'url', 'selector supports native keyboard selection');
    await scope(page, 'responseBody', shadow);
    await page.evaluate(() => window.searchFieldsTest.bounded());
    await query(page, 'Needle');
    await count(page, 1);
    assert.equal((await snap(page)).rows[0].path, '/within');
    await page.evaluate(() => window.searchFieldsTest.many());
    await count(page, 200);
    assert.match((await snap(page)).text, /200\+ matches/);
    await page.evaluate(() => window.searchFieldsTest.retain([]));
    await count(page, 0);
    await page.keyboard.press('Escape');
    assert.equal((await snap(page)).open, false);
  });
}
