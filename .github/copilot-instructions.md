# XRAY Extension — Copilot Instructions

XRAY is a Manifest V3 browser extension that captures, understands, and rewrites API
traffic. The UI is **React + TypeScript** (built to `dist/*.js`); the capture runtime
is **vanilla JavaScript** content scripts and a service worker. Keep that boundary:

```
React owns UI.  Vanilla scripts own the extension runtime.
```

## Build & test

```bash
npm install
npm run typecheck   # tsc --noEmit
npm run build       # Vite lib build -> dist/panel-ui.js, + esbuild -> dist/hud-ui.js, dist/window-ui.js
npm test            # node --test (static + pure-logic regression tests)
npm run check       # typecheck + build + test  (the gate before shipping)
```

There is no CodeMirror build step anymore (the legacy vanilla panel UI was removed).
`panel/console.js` is the only retained vanilla panel script.

## Architecture

### Extension worlds (see `manifest.json`)

**MAIN world** (`world: "MAIN"`, `document_start`) — can touch the page's real objects:
- `content/interceptor.js` — wraps `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`.
  Captures requests, parses GraphQL, records initiator stacks + Resource Timing, applies
  user **mock/delay/fail rules**, and serves **replay** requests. Emits entries via
  `window.postMessage({ __xray_capture__: true, token, entry })` and in-place updates via
  `{ __xray_capture__: true, update: true, entry }` (WS frames, deferred timing).
- `content/console-capture.js` — hijacks console methods (lazy, batched).
- `content/console-executor.js` — CSP-safe user-code execution (session-nonce gated).
- `content/decrypt-bridge.js` — pluggable `window.__XRAY_decrypt__(token, data)`.

**ISOLATED world** — has chrome APIs, not page objects:
- `content/content.js` — receives capture messages, calls `XRAY_Panel.add/update`, relays
  to DevTools, feeds the worker. Implements the focus trap.
- `shared/*` — worker client, storage wrapper, console helpers, decrypt placeholder.
- `panel/console.js` — console engine (`window.XRAY_Console`).
- `dist/panel-ui.js` — the React app.

**Service worker** (`background.js`) — toggles, pop-out window, DevTools port relay,
privileged `chrome.debugger` console eval, and the **AI provider bridge**
(`xray:ai-explain` → Anthropic/OpenAI; the key comes from the message, never stored here).

**Web worker** (`workers/xray-worker.js`) — off-thread schema/diff/grid/detail analysis
and IndexedDB, with main-thread fallbacks.

### React app (`src/panel/`)

- One `App` mounted three ways: content-script panel (`main.tsx`, open shadow root),
  floating HUD (`hud-main.tsx`, closed shadow root — **note: this bundle runs in the MAIN
  world and installs its own capture listener**), pop-out window (`window-main.tsx`).
- `store.ts` — single Zustand store. New surfaces: `rules`, `aiSettings`, `driftCount`,
  `replayEditorEntry`, `explainEntry`, plus `updateEntry`, `restoreEntries`, `replayEntry`,
  and rule CRUD. Preferences, rules, AI settings, and a bounded session snapshot persist to
  `chrome.storage.local`.
- `models/` — **pure, testable logic**: `entries` (filters, flags, GraphQL grouping),
  `operations` (contextual smart ops), `export`/`import` (formats + HAR/session import),
  `rules` (normalize + serialize for the interceptor), `drift` (schema signatures),
  `lenses` (JWT decode), `detail` (timing phases, grid/viz).
- `runtime/` — bridges to the vanilla runtime: `captureConfig` (publishes capture toggles
  and rules to the MAIN world via a bridge token), `consoleBridge`, `storageBridge`,
  `aiBridge`.

### Data flow

```
page fetch/WS -> interceptor.js (MAIN) --postMessage--> content.js (ISOLATED)
  -> XRAY_Panel.add/update -> Zustand store -> React
  (HUD bundle runs in MAIN and listens to the same postMessage directly)
config/rules:  React store -> captureConfig.postMessage({ __xray_config__ }) -> interceptor
replay:        React store -> postMessage({ __xray_replay__ }) -> interceptor re-fires fetch
AI explain:    React -> chrome.runtime.sendMessage('xray:ai-explain') -> background -> provider
```

## Conventions

- Private helpers prefixed with `_`. Globals on `window.XRAY_*`. Event flags use double
  underscores (`__xray_capture__`, `__xray_config__`, `__xray_replay__`).
- Entry shape lives in `src/panel/types.ts` (`XrayEntry`). New fields: `graphql`, `initiator`,
  `timing`, `wsFrames`/`wsState`, `mocked`/`mockRuleId`, `replayed`, `driftFromId`, `imported`.
- Interceptor code is wrapped in try/catch and always preserves original behavior.
- Sensitive headers are redacted in the interceptor before an entry is stored.
- Prefer editing pure model logic (easy to unit-test) over stuffing logic into components.

## Testing

`test/security-regressions.test.js` mixes pure-logic execution (for `.js` files, run via
`vm`) with static source assertions (for `.ts`/`.tsx`, which can't be `vm`-executed raw).
When adding a feature, add an assertion for its key invariant. Keep `npm run check` green.

## Security notes

- Response bodies only; sensitive headers redacted; decrypt key in-memory only.
- Mock rules and replays run in the page; rule payloads are length-bounded and sanitized
  in the interceptor before use.
- AI is opt-in and bring-your-own-key; the key is stored in local extension storage and sent
  only to the selected provider from the background worker.
- Captured values render as text, not HTML; large/circular values serialize safely.
