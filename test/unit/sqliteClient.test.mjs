import test from 'node:test';
import assert from 'node:assert/strict';
import './harness.mjs';
import { shopDatabaseBytes, loadSqlite } from '../helpers/sqliteFixture.mjs';

const { createSqliteClient } = await import('../../src/panel/runtime/sqliteClient.ts');
const { createSqliteEngine } = await import('../../src/panel/models/sqliteEngine.ts');
const sqlite3 = await loadSqlite();
const shop = await shopDatabaseBytes();

// A WorkerLike that runs the real engine and answers on a later turn, like a real worker: a
// request stays pending until then, and a terminated worker never answers. It also enforces the
// transfer list, so a client that transferred its stored bytes would see them detached here too.
function fakeWorkers() {
  const spawned = [];
  const spawn = () => {
    const engine = createSqliteEngine(sqlite3);
    const worker = {
      onmessage: null,
      terminated: false,
      requests: [],
      postMessage(msg, transfer) {
        const data = structuredClone(msg, { transfer: transfer ?? [] });
        worker.requests.push(data);
        setImmediate(() => {
          if (worker.terminated) return;
          let reply;
          try {
            let value;
            if (data.op === 'open') value = engine.open(data.bytes, data.readOnly);
            else if (data.op === 'introspect') value = engine.introspect();
            else if (data.op === 'execute') value = engine.execute(data.sql, data.opts);
            else if (data.op === 'export') value = engine.exportBytes();
            reply = { id: data.id, ok: true, value: value ?? null };
          } catch (error) {
            reply = { id: data.id, ok: false, error };
          }
          worker.onmessage?.({ data: reply });
        });
      },
      terminate() {
        worker.terminated = true;
        engine.close();
      },
    };
    spawned.push(worker);
    return worker;
  };
  return { spawn, spawned };
}

// Resolves once the client has posted an `op` request, before the fake worker can answer it.
async function posted(worker, op) {
  for (let i = 0; i < 100 && !worker.requests.some((r) => r.op === op); i++) await Promise.resolve();
  assert.ok(worker.requests.some((r) => r.op === op), `${op} was posted`);
}

const count = async (client) => (await client.execute('select count(*) from orders', { maxRows: 10 })).rows[0][0];

test('open and execute round-trip rows through the worker', async () => {
  const { spawn, spawned } = fakeWorkers();
  const client = createSqliteClient(spawn);
  assert.equal(client.dialect, 'sqlite');
  assert.equal(client.capabilities.cursor, false);
  await client.open(shop, true);
  const r = await client.execute('select id, total from orders order by id limit 2', { maxRows: 1000 });
  assert.deepEqual(r.columns.map((c) => c.name), ['id', 'total']);
  assert.deepEqual(r.rows, [[1, 1250.5], [2, 3]]);
  const tree = await client.introspect();
  assert.deepEqual(tree.schemas[0].tables.map((t) => t.name), ['customers', 'orders']);
  assert.equal(spawned.length, 1);
  assert.equal(shop.byteLength > 0, true, 'the caller keeps its bytes');
  await client.close();
  assert.equal(spawned[0].terminated, true);
});

test('aborting a pending execute cancels it and re-opens the same data in a new worker', async () => {
  const { spawn, spawned } = fakeWorkers();
  const client = createSqliteClient(spawn);
  await client.open(shop, true);
  const controller = new AbortController();
  const pending = client.execute('select * from orders', { maxRows: 1000 }, controller.signal);
  await posted(spawned[0], 'execute');
  controller.abort();
  await assert.rejects(pending, (err) => err.code === 'cancelled');
  assert.equal(spawned.length, 2);
  assert.equal(spawned[0].terminated, true);
  assert.equal(await count(client), 2500);
  const reopen = spawned[1].requests[0];
  assert.equal(reopen.op, 'open');
  assert.equal(reopen.readOnly, true);
  await assert.rejects(client.execute('delete from orders', { maxRows: 10 }), (err) => err.code === 'read-only');
  await client.close();
});

test('an already-aborted signal rejects without touching the worker', async () => {
  const { spawn, spawned } = fakeWorkers();
  const client = createSqliteClient(spawn);
  await client.open(shop, true);
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(client.execute('select 1', { maxRows: 1 }, controller.signal), (err) => err.code === 'cancelled');
  assert.equal(spawned.length, 1);
  assert.equal(spawned[0].requests.length, 1);
  await client.close();
});

test('dirty follows read-write changes and resets on export', async () => {
  const { spawn } = fakeWorkers();
  const client = createSqliteClient(spawn);
  await client.open(shop, false);
  assert.equal(client.dirty, false);
  await client.execute('select count(*) from orders', { maxRows: 1 });
  assert.equal(client.dirty, false, 'a read leaves it clean');
  await client.execute('delete from orders where id > 10', { maxRows: 1 });
  assert.equal(client.dirty, true);
  const bytes = await client.exportBytes();
  assert.ok(bytes instanceof Uint8Array && bytes.byteLength > 0);
  assert.equal(client.dirty, false);
  assert.equal(await count(client), 10);
  await client.close();
});

test('a cancel after export re-opens the exported bytes, read-write', async () => {
  const { spawn, spawned } = fakeWorkers();
  const client = createSqliteClient(spawn);
  await client.open(shop, false);
  await client.execute('delete from orders where id > 5', { maxRows: 1 });
  await client.exportBytes();
  const controller = new AbortController();
  const pending = client.execute('select * from orders', { maxRows: 10 }, controller.signal);
  await posted(spawned[0], 'execute');
  controller.abort();
  await assert.rejects(pending, (err) => err.code === 'cancelled');
  assert.equal(spawned.length, 2);
  assert.equal(await count(client), 5);
  await client.execute('delete from orders where id = 5', { maxRows: 1 });
  assert.equal(client.dirty, true, 'still read-write after the re-open');
  await client.close();
});

test('an engine error arrives as a SqlError', async () => {
  const { spawn } = fakeWorkers();
  const client = createSqliteClient(spawn);
  await client.open(shop, true);
  await assert.rejects(client.execute('select * from nope', { maxRows: 10 }), (err) => {
    assert.equal(typeof err.code, 'string');
    assert.equal(err.code, 'server');
    assert.match(err.message, /no such table: nope/);
    return true;
  });
  await assert.rejects(client.open(new Uint8Array([1, 2, 3, 4]), true), (err) => err.code === 'not-a-database');
  await client.close();
});

test('calls before open and after close fail as connection-lost', async () => {
  const { spawn } = fakeWorkers();
  const client = createSqliteClient(spawn);
  await assert.rejects(client.execute('select 1', { maxRows: 1 }), (err) => err.code === 'connection-lost');
  await client.open(shop, true);
  await client.close();
  await assert.rejects(client.introspect(), (err) => err.code === 'connection-lost');
});
