<p align="center">
  <img src="docs/assets/readme/hero.png" alt="XRAY React API Debugging Extension" width="100%" />
</p>

<h1 align="center">XRAY</h1>

<p align="center">
  <strong>Not another JSON viewer. XRAY is a response operations console for API debugging.</strong>
</p>

<p align="center">
  It captures requests, understands responses, prepares context-aware operations, and turns live traffic into commands, notebook cells, exports, schemas, mocks, and test assets.
</p>

<p align="center">
  <a href="https://github.com/rahuldr07/xray-extension">
    <img alt="Manifest V3" src="https://img.shields.io/badge/Manifest-V3-89b4fa?style=for-the-badge&labelColor=181825">
  </a>
  <a href="https://react.dev/">
    <img alt="React TypeScript" src="https://img.shields.io/badge/UI-React%20%2B%20TypeScript-cba6f7?style=for-the-badge&labelColor=181825">
  </a>
  <a href="https://tanstack.com/virtual/latest">
    <img alt="TanStack Virtual" src="https://img.shields.io/badge/Lists-TanStack%20Virtual-94e2d5?style=for-the-badge&labelColor=181825">
  </a>
  <img alt="Local first" src="https://img.shields.io/badge/Runtime-Local%20first-a6e3a1?style=for-the-badge&labelColor=181825">
  <img alt="No remote UI assets" src="https://img.shields.io/badge/Remote%20UI%20assets-0-f9e2af?style=for-the-badge&labelColor=181825">
</p>

<p align="center">
  <a href="#the-debugging-loop">Debugging Loop</a>
  <span> . </span>
  <a href="#product-tour">Product Tour</a>
  <span> . </span>
  <a href="#smart-response-operations">Smart Ops</a>
  <span> . </span>
  <a href="#architecture">Architecture</a>
  <span> . </span>
  <a href="#install">Install</a>
</p>

---

## The Pitch

Chrome DevTools shows you HTTP. XRAY understands your API — and lets you bend it.

API investigation is normally a tab-switching routine: Network panel, Console, copied JSON, external formatter, copied cURL, handmade mocks, Postman for replay, notes somewhere else. XRAY compresses that whole loop into one extension surface, and adds the things DevTools never had: mock rules, request replay, GraphQL grouping, WebSocket frame capture, schema-drift detection, JWT decoding, and optional BYOK AI explanations.

<table>
  <tr>
    <td width="25%"><strong>Capture</strong><br><sub>fetch, XHR, WebSocket, SSE, GraphQL, console logs, real timing.</sub></td>
    <td width="25%"><strong>Understand</strong><br><sub>tree, grid, schema, diff, drift, JWT tokens, initiator stacks.</sub></td>
    <td width="25%"><strong>Operate</strong><br><sub>replay, edit-and-replay, mock rules, AI explain, console ops.</sub></td>
    <td width="25%"><strong>Export</strong><br><sub>cURL, fetch, axios, types, tests, HAR — and HAR/session import.</sub></td>
  </tr>
</table>

## What's New in 0.3

| Capability | What it does |
| --- | --- |
| **Mock rules** | Match requests by URL/method and return a mock body/status, inject latency, or force failure — applied in the page before the real network call. Seed a rule from any captured response with **Mock this**. |
| **Replay & Edit-and-Replay** | Re-fire any captured request from the page, or edit method/URL/headers/body first. Auth survives: the original request's sensitive headers are restored in the page (they never leave it) and cookies re-attach via credentialed replay. Replays are recaptured and diffed against the original. |
| **Real Visualize** | The Visualize view charts the response — numeric fields across rows, key/value magnitudes, or categorical frequency — as a single-series bar chart, and says so honestly when there's nothing numeric to plot. |
| **Theme Studio** | Presets (Operator, Dev, Midnight, Light, Claude) plus a full custom theme: pick any background/surface/text/accent, generate a whole theme from one color, randomize, adjustable corner radius, opt-in CRT "hacker" overlay, a live WCAG contrast checker, and shareable theme codes (`xray1:…` / `window.html#theme=…`). Every theme is scoped to the panel via inline CSS variables — it never touches the page or the capture runtime. |
| **GraphQL awareness** | Parses `operationName`/`query`/`variables` and groups by operation instead of piling everything under `POST /graphql`. |
| **WebSocket & SSE capture** | Wraps `WebSocket` and `EventSource`, streaming frames into a live Frames view with direction, size, and timing. |
| **Schema-drift watchdog** | Keeps a per-endpoint schema baseline and flags responses whose shape changed, with a one-click diff. |
| **Real timing waterfall** | Joins Resource Timing for DNS, connect, TLS, TTFB, and download phases — not a single fake bar. |
| **Initiator stacks** | Shows where each request was fired from on the page. |
| **JWT lens** | Detects and decodes JWTs in headers and bodies, showing header, payload, and expiry. |
| **AI explain (BYOK)** | Bring your own Anthropic or OpenAI key; XRAY calls the provider directly from the extension background to explain a request. Keys stay in local extension storage. |
| **Sessions & import** | Captured traffic survives page reloads, and you can import HAR files or XRAY session exports. |

