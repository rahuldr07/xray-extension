# XRAY UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild XRAY’s visual system, shell, Console workflow, Settings structure, and async states around Signal Gray / Instrument Amber while fixing stale request data and preserving extension behavior.

**Architecture:** Keep React as the presentation layer and the existing vanilla runtime boundaries untouched. Introduce a compact semantic token contract, make API the single request ledger, use Console as a log/REPL workspace with a request-context picker, and group Settings without changing immediate persistence semantics. Each task adds behavioral/browser coverage before production edits.

**Tech Stack:** React 19, TypeScript, Zustand, vanilla scoped CSS variables, Tabler icons, TanStack Virtual, Node test runner, Playwright/Chromium, Vite.

**Spec:** `docs/superpowers/specs/2026-10-08-xray-ui-redesign-design.md`

## Global Constraints

- Preserve local-first behavior, CSP, closed-shadow root handling, centralized Escape/modal focus ownership, extension page isolation, and all capture/worker/storage/page-bridge protocols.
- Preserve panel, HUD, DevTools, and pop-out parity.
- Preserve persisted preference compatibility and unknown preference fields.
- Preserve response-first operations, explicit AI consent, replay preparation, and no implicit page execution.
- No new UI dependency, remote font, CDN asset, CSS `@import`, or page-style leakage.
- Verify document and closed-shadow fixtures, all theme presets, custom themes, reduced motion, keyboard-only flows, narrow panel widths, short viewport heights, and live capture updates.

## Review Focus

- A response patch changes status/body/timing while Console context remains current; regression belongs to Task 1.
- Console context selection routes to API without executing commands or clearing drafts/pins; regression belongs to Task 2.
- Gear settings and explicit deep links open different intended sections; regression belongs to Task 3.
- Custom accent changes the actual rendered accent across panel and sibling modals; regression belongs to Task 4.
- Modal toast, loading, error, and filtered-empty states remain visible/recoverable in closed shadow and short viewports; regression belongs to Task 5.

---

### Task 1: Authoritative request state and Console context model

**Files:**
- Modify: `src/panel/store.ts`, `src/panel/types.ts`, `src/panel/utils.ts`
- Modify: `src/panel/components/console/ConsoleWorkspace.tsx`
- Test: `test/unit/storeEviction.test.mjs` or a focused new unit test for event/entry patch authority
- Test: `test/e2e/console-preparation.e2e.mjs` or a focused new Console context E2E fixture

**Interfaces:**
- Consumes the existing `entries`, `consoleEvents`, `selectedId`, `consoleDraft`, `setConsoleMiniTab`, and `insertConsoleCommand` store APIs.
- Produces an authoritative `eventEntry()`/request-context path that resolves current API data by entry id and a Console context picker action that selects/routes without execution.

- [ ] Write a failing regression that adds an API entry, patches status/body/timing, and asserts the Console request context/detail reads patched values.
- [ ] Write a failing browser regression for selecting a Console context request, opening API inspection, and asserting draft/pins/selection remain stable and no evaluator message is sent.
- [ ] Run the focused unit/browser tests and confirm they fail for stale event data or missing context behavior.
- [ ] Implement the smallest authoritative-resolution change; retain compatibility for persisted `consoleMiniTab` and old console event shapes.
- [ ] Implement the Console request-context picker/inspect path while keeping Console logs, snippets, prompt, history, and explicit Run behavior unchanged.
- [ ] Run focused tests, typecheck, and diff validation.

### Task 2: Remove duplicate Console Network ownership

**Files:**
- Modify: `src/panel/components/console/ConsoleWorkspace.tsx`
- Modify: `src/panel/components/api/EntriesWorkspace.tsx` only where shared selection/routing is required
- Modify: `src/panel/components/detail/RequestDetail.tsx` only where compact/full ownership is required
- Modify: `src/panel/styles.css`
- Test: `test/e2e/ui-row-actions.e2e.mjs`, `test/e2e/console-network-layout.e2e.mjs`, `test/e2e/console-network-scroll.e2e.mjs`, and a new context-picker regression if needed

**Interfaces:**
- Consumes Task 1’s authoritative request resolution and existing API selection/detail actions.
- Produces one visible request ledger in API and a Console context picker with an explicit `Inspect in API` action.

- [ ] Add failing browser assertions that Console has no second request ledger, API remains authoritative, and Console output/prompt remain usable with no request selected.
- [ ] Run focused browser regressions and capture the pre-change failure/shape.
- [ ] Replace the visible Console Network mini-tab with a request-context picker, preserving compatibility state but removing duplicate virtualizer/tail-follow UI ownership.
- [ ] Remove only orphaned Network UI styles/imports and preserve all existing Console stream/prompt/status styles.
- [ ] Run focused Console/API/network tests at document and closed-shadow roots across 360/420/760/960/1600 widths.

### Task 3: Shell, Settings information architecture, and overlay stack

**Files:**
- Modify: `src/panel/components/shell/PanelShell.tsx`, `src/panel/components/settings/SettingsModal.tsx`, `src/panel/App.tsx`
- Modify: `src/panel/store.ts` for last-visited vs explicit section routing
- Modify: `src/panel/components/common/EmptyState.tsx` if state variants are introduced
- Modify: `src/panel/styles.css`
- Test: `test/e2e/palette-settings.e2e.mjs`, `test/e2e/session-health.e2e.mjs`, `test/e2e/modal-stack.e2e.mjs`, `test/accessibility.test.js`

