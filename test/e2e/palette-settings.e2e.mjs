import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { before, after } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';

const { outputFiles } = await build({
  stdin: {
    resolveDir: fileURLToPath(new URL('../../', import.meta.url)), loader: 'jsx',
    contents: `
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      import { flushSync } from 'react-dom';
      import { CommandPalette } from './src/panel/components/shell/CommandPalette';
      import { SettingsModal } from './src/panel/components/settings/SettingsModal';
      import { ConfirmationModal } from './src/panel/components/common/ConfirmationModal';
      import { installPanelKeyboard } from './src/panel/runtime/panelKeyboard';
      import { usePanelStore } from './src/panel/store';
      const errors = [];
      window.addEventListener('unhandledrejection', event => { errors.push(String(event.reason)); event.preventDefault(); });
      window.paletteTest = {
        setup(shadow, css) {
          const host = document.body.appendChild(document.createElement('div'));
          this.root = shadow ? host.attachShadow({ mode: 'closed' }) : document;
          const style = document.createElement('style'); style.textContent = css;
          (shadow ? this.root : document.head).appendChild(style);
          const mount = shadow ? this.root.appendChild(document.createElement('div')) : host;
          usePanelStore.setState({ open: true, toastMessage: '', entries: [], selectedId: null });
          installPanelKeyboard({ dismissible: false, getRoot: () => this.root });
          flushSync(() => createRoot(mount).render(<><SettingsModal /><CommandPalette /><ConfirmationModal /></>));
        },
        set(state) { flushSync(() => usePanelStore.setState(state)); },
        settings(patch) { flushSync(() => usePanelStore.getState().updateSettings(patch)); },
        openSettings(section) { flushSync(() => usePanelStore.getState().openSettings(section)); },
        click(text) {
          const button = [...this.root.querySelectorAll('button')].find(el => el.textContent.trim() === text || el.getAttribute('aria-label') === text);
          if (!button) throw new Error('No button: ' + text);
          button.click();
        },
        focus(selector) { this.root.querySelector(selector).focus(); },
        snapshot() {
          const s = usePanelStore.getState();
          return {
            rows: [...this.root.querySelectorAll('.xray-command-row')].map(el => ({ label: el.querySelector('.xray-command-label').textContent, active: el.classList.contains('active'), group: el.querySelector('small')?.textContent || null })),
            headers: [...this.root.querySelectorAll('.xray-command-group > .xray-command-group-label')].map(el => el.textContent),
            settings: s.settings, aiSettings: s.aiSettings, entries: s.entries, selectedId: s.selectedId,
             commandOpen: s.commandOpen, settingsOpen: s.settingsOpen, consoleDraft: s.consoleDraft,
             activeTab: s.activeTab, toast: s.toastMessage, errors,
             buttons: [...this.root.querySelectorAll('button')].map(el => el.textContent.trim()),
             live:[...this.root.querySelectorAll('[aria-live]')].map(el=>el.textContent),
             text: this.root.querySelector('[role="dialog"]')?.textContent || '',
          };
        },
      };
    `,
  }, bundle: true, format: 'iife', write: false,
});

let browser;
before(async () => {
  const executablePath = process.env.XRAY_BROWSER_EXECUTABLE || (!existsSync(chromium.executablePath()) && existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined);
  browser = await chromium.launch({ executablePath, headless: true });
});
after(async () => { await browser?.close(); });

const css = readFileSync(new URL('../../src/panel/styles.css', import.meta.url), 'utf8');
const entry = (id, path) => ({ id, type: 'api', timestamp: 1700000000000, method: 'GET', urlPath: path, url: `https://synthetic.test${path}`, status: 200, duration: 30, responseRaw: '{}' });
async function fixture(t, shadow = false) {
  const page = await browser.newPage();
  page.setDefaultTimeout(3000);
  t.after(() => page.close());
  await page.setContent('<div></div>');
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(({ shadow, css }) => window.paletteTest.setup(shadow, css), { shadow, css });
  return page;
}
const set = (page, state) => page.evaluate(state => window.paletteTest.set(state), state);
const snapshot = page => page.evaluate(() => window.paletteTest.snapshot());
const click = (page, text) => page.evaluate(text => window.paletteTest.click(text), text);
const focus = (page, selector) => page.evaluate(selector => window.paletteTest.focus(selector), selector);
async function query(page, text) {
  await focus(page, '.xray-command-search input');
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText(text);
}
const activeRow = state => state.rows.find(row => row.active);

