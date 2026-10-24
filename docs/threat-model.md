# XRAY threat model

Status: **draft, findings open.** Produced from a source review of v0.3.0. Nothing here
has been confirmed against a live browser except where noted; items marked *unverified*
need empirical confirmation before anyone acts on them.

This document exists so the findings are not lost. Several are architectural and remain
**open** — see [Open findings](#open-findings). It is not a claim that the extension is
secure.

---

## 1. What the extension is, in security terms

XRAY injects content scripts into **every frame of every URL** (`<all_urls>`), at
`document_start`, into **both the MAIN and ISOLATED worlds**. It captures fetch, XHR,
WebSocket, EventSource and GraphQL traffic, retains request/response bodies, decodes JWTs,
replays requests with restored credentials, and can send captured traffic to a third-party
LLM.

That makes it, by design, a tool that aggregates high-value secrets from every site the
user visits and concentrates them in one place.

### Trust boundaries

| Boundary | Trustworthy? | Notes |
|---|---|---|
| Page ↔ **MAIN world** | **No — same realm** | MAIN-world scripts share the page's global scope. Nothing stored on `window` is secret from the page, and anything on `window` can be replaced by the page. |
| MAIN world ↔ **ISOLATED world** | Partially | Separate globals; the page cannot read isolated-world variables. But the only channel between them is `window.postMessage`, which the page can also read and write. |
| ISOLATED world ↔ **service worker** | Yes | `chrome.runtime` messaging is not reachable from web pages — there is no `externally_connectable` in the manifest (confirmed). |
| Extension pages (DevTools panel, pop-out) | Yes | Extension origin, `chrome.storage` access. |

**The single most important point:** the MAIN world is not a security boundary. Several
controls in this codebase — the bridge token, the console session nonce, the decrypt hook —
are implemented as though it were.

### Assets

- Captured request/response bodies (up to 250 000 chars each), retained across origins.
- `Authorization`, `x-api-key` and similar headers, retained in a MAIN-world `_secretStore`
  (`content/interceptor.js:154`, capped at 300 entries) to support replay.
- Experiment plans persist a sanitized request body, but a run on the captured origin replays the
  captured request body itself: fields the plan shows as `[REDACTED]` go out with their real values
  (to that origin only — a retargeted run sends the sanitized plan).
- The `x-parse-token` header, which the extension treats as a decryption key and currently
  **exports to the panel** as `entry.parseToken`.
- Decoded JWT claims (`sub`, `email`, `tenant`, `scope`, …), extracted pre-redaction by
  design.
- The user's BYOK LLM API key.

---

## 2. What is solid

Worth stating plainly, because it is the strongest part of the codebase and should not
regress.

- **No injection sinks in first-party source.** A sweep for `innerHTML`, `outerHTML`,
  `insertAdjacentHTML`, `document.write`, `dangerouslySetInnerHTML`, `eval`, `new Function`,
  `createContextualFragment`, `srcdoc` and `javascript:` across `src/`, `content/`,
  `shared/`, `panel/`, `workers/`, `settings/`, `devtools/`, `background.js` and `window.html`
  found exactly one hit: `content/console-executor.js:130`, which is the console feature
  itself operating on user-typed code. Captured response bodies — attacker-controlled by
  definition — are rendered exclusively through React children and `textContent`.
- **The extension CSP has no `unsafe-eval`.** Its only `'wasm-unsafe-eval'` is scoped to
  extension pages, for SQLite-WASM on `sql.html` (see §5).
- **No `externally_connectable`**, so web pages cannot message the service worker directly.
- **Theme values reaching `style.setProperty` are strictly hex-validated**
  (`src/panel/models/customTheme.ts:34-50`). Checked specifically for `url()`-based CSS
  exfiltration; the validation holds.
- **`xray:console-eval` pins the target to `sender.tab.id`** rather than trusting a
  caller-supplied tab id (`background.js:536`).
- **`_buildConsoleExpression` string-building is not injectable.** The context arrives from
  the panel as tagged JSON *text* (`panel/console.js` `_contextPayload`, spec J8) and is
  inlined only as a JSON **string literal** that the inlined helper parses in the page
  (`reviveContext`): context data is never interpolated as JS, nor as an object literal
  (whose `"__proto__":` set a prototype instead of a key). Identifier names are filtered by
  `VALID_CONSOLE_NAME`. Results come back the same way: typed JSON text from the inlined
  `encodeResult`, parsed by the engine with `JSON.parse` into data the panel renders as text.
  What enters the page is unchanged by this: the same context the user's command runs
  against, revived during the evaluation the user started. A page that has patched built-ins
  (`JSON.parse`, `Array.prototype` methods) could observe it during that evaluation — it could
  before too, through the runtime's own calls on the context — or corrupt the result text,
  which the engine then reports as unreadable; neither reaches extension privileges.
- **A real regression suite pins several of these invariants**, including the
  no-`dangerouslySetInnerHTML` property.

---

## 3. Fixed in this branch

| ID | Issue | Fix |
|---|---|---|
| C-13 | `__xray_fetch_object__` listener in `content/console-capture.js` omitted the `event.source !== window` guard that every other listener has | Guard added, plus a regression assertion |
| C-7a | `__XRAY_CONSOLE_SESSION` was assigned unconditionally, so any page script could overwrite it and permanently wedge the console fallback | First-write-wins, mirroring the bridge-token handling in `content/content.js:113` |
| C-9 | The service-worker message router dereferenced `msg` with no guard and did not check `sender.id`, letting any content script drive `xray:page-bridge` against **any** tab | Sender validated against `chrome.runtime.id`; `msg` null-guarded; content-script senders forced to their own tab |
| C-5 | `storageBridge` fell back to the **page's** `localStorage` when `XRAY_Store` was absent, which could write the BYOK API key in plaintext into the visited site's storage | Fallback removed; reads return the caller's fallback and writes are dropped |
| C-4a | Redaction denylist missed many common auth headers | Denylist widened |
| C-2 | **High — replay secrets flowed through page-replaceable globals.** The replay path called `window.fetch` with the raw restored `Authorization` value in `init.headers`, so a page that re-wrapped fetch after `document_start` read it on every replay. `_originOf` and `_resolveUrl` parsed with the live `URL`, so replacing `window.URL` made `sameOrigin` true for any target | Replay calls our own wrapper by reference, keeping replays captured and diffed while taking the page out of the path. `URL` is pinned at `document_start`, and the origin gate is two independent checks, the second a plain string comparison that parses nothing |
| C-3 | **High — the bridge token is a MAIN-world global,** so every gate built on it is one property read from bypass, enabling forged entries, overwritten ids and rule injection | The token still filters accidents, but the isolated world now treats everything from MAIN as untrusted: entries are rebuilt field by field with typed, size-capped values, unknown properties cannot ride along, and an update naming an id this world never originated is dropped. The MessagePort channel is NOT done and stays open below |
| C-4b | **High — redaction was an anchored denylist over header names only.** URLs were captured verbatim, so `?access_token=`, `?sig=` and presigned-S3 credentials survived, were persisted, and were eligible for AI egress | Credentials are redacted out of query strings and the userinfo component at the single emit boundary, covering every capture path by construction. The unscrubbed URL joins the MAIN-world secret store so replay still works, restored only on an origin match and only when the operator did not edit the URL |
| C-6 | **High — the decryption hook lived in the page's global scope.** The stub returned `null` so nothing leaked yet, but the file exists to be filled in, and a page could then read what the closure captures, use it as an oracle, or replace it and feed the analyst fabricated plaintext marked `decryptStatus: 'ok'` | `content/decrypt-bridge.js` deleted. The interceptor marks entries `pending`; `content.js` resolves them in the ISOLATED world, which is exempt from the page's CSP, so the stated reason for MAIN-world placement never held |
| C-8 | **Medium — `debugger` was a required install-time permission,** close to the maximum-scrutiny configuration for store review, demanded whether or not the console was ever opened | **Reverted 2026-10-12 — required again.** It was moved to `optional_permissions`, but Chrome does not support `debugger` as an optional permission: it is ignored there, `chrome.permissions.request` rejects ("Only permissions specified in the manifest may be requested"), and `chrome.debugger` stays undefined — so console execution never worked, and a top-level `chrome.debugger.onDetach` call crashed the service worker before any listener registered. The debugger is the only execution path since C-1 deleted MAIN-world evaluation, so the install-time permission is the accepted cost. Listener registration is now guarded and attach still checks the permission |
| C-10 | **Medium — `web_accessible_resources` was over-exposed.** Any page could iframe `window.html`, where `window-main.tsx` reads `location.hash` and persists settings to `chrome.storage.local` | `window.html` and `dist/window-ui.js` dropped: the pop-out opens via `chrome.windows.create`, and the page loads its own bundle. `shared/console-helpers.js` dropped too, once the dynamic import went away |
| C-11 | **Medium — worker IndexedDB was unbounded** and, on the blob-worker fallback, written to the *visited site's* origin | Capped with oldest-first pruning over the `timestamp` index, plus `clearStored`; a page-origin worker refused to open IndexedDB at all. Since the JSON-fidelity final fix (M7) the worker keeps no IndexedDB cache — nothing wrote it after Task 6 and nothing read it — and its `init` deletes the `xray_db` database an earlier version left, on the extension's own origin only (a page-origin worker would see the visited site's databases), so no captured traffic stays on disk |
| C-12 | **Medium — the API key travelled too far.** The panel sent its whole AI settings object, key included, to the background on every call, so the key was resident in isolated-world memory on every page purely to be relayed | The service worker reads the key from `chrome.storage.local` itself and ignores anything the content script sends about credentials. The panel sends a prompt and nothing else |
| C-14 | **Low — console history lived in the page's `localStorage`,** so any site could read what the analyst typed on every other site. Rule regexes had no complexity bound, and rule sets are importable | History moved to extension storage. `re:` patterns are bounded by length and rejected when they contain a nested quantifier, the shape that makes catastrophic backtracking possible |
| C-15 | **Low — the docked panel's shadow root was `mode: 'open'`,** so page script could read the rendered captured data through `.shadowRoot` | Closed. It was open only so `host.shadowRoot \|\| attachShadow(...)` could re-find it across re-mounts; an isolated-world module reference does that instead, exactly as the HUD has always done |
| C-1 | **Critical — the console handed cross-origin captured traffic to page-controlled code.** The debugger-evaluated expression read `window.XRAY_ConsoleHelpers`, a plain writable page global, so a page that replaced `createRuntime` received the whole console context — captured URLs across every origin in the restored session, full bodies for the selected entry and its neighbours, decoded JWT claims — as soon as the user ran any expression, including `1+1`. A second path posted the same context to the page with `targetOrigin: '*'` and no token | The helper source is inlined into the evaluated expression and run against a **shadowed `window`**, so the page global is neither read nor written. The MAIN-world fallback is deleted outright: `content/console-executor.js` is removed from the repo and the manifest, `panel/console.js` no longer posts a session handshake or an exec request, and a failed debugger attach now returns an error instead of falling back. **Console redesign (2026-10-12):** the evaluated context gained saved variables (`temp1`…, `$_`) and pinned requests. Both travel only when the command names them as an identifier (`panel/console.js` `_referencedScope` / `_referencedPins`); a pin travels as `{ id, value }` (the typed response body, spec J8) or `{ id, body }` (its text) — the response body only, never headers, cookies or token lenses — and pin names are restricted to `a`–`f` end to end (store, engine `setPins`, page runtime). A letter used as an arrow parameter (`rows.map(a => …)`) still ships that pin: over-inclusion, accepted |
| C-16 | **Command injection in "Copy as cURL".** `generateCurl` interpolated `entry.url` raw into a single-quoted shell word while the header and body sites two lines below escaped correctly. A page issuing `fetch("https://x.test/a';id;echo'")` produced a command that ran `id` when pasted — the WHATWG parser does not percent-encode an apostrophe in a path or query, and imported HAR files are a second unfiltered source. The method was interpolated bare as a second injection point. The panel's `utils.ts` fallback had the same class of bug via `JSON.stringify`, whose double quotes still permit `$(...)` | Both routed through one POSIX single-quote helper |

See the commit history on `enterprise-hardening` for the exact changes.

---

## 4. Open findings

Everything previously listed here is fixed and has moved to section 3. What remains is
the one piece of C-3's direction that was deliberately not taken.

### C-3 (channel) · Open — the bridge is still `postMessage`, not a `MessagePort`

C-3 suggested handing a `MessagePort` to the MAIN world once at `document_start` and
closing over it instead of storing a token on `window`. That is not done, and it is not a
clean win: `event.ports` is readable by every listener on the event, and `postMessage` is
asynchronous, so a page script that registers a listener before the queued transfer
arrives takes the port too. Content scripts at `document_start` run before the page's own
scripts, but the *delivery* of the transfer is not similarly ordered.

The mitigation that does hold regardless of channel is in place: the isolated world
validates every MAIN-world message as untrusted input. Blinding (a page posting a config
that disables capture) remains possible and is the residual risk here.

## 5. Permission justification

Required for a Chrome Web Store listing, and worth keeping honest. The
submission-ready wording lives in [store-listing.md](store-listing.md).

| Permission | Why | Reducible? |
|---|---|---|
| `storage` | Panel preferences, traffic rules, session persistence, BYOK settings | No |
| `scripting` | Injecting the panel and HUD on demand | No |
| `activeTab` | Toolbar-triggered activation | No |
| `clipboardWrite` | Copy-as-cURL and export actions | No |
| `debugger` | CDP `Runtime.evaluate` for console execution on CSP-strict sites | Required (Chrome cannot make `debugger` optional — see C-8) |
| `windows` | The pop-out window | No |
| `<all_urls>` | Capture is the product; it cannot know in advance which origins matter | No, but see C-14 on scoping *retention* |
| CSP `'wasm-unsafe-eval'` (`extension_pages` only) | Lets SQLite-WASM compile in the SQL client's worker on `sql.html`. It does not apply to content scripts or to any web page, and allows no JS `eval`. `dist/sql-ui.js`, `dist/sql-worker.js` and `dist/sqlite3.wasm` are deliberately not web-accessible, so no page can load them; `sql.html` is, through its dynamic URL only, for the opt-in inline HUD (next row) | No, while the SQL client runs SQLite in the browser |
| `web_accessible_resources`: `sql.html`, `use_dynamic_url: true`, `<all_urls>` | Lets the HUD frame the SQL client inline when the user turns on **Show SQL client inside the page HUD** (`sqlInlineInHud`, **off by default**). The page cannot read the cross-origin frame or the rows it shows. The resource is exposed whether or not the option is on, so treat it as: any site can embed the client. Chrome denies the static `chrome-extension://<id>/sql.html` URL to pages and serves only the per-session dynamic one, which the HUD keeps in its closed shadow root (it did not show in the page's `window.frames` or Resource Timing, observed on Chromium 151), but that is defence in depth, not a boundary. With the option off, sql.html refuses to run under a web origin (`location.ancestorOrigins`): it shows a notice and loads no stored SQL state, so the exposure is live only while the user has opted in. Framed inside a web page, the client offers SQLite files only: the service worker refuses `profiles.*`, `connect`, `profiles.test` and `helper.status` from a port whose `sender.tab` is a web page, and the page shows an **Open in window** link instead of Connect and saved connections (unless the separate opt-in in the next row is on). Clickjacking the client then still requires the user to pick a file. Readiness is relayed through the extension runtime (sql.html → service worker, which checks the sender is a `chrome-extension:` `/sql.html` frame in a tab → the tab's top frame); nothing is posted to the page's window, so the page gets no `WindowProxy` to the frame and cannot swallow the signal. Once framed, the HUD keeps the frame until it is reopened, even if the option is turned off. Only `sql.html` is listed: its bundles, worker and wasm are loaded by the extension-origin document. A page's `frame-src` CSP does not block the frame (observed on Chromium 151); if it ever fails to load, the HUD falls back to the window after 4 s | Yes: drop the entry and the option, leaving the window |
| Setting **Allow saved database connections in the page HUD** (`sqlDatabasesInHud`, **off by default**, effective only with `sqlInlineInHud` on) | Lets the HUD's inline client use saved Postgres/MySQL profiles and the helper (section 6). Off, a `sql.html` whose port's `sender.tab` is a web page is refused `profiles.*`, `connect`, `profiles.test` and `helper.status` by the service worker ("Database connections open in the XRAY window, not inside a web page."), and the page hides Connect and saved connections behind an **Open in window** link. On, the exposure grows: the page still cannot read the cross-origin frame, its rows or any password, but it can overlay or reposition it to trick the user into clicking Connect, a saved connection or Run (clickjacking). Turning it on asks for confirmation with that warning. The worker reads both settings from the panel's stored preferences each time a client connects its port, so turning either off applies from the client's next load. Connections still open read-only by default and passwords stay in the worker | Yes: leave it off (the default) |
| `nativeMessaging` (`optional_permissions`) | Lets the service worker start `xray-db-helper`, the native host that connects the SQL client to Postgres and MySQL (section 6). It is optional: `sql.html` requests it on the first **Connect** or **Test connection** to a Postgres/MySQL profile, a user gesture, so users who only open SQLite files never grant it. Chrome starts only hosts whose manifest lists this extension in `allowed_origins` | Already optional; drop it together with Postgres/MySQL support |

---

## 6. Database connections and the native helper

The SQL client reaches Postgres and MySQL through `xray-db-helper`, a Go native-messaging host
installed separately ([helper/README.md](../helper/README.md)). Three parts are involved. The page
(`sql.html`) holds the editor and grid. The service worker's connection manager
(`background/sql-manager.js`) holds profiles and secrets and owns the native port. The helper holds
the database connections.

### Assets

- **Database passwords.** They are typed into the connection dialog or the password prompt, or
  pasted inside a connection string.
- **Query results**, and the schema the rail lists.

### Where secrets live

- A saved password lives in `chrome.storage.local` under `sql_connections`, with its profile.
- With **Save password** off, the password lives in `chrome.storage.session` under
  `sql_session_secrets`, so it is gone when the browser closes. `chrome.storage.session` is
  available to trusted extension contexts only. The extension never calls `setAccessLevel` on it,
  so content scripts cannot read it.
- Stored database passwords are not encrypted at rest; encryption without a user passphrase would only look like protection.
  Anyone who can read the browser profile on disk can read them. That is the same exposure as
  the BYOK API key and every saved browser password without an OS keychain.
- **Only the service worker reads secrets.** The page refers to profiles by id, and
  `profiles.list` returns `hasSavedPassword` instead of the password. A password typed into the page
  goes to the worker once and is not kept in page state. The paste box empties as soon as it has
  filled the fields.
- **The port sender check.** The worker accepts an `xray-sql` port only when `sender.id` is this
  extension and `sender.url` is a `chrome-extension:` URL whose path is `/sql.html` (C-9). Content
  scripts and other extension pages cannot drive it.
- **A stored secret is bound to its server.** The binding is engine, host (trimmed and lowercased),
  port and user (M3-R24). Editing a profile to point at another server drops the saved password,
  and the next connect asks for one. `profiles.test` uses the stored secret only when all four
  match the saved profile, and it stores nothing: no profile, no secret. A password typed into the
  prompt is stored only after a successful connect, and only if the profile still points at the
  server it was used for. So an edit made while a connect is in flight cannot move a password
  to a new host.
- The helper receives the password only inside `connect`. It never logs, persists or echoes it, and
  connect errors carry fixed text or server text. MySQL error text is scrubbed of the password
  when it is 4 or more characters long, matched as a whole token.

### The helper boundary

- **Who can start it.** Chrome starts the helper only for the origins in its host manifest's
  `allowed_origins`, which lists only `chrome-extension://kjfoocnkoajdcjabnadfojdfaghpbeep/`. Web
  pages and other extensions cannot reach it. The helper never listens on a network port.
- **What it accepts.** It accepts a fixed set of operations: `hello`, `ping`, `connect`,
  `introspect`, `execute`, `fetchMore`, `cancel`, `closeTab` and `close`. Requests are decoded strictly: an unknown op or an
  unknown field is refused with `bad-request`, and incoming frames are capped at 64 MiB. A panic
  in a handler answers `internal` and does not take down the process.
- **What it logs.** stderr carries only error codes. Secrets, SQL text and results are never logged.
- **How it is installed.** The installers download the release binary, check it against the
  release's `SHA256SUMS`, and refuse to install on a mismatch. Downloads use `curl --proto '=https'
  --tlsv1.2`. Everything is installed per-user, and an upgrade copies then renames, so it never
  leaves a half-written binary.
- **Lifetime.** When no `sql.html` page and no session is left, the worker closes the native port
  after 30 s and Chrome stops the helper. A cursor left unread for 60 s is closed (ending its
  read-only transaction and the locks it holds), and closing an editor tab closes its connection.
- **Who can reach saved connections.** Only extension pages: the worker refuses the
  saved-connection ops from a `sql.html` framed inside a web page unless the user turned on both
  HUD options (section 5).
- **Result size.** The worker counts each request's assembled rows; past 32 MiB it cancels the
  query and answers "Result too large; lower the row limit.", so a result never exceeds what a
  port message can carry.

### TLS

- `require` is the default for every host that is not loopback. `verify-full` checks the
  certificate and host name, with an optional CA file.
- `disable` is accepted only for loopback hosts (`localhost`, `127.0.0.0/8`, `::1`). Both the
  dialog and the helper enforce this. The refusal reads "This server is not on this computer, so
  XRAY requires TLS. Choose Require or Verify full."
- The secret binding above ignores TLS settings. A kept secret can therefore travel unencrypted
  only to the same loopback server it is bound to.

### Read-only

New connections are read-only. **Read-only is accident protection, not an authorization boundary**
(M3-R9). It stops a mistyped `UPDATE`, not a user or server set on writing. Use a database role
without write grants when writes must be impossible.

- **Postgres.** Each statement runs inside `BEGIN TRANSACTION READ ONLY` and is rolled back. The
  helper's keyword guard refuses statements that could end or change that transaction (BEGIN,
  START, COMMIT, END, ROLLBACK, ABORT, SAVEPOINT, RELEASE, SET, RESET, DISCARD, PREPARE, LOCK,
  COPY). It fails closed: a statement that does not start with a word is refused. A read-only
  transaction does not stop everything:
  - `dblink`/`dblink_exec` writes over a second connection.
  - `COPY … TO PROGRAM` as a superuser (through a function or a DO block).
  - Advisory locks.
  - `pg_cancel_backend` and `pg_terminate_backend`: they are plain function calls, so they pass
    the guard and the read-only transaction, and stop other sessions' queries or connections when
    the role is allowed to (superuser, the same role, or `pg_signal_backend`).
  - Any side effect a function performs outside the transaction.

  The database itself still blocks ordinary writes inside the transaction, including writes
  made by functions.
- **MySQL.** There are several layers (M3-R12, M3-R15):
  - Read-only connections set `transaction_read_only = ON` for the session. The setting is
    re-asserted after a redial.
  - Each statement also runs inside `START TRANSACTION READ ONLY` and is rolled back.
  - A fail-closed, engine-aware keyword guard runs before the server sees the statement.

  Read-only also refuses:
  - `CALL`, because procedures can commit (M3-R13).
  - `KILL`.
  - Any executable comment (`/*!…*/`, `/*!NNNNN …*/`, and `/*M!…*/` on MariaDB), because these
    could hide a different statement from the guard (M3-R15).
  - `INTO OUTFILE` and `INTO DUMPFILE`, matched on a normalised token stream, because they write
    files on the database server even in a read-only transaction (M3-R16, M3-R17). That write
    also needs the FILE privilege, so on a hardened account the server refuses it too.
- **Extension pre-check.** Before anything is sent, the page's classifier refuses writes on a
  read-only connection and asks for confirmation before dangerous statements (such as DROP, or an
  UPDATE without WHERE) on a writable one.
- Turning Read-only off reconnects in read-write mode. Each statement then commits as it runs,
  unless the user opens a transaction with BEGIN. The helper reports such an open transaction
  (`inTransaction`), and the page asks before anything that would end the session or the tab with
  one open (the Read-only switch, another connection, opening a file, closing the tab or the page).
  A transaction lost anyway is reported as rolled back, never as committed: a COMMIT of a failed
  transaction is an error, and so is the first statement after a tab's connection was lost inside
  one.

### Results

Query results stay in `sql.html`. They are not added to the captured session, so they are never
sent to the AI features and never appear in XRAY's session exports. The grid's Copy, CSV, JSON
and INSERT actions copy only what the user chooses, to the clipboard.

### Residual risks

- **Any local process can start the helper** by running the binary. It would hold no credentials,
  though: the helper stores nothing, and passwords exist only in the browser profile. A local
  process that can already read the profile can read them directly.
- **Side-effect functions inside a read-only transaction** are still blocked by the database for
  ordinary writes. Effects outside it (dblink, `COPY TO PROGRAM`, advisory locks) are not, as
  listed above.
- **Passwords are not encrypted at rest** (see above).
- **A malicious or compromised database server** controls the result text and the schema names it
  returns. The grid and rail render them as text only (section 2: no injection sinks), and values
  are capped in size.

---

## 7. Reporting a vulnerability

See [SECURITY.md](../SECURITY.md).
