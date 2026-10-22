# Console — output and autocomplete, round 2 — design

Requested 2026-10-18 ("more better console like showing the output, auto completion suggestions").
Evidence: `docs/superpowers/specs/assets/2026-10-18-console-audit.md` (gaps G1–G19, bugs 1–6, real
extension, screenshots in `output/console-audit/`). Decided under the user's standing delegation; every
decision below is a ruling recorded in the plan ledger. This spec is the authority for the plan and
amends `2026-10-13-console-autocomplete-design.md` where they conflict.

## Purpose

The Console should feel like a real JS console pointed at the page and the captured traffic: it knows
the language and the page (not only captured JSON), shows what an expression will return before you
press Enter, remembers what you declared, and prints web objects (`Response`, `Headers`, `URL` …),
promises, functions and DOM nodes in a way you can read. Success: every probe in the audit that
showed nothing, `{ }`, a ReferenceError or a wrong insertion now shows the useful result listed here,
with no new permission, no page global, and typing latency still under one frame.

## Principles

- **The debugger session is the one execution path** (threat model C-1, C-8). Live completion and
  eager preview reuse it, always with `throwOnSideEffect: true` and a short timeout, and always
  through the same shadowed-`window` expression builder — never a page global, never MAIN-world code.
  This amends the 2026-10-13 rule "suggestions never evaluate code" to: *suggestions and previews
  never run code with side effects*.
- **Local first.** Everything that can be answered from captured data and a static catalogue is
  answered in the panel without a round-trip; the page is asked only for what only the page knows.
  Page answers merge into an already-open list; they never block or reorder what the user is reading.
- **Never steal Enter.** Enter runs a complete command; a list that is open over a complete command
  does not capture Enter (fixes issue #5).
- No new dependencies; tokens-only colours; every theme; document, closed-shadow HUD, pop-out and
  DevTools surfaces behave the same; `prefers-reduced-motion`.

## 1. Output (G1, G6, G7, G8, G15, G16, G17, bug 4)

Encoder: `shared/console-helpers.js` (page side); description/rendering: `consoleResults.ts`,
`ResultView.tsx`, `JsonView.tsx`.

- **Web objects** get a per-class projection read from safe getters/`entries()` (never `body`
  consumption):
  - `Response {status: 200, ok: true, statusText, url, type, redirected, bodyUsed, headers: Headers(n)}`
  - `Request {method, url, mode, credentials, headers}`
  - `Headers(n) {'content-type' => '…', …}`, `URLSearchParams(n) {…}`, `FormData(n) {name => value | File(name, size, type)}`
  - `URL {href, origin, protocol, host, pathname, search, hash}` (+ `searchParams` entries)
  - `Blob/File {size, type, name?}`, `RegExp` as `/src/flags`, `Date` as ISO + local string,
    `PerformanceResourceTiming {name, initiatorType, duration, transferSize, …}`,
    `AbortController/AbortSignal {aborted, reason}`, `Error` subclasses keep `name/message/cause`.
  - Unknown class instances with no own keys show their constructor name and prototype getters that
    are side-effect-free data accessors (skip on throw), so nothing renders as a bare `{ }`.
- **Promises:** top-level results keep today's auto-await (users rely on `fetch(…).then(r => r.json())`
  returning the data), but the cell header says so: `Promise · fulfilled in 120 ms` / `rejected`. A
  promise still pending at the 10 s cap shows `Promise {<pending>}` with a note instead of an
  "Execution timeout" error. Nested promises show `Promise {<fulfilled>: 5}` / `<rejected>` /
  `<pending>` (state read after a microtask flush, so already-settled ones are exact).
- **Functions:** `ƒ formatPrice(cents, currency = 'EUR')` (parameter list from the source), `async ƒ`,
  `class Foo`, native `ƒ fetch() [native code]`; XRAY's own interceptor wrapper is labelled
  `ƒ fetch() — wrapped by XRAY`. Expandable to the source (first 4,000 chars).
- **DOM nodes:** `<div#app.main>` expandable to attributes, text (first 200 chars), child elements
  (first 50, each again expandable to depth 3), with a count of the rest. Snapshot only; no live handle.
- **Objects and arrays inline:** collapsed one-line preview by default for anything with more than 5
  keys/items — `{id: 1, name: 'Ada', email: '…', …}`, `Array(500) [0, 1, 2, …]` — with an expand
  arrow; unquoted identifier keys in Tree (quoted only when not a valid identifier); Set entries
  without indices; big arrays expand in buckets `[0 … 99]`, `[100 … 199]`. Arrays of objects keep the
  Table default.
