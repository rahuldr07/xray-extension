// content/console-capture.js in a fake MAIN world (spec J7, never-throw part): logging a
// value never throws into the host page, and one value structured clone rejects never
// costs the other logs in its batch.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const test = require('node:test');

const SOURCE = fs.readFileSync(require.resolve('../content/console-capture.js'), 'utf8');

// Tests can make the bridge refuse values without depending on today's encoder gaps:
// `reject(message)` refuses a whole message; `uncloneable(value)` makes structured clone
// (postMessage and the page's structuredClone alike) refuse any message or value that
// contains a matching value, the way it refuses a function or a Symbol.
function captureHarness({ reject, uncloneable } = {}) {
  const listeners = {};
  const posted = [];
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
  const window = {
    addEventListener(type, listener) { (listeners[type] ||= []).push(listener); },
    // Like the real bridge: the message is structured-cloned at the call site, so a
    // function or a Symbol anywhere in it throws a DataCloneError right here.
    postMessage(message) {
      if (reject?.(message)) throw new DOMException('The object could not be cloned.', 'DataCloneError');
      posted.push(clone(message));
    },
  };
  const pageConsole = {};
  for (const level of ['log', 'warn', 'error', 'info', 'debug', 'table', 'dir']) pageConsole[level] = () => {};
  const context = {
    window,
    console: pageConsole,
    WeakRef,
    structuredClone: clone,
    setTimeout: (fn) => { const timer = { fn, cleared: false }; timers.push(timer); return timer; },
    clearTimeout: (timer) => { if (timer) timer.cleared = true; },
    setInterval: () => 0,
  };
  vm.createContext(context);
  context.Element = vm.runInContext('(class Element {})', context);
  vm.runInContext(SOURCE, context);
  const token = posted.find((message) => message.__xray_bridge_ready__).token;
  return {
    token,
    posted,
    // Values are created inside the page realm, so `instanceof Date` holds in the script.
    run: (code) => vm.runInContext(code, context),
    // Runs the due timers the way the page's event loop would: anything thrown here
    // is thrown into the host page from XRAY's timer.
    flush() { for (const timer of timers.splice(0)) if (!timer.cleared) timer.fn(); },
    batches: () => posted.filter((message) => message.__xray_capture__ && message.batch),
    entries: () => posted.filter((message) => message.__xray_capture__ && message.batch).flatMap((message) => message.entries),
    dispatch(data) { for (const listener of listeners.message || []) listener({ source: window, data }); },
  };
}

// Typed values are `{ $xray: kind, … }` envelopes (spec J7, Task 4 replaced Task 1's interim
// "[Function: name]" / "Symbol(s)" / __type__ shapes with the typed log model).
test('a function, a Symbol and an invalid Date are encoded, and their batch posts all five logs', () => {
  const page = captureHarness();
  page.run(`
    console.log('before');
    console.log(function namedFn() {});
    console.log(Symbol('s'));
    console.log(new Date(NaN));
    console.log('after');
  `);
  assert.doesNotThrow(() => page.flush(), 'the flush must not throw into the page');
  assert.equal(page.batches().length, 1, 'one message for the whole batch');
  const data = page.entries().map((entry) => entry.logData);
  assert.equal(data.length, 5, 'every log of the batch arrives');
  assert.equal(data[0], 'before');
  assert.deepEqual(data[1], { $xray: 'function', name: 'namedFn' });
  assert.deepEqual(data[2], { $xray: 'symbol', description: 's' });
  assert.deepEqual(data[3], { $xray: 'date', iso: null });
  assert.equal(data[4], 'after');
});

test('functions and Symbols are encoded in multi-argument logs too, and an anonymous function has an empty name', () => {
  const page = captureHarness();
  page.run(`console.warn('cb', () => 1, Symbol(), 10n, NaN);`);
  assert.doesNotThrow(() => page.flush());
  const [entry] = page.entries();
  assert.equal(entry.logLevel, 'warn');
  assert.deepEqual(entry.logData.slice(0, 3), ['cb', { $xray: 'function', name: '' }, { $xray: 'symbol', description: '' }]);
  // JSON-safe envelopes, not natives: the DevTools relay and chrome.storage would lose those.
  assert.deepEqual(entry.logData[3], { $xray: 'bigint', value: '10' });
  assert.deepEqual(entry.logData[4], { $xray: 'number', value: 'NaN' });
});

