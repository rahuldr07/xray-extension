// Task 7 fix round 2: what the panel knows about the page globals (src/panel/runtime/liveCompletion.ts).
import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { buildSync } from 'esbuild';

const bundle = buildSync({ entryPoints: ['src/panel/runtime/liveCompletion.ts'], bundle: true, format: 'cjs', platform: 'neutral', write: false, logLevel: 'silent' }).outputFiles[0].text;

function load(answers) {
  const context = { module: { exports: {} }, exports: {}, Promise, Date, window: { XRAY_Console: { complete: async (expr, requestId) => ({ requestId, ...answers.shift() }) } } };
  vm.createContext(context);
  vm.runInContext(bundle, context);
  return context.module.exports;
}

const names = [{ name: 'appState', kind: 'property', own: true }];

test('liveGlobalsKnown: a fresh, whole answer is known; a Run since, a cut list or an old answer is not', async () => {
  const live = load([{ names, attached: true, age: 0 }, { names, attached: true, capped: true }, { names, attached: true, age: 4900 }]);
  assert.equal(live.liveGlobalsKnown(), false, 'nothing asked yet');
  await live.requestLive(null, false);
  assert.equal(live.liveGlobalsKnown(), true);
  live.markLiveStale();
  assert.equal(live.liveGlobalsKnown(), false, 'a Run since');
  assert.equal(JSON.stringify(live.knownPageNames()), '["appState"]', 'still offered to did-you-mean');
  await live.requestLive(null, false);
  assert.equal(live.liveGlobalsKnown(), false, 'capped');
  await live.requestLive(null, false);
  assert.equal(live.liveGlobalsKnown(), true);
  assert.equal(live.liveGlobalsKnown(Date.now() + 200), false, 'freshness counts from the worker\'s read (age 4,900 ms)');
});
