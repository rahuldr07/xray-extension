# Visual refresh and theme lineup — design

Requested 2026-10-14 ("keep good themes — these are not good"); decided by the controller under the
user's standing delegation ("free hand"). Evidence: real-extension exploration of 14 palettes and a
calm-accent variant (`output/theme-explore/`, contact sheets `contact-*.png`), whose rendered token
blocks are copied verbatim to `docs/superpowers/specs/assets/2026-10-14-theme-lineup.css` and
`…/2026-10-14-calm-accent.css`. This spec is the authority for the implementation plan.

## Purpose

Today every preset looks like the same screen with a different tint: the structure (every token
boxed, monospace for all UI, 900 weights, accent washes, a hidden second accent) dominates, and the
default theme's accent equals its warning yellow, so the active tab and selection read as "slow".
Success: each preset is recognisably itself, the selected request and its data are the first thing
the eye lands on, chrome is quiet, and every preset still passes the contrast matrix
(`test/unit/themeContrast.test.mjs`; text ≥ 4.5:1, High Contrast ≥ 7:1, UI graphics ≥ 3:1).

## Constraints

- No new dependencies, no bundled fonts. Theme tokens only. `prefers-reduced-motion`.
- Document, closed-shadow HUD, pop-out window and DevTools surfaces; widths 420–1600 px.
- Backward compatible persistence: stored theme ids of retired presets migrate (V2); stored
  accent ids keep working; Theme Studio custom themes keep working.
- The contrast matrix stays the guard and is extended to the new presets; no gap lists.
- Accessible names pinned by tests stay unless a test is deliberately updated with a reason.
- Never commit.

## 1. Preset lineup

**P1. Presets** (exact token blocks: `assets/2026-10-14-theme-lineup.css`; copy values verbatim,
nudge only if the extended matrix fails, lightness-only, and record each nudge):

| id | Label | Kind | Notes |
|---|---|---|---|
| `xray-dark` | XRAY Dark | dark | **Default.** Neutral graphite, cyan accent (no status hue shares it). |
| `xray-light` | XRAY Light | light | Light default, same accent hue. |
| `github-dark` | GitHub Dark | dark | Primer dark. |
| `github-light` | GitHub Light | light | Primer light (fg roles). |
| `tokyo-night` | Tokyo Night | dark | |
| `catppuccin-mocha` | Catppuccin Mocha | dark | |
| `dracula` | Dracula | dark | |
| `gruvbox-dark` | Gruvbox Dark | dark | |
| `midnight` | High Contrast | dark | Existing block kept (7:1). |
| `custom` | Custom | — | Theme Studio, unchanged behaviour. |

Order in the picker: XRAY Dark, XRAY Light, GitHub Dark, GitHub Light, Tokyo Night, Catppuccin
Mocha, Dracula, Gruvbox Dark, High Contrast, Custom. Swatch previews (bg / accent / text dots and
label) come from the same values as the token blocks (single source; no hand-copied hexes).

**P2. Each preset owns its accent.** A preset's accent comes from its block. The Accent colour
setting overrides it only when the user has picked one (`accentChosen`, existing flag). Picking a
preset while `accentChosen` is false shows that preset's own accent. A "Use theme accent" control
next to the swatches resets `accentChosen` to false. Accent swatches stay (Amber, Lavender, Teal,
Green, Gold, Coral) and are solved for the active theme with the existing hue-preserving solver.

**P3. Light presets** are `xray-light` and `github-light` (plus light custom themes):
`--xray-sink: #ffffff` and the light accent table apply to them; `isLightTheme()` keys off kind.

## 2. Migration

**V1. New default** for fresh installs and Reset: `xray-dark`, accent from the theme.

**V2. Retired ids** map on load (stored value rewritten on next save): `operator` (Signal Gray) →
`xray-dark`; `dev-edition` (Harbor Instrument) → `xray-dark`; `light-lab` (Paper Relay) →
`xray-light`; `claude` → `xray-light`. A user whose stored accent was the retired preset's default
accent gets `accentChosen: false` (theme accent); a user who picked a different accent keeps it.
The options page (`settings/settings.html`/`settings.js`) lists the new ids/labels and migrates the
same way. One-time toast after migration: "Themes were refreshed — you're on <Label>. Change it in
Settings → Appearance." (shown once, dismissible).

## 3. Calm accent (application)

