#!/usr/bin/env node
// Baseline only: calls production models and worker functions; never changes them.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { apiEntry, entries, exportModel, globalSearch, listOptions } from '../test/unit/harness.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const samples = 5;
const warmups = 1;
const budgetMs = 60_000;
const started = performance.now();
const measurements = [];
const fixtures = [];
const workerPath = path.join(root, 'workers/xray-worker.js');
const worker = vm.createContext({
  self: { postMessage() {}, location: { protocol: 'https:' } },
  console, performance, URL, setTimeout, clearTimeout, structuredClone,
});
vm.runInContext(fs.readFileSync(workerPath, 'utf8'), worker, { filename: workerPath });

function timed(fn, validate) {
  assert.ok(performance.now() - started < budgetMs, '60-second benchmark budget exceeded');
  const start = performance.now();
  const result = fn();
  const elapsed = performance.now() - start;
  validate(result); // Functional guards are intentionally outside the timed interval.
  return elapsed;
}

function measure(workload, operation, fn, validate) {
  const firstCallMs = timed(fn, validate);
  for (let i = 0; i < warmups; i += 1) timed(fn, validate);
  const samplesMs = Array.from({ length: samples }, () => timed(fn, validate));
  const ordered = [...samplesMs].sort((a, b) => a - b);
  measurements.push({
    workload, operation, firstCallMs, samplesMs,
    medianMs: ordered[Math.floor(ordered.length / 2)],
    minMs: ordered[0], maxMs: ordered.at(-1),
  });
}

for (const count of [1000, 5000]) {
  const capture = Array.from({ length: count }, (_, index) => apiEntry({
    id: `phase0-${count}-${index}`,
    timestamp: 1_700_000_000_000 + index,
    url: `https://api.example.test/widgets/${index % 100}`,
    urlPath: `/widgets/${index % 100}`,
    method: index % 5 === 0 ? 'POST' : 'GET',
    source: index % 2 ? 'xhr' : 'fetch',
    status: index % 10 === 0 ? 500 : 200,
    duration: 50 + index % 900,
    responseRaw: JSON.stringify({ id: index, label: `Widget ${index}`, items: [1, 2, 3] }),
  }));
  const workload = `${count} API entries`;
  fixtures.push({ workload, jsonBytes: Buffer.byteLength(JSON.stringify(capture)) });
  measure(workload, 'flat request list',
    () => entries.buildEntryListItems(listOptions({ entries: capture, apiGroupingMode: 'flat' })),
    result => assert.equal(result.length, count));
  measure(workload, 'global search / no match / full scan',
    () => globalSearch.searchEntries(capture, 'absent-phase0-needle'),
    result => { assert.equal(result.matches.length, 0); assert.equal(result.error, null); });
  measure(workload, 'session JSON serialization',
    () => exportModel.exportText(null, capture, 'session-json'),
    result => assert.equal(JSON.parse(result).entries.length, count));
}

const payload = Array.from({ length: 10_000 }, (_, index) => ({
  id: index,
  nested: { region: `region-${index % 8}`, flags: [true, false] },
  ...Object.fromEntries(Array.from({ length: 24 }, (_, field) => [`field_${field}`, `value_${index}_${field}`])),
}));
const previous = payload.map((row, index) => index % 17 === 0 ? { ...row, field_0: 'previous' } : row);
const workload = '10000 rows / 24 generated fields + id and nested';
fixtures.push({ workload, jsonBytes: Buffer.byteLength(JSON.stringify(payload)) });
measure(workload, 'worker inferSchema', () => worker.inferSchema(payload),
  result => assert.equal(result[0].id, 'number'));
measure(workload, 'worker computeDiff / full traversal', () => worker.computeDiff(previous, payload),
  result => assert.equal(result.length, Math.ceil(payload.length / 17)));
measure(workload, 'worker gridRows / capped', () => worker.gridRows(payload),
  result => assert.equal(result.objects.length, 200));
measure(workload, 'worker computeStats / bounded', () => worker.computeStats(payload),
  result => assert.ok(result.keyCount > 0));
measure(workload, 'worker detailAnalysis', () => worker.detailAnalysis(payload, previous),
  result => {
    assert.equal(result.engine, 'worker-js');
    assert.equal(result.grid.objects.length, 200);
    assert.equal(result.diff.structuralDiff.length, 500);
  });

const sourcePaths = [
  'workers/xray-worker.js', 'src/panel/models/entries.ts', 'src/panel/models/globalSearch.ts',
  'src/panel/models/export.ts', 'src/panel/utils.ts', 'test/unit/harness.mjs',
  'package.json', 'package-lock.json', 'scripts/benchmark-phase0.mjs',
];
const report = {
  recordedAt: new Date().toISOString(),
  head: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  baseline: 'HEAD plus pre-existing uncommitted fixes; see docs/phase-0-baseline.md',
  environment: { node: process.version, platform: process.platform, arch: process.arch, cpu: os.cpus()[0].model },
  method: {
    samples, warmups, budgetMs,
    clock: 'performance.now(), milliseconds; fixture setup and output validation excluded',
    firstCall: 'first call for this fixture, not a cold process; shared JIT state may already be warm',
    warmSamples: 'same immutable fixture and process; memoization/JIT may remain warm; no forced GC',
    worker: 'actual worker code in a Node VM; excludes browser IPC, structured-clone, storage and rendering',
    panel: 'actual model code through the unit harness; XRAY_ConsoleHelpers is absent (local fallback)',
  },
  sourceSha256: Object.fromEntries(sourcePaths.map(file => [file,
    createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex')])),
  fixtures,
  measurements,
};

// The optional destination is restricted to ignored local output, never source.
if (process.argv[2]) {
  const destination = path.resolve(root, process.argv[2]);
  assert.ok(destination.startsWith(path.join(root, 'output') + path.sep), 'destination must be under output/');
  assert.ok(fs.existsSync(path.dirname(destination)), 'create the destination directory first');
  fs.writeFileSync(destination, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
}
console.log(JSON.stringify(report, null, 2));
