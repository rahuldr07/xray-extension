// The SQL store driving a remote (Postgres/MySQL) connection through a stub RemoteApi. No service
// worker, helper or SQLite worker runs: a remote connection must never touch the SQLite client.
import test from 'node:test';
import assert from 'node:assert/strict';
import './harness.mjs';

const { usePanelSqlStore, connectionDialect, __setRemoteApiForTests, hasOpenTransaction } = await import('../../src/panel/sqlStore.ts');

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
    closedTabs: [],
    introspects: 0,
    closed: 0,
    introspect: async () => {
      session.introspects += 1;
      return SCHEMA;
    },
    async closeTab(tabId) {
      session.closedTabs.push(tabId);
    },
    async execute(sql, opts, signal) {
      session.executes.push({ sql, opts });
      const answer = script.execute ?? result([1]);
      return typeof answer === 'function' ? answer(sql, opts, signal) : answer;
    },
    async fetchMore(tabId, n, signal) {
      session.fetches.push({ tabId, n });
      const answer = script.fetchMore ?? result([]);
      return typeof answer === 'function' ? answer(tabId, n, signal) : answer;
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
    openTransactions: [],
  });
}

async function connectWith(session, profiles, id = 'p1') {
  reset();
  const api = stubApi([session], profiles);
  __setRemoteApiForTests(api);
  await usePanelSqlStore.getState().connectProfile(id);
  return api;
}

const hang = (code) => (...args) =>
  new Promise((_resolve, reject) => {
    args.at(-1).addEventListener('abort', () => reject({ code, message: `driver said ${code}` }));
  });

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

test('Stop interrupts Fetch more and reads as "Query cancelled."', async () => {
  for (const code of ['cancelled', 'connection-lost']) {
    const session = stubSession('postgres', { execute: result([1], { hasMore: true }), fetchMore: hang(code) });
    await connectWith(session);
    typeSql('SELECT id FROM orders');
    await usePanelSqlStore.getState().run('current');
    const fetching = usePanelSqlStore.getState().fetchMore();
    await new Promise((r) => setTimeout(r, 0));
    assert.ok(usePanelSqlStore.getState().running, 'fetchMore counts as running');
    usePanelSqlStore.getState().stop();
    await fetching;
    const s = usePanelSqlStore.getState();
    assert.equal(s.running, null);
    assert.equal(s.error.message, 'Query cancelled.', code);
    assert.equal(s.messages.at(-1), 'Query cancelled.');
    assert.deepEqual(s.result.rows, [[1]], 'the rows already shown stay');
    assert.equal(s.connectionLost, code === 'connection-lost', code);
  }
});

test('cancelPassword closes the prompt; a busy store keeps the prompt open', async () => {
  reset();
  const api = stubApi([{ code: 'auth-failed', message: 'Enter the password.', detail: 'password-required' }], [profile()]);
  __setRemoteApiForTests(api);
  await usePanelSqlStore.getState().connectProfile('p1');
  assert.ok(usePanelSqlStore.getState().pendingPassword);
  usePanelSqlStore.setState({ opening: true });
  await usePanelSqlStore.getState().connectProfile('p1', { password: 'pw' });
  let s = usePanelSqlStore.getState();
  assert.deepEqual(s.pendingPassword, { profileId: 'p1', name: 'shop@db.example.com' });
  assert.equal(api.connects.length, 1, 'no connect while busy');
  assert.equal(s.messages.at(-1), 'Wait for the current query to finish.');
  usePanelSqlStore.setState({ opening: false });
  usePanelSqlStore.getState().cancelPassword();
  s = usePanelSqlStore.getState();
  assert.equal(s.pendingPassword, null);
});

test('a SQLite file that fails to open keeps the remote connection, tabs and schema', async () => {
  const session = stubSession();
  await connectWith(session);
  typeSql('SELECT 42');
  const before = usePanelSqlStore.getState();
  // A valid header, so the open reaches the SQLite worker, which is not available here and fails.
  const header = new TextEncoder().encode('SQLite format 3\u0000');
  const bytes = new Uint8Array(100);
  bytes.set(header);
  const file = { name: 'bad.sqlite', size: bytes.length, arrayBuffer: async () => bytes.buffer };
  await usePanelSqlStore.getState().openFile(file);
  const s = usePanelSqlStore.getState();
  assert.equal(s.connection.kind, 'remote');
  assert.equal(s.connection, before.connection);
  assert.equal(s.tabs, before.tabs);
  assert.deepEqual(s.schema, SCHEMA);
  assert.equal(session.closed, 0);
  assert.ok(s.error);
  assert.match(s.messages.at(-1), /^bad\.sqlite: /);
  typeSql('SELECT 1');
  await usePanelSqlStore.getState().run('current');
  assert.equal(session.executes.length, 1, 'the remote session still runs');
});

