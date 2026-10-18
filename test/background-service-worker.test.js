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
  return (code, overrides = {}) => {
    const expression = context._buildConsoleExpression(code, { currentEntry: entry, entries: [entry], scope: {}, pins: {}, ...overrides }, helperSource);
    return vm.runInNewContext(expression, { navigator: {}, console });
  };
}

test('console evaluation reports undefined results instead of crashing the serializer', async () => {
  const run = consoleExpressionBuilder();
  const missing = await run('res.data');
  assert.equal(missing.type, 'undefined', JSON.stringify(missing));
  assert.equal(missing.error, undefined);
  const value = await run('res.users.length');
  assert.equal(value.result, 1);
});

test('a pinned request evaluates as its parsed response body, not the raw entry', async () => {
  const run = consoleExpressionBuilder();
  // Pins travel as { id, body } (panel/console.js), never the full entry.
  const pinned = { id: 'p1', body: JSON.stringify({ users: [{ id: 1 }, { id: 2 }] }) };
  const count = await run('a.users.length', { pins: { a: pinned } });
  assert.equal(count.result, 2, JSON.stringify(count));
  // `res` still names the selected request; the pin sits beside it.
  assert.equal((await run('res.users.length + a.users.length', { pins: { a: pinned } })).result, 3);
  // A pin can never replace a runtime helper.
  assert.equal((await run('res.users.length', { pins: { res: pinned } })).result, 1);
  // Only a-f are declared; any other pin name stays unbound.
  assert.equal((await run('typeof g', { pins: { g: pinned } })).result, 'undefined');
  // User code may still declare a pinned letter (its body runs in a nested scope).
  assert.equal((await run('const a = 5; a * 2', { pins: { a: pinned } })).result, 10);
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
  assert.equal((await run('const x = 2; x * 3')).result, 6);
  assert.equal((await run('const x = 2\nx * 3')).result, 6);
  assert.equal((await run('const x = 2; x * 3;')).result, 6);
  assert.equal(JSON.stringify((await run('const a = [1, 2]; a.map((v) => { return v * 2; })')).result), '[2,4]');
  assert.equal((await run('const s = "a;b"; s')).result, 'a;b');
  assert.equal((await run('const t = `x;\ny`; t.length')).result, 4);
  assert.equal((await run('// note; here\nconst y = 5\ny')).result, 5);
  // Declarations and control flow as the last statement produce undefined, not a syntax error.
  assert.equal((await run('const z = 1;')).type, 'undefined');
  assert.equal((await run('for (let i = 0; i < 2; i++) {}')).type, 'undefined');
  assert.equal((await run('let n = 0; if (true) { n = 1 }')).type, 'undefined');
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
