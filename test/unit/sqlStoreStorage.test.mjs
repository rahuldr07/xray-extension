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

const { usePanelSqlStore, __setRemoteApiForTests, loadSqlStorage, flushSqlPersistence } = await import('../../src/panel/sqlStore.ts');

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
