import test from 'node:test';
import assert from 'node:assert/strict';
await import('./harness.mjs');
const E = await import('../../src/panel/models/sessionEnvelope.ts');
const CB = await import('../../src/panel/models/capturedBody.ts');
const LV = await import('../../src/panel/models/logValue.ts');
const storage = (value) => JSON.parse(JSON.stringify(value));

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
  assert.equal(migrated.schemaVersion, 2);
  assert.equal(E.SESSION_SCHEMA_VERSION, 2, 'v2: bodies are saved as text with truncation metadata, logs in the typed model');
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
  // Saving what was restored writes the same envelope (the stored form keeps a log's value as JSON text).
  assert.deepEqual(JSON.parse(JSON.stringify(E.createSessionEnvelope(restored))), JSON.parse(JSON.stringify(created)));
  assert.equal(restored.entries[1].logData, '', 'restored entries are the panel’s form: logData, not its stored text');
  assert.equal(restored.entries[1].logDataJson, undefined);
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

test('enforces 500 entries and the session budget (J9: cuts are metadata)', () => {
  const entries = Array.from({ length: 520 }, (_, index) => entry(`e${index}`, 'api', { responseRaw: 'x'.repeat(50_000) }));
  const envelope = E.createSessionEnvelope({ entries });
  assert.equal(envelope.entries.length, 500);
  assert.equal(envelope.entries[0].id, 'e20');
  // 6,000,000 bytes, every saved field counted, keep the newest ~119 bodies whole; every older one keeps its first 2,048.
  const whole = envelope.entries.filter((item) => item.responseRaw.length === 50_000).length;
  assert.ok(whole >= 115 && whole <= 119, `${whole} bodies whole`);
  assert.ok(envelope.entries.slice(-whole).every((item) => item.responseRaw.length === 50_000), 'the newest ones');
  assert.equal(envelope.entries[0].responseRaw.length, 2_048);
  assert.deepEqual(envelope.entries[0].responseTruncated, { totalChars: 50_000, keptChars: 2_048 });
  assert.ok(envelope.entries.every((item) => !item.responseRaw.endsWith('…')));
});

// The reviewer's probe (fix round 1): about 15,000 characters of JSON per response.
const probeBodies = new Map();
const probeBody = (i) => {
  if (probeBodies.has(i)) return probeBodies.get(i);
  const rows = [];
  let text = '';
  for (let r = 0; text.length < 15_000; r++) {
    rows.push(`{"id":${i * 1_000 + r},"name":"item-${r}","tags":["a","b"],"note":"${'n'.repeat(60)}"}`);
    text = `{"page":${i},"items":[${rows.join(',')}]}`;
  }
  probeBodies.set(i, text);
  return text;
};

test('Fix 1 (ruling): a v1 session of 400 × 15 KB JSON responses migrates with every body whole and Tree-parseable', () => {
  const v1 = { schemaVersion: 1, sessionId: 'probe', createdAt: 1, updatedAt: 2, source: {}, entries: Array.from({ length: 400 }, (_, i) =>
    entry(`p${i}`, 'api', { responseRaw: probeBody(i), responseHeaders: { 'content-type': 'application/json' }, size: probeBody(i).length })) };
  const bytes = new TextEncoder().encode(JSON.stringify(v1)).length;
  assert.ok(bytes > 6_000_000, `the probe is over the save budget as storage counts it (${bytes} bytes)`);
  const session = E.migrateSessionEnvelope(storage(v1), { now: 5 });
  assert.equal(session.entries.length, 400);
  session.entries.forEach((item, i) => {
    assert.equal(item.responseRaw, probeBody(i), `p${i}: every character v1 kept`);
    assert.equal(item.responseTruncated, undefined, `p${i}: no cut`);
    const doc = CB.bodyDoc(CB.responseBody(item));
    assert.ok(doc && doc.ok && doc.root.t === 'obj', `p${i}: Tree-parseable`);
  });
  // A v1 log keeps what v1 kept too: migration reads logs under content.js's own limits, not the save bound.
  const cutLog = 'c'.repeat(20_000) + '…';
  const logs = E.migrateSessionEnvelope({ schemaVersion: 1, entries: [entry('l', 'log', { logData: cutLog })] }, { now: 5 });
  assert.equal(logs.entries[0].logData, cutLog);
});

