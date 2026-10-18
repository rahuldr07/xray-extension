// shared/worker-client.js and workers/xray-worker.js offload contract.

const assert = require('node:assert/strict');
const test = require('node:test');

const { read } = require('./helpers/source');

test('worker client uses packaged workers on extension surfaces and respects page CSP', () => {
  const workerClient = read('shared/worker-client.js');

  assert.match(workerClient, /new Worker\(workerUrl\)/);
  assert.doesNotMatch(workerClient, /new Blob|importScripts|new Worker\(blobUrl\)/);
  assert.match(workerClient, /worker-origin-unavailable/);
  assert.match(workerClient, /worker-policy-blocked/);
});

test('Table, Schema and Diff have one implementation: the panel node models on every surface (JSON fidelity J11)', () => {
  const worker = read('workers/xray-worker.js');
  const workerClient = read('shared/worker-client.js');
  const detail = read('src/panel/components/detail/RequestDetail.tsx');
  const types = read('src/panel/types.ts');

  // The DevTools worker kept its own copies (first array, depth 10 schema, depth 50 diff, rounded
  // integers past 2^53). They are gone from the worker, the client and the global type.
  for (const name of ['inferSchema', 'detailAnalysis', 'computeDiff', 'gridRows']) {
    assert.doesNotMatch(worker, new RegExp(`function ${name}\\b|case '${name}'`), `worker ${name}`);
    assert.doesNotMatch(workerClient, new RegExp(`async ${name}\\(`), `client ${name}`);
    assert.doesNotMatch(types, new RegExp(`${name}\\(`), `type ${name}`);
  }
  // RequestDetail never asks the worker; it reads the body's nodes through the shared models.
  assert.doesNotMatch(detail, /XRAY_Worker/);
  assert.match(detail, /bodyNode\(body\)/);
  for (const model of ['tableFromNode(node)', 'schemaFromNode(node)', 'diffNodes(previous, current)', 'buildVizSpecFromNode(node)']) {
    assert.ok(detail.includes(model), model);
  }
});

test('captures are not posted to the worker for a token index nothing searched (Task 6 ruling)', () => {
  const content = read('content/content.js');
  const worker = read('workers/xray-worker.js');
  const workerClient = read('shared/worker-client.js');

  assert.doesNotMatch(content, /XRAY_Worker\.addEntry/);
  assert.match(content, /noteWorkerHealth/, 'worker health still reaches the panel');
  for (const name of ['tokenizeEntry', 'extractKeys', 'extractLogKeys', 'searchEntries']) assert.doesNotMatch(worker, new RegExp(`function ${name}\\b`), name);
  assert.doesNotMatch(worker, /case 'search'/);
  assert.doesNotMatch(workerClient, /async search\(/);
});

test('Request Detail Diff states its limits and keeps the baseline jump', () => {
  const detail = read('src/panel/components/detail/RequestDetail.tsx');

  assert.match(detail, /const \{ lines, notices \} = result/);
  assert.match(detail, /notices\.map\(/);
  assert.match(detail, /No structural differences/);
  assert.match(detail, /Jump to baseline/);
});

test('Final fix M7: the global XRAY_Worker type declares no removed operation', () => {
  const types = read('src/panel/types.ts');
  const block = types.slice(types.indexOf('XRAY_Worker?: {'), types.indexOf('};', types.indexOf('XRAY_Worker?: {')));
  for (const name of ['addEntry', 'computeStats', 'exportCSV', 'exportHAR', 'analyze', 'getFromCache']) assert.doesNotMatch(block, new RegExp(`\\b${name}\\(`), name);
});
