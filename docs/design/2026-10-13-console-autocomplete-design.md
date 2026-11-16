# Console autocomplete — design

Approved in conversation on 2026-10-13 (research-backed batch **1–4**; picking an item key on an
array **plucks it with `map`**). Research basis: fx 40 query mode, Kibana KQL value suggestions,
Node REPL / Warp / JupyterLab manual invoke, WAI-ARIA APG combobox. This spec is the authority for
the implementation plan.

## Purpose

The Console prompt already suggests helpers, saved variables and the keys of `res`/`req`/pins,
and shows a signature hint for helpers. Gaps: arrays complete from their first item only (and
produce invalid JS such as `res.items.id`), there are no methods, no argument values, no way to
browse helpers without guessing a name, and the hint does not say which argument the caret is in.
Success: a user can explore a captured response and call every helper with the right arguments
without leaving the prompt or reading `$help`, by keyboard or pointer, and a screen reader user
hears how many suggestions there are.

## Constraints (unchanged product rules)

- Suggestions never evaluate code in the page. Every source is captured data already in the panel
  (roots, saved variables, pins, captured entries).
- No new dependencies. Tokens-only colours, every theme, `prefers-reduced-motion`.
- Document, closed-shadow HUD and window surfaces behave the same.
- Existing keys keep their meaning: Enter/Tab accept while the list is open, ↑/↓ move, Escape
  closes the list first. Enter runs when the list is closed (collapsed editor); Ctrl/⌘+Enter runs
  in the expanded editor. The 2-character gate for bare identifiers stays for as-you-type opening.
- Accessible name `Console command` and the listbox's `Suggestions` label stay.

## 1. Model (`src/panel/models/consoleAssist.ts`)

**A1. Suggestion shape.** `Suggestion` gains:
- kinds `method`, `index`, `value` (beside `helper`, `variable`, `property`);
- `group?: string` — section header shown above the first item of a group;
- `caret?: number` — caret offset inside `insert` after accepting (default: end);
- `from?: number` — per-item replace start overriding the result's `from` (used by `[0]` to
  replace the typed dot).

**A2. Cap.** `MAX_SUGGESTIONS` rises from 8 to 30; the list already scrolls. Ranking stays
`fuzzyScore`; ties keep source order so unfiltered lists show groups in order.

## 2. Array and string members (feature 1)

**M1. Arrays (`res.items.` without a bracket).** Items in this order:
1. `[0]` — kind `index`, detail `first item`, `from` = the dot's index (result `res.items[0]`);
2. `length` — kind `property`, detail = the count;
3. methods `map`, `filter`, `find`, `some`, `every`, `includes`, `slice`, `join`, `at` — kind
   `method`. Callback methods insert `map(x => x.)` style templates with `caret` after `x.`
   when items are objects, and `map(x => x)` with the caret after the final `x` when items are
   primitives; `includes()`, `slice()`, `join()`, `at()` put the caret inside the parens;
4. group **`keys across N items`** — the union of own enumerable keys over the first
   **1,000** items that are plain objects. Each key: kind `property`, detail `k/N · type`
   (type of the first defined value), insert `map(x => x.key)`; keys that are not valid
   identifiers insert `map(x => x["key"])`. Keys keep first-seen order.
Empty arrays offer only `length` and the methods.

**M2. Strings.** `length` (detail = length) and methods `includes`, `startsWith`, `endsWith`,
`slice`, `split`, `trim`, `toLowerCase`, `toUpperCase`, `replace`, `match` with the caret inside
the parens.

**M3. Objects** behave as today. **Bracket access** (`res.items[`) is unchanged.

## 3. Argument values (feature 2)

**V1. Locating the argument.** `signatureAt` is replaced by `argumentAt(draft, caret)` returning
`{ helper, index, argStart, quote }` or `null`: the innermost open call to a known helper, the
zero-based argument index (top-level commas only, ignoring strings and nested brackets), where the
current argument starts, and the open quote character if the caret is inside a string. The hint
(section 5) and value sources both use it. `signatureAt` stays as a thin wrapper for callers.

