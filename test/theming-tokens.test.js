// Catppuccin token scoping, theme/font/density controls, and RGB surface tokens.

const assert = require('node:assert/strict');
const test = require('node:test');

const { read } = require('./helpers/source');

test('Catppuccin Mocha tokens are scoped to Shadow DOM and avoid web font loading', () => {
  const tokens = read('src/panel/styles/tokens.css');
  const panelCss = read('src/panel/styles.css');
  const main = read('src/panel/main.tsx');
  const devtoolsHtml = read('devtools/devtools-panel.html');
  const previewHtml = read('preview/ui-preview.html');
  const combined = `${tokens}\n${panelCss}\n${devtoolsHtml}\n${previewHtml}`;

  assert.match(tokens, /:host/);
  assert.doesNotMatch(tokens, /:root/);
  for (const token of [
    '--xray-bg: #1e1e2e',
    '--xray-surface: #181825',
    '--xray-surface2: #313244',
    '--xray-text: #cdd6f4',
    '--xray-green: #a6e3a1',
    '--xray-blue: #89b4fa',
    '--xray-yellow: #f9e2af',
    '--xray-red: #f38ba8',
    '--xray-mauve: #cba6f7',
    '--xray-teal: #94e2d5',
    '--xray-peach: #fab387',
    '--xray-hint: #6c7086',
    '--xray-subtext: #a6adc8',
    "--xray-font: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
  ]) {
    assert.ok(tokens.includes(token), `${token} token is required`);
  }
  assert.doesNotMatch(combined, /@import/i);
  assert.doesNotMatch(combined, /fonts\.googleapis|fonts\.gstatic|<link/i);
  assert.match(main, /plainDomTokensCss/);
  assert.match(main, /tokensCss\.replace\(\s*\/:host\/g,\s*'#xray-react-root'\s*\)/);
  assert.match(main, /useShadowTokens/);
  assert.match(main, /target instanceof Document \? target\.head \|\| target\.documentElement : target/);
  assert.doesNotMatch(main, /target\.appendChild\(style\)/);
});

test('Operator UI exposes configurable theme, font, density, and glow controls', () => {
  const types = read('src/panel/types.ts');
  const settingsModel = read('src/panel/models/panelSettings.ts');
  const settingsModal = read('src/panel/components/settings/SettingsModal.tsx');
  const shell = read('src/panel/components/shell/PanelShell.tsx');
  const styles = read('src/panel/styles.css');

  assert.match(types, /export type PanelTheme = 'operator' \| 'dev-edition' \| 'midnight' \| 'light-lab' \| 'claude' \| 'custom'/);
  assert.match(types, /export type PanelFont = 'jetbrains' \| 'cascadia' \| 'iosevka' \| 'system'/);
  assert.match(types, /export type PanelDensity = 'compact' \| 'comfortable' \| 'spacious'/);
  assert.match(settingsModel, /PANEL_FONT_VALUES/);
  assert.match(settingsModel, /theme: 'operator'/);
  assert.match(settingsModel, /density: 'compact'/);
  assert.match(settingsModel, /glow: true/);
  assert.match(settingsModal, /label="Theme"/);
  assert.match(settingsModal, /label="Font stack"/);
  assert.match(settingsModal, /label="Density"/);
  assert.match(settingsModal, /label="Operator glow"/);
  assert.match(shell, /xray-theme-\$\{settings\.theme\}/);
  assert.match(shell, /xray-density-\$\{settings\.density\}/);
  assert.match(shell, /xray-font-\$\{settings\.font\}/);
  assert.match(shell, /PANEL_FONT_VALUES\[settings\.font\]/);
  for (const className of ['xray-theme-operator', 'xray-theme-dev-edition', 'xray-theme-midnight', 'xray-theme-light-lab', 'xray-theme-claude', 'xray-density-compact', 'xray-density-comfortable', 'xray-density-spacious']) {
    assert.match(styles, new RegExp(`\\.${className}`));
  }
  assert.match(styles, /XRAY Operator UI override layer/);
  assert.match(styles, /prefers-reduced-motion/);
});

