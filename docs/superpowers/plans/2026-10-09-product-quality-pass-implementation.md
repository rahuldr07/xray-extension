# XRAY Product-Quality Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven development to implement this plan task-by-task. Each task must finish its focused tests before the next task changes overlapping files.

**Goal:** Make XRAY the fastest trustworthy workflow from captured traffic to understanding, evidence, safe reproduction, and sharing.

**Architecture:** Preserve the existing React/Zustand panel, Manifest V3 capture protocol, bounded session model, explicit experiment execution, and closed-shadow surfaces. Add focused replayability/export helpers, improve navigation/accessibility in existing components, bound persistence and delivery receipts, then add a narrow derived session index and worker-diff handoff. Shared files are assigned to one task at a time; later tasks consume the earlier interfaces rather than reworking them.

**Tech Stack:** TypeScript/React 19, Zustand, Vite, Manifest V3, Chrome/Edge extension APIs, Node test runner, Playwright E2E, ESLint, TypeScript, existing worker/client bridge.

**Spec:** `docs/superpowers/specs/2026-10-09-product-quality-pass-design.md`

## Global Constraints

- Keep captured traffic local unless the user explicitly chooses an external destination such as AI analysis or a share-safe export.
- Inspection and preparation may be easy; network execution, mock enablement, export, and AI transmission remain explicit.
- Keep existing entry, body, frame, search, receipt, and storage caps.
- Chrome/Edge Manifest V3 behavior remains intact.
- Document, HUD closed-shadow, and window surfaces remain supported.
- Existing session JSON import compatibility is preserved for the local format.
- Share-safe export is additive and explicitly labeled.
- No API keys, credentials, cloud services, or dependencies are added.
- No new stream executor is introduced.
- No unrelated dirty-worktree changes may be reset, reformatted, or deleted.
- Do not commit or push; preserve the user’s uncommitted worktree.

## Review Focus

- A search result selecting an older child inside a collapsed endpoint group must reveal and scroll that exact row; test both Global Search and Command Palette.
- A log, WebSocket, or SSE entry must never produce a page-bridge replay/mock/HTTP-experiment request; test both UI affordances and direct store calls.
- A share-safe export must not leak credentials in headers, query strings, userinfo, structured bodies, unstructured bodies, or error metadata; test preview/copy/download parity.
- A delayed storage backend must retain at most one active and one pending snapshot, and Clear must win over stale writes; test with a controllable storage double.
- A keyboard or assistive-technology user must receive one coherent listbox interaction model without duplicate row tab stops; test API and Logs at compact and wide sizes.

---

## File and ownership map

### Task 1 — Replayability and evidence safety

- Create: `src/panel/models/replayability.ts` — pure entry capability predicates and bounded reason labels.
- Modify: `src/panel/components/detail/RequestDetail.tsx` — gate HTTP-only actions by capability.
- Modify: `src/panel/components/replay/ReplayModal.tsx` — preserve redaction placeholders while editing.
- Test: `test/unit/replayability.test.mjs`, `test/e2e/experiments.e2e.mjs`.

### Task 2 — Runtime persistence and delivery health

- Modify: `src/panel/store.ts` — latest-only persistence queue, storage recovery, aggregate delivery health.
- Modify: `background.js` — distinguish no DevTools consumer from relay failure/success.
- Modify: `content/content.js` — publish aggregate downstream-delivery receipts without payloads.
- Modify: `workers/xray-worker.js` — surface bounded IndexedDB cache failures.
- Modify: `shared/worker-client.js` — carry sanitized cache-health receipts.
- Test: `test/background-service-worker.test.js`, `test/capture-interceptor.test.js`, `test/unit/storeEviction.test.mjs`, `test/unit/runtime/xray-worker.test.mjs`, `test/e2e/session-health.e2e.mjs`.

### Task 3 — Investigation navigation and accessibility

- Modify: `src/panel/components/api/EntriesWorkspace.tsx` — grouped selection reveal, Logs keyboard navigation, listbox semantics.
- Modify: `src/panel/components/search/GlobalSearch.tsx` — Method/Status/Message scopes and result announcements.
- Modify: `src/panel/components/shell/CommandPalette.tsx` — replay capability visibility and active-result announcements.
- Modify: `src/panel/components/console/ConsoleWorkspace.tsx` — bounded structured filtering.
- Modify: `src/panel/components/common/ModalShell.tsx`, `src/panel/components/common/ConfirmationModal.tsx` — safe initial focus.
- Modify: `src/panel/components/common/FirstRun.tsx` — accurate privacy copy and static onboarding semantics.
- Test: `test/accessibility.test.js`, `test/e2e/global-search-fields.e2e.mjs`, `test/e2e/console-context-layout.e2e.mjs`, `test/e2e/modal-stack.e2e.mjs`, `test/e2e/ui-responsive-hardening.e2e.mjs`, `test/e2e/palette-settings.e2e.mjs`.

