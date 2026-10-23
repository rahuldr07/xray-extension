import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { before, after } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { PANEL_CSS } from '../helpers/panel-css.mjs';
import { setStandardsContent } from '../helpers/standards-page.mjs';

// Exercise the real list pipeline, store, shared stylesheet and React components.
// Only clipboard transport is substituted; all request data is synthetic.
const { outputFiles } = await build({
  stdin: {
    resolveDir: fileURLToPath(new URL('../../', import.meta.url)), loader: 'jsx',
    contents: `
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      import { flushSync } from 'react-dom';
      import { EntriesWorkspace } from './src/panel/components/api/EntriesWorkspace';
      import { usePanelStore } from './src/panel/store';
      const styles = ${JSON.stringify(PANEL_CSS)};
      const root = window.closedFixture ? document.body.appendChild(document.createElement('div')).attachShadow({mode:'closed'}) : document.body;
      root.appendChild(document.createElement('style')).textContent = styles;
      const api = (id, extra = {}) => ({ id, type: 'api', method: 'GET', status: 200,
        url: 'https://example.test/widgets', urlPath: '/widgets', source: 'fetch',
        timestamp: 1700000000000 + Number(id.replace(/\\D/g, '') || 0), duration: 100, size: 20,
        responseRaw: '{"synthetic":true}', ...extra });
      usePanelStore.setState({ open: true, activeTab: 'api', apiGroupingMode: 'endpoint' });
      flushSync(() => createRoot(root.appendChild(document.createElement('div'))).render(
        <div className="xray-theme-scope xray-theme-xray-dark" style={{'--xray-font':'monospace'}}>
          <div className="xray-panel xray-mode-window xray-open"><EntriesWorkspace mode="api" /></div>
        </div>
      ));
      window.apiFiltersTest = {
        root,
        seed() { flushSync(() => {
          const s = usePanelStore.getState();
          s.addEntry(api('a1', {method:'POST', status:404, source:'xhr', duration:900}));
          s.addEntry(api('a2', {method:'POST', status:404, source:'xhr', duration:901}));
          s.restoreEntries([api('a3', {method:'POST', status:404, source:'xhr', duration:900})]);
          s.addEntry(api('a4', {urlPath:'/other', url:'https://example.test/other', status:200}));
          s.addEntry({id:'log1', type:'log', timestamp:1700000000000, message:'synthetic'});
          s.togglePinned('a1');
          s.selectEntry('a1', {openDetail:false});
          s.updateSettings({slowThresholdMs:900});
        }); },
        many() { flushSync(() => { const s = usePanelStore.getState(); s.setApiGroupingMode('flat');
          for (let i=0; i<150; i++) s.addEntry(api('many'+i, {urlPath:'/many/'+i})); }); },
        arrive() { flushSync(() => usePanelStore.getState().addEntry(api('new999', {urlPath:'/new'}))); },
        state() { const s = usePanelStore.getState(); return { ids:s.entries.map(e=>e.id), pins:[...s.pinnedIds],
          selected:s.selectedId, sort:s.sortField, order:s.sortOrder, grouping:s.apiGroupingMode,
          query:s.apiSearchQuery, quick:s.apiQuickFilter, methods:[...s.methodFilters],
          sources:[...s.typeFilters], statuses:[...s.statusFilters], detail:s.apiDetailOpen, toast:s.toastMessage }; },
        denyCopy() { Object.defineProperty(navigator, 'clipboard', {configurable:true, value:{writeText:async()=>{throw new Error('Synthetic clipboard denial');}}}); },
        acceptCopy() { Object.defineProperty(navigator, 'clipboard', {configurable:true, value:{writeText:async text=>{window.copiedUrl=text;}}}); },
      };
    `,
  },
  loader: { '.css': 'text' }, bundle: true, format: 'iife', write: false,
});

let browser;
before(async () => {
  const executablePath = process.env.XRAY_BROWSER_EXECUTABLE ||
    (!existsSync(chromium.executablePath()) && existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined);
  browser = await chromium.launch({ executablePath, headless: true });
});
after(async () => { await browser?.close(); });

async function fixture(t, width = 960, closed = false) {
  const page = await browser.newPage({ viewport: { width, height: 700 } });
  t.after(() => page.close());
  await setStandardsContent(page, '<style>body { margin:0 }</style>');
  await page.evaluate(value => { window.closedFixture = value; }, closed);
  await page.addScriptTag({ content: outputFiles[0].text });
  return page;
}
const search = page => page.getByRole('textbox', { name: 'Search API requests' });
// S16 summary line: "4 requests" unfiltered, "3 of 4 requests" while filtering.
const countText = (n, m) => n === m ? m + ' request' + (m === 1 ? '' : 's') : n + ' of ' + m + ' request' + (m === 1 ? '' : 's');
const count = (page, n, m = 4) => page.getByRole('status').filter({ hasText: new RegExp('^' + countText(n, m) + '$') }).waitFor();
const state = page => page.evaluate(() => window.apiFiltersTest.state());

