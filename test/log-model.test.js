// The typed log model (spec J7), end to end through both worlds: content/console-capture.js
// runs in a fake MAIN world, its messages cross a structured-clone bus into content/content.js
// in a fake ISOLATED world, and what reaches XRAY_Panel is asserted. Typed values (bigint,
// NaN, ±Infinity, -0, undefined, functions, Symbols, Dates, Maps, Sets, Errors with cause,
// cycles, DOM nodes, typed arrays) are `{"$xray": kind, …}` envelopes; a logged object that
// itself has a "$xray" key is always sent as an `object` envelope, so no logged value can
// ever be read as a typed one. The model is JSON-safe, so the DevTools relay, persistence
// and Session JSON carry it unchanged.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const { isDeepStrictEqual } = require('node:util');
const vm = require('node:vm');
const test = require('node:test');

const CAPTURE_SOURCE = fs.readFileSync(require.resolve('../content/console-capture.js'), 'utf8');
const CONTENT_SOURCE = fs.readFileSync(require.resolve('../content/content.js'), 'utf8');

const unref = (fn, ms) => { const timer = setTimeout(fn, ms); timer.unref?.(); return timer; };

// One page, two worlds. Every postMessage is structured-cloned (as Chrome does) and delivered
// to both worlds' listeners when the bus is pumped, so a request from content.js reaches the
// page's listener and the page's answer comes back.
function twoWorlds({ uncloneable, prelude } = {}) {
  const queue = [];
  const pageListeners = [];
  const contentListeners = [];
  const timers = [];
  const contains = (value, seen = new Set()) => {
    if (uncloneable?.(value)) return true;
    if (!value || typeof value !== 'object' || seen.has(value)) return false;
    seen.add(value);
    return Object.values(value).some((child) => contains(child, seen));
  };
  const clone = (value) => {
    if (contains(value)) throw new DOMException('The object could not be cloned.', 'DataCloneError');
    return structuredClone(value);
  };
  // What the page posted, as the bridge carried it (the HUD stores exactly this).
  const wire = [];
  const pageWindow = {
    addEventListener(type, listener) { if (type === 'message') pageListeners.push(listener); },
    postMessage(message) {
      const copy = clone(message);
      queue.push(copy);
      if (copy.__xray_capture__ || copy.__xray_fetch_response__) wire.push(structuredClone(copy));
    },
  };
  const pageConsole = {};
  for (const level of ['log', 'warn', 'error', 'info', 'debug', 'table', 'dir']) pageConsole[level] = () => {};
  const pageContext = {
    window: pageWindow, console: pageConsole, WeakRef, structuredClone: clone,
    setTimeout: (fn) => { const timer = { fn, cleared: false }; timers.push(timer); return timer; },
    clearTimeout: (timer) => { if (timer) timer.cleared = true; },
    setInterval: () => 0,
  };
  vm.createContext(pageContext);
  // A stand-in for DOM elements: tests set tagName / id / className on instances.
  pageContext.Element = vm.runInContext('(class Element {})', pageContext);
  // Runs before console-capture.js installs (document_start), e.g. to remove a builtin.
  if (prelude) vm.runInContext(prelude, pageContext);
  vm.runInContext(CAPTURE_SOURCE, pageContext);

  const added = [];
  const contentWindow = {
    addEventListener(type, listener) { if (type === 'message') contentListeners.push(listener); },
    removeEventListener(type, listener) {
      const at = contentListeners.indexOf(listener);
      if (type === 'message' && at >= 0) contentListeners.splice(at, 1);
    },
    postMessage(message) { queue.push(structuredClone(message)); },
    XRAY_Panel: {
      init: async () => {},
      // Cloned out of the VM realm so deepEqual compares data, not prototypes.
      addAll(entries) { for (const entry of entries) added.push(structuredClone(entry)); },
      add(entry) { added.push(structuredClone(entry)); },
      show() {},
    },
  };
  const chrome = { runtime: { lastError: null, onMessage: { addListener() {} }, sendMessage(message, callback) { callback?.({ delivery: 'no-consumer' }); } } };
  const contentContext = {
    window: contentWindow, document: { addEventListener() {} }, chrome, console, Date, Set, Map, URL,
    structuredClone, setTimeout: unref, clearTimeout,
  };
  vm.createContext(contentContext);
  vm.runInContext(CONTENT_SOURCE, contentContext);

  async function pump() {
    while (queue.length) {
      const message = queue.shift();
      for (const listener of pageListeners.slice()) listener({ source: pageWindow, data: structuredClone(message) });
      await Promise.all(contentListeners.slice().map((listener) => listener({ source: contentWindow, data: structuredClone(message) })));
    }
  }

  return {
    added,
    wire,
    contentWindow,
    run: (code) => vm.runInContext(code, pageContext),
    runContent: (code) => vm.runInContext(code, contentContext),
    // The page's event loop: the batch timer fires, then the bus delivers.
    async flush() {
      for (const timer of timers.splice(0)) if (!timer.cleared) timer.fn();
      await pump();
    },
    pump,
    // content.js's "Load full object" bridge, as the panel calls it.
    async loadFull(refId) {
      const pending = contentWindow.__XRAY_fetchLogObject__(refId);
      await pump();
      // Cloned out of the VM realm so deepEqual compares data, not prototypes.
      return structuredClone(await pending);
    },
    // A message as the page could post it straight onto the bridge (bypassing the encoder).
    async post(message) {
      queue.push(structuredClone(message));
      await pump();
    },
    token: () => vm.runInContext('window.__XRAY_BRIDGE_TOKEN__', pageContext),
  };
}

