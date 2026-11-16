// shared/console-helpers.js — console values both ways (spec J8).
//
// Results are serialized in the page (encodeResult) into the typed log model (Task 4's
// "$xray" envelopes) as JSON text, so CDP never sees a JS object to reorder and nothing JSON
// cannot hold is lost. The command context arrives as tagged JSON text and is revived in the
// page (reviveContext / reviveValue): unsafe integers become BigInt, NaN/±Infinity/-0/undefined
// come back, and "__proto__" stays a plain key. Values are built inside the vm realm (inVm) so
// the module's own Map/Error/class checks see what a page would hand them.
import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';

import { hostify, loadIsolatedWorld } from './vm-load.mjs';

const context = loadIsolatedWorld('shared/console-helpers.js');
const H = context.window.XRAY_ConsoleHelpers;
const inVm = (code) => vm.runInContext(`(${code})`, context);
const T = (kind, fields) => ({ $xray: kind, ...fields });

/** encodeResult on a value made in the page realm: the envelope plus its parsed result. */
function encode(code) {
  const out = hostify(H.encodeResult(inVm(code)));
  assert.equal(typeof out.result, 'string', `the result travels as text: ${JSON.stringify(out)}`);
  return { ...out, value: JSON.parse(out.result) };
}

// ─────────────────────────────────────────────────────────────── results (page → panel)

test('encodeResult: plain JSON stays plain and keeps the page key order, as text', () => {
  const out = encode('({ b: 1, a: 2, "10": 3, "2": 4, "-1": 5 })');
  assert.equal(out.result, '{"2":4,"10":3,"b":1,"a":2,"-1":5}');
  assert.equal(out.type, 'object');
  assert.equal(out.truncated, false);
  assert.equal(out.render, undefined);
  assert.equal(encode('[1, "two", true, null, { n: 1.5 }]').result, '[1,"two",true,null,{"n":1.5}]');
  assert.equal(encode('"hi"').result, '"hi"');
  assert.equal(encode('42').type, 'number');
});

test('encodeResult: NaN, -0, undefined, ±Infinity, BigInt and lone surrogates are typed, never lost', () => {
  const out = encode('[NaN, -0, undefined, 1 / 0, -1 / 0, 9007199254740993n, "\\ud800x", 0]');
  assert.deepEqual(out.value, [
    T('number', { value: 'NaN' }), T('number', { value: '-0' }), T('undefined'), T('number', { value: 'Infinity' }),
    T('number', { value: '-Infinity' }), T('bigint', { value: '9007199254740993' }), '\ud800x', 0,
  ]);
  assert.ok(out.result.includes('"\\ud800x"'), 'the lone surrogate is escaped in the text, so no transport can replace it');
  assert.deepEqual(encode('undefined'), { type: 'undefined', result: '{"$xray":"undefined"}', truncated: false, value: T('undefined') });
  assert.deepEqual(encode('10n').value, T('bigint', { value: '10' }));
  assert.equal(encode('10n').type, 'bigint');
  assert.equal(encode('-(2n ** 70n)').value.value, '-1180591620717411303424');
  assert.deepEqual(encode('[undefined, , 1]').value, [T('undefined'), T('undefined'), 1], 'a hole reads as undefined, never null');
});

test('encodeResult: a repeated reference is not circular; only an ancestor is', () => {
  assert.deepEqual(encode('(() => { const s = { x: 1 }; return { a: s, b: s, c: [s, s] }; })()').value,
    { a: { x: 1 }, b: { x: 1 }, c: [{ x: 1 }, { x: 1 }] });
  assert.deepEqual(encode('(() => { const c = { name: "c" }; c.self = c; c.list = [c]; return c; })()').value,
    { name: 'c', self: T('circular'), list: [T('circular')] });
  const map = encode('(() => { const m = new Map(); m.set("me", m); return m; })()').value;
  assert.deepEqual(map, T('map', { size: 1, entries: [['me', T('circular')]] }));
});

