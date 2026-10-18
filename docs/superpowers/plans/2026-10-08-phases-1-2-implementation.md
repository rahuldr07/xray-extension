# Phases 1–2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development or executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking. Repository delegation rules take precedence over skill examples.

**Goal:** Make XRAY actions truthful and consent-driven, then prioritize response reading without losing existing debugging capabilities.

**Architecture:** Improve existing model/store contracts and React components in place. Implement independent trust work in parallel with exclusive file ownership, integrate shared callers centrally, then reshape the response/filter UI on the verified contracts. Preserve existing capture/security boundaries and persisted formats.

**Tech Stack:** TypeScript, React 19, Zustand, Vite, Node test runner, esbuild component fixtures, Playwright Chromium.

**Spec:** `docs/superpowers/specs/2026-10-07-phase-1-trust-design.md` and `docs/superpowers/specs/2026-10-07-phase-2-response-first-design.md`.

## Global Constraints

- No dependencies, provider/account changes, commits, pushes, or global configuration changes.
- Preserve Phase 0 fixes and unrelated dirty/untracked files; HEAD is not the complete baseline.
- Keep local extension storage, MAIN/ISOLATED/service-worker boundaries, capture limits, sender/endpoint validation, inert captured text, and existing storage keys.
- AI prompt limit: 40,000 characters including instructions; opt-ins unchecked on every new target.
- Rule limit: 50; new rules disabled; saved rules retain their enabled state.
- Slow means duration greater than or equal to configured `slowThresholdMs`.
- Use existing theme/radius/motion tokens; no remote fonts/assets or unsafe HTML.
- Rebuild `dist/panel-ui.js`, `dist/hud-ui.js`, and `dist/window-ui.js` together.
- Tests/screenshots use synthetic data only. Never issue real provider calls for verification.

## Review Focus

- A destination change between preview and background receipt must reject instead of sending to a different provider (Task 3).
- A duplicate ID within a single imported file must not double-count retained entries or produce ambiguous rules (Task 2).
- A newly prepared command while the editor is already mounted must focus once without focus stealing on capture updates (Task 5).
- Legacy Headers/Waterfall preferences must map correctly without resetting the remembered body view (Task 6).
- Escape inside a closed-shadow action disclosure must dismiss only that disclosure, not the request drawer (Task 6).

## Execution and file ownership

Recommended method: two bounded implementation agents per independent batch, with main-session integration/review/testing. No separate review/test agents unless explicitly requested. Wait for each batch before reassigning overlapping files.

- Batch A: Task 1 helper implementation and Task 3 AI implementation run in parallel. Task 1 owns `utils.ts` and its unit tests; Task 3 owns AI model/component/bridge and `background.js`.
- Main integration: Task 1 caller changes, Tasks 2/4/5 shared store/palette/settings contracts, targeted tests.
- Batch B: Task 6 response presentation and Task 7 filter/count presentation run in parallel. Task 6 owns RequestDetail and proposes detail-scoped CSS; Task 7 owns EntriesWorkspace and proposes API-scoped CSS. Only main applies their CSS proposals to shared `styles.css` and handles store/model integration.
- Main integration: Console context, shared CSS rules, regressions, all Task 8 checks. No CSS `@import` or additional stylesheet loading path.
- Agents write code and focused regressions only within their assigned scope, report RED/GREEN commands and remaining gaps, and never rebuild shared bundles concurrently.

## Task 1: Reliable copy/download outcomes

**Files:** `src/panel/utils.ts`; clipboard callers in detail, export, rules, settings, AI and API components; `test/unit/utils.test.mjs`; new `test/e2e/action-feedback.e2e.mjs`.

**Interfaces:** Preserve `copyText(text: string): Promise<void>` but reject unavailable/failed writes. Preserve `downloadText(filename: string, text: string, mime?: string): void`; synchronous failures propagate. Use explicit full serialization or explicitly labeled preview copying; never call bounded output full.

- [ ] Add unit cases `clipboardUnavailableRejects`, `clipboardDeniedRejects`, `clipboardAcceptedResolves`; assert rejection/rejection/resolution with synthetic navigator stubs.
- [ ] Run `node --test test/unit/utils.test.mjs`; confirm the unavailable/denied regressions fail on the old helper.
- [ ] Implement the minimal helper contract, including download object-URL cleanup on preparation failure.
- [ ] Run the targeted test again; require zero failures.
- [ ] After AI integration lands, update every caller to await/catch. Test denied writes never show copied receipts; download receipt is exactly "Download started"; oversized response output is not labeled full when bounded.
- [ ] Run `node --test test/e2e/action-feedback.e2e.mjs` and `npm run typecheck`; require zero failures/errors. Do not commit.

## Task 2: Accepted import counts and draft-first rules