async function logged(code, options) {
  const worlds = twoWorlds(options);
  await worlds.pump();
  worlds.run(code);
  await worlds.flush();
  return worlds;
}

const T = (kind, fields = {}) => ({ $xray: kind, ...fields });

test('J7 typed scalars arrive as envelopes: bigint exact digits, NaN, ±Infinity, -0, undefined, function, Symbol, Dates', async () => {
  const { added } = await logged(`
    console.log(10n); console.log(2n ** 70n); console.log(-5n);
    console.log(NaN); console.log(Infinity); console.log(-Infinity); console.log(-0); console.log(0);
    console.log(undefined); console.log(null);
    console.log(function namedFn() {}); console.log(() => 1);
    console.log(Symbol('desc')); console.log(Symbol());
    console.log(new Date(NaN)); console.log(new Date(0));
    console.log('plain', true, 42);
  `);
  const data = added.map((entry) => entry.logData);
  assert.deepEqual(data.slice(0, 16), [
    T('bigint', { value: '10' }), T('bigint', { value: '1180591620717411303424' }), T('bigint', { value: '-5' }),
    T('number', { value: 'NaN' }), T('number', { value: 'Infinity' }), T('number', { value: '-Infinity' }), T('number', { value: '-0' }), 0,
    T('undefined'), null,
    T('function', { name: 'namedFn' }), T('function', { name: '' }),
    T('symbol', { description: 'desc' }), T('symbol', { description: '' }),
    T('date', { iso: null }), T('date', { iso: '1970-01-01T00:00:00.000Z' }),
  ]);
  assert.deepEqual(data[16], ['plain', true, 42]);
  assert.deepEqual(added.map((entry) => entry.logArgCount), [...Array(16).fill(1), 3]);
  assert.ok(added.every((entry) => !entry.captureDegraded), 'nothing is degraded');
});

test('J7 the same values nested in objects and arrays are envelopes too (no "10n" strings, no native NaN)', async () => {
  const { added } = await logged(`console.log({ big: 10n, nan: NaN, neg: -0, inf: -Infinity, u: undefined, list: [undefined, 1n, NaN], fn: function cb() {}, sym: Symbol('s') });`);
  assert.deepEqual(added[0].logData, {
    big: T('bigint', { value: '10' }), nan: T('number', { value: 'NaN' }), neg: T('number', { value: '-0' }),
    inf: T('number', { value: '-Infinity' }), u: T('undefined'),
    list: [T('undefined'), T('bigint', { value: '1' }), T('number', { value: 'NaN' })],
    fn: T('function', { name: 'cb' }), sym: T('symbol', { description: 's' }),
  });
  // JSON-safe: what the DevTools relay and chrome.storage do to it changes nothing.
  assert.deepEqual(JSON.parse(JSON.stringify(added[0].logData)), added[0].logData);
});

test('J7 Map and Set carry their size and first entries; Errors carry name, message, stack, own props and a bounded cause chain', async () => {
  const { added } = await logged(`
    console.log(new Map([['k', { v: 1 }], [{ obj: true }, 'value']]));
    console.log(new Map(Array.from({ length: 12 }, (_, i) => ['k' + i, i])));
    console.log(new Set([1, 'two']));
    console.log(new Set(Array.from({ length: 11 }, (_, i) => i)));
    console.log(new Error('outer', { cause: new Error('inner', { cause: 'root cause' }) }));
    console.log(Object.assign(new TypeError('bad'), { code: 'E_BAD' }));
  `);
  const [map, bigMap, set, bigSet, error, typeError] = added.map((entry) => entry.logData);
  assert.deepEqual(map, T('map', { size: 2, entries: [['k', { v: 1 }], [{ obj: true }, 'value']] }));
  assert.equal(bigMap.size, 12);
  assert.equal(bigMap.entries.length, 10, 'a preview keeps the first 10 entries');
  assert.deepEqual(bigMap.entries[9], ['k9', 9]);
  assert.deepEqual(set, T('set', { size: 2, values: [1, 'two'] }));
  assert.deepEqual([bigSet.size, bigSet.values.length], [11, 10]);
  assert.equal(error.$xray, 'error');
  assert.deepEqual([error.name, error.message], ['Error', 'outer']);
  assert.match(error.stack, /^Error: outer/);
  assert.equal(error.cause.$xray, 'error');
  assert.deepEqual([error.cause.name, error.cause.message, error.cause.cause], ['Error', 'inner', 'root cause']);
  assert.equal(typeError.name, 'TypeError');
  assert.deepEqual(typeError.entries, [['code', 'E_BAD']], 'own enumerable properties of an Error are kept');
});

