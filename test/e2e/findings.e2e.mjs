import assert from 'node:assert/strict';
import test, { before, after } from 'node:test';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { chromium } from 'playwright';

// Real model/Insights/FindingsPanel; store action stubs isolate this component
// fixture. These tests prove action wiring, not storage or provider delivery.
const { outputFiles } = await build({
  stdin: { resolveDir: fileURLToPath(new URL('../../', import.meta.url)), loader: 'jsx', contents: `
    import React from 'react';
    import {createRoot} from 'react-dom/client';
    import {flushSync} from 'react-dom';
    import {Insights} from './src/panel/components/insights/Insights';
    import {deriveFindings,createFindingState,reconcileFindingState,dismissFinding,restoreFinding} from './src/panel/models/findings';
    import {usePanelStore} from './src/panel/store';
    import styles from './src/panel/styles.css';
    const entries=Array.from({length:7},(_,i)=>({id:'entry-'+i,type:'api',method:'GET',url:'https://safe.test/items/'+i+'?token=secret#hash',urlPath:'/items/'+i,duration:900,status:200,size:20,timestamp:i+1,responseRaw:'RAW_BODY_SECRET'}));
    window.findingTest={calls:{evidence:[],synthesis:[],storage:0,network:0},root:null,errors:[],
      setup(shadow,panel){
        const host=document.body.appendChild(document.createElement('div'));
        this.root=shadow?host.attachShadow({mode:'closed'}):document;
        const sheet=document.createElement('style');sheet.textContent=styles;(shadow?this.root:document.head).appendChild(sheet);
        window.XRAY_Store={get:async()=>null,set:async()=>{this.calls.storage++}};
        window.addEventListener('error',event=>this.errors.push(event.message));
        const findings=reconcileFindingState(createFindingState('session-1'),deriveFindings(entries,{sessionId:'session-1',slowThresholdMs:500}));
        usePanelStore.setState({session:{...usePanelStore.getState().session,sessionId:'session-1'},entries,findings,collapsedSections:new Set(),
          dismissFinding:id=>usePanelStore.setState({findings:dismissFinding(usePanelStore.getState().findings,id)}),
          restoreFinding:id=>usePanelStore.setState({findings:restoreFinding(usePanelStore.getState().findings,id)}),
          openFindingEvidence:(id,entryId)=>this.calls.evidence.push([id,entryId]),
          openFindingSynthesis:ids=>this.calls.synthesis.push(ids)});
        flushSync(()=>createRoot(shadow?this.root.appendChild(document.createElement('div')):host).render(<div className="xray-theme-scope xray-theme-operator">{panel?<div className="xray-panel xray-mode-window xray-open"><Insights/></div>:<Insights/>}</div>));
      },
      click(name){const el=[...this.root.querySelectorAll('button')].find(el=>el.textContent.trim()===name||el.getAttribute('aria-label')===name);if(!el)throw Error('Missing '+name);el.click()},
      select(index){const el=this.root.querySelectorAll('[aria-label^="Select finding"]')[index];if(!el)throw Error('Missing selection '+index);el.click()},
      mixed(){const e=entries.map((entry,i)=>i===0?{...entry,status:500}:entry);
        const f=reconcileFindingState(createFindingState('session-1'),deriveFindings(e,{sessionId:'session-1',slowThresholdMs:500}));
        const orphan={id:'orphan',kind:'repeated-endpoint',severity:'info',title:'Orphan finding',summary:'No request retained',fingerprint:'orphan',sessionId:'session-1',createdAt:1,updatedAt:1,active:true,evidence:[]};
        flushSync(()=>usePanelStore.setState({entries:e,findings:{...f,findings:[...f.findings,orphan]}}))},
      focusLabel(label){const el=this.root.querySelector('[aria-label="'+label+'"]');if(!el)throw Error('Missing '+label);el.focus();return el},
      active(){const a=this.root.activeElement;return a?(a.getAttribute('aria-label')||a.textContent.trim()):null},
      evict(){flushSync(()=>usePanelStore.setState({entries:[],findings:reconcileFindingState(usePanelStore.getState().findings,[])}))},
      newSession(){flushSync(()=>usePanelStore.setState({session:{...usePanelStore.getState().session,sessionId:'session-2'},findings:createFindingState('session-2')}))},
      sameIdWrongSession(){const s=usePanelStore.getState();flushSync(()=>usePanelStore.setState({session:{...s.session,sessionId:'session-2'}}))},
      snapshot(){const section=this.root.querySelector('[aria-label="Findings"]');return {text:section?.textContent||'',allText:(this.root===document?document.body:this.root).textContent,
        selections:[...this.root.querySelectorAll('[aria-label^="Select finding"]')].map(el=>({checked:el.checked,disabled:el.disabled})),
        evidence:[...section.querySelectorAll('button[aria-label^="Open evidence"]')].map(el=>({disabled:el.disabled,label:el.getAttribute('aria-label')})),
        synthDisabled:[...section.querySelectorAll('button')].find(el=>el.textContent.startsWith('Synthesize'))?.disabled,
        calls:this.calls,errors:this.errors,findings:usePanelStore.getState().findings};}
    };
  ` }, bundle: true, format: 'iife', write: false, loader: { '.css': 'text' },
});

