import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { before, after } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';

// Real component, store and stylesheet: these checks exercise computed layout,
// scrolling and user input rather than matching CSS/source strings.
const { outputFiles } = await build({
  stdin: {
    resolveDir: fileURLToPath(new URL('../../', import.meta.url)),
    loader: 'jsx',
    contents: `
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      import { flushSync } from 'react-dom';
      import { EntriesWorkspace } from './src/panel/components/api/EntriesWorkspace';
      import { usePanelStore } from './src/panel/store';
      import { installPanelKeyboard } from './src/panel/runtime/panelKeyboard';
      import styles from './src/panel/styles.css';
      const root = window.closedFixture ? document.body.appendChild(document.createElement('div')).attachShadow({ mode: 'closed' }) : document;
      const sheet = (window.closedFixture ? root : document.head).appendChild(document.createElement('style'));
      sheet.textContent = styles;
      usePanelStore.setState({ open: true, activeTab: 'api' });
      installPanelKeyboard({ dismissible: true, getRoot: () => root });
      flushSync(() => createRoot((window.closedFixture ? root : document.body).appendChild(document.createElement('div'))).render(
        <div className="xray-theme-scope xray-theme-xray-dark" style={{'--xray-font': 'monospace'}}>
          <div className="xray-panel xray-mode-window xray-open"><EntriesWorkspace mode="api" /></div>
        </div>
      ));
      window.apiTest = {
        root,
        q(selector) { return root.querySelector(selector); },
        active() { const a = root.activeElement; return a ? (a.getAttribute('aria-label') || a.textContent.trim()) : null; },
        focusLabel(label) { root.querySelector('[aria-label="' + label + '"]').focus(); },
        selectOther(id) { flushSync(() => usePanelStore.getState().selectEntry(id)); },
        seed() {
          flushSync(() => usePanelStore.getState().addEntry({
            id: 'layout-fixture', type: 'api', method: 'GET', status: 200,
            url: 'https://example.test/widgets', urlPath: '/widgets', source: 'fetch',
            timestamp: Date.now(), duration: 123,
            responseHeaders: { 'content-type': 'application/json' },
            responseRaw: JSON.stringify({ widgets: Array.from({length: 30}, (_, id) => ({id, name: 'Widget ' + id})) }),
          }));
        },
        select() {
          flushSync(() => usePanelStore.getState().selectEntry('layout-fixture'));
        },
        filters() {
          const state = usePanelStore.getState();
          return { query: state.apiSearchQuery, quick: state.apiQuickFilter, rows: state.entries.length };
        },
        seedMixed() {
          const base = { type: 'api', method: 'GET', status: 200, source: 'fetch', duration: 120, size: 2048,
            responseHeaders: { 'content-type': 'application/json' } };
          flushSync(() => {
            const s = usePanelStore.getState();
            s.updateSettings({ slowThresholdMs: 900 });
            s.addEntry({ ...base, id: 'mixed-ok', url: 'https://example.test/api/v1/widgets/inventory/summary', urlPath: '/api/v1/widgets/inventory/summary', timestamp: Date.now() - 3000,
              responseRaw: JSON.stringify({ path: '/rahuldr07/xray-extension/recently-touched-branches/with/a/very/long/value/that/must/wrap/inside/the/value/only', status: 200 }) });
            s.addEntry({ ...base, id: 'mixed-error', method: 'DELETE', status: 500, url: 'https://example.test/api/orders', urlPath: '/api/orders', timestamp: Date.now() - 2000, responseRaw: '{"error":"boom"}' });
            s.addEntry({ ...base, id: 'mixed-slow', method: 'POST', url: 'https://example.test/api/search', urlPath: '/api/search', timestamp: Date.now() - 1000, duration: 1400, responseRaw: '{"hits":[]}' });
            s.selectEntry('mixed-ok');
          });
        },
        state() {
          const s = usePanelStore.getState();
          return { quick: s.apiQuickFilter, detail: s.apiDetailOpen, selected: s.selectedId };
        },
        set(patch) { flushSync(() => usePanelStore.setState(patch)); },
      };
    `,
  },
  loader: { '.css': 'text' },
  bundle: true,
  format: 'iife',
  write: false,
});

let browser;
before(async () => {
  const executablePath = process.env.XRAY_BROWSER_EXECUTABLE ||
    (!existsSync(chromium.executablePath()) && existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined);
  browser = await chromium.launch({ executablePath, headless: true });
});
after(async () => { await browser?.close(); });

