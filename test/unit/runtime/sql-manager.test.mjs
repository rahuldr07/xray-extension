// background/sql-manager.js — executed, not regex-matched.
//
// The connection manager is a classic script the service worker loads with
// importScripts. Its factory takes every Chrome API as an injected dep, so these
// tests drive it with a fake storage area, a fake native port that speaks the
// helper's real protocol (helper/internal/protocol, helper/internal/session/ops.go)
// and fake `xray-sql` page ports. No Chrome needed.

import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';

import { hostify, readSource } from './vm-load.mjs';

const RUNTIME_ID = 'kjfoocnkoajdcjabnadfojdfaghpbeep';
const SQL_URL = `chrome-extension://${RUNTIME_ID}/sql.html`;
const CAPS = { readOnlyEnforced: true, cancel: true, transactions: true, cursor: true, multiStatement: false };

function loadManager() {
  const context = { console, URL, Map, Set, Promise, setTimeout, clearTimeout, queueMicrotask, structuredClone };
  vm.createContext(context);
  vm.runInContext(readSource('background/sql-manager.js'), context);
  return context.XRAY_SqlManager;
}

const tick = () => new Promise((resolve) => setImmediate(resolve));

async function until(check, what = 'condition') {
  for (let i = 0; i < 200; i++) {
    const v = check();
    if (v) return v;
    await tick();
  }
  throw new Error(`timed out waiting for ${what}`);
}

function fakeStorage(initial = {}) {
  const data = structuredClone(initial);
  return {
    data,
    async get(key) {
      const keys = Array.isArray(key) ? key : [key];
      const out = {};
      for (const k of keys) if (k in data) out[k] = structuredClone(data[k]);
      return out;
    },
    async set(items) {
      for (const [k, v] of Object.entries(items)) data[k] = structuredClone(v);
    },
    async remove(key) {
      for (const k of Array.isArray(key) ? key : [key]) delete data[k];
    },
  };
}

function event() {
  const listeners = [];
  return { listeners, addListener: (fn) => listeners.push(fn), fire: (...args) => listeners.forEach((fn) => fn(...args)) };
}

// A fake helper process behind a connectNative port. `script(msg, reply)` answers
// each request; reply(obj) delivers one native message asynchronously, as Chrome does.
function fakeHelper(script = defaultScript) {
  const h = { ports: [], sent: [], lastError: undefined, script, opened: 0 };
  h.connectNative = (name) => {
    assert.equal(name, 'com.xray.db_helper');
    h.opened++;
    const port = { onMessage: event(), onDisconnect: event(), alive: true };
    port.postMessage = (msg) => {
      if (!port.alive) throw new Error('Attempting to use a disconnected port object');
      const copy = JSON.parse(JSON.stringify(msg));
      h.sent.push(copy);
      h.script(copy, (reply) => setImmediate(() => port.alive && port.onMessage.fire(JSON.parse(JSON.stringify(reply)), port)), port);
    };
    port.disconnect = () => { port.alive = false; };
    h.ports.push(port);
    return port;
  };
  // Chrome sets runtime.lastError only while onDisconnect listeners run.
  h.disconnect = (message) => {
    const port = h.ports[h.ports.length - 1];
    port.alive = false;
    h.lastError = message;
    port.onDisconnect.fire(port);
    h.lastError = undefined;
  };
  return h;
}

function defaultScript(msg, reply) {
  switch (msg.op) {
    case 'hello': return reply({ id: msg.id, ok: true, value: { protocolVersion: 1, helperVersion: '1.2.3' } });
    case 'connect': return reply({ id: msg.id, ok: true, value: { sessionId: 'sess-1', serverVersion: '16.4', capabilities: CAPS } });
    case 'introspect': return reply({ id: msg.id, ok: true, value: { schemas: [] } });
    case 'close': case 'cancel': return reply({ id: msg.id, ok: true, value: {} });
    default: return reply({ id: msg.id, ok: false, error: { code: 'bad-request', message: 'unknown op' } });
  }
}

// Fake timers: nothing fires until a test calls fire(ms) for that delay.
function fakeTimers() {
  const t = { list: [] };
  t.setTimeout = (fn, ms) => { const h = { fn, ms, done: false }; t.list.push(h); return h; };
  t.clearTimeout = (h) => { if (h) h.done = true; };
  t.pending = (ms) => t.list.filter((h) => !h.done && h.ms === ms).length;
  t.fire = (ms) => { for (const h of t.list.filter((x) => !x.done && x.ms === ms)) { h.done = true; h.fn(); } };
  return t;
}

function setup({ helper = fakeHelper(), local = {}, session = {}, permission = true, timers = fakeTimers() } = {}) {
  const storageLocal = fakeStorage(local);
  const storageSession = fakeStorage(session);
  const { createSqlManager } = loadManager();
  const manager = createSqlManager({
    storageLocal, storageSession,
    connectNative: helper.connectNative,
    permissionsContains: async (perm) => { assert.equal(perm, 'nativeMessaging'); return permission; },
    lastError: () => helper.lastError,
    runtimeId: RUNTIME_ID,
    now: () => 1_700_000_000_000,
    setTimeout: timers.setTimeout,
    clearTimeout: timers.clearTimeout,
  });
  return { manager, helper, storageLocal, storageSession, timers };
}

function pagePort(manager, { url = SQL_URL, id = RUNTIME_ID, tab } = {}) {
  const sender = tab === undefined ? { id, url } : { id, url, tab };
  const port = { name: 'xray-sql', sender, onMessage: event(), onDisconnect: event(), posted: [], disconnected: false, failPosts: 0 };
  // failPosts > 0 makes that many posts throw, as Chrome does for a message over its size limit.
  port.postMessage = (msg) => {
    if (port.failPosts > 0) {
      port.failPosts--;
      throw new Error('Message length exceeded maximum allowed length.');
    }
    port.posted.push(hostify(msg));
  };
  port.disconnect = () => { port.disconnected = true; };
  manager.handlePort(port);
  port.request = async (msg) => {
    port.onMessage.fire(msg, port);
    return until(() => port.posted.find((m) => m.id === msg.id), `answer to ${msg.op}`);
  };
  return port;
}

