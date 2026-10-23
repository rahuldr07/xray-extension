// Page-side client for the remote engines. It speaks the `xray-sql` runtime port to the service
// worker's connection manager (background/sql-manager.js): every request is { id, op, ... } and is
// answered exactly once with { id, ok, value | error }. Profiles and passwords live in the worker;
// this client only ever sees profile ids and the password the user just typed.

import { normalizeSqlError } from '../models/sqlErrors';
import type { PageProfile, SqlEngine, TlsMode } from '../models/sqlProfiles';
import type {
  DriverCapabilities,
  ExecuteOptions,
  QueryResult,
  SchemaTree,
  SqlDialect,
  SqlDriver,
  SqlError,
} from '../models/sqlTypes';

/** The slice of chrome.runtime.Port the client uses. */
export interface PortLike {
  postMessage(msg: unknown): void;
  disconnect(): void;
  onMessage: { addListener(fn: (msg: unknown) => void): void };
  onDisconnect: { addListener(fn: () => void): void };
}

export const SQL_PORT_NAME = 'xray-sql';

export type HelperStatus =
  | { state: 'ready'; helperVersion?: string }
  | { state: 'missing' | 'no-permission' | 'outdated'; helperVersion?: string };

export type SaveProfileInput = {
  id?: string;
  name: string;
  engine: SqlEngine;
  host: string;
  port: number;
  database: string;
  user: string;
  tls: TlsMode;
  caFile: string;
  statementTimeoutMs: number | null;
  readOnly: boolean;
  /** Omitted or '' keeps whichever password the worker already holds. */
  password?: string;
  /** Where the password lives: true = saved on this device, false = this browser session only. */
  savePassword?: boolean;
};

export interface RemoteSession extends SqlDriver {
  readonly serverVersion: string;
  fetchMore(tabId: string, n: number, signal?: AbortSignal): Promise<QueryResult>;
}

export interface RemoteApi {
  profiles: {
    list(): Promise<PageProfile[]>;
    save(input: SaveProfileInput): Promise<PageProfile>;
    delete(profileId: string): Promise<void>;
    /**
     * Test connection: the worker connects with these fields (read-only), closes at once and stores
     * nothing. An empty password uses the stored secret of `profile.id`, if any. Resolves with the
     * raw server version.
     */
    test(profile: SaveProfileInput, password: string): Promise<string>;
  };
  helperStatus(): Promise<HelperStatus>;
  connect(profileId: string, readOnly: boolean, password?: string, remember?: boolean): Promise<RemoteSession>;
}

interface Pending {
  resolve(value: unknown): void;
  reject(error: SqlError): void;
  port: PortLike;
}

const LOST: SqlError = { code: 'connection-lost', message: 'The connection to the database helper was lost.' };
const CANCELLED: SqlError = { code: 'cancelled', message: 'Query cancelled.' };
const NO_TAB: SqlError = { code: 'server', message: 'Missing editor tab id.' };

/** Only the fields a page may hold. A password is dropped even if the worker wrongly sent one. */
function cleanProfile(raw: unknown): PageProfile {
  const p = (raw ?? {}) as Record<string, unknown>;
  return {
    id: p.id as string,
    name: p.name as string,
    engine: p.engine as SqlEngine,
    host: p.host as string,
    port: p.port as number,
    database: p.database as string,
    user: p.user as string,
    tls: p.tls as TlsMode,
    caFile: typeof p.caFile === 'string' ? p.caFile : '',
    statementTimeoutMs: typeof p.statementTimeoutMs === 'number' ? p.statementTimeoutMs : null,
    readOnly: p.readOnly !== false,
    hasSavedPassword: p.hasSavedPassword === true,
  };
}

