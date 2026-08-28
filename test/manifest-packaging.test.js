// manifest.json, devtools HTML, package.json metadata, and the packaging allow/deny lists.

const assert = require('node:assert/strict');
const test = require('node:test');

const { read, readManifest, readPkg, exists } = require('./helpers/source');

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

test('C-8 debugger is an optional permission, requested only when the console runs', () => {
  // Was a required install-time permission. Combined with <all_urls> and MAIN-world
  // injection that is close to the maximum-scrutiny configuration for store review,
  // and it was demanded from every user whether or not they opened the console.
  //
  // C-8 also proposed trying MAIN-world `new Function` first and falling back to the
  // debugger. That half is SUPERSEDED by C-1: MAIN-world execution is deleted, so the
  // debugger is the only path and the fix is to stop requesting it up front.
  const manifest = readManifest();
  const background = read('background.js');
  const consoleEngine = read('panel/console.js');

  assert.ok(!manifest.permissions.includes('debugger'), 'not required at install time');
  assert.ok(manifest.optional_permissions.includes('debugger'), 'requested on demand instead');

  assert.match(background, /function _hasDebuggerPermission/);
  assert.match(background, /chrome\.permissions\.contains\(\{ permissions: \['debugger'\] \}/);
  assert.match(background, /needsPermission: 'debugger'/, 'the panel is told what to ask for');
  assert.match(background, /xray:console-eval/);
  assert.match(background, /chrome\.debugger\.attach/);
  assert.match(background, /Runtime\.evaluate/);
  assert.match(consoleEngine, /_executePrivileged/);
  assert.match(consoleEngine, /type:\s*'xray:console-eval'/);
});

test('manifest does not load a separate intelligence script', () => {
  const manifest = readManifest();
  const isolated = manifest.content_scripts[1].js;
  const retiredScript = ['panel', 'co' + 'pilot.js'].join('/');
  assert.ok(!isolated.includes(retiredScript));
});

test('manifest loads the React UI bundle after vanilla runtime scripts', () => {
  const manifest = readManifest();
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
  const manifest = readManifest();
  const hudScript = manifest.content_scripts.find((script) => script.js?.includes('content/hud-mount.js'));
  const resources = manifest.web_accessible_resources.flatMap((item) => item.resources || []);

  assert.ok(manifest.permissions.includes('windows'));
  assert.equal(manifest.action.default_title, 'XRAY');
  assert.ok(hudScript, 'HUD mount content script is required');
  assert.equal(hudScript.world, 'ISOLATED');
  assert.equal(hudScript.run_at, 'document_idle');
  // Only the resources a CONTENT SCRIPT has to reach are web-accessible.
  // dist/hud-ui.js is dynamically imported by content/hud-mount.js, so it must be.
  assert.ok(resources.includes('dist/hud-ui.js'));

  // C-10: window.html and its bundle are NOT, and never needed to be. The pop-out
  // opens with chrome.windows.create(chrome.runtime.getURL('window.html')), which
  // does not require web-accessibility, and window.html loads dist/window-ui.js
  // itself with a <script src> as an extension page. Exposing window.html let ANY
  // page iframe it, and src/panel/window-main.tsx reads location.hash and calls
  // updateSettings, which persists to chrome.storage.local — so a hostile page could
  // permanently alter panel settings with no user interaction.
  assert.ok(!resources.includes('window.html'), 'window.html must not be web-accessible');
  assert.ok(!resources.includes('dist/window-ui.js'), 'nor its bundle');
  assert.match(read('background.js'), /chrome\.runtime\.getURL\('window\.html'\)/,
    'because the pop-out opens through chrome.windows.create instead');
  assert.match(read('window.html'), /<script src="dist\/window-ui\.js">/,
    'and the bundle is loaded by the extension page itself');

  assert.ok(!manifest.content_scripts[0].js.includes('dist/hud-ui.js'));
  assert.ok(!manifest.content_scripts[0].js.includes('dist/window-ui.js'));
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
  // the pop-out shares chrome.storage with every other surface: store.js must be
  // defined before the bundle boots, or storageBridge fails closed and every
  // preference read falls back to its default while writes are dropped
  assert.match(windowHtml, /<script src="shared\/store\.js"><\/script>\s*\n\s*<script src="dist\/window-ui\.js"><\/script>/);
  assert.match(vite, /hud-main\.tsx/);
  assert.match(vite, /window-main\.tsx/);
  assert.match(vite, /dist\/hud-ui\.js/);
  assert.match(vite, /dist\/window-ui\.js/);
  assert.match(vite, /format:\s*'iife'/);
});

test('React migration packages and scripts are present', () => {
  const pkg = readPkg();

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
  const manifest = readManifest();
  const pkg = readPkg();
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

test('React migration does not use older virtualization libraries', () => {
  const pkg = readPkg();
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
    assert.ok(!exists(retired), `${retired} should stay deleted`);
  }
  const pkg = readPkg();
  assert.ok(!Object.keys(pkg.dependencies || {}).some((name) => name.startsWith('@codemirror/')));
});

test('options page reads and writes the shared React preference record', () => {
  const settings = read('settings/settings.js');
  assert.match(settings, /xray_react_panel_preferences/);
  assert.match(settings, /captureFetch/);
  assert.match(settings, /slowThreshold/);
  assert.doesNotMatch(settings, /autoOpen/);
});
