# Console Output and Autocomplete (round 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The Console prints web objects, promises, functions and DOM nodes readably, remembers declarations, completes the language and the live page, and previews the result before Enter — without new permissions or page globals.

**Architecture:** Panel-side work first (encoder projections in `shared/console-helpers.js`, a one-line formatter and renderer in the panel, Enter/ranking fixes and a static catalogue in the completion engine). Then a per-tab CDP-held scope object in `background.js` that all runs go through (`Runtime.callFunctionOn` with a strict function that binds scope names as locals — no `with`, no sloppy frame; see Task 6 ruling), which the live completion and eager preview reuse with `throwOnSideEffect: true`.

**Tech Stack:** MV3 service worker (`background.js`, classic, `importScripts`), vanilla `panel/console.js` bridge, React 19 + Zustand panel (`src/panel`), Node test runner (`test/*.test.js` source pins, `test/unit/*.test.mjs` behaviour via `test/unit/harness.mjs`), Playwright E2E (`test/e2e`, document + closed shadow; real page through the debugger as in `output/console-audit/probe.mjs.txt`).

**Spec:** `docs/superpowers/specs/2026-10-18-console-output-autocomplete-design.md`. Evidence: `docs/superpowers/specs/assets/2026-10-18-console-audit.md` (G1–G19, bugs 1–6). Spike: `output/console-spike/spike.mjs.txt`.

## Global Constraints

- The debugger session is the one execution path; previews and live completion use `throwOnSideEffect: true` and never write to `window` or any page global (threat model C-1, C-8).
- Never steal Enter: a syntactically complete command runs on Enter even when the list is open.
- Preview `timeout: 300` ms, live completion `timeout: 250` ms, debounce 150 ms (preview) / 120 ms (completion); live member cap 500; function source cap 4,000 chars; DOM children cap 50, depth 3, text 200 chars; recency memory 200 accepts.
- Attach for preview/completion only after ≥ 2 non-space chars typed in the Console prompt and a 150 ms pause; setting "Preview results while typing" (default on) disables preview, live completion and that attach.
- Idle detach 30 s; 5 min while the Console prompt is focused; scope reset note copy: "Declared variables were reset (page reloaded or debugger detached)".
- No new dependencies; theme tokens only; document, closed-shadow HUD, pop-out and DevTools surfaces behave the same; `prefers-reduced-motion`.
- Never commit, stash, reset or checkout (controller snapshots). `npx eslint .` 0 errors ≤ 53 warnings. After `src/` changes: `npm run build` + `node scripts/check-dist-sync.mjs`. Pinned source tests (`test/*.test.js`): update the assertion to describe new wiring, never delete. Scratch under `output/` with `.txt` suffix when done. Avoid `--test-name-pattern` regexes containing `.*` (they hung the runner).

## Review Focus

- **Page with a hostile/odd global** (`Object.prototype` getters that throw, a `Proxy` as `window.appState`, a getter with side effects): live completion and preview show nothing or partial names, never run the getter's side effect, never throw into the panel. → Task 7 + Task 8 tests `hostile page globals`.
- **Navigation / reload mid-session**: the next command runs, declared names are gone with the reset note, completion cache is refreshed (no stale `appState.` members). → Task 6 `scope reset on reload`, Task 7 `cache refresh on navigation`.
- **Service worker restart** (idle ~30 s+ while the debugger stays attached): the stored scope objectId is reused or a fresh scope is created with the reset note — never a hard error. → Task 6 `scope after worker restart` (simulate by clearing in-memory maps).
- **Typing fast on a slow page** (preview/completion responses arrive out of order): a stale response never replaces a newer draft's preview or list. → Task 7/8 `out-of-order responses`.
- **Captured-data commands still behave as before** (`res`, `pick(res, …)`, pins `a`–`f`, `temp1`, `$_`, multi-line drafts, Run selection) through the new scope path. → Task 6 runs the existing console E2E files unchanged.

---

### Task 1: Encoder projections and one-line formatter (G1, G6 nested, G7, G8 data, bug 4)

