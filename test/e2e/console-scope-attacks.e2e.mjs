/* global chrome, _evaluateConsoleInTab, _completeConsoleInTab, _previewConsoleInTab, _pendingWalks */
// Task 6 fix round 2 (review N1/N2/N4, threat model C-1): a hostile page against the console
// scope, through the REAL extension — the unpacked build, its service worker and chrome.debugger —
// in real Chromium. Each vector is installed by the page at load (before XRAY creates anything),
// or, for `keysLater`, after the scope exists. The context carries secrets in the selected entry,
// the entry list, a typed value and a saved variable; one command declares a secret of its own.
// For every vector: no page code sees the scope, its API, the context or a declared value, and
// no result is forged — numbers, strings, objects, arrays and thrown values show exactly what the
// command produced. Vectors are the reviewers' (scratchpad p/attack.cjs, r2/probe.mjs).

import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const COMMON = String.raw`
window.stolen = [];
window.look = (how, value) => {
  if (value == null || value === window) return;
  let text = '';
  try { text = typeof value === 'function' ? Function.prototype.toString.call(value) : (typeof value === 'string' ? value : JSON.stringify(value, (k, x) => (typeof x === 'bigint' ? String(x) : x))) || ''; } catch (e) { text = '<unser>'; }
  try {
    if (typeof value === 'object' && (('take' in value && 'begin' in value) || ('refresh' in value && 'define' in value) || '__xrayBox' in value || ('declared' in value && 'type' in value) || ('open' in value && typeof value.open === 'function' && !('send' in value)))) text += ' [INTERNAL]';
  } catch {}
  if (/SECRET|\[INTERNAL\]|__xray/.test(text)) window.stolen.push(how + ': ' + text.slice(0, 160));
};
window.pageFn = function pageFn(x) { void new Error('p').stack; return x + 1; };
`;
const VECTORS = {
  prepareStackTrace: String.raw`Error.prepareStackTrace = (error, sites) => { for (const site of sites) { let self, fn; try { self = site.getThis(); } catch {} try { fn = site.getFunction(); } catch {}
    look('this', self); look('function', fn); if (typeof fn === 'function') { try { look('arguments', [...fn.arguments]); } catch {} try { look('caller', fn.caller); } catch {} } } return String(error && error.message); };`,
  freezeAtLoad: String.raw`const f = Object.freeze; Object.freeze = function (o) { look('freeze', o); try { if (o && typeof o.refresh === 'function') { const r = o.refresh; o.refresh = function (...a) { look('refresh', a); return r(...a); }; } } catch {} return f(o); };`,
  createAtLoad: String.raw`const c = Object.create; const made = []; Object.create = function (p, d) { const o = c(p, d); made.push(o); return o; }; window.inspectMade = () => { for (const o of made) { try { look('created', o); for (const k in o) look('created.' + k, o[k]); } catch {} } };`,
  applyAtLoad: String.raw`const a = Reflect.apply; Reflect.apply = function (fn, self, args) { look('apply-this', self); try { look('apply-args', [...args]); } catch {} return a(fn, self, args); };`,
  thenGetter: String.raw`Object.defineProperty(Object.prototype, 'then', { configurable: true, get() { try { look('then-this', this); if (this && this.type === 'number' && this.result === '2') this.result = '1337'; } catch {} return undefined; } });`,
  promiseThen: String.raw`const t = Promise.prototype.then; Promise.prototype.then = function (ok, bad) { return t.call(this, (v) => { look('pthen', v); try { if (v && v.type === 'number' && v.result === '2') v.result = '4242'; } catch {} return ok ? ok(v) : v; }, bad); };`,
  promiseCtor: String.raw`const t2 = Promise.prototype.then; Object.defineProperty(Promise.prototype, 'constructor', { configurable: true, get() { try { t2.call(this, (v) => { look('pctor', v); try { if (v && v.value === 2) v.value = 31337; if (v && v.type === 'number' && v.result === '2') v.result = '31337'; } catch {} }); } catch {} return Promise; } });`,
  jsonStringify: String.raw`const s = JSON.stringify; JSON.stringify = function (v, r, i) { look('JSON.stringify', v); return s(v, r, i); };`,
  keysLater: String.raw`window.patchLater = () => { const k = Object.keys; Object.keys = function (o) { look('keysLater', o); const out = k(o); if (o && typeof o === 'object' && !Array.isArray(o) && out.length) out.push('evil'); return out; }; const ia = Array.isArray; Array.isArray = function (o) { look('isArrayLater', o); return false; }; };`,
  // Fix round 3 (review I1, I2, m-I3): forging any result, not only XRAY's record shapes.
  thenResolver: String.raw`Object.defineProperty(Object.prototype, 'then', { configurable: true, get() { look('then-this', this); return (resolve) => resolve('FORGED-THEN'); } });`,
  promiseThenForge: String.raw`const t3 = Promise.prototype.then; Promise.prototype.then = function (ok, bad) { return t3.call(this, (v) => { look('pthen', v); const forged = v && typeof v === 'object' ? 'FORGED-PTHEN' : v; return ok ? ok(forged) : forged; }, bad); };`,
  gopdLater: String.raw`window.patchLater = () => { const g = Object.getOwnPropertyDescriptor; Object.getOwnPropertyDescriptor = function (o, k) { const d = g(o, k); look('gopdLater', o); if (d && 'value' in d && typeof k === 'string') return { ...d, value: 'FORGED-GOPD' }; return d; }; const gp = Object.getPrototypeOf; Object.getPrototypeOf = function (o) { look('gpoLater', o); return gp(o); }; };`,
  sliceLater: String.raw`window.patchLater = () => { const sl = String.prototype.slice; String.prototype.slice = function (...a) { look('sliceLater', String(this)); return 'FORGED-SLICE'; }; Math.min = () => 3; };`,
  protoAccessors: String.raw`Object.defineProperty(Object.prototype, 'render', { configurable: true, get() { return 'table'; } }); Object.defineProperty(Object.prototype, 'message', { configurable: true, get() { return 'FORGED-MSG'; } }); Object.defineProperty(Object.prototype, '$xray', { configurable: true, get() { return 'accessor'; } });`,
};

const SECRET_ENTRY = { id: 's1', type: 'api', method: 'GET', url: 'https://other.example/api?SECRET-URL', urlPath: '/api', status: 200, responseRaw: '{"jwt":"SECRET-BODY"}', responseHeaders: { authorization: 'Bearer SECRET-HEADER' } };
const CONTEXT = JSON.stringify({
  currentEntry: SECRET_ENTRY,
  entries: [SECRET_ENTRY, { id: 's2', type: 'api', url: 'https://third.example/b?SECRET-URL2' }],
  values: { res: { jwt: 'SECRET-CTX', n: 1 } },
  scope: { temp1: { k: 'SECRET-TEMP' } },
  pins: {},
});

