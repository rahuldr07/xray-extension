# Visual Refresh and Theme Lineup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the look-alike presets with a distinct, readable lineup and quiet the panel's structure (calm accent, unboxed tokens, sans UI chrome, themeable lines) so the data stands out.

**Architecture:** Presets are CSS token blocks in `src/panel/styles.css` keyed by `.xray-theme-<id>`; ids/labels/kinds/accents live in `src/panel/models/panelSettings.ts` (+ `types.ts`), the picker in `SettingsModal.tsx`, custom derivation in `customTheme.ts`. Structural changes are CSS rule edits plus one new font token. The contrast matrix (`test/unit/themeContrast.test.mjs`) is the guard for every preset.

**Tech Stack:** React 19 + Zustand, Vite build to `dist/`, Node test runner (`test/unit/*.test.mjs` via `test/unit/harness.mjs`), Playwright E2E (`test/e2e/*.e2e.mjs`, document + closed-shadow fixtures; `theme-visual-system.e2e.mjs` renders the real App with tokens).

**Spec:** `docs/superpowers/specs/2026-10-14-visual-refresh-themes-design.md` (P1–P3, V1–V2, A1–A3, S1–S6, Theme Studio §5, Testing §6). Exact token values: `docs/superpowers/specs/assets/2026-10-14-theme-lineup.css`; calm-accent rules: `docs/superpowers/specs/assets/2026-10-14-calm-accent.css`. Evidence screenshots: `output/theme-explore/`.

## Global Constraints

- No new dependencies, no bundled fonts. Theme tokens only (literal colours only inside token definitions). `prefers-reduced-motion`.
- Surfaces: document, closed-shadow HUD, pop-out window, DevTools; widths 420–1600 px.
- Persisted settings backward compatible; retired theme ids migrate per V2; stored accents keep working.
- Contrast matrix covers every preset with no gap lists (text ≥ 4.5, High Contrast ≥ 7, UI graphics ≥ 3).
- No computed font-weight above 700 anywhere in the panel after Task 4.
- Never commit, stash, reset or checkout. Lint 0 errors, ≤ 53 warnings (`npx eslint .`). After `src/` changes: `npm run build` + `node scripts/check-dist-sync.mjs`.
- Scratch scripts under `output/` with a `.txt` suffix when done; nothing temporary under `test/`.

## Review Focus

- **Stored settings from the old version** (theme `operator` + accent `blue`, `light-lab` + custom accent, `claude`, `custom` with a studio theme): load, migrate per V2, no data loss, one toast. → Task 2 unit `migration matrix`.
- **High Contrast after structural changes** (unboxed tokens, sans chrome, calm accent): still ≥ 7:1 and state still distinguishable (active tab, selected row, focus). → Task 3/4 E2E `high contrast states`.
- **Selected vs hover vs focused row** in every preset after `--xray-selection`/`--xray-hover` wiring: three states visually distinct (selection ≠ hover background; focus ring visible). → Task 6 matrix + E2E `row states distinct`.
- **Narrow 420 px HUD and pop-out** with the sans chrome font: no clipped tab labels or toolbar overflow regressions. → Task 5 E2E `chrome fits at 420`.
- **Custom themes made before the refresh** (stored Theme Studio values): render with the new structure, derived selection/hover/border present, matrix passes for studio presets. → Task 6 test.

---

### Task 1: Preset token blocks, lineup wiring and contrast matrix (P1, P3)

**Files:** Modify `src/panel/styles.css` (add the 8 new `.xray-theme-<id>` blocks; keep `midnight`; keep retired blocks only until Task 2 migrates — then delete), `src/panel/types.ts` (`PanelTheme`), `src/panel/models/panelSettings.ts` (theme list with label/kind/accent source; `isLightTheme` by kind; light accent table usage), `src/panel/components/settings/SettingsModal.tsx` (picker order/labels; swatch previews derived from the same source), `test/unit/themeContrast.test.mjs` (add every new preset). Tests: contrast matrix; picker E2E in `test/e2e/theme-visual-system.e2e.mjs`.

**Interfaces:** Produces `THEME_PRESETS: Array<{ id: PanelTheme; label: string; kind: 'dark'|'light'; preview: { bg: string; accent: string; text: string } }>` exported from `panelSettings.ts` (single source for picker, isLightTheme, options page, tests).

- [ ] Step 1: Failing tests — matrix includes `xray-dark, xray-light, github-dark, github-light, tokyo-night, catppuccin-mocha, dracula, gruvbox-dark, midnight` (full pair set as today); E2E: picker shows exactly the P1 order/labels; clicking each sets the theme class and changes computed `--xray-bg`.
- [ ] Step 2: Run → FAIL. Capture RED.
- [ ] Step 3: Implement with the lineup file's values verbatim; nudge only if the matrix fails (lightness-only via the existing OKLCH helpers), recording each nudge in the report.
- [ ] Step 4: PASS.
- [ ] Step 5: Gate `npm run typecheck && npx eslint . && npm test && npm run build && node scripts/check-dist-sync.mjs` + the touched E2E file.

### Task 2: Accent ownership, migration, default, options page, toast (P2, V1, V2)

