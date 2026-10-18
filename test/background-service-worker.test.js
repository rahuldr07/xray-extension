// background.js BYOK provider bridge.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const test = require('node:test');

const { read } = require('./helpers/source');

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
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../background.js'), 'utf8'), context);
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
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../background.js'), 'utf8'), context);
  const helperSource = fs.readFileSync(require.resolve('../shared/console-helpers.js'), 'utf8');
  const entry = { id: 'e1', type: 'api', method: 'GET', url: 'https://x.test/api', urlPath: '/api', status: 200, responseDecrypted: { users: [{ id: 1 }] } };
  // The context travels as tagged JSON text (panel/console.js _contextPayload); `overrides`
  // is merged into a plain context, a string is sent as it is. The result comes back as
  // typed JSON text (shared/console-helpers.js encodeResult); `value` is it parsed.
  const run = async (code, overrides = {}) => {
    const contextText = typeof overrides === 'string'
      ? overrides
      : JSON.stringify({ currentEntry: entry, entries: [entry], scope: {}, pins: {}, ...overrides });
    const expression = context._buildConsoleExpression(code, contextText, helperSource);
    const out = await vm.runInNewContext(expression, { navigator: {}, console });
    return typeof out?.result === 'string' ? { ...out, value: JSON.parse(out.result) } : out;
  };
  run.expression = (code, contextText) => context._buildConsoleExpression(code, contextText, helperSource);
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
  // The context is data in a string literal, parsed in the page — never an object literal.
  const expression = run.expression('1', text);
  assert.ok(expression.includes(`reviveContext(${JSON.stringify(text)})`), 'inlined as a string literal');
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
