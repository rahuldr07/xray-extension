# Console audit — output and autocomplete (2026-10-18)

Scope: how command **output** is shown and how **autocomplete** behaves while typing, in the real
unpacked extension (committed `dist/`, verified in sync with `scripts/check-dist-sync.mjs`). Read-only
on source. Baseline intent: `2026-10-12-console-redesign-design.md`, `2026-10-13-console-autocomplete-design.md`
(whose "Out of scope" explicitly deferred history ghost text and live page-object completion).

**Method.** `output/console-audit/probe.mjs.txt` (rename to `.mjs` to run; phases `suggest`, `results`,
`extra`, `web`) launches Chromium with `--load-extension=<repo>`, serves a fixture page that defines page
globals (`appState`, `formatPrice`) and makes 4 fetches (`/api/users` 200, `/api/missing` 404,
`/api/orders` 500, `/api/report` 200), opens the in-page panel (Ctrl+Shift+X), selects `/api/users`, and
drives the Console through CDP into the closed shadow root (task-7 recipe). Every probe is screenshotted;
raw observations are in `output/console-audit/facts-{suggest,results,extra,web}.json`
(`facts-results-run1.json` is the first results run).

## 1. Inventory — what exists today

### Autocomplete (all sources are captured data; nothing is evaluated — `consoleAssist.ts` `suggest`)

| Capability | State | Notes / evidence |
|---|---|---|
| Members of `res`, `req`, `entry`, pins `a`–`f`, `temp1…`, `$_` | Yes | Only roots matching `TRAILING_PATH` (`res\|req\|[a-f]\|temp\d+\|$_`). `res.` → users/data/meta with type labels (`suggest/01-res.png`) |
| Nested object keys | Yes | `res.data.`, `res.users[0].` (`suggest/02`, `03`) |
| Array members | Yes | `[0]`, `length` (with count), 9 methods (map filter find some every includes slice join at), then **key union across items** (`id 3/3 · number`) that inserts `map(x => x.key)` (`suggest/04-res-users.png`) |
| String members | Yes | `length` + 10 methods (`suggest/07`) |
| Number / boolean / object methods | No | `res.users[0].score.` → nothing |
| XRAY helpers | Yes | 26 helpers, as-you-type after 2 chars (`$s` → `$slow $status $errors`) |
| Helper argument values | Yes | `$status(` → captured codes with counts (`200 ×2`, `404 ×1 · error`); `$endpoint('` → captured paths; `pick(res, ['` → keys; `$slow(` → 500/1000/p95/slowest |
| Ctrl+Space browse | Yes | Empty word → 26 items grouped Request data / Find entries / Transform / Output / Variables (`suggest/31-empty-ctrl-space.png`); "No suggestions" row + live region otherwise |
| JS globals / built-ins (`Object`, `JSON`, `Math`, `document`, `window`, `fetch`, `Promise`) | **No** | `Object.ke`, `JSON.str`, `document.qu`, `fetch(`, `wind`, `con` → no list; Ctrl+Space after `Object.` → "No suggestions" (`suggest/11`, `12`, `20`, `32`) |
| Page variables (`appState.`, `formatP`) | **No** | `suggest/22`, `23` |
| JS keywords (`await`, `const`, `typeof`) | No | |
| Lambda parameter members (`filter(u => u.`) | No | `suggest/10`, `extra/expanded-callback-param.png` |
| Ranking | Prefix (3) > subsequence (1), source order on ties | `Ma` → `schema` only; `res.users.ma` → map, manager, **email** (subsequence noise) |
| Popup UI | Label + one detail string; group headers; ↑/↓ wrap; Tab/Enter accept; click accept; Escape closes first; `aria-activedescendant`; polite live region "N suggestions" | No kind icon, no signature column, no doc pane (`extra/helper-popup.png`) |
| Ghost text (inline completion) | No | |
| Signature hint | XRAY helpers only, active parameter bolded + param description | `schema(` → `schema(x) Value to describe.`; `fetch(` → nothing |
| Live preview while typing | Plain path into captured data only | `res.users[0].name` → `→ "Ada Lovelace" (from captured data)`; `res.users.map(u => u.id)`, `1+1` → nothing |
| History | ↑/↓ from first/last line, 100 entries in extension storage, Escape restores draft | No prefix filter, no Ctrl+R search |
| Multi-line | Shift+Enter in collapsed editor; Ctrl/⌘+↑ expanded editor with gutter, auto-pairs, Format, Run selection, Save as snippet | `const n = res.users.length⏎n * 2` → `6` (`extra/multiline-draft.png`) |
| Latency | keydown → listbox DOM **p50 2.1 ms, p95 3.4 ms, max 3.4 ms** (n=20, in-page MutationObserver stamp) | Not a problem |

