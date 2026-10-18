import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { before, after } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';

// Logs tab layout (S22-S24): fixed 32px rows, Console's level chips, full-width list
// until a log is opened, then list | detail (> 900), stacked (600-900) or the
// detail alone with a way back (< 600).
const projectRoot = fileURLToPath(new URL('../../', import.meta.url));
const { outputFiles } = await build({
  stdin: {
    resolveDir: projectRoot,
    loader: 'jsx',
    contents: `
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      import { flushSync } from 'react-dom';
      import { EntriesWorkspace } from './src/panel/components/api/EntriesWorkspace';
      import { usePanelStore } from './src/panel/store';
      import { installPanelKeyboard } from './src/panel/runtime/panelKeyboard';
      import { serializePanelPreferences } from './src/panel/models/panelPersistence';
      import styles from './src/panel/styles.css';

      const levels = ['log', 'warn', 'error', 'info', 'log', 'warn'];
      const logs = levels.map((level, index) => ({
        id: 'lvl-' + index, type: 'log', logLevel: level, timestamp: 1700000000000 + index * 1111,
        message: index === 0 ? 'A deliberately long console message that must be cut with an ellipsis and never reach the timestamp or the pin action. '.repeat(3) : level + ' message ' + index,
      }));

      let root = document;
      installPanelKeyboard({ dismissible: true, getRoot: () => root });
      window.logsLayout = {
        active: () => { const a = root.activeElement; return a ? (a.getAttribute('aria-label') || a.tagName) : null; },
        focusList: () => root.querySelector('[aria-label="Captured logs"]').focus(),
        ready: () => !!root.querySelector('.xray-entry-row'),
        listShown: () => root.querySelector('.xray-list-panel').getClientRects().length > 0,
        store: () => { const s = usePanelStore.getState(); return { open: s.open, tab: s.activeTab, api: s.apiDetailOpen, log: s.logDetailOpen, selected: s.selectedId, persisted: Object.keys(serializePanelPreferences(s)) }; },
        set: (patch) => flushSync(() => usePanelStore.setState(patch)),
        addApi: (entry) => flushSync(() => usePanelStore.setState({ entries: [...usePanelStore.getState().entries, entry] })),
        select: (id, options) => flushSync(() => usePanelStore.getState().selectEntry(id, options)),
        clear: () => flushSync(() => usePanelStore.getState().clearSession()),
        setup(width, closed) {
          if (closed) root = document.body.appendChild(document.createElement('div')).attachShadow({ mode: 'closed' });
          const host = (closed ? root : document.body).appendChild(document.createElement('div'));
          const sheet = document.createElement('style'); sheet.textContent = styles; (closed ? root : document.head).appendChild(sheet);
          const state = usePanelStore.getState();
          usePanelStore.setState({
            open: true, activeTab: 'logs', selectedId: null, expandedId: null, entries: logs, apiDetailOpen: false,
            apiSearchQuery: '', pinnedIds: new Set(),
            settings: { ...state.settings, panelWidth: width, compactRows: false, firstRunDismissed: true },
          });
          host.className = 'xray-theme-scope xray-theme-xray-dark';
          const panel = host.appendChild(document.createElement('div'));
          panel.className = 'xray-panel xray-mode-window xray-open';
          panel.style.cssText = 'container-type:inline-size;container-name:xray;width:' + width + 'px;height:700px;display:block;position:relative;';
          flushSync(() => createRoot(panel).render(<EntriesWorkspace mode="logs" />));
        },
      };
    `,
  },
  bundle: true,
  format: 'iife',
  write: false,
  loader: { '.css': 'text' },
});

let browser;
before(async () => {
  const executablePath = process.env.XRAY_BROWSER_EXECUTABLE ||
    (!existsSync(chromium.executablePath()) && existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined);
  browser = await chromium.launch({ executablePath, headless: true });
});
after(async () => { await browser?.close(); });

async function fixture(t, width, closed = false) {
  const page = await browser.newPage({ viewport: { width: Math.max(width, 960), height: 800 } });
  t.after(() => page.close());
  await page.setContent('<style>body{margin:0}</style>');
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(([w, c]) => window.logsLayout.setup(w, c), [width, closed]);
  await page.waitForFunction(() => window.logsLayout.ready());
  return page;
}

const box = (page, selector) => page.locator(selector).first().evaluate(element => {
  const rect = element.getBoundingClientRect();
  return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height };
});