test('a failed connect to B leaves session A open', async () => {
  const a = stubSession();
  const api = await connectWith(a, [profile(), profile({ id: 'p2', name: 'b' })]);
  api.connects.length = 0;
  __setRemoteApiForTests(stubApi([{ code: 'network', message: 'Could not reach the server.' }], [profile(), profile({ id: 'p2', name: 'b' })]));
  await usePanelSqlStore.getState().connectProfile('p2');
  const s = usePanelSqlStore.getState();
  assert.equal(a.closed, 0);
  assert.equal(s.connection.profileId, 'p1');
  assert.equal(s.error.code, 'network');
  typeSql('SELECT 1');
  await usePanelSqlStore.getState().run('current');
  assert.equal(a.executes.length, 1);
});

test('remote A to remote B closes A and loads B history and tabs', async () => {
  const profiles = [profile(), profile({ id: 'p2', name: 'b' })];
  // B first, to give it history and a tab of its own.
  const b0 = stubSession();
  await connectWith(b0, profiles, 'p2');
  typeSql('SELECT b_only');
  await usePanelSqlStore.getState().run('current');
  const bTabs = usePanelSqlStore.getState().tabs;
  const a = stubSession();
  __setRemoteApiForTests(stubApi([a], profiles));
  await usePanelSqlStore.getState().connectProfile('p1');
  typeSql('SELECT a_only');
  assert.equal(b0.closed, 1);
  const b = stubSession();
  __setRemoteApiForTests(stubApi([b], profiles));
  await usePanelSqlStore.getState().connectProfile('p2');
  const s = usePanelSqlStore.getState();
  assert.equal(a.closed, 1);
  assert.equal(s.connection.key, 'remote:p2');
  assert.deepEqual(s.tabs.map((t) => t.sql), bTabs.map((t) => t.sql));
  assert.equal(s.history[0].sql, 'SELECT b_only');
});

test('fetchMore from a different tab than the one that ran is refused', async () => {
  const session = stubSession('postgres', { execute: result([1], { hasMore: true }) });
  await connectWith(session);
  typeSql('SELECT id FROM orders');
  await usePanelSqlStore.getState().run('current');
  usePanelSqlStore.getState().addTab();
  await usePanelSqlStore.getState().fetchMore();
  const s = usePanelSqlStore.getState();
  assert.equal(session.fetches.length, 0);
  assert.equal(s.messages.at(-1), 'Fetch more works from the tab that ran this query.');
});

// A stub API whose profile calls are recorded.
function recordingApi(sessions, existing = [profile()]) {
  const api = stubApi(sessions, existing);
  api.saves = [];
  api.deletes = [];
  let n = 0;
  api.profiles = {
    list: async () => existing,
    save: async (input) => {
      api.saves.push(input);
      return profile({ ...input, id: input.id ?? `tmp${++n}` });
    },
    delete: async (id) => {
      api.deletes.push(id);
    },
  };
  return api;
}

const FIELDS = {
  name: 'shop',
  engine: 'postgres',
  host: 'db.example.com',
  port: 5432,
  database: 'shop',
  user: 'u',
  tls: 'require',
  caFile: '',
  statementTimeoutMs: null,
  readOnly: true,
};