test('encodeResult: Map, Set, Date, Error (with cause), symbols, functions and class instances', () => {
  assert.deepEqual(encode('new Map([[1, { a: 1 }], ["k", [2]]])').value, T('map', { size: 2, entries: [[1, { a: 1 }], ['k', [2]]] }));
  assert.deepEqual(encode('new Set([1, "x", NaN])').value, T('set', { size: 3, values: [1, 'x', T('number', { value: 'NaN' })] }));
  // The local text is the page's own Date#toString (its time zone), beside the ISO instant.
  const date = encode('new Date(0)').value;
  assert.deepEqual(date, T('date', { iso: '1970-01-01T00:00:00.000Z', local: date.local }));
  assert.equal(typeof date.local, 'string');
  assert.deepEqual(encode('new Date(NaN)').value, T('date', { iso: null }));
  const error = encode('(() => { const e = new TypeError("boom", { cause: new Error("inner") }); e.code = "E_X"; return e; })()');
  assert.equal(error.type, 'object');
  assert.equal(error.value.$xray, 'error');
  assert.equal(error.value.name, 'TypeError');
  assert.equal(error.value.message, 'boom');
  assert.match(error.value.stack, /^TypeError: boom/);
  assert.deepEqual(error.value.entries, [['code', 'E_X']]);
  assert.equal(error.value.cause.$xray, 'error');
  assert.equal(error.value.cause.message, 'inner');
  assert.deepEqual(encode('Symbol("s")').value, T('symbol', { description: 's' }));
  // A function carries its parameter list, kind and (capped) source (console round 2, G7).
  assert.deepEqual(encode('function named() {}').value,
    T('function', { name: 'named', params: '', async: false, kind: 'function', source: 'function named() {}' }));
  assert.equal(encode('function named() {}').type, 'function');
  assert.deepEqual(encode('new (class Point { constructor() { this.x = 1; } })()').value, T('object', { class: 'Point', entries: [['x', 1]] }));
  assert.deepEqual(encode('Object.assign(Object.create(null), { a: 1 })').value, { a: 1 }, 'a null-prototype object is plain');
  assert.deepEqual(encode('new Uint8Array([1, 2, 3])').value, T('typedarray', { type: 'Uint8Array', length: 3, values: [1, 2, 3] }));
});

test('encodeResult: an object that has the "$xray" key is listed, never read as a typed value', () => {
  assert.deepEqual(encode('({ $xray: "bigint", value: "1" })').value, T('object', { entries: [['$xray', 'bigint'], ['value', '1']] }));
  assert.deepEqual(encode('({ outer: { $xray: "undefined" } })').value, { outer: T('object', { entries: [['$xray', 'undefined']] }) });
});

test('encodeResult: __proto__ and constructor are plain keys', () => {
  assert.equal(encode('JSON.parse(\'{"__proto__":{"x":1},"constructor":2}\')').result, '{"__proto__":{"x":1},"constructor":2}');
  const grouped = encode('(() => { const out = Object.create(null); out.constructor = [1]; out.__proto__ = [2]; return out; })()');
  assert.equal(grouped.result, '{"constructor":[1],"__proto__":[2]}');
});

test('encodeResult: the console caps are kept and stated as metadata (items, keys, depth, string, budget)', () => {
  const array = encode('Array(5000).fill(1)');
  assert.equal(array.truncated, true);
  assert.deepEqual(array.value, T('array', { items: Array(1000).fill(1), length: 5000 }));
  const keys = encode('Object.fromEntries(Array.from({ length: 600 }, (_, i) => ["k" + i, i]))');
  assert.equal(keys.value.$xray, 'object');
  assert.equal(keys.value.entries.length, 500);
  assert.equal(keys.value.omitted, 100);
  const deep = encode('JSON.parse("[".repeat(12) + "]".repeat(12))');
  let level = deep.value;
  let depth = 0;
  while (Array.isArray(level)) { level = level[0]; depth += 1; }
  assert.equal(depth, 9, 'containers to depth 8 are expanded');
  assert.deepEqual(level, T('depth', { type: 'array', length: 1 }));
  const long = encode('"x".repeat(250000)');
  assert.deepEqual(long.value, T('string', { value: 'x'.repeat(200000), length: 250000 }));
  assert.equal(long.type, 'string');
  const big = encode('Array.from({ length: 1000 }, () => "y".repeat(1000))');
  assert.equal(big.value.$xray, 'array', 'a result past the budget is cut, still structured');
  assert.equal(big.value.length, 1000);
  assert.ok(big.value.items.length < 1000 && big.value.items.length > 100, String(big.value.items.length));
  assert.ok(big.result.length < 210_000, `the text stays near the 200,000-char transfer cap (${big.result.length})`);
  const map = encode('new Map(Array.from({ length: 5000 }, (_, i) => [i, i]))');
  assert.equal(map.value.size, 5000);
  assert.equal(map.value.entries.length, 1000);
  const surrogate = encode('"a".repeat(199999) + "\\ud83d\\ude00" + "b"');
  assert.equal(surrogate.value.value.length, 199999, 'a cut never splits a surrogate pair');
  const hugeBigint = encode('10n ** 300000n');
  assert.deepEqual(hugeBigint.value, T('unreadable'), 'BigInt digits are all or nothing');
  assert.equal(hugeBigint.truncated, true);
});

