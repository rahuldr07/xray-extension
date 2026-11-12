// background.js BYOK provider bridge.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const util = require('node:util');
const test = require('node:test');

const { read } = require('./helpers/source');

// The worker loads shared/console-scope.js with importScripts (a classic service worker); the
// vm context gets the same, running the file in the worker's realm.
function loadWorker(context) {
  context.importScripts = (...files) => {
    for (const file of files) vm.runInContext(read(file), context, { filename: file });
  };
  vm.createContext(context);
  vm.runInContext(read('background.js'), context);
  return context;
}

// A fresh scope and one command as a single expression — the same builders the worker sends to
// the page in three calls (_runInConsoleScope), joined so the VM tests can run a command whole
// (test-only; moved out of background.js, final review M-7). `options.pendingMs`: how long a
// top-level promise may stay pending before the answer is taken (the worker's cap). The context goes
// in through JSON.parse here, and the timer is taken before the command runs.
function buildConsoleExpression(worker, code, context, helperSource, options = {}) {
  const api = worker._consoleScopeApi();
  const pendingMs = Number.isFinite(options.pendingMs) ? options.pendingMs : vm.runInContext('CONSOLE_EVAL_TIMEOUT_MS', worker);
  const full = worker._consoleContextValue(context);
  const plan = api.planRun(String(code || '').trim(), worker._consoleKnownNames(full, {}), 'test');
  const value = worker._consoleContextArgument(full, plan.needed);
  // The worker's steps in one expression: start, wait (up to the cap), classify the value — a
  // native promise is awaited (here by the test realm, as CDP would) — finish, take.
  return `(async () => {
  const __xrayTimer = typeof setTimeout === 'function' ? setTimeout : null;
  const __xrayCap = (promise, fallback) => (__xrayTimer ? Promise.race([promise, new Promise((resolve) => __xrayTimer(() => resolve(fallback), ${pendingMs}))]) : promise);
  const __xrayScopeObject = ${api.buildScopeExpression(helperSource, 'test-key')};
  await __xrayCap((${plan.text}).call(__xrayScopeObject, 'test-key', JSON.parse(${JSON.stringify(JSON.stringify(value))})));
  const __xrayValue = (${api.INSPECT_FUNCTION}).call(__xrayScopeObject, 'test-key');
  let __xrayMode = 'value';
  let __xraySettled;
  const __xrayStarted = Date.now();
  if (__xrayValue !== undefined && Object.prototype.toString.call(__xrayValue) === '[object Promise]') {
    const outcome = await __xrayCap(__xrayValue.then((v) => ({ mode: 'fulfilled', v }), (v) => ({ mode: 'rejected', v })), { mode: 'pending' });
    __xrayMode = outcome.mode;
    __xraySettled = outcome.v;
  }
  const __xrayMs = Date.now() - __xrayStarted;
  await (${api.FINISH_FUNCTION}).call(__xrayScopeObject, 'test-key', __xrayMode, __xraySettled);
  const __xrayRecord = (${api.TAKE_FUNCTION}).call(__xrayScopeObject, 'test-key');
  const __xrayAnswer = __xrayRecord.answer ? { ...__xrayRecord.answer } : { type: 'error', error: { kind: 'timeout', message: 'Execution timeout' } };
  if (__xrayRecord.promise) __xrayAnswer.meta = { promise: { state: __xrayRecord.promise, ms: __xrayMs } };
  return __xrayAnswer;
})()`;
}

test('background service worker explains requests through a BYOK provider bridge', () => {
  const background = read('background.js');
  assert.match(background, /xray:ai-explain/);
  assert.match(background, /api\.anthropic\.com\/v1\/messages/);
  assert.match(background, /api\.openai\.com\/v1\/chat\/completions/);
  assert.match(background, /AI_TIMEOUT_MS/);
  assert.match(background, /MAX_AI_PROMPT_CHARS/);
});

test('any OpenAI-compatible endpoint can be used as a custom provider', () => {
  // The built-in providers are hardcoded, but a custom endpoint is user-supplied, so
  // one OpenAI-compatible caller serves both and the custom URL is validated here in
  // the service worker rather than trusted from the settings page.
  const background = read('background.js');

  assert.match(background, /_callOpenAiCompatible/);
  assert.match(background, /_callCustomProvider/);
  assert.match(background, /settings\.provider === 'custom'/);
  // A base URL is completed to a chat-completions endpoint; a full URL is left alone.
  assert.match(background, /chat\/completions/);
  // Both response shapes are read, so an Anthropic-shaped server works without the
  // user having to declare which shape it speaks.
  assert.match(background, /_extractCompletionText/);
  assert.match(background, /data\?\.choices\?\.\[0\]\?\.message\?\.content/);
  assert.match(background, /Array\.isArray\(data\?\.content\)/);
});

test('a custom AI endpoint must be https, except on localhost', () => {
  // Captured traffic is sent to this endpoint, so a typo'd public URL must not
  // silently ship request bodies in the clear. Loopback stays permitted so a local
  // model server (Ollama, LM Studio) works.
  const background = read('background.js');

  assert.match(background, /AI_LOCAL_HOSTS/);
  assert.match(background, /localhost/);
  assert.match(background, /127\.0\.0\.1/);
  assert.match(background, /url\.protocol !== 'https:'/);
  assert.match(background, /must use https/);
});

