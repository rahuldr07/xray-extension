# XRAY architecture

How the pieces fit, why the world split exists, and where the sharp edges are.

---

## 1. Execution contexts

Six contexts, with different privileges and different globals.

| Context | Loaded from | Scripts |
|---|---|---|
| **MAIN world** (the page's own realm) | `content_scripts[0]`, `document_start` | `interceptor.js`, `console-capture.js`, `decrypt-bridge.js`, `console-helpers.js`, `console-executor.js` |
| **ISOLATED world** | `content_scripts[1]`, `document_start` | `shared/utils.js`, `shared/decrypt.js`, `shared/store.js`, `shared/worker-client.js`, `panel/console.js`, `dist/panel-ui.js`, `content/content.js` |
| **ISOLATED world (late)** | `content_scripts[2]`, `document_idle` | `content/hud-mount.js`, which dynamically imports `dist/hud-ui.js` |
| **Service worker** | `background.js` | — |
| **DevTools panel** | `devtools/devtools-panel.html` | `devtools-panel.js` + `dist/panel-ui.js` |
| **Pop-out window** | `window.html` | `dist/window-ui.js` |
| **Web Worker** | `workers/xray-worker.js` | spawned from the ISOLATED world |

`content_scripts[1]` order is load-bearing: `shared/store.js` must precede
`dist/panel-ui.js`, which must precede `content/content.js`. The regression suite pins
this ordering, and `window.html` carries a comment about a past regression where it broke.

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

**Dynamic import of a web-accessible resource** — `content/content.js:11`:

```js
if (!window.XRAY_ConsoleHelpers) {
  import(chrome.runtime.getURL('shared/console-helpers.js')).catch(() => {});
}
```

The file is an IIFE assigning `window.XRAY_ConsoleHelpers`. Imported as a module in the
isolated world, it re-executes against the *isolated* `window`.

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
| `XRAY_EVAL_RESULT` | `console-executor.js:134` | `panel/console.js:32` |

### ISOLATED → MAIN

| Payload flag | Producer | Consumer |
|---|---|---|
| `__xray_config__` | `captureConfig.ts:34`, `content.js:187` | `interceptor.js:87` |
| `__xray_replay__` | `captureConfig.ts:34`, `content.js:189` | `interceptor.js:842` |
| `__xray_fetch_object__` | `content.js:237` | `console-capture.js:325` |
| `XRAY_CONSOLE_SESSION` | `panel/console.js:28` | `console-executor.js:106` |
| `XRAY_EXEC_REQUEST` | `panel/console.js:180` | `console-executor.js:114` |

### ISOLATED / panel → service worker (`chrome.runtime.sendMessage`)

`xray:capture`, `xray:capture-batch`, `xray:capture-update`, `xray:console-eval`,
`xray:ai-explain`, `xray:page-bridge`, `XRAY_HUD_TOGGLE_ACTIVE`, `XRAY_OPEN_WINDOW`.

### DevTools panel ↔ service worker

A long-lived port named `xray-devtools`. The panel connects and sends
`{type: 'xray:devtools:init', tabId}`; the worker registers it in `_devtoolsPortsByTab` and
pushes capture messages back over it.

### Service worker → page

`chrome.debugger.attach(tabId, '1.3')` + `Runtime.evaluate`, used for console execution.
Sessions are cached per tab and detached after 30 s idle.

### Pop-out window

**Has no message channel.** It is an extension page with no interceptor and no
`devtools.inspectedWindow.tabId`, so config pushes and replay both degrade to a toast. It
reads persisted state from `chrome.storage.local` only.

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
| MAIN-world-only secret store | `interceptor.js:154`, capped at 300, FIFO evicted |
| JWT claims extracted pre-redaction | `interceptor.js:210`, called at `:416` and `:599` |
| Replay origin pinning | `interceptor.js:861` — restores secrets only when the target origin matches the recorded one |
| Decrypt hook | `content/decrypt-bridge.js:17` — a MAIN-world global, currently a stub returning `null` |
| BYOK key storage | `chrome.storage.local` under `xray_ai_settings` |

---

## 6. Build

`vite.config.ts` emits three IIFE bundles:

- `dist/panel-ui.js` — Vite lib mode, from `src/panel/main.tsx`
- `dist/hud-ui.js` and `dist/window-ui.js` — a table-driven esbuild `closeBundle` step,
  because Vite's single-entry lib build cannot express additional entrypoints

All three are minified and injected with a `__XRAY_BUILD__` stamp. The stamp honours
`SOURCE_DATE_EPOCH`, so identical source produces byte-identical bundles — CI verifies this
by building twice and diffing hashes.

`dist/` is **committed**, because an unpacked install loads it directly. CI's `dist-sync`
job rebuilds and compares (normalising the stamp out) so source and bundles cannot drift.

---

## 7. Known structural debt

Recorded here so it is visible rather than rediscovered. None of it is fixed.

**Duplicated logic that will drift**

- `background.js:140-209` embeds a copy of `console-executor.js`'s serializer as a *string
  template* — no linting, no type checking, no test coverage, and it must be fixed twice.
- `background.js:9` `RUNTIME_HELPER_NAMES` hand-mirrors the keys `createRuntime` returns.
  Adding a helper silently makes it undefined on the privileged path only.
- `inferSchema`/`computeDiff`/`escapeCSV` in the worker duplicate `schema`/`diff`/`toCSV`
  in `console-helpers.js`, with different escaping rules and depth caps.
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

- The worker's `safeClone` and `computeDiff` have **no cycle detection**; a cyclic structure
  arriving over `postMessage` recurses until the worker dies.
- Search is not actually indexed — `_searchTokens` is attached only to the worker's own
  copy, so every keystroke re-walks every entry despite a comment claiming otherwise.
- IndexedDB grows without bound: every entry is written, nothing is ever pruned, and there
  is no clear control in the UI.
- Traffic rules stop applying when capture is toggled off, because the capture guard returns
  before rule matching — with no UI indication.
- `dist/panel-ui.js` (522 KB) is injected into the ISOLATED world at `document_start` on
  `<all_urls>` whether or not the panel is ever opened.
