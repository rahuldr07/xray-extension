// Page-side SQLite driver: runs the engine in a dedicated worker (dist/sql-worker.js) so a long
// query never blocks the SQL page, and cancels by terminating that worker. A cancelled worker is
// replaced and re-opened from the last bytes the client knows: the opened file, or the latest
// export. Writes made after that point are gone, which is why `dirty` exists.

import { classifyStatement } from '../models/sqlClassify';
import { normalizeSqlError } from '../models/sqlErrors';
import { SQLITE_CAPABILITIES } from '../models/sqliteEngine';
import type { ExecuteOptions, QueryResult, SchemaTree, SqlDriver, SqlError } from '../models/sqlTypes';

export interface WorkerLike {
  postMessage(msg: unknown, transfer?: Transferable[]): void;
  terminate(): void;
  onmessage: ((e: { data: unknown }) => void) | null;
  // A worker that fails to load or throws at top level never answers; this is how the client hears.
  onerror: ((e: unknown) => void) | null;
}

export interface SqliteClient extends SqlDriver {
  open(bytes: Uint8Array, readOnly: boolean): Promise<void>;
  exportBytes(): Promise<Uint8Array>;
  readonly dirty: boolean;
}

export type SqliteRequest =
  | { id: number; op: 'open'; bytes: Uint8Array; readOnly: boolean }
  | { id: number; op: 'introspect' }
  | { id: number; op: 'execute'; sql: string; opts: ExecuteOptions }
  | { id: number; op: 'export' };

export type SqliteResponse = { id: number; ok: true; value: unknown } | { id: number; ok: false; error: SqlError };

type Body = SqliteRequest extends infer R ? (R extends { id: number } ? Omit<R, 'id'> : never) : never;

interface Pending {
  resolve(value: unknown): void;
  reject(error: SqlError): void;
}

const CANCELLED: SqlError = { code: 'cancelled', message: 'Query cancelled.' };
const LOST: SqlError = { code: 'connection-lost', message: 'No database is open.' };
const CRASHED: SqlError = { code: 'connection-lost', message: 'The SQL worker stopped. Open the file again.' };
const NOT_REOPENED: SqlError = {
  code: 'connection-lost',
  message: 'The database could not be reopened. Open the file again.',
};

// The query switches off sqlite-wasm's OPFS VFSes, which read the worker's location.search. The
// client never uses OPFS (files open from bytes), and in the IIFE bundle their proxy URL cannot be
// built, so each worker start would otherwise log two "Ignoring inability to install" warnings.
export const SQL_WORKER_PATH = 'dist/sql-worker.js?opfs-disable&opfs-wl-disable';

export function spawnSqliteWorker(): WorkerLike {
  const url = typeof chrome !== 'undefined' ? chrome.runtime?.getURL?.(SQL_WORKER_PATH) : undefined;
  if (!url) throw { code: 'connection-lost', message: 'The SQL worker is only available on the extension page.' } satisfies SqlError;
  // Worker's handlers take events; WorkerLike only needs onmessage's `data` and that onerror fired.
  return new Worker(url) as unknown as WorkerLike;
}

