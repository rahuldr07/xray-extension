# xray-db-helper

Native-messaging host that lets the XRAY extension query Postgres and MySQL.

Chrome extensions cannot open TCP connections, so the SQL client's Postgres and MySQL support goes
through this small Go program. Chrome starts it on demand when the SQL page needs a database and
talks to it over stdin/stdout. It never listens on a port.

## What it installs, and where

The installer downloads the release binary for your OS and architecture from this repository's
GitHub releases (`helper-v*` tags). It checks the binary against the release's `SHA256SUMS` and
refuses to install on a mismatch. Then it writes two things:

| OS | Binary | Host manifest `com.xray.db_helper.json` |
|---|---|---|
| Linux | `~/.local/share/xray/xray-db-helper` | `~/.config/<browser>/NativeMessagingHosts/` for `google-chrome`, `chromium`, `microsoft-edge`, `BraveSoftware/Brave-Browser` |
| macOS | `~/Library/Application Support/XRAY/xray-db-helper` | `~/Library/Application Support/<browser>/NativeMessagingHosts/` for `Google/Chrome`, `Chromium`, `Microsoft Edge`, `BraveSoftware/Brave-Browser` |
| Windows | `%LOCALAPPDATA%\XRAY\xray-db-helper.exe` | `%LOCALAPPDATA%\XRAY\com.xray.db_helper.json`, registered under `HKCU\Software\{Google\Chrome,Microsoft\Edge}\NativeMessagingHosts\com.xray.db_helper` |

Everything is per-user, so no administrator rights are needed. The manifest's `allowed_origins`
lists only the XRAY extension (`chrome-extension://kjfoocnkoajdcjabnadfojdfaghpbeep/`), so Chrome
starts the helper for XRAY and for no other extension or web page.

    # Linux and macOS
    curl -fsSL https://raw.githubusercontent.com/rahuldr07/xray-extension/main/helper/install/install.sh | bash
    # Windows (PowerShell): downloads install.ps1 from the raw GitHub URL and runs it
    irm https://raw.githubusercontent.com/rahuldr07/xray-extension/main/helper/install/install.ps1 | iex

## Uninstall

Run `install/uninstall.sh` (Linux, macOS) or `install/uninstall.ps1` (Windows). It removes the
binary and every host manifest or registry key the installer wrote. Saved connections stay in the
extension until you delete them there, or remove the extension.

## Protocol summary

- **Framing.** Chrome native messaging: a 4-byte length in native byte order, then that many bytes
  of UTF-8 JSON. Incoming frames are capped at 64 MiB. Outgoing messages stay under Chrome's 1 MB
  limit, so result rows are sent in `rows` chunks of at most 524,288 bytes.
- **Requests** are `{ "id": <n>, "op": <name>, ... }`. Decoding is strict: an unknown op or an
  unknown field is refused with `bad-request`. The fixed ops are:
  - `hello` may carry the extension's `protocolVersion` and returns the helper's `protocolVersion`
    (1) and `helperVersion`. `ping` answers with an empty value.
  - `connect` takes engine, host, port, database, user, password, tls, caFile,
    statementTimeoutMs and readOnly. It returns `sessionId`, `serverVersion` and `capabilities`.
  - `introspect` returns schemas, tables, views, columns and indexes.
  - `execute` takes sessionId, tabId, sql and maxRows, and runs one statement.
  - `fetchMore` takes sessionId, tabId and n, and reads more rows from the tab's open cursor. A
    cursor left unread for 60 s is closed (ending its read-only transaction); fetchMore then
    answers "Cursor expired, run the query again."
  - `cancel` takes the queryId of a running request. A cancel that arrives first is remembered,
    and the request is cancelled as soon as it starts.
  - `closeTab` takes sessionId and tabId, and closes that tab's cursor and connection. The server
    rolls back a transaction left open on it.
  - `close` ends a session.
- **Summaries.** `execute` and `fetchMore` answer with rowCount, affected, durationMs, notices,
  hasMore, truncatedCells and `inTransaction`: whether the tab's connection is inside a
  transaction the user opened (never the read-only wrapper; on MySQL this includes autocommit
  off). Errors from execute and fetchMore carry `inTransaction` too. Closing the session or the tab rolls
  that transaction back. A COMMIT of a failed transaction is an error, not a success, and so is
  the first statement after a tab's connection was lost inside a transaction.
- **Responses.** Each request ends with exactly one final message: `{ "id", "ok": true, "value" }`
  or `{ "id", "ok": false, "error": { "code", "message", ... } }`. Before the final message, an
  `execute` or `fetchMore` streams one `columns` message and then any number of `rows` messages,
  all with the request's id.
- **Error codes:** `bad-request`, `internal`, `auth-failed`, `tls-failed`, `network`, `timeout`,
  `cancelled`, `read-only`, `syntax`, `server`, `connection-lost`, `limit-reached`.
- **TLS** is `require` (default), `verify-full` (optional CA file) or `disable`. `disable` is
  accepted only for loopback hosts (`localhost`, `127.0.0.0/8`, `::1`).
- **Read-only** (the default) runs each statement inside a read-only transaction that is rolled
  back. A keyword guard refuses statements that could end or change that transaction. MySQL also
  sets `transaction_read_only` for the session and refuses `CALL`, `KILL`, executable comments and
  `INTO OUTFILE`/`INTO DUMPFILE`. This protects against accidents, not against a hostile user. See
  [docs/threat-model.md](../docs/threat-model.md#6-database-connections-and-the-native-helper).
- **Logging.** stderr carries only error codes, never passwords, SQL or results.

Values are lossless JSON: int8, numeric and decimal (and MySQL BIGINT and DECIMAL) are strings,
and binary values become `{ "hex", "length" }`.

## Development

    go vet ./...
    go test ./...
    bash scripts/test-with-docker.sh         # Go tests against Postgres 16, MySQL 8.4, PgBouncer in Docker
    bash scripts/test-with-docker.sh --e2e   # the extension's real end-to-end test (test/e2e/sql-remote.e2e.mjs)
    CGO_ENABLED=0 go build -ldflags "-s -w -X main.version=0.0.0-dev" -o xray-db-helper ./cmd/xray-db-helper
