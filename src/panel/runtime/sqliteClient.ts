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

// The query switches off sqlite-wasm's OPFS VFSes, which read the worker's location.search. The
// client never uses OPFS (files open from bytes), and in the IIFE bundle their proxy URL cannot be
// built, so each worker start would otherwise log two "Ignoring inability to install" warnings.
export const SQL_WORKER_PATH = 'dist/sql-worker.js?opfs-disable&opfs-wl-disable';

export function spawnSqliteWorker(): WorkerLike {
  const url = typeof chrome !== 'undefined' ? chrome.runtime?.getURL?.(SQL_WORKER_PATH) : undefined;
  if (!url) throw { code: 'connection-lost', message: 'The SQL worker is only available on the extension page.' } satisfies SqlError;
  // Worker's onmessage takes a MessageEvent; WorkerLike only needs its `data`.
  return new Worker(url) as unknown as WorkerLike;
}

export function createSqliteClient(spawn: () => WorkerLike): SqliteClient {
  let worker: WorkerLike | null = null;
  let nextId = 1;
  const pending = new Map<number, Pending>();
  // The bytes a replacement worker re-opens. Never transferred: a detached buffer cannot re-open.
  let lastBytes: Uint8Array | null = null;
  let readOnly = true;
  let dirty = false;
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
    worker = w;
    return w;
  }

  function stopWorker(): void {
    const w = worker;
    worker = null;
    w?.terminate();
    for (const call of pending.values()) call.reject(LOST);
    pending.clear();
  }

  function send<T>(body: Body, transfer?: Transferable[]): Promise<T> {
    const w = worker;
    if (!w) return Promise.reject(LOST);
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

  function reopen(bytes: Uint8Array, ro: boolean): Promise<void> {
    stopWorker();
    startWorker();
    // Structured clone copies the bytes, so the caller and lastBytes keep theirs.
    return send<void>({ op: 'open', bytes, readOnly: ro }).then(() => {
      lastBytes = bytes;
      readOnly = ro;
      dirty = false;
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
      throw err;
    }
  }

  async function execute(sql: string, opts: ExecuteOptions, signal?: AbortSignal): Promise<QueryResult> {
    if (signal?.aborted) throw CANCELLED;
    await ready;
    if (signal?.aborted) throw CANCELLED;
    const running = send<QueryResult>({ op: 'execute', sql, opts });
    if (!signal) return finish(sql, await running);
    let cancelled = false;
    const onAbort = () => {
      cancelled = true;
      const bytes = lastBytes;
      stopWorker();
      if (bytes) ready = reopen(bytes, readOnly).catch(() => undefined);
    };
    signal.addEventListener('abort', onAbort, { once: true });
    try {
      return finish(sql, await running);
    } catch (err) {
      throw cancelled ? CANCELLED : err;
    } finally {
      signal.removeEventListener('abort', onAbort);
    }
  }

  function finish(sql: string, result: QueryResult): QueryResult {
    if (!readOnly && classifyStatement(sql, 'sqlite').kind !== 'read') dirty = true;
    return result;
  }

  async function introspect(): Promise<SchemaTree> {
    await ready;
    return send<SchemaTree>({ op: 'introspect' });
  }

  async function exportBytes(): Promise<Uint8Array> {
    await ready;
    const bytes = await send<Uint8Array>({ op: 'export' });
    lastBytes = bytes;
    dirty = false;
    return bytes;
  }

  async function close(): Promise<void> {
    stopWorker();
    lastBytes = null;
    dirty = false;
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