**Files:** Modify `shared/console-helpers.js` (`encodeResult` value walker: per-class projections), `src/panel/models/consoleResults.ts` (describe new tags), create `src/panel/models/consolePreview.ts`. Tests: `test/console-helpers.behavior.test.js` (VM), `test/unit/consolePreview.test.mjs`, `test/unit/consoleResults.test.mjs`.

**Interfaces:**
- Produces: encoded tags `{ __xray: 'web', cls: 'Response'|'Request'|'Headers'|'URLSearchParams'|'FormData'|'URL'|'Blob'|'File'|'RegExp'|'PerformanceResourceTiming'|'AbortSignal'|'AbortController', fields: Record<string, encoded>, entries?: [encoded, encoded][] }`, `{ __xray: 'promise', state: 'fulfilled'|'rejected'|'pending', value?: encoded }`, `{ __xray: 'function', name, params: string, async: boolean, kind: 'function'|'class'|'arrow'|'native', source?: string, wrappedByXray?: boolean }`, `{ __xray: 'dom', tag, id, classes: string[], attrs: [string,string][], text: string, children: encodedDom[], more: number }`, and for unknown class instances `{ __xray: 'instance', cls, fields }` (side-effect-free data getters on the prototype, skipped on throw). Exact field lists per class: spec §1.
- Produces: `previewLine(value: unknown, opts?: { max?: number }): string` in `consolePreview.ts` — DevTools-style one line used by collapsed previews (Task 2) and eager preview (Task 8): `Array(500) [0, 1, 2, …]`, `{id: 1, name: 'Ada', …}`, `Response {status: 200, ok: true, …}`, `Headers(2) {'a' => '1', …}`, `Promise {<fulfilled>: 5}`, `ƒ formatPrice(cents, currency = 'EUR')`, `<div#app.main>`, `/ab+c/gi`; default `max` 120 chars.

- [ ] Step 1: Failing VM tests in `console-helpers.behavior.test.js`: `encodes Response projection` (a Response built in the VM realm or a stub with `status/ok/url/headers` getters on its prototype → `cls: 'Response'`, `fields.status === 200`, body never read: `bodyUsed` stays false), Headers/URLSearchParams/FormData entries in order, URL fields, RegExp `/ab+c/gi`, nested `{p: Promise.resolve(5)}` → `state: 'fulfilled', value 5` after the encoder's microtask flush, pending promise → `pending`, function params `(cents, currency = 'EUR')`, arrow/async/class/native kinds, a function named `_xrayFetch` → `wrappedByXray: true, name: 'fetch'`, source capped at 4,000 chars, DOM snapshot caps (51 children → 50 + `more: 1`, depth 3, text 200), an object with a throwing prototype getter → `instance` without that field and no throw.
- [ ] Step 2: Failing unit tests `consolePreview.test.mjs` for every example string above (exact text) and truncation at `max` with `…`.
- [ ] Step 3: Implement (encoder becomes async only where the promise flush needs it: `encodeResult` returns a Promise when a nested promise is present; callers already await).
- [ ] Step 4: GREEN; gate: `npm run typecheck && npx eslint . && npm test && npm run build && node scripts/check-dist-sync.mjs`.

### Task 2: Result rendering (G15, G16, G8/G7 expand, top-level promise header, error location, bug 2)

**Files:** Modify `src/panel/components/console/ResultView.tsx`, `src/panel/components/detail/JsonView.tsx` (console mode: unquoted identifier keys, Set without indices, buckets), `src/panel/models/consoleResults.ts`, `src/panel/components/console/consoleErrors.tsx`, `background.js` (`_evaluateConsoleInTab`: promise header metadata, pending-at-cap result, error labelling). Tests: `test/unit/consoleResults.test.mjs`, `test/background-service-worker.test.js`, E2E `test/e2e/console-output.e2e.mjs` (create).

