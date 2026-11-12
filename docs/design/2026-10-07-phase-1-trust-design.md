# Phase 1 — Trust and predictable behavior

## Status and intent

Date: 2026-10-08, Asia/Calcutta. The written specification was approved for
implementation planning. No product
changes, commits, or pushes are authorized by this document alone.

XRAY should shorten the path from a suspicious request to an investigation and a
controlled experiment without concealing network activity or overstating success.
This phase improves existing actions, settings, AI consent, rule creation, command
search, and Console preparation. It does not introduce a new runtime subsystem.

The companion [Phase 2 design](2026-10-07-phase-2-response-first-design.md) changes
presentation after these behaviors have regression coverage. Both phases preserve
the working baseline in [Phase 0](../../phase-0-baseline.md), including uncommitted
fixes, protected selection/pins, valid exports, and closed-shadow modal behavior.

## Approach and boundaries

Use focused changes to existing components and their owning model/store helpers.
A full UI rewrite would enlarge the regression surface; a runtime/session redesign
belongs to Phase 3. Neither is needed for this phase.

Keep the current stack, dependencies, providers, account choices, storage keys,
capture bounds, and MAIN/ISOLATED/service-worker boundaries. Do not introduce page
localStorage, remote assets, credential logging, or a new acknowledgement protocol.
Use synthetic fixtures only; no real provider requests are required for acceptance.

## 1. Truthful action feedback

- The shared clipboard helper must reject when the clipboard API is unavailable or
  a write fails. It resolves only after the browser accepts the write.
- Every caller awaits that outcome and handles failure. This includes exports,
  rules, themes, request operations, header/frame values, and AI results. No
  optimistic success toast or unhandled rejected promise is permitted.
- Failure text suggests manual copying or checking browser permissions. It does
  not include captured payloads or raw provider/authentication errors.
- Download feedback says "Download started" only after the browser download has
  been initiated. It does not claim that a file was saved to disk. Synchronous
  preparation failures leave the export open and show an error.
- Full-response copying must either produce the full available value or clearly
  label any truncation. Existing preview limits must not yield a "Full copied"
  receipt for a shortened value. Capture-time omissions remain explicitly distinct
  from copy/export truncation.
- Session import feedback reports newly retained incoming entries, duplicates, and
  incoming entries omitted by the existing retention limit. Do not report the
  parsed count as the imported count. Preserve the current protected-entry merge
  and matching Console-event creation; do not replace them with a new import path.
- Rule creation/import feedback reports actual accepted counts and capacity
  omissions, not requested counts. Zero accepted items is not success.
- Feedback distinguishes in-memory application, storage completion, bridge
  submission, and an observed result. Do not infer persistence or runtime execution
  from a store update or a successful postMessage call.

Root-cause evidence: `utils.copyText()` currently uses optional clipboard calls and
an empty catch. A Node probe through the actual unit harness resolved both for an
absent clipboard API and for a synthetic rejected write. Existing export/rule
callers therefore cannot reliably distinguish success from failure.

## 2. Honest immediate-apply settings

- Keep immediate application of valid settings and live theme preview. Do not add
  a second draft/commit model for the whole settings dialog.
- Replace the footer's "Save" and "Cancel" with "Done" and the explanation
  "Changes apply immediately." Escape and the close button also close without
  rolling back applied changes. Closing does not emit "Settings saved."
- Preserve per-field numeric drafts: temporary empty/invalid editing text must not
  immediately become a minimum/default. Commit on the existing field boundary;
  closing must not silently commit an invalid draft.
- Reset remains a separate destructive action honoring the existing confirmation
  preference. Its description distinguishes preferences from captured data and AI
  credentials; a preference reset must not claim to reset those other stores.
- Reopening displays the applied values. Use existing persistence and surface
  propagation; do not promise cross-surface recovery that Phase 0 did not certify.

## 3. Explicit AI consent and outbound redaction