test('encodeResult: an Error message and stack are cut at what is left of the budget, and the cut is stated', () => {
  // A stack longer than a string may be: kept as a plain-string prefix, the cut stated.
  const long = encode('(() => { const e = new Error("x"); e.stack = "Error: x\\n" + "    at f (app.js:1:1)\\n".repeat(20000); return e; })()');
  assert.equal(long.truncated, true, 'a stack past the string cap is a stated cut');
  assert.equal(typeof long.value.stack, 'string', 'the stack stays a plain string (Logs and reviveValue read it as one)');
  assert.ok(long.value.stack.startsWith('Error: x\n    at f (app.js:1:1)\n'), 'a prefix of the stack');
  assert.ok(long.result.length < 210_000, `the text stays near the 200,000-char transfer cap (${long.result.length})`);
  // An Error reached after the budget is nearly spent: its stack gets only what is left.
  const late = encode('["y".repeat(199500), (() => { const e = new Error("late"); e.stack = "Error: late\\n" + "    at g (app.js:2:2)\\n".repeat(1000); return e; })()]');
  assert.equal(late.truncated, true, 'the stack cut is stated');
  assert.ok(late.result.length < 210_000, `the stack stays inside the result budget (${late.result.length})`);
  const error = late.value[1];
  assert.equal(error.$xray, 'error');
  assert.equal(error.message, 'late');
  assert.ok(error.stack === undefined || (typeof error.stack === 'string' && error.stack.length <= 1000), `a short prefix or none (${error.stack?.length})`);
  const revived = H.reviveValue(long.value);
  assert.equal(Object.prototype.toString.call(revived), '[object Error]');
  assert.equal(revived.stack, long.value.stack, 'the cut stack revives as the Error stack');
  // A message past the string cap is a stated cut too (it was cut silently).
  const message = encode('new Error("m".repeat(250000))');
  assert.equal(message.truncated, true);
  assert.equal(message.value.message.length, 200000);
  // Within the budget nothing changes.
  const short = encode('(() => { const e = new Error("ok"); e.stack = "Error: ok\\n    at h"; return e; })()');
  assert.equal(short.truncated, false);
  assert.equal(short.value.stack, 'Error: ok\n    at h');
  assert.equal(short.value.message, 'ok');
});

test('encodeResult: a getter is never called (listed lazily); a revoked proxy is unreadable; the walk never throws', () => {
  // Console round 2 ruling: no accessor outside the web classes runs, own or inherited.
  assert.deepEqual(encode('({ ok: 1, get bad() { throw new Error("no"); } })').value, T('instance', { cls: '', entries: [['ok', 1]], getters: ['bad'] }));
  assert.deepEqual(encode('(() => { const p = Proxy.revocable({}, {}); p.revoke(); return p.proxy; })()').value, T('unreadable'));
  assert.deepEqual(encode('(() => { const p = Proxy.revocable([], {}); p.revoke(); return [1, p.proxy]; })()').value, [1, T('unreadable')]);
});