**Files:** `src/panel/store.ts`, `src/panel/models/rules.ts`, `src/panel/components/rules/Rules.tsx`, `src/panel/components/export/ExportModal.tsx`, `src/panel/components/detail/RequestDetail.tsx`, `src/panel/runtime/captureConfig.ts`; `test/unit/storeEviction.test.mjs`, `test/unit/rules.test.mjs`, new `test/e2e/rule-drafts.e2e.mjs`.

**Interfaces:** `restoreEntries(entries: XrayEntry[]): { accepted: number; duplicates: number; omitted: number }`; existing callers may ignore result. `addRule(rule?: Partial<TrafficRule>): { accepted: number; omitted: number }`. Add `importRules(rules: TrafficRule[]): { accepted: number; omitted: number }`; restoration `setRules` remains distinct. Add `ruleMatcherError(rule: TrafficRule): string | null`; empty/invalid regex cannot enable. Surface route availability without a new runtime acknowledgement protocol.

- [ ] Add tests at session/rule capacity, protected selection/pins, existing and within-file duplicate IDs, repeated rule imports, presets and request-created mocks. Assert actual accepted counts, fresh rule IDs, and disabled creation.
- [ ] Run `node --test test/unit/storeEviction.test.mjs test/unit/rules.test.mjs`; require relevant RED cases before production edits.
- [ ] Implement receipt results at owning store boundaries; deduplicate imports before counting. Preserve import merge ordering and Console-event derivation. Enforce creation disabled after incoming flags, capacity rejection without dropping old rules, and fresh imported rule IDs.
- [ ] Validate enabling and disable enabled matcher/action edits; label edits and saved-state restoration preserve enabled state. Exclude invalid/disabled rules from runtime serialization.
- [ ] Update UI with accepted/skipped receipts, Disabled/Enabled locally states, explicit enabling, and no-route explanation. Do not claim runtime application or disk persistence from local state.
- [ ] Run the two unit files plus `node --test test/e2e/rule-drafts.e2e.mjs` and typecheck; require GREEN including absent bridge and invalid regex. Do not commit.

## Task 3: AI preview, bounded redaction, and explicit submission

**Files:** new `src/panel/models/aiContext.ts`; `src/panel/components/ai/ExplainModal.tsx`, `src/panel/runtime/aiBridge.ts`, existing AI handler in `background.js`; new `test/unit/aiContext.test.mjs`, `test/ai-consent.test.js`, `test/e2e/ai-consent.e2e.mjs`.

**Interfaces:** `AiContextOptions { headers: boolean; requestBody: boolean; responseBody: boolean }`; `AiDestination { provider: AiSettings['provider']; model: string; baseUrl: string; authHeader: string; authPrefix: string }` contains no key. `prepareAiContext(entry: XrayEntry, related: XrayEntry[], options: AiContextOptions, destination: AiDestination): { prompt: string; notices: string[] }`. Bridge submits prompt plus expected destination, never the key. Background compares the expected normalized destination to stored settings before fetching.

- [ ] Add redaction tests asserting synthetic query/userinfo/fragment, sensitive headers (including custom name), nested/JSON-string secrets, bearer/JWT and GraphQL variables do not survive. Assert source entry unchanged and default bodies/headers absent.
- [ ] Add bounded tests: prompt length <= 40,000; depth limit 12, visited-node limit 5,000, cyclic/deep input notices. Require bounded traversal and visible omission markers rather than invalid serialized JSON truncation.
- [ ] Run `node --test test/unit/aiContext.test.mjs test/ai-consent.test.js`; establish RED, then implement the pure outbound projection and destination contract while retaining existing sender/endpoint guards.
- [ ] Replace automatic effect request with local frozen preview. Reset opt-ins on target change; options rebuild from frozen input. Analyze alone sends exactly previewed prompt; loading blocks duplicates; provider changes invalidate consent. Display redaction warning and destination without credentials.
- [ ] Add component tests: open/close/update sends zero; Analyze sends once; changed destination rejects before fetch; missing key/runtime, explicit retry, late result, reopen, and target switch have truthful states. AI settings button selects AI section.
- [ ] Run `node --test test/unit/aiContext.test.mjs test/ai-consent.test.js test/e2e/ai-consent.e2e.mjs` and typecheck; require GREEN with mocked runtime/fetch only. Do not commit.

## Task 4: Relevance-first palette and honest settings

**Files:** `src/panel/components/shell/CommandPalette.tsx`, new `src/panel/models/commandRanking.ts`, `src/panel/components/settings/SettingsModal.tsx`; new `test/unit/commandRanking.test.mjs`, `test/e2e/palette-settings.e2e.mjs`.

**Interfaces:** `rankCommands<T extends { score: number; group: string; order: number }>(results: T[], searching: boolean): T[]`; preserve fuzzy scores/highlights, 300-request candidate pool, and 60-result cap. Searching sorts score, group, then order; empty query sorts group then order. Settings keeps its existing immediate update contract.

