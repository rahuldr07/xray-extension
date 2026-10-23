// The SQL store driving a remote (Postgres/MySQL) connection through a stub RemoteApi. No service
// worker, helper or SQLite worker runs: a remote connection must never touch the SQLite client.
import test from 'node:test';
import assert from 'node:assert/strict';
import './harness.mjs';

const { usePanelSqlStore, connectionDialect, __setRemoteApiForTests } = await import('../../src/panel/sqlStore.ts');

const CAPS = { readOnlyEnforced: true, cancel: true, transactions: true, cursor: true, multiStatement: false };
const SCHEMA = { schemas: [{ name: 'public', tables: [{ name: 'orders', columns: [], indexes: [] }], views: [] }] };

function profile(overrides = {}) {
  return {
    id: 'p1',
    name: 'shop@db.example.com',
    engine: 'postgres',
    host: 'db.example.com',
    port: 5432,
    database: 'shop',
    user: 'u',
    tls: 'require',
    caFile: '',
    statementTimeoutMs: null,
    readOnly: true,
    hasSavedPassword: true,
    ...overrides,
  };
}

function result(rows, overrides = {}) {
  return {
    columns: [{ name: 'id', type: 'int4' }],
    rows: rows.map((r) => [r]),
    rowCount: rows.length,
    affected: null,
    durationMs: 3,
    notices: [],
    hasMore: false,
    truncatedCells: 0,
    ...overrides,
  };
}

// A session whose execute/fetchMore answers come from `script` (functions get the call).
function stubSession(engine = 'postgres', script = {}) {
  const session = {
    dialect: engine,
    capabilities: CAPS,
    serverVersion: 'PostgreSQL 16.4',
    executes: [],
    fetches: [],
    closed: 0,
    introspect: async () => SCHEMA,
    async execute(sql, opts, signal) {
      session.executes.push({ sql, opts });
      const answer = script.execute ?? result([1]);
      return typeof answer === 'function' ? answer(sql, opts, signal) : answer;
    },
    async fetchMore(tabId, n) {
      session.fetches.push({ tabId, n });
      const answer = script.fetchMore ?? result([]);
      return typeof answer === 'function' ? answer(tabId, n) : answer;
    },
    async close() {
      session.closed += 1;
    },
  };
  return session;
}

function stubApi(sessions, profiles = [profile()]) {
  const api = {
    connects: [],
    profiles: { list: async () => profiles, save: async () => profiles[0], delete: async () => {} },
    helperStatus: async () => ({ state: 'ready', helperVersion: '1.0.0' }),
    async connect(profileId, readOnly, password, remember) {
      api.connects.push({ profileId, readOnly, password, remember });
      const next = sessions.shift();
      if (!next) throw { code: 'connection-lost', message: 'No session scripted.' };
      if (typeof next === 'function') return next();
      if (next.code) throw next;
      return next;
    },
  };
  return api;
}

function reset() {
  usePanelSqlStore.setState({
    connection: null,
    result: null,
    error: null,
    running: null,
    opening: false,
    pendingConfirm: null,
    pendingPrompt: null,
    pendingPassword: null,
    connectionLost: false,
    canFetchMore: false,
    messages: [],
    rowFilter: '',
  });
}

async function connectWith(session, profiles) {
  reset();
  const api = stubApi([session], profiles);
  __setRemoteApiForTests(api);
  await usePanelSqlStore.getState().connectProfile('p1');
  return api;
}

function typeSql(sql) {
  const s = usePanelSqlStore.getState();
  s.updateTabSql(s.activeTabId, sql);
}

test('connectProfile opens a remote connection with the postgres dialect', async () => {
  const session = stubSession();
  const api = await connectWith(session);
  const s = usePanelSqlStore.getState();
  assert.deepEqual(api.connects, [{ profileId: 'p1', readOnly: true, password: undefined, remember: undefined }]);
  assert.equal(s.connection.kind, 'remote');
  assert.equal(s.connection.engine, 'postgres');
  assert.equal(s.connection.key, 'remote:p1');
  assert.equal(s.connection.host, 'db.example.com');
  assert.equal(s.connection.database, 'shop');
  assert.equal(s.connection.serverVersion, 'PostgreSQL 16.4');
  assert.equal(s.connection.readOnly, true);
  assert.equal(connectionDialect(s.connection), 'postgres');
  assert.deepEqual(s.schema, SCHEMA);
  assert.equal(s.profiles.length, 1);
  assert.equal(s.helper.state, 'ready');
  assert.equal(s.dirty, false);
  assert.match(s.messages.at(-1), /Connected to shop@db\.example\.com \(read-only\)/);
});

