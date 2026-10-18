import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { transformSync } from 'esbuild';

import { hostify, loadIsolatedWorld, readSource } from './vm-load.mjs';

const bridgeSource = transformSync(readSource('src/panel/runtime/storageBridge.ts'), {
  loader: 'ts', format: 'cjs', target: 'es2022',
}).code;
const secret = 'synthetic-api-key captured-private-response';

function loadBridge({ chrome, missingStore = false } = {}) {
  const logs = [];
  const logger = Object.fromEntries(['warn', 'error', 'log'].map((method) => [method, (...args) => logs.push(args)]));
  const context = loadIsolatedWorld('shared/store.js', { chrome, console: logger });
  const store = context.window.XRAY_Store;
  if (missingStore) delete context.window.XRAY_Store;
  Object.defineProperty(context.window, 'localStorage', {
    get() { throw new Error('page storage must never be accessed'); },
  });
  context.module = { exports: {} };
  vm.runInContext(bridgeSource, context);
  return { bridge: context.module.exports, store, context, logs };
}

function workingChrome(backing = {}) {
  return { storage: { local: {
    async get(key) { return key in backing ? { [key]: backing[key] } : {}; },
    async set(items) { Object.assign(backing, items); },
  } } };
}

async function rejectsSafely(promise, code) {
  await assert.rejects(promise, (error) => {
    assert.equal(error.code, code);
    assert.equal(error.message, code);
    assert.equal(error.cause, undefined, 'raw Chrome errors must not be retained as a cause');
    const receipt = `${error.stack} ${JSON.stringify(error)} ${JSON.stringify(Object.getOwnPropertyNames(error).map((key) => error[key]))}`;
    assert.equal(receipt.includes(secret), false);
    return true;
  });
}

test('React bridge rejects missing private storage without accessing page storage or logging keys', async () => {
  const { bridge, logs } = loadBridge({ missingStore: true });
  await rejectsSafely(bridge.getStoredValue(secret, 'fallback'), 'storage-unavailable');
  await rejectsSafely(bridge.setStoredValue(secret, { secret }), 'storage-unavailable');
  assert.deepEqual(logs, []);
});

test('real shared store strict boundary reports unavailable Chrome storage while legacy calls resolve', async () => {
  for (const chrome of [undefined, {}, { storage: {} }, { storage: { local: {} } }]) {
    const { bridge, store, logs } = loadBridge({ chrome });
    await rejectsSafely(bridge.getStoredValue(secret, 'fallback'), 'storage-unavailable');
    await rejectsSafely(bridge.setStoredValue(secret, { secret }), 'storage-unavailable');
    assert.equal(await store.get(secret, 'legacy-default'), 'legacy-default');
    assert.equal(await store.set(secret, { secret }), undefined);
    assert.deepEqual(logs, []);
  }
});

for (const synchronous of [false, true]) {
  test(`real Chrome ${synchronous ? 'throws' : 'rejects'} produce sanitized read/write failures through the React bridge`, async () => {
    const fail = () => {
      const error = new Error(secret);
      if (synchronous) throw error;
      return Promise.reject(error);
    };
    const { bridge, store, logs } = loadBridge({ chrome: { storage: { local: { get: fail, set: fail } } } });
    await rejectsSafely(bridge.getStoredValue(secret, {}), 'storage-read-failed');
    await rejectsSafely(bridge.setStoredValue(secret, { secret }), 'storage-write-failed');
    await rejectsSafely(store.get(secret, null, true), 'storage-read-failed');
    await rejectsSafely(store.set(secret, { secret }, true), 'storage-write-failed');
    assert.equal(await store.get(secret), null);
    assert.equal(await store.get(secret, 'legacy-default'), 'legacy-default');
    assert.equal(await store.set(secret, { secret }), undefined);
    assert.deepEqual(logs, []);
  });
}

test('successful strict React reads/writes retain prefix, falsy values, and existing null/default semantics', async () => {
  const backing = { bare: secret };
  const { bridge, store, logs } = loadBridge({ chrome: workingChrome(backing) });
  const fallback = { empty: true };
  assert.equal(await bridge.getStoredValue('missing', fallback), fallback);
  assert.equal(await bridge.getStoredValue('bare', fallback), fallback);
  for (const value of [0, false, '', [], { secret }]) {
    assert.equal(await bridge.setStoredValue('session', value), undefined);
    assert.deepEqual(hostify(await bridge.getStoredValue('session', fallback)), value);
    assert.deepEqual(hostify(backing.xray_session), value);
    assert.equal('session' in backing, false);
  }
  await bridge.setStoredValue('session', null);
  assert.equal(await bridge.getStoredValue('session', fallback), fallback);
  assert.equal(await store.get('session', fallback, true), null, 'shared get preserves explicit null');
  assert.equal(await store.get('missing', fallback, true), fallback);
  assert.deepEqual(logs, []);
});

test('Chrome storage can recover after failure and the next strict bridge operation succeeds', async () => {
  const { bridge, context } = loadBridge();
  await rejectsSafely(bridge.setStoredValue('session', { secret }), 'storage-unavailable');
  context.chrome = workingChrome();
  await bridge.setStoredValue('session', { saved: true });
  assert.deepEqual(hostify(await bridge.getStoredValue('session', null)), { saved: true });
});

// Spec J9: the session-save notice names why a write failed. A full quota is classified in
// shared/store.js (the only place that sees Chrome's error) and carried as a fixed reason —
// never Chrome's message, never the key or the value.
test('a quota rejection is classified as reason "quota"; any other write failure has no reason', async () => {
  for (const synchronous of [false, true]) {
    const quota = () => {
      const error = new Error(`QUOTA_BYTES quota exceeded ${secret}`);
      if (synchronous) throw error;
      return Promise.reject(error);
    };
    const { bridge, store, logs } = loadBridge({ chrome: { storage: { local: { get: quota, set: quota } } } });
    await rejectsSafely(bridge.setStoredValue(secret, { secret }), 'storage-write-failed');
    await assert.rejects(bridge.setStoredValue('session', {}), (error) => error.reason === 'quota');
    await assert.rejects(store.set('session', {}, true), (error) => error.reason === 'quota');
    await assert.rejects(bridge.getStoredValue('session', null), (error) => error.code === 'storage-read-failed' && error.reason === undefined);
    assert.deepEqual(logs, []);
  }
  const { bridge } = loadBridge({ chrome: { storage: { local: { get: async () => ({}), set: async () => { throw new Error(secret); } } } } });
  await assert.rejects(bridge.setStoredValue('session', {}), (error) => error.code === 'storage-write-failed' && error.reason === undefined);
  const missing = loadBridge({ chrome: undefined });
  await assert.rejects(missing.bridge.setStoredValue('session', {}), (error) => error.code === 'storage-unavailable' && error.reason === undefined);
});
