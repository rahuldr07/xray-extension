import test from 'node:test';
import assert from 'node:assert/strict';
import './harness.mjs';

const { createRemoteClient } = await import('../../src/panel/runtime/remoteClient.ts');

function fakeEnv(respond) {
  const env = { ports: [], connects: 0 };
  env.connectPort = () => {
    env.connects++;
    const listeners = { msg: [], gone: [] };
    const port = {
      sent: [],
      postMessage(m) {
        port.sent.push(m);
        if (respond) respond(m, port);
      },
      disconnect() {},
      onMessage: { addListener: (f) => listeners.msg.push(f) },
      onDisconnect: { addListener: (f) => listeners.gone.push(f) },
      reply: (m) => listeners.msg.forEach((f) => f(m)),
      drop: () => listeners.gone.forEach((f) => f()),
    };
    env.ports.push(port);
    return port;
  };
  return env;
}

const PROFILE = { id: 'p1', name: 'n', engine: 'mysql', host: 'h', port: 3306, database: 'd', user: 'u', tls: 'require', caFile: '', statementTimeoutMs: null, readOnly: true, hasSavedPassword: false };
const CAPS = { readOnlyEnforced: true, cancel: true, transactions: true, cursor: true, multiStatement: false };
const RESULT = { columns: [{ name: 'a', type: 'int' }], rows: [[1]], rowCount: 1, affected: null, durationMs: 2, notices: [], hasMore: false, truncatedCells: 0 };

function sw(m, port) {
  const ok = (value) => port.reply({ id: m.id, ok: true, value });
  if (m.op === 'profiles.list') ok([{ ...PROFILE, password: 'LEAK' }]);
  else if (m.op === 'profiles.save') ok({ ...m.profile, id: 'p1', hasSavedPassword: true, password: 'LEAK' });
  else if (m.op === 'connect') ok({ sessionId: 's1', serverVersion: '8.0', capabilities: CAPS });
  else if (m.op === 'execute' || m.op === 'fetchMore') ok(RESULT);
  else if (m.op === 'helper.status') ok({ state: 'ready', helperVersion: '1.0.0' });
  else if (m.op === 'profiles.test') ok({ serverVersion: 'MySQL 8.0.36' });
  else ok({});
}

test('profiles never expose a password, even if the SW sends one', async () => {
  const env = fakeEnv(sw);
  const api = createRemoteClient(env.connectPort);
  const list = await api.profiles.list();
  assert.equal('password' in list[0], false);
  assert.deepEqual(list[0], PROFILE);
  const saved = await api.profiles.save({ ...PROFILE, password: 'pw', savePassword: true });
  assert.equal('password' in saved, false);
  assert.equal(env.ports[0].sent[1].profile.password, 'pw');
});

test('profiles.delete sends profileId; helperStatus passes the state through', async () => {
  const env = fakeEnv(sw);
  const api = createRemoteClient(env.connectPort);
  await api.profiles.delete('p1');
  assert.equal(env.ports[0].sent[0].op, 'profiles.delete');
  assert.equal(env.ports[0].sent[0].profileId, 'p1');
  assert.deepEqual(await api.helperStatus(), { state: 'ready', helperVersion: '1.0.0' });
});

test('profiles.test sends the fields and the password apart, and resolves with the server version', async () => {
  const env = fakeEnv(sw);
  const api = createRemoteClient(env.connectPort);
  const version = await api.profiles.test({ ...PROFILE, password: 'inline', savePassword: true }, 'pw');
  assert.equal(version, 'MySQL 8.0.36');
  const req = env.ports[0].sent[0];
  assert.equal(req.op, 'profiles.test');
  assert.equal(req.password, 'pw');
  assert.equal('password' in req.profile, false);
  assert.equal('savePassword' in req.profile, false);
  assert.equal(req.profile.id, 'p1');
});

