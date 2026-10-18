/* Spec V1, V2, P2: the default is XRAY Dark with its own accent, retired theme ids migrate on
 * load (with the accentChosen rule), a preset owns its accent until the user picks one, and a
 * migration raises a refresh notice that waits, stored with the settings, until it is dismissed. */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { panelSettings as P } from './harness.mjs';

const { usePanelStore } = await import('../../src/panel/store.ts');
const { DEFAULT_PANEL_SETTINGS, normalizePanelSettings, resolveAccentValue } = P;

// V2: each retired id, the preset it now loads as, the accent it applied by default, and that preset's label.
const V2 = [
  ['operator', 'xray-dark', 'blue', 'XRAY Dark'],
  ['dev-edition', 'xray-dark', 'coral', 'XRAY Dark'],
  ['light-lab', 'xray-light', 'blue', 'XRAY Light'],
  ['claude', 'xray-light', 'coral', 'XRAY Light'],
];
const ACCENTS = ['blue', 'mauve', 'teal', 'green', 'peach', 'coral'];
const notice = (label) => `Themes were refreshed — you're on ${label}. Change it in Settings → Appearance.`;
const settled = () => new Promise((resolve) => setTimeout(resolve, 0));

function memoryStore(record) {
  const data = { react_panel_preferences: record };
  window.XRAY_Store = {
    get: async (key, fallback) => (key in data ? structuredClone(data[key]) : fallback),
    set: async (key, value) => { data[key] = structuredClone(value); },
  };
  return data;
}

beforeEach(() => {
  window.XRAY_Store = { set: async () => {}, get: async () => undefined };
  window.postMessage = () => {};
  usePanelStore.setState({ ...usePanelStore.getInitialState() });
});

test('V2 migration matrix: every retired id, every stored accent, with and without a stored flag', () => {
  for (const [retired, to, defaultAccent] of V2) {
    for (const accent of ACCENTS) {
      for (const accentChosen of [undefined, false, true]) {
        const stored = { theme: retired, accent, ...(accentChosen === undefined ? {} : { accentChosen }) };
        const name = JSON.stringify(stored);
        const loaded = normalizePanelSettings(stored);
        assert.equal(loaded.theme, to, `${name}: loads as ${to}`);
        assert.equal(loaded.accent, accent, `${name}: the stored accent is kept`);
        // The retired preset's own default accent becomes the new preset's accent; any other was picked.
        assert.equal(loaded.accentChosen, accent !== defaultAccent, `${name}: accentChosen`);
        assert.equal(loaded.themeRefreshPending, true, `${name}: raises the refresh notice`);
        assert.deepEqual(normalizePanelSettings(JSON.parse(JSON.stringify(loaded))), loaded, `${name}: stable once stored`);
      }
    }
  }
});

test('V2: a corrupt stored accent on a retired theme falls back to the theme accent', () => {
  for (const [retired, to] of V2) {
    for (const accent of ['chartreuse', '', null, 7]) {
      const loaded = normalizePanelSettings({ theme: retired, accent, accentChosen: true });
      assert.equal(loaded.theme, to);
      assert.equal(loaded.accentChosen, false, `${retired} + ${JSON.stringify(accent)}: not a pick`);
      assert.equal(resolveAccentValue(loaded), undefined, `${retired} + ${JSON.stringify(accent)}: the ${to} accent shows`);
    }
  }
});

// Before the refresh, High Contrast set Gold itself (and stored it as the accent); its own accent is
// now a cyan. Settings stored before the refresh carry no themeRefreshPending flag.
test('legacy High Contrast: the old default Gold hands over to the cyan theme accent; other accents stay', () => {
  for (const accentChosen of [undefined, false, true]) {
    const gold = normalizePanelSettings({ theme: 'midnight', accent: 'peach', ...(accentChosen === undefined ? {} : { accentChosen }) });
    assert.equal(gold.accentChosen, false, `Gold (${accentChosen}): the theme accent`);
    assert.equal(gold.themeRefreshPending, true, 'the accent visibly changed, so the notice is raised');
    assert.equal(resolveAccentValue(gold), undefined);
    const teal = normalizePanelSettings({ theme: 'midnight', accent: 'teal', ...(accentChosen === undefined ? {} : { accentChosen }) });
    assert.equal(teal.accentChosen, true, `Teal (${accentChosen}): what the user saw stays`);
    assert.equal(teal.themeRefreshPending, false, 'nothing changed for this user');
    assert.equal(normalizePanelSettings({ theme: 'midnight', accent: 'chartreuse', accentChosen: true }).accentChosen, false, 'corrupt: the theme accent');
  }
  // After the refresh (the flag is stored), Gold on High Contrast is an ordinary pick.
  const picked = normalizePanelSettings({ theme: 'midnight', accent: 'peach', accentChosen: true, themeRefreshPending: false });
  assert.equal(picked.accentChosen, true);
  assert.equal(picked.themeRefreshPending, false);
  assert.equal(resolveAccentValue(picked), P.accentSwatchValue(picked, 'peach'));
});