**Interfaces:**
- Consumes: Task 1 tags and `previewLine`.
- Produces: result envelope field `meta?: { promise?: { state: 'fulfilled'|'rejected'|'pending'; ms: number } }` from background; error envelope `error.kind: 'attach'|'detached'|'tab-closed'|'timeout'|'evaluation'`.

- [ ] Step 1: Failing tests: objects/arrays with > 5 keys/items render collapsed to their `previewLine` with an expand arrow (≤ 5 stay expanded); Tree keys `id` unquoted, `"content-type"` quoted; `new Set([1])` shows `1` without `0 :`; `Array(500)` expands to buckets `[0 … 99]`…`[400 … 499]`; DOM node and function rows expand (attributes/children; source); top-level `Promise.resolve(5)` cell header shows `Promise · fulfilled in N ms` and value 5; `new Promise(() => {})` returns `Promise {<pending>}` with note "Still pending after 10 s" (no "Execution timeout" error); top-level `throw new Error('x')` shows `Uncaught Error: x` and `at <anonymous>:1:7` (line/col mapped to the command); background: a rejected `Runtime.evaluate` with a non-attach CDP error yields `kind: 'evaluation'` and keeps the cached session; only attach failures/`Detached` drop it.
- [ ] Step 2: RED. Step 3: implement. Step 4: GREEN; gate + `npm run test:e2e` for the console E2E files.

### Task 3: Enter capture, ranking, helper insert, `$` trigger (issue #5, bugs 1/3/5, G12, G18)

**Files:** Modify `src/panel/models/consoleAssist.ts` (`fuzzyScore` → tiered `rankMatch`, `endsComplete`, identifier candidates insert), `src/panel/components/console/ConsoleEditor.tsx` (Enter rule, `$` gate, recency), create `src/panel/models/consoleRecency.ts`. Tests: `test/unit/consoleAssist.test.mjs`, `test/unit/consoleRecency.test.mjs`, E2E in `test/e2e/console-output.e2e.mjs` or the existing autocomplete E2E file.

**Interfaces:**
- Produces: `rankMatch(query: string, label: string): { tier: 0|1|2|3|4|5; indices: number[] } | null` (5 exact, 4 prefix, 3 word-boundary/camelCase, 2 substring, 1 subsequence only when `query.length >= 3`); `isCompleteCommand(draft: string): boolean`; `shouldEnterAccept(state: { listOpen: boolean; navigated: boolean; draft: string; caret: number }): boolean`; `createRecency(storage: { get(): string[]; set(v: string[]): void }, limit = 200): { record(label: string): void; score(label: string): number }` (persisted via the existing extension storage bridge, key `console_completion_recency`).

- [ ] Step 1: Failing tests: `$status(res ` → list closed; `$status(res ` + Enter runs; `$status(true ` + Enter runs; `res.us` + Enter with list open accepts `users`; complete `res.users` + Enter with list open (not navigated) runs; `Ma` → `map`/`Math` tiers above `schema` and subsequence `schema` absent; `res.users.ma` → `map`, `manager` and no `email`; `qSA` ranks `querySelectorAll` first once catalogue exists (keep as a pending assertion enabled in Task 4); accepting `$endpoint` by Enter/Tab/click inserts `$endpoint(` with caret inside; `$` alone opens the `$`-helper list; recently accepted `pick` ranks above `pin` for `pi`; set `.issues/005` to doing at start and done at the end with a note.
- [ ] Step 2: RED. Step 3: implement. Step 4: GREEN; gate.

### Task 4: Static catalogue, keywords, signatures, lambda inference from captured data (G2, G10, G11 local, G13, G19)

**Files:** Create `src/panel/models/consoleCatalog.ts`; modify `src/panel/models/consoleAssist.ts` (`suggest` member/identifier branches, `signatureAt`). Tests: `test/unit/consoleCatalog.test.mjs`, `test/unit/consoleAssist.test.mjs`.

