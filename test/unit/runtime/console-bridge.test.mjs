import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { transformSync } from 'esbuild';

import { readSource } from './vm-load.mjs';

const bridgeSource = transformSync(readSource('src/panel/runtime/consoleBridge.ts'), {
  loader: 'ts', format: 'cjs', target: 'es2022',
}).code;

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
