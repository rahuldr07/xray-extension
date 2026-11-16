import test from 'node:test';
import assert from 'node:assert/strict';
import './harness.mjs';

const {
  HISTORY_KEY, EDITOR_TABS_KEY, CONNECTION_KEYS_KEY, HISTORY_LIMIT, HISTORY_SQL_LIMIT, TAB_SQL_LIMIT, CONNECTION_KEY_LIMIT,
  appendHistory, restoreEditorTabs, connectionKeyForFile, connectionKeyForProfile, legacyConnectionKeyForFile, parseLegacyFileKey,
  capHistorySql, capTabSql, tabsForStorage, restoreHistory, mergeHistory, restoreUsage, pruneConnectionKeys, mergeSqlStorage,
  migrateLegacyFileKeys, sqlStorageBytes: sqlStorageBytesOf,
} = await import('../../src/panel/models/sqlHistory.ts');

const item = (sql, at = 1) => ({ sql, at, durationMs: 2, rowCount: 3, ok: true });

test('constants', () => {
  assert.equal(HISTORY_KEY, 'sql_history');
  assert.equal(EDITOR_TABS_KEY, 'sql_editor_tabs');
  assert.equal(CONNECTION_KEYS_KEY, 'sql_connection_keys');
  assert.equal(HISTORY_LIMIT, 200);
  // #18: bounded, since chrome.storage.local's quota is shared with session persistence.
  assert.equal(HISTORY_SQL_LIMIT, 10_000);
  assert.equal(TAB_SQL_LIMIT, 200_000);
  assert.equal(CONNECTION_KEY_LIMIT, 50);
});

test('appendHistory is immutable and newest first', () => {
  const a = { k: [item('select 1')] };
  const b = appendHistory(a, 'k', item('select 2', 2));
  assert.deepEqual(a.k.map((i) => i.sql), ['select 1']);
  assert.deepEqual(b.k.map((i) => i.sql), ['select 2', 'select 1']);
  assert.deepEqual(appendHistory(b, 'other', item('x')).k, b.k);
});

test('appendHistory caps at 200', () => {
  let all = {};
  for (let i = 0; i < 250; i++) all = appendHistory(all, 'k', item(`select ${i}`, i));
  assert.equal(all.k.length, 200);
  assert.equal(all.k[0].sql, 'select 249');
  assert.equal(all.k[199].sql, 'select 50');
});

test('appendHistory replaces a repeat of the newest entry only', () => {
  let all = appendHistory({}, 'k', item('a', 1));
  all = appendHistory(all, 'k', item('b', 2));
  all = appendHistory(all, 'k', { ...item('b', 3), durationMs: 9 });
  assert.deepEqual(all.k.map((i) => [i.sql, i.at, i.durationMs]), [['b', 3, 9], ['a', 1, 2]]);
  all = appendHistory(all, 'k', item('a', 4));
  assert.equal(all.k.length, 3);
});

test('restoreEditorTabs defaults on bad input', () => {
  for (const raw of [null, undefined, 5, 'x', {}, [], { k: [] }, { k: [{ title: 'x' }] }]) {
    const tabs = restoreEditorTabs(raw, 'k');
    assert.equal(tabs.length, 1);
    assert.equal(tabs[0].title, 'Query 1');
    assert.equal(tabs[0].sql, '');
    assert.equal(tabs[0].maxRows, 1000);
    assert.equal(typeof tabs[0].id, 'string');
  }
});

test('restoreEditorTabs clamps maxRows, drops tabs without string sql, assigns ids', () => {
  const raw = {
    k: [
      { id: 'keep', title: 'A', sql: 'select 1', maxRows: 999999 },
      { title: 'B', sql: 'select 2', maxRows: 'nope' },
      { id: 'bad', title: 'C', sql: 7, maxRows: 5 },
      { title: 5, sql: '', maxRows: 0 },
    ],
  };
  const tabs = restoreEditorTabs(raw, 'k');
  assert.equal(tabs.length, 3);
  assert.deepEqual([tabs[0].id, tabs[0].maxRows], ['keep', 50000]);
  assert.equal(tabs[1].maxRows, 1000);
  assert.equal(typeof tabs[1].id, 'string');
  assert.notEqual(tabs[1].id, tabs[2].id);
  assert.equal(tabs[2].title, 'Query 3');
  assert.equal(tabs[2].maxRows, 1);
});