test('Operator UI applies tab-specific Network, Detail, Console, Snippet, and Insights polish', () => {
  const styles = read('src/panel/styles.css');

  assert.match(styles, /XRAY Operator UI tab-specific polish/);
  assert.match(styles, /\.xray-panel \.xray-network-head/);
  assert.match(styles, /\.xray-panel \.xray-api-table-head/);
  assert.match(styles, /\.xray-panel \.xray-network-row\.selected/);
  assert.match(styles, /\.xray-panel \.xray-detail-tab\.active/);
  assert.match(styles, /\.xray-panel \.xray-operation-groups/);
  assert.match(styles, /\.xray-panel \.xray-prompt::before/);
  assert.match(styles, /content: '>'/);
  assert.match(styles, /\.xray-panel \.xray-statusbar/);
  assert.match(styles, /\.xray-snippet-bar/);
  assert.match(styles, /\.xray-panel \.xray-insight-row:hover/);
  assert.match(styles, /\.xray-panel \.xray-api-metric strong/);
  // Notebook CSS was removed with the Notebook tab
  assert.doesNotMatch(styles, /\.xray-notebook/);
});

test('surfaces use theme RGB tokens so light themes (Light Lab, Claude) render correctly', () => {
  const styles = read('src/panel/styles.css');
  const tokens = read('src/panel/styles/tokens.css');
  // no Catppuccin-dark surface values baked into rules — they must be tokenized
  for (const dark of ['rgba(17, 17, 27', 'rgba(24, 24, 37', 'rgba(30, 30, 46', 'rgba(49, 50, 68', 'rgba(205, 214, 244']) {
    assert.doesNotMatch(styles, new RegExp(dark.replace(/[()]/g, '\\$&')), `${dark} must be a theme token, not hardcoded`);
  }
  // the translucent-surface tokens exist on the base and every theme
  assert.match(tokens, /--xray-surface-rgb:/);
  assert.match(tokens, /--xray-text-rgb:/);
  for (const theme of ['operator', 'dev-edition', 'midnight', 'light-lab', 'claude']) {
    const block = styles.match(new RegExp(`\\.xray-theme-${theme}\\s*\\{[^}]*\\}`));
    assert.ok(block, `theme block for ${theme} not found`);
    assert.match(block[0], /--xray-bg-rgb:/);
    assert.match(block[0], /--xray-surface-rgb:/);
    assert.match(block[0], /--xray-text-rgb:/);
  }
});

test('theme tokens reach popups too, not just the panel', () => {
  const app = read('src/panel/App.tsx');
  const styles = read('src/panel/styles.css');
  const tokens = read('src/panel/styles/tokens.css');

  // A display:contents wrapper carries theme tokens to the panel AND the sibling
  // modals (Settings, Export, Command palette, Global search, …) via inheritance.
  assert.match(app, /xray-theme-scope xray-theme-\$\{settings\.theme\}/);
  assert.match(app, /'--xray-accent': PANEL_ACCENT_VALUES\[settings\.accent\]/);
  assert.match(app, /settings\.theme === 'custom' \? buildCustomThemeVars/);
  // the wrapper contains the modals (they're inside the same element, not siblings of it)
  assert.match(app, /<div className={`xray-theme-scope[\s\S]*<SettingsModal \/>[\s\S]*<GlobalSearch \/>[\s\S]*<\/div>/);
  assert.match(styles, /\.xray-theme-scope\s*\{\s*display: contents;/);
  // preset token blocks are no longer panel-scoped, so the wrapper matches them
  assert.doesNotMatch(styles, /\.xray-panel\.xray-theme-operator/);
  // the default token fallback still exists for both the shadow host and plain mount
  assert.match(tokens, /:host,\s*\.xray-app-root/);
});
