// shared/console-scope.js — the CDP-held console scope (console round 2, spec §2).
//
// Declarations persist: a per-tab scope object is created once (Runtime.evaluate with
// returnByValue:false) and every command runs against it through Runtime.callFunctionOn as
// `with (this) { … }`. declaredNames() finds a command's top-level bindings; planRun().text
// exports them onto the scope when the command ends. These tests run the real builders in a vm
// realm, the way the page would: the scope expression is evaluated, then each command's function
// is called with `this` = the scope and the context text as its argument.
import assert from 'node:assert/strict';
import test from 'node:test';
import util from 'node:util';
import vm from 'node:vm';

import { hostify, loadIsolatedWorld, readSource } from './runtime/vm-load.mjs';
import './harness.mjs';

const S = loadIsolatedWorld('shared/console-scope.js').window.XRAY_ConsoleScope;
const HELPERS = readSource('shared/console-helpers.js');

test('declaredNames: depth-0 bindings of every declaration form, nothing nested, nothing quoted', () => {
  const cases = [
    ['const u = res.users', ['u']],
    ['let a = 1, b = 2', ['a', 'b']],
    ['var v', ['v']],
    ['function f() { const inner = 1 }', ['f']],
    ['async function g() {}', ['g']],
    ['function* gen() {}', ['gen']],
    ['class A {}', ['A']],
    ['const {a, b: [c, ...d], e = 1} = x', ['a', 'c', 'd', 'e']],
    ['const [first, , third = f(1, 2), ...others] = list', ['first', 'third', 'others']],
    ['const { "quoted": q, [key]: k, ...rest } = o', ['q', 'k', 'rest']],
    ['for (let i = 0; i < 3; i++) {}', []],
    ['if (x) { const y = 1 }', []],
    ['() => { let z = 1 }', []],
    ['"const x = 1"; `let y = ${"const w"}`; // const c = 1\n/* let d */ 1', []],
    ['let a = (x, y) => x, b = {c: 1}', ['a', 'b']],
    ['const n = 1\nlet m = n\nm * 2', ['n', 'm']],
    ['let s = "a;b"; const t = /;const r/.source', ['s', 't']],
    ['let = 5', []],
    ['res.users.length', []],
  ];
  for (const [code, names] of cases) assert.deepEqual([...S.declaredNames(code)], names, code);
  // Each binding knows its kind: const is the one that stays read-only.
  assert.deepEqual(hostify(S.declarations('const a = 1; let b; function c() {}; class D {}; var e')),
    [{ name: 'a', kind: 'const' }, { name: 'b', kind: 'let' }, { name: 'c', kind: 'function' }, { name: 'D', kind: 'class' }, { name: 'e', kind: 'var' }]);
});

test('declaredNames is fast on a long command', () => {
  const code = Array.from({ length: 2000 }, (_, i) => `const v${i} = { a: [${i}, "s;t", \`x\${${i}}\`] };`).join('\n');
  // The best of three runs: a load spike on a busy test machine is not the scanner's cost.
  let ms = Infinity;
  let names = [];
  for (let i = 0; i < 3; i++) {
    const started = performance.now();
    names = S.declaredNames(code);
    ms = Math.min(ms, performance.now() - started);
  }
  assert.equal(names.length, 2000);
  assert.ok(ms <= 50, `${ms.toFixed(1)} ms`);
});

/**
 * A page realm with a scope created once, and a runner that drives each command the way the
 * worker does: the run function gets the scope key, only the context members the command uses
 * (contextFor), as a VALUE built in the realm (like CDP: object-literal semantics) with the
 * `__proto__` paths beside it; its promise is awaited with the realm's own `then` (as
 * Runtime.awaitPromise does natively); the answer is read with the synchronous TAKE call. The
 * declarations the scope reports decide what the next command binds.
 */
const HELPER_NAMES = ['res', 'req', 'pick', 'entry'];
// JSON with every object's keys sorted — what chrome.debugger does to an argument object.
const sortedJson = (value) => JSON.stringify(value, (key, item) => (item && typeof item === 'object' && !Array.isArray(item)
  ? Object.fromEntries(Object.keys(item).sort().map((name) => [name, item[name]])) : item));
function page(globals = {}, pageScript = '') {
  const realm = vm.createContext({ console, setTimeout, clearTimeout, navigator: {}, ...globals });
  const nativeThen = vm.runInContext('Promise.prototype.then', realm);
  if (pageScript) vm.runInContext(pageScript, realm);
  const scope = vm.runInContext(S.buildScopeExpression(HELPERS, 'k1'), realm, { filename: '<anonymous>' });
  const take = vm.runInContext(`(${S.TAKE_FUNCTION})`, realm);
  const inspect = vm.runInContext(`(${S.INSPECT_FUNCTION})`, realm);
  const finish = vm.runInContext(`(${S.FINISH_FUNCTION})`, realm);
  // Waits like Runtime.awaitPromise: the realm's own `then`, taken before any page script.
  const settle = (promise) => new Promise((resolve) => Reflect.apply(nativeThen, promise, [(value) => resolve({ ok: true, value }), (value) => resolve({ ok: false, value })]));
  // V8's own classification, as CDP reports `subtype: 'promise'` (no page `then` is consulted).
  const isNativePromise = (value) => value !== null && typeof value === 'object' && util.types.isPromise(value);
  const entry = { id: 'e1', type: 'api', method: 'GET', url: 'https://x.test/api', urlPath: '/api', status: 200, responseDecrypted: { users: [{ id: 1 }, { id: 2 }, { id: 3 }] } };
  const defaultContext = { currentEntry: entry, entries: [entry], scope: {}, pins: {} };
  let declared = {};
  const sentLog = [];
  const run = async (code, context = defaultContext) => {
    const value = typeof context === 'string' ? JSON.parse(context) : context;
    const plan = S.planRun(code, { context: S.contextNames(value, HELPER_NAMES), declared });
    const members = S.contextFor(JSON.parse(JSON.stringify(value)), plan.needed);
    sentLog.push(JSON.parse(JSON.stringify(members)));
    const fn = vm.runInContext(`(${plan.text})`, realm, { filename: '<anonymous>' });
    // As Chrome passes it: a dictionary with sorted keys, built natively (object-literal semantics).
    const args = [vm.runInContext(`(${sortedJson(S.encodeContext(members))})`, realm)];
    await settle(Reflect.apply(fn, scope, ['k1', ...args]));
    const result = Reflect.apply(inspect, scope, ['k1']);
    let mode = 'value';
    let settled;
    if (isNativePromise(result)) {
      const outcome = await settle(result);
      mode = outcome.ok ? 'fulfilled' : 'rejected';
      settled = outcome.value;
    }
    await settle(Reflect.apply(finish, scope, ['k1', mode, settled]));
    const record = JSON.parse(JSON.stringify(Reflect.apply(take, scope, ['k1'])));
    declared = record.declared || {};
    const out = record.answer ? { ...record.answer } : { state: record.state };
    if (record.promise) out.meta = { promise: { state: record.promise } };
    return typeof out?.result === 'string' ? { ...out, value: JSON.parse(out.result) } : out;
  };
  return { realm, scope, run, sent: sentLog, declared: () => declared };
}

