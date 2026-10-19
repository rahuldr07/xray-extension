# SQL client — design

Requested 2026-10-19 ("keep the sql run also they can connect their database", then "i need native sql
client in extension"). Scope agreed in chat: a real SQL client inside XRAY that connects to the user's
own Postgres/MySQL (any host), cloud HTTP databases and local SQLite files. SQL over captured traffic
was discussed and set aside for a later spec. The design was approved in chat on 2026-10-19 after a
self-critique pass; this spec is the authority for the plan.

## Purpose

A developer debugging their app in XRAY can open their database next to the captured traffic: pick a
saved connection, browse schemas, write SQL with schema-aware completion, run it, and read or copy the
results. Success: in each of the three driver families a user can connect, browse a table, run a
query, stop a long one and copy the result. Read-only connections cannot write. No website ever
receives the client's code, credentials or result rows.

## Principles

- **Nothing on the page.** `dist/panel-ui.js` and `dist/hud-ui.js` are injected into every site and
  gain nothing from this feature. The client lives in its own extension page and bundle. DB rows
  never render in a website's DOM.
- **The layer that can enforce a rule owns it.** Read-only is a database session setting, not a UI
  flag. Credentials are read only by the service worker.
- **Say what a driver cannot do.** Each driver reports capabilities. The UI adapts and explains, and
  it never silently degrades (e.g. no fake `BEGIN` on a stateless HTTP driver).
- **No network listener.** Postgres/MySQL go through Chrome Native Messaging, never a localhost port.
- **The runtime stays dependency-free.** New npm dependencies live only in `dist/sql-ui.js`.

## 1. Surfaces and UI

- **Page and bundle.**
  - New page `sql.html` (repo root, next to `window.html`). It loads `dist/sql-ui.js`, built from
    `src/panel/sql-main.tsx` as a third esbuild IIFE entry in `vite.config` (`globalName: 'XRAYSqlUI'`).
  - It reuses the panel's React components, `--xray-*` tokens, themes and fonts. Theme and accent are
    read from panel settings in `chrome.storage`.
- **Where it appears.**
  - DevTools panel and pop-out window: a new top-level **SQL** tab (`ActiveTab` gains `'sql'`) that
    renders an `<iframe src="sql.html">`.
  - In-page HUD: the SQL tab is a button that opens `sql.html` in its own popup window, via the same
    path as the existing pop-out. Nothing SQL-related renders in the HUD.
  - `sql.html` opened directly is a full-window client.
- **Layout.**
  - **Left rail:** connection switcher with status dot, and a schema tree (schema → tables / views →
    columns with type, PK and nullable markers). Clicking a table opens a new editor tab with
    `SELECT * FROM <qualified name> LIMIT 100`.
  - **Editor:** CodeMirror 6 with `@codemirror/lang-sql`, using the dialect for the active driver
    (PostgreSQL, MySQL, SQLite). Schema-aware completion is fed from introspection. Multiple editor
    tabs; each tab's text is persisted per connection.
    - Run (Ctrl/Cmd+Enter) runs the selection if there is one, else the statement under the cursor,
      found from the lang-sql parse tree.
    - Run all (Ctrl/Cmd+Shift+Enter) runs every statement in order and stops at the first error.
    - Stop cancels.
  - **Bottom pane:** Results | Messages | History.
    - Results is a grid virtualized on both axes (`@tanstack/react-virtual`). JSON/JSONB cells open in
      the existing `JsonView`. Copy selection or all as CSV, JSON or `INSERT` statements.
    - Messages shows row counts, durations, server notices and errors.
    - History shows the last 200 statements per connection (text, time, duration, rows, ok/error),
      stored in `chrome.storage.local`. Rows are never stored.
  - **Connection dialog:** fields depend on the driver.
    - Postgres/MySQL: host, port, database, user, password, TLS mode, optional CA file.
    - HTTP providers: endpoint URL and token.
    - SQLite: file picker.
    - Always: name, read-only toggle (default on), "Don't save password", optional statement timeout.
    - Test connection runs `connect` + `SELECT 1` and reports the server version.
- **Confirmations:** `sql.html` has its own store, so it uses its own `ModalShell` confirmation dialog
  in the same style as the panel's `ConfirmationRequest`.
- **Not in v1:** inline cell editing, ER diagrams, query-plan visualiser, import wizards, sending
  results to AI, and "look up this captured response in the DB". The last one is the intended v2: the
  panel will message the service worker's connection manager. Section 2 keeps that seam open.

## 2. Drivers and data flow

```
sql.html ──runtime port "xray-sql"──► service worker: connection manager (reads secrets)
   │                                     ├─ HTTP driver   → Neon / Supabase / Turso / PlanetScale / D1
   └─ Worker: SQLite-WASM                └─ Native driver → xray-db-helper → Postgres / MySQL
```

- **Driver interface.** Defined in `src/panel/models/sqlDriver.ts` as types only; logic stays pure.
  - `connect(profile)` → `{ sessionId, serverVersion, capabilities }`.
  - `capabilities`: `{ readOnlyEnforced, cancel, transactions, cursor, multiStatement }`.
  - `introspect(sessionId)` → schemas, tables, views, columns (name, type, nullable, default, pk),
    indexes.
  - `execute(sessionId, tabId, sql, { maxRows })` streams messages: `columns` → `rows` chunks →
    `done { rowCount, affected, durationMs, notices, hasMore }` or `error`.
  - Also `fetchMore(queryId, n)`, `cancel(queryId)` and `close(sessionId)`.
- **Transport.**
  - `sql.html` talks to the service worker over one long-lived `chrome.runtime.connect({ name:
    'xray-sql' })` port. An open port keeps the service worker alive while the client is open.
  - The page sends profile IDs and SQL, never secrets.
  - The SQLite driver does not go through the service worker (it cannot create Workers). It runs in a
    dedicated Worker spawned by `sql.html`. A page-side `DriverClient` routes calls to the right
    backend, so the UI sees one interface.
- **SQLite.**
  - Engine: official `@sqlite.org/sqlite-wasm`. The `.wasm` file ships in `dist/` and is fetched from
    the extension origin, never a CDN.
  - The user picks a file through `showOpenFilePicker`. It is read into an in-memory database, opened
    read-only by default.
  - When read-only is off, edits stay in memory until **Save** writes back through the file handle
    (asking for write permission then).
  - `cancel` terminates and restarts the Worker. If there are unsaved changes, the user confirms first.
  - No OPFS and no COOP/COEP.
- **HTTP providers.**
  - Each provider is a small adapter in `background.js` behind the same interface: Neon serverless
    HTTP, Supabase (Management API `POST /v1/projects/{ref}/database/query` with a personal access
    token; the project API keys cannot run arbitrary SQL), Turso/libSQL (`/v2/pipeline`), PlanetScale
    (the HTTP API `@planetscale/database-js` uses), Cloudflare D1 (REST API with an API token).
  - These are stateless, so they report `transactions: false` and `cursor: false`. The editor refuses
    `BEGIN` with an explanation.
  - `cancel` aborts the `fetch`. The UI notes that the server may still finish the statement.
  - `host_permissions` already covers `<all_urls>`, so nothing is added there.
- **Native (Postgres/MySQL).**
  - The service worker holds one `connectNative` port to the helper. The helper keeps one dedicated
    DB connection per editor tab, so `BEGIN … COMMIT` and session settings behave as in any client.
  - `cancel`: Postgres cancels via pgx context (cancel request); MySQL issues `KILL QUERY` on a side
    connection.
  - The helper keeps results open as a cursor, so `hasMore` + `fetchMore` work.
- **Values.**
  - Results are JSON, with no precision loss:
    - int8/numeric/decimal/MySQL BIGINT and DECIMAL are strings, rendered right-aligned as numbers
    - dates/times keep the server's text
    - bytea/blob become `{ hex, length }`, with the hex preview cut at 256 bytes
    - JSON/JSONB stay text, rendered through the lossless JSON path (`JsonView`)
  - Each column carries its declared type name, so the grid can align and format.
- **Limits.**
  - Default `maxRows` is 1,000, adjustable per tab up to 50,000. Fetch more is offered where
    `cursor`; HTTP drivers offer "Run with higher limit".
  - The helper truncates any single cell over 1 MB and marks it. The grid shows the first 64 KB of a
    cell, with an indicator.
  - Connect timeout is 10 s. There is no default query timeout, but Stop always works, and an optional
    per-connection `statement_timeout` (Postgres) / `max_execution_time` (MySQL) can be set.

## 3. Security

A new section in `docs/threat-model.md` covers stored DB credentials, the helper trust boundary and DB
data rendering, and lists `nativeMessaging` in the permission justification table.

- **Credentials.**
  - Profiles are stored in `chrome.storage.local` under `sql_connections`, secrets included. They are
    never in `chrome.storage.sync`.
  - Only the service worker reads secrets. `sql.html` refers to profiles by ID (same rule as C-12).
  - With **Don't save password**, the secret is kept only in `chrome.storage.session` (cleared when the
    browser closes) and asked for again after that.
  - The spec states plainly that stored secrets are not encrypted at rest. Encryption without a user
    passphrase would be theatre; a passphrase vault is a possible later addition.
