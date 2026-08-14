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
| C-16 | **Command injection in "Copy as cURL".** `generateCurl` interpolated `entry.url` raw into a single-quoted shell word while the header and body sites two lines below escaped correctly. A page issuing `fetch("https://x.test/a';id;echo'")` produced a command that ran `id` when pasted — the WHATWG parser does not percent-encode an apostrophe in a path or query, and imported HAR files are a second unfiltered source. The method was interpolated bare as a second injection point. The panel's `utils.ts` fallback had the same class of bug via `JSON.stringify`, whose double quotes still permit `$(...)` | Both routed through one POSIX single-quote helper |

See the commit history on `enterprise-hardening` for the exact changes.

---

## 4. Open findings

**None of the following are fixed.** They need design decisions and live-browser
verification. They are ordered by remediation priority.

### C-1 · Critical — the console hands cross-origin captured traffic to page-controlled code

`panel/console.js:111-137` builds a context containing the selected entry in full, full
bodies for up to 10 same-endpoint neighbours, and up to 300 slim entries **whose URLs
include query strings**. Because the session is restored from `chrome.storage.local` on
*every* origin, that is not limited to the current site.

It reaches the page two ways:

- **Privileged path (default).** `background.js:131` evaluates, in the page's MAIN world,
  an expression that reads `window.XRAY_ConsoleHelpers` — a plain writable page global. A
  page that replaces `createRuntime` receives the entire context.
- **Fallback path.** `panel/console.js:180-186` posts the whole context with
  `targetOrigin: '*'`, with no token and no nonce.

A page needs one `window.addEventListener('message', …)` plus one property assignment to
capture URLs across every site in the session, full bodies for the selected entry, decoded
JWT claims, and `parseToken` values — as soon as the user runs any console expression,
including `1+1`.

*Direction:* never put the console context in the page world. Evaluate helpers in the
isolated world and pass results back, or inline the helper source into the evaluated
expression instead of reading it off `window`. Delete the fallback path.

### C-2 · High — replay secrets flow through page-replaceable globals

The origin-pinning logic at `content/interceptor.js:861-863` is logically correct but runs
in a hostile realm:

- `interceptor.js:892` calls `window.fetch(url, init)` where `init.headers` holds the
  **raw restored `Authorization` value**. A page that re-wraps `window.fetch` reads it.
- `_originOf` and `_resolveUrl` use the global `URL`. Replacing `window.URL` makes
  `sameOrigin` true for any target.

This is an escalation rather than a wash: `_secretStore` retains auth headers from requests
made *before* an attacking script loaded, so a late-injected script or an XSS payload can
reach historical bearer tokens it could not otherwise have captured.

*Direction:* pin `_origFetch` and `_URL` at `document_start` and use them exclusively on
the secret-bearing path; re-validate the final URL with a plain `startsWith` that does not
depend on `URL`. Consider dropping `_secretStore` — the retention is what creates the asset.

### C-3 · High — the bridge token is not a secret

`window.__XRAY_BRIDGE_TOKEN__` is a MAIN-world global. Every gate built on it is one
property read from bypass. Consequences:

- **Blinding.** A page can post a config disabling `captureFetch`/`captureXhr`/`captureWs`.
  For a traffic-inspection tool, silently turning capture off is the highest-value attack
  available, and the UI gives no indication.
- **Poisoning.** Forged entries enter the store, session persistence, the DevTools relay
  and IndexedDB — or overwrite real entries by reusing an `id`.
- **Rule injection**, including a catastrophic-backtracking `re:` pattern evaluated against
  every request URL.

The extension is also trivially fingerprintable (`__XRAY_BRIDGE_TOKEN__` is
non-writable/non-configurable — a very reliable signal), so detect-then-blind is easy.

*Direction:* hand a `MessagePort` to the MAIN world once at `document_start` and close over
it rather than storing a token on `window`. Regardless of the channel, **validate every
MAIN→ISOLATED message as untrusted input**: check entry shape and types, cap sizes, and
reject updates for ids the isolated world did not originate.

### C-4b · High — redaction is an anchored denylist over header *names* only

`content/interceptor.js:26` covers nine exact names. Widened in this branch, but the
structural problem stands:

- A denylist cannot cover bespoke schemes, and the `^…$` anchoring lets near-misses like
  `x-api-key-v2` through.
- **URLs are verbatim.** `?access_token=`, `?sig=`, presigned-S3 credentials all survive.
- **Bodies are unfiltered**, up to 250 000 chars.
- **JWT claims leave by design**, and are then persisted and can be sent to a third-party LLM.

*Direction:* invert to an allowlist for header *values*; scrub a configurable set of query
parameters from `entry.url`; make `jwtLenses` opt-in and strip them from AI egress.

### C-6 · High — the decryption hook lives in the page's global scope

`content/decrypt-bridge.js:17` defines `window.__XRAY_decrypt__` as a writable page global.
The shipped stub returns `null`, so nothing leaks today — but the file exists to be filled
in. Once it is, a page can read whatever the closure captures, use it as an oracle, or
**replace it** and feed the analyst fabricated plaintext marked `decryptStatus: 'ok'`.

*Direction:* decrypt in the isolated world, the service worker, or the web worker. The
stated reason for MAIN-world placement (page CSP blocking eval) does not apply to
isolated-world content scripts, which are exempt from page CSP.

