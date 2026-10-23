// State for the SQL page (sql.html): one SQLite client for the page's lifetime, or one remote
// (Postgres/MySQL) session through the service worker; the open connection, editor tabs, the
// latest result, Messages and History. Decisions about SQL live in
// the models (classification, splitting, values, history shapes); this store only sequences them.
// It must never import ./store: that would pull the capture console into dist/sql-ui.js.

import { create } from 'zustand';
import { createSqliteClient, spawnSqliteWorker, type SqliteClient } from './runtime/sqliteClient';
import {
  createRemoteClient,
  SQL_PORT_NAME,
  type HelperStatus,
  type PortLike,
  type RemoteApi,
  type RemoteSession,
  type SaveProfileInput,
} from './runtime/remoteClient';
import { getStoredValue, setStoredValue } from './runtime/storageBridge';
import { rememberRecentFile } from './runtime/recentFiles';
import { classifyStatement, type StatementKind } from './models/sqlClassify';
import { normalizeSqlError } from './models/sqlErrors';
import { selectTableSql } from './models/sqlSchema';
import { splitStatements, statementAt } from './models/sqlStatements';
import { clampMaxRows } from './models/sqlValues';
import { restoreLayout, SQL_LAYOUT_KEY, type SqlLayout } from './models/sqlLayout';
import type { SortState } from './models/sqlGrid';
import { ignoredFilesMessage, pickDroppedFile } from './models/sqlUi';
import {
  appendHistory,
  connectionKeyForFile,
  connectionKeyForProfile,
  EDITOR_TABS_KEY,
  HISTORY_KEY,
  newTabId,
  restoreEditorTabs,
  type EditorTab,
  type HistoryItem,
} from './models/sqlHistory';
import type { PageProfile, SqlEngine } from './models/sqlProfiles';
import {
  DEFAULT_MAX_ROWS,
  type QueryResult,
  type SchemaTree,
  type SqlDialect,
  type SqlDriver,
  type SqlError,
} from './models/sqlTypes';

export type SqlConnection =
  | { kind: 'sqlite'; name: string; size: number; readOnly: boolean; key: string }
  | {
      kind: 'remote';
      profileId: string;
      name: string;
      engine: SqlEngine;
      host: string;
      database: string;
      readOnly: boolean;
      key: string;
      serverVersion: string;
    };

/** The SQL dialect of a connection: the remote engine, or SQLite (also with nothing open). */
export function connectionDialect(conn: SqlConnection | null): SqlDialect {
  return conn?.kind === 'remote' ? conn.engine : 'sqlite';
}

export interface SqlPrompt {
  title: string;
  message: string;
  confirmLabel: string;
}

export type SqlBottomTab = 'results' | 'messages' | 'history';

/** The database helper as last heard: 'unknown' until a status check or a connect answers. */
export interface SqlHelperInfo {
  state: HelperStatus['state'] | 'unknown';
  helperVersion?: string;
}

export interface EditorSelection {
  from: number;
  to: number;
  head: number;
}

export interface SqlState {
  connection: SqlConnection | null;
  schema: SchemaTree | null;
  tabs: EditorTab[];
  activeTabId: string;
  running: { tabId: string; controller: AbortController } | null;
  result: QueryResult | null;
  error: SqlError | null;
  messages: string[];
  history: HistoryItem[];
  pendingConfirm: { sql: string; reason: string } | null;
  // Mirror of the client's non-reactive `dirty`, refreshed after every call that can change it.
  dirty: boolean;
  opening: boolean;
  // The Read-only checkbox: the choice for the next open, and connection.readOnly once a file is open.
  readOnlyChoice: boolean;
  // Error underline, as an offset into the tab's document (not into the statement sent).
  errorAt: { tabId: string; position: number } | null;
  // The table a preview ran against: the INSERT copy's target name.
  resultTable: string | null;
  bottomTab: SqlBottomTab;
  // Confirmations that are not about a statement: discarding unsaved changes.
  pendingPrompt: SqlPrompt | null;
  // Editor share and rail width, persisted as sql_layout.
  layout: SqlLayout;
  // The editor caret, 1-based, for the status bar.
  cursor: { line: number; col: number };
  // The Results grid's view of the loaded rows. Kept here so a bottom-tab switch or a re-run with the
  // same columns keeps them; the sort and the inspected cell belong to one column set (columnsKey).
  gridView: { key: string; sort: SortState | null; inspected: { row: number; col: number } | null };
  rowFilter: string;
  // Saved Postgres/MySQL profiles (never with a password) and the helper's state.
  profiles: PageProfile[];
  helper: SqlHelperInfo;
  // Set when a connect needs a password the worker does not hold: the password prompt.
  pendingPassword: { profileId: string; name: string } | null;
  // The remote session died (helper, worker or server gone): Reconnect is offered, tabs are kept.
  connectionLost: boolean;
  // The shown result came from a remote cursor that has more rows: Fetch more appends them.
  canFetchMore: boolean;

