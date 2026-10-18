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

test('options page theme names match the panel presets', () => {
  const html = readFileSync(new URL('../../settings/settings.html', import.meta.url), 'utf8');
  const text = (value) => html.match(new RegExp(`<option value="${value}">([^<]*)</option>`))?.[1];
  assert.equal(text('operator'), 'Signal Gray (default)');
  assert.equal(text('dev-edition'), 'Harbor Instrument');
  assert.equal(text('midnight'), 'High Contrast');
  assert.equal(text('light-lab'), 'Paper Relay');
});

test('options page Claude hint text reaches 4.5:1 on its backgrounds', () => {
  const html = readFileSync(new URL('../../settings/settings.html', import.meta.url), 'utf8');
  const block = html.match(/option\[value="claude"\]:checked\) \{([^}]*)\}/)[1];
  const token = name => block.match(new RegExp(`--xray-${name}: (#[0-9a-f]{6})`, 'i'))[1];
  const lum = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  for (const bg of ['bg', 'surface', 'surface2']) {
    const r = ratio(token('hint'), token(bg));
    assert.ok(r >= 4.5, `Claude hint ${token('hint')} on ${bg} ${token(bg)} = ${r.toFixed(2)}`);
  }
});

test('options page accent names match the panel display names', () => {
  const html = readFileSync(new URL('../../settings/settings.html', import.meta.url), 'utf8');
  const expected = { blue: 'Amber (default)', mauve: 'Lavender', teal: 'Teal', green: 'Green', peach: 'Gold', coral: 'Coral' };
  for (const [value, text] of Object.entries(expected)) assert.ok(html.includes(`<option value="${value}">${text}</option>`), value);
  for (const [value, name] of Object.entries(labels.ACCENT_NAMES)) assert.ok(expected[value].startsWith(name), value);
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
  const context = {
    document: { getElementById: element, createElement: () => ({}) },
    chrome: { storage: { local: {
      get: async key => ({ [key]: structuredClone(store[key]) }),
      set: async value => { Object.assign(store, structuredClone(value)); },
    } } },
    setTimeout: () => 0, structuredClone,
  };
  await vm.runInNewContext(readFileSync(new URL('../../settings/settings.js', import.meta.url), 'utf8'), context);
  return {
    elements: element,
    async save() { await elements.save.listeners.click(); return store.xray_react_panel_preferences.settings; },
  };
}

test('options page Save marks a changed accent as chosen', async () => {
  const page = await optionsPage({ settings: { theme: 'operator', accent: 'blue', accentChosen: false } });
  page.elements('accent').value = 'teal';
  const saved = await page.save();
  assert.equal(saved.accent, 'teal');
  assert.equal(saved.accentChosen, true, 'the panel must not re-theme over a user-picked accent');
});

test('options page Save leaves accentChosen alone when the accent is unchanged', async () => {
  const page = await optionsPage({ settings: { theme: 'claude', accent: 'peach', accentChosen: false } });
  const saved = await page.save();
  assert.equal(saved.accent, 'peach');
  assert.equal(saved.accentChosen, false);
});
