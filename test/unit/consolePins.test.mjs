/* Console pins (spec P2): pinned requests `a`…`f` are panel-session state. They are
   never persisted, they drop with a notice when their entry is evicted, and the store
   is their source of truth for the evaluation engine (XRAY_Console.setPins). */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import './harness.mjs';

const { usePanelStore } = await import('../../src/panel/store.ts');
const { serializePanelPreferences } = await import('../../src/panel/models/panelPersistence.ts');

let synced;
beforeEach(() => {
  synced = [];
  window.XRAY_Store = { set: async () => {}, get: async () => undefined };
  window.XRAY_Console = { setContext() {}, clearVariables() {}, setPins: (pins) => synced.push(pins) };
  usePanelStore.setState({ ...usePanelStore.getInitialState(), settings: { ...usePanelStore.getInitialState().settings, maxEntries: 50 } });
});

const entry = (id, timestamp = 0) => ({ id, type: 'api', timestamp, method: 'GET', status: 200, url: `https://x/${id}`, urlPath: `/${id}` });
const store = () => usePanelStore.getState();
const letters = () => store().consolePins.map((pin) => pin.name);

test('pins take the next free letter a…f and refuse the 7th with a notice', () => {
  usePanelStore.setState({ entries: Array.from({ length: 8 }, (_, i) => entry(`e${i}`, i)) });
  assert.equal(store().pinConsoleRequest('e0'), 'a');
  assert.equal(store().pinConsoleRequest('e1'), 'b');
  assert.equal(store().pinConsoleRequest('e0'), 'a', 're-pinning the same request keeps its letter');
  assert.deepEqual(letters(), ['a', 'b']);
  for (let i = 2; i < 6; i += 1) store().pinConsoleRequest(`e${i}`);
  assert.deepEqual(letters(), ['a', 'b', 'c', 'd', 'e', 'f']);
  assert.equal(store().pinConsoleRequest('e6'), null);
  assert.deepEqual(letters(), ['a', 'b', 'c', 'd', 'e', 'f']);
  assert.match(store().toastMessage, /6 pins/);
  // A freed letter is reused.
  store().unpinConsoleRequest('b');
  assert.equal(store().pinConsoleRequest('e6'), 'b');
});

test('only captured API requests can be pinned', () => {
  usePanelStore.setState({ entries: [entry('e0'), { id: 'log1', type: 'log', message: 'x' }] });
  assert.equal(store().pinConsoleRequest('log1'), null);
  assert.equal(store().pinConsoleRequest('missing'), null);
  assert.deepEqual(letters(), []);
});

test('the engine receives every pin change as name → entry', () => {
  usePanelStore.setState({ entries: [entry('e0'), entry('e1')] });
  store().pinConsoleRequest('e1');
  assert.deepEqual(Object.keys(synced.at(-1)), ['a']);
  assert.equal(synced.at(-1).a.id, 'e1');
  store().unpinConsoleRequest('a');
  assert.deepEqual(synced.at(-1), {});
});

test('pins are never part of the persisted preferences', () => {
  usePanelStore.setState({ entries: [entry('e0')] });
  store().pinConsoleRequest('e0');
  const serialized = JSON.stringify(serializePanelPreferences(store()));
  assert.doesNotMatch(serialized, /consolePins/);
  assert.equal(serialized.includes('"e0"'), false, 'the pinned entry id is not persisted either');
});

test('an evicted pinned entry drops its pin with a notice (ingest)', () => {
  usePanelStore.setState({ entries: Array.from({ length: 50 }, (_, i) => entry(`e${i}`, i)) });
  store().pinConsoleRequest('e0');
  store().pinConsoleRequest('e40');
  store().addEntries([entry('n1', 100)]);
  assert.deepEqual(letters(), ['b'], 'e0 was the oldest unprotected entry');
  assert.equal(store().toastMessage, 'Pin a removed: request no longer captured');
  assert.deepEqual(Object.keys(synced.at(-1)), ['b']);

  store().addEntries(Array.from({ length: 45 }, (_, i) => entry(`m${i}`, 200 + i)));
  assert.deepEqual(letters(), [], 'e40 was evicted by the burst');
  assert.equal(store().toastMessage, 'Pin b removed: request no longer captured');
});

test('lowering maxEntries drops a pin whose entry is trimmed', () => {
  // maxEntries is clamped to ≥ 50, so start above it and lower to the floor.
  usePanelStore.setState({ settings: { ...store().settings, maxEntries: 100 }, entries: Array.from({ length: 60 }, (_, i) => entry(`e${i}`, i)) });
  store().pinConsoleRequest('e0');
  store().pinConsoleRequest('e59');
  store().updateSettings({ maxEntries: 50 });
  store().confirmPending(); // S2: lowering Max entries asks first; confirm to evict
  assert.equal(store().entries.length, 50);
  assert.ok(!store().entries.some((item) => item.id === 'e0'), 'e0 trimmed');
  assert.deepEqual(letters(), ['b']);
  assert.equal(store().toastMessage, 'Pin a removed: request no longer captured');
  assert.deepEqual(Object.keys(synced.at(-1)), ['b']);
});

test('an import that fills the buffer drops pins on the entries it displaces', () => {
  usePanelStore.setState({ entries: Array.from({ length: 50 }, (_, i) => entry(`e${i}`, i)) });
  store().pinConsoleRequest('e0');
  store().restoreEntries(Array.from({ length: 50 }, (_, i) => entry(`imp${i}`, 1000 + i)));
  assert.ok(!store().entries.some((item) => item.id === 'e0'), 'the import displaced e0');
  assert.deepEqual(letters(), []);
  assert.equal(store().toastMessage, 'Pin a removed: request no longer captured');
  assert.deepEqual(synced.at(-1), {});
});

test('several pins evicted at once are named in one notice', () => {
  usePanelStore.setState({ entries: Array.from({ length: 50 }, (_, i) => entry(`e${i}`, i)) });
  store().pinConsoleRequest('e0');
  store().pinConsoleRequest('e1');
  store().addEntries([entry('n1', 100), entry('n2', 101)]);
  assert.deepEqual(letters(), []);
  assert.equal(store().toastMessage, 'Pins a, b removed: requests no longer captured');
});

test('Clear console keeps pins; clearing the session drops them', () => {
  usePanelStore.setState({ entries: [entry('e0')] });
  store().pinConsoleRequest('e0');
  store().clearConsole();
  assert.deepEqual(letters(), ['a']);
  store().clearSession();
  assert.deepEqual(letters(), []);
  assert.deepEqual(synced.at(-1), {});
});

test('a patched pinned entry is re-sent to the engine (bodies land after the row)', async () => {
  usePanelStore.setState({ entries: [entry('e0'), entry('e1')] });
  store().pinConsoleRequest('e0');
  const before = synced.length;
  store().updateEntry({ id: 'e1', status: 500 });
  await new Promise((resolve) => setTimeout(resolve, 70));
  assert.equal(synced.length, before, 'an unpinned patch does not re-send');
  store().updateEntry({ id: 'e0', responseRaw: '{"late":true}' });
  await new Promise((resolve) => setTimeout(resolve, 70));
  assert.equal(synced.at(-1).a.responseRaw, '{"late":true}');
});
