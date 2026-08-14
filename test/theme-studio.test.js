// Custom theme model: generation, contrast grading, share codes, and the live preview editor.

const assert = require('node:assert/strict');
const test = require('node:test');

const { read } = require('./helpers/source');

test('header palette button opens Settings to Appearance with visual theme swatches', () => {
  const switcher = read('src/panel/components/shell/ThemeSwitcher.tsx');
  const shell = read('src/panel/components/shell/PanelShell.tsx');
  const settingsModal = read('src/panel/components/settings/SettingsModal.tsx');
  const store = read('src/panel/store.ts');
  const styles = read('src/panel/styles.css');

  // The palette button reuses the proven Settings modal path (no fragile custom
  // popover), jumping straight to the Appearance section.
  assert.match(switcher, /export function ThemeSwitcher/);
  assert.match(switcher, /openSettings\('appearance'\)/);
  assert.match(store, /openSettings: \(section\) => set\(\{ settingsSection: section, settingsOpen: true \}\)/);
  assert.match(shell, /<ThemeSwitcher \/>/);

  // Settings modal syncs to the requested section and renders visual theme swatches
  assert.match(settingsModal, /THEME_PREVIEWS/);
  assert.match(settingsModal, /if \(open\) setSection\(settingsSection as SettingsSection\)/);
  assert.match(settingsModal, /updateSettings\(preview\.accentPref \? \{ theme: preview\.id, accent: preview\.accentPref \} : \{ theme: preview\.id \}\)/);
  assert.match(settingsModal, /id: 'claude', label: 'Claude'/);
  assert.match(settingsModal, /accentPref: 'coral'/);
  assert.match(styles, /\.xray-theme-swatch/);
  assert.match(styles, /\.xray-theme-claude\s*\{/);

  // the HUD host must not use layout containment (it would trap fixed descendants)
  const hud = read('content/hud-mount.js');
  assert.match(hud, /:host \{ contain: style; \}/);
  assert.doesNotMatch(hud, /contain: layout/);
});

test('custom theme gives full color freedom, stays scoped, and never affects the extension', () => {
  const model = read('src/panel/models/customTheme.ts');
  const shell = read('src/panel/components/shell/PanelShell.tsx');
  const settingsModal = read('src/panel/components/settings/SettingsModal.tsx');
  const styles = read('src/panel/styles.css');

  // pure derivation: four user colors -> a full, coherent token set
  assert.match(model, /export function buildCustomThemeVars/);
  assert.match(model, /export function normalizeCustomTheme/);
  assert.match(model, /export function clampHex/);
  assert.match(model, /'--xray-bg-rgb'/);
  assert.match(model, /'--xray-surface-rgb'/);
  assert.match(model, /'--xray-text-rgb'/);
  // status colors adapt to the chosen background's brightness
  assert.match(model, /DARK_STATUS/);
  assert.match(model, /LIGHT_STATUS/);
  assert.match(model, /luminance\(bg\) > 140/);

  // applied ONLY as inline CSS variables on .xray-panel -> scoped, cannot leak to the page or runtime
  assert.match(shell, /buildCustomThemeVars\(settings\.customTheme\)/);
  assert.match(shell, /settings\.theme === 'custom' \? buildCustomThemeVars/);
  assert.match(shell, /\.\.\.customVars/);

  // shadcn-style live editor with color + hex inputs and starter presets
  assert.match(settingsModal, /function CustomThemeEditor/);
  assert.match(settingsModal, /type="color"/);
  assert.match(settingsModal, /CUSTOM_PRESETS/);
  assert.match(settingsModal, /theme: 'custom', customTheme:/);
  assert.match(styles, /\.xray-custom-theme/);
  assert.match(styles, /\.xray-color-input/);
});

test('theme studio: radius, generate/randomize, import-export, and opt-in hacker overlay', () => {
  const model = read('src/panel/models/customTheme.ts');
  const settingsModal = read('src/panel/components/settings/SettingsModal.tsx');
  const shell = read('src/panel/components/shell/PanelShell.tsx');
  const settingsModel = read('src/panel/models/panelSettings.ts');
  const styles = read('src/panel/styles.css');

  // generate a whole theme from one color; coherent random; shareable export/import
  assert.match(model, /export function generateFromAccent/);
  assert.match(model, /export function randomTheme/);
  assert.match(model, /export function exportThemeCss/);
  assert.match(model, /export function parseThemeInput/);
  // editor exposes them
  assert.match(settingsModal, /generateFromAccent\(custom\.accent, 'dark'\)/);
  assert.match(settingsModal, /randomTheme\(Math\.random\(\)\)/);
  assert.match(settingsModal, /exportThemeCss\(custom\)/);
  assert.match(settingsModal, /parseThemeInput\(importText\)/);

  // radius + hacker are real settings, applied via scoped inline vars / class
  assert.match(settingsModel, /radius: 10/);
  assert.match(settingsModel, /hacker: false/);
  assert.match(settingsModel, /clampNumber\(base\.radius, DEFAULT_PANEL_SETTINGS\.radius, 0, 20\)/);
  assert.match(shell, /'--xray-radius': `\$\{settings\.radius\}px`/);
  assert.match(shell, /settings\.hacker \? 'xray-hacker' : ''/);
  assert.match(styles, /--xray-radius/);
  assert.match(styles, /\.xray-panel\.xray-hacker::after/);
  // hacker flicker only runs when motion is allowed
  assert.match(styles, /@media \(prefers-reduced-motion: no-preference\)/);

  // radius is a real token scale used everywhere, not a hand-picked allowlist
  const tokens = read('src/panel/styles/tokens.css');
  assert.match(tokens, /--xray-radius-sm: calc\(var\(--xray-radius\) \* 0\.6\)/);
  assert.match(tokens, /--xray-radius-lg: calc\(var\(--xray-radius\) \* 1\.4\)/);
  // every rounded-rect radius is token-driven across ALL stylesheets (incl. the HUD
  // frame); only 999px pills / 50% circles are literal
  const hudCss = read('src/panel/styles/hud.css');
  const literalRadii = [...styles.matchAll(/border-radius:\s*[0-9]+px/g), ...hudCss.matchAll(/border-radius:\s*[0-9]+px/g)].map((m) => m[0]);
  for (const decl of literalRadii) {
    assert.match(decl, /999px/, `non-pill literal radius should use the token: ${decl}`);
  }
  // the HUD frame is an ancestor of the panel, so its vars are mirrored onto the host
  const hudMain = read('src/panel/hud-main.tsx');
  assert.match(hudMain, /syncHostTheme/);
  assert.match(hudMain, /'--xray-radius'/);
});

test('theme studio: WCAG contrast checker and shareable theme codes (with URL hash)', () => {
  const model = read('src/panel/models/customTheme.ts');
  const settingsModal = read('src/panel/components/settings/SettingsModal.tsx');
  const windowMain = read('src/panel/window-main.tsx');

  // WCAG contrast
  assert.match(model, /export function contrastRatio/);
  assert.match(model, /export function contrastGrade/);
  assert.match(model, /ratio >= 4\.5/);
  assert.match(settingsModal, /function ContrastReport/);
  // grades read the fully-resolved tokens (pinned or derived), not just the raw base four
  assert.match(settingsModal, /resolveThemeColors\(theme\)/);
  assert.match(settingsModal, /contrastRatio\(c\.text, c\.bg\)/);
  // covers the pairs themes most often fail: muted-on-bg and text-over-accent
  assert.match(settingsModal, /contrastRatio\(c\.subtext, c\.bg\)/);
  assert.match(settingsModal, /contrastRatio\(c\.text, c\.accent\)/);

  // portable share codes carry the whole look (colors + font + radius + effect)
  assert.match(model, /export function encodeTheme/);
  assert.match(model, /export function decodeTheme/);
  assert.match(model, /const CODE_PREFIX = 'xray1:'/);
  assert.match(settingsModal, /encodeTheme\(\{ colors: custom, font, radius, hacker \}\)/);
  assert.match(settingsModal, /decodeTheme\(importText\)/);

  // a shared theme can arrive as a window URL hash (#theme=…) and only mutates
  // panel settings — both import paths share one package→settings mapping
  assert.match(windowMain, /applyThemeFromHash/);
  assert.match(windowMain, /decodeTheme\(hash\)/);
  assert.match(windowMain, /themePackageToSettings\(pkg\)/);
  assert.match(read('src/panel/models/customTheme.ts'), /export function themePackageToSettings/);
});

test('theme studio has a live preview, screen eyedropper, and per-token copy', () => {
  const settingsModal = read('src/panel/components/settings/SettingsModal.tsx');
  const styles = read('src/panel/styles.css');

  // a composed preview painted with the exact resolved theme vars (so you can see a theme while editing it)
  assert.match(settingsModal, /function ThemePreview/);
  assert.match(settingsModal, /buildCustomThemeVars\(theme\)/);
  assert.match(settingsModal, /<ThemePreview theme=\{custom\} \/>/);
  assert.match(styles, /\.xray-theme-preview/);

  // per-token screen eyedropper (feature-checked) and copy
  assert.match(settingsModal, /'EyeDropper' in window/);
  assert.match(settingsModal, /new Ctor\(\)\.open\(\)/);
  assert.match(settingsModal, /IconColorPicker/);
  assert.match(settingsModal, /onCopy=\{\(\) => \{ void copyText/);
  assert.match(styles, /\.xray-token-btn/);
});
