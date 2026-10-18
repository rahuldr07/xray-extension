# Phase 2 — Response-first investigation UI

## Status and intent

Date: 2026-10-08, Asia/Calcutta. The written specification was approved for
implementation planning. Product code
has not been changed for this phase. No commit or push is requested.

Make the captured response the primary working surface. Request identity, filters,
commands, and secondary actions should support reading the payload rather than
consume most of the available panel. Preserve all existing investigation features
without turning this into a full visual or runtime rebuild.

This phase depends on the behavioral contracts in the
[Phase 1 design](2026-10-07-phase-1-trust-design.md). It preserves the verified
filtered-empty, mobile scrolling, modal, and keyboard fixes recorded in
[Phase 0](../../phase-0-baseline.md).

## Approach and exclusions

Reshape `EntriesWorkspace`, `RequestDetail`, and Console context presentation in
place. Reuse existing models, store settings, container queries, tokens, icons,
virtualization, and modal ownership. Do not add a UI framework or dependencies.

Do not change capture protocols, session retention, GraphQL baseline matching,
worker algorithms, arbitrary request comparison, replay execution, cloud accounts,
AI providers, or themes. No remote fonts/assets, page-style leakage, unsafe HTML,
or private capture data in screenshots or reports.

## 1. Detail hierarchy and response navigation

### Identity

- One compact identity block contains method, endpoint, status, duration, size,
  and the close action. Preserve an accessible route to the complete URL even
  when its visual path is truncated.
- Put secondary metadata behind an explicit expand/collapse control. Expansion
  must not execute an operation or replace the selected request.
- Preserve meaningful mocked/replayed/imported/streaming indicators. Do not use
  color alone to communicate status or an intervention.
- Keep drift evidence and its baseline relationship available as a compact notice
  with a direct "View diff" action, not another permanently expanded tool group.

### Facets and views

- Use a single primary content navigation: Response, Request, Headers, Timing,
  and conditionally Frames, Cookies, Initiator, Tokens.
- Response is the initial facet when no existing request/header preference is
  selected. Keep the user's body-view preference while moving between requests;
  do not reset Schema/Diff/Table inspection on every selection.
- Body facets offer Tree, Raw, Table, Schema, Diff, and Visualize. Headers and Timing
  render their specialized views rather than duplicate body-view buttons. Frames,
  Cookies, Initiator, and Tokens also use their appropriate dedicated content.
- Keep all existing view/selection entry points usable. Translate existing
  `detailTab`/`detailView` values at the presentation boundary so stored Request,
  Headers, or Waterfall preferences still open the corresponding facet. Do not
  require a new persisted settings schema.
- If a conditional facet disappears on selection, fall back to Response; do not
  show content from the previous request. Diff continues to use the established
  previous-same-endpoint/GraphQL-operation baseline, not an arbitrary comparison.
- Every facet identifies loading, missing, unavailable, and empty content clearly.
  Plain text remains plain text; a streaming entry without a body points to Frames.

## 2. Consolidated actions and progressive disclosure

- One common action row offers Copy, Export, Console, and More actions. Copy means
  the content currently inspected, with its Phase 1 outcome/truncation semantics.
  Console prepares a command; it does not execute it.
- More actions contains named secondary actions: replay, edit/replay, explain,
  create disabled mock rule, copy cURL/fetch/mock JSON, save snippet, and applicable
  response operations. Consolidate duplicates without removing capabilities.
- Keep at most two contextual recommendations outside More actions, chosen using
  the existing operation priority. Never duplicate an action already directly
  available in the facet/view controls or common action row.
- Opening/focusing an action list has no network or rule effects. Only selecting
  an explicit action invokes its existing handler; Explain still opens consent.
- Use an accessible disclosure/popover anchored to the request, not another modal
  stack. Keyboard focus can reach every action. Escape closes the disclosure first
  and returns focus to its trigger; outside dismissal must not close the drawer.
- The common action row remains reachable with long bodies at every supported
  width. Do not retain a second footer/actionbar containing duplicate controls.

## 3. Compact filters and honest request counts

- Keep search immediately available. Show All, Errors, Slow, and Pinned as the
  default quick filters; move other predicates plus sort/grouping to an expandable
  Filters & Sort region. An active secondary filter remains visible when collapsed.
- Show removable active-filter chips and an explicit "Clear filters" action.
  Clear removes search and filter predicates while preserving entries, pins,
  selection, sort, and grouping. Presentation preferences are not filter predicates.
- Label request counts as "N matching of M session requests". Compute N after all
  predicates but before endpoint-group collapse or virtualization. M includes all
  API entries retained in the current session, including imported entries.
- Endpoint/group counts, collapsed display rows, errors, and slow totals must be
  separately labeled; do not call a group-row count a matching-request count.
- Preserve the distinction between "No API requests yet" and "No matching API
  requests". The latter offers the verified clear-filter flow, never onboarding.
- Preserve request-list arrow/Home/End/Page navigation, Enter/Space opening,
  protected selection, resizable wide splits, and the new-arrivals jump affordance.

## 4. Coherent Console context

- Show one compact selected-request context next to the command editor: method,
  endpoint, status, and a direct route to inspect that request. Preserve the
  existing empty-selection state and explain what `res`/`req` refers to.
