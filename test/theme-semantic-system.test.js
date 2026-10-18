// Source-level guardrails for the semantic theme system and Appearance workflow.

const assert = require('node:assert/strict');
const test = require('node:test');
const { read } = require('./helpers/source');

test('Appearance exposes the preset lineup (THEME_PRESETS) and defaults to XRAY Dark', () => {
  const settings = read('src/panel/components/settings/SettingsModal.tsx');
  const model = read('src/panel/models/panelSettings.ts');
  // The picker renders the model's lineup; labels live in THEME_PRESETS (spec P1).
  assert.match(settings, /THEME_PRESETS\.map\(/);
  for (const label of ['XRAY Dark', 'XRAY Light', 'GitHub Dark', 'GitHub Light', 'Tokyo Night', 'Catppuccin Mocha', 'Dracula', 'Gruvbox Dark', 'High Contrast']) {
    assert.match(model, new RegExp(`label: '${label}'`));
  }
  assert.match(model, /theme: 'xray-dark'/, 'XRAY Dark is the default (spec V1)');
});

test('every preset and the fallback token scope define semantic roles', () => {
  const tokens = read('src/panel/styles/tokens.css');
  const styles = read('src/panel/styles.css');
  const roles = [
    '--xray-surface3', '--xray-border-control', '--xray-focus', '--xray-selection',
    '--xray-hover', '--xray-active', '--xray-disabled', '--xray-accent-soft',
    '--xray-pending', '--xray-neutral', '--xray-shadow', '--xray-overlay',
  ];
  for (const role of roles) assert.match(tokens, new RegExp(`${role}:`), `${role} fallback is missing`);
  for (const theme of ['xray-dark', 'xray-light', 'github-dark', 'github-light', 'tokyo-night', 'catppuccin-mocha', 'dracula', 'gruvbox-dark', 'midnight']) {
    const block = styles.match(new RegExp(`\\.xray-theme-${theme}\\s*\\{[^}]*\\}`));
    assert.ok(block, `${theme} preset block is missing`);
    for (const role of roles) assert.match(block[0], new RegExp(`${role}:`), `${role} missing from ${theme}`);
  }
});

test('theme styles use semantic focus and prompt roles without undefined variables', () => {
  const styles = read('src/panel/styles.css');
  const hud = read('src/panel/styles/hud.css');
  assert.match(styles, /var\(--xray-focus\)/);
  assert.match(styles, /var\(--xray-accent-soft\)/);
  assert.match(styles, /var\(--xray-overlay\)/);
  assert.doesNotMatch(styles, /--xray-accent-2/);
  assert.match(hud, /var\(--xray-shadow\)/);
});

test('Custom Theme editor exposes overlay roles for explicit color overrides', () => {
  const settings = read('src/panel/components/settings/SettingsModal.tsx');
  assert.match(settings, /key: 'shadow', label: 'Shadow'/);
  assert.match(settings, /key: 'overlay', label: 'Overlay'/);
});
