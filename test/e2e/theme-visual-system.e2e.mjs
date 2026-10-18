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
      import * as panelSettings from './src/panel/models/panelSettings';
      const { DEFAULT_PANEL_SETTINGS } = panelSettings;
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
        swatch(accent) { return panelSettings.accentSwatchValue?.(usePanelStore.getState().settings, accent); },
        // Restores preferences from an in-memory chrome.storage stand-in, as a surface does on load.
        async restore(stored) {
          if (stored !== undefined) {
            const data = this.storage = { react_panel_preferences: stored };
            window.XRAY_Store = { get: async (key, fallback) => (key in data ? structuredClone(data[key]) : fallback), set: async (key, value) => { data[key] = structuredClone(value); } };
          }
          await usePanelStore.getState().restorePreferences();
          return this.storage.react_panel_preferences;
        },
        toasts() { return [...this.root.querySelectorAll('.xray-toast')].map(el => el.textContent); },
        notices() { return [...this.root.querySelectorAll('.xray-notice')].map(el => el.querySelector('span').textContent); },
        setOpen(open) { flushSync(() => usePanelStore.getState().setOpen(open)); },
        toast(message) { flushSync(() => usePanelStore.getState().showToast(message)); },
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
          return { settings: s.settings, toast: s.toastMessage, accentPressed: [...this.root.querySelectorAll('.xray-color-row [aria-pressed="true"]')].map(el => el.getAttribute('aria-label')), swatchBg: Object.fromEntries([...this.root.querySelectorAll('.xray-color-swatch')].map(el => [el.getAttribute('aria-label'), el.style.background])), panel: props(panel), dialog: props(dialog), buttons: [...this.root.querySelectorAll('button')].map(el => el.textContent.trim()), swatches: [...this.root.querySelectorAll('.xray-theme-swatch-label')].map(el => el.textContent.trim()), pressed: [...this.root.querySelectorAll('.xray-theme-swatch[aria-pressed="true"]')].map(el => el.textContent.trim()), scopeClass: this.root.querySelector('.xray-theme-scope')?.className ?? '', panelClass: panel.className, promptBg: panel.querySelector('.xray-prompt .xray-editor-field') ? getComputedStyle(panel.querySelector('.xray-prompt .xray-editor-field')).backgroundColor : null, focusedOutline: active ? getComputedStyle(active).outlineStyle : null, motion: dialog ? getComputedStyle(dialog).animationName : null, hostBg: getComputedStyle(document.querySelector('#host-page')).backgroundColor };
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
// Spec P1: the picker's presets in order, each with its block's --xray-bg and its own --xray-accent (P2).
const LINEUP = [
  ['XRAY Dark', 'xray-dark', '#141517', '#3dc8f5'], ['XRAY Light', 'xray-light', '#f3f4f6', '#00698f'], ['GitHub Dark', 'github-dark', '#0d1117', '#5297ff'],
  ['GitHub Light', 'github-light', '#f6f8fa', '#005eca'], ['Tokyo Night', 'tokyo-night', '#16161e', '#7ba4f9'], ['Catppuccin Mocha', 'catppuccin-mocha', '#181825', '#cba6f7'],
  ['Dracula', 'dracula', '#21222c', '#c59dff'], ['Gruvbox Dark', 'gruvbox-dark', '#1d2021', '#8ec07c'], ['High Contrast', 'midnight', '#000000', '#00e5ff'],
];
const rgbOf = hex => `rgb(${[1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(', ')})`;
const NOTICE = label => `Themes were refreshed — you're on ${label}. Change it in Settings → Appearance.`;
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
    for (const [label, theme, bg] of LINEUP) {
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

  test(`theme picker lists the P1 lineup in order and each swatch applies its preset (${surface})`, async t => {
    const page = await fixture(t, shadow);
    await page.evaluate(() => window.themeTest.open());
    let state = await snapshot(page);
    assert.deepEqual(state.swatches, [...LINEUP.map(([label]) => label), 'Custom'], 'picker order and labels');
    assert.deepEqual(state.pressed, ['XRAY Dark'], 'a fresh install is on XRAY Dark (V1)');
    // Walk the lineup from High Contrast back round, so every click changes the preset.
    let previousBg = state.panel.bg;
    for (const [label, theme, bg] of [...LINEUP.slice(-1), ...LINEUP.slice(0, -1)]) {
      await page.evaluate(label => window.themeTest.click(label), label);
      state = await snapshot(page);
      assert.equal(state.settings.theme, theme);
      assert.ok(state.scopeClass.split(' ').includes(`xray-theme-${theme}`), `theme scope carries xray-theme-${theme}: ${state.scopeClass}`);
      assert.ok(state.panelClass.split(' ').includes(`xray-theme-${theme}`), `panel carries xray-theme-${theme}: ${state.panelClass}`);
      assert.equal(state.panel.bg, bg, `${label} paints its own --xray-bg`);
      assert.notEqual(state.panel.bg, previousBg, `${label} changes the computed --xray-bg`);
      assert.equal(state.dialog.bg, bg, `${label}: the sibling Settings modal follows the preset`);
      assert.deepEqual(state.pressed, [label], 'only the picked swatch is pressed');
      previousBg = state.panel.bg;
    }
  });

  test(`each preset shows its own accent until one is picked; "Use theme accent" hands it back (${surface})`, async t => {
    const page = await fixture(t, shadow);
    await page.evaluate(() => window.themeTest.open());
    let state = await snapshot(page);
    assert.equal(state.settings.theme, 'xray-dark', 'fresh install: XRAY Dark (V1)');
    assert.equal(state.panel.accent, '#3dc8f5', 'with its own accent');
    assert.deepEqual(state.accentPressed, ['Use theme accent']);
    for (const [label, theme, , accent] of LINEUP) {
      await page.evaluate(label => window.themeTest.click(label), label);
      state = await snapshot(page);
      assert.equal(state.settings.theme, theme);
      assert.equal(state.settings.accentChosen, false, `${label}: picking a preset picks no accent`);
      assert.equal(state.panel.accent, accent, `${label}: the computed accent is the block's own`);
      assert.equal(state.dialog.accent, accent, `${label}: the sibling Settings modal follows`);
      assert.deepEqual(state.accentPressed, ['Use theme accent'], `${label}: no swatch claims to be applied`);
      // Each swatch previews what picking it would paint on this preset.
      for (const [name, swatch] of [['Amber', 'blue'], ['Teal', 'teal'], ['Coral', 'coral']]) {
        assert.equal(state.swatchBg[`Use ${name} accent`], rgbOf(await page.evaluate(swatch => window.themeTest.swatch(swatch), swatch)), `${label}: ${name} preview`);
      }
    }
    // Picking a swatch overrides the preset (solved for it) and survives preset changes ...
    await page.evaluate(() => window.themeTest.click('Use Amber accent'));
    for (const [label, , , accent] of [LINEUP[7], LINEUP[1], LINEUP[8]]) {
      await page.evaluate(label => window.themeTest.click(label), label);
      state = await snapshot(page);
      const amber = await page.evaluate(() => window.themeTest.swatch('blue'));
      assert.equal(state.settings.accentChosen, true);
      assert.equal(state.panel.accent, amber, `${label}: the picked Amber, solved for this preset`);
      assert.equal(state.dialog.accent, amber);
      assert.notEqual(state.panel.accent, accent);
      assert.deepEqual(state.accentPressed, ['Use Amber accent']);
    }
    // ... until "Use theme accent" hands it back.
    await page.evaluate(() => window.themeTest.click('Use theme accent'));
    state = await snapshot(page);
    assert.equal(state.settings.accentChosen, false);
    assert.equal(state.panel.accent, '#00e5ff', 'High Contrast\'s own accent again');
    assert.equal(state.dialog.accent, '#00e5ff');
    assert.deepEqual(state.accentPressed, ['Use theme accent']);
  });

  test(`a retired theme migrates on load; its notice waits for a visible panel and for dismissal (${surface})`, async t => {
    for (const [stored, label, theme, accent] of [
      [{ theme: 'operator', accent: 'blue' }, 'XRAY Dark', 'xray-dark', '#3dc8f5'],
      [{ theme: 'claude', accent: 'teal', accentChosen: true }, 'XRAY Light', 'xray-light', null],
    ]) {
      const page = await fixture(t, shadow);
      // Restored in the background (the in-page panel loads before it is opened).
      await page.evaluate(() => window.themeTest.setOpen(false));
      let saved = await page.evaluate(settings => window.themeTest.restore({ settings }), stored);
      let state = await snapshot(page);
      assert.equal(state.settings.theme, theme, `${stored.theme} loads as ${theme}`);
      assert.ok(state.scopeClass.split(' ').includes(`xray-theme-${theme}`), state.scopeClass);
      if (accent) assert.equal(state.panel.accent, accent, `${stored.theme} + its default accent: ${label}'s own accent`);
      else assert.equal(state.panel.accent, await page.evaluate(() => window.themeTest.swatch('teal')), 'a picked accent is kept');
      assert.equal(saved.settings.theme, theme, 'the new id is stored at once');
      assert.equal(saved.settings.themeRefreshPending, true, 'with the notice pending');
      assert.deepEqual(await page.evaluate(() => window.themeTest.notices()), [], 'not shown while the panel is hidden');
      // A second background load does not spend it either.
      saved = await page.evaluate(() => window.themeTest.restore());
      assert.equal(saved.settings.themeRefreshPending, true);
      assert.deepEqual(await page.evaluate(() => window.themeTest.notices()), []);
      // Opening the panel shows it, in its own slot: a receipt toast neither replaces nor hides it.
      await page.evaluate(() => window.themeTest.setOpen(true));
      await page.waitForFunction(() => window.themeTest.notices().length > 0, undefined, { timeout: 5000 });
      assert.deepEqual(await page.evaluate(() => window.themeTest.notices()), [NOTICE(label)]);
      await page.evaluate(() => window.themeTest.toast('Receipt'));
      assert.deepEqual(await page.evaluate(() => window.themeTest.toasts()), ['Receipt']);
      assert.deepEqual(await page.evaluate(() => window.themeTest.notices()), [NOTICE(label)], 'a toast does not overwrite it');
      // No auto-hide: the receipt goes after 2.8 s, the notice stays.
      await page.waitForTimeout(3300);
      assert.deepEqual(await page.evaluate(() => window.themeTest.toasts()), [], 'the receipt timed out');
      assert.deepEqual(await page.evaluate(() => window.themeTest.notices()), [NOTICE(label)], 'the notice did not');
      // Dismissing is what clears it, and that is stored.
      await page.evaluate(() => window.themeTest.click('Dismiss theme notice'));
      await page.waitForFunction(() => window.themeTest.notices().length === 0, undefined, { timeout: 5000 });
      state = await snapshot(page);
      assert.equal(state.settings.themeRefreshPending, false);
      saved = await page.evaluate(() => window.themeTest.restore());
      assert.equal(saved.settings.themeRefreshPending, false, 'dismissal is stored');
      assert.deepEqual(await page.evaluate(() => window.themeTest.notices()), [], 'shown once');
      assert.equal((await snapshot(page)).settings.theme, theme);
    }
  });

  test(`on Custom, each accent swatch previews the colour it writes (${surface})`, async t => {
    const page = await fixture(t, shadow);
    await page.evaluate(() => { window.themeTest.settings({ theme: 'custom' }); window.themeTest.open(); });
    const state = await snapshot(page);
    const expected = { Amber: '#d99a2b', Lavender: '#cba6f7', Teal: '#94e2d5', Green: '#a6e3a1', Gold: '#ffd166', Coral: '#eaa388' };
    for (const [name, hex] of Object.entries(expected)) assert.equal(state.swatchBg[`Use ${name} accent`], rgbOf(hex), name);
    assert.deepEqual(state.accentPressed.filter(label => label === 'Use theme accent'), [], 'Custom has no separate theme accent control');
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
    await page.evaluate(() => window.themeTest.settings({ theme: 'xray-dark' }));
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
  for (const theme of ['xray-dark', 'xray-light', 'midnight']) {
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
