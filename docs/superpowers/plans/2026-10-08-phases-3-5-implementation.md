# Phases 3–5 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development or executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Make XRAY investigations resumable, comparable, and experimentally controlled without changing the capture security boundary.

**Architecture:** Add pure bounded models first, then wire one durable session envelope and runtime health receipt into the existing Zustand store/storage bridge. Add arbitrary comparison as a separate read-only model/UI, and wrap existing replay/mock routes in explicit local experiment records with observed-result association.

**Tech Stack:** TypeScript, React, Zustand, vanilla extension JavaScript, Node test runner, esbuild fixtures, Playwright Chromium.

**Spec:** `docs/superpowers/specs/2026-10-08-phases-3-5-design.md`.

## Review Focus

- Legacy `session_entries` arrays and malformed envelopes must migrate once without duplicating entries or losing pins/selection (Tasks 1–2).
- A worker error while requests are pending must reject each request exactly once and never leave the client falsely ready (Task 3).
- Comparison of entries with redacted headers, cyclic bodies, or different origins must show evidence/unavailable notices without reconstructing secrets (Task 4).
- Opening or editing an experiment must never replay, enable a rule, or execute Console; only an armed explicit Run may have side effects (Tasks 6–7).
- A late or unrelated captured entry must not resolve the wrong experiment; only matching `replayOf`/`mockRuleId` observations may transition it (Task 7).

## Global constraints

- Preserve completed Phases 1–2 and all existing MAIN/ISOLATED/service-worker boundaries.
- No dependencies, cloud services, localStorage, raw secrets in panel/storage/logs, or arbitrary code execution.
- Preserve existing storage keys by migrating legacy `session_entries` in memory; write only through `XRAY_Store`.
- Keep all limits bounded: 500 persisted entries, 50 experiments, 20,000-character search fields, 200 search results, one worker restart attempt.
- Rebuild `dist/panel-ui.js`, `dist/hud-ui.js`, and `dist/window-ui.js` together.
- Tests use synthetic entries and mocked browser/runtime boundaries only.

## Task 1: Session envelope and runtime health model

**Files:** new `src/panel/models/sessionEnvelope.ts`; `src/panel/types.ts`; `src/panel/models/sessionStore.ts`; new `test/unit/sessionEnvelope.test.mjs`.

**Interfaces:** `SessionEnvelope`, `RuntimeHealth`, `createSessionEnvelope`, `migrateSessionEnvelope`, `summarizeSessionEntries`, `updateRuntimeHealth`.

- [x] Write RED tests for legacy array migration, current envelope round-trip, counters, summary counts, omission of URL query values, 500-entry/body bounds, malformed input, and clear/reset.
- [x] Implement pure versioned envelope/migration helpers using existing serialize/deserialize bounds.
- [x] Run targeted unit tests GREEN; keep session metadata secret-free and deterministic.

## Task 2: Store persistence and runtime health wiring

**Files:** `src/panel/store.ts`, `src/panel/runtime/storageBridge.ts`, `src/panel/components/shell/PanelShell.tsx`, `src/panel/components/settings/SettingsModal.tsx`; new `test/e2e/session-health.e2e.mjs`.

**Interfaces:** Add `session`, `runtimeHealth`, `noteRuntimeEvent`, `noteRuntimeDrop`, `restartRuntime`, `clearSession` to the store. Preserve `clearEntries` as a compatibility alias that clears the envelope.

- [x] Add failing store tests for one envelope write path, legacy restore, debounce, health transitions, clear, and selected/pinned preservation during health changes.
- [x] Wire `restorePreferences` to migrate legacy data and persist an envelope after accepted/updated entries. Keep runtime health separate from captured data and never persist raw error strings.
- [x] Add compact health indicator/diagnostic action. A missing store/route reports degraded/unavailable rather than fake persistence.
- [x] Run targeted unit/browser tests and typecheck.

## Task 3: Worker recovery and message receipts

**Files:** `shared/worker-client.js`, `content/content.js`, `workers/xray-worker.js`; `test/unit/runtime/xray-worker.test.mjs`, new `test/unit/runtime/worker-client-recovery.test.mjs`, new `test/e2e/worker-recovery.e2e.mjs`.

- [x] Write RED tests for pending rejection on worker error, one recreation, repeated failure, timeout cleanup, and no duplicate responses.
- [x] Implement health events and bounded restart. Reject all pending requests on error/termination; do not resolve ready when no worker exists. Preserve existing fallback model APIs.
- [x] Add aggregate capture acceptance/drop receipts at the isolated boundary without including payload content. Test malformed bridge inputs still drop before store/worker.
- [x] Run worker/source VM tests and browser recovery fixture.

