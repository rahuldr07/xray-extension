# XRAY Product-Quality Pass Design

**Date:** 2026-10-09  
**Status:** Proposed for implementation  
**Scope:** Power-user workflow first, product polish second, technical depth third

## 1. Goal

Make XRAY the fastest trustworthy workflow for going from:

> Something happened in this web app → I understand it → I can prove it → I can reproduce or share it.

The pass must improve the existing extension rather than create a second product. It keeps the current local-first architecture, explicit execution boundaries, AI consent flow, closed-shadow surfaces, browser-extension protocol, and bounded session model.

## 2. Current baseline

The repository already contains:

- Fetch/XHR, WebSocket, SSE, GraphQL, and console capture.
- API and Logs exploration, endpoint grouping, detail views, Console, search, command palette, comparison, findings, investigations, exports, replay/mock experiments, and AI explanation/synthesis.
- Document, HUD closed-shadow, and window surfaces with responsive layouts.
- Bounded storage/session models, CSP-aware workers, sanitized bridges, explicit experiment execution, and session-aware persistence.
- A passing baseline of 694 unit tests and 282 E2E tests, with typecheck and production build passing.

The current worktree is intentionally dirty from the preceding redesign and runtime hardening work. This pass must preserve unrelated changes and must not reset or overwrite them.

## 3. Product principles

1. **Evidence before action.** Inspection and preparation may be easy; network execution, mock enablement, export, and AI transmission remain explicit.
2. **Truthful UI.** An affordance exists only when its operation is meaningful for the selected evidence type. Receipts describe what actually happened.
3. **Local by default.** Captured traffic stays local unless the user explicitly chooses an external destination such as AI analysis or a share-safe export.
4. **Bounded by design.** Keep existing entry, body, frame, search, receipt, and storage caps. Optimize derivation and persistence before raising limits.
5. **One workflow across surfaces.** Document, HUD, and window views share behavior and semantics even when their layouts differ.
6. **Smallest complete change.** Prefer focused model/component boundaries and existing helpers over new frameworks or speculative abstractions.

## 4. Scope and priorities

### Phase 1 — Trustworthy power-user workflow

#### 4.1 Selection reveal for grouped API entries

When Global Search or Command Palette selects an older child request inside a collapsed endpoint group:

- Expand the owning endpoint group.
- Keep the selected entry and detail view unchanged.
- Scroll the selected row into view using the existing virtualizer.
- Preserve the behavior for flat, log, imported, and closed-shadow surfaces.

The selection owner remains the panel store/entries workspace. Global Search and Command Palette only request selection.

#### 4.2 Replayability guards

Replay and Edit & Replay must be offered only for meaningful HTTP(S) API entries.

- Logs cannot expose replay commands.
- WebSocket and SSE entries cannot expose HTTP replay, Edit & Replay, HTTP mock creation, or HTTP experiment preparation.
- Direct store actions retain defensive type/source/URL validation even if a caller bypasses the UI.
- Stream entries retain inspection, frame viewing, comparison, export through compatible formats, and investigation evidence.
- No new stream executor is introduced in this pass.

Invalid direct calls produce a bounded, truthful receipt and no page-bridge message.

#### 4.3 Redacted Edit & Replay

Edit & Replay must preserve redaction placeholders such as `[redacted]` in the editable request. It must never reconstruct or expose the secret in panel state, persistence, logs, or exports.

- Same-origin execution may use the existing MAIN-world restoration path.
- Cross-origin retargeting must continue to require explicit acknowledgement and must not restore the original secret.
- Direct Replay behavior remains unchanged.

#### 4.4 HTTP-only HAR behavior

HAR remains standards-compatible and HTTP-oriented.

- WS/SSE entries are omitted from HAR rather than represented as fake HTTP traffic.
- The export result reports omitted stream-entry counts.
- Session JSON remains the bounded stream-evidence format for this pass.
- No raw frames are placed into HAR metadata or receipts.

#### 4.5 Share-safe session export

Add an explicit share-safe export mode instead of silently changing the existing local export contract.

The share-safe projection must redact or remove:

- Authorization, cookie, API-key, token, password, credential, and equivalent sensitive headers.
- URL query values and userinfo credentials.
- Sensitive body fields and unstructured body values according to existing bounded sanitization behavior.
- Raw diagnostic errors, private provider configuration, and internal runtime fields.

The preview, copy action, and download action must serialize the same projection. The UI must label the existing full export as local/private when it contains captured payloads.

## 5. Phase 2 — Navigation and accessibility polish

### 5.1 Logs keyboard navigation

Logs receive the same list navigation model as API entries:

- One list-level tab stop.
- Arrow, Home, End, PageUp, and PageDown navigation.
- Virtualizer scroll-to-selection.
- Enter/Space opens the selected log.
- Individual row actions remain reachable without requiring a tab stop for every virtualized row.

### 5.2 Consistent listbox semantics

Choose one coherent interaction model for API lists:

- The list owns focus.
- Options have stable IDs.
- `aria-activedescendant` reflects keyboard selection.
- `aria-selected` and visible selection remain synchronized.
- Nested row actions remain independently reachable without producing ambiguous option semantics.

The same semantics should be used for Logs where applicable.

### 5.3 Search and palette announcements

Command Palette and Global Search expose accessible active-result and result-count semantics without stealing focus or repeating entire dialogs. Live session totals use concise polite status updates only when values materially change.

### 5.4 Confirmation focus

Fieldless confirmations initially focus the safe Cancel action, not the header Close button. Escape closes the topmost dialog and focus returns to the opener according to existing modal-stack behavior.