// [command, check(answer)] — every one runs against the hostile page; none may be forged.
const COMMANDS = [
  ['const sec = "SECRET-LOCAL"', (out) => assert.equal(out.type, 'undefined', JSON.stringify(out))],
  ['1+1', (out) => assert.equal(out.result, '2', JSON.stringify(out))],
  ['sec.length', (out) => assert.equal(out.result, '12', JSON.stringify(out))],
  ['nope', (out) => assert.match(out.error?.message || '', /nope/, JSON.stringify(out))],
  ['const kk = 1; kk = 2', (out) => assert.equal(out.error?.message, 'Assignment to constant variable.', JSON.stringify(out))],
  ['pageFn(1)', (out) => assert.equal(out.result, '2', JSON.stringify(out))],
  ['Promise.resolve(2)', (out) => { assert.equal(out.result, '2', JSON.stringify(out)); assert.equal(out.meta?.promise?.state, 'fulfilled'); }],
  ['[1, 2].map((x) => x * 2).length', (out) => assert.equal(out.result, '2', JSON.stringify(out))],
  ['res.jwt', (out) => assert.equal(out.result, '"SECRET-CTX"', JSON.stringify(out))],
  ['sec', (out) => assert.equal(out.result, '"SECRET-LOCAL"', JSON.stringify(out))],
  // Object, array and string results and a thrown primitive (fix round 3): shown unaltered.
  ['({ a: 1 })', (out) => { assert.equal(out.result, '{"a":1}', JSON.stringify(out)); assert.equal(out.meta, undefined); assert.equal(out.render, undefined); }],
  ['res', (out) => assert.equal(out.result, '{"jwt":"SECRET-CTX","n":1}', JSON.stringify(out))],
  ['[1, 2]', (out) => assert.equal(out.result, '[1,2]', JSON.stringify(out))],
  ["'str'", (out) => assert.equal(out.result, '"str"', JSON.stringify(out))],
  ['throw 5', (out) => { assert.equal(out.error?.message, '5', JSON.stringify(out)); assert.equal(out.error?.value, '5'); }],
];