test('J7 cycles are [Circular] but a repeated non-circular reference is not; DOM nodes and typed arrays are summarised', async () => {
  const { added } = await logged(`
    const cyclic = { name: 'c' }; cyclic.self = cyclic; console.log(cyclic);
    const shared = { x: 1 }; console.log({ a: shared, b: shared });
    const div = new Element(); div.tagName = 'DIV'; div.id = 'app'; div.className = 'main extra'; console.log(div);
    const svg = new Element(); svg.tagName = 'svg'; svg.className = { baseVal: 'icon big' }; console.log({ svg });
    console.log(new Uint8Array([1, 2, 3, 4]));
    console.log(new Float64Array([NaN, 1.5]));
    console.log(new BigInt64Array([1n]));
    console.log(new ArrayBuffer(8));
    console.log(new Uint8Array(20));
  `);
  const [cyclic, siblings, div, svgHolder, bytes, floats, bigints, buffer, longBytes] = added.map((entry) => entry.logData);
  assert.deepEqual(cyclic, { name: 'c', self: T('circular') });
  assert.deepEqual(siblings, { a: { x: 1 }, b: { x: 1 } }, 'a shared sibling is not a cycle');
  assert.deepEqual(div, T('dom', { text: '<div#app.main>' }));
  assert.deepEqual(svgHolder, { svg: T('dom', { text: '<svg.icon>' }) });
  assert.deepEqual(bytes, T('typedarray', { type: 'Uint8Array', length: 4, values: [1, 2, 3, 4] }));
  assert.deepEqual(floats, T('typedarray', { type: 'Float64Array', length: 2, values: [T('number', { value: 'NaN' }), 1.5] }));
  assert.deepEqual(bigints, T('typedarray', { type: 'BigInt64Array', length: 1, values: [T('bigint', { value: '1' })] }));
  assert.deepEqual(buffer, T('typedarray', { type: 'ArrayBuffer', length: 8 }));
  assert.equal(longBytes.length, 20);
  assert.equal(longBytes.values.length, 10, 'a typed array preview keeps its first 10 values');
});

test('J7 unforgeable: a logged object with marker-looking keys is plain data at every depth', async () => {
  const { added } = await logged(`
    console.log({ __type__: 'Error', message: 'fake' });
    console.log({ fake: { $xray: 'bigint', value: '1' }, __type__: 'Error', __xray_ref__: 'x' });
    console.log({ $xray: 'undefined' });
    console.log([{ $xray: 'circular' }]);
    console.log(new Map([[{ $xray: 'function', name: 'f' }, { $xray: 'symbol', description: 'd' }]]));
  `);
  const [fakeError, nested, top, inArray, inMap] = added.map((entry) => entry.logData);
  assert.deepEqual(fakeError, { __type__: 'Error', message: 'fake' }, '__type__ is an ordinary key');
  assert.deepEqual(nested, {
    fake: T('object', { entries: [['$xray', 'bigint'], ['value', '1']] }),
    __type__: 'Error',
    __xray_ref__: 'x',
  });
  assert.deepEqual(top, T('object', { entries: [['$xray', 'undefined']] }));
  assert.deepEqual(inArray, [T('object', { entries: [['$xray', 'circular']] })]);
  assert.deepEqual(inMap.entries, [[
    T('object', { entries: [['$xray', 'function'], ['name', 'f']] }),
    T('object', { entries: [['$xray', 'symbol'], ['description', 'd']] }),
  ]]);
  for (const entry of added) assert.equal(JSON.stringify(entry).includes('__xray_ref__":"xrl'), false, 'no lazy-ref marker is emitted');
});

test('J7 class instances keep their class name; __proto__ stays an own key; truncation is metadata, not in-band text', async () => {
  const { added } = await logged(`
    class Point { constructor() { this.x = 1; } }
    console.log(new Point());
    console.log(JSON.parse('{"__proto__":{"polluted":true},"a":1}'));
    console.log(Array.from({ length: 15 }, (_, i) => i));
    console.log(Object.fromEntries(Array.from({ length: 25 }, (_, i) => ['k' + i, i])));
    console.log({ long: 'x'.repeat(600) });
    console.log('y'.repeat(600));
    console.log({ a: { b: { c: { d: { e: 1 } } } }, list: [[[[[1]]]]] });
    console.log({ get bad() { throw new Error('getter'); }, ok: 1 });
  `);
  const [point, proto, longArray, wide, longString, topString, deep, getter] = added.map((entry) => entry.logData);
  assert.deepEqual(point, T('object', { class: 'Point', entries: [['x', 1]] }));
  assert.ok(Object.prototype.hasOwnProperty.call(proto, '__proto__'), '__proto__ is an own key, not the prototype');
  assert.deepEqual(proto.__proto__, { polluted: true });
  assert.equal(Object.getPrototypeOf(proto), Object.prototype);
  assert.deepEqual(longArray, T('array', { items: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], length: 15 }));
  assert.equal(wide.$xray, 'object');
  assert.equal(wide.entries.length, 20);
  assert.equal(wide.omitted, 5);
  assert.deepEqual(longString, { long: T('string', { value: 'x'.repeat(500), length: 600 }) });
  assert.equal(topString, 'y'.repeat(600), 'a top-level string argument is kept whole up to its own cap');
  assert.deepEqual(deep.a.b.c, { d: T('depth', { type: 'object' }) });
  assert.deepEqual(deep.list, [[[T('depth', { type: 'array', length: 1 })]]]);
  assert.deepEqual(getter, { bad: T('unreadable'), ok: 1 });
});

