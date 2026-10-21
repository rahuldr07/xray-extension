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