  openFile(file: File, handle?: FileSystemFileHandle): Promise<void>;
  // Files dropped on the page: the first opens through openFile (no handle, so Save downloads).
  openDropped(files: File[]): Promise<void>;
  run(mode: 'current' | 'all'): Promise<void>;
  stop(): void;
  confirmPending(): Promise<void>;
  cancelPending(): void;
  confirmPrompt(): Promise<void>;
  cancelPrompt(): void;
  previewTable(schema: string, table: string): Promise<void>;
  setReadOnly(on: boolean): Promise<void>;
  save(): Promise<void>;
  setMaxRows(n: number): void;
  addTab(): void;
  closeTab(id: string): void;
  setActiveTab(id: string): void;
  updateTabSql(id: string, sql: string): void;
  setBottomTab(tab: SqlBottomTab): void;
  setLayout(patch: Partial<SqlLayout>): void;
  setCursor(line: number, col: number): void;
  setGridView(view: SqlState['gridView']): void;
  setRowFilter(text: string): void;
  // Connects to a saved profile; a password typed into the prompt is passed here (never stored in the page).
  connectProfile(profileId: string, opts?: { password?: string; remember?: boolean }): Promise<void>;
  fetchMore(): Promise<void>;
  reconnect(): Promise<void>;
  // Closes the password prompt without connecting.
  cancelPassword(): void;
  // Reloads the saved profiles and the helper status.
  refreshRemote(): Promise<void>;
  // Saves a profile (the password goes to the worker and is never kept here) and reloads the list.
  // Rejects with a SqlError.
  saveProfile(input: SaveProfileInput): Promise<PageProfile>;
  deleteProfile(profileId: string): Promise<void>;
  // Test connection: connects with the given fields, reads the server version and closes. A new
  // profile, or one with a typed password, is tested through a throwaway profile that is deleted
  // afterwards; an existing profile without a typed password is saved first, since only the worker
  // holds its password. Resolves with the raw server version; rejects with a SqlError.
  testProfile(input: SaveProfileInput): Promise<string>;
}

const NOT_A_DATABASE = 'This file is not a SQLite database.';
const QUERY_CANCELLED: SqlError = { code: 'cancelled', message: 'Query cancelled.' };
const REMOTE_LOST: SqlError = { code: 'connection-lost', message: 'The connection to the database was lost.' };
const FETCH_MORE_ROWS = 1000;
const MESSAGE_LIMIT = 500;
const PERSIST_DELAY_MS = 300;

interface RunItem {
  text: string;
  // Offset of `text` in the tab's document, to map engine error positions back.
  from: number;
}

interface RunQueue {
  tabId: string;
  items: RunItem[];
  index: number;
  maxRows: number;
  resultTable: string | null;
}

let client: SqliteClient | null = null;
let remoteApi: RemoteApi | null = null;
// The open remote session, when the connection is remote.
let remote: RemoteSession | null = null;
// The editor tab whose statement produced the shown result: remote cursors are per tab.
let resultTabId: string | null = null;
// The Read-only mode a pending password retry connects with (a reconnect or a mode switch).
let passwordMode: boolean | null = null;
// The bytes a re-open starts from: the file as opened, or as last saved.
let bytes: Uint8Array | null = null;
let fileHandle: FileSystemFileHandle | null = null;
// Set when a save exported the database but the disk write failed, or went out as a download that
// may never complete: the client no longer counts the changes as unsaved (its re-open bytes include
// them), but the file on disk may still be behind.
let diskBehind = false;
let selectionReader: (() => EditorSelection) | null = null;
let queue: RunQueue | null = null;
let promptAction: (() => Promise<void> | void) | null = null;
let storedHistory: Record<string, HistoryItem[]> = {};
let storedTabs: Record<string, EditorTab[]> = {};
let storedLayout: SqlLayout = restoreLayout(undefined);
let storageLoaded: Promise<void> | null = null;
const persistTimers = new Map<string, ReturnType<typeof setTimeout>>();
const persistWriters = new Map<string, () => void>();

function sqlClient(): SqliteClient {
  client ??= createSqliteClient(spawnSqliteWorker);
  return client;
}

function remoteClient(): RemoteApi {
  remoteApi ??= createRemoteClient(() => {
    // The ambient `chrome` type only declares what the capture panel uses; sql.html has runtime.connect.
    const runtime = (typeof chrome === 'undefined' ? undefined : chrome.runtime) as
      | { connect?(info: { name: string }): PortLike }
      | undefined;
    if (!runtime?.connect) throw new Error('The database helper is only available on the extension page.');
    return runtime.connect({ name: SQL_PORT_NAME });
  });
  return remoteApi;
}

/** Tests drive the store with a stub instead of the service-worker port. */
export function __setRemoteApiForTests(api: RemoteApi | null): void {
  remoteApi = api;
}

function isRemote(): boolean {
  return usePanelSqlStore.getState().connection?.kind === 'remote';
}

// The driver for the open connection. A remote connection never touches (or spawns) the SQLite worker.
function driver(): SqlDriver {
  if (!isRemote()) return sqlClient();
  if (!remote) throw { ...REMOTE_LOST } satisfies SqlError;
  return remote;
}

// Closing a session the page no longer uses; a dead one is already closed.
function closeRemote(): void {
  const session = remote;
  remote = null;
  session?.close().catch(() => undefined);
}

// What the UI calls unsaved: changes only the worker holds, or a save that never reached the disk.
// A remote connection holds nothing in the page.
function unsaved(): boolean {
  if (isRemote()) return false;
  return sqlClient().dirty || diskBehind;
}

/** The editor registers how to read its selection; run('current') needs it. */
export function setSelectionReader(reader: (() => EditorSelection) | null): void {
  selectionReader = reader;
}

function asRecord<T>(raw: unknown): Record<string, T[]> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: Record<string, T[]> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (Array.isArray(value)) out[key] = value as T[];
  }
  return out;
}