test('J7 one array argument and three arguments stay distinct; zero arguments is an empty list', async () => {
  const { added } = await logged(`console.log([1, 2, 3]); console.log(1, 2, 3); console.log(); console.table([{ a: 1 }]); console.table([{ a: 1 }], ['a']);`);
  assert.deepEqual(added.map((entry) => [entry.logArgCount, entry.logData]), [
    [1, [1, 2, 3]],
    [3, [1, 2, 3]],
    [0, []],
    [1, [{ a: 1 }]],
    [2, [[{ a: 1 }], ['a']]],
  ]);
  assert.ok(added.every((entry) => !JSON.stringify(entry.logData).includes('__type__')), 'console.table sends its data, not a marker object');
});

test('J7 objectRefs carry one handle per object argument and objectRefArgs says which argument it is', async () => {
  const { added } = await logged(`console.log('user', { id: 1 }, 7, [2], new Map());`);
  const [entry] = added;
  assert.equal(entry.logArgCount, 5);
  assert.equal(entry.objectRefs.length, 3);
  assert.deepEqual(entry.objectRefArgs, [1, 3, 4]);
});

test('J7 log ids and object handles differ between page loads, so a persisted handle never fetches another load\'s object', async () => {
  const first = await logged(`window.__held = { a: 1 }; console.log(window.__held);`);
  const second = await logged(`window.__held = { b: 2 }; console.log(window.__held);`);
  const [a] = first.added;
  const [b] = second.added;
  assert.notEqual(a.id, b.id);
  assert.notEqual(a.objectRefs[0], b.objectRefs[0]);
  assert.equal(await second.loadFull(a.objectRefs[0]), null, "the other load's handle finds nothing here");
  assert.deepEqual(await second.loadFull(b.objectRefs[0]), { b: 2 });
});

test('J7 Load full object returns the typed full copy through content.js: deep values, cycles, siblings, bounds', async () => {
  const worlds = await logged(`
    const shared = { x: 1 };
    window.__deep = { deep: { a: { b: { c: { d: 'DEEP_VALUE' } } } }, a: shared, b: shared, big: 10n };
    window.__deep.self = window.__deep;
    console.log('label', window.__deep);
    console.log(new Map(Array.from({ length: 50 }, (_, i) => ['k' + i, i])));
    console.log(Array.from({ length: 5000 }, (_, i) => i));
  `);
  const [first, map, list] = worlds.added;
  assert.equal(first.logData[1].deep.a.b.c.$xray, 'depth', 'the preview stops at its depth');
  const full = await worlds.loadFull(first.objectRefs[0]);
  assert.equal(full.deep.a.b.c.d, 'DEEP_VALUE');
  assert.deepEqual([full.a, full.b], [{ x: 1 }, { x: 1 }], 'siblings are copied, not marked circular');
  assert.deepEqual(full.self, T('circular'));
  assert.deepEqual(full.big, T('bigint', { value: '10' }));
  const fullMap = await worlds.loadFull(map.objectRefs[0]);
  assert.equal(fullMap.entries.length, 50);
  const fullList = await worlds.loadFull(list.objectRefs[0]);
  assert.equal(fullList.$xray, 'array', 'a huge array is still bounded');
  assert.equal(fullList.length, 5000);
  assert.ok(fullList.items.length >= 1000 && fullList.items.length < 5000);
  assert.equal(await worlds.loadFull('xrl_unknown'), null, 'an unknown handle answers null');
});

test('J7 the page never sees a throw: hostile proxies, throwing getters, spoofed tags and patched prototypes', async () => {
  const worlds = twoWorlds();
  await worlds.pump();
  assert.doesNotThrow(() => worlds.run(`
    const keysTrap = new Proxy({}, { ownKeys() { throw new Error('trap'); } });
    console.log('before', keysTrap, 'after');
    console.log({ inner: keysTrap, ok: 1 });
    console.log({ [Symbol.toStringTag]: 'Map', size: 3 });
    console.log({ [Symbol.toStringTag]: 'Date' });
    Map.prototype.entries = function () { throw new Error('patched'); };
    Object.prototype.toString = function () { throw new Error('patched'); };
    console.log(new Map([['still', 'read']]));
    console.log('sibling');
  `));
  let flushed;
  assert.doesNotThrow(() => { flushed = worlds.flush(); });
  await flushed;
  const [top, nested, fakeMap, fakeDate, map, sibling] = worlds.added;
  assert.equal(top.logData[0], 'before');
  assert.match(top.logData[1], /could not be captured/);
  assert.equal(top.logData[2], 'after');
  assert.equal(top.captureDegraded, true);
  assert.deepEqual(nested.logData, { inner: T('unreadable'), ok: 1 });
  assert.equal(fakeMap.logData.$xray, undefined, 'a toStringTag is not a Map');
  assert.deepEqual(fakeMap.logData, { size: 3 });
  assert.deepEqual(fakeDate.logData, {});
  assert.deepEqual(map.logData, T('map', { size: 1, entries: [['still', 'read']] }), 'natives captured at document_start');
  assert.equal(sibling.logData, 'sibling');
});