**A1.** The accent paints only: the active top tab, the primary button, focus rings, the selected
row's indicator bar, links, on/off controls (switch, range thumb), the active Settings nav item and
the active theme swatch (rules: `assets/2026-10-14-calm-accent.css`). Everything else that uses the
accent today becomes neutral: table column headers → `--xray-hint`; chip/pill/button borders →
`--xray-border`; filter counts → `--xray-subtext`; brand mark neutral.

**A2. One accent.** Mauve stops acting as a second accent in chrome (`.xray-command-cell`,
`.xray-table th`, the primary-button accent→mauve gradient, `.xray-brand-mark`, the active detail
tab border, the request-detail wash): primary button is a flat accent fill; mauve remains only a
data colour (JSON booleans, method colours where assigned).

**A3. No washes.** Remove accent tints from surfaces: `.xray-panel::before` radial glows, workspace
and toolbar gradients, `.xray-body`, row and JSON-well tints. Surfaces are flat token colours. The
existing "Glow" setting keeps its effect (glow on selected rows/buttons + background grid) as an
opt-in; **default off** for new installs and Reset (existing stored value kept).

## 4. Structure

**S1. Unboxed tokens.** Method, status, response chips, badges and flags lose their outline border
(`.xray-panel .xray-method, .xray-status, .xray-response-chip, .xray-chip, .xray-badge` and peers):
method and status render as coloured text; flags/badges keep a soft tint fill (≤ 10 %, existing cap)
with no border; buttons keep a border only where they are actions (icon buttons get a border on
hover/focus only). Weight 900 → 600 for these.

**S2. Two type roles.** New token `--xray-font-ui`: `ui-sans-serif, system-ui, -apple-system,
"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`. Chrome uses it: top tabs, buttons,
menus, toolbars' labels, filter chips, modal titles and body copy, Settings, empty states, toasts,
tooltips, the command palette's labels. Data keeps `--xray-font` (the Font stack setting, mono):
URL paths, methods, status codes, timings and sizes, JSON (all views), console input/output, table
cells, headers/cookies values, code previews, the statusbar's numbers. Font stack setting copy:
"Monospace font for data — URLs, JSON, console. Uses fonts installed on this computer."

**S3. Calmer type.** Table header (`.xray-api-table-head`): 600, sentence case, letter-spacing 0,
`--xray-hint`. Statusbar: 500. Section titles/h4: 600, uppercase kept only for the small Settings
nav group labels. No text weight above 700 anywhere in the panel.

**S4. Themeable lines.** Borders, dividers and outlines use `--xray-border` (decorative) or
`--xray-border-control` (inputs); no literal colours and no `--xray-hint` mixes for lines. Each
preset block defines `--xray-border`.

**S5. Wire the dead tokens.** Selected row background = `--xray-selection`; row hover =
`--xray-hover`; pressed/active controls = `--xray-active`; in-flight status uses `--xray-pending`;
JSON `null` uses `--xray-neutral`. Every preset block defines these (the lineup file has them).

**S6. Pane layering.** Lists, the detail pane and the JSON well use one consistent layering:
panel chrome `--xray-surface`, content panes `--xray-bg`, wells/inputs `--xray-surface2`, raised
menus/modals `--xray-surface3`.

## 5. Theme Studio

Custom themes go through the same structure. The studio's preset list stays (Slate, Graphite, …);
its derived tokens add `--xray-selection`, `--xray-hover`, `--xray-active`, `--xray-border`
(solved ≥ 3:1 where it marks an input, decorative otherwise).

## 6. Testing

- Contrast matrix: add every new preset (full pair set incl. own-tint rules, selected row using
  `--xray-selection`, the calm-accent active states, primary button flat fill); all pass, HC 7:1.
- Unit: migration (each retired id → new id; accentChosen rule), preset accent ownership
  (preset accent shown while accentChosen false; "Use theme accent" resets), default theme.
- E2E (document + closed shadow): picker order/labels; switching presets changes `--xray-bg` and
  accent; calm accent — column headers are not accent-coloured, chips have no border, active tab
  and selection bar are; chrome elements compute `--xray-font-ui`, data elements compute the mono
  stack; no element's computed font-weight > 700; no element uses a literal border colour (scan
  computed border colours against the token set on a sample screen); migration toast once.
- Real extension: screenshots of API (selected 200 + JSON), 500 row, Console, Logs, Settings →
  Appearance for every preset → `output/visual-refresh/<preset>/`, plus a contact sheet; the
  controller reviews them.

## Out of scope

New layout/IA changes, bundling fonts, adding more presets (Rosé Pine, Nord, Solarized were
evaluated and rejected: hierarchy collapses under AA nudges), JSON-correctness fixes (separate
audit and plan).