/** Reads stored history, editor tabs and the layout once; storage failures leave the defaults. */
export function loadSqlStorage(): Promise<void> {
  storageLoaded ??= Promise.all([
    getStoredValue<unknown>(HISTORY_KEY, {}).catch(() => ({})),
    getStoredValue<unknown>(EDITOR_TABS_KEY, {}).catch(() => ({})),
    getStoredValue<unknown>(SQL_LAYOUT_KEY, null).catch(() => null),
  ]).then(([history, tabs, layout]) => {
    storedHistory = asRecord<HistoryItem>(history);
    storedTabs = asRecord<EditorTab>(tabs);
    storedLayout = restoreLayout(layout);
    // Loaded before the first render (sql-main.tsx awaits this), so the layout never flashes.
    usePanelSqlStore.setState({ layout: storedLayout });
  });
  return storageLoaded;
}

function schedulePersist(key: string, write: () => void): void {
  const timer = persistTimers.get(key);
  if (timer) clearTimeout(timer);
  persistWriters.set(key, write);
  persistTimers.set(
    key,
    setTimeout(() => {
      persistTimers.delete(key);
      persistWriters.delete(key);
      write();
    }, PERSIST_DELAY_MS),
  );
}

/** Writes any debounced history or tab change now (before switching files, on pagehide). */
export function flushSqlPersistence(): void {
  for (const [key, timer] of persistTimers) {
    clearTimeout(timer);
    persistWriters.get(key)?.();
  }
  persistTimers.clear();
  persistWriters.clear();
}

function writeLater(key: string, read: () => unknown): void {
  schedulePersist(key, () => {
    setStoredValue(key, read()).catch(() => undefined);
  });
}

function friendly(err: SqlError): SqlError {
  if (err.code === 'not-a-database') return { ...err, message: NOT_A_DATABASE, detail: err.message };
  return err;
}

function withMessage(messages: string[], ...lines: string[]): string[] {
  const next = [...messages, ...lines];
  return next.length > MESSAGE_LIMIT ? next.slice(next.length - MESSAGE_LIMIT) : next;
}

function formatMs(ms: number): string {
  return `${Math.round(ms)} ms`;
}

export function resultSummary(result: QueryResult): string {
  if (result.columns.length === 0) return `${result.affected ?? 0} rows affected · ${formatMs(result.durationMs)}`;
  return `${result.rowCount} rows · ${formatMs(result.durationMs)}`;
}

const SQLITE_HEADER = 'SQLite format 3\u0000';

// An empty file is a valid empty database; anything else starts with the 16-byte magic string.
function hasSqliteHeader(data: Uint8Array): boolean {
  if (data.length === 0) return true;
  if (data.length < SQLITE_HEADER.length) return false;
  for (let i = 0; i < SQLITE_HEADER.length; i++) if (data[i] !== SQLITE_HEADER.charCodeAt(i)) return false;
  return true;
}

function blankTab(n: number): EditorTab {
  return { id: newTabId(), title: `Query ${n}`, sql: '', maxRows: DEFAULT_MAX_ROWS };
}

const initialTabs = restoreEditorTabs(undefined, '');

