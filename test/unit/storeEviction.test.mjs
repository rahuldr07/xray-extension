/* Behavioural tests for the entry-cap eviction in src/panel/models/entries.ts,
   which store.ts calls on ingest, on import, and when maxEntries changes.

   Two data-loss bugs lived here. Both were a `slice(-maxEntries)` that looked
   obviously correct and threw away exactly the entries the user cared about. */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { entries as entriesModel, utils } from './harness.mjs';

const { evictEntries } = entriesModel;
const { eventEntry } = utils;
const { usePanelStore } = await import('../../src/panel/store.ts');

beforeEach(() => {
  window.XRAY_Store = { set: async () => {}, get: async () => undefined };
  usePanelStore.setState({ ...usePanelStore.getInitialState(), settings: { ...usePanelStore.getInitialState().settings, maxEntries: 50 } });
});

const entry = (id, timestamp = 0) => ({ id, type: 'api', timestamp, method: 'GET', status: 200, url: `https://x/${id}` });
const ids = (list) => list.map((item) => item.id);

test('FIXED: eviction keeps pinned entries and the current selection', () => {
  // Eviction was a blind entries.slice(-maxEntries), which defeated the entire point of
  // pinning — "keep this one while I keep browsing" — and left pinnedIds and selectedId
  // pointing at entries that no longer existed, so the UI showed a selection while
  // selectedEntry() returned null. pinnedIds is persisted, so it also grew forever.
  const all = Array.from({ length: 60 }, (_, index) => entry(`e${index}`, index));
  const result = evictEntries(all, 50, new Set(['e0', 'e3']));

  assert.equal(result.entries.length, 50);
  assert.ok(ids(result.entries).includes('e0'), 'the pinned first entry survives');
  assert.ok(ids(result.entries).includes('e3'), 'the selected entry survives');
  // The oldest UNPINNED entries are the ones that go.
  assert.ok(!ids(result.entries).includes('e1'));
  assert.deepEqual([...result.dropped].sort(), ['e1', 'e2', ...Array.from({ length: 8 }, (_, i) => `e${i + 4}`)].sort());
  // Arrival order is preserved — this is not a re-sort.
  assert.deepEqual(ids(result.entries), ids(result.entries).slice().sort((a, b) => Number(a.slice(1)) - Number(b.slice(1))));
});

test('the cap is a memory bound, not a suggestion: pins alone cannot exceed it', () => {
  const all = Array.from({ length: 60 }, (_, index) => entry(`e${index}`, index));
  const everythingPinned = new Set(ids(all));
  const result = evictEntries(all, 50, everythingPinned);

  assert.equal(result.entries.length, 50, 'still bounded');
  assert.equal(result.dropped.size, 10);
  assert.ok(!ids(result.entries).includes('e0'), 'the oldest pins go first');
  assert.ok(ids(result.entries).includes('e59'), 'the newest survive');
});

test('under the cap nothing is dropped and the array is returned untouched', () => {
  const all = Array.from({ length: 10 }, (_, index) => entry(`e${index}`, index));
  const result = evictEntries(all, 50, new Set());
  assert.equal(result.entries, all, 'same reference: no work done');
  assert.equal(result.dropped.size, 0);
});

test('FIXED: importing into a session at the cap keeps the imported entries', () => {
  // restoreEntries did `[...fresh, ...entries].slice(-maxEntries)`. The imported
  // entries are at the FRONT and slice(-n) trims from the front, so importing into a
  // session already at the cap (1000 by default — minutes of traffic on a busy app)
  // kept exactly the entries that were already there and dropped every imported one,
  // while the modal reported "Imported 40 HAR entries."
  //
  const live = Array.from({ length: 50 }, (_, index) => entry(`live${index}`, index));
  const fresh = Array.from({ length: 40 }, (_, index) => entry(`imported${index}`, index));
  usePanelStore.setState({ entries: live, selectedId: 'live0', pinnedIds: new Set(['live1']) });
  const result = usePanelStore.getState().restoreEntries(fresh);
  const merged = usePanelStore.getState().entries;
  assert.deepEqual(result, { accepted: 40, duplicates: 0, omitted: 0 });
  assert.equal(merged.length, 50, 'still bounded by the cap');
  assert.equal(merged.filter((item) => item.id.startsWith('imported')).length, 40, 'every imported entry survives');
  assert.equal(merged.filter((item) => item.id.startsWith('live')).length, 10);
  assert.ok(ids(merged).includes('live0'));
  assert.ok(ids(merged).includes('live1'));
  assert.ok(!ids(merged).includes('live2'));
  assert.ok(ids(merged).includes('live49'));
});

test('restoreEntries counts existing and within-file duplicates once and derives matching events', () => {
  const existing = entry('existing');
  const first = entry('incoming', 10);
  usePanelStore.setState({ entries: [existing], consoleEvents: [{ id: 'evt_existing', type: 'network', entryId: 'existing' }] });
  const result = usePanelStore.getState().restoreEntries([existing, first, entry('incoming', 20), { id: 'log', type: 'log', message: 'synthetic log', timestamp: 30 }]);
  assert.deepEqual(result, { accepted: 2, duplicates: 2, omitted: 0 });
  const state = usePanelStore.getState();
  assert.deepEqual(ids(state.entries), ['incoming', 'log', 'existing']);
  assert.equal(state.entries[0].timestamp, 10, 'first occurrence wins');
  assert.deepEqual(ids(state.consoleEvents), ['evt_incoming', 'evt_log', 'evt_existing']);
  assert.equal(state.consoleEvents[1].type, 'log');
  assert.equal(state.consoleEvents[1].message, 'synthetic log');
  assert.deepEqual(usePanelStore.getState().restoreEntries([first]), { accepted: 0, duplicates: 1, omitted: 0 });
  assert.deepEqual(usePanelStore.getState().restoreEntries([]), { accepted: 0, duplicates: 0, omitted: 0 });
});

