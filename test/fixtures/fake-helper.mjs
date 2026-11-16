#!/usr/bin/env node
// A fake xray-db-helper for the e2e tests. It speaks the real native-messaging protocol (Task 1:
// a 4-byte native-endian length, then JSON) and answers from a scripted fixture: one Postgres
// database with `public.orders` (25 rows) and cursor support, so the real service-worker code runs
// against it. Any password but "wrong" is accepted.
//
// Env: FAKE_HELPER_LOG=<file> appends each request as one JSON line, for assertions. A connect's
// password is replaced by "<redacted:N>" (N = its length) or "<none>", so the log never holds it.

import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';

const LE = os.endianness() === 'LE';
const SERVER_VERSION = 'PostgreSQL 16.4 on x86_64-pc-linux-gnu, compiled by gcc (GCC) 13.2.0, 64-bit';
const CAPABILITIES = { readOnlyEnforced: true, cancel: true, transactions: true, cursor: true, multiStatement: false };

const COLUMNS = [
  { name: 'id', type: 'int4' },
  { name: 'customer', type: 'text' },
  { name: 'total', type: 'numeric' },
];
const ROWS = Array.from({ length: 25 }, (_, i) => [i + 1, `customer ${i + 1}`, `${(i + 1) * 10}.50`]);
const SCHEMA = {
  schemas: [
    {
      name: 'public',
      tables: [
        {
          name: 'orders',
          columns: [
            { name: 'id', type: 'int4', nullable: false, defaultValue: null, pk: true },
            { name: 'customer', type: 'text', nullable: false, defaultValue: null, pk: false },
            { name: 'total', type: 'numeric', nullable: true, defaultValue: null, pk: false },
          ],
          indexes: ['orders_pkey'],
        },
      ],
      views: [],
    },
  ],
};

// Random session ids, as the real helper's registry makes: a restarted helper never reuses one.
const sessions = new Map(); // sessionId -> Map(tabId -> { offset })

function log(msg) {
  if (!process.env.FAKE_HELPER_LOG) return;
  const entry = { ...msg };
  if (msg.op === 'connect') {
    entry.password = typeof msg.password === 'string' && msg.password !== '' ? `<redacted:${msg.password.length}>` : '<none>';
  }
  fs.appendFileSync(process.env.FAKE_HELPER_LOG, `${JSON.stringify(entry)}\n`);
}

function send(msg) {
  const body = Buffer.from(JSON.stringify(msg), 'utf8');
  const head = Buffer.alloc(4);
  if (LE) head.writeUInt32LE(body.length);
  else head.writeUInt32BE(body.length);
  process.stdout.write(Buffer.concat([head, body]));
}

const ok = (id, value) => send({ id, ok: true, value });
const fail = (id, code, message) => send({ id, ok: false, error: { code, message } });

function streamRows(id, cursor, n) {
  const rows = ROWS.slice(cursor.offset, cursor.offset + n);
  cursor.offset += rows.length;
  send({ id, stream: 'columns', columns: COLUMNS });
  if (rows.length) send({ id, stream: 'rows', rows });
  ok(id, {
    rowCount: rows.length,
    affected: null,
    durationMs: 1.25,
    notices: [],
    hasMore: cursor.offset < ROWS.length,
    truncatedCells: 0,
  });
}

function handle(msg) {
  const { id, op } = msg;
  log(msg);
  switch (op) {
    case 'hello':
      // FAKE_HELPER_PROTOCOL plays an older or newer helper (the extension then reads it as outdated).
      return ok(id, { protocolVersion: Number(process.env.FAKE_HELPER_PROTOCOL || 1), helperVersion: '0.9.0-fake' });
    case 'connect': {
      if (msg.password === 'wrong') return fail(id, 'auth-failed', 'Password authentication failed for user "postgres".');
      const sessionId = crypto.randomBytes(16).toString('hex');
      sessions.set(sessionId, new Map());
      return ok(id, { sessionId, serverVersion: SERVER_VERSION, capabilities: CAPABILITIES });
    }
    case 'introspect':
      if (!sessions.has(msg.sessionId)) return fail(id, 'connection-lost', 'The connection to the database was lost. Reconnect to continue.');
      return ok(id, SCHEMA);
    case 'execute': {
      const tabs = sessions.get(msg.sessionId);
      if (!tabs) return fail(id, 'connection-lost', 'The connection to the database was lost. Reconnect to continue.');
      // The helper process dies mid-query: the extension sees its port disconnect.
      if (/pg_crash_helper/i.test(msg.sql ?? '')) process.exit(1);
      // BEGIN/COMMIT/ROLLBACK track a transaction per tab, as the real helper reports it.
      const control = /^\s*(begin|start transaction|commit|rollback|end)\b/i.exec(msg.sql ?? '');
      if (control) {
        tabs.inTx ??= new Set();
        if (/^(begin|start)/i.test(control[1])) tabs.inTx.add(msg.tabId);
        else tabs.inTx.delete(msg.tabId);
        send({ id, stream: 'columns', columns: [] });
        return ok(id, { rowCount: 0, affected: 0, durationMs: 0.5, notices: [], hasMore: false, truncatedCells: 0, inTransaction: tabs.inTx.has(msg.tabId) });
      }
      if (!/\borders\b/i.test(msg.sql ?? '')) return fail(id, 'syntax', 'relation does not exist');
      const cursor = { offset: 0 };
      tabs.set(msg.tabId, cursor);
      return streamRows(id, cursor, msg.maxRows > 0 ? msg.maxRows : 1000);
    }
    case 'fetchMore': {
      const cursor = sessions.get(msg.sessionId)?.get(msg.tabId);
      if (!cursor) return fail(id, 'bad-request', 'There are no more rows to fetch. Run the query again.');
      return streamRows(id, cursor, msg.n > 0 ? msg.n : 1000);
    }
    case 'cancel':
      return ok(id, {});
    case 'closeTab':
      sessions.get(msg.sessionId)?.delete(msg.tabId);
      return ok(id, {});
    case 'close':
      sessions.delete(msg.sessionId);
      return ok(id, {});
    default:
      return fail(id, 'bad-request', 'unknown op');
  }
}

let buffer = Buffer.alloc(0);
process.stdin.on('data', (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);
  while (buffer.length >= 4) {
    const n = LE ? buffer.readUInt32LE(0) : buffer.readUInt32BE(0);
    if (buffer.length < 4 + n) break;
    const payload = buffer.subarray(4, 4 + n).toString('utf8');
    buffer = buffer.subarray(4 + n);
    let msg;
    try {
      msg = JSON.parse(payload);
    } catch {
      fail(0, 'bad-request', 'malformed request');
      continue;
    }
    handle(msg);
  }
});
process.stdin.on('end', () => process.exit(0));