**Interfaces:**
- Consumes existing `openSettings(section)`, `settingsSection`, modal registration, focus-trap, and toast APIs.
- Produces grouped Settings navigation, one-shot deep-link semantics, last-visited gear semantics, runtime health entry points, and toast z-order above modal backdrops.

- [ ] Add failing tests for gear reopening last visited section, explicit AI/Appearance deep links, Danger Zone appearing only in Session & storage, and visible toast above an open modal.
- [ ] Implement grouped Settings navigation without changing persisted preference keys or immediate-apply behavior.
- [ ] Move destructive controls into Session & storage and improve runtime health status presentation with bounded recovery actions.
- [ ] Separate ordinary gear opening from explicit deep-link section hints in the store.
- [ ] Move or layer the toast region above overlays while keeping the permanent polite live region.
- [ ] Verify modal focus/Escape ownership and responsive Settings footer/body behavior.

### Task 4: Semantic theme system and Appearance workflow

**Files:**
- Modify: `src/panel/styles/tokens.css`, `src/panel/styles.css`, `src/panel/styles/hud.css`
- Modify: `src/panel/models/customTheme.ts`, `src/panel/models/panelSettings.ts`, `src/panel/App.tsx`, `src/panel/components/settings/SettingsModal.tsx`
- Test: `test/theme-studio.test.js`, `test/theming-tokens.test.js`, `test/e2e/palette-settings.e2e.mjs`
- Test: new `test/e2e/theme-visual-system.e2e.mjs` with computed-token assertions and screenshots outside the repo

**Interfaces:**
- Consumes existing `buildCustomThemeVars`, `resolveAccentValue`, theme preset classes, share-code round trips, and theme scope inheritance.
- Produces Signal Gray default, Harbor Instrument, Paper Relay, High Contrast presets and a progressive Appearance/Custom Theme editor with explicit accent precedence.

- [ ] Add failing tests for semantic tokens, no undefined prompt tokens, custom accent precedence, theme propagation to sibling modals, and reduced-motion overlays.
- [ ] Implement role-based tokens and preset values; keep component class names and page isolation stable.
- [ ] Fix custom accent precedence so the rendered accent always follows the active control and share-code round trips remain compatible.
- [ ] Redesign Appearance into preset overview plus progressive custom editing, contrast warnings, reset-derived behavior, and import/export feedback.
- [ ] Apply consistent focus/hover/active/disabled/selected states and replace undefined token references.
- [ ] Run all theme unit/E2E tests and screenshot the five main surfaces in dark/light/high-contrast modes.

### Task 5: Async, empty, error, validation, and documentation hardening

**Files:**
- Modify: `src/panel/components/common/EmptyState.tsx`, `src/panel/components/detail/RequestDetail.tsx`, `src/panel/components/detail/LogDetail.tsx`, `src/panel/components/ai/ExplainModal.tsx`, `src/panel/components/ai/FindingSynthesisModal.tsx`, `src/panel/components/replay/ReplayModal.tsx`, `src/panel/components/export/ExportModal.tsx`
- Modify: `src/panel/styles.css`
- Test: `test/accessibility.test.js`, `test/responsive-motion-css.test.js`, relevant E2E suites plus a new `test/e2e/ui-state-hardening.e2e.mjs`
- Update: `docs/ui-conventions.md`, `docs/ui-audit.md`, current screenshots only after rendered verification

**Interfaces:**
- Consumes the token system and grouped shell/settings surfaces from Tasks 3–4.
- Produces explicit no-data, filtered-empty, no-selection, loading, unavailable, and error states; replay/import validation and confirmation; current screenshot/documentation evidence.

- [ ] Add failing tests for loading/error/retry in full log-object and worker-analysis states, replay validation, import confirmation, and filtered-empty recovery.
- [ ] Implement state variants with accessible live/alert semantics and bounded error copy.
- [ ] Add replay URL/body validation and confirmation-aware import without changing prepare-never-auto-run behavior.
- [ ] Normalize AI primary action styling and ensure modal reduced-motion behavior reaches sibling overlays.
- [ ] Regenerate current UI screenshots and refresh documentation only after all browser checks pass.

### Task 6: Integrated verification and release gate

**Files:**
- Modify: only files required by verification feedback
- Test: all existing unit/E2E suites, new UI suites, build/bundle-sync checks, screenshot harness, detector

- [ ] Run `npm run check`.
- [ ] Run `npm run test:e2e`.
- [ ] Run all new focused UI suites at document and closed-shadow roots.
- [ ] Run `node scripts/check-dist-sync.mjs` and `git diff --check`.
- [ ] Run the Impeccable detector over changed UI targets and verify remaining findings are intentional or fix them.
- [ ] Capture final screenshots at 360, 420, 760, 960, and 1600 widths for API, Console, Logs, Settings, and Appearance.
- [ ] Report actual pass counts, remaining risks, and exact screenshot paths; do not claim production behavior beyond the verified fixtures.
