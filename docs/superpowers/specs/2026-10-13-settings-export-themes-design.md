# Settings, Export and themes — design

Requested on 2026-10-13 ("keep good themes, good settings and everything perfect … full access, go
agent-driven, find useful ones and do these completely"). Sources: the controller's real-extension
review of both modals (layout items L1–L6), the Settings/Export behaviour audit
(`output/settings-audit/REPORT.md`, findings #1–#29, RAN/TRACED evidence) and the theme audit
(`output/theme-audit/`, section 5). This spec is the authority for the implementation plan.
Decisions were made by the controller under the user's delegation and are marked **Ruling**.

## Purpose

Every setting does exactly what its label says, takes effect immediately, survives reload and is
restored by Reset; every export format produces a file that works (parses, runs, re-imports) at any
body size and on every surface; the two modals are calm (no jumping, no clutter) at 420–1600 px; and
every theme preset is readable (WCAG AA text, ≥ 3:1 UI graphics; High Contrast ≥ 7:1 text).

## Constraints

- No new dependencies. Theme tokens only. `prefers-reduced-motion`. Document, closed-shadow HUD,
  window (pop-out) and DevTools surfaces.
- Persisted settings stay backward compatible: removed settings keep their stored keys readable
  (ignored), no migration may drop user data.
- Capture privacy wins over completeness: when the user has turned a transport off, no request of
  that transport may reach the panel, including the first ones of a page load.
- Existing accessible names pinned by tests stay unless a test is deliberately updated with reason.
- Never commit (the user's tree is uncommitted).

## 1. Capture correctness

**C1. No early leak (audit #1).** The page interceptor no longer assumes "capture on" before it has
a config. Until the first `__xray_config__` arrives it keeps completed captures in a bounded
pending buffer (max 50 entries, oldest dropped) instead of emitting them; on the first config it
flushes only the entries whose transport is enabled and discards the rest. If no config arrives
within 3 s it flushes using the defaults (all on) — the pre-change behaviour for users who never
changed a toggle. `content/content.js` posts the stored capture config itself as soon as the bridge
token is known (read from `xray_react_panel_preferences.settings` via `XRAY_Store`), without waiting
for the panel to mount; the panel's later `publishCaptureSettings` stays the live path.
Rules are part of the same config post, so stored rules also apply from the first moment possible.

**C2. Rules independent of capture (audit #2).** Mock / delay / fail rules apply whether or not
capture is on for that transport: the interceptor matches rules before the capture guard and the
guard only skips emitting the capture. Copy: "Capture fetch() requests." (no rules caveat needed).

**C3. Pop-out capture toggles (audit #15).** **Ruling:** in the pop-out window, where the page bridge
is unreachable, the Capture section shows one line "Changes apply to the page the next time XRAY
opens there." when `publishCaptureSettings` reports it could not deliver. (Relaying through the
background is out of scope.)

**C4. WebSocket copy (#22).** "Capture WebSocket and Server-Sent Event connections opened from now on."

## 2. Export correctness

**E1. Never truncate a download (#3, #4).** File output (Download and Copy) uses the full value; only
the on-screen preview `<pre>` is capped (existing 120k cap, with the existing notice). Generated
code (Jest, MSW, Playwright, Mock) embeds the full body; when the body exceeds 1 MB it embeds
`/* body omitted: N KB — see the JSON export */` and `null` so the file still parses.

**E2. Selected JSON shape (#3).** The `entry` object in the Selected JSON export omits
`responseRaw`, `response` and `responseDecrypted` (the parsed response is already exported once).

**E3. Pop-out parity (#5).** `window.html` loads `shared/utils.js` and `shared/console-helpers.js`
like the other surfaces, and the fallbacks in `src/panel/utils.ts` (cURL/fetch/mock) produce the
same output as the shared generators (method, headers, body). A unit test pins fallback = shared
output for one representative entry.

**E4. Share-safe precision (#8, #25).** `DIAGNOSTIC_FIELD` applies only to top-level entry fields,
never to keys inside request/response bodies. Query values are redacted unless the key is in the
interceptor's `QUERY_ALLOW` list (reuse the same list; do not duplicate it).

**E5. HAR fidelity (#14, #24).** `postData.text` = the raw request body string as captured;
`postData.mimeType` = the request's content-type header (fallback `application/octet-stream`);
`bodySize` = that text's length; `queryString` filled from the URL; `creator.version` = the
extension version; `statusText` from the entry when present; local HAR skips non-HTTP entries
(same `isHttpEntry` filter as share-safe).

**E6. CSV (#23).** Zero values stay `0` (`??` not `||`); cells starting with `=`, `+`, `-` or `@` are
prefixed with `'`; description "One row per API request (logs excluded), including full URLs."

**E7. Generated tests (#26, #27, #28).** Playwright skips the body assertion when the captured body
is empty; MSW is unavailable (disabled with a reason) for WebSocket/SSE entries and its handler URL
drops the query string; Jest description becomes "Jest scaffold that mocks fetch with the captured
response."

**E8. Honest labels (#9, #10, #29).** Per-request privacy chip "Selected request · may contain
credentials". cURL description "Shell command with method, headers and body. Credentials were
redacted at capture; add your own." fetch "fetch() call with method, headers and body." Mock
"Captured URL, method, status and response as JSON." Session filenames
`xray-session-<YYYYMMDD-HHmmss>.<ext>`, share-safe `xray-session-share-safe-<…>.<ext>`.

## 3. Settings behaviour

**S1. One confirmation rule (#6).** "Confirm destructive actions" is honoured by every destructive
action: `requestConfirmation` in the store runs `onConfirm` immediately when the setting is off;
Console Clear, Command Palette clears and Rule delete all go through it. Copy: "Ask before clearing
captured data, console output, pins, rules, or settings."

**S2. Max entries (#7).** Lowering the value below the current entry count asks for confirmation
(through S1) before evicting. Copy: "Keep at most this many in memory; oldest go first (pinned and
selected are kept). Lowering it deletes entries now. Only the newest 500 are restored after reload."

**S3. Theme keeps the accent (#13).** Picking a preset theme no longer changes the accent the user
chose. **Ruling:** presets set the accent only while the user has never picked one (a stored
`accentChosen` flag, false by default and for existing users whose accent equals the theme default).

**S4. Reset keeps layout (#17).** Reset settings preserves `panelWidth`, `dockSide`, `apiSplit`,
`logsSplit` and `firstRunDismissed`, and evicts to the restored Max entries immediately.

**S5. Remove what does nothing.** Remove from Settings (stored keys stay readable and ignored):
"Very slow threshold" (#11, nothing reads it), "Default detail view" (#12, the detail pane already
remembers the view), "Stream to console live" (#16, it is the Console's Live button), the Decrypt
section (#M-17; one line moves to About: "Decryption: responses to requests with an X-Parse-Token
header pass through the decrypt hook in shared/decrypt.js, which does nothing until a developer
edits it."), and "Clear API filters" (the API bar's Clear search already does it).

**S6. Put things where they belong.** "Slow threshold" moves from Console to General, copy
"Requests at or above this are marked slow in the list, Insights and Findings." "Session identity"
and the runtime rows move under a collapsed "Diagnostics" disclosure in Session & storage.
**Ruling:** "Compact rows" stays (it is the API list's row-height toggle, mirrored by the list's
toolbar button) but is renamed "Compact API rows", desc "Shorter rows in the API list. Same as the
list's row-height button." — merging it into Density would change every surface's spacing.

**S7. Readable choices (#18, #20, #21).** Select options show names, not ids (fonts: "JetBrains Mono
(if installed)", "Cascadia Code (if installed)", "Iosevka (if installed)", "System monospace"; detail
views, AI providers likewise). Accent swatches have display names used for their accessible names
(`blue` → "Amber", `peach` → "Gold", others by their colour). Font desc "Monospace font for tables,
JSON and console. Uses fonts installed on this computer." "Operator glow" → "Glow", desc
"Accent-coloured glow on selected rows and buttons, plus the background grid."

**S8. Options page names (X-19).** `settings/settings.html` theme options use the panel's names:
Signal Gray (default), Harbor Instrument, High Contrast, Paper Relay (values unchanged). The About
section's preset count derives from the preset list.

**S9. Copy.** "Clear all captured sessions" → "Clear all captured data". Shortcuts "Toggle XRAY"
row adds "Change in chrome://extensions/shortcuts".

## 4. Modal layout

**L1. Settings never jumps.** The Settings modal has a fixed height `min(640px, 90vh)`; sections
scroll inside the content pane.

**L2. Settings width.** `min(780px, 94vw)`; the theme grid stays two columns down to 560 px content
width and its names do not wrap at the default width; accent swatches fit one row; the nav column
fits "Session & storage" on one line.

**L3. Focus on open.** Settings focuses the active section's nav item on open (not the first form
control); Export keeps focusing Close.

**L4. Export Session mode.** In Session mode only the Session group (and Import) is shown; the
per-request groups are hidden, not greyed. Selected mode shows per-request groups only.

**L5. Export at narrow widths.** Below 640 px of modal width the format rail becomes a single
`<select>` (grouped `<optgroup>`s, same order and labels) above a full-height preview; above it the
rail shows every format without clipping and the preview takes the remaining height.

**L6. Export labels once.** The privacy label appears once (in the preview header), not in the
format name and again above the code. The Selected/Session switch uses the same control height as
the format chips.

## 5. Themes

Measured on the real extension (computed styles, alpha composited; `output/theme-audit/<theme>/`).
Targets: text ≥ 4.5:1 (High Contrast ≥ 7:1), meaningful UI graphics (input borders, scrollbar thumbs)
≥ 3:1. Disabled text is exempt. Hacker mode and Glow keep their look. Every preset is kept.

**T1. Light surfaces stop turning grey.** Six rules mix surfaces with a fixed `black`
(`styles.css` input `surface2 88%, black 12%`; JSON well `bg 86%, black 14%`; API table header; timing
bar track `black 22%`; request detail `black 8%`; status bar `black 10%`). Each uses
`var(--xray-sink, black)` instead; `.xray-theme-light-lab` (Paper Relay) and `.xray-theme-claude`
set `--xray-sink: #ffffff`; `buildCustomThemeVars` emits `#ffffff` for light custom themes and
`#000000` for dark. **Ruling:** light themes get lighter (not darker) wells — the common light-UI
convention and the only choice that lets the existing syntax colours pass AA. Dark presets are
pixel-identical (fallback).

**T2. Claude palette** (`.xray-theme-claude`): `--xray-hint` `#6f6b62`, `--xray-subtext` `#5f5b53`,
`--xray-green` `#2d743c`, `--xray-peach` `#a84f2c`, `--xray-mauve` `#7a4bb5`, `--xray-blue`
`#3d6197`, `--xray-red` `#b03426`, `--xray-yellow` and `--xray-pending` `#7c5812`,
`--xray-neutral` = hint. The Claude theme card's preview dot shows the accent actually applied.

**T3. Paper Relay hint** `#777267` → `#6c675c` (both declarations).

**T4. Themed placeholders.** `.xray-panel :is(.xray-input, input, textarea)::placeholder
{ color: var(--xray-hint); opacity: 1; }` (the console editor keeps its own rule).

**T5. Visible input borders.** The input rule uses `border-color: var(--xray-border-control)`
(not the decorative `--xray-border`), and `--xray-border-control` becomes: Signal Gray `#717b8a`
(also `tokens.css`), Harbor `#7a8693`, Paper Relay `#837d70`, Claude unchanged (`#817c72`, passes),
Custom derived `mix(surface, text, 0.44)`.

**T6. Accent as text.**
- Active tab count badge text uses `var(--xray-text)` (`.xray-panel .xray-tab.active .xray-badge`).
- `PANEL_ACCENT_VALUES.coral` `#d97757` → `#e6906f` (fixes Harbor's primary button and Signal
  Gray's coral swatch).
- `PANEL_ACCENT_VALUES_LIGHT` one step darker: blue `#9a6500` → `#875800`, coral `#b84a24` →
  `#a8421f`, green `#2f8a1f` → `#237016`; teal, peach and mauve darkened by the same ~10 % lightness
  step so each is ≥ 4.5:1 as primary-button text on its own tint in both light presets (a unit test
  asserts the ratio for every light swatch).
- `DEFAULT_CUSTOM_THEME.accent` and the Slate preset `#7c5cff` → `#9479ff`.
- The console hint's active parameter (`.xray-editor-hint-param`) uses `--xray-text` bold plus an
  underline in the accent colour, not accent-coloured text.

**T7. Status red on tints.** `--xray-red`: Signal Gray `#e06c75` → `#e8838b` (also `tokens.css`),
Harbor `#e17d83` → `#ea9296`, High Contrast `#ff7b84` → `#ff9ca2`. Selected-row tint
`accent 18%` → `accent 10%`. High Contrast's active-tab badge reaches ≥ 7:1 through T6's badge rule.

**T8. Custom theme derivation.** Hint `mix(text, bg, 0.55)` → `0.42`; hover is
`mix(bg, text, 0.08)` (it was inverted); scrollbar thumb ≥ 3:1. **Ruling:** the Theme Studio swatches
nothing reads (Selection, Hover, Active, Neutral, Pending) are removed from the editor's groups
(stored values stay readable and ignored) — wiring them would restyle every theme's rows.

**T9. Small text on the active Export card** uses `var(--xray-subtext)`.

**T10. Scrollbar thumbs ≥ 3:1** on Paper Relay, Claude and Custom (thumb token or mix adjusted so
the static matrix in the theme test passes).

**T11. Brand glyph** on the accent gradient uses `var(--xray-bg)` in High Contrast and Signal Gray.

**T12. Contrast test.** A unit test computes the token-pair matrix for every preset (text, subtext,
hint, status colours, JSON syntax colours on the well and on surface, placeholder, input border,
scrollbar thumb, accent-on-tint) and asserts the targets above, so a future token edit cannot
regress a theme. `test/theming-tokens.test.js` pins are updated deliberately to the new values.

## 6. Testing

- Unit: interceptor pending-buffer flush/discard/timeout and rules-before-guard (JS test harness used
  by existing `test/capture-interceptor.test.js`); export generators at 240 KB (JSON parses, Jest/MSW
  transform with esbuild), share-safe body keys and QUERY_ALLOW, HAR fields, CSV zeros/formula,
  fallback parity; settings reset preservation, accent rule, confirmation gating.
- E2E: Settings fixed height across sections, focus on open, removed rows absent, Diagnostics
  disclosure; Export Session mode shows only session formats, narrow select, labels once; Max entries
  confirmation; Console Clear without confirmation when the setting is off.
- Real extension: capture toggles off → reload → no early capture; rule mock applies with capture off.
- Full gate: `npm run check`, `npm run test:e2e`, `npm run test:coverage`, dist synced.

## Out of scope

New settings (pause-all capture, console-log capture toggle, URL ignore list, custom sensitive names,
max body size), relaying capture config from the pop-out through the background, the options page's
storage behaviour (X-9, X-10, X-16, M-20) beyond the theme names. Offered as follow-ups.
