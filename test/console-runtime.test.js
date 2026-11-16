// React console workspace, the console bridge, snippets, and stream tail behaviour.

const assert = require('node:assert/strict');
const test = require('node:test');

const { read, readConsoleSources } = require('./helpers/source');

test('React console executes through the existing hardened bridge and renders values as text', () => {
  const app = read('src/panel/App.tsx');
  const store = read('src/panel/store.ts');
  const utils = read('src/panel/utils.ts');
  const consoleBridge = read('src/panel/runtime/consoleBridge.ts');
  const consoleWorkspace = readConsoleSources();
  const jsonView = read('src/panel/components/detail/JsonView.tsx');

  // The prompt runs through the store, which re-sends this surface's selection and
  // pins to the shared engine before handing the code to the bridge (I2).
  assert.match(consoleWorkspace, /evaluateConsoleCommand\(code\)/);
  // …with the surface's lossless body reader, so res/req/pins reach the page exactly (spec J8).
  assert.match(store, /syncConsolePins\(consolePinMap\(state\)\);\n {2}return executeConsoleCommand\(code, consoleBodyValue\);/);
  assert.match(consoleWorkspace, /navigateConsoleHistory\('up'\)/);
  assert.match(store, /setConsoleContext\(entry\)/);
  assert.match(consoleBridge, /export async function executeConsoleCommand/);
  assert.match(consoleBridge, /const bridge = window\.XRAY_Console/);
  assert.match(consoleBridge, /return await bridge\.execute\(code, readBody \? \{ readBody \} : undefined\)/);
  assert.match(consoleBridge, /export function setConsoleContext/);
  assert.match(consoleBridge, /window\.XRAY_Console\?\.setContext\?\.\(entry\)/);
  assert.match(consoleBridge, /export function navigateConsoleHistory/);
  assert.match(consoleBridge, /window\.XRAY_Console\?\.navigateHistory\(direction\)/);
  assert.match(jsonView, /safeStringify\(value\)/);
  // safeStringify tracks ancestors along the current branch (was: a WeakSet that
  // only ever grew, which reported a repeated sibling as circular).
  assert.match(utils, /const ancestors: object\[\] = \[\]/);
  assert.match(utils, /\[Circular\]/);
  assert.match(utils, /truncated/);
  assert.doesNotMatch(app, /dangerouslySetInnerHTML/);
  assert.doesNotMatch(consoleWorkspace, /dangerouslySetInnerHTML/);
});

test('React console owns output components while API owns the request ledger', () => {
  const app = read('src/panel/App.tsx');
  const consoleWorkspace = readConsoleSources();

  assert.match(consoleWorkspace, /export function ConsoleWorkspace/);
  assert.match(consoleWorkspace, /function ConsoleStream/);
  assert.match(consoleWorkspace, /function ConsolePrompt/);
  assert.match(consoleWorkspace, /function ConsoleStatusbar/);
  assert.match(consoleWorkspace, /useConsoleEvents/);
  assert.match(consoleWorkspace, /events\.filter\(\(event\) => event\.type !== 'network'\)/);
  assert.doesNotMatch(consoleWorkspace, /function NetworkTable|useFilteredNetworkEvents|networkFilters|miniTabs/);
  assert.match(consoleWorkspace, /aria-label="Console request context"/);
  assert.match(consoleWorkspace, /Inspect in API/);
  assert.match(read('src/panel/components/api/EntriesWorkspace.tsx'), /aria-label="Captured requests"/);
  // Old persisted preferences remain readable; their value no longer hides output.
  assert.match(read('src/panel/types.ts'), /ConsoleMiniTab = 'network' \| 'console'/);
  assert.match(consoleWorkspace, /JsonView/);
  assert.doesNotMatch(app, /function NetworkTable/);
  assert.doesNotMatch(app, /function ConsolePrompt/);
});

