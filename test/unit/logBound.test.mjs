/* The typed log model under a bound (src/panel/models/logBound.ts; spec J7, J9, plan Task 8):
 * content/content.js's checker in TypeScript, so a saved session keeps logs in the model with
 * their cuts as metadata (`string`/`array`/`object`/`depth` envelopes, `length`/`size`/`omitted`),
 * never as a JSON-prefix string. Parity with content.js itself is in test/log-model.test.js. */
import test from 'node:test';
import assert from 'node:assert/strict';
await import('./harness.mjs');
const LB = await import('../../src/panel/models/logBound.ts');
const LV = await import('../../src/panel/models/logValue.ts');

const T = (kind, fields = {}) => ({ $xray: kind, ...fields });
const json = (value) => JSON.parse(JSON.stringify(value));
const limits = (overrides) => ({ ...LB.LOG_PERSIST_LIMITS, ...overrides });

test('the limits: content.js per entry, and the saved session’s', () => {
  assert.deepEqual(LB.LOG_ENTRY_LIMITS, { depth: 8, items: 500, string: 100_000, stack: 100_000, key: 20_000, nodes: 20_000, chars: 2_000_000 });
  assert.deepEqual(LB.LOG_PERSIST_LIMITS, { depth: 8, items: 500, string: 20_000, stack: 20_000, key: 20_000, nodes: 10_000, chars: 20_000 });
});

test('a value within the bound comes back unchanged; natives become envelopes (JSON-safe)', () => {
  const plain = { a: [1, 'two', null, true], b: { c: { d: 1.5 } }, e: T('bigint', { value: '9007199254740993' }), f: T('map', { size: 2, entries: [['k', 1]] }) };
  assert.deepEqual(LB.boundLogValue(plain, LB.LOG_PERSIST_LIMITS), plain);
  const natives = { nan: NaN, neg: -0, big: 10n, undef: undefined, date: new Date(0), bad: new Date(NaN), map: new Map([['k', 1]]), set: new Set([1]),
    bytes: new Uint8Array([7]), buffer: new ArrayBuffer(3), fn: function named() {}, sym: Symbol('s') };
  const out = LB.boundLogValue(natives, LB.LOG_PERSIST_LIMITS);
  assert.deepEqual(json(out), out, 'JSON-safe');
  assert.deepEqual(out, {
    nan: T('number', { value: 'NaN' }), neg: T('number', { value: '-0' }), big: T('bigint', { value: '10' }), undef: T('undefined'),
    date: T('date', { iso: '1970-01-01T00:00:00.000Z' }), bad: T('date', { iso: null }), map: T('map', { size: 1, entries: [['k', 1]] }),
    set: T('set', { size: 1, values: [1] }), bytes: T('typedarray', { type: 'Uint8Array', length: 1, values: [7] }),
    buffer: T('typedarray', { type: 'ArrayBuffer', length: 3 }), fn: T('function', { name: 'named' }), sym: T('symbol', { description: 's' }),
  });
  const cyclic = { name: 'c' };
  cyclic.self = cyclic;
  assert.deepEqual(LB.boundLogValue(cyclic, LB.LOG_PERSIST_LIMITS), { name: 'c', self: T('circular') });
  const error = new TypeError('boom', { cause: new Error('inner') });
  const typed = LB.boundLogValue(error, LB.LOG_PERSIST_LIMITS);
  assert.equal(typed.$xray, 'error');
  assert.equal(typed.name, 'TypeError');
  assert.equal(typed.cause.message, 'inner');
});

test('an object with the reserved key that is not a valid envelope stays data (escaped as an object envelope)', () => {
  assert.deepEqual(LB.boundLogValue(T('bigint', { value: 'abc' }), LB.LOG_PERSIST_LIMITS), T('object', { entries: [['$xray', 'bigint'], ['value', 'abc']] }));
  assert.deepEqual(LB.boundLogValue(T('evil', { payload: 1 }), LB.LOG_PERSIST_LIMITS), T('object', { entries: [['$xray', 'evil'], ['payload', 1]] }));
  assert.deepEqual(LB.boundLogValue(T('bigint', { value: '12', sneaky: 1 }), LB.LOG_PERSIST_LIMITS), T('bigint', { value: '12' }), 'a valid envelope is rebuilt field by field');
});

