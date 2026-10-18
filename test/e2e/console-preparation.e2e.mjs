import assert from 'node:assert/strict';
import test, { before, after } from 'node:test';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { PANEL_CSS } from '../helpers/panel-css.mjs';
import { setStandardsContent } from '../helpers/standards-page.mjs';

const { outputFiles } = await build({
  stdin: { resolveDir: fileURLToPath(new URL('../../', import.meta.url)), loader: 'jsx', contents: `
    import React from 'react';
    import {createRoot} from 'react-dom/client';
    import {flushSync} from 'react-dom';
    import {ConsoleWorkspace} from './src/panel/components/console/ConsoleWorkspace';
    import {RequestDetail} from './src/panel/components/detail/RequestDetail';
    import {CommandPalette} from './src/panel/components/shell/CommandPalette';
    import {ExportModal} from './src/panel/components/export/ExportModal';
    import {ModalShell} from './src/panel/components/common/ModalShell';
    import {usePanelStore} from './src/panel/store';
    const styles = ${JSON.stringify(PANEL_CSS)};
    const entry={id:'fixture',type:'api',method:'GET',status:200,url:'https://example.test/widgets',urlPath:'/widgets',duration:900,responseRaw:'{"ok":true}'};
    function App(){
      const tab=usePanelStore(s=>s.activeTab);
      const settings=usePanelStore(s=>s.settingsOpen);
      return <div className="xray-theme-scope xray-theme-xray-dark"><div className="xray-panel xray-mode-window xray-open">
        {tab==='console'?<ConsoleWorkspace/>:<RequestDetail entry={entry}/>}
        <CommandPalette/><ExportModal/>
        {settings&&<ModalShell title="Blocking settings" onClose={()=>usePanelStore.getState().setSettingsOpen(false)}><button>Blocker</button></ModalShell>}
        <button id="outside">Outside</button>
      </div></div>;
    }
    window.integration={calls:0,deny:true,clipboardText:'',root:null,
      setup(shadow){
        const host=document.body.appendChild(document.createElement('div'));
        const root=shadow?host.attachShadow({mode:'closed'}):document;
        this.root=root;
        const sheet=document.createElement('style');sheet.textContent=styles;(shadow?root:document.head).appendChild(sheet);
        window.XRAY_Store={get:async()=>null,set:async()=>{}};
        window.XRAY_Console={setContext(){},execute:async()=>{this.calls++;return {type:'result',result:1}}};
      Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{if(this.deny)throw new Error('Synthetic denial');this.clipboardText=text}}});
         usePanelStore.setState({entries:[entry],selectedId:'fixture',open:true,activeTab:'console',consoleMiniTab:'console',settings:{...usePanelStore.getState().settings,slowThresholdMs:900}});
        flushSync(()=>createRoot(shadow?root.appendChild(document.createElement('div')):host).render(<App/>));
      },
       set(patch){flushSync(()=>usePanelStore.setState(patch))},
       setEntries(entries){flushSync(()=>usePanelStore.setState({entries,selectedId:null,exportOpen:true}))},
      prepare(code){flushSync(()=>usePanelStore.getState().insertConsoleCommand(code))},
      click(name){const el=[...this.root.querySelectorAll('button')].find(el=>el.textContent.trim()===name);if(!el)throw new Error('Missing '+name);el.click()},
      focusOutside(){this.root.querySelector('#outside').focus()},
       state(){const s=usePanelStore.getState();return {tab:s.activeTab,mini:s.consoleMiniTab,selected:s.selectedId,pinned:[...s.pinnedIds],draft:s.consoleDraft,calls:this.calls,toast:s.toastMessage,clipboard:this.clipboardText,focused:this.root.activeElement?.getAttribute('aria-label'),focusId:this.root.activeElement?.id}},
      text(){return this.root.querySelector('[aria-label="Console command"]')?.value},
    };
  ` }, bundle: true, format: 'iife', write: false, loader: { '.css': 'text' },
});
let browser;
before(async()=>{browser=await chromium.launch({headless:true});});
after(async()=>{await browser?.close();});
async function fixture(t, shadow=false){
  const page=await browser.newPage({viewport:{width:960,height:700}});t.after(()=>page.close());
  await setStandardsContent(page, '<style>body{margin:0}</style>');
  await page.addScriptTag({content:outputFiles[0].text});
  await page.evaluate(shadow=>window.integration.setup(shadow),shadow);return page;
}
async function waitFocus(page){await page.waitForFunction(()=>window.integration.state().focused==='Console command',null,{timeout:2000});}

