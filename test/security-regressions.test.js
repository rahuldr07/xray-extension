const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('content bridge ignores postMessage events from non-window sources', () => {
  const content = read('content/content.js');
  assert.match(content, /e\.source\s*!==\s*window/);
});

test('console executor ignores postMessage events from non-window sources', () => {
  const executor = read('content/console-executor.js');
  assert.match(executor, /event\.source\s*!==\s*window/);
});

test('floating list escapes captured URL and path before innerHTML rendering', () => {
  const floating = read('panel/floating.js');
  assert.doesNotMatch(floating, /title="\$\{entry\.url \|\| ''\}"/);
  assert.doesNotMatch(floating, /\$\{path\}<\/div>/);
});

test('console table output builds cells with textContent instead of interpolating data into HTML', () => {
  const consoleUi = read('panel/console-ui.js');
  assert.doesNotMatch(consoleUi, /table\.innerHTML\s*=\s*html/);
  assert.doesNotMatch(consoleUi, /result\.error\.message\}<\/div>/);
});

test('console renders JSON results as readable expandable text-safe trees', () => {
  const consoleUi = read('panel/console-ui.js');
  assert.match(consoleUi, /function _parseJSONText/);
  assert.match(consoleUi, /function _isStructuredValue/);
  assert.match(consoleUi, /window\.XRAY_Renderer\.buildTree\(parsedJSON\)/);
  assert.match(consoleUi, /expanded:\s*shouldExpand/);
  assert.match(consoleUi, /event\.expanded\)\s*\{\s*_expanded\.clear\(\);\s*_expanded\.add\(event\.id\);/);
  assert.match(consoleUi, /xr-console-row-detail \.xr-key/);
  assert.doesNotMatch(consoleUi, /parsedJSON[\s\S]{0,200}innerHTML/);
});

test('console keeps one expanded row and highlights the selected request context', () => {
  const consoleUi = read('panel/console-ui.js');
  assert.match(consoleUi, /function _isSelectedEvent/);
  assert.match(consoleUi, /classes\.push\('xr-expanded'\)/);
  assert.match(consoleUi, /classes\.push\('xr-selected'\)/);
  assert.match(consoleUi, /_expanded\.has\(id\)[\s\S]{0,140}_expanded\.clear\(\);[\s\S]{0,80}_expanded\.add\(id\);/);
  assert.match(consoleUi, /Selected \$\{_activeContext\.method \|\| 'GET'\}/);
  assert.match(consoleUi, /contextChip\.classList\.add\('xr-selected'\)/);
  assert.match(consoleUi, /contextChip\.classList\.remove\('xr-selected'\)/);
  assert.match(consoleUi, /_scheduleRenderRows\(false\)/);
});

test('console uses a shared helper module in both extension worlds', () => {
  const manifest = read('manifest.json');
  const helperRefs = manifest.match(/shared\/console-helpers\.js/g) || [];
  assert.equal(helperRefs.length, 2);
  assert.match(read('shared/console-helpers.js'), /window\.XRAY_ConsoleHelpers/);
});

test('console execution bridge requires a session nonce and bounds result size', () => {
  const executor = read('content/console-executor.js');
  const consoleEngine = read('panel/console.js');
  assert.match(executor, /XRAY_CONSOLE_SESSION/);
  assert.match(executor, /sessionId\s*!==\s*window\.__XRAY_CONSOLE_SESSION/);
  assert.match(executor, /MAX_RESULT_CHARS/);
  assert.match(consoleEngine, /sessionId:\s*_sessionId/);
});

test('console uses privileged debugger evaluation before MAIN-world fallback', () => {
  const manifest = JSON.parse(read('manifest.json'));
  const background = read('background.js');
  const consoleEngine = read('panel/console.js');

  assert.ok(manifest.permissions.includes('debugger'));
  assert.match(background, /xray:console-eval/);
  assert.match(background, /chrome\.debugger\.attach/);
  assert.match(background, /Runtime\.evaluate/);
  assert.match(consoleEngine, /_executePrivileged/);
  assert.match(consoleEngine, /type:\s*'xray:console-eval'/);
});