**Interfaces:**
- Produces: `type CatalogEntry = { name: string; kind: 'function'|'method'|'property'|'class'|'keyword'|'namespace'|'variable'; signature?: string; doc: string; returns?: string }`; `CATALOG_GLOBALS: CatalogEntry[]`; `catalogMembers(owner: string): CatalogEntry[]` for owners `Object JSON Math Array Promise Number String Date URL URLSearchParams Headers Response Request console document window location navigator localStorage sessionStorage Map Set RegExp Element` and prototype owners `Array.prototype String.prototype Number.prototype Object.prototype Promise.prototype Map.prototype Set.prototype Date.prototype RegExp.prototype Response.prototype Headers.prototype URL.prototype Element.prototype Document.prototype`; `KEYWORDS: CatalogEntry[]`; `Suggestion` gains `kind` values `'function'|'class'|'keyword'|'namespace'` and optional `signature?: string; doc?: string; source?: 'captured'|'declared'|'live'|'catalog'`.
- Produces: `inferLambdaParam(draft: string, caret: number, roots: Record<string, unknown>): { param: string; sample: unknown } | null` for `map filter find findLast some every forEach flatMap` (`x =>`, `(x) =>`, `(x, i) =>`) and `reduce((acc, x) =>` (second param).

- [ ] Step 1: Failing tests: catalogue integrity (every entry has `doc`, callables have `signature`, no duplicate names per owner); `Object.ke` → `keys` with signature `keys(o)`; `JSON.str` → `stringify(value, replacer?, space?)`; `document.qu` → `querySelector`, `querySelectorAll`; `fetch(` signature hint `fetch(input, init?)` active param 0; `res.users[0].score.` → Number methods (`toFixed`…); `res.users.` includes `reduce sort toSorted flatMap forEach findIndex indexOf concat entries`; `aw` → keyword `await`; `res.users.filter(u => u.` → item keys `id name email active score manager roles address`; `res.users.reduce((acc, u) => u.` → same keys; enable Task 3's `qSA` assertion.
- [ ] Step 2: RED. Step 3: implement (catalogue as data; members of a captured value use its runtime type to pick the prototype owner). Step 4: GREEN; gate.

### Task 5: Popup row, doc line, ghost text (G9, G14)

**Files:** Modify `src/panel/components/console/ConsoleEditor.tsx` (option render, doc line, ghost span in the overlay `<pre>`), `src/panel/styles.css` (kind icon tokens, ghost text `--xray-hint`), create `src/panel/models/consoleGhost.ts`. Tests: `test/unit/consoleGhost.test.mjs`, E2E (document + closed shadow).

**Interfaces:**
- Consumes: `Suggestion.signature/doc/kind` (Task 4), `rankMatch().indices` (Task 3).
- Produces: `ghostFor(state: { draft: string; caret: number; top?: Suggestion; history: string[]; listOpen: boolean }): string` (remaining characters or `''`; empty unless the caret is at the end of the token; history match only when the list is closed and longer than the draft).

- [ ] Step 1: Failing tests: unit rules for `ghostFor`; E2E: rows show a kind icon (Tabler icon per kind, `aria-hidden`), matched characters emphasised (`<mark>`-less span with a class, theme token colour), `(params)` for callables, right-side detail kept; a doc line for the active row below the list (`aria-describedby` on the listbox option); ghost text after `JSON.str` shows `ingify`; → at line end accepts, Tab accepts, any other key continues typing; history ghost `schema(res)` after typing `sch` with the list closed (Escape); ghost hidden with caret mid-token; reduced-motion: no animation; contrast matrix row for ghost text ≥ 4.5:1 on the editor background is NOT required (decorative hint) but ≥ 3:1 — add to `test/unit/themeContrast.test.mjs`.
- [ ] Step 2: RED. Step 3: implement. Step 4: GREEN; gate + touched E2E.

### Task 6: CDP-held scope and persistent declarations (spec §2)