test('Fix 2 (ruling): the probe survives migration and two later saves with all 400 legacy bodies whole; a new 50 KB capture is floored; evicting legacy frees budget', () => {
  const v1 = { schemaVersion: 1, entries: Array.from({ length: 400 }, (_, i) =>
    entry(`p${i}`, 'api', { responseRaw: probeBody(i), responseHeaders: { 'content-type': 'application/json' } })) };
  const whole = (entries) => entries.filter((item) => item.id.startsWith('p')).every((item) =>
    item.responseRaw === probeBody(Number(item.id.slice(1))) && item.responseTruncated === undefined && item.legacySession === true);
  const migrated = E.migrateSessionEnvelope(storage(v1), { now: 5 });
  assert.ok(whole(migrated.entries), 'migration: every legacy body whole, each flagged');
  const first = storage(E.createSessionEnvelope(migrated));
  assert.ok(whole(first.entries), 'first save: still whole (exempt from the body budget)');
  const second = storage(E.createSessionEnvelope(E.migrateSessionEnvelope(first, { now: 6 })));
  assert.ok(whole(second.entries), 'second save, after a restore: still whole');
  assert.equal(second.entries.length, 400);

  // New captures share what the legacy entries leave of the budget — nothing here, so a new 50 KB
  // body falls to the 2 KB floor, with metadata.
  const restored = E.migrateSessionEnvelope(second, { now: 7 });
  const fresh = entry('new', 'api', { responseRaw: 'n'.repeat(50_000) });
  const withNew = storage(E.createSessionEnvelope({ ...restored, entries: [...restored.entries, fresh] }));
  assert.ok(whole(withNew.entries), 'legacy bodies stay whole beside new captures');
  const saved = withNew.entries.find((item) => item.id === 'new');
  assert.equal(saved.responseRaw.length, 2_048);
  assert.deepEqual(saved.responseTruncated, { totalChars: 50_000, keptChars: 2_048 });
  assert.equal(saved.legacySession, undefined, 'a new capture is never legacy');

  // Legacy entries that leave the session (maxEntries eviction, Clear) free their share of the budget.
  const fewer = storage(E.createSessionEnvelope({ ...restored, entries: [...restored.entries.slice(-100), fresh] }));
  assert.ok(whole(fewer.entries));
  assert.equal(fewer.entries.find((item) => item.id === 'new').responseRaw.length, 50_000, 'the new body is whole again');
});

