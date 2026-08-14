# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

Engineering hardening pass. No user-facing feature changes; the extension behaves
as it did, but it is now testable, buildable, and reviewable.

### Security

- **Command injection in "Copy as cURL".** `generateCurl` interpolated the captured URL
  raw into a single-quoted shell word, while the header and body sites two lines below
  escaped correctly. Since the URL is whatever the intercepted request used — and the
  WHATWG parser leaves an apostrophe in a path or query intact — a page issuing
  `fetch("https://x.test/a';id;echo'")` produced a command that ran `id` when the
  operator pasted it. Imported HAR files were a second unfiltered source, and the
  method was interpolated bare as a second injection point. The panel's fallback had
  the same class of bug via `JSON.stringify`, whose double quotes still permit `$(...)`.
- `content/console-capture.js` accepted `postMessage` events from any source. Every
  other bridge listener rejects events whose `source` is not this window; this one
  was missed, leaving its lazy-object handler addressable by a cross-origin frame
  or opener.
- The console session nonce was assigned unconditionally, so any page script could
  overwrite the live session id and permanently wedge the console — every real exec
  request afterwards failed the nonce check and was silently dropped. Now
  first-write-wins, matching the bridge-token handshake.
- The service worker's message router dereferenced `msg` with no guard and never
  checked `sender.id`. `xray:page-bridge` also took its target tab id straight from
  the message, so any content script — and one runs on every frame of every URL —
  could push config or a replay request into any other tab. Content-script senders
  are now pinned to their own tab.
- `storageBridge` fell back to `localStorage` when `XRAY_Store` was missing. In a
  content script that is the *page's* `localStorage`, so the fallback could write
  the BYOK API key into the visited site's storage in plaintext. It now fails closed.
- Added [`docs/threat-model.md`](docs/threat-model.md) and [`SECURITY.md`](SECURITY.md),
  recording the full review — **including findings that remain open and unfixed**,
  one of them critical.

### Added

- GitHub Actions CI: typecheck, lint, build and test on Node 20.11 and 22, plus
  jobs verifying build reproducibility, that committed `dist/` matches source, that
  the release archive is well-formed and carries no source, and an end-to-end run.
- ESLint (flat config across all three runtimes in the tree) and Prettier.
- An end-to-end harness in `test/e2e/` that loads the unpacked extension into a real
  Chromium and asserts both that capture works and that raw credentials never leave
  the page realm. It previously existed only in an ephemeral scratchpad.
- Behavioural unit tests in `test/unit/` that execute the panel's pure logic. The
  existing suite matched regexes against source text; only 12 of its 968 assertions
  ran any product code.
- Coverage reporting via `npm run test:coverage`.
- `LICENSE` (ISC, matching the existing declaration), `CONTRIBUTING.md`,
  [`docs/architecture.md`](docs/architecture.md), and Dependabot.

### Changed

- Builds are reproducible. The build stamp came from `new Date()`, so every build
  rewrote all three bundles and left `dist/` dirty with no source change; it now
  honours `SOURCE_DATE_EPOCH`.
- `dist/hud-ui.js` and `dist/window-ui.js` are minified. The esbuild path had no
  minify flag, unlike Vite's build of `panel-ui.js`, so each shipped roughly 1.2 MB
  of unminified source — about 1.3 MB removed from the packaged extension.
- Packaging is a dependency-free Node script and runs on any platform. It was
  PowerShell, so it could only run on Windows.
- `test/security-regressions.test.js`, a single 96 KB file holding all 88 tests, is
  now 16 focused suites plus shared helpers. Verified by machine diff: 88 test blocks
  before and after, byte-identical, assertion count unchanged at 968.
- `npm test` globs the actual test files. Bare `node --test` counted every file under
  `test/`, including helpers, as a passing test.

### Fixed

- `PanelShell` read `resize.current` — a ref — during render to decide the dragging
  class. Ref mutations do not re-render, so the class only appeared when an unrelated
  state change happened to trigger one.
- Cleared all dependency advisories: three high-severity issues in nanoid, postcss
  and vite, plus an esbuild bump. The tree reports zero vulnerabilities.
- Filled in package metadata: the description was a mangled markdown blockquote,
  `author` was empty, and the declared ISC license had no `LICENSE` file.

### Known issues

Several security findings are **open**. See
[`docs/threat-model.md`](docs/threat-model.md) — most importantly that the MAIN
world is not a security boundary, so the bridge token, console session nonce and
decrypt hook can all be read or replaced by a hostile page.

## [0.3.0]

Baseline for this changelog. Earlier history is in the commit log.
