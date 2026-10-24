// Shared types for the SQL client: drivers, schema tree and query results.
// Pure types plus two constants; keep React and the runtime out of this file.

export type SqlDialect = 'postgres' | 'mysql' | 'sqlite';

export interface DriverCapabilities {
  readOnlyEnforced: boolean;
  cancel: boolean;
  transactions: boolean;
  cursor: boolean;
  multiStatement: boolean;
}

export interface ColumnNode {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue: string | null;
  pk: boolean;
}

export interface TableNode {
  name: string;
  columns: ColumnNode[];
  indexes: string[];
}

export interface SchemaNode {
  name: string;
  tables: TableNode[];
  views: TableNode[];
}

export interface SchemaTree {
  schemas: SchemaNode[];
}

export type SqlCell = null | string | number | boolean | { hex: string; length: number };

export interface ResultColumn {
  name: string;
  type: string;
}

export interface QueryResult {
  columns: ResultColumn[];
  rows: SqlCell[][];
  rowCount: number;
  affected: number | null;
  durationMs: number;
  notices: string[];
  hasMore: boolean;
  truncatedCells: number;
  // Remote only: the tab's connection is inside a transaction the user opened. Closing the session
  // (or the tab) rolls it back.
  inTransaction?: boolean;
}

export type SqlErrorCode =
  | 'helper-missing'
  | 'helper-outdated'
  | 'auth-failed'
  | 'tls-failed'
  | 'network'
  | 'timeout'
  | 'cancelled'
  | 'read-only'
  | 'syntax'
  | 'server'
  | 'connection-lost'
  | 'limit-reached'
  | 'not-a-database';

export interface SqlError {
  code: SqlErrorCode;
  message: string;
  sqlState?: string;
  position?: number;
  hint?: string;
  detail?: string;
  // Remote execute/fetchMore errors: whether the tab is still inside the user's transaction.
  inTransaction?: boolean;
}

export interface ExecuteOptions {
  maxRows: number;
  // Which result tab the statement belongs to; remote drivers keep one cursor per tab.
  tabId?: string;
}

export interface SqlDriver {
  dialect: SqlDialect;
  capabilities: DriverCapabilities;
  introspect(): Promise<SchemaTree>;
  execute(sql: string, opts: ExecuteOptions, signal?: AbortSignal): Promise<QueryResult>;
  close(): Promise<void>;
}

export const DEFAULT_MAX_ROWS = 1000;
export const MAX_MAX_ROWS = 50000;