test('planRun: a declaration persists into the next command, reading the scope context', async () => {
  const { run } = page();
  assert.equal((await run('const u = res.users')).type, 'undefined');
  assert.equal((await run('u.length')).value, 3);
  assert.equal((await run('let a = 1, b = 2; a + b')).value, 3, 'the last expression is still the result');
  assert.equal((await run('a * 10 + b')).value, 12);
  assert.deepEqual((await run('pick(u[0], ["id"])')).value, { id: 1 }, 'helpers resolve from the scope');
});

test('planRun: const stays read-only later; let/const redeclare replaces; let assigns', async () => {
  const { run } = page();
  await run('const n = 1');
  const write = await run('n = 2');
  assert.equal(write.type, 'error', JSON.stringify(write));
  assert.equal(write.error.message, 'Assignment to constant variable.');
  assert.equal(JSON.parse(write.error.value).name, 'TypeError');
  assert.equal((await run('n')).value, 1, 'the failed write changed nothing');
  await run('let n = 5');
  assert.equal((await run('n')).value, 5, 'a later let replaces the const');
  await run('n = 6');
  assert.equal((await run('n')).value, 6, 'a let binding is assignable later');
  await run('const n = 7');
  assert.equal((await run('n')).value, 7);
});

test('planRun: function and class declarations persist and stay callable', async () => {
  const { run } = page();
  await run('function double(x) { return x * 2 }\nclass Box { constructor(v) { this.v = v } }');
  assert.equal((await run('double(21)')).value, 42);
  assert.equal((await run('new Box(3).v')).value, 3);
});

test('planRun: a throw midway still exports the names initialised before it, never the rest', async () => {
  const { run } = page();
  const out = await run('const before = 1; throw new Error("x"); const after = 2');
  assert.equal(out.type, 'error');
  assert.equal(out.error.message, 'x');
  assert.equal((await run('before')).value, 1);
  assert.equal((await run('typeof after')).value, 'undefined', 'a TDZ name is skipped, not exported');
});

test('planRun: page globals stay reachable; scope names never reach the page', async () => {
  const { realm, run } = page();
  vm.runInContext('globalThis.appState = { user: { id: 7 } }; var pageSees = (name) => typeof globalThis[name];', realm);
  assert.equal((await run('const id = appState.user.id; id')).value, 7);
  assert.equal(vm.runInContext('pageSees("id") + "/" + pageSees("res") + "/" + typeof id', realm), 'undefined/undefined/undefined');
  // Commands are strict functions called without a receiver: a top-level `this` is undefined.
  assert.equal((await run('this === undefined')).value, true);
});

test('planRun: the context arrives as an argument and is refreshed per command', async () => {
  const { run } = page();
  const other = { id: 'e2', type: 'api', url: 'https://x.test/b', urlPath: '/b', responseDecrypted: { ok: true } };
  assert.equal((await run('res.users.length')).value, 3);
  assert.equal((await run('res.ok', JSON.stringify({ currentEntry: other, entries: [other], scope: { temp1: 9 }, pins: {} }))).value, true);
  assert.equal((await run('temp1', JSON.stringify({ currentEntry: other, entries: [other], scope: { temp1: 9 }, pins: {} }))).value, 9);
  assert.equal((await run('typeof temp1')).value, 'undefined', 'a saved variable not sent this time is gone');
  // The context is never part of the function source.
  const hostile = JSON.stringify({ scope: { x: '"}); throw 1; ({"' }, pins: {} });
  assert.equal((await run('x', hostile)).value, '"}); throw 1; ({"');
  assert.equal(S.planRun('x', { context: ['x'] }).text.includes('throw 1'), false);
  // The context names behave as before: `res = 1` is an assignment to a constant.
  assert.equal((await run('res = 1')).error?.message, 'Assignment to constant variable.');
});

test('planRun: a declaration shadows a context name in later commands (REPL semantics)', async () => {
  const { run } = page();
  await run('const res = { mine: true }');
  assert.deepEqual((await run('res')).value, { mine: true });
  const pinned = JSON.stringify({ currentEntry: null, entries: [], scope: {}, pins: { a: { id: 'p', body: '{"pin":1}' } } });
  assert.equal((await run('a.pin', pinned)).value, 1);
  await run('let a = 5', pinned);
  assert.equal((await run('a', pinned)).value, 5);
});

test('planRun: user names that collide with builtins do not break later commands', async () => {
  const { run } = page();
  await run('const Object = 1; const Promise = 2; const JSON = 3');
  assert.equal((await run('Object + Promise + JSON')).value, 6);
  assert.equal((await run('[1, 2].length')).value, 2);
  const promised = await run('(async () => 4)()');
  assert.equal(promised.value, 4);
  assert.equal(promised.meta?.promise?.state, 'fulfilled');
});

test('planRun: the run text keeps the command on its own lines after the marker', () => {
  const text = S.planRun('const a = 1;\na + 1', {}).text;
  const lines = text.split('\n');
  const marker = lines.indexOf(S.BODY_MARKER);
  assert.ok(marker > 0);
  assert.equal(lines[marker + 1], 'const a = 1;');
  assert.ok(lines.slice(marker + 2).includes('__xx_box((a + 1));'), text);
});

