// SQLite engine over the sqlite-wasm module: open a database file from bytes, introspect it,
// run statements with a row cap and enforced read-only, and export the bytes back.
// The sqlite3 module is injected so the SQL worker and the Node tests share this code.
// Pure logic over the injected module; keep React and the extension runtime out of this file.

import { classifyStatement } from './sqlClassify';
import { normalizeSqlError } from './sqlErrors';
import { splitStatements } from './sqlStatements';
import { toCell } from './sqlValues';
import type {
  ColumnNode,
  DriverCapabilities,
  ExecuteOptions,
  QueryResult,
  ResultColumn,
  SchemaTree,
  SqlCell,
  SqlError,
  TableNode,
} from './sqlTypes';

export const SQLITE_CAPABILITIES: DriverCapabilities = {
  readOnlyEnforced: true,
  cancel: true,
  transactions: true,
  cursor: false,
  multiStatement: true,
};

export const MAX_TEXT_CELL = 1048576;

export interface SqliteEngine {
  open(bytes: Uint8Array, readOnly: boolean): void;
  introspect(): SchemaTree;
  execute(sql: string, opts: ExecuteOptions): QueryResult;
  exportBytes(): Uint8Array;
  close(): void;
}

// The slice of the sqlite-wasm API this engine uses. Statements are stepped and read through the
// C API rather than oo1 Stmt.step(), which logs every failing step to the console before throwing.
interface Stmt {
  pointer: number | undefined;
  columnCount: number;
  bind(values: unknown[]): Stmt;
  getColumnName(index: number): string;
  finalize(): void;
}

interface Db {
  pointer: number | undefined;
  exec(sql: string): void;
  prepare(sql: string): Stmt;
  close(): void;
}

interface Sqlite3 {
  oo1: { DB: new (filename: string) => Db };
  wasm: { allocFromTypedArray(bytes: Uint8Array): number; heap8u(): Uint8Array };
  capi: {
    SQLITE_ROW: number;
    SQLITE_DONE: number;
    SQLITE_INTEGER: number;
    SQLITE_FLOAT: number;
    SQLITE_TEXT: number;
    SQLITE_BLOB: number;
    SQLITE_DESERIALIZE_FREEONCLOSE: number;
    SQLITE_DESERIALIZE_RESIZEABLE: number;
    SQLITE_DESERIALIZE_READONLY: number;
    sqlite3_deserialize(db: number, schema: string, data: number, size: number, bufSize: number, flags: number): number;
    sqlite3_js_db_export(db: Db): Uint8Array;
    sqlite3_step(stmt: number): number;
    sqlite3_column_type(stmt: number, index: number): number;
    sqlite3_column_int64(stmt: number, index: number): bigint;
    sqlite3_column_double(stmt: number, index: number): number;
    sqlite3_column_text(stmt: number, index: number): string;
    sqlite3_column_blob(stmt: number, index: number): number;
    sqlite3_column_bytes(stmt: number, index: number): number;
    sqlite3_column_decltype(stmt: number, index: number): string | null;
    sqlite3_changes(db: number): number;
    sqlite3_errmsg(db: number): string;
    sqlite3_errstr(rc: number): string;
    sqlite3_js_rc_str(rc: number): string;
  };
}

function readOnlyError(): SqlError {
  return { code: 'read-only', message: 'This connection is read-only. Turn off Read-only to run this statement.' };
}