## Task 4: Exploration query and arbitrary comparison models

**Files:** new `src/panel/models/comparison.ts`; `src/panel/models/globalSearch.ts`; `src/panel/types.ts`; `test/unit/globalSearch.test.mjs`, new `test/unit/comparison.test.mjs`.

**Interfaces:** `ComparisonResult`, `compareEntries(left, right)`, `ComparisonOptions`; `searchEntries` gains optional `fields` while preserving old callers.

- [x] Write RED tests for unrelated endpoints, status/timing/size/header/body changes, redacted values, missing/truncated/cyclic bodies, stable ordering, and field-scoped search.
- [x] Implement pure bounded comparison using structural diff and explicit notices; never read MAIN-world secrets or mutate entries.
- [x] Extend search field selection without changing default search results, caps, regex, or snippets.
- [x] Run targeted model tests and full regular tests.

## Task 5: Comparison UI and navigation wiring

**Files:** new `src/panel/components/compare/CompareModal.tsx`; `src/panel/store.ts`; `src/panel/components/detail/RequestDetail.tsx`; `src/panel/components/shell/CommandPalette.tsx`; `src/panel/styles.css`; new `test/e2e/comparison.e2e.mjs`.

- [x] Add RED browser tests for selecting left/right from detail/command palette, opening comparison, swapping/clearing, unrelated entries, responsive tables, and no side effects on open.
- [x] Add bounded compare selection state and explicit actions. Preserve endpoint drift actions separately; never overwrite `detailView` or selection.
- [x] Render identity/timing/status/header/body evidence with explicit unavailable notices. Use existing JSON/text rendering and focus/modal ownership.
- [x] Run closed-shadow/document browser tests at 360/960/1600 widths.

## Task 6: Experiment model and persistence

**Files:** new `src/panel/models/experiments.ts`; `src/panel/store.ts`; `src/panel/models/sessionEnvelope.ts`; `src/panel/types.ts`; new `test/unit/experiments.test.mjs`.

**Interfaces:** `ExperimentRecord`, `ExperimentPlan`, `ExperimentCheck`, `createExperiment`, `armExperiment`, `startExperiment`, `observeExperiment`, `failExperiment`, `cancelExperiment`, `evaluateExperiment`.

- [x] Write RED tests for lifecycle transitions, invalid/cross-origin plans, active-run exclusion, cap 50, sanitized persisted plan, replay/mock association, timeout failure, and deterministic checks.
- [x] Implement pure lifecycle/check model. Enforce explicit arm before start, one active run per baseline, no raw credential persistence, and immutable observed IDs.
- [x] Add store actions/persistence with clear-independent deletion.
- [x] Run targeted model/store tests.

## Task 7: Experiment UI and existing replay/mock integration

**Files:** `src/panel/components/replay/ReplayModal.tsx`, `src/panel/components/rules/Rules.tsx`, `src/panel/components/detail/RequestDetail.tsx`, new `src/panel/components/experiments/ExperimentPanel.tsx`, `src/panel/styles.css`; new `test/e2e/experiments.e2e.mjs`.

- [x] Add RED browser tests proving draft/arm are inert, Run invokes existing origin-pinned replay or valid disabled mock route, duplicate runs are blocked, observed replay/mock entries resolve checks, timeout/failure/cancel are honest, and secrets never appear in UI/storage.
- [x] Implement experiment panel with baseline, planned delta, expected check, status, Run/Cancel/Delete. Keep existing replay editor and Rules paths functional; do not auto-enable rules or auto-run Console.
- [x] Associate captured `replayOf`, `mockRuleId`, and `mocked` entries through store ingest/update without broad matching.
- [x] Run document/closed-shadow responsive browser tests.

## Task 8: Full integration and verification

- [x] Review all diffs against the spec; preserve unrelated Phase 0/1/2 work and dependency choices.
- [x] Run `npm run check`, `npm run test:e2e`, `npm run test:coverage`, `node scripts/check-dist-sync.mjs`.
- [x] Generate `output/phase3-5/ui-shots` using the existing synthetic panel preview harness.
- [x] Run the UI detector over changed UI targets; report findings rather than silently changing unrelated incumbent styling.
- [x] Run `git diff --check`, inspect status, confirm bundles and no commits/pushes.