- **Read-only, enforced by the database.** Default on for every new connection.
  - Postgres: `SET SESSION default_transaction_read_only = on`
  - MySQL: `SET SESSION TRANSACTION READ ONLY`
  - SQLite: opened read-only
  - HTTP providers cannot enforce it, so `readOnlyEnforced: false`, and the UI labels read-only there
    as "advisory: statements are checked, not blocked by the server". The client-side check refuses
    statements the classifier marks as writes.
- **Dangerous-statement confirmation.** Always on, read-only or not.
  - Covers `DROP`, `TRUNCATE`, `ALTER`, `GRANT`/`REVOKE`, and `DELETE`/`UPDATE` without `WHERE`.
  - The classifier (`src/panel/models/sqlClassify.ts`) works on the lang-sql parse tree, not regexes.
    When it can't parse a statement, it treats it as dangerous.
- **Permissions and CSP.**
  - `nativeMessaging` goes in `optional_permissions` and is requested when the user adds the first
    Postgres/MySQL connection. If Chrome rejects it as optional, M3 falls back to a required permission
    and records why in the threat model.
  - `'wasm-unsafe-eval'` is added to `content_security_policy.extension_pages` `script-src` for
    SQLite-WASM. Content scripts and websites are unaffected.
- **Helper boundary.**
  - Only XRAY's extension ID (host manifest `allowed_origins`) can launch the helper.
  - It accepts only the fixed operations in section 4 and rejects unknown fields.
  - It never writes credentials, SQL or rows to disk or logs; stderr carries only error codes.
  - TLS: `require` for every non-loopback host, `disable` allowed only for loopback, plus
    `verify-full` with an optional CA file.
