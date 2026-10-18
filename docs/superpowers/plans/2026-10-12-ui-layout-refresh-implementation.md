# XRAY UI Layout Refresh Implementation Plan

> **For agentic workers:** executed with subagent-driven development — one implementer per task,
> sequential (every task touches `src/panel/styles.css`), task review after each.

**Goal:** Implement the approved layout and design refresh for every tab and modal.

**Spec:** `docs/superpowers/specs/2026-10-12-ui-layout-refresh-design.md` (items are referenced
as S1–S35). The spec is the authority; read the items your task lists before starting.

**Tech stack:** React 19 + Zustand panel in `src/panel/`, CSS in `src/panel/styles.css` +
`src/panel/styles/tokens.css` (+ `styles/hud.css` for the closed-shadow HUD), Vite build to
`dist/`, Node test runner (`test/**/*.test.js|mjs`), Playwright E2E (`test/e2e/*.e2e.mjs`, each
file builds `src/` with esbuild in-process).

## Global Constraints

- Do not commit, push, stash, reset or checkout. The working tree holds the user's uncommitted
  work; edit files in place only. Never delete files you did not create.
- No new dependencies. Icons from `@tabler/icons-react` (already used).
- Colours/spacing/radii/type only via existing CSS custom properties from `tokens.css`; new
  tokens may be added there if needed and must be defined for every theme that overrides
  similar tokens. No hard-coded hex colours in components.
- Must work in document, closed-shadow HUD and window surfaces, at container widths 420, 760,
  1100 and 1600 px, in every theme. Use the existing container-query approach for responsive
  rules (search `@container` in `styles.css`).
- Preserve keyboard/AT behaviour: listbox semantics and `aria-activedescendant`, one tab stop per
  list, modal initial focus (fieldless confirmation focuses Cancel), topmost-Escape, opener focus
  restore, live regions. Keep existing aria-labels, roles and test-pinned class names unless the
  task requires changing them — then update the affected tests in the same task and say why in
  the report.
- Nothing may execute, send, arm or replay on open/render; explicit actions stay explicit.
- Do not modify capture/runtime files: `background.js`, `content/**`, `shared/**`, `workers/**`,
  `src/panel/store.ts` persistence/runtime logic. Small store additions for pure UI state
  (e.g. a sub-tab id) are allowed if persisted-preference compatibility is preserved.
- Respect `prefers-reduced-motion` for any new transition.
- Prefer editing existing files; keep component structure and naming idioms of neighbours.

## Verification every task must run (and paste results into its report)

1. `npm run typecheck` — clean.
2. `npx eslint .` — 0 errors; warning count must not exceed the starting count (54).
3. `npm test` — all pass.
4. The task's focused E2E files (listed per task) — all pass. If you change an assertion,
   justify it against the spec item.
5. `npm run build` then screenshots: `node scripts/ui-shots.mjs --out output/ui-refresh/task-N`
   and/or `node output/ui-refresh/modal-shots.mjs --out output/ui-refresh/task-N --only ...`.
   Open (Read) the PNGs for the surfaces you changed at 1600 and 420 and compare against
   `output/ui-refresh/before/` (`<width>-<tab|modal>.png`). State in the report what you verified
   visually. No console errors may appear in the shot logs.

---

## Task 1: Global shell, case, and shared notice

**Spec:** S1, S2, S3.

**Files:** `src/panel/styles.css`, `src/panel/styles/tokens.css` (if needed),
`src/panel/components/shell/PanelShell.tsx`, `src/panel/components/shell/panelTabs.tsx`,
create `src/panel/components/common/Notice.tsx`, use it in
`src/panel/components/investigations/InvestigationPanel.tsx` (storage unavailable message) and
`src/panel/components/rules/Rules.tsx` (page bridge unavailable message). Tests:
`test/responsive-motion-css.test.js`, `test/theming-tokens.test.js`, `test/theme-semantic-system.test.js`,
`test/accessibility.test.js`.

**Steps:**
- Audit `text-transform: uppercase` in `styles.css`. Remove it from: tab labels, buttons
  (`.xray-btn`, `.xray-chip`), request paths and detail titles (`.xray-panel h3` and similar),
  preset chips, finding titles. Keep it only for small eyebrow labels / table column headers.
  Adjust letter-spacing that was only there to support uppercase.
