import test from 'node:test';
import assert from 'node:assert/strict';
import { apiEntry, logEntry, listOptions, entries as E, sessionIndex } from './harness.mjs';

const { buildSessionIndex } = sessionIndex;

test('buildSessionIndex derives bounded counts, endpoint groups, and search documents', () => {
  const entries = [
    apiEntry({ id: 'first', urlPath: '/users', status: 200, duration: 10, size: 10, responseRaw: JSON.stringify({ ok: true }) }),
    apiEntry({ id: 'second', urlPath: '/users', status: 503, duration: 30, size: 20, responseRaw: JSON.stringify({ error: 'down' }) }),
    logEntry({ id: 'third', message: 'worker log' }),
  ];

  const index = buildSessionIndex(entries);

  assert.equal(index.apiCount, 2);
  assert.equal(index.logCount, 1);
  assert.equal(index.errorCount, 1);
  assert.equal(index.totalBytes, 30);
  assert.equal(index.endpointGroups.get('/users')?.count, 2);
  assert.equal(index.endpointGroups.get('/users')?.errors, 1);
  assert.equal(index.endpointGroups.get('/users')?.totalBytes, 30);
  assert.equal(index.searchDocuments.get('second')?.fields.some(([label, text]) => label === 'Response body' && text.includes('down')), true);
  assert.equal(index.searchDocuments.get('second')?.entry, entries[1]);
});

test('buildSessionIndex is stable for an immutable array and rebuilds for a replacement identity', () => {
  const first = apiEntry({ id: 'stable', status: 200 });
  const entries = [first];
  const same = buildSessionIndex(entries);
  assert.strictEqual(buildSessionIndex(entries), same);

  const replacement = [first];
  const rebuilt = buildSessionIndex(replacement);
  assert.notStrictEqual(rebuilt, same);
  assert.strictEqual(rebuilt.searchDocuments.get('stable')?.entry, first);
});

test('indexed summaries and documents do not repeat body stringification', () => {
  let calls = 0;
  const body = { toJSON() { calls += 1; return { needle: true }; } };
  const entries = [apiEntry({ id: 'counted', responseRaw: body })];
  const index = buildSessionIndex(entries);
  const initialCalls = calls;

  assert.ok(initialCalls > 0);
  assert.equal(index.searchDocuments.get('counted')?.fields.some(([, text]) => text.includes('needle')), true);
  assert.equal(index.searchDocuments.get('counted')?.fields.some(([, text]) => text.includes('needle')), true);
  assert.equal(calls, initialCalls);
});

test('search documents stay capped and newest-first when given a disposable oversized fixture', () => {
  const entries = Array.from({ length: 5000 }, (_, index) => apiEntry({ id: `entry-${index}`, urlPath: `/entry-${index}` }));
  const indexed = buildSessionIndex(entries);

  assert.ok(indexed.searchDocuments.size <= 1000);
  assert.equal(indexed.searchDocuments.has('entry-4999'), true);
  assert.equal(indexed.searchDocuments.has('entry-0'), false);
});

for (const count of [1001, 5000]) {
  test(`indexed list matching covers all ${count} retained entries, including the oldest`, () => {
    const entries = Array.from({ length: count }, (_, i) => apiEntry({
      id: `list-${i}`, url: `https://example.test/item-${i}`, urlPath: `/item-${i}`, timestamp: i,
    }));
    const index = buildSessionIndex(entries);
    for (const query of ['/item-0', `/item-${count - 1}`, 'example.test', 'absent']) {
      const legacy = entries.filter(entry => E.matchesEntry(entry, query));
      const indexed = entries.filter(entry => E.matchesEntry(entry, query, index));
      assert.deepEqual(indexed, legacy, query);
      const model = E.buildEntryListModel(listOptions({ entries, index, query, apiGroupingMode: 'flat' }));
      assert.deepEqual(model.rows.map(row => row.entry.id), legacy.slice().reverse().map(entry => entry.id));
      assert.equal(model.matchingApiCount, legacy.length);
    }
    assert.equal(index.searchDocuments.size, 1000, 'transient misses never enlarge the retained map');
  });
}

for (const field of ['url', 'urlPath', 'message', 'contentType']) {
  test(`million-character ${field} stays bounded in the index without losing late list matches`, () => {
    const entry = apiEntry({ [field]: `${'x'.repeat(1_000_000)}late-marker` });
    const index = buildSessionIndex([entry]);
    const document = index.searchDocuments.get(entry.id);
    assert.ok(document.searchText.length <= 20_000, 'retained list-search text is capped');
    assert.ok(document.fields.every(([, text]) => text.length <= 20_000), 'retained global fields remain capped');
    for (const query of ['late-marker', 'absent']) {
      assert.equal(E.matchesEntry(entry, query, index), E.matchesEntry(entry, query));
    }
    assert.equal(E.matchesEntry(entry, 'late-marker', index), true);
    assert.strictEqual(buildSessionIndex(index.entries), index);
    assert.ok(document.searchText.length <= 20_000, 'transient matching does not backfill the oversized text');
  });
}

test('replacement entries with reused IDs cannot use stale indexed text or body flags', () => {
  const before = apiEntry({ id: 'patched', url: 'https://x/before', responseRaw: '{}' });
  const index = buildSessionIndex([before]);
  const after = { ...before, url: 'https://x/after', responseRaw: '{"ok":true}' };
  assert.equal(E.matchesEntry(after, 'after', index), true);
  assert.equal(E.getEntryFlags(after, [after], new Set(), 500, index).includes('empty'), false);
  const replacement = buildSessionIndex([after]);
  assert.notStrictEqual(replacement, index);
  assert.equal(replacement.searchDocuments.get(after.id).entry, after);
});
