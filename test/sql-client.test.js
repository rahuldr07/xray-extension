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

test('the SQL page and its bundles are never web-accessible', () => {
  const resources = readManifest().web_accessible_resources.flatMap((group) => group.resources);
  for (const file of SQL_FILES) {
    assert.ok(!resources.includes(file), `${file} must not be web-accessible`);
  }
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
