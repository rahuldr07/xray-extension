import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { before, after } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { PANEL_CSS } from '../helpers/panel-css.mjs';
import { setStandardsContent } from '../helpers/standards-page.mjs';

// Real components, store, virtualizers and stylesheet; only external clipboard,
// persistence and MAIN-world object transport are replaced with synthetic data.
const { outputFiles } = await build({
  stdin: {
    resolveDir: fileURLToPath(new URL('../../', import.meta.url)), loader: 'jsx',
    contents: `
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      import { flushSync } from 'react-dom';
      import { EntriesWorkspace } from './src/panel/components/api/EntriesWorkspace';
      import { ConsoleWorkspace } from './src/panel/components/console/ConsoleWorkspace';
      import { usePanelStore } from './src/panel/store';
      const styles = ${JSON.stringify(PANEL_CSS)};
      function Fixture() {
        const tab = usePanelStore(s => s.activeTab);
        return <div className="xray-theme-scope xray-theme-xray-dark">
          <div className="xray-panel xray-mode-window xray-open">
            {tab === 'console' ? <ConsoleWorkspace /> : <EntriesWorkspace mode={tab === 'logs' ? 'logs' : 'api'} />}
          </div>
        </div>;
      }
      window.rowActions = {
        root: null, copied: null,
        setup(shadow) {
          const host = document.body.appendChild(document.createElement('div'));
          this.root = shadow ? host.attachShadow({mode:'closed'}) : document;
          const sheet = document.createElement('style'); sheet.textContent = styles;
          (shadow ? this.root : document.head).appendChild(sheet);
          window.XRAY_Store = {get:async()=>null,set:async()=>{}};
          Object.defineProperty(navigator, 'clipboard', {configurable:true, value:{writeText:async text=>{this.copied=text;}}});
          window.__XRAY_fetchLogObject__ = async ref => ({ref, nested:{value:'FULL_OBJECT_VALUE'}});
          const api = (id, timestamp) => ({id,type:'api',method:'GET',status:200,source:'fetch',
            url:'https://example.test/widgets?limit=2',urlPath:'/widgets',timestamp,
            duration:100,size:20,responseRaw:'{"ok":true}',requestHeaders:{'x-fixture':'header-value'}});
          flushSync(() => {
            usePanelStore.setState({open:true,activeTab:'api',apiGroupingMode:'flat',
              selectedId:null,expandedId:null,apiDetailOpen:false,entries:[],consoleEvents:[],recording:true,
              apiSearchQuery:'',pinnedIds:new Set(),expandedGroups:new Set(),
              statusFilters:new Set(),typeFilters:new Set(),methodFilters:new Set()});
            const s = usePanelStore.getState();
            s.addEntries([api('request-old',1000),api('request-new',2000),
              {id:'log-fixture',type:'log',logLevel:'log',timestamp:3000,message:'fixture log',
                logData:{nested:{value:'PREVIEW_VALUE'},__xray_ref__:'object-ref'},objectRefs:['object-ref']}]);
            s.addConsoleEvent({id:'result-fixture',type:'result',level:'info',timestamp:4000,
              message:'fixture result',data:{nested:{value:'RESULT_VALUE'}}});
            s.selectEntry('request-old',{openDetail:false});
            createRoot(shadow ? this.root.appendChild(document.createElement('div')) : host).render(<Fixture />);
          });
        },
        set(patch) { flushSync(() => usePanelStore.setState(patch)); },
        query(selector) { return this.root.querySelector(selector); },
        state() { const s = usePanelStore.getState(); return {selected:s.selectedId, detail:s.apiDetailOpen,
          expanded:s.expandedId, pins:[...s.pinnedIds], query:s.apiSearchQuery,
          quick:s.apiQuickFilter, methods:[...s.methodFilters], groups:[...s.expandedGroups], copied:this.copied}; }
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

async function fixture(t, shadow, width = 960) {
  const page = await browser.newPage({ viewport: { width, height: 700 } });
  page.setDefaultTimeout(3000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  t.after(async () => { await page.close(); assert.deepEqual(errors, [], 'no browser errors'); });
  await setStandardsContent(page, '<style>body{margin:0}</style>');
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(shadow => window.rowActions.setup(shadow), shadow);
  return page;
}
const state = page => page.evaluate(() => window.rowActions.state());
const set = (page, patch) => page.evaluate(patch => window.rowActions.set(patch), patch);
async function element(page, selector) {
  const handle = (await page.evaluateHandle(selector => window.rowActions.query(selector), selector)).asElement();
  assert.ok(handle, `missing ${selector}`);
  return handle;
}
async function press(page, selector, key) {
  const handle = await element(page, selector);
  await handle.press(key);
  await handle.dispose();
}
async function click(page, selector) {
  const handle = await element(page, selector);
  await handle.click();
  await handle.dispose();
}
async function activateHidden(page, selector) {
  const handle = await element(page, selector);
  await handle.evaluate(element => element.click());
  await handle.dispose();
}
async function text(page, selector) {
  const handle = await element(page, selector);
  const value = await handle.textContent();
  await handle.dispose();
  return value;
}

for (const shadow of [false, true]) {
  const surface = shadow ? 'closed shadow' : 'document';
  for (const key of ['Enter', 'Space']) {
    test(`API pin and copy keyboard activation leave selection and drawer alone (${surface}, ${key})`, async t => {
      const page = await fixture(t, shadow);
      await press(page, '.xray-api-row [aria-label="Pin request"]', key);
      assert.deepEqual((await state(page)).pins, ['request-new'], 'keyboard must activate the pin');
      assert.equal((await state(page)).selected, 'request-old');
      assert.equal((await state(page)).detail, false);
      await press(page, '.xray-api-row [aria-label="Copy request URL"]', key);
      assert.equal((await state(page)).copied, 'https://example.test/widgets?limit=2');
      assert.equal((await state(page)).selected, 'request-old');
      assert.equal((await state(page)).detail, false);
    });

    test(`API endpoint disclosure keyboard activation preserves selection (${surface}, ${key})`, async t => {
      const page = await fixture(t, shadow);
      await set(page, {apiGroupingMode:'endpoint'});
      await press(page, '[aria-label="Expand endpoint group"]', key);
      assert.equal((await state(page)).groups.length, 1, 'keyboard must expand the group');
      assert.equal((await state(page)).selected, 'request-old');
      assert.equal((await state(page)).detail, false);
      await press(page, '[aria-label="Collapse endpoint group"]', key);
      assert.deepEqual((await state(page)).groups, []);
    });

    test(`Logs pin keyboard activation does not select the log (${surface}, ${key})`, async t => {
      const page = await fixture(t, shadow);
      await set(page, {activeTab:'logs'});
      await press(page, '.xray-entry-row [aria-label="Pin log"]', key);
      assert.deepEqual((await state(page)).pins, ['log-fixture']);
      assert.equal((await state(page)).selected, 'request-old');
      await press(page, '.xray-entry-row [aria-label="Unpin log"]', key);
      assert.deepEqual((await state(page)).pins, []);
    });

    test(`Console lazy object loading stays expanded (${surface}, ${key})`, async t => {
      const page = await fixture(t, shadow);
      await set(page, {activeTab:'console',consoleMiniTab:'console'});
      await press(page, '.xray-console-row.log .xray-console-toggle', 'Enter');
      assert.equal((await state(page)).expanded, 'evt_log-fixture');
      await press(page, '.xray-log-load', key);
      assert.equal((await state(page)).expanded, 'evt_log-fixture', 'loading must not collapse the row');
      await page.waitForFunction(() => window.rowActions.query('.xray-log-detail-body')?.textContent.includes('FULL_OBJECT_VALUE'));
      assert.match(await text(page, '.xray-log-load'), /Reload/);
    });
  }

  for (const eventType of ['log', 'result']) {
    for (const activation of ['Enter', 'Space', 'click']) {
      test(`Console ${eventType} JSON toolbar and branches stay independent (${surface}, ${activation})`, async t => {
        const page = await fixture(t, shadow);
        await set(page, {activeTab:'console',consoleMiniTab:'console'});
        const rowSelector = '.xray-console-row.' + eventType;
        const expanded = eventType === 'log' ? 'evt_log-fixture' : 'result-fixture';
        await press(page, rowSelector + ' .xray-console-toggle', 'Enter');
        const activate = selector => activation === 'click' ? click(page, selector) : press(page, selector, activation);
        await activate(rowSelector + ' [title="Collapse all nodes"]');
        assert.equal((await state(page)).expanded, expanded, 'JSON toolbar must not collapse its parent');
        assert.equal(await page.evaluate(selector => window.rowActions.query(selector).getAttribute('aria-expanded'), rowSelector + ' .xray-json-node'), 'false');
        await activate(rowSelector + ' .xray-json-branch');
        assert.equal((await state(page)).expanded, expanded, 'JSON branch must not collapse its parent');
        assert.equal(await page.evaluate(selector => window.rowActions.query(selector).getAttribute('aria-expanded'), rowSelector + ' .xray-json-node'), 'true');
        await activate(rowSelector + ' [title="Expand all nodes"]');
        assert.match(await text(page, rowSelector + ' .xray-detail'), eventType === 'log' ? /PREVIEW_VALUE/ : /RESULT_VALUE/);
        // Detail text itself is selectable without toggling its parent row.
        await click(page, rowSelector + ' .xray-json-string');
        assert.equal((await state(page)).expanded, expanded);
        await press(page, rowSelector + ' .xray-console-toggle', 'Space');
        assert.equal((await state(page)).expanded, null, 'row keyboard still collapses');
      });
    }
  }

  test(`API list navigation and direct row keyboard opening remain available (${surface})`, async t => {
    const page = await fixture(t, shadow);
    await press(page, '.xray-api-table-scroll', 'Home');
    assert.equal((await state(page)).selected, 'request-new');
    await press(page, '.xray-api-table-scroll', 'ArrowDown');
    assert.equal((await state(page)).selected, 'request-old');
    assert.equal((await state(page)).detail, false);
    await press(page, '.xray-api-row.selected', 'Enter');
    assert.equal((await state(page)).detail, true);
    await set(page, {apiDetailOpen:false});
    await press(page, '.xray-api-table-scroll', 'Space');
    assert.equal((await state(page)).detail, true);
  });

  test(`empty API Clear filters restores search results using the actual empty-state action (${surface})`, async t => {
    const page = await fixture(t, shadow);
    await set(page, {apiSearchQuery:'no-match',apiQuickFilter:'errors'});
    assert.match(await text(page, '.xray-api-table-scroll'), /No matching API requests/);
    await press(page, '.xray-api-table-scroll .xray-empty-state button, .xray-api-table-scroll .xray-empty button', 'Enter');
    assert.equal((await state(page)).query, '');
    assert.equal((await state(page)).quick, 'all');
    assert.equal(await page.evaluate(() => window.rowActions.root.querySelectorAll('.xray-api-row').length), 2);
    assert.equal((await state(page)).selected, 'request-old');
  });

  test(`empty Logs Clear filters restores search results (${surface})`, async t => {
    const page = await fixture(t, shadow);
    await set(page, {activeTab:'logs',apiSearchQuery:'no-match'});
    assert.match(await text(page, '.xray-list-panel .xray-virtual-list'), /No matching logs/);
    await press(page, '.xray-list-panel .xray-virtual-list button', 'Space');
    assert.equal((await state(page)).query, '');
    assert.equal(await page.evaluate(() => window.rowActions.root.querySelectorAll('.xray-entry-row').length), 1);
  });

  for (const width of [420, 1600]) {
    test(`API selection never renders as Logs detail and log selection stays keyboard accessible (${surface}, ${width}px)`, async t => {
      const page = await fixture(t, shadow, width);
      await set(page, {activeTab:'logs'});
      assert.equal(await page.evaluate(() => window.rowActions.root.querySelectorAll('.xray-log-detail, .xray-mobile-detail-panel').length), 0, 'API selection must not leak into Logs');
      await press(page, '.xray-entry-row', 'Enter');
      assert.equal((await state(page)).selected, 'log-fixture');
      assert.match(await text(page, '.xray-log-detail-body'), /PREVIEW_VALUE/);
    });
  }

  test(`request context facets use the pressed-button group pattern (${surface})`, async t => {
    const page = await fixture(t, shadow, 1600);
    const group = await element(page, '.xray-request-tabs');
    assert.equal(await group.getAttribute('role'), 'group');
    await group.dispose();
    await activateHidden(page, '.xray-request-tabs button:nth-child(2)');
    assert.equal(await page.evaluate(() => window.rowActions.query('.xray-request-tabs button:nth-child(2)').getAttribute('aria-pressed')), 'true');
    assert.match(await text(page, '.xray-request-context-content'), /"limit".*"2"/s);
    await activateHidden(page, '.xray-request-tabs button:nth-child(3)');
    assert.match(await text(page, '.xray-request-context-content'), /header-value/);
    assert.equal(await page.evaluate(() => window.rowActions.query('.xray-request-tabs button:nth-child(2)').getAttribute('aria-pressed')), 'false');
  });
}
