// #18: the SQL store's history and tabs writes merge with what another SQL page stored, per
// connection key, instead of overwriting the whole record. chrome.storage.local is an in-memory map
// behind window.XRAY_Store; a remote connection drives the store (no SQLite worker).
import test from 'node:test';
import assert from 'node:assert/strict';
import './harness.mjs';

const disk = new Map();
window.XRAY_Store = {
  async get(key, fallback) { return disk.has(key) ? structuredClone(disk.get(key)) : fallback; },
  async set(key, value) { disk.set(key, structuredClone(value)); },
};

// Extension-origin localStorage, where a page being torn down leaves its pagehide journal.
const local = new Map();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    get length() { return local.size; },
    key: (i) => [...local.keys()][i] ?? null,
    getItem: (k) => (local.has(k) ? local.get(k) : null),
    setItem: (k, v) => { local.set(k, String(v)); },
    removeItem: (k) => { local.delete(k); },
  },
});

const { usePanelSqlStore, __setRemoteApiForTests, loadSqlStorage, flushSqlPersistence, persistOnPageHide } = await import('../../src/panel/sqlStore.ts');

const item = (sql, at) => ({ sql, at, durationMs: 1, rowCount: 1, ok: true });
const session = {
  dialect: 'postgres',
  capabilities: { readOnlyEnforced: true, cancel: true, transactions: true, cursor: true, multiStatement: false },
  serverVersion: 'PostgreSQL 16.4',
  introspect: async () => ({ schemas: [] }),
  closeTab: async () => {},
  execute: async () => ({ columns: [{ name: 'n', type: 'int4' }], rows: [[1]], rowCount: 1, affected: null, durationMs: 1, notices: [], hasMore: false, truncatedCells: 0 }),
  fetchMore: async () => { throw new Error('unused'); },
  close: async () => {},
};
const profile = { id: 'p1', name: 'shop', engine: 'postgres', host: 'h', port: 5432, database: 'd', user: 'u', tls: 'require', caFile: '', statementTimeoutMs: null, readOnly: true, hasSavedPassword: true };

test('history and tabs merge with another page\'s writes, per connection key', async () => {
  disk.set('sql_history', { 'remote:p1': [item('select 0', 1)] });
  await loadSqlStorage();
  // Another SQL page writes after this one loaded: more history for p1, and tabs for p9.
  disk.set('sql_history', { 'remote:p1': [item('other page', 2), item('select 0', 1)] });
  disk.set('sql_editor_tabs', { 'remote:p9': [{ id: 'o', title: 'Q', sql: 'other tab', maxRows: 10 }] });

  __setRemoteApiForTests({
    profiles: { list: async () => [profile], save: async () => profile, delete: async () => {} },
    helperStatus: async () => ({ state: 'ready', helperVersion: '1.0.0' }),
    connect: async () => session,
  });
  await usePanelSqlStore.getState().connectProfile('p1');
  const s = usePanelSqlStore.getState();
  assert.equal(s.connection.key, 'remote:p1');
  assert.deepEqual(s.history.map((i) => i.sql), ['other page', 'select 0'], 'the connect re-read what the other page stored');

  s.updateTabSql(s.activeTabId, 'select 42');
  await usePanelSqlStore.getState().run('all');
  // The other page writes again before this page's debounced write lands.
  const theirs = disk.get('sql_history');
  disk.set('sql_history', { ...theirs, 'remote:p1': [item('other again', Date.now() + 1000), ...theirs['remote:p1']] });
  await flushSqlPersistence();

  assert.deepEqual(disk.get('sql_history')['remote:p1'].map((i) => i.sql), ['other again', 'select 42', 'other page', 'select 0']);
  assert.equal(disk.get('sql_editor_tabs')['remote:p9'][0].sql, 'other tab', 'the other page\'s key survives');
  assert.equal(disk.get('sql_editor_tabs')['remote:p1'][0].sql, 'select 42');
  assert.equal(typeof disk.get('sql_connection_keys')['remote:p1'], 'number', 'the key\'s last use is recorded');
  assert.deepEqual(usePanelSqlStore.getState().history.map((i) => i.sql)[0], 'other again', 'the page shows the merged history');
});

// Fix round 1: edits made just before close or reload were lost, because the async write never ran.
test('pagehide journals unsaved edits synchronously, and the next page load folds them in', async () => {
  const s = usePanelSqlStore.getState();
  assert.equal(s.connection.key, 'remote:p1');
  s.updateTabSql(s.activeTabId, 'typed just before reload');
  // The debounced write has not run; the page goes away now. Nothing async may be needed.
  const before = structuredClone(disk.get('sql_editor_tabs'));
  persistOnPageHide();
  const journals = [...local.keys()].filter((k) => k.startsWith('xray_sql_journal:'));
  assert.equal(journals.length, 1, 'the journal is written synchronously');
  assert.deepEqual(disk.get('sql_editor_tabs'), before, 'storage itself is not written yet');
  // Its async flush never completes (the page is gone): drop it by restoring storage.
  await flushSqlPersistence();
  disk.set('sql_editor_tabs', before);

  // The reloaded page: a fresh module instance.
  const next = await import('../../src/panel/sqlStore.ts?page=reloaded');
  await next.loadSqlStorage();
  assert.equal(disk.get('sql_editor_tabs')['remote:p1'][0].sql, 'typed just before reload');
  assert.equal([...local.keys()].filter((k) => k.startsWith('xray_sql_journal:')).length, 0, 'the journal is gone once folded in');
});

