# XRAY — API Operations Console (Chrome MV3 extension)

React 19 + TypeScript + Vite panel UI (`src/panel/`, built as IIFE bundles into `dist/`),
vanilla JS capture runtime (`content/`, `shared/`, `background.js`) that must stay
dependency-free. Zustand store, TanStack Virtual lists, Tabler icons. Package manager: npm.

## Commands
- `npm run typecheck` — tsc --noEmit
- `npm run build` — vite build (emits dist/panel-ui.js, dist/hud-ui.js, dist/window-ui.js)
- `npm test` — node --test (test/security-regressions.test.js, source-pinning assertions)
- `npm run check` — typecheck + build + test (run this after every change)
- `npm run package:extension` — check + zip to release/

## Conventions
- Many tests pin exact source strings (regex over file contents). When changing wired
  behavior, update the pinned assertion to describe the NEW wiring — never delete it.
- Chrome injects a content-script FILE only once per frame across worlds; world-bridging
  uses dynamic import() + isolated-world window handoffs (see hud-mount.js, content.js).
- Sensitive headers are redacted in the MAIN world before entries leave it; anything the
  panel needs from them (e.g. JWT claims) must be extracted pre-redaction in interceptor.js.
- E2E harness: headless Playwright Chromium + raw CDP scripts in the session scratchpad;
  wipe the harness chrome-profile after changing background.js or content scripts
  (both are cached), and pass --no-sandbox on machines where the ms-playwright exe
  ACLs break sandbox child spawning.
