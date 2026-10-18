import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';

import { readSource } from './vm-load.mjs';

function loadClient({ missingWorker = false, protocol = 'chrome-extension:', constructorErrors = [], manualTimers = false } = {}) {
  const workers = [];
  const attempts = [];
  const blobs = [];
  const logs = [];
  const timers = new Map();
  let timerId = 0;
  class FakeWorker {
    constructor(url) {
      attempts.push(url);
      const error = constructorErrors[attempts.length - 1];
      if (error) throw error;
      if (missingWorker) throw new Error('blocked');
      this.url = url;
      this.messages = [];
      workers.push(this);
    }

    postMessage(message) {
      this.messages.push(message);
    }

    terminate() {
      this.terminated = true;
    }

    emit(message) {
      this.onmessage?.({ data: message });
      if (message.id === '__ready__') {
        const init = this.messages.find((candidate) => candidate.action === 'init');
        if (init) this.emitResponse(init.id, { ready: true });
      }
    }

    emitResponse(id, result) {
      this.onmessage?.({ data: { id, success: true, result } });
    }

    fail(event = { message: 'synthetic worker failure' }) {
      this.onerror?.(event);
    }
  }

  const context = {
    window: {},
    location: { protocol },
    Worker: FakeWorker,
    Blob: class Blob {},
    URL: { createObjectURL: () => { blobs.push('blob:fixture'); return 'blob:fixture'; }, revokeObjectURL() {} },
    chrome: missingWorker ? {} : { runtime: { getURL: (path) => `chrome-extension://fixture/${path}` } },
    console: { warn: (...args) => logs.push(args), error: (...args) => logs.push(args) },
    setTimeout: manualTimers ? (callback) => { timers.set(++timerId, callback); return timerId; } : setTimeout,
    clearTimeout: manualTimers ? (id) => timers.delete(id) : clearTimeout,
    Date,
    Promise,
    Map,
    Error,
  };
  vm.createContext(context);
  vm.runInContext(readSource('shared/worker-client.js'), context);
  return {
    client: context.window.XRAY_Worker, workers, attempts, blobs, logs,
    runTimers() {
      const callbacks = [...timers.values()];
      timers.clear();
      callbacks.forEach((callback) => callback());
    },
  };
}

function requestId(worker, action) {
  return worker.messages.find((message) => message.action === action)?.id;
}

test('worker errors reject every pending request once and recreate one worker', async () => {
  const { client, workers } = loadClient();
  const health = [];
  client.onHealth((receipt) => health.push(receipt));

  const init = client.init();
  assert.equal(workers.length, 1);
  workers[0].emit({ id: '__ready__', success: true, result: {} });
  await init;
  assert.equal(client.isReady(), true);

  const pending = client.computeStats({ value: 1 });
  const oldWorker = workers[0];
  oldWorker.fail();
  await assert.rejects(pending, /worker unavailable/i);
  assert.equal(client.isReady(), false);
  assert.equal(workers.length, 2, 'one bounded recreation is attempted');
  assert.equal(health.at(-1).state, 'degraded');
  assert.equal('message' in health.at(-1), false, 'raw worker errors are not exposed');

  workers[1].emit({ id: '__ready__', success: true, result: {} });
  await client.whenReady();
  assert.equal(client.getHealth().lastErrorCode, 'worker-error');
  const recovered = client.computeStats({ value: 2 });
  workers[1].emit({ id: requestId(workers[1], 'computeStats'), success: true, result: { ok: true } });
  assert.deepEqual(await recovered, { ok: true });

  oldWorker.emit({ id: requestId(oldWorker, 'computeStats'), success: true, result: { stale: true } });
  assert.equal(client.getHealth().state, 'healthy');
});

test('repeated worker failure becomes unavailable without another recreation', async () => {
  const { client, workers } = loadClient();
  const init = client.init();
  workers[0].emit({ id: '__ready__', success: true, result: {} });
  await init;

  workers[0].fail();
  workers[1].emit({ id: '__ready__', success: true, result: {} });
  await client.whenReady();
  workers[1].fail();

  assert.equal(workers.length, 2);
  assert.equal(client.isReady(), false);
  assert.equal(client.getHealth().state, 'unavailable');
  assert.equal(client.getHealth().event, 'restart-failed');
});

test('missing worker is degraded and never falsely ready', async () => {
  const { client } = loadClient({ missingWorker: true });
  await client.init();
  assert.equal(client.isReady(), false);
  assert.equal(client.getHealth().state, 'degraded');
  assert.deepEqual(await client.search('x', [{ url: 'x' }]), [{ url: 'x' }]);
});