// #18: the key no longer carries the size, which changed with every save and orphaned the history.
test('connectionKeyForFile survives a save: the name plus a stable id, or the name alone', () => {
  assert.equal(connectionKeyForFile('a.db', 'f1'), 'sqlite-id:f1:a.db');
  assert.equal(connectionKeyForFile('a.db', null), 'sqlite-name:a.db');
  assert.equal(connectionKeyForFile('a.db'), 'sqlite-name:a.db');
  // The old key, kept to migrate from; no new key can parse as one.
  assert.equal(legacyConnectionKeyForFile('a.db', 10), 'sqlite:a.db:10');
  assert.deepEqual(parseLegacyFileKey('sqlite:a.db:10'), { name: 'a.db', size: 10 });
  assert.deepEqual(parseLegacyFileKey('sqlite:my:file.db:7'), { name: 'my:file.db', size: 7 });
  for (const key of ['sqlite-name:a.db:10', 'sqlite-id:f1:a.db', 'remote:p1', 'sqlite:a.db', 'sqlite:a.db:x']) {
    assert.equal(parseLegacyFileKey(key), null, key);
  }
});

test('capHistorySql keeps 10,000 characters at most, ending in an SQL comment marker', () => {
  assert.equal(capHistorySql('select 1'), 'select 1');
  const exact = 'x'.repeat(HISTORY_SQL_LIMIT);
  assert.equal(capHistorySql(exact), exact);
  const long = 'select ' + 'a'.repeat(50_000);
  const cut = capHistorySql(long);
  assert.equal(cut.length <= HISTORY_SQL_LIMIT, true);
  assert.ok(cut.length > HISTORY_SQL_LIMIT - 200, 'keeps almost all of the limit');
  const marker = cut.slice(cut.lastIndexOf('\n'));
  assert.match(marker, /^\n-- XRAY kept the first part of this statement in history; \d+ characters were cut\.$/);
  const kept = cut.slice(0, cut.lastIndexOf('\n'));
  assert.ok(long.startsWith(kept));
  assert.equal(Number(/(\d+) characters/.exec(marker)[1]), long.length - kept.length, 'the marker counts what was cut');
  // Never ends on half a surrogate pair.
  const emoji = '😀'.repeat(HISTORY_SQL_LIMIT);
  const head = capHistorySql(emoji).split('\n')[0];
  assert.equal(head.length % 2, 0);
});

test('appendHistory caps the stored SQL, and a repeat of a long statement still collapses', () => {
  const long = 'select ' + 'b'.repeat(20_000);
  let all = appendHistory({}, 'k', item(long, 1));
  all = appendHistory(all, 'k', item(long, 2));
  assert.equal(all.k.length, 1);
  assert.equal(all.k[0].at, 2);
  assert.ok(all.k[0].sql.length <= HISTORY_SQL_LIMIT);
});

test('editor tab text is capped at 200,000 characters when stored and when restored', () => {
  assert.equal(capTabSql('select 1'), 'select 1');
  const long = 'c'.repeat(TAB_SQL_LIMIT + 5);
  assert.equal(capTabSql(long).length, TAB_SQL_LIMIT);
  const tabs = [{ id: 't1', title: 'Q', sql: long, maxRows: 10 }, { id: 't2', title: 'R', sql: 'x', maxRows: 10 }];
  const stored = tabsForStorage(tabs);
  assert.equal(stored[0].sql.length, TAB_SQL_LIMIT);
  assert.equal(tabs[0].sql.length, TAB_SQL_LIMIT + 5, 'the live tab is not changed');
  assert.equal(stored[1], tabs[1]);
  assert.equal(restoreEditorTabs({ k: tabs }, 'k')[0].sql.length, TAB_SQL_LIMIT);
});