- [ ] Assert a stronger later-group result ranks first before truncation, ties are deterministic, and an empty query stays grouped. Run `node --test test/unit/commandRanking.test.mjs` and observe RED.
- [ ] Implement rank helper and flat searched-results presentation with group labels; clamp active index when results shrink and never execute with zero results.
- [ ] Add browser keyboard tests for Arrow/Home/End/Enter, query changes, shrinking live results, and empty results; compare displayed first result to executed target.
- [ ] Add settings tests: valid edit applies before closing; Done/Escape/close preserve it without save toast; Save/Cancel absent; invalid numeric draft does not become default/minimum; reset preserves captured entries and AI settings.
- [ ] Change settings footer to Done and "Changes apply immediately." Keep destructive reset semantics and per-field draft validation; clarify reset scope without claiming disk persistence.
- [ ] Run `node --test test/unit/commandRanking.test.mjs test/e2e/palette-settings.e2e.mjs` and typecheck; require GREEN. Do not commit.

## Task 5: Visible command preparation and one slow threshold

**Files:** `src/panel/store.ts`, `src/panel/components/console/ConsoleWorkspace.tsx`, `src/panel/components/shell/CommandPalette.tsx`, `src/panel/models/operations.ts`, `src/panel/components/detail/RequestDetail.tsx`; `test/unit/lensesOperations.test.mjs`, new `test/e2e/console-preparation.e2e.mjs`.

**Interfaces:** Preserve `insertConsoleCommand(command: string): void`; atomically set draft, activeTab='console', consoleMiniTab='console', and increment transient `consolePreparationId: number`. Editor effect focuses only for a new preparation ID and after containing modal closes. Extend `getResponseOperations(entry: XrayEntry, entries: XrayEntry[], slowThresholdMs?: number): ResponseOperation[]`; default 500 for existing consumers, production callers pass normalized setting.

- [ ] Add threshold tests with setting 900 and durations 899/900/901. Assert equal boundary is slow and generated `$slow(900)` uses configured value. Run `node --test test/unit/lensesOperations.test.mjs`; observe RED.
- [ ] Add browser tests from palette, detail and export while Network mini-tab is selected. Assert command visible/focused, selected request unchanged, evaluator call count zero. Repeat preparation while editor remains mounted; capture updates must not steal focus.
- [ ] Implement one store preparation path and editor focus effect that respects topmost dialogs/closed-shadow roots. Do not focus beneath a modal or add per-caller timers.
- [ ] Pass configured threshold to operations/palette and align inclusive filter/counter labels. Preserve explicit Run/Enter, multiline, history, error draft restoration and Clear console semantics.
- [ ] Run targeted operations and Console browser tests plus existing modal-stack tests; require GREEN. Do not commit.

## Task 6: Response-first detail and action disclosure

**Files:** `src/panel/components/detail/RequestDetail.tsx`, new `src/panel/models/detailNavigation.ts`; main integrates scoped rules in `src/panel/styles.css`; `test/unit/detail.test.mjs`, new `test/e2e/response-first.e2e.mjs`, existing `test/e2e/api-layout.e2e.mjs` and modal stack regressions.

**Interfaces:** `DetailFacet = 'response' | 'request' | 'headers' | 'timing' | 'frames' | 'cookies' | 'initiator' | 'tokens'`; `resolveDetailFacet(tab: DetailTab, view: DetailView): DetailFacet` prioritizes Headers/Waterfall specialized views, then legacy tab. Body-view choice remains existing detailView; last body choice is remembered locally when choosing a specialized facet. No persisted schema change. All operation handlers use Phase 1 outcomes/preparation.

- [ ] Test legacy Headers/Waterfall/Request projections and body-view continuity using actual model/component state. Assert disappearing conditional facets fall back to Response and do not display prior-entry content.
- [ ] Add browser assertions for primary facets, body modes, compact identity, full URL access, drift baseline link, missing/plain-text/streaming content, and all named existing actions reachable through common row/More actions.
- [ ] Run targeted tests to establish RED. Implement compact identity/metadata disclosure, one primary facet navigation and applicable body modes; retain specialized content and GraphQL baseline matching.
- [ ] Consolidate common actions to Copy/Export/Console/More actions, with <=2 nonduplicated recommendations. Use an anchored accessible disclosure with no side effects on opening; Escape closes only it and restores trigger focus in document/closed-shadow fixtures.
- [ ] Remove redundant permanently expanded action groups/footer while preserving actual capabilities. Update existing layout test selectors to common action row without weakening body-end/action reachability assertions.
- [ ] Main integrates the agent's token-based CSS proposal into existing detail classes: at 960/1600 x 700 comfortable fixture, content/detail height ratio >=0.5 with disclosures closed. Narrow drawer remains vertically reachable; noncompact API changes must not affect compact Log details.
- [ ] Run `node --test test/unit/detail.test.mjs test/e2e/response-first.e2e.mjs test/e2e/api-layout.e2e.mjs test/e2e/modal-stack.e2e.mjs`; require GREEN and report measured ratios. Do not commit.

