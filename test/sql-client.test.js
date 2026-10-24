// The SQL client lives on its own extension page (sql.html) with its own bundles, so SQLite-WASM
// and CodeMirror never enter the bundles that are injected into every website.

const assert = require('node:assert/strict');
const test = require('node:test');

const { read, readManifest } = require('./helpers/source');

const SQL_FILES = ['sql.html', 'dist/sql-ui.js', 'dist/sql-worker.js', 'dist/sqlite3.wasm'];

test('extension pages may compile WebAssembly, and nothing else is loosened', () => {
  const csp = readManifest().content_security_policy.extension_pages;
  assert.match(csp, /script-src 'self' 'wasm-unsafe-eval'/);
  assert.doesNotMatch(csp, /'unsafe-eval'/);
  const scriptSrc = csp.split(';').find((d) => d.trim().startsWith('script-src'));
  assert.doesNotMatch(scriptSrc, /'unsafe-inline'/, 'script-src never allows inline script');
});

// sql.html is web-accessible only so the opt-in inline HUD can frame it (settings.sqlInlineInHud),
// and only through Chrome's per-session dynamic URL. Its bundles, worker and wasm stay private: the
// framed document is extension-origin and loads them itself, so no page can fetch them directly.
test('only sql.html is web-accessible, in one entry behind a dynamic URL; its bundles never are', () => {
  const groups = readManifest().web_accessible_resources;
  const withSql = groups.filter((group) => group.resources.includes('sql.html'));
  assert.equal(withSql.length, 1, 'sql.html appears in exactly one entry');
  assert.deepEqual(withSql[0].resources, ['sql.html'], 'the entry exposes sql.html alone');
  assert.equal(withSql[0].use_dynamic_url, true, 'reachable only through the per-session dynamic URL');
  const resources = groups.flatMap((group) => group.resources);
  for (const file of SQL_FILES.filter((name) => name !== 'sql.html')) {
    assert.ok(!resources.includes(file), `${file} must not be web-accessible`);
  }
});