let browser;
before(async () => {
  const executablePath = process.env.XRAY_BROWSER_EXECUTABLE ||
    (!existsSync(chromium.executablePath()) && existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined);
  browser = await chromium.launch({ executablePath, headless: true });
});
after(async () => { await browser?.close(); });
async function fixture(t, shadow = false, width = 960, panel = false) {
  const page = await browser.newPage({ viewport: { width, height: 800 } });
  t.after(() => page.close());
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(([shadow, panel]) => window.findingTest.setup(shadow, panel), [shadow, panel]);
  return page;
}
const snapshot = page => page.evaluate(() => window.findingTest.snapshot());
async function click(page, name) {
  await page.evaluate(name => window.findingTest.click(name), name);
  await page.waitForTimeout(20);
}
async function select(page, index) {
  await page.evaluate(index => window.findingTest.select(index), index);
  await page.waitForTimeout(20);
}

for (const shadow of [false, true]) {
  test(`findings retain Insights summaries and explicit dismiss/restore/evidence wiring (${shadow ? 'closed shadow' : 'document'})`, async t => {
    const page = await fixture(t, shadow);
    let state = await snapshot(page);
    for (const label of ['Requests', 'Errors', 'Slow', 'Average', 'Payload', 'Repeated endpoints', 'Slowest requests', 'Status mix']) assert.match(state.allText, new RegExp(label));
    assert.equal(state.selections.length, 7);
    assert.equal(state.synthDisabled, true);
    assert.deepEqual(state.calls, { evidence: [], synthesis: [], storage: 0, network: 0 });
    assert.equal(state.text.includes('secret'), false);
    assert.equal(state.text.includes('RAW_BODY_SECRET'), false);
    await click(page, state.evidence[0].label);
    assert.equal((await snapshot(page)).calls.evidence.length, 1);
    await click(page, 'Dismiss Slow request');
    assert.equal((await snapshot(page)).selections.length, 6);
    await click(page, 'Dismissed');
    assert.equal((await snapshot(page)).selections.length, 1);
    await click(page, 'Restore Slow request');
    await click(page, 'Active');
    assert.equal((await snapshot(page)).selections.length, 7);
    await page.evaluate(() => window.findingTest.evict());
    await click(page, 'History');
    state = await snapshot(page);
    assert.equal(state.selections.length, 7);
    assert.ok(state.evidence.every(item => item.disabled));
    assert.match(state.text, /unavailable|no longer retained/i);
    assert.deepEqual(state.errors, []);
  });

  test(`finding selection is limited to five and only explicit synthesis prepares selected IDs (${shadow ? 'closed shadow' : 'document'})`, async t => {
    const page = await fixture(t, shadow);
    for (let index = 0; index < 5; index++) await select(page, index);
    let state = await snapshot(page);
    assert.equal(state.selections.filter(item => item.checked).length, 5);
    assert.ok(state.selections.slice(5).every(item => item.disabled));
    assert.deepEqual(state.calls.synthesis, []);
    assert.equal(await page.evaluate(() => window.findingTest.root.querySelector('.xray-findings-synthesize').textContent), 'Synthesize (5)', 'button carries the selection count');
    await click(page, 'Synthesize (5)');
    state = await snapshot(page);
    assert.equal(state.calls.synthesis.length, 1);
    assert.equal(state.calls.synthesis[0].length, 5);
    assert.equal(new Set(state.calls.synthesis[0]).size, 5);
    assert.equal(state.calls.storage + state.calls.network, 0);
    await select(page, 0);
    assert.equal((await snapshot(page)).selections[6].disabled, false);
    await page.evaluate(() => window.findingTest.sameIdWrongSession());
    state = await snapshot(page);
    assert.ok(state.evidence.every(item => item.disabled));
    assert.equal(state.synthDisabled, true, 'selection is scoped to its session');
    await page.evaluate(() => window.findingTest.newSession());
    assert.match((await snapshot(page)).text, /No active findings/);
  });
}