## Task 7: Compact filters/counts and coherent Console context

**Files:** `src/panel/components/api/EntriesWorkspace.tsx`, shared list helpers in `src/panel/models/entries.ts`; main integrates scoped CSS in `src/panel/styles.css` and Console context in `src/panel/components/console/ConsoleWorkspace.tsx`; `test/unit/entries.test.mjs`, `test/e2e/api-layout.e2e.mjs`, `test/e2e/console-preparation.e2e.mjs`.

**Interfaces:** Derive matching entries using existing production predicates before group-collapse projection; add `matchingApiCount` to the list model result if not already available. Preserve `clearApiFilters(): void` as predicate-only reset; UI "Clear filters" also calls `setApiSearchQuery('')`. Do not reset sort/grouping in either path.

- [ ] Add count fixtures with mixed API/log entries, query plus secondary filters, imported entries and collapsed endpoint groups. Assert matching count is requests, not visible/group rows; clear retains entries/pins/selection/sort/grouping.
- [ ] Run unit/list and browser count tests to establish RED. Present All/Errors/Slow/Pinned, expandable Filters & Sort, removable active chips, and "N matching of M session requests". Preserve onboarding vs filtered-empty distinction and virtualized keyboard navigation.
- [ ] Main applies the agent's filter CSS proposal to existing API classes using container/token conventions. Verify collapsed secondary predicates remain visible, controls fit 360px, and narrow/wide drawer baseline behavior remains intact.
- [ ] Main integrates one selected-request context near Console editor (method/path/status/inspect route). It must not clear data or reset draft; retain empty-context guidance and explicit Run/history/snippets behavior.
- [ ] Run `node --test test/unit/entries.test.mjs test/e2e/api-layout.e2e.mjs test/e2e/console-preparation.e2e.mjs`; require GREEN. Do not commit.

## Task 8: Combined review, surface checks, bundles and receipts

**Files:** all intended changes; baseline documents for comparison only; verification screenshots in ignored `output/phase2/`.

**Interfaces:** No new production interfaces. Main reviews combined diffs against both specs and the Phase 0 regression guarantees.

- [ ] Inspect combined diff and every spec requirement; fix integration issues with a failing regression first. Check no unintended credential destinations/logging, dependencies, runtime protocol redesign, unrelated edits, or missing capabilities.
- [ ] Run API/Console browser matrix at 360/420/760/960/1600 widths plus 420/1600 x 700, document/closed-shadow fixtures, and reduced motion. Verify controls/body/actions reachable, focus/keyboard/modal isolation preserved, and wide response-area target met.
- [ ] Measure changed normal text contrast >=4.5:1 and focus/control boundaries >=3:1 in all five built-in themes; primary/secondary comfortable controls >=13px/12px. Report arbitrary custom-theme and unperformed screen-reader checks separately.
- [ ] Smoke-check real panel/HUD/DevTools/pop-out where supported by existing harness. Preserve pop-out unavailable-route states; record which surfaces are fixture-only or unverified rather than claiming complete parity.
- [ ] Run `npm run check`, then `node scripts/check-dist-sync.mjs`, then `npm run test:e2e`, then `npm run test:coverage`; every command must exit zero. Inspect all output/warnings. No concurrent rebuilds or benchmark runs.
- [ ] Verify/create ignored `output/phase2/`, then run `npm run ui:shots -- --out output/phase2/ui-shots --tabs api,console --widths 360,420,760,960,1600`. Retain Phase 0 screenshots; disclose preview-vs-real-surface limits.
- [ ] Run `git diff --check`, inspect final status/diff and unchanged dependency manifests/HEAD. Confirm all three normalized bundles match source and unrelated work survives.
- [ ] Mark checked steps complete using actual receipts, summarize implementation and exact test outcomes, list genuine gaps and how to try the result. No commits/pushes and no performance/accessibility certification beyond measured evidence.

## Plan self-review and handoff

This plan maps Phase 1 feedback/settings/AI/rules/ranking/preparation to Tasks
1–5 and Phase 2 detail/actions/filters/Console/responsive behavior to Tasks 6–8.
The five Review Focus cases each have an owning regression. Agent scopes do not
overlap within batches; shared-store/style/caller changes are integrated centrally.
The historical specification filenames are retained to preserve existing links;
their document dates are corrected to 2026-10-08.

The written specifications are approved. This implementation plan is ready for
the required plan review and execution-method confirmation; no implementation
steps have been performed yet.