test('oversized imports reserve pinned/selected entries and only derive events for accepted entries', () => {
  usePanelStore.setState({ entries: [entry('selected'), entry('pinned'), entry('other')], selectedId: 'selected', pinnedIds: new Set(['pinned']) });
  const incoming = Array.from({ length: 60 }, (_, i) => entry(`import${i}`, i));
  assert.deepEqual(usePanelStore.getState().restoreEntries([...incoming, incoming[0]]), { accepted: 48, duplicates: 1, omitted: 12 });
  const state = usePanelStore.getState();
  assert.equal(state.entries.length, 50);
  assert.deepEqual(ids(state.entries), [...Array.from({ length: 48 }, (_, i) => `import${i + 12}`), 'selected', 'pinned']);
  assert.equal(state.selectedId, 'selected');
  assert.deepEqual([...state.pinnedIds], ['pinned']);
  assert.equal(state.consoleEvents.length, 48);
  assert.deepEqual(state.consoleEvents.map(event => event.entryId), Array.from({ length: 48 }, (_, i) => `import${i + 12}`));
});

test('all-protected session accepts no incoming entries and stays bounded', () => {
  const entries = Array.from({ length: 50 }, (_, i) => entry(`p${i}`));
  usePanelStore.setState({ entries, pinnedIds: new Set(ids(entries)) });
  assert.deepEqual(usePanelStore.getState().restoreEntries([entry('omitted')]), { accepted: 0, duplicates: 0, omitted: 1 });
  assert.deepEqual(usePanelStore.getState().entries, entries);
  assert.deepEqual(usePanelStore.getState().consoleEvents, []);
});

test('console command preparation switches both tabs once per preparation without evaluating or changing selection', () => {
  let executions = 0;
  window.XRAY_Console = { execute() { executions += 1; } };
  const initial = usePanelStore.getState();
  assert.equal(initial.consolePreparationId, 0);
  usePanelStore.setState({ activeTab: 'api', consoleMiniTab: 'network', selectedId: 'selected' });
  const snapshots = [];
  const unsubscribe = usePanelStore.subscribe(state => snapshots.push([state.consoleDraft, state.activeTab, state.consoleMiniTab, state.consolePreparationId]));
  initial.insertConsoleCommand('schema(res)');
  initial.insertConsoleCommand('schema(res)');
  unsubscribe();
  assert.deepEqual(snapshots, [['schema(res)', 'console', 'console', 1], ['schema(res)', 'console', 'console', 2]]);
  assert.equal(usePanelStore.getState().selectedId, 'selected');
  initial.setConsoleDraft('edited');
  initial.addConsoleEvent({ id: 'capture', type: 'network', message: 'synthetic' });
  assert.equal(usePanelStore.getState().consolePreparationId, 2);
  assert.equal(executions, 0);
});

test('Console request context resolves patched status, body, and timing from the authoritative entry', async () => {
  const initial = entry('current', 1);
  initial.status = 200;
  initial.responseRaw = '{"state":"old"}';
  initial.duration = 12;
  initial.timing = { totalMs: 12 };
  const contexts = [];
  window.XRAY_Console = { setContext: (value) => contexts.push(value) };
  usePanelStore.setState({
    entries: [initial],
    consoleEvents: [{ id: 'evt_current', type: 'network', level: 'info', timestamp: 1, message: 'GET 200 /current', entryId: 'current', args: [initial] }],
    selectedId: 'current',
  });

  usePanelStore.getState().updateEntry({
    id: 'current',
    status: 503,
    responseRaw: '{"state":"new"}',
    duration: 420,
    timing: { totalMs: 420, ttfbMs: 180 },
  });
  await new Promise((resolve) => setTimeout(resolve, 70));

  const state = usePanelStore.getState();
  const current = state.entries[0];
  const resolved = eventEntry(state.consoleEvents[0], state.entries);
  assert.equal(resolved, current);
  assert.equal(resolved.status, 503);
  assert.equal(resolved.responseRaw, '{"state":"new"}');
  assert.equal(resolved.duration, 420);
  assert.deepEqual(resolved.timing, { totalMs: 420, ttfbMs: 180 });
  assert.equal(contexts.at(-1), current);
});

test('replay and experiment entry points refuse non-replayable entries before page dispatch', () => {
  let posts = 0;
  window.__XRAY_bridgeToken = 'synthetic-token';
  window.postMessage = () => { posts += 1; };
  const invalid = { id: 'log-entry', type: 'log', source: 'console', url: 'https://safe.test/log', message: 'payload' };
  const reason = usePanelStore.getState().replayEntry(invalid);
  assert.match(reason, /only API/i);
  assert.equal(posts, 0);
  assert.equal(usePanelStore.getState().draftExperiment(invalid), null);
  assert.match(usePanelStore.getState().toastMessage, /only API/i);
});