test('legacy session restore: sessions stored before J9 load without errors and show their cuts as banners', () => {
  const kept = ('{"rows":[' + '"x",'.repeat(5_000)).slice(0, 20_000);
  assert.equal(kept.length, 20_000);
  const v1 = {
    schemaVersion: 1, sessionId: 'old', createdAt: 1, updatedAt: 2, source: {},
    entries: [
      // Before J4/J6: an in-band suffix (it survived the old 20,000 cut only in a short text) …
      entry('suffix', 'api', { responseRaw: '[1,2,3\n... truncated 500 chars', size: 600 }),
      // … the old persistence cut, 20,000 characters and "…", total unknown but for the byte size …
      entry('cut', 'api', { responseRaw: kept + '…', size: 32_300 }),
      entry('cut-nosize', 'api', { responseRaw: kept + '…', size: 0 }),
      // … parsed-only request bodies, whole and cut …
      entry('parsed-req', 'api', { method: 'POST', requestBody: { b: 1, a: 2 } }),
      entry('cut-req', 'api', { method: 'POST', requestBody: kept + '…' }),
      // … and logs in their pre-model shapes.
      entry('ref-log', 'log', { message: 'obj', logData: { a: 1, __xray_ref__: 'r1' } }),
      entry('error-log', 'log', { logData: { __type__: 'Error', name: 'TypeError', message: 'boom', stack: 'TypeError: boom\n    at x' } }),
      entry('fn-log', 'log', { logData: '[Function: load]' }),
      entry('task1-log', 'log', { logData: { __type__: 'function', name: 'f' } }),
      entry('more-log', 'log', { logData: [1, 2, '... +8 more'] }),
      // After J4/J6, before J9: capture metadata over a text the old persistence cut (keptChars disagreed).
      entry('task3', 'api', { responseRaw: kept + '…', responseTruncated: { totalChars: 938_891, keptChars: 250_000 }, size: 938_891 }),
      entry('task3-req', 'api', { method: 'POST', requestBodyKind: 'text', requestBodyText: 'q'.repeat(20_000),
        requestTruncated: { totalChars: 30_000, keptChars: 20_000 }, requestBody: 'q'.repeat(20_000) + '…' }),
    ],
  };
  for (const stored of [v1, v1.entries]) {
    const session = E.migrateSessionEnvelope(storage(stored), { now: 5 });
    assert.equal(session.schemaVersion, 2);
    const byId = Object.fromEntries(session.entries.map((item) => [item.id, item]));
    const notice = (id, side = 'response') => CB.truncationNotice(CB.entryBody(byId[id], side));

    assert.equal(byId.suffix.responseRaw, '[1,2,3', 'the in-band suffix becomes metadata');
    assert.deepEqual(byId.suffix.responseTruncated, { keptChars: 6, totalChars: 506 });
    assert.equal(notice('suffix'), 'Response truncated: showing the first 6 of 506 characters');

    assert.equal(byId.cut.responseRaw, kept, 'the old cut loses its "…"');
    assert.deepEqual(byId.cut.responseTruncated, { keptChars: 20_000, totalBytes: 32_300 });
    assert.equal(notice('cut'), 'Response truncated: showing the first 20,000 characters of 32,300 bytes');
    assert.deepEqual(byId['cut-nosize'].responseTruncated, { keptChars: 20_000 });
    assert.equal(notice('cut-nosize'), 'Response truncated: showing the first 20,000 characters');
    assert.equal(CB.bodyDoc(CB.responseBody(byId.cut)), null, 'a cut body is not offered as JSON');

    assert.deepEqual(byId.task3.responseTruncated, { totalChars: 938_891, keptChars: 20_000 }, 'the capture total stays, keptChars is fixed');
    assert.equal(notice('task3'), 'Response truncated: showing the first 20,000 of 938,891 characters');
    assert.equal(byId['task3-req'].requestBodyText.length, 20_000);
    assert.deepEqual(byId['task3-req'].requestTruncated, { totalChars: 30_000, keptChars: 20_000 });
    assert.equal(byId['task3-req'].requestBody, undefined, 'a cut parsed copy is not kept');

    assert.deepEqual(byId['parsed-req'].requestBody, { b: 1, a: 2 });
    assert.equal(CB.requestBody(byId['parsed-req']).kind, 'value');
    assert.equal(byId['cut-req'].requestBody, kept);
    assert.deepEqual(byId['cut-req'].requestTruncated, { keptChars: 20_000 });
    assert.equal(notice('cut-req', 'request'), 'Request truncated: showing the first 20,000 characters');

    for (const id of ['ref-log', 'error-log', 'fn-log', 'task1-log', 'more-log']) assert.ok(LV.isTypedLog(byId[id]), id);
    assert.doesNotMatch(JSON.stringify(session), /__xray_ref__|__type__/);
    assert.deepEqual(LV.logArgs(byId['ref-log']), [{ a: 1 }]);
    assert.equal(LV.logErrorInfo(LV.logArgs(byId['error-log'])[0]).message, 'boom');
    assert.equal(LV.logArgsText(LV.logArgs(byId['fn-log'])), 'ƒ load()');
    assert.equal(LV.logArgsText(LV.logArgs(byId['task1-log'])), 'ƒ f()');
    assert.equal(LV.logArgsText(LV.logArgs(byId['more-log'])), '[1,2,…8 more]');

    for (const item of session.entries) {
      for (const [text, cut] of [[item.responseRaw, item.responseTruncated], [item.requestBodyText ?? item.requestBody, item.requestTruncated]]) {
        if (cut) assert.equal(cut.keptChars, text.length, `${item.id}: keptChars matches the saved text`);
      }
    }
    assert.deepEqual(storage(E.migrateSessionEnvelope(storage(session), { now: 6 })).entries, storage(session).entries, 'migrating twice changes nothing');
  }
});

test('a v2 session is never re-read as legacy: a body that ends like an old marker is just text', () => {
  const suffix = '{"note":"x"}\n... truncated 12 chars';
  const ellipsis = 'e'.repeat(19_999) + 'z…';
  const created = E.createSessionEnvelope({ entries: [entry('s', 'api', { responseRaw: suffix }), entry('e', 'api', { responseRaw: ellipsis, size: 50_000 })] });
  const restored = E.migrateSessionEnvelope(storage(created), { now: 9 });
  assert.equal(restored.entries[0].responseRaw, suffix);
  assert.equal(restored.entries[0].responseTruncated, undefined);
  assert.equal(CB.responseBody(restored.entries[0]).truncation, null, 'a live or v2 body is never read as cut');
  assert.equal(restored.entries[1].responseRaw, ellipsis);
  assert.equal(restored.entries[1].responseTruncated, undefined);
  // A future version is not migrated as legacy either (its fields are kept, tracker issue #3 aside).
  const future = E.migrateSessionEnvelope({ ...storage(created), schemaVersion: 3 }, { now: 9 });
  assert.equal(future.entries[1].responseRaw, ellipsis);
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