**Files:** Create `shared/console-scope.js` (pure: `declaredNames(code)`, `buildRunFunction(code, names)`), modify `background.js` (scope lifecycle, `_evaluateConsoleInTab` via `callFunctionOn`, idle detach 30 s / 5 min focused, session-storage persistence of `{tabId → objectId, executionContextId}`, reset note), `panel/console.js` + `src/panel/runtime/consoleBridge.ts` (`setPromptFocused(focused: boolean)` → `xray:console-focus`), `ConsoleStream.tsx`/`CommandCell.tsx` (reset note), `docs/threat-model.md` (C-1 note), `docs/architecture.md` (one paragraph). Tests: `test/unit/consoleScope.test.mjs` (requires `shared/console-scope.js` via the VM harness), `test/background-service-worker.test.js`, E2E `test/e2e/console-scope.e2e.mjs` (real page through the debugger).

**Interfaces:**
- Produces: `declaredNames(code: string): string[]` — depth-0 `const|let|var|function|class` bindings incl. object/array destructuring, defaults and rest (`const {a, b: [c, ...d], e = 1} = x` → `a c d e`), ignores nested blocks/functions and strings/comments/templates; `buildRunFunction(code: string, names: string[]): string` — a `functionDeclaration` string for `Runtime.callFunctionOn` that runs the body in a STRICT function binding the needed scope names as locals (superseded by the Task 6 review ruling: no `with`, no sloppy frame), returns the last expression like `_consoleUserBody`, and in `finally` exports each initialised name onto `this` (`const` as non-writable via `Object.defineProperty`; skip TDZ names in try/catch); scope message results unchanged (`encodeResult` text); background `{ scopeReset?: true }` flag on the result envelope.
- Consumes: Task 2 error kinds.

- [ ] Step 1: Failing unit tests for `declaredNames` (table of 15 forms incl. `for (let i…)` → none, `function f(){}` → `f`, `class A {}` → `A`, `let a = 1, b = 2` → `a b`, strings containing `const x`) and `buildRunFunction` executed in a VM against a scope object (`const u = 1` then a second run reads `u`; assigning `u = 2` later throws `TypeError`; `let` redeclare replaces; a throw midway still exports earlier names; helpers and `res` from the scope resolve; page `window` reachable for non-scope names).
- [ ] Step 2: Failing background tests: first run creates the scope via `Runtime.evaluate(returnByValue:false)` and caches its objectId in session storage; context refreshed through `callFunctionOn` with the context text as an argument (never interpolated); `Cannot find context with specified id` → new scope + `scopeReset: true`; in-memory map cleared (worker restart) → objectId read back from session storage and reused; focus message switches idle detach to 300,000 ms and back to 30,000 ms on blur.
- [ ] Step 3: Failing E2E: `const u = res.users` then `u.length` → `3`; `const n = 1` then `n = 2` → `TypeError: Assignment to constant variable.`-equivalent message; page script `typeof u` → `'undefined'`; reload → next command shows the reset note once; every existing console E2E file passes unchanged.
- [ ] Step 4: Implement. Step 5: GREEN; gate + full `npm run test:e2e` once.

### Task 7: Live page completion (spec §3.4, G3, G11 live)

**Files:** Modify `background.js` (`xray:console-complete` handler: `callFunctionOn(scope, …)` enumerating own + prototype-chain names with `throwOnSideEffect: true, timeout: 250`, cap 500), `panel/console.js` + `consoleBridge.ts` (`completeMembers(expr: string | null, requestId: number): Promise<{ requestId: number; names: LiveName[] } | null>`), `ConsoleEditor.tsx` (debounce 120 ms, merge, drop stale), `src/panel/models/consoleAssist.ts` (merge + source priority), settings (`previewWhileTyping: boolean`, default `true`, in `panelSettings.ts` + Settings → General copy "Preview results while typing — evaluates side-effect-free in the page as you type"). Tests: `test/background-service-worker.test.js`, `test/unit/consoleAssist.test.mjs`, E2E `test/e2e/console-live.e2e.mjs`.

**Interfaces:**
- Produces: `type LiveName = { name: string; kind: 'function'|'property'|'getter'|'class'; own: boolean }`; `expr === null` means page globals (cached per scope; invalidated after each Run and on scope reset/navigation).
- Consumes: Task 6 scope; Task 3 ranking; Task 4 `Suggestion.source`.

