// Injected panel <-> host page boundary: focus trap, event isolation, and the legacy XRAY_Panel/XRAY_Store contract.

const assert = require('node:assert/strict');
const test = require('node:test');

const { read } = require('./helpers/source');

test('overlay focus trap blocks page single-key shortcuts before document handlers', () => {
  const content = read('content/content.js');
  const manifest = read('manifest.json');

  assert.match(manifest, /"run_at":\s*"document_start"/);
  assert.match(content, /const XRAY_FOCUS_TRAP_TARGETS = \[window, document\]/);
  assert.match(content, /XRAY_FOCUS_TRAP_TARGETS\.forEach/);
  assert.match(content, /target\.addEventListener\(type, _trapFocusedPanelEvent, true\)/);
  assert.match(content, /if \(!window\.__XRAY_focusTrapActive\) return/);
  assert.match(content, /if \(_isKeyboardEvent\(event\)\) event\.preventDefault\(\)/);
  assert.match(content, /event\.stopImmediatePropagation\(\)/);
});

test('overlay focus trap preserves XRAY toggle and browser modifier shortcuts', () => {
  const content = read('content/content.js');
  const bridge = read('src/panel/bridge/panelApi.ts');

  assert.match(content, /function _isBrowserShortcut\(event\)/);
  assert.match(content, /!event\.ctrlKey && !event\.metaKey && !event\.altKey/);
  assert.match(content, /if \(_isToggleShortcut\(event\)\) return false/);
  assert.match(content, /if \(_isKeyboardEvent\(event\) && _isBrowserShortcut\(event\)\) return/);
  assert.match(content, /if \(_isKeyboardEvent\(event\) && _isToggleShortcut\(event\)\) return/);
  assert.match(bridge, /function focusPanelInput\(deps: PanelApiDeps\)/);
  assert.match(bridge, /querySelector<HTMLElement>\('\.xray-prompt input, \.xray-input, button, \[tabindex\]:not\(\[tabindex="-1"\]\)'\)/);
  assert.match(bridge, /if \(nextOpen\) focusPanelInput\(deps\)/);
});

test('injected panel isolates its own scroll/click/keyboard from the page behind it', () => {
  const iso = read('src/panel/runtime/eventIsolation.ts');
  const main = read('src/panel/main.tsx');
  const hud = read('src/panel/hud-main.tsx');
  const styles = read('src/panel/styles.css');

  // the isolation stops leak-prone events on the shadow host in the BUBBLE phase
  // (not capture), so the panel handles them first and the page never does
  assert.match(iso, /export function isolatePanelEvents/);
  assert.match(iso, /event\.stopPropagation\(\)/);
  for (const type of ['wheel', 'click', 'keydown', 'pointerdown', 'contextmenu', 'touchmove',
    // focus, drag, and clipboard events also compose across the shadow boundary
    'focusin', 'focusout', 'dragstart', 'drop', 'copy', 'paste']) {
    assert.match(iso, new RegExp(`'${type}'`), `isolation should cover ${type}`);
  }
  // bubble phase => no third `true` capture arg on the host listener
  assert.match(iso, /host\.addEventListener\(type, stop\);/);
  // attached once per host
  assert.match(iso, /dataset\[ISOLATED_FLAG\] === '1'/);

  // both injected surfaces wire it onto their shadow host
  assert.match(main, /isolatePanelEvents\(host\)/);
  assert.match(hud, /isolatePanelEvents\(shadowRoot\.host\)/);

  // scroll chaining is contained panel-wide so a list scrolled to its edge
  // doesn't scroll the website behind it
  assert.match(styles, /overscroll-behavior:\s*contain/);
});