test('default quick filters stay available and counts track requests before endpoint collapse', async t => {
  const page = await fixture(t);
  await page.evaluate(() => window.apiFiltersTest.seed());
  await count(page, 4);
  assert.equal(await page.getByRole('option').count(), 2, 'four requests collapse into two endpoint rows');
  const disclosure = page.getByRole('button', { name: 'Filters & Sort', exact: true });
  assert.equal(await disclosure.getAttribute('aria-expanded'), 'false');
  for (const label of ['All', 'Errors', 'Slow', 'Pinned']) {
    assert.equal(await page.getByRole('button', { name: label, exact: true }).isVisible(), true);
  }
  await page.getByRole('button', { name: 'Slow', exact: true }).click();
  await count(page, 3);
  await page.getByRole('button', { name: 'Expand endpoint group' }).click();
  await count(page, 3);
  assert.equal(await page.getByRole('option').count(), 3);
  await page.getByRole('button', { name: 'Pinned', exact: true }).click();
  await count(page, 1);
});

test('secondary chips survive collapse, remove one predicate and clear preserves investigation state', async t => {
  const page = await fixture(t);
  await page.evaluate(() => window.apiFiltersTest.seed());
  await search(page).fill('widgets');
  await page.getByRole('button', { name: 'Filters & Sort', exact: true }).click();
  for (const name of ['POST', 'XHR', '4xx', 'Replays']) await page.getByRole('button', { name, exact: true }).click();
  await count(page, 0);
  await page.getByRole('button', { name: 'Slowest', exact: true }).click();
  await page.getByRole('button', { name: 'Filters & Sort', exact: true }).click();
  for (const name of ['Remove search filter', 'Remove POST filter', 'Remove XHR filter', 'Remove 4xx filter', 'Remove Replays filter']) {
    assert.equal(await page.getByRole('button', { name, exact: true }).isVisible(), true);
  }
  await page.getByRole('button', { name: 'Remove Replays filter', exact: true }).click();
  await count(page, 3);
  const before = await state(page);
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
  await count(page, 4);
  const after = await state(page);
  for (const key of ['ids', 'pins', 'selected', 'sort', 'order', 'grouping', 'detail']) assert.deepEqual(after[key], before[key], key);
  assert.deepEqual([after.query, after.quick, after.methods, after.sources, after.statuses], ['', 'all', [], [], []]);
  assert.equal(after.sort, 'duration');
  assert.equal(after.grouping, 'endpoint');
});

test('filtered-empty clears search without onboarding and keeps the selected pinned request', async t => {
  const page = await fixture(t, 420);
  await page.getByText('Listening for traffic', { exact: true }).waitFor();
  await page.evaluate(() => window.apiFiltersTest.seed());
  await search(page).fill('no-synthetic-match');
  await count(page, 0);
  await page.getByText('No matching API requests', { exact: true }).waitFor();
  assert.equal(await page.getByText('Listening for traffic', { exact: true }).count(), 0);
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
  await count(page, 4);
  assert.equal((await state(page)).selected, 'a1');
  assert.deepEqual((await state(page)).pins, ['a1']);
});

test('virtualized keyboard selection, opening, resize and new-arrival jump survive compact filters', async t => {
  const page = await fixture(t, 1600);
  await page.evaluate(() => window.apiFiltersTest.many());
  await count(page, 150, 150);
  assert.ok(await page.getByRole('option').count() < 150, 'requests remain virtualized');
  const list = page.getByRole('listbox', { name: 'Captured requests' });
  await list.focus();
  for (const [key, selected] of [['Home', 'many149'], ['ArrowDown', 'many148'], ['PageDown', 'many138'],
    ['PageUp', 'many148'], ['ArrowUp', 'many149'], ['End', 'many0']]) {
    await list.press(key);
    assert.equal((await state(page)).selected, selected);
    assert.equal((await state(page)).detail, false);
  }
  await page.waitForFunction(() => window.apiFiltersTest.root.querySelector('.xray-api-table-scroll').scrollTop > 120);
  await list.dispatchEvent('scroll');
  await page.evaluate(() => window.apiFiltersTest.arrive());
  await page.getByRole('button', { name: '1 new', exact: true }).click();
  await page.waitForFunction(() => window.apiFiltersTest.root.querySelector('.xray-api-table-scroll').scrollTop === 0);
  const divider = page.getByRole('separator', { name: 'Resize request list' });
  await divider.focus();
  const previous = Number(await divider.getAttribute('aria-valuenow'));
  const max = Number(await divider.getAttribute('aria-valuemax'));
  const direction = previous >= max ? -1 : 1;
  await divider.press(direction < 0 ? 'ArrowLeft' : 'ArrowRight');
  await page.waitForFunction(({ previous, direction }) => {
    const divider = window.apiFiltersTest.root.querySelector('[role="separator"]');
    return (Number(divider.getAttribute('aria-valuenow')) - previous) * direction > 0;
  }, { previous, direction });
  await list.focus();
  await list.press('Space');
  assert.equal((await state(page)).detail, true);
});

