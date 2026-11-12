# XRAY UI Redesign Design

## Goal

Make XRAY feel like a coherent, reliable response-operations instrument: clearer hierarchy, a distinctive non-neon theme system, one authoritative request workspace, and settings that are easy to navigate without weakening capture, replay, storage, AI, or extension security boundaries.

## Design direction

**Signal Gray / Instrument Amber** is the default visual direction. XRAY uses layered neutral gray surfaces, amber only for XRAY-specific inspection/active states, conventional semantic success/warning/danger/info colors, strong focus treatment, and restrained decoration. Harbor Instrument (dark) and Paper Relay (light) become companion presets; a high-contrast Signal variant is added through the same token model.

The implementation stays within the existing scoped CSS-variable architecture. No UI dependency, remote font, CDN asset, page-style leakage, CSP change, or capture/runtime dependency is introduced.

## Information architecture

The primary shell keeps five surfaces: API, Console, Logs, Rules, Insights. API owns the authoritative captured-request ledger and full request detail. Console owns page logs, command history/results, snippets, the REPL, and a selected-request context picker. The duplicate Console Network ledger is retired from the visible workflow; existing state is migrated compatibly and no capture protocol is changed.

Settings is grouped as:

- Workspace: General, Capture, Session & storage
- Interface: Appearance, Console, Shortcuts
- Runtime: AI, Decrypt, About

Destructive actions appear only under Session & storage. Immediate-apply semantics remain, with `Changes apply immediately.` and `Done`; no fake Save/Cancel transaction is introduced.

## Behavior corrections

- Console request context resolves the current authoritative entry so response/status/timing patches cannot leave a stale Network view.
- Console context inspection routes to API detail without executing commands or clearing pins, selection, snippets, or draft text.
- Settings deep-link sections are one-shot; ordinary gear opening uses the user’s last visited section.
- Custom-theme accent precedence is explicit: the rendered accent always matches the control the user edited.
- Prompt/theme tokens are defined through the semantic token contract; undefined tokens and mismatched AI primary-button classes are removed.
- Toast receipts render above modal backdrops while retaining a permanently mounted polite live region.
- Replay/import validation and confirmation behavior follow existing destructive-action and prepare-never-auto-run rules.
- Async loading, unavailable, empty, filtered-empty, and error states are explicit, bounded, themed, and accessible.

## Token contract

Every preset and custom theme supplies semantic roles for:

- surfaces: `bg`, `surface`, `surface2`, `surface3`
- content: `text`, `subtext`, `hint`
- controls: `border`, `border-control`, `focus`, `selection`, `hover`, `active`, `disabled`
- action: `accent`, `accent-soft`
- semantics: `green`, `yellow`, `red`, `blue`, `pending`, `neutral`
- overlays: `shadow`, `overlay`

Components use roles, not raw theme colors. Custom theme warnings never silently rewrite explicit user colors.

## Non-negotiable boundaries

- Preserve local-first behavior, CSP, closed-shadow root handling, centralized Escape/modal focus ownership, extension page isolation, and all capture/worker/storage/page-bridge protocols.
- Preserve panel, HUD, DevTools, and pop-out parity.
- Preserve persisted preference compatibility and unknown preference fields.
- Preserve response-first operations, explicit AI consent, replay preparation, and no implicit page execution.
- Verify document and closed-shadow fixtures, all theme presets, custom themes, reduced motion, keyboard-only flows, narrow panel widths, short viewport heights, and live capture updates.

## Acceptance criteria

1. API is the only authoritative captured-request list; Console context can inspect a request in API without duplicating request-list logic.
2. Console request/status/body patches stay current after store updates.
3. Settings opens the expected section for both ordinary gear and explicit deep links; destructive controls are not repeated across unrelated sections.
4. Default and alternate themes have visible surface layering, readable text, semantic status colors, and visible focus without neon overload.
5. Custom accent editing changes the rendered accent everywhere in the themed scope.
6. Empty, loading, unavailable, filtered-empty, and error states are distinct and recoverable.
7. Existing project unit, E2E, build, bundle-sync, accessibility, responsive, and network-scroll checks remain green.