Opening Explain prepares a local preview, never an AI request. The user sees the
configured provider/model, the custom endpoint destination when applicable, the
data included, and the exact sanitized prompt before selecting "Analyze".

### Included data and defaults

- Default context: method, sanitized URL, status, duration, GraphQL operation
  name/type, and up to four related-request status/duration/timestamp records.
- Remove URL user information and fragments; replace every query value with a
  redaction marker while keeping parameter names. Apply this to imported entries
  too, rather than assuming upstream capture redaction.
- Headers, request body, and response body are separate unchecked opt-ins.
  GraphQL variables follow the request-body opt-in. Do not send decoded JWT lenses,
  frame contents, initiator stacks, or unrelated session bodies.
- If response inclusion is selected, explain that it includes the response
  representation currently inspected, including decrypted content when available.
- Redact sensitive header names, including the configured custom auth-header name.
  Recursively redact object fields with normalized names containing authorization,
  cookie, password/passwd, secret, token, api-key, private-key, session-id, or JWT.
  Handle JSON strings and recognizable bearer/JWT text without interpreting code.
- For opted-in non-JSON text, use bounded pattern redaction and show the warning
  "Automatic redaction may miss secrets. Review the payload before sending."
  Never describe the payload as guaranteed anonymous or safe.
- Redaction is an outbound projection, not a mutation of stored entries, local
  response views, or exported sessions. Keep captured text inert; never render it
  as HTML.

### Consent and request lifecycle

- Freeze the target/context when preparing the preview. Changing inclusion options
  rebuilds a bounded sanitized snapshot; live capture patches must not silently
  change an approved payload between preview and submission.
- Bound the final prompt, including instructions, to 40,000 characters. Omit or
  shorten included values with visible omission/truncation notices. Traversal must
  be bounded and tolerate malformed, cyclic, or unusually deep imported values.
- The Analyze click submits exactly the previewed prompt, once. Disable repeat
  submission while pending. No effect-driven sending or automatic retry.
- Provider/model/destination changes invalidate the prepared preview and require a
  fresh Analyze click. Do not submit under a destination different from the one
  presented; enforce this at the existing service-worker request boundary without
  exposing the key or weakening sender/endpoint validation.
- Closing or switching target ignores stale results. Closing after submission
  does not claim to cancel the provider request. A retry is explicit and subject
  to the same preview/consent flow.
- Show useful unavailable-runtime, missing-configuration, and provider-error
  states. "Open AI settings" routes directly to the AI section.
- Credentials remain in their existing private extension storage path. Preview,
  prompt messages, tests, reports, and logs must never contain the API key.

## 4. Draft-first traffic rules

- Every newly created rule starts disabled: blank rule, preset, imported rule,
  and "Create mock rule" from request detail. Override an incoming enabled flag at
  those creation boundaries, not during restoration of existing saved rules.
- Keep the existing rule shape and 50-rule limit. Imported rules receive fresh IDs
  so repeated imports cannot create jointly toggled/deleted cards. Accept only the
  available capacity and report accepted/skipped counts without dropping old rules.
- The card distinguishes "Disabled" from "Enabled locally" and offers explicit
  enabling. Empty URL matchers and invalid regular expressions cannot be enabled;
  explain the validation error without silently substituting another matcher.
- Editing an enabled rule's matcher or action disables it before publishing the
  changed configuration. The card explains that it needs enabling again. Label-only
  edits do not disable it. Existing enabled rules are not disabled on load.
- Runtime serialization still includes only enabled, valid rules. Merely creating,
  importing, or editing a disabled rule never activates its network effects.
- "Enabled locally" is not "Applied to the page." A missing bridge route produces
  a visible unavailable-state explanation. Bridge submission does not prove that
  the runtime accepted the rule; observed mock/delay/failure entries are separate
  evidence. Full runtime acknowledgement and rollback remain outside this phase.

## 5. Relevance-first command search

- An empty query retains grouped browsing and recent requests.
- A nonempty query sorts all eligible results by descending match score before
  applying the existing result limit. Ties use group order, then original candidate
  order for deterministic behavior.