const PROFILE = { name: 'Prod', engine: 'postgres', host: 'db.example.com', port: 5432, database: 'app', user: 'alice', tls: 'require', caFile: '', statementTimeoutMs: null, readOnly: true };

test('sql-manager: a port from a web page, or another extension, is disconnected', () => {
  const { manager } = setup();
  assert.equal(pagePort(manager, { url: 'https://evil.example/sql.html' }).disconnected, true);
  assert.equal(pagePort(manager, { url: `chrome-extension://${RUNTIME_ID}/window.html` }).disconnected, true);
  assert.equal(pagePort(manager, { id: 'other-extension' }).disconnected, true);
  assert.equal(pagePort(manager, { url: 'not a url' }).disconnected, true);
  assert.equal(pagePort(manager).disconnected, false);
  // use_dynamic_url: any host is accepted for the extension's own sql.html.
  assert.equal(pagePort(manager, { url: 'chrome-extension://0f1e2d3c-dynamic/sql.html?x=1' }).disconnected, false);
});

test('sql-manager: profiles.save with savePassword:false keeps the secret in session storage only, and list never carries a password', async () => {
  const { manager, storageLocal, storageSession } = setup();
  const page = pagePort(manager);
  const saved = await page.request({ id: 1, op: 'profiles.save', profile: { ...PROFILE, password: 'hunter2', savePassword: false } });
  assert.equal(saved.ok, true);
  assert.equal('password' in saved.value, false);
  assert.equal(saved.value.hasSavedPassword, false);
  assert.match(saved.value.id, /\S/);
  assert.doesNotMatch(JSON.stringify(storageLocal.data), /hunter2/);
  assert.deepEqual(storageSession.data.sql_session_secrets, { [saved.value.id]: 'hunter2' });

  const listed = await page.request({ id: 2, op: 'profiles.list' });
  assert.equal(listed.ok, true);
  assert.equal(listed.value.length, 1);
  assert.deepEqual(listed.value[0], { ...PROFILE, id: saved.value.id, hasSavedPassword: false });
  assert.doesNotMatch(JSON.stringify(page.posted), /hunter2/);
});

test('sql-manager: savePassword:true stores it locally, an omitted password keeps it, delete removes profile and secrets', async () => {
  const { manager, storageLocal, storageSession } = setup();
  const page = pagePort(manager);
  const saved = (await page.request({ id: 1, op: 'profiles.save', profile: { ...PROFILE, password: 's3cret', savePassword: true } })).value;
  assert.equal(saved.hasSavedPassword, true);
  assert.equal(storageLocal.data.sql_connections[0].password, 's3cret');

  const renamed = (await page.request({ id: 2, op: 'profiles.save', profile: { ...PROFILE, id: saved.id, name: 'Prod 2', savePassword: true } })).value;
  assert.equal(renamed.id, saved.id);
  assert.equal(renamed.name, 'Prod 2');
  assert.equal(storageLocal.data.sql_connections.length, 1);
  assert.equal(storageLocal.data.sql_connections[0].password, 's3cret');

  await storageSession.set({ sql_session_secrets: { [saved.id]: 'other' } });
  // The brief's `{id}` would collide with the request id, so delete names the profile `profileId`.
  const del = await page.request({ id: 3, op: 'profiles.delete' });
  assert.equal(del.ok, false, 'delete without a profile id is refused');
  const del2 = await page.request({ id: 4, op: 'profiles.delete', profileId: saved.id });
  assert.equal(del2.ok, true);
  assert.deepEqual(storageLocal.data.sql_connections, []);
  assert.deepEqual(storageSession.data.sql_session_secrets, {});
  assert.deepEqual((await page.request({ id: 5, op: 'profiles.list' })).value, []);
});

test('sql-manager: helper.status is ready with the helper version after hello', async () => {
  const { manager, helper } = setup();
  const page = pagePort(manager);
  const res = await page.request({ id: 1, op: 'helper.status' });
  assert.deepEqual(res, { id: 1, ok: true, value: { state: 'ready', helperVersion: '1.2.3' } });
  assert.deepEqual(helper.sent[0], { id: helper.sent[0].id, op: 'hello', protocolVersion: 1 });
});

test('sql-manager: helper.status reports missing when the host is not found, and no-permission without the permission', async () => {
  const missing = fakeHelper((msg) => { if (msg.op === 'hello') setImmediate(() => missing.disconnect('Specified native messaging host not found.')); });
  const a = setup({ helper: missing });
  const res = await pagePort(a.manager).request({ id: 1, op: 'helper.status' });
  assert.deepEqual(res.value, { state: 'missing' });

  const b = setup({ permission: false });
  const res2 = await pagePort(b.manager).request({ id: 1, op: 'helper.status' });
  assert.deepEqual(res2.value, { state: 'no-permission' });
  assert.equal(b.helper.opened, 0, 'no native port is opened without the permission');
});

test('sql-manager: hello with protocol version 2 is outdated, and later calls get helper-outdated', async () => {
  const helper = fakeHelper((msg, reply) => {
    if (msg.op === 'hello') reply({ id: msg.id, ok: true, value: { protocolVersion: 2, helperVersion: '9.0.0' } });
  });
  const { manager } = setup({ helper, local: { sql_connections: [{ ...PROFILE, id: 'p1', password: 'pw' }] } });
  const page = pagePort(manager);
  assert.deepEqual((await page.request({ id: 1, op: 'helper.status' })).value, { state: 'outdated', helperVersion: '9.0.0' });
  const res = await page.request({ id: 2, op: 'connect', profileId: 'p1', readOnly: true });
  assert.equal(res.ok, false);
  assert.deepEqual(res.error, { code: 'helper-outdated', message: 'Update the XRAY database helper.' });
  assert.equal(helper.sent.some((m) => m.op === 'connect'), false, 'nothing but hello reaches an outdated helper');
});