test('console ui models devtools-style events and avoids unsafe inline rendering', () => {
  const consoleUi = read('panel/console-ui.js');
  assert.match(consoleUi, /type:\s*'log'/);
  assert.match(consoleUi, /type:\s*'network'/);
  assert.match(consoleUi, /type:\s*'command'/);
  assert.match(consoleUi, /type:\s*'result'/);
  assert.match(consoleUi, /type:\s*'error'/);
  assert.match(consoleUi, /xr-console-row-detail/);
  assert.match(consoleUi, /xr-notebook-pane/);
  assert.doesNotMatch(consoleUi, /xr-console-inspector/);
  assert.doesNotMatch(consoleUi, /xr-console-stream-wrap/);
  assert.doesNotMatch(consoleUi, /xr-console-notebook-drawer/);
  assert.doesNotMatch(consoleUi, /outWrap\.innerHTML\s*=\s*`/);
  assert.match(consoleUi, /textContent\s*=/);
});

test('console uses screenshot-style network workspace controls', () => {
  const consoleUi = read('panel/console-ui.js');
  assert.match(consoleUi, /CONSOLE_TABS/);
  assert.match(consoleUi, /label:\s*'Network'/);
  assert.match(consoleUi, /label:\s*'Console'/);
  assert.doesNotMatch(consoleUi, /label:\s*'Schema'/);
  assert.doesNotMatch(consoleUi, /label:\s*'Snippets'/);
  assert.match(consoleUi, /NETWORK_FILTERS/);
  assert.match(consoleUi, /function _svgIcon/);
  assert.match(consoleUi, /icon:\s*'network'/);
  assert.match(consoleUi, /icon:\s*'terminal'/);
  assert.match(consoleUi, /Filter by path, method, status/);
  assert.match(consoleUi, /recordLabel\.textContent = 'Record'/);
  assert.match(consoleUi, /exportButton\.append\(_svgIcon\('download'/);
  assert.match(consoleUi, /clearButton\.append\(_svgIcon\('trash'/);
  assert.doesNotMatch(consoleUi, /message:\s*'> '\s*\+\s*command/);
  assert.match(consoleUi, /stroke-width',\s*'1\.7'/);
  assert.match(consoleUi, /function _renderNetworkTable/);
  assert.match(consoleUi, /function _renderConsoleStream/);
});

test('console record, filter, selection, and export are local UI behaviors', () => {
  const consoleUi = read('panel/console-ui.js');
  assert.match(consoleUi, /function _setRecording\(active\)/);
  assert.match(consoleUi, /if \(!_recording\) return;\s*_appendEvent\(_eventFromEntry\(entry\)\)/);
  assert.match(consoleUi, /function _setNetworkFilter\(filter\)/);
  assert.match(consoleUi, /_searchQuery\.trim\(\)\.toLowerCase\(\)/);
  assert.match(consoleUi, /function _selectNetworkEvent\(eventId\)/);
  assert.match(consoleUi, /_expanded\.clear\(\);\s*_expanded\.add\(event\.id\);/);
  assert.match(consoleUi, /function _exportConsoleSelection/);
  assert.match(consoleUi, /window\.XRAY_Panel\?\.openExport\?\.\(\)/);
  assert.match(consoleUi, /clearButton\.addEventListener\('click'[\s\S]{0,140}_events = \[\]/);
});

test('manifest does not load a separate intelligence script', () => {
  const manifest = JSON.parse(read('manifest.json'));
  const isolated = manifest.content_scripts[1].js;
  const retiredScript = ['panel', 'co' + 'pilot.js'].join('/');
  assert.ok(!isolated.includes(retiredScript));
});

test('manifest loads the React UI bundle after vanilla runtime scripts', () => {
  const manifest = JSON.parse(read('manifest.json'));
  const isolated = manifest.content_scripts[1].js;

  assert.ok(isolated.includes('panel/console.js'));
  assert.ok(isolated.includes('dist/panel-ui.js'));
  assert.ok(isolated.includes('shared/console-helpers.js'));
  assert.ok(isolated.includes('shared/worker-client.js'));
  assert.ok(isolated.indexOf('panel/console.js') < isolated.indexOf('dist/panel-ui.js'));
  assert.ok(isolated.indexOf('dist/panel-ui.js') < isolated.indexOf('content/content.js'));
  for (const retired of [
    'panel/floating.js',
    'panel/console-ui.js',
    'panel/entry-list.js',
    'panel/renderer.js',
    'panel/waterfall.js',
    'panel/search.js',
    'panel/themes.js',
    'panel/shortcuts.js',
    'panel/codemirror.bundle.js',
    'panel/export.js',
  ]) {
    assert.ok(!isolated.includes(retired), `${retired} should not be loaded in the live React UI stack`);
  }
  assert.equal(isolated.at(-1), 'content/content.js');
});

test('devtools panel loads the React UI bundle and keeps vanilla runtime scripts', () => {
  const html = read('devtools/devtools-panel.html');

  assert.match(html, /panel\/console\.js/);
  assert.match(html, /dist\/panel-ui\.js/);
  assert.match(html, /shared\/console-helpers\.js/);
  assert.match(html, /shared\/worker-client\.js/);
  assert.doesNotMatch(html, /panel\/floating\.js/);
  assert.doesNotMatch(html, /panel\/renderer\.js/);
  assert.doesNotMatch(html, /panel\/themes\.js/);
});

test('manifest exposes three React UI modes while keeping capture runtime vanilla', () => {
  const manifest = JSON.parse(read('manifest.json'));
  const hudScript = manifest.content_scripts.find((script) => script.js?.includes('content/hud-mount.js'));
  const resources = manifest.web_accessible_resources.flatMap((item) => item.resources || []);

  assert.ok(manifest.permissions.includes('windows'));
  assert.equal(manifest.action.default_title, 'XRAY');
  assert.ok(hudScript, 'HUD mount content script is required');
  assert.equal(hudScript.world, 'ISOLATED');
  assert.equal(hudScript.run_at, 'document_idle');
  assert.ok(resources.includes('window.html'));
  assert.ok(resources.includes('dist/hud-ui.js'));
  assert.ok(resources.includes('dist/window-ui.js'));
  assert.ok(!manifest.content_scripts[0].js.includes('dist/hud-ui.js'));
  assert.ok(!manifest.content_scripts[0].js.includes('dist/window-ui.js'));
});

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

test('React app has dedicated DevTools, HUD, and window entrypoints', () => {
  const app = read('src/panel/App.tsx');
  const main = read('src/panel/main.tsx');
  const hudMain = read('src/panel/hud-main.tsx');
  const windowMain = read('src/panel/window-main.tsx');
  const windowHtml = read('window.html');
  const vite = read('vite.config.ts');

  assert.match(app, /mode = 'hud'/);
  assert.match(app, /<PanelShell mode=\{mode\}>/);
  assert.match(main, /currentMode:\s*XrayAppMode = 'hud'/);
  assert.match(main, /options\.devtoolsMode \? 'devtools' : 'hud'/);
  assert.match(main, /<App mode=\{currentMode\} \/>/);
  assert.match(hudMain, /<App mode="hud" \/>/);
  assert.match(hudMain, /getRootNode\?\.\(\)/);
  assert.match(hudMain, /rootNode instanceof ShadowRoot/);
  assert.match(windowMain, /<App mode="window" \/>/);
  assert.match(windowMain, /tokensCss\.replace\(\s*\/:host\/g,\s*'#xray-window-root'\s*\)/);
  assert.match(windowHtml, /id="xray-window-root"/);
  assert.match(windowHtml, /dist\/window-ui\.js/);
  assert.match(vite, /hud-main\.tsx/);
  assert.match(vite, /window-main\.tsx/);
  assert.match(vite, /dist\/hud-ui\.js/);
  assert.match(vite, /dist\/window-ui\.js/);
  assert.match(vite, /format:\s*'iife'/);
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

test('React migration packages and scripts are present', () => {
  const pkg = JSON.parse(read('package.json'));

  for (const dep of ['react', 'react-dom', 'zustand', '@tanstack/react-virtual', '@tabler/icons-react']) {
    assert.ok(pkg.dependencies[dep], `${dep} dependency is required`);
  }
  for (const dep of ['vite', '@vitejs/plugin-react', 'typescript', '@types/react', '@types/react-dom']) {
    assert.ok(pkg.devDependencies[dep], `${dep} devDependency is required`);
  }
  for (const script of ['dev', 'build', 'typecheck', 'test', 'check']) {
    assert.ok(pkg.scripts[script], `${script} script is required`);
  }
});

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

test('React panel uses TanStack Virtual and Tabler icons for the screenshot console UI', () => {
  const app = read('src/panel/App.tsx');
  const consoleWorkspace = read('src/panel/components/console/ConsoleWorkspace.tsx');

  assert.match(consoleWorkspace, /from '@tanstack\/react-virtual'/);
  assert.match(consoleWorkspace, /useVirtualizer/);
  assert.match(consoleWorkspace, /from '@tabler\/icons-react'/);
  assert.match(consoleWorkspace, /IconNetwork/);
  assert.match(consoleWorkspace, /IconTerminal2/);
  assert.match(consoleWorkspace, /Network/);
  assert.match(consoleWorkspace, /Console/);
  assert.match(app, /import \{ ConsoleWorkspace \}/);
  assert.doesNotMatch(app, /function ConsoleWorkspace/);
  assert.doesNotMatch(consoleWorkspace, /Schema['"]/);
  assert.doesNotMatch(consoleWorkspace, /Snippets['"]/);
});

test('React preview models old API tab parity before live manifest switch', () => {
  const app = read('src/panel/App.tsx');
  const store = read('src/panel/store.ts');
  const entriesModel = read('src/panel/models/entries.ts');
  const entriesWorkspace = read('src/panel/components/api/EntriesWorkspace.tsx');
  const detailModel = read('src/panel/models/detail.ts');
  const exportModel = read('src/panel/models/export.ts');
  const preview = read('preview/ui-preview.html');

  assert.match(preview, /dist\/panel-ui\.js/);
  assert.match(app, /import \{ EntriesWorkspace \}/);
  assert.match(entriesWorkspace, /buildEntryListItems/);
  assert.match(entriesModel, /export function buildEntryListItems/);
  assert.match(entriesModel, /groupCount/);
  assert.match(entriesWorkspace, /togglePinned/);
  assert.match(entriesWorkspace, /toggleStatusFilter/);
  assert.match(entriesWorkspace, /toggleTypeFilter/);
  assert.match(entriesWorkspace, /setSort/);
  assert.match(detailModel, /export function detailValue/);
  assert.match(exportModel, /export type ExportFormat/);
  assert.match(store, /expandedGroups:\s*new Set<string>\(\)/);
  assert.match(store, /pinnedIds:\s*new Set<string>\(\)/);
  assert.doesNotMatch(app, /function EntriesWorkspace/);
  assert.doesNotMatch(app, /function ListControls/);
});

test('React API list parity logic is pure and covers grouping, filters, sorting, and pinning', () => {
  const entriesModel = read('src/panel/models/entries.ts');

  assert.match(entriesModel, /export interface EntryListOptions/);
  assert.match(entriesModel, /mode:\s*'api' \| 'logs'/);
  assert.match(entriesModel, /statusFilters:\s*ReadonlySet<string>/);
  assert.match(entriesModel, /typeFilters:\s*ReadonlySet<string>/);
  assert.match(entriesModel, /methodFilters\?:\s*ReadonlySet<string>/);
  assert.match(entriesModel, /expandedGroups:\s*ReadonlySet<string>/);
  assert.match(entriesModel, /pinnedIds:\s*ReadonlySet<string>/);
  assert.match(entriesModel, /entries\.filter\(mode === 'api' \? isApi : isLog\)/);
  assert.match(entriesModel, /matchesEntry\(entry, query\)/);
  assert.match(entriesModel, /methodFilters\.has\(String\(entry\.method \|\| 'GET'\)\.toUpperCase\(\)\)/);
  assert.match(entriesModel, /statusFilters\.has\(statusRange\(entry\)\)/);
  assert.match(entriesModel, /typeFilters\.has\(String\(entry\.source \|\| 'fetch'\)\.toLowerCase\(\)\)/);
  assert.match(entriesModel, /const groups = new Map<string, XrayEntry\[\]>\(\)/);
  assert.match(entriesModel, /key:\s*'api:' \+ path/);
  assert.match(entriesModel, /pinnedIds\.has\(a\.entry\.id\)/);
});

test('React API tab has premium request intelligence controls and mobile detail parity', () => {
  const entriesModel = read('src/panel/models/entries.ts');
  const entriesWorkspace = read('src/panel/components/api/EntriesWorkspace.tsx');
  const store = read('src/panel/store.ts');
  const styles = read('src/panel/styles.css');

  assert.match(entriesModel, /export interface ApiListSummary/);
  assert.match(entriesModel, /export function buildApiListSummary/);
  assert.match(entriesModel, /export function entryGroupStats/);
  assert.match(entriesWorkspace, /function ApiWorkspace/);
  assert.match(entriesWorkspace, /function ApiRequestRow/);
  assert.match(entriesWorkspace, /function ApiDetailDrawer/);
  assert.match(entriesWorkspace, /entryGroupStats\(entry, entries\)/);
  assert.match(entriesWorkspace, /IconFilterOff/);
  assert.match(entriesWorkspace, /quickFilters/);
  assert.match(entriesWorkspace, /ApiFlagPills/);
  assert.match(entriesWorkspace, /xray-api-table-head/);
  assert.match(entriesWorkspace, /xray-api-detail-drawer/);
  assert.match(store, /clearApiFilters\(\): void/);
  assert.match(store, /clearApiFilters: \(\) =>/);
  assert.match(store, /apiQuickFilter:\s*'all'/);
  assert.match(store, /apiGroupingMode:\s*'flat'/);
  assert.match(store, /apiDetailOpen:\s*false/);
  assert.match(store, /methodFilters:\s*new Set<string>\(\)/);
  assert.match(styles, /\.xray-api-workspace/);
  assert.match(styles, /grid-template-columns:\s*minmax\(420px, 1fr\) minmax\(360px, 42%\)/);
  assert.match(styles, /\.xray-api-row\.selected/);
  assert.match(styles, /\.xray-api-detail-drawer/);
  assert.match(styles, /\.xray-api-flag\.error/);
  assert.match(styles, /\.xray-entry-duration/);
});

test('React API network inspector models quick filters, flags, groups, and drawer state', () => {
  const types = read('src/panel/types.ts');
  const entriesModel = read('src/panel/models/entries.ts');
  const persistence = read('src/panel/models/panelPersistence.ts');
  const entriesWorkspace = read('src/panel/components/api/EntriesWorkspace.tsx');
  const detail = read('src/panel/components/detail/RequestDetail.tsx');
  const styles = read('src/panel/styles.css');

  assert.match(types, /export type ApiQuickFilter = 'all' \| 'errors' \| 'slow' \| 'repeated' \| 'pinned' \| 'large' \| 'empty'/);
  assert.match(types, /export type ApiGroupingMode = 'flat' \| 'endpoint'/);
  assert.match(entriesModel, /export type ApiEntryFlag = 'error' \| 'slow' \| 'repeated' \| 'large' \| 'empty' \| 'pinned'/);
  assert.match(entriesModel, /export function getEntryDomain/);
  assert.match(entriesModel, /export function getEntryContentType/);
  assert.match(entriesModel, /export function getEntryFlags/);
  assert.match(entriesModel, /export function matchesApiQuickFilter/);
  assert.match(entriesModel, /export function buildEndpointGroups/);
  assert.match(entriesModel, /apiGroupingMode === 'flat'/);
  assert.match(entriesModel, /matchesApiQuickFilter\(entry, apiQuickFilter, entries, pinnedIds, slowThresholdMs\)/);
  assert.match(entriesWorkspace, /Primary API filters/);
  assert.match(entriesWorkspace, /\['GET', 'POST'\]/);
  assert.match(entriesWorkspace, /toggleMethodFilter/);
  assert.match(entriesWorkspace, /Flat/);
  assert.match(entriesWorkspace, /Endpoint Groups/);
  assert.match(entriesWorkspace, /role="button"/);
  assert.match(entriesWorkspace, /onKeyDown/);
  assert.match(entriesWorkspace, /copyText\(String\(entry\.url \|\| path\)\)/);
  assert.match(entriesWorkspace, /setApiDetailOpen\(true\)/);
  assert.match(persistence, /apiQuickFilter:\s*state\.apiQuickFilter/);
  assert.match(persistence, /apiGroupingMode:\s*state\.apiGroupingMode/);
  assert.match(persistence, /apiDetailOpen:\s*state\.apiDetailOpen/);
  assert.match(persistence, /methodFilters:\s*Array\.from\(state\.methodFilters\)/);
  assert.match(detail, /xray-detail-tabs/);
  assert.match(detail, /xray-detail-footer/);
  assert.match(detail, /Console/);
  assert.match(detail, /Notebook/);
  assert.match(detail, /Copy/);
  assert.match(detail, /Export/);
  assert.match(styles, /@media \(max-width: 420px\)/);
  assert.match(styles, /\.xray-detail-footer/);
  assert.doesNotMatch(entriesWorkspace, /dangerouslySetInnerHTML|innerHTML/);
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
  assert.match(storageBridge, /localStorage\.getItem/);
  assert.match(storageBridge, /export async function setStoredValue/);
  assert.match(storageBridge, /window\.XRAY_Store\?\.set/);
  assert.match(storageBridge, /localStorage\.setItem/);
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

test('React console executes through the existing hardened bridge and renders values as text', () => {
  const app = read('src/panel/App.tsx');
  const store = read('src/panel/store.ts');
  const utils = read('src/panel/utils.ts');
  const consoleBridge = read('src/panel/runtime/consoleBridge.ts');
  const consoleWorkspace = read('src/panel/components/console/ConsoleWorkspace.tsx');
  const jsonView = read('src/panel/components/detail/JsonView.tsx');

  assert.match(consoleWorkspace, /executeConsoleCommand\(code\)/);
  assert.match(consoleWorkspace, /navigateConsoleHistory\('up'\)/);
  assert.match(store, /setConsoleContext\(entry\)/);
  assert.match(consoleBridge, /export async function executeConsoleCommand/);
  assert.match(consoleBridge, /window\.XRAY_Console\?\.execute\(code\)/);
  assert.match(consoleBridge, /export function setConsoleContext/);
  assert.match(consoleBridge, /window\.XRAY_Console\?\.setContext\(entry\)/);
  assert.match(consoleBridge, /export function navigateConsoleHistory/);
  assert.match(consoleBridge, /window\.XRAY_Console\?\.navigateHistory\(direction\)/);
  assert.match(jsonView, /safeStringify\(value\)/);
  assert.match(utils, /WeakSet<object>/);
  assert.match(utils, /\[Circular\]/);
  assert.match(utils, /truncated/);
  assert.doesNotMatch(app, /dangerouslySetInnerHTML/);
  assert.doesNotMatch(consoleWorkspace, /dangerouslySetInnerHTML/);
});

test('React console workspace is componentized without replacing the vanilla runtime', () => {
  const app = read('src/panel/App.tsx');
  const consoleWorkspace = read('src/panel/components/console/ConsoleWorkspace.tsx');

  assert.match(consoleWorkspace, /export function ConsoleWorkspace/);
  assert.match(consoleWorkspace, /function NetworkTable/);
  assert.match(consoleWorkspace, /function ConsoleStream/);
  assert.match(consoleWorkspace, /function ConsolePrompt/);
  assert.match(consoleWorkspace, /function Statusbar/);
  assert.match(consoleWorkspace, /networkFilters/);
  assert.match(consoleWorkspace, /miniTabs/);
  assert.match(consoleWorkspace, /useFilteredNetworkEvents/);
  assert.match(consoleWorkspace, /useConsoleEvents/);
  assert.match(consoleWorkspace, /RequestDetail/);
  assert.match(consoleWorkspace, /JsonView/);
  assert.doesNotMatch(app, /function NetworkTable/);
  assert.doesNotMatch(app, /function ConsolePrompt/);
});

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
  assert.match(tabs, /id:\s*'notebook'/);
  assert.match(tabs, /id:\s*'insights'/);
  assert.match(tabs, /id:\s*'settings'/);
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
  const notebook = read('src/panel/components/notebook/Notebook.tsx');
  const insights = read('src/panel/components/insights/Insights.tsx');
  const settings = read('src/panel/components/settings/Settings.tsx');
  const insightsModel = read('src/panel/models/insights.ts');

  assert.match(app, /import \{ Notebook \}/);
  assert.match(app, /import \{ Insights \}/);
  assert.match(app, /import \{ Settings \}/);
  assert.match(notebook, /export function Notebook/);
  assert.match(notebook, /notebookCells/);
  assert.match(notebook, /addNotebookCell/);
  assert.match(notebook, /updateNotebookCell/);
  assert.match(notebook, /Add cell/);
  assert.match(insights, /export function Insights/);
  assert.match(insights, /buildInsightsSummary\(entries\)/);
  assert.match(insightsModel, /export function buildInsightsSummary/);
  assert.match(insightsModel, /repeatedEndpoints/);
  assert.match(settings, /export function Settings/);
  assert.match(settings, /clearEntries/);
  assert.doesNotMatch(app, /function Notebook/);
  assert.doesNotMatch(app, /function Insights/);
  assert.doesNotMatch(app, /function Settings/);
  assert.doesNotMatch(app, /function repeatedEndpoints/);
});

test('React secondary tabs have real parity workflows, not placeholder panels', () => {
  const notebook = read('src/panel/components/notebook/Notebook.tsx');
  const insights = read('src/panel/components/insights/Insights.tsx');
  const settings = read('src/panel/components/settings/Settings.tsx');
  const palette = read('src/panel/components/shell/CommandPalette.tsx');
  const insightsModel = read('src/panel/models/insights.ts');
  const store = read('src/panel/store.ts');

  assert.match(notebook, /executeConsoleCommand/);
  assert.match(notebook, /runNotebookCell/);
  assert.match(notebook, /setNotebookCellResult/);
  assert.match(notebook, /IconPlayerPlay/);
  assert.match(notebook, /IconSend/);
  assert.match(insightsModel, /statusCounts/);
  assert.match(insightsModel, /topSlowRequests/);
  assert.match(insightsModel, /nPlusOneCandidates/);
  assert.match(insights, /InsightMetric/);
  assert.match(insights, /Repeated endpoints/);
  assert.match(insights, /Slowest requests/);
  assert.match(settings, /clearPinned/);
  assert.match(settings, /clearApiFilters/);
  assert.match(settings, /setExportOpen\(true\)/);
  assert.match(settings, /setRecording\(!recording\)/);
  assert.match(palette, /const commands =/);
  assert.match(palette, /filteredCommands/);
  assert.match(palette, /insertConsoleCommand/);
  assert.match(palette, /setExportOpen\(true\)/);
  assert.match(store, /clearPinned\(\): void/);
  assert.match(store, /setNotebookCellResult/);
});

test('React detail parity logic is typed outside the component tree', () => {
  const app = read('src/panel/App.tsx');
  const detailModel = read('src/panel/models/detail.ts');
  const requestDetail = read('src/panel/components/detail/RequestDetail.tsx');
  const entriesWorkspace = read('src/panel/components/api/EntriesWorkspace.tsx');
  const consoleWorkspace = read('src/panel/components/console/ConsoleWorkspace.tsx');
  const jsonView = read('src/panel/components/detail/JsonView.tsx');
  const emptyState = read('src/panel/components/common/EmptyState.tsx');

  assert.match(detailModel, /export const detailViews/);
  assert.match(detailModel, /export function detailValue/);
  assert.match(detailModel, /detailTab === 'request'/);
  assert.match(detailModel, /detailTab === 'headers'/);
  assert.match(detailModel, /requestHeaders/);
  assert.match(detailModel, /responseHeaders/);
  assert.match(detailModel, /export function gridRows/);
  assert.match(detailModel, /slice\(0, 200\)/);
  assert.match(detailModel, /Object\.keys\(row\)\.slice\(0, 20\)/);
  assert.match(detailModel, /export function vizSummary/);
  assert.match(detailModel, /schema\(value\)/);
  assert.match(requestDetail, /detailValue\(entry, detailTab\)/);
  assert.match(requestDetail, /gridRows\(value\)/);
  assert.match(requestDetail, /vizSummary\(value\)/);
  assert.match(jsonView, /safeStringify\(value\)/);
  assert.match(emptyState, /export function EmptyState/);
  assert.match(entriesWorkspace, /import \{ RequestDetail \}/);
  assert.match(consoleWorkspace, /import \{ RequestDetail \}/);
  assert.doesNotMatch(app, /function buildTypeScriptShape/);
  assert.doesNotMatch(app, /function RequestDetail/);
  assert.doesNotMatch(app, /function JsonView/);
});

test('React export parity logic is isolated and keeps old export formats', () => {
  const app = read('src/panel/App.tsx');
  const exportModel = read('src/panel/models/export.ts');
  const exportModal = read('src/panel/components/export/ExportModal.tsx');

  assert.match(exportModel, /export type ExportFormat =/);
  for (const format of ['json', 'curl', 'fetch', 'axios', 'schema', 'mock', 'typescript', 'zod', 'jest', 'msw', 'session-json', 'session-csv', 'session-har']) {
    assert.match(exportModel, new RegExp("'" + format + "'"));
  }
  assert.match(exportModel, /export const exportFormats/);
  assert.match(exportModel, /export const exportGroups/);
  assert.match(exportModel, /export const exportMeta/);
  assert.match(exportModel, /export function buildTypeScriptShape/);
  assert.match(exportModel, /export function buildZodSchema/);
  assert.match(exportModel, /export function buildSessionCsv/);
  assert.match(exportModel, /export function buildSessionHar/);
  assert.match(exportModel, /export function filenameForExport/);
  assert.match(exportModel, /export function exportText/);
  assert.match(exportModel, /buildCurl\(entry\)/);
  assert.match(exportModel, /buildFetch\(entry\)/);
  assert.match(exportModel, /buildAxios\(entry\)/);
  assert.match(exportModel, /schema\(entryResponse\(entry\)\)/);
  assert.match(exportModel, /buildMock\?\.\(entry\)/);
  assert.match(exportModel, /safeStringify\(entry \? \{ entry, response: entryResponse\(entry\) \} : \{ entries \}/);
  assert.match(exportModel, /buildSessionCsv\(entries\)/);
  assert.match(exportModel, /buildSessionHar\(entries\)/);
  assert.match(exportModal, /exportText\(selectedForExport, entries, format\)/);
  assert.match(exportModal, /exportGroups\.map/);
  assert.match(exportModal, /exportMeta\[format\]/);
  assert.match(exportModal, /filenameForExport\(selectedForExport, format\)/);
  assert.match(exportModal, /copyText\(text\)/);
  assert.match(exportModel, /export function mimeForExport/);
  assert.match(exportModal, /downloadText\(filename, text, mimeForExport\(format\)\)/);
  assert.match(exportModal, /mode === 'selected'/);
  assert.match(exportModal, /mode === 'session'/);
  assert.match(exportModal, /insertConsoleCommand\(text\)/);
  assert.match(exportModal, /addNotebookCell/);
  assert.match(exportModal, /showToast/);
  assert.doesNotMatch(exportModal, /dangerouslySetInnerHTML|innerHTML/);
  assert.match(app, /import \{ ExportModal \}/);
  assert.doesNotMatch(app, /type ExportFormat =/);
  assert.doesNotMatch(app, /function ExportModal/);
});

test('React response detail has native contextual operations, not a separate copilot surface', () => {
  const operations = read('src/panel/models/operations.ts');
  const detail = read('src/panel/components/detail/RequestDetail.tsx');
  const store = read('src/panel/store.ts');

  assert.match(operations, /export interface ResponseOperation/);
  assert.match(operations, /export function getResponseOperations/);
  assert.match(operations, /kind: 'view' \| 'console' \| 'notebook' \| 'copy' \| 'select'/);
  for (const label of ['Schema', 'Table', 'Visualize', 'Compare Previous', 'Copy cURL', 'Copy fetch', 'Send to Console', 'Send to Notebook', 'Related Errors', 'Similar Calls']) {
    assert.match(operations, new RegExp(label));
  }
  assert.match(detail, /insertConsoleCommand\('res'\)/);
  assert.match(detail, /addNotebookCell/);
  assert.match(detail, /copyActiveValue/);
  assert.match(detail, /setExportOpen\(true\)/);
  assert.doesNotMatch(detail, /dangerouslySetInnerHTML/);
  assert.match(store, /insertConsoleCommand\(command: string\): void/);
  assert.match(store, /addNotebookCell\(cell:/);
});

test('React console and notebook accept prepared commands without executing them', () => {
  const consoleWorkspace = read('src/panel/components/console/ConsoleWorkspace.tsx');
  const notebook = read('src/panel/components/notebook/Notebook.tsx');
  const store = read('src/panel/store.ts');

  assert.match(store, /consoleDraft: string/);
  assert.match(store, /notebookCells:/);
  assert.match(store, /insertConsoleCommand: \(command\) => set\(\{ consoleDraft: command/);
  assert.match(consoleWorkspace, /const command = usePanelStore\(\(state\) => state\.consoleDraft\)/);
  assert.match(consoleWorkspace, /setConsoleDraft\(event\.currentTarget\.value\)/);
  assert.match(consoleWorkspace, /executeConsoleCommand\(code\)/);
  assert.match(notebook, /notebookCells/);
  assert.match(notebook, /updateNotebookCell/);
  assert.match(notebook, /insertConsoleCommand\(cell\.code\)/);
  assert.match(notebook, /runNotebookCell\(cell\.id, cell\.code\)/);
});

test('React preview CSS protects narrow viewport console ergonomics', () => {
  const styles = read('src/panel/styles.css');

  assert.match(styles, /@media \(max-width: 760px\)/);
  assert.match(styles, /\.xray-tabs\s*\{[\s\S]*overflow-x: auto/);
  assert.match(styles, /\.xray-console-head\s*\{[\s\S]*overflow-x: auto/);
  assert.match(styles, /\.xray-prompt\s*\{[\s\S]*grid-template-columns: 20px minmax\(120px, 1fr\) auto/);
  assert.match(styles, /\.xray-context-chip\s*\{[\s\S]*display: none/);
});

test('React migration does not use older virtualization libraries', () => {
  const pkg = JSON.parse(read('package.json'));
  const app = read('src/panel/App.tsx');
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

  assert.ok(!allDeps['react-window']);
  assert.ok(!allDeps['react-virtualized']);
  assert.doesNotMatch(app, /react-window|react-virtualized/);
});

test('React bundle replaces Node process env references for extension content scripts', () => {
  const vite = read('vite.config.ts');
  const bundle = read('dist/panel-ui.js');
  const hudBundle = read('dist/hud-ui.js');
  const windowBundle = read('dist/window-ui.js');

  assert.match(vite, /process\.env\.NODE_ENV/);
  assert.match(vite, /production/);
  assert.doesNotMatch(bundle, /process\.env/);
  assert.doesNotMatch(hudBundle, /process\.env/);
  assert.doesNotMatch(windowBundle, /process\.env/);
});

test('content script references XRAY_Panel through window to avoid cascading ReferenceErrors', () => {
  const content = read('content/content.js');

  assert.doesNotMatch(content, /[^\w.]XRAY_Panel\.(init|add|toggle|show)/);
  assert.match(content, /window\.XRAY_Panel\?\.init\?\.\(\)/);
  assert.match(content, /window\.XRAY_Panel\?\.add\?\.\(entry\)/);
  assert.match(content, /window\.XRAY_Panel\?\.toggle\?\.\(\)/);
});

test('React settings persist user preferences and publish capture config to vanilla interceptor', () => {
  const types = read('src/panel/types.ts');
  const settingsModel = read('src/panel/models/panelSettings.ts');
  const persistence = read('src/panel/models/panelPersistence.ts');
  const store = read('src/panel/store.ts');
  const captureConfig = read('src/panel/runtime/captureConfig.ts');
  const interceptor = read('content/interceptor.js');

  assert.match(types, /export interface PanelSettings/);
  for (const field of ['captureFetch', 'captureXhr', 'maxEntries', 'slowThresholdMs', 'defaultDetailView', 'compactRows', 'showHostInPath', 'accent', 'confirmDestructiveActions']) {
    assert.match(types, new RegExp(field));
    assert.match(settingsModel, new RegExp(field));
  }
  assert.match(persistence, /settings:\s*state\.settings/);
  assert.match(persistence, /normalizePanelSettings\(preferences\.settings\)/);
  assert.match(store, /updateSettings\(patch: Partial<PanelSettings>\): void/);
  assert.match(store, /publishCaptureSettings\(settings\)/);
  assert.match(captureConfig, /__xray_config__/);
  assert.match(interceptor, /event\.source !== window/);
  assert.match(interceptor, /captureFetch/);
  assert.match(interceptor, /captureXhr/);
  assert.match(interceptor, /if \(!_config\.captureFetch\) return _origFetch/);
  assert.match(interceptor, /if \(!_config\.captureXhr\) return _origXHRSend/);
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

test('React response detail renders native smart operations and bounded schema diff views', () => {
  const detail = read('src/panel/components/detail/RequestDetail.tsx');
  const operations = read('src/panel/models/operations.ts');

  assert.match(detail, /getResponseOperations\(entry, entries\)/);
  assert.match(detail, /xray-smart-ops/);
  assert.match(detail, /runOperation/);
  assert.match(detail, /setDetailView\(operation\.view\)/);
  assert.match(detail, /insertConsoleCommand\(operation\.command\)/);
  assert.match(detail, /addNotebookCell\(\{ title: operation\.label/);
  assert.match(detail, /copyText\(operation\.command\)/);
  assert.match(detail, /detailView === 'schema'/);
  assert.match(detail, /detailView === 'diff'/);
  assert.match(operations, /view:\s*'schema'/);
  assert.match(operations, /view:\s*'diff'/);
  assert.doesNotMatch(detail, /dangerouslySetInnerHTML|innerHTML/);
});

test('worker client falls back to a blob wrapper when extension worker URL is blocked', () => {
  const workerClient = read('shared/worker-client.js');

  assert.match(workerClient, /function _createWorker\(workerUrl\)/);
  assert.match(workerClient, /new Worker\(workerUrl\)/);
  assert.match(workerClient, /new Blob/);
  assert.match(workerClient, /importScripts/);
  assert.match(workerClient, /new Worker\(blobUrl\)/);
});

test('console exposes insertion hooks without a separate intelligence strip', () => {
  const consoleUi = read('panel/console-ui.js');
  assert.match(consoleUi, /function insertCommand/);
  assert.match(consoleUi, /function sendCommandToNotebook/);
  assert.match(consoleUi, /res\.data/);
  assert.match(consoleUi, /_pathCompletion/);
  assert.match(consoleUi, /xr-console-suggestions/);
  assert.doesNotMatch(consoleUi, new RegExp('xr-co' + 'pilot'));
  assert.doesNotMatch(consoleUi, new RegExp('update' + 'Findings'));
  assert.doesNotMatch(consoleUi, /XRAY_Console\.execute\(action\.command/);
});

test('panel feeds captured entries into the primary console stream', () => {
  const floating = read('panel/floating.js');
  assert.match(floating, /activeTab:\s*'console'/);
  assert.match(floating, /XRAY_ConsoleUI\?\.addEntry/);
  assert.doesNotMatch(floating, /xr-response-ops/);
  assert.match(floating, /setActiveTab\(tab\)/);
});

test('notebook is a separate tab and API responses have a visualization view', () => {
  const floating = read('panel/floating.js');
  const consoleUi = read('panel/console-ui.js');
  assert.match(floating, /data-tab="notebook"/);
  assert.match(floating, /id="xr-notebook-pane"/);
  assert.match(floating, /data-view="viz"|id:\s*'viz'/);
  assert.match(floating, /_renderVizView/);
  assert.match(consoleUi, /_buildNotebookUI/);
  assert.doesNotMatch(consoleUi, /notebookButton/);
});

test('open floating panel traps focus and input events away from the page', () => {
  const floating = read('panel/floating.js');
  const content = read('content/content.js');
  assert.match(floating, /XRAY_ISOLATED_EVENTS/);
  assert.match(floating, /_trapOpenPanelEvent/);
  assert.match(floating, /stopImmediatePropagation/);
  assert.match(floating, /_focusPanelSoon/);
  assert.match(floating, /document\.addEventListener\(type,\s*_trapOpenPanelEvent,\s*true\)/);
  assert.match(floating, /__XRAY_focusTrapActive/);
  assert.match(content, /XRAY_FOCUS_TRAP_EVENTS/);
  assert.match(content, /_trapFocusedPanelEvent/);
  assert.match(content, /document\.addEventListener\(type,\s*_trapFocusedPanelEvent,\s*true\)/);
});

test('shared console helpers build request-aware runtime helpers', () => {
  const context = { window: {}, URL };
  vm.createContext(context);
  vm.runInContext(read('shared/console-helpers.js'), context);

  const entries = [
    { id: 'a', type: 'api', method: 'GET', url: 'https://api.test/orders', urlPath: '/orders', status: 200, duration: 20, responseRaw: '{"items":[{"id":1,"total":10}]}' },
    { id: 'b', type: 'api', method: 'POST', url: 'https://api.test/orders', urlPath: '/orders', status: 500, duration: 1200, responseRaw: '{"error":"fail"}' },
  ];
  const runtime = context.window.XRAY_ConsoleHelpers.createRuntime({ currentEntry: entries[1], entries });

  assert.equal(JSON.stringify(runtime.$res), '{"error":"fail"}');
  assert.equal(runtime.res.error, 'fail');
  assert.equal(runtime.entry.id, 'b');
  assert.equal(JSON.stringify(runtime.headers), '{}');
  assert.equal(runtime.prev.items[0].total, 10);
  assert.equal(runtime.table([{ ok: true }]).__xr_render, 'table');
  assert.equal(runtime.schema(runtime.res).error, 'string');
  assert.equal(runtime.$errors().length, 1);
  assert.equal(runtime.$slow(1000)[0].id, 'b');
  assert.equal(runtime.$status(500)[0].id, 'b');
  assert.equal(runtime.$endpoint('/orders').length, 2);
  assert.equal(runtime.$domain('api.test').length, 2);
});

test('privileged console runtime declares friendly response aliases', () => {
  const background = read('background.js');
  assert.match(background, /'res'/);
  assert.match(background, /'req'/);
  assert.match(background, /'headers'/);
  assert.match(background, /'entry'/);
  assert.match(background, /'table'/);
});
