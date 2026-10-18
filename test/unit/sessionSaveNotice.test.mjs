/* Spec J9 (plan Task 8): a storage write failure is said in the panel — "Couldn't save the session —
 * <reason>" — once per failure streak, on top of the existing diagnostics receipt. A successful save
 * ends the streak and takes the notice away; dismissing it keeps it away for the rest of the streak.
 * The E2E side (document and closed shadow) is in test/e2e/session-health.e2e.mjs. */
import test from 'node:test';
import assert from 'node:assert/strict';
await import('./harness.mjs');
const { usePanelStore } = await import('../../src/panel/store.ts');

let mode = 'ok';
const sessionKeys = new Set(['session_envelope', 'session_entries']);
const failure = (reason) => Object.assign(new Error('storage-write-failed'), { code: 'storage-write-failed', ...(reason ? { reason } : {}) });
window.XRAY_Store = {
  get: async () => null,
  set: async (key) => {
    if (!sessionKeys.has(key)) return;
    if (mode === 'fail') throw failure();
    if (mode === 'quota') throw failure('quota');
    if (mode === 'secret') throw new Error('synthetic secret query=credential');
  },
};
const settle = async () => { for (let i = 0; i < 20; i++) await new Promise((resolve) => setTimeout(resolve, 0)); };
const notice = () => usePanelStore.getState().sessionSaveNotice;
const save = async () => { usePanelStore.getState().clearSession(); await settle(); };

test('J9 a failed session write raises the save notice once per failure streak', async () => {
  usePanelStore.setState(usePanelStore.getInitialState());
  assert.equal(notice(), null);
  mode = 'fail';
  await save();
  assert.equal(notice(), "Couldn't save the session — the browser refused the write.");
  assert.equal(usePanelStore.getState().runtimeHealth.lastErrorCode, 'storage-write-failed', 'the diagnostics receipt stays');

  usePanelStore.getState().dismissSessionSaveNotice();
  assert.equal(notice(), null);
  await save();
  assert.equal(notice(), null, 'the same streak does not raise it again');

  mode = 'ok';
  await save();
  assert.equal(notice(), null);
  assert.equal(usePanelStore.getState().runtimeHealth.lastErrorCode, null);

  mode = 'quota';
  await save();
  assert.equal(notice(), "Couldn't save the session — the browser's storage for XRAY is full.", 'a new streak raises it again, with its reason');
  await save();
  mode = 'ok';
  await save();
  assert.equal(notice(), null, 'a successful save ends the streak and the notice');
});

test('J9 the reason never carries the browser’s error text', async () => {
  usePanelStore.setState(usePanelStore.getInitialState());
  mode = 'ok';
  await save();
  mode = 'secret';
  await save();
  assert.equal(notice(), "Couldn't save the session — the browser refused the write.");
  assert.doesNotMatch(JSON.stringify(usePanelStore.getState().session.runtime), /credential|synthetic secret/);
  mode = 'ok';
  await save();
});

test('J9 no storage at all is a failed save too', async () => {
  usePanelStore.setState(usePanelStore.getInitialState());
  mode = 'ok';
  await save();
  const store = window.XRAY_Store;
  window.XRAY_Store = { get: store.get };
  try {
    await save();
    assert.equal(notice(), "Couldn't save the session — storage is unavailable (reload the page if XRAY was just updated).");
  } finally {
    window.XRAY_Store = store;
  }
  await save();
  assert.equal(notice(), null);
});