async function connected(script) {
  const helper = fakeHelper(script);
  const ctx = setup({ helper, local: { sql_connections: [{ ...PROFILE, id: 'p1', password: 'pw' }] } });
  const page = pagePort(ctx.manager);
  const res = await page.request({ id: 'c', op: 'connect', profileId: 'p1', readOnly: true });
  assert.equal(res.ok, true, JSON.stringify(res));
  return { ...ctx, page, sessionId: res.value.sessionId };
}

test('sql-manager: connect sends the profile and stored secret to the helper and never returns the password', async () => {
  const { helper, page, sessionId } = await connected(defaultScript);
  const res = page.posted.find((m) => m.id === 'c');
  assert.deepEqual(res.value, { sessionId, serverVersion: '16.4', capabilities: CAPS });
  const req = helper.sent.find((m) => m.op === 'connect');
  assert.deepEqual(req, { id: req.id, op: 'connect', engine: 'postgres', host: 'db.example.com', port: 5432, database: 'app', user: 'alice', password: 'pw', tls: 'require', readOnly: true });
  assert.doesNotMatch(JSON.stringify(page.posted), /"pw"/);
});

test('sql-manager: three row chunks assemble into one QueryResult in order', async () => {
  const { helper, page, sessionId } = await connected((msg, reply) => {
    if (msg.op !== 'execute') return defaultScript(msg, reply);
    reply({ id: msg.id, stream: 'columns', columns: [{ name: 'n', type: 'int4' }] });
    reply({ id: msg.id, stream: 'rows', rows: [[1], [2]] });
    reply({ id: msg.id, stream: 'rows', rows: [[3]] });
    reply({ id: msg.id, stream: 'rows', rows: [[4], [5]] });
    reply({ id: msg.id, ok: true, value: { rowCount: 5, affected: null, durationMs: 1.5, notices: [], hasMore: true, truncatedCells: 0 } });
  });
  const res = await page.request({ id: 7, op: 'execute', sessionId, tabId: 't1', sql: 'select n', maxRows: 5 });
  assert.deepEqual(res, {
    id: 7, ok: true,
    value: { columns: [{ name: 'n', type: 'int4' }], rows: [[1], [2], [3], [4], [5]], rowCount: 5, affected: null, durationMs: 1.5, notices: [], hasMore: true, truncatedCells: 0, inTransaction: false },
  });
  const req = helper.sent.find((m) => m.op === 'execute');
  assert.deepEqual(req, { id: req.id, op: 'execute', sessionId, tabId: 't1', sql: 'select n', maxRows: 5 });
  assert.equal(page.posted.filter((m) => m.id === 7).length, 1, 'the page is answered once');
});

test('sql-manager: fetchMore assembles rows without a columns message, and cancel maps the page query id to the native id', async () => {
  let execId;
  const { helper, page, sessionId } = await connected((msg, reply) => {
    if (msg.op === 'fetchMore') {
      reply({ id: msg.id, stream: 'rows', rows: [['x']] });
      return reply({ id: msg.id, ok: true, value: { rowCount: 1, affected: null, durationMs: 0.2, notices: [], hasMore: false, truncatedCells: 0 } });
    }
    if (msg.op === 'execute') { execId = msg.id; return; } // never answers until cancelled
    if (msg.op === 'cancel') {
      reply({ id: msg.id, ok: true, value: {} });
      return reply({ id: msg.queryId, ok: false, error: { code: 'cancelled', message: 'Query cancelled.' } });
    }
    return defaultScript(msg, reply);
  });
  const more = await page.request({ id: 8, op: 'fetchMore', sessionId, tabId: 't1', n: 1 });
  assert.deepEqual(more.value.columns, []);
  assert.deepEqual(more.value.rows, [['x']]);

  page.onMessage.fire({ id: 9, op: 'execute', sessionId, tabId: 't1', sql: 'select pg_sleep(30)', maxRows: 10 }, page);
  await until(() => execId, 'execute to reach the helper');
  const cancel = await page.request({ id: 10, op: 'cancel', queryId: 9 });
  assert.equal(cancel.ok, true);
  assert.equal(helper.sent.find((m) => m.op === 'cancel').queryId, execId);
  const exec = await until(() => page.posted.find((m) => m.id === 9));
  assert.deepEqual(exec.error, { code: 'cancelled', message: 'Query cancelled.' });
});

test('sql-manager: a native disconnect mid-execute rejects with connection-lost and the session stays dead', async () => {
  let started = false;
  const { helper, page, sessionId } = await connected((msg, reply) => {
    if (msg.op === 'execute') { started = true; return reply({ id: msg.id, stream: 'columns', columns: [] }); }
    return defaultScript(msg, reply);
  });
  page.onMessage.fire({ id: 11, op: 'execute', sessionId, tabId: 't1', sql: 'select 1', maxRows: 10 }, page);
  await until(() => started);
  helper.disconnect('Native host has exited.');
  const res = await until(() => page.posted.find((m) => m.id === 11));
  assert.equal(res.ok, false);
  assert.equal(res.error.code, 'connection-lost');

  const after = await page.request({ id: 12, op: 'execute', sessionId, tabId: 't1', sql: 'select 1', maxRows: 10 });
  assert.equal(after.error.code, 'connection-lost');
  assert.equal(helper.opened, 1, 'a dead session does not reopen the helper');

  const again = await page.request({ id: 13, op: 'connect', profileId: 'p1', readOnly: true });
  assert.equal(again.ok, true, 'connect reopens the helper');
  assert.equal(helper.opened, 2);
});

