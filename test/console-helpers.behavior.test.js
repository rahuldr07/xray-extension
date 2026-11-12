// The one suite that executes product code: shared/console-helpers.js runs in a vm context.

const assert = require('node:assert/strict');
const test = require('node:test');
const vm = require('node:vm');

const { read } = require('./helpers/source');

test('shared console helpers build request-aware runtime helpers', () => {
  const context = { window: {}, URL };
  vm.createContext(context);
  vm.runInContext(read('shared/console-helpers.js'), context);

  const entries = [
    { id: 'a', type: 'api', method: 'GET', url: 'https://api.test/orders', urlPath: '/orders', status: 200, duration: 20, responseRaw: '{"items":[{"id":1,"total":10}]}' },
    { id: 'b', type: 'api', method: 'POST', url: 'https://api.test/orders', urlPath: '/orders', status: 500, duration: 1200, responseRaw: '{"error":"fail"}' },
  ];
  const runtime = context.window.XRAY_ConsoleHelpers.createRuntime({ currentEntry: entries[1], entries });

  assert.equal(JSON.stringify(runtime.$res), '{"error":"fail"}');
  assert.equal(runtime.res.error, 'fail');
  assert.equal(runtime.entry.id, 'b');
  assert.equal(JSON.stringify(runtime.headers), '{}');
  assert.equal(runtime.prev.items[0].total, 10);
  // table() evaluates to its rows; the render flag travels beside the value (spec J8).
  const rows = runtime.table([{ ok: true }]);
  assert.equal(Array.isArray(rows) && rows[0].ok, true);
  assert.equal(context.window.XRAY_ConsoleHelpers.encodeResult(rows).render, 'table');
  assert.equal(runtime.schema(runtime.res).error, 'string');
  assert.equal(runtime.$errors().length, 1);
  assert.equal(runtime.$slow(1000)[0].id, 'b');
  assert.equal(runtime.$status(500)[0].id, 'b');
  assert.equal(runtime.$endpoint('/orders').length, 2);
  assert.equal(runtime.$domain('api.test').length, 2);
  // Console round 2, Task 5 fix round 1: $help documents the ghost-text keys.
  assert.match(runtime.$help, /Tab or → accepts the grey suggestion; Esc dismisses it\./);
});

// ── Console round 2, Task 1: per-class projections (spec §1; G1, G6, G7, G8, bug 4) ──────────
// Web classes are the host's (Node's) WHATWG implementations injected as the page's globals, so
// the encoder's brand checks run against real platform getters. Each value is made in the vm.
// In a browser those getters are built-ins ("[native code]"); Node writes them in JS, so
// `nativize` wraps each prototype member in a callable Proxy, which reads as native code to
// Function.prototype.toString and forwards the receiver. The encoder accepts only native members
// (review ruling 2), so this is what makes the host classes stand in for the browser's.

function nativize(proto) {
  for (let level = proto; level && level !== Object.prototype; level = Object.getPrototypeOf(level)) {
    for (const key of Reflect.ownKeys(level)) {
      if (key === 'constructor') continue;
      const desc = Object.getOwnPropertyDescriptor(level, key);
      if (!desc.configurable) continue;
      const wrap = (fn) => (typeof fn === 'function' ? new Proxy(fn, {}) : fn);
      if (desc.get || desc.set) Object.defineProperty(level, key, { ...desc, get: wrap(desc.get), set: wrap(desc.set) });
      else if (typeof desc.value === 'function') Object.defineProperty(level, key, { ...desc, value: wrap(desc.value) });
    }
  }
}

const WEB_CLASSES = { URL, URLSearchParams, Headers, Request, Response, FormData, Blob, File, AbortController, AbortSignal };
for (const cls of Object.values(WEB_CLASSES)) nativize(cls.prototype);
const WEB_GLOBALS = { ...WEB_CLASSES, Promise, setTimeout, queueMicrotask };

