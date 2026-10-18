/* Task 4 (S5-S9, C3, C4): option label maps, delivery result, dialog copy, confirmation gating. */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { panelSettings as P } from './harness.mjs';

const { usePanelStore } = await import('../../src/panel/store.ts');
const labels = await import('../../src/panel/models/settingsLabels.ts');
const { publishCaptureSettings } = await import('../../src/panel/runtime/captureConfig.ts');
const { DEFAULT_PANEL_SETTINGS, PANEL_ACCENT_VALUES } = P;

const entry = (id, timestamp = 0) => ({ id, type: 'api', timestamp, method: 'GET', status: 200, url: `https://x/${id}` });
const seed = (count, settings = {}) => usePanelStore.setState({
  entries: Array.from({ length: count }, (_, i) => entry(`e${i}`, i)),
  settings: { ...DEFAULT_PANEL_SETTINGS, ...settings },
  pendingConfirmation: null, pinnedIds: new Set(), selectedId: null,
});

beforeEach(() => {
  window.XRAY_Store = { set: async () => {}, get: async () => undefined };
  window.postMessage = () => {};
  delete window.__XRAY_bridgeToken;
  delete globalThis.chrome;
  usePanelStore.setState({ ...usePanelStore.getInitialState() });
});

test('font, detail view and provider options have readable names', () => {
  assert.deepEqual(labels.FONT_OPTIONS, [
    { value: 'jetbrains', label: 'JetBrains Mono (if installed)' },
    { value: 'cascadia', label: 'Cascadia Code (if installed)' },
    { value: 'iosevka', label: 'Iosevka (if installed)' },
    { value: 'system', label: 'System monospace' },
  ]);
  assert.deepEqual(labels.AI_PROVIDER_OPTIONS.map((o) => o.label), ['Anthropic', 'OpenAI', 'Custom (OpenAI-compatible)']);
  assert.deepEqual(labels.DENSITY_OPTIONS.map((o) => o.label), ['Compact', 'Comfortable', 'Spacious']);
});

test('every accent has a truthful display name', () => {
  assert.equal(labels.ACCENT_NAMES.blue, 'Amber');
  assert.equal(labels.ACCENT_NAMES.peach, 'Gold');
  assert.deepEqual(Object.keys(labels.ACCENT_NAMES).sort(), Object.keys(PANEL_ACCENT_VALUES).sort());
  assert.equal(new Set(Object.values(labels.ACCENT_NAMES)).size, 6);
});