test('restoreHistory keeps items with SQL and a time, caps their SQL and drops the rest', () => {
  assert.deepEqual(restoreHistory(null), {});
  assert.deepEqual(restoreHistory([]), {});
  const raw = {
    k: [
      item('a', 3),
      { sql: 'x'.repeat(HISTORY_SQL_LIMIT + 1), at: 2, durationMs: 1, rowCount: null, ok: false, error: 'boom' },
      // A NaN duration was stored as null: the statement is kept, with the detail filled in.
      { sql: 'select 9', at: 1, durationMs: null, ok: true },
      { sql: 5, at: 1 }, { sql: 'no time' }, null,
    ],
    empty: [],
    bad: 'x',
  };
  const out = restoreHistory(raw);
  assert.deepEqual(Object.keys(out), ['k']);
  assert.equal(out.k.length, 3);
  assert.ok(out.k[1].sql.length <= HISTORY_SQL_LIMIT);
  assert.equal(out.k[1].error, 'boom');
  assert.equal(out.k[1].ok, false);
  assert.deepEqual(out.k[2], { sql: 'select 9', at: 1, durationMs: 0, rowCount: null, ok: true });
});

test('mergeHistory unions two pages, newest first, and collapses a repeat across pages', () => {
  const a = [item('s3', 30), item('s1', 10)];
  const b = [item('s2', 20), item('s1', 10)];
  assert.deepEqual(mergeHistory(a, b).map((i) => i.sql), ['s3', 's2', 's1']);
  // Page A ran 'q' at 5, page B ran 'q' at 6: one entry, the newer.
  const merged = mergeHistory([item('q', 5)], [item('q', 6)]);
  assert.deepEqual(merged.map((i) => i.at), [6]);
  const many = Array.from({ length: 150 }, (_, i) => item(`a${i}`, i));
  const more = Array.from({ length: 150 }, (_, i) => item(`b${i}`, 1000 + i));
  const capped = mergeHistory(many, more);
  assert.equal(capped.length, HISTORY_LIMIT);
  assert.equal(capped[0].sql, 'b149');
});

test('pruneConnectionKeys keeps the 50 most recently used keys across all three records', () => {
  const storage = { history: {}, tabs: {}, usage: {} };
  for (let i = 0; i < 60; i++) {
    storage.usage[`k${i}`] = 1000 + i;
    storage.tabs[`k${i}`] = [{ id: `t${i}`, title: 'Q', sql: '', maxRows: 1 }];
  }
  // Only history: its newest item is its last use.
  storage.history.h = [item('x', 5000)];
  // Never used and no history: goes first.
  storage.tabs.orphan = [];
  const out = pruneConnectionKeys(storage);
  const keys = new Set([...Object.keys(out.history), ...Object.keys(out.tabs), ...Object.keys(out.usage)]);
  assert.equal(keys.size, CONNECTION_KEY_LIMIT);
  assert.ok(keys.has('h'));
  assert.ok(!keys.has('orphan'));
  assert.ok(keys.has('k59') && !keys.has('k10'));
  assert.equal(pruneConnectionKeys({ history: {}, tabs: { a: [] }, usage: {} }).tabs.a.length, 0, 'under the limit: unchanged');
  assert.deepEqual(restoreUsage({ a: 1, b: 'x', c: Infinity }), { a: 1 });
});

// #18: two SQL pages no longer overwrite each other's whole record.
test('mergeSqlStorage folds one page\'s changes into what another page stored, per key', () => {
  const tab = (id, sql) => ({ id, title: 'Q', sql, maxRows: 1 });
  const stored = {
    history: { a: [item('other page', 20)], b: [item('b old', 1)] },
    tabs: { a: [tab('x', 'other a')], b: [tab('y', 'other b')] },
    usage: { a: 20, b: 1 },
  };
  const local = {
    history: { a: [item('mine', 10)], b: [] },
    tabs: { a: [tab('m', 'mine a')], b: [tab('stale', 'stale b')], c: [tab('c', 'c'.repeat(TAB_SQL_LIMIT + 1))] },
    usage: { a: 10, c: 30, legacy: 5 },
  };
  const out = mergeSqlStorage(stored, local, { history: new Set(['a']), tabs: new Set(['a', 'c']), removed: new Set(['legacy']) });
  assert.deepEqual(out.history.a.map((i) => i.sql), ['other page', 'mine'], 'history merges');
  assert.deepEqual(out.history.b.map((i) => i.sql), ['b old'], 'an untouched key keeps what is stored');
  assert.equal(out.tabs.a[0].sql, 'mine a', 'this page\'s tabs win for the key it changed');
  assert.equal(out.tabs.b[0].sql, 'other b', 'but not for a key it did not change');
  assert.equal(out.tabs.c[0].sql.length, TAB_SQL_LIMIT);
  assert.deepEqual(out.usage, { a: 20, b: 1, c: 30 });
});