test('exotic values nested in an object keep their log whole: function, Symbol, SVG element, class with a static name()', () => {
  const page = captureHarness();
  page.run(`
    // A static name() makes Weird.name, and so constructor.name, a function.
    class Weird { static name() { return 'not a string'; } }
    const svg = new Element();
    svg.tagName = 'SVG';
    svg.className = { baseVal: 'icon' };
    console.log('sibling before');
    console.log({ fn: function namedFn() {}, sym: Symbol('s'), svg, weird: new Weird(), kept: 'yes' });
    console.log(new Weird());
    console.log('sibling after');
  `);
  assert.doesNotThrow(() => page.flush());
  assert.equal(page.batches().length, 1, 'the batch posts as one message: every preview is cloneable');
  const entries = page.entries();
  assert.equal(entries.length, 4);
  assert.ok(entries.every((entry) => !entry.captureDegraded), 'nothing is degraded');
  assert.equal(entries[0].logData, 'sibling before');
  assert.equal(entries[3].logData, 'sibling after');
  const nested = entries[1].logData;
  assert.deepEqual(nested.fn, { $xray: 'function', name: 'namedFn' });
  assert.deepEqual(nested.sym, { $xray: 'symbol', description: 's' });
  assert.deepEqual(nested.svg, { $xray: 'dom', text: '<svg.icon>' }, 'an SVG element (className is not a string) is still described');
  assert.equal(nested.kept, 'yes');
  assert.equal(typeof nested.weird, 'object');
  assert.equal(nested.weird.__type__, undefined, 'a constructor name that is not a string is not carried');
  assert.equal(entries[2].logData.__type__, undefined);
});

test('an argument structured clone rejects costs only itself: the other arguments of its log survive', () => {
  const page = captureHarness({ uncloneable: (value) => value === 'refused by clone' });
  page.run(`console.log('sibling log'); console.log('first', 'refused by clone', { n: 1 });`);
  assert.doesNotThrow(() => page.flush());
  const entries = page.entries();
  assert.equal(entries.length, 2, 'the sibling log and the log itself both arrive');
  assert.equal(entries[0].logData, 'sibling log');
  assert.equal(entries[0].captureDegraded, undefined);
  assert.ok(Array.isArray(entries[1].logData), 'the log keeps its arguments');
  const [first, refused, object] = entries[1].logData;
  assert.equal(first, 'first');
  assert.match(refused, /could not be captured/);
  assert.equal(object.n, 1);
  assert.equal(entries[1].captureDegraded, true);
});

test('a log that structured clone still rejects costs only itself: its siblings arrive and it arrives degraded', () => {
  const page = captureHarness({ reject: (message) => message.entries?.some((entry) => entry.logData === 'unclonable') });
  page.run(`console.log('first'); console.log('unclonable'); console.log('last');`);
  assert.doesNotThrow(() => page.flush(), 'the flush must not throw into the page');
  const entries = page.entries();
  assert.deepEqual(entries.map((entry) => entry.logData === 'first' || entry.logData === 'last' ? entry.logData : 'degraded'),
    ['first', 'degraded', 'last'], 'order is kept and nothing is dropped');
  const degraded = entries[1];
  assert.equal(degraded.captureDegraded, true, 'the replaced payload is flagged');
  assert.equal(typeof degraded.logData, 'string');
  assert.match(degraded.logData, /could not be captured/);
  assert.equal(degraded.type, 'log');
  assert.ok(entries.every((entry) => !entry.captureDegraded || entry === degraded), 'siblings are not flagged');
});

test('a bridge that rejects everything never throws into the page, and logging keeps working afterwards', () => {
  let rejecting = true;
  const page = captureHarness({ reject: (message) => rejecting && message.__xray_capture__ });
  page.run(`console.log('lost while the bridge is down');`);
  assert.doesNotThrow(() => page.flush());
  rejecting = false;
  page.run(`console.log('back');`);
  assert.doesNotThrow(() => page.flush());
  assert.deepEqual(page.entries().map((entry) => entry.logData), ['back'], 'the batch timer is re-armed after a failed flush');
});