test('testProfile asks the worker to test the fields, and saves and deletes nothing', async () => {
  reset();
  const api = recordingApi([]);
  api.tests = [];
  api.profiles.test = async (input, password) => {
    api.tests.push({ input, password });
    return 'PostgreSQL 16.4 on x86_64';
  };
  __setRemoteApiForTests(api);
  const version = await usePanelSqlStore.getState().testProfile({ ...FIELDS, id: 'p1', password: 'pw', savePassword: true });
  assert.equal(version, 'PostgreSQL 16.4 on x86_64');
  assert.equal(api.tests.length, 1);
  assert.equal(api.tests[0].password, 'pw');
  assert.equal(api.tests[0].input.id, 'p1');
  assert.deepEqual(api.saves, []);
  assert.deepEqual(api.deletes, []);
  assert.deepEqual(api.connects, [], 'a test never opens a session through the page');
  assert.equal(usePanelSqlStore.getState().connection, null);
  await usePanelSqlStore.getState().testProfile({ ...FIELDS, id: 'p1' });
  assert.equal(api.tests[1].password, '', 'a blank password lets the worker use the stored secret');
});

test('testProfile passes the error through', async () => {
  reset();
  const api = recordingApi([]);
  api.profiles.test = async () => {
    throw { code: 'auth-failed', message: 'Password authentication failed.' };
  };
  __setRemoteApiForTests(api);
  await assert.rejects(usePanelSqlStore.getState().testProfile({ ...FIELDS, password: 'bad' }), {
    code: 'auth-failed',
    message: 'Password authentication failed.',
  });
  assert.deepEqual(api.saves, []);
});

function failingTest(error) {
  const api = recordingApi([]);
  api.profiles.test = async () => {
    throw error;
  };
  return api;
}

test('testProfile records a missing helper, or a missing permission, for the install card', async () => {
  reset();
  __setRemoteApiForTests(failingTest({ code: 'helper-missing', message: 'Install the XRAY database helper.' }));
  await assert.rejects(usePanelSqlStore.getState().testProfile({ ...FIELDS, password: 'pw' }));
  assert.equal(usePanelSqlStore.getState().helper.state, 'missing');
  __setRemoteApiForTests(
    failingTest({ code: 'helper-missing', message: 'Allow XRAY to use the database helper.', detail: 'no-permission' }),
  );
  await assert.rejects(usePanelSqlStore.getState().testProfile({ ...FIELDS, password: 'pw' }));
  assert.equal(usePanelSqlStore.getState().helper.state, 'no-permission');
});

test('saveProfile and deleteProfile reload the saved list', async () => {
  reset();
  const api = recordingApi([], [profile(), profile({ id: 'p2', name: 'two' })]);
  __setRemoteApiForTests(api);
  const saved = await usePanelSqlStore.getState().saveProfile({ ...FIELDS, password: 'pw', savePassword: true });
  assert.equal(saved.id, 'tmp1');
  assert.equal(usePanelSqlStore.getState().profiles.length, 2);
  await usePanelSqlStore.getState().deleteProfile('p2');
  assert.deepEqual(api.deletes, ['p2']);
});

test('cursorTabId follows the tab that ran the statement, and a new connection clears it', async () => {
  const session = stubSession('postgres', { execute: result([1], { hasMore: true }) });
  await connectWith(session);
  assert.equal(usePanelSqlStore.getState().cursorTabId, null);
  typeSql('select 1');
  await usePanelSqlStore.getState().run('current');
  const s = usePanelSqlStore.getState();
  assert.equal(s.cursorTabId, s.activeTabId);
  assert.equal(s.canFetchMore, true);
  s.addTab();
  assert.notEqual(usePanelSqlStore.getState().activeTabId, usePanelSqlStore.getState().cursorTabId, 'another tab is not the cursor tab');
});

test('loadProfiles never asks for the helper status; checkHelper does', async () => {
  reset();
  const api = recordingApi([]);
  let statusCalls = 0;
  api.helperStatus = async () => {
    statusCalls += 1;
    return { state: 'missing' };
  };
  __setRemoteApiForTests(api);
  await usePanelSqlStore.getState().loadProfiles();
  assert.equal(statusCalls, 0);
  assert.equal(usePanelSqlStore.getState().profiles.length, 1);
  await usePanelSqlStore.getState().checkHelper();
  assert.equal(statusCalls, 1);
  assert.equal(usePanelSqlStore.getState().helper.state, 'missing');
});

// ------------------------------------------------ final review (Ruling M3-R26)

const DISCARD_TX = { title: 'Discard the open transaction?', message: 'Its changes will be rolled back.', confirmLabel: 'Discard transaction' };
const ROLLED_BACK = 'An open transaction was rolled back.';

