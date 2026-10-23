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

function setup({ helper = fakeHelper(), local = {}, session = {}, permission = true } = {}) {
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
  });
  return { manager, helper, storageLocal, storageSession };
}

function pagePort(manager, { url = SQL_URL, id = RUNTIME_ID } = {}) {
  const port = { name: 'xray-sql', sender: { id, url }, onMessage: event(), onDisconnect: event(), posted: [], disconnected: false };
  port.postMessage = (msg) => port.posted.push(hostify(msg));
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
  assert.deepEqual(helper.sent[0], { id: helper.sent[0].id, op: 'hello' });
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
    value: { columns: [{ name: 'n', type: 'int4' }], rows: [[1], [2], [3], [4], [5]], rowCount: 5, affected: null, durationMs: 1.5, notices: [], hasMore: true, truncatedCells: 0 },
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
