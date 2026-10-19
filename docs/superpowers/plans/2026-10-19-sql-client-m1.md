# SQL client M1 (client on SQLite) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a working SQL client page (`sql.html`) that opens local SQLite files, browses the schema, runs
queries with a CodeMirror editor, and shows results in a virtualized grid. It is reachable from the DevTools
panel, the pop-out window and the HUD, and read-only and dangerous-statement rules are enforced.

**Architecture:** The pure logic lives in `src/panel/models/sql*.ts` and is unit-tested in Node, including
the SQLite engine against the real WASM:
- statement splitting
- classification
- value formatting
- errors
- schema helpers
- history

`sql.html` loads its own IIFE bundle `dist/sql-ui.js`. That bundle spawns `dist/sql-worker.js`, which hosts
`@sqlite.org/sqlite-wasm`. The panel only gains a tiny SQL tab: an iframe of `sql.html` on extension pages,
and a button that opens a window in the HUD.

**Tech Stack:** React 19, TypeScript, Zustand, `@tanstack/react-virtual`, CodeMirror 6 + `@codemirror/lang-sql`
6.10, `@sqlite.org/sqlite-wasm` 3.54, esbuild IIFE entries, `node --test`, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-19-sql-client-design.md` (sections 1, 2 SQLite part, 3 read-only and
confirmations, 5, 6; milestone M1).

## Global Constraints

- **Run in a fresh worktree from `main` HEAD** (superpowers:using-git-worktrees). The main checkout holds
  uncommitted console work that also changes `dist/`. Building and committing `dist/` there would ship it.
- **Commit messages are Conventional Commits.** A shell hook rejects anything else. Examples:
  `feat(sql): …`, `test(sql): …`, `build(sql): …`. The body explains why.
- **Stage only the task's own paths** (`git add <paths>`), never `git add -A`.
- **Dependency scope.** New npm dependencies go only into `dist/sql-ui.js` / `dist/sql-worker.js`:
  `@codemirror/state`, `@codemirror/view`, `@codemirror/language`, `@codemirror/commands`,
  `@codemirror/autocomplete`, `@codemirror/lang-sql`, `@sqlite.org/sqlite-wasm`. Nothing enters
  `panel-ui.js`, `hud-ui.js`, `window-ui.js`, `background.js` or `content/`.
- **Every `src/` change is followed by `npm run build`, and `dist/` is committed with it** (CI `dist-sync`).
- **Formatting.** Format only code you write. Never reformat files you pass through. Pinned regex tests
  over source are updated to describe the new wiring, never deleted.
- **Styling.** `--xray-*` tokens only. No web fonts, CDN scripts or remote assets. The `.wasm` file is
  served from the extension origin.
- **Default row cap 1,000.** Adjustable per tab, 1–50,000. The grid shows the first 65,536 characters of a
  cell. A blob preview is cut at 256 bytes.
- **Read-only is on by default** for every opened file.
- **Confirmation list.** These always ask for confirmation: `DROP`, `TRUNCATE`, `ALTER`, `GRANT`, `REVOKE`,
  `DELETE`/`UPDATE` without a top-level `WHERE`, and any statement the parser cannot parse.
- **History** keeps 200 entries per connection and never stores rows.
- **Storage keys:** `sql_history`, `sql_editor_tabs`.
- **Message type** for the HUD: `XRAY_OPEN_SQL_WINDOW`.
- **Amends spec §2 (page-facing API).** Drivers expose `execute(sql, opts, signal): Promise<QueryResult>`.
  Streaming chunks belong to the M3 helper transport, behind this interface. For SQLite, cursor and fetch
  more are not offered (`cursor: false`); "Run with higher limit" is offered instead.
- **`npm run check`** passes at the end of every task. `npm run test:e2e` passes at the end of Task 8.

## Review Focus

1. **A non-SQLite file (a `.txt` renamed `.db`, an empty file).** The user expects a clear "not a SQLite
   database" error, not a dead worker. Owned by Task 4 (engine test) and Task 7 (error shown).
2. **Stop during a runaway query, then running again.** The worker restarts, the database is reopened from
   the last saved bytes, and the next query works. Unsaved edits trigger a confirmation first. Owned by
   Task 6 (client test) and Task 8 (e2e).
3. **A `;` or `--` inside strings, comments or `$$` bodies, and the cursor sitting in whitespace between
   statements.** "Run" must pick the right statement, or the previous one when the cursor is in
   whitespace. Owned by Task 1.
4. **Huge results.** 50,000 rows × 30 columns, or one 5 MB text cell, must not freeze the grid or blow the
   worker message size. Owned by Task 4 (cap and truncation) and Task 8 (e2e 7, virtualized rows and
   columns).
5. **Read-only bypass attempts.** `PRAGMA query_only = 0`, `ATTACH`, and a write hidden in a CTE
   (`WITH x AS (DELETE …)`). All are refused on a read-only connection. Owned by Task 2 (classifier) and
   Task 4 (engine).

---

## File map

| File | Responsibility |
|---|---|
| `src/panel/models/sqlTypes.ts` | Shared types: dialect, capabilities, schema tree, query result, cells, errors |
| `src/panel/models/sqlStatements.ts` | Split a script into statements; find the statement at the cursor (lang-sql tree) |
| `src/panel/models/sqlClassify.ts` | Classify a statement as `read` / `write` / `dangerous` |
| `src/panel/models/sqlValues.ts` | Cell normalisation, display truncation, CSV/JSON/INSERT copy |
| `src/panel/models/sqlErrors.ts` | Normalize raw engine errors to `SqlError` |
| `src/panel/models/sqliteEngine.ts` | SQLite engine over an injected `sqlite3` module: open, introspect, execute, export |
| `src/panel/models/sqlSchema.ts` | Identifier quoting, table-preview SQL, CodeMirror completion schema |
| `src/panel/models/sqlHistory.ts` | History ring and editor-tab persistence shapes |
| `src/panel/sql/sqlite.worker.ts` | Worker shell: loads WASM, routes messages to `sqliteEngine` |
| `src/panel/runtime/sqliteClient.ts` | Page-side driver: spawns or restarts the worker, implements `SqlDriver` |
| `src/panel/sqlStore.ts` | Zustand store for the SQL page (thin; logic lives in models) |
| `src/panel/components/sql/*.tsx` | `SqlApp`, `ConnectionRail`, `SqlEditor`, `ResultsPane`, `ResultGrid`, `OpenFileButton` |
| `src/panel/components/sql/SqlFrame.tsx` | The panel's SQL tab: an iframe, or the HUD's "Open SQL client" card |
| `src/panel/sql-main.tsx` | Entry for `dist/sql-ui.js` |
| `sql.html` | The page |

---

### Task 1: Dependencies, shared types, statement splitter

**Files:**
- Modify: `package.json`, `package-lock.json`
- Create: `src/panel/models/sqlTypes.ts`, `src/panel/models/sqlStatements.ts`
- Test: `test/unit/sqlStatements.test.mjs`

**Interfaces:**
- Produces (`sqlTypes.ts`):
  - `type SqlDialect = 'postgres' | 'mysql' | 'sqlite'`
  - `interface DriverCapabilities { readOnlyEnforced: boolean; cancel: boolean; transactions: boolean; cursor: boolean; multiStatement: boolean }`
  - `interface ColumnNode { name: string; type: string; nullable: boolean; defaultValue: string | null; pk: boolean }`
  - `interface TableNode { name: string; columns: ColumnNode[]; indexes: string[] }`
  - `interface SchemaNode { name: string; tables: TableNode[]; views: TableNode[] }`
  - `interface SchemaTree { schemas: SchemaNode[] }`
  - `type SqlCell = null | string | number | boolean | { hex: string; length: number }`
  - `interface ResultColumn { name: string; type: string }`
  - `interface QueryResult { columns: ResultColumn[]; rows: SqlCell[][]; rowCount: number; affected: number | null; durationMs: number; notices: string[]; hasMore: boolean; truncatedCells: number }`
  - `type SqlErrorCode = 'helper-missing' | 'helper-outdated' | 'auth-failed' | 'tls-failed' | 'network' | 'timeout' | 'cancelled' | 'read-only' | 'syntax' | 'server' | 'connection-lost' | 'limit-reached' | 'not-a-database'`
  - `interface SqlError { code: SqlErrorCode; message: string; sqlState?: string; position?: number; hint?: string; detail?: string }`
  - `interface ExecuteOptions { maxRows: number }`
  - `interface SqlDriver { dialect: SqlDialect; capabilities: DriverCapabilities; introspect(): Promise<SchemaTree>; execute(sql: string, opts: ExecuteOptions, signal?: AbortSignal): Promise<QueryResult>; close(): Promise<void> }`
  - `const DEFAULT_MAX_ROWS = 1000`, `const MAX_MAX_ROWS = 50000`
- Produces (`sqlStatements.ts`):
  - `interface StatementRange { from: number; to: number; text: string }` (`from`/`to` are offsets into the
    original text; `text` is trimmed and has no trailing `;`)
  - `splitStatements(text: string, dialect: SqlDialect): StatementRange[]` (empty statements dropped)
  - `statementAt(text: string, pos: number, dialect: SqlDialect): StatementRange | null`
  - `sqlLanguage(dialect: SqlDialect)`, which returns the lang-sql `SQLDialect` (`PostgreSQL`, `MySQL`,
    `SQLite`). Later tasks reuse it.

- [ ] **Step 1: Install the dependencies**

Run:
```bash
npm i @codemirror/state @codemirror/view @codemirror/language @codemirror/commands @codemirror/autocomplete @codemirror/lang-sql@^6.10.0 @sqlite.org/sqlite-wasm@3.54.1-build1
```
Expected: `package.json` `dependencies` lists all seven. `npm ls @codemirror/lang-sql` prints a version.

- [ ] **Step 2: Write the failing tests** in `test/unit/sqlStatements.test.mjs`. Import through
  `./harness.mjs`, like `consoleRecency.test.mjs`.

```js
test('split: semicolons inside strings, comments and $$ bodies do not split', () => {
  const sql = "select ';' as a; -- x; y\nselect 2;\ncreate function f() returns int as $$ select 1; $$ language sql;";
  assert.deepEqual(splitStatements(sql, 'postgres').map((s) => s.text), [
    "select ';' as a",
    'select 2',
    'create function f() returns int as $$ select 1; $$ language sql',
  ]);
});
test('split: mysql backticks and a missing final semicolon', () => {
  assert.deepEqual(splitStatements('select `a;b` from t; select 1', 'mysql').map((s) => s.text), ['select `a;b` from t', 'select 1']);
});
test('split: empty and whitespace-only statements are dropped', () => {
  assert.deepEqual(splitStatements(' ;; select 1 ;\n\n', 'sqlite').map((s) => s.text), ['select 1']);
});
test('statementAt: inside, at the end, and in whitespace after a statement', () => {
  const sql = 'select 1;\n\nselect 2;';
  assert.equal(statementAt(sql, 3, 'sqlite').text, 'select 1');
  assert.equal(statementAt(sql, 9, 'sqlite').text, 'select 1');   // right after ';'
  assert.equal(statementAt(sql, 10, 'sqlite').text, 'select 1');  // blank line: previous statement
  assert.equal(statementAt(sql, 13, 'sqlite').text, 'select 2');
  assert.equal(statementAt('', 0, 'sqlite'), null);
});
test('statementAt: offsets map back to the original text', () => {
  const sql = '  select 1  ;';
  const s = statementAt(sql, 4, 'sqlite');
  assert.equal(sql.slice(s.from, s.to), 'select 1');
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `node --test test/unit/sqlStatements.test.mjs`
Expected: FAIL (module not found).

- [ ] **Step 4: Implement `sqlTypes.ts` and `sqlStatements.ts`**

  Parse with `sqlLanguage(dialect).language.parser.parse(text)`. Walk the top-level `Statement` nodes of
  the tree; their ranges, minus surrounding whitespace and the trailing `;`, give `from`/`to`.

  `statementAt` rules:
  - the statement whose range contains `pos`, with `to` counted inclusive of the `;`
  - else the nearest statement ending before `pos`
  - else the first statement after `pos`
  - else `null`

- [ ] **Step 5: Run the tests to verify they pass**

Run: `node --test test/unit/sqlStatements.test.mjs`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/panel/models/sqlTypes.ts src/panel/models/sqlStatements.ts test/unit/sqlStatements.test.mjs
git commit -m "feat(sql): split SQL scripts into statements with the lang-sql parser"
```

---

### Task 2: Statement classifier

**Files:**
- Create: `src/panel/models/sqlClassify.ts`
- Test: `test/unit/sqlClassify.test.mjs`

**Interfaces:**
- Consumes: `sqlLanguage`, `SqlDialect` (Task 1).
- Produces:
  - `type StatementKind = 'read' | 'write' | 'dangerous'`
  - `classifyStatement(text: string, dialect: SqlDialect): { kind: StatementKind; reason: string }`
  - `reason` is the short phrase used in the confirmation copy, e.g. `'DROP'`, `'DELETE without WHERE'`,
    `'could not parse'`.

- [ ] **Step 1: Write the failing tests** (table-driven, one `test` per row group):

| Input (sqlite unless noted) | kind | reason |
|---|---|---|
| `select * from t` / `with a as (select 1) select * from a` / `values (1)` / `explain select 1` / `pragma table_info(t)` / `show tables` (mysql) | read | `''` |
| `insert into t values (1)` / `update t set a=1 where id=2` / `create table x(a)` / `pragma query_only = 0` / `attach 'x.db' as x` / `set search_path = a` (postgres) / `explain analyze delete from t where id=1` (postgres) | write | first write keyword, e.g. `'INSERT'`, `'PRAGMA assignment'` |
| `with x as (delete from t where id=1 returning *) select * from x` (postgres) | write | `'DELETE'` |
| `drop table t` / `truncate t` (postgres) / `alter table t add c int` / `grant select on t to u` (postgres) / `revoke select on t from u` (postgres) | dangerous | `'DROP'` etc. |
| `delete from t` / `update t set a = 1` | dangerous | `'DELETE without WHERE'` / `'UPDATE without WHERE'` |
| `delete from t where id in (select id from u)` (top-level WHERE) | write | `'DELETE'` |
| `update t set a = (select 1 where true)` (WHERE only inside parentheses) | dangerous | `'UPDATE without WHERE'` |
| `selec * frm t` (parse error node) | dangerous | `'could not parse'` |
| `vacuum` / `frobnicate the table` (unknown first keyword, parses) | write | `'VACUUM'` / `'unrecognized statement'` |

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test test/unit/sqlClassify.test.mjs`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `classifyStatement`**

  Tokenize from the lang-sql tree (`Keyword`, `Identifier`, `Parens`, `⚠` error nodes), tracking
  parenthesis depth.

  Order of checks:
  1. An error node → dangerous, `'could not parse'`.
  2. First keyword in `DROP` / `TRUNCATE` / `ALTER` / `GRANT` / `REVOKE` → dangerous.
  3. First keyword `DELETE`/`UPDATE` with no `WHERE` at depth 0 → dangerous.
  4. Any write keyword anywhere (`INSERT UPDATE DELETE REPLACE MERGE CREATE ATTACH DETACH VACUUM REINDEX
     COPY CALL DO SET RESET LOCK`) → write. So does `PRAGMA` followed by `=`, and `EXPLAIN ANALYZE`
     wrapping a write.
  5. First keyword in `SELECT WITH VALUES EXPLAIN PRAGMA SHOW DESCRIBE DESC TABLE` → read.
  6. Otherwise → write, `'unrecognized statement'`.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test test/unit/sqlClassify.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/panel/models/sqlClassify.ts test/unit/sqlClassify.test.mjs
git commit -m "feat(sql): classify statements as read, write or dangerous from the parse tree"
```

---

### Task 3: Values, copy formats and error normalization

**Files:**
- Create: `src/panel/models/sqlValues.ts`, `src/panel/models/sqlErrors.ts`
- Test: `test/unit/sqlValues.test.mjs`, `test/unit/sqlErrors.test.mjs`

**Interfaces:**
- Consumes: `SqlCell`, `ResultColumn`, `SqlError`, `SqlDialect` (Task 1).
- Produces (`sqlValues.ts`):
  - `toCell(raw: unknown): SqlCell`:
    - `bigint` → decimal string
    - number → number if finite, else `String(raw)`
    - `Uint8Array` → `{ hex, length }`, hex of the first 256 bytes, lowercase
    - `null`/`undefined` → `null`
    - boolean stays boolean
    - everything else → `String(raw)`
  - `CELL_DISPLAY_LIMIT = 65536`
  - `displayCell(cell: SqlCell): { text: string; truncated: boolean; kind: 'null' | 'number' | 'text' | 'blob' | 'boolean' | 'json' }`:
    - `null` → text `'NULL'`
    - blob → `\x<hex>…` plus a length suffix
    - `json` when a string trims to start with `{` or `[` and `JSON.parse` succeeds on it
    - text cut at the limit
  - `toCsv(columns: ResultColumn[], rows: SqlCell[][]): string` — RFC 4180: quote when the field contains
    `,` `"` CR or LF, double the quotes, CRLF line ends, header row first, `NULL` written as an empty field.
  - `toJsonRows(columns, rows): string` — `JSON.stringify` of an array of objects, 2-space indent, blob as
    `{ hex, length }`.
  - `toInsertStatements(table: string, columns, rows, dialect: SqlDialect): string` — one
    `INSERT INTO <quoted table> (<quoted cols>) VALUES (...);` per row:
    - strings single-quoted with `'` doubled
    - `NULL`
    - numbers bare
    - booleans `TRUE`/`FALSE`
    - blob as `X'<hex>'`
    - identifiers are quoted with `quoteIdent`, defined here
  - `quoteIdent(name: string, dialect: SqlDialect): string` — `"` for postgres/sqlite and `` ` `` for mysql,
    with the quote character doubled inside. Task 5 re-exports it from `sqlSchema.ts`.
  - `clampMaxRows(n: number): number` — integer in [1, 50000]; NaN → 1000.
- Produces (`sqlErrors.ts`):
  - `normalizeSqlError(raw: unknown, sql?: string): SqlError`:
    - `AbortError` / `{ name: 'AbortError' }` → `cancelled`
    - message matching `/readonly|read-only|query_only/i` → `read-only`
    - `/not a database|file is not a database|malformed/i` → `not-a-database`
    - `/syntax error|near "/i` → `syntax`, and `position` = the index of the near token in `sql` when given
      (first occurrence)
    - an object already shaped like `SqlError` passes through
    - otherwise `server`
    - `message` is always a non-empty string

- [ ] **Step 1: Write the failing tests.** These cases at minimum:
  - `toCell(9007199254740993n) === '9007199254740993'`
  - `toCell(NaN) === 'NaN'`
  - `toCell(new Uint8Array(300))` gives `.length === 300` and `.hex.length === 512`
  - `displayCell('x'.repeat(70000))` gives `.truncated === true` and `.text.length === 65536`
  - `displayCell('{"a":1}').kind === 'json'`
  - `displayCell('{oops').kind === 'text'`
  - `toCsv` with `a,"b"\nc` gives `"a,""b""\nc"`, plus a `NULL` cell giving an empty field
  - `toInsertStatements('my table', …, 'mysql')` uses backticks
  - `'postgres'` doubles embedded `"`
  - `clampMaxRows(0) === 1`, `clampMaxRows(1e9) === 50000`, `clampMaxRows(NaN) === 1000`
  - `normalizeSqlError(new Error('near "frm": syntax error'), 'select * frm t').position === 9`
  - an `AbortError` normalizes to `cancelled`
  - `'attempt to write a readonly database'` normalizes to `read-only`
  - `'file is not a database'` normalizes to `not-a-database`
  - `normalizeSqlError(undefined).message` is non-empty

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test test/unit/sqlValues.test.mjs test/unit/sqlErrors.test.mjs`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement both modules** to the signatures above.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test test/unit/sqlValues.test.mjs test/unit/sqlErrors.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/panel/models/sqlValues.ts src/panel/models/sqlErrors.ts test/unit/sqlValues.test.mjs test/unit/sqlErrors.test.mjs
git commit -m "feat(sql): lossless cell values, CSV/JSON/INSERT copy and normalized errors"
```

---

### Task 4: SQLite engine against the real WASM

**Files:**
- Create: `src/panel/models/sqliteEngine.ts`
- Test: `test/unit/sqliteEngine.test.mjs`, `test/helpers/sqliteFixture.mjs` (builds the shared `shop` fixture
  bytes; Task 8 reuses it)

**Interfaces:**
- Consumes: `toCell` (Task 3), `normalizeSqlError` (Task 3), `classifyStatement` (Task 2), types (Task 1).
- Produces:
  - `interface SqliteEngine { open(bytes: Uint8Array, readOnly: boolean): void; introspect(): SchemaTree; execute(sql: string, opts: ExecuteOptions): QueryResult; exportBytes(): Uint8Array; close(): void }`
  - `createSqliteEngine(sqlite3: unknown): SqliteEngine` — `sqlite3` is the module that
    `sqlite3InitModule()` resolves to. It is injected so the worker and Node tests share the code.
  - `SQLITE_CAPABILITIES: DriverCapabilities = { readOnlyEnforced: true, cancel: true, transactions: true, cursor: false, multiStatement: true }`
  - `test/helpers/sqliteFixture.mjs` exports `async function shopDatabaseBytes(): Promise<Uint8Array>`. The
    database has:
    - `customers(id INTEGER PRIMARY KEY, email TEXT NOT NULL, created_at TEXT)` — 3 rows
    - `orders(id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES customers(id), total NUMERIC, meta TEXT, big INTEGER, photo BLOB)`
      — 2,500 rows. Row 1 has `meta = '{"gift":true}'`, `big = 9007199254740993` and a 300-byte blob.
    - index `orders_customer` on `orders(customer_id)`
    - view `big_orders`

**Engine rules:**
- **open:** load bytes with `sqlite3_deserialize`. Read-only adds `SQLITE_DESERIALIZE_READONLY` and runs
  `PRAGMA query_only = 1`. Bytes that are not a database throw `normalizeSqlError` → `not-a-database`; run a
  `PRAGMA schema_version` probe to detect this.
- **execute:** for each statement from `splitStatements(sql, 'sqlite')`:
  - On a read-only engine, a statement whose `classifyStatement(...).kind !== 'read'` throws `read-only`
    before preparing. This blocks `PRAGMA query_only = 0` and `ATTACH`.
  - The result is that of the last statement.
  - Rows are stepped until `maxRows`; `hasMore` is true if another row exists.
  - Column `type` comes from `sqlite3_column_decltype` (`''` when null).
  - Cells go through `toCell`. Text over 1,048,576 characters is cut to that length and counted in
    `truncatedCells`.
  - `affected` is `sqlite3_changes()` for non-read statements, else `null`.
  - `durationMs` is measured with `performance.now()`.
- **introspect:** schema `main`. Tables and views come from `sqlite_schema` (names starting `sqlite_`
  excluded, sorted by name). Columns come from `pragma_table_info`, indexes from `pragma_index_list`.

- [ ] **Step 1: Write the failing tests.** These cases:
  - `introspect` lists `customers`, `orders` (columns, `pk` on `id`, index `orders_customer`) and view
    `big_orders`
  - `select * from orders` with `maxRows: 1000` gives `rowCount 1000`, `hasMore true`, and `big` as the
    string `'9007199254740993'`
  - `photo.length === 300`
  - `meta` is the string `'{"gift":true}'`
  - `columns[0]` deep-equals `{ name: 'id', type: 'INTEGER' }`
  - a read-only engine rejects `update orders set total = 0` with `code === 'read-only'`, and also
    `pragma query_only = 0`, `attach ':memory:' as x` and `with x as (select 1) insert into customers(email) values ('a')`
  - a read-write engine runs `delete from orders where id = 1` with `affected === 1`; `exportBytes()` then
    reopens with 2,499 orders
  - `open(new TextEncoder().encode('hello'), true)` throws `not-a-database`
  - a `select 'x'` returning a 2,000,000-character string comes back cut to 1,048,576 with
    `truncatedCells === 1`
  - `select 1; select 2` returns `[[2]]`

  Load the module in Node with `const sqlite3 = await (await import('@sqlite.org/sqlite-wasm')).default();`.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test test/unit/sqliteEngine.test.mjs`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `createSqliteEngine`** following the rules above.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test test/unit/sqliteEngine.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/panel/models/sqliteEngine.ts test/unit/sqliteEngine.test.mjs test/helpers/sqliteFixture.mjs
git commit -m "feat(sql): SQLite engine with enforced read-only, row caps and introspection"
```

---

### Task 5: Schema helpers and history

**Files:**
- Create: `src/panel/models/sqlSchema.ts`, `src/panel/models/sqlHistory.ts`
- Test: `test/unit/sqlSchema.test.mjs`, `test/unit/sqlHistory.test.mjs`

**Interfaces:**
- Consumes: types (Task 1), `quoteIdent` (Task 3).
- Produces (`sqlSchema.ts`):
  - re-exports `quoteIdent(name: string, dialect: SqlDialect): string`
  - `selectTableSql(schema: string, table: string, dialect: SqlDialect): string` →
    `SELECT * FROM <q(schema)>.<q(table)> LIMIT 100;`. The SQLite `main` schema is omitted:
    `SELECT * FROM "orders" LIMIT 100;`
  - `toCompletionSchema(tree: SchemaTree): Record<string, string[]>` — the lang-sql `schema` option. Keys
    are table and view names; for a non-default schema the key is `schema.table`; values are column names.
- Produces (`sqlHistory.ts`):
  - `HISTORY_KEY = 'sql_history'`, `EDITOR_TABS_KEY = 'sql_editor_tabs'`, `HISTORY_LIMIT = 200`
  - `interface HistoryItem { sql: string; at: number; durationMs: number; rowCount: number | null; ok: boolean; error?: string }`
  - `appendHistory(all: Record<string, HistoryItem[]>, connectionKey: string, item: HistoryItem): Record<string, HistoryItem[]>`
    — immutable, newest first, capped at 200, no rows. When the same SQL as the newest entry runs again,
    that entry is replaced instead of a duplicate added.
  - `interface EditorTab { id: string; title: string; sql: string; maxRows: number }`
  - `restoreEditorTabs(raw: unknown, connectionKey: string): EditorTab[]` — validates and clamps `maxRows`
    via `clampMaxRows`. Bad or missing input gives one tab `{ title: 'Query 1', sql: '', maxRows: 1000 }`.
  - `connectionKeyForFile(name: string, size: number): string` → `sqlite:<name>:<size>`

- [ ] **Step 1: Write the failing tests.** Cover:
  - `selectTableSql('main','orders','sqlite')` → `SELECT * FROM "orders" LIMIT 100;`
  - `selectTableSql('public','my"t','postgres')` → `SELECT * FROM "public"."my""t" LIMIT 100;`
  - MySQL backticks
  - `toCompletionSchema` keys for `main` vs `audit` schemas
  - `appendHistory` capping at 200 and replacing a repeat
  - `restoreEditorTabs(null, k)` default
  - `restoreEditorTabs` clamping `maxRows: 999999` to 50000 and dropping tabs without a string `sql`

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test test/unit/sqlSchema.test.mjs test/unit/sqlHistory.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Implement both modules.**

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test test/unit/sqlSchema.test.mjs test/unit/sqlHistory.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/panel/models/sqlSchema.ts src/panel/models/sqlHistory.ts test/unit/sqlSchema.test.mjs test/unit/sqlHistory.test.mjs
git commit -m "feat(sql): table preview SQL, completion schema and per-connection history"
```

---

### Task 6: Page, bundles, worker and SQLite client

**Files:**
- Create: `sql.html`, `src/panel/sql-main.tsx` (renders a placeholder `SqlApp` stub that Task 7 replaces),
  `src/panel/sql/sqlite.worker.ts`, `src/panel/runtime/sqliteClient.ts`
- Modify:
  - `vite.config.ts`: add IIFE entries `{ entry: 'src/panel/sql-main.tsx', outfile: 'dist/sql-ui.js', globalName: 'XRAYSqlUI' }`
    and `{ entry: 'src/panel/sql/sqlite.worker.ts', outfile: 'dist/sql-worker.js', globalName: 'XRAYSqlWorker' }`;
    in `closeBundle`, copy `node_modules/@sqlite.org/sqlite-wasm/**/sqlite3.wasm` to `dist/sqlite3.wasm`
  - `manifest.json`: `content_security_policy.extension_pages` →
    `script-src 'self' 'wasm-unsafe-eval'; object-src 'self'; style-src 'self' 'unsafe-inline'`
  - `scripts/check-dist-sync.mjs`: bundles list gains `dist/sql-ui.js`, `dist/sql-worker.js`, `dist/sqlite3.wasm`
  - `scripts/package-extension.mjs`: allowList gains `sql.html`
  - `docs/threat-model.md`: one row under §5 / CSP. It records that `'wasm-unsafe-eval'` applies to
    extension pages only, so SQLite-WASM can run in `sql.html`; content scripts and pages are unaffected;
    and `sql.html` is deliberately not web-accessible.
- Test: `test/sql-client.test.js` (pinned), `test/unit/sqliteClient.test.mjs`

**Interfaces:**
- Consumes: `createSqliteEngine`, `SQLITE_CAPABILITIES` (Task 4); `normalizeSqlError` (Task 3).
- Produces (`sqliteClient.ts`):
  - `interface SqliteClient extends SqlDriver { open(bytes: Uint8Array, readOnly: boolean): Promise<void>; exportBytes(): Promise<Uint8Array>; readonly dirty: boolean }`
  - `createSqliteClient(spawn: () => WorkerLike): SqliteClient`, where
    `WorkerLike = { postMessage(msg: unknown, transfer?: Transferable[]): void; terminate(): void; onmessage: ((e: { data: unknown }) => void) | null }`
  - The production `spawn` is `() => new Worker(chrome.runtime.getURL('dist/sql-worker.js'))`.
- Worker protocol: requests are `{ id: number, op: 'open' | 'introspect' | 'execute' | 'export', ... }`;
  responses are `{ id, ok: true, value } | { id, ok: false, error: SqlError }`. The worker sets
  `locateFile: () => 'sqlite3.wasm'`, which resolves next to `dist/sql-worker.js`.

**Client rules:**
- An aborted `signal` terminates the worker, rejects the pending call with `cancelled`, then spawns a new
  worker and re-opens it from `lastBytes` with the same `readOnly`.
- `lastBytes` is the opened file, updated by `exportBytes()`.
- `dirty` becomes true after a successful non-read statement on a read-write connection. It resets on
  `exportBytes()` and `open`.

- [ ] **Step 1: Write the failing pinned test** `test/sql-client.test.js`:
  - the manifest CSP for `extension_pages` contains `'wasm-unsafe-eval'`
  - `web_accessible_resources` never lists `sql.html`, `dist/sql-ui.js`, `dist/sql-worker.js` or
    `dist/sqlite3.wasm`
  - every `<script src>` in `sql.html` is a relative path (no `://`)
  - `sql.html` loads `shared/utils.js` and `shared/store.js` before `dist/sql-ui.js`
  - `dist/panel-ui.js`, `dist/hud-ui.js` and `dist/window-ui.js` contain none of `cm-editor`,
    `sqlite3_deserialize`, `XRAYSqlUI`
  - the package allowList includes `sql.html`