test('a write on a read-only remote connection is refused before any call', async () => {
  const session = stubSession();
  await connectWith(session);
  typeSql("UPDATE orders SET status = 'x' WHERE id = 1");
  await usePanelSqlStore.getState().run('current');
  const s = usePanelSqlStore.getState();
  assert.equal(session.executes.length, 0);
  assert.equal(s.error.code, 'read-only');
  // Postgres dialect: a dollar-quoted body is one statement, not split at its inner semicolon.
  typeSql('SELECT $$a;b$$');
  await usePanelSqlStore.getState().run('all');
  assert.equal(session.executes.length, 1);
  assert.equal(session.executes[0].sql, 'SELECT $$a;b$$');
});

test('execute sends the active editor tab id and the tab maxRows', async () => {
  const session = stubSession();
  await connectWith(session);
  typeSql('SELECT 1; SELECT 2');
  await usePanelSqlStore.getState().run('all');
  const s = usePanelSqlStore.getState();
  assert.equal(session.executes.length, 2, 'Run all sends one statement per execute');
  for (const call of session.executes) assert.deepEqual(call.opts, { maxRows: 1000, tabId: s.activeTabId });
});

test('fetchMore appends rows, keeps the sort and filter, and updates rowCount and hasMore', async () => {
  const session = stubSession('postgres', {
    execute: result([1, 2], { hasMore: true }),
    fetchMore: result([3, 4], { hasMore: false, notices: ['Showing the first 4 of 9 returned rows.'] }),
  });
  await connectWith(session);
  typeSql('SELECT id FROM orders');
  await usePanelSqlStore.getState().run('current');
  assert.equal(usePanelSqlStore.getState().canFetchMore, true);
  const sort = { col: 0, dir: 'desc' };
  usePanelSqlStore.getState().setGridView({ key: 'k', sort, inspected: null });
  usePanelSqlStore.getState().setRowFilter('3');
  await usePanelSqlStore.getState().fetchMore();
  const s = usePanelSqlStore.getState();
  assert.deepEqual(session.fetches, [{ tabId: s.activeTabId, n: 1000 }]);
  assert.deepEqual(s.result.rows, [[1], [2], [3], [4]]);
  assert.equal(s.result.rowCount, 4);
  assert.equal(s.result.hasMore, false);
  assert.equal(s.canFetchMore, false);
  assert.deepEqual(s.gridView.sort, sort);
  assert.equal(s.rowFilter, '3');
  assert.ok(s.messages.includes('Showing the first 4 of 9 returned rows.'));
  // Nothing more to fetch: a second call does nothing.
  await usePanelSqlStore.getState().fetchMore();
  assert.equal(session.fetches.length, 1);
});

test('remote result notices go to Messages', async () => {
  const session = stubSession('postgres', { execute: result([1], { notices: ['Showing the first 1 of 5 returned rows.'] }) });
  await connectWith(session);
  typeSql('SELECT 1');
  await usePanelSqlStore.getState().run('current');
  assert.ok(usePanelSqlStore.getState().messages.includes('Showing the first 1 of 5 returned rows.'));
});

test('connection-lost marks the connection lost; reconnect restores it and keeps the editor text', async () => {
  const session = stubSession('postgres', {
    execute: () => Promise.reject({ code: 'connection-lost', message: 'The connection to the database helper was lost.' }),
  });
  const api = await connectWith(session);
  typeSql('SELECT 1');
  await usePanelSqlStore.getState().run('current');
  let s = usePanelSqlStore.getState();
  assert.equal(s.connectionLost, true);
  assert.equal(s.error.code, 'connection-lost');
  assert.equal(s.tabs.find((t) => t.id === s.activeTabId).sql, 'SELECT 1');
  // Running again while lost does not call the dead session.
  await usePanelSqlStore.getState().run('current');
  assert.equal(session.executes.length, 1);

  const fresh = stubSession();
  api.connects.length = 0;
  __setRemoteApiForTests({ ...api, connect: async (...args) => (api.connects.push(args), fresh) });
  await usePanelSqlStore.getState().reconnect();
  s = usePanelSqlStore.getState();
  assert.equal(s.connectionLost, false);
  assert.equal(session.closed, 1);
  assert.equal(s.tabs.find((t) => t.id === s.activeTabId).sql, 'SELECT 1');
  await usePanelSqlStore.getState().run('current');
  assert.equal(fresh.executes.length, 1);
});

