// src/panel/models/consolePreview.ts — the DevTools-style one-line preview of a typed console
// value (spec §1): collapsed results (Task 2) and the eager preview under the prompt (Task 8).
import test from 'node:test';
import assert from 'node:assert/strict';
import './harness.mjs';

const { previewLine, PREVIEW_MAX, PREVIEW_ITEMS } = await import('../../src/panel/models/consolePreview.ts');

const T = (kind, fields) => ({ $xray: kind, ...fields });
const range = (n) => Array.from({ length: n }, (_, i) => i);

test('defaults: 120 characters, five entries', () => {
  assert.equal(PREVIEW_MAX, 120);
  assert.equal(PREVIEW_ITEMS, 5);
});

test('arrays: Array(n) with the first entries that fit, then …', () => {
  assert.equal(previewLine(range(500), { max: 23 }), 'Array(500) [0, 1, 2, …]');
  assert.equal(previewLine(range(500)), 'Array(500) [0, 1, 2, 3, 4, …]');
  assert.equal(previewLine(T('array', { items: [0, 1, 2], length: 500 })), 'Array(500) [0, 1, 2, …]');
  assert.equal(previewLine([1, 'a', null]), "Array(3) [1, 'a', null]");
  assert.equal(previewLine([]), 'Array(0) []');
  assert.equal(previewLine([[1, 2], { a: 1 }]), 'Array(2) [Array(2), {…}]');
});

test('objects: unquoted identifier keys, single-quoted strings', () => {
  assert.equal(previewLine({ id: 1, name: 'Ada', email: 'ada@example.com' }, { max: 23 }), "{id: 1, name: 'Ada', …}");
  assert.equal(previewLine({ id: 1, name: 'Ada' }), "{id: 1, name: 'Ada'}");
  assert.equal(previewLine({ 'content-type': 'json', ok: true }), "{'content-type': 'json', ok: true}");
  assert.equal(previewLine({}), '{}');
  assert.equal(previewLine(T('object', { class: 'Point', entries: [['x', 1]] })), 'Point {x: 1}');
  assert.equal(previewLine(T('object', { entries: [['a', 1]], omitted: 4 })), '{a: 1, …}');
  assert.equal(previewLine({ s: "it's" }), "{s: 'it\\'s'}");
});

test('web objects: Response fields, Headers entries', () => {
  const headers = T('web', { cls: 'Headers', fields: {}, entries: [['a', '1'], ['b', '2']] });
  const response = T('web', { cls: 'Response', fields: { status: 200, ok: true, statusText: 'OK', url: 'https://api.test/x', headers } });
  assert.equal(previewLine(response, { max: 35 }), 'Response {status: 200, ok: true, …}');
  assert.equal(previewLine(response), "Response {status: 200, ok: true, statusText: 'OK', url: 'https://api.test/x', headers: Headers(2)}");
  assert.equal(previewLine(headers, { max: 26 }), "Headers(2) {'a' => '1', …}");
  assert.equal(previewLine(headers), "Headers(2) {'a' => '1', 'b' => '2'}");
  assert.equal(previewLine(T('web', { cls: 'RegExp', fields: { source: 'ab+c', flags: 'gi' } })), '/ab+c/gi');
  assert.equal(previewLine(T('web', { cls: 'URL', fields: { href: 'https://a.test/', origin: 'https://a.test' } }), { max: 32 }), "URL {href: 'https://a.test/', …}");
  assert.equal(previewLine(T('web', { cls: 'File', fields: { name: 'a.txt', size: 3, type: 'text/plain' } })), "File {name: 'a.txt', size: 3, type: 'text/plain'}");
  assert.equal(previewLine({ r: response }), '{r: Response}');
  // Accessors are listed by name and never read (review ruling 1): DevTools' lazy (…).
  assert.equal(previewLine(T('instance', { cls: 'Account', entries: [['id', 7]], getters: ['x', 'bad'] })), 'Account {id: 7, x: (…), bad: (…)}');
  assert.equal(previewLine({ a: T('instance', { cls: 'Account', entries: [], getters: ['x'] }) }), '{a: Account}');
  // A plain object with an own getter: no class name, the accessor lazy; an accessor array index.
  assert.equal(previewLine(T('instance', { cls: '', entries: [['a', 1]], getters: ['x'] })), '{a: 1, x: (…)}');
  assert.equal(previewLine({ o: T('instance', { cls: '', entries: [], getters: ['x'] }) }), '{o: {…}}');
  assert.equal(previewLine([1, T('accessor')]), 'Array(2) [1, (…)]');
});