### Task 4 — Share-safe exports and stream-compatible export behavior

- Modify: `src/panel/models/export.ts` — bounded share-safe projection, additive format IDs, HTTP-only HAR omission receipts.
- Modify: `src/panel/components/export/ExportModal.tsx` — explicit local/private vs share-safe labels and receipt display.
- Test: `test/unit/exportImport.test.mjs`, `test/detail-export-lenses.test.js`, new focused export E2E coverage if the existing harness supports clipboard/download assertions.

### Task 5 — Derived session index and worker diff handoff

- Create: `src/panel/models/sessionIndex.ts` — bounded derived index keyed by immutable entries identity.
- Modify: `src/panel/models/entries.ts` — consume index for summaries/groups where the existing model contracts permit.
- Modify: `src/panel/models/globalSearch.ts` — consume bounded indexed search documents.
- Modify: `src/panel/components/api/EntriesWorkspace.tsx`, `src/panel/components/shell/PanelShell.tsx` — pass one index through list and shell summary derivations.
- Modify: `src/panel/components/detail/RequestDetail.tsx` — prefer valid worker diff and retain synchronous bounded fallback.
- Test: `test/unit/sessionIndex.test.mjs`, `test/unit/globalSearch.test.mjs`, `test/e2e/comparison.e2e.mjs`, `test/worker-offload.test.js`, `test/e2e/ui-responsive-hardening.e2e.mjs`.

### Task 6 — Integrated review and release verification

- Modify only where needed after review: focused files from Tasks 1–5.
- Test: full existing and new suites; generated `dist/` bundles must be synchronized.
- No new feature work is allowed in this task; it is for regressions, warnings introduced by this pass, and evidence review only.

Tasks 1, 2, and 4 are file-disjoint and may be implemented in parallel. Task 3 starts after Task 1 because it consumes the replayability predicate in Command Palette. Task 5 starts after Tasks 2 and 3 because it touches shared model/components. Task 6 is last.

---

## Task 1: Replayability and evidence safety

**Interfaces:**

- Produces `isReplayableEntry(entry: PanelEntry | null): boolean` and `replayabilityReason(entry: PanelEntry | null): string | null` from `src/panel/models/replayability.ts`.
- `isReplayableEntry` returns true only for API entries with an HTTP(S) URL and a non-stream source; logs, WS, SSE, missing URLs, and unsupported schemes return false.
- `replayabilityReason` returns a short sanitized reason suitable for a toast/disabled explanation and never includes URL, headers, body, or raw bridge errors.
- Task 3 consumes `isReplayableEntry` for Command Palette visibility. Task 2 uses the same capability rule for defensive store validation.

- [ ] **Step 1: Add failing pure capability tests**

  In `test/unit/replayability.test.mjs`, cover:

  - ordinary HTTP API entry → replayable;
  - HTTPS GraphQL-over-HTTP entry → replayable;
  - log entry, WS entry, SSE entry, missing URL, `file:`, and malformed URL → not replayable;
  - reasons are bounded and contain no payload or credential fields.

- [ ] **Step 2: Run the focused test and verify it fails**

  Run: `node --test test/unit/replayability.test.mjs`

  Expected: FAIL because the replayability module does not yet exist.

- [ ] **Step 3: Implement the pure replayability module**

  Add `isReplayableEntry` and `replayabilityReason` using the repository’s existing entry/source conventions. Do not inspect or normalize sensitive payloads in this module.

- [ ] **Step 4: Run the focused test and verify it passes**

  Run: `node --test test/unit/replayability.test.mjs`

  Expected: all replayability cases pass.

- [ ] **Step 5: Add failing detail/replay tests**

  Extend the experiment E2E fixture to assert that stream/log details do not expose HTTP Replay, Edit & Replay, Prepare experiment, or HTTP mock actions. Add a redacted-header Edit & Replay assertion that the dispatched editable request still contains `authorization: [redacted]`, never the secret value.