- **Rendering and egress.**
  - DB values render only through React text nodes and `JsonView`, never raw HTML.
  - Results are never sent to the AI feature or included in session exports in v1.

## 4. The helper: `xray-db-helper`

- **Code and build.**
  - Lives in `helper/` in this repo (`go.mod`, `cmd/xray-db-helper`, `internal/...`).
  - Go 1.23+, `github.com/jackc/pgx/v5`, `github.com/go-sql-driver/mysql`. One static binary.
  - Cross-compiled for linux, darwin and windows on amd64 and arm64.
- **Protocol.** Native Messaging frames (4-byte native-endian length + UTF-8 JSON).
  - The first exchange is `hello { protocolVersion: 1 }` → `{ protocolVersion, helperVersion }`. A
    mismatch shows "update the helper" with the install command.
  - Operations: `connect`, `introspect`, `execute`, `fetchMore`, `cancel`, `close`, `ping`. Every
    request has an `id`, and responses and stream messages echo it.
  - Chrome caps host → extension messages at 1 MB, so the helper sends `rows` chunks of at most 512 KB
    of serialized JSON. A row that alone exceeds that is already bounded by the 1 MB cell truncation,
    and if still too large it is sent as a single-row chunk with its largest cells truncated further.
- **Install.**
  - `helper/install/install.sh` (Linux, macOS) and `helper/install/install.ps1` (Windows) place the
    binary in a user-local directory. They then write the host manifest `com.xray.db_helper.json`
    with `path` and `allowed_origins: ["chrome-extension://<XRAY ID>/"]`:
    - Linux: `~/.config/google-chrome`, `~/.config/chromium` and `~/.config/microsoft-edge`, each
      under `NativeMessagingHosts/`
    - macOS: the matching folders under `~/Library/Application Support/…/NativeMessagingHosts/`
    - Windows: `HKCU\Software\Google\Chrome\NativeMessagingHosts\…` and the Edge equivalent
  - Uninstall scripts reverse this.
  - Binaries are published on GitHub Releases with SHA-256 checksums. They are unsigned at first, so
    users will see Gatekeeper/SmartScreen warnings until code signing is set up.
