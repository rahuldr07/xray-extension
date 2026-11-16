import test from 'node:test';
import assert from 'node:assert/strict';
import './harness.mjs';

const { addRecent, removeRecent, restoreRecent, lastOpenedLabel, RECENT_FILES_LIMIT } = await import('../../src/panel/models/sqlRecent.ts');

const entry = (name, lastOpened, size = 10) => ({ name, size, lastOpened, handle: { kind: 'file', name } });

test('addRecent puts the file first, replaces its older entry and keeps five', () => {
  assert.equal(RECENT_FILES_LIMIT, 5);
  let list = [];
  for (let i = 1; i <= 7; i++) list = addRecent(list, entry(`f${i}.db`, i));
  assert.deepEqual(list.map((e) => e.name), ['f7.db', 'f6.db', 'f5.db', 'f4.db', 'f3.db']);
  list = addRecent(list, entry('f4.db', 8));
  assert.deepEqual(list.map((e) => e.name), ['f4.db', 'f7.db', 'f6.db', 'f5.db', 'f3.db']);
  assert.equal(list.filter((e) => e.name === 'f4.db').length, 1, 'one entry per file');
  // Same name, different size: another file.
  list = addRecent(list, entry('f4.db', 9, 99));
  assert.deepEqual(list.map((e) => `${e.name}:${e.size}`).slice(0, 2), ['f4.db:99', 'f4.db:10']);
});

test('removeRecent drops one file', () => {
  const list = [entry('a.db', 2), entry('b.db', 1)];
  assert.deepEqual(removeRecent(list, { name: 'a.db', size: 10 }).map((e) => e.name), ['b.db']);
  assert.deepEqual(removeRecent(list, { name: 'a.db', size: 11 }).length, 2);
});

test('restoreRecent keeps well-formed entries, newest first, deduplicated and capped', () => {
  assert.deepEqual(restoreRecent(undefined), []);
  assert.deepEqual(restoreRecent({}), []);
  const raw = [
    entry('old.db', 1),
    { name: 'nohandle.db', size: 1, lastOpened: 5 },
    { name: 7, size: 1, lastOpened: 5, handle: {} },
    entry('new.db', 9),
    entry('old.db', 4),
    null,
    ...Array.from({ length: 6 }, (_, i) => entry(`x${i}.db`, 2 + i / 10)),
  ];
  const list = restoreRecent(raw);
  assert.equal(list.length, 5);
  assert.deepEqual(list.slice(0, 2).map((e) => [e.name, e.lastOpened]), [['new.db', 9], ['old.db', 4]]);
});

test('lastOpenedLabel reads today, yesterday or a date', () => {
  const now = new Date(2026, 9, 23, 15, 0).getTime();
  assert.equal(lastOpenedLabel(new Date(2026, 9, 23, 9, 5).getTime(), now), 'Today 09:05');
  assert.equal(lastOpenedLabel(new Date(2026, 9, 22, 23, 0).getTime(), now), 'Yesterday');
  assert.equal(lastOpenedLabel(new Date(2026, 9, 1).getTime(), now), new Date(2026, 9, 1).toLocaleDateString());
});