async function fixture(t, width = 420, closed = false) {
  const page = await browser.newPage({ viewport: { width, height: 700 } });
  t.after(() => page.close());
  await page.setContent('<style>body { margin: 0; }</style>');
  await page.evaluate(value => { window.closedFixture = value; }, closed);
  await page.addScriptTag({ content: outputFiles[0].text });
  return page;
}

test('filtered API results offer a working reset instead of first-run onboarding', async t => {
  const page = await fixture(t);
  await page.getByText('Listening for traffic', { exact: true }).waitFor();
  await page.evaluate(() => window.apiTest.seed());
  await page.getByRole('option').first().waitFor();
  await page.getByPlaceholder('Filter method, status, path, domain, source, content type...').fill('does-not-match');
  await page.getByText('No matching API requests', { exact: true }).waitFor();
  assert.equal(await page.getByText('Listening for traffic', { exact: true }).count(), 0);
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
  await page.getByRole('option').first().waitFor();
  assert.deepEqual(await page.evaluate(() => window.apiTest.filters()), { query: '', quick: 'all', rows: 1 });
});

test('below 600px the detail opens full height and Requests returns to a focused list (S20)', async t => {
  const page = await fixture(t);
  await page.evaluate(() => { window.apiTest.seed(); window.apiTest.select(); });
  const content = page.locator('.xray-api-detail-drawer .xray-detail-content');
  await content.waitFor({ state: 'visible' });
  const layout = await page.evaluate(() => {
    const pane = document.querySelector('.xray-api-collection-pane');
    const drawer = document.querySelector('.xray-api-detail-drawer').getBoundingClientRect();
    const body = document.querySelector('.xray-api-body').getBoundingClientRect();
    return { listShown: pane.getClientRects().length > 0, drawerTop: drawer.top - body.top, drawerHeight: drawer.height, bodyHeight: body.height,
      contentHeight: document.querySelector('.xray-api-detail-drawer .xray-detail-content').getBoundingClientRect().height,
      actionbar: document.querySelectorAll('.xray-detail-actionbar').length };
  });
  assert.equal(layout.listShown, false, 'the list is replaced, not covered by a sheet');
  assert.ok(layout.drawerTop <= 1 && layout.drawerHeight >= layout.bodyHeight - 1, JSON.stringify(layout));
  assert.ok(layout.contentHeight > 120, `response was compressed to ${layout.contentHeight}px`);
  assert.equal(layout.actionbar, 0, 'no bottom action bar');
  const back = page.getByRole('button', { name: 'Back to requests' });
  assert.equal(await back.isVisible(), true);
  assert.match(await back.textContent(), /Requests/);
  await back.click();
  await page.getByRole('listbox', { name: 'Captured requests' }).waitFor({ state: 'visible' });
  assert.equal((await page.evaluate(() => window.apiTest.state())).detail, false);
  assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')), 'Captured requests');
  // Opening from the list keyboard moves focus into the detail, not to <body>.
  await page.keyboard.press('Enter');
  await back.waitFor({ state: 'visible' });
  assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')), 'Back to requests');
});

for (const closed of [false, true]) {
  test(`Escape below 600px closes the detail and returns focus to the list (S20, ${closed ? 'closed shadow' : 'document'})`, async t => {
    const page = await fixture(t, 420, closed);
    await page.evaluate(() => { window.apiTest.seedMixed(); window.apiTest.set({ apiDetailOpen: false }); });
    await page.waitForFunction(() => window.apiTest.q('.xray-api-row'));
    await page.evaluate(() => window.apiTest.focusLabel('Captured requests'));
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.apiTest.active() === 'Back to requests');
    // Focus somewhere deeper in the detail, then close it with Escape (panelKeyboard).
    await page.evaluate(() => window.apiTest.focusLabel('More actions'));
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => window.apiTest.state().detail === false);
    await page.waitForFunction(() => window.apiTest.active() === 'Captured requests');
    // The virtualizer re-renders rows once the list is visible again.
    await page.waitForFunction(() => { const id = window.apiTest.q('.xray-api-table-scroll').getAttribute('aria-activedescendant'); return id && window.apiTest.q('#' + id); });
    const list = await page.evaluate(() => {
      const box = window.apiTest.q('.xray-api-table-scroll');
      const id = box.getAttribute('aria-activedescendant');
      const option = id && window.apiTest.root.getElementById ? window.apiTest.root.getElementById(id) : window.apiTest.q('#' + id);
      const a = box.getBoundingClientRect(), o = option?.getBoundingClientRect();
      return { id, rendered: !!option, visible: !!o && o.top >= a.top - 1 && o.bottom <= a.bottom + 1 };
    });
    assert.equal(list.id, 'xray-api-option-mixed-ok');
    assert.equal(list.rendered, true, 'aria-activedescendant points at a rendered option');
    assert.equal(list.visible, true, 'the selected option is scrolled into view');
  });
}