- **Errors:** a top-level `throw` shows `Uncaught Error: x` with `at <anonymous>:line:col` mapped to
  the user's command (wrapper frames still hidden); did-you-mean searches helpers, declared names,
  page globals already known to the completion catalogue.
- **Debugger errors** say what actually failed: attach failure, detached by the user, tab closed,
  timeout, or "evaluation failed" with the CDP message — the session is dropped only when it is
  actually dead (bug 2).

## 2. Declarations persist (G5)

`let`, `const`, `var`, `function`, `class` at the top level of a command are kept for later commands
in the same tab while the debugger session lives.

- Mechanism (ruling, from the 2026-10-18 spike in `output/console-spike/`): a per-tab **scope object
  held by CDP, not by the page**, created with `Runtime.evaluate(returnByValue:false)` and kept by its
  `objectId` (persisted in extension session storage so a service-worker restart can reuse it). It
  holds the helpers (built once per scope, not inlined per command), the current context (`res`,
  `req`, pins, saved vars — refreshed by `callFunctionOn` with the context text as an argument) and
  declared names. Commands run via `Runtime.callFunctionOn` as a **strict** function that binds the
  names it needs as locals read from the scope and writes declared names back at the end — no `with`
  and no sloppy frame, because V8 hands a sloppy frame's receiver and function to the page's
  `Error.prepareStackTrace` (Task 6 review: reproduced). Top-level declarations stay ordinary
  declarations in the command body; their bound names (found by a small depth-0 statement scanner,
  incl. destructuring patterns) and undeclared top-level assignments (`x = 1`, REPL-style) are written
  to the scope at the end of the run. The context reaches the page as a CDP argument value, never
  through the page's `JSON.parse`. Values stay live in page memory (functions and DOM nodes work); nothing is
  written to `window`. Spike: page scripts see `typeof y === 'undefined'` for scope names.
- Rejected: CDP `replMode` — its declarations land in the page's global lexical scope, which page
  scripts can read (spike: `typeof x === 'number'` from page code), so captured data would leak.