### Output (`shared/console-helpers.js` `encodeResult` → `consoleResults.ts` `describeResult` → `ResultView.tsx`)

| Value | Shown as | Evidence |
|---|---|---|
| number / boolean / null / undefined / bigint / NaN / symbol / Date | Inline `→ 2 number`, `→ 10n bigint`, `→ 1970-01-01T00:00:00.000Z date` | `result/06`–`11`, `35`, `36` |
| short string | Inline quoted with `string · 5 chars` | `result/12` |
| long string | Whole text in a `<pre>` (1,080 chars); past 200,000 chars cut with "Showing the first 200,000 of 300,000 characters" + `truncated` badge | `result/13`, `14` |
| object | Toolbar (badge `object · 3 keys`, Tree/JSON switch, Inspector, Copy, Save as variable) + tree **fully expanded** to depth 4, Expand all / Collapse all | `result/01-res.png` |
| array of objects | Table by default (≤12 cols, ≤100 rows), Tree, JSON | `result/03-res-users.png` |
| big array/object (>50 items or >20 KB) | One summary line `Array(500) [ 0, 1, 2, … ]` + "Open in inspector" (filter, copy path, use in prompt) | `result/27`, `44-window.png` |
| Map / Set / typed array | Tree `Map(2) { 1 => 2 "a" => {…} }`; Set rendered with indices `0 : 1` | `result/15`, `16`, `38` |
| function | `ƒ anonymous()` / `ƒ formatPrice()` — no params, no source; `fetch` → `ƒ _xrayFetch()` | `result/17`–`19` |
| Promise | Auto-awaited: `Promise.resolve(5)` → `5`; nested `{p: Promise}` → `Promise { }` (no state); never-settling → "Execution timeout (10s)" after 10.5 s | `result/20`, `21`, `extra/async-*.png` |
| Error | Red line `Error x`; Stack toggle only when non-wrapper frames remain (a top-level `throw` has none); hints (`res is the response body itself. Try Object.keys(res).`, `Did you mean \`copy\`?`); failed command is returned to the draft | `result/22`–`24` |
| DOM element | Opaque scalar `→ <h1#title.hero> element` — not expandable | `result/29`, `31` |
| NodeList / HTMLCollection | Tree `NodeList { "0": <p> "1": <p.second> }` | `result/30` |
| Depth > 8 | `truncated` badge, depth envelope | `result/33` |
| Response, Request, Headers, URLSearchParams, FormData, Blob, URL, RegExp, PerformanceResourceTiming, AbortController | **Empty `{ }` with "0 keys"** | `web/*.png`, `result/37`, `39` |
| `console.log` inside a command | Appears as a page-log row under the cell (`hi from command {"a":1}`) | `result/41` |
| `const x = …` then `x` | `undefined`, then **ReferenceError** — declarations do not persist | `result/42`, `43` |
| Cell actions | Re-run, Edit in prompt, ⋯ (Copy command, Delete), Copy result (JSON), Save as variable (`temp1`), run time | |
| Run latency (in-page, Enter → cell → painted) | `1`: 25/38 ms; `res`: 18/39 ms; 5,000-object array: 40/57 ms; `window`: 21/39 ms; 150k string: 46/55 ms. Panel-reported run time 8–31 ms | `facts-extra.json` `renderLatency` |

## 2. Gaps

Value = user value (High/Med/Low). Size = S (≤1 day), M (2–4 days), L (≥1 week or a product-rule change).