export function createRemoteClient(connectPort: () => PortLike): RemoteApi {
  let port: PortLike | null = null;
  let nextId = 1;
  const pending = new Map<number, Pending>();

  function dropPort(p: PortLike): void {
    if (port === p) port = null;
    for (const [id, call] of [...pending]) {
      if (call.port !== p) continue;
      pending.delete(id);
      call.reject({ ...LOST });
    }
  }

  // Opened on demand and never re-opened by itself: a lost port is retried only by the next call.
  function ensurePort(): PortLike {
    if (port) return port;
    let p: PortLike;
    try {
      p = connectPort();
    } catch {
      throw { ...LOST } satisfies SqlError;
    }
    p.onMessage.addListener((raw) => {
      if (port !== p) return;
      const msg = raw as { id?: unknown; ok?: unknown; value?: unknown; error?: unknown };
      if (typeof msg?.id !== 'number') return;
      const call = pending.get(msg.id);
      if (!call) return;
      pending.delete(msg.id);
      if (msg.ok === true) call.resolve(msg.value);
      else call.reject(normalizeSqlError(msg.error));
    });
    p.onDisconnect.addListener(() => dropPort(p));
    port = p;
    return p;
  }

  /** Sends one request; `onId` hears the request id before it goes out (for cancel). */
  function request<T>(op: string, body: Record<string, unknown> = {}, onId?: (id: number) => void): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      let p: PortLike;
      try {
        p = ensurePort();
      } catch (e) {
        reject(e);
        return;
      }
      const id = nextId++;
      pending.set(id, { resolve: resolve as (v: unknown) => void, reject, port: p });
      onId?.(id);
      try {
        p.postMessage({ id, op, ...body });
      } catch {
        // dropPort rejects everything pending on this port, this call included.
        dropPort(p);
        try {
          p.disconnect();
        } catch {
          /* already gone */
        }
      }
    });
  }

  function fireAndForget(op: string, body: Record<string, unknown>): void {
    request(op, body).catch(() => {});
  }

  function makeSession(
    sessionId: string,
    engine: SqlEngine,
    serverVersion: string,
    capabilities: DriverCapabilities,
  ): RemoteSession {
    const dialect: SqlDialect = engine;
    async function query(op: 'execute' | 'fetchMore', body: Record<string, unknown>, signal?: AbortSignal): Promise<QueryResult> {
      if (signal?.aborted) throw { ...CANCELLED };
      let requestId = 0;
      const onAbort = () => {
        if (requestId !== 0) fireAndForget('cancel', { queryId: requestId });
      };
      const call = request<QueryResult>(op, { sessionId, ...body }, (id) => {
        requestId = id;
      });
      signal?.addEventListener('abort', onAbort, { once: true });
      try {
        return await call;
      } finally {
        signal?.removeEventListener('abort', onAbort);
      }
    }
    return {
      dialect,
      capabilities,
      serverVersion,
      introspect: () => request<SchemaTree>('introspect', { sessionId }),
      execute: async (sql: string, opts: ExecuteOptions, signal?: AbortSignal) => {
        if (!opts.tabId) throw { ...NO_TAB };
        return query('execute', { tabId: opts.tabId, sql, maxRows: opts.maxRows }, signal);
      },
      fetchMore: async (tabId: string, n: number, signal?: AbortSignal) => {
        if (!tabId) throw { ...NO_TAB };
        return query('fetchMore', { tabId, n }, signal);
      },
      close: async () => {
        try {
          await request('close', { sessionId });
        } catch (e) {
          // A dead session is already closed.
          if ((e as SqlError).code !== 'connection-lost') throw e;
        }
      },
    };
  }

  const listProfiles = async (): Promise<PageProfile[]> => {
    const list = await request<unknown[]>('profiles.list');
    return Array.isArray(list) ? list.map(cleanProfile) : [];
  };

  return {
    profiles: {
      list: listProfiles,
      save: async (input) => cleanProfile(await request('profiles.save', { profile: input })),
      delete: async (profileId) => {
        await request('profiles.delete', { profileId });
      },
      test: async (input, password) => {
        // The password travels once, beside the fields, never inside a profile.
        const { password: _p, savePassword: _s, ...profile } = input;
        const res = await request<{ serverVersion?: unknown }>('profiles.test', { profile, password });
        return typeof res?.serverVersion === 'string' ? res.serverVersion : '';
      },
    },
    helperStatus: () => request<HelperStatus>('helper.status'),
    async connect(profileId, readOnly, password, remember) {
      const profile = (await listProfiles()).find((p) => p.id === profileId);
      if (!profile) throw { code: 'server', message: 'Unknown profile.' } satisfies SqlError;
      const body: Record<string, unknown> = { profileId, readOnly };
      if (password !== undefined) body.password = password;
      if (remember !== undefined) body.remember = remember;
      const res = await request<{ sessionId?: string; serverVersion?: string; capabilities?: DriverCapabilities }>(
        'connect',
        body,
      );
      if (typeof res?.sessionId !== 'string' || !res.capabilities) throw { ...LOST } satisfies SqlError;
      return makeSession(res.sessionId, profile.engine, res.serverVersion ?? '', res.capabilities);
    },
  };
}
