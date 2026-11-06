// Pure persistence shapes for SQL history and editor tabs. History never stores rows.
// Both records share chrome.storage.local's quota with session persistence, so what is kept is
// bounded: SQL text per item and per tab, items per connection, and connections (least recently
// used go first). Several SQL pages may write at once; mergeSqlStorage folds one page's changes
// into what another page stored, per connection key.
import { parseJson, toValue } from './jsonText';
import { clampMaxRows } from './sqlValues';
import { DEFAULT_MAX_ROWS } from './sqlTypes';

export const HISTORY_KEY = 'sql_history';
export const EDITOR_TABS_KEY = 'sql_editor_tabs';
/** When each connection key was last used: the LRU order for pruning both records. */
export const CONNECTION_KEYS_KEY = 'sql_connection_keys';
export const HISTORY_LIMIT = 200;
/** The most SQL text one history item keeps, its marker included. */
export const HISTORY_SQL_LIMIT = 10_000;
/** The most SQL text one stored editor tab keeps (the open editor itself is never cut). */
export const TAB_SQL_LIMIT = 200_000;
/** The most connection keys kept across history, tabs and usage. */
export const CONNECTION_KEY_LIMIT = 50;
/** The most editor tabs one connection keeps open (and stored). */
export const EDITOR_TAB_LIMIT = 20;
/**
 * The most UTF-8 bytes of serialized JSON the three SQL records may take together. chrome.storage.local
 * holds 10 MB (no unlimitedStorage) and session persistence needs the rest.
 */
export const SQL_STORAGE_BUDGET = 4_000_000;
/** The budget a write is pruned to after the storage reported a full quota. */
export const SQL_STORAGE_QUOTA_BUDGET = 2_000_000;
export const SQL_STORAGE_FULL_NOTICE = 'SQL history storage is full; older history was not saved.';

// Cuts before a lone high surrogate would be left at the end.
function cutAt(text: string, n: number): string {
  const end = n > 0 && /[\uD800-\uDBFF]/.test(text[n - 1]) ? n - 1 : n;
  return text.slice(0, end);
}

/** An SQL comment, so "Load into the editor" puts back text that still reads as SQL. */
export function historyCutMarker(dropped: number): string {
  return `\n-- XRAY kept the first part of this statement in history; ${dropped} characters were cut.`;
}

/** SQL as a history item stores it: at most HISTORY_SQL_LIMIT characters, marked when cut. */
export function capHistorySql(sql: string): string {
  if (sql.length <= HISTORY_SQL_LIMIT) return sql;
  // The marker's own length depends on the count; two passes settle it.
  let keep = HISTORY_SQL_LIMIT - historyCutMarker(sql.length).length;
  keep = HISTORY_SQL_LIMIT - historyCutMarker(sql.length - keep).length;
  const head = cutAt(sql, keep);
  return head + historyCutMarker(sql.length - head.length);
}

/** Editor text as stored: cut at TAB_SQL_LIMIT characters. */
export function capTabSql(sql: string): string {
  return sql.length <= TAB_SQL_LIMIT ? sql : cutAt(sql, TAB_SQL_LIMIT);
}

export interface HistoryItem {
  sql: string;
  at: number;
  durationMs: number;
  rowCount: number | null;
  ok: boolean;
  error?: string;
}

export function appendHistory(
  all: Record<string, HistoryItem[]>,
  connectionKey: string,
  item: HistoryItem,
): Record<string, HistoryItem[]> {
  const capped = { ...item, sql: capHistorySql(item.sql) };
  const current = all[connectionKey] ?? [];
  const rest = current[0] && current[0].sql === capped.sql ? current.slice(1) : current;
  return { ...all, [connectionKey]: [capped, ...rest].slice(0, HISTORY_LIMIT) };
}

// An item needs its SQL and its time; the rest is display detail, filled in when missing (a
// duration stored as null, say), so restoring never drops a statement the user ran.
function restoreItem(raw: unknown): HistoryItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const i = raw as Record<string, unknown>;
  if (typeof i.sql !== 'string' || typeof i.at !== 'number' || !Number.isFinite(i.at)) return null;
  const kept: HistoryItem = {
    sql: capHistorySql(i.sql),
    at: i.at,
    durationMs: typeof i.durationMs === 'number' && Number.isFinite(i.durationMs) ? i.durationMs : 0,
    rowCount: typeof i.rowCount === 'number' && Number.isFinite(i.rowCount) ? i.rowCount : null,
    ok: i.ok !== false,
  };
  if (typeof i.error === 'string') kept.error = i.error;
  return kept;
}

