# SQL client M3 (Postgres and MySQL through a native helper) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The XRAY SQL client connects to any PostgreSQL or MySQL database with a normal connection string. That covers databases on a local machine, in Docker, on a server, and on Supabase or Neon. It does this through a small Go helper that Chrome launches over Native Messaging.

**Architecture:**
- `helper/` is a Go program, `xray-db-helper`. It speaks length-prefixed JSON on stdin/stdout and holds one database connection per editor tab.
- The service worker owns connection profiles and secrets, and the single `connectNative` port. It talks to `sql.html` over a long-lived `xray-sql` runtime port.
- The page gets a `RemoteClient` that implements the same `SqlDriver` interface as `SqliteClient`. The existing editor, grid, classifier and safety rules work unchanged, with the dialect switched per connection.

**Tech Stack:** Go 1.27 (`github.com/jackc/pgx/v5`, `github.com/go-sql-driver/mysql`), Chrome Native Messaging, MV3 service worker (vanilla JS), React 19 + TypeScript, `node --test`, Playwright, Docker (Postgres 16, MySQL 8) for tests.

**Spec:** `docs/superpowers/specs/2026-10-19-sql-client-design.md` (§2 native driver, §3 security, §4 helper, §5 errors, §6 testing, milestone M3). This plan also brings in the M2 pieces M3 needs: the connection manager, the `xray-sql` port, credential storage, and the connection dialog.

## Global Constraints