## The Debugging Loop

<p align="center">
  <img src="docs/assets/readme/workflow-loop.png" alt="XRAY debugging workflow: capture, understand, operate, export" width="100%" />
</p>

XRAY is designed around the moment after you click a request and ask: what can I do with this response right now?

It answers with response-native operations. They switch views, copy generated artifacts, open the export modal, or insert prepared commands into Console or Notebook. They do not auto-run code.

## Product Tour

### 1. Network Inspector Pro

A dense API inspector that keeps the table wide, the selected request obvious, and the response detail close.

<p align="center">
  <img src="docs/assets/readme/api-network-inspector.png" alt="XRAY API Network Inspector Pro" width="100%" />
</p>

What is built in:

| Capability | Detail |
| --- | --- |
| Wide request table | Method, status, path, domain, type, timing, size, time, flags. |
| One selected row | Strong highlight and one active detail drawer at a time. |
| Smart flags | Error, Slow, Repeated, Large, Empty, Pinned. |
| Endpoint grouping | Count, errors, average/max timing, total size, last seen. |
| Fast lists | TanStack Virtual for long request and console streams. |
| Detail views | Tree, raw, grid, schema, diff, visualize, waterfall, headers. |

### 2. Console That Feels Familiar

The Console tab starts with DevTools fundamentals: compact filters, request stream, inline output, and a pinned prompt.

<p align="center">
  <img src="docs/assets/readme/console-workspace.png" alt="XRAY DevTools-style console workspace" width="100%" />
</p>

The selected request becomes command context:

```js
res
req
headers
entry
prev()
next()
similar()
errors()
slow(1000)
schema(res)
table(res.items || res)
diff(prev()?.responseDecrypted, res)
```

### 3. Export Everything Useful

The export modal is built for turning debugging state into real artifacts.

<p align="center">
  <img src="docs/assets/readme/export-modal.png" alt="XRAY export modal" width="100%" />
</p>

| Request exports | Session exports |
| --- | --- |
| JSON, raw response, cURL, fetch, axios | Session JSON |
| Schema, mock response, TypeScript, Zod | Session CSV |
| Jest test, MSW handler | Session HAR |

Formats that need a selected request are disabled with an explanation rather than behaving like dead controls.

### 4. Settings, Mobile, Insights

<table>
  <tr>
    <td width="66%">
      <img src="docs/assets/readme/settings-modal.png" alt="XRAY settings modal" width="100%" />
    </td>
    <td width="34%">
      <img src="docs/assets/readme/mobile-detail.png" alt="XRAY mobile API detail view" width="100%" />
    </td>
  </tr>
</table>

<p align="center">
  <img src="docs/assets/readme/insights.png" alt="XRAY local insights tab" width="100%" />
</p>

Settings are wired to state and runtime behavior where appropriate:

- Capture fetch and XHR toggles.
- Recording mode.
- Max entries.
- Slow and very-slow thresholds.
- Default detail view.
- Compact rows.
- Show host in path.
- Accent color.
- Destructive-action confirmations.

## What Makes It Different

<p align="center">
  <img src="docs/assets/readme/feature-grid.png" alt="XRAY feature grid" width="100%" />
</p>

