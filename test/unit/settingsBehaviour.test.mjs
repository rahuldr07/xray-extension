/* Task 3 (S1-S4): confirmation setting, max-entries lowering, accent choice, reset keeps layout. */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { panelSettings as P } from './harness.mjs';

const { usePanelStore } = await import('../../src/panel/store.ts');
const { DEFAULT_PANEL_SETTINGS, normalizePanelSettings } = P;

const entry = (id, timestamp = 0) => ({ id, type: 'api', timestamp, method: 'GET', status: 200, url: `https://x/${id}` });
const seed = (count, settings = {}) => usePanelStore.setState({
  entries: Array.from({ length: count }, (_, i) => entry(`e${i}`, i)),
  settings: { ...DEFAULT_PANEL_SETTINGS, ...settings },
  pendingConfirmation: null,
  pinnedIds: new Set(),
  selectedId: null,
});

beforeEach(() => {
  window.XRAY_Store = { set: async () => {}, get: async () => undefined };
  usePanelStore.setState({ ...usePanelStore.getInitialState() });
});

test('confirmation on: requestConfirmation opens the dialog and does not run', () => {
  seed(3);
  let ran = 0;
  usePanelStore.getState().requestConfirmation({ title: 'T', message: 'M', confirmLabel: 'Go', onConfirm: () => { ran += 1; } });
  assert.equal(ran, 0);
  assert.equal(usePanelStore.getState().pendingConfirmation.title, 'T');
});

test('confirmation off runs immediately', () => {
  seed(3, { confirmDestructiveActions: false });
  let ran = 0;
  usePanelStore.getState().requestConfirmation({ title: 'T', message: 'M', confirmLabel: 'Go', onConfirm: () => { ran += 1; } });
  assert.equal(ran, 1);
  assert.equal(usePanelStore.getState().pendingConfirmation, null);
});

test('max entries lower asks first (on): entries unchanged until confirm', () => {
  seed(100);
  usePanelStore.getState().updateSettings({ maxEntries: 50 });
  let state = usePanelStore.getState();
  assert.ok(state.pendingConfirmation, 'dialog requested');
  assert.equal(state.entries.length, 100);
  assert.equal(state.settings.maxEntries, 1000, 'setting not applied until confirmed');
  state.confirmPending();
  state = usePanelStore.getState();
  assert.equal(state.entries.length, 50);
  assert.equal(state.settings.maxEntries, 50);
});

test('max entries lower with confirmation off evicts immediately', () => {
  seed(100, { confirmDestructiveActions: false });
  usePanelStore.getState().updateSettings({ maxEntries: 50 });
  const state = usePanelStore.getState();
  assert.equal(state.pendingConfirmation, null);
  assert.equal(state.entries.length, 50);
});

test('max entries change that evicts nothing does not ask', () => {
  seed(10);
  usePanelStore.getState().updateSettings({ maxEntries: 500 });
  assert.equal(usePanelStore.getState().pendingConfirmation, null);
  assert.equal(usePanelStore.getState().settings.maxEntries, 500);
});

test('theme keeps chosen accent; never-chosen takes the preset accent', () => {
  seed(0);
  usePanelStore.getState().updateSettings({ accent: 'teal', accentChosen: true });
  usePanelStore.getState().updateSettings({ theme: 'dev-edition' });
  assert.equal(usePanelStore.getState().settings.accent, 'teal');
  seed(0);
  usePanelStore.getState().updateSettings({ theme: 'dev-edition' });
  assert.equal(usePanelStore.getState().settings.accent, 'coral');
  assert.equal(usePanelStore.getState().settings.accentChosen, false);
});

test('legacy settings: accent equal to the theme default is not chosen; otherwise chosen', () => {
  assert.equal(DEFAULT_PANEL_SETTINGS.accentChosen, false);
  assert.equal(normalizePanelSettings({ theme: 'dev-edition', accent: 'coral' }).accentChosen, false);
  assert.equal(normalizePanelSettings({ theme: 'operator', accent: 'blue' }).accentChosen, false);
  assert.equal(normalizePanelSettings({ theme: 'operator', accent: 'teal' }).accentChosen, true);
  assert.equal(normalizePanelSettings({ theme: 'operator', accent: 'teal', accentChosen: false }).accentChosen, false);
});

test('reset keeps layout and evicts to the restored max immediately', () => {
  seed(1200, { maxEntries: 5000, panelWidth: 700, dockSide: 'left', apiSplit: 300, logsSplit: 250, firstRunDismissed: true, theme: 'midnight' });
  usePanelStore.getState().resetSettings();
  const s = usePanelStore.getState();
  assert.equal(s.settings.panelWidth, 700);
  assert.equal(s.settings.dockSide, 'left');
  assert.equal(s.settings.apiSplit, 300);
  assert.equal(s.settings.logsSplit, 250);
  assert.equal(s.settings.firstRunDismissed, true);
  assert.equal(s.settings.theme, DEFAULT_PANEL_SETTINGS.theme);
  assert.equal(s.settings.maxEntries, 1000);
  assert.equal(s.entries.length, 1000);
});

test('legacy settings load unchanged: old keys survive a normalize round-trip', () => {
  const stored = { maxEntries: 750, verySlowThresholdMs: 3000, defaultDetailView: 'raw', slowThresholdMs: 900 };
  const loaded = normalizePanelSettings(JSON.parse(JSON.stringify(stored)));
  assert.equal(loaded.maxEntries, 750);
  assert.equal(loaded.verySlowThresholdMs, 3000);
  assert.equal(loaded.defaultDetailView, 'raw');
  assert.equal(loaded.slowThresholdMs, 900);
});