// Below 600px the detail replaces the list. Whatever makes it appear while focus
// sits on the (now hidden) list — a stale persisted drawer flag picked up by
// ArrowDown, or a selection made from outside the list — must not drop focus to <body>.
for (const closed of [false, true]) {
  const surface = closed ? 'closed shadow' : 'document';
  test(`below 600px a stale drawer flag picked up by ArrowDown moves focus to Back, not <body> (${surface})`, async t => {
    const page = await fixture(t, 420, closed);
    await page.evaluate(() => window.apiTest.seedMixed());
    // apiDetailOpen is a persisted preference: it can be true while nothing is selected.
    await page.evaluate(() => window.apiTest.set({ apiDetailOpen: true, selectedId: null }));
    await page.waitForFunction(() => window.apiTest.q('.xray-api-row'));
    await page.evaluate(() => window.apiTest.focusLabel('Captured requests'));
    await page.keyboard.press('ArrowDown');
    await page.waitForFunction(() => window.apiTest.state().selected !== null);
    await page.waitForFunction(() => window.apiTest.active() === 'Back to requests', null, { timeout: 2000 });
    assert.equal(await page.evaluate(() => window.apiTest.q('.xray-api-collection-pane').getClientRects().length), 0, 'the detail replaced the list');
  });

  test(`below 600px a selection made outside the list moves focus off the hidden list to Back (${surface})`, async t => {
    const page = await fixture(t, 420, closed);
    await page.evaluate(() => { window.apiTest.seedMixed(); window.apiTest.set({ apiDetailOpen: false }); });
    await page.waitForFunction(() => window.apiTest.q('.xray-api-row'));
    await page.evaluate(() => window.apiTest.focusLabel('Captured requests'));
    // Global search / palette / finding evidence / Inspect in API all call selectEntry(id).
    await page.evaluate(() => window.apiTest.selectOther('mixed-error'));
    await page.waitForFunction(() => window.apiTest.active() === 'Back to requests', null, { timeout: 2000 });
  });
}

test('a selection made outside the list never inherits a stale "opened from list" focus move (S20)', async t => {
  const page = await fixture(t, 760);
  await page.evaluate(() => { window.apiTest.seedMixed(); window.apiTest.set({ apiDetailOpen: true }); });
  await page.locator('.xray-api-detail-drawer .xray-detail-content').waitFor({ state: 'visible' });
  // Clicking the already-selected, already-open row changes nothing...
  await page.locator('#xray-api-option-mixed-ok').click();
  await page.setViewportSize({ width: 420, height: 700 });
  await page.evaluate(() => window.apiTest.focusLabel('More actions'));
  // ...so a later palette/search-style selection must not pull focus to Back.
  await page.evaluate(() => window.apiTest.selectOther('mixed-error'));
  await page.waitForTimeout(100);
  assert.equal(await page.evaluate(() => window.apiTest.active()), 'More actions');
});

for (const width of [640, 760]) {
  test(`600-900px stacks list over detail with the list at least 40% (S20, ${width}px)`, async t => {
    const page = await fixture(t, width);
    await page.evaluate(() => { window.apiTest.seedMixed(); window.apiTest.set({ apiDetailOpen: true }); });
    await page.locator('.xray-api-detail-drawer .xray-detail-content').waitFor({ state: 'visible' });
    const layout = await page.evaluate(() => {
      const r = sel => document.querySelector(sel).getBoundingClientRect();
      const body = r('.xray-api-body'), list = r('.xray-api-collection-pane'), drawer = r('.xray-api-detail-drawer');
      const divider = [...document.querySelectorAll('[role="separator"]')].find(el => el.getClientRects().length);
      return { body: body.height, list: list.height, listBottom: list.bottom, drawerTop: drawer.top, drawerLeft: drawer.left, listLeft: list.left,
        drawerWidth: drawer.width, bodyWidth: body.width, orientation: divider?.getAttribute('aria-orientation'), contentHeight: r('.xray-api-detail-drawer .xray-detail-content').height };
    });
    assert.ok(layout.list >= layout.body * 0.4 - 1, JSON.stringify(layout));
    assert.ok(layout.drawerTop >= layout.listBottom - 1, 'detail sits below the list');
    assert.ok(Math.abs(layout.drawerLeft - layout.listLeft) <= 1 && layout.drawerWidth >= layout.bodyWidth - 1, 'detail spans the width');
    assert.equal(layout.orientation, 'horizontal', 'a horizontal split divider is the visible one');
    assert.ok(layout.contentHeight > 80, JSON.stringify(layout));
    const divider = page.getByRole('separator', { name: /Resize request list height/ });
    const before = Number(await divider.getAttribute('aria-valuenow'));
    assert.equal(await divider.getAttribute('aria-valuetext'), `List height ${before}%`);
    await divider.focus();
    await divider.press('ArrowDown');
    assert.ok(Number(await divider.getAttribute('aria-valuenow')) > before, 'ArrowDown grows the list');
    await divider.press('Home');
    assert.equal(Number(await divider.getAttribute('aria-valuenow')), 40, 'list never shrinks below 40%');
  });
}