export const usePanelSqlStore = create<SqlState>((set, get) => {
  function persistTabs(): void {
    const conn = get().connection;
    if (!conn) return;
    storedTabs = { ...storedTabs, [conn.key]: get().tabs };
    writeLater(EDITOR_TABS_KEY, () => storedTabs);
  }

  function recordHistory(item: HistoryItem): void {
    const conn = get().connection;
    if (!conn) return;
    storedHistory = appendHistory(storedHistory, conn.key, item);
    set({ history: storedHistory[conn.key] ?? [] });
    writeLater(HISTORY_KEY, () => storedHistory);
  }

  function say(...lines: string[]): void {
    set({ messages: withMessage(get().messages, ...lines) });
  }

  function ask(prompt: SqlPrompt, action: () => Promise<void> | void): void {
    promptAction = action;
    set({ pendingPrompt: prompt });
  }

  async function refreshSchema(): Promise<void> {
    try {
      const schema = await driver().introspect();
      set({ schema, dirty: unsaved() });
    } catch (raw) {
      const err = friendly(normalizeSqlError(raw));
      set({ dirty: unsaved(), ...(isRemote() && err.code === 'connection-lost' ? { connectionLost: true, canFetchMore: false } : {}) });
      say(err.message);
    }
  }

  async function openBytes(file: File, handle: FileSystemFileHandle | undefined): Promise<void> {
    await loadSqlStorage();
    flushSqlPersistence();
    const hadConnection = !!get().connection;
    // Read-only is on for every opened file; the checkbox can turn it off only for the first one.
    const readOnly = hadConnection ? true : get().readOnlyChoice;
    set({ opening: true, error: null, errorAt: null });
    let data: Uint8Array;
    try {
      data = new Uint8Array(await file.arrayBuffer());
    } catch (raw) {
      const message = raw instanceof Error ? raw.message : String(raw);
      set({ opening: false, bottomTab: 'messages', messages: withMessage(get().messages, `${file.name}: ${message}`) });
      return;
    }
    // Refused before it reaches the worker, so a wrong file leaves the open database in place.
    if (!hasSqliteHeader(data)) {
      const err: SqlError = { code: 'not-a-database', message: NOT_A_DATABASE };
      set({ opening: false, error: err, bottomTab: 'messages', messages: withMessage(get().messages, `${file.name}: ${err.message}`) });
      return;
    }
    try {
      await sqlClient().open(data, readOnly);
    } catch (raw) {
      const err = friendly(normalizeSqlError(raw));
      bytes = null;
      fileHandle = null;
      diskBehind = false;
      // The previous file's tabs were persisted under its key; they must not follow into the next file.
      // A remote connection was not replaced by the failed open: it stays, with its tabs and schema.
      if (get().connection?.kind === 'remote') {
        set({ opening: false, error: err, bottomTab: 'messages', messages: withMessage(get().messages, `${file.name}: ${err.message}`) });
        return;
      }
      const blank = hadConnection ? restoreEditorTabs(undefined, '') : null;
      set({
        connectionLost: false,
        canFetchMore: false,
        ...(blank ? { tabs: blank, activeTabId: blank[0].id, errorAt: null } : {}),
        opening: false,
        connection: null,
        schema: null,
        result: null,
        resultTable: null,
        dirty: false,
        history: [],
        readOnlyChoice: true,
        error: err,
        bottomTab: 'messages',
        messages: withMessage(get().messages, `${file.name}: ${err.message}`),
      });
      return;
    }
    bytes = data;
    fileHandle = handle ?? null;
    diskBehind = false;
    closeRemote();
    // Picker-opened files come back on the welcome screen's recent list.
    if (handle) void rememberRecentFile(handle, file);
    const key = connectionKeyForFile(file.name, file.size);
    // A scratch query typed before the first open carries over when the file has no saved tabs.
    const tabs = storedTabs[key] || hadConnection ? restoreEditorTabs(storedTabs, key) : get().tabs;
    let schema: SchemaTree | null = null;
    let schemaError: string | null = null;
    try {
      schema = await sqlClient().introspect();
    } catch (raw) {
      schemaError = friendly(normalizeSqlError(raw)).message;
    }
    set({
      opening: false,
      connection: { kind: 'sqlite', name: file.name, size: file.size, readOnly, key },
      connectionLost: false,
      canFetchMore: false,
      readOnlyChoice: readOnly,
      schema,
      tabs,
      activeTabId: tabs[0].id,
      result: null,
      resultTable: null,
      error: null,
      errorAt: null,
      dirty: false,
      history: storedHistory[key] ?? [],
      bottomTab: 'results',
      messages: withMessage(
        get().messages,
        `Opened ${file.name}${readOnly ? ' (read-only)' : ''}.`,
        ...(schemaError ? [schemaError] : []),
      ),
    });
    persistTabs();
  }

  async function reopenAs(readOnly: boolean): Promise<void> {
    const conn = get().connection;
    if (!conn || !bytes) return;
    try {
      await sqlClient().open(bytes, readOnly);
    } catch (raw) {
      const err = friendly(normalizeSqlError(raw));
      bytes = null;
      fileHandle = null;
      diskBehind = false;
      set({ connection: null, schema: null, dirty: false, error: err, bottomTab: 'messages' });
      say(err.message);
      return;
    }
    // Re-opened from the last bytes that reached the disk (or were opened), so nothing is behind.
    diskBehind = false;
    set({ connection: { ...conn, readOnly }, readOnlyChoice: readOnly, dirty: false });
    say(readOnly ? `${conn.name} is read-only.` : `${conn.name} is open for writing. Save writes changes back.`);
    await refreshSchema();
  }

  // Runs one statement. Returns false when the run must stop (an error, a cancel).
  async function execute(q: RunQueue, item: RunItem, kind: StatementKind): Promise<boolean> {
    const controller = new AbortController();
    set({ running: { tabId: q.tabId, controller }, error: null, errorAt: null });
    const at = Date.now();
    const onRemote = isRemote();
    try {
      // Remote drivers keep one cursor per editor tab, so every statement names its tab.
      const d = driver();
      const result = await d.execute(item.text, { maxRows: q.maxRows, tabId: q.tabId }, controller.signal);
      recordHistory({
        sql: item.text,
        at,
        durationMs: Math.round(result.durationMs),
        rowCount: result.columns.length ? result.rowCount : result.affected,
        ok: true,
      });
      const extra = [...result.notices];
      if (result.truncatedCells > 0) extra.push(`${result.truncatedCells} long text values were cut for display.`);
      resultTabId = q.tabId;
      set({
        running: null,
        result,
        resultTable: q.resultTable,
        canFetchMore: result.hasMore && d.capabilities.cursor,
        // A new result keeps the sort (same columns) but never the inspected cell: its row index
        // would point at different data.
        gridView: { ...get().gridView, inspected: null },
        dirty: unsaved(),
        bottomTab: 'results',
        messages: withMessage(get().messages, resultSummary(result), ...extra),
      });
      if (kind !== 'read') await refreshSchema();
      return true;
    } catch (raw) {
      let err = friendly(normalizeSqlError(raw));
      const lost = onRemote && err.code === 'connection-lost';
      // A Stop on a remote query can be answered either way (the helper may drop the tab's
      // connection to interrupt it); both read as the cancel the user asked for.
      if (onRemote && controller.signal.aborted && (err.code === 'cancelled' || lost)) err = { ...QUERY_CANCELLED };
      recordHistory({ sql: item.text, at, durationMs: Date.now() - at, rowCount: null, ok: false, error: err.message });
      set({
        running: null,
        error: err,
        // The tab's statement ended its cursor; a lost session ends every cursor.
        ...(lost || q.tabId === resultTabId ? { canFetchMore: false } : {}),
        ...(lost ? { connectionLost: true } : {}),
        errorAt: err.position === undefined ? null : { tabId: q.tabId, position: err.position + item.from },
        dirty: unsaved(),
        bottomTab: 'messages',
        messages: withMessage(get().messages, err.message),
      });
      // A cancel restarts the worker from the last saved bytes; the schema may have rolled back.
      if (err.code === 'cancelled' && !onRemote) await refreshSchema();
      return false;
    }
  }

  async function drain(q: RunQueue, confirmedIndex: number): Promise<void> {
    queue = null;
    while (q.index < q.items.length) {
      const conn = get().connection;
      if (!conn) return;
      if (conn.kind === 'remote' && get().connectionLost) {
        say('The connection was lost. Reconnect to run queries.');
        return;
      }
      const item = q.items[q.index];
      const c = classifyStatement(item.text, connectionDialect(conn));
      // R10: on a read-only connection an unparseable statement goes to the engine, which answers
      // with the real syntax error and still refuses any write: SQLite opens the file read-only;
      // on Postgres/MySQL the server's read-only transaction and the helper's keyword guard do.
      if (conn.readOnly && c.kind !== 'read' && c.reason !== 'could not parse') {
        const err: SqlError = {
          code: 'read-only',
          message: `This connection is read-only. Turn off Read-only to run ${c.reason}.`,
        };
        set({ error: err, errorAt: null, bottomTab: 'messages', messages: withMessage(get().messages, err.message) });
        return;
      }
      if (!conn.readOnly && c.kind === 'dangerous' && q.index !== confirmedIndex) {
        queue = q;
        set({ pendingConfirm: { sql: item.text, reason: c.reason } });
        return;
      }
      if (!(await execute(q, item, c.kind))) return;
      q.index += 1;
    }
  }

  // Nothing else may start while a statement runs, a file opens, or a confirmation is up.
  function idle(): boolean {
    const s = get();
    return !s.running && !s.opening && !s.pendingConfirm && !s.pendingPrompt;
  }

  function canRun(): boolean {
    return !!get().connection && idle();
  }

  // Opens a file after any discard prompt; `note` (the ignored files of a drop) is said only once
  // the open goes ahead.
  async function requestOpen(file: File, handle: FileSystemFileHandle | undefined, note: string | null): Promise<void> {
    if (!idle()) return;
    const s = get();
    const proceed = async () => {
      if (note) say(note);
      await openBytes(file, handle);
    };
    if (s.dirty && s.connection) {
      ask(
        {
          title: 'Discard unsaved changes?',
          message: `Opening ${file.name} discards the unsaved changes in ${s.connection.name}.`,
          confirmLabel: 'Discard changes',
        },
        proceed,
      );
      return;
    }
    await proceed();
  }

  // A connect failure that says something about the helper updates the install card's state.
  function noteHelperError(err: SqlError): void {
    if (err.code === 'helper-missing') set({ helper: { state: err.detail === 'no-permission' ? 'no-permission' : 'missing' } });
    if (err.code === 'helper-outdated') set({ helper: { ...get().helper, state: 'outdated' } });
  }

  async function reloadProfiles(): Promise<void> {
    try {
      set({ profiles: await remoteClient().profiles.list() });
    } catch {
      // The list stays as it was; the next refresh retries.
    }
  }

  // Opens a session for a profile. On failure it reports and returns null: a missing password
  // opens the password prompt, a missing or outdated helper is recorded for the install card.
  async function openSession(
    profileId: string,
    name: string,
    readOnly: boolean,
    password?: string,
    remember?: boolean,
  ): Promise<RemoteSession | null> {
    try {
      const session = await remoteClient().connect(profileId, readOnly, password, remember);
      set({ helper: { ...get().helper, state: 'ready' } });
      return session;
    } catch (raw) {
      const err = normalizeSqlError(raw);
      if (err.detail === 'password-required') {
        passwordMode = readOnly;
        set({ pendingPassword: { profileId, name } });
        return null;
      }
      noteHelperError(err);
      set({ error: err, errorAt: null, bottomTab: 'messages' });
      say(err.message);
      return null;
    }
  }

  // A new session for the open remote connection (Reconnect, or the Read-only switch). The old
  // session stays until the new one is up, so a failed attempt changes nothing.
  async function reconnectRemote(conn: Extract<SqlConnection, { kind: 'remote' }>, readOnly: boolean): Promise<void> {
    const session = await openSession(conn.profileId, conn.name, readOnly);
    if (!session) return;
    closeRemote();
    remote = session;
    set({
      connection: { ...conn, readOnly, serverVersion: session.serverVersion },
      readOnlyChoice: readOnly,
      connectionLost: false,
      canFetchMore: false,
      error: null,
    });
    say(readOnly ? `${conn.name} is read-only.` : `${conn.name} is open for writing. Statements commit as they run.`);
    await refreshSchema();
  }

  async function connectNow(profileId: string, opts: { password?: string; remember?: boolean } | undefined, retry: boolean): Promise<void> {
    await loadSqlStorage();
    const mode = retry ? passwordMode : null;
    passwordMode = null;
    set({ opening: true, error: null, errorAt: null });
    try {
      let profiles: PageProfile[];
      try {
        profiles = await remoteClient().profiles.list();
      } catch (raw) {
        const err = normalizeSqlError(raw);
        set({ error: err, bottomTab: 'messages' });
        say(err.message);
        return;
      }
      set({ profiles });
      const profile = profiles.find((p) => p.id === profileId);
      if (!profile) {
        say('That connection no longer exists.');
        return;
      }
      const readOnly = mode ?? profile.readOnly;
      const session = await openSession(profile.id, profile.name, readOnly, opts?.password, opts?.remember);
      if (!session) return;
      flushSqlPersistence();
      const prev = get().connection;
      closeRemote();
      remote = session;
      if (prev?.kind === 'sqlite') {
        // The file's unsaved changes were discarded at the prompt; free the worker.
        bytes = null;
        fileHandle = null;
        diskBehind = false;
        void sqlClient()
          .close()
          .catch(() => undefined);
      }
      const key = connectionKeyForProfile(profile.id);
      // Same rule as a file: a scratch query typed before the first connection carries over.
      const sameKey = prev?.key === key;
      const tabs = sameKey ? get().tabs : storedTabs[key] || prev ? restoreEditorTabs(storedTabs, key) : get().tabs;
      let schema: SchemaTree | null = null;
      let schemaError: SqlError | null = null;
      try {
        schema = await session.introspect();
      } catch (raw) {
        schemaError = normalizeSqlError(raw);
      }
      resultTabId = null;
      set({
        connection: {
          kind: 'remote',
          profileId: profile.id,
          name: profile.name,
          engine: profile.engine,
          host: profile.host,
          database: profile.database,
          readOnly,
          key,
          serverVersion: session.serverVersion,
        },
        readOnlyChoice: readOnly,
        schema,
        tabs,
        activeTabId: sameKey ? get().activeTabId : tabs[0].id,
        result: null,
        resultTable: null,
        error: null,
        errorAt: null,
        dirty: false,
        connectionLost: schemaError?.code === 'connection-lost',
        canFetchMore: false,
        history: storedHistory[key] ?? [],
        bottomTab: 'results',
        messages: withMessage(
          get().messages,
          `Connected to ${profile.name}${readOnly ? ' (read-only)' : ''}.`,
          ...(schemaError ? [schemaError.message] : []),
        ),
      });
      persistTabs();
    } finally {
      set({ opening: false });
    }
  }

  return {
    connection: null,
    schema: null,
    tabs: initialTabs,
    activeTabId: initialTabs[0].id,
    running: null,
    result: null,
    error: null,
    messages: [],
    history: [],
    pendingConfirm: null,
    dirty: false,
    opening: false,
    readOnlyChoice: true,
    errorAt: null,
    resultTable: null,
    bottomTab: 'results',
    pendingPrompt: null,
    layout: storedLayout,
    cursor: { line: 1, col: 1 },
    gridView: { key: '', sort: null, inspected: null },
    rowFilter: '',
    profiles: [],
    helper: { state: 'unknown' },
    pendingPassword: null,
    connectionLost: false,
    canFetchMore: false,

    async openFile(file, handle) {
      await requestOpen(file, handle, null);
    },

    async openDropped(files) {
      const { file, ignored } = pickDroppedFile(files);
      if (!file) return;
      await requestOpen(file, undefined, ignoredFilesMessage(file.name, ignored));
    },

    async run(mode) {
      if (!canRun()) return;
      const s = get();
      const tab = s.tabs.find((t) => t.id === s.activeTabId);
      if (!tab) return;
      const doc = tab.sql;
      const dialect = connectionDialect(s.connection);
      let items: RunItem[] = [];
      if (mode === 'all') {
        items = splitStatements(doc, dialect).map((st) => ({ text: st.text, from: st.from }));
      } else {
        const sel = selectionReader?.() ?? { from: doc.length, to: doc.length, head: doc.length };
        const from = Math.max(0, Math.min(sel.from, doc.length));
        const to = Math.max(from, Math.min(sel.to, doc.length));
        if (to > from && doc.slice(from, to).trim()) {
          items = [{ text: doc.slice(from, to), from }];
        } else {
          const st = statementAt(doc, Math.min(sel.head, doc.length), dialect);
          if (st) items = [{ text: st.text, from: st.from }];
        }
      }
      if (!items.length) {
        say('Nothing to run.');
        return;
      }
      await drain({ tabId: tab.id, items, index: 0, maxRows: tab.maxRows, resultTable: null }, -1);
    },

    stop() {
      const running = get().running;
      if (!running) return;
      // Only worker-held changes are lost: after a failed disk write the restart keeps the export.
      // A remote query holds nothing in the page, so it stops without asking.
      if (get().connection?.kind === 'sqlite' && sqlClient().dirty) {
        ask(
          {
            title: 'Stop the query?',
            message: 'Stopping restarts the database and loses unsaved changes.',
            confirmLabel: 'Stop anyway',
          },
          () => get().running?.controller.abort(),
        );
        return;
      }
      running.controller.abort();
    },

    async confirmPending() {
      const q = queue;
      set({ pendingConfirm: null });
      if (!q) return;
      await drain(q, q.index);
    },

    cancelPending() {
      queue = null;
      set({ pendingConfirm: null });
      say('Statement not run.');
    },

    async confirmPrompt() {
      const action = promptAction;
      promptAction = null;
      set({ pendingPrompt: null });
      await action?.();
    },

    cancelPrompt() {
      promptAction = null;
      set({ pendingPrompt: null });
    },

    async previewTable(schemaName, table) {
      if (!canRun()) return;
      const sql = selectTableSql(schemaName, table, connectionDialect(get().connection));
      const existing = get().tabs.find((t) => t.title === table && t.sql === sql);
      const tab = existing ?? { id: newTabId(), title: table, sql, maxRows: DEFAULT_MAX_ROWS };
      set({ tabs: existing ? get().tabs : [...get().tabs, tab], activeTabId: tab.id });
      persistTabs();
      await drain({ tabId: tab.id, items: [{ text: sql, from: 0 }], index: 0, maxRows: tab.maxRows, resultTable: table }, -1);
    },

    async setReadOnly(on) {
      const s = get();
      if (!s.connection) {
        set({ readOnlyChoice: on });
        return;
      }
      if (on === s.connection.readOnly || s.running || s.opening) return;
      if (s.connection.kind === 'remote') {
        // Nothing is held in memory, so the switch reconnects in the new mode without a prompt.
        const conn = s.connection;
        set({ readOnlyChoice: on, opening: true });
        try {
          await reconnectRemote(conn, on);
        } finally {
          set({ opening: false, readOnlyChoice: get().connection?.readOnly ?? true });
        }
        return;
      }
      if (on && (s.dirty || unsaved())) {
        ask(
          {
            title: 'Discard unsaved changes?',
            message: `Turning Read-only back on reopens ${s.connection.name} as last opened or saved. Unsaved changes are lost.`,
            confirmLabel: 'Discard changes',
          },
          async () => {
            set({ readOnlyChoice: true, opening: true });
            try {
              await reopenAs(true);
            } finally {
              set({ opening: false, readOnlyChoice: get().connection?.readOnly ?? true });
            }
          },
        );
        return;
      }
      // The checkbox follows the choice at once; reopenAs settles it (or reverts it on failure).
      set({ readOnlyChoice: on, opening: true });
      try {
        await reopenAs(on);
      } finally {
        set({ opening: false, readOnlyChoice: get().connection?.readOnly ?? true });
      }
    },

    async save() {
      const s = get();
      const conn = s.connection;
      if (!conn || conn.kind !== 'sqlite' || !s.dirty || s.running) return;
      let out: Uint8Array;
      try {
        out = await sqlClient().exportBytes();
      } catch (raw) {
        const err = friendly(normalizeSqlError(raw));
        set({ error: err, bottomTab: 'messages' });
        say(`Could not save ${conn.name}: ${err.message}`);
        return;
      }
      try {
        if (fileHandle && typeof fileHandle.createWritable === 'function') {
          const writable = await fileHandle.createWritable();
          await writable.write(out as Uint8Array<ArrayBuffer>);
          await writable.close();
          say(`Saved ${conn.name}.`);
          bytes = out;
          diskBehind = false;
          set({ dirty: unsaved() });
        } else {
          downloadBytes(out, conn.name);
          say('Download started — the file is saved when the download completes.');
          // Nothing reports whether the download finished or was cancelled, so the changes still
          // count as unsaved until a later save; a re-open starts from these bytes.
          bytes = out;
          diskBehind = true;
          set({ dirty: true });
        }
      } catch (raw) {
        // The export succeeded, so nothing is lost in memory; the file on disk is still behind.
        const message = raw instanceof Error ? raw.message : String(raw);
        diskBehind = true;
        set({ dirty: true, bottomTab: 'messages' });
        say(`Could not save ${conn.name}: ${message}`);
      }
    },

    setMaxRows(n) {
      const id = get().activeTabId;
      const maxRows = clampMaxRows(n);
      set({ tabs: get().tabs.map((t) => (t.id === id ? { ...t, maxRows } : t)) });
      persistTabs();
    },

    addTab() {
      const tab = blankTab(get().tabs.length + 1);
      set({ tabs: [...get().tabs, tab], activeTabId: tab.id });
      persistTabs();
    },

    closeTab(id) {
      const s = get();
      if (s.running?.tabId === id) return;
      const index = s.tabs.findIndex((t) => t.id === id);
      if (index < 0) return;
      let tabs = s.tabs.filter((t) => t.id !== id);
      if (!tabs.length) tabs = [blankTab(1)];
      const activeTabId = s.activeTabId === id ? tabs[Math.min(index, tabs.length - 1)].id : s.activeTabId;
      set({
        tabs,
        activeTabId,
        errorAt: s.errorAt?.tabId === id ? null : s.errorAt,
        ...(id === resultTabId ? { canFetchMore: false } : {}),
      });
      persistTabs();
    },

    setActiveTab(id) {
      if (get().tabs.some((t) => t.id === id)) set({ activeTabId: id });
    },

    updateTabSql(id, sql) {
      const s = get();
      const tab = s.tabs.find((t) => t.id === id);
      if (!tab || tab.sql === sql) return;
      set({
        tabs: s.tabs.map((t) => (t.id === id ? { ...t, sql } : t)),
        errorAt: s.errorAt?.tabId === id ? null : s.errorAt,
      });
      persistTabs();
    },

    setBottomTab(tab) {
      set({ bottomTab: tab });
    },

    setLayout(patch) {
      const layout = restoreLayout({ ...get().layout, ...patch });
      const now = get().layout;
      if (layout.editorPct === now.editorPct && layout.railPx === now.railPx) return;
      storedLayout = layout;
      set({ layout });
      writeLater(SQL_LAYOUT_KEY, () => storedLayout);
    },

    setGridView(gridView) {
      set({ gridView });
    },

    setRowFilter(rowFilter) {
      set({ rowFilter });
    },

    setCursor(line, col) {
      const now = get().cursor;
      if (now.line !== line || now.col !== col) set({ cursor: { line, col } });
    },

    async connectProfile(profileId, opts) {
      const s = get();
      // The answer to the password prompt: the discard prompt (if any) was already passed.
      const retry = s.pendingPassword?.profileId === profileId;
      if (!idle()) {
        // The prompt stays open, so the typed password can be sent once the store is free.
        if (s.pendingPassword) say('Wait for the current query to finish.');
        return;
      }
      if (s.pendingPassword) set({ pendingPassword: null });
      if (!retry) passwordMode = null;
      const proceed = () => connectNow(profileId, opts, retry);
      if (!retry && s.connection?.kind === 'sqlite' && s.dirty) {
        ask(
          {
            title: 'Discard unsaved changes?',
            message: `Connecting discards the unsaved changes in ${s.connection.name}.`,
            confirmLabel: 'Discard changes',
          },
          proceed,
        );
        return;
      }
      await proceed();
    },

    cancelPassword() {
      passwordMode = null;
      set({ pendingPassword: null });
    },

    async reconnect() {
      const conn = get().connection;
      if (conn?.kind !== 'remote' || !idle()) return;
      set({ opening: true });
      try {
        await reconnectRemote(conn, conn.readOnly);
      } finally {
        set({ opening: false });
      }
    },

    async fetchMore() {
      const s = get();
      const session = remote;
      const prev = s.result;
      if (s.connection?.kind !== 'remote' || !session || !prev || !s.canFetchMore || s.connectionLost || !idle()) return;
      // The cursor belongs to the tab that ran the statement.
      if (s.activeTabId !== resultTabId) {
        say('Fetch more works from the tab that ran this query.');
        return;
      }
      const tabId = s.activeTabId;
      const controller = new AbortController();
      set({ running: { tabId, controller }, error: null, errorAt: null });
      try {
        const more = await session.fetchMore(tabId, FETCH_MORE_ROWS, controller.signal);
        const result: QueryResult = {
          ...prev,
          rows: [...prev.rows, ...more.rows],
          rowCount: prev.rowCount + more.rowCount,
          hasMore: more.hasMore,
          truncatedCells: prev.truncatedCells + more.truncatedCells,
        };
        const extra = [...more.notices];
        if (more.truncatedCells > 0) extra.push(`${more.truncatedCells} long text values were cut for display.`);
        // Appended rows keep every existing row index, so the sort, filter and inspected cell stay.
        set({
          running: null,
          result,
          canFetchMore: result.hasMore && session.capabilities.cursor,
          bottomTab: 'results',
          messages: withMessage(get().messages, `Fetched ${more.rowCount} more rows · ${formatMs(more.durationMs)}`, ...extra),
        });
      } catch (raw) {
        let err = normalizeSqlError(raw);
        const lost = err.code === 'connection-lost';
        // Same reading as a stopped execute: the rows already shown stay.
        if (controller.signal.aborted && (err.code === 'cancelled' || lost)) err = { ...QUERY_CANCELLED };
        set({
          running: null,
          error: err,
          canFetchMore: false,
          ...(lost ? { connectionLost: true } : {}),
          bottomTab: 'messages',
          messages: withMessage(get().messages, err.message),
        });
      }
    },

    async refreshRemote() {
      const api = remoteClient();
      const [profiles, helper] = await Promise.allSettled([api.profiles.list(), api.helperStatus()]);
      if (profiles.status === 'fulfilled') set({ profiles: profiles.value });
      if (helper.status === 'fulfilled') set({ helper: helper.value });
      else if (normalizeSqlError(helper.reason).code === 'helper-missing') set({ helper: { state: 'missing' } });
    },

    async saveProfile(input) {
      let saved: PageProfile;
      try {
        saved = await remoteClient().profiles.save(input);
      } catch (raw) {
        throw normalizeSqlError(raw);
      }
      await reloadProfiles();
      return saved;
    },

    async deleteProfile(profileId) {
      try {
        await remoteClient().profiles.delete(profileId);
      } catch (raw) {
        throw normalizeSqlError(raw);
      }
      set({ profiles: get().profiles.filter((p) => p.id !== profileId) });
      await reloadProfiles();
    },

    async testProfile(input) {
      const api = remoteClient();
      const throwaway = !(input.id && !input.password);
      let id: string;
      try {
        id = throwaway
          ? (await api.profiles.save({ ...input, id: undefined, savePassword: false })).id
          : (await get().saveProfile(input)).id;
      } catch (raw) {
        throw normalizeSqlError(raw);
      }
      try {
        const session = await api.connect(id, input.readOnly);
        set({ helper: { ...get().helper, state: 'ready' } });
        await session.close().catch(() => undefined);
        return session.serverVersion;
      } catch (raw) {
        const err = normalizeSqlError(raw);
        noteHelperError(err);
        throw err;
      } finally {
        if (throwaway) await api.profiles.delete(id).catch(() => undefined);
      }
    },
  };
});

function downloadBytes(data: Uint8Array, name: string): void {
  const url = URL.createObjectURL(new Blob([data as Uint8Array<ArrayBuffer>], { type: 'application/vnd.sqlite3' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