test('V2: a retired preset\'s default accent shows the new preset\'s accent; a picked one keeps rendering', () => {
  for (const [retired, to, defaultAccent] of V2) {
    assert.equal(resolveAccentValue(normalizePanelSettings({ theme: retired, accent: defaultAccent })), undefined,
      `${retired} + its default accent: no inline accent, so the ${to} block accent shows`);
    const picked = normalizePanelSettings({ theme: retired, accent: 'teal', accentChosen: false });
    assert.equal(resolveAccentValue(picked), P.accentSwatchValue(picked, 'teal'), `${retired} + Teal keeps Teal, solved for ${to}`);
  }
});

test('V2: retired ids are no longer themes, and nothing else migrates', () => {
  const ids = P.THEME_PRESETS.map(({ id }) => id);
  for (const [retired, to] of V2) {
    assert.equal(ids.includes(retired), false, `${retired} is not offered`);
    assert.deepEqual(P.RETIRED_THEMES[retired].to, to);
    assert.equal(P.retiredTheme(retired), retired);
  }
  for (const id of [...ids, 'custom']) {
    assert.equal(P.retiredTheme(id), null, `${id} is current`);
    // Stored after the refresh (themeRefreshPending present): nothing migrates, the flag is honoured.
    const stored = { theme: id, accent: 'teal', accentChosen: false, themeRefreshPending: false };
    assert.deepEqual(normalizePanelSettings(stored), { ...DEFAULT_PANEL_SETTINGS, ...stored }, id);
  }
  for (const value of ['toString', '__proto__', 'constructor', '', null, undefined, 7]) assert.equal(P.retiredTheme(value), null, String(value));
});

test('V1: a fresh install and Reset start on XRAY Dark with the theme\'s own accent', () => {
  assert.equal(DEFAULT_PANEL_SETTINGS.theme, 'xray-dark');
  assert.equal(DEFAULT_PANEL_SETTINGS.accentChosen, false);
  assert.equal(resolveAccentValue(DEFAULT_PANEL_SETTINGS), undefined, 'no inline accent on a fresh install');
  usePanelStore.setState({ settings: { ...DEFAULT_PANEL_SETTINGS, theme: 'dracula', accent: 'coral', accentChosen: true } });
  usePanelStore.getState().resetSettings();
  const { settings } = usePanelStore.getState();
  assert.equal(settings.theme, 'xray-dark');
  assert.equal(settings.accentChosen, false);
  assert.equal(resolveAccentValue(settings), undefined, 'Reset hands the accent back to the theme');
});

test('P2: every preset shows its own accent while none is picked; switching presets never picks one', () => {
  for (const preset of P.THEME_PRESETS) {
    usePanelStore.getState().updateSettings({ theme: preset.id });
    const { settings } = usePanelStore.getState();
    assert.equal(settings.theme, preset.id);
    assert.equal(settings.accentChosen, false, `${preset.id}: still not chosen`);
    assert.equal(settings.accent, DEFAULT_PANEL_SETTINGS.accent, `${preset.id}: the stored accent is not rewritten`);
    assert.equal(resolveAccentValue(settings), undefined, `${preset.id}: its block accent ${preset.preview.accent} shows`);
  }
});

