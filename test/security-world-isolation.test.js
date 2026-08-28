// Cross-world message-bridge hardening: source checks, bridge tokens, header redaction, replay secrets.

const assert = require('node:assert/strict');
const test = require('node:test');

const { read, readManifest, exists } = require('./helpers/source');

test('content bridge ignores postMessage events from non-window sources', () => {
  const content = read('content/content.js');
  assert.match(content, /e\.source\s*!==\s*window/);
});

test('console capture ignores postMessage events from non-window sources', () => {
  // Every bridge listener must reject messages that did not originate in this window.
  // console-capture.js was the one that did not, so a cross-origin frame or opener
  // could address its lazy-object handler directly.
  const consoleCapture = read('content/console-capture.js');
  assert.match(consoleCapture, /e\.source\s*!==\s*window/);
});

test('C-1 the console context never reaches the page world', () => {
  // content/console-executor.js is DELETED. It was the MAIN-world receiver for the
  // fallback execution path, and panel/console.js posted the whole console context
  // to it with targetOrigin '*' — captured URLs across every origin in the session,
  // full bodies for the selected entry, decoded JWT claims — readable by one
  // `window.addEventListener('message', …)` on any page, as soon as the user ran
  // any expression at all.
  assert.equal(exists('content/console-executor.js'), false,
    'the MAIN-world executor must stay deleted');

  const consoleEngine = read('panel/console.js');
  assert.doesNotMatch(consoleEngine, /XRAY_EXEC_REQUEST/, 'no exec request is posted to the page');
  assert.doesNotMatch(consoleEngine, /XRAY_CONSOLE_SESSION/, 'and no session handshake either');
  assert.doesNotMatch(consoleEngine, /_executeInMainWorld/);
  assert.match(consoleEngine, /xray:console-eval/, 'execution is privileged-path only');

  const mainWorld = readManifest().content_scripts.find((group) => group.world === 'MAIN');
  assert.equal(mainWorld.js.includes('content/console-executor.js'), false,
    'and it is no longer injected into every page');
});