// A read-write session whose execute answers inTransaction the way a server would.
function txSession() {
  const open = new Set(); // per editor tab: each has its own connection
  return stubSession('postgres', {
    execute: (sql, opts) => {
      const kw = sql.trim().split(/\s+/)[0].toLowerCase();
      if (kw === 'begin') open.add(opts.tabId);
      if (kw === 'commit' || kw === 'rollback') open.delete(opts.tabId);
      return result([1], { inTransaction: open.has(opts.tabId) });
    },
  });
}

async function openTx(sessions = [txSession(), txSession()]) {
  reset();
  const api = stubApi([...sessions], [profile({ readOnly: false }), profile({ id: 'p2', name: 'other', readOnly: false })]);
  __setRemoteApiForTests(api);
  await usePanelSqlStore.getState().connectProfile('p1');
  typeSql('BEGIN');
  await usePanelSqlStore.getState().run('current');
  return { api, first: sessions[0], second: sessions[1] };
}

test('inTransaction is kept per editor tab', async () => {
  await openTx();
  const s = usePanelSqlStore.getState();
  const txTab = s.activeTabId;
  assert.deepEqual(s.openTransactions, [txTab]);
  assert.equal(hasOpenTransaction(), true);
  s.addTab();
  typeSql('SELECT 1');
  await usePanelSqlStore.getState().run('current');
  assert.deepEqual(usePanelSqlStore.getState().openTransactions, [txTab], "another tab's SELECT does not end it");
  usePanelSqlStore.getState().setActiveTab(txTab);
  typeSql('COMMIT');
  await usePanelSqlStore.getState().run('current');
  assert.deepEqual(usePanelSqlStore.getState().openTransactions, []);
  assert.equal(hasOpenTransaction(), false);
});

test('a failed COMMIT ends the tracked transaction', async () => {
  const session = stubSession('postgres', {
    execute: (sql) => {
      if (/^commit/i.test(sql)) throw { code: 'server', message: 'The transaction had failed and was rolled back.' };
      return result([1], { inTransaction: true });
    },
  });
  await openTx([session]);
  typeSql('COMMIT');
  await usePanelSqlStore.getState().run('current');
  assert.deepEqual(usePanelSqlStore.getState().openTransactions, []);
});

test('turning Read-only on with an open transaction asks first; Cancel keeps the session', async () => {
  const { api, first } = await openTx();
  await usePanelSqlStore.getState().setReadOnly(true);
  assert.deepEqual(usePanelSqlStore.getState().pendingPrompt, DISCARD_TX);
  usePanelSqlStore.getState().cancelPrompt();
  assert.equal(api.connects.length, 1);
  assert.equal(first.closed, 0);
  await usePanelSqlStore.getState().setReadOnly(true);
  await usePanelSqlStore.getState().confirmPrompt();
  const s = usePanelSqlStore.getState();
  assert.equal(api.connects[1].readOnly, true);
  assert.equal(first.closed, 1);
  assert.equal(s.connection.readOnly, true);
  assert.deepEqual(s.openTransactions, []);
  assert.ok(s.messages.includes(ROLLED_BACK), s.messages.join('\n'));
});

test('connecting another profile with an open transaction asks first', async () => {
  const { api } = await openTx();
  await usePanelSqlStore.getState().connectProfile('p2');
  assert.deepEqual(usePanelSqlStore.getState().pendingPrompt, DISCARD_TX);
  assert.equal(api.connects.length, 1);
  await usePanelSqlStore.getState().confirmPrompt();
  const s = usePanelSqlStore.getState();
  assert.equal(s.connection.profileId, 'p2');
  assert.deepEqual(s.openTransactions, []);
  assert.ok(s.messages.includes(ROLLED_BACK));
});

test('opening a SQLite file with an open transaction asks first', async () => {
  await openTx();
  await usePanelSqlStore.getState().openFile(new File([new Uint8Array(0)], 'x.sqlite'));
  assert.deepEqual(usePanelSqlStore.getState().pendingPrompt, DISCARD_TX);
  usePanelSqlStore.getState().cancelPrompt();
  assert.equal(usePanelSqlStore.getState().connection.kind, 'remote');
});