// A minimal Element: the accessors a browser has on Element.prototype / Node.prototype, so the
// encoder can read them through the prototype (never an instance property a <form> can shadow).
// Attributes and children come as a NamedNodeMap of Attr and an HTMLCollection, as in a browser:
// the encoder reads them through those classes' built-ins too (Task 6 fix round 3).
const ELEMENT_STUB = `
  class Attr {
    constructor(name, value) { this._n = name; this._v = value; }
    get name() { return this._n; }
    get value() { return this._v; }
  }
  class NamedNodeMap {
    constructor(list) { this._l = list; }
    get length() { return this._l.length; }
    item(i) { return this._l[i] || null; }
  }
  class HTMLCollection {
    constructor(list) { this._l = list; }
    get length() { return this._l.length; }
    item(i) { return this._l[i] || null; }
  }
  class Node {
    constructor(spec) { this._s = spec; }
    get textContent() { return this._s.text || ''; }
  }
  class Element extends Node {
    get tagName() { return this._s.tag.toUpperCase(); }
    get id() { return this._s.id || ''; }
    get className() { return (this._s.classes || []).join(' '); }
    get attributes() { return new NamedNodeMap((this._s.attrs || []).map(([name, value]) => new Attr(name, value))); }
    get children() { return new HTMLCollection(this._s.kids || []); }
    get childElementCount() { return (this._s.kids || []).length; }
  }
  const el = (tag, spec = {}) => new Element({ tag, ...spec });
  Object.assign(globalThis, { Element, Node, Attr, NamedNodeMap, HTMLCollection, el });
`;

/** A page: the web globals, the Element stub (native), then `setup` (page code), then the helpers. */
function loadHelpers(setup = '', nativeNames = []) {
  const context = { window: {}, ...WEB_GLOBALS };
  vm.createContext(context);
  vm.runInContext(ELEMENT_STUB, context);
  for (const name of ['Element', 'Attr', 'NamedNodeMap', 'HTMLCollection']) nativize(context[name].prototype);
  if (setup) vm.runInContext(setup, context);
  for (const name of nativeNames) nativize(context[name].prototype);
  vm.runInContext(read('shared/console-helpers.js'), context);
  return context;
}

const PAGE = loadHelpers();
const H2 = PAGE.window.XRAY_ConsoleHelpers;
const inPage = (code) => vm.runInContext(`(${code})`, PAGE);

/** encodeResult's value parsed; awaits when the encoder returned a promise (a nested promise). */
async function encoded(code) {
  const out = await H2.encodeResult(inPage(code));
  assert.equal(typeof out.result, 'string', `the result travels as text: ${JSON.stringify(out)}`);
  return JSON.parse(out.result);
}

test('encodes Response projection without reading the body', async () => {
  const response = inPage(`new Response('{"a":1}', { status: 200, statusText: 'OK', headers: { 'content-type': 'application/json' } })`);
  const out = H2.encodeResult(response);
  const value = JSON.parse(out.result);
  assert.equal(value.$xray, 'web');
  assert.equal(value.cls, 'Response');
  assert.equal(value.fields.status, 200);
  assert.equal(value.fields.ok, true);
  assert.equal(value.fields.statusText, 'OK');
  assert.equal(value.fields.bodyUsed, false);
  assert.deepEqual(Object.keys(value.fields), ['status', 'ok', 'statusText', 'url', 'type', 'redirected', 'bodyUsed', 'headers']);
  assert.equal(value.fields.headers.cls, 'Headers');
  assert.deepEqual(value.fields.headers.entries, [['content-type', 'application/json']]);
  assert.equal(response.bodyUsed, false, 'the body is never consumed');
  assert.equal(await response.text(), '{"a":1}');
});

test('encodes Request, Headers, URLSearchParams and FormData entries in order', async () => {
  const request = await encoded(`new Request('https://api.test/x?q=1', { method: 'POST', headers: { b: '2', a: '1' } })`);
  assert.equal(request.cls, 'Request');
  assert.deepEqual(Object.keys(request.fields), ['method', 'url', 'mode', 'credentials', 'headers']);
  assert.equal(request.fields.method, 'POST');
  assert.equal(request.fields.url, 'https://api.test/x?q=1');
  // Headers iterate sorted (the platform's order); the encoder keeps that order.
  assert.deepEqual(request.fields.headers.entries, [['a', '1'], ['b', '2']]);
  assert.deepEqual(await encoded(`new URLSearchParams('z=1&a=2&z=3')`), { $xray: 'web', cls: 'URLSearchParams', fields: {}, entries: [['z', '1'], ['a', '2'], ['z', '3']] });
  const form = await encoded(`(() => { const f = new FormData(); f.append('name', 'Ada'); f.append('doc', new File(['abc'], 'a.txt', { type: 'text/plain' })); return f; })()`);
  assert.equal(form.cls, 'FormData');
  assert.deepEqual(form.entries[0], ['name', 'Ada']);
  assert.deepEqual(form.entries[1], ['doc', { $xray: 'web', cls: 'File', fields: { name: 'a.txt', size: 3, type: 'text/plain' } }]);
});