- Keep tab text labels visible down to ~600 px container width; switch to icon-only below.
- Record control: show recording as a red dot/pill state; the accent ring only on
  `:focus-visible`. Keep its aria-label/aria-pressed semantics.
- `Notice` component: props `tone: 'info' | 'warning' | 'error'`, children, optional `action`.
  Renders icon + text, `role="status"` only for info/warning that change at runtime (do not make
  static notices live regions). Replace the two plain-text warnings listed above.
- Focused E2E: `test/e2e/ui-responsive-hardening.e2e.mjs`, `test/e2e/theme-visual-system.e2e.mjs`,
  `test/e2e/panel-slider.e2e.mjs`, `test/e2e/investigations.e2e.mjs`, `test/e2e/rule-drafts.e2e.mjs`.
- Screenshots: all tabs (ui-shots, widths 1600,760,420).

## Task 2: Modal system

**Spec:** S4, S5, S6, S7, S8, S9, S14, S15.

**Files:** `src/panel/components/common/ModalShell.tsx`, `src/panel/components/common/ConfirmationModal.tsx`,
`src/panel/components/ai/ExplainModal.tsx`, `src/panel/components/ai/FindingSynthesisModal.tsx`,
`src/panel/components/replay/ReplayModal.tsx`, `src/panel/components/search/GlobalSearch.tsx`,
`src/panel/styles.css` (modal sections), `src/panel/styles/hud.css` if the HUD overrides modals.

**Steps:**
- Put padding/type/footer rules in the shared modal CSS so every modal inherits them; remove
  per-modal overrides that fight them.
- Footer rule: `.xray-modal-footer` (or the existing footer class) lays out [meta/status left]
  [secondary … primary] right; buttons `white-space: nowrap`.
- Narrow sheet (< ~600 px container/viewport): full height, header and footer pinned, close
  button always visible (fix Edit & Replay at 420).
- AI prompt preview: read-only `<pre>`/code block (keyboard-scrollable, `tabIndex=0`, labelled
  "Exact sanitized prompt") with a Copy button; initial focus must not land on it — keep the
  existing initial-focus behaviour of those modals otherwise. Destination + provider/model as a
  compact banner at the top. Include toggles use the Settings toggle style while remaining
  checkboxes semantically (`input type=checkbox` or `role="switch"` with the same labels).
  Synthesize lists selected findings by title + request summary, not internal IDs.
- Confirmation: drop or fix the contradictory hardcoded subtitle; console-clear copy says
  "console output" not "React console stream".
- Edit & Replay: show the cross-origin acknowledgement only when the edited URL's origin differs
  from the captured request's origin (keep the existing acknowledgement gating logic for the
  send/prepare actions intact — when hidden it must not be required). URL field gets its own
  full-width row at narrow widths.
- Find in traffic: limits sentence must wrap or move to a tooltip; never clipped mid-word.
- Focused E2E: `test/e2e/modal-stack.e2e.mjs`, `test/e2e/ai-consent.e2e.mjs`,
  `test/e2e/finding-synthesis.e2e.mjs`, `test/e2e/experiments.e2e.mjs`,
  `test/e2e/global-search-fields.e2e.mjs`, `test/e2e/settings-ia-overlay.e2e.mjs`; unit
  `test/ai-consent.test.js`, `test/accessibility.test.js`, `test/shell-navigation-modals.test.js`.
- Screenshots: modal-shots for settings, explain, synthesis, editreplay, confirm, search, export
  at 1600 and 420.

## Task 3: Command palette, More actions menu, Compare

**Spec:** S10, S11, S12.

**Files:** `src/panel/components/shell/CommandPalette.tsx`, `src/panel/components/detail/RequestDetail.tsx`
(More actions menu markup only), `src/panel/components/compare/CompareModal.tsx`,
`src/panel/styles.css`.

**Steps:**
- Palette: fix icon/placeholder overlap; ellipsis on long rows; selection group heading shows
  the selected request once; action labels short. Keep command ids, ranking, keywords, replay
  capability gating (`isReplayableEntry`) and active-result announcements.