test('sql-manager: two pages sending id 1 each get their own answers', async () => {
  const helper = fakeHelper((msg, reply) => {
    if (msg.op === 'introspect') return setImmediate(() => reply({ id: msg.id, ok: true, value: { schemas: [{ name: msg.sessionId, tables: [], views: [] }] } }));
    if (msg.op === 'connect') return reply({ id: msg.id, ok: true, value: { sessionId: `sess-${msg.id}`, serverVersion: '16', capabilities: CAPS } });
    return defaultScript(msg, reply);
  });
  const { manager } = setup({ helper, local: { sql_connections: [{ ...PROFILE, id: 'p1', password: 'pw' }] } });
  const a = pagePort(manager);
  const b = pagePort(manager);
  a.onMessage.fire({ id: 1, op: 'connect', profileId: 'p1', readOnly: true }, a);
  b.onMessage.fire({ id: 1, op: 'connect', profileId: 'p1', readOnly: true }, b);
  const ca = await until(() => a.posted.find((m) => m.id === 1));
  const cb = await until(() => b.posted.find((m) => m.id === 1));
  assert.notEqual(ca.value.sessionId, cb.value.sessionId);
  const ids = helper.sent.filter((m) => m.op === 'connect').map((m) => m.id);
  assert.equal(new Set(ids).size, 2, 'native ids are unique');

  a.onMessage.fire({ id: 2, op: 'introspect', sessionId: ca.value.sessionId }, a);
  b.onMessage.fire({ id: 2, op: 'introspect', sessionId: cb.value.sessionId }, b);
  const ia = await until(() => a.posted.find((m) => m.id === 2));
  const ib = await until(() => b.posted.find((m) => m.id === 2));
  assert.equal(ia.value.schemas[0].name, ca.value.sessionId);
  assert.equal(ib.value.schemas[0].name, cb.value.sessionId);

  const stolen = await b.request({ id: 3, op: 'introspect', sessionId: ca.value.sessionId });
  assert.equal(stolen.error.code, 'connection-lost', "a page cannot use another page's session");
});

test('sql-manager: connect without a secret asks for the password; with password and remember:false it lands in session storage', async () => {
  const { manager, helper, storageLocal, storageSession } = setup({ local: { sql_connections: [{ ...PROFILE, id: 'p1' }] } });
  const page = pagePort(manager);
  const res = await page.request({ id: 1, op: 'connect', profileId: 'p1', readOnly: true });
  assert.deepEqual(res.error, { code: 'auth-failed', message: 'Enter the password for Prod.', detail: 'password-required' });
  assert.equal(helper.sent.some((m) => m.op === 'connect'), false);

  const ok = await page.request({ id: 2, op: 'connect', profileId: 'p1', readOnly: false, password: 'once', remember: false });
  assert.equal(ok.ok, true);
  const req = helper.sent.find((m) => m.op === 'connect');
  assert.equal(req.password, 'once');
  assert.equal(req.readOnly, false);
  assert.deepEqual(storageSession.data.sql_session_secrets, { p1: 'once' });
  assert.equal('password' in storageLocal.data.sql_connections[0], false);
});

test('sql-manager: closing the page closes its sessions on the helper', async () => {
  const { helper, page, sessionId } = await connected(defaultScript);
  page.onDisconnect.fire(page);
  await until(() => helper.sent.find((m) => m.op === 'close'));
  assert.equal(helper.sent.find((m) => m.op === 'close').sessionId, sessionId);
});

// ------------------------------------------------ Ruling M3-R19: no hangs

test('sql-manager: a helper that never answers hello times out after 5 s as missing, and the next call starts a new one', async () => {
  const helper = fakeHelper(() => {}); // silent
  const { manager, timers } = setup({ helper });
  const page = pagePort(manager);
  page.onMessage.fire({ id: 1, op: 'helper.status' }, page);
  await until(() => timers.pending(5000) === 1, 'the hello timer');
  assert.equal(page.posted.length, 0);
  timers.fire(5000);
  const res = await until(() => page.posted.find((m) => m.id === 1));
  assert.deepEqual(res.value, { state: 'missing' });
  assert.equal(helper.ports[0].alive, false, 'the silent helper is disconnected');
  page.onMessage.fire({ id: 2, op: 'helper.status' }, page);
  await until(() => helper.opened === 2, 'a new native port');
});

test('sql-manager: a pending call is rejected helper-missing when hello times out', async () => {
  const helper = fakeHelper(() => {});
  const { manager, timers } = setup({ helper, local: { sql_connections: [{ ...PROFILE, id: 'p1', password: 'pw' }] } });
  const page = pagePort(manager);
  page.onMessage.fire({ id: 1, op: 'connect', profileId: 'p1', readOnly: true }, page);
  await until(() => timers.pending(5000) === 1);
  timers.fire(5000);
  const res = await until(() => page.posted.find((m) => m.id === 1));
  assert.equal(res.error.code, 'helper-missing');
});

test('sql-manager: an ok:false hello is outdated, drops the port, and a retry starts a new one', async () => {
  const helper = fakeHelper((msg, reply) => {
    if (msg.op === 'hello') reply({ id: msg.id, ok: false, error: { code: 'bad-request', message: 'malformed request' } });
  });
  const { manager } = setup({ helper });
  const page = pagePort(manager);
  assert.deepEqual((await page.request({ id: 1, op: 'helper.status' })).value, { state: 'outdated' });
  assert.equal(helper.ports[0].alive, false);
  await page.request({ id: 2, op: 'helper.status' });
  assert.equal(helper.opened, 2);
});

test('sql-manager: a helper wedged on cancel is disconnected after 5 s and every pending call gets connection-lost', async () => {
  let execId;
  const { helper, page, sessionId, timers } = await connected((msg, reply) => {
    if (msg.op === 'execute') { execId = msg.id; return; }
    if (msg.op === 'cancel') return; // wedged
    return defaultScript(msg, reply);
  });
  page.onMessage.fire({ id: 20, op: 'execute', sessionId, tabId: 't1', sql: 'select 1', maxRows: 10 }, page);
  await until(() => execId);
  page.onMessage.fire({ id: 21, op: 'cancel', queryId: 20 }, page);
  await until(() => helper.sent.some((m) => m.op === 'cancel'));
  assert.equal(timers.pending(5000), 1, 'only the cancel is timed');
  timers.fire(5000);
  const cancel = await until(() => page.posted.find((m) => m.id === 21));
  const exec = await until(() => page.posted.find((m) => m.id === 20));
  assert.equal(cancel.error.code, 'connection-lost');
  assert.equal(exec.error.code, 'connection-lost');
  assert.equal(helper.ports[0].alive, false);
  const after = await page.request({ id: 22, op: 'introspect', sessionId });
  assert.equal(after.error.code, 'connection-lost', 'its sessions are dead');
});

