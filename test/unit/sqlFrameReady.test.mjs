/* Behavioural tests for src/panel/models/sqlFrameReady.ts: when the HUD's inline SQL frame counts as
   loaded, when it gives up and falls back to the "Open SQL client" card, and when sql.html agrees to
   run inside a web page at all. */
import test from 'node:test';
import assert from 'node:assert/strict';
import './harness.mjs';

const {
  SQL_FRAME_READY_MESSAGE,
  SQL_FRAME_READY_TIMEOUT_MS,
  isSqlFrameReadyMessage,
  nextSqlFrameReadiness,
  sqlClientAllowedIn,
  databasesAllowedIn,
} = await import('../../src/panel/models/sqlFrameReady.ts');

const ready = { type: 'xray:sql-frame-ready' };
const message = (data) => ({ kind: 'message', data });

test('the ready signal and the timeout are the agreed values', () => {
  assert.equal(SQL_FRAME_READY_MESSAGE, 'xray:sql-frame-ready');
  assert.equal(SQL_FRAME_READY_TIMEOUT_MS, 4000);
});

// The signal arrives through chrome.runtime (the service worker relays it from sql.html after checking
// the sender), never through the page's window, so only its shape is checked here.
test('only the ready type counts', () => {
  assert.equal(isSqlFrameReadyMessage(ready), true);
  assert.equal(isSqlFrameReadyMessage({ type: 'xray:sql-ready' }), false, 'the old window message is not it');
  assert.equal(isSqlFrameReadyMessage({ type: 'XRAY_OPEN_SQL_WINDOW' }), false);
  assert.equal(isSqlFrameReadyMessage('xray:sql-frame-ready'), false, 'a bare string is not the message');
  assert.equal(isSqlFrameReadyMessage(null), false);
  assert.equal(isSqlFrameReadyMessage(undefined), false);
});

test('waiting becomes ready on the ready message and ignores others', () => {
  assert.equal(nextSqlFrameReadiness('waiting', message(ready)), 'ready');
  assert.equal(nextSqlFrameReadiness('waiting', message({ type: 'nope' })), 'waiting');
});

test('waiting times out into the fallback', () => {
  assert.equal(nextSqlFrameReadiness('waiting', { kind: 'timeout' }), 'timed-out');
});

test('both outcomes are final', () => {
  assert.equal(nextSqlFrameReadiness('ready', { kind: 'timeout' }), 'ready', 'a late timer never removes a loaded client');
  assert.equal(nextSqlFrameReadiness('timed-out', message(ready)), 'timed-out', 'a late ready never swaps the card back');
});

test('sql.html runs inside a web page only with the inline option on', () => {
  assert.equal(sqlClientAllowedIn([], false), true, 'its own window: not framed');
  assert.equal(sqlClientAllowedIn(['chrome-extension://abc'], false), true, 'the pop-out frames it');
  assert.equal(sqlClientAllowedIn(['chrome-extension://abc', 'devtools://devtools'], false), true, 'the DevTools panel');
  assert.equal(sqlClientAllowedIn(['devtools://devtools'], false), true);
  assert.equal(sqlClientAllowedIn(['https://example.com'], false), false, 'a web page with the option off');
  assert.equal(sqlClientAllowedIn(['http://127.0.0.1:8080'], false), false);
  assert.equal(sqlClientAllowedIn(['https://example.com'], true), true, 'the inline HUD with the option on');
  assert.equal(sqlClientAllowedIn(['chrome-extension://abc', 'https://evil.test'], false), false, 'a web page anywhere up the chain');
  assert.equal(sqlClientAllowedIn(['null'], false), false, 'an opaque origin is not an extension');
});

test('saved database connections show only on extension pages (final review I6)', () => {
  assert.equal(databasesAllowedIn([]), true, 'its own window');
  assert.equal(databasesAllowedIn(['chrome-extension://abc']), true, 'the pop-out');
  assert.equal(databasesAllowedIn(['chrome-extension://abc', 'devtools://devtools']), true, 'the DevTools panel');
  assert.equal(databasesAllowedIn(['https://shop.example']), false, 'the inline HUD inside a web page');
  assert.equal(databasesAllowedIn(['chrome-extension://abc', 'https://shop.example']), false, 'a web origin anywhere up the chain');
});

test('with both HUD options on, saved connections show inside a web page too (Ruling M3-R27)', () => {
  assert.equal(databasesAllowedIn(['https://shop.example'], true), true);
  assert.equal(databasesAllowedIn(['https://shop.example'], false), false);
  assert.equal(databasesAllowedIn([], false), true);
});
