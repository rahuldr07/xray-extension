// Panel shell navigation, tabs, command palette, global search, and modal shells.

const assert = require('node:assert/strict');
const test = require('node:test');

const { read, exists } = require('./helpers/source');

test('React shell navigation and command palette share tab metadata', () => {
  const app = read('src/panel/App.tsx');
  const shell = read('src/panel/components/shell/PanelShell.tsx');
  const tabs = read('src/panel/components/shell/panelTabs.tsx');
  const palette = read('src/panel/components/shell/CommandPalette.tsx');
  const summary = read('src/panel/models/sessionSummary.ts');

  assert.match(tabs, /export const iconProps/);
  assert.match(tabs, /export const panelTabs/);
  assert.match(tabs, /id:\s*'console'/);
  assert.match(tabs, /id:\s*'api'/);
  assert.match(tabs, /id:\s*'logs'/);
  assert.match(tabs, /id:\s*'rules'/);
  assert.match(tabs, /id:\s*'insights'/);
  // Notebook and Settings are no longer top-level tabs
  assert.doesNotMatch(tabs, /id:\s*'notebook'/);
  assert.doesNotMatch(tabs, /id:\s*'settings'/);
  assert.match(palette, /panelTabs\.map/);
  assert.match(palette, /setActiveTab\(tab\.id\)/);
  assert.match(shell, /panelTabs\.map/);
  assert.match(shell, /buildSessionSummary\(entries\)/);
  assert.match(summary, /export function buildSessionSummary/);
  assert.match(summary, /apiCount/);
  assert.match(summary, /logCount/);
  assert.match(summary, /errorCount/);
  assert.match(summary, /totalBytes/);
  assert.match(app, /import \{ PanelShell \}/);
  assert.match(app, /<PanelShell mode=\{mode\}>/);
  assert.match(palette, /import \{ iconProps, panelTabs \}/);
  assert.match(app, /import \{ CommandPalette \}/);
  assert.doesNotMatch(app, /xray-topbar/);
  assert.doesNotMatch(app, /const tabs:/);
  assert.doesNotMatch(app, /function CommandPalette/);
});

test('React secondary tabs are separate components instead of App inline placeholders', () => {
  const app = read('src/panel/App.tsx');
  const insights = read('src/panel/components/insights/Insights.tsx');
  const rules = read('src/panel/components/rules/Rules.tsx');
  const insightsModel = read('src/panel/models/insights.ts');

  assert.match(app, /import \{ Insights \}/);
  assert.match(app, /import \{ Rules \}/);
  assert.match(insights, /export function Insights/);
  assert.match(insights, /buildInsightsSummary\(entries\)/);
  assert.match(rules, /export function Rules/);
  assert.match(insightsModel, /export function buildInsightsSummary/);
  assert.match(insightsModel, /repeatedEndpoints/);
  // Notebook was cut and folded into Console snippets; Settings is modal-only.
  assert.doesNotMatch(app, /import \{ Notebook \}/);
  assert.doesNotMatch(app, /activeTab === 'notebook'/);
  assert.doesNotMatch(app, /activeTab === 'settings'/);
  assert.doesNotMatch(app, /function Insights/);
  assert.doesNotMatch(app, /function repeatedEndpoints/);
  assert.ok(!exists('src/panel/components/notebook/Notebook.tsx'));
  assert.ok(!exists('src/panel/components/settings/Settings.tsx'));
});

test('React modals use a shared safe shell for export, settings, command palette, and confirmations', () => {
  const app = read('src/panel/App.tsx');
  const modalShell = read('src/panel/components/common/ModalShell.tsx');
  const exportModal = read('src/panel/components/export/ExportModal.tsx');
  const settingsModal = read('src/panel/components/settings/SettingsModal.tsx');
  const confirmation = read('src/panel/components/common/ConfirmationModal.tsx');
  const commandPalette = read('src/panel/components/shell/CommandPalette.tsx');
  const styles = read('src/panel/styles.css');

  assert.match(app, /<SettingsModal \/>/);
  assert.match(app, /<ConfirmationModal \/>/);
  assert.match(modalShell, /role="dialog"/);
  assert.match(modalShell, /aria-modal="true"/);
  assert.match(modalShell, /event\.key !== 'Tab'/);
  assert.match(modalShell, /event\.key === 'Escape'/);
  assert.doesNotMatch(modalShell, /dangerouslySetInnerHTML|innerHTML/);
  assert.match(exportModal, /<ModalShell/);
  assert.match(settingsModal, /<ModalShell/);
  assert.match(confirmation, /<ModalShell/);
  assert.match(commandPalette, /<ModalShell/);
  assert.match(styles, /\.xray-settings-modal/);
  assert.match(styles, /\.xray-confirm-modal/);
});