test('a full quota prunes to 2 MB, retries once, and says so once', async () => {
  const set = window.XRAY_Store.set;
  let refusals = 0;
  window.XRAY_Store.set = async (key, value) => {
    if (refusals < 1) {
      refusals++;
      throw Object.assign(new Error('quota'), { code: 'storage-write-failed', reason: 'quota' });
    }
    return set(key, value);
  };
  try {
    // Another connection with ~3 MB of tabs, used long ago.
    const tabs = disk.get('sql_editor_tabs');
    tabs['remote:old'] = Array.from({ length: 15 }, (_, i) => ({ id: `o${i}`, title: 'Q', sql: 'z'.repeat(200_000), maxRows: 1 }));
    disk.set('sql_editor_tabs', tabs);
    disk.set('sql_connection_keys', { ...disk.get('sql_connection_keys'), 'remote:old': 1 });
    const s = usePanelSqlStore.getState();
    s.updateTabSql(s.activeTabId, 'after the quota');
    await flushSqlPersistence();
    assert.equal(refusals, 1);
    assert.equal(disk.get('sql_editor_tabs')['remote:old'], undefined, 'the old key was pruned');
    assert.equal(disk.get('sql_editor_tabs')['remote:p1'][0].sql, 'after the quota', 'the open key is kept');
    const notice = 'SQL history storage is full; older history was not saved.';
    assert.equal(usePanelSqlStore.getState().messages.filter((m) => m === notice).length, 1);
    // Once per page.
    refusals = 0;
    s.updateTabSql(s.activeTabId, 'again');
    await flushSqlPersistence();
    assert.equal(usePanelSqlStore.getState().messages.filter((m) => m === notice).length, 1);
  } finally {
    window.XRAY_Store.set = set;
  }
});

// Fix round 2: a write still refused after the quota retry drops the folded journals too.
test('a quota retry that still fails removes the journals folded in, and the notice says so', async () => {
  const set = window.XRAY_Store.set;
  window.XRAY_Store.set = async () => {
    throw Object.assign(new Error('quota'), { code: 'storage-write-failed', reason: 'quota' });
  };
  try {
    local.set('xray_sql_journal:gone-page', JSON.stringify({
      storage: { history: {}, tabs: { 'remote:p7': [{ id: 'j', title: 'Q', sql: 'journaled', maxRows: 1 }] }, usage: { 'remote:p7': 5 } },
      changes: { history: [], tabs: ['remote:p7'], removed: [] },
    }));
    const s = usePanelSqlStore.getState();
    s.updateTabSql(s.activeTabId, 'refused twice');
    await flushSqlPersistence();
    assert.equal(local.has('xray_sql_journal:gone-page'), false, 'dropped, not retried forever');
    assert.ok(usePanelSqlStore.getState().messages.includes('SQL history storage is full; older history was not saved.'));
  } finally {
    window.XRAY_Store.set = set;
  }
});

test('a non-quota failure keeps the journals and the changes for the next write', async () => {
  const set = window.XRAY_Store.set;
  window.XRAY_Store.set = async () => { throw new Error('disk'); };
  try {
    local.set('xray_sql_journal:kept-page', JSON.stringify({ storage: { history: {}, tabs: {}, usage: {} }, changes: { history: [], tabs: [], removed: [] } }));
    const s = usePanelSqlStore.getState();
    s.updateTabSql(s.activeTabId, 'retry me');
    await flushSqlPersistence();
    assert.equal(local.has('xray_sql_journal:kept-page'), true);
  } finally {
    window.XRAY_Store.set = set;
  }
  const s = usePanelSqlStore.getState();
  s.updateTabSql(s.activeTabId, 'retry me!');
  await flushSqlPersistence();
  assert.equal(disk.get('sql_editor_tabs')['remote:p1'][0].sql, 'retry me!');
  assert.equal(local.has('xray_sql_journal:kept-page'), false);
});

// Fix round 2: the changed keys were cleared before the write finished, so a pagehide during an
// in-flight write journaled nothing.
test('a pagehide during an in-flight write still journals the changes', async () => {
  const set = window.XRAY_Store.set;
  let release;
  const gate = new Promise((r) => { release = r; });
  window.XRAY_Store.set = async (key, value) => { await gate; return set(key, value); };
  try {
    for (const k of [...local.keys()]) if (k.startsWith('xray_sql_journal:')) local.delete(k);
    const s = usePanelSqlStore.getState();
    s.updateTabSql(s.activeTabId, 'in flight');
    const writing = flushSqlPersistence();
    await new Promise((r) => setTimeout(r, 20));
    persistOnPageHide();
    const journals = [...local.entries()].filter(([k]) => k.startsWith('xray_sql_journal:'));
    assert.equal(journals.length, 1);
    assert.match(journals[0][1], /in flight/);
    release();
    await writing;
  } finally {
    window.XRAY_Store.set = set;
  }
});
