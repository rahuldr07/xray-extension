import assert from 'node:assert/strict';
import test, { before, after } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { PANEL_CSS } from '../helpers/panel-css.mjs';
import { fileURLToPath } from 'node:url';
import { setStandardsContent } from '../helpers/standards-page.mjs';

const { outputFiles } = await build({
  stdin: { resolveDir: fileURLToPath(new URL('../../', import.meta.url)), loader: 'jsx', contents: `
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    import { flushSync } from 'react-dom';
    import { App } from './src/panel/App';
    import { usePanelStore } from './src/panel/store';
    import { installPanelKeyboard } from './src/panel/runtime/panelKeyboard';
    const css = ${JSON.stringify(PANEL_CSS)};
    const entry={id:'evidence',type:'api',method:'GET',url:'https://fixture.test/api?token=secret',urlPath:'/api',status:500,duration:700,responseRaw:'{}'};
    window.navTest={messages:[],setup(shadow){
      const host=document.body.appendChild(document.createElement('div'));this.root=shadow?host.attachShadow({mode:'closed'}):document;
      const style=document.createElement('style');style.textContent=css;(shadow?this.root:document.head).appendChild(style);
      const mount=shadow?this.root.appendChild(document.createElement('div')):host;mount.className='xray-app-root';
      window.XRAY_Store={get:async()=>null,set:async()=>{}};window.__XRAY_bridgeToken='fixture';window.postMessage=m=>this.messages.push(m);
      usePanelStore.setState({open:true,activeTab:'api'});usePanelStore.getState().addEntry(entry);usePanelStore.getState().selectEntry(entry.id);
      installPanelKeyboard({dismissible:false,getRoot:()=>this.root});flushSync(()=>createRoot(mount).render(<App mode='window'/>));
    },click(text){const b=[...this.root.querySelectorAll('button')].find(b=>b.textContent.trim()===text || b.querySelector('.xray-command-label')?.textContent===text);if(!b)throw Error('Missing '+text);b.click();},
    palette(query){usePanelStore.getState().setCommandOpen(true);},
    input(query){const e=this.root.querySelector('.xray-command-search input');const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;setter.call(e,query);e.dispatchEvent(new Event('input',{bubbles:true}));},
    synthesize(){usePanelStore.getState().openFindingSynthesis([usePanelStore.getState().findings.findings[0].id]);},
    pendingEscape(){usePanelStore.getState().openFindingSynthesis([usePanelStore.getState().findings.findings[0].id]);document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));},
    state(){const s=usePanelStore.getState();const modal=this.root.querySelector('.xray-explain-modal');const close=modal?.querySelector('.xray-modal-head button');return {tab:s.activeTab,sub:s.rulesSubTab,selectedSub:this.root.querySelector('[role=tab][aria-selected=true][id^=xray-rules-subtab]')?.id,investigations:s.investigationStore.investigations.length,synthesis:s.findingSynthesisIds,dialogs:[...this.root.querySelectorAll('[role=dialog]')].map(e=>e.getAttribute('aria-label')),font:modal?getComputedStyle(modal).fontFamily:null,closeVisible:!close||close.getBoundingClientRect().right<=modal.getBoundingClientRect().right,text:this.root.textContent,messages:this.messages};}
    };
  ` }, loader: { '.css': 'text' }, bundle: true, write: false, format: 'iife',
});
let browser;
before(async () => { browser = await chromium.launch({ headless: true }); });
after(async () => { await browser?.close(); });
async function fixture(t, shadow) {
  const page = await browser.newPage({ viewport: { width: 960, height: 800 } });
  t.after(() => page.close());
  await setStandardsContent(page, '<style>body{margin:0}</style>');
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(shadow => window.navTest.setup(shadow), shadow);
  return page;
}
const state = page => page.evaluate(() => window.navTest.state());
async function click(page, text) { await page.evaluate(text => window.navTest.click(text), text); await page.waitForTimeout(50); }
for (const shadow of [false, true]) {
  test(`detail and palette prepare saved investigations without execution (${shadow ? 'shadow' : 'document'})`, async t => {
    const page = await fixture(t, shadow);
    await click(page, 'More actions');
    await click(page, 'Save investigation');
    assert.equal((await state(page)).investigations, 1);
    assert.equal((await state(page)).tab, 'rules');
    assert.equal((await state(page)).selectedSub, 'xray-rules-subtab-investigations', 'saving lands on the Investigations section');
    await page.evaluate(() => window.navTest.click('Rules0'));
    assert.equal((await state(page)).sub, 'rules');
    await page.keyboard.press('ControlOrMeta+k');
    await page.evaluate(() => window.navTest.input('Open saved investigations'));
    await page.waitForTimeout(50);
    await click(page, 'Open saved investigations');
    assert.equal((await state(page)).tab, 'rules');
    assert.equal((await state(page)).selectedSub, 'xray-rules-subtab-investigations', 'palette deep link lands on Investigations');
    assert.equal((await state(page)).messages.length, 0);
  });
  test(`synthesis mounts globally and owns Escape (${shadow ? 'shadow' : 'document'})`, async t => {
    const page = await fixture(t, shadow);
    await page.evaluate(() => window.navTest.synthesize());
    await page.waitForTimeout(50);
    assert.ok((await state(page)).dialogs.includes('Synthesize findings with AI'));
    assert.doesNotMatch((await state(page)).font, /Times New Roman/, 'synthesis uses scoped app typography, not page-default serif');
    await page.setViewportSize({ width: 360, height: 800 });
    assert.equal((await state(page)).closeVisible, true, 'mobile title cannot push Close outside the modal');
    await page.keyboard.press('Escape');
    assert.equal((await state(page)).synthesis, null);
    await page.evaluate(() => window.navTest.pendingEscape());
    assert.equal((await state(page)).synthesis, null, 'precommit Escape closes requested synthesis instead of drawer');
    assert.equal((await state(page)).messages.length, 0);
  });
}