| # | Gap | Evidence | What good consoles do | Value | Size | Where in code |
|---|---|---|---|---|---|---|
| G1 | Web/API objects render as empty `{ }`: `await fetch(…)` → `Response · 0 keys`; `Headers`, `URLSearchParams`, `Request`, `FormData`, `Blob`, `URL`, `RegExp`, `PerformanceResourceTiming` likewise. For an API debugger this is the worst output gap. | `output/console-audit/web/await-fetch-api-users.png`, `web/new-Headers-x-trace-1-accept-application.png`, `result/37-ab-c-gi.png`, `result/39-new-URL-location-href.png` | DevTools: `Response {type: 'basic', url: …, status: 200, ok: true, headers: Headers, …}` (prototype accessors), `Headers {'accept' => …}` via `[[Entries]]`, `/ab+c/gi`, `URL {href: …}` | High | M | `shared/console-helpers.js` `_resultObject`/`_resultRecord` (own enumerable keys only); add per-class projections (entries() for Headers/URLSearchParams/FormData, safe prototype getters for Response/Request/URL/PerformanceEntry, `String(re)` for RegExp) |
| G2 | No completion of JS globals and built-ins (`Object.`, `JSON.`, `Math.`, `Array.`, `Promise.`, `document.`, `window`, `fetch`, `console`). Only XRAY helpers and captured roots exist. | `suggest/11-Object-ke.png`, `12-JSON-str.png`, `20-document-qu.png`, `32-Object-ctrl-space.png` | DevTools/Node REPL complete every global and its members, with prototype methods | High | M (static catalogue) / L (live, see G3) | `src/panel/models/consoleAssist.ts` `suggest` identifier branch (~L511) and `TRAILING_PATH` (~L241) |
| G3 | No live page-object completion: `appState.`, `formatP`, `document.qu` give nothing. Product rule "suggestions never evaluate code" blocks it. | `suggest/22-appState.png`, `23-formatP.png` | DevTools enumerates live properties with `Runtime.evaluate({throwOnSideEffect: true})` / `Runtime.getProperties`, including prototype chain | High | L (needs a new `xray:console-complete` message through the cached debugger session; rule change: side-effect-free CDP reads) | `background.js` (`_evaluateConsoleInTab` neighbour), `ConsoleEditor.tsx` `visibleSuggestions` |
| G4 | No eager evaluation preview. The hint only previews a plain path into captured data; `res.users.map(u => u.id)`, `res.users.length * 2`, `1+1` show nothing. | `suggest/28-res-users-length.png` vs `suggest/30-res-users-map-u-u-id.png` | DevTools eager evaluation: grey one-line result under the prompt as you type, side-effect-free (`throwOnSideEffect`, ~500 ms timeout) | High | M/L (local: a small hand-written interpreter over a safe subset — literals, member/index access, arithmetic, whitelisted pure array/string methods with arrow callbacks — over captured roots; no `eval`/`new Function`: MV3 extension pages forbid `unsafe-eval`, and running typed code in the isolated world breaks the threat model) / L (page-side `Runtime.evaluate` with `throwOnSideEffect` via the debugger) | `ConsoleEditor.tsx` `hint` memo (~L270-293), `previewValue` |
| G5 | `const`/`let` declarations do not persist between runs (`const answer = 42` then `answer` → ReferenceError); each run is an async IIFE. | `result/42-const-answer-41-1.png`, `result/43-answer.png` | DevTools and Node REPL keep top-level `let/const/class/function` (`Runtime.evaluate({replMode: true})`) | High | M | `background.js` `_buildConsoleExpression` / `_consoleUserBody` (~L157-275) |
| G6 | Promise state never shown: top level is auto-awaited (loses "this was a Promise"), nested shows `Promise { }`, pending blocks the prompt for 10 s then errors. | `result/20-Promise-resolve-5.png`, `result/21-p-Promise-resolve-5.png`, `extra/async-new-Promise.png` | DevTools: `Promise {<fulfilled>: 5}`, `Promise {<pending>}` returned immediately; only explicit `await` waits | Med | M | `background.js` (`awaitPromise: true`, implicit `await` of the return), `console-helpers.js` `_resultObject` |
| G7 | Functions show no signature or source: `() => 1` → `ƒ anonymous()`, `formatPrice` → `ƒ formatPrice()` (params hidden); `fetch` → `ƒ _xrayFetch()` (XRAY's own wrapper, unlabelled). | `result/17-1.png`, `18-formatPrice.png`, `19-fetch.png` | DevTools: `ƒ formatPrice(cents, currency = 'EUR')`, expandable to source / `[[FunctionLocation]]`; native `ƒ fetch() { [native code] }` | Med | S | `console-helpers.js` `_resultValue` `case 'function'` (~L642); `content/interceptor.js` wrapper name |
| G8 | DOM elements are opaque one-liners (`<body>`), not expandable; no attributes, children, text, or hover highlight. | `result/29-document-body.png`, `31-document-getElementById-title.png` | DevTools: expandable element tree, hover highlights in page, "Reveal in Elements" | Med | M | `console-helpers.js` `_domText`/`_typed('dom')`; `ResultView.tsx` scalar branch |
| G9 | Popup shows no kind icon or signature; helpers show a long description; no doc pane. Accepting a helper while typing inserts the bare name (`$endpoint`), Ctrl+Space browse inserts `$endpoint(` with the caret inside. | `extra/helper-popup.png`, `facts-extra.json` `mouseAccept` | VS Code/DevTools: kind icons, `name(params)` on the row, docs on the side, `(` auto-inserted for callables | Med | S | `ConsoleEditor.tsx` option render (~L655-675); `consoleAssist.ts` identifier candidates (~L511) vs `browseItems` (~L425) |
| G10 | Signature hint only for XRAY helpers; `fetch(`, `JSON.stringify(`, array methods and page functions get none. | `suggest/21-fetch.png` | DevTools/VS Code parameter hints for built-ins (from TS lib d.ts) | Med | M | `consoleAssist.ts` `scanArgument`/`signatureAt` (only `HELPERS`) |
| G11 | No member completion on lambda parameters: `res.users.filter(u => u.` → nothing, although the array's item keys are known. | `suggest/10-res-users-filter-u-u.png` | VS Code infers `u` from the array element type | Med | M | `consoleAssist.ts` `suggest` member branch (`TRAILING_PATH` root list) |
| G12 | Ranking: subsequence matches score the same as each other and below prefix only; no contiguous-substring tier, no recency/frequency. `Ma` → `schema`; `res.users.ma` → `email`. | `suggest/13-Ma.png`, `suggest/05-res-users-ma.png` | VS Code/DevTools: prefix > word-boundary/camelCase > substring > subsequence, plus recently-used boost | Med | S | `consoleAssist.ts` `fuzzyScore` (~L161) |
| G13 | Small method sets: arrays get 9 methods (no `reduce`, `sort`, `toSorted`, `flatMap`, `forEach`, `findIndex`, `indexOf`, `concat`, `entries`), strings 10, numbers/booleans/objects none (`toFixed`, `Object.keys(…)` patterns). | `suggest/04-res-users.png` | Full prototype chain | Med | S | `consoleAssist.ts` `ARRAY_METHODS`/`STRING_METHODS` (~L31-33) |
| G14 | No ghost-text inline completion and no history-aware suggestions (typing `sche` after running `schema(res)` offers only the helper). | `facts-extra.json` `historyPrefix` | DevTools/fish/Warp: grey inline completion from the top suggestion or history, → or Tab accepts | Med | M | `ConsoleEditor.tsx` overlay `<pre>` (already paints tokens; can append a ghost span) |
| G15 | Inline tree: JSON-style quoted keys (`"id" :`), Set shown with indices, Date only ISO, full `res` auto-expands to depth 4 (tall cells); per-node Copy path / Use in prompt exists only in the inspector. | `result/01-res.png`, `16-new-Set-…png` | DevTools: unquoted keys, collapsed-by-default object preview `{id: 1, name: 'Ada', …}` with expand arrow; right-click "Copy property path" / "Store as global variable" | Med | S | `src/panel/components/detail/JsonView.tsx`, `ResultView.tsx` (tree branch), `ResultInspector.tsx` |
| G16 | Big results show only a one-line summary: an `Array(500)` of numbers or a 5,000-row table shows no rows inline. | `result/27-Array-500-keys.png` | DevTools: expandable with `[0 … 99]` buckets; Node prints the first 100 items | Low | S | `ResultView.tsx` `is-big` branch |
| G17 | Errors: a top-level `throw` has no stack (wrapper frames filtered out, so no "at <anonymous>:1"); frames that exist are plain text, not links. Did-you-mean only searches helper names (`nope` → `copy`). | `result/22-throw-new-Error-x.png`, `result/24-nope.png` | DevTools: `Uncaught Error: x at <anonymous>:1:7`, frames link to Sources | Low | S (hint) / M (links via `chrome.devtools.panels.openResource` on the DevTools surface) | `consoleErrors.tsx` `commandStackFrames`; `consoleAssist.ts` `errorHint` |
| G18 | `$` alone opens nothing (2-character gate), so the `$`-helper family is not browsable from its sigil. | `suggest/15-x.png` | `$` is a natural trigger | Low | S | `ConsoleEditor.tsx` `visibleSuggestions` gate |
| G19 | JS keywords (`await`, `const`, `typeof`, `new`, `return`) never suggested. | `suggest/27-await.png` | DevTools offers keywords in identifier position | Low | S | `consoleAssist.ts` (KEYWORDS set already exists at ~L628) |

## 3. Bugs (with repro)

1. **Issue #5 confirmed: Enter accepts a status value instead of running.** Type `$status(res ` (trailing
   space) → list reopens with 200/404/500 → Enter → draft becomes `$status(res 200`, nothing runs. Same for
   `$status(true `. Evidence: `output/console-audit/suggest/issue5-status-res.png`, `issue5-status-true.png`,
   `facts-suggest.json` `extra`. Cause as filed: `endsComplete` (`consoleAssist.ts` ~L360) does not treat
   an identifier/keyword followed by whitespace as complete.
