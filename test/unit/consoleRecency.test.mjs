import test from 'node:test';
import assert from 'node:assert/strict';
import './harness.mjs';

const { createRecency, RECENCY_KEY } = await import('../../src/panel/models/consoleRecency.ts');

function memory(initial = []) {
  const store = { value: initial, writes: 0 };
  return { store, storage: { get: () => store.value, set: (v) => { store.value = v; store.writes++; } } };
}

test('recency: storage key', () => {
  assert.equal(RECENCY_KEY, 'console_completion_recency');
});

test('recency: the latest accept scores highest; unknown labels score 0', () => {
  const { store, storage } = memory();
  const r = createRecency(storage);
  assert.equal(r.score('pick'), 0);
  r.record('pin');
  r.record('pick');
  assert.ok(r.score('pick') > r.score('pin'));
  assert.ok(r.score('pin') > 0);
  assert.deepEqual(store.value, ['pick', 'pin'], 'newest first, persisted');
  r.record('pin');
  assert.deepEqual(store.value, ['pin', 'pick'], 're-accepting moves to the front without duplicates');
  assert.ok(r.score('pin') > r.score('pick'));
});

test('recency: capped at the limit (default 200)', () => {
  const { store, storage } = memory();
  const r = createRecency(storage);
  for (let i = 0; i < 250; i++) r.record(`v${i}`);
  assert.equal(store.value.length, 200);
  assert.equal(store.value[0], 'v249');
  assert.equal(r.score('v0'), 0, 'the oldest fall off');
  const small = createRecency(memory().storage, 3);
  for (const l of ['a', 'b', 'c', 'd']) small.record(l);
  assert.equal(small.score('a'), 0);
  assert.ok(small.score('d') > small.score('b'));
});

test('recency: reads what storage holds now and ignores junk', () => {
  const { store, storage } = memory(['x', 7, null, 'y']);
  const r = createRecency(storage);
  assert.ok(r.score('x') > r.score('y'));
  assert.equal(r.score('7'), 0);
  store.value = ['y'];
  assert.equal(r.score('x'), 0, 'storage replaced (hydrated later): the new list counts');
  assert.ok(r.score('y') > 0);
  store.value = 'nope';
  assert.equal(r.score('y'), 0);
  r.record('z');
  assert.deepEqual(store.value, ['z']);
});

/* Fix round 1: the editor's recency store is cleared with the console's own commands. */
test('Clear console (everything / my commands) forgets completion recency; page logs only keeps it', async () => {
  const writes = [];
  window.XRAY_Store = { get: async () => undefined, set: async (key, value) => { writes.push([key, value]); } };
  window.XRAY_Console = { setContext() {}, setPins() {}, clearVariables() {} };
  const { completionRecency } = await import('../../src/panel/runtime/completionRecency.ts');
  const { usePanelStore } = await import('../../src/panel/store.ts');
  completionRecency.record('pick');
  assert.ok(completionRecency.score('pick') > 0);
  usePanelStore.getState().clearConsole('page');
  assert.ok(completionRecency.score('pick') > 0, 'page logs only: kept');
  usePanelStore.getState().clearConsole('commands');
  assert.equal(completionRecency.score('pick'), 0, 'my commands: cleared');
  completionRecency.record('omit');
  usePanelStore.getState().clearConsole();
  assert.equal(completionRecency.score('omit'), 0, 'everything: cleared');
  await new Promise((r) => setTimeout(r, 0));
  assert.deepEqual(writes.at(-1), [RECENCY_KEY, []], 'the stored list is emptied too');
});