- More actions: compact menu with group dividers in the order given by S11, real-case labels,
  fits within the panel (opens upward/downward as space allows, scrolls if needed) — every item
  reachable. Keep item names (tests click them by accessible name), Escape/outside-click close.
- Compare: colour-code Result cells via tokens; collapse Equal rows behind a disclosure
  "Show N equal fields"; selector options show method + path + status, never internal ids;
  ellipsis in selects.
- Focused E2E: `test/e2e/palette-settings.e2e.mjs`, `test/e2e/comparison.e2e.mjs`,
  `test/e2e/ui-row-actions.e2e.mjs`, `test/e2e/phase67-navigation.e2e.mjs`,
  `test/e2e/task3-navigation.e2e.mjs`, `test/e2e/experiments.e2e.mjs`; unit `test/accessibility.test.js`.
- Screenshots: modal-shots palette, moremenu, compare at 1600 and 420.

## Task 4: Export modal

**Spec:** S13.

**Files:** `src/panel/components/export/ExportModal.tsx`, `src/panel/styles.css`.

**Steps:**
- Format picker as grouped compact chip rows or a grouped select at the top (Request, Response,
  Types, Tests, Session — keep the share-safe formats explicitly labelled as share-safe and the
  local/private labelling); preview fills the body; footer: filename + char count (left),
  Console / Snippet (secondary), Copy, Download (primary).
- Import HAR/session moves into the Session group area (still explicit; still confirmation-aware).
- Preview, copy and download keep using the identical `text`.
- 420: nothing clipped; all formats reachable.
- Focused E2E: any export E2E present (`grep -l Export test/e2e/*.mjs`), plus unit
  `test/detail-export-lenses.test.js`, `test/unit/exportImport.test.mjs`.
- Screenshots: modal-shots export at 1600, 760, 420.

## Task 5: API tab

**Spec:** S16, S17, S18, S19, S20, S21.

**Files:** `src/panel/components/api/EntriesWorkspace.tsx` (API workspace part only),
`src/panel/components/detail/RequestDetail.tsx`, `src/panel/components/detail/JsonView.tsx`,
`src/panel/styles.css`.

**Steps:**
- Summary line replaces summary cards (keep `buildApiListSummary` as the data source; error/slow
  counts are buttons that apply the existing Errors/Slow filters).
- One toolbar row: search, filter chips, clear filters, filters/sort toggle; active filters
  remain visible when the advanced section is collapsed.
- Rows ~44 px single line (compact rows setting may go denser); keep row action buttons
  (copy URL, pin) reachable and keyboard accessible; keep grouping disclosure labels
  ("Expand endpoint group"/"Collapse endpoint group"), option ids, listbox semantics, the
  "N new" pill, virtualizer.
- Detail: single facet tab row + lens control; actions (Copy, Export, Console, More actions) in
  the detail header; remove the bottom action bar. Keep "Close selected request detail".
- Narrow layouts: 600–900 px vertical split (list ≥ 40 %, existing PaneDivider if suitable);
  < 600 px full-height detail with a "← Requests" back button that clears/close detail and
  restores list focus.
- JsonView: keys never shrink/wrap; long values wrap only within the value.
- Focused E2E: `test/e2e/api-layout.e2e.mjs`, `test/e2e/api-filters.e2e.mjs`,
  `test/e2e/response-first.e2e.mjs`, `test/e2e/ui-row-actions.e2e.mjs`,
  `test/e2e/ui-responsive-hardening.e2e.mjs`, `test/e2e/task3-navigation.e2e.mjs`,
  `test/e2e/comparison.e2e.mjs`; unit `test/accessibility.test.js`, `test/detail-export-lenses.test.js`,
  `test/api-entries-model.test.js`.
- Screenshots: ui-shots api at 1600, 1100, 760, 420.

## Task 6: Logs tab

**Spec:** S22, S23, S24.

**Files:** `src/panel/components/api/EntriesWorkspace.tsx` (Logs workspace part only),
`src/panel/components/detail/LogDetail.tsx`, `src/panel/styles.css`.

**Steps:**
- Fixed grid row (level, time, message ellipsis, pin), ~32 px.
- Level chips matching Console's (reuse the same level-matching logic if exportable; otherwise
  share a small helper rather than duplicating).
