# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: a developer debugging the API of an app they build and run themselves.**
They control both ends, so they are not blocked waiting on a backend team — they are
trying to see what their own app actually sent and received, and act on it without
leaving the page.

The situation is the moment after a request looks wrong: the response is open and the
question is "what can I do with this right now?" That user already knows their domain
and their endpoints; they need density and speed, not explanation.

**Confirmed distribution: a public Chrome Web Store listing.** This is a deliberate
tension worth stating plainly rather than smoothing over — the product is tuned for a
solo developer who already knows the tool, but the store puts it in front of strangers
who do not. Reconciling that (first-run onboarding, empty states, a privacy disclosure)
is an open decision, not a settled one. See Capabilities and Constraints.

## Product Purpose

XRAY is a response operations console for API debugging. It captures fetch, XHR,
WebSocket, SSE, GraphQL, and console traffic from the page, makes the responses
legible, and turns them into actions — replay, edit-and-replay, mock rules, exports,
schemas, test assets, and optional AI explanations.

Success is the compression of a tab-switching routine (Network panel → Console →
copied JSON → external formatter → copied cURL → handmade mock → Postman → notes)
into one surface, without the user ever leaving the page under test.

## Positioning

Chrome DevTools shows HTTP. XRAY understands the API and lets you bend it.

The difference a neighboring tool could not truthfully copy is that XRAY's operations
are *response-native*: they read the selected response and prepare the next action from
it. Mock rules seeded from a real captured body, replay that restores the original
request's sensitive headers inside the page, schema-drift detection against a
per-endpoint baseline, and GraphQL grouping by `operationName` rather than a pile of
identical `POST /graphql` rows. DevTools has none of these; a JSON viewer has none of
the capture; a desktop API client has neither the page context nor the live traffic.

## Operating Context

The product runs across six execution contexts and presents five user-facing surfaces:

| Surface | Where it lives |
|---|---|
| Docked panel | Injected into the page, open shadow root |
| HUD | Injected into the page, closed shadow root |
| DevTools panel | `devtools/devtools-panel.html` |
| Pop-out window | `window.html` |
| Settings page | `settings/settings.html` |

Content scripts are injected into **every frame of every URL** at `document_start`.
Capture is split across a MAIN/ISOLATED world boundary whose only channel is
`window.postMessage` — which the page can also read and write. That boundary is the
defining constraint of the codebase and the origin of most of its sharp edges.

Captured traffic persists across origins by default: a session restored on one site is
resident in the panel while the user is on another.

## Capabilities and Constraints

**Confirmed functionality** — capture (fetch/XHR/WebSocket/SSE/GraphQL/console, real
Resource Timing waterfall, initiator stacks); understanding (tree, grid, schema, diff,
schema drift, JWT lens, response decryption); operations (replay, edit-and-replay, mock
rules, BYOK AI explain, console ops); export (cURL, fetch, axios, types, tests, HAR,
plus HAR and session import); Theme Studio (presets, full custom theming, contrast
checker, shareable theme codes).

**Durable technical constraints:**

- Manifest V3, Chrome and Edge. Node >= 20.11.
- The capture runtime (`content/`, `shared/`, `background.js`) is vanilla JS and must
  stay dependency-free. React/TypeScript live only in `src/panel/`, built to IIFE
  bundles in `dist/`.
- Local-first with zero remote UI assets. Extension-page CSP is `script-src 'self'`.
- AI explain is BYOK; keys stay in local extension storage and the provider is called
  directly from the background service worker.
- Chrome injects a content-script *file* only once per frame, forcing the dynamic-import
  and isolated-world-handoff workarounds documented in `docs/architecture.md`.
- `content_scripts[1]` load order is load-bearing and pinned by regression tests.
- Themes are scoped to the panel via inline CSS variables and must never touch the page
  or the capture runtime.
- Many tests pin exact source strings. Changing wired behavior means updating the pinned
  assertion to describe the new wiring, never deleting it.
- `npm run check` (typecheck + lint + build + test) is the gate for every change.

**Explicitly undecided product facts:**

- No privacy policy and no store-listing assets exist in the repo, both of which a
  public Chrome Web Store submission requires.
- No first-run onboarding or activation flow exists. Whether the store audience gets one
  is unresolved.
- Seven security findings in `docs/threat-model.md` and the logic bugs in
  `docs/known-issues.md` are open by deliberate choice, each pinned by a test that
  documents current behavior.

## Brand Commitments

- The name **XRAY**, and the framing "response operations console" — not "JSON viewer",
  which the README explicitly positions against.
- The existing icon set (`icons/`, 16/48/128).
- Named theme presets: Operator, Dev, Midnight, Light, Claude.
- Voice: direct, technical, specific, unhedged. The existing docs explain mechanisms and
  name real failures rather than marketing around them; `docs/known-issues.md` publishes
  unfixed bugs by name. Future copy should not soften this into promotional register.

## Evidence on Hand

Real and available:

- Ten product screenshots in `docs/assets/readme/` (hero, network inspector, console
  workspace, insights, export modal, settings modal, mobile detail, feature grid,
  architecture map, workflow loop).
- `CHANGELOG.md` (Keep a Changelog, SemVer), `docs/architecture.md`,
  `docs/ui-conventions.md`, `docs/threat-model.md`, `docs/known-issues.md`,
  `SECURITY.md` with a private advisory process and a seven-day response commitment.
- A shipped release artifact at `release/xray-extension-0.3.0.zip`.

**Absent — future work must not fabricate these:** there are no users, testimonials,
case studies, press mentions, install counts, benchmarks, pricing, or third-party
endorsements. The project is pre-1.0, ISC-licensed, and has no store listing yet.

## Product Principles

1. **The response is the subject.** Every operation reads the selected response and
   prepares the next action from it. Generic tooling that ignores what is on screen
   belongs in DevTools, not here.
2. **Prepare, never auto-run.** Operations switch views, copy artifacts, or insert
   prepared commands into Console or Notebook. They do not execute code on the user's
   behalf.
3. **Nothing leaves the machine.** Local-first, no remote UI assets, BYOK keys in local
   storage. Any feature implying a server contradicts the product.
4. **The panel never contaminates the page.** Shadow DOM, scoped tokens, and a capture
   runtime that stays dependency-free. A tool that changes the thing it measures is
   worthless.
5. **Name the sharp edges.** Open bugs and threats are published, tested, and
   documented rather than quietly carried. Honesty about failure is part of the product,
   not a lapse in polish.

## Accessibility & Inclusion

No formal external standard is committed to. The WCAG contrast checker in Theme Studio
is a **product feature** for users authoring custom themes, not a conformance claim, and
the existing accessibility tests pin current behavior rather than certify a level.

Accessibility work is welcome where cheap but is not a binding constraint on future
design. This is a recorded decision, not an oversight — revisit it if the store listing
brings an audience that needs it.