- [ ] **Step 2: Write the failing unit test** `test/unit/sqliteClient.test.mjs`. Use a fake `WorkerLike`
  that runs the real `createSqliteEngine` synchronously, and the fixture from Task 4. Cases:
  - open + execute round-trips rows
  - aborting a pending execute rejects with `code 'cancelled'`, `spawn` is called twice, and the next
    execute succeeds on the re-opened data
  - `dirty` goes true after a read-write delete and false after `exportBytes()`
  - an engine error arrives as a `SqlError`

- [ ] **Step 3: Run the tests to verify they fail**

Run: `node --test test/sql-client.test.js test/unit/sqliteClient.test.mjs`
Expected: FAIL.

- [ ] **Step 4: Implement** the page (copy `window.html`'s theme-background block and the script order,
  with root id `xray-sql-root`), the worker, the client and the build/manifest/script changes listed above.

- [ ] **Step 5: Build, then run the tests**

Run: `npm run build && node --test test/sql-client.test.js test/unit/sqliteClient.test.mjs`
Expected: PASS. `ls dist` shows `sql-ui.js sql-worker.js sqlite3.wasm`.

- [ ] **Step 6: Run the full check, then commit**

Run: `npm run check` (expect PASS), then:
```bash
git add sql.html src/panel/sql-main.tsx src/panel/sql/sqlite.worker.ts src/panel/runtime/sqliteClient.ts vite.config.ts manifest.json scripts/check-dist-sync.mjs scripts/package-extension.mjs docs/threat-model.md test/sql-client.test.js test/unit/sqliteClient.test.mjs dist/
git commit -m "build(sql): sql.html page, SQLite worker bundle and wasm-unsafe-eval for extension pages"
```

