// Pure persistence shapes for SQL history and editor tabs. History never stores rows.
import { clampMaxRows } from './sqlValues';
import { DEFAULT_MAX_ROWS } from './sqlTypes';

export const HISTORY_KEY = 'sql_history';
export const EDITOR_TABS_KEY = 'sql_editor_tabs';
export const HISTORY_LIMIT = 200;

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
  const current = all[connectionKey] ?? [];
  const rest = current[0] && current[0].sql === item.sql ? current.slice(1) : current;
  return { ...all, [connectionKey]: [item, ...rest].slice(0, HISTORY_LIMIT) };
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
        sql: e.sql,
        maxRows: typeof e.maxRows === 'number' ? clampMaxRows(e.maxRows) : DEFAULT_MAX_ROWS,
      });
    }
  }
  if (!tabs.length) return [{ id: newTabId(), title: 'Query 1', sql: '', maxRows: DEFAULT_MAX_ROWS }];
  return tabs;
}

export function connectionKeyForFile(name: string, size: number): string {
  return `sqlite:${name}:${size}`;
}

export function connectionKeyForProfile(profileId: string): string {
  return `remote:${profileId}`;
}
