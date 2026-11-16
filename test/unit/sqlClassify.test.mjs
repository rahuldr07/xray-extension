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

test('every statement is classified; the most severe wins', () => {
  rows('dangerous', 'sqlite', [['select 1; drop table t', 'DROP']]);
  rows('write', 'sqlite', [
    ['pragma table_info(t); pragma query_only=0', 'PRAGMA assignment'],
    ['select 1; insert into t values (1)', 'INSERT'],
  ]);
  rows('dangerous', 'mysql', [['show tables; drop table t', 'DROP']]);
});

test('bare pragmas are read only when allowlisted', () => {
  rows('write', 'sqlite', [
    ['pragma optimize', 'PRAGMA'],
    ['pragma incremental_vacuum', 'PRAGMA'],
    ['pragma main.incremental_vacuum', 'PRAGMA'],
    ['pragma wal_checkpoint', 'PRAGMA'],
  ]);
  rows('read', 'sqlite', [
    ['pragma schema_version', ''],
    ['pragma main.user_version', ''],
  ]);
});

test('words inside strings, comments and quoted identifiers are not keywords', () => {
  rows('read', 'sqlite', [
    ["select 'drop table t; delete' as a", ''],
    ['select "delete" from t -- insert', ''],
    ['/* drop */ select 1', ''],
  ]);
});

test('transaction control is read in sqlite and postgres (Ruling R19)', () => {
  const forms = [
    'begin', 'begin transaction', 'begin deferred', 'begin immediate transaction', 'begin exclusive transaction',
    'commit', 'commit transaction', 'end', 'end transaction',
    'rollback', 'rollback transaction', 'rollback to s1', 'rollback to savepoint s1', 'rollback transaction to savepoint s1',
    'savepoint s1', 'release s1', 'release savepoint s1',
  ];
  for (const dialect of ['sqlite', 'postgres']) {
    rows('read', dialect, forms.map((sql) => [sql, '']));
  }
  rows('read', 'sqlite', [['begin; select 1; commit', '']]);
});

test('an exact statement keyword is never treated as a typo', () => {
  rows('write', 'sqlite', [['begin foo bar', 'unrecognized statement']]);
  rows('dangerous', 'sqlite', [['selec * from t', 'could not parse']]);
});

test('changesSchema: DDL-like first keywords only (remote schema refresh)', async () => {
  const { changesSchema, firstKeyword } = await import('../../src/panel/models/sqlClassify.ts');
  for (const [sql, d] of [
    ['CREATE TABLE t (a int)', 'postgres'],
    ['  -- c\n alter table t add b int', 'postgres'],
    ['drop view v', 'mysql'],
    ['RENAME TABLE a TO b', 'mysql'],
    ['truncate t', 'postgres'],
    ["COMMENT ON TABLE t IS 'x'", 'postgres'],
    ['grant select on t to u', 'postgres'],
    ['REVOKE select on t from u', 'mysql'],
  ]) assert.equal(changesSchema(sql, d), true, sql);
  for (const [sql, d] of [
    ['insert into t values (1)', 'postgres'],
    ['update t set a = 1 where b = 2', 'mysql'],
    ['select 1', 'postgres'],
    ['begin', 'postgres'],
    ["select 'create table'", 'postgres'],
  ]) assert.equal(changesSchema(sql, d), false, sql);
  assert.equal(firstKeyword('/* x */ COMMIT', 'postgres'), 'commit');
  assert.equal(firstKeyword('42', 'postgres'), '');
});