---

### Task 7: SQL workspace UI

**Files:**
- Create:
  - `src/panel/sqlStore.ts`
  - `src/panel/components/sql/SqlApp.tsx`, `ConnectionRail.tsx`, `SqlEditor.tsx`, `ResultsPane.tsx`,
    `ResultGrid.tsx`, `OpenFileButton.tsx`
  - `src/panel/styles/sql.css` (imported `?inline` by `sql-main.tsx`)
- Modify: `src/panel/sql-main.tsx` (mount `SqlApp`, inject `tokens.css` + `styles.css` + `sql.css` the same
  way `window-main.tsx` does, and apply panel preferences for theme/accent/font). Also `package.json`
  `test:coverage`: add `--test-coverage-exclude="src/panel/sqlStore.ts"`, matching `store.ts`.

**Interfaces:**
- Consumes:
  - `createSqliteClient` (Task 6)
  - `statementAt`, `splitStatements`, `sqlLanguage` (Task 1)
  - `classifyStatement` (Task 2)
  - `displayCell`, `toCsv`, `toJsonRows`, `toInsertStatements`, `clampMaxRows` (Task 3)
  - `selectTableSql`, `toCompletionSchema`, `appendHistory`, `restoreEditorTabs`, `connectionKeyForFile`,
    keys (Task 5)
  - `getStoredValue` / `setStoredValue` (`runtime/storageBridge.ts`)
  - `REACT_PANEL_PREFERENCES_KEY` + `applyPanelPreferences` (`models/panelPersistence.ts`)
  - `ModalShell`, `JsonView`