test('migrateLegacyFileKeys moves every old size key of the file to the new key', () => {
  const tab = (id) => [{ id, title: 'Q', sql: id, maxRows: 1 }];
  const storage = {
    history: { 'sqlite:a.db:10': [item('old', 1)], 'sqlite:a.db:20': [item('older save', 2)], 'sqlite:b.db:10': [item('b', 3)] },
    tabs: { 'sqlite:a.db:10': tab('at10'), 'sqlite:a.db:20': tab('at20'), 'sqlite:b.db:10': tab('b') },
    usage: { 'sqlite:a.db:20': 7 },
  };
  const key = connectionKeyForFile('a.db', 'f1');
  // The file is 30 bytes now (saved since): no exact match, so the tabs come from the newest history.
  const { storage: out, moved } = migrateLegacyFileKeys(storage, 'a.db', 30, key);
  assert.deepEqual(moved.sort(), ['sqlite:a.db:10', 'sqlite:a.db:20']);
  assert.deepEqual(out.history[key].map((i) => i.sql), ['older save', 'old']);
  assert.equal(out.tabs[key][0].id, 'at20');
  assert.equal(out.usage[key], 7);
  assert.ok(!('sqlite:a.db:10' in out.history) && !('sqlite:a.db:20' in out.tabs));
  assert.ok(out.history['sqlite:b.db:10'], 'another file keeps its key');
  // An exact size match wins for the tabs.
  assert.equal(migrateLegacyFileKeys(storage, 'a.db', 10, key).storage.tabs[key][0].id, 'at10');
  // Nothing to move: unchanged.
  const none = migrateLegacyFileKeys(storage, 'c.db', 1, 'sqlite-name:c.db');
  assert.equal(none.storage, storage);
  assert.deepEqual(none.moved, []);
});

test('connectionKeyForProfile keys remote history by profile id', () => {
  assert.equal(connectionKeyForProfile('p1'), 'remote:p1');
});

// Fix round 1: a byte budget across the three records, so SQL storage cannot starve session saves.
test('pruneConnectionKeys evicts whole keys, least recently used first, to fit the byte budget', async () => {
  const { SQL_STORAGE_BUDGET, SQL_STORAGE_QUOTA_BUDGET, sqlStorageBytes, utf8Bytes } = await import('../../src/panel/models/sqlHistory.ts');
  assert.equal(SQL_STORAGE_BUDGET, 4_000_000);
  assert.equal(SQL_STORAGE_QUOTA_BUDGET, 2_000_000);
  assert.equal(utf8Bytes('aé😀'), 1 + 2 + 4);
  const storage = { history: {}, tabs: {}, usage: {} };
  // Ten keys of ~100 KB each; k0 is the oldest.
  for (let i = 0; i < 10; i++) {
    storage.tabs[`k${i}`] = [{ id: `t${i}`, title: 'Q', sql: 'x'.repeat(100_000), maxRows: 1 }];
    storage.usage[`k${i}`] = 1000 + i;
  }
  const total = sqlStorageBytes(storage);
  assert.ok(total > 1_000_000 && total < 1_010_000);
  const out = pruneConnectionKeys(storage, { budget: 450_000 });
  assert.deepEqual(Object.keys(out.tabs).sort(), ['k6', 'k7', 'k8', 'k9']);
  assert.ok(sqlStorageBytes(out) <= 450_000);
  assert.deepEqual(Object.keys(out.usage).sort(), ['k6', 'k7', 'k8', 'k9'], 'a key goes from every record');
  // The open connection's key is never evicted, even when it is the oldest.
  const kept = pruneConnectionKeys(storage, { budget: 450_000, keep: 'k0' });
  assert.deepEqual(Object.keys(kept.tabs).sort(), ['k0', 'k7', 'k8', 'k9']);
  assert.ok(sqlStorageBytes(kept) <= 450_000);
  // Under budget: the same object back.
  assert.equal(pruneConnectionKeys(storage), storage);
});

test('pruneConnectionKeys trims the open key\'s oldest history when it alone is over the budget', () => {
  const big = Array.from({ length: 50 }, (_, i) => item(`select ${i} ${'y'.repeat(9_000)}`, 100 - i));
  const out = pruneConnectionKeys({ history: { open: big, old: [item('x', 1)] }, tabs: {}, usage: {} }, { budget: 100_000, keep: 'open' });
  assert.deepEqual(Object.keys(out.history), ['open']);
  assert.ok(out.history.open.length < 50 && out.history.open.length > 0);
  assert.equal(out.history.open[0].at, 100, 'the newest items stay');
});