test('Fix1 a log the bridge refuses even degraded is counted as a clone-failed drop, not lost silently', () => {
  // Every capture message carrying the warn-level log is refused, its degraded copy too.
  const page = captureHarness({ reject: (message) => !!message.__xray_capture__ && message.entries?.some((entry) => entry.logLevel === 'warn') });
  page.run(`console.log('fine'); console.warn('doomed');`);
  assert.doesNotThrow(() => page.flush());
  assert.deepEqual(page.entries().map((entry) => entry.logData), ['fine']);
  const drops = page.posted.filter((message) => message.__xray_capture_drop__);
  assert.deepEqual(drops.map(({ reason, count, token }) => ({ reason, count, token })), [{ reason: 'clone-failed', count: 1, token: page.token }]);
});

test('an argument the preview encoder cannot read keeps its log and its sibling arguments', () => {
  const page = captureHarness();
  // A proxy whose key list throws: the encoder cannot read it at all.
  page.run(`
    const unreadable = new Proxy({}, { ownKeys() { throw new Error('trap'); } });
    console.log('before', unreadable, 'after');
  `);
  assert.doesNotThrow(() => page.flush());
  const [entry] = page.entries();
  assert.ok(entry, 'the log is not dropped');
  assert.equal(entry.logData[0], 'before');
  assert.match(entry.logData[1], /could not be captured/);
  assert.equal(entry.logData[2], 'after');
  assert.equal(entry.captureDegraded, true);
});

test('loading the full object of an invalid Date answers instead of throwing into the page', () => {
  const page = captureHarness();
  // Held by the page, so "Load full object" copies the live Date rather than the preview.
  page.run(`window.__date = new Date(NaN); console.log(window.__date);`);
  page.flush();
  const [entry] = page.entries();
  assert.ok(entry, 'the invalid Date is logged');
  const [refId] = entry.objectRefs;
  assert.equal(typeof refId, 'string');
  assert.doesNotThrow(() => page.dispatch({ __xray_fetch_object__: true, token: page.token, msgId: 'm1', refId }));
  const response = page.posted.find((message) => message.__xray_fetch_response__ && message.msgId === 'm1');
  assert.ok(response, 'the panel request is answered');
  assert.deepEqual(response.data, { $xray: 'date', iso: null });
});

test('loading the full object of a class with a static name() posts the copy, not the fallback preview', () => {
  const page = captureHarness();
  page.run(`
    class Weird { static name() { return 'not a string'; } }
    window.__weird = { w: new Weird(), deep: { a: { b: { c: { d: 1 } } } } };
    console.log(window.__weird);
  `);
  page.flush();
  const [entry] = page.entries();
  assert.deepEqual(entry.logData.deep.a.b.c, { $xray: 'depth', type: 'object' }, 'the preview stops at its depth limit');
  const [refId] = entry.objectRefs;
  assert.doesNotThrow(() => page.dispatch({ __xray_fetch_object__: true, token: page.token, msgId: 'm3', refId }));
  const response = page.posted.find((message) => message.__xray_fetch_response__ && message.msgId === 'm3');
  assert.equal(response.data.deep.a.b.c.d, 1, 'the full copy arrives');
  assert.equal(response.data.w.__type__, undefined);
});

test('a full object structured clone rejects is answered with its preview rather than throwing into the page', () => {
  // The bridge refuses the full copy's long string; the preview only holds its first 500 chars.
  const page = captureHarness({ uncloneable: (value) => typeof value === 'string' && value.length > 1000 });
  page.run(`window.__held = { long: 'x'.repeat(5000) }; console.log(window.__held);`);
  page.flush();
  const [refId] = page.entries()[0].objectRefs;
  assert.doesNotThrow(() => page.dispatch({ __xray_fetch_object__: true, token: page.token, msgId: 'm2', refId }));
  const response = page.posted.find((message) => message.__xray_fetch_response__ && message.msgId === 'm2');
  assert.ok(response, 'the panel request still settles');
  assert.deepEqual(response.data, { long: { $xray: 'string', value: 'x'.repeat(500), length: 5000 } });
});
