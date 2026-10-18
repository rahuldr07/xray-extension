// Accessibility wiring: tablist semantics, live regions, and keyboard operability.
//
// These pin structure that is invisible in a screenshot and easy to drop during a
// refactor — a browser audit found every one of them missing.

const assert = require('node:assert/strict');
const test = require('node:test');

const { read, readConsoleSources } = require('./helpers/source');

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

test('API list uses one selection focus owner with stable option descendants', () => {
  const list = read('src/panel/components/api/EntriesWorkspace.tsx');
  assert.match(list, /role="listbox"/);
  assert.match(list, /aria-activedescendant/);
  assert.match(list, /id=\{`xray-api-option-\$\{entry\.id\}`\}/);
  assert.match(list, /role="option"/);
  assert.match(list, /tabIndex=\{-1\}/);
});

test('logs use one listbox focus owner with stable active descendants', () => {
  const list = read('src/panel/components/api/EntriesWorkspace.tsx');

  assert.match(list, /role="listbox"/);
  assert.match(list, /aria-activedescendant/);
  assert.match(list, /role="option"/);
  assert.match(list, /id=\{`xray-log-option-\$\{entry\.id\}`\}/);
  assert.match(list, /tabIndex=\{0\}/);
  assert.match(list, /tabIndex=\{-1\}/);
  assert.match(list, /PageDown/);
  assert.match(list, /PageUp/);
  assert.match(list, /event\.key === 'Enter' \|\| event\.key === ' '/);
});

