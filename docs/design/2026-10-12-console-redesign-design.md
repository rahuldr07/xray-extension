# Console tab redesign — design

Approved in conversation on 2026-10-12 (layout **A · session cells** plus an **inspector for big
objects**; all five prompt upgrades). Mockups were reviewed inline in that conversation. This
spec is the authority for the implementation plan.

## Purpose

The Console serves a mix of uses: quick one-liners against captured responses, longer
multi-line snippets, and watching the page's own logs. Today results render twice, commands and
results are unpaired rows, big objects are cramped, errors are noisy, and the prompt gives no
help. Success: a user can run, read, reuse and compare results without leaving the tab, at every
panel width (420–1600 px), by keyboard or pointer.

## Constraints (unchanged product rules)

- Execution stays explicit: nothing runs in the page except on Run/Enter (or Re-run). Previews,
  suggestions and starters never evaluate code in the page.
- Evaluation path unchanged: panel → `panel/console.js` → background `xray:console-eval` →
  `chrome.debugger` `Runtime.evaluate` with the inlined helper runtime (C-1). Context crosses
  only as the existing JSON payload.
- No new dependencies. Tokens-only colours, every theme, light/dark, `prefers-reduced-motion`.
- Document, closed-shadow HUD and window surfaces. One listbox/focus model per list;
  topmost-Escape and shared `menuBehavior` for menus; `ModalShell` rules for overlays.
- Existing accessible names pinned by tests stay (`Console command`, `Console request context`,
  `Inspect in API`, `Run`, `Snippets`, `Filter console messages`) unless a test is deliberately
  updated with a reason.

## 1. Command cell and result display

**C1. One cell per run.** A command and its result render as one card (pairing by the existing
`commandId`). Header: the command (first line, ellipsis; multi-line shows line count), run time in
ms, and actions: Re-run, Edit in prompt, More (Copy command, Delete cell).

**C2. Result shown once.** No preview line plus auto-expanded duplicate. Result header shows a type
badge: `number`, `string · 24 chars`, `boolean`, `null`, `undefined`, `array · N items`,
`object · N keys`, with size when ≥ 1 kb.

**C3. Result views.**
- Scalars (number, string ≤ 120 chars, boolean, null, undefined): one compact line in the cell
  header (`› res.users.length → 42 · number`).