test('connect yields a session; execute carries tabId, maxRows and the session id', async () => {
  const env = fakeEnv(sw);
  const api = createRemoteClient(env.connectPort);
  const session = await api.connect('p1', true, 'pw', true);
  const req = env.ports[0].sent.find((m) => m.op === 'connect');
  assert.deepEqual({ p: req.profileId, r: req.readOnly, pw: req.password, rem: req.remember }, { p: 'p1', r: true, pw: 'pw', rem: true });
  assert.equal(session.dialect, 'mysql');
  assert.deepEqual(session.capabilities, CAPS);
  assert.equal(session.serverVersion, '8.0');
  const res = await session.execute('select 1', { maxRows: 50, tabId: 't9' });
  assert.deepEqual(res, RESULT);
  const ex = env.ports[0].sent.find((m) => m.op === 'execute');
  assert.equal(ex.tabId, 't9');
  assert.equal(ex.maxRows, 50);
  assert.equal(ex.sessionId, 's1');
  assert.equal(ex.sql, 'select 1');
  await session.fetchMore('t9', 10);
  const fm = env.ports[0].sent.find((m) => m.op === 'fetchMore');
  assert.deepEqual({ t: fm.tabId, n: fm.n, s: fm.sessionId }, { t: 't9', n: 10, s: 's1' });
  await session.introspect();
  await session.close();
  assert.equal(env.ports[0].sent.at(-1).op, 'close');
  assert.equal(env.ports[0].sent.at(-1).sessionId, 's1');
});

test('abort sends cancel with the execute request id and the SW answer settles the call', async () => {
  const env = fakeEnv((m, port) => {
    if (m.op === 'execute') return; // hangs until cancelled
    if (m.op === 'cancel') {
      const exec = port.sent.find((x) => x.op === 'execute');
      port.reply({ id: m.id, ok: true, value: {} });
      port.reply({ id: exec.id, ok: false, error: { code: 'cancelled', message: 'Query cancelled.' } });
      return;
    }
    sw(m, port);
  });
  const session = await createRemoteClient(env.connectPort).connect('p1', true);
  const ac = new AbortController();
  const p = session.execute('select pg_sleep(9)', { maxRows: 10, tabId: 't' }, ac.signal);
  ac.abort();
  await assert.rejects(p, (e) => e.code === 'cancelled');
  const exec = env.ports[0].sent.find((m) => m.op === 'execute');
  const cancel = env.ports[0].sent.find((m) => m.op === 'cancel');
  assert.equal(cancel.queryId, exec.id);
});

test('an already-aborted signal never reaches the SW', async () => {
  const env = fakeEnv(sw);
  const session = await createRemoteClient(env.connectPort).connect('p1', true);
  const ac = new AbortController();
  ac.abort();
  await assert.rejects(session.execute('select 1', { maxRows: 1, tabId: 't' }, ac.signal), (e) => e.code === 'cancelled');
  assert.equal(env.ports[0].sent.some((m) => m.op === 'execute'), false);
});

test('a disconnect rejects pending calls with connection-lost and reconnects lazily, once', async () => {
  const env = fakeEnv((m, port) => {
    if (m.op === 'execute') return;
    sw(m, port);
  });
  const session = await createRemoteClient(env.connectPort).connect('p1', true);
  const a = session.execute('select 1', { maxRows: 1, tabId: 'a' });
  const b = session.execute('select 2', { maxRows: 1, tabId: 'b' });
  env.ports[0].drop();
  await assert.rejects(a, (e) => e.code === 'connection-lost');
  await assert.rejects(b, (e) => e.code === 'connection-lost');
  assert.equal(env.connects, 1); // no reconnect loop
  await session.introspect();
  assert.equal(env.connects, 2);
});

test('after a drop the same client reconnects on the next call', async () => {
  const env = fakeEnv(sw);
  const api = createRemoteClient(env.connectPort);
  await api.helperStatus();
  env.ports[0].drop();
  assert.equal(env.connects, 1);
  await api.helperStatus();
  assert.equal(env.connects, 2);
});

test('SW error bodies pass through normalizeSqlError', async () => {
  const env = fakeEnv((m, port) => {
    if (m.op === 'profiles.delete') port.reply({ id: m.id, ok: false, error: { code: 'timeout', message: 'slow' } });
    else if (m.op === 'profiles.list') port.reply({ id: m.id, ok: false, error: { code: 'bad-request', message: 'Unknown operation.' } });
  });
  const api = createRemoteClient(env.connectPort);
  await assert.rejects(api.profiles.delete('x'), (e) => e.code === 'timeout');
  await assert.rejects(api.profiles.list(), (e) => e.code === 'server' && e.message === 'Unknown operation.');
});

