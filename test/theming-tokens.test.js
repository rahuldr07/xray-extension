// Catppuccin token scoping, theme/font/density controls, and RGB surface tokens.

const assert = require('node:assert/strict');
const test = require('node:test');

const { read } = require('./helpers/source');

test('fallback semantic tokens are scoped to Shadow DOM and avoid web font loading', () => {
  const tokens = read('src/panel/styles/tokens.css');
  const panelCss = read('src/panel/styles.css');
  const main = read('src/panel/main.tsx');
  const devtoolsHtml = read('devtools/devtools-panel.html');
  const previewHtml = read('preview/ui-preview.html');
  const combined = `${tokens}\n${panelCss}\n${devtoolsHtml}\n${previewHtml}`;

  assert.match(tokens, /:host/);
  assert.doesNotMatch(tokens, /:root/);
  for (const token of [
    '--xray-bg: #181a1f',
    '--xray-surface: #202329',
    '--xray-surface2: #292e36',
    '--xray-surface3: #333943',
    '--xray-text: #f3f4f6',
    '--xray-green: #43b581',
    '--xray-blue: #5aa9e6',
    '--xray-yellow: #d99a2b',
    '--xray-red: #e8858d',
    '--xray-mauve: #b694d7',
    '--xray-teal: #4fb3a4',
    '--xray-peach: #da9064',
    '--xray-hint: #8e98a8',
    '--xray-subtext: #c1c7d0',
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

  // The P1 lineup + custom. Retired ids are not themes: they migrate on load (spec V2).
  assert.match(types, /export type PanelTheme = 'xray-dark' \| 'xray-light' \| 'github-dark' \| 'github-light' \| 'tokyo-night' \| 'catppuccin-mocha' \| 'dracula' \| 'gruvbox-dark' \| 'midnight' \| 'custom';/);
  assert.match(types, /export type PanelFont = 'jetbrains' \| 'cascadia' \| 'iosevka' \| 'system'/);
  assert.match(types, /export type PanelDensity = 'compact' \| 'comfortable' \| 'spacious'/);
  assert.match(settingsModel, /PANEL_FONT_VALUES/);
  assert.match(settingsModel, /theme: 'xray-dark'/);
  assert.match(settingsModel, /density: 'compact'/);
  assert.match(settingsModel, /glow: true/);
  assert.match(settingsModal, /label="Theme"/);
  assert.match(settingsModal, /label="Font stack"/);
  assert.match(settingsModal, /label="Density"/);
  assert.match(settingsModal, /label="Glow"/);
  assert.match(shell, /xray-theme-\$\{settings\.theme\}/);
  assert.match(shell, /xray-density-\$\{settings\.density\}/);
  assert.match(shell, /xray-font-\$\{settings\.font\}/);
  assert.match(shell, /PANEL_FONT_VALUES\[settings\.font\]/);
  for (const className of ['xray-theme-xray-dark', 'xray-theme-xray-light', 'xray-theme-github-dark', 'xray-theme-github-light', 'xray-theme-tokyo-night', 'xray-theme-catppuccin-mocha', 'xray-theme-dracula', 'xray-theme-gruvbox-dark', 'xray-theme-midnight', 'xray-density-compact', 'xray-density-comfortable', 'xray-density-spacious']) {
    assert.match(styles, new RegExp(`\\.${className}`));
  }
  assert.match(styles, /XRAY Operator UI override layer/);
  assert.match(styles, /prefers-reduced-motion/);
});

test('Operator UI applies tab-specific API, Detail, Console, Snippet, and Insights polish', () => {
  const styles = read('src/panel/styles.css');

  assert.match(styles, /XRAY Operator UI tab-specific polish/);
  assert.match(styles, /\.xray-panel \.xray-api-table-head/);
  assert.match(styles, /\.xray-panel \.xray-detail-tab\.active/);
  assert.match(styles, /\.xray-panel \.xray-operation-groups/);
  assert.match(styles, /\.xray-panel \.xray-prompt-command-row > svg/);
  assert.match(styles, /\.xray-prompt \.xray-context-line/);
  assert.match(styles, /\.xray-panel \.xray-statusbar/);
  assert.match(styles, /\.xray-snippet-menu/);
  assert.match(styles, /\.xray-panel \.xray-insight-row:hover/);
  // Dead selectors from removed markup (API metric cards, insight grid, …) stay gone.
  assert.doesNotMatch(styles, /\.xray-(api-metric|count-pill|insight-grid|insight-overview|list-controls|status-dot|textarea)\b/);
  // Notebook CSS was removed with the Notebook tab
  assert.doesNotMatch(styles, /\.xray-notebook/);
});

test('surfaces use theme RGB tokens so light themes (XRAY Light, GitHub Light) render correctly', () => {
  const styles = read('src/panel/styles.css');
  const tokens = read('src/panel/styles/tokens.css');
  // no Catppuccin-dark surface values baked into rules — they must be tokenized (a preset's
  // own token block, e.g. Catppuccin Mocha's --xray-overlay, is where such values belong)
  const rules = styles.replace(/\.xray-theme-[a-z0-9-]+\s*\{[^}]*--xray-bg:[^}]*\}/g, '');
  for (const dark of ['rgba(17, 17, 27', 'rgba(24, 24, 37', 'rgba(30, 30, 46', 'rgba(49, 50, 68', 'rgba(205, 214, 244']) {
    assert.doesNotMatch(rules, new RegExp(dark.replace(/[()]/g, '\\$&')), `${dark} must be a theme token, not hardcoded`);
  }
  // the translucent-surface tokens exist on the base and every theme
  assert.match(tokens, /--xray-surface-rgb:/);
  assert.match(tokens, /--xray-text-rgb:/);
  for (const theme of ['xray-dark', 'xray-light', 'github-dark', 'github-light', 'tokyo-night', 'catppuccin-mocha', 'dracula', 'gruvbox-dark', 'midnight']) {
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
  // A preset owns its accent (spec P2): the inline --xray-accent, which outranks every
  // .xray-theme-* block, is set only for an accent the user picked (or the custom theme's).
  // resolveAccentValue solves a picked swatch for the preset's own surfaces; the pastels
  // used to follow the user onto light themes at 1.33-2.80 contrast, below the focus ring's
  // 3:1 floor.
  assert.match(app, /const accent = resolveAccentValue\(settings\);/);
  assert.match(app, /\.\.\.\(accent \? \{ '--xray-accent': accent \} : \{\}\)/);
  assert.match(app, /settings\.theme === 'custom' \? buildCustomThemeVars/);
  // the wrapper contains the modals (they're inside the same element, not siblings of it)
  assert.match(app, /<div className={`xray-theme-scope[\s\S]*<SettingsModal \/>[\s\S]*<GlobalSearch \/>[\s\S]*<\/div>/);
  assert.match(styles, /\.xray-theme-scope\s*\{\s*display: contents;/);
  // preset token blocks are no longer panel-scoped, so the wrapper matches them
  assert.doesNotMatch(styles, /\.xray-panel\.xray-theme-[a-z]/);
  // the default token fallback still exists for both the shadow host and plain mount
  assert.match(tokens, /:host,\s*\.xray-app-root/);
});