test('encodes URL fields, Blob, RegExp, AbortSignal and Date local text', async () => {
  const url = await encoded(`new URL('https://u:p@api.test:8080/a/b?x=1#h')`);
  assert.equal(url.cls, 'URL');
  assert.deepEqual(Object.keys(url.fields), ['href', 'origin', 'protocol', 'host', 'pathname', 'search', 'hash', 'searchParams']);
  assert.equal(url.fields.pathname, '/a/b');
  assert.deepEqual(url.fields.searchParams.entries, [['x', '1']]);
  assert.deepEqual(await encoded(`new Blob(['abcd'], { type: 'text/plain' })`), { $xray: 'web', cls: 'Blob', fields: { size: 4, type: 'text/plain' } });
  assert.deepEqual(await encoded('/ab+c/gi'), { $xray: 'web', cls: 'RegExp', fields: { source: 'ab+c', flags: 'gi' } });
  assert.deepEqual(await encoded(`(() => { const c = new AbortController(); c.abort('stop'); return c.signal; })()`),
    { $xray: 'web', cls: 'AbortSignal', fields: { aborted: true, reason: 'stop' } });
  const controller = await encoded('new AbortController()');
  assert.equal(controller.cls, 'AbortController');
  assert.deepEqual(controller.fields, { aborted: false, reason: { $xray: 'undefined' } });
  const date = await encoded('new Date(0)');
  assert.equal(date.iso, '1970-01-01T00:00:00.000Z');
  assert.equal(typeof date.local, 'string');
  assert.match(date.local, /19(69|70)/);
});

test('encodes PerformanceResourceTiming from its prototype getters', () => {
  // Node hands out no resource entries here: a built-in-like class of that name (native getters,
  // the platform's toStringTag), installed before the helpers resolve their classes.
  const page = loadHelpers(`globalThis.PerformanceResourceTiming = class PerformanceResourceTiming {
    get name() { return 'https://api.test/x'; } get entryType() { return 'resource'; } get initiatorType() { return 'fetch'; }
    get startTime() { return 1; } get duration() { return 12.5; } get transferSize() { return 300; }
    get encodedBodySize() { return 200; } get decodedBodySize() { return 400; } get nextHopProtocol() { return 'h2'; }
    get responseStatus() { return 200; } };
    Object.defineProperty(PerformanceResourceTiming.prototype, Symbol.toStringTag, { value: 'PerformanceResourceTiming', configurable: true });`,
  ['PerformanceResourceTiming']);
  const encode = (code) => JSON.parse(page.window.XRAY_ConsoleHelpers.encodeResult(vm.runInContext(code, page)).result);
  const out = encode('new PerformanceResourceTiming()');
  assert.equal(out.$xray, 'web');
  assert.equal(out.cls, 'PerformanceResourceTiming');
  assert.equal(out.fields.initiatorType, 'fetch');
  assert.equal(out.fields.duration, 12.5);
  assert.equal(out.fields.transferSize, 300);
  // Its getters accept any receiver, so only the toStringTag pre-filter keeps other objects out.
  assert.deepEqual(encode('new (class Foo { constructor() { this.a = 1; } })()'), { $xray: 'object', class: 'Foo', entries: [['a', 1]] });
});

test('web classes the page replaced are not trusted: a polyfill is never called', () => {
  const page = loadHelpers(`globalThis.calls = 0;
    globalThis.URLSearchParams = class URLSearchParams {
      constructor() { this.a = 1; }
      entries() { globalThis.calls += 1; return [][Symbol.iterator](); }
    };
    Object.defineProperty(URLSearchParams.prototype, Symbol.toStringTag, { value: 'URLSearchParams', configurable: true });`);
  const encode = (code) => JSON.parse(page.window.XRAY_ConsoleHelpers.encodeResult(vm.runInContext(code, page)).result);
  assert.deepEqual(encode('new (class Foo { constructor() { this.a = 1; } })()'), { $xray: 'object', class: 'Foo', entries: [['a', 1]] });
  assert.deepEqual(encode('new URLSearchParams()'), { $xray: 'object', class: 'URLSearchParams', entries: [['a', 1]] });
  assert.equal(page.calls, 0, "the polyfill's entries() never ran");
});

test('web entries: size is the true count past the listing cap', async () => {
  const many = await encoded(`new URLSearchParams(Array.from({ length: 12000 }, (_, i) => ['k' + i, '1']))`);
  assert.equal(many.entries.length, 1000);
  assert.equal(many.size, 12000);
  assert.equal(many.sizeAtLeast, undefined);
});

