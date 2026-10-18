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

// ── Spec J8: command results are the typed model (Task 4's "$xray" envelopes) ─────────────────

const results = await import('../../src/panel/models/consoleResults.ts');
const { LosslessNumber, parseJson, toValue } = await import('../../src/panel/models/jsonText.ts');
const T = (kind, fields) => ({ $xray: kind, ...fields });
const BIG = T('bigint', { value: '9007199254740993' });

test('typed scalars are inline, with their own badge and text', () => {
  const cases = [
    [BIG, 'bigint', '9007199254740993n'],
    [T('number', { value: 'NaN' }), 'number', 'NaN'],
    [T('number', { value: '-0' }), 'number', '-0'],
    [T('number', { value: '-Infinity' }), 'number', '-Infinity'],
    [T('undefined'), 'undefined', 'undefined'],
    [T('function', { name: 'load' }), 'function', 'ƒ load()'],
    [T('symbol', { description: 's' }), 'symbol', 'Symbol(s)'],
    [T('date', { iso: '1970-01-01T00:00:00.000Z' }), 'date', '1970-01-01T00:00:00.000Z'],
    [T('dom', { text: '<h1#t>' }), 'element', '<h1#t>'],
    [T('unreadable'), 'unreadable', '[unreadable]'],
  ];
  for (const [value, badge, text] of cases) {
    const d = describeResult(value, 'object');
    assert.equal(d.kind, 'scalar', text);
    assert.equal(d.badge, badge, text);
    assert.equal(d.summary, text);
    assert.equal(results.resultText(value), text);
  }
});

test('a cut array states its cap ("Showing 1,000 of 5,000 items"); its rows still make a table', () => {
  const ones = describeResult(T('array', { items: Array(1000).fill(1), length: 5000 }), 'array');
  assert.equal(ones.kind, 'tree');
  assert.equal(ones.count, 5000);
  assert.equal(ones.badge.startsWith('array · 5000 items'), true, ones.badge);
  assert.equal(ones.notice, 'Showing 1,000 of 5,000 items');
  assert.ok(ones.summary.startsWith('Array(5000)'), ones.summary);
  assert.equal(ones.big, true);
  const rows = describeResult(T('array', { items: [{ id: 1 }, { id: 2 }], length: 9 }), 'array');
  assert.equal(rows.kind, 'table');
  assert.deepEqual(rows.columns, ['id']);
  assert.equal(describeResult([1, 2], 'array').notice, null, 'whole values state nothing');
});

test('Map, Set, Error, listed objects and cut strings describe as what they are', () => {
  const map = describeResult(T('map', { size: 5000, entries: [[1, { a: 1 }]] }), 'object');
  assert.equal(map.kind, 'tree');
  assert.equal(map.badge, 'Map · 5000 entries');
  assert.equal(map.count, 5000);
  assert.equal(map.notice, 'Showing 1 of 5,000 entries');
  assert.equal(map.summary, 'Map(5000) {1 => {"a":1}, …}');
  const set = describeResult(T('set', { size: 2, values: [1, 'x'] }), 'object');
  assert.equal(set.badge, 'Set · 2 values');
  assert.equal(set.notice, null);
  const error = describeResult(T('error', { name: 'TypeError', message: 'boom', stack: 'TypeError: boom' }), 'object');
  assert.equal(error.kind, 'tree');
  assert.equal(error.badge, 'TypeError');
  assert.equal(error.summary, 'TypeError: boom');
  const point = describeResult(T('object', { class: 'Point', entries: [['x', 1], ['y', 2]], omitted: 3 }), 'object');
  assert.equal(point.kind, 'tree');
  assert.equal(point.count, 5);
  assert.equal(point.badge.startsWith('Point · 5 keys'), true, point.badge);
  assert.equal(point.notice, 'Showing 2 of 5 keys');
  const long = describeResult(T('string', { value: 'abc', length: 300000 }), 'string');
  assert.equal(long.kind, 'text');
  assert.equal(long.notice, 'Showing the first 3 of 300,000 characters');
  const nested = describeResult({ id: BIG, n: 1, list: T('array', { items: [], length: 4 }) }, 'object');
  assert.equal(nested.summary, '{ id: 9007199254740993n, n: 1, list: Array(4) }');
  for (const d of [map, set, error, point, long, nested]) assert.equal(JSON.stringify(d).includes('$xray'), false);
});