test('sql-manager: a helper wedged on close is disconnected after 5 s', async () => {
  const { helper, page, sessionId, timers } = await connected((msg, reply) => (msg.op === 'close' ? undefined : defaultScript(msg, reply)));
  page.onMessage.fire({ id: 30, op: 'close', sessionId }, page);
  await until(() => helper.sent.some((m) => m.op === 'close'));
  timers.fire(5000);
  const res = await until(() => page.posted.find((m) => m.id === 30));
  assert.equal(res.error.code, 'connection-lost');
  assert.equal(helper.ports[0].alive, false);
});

test('sql-manager: connect times out after 15 s and introspect after 30 s; execute and fetchMore are never timed', async () => {
  const TIMEOUT = { code: 'timeout', message: 'The database helper did not answer in time.' };
  let silentConnect = false;
  let lateConnect;
  const { helper, page, sessionId, timers } = await connected((msg, reply) => {
    if (msg.op === 'connect' && silentConnect) { lateConnect = () => reply({ id: msg.id, ok: true, value: { sessionId: 'late', serverVersion: '16', capabilities: CAPS } }); return; }
    if (msg.op === 'introspect' || msg.op === 'execute' || msg.op === 'fetchMore') return; // silent
    return defaultScript(msg, reply);
  });
  page.onMessage.fire({ id: 40, op: 'introspect', sessionId }, page);
  await until(() => timers.pending(30000) === 1, 'the introspect timer');
  timers.fire(30000);
  assert.deepEqual((await until(() => page.posted.find((m) => m.id === 40))).error, TIMEOUT);

  silentConnect = true;
  page.onMessage.fire({ id: 41, op: 'connect', profileId: 'p1', readOnly: true }, page);
  await until(() => timers.pending(15000) === 1, 'the connect timer');
  timers.fire(15000);
  assert.deepEqual((await until(() => page.posted.find((m) => m.id === 41))).error, TIMEOUT);
  lateConnect();
  await until(() => helper.sent.some((m) => m.op === 'close' && m.sessionId === 'late'), 'the late session to be closed');

  const before = timers.list.length;
  page.onMessage.fire({ id: 42, op: 'execute', sessionId, tabId: 't1', sql: 'select pg_sleep(600)', maxRows: 10 }, page);
  page.onMessage.fire({ id: 43, op: 'fetchMore', sessionId, tabId: 't1', n: 10 }, page);
  await until(() => helper.sent.some((m) => m.op === 'fetchMore'));
  assert.equal(timers.list.length, before, 'no timer for execute or fetchMore');
  assert.equal(helper.ports[0].alive, true);
});

test('sql-manager: an empty password keeps the saved one, and a re-save without savePassword keeps the secret where it is', async () => {
  const { manager, storageLocal, storageSession } = setup();
  const page = pagePort(manager);
  const local = (await page.request({ id: 1, op: 'profiles.save', profile: { ...PROFILE, password: 'keep', savePassword: true } })).value;
  await page.request({ id: 2, op: 'profiles.save', profile: { ...PROFILE, id: local.id, password: '', savePassword: true } });
  assert.equal(storageLocal.data.sql_connections[0].password, 'keep');
  await page.request({ id: 3, op: 'profiles.save', profile: { ...PROFILE, id: local.id, name: 'Renamed' } });
  assert.equal(storageLocal.data.sql_connections[0].password, 'keep', 'a saved password stays saved');

  const sess = (await page.request({ id: 4, op: 'profiles.save', profile: { ...PROFILE, password: 'temp', savePassword: false } })).value;
  await page.request({ id: 5, op: 'profiles.save', profile: { ...PROFILE, id: sess.id, name: 'Renamed too' } });
  assert.equal('password' in storageLocal.data.sql_connections[1], false, 'a session secret is not written to disk');
  assert.equal(storageSession.data.sql_session_secrets[sess.id], 'temp');
});

test('sql-manager: a page that closes while connect is in flight gets its session closed on the helper', async () => {
  let answer;
  const helper = fakeHelper((msg, reply) => {
    if (msg.op === 'connect') { answer = () => reply({ id: msg.id, ok: true, value: { sessionId: 'orphan', serverVersion: '16', capabilities: CAPS } }); return; }
    return defaultScript(msg, reply);
  });
  const { manager } = setup({ helper, local: { sql_connections: [{ ...PROFILE, id: 'p1', password: 'pw' }] } });
  const page = pagePort(manager);
  page.onMessage.fire({ id: 1, op: 'connect', profileId: 'p1', readOnly: true }, page);
  await until(() => answer, 'connect to reach the helper');
  page.onDisconnect.fire(page);
  answer();
  const close = await until(() => helper.sent.find((m) => m.op === 'close'));
  assert.equal(close.sessionId, 'orphan');
  assert.equal(page.posted.length, 0);
});

// ------------------------------------------------ Ruling M3-R23: Test connection stores nothing

test('sql-manager: profiles.test connects read-only with the given fields, closes at once and stores nothing', async () => {
  const { manager, helper, storageLocal, storageSession } = setup();
  const page = pagePort(manager);
  const res = await page.request({ id: 1, op: 'profiles.test', profile: { ...PROFILE, readOnly: false }, password: 'hunter2' });
  assert.equal(res.ok, true);
  assert.deepEqual(res.value, { serverVersion: '16.4' });
  const req = helper.sent.find((m) => m.op === 'connect');
  assert.deepEqual(req, { id: req.id, op: 'connect', engine: 'postgres', host: 'db.example.com', port: 5432, database: 'app', user: 'alice', password: 'hunter2', tls: 'require', readOnly: true });
  await until(() => helper.sent.find((m) => m.op === 'close' && m.sessionId === 'sess-1'), 'close after the test');
  assert.deepEqual(storageLocal.data, {});
  assert.deepEqual(storageSession.data, {});
  assert.doesNotMatch(JSON.stringify(page.posted), /hunter2/);
});

