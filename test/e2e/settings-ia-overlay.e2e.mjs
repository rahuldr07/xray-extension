import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
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
      import { PanelShell, ToastRegion } from './src/panel/components/shell/PanelShell';
      import { SettingsModal } from './src/panel/components/settings/SettingsModal';
      import { usePanelStore } from './src/panel/store';

      window.settingsTest = {
        setup(shadow, css) {
          const host = document.body.appendChild(document.createElement('div'));
          this.root = shadow ? host.attachShadow({ mode: 'closed' }) : document;
          const style = document.createElement('style'); style.textContent = css;
          (shadow ? this.root : document.head).appendChild(style);
          const mount = shadow ? this.root.appendChild(document.createElement('div')) : host;
          usePanelStore.setState({ open: true, devtoolsMode: true, settingsOpen: false, settingsSection: 'general', settingsSectionHint: null, toastMessage: null });
          flushSync(() => createRoot(mount).render(<><PanelShell mode="devtools"><div>Workspace</div></PanelShell><SettingsModal /><ToastRegion /></>));
        },
        surface(value) { flushSync(() => usePanelStore.getState().setSurface(value)); },
        gear() { this.root.querySelector('[aria-label="Open settings"]').click(); },
        openSettings(section) { flushSync(() => usePanelStore.getState().openSettings(section)); },
        close() { this.root.querySelector('[aria-label="Close Settings"]')?.click() || this.root.querySelector('button').click(); },
        click(label) {
          const button = [...this.root.querySelectorAll('button')].find(el => el.textContent.trim() === label || el.getAttribute('aria-label') === label);
          if (!button) throw new Error('No button: ' + label);
          button.click();
        },
        toast(message) { flushSync(() => usePanelStore.getState().showToast(message)); },
         snapshot() {
          const state = usePanelStore.getState();
          const root = this.root === document ? document.body : this.root;
          const dialog = root.querySelector('[role="dialog"]');
          const backdrop = root.querySelector('.xray-modal-backdrop');
          const toastRegion = root.querySelector('.xray-toast-region');
          return {
            section: state.settingsSection,
            hint: state.settingsSectionHint,
            settingsOpen: state.settingsOpen,
            text: dialog?.textContent || '',
            nav: [...root.querySelectorAll('.xray-settings-nav-item')].map(el => el.textContent.trim()),
            groups: [...root.querySelectorAll('.xray-settings-nav-group-title')].map(el => el.textContent.trim()),
            toast: root.querySelector('.xray-toast')?.textContent || '',
            toastZ: toastRegion ? getComputedStyle(toastRegion).zIndex : null,
            backdropZ: backdrop ? getComputedStyle(backdrop).zIndex : null,
             toastAfterBackdrop: Boolean(toastRegion && backdrop && toastRegion.compareDocumentPosition(backdrop) & Node.DOCUMENT_POSITION_PRECEDING),
           };
         },
         layout() {
           const rect = element => {
             const box = element.getBoundingClientRect();
             const style = getComputedStyle(element);
             return {
               left: box.left,
               top: box.top,
               right: box.right,
               bottom: box.bottom,
               width: box.width,
               height: box.height,
               clientWidth: element.clientWidth,
               clientHeight: element.clientHeight,
               scrollWidth: element.scrollWidth,
               scrollHeight: element.scrollHeight,
               overflowX: style.overflowX,
               overflowY: style.overflowY,
             };
           };
           const root = this.root === document ? document : this.root;
           const dialog = root.querySelector('.xray-settings-modal');
           const nav = root.querySelector('.xray-settings-nav');
           const content = root.querySelector('.xray-settings-content');
           return {
             viewport: { width: innerWidth, height: innerHeight },
             dialog: rect(dialog),
             body: rect(root.querySelector('.xray-settings-modal-body')),
             nav: rect(nav),
             content: rect(content),
             footer: rect(root.querySelector('.xray-modal-foot')),
             done: rect(root.querySelector('.xray-modal-foot .xray-btn')),
             navItems: [...nav.querySelectorAll('.xray-settings-nav-item')].map(rect),
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

const css = readFileSync(new URL('../../src/panel/styles.css', import.meta.url), 'utf8');

async function fixture(t, shadow = false, viewport = { width: 960, height: 800 }) {
  const page = await browser.newPage({ viewport });
  page.setDefaultTimeout(3000);
  t.after(() => page.close());
  await page.setContent('<div></div>');
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(({ shadow, css }) => window.settingsTest.setup(shadow, css), { shadow, css });
  return page;
}

const snapshot = page => page.evaluate(() => window.settingsTest.snapshot());
const layout = page => page.evaluate(() => window.settingsTest.layout());
const click = (page, label) => page.evaluate(label => window.settingsTest.click(label), label);

test('settings keeps responsive nav, scrollable content, and footer inside the modal shell', async t => {
  for (const shadow of [false, true]) {
    for (const width of [360, 420, 760, 960]) {
      for (const height of [350, 500, 700]) {
        const page = await fixture(t, shadow, { width, height });
        await page.evaluate(() => window.settingsTest.openSettings('session'));
        const state = await layout(page);
        const label = `${shadow ? 'shadow' : 'document'} ${width}x${height}`;
        const inside = (child, parent) => child.left >= parent.left - 1 && child.right <= parent.right + 1 && child.top >= parent.top - 1 && child.bottom <= parent.bottom + 1;

        assert.ok(inside(state.dialog, { left: 0, top: 0, right: width, bottom: height }), `${label}: dialog escapes viewport: ${JSON.stringify(state)}`);
        assert.ok(inside(state.body, state.dialog), `${label}: body escapes dialog: ${JSON.stringify(state)}`);
        assert.ok(inside(state.nav, state.body), `${label}: nav escapes body: ${JSON.stringify(state)}`);
        assert.ok(inside(state.content, state.body), `${label}: content escapes body: ${JSON.stringify(state)}`);
        assert.ok(inside(state.footer, state.dialog), `${label}: footer escapes dialog: ${JSON.stringify(state)}`);
        assert.ok(inside(state.done, state.footer), `${label}: Done action escapes footer: ${JSON.stringify(state)}`);
        assert.equal(state.dialog.scrollWidth, state.dialog.clientWidth, `${label}: modal has horizontal overflow`);
        assert.equal(state.content.scrollWidth, state.content.clientWidth, `${label}: settings content has horizontal overflow`);
        assert.ok(state.content.scrollHeight > state.content.clientHeight, `${label}: settings content is not independently scrollable`);

        if (width <= 760) {
          assert.equal(state.nav.overflowY, 'hidden', `${label}: horizontal nav also scrolls vertically`);
          assert.ok(state.nav.scrollWidth >= state.nav.clientWidth, `${label}: nav has no horizontal layout surface`);
          for (const item of state.navItems) {
            assert.ok(item.top >= state.nav.top - 1 && item.bottom <= state.nav.bottom + 1, `${label}: mobile nav item is vertically clipped: ${JSON.stringify(state)}`);
          }
        } else if (state.nav.scrollHeight > state.nav.clientHeight) { // the dialog height is fixed (L1): whenever the nav outgrows it, the nav must scroll
          assert.equal(state.nav.overflowY, 'auto', `${label}: overflowing desktop nav does not own vertical scrolling`);
        }
      }
    }
  }
});

for (const shadow of [false, true]) {
  const surface = shadow ? 'closed shadow' : 'document';

  test(`settings groups and routes explicit links separately from gear history (${surface})`, async t => {
    const page = await fixture(t, shadow);
    await page.evaluate(() => window.settingsTest.openSettings('ai'));
    let state = await snapshot(page);
    assert.match(state.text, /AI \(bring your own key\)/);
    assert.deepEqual(state.groups, ['Workspace', 'Interface', 'Runtime']);
    assert.deepEqual(state.nav, ['General', 'Capture', 'Session & storage', 'Appearance', 'Shortcuts', 'AI', 'About']);
    assert.equal(state.section, 'general', 'deep link does not overwrite last visited section');
    assert.equal(state.hint, null, 'deep link is consumed after opening');

    await click(page, 'Done');
    await page.evaluate(() => window.settingsTest.gear());
    state = await snapshot(page);
    assert.match(state.text, /Confirm destructive actions/);

    await page.evaluate(() => window.settingsTest.openSettings('ai'));
    assert.match((await snapshot(page)).text, /AI \(bring your own key\)/, 'an explicit link also retargets an already-open modal');
    await click(page, 'Done');

    await page.evaluate(() => window.settingsTest.gear());
    await click(page, 'Appearance');
    await click(page, 'Done');
    await page.evaluate(() => window.settingsTest.openSettings('ai'));
    await click(page, 'Done');
    await page.evaluate(() => window.settingsTest.gear());
    state = await snapshot(page);
    assert.match(state.text, /Appearance/);
  });

  test(`destructive controls are only rendered in Session & storage (${surface})`, async t => {
    const page = await fixture(t, shadow);
    await page.evaluate(() => window.settingsTest.openSettings('general'));
    assert.doesNotMatch((await snapshot(page)).text, /Danger zone|Clear all captured data/);
    await click(page, 'Session & storage');
    assert.match((await snapshot(page)).text, /Danger zone/);
    assert.match((await snapshot(page)).text, /Clear all captured data/);
  });

  test(`settings content: removed rows gone, moved rows, readable choices, copy (${surface})`, async t => {
    const page = await fixture(t, shadow);
    const text = async section => { await page.evaluate(s => window.settingsTest.openSettings(s), section); return (await snapshot(page)).text; };
    let body = await text('general');
    assert.doesNotMatch(body, /Very slow threshold|Default detail view|Stream to console live/);
    assert.match(body, /Slow threshold/);
    assert.match(body, /Requests at or above this are marked slow in the list, Insights and Findings\./);
    body = await text('console');
    assert.match(body, /Confirm destructive actions/, 'stale console link falls back to General');
    assert.ok(!(await snapshot(page)).nav.includes('Console'));
    body = await text('session');
    assert.doesNotMatch(body, /Clear API filters/);
    const diag = await page.evaluate(() => {
      const d = [...(window.settingsTest.root.querySelectorAll ? window.settingsTest.root.querySelectorAll('details') : [])].find(x => /Diagnostics/.test(x.textContent));
      return d ? { open: d.open, text: d.textContent } : null;
    });
    assert.ok(diag, 'Diagnostics disclosure exists');
    assert.equal(diag.open, false, 'collapsed by default');
    assert.match(diag.text, /Session identity/);
    assert.match(diag.text, /Runtime health/);
    assert.match(body, /Clear all captured data/);
    assert.doesNotMatch(body, /Clear all captured sessions/);
    body = await text('capture');
    assert.match(body, /Capture WebSocket and Server-Sent Event connections opened from now on\./);
    body = await text('shortcuts');
    assert.match(body, /Change in chrome:\/\/extensions\/shortcuts/);
    body = await text('about');
    assert.match(body, /Decryption: responses to requests with an X-Parse-Token header pass through the decrypt hook in shared\/decrypt\.js, which does nothing until a developer edits it\./);
    assert.match(body, /5 presets/);
    await text('appearance');
    const choices = await page.evaluate(() => {
      const root = window.settingsTest.root;
      const selects = [...root.querySelectorAll('select.xray-select')];
      return {
        options: selects.flatMap(s => [...s.options].map(o => o.textContent)),
        swatches: [...root.querySelectorAll('.xray-color-swatch')].map(b => b.getAttribute('aria-label')),
        text: root.querySelector('[role="dialog"]').textContent,
      };
    });
    assert.ok(choices.options.includes('JetBrains Mono (if installed)'));
    assert.ok(choices.options.includes('System monospace'));
    assert.ok(!choices.options.includes('jetbrains'));
    assert.ok(choices.swatches.includes('Use Amber accent'));
    assert.ok(choices.swatches.includes('Use Gold accent'));
    assert.ok(!choices.swatches.includes('Use blue accent'));
    assert.match(choices.text, /Compact API rows/);
    assert.match(choices.text, /Shorter rows in the API list\. Same as the list's row-height button\./);
    assert.match(choices.text, /Monospace font for tables, JSON and console\. Uses fonts installed on this computer\./);
    assert.match(choices.text, /Accent-coloured glow on selected rows and buttons, plus the background grid\./);
    assert.doesNotMatch(choices.text, /Operator glow/);
  });

  test(`capture section shows the pop-out delivery line only in the window surface when delivery fails (${surface})`, async t => {
    const page = await fixture(t, shadow);
    const line = 'Changes apply to the page the next time XRAY opens there.';
    const set = surface => page.evaluate(surface => window.settingsTest.surface(surface), surface);
    await page.evaluate(() => window.settingsTest.openSettings('capture'));
    assert.ok(!(await snapshot(page)).text.includes(line), 'nothing before a publish');
    await click(page, 'Intercept fetch');
    assert.ok(!(await snapshot(page)).text.includes(line), 'in-page/HUD surface: failed publish does not show it');
    await set('window');
    assert.ok((await snapshot(page)).text.includes(line), 'window surface + failed delivery');
    await page.evaluate(() => { window.__XRAY_bridgeToken = 'tok'; });
    await click(page, 'Intercept fetch');
    assert.ok(!(await snapshot(page)).text.includes(line), 'cleared once delivery works');
  });

  test(`toast receipt is above the modal backdrop (${surface})`, async t => {
    const page = await fixture(t, shadow);
    await page.evaluate(() => window.settingsTest.openSettings('general'));
    await page.evaluate(() => window.settingsTest.toast('Settings applied.'));
    const state = await snapshot(page);
    assert.equal(state.toast, 'Settings applied.');
    assert.equal(Number(state.toastZ) >= Number(state.backdropZ), true);
    assert.equal(state.toastAfterBackdrop, true);
  });
}
