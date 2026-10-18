import test from 'node:test';
import assert from 'node:assert/strict';
import { apiEntry } from './harness.mjs';

const F = await import('../../src/panel/models/findings.ts');

test('deriveFindings emits inclusive slow and HTTP error findings with bounded evidence', () => {
  const entries = [
    apiEntry({ id: 'slow', url: 'https://api.example.test/users?token=secret#frag', urlPath: '/users?token=secret', duration: 500, status: 200, size: 42 }),
    apiEntry({ id: 'error', url: 'https://api.example.test/users', urlPath: '/users', duration: 12, status: 503 }),
  ];
  const state = F.deriveFindings(entries, { sessionId: 'session-1', slowThresholdMs: 500 });
  assert.ok(state.length >= 2);
  const slow = state.find((item) => item.kind === 'slow');
  const error = state.find((item) => item.kind === 'http-error');
  assert.equal(slow?.evidence[0].path, '/users');
  assert.equal(slow?.evidence[0].origin, 'https://api.example.test');
  assert.equal(error?.evidence[0].status, 503);
  assert.equal(JSON.stringify(state).includes('secret'), false);
  assert.equal(JSON.stringify(state).includes('responseRaw'), false);
});

test('deriveFindings groups repeated GraphQL operations independently and detects drift', () => {
  const gql = (id, operationName) => apiEntry({ id, url: 'https://api.example.test/graphql', urlPath: '/graphql', graphql: { operationType: 'query', operationName }, status: 200 });
  const entries = [gql('a', 'GetUser'), gql('b', 'GetUser'), gql('c', 'GetUser'), gql('d', 'ListUsers')];
  entries[3].driftFromId = 'c';
  const findings = F.deriveFindings(entries, { sessionId: 'session-1', slowThresholdMs: 500 });
  const repeated = findings.find((item) => item.kind === 'repeated-endpoint');
  const drift = findings.find((item) => item.kind === 'schema-drift');
  assert.equal(repeated?.evidence.length, 3);
  assert.match(repeated?.title || '', /GetUser/);
  const restored = F.normalizeFindingState({ schemaVersion: 1, sessionId: 'session-1', findings: [repeated], dismissals: {} }, 'session-1');
  assert.match(restored.findings[0].title, /GetUser/);
  assert.ok(drift);
  assert.equal(drift?.evidence.some((item) => item.entryId === 'c'), true);
});

test('reconcile preserves dismissal only while the material fingerprint matches', () => {
  const first = F.reconcileFindingState(
    F.createFindingState('session-1'),
    F.deriveFindings([apiEntry({ id: 'slow', duration: 500 })], { sessionId: 'session-1', slowThresholdMs: 500 }),
  );
  const record = first.findings[0];
  const dismissed = F.dismissFinding(first, record.id);
  assert.equal(F.isFindingDismissed(record, dismissed.dismissals), true);
  const same = F.reconcileFindingState(dismissed, [record]);
  assert.equal(F.isFindingDismissed(same.findings[0], same.dismissals), true);
  const changed = { ...record, fingerprint: `${record.fingerprint}:material-change` };
  const refreshed = F.reconcileFindingState(dismissed, [changed]);
  assert.equal(F.isFindingDismissed(refreshed.findings[0], refreshed.dismissals), false);
  assert.equal(F.isFindingDismissed(refreshed.findings[0], F.restoreFinding(dismissed, record.id).dismissals), false);
});

test('normalizeFindingState bounds records and references and leaves future versions detectable', () => {
  const evidence = { entryId: 'entry', sessionId: 'session-1', role: 'related', path: '/safe', origin: 'https://safe.test', method: 'GET', status: 200, durationMs: 1, size: 2, timestamp: 3, rawBody: 'must not survive' };
  const input = {
    schemaVersion: 1,
    sessionId: 'session-1',
    findings: Array.from({ length: 120 }, (_, index) => ({
      id: `finding-${index}`,
      kind: 'slow', severity: 'warning', title: 'Slow', summary: 'summary', fingerprint: `fp-${index}`,
      sessionId: 'session-1', createdAt: 1, updatedAt: 2, active: true,
      evidence: Array.from({ length: 8 }, () => evidence),
    })),
    dismissals: { 'finding-0': 'fp-0' },
  };
  const normalized = F.normalizeFindingState(input, 'session-1');
  assert.equal(normalized.schemaVersion, 1);
  assert.equal(normalized.findings.length, 100);
  assert.equal(normalized.findings[0].evidence.length, 5);
  assert.equal(normalized.findings[0].evidence[0].sessionId, 'session-1');
  assert.equal(JSON.stringify(normalized).includes('rawBody'), false);
  assert.equal(F.isFutureFindingState({ schemaVersion: 2 }), true);
  assert.equal(F.isUnsupportedFindingState({ schemaVersion: 2 }), true);
});

test('repeated claim identity and dismissal survive count growth and query changes', () => {
  const entries = Array.from({ length: 3 }, (_, index) => apiEntry({ id: `repeat-${index}`, url: `https://same.test/items?page=${index}`, urlPath: '/items', duration: 10 }));
  const initial = F.reconcileFindingState(F.createFindingState('s'), F.deriveFindings(entries, { sessionId: 's', slowThresholdMs: 500 }));
  const record = initial.findings[0];
  const dismissed = F.dismissFinding(initial, record.id);
  const next = F.reconcileFindingState(dismissed, F.deriveFindings([...entries, apiEntry({ id: 'repeat-3', url: 'https://same.test/items?page=4', urlPath: '/items', duration: 10 })], { sessionId: 's', slowThresholdMs: 500 }));
  assert.equal(next.findings[0].id, record.id);
  assert.equal(next.findings[0].fingerprint, record.fingerprint);
  assert.equal(F.isFindingDismissed(next.findings[0], next.dismissals), true);
  assert.equal(next.findings[0].evidence.length, 4);
  assert.equal(dismissed.findings[0].evidence.length, 3, 'reconciliation is pure');
  const history = F.reconcileFindingState(next, []);
  assert.equal(history.findings[0].active, false);
  assert.deepEqual(history.findings[0].evidence, next.findings[0].evidence, 'eviction preserves compact evidence');
  assert.deepEqual(F.restoreFinding(history, record.id).dismissals, {});
  assert.equal(F.dismissFinding(initial, 'missing'), initial);
  assert.equal(F.restoreFinding(initial, 'missing'), initial);
});

