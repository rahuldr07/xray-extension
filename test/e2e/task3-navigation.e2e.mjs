import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { before, after } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';

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
      import { FirstRun } from './src/panel/components/common/FirstRun';
      import { usePanelStore } from './src/panel/store';
      import styles from './src/panel/styles.css';

      const logs = Array.from({length: 90}, (_, index) => ({
        id: 'log-' + index, type: 'log', logLevel: index % 3 === 0 ? 'warn' : 'log',
        timestamp: index + 1, message: 'Virtualized log message ' + index,
      }));

      window.task3Navigation = {
        setup(shadow, width, firstRun) {
          const host = document.body.appendChild(document.createElement('div'));
          this.root = shadow ? host.attachShadow({ mode: 'closed' }) : document;
          const sheet = document.createElement('style'); sheet.textContent = styles;
          (shadow ? this.root : document.head).appendChild(sheet);
          const mount = shadow ? this.root.appendChild(document.createElement('div')) : host;
          const state = usePanelStore.getState();
          usePanelStore.setState({
            open: true, activeTab: firstRun ? 'api' : 'logs', selectedId: null, expandedId: null,
            entries: firstRun ? [] : logs, apiDetailOpen: false,
            settings: { ...state.settings, panelWidth: width, compactRows: width < 600, firstRunDismissed: !firstRun },
          });
          mount.className = 'xray-theme-scope xray-theme-operator';
          const panel = mount.appendChild(document.createElement('div'));
          panel.className = 'xray-panel xray-mode-window xray-open';
          panel.style.cssText = 'container-type:inline-size;container-name:xray;width:' + width + 'px;height:700px;display:block;position:relative;';
          flushSync(() => createRoot(panel).render(firstRun ? <FirstRun /> : <EntriesWorkspace mode="logs" />));
        },
        focusList() { this.root.querySelector('[role="listbox"]').focus(); },
        snapshot() {
          const list = this.root.querySelector('[role="listbox"]');
          const rows = [...this.root.querySelectorAll('[role="option"]')];
          return {
            listTabIndex: list?.getAttribute('tabindex'),
            active: list?.getAttribute('aria-activedescendant'),
            tabStops: rows.filter(row => row.getAttribute('tabindex') === '0').length,
            optionIds: rows.map(row => row.id),
            selected: rows.filter(row => row.getAttribute('aria-selected') === 'true').map(row => row.id),
            firstRunText: this.root.querySelector('.xray-firstrun')?.textContent || '',
            firstRunRole: this.root.querySelector('.xray-firstrun')?.getAttribute('role') || null,
          };
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

async function fixture(t, shadow, width, firstRun = false) {
  const page = await browser.newPage({ viewport: { width: Math.max(width, 960), height: 700 } });
  t.after(() => page.close());
  await page.setContent('<style>body{margin:0}</style>');
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(args => window.task3Navigation.setup(args.shadow, args.width, args.firstRun), { shadow, width, firstRun });
  return page;
}

const snapshot = page => page.evaluate(() => window.task3Navigation.snapshot());
const focusList = page => page.evaluate(() => window.task3Navigation.focusList());

for (const shadow of [false, true]) for (const width of [360, 960]) {
  test(`virtualized Logs keyboard navigation has one list focus owner (${shadow ? 'closed shadow' : 'document'}, ${width}px)`, async t => {
    const page = await fixture(t, shadow, width);
    await focusList(page);
    await page.waitForFunction(() => window.task3Navigation.snapshot().optionIds.length > 0);
    let state = await snapshot(page);
    assert.equal(state.listTabIndex, '0');
    assert.equal(state.tabStops, 0);
    assert.equal(new Set(state.optionIds).size, state.optionIds.length);

    for (const key of ['Home', 'ArrowDown', 'PageDown', 'End', 'PageUp', 'ArrowUp']) {
      await page.keyboard.press(key);
      state = await snapshot(page);
      assert.ok(state.active, `${key} must expose an active descendant`);
      assert.deepEqual(state.selected, [state.active], `${key} must synchronize selection and active descendant`);
    }

    await page.keyboard.press('Enter');
    if (width < 600) {
      // Below 600px opening a log replaces the list with the full-height detail
      // (S24); focus moves to its back control, and Space on it returns to the list.
      await page.waitForFunction(() => window.task3Navigation.root.querySelector('.xray-logs-workspace.detail-open'));
      assert.equal(await page.evaluate(() => window.task3Navigation.root.activeElement?.getAttribute('aria-label')), 'Back to logs');
      await page.keyboard.press('Space');
      await page.waitForFunction(() => window.task3Navigation.snapshot().selected.length === 1);
      const afterBack = await snapshot(page);
      assert.deepEqual(afterBack.selected, [afterBack.active]);
      assert.equal(await page.evaluate(() => window.task3Navigation.root.activeElement?.getAttribute('role')), 'listbox', 'closing the detail returns focus to the list');
    } else {
      const afterEnter = await snapshot(page);
      assert.deepEqual(afterEnter.selected, [afterEnter.active]);
      await page.keyboard.press('Space');
      const afterSpace = await snapshot(page);
      assert.deepEqual(afterSpace.selected, [afterSpace.active]);
    }
  });
}

for (const shadow of [false, true]) {
  test(`First Run privacy copy is static and scoped (${shadow ? 'closed shadow' : 'document'})`, async t => {
    const page = await fixture(t, shadow, 360, true);
    const state = await snapshot(page);
    assert.match(state.firstRunText, /Capture stays on this machine/i);
    assert.match(state.firstRunText, /explicitly start it/i);
    assert.equal(state.firstRunRole, null);
    assert.equal(await page.evaluate(() => window.task3Navigation.root.querySelector('.xray-firstrun[role="status"]')), null);
  });
}
