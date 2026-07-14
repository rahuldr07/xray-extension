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

test('console executor ignores postMessage events from non-window sources', () => {
  const executor = read('content/console-executor.js');
  assert.match(executor, /event\.source\s*!==\s*window/);
});

test('console uses a shared helper module in both extension worlds', () => {
  // Chrome injects a given file only once per frame even when it is listed in
  // both content-script groups, so the isolated world must dynamically import
  // the helpers (content.js) instead of listing the file a second time.
  const manifest = read('manifest.json');
  const helperRefs = manifest.match(/shared\/console-helpers\.js/g) || [];
  assert.equal(helperRefs.length, 2);
  const parsed = JSON.parse(manifest);
  assert.ok(parsed.content_scripts[0].js.includes('shared/console-helpers.js'));
  assert.ok(!parsed.content_scripts[1].js.includes('shared/console-helpers.js'));
  assert.ok(parsed.web_accessible_resources[0].resources.includes('shared/console-helpers.js'));
  assert.match(read('content/content.js'), /import\(chrome\.runtime\.getURL\('shared\/console-helpers\.js'\)\)/);
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
  // shared/console-helpers.js is deliberately absent here: Chrome injects a
  // file only once per frame across worlds, so content.js imports it instead.
  assert.ok(!isolated.includes('shared/console-helpers.js'));
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
  for (const script of ['dev', 'build', 'typecheck', 'test', 'check', 'package:extension']) {
    assert.ok(pkg.scripts[script], `${script} script is required`);
  }
});

