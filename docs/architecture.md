# XRAY architecture

How the pieces fit, why the world split exists, and where the sharp edges are.

---

## 1. Execution contexts

Six contexts, with different privileges and different globals.

| Context | Loaded from | Scripts |
|---|---|---|
| **MAIN world** (the page's own realm) | `content_scripts[0]`, `document_start` | `interceptor.js`, `console-capture.js` |
| **ISOLATED world** | `content_scripts[1]`, `document_start` | `shared/utils.js`, `shared/decrypt.js`, `shared/store.js`, `shared/worker-client.js`, `shared/console-helpers.js`, `panel/console.js`, `dist/panel-ui.js`, `content/content.js` |
| **ISOLATED world (late)** | `content_scripts[2]`, `document_idle` | `content/hud-mount.js`, which dynamically imports `dist/hud-ui.js` |
| **Service worker** | `background.js` | — |
| **DevTools panel** | `devtools/devtools-panel.html` | `devtools-panel.js` + `dist/panel-ui.js` |
| **Pop-out window** | `window.html` | `dist/window-ui.js` |
| **Web Worker** | `workers/xray-worker.js` | spawned from the ISOLATED world |

`content_scripts[1]` order is load-bearing: `shared/store.js` must precede
`dist/panel-ui.js`, which must precede `content/content.js`, and
`shared/console-helpers.js` must precede `panel/console.js`. The regression suite pins
this ordering, and `window.html` carries a comment about a past regression where it broke.

The MAIN world is deliberately thin. It holds exactly what has to run in the page's own
realm to wrap the network objects, and nothing else. Three files left it during the
threat-model work: `console-executor.js` and `decrypt-bridge.js` were deleted outright
(C-1 and C-6), and `console-helpers.js` moved to the ISOLATED group once nothing in the
page realm read it any more.

---

## 2. Why there are two worlds

To wrap `window.fetch` and `XMLHttpRequest` so the *page's* calls go through them, the
interceptor must live in the page's own realm — the MAIN world. An isolated-world script
has its own `fetch` and would capture nothing.

Everything else wants the opposite: the panel handles captured data, holds preferences,
and must not be reachable by the page. That lives in the ISOLATED world.

So capture is split across a boundary that has exactly one channel between its halves:
`window.postMessage`, which the page can also read and write.

### The single-injection constraint

Chrome injects a content-script **file** only once per frame, even when the same path is
listed in both the MAIN and ISOLATED groups. `shared/console-helpers.js` is listed only in
the MAIN group but is needed in both. Two mechanisms work around this:

**Dynamic import of a web-accessible resource** — this is how
`shared/console-helpers.js` used to reach the isolated world, and it no longer applies.
The file was listed in the MAIN group for the MAIN-world console executor, so the
isolated world had to import it at runtime:

```js
// removed
if (!window.XRAY_ConsoleHelpers) {
  import(chrome.runtime.getURL('shared/console-helpers.js')).catch(() => {});
}
```

C-1 deleted that executor. With no reader left in the page realm, the file is simply
listed in the ISOLATED group instead, which is both simpler and one less writable global
in the page. The mechanism is documented here because it remains the right answer if a
file ever genuinely needs to exist in both worlds.

**Isolated-world `window` handoff for a closed shadow root** — `content/hud-mount.js:139`:

A `<script>` inside a shadow tree gets `document.currentScript === null`, and modules always
do, so `dist/hud-ui.js` cannot find its own closed root. `hud-mount.js` stashes it on the
isolated-world window as `__xrayHudShadow` before importing the bundle. Both run in the
isolated world, so the page never sees the property. Because a module is only importable
once, `hud-main.tsx` publishes `window.__xrayHudRemount` for subsequent toggles.

---

## 3. Message topology

### MAIN → ISOLATED (`window.postMessage`, all `targetOrigin: '*'`)

| Payload flag | Producer | Consumer |
|---|---|---|
| `__xray_bridge_ready__` | `interceptor.js:29`, `console-capture.js:34` | `content.js:113` (first-write-wins) |
| `__xray_capture__ {entry}` | `interceptor.js:38` | `content.js:118`, `hud-main.tsx:22` |
| `__xray_capture__ {update}` | `interceptor.js:42` | `content.js:124` |
| `__xray_capture__ {batch}` | `console-capture.js:224` | `content.js:132` |
| `__xray_fetch_response__` | `console-capture.js:332` | `content.js:230` |

### ISOLATED → MAIN

| Payload flag | Producer | Consumer |
|---|---|---|
| `__xray_config__` | `captureConfig.ts:34`, `content.js:187` | `interceptor.js:87` |
| `__xray_replay__` | `captureConfig.ts:34`, `content.js:189` | `interceptor.js:842` |
| `__xray_fetch_object__` | `content.js:237` | `console-capture.js:325` |

The console has no MAIN-world leg any more. `XRAY_CONSOLE_SESSION`,
`XRAY_EXEC_REQUEST` and `XRAY_EVAL_RESULT` are gone with `console-executor.js`: the
context they carried (cross-origin captured URLs, full bodies, decoded JWT claims) was
posted into the page with `targetOrigin: '*'`. Execution is privileged-path only.

### Console log values: the typed log model (spec J7)

`console-capture.js` encodes every console argument into one JSON-safe model, `content.js`
rebuilds it field by field (bounded), and the store, the DevTools relay and Session JSON carry
it unchanged; persistence bounds it again with the same checker in TypeScript
(`models/logBound.ts`, spec J9); `src/panel/models/logValue.ts` documents the stable form and
renders it.

- A log entry has `logArgCount`; `logData` is the single argument when there is one, else
  the list (`console.log([1,2,3])` and `console.log(1,2,3)` stay distinct).
  `objectRefs[i]` is the "Load full object" handle of argument `objectRefArgs[i]`.
- Plain JSON stays plain. Every other value is an envelope under the reserved key
  `"$xray"`: `undefined`, `number` (NaN/±Infinity/-0), `bigint` (exact digits),
  `function`, `symbol`, `date`, `dom`, `circular`, `unreadable`, `depth`, `string`,
  `array` and `object` (truncation as metadata), `map`, `set`, `error` (with `cause`),
  `typedarray`.
- The encoder owns every bound: per console call a value budget (every argument, item,
  entry value, Map key/value, Set value, typed-array value and cause counts one) and a
  character budget (string values, keys, Error messages/stacks, Symbol descriptions,
  BigInt digits); per value depth, items, string and key length. A cut is metadata
  (`length`, `size`, `omitted`, a `string`/`depth` envelope); BigInt digits are all or
  nothing (`unreadable`). `content.js` checks in the same units with limits at twice the
  encoder's, so it passes legitimate output unchanged: the docked panel (validated) and
  the HUD (which stores the page's batches as posted) hold the same model.
- Unforgeable by construction rather than by a secret: the encoder lists any logged object
  that has its own `"$xray"` key as an `object` envelope, so no logged value can produce
  an envelope, and `content.js` turns any envelope that does not check out into one. A
  per-session token was rejected: the page can read it, and persisted or exported sessions
  would be unreadable after a reload. `"__type__"` and `"__xray_ref__"` are ordinary keys;
  entries without `logArgCount` predate the model and are decoded from their old shapes.

### Console command values (spec J8)

Console results and the command context use the same typed model, as text both ways:

- **Context in.** `panel/console.js` `_contextPayload` sends tagged JSON text: entries as
  plain data; saved variables (`temp1`…, `$_`, already typed); and typed `values` for `res`,
  `req`, `prev`, `next` and pin `value`s — the running surface's lossless parse
  (`models/consoleResults.ts` `consoleBodyValue`: an integer past 2^53 is a `bigint`
  envelope), only for the names the code uses; without a reader the page parses the raw
  text as before. `background.js` inlines the text as a string literal; the inlined
  `shared/console-helpers.js` `reviveContext` parses it in the page: BigInt,
  NaN/±Infinity/-0/undefined, Map, Set, Date, Error come back, `"__proto__"` stays a key.
- **Result out.** `encodeResult` serializes the value in the page into typed JSON text, in
  the page's key order (CDP's `returnByValue` dictionary sorted keys and dropped what JSON
  cannot hold; a string carries it intact). Cycles are found by ancestor stack, so a shared
  value is not `[Circular]`. The old caps stay (depth 8, 1,000 items, 500 keys, 1,000
  Map/Set entries, 200,000-char strings, ~200,000 chars in all, an Error's message and stack
  included) and are metadata the panel states ("Showing 1,000 of 5,000 items"); Copy puts
  only what was kept on the clipboard and its toast says so. `table()` returns its rows and
  sets `render: 'table'` beside the value — no key of the value is an instruction. The engine
  `JSON.parse`s the text; the panel keeps the typed value (`$_`, Save as variable send it
  back typed) and renders it with the Logs' renderers (`models/logValue.ts`).

### ISOLATED / panel → service worker (`chrome.runtime.sendMessage`)

`xray:capture`, `xray:capture-batch`, `xray:capture-update`, `xray:console-eval`,
`xray:ai-explain`, `xray:page-bridge`, `XRAY_HUD_TOGGLE_ACTIVE`, `XRAY_OPEN_WINDOW`,
`XRAY_OPEN_SQL_WINDOW`.

### DevTools panel ↔ service worker

A long-lived port named `xray-devtools`. The panel connects and sends
`{type: 'xray:devtools:init', tabId}`; the worker registers it in `_devtoolsPortsByTab` and
pushes capture messages back over it.

### Service worker → page

`chrome.debugger.attach(tabId, '1.3')` + `Runtime.evaluate`, used for console execution.
Sessions are cached per tab and detached after 30 s idle. The tab is always the sender's own
(`xray:console-eval` pins `sender.tab.id`), so commands run from the in-page surfaces (docked
panel, HUD). The pop-out loads no console engine (`panel/console.js`) and a DevTools panel page
has no `sender.tab`, so a command there returns an error; their Console tab shows page logs.

### The saved session (spec J9)

Every surface saves the session to `chrome.storage.local` (`xray_session_envelope`, schema
version 2) at most every 4 s, and restores it on load (`models/sessionStore.ts`,
`models/sessionEnvelope.ts`):

- Bodies are saved as the captured text, so every view re-parses it after a reload; a cut is
  truncation metadata (`responseTruncated`, `requestTruncated`, `responseDecryptedTruncated`:
  `keptChars` is the saved length, the capture's total is kept), never an in-band "…". Logs
  are saved in the typed model, cut with its envelopes (`models/logBound.ts`); a log saved
  before the model is moved into it. chrome.storage gives every object back with its keys
  sorted, so a log's value is stored as its JSON text (`logDataJson`) and parsed back with the
  lossless parser on restore, keys in the order logged. Other structured fields (headers,
  FormData fields, JWT claims) come back key-sorted; the bodies the views read are text, so
  those stay exact. A text request body is saved as its text alone — its parsed copy is derived
  from the text by every reader, so it is not saved beside it (only FormData fields and a binary
  descriptor are); a session saved with copies still restores them, and the next save drops them.
  Every saved value is JSON-safe (a typed array becomes the binary descriptor capture uses; a
  BigInt, NaN or ±Infinity outside the log model is written as JSON would, inside it as an
  envelope).
- One budget bounds the session (no `unlimitedStorage`; chrome.storage.local holds 10,485,760
  bytes for everything XRAY stores): 6,000,000 bytes, every saved field counted as storage
  counts it (a value's JSON in UTF-8, a text's escapes too), newest entries first. An entry's
  other fields (headers, URL, timing, a log's message) are paid for first and never cut; then
  its bodies, log and frames, the smaller first, each body up to the 250,000-character capture
  cap. Once the budget is spent, older bodies, logs and frames are cut (the newest frames
  kept) and every entry still keeps up to 2,048 bytes of them, so a full session holds the
  budget plus, for each entry past it, its fixed fields and 2 KB (a body's own key and quotes
  are not counted, ~100 bytes an entry). Saving a restored session changes nothing.
- A session saved before J9 (version 1 or the bare `session_entries` array) is migrated once
  on restore: the old in-band suffix and the store's "…" cut become metadata, and every entry
  is flagged `legacySession`. No save ever cuts what it kept — it already fit storage: flagged
  entries are saved whole (logs under content.js's own limits) and counted first, and new
  entries share what they leave of the budget (none left: new bodies fall to the 2 KB floor)
  until the legacy entries leave the session (maxEntries, the 500-entry window, Clear). A save
  that then overflows the quota fails and shows the save notice; nothing is cut to make room.
  Only imported entries (a file carries no version) are still read for the suffix at view
  time. `imported` is set by the panel's import alone and `legacySession` by migration alone:
  content.js carries neither across the bridge, the store drops both from live captures, and
  an import drops `legacySession`.
- A failed write shows "Couldn't save the session — <reason>" in a strip under the header,
  once per failure streak (the diagnostics receipt stays); `shared/store.js` classifies a full
  quota, and only that fixed reason leaves it.

### Replay and exports (spec J10)

The request text (`requestBodyText`) and the response text are what replay sends and exports
embed; the parsed `requestBody` copy (rounded by JSON.parse, key-sorted by chrome.storage) is
read only for an entry saved before J4, FormData fields and a binary descriptor.

- Replay posts the captured text to the page and `interceptor.js` sends a string body as it is.
  FormData whose captured fields are all text goes as `{ formdata: [[name, value], …] }` (at most
  1,000 fields and 50,000 characters, both sides): the page rebuilds it with the `FormData`
  constructor pinned at `document_start` — names, values and order kept, the captured multipart
  Content-Type dropped so the browser sets the new boundary — and drops the replay if the fields
  are not that. `models/replayBody.ts` says when the captured body is not the one sent — cut at
  capture, FormData with files (never captured) or saved without its fields, bytes, a body the
  capture could not read: Replay then refuses with the reason, and Edit & Replay shows it (inviting
  an edit only where a text body makes sense). The editor holds the raw text; an edit is sent
  exactly as typed (in place of a form: as text, without the multipart Content-Type). The
  page-side replay listener never throws into the page: a request it cannot convert (a page
  that broke a built-in the path uses) is dropped.
- An experiment run sends what Replay would (the captured text or form) while its plan's sanitized
  body is the baseline's own and it stays on the captured origin — fields the plan shows as
  `[REDACTED]` go out with their real values; retargeted or edited, the sanitized plan body (the
  persisted, redacted form; a form's fields as a form again) re-printed with its integers as
  written — as the Experiments card shows it.
- Selected JSON, Mock, Jest and MSW embed bodies through `printJson`, composed with the export's
  metadata as nodes (`utils.ts` `plainNode`/`bodyExportNode`): lexemes, duplicate keys and member
  order as captured. HAR writes the captured texts (`content.text`, `postData.text`) and
  re-imports them verbatim. cURL, fetch, Axios and Playwright send the raw text.
- A FormData is rebuilt from its captured fields, in order, without the captured multipart
  Content-Type (each tool writes its own boundary): cURL with one `--form-string 'name=value'`
  per text field (taken literally: `-F` would read a value starting with `@` or `<` from a local
  file and cut one at `;type=`; a field with a line break is `$'…'`-quoted with CRLF breaks, as a
  browser's FormData sends them), fetch / Axios / Playwright with `new FormData()` and one
  `append` per field (`body`, `data`, `multipart`), HAR as `postData.params` (never `text`; XRAY's
  import reads them back as the fields). A file was never captured: it is a `Partial:` note above
  the code (and a HAR comment), as are fields not kept with a saved entry and a form cut at
  capture.
- Share-safe exports redact a captured text over its lossless parse
  (`experiments.ts` `snapshotExperimentNode`, then the same cleaning as values) and print it.
  A typed log's Error, at any depth (an argument, a member, another error's cause), is its name
  alone (`logPlain` mode `'share'`): its message, stack, own properties (an HTTP client's
  response data) and cause are left out and counted as omitted. The share-safe HAR writes a
  FormData's redacted fields as `postData.params`.
- In the page, a string request body is parsed whole only when its parse is used: within the
  50,000-char capture cap, or a GraphQL candidate (`"query"` in the text) up to 1,000,000 chars.

### Pop-out window

**Has no message channel.** It is an extension page with no interceptor and no
`devtools.inspectedWindow.tabId`, so config pushes and replay both degrade to a toast. It
reads persisted state from `chrome.storage.local` only.

### SQL client (`sql.html`)

A standalone extension page that opens local SQLite files. Four files make it up:

- `sql.html` — the page, loading `dist/sql-ui.js` (the editor, schema rail and results grid).
- `dist/sql-worker.js` — a dedicated worker hosting sqlite-wasm; every query runs there, so
  Stop can terminate it without freezing the page.
- `dist/sqlite3.wasm` — loaded by the worker from beside itself (copied from
  `@sqlite.org/sqlite-wasm` at build time), always from the extension origin.

It is reached two ways. The DevTools panel and the pop-out window frame it in an
`<iframe>` under their **SQL** tab (`SqlFrame`, `chrome.runtime.getURL('sql.html')`); the
frame stays mounted once visited, so switching tabs never loses an open database. The HUD
runs inside a web page, so by default its SQL tab sends `XRAY_OPEN_SQL_WINDOW` and the service
worker opens (or focuses) `sql.html` in its own window. With the opt-in setting **Show SQL client
inside the page HUD** (`sqlInlineInHud`, off by default) the HUD frames `sql.html` inline instead,
kept mounted like the others, and falls back to the window card if the frame's
`xray:sql-frame-ready` signal (relayed by the service worker, never posted to the page) has not
arrived within 4 s (`SQL_FRAME_READY_TIMEOUT_MS`). With the option off, sql.html under a web
origin shows a notice instead of the client.

Only `sql.html` is in `web_accessible_resources`, for that inline option, in its own entry with
`use_dynamic_url: true`. Its bundles, worker and wasm are not: the framed document is
extension-origin and loads them itself, so no web page can load them directly.
The manifest's `'wasm-unsafe-eval'` is in `content_security_policy.extension_pages`, so it
applies to extension pages and their workers only, never to content scripts or the pages
they run in. Inside the DevTools panel the frame is a cross-origin subframe of a
`devtools://` page, where `showOpenFilePicker` throws; the client falls back to a file
input there, and saves as a download.

---

## 4. The bridge token

At `document_start`, `interceptor.js` mints a token, freezes it onto
`window.__XRAY_BRIDGE_TOKEN__`, and broadcasts a ready message. `content.js` accepts only
the **first** handshake and mirrors it to the isolated world. Every subsequent message in
both directions carries the token.

Because the interceptor runs before any page script, a later forged handshake cannot
displace the real one.

> **This is not a secret.** It lives on the page's `window`, so any page script can read it
> and forge messages that pass the check. The token prevents *cross-frame* confusion, not
> a hostile first-party page. Treat MAIN→ISOLATED messages as untrusted regardless.
> See [threat-model.md](threat-model.md) C-3.

---

## 5. Security-relevant paths

| Concern | Location |
|---|---|
| Header redaction | `interceptor.js:26` (pattern), applied at `:135`, `:138`, `:141`, `:534`, `:637` |
| MAIN-world-only secret store | `interceptor.js`, capped at 300, FIFO evicted. Also holds the unscrubbed URL, because a credential can live only in the query string (C-4b). |
| JWT claims extracted pre-redaction | `interceptor.js:210`, called at `:416` and `:599` |
| Replay origin pinning | `interceptor.js` — two independent checks: `_originOf` with a URL constructor pinned at `document_start`, plus a plain-string `_urlIsUnder`. See C-2. |
| Decrypt hook | `shared/decrypt.js` — ISOLATED world, resolved by `content.js:_resolveDecrypt`, currently a stub returning `null`. Was a MAIN-world global; see C-6. |
| BYOK key storage | `chrome.storage.local` under `xray_ai_settings` |

---

## 6. Build

`vite.config.ts` emits five IIFE bundles:

- `dist/panel-ui.js` — Vite lib mode, from `src/panel/main.tsx`
- `dist/hud-ui.js`, `dist/window-ui.js`, `dist/sql-ui.js` and `dist/sql-worker.js` — a
  table-driven esbuild `closeBundle` step, because Vite's single-entry lib build cannot
  express additional entrypoints. The same step copies `dist/sqlite3.wasm`.

All five are minified and injected with a `__XRAY_BUILD__` stamp. The stamp honours
`SOURCE_DATE_EPOCH`, so identical source produces byte-identical bundles — CI verifies this
by building twice and diffing hashes.

`dist/` is **committed**, because an unpacked install loads it directly. CI's `dist-sync`
job rebuilds and compares (normalising the stamp out) so source and bundles cannot drift.

---

## 7. Known structural debt

Recorded here so it is visible rather than rediscovered. None of it is fixed.

**Duplicated logic that will drift**

- `background.js` builds the evaluated console expression as a *string template* — the
  wrapper that declares the helper names and calls `reviveContext`/`encodeResult` is not
  linted or type checked (`test/background-service-worker.test.js` runs it). The result
  serializer is no longer part of it: `encodeResult` is real source in
  `shared/console-helpers.js` (linted, unit-tested), inlined from that file (spec J8).
- `background.js:9` `RUNTIME_HELPER_NAMES` hand-mirrors the keys `createRuntime` returns.
  Adding a helper silently makes it undefined on the privileged path only.
- `escapeCSV` in the worker duplicates `toCSV` in `console-helpers.js` (kept identical by a
  parity test). The worker's own `inferSchema`/`computeDiff`/`gridRows` are gone: Table,
  Schema, Diff and Visualize run panel-side on every surface from the lossless parser's
  nodes (JSON fidelity spec J11).
- `operations.ts` and `entries.ts` use **different large-payload thresholds** (80 000 vs
  100 000 bytes), so an entry can be badged "large" in the list but not offered "Copy Full".

**Dead code shipped to every page**

`shared/utils.js` (71 lines) and `shared/decrypt.js` (29 lines) are referenced nowhere but
are injected into every frame of every URL. `hud-mount.js`'s `updateCount`/`updatePill` are
never called, so the collapsed HUD pill permanently reads `XRAY 0`.

**Silent failure**

Roughly 42 empty catch blocks, surfaced as ESLint warnings. The consequential ones:
`interceptor.js:499` swallows every response-body read failure, so the entry is never
emitted with no diagnostic; `worker-client.js` marks itself ready with a null worker on init
failure, so every later call returns a silent stub value instead of an error.

**Correctness**

- The worker's `safeClone` had **no cycle detection**; a cyclic structure arriving over
  `postMessage` recursed until the worker died.
- The worker's token search index (`_searchTokens`) was never read by the panel, which searches
  its own session index; JSON fidelity Task 6 removed it, and content.js no longer posts every
  capture to the worker's `addEntry`.
- The worker's IndexedDB entry cache (capped, oldest-first pruning — threat model C-11) was
  no longer written once content.js stopped posting captures to the worker (JSON fidelity
  Task 6). The JSON-fidelity final fix (M7) removed it with the other operations nothing
  called (`addEntry`, `getFromCache`, `computeStats`, `exportCSV`, `exportHAR`, `analyze`,
  `clearStored`, `pruneStored`) and their client wrappers; the worker keeps `init`, capture
  receipts and `clone`, and its `init` deletes the `xray_db` database an earlier version left
  (extension origin only). The client still relays a worker's cache health if one reports it.
- Traffic rules stop applying when capture is toggled off, because the capture guard returns
  before rule matching — with no UI indication.
- `dist/panel-ui.js` (522 KB) is injected into the ISOLATED world at `document_start` on
  `<all_urls>` whether or not the panel is ever opened.
