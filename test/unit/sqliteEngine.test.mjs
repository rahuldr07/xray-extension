import test from 'node:test';
import assert from 'node:assert/strict';
import './harness.mjs';
import { shopDatabaseBytes } from '../helpers/sqliteFixture.mjs';

const { createSqliteEngine, SQLITE_CAPABILITIES } = await import('../../src/panel/models/sqliteEngine.ts');
const sqlite3 = await (await import('@sqlite.org/sqlite-wasm')).default();
const shop = await shopDatabaseBytes();

function openShop(readOnly) {
  const engine = createSqliteEngine(sqlite3);
  engine.open(shop, readOnly);
  return engine;
}

function rejectsWith(fn, code) {
  assert.throws(fn, (err) => {
    assert.equal(err.code, code, `expected ${code}, got ${err.code}: ${err.message}`);
    return true;
  });
}

test('capabilities are the SQLite set', () => {
  assert.deepEqual(SQLITE_CAPABILITIES, {
    readOnlyEnforced: true,
    cancel: true,
    transactions: true,
    cursor: false,
    multiStatement: true,
  });
});

test('introspect lists tables with columns, primary key and indexes, and views', () => {
  const engine = openShop(true);
  const tree = engine.introspect();
  assert.equal(tree.schemas.length, 1);
  const main = tree.schemas[0];
  assert.equal(main.name, 'main');
  assert.deepEqual(main.tables.map((t) => t.name), ['customers', 'orders']);
  assert.deepEqual(main.views.map((v) => v.name), ['big_orders']);
  const orders = main.tables[1];
  assert.deepEqual(orders.columns.map((c) => c.name), ['id', 'customer_id', 'total', 'meta', 'big', 'photo']);
  assert.deepEqual(orders.columns[0], { name: 'id', type: 'INTEGER', nullable: true, defaultValue: null, pk: true });
  assert.equal(orders.columns[1].pk, false);
  assert.deepEqual(orders.indexes, ['orders_customer']);
  const email = main.tables[0].columns.find((c) => c.name === 'email');
  assert.equal(email.nullable, false);
  assert.equal(main.views[0].columns.length, 6);
  engine.close();
});

test('select is capped at maxRows with hasMore, lossless big integers, blobs and JSON text', () => {
  const engine = openShop(true);
  const r = engine.execute('select * from orders', { maxRows: 1000 });
  assert.equal(r.rowCount, 1000);
  assert.equal(r.rows.length, 1000);
  assert.equal(r.hasMore, true);
  assert.equal(r.affected, null);
  assert.equal(r.truncatedCells, 0);
  assert.deepEqual(r.notices, []);
  assert.equal(typeof r.durationMs, 'number');
  assert.deepEqual(r.columns[0], { name: 'id', type: 'INTEGER' });
  const col = (name) => r.columns.findIndex((c) => c.name === name);
  const first = r.rows[0];
  assert.equal(first[col('big')], '9007199254740993');
  assert.equal(first[col('photo')].length, 300);
  assert.equal(first[col('meta')], '{"gift":true}');
  assert.equal(r.rows[1][col('big')], 2);
  engine.close();
});

test('hasMore is false when the rows fit exactly', () => {
  const engine = openShop(true);
  const r = engine.execute('select id from customers', { maxRows: 3 });
  assert.equal(r.rowCount, 3);
  assert.equal(r.hasMore, false);
  engine.close();
});

test('an expression column has an empty type', () => {
  const engine = openShop(true);
  assert.deepEqual(engine.execute('select 1 as one', { maxRows: 10 }).columns, [{ name: 'one', type: '' }]);
  engine.close();
});

test('a read-only engine rejects writes and attempts to lift read-only', () => {
  const engine = openShop(true);
  for (const sql of [
    'update orders set total = 0',
    'pragma query_only = 0',
    "attach ':memory:' as x",
    "with x as (select 1) insert into customers(email) values ('a')",
    "select 1; delete from orders",
  ]) {
    rejectsWith(() => engine.execute(sql, { maxRows: 10 }), 'read-only');
  }
  assert.equal(engine.execute('select count(*) from orders', { maxRows: 10 }).rows[0][0], 2500);
  engine.close();
});

test('a read-write engine applies writes and exports the changed bytes', () => {
  const engine = openShop(false);
  const r = engine.execute('delete from orders where id = 1', { maxRows: 10 });
  assert.equal(r.affected, 1);
  assert.deepEqual(r.columns, []);
  const bytes = engine.exportBytes();
  engine.close();
  const reopened = createSqliteEngine(sqlite3);
  reopened.open(bytes, true);
  assert.equal(reopened.execute('select count(*) from orders', { maxRows: 10 }).rows[0][0], 2499);
  reopened.close();
});

test('bytes that are not a database throw not-a-database', () => {
  const engine = createSqliteEngine(sqlite3);
  rejectsWith(() => engine.open(new TextEncoder().encode('hello'), true), 'not-a-database');
});

test('text over 1,048,576 characters is cut and counted', () => {
  const engine = openShop(true);
  const r = engine.execute('select hex(zeroblob(1000000))', { maxRows: 10 });
  assert.equal(r.rows[0][0].length, 1048576);
  assert.equal(r.truncatedCells, 1);
  engine.close();
});

test('a script returns the result of its last statement', () => {
  const engine = openShop(true);
  assert.deepEqual(engine.execute('select 1; select 2', { maxRows: 10 }).rows, [[2]]);
  engine.close();
});

test('SQL errors are normalized', () => {
  const engine = openShop(false);
  rejectsWith(() => engine.execute('select * frm orders', { maxRows: 10 }), 'syntax');
  rejectsWith(() => engine.execute('select * from nope', { maxRows: 10 }), 'server');
  engine.close();
});

test('a syntax error position is an offset into the whole script', () => {
  const engine = openShop(false);
  const sql = 'select 1; select * frm orders';
  assert.throws(
    () => engine.execute(sql, { maxRows: 10 }),
    (err) => err.code === 'syntax' && err.position === sql.indexOf('frm') && err.position === 19,
  );
  engine.close();
});

test('input the parser cannot read reaches SQLite on a read-only engine and fails as syntax', () => {
  const engine = openShop(true);
  rejectsWith(() => engine.execute('selec * from orders', { maxRows: 10 }), 'syntax');
  rejectsWith(() => engine.execute('select 1; selec * from orders', { maxRows: 10 }), 'syntax');
  engine.close();
});
