// HUD content mount and the DevTools/HUD/pop-out window entrypoints.

const assert = require('node:assert/strict');
const test = require('node:test');

const { read } = require('./helpers/source');

test('HUD host is a standalone closed-shadow content mount with persisted drag and resize state', () => {
  const hud = read('content/hud-mount.js');

  assert.doesNotMatch(hud, /^\s*import\s/m);
  assert.match(hud, /attachShadow\(\{\s*mode:\s*'closed'\s*\}\)/);
  assert.match(hud, /const STORE_KEY = 'xray_hud_state'/);
  assert.match(hud, /const SNAP = 40/);
  assert.match(hud, /\['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'\]/);
  assert.match(hud, /chrome\.runtime\.getURL\('dist\/hud-ui\.js'\)/);
  assert.match(hud, /window\.XRAY_HUD =/);
  assert.match(hud, /mount,/);
  assert.match(hud, /destroy,/);
  assert.match(hud, /collapse,/);
  assert.match(hud, /expand,/);
  assert.match(hud, /isVisible,/);
  assert.match(hud, /updateCount,/);
  assert.match(hud, /chrome\.runtime\.onMessage\.addListener/);
  assert.match(hud, /XRAY_HUD_TOGGLE/);
  assert.match(hud, /xray-drag-handle/);
  assert.match(hud, /storageSet\(\{ \.\.\.state \}\)/);
});

test('React shell exposes a mode switcher and background opens HUD or pop-out window', () => {
  const shell = read('src/panel/components/shell/PanelShell.tsx');
  const styles = read('src/panel/styles.css');
  const background = read('background.js');

  assert.match(shell, /XrayAppMode/);
  assert.match(shell, /IconDeviceLaptop/);
  assert.match(shell, /IconPictureInPicture/);
  assert.match(shell, /IconArrowsMaximize/);
  assert.match(shell, /XRAY_HUD_TOGGLE_ACTIVE/);
  assert.match(shell, /XRAY_OPEN_WINDOW/);
  assert.match(shell, /xray-mode-switcher/);
  assert.match(shell, /mode === 'devtools'/);
  assert.match(shell, /mode === 'hud'/);
  assert.match(shell, /mode === 'window'/);
  assert.match(shell, /xray-drag-handle/);
  assert.match(styles, /\.xray-mode-switcher/);
  assert.match(styles, /\.xray-panel\.xray-mode-window/);
  assert.match(styles, /\.xray-drag-handle/);
  assert.match(background, /let popoutWindowId = null/);
  assert.match(background, /function _sendHudToggle/);
  assert.match(background, /chrome\.action\.onClicked/);
  assert.match(background, /XRAY_HUD_TOGGLE/);
  assert.match(background, /XRAY_HUD_TOGGLE_ACTIVE/);
  assert.match(background, /XRAY_OPEN_WINDOW/);
  assert.match(background, /chrome\.windows\.create/);
  assert.match(background, /chrome\.windows\.update/);
  assert.match(background, /window\.html/);
});