test('J7 Element and Error are recognised by prototypes captured at document_start, not by a later Symbol.hasInstance', async () => {
  // Without Error.isError (older Chrome) the Error check takes the prototype path too.
  const worlds = twoWorlds({ prelude: 'delete Error.isError;' });
  await worlds.pump();
  worlds.run(`
    Object.defineProperty(Element, Symbol.hasInstance, { value: () => true });
    Object.defineProperty(Error, Symbol.hasInstance, { value: () => true });
    console.log({ plain: 1 });
    const el = new Element(); el.tagName = 'P'; console.log(el);
    console.log(new TypeError('real'));
  `);
  await worlds.flush();
  const [plain, element, error] = worlds.added.map((entry) => entry.logData);
  assert.deepEqual(plain, { plain: 1 }, 'a plain object is neither an element nor an Error');
  assert.deepEqual(element, T('dom', { text: '<p>' }));
  assert.equal(error.$xray, 'error');
  assert.equal(error.message, 'real');
});

// ── parity: content.js passes legitimate encoder output through unchanged ─────────
// The HUD stores the page's batches as posted; the docked panel stores content.js's rebuild.
// The encoder owns every bound (values and characters per console call, key length, depth,
// items, arguments) and counts them in the same units content.js does, with content.js's
// limits above the encoder's — so for anything the encoder emits the rebuild is the
// identity and both surfaces show the same log. Fixtures stay small: shared leaves reach
// the value budget without building it, a few 100,000-char strings the character budget.
// Large models are compared without assert's diff (it is quadratic and, on two
// 100,000-value trees, exhausts memory): equality as a boolean, the first differing path
// as the message.
function firstDifference(actual, expected, path = '$') {
  if (Object.is(actual, expected)) return null;
  if (!actual || !expected || typeof actual !== 'object' || typeof expected !== 'object' || Array.isArray(actual) !== Array.isArray(expected)) {
    const show = (value) => { const text = JSON.stringify(value) ?? String(value); return text.length > 80 ? text.slice(0, 80) + '…' : text; };
    return `${path}: ${show(actual)} ≠ ${show(expected)}`;
  }
  const keys = new Set([...Object.keys(actual), ...Object.keys(expected)]);
  for (const key of keys) {
    const found = firstDifference(actual[key], expected[key], `${path}.${key}`);
    if (found) return found;
  }
  return null;
}

function assertSameModel(actual, expected, label) {
  if (isDeepStrictEqual(actual, expected)) return;
  assert.fail(`${label}: ${firstDifference(actual, expected) ?? 'prototypes differ'}`);
}

async function parity(code) {
  const worlds = twoWorlds();
  await worlds.pump();
  worlds.run(code);
  await worlds.flush();
  const posted = worlds.wire.filter((message) => message.__xray_capture__).flatMap((message) => message.entries);
  assert.equal(worlds.added.length, posted.length, 'every posted entry arrives');
  posted.forEach((entry, index) => {
    const panel = worlds.added[index];
    assert.equal(panel.logArgCount, entry.logArgCount, `entry ${index}: logArgCount`);
    assertSameModel(panel.objectRefArgs, entry.objectRefArgs, `entry ${index}: objectRefArgs`);
    assertSameModel(panel.logData, entry.logData, `entry ${index}: the panel's model equals the HUD's`);
  });
  return { worlds, posted };
}

test('J7 parity: a preview cut by the value budget passes content.js unchanged', { timeout: 30_000 }, async () => {
  const { posted } = await parity(`
    const leaf = Object.fromEntries(Array.from({ length: 20 }, (_, i) => ['n' + i, i]));
    const level = (child) => Object.fromEntries(Array.from({ length: 20 }, (_, i) => ['k' + i, child]));
    window.__wide = level(level(level(leaf)));   // 168,421 values if walked whole
    console.log(window.__wide);
    console.log(window.__wide, window.__wide);   // two arguments share one call's budget
  `);
  const [one, two] = posted;
  assert.equal(one.logData.$xray, 'object', 'the top level was cut: an object envelope listing what fit');
  assert.ok(one.logData.omitted > 0);
  assert.equal(two.logData[1].$xray, 'depth', 'the second argument found the call\'s budget spent');
});

test('J7 parity: the character budget, the key cap and all-or-nothing BigInt digits cut the same on both sides', { timeout: 30_000 }, async () => {
  const { posted } = await parity(`
    // Ten 100,000-char arguments spend the call's 1,000,000 characters; what follows gets none.
    console.log(...Array.from({ length: 10 }, (_, i) => 'x'.repeat(99_999) + i), 'after', { key: 'value' }, 10n ** 40n);
    // A key over the key cap is omitted (counted), the others kept.
    class Wide { constructor() { this['a'.repeat(1_500)] = 1; this.kept = 2; } }
    console.log(new Wide(), { ['b'.repeat(1_200)]: 1, short: 2 });
    // The characters run out part-way through an object's keys: the rest are omitted.
    console.log(...Array.from({ length: 9 }, () => 'y'.repeat(100_000)), 'w'.repeat(99_000), { ['p'.repeat(600)]: 1, ['q'.repeat(600)]: 2 });
    // BigInt digits: whole when they fit, unreadable when they don't, never cut.
    console.log(2n ** 400000n);
    console.log(...Array.from({ length: 9 }, () => 'v'.repeat(100_000)), 't'.repeat(99_500), 10n ** 1500n, 10n ** 300n);
  `);
  const [spent, keys, partial, digits, tail] = posted;
  assert.deepEqual(spent.logData.slice(10), [T('string', { value: '', length: 5 }), T('object', { entries: [], omitted: 1 }), T('unreadable')]);
  assert.deepEqual(keys.logData, [T('object', { class: 'Wide', entries: [['kept', 2]], omitted: 1 }), T('object', { entries: [['short', 2]], omitted: 1 })]);
  assert.deepEqual(partial.logData[10], T('object', { entries: [['p'.repeat(600), 1]], omitted: 1 }));
  assert.equal(digits.logData.$xray, 'bigint');
  assert.equal(digits.logData.value.length, 120_412, 'all 120,412 digits');
  assert.deepEqual(tail.logData[10], T('unreadable'), '1,501 digits do not fit the 500 characters left');
  assert.deepEqual(tail.logData[11], T('bigint', { value: '1' + '0'.repeat(300) }), '301 digits still do');
});