test('timed-out requests are removed and do not reject again after termination', async () => {
  const { client, workers } = loadClient();
  const init = client.init();
  workers[0].emit({ id: '__ready__', success: true, result: {} });
  await init;
  const pending = client.__testing.send('bounded-test', {}, 5);
  await assert.rejects(pending, /timeout/i);
  assert.equal(client.__testing.pendingCount(), 0);
  client.terminate();
  assert.equal(client.getHealth().state, 'unavailable');
});

test('HTTP(S) content pages use fallback without creating extension or blob workers', async (t) => {
  for (const protocol of ['http:', 'https:']) {
    const { client, attempts, blobs, logs } = loadClient({ protocol });
    t.after(() => client.terminate());
    const ready = client.init();
    assert.equal(attempts.length, 0);
    const receipt = await ready;
    await client.whenReady();
    assert.equal(client.isReady(), false);
    assert.equal(receipt.state, 'unavailable');
    assert.equal(receipt.lastErrorCode, 'worker-origin-unavailable');
    assert.equal(receipt.restartCount, 0);
    assert.equal(attempts.length, 0);
    assert.equal(blobs.length, 0);
    assert.equal(client.__testing.pendingCount(), 0);
    assert.equal(await client.detailAnalysis({ private: 'payload' }), null);
    assert.deepEqual(await client.search('x', [{ url: 'x' }, { url: 'y' }]), [{ url: 'x' }]);
    assert.deepEqual(logs, []);
  }
});

test('constructor SecurityError is unavailable without blob fallback or retry', async (t) => {
  const denial = Object.assign(new Error('Cannot access private origin https://secret.example'), { name: 'SecurityError' });
  const { client, attempts, blobs, logs } = loadClient({ constructorErrors: [denial] });
  t.after(() => client.terminate());
  const ready = client.init();
  assert.equal(attempts.length, 1);
  assert.equal(blobs.length, 0);
  assert.equal(client.getHealth().state, 'unavailable');
  assert.equal(client.getHealth().lastErrorCode, 'worker-policy-blocked');
  await ready;
  await client.init();
  assert.equal(attempts.length, 1);
  assert.equal(client.isReady(), false);
  assert.equal(client.__testing.pendingCount(), 0);
  assert.equal(JSON.stringify(client.getHealth()).includes('secret.example'), false);
  assert.deepEqual(logs, []);
});

test('asynchronous CSP denial settles initial readiness and rejects pending requests without retry', async (t) => {
  const { client, workers, blobs, logs } = loadClient();
  t.after(() => client.terminate());
  const ready = client.init();
  const pending = client.detailAnalysis({ private: 'payload' });
  const rejected = assert.rejects(pending, /worker unavailable/i);
  workers[0].fail({ message: "Refused to create a worker at https://secret.example because it violates Content Security Policy: script-src 'self'" });
  await rejected;
  assert.equal(workers.length, 1);
  assert.equal(workers[0].terminated, true);
  assert.equal(client.getHealth().state, 'unavailable');
  assert.equal((await ready).lastErrorCode, 'worker-policy-blocked');
  assert.equal(client.__testing.pendingCount(), 0);
  workers[0].emit({ id: '__ready__', success: true });
  assert.equal(client.isReady(), false);
  assert.equal(await client.detailAnalysis({ private: 'payload' }), null);
  assert.equal(blobs.length, 0);
  assert.deepEqual(logs, []);
  assert.equal(JSON.stringify(client.getHealth()).includes('secret.example'), false);
});

test('transient constructor error retries once with the directly packaged worker', async (t) => {
  const { client, workers, attempts, blobs } = loadClient({ constructorErrors: [new Error('temporary failure')] });
  t.after(() => client.terminate());
  const ready = client.init();
  assert.equal(attempts.length, 2);
  assert.equal(blobs.length, 0);
  assert.equal(workers.length, 1);
  workers[0].emit({ id: '__ready__', success: true });
  assert.equal((await ready).state, 'healthy');
  assert.equal(client.getHealth().restartCount, 1);
  assert.equal(client.isReady(), true);
});

test('failure before ready preserves the original readiness wait across one restart', async (t) => {
  const { client, workers } = loadClient();
  t.after(() => client.terminate());
  const ready = client.init();
  workers[0].fail();
  workers[1].emit({ id: '__ready__', success: true });
  const receipt = await Promise.race([ready, Promise.resolve('unsettled')]);
  assert.notEqual(receipt, 'unsettled');
  assert.equal(receipt.state, 'healthy');
  assert.equal(client.__testing.pendingCount(), 0);
});

