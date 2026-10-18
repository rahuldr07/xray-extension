/* The panel's mirror of what the evaluation engine sees (panel/console.js
   _contextPayload): "Diff with previous call" (P8) is offered only when the
   runtime's `prev` resolves. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import './harness.mjs';

const { CONSOLE_CONTEXT_ENTRIES, CONSOLE_SAME_ENDPOINT_FULL, previousCallAvailable } =
  await import('../../src/panel/models/consoleContext.ts');

const api = (id, path = '/users', extra = {}) => ({ id, type: 'api', url: 'https://x.test' + path, urlPath: path, responseRaw: '{"ok":1}', ...extra });
const others = (n, from = 0) => Array.from({ length: n }, (_, i) => api('o' + (from + i), '/other' + (from + i)));

test('constants match panel/console.js (single source of truth is the engine)', () => {
  const engine = readFileSync(new URL('../../panel/console.js', import.meta.url), 'utf8');
  assert.equal(Number(engine.match(/const MAX_CONTEXT_ENTRIES = (\d+);/)[1]), CONSOLE_CONTEXT_ENTRIES);
  assert.equal(Number(engine.match(/const MAX_SAME_ENDPOINT_FULL = (\d+);/)[1]), CONSOLE_SAME_ENDPOINT_FULL);
});

test('a previous same-endpoint call inside the window counts', () => {
  const entries = [api('prev'), ...others(50), api('cur')];
  assert.equal(previousCallAvailable(entries, 'cur'), true);
  assert.equal(previousCallAvailable(entries, 'prev'), false, 'nothing before the first call');
  assert.equal(previousCallAvailable(entries, null), false);
  assert.equal(previousCallAvailable([api('a', '/a'), api('cur')], 'cur'), false, 'other endpoints do not count');
});

test(`a previous call older than the ${CONSOLE_CONTEXT_ENTRIES}-entry window does not count`, () => {
  const entries = [api('prev'), ...others(CONSOLE_CONTEXT_ENTRIES), api('cur')];
  assert.ok(entries.length > CONSOLE_CONTEXT_ENTRIES);
  assert.equal(previousCallAvailable(entries, 'cur'), false);
  // Exactly at the window's edge it is still sent.
  const edge = [api('prev'), ...others(CONSOLE_CONTEXT_ENTRIES - 2), api('cur')];
  assert.equal(edge.length, CONSOLE_CONTEXT_ENTRIES);
  assert.equal(previousCallAvailable(edge, 'cur'), true);
});

test('a selected entry outside the window is appended; its previous is the newest same-endpoint call', () => {
  // The engine appends the current entry after the window, so siblingEntry(-1)
  // finds the newest same-endpoint entry in the window.
  const entries = [api('cur'), ...others(CONSOLE_CONTEXT_ENTRIES), api('later')];
  assert.equal(previousCallAvailable(entries, 'cur'), true);
  assert.equal(previousCallAvailable([api('cur'), ...others(CONSOLE_CONTEXT_ENTRIES + 5)], 'cur'), false);
});

test('a previous call whose body was slimmed away does not count', () => {
  // Selecting an older call with more than MAX_SAME_ENDPOINT_FULL newer ones: its
  // previous call travels without a body.
  const newer = Array.from({ length: CONSOLE_SAME_ENDPOINT_FULL }, (_, i) => api('n' + i));
  assert.equal(previousCallAvailable([api('prev'), api('cur'), ...newer], 'cur'), false);
  assert.equal(previousCallAvailable([api('prev'), api('cur'), ...newer.slice(2)], 'cur'), true, 'prev, cur and 8 newer: prev is among the newest 10');
  assert.equal(previousCallAvailable([api('prev', '/users', { responseRaw: '' }), api('cur')], 'cur'), false, 'no body, no prev');
});
