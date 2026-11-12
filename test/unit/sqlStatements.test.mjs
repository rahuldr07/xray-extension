import test from 'node:test';
import assert from 'node:assert/strict';
import './harness.mjs';

const { splitStatements, statementAt } = await import('../../src/panel/models/sqlStatements.ts');

test('split: semicolons inside strings, comments and $$ bodies do not split', () => {
  const sql = "select ';' as a; -- x; y\nselect 2;\ncreate function f() returns int as $$ select 1; $$ language sql;";
  assert.deepEqual(splitStatements(sql, 'postgres').map((s) => s.text), [
    "select ';' as a",
    'select 2',
    'create function f() returns int as $$ select 1; $$ language sql',
  ]);
});
test('split: mysql backticks and a missing final semicolon', () => {
  assert.deepEqual(splitStatements('select `a;b` from t; select 1', 'mysql').map((s) => s.text), ['select `a;b` from t', 'select 1']);
});
test('split: empty and whitespace-only statements are dropped', () => {
  assert.deepEqual(splitStatements(' ;; select 1 ;\n\n', 'sqlite').map((s) => s.text), ['select 1']);
});
test('statementAt: inside, at the end, and in whitespace after a statement', () => {
  const sql = 'select 1;\n\nselect 2;';
  assert.equal(statementAt(sql, 3, 'sqlite').text, 'select 1');
  assert.equal(statementAt(sql, 9, 'sqlite').text, 'select 1');   // right after ';'
  assert.equal(statementAt(sql, 10, 'sqlite').text, 'select 1');  // blank line: previous statement
  assert.equal(statementAt(sql, 13, 'sqlite').text, 'select 2');
  assert.equal(statementAt('', 0, 'sqlite'), null);
});
test('statementAt: offsets map back to the original text', () => {
  const sql = '  select 1  ;';
  const s = statementAt(sql, 4, 'sqlite');
  assert.equal(sql.slice(s.from, s.to), 'select 1');
});

const TRIGGER_SCRIPT =
  'create table log(x); create trigger tr after insert on log begin insert into log values (1); delete from log where x = 2; end; select 1';

test('split: a CREATE TRIGGER body stays one statement through its END', () => {
  assert.deepEqual(splitStatements(TRIGGER_SCRIPT, 'sqlite').map((s) => s.text), [
    'create table log(x)',
    'create trigger tr after insert on log begin insert into log values (1); delete from log where x = 2; end',
    'select 1',
  ]);
});
test('split: CASE ... END, strings and comments inside a trigger do not end it', () => {
  const sql =
    "create temp trigger t2 after insert on log begin update log set x = case when x = 1 then 2 else 3 end; select 'end' -- end\n; end; select 2";
  const texts = splitStatements(sql, 'sqlite').map((s) => s.text);
  assert.equal(texts.length, 2);
  assert.match(texts[0], /^create temp trigger t2 .* end$/s);
  assert.equal(texts[1], 'select 2');
  // Without a trailing semicolon after END.
  assert.deepEqual(splitStatements('create trigger t3 after delete on log begin select 1; end', 'sqlite').map((s) => s.text), [
    'create trigger t3 after delete on log begin select 1; end',
  ]);
});
test('statementAt: inside a trigger body returns the whole trigger', () => {
  const pos = TRIGGER_SCRIPT.indexOf('delete from log');
  assert.equal(
    statementAt(TRIGGER_SCRIPT, pos, 'sqlite').text,
    'create trigger tr after insert on log begin insert into log values (1); delete from log where x = 2; end',
  );
});