for(const shadow of [false,true])test(`preparation reveals and focuses without execution (${shadow?'closed shadow':'document'})`,async t=>{
  const page=await fixture(t,shadow);
  await page.evaluate(()=>window.integration.prepare('schema(res)'));
  await waitFocus(page);
  let state=await page.evaluate(()=>window.integration.state());
  assert.equal(state.mini,'console');assert.equal(state.draft,'schema(res)');assert.equal(state.selected,'fixture');assert.equal(state.calls,0);
  await page.evaluate(()=>{window.integration.focusOutside();window.integration.set({entries:[...window.integration.root.querySelectorAll('never')]})});
  assert.equal((await page.evaluate(()=>window.integration.state())).focusId,'outside');
  await page.evaluate(()=>window.integration.prepare('schema(res)'));await waitFocus(page);
  assert.equal((await page.evaluate(()=>window.integration.state())).calls,0);
});

test('preparation waits for a blocking modal to close',async t=>{
  const page=await fixture(t);
  await page.evaluate(()=>{window.integration.set({settingsOpen:true});window.integration.prepare('res')});
  assert.notEqual((await page.evaluate(()=>window.integration.state())).focused,'Console command');
  await page.evaluate(()=>window.integration.set({settingsOpen:false}));await waitFocus(page);
});

test('palette, detail and export prepare a visible editor without evaluation',async t=>{
  const page=await fixture(t);
  await page.evaluate(()=>window.integration.set({commandOpen:true}));
  await page.getByPlaceholder('Type a command, tab, or search captured requests…').fill('Prepare $slow(900)');
  await page.getByPlaceholder('Type a command, tab, or search captured requests…').press('Enter');
  await waitFocus(page);assert.equal(await page.evaluate(()=>window.integration.text()),'$slow(900)');
  await page.evaluate(()=>window.integration.set({activeTab:'api'}));await page.getByRole('button',{name:'Console',exact:true}).click();await waitFocus(page);
  assert.equal(await page.evaluate(()=>window.integration.text()),'res');
  await page.evaluate(()=>window.integration.set({exportOpen:true}));
  await page.getByRole('dialog').getByRole('button',{name:'Console',exact:true}).click();await waitFocus(page);
  assert.match(await page.evaluate(()=>window.integration.text()),/^curl/);
  assert.equal((await page.evaluate(()=>window.integration.state())).calls,0);
});

test('export copy denial is truthful and successful download reports initiation',async t=>{
  const page=await fixture(t);const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.evaluate(()=>window.integration.set({exportOpen:true}));
  await page.getByRole('dialog').getByRole('button',{name:'Copy',exact:true}).click();
  await page.waitForFunction(()=>window.integration.state().toast?.startsWith('Could not copy'));
  assert.deepEqual(errors,[]);
  await page.evaluate(()=>{window.integration.deny=false});
  await page.getByRole('dialog').getByRole('button',{name:'Copy',exact:true}).click();
  await page.waitForFunction(()=>window.integration.state().toast?.includes('copied.'));
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download',exact:true}).click();await download;
  assert.equal((await page.evaluate(()=>window.integration.state())).toast,'Download started.');
});