for (const width of [1600, 760, 420]) {
  test(`unselected Logs: full-width list, 32px rows, four non-overlapping tracks (${width}px)`, async t => {
    const page = await fixture(t, width);
    const section = await box(page, '.xray-logs-workspace');
    const list = await box(page, '.xray-list-panel');
    assert.ok(Math.abs(list.width - section.width) <= 1, `list ${list.width} should fill ${section.width}`);
    assert.equal(await page.locator('.xray-logs-detail').isVisible(), false, 'no detail pane before a log is opened');
    assert.equal(await page.locator('.xray-list-panel .xray-pane-divider').first().isVisible(), false);
    const rows = await page.locator('.xray-entry-row').evaluateAll(elements => elements.map(element => {
      const rect = element.getBoundingClientRect();
      const kids = [...element.children].map(child => child.getBoundingClientRect());
      return { height: rect.height, overflow: element.scrollWidth > element.clientWidth, kids: kids.map(k => [k.left, k.right]), columns: getComputedStyle(element).gridTemplateColumns.split(' ').length };
    }));
    assert.ok(rows.length >= 6);
    for (const row of rows) {
      assert.ok(Math.abs(row.height - 32) <= 0.5, `row height ${row.height}`);
      assert.equal(row.columns, 4);
      assert.equal(row.overflow, false);
      for (let i = 1; i < row.kids.length; i++) assert.ok(row.kids[i - 1][1] <= row.kids[i][0] + 0.5, 'tracks overlap');
    }
    // The long message is cut, not wrapped.
    assert.equal(await page.locator('.xray-entry-row .xray-path').first().evaluate(e => getComputedStyle(e).textOverflow), 'ellipsis');
  });

  test(`level chips match Console and filter the list (${width}px)`, async t => {
    const page = await fixture(t, width);
    const group = page.locator('[aria-label="Log level filters"]');
    assert.deepEqual(await group.locator('button').evaluateAll(b => b.map(x => x.textContent)), ['All6', 'Logs3', 'Warnings2', 'Errors1']);
    await group.getByRole('button', { name: /Warnings/ }).click();
    assert.equal(await page.locator('.xray-entry-row').count(), 2);
    await group.getByRole('button', { name: /Errors/ }).click();
    assert.equal(await page.locator('.xray-entry-row').count(), 1);
    await group.getByRole('button', { name: /All/ }).click();
    assert.equal(await page.locator('.xray-entry-row').count(), 6);
  });
}

test('wide: opening a log shows list | detail on one surface colour', async t => {
  const page = await fixture(t, 1600);
  await page.locator('.xray-entry-row').nth(1).click();
  await page.locator('.xray-log-detail').waitFor();
  const list = await box(page, '.xray-list-panel');
  const detail = await box(page, '.xray-logs-detail');
  assert.ok(list.right <= detail.left + 1, 'detail sits beside the list');
  assert.ok(list.width < 1000);
  const colors = await page.evaluate(() => [getComputedStyle(document.querySelector('.xray-list-panel')).backgroundColor, getComputedStyle(document.querySelector('.xray-logs-detail')).backgroundColor]);
  assert.equal(colors[0], colors[1]);
  assert.equal(await page.locator('.xray-logs-detail-back').isVisible(), false);
});

test('stacked: 760px puts the detail under the list with a row divider', async t => {
  const page = await fixture(t, 760);
  await page.locator('.xray-entry-row').nth(1).click();
  await page.locator('.xray-log-detail').waitFor();
  const list = await box(page, '.xray-list-panel');
  const detail = await box(page, '.xray-logs-detail');
  assert.ok(list.bottom <= detail.top + 1, 'detail is below the list');
  assert.ok(Math.abs(list.width - detail.width) <= 1);
  assert.equal(await page.getByRole('separator', { name: /Resize log list height/ }).isVisible(), true);
});

test('narrow: the detail replaces the list; Back and the keyboard return to it', async t => {
  const page = await fixture(t, 420);
  await page.locator('.xray-entry-row').nth(1).click();
  await page.locator('.xray-log-detail').waitFor();
  assert.equal(await page.locator('.xray-list-panel').isVisible(), false);
  const detail = await box(page, '.xray-logs-detail');
  const section = await box(page, '.xray-logs-workspace');
  assert.ok(Math.abs(detail.height - section.height) <= 1, 'full height');
  assert.equal(await page.locator('.xray-log-close').isVisible(), false);
  const back = page.getByRole('button', { name: 'Back to logs' });
  assert.equal(await back.isVisible(), true);
  await back.click();
  await page.locator('.xray-entry-row').first().waitFor();
  assert.equal(await page.locator('.xray-logs-detail').isVisible(), false);
  assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('role')), 'listbox');
});

test('wide: the header close dismisses the detail and the list takes the full width again', async t => {
  const page = await fixture(t, 1600);
  await page.locator('.xray-entry-row').nth(1).click();
  await page.getByRole('button', { name: 'Close selected log detail' }).click();
  assert.equal(await page.locator('.xray-logs-detail').isVisible(), false);
  const section = await box(page, '.xray-logs-workspace');
  const list = await box(page, '.xray-list-panel');
  assert.ok(Math.abs(list.width - section.width) <= 1);
});