test('closing an editor tab closes its helper tab; with an open transaction it asks first', async () => {
  const { first } = await openTx();
  const s = usePanelSqlStore.getState();
  const txTab = s.activeTabId;
  s.addTab();
  const plain = usePanelSqlStore.getState().activeTabId;
  usePanelSqlStore.getState().closeTab(plain);
  assert.equal(usePanelSqlStore.getState().pendingPrompt, null);
  assert.deepEqual(first.closedTabs, [plain]);
  usePanelSqlStore.getState().closeTab(txTab);
  assert.deepEqual(usePanelSqlStore.getState().pendingPrompt, DISCARD_TX);
  assert.deepEqual(first.closedTabs, [plain]);
  await usePanelSqlStore.getState().confirmPrompt();
  const after = usePanelSqlStore.getState();
  assert.deepEqual(first.closedTabs, [plain, txTab]);
  assert.equal(after.tabs.some((t) => t.id === txTab), false);
  assert.deepEqual(after.openTransactions, []);
  assert.ok(after.messages.includes(ROLLED_BACK));
});

test('a connection lost with an open transaction says it was rolled back', async () => {
  const session = stubSession('postgres', {
    execute: (sql) => {
      if (/^select/i.test(sql)) throw { code: 'connection-lost', message: 'The connection to the database was lost.' };
      return result([1], { inTransaction: true });
    },
  });
  await openTx([session]);
  typeSql('SELECT 1');
  await usePanelSqlStore.getState().run('current');
  const s = usePanelSqlStore.getState();
  assert.equal(s.connectionLost, true);
  assert.deepEqual(s.openTransactions, []);
  assert.ok(s.messages.includes(ROLLED_BACK));
});

test('200 INSERTs refresh the remote schema at most once; DDL refreshes it', async () => {
  reset();
  const session = stubSession('postgres', { execute: result([], { columns: [], affected: 1 }) });
  const api = stubApi([session], [profile({ readOnly: false })]);
  __setRemoteApiForTests(api);
  await usePanelSqlStore.getState().connectProfile('p1');
  const before = session.introspects;
  typeSql(Array.from({ length: 200 }, (_, i) => `INSERT INTO orders(id) VALUES (${i});`).join('\n'));
  await usePanelSqlStore.getState().run('all');
  assert.equal(session.executes.length, 200);
  assert.ok(session.introspects - before <= 1, `${session.introspects - before} introspects`);
  const mid = session.introspects;
  typeSql('CREATE TABLE t2 (a int)');
  await usePanelSqlStore.getState().run('current');
  assert.equal(session.introspects - mid, 1, 'a CREATE refreshes the rail');
  typeSql('SELECT 1');
  await usePanelSqlStore.getState().run('current');
  assert.equal(session.introspects - mid, 1, 'a read never does');
});

test('a stored password the server rejects opens the password prompt', async () => {
  reset();
  const api = stubApi([{ code: 'auth-failed', message: 'The server rejected the user name or password.' }]);
  __setRemoteApiForTests(api);
  await usePanelSqlStore.getState().connectProfile('p1');
  const s = usePanelSqlStore.getState();
  assert.deepEqual(s.pendingPassword, { profileId: 'p1', name: 'shop@db.example.com' });
  assert.ok(s.messages.includes('The server rejected the user name or password.'));
});

// Ruling M3-R28: an error answer says whether the tab is still in a transaction.
test('an error carrying inTransaction updates the open transactions', async () => {
  const session = stubSession('postgres', {
    execute: (sql) => {
      if (/^select 1\/0/i.test(sql)) throw { code: 'server', message: 'division by zero', inTransaction: true };
      if (/^select 2/i.test(sql)) throw { code: 'server', message: 'The connection to the database was lost, so the open transaction was rolled back.', inTransaction: false };
      return result([1], { inTransaction: true });
    },
  });
  await openTx([session]);
  const tab = usePanelSqlStore.getState().activeTabId;
  typeSql('SELECT 1/0');
  await usePanelSqlStore.getState().run('current');
  assert.deepEqual(usePanelSqlStore.getState().openTransactions, [tab], 'still open after an error inside it');
  typeSql('SELECT 2');
  await usePanelSqlStore.getState().run('current');
  assert.deepEqual(usePanelSqlStore.getState().openTransactions, [], 'gone after the helper reports it lost');
});