test('table columns and cells read listed objects; typed cells show their text', () => {
  const rows = [{ id: BIG, name: 'a' }, T('object', { class: 'Row', entries: [['id', 2], ['extra', T('undefined')]] })];
  assert.deepEqual(tableColumns(rows), ['id', 'name', 'extra']);
  assert.equal(results.cellText(results.tableCell(rows[0], 'id')), '9007199254740993n');
  assert.equal(results.cellText(results.tableCell(rows[1], 'id')), '2');
  assert.equal(results.cellText(results.tableCell(rows[1], 'extra')), 'undefined');
  assert.equal(results.cellText(results.tableCell(rows[1], 'name')), '', 'a missing cell is blank');
  assert.equal(results.cellText(T('map', { size: 3, entries: [] })), 'Map(3)');
  assert.equal(results.cellText([1, 2]), 'Array(2)');
  assert.equal(results.cellText(T('array', { items: [1], length: 7 })), 'Array(7)');
  assert.equal(results.cellText({ a: 1 }), '{…}');
  assert.deepEqual(results.resultRows(T('array', { items: [1, 2], length: 9 })), [1, 2]);
  assert.equal(results.resultRows(T('map', { size: 0, entries: [] })), null);
  assert.equal(tableColumns([T('map', { size: 1, entries: [] })]), null, 'only objects are rows');
});

test('JSON view and Copy never show envelopes; integers past 2^53 keep their digits', () => {
  const value = { id: BIG, n: T('number', { value: 'NaN' }), u: T('undefined'), z: T('number', { value: '-0' }), m: T('map', { size: 1, entries: [['k', 1]] }) };
  assert.equal(results.resultJsonText(value), '{\n  "id": 9007199254740993,\n  "n": "NaN",\n  "u": "undefined",\n  "z": -0,\n  "m": {\n    "k": 1\n  }\n}');
  assert.equal(results.resultCopyText(value), results.resultJsonText(value));
  assert.equal(results.resultCopyText(BIG), '9007199254740993n');
  assert.equal(results.resultCopyText(T('undefined')), 'undefined');
  assert.equal(results.resultCopyText('plain'), 'plain');
  assert.equal(results.resultJsonText(T('array', { items: [1], length: 3 })), '[\n  1\n]');
  assert.ok(results.resultJsonText(Array.from({ length: 50000 }, (_, i) => ({ i }))).length <= 200_100, 'bounded');
});

test('Copy of a value a console cap cut: the clipboard holds what was kept, and the toast says it was cut', () => {
  // A cut string copies its kept characters, with no "…" added (a cut is metadata, not text).
  assert.equal(results.resultCopyText(T('string', { value: 'abc', length: 9 })), 'abc');
  assert.equal(results.resultCopyToast(T('string', { value: 'abc', length: 9 }), 'string'), 'Copied the first 3 of 9 characters.');
  // A cut array copies its kept items; the toast states the cap the cell shows.
  assert.equal(results.resultCopyText(T('array', { items: [1], length: 3 })), '[\n  1\n]');
  assert.equal(results.resultCopyToast(T('array', { items: [1], length: 3 }), 'array'), 'Copied 1 of 3 items.');
  assert.equal(results.resultCopyToast(T('object', { entries: [['a', 1]], omitted: 4 }), 'object'), 'Copied 1 of 5 keys.');
  // A whole value: the plain toast.
  assert.equal(results.resultCopyToast({ a: 1 }, 'object'), 'Copied result.');
  assert.equal(results.resultCopyToast('x'.repeat(500), 'string'), 'Copied result.');
  assert.equal(results.resultCopyToast(BIG, 'bigint'), 'Copied result.');
  // A hand-built value describeResult cannot read: still the plain toast, never a throw.
  assert.equal(results.resultCopyToast({ get boom() { throw new Error('no'); } }, 'object'), 'Copied result.');
});