test('sql-manager: profiles.test with a blank password reads the stored secret for the same server, without moving it', async () => {
  const local = { sql_connections: [{ ...PROFILE, id: 'p1', password: 'saved-pw' }, { ...PROFILE, id: 'p2' }] };
  const session = { sql_session_secrets: { p2: 'session-pw' } };
  const { manager, helper, storageLocal, storageSession } = setup({ local, session });
  const page = pagePort(manager);
  const before = JSON.stringify([storageLocal.data, storageSession.data]);
  // Same engine, host (case and spaces aside), port and user; the database may differ.
  const a = await page.request({ id: 1, op: 'profiles.test', profile: { ...PROFILE, id: 'p1', host: ' DB.example.com ', database: 'other' }, password: '' });
  assert.equal(a.ok, true);
  const b = await page.request({ id: 2, op: 'profiles.test', profile: { ...PROFILE, id: 'p2' } });
  assert.equal(b.ok, true);
  const connects = helper.sent.filter((m) => m.op === 'connect');
  assert.deepEqual(connects.map((m) => [m.database, m.password]), [['other', 'saved-pw'], ['app', 'session-pw']]);
  assert.equal(JSON.stringify([storageLocal.data, storageSession.data]), before, 'storage untouched');
  const c = await page.request({ id: 3, op: 'profiles.test', profile: { ...PROFILE } });
  assert.equal(c.ok, false);
  assert.equal(c.error.detail, 'password-required');
});

// Ruling M3-R24: a stored secret is bound to (engine, host, port, user).
for (const [what, change] of [
  ['host', { host: 'edited.example.com' }],
  ['port', { port: 6543 }],
  ['user', { user: 'mallory' }],
  ['engine', { engine: 'mysql' }],
]) {
  test(`sql-manager: profiles.test never sends a stored secret when only the ${what} differs`, async () => {
    const local = { sql_connections: [{ ...PROFILE, id: 'p1', password: 'saved-pw' }] };
    const { manager, helper } = setup({ local, session: { sql_session_secrets: { p1: 'also-pw' } } });
    const page = pagePort(manager);
    const res = await page.request({ id: 1, op: 'profiles.test', profile: { ...PROFILE, id: 'p1', ...change }, password: '' });
    assert.equal(res.ok, false);
    assert.deepEqual(res.error, { code: 'auth-failed', message: 'Enter the password for Prod.', detail: 'password-required' });
    assert.equal(helper.sent.filter((m) => m.op === 'connect').length, 0, 'nothing reaches the helper');
    assert.doesNotMatch(JSON.stringify(helper.sent), /saved-pw|also-pw/);
  });
}

test('sql-manager: a blank-password re-save drops the secret when the server changes, and keeps it for a database-only change', async () => {
  const { manager, storageLocal, storageSession } = setup();
  const page = pagePort(manager);
  const local = (await page.request({ id: 1, op: 'profiles.save', profile: { ...PROFILE, password: 'keep', savePassword: true } })).value;
  const dbOnly = await page.request({ id: 2, op: 'profiles.save', profile: { ...PROFILE, id: local.id, database: 'other', password: '' } });
  assert.equal(dbOnly.value.hasSavedPassword, true);
  assert.equal(storageLocal.data.sql_connections[0].password, 'keep');
  const moved = await page.request({ id: 3, op: 'profiles.save', profile: { ...PROFILE, id: local.id, host: 'other.example.com', password: '' } });
  assert.equal(moved.value.hasSavedPassword, false);
  assert.equal('password' in storageLocal.data.sql_connections[0], false);

  const sess = (await page.request({ id: 4, op: 'profiles.save', profile: { ...PROFILE, password: 'temp', savePassword: false } })).value;
  await page.request({ id: 5, op: 'profiles.save', profile: { ...PROFILE, id: sess.id, user: 'bob' } });
  assert.equal(sess.id in storageSession.data.sql_session_secrets, false, 'the session secret is dropped too');
  const typed = await page.request({ id: 6, op: 'profiles.save', profile: { ...PROFILE, id: sess.id, host: 'third.example.com', password: 'new', savePassword: true } });
  assert.equal(typed.value.hasSavedPassword, true, 'a typed password is always stored');
});

test('sql-manager: profiles.test passes helper errors and field validation through', async () => {
  const helper = fakeHelper((msg, reply) => {
    if (msg.op === 'connect') return reply({ id: msg.id, ok: false, error: { code: 'auth-failed', message: 'Password authentication failed.' } });
    return defaultScript(msg, reply);
  });
  const { manager, storageLocal } = setup({ helper });
  const page = pagePort(manager);
  const res = await page.request({ id: 1, op: 'profiles.test', profile: PROFILE, password: 'x' });
  assert.deepEqual(res.error, { code: 'auth-failed', message: 'Password authentication failed.' });
  const bad = await page.request({ id: 2, op: 'profiles.test', profile: { ...PROFILE, port: 0 }, password: 'x' });
  assert.deepEqual(bad.error, { code: 'bad-request', message: 'Port must be between 1 and 65535.' });
  assert.deepEqual(storageLocal.data, {});
});

test('sql-manager: the helper is stopped 30 s after the last page leaves, unless a page comes back', async () => {
  const { manager, helper, timers } = setup();
  const page = pagePort(manager);
  await page.request({ id: 1, op: 'helper.status' });
  assert.equal(timers.pending(30000), 0, 'no idle timer while a page is connected');
  page.onDisconnect.fire(page);
  assert.equal(timers.pending(30000), 1);
  const again = pagePort(manager);
  assert.equal(timers.pending(30000), 0, 'a returning page cancels it');
  again.onDisconnect.fire(again);
  timers.fire(30000);
  assert.equal(helper.ports[0].alive, false, 'the native port is disconnected');
  const next = pagePort(manager);
  const status = await next.request({ id: 2, op: 'helper.status' });
  assert.equal(status.value.state, 'ready');
  assert.equal(helper.opened, 2, 'the next call starts the helper again');
});