test('React panel exposes the legacy XRAY_Panel API and injects inline Shadow DOM CSS', () => {
  const main = read('src/panel/main.tsx');
  const bridge = read('src/panel/bridge/panelApi.ts');

  assert.match(main, /tokens\.css\?inline/);
  assert.match(main, /styles\.css\?inline/);
  assert.match(main, /attachShadow\(\{\s*mode:\s*'open'\s*\}\)/);
  assert.match(main, /createPanelApi/);
  assert.match(main, /window\.XRAY_Panel\s*=\s*createPanelApi/);
  assert.match(main, /alreadyInitialized/);
  assert.match(main, /options\.devtoolsMode === undefined/);
  assert.match(main, /if \(alreadyInitialized[\s\S]{0,160}return;/);
  for (const method of ['init', 'add', 'show', 'hide', 'toggle', 'isOpen', 'setActiveTab', 'selectEntry', 'selectEntryContext', 'getSelectedEntry', 'getEntries', 'hasSelection', 'openExport', 'focusSearch']) {
    assert.match(bridge, new RegExp(`${method}\\(`), `${method} API method is required`);
  }
});

test('React panel persists UI preferences through XRAY_Store without storing captured entries', () => {
  const main = read('src/panel/main.tsx');
  const store = read('src/panel/store.ts');
  const storageBridge = read('src/panel/runtime/storageBridge.ts');
  const persistence = read('src/panel/models/panelPersistence.ts');

  assert.match(storageBridge, /export async function getStoredValue/);
  assert.match(storageBridge, /window\.XRAY_Store\?\.get/);
  assert.match(storageBridge, /export async function setStoredValue/);
  assert.match(storageBridge, /window\.XRAY_Store\?\.set/);
  // These two previously pinned a localStorage fallback. In a content script
  // localStorage belongs to the PAGE, so that path could write panel state — including
  // the BYOK API key, which setStoredValue is called with — into the visited site's own
  // storage in plaintext. The fallback is gone; the assertions now pin its absence.
  // Matches call sites specifically, not the word — the file explains in prose why the
  // fallback was removed, and a blanket /localStorage/ would match that explanation.
  assert.doesNotMatch(storageBridge, /localStorage\s*\./);
  assert.doesNotMatch(storageBridge, /localStorage\s*\[/);
  assert.match(persistence, /REACT_PANEL_PREFERENCES_KEY/);
  assert.match(persistence, /export function serializePanelPreferences/);
  assert.match(persistence, /export function applyPanelPreferences/);
  assert.match(persistence, /statusFilters:\s*Array\.from\(state\.statusFilters\)/);
  assert.match(persistence, /pinnedIds:\s*Array\.from\(state\.pinnedIds\)/);
  assert.doesNotMatch(persistence, /entries/);
  assert.doesNotMatch(persistence, /consoleEvents/);
  assert.match(store, /restorePreferences\(\): Promise<void>/);
  assert.match(store, /persistPanelPreferences\(get\(\)\)/);
  assert.match(main, /await usePanelStore\.getState\(\)\.restorePreferences\(\)/);
});

test('React legacy bridge centralizes side effects needed by old content and console flows', () => {
  const bridge = read('src/panel/bridge/panelApi.ts');
  const main = read('src/panel/main.tsx');
  const consoleBridge = read('src/panel/runtime/consoleBridge.ts');

  assert.match(bridge, /export function createPanelApi/);
  assert.match(bridge, /ensureInit\(\)/);
  assert.match(bridge, /initConsoleRuntime\(\)/);
  assert.match(consoleBridge, /window\.XRAY_Console\?\.init\?\.\(\)/);
  assert.match(bridge, /window\.__XRAY_focusTrapActive/);
  assert.match(bridge, /entry\?\.type === 'api'/);
  assert.match(bridge, /setActiveTab\('api'\)/);
  assert.match(bridge, /entry\?\.type === 'log'/);
  assert.match(bridge, /setActiveTab\('logs'\)/);
  assert.match(bridge, /querySelector<HTMLInputElement>\('\.xray-input'\)/);
  assert.doesNotMatch(main, /const api:\s*XrayPanelApi/);
});

test('content script references XRAY_Panel through window to avoid cascading ReferenceErrors', () => {
  const content = read('content/content.js');

  assert.doesNotMatch(content, /[^\w.]XRAY_Panel\.(init|add|toggle|show)/);
  assert.match(content, /window\.XRAY_Panel\?\.init\?\.\(\)/);
  assert.match(content, /window\.XRAY_Panel\?\.add\?\.\(entry\)/);
  assert.match(content, /window\.XRAY_Panel\?\.toggle\?\.\(\)/);
});

test('injected side panel is resizable, dockable, persisted, and dismissible', () => {
  const shell = read('src/panel/components/shell/PanelShell.tsx');
  const settings = read('src/panel/models/panelSettings.ts');
  const types = read('src/panel/types.ts');
  const persistence = read('src/panel/models/panelPersistence.ts');
  const styles = read('src/panel/styles.css');
  const hud = read('src/panel/styles/hud.css');
  const main = read('src/panel/main.tsx');

  // width + dock side live in PanelSettings, so they round-trip through the existing
  // persisted preferences record (no captured data stored)
  assert.match(types, /panelWidth: number/);
  assert.match(types, /dockSide: DockSide/);
  assert.match(settings, /panelWidth: 960/);
  assert.match(settings, /dockSide: 'right'/);
  assert.match(settings, /PANEL_WIDTH_MIN/);
  // settings already persist via serializePanelPreferences -> no new storage key needed
  assert.match(persistence, /settings: state\.settings/);

  // a keyboard-accessible resize grabber drives an inline --xray-panel-width
  assert.match(shell, /xray-resize-handle/);
  assert.match(shell, /role="separator"/);
  assert.match(shell, /'--xray-panel-width'/);
  assert.match(shell, /onPointerMove=\{onResizePointerMove\}/);
  assert.match(shell, /updateSettings\(\{ panelWidth/);
  assert.match(styles, /width: var\(--xray-panel-width/);
  assert.match(styles, /\.xray-dock-left/);

  // dockable chrome is gated to the docked side panel and hidden inside the floating HUD
  assert.match(shell, /const dockable = mode === 'hud'/);
  assert.match(hud, /xray-mode-hud \.xray-resize-handle/);

  // Escape dismisses the docked panel (but not devtools/window), with focus returned to the page
  assert.match(main, /store\.open && !store\.devtoolsMode\) store\.setOpen\(false\)/);
  assert.match(read('src/panel/store.ts'), /_lastPageFocus/);

  // the host is hardened against page CSS that would break fixed positioning
  assert.match(main, /function hardenHost/);
  assert.match(main, /transform: 'none'/);

  // slide-in is a one-shot animation neutralized by reduced-motion (which now includes the panel itself)
  assert.match(styles, /@keyframes xray-panel-slide-right/);
  assert.match(styles, /\(prefers-reduced-motion: reduce\) \{\s*\n\s*\.xray-panel,/);
});