- `const` stays read-only in later commands (assignment → `TypeError: Assignment to constant
  variable.`); redeclaring with `let`/`const` in a later command replaces the binding (REPL
  semantics, like Chrome's `replMode`).
- Lifetime: until the debugger session detaches (idle detach, user cancels the infobar, navigation).
  When the scope is lost the next command runs normally and the cell shows one quiet note
  "Declared variables were reset (page reloaded or debugger detached)". Saved variables `temp1…`/`$_`
  and pins keep their current behaviour.
- The idle-detach window grows from 30 s to 5 min while the Console prompt is focused, so a pause to
  think doesn't wipe the scope; it returns to 30 s when the prompt blurs. The timer is re-armed
  after a service-worker restart from extension session storage.
- Threat model: the scope object is reachable only through CDP; the page cannot enumerate it. Update
  `docs/threat-model.md` (C-1 note).

## 3. Completion (G2, G3, G9–G14, G18, G19, bugs 1, 3, 5)

Engine: `src/panel/models/consoleAssist.ts` (local), new `consoleCatalog.ts` (static data), a new
`xray:console-complete` background message (page). UI: `ConsoleEditor.tsx`.

- **Sources, merged and ranked together:**
  1. Captured data (today's roots, pins, saved vars, helper argument values) — unchanged.
  2. **Declared names** from the scope (§2), with their type.
  3. **Static catalogue:** ECMAScript + common Web globals (`Object JSON Math Array Promise Number
     String Date URL URLSearchParams Headers Request Response fetch console document window
     location navigator localStorage sessionStorage structuredClone setTimeout atob btoa
     encodeURIComponent …`), their static members, and full prototype method lists for Array, String,
     Number, Object, Promise, Map, Set, Date, RegExp, Response, Headers, URL, Element/Document
     (common subset). Each entry: kind (function/method/property/class/keyword/variable), signature
     `name(params)`, one-line doc, return type when simple. Keywords in statement/expression position.
  4. **Live page members** via the debugger: for `<expr>.` where `<expr>` is not a captured root, the
     background evaluates `<expr>` with `throwOnSideEffect: true`, 250 ms timeout, and returns own +
     prototype-chain property names (cap 500, skips `__proto__`, marks functions/getters); bare
     identifiers query page globals once per scope (cached, refreshed after each Run and on
     navigation). Requests are
     debounced 120 ms, cancelled by the next keystroke, and only sent when a session is attached or
     the prompt is focused (§4).
  5. **Lambda parameters:** `arr.map(u => u.` / `filter`, `find`, `some`, `every`, `forEach`,
     `flatMap`, `reduce((acc, u) => u.` infer `u` from the array item shape (captured data, declared
     values via live members).
- **Ranking tiers:** exact > prefix > word-boundary/camelCase (`qSA` → `querySelectorAll`) >
  contiguous substring > subsequence (only when the query has ≥ 3 chars and no better match exists).
  Within a tier: recently accepted (per-tab memory of the last 200 accepts, persisted) > source
  priority (captured > declared > live > catalogue) > shorter > alphabetical. `Ma` no longer offers
  only `schema`; `res.users.ma` puts `map`, `manager` before any subsequence noise.
- **Popup row:** kind icon, name with matched characters emphasised, `(params)` for callables, type or
  value preview on the right (e.g. `3/3 · number`, `200 ×2`); a doc line for the active row under the
  list. Accepting a callable inserts `name(` with the caret inside on every path (Enter, Tab, click,
  browse). `$` alone opens the `$`-helper family.
- **Ghost text:** the top suggestion's remaining characters, or a history match when it is longer
  and the list is closed, render as faint inline text; **→ at line end** or **Tab** accepts; any other
  key ignores it. Never shown when the caret is not at the end of the token.
- **Signature hints** for catalogue functions (`fetch(input, init?)`, `JSON.stringify(value,
  replacer?, space?)`, array methods with callback shapes) and page functions (parameter list from
  their source via the live call), active parameter bolded.
- **Enter (issue #5):** a command that is syntactically complete runs on Enter even if the list is
  open; the list captures Enter only while the token under the caret is incomplete (e.g. `res.us`)
  and the user has moved the selection with ↑/↓ or typed into an open list. `identifier␠` closes the
  list.

## 4. Eager preview (G4)

- While typing, after 150 ms of no input, if the draft is a complete expression (not a statement
  with declarations, no `await`, not empty), the background calls
  `Runtime.callFunctionOn` with the same strict scope-locals builder (§2) returning `(<expr>)`, with
  `throwOnSideEffect: true, timeout: 300, returnByValue: false, generatePreview: true` and turns CDP's
  object preview into the §1 one-line form (`→ Array(3) [1, 2, 3]`, `→ 6`) shown grey under the
  prompt. The full command builder is never used for previews: inlining the helper module makes every
  evaluation fail the side-effect check (spike), and V8 only checks the synchronous part of async
  code. A helper the check rejects shows no preview, never an error.
- Side-effect, timeout, syntax-incomplete and "would need await" outcomes show nothing (no error
  noise); a thrown exception on a complete expression shows a faint `Uncaught TypeError: …`.
- Local fast path stays: plain paths into captured data preview instantly without the page.
- **Session policy (ruling):** preview and live completion attach the debugger only once the user
  has typed a draft of at least 2 non-space characters into the Console prompt and paused 150 ms —
  never on a stray click (Chrome then shows its "XRAY started debugging this browser" bar, as it does
  on Run today). They never attach from anywhere else and do nothing when the permission is missing
  or the user cancelled the bar (the Console's existing message shows only on Run). A setting
  "Preview results while typing" (default on) turns off eager preview, live completion and this
  attach.

## 5. Testing

- Unit (`test/unit/`): catalogue integrity (every entry has kind/signature/doc; no duplicates);
  ranking tiers and recency; lambda inference; Enter-capture rule incl. issue #5 repro strings;
  ghost-text rules; one-line formatter for every §1 class; declaration rewriter (all declaration
  forms, destructuring, `const` immutability, redeclaration, function hoisting, shadowing of helpers
  and `res`); preview eligibility.
- Background tests (existing VM harness for `background.js`): complete/preview messages use
  `throwOnSideEffect`, timeouts, cancellation; scope object lifecycle and reset note; error labelling
  (bug 2).
- Encoder tests (`shared/console-helpers.js` VM): every web class projection, promise states,
  function signatures, DOM snapshot caps.
- E2E (document + closed shadow) with a real page through the debugger (as the audit did):
  `await fetch('/api/users')` shows `Response {status: 200 …}`; `const u = res.users` then `u.length`
  → 3; `Object.ke` → `keys(o)`; `appState.` lists page members; `res.users.filter(u => u.` lists item
  keys; typing `res.users.length * 2` previews `→ 6` before Enter; a side-effecting draft
  (`localStorage.setItem('a','b')`) previews nothing and does not write; `$status(res ` + Enter runs;
  ghost text accept with → ; Promise states; DOM expand.
- Real extension acceptance: rerun `output/console-audit/probe.mjs.txt` phases; before/after table for
  G1–G19 and bugs 1–6; latency: keydown → list p95 ≤ 16 ms (local), live merge ≤ 300 ms, preview
  ≤ 450 ms after the last key.

## Out of scope

Clickable stack frames into Sources, "Reveal in Elements"/hover highlight, AI suggestions, a full
TypeScript-grade type inference, history Ctrl+R search (follow-up).