### C-8 · Medium — `debugger` is the primary path, not a fallback

`panel/console.js:145-147` tries `chrome.debugger` first and only falls back to the MAIN
world on error. So every console run on every site attaches the debugger, raises Chrome's
"XRAY started debugging this browser" infobar, and holds the attachment for 30 s. The
`debugger` permission combined with `<all_urls>` and MAIN-world injection is close to the
maximum-scrutiny configuration for Chrome Web Store review.

*Direction:* invert the order — try MAIN-world `new Function` first, fall back to the
debugger only on a CSP failure. Move `debugger` to `optional_permissions` and request it on
demand. **Do this before any store submission.**

### C-10 · Medium — `web_accessible_resources` over-exposed

`window.html` and `dist/window-ui.js` are web-accessible but do not need to be —
`chrome.windows.create` does not require WAR. Because `window.html` is exposed, any page
can iframe it; `src/panel/window-main.tsx:13-21` reads `location.hash` and calls
`updateSettings`, which **persists to `chrome.storage.local`**. A hostile page can therefore
permanently alter panel settings with no interaction. Impact is nuisance-grade — the hex
validation blocks CSS exfiltration — but it is unnecessary surface. All five resources use
static URLs, so any site can probe for XRAY's presence, feeding C-3.

*Direction:* drop `window.html` and `dist/window-ui.js` from WAR (verify the pop-out still
opens), and add `"use_dynamic_url": true` to the remaining entry.

> Not done in this branch because the regression suite pins both resources as present, and
> confirming the pop-out still opens requires a live browser.

### C-11 · Medium — worker IndexedDB is unbounded and may be page-origin

`workers/xray-worker.js:474-492` writes every entry, bodies included, to IndexedDB `xray_db`
and **never deletes**. No retention policy, no size cap, no "clear" control in the UI.

The blob-worker fallback (`shared/worker-client.js:81-88`) creates the worker from a
`blob:` URL, which inherits the **creating document's origin** — so in that path captured
traffic is written into the *visited site's own* IndexedDB, readable by page script.

*Unverified:* whether the direct path (`new Worker(chrome.runtime.getURL(...))` from a
content script) yields an extension-origin or page-origin worker in current Chrome. Confirm
with `indexedDB.databases()` in a page console before relying on either answer.

### C-12 · Medium — AI egress is broader than redaction implies, and the key travels too far

`buildExplainPrompt` sends the full URL, denylist-redacted headers, full bodies up to
40 000 chars, and GraphQL variables. Provider endpoints are hardcoded, so there is no SSRF.

Since the custom provider landed, the AI endpoint is **user-supplied** rather than
hardcoded. It is validated in the service worker — https required, plain http only for
loopback — so a downgraded or typo'd URL cannot ship captured bodies in the clear. This is
user-directed configuration, not attacker-controlled input, but note that it widens the
egress surface from two known hosts to whatever the user enters.

Separately, `aiBridge.ts:54` passes `settings` — **including `apiKey`** — from the content
script to the background on every call. The key is therefore resident in isolated-world
memory on every page purely to be relayed, which is what made C-5 a key-disclosure bug.

*Direction:* keep the key in the service worker and have it read from `chrome.storage`
itself; send only `{provider, prompt}` from the panel.

### C-14 / C-15 · Low — amplifiers and hygiene

- **Cross-origin session restore** (`src/panel/store.ts:564-567`): 500 entries with bodies
  are rehydrated on every site. On its own a product decision; in combination with C-1,
  C-3, C-5 and C-11 it is what turns each into a cross-origin breach.
- **Console history in the page's `localStorage`** (`panel/console.js:24`): any site can
  read what the analyst typed on every other site.
- **Rule regexes have no complexity bound** (`interceptor.js:55-57`), and rule sets are
  importable — a shared malicious rule set is a plausible ReDoS vector.
- **The docked panel's shadow root is `mode: 'open'`** (`src/panel/main.tsx:68`), so page
  script can read the rendered captured data through `.shadowRoot`. The HUD correctly uses
  `closed`.
- **`_eventInsideXray` matches on fixed ids/classes** (`content/content.js:45-50`), so a
  page can create decoy elements to punch holes in the focus trap.
- **`globalSearch.ts:77`** compiles a user-supplied regex with no ReDoS guard and runs it
  synchronously on the render path.

---

## 5. Permission justification

Required for a Chrome Web Store listing, and worth keeping honest.

| Permission | Why | Reducible? |
|---|---|---|
| `storage` | Panel preferences, traffic rules, session persistence, BYOK settings | No |
| `scripting` | Injecting the panel and HUD on demand | No |
| `activeTab` | Toolbar-triggered activation | No |
| `clipboardWrite` | Copy-as-cURL and export actions | No |
| `debugger` | CDP `Runtime.evaluate` for console execution on CSP-strict sites | **Yes — see C-8.** Should be `optional_permissions` |
| `windows` | The pop-out window | No |
| `<all_urls>` | Capture is the product; it cannot know in advance which origins matter | No, but see C-14 on scoping *retention* |

---

## 6. Reporting a vulnerability

See [SECURITY.md](../SECURITY.md).