test('promises show their state', () => {
  assert.equal(previewLine(T('promise', { state: 'fulfilled', value: 5 })), 'Promise {<fulfilled>: 5}');
  assert.equal(previewLine(T('promise', { state: 'pending' })), 'Promise {<pending>}');
  assert.equal(previewLine(T('promise', { state: 'rejected', value: T('error', { name: 'Error', message: 'x' }) })), 'Promise {<rejected>: Error: x}');
  assert.equal(previewLine({ p: T('promise', { state: 'pending' }) }), '{p: Promise}');
});

test('functions: params, async, class, native, the XRAY wrapper', () => {
  const fn = (fields) => T('function', { name: '', params: '', async: false, kind: 'function', ...fields });
  assert.equal(previewLine(fn({ name: 'formatPrice', params: "cents, currency = 'EUR'" })), "ƒ formatPrice(cents, currency = 'EUR')");
  assert.equal(previewLine(fn({ name: 'load', params: 'url', async: true })), 'async ƒ load(url)');
  assert.equal(previewLine(fn({ name: 'Foo', kind: 'class' })), 'class Foo');
  assert.equal(previewLine(fn({ name: 'fetch', kind: 'native' })), 'ƒ fetch() [native code]');
  assert.equal(previewLine(fn({ name: 'fetch', params: '...args', async: true, wrappedByXray: true })), 'ƒ fetch() — wrapped by XRAY');
  assert.equal(previewLine(fn({ params: 'a', kind: 'arrow' })), '(a) => {…}');
  assert.equal(previewLine(T('function', { name: 'old' })), 'ƒ old()', 'an envelope from the Logs (name only)');
  assert.equal(previewLine({ f: fn({ name: 'go', params: 'a' }) }), '{f: ƒ go}');
});

test('DOM nodes and the other typed values', () => {
  assert.equal(previewLine(T('dom', { tag: 'div', id: 'app', classes: ['main'], attrs: [], text: '', children: [], more: 0 })), '<div#app.main>');
  assert.equal(previewLine(T('dom', { tag: 'p', id: '', classes: ['a', 'b'], attrs: [], text: '', children: [], more: 0 })), '<p.a.b>');
  assert.equal(previewLine(T('dom', { text: '<body>' })), '<body>', 'a Logs envelope keeps its text');
  assert.equal(previewLine(T('map', { size: 2, entries: [['k', 1], [2, 'v']] })), "Map(2) {'k' => 1, 2 => 'v'}");
  assert.equal(previewLine(T('set', { size: 1, values: [1] })), 'Set(1) {1}');
  assert.equal(previewLine(T('error', { name: 'TypeError', message: 'boom' })), 'TypeError: boom');
  assert.equal(previewLine(T('date', { iso: '1970-01-01T00:00:00.000Z', local: 'Thu Jan 01 1970' })), 'Thu Jan 01 1970');
  assert.equal(previewLine(T('date', { iso: '1970-01-01T00:00:00.000Z' })), '1970-01-01T00:00:00.000Z');
  assert.equal(previewLine(T('typedarray', { type: 'Uint8Array', length: 3, values: [1, 2, 3] })), 'Uint8Array(3) [1, 2, 3]');
  assert.equal(previewLine([T('bigint', { value: '10' }), T('number', { value: 'NaN' }), T('undefined'), T('symbol', { description: 's' })]),
    'Array(4) [10n, NaN, undefined, Symbol(s)]');
  assert.equal(previewLine(T('string', { value: 'abc', length: 9 })), "'abc…'");
  assert.equal(previewLine([T('circular'), T('unreadable'), T('depth', { type: 'array', length: 2 })]), 'Array(3) [[Circular], [unreadable], Array(2)]');
  assert.equal(previewLine('hi'), "'hi'");
  assert.equal(previewLine(42), '42');
  assert.equal(previewLine(null), 'null');
  assert.equal(previewLine(undefined), 'undefined');
});

test('truncation: never longer than max, ending with …', () => {
  const long = previewLine('x'.repeat(500));
  assert.equal(long.length, 120);
  assert.ok(long.endsWith('…'));
  assert.equal(previewLine('x'.repeat(50), { max: 10 }), "'xxxxxxxx…");
  for (const max of [5, 12, 40]) assert.ok(previewLine({ a: 'y'.repeat(100), b: range(50) }, { max }).length <= max);
});

test('truncation never splits a surrogate pair', () => {
  assert.equal(previewLine('😀'.repeat(20), { max: 4 }), "'😀…");
  assert.equal(previewLine('😀'.repeat(20), { max: 3 }), "'…", 'the cut steps back over a lone high surrogate');
});