- **Branch and worktree.** Branch `feat/sql-client-m3` in worktree `/home/dr/Projects/xray-sql-m3`, based on `feat/sql-client-m1` (PR #12). Never use git stash. Commit messages follow Conventional Commits; a shell hook enforces this and runs `npm test`. Stage only the task's own paths.
- **Build and dist.** Every `src/` change ships with `npm run build`, and `dist/` is committed with it (`node scripts/check-dist-sync.mjs` must pass).
- **Pinned tests.** Pinned regex tests are updated, never deleted. Format only code you write.
- **Isolation.** No SQL client code enters `dist/panel-ui.js`, `dist/hud-ui.js` or `dist/window-ui.js`. The runtime and `background.js` stay dependency-free.
- **Names.** Native host name: `com.xray.db_helper`. Helper binary name: `xray-db-helper`. Protocol version: `1`.
- **Storage keys.** `sql_connections` (profiles in `chrome.storage.local`, secrets included). `sql_session_secrets` (secrets in `chrome.storage.session` for "Don't save password"). History key for a remote connection: `remote:<profileId>`.
- **Message caps.** Host → extension messages are capped by Chrome at 1 MB, so the helper sends `rows` chunks of at most 524,288 bytes of serialized JSON. A cell longer than 1,048,576 characters is cut and counted in `truncatedCells`.
- **Row caps.** Default `maxRows` is 1,000, maximum 50,000. `fetchMore` defaults to 1,000 rows.
- **Timeouts.** Connect timeout 10 s. Optional per-connection statement timeout: Postgres `statement_timeout`, MySQL `max_execution_time`.
- **TLS.**
  - Mode `require` is the default for every non-loopback host. `verify-full` is optional, with an optional CA file path.
  - Mode `disable` is allowed only for loopback hosts: `localhost`, `127.0.0.0/8`, `::1`.
  - Refusal copy: "This server is not on this computer, so XRAY requires TLS. Choose Require or Verify full."
- **Read-only enforcement (amends spec §3, which used a session setting).** Read-only is the default for every new connection.
  - Postgres runs each statement inside `BEGIN TRANSACTION READ ONLY` and ends it with `ROLLBACK`.
  - MySQL runs each statement inside `START TRANSACTION READ ONLY` and ends it with `ROLLBACK`.
  - Why: session settings do not survive transaction poolers (Supabase/Neon PgBouncer).
  - In read-only mode the helper refuses statements whose first keyword is one of BEGIN, START, COMMIT, END, ROLLBACK, ABORT, SAVEPOINT, RELEASE, SET, RESET, DISCARD, PREPARE, LOCK. Those could end or change the wrapping transaction. They return `read-only`.
  - An open cursor keeps its read-only transaction until the cursor is exhausted or closed, or the tab runs its next statement.
- **One statement per execute.** Drivers report `multiStatement: false`. The store sends one statement at a time, as it already does for Run-all. Postgres uses pgx `QueryExecModeExec` (extended protocol without a statement cache: one statement, pooler-safe). MySQL keeps `multiStatements=false`.
- **Extension-side checks.** The existing classifier pre-check (read-only refusal, dangerous-statement confirmation) applies to remote connections unchanged.
- **Secrets.**
  - Only the service worker reads secrets. The page refers to profiles by id and never receives a password. The helper receives the password only inside `connect` and never logs, persists or echoes it. Its stderr carries only error codes.
  - Write this sentence verbatim into the threat model: "Stored database passwords are not encrypted at rest; encryption without a user passphrase would only look like protection."
- **Permission.** `nativeMessaging` goes in `optional_permissions`. It is requested from `sql.html` (a user gesture) on the first "Connect" or "Test connection" to a Postgres/MySQL profile.
- **Value mapping.** Lossless JSON values:
  - int2/int4/float4/float8 (and MySQL TINYINT/SMALLINT/MEDIUMINT/INT/FLOAT/DOUBLE) become numbers when finite and within the safe integer range.
  - int8, numeric and decimal (and MySQL BIGINT/DECIMAL) become strings.
  - Booleans become booleans.
  - bytea and binary types (and MySQL BLOB/BINARY/VARBINARY/BIT) become `{ "hex": <first 256 bytes lowercase>, "length": <n> }`.
  - json/jsonb and MySQL JSON become text.
  - Dates and times keep the server's text.
  - Everything else becomes text.

## Review Focus

1. **Supabase or Neon through their poolers (transaction mode).** Read-only must hold, and statements must not fail with "prepared statement already exists". Owned by Task 3, with a test against a PgBouncer container in transaction mode.
2. **Helper missing, outdated, or crashing mid-query.** The UI shows the install card, or "update the helper", or `connection-lost` with Reconnect. It never hangs. Owned by Task 6 (fakes) and Task 10 (real e2e: kill the helper process mid-query).
3. **A row or cell larger than the 1 MB native-messaging cap.** It arrives truncated and counted, and is never dropped and never crashes the port. Owned by Task 2 (chunker) and Task 3 (a 3 MB `repeat()` value).
4. **Cancel during a long query on both engines.** Postgres `pg_sleep(30)` and MySQL `SLEEP(30)` stop within 2 s, and the tab's connection stays usable. Owned by Tasks 3 and 4.
5. **A connection string pasted with a password containing `@`, `:` or `/` (percent-encoded) and `sslmode` / `ssl-mode` params.** It parses to the right fields, and the page-side profile never contains the password. Owned by Task 7.

---

## File map

| File | Responsibility |
|---|---|
| `helper/go.mod`, `helper/cmd/xray-db-helper/main.go` | Entry: stdin/stdout loop, dispatch |
| `helper/internal/protocol/` | Framing (4-byte native-endian length + JSON), request/response types, version |
| `helper/internal/values/` | Cell mapping and the chunker |
| `helper/internal/session/` | Session and tab connection registry; read-only wrapping; the keyword guard |
| `helper/internal/pg/`, `helper/internal/my/` | Postgres and MySQL drivers: connect/TLS, introspect, execute, cursor, cancel |
| `helper/scripts/test-with-docker.sh` | Starts Postgres 16, MySQL 8 and PgBouncer, exports DSNs, runs `go test ./...` |
| `helper/install/{install,uninstall}.{sh,ps1}` | Install and uninstall the binary and the host manifest for Chrome, Chromium and Edge |
| `.github/workflows/helper.yml` | Go vet/test with service containers; cross-compile; release on tag `helper-v*` |
| `background/sql-manager.js` | SW: profiles and secrets, native port, `xray-sql` page port protocol (pure factory, deps injected) |
| `src/panel/models/sqlProfiles.ts` | Profile types, DSN parsing, validation, loopback check, page-safe view |
| `src/panel/runtime/remoteClient.ts` | Page-side `RemoteClient implements SqlDriver` plus profile and helper calls over the port |
| `src/panel/sqlStore.ts` (modify) | Connection union (sqlite or remote), per-tab execute, dialect per connection, fetchMore |
| `src/panel/components/sql/ConnectionDialog.tsx`, `HelperInstallCard.tsx` (new); `SqlApp.tsx`, `ResultsPane.tsx` (modify) | Dialog, source menu entries, welcome action, install card, Fetch more |

---

### Task 1: Helper scaffold, protocol and CI

**Files:** Create `helper/go.mod` (module `github.com/rahuldr07/xray-extension/helper`, go 1.27), `helper/cmd/xray-db-helper/main.go`, `helper/internal/protocol/{frame.go,types.go,frame_test.go,dispatch_test.go}`, `.github/workflows/helper.yml`, `helper/README.md` (build and test commands only).

**Interfaces — Produces:**
- `protocol.ReadFrame(r io.Reader) ([]byte, error)` and `protocol.WriteFrame(w io.Writer, payload []byte) error`.
  - Native byte order (`binary.NativeEndian`).
  - `ReadFrame` rejects frames over 64 MiB with `ErrFrameTooLarge`.
  - `WriteFrame` refuses payloads over 1,048,576 bytes with `ErrPayloadTooLarge`.
  - Writes are serialized by a mutex in the writer type `protocol.Writer{}`.
- Request envelope `{ "id": number, "op": string, ... }` and response `{ "id": number, "ok": true, "value": any } | { "id": number, "ok": false, "error": { "code": string, "message": string, "sqlState"?: string, "position"?: number, "hint"?: string, "detail"?: string } }`.
- Stream messages for execute: `{ "id", "stream": "columns", "columns": [{ "name", "type" }] }`, `{ "id", "stream": "rows", "rows": [[...]] }`, then the final `{ "id", "ok": true, "value": { "rowCount", "affected", "durationMs", "notices", "hasMore", "truncatedCells" } }`.
- Operations: `hello`, `ping`, `connect`, `introspect`, `execute`, `fetchMore`, `cancel`, `close`.
  - `hello` → `{ "protocolVersion": 1, "helperVersion": "<semver from ldflags, default 0.0.0-dev>" }`.
  - `ping` → `{}`.
  - An unknown op, or unknown fields on a known op (decoded with `DisallowUnknownFields`), → error code `bad-request`.
- Requests run concurrently, one goroutine each. Responses are written through the single `protocol.Writer`.
- Stderr carries only `xray-db-helper: <code>` lines, never request content.

- [ ] **Step 1: Failing Go tests.**
  - Frame round-trip in both byte orders via a `NativeEndian` stub; a 64 MiB+1 frame is rejected; a 1 MiB+1 payload is refused.
  - `hello` returns version 1; `ping` works; `{"id":3,"op":"nope"}` gives `bad-request` with id 3.
  - `{"id":4,"op":"ping","x":1}` gives `bad-request`.
  - EOF on stdin exits 0.
  - A `connect` containing `"password":"s3cret-xyz"` that fails never writes `s3cret-xyz` to stderr or stdout. Capture both.
- [ ] **Step 2:** Run `cd helper && go test ./...`. Expected: FAIL (packages missing).
- [ ] **Step 3: Implement** the framing, the types, and the dispatcher with stubbed `connect`/`introspect`/`execute`/`fetchMore`/`cancel`/`close`, each returning `bad-request` with message "not implemented" until Tasks 3–4.
- [ ] **Step 4: Add `.github/workflows/helper.yml`.**
  - Job `test`, Ubuntu: Go 1.27, `go vet ./...` and `go test ./...` in `helper/`, with services `postgres:16`, `mysql:8.4` and `edoburu/pgbouncer` (transaction mode). DSNs come from env `XRAY_TEST_PG_DSN`, `XRAY_TEST_MYSQL_DSN` and `XRAY_TEST_PGBOUNCER_DSN`.
  - Job `build`: matrix linux, darwin and windows × amd64 and arm64, with `CGO_ENABLED=0` and `-ldflags "-s -w -X main.version=${{ github.ref_name }}"`. Upload artifacts.
  - Job `release` on tags `helper-v*`: attach binaries and `SHA256SUMS`.
- [ ] **Step 5:** Run `cd helper && go vet ./... && go test ./...`. Expected: PASS.
- [ ] **Step 6: Commit.** `feat(helper): native-messaging framing, protocol and CI for xray-db-helper`.

---

### Task 2: Value mapping and chunking

**Files:** Create `helper/internal/values/{cell.go,chunk.go,cell_test.go,chunk_test.go}`.

**Interfaces — Produces:**
- `values.Cell` (`any`, JSON-marshalable).
- `values.FromPG(oid uint32, text []byte, isNull bool) (Cell, truncated bool)`, which takes the text-format value.
- `values.FromMySQL(dbType string, raw []byte, isNull bool) (Cell, truncated bool)`.
- `values.Chunker{ MaxBytes int }`, with `Add(row []Cell) (flush [][]Cell, ok bool)` and `Flush() [][]Cell`. When a row alone exceeds `MaxBytes` after cell truncation, its largest text cells are cut further (halving) until it fits, and those cells count as truncated.
- Constants: `MaxChunkBytes = 524288`, `MaxCellChars = 1048576`, `BlobPreviewBytes = 256`.

- [ ] **Step 1: Failing tests.** Table-driven, following Global Constraints → Value mapping:
  - int8 `9007199254740993` → string; int4 `42` → `42`; float8 `NaN` → `"NaN"`.
  - numeric `1.10` → `"1.10"`; bool `t` → `true`.
  - bytea `\x00ff…` (300 bytes) → `{hex: 512 chars, length: 300}`.
  - jsonb → text; timestamptz → server text unchanged; NULL → `nil`.
  - The MySQL equivalents, including BIT(8) → hex and DECIMAL → string.
  - Chunker: 10,000 small rows produce chunks each ≤ 524,288 bytes when marshalled. A single row with a 900,000-char cell plus a 900,000-char cell still marshals ≤ 524,288 and reports truncation.
- [ ] **Step 2:** Run `go test ./internal/values/`. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4:** Run `go test ./internal/values/`. Expected: PASS.
- [ ] **Step 5: Commit.** `feat(helper): lossless cell mapping and 512 KB row chunks`.

---

### Task 3: Postgres driver and session registry

**Files:** Create `helper/internal/session/{registry.go,guard.go,registry_test.go,guard_test.go}`, `helper/internal/pg/{pg.go,introspect.go,pg_test.go}`, `helper/scripts/test-with-docker.sh`. Modify `cmd/xray-db-helper/main.go` (wire ops).

**Interfaces:**
- **Consumes:** protocol (Task 1), values (Task 2).
- **Produces:**
  - `connect` request: `{ id, op:"connect", engine:"postgres"|"mysql", host, port, database, user, password, tls:"require"|"verify-full"|"disable", caFile?, statementTimeoutMs?, readOnly:boolean }`. Response: `{ sessionId, serverVersion, capabilities:{ readOnlyEnforced:true, cancel:true, transactions:true, cursor:true, multiStatement:false } }`.
  - `introspect {sessionId}` returns the TypeScript `SchemaTree` shape (`schemas[].tables[].columns[] {name,type,nullable,defaultValue,pk}`, `indexes: string[]`, `views`). Postgres excludes `pg_catalog`, `information_schema` and `pg_toast*`.
  - `execute {sessionId, tabId, sql, maxRows}` streams columns and rows, then sends the summary. `queryId` = request id.
  - `fetchMore {sessionId, tabId, n}` streams more rows from the tab's open cursor, else returns `bad-request` "No open cursor".
  - `cancel {queryId}` cancels a running execute.
  - `close {sessionId}` closes all tab connections.
  - `session.Guard(sql string) (blockedKeyword string)` is the read-only first-keyword guard: it skips whitespace and `--`/`/* */` comments; `WITH` is allowed.
  - `session.IsLoopback(host string) bool`.

**Rules:**
- Pool-free: one `*pgx.Conn` per (session, tab), dialed lazily on that tab's first execute. `connect` dials one probe connection, runs `SELECT version()`, and keeps it as the tab-less connection for `introspect`.
- Every connection is configured with `DefaultQueryExecMode = pgx.QueryExecModeExec`, a 10 s connect timeout, and `statement_timeout` when set.
- TLS: `disable` is refused for non-loopback hosts with code `tls-failed` and the Global Constraints copy. `require` sets `sslmode=require`. `verify-full` loads `caFile` if given and otherwise uses the system roots.
- Read-only: wrap as in Global Constraints. The guard runs before any wrapping.
- Results: request the text format for every column, then map with `values.FromPG(fieldDescription.DataTypeOID, …)`. `affected` comes from `CommandTag.RowsAffected()` for non-SELECT tags, else `null`. Server notices go into `notices` through `OnNotice`.
- Cursor: after `maxRows`, stop reading and keep `pgx.Rows` open on the tab (`hasMore` = another row exists). A new execute on that tab first closes the cursor (and rolls back read-only).
- Cancel: cancel the execute's context. pgx sends the protocol cancel request.
- Errors: map `*pgconn.PgError` to `{code:"syntax"|"server"|"read-only", sqlState: Code, position: Position-1 (0-based; omitted when 0), hint, detail}`. sqlState `25006` → `read-only`; `42601` → `syntax`; `28P01`/`28000` → `auth-failed`. Dial and TLS errors → `network` / `tls-failed`. A dead connection → `connection-lost`.
- `test-with-docker.sh` starts `postgres:16`, `mysql:8.4` and `edoburu/pgbouncer` (POOL_MODE=transaction) on random free ports, waits for health, exports the three DSNs, runs `go test ./...`, and removes the containers on exit (trap).

- [ ] **Step 1: Failing tests.**
  - **Guard** (unit): `"  -- c\nCOMMIT"` → `COMMIT`; `"/*x*/set x=1"` → `SET`; `"with a as (select 1) select * from a"` → `""`; `"select 1"` → `""`.
  - **IsLoopback** (unit): `localhost`, `127.0.0.5` and `::1` are true; `db.example.com` and `10.0.0.1` are false.
  - **Postgres integration** (skips when `XRAY_TEST_PG_DSN` is unset):
    - connect returns capabilities.
    - Introspect sees a fixture table `orders(id bigserial pk, total numeric, meta jsonb, photo bytea)`.
    - Execute `select * from orders` with maxRows 2 over 5 rows → 2 rows and `hasMore`; fetchMore 10 → 3 rows and no more.
    - Read-only `update orders set total=0` → `read-only` (25006); read-only `commit` → guard `read-only`.
    - Read-write insert → `affected 1`.
    - `select pg_sleep(30)` then cancel after 300 ms → `cancelled` in under 2 s, and the same tab then runs `select 1`.
    - `select repeat('x', 3000000)` → one cut cell, `truncatedCells 1`, every frame ≤ 1 MiB.
    - `select 1 frm` → `syntax` with position 9.
    - A wrong password → `auth-failed`, and the message does not contain the password.
    - `tls:"disable"` to `db.example.com` → `tls-failed` with the exact copy.
  - **PgBouncer** (skips without `XRAY_TEST_PGBOUNCER_DSN`): 20 sequential executes on one tab in read-only and read-write modes succeed (no prepared-statement errors), and read-only still refuses `update`.
- [ ] **Step 2:** Run `bash helper/scripts/test-with-docker.sh`. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4:** Run `bash helper/scripts/test-with-docker.sh`. Expected: PASS, and no container is left running (`docker ps` shows none from the script).
- [ ] **Step 5: Commit.** `feat(helper): Postgres driver with pooler-safe read-only, cursors and cancel`.

---

### Task 4: MySQL driver

**Files:** Create `helper/internal/my/{my.go,introspect.go,my_test.go}`. Modify `main.go` (engine switch).

**Interfaces:** the same ops and shapes as Task 3, with `engine:"mysql"`.

**Rules:**
- Driver: `go-sql-driver/mysql` with `multiStatements=false`, `parseTime=false`, `interpolateParams=false`, and a 10 s connect timeout.
- Connections: one `*sql.Conn` per (session, tab), from a `*sql.DB` capped at `SetMaxOpenConns(tabs+2)`.
- TLS: `tls=skip-verify` is NOT used. `require` uses a TLS config that requires encryption without CA verification (`InsecureSkipVerify` with ServerName set, matching libpq `require` semantics). `verify-full` uses system roots or the `caFile`. `disable` is loopback only.
- Read-only: wrap with `START TRANSACTION READ ONLY` … `ROLLBACK`. Same guard.
- Statement timeout: `SET SESSION max_execution_time=<ms>` at dial.
- Cancel: on a separate connection, `KILL QUERY <CONNECTION_ID of the tab conn>`.
- Introspect `information_schema`. Exclude `mysql`, `information_schema`, `performance_schema` and `sys`. Primary keys come from `COLUMN_KEY='PRI'`.
- Errors: `*mysql.MySQLError` 1064 → `syntax`, with the position derived from `near '…'` against the statement text. 1792 or 1290 (read-only) → `read-only`. 1045 → `auth-failed`.

- [ ] **Step 1: Failing integration tests** (skip without `XRAY_TEST_MYSQL_DSN`), mirroring Task 3:
  - fixture `orders(id bigint pk auto_increment, total decimal(10,2), meta json, photo blob)`, introspection, maxRows plus fetchMore
  - read-only refusal (update, then `commit` via the guard)
  - read-write affected count
  - `select sleep(30)` cancelled in under 2 s, with the tab reusable
  - a 3 MB `repeat('x', 3000000)` cut
  - `select 1 frm` → `syntax`
  - auth failure without echoing the password
  - BIGINT `9007199254740993` as a string
- [ ] **Step 2:** Run `bash helper/scripts/test-with-docker.sh`. Expected: FAIL (MySQL tests).
- [ ] **Step 3: Implement.**
- [ ] **Step 4:** Run `bash helper/scripts/test-with-docker.sh`. Expected: PASS.
- [ ] **Step 5: Commit.** `feat(helper): MySQL driver with read-only transactions and KILL QUERY cancel`.

---

### Task 5: Install scripts, extension key and permission

**Files:** Create `helper/install/{install.sh,uninstall.sh,install.ps1,uninstall.ps1}` and `helper/install/install.test.sh`. Modify `manifest.json` (`"key"`, `"optional_permissions": ["nativeMessaging"]`), `CONTRIBUTING.md` (a "Release: Web Store key" note), `test/manifest-packaging.test.js` (pins), and `scripts/package-extension.mjs` only if the zip should exclude `helper/` (it should: the allowList stays extension-only).

**Interfaces — Produces:**
- `XRAY_EXTENSION_ID` is a constant in both install scripts and in `src/panel/models/sqlProfiles.ts` (`HELPER_EXTENSION_ID`). A pinned test asserts all three equal the ID derived from the manifest key.
- Install sources:
  - `install.sh [--binary PATH] [--version helper-vX.Y.Z]`. With no `--binary`, it downloads `xray-db-helper-<os>-<arch>` and `SHA256SUMS` from the GitHub release for that version (default: latest `helper-v*`), verifies the checksum, and aborts on mismatch.
  - It installs to `~/.local/share/xray/xray-db-helper` on Linux and to `~/Library/Application Support/XRAY/xray-db-helper` on macOS.
- Host manifest: it writes `com.xray.db_helper.json` with `{ "name": "com.xray.db_helper", "description": "XRAY database helper", "path": <abs binary>, "type": "stdio", "allowed_origins": ["chrome-extension://<ID>/"] }` into every existing one of these, under `~/.config/` on Linux and `~/Library/Application Support/` on macOS:
  - `google-chrome/NativeMessagingHosts`
  - `chromium/NativeMessagingHosts`
  - `microsoft-edge/NativeMessagingHosts`
  - `BraveSoftware/Brave-Browser/NativeMessagingHosts`
- `install.ps1`: installs to `%LOCALAPPDATA%\XRAY\`, writes the manifest there, and sets `HKCU\Software\Google\Chrome\NativeMessagingHosts\com.xray.db_helper` and the Edge equivalent.
- Uninstall reverses this.
- Extension key: generate an RSA-2048 key once. Only the public key (base64 DER SPKI) goes into `manifest.json` `"key"`. **Never commit the private key**, because `*.pem` is forbidden. Unpacked builds don't need it.

- [ ] **Step 1: Failing tests.**
  - Pinned: the manifest has `key` and `optional_permissions` with exactly `["nativeMessaging"]`; `nativeMessaging` is not in `permissions`.
  - The ID derived from the key (sha256 of the DER, first 32 hex chars mapped 0-f→a-p) equals the scripts' and the model's constant.
  - The package allowList excludes `helper/`.
  - `install.test.sh`: it runs `install.sh --binary <dummy>` with `HOME` set to a temp dir in which `~/.config/chromium` exists. It asserts the manifest JSON, the path, the allowed origin, and the executable bit. Running `uninstall.sh` then removes both.
- [ ] **Step 2:** Run `node --test test/manifest-packaging.test.js && bash helper/install/install.test.sh`. Expected: FAIL.
- [ ] **Step 3: Implement.** Add `install.test.sh` to `helper.yml` (Linux).
- [ ] **Step 4:** Run the same commands, then `npm run check`. Expected: PASS.
- [ ] **Step 5: Commit.** `feat(helper): install scripts, a stable extension id and the optional nativeMessaging permission`.

---

### Task 6: Service-worker connection manager

**Files:** Create `background/sql-manager.js` (a classic script; defines `globalThis.XRAY_SqlManager = { createSqlManager }`, and `module.exports` when defined) and `test/unit/runtime/sql-manager.test.mjs`. Modify `background.js` (`importScripts('background/sql-manager.js')` at top, and an `onConnect` branch for port `xray-sql`) and `manifest.json` only if `importScripts` needs a path listed (it doesn't for the SW).

**Interfaces — Produces:**
- `createSqlManager(deps)`:
  - `deps = { storageLocal, storageSession, connectNative(name), permissionsContains(perm) → Promise<boolean>, now() }`.
  - Returns `{ handlePort(port) }`.
- `handlePort` accepts only ports whose `port.sender.url` parses to protocol `chrome-extension:` and pathname `/sql.html` (any host, because of use_dynamic_url) and whose `port.sender.id` equals the runtime id. Otherwise it disconnects them.
- Page→SW requests: `{ id, op, ... }`. Responses: `{ id, ok, value | error }`. Ops:
  - `profiles.list` → `PageProfile[]`, never with a password.
  - `profiles.save {profile: PageProfileInput & { password?: string, savePassword: boolean }}` → `PageProfile`. A password is stored in `sql_connections` when `savePassword`, else in `sql_session_secrets`. An omitted password keeps the existing one.
  - `profiles.delete {id}` removes the profile and both secrets.
  - `helper.status` → `{ state:"missing"|"no-permission"|"outdated"|"ready", helperVersion? }`.
  - `connect {profileId, readOnly}` → `{ sessionId, serverVersion, capabilities }`. When there is no stored secret → error `{ code:"auth-failed", message:"Enter the password for <name>." , detail:"password-required" }`.
  - `connect {profileId, readOnly, password, remember}` supplies a one-off password; `remember` decides local vs session storage.
  - `introspect {sessionId}`, `execute {sessionId, tabId, sql, maxRows}`, `fetchMore {sessionId, tabId, n}`, `cancel {queryId}`, `close {sessionId}`.
- Native side:
  - One `connectNative('com.xray.db_helper')` port, opened lazily and shared.
  - On open, it sends `hello`. `protocolVersion !== 1` → every pending call and later call gets `helper-outdated` ("Update the XRAY database helper.").
  - `chrome.runtime.lastError` "Specified native messaging host not found." → `helper-missing`.
  - A native disconnect rejects pending calls with `connection-lost`, and marks every session dead until reconnected.
- Chunk assembly: the SW collects `columns` and `rows` streams per request id and answers the page once with a full `QueryResult` (`columns, rows, rowCount, affected, durationMs, notices, hasMore, truncatedCells`). The page API stays promise-based (spec §2 amendment from M1).
- Request ids are remapped page id ↔ native id, so two pages can't collide.

- [ ] **Step 1: Failing unit tests** (a fake storage, a fake native port that scripts helper replies, and a fake page port):
  - A port from `https://evil.example/sql.html` is disconnected.
  - `profiles.save` with `savePassword:false` stores the secret in session storage only, and `profiles.list` never includes `password`.
  - `helper.status` reports `missing` when the native port disconnects with that lastError, and `no-permission` when `permissionsContains` is false.
  - `hello` version 2 → `outdated`.
  - Three row chunks assemble into one result in order.
  - A native disconnect mid-execute → `connection-lost`.
  - Two pages sending id 1 each get their own answers.
  - `connect` without a secret → `password-required`. With `password` and `remember:false` it succeeds, and session storage holds the secret.
- [ ] **Step 2:** Run `node --test test/unit/runtime/sql-manager.test.mjs`. Expected: FAIL.
- [ ] **Step 3: Implement.** Wire `background.js`. Add a pinned test that the `xray-sql` onConnect branch calls `handlePort` and that `background.js` imports no npm package.
- [ ] **Step 4:** Run the test, then `npm run check`. Expected: PASS.
- [ ] **Step 5: Commit.** `feat(sql): service-worker connection manager for the native helper`.

---

### Task 7: Profile model and RemoteClient

**Files:** Create `src/panel/models/sqlProfiles.ts`, `src/panel/runtime/remoteClient.ts`, `test/unit/sqlProfiles.test.mjs` and `test/unit/remoteClient.test.mjs`.

**Interfaces — Produces:**
- `type SqlEngine = 'postgres' | 'mysql'`.
- `interface PageProfile { id: string; name: string; engine: SqlEngine; host: string; port: number; database: string; user: string; tls: 'require' | 'verify-full' | 'disable'; caFile: string; statementTimeoutMs: number | null; readOnly: boolean; hasSavedPassword: boolean }`.
- `parseConnectionString(s: string): { profile: Omit<PageProfile,'id'|'name'|'hasSavedPassword'>; password: string } | { error: string }`.
  - It accepts `postgres://`, `postgresql://` and `mysql://`.
  - Userinfo and the path are percent-decoded.
  - Default ports are 5432 and 3306.
  - `sslmode`/`ssl-mode`: disable → `disable`; require, prefer and allow → `require`; verify-ca and verify-full → `verify-full`. With no sslmode it is `require`, or `disable` when the host is loopback.
  - The default name is `<database>@<host>`.
  - Errors: "Use a postgres:// or mysql:// connection string." and "The connection string has no host."
- `validateProfile(p): string | null` returns the first problem message: the host is required, the port must be 1–65535, or `disable` with a non-loopback host (the Global Constraints TLS copy).
- `isLoopbackHost(host): boolean` follows the same rule as the helper.
- `HELPER_EXTENSION_ID`.
- `helperInstallCommand(os: 'linux'|'mac'|'windows'): string`:
  - Linux and macOS: `curl -fsSL https://raw.githubusercontent.com/rahuldr07/xray-extension/main/helper/install/install.sh | sh`
  - Windows: `irm https://raw.githubusercontent.com/rahuldr07/xray-extension/main/helper/install/install.ps1 | iex`
- `createRemoteClient(connectPort: () => PortLike): RemoteApi`. `RemoteApi` provides:
  - `profiles.list()`, `profiles.save(input)`, `profiles.delete(id)` and `helperStatus()`
  - `connect(profileId, readOnly, password?, remember?) → Promise<RemoteSession>`
  - `RemoteSession extends SqlDriver`, with `dialect` from the engine and `capabilities` from the response
  - `execute(sql, opts, signal?)`, which takes an extra `tabId` through `opts` (`ExecuteOptions` gains an optional `tabId?: string`)
  - `fetchMore(tabId, n)`
  - Aborting the signal sends `cancel`.
- A port disconnect rejects pending calls with `connection-lost` and reconnects lazily on the next call.

- [ ] **Step 1: Failing tests.**
  - `postgres://us%40er:p%40ss%3Aw%2Fd@db.supabase.co:6543/postgres?sslmode=require` → user `us@er`, password `p@ss:w/d`, port 6543, tls `require`.
  - `mysql://root@localhost/shop` → tls `disable`, port 3306.
  - `postgresql://u@[::1]:5433/x` → host `::1`.
  - `http://x` → the error.
  - `validateProfile` with tls disable on `db.example.com` → the TLS copy.
  - The `RemoteClient` against a fake port: the execute request carries tabId and maxRows; abort sends `cancel` with the request id; a disconnect → `connection-lost`; `profiles.list` returns no `password` key even if the fake SW wrongly sent one (defence in depth: strip it).
- [ ] **Step 2:** Run `node --test test/unit/sqlProfiles.test.mjs test/unit/remoteClient.test.mjs`. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4:** Run the same command. Expected: PASS.
- [ ] **Step 5: Commit.** `feat(sql): connection-string parsing, profile validation and the remote client`.

---

### Task 8: Store support for remote connections

**Files:** Modify `src/panel/sqlStore.ts`, `src/panel/models/sqlHistory.ts` (`connectionKeyForProfile(id) → "remote:<id>"`), and the components that read `connection.name`/`size`.

**Interfaces:**
- **Consumes:** Task 7.
- **Produces:**
  - `SqlConnection` becomes `{ kind: 'sqlite'; name; size; readOnly; key } | { kind: 'remote'; profileId; name; engine: SqlEngine; host; database; readOnly; key; serverVersion }`.
  - New actions: `connectProfile(profileId: string, opts?: { password?: string; remember?: boolean }): Promise<void>`, `fetchMore(): Promise<void>` and `reconnect(): Promise<void>`.
  - Store fields: `profiles: PageProfile[]` and `helper: { state; helperVersion? }`.

**Rules:**
- The dialect for the editor, the classifier, `selectTableSql` and `toCompletionSchema` comes from the connection: sqlite, or the engine.
- Execute passes `tabId` = the active editor tab id.
- Save, the disk-behind state and recent files apply to sqlite only.
- Read-only toggling on a remote connection reconnects the session with the new mode (no data to discard). It's still the same switch.
- Run all continues to send one statement per execute.
- `hasMore` with `capabilities.cursor` shows "Fetch more" (Task 9). Fetched rows append to the result, keep the sort and filter, and update `rowCount`/`hasMore`.
- `connection-lost` marks the connection lost and shows Reconnect; the editor text is kept.
- The `password-required` error opens the password prompt state: `pendingPassword: { profileId, name } | null`.

- [ ] **Step 1: Failing tests.** A new `test/unit/sqlStoreRemote.test.mjs` drives the store with a stub `RemoteApi` injected through a new `__setRemoteApiForTests` export. It checks:
  - `connectProfile` sets a remote connection with dialect postgres.
  - An `update` on a read-only remote connection is refused before any call. That's the existing pre-check, now using the postgres dialect.
  - Execute sends tabId.
  - fetchMore appends rows.
  - connection-lost → Reconnect state.
  - password-required → `pendingPassword`.
- [ ] **Step 2:** Run `node --test test/unit/sqlStoreRemote.test.mjs`. Expected: FAIL.
- [ ] **Step 3: Implement.** Remove `src/panel/sqlStore.ts` from the coverage exclude only if this test makes it worthwhile; otherwise leave the exclude.
- [ ] **Step 4:** Run the test, `npm run check` and `node --test test/e2e/sql-client.e2e.mjs`. Expected: PASS (SQLite behaviour unchanged).
- [ ] **Step 5: Commit.** `feat(sql): store support for Postgres and MySQL connections`.

---

### Task 9: Connection UI

**Files:** Create `src/panel/components/sql/ConnectionDialog.tsx` and `src/panel/components/sql/HelperInstallCard.tsx`. Modify `SqlApp.tsx` (the source menu, welcome and header), `ResultsPane.tsx` (Fetch more), `src/panel/styles/sql.css`, and `test/e2e/sql-client.e2e.mjs` (UI checks against a fake native host, see below).

**Rules and copy:**
- **Welcome:** a second action next to "Open SQLite file", the button "Connect to a database" (secondary style). Below the recent files, a "Saved connections" list (name, engine and host). Clicking one connects.
- **Source menu:** sections "Files" (Open SQLite file…, recent files) and "Connections" (saved profiles, then "New connection…"). The header source shows `name · PostgreSQL 16.4 · db.supabase.co` for remote connections.
- **ConnectionDialog** (`ModalShell`, title "New connection" / "Edit connection"):
  - Fields: a "Connection string" paste box at the top. Paste and parse filling the fields below happens live, and parse errors show inline.
  - Then Name, Engine (PostgreSQL/MySQL), Host, Port, Database, User, Password, TLS (Require / Verify full / Disable — Disable is disabled for non-loopback hosts, with the copy as its hint), CA file path (shown for Verify full), Statement timeout (ms, optional), Read-only (switch, default on) and "Save password" (default on).
  - Buttons: "Test connection", "Cancel" and "Save & connect".
  - Test connection shows "Connected — PostgreSQL 16.4" or the normalized error message.
- **Permission:** on Test or Save & connect, if `helperStatus` is `no-permission`, call `chrome.permissions.request({ permissions: ['nativeMessaging'] })` inside the click handler. Denied → the inline message "XRAY needs permission to talk to the database helper."
  - Put the decision in `ensureHelperPermission(status, request: () => Promise<boolean>): Promise<'ready' | 'denied' | 'missing'>` in `src/panel/models/sqlProfiles.ts`. Unit-test it with a stubbed `request` (granted, denied, and status already `ready`, which never calls `request`).
- **HelperInstallCard:** shown in the dialog and on the welcome screen when the helper status is `missing` or `outdated`.
  - Title: "Install the XRAY database helper" or "Update the XRAY database helper".
  - Text: "Postgres and MySQL need a small helper app on this computer. Run this once in a terminal, then click Retry."
  - The OS-specific command from `helperInstallCommand` (detect via `navigator.userAgentData?.platform ?? navigator.platform`) in a copyable code block with a "Copy" button.
  - A link "What does it install?" to `https://github.com/rahuldr07/xray-extension/tree/main/helper#readme`, and a "Retry" button.
- **Password prompt:** when `pendingPassword` is set, a small `ModalShell` "Password for <name>" with a password field, a "Remember on this computer" checkbox (default off) and "Connect".
- **Fetch more:** in the Results toolbar, when `hasMore && capabilities.cursor`, a "Fetch more" button (1,000 rows) replaces "Run with higher limit".
- **Connection lost:** a banner in the results area, "Connection lost.", with a "Reconnect" button.
- **Editing:** profiles can be edited and deleted from the source menu (a "…" per profile: Edit, Delete, with a confirm for Delete).
- **e2e (this task):** a **fake native host**, `test/fixtures/fake-helper.mjs`: a Node script with a `#!/usr/bin/env node` shebang, marked executable, that speaks the Task 1 protocol and answers from a scripted fixture (one `public.orders` table, 25 rows, cursor support). The e2e registers it the same way Task 10 registers the real helper, so the real service-worker code runs. Put the registration code in `test/helpers/nativeHost.mjs` for Task 10 to reuse: a temp user-data-dir with `NativeMessagingHosts/com.xray.db_helper.json`, and a temp extension copy with `nativeMessaging` moved into `permissions`. "Helper missing" means no manifest is written. It covers:
  - the dialog: paste the Supabase-style string and check the fields
  - helper missing → the install card shows the Linux command
  - a saved connection appears in the source menu and on the welcome screen
  - the password prompt appears for a profile without a saved password
  - Fetch more appends rows

- [ ] **Step 1: Write the failing e2e tests.** Run `npm run build && node --test test/e2e/sql-client.e2e.mjs`. Expected: the new tests FAIL.
- [ ] **Step 2: Implement.**
- [ ] **Step 3:** Run `npm run build && node --test test/e2e/sql-client.e2e.mjs && npm run check && node scripts/check-dist-sync.mjs`. Expected: PASS.
- [ ] **Step 4: Screenshots** (throwaway script in the session scratchpad, as in M1, using `headless:false` + `--headless=new`): the dialog with a parsed string, the install card, and a Postgres result. Look at them yourself.
- [ ] **Step 5: Commit** with dist/: `feat(sql): connection dialog, helper install card and saved connections`.

---

### Task 10: Real end-to-end, threat model and docs

**Files:** Create `test/e2e/sql-remote.e2e.mjs`. Modify `docs/threat-model.md` (a new section "Database connections and the native helper", plus a permission-table row for `nativeMessaging`), `docs/architecture.md` (the helper and the port flow), `.github/workflows/ci.yml` (a job `e2e-remote`: Ubuntu, Go 1.27, services `postgres:16` and `mysql:8.4`, builds the helper and runs the new e2e), and `helper/README.md` (what it installs, where, how to uninstall, the protocol summary).

**Rules:**
- The e2e builds the helper (`go build -o <tmp>/xray-db-helper ./helper/cmd/xray-db-helper`) and registers it with `test/helpers/nativeHost.mjs` (from Task 9).
- It creates a temp user-data-dir and writes `<user-data-dir>/NativeMessagingHosts/com.xray.db_helper.json` pointing at the binary, with the extension's fixed ID. Chrome on Linux reads host manifests from the profile directory; verify, and if this Chromium build doesn't, fall back to `XDG_CONFIG_HOME=<tmp>` with `<tmp>/chromium/NativeMessagingHosts` and say so in the report.
- Permission: Playwright cannot click Chrome's permission prompt, so the e2e loads a temp copy of the extension whose manifest moves `nativeMessaging` from `optional_permissions` to `permissions`. The `chrome.permissions.request` call itself is covered by a unit test with a stubbed `chrome.permissions` in Task 9. Record this in the test header.
- The e2e skips when `XRAY_E2E_PG_DSN` / `XRAY_E2E_MYSQL_DSN` are unset. Locally they come from `helper/scripts/test-with-docker.sh --e2e`, which runs `npm run build && node --test test/e2e/sql-remote.e2e.mjs` with the containers up.
- Threat model content:
  - assets: database passwords and query results
  - storage: local vs session storage, and the not-encrypted sentence verbatim
  - only the SW reads secrets; the port sender check
  - the helper boundary: `allowed_origins`, only fixed operations, unknown-field rejection, no logging of secrets or SQL
  - TLS rules; read-only enforced by read-only transactions, with the guard
  - results are never sent to AI or exports
  - residual risks: a local process could also launch the helper, but it would hold no credentials; side-effect functions inside a read-only transaction are still blocked by the database

- [ ] **Step 1: Write `sql-remote.e2e.mjs`** with:
  1. Connect to Postgres from the dialog by pasting the DSN; the rail lists the fixture schema; a table preview shows rows, and int8 is exact.
  2. Read-only `update` is refused (pre-check), and read-only `select set_config('x','y',false)` runs, but `commit;` is refused by the guard with `read-only`.
  3. Turn read-only off: an `insert` then a `select count(*)` shows the row.
  4. `select pg_sleep(30)`, then Stop in under 2 s, then `select 1` works.
  5. `maxRows` 10 over 25 rows → Fetch more → 20, then 25 rows.
  6. MySQL: connect, preview, and BIGINT exact.
  7. Kill the helper process (`pkill -f xray-db-helper` scoped to the temp path) mid-query → "Connection lost." → Reconnect works.
  8. A wrong password shows `auth-failed` and the prompt; the password never appears in any page text or console message.
- [ ] **Step 2:** Run `bash helper/scripts/test-with-docker.sh --e2e`. Expected: FAIL before the docs/CI wiring only if something is missing. Otherwise PASS. Fix until all 8 pass.
- [ ] **Step 3: Write the threat-model and architecture sections, and the CI job.**
- [ ] **Step 4:** Run `npm run check`, `node --test test/e2e/sql-client.e2e.mjs`, `bash helper/scripts/test-with-docker.sh --e2e` and `node scripts/check-dist-sync.mjs`. Expected: all PASS.
- [ ] **Step 5: Commit.** `test(sql): real Postgres and MySQL end-to-end through the helper; document the trust boundary`.