// A typed password is stored only if the profile still points at the server it was sent to.
for (const remember of [true, false]) {
  test(`sql-manager: a profile moved to another host during connect does not receive the typed password (remember: ${remember})`, async () => {
    let release = null;
    const helper = fakeHelper((msg, reply) => {
      if (msg.op === 'connect' && release === null) {
        release = () => reply({ id: msg.id, ok: true, value: { sessionId: 'sess-a', serverVersion: '16.4', capabilities: CAPS } });
        return undefined;
      }
      return defaultScript(msg, reply);
    });
    const { manager, storageLocal, storageSession } = setup({ helper, local: { sql_connections: [{ ...PROFILE, id: 'p1' }] } });
    const page = pagePort(manager);
    page.onMessage.fire({ id: 1, op: 'connect', profileId: 'p1', readOnly: true, password: 'typed-P', remember }, page);
    await until(() => release, 'the connect to reach the helper');
    const moved = await page.request({ id: 2, op: 'profiles.save', profile: { ...PROFILE, id: 'p1', host: 'b.example.com', password: '' } });
    assert.equal(moved.ok, true);
    release();
    const res = await until(() => page.posted.find((m) => m.id === 1), 'the connect answer');
    assert.equal(res.ok, true, 'the connection that opened stays open');
    await tick();
    assert.doesNotMatch(JSON.stringify(storageLocal.data), /typed-P/);
    assert.doesNotMatch(JSON.stringify(storageSession.data), /typed-P/);
    const later = await page.request({ id: 3, op: 'connect', profileId: 'p1', readOnly: true });
    assert.equal(later.ok, false);
    assert.equal(later.error.detail, 'password-required');
    assert.equal(helper.sent.filter((m) => m.op === 'connect' && m.host === 'b.example.com').length, 0);
  });
}

// ------------------------------------------------ final review (Ruling M3-R26)

test('sql-manager: execute and fetchMore summaries carry inTransaction through', async () => {
  const { page, sessionId } = await connected((msg, reply) => {
    if (msg.op === 'execute') return reply({ id: msg.id, ok: true, value: { rowCount: 0, affected: 0, durationMs: 1, notices: [], hasMore: false, truncatedCells: 0, inTransaction: true } });
    if (msg.op === 'fetchMore') return reply({ id: msg.id, ok: true, value: { rowCount: 0, affected: null, durationMs: 1, notices: [], hasMore: false, truncatedCells: 0 } });
    return defaultScript(msg, reply);
  });
  const exec = await page.request({ id: 30, op: 'execute', sessionId, tabId: 't1', sql: 'begin' });
  assert.equal(exec.value.inTransaction, true);
  const more = await page.request({ id: 31, op: 'fetchMore', sessionId, tabId: 't1' });
  assert.equal(more.value.inTransaction, false, 'an old helper without the field reads as not in a transaction');
});

test('sql-manager: a result past 32 MiB cancels the native query and answers limit-reached', async () => {
  const chunk = Array.from({ length: 8 }, () => ['x'.repeat(65_536)]); // ~512 KiB of JSON
  let execId;
  const { helper, page, sessionId } = await connected((msg, reply) => {
    if (msg.op === 'execute') {
      execId = msg.id;
      reply({ id: msg.id, stream: 'columns', columns: [{ name: 'x', type: 'text' }] });
      for (let i = 0; i < 70; i++) reply({ id: msg.id, stream: 'rows', rows: chunk });
      return; // answered only when cancelled
    }
    if (msg.op === 'cancel') {
      reply({ id: msg.id, ok: true, value: {} });
      return reply({ id: msg.queryId, ok: false, error: { code: 'cancelled', message: 'Query cancelled.' } });
    }
    return defaultScript(msg, reply);
  });
  const res = await page.request({ id: 32, op: 'execute', sessionId, tabId: 't1', sql: 'select big', maxRows: 50000 });
  assert.deepEqual(res, { id: 32, ok: false, error: { code: 'limit-reached', message: 'Result too large; lower the row limit.' } });
  await until(() => helper.sent.find((m) => m.op === 'cancel'), 'the native cancel');
  assert.equal(helper.sent.find((m) => m.op === 'cancel').queryId, execId);
  await tick();
  assert.equal(page.posted.filter((m) => m.id === 32).length, 1, 'answered once, the late cancelled answer is dropped');
});

test('sql-manager: a reply the port refuses is replaced by a small error', async () => {
  const { page, sessionId } = await connected((msg, reply) => {
    if (msg.op === 'execute') return reply({ id: msg.id, ok: true, value: { rowCount: 0, affected: null, durationMs: 1, notices: [], hasMore: false, truncatedCells: 0 } });
    return defaultScript(msg, reply);
  });
  page.failPosts = 1;
  const res = await page.request({ id: 33, op: 'execute', sessionId, tabId: 't1', sql: 'select 1' });
  assert.deepEqual(res, { id: 33, ok: false, error: { code: 'limit-reached', message: 'Result too large; lower the row limit.' } });
});

test('sql-manager: Stop after the worker finished assembling still settles the page with cancelled', async () => {
  const { helper, page, sessionId } = await connected((msg, reply) => {
    if (msg.op === 'execute') return reply({ id: msg.id, ok: true, value: { rowCount: 0, affected: null, durationMs: 1, notices: [], hasMore: false, truncatedCells: 0 } });
    return defaultScript(msg, reply);
  });
  page.failPosts = 2; // the reply and the small error both fail
  page.onMessage.fire({ id: 34, op: 'execute', sessionId, tabId: 't1', sql: 'select 1' }, page);
  await until(() => page.failPosts === 0, 'both replies to fail');
  assert.equal(page.posted.some((m) => m.id === 34), false);
  const cancel = await page.request({ id: 35, op: 'cancel', queryId: 34 });
  assert.equal(cancel.ok, true);
  assert.deepEqual(page.posted.find((m) => m.id === 34), { id: 34, ok: false, error: { code: 'cancelled', message: 'Query cancelled.' } });
  assert.equal(helper.sent.filter((m) => m.op === 'cancel').length, 0, 'nothing is running on the helper');
});

