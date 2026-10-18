# Settings, Export and Themes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every setting truthful, every export format valid on every surface, both modals calm at every width, and every theme preset readable.

**Architecture:** Capture fixes live in the page scripts (`content/interceptor.js` MAIN world, `content/content.js` ISOLATED world). Export fixes are in the pure generators (`src/panel/models/export.ts`, `src/panel/utils.ts` fallbacks) plus `ExportModal.tsx` labels/layout. Settings behaviour is in the store (`src/panel/store.ts`, `src/panel/models/panelSettings.ts`); Settings content/layout in `SettingsModal.tsx` and `styles.css`. Theme fixes are token-level in `styles.css`, `src/panel/styles/tokens.css`, `panelSettings.ts`, `customTheme.ts`, guarded by a new contrast-matrix unit test.

**Tech Stack:** Chrome MV3 content scripts (plain JS), React 19 + Zustand, Vite build to `dist/`, Node test runner (`test/*.test.js`, `test/unit/*.test.mjs` with `test/unit/harness.mjs` for `.ts`), Playwright E2E (`test/e2e/*.e2e.mjs`, esbuild fixtures, document + closed shadow).

**Spec:** `docs/superpowers/specs/2026-10-13-settings-export-themes-design.md` — items C1–C4, E1–E8, S1–S9, L1–L6, T1–T12 carry the exact values. Read the items your task names; copy values verbatim. Audit evidence: `output/settings-audit/REPORT.md` (finding numbers `#N`), `output/theme-audit/` (screenshots, `static.mjs.txt` shows how token pairs were computed).

## Global Constraints