// The options page previews each preset with :has() blocks that mirror the panel's token
// blocks (it is a separate document, so it cannot use styles.css). XRAY Dark, the default,
// is its :root.
const PAGE_TOKENS = ['--xray-bg', '--xray-surface', '--xray-surface2', '--xray-text', '--xray-subtext', '--xray-hint', '--xray-accent', '--xray-green', '--xray-border'];
function optionsPageBlocks() {
  const html = readFileSync(new URL('../../settings/settings.html', import.meta.url), 'utf8');
  const tokens = (body) => Object.fromEntries([...body.matchAll(/(--xray-[a-z0-9-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]));
  const blocks = { [P.DEFAULT_PANEL_SETTINGS.theme]: tokens(html.match(/:root \{([^}]*)\}/)[1]) };
  for (const [, id, body] of html.matchAll(/:root:has\(#theme option\[value="([a-z0-9-]+)"\]:checked\) \{([^}]*)\}/g)) blocks[id] = tokens(body);
  return blocks;
}

test('options page previews every preset with its panel block\'s colours', () => {
  const styles = readFileSync(new URL('../../src/panel/styles.css', import.meta.url), 'utf8');
  const blocks = optionsPageBlocks();
  assert.deepEqual(Object.keys(blocks), P.THEME_PRESETS.map(({ id }) => id), 'one preview per preset, no retired ones');
  for (const { id } of P.THEME_PRESETS) {
    const body = styles.match(new RegExp(`\\.xray-theme-${id}\\s*\\{([^}]*)\\}`))[1];
    const panel = Object.fromEntries([...body.matchAll(/(--xray-[a-z0-9-]+)\s*:\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]));
    for (const token of PAGE_TOKENS) assert.equal(blocks[id][token], panel[token], `${id} ${token}`);
  }
});

test('options page hint text reaches its preset\'s target on every background', () => {
  const lum = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  for (const [id, block] of Object.entries(optionsPageBlocks())) {
    const need = id === 'midnight' ? 7 : 4.5;
    for (const bg of ['bg', 'surface', 'surface2']) {
      const r = ratio(block['--xray-hint'], block[`--xray-${bg}`]);
      assert.ok(r >= need, `${id} hint ${block['--xray-hint']} on ${bg} ${block[`--xray-${bg}`]} = ${r.toFixed(2)}`);
    }
    // The Save button is the panel's flat primary tint: accent text on a 10% accent wash over the
    // card (--xray-surface); once saved, green on its own 10% wash.
    const tint = (fg, host, a = 0.1) => '#' + [1, 3, 5].map(i => Math.round(parseInt(fg.slice(i, i + 2), 16) * a + parseInt(host.slice(i, i + 2), 16) * (1 - a)).toString(16).padStart(2, '0')).join('');
    for (const fg of ['accent', 'green']) {
      const r = ratio(block[`--xray-${fg}`], tint(block[`--xray-${fg}`], block['--xray-surface']));
      assert.ok(r >= need, `${id} Save button ${fg} on its tint = ${r.toFixed(2)}`);
    }
  }
});

// Calm accent on the options page (Task 6, routed from Task 3): no accent wash behind the page, a
// neutral heading, lines in --xray-border, and the Save button as the flat accent tint.
test('options page is calm: flat background, neutral heading, line token, flat-tint Save button', () => {
  const html = readFileSync(new URL('../../settings/settings.html', import.meta.url), 'utf8');
  const css = html.match(/<style>([\s\S]*?)<\/style>/)[1].replace(/\/\*[\s\S]*?\*\//g, '');
  const rule = (sel) => css.match(new RegExp(`(?:^|\\})\\s*${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`))?.[1] ?? '';
  assert.match(rule('body'), /background:\s*var\(--xray-bg\);/, 'the page background is the flat --xray-bg');
  assert.doesNotMatch(rule('body'), /gradient|--xray-accent/, 'no accent wash');
  assert.match(rule('.head h1'), /color:\s*var\(--xray-text\);/, 'the heading is text, not the accent');
  assert.match(rule('.setting'), /border-bottom:\s*1px solid var\(--xray-border\);/);
  const save = rule('.save-btn');
  assert.match(save, /background:\s*color-mix\(in srgb, var\(--xray-accent\) 10%, var\(--xray-surface\)\);/);
  assert.match(save, /color:\s*var\(--xray-accent\);/);
  // The focus ring follows the accent, as in the panel (the accent reads ≥ 3:1 on --xray-bg in every block).
  assert.match(rule('.save-btn:focus-visible'), /outline:\s*2px solid var\(--xray-accent\);/);
});

test('options page accent names match the panel display names, after the theme\'s own accent', () => {
  const html = readFileSync(new URL('../../settings/settings.html', import.meta.url), 'utf8');
  const options = [...html.match(/<select id="accent">([\s\S]*?)<\/select>/)[1].matchAll(/<option value="([a-z]+)">([^<]*)<\/option>/g)].map(([, value, text]) => [value, text]);
  assert.deepEqual(options, [
    ['theme', 'Theme accent (default)'],
    ...Object.entries(labels.ACCENT_NAMES),
  ]);
});

test('publishCaptureSettings reports delivery', () => {
  const cfg = { captureFetch: true, captureXhr: true, captureWs: true };
  assert.equal(publishCaptureSettings(cfg), false, 'no route (pop-out window)');
  window.__XRAY_bridgeToken = 'tok';
  assert.equal(publishCaptureSettings(cfg), true);
});

test('store records capture delivery failure and recovery', () => {
  seed(0);
  assert.equal(usePanelStore.getState().captureDelivered, true);
  usePanelStore.getState().updateSettings({ captureFetch: false });
  assert.equal(usePanelStore.getState().captureDelivered, false);
  window.__XRAY_bridgeToken = 'tok';
  usePanelStore.getState().updateSettings({ captureFetch: true });
  assert.equal(usePanelStore.getState().captureDelivered, true);
});

test('Lower Max entries message names the exact number evicted', () => {
  seed(100);
  usePanelStore.setState({ pinnedIds: new Set(['e0', 'e1']) });
  usePanelStore.getState().updateSettings({ maxEntries: 50 });
  const { pendingConfirmation, entries } = usePanelStore.getState();
  assert.equal(entries.length, 100);
  const dropped = 100 - 50;
  assert.match(pendingConfirmation.message, new RegExp(`^This deletes ${dropped} of 100 captured entries now`));
});

test('cancelling the Max entries dialog leaves setting and entries unchanged', () => {
  seed(100);
  usePanelStore.getState().updateSettings({ maxEntries: 50 });
  usePanelStore.getState().closeConfirmation();
  const s = usePanelStore.getState();
  assert.equal(s.pendingConfirmation, null);
  assert.equal(s.settings.maxEntries, 1000);
  assert.equal(s.entries.length, 100);
});

test('legacy stored settings with removed keys and an unknown accent normalize and round-trip', () => {
  const stored = { verySlowThresholdMs: 3000, defaultDetailView: 'raw', compactRows: true, accent: 'chartreuse', slowThresholdMs: 900 };
  const once = P.normalizePanelSettings(stored);
  assert.equal(once.accent, 'blue', 'unknown accent falls back');
  assert.equal(once.verySlowThresholdMs, 3000);
  assert.equal(once.defaultDetailView, 'raw');
  assert.equal(once.compactRows, true);
  const twice = P.normalizePanelSettings(JSON.parse(JSON.stringify(once)));
  assert.deepEqual(twice, once, 'persist round-trip is stable');
});

test('C3 line is for the pop-out window surface only', () => {
  assert.equal(usePanelStore.getState().surface, 'hud');
  usePanelStore.getState().setSurface('window');
  assert.equal(usePanelStore.getState().surface, 'window');
  usePanelStore.getState().setSurface('hud'); // the store is a shared singleton
  assert.equal(usePanelStore.getState().surface, 'hud');
});

// Runs settings/settings.js against a minimal fake DOM and chrome.storage.local.
async function optionsPage(stored) {
  const vm = await import('node:vm');
  const store = { xray_react_panel_preferences: stored };
  const elements = {};
  const element = id => (elements[id] ??= {
    id, value: '', checked: false, textContent: '', options: [], listeners: {},
    classList: { add() {}, remove() {} },
    appendChild(option) { this.options.push(option); },
    addEventListener(type, fn) { this.listeners[type] = fn; },
  });
  // The page reflects a picked swatch by setting --xray-accent on :root (style.setProperty; the
  // page CSP rules out inline script); this records what it set.
  const rootStyle = {};
  const documentElement = { style: {
    setProperty(name, value) { rootStyle[name] = value; },
    removeProperty(name) { delete rootStyle[name]; },
  } };
  const context = {
    document: { getElementById: element, createElement: () => ({}), documentElement },
    chrome: { storage: { local: {
      get: async key => ({ [key]: structuredClone(store[key]) }),
      set: async value => { Object.assign(store, structuredClone(value)); },
    } } },
    setTimeout: () => 0, structuredClone,
  };
  await vm.runInNewContext(readFileSync(new URL('../../settings/settings.js', import.meta.url), 'utf8'), context);
  return {
    elements: element,
    rootStyle: () => ({ ...rootStyle }),
    // Picks a value in a select as the user would: the value, then its change event.
    change(id, value) { element(id).value = value; element(id).listeners.change?.(); },
    async store(record) { store.xray_react_panel_preferences = record; },
    async save() { await elements.save.listeners.click(); return store.xray_react_panel_preferences.settings; },
  };
}

test('options page Save marks a changed accent as chosen', async () => {
  const page = await optionsPage({ settings: { theme: 'xray-dark', accent: 'blue', accentChosen: false } });
  page.elements('accent').value = 'teal';
  const saved = await page.save();
  assert.equal(saved.accent, 'teal');
  assert.equal(saved.accentChosen, true, 'the panel must not re-theme over a user-picked accent');
});

test('options page Save leaves accentChosen alone when the accent is unchanged', async () => {
  const page = await optionsPage({ settings: { theme: 'xray-light', accent: 'peach', accentChosen: false } });
  const saved = await page.save();
  assert.equal(saved.accent, 'peach');
  assert.equal(saved.accentChosen, false);
});

// settings.js is a plain script and cannot import THEME_PRESETS: it keeps a literal copy, pinned
// here to the model (ids, labels, order) by what the page actually renders.
test('options page lists the panel presets in picker order, then Custom', async () => {
  const page = await optionsPage({});
  const options = page.elements('theme').options.map((option) => [option.value, option.textContent]);
  assert.deepEqual(options, [
    ...P.THEME_PRESETS.map(({ id, label }) => [id, id === DEFAULT_PANEL_SETTINGS.theme ? `${label} (default)` : label]),
    ['custom', 'Custom (Theme Studio)'],
  ]);
  assert.equal(page.elements('theme').value, 'xray-dark', 'a fresh install shows the default theme');
  assert.equal(page.elements('accent').value, 'theme', 'with its own accent');
});

test('options page migrates stored settings exactly as the panel does (spec V2)', async () => {
  // Stored before the refresh (no themeRefreshPending) and after it, valid and corrupt accents.
  for (const theme of ['operator', 'dev-edition', 'light-lab', 'claude', 'midnight', 'github-light', 'custom']) {
    for (const accent of [...Object.keys(PANEL_ACCENT_VALUES), 'chartreuse']) {
      for (const accentChosen of [undefined, false, true]) {
        for (const themeRefreshPending of [undefined, false]) {
          const stored = { theme, accent, ...(accentChosen === undefined ? {} : { accentChosen }), ...(themeRefreshPending === undefined ? {} : { themeRefreshPending }), maxEntries: 750 };
          const name = JSON.stringify(stored);
          const panel = P.normalizePanelSettings(stored);
          const page = await optionsPage({ settings: stored });
          assert.equal(page.elements('theme').value, panel.theme, `${name}: theme shown`);
          // A corrupt accent shows the panel's fallback (final review M-7), never the raw value.
          assert.equal(page.elements('accent').value, panel.accentChosen ? panel.accent : 'theme', `${name}: accent shown`);
          const saved = await page.save();
          assert.deepEqual([saved.theme, saved.accentChosen, saved.themeRefreshPending, saved.maxEntries], [panel.theme, panel.accentChosen, panel.themeRefreshPending, 750], `${name}: saved`);
          // ... and Save never writes the corrupt value back: the stored accent is the panel's.
          assert.equal(saved.accent, panel.accent, `${name}: saved accent`);
        }
      }
    }
  }
});

test('options page shows a corrupt accent on a retired theme as the theme accent', async () => {
  const page = await optionsPage({ settings: { theme: 'claude', accent: 'chartreuse', accentChosen: true } });
  assert.equal(page.elements('theme').value, 'xray-light');
  assert.equal(page.elements('accent').value, 'theme');
  const saved = await page.save();
  assert.equal(saved.accentChosen, false);
  assert.equal(saved.themeRefreshPending, true, 'the panel still owes the user the refresh notice');
});

test('options page Save keeps a notice the panel already dismissed dismissed', async () => {
  const page = await optionsPage({ settings: { theme: 'operator', accent: 'blue' } });
  // The panel migrated the same record, and the user dismissed the notice, before this Save.
  await page.store({ settings: { theme: 'xray-dark', accent: 'blue', accentChosen: false, themeRefreshPending: false } });
  const saved = await page.save();
  assert.equal(saved.theme, 'xray-dark');
  assert.equal(saved.themeRefreshPending, false);
});

test('options page "Theme accent" hands the accent back to the theme', async () => {
  const page = await optionsPage({ settings: { theme: 'dracula', accent: 'coral', accentChosen: true } });
  assert.equal(page.elements('accent').value, 'coral');
  page.elements('accent').value = 'theme';
  const saved = await page.save();
  assert.equal(saved.accentChosen, false);
  assert.equal(saved.accent, 'coral', 'the swatch is remembered, not applied');
});

// Final review M-7: a corrupt stored accent with accentChosen on a lineup theme. The panel's
// normalizePanelSettings shows it as Amber (the accent fallback), still picked; the options page
// shows the same, offers no raw option for it, and Save writes Amber, not the corrupt value.
test('options page shows a corrupt picked accent as the panel does and never writes it back', async () => {
  const stored = { theme: 'dracula', accent: 'gold', accentChosen: true, themeRefreshPending: false };
  const panel = P.normalizePanelSettings(stored);
  assert.deepEqual([panel.accent, panel.accentChosen], ['blue', true], 'the panel falls back to Amber, picked');
  const page = await optionsPage({ settings: stored });
  assert.equal(page.elements('accent').value, 'blue');
  assert.deepEqual(page.elements('accent').options, [], 'no raw "gold" option is added');
  assert.equal(page.rootStyle()['--xray-accent'], P.accentSwatchValue(panel, 'blue'), 'the page paints the panel\'s Amber');
  let saved = await page.save();
  assert.equal(saved.accent, 'blue');
  // "Theme accent" keeps the remembered swatch: the panel's fallback, not the corrupt value.
  const again = await optionsPage({ settings: stored });
  again.change('accent', 'theme');
  saved = await again.save();
  assert.deepEqual([saved.accent, saved.accentChosen], ['blue', false]);
});

// Final review I-5 (spec S2): the options page uses the panel's two type roles. Everything on it is
// chrome — labels, selects, hints, Save, and the Settings number fields, which the panel's own
// Settings also sets in the UI sans (Task 5 ruling) — so the page takes the UI sans stack and
// shows no data; the mono Font stack stays defined for parity with the panel.
test('options page chrome uses the panel\'s UI sans stack, number fields included', () => {
  const html = readFileSync(new URL('../../settings/settings.html', import.meta.url), 'utf8');
  const tokensCss = readFileSync(new URL('../../src/panel/styles/tokens.css', import.meta.url), 'utf8');
  const css = html.match(/<style>([\s\S]*?)<\/style>/)[1].replace(/\/\*[\s\S]*?\*\//g, '');
  const rule = (sel) => css.match(new RegExp(`(?:^|\\})\\s*${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`))?.[1] ?? '';
  const panelUi = tokensCss.match(/--xray-font-ui:\s*([^;]+);/)[1].trim();
  assert.equal(rule(':root').match(/--xray-font-ui:\s*([^;]+);/)?.[1].trim(), panelUi, ':root carries the panel\'s --xray-font-ui stack');
  assert.match(rule('body'), /font-family:\s*var\(--xray-font-ui\);/, 'the page chrome is the UI sans');
  // Selects and number fields inherit it (font: inherit), as the panel's Settings fields are sans.
  assert.match(css, /select,\s*input\[type="number"\]\s*\{[^}]*font:\s*inherit;/, 'form fields inherit the UI sans');
  assert.doesNotMatch(css, /font-family:\s*var\(--xray-font\)/, 'nothing on the page is set in the data font');
});

// Final review I-5: a picked swatch is painted on the options page too — --xray-accent set on
// :root, the swatch solved for the shown preset exactly as the panel solves it
// (accentSwatchValue). settings.js cannot import the solver, so it keeps a literal table pinned
// here, value for value; the page's own :has() block (the theme accent) applies otherwise.
test('options page paints a picked swatch with the panel\'s solved value on every preset', async () => {
  for (const { id } of P.THEME_PRESETS) {
    for (const accent of Object.keys(PANEL_ACCENT_VALUES)) {
      const page = await optionsPage({ settings: { theme: id, accent, accentChosen: true, themeRefreshPending: false } });
      const want = P.accentSwatchValue(P.normalizePanelSettings({ theme: id }), accent);
      assert.equal(page.rootStyle()['--xray-accent'], want, `${id} + ${accent}`);
    }
    const page = await optionsPage({ settings: { theme: id, accent: 'teal', accentChosen: false, themeRefreshPending: false } });
    assert.equal(page.rootStyle()['--xray-accent'], undefined, `${id}: no pick, the theme's own accent`);
  }
  // Live, before Save: picking a swatch, changing the preset, and handing the accent back.
  const page = await optionsPage({ settings: { theme: 'xray-dark', accent: 'blue', accentChosen: false, themeRefreshPending: false } });
  page.change('accent', 'peach');
  assert.equal(page.rootStyle()['--xray-accent'], P.accentSwatchValue(P.normalizePanelSettings({ theme: 'xray-dark' }), 'peach'));
  page.change('theme', 'xray-light');
  assert.equal(page.rootStyle()['--xray-accent'], P.accentSwatchValue(P.normalizePanelSettings({ theme: 'xray-light' }), 'peach'));
  page.change('theme', 'custom');
  assert.equal(page.rootStyle()['--xray-accent'], undefined, 'Custom has no static palette here: the page stays on its default');
  page.change('theme', 'midnight');
  page.change('accent', 'theme');
  assert.equal(page.rootStyle()['--xray-accent'], undefined, '"Theme accent" hands it back to the preset block');
});

// A picked swatch on the options page keeps the Save button (accent on its 10% tint over the card)
// and its focus ring (accent vs --xray-bg) readable on every preset, at the preset's target.
test('options page: every picked swatch reads on the Save button and as its focus ring', () => {
  const lum = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const tint = (fg, host, a = 0.1) => '#' + [1, 3, 5].map(i => Math.round(parseInt(fg.slice(i, i + 2), 16) * a + parseInt(host.slice(i, i + 2), 16) * (1 - a)).toString(16).padStart(2, '0')).join('');
  const blocks = optionsPageBlocks();
  const problems = [];
  for (const { id, contrast } of P.THEME_PRESETS) {
    for (const accent of Object.keys(PANEL_ACCENT_VALUES)) {
      const value = P.accentSwatchValue(P.normalizePanelSettings({ theme: id }), accent);
      const save = ratio(value, tint(value, blocks[id]['--xray-surface']));
      if (save < contrast) problems.push(`${id} + ${accent} ${value}: Save ${save.toFixed(2)}`);
      const ring = ratio(value, blocks[id]['--xray-bg']);
      if (ring < (contrast === 7 ? 7 : 3)) problems.push(`${id} + ${accent} ${value}: focus ring ${ring.toFixed(2)}`);
    }
  }
  assert.deepEqual(problems, []);
});
