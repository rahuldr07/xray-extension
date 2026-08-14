# UI conventions

The design rules the panel actually follows, read off the code rather than aspiration.

This replaces a set of assistant-specific instruction files that had gone stale — they
described `--xr-*` tokens, an `xr-` class prefix and a `floating.js` that no longer
exists. None of that is true of this codebase, and following it would have produced
styles that silently themed nothing.

---

## 1. Everything is a token

All colour, radius and motion values come from CSS custom properties defined in
`src/panel/styles/tokens.css` on `:host, .xray-app-root`.

| Group | Tokens |
|---|---|
| Surfaces | `--xray-bg`, `--xray-surface`, `--xray-surface2` |
| RGB triples | `--xray-bg-rgb`, `--xray-surface-rgb`, `--xray-surface2-rgb`, `--xray-text-rgb` |
| Text | `--xray-text`, `--xray-subtext`, `--xray-hint` |
| Accents | `--xray-green`, `--xray-blue`, `--xray-yellow`, `--xray-red`, `--xray-mauve`, `--xray-teal`, `--xray-peach` |
| Radius | `--xray-radius` (set inline from `settings.radius`), `--xray-radius-sm` = ×0.6, `--xray-radius-lg` = ×1.4 |
| Motion | `--xray-ease`, `--xray-ease-out`, `--xray-dur-fast` (120ms), `--xray-dur` (180ms) |
| Type | `--xray-font` |

**Never hardcode a colour.** A literal hex in a rule is a bug: it will not change with the
theme, so it looks correct in the default theme and wrong in the other five.

**Never write a literal `rgba(...)` either.** This was the single largest source of broken
theming — 178 declarations painted Catppuccin pastels that could not respond to a theme at
all and simply vanished on light backgrounds. Two correct forms:

- `rgba(var(--xray-surface-rgb), 0.6)` for the four surface/text colours that ship RGB
  triples. `rgba(24, 24, 37, 0.6)` does not adapt; this is why the triples exist.
- `color-mix(in srgb, var(--xray-yellow) 34%, transparent)` for everything else. The
  accent colours deliberately have no RGB triples, and `color-mix` is the idiom used
  throughout the file.

**If you use an accent token, confirm every theme defines it.** Light Lab and the three
dark themes were missing `--xray-teal` and `--xray-peach`, so routing colours through
those tokens silently resolved straight back to the default pastels. Every
`.xray-theme-*` block must define every token it is asked for.

**Tinting with the same hue as the text moves background toward foreground.** A chip
tinted with `--xray-yellow` behind yellow text loses contrast on a light theme even
though both values are correct tokens. Check the resulting pair, not just the tokens.

## 1a. The accent is resolved, never looked up directly

`--xray-accent` is applied as an **inline** custom property, so it outranks every
`.xray-theme-*` block. The dark-theme pastels therefore followed the user onto the light
themes and measured 1.33–2.80 contrast there — the primary button read as blank, and the
focus ring fell under the 3:1 WCAG 1.4.11 floor, so keyboard focus was untrackable.

Always apply it via `resolveAccentValue(settings)` in `models/panelSettings.ts`, which
substitutes a darkened variant on light backgrounds. The choice is made by **measured
luminance rather than theme name**, so a custom theme with a light background gets it too.

## 2. Class naming and scoping

- Every class is prefixed `xray-`.
- The panel renders inside a **Shadow DOM**, so page styles cannot reach in and panel
  styles cannot leak out. Tokens are therefore declared on `:host`, **not** `:root` — a
  regression test pins this, because `:root` does not match inside a shadow tree and the
  entire theme silently falls back.
- The HUD uses a **closed** shadow root. The docked panel currently uses `mode: 'open'`,
  which is a known issue — see [threat-model.md](threat-model.md) C-15.

## 3. Themes must reach every surface

There are five presets — `operator`, `dev-edition`, `midnight`, `light-lab`, `claude` —
plus a fully custom theme, each scoped as `.xray-theme-<name>`.

XRAY renders in **three separate surfaces**, and a theme change has to land in all of
them:

| Surface | Mount | How the theme arrives |
|---|---|---|
| Docked panel / DevTools | `dist/panel-ui.js` | `.xray-theme-*` class plus inline custom vars on the panel root |
| HUD | `dist/hud-ui.js` | The HUD frame (`:host`) is an ancestor of `.xray-panel`, so it mirrors the active theme and radius vars |
| Pop-out window | `dist/window-ui.js` | Reads persisted settings; also accepts a shared theme via `window.html#theme=<code>` |

A change that only styles the panel is incomplete. There are regression tests asserting
that theme tokens reach popups too, not just the panel — keep them passing.

Custom themes are applied **purely as inline CSS variables on the panel element**, so they
stay scoped to the panel and never touch the host page or the capture runtime.

## 4. Invariants the tests enforce

These are pinned. Breaking one fails the suite, and each exists for a reason:

- **Every literal `border-radius` in `styles.css` and `hud.css` must be `999px`.**
  Non-pill radii come from `--xray-radius*`, which is user-configurable. A hardcoded
  `border-radius: 8px` ignores the setting.
- **Tokens are declared with `:host`, never `:root`.**
- **No `@import`, no remote fonts, no CDN assets.** The extension ships everything it
  renders; a remote font request from a content script is both a privacy leak and a CSP
  problem.
- **Reduced motion is honoured.** `@media (prefers-reduced-motion: reduce)` must keep
  covering `.xray-panel`.
- **Captured data renders as text, never as HTML.** No `dangerouslySetInnerHTML`
  anywhere — ESLint enforces `react/no-danger` as an error, and tests assert its absence.
  Response bodies are attacker-controlled by definition.

## 5. Motion and interaction

One motion language: `--xray-dur-fast` for hovers and small state changes,
`--xray-dur` for panel-level transitions, with `--xray-ease` / `--xray-ease-out`. Do not
introduce new durations or easings inline.

Focus rings must stay visible and consistent — the panel is keyboard-navigable and traps
focus while open, deliberately, so that page shortcuts do not fire underneath it.

## 6. Where the CSS lives

| File | Lines | Role |
|---|---|---|
| `src/panel/styles/tokens.css` | 31 | The token contract |
| `src/panel/styles.css` | ~5.9k | Panel styling |
| `src/panel/styles/hud.css` | 59 | HUD frame |

`styles.css` is large and is inlined into the bundles. Prefer extending existing
component classes over adding new top-level rules.