- [ ] Step 1: Failing tests: `errorHint` did-you-mean also searches declared names and cached live globals (`apState` → `appState`); background uses `throwOnSideEffect: true` and `timeout: 250` and never `Runtime.evaluate` on the raw expression outside the scope; result capped at 500; `__proto__` skipped; a getter-only property is `kind: 'getter'` and not invoked; out-of-order: response for requestId 1 arriving after 2 is dropped; E2E: `appState.` lists `user`; `formatP` → `formatPrice` with signature from source `(cents, currency = 'EUR')`; `const rows = res.users` then `rows.filter(r => r.` → item keys; hostile page (`Object.defineProperty(window, 'trap', { get(){ localStorage.setItem('x','1'); return 1 } })`, a `Proxy` global) → `trap` listed, `localStorage.x` stays null, no panel error; setting off → no completion messages sent and no attach while typing; attach happens only after ≥ 2 chars + 150 ms pause, not on focus alone.
- [ ] Step 2: RED. Step 3: implement. Step 4: GREEN; gate + touched E2E.

### Task 8: Eager preview (spec §4, G4)

**Files:** Modify `docs/threat-model.md` (one note: side-effect-free preview and completion through the scope), `background.js` (`xray:console-preview`: `callFunctionOn` via the Task 6 strict scope-locals builder returning `(<expr>)` with { throwOnSideEffect: true, timeout: 300, returnByValue: false, generatePreview: true })`, release the object group after reading), `panel/console.js` + `consoleBridge.ts` (`previewCommand(code: string, requestId: number): Promise<{ requestId: number; text: string | null; error?: string } | null>`), create `src/panel/models/consoleEager.ts`, modify `ConsoleEditor.tsx` (hint row: local fast path first, then page preview). Tests: `test/unit/consoleEager.test.mjs`, `test/background-service-worker.test.js`, E2E `test/e2e/console-live.e2e.mjs`.

**Interfaces:**
- Produces: `previewEligible(draft: string): boolean` (single complete expression; no `await`, no top-level declaration, no assignment/`++`/`--`/`delete` at depth 0, length ≤ 2,000); `fromCdpPreview(remote: { type; subtype?; className?; description?; value?; preview? }): string` mapping CDP RemoteObject/ObjectPreview to the `previewLine` format (Task 1).

- [ ] Step 1: Failing tests: eligibility table (20 drafts); `fromCdpPreview` for number/string/array/object/Map/Set/Promise/function/node/error; E2E: typing `res.users.length * 2` shows `→ 6` before Enter; `1+1` → `→ 2`; `localStorage.setItem('a','b')` shows nothing and `localStorage.a` stays null; `res.users.map(u => u.id)` → `→ Array(3) [1, 2, 3]`; a complete expression that throws (`null.x`) shows faint `Uncaught TypeError: …`; incomplete `res.users.` shows nothing; stale preview never replaces a newer one; setting off → no preview; latency: preview visible ≤ 450 ms after the last key on the fixture page.
- [ ] Step 2: RED. Step 3: implement. Step 4: GREEN; gate + touched E2E.

### Task 9: Integration and acceptance

**Files:** only on failure; `docs/ui-audit.md` one line referencing the spec; README Console section (brief, accurate).

- [ ] Full gate: `npm run check && npm run test:e2e && npm run test:coverage` (lines ≥ 98.5 %, branches ≥ 89 %); `git diff --check`; dist synced.
- [ ] Acceptance: rename `output/console-audit/probe.mjs.txt` → `.mjs`, adapt to the new UI, rerun all phases against the built extension; before/after table for G1–G19 and bugs 1–6 (PASS/FAIL with observed values) in `output/console-round2/acceptance.md`; latency: keydown → list p95 ≤ 16 ms, live merge ≤ 300 ms, preview ≤ 450 ms; screenshots of the top 10 probes on XRAY Dark and XRAY Light for the controller's visual review.
