/* Behavioural tests for src/panel/models/sqlFrameReady.ts: when the HUD's inline SQL frame counts as
   loaded, and when it gives up and falls back to the "Open SQL client" card. */
import test from 'node:test';
import assert from 'node:assert/strict';
import './harness.mjs';

const {
  SQL_FRAME_READY_MESSAGE,
  SQL_FRAME_READY_TIMEOUT_MS,
  isSqlFrameReadyMessage,
  nextSqlFrameReadiness,
} = await import('../../src/panel/models/sqlFrameReady.ts');

const frame = { name: 'the frame window' };
const other = { name: 'some other window' };
const ready = { type: 'xray:sql-ready' };
const message = (source, data, frameWindow = frame) => ({ kind: 'message', source, data, frameWindow });

test('the ready signal and the timeout are the agreed values', () => {
  assert.equal(SQL_FRAME_READY_MESSAGE, 'xray:sql-ready');
  assert.equal(SQL_FRAME_READY_TIMEOUT_MS, 4000);
});

test('only the ready type from the frame itself counts', () => {
  assert.equal(isSqlFrameReadyMessage(frame, ready, frame), true);
  assert.equal(isSqlFrameReadyMessage(other, ready, frame), false, 'another window (the page) cannot mark it ready');
  assert.equal(isSqlFrameReadyMessage(frame, { type: 'xray:sql-other' }, frame), false);
  assert.equal(isSqlFrameReadyMessage(frame, 'xray:sql-ready', frame), false, 'a bare string is not the message');
  assert.equal(isSqlFrameReadyMessage(frame, null, frame), false);
  assert.equal(isSqlFrameReadyMessage(frame, undefined, frame), false);
  assert.equal(isSqlFrameReadyMessage(null, ready, null), false, 'no frame window yet: nothing matches, null included');
  assert.equal(isSqlFrameReadyMessage(undefined, ready, undefined), false);
});

test('waiting becomes ready on the frame\'s message', () => {
  assert.equal(nextSqlFrameReadiness('waiting', message(frame, ready)), 'ready');
});

test('waiting ignores messages that are not the frame\'s ready signal', () => {
  assert.equal(nextSqlFrameReadiness('waiting', message(other, ready)), 'waiting');
  assert.equal(nextSqlFrameReadiness('waiting', message(frame, { type: 'nope' })), 'waiting');
});

test('waiting times out into the fallback', () => {
  assert.equal(nextSqlFrameReadiness('waiting', { kind: 'timeout' }), 'timed-out');
});

test('both outcomes are final', () => {
  assert.equal(nextSqlFrameReadiness('ready', { kind: 'timeout' }), 'ready', 'a late timer never removes a loaded client');
  assert.equal(nextSqlFrameReadiness('timed-out', message(frame, ready)), 'timed-out', 'a late ready never swaps the card back');
});