test('cuts are metadata: strings, arrays, objects, Maps, Sets, Errors, typed arrays, depth, BigInt digits', () => {
  assert.deepEqual(LB.boundLogValue('s'.repeat(30), limits({ string: 10 })), T('string', { value: 's'.repeat(10), length: 30 }));
  assert.deepEqual(LB.boundLogValue(T('string', { value: 's'.repeat(20), length: 99 }), limits({ string: 10 })), T('string', { value: 's'.repeat(10), length: 99 }));
  assert.deepEqual(LB.boundLogValue([1, 2, 3, 4], limits({ items: 2 })), T('array', { items: [1, 2], length: 4 }));
  assert.deepEqual(LB.boundLogValue({ a: 1, b: 2, c: 3 }, limits({ items: 2 })), T('object', { entries: [['a', 1], ['b', 2]], omitted: 1 }));
  assert.deepEqual(LB.boundLogValue(new Map([['a', 1], ['b', 2]]), limits({ items: 1 })), T('map', { size: 2, entries: [['a', 1]] }));
  assert.deepEqual(LB.boundLogValue(T('set', { size: 9, values: [1, 2, 3] }), limits({ items: 2 })), T('set', { size: 9, values: [1, 2] }));
  assert.deepEqual(LB.boundLogValue(T('typedarray', { type: 'Int8Array', length: 4, values: [1, 2, 3, 4] }), limits({ items: 3 })),
    T('typedarray', { type: 'Int8Array', length: 4, values: [1, 2, 3] }));
  const error = LB.boundLogValue(T('error', { name: 'Error', message: 'm'.repeat(50), stack: 'k'.repeat(50) }), limits({ string: 5, stack: 7 }));
  assert.deepEqual(error, T('error', { name: 'Error', message: 'm'.repeat(5), stack: 'k'.repeat(7) }));
  let deep = { leaf: 1 };
  for (let i = 0; i < 20; i++) deep = { next: deep };
  let node = LB.boundLogValue(deep, LB.LOG_PERSIST_LIMITS);
  let levels = 0;
  while (node.next && !node.next.$xray) { node = node.next; levels++; }
  assert.equal(node.next.$xray, 'depth');
  assert.ok(levels <= 9, `${levels} levels kept`);
  assert.deepEqual(LB.boundLogValue(T('bigint', { value: '9'.repeat(30) }), limits({ chars: 10 })), T('unreadable'), 'digits are all or nothing');
  // One character budget for the value: later strings keep what is left, keys past it are counted.
  assert.deepEqual(LB.boundLogValue(['aaaa', 'bbbb', 'cccc'], limits({ chars: 6 })), ['aaaa', T('string', { value: 'bb', length: 4 }), T('string', { value: '', length: 4 })]);
  assert.deepEqual(LB.boundLogValue({ ab: 1, cd: 2, ef: 3 }, limits({ chars: 4 })), T('object', { entries: [['ab', 1], ['cd', 2]], omitted: 1 }));
});

test('boundLogArgs: one budget for the console call; one argument is the value, several are the list', () => {
  const single = LB.boundLogArgs('z'.repeat(50), 1, limits({ chars: 20 }));
  assert.deepEqual(single, { logData: T('string', { value: 'z'.repeat(20), length: 50 }), logArgCount: 1 });
  const several = LB.boundLogArgs(['x'.repeat(15), 'y'.repeat(15)], 2, limits({ chars: 20 }));
  assert.deepEqual(several, { logData: ['x'.repeat(15), T('string', { value: 'y'.repeat(5), length: 15 })], logArgCount: 2 });
  assert.deepEqual(LB.boundLogArgs([], 0, LB.LOG_PERSIST_LIMITS), { logData: [], logArgCount: 0 });
  // An array logged alone is one argument, not a list.
  assert.deepEqual(LB.boundLogArgs([1, 2, 3], 1, LB.LOG_PERSIST_LIMITS), { logData: [1, 2, 3], logArgCount: 1 });
  const many = LB.boundLogArgs(Array.from({ length: 600 }, (_, i) => i), 600, LB.LOG_PERSIST_LIMITS);
  assert.equal(many.logArgCount, 500, 'at most 500 arguments, as content.js carries');
});

test('the bound is stable: bounding a bounded value changes nothing', () => {
  const wide = Object.fromEntries(Array.from({ length: 60 }, (_, i) => [`key${i}`, 'v'.repeat(700)]));
  const inputs = [
    'z'.repeat(150_000), wide, Array.from({ length: 900 }, (_, i) => ({ i, s: 's'.repeat(40) })),
    { nan: NaN, map: new Map([[{ k: 1 }, new Set([1n])]]), error: new RangeError('r') },
    T('array', { items: ['a'.repeat(30_000)], length: 5 }),
  ];
  for (const chars of [0, 50, 5_000, 20_000]) {
    for (const input of inputs) {
      const once = json(LB.boundLogValue(input, limits({ chars })));
      assert.deepEqual(json(LB.boundLogValue(once, limits({ chars }))), once, `chars ${chars}`);
    }
  }
});

test('hostile values: a throwing getter or name, a class instance, a proxy at the top', () => {
  const getter = {};
  Object.defineProperty(getter, 'x', { enumerable: true, get() { throw new Error('no'); } });
  assert.deepEqual(LB.boundLogValue(getter, LB.LOG_PERSIST_LIMITS), { x: T('unreadable') });
  const fn = function () {};
  Object.defineProperty(fn, 'name', { get() { throw new Error('no'); } });
  assert.deepEqual(LB.boundLogValue(fn, LB.LOG_PERSIST_LIMITS), T('function', { name: '' }));
  class Point { constructor() { this.x = 1; } }
  assert.deepEqual(LB.boundLogValue(new Point(), LB.LOG_PERSIST_LIMITS), T('object', { class: 'Point', entries: [['x', 1]] }));
  const proxy = new Proxy({}, { ownKeys() { throw new Error('no'); } });
  assert.deepEqual(LB.boundLogValue(proxy, LB.LOG_PERSIST_LIMITS), T('unreadable'));
  assert.deepEqual(LB.boundLogArgs([proxy, 1], 2, LB.LOG_PERSIST_LIMITS), { logData: [T('unreadable'), 1], logArgCount: 2 });
});

test('a bounded value renders: the Logs text says what was cut', () => {
  const out = LB.boundLogValue({ list: Array.from({ length: 700 }, (_, i) => i) }, LB.LOG_PERSIST_LIMITS);
  assert.equal(out.list.$xray, 'array');
  assert.equal(out.list.length, 700);
  assert.match(LV.logValueText(out), /…200 more\]\}$/);
});