test('web entries: an iterator that never ends stops at 100,000 steps; size is a lower bound', () => {
  const page = loadHelpers(`globalThis.steps = 0;
    const proto = Object.getPrototypeOf(new URLSearchParams('a=1').entries());
    proto.next = function () { globalThis.steps += 1; return { done: false, value: ['k', 'v'] }; };`);
  const out = JSON.parse(page.window.XRAY_ConsoleHelpers.encodeResult(vm.runInContext(`new URLSearchParams('a=1')`, page)).result);
  assert.equal(out.cls, 'URLSearchParams');
  assert.equal(out.size, 100000);
  assert.equal(out.sizeAtLeast, true);
  assert.equal(page.steps, 100000);
});

test('own accessors are never called either: plain objects and window-like instances list them lazily', async () => {
  PAGE.side = 0;
  const plain = await encoded('({ a: 1, get x() { globalThis.side += 1; return 2; }, b: [1] })');
  assert.deepEqual(plain, { $xray: 'instance', cls: '', entries: [['a', 1], ['b', [1]]], getters: ['x'] });
  assert.equal(PAGE.side, 0);
  // A Window-like [Global] object: its attributes are own accessors (localStorage among them).
  const win = await encoded(`(() => {
    class Window { }
    const w = new Window();
    w.name = 'top';
    Object.defineProperty(w, 'localStorage', { enumerable: true, get() { globalThis.side += 1; return { token: 'secret' }; } });
    Object.defineProperty(w, 'innerWidth', { enumerable: true, get() { globalThis.side += 1; return 1024; } });
    return w; })()`);
  assert.deepEqual(win, { $xray: 'instance', cls: 'Window', entries: [['name', 'top']], getters: ['localStorage', 'innerWidth'] });
  assert.equal(JSON.stringify(win).includes('secret'), false);
  assert.equal(PAGE.side, 0, 'no own getter ran');
  // An own accessor shadowing a prototype one is listed once.
  const both = await encoded(`(() => { const o = new (class A { get x() { return 1; } get y() { return 2; } })();
    Object.defineProperty(o, 'x', { enumerable: true, get() { globalThis.side += 1; return 3; } }); return o; })()`);
  assert.deepEqual(both.getters, ['x', 'y']);
  // An array index that is an accessor is never read either.
  const array = await encoded(`(() => { const a = [1, 2]; Object.defineProperty(a, 1, { enumerable: true, get() { globalThis.side += 1; return 9; } }); return a; })()`);
  assert.deepEqual(array, [1, { $xray: 'accessor' }]);
  // A function's name and a class's constructor name are read as data, never through a getter.
  const fn = await encoded(`(() => { class K { static get name() { globalThis.side += 1; return 'fake'; } } return K; })()`);
  assert.equal(fn.name, '');
  assert.equal(PAGE.side, 0);
  // Data properties read as before.
  assert.deepEqual(await encoded('({ a: 1, b: "two", c: null })'), { a: 1, b: 'two', c: null });
});

test('encodes nested promise states after a microtask flush', async () => {
  const sync = H2.encodeResult(inPage('({ a: 1 })'));
  assert.equal(typeof sync.then, 'undefined', 'no promise inside: the result stays synchronous');
  const settled = H2.encodeResult(inPage('({ p: Promise.resolve(5) })'));
  assert.equal(typeof settled.then, 'function', 'a nested promise makes the encoder async');
  assert.deepEqual(JSON.parse((await settled).result), { p: { $xray: 'promise', state: 'fulfilled', value: 5 } });
  assert.deepEqual(await encoded('({ p: new Promise(() => {}) })'), { p: { $xray: 'promise', state: 'pending' } });
  const rejected = await encoded(`({ p: Promise.reject(new Error('x')) })`);
  assert.equal(rejected.p.state, 'rejected');
  assert.equal(rejected.p.value.$xray, 'error');
  assert.equal(rejected.p.value.message, 'x');
  // A promise resolved with its own container is a cycle, not an endless walk.
  const cycle = await encoded('(() => { const o = { n: 1 }; o.p = Promise.resolve(o); return o; })()');
  assert.deepEqual(cycle, { n: 1, p: { $xray: 'promise', state: 'fulfilled', value: { $xray: 'circular' } } });
  // A promise found inside a settled value is flushed too.
  assert.deepEqual(await encoded('({ p: Promise.resolve({ q: Promise.resolve(2) }) })'),
    { p: { $xray: 'promise', state: 'fulfilled', value: { q: { $xray: 'promise', state: 'fulfilled', value: 2 } } } });
});

