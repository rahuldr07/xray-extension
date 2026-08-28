/* Behavioural tests for src/panel/models/lenses.ts and operations.ts.

   lenses.decodeJwt reads Date.now() to decide `expired`, so the clock is frozen
   for the duration of each test that depends on it. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { lenses as L, operations as O, apiEntry, assertSchemaFallback } from './harness.mjs';

const { decodeJwt, extractJwts } = L;
const { getResponseOperations } = O;

const NOW_MS = 1_700_000_000_000; // 2023-11-14T22:13:20Z
const NOW_S = NOW_MS / 1000;

function withFrozenClock(fn) {
  const realNow = Date.now;
  Date.now = () => NOW_MS;
  try {
    return fn();
  } finally {
    Date.now = realNow;
  }
}

const b64url = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const jwt = (payload, header = { alg: 'HS256', typ: 'JWT' }) => `${b64url(header)}.${b64url(payload)}.sig`;

// ------------------------------------------------------------------- lenses

test('decodeJwt decodes header and payload and derives ISO timestamps', () => {
  withFrozenClock(() => {
    const token = jwt({ sub: 'user-1', iat: NOW_S - 3600, exp: NOW_S + 3600 });
    const decoded = decodeJwt(token, 'requestBody.token');
    assert.equal(decoded.source, 'requestBody.token');
    assert.equal(decoded.raw, token);
    assert.deepEqual(decoded.header, { alg: 'HS256', typ: 'JWT' });
    assert.equal(decoded.payload.sub, 'user-1');
    assert.equal(decoded.issuedAt, new Date((NOW_S - 3600) * 1000).toISOString());
    assert.equal(decoded.expiresAt, new Date((NOW_S + 3600) * 1000).toISOString());
    assert.equal(decoded.expired, false);
  });
});

test('decodeJwt reports expiry against a frozen clock, including the exact boundary', () => {
  withFrozenClock(() => {
    assert.equal(decodeJwt(jwt({ exp: NOW_S - 1 }), 's').expired, true);
    assert.equal(decodeJwt(jwt({ exp: NOW_S }), 's').expired, false, 'exp == now is not yet expired');
    assert.equal(decodeJwt(jwt({ exp: NOW_S + 1 }), 's').expired, false);
    assert.equal(decodeJwt(jwt({ sub: 'no-exp' }), 's').expired, null, 'no exp claim means unknown, not false');
    assert.equal(decodeJwt(jwt({ exp: 0 }), 's').expiresAt, null, 'a non-positive exp is not a timestamp');
    assert.equal(decodeJwt(jwt({ exp: 'soon' }), 's').expiresAt, null);
  });
});

test('decodeJwt decodes multibyte UTF-8 payloads', () => {
  const decoded = decodeJwt(jwt({ name: 'Ünïcödé 🎯' }), 's');
  assert.equal(decoded.payload.name, 'Ünïcödé 🎯');
});

test('decodeJwt returns null for anything that is not a decodable token', () => {
  assert.equal(decodeJwt('notatoken', 's'), null, 'fewer than two segments');
  assert.equal(decodeJwt('abc.def.ghi', 's'), null, 'both segments fail to parse as JSON');
  assert.equal(decodeJwt('', 's'), null);
  const headerOnly = decodeJwt(`${b64url({ alg: 'none' })}.notjson`, 's');
  assert.ok(headerOnly, 'a decodable header alone is enough');
  assert.equal(headerOnly.payload, null);
});

test('extractJwts scans headers and bodies, de-duplicating repeated tokens', () => {
  withFrozenClock(() => {
    const token = jwt({ sub: 'a', exp: NOW_S + 60 });
    const entry = apiEntry({
      requestHeaders: { 'x-token': token },
      responseHeaders: { 'x-echo': token },
      requestBody: { nested: { auth: token } },
      responseRaw: `{"token":"${token}"}`,
    });
    const found = extractJwts(entry);
    assert.equal(found.length, 1, 'the same token found four times is reported once');
    assert.equal(found[0].source, 'requestHeaders.x-token', 'the first source wins');
    assert.equal(found[0].expired, false);
  });
});

test('extractJwts prefers pre-redaction captured lenses and never exposes the raw token', () => {
  withFrozenClock(() => {
    const entry = apiEntry({
      jwtLenses: [{ source: 'authorization', header: { alg: 'RS256' }, payload: { sub: 'svc', exp: NOW_S - 10, iat: NOW_S - 100 } }],
      requestHeaders: { authorization: '[redacted]' },
      responseRaw: '{}',
    });
    const [lens] = extractJwts(entry);
    assert.equal(lens.source, 'requestHeaders.authorization');
    assert.equal(lens.raw, '[redacted]', 'the raw token never reaches this world');
    assert.deepEqual(lens.header, { alg: 'RS256' });
    assert.equal(lens.expired, true);
    assert.equal(lens.issuedAt, new Date((NOW_S - 100) * 1000).toISOString());
  });
});

test('extractJwts returns [] when there is nothing token-shaped', () => {
  assert.deepEqual(extractJwts(apiEntry({ responseRaw: '{"a":1}' })), []);
  assert.deepEqual(extractJwts(apiEntry({ requestHeaders: { a: 'eyJ-but-not-a-jwt' }, responseRaw: null })), []);
});

test('CAP extractJwts stops at 20 tokens', () => {
  const tokens = Array.from({ length: 40 }, (_, i) => jwt({ sub: `user-${i}` }));
  const entry = apiEntry({ requestHeaders: {}, responseHeaders: {}, requestBody: null, responseRaw: tokens.join(' ') });
  assert.equal(extractJwts(entry).length, 20);

  const lenses = Array.from({ length: 30 }, (_, i) => ({ source: `h${i}`, header: {}, payload: { sub: i } }));
  assert.equal(extractJwts(apiEntry({ jwtLenses: lenses, responseRaw: null })).length, 20);
});

test('extractJwts does not descend past depth 4 in a nested body', () => {
  const token = jwt({ sub: 'deep' });
  const deep = { a: { b: { c: { d: { e: token } } } } };
  const shallow = { a: { b: { c: token } } };
  assert.equal(extractJwts(apiEntry({ requestBody: deep, requestHeaders: {}, responseRaw: null })).length, 0);
  assert.equal(extractJwts(apiEntry({ requestBody: shallow, requestHeaders: {}, responseRaw: null })).length, 1);
});

// --------------------------------------------------------------- operations

const opsById = (ops) => Object.fromEntries(ops.map((op) => [op.id, op]));

test('getResponseOperations always offers the baseline copy/export actions', () => {
  assertSchemaFallback(assert);
  const entry = apiEntry({ responseRaw: '{"a":1}' });
  const ops = getResponseOperations(entry, [entry]);
  const byId = opsById(ops);
  for (const id of ['copy-curl', 'copy-fetch', 'mock', 'send-console', 'save-snippet', 'export']) {
    assert.ok(byId[id], `expected a ${id} operation`);
  }
  assert.ok(byId['copy-curl'].command.startsWith('curl '), 'the local buildCurl fallback is used');
  assert.equal(typeof byId.mock.lazyCommand, 'function', 'expensive payloads are built on click');
  assert.ok(byId.mock.lazyCommand().includes('"a"'));
});

test('getResponseOperations returns a priority-sorted list capped at 14', () => {
  const entry = apiEntry({ status: 500, duration: 5000, size: 500_000, responseRaw: JSON.stringify({ items: Array.from({ length: 5000 }, (_, i) => ({ i, pad: 'x'.repeat(40) })) }) });
  const ops = getResponseOperations(entry, [entry, apiEntry({ status: 500 })]);
  assert.ok(ops.length <= 14, `expected at most 14 operations, got ${ops.length}`);
  for (let i = 1; i < ops.length; i += 1) {
    assert.ok(ops[i - 1].priority >= ops[i].priority, 'operations must be sorted by descending priority');
  }
  assert.equal(new Set(ops.map((op) => op.id)).size, ops.length, 'ids are unique');
});

test('getResponseOperations offers error actions only for 4xx/5xx', () => {
  const failing = apiEntry({ status: 503, responseRaw: '{"error":"x"}' });
  const ok = apiEntry({ status: 200, responseRaw: '{"a":1}' });
  assert.ok(opsById(getResponseOperations(failing, [failing]))['inspect-error']);
  assert.equal(opsById(getResponseOperations(ok, [ok]))['inspect-error'], undefined);
  const withPeers = getResponseOperations(failing, [failing, apiEntry({ status: 500 })]);
  assert.ok(opsById(withPeers)['related-errors'], 'related errors appear when other failures exist');
});

test('getResponseOperations offers structural views only for object-like responses', () => {
  const object = apiEntry({ responseRaw: '{"a":1}' });
  const scalar = apiEntry({ responseRaw: 'just text', size: 9 });
  const objectOps = opsById(getResponseOperations(object, [object]));
  assert.ok(objectOps.schema && objectOps.table && objectOps.visualize);
  const scalarOps = opsById(getResponseOperations(scalar, [scalar]));
  assert.equal(scalarOps.table, undefined);
});

test('getResponseOperations offers headers/request actions for an empty response', () => {
  const empty = apiEntry({ responseRaw: '{}' });
  const byId = opsById(getResponseOperations(empty, [empty]));
  assert.ok(byId.headers);
  assert.ok(byId.request);
});

test('getResponseOperations offers repeat-call actions once an endpoint has 3+ siblings', () => {
  const target = apiEntry({ urlPath: '/hot' });
  const siblings = Array.from({ length: 3 }, () => apiEntry({ urlPath: '/hot' }));
  const byId = opsById(getResponseOperations(target, [target, ...siblings]));
  assert.ok(byId['similar-calls']);
  assert.ok(byId.waterfall);
  assert.ok(byId['slow-calls']);

  const lonely = apiEntry({ urlPath: '/cold' });
  assert.equal(opsById(getResponseOperations(lonely, [lonely]))['slow-calls'], undefined);
});

test('getResponseOperations surfaces diff actions when the endpoint schema drifted', () => {
  const previous = apiEntry({ urlPath: '/users', timestamp: 100, responseRaw: '{"id":1}' });
  const current = apiEntry({ urlPath: '/users', timestamp: 200, responseRaw: '{"id":1,"email":"x"}' });
  const byId = opsById(getResponseOperations(current, [previous, current]));
  assert.ok(byId.diff, 'a schema change offers a diff');

  const stable = apiEntry({ urlPath: '/users', timestamp: 300, responseRaw: '{"id":9}' });
  assert.equal(opsById(getResponseOperations(stable, [previous, stable])).diff, undefined);

  const preflagged = apiEntry({ urlPath: '/x', driftFromId: 'anything', responseRaw: '{"a":1}' });
  assert.ok(opsById(getResponseOperations(preflagged, [preflagged])).diff, 'capture-time drift is trusted directly');
});

test('FIXED operations.ts:55-57 — pushUnique keeps the highest-priority variant, not the first pushed', () => {
  // This entry is slow (priority-78 "Compare Previous", kind console) AND has
  // drifted (priority-87 "Compare Previous", kind view/diff). The slow branch runs
  // first, so the drift branch's stronger variant used to be silently discarded and
  // the button could not open the diff view — while a merely-drifted request got it.
  const previous = apiEntry({ urlPath: '/users', timestamp: 100, duration: 10, responseRaw: '{"id":1}' });
  const current = apiEntry({ urlPath: '/users', timestamp: 200, duration: 5000, responseRaw: '{"id":1,"email":"x"}' });
  const byId = opsById(getResponseOperations(current, [previous, current]));

  assert.ok(byId.diff, 'drift was detected');
  assert.equal(byId['compare-previous'].priority, 87, 'the drift branch priority wins');
  assert.equal(byId['compare-previous'].kind, 'view');
  assert.equal(byId['compare-previous'].view, 'diff', 'so clicking it opens the diff view');

  // Same shape on `schema`: the drift branch (86) now beats the object-response
  // branch (75) and the large-payload branch (69), whatever order they ran in.
  assert.equal(byId.schema.priority, 86);

  // A fast drifted request reached the drift branch first and was always correct;
  // the two paths now agree instead of depending on branch order.
  const fast = apiEntry({ urlPath: '/orders', timestamp: 200, duration: 5, responseRaw: '{"id":1,"email":"x"}' });
  const fastPrevious = apiEntry({ urlPath: '/orders', timestamp: 100, duration: 5, responseRaw: '{"id":1}' });
  const fastById = opsById(getResponseOperations(fast, [fastPrevious, fast]));
  assert.equal(fastById['compare-previous'].priority, 87);
  assert.equal(fastById['compare-previous'].kind, 'view');
  assert.equal(fastById['compare-previous'].view, 'diff');
  assert.deepEqual(byId['compare-previous'], fastById['compare-previous'],
    'slow-and-drifted and fast-and-drifted now produce the identical operation');
});

test('getResponseOperations JSON-escapes the endpoint path it embeds in console commands', () => {
  const nasty = apiEntry({ urlPath: '/a"b\\c', status: 500, responseRaw: '{}' });
  const byId = opsById(getResponseOperations(nasty, [nasty, apiEntry({ status: 500 })]));
  assert.ok(byId['related-errors'].command.includes(JSON.stringify('/a"b\\c')));
  assert.doesNotThrow(() => JSON.parse(byId['related-errors'].command.match(/includes\((".*")\)/)[1]));
});
