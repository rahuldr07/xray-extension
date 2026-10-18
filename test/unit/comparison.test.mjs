/* Behavioural tests for src/panel/models/comparison.ts. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { apiEntry } from './harness.mjs';

const { compareEntries } = await import('../../src/panel/models/comparison.ts');

test('compareEntries reports deterministic identity, status, timing, and size evidence', () => {
  const left = apiEntry({ id: 'left', method: 'GET', url: 'https://x/one', status: 200, duration: 40, size: 10 });
  const right = apiEntry({ id: 'right', method: 'POST', url: 'https://x/two', status: 500, duration: 80, size: 20 });

  const result = compareEntries(left, right);

  assert.deepEqual(Object.keys(result.identity.fields), ['method', 'url', 'urlPath', 'source', 'graphql']);
  assert.equal(result.identity.fields.method.changed, true);
  assert.equal(result.identity.fields.url.changed, true);
  assert.equal(result.status.changed, true);
  assert.equal(result.status.left, 200);
  assert.equal(result.status.right, 500);
  assert.equal(result.timing.left, 40);
  assert.equal(result.timing.right, 80);
  assert.equal(result.size.left, 10);
  assert.equal(result.size.right, 20);
  assert.equal(result.notices.some((notice) => /redact|truncat|cyclic/i.test(notice)), false, 'scalar differences need no unavailable notice');
});

test('compareEntries reports header and body structural changes without mutating entries', () => {
  const left = apiEntry({
    id: 'left',
    requestHeaders: { 'x-shared': 'yes', 'x-left': 'one' },
    responseHeaders: { 'content-type': 'application/json' },
    requestBody: { page: 1, old: true },
    responseRaw: JSON.stringify({ data: { count: 1 }, removed: true }),
  });
  const right = apiEntry({
    id: 'right',
    requestHeaders: { 'x-shared': 'yes', 'x-right': 'two' },
    responseHeaders: { 'content-type': 'text/plain' },
    requestBody: { page: 2, added: true },
    responseRaw: JSON.stringify({ data: { count: 2 }, added: true }),
  });
  const before = structuredClone(left);

  const result = compareEntries(left, right);

  assert.ok(result.requestHeaders.differences.some((change) => change.path === 'x-left' && change.kind === 'removed'));
  assert.ok(result.requestHeaders.differences.some((change) => change.path === 'x-right' && change.kind === 'added'));
  assert.ok(result.requestBody.differences.some((change) => change.path === 'page' && change.kind === 'changed'));
  assert.ok(result.responseBody.differences.some((change) => change.path === 'data.count' && change.kind === 'changed'));
  assert.notEqual(result.responseBody.differences.find((change) => change.path === 'removed'), undefined);
  assert.notEqual(result.responseBody.differences.find((change) => change.path === 'added'), undefined);
  assert.deepEqual(left, before);
});

test('compareEntries gives explicit notices for redacted, missing, truncated, and cyclic values', () => {
  const cyclic = { name: 'cycle' };
  cyclic.self = cyclic;
  const left = apiEntry({
    id: 'left',
    requestHeaders: { authorization: '[redacted]' },
    requestBody: cyclic,
    responseRaw: 'x'.repeat(20_050),
  });
  const right = apiEntry({
    id: 'right',
    requestHeaders: {},
    requestBody: undefined,
    responseRaw: null,
  });

  const result = compareEntries(left, right, { maxBodyChars: 20_000 });
  const notices = [...result.notices, ...result.requestHeaders.notices, ...result.requestBody.notices, ...result.responseBody.notices].join(' ');

  assert.match(notices, /redact/i);
  assert.match(notices, /missing/i);
  assert.match(notices, /truncat/i);
  assert.match(notices, /cyclic/i);
  assert.ok(result.requestBody.differences.length <= 200);
});

test('compareEntries is stable and does not reconstruct hidden header values', () => {
  const left = apiEntry({ id: 'left', requestHeaders: { authorization: '[redacted]' } });
  const right = apiEntry({ id: 'right', requestHeaders: { authorization: '[redacted]' } });
  const first = compareEntries(left, right);
  const second = compareEntries(left, right);

  assert.deepEqual(first, second);
  assert.ok(first.requestHeaders.notices.some((notice) => /redact/i.test(notice)));
  assert.equal(JSON.stringify(first).includes('Bearer'), false);
  assert.equal(JSON.stringify(first).includes('secret'), false);
});

test('two entries that both lack a request body compare as equal, not unavailable', () => {
  const left = apiEntry({ requestBody: undefined });
  const right = apiEntry({ requestBody: undefined });
  const result = compareEntries(left, right);
  assert.equal(result.requestBody.equal, true);
  const oneSided = compareEntries(left, apiEntry({ requestBody: { a: 1 } }));
  assert.ok(oneSided.requestBody.notices.includes('Request body missing on left'));
  assert.equal(result.requestBody.notices.length, 0);
});
