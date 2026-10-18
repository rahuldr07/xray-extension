import test from 'node:test';
import assert from 'node:assert/strict';
import './harness.mjs';

const { isReplayableEntry, replayabilityReason } = await import('../../src/panel/models/replayability.ts');

const api = { id: 'request', type: 'api', source: 'fetch', url: 'http://example.test/api' };

for (const [label, entry] of [
  ['HTTP fetch', api],
  ['HTTPS XHR', { ...api, source: 'xhr', url: 'https://example.test/api' }],
  ['HTTPS GraphQL over HTTP', { ...api, url: 'https://example.test/graphql', graphql: { operationType: 'query', operationName: 'Users' } }],
  ['HTTP capture without a source', { ...api, source: undefined }],
]) {
  test(`${label} is replayable without an unavailable reason`, () => {
    assert.equal(isReplayableEntry(entry), true);
    assert.equal(replayabilityReason(entry), null);
  });
}

const unavailable = [
  ['no selection', null],
  ['log with an HTTP URL', { ...api, type: 'log' }],
  ['WebSocket', { ...api, source: 'ws', url: 'wss://example.test/socket' }],
  ['WebSocket with an HTTP URL', { ...api, source: 'ws' }],
  ['SSE with an HTTPS URL', { ...api, source: 'sse', url: 'https://example.test/events' }],
  ['missing URL despite a URL path', { ...api, url: undefined, urlPath: '/api' }],
  ['empty URL', { ...api, url: '' }],
  ['file URL', { ...api, url: 'file:///private/secret' }],
  ['unsupported data URL', { ...api, url: 'data:text/plain,secret' }],
  ['malformed URL', { ...api, url: 'https://[broken' }],
  ['relative URL', { ...api, url: '/api' }],
];

for (const [label, entry] of unavailable) {
  test(`${label} is not replayable and has a bounded reason`, () => {
    assert.equal(isReplayableEntry(entry), false);
    const reason = replayabilityReason(entry);
    assert.equal(typeof reason, 'string');
    assert.ok(reason.length > 0 && reason.length <= 100);
    assert.doesNotMatch(reason, /[\r\n]/);
  });
}

test('unavailable reasons never contain credential, payload, URL, or bridge error data', () => {
  for (const [, entry] of unavailable.filter(([, value]) => value)) {
    const reason = replayabilityReason({ ...entry,
      requestHeaders: { authorization: 'Bearer secret-auth', cookie: 'secret-cookie' },
      requestBody: { password: 'secret-body' }, responseRaw: 'secret-response',
      error: 'bridge-error-secret',
    });
    assert.doesNotMatch(reason, /secret|authorization|cookie|password|bridge-error|example\.test|private|broken/i);
    assert.equal(reason, replayabilityReason(entry));
  }
});

test('capability checks never read or normalize sensitive payload fields', () => {
  const entry = { ...api };
  for (const field of ['requestHeaders', 'responseHeaders', 'requestBody', 'responseRaw', 'error']) {
    Object.defineProperty(entry, field, { get() { throw new Error('Payload must not be inspected'); } });
  }
  assert.equal(isReplayableEntry(entry), true);
  assert.equal(replayabilityReason(entry), null);
});

test('stream methods and ws URLs are not replayable even with an HTTP-looking source', () => {
  assert.equal(isReplayableEntry({ ...api, source: 'import', method: 'WS' }), false);
  assert.equal(isReplayableEntry({ ...api, source: 'fetch', method: 'sse' }), false);
  assert.equal(isReplayableEntry({ ...api, method: 'POST' }), true);
});