for (const shadow of [false, true]) {
  test(`insights order is overview, findings, breakdown; finding rows are compact and grouped (${shadow ? 'closed shadow' : 'document'})`, async t => {
    const page = await fixture(t, shadow);
    const info = await page.evaluate(() => {
      const root = window.findingTest.root;
      const q = sel => root.querySelector(sel);
      const before = (a, b) => !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
      const rows = [...root.querySelectorAll('.xray-finding-row')];
      return {
        order: before(q('.xray-insight-strip'), q('.xray-findings')) && before(q('.xray-findings'), q('.xray-insight-columns')),
        groups: root.querySelectorAll('.xray-finding-group').length, rows: rows.length,
        maxRow: Math.max(...rows.map(r => r.getBoundingClientRect().height)),
        hiddenSummary: rows.every(r => r.querySelector('.xray-finding-details').hidden),
      };
    });
    assert.ok(info.order, 'strip, then findings, then breakdown cards');
    assert.ok(info.groups >= 1 && info.groups <= info.rows);
    assert.ok(info.maxRow <= 40, `collapsed finding row is one compact line (${info.maxRow}px)`);
    assert.ok(info.hiddenSummary, 'explanation is secondary until expanded');
    await click(page, 'Details for Slow request');
    assert.equal(await page.evaluate(() => window.findingTest.root.querySelector('[aria-label="Slow request"] .xray-finding-details').hidden), false);
  });
}

for (const shadow of [false, true]) for (const width of [360, 1600]) {
  test(`findings filters and selection controls fit ${width}px (${shadow ? 'closed shadow' : 'document'})`, async t => {
    const page = await fixture(t, shadow, width);
    const measures = await page.evaluate(() => {
      const section = window.findingTest.root.querySelector('[aria-label="Findings"]');
      return [...section.querySelectorAll('button,input')].filter(el => !el.disabled).map(el => {
        const rect = el.getBoundingClientRect();
        return { left: rect.left, right: rect.right, width: innerWidth };
      });
    });
    assert.ok(measures.every(item => item.left >= 0 && item.right <= item.width + 1), 'enabled controls fit the viewport');
  });
}