/** The stored `sql_history` value as a valid record: items with SQL and a time, SQL capped, newest first. */
export function restoreHistory(raw: unknown): Record<string, HistoryItem[]> {
  const out: Record<string, HistoryItem[]> = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  for (const [key, list] of Object.entries(raw as Record<string, unknown>)) {
    if (!Array.isArray(list)) continue;
    const items = list.map(restoreItem).filter((item): item is HistoryItem => item !== null);
    if (items.length) out[key] = mergeHistory(items, []);
  }
  return out;
}

/**
 * Two pages' history for one connection as one list: the union (an item is its time and SQL),
 * newest first, a run of the same statement collapsed to its newest (appendHistory's rule), capped.
 */
export function mergeHistory(a: readonly HistoryItem[], b: readonly HistoryItem[]): HistoryItem[] {
  const seen = new Set<string>();
  const all: HistoryItem[] = [];
  for (const item of [...a, ...b]) {
    const id = `${item.at}\u0000${item.sql}`;
    if (seen.has(id)) continue;
    seen.add(id);
    all.push(item);
  }
  all.sort((x, y) => y.at - x.at);
  const out: HistoryItem[] = [];
  for (const item of all) {
    if (out.length && out[out.length - 1].sql === item.sql) continue;
    out.push(item);
    if (out.length === HISTORY_LIMIT) break;
  }
  return out;
}

export interface EditorTab {
  id: string;
  title: string;
  sql: string;
  maxRows: number;
}

let tabCounter = 0;
export function newTabId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  tabCounter += 1;
  return `tab-${Date.now().toString(36)}-${tabCounter}`;
}

// `raw` is the stored `sql_editor_tabs` value: a map of connection key to tabs (a bare array is also accepted).
export function restoreEditorTabs(raw: unknown, connectionKey: string): EditorTab[] {
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object'
      ? (raw as Record<string, unknown>)[connectionKey]
      : undefined;
  const tabs: EditorTab[] = [];
  if (Array.isArray(list)) {
    for (const entry of list) {
      if (!entry || typeof entry !== 'object' || typeof (entry as { sql?: unknown }).sql !== 'string') continue;
      const e = entry as { id?: unknown; title?: unknown; sql: string; maxRows?: unknown };
      tabs.push({
        id: typeof e.id === 'string' && e.id ? e.id : newTabId(),
        title: typeof e.title === 'string' && e.title ? e.title : `Query ${tabs.length + 1}`,
        sql: capTabSql(e.sql),
        maxRows: typeof e.maxRows === 'number' ? clampMaxRows(e.maxRows) : DEFAULT_MAX_ROWS,
      });
    }
  }
  if (!tabs.length) return [{ id: newTabId(), title: 'Query 1', sql: '', maxRows: DEFAULT_MAX_ROWS }];
  return tabs.slice(0, EDITOR_TAB_LIMIT);
}

/** Tabs as a stored record keeps them: at most EDITOR_TAB_LIMIT, SQL capped at TAB_SQL_LIMIT. */
export function tabsForStorage(tabs: readonly EditorTab[]): EditorTab[] {
  return tabs.slice(0, EDITOR_TAB_LIMIT).map((tab) => (tab.sql.length > TAB_SQL_LIMIT ? { ...tab, sql: capTabSql(tab.sql) } : tab));
}

/**
 * A SQLite file's key, the same across saves: the file name plus the stable id kept with its file
 * handle (runtime/recentFiles.ts), or the name alone for a file opened without a handle. The
 * prefixes differ from the old `sqlite:<name>:<size>` keys, so no file name can collide with one.
 * Accepted (M6): files opened without a handle that share a name share history and tabs, and so do
 * same-name files migrated from old keys.
 */
export function connectionKeyForFile(name: string, id?: string | null): string {
  return id ? `sqlite-id:${id}:${name}` : `sqlite-name:${name}`;
}

/** The key the SQL client used before #18: it changed with every save, as the size did. */
export function legacyConnectionKeyForFile(name: string, size: number): string {
  return `sqlite:${name}:${size}`;
}

/** The name and size in an old `sqlite:<name>:<size>` key, or null for any other key. */
export function parseLegacyFileKey(key: string): { name: string; size: number } | null {
  if (!key.startsWith('sqlite:')) return null;
  const rest = key.slice('sqlite:'.length);
  const colon = rest.lastIndexOf(':');
  if (colon < 0 || !/^\d+$/.test(rest.slice(colon + 1))) return null;
  return { name: rest.slice(0, colon), size: Number(rest.slice(colon + 1)) };
}

export function connectionKeyForProfile(profileId: string): string {
  return `remote:${profileId}`;
}

/** The three stored records the SQL page keeps, keyed by connection key. */
export interface SqlStorage {
  history: Record<string, HistoryItem[]>;
  tabs: Record<string, EditorTab[]>;
  usage: Record<string, number>;
}