- Produces:
  - `usePanelSqlStore`, with state
    `{ connection: { name, size, readOnly, key } | null; schema: SchemaTree | null; tabs: EditorTab[]; activeTabId; running: { tabId, controller } | null; result: QueryResult | null; error: SqlError | null; messages: string[]; history: HistoryItem[]; pendingConfirm: { sql: string; reason: string } | null }`
  - and actions `openFile(file: File, handle?: FileSystemFileHandle)`, `run(mode: 'current' | 'all')`,
    `stop()`, `confirmPending()`, `cancelPending()`, `previewTable(schema, table)`, `setReadOnly(on)`,
    `save()`, `setMaxRows(n)`, `addTab()`, `closeTab(id)`, `updateTabSql(id, sql)`

**Behaviour:**
- **Opening a file.** `OpenFileButton` uses `window.showOpenFilePicker` when present, else a hidden
  `<input type="file" accept=".sqlite,.sqlite3,.db,.db3,application/vnd.sqlite3">`. The read-only checkbox
  next to it defaults to checked.
- **Running.** Ctrl/Cmd+Enter runs the selection, else `statementAt`. Ctrl/Cmd+Shift+Enter runs every
  statement in order and stops at the first error. Before sending each statement:
  - read-only connection and kind ≠ `read` → show `SqlError { code: 'read-only', message: 'This connection is read-only. Turn off Read-only to run <reason>.' }`
    without calling the engine
  - kind `dangerous` (read-write connection) → set `pendingConfirm`, and render a `ModalShell` titled
    `Run <reason>?` with Cancel (initial focus) and a danger button `Run anyway`
