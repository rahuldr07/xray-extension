# UI layout refresh — design

Approved 2026-10-12 from a rendered review of every tab and modal at 1600 / 760 / 420 px
(`npm run ui:shots` plus `output/ui-refresh/modal-shots.mjs`). Before-screenshots:
`output/ui-refresh/before/` (gitignored). IDs in brackets refer to `docs/ui-audit.md`.

## Goals

Show more of the subject (requests, logs, output) and less chrome; make every surface usable
at 420 px; make the modals one consistent system. No behaviour, privacy, consent, capture
or persistence semantics change.

## Constraints

- No new dependencies. Colours, radii, spacing and type come from `src/panel/styles/tokens.css`
  tokens and must work in every theme (Signal Gray, Harbor Instrument, Paper Relay, High
  Contrast, Claude, Custom) and in light and dark.
- Document, closed-shadow HUD and pop-out window surfaces keep working; layouts respond to the
  panel's container width (container queries already exist), not only the viewport.
- Keyboard and AT semantics stay at least as good: one listbox tab stop, `aria-activedescendant`,
  modal focus/Escape ownership, initial focus rules, live regions, aria-labels that tests or
  users rely on. Changing an aria-label/role requires updating the tests deliberately.
- Explicit execution and AI consent stay explicit: nothing runs, sends or arms on open.
- `prefers-reduced-motion` respected for any new motion.

## Global

1. Case: stop force-uppercasing data and controls. Request paths, URLs, preset names, button
   labels, tab labels and finding titles render in their real case [S-15, N-5, C-18, N-19].
   Uppercase remains only for small section eyebrows/column headers.
2. Header: tab text labels stay visible down to ~600 px container width (today icon-only already
   at 760). The record control shows recording state as a red dot/pill, not a permanent focus-like
   accent ring; the accent ring is reserved for `:focus-visible`.
3. One shared notice/callout component (info / warning / error) with icon, tinted background and
   one line of text, used for "Extension storage unavailable…", "Page bridge unavailable…" and
   similar plain-text warnings.

## Modal system (ModalShell and every modal)

4. Body padding: every modal body has the same inner padding as its header (Edit & Replay,
   Explain, Synthesize currently render flush to the left border).
5. Type scale: one body size and one hint size inside modals; no large light body copy next to
   11px headers.
6. Footer: one rule — secondary actions on the left of the action group, primary action last on
   the right, equal heights, labels never wrap at ≥ 600 px.
7. Narrow: below ~600 px every modal becomes a full-height sheet with pinned header (title +
   always-visible close button) and pinned footer; the body scrolls. Edit & Replay currently loses
   its close button at 420.
8. AI prompt previews (Explain, Synthesize) render as a read-only code block with a Copy button;
   they are not a focused, resizable textarea. Destination/model shows as a compact banner at the
   top. "Include …" options use the toggle style used by Settings. Synthesize lists findings by
   title/request, not internal IDs.
9. Confirmation: no contradictory subtitle [M-18]; copy avoids internal jargon ("React console
   stream" → "console output").
10. Command palette: search icon must not overlap the placeholder/input text; long rows truncate
    with an ellipsis; the selection group shows the selected request once as its heading and uses
    short action labels (Replay, Edit & replay, Explain, Save investigation, Compare left/right).
11. More actions menu: a compact menu (not 12 full-width bordered uppercase buttons) with
    dividers between groups — run (Replay, Edit & Replay, Prepare experiment) · analyse (Explain,
    Save investigation, Create disabled mock rule) · copy (cURL, fetch, mock JSON, Save snippet) ·
    compare (left, right, open). All items reachable without the menu running off-screen.
12. Compare: Result column colour-coded (Changed accent/warning, Equal muted, Unavailable dim);
    equal rows collapsed behind "Show N equal fields"; selectors show method + path + status, not
    internal entry IDs, and truncate with an ellipsis.
13. Export: format chosen from a compact chip row/select at the top grouped by Request /
    Response / Types / Tests / Session; the preview fills the body; footer holds filename, char
    count, Copy, Download (and Console/Snippet as secondary). Import moves out of the export
    footer into the Session group. Nothing is cut off at 420 [M-11].
14. Find in traffic: the limits sentence is not cut mid-word (tooltip or wrapping hint).
15. Edit & Replay: the cross-origin acknowledgement appears only when the edited URL's origin
    differs from the captured one; at 420 the URL field is usable (full width row).

## API tab

16. Replace the five summary cards with a one-line summary ("10 requests · 1 error · 2 slow ·
    avg 499ms · 27.6kb"); error/slow numbers act as filter shortcuts.
17. Search + filter chips + Clear filters on one toolbar row; "Filters & sort" becomes an icon
    toggle on that row [N-10, N-11 — active filters stay visible].
18. Request rows ~44 px single line: method, path (ellipsis), status, duration bar + ms; host /
    source / size / time as dimmed secondary text on the same line where width allows.
19. Detail: one tab row (Response · Request · Headers · Timing) with the lens (Tree/Raw/Table/
    Schema/Diff/Visualize) as a compact segmented control or select on the right; Copy / Export /
    Console / More move into the detail header; the bottom action bar goes away.
20. Narrow: 600–900 px a resizable vertical split (list on top, at least 40 %); below 600 px the
    detail opens full-height with a "← Requests" back control instead of a sheet covering the list.
21. JSON tree: a long value never shreds its key [N-6].

## Logs tab

22. Fixed row grid: level, time, message (ellipsis), pin — the timestamp never overlaps the
    message [N-18]; ~32 px rows.
23. The same level chips as Console (All / Logs / Warnings / Errors) above the list.
24. With nothing selected the list uses the full width; the detail pane appears on selection.
    Both panes use the same surface colour.

## Console tab

25. Request context is one line directly above the prompt: `res = GET /path · 200 ▾ ↗` — picker
    and "Inspect in API" in one control; the duplicate "Selected …" chip is removed. The
    `aria-label="Console request context"` combobox and "Inspect in API" button remain.
26. Level chips collapse into a "Level" select (or a horizontally scrollable row with an edge
    fade) when they do not fit; nothing is clipped at 420.
27. Snippets: a "Snippets" menu button next to Run instead of a permanent strip [C-24].
28. Empty stream shows 3–4 example commands (`res.data`, `schema(res)`, `Object.keys(res)`,
    `$help`) that insert into the prompt (never run) when clicked.
29. Status bar never wraps; it truncates or drops low-priority items at narrow widths.

## Rules tab

30. Sub-tabs: Rules · Experiments · Investigations (with counts); Rules first.
31. Rules toolbar: "New rule" right-aligned with a "Presets ▾" menu; Import/Export in an overflow
    menu. Presets keep their real-case labels.
32. Investigations: the title/notes form appears after "Save current context" is chosen, not as
    an always-open form. Long section explanations become one-line hints or ⓘ tooltips.

## Insights tab

33. Overview numbers first (single strip), then Findings, then breakdown cards.
34. Findings render as compact rows: severity icon, title, request (method path · status · ms),
    and a small dismiss icon button; the explanation sentence is secondary/expandable. Findings
    for the same request are grouped under that request.
35. "Synthesize selected" appears/enables only with a selection; the "0/5 selected…" sentence is
    replaced by a count on the button.