- [ ] **Step 6: Implement UI gating and placeholder preservation**

  Use the capability helper in `RequestDetail`. Update `ReplayModal` to preserve redacted header names and placeholder values while editing; do not restore secrets in panel state. Keep the existing same-origin interceptor restoration and cross-origin acknowledgement behavior unchanged.

- [ ] **Step 7: Run the focused E2E tests**

  Run: `node --test test/e2e/experiments.e2e.mjs`

  Expected: existing experiment tests plus the new stream-gating and redacted Edit & Replay scenarios pass.

---

## Task 2: Runtime persistence and delivery health

**Interfaces:**

- Preserve all existing public store actions and bridge payload shapes.
- Internal persistence state may expose only aggregate fields: active write, pending write, last success timestamp, and sanitized failure code.
- Delivery receipts use aggregate counters/reason codes for validated, delivered, no-consumer, and relay-failed states. They never include entry fields.
- IndexedDB remains an optional cache; `chrome.storage.local` remains the authoritative restore path.

- [ ] **Step 1: Add failing latest-only queue tests**

  Add a controllable storage double to the existing runtime/session tests. Hold `storage.set` for 5 seconds while generating writes for 20 seconds. Assert at most one active and one pending snapshot, then assert Clear persists an empty envelope after the old write resolves.

- [ ] **Step 2: Run the queue tests and verify they fail**

  Run: `node --test test/e2e/session-health.e2e.mjs test/unit/storeEviction.test.mjs`

  Expected: the delayed-write test fails because each full snapshot currently queues independently.

- [ ] **Step 3: Implement latest-only persistence in `src/panel/store.ts`**

  Keep one active write and replace one pending snapshot with the newest generation. Preserve clear/reset barriers and existing sanitization. Do not increase caps or expose raw storage errors. In the same store change, guard direct replay/experiment/mock entry points with Task 1's `isReplayableEntry`; invalid log/WS/SSE/missing-URL calls return a sanitized reason and do not call the page bridge.

- [ ] **Step 4: Add failing storage-recovery tests**

  Start with storage unavailable, restore a working store, trigger an authoritative session write, and assert that stale `storage-unavailable` health clears according to the documented receipt state without losing live entries.

- [ ] **Step 5: Implement health recovery**

  Clear or transition the stale storage issue only after a successful authoritative write/read appropriate to the failure type. Preserve initial-read diagnostics without claiming a restore occurred.

- [ ] **Step 6: Add failing delivery-receipt tests**

  In the background/content fixtures, cover no DevTools port, disconnected relay, and successful relay. Assert aggregate counters/reasons differ and no receipt contains URL, header, body, or raw error fields.

- [ ] **Step 7: Implement content/background relay accounting**

  Keep the capture payload protocol unchanged. Record downstream outcome separately from source acceptance, swallow browser `lastError` safely, and expose only bounded aggregate receipts to the panel.

- [ ] **Step 8: Add and implement IndexedDB cache-health coverage**

  Make worker cache failures observable as sanitized aggregate health without adding a restore/list path. Update `shared/worker-client.js` only to carry the bounded receipt.

- [ ] **Step 9: Run runtime-focused verification**

  Run: `node --test test/background-service-worker.test.js test/capture-interceptor.test.js test/unit/storeEviction.test.mjs test/unit/runtime/xray-worker.test.mjs test/e2e/session-health.e2e.mjs`

  Expected: all focused runtime, persistence, and delivery tests pass.

---

## Task 3: Investigation navigation and accessibility

**Interfaces:**

- Consume `isReplayableEntry` from Task 1; do not duplicate source/URL capability logic.
- Keep existing panel-store selection actions and virtualizer contracts unless a focused test proves a store change is necessary.
- Search scope values remain serializable and preserve existing query/regex/case behavior.

- [ ] **Step 1: Add failing grouped-selection tests**

  Add Global Search and Command Palette E2E cases with a collapsed endpoint group and an older matching child. Assert the group expands, the child row becomes visible, `aria-selected="true"` targets the child, and the detail pane remains on the selected request.

- [ ] **Step 2: Implement selection reveal in `EntriesWorkspace.tsx`**

  Observe the selected entry/group relationship, expand the owning group, and call the existing virtualizer scroll path after rows are materialized. Do not make Search or Palette mutate grouping state directly.

- [ ] **Step 3: Add failing Logs navigation/listbox tests**

  Cover Arrow/Home/End/Page navigation through many virtualized logs at compact and wide sizes, one list-level tab stop, stable option IDs, `aria-activedescendant`, and Enter/Space opening the selected log.

