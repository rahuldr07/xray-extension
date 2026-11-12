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

test('object summary is the console one-line preview, ≤ 80 chars', () => {
  // One one-line format (fix round 1 ruling): every summary is consolePreview.previewLine.
  const d = describeResult({ users: new Array(500).fill({}), meta: { a: 1 }, extra: 'z', more: 1, evenMore: 2, andMore: 3, last: 4 }, 'object');
  assert.ok(d.summary.startsWith('{users: Array(500), meta: {…}'), d.summary);
  assert.ok(d.summary.length <= 80);
  assert.ok(d.summary.endsWith(', …}'), d.summary);
  assert.equal(describeResult([1, 2, 3], 'array').summary, 'Array(3) [1, 2, 3]');
  assert.equal(describeResult('hi', 'string').summary, "'hi'");
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
  assert.equal(map.summary, 'Map(5000) {1 => {…}, …}');
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
  assert.equal(nested.summary, '{id: 9007199254740993n, n: 1, list: Array(4)}');
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
  assert.equal(describeResult({ e: T('error', { name: 'RangeError', message: 'x' }), b: bytes }, 'object').summary, '{e: RangeError: x, b: Uint8Array(4)}');
  assert.equal(results.resultCopyText(null), 'null');
  assert.equal(results.resultCopyText(7), '7');
  assert.equal(results.resultCopyText(T('error', { name: 'E', message: 'm' })), '{\n  "name": "E",\n  "message": "m"\n}');
  assert.deepEqual(results.encodeConsoleValue([() => 1, Symbol('s')]), [T('undefined'), T('undefined')], 'never in a body: written as undefined');
  // A hand-built value whose getter throws: the JSON view falls back to the value's own JSON.
  const trap = { toJSON() { return { raw: 1 }; }, get boom() { throw new Error('no'); } };
  assert.equal(results.resultJsonText(trap), '{\n  "raw": 1\n}');
});

// ── Console round 2, Task 1: the encoder's new tags have a working fallback display ────────────
const logValue = await import('../../src/panel/models/logValue.ts');
const { TreeBranch, TreeLeaf } = await import('../../src/panel/models/treeDisplay.ts');

test('round-2 tags: web, promise and instance results are trees badged with their class', () => {
  const headers = T('web', { cls: 'Headers', fields: {}, entries: [['a', '1'], ['b', '2']] });
  const response = T('web', { cls: 'Response', fields: { status: 200, ok: true, headers } });
  const d = results.describeResult(response, 'object');
  assert.equal(d.kind, 'tree');
  assert.equal(d.badge, 'Response');
  assert.equal(d.summary, 'Response {status: 200, ok: true, headers: Headers(2)}');
  assert.equal(results.describeResult(headers, 'object').badge, 'Headers · 2 entries');
  assert.equal(results.describeResult(T('promise', { state: 'fulfilled', value: 5 }), 'object').summary, 'Promise {<fulfilled>: 5}');
  const account = T('instance', { cls: 'Account', entries: [['id', 7]], getters: ['x'] });
  assert.equal(results.describeResult(account, 'object').badge, 'Account');
  assert.equal(results.resultText(account), 'Account {"id":7,"x":(…)}');
  assert.deepEqual(JSON.parse(results.resultJsonText(account)), { id: 7, x: '(…)' });
  const plainGetter = T('instance', { cls: '', entries: [['a', 1]], getters: ['x'] });
  assert.equal(results.describeResult(plainGetter, 'object').badge, 'object');
  assert.equal(results.resultText(plainGetter), '{"a":1,"x":(…)}');
  assert.equal(results.resultText([1, T('accessor')]), '[1,(…)]');
  assert.deepEqual(JSON.parse(results.resultJsonText([1, T('accessor')])), [1, '(…)']);
  const regexp = results.describeResult(T('web', { cls: 'RegExp', fields: { source: 'ab+c', flags: 'gi' } }), 'object');
  assert.equal(regexp.kind, 'scalar');
  assert.equal(regexp.summary, '/ab+c/gi');
  // Never an envelope on screen: the tree, the text and the JSON view read the fields.
  const tree = logValue.logDisplay(response);
  assert.ok(tree instanceof TreeBranch);
  assert.equal(results.resultText(response), 'Response {"status":200,"ok":true,"headers":Headers(2) {"a" => "1", "b" => "2"}}');
  assert.deepEqual(JSON.parse(results.resultJsonText(response)), { status: 200, ok: true, headers: { a: '1', b: '2' } });
  assert.equal(results.resultJsonText(response).includes('$xray'), false);
});