test('summary is one line whose error and slow counts apply the filters (S16)', async t => {
  const page = await fixture(t, 1600);
  await page.evaluate(() => window.apiTest.seedMixed());
  const line = page.locator('.xray-api-summary-line');
  await line.waitFor();
  assert.equal(await page.locator('.xray-api-summary-pill').count(), 0, 'summary cards are gone');
  const text = (await line.textContent()).replace(/\s+/g, ' ').trim();
  assert.match(text, /^3 requests · 1 error · 1 slow · avg \d+ms · [\d.]+kb$/);
  const tops = await line.evaluate(el => [...el.children].map(child => { const r = child.getBoundingClientRect(); return Math.round(r.top + r.height / 2); }));
  assert.ok(tops.every(top => Math.abs(top - tops[0]) <= 2), `summary wraps: ${tops}`);
  assert.ok((await line.boundingBox()).height <= 34, 'summary is a single slim line');
  await page.getByRole('button', { name: 'Show 1 error' }).click();
  assert.equal((await page.evaluate(() => window.apiTest.state())).quick, 'errors');
  assert.match(await line.textContent(), /1 of 3 requests/);
  await page.getByRole('button', { name: 'Show 1 slow' }).click();
  assert.equal((await page.evaluate(() => window.apiTest.state())).quick, 'slow');
});