/** What one page changed since it last wrote. */
export interface SqlStorageChanges {
  history: ReadonlySet<string>;
  tabs: ReadonlySet<string>;
  /** Keys this page removed (old keys it migrated). */
  removed: ReadonlySet<string>;
}

/** The stored `sql_connection_keys` value: key to last-use time. */
export function restoreUsage(raw: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  for (const [key, at] of Object.entries(raw as Record<string, unknown>)) if (typeof at === 'number' && Number.isFinite(at)) out[key] = at;
  return out;
}

function without<T>(record: Record<string, T>, keys: Iterable<string>): Record<string, T> {
  const out = { ...record };
  for (const key of keys) delete out[key];
  return out;
}

/** UTF-8 bytes of a string, without encoding it. */
export function utf8Bytes(text: string): number {
  let n = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (c < 0x80) n += 1;
    else if (c < 0x800) n += 2;
    else if (c >= 0xd800 && c <= 0xdbff && i + 1 < text.length) {
      n += 4;
      i++;
    } else n += 3;
  }
  return n;
}

/** The serialized size of one key's share of the three records (its entries, key and separators). */
function keyBytes(storage: SqlStorage, key: string): number {
  let n = 0;
  const entry = (value: unknown) => utf8Bytes(JSON.stringify(key)) + 2 + utf8Bytes(JSON.stringify(value));
  if (storage.history[key]) n += entry(storage.history[key]);
  if (storage.tabs[key]) n += entry(storage.tabs[key]);
  if (key in storage.usage) n += entry(storage.usage[key]);
  return n;
}

/** The UTF-8 bytes of the three records serialized as JSON. */
export function sqlStorageBytes(storage: SqlStorage): number {
  return utf8Bytes(JSON.stringify(storage.history)) + utf8Bytes(JSON.stringify(storage.tabs)) + utf8Bytes(JSON.stringify(storage.usage));
}

export interface PruneOptions {
  /** The most connection keys kept. */
  limit?: number;
  /** The most bytes of serialized JSON kept across the three records. */
  budget?: number;
  /** The open connection's key: never evicted. */
  keep?: string | null;
}

/**
 * Keeps the `limit` most recently used connection keys across all three records, then evicts whole
 * keys, least recently used first, until the records fit `budget`. A key's last use is its usage
 * time, else its newest history item, else never (it goes first). The `keep` key is never evicted;
 * if it alone is over the budget, its oldest history items go instead (its tabs stay).
 */
export function pruneConnectionKeys(storage: SqlStorage, options: PruneOptions = {}): SqlStorage {
  const { limit = CONNECTION_KEY_LIMIT, budget = SQL_STORAGE_BUDGET, keep = null } = options;
  const keys = new Set([...Object.keys(storage.history), ...Object.keys(storage.tabs), ...Object.keys(storage.usage)]);
  const lastUse = (key: string) => storage.usage[key] ?? storage.history[key]?.[0]?.at ?? 0;
  // Least recently used first; the kept key last, so it is never reached.
  const oldestFirst = [...keys].sort((a, b) => (a === keep ? 1 : b === keep ? -1 : lastUse(a) - lastUse(b) || (a < b ? 1 : -1)));
  const dropped = new Set(oldestFirst.slice(0, Math.max(0, keys.size - limit)).filter((k) => k !== keep));
  // 6 bytes: the three records' braces.
  let total = 6;
  for (const key of keys) if (!dropped.has(key)) total += keyBytes(storage, key) + 1;
  for (const key of oldestFirst) {
    if (total <= budget) break;
    if (key === keep || dropped.has(key)) continue;
    dropped.add(key);
    total -= keyBytes(storage, key) + 1;
  }
  if (!dropped.size && total <= budget) return storage;
  const out = { history: without(storage.history, dropped), tabs: without(storage.tabs, dropped), usage: without(storage.usage, dropped) };
  if (total > budget && keep && out.history[keep]) {
    const items = [...out.history[keep]];
    while (items.length && total > budget) {
      total -= utf8Bytes(JSON.stringify(items.pop())) + 1;
    }
    if (items.length) out.history[keep] = items;
    else delete out.history[keep];
  }
  return out;
}

/**
 * Folds one page's changes into what is stored now (re-read under the write lock): history for the
 * keys it changed is merged item by item, its tabs replace the stored tabs for those keys only,
 * last-use times keep the later one, removed keys go, and the result is pruned. Keys the page did
 * not touch keep whatever another page stored.
 */