**Files:** `src/panel/models/panelSettings.ts` (default `xray-dark`; per-preset accent; normalize/migrate retired ids; accentChosen rule), `src/panel/store.ts` (reset default; migration toast once), `src/panel/components/settings/SettingsModal.tsx` ("Use theme accent" control), `src/panel/components/shell/PanelShell.tsx` / `App.tsx` (inline `--xray-accent` only when `accentChosen`), `settings/settings.html` + `settings/settings.js` (new ids/labels from the same list; migration), `src/panel/styles.css` (delete retired blocks after migration lands). Tests: unit `migration matrix`, `preset owns accent`, options-page vm test; E2E toast once.

- [ ] Step 1: Failing tests: each retired id → new id (V2 table); stored accent equal to the retired preset's default → `accentChosen:false`, other accent → kept + `accentChosen:true`; fresh install/Reset → `xray-dark`, theme accent; picking a preset with `accentChosen:false` shows the preset accent (computed `--xray-accent` equals block value); "Use theme accent" resets; toast text exactly per V2, shown once; options page lists the new labels and migrates.
- [ ] Step 2: RED captured. Step 3: implement. Step 4: GREEN. Step 5: gate + touched E2E.

### Task 3: Calm accent, one accent, no washes, Glow default off (A1–A3)

**Files:** `src/panel/styles.css` (apply `assets/2026-10-14-calm-accent.css` rules into the real selectors; remove mauve-as-accent and washes per A2/A3; primary button flat accent), `src/panel/models/panelSettings.ts` (Glow default off for new installs/Reset). Tests: E2E in `theme-visual-system.e2e.mjs`; matrix for primary button flat fill and active states.

- [ ] Step 1: Failing E2E (both fixtures, XRAY Dark and High Contrast): API column header color = `--xray-hint` (not accent); filter chip border color = `--xray-border`; active tab and selected-row bar use the accent; primary button background has no gradient image; `.xray-panel::before` has no background image with Glow off; no element's computed color/background equals mauve except JSON/method data elements; `high contrast states` — active tab, selected row and focus remain distinguishable (computed differences) at 7:1.
- [ ] Step 2: RED. Step 3: implement. Step 4: GREEN. Step 5: gate + touched E2E + `npm run test:e2e` once.

### Task 4: Unboxed tokens and calmer type (S1, S3)

**Files:** `src/panel/styles.css`. Tests: E2E.

- [ ] Step 1: Failing E2E: method/status elements in an API row have `border-style: none` (or 0 width) and weight ≤ 600; flags/badges have no border and a tint fill; icon buttons show a border only on hover/focus; `.xray-api-table-head` is weight 600, `text-transform: none`, letter-spacing 0; a full-DOM scan of the open panel (API + Settings open) finds no computed font-weight > 700.
- [ ] Step 2: RED. Step 3: implement. Step 4: GREEN. Step 5: gate + touched E2E.

### Task 5: Two type roles (S2)

**Files:** `src/panel/styles/tokens.css` (`--xray-font-ui`), `src/panel/styles.css` (chrome selectors → `--xray-font-ui`; data selectors keep `--xray-font`), `SettingsModal.tsx` (Font stack desc copy per S2). Tests: E2E.

- [ ] Step 1: Failing E2E (both fixtures): computed font-family of top tabs, primary/secondary buttons, Settings row labels and descriptions, modal titles, filter chips, toasts starts with the UI stack; URL path cells, method, status, JSON tree keys/values, console input, console table cells, statusbar numbers use the mono stack; `chrome fits at 420` — at 420 px HUD width no top-tab label or toolbar control is clipped (scrollWidth ≤ clientWidth on tab labels) compared to before.
- [ ] Step 2: RED. Step 3: implement. Step 4: GREEN. Step 5: gate + touched E2E + `npm run test:e2e` once.

### Task 6: Themeable lines, wired state tokens, pane layering, Theme Studio tokens (S4–S6, §5)

**Files:** `src/panel/styles.css` (lines → `--xray-border`/`--xray-border-control`; row selected/hover/active and pending/neutral wiring; pane layering), `src/panel/models/customTheme.ts` (derive `--xray-selection`, `--xray-hover`, `--xray-active`, `--xray-border`). Tests: matrix (selected row via `--xray-selection`; `row states distinct` — selection vs hover background ΔE noticeable and both keep text ≥ 4.5), E2E, a source scan test (no `border*`/`outline` declarations with literal colours or `--xray-hint` mixes outside token blocks — allowlist documented in the test).

- [ ] Step 1: Failing tests as listed + studio presets in the matrix with derived state tokens.
- [ ] Step 2: RED. Step 3: implement. Step 4: GREEN. Step 5: gate + touched E2E + `npm run test:e2e` once.

### Task 7: Integration verification

**Files:** only on failure; `docs/ui-audit.md` (one line referencing the spec).

- [ ] Step 1: Full gate: `npm run check && npm run test:e2e && npm run test:coverage` (lines ≥ 98.5 %, branches ≥ 89 %); re-run a failing E2E file alone once; `git diff --check`; dist synced.
- [ ] Step 2: Real extension: for every preset (9 + Custom default + one Theme Studio preset) capture API (selected 200 + JSON tree), 500 row, Console with table + tree, Logs, Settings → Appearance to `output/visual-refresh/<preset>/`; build `output/visual-refresh/contact-*.png` contact sheets; migration check (seed stored settings `{theme:'operator', accent:'blue'}` → opens on XRAY Dark with theme accent and shows the toast once).
- [ ] Step 3: Report screenshot paths for the controller's visual review.