2. **Misleading error for a never-settling Promise (intermittent).** In the first results run,
   `new Promise(() => {})` failed after **5.76 s** with "XRAY console could not attach Chrome debugger for
   CSP-safe execution." (`facts-results-run1.json`; its screenshot was overwritten by the rerun, `result/47-new-Promise.png` now shows the normal timeout). Two later
   runs gave the expected "Execution timeout (10s)" at 10.5 s. Not root-caused. Whatever the trigger, the
   catch-all in `background.js` `_evaluateConsoleInTab` (~L425-438) labels **any** rejected CDP command as
   an attach failure and then detaches the cached session.
3. **Helper insert differs by path.** Type `$en`, accept `$endpoint` (Enter, Tab or click) → `$endpoint`
   with no `(`; Ctrl+Space browse → `$endpoint(` with the caret inside. (`facts-extra.json` `mouseAccept`.)
4. **`fetch` shows `ƒ _xrayFetch()`** (`result/19-fetch.png`). Not strictly a defect: the page's `fetch` is
   XRAY's wrapper, and DevTools would show the same. Opportunity: recognise the console's own interceptor and
   label it `ƒ fetch() [patched by XRAY]`.
5. **`Ma` suggests only `schema`** (subsequence m…a), a match no user means (`suggest/13-Ma.png`).
6. **Declarations vanish.** `const answer = 41 + 1` → `undefined`; `answer` → `ReferenceError` (`result/42`, `43`). Listed as G5; a REPL user experiences it as a bug.