for (const shadow of [false, true]) {
  const surface = shadow ? 'closed shadow' : 'document';
  test(`palette ranks globally and executes displayed order with keyboard (${surface})`, async t => {
    const page = await fixture(t, shadow);
    await set(page, { entries: [entry('weak', '/s-c-h-e-m-a')], selectedId: 'weak', commandOpen: true });
    assert.ok((await snapshot(page)).headers.includes('Requests'), 'empty query is grouped');
    await query(page, 'schema');
    let state = await snapshot(page);
    assert.equal(state.rows[0].label, 'Prepare schema(res)', 'strong Console match beats weak earlier Request/Selection matches');
    assert.equal(state.headers.length, 0, 'searched results are flat');
    assert.equal(state.rows[0].group, 'Console');
    assert.equal(activeRow(state).label, state.rows[0].label);
    await page.keyboard.press('End');
    state = await snapshot(page);
    assert.equal(activeRow(state).label, state.rows.at(-1).label);
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowDown');
    state = await snapshot(page);
    assert.equal(activeRow(state).label, state.rows[1].label);
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('Enter');
    state = await snapshot(page);
    assert.equal(state.consoleDraft, 'schema(res)');
    assert.equal(state.activeTab, 'console');
    assert.equal(state.selectedId, 'weak', 'preparation preserves request context');
    assert.equal(state.commandOpen, false);
  });

  test(`palette keeps icon clear of the input, truncates long rows and names the selection once (${surface})`, async t => {
    const page = await fixture(t, shadow);
    await page.setViewportSize({ width: 420, height: 900 });
    const path = `/long/${'segment-'.repeat(20)}end`;
    await set(page, { entries: [entry('long', path)], selectedId: 'long', commandOpen: true });
    const state = await snapshot(page);
    assert.deepEqual(state.headers.filter(h => h.startsWith('GET ')), [`GET ${path}`], 'selection heading is the request, once');
    assert.ok(!state.headers.includes('Selection'));
    for (const label of ['Replay', 'Edit & replay', 'Explain']) assert.ok(state.rows.some(row => row.label === label), label);
    assert.ok(!state.rows.some(row => row.label.includes(path) && row.label !== `GET ${path}`), 'actions carry no request path');
    const geometry = await page.evaluate(() => {
      const root = window.paletteTest.root;
      const icon = root.querySelector('.xray-command-search svg').getBoundingClientRect();
      const input = root.querySelector('.xray-command-search input').getBoundingClientRect();
      const list = root.querySelector('.xray-command-list').getBoundingClientRect();
      const heading = root.querySelector('.xray-command-group-label.request');
      const rows = [...root.querySelectorAll('.xray-command-row')].map(row => ({ right: row.getBoundingClientRect().right, label: row.querySelector('.xray-command-label') }));
      return {
        inputPad: parseFloat(getComputedStyle(root.querySelector('.xray-command-search input')).paddingLeft), iconRight: icon.right, inputLeft: input.left, listRight: list.right,
        headingClipped: heading.scrollWidth > heading.clientWidth,
        rowsInside: rows.every(row => row.right <= list.right + 0.5),
        labelClipped: rows.some(row => row.label.scrollWidth > row.label.clientWidth),
      };
    });
    assert.ok(geometry.iconRight <= geometry.inputLeft, 'search icon does not overlap the input');
    assert.ok(geometry.inputPad < 12, 'input is not indented past the icon a second time');
    assert.ok(geometry.rowsInside, 'rows stay inside the list');
    assert.ok(geometry.headingClipped, 'long selection heading ellipsizes');
    assert.ok(geometry.labelClipped, 'long request label ellipsizes');
  });

  test(`live shrinking results clamp selection and empty results never execute (${surface})`, async t => {
    const page = await fixture(t, shadow);
    const entries = Array.from({ length: 6 }, (_, i) => entry(`match-${i}`, `/zzneedle/${i}`));
    await set(page, { entries, commandOpen: true });
    await query(page, 'zzneedle');
    await page.keyboard.press('End');
    assert.equal(activeRow(await snapshot(page)).label, 'GET /zzneedle/0');
    await set(page, { entries: entries.slice(0, 2) });
    let state = await snapshot(page);
    assert.equal(state.rows.length, 2);
    assert.equal(activeRow(state)?.label, state.rows.at(-1).label, 'selection clamps to a remaining displayed row');
    await page.keyboard.press('Enter');
    state = await snapshot(page);
    assert.equal(state.selectedId, 'match-0');
    await set(page, { commandOpen: true, entries: [] });
    await query(page, 'no-synthetic-match-xyz');
    for (const key of ['End', 'ArrowUp', 'ArrowDown', 'Home', 'Enter']) await page.keyboard.press(key);
    state = await snapshot(page);
    assert.equal(state.rows.length, 0);
    assert.equal(state.commandOpen, true);
    assert.equal(state.selectedId, 'match-0');
    await query(page, 'schema');
    assert.equal(activeRow(await snapshot(page)).label, 'Prepare schema(res)', 'new query starts on the first match');
  });
}