- [ ] **Step 4: Implement the unified list interaction model**

  Apply one focus owner per list, synchronize `aria-activedescendant`/`aria-selected`/visual selection, and keep row action buttons reachable without making every virtualized row a tab stop.

- [ ] **Step 5: Add failing search/palette/Console tests**

  Cover Method, Status, and Message scopes; result-count and active-result announcements; replay commands hidden for non-replayable entries; and Console filtering that finds a bounded nested value in `data` or `args` beyond the message preview.

- [ ] **Step 6: Implement search, palette, and Console behavior**

  Expose model-supported scopes, add concise polite status/active-result semantics, use the Task 1 replayability helper, and construct a bounded Console search haystack without changing virtualization or output-first layout.

- [ ] **Step 7: Add failing modal/onboarding tests**

  Assert a fieldless confirmation opens with Cancel focused, Enter does not confirm immediately, Escape restores opener focus, and First Run uses scoped privacy copy without assigning a long onboarding card a live `status` role.

- [ ] **Step 8: Implement focus and privacy-copy fixes**

  Add an explicit initial-focus target to `ModalShell`/`ConfirmationModal`; keep topmost Escape semantics. Update First Run copy to distinguish local capture from explicit AI analysis and reserve live regions for concise state changes.

- [ ] **Step 9: Run focused navigation/accessibility verification**

  Run: `node --test test/accessibility.test.js test/e2e/global-search-fields.e2e.mjs test/e2e/console-context-layout.e2e.mjs test/e2e/modal-stack.e2e.mjs test/e2e/ui-responsive-hardening.e2e.mjs test/e2e/palette-settings.e2e.mjs`

  Expected: all existing and new navigation/accessibility cases pass in document and closed-shadow surfaces.

---

## Task 4: Share-safe exports and stream-compatible export behavior

**Interfaces:**

- Add a pure bounded projection in `src/panel/models/export.ts`: `buildShareSafeSession(entries: PanelEntry[]): ShareSafeSessionProjection`.
- `ShareSafeSessionProjection` contains sanitized entries plus aggregate `redactedCount` and `omittedCount`; it contains no raw errors, provider config, credentials, query values, or internal runtime fields.
- Add additive format IDs for share-safe session JSON and share-safe HTTP HAR; preserve existing local session JSON/HAR behavior and import compatibility.
- Existing `exportText`/preview/copy/download entry points must consume the same projection for the selected share-safe format.

- [ ] **Step 1: Add failing projection tests**

  In `test/unit/exportImport.test.mjs`, build entries containing authorization/cookie headers, URL query values, userinfo, nested sensitive fields, unstructured secrets, WS/SSE frames, provider-like errors, and ordinary values. Assert the projection is valid, bounded, and contains only redacted/omitted representations.

- [ ] **Step 2: Run projection tests and verify they fail**

  Run: `node --test test/unit/exportImport.test.mjs`

  Expected: FAIL because `buildShareSafeSession` and the additive format IDs do not yet exist.

- [ ] **Step 3: Implement `buildShareSafeSession`**

  Reuse existing bounded sanitization and cloning helpers. Preserve safe ordinary fields, redact sensitive fields, remove raw diagnostic/provider/internal fields, cap frame/body collections with current limits, and return only aggregate counts alongside the sanitized entries.

- [ ] **Step 4: Implement share-safe JSON and HTTP-only HAR formats**

  Extend the existing export format registry and `exportText` switch. For HAR, filter WS/SSE entries before serialization and return/report the omitted count; never invent an HTTP representation for stream frames.

- [ ] **Step 5: Add failing Export Modal tests**

  Assert the UI labels full session export as local/private when appropriate, labels share-safe formats explicitly, shows omission/redaction receipts, and uses identical sanitized text for preview, clipboard, and download.

- [ ] **Step 6: Implement Export Modal wiring**

  Keep existing copy/download acceptance semantics and denial receipts. Do not put sanitized payloads into filenames, logs, or telemetry.

- [ ] **Step 7: Run export verification**

  Run: `node --test test/unit/exportImport.test.mjs test/detail-export-lenses.test.js`

  Expected: local export round trips remain green, share-safe output is valid and redacted, and HAR stream omissions are truthful.

---

## Task 5: Derived session index and worker diff handoff

This task starts only after Tasks 2 and 3 pass because it changes model/component files touched by those tasks.

**Interfaces:**

