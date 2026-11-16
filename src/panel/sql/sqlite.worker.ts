// Dedicated worker for the SQL page: hosts SQLite-WASM and the engine, answering
// { id, op } requests from runtime/sqliteClient.ts. Built as a classic IIFE worker
// (dist/sql-worker.js); the wasm is served beside it as dist/sqlite3.wasm.

import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import { createSqliteEngine } from '../models/sqliteEngine';
import { normalizeSqlError } from '../models/sqlErrors';
import type { SqliteRequest, SqliteResponse } from '../runtime/sqliteClient';

interface WorkerScope {
  onmessage: ((e: { data: unknown }) => void) | null;
  postMessage(msg: unknown, transfer?: Transferable[]): void;
}

const scope = self as unknown as WorkerScope;

// The typings declare init() without arguments; the Emscripten module options are still honoured.
// In an IIFE bundle import.meta.url is empty, so the wasm is located explicitly: a relative URL
// resolves against this worker script's own URL.
const init = sqlite3InitModule as unknown as (options: { locateFile: () => string }) => Promise<unknown>;
const ready = init({ locateFile: () => 'sqlite3.wasm' }).then(createSqliteEngine);

scope.onmessage = async (e) => {
  const req = e.data as SqliteRequest;
  let reply: SqliteResponse;
  const transfer: Transferable[] = [];
  try {
    const engine = await ready;
    let value: unknown = null;
    if (req.op === 'open') engine.open(req.bytes, req.readOnly);
    else if (req.op === 'introspect') value = engine.introspect();
    else if (req.op === 'execute') value = engine.execute(req.sql, req.opts);
    else if (req.op === 'export') {
      const bytes = engine.exportBytes();
      // sqlite3_js_db_export returns a copy off the wasm heap, so transferring it is safe.
      transfer.push(bytes.buffer);
      value = bytes;
    }
    reply = { id: req.id, ok: true, value };
  } catch (err) {
    reply = { id: req.id, ok: false, error: normalizeSqlError(err) };
  }
  scope.postMessage(reply, transfer);
};