test('selection reveal, replay visibility, scoped search, filtering, and onboarding semantics have explicit boundaries', () => {
  const entries = read('src/panel/components/api/EntriesWorkspace.tsx');
  const palette = read('src/panel/components/shell/CommandPalette.tsx');
  const search = read('src/panel/components/search/GlobalSearch.tsx');
  const consoleWorkspace = readConsoleSources();
  const modal = read('src/panel/components/common/ModalShell.tsx');
  const confirmation = read('src/panel/components/common/ConfirmationModal.tsx');
  const firstRun = read('src/panel/components/common/FirstRun.tsx');

  assert.match(entries, /toggleGroup\(.*groupKey/);
  assert.match(entries, /virtualizer\.scrollToIndex/);
  assert.match(palette, /isReplayableEntry\(selected\)/);
  assert.match(palette, /aria-live="polite"/);
  assert.match(search, /value="method"/);
  assert.match(search, /value="status"/);
  assert.match(search, /value="message"/);
  assert.match(search, /aria-live="polite"/);
  assert.match(consoleWorkspace, /safeStringify/);
  assert.match(consoleWorkspace, /CONSOLE_SEARCH/);
  assert.match(modal, /initialFocusRef/);
  assert.match(confirmation, /initialFocusRef/);
  assert.match(confirmation, /cancelRef/);
  assert.doesNotMatch(firstRun, /role="status"/);
  assert.match(firstRun, /AI analysis.*explicitly/i);
});

test('panel keyboard shortcuts are installed on every surface that renders the panel', () => {
  // Ctrl+K and Ctrl+Shift+F were dead in the pop-out because window-main.tsx never
  // called main.tsx's private handler. Escape only appeared to work there because
  // ModalShell installs its own, which covers modals but no layer below them.
  const main = read('src/panel/main.tsx');
  const windowMain = read('src/panel/window-main.tsx');
  const keyboard = read('src/panel/runtime/panelKeyboard.ts');

  // The docked panel also hands over its CLOSED shadow root, without which the
  // Escape-while-typing guard cannot see the focused field at all.
  assert.match(main, /installPanelKeyboard\(\{ dismissible: true, getRoot: /);
  assert.match(windowMain, /installPanelKeyboard\(\{ dismissible: false \}\)/);
  assert.match(keyboard, /key === 'k'/);
  assert.match(keyboard, /event\.shiftKey && key === 'f'/);
  // Installing twice would double-handle every keystroke; init() is re-entrant.
  assert.match(keyboard, /if \(installed\) return;/);
});

test('modal focus trapping resolves focus inside the owning shadow root', () => {
  const modal = read('src/panel/components/common/ModalShell.tsx');
  const keyboard = read('src/panel/runtime/panelKeyboard.ts');

  // document.activeElement retargets to the closed-shadow host. The modal must
  // resolve the active element from its own root, and only the topmost dialog may
  // handle Tab when overlays are stacked.
  assert.match(modal, /getRootNode\(\)/);
  assert.match(modal, /activeElement/);
  assert.match(modal, /role="dialog"/);
  assert.match(modal, /topmost|topmostDialog|isTopmost/);

  // Escape belongs to the single ordered panel ladder; per-modal Escape handlers
  // used to close multiple layers in one keypress.
  assert.doesNotMatch(modal, /if \(event\.key === 'Escape'\)/);
  assert.match(keyboard, /store\.explainEntry\) store\.closeExplain\(\)/);
});

test('a session restore repopulates the console tab, not just the API list', () => {
  // Console is the default tab. restoreEntries set `entries` alone while
  // ConsoleWorkspace reads `consoleEvents` and nothing else, so after every reopen
  // the first thing shown was an empty console over a populated badge count.
  const store = read('src/panel/store.ts');

  // FIXED: this derived an event for EVERY imported entry, including ones the entry
  // cap then dropped — so importing into a full session added console rows pointing at
  // entries that did not exist, and clicking one cleared the console context. The
  // events now describe only the entries that survived the merge.
  assert.match(store, /const restoredEvents = freshKept\.map\(entryToConsoleEvent\)/);
  assert.match(store, /consoleEvents: \[\.\.\.restoredEvents, \.\.\.state\.consoleEvents\]\.slice\(-MAX_CONSOLE_EVENTS\)/);
  // FIXED: the merge was `[...fresh, ...entries].slice(-maxEntries)`, which trims from
  // the front — where the imported entries are — so an import into a session at the cap
  // kept zero of them while the modal reported success.
  assert.match(store, /const freshKept = freshRoom \? fresh\.slice\(-freshRoom\) : \[\]/);
  assert.match(store, /const room = Math\.max\(0, maxEntries - freshKept\.length\)/);
});

test('secondary controls expose state, names, and keyboard actions', () => {
  const consoleWorkspace = readConsoleSources();
  const entries = read('src/panel/components/api/EntriesWorkspace.tsx');
  const replay = read('src/panel/components/replay/ReplayModal.tsx');
  const settings = read('src/panel/components/settings/SettingsModal.tsx');
  const rules = read('src/panel/components/rules/Rules.tsx');
  const requestDetail = read('src/panel/components/detail/RequestDetail.tsx');
  const palette = read('src/panel/components/shell/CommandPalette.tsx');
  const exportModal = read('src/panel/components/export/ExportModal.tsx');

  assert.match(consoleWorkspace, /aria-label="Filter console messages"/);
  // Requests are inspected in API; Console keeps only the request-context picker.
  assert.doesNotMatch(consoleWorkspace, /function NetworkTable|NetworkRow|xray-mini-tab/);
  assert.match(consoleWorkspace, /aria-label="Console request context"/);
  assert.match(consoleWorkspace, /aria-label="Console command"/);
  assert.match(entries, /aria-label=\{row\.groupExpanded \? 'Collapse endpoint group' : 'Expand endpoint group'\}/);
  assert.doesNotMatch(entries, /tabIndex=\{-1\} aria-label=\{row\.groupExpanded/);
  assert.match(entries, /<button className=\{`xray-pin/);
  assert.match(entries, /aria-pressed=\{pinned\}/);
  assert.match(entries, /aria-label="Search API requests"/);
  assert.match(entries, /aria-label="Search logs"/);
  assert.match(entries, /aria-label="Log level filters"/);
  assert.match(entries, /role="group" aria-label="Request tabs"/);
  assert.match(entries, /aria-pressed=\{activeTab === tab\.id\}/);
  assert.match(replay, /aria-label="Replay method"/);
  assert.match(replay, /aria-label="Replay URL"/);
  assert.match(settings, /aria-label="AI provider API key"/);
  assert.match(settings, /aria-pressed=\{section === item\.id\}/);
  assert.match(rules, /aria-label="Rule name"/);
  assert.match(requestDetail, /aria-label="Filter request and response headers"/);
  assert.match(palette, /aria-label="Search commands and requests"/);
  assert.match(exportModal, /aria-pressed=\{mode === 'selected'\}/);
  assert.match(exportModal, /aria-pressed=\{mode === 'session'\}/);
  assert.match(exportModal, /aria-pressed=\{format === item\}/);
});

test('expanded console detail actions do not toggle the parent row', () => {
  const detail = read('src/panel/components/detail/LogDetail.tsx');
  assert.match(detail, /onClick=\{\(event\) => \{ event\.stopPropagation\(\); void loadFull\(\); \}\}/);
});

test('AI progress and provider errors are announced', () => {
  const explain = read('src/panel/components/ai/ExplainModal.tsx');
  const synthesis = read('src/panel/components/ai/FindingSynthesisModal.tsx');
  assert.match(explain, /className="xray-explain-loading" role="status" aria-live="polite"/);
  assert.match(explain, /className="xray-explain-error" role="alert"/);
  assert.match(synthesis, /className="xray-explain-loading" role="status" aria-live="polite"/);
  assert.match(synthesis, /className="xray-explain-error" role="alert"/);
});

test('the shared Notice is a live region only when the caller says the message changes at runtime', () => {
  const notice = read('src/panel/components/common/Notice.tsx');
  assert.match(notice, /live = false/);
  assert.match(notice, /live \? \(tone === 'error' \? 'alert' : 'status'\) : undefined/);
  // The two runtime-varying messages opt in; nothing else hand-rolls a status <p> for them.
  assert.match(read('src/panel/components/rules/Rules.tsx'), /<Notice tone="warning" live>Page bridge unavailable/);
  assert.match(read('src/panel/components/investigations/InvestigationPanel.tsx'), /<Notice tone=\{[^}]*\} live=\{storage !== 'ready'\}>\{storageMessages\[storage\]\}/);
});

test('Rules sections are a real tablist and Presets/overflow are disclosure groups, not ARIA menus', () => {
  const rules = read('src/panel/components/rules/Rules.tsx');
  assert.match(rules, /role="tablist" aria-label="Rules sections"/);
  assert.match(rules, /role="tab"/);
  assert.match(rules, /role="tabpanel" tabIndex=\{0\} aria-labelledby=/);
  assert.match(rules, /tabIndex=\{subTab === tab\.id \? 0 : -1\}/);
  const menu = read('src/panel/components/common/DisclosureMenu.tsx');
  assert.match(menu, /aria-expanded=\{open\} aria-controls=\{menuId\}/);
  assert.match(menu, /role="group"\s+aria-label=\{menuLabel\}/);
  // One implementation of the menu behaviour, used by all three disclosure menus.
  for (const file of ['common/DisclosureMenu.tsx', 'detail/RequestDetail.tsx', 'console/SnippetsMenu.tsx']) {
    assert.match(read(`src/panel/components/${file}`), /handleMenuKeyDown\(/, file);
    assert.match(read(`src/panel/components/${file}`), /useMenuDismiss\(/, file);
  }
  assert.doesNotMatch(menu + rules + readConsoleSources() + read('src/panel/components/detail/RequestDetail.tsx'), /aria-haspopup/);
});