| Ordinary inspector | XRAY |
| --- | --- |
| Shows requests | Turns selected requests into executable context. |
| Shows JSON | Adds tree, raw, grid, schema, diff, visualize, waterfall. |
| Copies cURL | Exports cURL, fetch, axios, types, schemas, mocks, tests, HAR, CSV. |
| Global assistant feed | Response-native operations beside the current response. |
| One panel mode | Floating HUD, DevTools panel, and pop-out window. |
| String rendering risk | Text-rendered output, bounded serialization, no unsafe HTML. |

## Smart Response Operations

XRAY does not need a separate Copilot tab to feel intelligent. The selected response gets the operations it deserves.

| Situation | Operations XRAY can surface |
| --- | --- |
| JSON object or array | Schema, Table, Visualize, Send to Console, Send to Notebook. |
| 4xx or 5xx response | Inspect Error, Related Errors, Compare Previous. |
| Slow request | Similar Calls, Waterfall, Slow Calls. |
| Repeated endpoint | Similar Calls, Endpoint Groups, Waterfall. |
| Large payload | Schema, Table, Copy Full. |
| Empty response | Headers, Request, Similar Calls. |
| Schema drift | Compare Previous, Diff, Schema. |

Operations stay user-controlled:

```txt
view operation      -> switch response view
copy operation      -> copy generated text
console operation   -> insert command, do not run
notebook operation  -> create a cell, do not run
export operation    -> open export modal
```

## Three Surfaces

| Surface | Open with | Use it for |
| --- | --- | --- |
| Floating HUD | Extension icon or `Ctrl+Shift+X` | Fast debugging without leaving the page. |
| DevTools panel | Browser DevTools -> XRAY | Long investigation beside Elements, Network, and Console. |
| Pop-out window | Window button inside XRAY | Wide response inspection and export workflows. |

The HUD is draggable, resizable, collapsible, and mounted in a closed Shadow DOM host.

## Architecture

<p align="center">
  <img src="docs/assets/readme/architecture-map.png" alt="XRAY architecture map" width="100%" />
</p>

The important boundary:

```txt
React owns UI.
Vanilla scripts own extension runtime.
```

Why this matters:

- MAIN-world interception remains simple and compatible.
- React never needs to run inside page interception code.
- UI can be redesigned without rewriting capture.
- Console execution remains behind the existing hardened bridge.
- The same React app can mount into HUD, DevTools, and pop-out surfaces.

## Tech Stack

| Layer | Choice |
| --- | --- |
| Extension | Manifest V3 |
| UI | React + TypeScript |
| Build | Vite IIFE bundles |
| State | Zustand |
| Virtualization | `@tanstack/react-virtual` |
| Icons | `@tabler/icons-react` |
| Styling | Catppuccin Mocha tokens scoped with Shadow DOM `:host` |
| Runtime | Vanilla JavaScript content scripts and service worker |

The extension UI does not load web fonts, CDN scripts, or remote UI assets.

## Install

```bash
git clone https://github.com/rahuldr07/xray-extension.git
cd xray-extension
npm install
npm run build
```

Load it in Chrome or Edge:

1. Open `chrome://extensions` or `edge://extensions`.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select the `xray-extension` folder.
5. After rebuilding, reload the extension from the browser extensions page.

## Development

```bash
npm run dev               # Vite dev server for preview pages
npm run build             # Build dist/panel-ui.js, dist/hud-ui.js, dist/window-ui.js
npm run typecheck         # TypeScript check
npm run lint              # ESLint across TS/React, the vanilla runtime, and Node
npm test                  # Regression + unit suites
npm run test:e2e          # Load the unpacked extension in real Chromium
npm run test:coverage     # Test run with coverage reporting
npm run check             # typecheck + lint + build + tests
npm run package:extension # check, then write release/xray-extension-<version>.zip
```

`dist/` is committed and loaded directly by an unpacked install, so rebuild and commit
it alongside any change under `src/`. Builds are reproducible: pin `SOURCE_DATE_EPOCH`
and identical source gives byte-identical bundles.

See [CONTRIBUTING.md](CONTRIBUTING.md) before your first change — the test suite pins
exact source strings, and that convention is easy to break unknowingly.

