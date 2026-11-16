// manifest.json, devtools HTML, package.json metadata, and the packaging allow/deny lists.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { read, readManifest, readPkg, exists } = require('./helpers/source');

test('the console helpers live in the ISOLATED world only', () => {
  // They used to sit in the MAIN group, and the single-injection rule (Chrome
  // injects a file once per frame even when it is listed in both worlds) forced
  // content.js to import them at runtime for the isolated side.
  //
  // That arrangement existed for the MAIN-world console executor, which C-1 deleted.
  // Nothing in the page realm read the helpers afterwards, so the file was parsed on
  // every page visit for no consumer while leaving a writable global there. Listing
  // it in the ISOLATED group removes both, and lets it leave web_accessible_resources
  // too: the only remaining reader outside this world is the background service
  // worker, which fetches it with its own privileges, and WAR does not gate that.
  const manifest = read('manifest.json');
  const parsed = JSON.parse(manifest);
  const helperRefs = manifest.match(/shared\/console-helpers\.js/g) || [];
  assert.equal(helperRefs.length, 1, 'listed exactly once, in one world');

  assert.ok(!parsed.content_scripts[0].js.includes('shared/console-helpers.js'), 'not in MAIN');
  assert.ok(parsed.content_scripts[1].js.includes('shared/console-helpers.js'), 'in ISOLATED');
  assert.ok(!parsed.web_accessible_resources[0].resources.includes('shared/console-helpers.js'),
    'and no longer reachable from a page');

  assert.doesNotMatch(read('content/content.js'), /import\(chrome\.runtime\.getURL\('shared\/console-helpers\.js'\)\)/,
    'the runtime import is gone');
  assert.match(read('shared/console-helpers.js'), /window\.XRAY_ConsoleHelpers/);
});

test('C-8 debugger is a required permission, because Chrome cannot make it optional', () => {
  // C-8 moved `debugger` to optional_permissions to avoid an install-time warning. Chrome
  // does not support `debugger` as an optional permission: it is silently ignored there,
  // chrome.permissions.request rejects with "Only permissions specified in the manifest
  // may be requested", and chrome.debugger stays undefined — so console execution could
  // never run. The debugger is the only execution path since C-1 deleted MAIN-world
  // evaluation, so it is required at install time again (accepted trade-off).
  const manifest = readManifest();
  const background = read('background.js');
  const consoleEngine = read('panel/console.js');

  assert.ok(manifest.permissions.includes('debugger'), 'required at install time');
  assert.ok(!(manifest.optional_permissions || []).includes('debugger'), 'never listed as optional');

  assert.match(background, /function _hasDebuggerPermission/);
  assert.match(background, /chrome\.permissions\.contains\(\{ permissions: \['debugger'\] \}/);
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
  // shared/console-helpers.js now IS here, ahead of its first reader.
  assert.ok(isolated.includes('shared/console-helpers.js'));
  assert.ok(isolated.indexOf('shared/console-helpers.js') < isolated.indexOf('panel/console.js'),
    'panel/console.js reads window.XRAY_ConsoleHelpers, so it must load after it');
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
  assert.match(windowHtml, /<script src="shared\/utils\.js"><\/script>\s*\n\s*<script src="shared\/store\.js"><\/script>\s*\n\s*<script src="shared\/console-helpers\.js"><\/script>\s*\n\s*<script src="dist\/window-ui\.js"><\/script>/);
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
  // The retired vanilla editor bundle must not return. The SQL client (dist/sql-ui.js) is the only
  // consumer of CodeMirror, so only its packages may be dependencies.
  const sqlEditorPackages = new Set([
    '@codemirror/state',
    '@codemirror/view',
    '@codemirror/language',
    '@codemirror/commands',
    '@codemirror/autocomplete',
    '@codemirror/lang-sql',
  ]);
  const strayCodemirror = Object.keys(pkg.dependencies || {}).filter(
    (name) => name.startsWith('@codemirror/') && !sqlEditorPackages.has(name),
  );
  assert.deepEqual(strayCodemirror, []);
});

test('options page reads and writes the shared React preference record', () => {
  const settings = read('settings/settings.js');
  assert.match(settings, /xray_react_panel_preferences/);
  assert.match(settings, /captureFetch/);
  assert.match(settings, /slowThreshold/);
  assert.doesNotMatch(settings, /autoOpen/);
});

test('M3 helper: pinned extension key, optional nativeMessaging, one ID everywhere', () => {
  const crypto = require('node:crypto');
  const manifest = readManifest();

  assert.deepEqual(manifest.optional_permissions, ['nativeMessaging']);
  assert.ok(!manifest.permissions.includes('nativeMessaging'), 'never required at install time');

  // Chrome derives the extension ID from the manifest key: sha256 of the DER
  // SubjectPublicKeyInfo, first 32 hex chars, each of 0-f mapped onto a-p.
  assert.match(manifest.key, /^[A-Za-z0-9+/]+=*$/);
  const der = Buffer.from(manifest.key, 'base64');
  const key = crypto.createPublicKey({ key: der, format: 'der', type: 'spki' });
  assert.equal(key.asymmetricKeyType, 'rsa');
  assert.equal(key.asymmetricKeyDetails.modulusLength, 2048);
  const id = crypto.createHash('sha256').update(der).digest('hex').slice(0, 32)
    .replace(/[0-9a-f]/g, (c) => String.fromCharCode('a'.charCodeAt(0) + parseInt(c, 16)));
  assert.match(id, /^[a-p]{32}$/);

  assert.match(read('helper/install/install.sh'), new RegExp(`^XRAY_EXTENSION_ID="${id}"$`, 'm'));
  assert.match(read('helper/install/install.ps1'), new RegExp(`^\\$XrayExtensionId = '${id}'$`, 'm'));
  assert.match(read('src/panel/models/sqlProfiles.ts'),
    new RegExp(`export const HELPER_EXTENSION_ID = '${id}'`));
});

test('M3 helper: the release zip is extension-only and never ships helper/ or a private key', () => {
  const script = read('scripts/package-extension.mjs');
  const list = script.match(/const allowList = \[([\s\S]*?)\];/)[1];
  assert.doesNotMatch(list, /helper/);
  assert.doesNotMatch(list, /\.pem/);
  assert.doesNotMatch(list, /install/);
});

test('M3 SQL manager: the release ships background/sql-manager.js, which background.js imports', () => {
  // Ruling M3-R3: only the manager file, not a growing background/ folder.
  const list = read('scripts/package-extension.mjs').match(/const allowList = \[([\s\S]*?)\];/)[1];
  assert.match(list, /'background\/sql-manager\.js'/);
  assert.doesNotMatch(list, /'background\/?'/);
  // Copy-Item would flatten a nested file, so the PowerShell script copies the
  // folder; it must therefore hold nothing but the manager.
  assert.match(read('scripts/package-extension.ps1'), /\$allowList = @\([^)]*"background"/);
  assert.deepEqual(fs.readdirSync(path.join(__dirname, '..', 'background')), ['sql-manager.js']);
  assert.match(read('background.js'), /importScripts\('background\/sql-manager\.js'\)/);
});