- Arrays whose items are mostly plain objects with shared keys: **Table** by default (columns =
  union of the first 20 items' keys, max 12 columns, max 100 rows shown with "+N more").
- Other objects/arrays: **Tree** by default. **JSON** (formatted, copyable) always available.
- View choice is per cell; segmented control Table / Tree / JSON (Table only when eligible).

**C4. Result actions.** Copy (JSON; scalars copy raw), Save as variable (assigns `temp1`, `temp2`…
in Chrome DevTools style via the existing console scope; the cell shows the assigned name), and
`$_` always refers to the last successful result.

**C5. Errors.** Badge with the error name + message. The stack disclosure appears only when a real
stack exists (no "No stack trace available"). A one-line hint for common mistakes, generated
locally from the message + command:
- property read on undefined where the command starts with `res.` → "res is the response body
  itself. Try Object.keys(res)."
- `X is not defined` where X is close to a helper name → "Did you mean `schema`?"
- no request selected and command uses `res`/`req` → "No request selected. Pick one above."
- SyntaxError → "Check brackets and quotes. Shift+Enter adds a new line."

**C6. Big results → inspector.** A result is "big" when it has > 50 items/keys at the top level or
its serialized size > 20 kb. The cell then shows the type badge, a one-line shape summary
(`{ users: Array(500), meta: {…}, … }`) and **Open in inspector**.

**C7. Inspector.** Views Tree / Table (when eligible) / JSON; a key/path filter; selecting a node
shows its path (`users[0].name`) in a footer with Copy path and Use in prompt (inserts the path,
prefixed with the cell's variable or the original expression). Layout: docked on the right of the
Console when the Console is ≥ 900 px wide (resizable with the existing `PaneDivider`); below that
a full-height overlay with a Back control. Escape closes it and returns focus to the cell's
"Open in inspector" button. Opening a different big result replaces the inspected value.

## 2. Prompt and request context

**P1. Request context line.** Above the editor: `res = METHOD /path · status · size · age`.
**Change ▾** opens a searchable request picker (keyboard: type to filter, ↑/↓, Enter, Escape);
an icon button opens the request in the API tab (keeps "Inspect in API"). With nothing selected:
"No request selected · plain JavaScript only" with a Pick request link. The
`Console request context` accessible name stays on the picker control.

**P2. Pinned requests as variables.** "Pin request" (from the picker or the request detail More
menu) pins the current/selected request as the next free single letter `a`, `b`, `c`… (max 6),
shown as removable chips beside `res`. A pinned variable resolves to that request's parsed
response body, like `res`. Pins are panel-session state (not persisted), cleared with the session,
and dropped with a notice if the entry is evicted. They travel to evaluation through the existing
`context.pins` mechanism, sending the full entry only for pinned requests.

**P3. Multi-line editor.** Auto-grows to 8 lines, then scrolls. Enter runs; Shift+Enter inserts a
newline; ↑/↓ walk history only when the caret is on the first/last line; paste of multi-line code
keeps it. Placeholder: "Type JavaScript · Shift+Enter for a new line".

**P4. Syntax colouring.** Lightweight tokenizer (keywords, strings, numbers, comments,
punctuation) rendered as an overlay behind a transparent textarea, so caret, selection, IME,
undo and accessibility stay native. Token colours from theme tokens.

**P5. Suggestions.** While typing an identifier or after `.`/`[`: helper names (from the runtime
helper list, with one-line descriptions), saved variables (`temp1`, `$_`), pinned variables, and
property names of the referenced captured value with their types (resolved locally from the
selected/pinned entry's captured body; arrays use the first item). Max 8 shown, fuzzy prefix
match. Tab or Enter accepts, Escape dismisses, ↑/↓ navigate; Enter runs when the list is closed.
Exposed as a listbox with `aria-activedescendant` from the editor.

**P6. Helper signature hint.** When the caret is inside a helper call (`diff(`), a one-line
signature and description shows under the editor (from a small static table for the documented
helpers).

**P7. Live path preview.** When the whole draft is a plain path expression
(`res|req|a…f|temp\d+|$_` followed by `.name`, `[n]`, `["key"]` segments only), the panel resolves
it locally against captured data and shows a muted "→ value (from captured data)" line. Anything
else shows no preview. Never evaluates code.

**P8. Smart starters.** Up to 5 chips generated from the current `res` shape, inserted into the
draft (never run): Table of `<array>` (`table(res.users)`), Count `<array>`
(`res.users.length`), Find `<item>` by id (`res.users.find(u => u.id === )` with the caret placed),
Diff with previous call (`diff(prev, res)` when a previous same-endpoint call exists), Schema
(`schema(res)`). Shown in the empty state and as a row above the editor while the draft is empty.

**P9. Helper chips** under the editor insert at the caret: `res`, `req`, `schema(res)`, `$prev`,
saved/pinned variables, `$help`.

**P10. Expanded editor.** An Expand toggle (and Ctrl/⌘+↑) grows the editor to a large pane (≈ 60%
of the Console height; full height below 600 px) with line numbers, auto-closing brackets/quotes,
Format (indentation normalization only — no external formatter), Run all (Ctrl/⌘+Enter), Run
selection, and Save as snippet. Results still land as normal cells. Collapse restores the
one-line editor with the draft intact.

**P11. Run state.** Run shows "Running…" and, after 2 s, a Cancel that stops waiting (the
in-page evaluation is not recalled; a late result is discarded and the cell shows "Cancelled").

## 3. Stream, page logs and filters

**S1. One timeline.** Command cells and page log lines interleave chronologically.

**S2. Filters.** Chips with counts: All, My commands, Page logs, Warnings, Errors (Errors includes
failed commands). Text filter searches messages, bounded structured data, and command source.
Filters narrow the same stream.

**S3. Page log lines.** One compact line: level icon, message (ellipsis), source location
(`file:line`) when known. Small objects expand inline (Tree); big ones use Open in inspector
(same C6 threshold). Error stacks expand from "stack".

**S4. Repeats.** Consecutive identical page logs (same level + message + source) collapse into one
line with a `×N` badge (extends the existing repeat counter).

**S5. Scroll behaviour.** At the bottom, the stream follows new output. When scrolled up it holds
position and shows "N new messages · Jump to latest". Running a command always scrolls to its cell.

**S6. Clear ▾ and Live.** Clear everything / only my commands / only page logs (confirmation per
existing rules). Live pauses/resumes page-log streaming with buffered count (existing behaviour).

## 4. Data and boundaries

- Result metadata (type, size, item/key count, duration, table eligibility, big flag) is derived
  by pure functions in a new `src/panel/models/consoleResults.ts` from the existing serialized
  result; duration is measured in the panel around the evaluation call.
- Path resolution, suggestions, starters and error hints are pure functions in
  `src/panel/models/consoleAssist.ts`, operating on captured entry data only.
- Saved variables (`temp1`, `$_`) and pins use the existing `XRAY_Console` scope/pin APIs, so they
  reach evaluation through `context.scope` / `context.pins`.
- `ConsoleWorkspace.tsx` is split into focused components under
  `src/panel/components/console/` (cell, result view, inspector, prompt/editor, context line,
  stream) — it is already ~1,000 lines.

## 5. Testing

- Unit: consoleResults (type badges, table eligibility, big threshold, summaries),
  consoleAssist (path parsing/resolution, suggestions incl. array-first-item, starters per
  shape, error hints), syntax tokenizer.
- E2E (document + closed shadow; 420 / 760 / 1600): cell pairing and single render; scalar
  inline; table/tree/json switching; copy/save-as-variable then use in a later command (via a
  stubbed `XRAY_Console`); error hint; inspector open/close/focus return/docked vs overlay; prompt
  keyboard (Enter, Shift+Enter, history edges, suggestions Tab/Enter/Escape); live preview only
  for plain paths; starters insert without executing; pins appear and are passed in context;
  expanded editor run-all/selection; filters and repeat collapse; jump-to-latest.
- Real extension in Chrome: run `1+1`, a multi-line snippet, a big `res`, and a pinned diff.
- Screenshots before/after at 1600/760/420.

## Out of scope

Autocomplete that evaluates code; persistent pins across sessions; an external code-editor
library; changing the evaluation transport or permissions.