- Create `buildSessionIndex(entries: PanelEntry[]): SessionIndex` in `src/panel/models/sessionIndex.ts`; back it with a module-local `WeakMap<readonly PanelEntry[], SessionIndex>` so the same array identity returns the same index and replacement identity rebuilds it.
- `SessionIndex` contains bounded API/log counts, endpoint-group summaries, and one bounded `Map<string, SearchDocument>` keyed by entry ID. It must not retain raw payloads beyond existing entry references and limits.
- Consumers receive the same index for a given immutable `entries` array identity; replacing the entries array invalidates it.
- Request Detail consumes `workerAnalysis.diff` when present and valid; otherwise it uses the existing capped synchronous diff fallback.

- [ ] **Step 1: Add failing index and recomputation tests**

  In `test/unit/sessionIndex.test.mjs`, assert counts/groups/search documents are correct, bounded, stable for the same entries identity, and rebuilt for a new identity. Add a test fixture that counts body stringification calls during repeated summary/search reads.

- [ ] **Step 2: Run index tests and verify they fail**

  Run: `node --test test/unit/sessionIndex.test.mjs`

  Expected: FAIL because the index module does not yet exist.

- [ ] **Step 3: Implement the narrow index**

  Build only the fields required by existing summary/group/search consumers. Keep body/query/header sanitization and caps unchanged. Do not introduce an application-wide cache or raise session limits.

- [ ] **Step 4: Wire list, shell, and search consumers**

  Update `EntriesWorkspace`, `PanelShell`, `entries.ts`, and `globalSearch.ts` to consume one index per entries identity. Preserve output ordering, filters, grouping, result caps, and selection behavior.

- [ ] **Step 5: Add failing worker-diff rendering test**

  Extend worker-offload/detail coverage so a valid worker diff reaches `DiffView`, while unavailable/invalid worker output uses the existing bounded synchronous fallback and does not render untrusted raw payloads.

- [ ] **Step 6: Implement worker-diff handoff**

  Pass the validated worker diff through Request Detail’s existing analysis state to DiffView. Keep fallback behavior for HTTP content surfaces where workers are intentionally unavailable.

- [ ] **Step 7: Run performance-focused checks**

  Use disposable synthetic fixtures for 500 and 5,000 entries. Record derivation calls, body stringifications, and no-hit/hit search timing before/after the index. Assert persistence remains bounded from Task 2 and no cap is changed.

- [ ] **Step 8: Run model/detail verification**

  Run: `node --test test/unit/sessionIndex.test.mjs test/unit/globalSearch.test.mjs test/e2e/comparison.e2e.mjs test/worker-offload.test.js test/e2e/ui-responsive-hardening.e2e.mjs`

  Expected: index reuse, search correctness, worker/fallback detail behavior, and responsive surfaces all pass.

---

## Task 6: Integrated review and release verification

- [ ] **Step 1: Inspect the combined diff**

  Run `git status --short`, `git diff --stat`, and targeted `git diff` for every task-owned file. Confirm no unrelated dirty-worktree changes were reset, no secrets or raw payload fixtures were added, and every changed line maps to the spec.

- [ ] **Step 2: Run typecheck and lint**

  Run: `npm run typecheck && npm run lint`

  Expected: typecheck passes; lint has no errors and no new warnings attributable to this pass.

- [ ] **Step 3: Build and run unit tests**

  Run: `npm run build && npm test`

  Expected: production build succeeds and all existing plus new unit tests pass.

- [ ] **Step 4: Run the complete E2E suite**

  Run: `npm run test:e2e`

  Expected: all existing plus new E2E tests pass in document and closed-shadow surfaces.

- [ ] **Step 5: Verify generated bundles and patch hygiene**

  Run: `node scripts/check-dist-sync.mjs && git diff --check`

  Expected: all generated bundles match source and no whitespace errors are present.

- [ ] **Step 6: Perform final acceptance review**

  Confirm the final result preserves explicit execution/AI consent, local-first capture, stream inspection, session caps, import compatibility, truthful receipts, responsive layouts, and no new dependencies. Report actual command results, remaining warnings, changed files, and any unresolved gap without claiming unrun checks.

## Execution order

1. Task 1, Task 2, and Task 4 may run in parallel in isolated agent contexts because their ownership is disjoint.
2. Task 3 follows Task 1 and consumes its replayability interface.
3. Task 5 follows Tasks 2 and 3 and is intentionally sequential because it touches their model/component files.
4. Task 6 follows all implementation tasks and is performed by a fresh reviewer plus the main session’s verification commands.

No task includes a commit step: the user asked for implementation, not commit/push, and the worktree already contains intentionally uncommitted changes.
