import test from 'node:test';
import assert from 'node:assert/strict';
await import('./harness.mjs');
const E = await import('../../src/panel/models/sessionEnvelope.ts');

const entry = (id, type = 'api', overrides = {}) => ({
  id,
  type,
  timestamp: 1_700_000_000_000,
  status: type === 'api' ? 200 : undefined,
  url: type === 'api' ? 'https://api.example.test/items?token=secret' : undefined,
  responseRaw: type === 'api' ? 'ok' : undefined,
  ...overrides,
});

test('migrates a legacy session_entries array into a versioned envelope', () => {
  const migrated = E.migrateSessionEnvelope([entry('a'), entry('l', 'log')], { now: 123, sessionId: 's1' });
  assert.equal(migrated.schemaVersion, 1);
  assert.equal(migrated.sessionId, 's1');
  assert.equal(migrated.createdAt, 123);
  assert.equal(migrated.entryCount, 2);
  assert.deepEqual(migrated.entries.map(({ id }) => id), ['a', 'l']);
});

test('current envelope survives JSON round-trip with recomputed summaries', () => {
  const created = E.createSessionEnvelope({
    sessionId: 'round-trip',
    createdAt: 10,
    updatedAt: 20,
    entries: [entry('a'), entry('b', 'log')],
    source: { url: 'https://app.example.test/page?token=secret', title: 'XRAY' },
  });
  const restored = E.migrateSessionEnvelope(JSON.parse(JSON.stringify(created)), { now: 30 });
  assert.deepEqual(JSON.parse(JSON.stringify(restored)), JSON.parse(JSON.stringify(created)));
  assert.equal(restored.source.origin, 'https://app.example.test');
  assert.equal(restored.source.url, undefined);
});

test('summarizes API/log counts and latest entry timestamp', () => {
  assert.deepEqual(E.summarizeSessionEntries([
    entry('old', 'api', { timestamp: 4 }),
    entry('new', 'api', { timestamp: 9 }),
    entry('log', 'log', { timestamp: 7 }),
  ]), { entryCount: 3, apiCount: 2, logCount: 1, lastEntryAt: 9 });
  assert.deepEqual(E.summarizeSessionEntries([]), { entryCount: 0, apiCount: 0, logCount: 0, lastEntryAt: null });
});

test('updates runtime health by aggregate counters without retaining raw errors or payloads', () => {
  const initial = E.createSessionEnvelope({ sessionId: 'health', createdAt: 1, now: 1 }).runtime;
  const updated = E.updateRuntimeHealth(initial, {
    health: 'degraded',
    captureRouteState: 'healthy',
    workerState: 'degraded',
    lastEventAt: 44,
    lastErrorCode: 'worker_timeout',
    accepted: 3,
    dropped: 2,
    error: 'token=secret and full payload',
    payload: { secret: 'do-not-store' },
  });
  assert.equal(updated.health, 'degraded');
  assert.equal(updated.acceptedCount, 3);
  assert.equal(updated.droppedCount, 2);
  assert.equal(updated.lastErrorCode, 'worker_timeout');
  assert.equal('error' in updated, false);
  assert.equal('payload' in updated, false);
});

test('enforces 500 entries and existing body serialization bounds', () => {
  const entries = Array.from({ length: 520 }, (_, index) => entry(`e${index}`, 'api', { responseRaw: 'x'.repeat(50_000) }));
  const envelope = E.createSessionEnvelope({ entries });
  assert.equal(envelope.entries.length, 500);
  assert.equal(envelope.entries[0].id, 'e20');
  assert.equal(envelope.entries[0].responseRaw.length, 20_001);
});

test('malformed input is safe and reset produces an empty envelope', () => {
  for (const value of [null, undefined, 'bad', 42, {}, { entries: 'bad' }]) {
    assert.doesNotThrow(() => E.migrateSessionEnvelope(value, { now: 5, sessionId: 'safe' }));
    assert.deepEqual(E.migrateSessionEnvelope(value, { now: 5, sessionId: 'safe' }).entries, []);
  }
  const reset = E.clearSessionEnvelope({ now: 8, sessionId: 'reset' });
  assert.equal(reset.entryCount, 0);
  assert.equal(reset.sessionId, 'reset');
  assert.equal(reset.runtime.acceptedCount, 0);
});