test('palette prepares the configured slow command and live settings update its label', async t => {
  const page = await fixture(t);
  await page.evaluate(() => window.paletteTest.settings({ slowThresholdMs: 900 }));
  await set(page, { commandOpen: true });
  await query(page, '$slow');
  assert.equal((await snapshot(page)).rows[0].label, 'Prepare $slow(900)');
  await page.evaluate(() => window.paletteTest.settings({ slowThresholdMs: 1200 }));
  assert.equal((await snapshot(page)).rows[0].label, 'Prepare $slow(1200)');
  await page.keyboard.press('Enter');
  assert.equal((await snapshot(page)).consoleDraft, '$slow(1200)');
});

for (const shadow of [false, true]) {
  test(`palette hides replay actions for non-replayable selection and announces active results (${shadow ? 'closed shadow' : 'document'})`, async t => {
    const page = await fixture(t, shadow);
    await set(page, { entries: [{ id: 'stream', type: 'api', method: 'GET', source: 'ws', url: 'wss://synthetic.test/live', urlPath: '/live' }], selectedId: 'stream', commandOpen: true });
    const streamState = await snapshot(page);
    assert.equal(streamState.rows.some(row => /replay/i.test(row.label)), false);
    await query(page, 'schema');
    assert.ok((await snapshot(page)).live.some(text => /active result/i.test(text)));
    await set(page, { entries: [{ id: 'log', type: 'log', logLevel: 'info', message: 'captured log' }], selectedId: 'log', commandOpen: true });
    assert.equal((await snapshot(page)).rows.some(row => /replay/i.test(row.label)), false);
  });
}

for (const close of ['Done', 'Escape', 'Close Settings']) {
  test(`settings apply before closing with ${close} and never claim saving`, async t => {
    const page = await fixture(t);
    await page.evaluate(() => window.paletteTest.openSettings('general'));
    const initial = (await snapshot(page)).settings.confirmDestructiveActions;
    await click(page, 'Confirm destructive actions');
    let state = await snapshot(page);
    assert.equal(state.settings.confirmDestructiveActions, !initial, 'valid edits apply with dialog open');
    assert.ok(state.text.includes('Changes apply immediately.'));
    assert.ok(!state.buttons.includes('Save'));
    assert.ok(!state.buttons.includes('Cancel'));
    if (close === 'Escape') await page.keyboard.press('Escape');
    else await click(page, close);
    state = await snapshot(page);
    assert.equal(state.settingsOpen, false);
    assert.equal(state.settings.confirmDestructiveActions, !initial);
    assert.equal(state.toast, '');
    await page.evaluate(() => window.paletteTest.openSettings('general'));
    assert.equal((await snapshot(page)).settings.confirmDestructiveActions, !initial);
  });
}