test('round-2 tags: functions and DOM snapshots keep a one-line text', () => {
  const fn = T('function', { name: 'formatPrice', params: "cents, currency = 'EUR'", async: false, kind: 'function', source: 'function formatPrice() {}' });
  assert.equal(results.resultText(fn), "ƒ formatPrice(cents, currency = 'EUR')");
  assert.equal(results.describeResult(fn, 'function').badge, 'function');
  assert.equal(results.resultText(T('function', { name: 'fetch', params: '...args', async: true, kind: 'function', wrappedByXray: true })), 'ƒ fetch() — wrapped by XRAY');
  assert.equal(results.resultText(T('function', { name: 'old' })), 'ƒ old()', 'a Logs envelope reads as before');
  // One arrow label everywhere: text, Copy and the collapsed preview agree.
  const arrow = T('function', { name: 'f', params: 'a', async: true, kind: 'arrow' });
  assert.equal(results.resultText(arrow), 'async (a) => {…}');
  assert.equal(results.describeResult(arrow, 'function').summary, 'async (a) => {…}');
  const dom = T('dom', { tag: 'div', id: 'app', classes: ['main'], attrs: [['id', 'app']], text: 'hello', children: [], more: 0 });
  assert.equal(results.resultText(dom), '<div#app.main>');
  assert.equal(results.resultText(T('dom', { text: '<body>' })), '<body>');
  assert.equal(results.describeResult(dom, 'object').badge, 'element');
});

test('round-2 tags: an Error whose fields are page accessors lists them lazily', () => {
  const error = T('error', { name: 'Error', message: '', getters: ['message', 'stack'] });
  const tree = logValue.logDisplay(error);
  assert.ok(tree instanceof TreeBranch);
  const names = tree.children.map((child) => child.name);
  assert.deepEqual(names, ['message', 'stack']);
  assert.deepEqual(tree.children.map((child) => child.value.text), ['(…)', '(…)']);
});

// ── Console round 2, Task 2: the console Tree (spec §1) ───────────────────────────────────────

test('console tree: > 5 keys/items collapse to their one-line preview; ≤ 5 stay open', () => {
  const six = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 };
  const tree = results.resultDisplay(six);
  assert.ok(tree instanceof TreeBranch);
  assert.equal(results.consoleBranchOpen(tree), false);
  assert.equal(results.consoleBranchPreview(tree), '{a: 1, b: 2, c: 3, d: 4, e: 5, …}');
  const five = results.resultDisplay({ a: 1, b: 2, c: 3, d: 4, e: 5 });
  assert.equal(results.consoleBranchOpen(five), true);
  const items = results.resultDisplay([1, 2, 3, 4, 5, 6]);
  assert.equal(results.consoleBranchOpen(items), false);
  assert.equal(results.consoleBranchPreview(items), 'Array(6) [1, 2, 3, 4, 5, …]');
  assert.equal(results.consoleBranchOpen(results.resultDisplay([1, 2])), true);
  // Nested containers carry their own previews.
  const nested = results.resultDisplay({ user: six });
  assert.equal(results.consoleBranchPreview(nested.children[0].value), '{a: 1, b: 2, c: 3, d: 4, e: 5, …}');
  // Typed containers too (a cut array, a Map).
  const cut = results.resultDisplay(T('array', { items: [1, 2, 3, 4, 5, 6], length: 9 }));
  assert.equal(results.consoleBranchOpen(cut), false);
  assert.match(results.consoleBranchPreview(cut), /^Array\(9\) \[1, 2, 3, 4, 5, …\]$/);
});

test('console tree: identifier keys are bare, other keys quoted', () => {
  assert.equal(results.consoleKey('id'), 'id');
  assert.equal(results.consoleKey('$_x1'), '$_x1');
  assert.equal(results.consoleKey('content-type'), '"content-type"');
  assert.equal(results.consoleKey(''), '""');
  assert.equal(results.consoleKey('a b'), '"a b"');
  // Plain objects become named children, so the key is shown by name.
  const tree = results.resultDisplay({ id: 1, 'content-type': 'x' });
  assert.deepEqual(tree.children.map((child) => child.name), ['id', 'content-type']);
});

test('console tree: Set entries have no indices', () => {
  const tree = results.resultDisplay(T('set', { size: 2, values: [1, 'a'] }));
  assert.ok(tree instanceof TreeBranch);
  assert.equal(tree.label, 'Set(2)');
  assert.deepEqual(tree.children.map((child) => child.label), ['', '']);
  assert.deepEqual(tree.children.map((child) => child.value), [1, 'a']);
});

