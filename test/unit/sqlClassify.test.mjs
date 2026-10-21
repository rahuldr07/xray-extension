import test from 'node:test';
import assert from 'node:assert/strict';
import './harness.mjs';

const { classifyStatement } = await import('../../src/panel/models/sqlClassify.ts');

function rows(kind, dialect, list) {
  for (const [sql, reason, d] of list) {
    const got = classifyStatement(sql, d ?? dialect);
    assert.deepEqual(got, { kind, reason }, sql);
  }
}

test('read statements', () => {
  rows('read', 'sqlite', [
    ['select * from t', ''],
    ['with a as (select 1) select * from a', ''],
    ['values (1)', ''],
    ['explain select 1', ''],
    ['pragma table_info(t)', ''],
    ['show tables', '', 'mysql'],
    ['select replace(a, "x", "y") from t', ''],
    ['select 1;', ''],
  ]);
});

test('write statements', () => {
  rows('write', 'sqlite', [
    ['insert into t values (1)', 'INSERT'],
    ['update t set a=1 where id=2', 'UPDATE'],
    ['create table x(a)', 'CREATE'],
    ['pragma query_only = 0', 'PRAGMA assignment'],
    ['pragma main.query_only = 0', 'PRAGMA assignment'],
    ['pragma query_only(0)', 'PRAGMA assignment'],
    ["attach 'x.db' as x", 'ATTACH'],
    ['set search_path = a', 'SET', 'postgres'],
    ['explain analyze delete from t where id=1', 'DELETE', 'postgres'],
    ['with x as (delete from t where id=1 returning *) select * from x', 'DELETE', 'postgres'],
    ['delete from t where id in (select id from u)', 'DELETE'],
    ['select * into x from t', 'SELECT INTO', 'postgres'],
    ['replace into t values (1)', 'REPLACE'],
  ]);
});

test('dangerous statements', () => {
  rows('dangerous', 'sqlite', [
    ['drop table t', 'DROP'],
    ['truncate t', 'TRUNCATE', 'postgres'],
    ['alter table t add c int', 'ALTER'],
    ['grant select on t to u', 'GRANT', 'postgres'],
    ['revoke select on t from u', 'REVOKE', 'postgres'],
    ['delete from t', 'DELETE without WHERE'],
    ['update t set a = 1', 'UPDATE without WHERE'],
    ['update t set a = (select 1 where true)', 'UPDATE without WHERE'],
    ['with x as (select 1 where true) delete from t', 'DELETE without WHERE'],
    ['explain analyze drop table t', 'DROP', 'postgres'],
    ['explain (analyze) delete from t', 'DELETE without WHERE', 'postgres'],
    ['selec * frm t', 'could not parse'],
    ['select (1', 'could not parse'],
    ['', 'could not parse'],
  ]);
});

test('unknown or maintenance statements are write', () => {
  rows('write', 'sqlite', [
    ['vacuum', 'VACUUM'],
    ['frobnicate the table', 'unrecognized statement'],
  ]);
});

test('only the first statement is classified', () => {
  assert.deepEqual(classifyStatement('select 1; drop table t', 'sqlite'), { kind: 'read', reason: '' });
});

test('words inside strings, comments and quoted identifiers are not keywords', () => {
  rows('read', 'sqlite', [
    ["select 'drop table t; delete' as a", ''],
    ['select "delete" from t -- insert', ''],
    ['/* drop */ select 1', ''],
  ]);
});
