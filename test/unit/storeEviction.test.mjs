/* Behavioural tests for the entry-cap eviction in src/panel/models/entries.ts,
   which store.ts calls on ingest, on import, and when maxEntries changes.

   Two data-loss bugs lived here. Both were a `slice(-maxEntries)` that looked
   obviously correct and threw away exactly the entries the user cared about. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { entries as entriesModel } from './harness.mjs';

const { evictEntries } = entriesModel;

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
  // This models the merge restoreEntries now performs: reserve room for the incoming
  // entries first, then fill the remainder with the newest existing ones.
  const live = Array.from({ length: 1000 }, (_, index) => entry(`live${index}`, index));
  const fresh = Array.from({ length: 40 }, (_, index) => entry(`imported${index}`, index));

  const freshKept = fresh.slice(-1000);
  const room = Math.max(0, 1000 - freshKept.length);
  const merged = [...freshKept, ...evictEntries(live, room, new Set()).entries];

  assert.equal(merged.length, 1000, 'still bounded by the cap');
  assert.equal(merged.filter((item) => item.id.startsWith('imported')).length, 40, 'every imported entry survives');
  assert.equal(merged.filter((item) => item.id.startsWith('live')).length, 960);
  // The live entries that were dropped are the oldest ones.
  assert.ok(!ids(merged).includes('live0'));
  assert.ok(ids(merged).includes('live999'));
});