## 4. Recommended top 8 (priority order)

1. **Render web/API objects (G1).** Response, Request, Headers, URLSearchParams, FormData, Blob, URL, RegExp,
   PerformanceResourceTiming. Users of an API console run `await fetch(…)` and currently get `Response { }`. (M, encoder only, no new permissions.)
2. **Persist declarations across runs (G5).** Use `replMode: true` or hoist top-level `let/const/class/function`
   into a per-tab scope, so `const users = res.users` works in the next command. (M)
3. **Global and built-in completion (G2 + G13 + G19).** Ship a static catalogue of standard globals
   (`Object`, `JSON`, `Math`, `Array`, `Promise`, `Number`, `String`, `Date`, `URL`, `document`, `window`,
   `fetch`, `console`), their static members and the full Array/String/Number/Object prototype method lists,
   plus keywords. No evaluation, so it fits today's rule. (M)
4. **Eager result preview under the prompt (G4).** Start locally with a small hand-written interpreter (no
   `eval`/`new Function`: MV3 CSP and the threat model rule them out) over a safe subset — literals, member and
   index access, arithmetic, whitelisted pure array/string methods with arrow callbacks — on captured roots, and
   show `→ Array(3) [1, 2, 3]` in the existing hint row. A page-side `throwOnSideEffect` preview can follow
   item 6. (M/L)
5. **Fix Enter capture and ranking (Bug 1/issue #5, G12, Bug 3).** Treat `identifier␠` as complete; add
   substring and word-boundary tiers and a recently-accepted boost; make helper accept insert `name(` with
   the caret inside everywhere. (S)
6. **Live page-object completion (G3, G11).** A `xray:console-complete` message that reads property names via
   the cached debugger session (`Runtime.evaluate` with `throwOnSideEffect: true`, or `Runtime.getProperties`)
   for `appState.`, `document.qu`; infer lambda parameters from the array item type locally. Needs a spec
   change to "suggestions never evaluate code" and a threat-model note. (L)
7. **Richer value previews (G6, G7, G8, G15).** `Promise {<fulfilled>: 5}` / `<pending>` (return pending
   promises without blocking), `ƒ formatPrice(cents, currency = 'EUR')` with expandable source, expandable DOM
   elements (tag, attributes, children count, text), collapsed object previews `{id: 1, name: 'Ada', …}` instead
   of fully expanded trees, unquoted keys. (M)
8. **Popup polish and ghost text (G9, G10, G14).** Kind icons, `name(params)` on each row, a doc line for the
   active item, signature hints for common built-ins, and grey inline completion of the top suggestion or a
   history match (→ to accept). Also fix the attach-failure error wording (Bug 2). (M)

Latency is not a constraint for any of these: suggestions render in ~2 ms after keydown and results paint
30–60 ms after Enter, even for a 5,000-row array or `window`.
