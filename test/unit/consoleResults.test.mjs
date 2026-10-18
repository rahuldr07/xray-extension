import test from 'node:test';
import assert from 'node:assert/strict';
import './harness.mjs';

const { describeResult, tableColumns, formatResultBytes } = await import('../../src/panel/models/consoleResults.ts');

test('scalars are inline', () => {
  assert.deepEqual(
    (({ kind, badge, big }) => ({ kind, badge, big }))(describeResult(42, 'number')),
    { kind: 'scalar', badge: 'number', big: false },
  );
  assert.equal(describeResult(true, 'boolean').badge, 'boolean');
  assert.equal(describeResult(null, 'null').badge, 'null');
  assert.equal(describeResult(undefined, 'undefined').badge, 'undefined');
  assert.equal(describeResult(null, 'null').kind, 'scalar');
});

test('strings: 120 chars stay inline, 121 become text', () => {
  const short = describeResult('x'.repeat(24), 'string');
  assert.equal(short.kind, 'scalar');
  assert.equal(short.badge, 'string · 24 chars');
  assert.equal(describeResult('x'.repeat(120), 'string').kind, 'scalar');
  const long = describeResult('x'.repeat(121), 'string');
  assert.equal(long.kind, 'text');
  assert.equal(long.badge, 'string · 121 chars');
});

test('array of objects is a table', () => {
  const d = describeResult([{ id: 1, name: 'a' }, { id: 2, name: 'b' }], 'array');
  assert.equal(d.kind, 'table');
  assert.deepEqual(d.columns, ['id', 'name']);
  assert.equal(d.badge, 'array · 2 items');
  assert.equal(d.count, 2);
  assert.equal(d.big, false);
});

test('mixed arrays are trees', () => {
  assert.equal(describeResult([1, 'a', { x: 1 }], 'array').kind, 'tree');
  assert.equal(tableColumns([]), null);
  assert.equal(tableColumns([1, 2]), null);
});

test('table eligibility is 80% of first 20 items; columns capped at 12', () => {
  const rows = Array.from({ length: 10 }, (_, i) => (i === 9 ? 5 : { a: i }));
  assert.deepEqual(tableColumns(rows), ['a']);
  const wide = [Object.fromEntries(Array.from({ length: 15 }, (_, i) => [`c${i}`, i]))];
  assert.equal(tableColumns(wide)?.length, 12);
  const d = describeResult(Array.from({ length: 20 }, () => wide[0]), 'array');
  assert.equal(d.columns.length, 12);
});

test('51-key object is big', () => {
  const obj = Object.fromEntries(Array.from({ length: 51 }, (_, i) => [`k${i}`, i]));
  const d = describeResult(obj, 'object');
  assert.equal(d.big, true);
  assert.ok(d.badge.startsWith('object · 51 keys'));
  assert.equal(describeResult(Object.fromEntries(Array.from({ length: 50 }, (_, i) => [`k${i}`, i])), 'object').big, false);
});

test('5,000-item array summarizes fast', () => {
  const arr = Array.from({ length: 5000 }, (_, i) => ({ id: i, name: `n${i}` }));
  const t0 = performance.now();
  const d = describeResult(arr, 'array');
  assert.ok(performance.now() - t0 < 50, 'under 50 ms');
  assert.equal(d.big, true);
  assert.ok(d.summary.startsWith('Array(5000)'));
});

test('~25 kb object is big and carries its size', () => {
  const d = describeResult({ blob: 'y'.repeat(25 * 1024) }, 'object');
  assert.equal(d.big, true);
  assert.ok(d.badge.endsWith('· 25 kb'), d.badge);
});

test('object summary is shaped and ≤ 80 chars', () => {
  const d = describeResult({ users: new Array(500).fill({}), meta: { a: 1 }, extra: 'z', more: 1, evenMore: 2, andMore: 3, last: 4 }, 'object');
  assert.ok(d.summary.startsWith('{ users: Array(500), meta: {…}'), d.summary);
  assert.ok(d.summary.length <= 80);
  assert.ok(d.summary.endsWith('… }'));
});

test('cyclic and unserializable values do not throw', () => {
  const a = {}; a.self = a;
  assert.doesNotThrow(() => describeResult(a, 'object'));
  assert.doesNotThrow(() => describeResult({ n: 1n }, 'object'));
});

test('formatResultBytes renders console-style sizes', () => {
  assert.equal(formatResultBytes(25 * 1024), '25 kb');
  assert.equal(formatResultBytes(512), '512 b');
});