test('global search finds text across every captured URL, header, and body', () => {
  const model = read('src/panel/models/globalSearch.ts');
  const component = read('src/panel/components/search/GlobalSearch.tsx');
  const app = read('src/panel/App.tsx');
  const main = read('src/panel/main.tsx');
  const store = read('src/panel/store.ts');
  const palette = read('src/panel/components/shell/CommandPalette.tsx');

  // pure, testable search model: substring by default, opt-in regex, bounded
  assert.match(model, /export function searchEntries/);
  assert.match(model, /new RegExp\(q, caseSensitive \? '' : 'i'\)/);
  assert.match(model, /Invalid regular expression/);
  assert.match(model, /Response body/);
  assert.match(model, /Request body/);
  // reports exact match offsets so highlighting survives regex matches
  assert.match(model, /matchStart/);
  assert.match(model, /MAX_MATCHES/);

  // wired as a modal with its own store flag, mounted in the app
  assert.match(store, /globalSearchOpen: boolean/);
  assert.match(store, /setGlobalSearchOpen: \(value\) => set\(\{ globalSearchOpen: value \}\)/);
  assert.match(app, /<GlobalSearch \/>/);
  assert.match(component, /searchEntries\(entries, query, \{ regex, caseSensitive \}\)/);

  // Ctrl/Cmd+Shift+F shortcut + Escape layering + command-palette entry.
  // These moved out of main.tsx into runtime/panelKeyboard.ts: the pop-out mounts
  // through window-main.tsx, which never called main.tsx's copy, so Ctrl+K and
  // Ctrl+Shift+F were dead there. Both entrypoints now install the shared handler.
  const keyboard = read('src/panel/runtime/panelKeyboard.ts');
  assert.match(keyboard, /event\.shiftKey && key === 'f'/);
  assert.match(keyboard, /store\.globalSearchOpen\) store\.setGlobalSearchOpen\(false\)/);
  assert.match(palette, /setGlobalSearchOpen\(true\)/);
  assert.match(main, /installPanelKeyboard\(\{ dismissible: true \}\)/);
  // The pop-out is a standalone surface: Escape must not dismiss the panel itself,
  // because nothing would be left and there is no way to reopen it.
  assert.match(read('src/panel/window-main.tsx'), /installPanelKeyboard\(\{ dismissible: false \}\)/);
  assert.match(keyboard, /dismissible && store\.open && !store\.devtoolsMode/);
});

test('new panel surfaces are wired into the app shell and tabs', () => {
  const app = read('src/panel/App.tsx');
  assert.match(app, /<Rules \/>/);
  assert.match(app, /<ReplayModal \/>/);
  assert.match(app, /<ExplainModal \/>/);
  const tabs = read('src/panel/components/shell/panelTabs.tsx');
  assert.match(tabs, /id: 'rules'/);
});

test('command center: fuzzy search across commands and requests, keyboard nav, groups', () => {
  const fuzzy = read('src/panel/models/fuzzy.ts');
  const palette = read('src/panel/components/shell/CommandPalette.tsx');
  const empty = read('src/panel/components/common/EmptyState.tsx');
  const tokens = read('src/panel/styles/tokens.css');
  const styles = read('src/panel/styles.css');

  // fuzzy matcher with scoring + highlight ranges
  assert.match(fuzzy, /export function fuzzyMatch/);
  assert.match(fuzzy, /export function highlightSegments/);
  assert.match(fuzzy, /BOUNDARY/);

  // command center: still shares tab metadata, plus fuzzy + keyboard nav + requests
  assert.match(palette, /const commands =/);
  assert.match(palette, /filteredCommands/);
  assert.match(palette, /panelTabs\.map/);
  assert.match(palette, /setActiveTab\(tab\.id\)/);
  assert.match(palette, /fuzzyMatch\(q, command\.label\)/);
  assert.match(palette, /requestCommands/);
  assert.match(palette, /event\.key === 'ArrowDown'/);
  assert.match(palette, /selectEntry\(entry\.id\)/);
  assert.match(palette, /highlightSegments/);
  assert.match(palette, /xray-command-foot/);

  // elegant empty state with hint/action
  assert.match(empty, /export function EmptyState/);
  assert.match(empty, /hint\?/);
  assert.match(empty, /xray-empty-glyph/);

  // motion system + animated tab indicator
  assert.match(tokens, /--xray-ease:/);
  assert.match(tokens, /--xray-dur:/);
  assert.match(styles, /\.xray-tab\.active::after/);
  assert.match(styles, /@keyframes xray-modal-in/);
});

test('one reusable collapsible-section primitive drives every collapsible region', () => {
  const primitive = read('src/panel/components/common/CollapsibleSection.tsx');
  const styles = read('src/panel/styles.css');
  const store = read('src/panel/store.ts');
  const persistence = read('src/panel/models/panelPersistence.ts');
  const api = read('src/panel/components/api/EntriesWorkspace.tsx');
  const insights = read('src/panel/components/insights/Insights.tsx');

  // native button gives Enter/Space; aria-expanded + aria-controls wire the body
  assert.match(primitive, /export function CollapsibleSection/);
  assert.match(primitive, /aria-expanded=\{!collapsed\}/);
  assert.match(primitive, /aria-controls=\{bodyId\}/);
  // collapsed body is inert (keeps layout for the animation, out of tab order)
  assert.match(primitive, /inert=\{collapsed\}/);
  assert.match(primitive, /state\.collapsedSections\.has\(id\)/);

  // collapsed state is a persisted set, mirrored like expandedGroups
  assert.match(store, /collapsedSections: new Set<string>\(\)/);
  assert.match(store, /toggleSection: \(id\)/);
  assert.match(persistence, /collapsedSections: Array\.from\(state\.collapsedSections\)/);
  assert.match(persistence, /collapsedSections: new Set\(preferences\.collapsedSections\)/);

  // the grid-rows height animation + reduced-motion opt-out
  assert.match(styles, /\.xray-collapsible-body \{[\s\S]*grid-template-rows: 1fr/);
  assert.match(styles, /\.xray-collapsible\.collapsed > \.xray-collapsible-body \{[\s\S]*grid-template-rows: 0fr/);
  assert.match(styles, /prefers-reduced-motion: reduce[\s\S]*\.xray-collapsible-body/);

  // reused across surfaces, not re-implemented per section
  assert.match(api, /import \{ CollapsibleSection \}/);
  assert.match(api, /id="api-stats"/);
  assert.match(api, /id="api-filters"/);
  assert.match(insights, /import \{ CollapsibleSection \}/);
  assert.match(insights, /id="insights-status"/);
});