test('encodeResult: table() rows travel with an out-of-band render flag, never as a key', () => {
  const runtime = H.createRuntime({});
  const rows = inVm('[{ a: 1 }, { a: 2 }]');
  const table = runtime.table(rows);
  assert.equal(Array.isArray(table), true, 'table() evaluates to the rows themselves');
  assert.notEqual(table, rows, 'a copy, so the caller\'s array is never marked');
  assert.equal(table.length, 2);
  const out = hostify(H.encodeResult(table));
  assert.equal(out.render, 'table');
  assert.equal(out.result, '[{"a":1},{"a":2}]');
  assert.equal(out.type, 'array');
  assert.equal(hostify(H.encodeResult(rows)).render, undefined, 'only what table() returned renders as a table');
  assert.equal(hostify(H.encodeResult(runtime.toTable('nope'))).result, '[]');
  assert.equal(JSON.stringify(hostify(H.encodeResult(inVm('({ t: 1 })')))).includes('__xr_render'), false);
});

// ───────────────────────────────────────────────────────────── context (panel → page)

test('reviveContext: unsafe integers become BigInt, NaN/±Infinity/-0/undefined come back, __proto__ stays a plain key', () => {
  const text = JSON.stringify({
    scope: { $_: [T('bigint', { value: '9007199254740993' }), T('number', { value: 'NaN' }), T('number', { value: '-0' }), T('undefined'), T('number', { value: '-Infinity' })] },
    values: { req: JSON.parse('{"__proto__":{"polluted":true},"id":1}') },
  });
  const revived = H.reviveContext(text);
  const last = revived.scope.$_;
  assert.equal(last[0], 9007199254740993n);
  assert.ok(Number.isNaN(last[1]));
  assert.ok(Object.is(last[2], -0));
  assert.ok(Object.prototype.hasOwnProperty.call(last, 3), 'undefined is an element, not a hole');
  assert.equal(last[3], undefined);
  assert.equal(last[4], -Infinity);
  const req = revived.values.req;
  assert.ok(Object.prototype.hasOwnProperty.call(req, '__proto__'), '__proto__ is an own key');
  assert.equal(req.polluted, undefined, 'and never the prototype');
  assert.deepEqual(Object.keys(req), ['__proto__', 'id']);
  assert.equal(inVm('({}).polluted'), undefined);
  assert.deepEqual(hostify(H.reviveContext('not json')), {});
  assert.deepEqual(hostify(H.reviveContext('[1]')), {});
});

test('reviveValue: Map, Set, Date, Error, listed objects and cut containers become page values', () => {
  const map = H.reviveValue(T('map', { size: 2, entries: [[1, { a: 1 }], [T('bigint', { value: '5' }), 'five']] }));
  assert.equal(Object.prototype.toString.call(map), '[object Map]');
  assert.deepEqual(hostify(map.get(1)), { a: 1 });
  assert.equal(map.get(5n), 'five');
  const set = H.reviveValue(T('set', { size: 2, values: ['x', T('undefined')] }));
  assert.equal(set.has('x') && set.has(undefined), true);
  assert.equal(H.reviveValue(T('date', { iso: '1970-01-01T00:00:00.000Z' })).getTime(), 0);
  assert.ok(Number.isNaN(H.reviveValue(T('date', { iso: null })).getTime()));
  const error = H.reviveValue(T('error', { name: 'TypeError', message: 'boom', stack: 'TypeError: boom', entries: [['code', 'E']], cause: T('error', { name: 'Error', message: 'inner' }) }));
  assert.equal(Object.prototype.toString.call(error), '[object Error]');
  assert.equal(error.name, 'TypeError');
  assert.equal(error.message, 'boom');
  assert.equal(error.code, 'E');
  assert.equal(error.cause.message, 'inner');
  const listed = H.reviveValue(T('object', { class: 'Point', entries: [['$xray', 'bigint'], ['value', '1'], ['__proto__', 2]] }));
  assert.deepEqual(Object.keys(listed), ['$xray', 'value', '__proto__'], 'a listed object is plain data again');
  assert.equal(listed.$xray, 'bigint');
  assert.deepEqual(hostify(H.reviveValue(T('array', { items: [1, 2], length: 5 }))), [1, 2]);
  assert.equal(H.reviveValue(T('string', { value: 'abc', length: 10 })), 'abc');
  assert.equal(H.reviveValue(T('symbol', { description: 'd' })).toString(), 'Symbol(d)');
  assert.equal(H.reviveValue(T('function', { name: 'f' })), 'ƒ f()');
  assert.equal(H.reviveValue(T('circular')), '[Circular]');
  assert.deepEqual(Array.from(H.reviveValue(T('typedarray', { type: 'Uint8Array', length: 3, values: [1, 2, 3] }))), [1, 2, 3]);
  // Forged or hostile shapes stay bounded data.
  assert.equal(typeof H.reviveValue(T('typedarray', { type: 'Uint8Array', length: 1e12 })), 'string', 'no allocation from a length');
  assert.deepEqual(hostify(H.reviveValue(T('array', { items: 'x', length: 1e12 }))), []);
  assert.deepEqual(hostify(H.reviveValue(T('nope', { a: 1 }))), { $xray: 'nope', a: 1 }, 'an unknown kind is plain data');
  const forgedMap = H.reviveValue(T('map', { size: 1e12, entries: 'x' }));
  assert.equal(Object.prototype.toString.call(forgedMap), '[object Map]');
  assert.equal(forgedMap.size, 0, 'only the entries present are rebuilt');
});