test('a hostile page reaches no scope, context, declared value or result (one page per vector)', { timeout: 240_000 }, async (t) => {
  const server = http.createServer((req, res) => {
    const name = decodeURIComponent((req.url || '').split('/v/')[1] || '');
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end(`<!doctype html><title>${name}</title><script>${COMMON}\n${VECTORS[name] || ''}</script><h1>${name}</h1>`);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xray-e2e-attacks-'));
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: true, channel: 'chromium',
    args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`, '--no-sandbox'],
  });
  t.after(async () => {
    await context.close();
    server.close();
    fs.rmSync(userDataDir, { recursive: true, force: true });
  });
  const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker', { timeout: 30_000 }));
  const failures = [];
  for (const name of Object.keys(VECTORS)) {
    const page = await context.newPage();
    const url = `http://127.0.0.1:${server.address().port}/v/${name}`;
    await page.goto(url);
    const tabId = await worker.evaluate(async (target) => (await chrome.tabs.query({})).find((tab) => tab.url === target)?.id, url);
    const run = (code) => worker.evaluate(([id, source, text]) => _evaluateConsoleInTab(id, source, text), [tabId, code, CONTEXT]);
    for (const [code, check] of COMMANDS) {
      // After the scope exists (the first command made it): a page that patches built-ins later.
      if (code === '1+1') await page.evaluate(() => window.patchLater?.());
      const out = await run(code);
      try { check(out); } catch (err) { failures.push(`${name}: ${code} → ${err.message.split('\n')[0]}`); }
    }
    await page.evaluate(() => window.inspectMade?.());
    await new Promise((resolve) => setTimeout(resolve, 100));
    // As a string: Playwright resolves an evaluate result through a promise, which the `then`
    // vectors would forge for an array.
    const stolen = JSON.parse(await page.evaluate(() => JSON.stringify(window.stolen)));
    if (stolen.length) failures.push(`${name}: page saw ${stolen.length}: ${[...new Set(stolen)].slice(0, 4).join(' | ')}`);
    await page.close();
  }
  assert.deepEqual(failures, []);
});

// Task 7 (spec §3 source 4): live completion on a hostile page. Since fix round 1 the path is walked
// and its names listed IN THE PAGE by XRAY's scope with descriptor reads only (natives taken when the
// scope was created), following data properties only — an accessor ends the walk — and answered as
// one string by value: no getter runs, CDP describes no page value, nothing is terminated. Page code
// that ran would record itself in `stolen`. The documented residual (vector `proxyObserved`): a
// Proxy reached on the walk runs its own traps under V8's side-effect check; a trap's refused side
// effect reaches the page's prepareStackTrace as a bare EvalError.
const LIVE_COMMON = String.raw`
window.stolen = [];
window.appState = { user: { id: 1, name: 'Ada' }, count: 2 };
window.spin = { get loop() { for (;;) {} } };
window.boomy = { get x() { throw new Error('boom'); } };
window.noisy = { get x() { localStorage.setItem('n', '1'); return 1; } };
localStorage.clear();
`;
const NATIVES = ['Object.getOwnPropertyNames', 'Object.keys', 'Object.getOwnPropertyDescriptor', 'Object.getOwnPropertyDescriptors', 'Object.getPrototypeOf', 'Reflect.ownKeys', 'Reflect.get', 'Function.prototype.toString', 'JSON.stringify', 'Array.prototype.indexOf'];
const wrapNatives = (label) => `for (const path of ${JSON.stringify(NATIVES)}) { const [a, b, c] = path.split('.'); const owner = c ? window[a][b] : window[a]; const key = c || b; const fn = owner[key]; owner[key] = function (...args) { stolen.push('${label} ' + path); return fn.apply(this, args); }; }`;
const LIVE_VECTORS = {
  windowGetter: String.raw`Object.defineProperty(window, 'trap', { configurable: true, get() { localStorage.setItem('x', '1'); stolen.push('trap getter'); return 1; } });`,
  proxyGlobal: String.raw`window.appState = new Proxy({ a: 1 }, { get(t, k) { stolen.push('get:' + String(k)); return t[k]; }, has(t, k) { stolen.push('has'); return k in t; }, ownKeys(t) { stolen.push('ownKeys'); return Reflect.ownKeys(t); }, getOwnPropertyDescriptor(t, k) { stolen.push('gopd'); return Reflect.getOwnPropertyDescriptor(t, k); }, getPrototypeOf() { stolen.push('getPrototypeOf'); return Object.prototype; } });`,
  protoGetters: String.raw`for (const name of ['evil', 'then', 'toJSON', Symbol.toStringTag]) Object.defineProperty(Object.prototype, name, { configurable: true, get() { stolen.push('Object.prototype getter ' + String(name)); return undefined; } }); Object.defineProperty(Function.prototype, 'fnEvil', { configurable: true, get() { stolen.push('Function.prototype getter'); return 1; } });`,
  nativesAtLoad: wrapNatives('at load'),
  nativesLater: `window.patchLater = () => { ${wrapNatives('later')} };`,
  throwingGetter: String.raw`Error.prepareStackTrace = (e, sites) => { stolen.push('prepareStackTrace: ' + e.message + ' / ' + sites.length + ' sites'); return String(e); };`,
  // An Error value is never described by CDP (fix round 1): the page's prepareStackTrace never runs.
  proxyObserved: String.raw`Error.prepareStackTrace = (e, sites) => { stolen.push('prepareStackTrace: ' + e.message + ' / ' + sites.length + ' sites'); return String(e); }; window.appState = new Proxy({ a: 1 }, { ownKeys(t) { stolen.push('ownKeys'); return Reflect.ownKeys(t); }, getOwnPropertyDescriptor(t, k) { stolen.push('gopd'); return Reflect.getOwnPropertyDescriptor(t, k); }, getPrototypeOf() { stolen.push('getPrototypeOf'); return Object.prototype; } });`,
  errorValues: String.raw`Error.prepareStackTrace = (e, sites) => { stolen.push('error formatted: ' + e.message + ' @ ' + sites.map((s) => s.getFileName() || '<none>').join(',')); return String(e); }; window.errGlobal = new Error('e1'); appState.lastError = new Error('e2');`,
  refusedSideEffect: String.raw`Error.prepareStackTrace = (e, sites) => { window.refused = (window.refused || []).concat([e.message + ' / ' + sites.length + ' sites']); return String(e); };`,
};

test('live completion on a hostile page: no getter, trap or patched native runs to list names; a throw on the path stays XRAY\'s', { timeout: 240_000 }, async (t) => {
  const server = http.createServer((req, res) => {
    const name = decodeURIComponent((req.url || '').split('/v/')[1] || '');
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end(`<!doctype html><title>${name}</title><script>${LIVE_COMMON}\n${LIVE_VECTORS[name] || ''}</script><h1>${name}</h1>`);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xray-e2e-live-attacks-'));
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: true, channel: 'chromium',
    args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`, '--no-sandbox'],
  });
  t.after(async () => {
    await context.close();
    server.close();
    fs.rmSync(userDataDir, { recursive: true, force: true });
  });
  const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker', { timeout: 30_000 }));
  const failures = [];
  for (const name of Object.keys(LIVE_VECTORS)) {
    const page = await context.newPage();
    const url = `http://127.0.0.1:${server.address().port}/v/${name}`;
    await page.goto(url);
    const tabId = await worker.evaluate(async (target) => (await chrome.tabs.query({})).find((tab) => tab.url === target)?.id, url);
    const complete = (expr) => worker.evaluate(([id, e]) => _completeConsoleInTab(id, e, { attach: true }), [tabId, expr]);
    const run = (code) => worker.evaluate(([id, source, text]) => _evaluateConsoleInTab(id, source, text), [tabId, code, CONTEXT]);
    const check = (label, ok) => { if (!ok) failures.push(`${name}: ${label}`); };
    try {
      await run('const sec = "SECRET-LOCAL"');
      if (name === 'nativesLater') await page.evaluate(() => window.patchLater());
      // A Run itself goes through page built-ins (Task 6's accepted limits): only what the
      // completions below cause is counted.
      await page.evaluate(() => { window.stolen.length = 0; });
      const globals = await complete(null);
      const byName = Object.fromEntries((globals.names || []).map((n) => [n.name, n]));
      const proxy = name === 'proxyGlobal' || name === 'proxyObserved';
      // Natives replaced before the scope existed: the walk is off (it never hands them a value).
      if (name === 'nativesAtLoad') check(`the walk is off: ${JSON.stringify(globals).slice(0, 80)}`, globals.names === null);
      else {
        check('globals list the page names', !!byName.appState && !!byName.spin);
        check('declared names come back', (globals.declared || []).some((d) => d.name === 'sec'));
      }
      if (name === 'windowGetter') check('trap is a getter, listed', byName.trap?.kind === 'getter');
      const app = await complete('appState');
      if (proxy) check('a Proxy answers nothing', app.names === null || (Array.isArray(app.names) && app.names.length === 0));
      else if (name !== 'nativesAtLoad') check('appState members', (app.names || []).some((n) => n.name === 'user'));
      for (const expr of ['window', 'document', 'boomy', 'noisy', 'appState.user', 'sec', 'appState']) await complete(expr);
      // Nothing: [] (the walk stopped at the accessor), or null (no answer: the walk is off on this
      // page, or the worker backs off after a Proxy refused it).
      const nothing = (answer) => answer.names === null || (Array.isArray(answer.names) && answer.names.length === 0);
      check('a throwing getter on the path answers nothing', nothing(await complete('boomy.x')));
      const refused = await complete('noisy.x');
      check('a refused side effect answers nothing', nothing(refused));
      const started = Date.now();
      const loop = await complete('spin.loop');
      const loopMs = Date.now() - started;
      check(`an endless getter is never run (${loopMs} ms)`, nothing(loop) && loopMs < 1000);
      // Read with plain string joins: the page's JSON.stringify (and an Object.prototype toJSON
      // getter) are the vectors, so the test's own read must not call them.
      const [stolenText, x, n, refusedText] = (await page.evaluate(() => [window.stolen.join('\u0001'), String(localStorage.getItem('x')), String(localStorage.getItem('n')), (window.refused || []).join('\u0001')].join('\u0002'))).split('\u0002');
      const seen = { stolen: stolenText ? stolenText.split('\u0001') : [], x: x === 'null' ? null : x, n: n === 'null' ? null : n, refused: refusedText ? refusedText.split('\u0001') : [] };
      // Fix round 1: no page getter runs and no value is described by CDP, so the page sees nothing —
      // except the documented residual of a Proxy on the walk: its traps run under V8's side-effect
      // check, and a trap's refused side effect reaches the page's prepareStackTrace as a bare
      // EvalError (no call sites, nothing of XRAY's or the user's).
      const PROXY_RESIDUAL = 'prepareStackTrace: Possible side-effect in debug-evaluate / 0 sites';
      const observed = seen.stolen.filter((entry) => !(name === 'proxyObserved' && entry === PROXY_RESIDUAL));
      if (observed.length) failures.push(`${name}: page saw ${[...new Set(observed)].slice(0, 5).join(' | ')}`);
      if (name === 'throwingGetter') check('the throwing getter (boomy.x) never reached prepareStackTrace', !seen.stolen.some((entry) => /boom/.test(entry)));
      const after = await run('1+1');
      check(`the next command runs after a termination: ${JSON.stringify(after).slice(0, 80)}`, after.result === '2');
      check('no side effect happened', seen.x === null && seen.n === null);
      // A getter that would have tried a side effect is never read: no EvalError reaches the page.
      check(`no refused evaluation reached the page: ${JSON.stringify(seen.refused)}`, seen.refused.length === 0);
    } catch (err) {
      failures.push(`${name}: ${err.message.split('\n')[0]}`);
    }
    await page.close();
  }
  assert.deepEqual(failures, []);
});

// Task 7 review, fix round 1 (Critical 1 and 2, Important 2): the typing path never creates a
// remote object of a page or declared value — CDP describes an Error value by formatting its stack
// through the page's Error.prepareStackTrace, with full rights, so a declared value reached page code
// (`rows.items.` with an Object.prototype getter returning an Error built from `this`; a declared
// Error; an Error-valued global). It never terminates the page's own task, and a page with huge
// globals costs a bounded answer. Vectors are the reviewer's probes 1–4.
const TYPING_COMMON = String.raw`
window.stolen = [];
window.appState = { user: { id: 1 } };
Error.prepareStackTrace = (e, sites) => { try { stolen.push('prepareStackTrace: ' + e.message); } catch {} return 'S'; };
`;
const TYPING_VECTORS = {
  errorGetterOnDeclared: String.raw`Object.defineProperty(Object.prototype, 'items', { configurable: true, get() { return new Error('LEAK ' + JSON.stringify(this)); } });
Object.defineProperty(Object.prototype, 'info', { configurable: true, get() { const o = {}; o.e = new Error('LEAK2 ' + JSON.stringify(this)); return o; } });`,
  declaredErrors: '',
  errorGlobals: String.raw`window.errGlobal = new Error('e-global'); appState.lastError = new Error('e-app');`,
  busyPage: String.raw`window.log = []; window.startLong = () => setTimeout(() => { log.push('start'); const t = performance.now(); while (performance.now() - t < 1200) {} log.push('end'); }, 0);`,
  hugeGlobals: String.raw`for (let i = 0; i < 300000; i++) window['g' + i] = i; window.bigFn = new Function('a', 'return 1;' + '/*' + 'x'.repeat(30000000) + '*/');`,
  // Fix round 2 (re-review Important 1, 3): indexed objects never enumerate their indices; an
  // abandoned walk never makes the next Run report a timeout and then run.
  indexed: String.raw`window.HEAPU8 = new Uint8Array(16 * 1024 * 1024); window.bigArr = new Array(5e6).fill(0); window.rows5k = Array.from({ length: 5000 }, (_, i) => ({ id: i })); window.ticks = 0; setInterval(() => { ticks++; }, 10);`,
  hangThenRun: String.raw`window.pspin = new Proxy({}, { ownKeys() { for (;;) {} } });`,
  // Round 4: a page merely busy with its own task while the user types — the Run never cuts it.
  busyThenRun: String.raw`window.log = [];`,
  // Round 4: a page clock replaced at load (MockDate, fake timers): the guard is off, XRAY never calls it.
  futureClock: String.raw`window.clockCalls = 0; Date.now = () => { clockCalls++; return 4102444800000; };`,
  frozenClock: String.raw`window.clockCalls = 0; Date.now = () => { clockCalls++; return 0; };`,
};

test('the typing path creates no remote object of a page or declared value, never terminates the page, stays bounded', { timeout: 240_000 }, async (t) => {
  const server = http.createServer((req, res) => {
    const name = decodeURIComponent((req.url || '').split('/v/')[1] || '');
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end(`<!doctype html><title>${name}</title><script>${TYPING_COMMON}\n${TYPING_VECTORS[name] ?? ''}</script><h1>${name}</h1>`);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xray-e2e-typing-'));
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: true, channel: 'chromium',
    args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`, '--no-sandbox'],
  });
  t.after(async () => {
    await context.close();
    server.close();
    fs.rmSync(userDataDir, { recursive: true, force: true });
  });
  const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker', { timeout: 30_000 }));
  const failures = [];
  for (const name of Object.keys(TYPING_VECTORS)) {
    const page = await context.newPage();
    const url = `http://127.0.0.1:${server.address().port}/v/${name}`;
    await page.goto(url);
    const tabId = await worker.evaluate(async (target) => (await chrome.tabs.query({})).find((tab) => tab.url === target)?.id, url);
    const complete = (expr) => worker.evaluate(([id, e]) => _completeConsoleInTab(id, e, { attach: true }), [tabId, expr]);
    const run = (code) => worker.evaluate(([id, source, text]) => _evaluateConsoleInTab(id, source, text), [tabId, code, CONTEXT]);
    const check = (label, ok) => { if (!ok) failures.push(`${name}: ${label}`); };
    const stolen = async () => (await page.evaluate(() => window.stolen.join('\u0001'))).split('\u0001').filter(Boolean);
    try {
      await run('const rows = { token: "SECRET-ROWS" }');
      await run('const err = new Error("SECRET-ERR"); const box = { last: new Error("SECRET-BOX") }');
      await page.evaluate(() => { window.stolen.length = 0; });
      if (name === 'busyPage') {
        // The page's own long task, running when the completion request lands.
        const busy = page.evaluate(() => { window.log.push('start'); const t0 = performance.now(); while (performance.now() - t0 < 1200) { /* busy */ } window.log.push('end'); }).catch(() => {});
        await new Promise((resolve) => setTimeout(resolve, 100));
        const before = Date.now();
        const answer = await complete('appState');
        const answeredMs = Date.now() - before;
        await busy;
        await new Promise((resolve) => setTimeout(resolve, 300));
        const log = await page.evaluate(() => window.log.join(','));
        check(`the page's own task ran to its end: ${log} (answered in ${answeredMs} ms: ${JSON.stringify(answer).slice(0, 60)})`, log === 'start,end');
        check(`a busy page answers within the deadline, not after it (${answeredMs} ms)`, answeredMs < 1000);
      } else if (name === 'indexed') {
        for (const [expr, want] of [['HEAPU8', 'subarray'], ['bigArr', 'filter'], ['rows5k', 'map']]) {
          const started = Date.now();
          const out = await complete(expr);
          const ms = Date.now() - started;
          const listed = (out.names || []).map((n) => n.name);
          check(`${expr}: answered in ${ms} ms with length and ${want}: ${listed.slice(0, 6).join(',')}`, ms < 600 && listed.includes('length') && listed.includes(want) && !listed.some((n) => /^\d/.test(n)));
        }
      } else if (name === 'hangThenRun') {
        const hung = await complete('pspin');
        check(`the hanging trap walk is abandoned: ${JSON.stringify(hung)}`, hung.names === null);
        // Round 4: nothing terminates the pending walk; the Run queues behind the trap, reaches its own
        // cap, and — started only after its deadline — runs nothing and says so.
        const ran = await run('window.ran = 1');
        await new Promise((resolve) => setTimeout(resolve, 500));
        const flag = await page.evaluate(() => window.ran);
        check(`the Run says it was not run, truthfully: ${JSON.stringify(ran).slice(0, 140)} (ran=${flag})`, ran.error?.kind === 'skipped' && /^Not run: the page was busy for more than 10 s$/.test(ran.error.message) && flag === undefined);
      } else if (name === 'busyThenRun') {
        // The page's own task (a timer), as the reviewer's probe: it starts before the user types.
        await page.evaluate(() => setTimeout(() => { window.log.push('started'); const t0 = performance.now(); while (performance.now() - t0 < 3000) { /* busy */ } window.log.push('finished'); }, 0));
        await new Promise((resolve) => setTimeout(resolve, 100));
        const busy = new Promise((resolve) => setTimeout(resolve, 3500));
        const walk = await complete('foo');
        const pending = await worker.evaluate((id) => _pendingWalks.has(id), tabId);
        check(`the walk behind the page's task is abandoned and pending: ${JSON.stringify(walk)} pending=${pending}`, walk.names === null && pending);
        const ran = await run('window.ran = 1');
        await busy;
        const log = await page.evaluate(() => window.log.join(','));
        check(`the page's own task finished (${log}); the Run ran after it: ${JSON.stringify(ran).slice(0, 100)}`, log === 'started,finished' && ran.result === '1');
      } else if (name === 'futureClock' || name === 'frozenClock') {
        const before = await page.evaluate(() => window.clockCalls);
        const sum = await run('1+1');
        const globals = await complete(null);
        const app = await complete('appState');
        const after = await page.evaluate(() => window.clockCalls);
        check(`1+1 runs normally under a replaced clock: ${JSON.stringify(sum).slice(0, 80)}`, sum.result === '2');
        check('completion still answers', Array.isArray(globals.names) && (app.names || []).some((n) => n.name === 'user'));
        check(`XRAY never called the page's clock (${after - before} calls)`, after === before);
      } else if (name === 'hugeGlobals') {
        const started = Date.now();
        const out = await complete(null);
        const ms = Date.now() - started;
        const bytes = JSON.stringify(out).length;
        check(`globals answer bounded: ${ms} ms, ${bytes} bytes, capped ${out.capped}`, ms < 2000 && bytes < 400_000 && (out.names === null || out.capped === true));
      } else {
        for (const expr of [null, 'rows', 'rows.items', 'rows.info', 'err', 'box', 'box.last', 'appState', 'errGlobal']) await complete(expr);
      }
      const seen = await stolen();
      check(`page code saw nothing: ${seen.slice(0, 4).join(' | ')}`, seen.length === 0);
    } catch (err) {
      failures.push(`${name}: ${err.message.split('\n')[0]}`);
    }
    await page.close();
  }
  assert.deepEqual(failures, []);
});

// Task 8 (spec §4): eager preview on a hostile page. The draft runs in a strict function on the
// scope under V8's side-effect check; its value — or what it threw, caught in the page — is projected
// IN THE PAGE by the scope's own projector (descriptor reads, natives taken at scope creation, no
// getter, no `stack`, no `then`) and read by value: CDP never describes a page or declared value, so
// the page's Error.prepareStackTrace never formats one; nothing is terminated. Page code that ran
// would record itself in `stolen` — or, under the side-effect check, fail with an EvalError that
// leaves no preview at all, which the checks below would see as a missing value.
const PREVIEW_COMMON = String.raw`
window.stolen = [];
window.appState = { user: { id: 1 }, count: 2 };
window.look = (how, value) => {
  let text = '';
  try { text = typeof value === 'function' ? Function.prototype.toString.call(value) : typeof value === 'string' ? value : JSON.stringify(value) || ''; } catch (e) { text = '<unser>'; }
  try { if (value && typeof value === 'object' && (('open' in value && typeof value.open === 'function') || ('preview' in value && 'walk' in value))) text += ' [INTERNAL]'; } catch {}
  if (/SECRET|DRAFT-MARK|\[INTERNAL\]|__x/.test(text)) stolen.push(how + ': ' + text.slice(0, 120));
};
`;
const PREVIEW_VECTORS = {
  errorValues: String.raw`Error.prepareStackTrace = (e, sites) => { stolen.push('prepareStackTrace: ' + e.message); return 'S'; }; window.errGlobal = new Error('e-global');`,
  // Every call site of a refused side effect: this, function, arguments, caller, its text.
  sideEffectFrames: String.raw`window.refused = []; Error.prepareStackTrace = (e, sites) => { refused.push(e.message + ' / ' + sites.length); for (const site of sites) { let self, fn; try { self = site.getThis(); } catch {} try { fn = site.getFunction(); } catch {} look('this', self); look('function', fn); try { look('site', String(site)); } catch {} if (typeof fn === 'function') { try { look('arguments', [...fn.arguments]); } catch {} try { look('caller', fn.caller); } catch {} } } return 'S'; };`,
  protoGetters: String.raw`for (const name of ['evil', 'then', 'toJSON', 'message', 'name', 'constructor2', Symbol.toStringTag]) Object.defineProperty(Object.prototype, name, { configurable: true, get() { stolen.push('getter ' + String(name)); return 'GETTER-RAN'; } });`,
  proxyResult: String.raw`window.prox = new Proxy({ a: 1 }, { get(t, k) { stolen.push('get ' + String(k)); return 'GET-TRAP'; }, has(t, k) { stolen.push('has'); return k in t; }, apply() { stolen.push('apply'); }, set() { stolen.push('set'); return true; } });`,
  promiseThen: String.raw`window.p = Promise.resolve(1); const t = Promise.prototype.then; Promise.prototype.then = function (...a) { stolen.push('then'); return t.apply(this, a); }; Object.defineProperty(Object.prototype, 'then', { configurable: true, get() { stolen.push('then getter'); return (resolve) => resolve('FORGED-THEN'); } });`,
  nativesLater: String.raw`window.patchLater = () => { const g = Object.getOwnPropertyDescriptor; Object.getOwnPropertyDescriptor = function (o, k) { look('gopd', o); const d = g(o, k); return d && 'value' in d ? { ...d, value: 'FORGED-GOPD' } : d; }; Object.getPrototypeOf = function (o) { look('gpo', o); return null; }; Object.getOwnPropertyNames = function (o) { look('gopn', o); return ['forged']; }; Array.isArray = () => false; const ts = Function.prototype.toString; Function.prototype.toString = function () { look('toString', this); return ts.call(this); }; Reflect.apply = function (f, s, a) { look('apply', s); return 'FORGED-APPLY'; }; };`,
  nativesAtLoad: String.raw`const g0 = Object.getOwnPropertyDescriptor; Object.getOwnPropertyDescriptor = function (o, k) { look('gopd at load', o); return g0(o, k); };`,
  busyPage: String.raw`window.log = [];`,
};

test('eager preview on a hostile page: no getter, trap, then or patched native runs; no value is described; nothing is terminated', { timeout: 240_000 }, async (t) => {
  const server = http.createServer((req, res) => {
    const name = decodeURIComponent((req.url || '').split('/v/')[1] || '');
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end(`<!doctype html><title>${name}</title><script>${PREVIEW_COMMON}\n${PREVIEW_VECTORS[name] ?? ''}</script><h1>${name}</h1>`);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xray-e2e-preview-attacks-'));
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: true, channel: 'chromium',
    args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`, '--no-sandbox'],
  });
  t.after(async () => {
    await context.close();
    server.close();
    fs.rmSync(userDataDir, { recursive: true, force: true });
  });
  const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker', { timeout: 30_000 }));
  const failures = [];
  for (const name of Object.keys(PREVIEW_VECTORS)) {
    const page = await context.newPage();
    const url = `http://127.0.0.1:${server.address().port}/v/${name}`;
    await page.goto(url);
    const tabId = await worker.evaluate(async (target) => (await chrome.tabs.query({})).find((tab) => tab.url === target)?.id, url);
    // Preview answers carry typed-model text; nothing to show is no `value` and no `thrown`.
    const preview = (code) => worker.evaluate(([id, source, text]) => _previewConsoleInTab(id, source, text, { attach: true }), [tabId, code, CONTEXT]);
    const run = (code) => worker.evaluate(([id, source, text]) => _evaluateConsoleInTab(id, source, text), [tabId, code, CONTEXT]);
    const check = (label, ok) => { if (!ok) failures.push(`${name}: ${label}`); };
    // Read with string joins only (the page's JSON.stringify and toJSON may be vectors).
    const stolen = async () => (await page.evaluate(() => window.stolen.join('\u0001'))).split('\u0001').filter(Boolean);
    try {
      await run('const err = new Error("SECRET-ERR"); const box = { last: new Error("SECRET-BOX"), n: 1 }; const sec = "SECRET-LOCAL"');
      if (name === 'nativesLater') await page.evaluate(() => window.patchLater());
      await page.evaluate(() => { window.stolen.length = 0; });
      if (name === 'busyPage') {
        const busy = page.evaluate(() => { window.log.push('start'); const t0 = performance.now(); while (performance.now() - t0 < 1200) { /* busy */ } window.log.push('end'); }).catch(() => {});
        await new Promise((resolve) => setTimeout(resolve, 100));
        const before = Date.now();
        const answer = await preview('1+1');
        const answeredMs = Date.now() - before;
        await busy;
        await new Promise((resolve) => setTimeout(resolve, 300));
        const log = await page.evaluate(() => window.log.join(','));
        check(`the page's own task ran to its end: ${log} (answered in ${answeredMs} ms: ${JSON.stringify(answer)})`, log === 'start,end');
        check(`a busy page: no answer, abandoned at the deadline (${answeredMs} ms)`, answeredMs < 1000 && answer.value === undefined);
        const after = await run('1+1');
        check(`the next Run runs: ${JSON.stringify(after).slice(0, 80)}`, after.result === '2');
      } else if (name === 'nativesAtLoad') {
        const out = await preview('({ a: 1 })');
        check(`natives replaced before the scope existed: the preview is off: ${JSON.stringify(out)}`, out.value === undefined && out.thrown === undefined);
      } else {
        const want = [
          ['err', /^\{"\$xray":"error","name":"Error","message":"SECRET-ERR"\}$/],
          ['box', /^\{"\$xray":"object","entries":\[\["last",\{"\$xray":"error","name":"Error","message":"SECRET-BOX"\}\],\["n",1\]\],"omitted":0\}$/],
          ['[err]', /SECRET-ERR/],
          ['({ a: 1 })', /^\{"\$xray":"object","entries":\[\["a",1\]\],"omitted":0\}$/],
          ['[1, 2]', /^\{"\$xray":"array","length":2,"items":\[1,2\]\}$/],
          ['sec.length', /^12$/],
          ['appState', /"user"/],
        ];
        if (name === 'errorValues') want.push(['errGlobal', /e-global/], ['new Error("x")', /"message":"x"/]);
        if (name === 'proxyResult') want.push(['prox', /^\{"\$xray":"object","entries":\[\["a",1\]\],"omitted":0\}$/]);
        if (name === 'promiseThen') want.push(['p', /^\{"\$xray":"instance","cls":"Promise","entries":\[\],"omitted":1\}$/]);
        for (const [code, pattern] of want) {
          const out = await preview(code);
          check(`${code} → ${JSON.stringify(out).slice(0, 160)}`, typeof out.value === 'string' && pattern.test(out.value) && !/FORGED|GETTER-RAN|GET-TRAP/.test(out.value));
        }
        const thrown = await preview('(() => { throw err })()');
        check(`a thrown declared Error is the page's own data: ${JSON.stringify(thrown).slice(0, 120)}`, /SECRET-ERR/.test(thrown.thrown || ''));
        const nullX = await preview('null.x');
        check(`null.x → ${JSON.stringify(nullX).slice(0, 120)}`, /TypeError/.test(nullX.thrown || ''));
        // A refused side effect: no preview, nothing written; never-compiling drafts are never sent.
        const effect = await preview("(() => { localStorage.setItem('DRAFT-MARK', sec); return 1 })()");
        check(`a side effect shows nothing: ${JSON.stringify(effect)}`, effect.value === undefined && effect.thrown === undefined);
        check('and nothing was written', (await page.evaluate(() => String(localStorage.getItem('DRAFT-MARK')))) === 'null');
        for (const draft of ['res.users lenght DRAFT-MARK', 'sec sec']) {
          const out = await preview(draft);
          check(`never sent: ${draft}`, out.value === undefined && out.thrown === undefined);
        }
      }
      // The documented residual (C-1): the draft with a side effect reaches the page's
      // prepareStackTrace as a bare EvalError with no call sites.
      const seen = (await stolen()).filter((entry) => entry !== 'prepareStackTrace: Possible side-effect in debug-evaluate');
      check(`page code saw nothing: ${seen.slice(0, 4).join(' | ')}`, seen.length === 0);
      if (name === 'sideEffectFrames') {
        const sites = (await page.evaluate(() => window.refused.join('\u0001'))).split('\u0001').filter(Boolean);
        check(`a refused side effect reaches the page with no call sites: ${sites.join(' | ')}`, sites.length > 0 && sites.every((entry) => entry === 'Possible side-effect in debug-evaluate / 0'));
        const refused = await page.evaluate(() => window.refused.join('\u0001'));
        // The documented residual (C-1): a refused side effect reaches the page's prepareStackTrace
        // as a bare EvalError — that it happened, and when; no frame's this, function, arguments or
        // text carries the scope, the context, a declared value or the draft (checked by look()).
        t.diagnostic(`refused side effects seen by the page: ${refused.split('\u0001').filter(Boolean).join(' | ')}`);
      }
    } catch (err) {
      failures.push(`${name}: ${err.message.split('\n')[0]}`);
    }
    await page.close();
  }
  assert.deepEqual(failures, []);
});

// Task 8 fix round 1 (review Critical 1, ruling option C): the typing path NEVER sends or refreshes
// the context. The helpers' built-ins are wrapped by the page — at load, or after the scope exists —
// and every wrapper records what it sees and writes it to localStorage. Previews of drafts that
// name context members (`res`, `entry`, `errors`) must hand the page nothing, write nothing, with or
// without an earlier Run (a Run's own exposure is C-1 limit (b): only what happens after it counts).
const HELPER_WRAP = String.raw`(() => {
  const record = (how, value) => { let text = ''; try { text = typeof value === 'string' ? value : String(JSON.stringify(value)); } catch { text = '<x>'; } if (/SECRET/.test(text)) { stolen.push(how + ': ' + text.slice(0, 100)); try { localStorage.setItem('leak', text.slice(0, 200)); } catch {} } };
  const jp = JSON.parse; JSON.parse = function (t, r) { record('JSON.parse', t); return jp(t, r); };
  const tr = String.prototype.trim; String.prototype.trim = function () { record('trim', String(this)); return tr.call(this); };
  const ia = Array.isArray; Array.isArray = function (v) { record('isArray', v); return ia(v); };
  const ho = Object.prototype.hasOwnProperty; Object.prototype.hasOwnProperty = function (k) { record('hasOwnProperty', this); return ho.call(this, k); };
  const ok = Object.keys; Object.keys = function (o) { record('keys', o); return ok(o); };
})();`;
const CONTEXT_VECTORS = { helpersAtLoad: HELPER_WRAP, helpersLater: `window.patchLater = () => { ${HELPER_WRAP} };` };
const SECRET_CONTEXT = JSON.stringify({
  currentEntry: { id: 's1', type: 'api', method: 'GET', url: 'https://other.example/api?SECRET-URL', urlPath: '/api', status: 200, responseRaw: '{"users":[{"id":1},{"id":2},{"id":3}],"jwt":"SECRET-BODY"}', responseHeaders: {} },
  entries: [{ id: 's1', type: 'api', method: 'GET', url: 'https://other.example/api?SECRET-URL', urlPath: '/api', status: 200, responseRaw: '{"jwt":"SECRET-BODY"}' }, { id: 's2', type: 'api', status: 500, url: 'https://third.example/b?SECRET-OTHER-ORIGIN' }],
  scope: {}, pins: {},
});

test('eager preview never sends or refreshes the context: page-wrapped helper built-ins see nothing from typing', { timeout: 240_000 }, async (t) => {
  const server = http.createServer((req, res) => {
    const name = decodeURIComponent((req.url || '').split('/v/')[1] || '');
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end(`<!doctype html><title>${name}</title><script>window.stolen = []; localStorage.clear(); ${CONTEXT_VECTORS[name] ?? ''}</script><h1>${name}</h1>`);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xray-e2e-preview-context-'));
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: true, channel: 'chromium',
    args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`, '--no-sandbox'],
  });
  t.after(async () => {
    await context.close();
    server.close();
    fs.rmSync(userDataDir, { recursive: true, force: true });
  });
  const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker', { timeout: 30_000 }));
  const failures = [];
  for (const name of Object.keys(CONTEXT_VECTORS)) {
    const page = await context.newPage();
    const url = `http://127.0.0.1:${server.address().port}/v/${name}`;
    await page.goto(url);
    const tabId = await worker.evaluate(async (target) => (await chrome.tabs.query({})).find((tab) => tab.url === target)?.id, url);
    const preview = (code) => worker.evaluate(([id, source, text]) => _previewConsoleInTab(id, source, text, { attach: true }), [tabId, code, SECRET_CONTEXT]);
    const run = (code) => worker.evaluate(([id, source, text]) => _evaluateConsoleInTab(id, source, text), [tabId, code, SECRET_CONTEXT]);
    const check = (label, ok) => { if (!ok) failures.push(`${name}: ${label}`); };
    const seen = async () => page.evaluate(() => [window.stolen.join(' | '), String(localStorage.getItem('leak'))].join('\u0002'));
    try {
      // The scope exists (a Run that names no context), then the page may patch.
      await run('1+1');
      if (name === 'helpersLater') await page.evaluate(() => window.patchLater());
      await page.evaluate(() => { window.stolen.length = 0; localStorage.clear(); });
      const drafts = ['res.users.length * 2', 'entry.url.length + 0', 'errors.length + 0'];
      for (const draft of drafts) {
        const out = await preview(draft);
        check(`no prior Run: ${draft} previews nothing: ${JSON.stringify(out).slice(0, 100)}`, out.value === undefined && out.thrown === undefined);
      }
      const [before, leak] = (await seen()).split('\u0002');
      check(`no prior Run: the page saw nothing (${before.slice(0, 160)}) and wrote nothing (${leak.slice(0, 60)})`, before === '' && leak === 'null');
      // A Run that names them (its own exposure is limit (b)); after it, previews read only the scope.
      await run('[res.users.length, entry.url.length, errors.length]');
      await page.evaluate(() => { window.stolen.length = 0; localStorage.clear(); });
      const answers = [];
      for (const draft of drafts) answers.push(await preview(draft));
      // Natives wrapped after the scope exists change nothing: the preview reads the Run's res. At
      // load (Array.isArray wrapped) the preview is off on the page.
      if (name === 'helpersLater') check(`after a Run, the same selection previews: ${JSON.stringify(answers[0])}`, answers[0].value === '6');
      const changed = await worker.evaluate(([id, text]) => _previewConsoleInTab(id, 'res.users.length * 2', text.replace('SECRET-URL', 'SECRET-URL2'), { attach: true }), [tabId, SECRET_CONTEXT]);
      check(`another selection: no stale preview: ${JSON.stringify(changed)}`, changed.value === undefined);
      const [after, leakAfter] = (await seen()).split('\u0002');
      check(`after a Run: previews hand the page nothing (${after.slice(0, 160)}) and write nothing (${leakAfter.slice(0, 60)})`, after === '' && leakAfter === 'null');
    } catch (err) {
      failures.push(`${name}: ${err.message.split('\n')[0]}`);
    }
    await page.close();
  }
  assert.deepEqual(failures, []);
});

// Final review I-1 (ruling B, threat model C-1 "Previews over revived or declared values"): a draft
// over values the user's last Run revived, or the user declared, runs page-realm built-ins and
// prototypes on them under the side-effect check. That is documented, not prevented: a page that
// patches Array.prototype.map after the scope exists receives the revived items and can measure them
// (a timing channel, the class of limit (i)). What is pinned here is what still holds: the page code
// can write nothing — no page global, no array, no localStorage — so it keeps no copy, and a
// patch that tries to write turns the preview off (V8 refuses the side effect) instead of leaking.
const REVIVED_PATCH = {
  // Computes only (the reviewer's probe): the preview answers, and the patched map saw the item.
  mapComputes: String.raw`window.patchLater = () => { const m = Array.prototype.map; Array.prototype.map = function (f) { try { const s = this[0] && this[0].jwt; if (typeof s === 'string') { const end = Date.now() + (s.charCodeAt(0) % 40); while (Date.now() < end) {} } } catch {} return m.call(this, f); }; };`,
  // Tries to keep a copy every way it can: a page array, a new global, localStorage.
  mapWrites: String.raw`window.patchLater = () => { const m = Array.prototype.map; Array.prototype.map = function (f) { const s = JSON.stringify(this); try { kept.push(s); } catch {} try { window.__stolen = s; } catch {} try { localStorage.setItem('leak', s); } catch {} return m.call(this, f); }; };`,
  // A prototype getter reached by a missing key, and coercion through a page toString.
  protoWrites: String.raw`window.patchLater = () => { Object.defineProperty(Object.prototype, 'missing', { configurable: true, get() { const s = JSON.stringify(this); try { kept.push(s); } catch {} try { localStorage.setItem('leak', s); } catch {} return 1; } }); Object.prototype.toString = function () { const s = JSON.stringify(this); try { kept.push(s); } catch {} try { localStorage.setItem('leak', s); } catch {} return 'x'; }; };`,
};
const REVIVED_CONTEXT = JSON.stringify({
  currentEntry: null, entries: [],
  values: { res: { users: [{ jwt: 'SECRET-REVIVED', id: 1 }, { jwt: 'x', id: 2 }] } },
  scope: {}, pins: {},
});

test('previews over revived or declared values: page built-ins may run on them (documented) but write nothing and keep no copy', { timeout: 240_000 }, async (t) => {
  const server = http.createServer((req, res) => {
    const name = decodeURIComponent((req.url || '').split('/r/')[1] || '');
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end(`<!doctype html><title>${name}</title><script>window.kept = []; localStorage.clear(); ${REVIVED_PATCH[name] ?? ''}</script><h1>${name}</h1>`);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xray-e2e-preview-revived-'));
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: true, channel: 'chromium',
    args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`, '--no-sandbox'],
  });
  t.after(async () => {
    await context.close();
    server.close();
    fs.rmSync(userDataDir, { recursive: true, force: true });
  });
  const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker', { timeout: 30_000 }));
  const failures = [];
  for (const name of Object.keys(REVIVED_PATCH)) {
    const page = await context.newPage();
    const url = `http://127.0.0.1:${server.address().port}/r/${name}`;
    await page.goto(url);
    const tabId = await worker.evaluate(async (target) => (await chrome.tabs.query({})).find((tab) => tab.url === target)?.id, url);
    const preview = (code) => worker.evaluate(([id, source, text]) => _previewConsoleInTab(id, source, text, { attach: true }), [tabId, code, REVIVED_CONTEXT]);
    const run = (code) => worker.evaluate(([id, source, text]) => _evaluateConsoleInTab(id, source, text), [tabId, code, REVIVED_CONTEXT]);
    const check = (label, ok) => { if (!ok) failures.push(`${name}: ${label}`); };
    const stored = () => page.evaluate(() => JSON.stringify({ kept: window.kept, stolen: window.__stolen, leak: localStorage.getItem('leak') }));
    try {
      // The Run revives res.users and declares `users` (spec §2's example); then the page patches.
      await run('res.users.length');
      await run('const users = res.users');
      await page.evaluate(() => window.patchLater());
      // Positive control: drafts that touch none of the patched paths still answer, so the session is
      // live and the digest gate open — a missing value below is V8 refusing the page's write.
      for (const control of ['res.users.length * 2', 'users.length * 2']) {
        const out = await preview(control);
        check(`control ${control} → ${JSON.stringify(out)}`, out.value === '4');
      }
      const drafts = name === 'protoWrites'
        ? ['res.users[0].missing + 0', 'users[0].missing + 0', "res.users[0] + ''", "users[0] + ''"]
        : ['res.users.map((u) => u.id).length', 'users.map((u) => u.id).length'];
      for (const draft of drafts) {
        const out = await preview(draft);
        // The computing patch ran on the revived items and the preview still answers (the documented
        // channel); a patch that writes is refused by the side-effect check: no preview at all.
        if (name === 'mapComputes') check(`${draft} → ${JSON.stringify(out)}`, out.value === '2');
        else check(`${draft}: a writing page patch turns the preview off: ${JSON.stringify(out).slice(0, 120)}`, out.value === undefined);
      }
      const after = await stored();
      check(`no write and no stored copy: ${after.slice(0, 200)}`, after === JSON.stringify({ kept: [], leak: null }));
    } catch (err) {
      failures.push(`${name}: ${err.message.split('\n')[0]}`);
    }
    await page.close();
  }
  assert.deepEqual(failures, []);
});
