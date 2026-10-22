import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { buildSync } from 'esbuild';

// Bundled (Task 8: the bridge draws the page's preview model with models/consoleEager.ts).
const bridgeSource = buildSync({
  entryPoints: ['src/panel/runtime/consoleBridge.ts'], bundle: true, format: 'cjs', platform: 'neutral', target: 'es2022', write: false, logLevel: 'silent',
}).outputFiles[0].text;

function loadBridge(consoleApi) {
  const context = {
    window: consoleApi === undefined ? {} : { XRAY_Console: consoleApi },
    module: { exports: {} },
    exports: {},
    Promise,
  };
  vm.createContext(context);
  vm.runInContext(bridgeSource, context);
  return context.module.exports;
}

test('console execution returns the packaged bridge result unchanged', async () => {
  const bridge = loadBridge({ execute: async (code) => ({ type: 'result', result: code.length }) });
  assert.deepEqual(await bridge.executeConsoleCommand('1 + 1'), { type: 'result', result: 5 });
});

test('missing console bridge returns a structured sanitized error without retrying', async () => {
  const bridge = loadBridge();
  const result = await bridge.executeConsoleCommand('secret command');
  assert.equal(result.type, 'error');
  assert.equal(result.error.code, 'console-bridge-unavailable');
  assert.equal(result.error.message, 'XRAY console is unavailable. Reload the page and try again.');
  assert.equal(Object.prototype.hasOwnProperty.call(result.error, 'stack'), false);
});

test('rejected console execution returns a structured sanitized error without retrying', async () => {
  let calls = 0;
  const bridge = loadBridge({
    execute: async () => {
      calls += 1;
      throw new Error('private response body: should not escape');
    },
  });
  const result = await bridge.executeConsoleCommand('1 + 1');
  assert.equal(calls, 1);
  assert.equal(result.type, 'error');
  assert.equal(result.error.code, 'console-execution-failed');
  assert.equal(result.error.message, 'XRAY console execution failed. Try again.');
  assert.equal(Object.prototype.hasOwnProperty.call(result.error, 'stack'), false);
  assert.equal(JSON.stringify(result).includes('private response body'), false);
});

test('setPromptFocused forwards to the engine and never throws without one', () => {
  const seen = [];
  loadBridge({ setPromptFocused: (focused) => seen.push(focused) }).setPromptFocused(true);
  assert.deepEqual(seen, [true]);
  assert.doesNotThrow(() => loadBridge().setPromptFocused(false));
  assert.doesNotThrow(() => loadBridge({ setPromptFocused() { throw new Error('gone'); } }).setPromptFocused(true));
});

test('completeMembers forwards to the engine and keeps only well-formed names for its own request (Task 7)', async () => {
  const seen = [];
  const bridge = loadBridge({ complete: async (expr, id, attach) => {
    seen.push([expr, id, attach]);
    return { requestId: id, attached: true, type: 'string', names: [{ name: 'user', kind: 'property', own: true }, { name: 'bad', kind: 'weird', own: true }, null], declared: [{ name: 'rows', kind: 'const' }, { name: 1 }] };
  } });
  const out = JSON.parse(JSON.stringify(await bridge.completeMembers('appState', 3, { attach: true })));
  assert.deepEqual(seen, [['appState', 3, true]]);
  assert.deepEqual(out, { requestId: 3, names: [{ name: 'user', kind: 'property', own: true }], attached: true, type: 'string', declared: [{ name: 'rows', kind: 'const' }] });
  assert.equal(await loadBridge({ complete: async () => ({ requestId: 9, names: [] }) }).completeMembers(null, 4), null, 'another request\'s answer');
  assert.equal(await loadBridge({ complete: async () => { throw new Error('gone'); } }).completeMembers(null, 1), null);
  assert.equal(await loadBridge().completeMembers(null, 1), null, 'no engine');
  assert.equal((await loadBridge({ complete: async (e, id) => ({ requestId: id, names: null }) }).completeMembers(null, 2)).names, null);
});

test('completeMembers forwards `capped` (the list was cut: the panel keeps the globals unknown)', async () => {
  const out = await loadBridge({ complete: async (e, id) => ({ requestId: id, names: [], attached: true, capped: true }) }).completeMembers(null, 1);
  assert.equal(out.capped, true);
});

test('previewCommand forwards to the engine and turns the page model into one line, for its own request only (Task 8)', async () => {
  const seen = [];
  const reader = () => null;
  const bridge = loadBridge({ preview: async (code, id, attach, options) => {
    seen.push([code, id, attach, typeof options?.readBody]);
    return { requestId: id, attached: true, value: '{"$xray":"array","length":3,"items":[1,2,3]}' };
  } });
  const out = JSON.parse(JSON.stringify(await bridge.previewCommand('res.users.map(u => u.id)', 5, { attach: true, readBody: reader })));
  assert.deepEqual(seen, [['res.users.map(u => u.id)', 5, true, 'function']]);
  assert.deepEqual(out, { requestId: 5, attached: true, text: 'Array(3) [1, 2, 3]' });
  const thrown = await loadBridge({ preview: async (c, id) => ({ requestId: id, attached: true, thrown: '{"$xray":"error","name":"TypeError","message":"x"}' }) }).previewCommand('null.x', 1);
  assert.equal(thrown.text, null);
  assert.equal(thrown.error, 'Uncaught TypeError: x');
  assert.equal((await loadBridge({ preview: async (c, id) => ({ requestId: id, attached: false }) }).previewCommand('1+1', 2)).text, null, 'nothing to show');
  assert.equal(await loadBridge({ preview: async () => ({ requestId: 9, value: '1' }) }).previewCommand('1', 4), null, 'another request\'s answer');
  assert.equal(await loadBridge({ preview: async () => { throw new Error('gone'); } }).previewCommand('1', 1), null);
  assert.equal(await loadBridge().previewCommand('1', 1), null, 'no engine');
});
