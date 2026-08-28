# Contributing to XRAY

## Setup

```bash
npm install
npm run check    # typecheck → lint → build → test
```

Node 20.11 or newer. CI runs on 20.11 and 22.

Load the extension: `chrome://extensions` → Developer mode → **Load unpacked** →
select the repo root. After changing `background.js` or any content script, hit
reload on the extension card *and* reload the page under test — Chrome caches both.

## Commands

| Command | What it does |
|---|---|
| `npm run check` | Everything CI runs. Use this before pushing. |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint. Fails on errors; warnings are tracked debt. |
| `npm run build` | Emits `dist/panel-ui.js`, `dist/hud-ui.js`, `dist/window-ui.js` |
| `npm test` | `node --test` |
| `npm run package:extension` | Checks, then writes `release/xray-extension-<version>.zip` |

## Three conventions that will bite you

### 1. Many tests pin exact source strings

Most of the suite asserts with regexes over file *contents* rather than by executing
code. Changing a line of source can fail a test in a file you never opened.

**When you change wired behaviour, update the pinned assertion to describe the new
wiring. Never delete it.** The assertion is the record of why the wiring is the way
it is; deleting it silently discards a decision someone made deliberately.

Some pins are brittle by nature — they match exact newline positions (`\s*\n\s*`),
full function signatures, or literal CSS values. If one breaks on a purely cosmetic
edit, prefer rewriting it to pin the same *intent* more robustly (the
`indexOf(a) < indexOf(b)` ordering idiom in `manifest-packaging.test.js` is a good
model) over loosening it to match anything.

New tests should execute code wherever possible. `test/unit/` is for behavioural
tests; the top-level suites are the source-pinning regression net.

### 2. Prettier is configured but the repo is not formatted

`.prettierrc.json` exists so new code has a shared style, but **no repo-wide format
pass has been run and CI does not gate on `format:check`.** Reformatting a file
would move newlines that the tests above pin, failing them for cosmetic reasons.

Format the code you write. Do not reformat files you are only passing through.

### 3. `dist/` is committed

An unpacked install loads `dist/` directly, so a stale bundle ships broken behaviour
even when the source is correct. **Run `npm run build` and commit `dist/` alongside
any change under `src/`.** CI's `dist-sync` job fails the build otherwise.

Builds are reproducible: set `SOURCE_DATE_EPOCH` to pin the build stamp, and
identical source produces byte-identical bundles.

## Architecture, briefly

Three runtimes share this tree, and they have different rules:

- **`src/`** — React 19 + TypeScript, bundled by Vite/esbuild into `dist/`.
- **`content/`, `shared/`, `workers/`, `background.js`** — the capture runtime.
  **Must stay dependency-free.** It is injected into every page; it cannot assume a
  bundler, and anything it pulls in ships to every site the user visits.
- **`test/`, `scripts/`** — Node.

Content scripts run in two worlds. The **MAIN world** shares the page's globals; the
**ISOLATED world** does not. Chrome injects a content-script *file* only once per
frame across worlds, so cross-world sharing uses dynamic `import()` of a
web-accessible resource plus isolated-world `window` handoffs — see
`content/hud-mount.js` and `content/content.js`.

**The MAIN world is not a security boundary.** Anything on its `window` is readable
and replaceable by the page. Do not put secrets there, and treat every message
arriving from it as untrusted input. See [docs/threat-model.md](docs/threat-model.md).

Sensitive headers are redacted in the MAIN world before entries leave it. Anything
the panel needs from them — JWT claims, for instance — must be extracted
*pre-redaction* in `content/interceptor.js`.

## Pull requests

- `npm run check` passes.
- Behavioural changes come with a test that executes the code.
- Security-relevant changes say plainly what the new trust assumption is.
- Commit messages explain *why*, not what the diff already shows.

## End-to-end testing

The E2E harness drives headless Chromium with the unpacked extension loaded. Two
environment caveats it already handles, worth knowing if you extend it:

- Wipe the harness Chrome profile after changing `background.js` or a content
  script — both are cached across launches.
- Pass `--no-sandbox` where the `ms-playwright` executable's ACLs prevent the
  sandbox from spawning child processes.