test('J7 parity: typed values, deep and wide objects, Maps, Sets, Errors and typed arrays pass unchanged', { timeout: 30_000 }, async () => {
  await parity(`
    console.log({ a: { b: { c: { d: { e: { f: 1 } } } } } });
    console.log(Array.from({ length: 50 }, (_, i) => 's'.repeat(600) + i));
    console.log(new Map(Array.from({ length: 30 }, (_, i) => ['k' + i, { v: i }])), new Set(Array.from({ length: 30 }, (_, i) => i)));
    console.log(Object.assign(new TypeError('boom'.repeat(200)), { code: 'E', ['x'.repeat(1_200)]: 1 }), new Error('outer', { cause: new Error('inner') }));
    console.log(new Float64Array(40), new BigInt64Array([1n, -2n]), new DataView(new ArrayBuffer(4)), new ArrayBuffer(16));
    console.log(10n, NaN, -0, Infinity, undefined, null, function f() {}, Symbol('s'.repeat(2_000)), new Date(NaN), new Date(0));
    const c = { name: 'c' }; c.self = c;
    console.log(c, { $xray: 'bigint', value: '1' }, { __type__: 'Error', message: 'fake' }, JSON.parse('{"__proto__":{"x":1}}'));
  `);
});

test('J7 parity: a full copy cut by its budgets passes content.js unchanged', { timeout: 30_000 }, async () => {
  const worlds = twoWorlds();
  await worlds.pump();
  worlds.run(`
    const leaf = Object.fromEntries(Array.from({ length: 100 }, (_, i) => ['n' + i, i]));
    window.__big = { big: 2n ** 4000n, text: 'q'.repeat(150_000), ['k'.repeat(15_000)]: 'long key', list: Array.from({ length: 1_000 }, () => leaf) };
    console.log(window.__big);
  `);
  await worlds.flush();
  const [entry] = worlds.added;
  const full = await worlds.loadFull(entry.objectRefs[0]);
  const answer = worlds.wire.find((message) => message.__xray_fetch_response__);
  assertSameModel(full, answer.data, 'the panel\'s full object equals the page\'s answer');
  assert.equal(full.$xray, 'object', 'the long key is omitted, so the copy is an object envelope');
  assert.equal(full.omitted, 1);
  const fields = Object.fromEntries(full.entries);
  assert.equal(fields.big.value.length, 1_205);
  assert.deepEqual([fields.text.$xray, fields.text.length, fields.text.value.length], ['string', 150_000, 100_000]);
  assert.equal(fields.list.$xray, 'array', 'the value budget cut the list');
  assert.equal(fields.list.length, 1_000);
  assert.ok(fields.list.items.length < 1_000);
});

// ── content.js: the bridge validates and rebuilds the model ──────────────────────
async function bridged(entries) {
  const worlds = twoWorlds();
  await worlds.pump();
  await worlds.post({ __xray_capture__: true, token: worlds.token(), batch: true, entries });
  return worlds.added;
}

const log = (id, logData, extra = {}) => ({ id, type: 'log', logLevel: 'log', timestamp: 1, logData, logArgCount: 1, ...extra });

test('J7 content.js turns a malformed or unknown envelope into a plain object, and rebuilds valid ones field by field', async () => {
  const added = await bridged([
    log('bad-digits', T('bigint', { value: 'abc' })),
    log('unknown', T('evil', { payload: 1 })),
    log('extra', T('bigint', { value: '12', sneaky: { deep: 1 } })),
    log('bad-number', T('number', { value: '42' })),
    log('bad-map', T('map', { size: 'x', entries: 5 })),
    log('nested-bad', { list: [T('symbol', { description: 7 })] }),
  ]);
  const byId = Object.fromEntries(added.map((entry) => [entry.id, entry.logData]));
  assert.deepEqual(byId['bad-digits'], T('object', { entries: [['$xray', 'bigint'], ['value', 'abc']] }));
  assert.deepEqual(byId.unknown, T('object', { entries: [['$xray', 'evil'], ['payload', 1]] }));
  assert.deepEqual(byId.extra, T('bigint', { value: '12' }));
  assert.deepEqual(byId['bad-number'], T('object', { entries: [['$xray', 'number'], ['value', '42']] }));
  assert.deepEqual(byId['bad-map'], T('object', { entries: [['$xray', 'map'], ['size', 'x'], ['entries', 5]] }));
  assert.deepEqual(byId['nested-bad'], { list: [T('object', { entries: [['$xray', 'symbol'], ['description', 7]] })] });
});

