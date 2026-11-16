# XRAY threat model

Status: **draft, findings open.** Produced from a source review of v0.3.0. Nothing here
has been confirmed against a live browser except where noted; items marked *unverified*
need empirical confirmation before anyone acts on them.

This document exists so the findings are not lost. Several are architectural and remain
**open** — see [Open findings](#open-findings). It is not a claim that the extension is
secure.

---

## 1. What the extension is, in security terms

XRAY injects content scripts into **every frame of every URL** (`<all_urls>`), at
`document_start`, into **both the MAIN and ISOLATED worlds**. It captures fetch, XHR,
WebSocket, EventSource and GraphQL traffic, retains request/response bodies, decodes JWTs,
replays requests with restored credentials, and can send captured traffic to a third-party
LLM.

That makes it, by design, a tool that aggregates high-value secrets from every site the
user visits and concentrates them in one place.

### Trust boundaries

| Boundary | Trustworthy? | Notes |
|---|---|---|
| Page ↔ **MAIN world** | **No — same realm** | MAIN-world scripts share the page's global scope. Nothing stored on `window` is secret from the page, and anything on `window` can be replaced by the page. |
| MAIN world ↔ **ISOLATED world** | Partially | Separate globals; the page cannot read isolated-world variables. But the only channel between them is `window.postMessage`, which the page can also read and write. |
| ISOLATED world ↔ **service worker** | Yes | `chrome.runtime` messaging is not reachable from web pages — there is no `externally_connectable` in the manifest (confirmed). |
| Extension pages (DevTools panel, pop-out) | Yes | Extension origin, `chrome.storage` access. |

**The single most important point:** the MAIN world is not a security boundary. Several
controls in this codebase — the bridge token, the console session nonce, the decrypt hook —
are implemented as though it were.

### Assets

- Captured request/response bodies (up to 250 000 chars each), retained across origins.
- `Authorization`, `x-api-key` and similar headers, retained in a MAIN-world `_secretStore`
  (`content/interceptor.js:154`, capped at 300 entries) to support replay.
- Experiment plans persist a sanitized request body, but a run on the captured origin replays the
  captured request body itself: fields the plan shows as `[REDACTED]` go out with their real values
  (to that origin only — a retargeted run sends the sanitized plan).
- The `x-parse-token` header, which the extension treats as a decryption key and currently
  **exports to the panel** as `entry.parseToken`.
- Decoded JWT claims (`sub`, `email`, `tenant`, `scope`, …), extracted pre-redaction by
  design.
- The user's BYOK LLM API key.

---

## 2. What is solid

Worth stating plainly, because it is the strongest part of the codebase and should not
regress.

- **No injection sinks in first-party source.** A sweep for `innerHTML`, `outerHTML`,
  `insertAdjacentHTML`, `document.write`, `dangerouslySetInnerHTML`, `eval`, `new Function`,
  `createContextualFragment`, `srcdoc` and `javascript:` across `src/`, `content/`,
  `shared/`, `panel/`, `workers/`, `settings/`, `devtools/`, `background.js` and `window.html`
  found exactly one hit: `content/console-executor.js:130`, which is the console feature
  itself operating on user-typed code. Captured response bodies — attacker-controlled by
  definition — are rendered exclusively through React children and `textContent`.
- **The extension CSP has no `unsafe-eval`.** Its only `'wasm-unsafe-eval'` is scoped to
  extension pages, for SQLite-WASM on `sql.html` (see §5).
- **No `externally_connectable`**, so web pages cannot message the service worker directly.
- **Theme values reaching `style.setProperty` are strictly hex-validated**
  (`src/panel/models/customTheme.ts:34-50`). Checked specifically for `url()`-based CSS
  exfiltration; the validation holds.
- **`xray:console-eval` pins the target to `sender.tab.id`** rather than trusting a
  caller-supplied tab id (`background.js:536`).
- **Console command building is not injectable.** The context arrives from the panel as
  tagged JSON *text* (`panel/console.js` `_contextPayload`, spec J8), is parsed in the
  service worker (`background.js` `_consoleContextValue`) and reaches the page only as a
  `Runtime.callFunctionOn` argument value of ordered key/value pairs (`shared/console-scope.js`
  `encodeContext`) that the scope rebuilds with syntax only: context data is never
  interpolated as JS, nor as an object literal (whose `"__proto__":` set a prototype instead
  of a key), and the page's `JSON.parse` never sees it. The command text is the only source
  the run function (`planRun`) adds, after its marker line. Results come back as typed JSON
  text from the scope's encoder, parsed by the extension into data the panel renders as text.
  What a Run hands page-realm code is C-1 limit (b); see C-1 for what previews hand it.
- **A real regression suite pins several of these invariants**, including the
  no-`dangerouslySetInnerHTML` property.

---

## 3. Fixed in this branch

| ID | Issue | Fix |
|---|---|---|
| C-13 | `__xray_fetch_object__` listener in `content/console-capture.js` omitted the `event.source !== window` guard that every other listener has | Guard added, plus a regression assertion |
| C-7a | `__XRAY_CONSOLE_SESSION` was assigned unconditionally, so any page script could overwrite it and permanently wedge the console fallback | First-write-wins, mirroring the bridge-token handling in `content/content.js:113` |
| C-9 | The service-worker message router dereferenced `msg` with no guard and did not check `sender.id`, letting any content script drive `xray:page-bridge` against **any** tab | Sender validated against `chrome.runtime.id`; `msg` null-guarded; content-script senders forced to their own tab |
| C-5 | `storageBridge` fell back to the **page's** `localStorage` when `XRAY_Store` was absent, which could write the BYOK API key in plaintext into the visited site's storage | Fallback removed; reads return the caller's fallback and writes are dropped |
| C-4a | Redaction denylist missed many common auth headers | Denylist widened |
| C-2 | **High — replay secrets flowed through page-replaceable globals.** The replay path called `window.fetch` with the raw restored `Authorization` value in `init.headers`, so a page that re-wrapped fetch after `document_start` read it on every replay. `_originOf` and `_resolveUrl` parsed with the live `URL`, so replacing `window.URL` made `sameOrigin` true for any target | Replay calls our own wrapper by reference, keeping replays captured and diffed while taking the page out of the path. `URL` is pinned at `document_start`, and the origin gate is two independent checks, the second a plain string comparison that parses nothing |
| C-3 | **High — the bridge token is a MAIN-world global,** so every gate built on it is one property read from bypass, enabling forged entries, overwritten ids and rule injection | The token still filters accidents, but the isolated world now treats everything from MAIN as untrusted: entries are rebuilt field by field with typed, size-capped values, unknown properties cannot ride along, and an update naming an id this world never originated is dropped. The MessagePort channel is NOT done and stays open below |
| C-4b | **High — redaction was an anchored denylist over header names only.** URLs were captured verbatim, so `?access_token=`, `?sig=` and presigned-S3 credentials survived, were persisted, and were eligible for AI egress | Credentials are redacted out of query strings and the userinfo component at the single emit boundary, covering every capture path by construction. The unscrubbed URL joins the MAIN-world secret store so replay still works, restored only on an origin match and only when the operator did not edit the URL |
| C-6 | **High — the decryption hook lived in the page's global scope.** The stub returned `null` so nothing leaked yet, but the file exists to be filled in, and a page could then read what the closure captures, use it as an oracle, or replace it and feed the analyst fabricated plaintext marked `decryptStatus: 'ok'` | `content/decrypt-bridge.js` deleted. The interceptor marks entries `pending`; `content.js` resolves them in the ISOLATED world, which is exempt from the page's CSP, so the stated reason for MAIN-world placement never held |
| C-8 | **Medium — `debugger` was a required install-time permission,** close to the maximum-scrutiny configuration for store review, demanded whether or not the console was ever opened | **Reverted 2026-10-12 — required again.** It was moved to `optional_permissions`, but Chrome does not support `debugger` as an optional permission: it is ignored there, `chrome.permissions.request` rejects ("Only permissions specified in the manifest may be requested"), and `chrome.debugger` stays undefined — so console execution never worked, and a top-level `chrome.debugger.onDetach` call crashed the service worker before any listener registered. The debugger is the only execution path since C-1 deleted MAIN-world evaluation, so the install-time permission is the accepted cost. Listener registration is now guarded and attach still checks the permission |
| C-10 | **Medium — `web_accessible_resources` was over-exposed.** Any page could iframe `window.html`, where `window-main.tsx` reads `location.hash` and persists settings to `chrome.storage.local` | `window.html` and `dist/window-ui.js` dropped: the pop-out opens via `chrome.windows.create`, and the page loads its own bundle. `shared/console-helpers.js` dropped too, once the dynamic import went away |
| C-11 | **Medium — worker IndexedDB was unbounded** and, on the blob-worker fallback, written to the *visited site's* origin | Capped with oldest-first pruning over the `timestamp` index, plus `clearStored`; a page-origin worker refused to open IndexedDB at all. Since the JSON-fidelity final fix (M7) the worker keeps no IndexedDB cache — nothing wrote it after Task 6 and nothing read it — and its `init` deletes the `xray_db` database an earlier version left, on the extension's own origin only (a page-origin worker would see the visited site's databases), so no captured traffic stays on disk |
| C-12 | **Medium — the API key travelled too far.** The panel sent its whole AI settings object, key included, to the background on every call, so the key was resident in isolated-world memory on every page purely to be relayed | The service worker reads the key from `chrome.storage.local` itself and ignores anything the content script sends about credentials. The panel sends a prompt and nothing else |
| C-14 | **Low — console history lived in the page's `localStorage`,** so any site could read what the analyst typed on every other site. Rule regexes had no complexity bound, and rule sets are importable | History moved to extension storage. `re:` patterns are bounded by length and rejected when they contain a nested quantifier, the shape that makes catastrophic backtracking possible. Console completion recency (`console_completion_recency`, the last 200 accepted suggestion labels: helper names, JSON key names, captured endpoint paths without query, status codes) lives in the same extension storage under the same rule; a path segment can carry an ID, so it is cleared with Clear console (everything or my commands) |
| C-15 | **Low — the docked panel's shadow root was `mode: 'open'`,** so page script could read the rendered captured data through `.shadowRoot` | Closed. It was open only so `host.shadowRoot \|\| attachShadow(...)` could re-find it across re-mounts; an isolated-world module reference does that instead, exactly as the HUD has always done |
| C-1 | **Critical — the console handed cross-origin captured traffic to page-controlled code.** The debugger-evaluated expression read `window.XRAY_ConsoleHelpers`, a plain writable page global, so a page that replaced `createRuntime` received the whole console context — captured URLs across every origin in the restored session, full bodies for the selected entry and its neighbours, decoded JWT claims — as soon as the user ran any expression, including `1+1`. A second path posted the same context to the page with `targetOrigin: '*'` and no token | The helper source is inlined into the evaluated expression and run against a **shadowed `window`**, so the page global is neither read nor written. The MAIN-world fallback is deleted outright: `content/console-executor.js` is removed from the repo and the manifest, `panel/console.js` no longer posts a session handshake or an exec request, and a failed debugger attach now returns an error instead of falling back. **Console redesign (2026-10-12):** the evaluated context gained saved variables (`temp1`…, `$_`) and pinned requests. Both travel only when the command names them as an identifier (`panel/console.js` `_referencedScope` / `_referencedPins`); a pin travels as `{ id, value }` (the typed response body, spec J8) or `{ id, body }` (its text) — the response body only, never headers, cookies or token lenses — and pin names are restricted to `a`–`f` end to end (store, engine `setPins`, page runtime). A letter used as an arrow parameter (`rows.map(a => …)`) still ships that pin: over-inclusion, accepted. **Console round 2 (2026-10-18, persistent declarations; corrected after three reviews):** the helpers run once per tab in a scope created by `Runtime.evaluate(returnByValue: false)` (`shared/console-scope.js`, from the bundled source, against a shadowed, prototype-less `window`). Rules XRAY's own plumbing keeps, each pinned by a hostile page in real Chromium (`test/e2e/console-scope-attacks.e2e.mjs`, 15 vectors; RED against each earlier version, recorded in `output/console-round2/task-6/`): **(1) No sloppy frame:** every XRAY frame — the scope, its API, each command's run function and body — is strict and nothing uses `with`, so `Error.prepareStackTrace` callsites (`getThis`/`getFunction`) and `.caller` reveal nothing (the first version ran commands as `with (scope)` in a sloppy function and leaked the scope this way). **(2) No page-realm call on XRAY's own objects:** the scope is built with syntax only — prototype-less object literals, `in`, `for…in` over prototype-less objects, spread, direct calls of its own closures (the second version called page-realm `Object.freeze/create` and `Reflect.apply` on its internals, which a page wrapping them at load turned into a handle on the API, every declared value and the whole context). Its only member is `open(key)`, for a random key the worker keeps; the wrapper's own names in each command end in a random per-scope suffix, so user code can neither collide with them nor name the key; the global it assigns page globals on is the creation script's own `this`, never a page-replaceable `globalThis`. **(3) No result through a promise, no `then` read:** the command hands its value to a closure; the worker waits for the command's promise (it resolves to `undefined`) with `Runtime.awaitPromise`; whether the value is a promise is CDP's answer (`subtype: 'promise'` on its RemoteObject), and only such a native promise is awaited, by `Runtime.awaitPromise`; the answer is encoded by a separate call (nested promises flushed with `await undefined`) and read synchronously as a prototype-less record by value (earlier versions resolved result objects through promises and read `then` on the value, so an `Object.prototype.then` getter or a replaced `Promise.prototype.then`/`constructor` read and forged results: `1+1 → 1337`, any object → `"FORGED-THEN"`). Behaviour change: a non-native thenable is shown as the object it is, not awaited. **(4) Context in:** the worker parses the context text itself and sends, as a CDP argument value, only the members the command names — saved variables, pins and typed values by name, the selected entry or the entry list only when a named helper reads them; a command such as `1+1` sends nothing. Objects travel as ordered key/value pairs (Chrome passes argument objects as dictionaries with sorted keys and turns a `"__proto__"` key into a prototype) and are rebuilt by the scope with literals and spread. **(5) The encoder's natives are the scope's:** the result encoder and the thrown-value text use built-ins taken when the scope is created (`Object.getOwnPropertyDescriptor/getPrototypeOf/getOwnPropertyNames/keys/defineProperty`, `Array.isArray`, `Math.min/max`, `String`, uncurried `String.prototype.slice/indexOf/toLowerCase/charCodeAt`, `Array.prototype.indexOf`, Set/Map/WeakMap/WeakSet methods, Date and the web classes' getters), read descriptors as own fields only, write results with `defineProperty` and prototype-less descriptors, shape function and DOM text with string comparison only, and quote the JSON text with syntax only — so a page that patches built-ins *after* the scope exists cannot change what a result shows (pinned for `Object.getOwnPropertyDescriptor`/`getPrototypeOf`, `Object.keys`/`Array.isArray`, `String.prototype.slice` + `Math.min`, and `render`/`message`/`$xray` accessors on `Object.prototype`). CDP `replMode` stays rejected (its declarations land in the page's global lexical scope). **Accepted limits:** (a) on a page that patches built-ins at load, before XRAY's scope exists, the console output of computed values may be altered (the encoder took those patched natives); this never exposes the scope or context the command didn't name — a CDP-side encoder that removes it is a follow-up; (b) helpers the user names (`res`, `pick`, `$all()` …) and the user's own code run with page-realm built-ins and promise machinery, so a hostile page can observe or alter the data passing through those — the context members the command named, its own values, a promise it awaits (naming an entry helper such as `$url` ships the whole selected entry to that code); (c) the page's own iterator `next` for web-class entries (Headers, URLSearchParams, FormData) is called as it is at encoding time. **Live completion (console round 2, Task 7; rewritten in its fix round 1):** typing `<path>.` or a bare name asks the page through the same debugger session and scope (`xray:console-complete`, `background.js` `_completeConsoleInTab`), only while Settings → General → "Preview results while typing" is on, and typing attaches the debugger only after ≥ 2 non-space characters and a 150 ms pause — never on focus, and never again after the user cancelled Chrome's debugging bar until the next explicit Run. Only a plain path reaches the page (identifier, `.name`, `?.name`, `[n]`, a quoted key — never a call: a call's result completes from the static catalogue's return types), checked in the worker and in `shared/console-scope.js` (`livePath`, `planComplete`); no context travels (captured roots, pins and helpers are answered in the panel). **The typing path never creates a remote object of a page or declared value:** CDP describes an Error value by formatting its stack through the page's `Error.prepareStackTrace`, with full rights, so the first version — which evaluated the path and listed names with `Runtime.getProperties` — handed declared values to page code (`rows.items.` with an `Object.prototype.items` getter returning an Error built from `this`; a declared Error; an Error-valued global; review probes, now attack vectors). Instead a strict function on the scope hands the path, as data, to the scope's `walk`, which runs IN THE PAGE with descriptor reads only, using `Object.getOwnPropertyDescriptor/getPrototypeOf/getOwnPropertyNames`, `Reflect.apply`, `Function.prototype.toString` and `Object.prototype.hasOwnProperty` taken when the scope was created and checked by their source text (one replaced before that turns the walk off): it follows data properties only — an accessor ends the walk, so **no page getter runs** (the list then says "getter — not evaluated"), and an Error's `stack` is never read whatever its shape — reads a declared root from the scope and a top-level `let`/`const`/`class` root as the binding first (the worker knows those names; no page code runs to read a binding), lists own and inherited names the same way and answers one string built by concatenation, read with `returnByValue`. **Listing bounds:** an array with items, a typed array or an array-like longer than 3,000 is never asked for its own names (no index name is built — an Emscripten heap once froze the page for seconds; its `length` is listed instead); a smaller array-like's indices are skipped without counting; otherwise at most 500 names and 3,000 scanned; `__proto__` and symbols skipped; a function's parameter list from its source, ≤ 200 characters; no source text leaves the page. The page globals are the real global object's own names — all of them, page names first, never cut silently (a hard bound of 5,000 marks the answer capped, and a capped or stale list never relaxes Enter) — (that listing runs no page code; it is not run under the side-effect check because V8 counts the lazy creation of built-ins such as `Temporal` as one) plus `Runtime.globalLexicalScopeNames` (strings). A path walk runs with `throwOnSideEffect`. **Nothing is terminated on the typing path** (the first version's 250 ms `terminateExecution` cut the page's own running task when the page was busy): with no answer at 250 ms the worker answers "unknown", abandons the call (its object group released when it settles) and asks nothing for 5 s (only a timeout backs off; a Run, a navigation, a detach or the tab's close ends it); a scope creation started by typing is abandoned the same way. At most one abandoned walk is pending per tab (it stays tracked until it settles; no second walk is sent meanwhile). An explicit Run waits up to 500 ms for it and never terminates it — what holds a walk back may be the page's own task, which a terminate would cut; a walk that has not started skips itself past its deadline, and one hung inside a Proxy trap holds the Run until the Run's own cap. **Deadlines (rounds 3–4):** every run and walk function the worker sends carries its deadline (the worker's clock, the same machine clock as the page's) and reads the time with a `Date.now` taken when the scope was created and checked by its source text like the other natives; one the page could only start after its deadline — because something held the main thread past the cap — runs nothing and says so: the cell reads "Not run: the page was busy for more than 10 s", and the command never *starts* later. At the cap (plus 100 ms) the worker sends `Runtime.terminateExecution`, which stops whatever is running then — the user's own looping command ("Execution timeout (10s)"), a page task, or a walk stuck in a Proxy trap — so a Run held back by it starts late and skips itself. A command that did start in time and is still awaiting at the cap reports the timeout while its awaited continuation may still finish in the page (as before). **Accepted:** on a page that replaced `Date.now` before XRAY's scope existed (test clocks: MockDate, fake timers, `page.clock`), XRAY never calls it and the guard is off — a Run the page delays past the cap may still execute after its timeout was reported. **Listing cost:** the 3,000-name scan cap bounds the answer's size, not its time: `getOwnPropertyNames` on a plain object with about a million own keys still costs the page's main thread up to a second or more per walk (abandoned at 250 ms, then a 5 s back-off). The panel receives names, kinds and parameter lists only. Pinned by `test/e2e/console-scope-attacks.e2e.mjs` (typing-path vectors RED on the first version: Error getter on a declared value, declared Errors, Error-valued globals, a busy page's own task, 300,000 globals with a 30 MB function — bounded answer; live vectors: window getter with a side effect, Proxy globals, `Object.prototype`/`Function.prototype` getters incl. `Symbol.toStringTag`, natives wrapped at load — walk off — and after the scope exists, a throwing getter under a page `prepareStackTrace`, an endless getter, a getter that would try a side effect). **Accepted:** (i) a Proxy reached on the walk (a page global that is one, or one in a prototype chain) runs its own `getOwnPropertyDescriptor`/`getPrototypeOf`/`ownKeys` traps under V8's side-effect check — they receive only the proxy's own target and the key name typed, cannot write, a trap that tries is refused with an `EvalError` that reaches the page's `Error.prepareStackTrace` with no call sites (vector `proxyObserved`), and a trap that never returns is abandoned, never terminated (the page freezes on its own trap). A trap is also a timing channel: it learns, by running, that a completion touched its proxy and which key was typed, and can tell its own page so later by how long it ran (120–270 ms observed with a spinning trap) — it cannot write while it runs; (ii) natives replaced before the scope existed by wrappers that also fake `Function.prototype.toString` pass the source check, and would then see the values the walk reads (the same load-time limit as (a) for Runs). **Eager preview (console round 2, Task 8; `xray:console-preview`, `background.js` `_previewConsoleInTab`):** with the same setting, session, scope and attach rule as live completion, a draft that is one complete expression is evaluated while the user types. **What is sent:** only a draft the panel (`models/consoleEager.ts` `previewEligible`) and the worker (`shared/console-scope.js` `previewable`) both accept — at most 2,000 characters, no `await`, no loop (`for`/`while`/`do`: one could spin, and the typing path never terminates), no `super`/`import`/`new.target`, no statement or declaration at its start, no `{` at its start, no `;`, assignment, `++`, `--` or `delete` at depth 0, every literal and bracket closed, every number and regular-expression literal valid (a regex is compiled in the extension first: an invalid one's message quotes its whole source), no unmatched `:`, no two values side by side — and every template substitution `${…}` checked the same way, recursively (fix round 1: a loop or a non-compiling token inside one used to slip through). What would not compile is never sent: CDP describes a `SyntaxError` through the page's `Error.prepareStackTrace` (and `Runtime.compileScript` does too, spike `output/console-round2/task-8/spike2.mjs.txt`, `spike3.mjs.txt`), and its message can quote a token of the draft (`Unexpected identifier 'other'`); a draft that passes both checks and still does not compile is the residual (the same message a Run of it would give the page on Enter). **The context never travels on the typing path** (fix round 1, ruling option C): the first version sent the members a draft named in a call of their own, outside the side-effect check, which revived them with page-realm built-ins — a page that wrapped `JSON.parse`, `String.prototype.trim`, `Array.isArray` or `hasOwnProperty`, at load or after the scope existed, received the selected entry (cross-origin URL, body) and, for `errors`/`all`, the whole entry list, and could write it anywhere, just from typing (review Critical 1; regression vectors `helpersAtLoad`/`helpersLater`, RED `output/console-round2/task-8/fix1-red-context.txt`). Now no call on the preview path carries or refreshes context. A draft that names context members (`res`, a helper, `$…`, a saved variable, a pin) reads only what the user's last explicit Run revived in the scope, and only while each member is still the current one: the worker keeps, per tab and scope, a digest of each member that Run named and compares it with the digest of the same member in the context text the panel sends with the preview (it goes to the worker only — never to the page); no Run since, another selection, a changed pin or saved variable, a member the Run did not name, or a Run that never began → no page preview (the panel's captured-data fast path still answers plain paths). Only an explicit Run sends or revives context members. **Previews over revived or declared values (final review I-1, corrected):** a page preview of a draft over values the user's last Run revived, or the user declared (`res.users.map((u) => u.id).length`; after `const users = res.users`, `users.map(…)`), runs page-realm built-ins and prototypes on those values under the side-effect check: revived objects and arrays carry the page realm's `Object.prototype`/`Array.prototype`, so a page that patched `Array.prototype.map` after the scope existed, a page getter reached by a missing key, or a page `valueOf`/`toString`/`Symbol.toPrimitive` reached by coercion receives them while the user types, before any Enter. A hostile page can measure them — it chooses how long its code runs from what it reads, about one byte per preview (85 ms observed for a char code of 83): a timing channel of the same class as limit (i). It cannot write: no page global, no array, no storage, so it keeps no copy (a patch that tries is refused and the preview shows nothing; vectors `mapComputes`, `mapWrites`, `protoWrites`), and the data is limited to what the user's last Run revived or the user declared. Turning off "Preview results while typing" removes it. **How it runs:** a strict function on the scope (`planPreview`) binds the scope names the draft uses as locals (nothing is written back) and evaluates the draft in a strict inner function (`this` undefined) under `throwOnSideEffect` — the draft itself may call the page's side-effect-free functions and getters, which is what eager evaluation is (DevTools does the same); anything V8 counts as a side effect (`localStorage.setItem`, `fetch`, creating a promise) is refused with an uncatchable `EvalError` and shows nothing. **No remote object of a page or declared value:** the value — or what the draft threw, caught in the page — goes to the scope's own projector (`preview`/`thrown`), which builds typed-model text with concatenation from own descriptors only (an accessor is `(…)`, never invoked; an Error's `name`/`message` by descriptor, `stack` never), with natives read from the real global by descriptor when the scope is created and checked by their source text (one replaced before that turns the preview off), brand checks by the engine's own accessors (Map/Set `size` and iterators, typed-array `length`, Date `getTime`, Node `nodeType`/`nodeName`) or by prototype identity (a typed array's name; a RegExp, whose flag getters run only once it is known to be one — on anything else V8 refuses them) — never `then`, never `Symbol.toStringTag`, never the page's `JSON` — first 5 members, one level deep; the answer is read with `returnByValue`. There is no `returnByValue: false` and no `generatePreview` (the spec's first design: CDP formatted a declared Error through the page's `prepareStackTrace`, which received `SECRET-ERR` — RED `output/console-round2/task-8/red-spec-design.out.txt`). **Nothing is terminated:** the call carries its deadline (skipped past it); with no answer at 300 ms it is abandoned (object group `xray-preview` released when it settles), becomes the tab's one pending typing call (shared with completion walks: nothing more is sent until it settles), typing backs off 5 s, and an explicit Run waits up to 500 ms for it, as for a walk. **Accepted:** (iii) a draft with a side effect reaches the page's `Error.prepareStackTrace` as V8's bare `EvalError: Possible side-effect in debug-evaluate` with no call sites (vector `sideEffectFrames`): the page learns that a preview with a side effect was attempted and when, never what was typed, the scope, the context or a declared value; (iv) because only natives V8 lets run under its check are used, some values preview less than a Run shows them: a promise is `Promise {…}` (its state is never asked), a regular expression `/…/gi` (the `source` getter is refused), an element `<div>` (no id/class: `localName`/`id`/`getAttribute` are refused), the global object `Window {…}`; an object literal with a `get`/`set` accessor is never sent (V8 refuses defining one under its check, so it could only hand the page a bare `EvalError`), while a value that already has accessors lists them as `(…)` after its data members, as a Run does; a value V8 refuses to project shows nothing; (v) a draft that calls a slow side-effect-free function (the page's or the user's own, e.g. `fib(45)`) blocks the page's main thread until it returns: the typing path never terminates, and `callFunctionOn` has no timeout — turning off "Preview results while typing" removes it. Proxy traps reached by the projector are limit (i) (`getPrototypeOf`/`ownKeys`/`getOwnPropertyDescriptor`; never `get`/`has`/`apply`). Pinned by `test/e2e/console-scope-attacks.e2e.mjs` (preview vectors: Error values and a declared Error under a page `prepareStackTrace`, refused side-effect call sites, `Object.prototype` getters on result objects, a Proxy result, a page `Promise.prototype.then` and `Object.prototype.then`, natives patched after the scope exists and at load, a busy page's own task; fix round 1: the helpers' built-ins wrapped at load and after the scope exists, with previews of `res.users.length * 2`, `entry.url.length + 0`, `errors.length + 0` before and after a Run — the page sees nothing and writes nothing; final review I-1: drafts over revived and declared values with `Array.prototype.map`, an `Object.prototype` getter and `toString` patched after the scope exists — no write and no stored copy) and `test/e2e/console-live.e2e.mjs`. |
| C-16 | **Command injection in "Copy as cURL".** `generateCurl` interpolated `entry.url` raw into a single-quoted shell word while the header and body sites two lines below escaped correctly. A page issuing `fetch("https://x.test/a';id;echo'")` produced a command that ran `id` when pasted — the WHATWG parser does not percent-encode an apostrophe in a path or query, and imported HAR files are a second unfiltered source. The method was interpolated bare as a second injection point. The panel's `utils.ts` fallback had the same class of bug via `JSON.stringify`, whose double quotes still permit `$(...)` | Both routed through one POSIX single-quote helper |

See the commit history on `enterprise-hardening` for the exact changes.

---

## 4. Open findings

Everything previously listed here is fixed and has moved to section 3. What remains is
the one piece of C-3's direction that was deliberately not taken.

### C-3 (channel) · Open — the bridge is still `postMessage`, not a `MessagePort`

C-3 suggested handing a `MessagePort` to the MAIN world once at `document_start` and
closing over it instead of storing a token on `window`. That is not done, and it is not a
clean win: `event.ports` is readable by every listener on the event, and `postMessage` is
asynchronous, so a page script that registers a listener before the queued transfer
arrives takes the port too. Content scripts at `document_start` run before the page's own
scripts, but the *delivery* of the transfer is not similarly ordered.

The mitigation that does hold regardless of channel is in place: the isolated world
validates every MAIN-world message as untrusted input. Blinding (a page posting a config
that disables capture) remains possible and is the residual risk here.

## 5. Permission justification

Required for a Chrome Web Store listing, and worth keeping honest. The
submission-ready wording lives in [store-listing.md](store-listing.md).

| Permission | Why | Reducible? |
|---|---|---|
| `storage` | Panel preferences, traffic rules, session persistence, BYOK settings | No |
| `scripting` | Injecting the panel and HUD on demand | No |
| `activeTab` | Toolbar-triggered activation | No |
| `clipboardWrite` | Copy-as-cURL and export actions | No |
| `debugger` | CDP `Runtime.evaluate` for console execution on CSP-strict sites | Required (Chrome cannot make `debugger` optional — see C-8) |
| `windows` | The pop-out window | No |
| `<all_urls>` | Capture is the product; it cannot know in advance which origins matter | No, but see C-14 on scoping *retention* |
| CSP `'wasm-unsafe-eval'` (`extension_pages` only) | Lets SQLite-WASM compile in the SQL client's worker on `sql.html`. It does not apply to content scripts or to any web page, and allows no JS `eval`. `dist/sql-ui.js`, `dist/sql-worker.js` and `dist/sqlite3.wasm` are deliberately not web-accessible, so no page can load them; `sql.html` is, through its dynamic URL only, for the opt-in inline HUD (next row) | No, while the SQL client runs SQLite in the browser |
| `web_accessible_resources`: `sql.html`, `use_dynamic_url: true`, `<all_urls>` | Lets the HUD frame the SQL client inline when the user turns on **Show SQL client inside the page HUD** (`sqlInlineInHud`, **off by default**). The page cannot read the cross-origin frame or the rows it shows. The resource is exposed whether or not the option is on, so treat it as: any site can embed the client. Chrome denies the static `chrome-extension://<id>/sql.html` URL to pages and serves only the per-session dynamic one, which the HUD keeps in its closed shadow root (it did not show in the page's `window.frames` or Resource Timing, observed on Chromium 151), but that is defence in depth, not a boundary. With the option off, sql.html refuses to run under a web origin (`location.ancestorOrigins`): it shows a notice and loads no stored SQL state, so the exposure is live only while the user has opted in. Framed inside a web page, the client offers SQLite files only: the service worker refuses `profiles.*`, `connect`, `profiles.test` and `helper.status` from a port whose `sender.tab` is a web page, and the page shows an **Open in window** link instead of Connect and saved connections (unless the separate opt-in in the next row is on). Clickjacking the client then still requires the user to pick a file. Readiness is relayed through the extension runtime (sql.html → service worker, which checks the sender is a `chrome-extension:` `/sql.html` frame in a tab → the tab's top frame); nothing is posted to the page's window, so the page gets no `WindowProxy` to the frame and cannot swallow the signal. Once framed, the HUD keeps the frame until it is reopened, even if the option is turned off. Only `sql.html` is listed: its bundles, worker and wasm are loaded by the extension-origin document. A page's `frame-src` CSP does not block the frame (observed on Chromium 151); if it ever fails to load, the HUD falls back to the window after 4 s | Yes: drop the entry and the option, leaving the window |
| Setting **Allow saved database connections in the page HUD** (`sqlDatabasesInHud`, **off by default**, effective only with `sqlInlineInHud` on) | Lets the HUD's inline client use saved Postgres/MySQL profiles and the helper (section 6). Off, a `sql.html` whose port's `sender.tab` is a web page is refused `profiles.*`, `connect`, `profiles.test` and `helper.status` by the service worker ("Database connections open in the XRAY window, not inside a web page."), and the page hides Connect and saved connections behind an **Open in window** link. On, the exposure grows: the page still cannot read the cross-origin frame, its rows or any password, but it can overlay or reposition it to trick the user into clicking Connect, a saved connection or Run (clickjacking). Turning it on asks for confirmation with that warning. Both options live in a key the service worker owns (`sql_hud_options`, Ruling M3-R28): it changes them only on a runtime message from an extension page outside a web tab (the options page, DevTools, the pop-out, `sql.html` opened directly), so the in-page panel, which runs in the web page's tab, shows only a link to the options page. Values stored in the panel's preferences before the move are migrated once. A content script can still write `chrome.storage.local` itself, so this is defence in depth against a confused or hijacked panel UI, not against a compromised content script. The worker reads both options each time a client connects its port, so turning either off applies from the client's next load. Connections still open read-only by default and passwords stay in the worker | Yes: leave it off (the default) |
| `nativeMessaging` (`optional_permissions`) | Lets the service worker start `xray-db-helper`, the native host that connects the SQL client to Postgres and MySQL (section 6). It is optional: `sql.html` requests it on the first **Connect** or **Test connection** to a Postgres/MySQL profile, a user gesture, so users who only open SQLite files never grant it. Chrome starts only hosts whose manifest lists this extension in `allowed_origins` | Already optional; drop it together with Postgres/MySQL support |

---

## 6. Database connections and the native helper

The SQL client reaches Postgres and MySQL through `xray-db-helper`, a Go native-messaging host
installed separately ([helper/README.md](../helper/README.md)). Three parts are involved. The page
(`sql.html`) holds the editor and grid. The service worker's connection manager
(`background/sql-manager.js`) holds profiles and secrets and owns the native port. The helper holds
the database connections.

### Assets

- **Database passwords.** They are typed into the connection dialog or the password prompt, or
  pasted inside a connection string.
- **Query results**, and the schema the rail lists.

### Where secrets live

- A saved password lives in `chrome.storage.local` under `sql_connections`, with its profile.
- With **Save password** off, the password lives in `chrome.storage.session` under
  `sql_session_secrets`, so it is gone when the browser closes. `chrome.storage.session` is
  available to trusted extension contexts only. The extension never calls `setAccessLevel` on it,
  so content scripts cannot read it.
- Stored database passwords are not encrypted at rest; encryption without a user passphrase would only look like protection.
  Anyone who can read the browser profile on disk can read them. That is the same exposure as
  the BYOK API key and every saved browser password without an OS keychain.
- **Only the service worker reads secrets.** The page refers to profiles by id, and
  `profiles.list` returns `hasSavedPassword` instead of the password. A password typed into the page
  goes to the worker once and is not kept in page state. The paste box empties as soon as it has
  filled the fields.
- **The port sender check.** The worker accepts an `xray-sql` port only when `sender.id` is this
  extension and `sender.url` is a `chrome-extension:` URL whose path is `/sql.html` (C-9). Content
  scripts and other extension pages cannot drive it.
- **A stored secret is bound to its server.** The binding is engine, host (trimmed and lowercased),
  port and user (M3-R24). Editing a profile to point at another server drops the saved password,
  and the next connect asks for one. `profiles.test` uses the stored secret only when all four
  match the saved profile, and it stores nothing: no profile, no secret. A password typed into the
  prompt is stored only after a successful connect, and only if the profile still points at the
  server it was used for. So an edit made while a connect is in flight cannot move a password
  to a new host.
- The helper receives the password only inside `connect`. It never logs, persists or echoes it, and
  connect errors carry fixed text or server text. MySQL error text is scrubbed of the password
  when it is 4 or more characters long, matched as a whole token.

### The helper boundary

- **Who can start it.** Chrome starts the helper only for the origins in its host manifest's
  `allowed_origins`, which lists only `chrome-extension://kjfoocnkoajdcjabnadfojdfaghpbeep/`. Web
  pages and other extensions cannot reach it. The helper never listens on a network port.
- **What it accepts.** It accepts a fixed set of operations: `hello`, `ping`, `connect`,
  `introspect`, `execute`, `fetchMore`, `cancel`, `closeTab` and `close`. Requests are decoded strictly: an unknown op or an
  unknown field is refused with `bad-request`, and incoming frames are capped at 64 MiB. A panic
  in a handler answers `internal` and does not take down the process.
- **What it logs.** stderr carries only error codes. Secrets, SQL text and results are never logged.
- **How it is installed.** The installers download the release binary, check it against the
  release's `SHA256SUMS`, and refuse to install on a mismatch. Downloads use `curl --proto '=https'
  --tlsv1.2`. Everything is installed per-user, and an upgrade copies then renames, so it never
  leaves a half-written binary.
- **Lifetime.** When no `sql.html` page and no session is left, the worker closes the native port
  after 30 s and Chrome stops the helper. A cursor left unread for 60 s is closed (ending its
  read-only transaction and the locks it holds), and closing an editor tab closes its connection.
- **Who can reach saved connections.** Only extension pages: the worker refuses the
  saved-connection ops from a `sql.html` framed inside a web page unless the user turned on both
  HUD options (section 5).
- **Result size.** The worker counts each request's assembled rows; past 32 MiB it cancels the
  query and answers "Result too large; lower the row limit.", so a result never exceeds what a
  port message can carry.

### TLS

- `require` is the default for every host that is not loopback. `verify-full` checks the
  certificate and host name, with an optional CA file.
- `disable` is accepted only for loopback hosts (`localhost`, `127.0.0.0/8`, `::1`). Both the
  dialog and the helper enforce this. The refusal reads "This server is not on this computer, so
  XRAY requires TLS. Choose Require or Verify full."
- The secret binding above ignores TLS settings. A kept secret can therefore travel unencrypted
  only to the same loopback server it is bound to.

### Read-only

New connections are read-only. **Read-only is accident protection, not an authorization boundary**
(M3-R9). It stops a mistyped `UPDATE`, not a user or server set on writing. Use a database role
without write grants when writes must be impossible.

- **Postgres.** Each statement runs inside `BEGIN TRANSACTION READ ONLY` and is rolled back. The
  helper's keyword guard refuses statements that could end or change that transaction (BEGIN,
  START, COMMIT, END, ROLLBACK, ABORT, SAVEPOINT, RELEASE, SET, RESET, DISCARD, PREPARE, LOCK,
  COPY). It fails closed: a statement that does not start with a word is refused. A read-only
  transaction does not stop everything:
  - `dblink`/`dblink_exec` writes over a second connection.
  - `COPY … TO PROGRAM` as a superuser (through a function or a DO block).
  - Advisory locks.
  - `pg_cancel_backend` and `pg_terminate_backend`: they are plain function calls, so they pass
    the guard and the read-only transaction, and stop other sessions' queries or connections when
    the role is allowed to (superuser, the same role, or `pg_signal_backend`).
  - Any side effect a function performs outside the transaction.

  The database itself still blocks ordinary writes inside the transaction, including writes
  made by functions.
- **MySQL.** There are several layers (M3-R12, M3-R15):
  - Read-only connections set `transaction_read_only = ON` for the session. The setting is
    re-asserted after a redial.
  - Each statement also runs inside `START TRANSACTION READ ONLY` and is rolled back.
  - A fail-closed, engine-aware keyword guard runs before the server sees the statement.

  Read-only also refuses:
  - `CALL`, because procedures can commit (M3-R13).
  - `KILL`.
  - Any executable comment (`/*!…*/`, `/*!NNNNN …*/`, and `/*M!…*/` on MariaDB), because these
    could hide a different statement from the guard (M3-R15).
  - `INTO OUTFILE` and `INTO DUMPFILE`, matched on a normalised token stream, because they write
    files on the database server even in a read-only transaction (M3-R16, M3-R17). That write
    also needs the FILE privilege, so on a hardened account the server refuses it too.
- **Extension pre-check.** Before anything is sent, the page's classifier refuses writes on a
  read-only connection and asks for confirmation before dangerous statements (such as DROP, or an
  UPDATE without WHERE) on a writable one.
- Turning Read-only off reconnects in read-write mode. Each statement then commits as it runs,
  unless the user opens a transaction with BEGIN (or, on MySQL, autocommit is off). The helper
  reports such an open transaction (`inTransaction`, on results and on errors), and the page asks
  before anything that would end the session or the tab with one open (the Read-only switch, another
  connection, opening a file, closing the tab or the page). What each engine guarantees about a
  transaction lost anyway:
  - **Postgres.** The transaction state is the server's (`TxStatus`). A COMMIT or END of a failed
    transaction answers the tag ROLLBACK and is reported as the error "The transaction had failed and
    was rolled back." The first statement after the tab's connection was lost inside a transaction
    fails with "…the open transaction was rolled back." instead of running. A cursor left open
    inside the user's transaction is drained, not cancelled, before the next statement. That drain
    has no bound: a huge result keeps the next statement waiting until the user presses Stop, and
    the Stop aborts the transaction, which the COMMIT then reports as the failed-transaction error.
  - **MySQL.** The state is tracked by the helper from the statements: BEGIN/START TRANSACTION,
    COMMIT/ROLLBACK (with AND CHAIN and ROLLBACK TO), implicit-commit statements, and `@@autocommit`
    read at connect and after any statement that mentions it. Turning autocommit on counts as a
    commit only when it was off. A deadlock's rollback makes the next COMMIT an error, and a
    connection lost inside a tracked transaction is reported on the next statement. So is one
    dropped because `@@autocommit` could not be read again. A cursor in a transaction is stopped with KILL QUERY, which ends only that statement.
    Not covered: a transaction the server rolls back after another kind of error, which is then
    reported as still open until COMMIT or ROLLBACK (whose COMMIT succeeds on nothing).

### Stored SQL text

Editor tabs and history are kept per connection in `chrome.storage.local` (SQL text only, never
rows), bounded to 4 MB across 50 connections. A page being closed leaves its unsaved changes in the
extension origin's `localStorage` until the next SQL page folds them in. Writes merge per connection
under a Web Lock. The HUD's inline frame sits under a web page, where that lock may be partitioned
from the extension pages' (accepted, M1): two writes in the same moment can still lose one page's
latest change. The page itself cannot read the frame's storage.

### Results

Query results stay in `sql.html`. They are not added to the captured session, so they are never
sent to the AI features and never appear in XRAY's session exports. The grid's Copy, CSV, JSON
and INSERT actions copy only what the user chooses, to the clipboard.

### Residual risks

- **Any local process can start the helper** by running the binary. It would hold no credentials,
  though: the helper stores nothing, and passwords exist only in the browser profile. A local
  process that can already read the profile can read them directly.
- **Side-effect functions inside a read-only transaction** are still blocked by the database for
  ordinary writes. Effects outside it (dblink, `COPY TO PROGRAM`, advisory locks) are not, as
  listed above.
- **Passwords are not encrypted at rest** (see above).
- **A malicious or compromised database server** controls the result text and the schema names it
  returns. The grid and rail render them as text only (section 2: no injection sinks), and values
  are capped in size.

---

## 7. Reporting a vulnerability

See [SECURITY.md](../SECURITY.md).
