/* Behavioural tests for src/panel/models/drift.ts.

   drift.ts memoizes both the schema signature and the group path in plain Maps
   keyed by entry.id, and those Maps never self-invalidate. Every fixture below
   therefore gets a process-unique id (harness.apiEntry does this by default) so
   no test can be poisoned by a neighbour. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { drift as DR, apiEntry, logEntry, assertSchemaFallback } from './harness.mjs';

const { buildDriftIndex, detectDrift, noteDriftEntry, schemaSignature } = DR;

const body = (value) => JSON.stringify(value);

// ------------------------------------------------------------ schemaSignature

test('schemaSignature is stable across values but sensitive to shape', () => {
  assertSchemaFallback(assert);
  const a = apiEntry({ responseRaw: body({ id: 1, name: 'a', tags: ['x'] }) });
  const b = apiEntry({ responseRaw: body({ id: 999, name: 'zzz', tags: ['y', 'z'] }) });
  const c = apiEntry({ responseRaw: body({ id: 1, name: 'a' }) });
  const d = apiEntry({ responseRaw: body({ id: '1', name: 'a', tags: ['x'] }) });

  assert.notEqual(schemaSignature(a), '');
  assert.equal(schemaSignature(a), schemaSignature(b), 'different values, same shape');
  assert.notEqual(schemaSignature(a), schemaSignature(c), 'a missing key is drift');
  assert.notEqual(schemaSignature(a), schemaSignature(d), 'a changed leaf type is drift');
});

test('schemaSignature is empty for non-API, error, pending and body-less entries', () => {
  assert.equal(schemaSignature(logEntry()), '');
  assert.equal(schemaSignature(apiEntry({ status: 400, responseRaw: body({ a: 1 }) })), '');
  assert.equal(schemaSignature(apiEntry({ status: 500, responseRaw: body({ a: 1 }) })), '');
  assert.equal(schemaSignature(apiEntry({ status: 0, responseRaw: body({ a: 1 }) })), '', 'status 0 = still in flight');
  assert.equal(schemaSignature(apiEntry({ responseRaw: null, response: null, responseDecrypted: null })), '');
  assert.notEqual(schemaSignature(apiEntry({ status: 399, responseRaw: body({ a: 1 }) })), '', '3xx still yields a signature');
});

test('schemaSignature prefers the decrypted body', () => {
  const plain = apiEntry({ responseRaw: body({ a: 1 }), responseDecrypted: null });
  const decrypted = apiEntry({ responseRaw: body({ a: 1 }), responseDecrypted: body({ a: 1, extra: true }) });
  assert.notEqual(schemaSignature(plain), schemaSignature(decrypted));
});

// -------------------------------------------------------------- drift index

test('buildDriftIndex keeps the newest signature-bearing entry per group path', () => {
  const first = apiEntry({ urlPath: '/a', responseRaw: body({ a: 1 }) });
  const second = apiEntry({ urlPath: '/a', responseRaw: body({ a: 2 }) });
  const other = apiEntry({ urlPath: '/b', responseRaw: body({ b: 1 }) });
  const index = buildDriftIndex([first, second, other]);
  assert.equal(index.size, 2);
  assert.equal(index.get('/a').id, second.id);
  assert.equal(index.get('/b').id, other.id);
});

test('noteDriftEntry skips entries that cannot mask an older baseline', () => {
  const good = apiEntry({ urlPath: '/a', responseRaw: body({ a: 1 }) });
  const index = buildDriftIndex([good]);
  noteDriftEntry(index, apiEntry({ urlPath: '/a', status: 500, responseRaw: body({ error: 'x' }) }));
  noteDriftEntry(index, apiEntry({ urlPath: '/a', responseRaw: null }));
  noteDriftEntry(index, logEntry());
  assert.equal(index.size, 1);
  assert.equal(index.get('/a').id, good.id, 'an error response never becomes the baseline');
});

// -------------------------------------------------------------- detectDrift

test('detectDrift flags a shape change against the previous call to the same endpoint', () => {
  const baseline = apiEntry({ urlPath: '/users', responseRaw: body({ id: 1, name: 'a' }) });
  const drifted = apiEntry({ urlPath: '/users', responseRaw: body({ id: 1, name: 'a', email: 'x' }) });
  assert.deepEqual(detectDrift(drifted, [baseline]), { driftFromId: baseline.id });
});

test('detectDrift returns null when the shape is unchanged or there is no baseline', () => {
  const baseline = apiEntry({ urlPath: '/users', responseRaw: body({ id: 1 }) });
  const same = apiEntry({ urlPath: '/users', responseRaw: body({ id: 7 }) });
  assert.deepEqual(detectDrift(same, [baseline]), { driftFromId: null });
  assert.deepEqual(detectDrift(same, []), { driftFromId: null });
  assert.deepEqual(detectDrift(apiEntry({ status: 503 }), [baseline]), { driftFromId: null }, 'an error has no signature');
  assert.deepEqual(detectDrift(logEntry(), [baseline]), { driftFromId: null });
});

test('detectDrift ignores other endpoints and skips signature-less candidates', () => {
  const other = apiEntry({ urlPath: '/other', responseRaw: body({ totally: 'different' }) });
  const realBaseline = apiEntry({ urlPath: '/users', responseRaw: body({ id: 1 }) });
  const errorSince = apiEntry({ urlPath: '/users', status: 500, responseRaw: body({ error: 'boom' }) });
  const current = apiEntry({ urlPath: '/users', responseRaw: body({ id: 1, extra: 1 }) });
  assert.deepEqual(detectDrift(current, [realBaseline, other, errorSince]), { driftFromId: realBaseline.id });
});

test('detectDrift keeps GraphQL operations on separate baselines', () => {
  const gql = (op, payload) => apiEntry({
    urlPath: '/graphql',
    method: 'POST',
    graphql: { operationType: 'query', operationName: op },
    responseRaw: body(payload),
  });
  const getUser = gql('GetUser', { data: { user: { id: 1 } } });
  const listOrders = gql('ListOrders', { data: { orders: [{ id: 1 }] } });
  const getUserAgain = gql('GetUser', { data: { user: { id: 2 } } });
  const getUserDrifted = gql('GetUser', { data: { user: { id: 2, email: 'x' } } });

  assert.deepEqual(detectDrift(getUserAgain, [getUser, listOrders]), { driftFromId: null }, 'a different operation is not a baseline');
  assert.deepEqual(detectDrift(getUserDrifted, [getUser, listOrders, getUserAgain]), { driftFromId: getUserAgain.id });
});

test('detectDrift never reports an entry as drifting from itself', () => {
  const entry = apiEntry({ urlPath: '/a', responseRaw: body({ a: 1 }) });
  assert.deepEqual(detectDrift(entry, [entry]), { driftFromId: null });
  assert.deepEqual(detectDrift(entry, [entry], buildDriftIndex([entry])), { driftFromId: null });
});

// ------------------------------------- the two code paths must agree exactly

test('detectDrift: the indexed path matches the backwards scan on hand-built cases', () => {
  const baseline = apiEntry({ urlPath: '/a', responseRaw: body({ a: 1 }) });
  const noise = apiEntry({ urlPath: '/b', responseRaw: body({ b: 1 }) });
  const errored = apiEntry({ urlPath: '/a', status: 502, responseRaw: body({ e: 1 }) });
  const current = apiEntry({ urlPath: '/a', responseRaw: body({ a: 1, b: 2 }) });
  const previous = [baseline, noise, errored];

  assert.deepEqual(detectDrift(current, previous), detectDrift(current, previous, buildDriftIndex(previous)));
  assert.deepEqual(detectDrift(current, previous, buildDriftIndex(previous)), { driftFromId: baseline.id });
});

test('PROPERTY: indexed and backwards-scan detectDrift agree over 400 random histories', () => {
  let seed = 20240613;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x1_0000_0000;
  };
  const pick = (list) => list[Math.floor(rand() * list.length)];

  const shapes = [
    { id: 1 },
    { id: 1, name: 'x' },
    { id: 1, tags: ['a'] },
    { items: [{ id: 1 }] },
    [1, 2, 3],
    { id: '1' },
    null,
  ];
  const paths = ['/a', '/b', '/graphql'];
  const statuses = [200, 200, 200, 201, 404, 500, 0];

  let drifted = 0;
  let clean = 0;
  for (let iteration = 0; iteration < 400; iteration += 1) {
    const history = [];
    const length = 1 + Math.floor(rand() * 8);
    for (let i = 0; i < length; i += 1) {
      const shape = pick(shapes);
      const path = pick(paths);
      const op = path === '/graphql' ? { operationType: 'query', operationName: pick(['A', 'B']) } : undefined;
      history.push(rand() < 0.12
        ? logEntry()
        : apiEntry({ urlPath: path, status: pick(statuses), graphql: op, responseRaw: shape === null ? null : body(shape) }));
    }
    const shape = pick(shapes);
    const path = pick(paths);
    const current = apiEntry({
      urlPath: path,
      status: pick(statuses),
      graphql: path === '/graphql' ? { operationType: 'query', operationName: pick(['A', 'B']) } : undefined,
      responseRaw: shape === null ? null : body(shape),
    });

    const scanned = detectDrift(current, history);
    const indexed = detectDrift(current, history, buildDriftIndex(history));
    assert.deepEqual(indexed, scanned, `iteration ${iteration}: index=${indexed.driftFromId} scan=${scanned.driftFromId}`);
    if (scanned.driftFromId) drifted += 1; else clean += 1;
  }
  // Guard against a vacuous property test: both outcomes must actually occur.
  assert.ok(drifted > 20, `expected the random corpus to produce drift, got ${drifted}`);
  assert.ok(clean > 20, `expected the random corpus to produce non-drift, got ${clean}`);
});

test('DIVERGENCE the index is only equivalent when it was built from the same history', () => {
  // The indexed path trusts whatever the caller passed. A stale index (one that
  // never saw the newest baseline) yields an older driftFromId than the scan.
  const older = apiEntry({ urlPath: '/a', responseRaw: body({ a: 1 }) });
  const newer = apiEntry({ urlPath: '/a', responseRaw: body({ a: 1, b: 1 }) });
  const current = apiEntry({ urlPath: '/a', responseRaw: body({ a: 1, b: 1, c: 1 }) });
  const history = [older, newer];

  assert.deepEqual(detectDrift(current, history), { driftFromId: newer.id }, 'scan uses the most recent baseline');
  assert.deepEqual(detectDrift(current, history, buildDriftIndex([older])), { driftFromId: older.id }, 'a stale index blames the older entry');
  assert.deepEqual(detectDrift(current, history, buildDriftIndex(history)), { driftFromId: newer.id }, 'a current index agrees with the scan');
});