test('J7 content.js converts native values the bridge can carry (structured clone) into the model', async () => {
  const cyclic = { name: 'c' };
  cyclic.self = cyclic;
  const added = await bridged([
    log('nan', NaN), log('neg', -0), log('big', 10n), log('undef', undefined), log('date', new Date(0)), log('bad-date', new Date(NaN)),
    log('map', new Map([['k', 1]])), log('set', new Set([1])), log('error', new TypeError('boom')), log('cycle', cyclic),
    log('bytes', new Uint8Array([7])),
  ]);
  const byId = Object.fromEntries(added.map((entry) => [entry.id, entry.logData]));
  assert.deepEqual(byId.nan, T('number', { value: 'NaN' }));
  assert.deepEqual(byId.neg, T('number', { value: '-0' }));
  assert.deepEqual(byId.big, T('bigint', { value: '10' }));
  assert.deepEqual(byId.undef, T('undefined'));
  assert.deepEqual(byId.date, T('date', { iso: '1970-01-01T00:00:00.000Z' }));
  assert.deepEqual(byId['bad-date'], T('date', { iso: null }));
  assert.deepEqual(byId.map, T('map', { size: 1, entries: [['k', 1]] }));
  assert.deepEqual(byId.set, T('set', { size: 1, values: [1] }));
  assert.equal(byId.error.$xray, 'error');
  assert.deepEqual([byId.error.name, byId.error.message], ['TypeError', 'boom']);
  assert.deepEqual(byId.cycle, { name: 'c', self: T('circular') });
  assert.deepEqual(byId.bytes, T('typedarray', { type: 'Uint8Array', length: 1, values: [7] }));
  for (const value of Object.values(byId)) assert.deepEqual(JSON.parse(JSON.stringify(value)), value, 'JSON-safe');
});

test('J7 content.js bounds hostile input: depth, item count, string length and node budget', async () => {
  let deep = { leaf: 1 };
  for (let i = 0; i < 100; i += 1) deep = { next: deep };
  const wide = Array.from({ length: 600 }, (_, i) => i);
  const huge = 'z'.repeat(200_000);
  const many = Array.from({ length: 400 }, () => Array.from({ length: 400 }, () => 1));
  const added = await bridged([log('deep', deep), log('wide', wide), log('huge', huge), log('many', many),
    log('longkey', { ['k'.repeat(30_000)]: 1, ok: 2 }), log('digits', T('bigint', { value: '9'.repeat(2_100_000) }))]);
  const byId = Object.fromEntries(added.map((entry) => [entry.id, entry.logData]));
  let node = byId.deep;
  let levels = 0;
  while (node && node.next && !node.next.$xray) { node = node.next; levels += 1; }
  assert.ok(levels < 20, `nesting is cut (${levels} levels kept)`);
  assert.equal(node.next.$xray, 'depth');
  assert.equal(byId.wide.$xray, 'array');
  assert.equal(byId.wide.length, 600);
  assert.equal(byId.wide.items.length, 500);
  assert.equal(byId.huge.$xray, 'string');
  assert.equal(byId.huge.length, 200_000);
  assert.ok(byId.huge.value.length <= 100_000);
  const count = (value) => (value && typeof value === 'object' ? 1 + Object.values(value).reduce((sum, child) => sum + count(child), 0) : 1);
  assert.ok(count(byId.many) < 25_000, 'a node budget bounds the rebuilt value');
  assert.deepEqual([byId.many.$xray, byId.many.length], ['array', 400], 'and records the cut');
  assert.deepEqual(byId.longkey, T('object', { entries: [['ok', 2]], omitted: 1 }), 'a key over the bridge\'s key cap is omitted');
  assert.deepEqual(byId.digits, T('unreadable'), 'digits over the character budget are not cut, the BigInt is unreadable');
});

test('J7 content.js carries logArgCount and objectRefArgs pairwise; a log without logArgCount passes as before (legacy)', async () => {
  const added = await bridged([
    log('multi', [1, 2, 3], { logArgCount: 3, objectRefs: ['xrl_1', 7, 'xrl_2', 'xrl_3'], objectRefArgs: [0, 1, 'x', 3] }),
    log('pairs', [{ a: 1 }, 'b', { c: 1 }], { logArgCount: 3, objectRefs: ['xrl_a', 'xrl_c'], objectRefArgs: [0, 2] }),
    log('mismatch', 'single value', { logArgCount: 3 }),
    log('bad-count', 'x', { logArgCount: -1 }),
    { id: 'legacy', type: 'log', logLevel: 'log', timestamp: 1, logData: { __type__: 'Error', name: 'Error', message: 'old', __xray_ref__: 'r' }, objectRefs: ['xrl_old'] },
  ]);
  const byId = Object.fromEntries(added.map((entry) => [entry.id, entry]));
  assert.deepEqual([byId.multi.logArgCount, byId.multi.logData], [3, [1, 2, 3]]);
  assert.deepEqual([byId.multi.objectRefs, byId.multi.objectRefArgs], [['xrl_1'], [0]], 'a pair with an invalid half is dropped whole');
  assert.deepEqual([byId.pairs.objectRefs, byId.pairs.objectRefArgs], [['xrl_a', 'xrl_c'], [0, 2]]);
  assert.deepEqual([byId.mismatch.logArgCount, byId.mismatch.logData], [1, 'single value'], 'a non-list payload is one argument');
  assert.equal(byId['bad-count'].logArgCount, undefined);
  assert.deepEqual(byId.legacy.logData, { __type__: 'Error', name: 'Error', message: 'old', __xray_ref__: 'r' }, 'legacy shapes are left for the panel decoder');
  assert.equal(byId.legacy.logArgCount, undefined);
  assert.deepEqual(byId.legacy.objectRefs, ['xrl_old']);
});