const apiEntry = { id: 'api-1', type: 'api', method: 'GET', status: 200, url: 'https://example.test/a', urlPath: '/a', source: 'fetch', timestamp: 1700000000000, duration: 5 };
const store = page => page.evaluate(() => window.logsLayout.store());

test('opening a log never touches the API drawer flag, and the log flag is not persisted', async t => {
  const page = await fixture(t, 1600);
  await page.evaluate(entry => window.logsLayout.addApi(entry), apiEntry);
  await page.locator('.xray-entry-row').nth(1).click();
  let state = await store(page);
  assert.equal(state.log, true);
  assert.equal(state.api, false, 'selecting a log must not open the API drawer');
  assert.ok(!state.persisted.includes('logDetailOpen'));
  // Back on API, arrow-style selection (openDetail:false) must not open a drawer.
  await page.evaluate(() => { window.logsLayout.set({ activeTab: 'api' }); window.logsLayout.select('api-1', { openDetail: false }); });
  state = await store(page);
  assert.equal(state.api, false);
});

test('Escape: an open API drawer does not stop Logs from dismissing the panel; an open log detail closes first', async t => {
  const page = await fixture(t, 1600);
  await page.evaluate(entry => window.logsLayout.addApi(entry), apiEntry);
  // (a) API drawer flag set, Logs tab, no log selected.
  await page.evaluate(() => window.logsLayout.set({ apiDetailOpen: true, selectedId: null }));
  await page.keyboard.press('Escape');
  let state = await store(page);
  assert.equal(state.api, true, 'Logs Escape must not flip the API flag');
  assert.equal(state.open, false, 'panel dismissed');
  // Open log detail: Escape closes just the detail.
  await page.evaluate(() => window.logsLayout.set({ open: true, apiDetailOpen: false }));
  await page.locator('.xray-entry-row').nth(1).click();
  await page.keyboard.press('Escape');
  state = await store(page);
  assert.equal(state.log, false);
  assert.equal(state.open, true);
  await page.locator('.xray-logs-detail').waitFor({ state: 'hidden' });
});

test('a level filter that hides the open log clears the selection and its detail', async t => {
  const page = await fixture(t, 1600);
  await page.locator('.xray-entry-row').first().click(); // a plain log
  await page.locator('.xray-log-detail').waitFor();
  await page.locator('[aria-label="Log level filters"]').getByRole('button', { name: /Errors/ }).click();
  const state = await store(page);
  assert.equal(state.selected, null);
  assert.equal(state.log, false);
  assert.equal(await page.locator('.xray-logs-detail').isVisible(), false);
});

// Below 600px the log detail replaces the list. A stale logDetailOpen (Clear, a
// selection on another tab, an evicted log) must not make the next arrow selection
// swap in the detail; a selection made from outside the list while the list has
// focus must move focus to Back instead of dropping it to <body>.
for (const closed of [false, true]) {
  const surface = closed ? 'closed shadow' : 'document';
  test(`below 600px a stale log-detail flag is reset, so ArrowDown keeps the list and its focus (${surface})`, async t => {
    const page = await fixture(t, 420, closed);
    await page.evaluate(entry => window.logsLayout.addApi(entry), apiEntry);
    // A log detail was open, then an API entry got selected elsewhere.
    await page.evaluate(() => window.logsLayout.set({ logDetailOpen: true, selectedId: 'api-1' }));
    await page.waitForFunction(() => window.logsLayout.store().log === false);
    await page.evaluate(() => window.logsLayout.focusList());
    await page.keyboard.press('ArrowDown');
    await page.waitForFunction(() => window.logsLayout.store().selected?.startsWith('lvl-'));
    assert.equal(await page.evaluate(() => window.logsLayout.listShown()), true, 'the list is not replaced by an unrequested detail');
    assert.equal(await page.evaluate(() => window.logsLayout.active()), 'Captured logs');
    // Clear resets it too.
    await page.evaluate(() => { window.logsLayout.set({ logDetailOpen: true }); });
    await page.evaluate(() => window.logsLayout.clear());
    assert.equal((await store(page)).log, false, 'clearing the session resets the log detail flag');
  });

  test(`below 600px a selection made outside the list moves focus off the hidden list to Back (${surface})`, async t => {
    const page = await fixture(t, 420, closed);
    await page.evaluate(() => window.logsLayout.focusList());
    // Global search / palette select a log while the list has focus.
    await page.evaluate(() => window.logsLayout.select('lvl-2'));
    await page.waitForFunction(() => window.logsLayout.active() === 'Back to logs', null, { timeout: 2000 });
    assert.equal(await page.evaluate(() => window.logsLayout.listShown()), false, 'the detail replaced the list');
  });
}