test('console tree: Array(500) expands to buckets [0 … 99] … [400 … 499] keyed by their real indices', () => {
  const tree = results.resultDisplay(Array.from({ length: 500 }, (_, i) => i));
  assert.equal(tree.count, 500);
  assert.deepEqual(tree.children.map((child) => child.label), ['[0 … 99]', '[100 … 199]', '[200 … 299]', '[300 … 399]', '[400 … 499]']);
  const last = tree.children[4].value;
  assert.ok(last instanceof TreeBranch);
  assert.equal(last.bucket, true);
  assert.equal(last.count, 100);
  assert.equal(last.children[0].key, 400);
  assert.equal(last.children[0].value, 400);
  assert.equal(results.consoleBranchOpen(last), false, 'a bucket opens on demand');
  // Up to 100 items there are no buckets; a cut array buckets what it has and notes the rest.
  assert.equal(results.resultDisplay(Array.from({ length: 100 }, (_, i) => i)).children.length, 100);
  const cut = results.resultDisplay(T('array', { items: Array.from({ length: 150 }, (_, i) => i), length: 5000 }));
  assert.deepEqual(cut.children.map((child) => child.label), ['[0 … 99]', '[100 … 149]', '']);
  assert.equal(cut.children[2].value.text, '… 4850 more');
  // The flat-text fallback still prints one array.
  assert.equal(JSON.stringify(tree).startsWith('[0,1,2'), true);
});

test('console tree: DOM snapshots and functions with source expand; Logs envelopes stay one line', () => {
  const child = T('dom', { tag: 'p', id: '', classes: [], attrs: [], text: 'hi', children: [], more: 0 });
  const dom = T('dom', { tag: 'div', id: 'app', classes: ['main'], attrs: [['id', 'app'], ['class', 'main']], text: 'hi there', children: [child], more: 3 });
  const tree = results.resultDisplay(dom);
  assert.ok(tree instanceof TreeBranch);
  assert.equal(tree.label, '<div#app.main>');
  assert.equal(results.consoleBranchOpen(tree), false, 'collapsed until asked, as DevTools');
  assert.equal(results.consoleBranchPreview(tree), '<div#app.main>');
  const names = tree.children.map((item) => item.name ?? item.label);
  assert.deepEqual(names, ['attributes', 'text', 'children']);
  const kids = tree.children[2].value;
  assert.equal(kids.children[0].value.label, '<p>');
  assert.equal(kids.children.at(-1).value.text, '… 3 more');
  const described = results.describeResult(dom, 'object');
  assert.equal(described.kind, 'tree');
  assert.equal(described.badge, 'element');
  // A Logs DOM envelope (text only) is still a one-line scalar.
  assert.equal(results.describeResult(T('dom', { text: '<body>' }), 'object').kind, 'scalar');

  const fn = T('function', { name: 'formatPrice', params: "cents, currency = 'EUR'", async: false, kind: 'function', source: "function formatPrice(cents, currency = 'EUR') {\n  return cents;\n}" });
  const fnTree = results.resultDisplay(fn);
  assert.ok(fnTree instanceof TreeBranch);
  assert.equal(fnTree.label, "ƒ formatPrice(cents, currency = 'EUR')");
  assert.equal(results.consoleBranchOpen(fnTree), false);
  assert.equal(fnTree.bare, true, 'its source is shown as written, without brackets around it');
  assert.equal(fnTree.children.length, 1);
  assert.equal(fnTree.children[0].label, '');
  assert.equal(fnTree.children[0].value.tone, 'source');
  assert.match(fnTree.children[0].value.text, /return cents;/);
  assert.equal(results.describeResult(fn, 'function').kind, 'tree');
  assert.equal(results.describeResult(fn, 'function').badge, 'function');
  assert.equal(results.describeResult(T('function', { name: 'fetch', params: '', async: false, kind: 'native' }), 'function').kind, 'scalar', 'nothing to expand without source');
});

test('console tree: a lazy getter is "(…)" with a tooltip and nothing to open', () => {
  const instance = T('instance', { cls: 'Account', entries: [['id', 7]], getters: ['balance'] });
  const tree = results.resultDisplay(instance);
  const lazy = tree.children.find((child) => child.name === 'balance').value;
  assert.ok(lazy instanceof TreeLeaf, 'a leaf: there is no toggle that could run it');
  assert.equal(lazy.text, '(…)');
  assert.equal(lazy.hint, 'Getter — not run, to avoid side effects');
  assert.equal(results.GETTER_HINT, 'Getter — not run, to avoid side effects');
  assert.equal(results.resultDisplay([T('accessor')]).children[0].value.hint, results.GETTER_HINT);
  // The Logs tree carries the same hint.
  assert.equal(logValue.logDisplay(instance).children.find((child) => child.name === 'balance').value.hint, results.GETTER_HINT);
});