test('C-1 the privileged expression inlines the helper source instead of reading a page global', () => {
  // The debugger-evaluated expression ran in the page's MAIN world and read
  // `window.XRAY_ConsoleHelpers`, a plain writable page global: replacing
  // createRuntime handed the attacker the entire inlined context. The helper source
  // is now inlined and evaluated against a shadowed `window`.
  const background = read('background.js');
  assert.match(background, /_loadConsoleHelperSource/);
  assert.match(background, /chrome\.runtime\.getURL\('shared\/console-helpers\.js'\)/);
  assert.match(background, /const window = \{\};/, 'the helper IIFE writes into a shadowed window');
  assert.doesNotMatch(background, /const __helpers = window\.XRAY_ConsoleHelpers/,
    'the page global is never read by the evaluated expression');
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
  // C-3 then C-6: the update path validates the entry as untrusted input first, then
  // resolves decryption in the isolated world.
  assert.match(content, /_resolveDecrypt\(_validateEntry\(e\.data\.entry, \{ isUpdate: true \}\)\)/);
  assert.match(content, /XRAY_Panel\?\.update\?\.\(updated\)/);
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
  // each record is pinned to the origin its request went to, so every call site
  // must hand _rememberSecrets that URL
  // C-4b: the record now also carries the unscrubbed URL, because a credential can
  // live only in the query string and the panel never sees the real one.
  assert.match(interceptor, /_secretStore\.set\(id, \{/);
  assert.match(interceptor, /origin: _originOf\(url\),/);
  assert.match(interceptor, /values: secret,/);
  assert.match(interceptor, /rawUrl: urlWasScrubbed \? rawUrl : null,/);
  assert.match(interceptor, /_rememberSecrets\(id, url, req\.headers, init\.headers\)/);
  assert.match(interceptor, /_rememberSecrets\(id, url, init\.headers\)/);
  assert.match(interceptor, /_rememberSecrets\(xr\.id, xr\.url, xr\.rawSecrets\)/);
  assert.match(interceptor, /_extractJwtLenses\(_secretStore\.get\(id\)\?\.values\)/);
});

test('replay only re-attaches remembered secrets to the origin they came from', () => {
  const interceptor = read('content/interceptor.js');
  // Edit & Replay lets the URL be rewritten and hides the redacted auth rows, so
  // an unchecked restore would forward a live bearer token to any host the user
  // typed. On a mismatch the placeholders are dropped and the replay goes out
  // unauthenticated instead.
  assert.match(interceptor, /const record = replayOf \? _secretStore\.get\(replayOf\) : null;/);
  assert.match(interceptor, /const secrets = sameOrigin \? record\.values : \{\};/);
  assert.match(interceptor, /function _originOf\(url\)/);

  // C-2: the gate is now two independent checks. `_originOf` parses with a URL
  // constructor pinned at document_start, and `_urlIsUnder` is a plain string
  // comparison that touches no global — so replacing window.URL no longer widens it.
  assert.match(interceptor, /pinnedOrigin === _originOf\(url\)/);
  assert.match(interceptor, /_urlIsUnder\(url, pinnedOrigin\)/);
  assert.match(interceptor, /function _urlIsUnder\(url, origin\)/);
  assert.match(interceptor, /const _URL = window\.URL;/, 'the URL constructor is pinned before page script runs');
  assert.doesNotMatch(interceptor, /new URL\(/, 'and nothing parses through the live global');

  // C-2: the replay goes through OUR wrapper, not window.fetch, so a page that
  // re-wraps fetch after document_start never sees the restored Authorization value.
  assert.match(interceptor, /const _xrayFetch = async function/);
  assert.match(interceptor, /_xrayFetch\(url, init\)\.catch/);
  assert.doesNotMatch(interceptor, /window\.fetch\(url, init\)/);
  // the raw map value is never spread into the outgoing headers unguarded
  assert.doesNotMatch(interceptor, /const secrets = replayOf \? \(_secretStore\.get\(replayOf\) \|\| \{\}\) : \{\};/);
});

test('C-6 decryption never runs in the page world', () => {
  // content/decrypt-bridge.js is DELETED. It published `window.__XRAY_decrypt__` as a
  // writable page global. The shipped stub returned null so nothing leaked yet, but the
  // file existed to be filled in — and once it is, a page can read whatever the closure
  // captures, use it as a decryption oracle, or replace it and feed the analyst
  // fabricated plaintext stamped decryptStatus: 'ok'.
  assert.equal(exists('content/decrypt-bridge.js'), false, 'the MAIN-world hook must stay deleted');

  const interceptor = read('content/interceptor.js');
  assert.doesNotMatch(interceptor, /__XRAY_decrypt__/, 'the interceptor reads no decrypt global');
  assert.match(interceptor, /function _decryptPending\(token, data\)/);
  assert.match(interceptor, /decryptStatus = _decryptPending\(token, parsed\) \? 'pending' : 'none'/);

  const content = read('content/content.js');
  assert.match(content, /function _resolveDecrypt\(entry\)/, 'the isolated world resolves it');
  assert.match(content, /window\.XRAY_Decrypt\?\.decrypt\?\./);

  const mainWorld = readManifest().content_scripts.find((group) => group.world === 'MAIN');
  assert.equal(mainWorld.js.includes('content/decrypt-bridge.js'), false,
    'and it is no longer injected into every page');
  const isolated = readManifest().content_scripts.find((group) => group.world !== 'MAIN');
  assert.ok(isolated.js.includes('shared/decrypt.js'), 'the surviving hook is isolated-world');
});

test('C-3 every MAIN-world message is validated as untrusted input', () => {
  // window.__XRAY_BRIDGE_TOKEN__ is a MAIN-world global, so every gate built on it is
  // one property read from bypass, and the extension is trivially fingerprintable. The
  // token filters accidents; validation is what contains a hostile page.
  const content = read('content/content.js');

  assert.match(content, /function _validateEntry\(raw, \{ isUpdate = false \} = \{\}\)/);
  // A new object is built field by field, so nothing unexamined rides into the store.
  assert.match(content, /const entry = \{ id: raw\.id, type: raw\.type \};/);
  assert.match(content, /if \(!ENTRY_TYPES\.has\(raw\.type\)\) return null;/);
  assert.match(content, /if \(typeof raw\.id !== 'string' \|\| !raw\.id \|\| raw\.id\.length > 200\) return null;/);

  // An update for an id this world never originated is a page inventing a target.
  assert.match(content, /if \(isUpdate && !_knownEntryIds\.has\(raw\.id\)\) return null;/);

  // Sizes are capped on every unbounded field.
  assert.match(content, /MAX_BRIDGE_TEXT/);
  assert.match(content, /MAX_BRIDGE_ARRAY/);
  assert.match(content, /MAX_BATCH_ENTRIES/);
  assert.match(content, /e\.data\.entries\.slice\(0, MAX_BATCH_ENTRIES\)/);

  // All three ingestion paths go through it.
  assert.match(content, /_validateEntry\(e\.data\.entry\)/, 'single-entry path');
  assert.match(content, /\.map\(\(raw\) => _validateEntry\(raw\)\)/, 'batch path');
  assert.match(content, /_validateEntry\(e\.data\.entry, \{ isUpdate: true \}\)/, 'update path');
});