- Search results use a flat relevance list with a small group label per result;
  do not re-cluster them afterward and undo the ranking.
- Preserve the current bounded recent-request candidate pool and fuzzy highlight
  behavior. Expanding search to the complete session belongs to later work.
- Arrow keys, Home/End, click, and Enter operate on the exact displayed order.
  Clamp active selection when live results shrink; the first match is selected on
  a new query. Zero results never execute a stale command.

## 6. Visible prepared Console commands and shared thresholds

- Preparation sets the draft, opens the Console workspace and its Console sub-tab,
  then focuses the editable prompt through the owning root. It never evaluates the
  command. This applies to palette actions, request operations, and export snippets.
- Preserve and show the selected request for `res`/`req`; preparation must not
  silently select a different request. Existing explicit Run/Enter execution and
  Shift+Enter multiline editing remain intact.
- Read the normalized configured `slowThresholdMs` for suggestions, prepared
  `$slow(...)` commands, API filters, and Console counters. A request is slow when
  duration is greater than or equal to that threshold; labels reflect the same
  inclusive comparison. Do not change capture timings or worker algorithms.
- Durable draft history, replacement/undo workflows, and request-context locking
  are not introduced here. Keep existing replacement semantics.

## Ownership and integration

- `utils.ts` owns copy/download outcomes; callers own user-facing feedback.
- `store.ts` and the existing rule/import models own accepted-item counts and
  creation/enable boundaries. Add only the narrow result contracts consumers need;
  preserve unrelated public panel methods and persistence formats.
- `ExplainModal.tsx` owns consent and request presentation; a pure bounded outbound
  projection owns redaction. `aiBridge.ts` and the existing background handler own
  delivery and destination validation, not automatic sending.
- `CommandPalette.tsx` and its score ordering own search presentation;
  `models/operations.ts` consumes the configured threshold.
- `insertConsoleCommand` and `ConsoleWorkspace.tsx` share one preparation path.
  Do not implement per-caller focus timers or duplicate command execution logic.
- Common modal/focus behavior remains in the existing `ModalShell` and centralized
  keyboard runtime. Preserve topmost ownership and closed-shadow support.

## Acceptance and verification

Write failing behavioral regressions before production changes. Source-string
checks are supplementary, not proof of an action's outcome.

1. Clipboard success, denial, and unavailable API produce distinct correct feedback
   with no unhandled rejections. Truncated output is never labeled full output.
2. Imports at capacity, duplicate session IDs, and repeated rule imports report
   retained/accepted counts correctly. Existing pinned/selected entries survive.
3. Opening, closing, reopening, or updating an Explain target sends no request.
   Analyze sends exactly one previewed sanitized prompt. Include synthetic secrets
   in URLs, mixed-case headers, nested bodies, JSON strings, and GraphQL variables.
4. Test payload limits, deep/cyclic inputs, destination changes, provider errors,
   explicit retries, and late responses. No real key or provider call is needed.
5. New rules, presets, request-created mocks, and imports are disabled. Saved enabled
   rules retain their state; effective edits require re-enabling. Test invalid
   matchers, the 50-rule cap, and unavailable runtime routes.
6. A stronger result in a later group outranks a weaker early-group match. Browser
   keyboard activation follows the visual order, including shrinking result sets.
7. Preparing a command from each entry point reveals/focuses the editor without
   executing. A nondefault slow threshold and its equality boundary agree across
   operations, palette commands, filters, and Console counters.
8. Settings close consistently without fake save/cancel semantics; valid changes
   apply immediately and invalid numeric drafts do not replace applied values.

Run targeted unit/browser checks, then `npm run check`,
`node scripts/check-dist-sync.mjs`, `npm run test:e2e`, and
`npm run test:coverage`. Rebuild all three tracked bundles. Report existing warnings
and real coverage/surface gaps; Phase 0 receipts are not receipts for this phase.