### 5.5 Search field coverage

Expose the fields already supported by the search model:

- Method
- Status
- Message

Preserve existing regex, case sensitivity, field caps, ordering, and result limits.

### 5.6 Structured Console filtering

Console filtering searches a bounded haystack built from message, args, and data. It must not stringify unbounded values or alter virtualization, level filtering, consecutive-message collapsing, or output-first layout.

### 5.7 Privacy copy

Replace the unqualified first-run claim that nothing leaves the machine with accurate language such as:

> Captured traffic stays local unless you choose Analyze with AI.

The onboarding card is static content; only concise state changes use live-region semantics.

## 6. Phase 3 — Runtime scale and reliability

### 6.1 Latest-only session persistence

Replace the current full-snapshot backlog with a bounded persistence queue:

- At most one active storage write.
- At most one newest pending snapshot.
- Obsolete pending snapshots are replaced, not accumulated.
- Clear/reset generation barriers remain ordered and cannot be overwritten by a stale snapshot.
- Receipts expose only aggregate state: active/pending status, last success time, and sanitized failure code.

Existing caps and authoritative restore behavior remain unchanged.

### 6.2 Explicit persistence contract

`chrome.storage.local` remains the authoritative bounded session restore path. IndexedDB remains an optional worker cache unless a future measured design adds a bounded list/restore operation.

The worker must report aggregate cache-write failures or unavailable state when those failures affect health. It must not claim that an IndexedDB cache is restorable when no restore path exists.

### 6.3 Health recovery

Successful authoritative storage writes clear stale storage-unavailable health where the documented state permits. The distinction between initial read failure and later write recovery remains explicit and sanitized.

### 6.4 Delivery receipts

Capture receipts distinguish source validation from downstream delivery:

- Validated/accepted by content capture.
- Delivered to a live panel/DevTools consumer.
- No consumer present.
- Relay dropped/failed.

Receipts contain aggregate counters and reason codes only—never URLs, headers, bodies, or raw errors.

### 6.5 Derived session index

Introduce a narrow derived-index boundary for the existing entry array:

- Endpoint groups and counts.
- Session summaries.
- Bounded searchable fields.

List, shell summary, and Global Search consume the index rather than independently repeating full scans/stringification for the same entry identity. Body limits and result caps remain unchanged. The index is invalidated only when the immutable entries identity changes.

### 6.6 Worker diff usage

When worker analysis returns a valid bounded diff, Request Detail passes that result to DiffView. The existing synchronous capped calculation remains a fallback for unavailable workers or unsupported surfaces.

## 7. Technical boundaries

### Ownership

- `EntriesWorkspace`, `entries` model, and panel store own selection visibility, list semantics, and navigation state.
- `CommandPalette` and `GlobalSearch` own command/result presentation, not selection invariants.
- `ReplayModal`, `RequestDetail`, and store replay actions own replayability guards and placeholder preservation.
- `export` model and `ExportModal` own export projections, labels, previews, and receipts.
- `store`, `sessionStore`, worker client, background, and content relay own persistence and delivery health.
- Existing sanitization helpers are preferred; new sanitizers must be bounded, pure, and tested independently.

### Compatibility

- Chrome/Edge Manifest V3 behavior remains intact.
- Document, HUD closed-shadow, and window surfaces remain supported.
- Existing session JSON import compatibility is preserved for the local format.
- Share-safe export is additive and explicitly labeled.
- No API keys, credentials, cloud services, or dependencies are added.

### Error behavior

Every new failure path returns a stable reason code or bounded user-facing receipt. Raw provider, storage, page, or capture errors never cross into panel state or persisted data.

## 8. Verification plan

### Regression tests

Add focused unit/E2E coverage for:

- Grouped selection reveal from Search and Command Palette.
- Replay gating for Logs, WebSockets, and SSE.
- Redacted Edit & Replay placeholder preservation and origin behavior.
- HTTP-only HAR omissions and truthful counts.
- Share-safe export redaction and preview/download parity.
- Log list keyboard navigation and listbox semantics.
- Confirmation initial focus.
- Search Method/Status/Message scopes.
- Structured Console filtering.
- First-run privacy wording/live-region boundaries.
- Latest-only persistence under delayed writes.
- Storage health recovery and delivery receipts.
- Derived-index reuse and worker diff rendering.

### Required commands before completion

```text
npm run typecheck
npm run lint
npm run build
npm test
npm run test:e2e
node scripts/check-dist-sync.mjs
git diff --check
```

Lint warnings may remain outside touched code, but no new errors or warnings should be introduced without explanation. Generated bundles must match source.

### Performance checks

Use disposable synthetic fixtures, not production data, to compare 500- and 5,000-entry sessions:

- Persistence queue remains bounded at one active plus one pending snapshot under delayed storage.
- No-hit and hit search main-thread time is recorded before/after index use.
- Body stringification count is bounded for unchanged entries.
- Detail diff uses worker output when available and remains bounded on fallback.

## 9. Non-goals

- No new cloud backend, authentication, account system, or external service.
- No automatic replay, mock enablement, export, or AI transmission.
- No increase to session/body/frame limits before performance evidence.
- No dedicated WebSocket/SSE executor in this pass.
- No wholesale UI rewrite or replacement of the existing state architecture.
- No deletion of unrelated dirty-worktree changes.

## 10. Completion criteria

The pass is complete when the phases are implemented in ownership-isolated changes, all targeted acceptance tests pass, the existing 694 unit and 282 E2E baseline remains green, production bundles are synchronized, no new security/privacy boundary is weakened, and the final review confirms that every changed line maps to one of the scoped outcomes above.