test('a pending top-level promise is one line: Promise {<pending>}', () => {
  const pending = results.describeResult(T('promise', { state: 'pending' }), 'object');
  assert.equal(pending.kind, 'scalar');
  assert.equal(pending.badge, 'Promise');
  assert.equal(results.resultText(T('promise', { state: 'pending' })), 'Promise {<pending>}');
  assert.equal(results.describeResult(T('promise', { state: 'fulfilled', value: 5 }), 'object').kind, 'tree', 'a settled nested promise still opens');
});

test('cell header: promise label, pending note and the Uncaught prefix', () => {
  assert.equal(results.promiseHeader({ promise: { state: 'fulfilled', ms: 120 } }), 'Promise · fulfilled in 120 ms');
  assert.equal(results.promiseHeader({ promise: { state: 'rejected', ms: 3 } }), 'Promise · rejected in 3 ms');
  assert.equal(results.promiseHeader({ promise: { state: 'pending', ms: 10000 } }), 'Promise · pending');
  assert.equal(results.promiseHeader(undefined), null);
  assert.equal(results.promiseHeader({ promise: { state: 'bogus', ms: 1 } }), null);
  assert.equal(results.promiseNote({ promise: { state: 'pending', ms: 10000 } }), 'Still pending after 10 s');
  assert.equal(results.promiseNote({ promise: { state: 'fulfilled', ms: 1 } }), null);
  assert.equal(results.uncaughtPrefix({ thrown: true }, undefined), 'Uncaught');
  assert.equal(results.uncaughtPrefix({ thrown: true }, { promise: { state: 'rejected', ms: 1 } }), 'Uncaught (in promise)');
  assert.equal(results.uncaughtPrefix({ kind: 'detached' }, undefined), '', 'a debugger failure is not a page exception');
  assert.equal(results.uncaughtPrefix({}, undefined), '');
});

test('cell note: declared variables were reset (spec §2), once, on results and errors', () => {
  assert.equal(results.scopeResetNote({ scopeReset: true }), 'Declared variables were reset (page reloaded or debugger detached)');
  assert.equal(results.scopeResetNote({ scopeReset: true, promise: { state: 'fulfilled', ms: 1 } }), results.SCOPE_RESET_NOTE);
  assert.equal(results.scopeResetNote({ promise: { state: 'fulfilled', ms: 1 } }), null);
  assert.equal(results.scopeResetNote(undefined), null);
  assert.equal(results.scopeResetNote({ scopeReset: 'yes' }), null);
});

test('the error line: Uncaught Error: x, Uncaught 5, Uncaught {a: 1}; debugger and XRAY failures have no prefix', () => {
  const { errorHeadline } = results;
  assert.deepEqual(errorHeadline({ name: 'Error', message: 'x', thrown: true }), { lead: 'Uncaught Error:', text: 'x' });
  assert.deepEqual(errorHeadline({ name: 'Error', message: '5', thrown: true, value: 5 }), { lead: 'Uncaught', text: '5' });
  assert.deepEqual(errorHeadline({ name: 'Error', message: '[object Object]', thrown: true, value: { a: 1 } }), { lead: 'Uncaught', text: '{a: 1}' });
  assert.deepEqual(errorHeadline({ name: 'Error', message: 'nope', thrown: true, value: 'nope' }, { promise: { state: 'rejected', ms: 1 } }), { lead: 'Uncaught (in promise)', text: "'nope'" });
  // A thrown Error's own name wins over the guess from its message.
  assert.deepEqual(errorHeadline({ name: 'Error', message: 'm', thrown: true, value: T('error', { name: 'MyError', message: 'm' }) }), { lead: 'Uncaught MyError:', text: 'm' });
  assert.deepEqual(errorHeadline({ name: 'Error', message: 'Evaluation failed: x', kind: 'evaluation' }), { lead: '', text: 'Evaluation failed: x' });
  assert.deepEqual(errorHeadline({ name: 'Error', message: "XRAY couldn't display this value: enc", internal: true }), { lead: '', text: "XRAY couldn't display this value: enc" });
  assert.deepEqual(errorHeadline({ name: 'TypeError', message: 'old' }), { lead: 'TypeError:', text: 'old' });
});

test('a thrown value that cannot be read says so, with no invented Error name', () => {
  assert.deepEqual(results.errorHeadline({ name: 'Error', message: 'Execution failed', thrown: true, unreadable: true }), { lead: 'Uncaught', text: '(value could not be read)' });
  assert.deepEqual(results.errorHeadline({ name: 'Error', message: '', thrown: true, unreadable: true }, { promise: { state: 'rejected', ms: 1 } }), { lead: 'Uncaught (in promise)', text: '(value could not be read)' });
});
