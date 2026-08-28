# Chrome Web Store submission

Copy-paste material for the developer dashboard, plus the review notes that go with it.
Keep this in sync with `PRIVACY.md` and `docs/threat-model.md` — reviewers compare the
justifications against what the code actually does, and a mismatch is a rejection.

Privacy policy URL to give the dashboard:
`https://github.com/rahuldr07/xray-extension/blob/main/PRIVACY.md`

---

## Single purpose

> XRAY is an API debugging console. It captures a page's HTTP, WebSocket, SSE and GraphQL
> traffic, makes the responses legible, and turns them into developer actions — replay,
> mock rules, schema comparison, and exports — inside one panel, without leaving the page
> under test.

Single purpose is a rule about *coherence*, not size. Every capability listed above exists
to serve inspecting-and-acting-on-the-current-response; nothing in the extension is
unrelated to it.

## Permission justifications

Paste each verbatim into the matching field. Each says what the permission does and why
nothing narrower works, which is what the field is actually asking.

**`<all_urls>` (host permission)**

> Traffic capture is the extension's entire function, and a debugging tool cannot know in
> advance which origins the developer needs to inspect — the bug is usually on the site
> they are already on. The content script only reads network activity initiated by the
> page itself. No host is contacted by the extension, and nothing captured is transmitted.

**`storage`**

> Stores the user's panel preferences, custom themes, and mock rules, plus the captured
> session so that traffic survives a page reload. If the user opts into AI explanations,
> their own API key is stored here as well. All of it is local to the browser profile.

**`scripting`**

> Injects the inspector panel and the heads-up display into the inspected page on demand,
> rather than loading them into every page unconditionally.

**`activeTab`**

> Lets the user activate XRAY on the current tab from the toolbar button.

**`clipboardWrite`**

> Powers the "Copy as cURL" / "Copy as fetch" actions and the export dialog, which put
> generated commands and captured data on the clipboard.

**`debugger`**

> Used only for `Runtime.evaluate` via the Chrome DevTools Protocol, so the extension's
> console can execute expressions on sites whose Content Security Policy forbids inline
> evaluation. Chrome displays its own "XRAY is debugging this browser" banner the entire
> time it is attached, so its use is always visible to the user. No other CDP domain is
> used, and the debugger is detached after an idle period.

**`windows`**

> Opens the inspector in a detached pop-out window for users on a second monitor.

## Data-use disclosures

Tick, and be ready to defend:

| Dashboard question | Answer |
|---|---|
| Collects personally identifiable information | No |
| Collects health / financial / authentication information | **Yes — authentication information.** See the note below. |
| Collects personal communications | No |
| Collects location | No |
| Collects web history | **Yes.** Captured request URLs are a record of sites visited. |
| Collects user activity | **Yes.** Network activity on pages the user inspects. |
| Collects website content | **Yes.** Request and response bodies. |
| Sells data to third parties | No |
| Uses or transfers data for purposes unrelated to the single purpose | No |
| Uses or transfers data to determine creditworthiness | No |

**The authentication-information answer matters.** XRAY retains `Authorization` headers so
captured requests can be replayed with working auth. That is authentication data, it is
stored locally, and the honest answer is yes. Answering no here because "it never leaves
the machine" is how listings get pulled: the question asks what the extension *handles*,
not what it *transmits*.

## Reviewer notes

Worth putting in the notes field, because each of these is something a reviewer will
otherwise flag:

- **No remote code.** `content_security_policy.extension_pages` is `script-src 'self'`. The
  extension bundles every asset; it loads no script, style, font, or image from any remote
  origin. The committed `dist/` bundles are built from the `src/` in the same commit and CI
  enforces that they match (`scripts/check-dist-sync.mjs`).
- **`debugger` is user-visible by design.** Chrome's own banner appears whenever it is
  attached. It is used for one CDP method, `Runtime.evaluate`.
- **The only outbound request is user-configured.** AI explanations are off until the user
  supplies their own Anthropic or OpenAI key, and the call then goes directly to that
  provider. There is no first-party server anywhere in the product.
- **Security posture is published.** `SECURITY.md` carries a private disclosure process;
  `docs/threat-model.md` documents the trust boundaries, the fixed findings, and the ones
  still open.

## Assets

Screenshots available at `docs/assets/readme/` (1280×800 or 640×400 as the store requires):
`hero.png`, `api-network-inspector.png`, `console-workspace.png`, `insights.png`,
`export-modal.png`, `settings-modal.png`.

Still to produce before submission: the 440×280 small promo tile, and a store icon at
128×128 (`icons/icon128.png` exists and may serve).
