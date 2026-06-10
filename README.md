# XRAY - React API Debugging Extension

XRAY is a Manifest V3 browser extension for inspecting API traffic, console output, response data, exports, and request-aware debugging commands. The runtime capture layer stays vanilla JavaScript for compatibility with page execution worlds, while the user-facing panel is a bundled React + TypeScript UI.

## What XRAY Does

- Captures `fetch` and XHR requests from the page MAIN world.
- Captures `console.log`, `console.warn`, `console.error`, `console.table`, and related page console events.
- Shows a dense DevTools-style Console surface with a request table, filters, selected request context, and pinned command prompt.
- Provides a Network Inspector Pro API tab with virtualized rows, endpoint grouping, selected-row highlighting, and a detail drawer.
- Adds response-native Smart Ops such as Schema, Table, Visualize, Compare Previous, Copy cURL, Copy fetch, Send to Console, Send to Notebook, Related Errors, and Similar Calls.
- Exports selected requests or full sessions as JSON, cURL, fetch, axios, schema, mock data, TypeScript, Zod, Jest, MSW, CSV, and HAR where applicable.
- Provides Notebook, Insights, Settings, command palette, quick settings modal, and confirmation-safe destructive actions.
- Supports three panel modes from one React app: DevTools panel, floating HUD, and pop-out window.

## UI Modes

XRAY has one React UI with three mounts:

| Mode | How It Opens | Purpose |
| --- | --- | --- |
| Floating HUD | Extension icon or `Ctrl+Shift+X` | Draggable, resizable overlay on the current page. |
| DevTools | Browser DevTools -> XRAY tab | Dedicated debugging workspace attached to the inspected tab. |
| Pop-out Window | Window icon in the XRAY topbar | Full-window inspection surface for large API sessions. |

The capture/runtime scripts are not React:

- `content/interceptor.js` owns MAIN-world `fetch` and XHR interception.
- `content/console-capture.js` owns MAIN-world console capture.
- `content/console-executor.js` owns page command execution bridge.
- `content/content.js` relays captured entries to the panel API.
- `background.js` owns action toggles, DevTools relay, pop-out windows, and debugger-backed console execution.

## Tech Stack

- Browser extension: Manifest V3
- UI: React, TypeScript, Vite
- State: Zustand
- Virtualization: `@tanstack/react-virtual`
- Icons: `@tabler/icons-react`
- Styling: Shadow DOM-safe Catppuccin Mocha CSS tokens
- Runtime: vanilla JavaScript content scripts, background service worker, and shared helpers

No remote fonts, CDN scripts, or external assets are loaded by the extension UI.

## Install For Development

```bash
git clone https://github.com/rahuldr07/xray-extension.git
cd xray-extension
npm install
npm run build
```

Then load the extension:

1. Open `chrome://extensions` or `edge://extensions`.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select the `xray-extension` folder.
5. After rebuilding, click the extension reload button in the browser extensions page.

The checked-in `dist/` files are used by `manifest.json`, but `npm run build` should be run after source changes.

## Development Commands

```bash
npm run dev        # Vite development server for preview pages
npm run build      # Build dist/panel-ui.js, dist/hud-ui.js, dist/window-ui.js
npm run typecheck  # TypeScript check
npm test           # Regression tests
npm run check      # typecheck + build + tests
```

Useful local preview routes after `npm run dev -- --host 127.0.0.1 --port 8765`:

- `http://127.0.0.1:8765/preview/ui-preview.html?tab=console`
- `http://127.0.0.1:8765/preview/ui-preview.html?tab=api`

For extension-style static testing of built files, serve the repo root and open:

- `/window.html`

## Project Structure

```text
xray-extension/
  background.js                 # MV3 service worker, toggles, debugger eval, DevTools relay
  manifest.json                 # MV3 scripts, permissions, web accessible bundles
  window.html                   # Pop-out window host
  content/
    interceptor.js              # MAIN world fetch/XHR capture
    console-capture.js          # MAIN world console capture
    console-executor.js         # MAIN world command execution bridge
    decrypt-bridge.js           # MAIN world decrypt relay
    content.js                  # ISOLATED relay into XRAY_Panel
    hud-mount.js                # Closed-shadow floating HUD host
  src/panel/
    main.tsx                    # React panel bundle entry
    hud-main.tsx                # React HUD bundle entry
    window-main.tsx             # React pop-out bundle entry
    App.tsx                     # Shared React app
    store.ts                    # Zustand panel state
    components/                 # Console, API, detail, export, settings, notebook, insights
    models/                     # Typed pure models for entries, exports, operations, settings
    runtime/                    # Bridges to vanilla console/storage/capture config
    styles.css                  # Main React UI styles
    styles/tokens.css           # Shadow DOM :host design tokens
    styles/hud.css              # HUD-specific sizing rules
  shared/
    console-helpers.js          # Request-aware console helper primitives
    decrypt.js                  # Pluggable decrypt function
    store.js                    # Storage wrapper
    utils.js                    # Shared utilities
    worker-client.js            # Worker client with extension-safe fallback
  devtools/
    devtools.html
    devtools.js
    devtools-panel.html
  preview/
    ui-preview.html             # Local React UI preview harness
  test/
    security-regressions.test.js
  dist/
    panel-ui.js                 # Built React panel IIFE
    hud-ui.js                   # Built React HUD IIFE
    window-ui.js                # Built React pop-out IIFE
```

## Console Helpers

When a request is selected, XRAY prepares request-aware aliases and helpers for Console and Notebook workflows:

```js
res
req
headers
entry
prev()
next()
similar()
errors()
slow(500)
status(500)
endpoint('/api/users')
domain('api.example.com')
schema(res)
table(res.items || res)
diff(prev()?.responseDecrypted, res)
mock(entry)
```

Prepared Smart Ops insert commands into Console or Notebook. They do not auto-run code.

## Export Formats

Selected request exports:

- JSON
- Raw response
- cURL
- `fetch()`
- axios
- schema
- mock response
- TypeScript type
- Zod schema
- Jest test
- MSW handler

Session exports:

- Session JSON
- Session CSV
- Session HAR

Formats that need a selected request are disabled in session mode with explanatory UI rather than dead buttons.

## Settings

Quick settings modal and full Settings tab share persisted state:

- Capture fetch
- Capture XHR
- Recording
- Max entries
- Slow and very-slow thresholds
- Default detail view
- Compact rows
- Show host in path
- Accent color
- Confirm destructive actions

Capture toggles publish a small message to the vanilla MAIN-world interceptor so the UI preference affects new captured entries.

## Security And Safety

- Content scripts validate message source where page messages are consumed.
- Console execution bridge uses XRAY session identifiers and bounded result serialization.
- UI rendering avoids unsafe HTML for captured strings, logs, and response data.
- Large and circular objects are serialized safely.
- Shadow DOM styles use `:host` tokens, so the panel does not depend on page CSS.
- The extension does not load web fonts or remote UI assets.

## Verification Checklist

Before pushing a release branch or main:

```bash
npm run typecheck
npm run build
npm test
```

For a complete local check:

```bash
npm run check
```

Optional syntax sweep for retained vanilla JavaScript:

```powershell
$files = rg --files -g "*.js" -g "!node_modules/**"
foreach ($file in $files) {
  node --check $file
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
```

## License

MIT