test('drift reconciliation retains compact baseline facts after its entry is evicted', () => {
  const baseline = apiEntry({ id: 'baseline', duration: 10, timestamp: 1 });
  const current = apiEntry({ id: 'current', duration: 10, timestamp: 2, driftFromId: 'baseline' });
  const initial = F.reconcileFindingState(F.createFindingState('s'), F.deriveFindings([baseline, current], { sessionId: 's', slowThresholdMs: 500 }));
  const refreshed = F.reconcileFindingState(initial, F.deriveFindings([current], { sessionId: 's', slowThresholdMs: 500 }));
  assert.deepEqual(refreshed.findings[0].evidence[0], initial.findings[0].evidence[0]);
});

test('derivation bounds records/refs, isolates origins and methods, and materially changes slow/error fingerprints', () => {
  const entries = Array.from({ length: 120 }, (_, index) => apiEntry({ id: `bounded-${index}`, url: `https://safe.test/items/${index}`, duration: 500 }));
  assert.equal(F.deriveFindings(entries, { sessionId: 's', slowThresholdMs: 500 }).length, 100);
  const repeat = F.deriveFindings(entries.slice(0, 12).map(entry => ({ ...entry, duration: 10, url: 'https://safe.test/repeated' })), { sessionId: 's', slowThresholdMs: 500 })[0];
  assert.equal(repeat.evidence.length, 5);
  const initial = F.deriveFindings([apiEntry({ id: 'patch', status: 404, duration: 500 })], { sessionId: 's', slowThresholdMs: 500 });
  const changed = F.deriveFindings([apiEntry({ id: 'patch', status: 503, duration: 1000 })], { sessionId: 's', slowThresholdMs: 500 });
  for (const record of initial) {
    const update = changed.find(item => item.kind === record.kind);
    assert.equal(update.id, record.id);
    assert.notEqual(update.fingerprint, record.fingerprint);
  }
  const isolated = [apiEntry({ url: 'https://one.test/a' }), apiEntry({ url: 'https://two.test/a' }), apiEntry({ url: 'https://one.test/a', method: 'POST' })];
  assert.equal(F.deriveFindings(isolated, { sessionId: 's', slowThresholdMs: 500 }).length, 0);
});

test('normalization rejects cross-session refs, arbitrary claims, getters and unsafe URL metadata', () => {
  const record = F.deriveFindings([apiEntry({ id: 'one', duration: 700 })], { sessionId: 's', slowThresholdMs: 500 })[0];
  const untrusted = { ...record, title: 'secret=title', summary: 'RAW_BODY', severity: 'secret', body: 'RAW_BODY', evidence: [
    { ...record.evidence[0], path: 'https://user:password@safe.test/items?token=QUERY_SECRET#HASH_SECRET', origin: 'https://user:password@safe.test?token=QUERY_SECRET#HASH_SECRET' },
    { ...record.evidence[0], entryId: 'other', sessionId: 'wrong-session' },
  ] };
  let reads = 0;
  Object.defineProperty(untrusted, 'createdAt', { get() { reads++; throw new Error('must not execute'); } });
  const normalized = F.normalizeFindingState({ schemaVersion: 1, sessionId: 's', findings: [untrusted], dismissals: {} }, 's');
  assert.equal(reads, 0);
  assert.equal(normalized.findings[0].evidence.length, 1);
  assert.equal(normalized.findings[0].evidence[0].path, '/items');
  assert.equal(normalized.findings[0].evidence[0].origin, 'https://safe.test');
  assert.equal(normalized.findings[0].title, 'Slow request');
  assert.equal(/password|QUERY_SECRET|HASH_SECRET|RAW_BODY|secret/.test(JSON.stringify(normalized)), false);
  assert.deepEqual(F.normalizeFindingState({ schemaVersion: 2, sessionId: 's', findings: [record] }, 's').findings, []);
  assert.deepEqual(F.normalizeFindingState(null, 's'), F.createFindingState('s'));
  assert.deepEqual(F.normalizeFindingState({ schemaVersion: 1, sessionId: 'wrong', findings: [record] }, 's').findings, []);
});

test('finding synthesis is a frozen, bounded compact-facts preview without bodies', () => {
  const record = F.deriveFindings([apiEntry({ id: 'one', duration: 900, requestBody: { secret: 'body' }, responseRaw: 'body' })], { sessionId: 'session-1', slowThresholdMs: 500 })[0];
  const preview = F.prepareFindingSynthesisContext([record], { provider: 'openai', model: 'test', baseUrl: 'https://api.openai.com/v1/chat/completions', authHeader: 'authorization', authPrefix: 'Bearer ' });
  assert.ok(preview.prompt.length <= 40_000);
  assert.match(preview.prompt, /slow/i);
  assert.equal(preview.prompt.includes('secret'), false);
  assert.equal(preview.prompt.includes('responseRaw'), false);
  assert.equal(Object.isFrozen(preview), true);
});