test('extension manifest and package metadata are store-release ready', () => {
  const manifest = JSON.parse(read('manifest.json'));
  const pkg = JSON.parse(read('package.json'));
  const packageScript = read('scripts/package-extension.ps1');

  assert.equal(pkg.version, manifest.version, 'package and manifest versions must stay aligned');
  assert.equal(manifest.options_ui.page, 'settings/settings.html');
  assert.equal(manifest.options_ui.open_in_tab, true);
  assert.match(manifest.content_security_policy.extension_pages, /script-src 'self'/);
  assert.match(manifest.content_security_policy.extension_pages, /object-src 'self'/);
  assert.match(packageScript, /\$allowList = @\(/);
  for (const required of ['manifest.json', 'background.js', 'content', 'devtools', 'dist', 'icons', 'panel', 'settings', 'shared', 'workers']) {
    assert.match(packageScript, new RegExp(`"${required.replace('.', '\\.')}"`));
  }
  for (const forbidden of ['node_modules', '.git', 'src', 'test', 'docs', 'output', 'preview']) {
    assert.match(packageScript, new RegExp(`"${forbidden.replace('.', '\\.')}"`));
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
  assert.match(entriesModel, /key:\s*'api:' \+ groupKey/);
  // groups are ordered as units and emitted header+children contiguously — a
  // global row re-sort used to interleave unrelated groups between a parent
  // and its expanded children
  assert.match(entriesModel, /groupA\.entries\.some\(\(entry\) => pinnedIds\.has\(entry\.id\)\)/);
  assert.doesNotMatch(entriesModel, /return rows\.sort/);
});

test('React virtualized rows provide TanStack measurement indexes', () => {
  const entriesWorkspace = read('src/panel/components/api/EntriesWorkspace.tsx');
  const consoleWorkspace = read('src/panel/components/console/ConsoleWorkspace.tsx');

  assert.match(entriesWorkspace, /data-index=\{item\.index\}/);
  assert.match(consoleWorkspace, /data-index=\{item\.index\}/);
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
  assert.match(entriesWorkspace, /function RequestContextPane/);
  assert.match(entriesWorkspace, /function ApiDetailDrawer/);
  assert.match(entriesWorkspace, /entryGroupStats\(entry, entries\)/);
  assert.match(entriesWorkspace, /IconFilterOff/);
  assert.match(entriesWorkspace, /quickFilters/);
  assert.match(entriesWorkspace, /ApiFlagPills/);
  assert.match(entriesWorkspace, /xray-api-collection-pane/);
  assert.match(entriesWorkspace, /xray-request-context-pane/);
  assert.match(entriesWorkspace, /Captured Requests/);
  assert.match(entriesWorkspace, /Request tabs/);
  assert.match(entriesWorkspace, /xray-api-table-head/);
  assert.match(entriesWorkspace, /xray-api-detail-drawer/);
  assert.match(store, /clearApiFilters\(\): void/);
  assert.match(store, /clearApiFilters: \(\) =>/);
  assert.match(store, /apiQuickFilter:\s*'all'/);
  assert.match(store, /apiGroupingMode:\s*'flat'/);
  assert.match(store, /apiDetailOpen:\s*false/);
  assert.match(store, /methodFilters:\s*new Set<string>\(\)/);
  assert.match(styles, /\.xray-api-workspace/);
  // list track is driven by --xray-api-split (draggable divider), falling back
  // to the original auto min/max
  assert.match(styles, /grid-template-columns:\s*var\(--xray-api-split,\s*minmax\(360px,\s*440px\)\) minmax\(280px,\s*\.64fr\) minmax\(560px,\s*1\.55fr\)/);
  assert.match(styles, /\.xray-pane-divider/);
  assert.match(styles, /\.xray-request-context-pane/);
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
  // rows are proper listbox options with selection semantics for screen readers
  assert.match(entriesWorkspace, /role="option"/);
  assert.match(entriesWorkspace, /aria-selected=\{selected\}/);
  assert.match(entriesWorkspace, /onKeyDown/);
  assert.match(entriesWorkspace, /copyText\(String\(entry\.url \|\| path\)\)/);
  assert.match(entriesWorkspace, /setApiDetailOpen\(true\)/);
  assert.match(persistence, /apiQuickFilter:\s*state\.apiQuickFilter/);
  assert.match(persistence, /apiGroupingMode:\s*state\.apiGroupingMode/);
  assert.match(persistence, /apiDetailOpen:\s*state\.apiDetailOpen/);
  assert.match(persistence, /methodFilters:\s*Array\.from\(state\.methodFilters\)/);
  assert.match(detail, /xray-detail-tabs/);
  assert.match(detail, /operationGroups/);
  assert.match(detail, /Inspect/);
  assert.match(detail, /Transform/);
  assert.match(detail, /Copy/);
  assert.match(detail, /Send/);
  assert.match(detail, /Response tabs/);
  assert.match(detail, /View modes/);
  assert.match(detail, /xray-detail-footer/);
  assert.match(detail, /Console/);
  assert.match(detail, /Snippet/);
  assert.match(detail, /Copy/);
  assert.match(detail, /Export/);
  // panel-internal breakpoints are container-based (the docked panel's width
  // is independent of the window)
  assert.match(styles, /@container xray \(max-width: 420px\)/);
  assert.match(styles, /\.xray-detail-footer/);
  assert.match(styles, /\.xray-detail-footer \.xray-action-btn\s*\{[\s\S]*flex:\s*1 1 calc\(50% - 8px\)/);
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
  assert.ok(!fs.existsSync(path.join(root, 'src/panel/components/notebook/Notebook.tsx')));
  assert.ok(!fs.existsSync(path.join(root, 'src/panel/components/settings/Settings.tsx')));
});

test('Console owns saved snippets and secondary tabs have real workflows', () => {
  const consoleWorkspace = read('src/panel/components/console/ConsoleWorkspace.tsx');
  const insights = read('src/panel/components/insights/Insights.tsx');
  const palette = read('src/panel/components/shell/CommandPalette.tsx');
  const insightsModel = read('src/panel/models/insights.ts');
  const store = read('src/panel/store.ts');

  // snippets replace the notebook and live in the console
  assert.match(consoleWorkspace, /function SnippetBar/);
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
  assert.match(requestDetail, /buildVizSpec\(value\)/);
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
  for (const format of ['json', 'curl', 'fetch', 'axios', 'schema', 'mock', 'typescript', 'zod', 'jest', 'msw', 'playwright', 'session-json', 'session-csv', 'session-har']) {
    assert.match(exportModel, new RegExp("'" + format + "'"));
  }
  // Playwright API test generation dispatches through exportText like the others
  assert.match(exportModel, /function buildPlaywright/);
  assert.match(exportModel, /buildPlaywright\(entry\)/);
  assert.match(exportModel, /@playwright\/test/);
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
  assert.match(exportModal, /saveSnippet/);
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
  assert.match(operations, /kind: 'view' \| 'console' \| 'snippet' \| 'copy' \| 'export' \| 'select'/);
  for (const label of ['Schema', 'Table', 'Visualize', 'Compare Previous', 'Mock', 'Copy cURL', 'Copy fetch', 'Send to Console', 'Save Snippet', 'Export', 'Related Errors', 'Similar Calls']) {
    assert.match(operations, new RegExp(label));
  }
  assert.match(detail, /insertConsoleCommand\('res'\)/);
  assert.match(detail, /saveSnippet\(/);
  assert.match(detail, /copyActiveValue/);
  assert.match(detail, /setExportOpen\(true\)/);
  assert.doesNotMatch(detail, /dangerouslySetInnerHTML/);
  assert.match(store, /insertConsoleCommand\(command: string\): void/);
  assert.match(store, /saveSnippet\(snippet:/);
});

test('React console accepts prepared commands and owns saved snippets', () => {
  const consoleWorkspace = read('src/panel/components/console/ConsoleWorkspace.tsx');
  const store = read('src/panel/store.ts');

  assert.match(store, /consoleDraft: string/);
  assert.match(store, /snippets: Snippet\[\]/);
  assert.match(store, /insertConsoleCommand: \(command\) => set\(\{ consoleDraft: command/);
  assert.match(consoleWorkspace, /const command = usePanelStore\(\(state\) => state\.consoleDraft\)/);
  assert.match(consoleWorkspace, /setConsoleDraft\(event\.currentTarget\.value\)/);
  assert.match(consoleWorkspace, /executeConsoleCommand\(code\)/);
  // snippets load into the prompt, they do not auto-execute
  assert.match(consoleWorkspace, /setConsoleDraft\(snippet\.code\)/);
});

test('React preview CSS protects narrow viewport console ergonomics', () => {
  const styles = read('src/panel/styles.css');

  // the panel is an inline-size container; narrow-panel ergonomics key off the
  // panel's own width, while window-coupled rules (panel width, modals) stay media
  assert.match(styles, /container-type: inline-size/);
  assert.match(styles, /@container xray \(max-width: 760px\)/);
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
  for (const field of ['captureFetch', 'captureXhr', 'maxEntries', 'slowThresholdMs', 'defaultDetailView', 'compactRows', 'showHostInPath', 'accent', 'theme', 'font', 'density', 'glow', 'confirmDestructiveActions']) {
    assert.match(types, new RegExp(field));
    assert.match(settingsModel, new RegExp(field));
  }
  assert.match(persistence, /settings:\s*state\.settings/);
  assert.match(persistence, /normalizePanelSettings\(preferences\.settings\)/);
  assert.match(store, /updateSettings\(patch: Partial<PanelSettings>\): void/);
  assert.match(store, /publishCaptureSettings\(settings\)/);
  assert.match(captureConfig, /__xray_config__/);
  assert.match(captureConfig, /__XRAY_bridgeToken/);
  assert.match(captureConfig, /__XRAY_BRIDGE_TOKEN__/);
  assert.match(interceptor, /event\.source !== window/);
  assert.match(interceptor, /event\.data\.token !== _bridgeToken/);
  assert.match(interceptor, /captureFetch/);
  assert.match(interceptor, /captureXhr/);
  assert.match(interceptor, /if \(!_config\.captureFetch\) return _origFetch/);
  assert.match(interceptor, /if \(!_config\.captureXhr\) return _origXHRSend/);
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

test('content bridge requires a MAIN-world bridge token for capture and lazy object messages', () => {
  const content = read('content/content.js');
  const interceptor = read('content/interceptor.js');
  const consoleCapture = read('content/console-capture.js');

  assert.match(interceptor, /__XRAY_BRIDGE_TOKEN__/);
  assert.match(interceptor, /__xray_bridge_ready__/);
  assert.match(interceptor, /__xray_capture__:\s*true,\s*token:\s*_bridgeToken/);
  assert.match(interceptor, /event\.data\.token !== _bridgeToken/);

  assert.match(consoleCapture, /__XRAY_BRIDGE_TOKEN__/);
  assert.match(consoleCapture, /__xray_bridge_ready__/);
  assert.match(consoleCapture, /__xray_capture__:\s*true,\s*token:\s*_bridgeToken/);
  assert.match(consoleCapture, /e\.data\.token !== _bridgeToken/);
  assert.match(consoleCapture, /__xray_fetch_response__:\s*true,\s*token:\s*_bridgeToken/);

  assert.match(content, /let _bridgeToken = null/);
  assert.match(content, /__xray_bridge_ready__/);
  assert.match(content, /e\.data\.token !== _bridgeToken/);
  assert.match(content, /__xray_fetch_object__:\s*true,\s*token:\s*_bridgeToken/);
  assert.match(content, /__xray_fetch_response__[\s\S]{0,120}e\.data\.token === _bridgeToken/);
});

test('interceptor redacts sensitive headers and bounds captured payloads before storing entries', () => {
  const interceptor = read('content/interceptor.js');

  assert.match(interceptor, /SENSITIVE_HEADER\s*=\s*\/\^\(authorization\|proxy-authorization\|cookie\|set-cookie/);
  assert.match(interceptor, /function _safeHeader/);
  assert.match(interceptor, /return '\[redacted\]'/);
  assert.match(interceptor, /MAX_CAPTURE_TEXT_CHARS\s*=\s*250000/);
  assert.match(interceptor, /MAX_CAPTURE_BODY_CHARS\s*=\s*50000/);
  assert.match(interceptor, /function _limitText/);
  assert.match(interceptor, /function _limitBody/);
  assert.match(interceptor, /requestBody:\s*_limitBody\(reqBody\)/);
  assert.match(interceptor, /responseRaw:\s*_limitText\(raw, MAX_CAPTURE_TEXT_CHARS\)/);
  assert.match(interceptor, /reqHeaders\[name\.toLowerCase\(\)\]\s*=\s*_safeHeader\(name, value\)/);
  assert.match(interceptor, /resHeaders\[line\.slice\(0, idx\).*_safeHeader\(line\.slice\(0, idx\)/);
});

test('React API summary uses the configured slow threshold instead of a hidden constant', () => {
  const entriesModel = read('src/panel/models/entries.ts');
  const entriesWorkspace = read('src/panel/components/api/EntriesWorkspace.tsx');

  assert.match(entriesModel, /buildApiListSummary\(entries: XrayEntry\[], pinnedIds: ReadonlySet<string>, slowThresholdMs = 500\)/);
  assert.match(entriesModel, /slow:\s*apis\.filter\(\(entry\) => duration\(entry\) >= slowThresholdMs\)\.length/);
  assert.match(entriesWorkspace, /settings\.slowThresholdMs/);
  assert.match(entriesWorkspace, /buildApiListSummary\(entries, pinnedIds, slowThresholdMs\)/);
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

  // reads the fresh array via getState so streaming commits don't re-run the
  // operations pipeline while the drawer is open
  assert.match(detail, /getResponseOperations\(entry, usePanelStore\.getState\(\)\.entries\)/);
  assert.match(detail, /xray-smart-ops/);
  assert.match(detail, /xray-operation-groups/);
  assert.match(detail, /runOperation/);
  assert.match(detail, /setDetailView\(operation\.view\)/);
  assert.match(detail, /insertConsoleCommand\(operation\.command\)/);
  assert.match(detail, /saveSnippet\(\{ title:/);
  // copy payloads may be lazy (built on click) — 500KB copy-full strings are
  // no longer materialized on every render of the action bar
  assert.match(detail, /operation\.command \?\? operation\.lazyCommand\?\.\(\)/);
  assert.match(operations, /lazyCommand: \(\) => safeStringify\(response, 2, 500_000\)/);
  assert.match(detail, /setExportOpen\(true\)/);
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

test('worker core owns expensive schema, diff, grid, and detail analysis operations', () => {
  const worker = read('workers/xray-worker.js');
  const workerClient = read('shared/worker-client.js');
  const detail = read('src/panel/components/detail/RequestDetail.tsx');
  const types = read('src/panel/types.ts');

  assert.match(worker, /function inferSchema/);
  assert.match(worker, /function detailAnalysis/);
  assert.match(worker, /structuralDiff:\s*computeDiff\(previous, current\)\.slice\(0, 500\)/);
  assert.match(worker, /engine:\s*'worker-js'/);
  assert.match(worker, /case 'inferSchema'/);
  assert.match(worker, /case 'detailAnalysis'/);

  assert.match(workerClient, /async inferSchema\(data\)/);
  assert.match(workerClient, /async detailAnalysis\(current, previous = null\)/);
  assert.match(types, /detailAnalysis\(current: unknown, previous\?: unknown\): Promise<unknown>/);

  assert.match(detail, /window\.XRAY_Worker\.detailAnalysis\(activeValue, previousValue\)/);
  assert.match(detail, /workerSchema \?\? schema\(value\)/);
  assert.match(detail, /workerGrid\?: ReturnType<typeof gridRows>/);
  // the structural diff renders added/removed/changed paths with a baseline jump
  assert.match(detail, /structuralDiff/);
  assert.match(detail, /Jump to baseline/);
});

test('legacy vanilla panel UI stays deleted', () => {
  for (const retired of [
    'panel/floating.js',
    'panel/console-ui.js',
    'panel/command-palette-v2.js',
    'panel/hud-core.js',
    'panel/entry-list.js',
    'panel/renderer.js',
    'panel/insights.js',
    'panel/export.js',
    'panel/search.js',
    'panel/shortcuts.js',
    'panel/themes.js',
    'panel/virtual-list.js',
    'panel/waterfall.js',
    'panel/n-plus-one.js',
    'panel/codemirror.bundle.js',
    'cm-bundler.js',
    'cm-entry.js',
  ]) {
    assert.ok(!fs.existsSync(path.join(root, retired)), `${retired} should stay deleted`);
  }
  const pkg = JSON.parse(read('package.json'));
  assert.ok(!Object.keys(pkg.dependencies || {}).some((name) => name.startsWith('@codemirror/')));
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

test('interceptor wraps WebSocket and EventSource and streams frames', () => {
  const interceptor = read('content/interceptor.js');
  assert.match(interceptor, /const _OrigWebSocket = window\.WebSocket/);
  assert.match(interceptor, /const _OrigEventSource = window\.EventSource/);
  assert.match(interceptor, /window\.WebSocket = WrappedWebSocket/);
  assert.match(interceptor, /window\.EventSource = WrappedEventSource/);
  assert.match(interceptor, /source:\s*'ws'/);
  assert.match(interceptor, /source:\s*'sse'/);
  assert.match(interceptor, /wsFrames/);
  assert.match(interceptor, /MAX_WS_FRAMES/);
  assert.match(interceptor, /update:\s*true/);
});

test('interceptor captures GraphQL operations, initiator stacks, and resource timing', () => {
  const interceptor = read('content/interceptor.js');
  assert.match(interceptor, /function _graphqlInfo/);
  assert.match(interceptor, /operationName/);
  assert.match(interceptor, /function _initiatorStack/);
  assert.match(interceptor, /function _resourceTiming/);
  assert.match(interceptor, /getEntriesByName/);
});

test('interceptor applies mock, delay, and fail rules before the real network call', () => {
  const interceptor = read('content/interceptor.js');
  assert.match(interceptor, /function _matchRule/);
  assert.match(interceptor, /function _sanitizeRule/);
  assert.match(interceptor, /rule\.action\.type === 'mock'/);
  assert.match(interceptor, /rule\.action\.type === 'fail'/);
  assert.match(interceptor, /rule\.action\.type === 'delay'/);
  // Null-body statuses (204/205/304) must not be handed a body — Response() throws.
  assert.match(interceptor, /new Response\(status === 204 \|\| status === 205 \|\| status === 304 \? null : body/);
  assert.match(interceptor, /function _simulateXhrResponse/);
  assert.match(interceptor, /mocked:\s*true/);
});

test('interceptor serves panel replay requests from the page world', () => {
  const interceptor = read('content/interceptor.js');
  assert.match(interceptor, /__xray_replay__/);
  assert.match(interceptor, /replayed:\s*true/);
});

test('rules model bounds runtime payloads and only ships enabled matchers', () => {
  const rules = read('src/panel/models/rules.ts');
  assert.match(rules, /export function normalizeRule/);
  assert.match(rules, /export function serializeRulesForRuntime/);
  // only enabled rules with a non-empty URL matcher reach the interceptor
  assert.match(rules, /rule\.enabled && rule\.match\.url\.trim\(\)/);
  // status is clamped to a valid HTTP range
  assert.match(rules, /clampNumber\(action\.status, 200, 100, 599\)/);
  // rule bodies are length-bounded
  assert.match(rules, /slice\(0, 100_000\)/);
  const interceptor = read('content/interceptor.js');
  assert.match(interceptor, /const MAX_RULES = 50/);
  assert.match(interceptor, /_config\.rules = config\.rules\.slice\(0, MAX_RULES\)\.map\(_sanitizeRule\)\.filter\(Boolean\)/);
});

test('rules have a starter preset library and portable export/import', () => {
  const rules = read('src/panel/models/rules.ts');
  const rulesUi = read('src/panel/components/rules/Rules.tsx');
  // preset library + round-trippable rule-set serialization
  assert.match(rules, /export const RULE_PRESETS/);
  assert.match(rules, /export function serializeRuleSet/);
  assert.match(rules, /export function parseRuleSet/);
  // imported rules get fresh ids so they never collide with existing ones
  assert.match(rules, /id: createRuleId\(\)/);
  // the Rules page wires presets + export (copy) + import (paste) in
  assert.match(rulesUi, /RULE_PRESETS\.map/);
  assert.match(rulesUi, /serializeRuleSet\(rules\)/);
  assert.match(rulesUi, /parseRuleSet\(importText\)/);
  assert.match(rulesUi, /setRules\(\[\.\.\.rules, \.\.\.parsed\]\)/);
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

  // Ctrl/Cmd+Shift+F shortcut + Escape layering + command-palette entry
  assert.match(main, /event\.shiftKey && key === 'f'/);
  assert.match(main, /store\.globalSearchOpen\) store\.setGlobalSearchOpen\(false\)/);
  assert.match(palette, /setGlobalSearchOpen\(true\)/);
});

test('drift detection is a pure module wired into the store', () => {
  const drift = read('src/panel/models/drift.ts');
  assert.match(drift, /export function schemaSignature/);
  assert.match(drift, /export function detectDrift/);
  assert.match(drift, /driftFromId/);
  const store = read('src/panel/store.ts');
  // drift runs inside the batched ingest so a capture batch is one store commit
  assert.match(store, /addEntries: \(batch\)/);
  assert.match(store, /detectDrift\(\{ \.\.\.raw, id \}, entries\)/);
  assert.match(store, /driftCount/);
});

test('JWT lens decodes base64url tokens found in headers and bodies', () => {
  const lenses = read('src/panel/models/lenses.ts');
  assert.match(lenses, /export function decodeJwt/);
  assert.match(lenses, /export function extractJwts/);
  assert.match(lenses, /const JWT_PATTERN = \/eyJ/);
  assert.match(lenses, /base64UrlDecode/);
  assert.match(lenses, /TextDecoder/);
  assert.match(lenses, /toIso\(payloadRecord\.exp\)/);
  // scans headers and bodies, request and response
  assert.match(lenses, /collectStrings\(entry\.requestHeaders/);
  assert.match(lenses, /collectStrings\(entry\.responseHeaders/);
  const detail = read('src/panel/components/detail/RequestDetail.tsx');
  assert.match(detail, /extractJwts\(entry\)/);
  assert.match(detail, /TokensView/);
});

test('HAR and session import parse into XRAY entries', () => {
  const importer = read('src/panel/models/import.ts');
  assert.match(importer, /export function parseImport/);
  // HAR detection via log.entries
  assert.match(importer, /log && Array\.isArray\(log\.entries\)/);
  assert.match(importer, /harEntryToXray/);
  // XRAY session detection via entries array
  assert.match(importer, /Array\.isArray\(sessionEntries\)/);
  assert.match(importer, /imported: true/);
  const exportModal = read('src/panel/components/export/ExportModal.tsx');
  assert.match(exportModal, /parseImport\(content\)/);
  assert.match(exportModal, /restoreEntries\(result\.entries\)/);
  assert.match(exportModal, /Import HAR \/ session/);
});

test('background service worker explains requests through a BYOK provider bridge', () => {
  const background = read('background.js');
  assert.match(background, /xray:ai-explain/);
  assert.match(background, /api\.anthropic\.com\/v1\/messages/);
  assert.match(background, /api\.openai\.com\/v1\/chat\/completions/);
  assert.match(background, /AI_TIMEOUT_MS/);
  assert.match(background, /MAX_AI_PROMPT_CHARS/);
});

test('HUD bundle listens for capture events directly in the MAIN world', () => {
  const hud = read('src/panel/hud-main.tsx');
  assert.match(hud, /installHudCaptureListener/);
  assert.match(hud, /event\.source !== window/);
  assert.match(hud, /__XRAY_BRIDGE_TOKEN__/);
  assert.match(hud, /store\.updateEntry/);
  assert.match(hud, /store\.addEntry/);
});

test('capture config bridge resolves the MAIN or ISOLATED token and relays updates', () => {
  const captureConfig = read('src/panel/runtime/captureConfig.ts');
  assert.match(captureConfig, /publishTrafficRules/);
  assert.match(captureConfig, /serializeRulesForRuntime/);
  assert.match(captureConfig, /captureWs/);
  const content = read('content/content.js');
  assert.match(content, /e\.data\.update && e\.data\.entry/);
  assert.match(content, /XRAY_Panel\?\.update\?\.\(e\.data\.entry\)/);
});

test('new panel surfaces are wired into the app shell and tabs', () => {
  const app = read('src/panel/App.tsx');
  assert.match(app, /<Rules \/>/);
  assert.match(app, /<ReplayModal \/>/);
  assert.match(app, /<ExplainModal \/>/);
  const tabs = read('src/panel/components/shell/panelTabs.tsx');
  assert.match(tabs, /id: 'rules'/);
});

test('options page reads and writes the shared React preference record', () => {
  const settings = read('settings/settings.js');
  assert.match(settings, /xray_react_panel_preferences/);
  assert.match(settings, /captureFetch/);
  assert.match(settings, /slowThreshold/);
  assert.doesNotMatch(settings, /autoOpen/);
});

test('Visualize view renders a real chart, not fake metadata JSON', () => {
  const viz = read('src/panel/models/viz.ts');
  const detail = read('src/panel/components/detail/RequestDetail.tsx');
  assert.match(viz, /export function buildVizSpec/);
  assert.match(viz, /kind: 'bars' \| 'none'/);
  assert.match(viz, /function coerceRows/);
  assert.match(viz, /function frequency/);
  assert.match(detail, /buildVizSpec\(value\)/);
  assert.match(detail, /xray-viz-bars/);
  assert.match(detail, /xray-viz-fill/);
  // the old fake viz that rendered schema metadata as JSON is gone
  assert.doesNotMatch(detail, /engine: workerMeta\?\.engine/);
  assert.doesNotMatch(detail, /main-thread-fallback/);
});

test('replay restores sensitive headers from a MAIN-world-only store', () => {
  const interceptor = read('content/interceptor.js');
  assert.match(interceptor, /const _secretStore = new Map\(\)/);
  assert.match(interceptor, /function _rememberSecrets/);
  assert.match(interceptor, /_secretStore\.get\(replayOf\)/);
  assert.match(interceptor, /credentials: 'include'/);
  assert.match(interceptor, /FORBIDDEN_REPLAY_HEADER/);
  // secrets are never emitted to the panel; only redacted headers leave the page
  assert.doesNotMatch(interceptor, /_emit\([^)]*_secretStore/);
  assert.match(interceptor, /_rememberSecrets\(id, req\.headers, init\.headers\)/);
  assert.match(interceptor, /_rememberSecrets\(xr\.id, xr\.rawSecrets\)/);
});

test('Logs tab can lazily load full logged objects', () => {
  const bridge = read('src/panel/runtime/logObjects.ts');
  const logDetail = read('src/panel/components/detail/LogDetail.tsx');
  const workspace = read('src/panel/components/api/EntriesWorkspace.tsx');
  assert.match(bridge, /export async function fetchLogObject/);
  assert.match(bridge, /__XRAY_fetchLogObject__/);
  assert.match(bridge, /__XRAY_getLogObject__/);
  assert.match(logDetail, /export function LogDetail/);
  assert.match(logDetail, /fetchLogObject\(ref\)/);
  assert.match(logDetail, /Load full object/);
  assert.match(workspace, /<LogDetail entry=\{selected\}/);
});

test('console Record button is honestly labelled as a stream pause, not capture', () => {
  const consoleWorkspace = read('src/panel/components/console/ConsoleWorkspace.tsx');
  const settingsModal = read('src/panel/components/settings/SettingsModal.tsx');
  const store = read('src/panel/store.ts');
  // paused = buffered (never dropped): the label counts what's waiting and the
  // store flushes the buffer back into the stream on resume
  assert.match(consoleWorkspace, /recording \? 'Live' : pausedCount > 0 \? `Paused · \$\{pausedCount\} new` : 'Paused'/);
  assert.match(consoleWorkspace, /Messages keep buffering and flush back in when you resume/);
  assert.match(store, /_pausedEvents = \[\];/);
  assert.match(store, /pausedCount: 0/);
  assert.match(settingsModal, /Stream to console live/);
});

test('header palette button opens Settings to Appearance with visual theme swatches', () => {
  const switcher = read('src/panel/components/shell/ThemeSwitcher.tsx');
  const shell = read('src/panel/components/shell/PanelShell.tsx');
  const settingsModal = read('src/panel/components/settings/SettingsModal.tsx');
  const store = read('src/panel/store.ts');
  const styles = read('src/panel/styles.css');

  // The palette button reuses the proven Settings modal path (no fragile custom
  // popover), jumping straight to the Appearance section.
  assert.match(switcher, /export function ThemeSwitcher/);
  assert.match(switcher, /openSettings\('appearance'\)/);
  assert.match(store, /openSettings: \(section\) => set\(\{ settingsSection: section, settingsOpen: true \}\)/);
  assert.match(shell, /<ThemeSwitcher \/>/);

  // Settings modal syncs to the requested section and renders visual theme swatches
  assert.match(settingsModal, /THEME_PREVIEWS/);
  assert.match(settingsModal, /if \(open\) setSection\(settingsSection as SettingsSection\)/);
  assert.match(settingsModal, /updateSettings\(preview\.accentPref \? \{ theme: preview\.id, accent: preview\.accentPref \} : \{ theme: preview\.id \}\)/);
  assert.match(settingsModal, /id: 'claude', label: 'Claude'/);
  assert.match(settingsModal, /accentPref: 'coral'/);
  assert.match(styles, /\.xray-theme-swatch/);
  assert.match(styles, /\.xray-theme-claude\s*\{/);

  // the HUD host must not use layout containment (it would trap fixed descendants)
  const hud = read('content/hud-mount.js');
  assert.match(hud, /:host \{ contain: style; \}/);
  assert.doesNotMatch(hud, /contain: layout/);
});

test('toasts auto-dismiss and the request list supports keyboard navigation', () => {
  const shell = read('src/panel/components/shell/PanelShell.tsx');
  const workspace = read('src/panel/components/api/EntriesWorkspace.tsx');
  // toast auto-dismisses on a timer
  assert.match(shell, /setTimeout\(clearToast/);
  // arrow-key navigation + Enter to open, with virtualizer scroll-into-view
  assert.match(workspace, /function handleListKeyDown/);
  assert.match(workspace, /event\.key === 'ArrowDown'/);
  assert.match(workspace, /virtualizer\.scrollToIndex\(nextIndex/);
  assert.match(workspace, /role="listbox"/);
});

test('interaction polish honors reduced-motion and consistent focus rings', () => {
  const styles = read('src/panel/styles.css');
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /button:focus-visible/);
  assert.match(styles, /@keyframes xray-bar-grow/);
});

test('custom theme gives full color freedom, stays scoped, and never affects the extension', () => {
  const model = read('src/panel/models/customTheme.ts');
  const shell = read('src/panel/components/shell/PanelShell.tsx');
  const settingsModal = read('src/panel/components/settings/SettingsModal.tsx');
  const styles = read('src/panel/styles.css');

  // pure derivation: four user colors -> a full, coherent token set
  assert.match(model, /export function buildCustomThemeVars/);
  assert.match(model, /export function normalizeCustomTheme/);
  assert.match(model, /export function clampHex/);
  assert.match(model, /'--xray-bg-rgb'/);
  assert.match(model, /'--xray-surface-rgb'/);
  assert.match(model, /'--xray-text-rgb'/);
  // status colors adapt to the chosen background's brightness
  assert.match(model, /DARK_STATUS/);
  assert.match(model, /LIGHT_STATUS/);
  assert.match(model, /luminance\(bg\) > 140/);

  // applied ONLY as inline CSS variables on .xray-panel -> scoped, cannot leak to the page or runtime
  assert.match(shell, /buildCustomThemeVars\(settings\.customTheme\)/);
  assert.match(shell, /settings\.theme === 'custom' \? buildCustomThemeVars/);
  assert.match(shell, /\.\.\.customVars/);

  // shadcn-style live editor with color + hex inputs and starter presets
  assert.match(settingsModal, /function CustomThemeEditor/);
  assert.match(settingsModal, /type="color"/);
  assert.match(settingsModal, /CUSTOM_PRESETS/);
  assert.match(settingsModal, /theme: 'custom', customTheme:/);
  assert.match(styles, /\.xray-custom-theme/);
  assert.match(styles, /\.xray-color-input/);
});

test('theme studio: radius, generate/randomize, import-export, and opt-in hacker overlay', () => {
  const model = read('src/panel/models/customTheme.ts');
  const settingsModal = read('src/panel/components/settings/SettingsModal.tsx');
  const shell = read('src/panel/components/shell/PanelShell.tsx');
  const settingsModel = read('src/panel/models/panelSettings.ts');
  const styles = read('src/panel/styles.css');

  // generate a whole theme from one color; coherent random; shareable export/import
  assert.match(model, /export function generateFromAccent/);
  assert.match(model, /export function randomTheme/);
  assert.match(model, /export function exportThemeCss/);
  assert.match(model, /export function parseThemeInput/);
  // editor exposes them
  assert.match(settingsModal, /generateFromAccent\(custom\.accent, 'dark'\)/);
  assert.match(settingsModal, /randomTheme\(Math\.random\(\)\)/);
  assert.match(settingsModal, /exportThemeCss\(custom\)/);
  assert.match(settingsModal, /parseThemeInput\(importText\)/);

  // radius + hacker are real settings, applied via scoped inline vars / class
  assert.match(settingsModel, /radius: 10/);
  assert.match(settingsModel, /hacker: false/);
  assert.match(settingsModel, /clampNumber\(base\.radius, DEFAULT_PANEL_SETTINGS\.radius, 0, 20\)/);
  assert.match(shell, /'--xray-radius': `\$\{settings\.radius\}px`/);
  assert.match(shell, /settings\.hacker \? 'xray-hacker' : ''/);
  assert.match(styles, /--xray-radius/);
  assert.match(styles, /\.xray-panel\.xray-hacker::after/);
  // hacker flicker only runs when motion is allowed
  assert.match(styles, /@media \(prefers-reduced-motion: no-preference\)/);

  // radius is a real token scale used everywhere, not a hand-picked allowlist
  const tokens = read('src/panel/styles/tokens.css');
  assert.match(tokens, /--xray-radius-sm: calc\(var\(--xray-radius\) \* 0\.6\)/);
  assert.match(tokens, /--xray-radius-lg: calc\(var\(--xray-radius\) \* 1\.4\)/);
  // every rounded-rect radius is token-driven across ALL stylesheets (incl. the HUD
  // frame); only 999px pills / 50% circles are literal
  const hudCss = read('src/panel/styles/hud.css');
  const literalRadii = [...styles.matchAll(/border-radius:\s*[0-9]+px/g), ...hudCss.matchAll(/border-radius:\s*[0-9]+px/g)].map((m) => m[0]);
  for (const decl of literalRadii) {
    assert.match(decl, /999px/, `non-pill literal radius should use the token: ${decl}`);
  }
  // the HUD frame is an ancestor of the panel, so its vars are mirrored onto the host
  const hudMain = read('src/panel/hud-main.tsx');
  assert.match(hudMain, /syncHostTheme/);
  assert.match(hudMain, /'--xray-radius'/);
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

test('theme studio: WCAG contrast checker and shareable theme codes (with URL hash)', () => {
  const model = read('src/panel/models/customTheme.ts');
  const settingsModal = read('src/panel/components/settings/SettingsModal.tsx');
  const windowMain = read('src/panel/window-main.tsx');

  // WCAG contrast
  assert.match(model, /export function contrastRatio/);
  assert.match(model, /export function contrastGrade/);
  assert.match(model, /ratio >= 4\.5/);
  assert.match(settingsModal, /function ContrastReport/);
  // grades read the fully-resolved tokens (pinned or derived), not just the raw base four
  assert.match(settingsModal, /resolveThemeColors\(theme\)/);
  assert.match(settingsModal, /contrastRatio\(c\.text, c\.bg\)/);
  // covers the pairs themes most often fail: muted-on-bg and text-over-accent
  assert.match(settingsModal, /contrastRatio\(c\.subtext, c\.bg\)/);
  assert.match(settingsModal, /contrastRatio\(c\.text, c\.accent\)/);

  // portable share codes carry the whole look (colors + font + radius + effect)
  assert.match(model, /export function encodeTheme/);
  assert.match(model, /export function decodeTheme/);
  assert.match(model, /const CODE_PREFIX = 'xray1:'/);
  assert.match(settingsModal, /encodeTheme\(\{ colors: custom, font, radius, hacker \}\)/);
  assert.match(settingsModal, /decodeTheme\(importText\)/);

  // a shared theme can arrive as a window URL hash (#theme=…) and only mutates
  // panel settings — both import paths share one package→settings mapping
  assert.match(windowMain, /applyThemeFromHash/);
  assert.match(windowMain, /decodeTheme\(hash\)/);
  assert.match(windowMain, /themePackageToSettings\(pkg\)/);
  assert.match(read('src/panel/models/customTheme.ts'), /export function themePackageToSettings/);
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

test('theme studio has a live preview, screen eyedropper, and per-token copy', () => {
  const settingsModal = read('src/panel/components/settings/SettingsModal.tsx');
  const styles = read('src/panel/styles.css');

  // a composed preview painted with the exact resolved theme vars (so you can see a theme while editing it)
  assert.match(settingsModal, /function ThemePreview/);
  assert.match(settingsModal, /buildCustomThemeVars\(theme\)/);
  assert.match(settingsModal, /<ThemePreview theme=\{custom\} \/>/);
  assert.match(styles, /\.xray-theme-preview/);

  // per-token screen eyedropper (feature-checked) and copy
  assert.match(settingsModal, /'EyeDropper' in window/);
  assert.match(settingsModal, /new Ctor\(\)\.open\(\)/);
  assert.match(settingsModal, /IconColorPicker/);
  assert.match(settingsModal, /onCopy=\{\(\) => \{ void copyText/);
  assert.match(styles, /\.xray-token-btn/);
});
