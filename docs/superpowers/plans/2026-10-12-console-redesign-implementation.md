# Console Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Console tab as session cells with an inspector for big results, a helpful multi-line prompt, and a filterable single timeline.

**Architecture:** Pure logic lives in two new model files (`consoleResults.ts` for result description, `consoleAssist.ts` for paths/suggestions/starters/hints/tokens). `ConsoleWorkspace.tsx` (838 lines) is first split into focused components with no behaviour change, then each spec section lands on its component. Evaluation transport (panel → `panel/console.js` → background `xray:console-eval` → `chrome.debugger`) is unchanged except that pinned requests resolve to parsed bodies.

**Tech Stack:** React 19 + Zustand (`src/panel`), plain JS console engine (`panel/console.js`, `shared/console-helpers.js`), background service worker (`background.js`), Vite build to `dist/`, Node test runner (`test/unit/*.test.mjs` import `.ts` via `test/unit/harness.mjs`), Playwright E2E (`test/e2e/*.e2e.mjs`, esbuild in-process; see `test/e2e/console-context-layout.e2e.mjs` for the Console fixture pattern).

**Spec:** `docs/superpowers/specs/2026-10-12-console-redesign-design.md` (items C1–C7, P1–P11, S1–S6). Read the items your task names.

## Global Constraints