- **Missing or broken helper.** If `connectNative` reports the host is not found or exits, the dialog
  shows an install card with the command for the detected OS and a Retry button.
- **Stable extension ID.**
  - `manifest.json` gains a `"key"` so unpacked builds have a fixed ID that the host manifest can pin.
  - The Web Store build must use the store item's public key in that slot. This is a release
    checklist step in `CONTRIBUTING.md`.
- **CI.**
  - A separate workflow job: `go vet`, `go test` against Postgres 16 and MySQL 8 service containers,
    and cross-compile.
  - `npm run check` stays Node-only. Contributors without Go can build everything except the helper.

## 5. Errors

- Every driver error is normalized to `{ code, message, sqlState?, position?, hint?, detail? }`.
- Codes: `helper-missing`, `helper-outdated`, `auth-failed`, `tls-failed`, `network`, `timeout`,
  `cancelled`, `read-only`, `syntax`, `server`, `connection-lost`, `limit-reached`.
- A Postgres `position` (or a MySQL "near '…'" match) underlines that spot in the editor.
- `connection-lost` marks the connection red and offers Reconnect. The editor text is kept, and a
  transaction that was open is reported as rolled back.

## 6. Testing

- **Unit (`test/unit/`, executing code; counts toward the 95/88/95 `src/panel` gate):**
  - statement splitter and statement-under-cursor, per dialect (Postgres `$$` bodies, `;` in strings
    and comments, MySQL backticks)
  - dangerous-statement classifier, including the "unparseable → dangerous" rule
  - value formatting (bigint and numeric strings, bytea, JSON)
  - profile validation and secret stripping (the page-side profile never has a password)
  - introspection mapping for each dialect
  - HTTP adapters against a fake `fetch`
  - SQLite driver against the real WASM in Node
  - error normalization
- **Pinned source tests (`test/*.test.js`):** the manifest CSP and the optional `nativeMessaging`;
  the HUD bundle does not contain the SQL workspace; `sql.html` loads only extension-origin scripts.
- **Helper (Go):** framing, including chunking past 1 MB; hello/version mismatch; read-only enforcement
  on both engines; cancel; unknown-operation rejection; no secrets in stderr.
- **End-to-end (Playwright, `test/e2e/sql-client.e2e.mjs`):**
  - open `sql.html`, load a fixture `.sqlite`, browse a table, run a query, check the grid rows
  - an `UPDATE` on a read-only connection is blocked
  - `DROP` asks for confirmation
  - Stop cancels a long query
  - Linux CI only: register a dev helper and run a real Postgres query end to end

## Milestones

1. **M1: client on SQLite.**
   - `sql.html` and `sql-ui.js` entry, SQL tab and iframe in DevTools/pop-out, HUD opens a window.
   - CodeMirror editor, schema tree, grid, Messages and History.
   - Statement splitter, classifier, read-only and confirmations; SQLite driver.
2. **M2: cloud HTTP databases.** Connection manager in the service worker, the `xray-sql` port,
   credential storage and "Don't save password", the five HTTP adapters, the threat-model section.
3. **M3: Postgres and MySQL.**
   - Go helper, protocol and CI job; install/uninstall scripts.
   - Manifest `key` and optional `nativeMessaging`; native driver; release pipeline for binaries.

## New dependencies

Bundled into `dist/sql-ui.js` only, never into the runtime or the injected bundles:

- `@codemirror/state`, `@codemirror/view`, `@codemirror/language`, `@codemirror/commands`,
  `@codemirror/autocomplete`, `@codemirror/lang-sql`
- `@sqlite.org/sqlite-wasm`

Helper only: `pgx/v5`, `go-sql-driver/mysql`.