test('share-safe session preview, clipboard, and download stay identical with truthful HTTP HAR omissions',async t=>{
  const page=await fixture(t); await page.evaluate(()=>window.integration.setEntries([
    {id:'http',type:'api',method:'GET',status:200,url:'https://example.test/widgets?q=private',urlPath:'/widgets',responseRaw:'{"ok":true}'},
    {id:'ws',type:'api',source:'ws',method:'WS',url:'wss://example.test/socket',wsFrames:[{dir:'in',ts:1,size:4,preview:'private-stream'}]},
    {id:'sse',type:'api',source:'sse',method:'SSE',url:'https://example.test/events',wsFrames:[{dir:'in',ts:2,size:4,preview:'private-event'}]},
  ]));
  const dialog=page.getByRole('dialog');
  await dialog.getByRole('button',{name:'Session',exact:true}).click();
  await page.getByRole('button',{name:/^Share-safe session JSON/}).click();
  const jsonPreview=await dialog.locator('pre.xray-export-code').textContent();
  const jsonReceipt=await dialog.textContent();
  assert.equal((await page.evaluate(()=>window.integration.state())).selected,null);
  assert.doesNotMatch(jsonReceipt,/entries omitted from HTTP HAR/);
  await page.evaluate(()=>{window.integration.deny=false});
  await dialog.getByRole('button',{name:'Copy',exact:true}).click();
  await page.waitForFunction(expected=>window.integration.state().clipboard===expected,jsonPreview);
  assert.equal((await page.evaluate(()=>window.integration.state())).clipboard,jsonPreview);
  const jsonDownloadPromise=page.waitForEvent('download');
  await dialog.getByRole('button',{name:'Download',exact:true}).click();
  const jsonDownload=await jsonDownloadPromise; const jsonPath=await jsonDownload.path();
  assert.equal(readFileSync(jsonPath,'utf8'),jsonPreview);

  await page.getByRole('button',{name:/^Share-safe HTTP HAR/}).click();
  const harPreview=await dialog.locator('pre.xray-export-code').textContent();
  const harReceipt=await dialog.textContent();
  assert.match(harReceipt,/2 entries omitted from HTTP HAR/);
  await dialog.getByRole('button',{name:'Copy',exact:true}).click();
  await page.waitForFunction(expected=>window.integration.state().clipboard===expected,harPreview);
  assert.equal((await page.evaluate(()=>window.integration.state())).clipboard,harPreview);
  const harDownloadPromise=page.waitForEvent('download');
  await dialog.getByRole('button',{name:'Download',exact:true}).click();
  const harDownload=await harDownloadPromise; const harPath=await harDownload.path();
  assert.equal(readFileSync(harPath,'utf8'),harPreview);
});

test('session import receipt counts accepted entries and duplicates',async t=>{
  const page=await fixture(t);
  await page.evaluate(()=>window.integration.set({exportOpen:true}));
  const existing={id:'fixture',type:'api',method:'GET',url:'https://example.test/widgets',responseRaw:'{}'};
  const added={...existing,id:'new'};
  // Import lives in the Session group, which only renders in Session mode (L4).
  await page.getByRole('button',{name:'Session',exact:true}).click();
  await page.locator('input[type=file]').setInputFiles({name:'session.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({entries:[existing,added,added]}))});
  await page.waitForFunction(()=>window.integration.state().toast?.includes('1 session entries'));
  assert.match((await page.evaluate(()=>window.integration.state())).toast,/2 duplicates/);
});

test('Console context inspection opens API without a duplicate Network ledger',async t=>{
  const page=await fixture(t);
  assert.equal(await page.locator('.xray-mini-tab').count(),0);
  assert.equal(await page.locator('.xray-network').count(),0);
  await page.evaluate(()=>window.integration.set({
    entries:[
      {id:'fixture',type:'api',method:'GET',status:200,url:'https://example.test/widgets',urlPath:'/widgets',duration:900,responseRaw:'{"ok":true}'},
      {id:'second',type:'api',method:'POST',status:201,url:'https://example.test/widgets',urlPath:'/widgets',duration:120,responseRaw:'{"created":true}'},
    ],
    consoleDraft:'res.data',
    pinnedIds:new Set(['fixture']),
    selectedId:'fixture',
  }));
  // P1: the picker is a disclosure; type to filter, Enter picks the first match.
  await page.getByRole('button',{name:/^Console request context\b/}).click();
  await page.getByRole('textbox',{name:'Filter requests'}).fill('POST');
  await page.keyboard.press('Enter');
  let picked=await page.evaluate(()=>window.integration.state());
  assert.equal(picked.selected,'second');
  assert.equal(picked.draft,'res.data');
  assert.deepEqual(picked.pinned,['fixture']);
  assert.equal(picked.calls,0);
  await page.getByRole('button',{name:'Inspect in API',exact:true}).click();
  const state=await page.evaluate(()=>window.integration.state());
  assert.equal(state.tab,'api');
   assert.equal(state.mini,'console');
  assert.equal(state.selected,'second');
  assert.deepEqual(state.pinned,['fixture']);
  assert.equal(state.draft,'res.data');
  assert.equal(state.calls,0);
});
