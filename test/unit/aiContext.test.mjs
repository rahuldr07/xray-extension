import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync } from 'node:fs';
import { apiEntry } from './harness.mjs';

const modelUrl = new URL('../../src/panel/models/aiContext.ts', import.meta.url);
const ai = existsSync(modelUrl) ? await import(modelUrl) : {};
const destination = { provider: 'custom', model: 'test-model', baseUrl: 'https://provider.test/v1', authHeader: 'X-Custom-Credential', authPrefix: 'Bearer ' };
const none = { headers: false, requestBody: false, responseBody: false };
const all = { headers: true, requestBody: true, responseBody: true };
const payload = prompt => JSON.parse(prompt.split('Captured request:\n')[1]);

test('AI defaults omit payloads and redact every URL value, userinfo and fragment', () => {
  assert.equal(typeof ai.prepareAiContext, 'function');
  const entry = apiEntry({ url: 'https://user:synthetic-pass@api.test/path?a=synthetic-query&a=other-query#synthetic-fragment', requestBody: 'body-private', responseRaw: 'response-private', graphql: { operationName: 'Users', operationType: 'query', variables: { token: 'gql-secret' } }, jwtLenses: ['lens-secret'], initiator: ['stack-secret'], wsFrames: ['frame-secret'] });
  const { prompt } = ai.prepareAiContext(entry, [], none, destination);
  for (const secret of ['synthetic-pass', 'synthetic-query', 'other-query', 'synthetic-fragment', 'body-private', 'response-private', 'gql-secret', 'lens-secret', 'stack-secret', 'frame-secret']) assert.ok(!prompt.includes(secret), secret);
  const context = payload(prompt);
  assert.equal(context.requestHeaders, undefined);
  assert.equal(context.requestBody, undefined);
  assert.equal(context.response, undefined);
  assert.equal(context.graphql.variables, undefined);
  assert.equal(new URL(context.url).searchParams.getAll('a').length, 2);
});

test('opt-ins redact nested fields, JSON strings, headers, custom auth, bearer/JWT and nested URLs without mutation', () => {
  assert.equal(typeof ai.prepareAiContext, 'function');
  const entry = apiEntry({ requestHeaders: { AuThOrIzAtIoN: 'header-secret', Cookie: 'cookie-secret', 'X-Custom-Credential': 'custom-secret', Accept: 'application/json' }, responseHeaders: { 'Set-Cookie': 'response-cookie' }, requestBody: { inner: { 'Api-Key': 'api-secret', refresh_token: 'token-secret', passwd: 'pass-secret', sessionId: 'session-secret', private_key: 'private-secret', jwt: 'jwt-secret', authorization: 'auth-secret' }, encoded: '{"password":"json-secret","ok":true}', text: 'Bearer bearer-secret eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzeW50aGV0aWMifQ.signature', url: 'https://user:pass@api.test/path?q=nested-query#nested-fragment' }, responseRaw: '{"token":"raw-secret"}', responseDecrypted: { secret: 'decrypted-secret', visible: true }, graphql: { operationName: 'Update', operationType: 'mutation', variables: { password: 'graphql-secret', count: 3 } } });
  const before = JSON.stringify(entry);
  const { prompt } = ai.prepareAiContext(entry, [], all, destination);
  for (const secret of ['header-secret', 'cookie-secret', 'custom-secret', 'response-cookie', 'api-secret', 'token-secret', 'pass-secret', 'session-secret', 'private-secret', 'jwt-secret', 'auth-secret', 'json-secret', 'bearer-secret', 'eyJhbGci', 'nested-query', 'nested-fragment', 'raw-secret', 'decrypted-secret', 'graphql-secret']) assert.ok(!prompt.includes(secret), secret);
  assert.equal(payload(prompt).response.visible, true);
  assert.equal(payload(prompt).graphql.variables.count, 3);
  assert.equal(JSON.stringify(entry), before);
});

test('unstructured body redaction warns and preserves inert text', () => {
  assert.equal(typeof ai.prepareAiContext, 'function');
  const { prompt, notices } = ai.prepareAiContext(apiEntry({ requestBody: '<script>hello</script> password=plain-secret token: text-secret' }), [], { ...none, requestBody: true }, destination);
  assert.ok(!prompt.includes('plain-secret'));
  assert.ok(!prompt.includes('text-secret'));
  assert.ok(prompt.includes('<script>hello</script>'));
  assert.ok(notices.includes('Automatic redaction may miss secrets. Review the payload before sending.'));
});