- No new dependencies. Theme tokens only (no literal colours outside token definitions). `prefers-reduced-motion`. Document, closed-shadow HUD, pop-out window and DevTools surfaces.
- Persisted settings stay backward compatible: removed settings' stored keys stay readable and are ignored; no migration drops data.
- Capture privacy: with a transport off, no request of that transport reaches the panel, including the first ones after page load.
- Accessible names pinned by existing tests stay unless the test is deliberately updated with a one-line reason in the report.
- Never commit, stash, reset or checkout (the user's tree is uncommitted). Lint 0 errors, warnings ≤ 53 (`npx eslint .`). After any `src/` change: `npm run build` and `node scripts/check-dist-sync.mjs`.
- Scratch files go under `output/` with a `.txt` suffix for scripts; nothing temporary under `test/`.

## Review Focus

- **Config never arrives** (extension context invalidated, storage read fails): captures buffered by C1 are flushed with defaults after 3 s, the buffer never exceeds 50, and nothing throws in the page. → Task 1 test `pending buffer: timeout flush and cap`.
- **Huge or binary bodies in exports** (2 MB JSON, a base64 image string): downloads stay valid; generated code uses the 1 MB omission marker; the preview stays capped and responsive. → Task 2 tests `exports at 240 KB and 2 MB`.
- **Settings stored by an older version** (keys `verySlowThresholdMs`, `defaultDetailView`, `compactRows`, unknown accent ids, custom theme with removed swatches): load without errors, UI shows sane values, nothing is dropped from storage. → Task 3 test `legacy settings load unchanged`.
- **Confirmation turned off, then a destructive action from the keyboard** (Command Palette "Clear console"): runs immediately, no dialog, focus stays sane. → Task 3 E2E `palette clear without confirmation`.
- **Narrow pop-out window (420 px) with the Export modal on a Session**: format select usable, preview fills height, Download works. → Task 5 E2E `export narrow select`.

---

### Task 1: Capture correctness (C1, C2)

**Files:** Modify `content/interceptor.js`, `content/content.js`. Test: `test/capture-interceptor.test.js` (existing harness for the interceptor), and the real-extension check in Task 7.

**Interfaces:** Produces: interceptor accepts the existing `__xray_config__` message unchanged; new internal pending buffer (no new message types). `content.js` posts `{ __xray_config__: true, source: 'xray-relay', token, config: { captureFetch, captureXhr, captureWs, rules } }` from stored preferences once the bridge token is known.

- [ ] **Step 1: Failing tests** in `test/capture-interceptor.test.js`: `no capture before config when the transport is off` (config `{captureFetch:false}` posted after an early fetch → zero `__xray_capture__` posts for it); `early captures flush when enabled` (config all-on → the early capture is posted once); `pending buffer: timeout flush and cap` (no config, 60 early fetches, advance 3 s → exactly 50 posted, newest kept); `rules apply with capture off` (enabled mock rule + `captureFetch:false` → fetch resolves to the mock body, no capture posted); same for XHR. Read the file's existing setup to drive the interceptor and fake timers.
- [ ] **Step 2:** Run `node --test test/capture-interceptor.test.js` → new tests FAIL.
- [ ] **Step 3: Implement** C1 (pending buffer, flush on first config, 3 s default flush, cap 50) and C2 (match rules before the capture guard; the guard only skips emitting) in `interceptor.js`; in `content.js`, after the bridge token is set, read stored preferences through `XRAY_Store` (key `xray_react_panel_preferences`, `.settings.captureFetch/.captureXhr/.captureWs`, plus stored rules — find where `serializeRulesForRuntime` reads them in `src/panel/models/rules.ts`/`captureConfig.ts` and read the same storage) and post the config; failures are silent (the timeout covers them).
- [ ] **Step 4:** Run the test file → PASS; `npm test` → all pass.
- [ ] **Step 5: Gate:** `npx eslint . && npm test`.

### Task 2: Export correctness (E1–E8)

**Files:** Modify `src/panel/models/export.ts`, `src/panel/utils.ts` (fallbacks), `src/panel/components/export/ExportModal.tsx` (labels, descriptions, filenames, MSW disabled reason), `window.html` (script tags). Test: the existing export unit test file (`grep -l "export.ts\|models/export" test -r`), add cases there.

**Interfaces:** Produces: download/copy text = full output; preview text capped separately (existing cap constant); filename helper `sessionFilename(kind, ext, date)` returning `xray-session-YYYYMMDD-HHmmss.ext` / `xray-session-share-safe-…`.

- [ ] **Step 1: Failing tests:** `exports at 240 KB and 2 MB` — Selected JSON and Mock `JSON.parse` succeed at 240 KB and 2 MB; Jest/MSW/Playwright output transforms with esbuild (`transformSync(code, {loader:'ts'})`) at both sizes; at 2 MB they contain `/* body omitted:`; Selected JSON's `entry` has no `responseRaw`/`response`/`responseDecrypted`. `share-safe keeps body keys` (`{message, error:{code}, config, stack}` inside a body survive; top-level diagnostic fields still dropped); `share-safe query allow-list` (`page=1` kept, `token=x` redacted; list imported from the interceptor's source of truth — if it lives only in `content/interceptor.js`, move it to a shared module both read, without duplicating). `HAR fidelity` (form body raw text + content-type mimeType + bodySize = length; queryString filled; creator.version = extension version; statusText carried; WS entry excluded). `CSV zeros and formulas` (0 stays `0`; `=cmd` → `'=cmd`). `Playwright empty body` (no body assertion for a 204). `MSW url without query` and MSW unavailable for WS/SSE. `fallback parity` (utils.ts cURL/fetch fallback === shared generator output for one entry with headers and body). `session filenames`.
- [ ] **Step 2:** Run the file → new tests FAIL.
- [ ] **Step 3: Implement** E1–E8 per spec; `window.html` loads `shared/utils.js` and `shared/console-helpers.js` before the panel bundle (match the order in `manifest.json`'s ISOLATED content-script list).
- [ ] **Step 4:** PASS; `npm test` all pass.
- [ ] **Step 5: Gate:** `npm run typecheck && npx eslint . && npm test && npm run build && node scripts/check-dist-sync.mjs`.

### Task 3: Settings behaviour (S1–S4)

**Files:** Modify `src/panel/store.ts` (`requestConfirmation`, `updateSettings` max-entries path, `resetSettings`, theme/accent action), `src/panel/models/panelSettings.ts` (`accentChosen` flag with load default), `src/panel/components/console/ConsoleWorkspace.tsx`, `src/panel/components/shell/CommandPalette.tsx`, `src/panel/components/rules/Rules.tsx` (route through `requestConfirmation`). Tests: store/settings unit tests (`grep -l "resetSettings\|requestConfirmation" test -r`) + one E2E file for the palette case (reuse an existing palette E2E fixture).

**Interfaces:** Produces: `requestConfirmation(req)` runs `req.onConfirm()` synchronously when `settings.confirmDestructiveActions === false`; `PanelSettings.accentChosen: boolean`.

- [ ] **Step 1: Failing tests:** `confirmation off runs immediately` (store); `console clear, palette clear, rule delete use requestConfirmation` (each asks when on, runs when off); `max entries lower asks first` (on → dialog requested, entries unchanged until confirm; off → evicts); `theme keeps chosen accent` (accent picked → preset change keeps it; never picked → preset sets its accent; existing users whose accent equals the theme default count as not chosen); `reset keeps layout` (panelWidth, dockSide, apiSplit, logsSplit, firstRunDismissed preserved; entries evicted to restored max immediately); `legacy settings load unchanged` (old keys present → loads, values preserved in storage round-trip). E2E `palette clear without confirmation`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3: Implement** S1–S4.
- [ ] **Step 4:** PASS.
- [ ] **Step 5: Gate** as Task 2 plus the touched E2E file.

### Task 4: Settings content (S5–S9, C3, C4)

**Files:** Modify `src/panel/components/settings/SettingsModal.tsx`, `src/panel/runtime/captureConfig.ts` (return delivery result to the caller for C3), `src/panel/store.ts` only if `publishCaptureSettings` must surface the boolean, `settings/settings.html` (S8 names). Tests: Settings E2E (find with `grep -l "Open settings\|xray-settings" test/e2e`), unit test for option label maps.

- [ ] **Step 1: Failing tests (E2E, both fixtures):** removed rows absent (Very slow threshold, Default detail view, Stream to console live, Clear API filters, Decrypt nav item); About contains the decryption line; Slow threshold under General with the new desc; Diagnostics disclosure collapsed by default containing Session identity and runtime rows; "Compact API rows" label; selects show names (font options with "(if installed)"); accent swatch accessible names ("Use Amber accent"); copy strings from S2/S7/S9/C4 exact; C3 line shown in the window surface when delivery fails. Unit: options page theme labels (read `settings/settings.html`).
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3: Implement.** Update any existing test that pinned removed rows/old copy, with the reason in the report.
- [ ] **Step 4:** PASS.
- [ ] **Step 5: Gate** as Task 2 plus the Settings E2E files.

### Task 5: Modal layout (L1–L6)

**Files:** Modify `src/panel/styles.css` (settings/export modal rules), `SettingsModal.tsx` (initial focus via ModalShell `initialFocusRef`), `ExportModal.tsx` (mode filtering, narrow select, single privacy label, switch size). Tests: Settings and Export E2E files.

- [ ] **Step 1: Failing E2E (both fixtures):** `settings height is fixed across sections` (dialog height identical for General and Appearance at 1440×900 and equals `min(640, 0.9·vh)`); `settings width` (`min(780, 0.94·vw)`; theme names single-line; swatches one row; "Session & storage" nav one line); `settings focuses active section on open`; `export session mode shows only session formats`; `export narrow select` (at a 600 px modal: a `<select>` with optgroups replaces the rail, preview height ≥ 50 % of the modal body; at 1440 every format chip fully visible, none clipped); `privacy label once`; `mode switch height equals chip height`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3: Implement** L1–L6.
- [ ] **Step 4:** PASS.
- [ ] **Step 5: Gate** as Task 2 plus Settings/Export E2E files.

### Task 6: Themes (T1–T12)

**Files:** Modify `src/panel/styles.css`, `src/panel/styles/tokens.css`, `src/panel/models/panelSettings.ts` (accent tables), `src/panel/models/customTheme.ts` (derivation, sink, default accent), `SettingsModal.tsx` (Claude preview dot, Slate preset accent, Custom editor groups), `test/theming-tokens.test.js` (deliberate pin updates). Create: `test/unit/themeContrast.test.mjs`.

**Interfaces:** Produces: `--xray-sink` token (fallback `black`); test helper that parses each preset's token block from `styles.css` + `tokens.css` and composites `color-mix(in srgb, …)` (model on `output/theme-audit/static.mjs.txt`).

- [ ] **Step 1: Failing test** `test/unit/themeContrast.test.mjs`: for each preset (Signal Gray, Harbor Instrument, Paper Relay, High Contrast, Claude, Custom defaults via `buildCustomThemeVars`) assert: text/subtext/hint on bg and surface2 ≥ 4.5 (HC ≥ 7); red/green/blue/mauve/peach/yellow on bg, on surface, and on the JSON well (`bg 86% + sink 14%`) ≥ 4.5 (HC ≥ 7); placeholder (hint) on the input surface ≥ 4.5; `--xray-border-control` vs input surface and bg ≥ 3; scrollbar thumb vs its track ≥ 3; every `PANEL_ACCENT_VALUES_LIGHT` swatch as text on `accent 14%` tint over Paper and Claude bg ≥ 4.5; every dark accent swatch on its tint over Signal Gray/Harbor bg ≥ 4.5. Print the failing pairs in assertion messages.
- [ ] **Step 2:** Run → FAIL (lists the audit's failing pairs).
- [ ] **Step 3: Implement** T1–T11 with the spec's exact values; where the spec says "~10 % darker" or "≥ 3:1" without a value, choose the closest value that passes and state it in the report. Update `test/theming-tokens.test.js` pins.
- [ ] **Step 4:** Contrast test PASS; `npm test` PASS; run `test/e2e/theme-visual-system.e2e.mjs` and any E2E that pins colours (`grep -l "e06c75\|9a6500\|7c5cff\|d97757" test -r`) and update deliberate pins.
- [ ] **Step 5: Gate** as Task 2 plus those E2E files.

### Task 7: Integration verification

**Files:** Modify only on failure; `docs/ui-audit.md` (mark fixed register items: M-17, X-19 names, and add lines for this batch's spec).

- [ ] **Step 1: Full gate:** `npm run check && npm run test:e2e && npm run test:coverage` → 0 errors, warnings ≤ 53, all pass, coverage lines ≥ 98.5 % / branches ≥ 89 %. Re-run any failing E2E file alone once and report both runs.
- [ ] **Step 2: Real extension** (Playwright `launchPersistentContext` with `--load-extension`; CDP into the closed shadow root): (a) turn Intercept fetch off, reload a page that fetches `/api/early` immediately → no entry captured; (b) enable a mock rule with capture off → page receives the mock; (c) Selected JSON download of a 240 KB response parses; (d) screenshots of API/Console/Settings/Export for every theme to `output/final-themes/<theme>/`; (e) Settings switches sections without moving; Export narrow at 820×700.
- [ ] **Step 3:** `git diff --check && node scripts/check-dist-sync.mjs`.
