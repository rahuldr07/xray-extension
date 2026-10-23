import test from 'node:test';
import assert from 'node:assert/strict';
import './harness.mjs';

const { HISTORY_KEY, EDITOR_TABS_KEY, HISTORY_LIMIT, appendHistory, restoreEditorTabs, connectionKeyForFile, connectionKeyForProfile } =
  await import('../../src/panel/models/sqlHistory.ts');

const item = (sql, at = 1) => ({ sql, at, durationMs: 2, rowCount: 3, ok: true });

test('constants', () => {
  assert.equal(HISTORY_KEY, 'sql_history');
  assert.equal(EDITOR_TABS_KEY, 'sql_editor_tabs');
  assert.equal(HISTORY_LIMIT, 200);
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

test('connectionKeyForFile', () => {
  assert.equal(connectionKeyForFile('a.db', 10), 'sqlite:a.db:10');
});

test('connectionKeyForProfile keys remote history by profile id', () => {
  assert.equal(connectionKeyForProfile('p1'), 'remote:p1');
});
