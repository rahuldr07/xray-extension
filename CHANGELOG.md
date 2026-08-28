# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

Correctness pass. The previous entry made the project testable; this one uses those
tests to fix everything they found. All 21 logic bugs recorded in `docs/known-issues.md`
are fixed, along with the critical finding from `docs/threat-model.md`. Every bug's test
now describes the corrected behaviour and carries a `FIXED` marker naming what the old
behaviour was, so the record survives in the assertion rather than in a document.

### Security

- **C-1 (critical): the console handed cross-origin captured traffic to page-controlled
  code.** The debugger-evaluated expression read `window.XRAY_ConsoleHelpers`, a plain
  writable page global, so a page that replaced `createRuntime` received the entire console
  context — captured URLs across every origin in the restored session, full bodies for the
  selected entry and its same-endpoint neighbours, decoded JWT claims — the moment the user
  ran any expression at all, including `1+1`. A second path posted the same context into
  the page with `targetOrigin: '*'`, no token and no nonce. The helper source is now inlined
  into the evaluated expression and run against a shadowed `window`, so the page global is
  neither read nor written, and the MAIN-world fallback is deleted outright:
  `content/console-executor.js` is removed from the repo and the manifest, and a failed
  debugger attach returns an error instead of falling back.
- **CSV formula injection in both exporters.** Neither `escapeCSV` in
  `workers/xray-worker.js` nor `toCSV` in `shared/console-helpers.js` neutralised a cell
  beginning `=`, `+`, `-` or `@`, so captured response data landed in a spreadsheet cell
  that Excel, Sheets or LibreOffice would evaluate on open. RFC4180 quoting is not a
  defence — the spreadsheet strips the quotes first. Both now prefix an apostrophe, while
  exempting plain numbers so a negative duration stays a number.

### Fixed — wrong results

- The Diff view reported "no changes" for two equal-length arrays that differed past index
  50: the truncation notice was gated on differing lengths.
- Insights flagged a false N+1 on every GraphQL app, grouping by URL so distinct operations
  collapsed into one `POST /graphql` bucket. It now groups the way the request list does.
- Insights ignored the configured slow threshold entirely and hardcoded `> 500`,
  disagreeing with the request list at exactly 500 ms. `ConsoleWorkspace` used `>` where
  the models used `>=`; all now agree.
- Charts dropped categories past the 40-bar cap while hardcoding `truncated: 0`.
- Global search claimed truncation when exactly 200 matches were found and nothing was cut.
- `analyzeEntries` divided total duration by every request rather than the timed ones,
  reporting 33 ms where the true mean was 100 ms.

### Fixed — data loss and hangs

- A cyclic payload made the worker's `safeClone` allocate forever. Because the recursion is
  `async` nothing ever threw, so no reply was posted and the caller hung for the life of the
  worker while the heap grew (~4 GB in 40 s) until the worker died, taking every in-flight
  request and the entry cache with it.
- `computeDiff` overflowed the stack on cyclic input, and on an asymmetric cycle emitted a
  raw cyclic node that threw in any consumer that serialised the diff. It is now depth-capped
  and cycle-pair aware, so two identical cyclic objects diff to nothing instead of 50 levels
  of spurious changes.
- One unparseable timestamp threw `RangeError` out of an entire CSV or HAR export,
  discarding every good entry alongside it.
- HAR `time: -1` ("unknown" in the spec) was truthy, so the `timings.wait` fallback was
  skipped and a negative duration was imported — and written straight back out on re-export.

### Fixed — silent degradation

- Response action buttons lost their best behaviour when several conditions applied:
  `pushUnique` kept the first variant pushed, so a slow *and* drifted request got a console
  action at priority 78 instead of the diff view at 87. It now keeps the highest priority.
- A partial in-memory settings update with an explicit `undefined` switched off every
  boolean defaulting to true.
- `null` and `[]` coerce to a finite 0, so numeric settings clamped to their floor instead
  of falling back: a stored `maxEntries: null` became 50, not 1000.
- Three-digit hex overrides were discarded while three-digit base colours in the same
  pasted block survived.
- `safeStringify` reported a repeated sibling as `[Circular]`, mangling acyclic data.
- Out-of-range theme seeds all produced one identical "random" theme.
- `shared/utils.js`: `methodClass` threw on a non-string method, `shortPath` threw on
  nullish input from inside the catch handler meant to prevent exactly that, its
  three-segment branch had no length cap, and `safeClone` returned the original reference on
  failure so writes to the "clone" mutated the source.
- `toCSV` emitted an unescaped header row, and took its columns from row 0 only, so any key
  absent from the first row was silently dropped. The two CSV writers also disagreed on
  quoting and on non-string values; they now produce identical bytes.

### Added

- `PRIVACY.md` and `docs/store-listing.md` — the privacy policy and permission
  justifications a Chrome Web Store submission requires, both blockers for the listing.
- `PRODUCT.md` — the durable product record: primary user, distribution intent, and the
  facts future work must not fabricate.

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

- **AI Explain works with any provider, not just the two built in.** A `custom` provider
  takes an endpoint URL, model name, and key, and speaks the OpenAI-compatible
  `/chat/completions` shape — the de facto standard across OpenRouter, Groq, Together,
  DeepSeek, Mistral, Azure, and local servers like Ollama and LM Studio. The auth header
  name and prefix are configurable for the few providers that differ. Responses are
  parsed in both OpenAI and Anthropic shapes, so an Anthropic-compatible endpoint works
  without declaring which shape it speaks.

  Because the endpoint is user-supplied rather than hardcoded, it is validated in the
  service worker: **https is required, with plain http allowed only for loopback** so a
  local model server still works. Captured request and response bodies are what travel
  to this endpoint, so a typo'd public URL must not ship them in the clear.
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

### Fixed (UI)

Found by driving the real extension in Chromium and measuring, not by reading source.

- **The Console tab — the default tab — was empty after every session restore.**
  `restoreEntries` set `entries` alone while `ConsoleWorkspace` reads `consoleEvents`,
  so the first thing shown on every reopen was "No network activity yet" above an
  `API 34` badge. HAR imports had the same gap.
- **Ctrl+K and Ctrl+Shift+F were dead in the pop-out window.** The handler lived inside
  `main.tsx` and `window-main.tsx` never called it. It now lives in
  `runtime/panelKeyboard.ts`, gated so Escape cannot dismiss the pop-out — which would
  leave nothing on screen and no way back.
- **Light themes were substantially unreadable.** 178 literal `rgba()` declarations could
  not respond to a theme; the accent was a fixed pastel applied inline, measuring
  1.33–2.80 contrast on light backgrounds and putting the focus ring below the 3:1 floor.
  Both are fixed, and every audited selector now clears 3:1 with most clearing 4.5:1.
- **The pop-out and the options page ignored the theme entirely** — a hardcoded dark slab
  and a separate indigo design on the stale `--xr-*` convention. Both follow the theme now.
- **The primary nav was not a tablist**, so the active tab was conveyed by a CSS class
  alone and every tab was its own tab stop. Now a real tablist with roving tabindex and
  arrow/Home/End traversal.
- **The toast live region was mounted together with its message**, which is unreliably
  announced. It is always present now.
- **The request list ignored Home, End, PageUp, PageDown and Space.** Space fell through
  to the native scroller, moving the viewport while the selection stayed put.
- `ConsoleWorkspace.tsx` contained a literal NUL byte that made the file register as
  binary to `file(1)` and `grep`.

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