**V2. Helper parameters.** `HelperInfo` gains `params: { name, description, values? }[]`, where
`values` is one of `status | endpoint | keys | duration`, and `group` (section 4). `signature`
is derived from `params` (properties such as `res` have no params and keep their name).

**V3. Captured summary.** A pure `summarizeCaptured(entries)` (in `consoleAssist.ts`) returns
`{ statuses: {code, count}[], endpoints: {path, count}[], durations: number[] }` from API
entries: status codes and URL paths (`urlPath || url` without query string), each sorted by count
descending then value. `ConsolePrompt` memoizes it from the store's entries and passes it to the
editor as `captured`.

**V4. Sources.**

| Argument | Suggestions | Detail |
|---|---|---|
| `$status(` | captured status codes, most frequent first | `×34`; `×3 · error` for ≥ 400 |
| `$endpoint(` | captured paths, most frequent first | `×12` |
| `pick(x, [` / `omit(x, [` (2nd arg) | keys of `x` when `x` is a resolvable plain path (object, or first object of an array); keys already listed in the array are skipped | type |
| `$slow(` | `500`, `1000`, then the session's p95 and slowest duration, rounded to 10 ms, deduplicated | `default`, `p95`, `slowest` |

Endpoint values insert quoted (`'/api/users'`); if a quote is already open, they insert the path
plus the closing quote. Keys inside `[` insert quoted the same way, followed by nothing (the user
types `,` or `]`). Kind `value`.

**V5. Opening.** Inside a value-bearing argument the list opens immediately (no 2-character gate),
like member access. No captured data → no list.

## 4. Manual open and helper browsing (feature 3)

**B1. Ctrl+Space** (all platforms, matching DevTools) opens the list for the current context,
bypassing the 2-character gate. It is ignored during IME composition.

**B2. Browse.** With Ctrl+Space on an empty word (start of input, after an operator, space or
`(`), the list shows every helper grouped, then saved and pinned variables:
- **Request data**: `res`, `req`, `entry`, `prev`, `next`
- **Find entries**: `$all`, `$errors`, `$slow`, `$status`, `$endpoint`, `$prev`, `$next`
- **Transform**: `schema`, `diff`, `pick`, `omit`, `flatten`
- **Output**: `table`, `toTable`, `csv`, `toCSV`, `copy`, `$curl`, `$fetch`, `$mock`, `$help`
- **Variables**: saved and pinned names
Helpers with `params` insert `name(` with the caret inside.

**B3. Groups in the listbox.** Grouped items render inside `role="group"` elements with
`aria-labelledby` pointing at a visible, non-selectable header. `aria-activedescendant` and
↑/↓ skip headers. Items without a group render at the top level before any group, so
ungrouped lists render as today.

## 5. Signature hint and announcements (feature 4)

**H1. Active argument.** The hint renders the signature with the parameter at `argumentAt().index`
wrapped in `<strong class="xray-editor-hint-param">`, and the note shows that parameter's
description, falling back to the helper description. Past the last parameter, no highlight.

**H2. Live region.** A visually hidden `aria-live="polite"` element inside the editor announces
`N suggestions` when the list opens or its count changes, and `No suggestions` when Ctrl+Space
finds nothing. It is cleared when the list closes. No announcement on each arrow move (that is
`aria-activedescendant`'s job).

## 6. Testing

- **Unit** (`test/unit/consoleAssist.test.mjs`; two existing tests change deliberately — first
  array item → union, max 8 → 30): array members and order, union coverage counts and the
  1,000-item cap, non-identifier keys, primitive arrays, strings, `argumentAt` (nesting, strings,
  commas), each value source, `summarizeCaptured` ordering, browse groups, caret offsets.
- **E2E** (`test/e2e/console-editor.e2e.mjs`, document + closed shadow): Ctrl+Space opens the
  grouped list; accepting a key gives `res.items.map(x => x.email)`; accepting `filter` leaves the
  caret after `x.`; `$status(` offers captured codes with counts; `pick(res, ['` offers keys;
  the hint highlights the active argument; the live region text; Escape still closes first.
- Full gate: `npm run check`, `npm run test:e2e`, coverage ≥ current, dist synced.

## Out of scope

History ghost text, live page-object completion through the debugger, AI suggestions, a provider
architecture. Revisit with the next batch.
