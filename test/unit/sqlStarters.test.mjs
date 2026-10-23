import test from 'node:test';
import assert from 'node:assert/strict';
import './harness.mjs';
import { loadSqlite, shopDatabaseBytes } from '../helpers/sqliteFixture.mjs';

const { quickStarts } = await import('../../src/panel/models/sqlStarters.ts');

const table = (name) => ({ name, columns: [], indexes: [] });
const tree = (...names) => ({ schemas: [{ name: 'main', tables: names.map(table), views: [table('v')] }] });

test('quickStarts lists tables, counts rows per table and shows the first table\'s columns', () => {
  const starters = quickStarts(tree('customers', 'orders'));
  assert.deepEqual(
    starters.map((s) => s.label),
    ['List tables', 'Row counts', 'Table columns'],
  );
  assert.equal(starters[0].sql, "SELECT name, type FROM sqlite_schema WHERE name NOT LIKE 'sqlite_%' ORDER BY name;");
  assert.equal(
    starters[1].sql,
    `SELECT 'customers' AS table_name, count(*) AS rows FROM "customers"\nUNION ALL\nSELECT 'orders' AS table_name, count(*) AS rows FROM "orders"\nORDER BY table_name;`,
  );
  assert.equal(starters[2].sql, "SELECT * FROM pragma_table_info('customers');");
});

test('quickStarts quotes awkward names and skips table starters without tables', () => {
  const [, counts, columns] = quickStarts(tree(`it's "odd"`));
  assert.equal(counts.sql, `SELECT 'it''s "odd"' AS table_name, count(*) AS rows FROM "it's ""odd"""\nORDER BY table_name;`);
  assert.equal(columns.sql, `SELECT * FROM pragma_table_info('it''s "odd"');`);
  assert.deepEqual(quickStarts(tree()).map((s) => s.label), ['List tables']);
  assert.deepEqual(quickStarts(null).map((s) => s.label), ['List tables']);
});

test('every quick start runs on a real SQLite database', async () => {
  const sqlite3 = await loadSqlite();
  const db = new sqlite3.oo1.DB(':memory:');
  try {
    const bytes = await shopDatabaseBytes();
    const p = sqlite3.wasm.allocFromTypedArray(bytes);
    const flags = sqlite3.capi.SQLITE_DESERIALIZE_FREEONCLOSE | sqlite3.capi.SQLITE_DESERIALIZE_RESIZEABLE;
    db.checkRc(sqlite3.capi.sqlite3_deserialize(db.pointer, 'main', p, bytes.length, bytes.length, flags));
    const [list, counts, columns] = quickStarts(tree('customers', 'orders', `it's "odd"`));
    db.exec(`create table "it's ""odd"""(x)`);
    assert.deepEqual(
      db.selectArrays(list.sql).map((r) => r[0]),
      ['big_orders', 'customers', 'it\'s "odd"', 'orders', 'orders_customer'],
    );
    assert.deepEqual(db.selectArrays(counts.sql), [
      ['customers', 3],
      ['it\'s "odd"', 0],
      ['orders', 2500],
    ]);
    assert.equal(db.selectArrays(columns.sql).length, 3);
  } finally {
    db.close();
  }
});