test('Console owns saved snippets and secondary tabs have real workflows', () => {
  const consoleWorkspace = readConsoleSources();
  const insights = read('src/panel/components/insights/Insights.tsx');
  const palette = read('src/panel/components/shell/CommandPalette.tsx');
  const insightsModel = read('src/panel/models/insights.ts');
  const store = read('src/panel/store.ts');

  // snippets replace the notebook and live in the console
  assert.match(consoleWorkspace, /function SnippetsMenu/);
  assert.match(consoleWorkspace, /state\.snippets/);
  // snippets are saved with an optional name, renameable in place, and
  // deletion is undoable
  assert.match(consoleWorkspace, /saveSnippet\(\{ code: draft, title: nameText/);
  assert.match(consoleWorkspace, /renameSnippet\(id, renameText\)/);
  assert.match(consoleWorkspace, /removeSnippet\(snippet\.id\)/);
  assert.match(consoleWorkspace, /Undo delete/);
  assert.match(store, /saveSnippet: \(snippet\)/);
  assert.match(store, /renameSnippet: \(id, title\)/);
  assert.match(store, /removeSnippet: \(id\)/);
  assert.match(store, /snippets:/);
  assert.match(insightsModel, /statusCounts/);
  assert.match(insightsModel, /topSlowRequests/);
  assert.match(insightsModel, /nPlusOneCandidates/);
  assert.match(insights, /InsightMetric/);
  assert.match(insights, /Repeated endpoints/);
  assert.match(insights, /Slowest requests/);
  assert.match(palette, /const commands =/);
  assert.match(palette, /filteredCommands/);
  assert.match(palette, /insertConsoleCommand/);
  assert.match(palette, /setExportOpen\(true\)/);
  assert.match(store, /clearPinned\(\): void/);
  assert.match(store, /saveSnippet\(snippet: \{ code: string; title\?: string \}\): void/);
});

test('React console accepts prepared commands and owns saved snippets', () => {
  const consoleWorkspace = readConsoleSources();
  const store = read('src/panel/store.ts');

  assert.match(store, /consoleDraft: string/);
  assert.match(store, /snippets: Snippet\[\]/);
  assert.match(store, /insertConsoleCommand: \(command\) => set\(\{ consoleDraft: command/);
  assert.match(consoleWorkspace, /const command = usePanelStore\(\(state\) => state\.consoleDraft\)/);
  // The editor's native textarea reports each edit; the prompt writes it to the draft.
  assert.match(consoleWorkspace, /onChange\(event\.currentTarget\.value\)/);
  assert.match(consoleWorkspace, /onChange=\{\(value\) => setConsoleDraft\(value\)\}/);
  assert.match(consoleWorkspace, /evaluateConsoleCommand\(code\)/);
  // snippets load into the prompt, they do not auto-execute
  assert.match(consoleWorkspace, /setConsoleDraft\(snippet\.code\)/);
});

test('privileged console runtime declares friendly response aliases', () => {
  // Final review M-7: the names live once, in shared/console-helpers.js RUNTIME_NAMES, and the
  // worker reads that list (it loads the file with importScripts).
  const helpers = read('shared/console-helpers.js');
  const names = /const RUNTIME_NAMES = \[([^\]]*)\]/.exec(helpers)?.[1] || '';
  assert.match(names, /'res'/);
  assert.match(names, /'req'/);
  assert.match(names, /'headers'/);
  assert.match(names, /'entry'/);
  assert.match(names, /'table'/);
  assert.match(read('background.js'), /XRAY_ConsoleHelpers\?\.RUNTIME_NAMES/);
});

test('console Record button is honestly labelled as a stream pause, not capture', () => {
  const consoleWorkspace = readConsoleSources();
  const settingsModal = read('src/panel/components/settings/SettingsModal.tsx');
  const store = read('src/panel/store.ts');
  // paused = buffered (never dropped): the label counts what's waiting and the
  // store flushes the buffer back into the stream on resume
  assert.match(consoleWorkspace, /recording \? 'Live' : pausedCount > 0 \? `Paused · \$\{pausedCount\} new` : 'Paused'/);
  assert.match(consoleWorkspace, /Messages keep buffering and flush back in when you resume/);
  assert.match(store, /_pausedEvents = \[\];/);
  assert.match(store, /pausedCount: 0/);
  assert.doesNotMatch(settingsModal, /Stream to console live/, 'the Console Live button is the only stream control');
});

test('console output retains filter rebaselining, cancellable tail settling and shrinking-row guards', () => {
  const consoleWorkspace = readConsoleSources();
  // widening a filter re-slices the same history: rebaseline against it instead
  // of counting the difference as arrivals and popping a false "N new" pill
  assert.match(consoleWorkspace, /const filterKey = `\$\{levelFilter\} \$\{query\}`;/);
  // Live request arrivals/eviction must not affect this output-only tail. Real
  // App document/closed-shadow regressions live in console-network-scroll.e2e.mjs.
  assert.match(consoleWorkspace, /filterKeyRef\.current = filterKey;\s*\n\s*lastTotalRef\.current = total;\s*\n\s*setNewCount\(0\);/);
  // the settle beats after a jump re-check the pin, so one landing after the
  // user scrolled away can't drag them back to the tail; the last is cancellable
  assert.match(consoleWorkspace, /const pin = \(\): void => \{\s*\n\s*if \(!pinnedRef\.current\) return;/);
  assert.match(consoleWorkspace, /window\.clearTimeout\(pinTimerRef\.current\);\s*\n\s*pinTimerRef\.current = window\.setTimeout\(pin, 80\);/);
  assert.match(consoleWorkspace, /useEffect\(\(\) => \(\) => window\.clearTimeout\(pinTimerRef\.current\), \[\]\);/);
  // a virtual index can outlive the row it points at (filter keystroke, clear)
  assert.match(consoleWorkspace, /const row = rows\[item\.index\];\s*\n\s*if \(!row\) return null;/);
});