test('P2: a picked swatch overrides every preset, solved for it; "Use theme accent" hands the accent back', () => {
  usePanelStore.getState().updateSettings({ accent: 'teal', accentChosen: true });
  for (const preset of P.THEME_PRESETS) {
    usePanelStore.getState().updateSettings({ theme: preset.id });
    const { settings } = usePanelStore.getState();
    assert.equal(settings.accent, 'teal', `${preset.id}: the picked accent survives the theme change`);
    assert.equal(settings.accentChosen, true);
    const value = resolveAccentValue(settings);
    assert.match(value, /^#[0-9a-f]{6}$/, `${preset.id}: a concrete solved hex`);
    assert.equal(value, P.accentSwatchValue(settings, 'teal'), `${preset.id}: what the Teal swatch previews`);
  }
  usePanelStore.getState().updateSettings({ accentChosen: false }); // the "Use theme accent" control
  const { settings } = usePanelStore.getState();
  assert.equal(settings.accentChosen, false);
  assert.equal(resolveAccentValue(settings), undefined);
});

test('P2: the custom theme keeps its own explicit accent', () => {
  const custom = { ...DEFAULT_PANEL_SETTINGS, theme: 'custom', customTheme: { ...DEFAULT_PANEL_SETTINGS.customTheme, accent: '#f59e0b' } };
  assert.equal(resolveAccentValue({ ...custom, accentChosen: false }), '#f59e0b');
  assert.equal(resolveAccentValue({ ...custom, accentChosen: true, accent: 'teal' }), '#f59e0b');
});

test('V2: the refresh notice names the current theme and reads exactly as specified', () => {
  assert.equal(P.themeRefreshNotice('xray-dark'), notice('XRAY Dark'));
  assert.equal(P.themeRefreshNotice('xray-light'), notice('XRAY Light'));
  assert.equal(P.themeRefreshNotice('midnight'), notice('High Contrast'));
  // It is worded when it is shown, so a user who moved to Custom on another surface meanwhile reads that.
  assert.equal(P.themeRefreshNotice('custom'), notice('Custom'));
});

test('accent swatch fallbacks: an unknown swatch paints Amber; on Custom each swatch shows what it writes', () => {
  const custom = { ...DEFAULT_PANEL_SETTINGS, theme: 'custom', customTheme: { ...DEFAULT_PANEL_SETTINGS.customTheme, accent: '#123456' } };
  for (const accent of ACCENTS) assert.equal(P.accentSwatchValue(custom, accent), P.PANEL_ACCENT_VALUES[accent], `Custom ${accent}`);
  assert.equal(P.accentSwatchValue(custom, 'nope'), P.PANEL_ACCENT_VALUES.blue);
  for (const theme of ['xray-dark', 'xray-light', 'midnight']) {
    const settings = { ...DEFAULT_PANEL_SETTINGS, theme };
    assert.equal(P.accentSwatchValue(settings, 'nope'), P.accentSwatchValue(settings, 'blue'), theme);
  }
  assert.equal(resolveAccentValue({ ...custom, customTheme: undefined }), P.DEFAULT_PANEL_SETTINGS.customTheme.accent, 'a custom theme without colours uses the default custom accent');
});

test('V2: loading a retired theme stores the new id and a pending notice at once; only dismissing clears it', async () => {
  for (const [retired, to, defaultAccent] of V2) {
    usePanelStore.setState({ ...usePanelStore.getInitialState() });
    const data = memoryStore({ activeTab: 'logs', settings: { theme: retired, accent: defaultAccent, maxEntries: 750 } });
    await usePanelStore.getState().restorePreferences();
    let state = usePanelStore.getState();
    assert.equal(state.settings.theme, to, retired);
    assert.equal(state.settings.accentChosen, false, retired);
    assert.equal(state.settings.themeRefreshPending, true, `${retired}: the notice is pending`);
    assert.equal(state.settings.maxEntries, 750, `${retired}: other settings load unchanged`);
    assert.equal(state.activeTab, 'logs', `${retired}: other preferences load unchanged`);
    assert.equal(state.toastMessage, null, `${retired}: the notice is not a receipt toast`);
    await settled();
    assert.equal(data.react_panel_preferences.settings.theme, to, `${retired}: the new id is stored at once`);
    assert.equal(data.react_panel_preferences.settings.themeRefreshPending, true, `${retired}: and so is the pending notice`);
    assert.equal(data.react_panel_preferences.settings.maxEntries, 750);
    assert.equal(data.react_panel_preferences.activeTab, 'logs');
    // Another load (a reload, or a surface restored in the background) does not spend it.
    state.showToast('Receipt');
    await usePanelStore.getState().restorePreferences();
    state = usePanelStore.getState();
    assert.equal(state.settings.theme, to);
    assert.equal(state.settings.themeRefreshPending, true, `${retired}: still pending after another load`);
    // Reset keeps it too; dismissing is the only way to clear it, and that is stored.
    state.resetSettings();
    assert.equal(usePanelStore.getState().settings.themeRefreshPending, true, `${retired}: Reset does not spend it`);
    usePanelStore.getState().dismissThemeRefresh();
    assert.equal(usePanelStore.getState().settings.themeRefreshPending, false);
    await settled();
    assert.equal(data.react_panel_preferences.settings.themeRefreshPending, false, `${retired}: dismissal is stored`);
    await usePanelStore.getState().restorePreferences();
    assert.equal(usePanelStore.getState().settings.themeRefreshPending, false, `${retired}: shown once`);
  }
});

test('V2: current themes load without a notice and without rewriting the preferences', async () => {
  let writes = 0;
  for (const theme of ['xray-dark', 'gruvbox-dark', 'midnight', 'custom']) {
    usePanelStore.setState({ ...usePanelStore.getInitialState() });
    memoryStore({ settings: { theme, accent: 'blue' } });
    const set = window.XRAY_Store.set;
    window.XRAY_Store.set = async (key, value) => { if (key === 'react_panel_preferences') writes += 1; await set(key, value); };
    await usePanelStore.getState().restorePreferences();
    await settled();
    assert.equal(usePanelStore.getState().settings.theme, theme);
    assert.equal(usePanelStore.getState().settings.themeRefreshPending, false, theme);
  }
  assert.equal(writes, 0, 'restoring current settings does not rewrite them');
});

// ── The legacy marker ───────────────────────────────────────────────────────
// Settings stored before the theme refresh are told apart by a missing themeRefreshPending, so
// every write of the preference record must carry it as a boolean, or the next load treats the
// record as legacy and hands a High Contrast user's picked Gold back to the theme accent.
test('every panel write of the preferences stores themeRefreshPending as a boolean', async () => {
  const data = memoryStore({ settings: { theme: 'midnight', accent: 'peach', accentChosen: true, themeRefreshPending: false } });
  await usePanelStore.getState().restorePreferences();
  assert.equal(usePanelStore.getState().settings.accentChosen, true, 'Gold picked after the refresh is a pick');
  // An unrelated settings change goes through the panel's one writer (persistPanelPreferences).
  usePanelStore.getState().updateSettings({ density: 'spacious' });
  await settled();
  assert.equal(data.react_panel_preferences.settings.themeRefreshPending, false);
  // In-memory settings that lack the key (state set without normalising) still store a boolean.
  const withoutKey = { ...usePanelStore.getState().settings };
  delete withoutKey.themeRefreshPending;
  usePanelStore.setState({ settings: withoutKey });
  usePanelStore.getState().setActiveTab('logs'); // a non-settings preference write
  await settled();
  assert.equal(typeof data.react_panel_preferences.settings.themeRefreshPending, 'boolean', 'a key-less state is not stored as legacy');
  // So the pick survives the next load.
  await usePanelStore.getState().restorePreferences();
  assert.equal(usePanelStore.getState().settings.theme, 'midnight');
  assert.equal(usePanelStore.getState().settings.accentChosen, true);
  assert.equal(resolveAccentValue(usePanelStore.getState().settings), P.accentSwatchValue(usePanelStore.getState().settings, 'peach'));
});

// Readers may only read. A new writer must also be covered by the legacy-marker checks above (the
// panel) or the options-page parity tests (test/unit/settingsContent.test.mjs) before it is listed.
test('the preference record has exactly the known writers', () => {
  const root = new URL('../../', import.meta.url);
  const skip = new Set(['node_modules', 'dist', 'output', 'test', 'docs', '.git', '.superpowers', 'graphify-out']);
  const found = [];
  const walk = (dir) => {
    for (const name of readdirSync(new URL(dir, root))) {
      const path = dir + name;
      if (skip.has(name) || name.startsWith('.')) continue;
      if (statSync(new URL(path, root)).isDirectory()) walk(path + '/');
      else if (/\.(?:[cm]?js|tsx?|html)$/.test(name) && /react_panel_preferences|REACT_PANEL_PREFERENCES_KEY/.test(readFileSync(new URL(path, root), 'utf8'))) found.push(path);
    }
  };
  walk('');
  assert.deepEqual(found.sort(), ['content/content.js', 'settings/settings.js', 'src/panel/models/panelPersistence.ts', 'src/panel/store.ts']);
  const read = (path) => readFileSync(new URL(path, root), 'utf8');
  // content.js reads the capture toggles before the panel mounts; it never writes the record.
  const content = read('content/content.js');
  assert.deepEqual([...content.matchAll(/.{0,12}react_panel_preferences/g)].map(([m]) => m.trim()), ["store.get('react_panel_preferences"]);
  // The panel writes only the serialised preferences, through persistPanelPreferences.
  const store = read('src/panel/store.ts');
  assert.deepEqual([...store.matchAll(/setStoredValue\(REACT_PANEL_PREFERENCES_KEY,[^)]*\)/g)].map(([m]) => m), ['setStoredValue(REACT_PANEL_PREFERENCES_KEY, serializePanelPreferences(state)']);
  assert.equal([...store.matchAll(/REACT_PANEL_PREFERENCES_KEY/g)].length, 3, 'import, read and the one write');
  // panelPersistence.ts defines the key and the serialiser, and writes nothing itself.
  assert.doesNotMatch(read('src/panel/models/panelPersistence.ts'), /setStoredValue|XRAY_Store|chrome\.storage/);
  // The options page writes the whole record back through one chrome.storage call.
  const options = read('settings/settings.js');
  assert.equal([...options.matchAll(/chrome\.storage\.local\.set\(/g)].length, 1);
  assert.match(options, /themeRefreshPending,\n/, 'and that record carries the marker');
});