test('prompt serialization is valid and bounded including instructions, depth, nodes, cycles and oversized strings', () => {
  assert.equal(typeof ai.prepareAiContext, 'function');
  let deep = { marker: 'unreachable' };
  for (let i = 0; i < 30; i++) deep = { child: deep };
  const cycle = {}; cycle.self = cycle;
  for (const value of [deep, cycle, Array.from({ length: 7000 }, () => ({ n: 1 })), 'x'.repeat(200000)]) {
    const { prompt, notices } = ai.prepareAiContext(apiEntry({ requestBody: value }), [], all, destination);
    assert.ok(prompt.length <= 40000);
    assert.ok(notices.length > 0);
    assert.ok(prompt.includes('[Omitted') || prompt.includes('[Truncated'));
    payload(prompt);
  }
});

test('snapshot remains frozen when captured bodies and metadata mutate', () => {
  assert.equal(typeof ai.freezeAiContext, 'function');
  const entry = apiEntry({ requestBody: { value: 'original' } });
  const prepare = ai.freezeAiContext(entry, [], destination);
  entry.requestBody.value = 'changed'; entry.status = 500;
  assert.equal(payload(prepare(all).prompt).requestBody.value, 'original');
  assert.equal(payload(prepare(none).prompt).status, 200);
  assert.equal(payload(prepare(none).prompt).requestBody, undefined);
});

test('destination normalization contains only the presented noncredential fields', () => {
  assert.equal(typeof ai.aiDestination, 'function');
  const normalized = ai.aiDestination({ ...destination, baseUrl: 'https://PROVIDER.test:443/v1/', authHeader: ' X-Custom-Credential ', apiKey: 'synthetic-key-never-serialized' });
  assert.equal(normalized.baseUrl, 'https://provider.test/v1/chat/completions');
  assert.equal(normalized.authHeader, 'x-custom-credential');
  assert.ok(!JSON.stringify(normalized).includes('synthetic-key'));
});

test('OpenAI normalization reflects the actual compatible-caller custom auth configuration', () => {
  const normalized = ai.aiDestination({ ...destination, provider: 'openai' });
  assert.equal(normalized.authHeader, 'x-custom-credential');
  assert.equal(normalized.authPrefix, 'Bearer ');
});

test('every visited secret field counts toward the node budget', () => {
  const body = Object.fromEntries(Array.from({ length: 6000 }, (_, i) => [`jwt${String.fromCharCode(0x1000 + i)}`, 's']));
  const result = ai.prepareAiContext(apiEntry({ requestBody: body }), [], all, destination);
  assert.ok(result.notices.some(notice => notice.includes('5,000-node')));
});

test('malformed metadata cannot trigger value coercion or break the local preview', () => {
  let coerced = false;
  const duration = { valueOf() { coerced = true; throw new Error('Do not execute'); } };
  const result = ai.prepareAiContext(apiEntry({ url: {}, urlPath: '/fallback?x=synthetic-malformed-query', duration }), [], none, destination);
  assert.equal(coerced, false);
  assert.equal(payload(result.prompt).durationMs, 0);
  assert.ok(!result.prompt.includes('synthetic-malformed-query'));
});

test('nested absolute and relative URL text redacts all query values, not only named secrets', () => {
  const result = ai.prepareAiContext(apiEntry({ requestBody: { socket: 'wss://user:socket-pass@api.test/feed?name=socket-query#socket-fragment', relative: '/users?name=relative-query#relative-fragment' } }), [], all, destination);
  for (const value of ['socket-pass', 'socket-query', 'socket-fragment', 'relative-query', 'relative-fragment']) assert.ok(!result.prompt.includes(value), value);
});

test('AI context redacts password and key synonyms in included bodies', () => {
  const entry = apiEntry({ requestBody: { pwd: 'synthetic-pwd', accessKey: 'synthetic-ak', auth: 'synthetic-auth', author: 'Ann' } });
  const { prompt } = ai.prepareAiContext(entry, [], all, destination);
  for (const secret of ['synthetic-pwd', 'synthetic-ak', 'synthetic-auth']) assert.ok(!prompt.includes(secret), secret);
  assert.ok(prompt.includes('Ann'));
});