- **Read-only toggle.** Turning read-only off re-opens from the current bytes. Turning it back on while
  `dirty` asks "Discard unsaved changes?" first.
- **Stop** aborts the controller. While `dirty`, Stop first asks "Stopping restarts the database and loses
  unsaved changes."
- **Save** (enabled when `dirty`) writes `exportBytes()` through the file handle via `createWritable()`,
  else downloads `<name>`.
- **Errors** show in Messages, with the editor underline at `position` (a CodeMirror decoration). The
  `not-a-database` copy: "This file is not a SQLite database."
- **Rail.** Clicking a table or view sets the active tab's SQL to `selectTableSql(...)` in a new tab titled
  with the table name, then runs it.
- **Grid.** Row and column virtualizers (`@tanstack/react-virtual`, horizontal for columns). Cells render
  `displayCell(...).text` as text nodes only. Clicking a cell opens the inspector side pane: full display
  text, with `JsonView` when the kind is `json`. The header shows `<rowCount> rows · <durationMs> ms`, plus
  `· more rows available, Run with higher limit` when `hasMore`. Copy menu: CSV, JSON, INSERT (table name
  = the previewed table, else `query_result`). A max-rows number input is clamped through `clampMaxRows`.
- **History tab.** Clicking an item loads its SQL into the active tab. History and editor tabs are
  persisted under the Task 5 keys through `setStoredValue`, debounced 300 ms.
