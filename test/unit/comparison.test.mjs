/* Behavioural tests for src/panel/models/comparison.ts. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { apiEntry, sessionStore } from './harness.mjs';

const { compareEntries } = await import('../../src/panel/models/comparison.ts');

test('J9 a whole body over 20,000 characters is not "truncated"; the cut a saved session made is (parked from Task 3)', () => {
  // A pretty request text past 20,000 characters (capture keeps 50,000) used to read as truncated by
  // its length alone — and since J9 a restored session keeps such bodies whole.
  const pretty = JSON.stringify({ rows: Array.from({ length: 40 }, (_, i) => ({ id: i, note: 'n'.repeat(640) })) }, null, 2);
  assert.ok(pretty.length > 25_000);
  const post = (id, text) => apiEntry({ id, method: 'POST', requestBodyKind: 'text', requestBodyText: text,
    requestHeaders: { 'content-type': 'application/json' }, responseRaw: '{"ok":true}' });
  const whole = compareEntries(post('left', pretty), post('right', pretty));
  assert.deepEqual(whole.requestBody.notices, []);
  assert.equal(whole.requestBody.equal, true);

  const [restored] = JSON.parse(JSON.stringify(sessionStore.serializeSessionEntries([post('left', pretty)])));
  assert.equal(restored.requestBodyText, pretty, 'the saved session keeps it whole');
  assert.deepEqual(compareEntries(restored, post('right', pretty)).requestBody.notices, []);

  const [cut] = JSON.parse(JSON.stringify(sessionStore.serializeSessionEntries([post('left', pretty)], { budgetBytes: 10_000 })));
  assert.equal(cut.requestTruncated.keptChars, cut.requestBodyText.length);
  const result = compareEntries(cut, post('right', pretty));
  assert.ok(result.requestBody.notices.includes('Request body truncated on left'), 'the cut is read from its metadata');
  assert.notEqual(result.requestBody.equal, true);
});

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

test('compareEntries notices truncation recorded as capture metadata (no in-band suffix since J6)', () => {
  const left = apiEntry({ id: 'left', responseRaw: '{"a":1', responseTruncated: { totalChars: 938_891, keptChars: 250_000 } });
  const right = apiEntry({ id: 'right', responseRaw: '{"a":1}', requestBody: 'x', requestBodyText: 'x', requestTruncated: { totalChars: 60_000, keptChars: 50_000 } });
  const result = compareEntries(left, right);
  assert.match(result.responseBody.notices.join(' '), /truncated on left/i);
  assert.match(result.requestBody.notices.join(' '), /truncated on right/i);
  assert.equal(result.responseBody.equal, false);
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