test('a port that cannot be opened rejects with connection-lost', async () => {
  const api = createRemoteClient(() => {
    throw new Error('no runtime');
  });
  await assert.rejects(api.helperStatus(), (e) => e.code === 'connection-lost');
});

test('execute and fetchMore refuse a missing tab id', async () => {
  const env = fakeEnv(sw);
  const session = await createRemoteClient(env.connectPort).connect('p1', true);
  for (const call of [() => session.execute('select 1', { maxRows: 1 }), () => session.execute('select 1', { maxRows: 1, tabId: '' }), () => session.fetchMore('', 5)]) {
    await assert.rejects(call(), (e) => e.code === 'server' && e.message === 'Missing editor tab id.');
  }
  assert.equal(env.ports[0].sent.some((m) => m.op === 'execute' || m.op === 'fetchMore'), false);
});

test('a throwing postMessage drops and disconnects the port', async () => {
  const env = fakeEnv(sw);
  const api = createRemoteClient(env.connectPort);
  await api.helperStatus();
  let disconnected = false;
  env.ports[0].postMessage = () => {
    throw new Error('closed');
  };
  env.ports[0].disconnect = () => {
    disconnected = true;
  };
  await assert.rejects(api.helperStatus(), (e) => e.code === 'connection-lost');
  assert.equal(disconnected, true);
});

test('closing a dead session is quiet', async () => {
  const env = fakeEnv((m, port) => {
    if (m.op === 'close') port.reply({ id: m.id, ok: false, error: { code: 'connection-lost', message: 'gone' } });
    else sw(m, port);
  });
  const session = await createRemoteClient(env.connectPort).connect('p1', true);
  await session.close();
});

test('aborting fetchMore sends cancel with the fetchMore request id', async () => {
  const env = fakeEnv((m, port) => {
    if (m.op === 'fetchMore') return; // hangs until cancelled
    if (m.op === 'cancel') {
      const fm = port.sent.find((x) => x.op === 'fetchMore');
      port.reply({ id: m.id, ok: true, value: {} });
      port.reply({ id: fm.id, ok: false, error: { code: 'cancelled', message: 'Query cancelled.' } });
      return;
    }
    sw(m, port);
  });
  const session = await createRemoteClient(env.connectPort).connect('p1', true);
  const ac = new AbortController();
  const p = session.fetchMore('t', 1000, ac.signal);
  ac.abort();
  await assert.rejects(p, (e) => e.code === 'cancelled');
  const fm = env.ports[0].sent.find((m) => m.op === 'fetchMore');
  const cancel = env.ports[0].sent.find((m) => m.op === 'cancel');
  assert.equal(cancel.queryId, fm.id);
});

test('closeTab sends the session and tab ids; inTransaction passes through', async () => {
  const env = fakeEnv((m, port) => {
    if (m.op === 'execute') return port.reply({ id: m.id, ok: true, value: { ...RESULT, inTransaction: true } });
    return sw(m, port);
  });
  const api = createRemoteClient(env.connectPort);
  const s = await api.connect('p1', true);
  const res = await s.execute('begin', { maxRows: 10, tabId: 't1' });
  assert.equal(res.inTransaction, true);
  await s.closeTab('t1');
  const req = env.ports[0].sent.at(-1);
  assert.deepEqual(req, { id: req.id, op: 'closeTab', sessionId: 's1', tabId: 't1' });
});

test('closeTab on a dead session is quiet', async () => {
  const env = fakeEnv((m, port) => {
    if (m.op === 'closeTab') return port.reply({ id: m.id, ok: false, error: { code: 'connection-lost', message: 'gone' } });
    return sw(m, port);
  });
  const api = createRemoteClient(env.connectPort);
  const s = await api.connect('p1', true);
  await s.closeTab('t1');
});
