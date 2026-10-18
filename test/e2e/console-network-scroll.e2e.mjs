import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { before, after } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { PANEL_CSS } from '../helpers/panel-css.mjs';
import { setStandardsContent } from '../helpers/standards-page.mjs';

const { outputFiles } = await build({
  stdin: {
    resolveDir: fileURLToPath(new URL('../../', import.meta.url)), loader: 'jsx',
    contents: `
      import React from 'react';
      import {createRoot} from 'react-dom/client';
      import {flushSync} from 'react-dom';
      import {App} from './src/panel/App';
      import {usePanelStore} from './src/panel/store';
      const styles = ${JSON.stringify(PANEL_CSS)};
      const api=(id,body)=>({id,type:'api',method:'GET',status:200,url:'https://example.test/'+id,urlPath:'/item/'+id,timestamp:1700000000000,duration:20,size:body.length,responseHeaders:{'content-type':'application/json'},responseRaw:body});
      const event=(id,message,type='log')=>({id,type,level:'info',timestamp:1700000000000,message,args:[message]});
      window.consoleScroll={root:null,setup(shadow){
        const host=document.body.appendChild(document.createElement('div')); this.root=shadow?host.attachShadow({mode:'closed'}):document;
        const sheet=document.createElement('style');sheet.textContent=styles;(shadow?this.root:document.head).appendChild(sheet);
        const mount=shadow?this.root.appendChild(document.createElement('div')):host;mount.className='xray-app-root';
        window.XRAY_Store={get:async()=>null,set:async()=>{}};window.XRAY_Console={setContext(){},execute:async()=>({type:'empty'})};
        const entries=Array.from({length:80},(_,i)=>api('request-'+i,JSON.stringify({row:i,lines:Array.from({length:8},(_,n)=>'line-'+n)})));
        const logs=Array.from({length:80},(_,i)=>event('log-'+i,'log-'+i));
        usePanelStore.setState({open:true,activeTab:'console',consoleMiniTab:'network',entries,consoleEvents:logs,selectedId:null,expandedId:null,pinnedIds:new Set(['request-0']),recording:true,settings:{...usePanelStore.getState().settings,maxEntries:50}});
        flushSync(()=>createRoot(mount).render(<App mode="window"/>));
      },
      stream(){return this.root.querySelector('.xray-console-stream')},
      prompt(){return this.root.querySelector('[aria-label="Console command"]')},
      state(){const s=this.stream(),p=this.prompt();return {top:s?.scrollTop,focus:this.root.activeElement===p,draft:p?.value,logs:s?.textContent||'',selected:usePanelStore.getState().selectedId,pins:[...usePanelStore.getState().pinnedIds]};},
      traffic(){const store=usePanelStore.getState();for(let i=0;i<12;i++)store.addEntry(api('live-'+i,'{"live":true}'));},
       patch(){usePanelStore.getState().updateEntry({id:'request-0',status:503,responseRaw:'{"patched":true}'})},
       switchToApi(){flushSync(()=>usePanelStore.getState().setActiveTab('api'))},
       };
    `,
  }, bundle:true, format:'iife', write:false, loader:{'.css':'text'},
});

let browser;
before(async()=>{const executablePath=process.env.XRAY_BROWSER_EXECUTABLE||(!existsSync(chromium.executablePath())&&existsSync('/usr/bin/google-chrome')?'/usr/bin/google-chrome':undefined);browser=await chromium.launch({executablePath,headless:true});});
after(async()=>{await browser?.close()});

async function fixture(t, shadow) {
  const page=await browser.newPage({viewport:{width:960,height:700}});t.after(()=>page.close());
  await setStandardsContent(page, '<style>body{margin:0}</style>');await page.addScriptTag({content:outputFiles[0].text});await page.evaluate(shadow=>window.consoleScroll.setup(shadow),shadow);await page.waitForTimeout(160);return page;
}

for(const shadow of [false,true]) {
  test(`live request arrival and eviction do not steal Console scroll or command focus (${shadow?'closed shadow':'document'})`,async t=>{
    const page=await fixture(t,shadow);
     await page.evaluate(()=>{const stream=window.consoleScroll.stream(),prompt=window.consoleScroll.prompt();stream.scrollTop=stream.scrollHeight;prompt.focus();});
    await page.keyboard.type('res.data');
    const before=await page.evaluate(()=>window.consoleScroll.state());assert.equal(before.focus,true);assert.equal(before.draft,'res.data');
    await page.evaluate(()=>window.consoleScroll.traffic());await page.waitForTimeout(120);
    const afterTraffic=await page.evaluate(()=>window.consoleScroll.state());
     assert.equal(afterTraffic.focus,true);assert.equal(afterTraffic.draft,'res.data');assert.ok(afterTraffic.top>0,'Console remains scrolled after live traffic');
    await page.evaluate(()=>window.consoleScroll.patch());await page.waitForTimeout(90);
    const afterPatch=await page.evaluate(()=>window.consoleScroll.state());
     assert.equal(afterPatch.focus,true);assert.ok(afterPatch.top>0,'Console remains scrolled after a request patch');assert.deepEqual(afterPatch.pins,['request-0']);
  });

  test(`authoritative API response body scrolls independently (${shadow?'closed shadow':'document'})`,async t=>{
    const page=await fixture(t,shadow);
     await page.evaluate(()=>window.consoleScroll.switchToApi());
    await page.waitForFunction(()=>window.consoleScroll.root.querySelector('.xray-api-table-scroll'));
    await page.evaluate(()=>window.consoleScroll.root.querySelector('[data-index="0"] .xray-api-row').click());
    await page.waitForFunction(()=>window.consoleScroll.root.querySelector('.xray-detail-content'));
    const before=await page.evaluate(()=>{const el=window.consoleScroll.root.querySelector('.xray-detail-content');return {top:el.scrollTop,height:el.clientHeight,scrollHeight:el.scrollHeight};});
    if(before.scrollHeight>before.height){await page.evaluate(()=>{const el=window.consoleScroll.root.querySelector('.xray-detail-content');el.scrollTop=el.scrollHeight});const afterBody=await page.evaluate(()=>window.consoleScroll.root.querySelector('.xray-detail-content').scrollTop);assert.ok(afterBody>0,'API response body must own its vertical scroll');}
    assert.equal(await page.evaluate(()=>window.consoleScroll.root.querySelectorAll('.xray-network').length),0);
  });
}
