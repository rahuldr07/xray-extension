// src/panel/runtime/sqlHudOptions.ts: the HUD SQL options are read and written through the service
// worker, which owns them (Ruling M3-R28).
import test from 'node:test';
import assert from 'node:assert/strict';
import './harness.mjs';

const { readSqlHudOptions, writeSqlHudOptions, sqlDatabasesInHudActive, SQL_HUD_OPTIONS_GET, SQL_HUD_OPTIONS_SET } = await import('../../src/panel/runtime/sqlHudOptions.ts');

function withRuntime(answer, fn) {
  const sent = [];
  const prev = globalThis.chrome;
  globalThis.chrome = { runtime: { sendMessage: (msg, cb) => { sent.push(msg); setImmediate(() => cb(answer(msg))); } } };
  return fn(sent).finally(() => { globalThis.chrome = prev; });
}

test('saved databases in the HUD need both options on', () => {
  for (const [inline, databases, want] of [[false, false, false], [false, true, false], [true, false, false], [true, true, true]]) {
    assert.equal(sqlDatabasesInHudActive({ sqlInlineInHud: inline, sqlDatabasesInHud: databases }), want);
  }
});

test('reads ask the worker; no worker reads as both off', async () => {
  await withRuntime(() => ({ ok: true, value: { sqlInlineInHud: true, sqlDatabasesInHud: 'yes' } }), async (sent) => {
    assert.deepEqual(await readSqlHudOptions(), { sqlInlineInHud: true, sqlDatabasesInHud: false });
    assert.deepEqual(sent, [{ type: SQL_HUD_OPTIONS_GET }]);
  });
  const prev = globalThis.chrome;
  globalThis.chrome = undefined;
  try {
    assert.deepEqual(await readSqlHudOptions(), { sqlInlineInHud: false, sqlDatabasesInHud: false });
  } finally {
    globalThis.chrome = prev;
  }
});

test('a write the worker refuses rejects with its message', async () => {
  await withRuntime(() => ({ ok: false, error: 'Change this in XRAY’s settings page.' }), async (sent) => {
    await assert.rejects(writeSqlHudOptions({ sqlInlineInHud: true }), /Change this in XRAY’s settings page\./);
    assert.deepEqual(sent, [{ type: SQL_HUD_OPTIONS_SET, options: { sqlInlineInHud: true } }]);
  });
  await withRuntime((msg) => ({ ok: true, value: msg.options }), async () => {
    assert.deepEqual(await writeSqlHudOptions({ sqlInlineInHud: true, sqlDatabasesInHud: true }), { sqlInlineInHud: true, sqlDatabasesInHud: true });
  });
});
