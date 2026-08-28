# XRAY privacy policy

Last updated: 2026-08-28. Applies to the XRAY browser extension, all versions.

## The short version

XRAY has no backend. There is no XRAY server, no account, no telemetry, no analytics, and
no crash reporting. Nothing you capture is transmitted to the developer or to any third
party, because there is nowhere for it to go.

The one exception is the optional AI Explain feature, which is off unless you supply your
own API key. It is covered in full below.

## What XRAY collects

XRAY is a traffic-inspection tool. To do its job it reads, and stores locally:

| Data | Where it comes from | Where it is stored |
|---|---|---|
| Request and response bodies | Pages you visit, via `fetch`/XHR/WebSocket/SSE interception | `chrome.storage.local` and an extension-owned IndexedDB |
| Request and response headers, including `Authorization` | The same | The same |
| URLs, methods, status codes, timings | The same | The same |
| Console messages from the page | The page's `console` | The same |
| Your panel preferences, themes, and mock rules | You | `chrome.storage.local` |
| Your AI provider API key, if you set one | You | `chrome.storage.local` |

All of it stays on your machine, in your browser profile. Uninstalling the extension
removes it. The **Clear** action in the panel removes it on demand.

**This is a concentration of secrets, and you should understand that before installing.**
XRAY runs on every URL and retains authorization headers so that captured requests can be
replayed. By default the session is restored on every origin, which means traffic captured
on one site is resident in the panel while you are on another. `SECURITY.md` and
`docs/threat-model.md` describe the consequences in technical detail, including the
findings that are still open.

## What XRAY transmits

Nothing, with one opt-in exception.

**AI Explain (bring your own key).** If — and only if — you enter an Anthropic or OpenAI
API key in Settings, the *Explain* action sends the selected request and response to that
provider's API so it can be described in prose. The call is made directly from the
extension's background service worker to the provider you chose. It does not pass through
any XRAY infrastructure. Your key is stored in `chrome.storage.local` and is sent only to
that provider's endpoint.

What leaves your machine in that request is the selected entry: its URL, method, status,
headers, and body. Redaction is applied on a header-name denylist, which
`docs/threat-model.md` (C-12) documents as narrower than it should be — a secret carried
in a **body** or a **URL query parameter** is not redacted and will be included. Do not use
AI Explain on traffic you cannot share with your chosen provider.

Your use of that provider is governed by their privacy policy, not this one.

If you never enter a key, no network request is ever made by XRAY.

## What XRAY does not do

- No analytics, telemetry, usage statistics, or crash reporting of any kind.
- No advertising, and no data sold, rented, or shared with anyone.
- No remote code: the extension's CSP is `script-src 'self'`, and it loads no script,
  stylesheet, font, or image from any remote origin.
- No account, no login, no identifier that follows you.

## Permissions, and why each one exists

| Permission | Why it is needed |
|---|---|
| `<all_urls>` | Capture is the entire product. It cannot know in advance which origins you will want to inspect. |
| `storage` | Panel preferences, mock rules, captured sessions, and the BYOK key. |
| `scripting` | Injecting the panel and HUD into the page on demand. |
| `activeTab` | Activating XRAY from the toolbar. |
| `clipboardWrite` | Copy-as-cURL and the export actions. |
| `debugger` | Chrome DevTools Protocol `Runtime.evaluate`, so the console can execute on sites whose CSP forbids inline evaluation. Chrome shows its own banner whenever this is attached. |
| `windows` | The pop-out window. |

## Children

XRAY is a developer tool. It is not directed at children and collects nothing about who is
using it.

## Changes

Material changes to this policy will be recorded in `CHANGELOG.md` and reflected in the
"last updated" date above.

## Contact

Security issues: use [GitHub Security Advisories](https://github.com/rahuldr07/xray-extension/security/advisories/new),
as described in [SECURITY.md](SECURITY.md). Everything else:
[GitHub issues](https://github.com/rahuldr07/xray-extension/issues).