test('numeric drafts stay local until valid blur/Enter, invalid drafts cannot trim captures', async t => {
  const page = await fixture(t);
  const entries = Array.from({ length: 70 }, (_, i) => entry(`numeric-${i}`, `/numeric/${i}`));
  await set(page, { entries });
  await page.evaluate(() => window.paletteTest.openSettings('capture'));
  const input = page.getByRole('spinbutton');
  const original = (await snapshot(page)).settings.maxEntries;
  await input.fill('');
  assert.equal((await snapshot(page)).settings.maxEntries, original);
  await input.fill('2');
  assert.equal((await snapshot(page)).entries.length, 70);
  await input.fill('2000');
  await input.press('Enter');
  assert.equal((await snapshot(page)).settings.maxEntries, 2000);
  await input.fill('');
  await input.press('Tab');
  assert.equal((await snapshot(page)).settings.maxEntries, 2000);
  await input.fill('2');
  await input.press('Escape');
  assert.equal((await snapshot(page)).settings.maxEntries, 2000);
  assert.equal((await snapshot(page)).entries.length, 70);
  await page.evaluate(() => window.paletteTest.openSettings('capture'));
  await page.getByRole('spinbutton').fill('');
  await click(page, 'Done');
  assert.equal((await snapshot(page)).settings.maxEntries, 2000);
});

test('reset confirms its preference-only scope and preserves captures and AI credentials', async t => {
  const page = await fixture(t);
  await set(page, { entries: [entry('keep', '/keep')] });
  await page.evaluate(() => {
    window.paletteTest.settings({ confirmDestructiveActions: true, slowThresholdMs: 900 });
    window.paletteTest.set({ aiSettings: { ...window.paletteTest.snapshot().aiSettings, apiKey: 'synthetic-private-key', model: 'synthetic-model' } });
     window.paletteTest.openSettings('session');
  });
  const before = await snapshot(page);
  assert.match(before.text, /keeps your layout.*AI settings and credentials are kept/, 'reset scope is visible before choosing the destructive action');
  await click(page, 'Reset all settings to defaults');
  assert.equal((await snapshot(page)).settings.slowThresholdMs, 900, 'reset waits for confirmation');
  assert.match((await snapshot(page)).text, /preferences/);
  assert.ok(await page.getByRole('dialog').last().textContent().then(text => /AI/.test(text)));
  await page.getByRole('button', { name: 'Reset settings', exact: true }).click();
  const after = await snapshot(page);
  assert.equal(after.settings.slowThresholdMs, 500);
  assert.deepEqual(after.entries, before.entries);
  assert.deepEqual(after.aiSettings, before.aiSettings);
});

test('all theme copies wait for clipboard acceptance and catch denied writes', async t => {
  const page = await fixture(t);
  await page.evaluate(() => {
    window.paletteTest.settings({ theme: 'custom' });
    window.paletteTest.openSettings('appearance');
    window.clipboardWrites = [];
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: text => new Promise((resolve, reject) => window.clipboardWrites.push({ text, resolve, reject })) } });
  });
  for (const button of ['Share', 'CSS', 'Copy Background hex']) {
    await set(page, { toastMessage: '' });
    await click(page, button);
    assert.equal((await snapshot(page)).toast, '', `${button} does not show an optimistic receipt`);
    await page.evaluate(() => window.clipboardWrites.at(-1).reject(new Error('synthetic denial')));
    await page.waitForFunction(() => window.paletteTest.snapshot().toast !== '');
    assert.match((await snapshot(page)).toast, /manual|permission/i);
    assert.doesNotMatch((await snapshot(page)).toast, /copied/i);
    assert.deepEqual((await snapshot(page)).errors, []);
    await set(page, { toastMessage: '' });
    await click(page, button);
    await page.evaluate(() => window.clipboardWrites.at(-1).resolve());
    await page.waitForFunction(() => /copied/i.test(window.paletteTest.snapshot().toast));
  }
});

test('palette clear asks when confirmation is on and runs at once when it is off', async t => {
  const page = await fixture(t);
  await set(page, { entries: [entry('a', '/a'), entry('b', '/b')], commandOpen: true });
  await page.evaluate(() => window.paletteTest.settings({ confirmDestructiveActions: true }));
  await query(page, 'Clear all captured');
  await page.keyboard.press('Enter');
  assert.equal((await snapshot(page)).entries.length, 2, 'dialog first, nothing cleared');
  await page.getByRole('button', { name: 'Clear all', exact: true }).click();
  assert.equal((await snapshot(page)).entries.length, 0);

  await set(page, { entries: [entry('a', '/a'), entry('b', '/b')], commandOpen: true });
  await page.evaluate(() => window.paletteTest.settings({ confirmDestructiveActions: false }));
  await query(page, 'Clear all captured');
  await page.keyboard.press('Enter');
  assert.equal((await snapshot(page)).entries.length, 0, 'palette clear without confirmation');
});