export function createSqliteClient(spawn: () => WorkerLike): SqliteClient {
  let worker: WorkerLike | null = null;
  let nextId = 1;
  const pending = new Map<number, Pending>();
  // The bytes a replacement worker re-opens: a private copy, never transferred and never handed
  // out, so no caller can detach or mutate it.
  let lastBytes: Uint8Array | null = null;
  let readOnly = true;
  let dirty = false;
  // Set when the database is gone (a failed re-open after cancel, or a crashed worker); every call
  // rejects with it until the next successful open.
  let broken: SqlError | null = null;
  // Every call waits for the latest (re)open, so a respawn is ready before the next request runs.
  let ready: Promise<void> = Promise.resolve();

  function startWorker(): WorkerLike {
    const w = spawn();
    w.onmessage = (e) => {
      if (w !== worker) return;
      const msg = e.data as SqliteResponse;
      const call = pending.get(msg.id);
      if (!call) return;
      pending.delete(msg.id);
      if (msg.ok) call.resolve(msg.value);
      else call.reject(normalizeSqlError(msg.error));
    };
    w.onerror = () => {
      if (w !== worker) return;
      broken = CRASHED;
      stopWorker(CRASHED);
    };
    worker = w;
    return w;
  }

  function stopWorker(reason: SqlError = LOST): void {
    const w = worker;
    worker = null;
    w?.terminate();
    for (const call of pending.values()) call.reject(reason);
    pending.clear();
  }

  function send<T>(body: Body, transfer?: Transferable[]): Promise<T> {
    const w = worker;
    if (!w) return Promise.reject(broken ?? LOST);
    const id = nextId++;
    return new Promise<T>((resolve, reject) => {
      pending.set(id, { resolve: resolve as (value: unknown) => void, reject });
      try {
        w.postMessage({ id, ...body }, transfer);
      } catch (err) {
        pending.delete(id);
        reject(normalizeSqlError(err));
      }
    });
  }

  // Runs on a later turn, so a throwing spawn() becomes a rejected promise rather than an exception.
  function reopen(bytes: Uint8Array, ro: boolean): Promise<void> {
    return Promise.resolve().then(() => {
      stopWorker();
      startWorker();
      // Structured clone copies the bytes; the copy kept as lastBytes is taken on success.
      return send<void>({ op: 'open', bytes, readOnly: ro });
    });
  }

  async function open(bytes: Uint8Array, ro: boolean): Promise<void> {
    const opening = reopen(bytes, ro);
    ready = opening.catch(() => undefined);
    try {
      await opening;
    } catch (err) {
      stopWorker();
      lastBytes = null;
      broken = null;
      throw err;
    }
    lastBytes = bytes.slice();
    readOnly = ro;
    dirty = false;
    broken = null;
  }

  // Before an execute or export runs, after any pending (re)open has settled.
  async function settled(): Promise<void> {
    await ready;
    if (broken) throw broken;
  }

  async function execute(sql: string, opts: ExecuteOptions, signal?: AbortSignal): Promise<QueryResult> {
    if (signal?.aborted) throw CANCELLED;
    await settled();
    if (signal?.aborted) throw CANCELLED;
    const running = send<QueryResult>({ op: 'execute', sql, opts });
    let cancelled = false;
    const onAbort = () => {
      cancelled = true;
      const bytes = lastBytes;
      const ro = readOnly;
      stopWorker();
      if (!bytes) return;
      ready = reopen(bytes, ro).then(
        () => {
          dirty = false;
        },
        () => {
          // No database behind the new worker: stop it and refuse calls until the file is opened again.
          stopWorker(NOT_REOPENED);
          broken = NOT_REOPENED;
        },
      );
    };
    signal?.addEventListener('abort', onAbort, { once: true });
    try {
      const result = await running;
      if (!readOnly && classifyStatement(sql, 'sqlite').kind !== 'read') dirty = true;
      return result;
    } catch (err) {
      if (cancelled) throw CANCELLED;
      // A script that fails part-way has already applied its earlier statements: over-report
      // rather than let a later cancel or close silently drop them.
      if (!readOnly && (err as SqlError).code !== 'cancelled' && classifyStatement(sql, 'sqlite').kind !== 'read') {
        dirty = true;
      }
      throw err;
    } finally {
      signal?.removeEventListener('abort', onAbort);
    }
  }

  async function introspect(): Promise<SchemaTree> {
    await settled();
    return send<SchemaTree>({ op: 'introspect' });
  }

  async function exportBytes(): Promise<Uint8Array> {
    await settled();
    const bytes = await send<Uint8Array>({ op: 'export' });
    lastBytes = bytes;
    dirty = false;
    return bytes.slice();
  }

  async function close(): Promise<void> {
    stopWorker();
    lastBytes = null;
    dirty = false;
    broken = null;
    ready = Promise.resolve();
  }

  return {
    dialect: 'sqlite',
    capabilities: SQLITE_CAPABILITIES,
    open,
    introspect,
    execute,
    exportBytes,
    close,
    get dirty() {
      return dirty;
    },
  };
}
