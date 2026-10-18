/* Rendered themes, control precedence, sibling overlays, and isolation. */
import assert from 'node:assert/strict';
import { existsSync, readFileSync, mkdirSync } from 'node:fs';
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
      import { App } from './src/panel/App';
      import { usePanelStore } from './src/panel/store';
      import { DEFAULT_PANEL_SETTINGS } from './src/panel/models/panelSettings';
      import { decodeTheme, encodeTheme, themePackageToSettings } from './src/panel/models/customTheme';
      window.themeTest = {
        setup(shadow, css, mode) {
          const host = document.body.appendChild(document.createElement('div'));
          this.root = shadow ? host.attachShadow({ mode: 'closed' }) : document;
          const style = document.createElement('style'); style.textContent = css;
          (shadow ? this.root : document.head).appendChild(style);
          const mount = shadow ? this.root.appendChild(document.createElement('div')) : host;
          mount.className = 'xray-app-root';
          usePanelStore.setState({ open: true, firstRunOpen: false, settingsOpen: false, activeTab: 'api', settings: { ...DEFAULT_PANEL_SETTINGS, firstRunDismissed: true } });
          flushSync(() => createRoot(mount).render(<App mode={mode} />));
        },
        settings(patch) { flushSync(() => usePanelStore.getState().updateSettings(patch)); },
        open() { flushSync(() => usePanelStore.getState().openSettings('appearance')); },
        close() { flushSync(() => usePanelStore.getState().setSettingsOpen(false)); },
        tab(tab) { flushSync(() => usePanelStore.getState().setActiveTab(tab)); },
        click(text) {
          const button = [...this.root.querySelectorAll('button')].find(el => el.textContent.trim() === text || el.getAttribute('aria-label') === text);
          if (!button) throw new Error('Missing control: ' + text);
          flushSync(() => button.click());
        },
        focus(label) { this.root.querySelector('[aria-label="' + label + '"]').focus(); },
        snapshot() {
          const s = usePanelStore.getState();
          const props = el => {
            if (!el) return null;
            const cs = getComputedStyle(el);
            return Object.fromEntries(['bg', 'surface', 'surface2', 'surface3', 'text', 'subtext', 'hint', 'border', 'border-control', 'focus', 'selection', 'hover', 'active', 'disabled', 'accent', 'accent-soft', 'green', 'yellow', 'red', 'blue', 'pending', 'neutral', 'shadow', 'overlay'].map(key => [key, cs.getPropertyValue('--xray-' + key).trim()]));
          };
          const panel = this.root.querySelector('.xray-panel');
          const dialog = this.root.querySelector('[role="dialog"]');
          const active = this.root instanceof ShadowRoot ? this.root.activeElement : document.activeElement;
          return { settings: s.settings, panel: props(panel), dialog: props(dialog), buttons: [...this.root.querySelectorAll('button')].map(el => el.textContent.trim()), promptBg: panel.querySelector('.xray-prompt .xray-editor-field') ? getComputedStyle(panel.querySelector('.xray-prompt .xray-editor-field')).backgroundColor : null, focusedOutline: active ? getComputedStyle(active).outlineStyle : null, motion: dialog ? getComputedStyle(dialog).animationName : null, hostBg: getComputedStyle(document.querySelector('#host-page')).backgroundColor };
        },
        share() { const s = usePanelStore.getState().settings; return encodeTheme({ colors: s.customTheme, font: s.font, radius: s.radius, hacker: s.hacker }); },
        hash(code) { this.settings(themePackageToSettings(decodeTheme('#theme=' + code))); },
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
const css = ['styles/tokens.css', 'styles.css'].map(path => readFileSync(new URL('../../src/panel/' + path, import.meta.url), 'utf8')).join('\n');
const screenshotDir = '/tmp/omnirush/xray-theme-visual-system';
const snapshot = page => page.evaluate(() => window.themeTest.snapshot());
async function fixture(t, shadow, mode = 'window') {
  const page = await browser.newPage({ viewport: { width: 960, height: 760 }, reducedMotion: 'reduce' });
  t.after(() => page.close());
  await page.setContent('<div id="host-page" style="background:rgb(12, 34, 56)">Host page</div>');
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(({ shadow, css, mode }) => window.themeTest.setup(shadow, css, mode), { shadow, css, mode });
  return page;
}

for (const shadow of [false, true]) {
  const surface = shadow ? 'closed shadow' : 'document';
  test(`preset overview supplies complete semantic roles and readable layering (${surface})`, async t => {
    const page = await fixture(t, shadow);
    await page.evaluate(() => window.themeTest.open());
    for (const [label, theme, bg] of [['Signal Gray', 'operator', '#181a1f'], ['Harbor Instrument', 'dev-edition', '#20252b'], ['Paper Relay', 'light-lab', '#f7f5ef'], ['High Contrast', 'midnight', '#000000']]) {
      await page.evaluate(label => window.themeTest.click(label), label);
      const state = await snapshot(page);
      assert.equal(state.settings.theme, theme);
      assert.equal(state.panel.bg, bg);
      for (const [key, value] of Object.entries(state.panel)) assert.notEqual(value, '', `${label}: ${key} is missing`);
      assert.notEqual(state.panel.bg, state.panel.surface);
      assert.notEqual(state.panel.surface, state.panel.surface2);
      assert.equal(state.dialog.accent, state.panel.accent, 'sibling modal inherits active accent');
      assert.equal(state.hostBg, 'rgb(12, 34, 56)', 'theme never changes the host page');
    }
  });

  test(`custom accent edits and palette edits agree with panel and sibling modal (${surface})`, async t => {
    const page = await fixture(t, shadow);
    await page.evaluate(() => {
      window.themeTest.settings({ theme: 'custom', customTheme: { bg: '#101010', surface: '#202020', text: '#eeeeee', accent: '#f59e0b', border: '#334455' } });
      window.themeTest.open();
    });
    assert.equal((await snapshot(page)).panel.accent, '#f59e0b');
    await page.evaluate(() => window.themeTest.click('Use Green accent'));
    let state = await snapshot(page);
    assert.equal(state.settings.customTheme.accent, '#a6e3a1', 'palette edits custom accent instead of the hidden legacy value');
    assert.equal(state.panel.accent, '#a6e3a1');
    assert.equal(state.dialog.accent, '#a6e3a1');
    assert.equal(state.settings.customTheme.border, '#334455', 'unrelated explicit override is preserved');
    const code = await page.evaluate(() => window.themeTest.share());
    await page.evaluate(() => window.themeTest.settings({ theme: 'operator' }));
    await page.evaluate(code => window.themeTest.hash(code), code);
    state = await snapshot(page);
    assert.equal(state.panel.accent, '#a6e3a1');
    assert.equal(state.dialog.accent, '#a6e3a1');
    assert.equal(state.settings.customTheme.border, '#334455');
  });

  test(`prompt surface and sibling modal reduced motion remain defined (${surface})`, async t => {
    const page = await fixture(t, shadow);
    await page.evaluate(() => window.themeTest.tab('console'));
    // The textarea is transparent by design (syntax overlay); the themed surface is the editor field.
    const promptBg = (await snapshot(page)).promptBg;
    assert.ok(promptBg, 'the prompt editor field is rendered');
    assert.notEqual(promptBg, 'rgba(0, 0, 0, 0)', 'prompt background must resolve');
    await page.evaluate(() => window.themeTest.open());
    assert.equal((await snapshot(page)).motion, 'none');
  });

  test(`Diagnostics disclosure paints a chevron that turns, and toggles its rows (${surface})`, async t => {
    const page = await fixture(t, shadow);
    await page.evaluate(() => { window.themeTest.open(); window.themeTest.click('Session & storage'); });
    const disclosure = () => page.evaluate(() => {
      const d = [...window.themeTest.root.querySelectorAll('details')].find(x => /Diagnostics/.test(x.textContent));
      const summary = d.querySelector('summary');
      summary.scrollIntoView({ block: 'center' });
      const own = getComputedStyle(summary);
      const before = getComputedStyle(summary, '::before');
      // Visible means painted: a native marker, or a pseudo-element with a drawn, non-transparent border.
      const painted = side => before[`border${side}Style`] !== 'none' && parseFloat(before[`border${side}Width`]) > 0
        && !/^(?:transparent|rgba\(.*,\s*0\))$/.test(before[`border${side}Color`]);
      const rect = summary.getBoundingClientRect();
      const row = d.querySelector('.xray-settings-row');
      return {
        open: d.open,
        marker: own.display === 'list-item' && own.listStyleType !== 'none',
        chevron: !['none', 'normal'].includes(before.content) && parseFloat(before.width) > 0 && parseFloat(before.height) > 0
          && painted('Right') && painted('Bottom'),
        transform: before.transform,
        transition: before.transitionDuration,
        x: rect.left + 12, y: rect.top + rect.height / 2,
        rowVisible: Boolean(row?.checkVisibility() && row.getBoundingClientRect().height > 0),
      };
    });
    const closed = await disclosure();
    assert.ok(closed.marker || closed.chevron, `Diagnostics summary shows a marker or chevron: ${JSON.stringify(closed)}`);
    assert.equal(closed.open, false, 'collapsed by default');
    assert.equal(closed.rowVisible, false, 'rows hidden while collapsed');
    await page.mouse.click(closed.x, closed.y);
    const opened = await disclosure();
    assert.equal(opened.open, true, 'a click on the summary opens it');
    assert.equal(opened.rowVisible, true, 'rows shown when open');
    if (!closed.marker) {
      assert.notEqual(opened.transform, closed.transform, 'the chevron turns when open');
      assert.equal(closed.transition, '0s', 'reduced motion (this fixture): the chevron turns without a transition');
    }
    await page.mouse.click(opened.x, opened.y);
    assert.equal((await disclosure()).open, false, 'a second click closes it');
  });
}

test('dark, light, and high-contrast main surfaces render screenshots outside the repository', async t => {
  mkdirSync(screenshotDir, { recursive: true });
  const page = await fixture(t, true);
  for (const theme of ['operator', 'light-lab', 'midnight']) {
    await page.evaluate(theme => window.themeTest.settings({ theme }), theme);
    for (const tab of ['api', 'console', 'logs', 'rules', 'insights']) {
      await page.evaluate(tab => window.themeTest.tab(tab), tab);
      await page.screenshot({ path: `${screenshotDir}/${theme}-${tab}.png` });
      assert.notEqual((await snapshot(page)).panel.text, '');
    }
    await page.evaluate(() => window.themeTest.open());
    await page.screenshot({ path: `${screenshotDir}/${theme}-appearance.png` });
    await page.evaluate(() => window.themeTest.close());
  }
});