export function createSqliteEngine(module: unknown): SqliteEngine {
  const sqlite3 = module as Sqlite3;
  const { capi } = sqlite3;
  let db: Db | null = null;
  let readOnly = true;

  function current(): Db {
    if (!db) throw { code: 'connection-lost', message: 'No database is open.' } satisfies SqlError;
    return db;
  }

  function step(handle: Db, stmt: Stmt): boolean {
    const rc = capi.sqlite3_step(stmt.pointer as number);
    if (rc === capi.SQLITE_ROW) return true;
    if (rc === capi.SQLITE_DONE) return false;
    throw new Error(`${capi.sqlite3_js_rc_str(rc)}: ${capi.sqlite3_errmsg(handle.pointer as number)}`);
  }

  // Integers beyond the safe range stay BigInt so toCell keeps every digit; an empty blob stays a blob.
  function column(stmt: Stmt, i: number): unknown {
    const p = stmt.pointer as number;
    switch (capi.sqlite3_column_type(p, i)) {
      case capi.SQLITE_INTEGER: {
        const v = capi.sqlite3_column_int64(p, i);
        return v >= Number.MIN_SAFE_INTEGER && v <= Number.MAX_SAFE_INTEGER ? Number(v) : v;
      }
      case capi.SQLITE_FLOAT:
        return capi.sqlite3_column_double(p, i);
      case capi.SQLITE_TEXT:
        return capi.sqlite3_column_text(p, i);
      case capi.SQLITE_BLOB: {
        const n = capi.sqlite3_column_bytes(p, i);
        const at = capi.sqlite3_column_blob(p, i);
        return n ? sqlite3.wasm.heap8u().slice(at, at + n) : new Uint8Array(0);
      }
      default:
        return null;
    }
  }

  function rows(sql: string, params: unknown[]): unknown[][] {
    const handle = current();
    const stmt = handle.prepare(sql);
    try {
      if (params.length) stmt.bind(params);
      const out: unknown[][] = [];
      while (step(handle, stmt)) {
        const row: unknown[] = [];
        for (let i = 0; i < stmt.columnCount; i++) row.push(column(stmt, i));
        out.push(row);
      }
      return out;
    } finally {
      stmt.finalize();
    }
  }

  function close(): void {
    if (db) db.close();
    db = null;
  }

  function open(bytes: Uint8Array, ro: boolean): void {
    close();
    const next = new sqlite3.oo1.DB(':memory:');
    try {
      let flags = capi.SQLITE_DESERIALIZE_FREEONCLOSE | capi.SQLITE_DESERIALIZE_RESIZEABLE;
      if (ro) flags |= capi.SQLITE_DESERIALIZE_READONLY;
      // sqlite3_deserialize takes ownership of the buffer (FREEONCLOSE), even when it fails.
      const data = sqlite3.wasm.allocFromTypedArray(bytes);
      const rc = capi.sqlite3_deserialize(next.pointer as number, 'main', data, bytes.length, bytes.length, flags);
      if (rc !== 0) throw new Error(capi.sqlite3_errstr(rc));
      try {
        const probe = next.prepare('PRAGMA schema_version');
        try {
          step(next, probe);
        } finally {
          probe.finalize();
        }
      } catch (err) {
        const e = normalizeSqlError(err);
        throw e.code === 'not-a-database' ? e : ({ code: 'not-a-database', message: e.message } satisfies SqlError);
      }
      if (ro) next.exec('PRAGMA query_only = 1');
    } catch (err) {
      next.close();
      throw normalizeSqlError(err);
    }
    db = next;
    readOnly = ro;
  }

  function columnsOf(name: string): ColumnNode[] {
    return rows('select name, type, "notnull", dflt_value, pk from pragma_table_info(?)', [name]).map((r) => ({
      name: String(r[0]),
      type: String(r[1] ?? ''),
      nullable: Number(r[2]) === 0,
      defaultValue: r[3] === null || r[3] === undefined ? null : String(r[3]),
      pk: Number(r[4]) > 0,
    }));
  }

  function introspect(): SchemaTree {
    try {
      const tables: TableNode[] = [];
      const views: TableNode[] = [];
      const objects = rows(
        "select name, type from sqlite_schema where type in ('table', 'view') and name not like 'sqlite\\_%' escape '\\' order by name",
        [],
      );
      for (const [name, type] of objects) {
        const n = String(name);
        if (type === 'view') {
          views.push({ name: n, columns: columnsOf(n), indexes: [] });
        } else {
          const indexes = rows('select name from pragma_index_list(?)', [n]).map((r) => String(r[0]));
          tables.push({ name: n, columns: columnsOf(n), indexes });
        }
      }
      return { schemas: [{ name: 'main', tables, views }] };
    } catch (err) {
      throw normalizeSqlError(err);
    }
  }

  function execute(sql: string, opts: ExecuteOptions): QueryResult {
    const started = performance.now();
    const handle = current();
    const statements = splitStatements(sql, 'sqlite').filter((s) => s.text.trim() !== '');
    const classes = statements.map((s) => classifyStatement(s.text, 'sqlite'));
    const kinds = classes.map((c) => c.kind);
    // Refuse the whole script before anything runs, so a read-only script never half-applies.
    // Input the parser cannot read goes to SQLite (Ruling R10): the database itself is read-only
    // (DESERIALIZE_READONLY and query_only), so a write still fails, and a typo gets its real syntax error.
    const refused = (c: { kind: string; reason: string }) => c.kind !== 'read' && c.reason !== 'could not parse';
    if (readOnly && classes.some(refused)) throw readOnlyError();

    let result: QueryResult = {
      columns: [],
      rows: [],
      rowCount: 0,
      affected: null,
      durationMs: 0,
      notices: [],
      hasMore: false,
      truncatedCells: 0,
    };
    statements.forEach((statement, index) => {
      let stmt: Stmt | null = null;
      try {
        stmt = handle.prepare(statement.text);
        const columns: ResultColumn[] = [];
        for (let i = 0; i < stmt.columnCount; i++) {
          columns.push({
            name: stmt.getColumnName(i),
            type: capi.sqlite3_column_decltype(stmt.pointer as number, i) ?? '',
          });
        }
        const out: SqlCell[][] = [];
        let truncatedCells = 0;
        let hasMore = false;
        while (step(handle, stmt)) {
          if (out.length >= opts.maxRows) {
            hasMore = true;
            break;
          }
          const row: SqlCell[] = [];
          for (let i = 0; i < columns.length; i++) {
            let raw = column(stmt, i);
            if (typeof raw === 'string' && raw.length > MAX_TEXT_CELL) {
              raw = raw.slice(0, MAX_TEXT_CELL);
              truncatedCells++;
            }
            row.push(toCell(raw));
          }
          out.push(row);
        }
        result = {
          columns,
          rows: out,
          rowCount: out.length,
          affected: kinds[index] === 'read' ? null : capi.sqlite3_changes(handle.pointer as number),
          durationMs: 0,
          notices: [],
          hasMore,
          truncatedCells,
        };
      } catch (err) {
        const e = normalizeSqlError(err, statement.text);
        // The position is within the statement; the editor needs it within the submitted script.
        throw e.position === undefined ? e : { ...e, position: e.position + statement.from };
      } finally {
        stmt?.finalize();
      }
    });
    result.durationMs = performance.now() - started;
    return result;
  }

  function exportBytes(): Uint8Array {
    try {
      return capi.sqlite3_js_db_export(current());
    } catch (err) {
      throw normalizeSqlError(err);
    }
  }

  return { open, introspect, execute, exportBytes, close };
}