- Preparation from API detail, export, and the palette must reveal the command
  editor and the Console sub-tab, regardless of the previously selected mini-tab.
  Focus the draft after the destination mounts, without stealing focus on ordinary
  background updates or silently running the prepared command.
- Console output and errors remain in the stream. Context controls do not clear
  requests, replace the selected request, or reset the command draft.
- Retain history navigation, explicit Run/Enter execution, Shift+Enter multiline
  editing, saved snippets, and the existing context-preserving Clear console flow.
  Do not redesign the console evaluator or event model.

## 5. Responsive behavior, typography, and accessibility

- Adapt to the panel's container width, not only the browser viewport. Keep wide
  split/drawer behavior and the existing stacked drawer at 760px and below.
- Narrow detail retains a reachable vertical scroll path through content and
  actions. Do not reintroduce nested fixed-height regions that clip the footer or
  the end of a response. Tables/code may scroll horizontally inside their content
  region, but navigation and action controls must not overflow the panel.
- At 960/1600px widths and 700px height, the response content region must occupy at
  least half the detail container in the default comfortable density, with
  metadata/action disclosures closed and no expanded drift notice. Measure this
  on a stable synthetic request fixture; this is an acceptance target, not an
  already-observed improvement.
- At 360/420/760px widths, controls may wrap or use accessible disclosures, but
  selected facet, active filters, current view, close control, body, and actions
  remain reachable without an offscreen-only entry point.
- Use existing font/theme/radius/motion tokens and local fonts. In comfortable
  density, primary control text is at least 13px and secondary annotations at least
  12px. Preserve the explicit compact-density preference and body font selection.
- Verify changed text/control pairs in every built-in theme: normal text contrast
  at least 4.5:1 and focus/control boundaries at least 3:1. Arbitrary user-authored
  custom colors are not a blanket accessibility guarantee.
- Every icon-only control has an accessible name. Selected facets/filters expose
  their state programmatically; disclosures expose expanded state. Tab order is
  consistent with visual order and all newly introduced controls work by keyboard.
- Honor reduced motion and focus restoration. Do not undo topmost-modal Escape
  ownership, closed-shadow focus traversal, editable-field exceptions, persistent
  surface behavior, or page-shortcut isolation from the Phase 0 fixes.

## Ownership and integration

- `RequestDetail.tsx` owns identity, facet/view projection, recommendations, and
  common actions. Reuse its existing specialized content components and operation
  handlers; extract a focused presentation helper only where it removes duplication.
- `EntriesWorkspace.tsx` owns compact filtering, current-session/matching counts,
  and drawer presentation. Existing shared list models remain the source of filter
  semantics; do not create a second set of predicates in JSX.
- `ConsoleWorkspace.tsx` owns command/context layout and editor focus. Phase 1's
  shared preparation action owns navigation and draft changes.
- `styles.css` and the existing theme-token contract own layout and typography.
  Extend scoped `xray-` classes/container rules rather than starting a parallel
  styling system. Compact Log detail must not inherit API-only action/navigation
  changes unintentionally.
- Existing `ModalShell` and `panelKeyboard` remain the focus/Escape authority.
  Popover dismissal must compose with them; one Escape must not dismiss both a
  disclosure and its containing drawer/modal.
- All shared UI changes ship in panel, HUD, and pop-out bundles. Do not imply that
  an unbound pop-out supports replay or live rule application; preserve its honest
  unavailable states.

## Acceptance and verification

Write behavior/layout regressions before changing the corresponding components.
Do not replace interaction evidence with source-string assertions or screenshots.

1. Select a request and read its response without expanding extra controls. All
   existing specialized facets/views and named secondary actions remain reachable.
   Persisted legacy detail choices and entry-to-entry view continuity still work.
2. Test long URLs, plain text, JSON arrays/objects, missing bodies, drift, frames,
   decoded tokens, headers/cookies, and absent conditional facets with synthetic
   data. Selecting another entry never leaves stale content visible.
3. Opening More actions does not replay, activate rules, or send AI requests.
   Keyboard activation selects the intended action. Escape dismisses only the
   current disclosure and restores its trigger focus.
4. Search and secondary predicates produce correct matched/session counts, even
   with endpoint groups collapsed. Removing a chip or clearing filters changes no
   entries/pins/selection and preserves sort/grouping.
5. Exercise API and Console at 360/420/760/960/1600px widths, including 420/1600px at
   700px height to match existing layout regressions. Verify body end and common
   actions are reachable; measure the wide response-area target above.
6. Exercise the actual shared React components in document and closed-shadow
   fixtures. Retain existing modal-stack, mobile-layout, editable/persistent-surface,
   and real-extension capture/redaction tests. Smoke-check panel, HUD, DevTools,
   and pop-out where a real surface harness exists; disclose any missing harness.
7. Verify changed controls in all five built-in themes, reduced-motion mode, and
   keyboard-only navigation. Separate automated checks, visual review, and any
   screen-reader checks actually performed; do not claim a complete accessibility
   certification.

Run targeted checks, then `npm run check`, `node scripts/check-dist-sync.mjs`,
`npm run test:e2e`, and `npm run test:coverage`. Rebuild all three tracked bundles.
Capture new API/Console screenshots under a distinct ignored `output/phase2/`
directory, retaining the Phase 0 references. Report response-area measurements and
remaining gaps; do not claim performance gains from visual changes alone.
