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
- **The extension CSP has no `unsafe-eval` and no `wasm-unsafe-eval`.**
- **No `externally_connectable`**, so web pages cannot message the service worker directly.
- **Theme values reaching `style.setProperty` are strictly hex-validated**
  (`src/panel/models/customTheme.ts:34-50`). Checked specifically for `url()`-based CSS
  exfiltration; the validation holds.
- **`xray:console-eval` pins the target to `sender.tab.id`** rather than trusting a
  caller-supplied tab id (`background.js:536`).
- **`_buildConsoleExpression` string-building is not injectable.** The context is
  `JSON.stringify`d into a JS expression position, and identifier names are filtered by
  `VALID_CONSOLE_NAME`.
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
| C-8 | **Medium — `debugger` was a required install-time permission,** close to the maximum-scrutiny configuration for store review, demanded whether or not the console was ever opened | Moved to `optional_permissions` and checked before every attach. C-8 also proposed preferring MAIN-world evaluation with the debugger as fallback; that half is **superseded by C-1**, which deleted MAIN-world execution outright |
| C-10 | **Medium — `web_accessible_resources` was over-exposed.** Any page could iframe `window.html`, where `window-main.tsx` reads `location.hash` and persists settings to `chrome.storage.local` | `window.html` and `dist/window-ui.js` dropped: the pop-out opens via `chrome.windows.create`, and the page loads its own bundle. `shared/console-helpers.js` dropped too, once the dynamic import went away |
| C-11 | **Medium — worker IndexedDB was unbounded** and, on the blob-worker fallback, written to the *visited site's* origin | Capped with oldest-first pruning over the `timestamp` index, plus `clearStored`. A page-origin worker now refuses to open IndexedDB at all; the guard keys on the worker's actual origin, so it holds whichever way Chrome resolves the direct path |
| C-12 | **Medium — the API key travelled too far.** The panel sent its whole AI settings object, key included, to the background on every call, so the key was resident in isolated-world memory on every page purely to be relayed | The service worker reads the key from `chrome.storage.local` itself and ignores anything the content script sends about credentials. The panel sends a prompt and nothing else |
| C-14 | **Low — console history lived in the page's `localStorage`,** so any site could read what the analyst typed on every other site. Rule regexes had no complexity bound, and rule sets are importable | History moved to extension storage. `re:` patterns are bounded by length and rejected when they contain a nested quantifier, the shape that makes catastrophic backtracking possible |
| C-15 | **Low — the docked panel's shadow root was `mode: 'open'`,** so page script could read the rendered captured data through `.shadowRoot` | Closed. It was open only so `host.shadowRoot \|\| attachShadow(...)` could re-find it across re-mounts; an isolated-world module reference does that instead, exactly as the HUD has always done |
| C-1 | **Critical — the console handed cross-origin captured traffic to page-controlled code.** The debugger-evaluated expression read `window.XRAY_ConsoleHelpers`, a plain writable page global, so a page that replaced `createRuntime` received the whole console context — captured URLs across every origin in the restored session, full bodies for the selected entry and its neighbours, decoded JWT claims — as soon as the user ran any expression, including `1+1`. A second path posted the same context to the page with `targetOrigin: '*'` and no token | The helper source is inlined into the evaluated expression and run against a **shadowed `window`**, so the page global is neither read nor written. The MAIN-world fallback is deleted outright: `content/console-executor.js` is removed from the repo and the manifest, `panel/console.js` no longer posts a session handshake or an exec request, and a failed debugger attach now returns an error instead of falling back |
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
| `debugger` | CDP `Runtime.evaluate` for console execution on CSP-strict sites | Done: it is in `optional_permissions` and requested on demand |
| `windows` | The pop-out window | No |
| `<all_urls>` | Capture is the product; it cannot know in advance which origins matter | No, but see C-14 on scoping *retention* |

---

## 6. Reporting a vulnerability

See [SECURITY.md](../SECURITY.md).