test('Stop shows "Query cancelled." for cancelled and connection-lost answers alike', async () => {
  for (const code of ['cancelled', 'connection-lost']) {
    const session = stubSession('postgres', {
      execute: (_sql, _opts, signal) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () => reject({ code, message: `driver said ${code}` }));
        }),
    });
    await connectWith(session);
    typeSql('SELECT pg_sleep(30)');
    const running = usePanelSqlStore.getState().run('current');
    await new Promise((r) => setTimeout(r, 0));
    usePanelSqlStore.getState().stop();
    assert.equal(usePanelSqlStore.getState().pendingPrompt, null, 'no discard prompt on a remote connection');
    await running;
    const s = usePanelSqlStore.getState();
    assert.equal(s.error.message, 'Query cancelled.', code);
    assert.equal(s.messages.at(-1), 'Query cancelled.');
    assert.equal(s.connectionLost, code === 'connection-lost', code);
  }
});

test('password-required opens the password prompt; connectProfile with a password retries', async () => {
  reset();
  const session = stubSession();
  const api = stubApi(
    [{ code: 'auth-failed', message: 'Enter the password for shop@db.example.com.', detail: 'password-required' }, session],
    [profile({ hasSavedPassword: false })],
  );
  __setRemoteApiForTests(api);
  await usePanelSqlStore.getState().connectProfile('p1');
  let s = usePanelSqlStore.getState();
  assert.deepEqual(s.pendingPassword, { profileId: 'p1', name: 'shop@db.example.com' });
  assert.equal(s.connection, null);
  assert.equal(s.opening, false);

  await usePanelSqlStore.getState().connectProfile('p1', { password: 'secret', remember: false });
  s = usePanelSqlStore.getState();
  assert.equal(s.pendingPassword, null);
  assert.deepEqual(api.connects[1], { profileId: 'p1', readOnly: true, password: 'secret', remember: false });
  assert.equal(s.connection.kind, 'remote');
  assert.ok(!s.messages.some((m) => m.includes('secret')), 'the password never reaches Messages');
});

test('helper-missing on connect records the helper state and keeps the previous state', async () => {
  reset();
  __setRemoteApiForTests(stubApi([{ code: 'helper-missing', message: 'Install the XRAY database helper.' }]));
  await usePanelSqlStore.getState().connectProfile('p1');
  const s = usePanelSqlStore.getState();
  assert.equal(s.helper.state, 'missing');
  assert.equal(s.connection, null);
  assert.equal(s.error.code, 'helper-missing');
});

test('Read-only off on a remote connection reconnects in the new mode without a prompt', async () => {
  reset();
  const first = stubSession();
  const second = stubSession();
  const api = stubApi([first, second]);
  __setRemoteApiForTests(api);
  await usePanelSqlStore.getState().connectProfile('p1');
  await usePanelSqlStore.getState().setReadOnly(false);
  const s = usePanelSqlStore.getState();
  assert.equal(s.pendingPrompt, null);
  assert.equal(api.connects[1].readOnly, false);
  assert.equal(s.connection.readOnly, false);
  assert.equal(s.readOnlyChoice, false);
  assert.equal(first.closed, 1);
  // Writes now go to the new session (after the dangerous/normal classification).
  typeSql("UPDATE orders SET status = 'x' WHERE id = 1");
  await usePanelSqlStore.getState().run('current');
  assert.equal(second.executes.length, 1);
  assert.equal(usePanelSqlStore.getState().dirty, false, 'nothing is held in memory, so nothing is unsaved');
});

test('a MySQL profile uses the mysql dialect', async () => {
  const session = stubSession('mysql');
  await connectWith(session, [profile({ engine: 'mysql', port: 3306 })]);
  assert.equal(connectionDialect(usePanelSqlStore.getState().connection), 'mysql');
});