test('encodeConsoleValue: a LosslessNumber is a bigint envelope, "$xray" keys are listed, __proto__ stays a key', () => {
  assert.deepEqual(results.encodeConsoleValue({ id: new LosslessNumber('9007199254740993'), f: new LosslessNumber('-9007199254740993.000'), list: [1, 'a', null, true] }),
    { id: BIG, f: T('bigint', { value: '-9007199254740993' }), list: [1, 'a', null, true] });
  assert.deepEqual(results.encodeConsoleValue(JSON.parse('{"$xray":"bigint","value":"1"}')), T('object', { entries: [['$xray', 'bigint'], ['value', '1']] }));
  const proto = results.encodeConsoleValue(toValue(parseJson('{"__proto__":{"x":1},"constructor":2}').root));
  assert.equal(JSON.stringify(proto), '{"__proto__":{"x":1},"constructor":2}');
  assert.deepEqual(results.encodeConsoleValue([NaN, -0, undefined, 10n, Infinity]),
    [T('number', { value: 'NaN' }), T('number', { value: '-0' }), T('undefined'), T('bigint', { value: '10' }), T('number', { value: 'Infinity' })]);
  assert.equal(results.encodeConsoleValue('text'), 'text');
  assert.equal(results.encodeConsoleValue(null), null);
});

test('consoleBodyValue: the lossless parse of the facet, as the page will see it', () => {
  const entry = {
    id: 'body-1', type: 'api', responseHeaders: { 'content-type': 'application/json' }, responseRaw: '{"id":9007199254740993,"ok":true}',
    requestHeaders: { 'content-type': 'application/json' }, requestBodyKind: 'text', requestBodyText: '{"n":12345678901234567890}',
  };
  assert.deepEqual(results.consoleBodyValue(entry, 'response'), { id: BIG, ok: true });
  assert.deepEqual(results.consoleBodyValue(entry, 'request'), { n: T('bigint', { value: '12345678901234567890' }) });
  assert.equal(results.consoleBodyValue(entry, 'response'), results.consoleBodyValue(entry, 'response'), 'cached per entry');
  const scalar = { id: 'body-2', type: 'api', responseHeaders: { 'content-type': 'application/json' }, responseRaw: '42' };
  assert.equal(results.consoleBodyValue(scalar, 'response'), 42, 'a top-level JSON scalar is that value (audit #12)');
  assert.equal(results.consoleBodyValue({ id: 'body-3', type: 'api', responseRaw: 'plain text' }, 'response'), 'plain text');
  assert.equal(results.consoleBodyValue({ id: 'body-4', type: 'api' }, 'response'), null);
});

test('the table() flag (out of band) lays out rows with any object as a table; without it they stay a tree', () => {
  const rows = [{ a: 1 }, 2, 3];
  assert.equal(results.describeCommandResult(rows, 'array').description.kind, 'tree');
  const flagged = results.describeCommandResult(rows, 'array', true).description;
  assert.equal(flagged.kind, 'table');
  assert.deepEqual(flagged.columns, ['a']);
  assert.equal(results.describeCommandResult([1, 2], 'array', true).description.kind, 'tree', 'no object: nothing to tabulate');
  assert.equal(results.describeCommandResult({ __xr_render: 'table', data: [{ a: 1 }] }, 'object').description.kind, 'tree', 'a lookalike key is data (audit #28)');
});

test('edge shapes: typed arrays, unknown kinds and hand-built values describe, lay out and copy without throwing', () => {
  const bytes = T('typedarray', { type: 'Uint8Array', length: 4, values: [1, 2] });
  const viewed = describeResult(bytes, 'object');
  assert.deepEqual([viewed.kind, viewed.badge, viewed.notice], ['tree', 'Uint8Array · 4 items', 'Showing 2 of 4 items']);
  const buffer = describeResult(T('typedarray', { type: 'ArrayBuffer', length: 8 }), 'object');
  assert.deepEqual([buffer.kind, buffer.notice, buffer.summary], ['scalar', null, 'ArrayBuffer(8)']);
  assert.equal(results.cellText(bytes), 'Uint8Array(4)');
  assert.equal(describeResult(T('circular'), 'object').badge, 'circular');
  assert.equal(describeResult({ e: T('error', { name: 'RangeError', message: 'x' }), b: bytes }, 'object').summary, '{ e: RangeError, b: Uint8Array(4) }');
  assert.equal(results.resultCopyText(null), 'null');
  assert.equal(results.resultCopyText(7), '7');
  assert.equal(results.resultCopyText(T('error', { name: 'E', message: 'm' })), '{\n  "name": "E",\n  "message": "m"\n}');
  assert.deepEqual(results.encodeConsoleValue([() => 1, Symbol('s')]), [T('undefined'), T('undefined')], 'never in a body: written as undefined');
  // A hand-built value whose getter throws: the JSON view falls back to the value's own JSON.
  const trap = { toJSON() { return { raw: 1 }; }, get boom() { throw new Error('no'); } };
  assert.equal(results.resultJsonText(trap), '{\n  "raw": 1\n}');
});
