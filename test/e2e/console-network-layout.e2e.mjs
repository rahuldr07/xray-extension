import assert from 'node:assert/strict';
import { existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { before, after } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { PANEL_CSS } from '../helpers/panel-css.mjs';
import { setStandardsContent } from '../helpers/standards-page.mjs';

// This is deliberately the real App, rather than a hand-built Console shell.
// It catches both document mounts and the closed-shadow mount used by the
// extension while keeping legacy persisted consoleMiniTab state in the fixture.
const { outputFiles } = await build({
  stdin: {
    resolveDir: fileURLToPath(new URL('../../', import.meta.url)),
    loader: 'jsx',
    contents: `
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      import { flushSync } from 'react-dom';
      import { App } from './src/panel/App';
      import { usePanelStore } from './src/panel/store';
      const styles = ${JSON.stringify(PANEL_CSS)};

      const request = (id, status=200, body='{"ok":true}') => ({
        id, type:'api', method:'GET', status, source:'fetch',
        url:'https://example.test/'+id, urlPath:'/api/'+id, timestamp:1700000000000,
        duration:42, size:body.length, responseHeaders:{'content-type':'application/json'}, responseRaw:body
      });
      const log = (id, message, type='log') => ({id, type, level:'info', timestamp:1700000000000, message, args:[message]});

      window.consoleLayout = {
        root:null,
        setup(shadow, width, height) {
          const host = document.body.appendChild(document.createElement('div'));
          this.root = shadow ? host.attachShadow({mode:'closed'}) : document;
          const sheet = document.createElement('style'); sheet.textContent = styles;
          (shadow ? this.root : document.head).appendChild(sheet);
          const mount = shadow ? this.root.appendChild(document.createElement('div')) : host;
          mount.className = 'xray-app-root';
          window.XRAY_Store = {get:async()=>null,set:async()=>{}};
          window.XRAY_Console = {setContext(){},execute:async()=>({type:'result',result:'not called'})};
          usePanelStore.setState({
            open:true, activeTab:'console', consoleMiniTab:'network', selectedId:null, expandedId:null,
            entries:[request('context')], consoleEvents:[log('log-1','Console output is visible'),log('result-1','result output','result')],
            recording:true, detailTab:'response', detailView:'tree', snippets:[], pinnedIds:new Set()
          });
          flushSync(() => createRoot(mount).render(<App mode="window" />));
        },
        query(selector) { return this.root.querySelector(selector); },
        state() {
          const input=this.query('[aria-label="Console command"]');
          const stream=this.query('.xray-console-stream');
          const panel=this.query('.xray-panel');
          const r=el=>el ? el.getBoundingClientRect() : null;
          return {
            ledger:this.query('.xray-network'), mini:this.query('.xray-mini-tab'),
            stream:r(stream), prompt:r(input), panel:r(panel), streamText:stream?.textContent||'',
            selected:usePanelStore.getState().selectedId, status:this.query('.xray-context-line')?.textContent||''
          };
        },
        patch() {
          usePanelStore.getState().updateEntry({id:'context',status:201,responseRaw:'{"patched-body":true}',duration:99});
        }
      };
    `,
  },
  bundle: true, format: 'iife', write: false, loader: { '.css': 'text' },
});

let browser;
before(async () => {
  const executablePath = process.env.XRAY_BROWSER_EXECUTABLE ||
    (!existsSync(chromium.executablePath()) && existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined);
  browser = await chromium.launch({ executablePath, headless: true });
});
after(async () => { await browser?.close(); });

for (const shadow of [false, true]) {
  for (const [width, height] of [[360, 700], [420, 700], [760, 700], [960, 350], [960, 700], [1600, 1000]]) {
    const name = `${shadow ? 'closed-shadow' : 'document'}-${width}x${height}`;
    test(`Console stays output-first and has no request ledger (${name})`, async t => {
      const page = await browser.newPage({ viewport: { width, height } });
      t.after(async () => {
        if (process.env.XRAY_LAYOUT_SCREENSHOTS) {
          mkdirSync(process.env.XRAY_LAYOUT_SCREENSHOTS, { recursive: true });
          await page.screenshot({ path: `${process.env.XRAY_LAYOUT_SCREENSHOTS}/${name}.png` });
        }
        await page.close();
      });
      await setStandardsContent(page, '<style>body{margin:0}</style>');
      await page.addScriptTag({ content: outputFiles[0].text });
      await page.evaluate(({shadow, width, height}) => window.consoleLayout.setup(shadow, width, height), {shadow, width, height});
      await page.waitForFunction(() => {
        const state=window.consoleLayout.state();
        return state.stream?.height > 20 && state.prompt?.height > 0;
      });
      const state = await page.evaluate(() => window.consoleLayout.state());
      assert.equal(state.ledger, null, 'Console must not render a duplicate request ledger');
      assert.equal(state.mini, null, 'legacy consoleMiniTab=network must not create a mini tab');
      assert.match(state.streamText, /Console output is visible/);
      assert.match(state.streamText, /result output/);
      assert.ok(state.stream.height > 20, `Console output needs a usable viewport: ${JSON.stringify(state)}`);
      assert.ok(state.prompt.bottom <= height + 1, `Console prompt must remain reachable: ${JSON.stringify(state)}`);
    });
  }
}

for (const shadow of [false, true]) {
  test(`Console picker resolves current API status/body and explicit inspect (${shadow ? 'closed shadow' : 'document'})`, async t => {
    const page = await browser.newPage({ viewport: { width: 960, height: 700 } });
    t.after(() => page.close());
    await setStandardsContent(page, '<style>body{margin:0}</style>');
    await page.addScriptTag({ content: outputFiles[0].text });
    await page.evaluate(shadow => window.consoleLayout.setup(shadow, 960, 700), shadow);
    // P1: the picker is a disclosure (Change ▾ / Pick request) with one button per request.
    await page.evaluate(() => window.consoleLayout.query('[aria-label="Console request context"]').click());
    await page.waitForFunction(() => window.consoleLayout.query('.xray-context-option'));
    await page.evaluate(() => window.consoleLayout.query('.xray-context-option').click());
    await page.waitForFunction(() => window.consoleLayout.state().selected === 'context');
    await page.evaluate(() => window.consoleLayout.patch());
    await page.waitForTimeout(90);
    assert.match((await page.evaluate(() => window.consoleLayout.state())).status, /201/);
    await page.evaluate(() => [...window.consoleLayout.root.querySelectorAll('button')]
      .find(button => button.textContent.trim() === 'Inspect in API').click());
    await page.waitForFunction(() => window.consoleLayout.root.querySelector('.xray-api-table-scroll'));
    assert.equal(await page.evaluate(() => window.consoleLayout.root.querySelectorAll('.xray-api-table-scroll').length), 1);
    assert.match(await page.evaluate(() => window.consoleLayout.root.querySelector('.xray-panel').textContent), /patched-body/);
  });
}
