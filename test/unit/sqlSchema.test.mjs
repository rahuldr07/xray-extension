import test from 'node:test';
import assert from 'node:assert/strict';
import './harness.mjs';

const { selectTableSql, toCompletionSchema, quoteIdent } = await import('../../src/panel/models/sqlSchema.ts');

const col = (name) => ({ name, type: 'text', nullable: true, defaultValue: null, pk: false });
const table = (name, cols) => ({ name, columns: cols.map(col), indexes: [] });
const tree = {
  schemas: [
    { name: 'main', tables: [table('orders', ['id', 'total'])], views: [table('v_orders', ['id'])] },
    { name: 'audit', tables: [table('log', ['at'])], views: [] },
  ],
};

test('quoteIdent is re-exported', () => {
  assert.equal(quoteIdent('a"b', 'sqlite'), '"a""b"');
});

test('selectTableSql omits the sqlite main schema', () => {
  assert.equal(selectTableSql('main', 'orders', 'sqlite'), 'SELECT * FROM "orders" LIMIT 100;');
  assert.equal(selectTableSql('aux', 'orders', 'sqlite'), 'SELECT * FROM "aux"."orders" LIMIT 100;');
});

test('selectTableSql quotes postgres and mysql identifiers', () => {
  assert.equal(selectTableSql('public', 'my"t', 'postgres'), 'SELECT * FROM "public"."my""t" LIMIT 100;');
  assert.equal(selectTableSql('shop', 'o`rders', 'mysql'), 'SELECT * FROM `shop`.`o``rders` LIMIT 100;');
});

test('toCompletionSchema uses plain names for main and schema.table otherwise', () => {
  assert.deepEqual(toCompletionSchema(tree), {
    orders: ['id', 'total'],
    v_orders: ['id'],
    'audit.log': ['at'],
  });
});

test('toCompletionSchema default schema depends on dialect', () => {
  const pg = { schemas: [{ name: 'public', tables: [table('t', ['a'])], views: [] }, { name: 'main', tables: [table('m', ['b'])], views: [] }] };
  assert.deepEqual(toCompletionSchema(pg, 'postgres'), { t: ['a'], 'main.m': ['b'] });
  assert.deepEqual(toCompletionSchema(pg, 'mysql'), { t: ['a'], m: ['b'] });
});
