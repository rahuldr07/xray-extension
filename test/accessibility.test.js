// Accessibility wiring: tablist semantics, live regions, and keyboard operability.
//
// These pin structure that is invisible in a screenshot and easy to drop during a
// refactor — a browser audit found every one of them missing.

const assert = require('node:assert/strict');
const test = require('node:test');

const { read } = require('./helpers/source');

test('the primary nav is a real tablist, not styled buttons', () => {
  // The tabs were plain <button>s, so the active tab was conveyed by a CSS class
  // alone: a screen reader announced neither which tab was selected nor how many
  // existed, and every tab was its own tab stop.
  const shell = read('src/panel/components/shell/PanelShell.tsx');

  assert.match(shell, /role="tablist"/);
  assert.match(shell, /role="tab"/);
  assert.match(shell, /aria-selected=\{activeTab === tab\.id\}/);
  assert.match(shell, /aria-controls="xray-tabpanel"/);
  // Roving tabindex: the group is one tab stop and arrows move within it.
  assert.match(shell, /tabIndex=\{activeTab === tab\.id \? 0 : -1\}/);
  // The panel the tabs control must be labelled by the active tab.
  assert.match(shell, /role="tabpanel"/);
  assert.match(shell, /aria-labelledby=\{`xray-tab-\$\{activeTab\}`\}/);
});

test('tabs respond to arrow keys, Home and End', () => {
  const shell = read('src/panel/components/shell/PanelShell.tsx');
  assert.match(shell, /function onTabKeyDown/);
  for (const key of ['ArrowLeft', 'ArrowRight', 'Home', 'End']) {
    assert.match(shell, new RegExp(`'${key}'`), `${key} should be handled by the tablist`);
  }
  // Selection wraps at both ends rather than dead-ending.
  assert.match(shell, /index === 0 \? last : index - 1/);
  assert.match(shell, /index === last \? 0 : index \+ 1/);
});

test('the toast live region is always mounted, not injected with its message', () => {
  // A live region created at the same moment as its first message is unreliably
  // announced — assistive tech has to already be observing the region.
  const shell = read('src/panel/components/shell/PanelShell.tsx');

  assert.match(shell, /className="xray-toast-region" role="status" aria-live="polite" aria-atomic="true"/);
  // The message is conditional INSIDE the region, so the region itself is not.
  assert.match(shell, /aria-atomic="true">\s*\n\s*\{toastMessage && \(/);
});

test('the request list supports Home, End, PageUp, PageDown and Space', () => {
  // Previously only ArrowUp/ArrowDown/Enter were handled; everything else fell
  // through to the native scroller, which moved the viewport while the selection
  // stayed put and silently scrolled the selected row out of view.
  const list = read('src/panel/components/api/EntriesWorkspace.tsx');

  assert.match(list, /const navKeys = \['ArrowDown', 'ArrowUp', 'Home', 'End', 'PageDown', 'PageUp'\]/);
  assert.match(list, /event\.key !== 'Enter' && event\.key !== ' '/);
  assert.match(list, /PAGE_STEP/);
  // Selection still follows into view on every move.
  assert.match(list, /virtualizer\.scrollToIndex\(nextIndex, \{ align: 'auto' \}\)/);
});

test('panel keyboard shortcuts are installed on every surface that renders the panel', () => {
  // Ctrl+K and Ctrl+Shift+F were dead in the pop-out because window-main.tsx never
  // called main.tsx's private handler. Escape only appeared to work there because
  // ModalShell installs its own, which covers modals but no layer below them.
  const main = read('src/panel/main.tsx');
  const windowMain = read('src/panel/window-main.tsx');
  const keyboard = read('src/panel/runtime/panelKeyboard.ts');

  assert.match(main, /installPanelKeyboard\(\{ dismissible: true \}\)/);
  assert.match(windowMain, /installPanelKeyboard\(\{ dismissible: false \}\)/);
  assert.match(keyboard, /key === 'k'/);
  assert.match(keyboard, /event\.shiftKey && key === 'f'/);
  // Installing twice would double-handle every keystroke; init() is re-entrant.
  assert.match(keyboard, /if \(installed\) return;/);
});

test('a session restore repopulates the console tab, not just the API list', () => {
  // Console is the default tab. restoreEntries set `entries` alone while
  // ConsoleWorkspace reads `consoleEvents` and nothing else, so after every reopen
  // the first thing shown was an empty console over a populated badge count.
  const store = read('src/panel/store.ts');

  assert.match(store, /const restoredEvents = fresh\.map\(entryToConsoleEvent\)/);
  assert.match(store, /consoleEvents: \[\.\.\.restoredEvents, \.\.\.get\(\)\.consoleEvents\]\.slice\(-MAX_CONSOLE_EVENTS\)/);
});