- **Editor.** CodeMirror is configured with `sql({ dialect: sqlLanguage('sqlite'), schema: toCompletionSchema(schema), upperCaseKeywords: false })`,
  history, default keymap, and a theme built from `--xray-*` variables.

- [ ] **Step 1: Implement the store and components** to the behaviour above. Keep decisions in the Task
  1–5 models; components only wire.
- [ ] **Step 2: Build and smoke-test by hand.** Run `npm run build`, load the unpacked extension, open
  `chrome-extension://<id>/sql.html`, and open a `.sqlite` file. Expected: the schema tree lists tables;
  clicking one shows rows; `update` on read-only shows the read-only message.
- [ ] **Step 3: Run the full check**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/panel/sqlStore.ts src/panel/components/sql src/panel/styles/sql.css src/panel/sql-main.tsx package.json dist/
git commit -m "feat(sql): SQL client workspace with editor, schema rail, results grid and history"
```

---

### Task 8: Panel SQL tab, HUD window, end-to-end tests

**Files:**
- Modify:
  - `src/panel/types.ts:2` (`ActiveTab` gains `'sql'`)
  - `src/panel/models/panelPersistence.ts:6` (`VALID_TABS` gains `'sql'`)
  - `src/panel/components/shell/panelTabs.tsx` (add `{ id: 'sql', label: 'SQL', icon: <IconDatabase … /> }`
    after `insights`)
  - `src/panel/App.tsx` (`{activeTab === 'sql' && <SqlFrame mode={mode} />}`)
  - `src/panel/runtime/surfaces.ts` (add `openSqlWindowSurface(io)` sending `XRAY_OPEN_SQL_WINDOW`)
  - `background.js` (handler next to `XRAY_OPEN_WINDOW`; `_openSqlWindow()` mirrors `_openPopoutWindow`
    with its own `sqlWindowId`, URL `sql.html`, 1280×800)
  - pinned tests that enumerate tabs or background message types (find them with
    `grep -rln "'insights'\|XRAY_OPEN_WINDOW" test/`) — update them to describe the new wiring
- Create: `src/panel/components/sql/SqlFrame.tsx`, `test/e2e/sql-client.e2e.mjs`

**Interfaces:**
- Consumes: `shopDatabaseBytes` (Task 4 helper), the store's UI from Task 7.
- Produces: `SqlFrame({ mode }: { mode: XrayAppMode })`:
  - `devtools` / `window` → `<iframe className="xray-sql-frame" title="SQL client" src={chrome.runtime.getURL('sql.html')} />`
    filling the workspace
  - `hud` → a card with the text "The SQL client opens in its own window so database rows never render
    inside this page." and a primary button "Open SQL client" calling `openSqlWindowSurface`

- [ ] **Step 1: Write the failing e2e** `test/e2e/sql-client.e2e.mjs`, following
  `console-output.e2e.mjs` for the launch. Get the extension id from `context.serviceWorkers()[0].url()`.
  Write `shopDatabaseBytes()` to a temp `shop.sqlite`. Use
  `page.addInitScript(() => { delete window.showOpenFilePicker; })` to force the `<input type=file>` path.
  Tests:
  1. Open `sql.html` and `setInputFiles`. The rail shows `customers`, `orders`, `big_orders`. Clicking
     `orders` shows a grid header starting `100 rows`, and a `big` cell reads `9007199254740993`.
  2. Read-only: type `update orders set total = 0` and press Ctrl+Enter. Messages contain
     `This connection is read-only`.
  3. Read-write: untick Read-only and run `drop table customers`. A dialog `Run DROP?` appears. Cancel →
     `customers` is still in the rail.
  4. Stop: run `with recursive c(x) as (select 1 union all select x+1 from c) select count(*) from c` and
     click Stop within 2 s. Messages show cancelled, then `select count(*) from orders` returns `2500`.
  5. Pop-out: open `window.html`, click the `SQL` tab. An `iframe[title="SQL client"]` exists with `src`
     ending `/sql.html`.
  6. HUD: on a fixture page, toggle the HUD the way `console-output.e2e.mjs` does, then click `SQL` and
     `Open SQL client`. `context.waitForEvent('page')` yields a URL ending `/sql.html`.
  7. Large result: set max rows to 50000 and run
     `with recursive c(x) as (select 1 union all select x+1 from c where x < 50000) select x, x as c1, …, x as c29 from c`
     (30 columns). The header reads `50000 rows`. Fewer than 200 row elements and fewer than 40 cell
     columns are in the DOM. Scrolling to the bottom shows the cell `50000`.
  8. Not a database: open an empty `empty.db` and a text file renamed `notes.db`. Messages show
     `This file is not a SQLite database.`, and opening `shop.sqlite` afterwards still works.
- [ ] **Step 2: Run it to verify it fails**

Run: `npm run build && node --test test/e2e/sql-client.e2e.mjs`
Expected: tests 1–4, 7 and 8 pass from Task 7; 5–6 FAIL (no SQL tab).

- [ ] **Step 3: Implement the tab, `SqlFrame`, the surface helper and the background handler.** Update the
  pinned tests found by the grep above.
- [ ] **Step 4: Build and run the e2e and the full check**

Run: `npm run build && node --test test/e2e/sql-client.e2e.mjs && npm run check && npm run test:coverage`
Expected: all PASS. Coverage stays ≥ 95 / 88 / 95.

- [ ] **Step 5: Run the whole e2e suite** (the new tab must not break existing navigation and layout tests)

Run: `npm run test:e2e`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/panel/types.ts src/panel/models/panelPersistence.ts src/panel/components/shell/panelTabs.tsx src/panel/App.tsx src/panel/runtime/surfaces.ts src/panel/components/sql/SqlFrame.tsx background.js test/ dist/
git commit -m "feat(sql): SQL tab in DevTools and pop-out, HUD opens the client in its own window"
```