Preview routes:

```txt
http://127.0.0.1:8765/preview/ui-preview.html?tab=console
http://127.0.0.1:8765/preview/ui-preview.html?tab=api
```

## Project Map

```txt
xray-extension/
  background.js                 # service worker: toggles, debugger eval, DevTools relay, AI provider bridge
  manifest.json                 # MV3 scripts, permissions, web accessible bundles
  window.html                   # pop-out window host
  content/
    interceptor.js              # MAIN world fetch/XHR/WebSocket/SSE capture, mock rules, replay
    console-capture.js          # MAIN world console capture
    console-executor.js         # MAIN world command execution bridge
    decrypt-bridge.js           # MAIN world decrypt relay
    content.js                  # isolated relay into XRAY_Panel (adds/updates entries)
    hud-mount.js                # closed-shadow floating HUD host
  src/panel/
    App.tsx                     # shared React app
    main.tsx / hud-main.tsx / window-main.tsx   # bundle entries (panel, HUD, pop-out)
    store.ts                    # Zustand state (entries, rules, AI settings, drift, sessions)
    components/                 # console, api, detail, export, rules, replay, ai, settings, notebook, insights
    models/                     # pure logic: entries, operations, export, import, rules, drift, lenses, detail
    runtime/                    # bridges to console, storage, capture config, AI
    styles/                     # tokens and HUD styles
  shared/
    console-helpers.js          # request-aware helper primitives
    decrypt.js                  # pluggable decrypt function
    store.js                    # storage wrapper
    worker-client.js            # worker client with fallback
  panel/
    console.js                  # console engine (the only retained vanilla panel script)
  workers/xray-worker.js        # off-main-thread schema/diff/grid/detail analysis + IndexedDB
  preview/ui-preview.html       # local React preview harness
  test/security-regressions.test.js
```

## Verification

Current baseline:

```txt
npm run check
typecheck: passed
build: passed
tests: 76 passed
```

Extra syntax sweep used for retained vanilla JavaScript:

```powershell
$files = rg --files -g "*.js" -g "!node_modules/**"
foreach ($file in $files) {
  node --check $file
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
```

## Security Notes

XRAY injects into every frame of every URL, retains request and response bodies, keeps
authorization headers so requests can be replayed, and decodes JWTs. It concentrates
secrets from every site you visit into one place. Read
[docs/threat-model.md](docs/threat-model.md) before using it anywhere the captured
traffic matters.

What holds:

- Captured strings render as text, not HTML. A sweep for every raw-HTML sink across the
  codebase found no injection path for response bodies.
- The extension CSP has no `unsafe-eval`, and there is no `externally_connectable`.
- Command execution is session-scoped and result-bounded.
- Large and circular values serialize safely in the panel.
- No Google Fonts, CDN scripts, or remote UI assets.
- Shadow DOM tokens are defined with `:host`, not `:root`.
- Sensitive request headers are redacted in the page realm before entries leave it —
  verified end-to-end, not just asserted against the source.

What does not, and is **open**:

- **The MAIN world is not a security boundary.** The bridge token, console session
  nonce and decrypt hook all live on the page's own `window`, so a hostile page can
  read or replace them — disabling capture silently, injecting fabricated entries, or
  reading the captured context when you run a console command.
- **Header redaction is a denylist**, so it cannot cover every auth scheme, and it does
  not touch URLs or request bodies.
- **The `debugger` permission is the primary console path**, not a fallback.

These are documented rather than hidden. See the threat model for the full set and the
intended direction on each.

## Design Tokens

```css
:host {
  --xray-bg: #1e1e2e;
  --xray-surface: #181825;
  --xray-surface2: #313244;
  --xray-text: #cdd6f4;
  --xray-green: #a6e3a1;
  --xray-blue: #89b4fa;
  --xray-yellow: #f9e2af;
  --xray-red: #f38ba8;
  --xray-mauve: #cba6f7;
  --xray-teal: #94e2d5;
  --xray-peach: #fab387;
  --xray-hint: #6c7086;
  --xray-subtext: #a6adc8;
  --xray-font: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
}
```

## License

ISC — see [LICENSE](LICENSE).
