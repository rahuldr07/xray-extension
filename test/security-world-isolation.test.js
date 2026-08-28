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
  assert.match(content, /XRAY_Panel\?\.update\?\.\(e\.data\.entry\)/);
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
  assert.match(interceptor, /_secretStore\.set\(id, \{ origin: _originOf\(url\), values: secret \}\)/);
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
  assert.match(interceptor, /const sameOrigin = !!record && !!record\.origin && record\.origin === _originOf\(url\);/);
  assert.match(interceptor, /const secrets = sameOrigin \? record\.values : \{\};/);
  assert.match(interceptor, /function _originOf\(url\)/);
  // the raw map value is never spread into the outgoing headers unguarded
  assert.doesNotMatch(interceptor, /const secrets = replayOf \? \(_secretStore\.get\(replayOf\) \|\| \{\}\) : \{\};/);
});