- No selection → list full width; selection → detail pane; same surface colour for both.
- Keep listbox semantics, Enter/Space selection behaviour, pin button labels.
- Focused E2E: `test/e2e/ui-row-actions.e2e.mjs`, `test/e2e/task3-navigation.e2e.mjs`,
  `test/e2e/ui-responsive-hardening.e2e.mjs`.
- Screenshots: ui-shots logs at 1600, 760, 420 (select a log as well if feasible).

## Task 7: Console tab

**Spec:** S25, S26, S27, S28, S29.

**Files:** `src/panel/components/console/ConsoleWorkspace.tsx`, `src/panel/styles.css`.

**Steps:**
- Context line above the prompt merging picker + inspect; remove the duplicate "Selected …" chip.
  Keep `aria-label="Console request context"` combobox and the "Inspect in API" accessible name.
- Level chips → overflow-safe (select below the fit width or scroll row with fade).
- Snippets menu button beside Run (keyboard rename must remain possible).
- Empty-state example commands insert into the prompt draft only (never execute).
- Status bar single line at every width.
- Focused E2E: `test/e2e/console-context-layout.e2e.mjs`, `test/e2e/console-network-layout.e2e.mjs`,
  `test/e2e/console-network-scroll.e2e.mjs`, `test/e2e/console-preparation.e2e.mjs`,
  `test/e2e/ui-row-actions.e2e.mjs`; unit `test/console-runtime.test.js`, `test/accessibility.test.js`.
- Screenshots: ui-shots console at 1600, 760, 420.

## Task 8: Rules tab

**Spec:** S30, S31, S32.

**Files:** `src/panel/components/rules/Rules.tsx`, `src/panel/components/experiments/ExperimentPanel.tsx`,
`src/panel/components/investigations/InvestigationPanel.tsx`, `src/panel/styles.css`; store only
for a persisted-safe sub-tab id if needed.

**Steps:**
- Sub-tabs (tablist semantics) Rules · Experiments · Investigations with counts; Rules default.
  Existing deep links (e.g. reopening an investigation sets `activeTab: 'rules'`) must land on
  the right sub-tab.
- Rules toolbar: New rule (primary, right), Presets ▾ menu, overflow menu with Import/Export.
  Presets stay explicit and create disabled rules exactly as today (C-6 semantics unchanged).
- Investigations: form revealed by "Save current context"; explanations shortened to one-line
  hints.
- Focused E2E: `test/e2e/rule-drafts.e2e.mjs`, `test/e2e/investigations.e2e.mjs`,
  `test/e2e/investigation-store.e2e.mjs`, `test/e2e/experiments.e2e.mjs`,
  `test/e2e/phase67-navigation.e2e.mjs`; unit `test/rules-engine.test.js`, `test/accessibility.test.js`.
- Screenshots: ui-shots rules at 1600, 420.

## Task 9: Insights tab

**Spec:** S33, S34, S35.

**Files:** `src/panel/components/insights/Insights.tsx`, `src/panel/components/insights/FindingsPanel.tsx`,
`src/panel/styles.css`.

**Steps:**
- Overview strip first, Findings second, breakdown cards after.
- Compact finding rows grouped by request; keep select checkbox aria-labels
  (`Select finding …`), dismiss/restore semantics, history/dismissed views, evidence navigation.
- Synthesize button shows the selection count and is disabled with no selection.
- Focused E2E: `test/e2e/findings.e2e.mjs`, `test/e2e/finding-synthesis.e2e.mjs`,
  `test/e2e/phase67-navigation.e2e.mjs`.
- Screenshots: ui-shots insights at 1600, 420; modal-shots synthesis.

## Task 10: Integrated verification

**Files:** only fixes for regressions found here; `docs/ui-audit.md` (add a dated follow-up row
listing audit IDs resolved by this refresh).

**Steps:** `npm run check`, `npm run test:e2e`, `npm run test:coverage`,
`node scripts/check-dist-sync.mjs`, `git diff --check`; full ui-shots (1600,1100,760,420) and
modal-shots (1600,420) into `output/ui-refresh/after/`, compared against `before/`.