// Readiness goes through the extension runtime, never the page window: a window message would hand
// the page a WindowProxy to the frame (event.source) and let it swallow the signal.
test('framed sql.html reports readiness through the extension runtime, never to the page window', () => {
  const main = read('src/panel/sql-main.tsx');
  assert.match(main, /if \(window\.parent !== window\) chrome\?\.runtime\?\.sendMessage\?\.\(\{ type: SQL_FRAME_READY_MESSAGE \}/);
  assert.doesNotMatch(main, /postMessage/);
  assert.match(main, /sqlClientAllowedIn\(/, 'a web page frames the client only with the inline option on');
  assert.match(read('src/panel/models/sqlFrameReady.ts'), /export const SQL_FRAME_READY_MESSAGE = 'xray:sql-frame-ready';/);
  const bg = read('background.js');
  const relay = bg.slice(bg.indexOf("if (msg.type === 'xray:sql-frame-ready')"));
  assert.ok(bg.indexOf("if (msg.type === 'xray:sql-frame-ready')") > bg.indexOf('if (sender?.id !== chrome.runtime.id) return false;'), 'behind the extension-id guard');
  assert.match(relay.slice(0, 1200), /url\.protocol !== 'chrome-extension:'/);
  assert.match(relay.slice(0, 1200), /url\.pathname !== '\/sql\.html'/);
  assert.match(relay.slice(0, 1200), /chrome\.tabs\.sendMessage\(sender\.tab\.id, \{ type: 'xray:sql-frame-ready' \}, \{ frameId: 0 \}\)/);
  const frame = read('src/panel/components/sql/SqlFrame.tsx');
  assert.match(frame, /chrome\.runtime\?\.onMessage/);
  assert.match(frame, /events\?\.addListener\(onMessage\)/);
  assert.doesNotMatch(frame, /addEventListener\('message'/);
});

test('the HUD frames the client only with the opt-in setting, and falls back to the window card', () => {
  const frame = read('src/panel/components/sql/SqlFrame.tsx');
  // App passes the option, latched once the frame has mounted (shell-navigation-modals.test.js).
  assert.match(frame, /if \(mode === 'hud'\) \{\s*return inlineInHud \?/);
  assert.match(frame, /This site blocked the embedded client\./);
  assert.match(frame, /SQL_FRAME_READY_TIMEOUT_MS/);
  const modal = read('src/panel/components/settings/SettingsModal.tsx');
  assert.match(modal, /label="Show SQL client inside the page HUD"/);
  assert.match(modal, /desc="Shows the client in a frame inside the page instead of a separate window\. The page cannot read the frame, but any site could embed the client\."/);
});

// Ruling M3-R27: saved databases inside the page HUD are a second, confirmed opt-in under the first.
test('the HUD databases option sits under the inline option, needs it, and asks before it turns on', () => {
  const modal = read('src/panel/components/settings/SettingsModal.tsx');
  const inline = modal.indexOf('label="Show SQL client inside the page HUD"');
  const databases = modal.indexOf('label="Allow saved database connections in the page HUD"');
  assert.ok(inline > 0 && databases > inline, 'directly under the inline option');
  assert.match(modal, /Turn on the option above first\./);
  assert.match(modal, /The page you are on cannot read the client, but it could try to trick you into clicking it\. Keep connections read-only, or leave this off\./);
  assert.match(modal, /disabled=\{!sqlHud\.sqlInlineInHud\}/);
  // Ruling M3-R28: the toggles write the worker-owned options; the in-page panel only links out.
  assert.match(modal, /surface === 'hud' \?/);
  assert.match(modal, /Change this in\{' '\}/);
  assert.match(modal, /XRAY&apos;s settings page/);
  assert.match(modal, /type: 'XRAY_OPEN_OPTIONS'/);
  assert.match(modal, /writeSqlHudOptions\(patch\)/);
  assert.doesNotMatch(modal, /updateSettings\(\{ sqlInlineInHud/);
  assert.doesNotMatch(modal, /updateSettings\(\{ sqlDatabasesInHud/);
  assert.match(modal, /confirmLabel: 'Allow'/);
  assert.match(modal, /cancelLabel: 'Cancel'/);
  assert.match(modal, /always: true/);
});

test('sql.html loads only relative scripts, the shared store before its bundle', () => {
  const html = read('sql.html');
  const scripts = [...html.matchAll(/<script\s+src="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(scripts.length > 0);
  for (const src of scripts) assert.doesNotMatch(src, /:\/\//, `${src} must be relative`);
  const utils = scripts.indexOf('shared/utils.js');
  const store = scripts.indexOf('shared/store.js');
  const bundle = scripts.indexOf('dist/sql-ui.js');
  assert.ok(utils >= 0 && store >= 0 && bundle >= 0, 'utils, store and the bundle are all loaded');
  assert.ok(utils < bundle && store < bundle, 'the store is ready before the bundle reads it');
  assert.match(html, /id="xray-sql-root"/);
});

test('the bundles injected into pages carry no SQL client code', () => {
  for (const bundle of ['dist/panel-ui.js', 'dist/hud-ui.js', 'dist/window-ui.js']) {
    const text = read(bundle);
    for (const marker of ['cm-editor', 'sqlite3_deserialize', 'XRAYSqlUI']) {
      assert.ok(!text.includes(marker), `${bundle} must not contain ${marker}`);
    }
  }
});

test('the release package ships sql.html', () => {
  assert.match(read('scripts/package-extension.mjs'), /const allowList = \[[^\]]*'sql\.html'/);
  assert.match(read('scripts/package-extension.ps1'), /\$allowList = @\([^)]*"sql\.html"/);
});

test('dist-sync covers the SQL page bundles and the wasm', () => {
  const script = read('scripts/check-dist-sync.mjs');
  for (const file of ['dist/sql-ui.js', 'dist/sql-worker.js', 'dist/sqlite3.wasm']) {
    assert.ok(script.includes(`'${file}'`), `check-dist-sync compares ${file}`);
  }
});