test('planRun: every frame is strict, nothing uses `with`, and the scope opens only with its key', async () => {
  const text = S.planRun('u + 1', { context: ['res'], declared: { u: 'let' } }).text;
  // Round 3: the run also takes its deadline (a run the page starts too late does nothing).
  assert.match(text, /^function \(__xx_key, __xx_context, __xx_deadline\) \{\n {2}'use strict';/);
  // Each scope's wrapper names carry its own random suffix: no user name collides with them.
  assert.match(S.planRun('1', {}, 'k3j9').text, /^function \(__xk3j9_key, __xk3j9_context, __xk3j9_deadline\)/);
  assert.equal(S.planRun('1', {}, 'bad suffix!').text.startsWith('function (__xx_key'), true);
  assert.doesNotMatch(text, /\bwith \(/);
  assert.match(S.buildScopeExpression('', 'k'), /^\(\(\) => \{\n {2}'use strict';/);
  const { scope } = page();
  assert.throws(() => scope.open('wrong'), /wrong key/);
  assert.equal(Object.getPrototypeOf(scope), null);
  assert.deepEqual(Object.keys(scope), ['open']);
  assert.equal(Object.getPrototypeOf(scope.open('k1')), null, 'the API is prototype-less, reachable only through open(key)');
  // Built with syntax only: no page-realm function is called by the scope itself — except the
  // live walk's natives (Task 7 fix round 1), each read once at creation into a constant and used
  // only on page and declared values, never on XRAY's own objects; and the preview projector's
  // (Task 8), read from the real global by descriptor and checked by their source text (string
  // literals — the names it reads them by, its model's text — are not calls and are left out).
  const captured = /^ {2}const __(?:gopd|gpo|gopn|apply|toSource|hasOwn|isArray|isView|now) = (?:Object|Reflect|Function\.prototype|Object\.prototype|Array|ArrayBuffer|Date)\.\w+;$/gm;
  assert.equal((S.buildScopeExpression('', 'k').match(captured) || []).length, 9);
  const source = S.buildScopeExpression('', 'k').replace(captured, '').replace(/\/\/[^\n]*/g, '').replace(/'[^'\n]*'/g, "''").replace(/"(?:[^"\\\n]|\\.)*"/g, '""');
  for (const native of ['Object.', 'Reflect.', 'Array.', 'setTimeout', 'Date.', 'Promise', '.call(', '.apply(']) {
    assert.equal(source.includes(native), false, native);
  }
});

test('a later command sees declarations live: a function from an earlier command updates them', async () => {
  const { run } = page();
  await run('let count = 0; function inc() { count++ }');
  await run('inc(); inc()');
  assert.equal((await run('count')).value, 2, 'read through the declaring command\'s binding');
  await run('count = 10');
  await run('inc()');
  assert.equal((await run('count')).value, 11, 'a write-back reaches the same binding');
});

test('a bare top-level assignment to a new name is a REPL declaration, never a page global', async () => {
  const { realm, run } = page();
  assert.equal((await run('x = 5')).value, 5);
  assert.equal((await run('x * 2')).value, 10);
  assert.equal(vm.runInContext('typeof x', realm), 'undefined');
  await run('total = 1; total += 2');
  assert.equal((await run('total')).value, 3);
  // A page global the scope does not hold stays the page's when assigned through `globalThis`.
  await run('globalThis.shared = 1');
  assert.equal(vm.runInContext('shared', realm), 1);
});

test('consts cannot be deleted or reassigned later; non-ASCII names persist', async () => {
  const { run } = page();
  await run('const n = 1');
  // Commands are strict: the run does not even compile (CDP reports it as the command's SyntaxError).
  await assert.rejects(run('delete n'), /Delete of an unqualified identifier in strict mode/);
  assert.equal((await run('n')).value, 1);
  await run('const café = 3; let ñ = 4');
  assert.equal((await run('café + ñ')).value, 7);
});

// Review Critical 1 (VM): the page's own probes, installed before the scope exists, never see the
// scope, its API, or the context — not through prepareStackTrace callsites (getThis,
// getFunction, .arguments, .caller), nor through a wrapped JSON.parse or Object.defineProperty.
test('no page code reaches the scope or the context (prepareStackTrace, caller, wrapped natives)', async () => {
  const probe = `
    globalThis.stolen = [];
    const look = (how, value) => {
      if (value == null || value === globalThis) return;
      let text = '';
      try { text = typeof value === 'function' ? Function.prototype.toString.call(value) : JSON.stringify(value) || ''; } catch {}
      try { if (typeof value === 'object' && ('open' in value || 'refresh' in value)) text += ' [scope]'; } catch {}
      if (/SECRET|__xray|\\[scope\\]/.test(text)) stolen.push(how + ': ' + text.slice(0, 100));
    };
    Error.prepareStackTrace = (error, sites) => {
      for (const site of sites) {
        let self; let fn;
        try { self = site.getThis(); } catch {}
        try { fn = site.getFunction(); } catch {}
        look('this', self); look('function', fn);
        if (typeof fn === 'function') { try { look('arguments', [...fn.arguments]); } catch {} try { look('caller', fn.caller); } catch {} }
      }
      return String(error && error.message);
    };
    const parse = JSON.parse; JSON.parse = function (t, r) { look('JSON.parse', String(t)); return parse(t, r); };
    const define = Object.defineProperty; Object.defineProperty = function (o, k, d) { look('defineProperty', d && d.value); return define(o, k, d); };
    globalThis.pageFn = function pageFn(x) { void new Error('p').stack; try { look('caller', pageFn.caller); } catch {} return x + 1; };
    globalThis.appState = { get probe() { void new Error('g').stack; return 2; } };
  `;
  const { realm, run } = page({}, probe);
  const secret = { id: 's', type: 'api', url: 'https://other.test/SECRET-URL', urlPath: '/a', responseDecrypted: { jwt: 'SECRET-JWT', users: [1, 2, 3] } };
  const context = { currentEntry: secret, entries: [secret], scope: { temp1: 'SECRET-SAVED' }, pins: {} };
  assert.equal((await run('const u = res.users; nope', context)).type, 'error');
  await run('const n = 1', context);
  assert.equal((await run('n = 2', context)).error.message, 'Assignment to constant variable.');
  assert.equal((await run('u.length + pageFn(1)', context)).value, 5);
  assert.equal((await run('appState.probe + temp1.length', context)).value, 2 + 'SECRET-SAVED'.length);
  assert.equal((await run('res.jwt', context)).value, 'SECRET-JWT');
  assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify(stolen)', realm)), []);
});

test('a "__proto__" key and the key order survive CDP (objects travel as ordered pairs)', async () => {
  const { run } = page();
  const context = { currentEntry: null, entries: [], pins: {}, scope: {}, values: { req: JSON.parse('{"a":1,"__proto__":{"polluted":true},"n":1}') } };
  assert.deepEqual((await run('Object.keys(req)', context)).value, ['a', '__proto__', 'n'], 'own, in its place');
  assert.equal((await run('req.polluted', context)).type, 'undefined', 'never the prototype');
  assert.deepEqual((await run('req.__proto__', context)).value, { polluted: true });
});

test('no key in the data is ever read as an escape: "__proto__" and look-alike keys are all plain keys', async () => {
  const { run } = page();
  const values = { req: JSON.parse('{"a":1,"__proto__":{"x":"own"},"xray:proto":"collide","z":[{"__proto__":5}]}') };
  const context = { currentEntry: null, entries: [], pins: {}, scope: {}, values };
  assert.deepEqual((await run('Object.keys(req)', context)).value, ['a', '__proto__', 'xray:proto', 'z']);
  assert.deepEqual((await run('req.__proto__', context)).value, { x: 'own' });
  assert.equal((await run('req["xray:proto"]', context)).value, 'collide');
  assert.equal((await run('req.z[0].__proto__', context)).value, 5);
});

test('a bare assignment to an existing page global sets the page global (no shadowing, no new global)', async () => {
  const { realm, run, declared } = page();
  vm.runInContext('globalThis.flag = 1', realm);
  await run('flag = 9');
  assert.equal(vm.runInContext('flag', realm), 9);
  assert.equal('flag' in declared(), false, 'not a REPL declaration');
  vm.runInContext('flag = 3', realm);
  assert.equal((await run('flag')).value, 3, 'later commands read the page global');
});

test('a block statement after a declaration is a statement, not an object literal', async () => {
  const { run } = page();
  const out = await run('var w = 1; { var hidden = 2 }');
  assert.notEqual(out.type, 'error', JSON.stringify(out));
  assert.equal((await run('w')).value, 1);
});

test('the context sent is only what the command names', async () => {
  const { run, sent } = page();
  await run('1 + 1');
  assert.deepEqual(sent.at(-1), { currentEntry: null, entries: [], values: {}, scope: {}, pins: {} });
  await run('res.users.length');
  assert.equal(sent.at(-1).currentEntry.id, 'e1', 'res without a typed value needs the selected entry');
  assert.deepEqual(sent.at(-1).entries, [], 'never the entry list for res');
  await run('pick({ a: 1 }, ["a"])');
  assert.deepEqual(sent.at(-1), { currentEntry: null, entries: [], values: {}, scope: {}, pins: {} }, 'a pure helper needs nothing');
});

test('a user name never collides with the wrapper (per-scope suffix), and the key is no plain identifier', async () => {
  const { run } = page();
  assert.equal((await run('var __xrayRun = 0; var __xrayKey = 1; __xrayRun + __xrayKey')).value, 1);
});

test('a page that swaps globalThis never captures a REPL declaration (the real global is the scope script\'s this)', async () => {
  const { realm, run } = page({}, `Object.defineProperty(globalThis, 'globalThis', { value: new Proxy({}, { has: () => true, set: (t, k, v) => { t[k] = v; return true; } }), configurable: true });`);
  await run('yy = "kept"');
  assert.equal((await run('yy')).value, 'kept');
  assert.equal(vm.runInContext('Object.keys(globalThis).length', realm), 0, "the page's fake global received nothing");
});

test('only a native promise is awaited: a thenable is shown as the object it is (behaviour change, review I1)', async () => {
  const { run } = page();
  const thenable = await run('({ then(resolve) { resolve(5) }, x: 1 })');
  assert.equal(thenable.meta, undefined, 'no promise header');
  assert.equal(thenable.value.x, 1, JSON.stringify(thenable));
  const real = await run('Promise.resolve(7)');
  assert.equal(real.value, 7);
  assert.equal(real.meta?.promise?.state, 'fulfilled');
  const rejected = await run('Promise.reject(new Error("no"))');
  assert.equal(rejected.error.message, 'no');
  assert.equal(rejected.meta?.promise?.state, 'rejected');
});

// ── Task 7 (spec §3 source 4): live completion through the scope ──────────────────────────────
// The worker asks CDP for the object a plain path names — a strict function on the scope, run
// with throwOnSideEffect — and lists its names with Runtime.getProperties (descriptors only, no
// page code). These are the pure halves: the function it sends, and the names it keeps.

test('planComplete: only a plain path reaches the page — never a call, an assignment or an operator', () => {
  const known = { context: ['res', 'req', 'pick', 'a'], declared: { rows: 'const', n: 'let' } };
  for (const bad of ['fetch(u)', 'a.b()', 'x = 1', 'x++', 'appState.user + 1', 'a.b`t`', 'new Foo', 'this', 'delete a.b', 'a[b]', 'a["x"+1]', '(a)', 'a;b', 'a.b.', '', 'await x', 'typeof a', 'x'.repeat(301)]) {
    assert.equal(S.planComplete(bad, known, 's1'), null, bad);
  }
  // A context name (res, helpers, pins) is answered by the panel's captured data, never the page.
  assert.equal(S.planComplete('res', known, 's1'), null);
  assert.equal(S.planComplete('pick.x', known, 's1'), null);
  for (const good of ['appState', 'appState.user', 'document.body?.firstElementChild', 'rows[0]', 'rows[0].tags', 'a1["x y"]', "b2['k\\'q']", 'window.appState', '$el', 'café.x']) {
    assert.ok(S.planComplete(good, known, 's1'), good);
  }
});

// Fix round 1 (review Critical 1): the walk runs IN THE PAGE with descriptor reads only and answers
// one string — no remote object of a page or declared value is ever created.
const livePage = (pageScript) => {
  const p = page({}, pageScript);
  const complete = (expr, declared = {}) => {
    const plan = S.planComplete(expr, { context: [], declared }, 's1');
    if (!plan) return null;
    const fn = vm.runInContext(`(${plan.text})`, p.realm);
    const path = plan.path === null ? null : vm.runInContext(`(${JSON.stringify(plan.path)})`, p.realm);
    const text = Reflect.apply(fn, p.scope, ['k1', path]);
    return { text, out: hostify(S.decodeLive(text)) };
  };
  return { ...p, complete };
};

test('planComplete: strict, no context, the path travels as data; null → the globals', () => {
  const plan = S.planComplete("rows[0]['a b'].x", { declared: { rows: 'const' } }, 's1');
  assert.match(plan.text, /^function \(__xs1_key, __xs1_path, __xs1_deadline\) \{\n {2}'use strict';\n {2}try \{\n {4}return this\.open\(__xs1_key\)\.walk\(__xs1_path, null, __xs1_deadline\);\n {2}\} catch \{\n {4}return null;\n {2}\}\n\}$/);
  assert.deepEqual(hostify(plan.path), ['rows', 1, 0, 'a b', 'x']);
  const global = S.planComplete('appState?.user', {}, 's1');
  assert.match(global.text, /walk\(__xs1_path, \(\) => appState, __xs1_deadline\)/, 'a non-declared root may be read as an identifier (a lexical binding)');
  assert.deepEqual(hostify(global.path), ['appState', 0, 'user']);
  assert.equal(S.planComplete(null, {}, 's1').path, null);
  assert.doesNotMatch(global.text, /begin|refresh|context/);
  assert.deepEqual(hostify(S.livePath('a["x\\"y"][3]')), { root: 'a', segments: ['x"y', 3] });
});

test('walk: names, kinds, own and inherited, params from source, natives marked; nothing read through a getter', async () => {
  const { complete, run, realm } = livePage(`globalThis.hits = 0;
    var appState = { user: { id: 1, name: 'Ada' }, count: 2, save(id, { force = false } = {}) {}, arrow: async (a, b) => a, one: x => x };
    Object.defineProperty(appState, 'lazy', { get() { hits++; return 1; }, enumerable: true });
    Object.defineProperty(appState, '__proto__', { value: 'own', enumerable: true });
    function formatPrice(cents, currency = 'EUR') { return cents; }
    globalThis.Widget = class Widget {};
    const lexState = { inner: 1 };`);
  const { out } = complete('appState');
  const by = Object.fromEntries(out.names.map((n) => [n.name, n]));
  assert.deepEqual(by.user, { name: 'user', kind: 'property', own: true });
  assert.deepEqual(by.lazy, { name: 'lazy', kind: 'getter', own: true });
  assert.equal(by.save.params, '(id, { force = false } = {})');
  assert.equal(by.arrow.params, '(a, b)');
  assert.equal(by.one.params, '(x)');
  assert.deepEqual(by.hasOwnProperty, { name: 'hasOwnProperty', kind: 'function', own: false, native: true });
  assert.equal(out.names.some((n) => n.name === '__proto__'), false);
  assert.equal(vm.runInContext('hits', realm), 0, 'the getter never ran');
  assert.deepEqual(complete('appState.lazy').out, { names: [], capped: false, getter: true }, 'an accessor on the path ends the walk without reading it');
  assert.equal(vm.runInContext('hits', realm), 0);
  assert.deepEqual(complete('appState.user.name').out, { names: [], type: 'string', capped: false });
  assert.deepEqual(complete('appState.nope').out, { names: [], capped: false });
  assert.equal(complete('lexState').out.names[0].name, 'inner', 'a top-level const is read as an identifier');
  assert.deepEqual(complete('missing').text, 'T', 'an unknown root: nothing there (fix round 2: not "no answer")');
  const globals = complete(null).out;
  const fp = globals.names.find((n) => n.name === 'formatPrice');
  assert.deepEqual(fp, { name: 'formatPrice', kind: 'function', own: true, params: "(cents, currency = 'EUR')" });
  assert.equal(globals.names.find((n) => n.name === 'Widget')?.kind, 'class');
  await run('const rows = [{ id: 1, tags: [] }]');
  assert.deepEqual(complete('rows[0]', { rows: 'const' }).out.names.filter((n) => n.own).map((n) => n.name), ['id', 'tags']);
});

test('walk: no page code runs — an Error value is never formatted, a patched native turns the walk off, the cap holds', () => {
  const { complete, realm } = livePage(`globalThis.stolen = [];
    Error.prepareStackTrace = (e) => { stolen.push(e.message); return 'S'; };
    Object.defineProperty(Object.prototype, 'items', { configurable: true, get() { stolen.push('items getter'); return new Error('LEAK'); } });
    var holder = { last: new Error('in-holder') };
    globalThis.errGlobal = new Error('global');
    var big = {}; for (let i = 0; i < 700; i++) big['k' + i] = i;`);
  complete('holder');
  complete('holder.items');
  complete('errGlobal');
  complete(null);
  assert.equal(vm.runInContext('JSON.stringify(stolen)', realm), '[]');
  const capped = complete('big').out;
  assert.equal(capped.names.length, 500);
  assert.equal(capped.capped, true);
  const patched = livePage('const g = Object.getOwnPropertyDescriptor; Object.getOwnPropertyDescriptor = function (o, k) { return g(o, k); };');
  assert.equal(patched.complete('Math').text, 'X', 'a native replaced before the scope existed: the walk is off');
  assert.equal(S.decodeLive('X'), null);
});

test('walk on the global object: the page\'s own names come before the built-ins; over 5,000 names is capped', () => {
  const natives = Array.from({ length: 600 }, (_, i) => `globalThis.Native${i} = Math.max;`).join('');
  const { complete } = livePage(`${natives} var appState = {};`);
  const out = complete(null).out;
  assert.ok(out.names.length > 600, 'never cut below 5,000 (fix round 2)');
  assert.equal(out.capped, false);
  assert.ok(out.names.some((n) => n.name === 'appState'));
  assert.ok(out.names.findIndex((n) => n.name === 'appState') < out.names.findIndex((n) => n.native), 'before every built-in');
  const huge = livePage('for (let i = 0; i < 5100; i++) globalThis["g" + i] = i;');
  const hugeOut = huge.complete(null).out;
  assert.equal(hugeOut.capped, true);
  assert.ok(hugeOut.names.length <= 5000);
});

// ── Task 7 fix round 2 ──────────────────────────────────────────────────────────────────────────
test('walk: arrays and typed arrays never enumerate their indices — bounded, and their members still listed', () => {
  const { complete } = livePage(`var heap = new Uint8Array(16 * 1024 * 1024); var bigArr = new Array(5e6).fill(0); var rows = Array.from({ length: 5000 }, (_, i) => ({ id: i }));
    var likes = { length: 2, 0: 'a', 1: 'b', extra: 1 };`);
  for (const [expr, want] of [['heap', ['length', 'subarray', 'map']], ['bigArr', ['length', 'map', 'filter']], ['rows', ['length', 'map', 'filter']]]) {
    const started = performance.now();
    const { out } = complete(expr);
    const ms = performance.now() - started;
    assert.ok(ms < 250, `${expr}: ${ms.toFixed(0)} ms`);
    const names = out.names.map((n) => n.name);
    for (const name of want) assert.ok(names.includes(name), `${expr} lists ${name}`);
    assert.equal(names.some((n) => /^\d/.test(n)), false);
  }
  assert.deepEqual(complete('likes').out.names.filter((n) => n.own).map((n) => n.name), ['length', 'extra'], 'an array-like: its indices skipped, its other names kept');
});

test('walk: the globals are never cut silently — page natives (bound functions, aliases) included; over 5,000 is capped', () => {
  const natives = Array.from({ length: 900 }, (_, i) => `globalThis.Native${i} = Math.max;`).join('');
  const { complete } = livePage(`${natives} globalThis.big = Math.max.bind(Math); globalThis.log2 = console.log;`);
  const out = complete(null).out;
  assert.equal(out.capped, false);
  const names = out.names.map((n) => n.name);
  assert.ok(names.includes('big') && names.includes('log2') && names.includes('Native899'), 'nothing dropped');
  const huge = livePage('for (let i = 0; i < 6000; i++) globalThis["g" + i] = i;').complete(null).out;
  assert.equal(huge.capped, true);
  assert.ok(huge.names.length <= 5000);
});

test('walk: an accessor answers "getter, not evaluated"; a missing root is nothing (not "no answer"); `stack` is never read', () => {
  const { complete, realm } = livePage(`globalThis.hits = 0; var acc = {}; Object.defineProperty(acc, 'z', { get() { hits++; return {}; } });
    var fake = { stack: 'data-stack', message: 'm' };`);
  assert.deepEqual(complete('acc.z').out, { names: [], capped: false, getter: true });
  assert.equal(vm.runInContext('hits', realm), 0);
  assert.deepEqual(complete('zzzMissing').out, { names: [], capped: false }, 'a typo: nothing, never null');
  assert.deepEqual(complete('fake.stack').out, { names: [], capped: false, getter: true }, '`stack` is skipped by name');
  const listed = complete('fake').out.names.find((n) => n.name === 'stack');
  assert.equal(listed?.kind, 'getter', 'listed, never read');
});

test('walk: a top-level let/const that shadows a window property resolves to the lexical binding', () => {
  // The worker knows the lexical names (Runtime.globalLexicalScopeNames): mode 2 reads the binding first.
  const plan = S.planComplete('status', { lexical: ['status'] }, 's1');
  assert.deepEqual(hostify(plan.path), ['status', 2]);
  const realm = vm.createContext({ console });
  vm.runInContext("Object.defineProperty(globalThis, 'status', { get() { return 'win'; }, configurable: true });", realm);
  const scope = vm.runInContext(S.buildScopeExpression(HELPERS, 'k1'), realm, { filename: '<anonymous>' });
  vm.runInContext('const status = { lexical: 1 };', realm);
  const fn = vm.runInContext(`(${plan.text})`, realm);
  const text = Reflect.apply(fn, scope, ['k1', vm.runInContext(JSON.stringify(plan.path), realm)]);
  assert.equal(hostify(S.decodeLive(text)).names[0].name, 'lexical');
});

// ── Task 7 round 3 (ruling): every run and walk carries a deadline ─────────────────────────────
test('a run or walk that begins after its deadline does nothing and says it was skipped (Date.now taken at scope creation, 50 ms grace)', () => {
  const { realm, scope } = page({}, 'var appState = { user: 1 }; globalThis.ran = 0;');
  const plan = S.planRun('ran = 1', { context: [], declared: {} }, 's1');
  const fn = vm.runInContext(`(${plan.text})`, realm, { filename: '<anonymous>' });
  assert.equal(Reflect.apply(fn, scope, ['k1', null, Date.now() - 1000]), S.SKIPPED, 'late: the sentinel, not a promise');
  assert.equal(vm.runInContext('ran', realm), 0, 'the user\'s code never ran');
  // Round 4: no grace (one clock): 20 ms late is late.
  assert.equal(Reflect.apply(fn, scope, ['k1', null, Date.now() - 20]), S.SKIPPED, 'no grace');
  assert.equal(Reflect.apply(fn, scope, ['k1', null, Date.now() + 1000]) === S.SKIPPED, false, 'in time it runs');
  const walk = S.planComplete('appState', {}, 's1');
  const walkFn = vm.runInContext(`(${walk.text})`, realm);
  const path = vm.runInContext(JSON.stringify(walk.path), realm);
  assert.equal(Reflect.apply(walkFn, scope, ['k1', path, Date.now() - 1000]), 'S');
  assert.equal(S.decodeLive('S'), null);
  assert.match(Reflect.apply(walkFn, scope, ['k1', path, Date.now() + 1000]), /^L/);
  // A page that replaces Date.now after the scope exists cannot move the deadline.
  vm.runInContext('Date.now = () => 0;', realm);
  assert.equal(Reflect.apply(walkFn, scope, ['k1', path, 1]), 'S');
});

test('round 4: Date.now is native-checked — a page clock replaced at load turns the guard off and is never called by XRAY', async () => {
  for (const clock of ['Date.now = () => 4102444800000;', 'globalThis.clockCalls = 0; Date.now = () => { clockCalls++; return 0; };']) {
    const { realm, scope } = page({}, `${clock} var appState = { user: 1 }; globalThis.ran = 0;`);
    const before = vm.runInContext('globalThis.clockCalls || 0', realm);
    const plan = S.planRun('ran = 1', { context: [], declared: {} }, 's1');
    const fn = vm.runInContext(`(${plan.text})`, realm, { filename: '<anonymous>' });
    // The worker's real clock: in time for a native clock, ignored for a replaced one.
    assert.notEqual(Reflect.apply(fn, scope, ['k1', null, Date.now() + 10000]), S.SKIPPED, `${clock}: 1+1 runs normally`);
    assert.notEqual(Reflect.apply(fn, scope, ['k1', null, Date.now() - 10000]), S.SKIPPED, `${clock}: the guard is off`);
    for (const expr of [null, 'appState']) {
      const walk = S.planComplete(expr, {}, 's1');
      const walkFn = vm.runInContext(`(${walk.text})`, realm);
      const out = Reflect.apply(walkFn, scope, ['k1', walk.path === null ? null : vm.runInContext(JSON.stringify(walk.path), realm), Date.now() - 10000]);
      assert.match(out, /^L/, `${clock}: ${expr} still answers`);
    }
    assert.equal(vm.runInContext('globalThis.clockCalls || 0', realm), before, `${clock}: the page's clock was never called`);
  }
});

// ── Task 8 (spec §4): eager preview through the scope ───────────────────────────────────────────
// The draft is evaluated by a STRICT function on the scope (the scope-locals builder, no write-back)
// and its value is projected IN THE PAGE by XRAY's own one-line projector — descriptor reads only,
// natives taken when the scope was created, never a page getter, never `stack` — into typed-model
// text read by value: CDP never describes a page or declared value. A throw is caught in the page
// and reported from the error's own data properties. Fix round 1 (ruling option C): a preview never
// sends or refreshes the context — a draft naming `res` reads what the last Run revived.
const { previewTexts } = await import('../../src/panel/models/consoleEager.ts');
const PREVIEW_CONTEXT = {
  currentEntry: { id: 'e1', type: 'api', method: 'GET', url: 'https://x.test/api', urlPath: '/api', status: 200, responseDecrypted: { users: [{ id: 1 }, { id: 2 }, { id: 3 }] } },
  entries: [], scope: {}, pins: {},
};
PREVIEW_CONTEXT.entries = [PREVIEW_CONTEXT.currentEntry];
const previewPage = (pageScript = '') => {
  const p = page({}, pageScript);
  const preview = (code, { deadline = Date.now() + 10000, context = PREVIEW_CONTEXT } = {}) => {
    const plan = S.planPreview(code, { context: S.contextNames(context, HELPER_NAMES), declared: p.declared() }, 's1');
    if (!plan) return null;
    const fn = vm.runInContext(`(${plan.text})`, p.realm, { filename: '<anonymous>' });
    const text = Reflect.apply(fn, p.scope, ['k1', deadline]);
    const decoded = hostify(S.decodePreview(text));
    return { text, decoded, line: decoded && previewTexts(decoded), plan };
  };
  return { ...p, preview };
};

test('planPreview: only an eligible draft; strict; binds only the context names it uses; nothing is written back', () => {
  const known = { context: ['res', 'req', 'pick', 'entry'], declared: { rows: 'const', n: 'let' } };
  for (const draft of ['', 'const a = 1', 'x = 1', 'x++', 'delete a.b', 'await f()', '1; 2', 'a b', 'res.', '{ a: 1 }', 'if (a) b', 'x'.repeat(2001)]) {
    assert.equal(S.planPreview(draft, known, 's1'), null, JSON.stringify(draft.slice(0, 30)));
    assert.equal(S.previewable(draft), false, JSON.stringify(draft.slice(0, 30)));
  }
  const plan = S.planPreview('res.users.length * 2 + n', known, 's1');
  assert.deepEqual(hostify(plan.needed), ['res']);
  assert.match(plan.text, /^function \(__xs1_key, __xs1_deadline\) \{\n {2}'use strict';\n {2}const __xs1_api = this\.open\(__xs1_key\);\n {2}if \(__xs1_api\.late\(__xs1_deadline\)\) return 'S';\n/);
  assert.match(plan.text, /const res = __xs1_api\.get\("res"\);/);
  assert.match(plan.text, /let n = __xs1_api\.get\("n"\);/);
  assert.doesNotMatch(plan.text, /\.begin\(|\.define\(|\.set\(|\.prepare\(|\.finish\(|with \(/);
  assert.match(plan.text, /return __xs1_api\.preview\(__xs1_value\);\n\}$/);
  assert.match(plan.text, /catch \(__xs1_error\) \{\n {4}return __xs1_api\.thrown\(__xs1_error\);/);
  assert.deepEqual(hostify(S.planPreview('1+1', known, 's1').needed), [], 'a draft that names no context sends none');
  assert.equal(S.PREVIEW_CONTEXT_FUNCTION, undefined, 'fix round 1: no context-carrying call exists');
});

test('preview: values become the same one line as a Run\'s collapsed result', async () => {
  const { preview, realm, run } = previewPage(`function formatPrice(cents, currency = 'EUR') { return cents; }
    globalThis.Point = class Point { constructor() { this.x = 1; } get len() { hits++; return 1; } };
    globalThis.hits = 0;`);
  // The context a preview reads is the one the last Run revived (fix round 1).
  await run('void res');
  const cases = [
    ['1+1', '2'],
    ['res.users.length * 2', '6'],
    ['res.users.map(u => u.id)', 'Array(3) [1, 2, 3]'],
    ['res.users', 'Array(3) [{…}, {…}, {…}]'],
    ['res', '{users: Array(3)}'],
    ['res.users[0]', '{id: 1}'],
    ['({ a: 1, b: "x", c: [1], d: { e: 1 }, "f g": null })', "{a: 1, b: 'x', c: Array(1), d: {…}, 'f g': null}"],
    ['Array.from({ length: 500 }, (_, i) => i)', 'Array(500) [0, 1, 2, 3, 4, …]'],
    ['new Map([[1, "a"]])', "Map(1) {1 => 'a'}"],
    ['new Set([1, "b"])', "Set(2) {1, 'b'}"],
    ['new Uint8Array([1, 2])', 'Uint8Array(2) [1, 2]'],
    ['formatPrice', "ƒ formatPrice(cents, currency = 'EUR')"],
    ['(a, b) => a', '(a, b) => {…}'],
    ['async (a) => a', 'async (a) => {…}'],
    ['(class A {})', 'class A'],
    ['Math.max', 'ƒ max() [native code]'],
    ['new Error("x")', 'Error: x'],
    ['new TypeError("bad")', 'TypeError: bad'],
    ['/ab+c/gi', '/…/gi'],
    ['undefined', 'undefined'],
    ['null', 'null'],
    ['NaN', 'NaN'],
    ['-0', '-0'],
    ['10n', '10n'],
    ['Symbol("s")', 'Symbol(s)'],
    ['true', 'true'],
    ['"str"', "'str'"],
    ['new Point()', 'Point {x: 1, len: (…)}'],
    ['[new Point(), new Map(), formatPrice]', 'Array(3) [Point, Map(0), ƒ formatPrice]'],
    ['typeof this', "'undefined'"],
    ['Object.create(null)', '{}'],
  ];
  for (const [code, want] of cases) {
    const out = preview(code);
    assert.equal(out?.line?.text, want, `${code} → ${out?.text}`);
  }
  assert.equal(preview('new Point().x').line.text, '1');
  assert.equal(vm.runInContext('hits', realm), 0, 'a class getter is listed, never read');
  const date = preview('new Date(0)');
  assert.match(date.line.text, /1970|Jan|Dec/, date.text);
  assert.ok(preview('"y".repeat(5000)').text.length < 400, 'a long string is cut in the page');
});

// Final review M-3: the projector and the Run's encoder agree on these (one line, one formatter).
test('preview: ArrayBuffer, long strings and accessor literals read the same as the Run', async () => {
  const { previewLine } = await import('../../src/panel/models/consolePreview.ts');
  const { preview, run } = previewPage();
  for (const code of ['new ArrayBuffer(8)', "'x'.repeat(300)", "({ a: 'x'.repeat(300) })", "['y'.repeat(150), 1]", "'z'.repeat(119)", "'z'.repeat(118)",
    '[new ArrayBuffer(2)]']) {
    const ran = await run(code);
    const want = previewLine(ran.value);
    assert.equal(preview(code)?.line?.text, want, `${code} → ${preview(code)?.text}`);
  }
  // An accessor literal is never sent (V8 refuses defining one under its side-effect check); a value
  // that already has accessors lists them after its data members, as the Run does.
  assert.equal(preview('({get g() { return 1 }})'), null);
  await run('const acc = { set s(v) {}, a: 1, get g() { return 1 } }');
  assert.equal(preview('acc').line.text, previewLine((await run('acc')).value));
  assert.equal(preview('acc').line.text, '{a: 1, s: (…), g: (…)}');
});

test('preview: a throw is caught in the page and reported from its own data properties', () => {
  const { preview, run } = previewPage();
  assert.deepEqual(preview('null.x').line, { error: "Uncaught TypeError: Cannot read properties of null (reading 'x')" });
  assert.deepEqual(preview('(() => { throw 5 })()').line, { error: 'Uncaught 5' });
  assert.deepEqual(preview('(() => { throw new RangeError("r") })()').line, { error: 'Uncaught RangeError: r' });
  assert.deepEqual(preview('nope').line, { error: 'Uncaught ReferenceError: nope is not defined' });
  return run('const e = new Error("SECRET")').then(() => {
    assert.deepEqual(preview('(() => { throw e })()').line, { error: 'Uncaught Error: SECRET' });
  });
});

test('preview: no page code runs — no getter, no stack, no prepareStackTrace, no then, no Proxy get/has', async () => {
  const { preview, run, realm } = previewPage(`globalThis.stolen = [];
    Error.prepareStackTrace = (e, sites) => { stolen.push('pst ' + e.message); return 'S'; };
    for (const name of ['evil', 'then', 'toJSON', 'constructor2', Symbol.toStringTag]) Object.defineProperty(Object.prototype, name, { configurable: true, get() { stolen.push('Object.prototype getter ' + String(name)); return 'GETTER'; } });
    const t = Promise.prototype.then; Promise.prototype.then = function (...a) { stolen.push('then'); return t.apply(this, a); };
    globalThis.prox = new Proxy({ a: 1 }, { get(t, k) { stolen.push('get ' + String(k)); return 'GET-TRAP'; }, has(t, k) { stolen.push('has'); return k in t; }, apply() { stolen.push('apply'); } });
    globalThis.named = Object.defineProperty(new Error('m'), 'name', { get() { stolen.push('name getter'); return 'N'; } });
    globalThis.p = Promise.resolve(1);
    globalThis.Acc = class Acc { get secret() { stolen.push('class getter'); return 1; } };`);
  await run('const err = new Error("SECRET-ERR"); const box = { last: new Error("SECRET-BOX"), n: 1 }');
  vm.runInContext('stolen.length = 0', realm);
  const lines = {};
  for (const code of ['err', 'box', 'box.last', '({ a: 1 })', '[err]', 'prox', 'named', 'p', 'new Acc()', 'new Map([[err, box]])', 'err.message']) lines[code] = preview(code)?.line;
  assert.equal(vm.runInContext('stolen.join("|")', realm), '', 'page code saw nothing');
  assert.deepEqual(lines.err, { text: 'Error: SECRET-ERR' });
  assert.deepEqual(lines.box, { text: '{last: Error: SECRET-BOX, n: 1}' });
  assert.deepEqual(lines['({ a: 1 })'], { text: '{a: 1}' });
  assert.deepEqual(lines.prox, { text: '{a: 1}' }, 'a Proxy: no get trap runs (own descriptors only)');
  assert.deepEqual(lines.named, { text: 'Error: m' }, 'an accessor name is never read');
  assert.deepEqual(lines.p, { text: 'Promise {…}' }, 'a promise: its state is never asked of then');
  assert.deepEqual(lines['new Acc()'], { text: 'Acc {secret: (…)}' });
  assert.deepEqual(lines['err.message'], { text: "'SECRET-ERR'" });
});

test('preview: natives patched after the scope exists change nothing; patched before it, the preview is off', () => {
  const { preview, realm } = previewPage();
  vm.runInContext(`const g = Object.getOwnPropertyDescriptor; Object.getOwnPropertyDescriptor = function (o, k) { const d = g(o, k); return d && 'value' in d ? { ...d, value: 'FORGED' } : d; };
    Object.getPrototypeOf = () => null; Object.getOwnPropertyNames = () => ['forged']; Array.isArray = () => false; Function.prototype.toString = () => 'FORGED';`, realm);
  assert.deepEqual(preview('({ a: 1 })').line, { text: '{a: 1}' });
  assert.deepEqual(preview('[1, 2]').line, { text: 'Array(2) [1, 2]' });
  assert.deepEqual(preview('(a) => a').line, { text: '(a) => {…}' });
  const atLoad = previewPage('const g = Object.getOwnPropertyDescriptor; Object.getOwnPropertyDescriptor = function (o, k) { return g(o, k); };');
  const off = atLoad.preview('({ a: 1 })');
  assert.equal(off.text, 'X');
  assert.equal(off.decoded, null);
});

test('preview: a draft that begins after its deadline does nothing (S); bounded on huge values', async () => {
  const { preview, realm } = previewPage('globalThis.ran = 0; globalThis.big = {}; for (let i = 0; i < 100000; i++) big["k" + i] = i; globalThis.arr = new Array(1e6).fill(0);');
  assert.equal(preview('ran = 1'), null, 'not eligible');
  assert.equal(preview('(() => { globalThis.ran = 2; return 1 })()', { deadline: Date.now() - 1000 }).text, 'S');
  assert.equal(vm.runInContext('ran', realm), 0, 'the draft never ran');
  assert.equal(preview('res.users', { deadline: Date.now() - 1000 }).text, 'S');
  assert.equal(S.decodePreview('S'), null);
  // Key names are cut like any string (review Minor 2): a page key of a million characters.
  vm.runInContext('globalThis.longKey = { ["k".repeat(1e6)]: 1 }; globalThis.LongCls = class { get ["g".repeat(1e6)]() { return 1; } };', realm);
  assert.ok(preview('longKey').text.length < 400, 'a long own key is cut');
  assert.ok(preview('new LongCls()').text.length < 400, 'a long class getter name is cut');
  for (const [code, want] of [['big', '{k0: 0, k1: 1, k2: 2, k3: 3, k4: 4, …}'], ['arr', 'Array(1000000) [0, 0, 0, 0, 0, …]']]) {
    let ms = Infinity;
    let out;
    for (let i = 0; i < 3; i++) {
      const started = performance.now();
      out = preview(code);
      ms = Math.min(ms, performance.now() - started);
    }
    assert.equal(out.line.text, want);
    assert.ok(ms < 100, `${code}: ${ms.toFixed(1)} ms`);
  }
});

// Final review M-7: one helper-name list (shared/console-helpers.js RUNTIME_NAMES) for the worker
// (background.js, console-scope.js contextNames) and the content script (panel/console.js).
test('one helper-name list: RUNTIME_NAMES is createRuntime\'s keys, covers the scope\'s member map, and every reader uses it', () => {
  const H = loadIsolatedWorld('shared/console-helpers.js').window.XRAY_ConsoleHelpers;
  const names = hostify(H.RUNTIME_NAMES);
  assert.deepEqual([...names].sort(), Object.keys(H.createRuntime({})).sort());
  const members = hostify(S.CONTEXT_MEMBERS);
  for (const name of [...Object.keys(members.valueOf), ...members.current, ...members.entries]) assert.ok(names.includes(name), name);
  // In the worker realm console-scope.js reads the list itself when no names are passed.
  const worker = { window: undefined };
  vm.createContext(worker);
  vm.runInContext(readSource('shared/console-helpers.js'), worker);
  vm.runInContext(readSource('shared/console-scope.js'), worker);
  const known = hostify(vm.runInContext('XRAY_ConsoleScope.contextNames({ scope: { mine: 1 }, pins: { a: {} } })', worker));
  assert.deepEqual(known.sort(), [...names, 'mine', 'a'].sort());
  // No second copy: the readers name the shared list, and no hand list is left behind.
  const background = readSource('background.js');
  const engine = readSource('panel/console.js');
  assert.match(background, /importScripts\('shared\/console-helpers\.js', 'shared\/console-scope\.js'\)/);
  assert.match(background, /XRAY_ConsoleHelpers\?\.RUNTIME_NAMES/);
  assert.match(engine, /window\.XRAY_ConsoleHelpers\?\.RUNTIME_NAMES/);
  for (const source of [background, engine]) assert.doesNotMatch(source, /'toCSV', 'toTable'/, 'no hand-mirrored list');
  // One body marker; the test-only builder and the unused runtime preview are gone from shipped code.
  assert.doesNotMatch(background, /CONSOLE_BODY_MARKER|__xray:command|_buildConsoleExpression/);
  assert.match(background, /_consoleScopeApi\(\)\.BODY_MARKER/);
  assert.doesNotMatch(engine, /getRuntimePreview/);
  assert.equal(S.buildRunFunction, undefined, 'planRun is the one run builder');
});