for (const width of [420, 760, 1600]) {
  test(`toolbar, single-line rows and detail header at ${width}px (S17-S19)`, async t => {
    const page = await fixture(t, width);
    await page.evaluate(open => { window.apiTest.seedMixed(); window.apiTest.set({ apiDetailOpen: open }); }, width >= 600);
    await page.getByRole('option').first().waitFor();
    const toolbar = await page.evaluate(() => {
      const top = el => { const r = el.getBoundingClientRect(); return Math.round(r.top + r.height / 2); };
      const tb = document.querySelector('.xray-api-toolbar');
      const search = tb.querySelector('input'), toggle = tb.querySelector('.xray-api-filters-collapsible button');
      const chips = [...tb.querySelectorAll('[aria-label="Primary API filters"] button')];
      return { searchTop: top(search.closest('label')), toggleTop: top(toggle), chipTops: chips.map(top), toolbarHeight: tb.getBoundingClientRect().height,
        toggleText: toggle.textContent, toggleWidth: toggle.getBoundingClientRect().width };
    });
    assert.equal(toolbar.toggleText, 'Filters & Sort');
    assert.ok(toolbar.toggleWidth <= 40, 'Filters & Sort is an icon toggle');
    if (width >= 600) assert.ok(toolbar.chipTops.every(top => Math.abs(top - toolbar.chipTops[0]) <= 2), 'quick chips stay on one line');
    if (width === 760) assert.ok(Math.abs(toolbar.searchTop - toolbar.toggleTop) <= 4 && Math.abs(toolbar.searchTop - toolbar.chipTops[0]) <= 4, `one toolbar row at full width: ${JSON.stringify(toolbar)}`);
    const rows = await page.evaluate(() => [...document.querySelectorAll('.xray-api-row')].map(row => {
      const rect = row.getBoundingClientRect();
      const path = row.querySelector('.xray-path').getBoundingClientRect();
      const actions = [...row.querySelectorAll('.xray-api-row-actions button')].map(b => ({ name: b.getAttribute('aria-label'), w: b.getBoundingClientRect().width, inside: b.getBoundingClientRect().right <= rect.right + 1 }));
      return { height: rect.height, pathLines: Math.round(path.height / parseFloat(getComputedStyle(row.querySelector('.xray-path')).lineHeight || 16)), actions };
    }));
    for (const row of rows) {
      assert.ok(row.height >= 40 && row.height <= 46, `row height ${row.height}`);
      assert.ok(row.actions.some(a => a.name === 'Copy request URL' && a.w > 0 && a.inside), JSON.stringify(row));
      assert.ok(row.actions.some(a => /Pin request|Unpin request/.test(a.name) && a.w > 0 && a.inside), JSON.stringify(row));
    }
    if (width < 600) await page.evaluate(() => window.apiTest.set({ apiDetailOpen: true }));
    await page.locator('.xray-api-detail-drawer .xray-detail-content').waitFor({ state: 'visible' });
    const detail = await page.evaluate(() => {
      const d = document.querySelector('.xray-api-detail-drawer');
      const group = d.querySelector('.xray-detail-hero [aria-label="Request actions"]');
      const rect = d.getBoundingClientRect();
      const tabs = d.querySelector('[aria-label="Request facets"]').getBoundingClientRect();
      const views = d.querySelector('[aria-label="Body views"]').getBoundingClientRect();
      const viewButtons = [...d.querySelectorAll('[aria-label="Body views"] button')].map(b => Math.round(b.getBoundingClientRect().top));
      const controls = [...d.querySelectorAll('.xray-detail-hero button, .xray-detail-nav button')].filter(b => b.getClientRects().length).map(b => { const r = b.getBoundingClientRect(); return r.left >= rect.left - 1 && r.right <= rect.right + 1; });
      return { inHeader: !!group, actionbar: d.querySelectorAll('.xray-detail-actionbar').length, sameRow: Math.abs(tabs.top - views.top) <= 4,
        viewRows: new Set(viewButtons).size, allInside: controls.every(Boolean), labels: [...group.querySelectorAll(':scope > button, :scope > div > button')].map(b => b.textContent.trim()) };
    });
    assert.equal(detail.inHeader, true, 'actions live in the detail header');
    assert.equal(detail.actionbar, 0);
    assert.deepEqual(detail.labels, ['Copy', 'Export', 'Console', 'More actions']);
    assert.equal(detail.viewRows, 1, 'the lens is one compact segmented row, never a grid');
    assert.equal(detail.allInside, true, 'no header/nav control is clipped');
    if (width === 1600) assert.equal(detail.sameRow, true, 'facets and lens share one row');
  });
}

test('JSON keys never shred; long values wrap inside the value (S21)', async t => {
  const page = await fixture(t);
  await page.evaluate(() => { window.apiTest.seedMixed(); window.apiTest.set({ apiDetailOpen: true }); });
  await page.locator('.xray-api-detail-drawer .xray-json-key').first().waitFor();
  const keys = await page.evaluate(() => [...document.querySelectorAll('.xray-api-detail-drawer .xray-json-row')].filter(row => row.querySelector('.xray-json-key')).map(row => {
    const key = row.querySelector('.xray-json-key');
    const value = row.querySelector('.xray-json-value');
    const lh = parseFloat(getComputedStyle(key).lineHeight);
    return { key: key.textContent, keyLines: Math.round(key.getBoundingClientRect().height / lh), valueLines: value ? Math.round(value.getBoundingClientRect().height / lh) : 0,
      keyClipped: key.scrollWidth > key.clientWidth + 1, rowInside: row.getBoundingClientRect().right <= row.parentElement.getBoundingClientRect().right + 1 };
  }));
  const path = keys.find(k => k.key === '"path"');
  assert.ok(path, JSON.stringify(keys));
  assert.equal(path.keyLines, 1, JSON.stringify(path));
  assert.ok(path.valueLines > 1, 'the long value wraps within itself');
  assert.ok(keys.every(k => k.keyLines === 1 && !k.keyClipped), JSON.stringify(keys));
});

test('wide API drawers preserve their existing fixed-height layout', async t => {
  const page = await fixture(t, 1600);
  await page.evaluate(() => { window.apiTest.seed(); window.apiTest.select(); });
  await page.locator('.xray-api-detail-drawer .xray-detail-content').waitFor({ state: 'visible' });
  assert.equal(await page.locator('.xray-api-drawer-body').evaluate(body => getComputedStyle(body).overflowY), 'hidden');
});