test('createRuntime: res, req, prev, next and pins come from the typed context values; raw text is the fallback', () => {
  const current = { id: 'c', type: 'api', url: 'https://x.test/u', urlPath: '/u', responseRaw: '{"id":9007199254740993}', requestBody: '{"q":1}' };
  const before = { id: 'p', type: 'api', url: 'https://x.test/u', urlPath: '/u', responseRaw: '{"id":1}' };
  const text = JSON.stringify({
    currentEntry: current,
    entries: [before, current],
    values: {
      res: { id: T('bigint', { value: '9007199254740993' }) },
      req: { q: T('bigint', { value: '12345678901234567890' }) },
      prev: { id: T('bigint', { value: '9007199254740992' }) },
    },
    pins: { a: { id: 'p', value: { n: T('bigint', { value: '12345678901234567890' }) } }, b: { id: 'q', body: '{"plain":1}' } },
  });
  const runtime = H.createRuntime(H.reviveContext(text));
  assert.equal(typeof runtime.res.id, 'bigint');
  assert.equal(runtime.res.id, 9007199254740993n);
  assert.equal(runtime.response, runtime.res);
  assert.equal(runtime.$res, runtime.res);
  assert.equal(runtime.req.q, 12345678901234567890n);
  assert.equal(runtime.prev.id, 9007199254740992n);
  assert.equal(runtime.next, null);
  assert.equal(runtime.a.n, 12345678901234567890n);
  assert.deepEqual(hostify(runtime.b), { plain: 1 }, 'a pin without a typed value still parses its body');
  const fallback = H.createRuntime(H.reviveContext(JSON.stringify({ currentEntry: current, entries: [current] })));
  assert.equal(typeof fallback.res.id, 'number', 'no typed value: the raw body is parsed in the page, as before');
});

test('helpers that serialize are BigInt-safe: copy, diff, toCSV; schema types a BigInt as a number', () => {
  let copied = null;
  const runtime = H.createRuntime({}, (value) => { copied = value; });
  assert.doesNotThrow(() => runtime.copy(inVm('({ id: 9007199254740993n })')));
  assert.equal(copied, '{\n  "id": 9007199254740993\n}');
  assert.doesNotThrow(() => runtime.copy(undefined));
  assert.equal(copied, 'undefined');
  const changes = H.diff(inVm('({ id: 9007199254740993n, same: 1n })'), inVm('({ id: 9007199254740992n, same: 1n })'));
  assert.deepEqual(Object.keys(changes.changed), ['id']);
  assert.equal(changes.changed.id.from, 9007199254740993n);
  assert.equal(H.toCSV(inVm('[{ id: 9007199254740993n, n: 1 }]')), 'id,n\n9007199254740993,1');
  assert.deepEqual(hostify(H.schema(inVm('({ id: 10n, n: 1 })'))), { id: 'number', n: 'number' });
});