export function mergeSqlStorage(
  stored: SqlStorage,
  local: SqlStorage,
  changes: SqlStorageChanges,
  prune: PruneOptions = {},
): SqlStorage {
  const history = { ...stored.history };
  for (const key of changes.history) {
    const merged = mergeHistory(stored.history[key] ?? [], local.history[key] ?? []);
    if (merged.length) history[key] = merged;
  }
  const tabs = { ...stored.tabs };
  for (const key of changes.tabs) {
    if (local.tabs[key]) tabs[key] = tabsForStorage(local.tabs[key]);
  }
  const usage = { ...stored.usage };
  for (const [key, at] of Object.entries(local.usage)) usage[key] = Math.max(at, usage[key] ?? 0);
  return pruneConnectionKeys(
    {
      history: without(history, changes.removed),
      tabs: without(tabs, changes.removed),
      usage: without(usage, changes.removed),
    },
    prune,
  );
}

/** localStorage keys of the journals pages write on pagehide (see sqlStore.ts writeSqlJournal). */
export const SQL_JOURNAL_PREFIX = 'xray_sql_journal:';

/** What a page journals on pagehide: its changed keys and their local values. */
export interface SqlJournal {
  storage: SqlStorage;
  changes: { history: string[]; tabs: string[]; removed: string[] };
}

/** The journal for one page's unsaved changes, or null when nothing changed. */
export function journalFor(local: SqlStorage, changes: SqlStorageChanges): SqlJournal | null {
  const history: Record<string, HistoryItem[]> = {};
  const tabs: Record<string, EditorTab[]> = {};
  const usage: Record<string, number> = {};
  for (const key of changes.history) if (local.history[key]) history[key] = local.history[key];
  for (const key of changes.tabs) if (local.tabs[key]) tabs[key] = tabsForStorage(local.tabs[key]);
  for (const key of [...changes.history, ...changes.tabs]) if (key in local.usage) usage[key] = local.usage[key];
  if (!changes.history.size && !changes.tabs.size && !changes.removed.size) return null;
  return {
    storage: { history, tabs, usage },
    changes: { history: [...changes.history], tabs: [...changes.tabs], removed: [...changes.removed] },
  };
}

/** A stored journal (JSON text) as a journal to fold in, or null when it is not one. */
export function parseJournal(text: string | null): { storage: SqlStorage; changes: SqlStorageChanges } | null {
  if (!text) return null;
  const doc = parseJson(text);
  if (!doc.ok) return null;
  const raw = toValue(doc.root);
  if (!raw || typeof raw !== 'object') return null;
  const j = raw as { storage?: { history?: unknown; tabs?: unknown; usage?: unknown }; changes?: Record<string, unknown> };
  const list = (v: unknown) => new Set(Array.isArray(v) ? v.filter((k): k is string => typeof k === 'string') : []);
  const tabs: Record<string, EditorTab[]> = {};
  const rawTabs = j.storage?.tabs;
  if (rawTabs && typeof rawTabs === 'object' && !Array.isArray(rawTabs)) {
    for (const key of Object.keys(rawTabs)) tabs[key] = restoreEditorTabs(rawTabs, key);
  }
  return {
    storage: { history: restoreHistory(j.storage?.history), tabs, usage: restoreUsage(j.storage?.usage) },
    changes: { history: list(j.changes?.history), tabs: list(j.changes?.tabs), removed: list(j.changes?.removed) },
  };
}

/**
 * Moves a file's history and tabs from its old `sqlite:<name>:<size>` keys (one per size it was
 * opened at) to `key`, on its first open under the new scheme. History is merged; the tabs come from
 * the key at the current size, else the one with the newest history. Returns the old keys moved.
 */
export function migrateLegacyFileKeys(
  storage: SqlStorage,
  name: string,
  size: number,
  key: string,
): { storage: SqlStorage; moved: string[] } {
  const all = new Set([...Object.keys(storage.history), ...Object.keys(storage.tabs), ...Object.keys(storage.usage)]);
  const moved = [...all].filter((k) => parseLegacyFileKey(k)?.name === name);
  if (!moved.length) return { storage, moved };
  let items = storage.history[key] ?? [];
  for (const k of moved) items = mergeHistory(items, storage.history[k] ?? []);
  const newest = (k: string) => storage.history[k]?.[0]?.at ?? storage.usage[k] ?? 0;
  const exact = legacyConnectionKeyForFile(name, size);
  const withTabs = moved.filter((k) => storage.tabs[k]);
  const tabsFrom = withTabs.includes(exact) ? exact : withTabs.sort((a, b) => newest(b) - newest(a))[0];
  const usageAt = Math.max(storage.usage[key] ?? 0, ...moved.map((k) => storage.usage[k] ?? 0));
  const history = without(storage.history, moved);
  const tabs = without(storage.tabs, moved);
  const usage = without(storage.usage, moved);
  if (items.length) history[key] = items;
  if (!tabs[key] && tabsFrom) tabs[key] = storage.tabs[tabsFrom];
  if (usageAt > 0) usage[key] = usageAt;
  return { storage: { history, tabs, usage }, moved };
}