test('URL copy reports denied and accepted writes truthfully without changing selection', async t => {
  const page = await fixture(t);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.evaluate(() => { window.apiFiltersTest.seed(); window.apiFiltersTest.denyCopy(); });
  await page.getByRole('button', { name: 'Copy request URL', exact: true }).first().click();
  await page.waitForFunction(() => /could not copy/i.test(window.apiFiltersTest.state().toast));
  assert.equal((await state(page)).selected, 'a1');
  assert.deepEqual(errors, [], 'denied clipboard must not become an unhandled rejection');
  await page.evaluate(() => window.apiFiltersTest.acceptCopy());
  await page.getByRole('button', { name: 'Copy request URL', exact: true }).first().click();
  await page.waitForFunction(() => window.apiFiltersTest.state().toast === 'Request URL copied.');
  assert.equal(await page.evaluate(() => window.copiedUrl), 'https://example.test/widgets');
});

test('closed-shadow disclosure and removable chips work from the keyboard', async t => {
  const page = await fixture(t, 420, true);
  await page.evaluate(() => {
    window.apiFiltersTest.seed();
    const button = [...window.apiFiltersTest.root.querySelectorAll('button')].find(el => el.textContent === 'Filters & Sort');
    button.focus();
  });
  await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(() => window.apiFiltersTest.root.querySelector('.xray-api-filters-collapsible button').getAttribute('aria-expanded')), 'true');
  await page.evaluate(() => [...window.apiFiltersTest.root.querySelectorAll('button')].find(el => el.textContent === 'POST').focus());
  await page.keyboard.press('Space');
  assert.deepEqual((await state(page)).methods, ['POST']);
  await page.evaluate(() => window.apiFiltersTest.root.querySelector('.xray-api-filters-collapsible button').focus());
  await page.keyboard.press('Enter');
  await page.evaluate(() => window.apiFiltersTest.root.querySelector('[aria-label="Remove POST filter"]').focus());
  await page.keyboard.press('Enter');
  assert.deepEqual((await state(page)).methods, []);
  assert.equal(await page.evaluate(() => window.apiFiltersTest.root.querySelector('.xray-api-request-count').textContent === '4 requests'), true);
  // S20 in a closed shadow root at 420px: opening from the list focuses Back, and
  // Back returns to a rendered, focused list.
  await page.evaluate(() => window.apiFiltersTest.root.querySelector('.xray-api-table-scroll').focus());
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.apiFiltersTest.root.activeElement?.getAttribute('aria-label') === 'Back to requests');
  assert.equal((await state(page)).detail, true);
  assert.equal(await page.evaluate(() => window.apiFiltersTest.root.querySelector('.xray-api-collection-pane').getClientRects().length), 0, 'list replaced by detail');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.apiFiltersTest.root.activeElement?.getAttribute('aria-label') === 'Captured requests');
  assert.equal((await state(page)).detail, false);
  assert.ok(await page.evaluate(() => window.apiFiltersTest.root.querySelector('.xray-api-collection-pane').getClientRects().length > 0));
  assert.equal(await page.evaluate(() => window.apiFiltersTest.root.querySelector('.xray-api-table-scroll').getAttribute('aria-activedescendant')), 'xray-api-option-a1');
  // The list is virtualized: rows render after the remounted scroll pane is measured, a frame
  // or more after aria-activedescendant is set, so wait for the row rather than reading once.
  await assert.doesNotReject(
    page.waitForFunction(() => !!window.apiFiltersTest.root.querySelector('#xray-api-option-a1'), null, { timeout: 5000 }),
    'the selected option is rendered again',
  );
});

test('compact filters and collapsed secondary chips stay reachable across supported panel widths', async t => {
  for (const width of [360, 420, 760, 960, 1600]) {
    const page = await fixture(t, width);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.evaluate(() => window.apiFiltersTest.seed());
    await search(page).fill('widgets');
    const disclosure = page.getByRole('button', { name: 'Filters & Sort', exact: true });
    await disclosure.focus();
    await disclosure.press('Enter');
    await page.getByRole('button', { name: 'POST', exact: true }).click();
    await disclosure.press('Enter');
    await count(page, 3);
    const layout = await page.locator('.xray-api-toolbar').evaluate(toolbar => {
      const pane = toolbar.closest('.xray-api-collection-pane').getBoundingClientRect();
      const controls = [...toolbar.querySelectorAll('input, button')];
      return controls.map(control => {
        const rect = control.getBoundingClientRect();
        return { name: control.getAttribute('aria-label') || control.textContent, reachable: rect.width > 0 && rect.left >= pane.left - 1 && rect.right <= pane.right + 1 };
      });
    });
    assert.ok(layout.every(control => control.reachable), JSON.stringify({ width, layout }));
    assert.equal(await page.getByRole('button', { name: 'Remove POST filter', exact: true }).isVisible(), true);
    await page.close();
  }
});