test('J7 content.js validates the Load full object answer, and jv() logs through the same model', async () => {
  const worlds = twoWorlds();
  await worlds.pump();
  assert.equal(await worlds.loadFull('xrl_x'), null, 'the page had nothing stored under that handle');

  // The page answers with natives and a forged envelope (it can: the store getter is a page global).
  const answered = twoWorlds();
  await answered.pump();
  answered.run(`window.__XRAY_getLogObject__ = () => ({ big: 10n, nan: NaN, fake: { $xray: 'bigint', value: 'nope' } });`);
  const value = await answered.loadFull('any');
  assert.deepEqual(value, {
    big: T('bigint', { value: '10' }),
    nan: T('number', { value: 'NaN' }),
    fake: T('object', { entries: [['$xray', 'bigint'], ['value', 'nope']] }),
  });

  answered.runContent(`window.jv({ big: 10n, when: new Date(0) })`);
  await new Promise((resolve) => setImmediate(resolve));
  const jv = answered.added.at(-1);
  assert.equal(jv.logArgCount, 1);
  assert.deepEqual(jv.logData, { big: T('bigint', { value: '10' }), when: T('date', { iso: '1970-01-01T00:00:00.000Z' }) });
});

// Spec J9 (plan Task 8): a saved session bounds logs with src/panel/models/logBound.ts, content.js's
// checker in TypeScript. At content.js's own limits the two give the same model for the same input.
test('J9 parity: logBound.ts at content.js limits rebuilds what content.js rebuilds', { timeout: 60_000 }, async () => {
  await import('./unit/harness.mjs');
  const LB = await import('../src/panel/models/logBound.ts');
  const cyclic = { name: 'c' };
  cyclic.self = cyclic;
  let deep = { leaf: 1 };
  for (let i = 0; i < 100; i += 1) deep = { next: deep };
  const raw = [
    log('nan', NaN), log('neg', -0), log('big', 10n), log('undef', undefined), log('date', new Date(0)), log('bad-date', new Date(NaN)),
    log('map', new Map([['k', 1], [{ o: 1 }, new Set([2n])]])), log('set', new Set([1, 'two'])), log('error', new TypeError('boom', { cause: new Error('inner') })),
    log('cycle', cyclic), log('bytes', new Uint8Array([7, 8])), log('view', new DataView(new ArrayBuffer(4))), log('buffer', new ArrayBuffer(2)),
    log('bad-digits', T('bigint', { value: 'abc' })), log('unknown', T('evil', { payload: 1 })), log('extra', T('bigint', { value: '12', sneaky: { deep: 1 } })),
    log('bad-number', T('number', { value: '42' })), log('bad-map', T('map', { size: 'x', entries: 5 })), log('nested-bad', { list: [T('symbol', { description: 7 })] }),
    log('deep', deep), log('wide', Array.from({ length: 600 }, (_, i) => i)), log('huge', 'z'.repeat(200_000)),
    log('many', Array.from({ length: 300 }, () => Array.from({ length: 300 }, () => 1))),
    log('longkey', { ['k'.repeat(30_000)]: 1, ok: 2 }), log('digits', T('bigint', { value: '9'.repeat(2_100_000) })),
    log('typed', [T('string', { value: 's'.repeat(10), length: 99 }), T('array', { items: [1], length: 4 }), T('object', { class: 'Foo', entries: [['a', 1]], omitted: 2 }),
      T('error', { name: 'E', message: 'm', stack: 's', entries: [['code', 1]], cause: T('undefined') }), T('typedarray', { type: 'Int8Array', length: 3, values: [1] }),
      T('depth', { type: 'array', length: 9 }), T('date', { iso: '2020-01-01T00:00:00.000Z' }), T('dom', { text: 'div#a' }), T('function', { name: 'f' })], { logArgCount: 9 }),
    log('args', ['x'.repeat(1_500_000), 'y'.repeat(1_000_000)], { logArgCount: 2 }),
    log('mismatch', 'single value', { logArgCount: 3 }),
  ];
  const added = await bridged(raw);
  const byId = Object.fromEntries(added.map((entry) => [entry.id, entry]));
  for (const entry of raw) {
    // What content.js was handed: the bridge structured-clones every message.
    const input = structuredClone(entry);
    const ours = LB.boundLogArgs(input.logData, input.logArgCount, LB.LOG_ENTRY_LIMITS);
    assert.deepEqual(structuredClone(ours), { logData: byId[entry.id].logData, logArgCount: byId[entry.id].logArgCount }, entry.id);
  }
});