- Nothing evaluates in the page except Run/Enter/Re-run/Run selection. Previews, suggestions, starters, hints and chips never call `executeConsoleCommand`.
- Big-result threshold: > 50 top-level items/keys OR serialized size > 20 kb (20 × 1024 bytes).
- Table eligibility: array whose first 20 items are mostly (≥ 80%) plain objects; columns = union of their keys, max 12; max 100 rows rendered with "+N more".
- Scalar inline: number, boolean, null, undefined, string ≤ 120 chars.
- Saved variables: `temp1`, `temp2`, … (Chrome style); `$_` = last successful result. `$r` keeps its current meaning.
- Pins: single letters `a`…`f` (max 6), panel-session only (never persisted), resolve to the pinned request's parsed response body.
- Inspector docked when the Console is ≥ 900 px wide; full-height overlay with Back below.
- Editor: auto-grow to 8 lines; Enter runs; Shift+Enter newline; ↑/↓ history only on first/last line; expanded editor Ctrl/⌘+↑ toggle, Ctrl/⌘+Enter run all.
- Cancel appears after 2 s of Running; a late result after Cancel is discarded and the cell shows "Cancelled".
- Keep accessible names: `Console command`, `Console request context`, `Inspect in API`, `Run`, `Snippets`, `Filter console messages`.
- No new dependencies; theme tokens only; every theme, light/dark; `prefers-reduced-motion`; document, closed-shadow HUD and window surfaces; 420 / 760 / 1600 px.
- Menus use `src/panel/components/common/menuBehavior.ts`; overlays follow `ModalShell` focus/Escape rules (`hasOpenDialog`).
- Never commit, stash, reset or checkout (the user's tree is uncommitted). Lint must stay at 0 errors and ≤ 54 warnings.

## Review Focus

- A huge or deeply nested result (5,000-item array, cyclic placeholder strings `[Circular]`, `[Max depth]`) must render a summary + inspector without freezing the panel — Task 1 adds a 5,000-item summary test; Task 5 adds an inspector render-time assertion (< 500 ms to first paint with virtualized/limited tree).
- Results with odd keys (`""`, keys with dots/spaces, numeric keys) must produce correct inspector paths (`res["a b"]`, `res[0]`) — Task 2 path-format tests.
- Typing in the editor with IME/selection/undo must behave natively despite the colouring overlay — Task 6 asserts the textarea remains the focused, labelled element and that the overlay is `aria-hidden` and pointer-transparent.
- A stale pin (request evicted) or a deselected request must never be silently substituted — Task 7 asserts the pin chip is removed with a notice and `res` shows "No request selected".
- Live streaming (hundreds of page logs/s) must not move the reader's scroll or steal editor focus — Task 9 asserts scroll position and `activeElement` are unchanged after 300 appended logs while scrolled up.

---

### Task 1: Result description model

**Files:**
- Create: `src/panel/models/consoleResults.ts`
- Test: `test/unit/consoleResults.test.mjs`

**Interfaces:**
- Produces:
  - `type ResultKind = 'scalar' | 'text' | 'table' | 'tree'` (`text` = string longer than 120 chars, rendered as a wrapped, copyable text block)
  - `interface ResultDescription { kind: ResultKind; badge: string; big: boolean; bytes: number; count: number | null; summary: string; columns: string[] }`
  - `describeResult(value: unknown, type: string): ResultDescription` (`type` = the evaluation result's `type` field: `number|string|boolean|null|undefined|array|object`)
  - `tableColumns(rows: unknown[]): string[] | null` (null when not table-eligible)
  - `formatBytes(n: number): string` reuse `src/panel/utils.ts` `formatBytes` if equivalent; do not duplicate.

- [ ] **Step 1: Write failing tests** in `test/unit/consoleResults.test.mjs`: `describeResult(42,'number')` → `{kind:'scalar', badge:'number', big:false}`; a 24-char string → `kind:'scalar'`, `badge === 'string · 24 chars'`; a 121-char string → `kind:'text'`, `badge === 'string · 121 chars'`; `[{id:1,name:'a'},{id:2,name:'b'}]` → `kind:'table'`, `columns:['id','name']`, `badge:'array · 2 items'`; `[1,'a',{x:1}]` → `kind:'tree'`; a 51-key object → `big:true`, badge starts `object · 51 keys`; a 5,000-item array → `big:true`, `summary` starts `Array(5000)`, computed in < 50 ms; a ~25 kb object → `big:true`, badge ends `· 25 kb`; a 20-key object of 15 columns → `columns.length === 12`; `null`/`undefined` → scalar badges `null` / `undefined`.
- [ ] **Step 2:** Run `node --test test/unit/consoleResults.test.mjs` → FAIL (module missing).
- [ ] **Step 3:** Implement `consoleResults.ts` per the Interfaces and Global Constraints (size = `JSON.stringify` length in bytes, computed once; summary like `{ users: Array(500), meta: {…}, … }` limited to 80 chars).
- [ ] **Step 4:** Run the test → PASS; `npm run typecheck`.

### Task 2: Assist model — paths, suggestions, hints, starters, tokens

**Files:**
- Create: `src/panel/models/consoleAssist.ts`
- Test: `test/unit/consoleAssist.test.mjs`

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces:
  - `parsePlainPath(code: string): { root: string; segments: Array<string | number> } | null` — roots: `res`, `req`, `a`–`f`, `temp\d+`, `$_`; segments `.name`, `[n]`, `["key"]`/`['key']`; anything else → null.
  - `resolvePath(path, roots: Record<string, unknown>): { found: boolean; value: unknown }`
  - `formatPath(root: string, segments: Array<string|number>): string` — `res.users[0].name`, `res["a b"]`, `res[""]`.
  - `interface Suggestion { label: string; insert: string; detail: string; kind: 'helper' | 'variable' | 'property' }`
  - `suggest(draft: string, caret: number, ctx: { roots: Record<string, unknown>; variables: string[] }): { from: number; items: Suggestion[] }` — max 8, fuzzy-prefix, arrays resolve via first item, helper list from `HELPERS`.
  - `HELPERS: Array<{ name: string; signature: string; description: string }>` — static table for: `res, req, entry, schema, diff, pick, omit, flatten, toTable, toCSV, copy, $prev, $next, $all, $errors, $slow, $status, $endpoint, $help, $curl, $fetch, $mock` (descriptions ≤ 80 chars, sentence case).
  - `signatureAt(draft: string, caret: number): { name: string; signature: string; description: string } | null`
  - `errorHint(message: string, command: string, hasRequest: boolean): string | null` — the four hints in spec C5, exact copy.
  - `starters(res: unknown, hasPrevious: boolean): Array<{ label: string; insert: string; caretOffset?: number }>` — spec P8, max 5, first array-of-objects property found depth ≤ 2 (`users`), item noun = singular of key (`users`→`user`, else `item`).
  - `type TokenKind = 'keyword' | 'string' | 'number' | 'comment' | 'punct' | 'plain'`; `tokenize(code: string): Array<{ kind: TokenKind; text: string }>` — concatenated texts must equal the input exactly.

- [ ] **Step 1: Write failing tests**: `parsePlainPath('res.users[0]["a b"]')` → segments `['users',0,'a b']`; `parsePlainPath('res.users.map(x=>x)')` → null; `parsePlainPath('foo.bar')` → null; `formatPath('res',['a b',0,''])` → `res["a b"][0][""]`; `resolvePath` miss → `found:false`; `suggest('res.users[0].em', 15, {roots:{res:{users:[{email:'x',emailOk:true}]}},variables:[]})` → items labels `['email','emailOk']` with details `string`,`boolean`; `suggest('sch',3,…)` includes `schema`; `suggest('tem',3,{…variables:['temp1']})` includes `temp1`; `signatureAt('diff(a, ', 8)?.name === 'diff'`; `errorHint("Cannot read properties of undefined (reading 'length')", 'res.data.length', true)` → `"res is the response body itself. Try Object.keys(res)."`; `errorHint('schem is not defined','schem(res)',true)` → "Did you mean `schema`?"; `errorHint(any,'res.x',false)` → "No request selected. Pick one above."; SyntaxError message → "Check brackets and quotes. Shift+Enter adds a new line."; `starters({users:[{id:1}]}, true)` labels `['Table of users','Count users','Find user by id','Diff with previous call','Schema']` with inserts `table(res.users)`, `res.users.length`, `res.users.find(u => u.id === )`, `diff(prev, res)`, `schema(res)`; `starters({a:1}, false)` → `['Schema']`; `tokenize('const s = "a;b" // c').map(t=>t.text).join('') === input` and contains kinds keyword/string/comment.
- [ ] **Step 2:** Run `node --test test/unit/consoleAssist.test.mjs` → FAIL.
- [ ] **Step 3:** Implement `consoleAssist.ts`.
- [ ] **Step 4:** Run → PASS; typecheck.

### Task 3: Split ConsoleWorkspace into components (no behaviour change)

**Files:**
- Modify: `src/panel/components/console/ConsoleWorkspace.tsx` (becomes the shell: header, filter bar, stream, prompt)
- Create: `src/panel/components/console/ConsoleStream.tsx` (`ConsoleStream`, `ConsoleRow`, `ErrorBlock`, `extractConsoleError`), `ConsolePrompt.tsx` (`ConsolePrompt`, context line), `SnippetsMenu.tsx`, `ConsoleStatusbar.tsx`, `LevelChips.tsx`, `ExampleCommands.tsx`
- Modify: tests that grep source for these names (`test/console-runtime.test.js`, `test/accessibility.test.js`, `test/responsive-motion-css.test.js`, `test/theming-tokens.test.js`) — re-point reads to the new files; assertions keep their meaning.

**Interfaces:**
- Produces: the same exported `ConsoleWorkspace`; each new file exports the moved component unchanged.

- [ ] **Step 1:** Run baseline: `node --test test/e2e/console-*.e2e.mjs test/e2e/ui-row-actions.e2e.mjs` and record pass counts.
- [ ] **Step 2:** Move components verbatim into the files above; no logic changes.
- [ ] **Step 3:** Re-point source-grep tests to new paths; run `npm test` → all pass.
- [ ] **Step 4:** Re-run the Step 1 E2E files → same pass counts; `npx eslint .` 0 errors.

### Task 4: Command cells and result view (C1–C5, P11)

**Files:**
- Create: `src/panel/components/console/CommandCell.tsx`, `src/panel/components/console/ResultView.tsx`
- Modify: `ConsoleStream.tsx` (group command+result by `commandId` into one `CommandCell`; page logs keep `ConsoleRow`), `ConsolePrompt.tsx` (measure duration, Running/Cancel), `src/panel/store.ts` (`addConsoleEvent` stops auto-expanding results/errors; add `removeConsoleCommand(commandId: string): void`), `src/panel/types.ts` (`ConsoleEvent.durationMs?: number`, `ConsoleEvent.variable?: string`, `ConsoleEvent.cancelled?: boolean`), `src/panel/runtime/consoleBridge.ts` (`saveConsoleVariable(value: unknown): string` → next `tempN` via `window.XRAY_Console.setVar`, also sets `$_` after every successful result), `src/panel/styles.css`
- Test: `test/e2e/console-cells.e2e.mjs` (new; copy the fixture pattern from `console-context-layout.e2e.mjs`)

**Interfaces:**
- Consumes: `describeResult`, `tableColumns` (Task 1); `errorHint` (Task 2).
- Produces: `CommandCell({ command, result?, running })`; `ResultView({ value, type, onOpenInspector })` — Task 5 supplies `onOpenInspector`.

- [ ] **Step 1: Write failing E2E** (document + closed shadow, 420/1600): after a stubbed `XRAY_Console.execute` returning `{type:'number',result:42}`, exactly one `.xray-command-cell` exists, it contains the command and `42`, and the text `42` occurs once in the stream; an array-of-objects result renders `role="table"` with headers `id`,`name`; Tree/JSON segmented buttons switch view (`aria-pressed`); Copy writes JSON to the stubbed clipboard; "Save as variable" calls `setVar('temp1', value)` and the cell shows `temp1`; an error `{type:'error',error:{message:"Cannot read properties of undefined (reading 'length')"}}` for `res.data.length` shows the C5 hint and no "No stack trace available"; Re-run calls execute again with the same code; Edit in prompt puts the code into `Console command`; Delete cell removes it; a 3 s-pending execute shows "Running…", then a `Cancel` button at ≥ 2 s; clicking Cancel then resolving shows "Cancelled" and no result.
- [ ] **Step 2:** Run `node --test test/e2e/console-cells.e2e.mjs` → FAIL.
- [ ] **Step 3:** Implement components/store/bridge changes listed in Files.
- [ ] **Step 4:** Run new + existing console E2E (`console-*.e2e.mjs`, `ui-row-actions.e2e.mjs`) → PASS; update any assertion that pinned the old duplicate render, with reason.

### Task 5: Inspector for big results (C6–C7)

**Files:**
- Create: `src/panel/components/console/ResultInspector.tsx`
- Modify: `ConsoleWorkspace.tsx` (inspector state: `inspected: { cellId, value, label } | null`; docked layout ≥ 900 px via container query, overlay below), `ResultView.tsx` (big → summary + "Open in inspector"), `ConsoleStream.tsx` (page-log objects that are big also offer it), `styles.css`
- Test: `test/e2e/console-inspector.e2e.mjs`

**Interfaces:**
- Consumes: `describeResult` (Task 1), `formatPath` (Task 2), `JsonView` (existing `src/panel/components/detail/JsonView.tsx` — extend with an optional `onSelectPath(segments)` prop rather than writing a second tree).
- Produces: `ResultInspector({ value, label, rootExpression, onClose, onUsePath(path: string) })`.

- [ ] **Step 1: Write failing E2E**: a 500-item result shows `object`/`array` badge with `big` summary and `Open in inspector`, not an inline tree; opening at 1600 docks (inspector box right of stream, both visible); at 420 it covers the Console with a Back control; first paint < 500 ms for a 5,000-item array; filter `name` narrows visible nodes; selecting a node shows `res.users[0].name` (and `res["a b"]` for odd keys) with Copy path and Use in prompt (inserts into `Console command`); Escape closes and focus returns to the cell's `Open in inspector` button.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** Run new + Task 4 E2E → PASS.

### Task 6: Prompt editor (P3–P7, P9, P11 keyboard)

**Files:**
- Create: `src/panel/components/console/ConsoleEditor.tsx` (textarea + `aria-hidden` colouring overlay + suggestion listbox + signature line + live preview line + helper chips)
- Modify: `ConsolePrompt.tsx` (use `ConsoleEditor`), `styles.css`
- Test: `test/e2e/console-editor.e2e.mjs`

**Interfaces:**
- Consumes: `tokenize`, `suggest`, `signatureAt`, `parsePlainPath`, `resolvePath`, `HELPERS` (Task 2); roots = `{ res: parsedSelectedBody, req: parsedSelectedRequest, ...pins (Task 7 provides; until then empty), temp variables/`$_` (Task 4 bridge) }`.
- Produces: `ConsoleEditor({ value, onChange, onRun, onExpandToggle, roots, variables })`.

- [ ] **Step 1: Write failing E2E**: the focused element while typing is the `textarea` labelled `Console command`; the overlay is `aria-hidden="true"` with `pointer-events: none`; Shift+Enter inserts a newline and Enter runs; editor grows to 8 lines then scrolls; ↑ on line 1 recalls history but ↑ on line 2 moves the caret; typing `res.users[0].em` shows a listbox with `email` (`aria-activedescendant` set on the textarea), Tab accepts, Escape dismisses, Enter with the list open accepts (does not run); inside `diff(` the signature line shows `diff(left, right)`; draft `res.users[0].email` shows `→ "ada@x.io"` preview and `execute` call count stays 0; draft `res.users.map(u=>u)` shows no preview; helper chips insert at the caret; colours come from tokens in every theme (theme-visual check for one dark and one light theme).
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** Run new + console E2E → PASS.

### Task 7: Request context line, picker and pins (P1–P2)

**Files:**
- Create: `src/panel/components/console/RequestContextLine.tsx` (context summary, searchable picker using `menuBehavior`, pin chips, Pin request)
- Modify: `ConsolePrompt.tsx`, `src/panel/store.ts` (session-only `consolePins: Array<{ name: string; entryId: string }>` + `pinConsoleRequest(entryId): string | null` (returns letter or null at max 6), `unpinConsoleRequest(name)`; never added to persisted preferences; drop pins whose entry is evicted and show a toast "Pin a removed: request no longer captured"), `src/panel/components/detail/RequestDetail.tsx` (More actions item "Pin in Console"), `panel/console.js` (`_contextPayload` sends `pins` as `{ name: fullEntry }` only for pinned ids), `shared/console-helpers.js` (`createRuntime` exposes each pin as its parsed response body via the same `parseBody` used for `res`), `background.js` (stop `Object.assign`-ing raw pins over the runtime — pins come from `createRuntime`)
- Test: `test/e2e/console-context.e2e.mjs`, `test/unit/runtime/console-helpers-pure.test.mjs` (pin → body), `test/background-service-worker.test.js` (expression builder: `a.users.length` with a pinned entry returns the count)

**Interfaces:**
- Consumes: `menuBehavior` helpers; Task 6 `roots` (add pins).
- Produces: store `consolePins`, `pinConsoleRequest`, `unpinConsoleRequest`.

- [ ] **Step 1: Write failing tests**: context line text `res = GET /api/users · 200 · 14 kb` for the selected entry; with none: "No request selected · plain JavaScript only" and a Pick request control; picker filters by typing and selects with Enter (accessible name `Console request context` kept; `Inspect in API` kept); Pin request adds chip `a`, then `b`; the 7th pin is refused with a notice; pins are absent from serialized preferences; evicting a pinned entry removes its chip with the notice; builder test: pinned entry → `a.users.length` evaluates to 2; helpers test: `createRuntime({pins:{a:entry}}).a` deep-equals parsed body.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** Run new + Task 6 E2E + background/unit tests → PASS.

### Task 8: Smart starters and expanded editor (P8, P10)

**Files:**
- Create: `src/panel/components/console/StarterChips.tsx`
- Modify: `ConsoleEditor.tsx` (expanded mode: line numbers, auto-close `()[]{}""''\`\``, Format = re-indent with 2 spaces by bracket depth, Run all, Run selection, Save as snippet), `ConsolePrompt.tsx`, `ExampleCommands.tsx` (empty state uses starters when a request is selected, else the existing examples), `styles.css`
- Test: `test/e2e/console-editor.e2e.mjs` (extend)

**Interfaces:**
- Consumes: `starters` (Task 2), Task 6 `ConsoleEditor`.

- [ ] **Step 1: Write failing tests**: with `res = {users:[{id:1}]}` and a previous same-endpoint call, starter chips read `Table of users`, `Count users`, `Find user by id`, `Diff with previous call`, `Schema`; clicking "Find user by id" inserts `res.users.find(u => u.id === )` with the caret before `)` and `execute` count 0; Ctrl+↑ toggles expanded (line numbers visible, editor height ≥ 50% of Console at 1600, full height at 420); typing `(` inserts `()`; Format re-indents a 3-line snippet; Ctrl+Enter runs all; selecting line 2 and "Run selection" executes only that text; Save as snippet adds to Snippets; collapsing keeps the draft.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** Run → PASS.

### Task 9: Stream, filters, repeats, jump-to-latest, clear options (S1–S6)

**Files:**
- Modify: `ConsoleStream.tsx`, `LevelChips.tsx` (chips All / My commands / Page logs / Warnings / Errors with counts; Errors counts failed commands), `src/panel/models/logLevels.ts` (add `'mine'` and `'page'` buckets without changing Logs-tab behaviour), `ConsoleWorkspace.tsx` (Clear ▾ via `DisclosureMenu`: Clear everything / Clear my commands / Clear page logs, each through `requestConfirmation`), `src/panel/store.ts` (`clearConsole(scope?: 'all' | 'commands' | 'page')`, default `'all'`), `styles.css`
- Test: `test/e2e/console-stream.e2e.mjs`

**Interfaces:**
- Consumes: Task 4 cells, Task 5 inspector for big page-log objects.

- [ ] **Step 1: Write failing E2E**: chip counts match fixture (2 commands, 6 page logs, 1 warning, 2 errors incl. 1 failed command); My commands shows only cells; text filter matches command source text; 14 identical consecutive logs render one line with `×14`; page log line shows `main.js:30` source when present; a big logged object offers Open in inspector; scrolled up + 300 appended logs → scrollTop unchanged, `activeElement` unchanged, pill "300 new messages" → clicking it scrolls to bottom; running a command while scrolled up scrolls to its cell; Clear ▾ → "Clear my commands" removes cells only.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** Run new + all console E2E → PASS.

### Task 10: Integration verification

**Files:** fixes only for regressions found here.

- [ ] **Step 1:** `npm run check` → typecheck clean, 0 lint errors (≤ 54 warnings), all unit tests pass, build OK.
- [ ] **Step 2:** `npm run test:e2e` → all pass. `npm run test:coverage` → thresholds met. `node scripts/check-dist-sync.mjs` and `git diff --check` clean.
- [ ] **Step 3:** Real extension in Chromium (load unpacked; repro pattern in `test/e2e/console-permission.e2e.mjs`): run `1+1`, a 3-line snippet, `res` on a 500-item response (inspector), and `diff(a, res)` with a pin; screenshot each to `output/console-redesign/after/`.
- [ ] **Step 4:** `node scripts/ui-shots.mjs --out output/console-redesign/after --tabs console --widths 1600,760,420`; compare to `output/ui-refresh/after/*-console.png`.