test('silent startup times out, retries once and settles all readiness waits', async (t) => {
  const { client, workers, runTimers } = loadClient({ manualTimers: true });
  t.after(() => client.terminate());
  const ready = client.init();
  runTimers();
  await Promise.resolve();
  assert.equal(workers.length, 2);
  assert.equal(workers[0].terminated, true);
  runTimers();
  await Promise.resolve();
  assert.equal(client.getHealth().state, 'unavailable');
  assert.equal(client.__testing.pendingCount(), 0);
  assert.equal(workers[1].terminated, true);
  assert.equal((await ready).state, 'unavailable');
  await client.whenReady();
  assert.equal(workers.length, 2);
  assert.equal(client.isReady(), false);
});

test('extension pages use the packaged worker and preserve successful analysis results', async (t) => {
  const { client, workers, attempts, blobs } = loadClient();
  t.after(() => client.terminate());
  const ready = client.init();
  workers[0].emit({ id: '__ready__', success: true });
  assert.equal((await ready).state, 'healthy');
  assert.equal(client.isReady(), true);
  assert.deepEqual(attempts, ['chrome-extension://fixture/workers/xray-worker.js']);
  const analysis = client.detailAnalysis({ a: 1 });
  workers[0].emitResponse(requestId(workers[0], 'detailAnalysis'), { stats: { keyCount: 1 } });
  assert.deepEqual(await analysis, { stats: { keyCount: 1 } });
  assert.equal(client.__testing.pendingCount(), 0);
  assert.equal(blobs.length, 0);
});

test('optional cache degradation keeps worker readiness while exposing sanitized recovery health', async () => {
  const { client, workers } = loadClient();
  const ready = client.init();
  workers[0].emit({ id: '__ready__', success: true, result: {} });
  await ready;
  workers[0].emit({ id: '__health__', success: true, health: { cache: { state: 'degraded', lastErrorCode: 'cache-open-failed', lastEventAt: 10 } } });
  assert.equal(client.isReady(), true);
  assert.equal(client.getHealth().state, 'degraded');
  assert.equal(client.getHealth().lastErrorCode, 'cache-open-failed');
  assert.equal(client.getHealth().cache.lastErrorCode, 'cache-open-failed');
  workers[0].emit({ id: '__health__', success: true, health: { cache: { state: 'healthy', lastErrorCode: null, lastEventAt: 11 } } });
  assert.equal(client.isReady(), true);
  assert.equal(client.getHealth().state, 'healthy');
  assert.equal(client.getHealth().lastErrorCode, null);
});

test('cache degradation arriving before readiness survives the ready handshake', async () => {
  const { client, workers } = loadClient();
  const ready = client.init();
  workers[0].emit({ id: '__health__', success: true, health: { cache: { state: 'degraded', lastErrorCode: 'cache-open-failed', lastEventAt: 10 } } });
  workers[0].emit({ id: '__ready__', success: true });
  const receipt = await ready;
  assert.equal(client.isReady(), true);
  assert.equal(receipt.state, 'degraded');
  assert.equal(receipt.lastErrorCode, 'cache-open-failed');
  assert.equal(workers.length, 1);
});

test('repeated constructor failure settles readiness after exactly one retry', async () => {
  const { client, attempts, blobs } = loadClient({ constructorErrors: [new Error('transient'), new Error('transient')] });
  const receipt = await client.init();
  assert.equal(attempts.length, 2);
  assert.equal(blobs.length, 0);
  assert.equal(receipt.state, 'unavailable');
  assert.equal(receipt.restartCount, 1);
  await client.whenReady();
  assert.equal(attempts.length, 2);
  assert.equal(client.__testing.pendingCount(), 0);
  assert.equal(client.isReady(), false);
});

test('asynchronous SecurityError is not retried even without a CSP message', async () => {
  const { client, workers } = loadClient();
  const ready = client.init();
  workers[0].fail({ error: { name: 'SecurityError' }, message: '' });
  assert.equal((await ready).state, 'unavailable');
  assert.equal(client.getHealth().lastErrorCode, 'worker-policy-blocked');
  assert.equal(workers.length, 1);
  assert.equal(client.__testing.pendingCount(), 0);
});

test('an init acknowledgement alone cannot leave readiness waiting forever', async (t) => {
  const { client, workers, runTimers } = loadClient({ manualTimers: true });
  t.after(() => client.terminate());
  const ready = client.init();
  workers[0].emitResponse(requestId(workers[0], 'init'), { ready: true });
  runTimers();
  assert.equal(workers.length, 2);
  workers[1].emitResponse(requestId(workers[1], 'init'), { ready: true });
  runTimers();
  assert.equal((await ready).state, 'unavailable');
  assert.equal(client.isReady(), false);
  assert.equal(client.__testing.pendingCount(), 0);
});
