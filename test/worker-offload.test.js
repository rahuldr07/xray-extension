// shared/worker-client.js and workers/xray-worker.js offload contract.

const assert = require('node:assert/strict');
const test = require('node:test');

const { read } = require('./helpers/source');

test('worker client falls back to a blob wrapper when extension worker URL is blocked', () => {
  const workerClient = read('shared/worker-client.js');

  assert.match(workerClient, /function _createWorker\(workerUrl\)/);
  assert.match(workerClient, /new Worker\(workerUrl\)/);
  assert.match(workerClient, /new Blob/);
  assert.match(workerClient, /importScripts/);
  assert.match(workerClient, /new Worker\(blobUrl\)/);
});

test('worker core owns expensive schema, diff, grid, and detail analysis operations', () => {
  const worker = read('workers/xray-worker.js');
  const workerClient = read('shared/worker-client.js');
  const detail = read('src/panel/components/detail/RequestDetail.tsx');
  const types = read('src/panel/types.ts');

  assert.match(worker, /function inferSchema/);
  assert.match(worker, /function detailAnalysis/);
  assert.match(worker, /structuralDiff:\s*computeDiff\(previous, current\)\.slice\(0, 500\)/);
  assert.match(worker, /engine:\s*'worker-js'/);
  assert.match(worker, /case 'inferSchema'/);
  assert.match(worker, /case 'detailAnalysis'/);

  assert.match(workerClient, /async inferSchema\(data\)/);
  assert.match(workerClient, /async detailAnalysis\(current, previous = null\)/);
  assert.match(types, /detailAnalysis\(current: unknown, previous\?: unknown\): Promise<unknown>/);

  assert.match(detail, /window\.XRAY_Worker\.detailAnalysis\(activeValue, previousValue\)/);
  assert.match(detail, /workerSchema \?\? schema\(value\)/);
  assert.match(detail, /workerGrid\?: ReturnType<typeof gridRows>/);
  // the structural diff renders added/removed/changed paths with a baseline jump
  assert.match(detail, /structuralDiff/);
  assert.match(detail, /Jump to baseline/);
});