test('editor tabs: at most 20 per connection, stored and restored', async () => {
  const { EDITOR_TAB_LIMIT } = await import('../../src/panel/models/sqlHistory.ts');
  assert.equal(EDITOR_TAB_LIMIT, 20);
  const tabs = Array.from({ length: 25 }, (_, i) => ({ id: `t${i}`, title: 'Q', sql: '', maxRows: 1 }));
  assert.equal(tabsForStorage(tabs).length, 20);
  assert.equal(restoreEditorTabs({ k: tabs }, 'k').length, 20);
});

test('a pagehide journal round-trips through JSON and folds in like a page\'s changes', async () => {
  const { journalFor, parseJournal } = await import('../../src/panel/models/sqlHistory.ts');
  const local = {
    history: { a: [item('mine', 5)], b: [item('other', 1)] },
    tabs: { a: [{ id: 't', title: 'Q', sql: 'typed just before close', maxRows: 1 }] },
    usage: { a: 9, b: 1 },
  };
  assert.equal(journalFor(local, { history: new Set(), tabs: new Set(), removed: new Set() }), null);
  const journal = journalFor(local, { history: new Set(['a']), tabs: new Set(['a']), removed: new Set(['sqlite:a.db:1']) });
  assert.deepEqual(Object.keys(journal.storage.history), ['a'], 'only changed keys');
  const parsed = parseJournal(JSON.stringify(journal));
  const stored = { history: { a: [item('stored', 3)] }, tabs: {}, usage: {} };
  const out = mergeSqlStorage(stored, parsed.storage, parsed.changes);
  assert.deepEqual(out.history.a.map((i) => i.sql), ['mine', 'stored']);
  assert.equal(out.tabs.a[0].sql, 'typed just before close');
  assert.equal(parseJournal('not json'), null);
  assert.equal(parseJournal(null), null);
});

// Fix round 2: a journal folded in late must not overwrite tabs another page stored since.
test('a stale journal does not overwrite newer stored tabs; a fresh one does', async () => {
  const { parseJournal, journalFor } = await import('../../src/panel/models/sqlHistory.ts');
  const tab = (sql) => [{ id: 't', title: 'Q', sql, maxRows: 1 }];
  const journal = parseJournal(JSON.stringify(journalFor(
    { history: {}, tabs: { a: tab('journaled') }, usage: { a: 100 } },
    { history: new Set(), tabs: new Set(['a']), removed: new Set() },
  )));
  const newer = { history: {}, tabs: { a: tab('newer from another page') }, usage: { a: 200 } };
  assert.equal(mergeSqlStorage(newer, journal.storage, journal.changes, { journal: true }).tabs.a[0].sql, 'newer from another page');
  const older = { history: {}, tabs: { a: tab('older') }, usage: { a: 50 } };
  assert.equal(mergeSqlStorage(older, journal.storage, journal.changes, { journal: true }).tabs.a[0].sql, 'journaled');
  // The live page's own overlay always wins for the keys it changed.
  assert.equal(mergeSqlStorage(newer, journal.storage, journal.changes).tabs.a[0].sql, 'journaled');
});

// Fix round 2: the open key's tabs are bounded too, when they alone are over the budget.
test('pruneConnectionKeys trims the open key\'s stored tab text, last tabs first, once its history is gone', () => {
  const tabs = Array.from({ length: 5 }, (_, i) => ({ id: `t${i}`, title: 'Q', sql: `${i}`.repeat(40_000), maxRows: 1 }));
  const out = pruneConnectionKeys({ history: { open: [item('x', 1)] }, tabs: { open: tabs }, usage: { open: 1 } }, { budget: 100_000, keep: 'open' });
  assert.equal(out.history.open, undefined, 'history goes first');
  assert.equal(out.tabs.open.length, 5, 'every tab is kept');
  assert.ok(sqlStorageBytesOf(out) <= 100_000);
  assert.equal(out.tabs.open[0].sql.length, 40_000, 'the first tabs keep their text');
  assert.ok(out.tabs.open[4].sql.length < 40_000, 'the last tab is cut');
});
