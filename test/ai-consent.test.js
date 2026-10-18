const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');

const destination = { provider: 'custom', model: 'synthetic-model', baseUrl: 'https://provider.test/v1/chat/completions', authHeader: 'x-auth', authPrefix: 'Bearer ' };
function background(overrides = {}, providerResponse = {}) {
  let listener;
  const calls = [];
  const noop = new Proxy(function () {}, { get: (_, name) => name === 'then' ? undefined : noop, apply: () => noop });
  const chrome = new Proxy({}, { get: (_, name) => name === 'runtime' ? { id: 'xray-test', onConnect: noop, onMessage: { addListener: fn => { listener = fn; } } } : name === 'storage' ? { local: { get: async () => ({ xray_ai_settings: { ...destination, apiKey: 'synthetic-stored-key', ...overrides } }) } } : noop });
  const context = { chrome, URL, console, setTimeout: fn => { const timer = setTimeout(fn, 1000); timer.unref(); return timer; }, clearTimeout, fetch: async (url, init) => { calls.push({ url, init }); return { ok: providerResponse.ok ?? true, status: 401, json: async () => providerResponse.data ?? ({ choices: [{ message: { content: 'Synthetic explanation' } }] }) }; } };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../background.js'), 'utf8'), context);
  return { calls, send: (message, sender = { id: 'xray-test' }) => new Promise(resolve => { const accepted = listener(message, sender, resolve); if (accepted === false) resolve(null); }) };
}

test('changed provider/model/endpoint/auth destination rejects before provider fetch', async () => {
  for (const overrides of [{ provider: 'openai' }, { model: 'changed-model' }, { baseUrl: 'https://other.test/v1' }, { authHeader: 'x-other' }, { authPrefix: '' }]) {
    const bg = background(overrides);
    const result = await bg.send({ type: 'xray:ai-explain', prompt: 'exact preview', expectedDestination: destination });
    assert.equal(result.ok, false);
    assert.match(result.error, /destination.*changed/i);
    assert.equal(bg.calls.length, 0);
  }
});

test('normalized matching destination sends the exact preview once and key stays in stored auth only', async () => {
  const bg = background({ baseUrl: 'https://PROVIDER.test:443/v1/', authHeader: ' X-Auth ' });
  const message = { type: 'xray:ai-explain', prompt: 'exact preview', expectedDestination: destination };
  const result = await bg.send(message);
  assert.equal(result.ok, true);
  assert.equal(bg.calls.length, 1);
  assert.equal(bg.calls[0].url, destination.baseUrl);
  assert.equal(JSON.parse(bg.calls[0].init.body).messages[0].content, message.prompt);
  assert.ok(!JSON.stringify(message).includes('synthetic-stored-key'));
});

test('missing expected destination and oversized prompts reject rather than silently changing the preview', async () => {
  for (const message of [{ type: 'xray:ai-explain', prompt: 'preview' }, { type: 'xray:ai-explain', prompt: 'x'.repeat(40001), expectedDestination: destination }]) {
    const bg = background();
    const result = await bg.send(message);
    assert.equal(result.ok, false);
    assert.equal(bg.calls.length, 0);
  }
});

test('sender validation, missing configuration and endpoint guards remain enforced', async () => {
  const bg = background();
  assert.equal(await bg.send({ type: 'xray:ai-explain', prompt: 'preview', expectedDestination: destination }, { id: 'foreign-extension' }), null);
  assert.equal(bg.calls.length, 0);
  const missing = background({ apiKey: '' });
  assert.equal((await missing.send({ type: 'xray:ai-explain', prompt: 'preview', expectedDestination: destination })).ok, false);
  const insecure = background({ baseUrl: 'http://public.test/v1' });
  assert.equal((await insecure.send({ type: 'xray:ai-explain', prompt: 'preview', expectedDestination: { ...destination, baseUrl: 'http://public.test/v1/chat/completions' } })).ok, false);
  assert.equal(insecure.calls.length, 0);
});

test('provider failure never echoes raw authentication or payload errors', async () => {
  const bg = background({}, { ok: false, data: { error: { message: 'synthetic-stored-key captured-private-body' } } });
  const result = await bg.send({ type: 'xray:ai-explain', prompt: 'preview', expectedDestination: destination });
  assert.equal(result.ok, false);
  assert.ok(!JSON.stringify(result).includes('synthetic-stored-key'));
  assert.ok(!JSON.stringify(result).includes('captured-private-body'));
  assert.match(result.error, /check.*configuration/i);
});

test('OpenAI destination compares the auth fields its existing caller actually uses', async () => {
  const expected = { ...destination, provider: 'openai', baseUrl: 'https://api.openai.com/v1/chat/completions' };
  const bg = background({ provider: 'openai', authHeader: 'x-changed-auth' });
  const result = await bg.send({ type: 'xray:ai-explain', prompt: 'preview', expectedDestination: expected });
  assert.equal(result.ok, false);
  assert.equal(bg.calls.length, 0);
});

test('incomplete expected destination cannot imply consent to provider defaults', async () => {
  const bg = background({ provider: 'anthropic', model: '' });
  const result = await bg.send({ type: 'xray:ai-explain', prompt: 'preview', expectedDestination: {} });
  assert.equal(result.ok, false);
  assert.equal(bg.calls.length, 0);
});