test('encodes function params, kinds, async and the XRAY wrapper', async () => {
  const price = await encoded(`function formatPrice(cents, currency = 'EUR') { return cents; }`);
  assert.equal(price.$xray, 'function');
  assert.equal(price.name, 'formatPrice');
  assert.equal(price.params, "cents, currency = 'EUR'");
  assert.equal(price.async, false);
  assert.equal(price.kind, 'function');
  assert.match(price.source, /^function formatPrice/);
  const arrow = await encoded('(a, { b = (1, 2) }) => a');
  assert.equal(arrow.kind, 'arrow');
  assert.equal(arrow.params, 'a, { b = (1, 2) }');
  const bare = await encoded('x => x');
  assert.equal(bare.kind, 'arrow');
  assert.equal(bare.params, 'x');
  const load = await encoded('async function load(url, opts = ")") {}');
  assert.equal(load.async, true);
  assert.equal(load.params, 'url, opts = ")"');
  const asyncArrow = await encoded('async (a) => a');
  assert.equal(asyncArrow.async, true);
  assert.equal(asyncArrow.kind, 'arrow');
  const cls = await encoded('class Foo { constructor(a) {} }');
  assert.equal(cls.kind, 'class');
  assert.equal(cls.name, 'Foo');
  const native = await encoded('Math.max');
  assert.equal(native.kind, 'native');
  assert.equal(native.name, 'max');
  assert.equal(native.params, '');
  const method = await encoded(`({ go(a, b) { return a; } }).go`);
  assert.equal(method.kind, 'function');
  assert.equal(method.params, 'a, b');
  const wrapped = await encoded('(() => { const _xrayFetch = async function (...args) { return args; }; return _xrayFetch; })()');
  assert.equal(wrapped.name, 'fetch');
  assert.equal(wrapped.wrappedByXray, true);
  const long = await encoded(`function big() { return '${'x'.repeat(5000)}'; }`);
  assert.equal(long.source.length, 4000, 'the source is capped at 4,000 characters');
});

test('encodes a DOM snapshot with children, depth and text caps', async () => {
  const value = await encoded(`el('div', { id: 'app', classes: ['main', 'wide'], attrs: [['id', 'app'], ['data-x', '1']], text: '${'t'.repeat(250)}',
    kids: [el('p', { kids: [el('span', { kids: [el('b', { kids: [el('i')] })] })] }), ...Array.from({ length: 50 }, () => el('li'))] })`);
  assert.equal(value.$xray, 'dom');
  assert.equal(value.tag, 'div');
  assert.equal(value.id, 'app');
  assert.deepEqual(value.classes, ['main', 'wide']);
  assert.deepEqual(value.attrs, [['id', 'app'], ['data-x', '1']]);
  assert.equal(value.text.length, 200, 'text content is capped at 200 characters');
  assert.equal(value.children.length, 50);
  assert.equal(value.more, 1);
  const b = value.children[0].children[0].children[0];
  assert.equal(b.tag, 'b');
  assert.deepEqual(b.children, [], 'the third level below the node lists no children');
  assert.equal(b.more, 1, 'and counts the ones it left out');
});

test('class instances list accessor names, lazily: no getter outside the web classes runs', async () => {
  PAGE.side = 0;
  const value = await encoded(`new (class Account { constructor() { this.id = 7; } get x() { globalThis.side += 1; return 1; } get bad() { throw new Error('no'); } method() {} })()`);
  assert.deepEqual(value, { $xray: 'instance', cls: 'Account', entries: [['id', 7]], getters: ['x', 'bad'] });
  assert.equal(PAGE.side, 0, 'a getter with a side effect is never called');
  // No accessors: the object envelope, as before.
  assert.deepEqual(await encoded('new (class Point { constructor() { this.x = 1; } })()'), { $xray: 'object', class: 'Point', entries: [['x', 1]] });
  // A platform object outside the list (document-like): its cookie getter is listed, never read.
  const doc = await encoded(`(() => {
    class Node2 { get nodeName() { return '#document'; } }
    class Document extends Node2 { get cookie() { globalThis.side += 1; return 'session=secret'; } get body() { return el('body'); } }
    class HTMLDocument extends Document {}
    return new HTMLDocument(); })()`);
  assert.equal(doc.$xray, 'instance');
  assert.equal(doc.cls, 'HTMLDocument');
  assert.deepEqual(doc.getters, ['cookie', 'body', 'nodeName']);
  assert.equal(JSON.stringify(doc).includes('secret'), false, 'the cookie value is absent');
  assert.equal(PAGE.side, 0);
});

