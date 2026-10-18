# Console Autocomplete Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Array/string-aware member completion, helper argument values from captured traffic, Ctrl+Space browsing, and an active-argument hint with screen-reader announcements in the Console prompt.

**Architecture:** All suggestion logic stays pure in `src/panel/models/consoleAssist.ts` (unit-tested, no DOM). `ConsolePrompt.tsx` derives a captured-traffic summary from the store and passes it down; `ConsoleEditor.tsx` only decides when the list opens, renders it (now with groups), applies accepted items and announces counts.

**Tech Stack:** React 19 + Zustand (`src/panel`), Vite build to `dist/`, Node test runner (`test/unit/*.test.mjs` import `.ts` via `test/unit/harness.mjs`), Playwright E2E (`test/e2e/console-editor.e2e.mjs` fixture: real App/store/stylesheet, stubbed `XRAY_Console`, document + closed shadow).

**Spec:** `docs/superpowers/specs/2026-10-13-console-autocomplete-design.md` (items A1–A2, M1–M3, V1–V5, B1–B3, H1–H2). Read the items your task names.

## Global Constraints

- Suggestions never evaluate code: no `executeConsoleCommand`/`XRAY_Console.execute` call from any suggestion, hint or browse path (the editor fixture's `calls` must stay empty).
- `MAX_SUGGESTIONS` = 30. Union scan cap = first 1,000 array items. Ranking = existing `fuzzyScore`, ties keep source order.
- Array methods, in order: `map`, `filter`, `find`, `some`, `every`, `includes`, `slice`, `join`, `at`. String methods, in order: `includes`, `startsWith`, `endsWith`, `slice`, `split`, `trim`, `toLowerCase`, `toUpperCase`, `replace`, `match`.
- Browse groups and members exactly as spec B2 (Request data / Find entries / Transform / Output / Variables).
- Keys: Ctrl+Space opens (all platforms; ignored while `isComposing`/keyCode 229). Existing Enter/Tab/↑/↓/Escape semantics unchanged; bare identifiers keep the 2-character as-you-type gate.
- Keep accessible names `Console command` and listbox label `Suggestions`.
- No new dependencies; theme tokens only; every theme; `prefers-reduced-motion`; document, closed-shadow HUD and window surfaces.
- Never commit, stash, reset or checkout (the user's tree is uncommitted). Lint 0 errors, warnings ≤ 53. After any `src/` change run `npm run build` so `dist/` stays in sync (`node scripts/check-dist-sync.mjs`).

## Review Focus

- **Uneven arrays** (`[{a:1}, null, 3, {a:2,b:1}]`): only plain objects are scanned and counted; detail is `k/N` with N = number of plain objects scanned (here `a` → `2/2`, `b` → `1/2`). → Task 1 test `suggest: union skips non-objects`.
- **Delimiters inside strings** (`$endpoint('/a,b(` and `diff(a, ')'`): `argumentAt` ignores `,` `(` `)` inside quotes and nested brackets. → Task 2 test `argumentAt: strings and nesting`.
- **Huge arrays** (100,000 objects): the scan stops at 1,000; the header reads `keys across first 1,000 items`; the call returns in < 50 ms. → Task 1 test `suggest: union is capped`.
- **Accepting mid-line** (`res.items.▌.length` → accept `[0]`): only `from..caret` is replaced; text after the caret is kept, and `[0]` removes the typed dot. → Task 3 E2E `accept replaces only the typed range`.
- **Awkward keys** (`""`, `"0"`, `"a-b"`): inserted as `map(x => x[""])`, `map(x => x["0"])`, `map(x => x["a-b"])`. → Task 1 test `suggest: non-identifier keys`.

---

### Task 1: Array and string members (A1, A2, M1–M3)

**Files:**
- Modify: `src/panel/models/consoleAssist.ts` (`Suggestion`, `MAX_SUGGESTIONS`, the member branch of `suggest`)
- Test: `test/unit/consoleAssist.test.mjs`

**Interfaces:**
- Produces:
  ```ts
  export interface Suggestion {
    label: string; insert: string; detail: string;
    kind: 'helper' | 'variable' | 'property' | 'method' | 'index' | 'value';
    group?: string;   // header text of the item's group
    caret?: number;   // caret offset inside `insert` after accepting; default insert.length
    from?: number;    // replace start overriding the result's `from`
  }
  ```
  `suggest()` signature unchanged in this task.

- [ ] **Step 1: Update the two deliberate tests and add new ones** in `test/unit/consoleAssist.test.mjs`:
  - In `suggest: properties via first array item`, replace the `arr` assertion: `suggest('res.', 4, { roots: { res: [{ id: 1 }] }, variables: [] })` labels start with `['[0]', 'length', 'map', 'filter', 'find', 'some', 'every', 'includes', 'slice', 'join', 'at', 'id']`; the `id` item has `group: 'keys across 1 item'` (singular for 1), `detail: '1/1 · number'`, `insert: 'map(x => x.id)'`, `kind: 'property'`. Rename the test `suggest: object properties; arrays get index, length, methods, keys`.
  - In `suggest: helpers and variables, max 8`, change the cap assertion to ≤ 30 with 40 variables supplied; rename `… max 30`.
  - `suggest: array index replaces the dot` — for draft `res.items.` (caret 10), item `[0]` has `from: 9`, `insert: '[0]'`, `kind: 'index'`, `detail: 'first item'`; `length` detail is the count as a string (`'3'`).
  - `suggest: array method templates` — object items: `map` insert `map(x => x.)` with `caret` 11; `filter` insert `filter(x => x.)` caret 14; primitive items (`[1,2]`): `map` insert `map(x => x)` caret 10; `includes` insert `includes()` caret 9; `join` insert `join()` caret 5; all `kind: 'method'`.
  - `suggest: union keys and coverage` — `[{id:1,email:'a'},{id:2},{id:3,email:'c'}]` → keys `id` (`3/3 · number`), `email` (`2/3 · string`) in first-seen order, group `keys across 3 items`.
  - `suggest: union skips non-objects` — `[{a:1}, null, 3, {a:2,b:1}]` → `a` `2/2 · number`, `b` `1/2 · number`, group `keys across 2 items`.
  - `suggest: union is capped` — 100,000 objects where only item 50,000 has key `late`: no `late` item; group `keys across first 1,000 items`; elapsed < 50 ms.
  - `suggest: non-identifier keys` — keys `''`, `'0'`, `'a-b'` insert `map(x => x[""])`, `map(x => x["0"])`, `map(x => x["a-b"])`.
  - `suggest: empty array` — `res.items.` on `[]` → labels exactly `['length', 'map', 'filter', 'find', 'some', 'every', 'includes', 'slice', 'join', 'at']`.
  - `suggest: string members` — `res.name.` on `'Ada'` → first label `length` (detail `'3'`), then the 10 string methods in constraint order, each inserting `name()` with caret before `)`.
  - `suggest: filtering keeps group order` — on the 3-item array, partial `e` (`res.items.e`): the first two labels are `every`, `email` (prefix matches, source order).
  - Bracket access (`res.items[`) still returns `[]`-path behaviour from the existing tests (no change).

- [ ] **Step 2: Run to verify they fail**

  Run: `node --test test/unit/consoleAssist.test.mjs`
  Expected: the new/updated tests FAIL (labels/fields missing), existing unrelated tests pass.

- [ ] **Step 3: Implement** in `consoleAssist.ts`: extend `Suggestion`; set `MAX_SUGGESTIONS = 30`; in the member branch, when the resolved target is an array and access is not bracketed, build index/length/method items then the union group (scan `Math.min(length, 1000)` items, count plain objects only, header `keys across N items` or `keys across first 1,000 items` when `length > 1000`); when it is a string, build `length` + string methods; objects unchanged. Rank all items with `rank()` (stable). Use `IDENT` to choose `x.key` vs `x[JSON.stringify(key)]`.

- [ ] **Step 4: Run to verify they pass**

  Run: `node --test test/unit/consoleAssist.test.mjs`
  Expected: all PASS.

- [ ] **Step 5: Gate the task**

  Run: `npm run typecheck && npm run lint && npm test`
  Expected: 0 type errors, 0 lint errors (warnings ≤ 53), all unit tests pass. (No E2E change yet: the editor still renders `label`/`detail` and inserts `insert`; `from`/`caret` are honoured in Task 3.)

---

### Task 2: Helper parameters, argument values and browse list (V1–V5, B2 model)

**Files:**
- Modify: `src/panel/models/consoleAssist.ts` (`HelperInfo`, `HELPERS`, `signatureAt`, `suggest` ctx)
- Test: `test/unit/consoleAssist.test.mjs`

**Interfaces:**
- Consumes: `Suggestion` from Task 1.
- Produces:
  ```ts
  export type ValueSource = 'status' | 'endpoint' | 'keys' | 'duration';
  export interface HelperParam { name: string; description: string; values?: ValueSource }
  export interface HelperInfo { name: string; signature: string; description: string; group: HelperGroup; params?: HelperParam[] }
  export type HelperGroup = 'Request data' | 'Find entries' | 'Transform' | 'Output';
  export interface CapturedSummary { statuses: { code: number; count: number }[]; endpoints: { path: string; count: number }[]; durations: number[] }
  export function summarizeCaptured(entries: ReadonlyArray<{ type?: string; status?: number; url?: string; urlPath?: string; duration?: number }>): CapturedSummary;
  export function argumentAt(draft: string, caret: number): { helper: HelperInfo; index: number; argStart: number; quote: '' | '"' | "'" | '`' } | null;
  export function signatureAt(draft: string, caret: number): { name: string; signature: string; description: string; params: HelperParam[]; index: number } | null;
  export function suggest(draft: string, caret: number, ctx: { roots: Record<string, unknown>; variables: string[]; captured?: CapturedSummary; manual?: boolean }): { from: number; items: Suggestion[]; context: 'member' | 'argument' | 'identifier' | 'browse' | 'none' };
  ```
  `signature` stays a stored string, but must equal `name(param1, param2)` for helpers with `params` (a unit test asserts this for every helper). `$slow`'s signature stays `$slow(ms = 1000)` via param name `ms = 1000`.

- [ ] **Step 1: Write failing tests** in `test/unit/consoleAssist.test.mjs`:
  - `HELPERS: groups and params` — every helper has a `group` from the four; group membership equals spec B2 exactly; for helpers with `params`, `signature === \`${name}(${params.map(p => p.name).join(', ')})\``; `$status` param `values: 'status'`, `$endpoint` `'endpoint'`, `$slow` `'duration'`, `pick`/`omit` second param `'keys'`.
  - `summarizeCaptured` — API entries with statuses `[200,200,404,500,200]` → `statuses` `[{code:200,count:3},{code:404,count:1},{code:500,count:1}]` (ties by code ascending); `urlPath` preferred, else `url` path without query (`http://h/api/a?x=1` → `/api/a`); non-API entries ignored; `durations` = numeric durations of API entries.
  - `argumentAt: index and quote` — `diff(a, ` caret end → `index 1`; `$endpoint('/api` → `index 0`, `quote "'"`; `pick(res, ['id', '` → `index 1`, quote `'`; outside any call → `null`; method call `res.map(` → `null`.
  - `argumentAt: strings and nesting` — `$endpoint('/a,b(` → `index 0`; `diff(a, ')', ` → `index 2`; `diff(pick(res, [`→ helper `pick`, `index 1`; `diff([1,2], ` → `index 1`.
  - `signatureAt` returns `params` and `index` for `diff(a, ` (index 1).
  - `suggest: $status values` — captured statuses above, draft `$status(` → context `'argument'`, labels `['200','404','500']`, details `['×3','×1 · error','×1 · error']`, kind `'value'`; partial `$status(4` → `['404']`.
  - `suggest: $endpoint values` — endpoints `/api/users`×2, `/api/a`×1: `$endpoint(` inserts `'/api/users'`; `$endpoint('` inserts `/api/users'` (path + closing quote); `$endpoint("/api/u` inserts `/api/users"`.
  - `suggest: pick/omit keys` — roots `{res:{id:1,email:'x'}}`: `pick(res, ['` → labels `['id','email']`, inserts `id'` / `email'`; `pick(res, ['id', '` → `['email']`; `pick(res, [` → inserts `'id'`; unresolvable first arg → `[]`; array first arg uses its first object.
  - `suggest: $slow values` — p95 = nearest-rank (`sorted[ceil(0.95·n) − 1]`), values rounded to 10 ms, deduplicated against earlier labels. Durations `[100, 250, 980, 1400, 3020]` → p95 = slowest = 3020 → labels `['500','1000','3020']`, details `['default','default','slowest']`. Durations `10, 20, …, 200` (20 values) → labels `['500','1000','190','200']`, details `['default','default','p95','slowest']`. No durations → `['500','1000']`.
  - `suggest: browse` — `suggest('', 0, {roots:{}, variables:['temp1'], manual:true})` → context `'browse'`; groups in order `Request data`, `Find entries`, `Transform`, `Output`, `Variables`; helpers with params insert `name(` with `caret` = `name.length + 1`; `temp1` in `Variables`. Also after `x = ` and after `(` with `manual: true`. Without `manual`, empty partial → `[]` and context `'none'`. Browse ignores `MAX_SUGGESTIONS` (all helpers + variables).
  - `suggest: no captured data` — `$status(` with `captured` undefined → items `[]`, context `'argument'`.

- [ ] **Step 2: Run to verify they fail**

  Run: `node --test test/unit/consoleAssist.test.mjs`
  Expected: new tests FAIL.

- [ ] **Step 3: Implement**: add `group`/`params` to every `HELPERS` entry (descriptions per param, short, sentence case); `summarizeCaptured`; `argumentAt` (single left-to-right scan tracking quotes with escapes, a stack of open `(`/`[`/`{` with their start index and a comma count for the `(` frames — the innermost `(` frame preceded by a known helper identifier not preceded by `.` wins); `signatureAt` as a wrapper; in `suggest`, check `argumentAt` first (argument context: when the current param has `values`, return value items; otherwise fall through to normal identifier/member logic), then member, then identifier/browse. Return `context` on every path.

- [ ] **Step 4: Run to verify they pass**

  Run: `node --test test/unit/consoleAssist.test.mjs`
  Expected: all PASS.

- [ ] **Step 5: Gate the task**

  Run: `npm run typecheck && npm run lint && npm test`
  Expected: 0 errors, warnings ≤ 53, all pass. Callers of `signatureAt`/`suggest` still compile (extra fields only).

---

### Task 3: Editor — accept, groups, Ctrl+Space, live region (A1 in UI, B1, B3, H2, V5 opening)

**Files:**
- Modify: `src/panel/components/console/ConsoleEditor.tsx` (`visibleSuggestions`, key handling, list markup, accept), `src/panel/styles.css` (group header, visually hidden live region)
- Test: `test/e2e/console-editor.e2e.mjs`

**Interfaces:**
- Consumes: `suggest(..., { captured, manual })` and its `context`; `Suggestion.from/caret/group` (Tasks 1–2).
- Produces: `ConsoleEditorProps.captured?: CapturedSummary` (optional; Task 4 passes it).

- [ ] **Step 1: Write failing E2E tests** (both fixtures, document + closed shadow), in `console-editor.e2e.mjs` using its existing `BODY` (users array of 2):
  - `Ctrl+Space browses grouped helpers` — empty draft, press `Control+Space` → listbox visible with `role="group"` children labelled `Request data`, `Find entries`, `Transform`, `Output`; ↓ from the first option moves to the second option (headers never get `aria-activedescendant`); Enter on `$status` gives draft `$status(` with caret at the end; `ed.calls.length === 0`.
  - `array key plucks with map` — type `res.users.`, the list shows `[0]` and a group `keys across 2 items` containing `email`; ↓ to `email`, Enter → draft `res.users.map(x => x.email)`.
  - `method template places the caret` — type `res.users.fil`, Enter → draft `res.users.filter(x => x.)`, then type `id` → `res.users.filter(x => x.id)`.
  - `accept replaces only the typed range` — draft `res.users..length`, caret after the first `.` following `users` (index 10), `Control+Space`, accept `[0]` → `res.users[0].length`.
  - `live region announces counts` — after typing `res.users.` the element `.xray-editor-live` (inside the editor, `aria-live="polite"`) reads `${n} suggestions` where `n` is the number of `[role="option"]` elements in the listbox; typing `zzz` then `Control+Space` reads `No suggestions`; after Escape it is empty.
  - Existing tests must still pass unchanged (Escape closes first, Tab/Enter accept, undoability, history).

- [ ] **Step 2: Run to verify they fail**

  Run: `node --test test/e2e/console-editor.e2e.mjs`
  Expected: the five new tests FAIL; existing ones PASS.

- [ ] **Step 3: Implement**:
  - `visibleSuggestions(draft, caret, roots, variables, captured, manual)`: pass `captured`/`manual` to `suggest`; skip the 2-character gate when `manual` or `context` is `'member'` or `'argument'`.
  - State `manualOpen` set by Ctrl+Space (`event.ctrlKey && event.code === 'Space'`, not composing; `preventDefault`), cleared on the next edit, Escape, blur, accept; Ctrl+Space also sets `listOpen`.
  - `accept(item)`: replace `(item.from ?? suggestions.from)..caret` with `item.insert`, caret at `start + (item.caret ?? item.insert.length)`, through the existing undoable `edit()`.
  - Markup: items without `group` render as today; consecutive items sharing a `group` render inside `<li role="group" aria-labelledby={headerId}>` with `<div id={headerId} class="xray-editor-group-label" role="presentation">` and a nested `<ul role="none">` of options. Option ids/indices stay flat over items, so ↑/↓ and `aria-activedescendant` skip headers.
  - Live region: `<span className="xray-editor-live xray-visually-hidden" aria-live="polite">` with `N suggestions` / `No suggestions` (the latter only for a manual open with zero items) / empty when closed. Reuse an existing visually-hidden class if `styles.css` has one (`grep -n "visually-hidden\|sr-only" src/panel/styles.css`); else add `.xray-visually-hidden`.
  - CSS: `.xray-editor-group-label` uses existing hint/muted tokens, small caps label size consistent with `.xray-settings-nav-group-title`; not clickable (`pointer-events: none`).

- [ ] **Step 4: Run to verify they pass**

  Run: `node --test test/e2e/console-editor.e2e.mjs`
  Expected: all PASS.

- [ ] **Step 5: Gate the task**

  Run: `npm run typecheck && npm run lint && npm test && npm run build && node scripts/check-dist-sync.mjs`
  Expected: all pass; `dist-sync: all 3 bundles match the current source.`

---

### Task 4: Captured values in the prompt and the active-argument hint (V3–V5 wiring, H1)

**Files:**
- Modify: `src/panel/components/console/ConsolePrompt.tsx` (memoized `summarizeCaptured(entries)` → `captured` prop), `src/panel/components/console/ConsoleEditor.tsx` (hint rendering), `src/panel/styles.css` (`.xray-editor-hint-param`)
- Test: `test/e2e/console-editor.e2e.mjs`

**Interfaces:**
- Consumes: `summarizeCaptured`, `signatureAt(...).params/index` (Task 2); `captured` prop (Task 3).

- [ ] **Step 1: Write failing E2E tests** (both fixtures). Seed the fixture store with API entries: statuses 200, 200, 404 and paths `/api/users`, `/api/users`, `/api/missing` (add them to the fixture's `entries` for these tests only).
  - `$status( offers captured codes` — type `$status(` → list opens immediately with options `200` (`×2`) then `404` (`×1 · error`); Enter → `$status(200`.
  - `$endpoint( offers captured paths` — type `$endpoint('` → first option `/api/users`; Enter → `$endpoint('/api/users'`.
  - `pick offers keys of its first argument` — type `pick(res, ['` → options are the keys of `BODY` (`users`, `meta`).
  - `hint highlights the active argument` — type `diff(a, ` → `.xray-editor-hint .xray-editor-hint-param` text is `b`, and the note is `diff`'s second param description; type `diff(` → highlighted `a`.
  - `no entries, no value list` — with an empty store, `$status(` shows no listbox.

- [ ] **Step 2: Run to verify they fail**

  Run: `node --test test/e2e/console-editor.e2e.mjs`
  Expected: the five new tests FAIL.

- [ ] **Step 3: Implement**: in `ConsolePrompt`, `const entries = usePanelStore((s) => s.entries)` and `const captured = useMemo(() => summarizeCaptured(entries), [entries])`, pass `captured`; in `ConsoleEditor`, render the signature as text segments with the active param (`params[index]`, when `index < params.length`) wrapped in `<strong className="xray-editor-hint-param">`, note = that param's description or the helper's; `.xray-editor-hint-param` uses the accent text token already used by the hint, `font-weight: 700`.

- [ ] **Step 4: Run to verify they pass**

  Run: `node --test test/e2e/console-editor.e2e.mjs`
  Expected: all PASS.

- [ ] **Step 5: Gate the task**

  Run: `npm run typecheck && npm run lint && npm test && npm run build && node scripts/check-dist-sync.mjs`
  Expected: all pass, dist synced.

---

### Task 5: Integration verification

**Files:**
- Modify (only if a check fails): files from Tasks 1–4; `docs/ui-audit.md` — add one line under the Console section noting autocomplete batch 1–4 (spec path).

- [ ] **Step 1: Full gate**

  Run: `npm run check && npm run test:e2e && npm run test:coverage`
  Expected: 0 errors, lint warnings ≤ 53, all unit and E2E pass, coverage lines ≥ 98.5 % and branches ≥ 89 %.

- [ ] **Step 2: Real extension check** — load the unpacked extension with Playwright (`launchPersistentContext` with `--load-extension`), capture a page that fetches `/api/users` (200) and `/api/missing` (404), open the panel (Ctrl+Shift+X), select the users request, and verify through CDP (closed shadow; `DOM.getDocument({pierce:true})`): `res.items.` lists keys with coverage; Ctrl+Space opens grouped helpers; `$status(` lists `200`/`404`. Save screenshots to `output/autocomplete/`. Delete any temp script.

- [ ] **Step 3: Diff hygiene**

  Run: `git diff --check && node scripts/check-dist-sync.mjs`
  Expected: no whitespace errors; dist synced.