test('capture relay receipts distinguish no consumer, delivery, and relay failure without payloads', () => {
  const background = read('background.js');
  assert.match(background, /delivery:\s*'no-consumer'/);
  assert.match(background, /delivery:\s*'delivered'/);
  assert.match(background, /delivery:\s*'relay-failed'/);
  assert.match(background, /sendResponse\(\{ ok: true, delivery/);
  assert.doesNotMatch(background, /sendResponse\(\{[^}]*entry:/);
});

function relayBackground() {
  let messageListener;
  let connectListener;
  const noopEvent = { addListener() {} };
  const chrome = {
    runtime: { id: 'xray-test', onConnect: { addListener: fn => { connectListener = fn; } }, onMessage: { addListener: fn => { messageListener = fn; } }, getURL: name => name },
    action: { onClicked: noopEvent },
    commands: { onCommand: noopEvent },
    windows: { onRemoved: noopEvent },
    debugger: { onDetach: noopEvent },
    tabs: {},
  };
  const context = { chrome, console, URL, fetch: async () => ({ text: async () => '' }) };
  loadWorker(context);
  return {
    connect(port) { connectListener(port); },
    send(message, sender) { return new Promise(resolve => messageListener(message, sender, resolve)); },
  };
}

test('background relay fixtures report no-consumer, disconnected-port, and delivered outcomes as receipts', async () => {
  const payload = { id: 'entry-1', type: 'api', url: 'https://private.test/path', requestHeaders: { authorization: 'secret-header' }, requestBody: 'secret-body' };
  const cases = [
    { name: 'no-consumer', sender: { id: 'xray-test', tab: { id: 1 } }, setup() {}, expected: 'no-consumer' },
    { name: 'disconnected-port', sender: { id: 'xray-test', tab: { id: 2 } }, setup(bg) { bg.connect({ name: 'xray-devtools', onMessage: { addListener(fn) { fn({ type: 'xray:devtools:init', tabId: 2 }); } }, onDisconnect: { addListener() {} }, postMessage() { throw new Error('raw relay secret'); } }); }, expected: 'relay-failed' },
    { name: 'delivered', sender: { id: 'xray-test', tab: { id: 3 } }, setup(bg) { bg.connect({ name: 'xray-devtools', onMessage: { addListener(fn) { fn({ type: 'xray:devtools:init', tabId: 3 }); } }, onDisconnect: { addListener() {} }, postMessage() {} }); }, expected: 'delivered' },
  ];
  for (const item of cases) {
    const bg = relayBackground();
    item.setup(bg);
    const receipt = await bg.send({ type: 'xray:capture', entry: payload }, item.sender);
    assert.deepEqual(Object.keys(receipt).sort(), ['count', 'delivery', 'ok']);
    assert.equal(receipt.delivery, item.expected, item.name);
    assert.equal(receipt.count, 1);
    assert.doesNotMatch(JSON.stringify(receipt), /private\.test|secret-header|secret-body|raw relay secret|error|url|header|body/i);
  }
});

test('a missing debugger permission explains how to recover instead of pointing at a missing setting', () => {
  const background = read('background.js');
  assert.doesNotMatch(background, /Enable it in XRAY Settings/);
  assert.match(background, /Reload XRAY at chrome:\/\/extensions/);
});

function consoleExpressionBuilder() {
  const noopEvent = { addListener() {} };
  const chrome = {
    runtime: { id: 'xray-test', getURL: name => name, onConnect: noopEvent, onMessage: noopEvent },
    tabs: {}, action: { onClicked: noopEvent }, commands: { onCommand: noopEvent },
    windows: { onRemoved: noopEvent }, debugger: { onDetach: noopEvent },
  };
  const context = { chrome, console, URL, fetch: async () => ({ text: async () => '' }) };
  loadWorker(context);
  const helperSource = fs.readFileSync(require.resolve('../shared/console-helpers.js'), 'utf8');
  const entry = { id: 'e1', type: 'api', method: 'GET', url: 'https://x.test/api', urlPath: '/api', status: 200, responseDecrypted: { users: [{ id: 1 }] } };
  // The context travels as tagged JSON text (panel/console.js _contextPayload); `overrides`
  // is merged into a plain context, a string is sent as it is. The result comes back as
  // typed JSON text (shared/console-helpers.js encodeResult); `value` is it parsed.
  const run = async (code, overrides = {}) => {
    const contextText = typeof overrides === 'string'
      ? overrides
      : JSON.stringify({ currentEntry: entry, entries: [entry], scope: {}, pins: {}, ...overrides });
    const expression = buildConsoleExpression(context, code, contextText, helperSource);
    const out = await vm.runInNewContext(expression, { navigator: {}, console });
    return typeof out?.result === 'string' ? { ...out, value: JSON.parse(out.result) } : out;
  };
  run.expression = (code, contextText) => buildConsoleExpression(context, code, contextText, helperSource);
  return run;
}

test('console evaluation reports undefined results instead of crashing the serializer', async () => {
  const run = consoleExpressionBuilder();
  const missing = await run('res.data');
  assert.equal(missing.type, 'undefined', JSON.stringify(missing));
  assert.equal(missing.error, undefined);
  assert.deepEqual(missing.value, { $xray: 'undefined' });
  const value = await run('res.users.length');
  assert.equal(value.value, 1);
});

test('a pinned request evaluates as its parsed response body, not the raw entry', async () => {
  const run = consoleExpressionBuilder();
  // Pins travel as { id, body } (panel/console.js), never the full entry.
  const pinned = { id: 'p1', body: JSON.stringify({ users: [{ id: 1 }, { id: 2 }] }) };
  const count = await run('a.users.length', { pins: { a: pinned } });
  assert.equal(count.value, 2, JSON.stringify(count));
  // `res` still names the selected request; the pin sits beside it.
  assert.equal((await run('res.users.length + a.users.length', { pins: { a: pinned } })).value, 3);
  // A pin can never replace a runtime helper.
  assert.equal((await run('res.users.length', { pins: { res: pinned } })).value, 1);
  // Only a-f are declared; any other pin name stays unbound.
  assert.equal((await run('typeof g', { pins: { g: pinned } })).value, 'undefined');
  // User code may still declare a pinned letter (its body runs in a nested scope).
  assert.equal((await run('const a = 5; a * 2', { pins: { a: pinned } })).value, 10);
});

test('console evaluation runs statements such as throw instead of wrapping them as an expression', async () => {
  const run = consoleExpressionBuilder();
  const thrown = await run('throw new Error("boom")');
  assert.equal(thrown.type, 'error');
  assert.equal(thrown.error.message, 'boom');
  const block = await run('do { } while (false)');
  assert.notEqual(block.type, 'error', JSON.stringify(block));
});

test('console evaluation returns the last expression of multi-statement input, like DevTools', async () => {
  const run = consoleExpressionBuilder();
  assert.equal((await run('const x = 2; x * 3')).value, 6);
  assert.equal((await run('const x = 2\nx * 3')).value, 6);
  assert.equal((await run('const x = 2; x * 3;')).value, 6);
  assert.equal(JSON.stringify((await run('const a = [1, 2]; a.map((v) => { return v * 2; })')).value), '[2,4]');
  assert.equal((await run('const s = "a;b"; s')).value, 'a;b');
  assert.equal((await run('const t = `x;\ny`; t.length')).value, 4);
  assert.equal((await run('// note; here\nconst y = 5\ny')).value, 5);
  // Declarations and control flow as the last statement produce undefined, not a syntax error.
  assert.equal((await run('const z = 1;')).type, 'undefined');
  assert.equal((await run('for (let i = 0; i < 2; i++) {}')).type, 'undefined');
  assert.equal((await run('let n = 0; if (true) { n = 1 }')).type, 'undefined');
});

// Issue #15: one expression whose `;` or newlines sit only inside brackets/braces is still one
// expression — its value is the result (it used to run as a statement and show `undefined`).
test('a single expression with ; or newlines inside brackets returns its value (issue #15)', async () => {
  const run = consoleExpressionBuilder();
  assert.equal(JSON.stringify((await run('[1, 2].map(x => { const y = x * 2; return y })')).value), '[2,4]');
  assert.equal((await run('(() => { const f = 3; return f + 1; })()')).value, 4);
  assert.equal((await run('(function () { return 7; })();')).value, 7);
  assert.equal((await run('Math.max(\n1,\n2\n)')).value, 2);
  assert.deepEqual((await run('({ a: 1,\n  b: 2 })')).value, { a: 1, b: 2 });
  assert.equal(JSON.stringify((await run('res.users.map(x => { const y = x.id; return y })')).value), '[1]');
  // A depth-0 newline continues the expression after an operator or before `.`/`?.` (chains).
  assert.equal(JSON.stringify((await run('res.users\n  .map(u => u.id)')).value), '[1]');
  assert.equal((await run('1 +\n2')).value, 3);
  assert.equal((await run('const a = 4\na\n  .toString()')).value, '4');
  assert.equal((await run('let i = 1\ni++\ni')).value, 2);
  assert.equal((await run('const r = /x/\nr.test("x")')).value, true);
  // Statements stay statements: a block, a declaration, control flow.
  assert.equal((await run('{ const q = 1; q }')).type, 'undefined');
  assert.equal((await run('const w = [1].map(x => { return x; })')).type, 'undefined');
  assert.equal((await run('if (true) { 1; }')).type, 'undefined');
  assert.equal((await run('async function g() { const v = 1; return v; }')).type, 'undefined');
});

// Spec J8: results come back as typed JSON text in the page's key order; the context goes in
// as tagged JSON text, inlined as a string literal and revived in the page.
test('console results come back as typed JSON text: page key order, NaN/-0/undefined, Map, shared refs, stated caps', async () => {
  const run = consoleExpressionBuilder();
  const ordered = await run('({ b: 1, a: 2, "10": 3, "2": 4, "-1": 5 })');
  assert.equal(ordered.result, '{"2":4,"10":3,"b":1,"a":2,"-1":5}', 'a string: nothing between page and panel reorders it');
  assert.equal(ordered.type, 'object');
  assert.deepEqual((await run('[NaN, -0, undefined, 1 / 0]')).value,
    [{ $xray: 'number', value: 'NaN' }, { $xray: 'number', value: '-0' }, { $xray: 'undefined' }, { $xray: 'number', value: 'Infinity' }]);
  assert.deepEqual((await run('const s = { x: 1 }; ({ a: s, b: s })')).value, { a: { x: 1 }, b: { x: 1 } });
  assert.deepEqual((await run('new Map([[1, { a: 1 }]])')).value, { $xray: 'map', size: 1, entries: [[1, { a: 1 }]] });
  const capped = await run('Array(5000).fill(1)');
  assert.equal(capped.truncated, true);
  assert.equal(capped.value.$xray, 'array');
  assert.equal(capped.value.length, 5000);
  assert.equal(capped.value.items.length, 1000);
  const table = await run('table([{ a: 1 }])');
  assert.equal(table.render, 'table', 'the table marker is a flag beside the value');
  assert.equal(table.result, '[{"a":1}]');
  const thrownValue = await run('new TypeError("x")');
  assert.equal(thrownValue.value.$xray, 'error', 'a returned Error is a typed value, not a {__type__} object');
});

test('the context is tagged JSON text revived in the page: unsafe integers are BigInt, __proto__ a plain key', async () => {
  const run = consoleExpressionBuilder();
  const current = { id: 'c', type: 'api', url: 'https://x.test/u', urlPath: '/u', responseRaw: '{"id":9007199254740993}' };
  const text = JSON.stringify({
    currentEntry: current,
    entries: [current],
    scope: { $_: [{ $xray: 'number', value: 'NaN' }, { $xray: 'undefined' }] },
    pins: {},
    values: { res: { id: { $xray: 'bigint', value: '9007199254740993' } }, req: JSON.parse('{"__proto__":{"polluted":true},"n":1}') },
  });
  assert.equal((await run('typeof res.id', text)).value, 'bigint');
  assert.deepEqual((await run('res.id', text)).value, { $xray: 'bigint', value: '9007199254740993' });
  assert.equal((await run('res.id === 9007199254740993n', text)).value, true);
  assert.deepEqual((await run('Object.keys(req)', text)).value, ['__proto__', 'n']);
  assert.equal((await run('req.polluted', text)).type, 'undefined', 'never the prototype');
  assert.deepEqual((await run('$_', text)).value, [{ $xray: 'number', value: 'NaN' }, { $xray: 'undefined' }]);
  assert.equal((await run('Number.isNaN($_[0]) && $_.length === 2 && 1 in $_', text)).value, true);
  // The context is data handed to the run (callFunctionOn) as a VALUE — parsed in the worker,
  // never by the page's JSON.parse, never source (the worker tests below check the CDP arguments).
  const expression = run.expression('res.id', text);
  assert.match(expression, /__xtest_api\.begin\(__xtest_context, \["res"\]\)/, 'revived by the scope, only for the names the command uses');
  assert.equal(expression.includes('const __context = {'), false);
  const hostile = JSON.stringify({ scope: { x: '"}); throw 1; ({"' }, pins: {}, values: {} });
  assert.equal((await run('x', hostile)).value, '"}); throw 1; ({"', 'quotes in context data stay data');
});

test('without the debugger API the worker still registers every listener', () => {
  // If chrome.debugger is ever unavailable (permission missing or not yet granted),
  // A top-level chrome.debugger.onDetach.addListener used to throw here and abort the
  // script, so onMessage/onConnect/commands/action listeners were never registered.
  const registered = [];
  const event = (name) => ({ addListener: () => registered.push(name) });
  const chrome = {
    runtime: { id: 'xray-test', getURL: name => name, onConnect: event('onConnect'), onMessage: event('onMessage') },
    tabs: {}, action: { onClicked: event('action') }, commands: { onCommand: event('commands') },
    windows: { onRemoved: event('windows') },
    permissions: { onAdded: event('permissions.onAdded'), contains: () => Promise.resolve(false) },
  };
  const context = { chrome, console, URL, fetch: async () => ({ text: async () => '' }) };
  vm.createContext(context);
  assert.doesNotThrow(() => vm.runInContext(fs.readFileSync(require.resolve('../background.js'), 'utf8'), context));
  for (const name of ['onMessage', 'onConnect', 'commands', 'action']) assert.ok(registered.includes(name), `${name} listener registered`);
});

// ── Console round 2 (spec §1): top-level promise header, top-level throw location, debugger errors ──

function consoleRunner(options = {}) {
  const noopEvent = { addListener() {} };
  const chrome = {
    runtime: { id: 'xray-test', getURL: name => name, onConnect: noopEvent, onMessage: noopEvent },
    tabs: {}, action: { onClicked: noopEvent }, commands: { onCommand: noopEvent },
    windows: { onRemoved: noopEvent }, debugger: { onDetach: noopEvent },
  };
  const context = { chrome, console, URL, setTimeout, clearTimeout, fetch: async () => ({ text: async () => '' }) };
  loadWorker(context);
  const helperSource = fs.readFileSync(require.resolve('../shared/console-helpers.js'), 'utf8');
  const contextText = JSON.stringify({ currentEntry: null, entries: [], scope: {}, pins: {} });
  return async (code) => {
    const expression = buildConsoleExpression(context, code, contextText, helperSource, options);
    // Named "<anonymous>" as a Runtime.evaluate script is, so frames read `at <anonymous>:L:C`.
    const out = await vm.runInNewContext(expression, { navigator: {}, console, setTimeout, clearTimeout, Date }, { filename: '<anonymous>' });
    const mapped = context._finishConsoleResult(out, expression, code);
    return typeof mapped?.result === 'string' ? { ...mapped, value: JSON.parse(mapped.result) } : mapped;
  };
}

test('a top-level promise is awaited and its cell header says so: fulfilled with the time it took', async () => {
  const run = consoleRunner();
  const out = await run('Promise.resolve(5)');
  assert.equal(out.value, 5, JSON.stringify(out));
  assert.equal(out.meta?.promise?.state, 'fulfilled');
  assert.equal(typeof out.meta.promise.ms, 'number');
  assert.ok(out.meta.promise.ms >= 0);
  // The last expression of several statements is a top-level value too.
  assert.equal((await run('const p = Promise.resolve(2); p')).meta?.promise?.state, 'fulfilled');
  // An explicit await already took the value: no promise header.
  const awaited = await run('await Promise.resolve(5)');
  assert.equal(awaited.value, 5);
  assert.equal(awaited.meta, undefined);
  assert.equal((await run('5')).meta, undefined, 'plain values carry no meta');
});

test('a top-level promise still pending at the cap is Promise {<pending>} with a note, not a timeout error', async () => {
  const run = consoleRunner({ pendingMs: 40 });
  const out = await run('new Promise(() => {})');
  assert.notEqual(out.type, 'error', JSON.stringify(out));
  assert.deepEqual(out.value, { $xray: 'promise', state: 'pending' });
  assert.equal(out.meta?.promise?.state, 'pending');
  assert.ok(out.meta.promise.ms >= 30, String(out.meta.promise.ms));
});

test('a top-level rejected promise is an error whose header says rejected', async () => {
  const run = consoleRunner();
  const out = await run('Promise.reject(new Error("no"))');
  assert.equal(out.type, 'error');
  assert.equal(out.error.message, 'no');
  assert.equal(out.meta?.promise?.state, 'rejected');
});

test('a top-level throw is located in the command (wrapper frames hidden), like DevTools', async () => {
  const run = consoleRunner();
  const thrown = await run("throw new Error('x')");
  assert.equal(thrown.type, 'error');
  assert.equal(thrown.error.thrown, true);
  assert.equal(thrown.error.location, '<anonymous>:1:7');
  const frames = thrown.error.stack.split('\n').filter((line) => /<anonymous>:\d+:\d+/.test(line));
  assert.deepEqual(frames.map((line) => line.trim()), ['at <anonymous>:1:7'], thrown.error.stack);
  // Line 2 of a multi-statement command; the wrapped last expression keeps its own column.
  assert.equal((await run("const a = 1;\nthrow new Error('y')")).error.location, '<anonymous>:2:7');
  assert.equal((await run('missingName + 1')).error.location, '<anonymous>:1:1');
  assert.equal((await run('const b = 2;\n  b + missingName')).error.location, '<anonymous>:2:7');
  // A function declared in the command: both of its frames are the user's.
  const nested = await run("function f() {\n  throw new TypeError('t');\n}\nf()");
  assert.equal(nested.error.location, '<anonymous>:2:9');
  assert.match(nested.error.stack, /at f \(<anonymous>:2:9\)/);
  assert.match(nested.error.stack, /at <anonymous>:4:1/);
});

// `sendCommand(calls, params)` answers a command's run — Runtime.callFunctionOn on the console
// scope (params.functionDeclaration), then Runtime.awaitPromise for its answer: a string is a CDP
// failure of the call, `null` the default result, or an object { error?, result?,
// exceptionDetails?, delay?, never?, awaitNever? }. `never`: the call's synchronous part never
// returns (a loop) until Runtime.terminateExecution stops it; `awaitNever`: the answer never
// comes. The scope itself (Runtime.evaluate) is created without a plan.
function debuggerHarness(sendCommand, { enableFails = false } = {}) {
  const calls = { attach: 0, detach: 0, evaluate: 0, terminate: 0, scopes: 0 };
  const noopEvent = { addListener() {} };
  let hung = null;
  let lastPromise = null;
  let finished = false;
  const plans = new Map();
  const chrome = {
    runtime: { id: 'xray-test', getURL: name => name, onConnect: noopEvent, onMessage: noopEvent, lastError: undefined },
    tabs: {}, action: { onClicked: noopEvent }, commands: { onCommand: noopEvent },
    windows: { onRemoved: noopEvent },
    permissions: { onAdded: noopEvent, contains: (_query, callback) => callback(true) },
    debugger: {
      onDetach: noopEvent,
      attach(_target, _version, callback) { calls.attach++; callback(); },
      detach(_target, callback) { calls.detach++; callback?.(); },
      sendCommand(_target, method, params, callback) {
        const answer = (error, result) => {
          if (error) chrome.runtime.lastError = { message: error };
          callback(error ? undefined : result);
          chrome.runtime.lastError = undefined;
        };
        if (method === 'Runtime.enable') return answer(enableFails ? 'Runtime.enable failed' : null, {});
        if (method === 'Runtime.evaluate' && params.returnByValue === false) {
          calls.scopes++;
          return answer(null, { result: { type: 'object', objectId: `scope-${calls.scopes}` } });
        }
        if (method === 'Runtime.terminateExecution') {
          calls.terminate++;
          if (hung) { const stop = hung; hung = null; stop(); }
          return answer(null, {});
        }
        if (method === 'Runtime.awaitPromise') {
          const plan = plans.get(params.promiseObjectId) || {};
          if (plan.awaitNever) return undefined;
          return answer(null, { result: { type: 'undefined' } });
        }
        if (method !== 'Runtime.callFunctionOn') return answer(null, {});
        if (/\.take\(\)/.test(params.functionDeclaration)) {
          const plan = plans.get(lastPromise) || {};
          const state = plan.awaitNever ? 'running' : finished ? 'done' : 'ran';
          return answer(null, { result: { type: 'object', value: { state, answer: plan.result || { type: 'number', result: '1', truncated: false }, declared: {} } } });
        }
        if (/\.value\(\)/.test(params.functionDeclaration)) return answer(null, { result: { type: 'undefined' } });
        if (/\.finish\(/.test(params.functionDeclaration)) {
          finished = true;
          return answer(null, { result: { type: 'object', subtype: 'promise', objectId: 'finish' } });
        }
        finished = false;
        calls.evaluate++;
        const raw = sendCommand(calls, params);
        const plan = typeof raw === 'string' ? { error: raw } : raw || {};
        if (plan.never) {
          hung = () => answer('Execution was terminated', undefined);
          return undefined;
        }
        const promiseObjectId = `promise-${calls.evaluate}`;
        plans.set(promiseObjectId, plan);
        lastPromise = promiseObjectId;
        const reply = () => answer(plan.error || null, plan.exceptionDetails
          ? { exceptionDetails: plan.exceptionDetails }
          : { result: { type: 'object', subtype: 'promise', objectId: promiseObjectId } });
        if (plan.delay) setTimeout(reply, plan.delay); else reply();
        return undefined;
      },
    },
  };
  const timers = [];
  const context = {
    chrome, console, URL,
    setTimeout: (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; },
    clearTimeout,
    fetch: async () => ({ text: async () => '' }),
  };
  loadWorker(context);
  return {
    calls, context,
    evaluate: (code, options) => context._evaluateConsoleInTab(7, code, '{}', options),
    dispose: () => timers.forEach(clearTimeout),
  };
}

test('debugger errors say what failed; only a dead session (attach failure, detached, tab closed) is dropped', async () => {
  // A CDP error that is not about the attachment: an evaluation failure, the session stays.
  const failing = debuggerHarness(() => 'Internal error');
  try {
    const out = await failing.evaluate('1');
    assert.equal(out.type, 'error');
    assert.equal(out.error.kind, 'evaluation');
    assert.match(out.error.message, /Internal error/);
    assert.doesNotMatch(out.error.message, /could not attach/i);
    await failing.evaluate('1');
    assert.equal(failing.calls.attach, 1, 'the cached session is reused');
    assert.equal(failing.calls.detach, 0, 'and never detached');
  } finally { failing.dispose(); }

  const detached = debuggerHarness(() => 'Detached while handling command.');
  try {
    const out = await detached.evaluate('1');
    assert.equal(out.error.kind, 'detached');
    await detached.evaluate('1');
    assert.equal(detached.calls.attach, 2, 'a detached session is dropped, so the next run re-attaches');
  } finally { detached.dispose(); }

  const closed = debuggerHarness(() => 'No tab with given id 7.');
  try {
    assert.equal((await closed.evaluate('1')).error.kind, 'tab-closed');
  } finally { closed.dispose(); }

  const ok = debuggerHarness(() => null);
  try {
    const out = await ok.evaluate('1');
    assert.equal(out.type, 'number', JSON.stringify(out));
  } finally { ok.dispose(); }
});

test('an attach failure is labelled attach', async () => {
  const noopEvent = { addListener() {} };
  const chrome = {
    runtime: { id: 'xray-test', getURL: name => name, onConnect: noopEvent, onMessage: noopEvent, lastError: undefined },
    tabs: {}, action: { onClicked: noopEvent }, commands: { onCommand: noopEvent }, windows: { onRemoved: noopEvent },
    permissions: { onAdded: noopEvent, contains: (_query, callback) => callback(true) },
    debugger: {
      onDetach: noopEvent,
      attach(_target, _version, callback) { chrome.runtime.lastError = { message: 'Cannot access a chrome:// URL' }; callback(); chrome.runtime.lastError = undefined; },
      detach(_target, callback) { callback?.(); },
      sendCommand(_target, _method, _params, callback) { chrome.runtime.lastError = { message: 'Debugger is not attached to the tab with id: 7.' }; callback(); chrome.runtime.lastError = undefined; },
    },
  };
  const context = { chrome, console, URL, setTimeout, clearTimeout, fetch: async () => ({ text: async () => '' }) };
  loadWorker(context);
  const out = await context._evaluateConsoleInTab(7, '1', '{}');
  assert.equal(out.error.kind, 'attach');
  assert.match(out.error.message, /attach/i);
  assert.match(out.error.stack, /chrome:\/\/ URL/);
});

// ── Task 2 fix round 1 ─────────────────────────────────────────────────────────────────────────

test('a non-Error throw reports the thrown value itself (Uncaught 5, Uncaught {a: 1}), even a hostile Proxy', async () => {
  const run = consoleRunner();
  const five = await run('throw 5');
  assert.equal(five.type, 'error');
  assert.equal(five.error.thrown, true);
  assert.equal(JSON.parse(five.error.value), 5);
  assert.equal(five.error.message, '5');
  assert.deepEqual(JSON.parse((await run('throw { a: 1 }')).error.value), { a: 1 });
  const error = await run("throw new RangeError('r')");
  assert.equal(JSON.parse(error.error.value).$xray, 'error');
  assert.equal(JSON.parse(error.error.value).name, 'RangeError');
  assert.equal(error.error.message, 'r');
  // Reading message/stack on this Proxy throws: still the user's exception, never a crash of the wrapper.
  const proxy = await run("throw new Proxy({ a: 1 }, { get() { throw new Error('trap'); } })");
  assert.equal(proxy.type, 'error', JSON.stringify(proxy));
  assert.equal(proxy.error.thrown, true);
  assert.equal(typeof proxy.error.value, 'string');
  // A rejected top-level promise with a plain reason.
  const rejected = await run("Promise.reject('nope')");
  assert.equal(JSON.parse(rejected.error.value), 'nope');
  assert.equal(rejected.meta.promise.state, 'rejected');
});

test('a value XRAY cannot encode is XRAY\'s own failure, not an Uncaught exception', async () => {
  const noopEvent = { addListener() {} };
  const chrome = {
    runtime: { id: 'xray-test', getURL: name => name, onConnect: noopEvent, onMessage: noopEvent },
    tabs: {}, action: { onClicked: noopEvent }, commands: { onCommand: noopEvent },
    windows: { onRemoved: noopEvent }, debugger: { onDetach: noopEvent },
  };
  const context = { chrome, console, URL, setTimeout, clearTimeout, fetch: async () => ({ text: async () => '' }) };
  loadWorker(context);
  const brokenHelpers = "window.XRAY_ConsoleHelpers = { reviveContext: () => ({}), createRuntime: () => ({}), ENCODE_TICKS: 1, encodePending: () => false, encodeRound() {}, encodeBegin: (value) => ({ value }), encodeEnd() { throw new Error('enc'); }, encodeResult() { throw new Error('enc'); }, thrownText: (e) => ({ message: typeof e.message === 'string' ? e.message : '', stack: '' }) };";
  const expression = buildConsoleExpression(context, '1 + 1', '{}', brokenHelpers);
  const out = await vm.runInNewContext(expression, { navigator: {}, console, setTimeout, clearTimeout, Date }, { filename: '<anonymous>' });
  assert.equal(out.type, 'error');
  assert.equal(out.error.internal, true);
  assert.equal(out.error.thrown, undefined);
  assert.match(out.error.message, /^XRAY couldn't display this value: enc$/);
});

test('the pending timer is the one captured before the command ran', async () => {
  const run = consoleRunner({ pendingMs: 40 });
  const out = await run('setTimeout = () => 0; clearTimeout = () => {}; new Promise(() => {})');
  assert.equal(out.meta?.promise?.state, 'pending', JSON.stringify(out));
});

// Runtime.callFunctionOn has no `timeout` (spike: output/console-round2/task-6/timeout.mjs.txt), so
// the worker caps the synchronous part itself and stops it with Runtime.terminateExecution — only
// while that call is still running, never while the command merely awaits.
test('a synchronous loop that hits the cap is a timeout (the worker terminates it), and so is no answer at all', async () => {
  const loop = debuggerHarness(() => ({ never: true }));
  try {
    const out = await loop.evaluate('while (true) {}', { timeoutMs: 60, graceMs: 2000 });
    assert.equal(out.error.kind, 'timeout', JSON.stringify(out));
    assert.match(out.error.message, /^Execution timeout/);
    assert.equal(loop.calls.terminate, 1, 'the running loop is stopped');
    await loop.evaluate('1', { timeoutMs: 60, graceMs: 2000 });
    assert.equal(loop.calls.attach, 1, 'a timeout keeps the session');
    assert.equal(loop.calls.scopes, 1, 'and the scope');
  } finally { loop.dispose(); }
  // The command started and awaits something that never settles: a timeout, nothing terminated.
  const silent = debuggerHarness(() => ({ awaitNever: true }));
  try {
    const out = await silent.evaluate('1', { timeoutMs: 20, graceMs: 20 });
    assert.equal(out.error.kind, 'timeout');
    assert.equal(silent.calls.terminate, 0, 'an awaiting command is never terminated (the page would lose its next task)');
  } finally { silent.dispose(); }
  // A CDP rejection at or after the cap is a timeout too.
  const late = debuggerHarness(() => ({ error: 'Internal error', delay: 80 }));
  try {
    assert.equal((await late.evaluate('1', { timeoutMs: 60, graceMs: 2000 })).error.kind, 'timeout');
  } finally { late.dispose(); }
  // An "Internal error" well before the cap stays an evaluation failure.
  const early = debuggerHarness(() => 'Internal error');
  try {
    assert.equal((await early.evaluate('1', { timeoutMs: 5000, graceMs: 20 })).error.kind, 'evaluation');
  } finally { early.dispose(); }
});

test('navigation keeps the debugger session; a closed target drops it', async () => {
  const navigated = debuggerHarness(() => 'Inspected target navigated or closed');
  try {
    assert.equal((await navigated.evaluate('1')).error.kind, 'evaluation');
    await navigated.evaluate('1');
    assert.equal(navigated.calls.attach, 1);
    assert.equal(navigated.calls.detach, 0);
  } finally { navigated.dispose(); }
  const closed = debuggerHarness(() => 'Target closed.');
  try {
    assert.equal((await closed.evaluate('1')).error.kind, 'tab-closed');
  } finally { closed.dispose(); }
});

test('an attach whose Runtime.enable fails is detached again', async () => {
  const harness = debuggerHarness(() => null, { enableFails: true });
  try {
    const out = await harness.evaluate('1');
    assert.equal(out.error.kind, 'attach');
    assert.equal(harness.calls.detach, 1, 'no attachment is left behind without a session');
  } finally { harness.dispose(); }
});

test('a command that does not compile is located in the command', async () => {
  const harness = debuggerHarness((_calls, params) => {
    // The run is a callFunctionOn function; compile errors are located in its text.
    const lines = params.functionDeclaration.split('\n');
    const marker = lines.findIndex((line) => line === '// __xray:command');
    // `<box>((1 +* 2));` (the box name carries the scope's suffix): the `*` sits 3 past `((`.
    const box = /const (__x[a-z0-9]+_box) = /i.exec(params.functionDeclaration)[1];
    return { exceptionDetails: { text: 'Uncaught', lineNumber: marker + 1, columnNumber: box.length + 2 + 3, exception: { description: "SyntaxError: Unexpected token '*'" } } };
  });
  try {
    const out = await harness.evaluate('1 +* 2');
    assert.equal(out.error.thrown, true);
    assert.equal(out.error.message, "SyntaxError: Unexpected token '*'");
    assert.equal(out.error.location, '<anonymous>:1:4');
  } finally { harness.dispose(); }
});

test('a thrown value with no readable message and no encoding is marked unreadable', async () => {
  const noopEvent = { addListener() {} };
  const chrome = {
    runtime: { id: 'xray-test', getURL: name => name, onConnect: noopEvent, onMessage: noopEvent },
    tabs: {}, action: { onClicked: noopEvent }, commands: { onCommand: noopEvent },
    windows: { onRemoved: noopEvent }, debugger: { onDetach: noopEvent },
  };
  const context = { chrome, console, URL, setTimeout, clearTimeout, fetch: async () => ({ text: async () => '' }) };
  loadWorker(context);
  const brokenHelpers = "window.XRAY_ConsoleHelpers = { reviveContext: () => ({}), createRuntime: () => ({}), ENCODE_TICKS: 1, encodePending: () => false, encodeRound() {}, encodeBegin: (value) => ({ value }), encodeEnd() { throw new Error('enc'); }, encodeResult() { throw new Error('enc'); }, thrownText: (e) => ({ message: typeof e.message === 'string' ? e.message : '', stack: '' }) };";
  const expression = buildConsoleExpression(context, "throw new Proxy({}, { get() { throw 1; } })", '{}', brokenHelpers);
  const out = await vm.runInNewContext(expression, { navigator: {}, console, setTimeout, clearTimeout, Date }, { filename: '<anonymous>' });
  assert.equal(out.type, 'error');
  assert.equal(out.error.thrown, true);
  assert.equal(out.error.unreadable, true, JSON.stringify(out));
  assert.equal(out.error.value, undefined);
  // A readable throw is never marked.
  const plain = buildConsoleExpression(context, "throw new Error('x')", '{}', brokenHelpers);
  assert.equal((await vm.runInNewContext(plain, { navigator: {}, console, setTimeout, clearTimeout, Date }, { filename: '<anonymous>' })).error.unreadable, undefined);
});

// ── Console round 2, Task 6 (spec §2): the CDP-held scope ──────────────────────────────────────
//
// A fake browser: one tab whose page is a vm realm, a CDP that keeps remote objects by id (as
// Chrome does, per page load), an attachment that outlives a worker, and one
// chrome.storage.session shared by every worker instance. A reload makes every old id answer
// "Cannot find context with specified id"; a detach drops them ("Could not find object with given
// id") — the two messages the spike recorded (output/console-round2/task-6/mech.mjs.txt).
function fakeBrowser() {
  const browser = { attached: false, generation: 0, objects: new Map(), seq: 0, realm: null, log: [], storage: new Map() };
  // `pageScript` runs at every page load, before XRAY creates anything (a page's own scripts).
  browser.pageScript = '';
  browser.reload = () => {
    browser.generation++;
    browser.objects = new Map();
    browser.realm = vm.createContext({ console, setTimeout, clearTimeout, navigator: {}, Date });
    // Runtime.awaitPromise waits natively: the realm's own `then`, taken before any page script.
    browser.nativeThen = vm.runInContext('Promise.prototype.then', browser.realm);
    if (browser.pageScript) vm.runInContext(browser.pageScript, browser.realm);
  };
  browser.dropObjects = () => { browser.objects = new Map(); };
  browser.reload();
  const register = (value) => {
    const id = `${browser.generation}.${++browser.seq}`;
    browser.objects.set(id, value);
    return id;
  };
  // A RemoteObject as CDP describes one (functions carry their source text as `description`).
  const remote = (value) => {
    if (value === undefined) return { type: 'undefined' };
    if (value === null) return { type: 'object', subtype: 'null', value: null };
    if (typeof value === 'function') return { type: 'function', className: 'Function', description: Function.prototype.toString.call(value), objectId: register(value) };
    if (typeof value === 'object') return { type: 'object', className: 'Object', description: 'Object', objectId: register(value) };
    return { type: typeof value, value, description: String(value) };
  };
  const lookup = (id) => {
    if (Number(String(id).split('.')[0]) !== browser.generation) throw new Error('Cannot find context with specified id');
    if (!browser.objects.has(id)) throw new Error('Could not find object with given id');
    return browser.objects.get(id);
  };
  browser.cdp = async (method, params) => {
    browser.log.push({ method, params });
    if (method === 'Runtime.enable' || method === 'Runtime.terminateExecution') return {};
    if (method === 'Runtime.releaseObject') { browser.objects.delete(params.objectId); return {}; }
    if (method === 'Runtime.evaluate') {
      const value = vm.runInContext(params.expression, browser.realm, { filename: '<anonymous>' });
      return params.returnByValue === false ? { result: { type: 'object', objectId: register(value) } } : { result: { value } };
    }
    if (method === 'Runtime.callFunctionOn') {
      const self = lookup(params.objectId);
      let fn;
      try {
        fn = vm.runInContext(`(${params.functionDeclaration})`, browser.realm, { filename: '<anonymous>' });
      } catch (err) {
        return { exceptionDetails: { text: 'Uncaught', lineNumber: 0, columnNumber: 0, exception: { description: String(err) } } };
      }
      // As CDP does (output/console-round2/task-6/argvalue.mjs.txt): built natively — no page
      // setter or JSON.parse runs — with a "__proto__" key becoming the prototype.
      // Keys sorted, as chrome.debugger passes an argument object (a dictionary).
      const sorted = (value) => JSON.stringify(value, (key, item) => (item && typeof item === 'object' && !Array.isArray(item)
        ? Object.fromEntries(Object.keys(item).sort().map((name) => [name, item[name]])) : item));
      const args = (params.arguments || []).map((arg) => (arg.value !== null && typeof arg.value === 'object' ? vm.runInContext(`(${sorted(arg.value)})`, browser.realm) : arg.value));
      let value;
      try {
        value = Reflect.apply(fn, self, args);
      } catch (err) {
        return { exceptionDetails: { text: 'Uncaught', lineNumber: 0, columnNumber: 0, exception: { description: String(err) } } };
      }
      if (params.returnByValue) return { result: { type: typeof value, value: value === undefined ? undefined : JSON.parse(JSON.stringify(value)) } };
      // Live completion (Task 7) reads the RemoteObject's type: a primitive has no objectId.
      if (params.throwOnSideEffect) return { result: remote(value, params.objectGroup) };
      // A primitive comes back by value, as CDP does (a run skipped past its deadline is a string).
      if (value === null || (typeof value !== 'object' && typeof value !== 'function')) return { result: remote(value) };
      return { result: { type: 'object', objectId: register(value) } };
    }
    // Task 7: descriptors only, as CDP reads them — no getter and no Proxy trap runs (a Proxy
    // answers its internal slots only, spike output/console-round2/task-7/spike.mjs.txt).
    if (method === 'Runtime.getProperties') {
      const target = lookup(params.objectId);
      if (util.types.isProxy(target)) return { result: [], internalProperties: [{ name: '[[Target]]', value: { type: 'object' } }] };
      const result = [];
      for (const name of Object.getOwnPropertyNames(target)) {
        if (params.nonIndexedPropertiesOnly && /^(?:0|[1-9]\d*)$/.test(name)) continue;
        const d = Object.getOwnPropertyDescriptor(target, name);
        const out = { name, configurable: d.configurable, enumerable: d.enumerable, isOwn: true };
        if ('value' in d) out.value = remote(d.value, params.objectGroup);
        else { out.get = remote(d.get, params.objectGroup); out.set = remote(d.set, params.objectGroup); }
        result.push(out);
      }
      const proto = Object.getPrototypeOf(target);
      return { result, internalProperties: proto ? [{ name: '[[Prototype]]', value: remote(proto, params.objectGroup) }] : [] };
    }
    if (method === 'Runtime.releaseObjectGroup') return {};
    // Top-level let/const/class names of the page (not properties of the global object).
    if (method === 'Runtime.globalLexicalScopeNames') return { names: browser.lexicalNames || [] };
    if (method === 'Runtime.awaitPromise') {
      const promise = lookup(params.promiseObjectId);
      await new Promise((resolve) => Reflect.apply(browser.nativeThen, promise, [resolve, resolve]));
      return { result: { type: 'undefined' } };
    }
    throw new Error(`unexpected ${method}`);
  };
  browser.session = {
    async get(keys) {
      const all = Object.fromEntries(browser.storage);
      if (keys == null) return JSON.parse(JSON.stringify(all));
      const out = {};
      for (const key of [].concat(keys)) if (browser.storage.has(key)) out[key] = JSON.parse(JSON.stringify(browser.storage.get(key)));
      return out;
    },
    async set(items) { for (const [key, value] of Object.entries(items)) browser.storage.set(key, JSON.parse(JSON.stringify(value))); },
    async remove(keys) { for (const key of [].concat(keys)) browser.storage.delete(key); },
  };
  return browser;
}

// One service-worker instance on the fake browser. `timers` records every setTimeout (ms).
function scopeWorker(browser, { onUpdated = [], onRemoved = [] } = {}) {
  const listeners = { message: [], detach: [] };
  const timers = [];
  const calls = { detach: 0 };
  const chrome = {
    runtime: { id: 'xray-test', getURL: name => name, onConnect: { addListener() {} }, onMessage: { addListener: (fn) => listeners.message.push(fn) }, lastError: undefined },
    tabs: { onUpdated: { addListener: (fn) => onUpdated.push(fn) }, onRemoved: { addListener: (fn) => onRemoved.push(fn) } }, action: { onClicked: { addListener() {} } }, commands: { onCommand: { addListener() {} } },
    windows: { onRemoved: { addListener() {} } },
    permissions: { onAdded: { addListener() {} }, contains: (_query, callback) => callback(true) },
    storage: { session: browser.session },
    debugger: {
      onDetach: { addListener: (fn) => listeners.detach.push(fn) },
      attach(_target, _version, callback) {
        if (browser.attached) chrome.runtime.lastError = { message: 'Another debugger is already attached to the tab with id: 7.' };
        browser.attached = true;
        callback();
        chrome.runtime.lastError = undefined;
      },
      detach(_target, callback) {
        calls.detach++;
        browser.attached = false;
        browser.dropObjects();
        callback?.();
      },
      sendCommand(_target, method, params, callback) {
        browser.cdp(method, params).then(
          (result) => callback(result),
          (err) => { chrome.runtime.lastError = { message: err.message }; callback(undefined); chrome.runtime.lastError = undefined; },
        );
      },
    },
  };
  const context = {
    chrome, console, URL, Date,
    setTimeout: (fn, ms) => { const id = setTimeout(fn, ms); id.unref?.(); timers.push({ id, ms }); return id; },
    clearTimeout,
    fetch: async () => ({ text: async () => read('shared/console-helpers.js') }),
  };
  loadWorker(context);
  const entry = { id: 'e1', type: 'api', method: 'GET', url: 'https://x.test/api', urlPath: '/api', status: 200, responseDecrypted: { users: [{ id: 1 }, { id: 2 }, { id: 3 }] } };
  const contextText = JSON.stringify({ currentEntry: entry, entries: [entry], scope: {}, pins: {} });
  return {
    context, calls, timers, listeners,
    async run(code, text = contextText) {
      const out = await context._evaluateConsoleInTab(7, code, text);
      return typeof out?.result === 'string' ? { ...out, value: JSON.parse(out.result) } : out;
    },
    complete: (expr, options = { attach: true }) => context._completeConsoleInTab(7, expr, options),
    message: (msg) => new Promise((resolve) => {
      const keep = listeners.message[0](msg, { id: 'xray-test', tab: { id: 7 } }, resolve);
      if (keep !== true) resolve(undefined);
    }),
    dispose: () => timers.forEach(({ id }) => clearTimeout(id)),
  };
}

const scopeCreations = (browser) => browser.log.filter(({ method, params }) => method === 'Runtime.evaluate' && params.returnByValue === false).length;
const settle = () => new Promise((resolve) => setTimeout(resolve, 5));

test('the first run creates the scope once, stores its objectId in session storage, and later runs reuse it', async () => {
  const browser = fakeBrowser();
  const worker = scopeWorker(browser);
  try {
    assert.equal((await worker.run('const u = res.users')).type, 'undefined');
    assert.equal((await worker.run('u.length')).value, 3, 'a declaration persists into the next command');
    assert.equal(scopeCreations(browser), 1);
    const created = browser.log.find(({ method, params }) => method === 'Runtime.evaluate' && params.returnByValue === false);
    assert.match(created.params.expression, /const window = \{ __proto__: null \};/, 'helpers built in the scope against a shadowed window');
    assert.match(created.params.expression, /\/\/# sourceURL=xray-console-scope\.js$/);
    const stored = browser.storage.get('xray_console_scope:7');
    assert.equal(typeof stored?.objectId, 'string');
    assert.deepEqual(stored.declared, { u: 'const' }, 'the scope\'s declarations (the reset note and the next bindings depend on them)');
    // Each command runs against the scope with the context as an ARGUMENT VALUE, never source —
    // and only the members it uses: `u.length` names no context name, so nothing travels.
    const calls = browser.log.filter(({ method }) => method === 'Runtime.callFunctionOn');
    // The run itself, then XRAY's own steps (take, value, finish), each a fixed function of the key.
    const runs = calls.filter(({ params }) => !/^function \(key/.test(params.functionDeclaration));
    const takes = calls.filter(({ params }) => /\.take\(\)/.test(params.functionDeclaration));
    const inspects = calls.filter(({ params }) => /\.value\(\)/.test(params.functionDeclaration));
    assert.equal(runs.length, 2);
    assert.equal(takes.length, 4, 'state after the statements, then the answer: each a synchronous read by value');
    assert.equal(inspects.length, 2, 'the value goes to CDP as a RemoteObject: V8 says whether it is a promise');
    for (const { params } of takes) assert.equal(params.returnByValue, true);
    for (const { params } of inspects) assert.equal(params.returnByValue, false);
    for (const { params } of runs) {
      assert.equal(params.objectId, stored.objectId);
      assert.equal(params.arguments[0].value, stored.key, 'the scope opens only with its key');
      assert.equal(typeof params.arguments[1].value, 'object', 'the context is a value, never text the page parses');
      assert.equal(params.functionDeclaration.includes('responseDecrypted'), false, 'the context is never interpolated');
      assert.match(params.functionDeclaration, /^function \(__x[a-z0-9]+_key, __x[a-z0-9]+_context, __x[a-z0-9]+_deadline\) \{\n {2}'use strict';/i, 'every XRAY frame is strict, and the run is not async');
      assert.doesNotMatch(params.functionDeclaration, /\bwith \(/, 'no with');
      assert.equal(params.awaitPromise, false, 'the synchronous part is awaited separately (it can be terminated)');
    }
    // Objects travel as ordered pairs (encodeContext); decoded here to read them.
    const decoded = (node) => (node && typeof node === 'object'
      ? (node.t === 'a' ? node.v.map(decoded) : Object.fromEntries(Array.from({ length: node.v.length / 2 }, (_, i) => [node.v[2 * i], decoded(node.v[2 * i + 1])])))
      : node);
    const first = JSON.parse(JSON.stringify(decoded(runs[0].params.arguments[1].value)));
    assert.equal(first.currentEntry.responseDecrypted.users.length, 3, '`res` needs the selected entry');
    assert.deepEqual(first.entries, [], 'but not the entry list');
    assert.deepEqual(JSON.parse(JSON.stringify(decoded(runs[1].params.arguments[1].value))), { currentEntry: null, entries: [], values: {}, scope: {}, pins: {} }, 'a command that names no context name sends none');
    const n = await worker.run('const n = 1');
    assert.equal(n.scopeReset, undefined);
    assert.equal((await worker.run('n = 2')).error.message, 'Assignment to constant variable.');
  } finally { worker.dispose(); }
});

test('scope reset on reload: a new scope, the command still runs, and the result says scopeReset once', async () => {
  const browser = fakeBrowser();
  const worker = scopeWorker(browser);
  try {
    await worker.run('const u = res.users');
    browser.reload();
    const after = await worker.run('typeof u');
    assert.equal(after.value, 'undefined', JSON.stringify(after));
    assert.equal(after.scopeReset, true);
    assert.equal(scopeCreations(browser), 2);
    assert.equal((await worker.run('res.users.length')).scopeReset, undefined, 'the note shows once');
    // An error result carries the note too (`u` after a reload is the common case).
    await worker.run('const v = 1');
    browser.reload();
    const missing = await worker.run('v');
    assert.equal(missing.type, 'error');
    assert.equal(missing.scopeReset, true);
    // A scope that held no declarations is replaced silently.
    browser.reload();
    assert.equal((await worker.run('1 + 1')).scopeReset, undefined);
  } finally { worker.dispose(); }
});

test('scope after worker restart: the stored objectId is reused while the debugger stays attached', async () => {
  const browser = fakeBrowser();
  const first = scopeWorker(browser);
  await first.run('const u = res.users');
  first.dispose();
  // A new worker instance: in-memory maps are empty, the attachment and session storage remain.
  const second = scopeWorker(browser);
  try {
    const out = await second.run('u.length');
    assert.equal(out.value, 3, JSON.stringify(out));
    assert.equal(out.scopeReset, undefined);
    assert.equal(scopeCreations(browser), 1, 'no second scope');
  } finally { second.dispose(); }
});

test('a detached debugger loses the scope: the next run re-attaches, creates a new one and notes the reset', async () => {
  const browser = fakeBrowser();
  const worker = scopeWorker(browser);
  try {
    await worker.run('const u = res.users');
    // The user closed Chrome's debugging bar.
    browser.attached = false;
    browser.dropObjects();
    worker.listeners.detach.forEach((fn) => fn({ tabId: 7 }, 'canceled_by_user'));
    const out = await worker.run('typeof u');
    assert.equal(out.value, 'undefined');
    assert.equal(out.scopeReset, true);
  } finally { worker.dispose(); }
});

test('the Console prompt focus keeps the debugger 5 min instead of 30 s, and blur brings it back', async () => {
  const browser = fakeBrowser();
  const worker = scopeWorker(browser);
  try {
    // The last idle-detach timer armed (the run's own cap timers are shorter).
    const idleMs = () => worker.timers.filter(({ ms }) => ms === 30000 || ms === 300000).at(-1)?.ms;
    await worker.run('1');
    assert.equal(idleMs(), 30000);
    await worker.message({ type: 'xray:console-focus', focused: true });
    assert.equal(idleMs(), 300000);
    await settle();
    assert.equal(browser.storage.get('xray_console_idle:7')?.focused, true);
    await worker.run('2');
    assert.equal(idleMs(), 300000, 'a run while focused keeps the long window');
    await worker.message({ type: 'xray:console-focus', focused: false });
    assert.equal(idleMs(), 30000);
    await settle();
    const idle = browser.storage.get('xray_console_idle:7');
    assert.equal(idle.focused, false);
    assert.ok(Math.abs(idle.detachAt - (Date.now() + 30000)) < 1000, JSON.stringify(idle));
  } finally { worker.dispose(); }
});

test('a worker restart re-arms the idle detach from session storage', async () => {
  const browser = fakeBrowser();
  browser.attached = true;
  browser.storage.set('xray_console_idle:7', { detachAt: Date.now() + 40, focused: false });
  const worker = scopeWorker(browser);
  try {
    await settle();
    const armed = worker.timers.find(({ ms }) => ms <= 40);
    assert.ok(armed, JSON.stringify(worker.timers.map(({ ms }) => ms)));
    await new Promise((resolve) => setTimeout(resolve, 80));
    assert.equal(worker.calls.detach, 1, 'the debugger is detached when the stored deadline passes');
    assert.equal(browser.storage.has('xray_console_idle:7'), false);
  } finally { worker.dispose(); }
});

// ── Task 6 fix round 1: no page frame ever reaches the scope or the context ─────────────────────
//
// Review (Critical 1): V8 hands a page's Error.prepareStackTrace the receiver and function of every
// SLOPPY frame (CallSite.getThis / getFunction), and a page function's `.caller`/`.arguments` too.
// With `with (scope)` the run function's receiver was the scope, so a page read every declared and
// context name and could rewire the internals. The page below installs its probes at load, before
// XRAY creates anything, and also wraps JSON.parse and Object.defineProperty (the context used to
// be parsed with the page's JSON.parse). Nothing it sees may hold the scope or the context.
const LEAK_PROBE = String.raw`
globalThis.stolen = [];
const describe = (value) => {
  let text = '';
  try { text = typeof value === 'function' ? Function.prototype.toString.call(value) : JSON.stringify(value, (k, x) => (typeof x === 'bigint' ? String(x) : x)) || ''; } catch { text = ''; }
  try { if (value && typeof value === 'object' && ('__xrayScope' in value || 'open' in value || 'refresh' in value)) text += ' [xray scope]'; } catch {}
  return text;
};
const check = (how, value) => {
  if (value == null || value === globalThis) return;
  const text = describe(value);
  if (/SECRET|__xray|xray scope/.test(text)) stolen.push(how + ': ' + text.slice(0, 120));
};
Error.prepareStackTrace = (error, sites) => {
  for (const site of sites) {
    let self; let fn;
    try { self = site.getThis(); } catch {}
    try { fn = site.getFunction(); } catch {}
    check('getThis', self);
    check('getFunction', fn);
    if (typeof fn === 'function') {
      try { check('arguments', fn.arguments && [...fn.arguments]); } catch {}
      try { check('caller', fn.caller); } catch {}
    }
  }
  return String(error && error.message);
};
const parse = JSON.parse;
JSON.parse = function (text, reviver) { check('JSON.parse', String(text)); return parse(text, reviver); };
const define = Object.defineProperty;
Object.defineProperty = function (target, key, descriptor) { check('defineProperty', descriptor && descriptor.value); return define(target, key, descriptor); };
globalThis.pageFn = function pageFn(x) {
  void new Error('probe').stack;
  try { check('pageFn.caller', pageFn.caller); } catch {}
  return x + 1;
};
globalThis.appState = { get probe() { void new Error('getter').stack; return 2; } };
`;

test('no page frame reaches the scope or the context: prepareStackTrace, caller, wrapped JSON.parse/defineProperty', async () => {
  const browser = fakeBrowser();
  browser.pageScript = LEAK_PROBE;
  browser.reload();
  const worker = scopeWorker(browser);
  const secret = { id: 's', type: 'api', method: 'GET', url: 'https://other.test/SECRET-URL', urlPath: '/api', status: 200, responseDecrypted: { users: [{ id: 1 }, { id: 2 }, { id: 3 }], jwt: 'SECRET-JWT' } };
  const text = JSON.stringify({ currentEntry: secret, entries: [secret], scope: { temp1: 'SECRET-SAVED' }, pins: {} });
  const stolen = () => JSON.parse(vm.runInContext('JSON.stringify(stolen)', browser.realm));
  try {
    // A synchronous throw (XRAY reads its stack), after declaring from the context.
    const thrown = await worker.run('const u = res.users; nope', text);
    assert.equal(thrown.type, 'error');
    assert.match(thrown.error.message, /nope/);
    // A const assignment in a later command.
    await worker.run('const n = 1', text);
    assert.equal((await worker.run('n = 2', text)).error.message, 'Assignment to constant variable.');
    // A call into a page function and a page getter, both building a stack.
    assert.equal((await worker.run('u.length + pageFn(1)', text)).value, 5);
    assert.equal((await worker.run('appState.probe + temp1.length', text)).value, 2 + 'SECRET-SAVED'.length);
    assert.equal((await worker.run('res.jwt', text)).value, 'SECRET-JWT', 'the command itself still reads the context');
    assert.deepEqual(stolen(), []);
  } finally { worker.dispose(); }
});

test('a page too busy to create the scope answers a timeout, and the next run tries again', async () => {
  const browser = fakeBrowser();
  const worker = scopeWorker(browser);
  const realCdp = browser.cdp;
  let hang = true;
  browser.cdp = (method, params) => (hang && method === 'Runtime.evaluate' && params.returnByValue === false ? new Promise(() => {}) : realCdp(method, params));
  try {
    const out = await worker.context._evaluateConsoleInTab(7, '1 + 1', '{}', { timeoutMs: 40, graceMs: 20 });
    assert.equal(out.error?.kind, 'timeout', JSON.stringify(out));
    hang = false;
    const next = await worker.run('1 + 1');
    assert.equal(next.value, 2, JSON.stringify(next));
  } finally { worker.dispose(); }
});

test('runs are serialized per tab, and a command that already started is never run twice', async () => {
  const browser = fakeBrowser();
  const worker = scopeWorker(browser);
  try {
    // Two runs at once: the second starts after the first finished.
    const order = [];
    vm.runInContext('globalThis.order = []', browser.realm);
    const first = worker.run('await new Promise((r) => setTimeout(r, 30)); order.push("first"); 1');
    const second = worker.run('order.push("second"); 2');
    await Promise.all([first, second]);
    assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify(order)', browser.realm)), ['first', 'second']);
    void order;
    // The scope is lost after the command started (awaitPromise fails): no retry.
    vm.runInContext('globalThis.calls = 0', browser.realm);
    const realCdp = browser.cdp;
    browser.cdp = (method, params) => (method === 'Runtime.awaitPromise' ? Promise.reject(new Error('Could not find object with given id')) : realCdp(method, params));
    const out = await worker.run('calls++');
    assert.equal(out.type, 'error');
    browser.cdp = realCdp;
    assert.equal(vm.runInContext('calls', browser.realm), 1, 'the command ran once');
  } finally { worker.dispose(); }
});

test('a navigation clears the Console prompt focus (its page is gone)', async () => {
  const browser = fakeBrowser();
  const updated = [];
  const worker = scopeWorker(browser, { onUpdated: updated });
  try {
    await worker.run('1');
    await worker.message({ type: 'xray:console-focus', focused: true });
    updated.forEach((fn) => fn(7, { status: 'loading' }));
    const idle = worker.timers.filter(({ ms }) => ms === 30000 || ms === 300000).at(-1).ms;
    assert.equal(idle, 30000);
  } finally { worker.dispose(); }
});

test('focus reported by the reloaded page survives the first run on the new scope', async () => {
  const browser = fakeBrowser();
  const updated = [];
  const worker = scopeWorker(browser, { onUpdated: updated });
  try {
    await worker.run('const u = 1');
    updated.forEach((fn) => fn(7, { status: 'loading' }));
    browser.reload();
    await worker.message({ type: 'xray:console-focus', focused: true });
    const out = await worker.run('typeof u');
    assert.equal(out.scopeReset, true);
    const idle = worker.timers.filter(({ ms }) => ms === 30000 || ms === 300000).at(-1).ms;
    assert.equal(idle, 300000, 'the new page\'s prompt still holds the long window');
  } finally { worker.dispose(); }
});

test('a scope the page makes after the creation timed out is released, never left behind', async () => {
  const browser = fakeBrowser();
  const worker = scopeWorker(browser);
  const realCdp = browser.cdp;
  browser.cdp = (method, params) => (method === 'Runtime.evaluate' && params.returnByValue === false
    ? new Promise((resolve) => setTimeout(() => resolve(realCdp(method, params)), 80))
    : realCdp(method, params));
  try {
    const out = await worker.context._evaluateConsoleInTab(7, '1 + 1', '{}', { timeoutMs: 30, graceMs: 20 });
    assert.equal(out.error?.kind, 'timeout');
    await new Promise((resolve) => setTimeout(resolve, 150));
    const created = browser.log.find(({ method, params }) => method === 'Runtime.evaluate' && params.returnByValue === false);
    assert.ok(created);
    assert.ok(browser.log.some(({ method }) => method === 'Runtime.releaseObject'), 'the late scope object is released');
  } finally { worker.dispose(); }
});

// ── Console round 2, Task 7 (spec §3 source 4): live page completion ───────────────────────────
//
// `<path>.` asks the page through the debugger: a strict function on the scope returns the object
// the path names (throwOnSideEffect: a getter or Proxy trap with a side effect throws instead of
// running it), and Runtime.getProperties lists its own and inherited names from descriptors — no
// page code runs to enumerate them. Bare identifiers ask for the page's globals once per scope.
const LIVE_PAGE = String.raw`
globalThis.hits = 0;
globalThis.appState = { user: { id: 1, name: 'Ada' }, count: 2 };
Object.defineProperty(appState, 'lazy', { get() { hits++; return 1; }, enumerable: true });
Object.defineProperty(appState, '__proto__', { value: 'own', enumerable: true });
globalThis.formatPrice = function formatPrice(cents, currency = 'EUR') { return cents / 100 + currency; };
globalThis.big = {};
for (let i = 0; i < 700; i++) big['k' + i] = i;
`;
// The worker answers from its own realm: compared as plain data.
const plain = (value) => JSON.parse(JSON.stringify(value));
const liveCalls = (browser) => browser.log.filter(({ method, params }) => method === 'Runtime.callFunctionOn' && /\.walk\(/.test(params.functionDeclaration));

test('live completion walks and lists in the page by value: getters listed, never invoked; __proto__ skipped; capped at 500; no remote object of a value', async () => {
  const browser = fakeBrowser();
  browser.pageScript = LIVE_PAGE;
  browser.reload();
  const worker = scopeWorker(browser);
  try {
    const out = plain(await worker.complete('appState'));
    const byName = Object.fromEntries(out.names.map((n) => [n.name, n]));
    assert.deepEqual(byName.user, { name: 'user', kind: 'property', own: true });
    assert.deepEqual(byName.lazy, { name: 'lazy', kind: 'getter', own: true });
    assert.equal(byName.hasOwnProperty?.own, false, 'the prototype chain too');
    assert.equal(out.names.some((n) => n.name === '__proto__'), false);
    assert.equal(vm.runInContext('hits', browser.realm), 0, 'the getter never ran');
    const [call] = liveCalls(browser);
    assert.equal(call.params.throwOnSideEffect, true, 'defence in depth');
    assert.equal(call.params.returnByValue, true, 'the answer is a string built in the page: no remote object of a value');
    assert.equal(call.params.objectGroup, 'xray-complete');
    assert.equal('timeout' in call.params, false, 'callFunctionOn has no timeout');
    assert.match(call.params.functionDeclaration, /^function \(__x[a-z0-9]+_key, __x[a-z0-9]+_path, __x[a-z0-9]+_deadline\) \{\n {2}'use strict';\n {2}try \{\n {4}return this\.open\(__x[a-z0-9]+_key\)\.walk\(__x[a-z0-9]+_path, \(\) => appState, __x[a-z0-9]+_deadline\);\n {2}\} catch \{\n {4}return null;\n {2}\}\n\}$/);
    assert.deepEqual(plain(call.params.arguments[1].value), ['appState', 0], 'the path travels as data');
    assert.equal(browser.log.some(({ method, params }) => method === 'Runtime.evaluate' && /appState/.test(params.expression || '')), false, 'never Runtime.evaluate on the expression');
    assert.equal(browser.log.some(({ method }) => method === 'Runtime.getProperties'), false, 'CDP never describes a page value (Error formatting runs page code)');
    assert.equal(browser.log.some(({ method }) => method === 'Runtime.terminateExecution'), false);
    assert.ok(browser.log.some(({ method, params }) => method === 'Runtime.releaseObjectGroup' && params.objectGroup === 'xray-complete'));
    const big = plain(await worker.complete('big'));
    assert.deepEqual([big.names.length, big.capped], [500, true], 'capped at 500, and says so');
    const text = plain(await worker.complete('appState.user.name'));
    assert.deepEqual([text.names, text.type], [[], 'string'], 'a primitive answers its type (the panel lists its prototype from the catalogue)');
    assert.equal(read('background.js').match(/const CONSOLE_COMPLETE_TIMEOUT_MS = (\d+);/)?.[1], '250');
  } finally { worker.dispose(); }
});

test('live completion: a declared root comes from the scope; globals carry page names, params and the declared names; cached until a Run or a navigation', async () => {
  const browser = fakeBrowser();
  browser.pageScript = LIVE_PAGE;
  browser.lexicalNames = ['lexState'];
  browser.reload();
  const updated = [];
  const worker = scopeWorker(browser, { onUpdated: updated });
  try {
    await worker.run('const rows = res.users');
    const item = plain(await worker.complete('rows[0]'));
    assert.deepEqual(item.names.filter((n) => n.own).map((n) => n.name), ['id']);
    const walked = liveCalls(browser).at(-1).params;
    assert.deepEqual(plain(walked.arguments[1].value), ['rows', 1, 0], 'a declared root is read from the scope');
    assert.match(walked.functionDeclaration, /\.walk\(__x[a-z0-9]+_path, null, __x[a-z0-9]+_deadline\)/, 'and never as an identifier');
    const globals = plain(await worker.complete(null));
    // The globals list runs no page code at all; a path walk keeps throwOnSideEffect.
    assert.equal(liveCalls(browser).at(-1).params.throwOnSideEffect, false);
    const formatPrice = globals.names.find((n) => n.name === 'formatPrice');
    assert.deepEqual(formatPrice, { name: 'formatPrice', kind: 'function', own: true, params: "(cents, currency = 'EUR')" });
    assert.ok(globals.names.some((n) => n.name === 'appState'));
    assert.deepEqual(globals.names.find((n) => n.name === 'lexState'), { name: 'lexState', kind: 'property', own: true }, 'a page `const` is a global too');
    assert.deepEqual(globals.declared, [{ name: 'rows', kind: 'const' }]);
    const before = liveCalls(browser).length;
    assert.deepEqual(plain(await worker.complete(null)).names, globals.names, 'cached per scope');
    assert.equal(liveCalls(browser).length, before, 'no second page call');
    // For 5 s only (review Important 1: globals a page adds later must show up).
    vm.runInContext('for (const entry of _liveGlobals.values()) entry.at -= 5001', worker.context);
    await worker.complete(null);
    assert.equal(liveCalls(browser).length, before + 1, 'older than 5 s: asked again');
    await worker.run('let more = 1');
    const after = plain(await worker.complete(null));
    assert.equal(liveCalls(browser).length, before + 2, 'a Run refreshes the globals');
    assert.deepEqual(after.declared.map((d) => d.name).sort(), ['more', 'rows']);
    updated.forEach((fn) => fn(7, { status: 'loading' }));
    await worker.complete(null);
    assert.equal(liveCalls(browser).length, before + 3, 'a navigation refreshes them too');
  } finally { worker.dispose(); }
});

test('live completion sends only a plain path: calls, assignments and context names never reach the page', async () => {
  const browser = fakeBrowser();
  browser.pageScript = LIVE_PAGE;
  browser.reload();
  const worker = scopeWorker(browser);
  try {
    for (const expr of ['fetch(u)', 'appState.user.toString()', 'x = 1', 'res', 'pick', 'appState["a" + 1]', 42, { toString: () => 'appState' }]) {
      const out = await worker.complete(expr);
      assert.equal(out.names, null, String(expr));
    }
    assert.equal(liveCalls(browser).length, 0);
    assert.equal(browser.log.some(({ method }) => method === 'Runtime.callFunctionOn'), false, 'nothing ran at all');
  } finally { worker.dispose(); }
});

test('a live completion with no answer at 250 ms is abandoned, never terminated (the page may be busy with its own task), then backs off', async () => {
  const harness = debuggerHarness(() => ({ never: true }));
  try {
    const started = Date.now();
    const out = plain(await harness.context._completeConsoleInTab(7, 'spin', { attach: true }));
    assert.deepEqual(out, { names: null, attached: true }, 'no answer — not an empty list (the panel keeps the globals unknown)');
    assert.equal(harness.calls.terminate, 0, "the page's running task is never cut");
    const elapsed = Date.now() - started;
    assert.ok(elapsed >= 240 && elapsed < 1500, String(elapsed));
    const calls = harness.calls.evaluate;
    const again = plain(await harness.context._completeConsoleInTab(7, 'other', { attach: true }));
    assert.equal(again.names, null);
    assert.equal(harness.calls.evaluate, calls, 'backing off for 5 s: nothing sent');
  } finally { harness.dispose(); }
});

test('live completion attaches only when asked, and never after the user cancelled the debugging bar', async () => {
  const browser = fakeBrowser();
  browser.pageScript = LIVE_PAGE;
  browser.reload();
  const worker = scopeWorker(browser);
  try {
    const idle = await worker.complete('appState', { attach: false });
    assert.deepEqual([idle.names, idle.attached], [null, false], 'no session and not asked to attach: nothing');
    assert.equal(browser.attached, false);
    const asked = await worker.complete('appState', { attach: true });
    assert.equal(asked.attached, true);
    assert.ok(asked.names.length > 0);
    // The user closed Chrome's "started debugging" bar.
    browser.attached = false;
    browser.dropObjects();
    worker.listeners.detach.forEach((fn) => fn({ tabId: 7 }, 'canceled_by_user'));
    const refused = await worker.complete('appState', { attach: true });
    assert.deepEqual([refused.names, refused.attached], [null, false]);
    assert.equal(browser.attached, false, 'typing never brings the bar back');
    // An explicit Run does, and completion may use that session again.
    assert.equal((await worker.run('1 + 1')).value, 2);
    assert.ok((await worker.complete('appState', { attach: false })).names.length > 0);
  } finally { worker.dispose(); }
});

// Final review I-2: MV3 stops an idle worker after ~30 s. The refusal lives in session storage, so a
// rebuilt worker still never re-attaches from typing; an explicit Run and closing the tab clear it.
test('a cancelled debugging bar survives a worker restart: typing never re-attaches; a Run clears the refusal', async () => {
  const browser = fakeBrowser();
  browser.pageScript = LIVE_PAGE;
  browser.reload();
  const first = scopeWorker(browser);
  assert.equal((await first.complete('appState', { attach: true })).attached, true);
  browser.attached = false;
  browser.dropObjects();
  first.listeners.detach.forEach((fn) => fn({ tabId: 7 }, 'canceled_by_user'));
  await settle();
  first.dispose();
  const second = scopeWorker(browser);
  try {
    const refused = plain(await second.complete('appState', { attach: true }));
    assert.deepEqual([refused.names, refused.attached], [null, false]);
    assert.deepEqual(plain(await second.context._previewConsoleInTab(7, '1 + 1', null, { attach: true })), { attached: false });
    assert.equal(browser.attached, false, 'a rebuilt worker never brings the bar back from typing');
    // An explicit Run does, and clears the stored refusal.
    assert.equal((await second.run('1 + 1')).value, 2);
    await settle();
    assert.equal([...browser.storage.keys()].some((key) => key.startsWith('xray_console_refused:')), false);
  } finally { second.dispose(); }
  // Closing the tab clears it too.
  const onRemoved = [];
  const third = scopeWorker(browser, { onRemoved });
  try {
    third.listeners.detach.forEach((fn) => fn({ tabId: 7 }, 'canceled_by_user'));
    await settle();
    assert.equal(browser.storage.has('xray_console_refused:7'), true);
    onRemoved.forEach((fn) => fn(7));
    await settle();
    assert.equal(browser.storage.has('xray_console_refused:7'), false);
  } finally { third.dispose(); }
});

// Final review M-4: a reset a typing call caused before the restart still earns the next Run its note.
test('a scope a completion replaced earns the next Run its reset note across a worker restart', async () => {
  const browser = fakeBrowser();
  browser.pageScript = LIVE_PAGE;
  browser.reload();
  const first = scopeWorker(browser);
  await first.run('const u = 1');
  browser.reload();
  plain(await first.complete(null));
  await settle();
  first.dispose();
  const second = scopeWorker(browser);
  try {
    const out = await second.run('typeof u');
    assert.equal(out.scopeReset, true, JSON.stringify(out));
    assert.equal((await second.run('1')).scopeReset, undefined, 'once');
  } finally { second.dispose(); }
});

test('a scope a completion replaced still earns the next Run its reset note', async () => {
  const browser = fakeBrowser();
  browser.pageScript = LIVE_PAGE;
  browser.reload();
  const worker = scopeWorker(browser);
  try {
    await worker.run('const u = 1');
    browser.reload();
    const globals = plain(await worker.complete(null));
    assert.deepEqual(globals.declared, []);
    const out = await worker.run('typeof u');
    assert.equal(out.scopeReset, true, JSON.stringify(out));
    assert.equal((await worker.run('1')).scopeReset, undefined, 'once');
  } finally { worker.dispose(); }
});

test('xray:console-complete answers with its requestId; only an in-page surface (a sender tab) asks', async () => {
  const browser = fakeBrowser();
  browser.pageScript = LIVE_PAGE;
  browser.reload();
  const worker = scopeWorker(browser);
  try {
    const out = await worker.message({ type: 'xray:console-complete', expr: 'appState', requestId: 4, attach: true });
    assert.equal(out.requestId, 4);
    assert.ok(out.names.some((n) => n.name === 'user'));
    const noTab = await new Promise((resolve) => {
      const keep = worker.listeners.message[0]({ type: 'xray:console-complete', expr: 'appState', requestId: 5, attach: true }, { id: 'xray-test' }, resolve);
      if (keep !== true) resolve(undefined);
    });
    assert.deepEqual(plain(noTab), { requestId: 5, names: null, attached: false });
  } finally { worker.dispose(); }
});

// ── Task 7 fix round 2 ──────────────────────────────────────────────────────────────────────────
test('fix round 2: globals are not cut at 500; a getter is reported as such; a lexical root is read as a binding; answers carry their age', async () => {
  const browser = fakeBrowser();
  browser.pageScript = `${LIVE_PAGE}\nfor (let i = 0; i < 700; i++) globalThis['page' + i] = i;`;
  browser.lexicalNames = ['lexState'];
  browser.reload();
  const worker = scopeWorker(browser);
  try {
    const globals = plain(await worker.complete(null));
    assert.ok(globals.names.length > 700, String(globals.names.length));
    assert.equal(globals.capped, undefined, 'nothing was cut');
    assert.equal(typeof globals.age, 'number');
    await new Promise((resolve) => setTimeout(resolve, 20));
    const again = plain(await worker.complete(null));
    assert.ok(again.age >= 15, `served from the cache: its age (${again.age} ms) goes with it`);
    assert.equal(plain(await worker.complete('appState.lazy')).getter, true);
    await worker.complete('lexState');
    assert.deepEqual(plain(liveCalls(browser).at(-1).params.arguments[1].value), ['lexState', 2], 'a lexical root: the binding first');
  } finally { worker.dispose(); }
});

test('fix round 2: back off only after a timeout; a missing name is nothing; the back-off ends with a Run', async () => {
  const browser = fakeBrowser();
  browser.pageScript = LIVE_PAGE;
  browser.reload();
  const worker = scopeWorker(browser);
  try {
    const missing = plain(await worker.complete('zzzMissing'));
    assert.deepEqual(missing.names, [], 'a typo answers nothing — not "no answer"');
    const before = liveCalls(browser).length;
    assert.ok(plain(await worker.complete('appState')).names.length > 0, 'and does not silence completion');
    assert.equal(liveCalls(browser).length, before + 1);
  } finally { worker.dispose(); }
});

test('at most one abandoned walk per tab; a Run waits for it briefly but never terminates it (round 4: it may be the page\'s own task holding it)', async () => {
  let walks = 0;
  const harness = debuggerHarness((_calls, params) => (/\.walk\(/.test(params.functionDeclaration) ? (walks++, { never: true }) : null));
  try {
    const first = plain(await harness.context._completeConsoleInTab(7, 'spin', { attach: true }));
    assert.equal(first.names, null);
    vm.runInContext('_liveBackoff.clear()', harness.context);
    const second = plain(await harness.context._completeConsoleInTab(7, 'other', { attach: true }));
    assert.equal(second.names, null);
    assert.equal(walks, 1, 'no second walk while one is pending');
    const started = Date.now();
    const ran = plain(await harness.evaluate('window.ran = 1', { timeoutMs: 2000, graceMs: 200 }));
    assert.equal(harness.calls.terminate, 0, 'nothing is terminated for a pending walk');
    assert.ok(Date.now() - started >= 450, 'the Run waited (≤ 500 ms) for the walk first');
    assert.notEqual(ran.error?.kind, 'timeout', JSON.stringify(ran));
    // Still tracked until it settles: no second walk piles up behind it.
    await harness.context._completeConsoleInTab(7, 'again', { attach: true });
    assert.equal(walks, 1);
  } finally { harness.dispose(); }
});

// ── Task 7 round 3: a Run the page could not start before its deadline is not run ───────────────
test('a Run that begins after its deadline is skipped and reported as not run — never a timeout followed by a late execution', async () => {
  const browser = fakeBrowser();
  const worker = scopeWorker(browser);
  try {
    assert.equal((await worker.run('1')).value, 1);
    vm.runInContext('globalThis.ran = 0', browser.realm);
    const run = browser.log.filter(({ method, params }) => method === 'Runtime.callFunctionOn' && !/^function \(key/.test(params.functionDeclaration)).at(-1);
    assert.equal(typeof run.params.arguments[2].value, 'number', 'the run carries its deadline');
    // The page is busy: the run starts only after its cap.
    const realCdp = browser.cdp;
    browser.cdp = (method, params) => (method === 'Runtime.callFunctionOn' && !/^function \(key/.test(params.functionDeclaration)
      ? new Promise((resolve) => setTimeout(() => resolve(realCdp(method, params)), 150))
      : realCdp(method, params));
    const out = await worker.context._evaluateConsoleInTab(7, 'globalThis.ran = 1', '{}', { timeoutMs: 60, graceMs: 400 });
    assert.equal(out.error?.kind, 'skipped', JSON.stringify(out));
    assert.equal(out.error.message, 'Not run: the page was busy for more than 0.06 s');
    await new Promise((resolve) => setTimeout(resolve, 200));
    assert.equal(vm.runInContext('ran', browser.realm), 0, 'and it never runs later');
    browser.cdp = realCdp;
    assert.equal((await worker.run('ran = 2; ran')).value, 2, 'the next Run runs');
  } finally { worker.dispose(); }
});

// ── Task 8 (spec §4): eager preview ─────────────────────────────────────────────────────────────
// The draft is evaluated by a strict function on the scope under V8's side-effect check and
// projected IN THE PAGE by XRAY's own one-line projector; the answer is a string read by value — no
// remote object of a page or declared value, no generatePreview. Context the draft names goes first,
// in its own call, outside the side-effect check. Nothing is ever terminated: a late answer is
// abandoned (one pending per tab, shared with completion walks), backs off, and a Run waits for it.
const previewCalls = (browser) => browser.log.filter(({ method, params }) => method === 'Runtime.callFunctionOn' && /\.preview\(__x/.test(params.functionDeclaration));
const contextCalls = (browser) => browser.log.filter(({ method, params }) => method === 'Runtime.callFunctionOn' && /\.prepare\(/.test(params.functionDeclaration));

test('eager preview: by value, under the side-effect check, in its own object group; no generatePreview, no timeout, no terminate', async () => {
  const browser = fakeBrowser();
  const worker = scopeWorker(browser);
  try {
    const out = plain(await worker.context._previewConsoleInTab(7, '1+1', null, { attach: true }));
    assert.deepEqual(out, { attached: true, value: '2' });
    const [call] = previewCalls(browser);
    assert.equal(call.params.throwOnSideEffect, true);
    assert.equal(call.params.returnByValue, true);
    assert.equal(call.params.objectGroup, 'xray-preview');
    assert.equal(call.params.silent, true);
    assert.equal('generatePreview' in call.params, false, 'CDP never previews a page value');
    assert.equal('timeout' in call.params, false, 'callFunctionOn has no timeout');
    assert.equal(typeof call.params.arguments[1].value, 'number', 'the call carries its deadline');
    assert.equal(contextCalls(browser).length, 0, '1+1 names no context: nothing is sent first');
    assert.ok(browser.log.some(({ method, params }) => method === 'Runtime.releaseObjectGroup' && params.objectGroup === 'xray-preview'));
    assert.equal(browser.log.some(({ method }) => method === 'Runtime.terminateExecution' || method === 'Runtime.getProperties'), false);
  } finally { worker.dispose(); }
});

test('eager preview never sends or refreshes the context: a draft naming context reads the last Run\'s, only while it is current (fix round 1)', async () => {
  const browser = fakeBrowser();
  const worker = scopeWorker(browser);
  const entry = (id, users) => ({ id, type: 'api', url: `https://x.test/${id}?SECRET`, urlPath: '/api', responseDecrypted: { users } });
  const text = JSON.stringify({ currentEntry: entry('e1', [{ id: 1 }, { id: 2 }, { id: 3 }]), entries: [{ id: 'e2', type: 'api', url: 'https://other.test/?OTHER-SECRET' }], scope: { temp1: 'TEMP-SECRET' }, pins: {} });
  const other = JSON.stringify({ currentEntry: entry('e9', [{ id: 1 }]), entries: [], scope: {}, pins: {} });
  const sentContext = () => browser.log.some(({ method, params }) => method === 'Runtime.callFunctionOn' && !/\.preview\(__x|\.walk\(/.test(params.functionDeclaration) && JSON.stringify(params.arguments || []).includes('SECRET') && !params.functionDeclaration.includes('__xray:command'));
  try {
    // No Run yet: nothing is sent, nothing previewed.
    assert.deepEqual(plain(await worker.context._previewConsoleInTab(7, 'res.users.length * 2', text, { attach: true })), { attached: true });
    assert.equal(previewCalls(browser).length, 0);
    assert.equal(contextCalls(browser).length, 0);
    // A Run that names res revives it in the scope; the same context now previews.
    await worker.run('res.users.length', text);
    const before = browser.log.length;
    assert.deepEqual(plain(await worker.context._previewConsoleInTab(7, 'res.users.length * 2', text, { attach: true })), { attached: true, value: '6' });
    assert.equal(browser.log.slice(before).some(({ method, params }) => method === 'Runtime.callFunctionOn' && JSON.stringify(params.arguments || []).includes('SECRET')), false, 'the preview call carries no context');
    assert.equal(previewCalls(browser).at(-1).params.arguments.length, 2, 'key and deadline only');
    assert.deepEqual(plain(await worker.context._previewConsoleInTab(7, 'res.users.map(u => u.id)', text, { attach: true })), { attached: true, value: '{"$xray":"array","length":3,"items":[1,2,3]}' });
    // Another selection: the scope holds the old one — no stale preview.
    const calls = previewCalls(browser).length;
    assert.deepEqual(plain(await worker.context._previewConsoleInTab(7, 'res.users.length * 2', other, { attach: true })), { attached: true });
    // A member the last Run did not name: none either.
    assert.deepEqual(plain(await worker.context._previewConsoleInTab(7, 'temp1.length', text, { attach: true })), { attached: true });
    assert.equal(previewCalls(browser).length, calls);
    // A Run that names nothing empties the scope's context: res no longer previews.
    await worker.run('1', text);
    assert.deepEqual(plain(await worker.context._previewConsoleInTab(7, 'res.users.length * 2', text, { attach: true })), { attached: true });
    // A Run that does not compile never began: nothing is current.
    await worker.run('res.users.length', text);
    await worker.run('res.users.length )', text);
    assert.deepEqual(plain(await worker.context._previewConsoleInTab(7, 'res.users.length * 2', text, { attach: true })), { attached: true });
    assert.equal(contextCalls(browser).length, 0, 'no context-carrying call exists');
    assert.equal(sentContext(), false);
    // Declared names and drafts naming no context preview as before.
    await worker.run('const sec = { n: 21 }');
    assert.deepEqual(plain(await worker.context._previewConsoleInTab(7, 'sec.n * 2', null, { attach: true })), { attached: true, value: '42' });
    const thrown = plain(await worker.context._previewConsoleInTab(7, 'null.x', null, { attach: true }));
    assert.match(thrown.thrown, /^\{"\$xray":"error","name":"TypeError","message":"Cannot read properties of null/);
  } finally { worker.dispose(); }
});

test('eager preview: an ineligible draft, no session without attach, a cancelled bar or a Run in flight send nothing', async () => {
  const browser = fakeBrowser();
  const worker = scopeWorker(browser);
  try {
    assert.deepEqual(plain(await worker.context._previewConsoleInTab(7, 'x = 1', null, { attach: true })), { attached: false });
    assert.deepEqual(plain(await worker.context._previewConsoleInTab(7, '1+1', null, { attach: false })), { attached: false });
    assert.equal(browser.attached, false, 'typing without the pause never attaches');
    assert.equal(previewCalls(browser).length, 0);
    const running = worker.run('await new Promise((r) => setTimeout(r, 150))');
    await settle();
    assert.deepEqual(plain(await worker.context._previewConsoleInTab(7, '1+1', null, { attach: true })), { attached: true }, 'a Run in flight: nothing');
    await running;
    assert.equal(previewCalls(browser).length, 0);
    for (const draft of ['const a = 1', 'a++', 'delete a.b', 'await x', '1; 2', 'a b']) {
      assert.deepEqual(plain(await worker.context._previewConsoleInTab(7, draft, null, { attach: true })), { attached: true }, draft);
    }
    assert.equal(previewCalls(browser).length, 0, 'the worker checks eligibility itself');
  } finally { worker.dispose(); }
});

test('eager preview: no answer at 300 ms is abandoned, never terminated; one pending per tab (shared with walks); back-off; a Run waits for it', async () => {
  let previews = 0;
  const harness = debuggerHarness((_calls, params) => (/\.preview\(__x/.test(params.functionDeclaration) ? (previews++, { never: true }) : null));
  try {
    const started = Date.now();
    const out = plain(await harness.context._previewConsoleInTab(7, '1+1', null, { attach: true }));
    const elapsed = Date.now() - started;
    assert.deepEqual(out, { attached: true });
    assert.ok(elapsed >= 290 && elapsed < 1500, String(elapsed));
    assert.equal(harness.calls.terminate, 0, "the page's running task is never cut");
    assert.equal(vm.runInContext('_pendingWalks.has(7)', harness.context), true, 'the abandoned call is the tab\'s one pending typing call');
    assert.ok(vm.runInContext('(_liveBackoff.get(7) || 0) > Date.now()', harness.context), 'a timeout backs off');
    vm.runInContext('_liveBackoff.clear()', harness.context);
    await harness.context._previewConsoleInTab(7, '2+2', null, { attach: true });
    assert.equal((await harness.context._completeConsoleInTab(7, 'appState', { attach: true })).names, null);
    assert.equal(previews, 1, 'nothing more is sent while it is pending');
    const runStarted = Date.now();
    const ran = plain(await harness.evaluate('1', { timeoutMs: 2000, graceMs: 200 }));
    assert.ok(Date.now() - runStarted >= 450, 'the Run waited (≤ 500 ms) for the pending preview');
    assert.equal(harness.calls.terminate, 0);
    assert.notEqual(ran.error?.kind, 'timeout', JSON.stringify(ran));
  } finally { harness.dispose(); }
});

test('xray:console-preview answers with its requestId, for the sender\'s own tab only', async () => {
  const browser = fakeBrowser();
  const worker = scopeWorker(browser);
  try {
    const out = plain(await worker.message({ type: 'xray:console-preview', code: '1+1', context: null, requestId: 9, attach: true }));
    assert.deepEqual(out, { requestId: 9, attached: true, value: '2' });
    const noTab = await new Promise((resolve) => {
      const keep = worker.listeners.message[0]({ type: 'xray:console-preview', code: '1+1', requestId: 3, attach: true }, { id: 'xray-test' }, resolve);
      if (keep !== true) resolve(undefined);
    });
    assert.deepEqual(plain(noTab), { requestId: 3, attached: false });
  } finally { worker.dispose(); }
});

test('eager preview: a completion queued behind a preview that is then abandoned sends nothing (one pending typing call per tab)', async () => {
  let walks = 0;
  const harness = debuggerHarness((_calls, params) => {
    if (/\.preview\(__x/.test(params.functionDeclaration)) return { never: true };
    if (/\.walk\(/.test(params.functionDeclaration)) walks++;
    return null;
  });
  try {
    const preview = harness.context._previewConsoleInTab(7, '1+1', null, { attach: true });
    const completion = harness.context._completeConsoleInTab(7, 'appState', { attach: true });
    const [p, c] = await Promise.all([preview, completion]);
    assert.deepEqual(plain(p), { attached: true });
    assert.equal(plain(c).names, null);
    assert.equal(walks, 0, 'no walk was sent while the preview was pending');
  } finally { harness.dispose(); }
});