test('a DOM read never falls back to an instance property', () => {
  // A page whose Element.prototype has no `id` getter: the element's own "id" (what a <form>
  // control named "id" would put there) is not read in its place.
  const page = loadHelpers('delete Element.prototype.id;');
  const element = vm.runInContext(`(() => { const e = el('form'); Object.defineProperty(e, 'id', { value: 'shadow', enumerable: true }); return e; })()`, page);
  const value = JSON.parse(page.window.XRAY_ConsoleHelpers.encodeResult(element).result);
  assert.equal(value.tag, 'form');
  assert.equal(value.id, '');
});

test('reviving web entries keeps repeated keys', () => {
  const context = H2.reviveContext(JSON.stringify({ scope: { temp1: { $xray: 'web', cls: 'URLSearchParams', fields: {}, entries: [['z', '1'], ['z', '3']] } } }));
  assert.deepEqual(JSON.parse(JSON.stringify(context.scope.temp1)), [['z', '1'], ['z', '3']]);
});

test('no accessor runs for a toStringTag, an Error field or a typed array length', async () => {
  PAGE.side = 0;
  const tagged = await encoded(`new (class Tagged { constructor() { this.a = 1; } get [Symbol.toStringTag]() { globalThis.side += 1; return 'Map'; } })()`);
  assert.equal(tagged.$xray, 'object');
  assert.deepEqual(tagged.entries, [['a', 1]]);
  const ownTag = await encoded(`(() => { const o = { a: 1 }; Object.defineProperty(o, Symbol.toStringTag, { get() { globalThis.side += 1; return 'Promise'; } }); return o; })()`);
  assert.deepEqual(ownTag, { a: 1 });
  assert.equal(PAGE.side, 0, 'a toStringTag getter never ran');
  // A data tag still selects a web class (and only then is the brand checked).
  assert.equal((await encoded(`new Headers({ a: '1' })`)).cls, 'Headers');

  const error = await encoded(`new (class AppError extends Error { get message() { globalThis.side += 1; return 'm'; } get name() { globalThis.side += 1; return 'AppError'; } })()`);
  assert.equal(PAGE.side, 0, 'an Error subclass getter never ran');
  assert.equal(error.$xray, 'error');
  assert.equal(error.message, '');
  assert.deepEqual(error.getters, ['name', 'message', 'stack'], 'the stack is not formatted from page getters');
  vm.runInContext(`Error.prepareStackTrace = () => { globalThis.side += 1; return 'page'; };`, PAGE);
  const prepared = await encoded(`new Error('fresh')`);
  vm.runInContext('delete Error.prepareStackTrace;', PAGE);
  assert.equal(PAGE.side, 0, 'a page Error.prepareStackTrace never ran');
  assert.deepEqual(prepared.getters, ['stack']);
  // An ordinary Error keeps its name, message and the engine's own stack.
  const plain = await encoded(`new TypeError('boom')`);
  assert.equal(plain.name, 'TypeError');
  assert.equal(plain.message, 'boom');
  assert.match(plain.stack, /^TypeError: boom/);
  assert.equal(plain.getters, undefined);

  const view = await encoded(`new (class Big extends Uint8Array { get length() { globalThis.side += 1; return 99; } })(3)`);
  assert.deepEqual(view, { $xray: 'typedarray', type: 'Uint8Array', length: 3, values: [0, 0, 0] });
  const data = await encoded(`new (class DV extends DataView { get byteLength() { globalThis.side += 1; return 99; } })(new ArrayBuffer(4))`);
  assert.deepEqual(data, { $xray: 'typedarray', type: 'DataView', length: 4 });
  assert.equal(PAGE.side, 0, 'a typed array / DataView getter never ran');
});

test('an own data property shadowing a prototype accessor is an entry, not a getter', async () => {
  const value = await encoded(`(() => { const o = new (class A { get x() { return 1; } get y() { return 2; } })(); Object.defineProperty(o, 'x', { value: 5, enumerable: true }); return o; })()`);
  assert.deepEqual(value, { $xray: 'instance', cls: 'A', entries: [['x', 5]], getters: ['y'] });
});
