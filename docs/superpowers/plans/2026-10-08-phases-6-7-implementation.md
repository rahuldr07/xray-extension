# Phases 6–7 Implementation Plan

**Goal:** Turn captured evidence into inspectable findings and reusable local investigation recipes.

**Spec:** `docs/superpowers/specs/2026-10-08-phases-6-7-design.md`.

**Architecture:** Pure model units own validation and bounded projection. Main session owns store integration. UI units use the declared store API and existing ModalShell/experiment/AI paths. No new dependencies or commits; preserve unrelated dirty work.

## Tasks and interfaces

1. Finding model + Insights UI: `models/findings.ts`, `components/insights/FindingsPanel.tsx`, `Insights.tsx`, unit/browser tests. Export FindingRecord/FindingsState, createFindingState(sessionId), deriveFindings(entries,{sessionId,slowThresholdMs}), reconcileFindingState(previous,derived), normalizeFindingState(input,sessionId), dismissFinding(state,id), restoreFinding(state,id), isFindingDismissed(record,dismissals), prepareFindingSynthesisContext(records,destination). Store owns `findings`, `dismissFinding`, `restoreFinding`, `openFindingEvidence(id,entryId?)`, `openFindingSynthesis(ids)`.
2. Investigation models: `models/investigations.ts`, `models/investigationPersistence.ts`, unit tests. Export types and constants, createInvestigation({sessionId,entries,selectedId,pinnedIds,compareLeftId,compareRightId,filters,findingIds,title,notes}), normalizeInvestigationStore(input), serializeInvestigationStore(state), createScenario(investigation,entry,plan,checks), evaluateAssertions(assertions,entry,baseline?), resolveEntryRef(ref,sessionId,entries). Types in model files, not shared types.ts. Reuse experiment model helpers.
3. AI synthesis UI: new `components/ai/FindingSynthesisModal.tsx` using same requestAiExplanation destination guard/frozen consent conventions; do not modify Explain unless necessary. Store owns `findingSynthesisIds: string[] | null`, open/close. Agent does not mount globally; main owns App/keyboard integration.
4. Main store integration: findings reconciliation before eviction; independent bounded serialized durable writes; version guard and restore/clear races. Investigation CRUD/open/rebind/scenario preparation/assertion evaluation; explicit step run delegates draft/arm/runExperiment and scalar receipts adapt experiment transitions.
5. Investigation UI: new `components/investigations/InvestigationPanel.tsx` mounted in Rules; main owns RequestDetail/CommandPalette prep, styles and App integration. Browser regressions must exercise real store and no side effects before explicit Run.
6. Combined verification and notes: npm run check/test:e2e/test:coverage, check-dist-sync, screenshots/detector and git diff --check.

## Review focus

- Finding evidence must not leak URL query/userinfo/fragment or arbitrary imported metadata; after eviction only compact facts remain.
- Unsupported storage versions and failed writes must not be overwritten or reported saved; restore races cannot resurrect cleared/deleted state.
- Same entry ID in a different session must not resolve a saved reference; rebind is explicit.
- Redacted/truncated/cyclic assertion evidence is unavailable, never a pass; no unbounded body traversal.
- Scenario cancel/timeout/reload cannot start a next step or disable unrelated rules; only experiment-owned cleanup applies.

## Execution receipts

- [x] Finding model and Insights UI verified.
- [x] Investigation models and normalization verified.
- [x] AI synthesis consent verified.
- [x] Store persistence/navigation/reproduction verified.
- [x] Investigation authoring and responsive UI verified.
- [x] Combined checks, bundle outputs, screenshots and notes verified.

## Final receipts — 10/08/2026

- `npm run check`: typecheck/build passed; 668 regular tests passed, zero failures; lint zero errors/57 warnings.
- `npm run test:e2e`: 159 browser tests passed, zero failures. Synthetic provider/extension boundaries, not live-provider certification.
- `npm run test:coverage`: 98.67% lines / 90.08% branches / 97.73% functions. Existing exclusions unchanged: store/runtime orchestration, tests, dist and scripts excluded; not whole-extension coverage.
- `node scripts/check-dist-sync.mjs`: all three bundles match current source. `git diff --check` passed.
- Nine real-App synthetic screenshots at widths360/960/1600: `output/phase6-7/ui-shots/`. Inspected mobile findings/synthesis and wide investigation rendering. Added scoped synthesis typography and header wrapping so mobile Close stays reachable.
- New sanitizer regression exposed pathological key/JWT regex backtracking. Replaced with token scanning; 19,500-character body and 300,000-character header near misses complete in milliseconds in focused tests. Model-work budget remains2s; child startup timeout10s avoids coverage/concurrent-load false failures. Not a full performance certification.
- Added initial-storage-version dispatch guard: pending schema checks never trigger a scenario and finishing a check never auto-runs it.
- Browser mock-timeout fixture now uses2000ms and polls the terminal receipt rather than assuming80ms survives concurrent suite load. Fresh-context reload fixture verifies interrupted restoration without simulating deletion of local edits.
- UI detector: three incumbent styles.css findings (two side stripes and grid background). No new component findings; no unrelated redesign.
- Vite native-config-loader compatibility warning remains. No dependencies, commits, pushes, provider/account changes or capture protocol changes.

## Try it

Open Insights → Findings to inspect/dismiss/restore local signals. Select up to five → Synthesize selected → review exact prompt → Analyze.

Select a request → More actions → Save investigation, or Command center → Open saved investigations. In Rules, author assertions and ordered replay/mock scenarios. Each Run step or Run next step is explicit; mock steps require triggering the request on the page. Clear traffic preserves saved recipes but invalidates old-session references; explicitly rebind before execution.

The delivered scope deliberately excludes one-click automatic sequences, arbitrary code, templating, investigation export/import, cloud sync and automatic AI.
