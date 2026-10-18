import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { before, after } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { setStandardsContent } from '../helpers/standards-page.mjs';

// Exercise the real React shell and centralized keyboard handler in both ordinary
// DOM and a closed shadow root. Kept in the opt-in browser suite (no new deps).
const projectRoot = fileURLToPath(new URL('../../', import.meta.url));
const { outputFiles } = await build({
  stdin: {
    resolveDir: projectRoot,
    loader: 'jsx',
    contents: `
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      import { flushSync } from 'react-dom';
      import { ModalShell } from './src/panel/components/common/ModalShell';
      import { ConfirmationModal } from './src/panel/components/common/ConfirmationModal';
      import { installPanelKeyboard } from './src/panel/runtime/panelKeyboard';
      import { usePanelStore } from './src/panel/store';

      const layers = [
        ['exportOpen', 'Export', s => s.setExportOpen(false)],
        ['settingsOpen', 'Settings', s => s.setSettingsOpen(false)],
        ['replayEditorEntry', 'Replay', s => s.closeReplayEditor()],
        ['explainEntry', 'Explain', s => s.closeExplain()],
        ['commandOpen', 'Command', s => s.setCommandOpen(false)],
        ['globalSearchOpen', 'Search', s => s.setGlobalSearchOpen(false)],
        ['pendingConfirmation', 'Confirmation', s => s.closeConfirmation()],
      ];
      function Fixture() {
        const state = usePanelStore();
        return <>
          <input id="panel-field" aria-label="Panel filter" />
           {layers.map(([field, title, close]) => state[field] && field === 'pendingConfirmation'
             ? <ConfirmationModal key={field} />
             : state[field] && <ModalShell key={field} title={title} onClose={() => close(usePanelStore.getState())}>
               <input data-modal={title} aria-label={title + ' field'} autoFocus={title === 'Command' || title === 'Search'} />
               <button data-last={title}>Last {title}</button>
             </ModalShell>)}
        </>;
      }
      window.modalTest = {
        setup(shadow, dismissible) {
          const host = document.body.appendChild(document.createElement('div'));
          const root = shadow ? host.attachShadow({ mode: 'closed' }) : document;
          const mount = shadow ? root.appendChild(document.createElement('div')) : host;
          this.root = root;
          usePanelStore.setState({ open: true, activeTab: 'api', apiDetailOpen: true });
          installPanelKeyboard({ dismissible, getRoot: () => root });
          flushSync(() => createRoot(mount).render(<Fixture />));
        },
         set(state) { flushSync(() => usePanelStore.setState(state.pendingConfirmation ? { ...state, pendingConfirmation: { ...state.pendingConfirmation, onConfirm: () => {} } } : state)); },
         confirmRequest() { flushSync(() => usePanelStore.setState({ pendingConfirmation: { title: 'Confirm', message: 'Confirm action', confirmLabel: 'Confirm', onConfirm: () => { window.confirmed = true; } } })); },
        focus(selector) { this.root.querySelector(selector).focus(); },
        snapshot() {
          const state = usePanelStore.getState();
          return {
            dialogs: [...this.root.querySelectorAll('[role="dialog"]')].map(el => el.getAttribute('aria-label')),
             focus: this.root.activeElement?.getAttribute('data-modal') || this.root.activeElement?.id || this.root.activeElement?.textContent?.trim() || null,
            open: state.open,
            drawer: state.apiDetailOpen,
          };
        },
      };
    `,
  },
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

async function fixture(t, shadow = false, dismissible = true) {
  const page = await browser.newPage();
  t.after(() => page.close());
  await setStandardsContent(page, '<style>.xray-modal-backdrop { position: fixed; inset: 0; z-index: 10; background: white; }</style>');
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(({ shadow, dismissible }) => window.modalTest.setup(shadow, dismissible), { shadow, dismissible });
  return page;
}

const set = (page, state) => page.evaluate(state => window.modalTest.set(state), state);
const snapshot = page => page.evaluate(() => window.modalTest.snapshot());

for (const shadow of [false, true]) {
  test(`Escape closes only the visually topmost sibling (${shadow ? 'closed shadow' : 'document'})`, async t => {
    const page = await fixture(t, shadow);
     await set(page, { exportOpen: true, settingsOpen: true, replayEditorEntry: { id: 'replay' }, explainEntry: { id: 'explain' }, commandOpen: true, globalSearchOpen: true, pendingConfirmation: { title: 'Confirm', message: 'Confirm action', confirmLabel: 'Confirm' } });
     assert.deepEqual((await snapshot(page)).dialogs, ['Export', 'Settings', 'Replay', 'Explain', 'Command', 'Search', 'Confirm']);
    for (const remaining of [
      ['Export', 'Settings', 'Replay', 'Explain', 'Command', 'Search'],
      ['Export', 'Settings', 'Replay', 'Explain', 'Command'],
      ['Export', 'Settings', 'Replay', 'Explain'],
      ['Export', 'Settings', 'Replay'],
      ['Export', 'Settings'],
      ['Export'],
      [],
    ]) {
      await page.keyboard.press('Escape');
      const actual = await snapshot(page);
      assert.deepEqual(actual.dialogs, remaining);
      assert.equal(actual.open, true);
      assert.equal(actual.drawer, true);
    }
    await page.keyboard.press('Escape');
    assert.equal((await snapshot(page)).drawer, false);
    await page.keyboard.press('Escape');
    assert.equal((await snapshot(page)).open, false);
  });

  test(`opening a lower sibling cannot steal focus or restore it outside the top dialog (${shadow ? 'closed shadow' : 'document'})`, async t => {
    const page = await fixture(t, shadow);
    await set(page, { commandOpen: true });
    assert.equal((await snapshot(page)).focus, 'Command');
    await set(page, { exportOpen: true });
    assert.equal((await snapshot(page)).focus, 'Command');
    await page.evaluate(() => window.modalTest.focus('[data-last="Command"]'));
    await page.keyboard.press('Tab');
    assert.equal((await snapshot(page)).focus, null); // wraps to the shell's Close button
    await page.keyboard.press('Tab');
    assert.equal((await snapshot(page)).focus, 'Command');
    await set(page, { exportOpen: false });
    assert.equal((await snapshot(page)).focus, 'Command');
    await set(page, { exportOpen: true });
    await page.keyboard.press('Escape');
    assert.deepEqual((await snapshot(page)).dialogs, ['Export']);
    assert.equal((await snapshot(page)).focus, 'Export');
  });

  test(`a lower command palette's autoFocus cannot steal focus from global search (${shadow ? 'closed shadow' : 'document'})`, async t => {
    const page = await fixture(t, shadow);
    await set(page, { globalSearchOpen: true });
    assert.equal((await snapshot(page)).focus, 'Search');
    await set(page, { commandOpen: true });
    assert.equal((await snapshot(page)).focus, 'Search');
  });
}

test('confirmation closes before lower modals and removing a lower modal preserves confirmation focus', async t => {
  const page = await fixture(t, true);
   await set(page, { exportOpen: true, pendingConfirmation: { title: 'Confirm', message: 'Confirm action', confirmLabel: 'Confirm' } });
   assert.equal((await snapshot(page)).focus, 'Cancel');
  await set(page, { exportOpen: false });
   assert.equal((await snapshot(page)).focus, 'Cancel');
  await page.keyboard.press('Escape');
  assert.deepEqual((await snapshot(page)).dialogs, []);
  assert.equal((await snapshot(page)).drawer, true);
});

test('fieldless confirmation starts on Cancel and Enter cannot confirm immediately', async t => {
  const page = await fixture(t, true);
  await page.evaluate(() => window.modalTest.root.querySelector('#panel-field').focus());
  await page.evaluate(() => window.modalTest.confirmRequest());
  assert.equal((await snapshot(page)).focus, 'Cancel');
  await page.keyboard.press('Enter');
  assert.equal((await snapshot(page)).open, true);
  assert.equal((await snapshot(page)).dialogs.length, 0);
  await page.evaluate(() => window.modalTest.confirmRequest());
  await page.keyboard.press('Escape');
  assert.equal((await snapshot(page)).open, true);
  assert.equal((await snapshot(page)).focus, 'panel-field');
  assert.equal(await page.evaluate(() => window.confirmed === true), false);
});

test('closed-shadow editing and persistent surfaces keep the existing panel dismissal semantics', async t => {
  const page = await fixture(t, true);
  await set(page, { apiDetailOpen: false });
  await page.evaluate(() => {
    const field = window.modalTest.root.querySelector('#panel-field');
    field.value = 'filter';
    field.focus();
  });
  await page.keyboard.press('Escape');
  assert.equal((await snapshot(page)).open, true);
  await page.evaluate(() => { window.modalTest.root.querySelector('#panel-field').value = ''; });
  await page.keyboard.press('Escape');
  assert.equal((await snapshot(page)).open, false);

  const persistent = await fixture(t, false, false);
  await set(persistent, { apiDetailOpen: false, settingsOpen: true });
  await persistent.keyboard.press('Escape');
  assert.deepEqual((await snapshot(persistent)).dialogs, []);
  await persistent.keyboard.press('Escape');
  assert.equal((await snapshot(persistent)).open, true);
});