// Dismiss/Restore removes the row under focus: focus moves to the next row's same
// action, else the previous row's, else the active view filter chip.
for (const shadow of [false, true]) {
  test(`dismiss and restore keep focus on a neighbouring row, then the view filter (${shadow ? 'closed shadow' : 'document'})`, async t => {
    const page = await fixture(t, shadow);
    // Keyboard-activate the Dismiss/Restore button of row `index` (-1 = last row).
    const activate = async index => {
      await page.evaluate(index => { const rows = window.findingTest.root.querySelectorAll('.xray-finding-row'); rows[index < 0 ? rows.length - 1 : index].querySelectorAll('.xray-finding-action')[1].focus(); }, index);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(20);
    };
    const focus = () => page.evaluate(() => {
      const root = window.findingTest.root; const a = root.activeElement; const rows = [...root.querySelectorAll('.xray-finding-row')];
      return { label: a?.getAttribute('aria-label') || null, row: rows.findIndex(r => r.contains(a)), count: rows.length };
    });
    await activate(0);
    let state = await focus();
    assert.equal(state.count, 6);
    assert.equal(state.row, 0, 'dismissing a row moves focus to the next row');
    assert.match(state.label || '', /^Dismiss /);
    await activate(-1);
    state = await focus();
    assert.equal(state.count, 5);
    assert.equal(state.row, 4, 'with no next row focus moves to the previous row');
    assert.match(state.label || '', /^Dismiss /);
    await page.evaluate(() => window.findingTest.click('Dismissed'));
    await page.waitForTimeout(20);
    await activate(0);
    state = await focus();
    assert.equal(state.count, 1);
    assert.match(state.label || '', /^Restore /, 'restoring moves focus to the remaining row');
    await activate(0);
    const chip = await page.evaluate(() => { const a = window.findingTest.root.activeElement; return { text: a?.textContent?.trim(), pressed: a?.getAttribute('aria-pressed'), inFilters: !!a?.closest('[aria-label="Finding filters"]') }; });
    assert.deepEqual(chip, { text: 'Dismissed', pressed: 'true', inFilters: true }, 'with no rows left focus lands on the active view filter');
  });

  test(`findings group by request, keep request-less findings apart, and details disclose (${shadow ? 'closed shadow' : 'document'})`, async t => {
    const page = await fixture(t, shadow);
    await page.evaluate(() => window.findingTest.mixed());
    await page.waitForTimeout(20);
    const info = await page.evaluate(() => {
      const root = window.findingTest.root;
      return [...root.querySelectorAll('.xray-finding-group')].map(group => ({
        label: group.getAttribute('aria-label'),
        titles: [...group.querySelectorAll('.xray-finding-row')].map(row => row.getAttribute('aria-label')),
      }));
    });
    const first = info.find(group => group.label === 'Request GET /items/0');
    assert.ok(first, JSON.stringify(info));
    assert.deepEqual([...first.titles].sort(), ['HTTP error', 'Slow request'], 'two findings on one request share one group');
    assert.equal(info.filter(group => group.label === 'Request GET /items/0').length, 1);
    const orphan = info.find(group => group.label === 'Findings without a request');
    assert.deepEqual(orphan?.titles, ['Orphan finding'], 'a finding without a request reference lands in the no-request group');
    // The chevron is a disclosure: aria-expanded toggles and aria-controls names the details element.
    const disclosure = await page.evaluate(() => {
      const root = window.findingTest.root;
      const button = root.querySelector('[aria-label="Details for Orphan finding"]');
      const target = (root.getElementById ? root.getElementById(button.getAttribute('aria-controls')) : document.getElementById(button.getAttribute('aria-controls')));
      const before = { expanded: button.getAttribute('aria-expanded'), hidden: target?.hidden, isDetails: !!target?.classList.contains('xray-finding-details'), inRow: !!target && button.closest('.xray-finding-row').contains(target) };
      button.click();
      return { before, id: button.getAttribute('aria-controls') };
    });
    assert.deepEqual(disclosure.before, { expanded: 'false', hidden: true, isDetails: true, inRow: true });
    await page.waitForTimeout(20);
    const after = await page.evaluate(id => { const root = window.findingTest.root; const button = root.querySelector('[aria-label="Details for Orphan finding"]'); const target = root.getElementById ? root.getElementById(id) : document.getElementById(id); return { expanded: button.getAttribute('aria-expanded'), hidden: target.hidden }; }, disclosure.id);
    assert.deepEqual(after, { expanded: 'true', hidden: false });
  });

  test(`at the five-finding limit disabled checkboxes say why; breakdown cards align with the strip at 420 (${shadow ? 'closed shadow' : 'document'})`, async t => {
    // Inside the real .xray-panel size container, so its container queries apply.
    const page = await fixture(t, shadow, 420, true);
    for (let index = 0; index < 5; index++) await select(page, index);
    const titles = await page.evaluate(() => [...window.findingTest.root.querySelectorAll('[aria-label^="Select finding"]')].map(el => ({ disabled: el.disabled, title: el.getAttribute('title') })));
    assert.ok(titles.filter(t => t.disabled).length === 2 && titles.filter(t => t.disabled).every(t => t.title === 'Up to 5 findings'), JSON.stringify(titles));
    assert.ok(titles.filter(t => !t.disabled).every(t => !t.title), 'enabled checkboxes carry no limit title');
    const edges = await page.evaluate(() => {
      const root = window.findingTest.root;
      const left = sel => Math.round(root.querySelector(sel).getBoundingClientRect().left);
      const right = sel => Math.round(root.querySelector(sel).getBoundingClientRect().right);
      return { strip: [left('.xray-insight-strip'), right('.xray-insight-strip')], findings: [left('.xray-findings'), right('.xray-findings')], card: [left('.xray-insight-columns .xray-card'), right('.xray-insight-columns .xray-card')] };
    });
    assert.ok(Math.abs(edges.card[0] - edges.strip[0]) <= 1 && Math.abs(edges.card[1] - edges.strip[1]) <= 1, `breakdown cards share the strip's edges: ${JSON.stringify(edges)}`);
    assert.ok(Math.abs(edges.findings[0] - edges.strip[0]) <= 1, JSON.stringify(edges));
  });
}