test('sql-manager: a cancel that arrives before the query reaches the helper cancels it once it does', async () => {
  let execId;
  const { helper, page, sessionId } = await connected((msg, reply) => {
    if (msg.op === 'execute') { execId = msg.id; return; } // runs until cancelled
    if (msg.op === 'cancel') {
      reply({ id: msg.id, ok: true, value: {} });
      return reply({ id: msg.queryId, ok: false, error: { code: 'cancelled', message: 'Query cancelled.' } });
    }
    return defaultScript(msg, reply);
  });
  // Both in one task: the cancel is handled while the execute still awaits the helper port.
  page.onMessage.fire({ id: 36, op: 'execute', sessionId, tabId: 't1', sql: 'select pg_sleep(30)' }, page);
  page.onMessage.fire({ id: 37, op: 'cancel', queryId: 36 }, page);
  const exec = await until(() => page.posted.find((m) => m.id === 36), 'the execute to be cancelled');
  assert.deepEqual(exec.error, { code: 'cancelled', message: 'Query cancelled.' });
  assert.equal(helper.sent.find((m) => m.op === 'cancel').queryId, execId);
});

test('sql-manager: closeTab goes to the helper for an owned session, and is a no-op otherwise', async () => {
  const { helper, page, sessionId } = await connected(defaultScript);
  helper.script = (msg, reply) => (msg.op === 'closeTab' ? reply({ id: msg.id, ok: true, value: {} }) : defaultScript(msg, reply));
  const res = await page.request({ id: 38, op: 'closeTab', sessionId, tabId: 't1' });
  assert.equal(res.ok, true);
  const sent = helper.sent.find((m) => m.op === 'closeTab');
  assert.deepEqual(sent, { id: sent.id, op: 'closeTab', sessionId, tabId: 't1' });
  const other = await page.request({ id: 39, op: 'closeTab', sessionId: 'not-mine', tabId: 't1' });
  assert.equal(other.ok, true);
  assert.equal(helper.sent.filter((m) => m.op === 'closeTab').length, 1);
});

test('sql-manager: sql.html framed in a web page cannot reach saved connections or the helper', async () => {
  const { manager, helper, storageLocal } = setup({ local: { sql_connections: [{ ...PROFILE, id: 'p1', password: 'pw' }] } });
  const framed = pagePort(manager, { tab: { id: 4, url: 'https://shop.example/checkout' } });
  assert.equal(framed.disconnected, false, 'the port stays: SQLite files still work there');
  const refusal = { code: 'server', message: 'Database connections open in the XRAY window, not inside a web page.' };
  const ops = [
    { op: 'profiles.list' },
    { op: 'profiles.save', profile: PROFILE },
    { op: 'profiles.delete', profileId: 'p1' },
    { op: 'profiles.test', profile: PROFILE, password: 'x' },
    { op: 'connect', profileId: 'p1', readOnly: true },
    { op: 'helper.status' },
  ];
  let id = 40;
  for (const msg of ops) {
    const res = await framed.request({ id: id++, ...msg });
    assert.deepEqual(res, { id: id - 1, ok: false, error: refusal }, msg.op);
  }
  assert.equal(helper.opened, 0, 'the helper is never started');
  assert.equal(storageLocal.data.sql_connections.length, 1, 'nothing is saved or deleted');
  // Extension pages are fine: its own tab, the pop-out window's frame, and DevTools (no tab).
  for (const tab of [{ id: 5, url: SQL_URL }, { id: 6, url: `chrome-extension://${RUNTIME_ID}/window.html` }, undefined]) {
    const ok = pagePort(manager, { tab });
    const res = await ok.request({ id: 99, op: 'profiles.list' });
    assert.equal(res.ok, true, JSON.stringify(tab));
  }
});

// Ruling M3-R27: a second opt-in (sqlDatabasesInHud, under sqlInlineInHud) lets the framed client use
// saved connections. Both are read from the panel's stored preferences, fresh on each port connect.
for (const [inline, databases] of [[false, false], [false, true], [true, false], [true, true]]) {
  test(`sql-manager: framed client with sqlInlineInHud ${inline} and sqlDatabasesInHud ${databases}`, async () => {
    const prefs = { xray_react_panel_preferences: { settings: { sqlInlineInHud: inline, sqlDatabasesInHud: databases } } };
    const { manager } = setup({ local: { ...prefs, sql_connections: [{ ...PROFILE, id: 'p1', password: 'pw' }] } });
    const framed = pagePort(manager, { tab: { id: 4, url: 'https://shop.example/' } });
    const res = await framed.request({ id: 1, op: 'profiles.list' });
    assert.equal(res.ok, inline && databases, JSON.stringify(res));
    if (!res.ok) assert.equal(res.error.message, 'Database connections open in the XRAY window, not inside a web page.');
    const status = await framed.request({ id: 2, op: 'helper.status' });
    assert.equal(status.ok, inline && databases);
    // Not framed: always allowed, whatever the settings.
    for (const tab of [undefined, { id: 5, url: SQL_URL }]) {
      const own = await pagePort(manager, { tab }).request({ id: 3, op: 'profiles.list' });
      assert.equal(own.ok, true);
    }
  });
}

test('sql-manager: the HUD database settings are read again for each new port', async () => {
  const { manager, storageLocal } = setup({ local: { sql_connections: [{ ...PROFILE, id: 'p1', password: 'pw' }] } });
  const tab = { id: 4, url: 'https://shop.example/' };
  assert.equal((await pagePort(manager, { tab }).request({ id: 1, op: 'profiles.list' })).ok, false);
  await storageLocal.set({ xray_react_panel_preferences: { settings: { sqlInlineInHud: true, sqlDatabasesInHud: true } } });
  assert.equal((await pagePort(manager, { tab }).request({ id: 1, op: 'profiles.list' })).ok, true);
});
