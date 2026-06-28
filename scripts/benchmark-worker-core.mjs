#!/usr/bin/env node
import { performance } from 'node:perf_hooks';

const rows = Number(process.argv[2] || 10000);
const width = Number(process.argv[3] || 24);
const mutateEvery = Number(process.argv[4] || 17);

function makePayload(count, fieldCount, variant = 0) {
  return Array.from({ length: count }, (_, index) => {
    const item = {
      id: `item_${index}`,
      status: index % 11 === 0 ? 'error' : 'ok',
      amount: index * 1.37,
      nested: {
        owner: `owner_${index % 97}`,
        flags: [index % 2 === 0, index % 3 === 0, index % 5 === 0],
        meta: { region: `r${index % 8}`, bucket: Math.floor(index / 100) },
      },
    };
    for (let field = 0; field < fieldCount; field++) {
      item[`field_${field}`] = variant && index % mutateEvery === 0 && field % 5 === 0
        ? `mutated_${variant}_${index}_${field}`
        : `value_${index}_${field}`;
    }
    return item;
  });
}

function inferSchema(value, depth = 0, maxDepth = 10) {
  if (depth > maxDepth) return '[Max depth]';
  if (value === null) return 'null';
  if (Array.isArray(value)) return value.length ? [inferSchema(value[0], depth + 1, maxDepth)] : 'array';
  if (value && typeof value === 'object') {
    const out = {};
    const keys = Object.keys(value).slice(0, 200);
    for (const key of keys) out[key] = inferSchema(value[key], depth + 1, maxDepth);
    if (Object.keys(value).length > keys.length) out['...'] = `+${Object.keys(value).length - keys.length} more keys`;
    return out;
  }
  return typeof value;
}

function computeDiff(a, b, path = '') {
  const diffs = [];
  function diff(valA, valB, p) {
    if (diffs.length >= 500) return;
    const typeA = valA === null ? 'null' : Array.isArray(valA) ? 'array' : typeof valA;
    const typeB = valB === null ? 'null' : Array.isArray(valB) ? 'array' : typeof valB;
    if (typeA !== typeB) { diffs.push({ type: 'changed', path: p, from: valA, to: valB }); return; }
    if (typeA !== 'object' && typeA !== 'array') {
      if (valA !== valB) diffs.push({ type: 'changed', path: p, from: valA, to: valB });
      return;
    }
    if (typeA === 'array') {
      const maxLen = Math.max(valA.length, valB.length);
      for (let i = 0; i < maxLen && diffs.length < 500; i++) {
        const childPath = `${p}[${i}]`;
        if (i >= valA.length) diffs.push({ type: 'added', path: childPath, value: valB[i] });
        else if (i >= valB.length) diffs.push({ type: 'removed', path: childPath, value: valA[i] });
        else diff(valA[i], valB[i], childPath);
      }
      return;
    }
    const keysA = new Set(Object.keys(valA));
    const keysB = new Set(Object.keys(valB));
    for (const key of keysA) {
      if (diffs.length >= 500) break;
      const childPath = p ? `${p}.${key}` : key;
      if (!keysB.has(key)) diffs.push({ type: 'removed', path: childPath, value: valA[key] });
      else diff(valA[key], valB[key], childPath);
    }
    for (const key of keysB) {
      if (diffs.length >= 500) break;
      if (!keysA.has(key)) diffs.push({ type: 'added', path: p ? `${p}.${key}` : key, value: valB[key] });
    }
  }
  diff(a, b, path);
  return diffs;
}

function gridRows(value) {
  const objects = (Array.isArray(value) ? value : []).filter((row) => row && typeof row === 'object' && !Array.isArray(row)).slice(0, 200);
  const columns = Array.from(objects.reduce((set, row) => {
    Object.keys(row).slice(0, 20).forEach((key) => set.add(key));
    return set;
  }, new Set()));
  return { objects, columns };
}

function computeStats(obj, maxDepth = 10) {
  let keyCount = 0, arrayCount = 0, stringLength = 0, maxStringLen = 0, depth = 0;
  function walk(val, d) {
    if (d > maxDepth) return;
    depth = Math.max(depth, d);
    if (val === null || val === undefined || typeof val !== 'object') {
      if (typeof val === 'string') { stringLength += val.length; maxStringLen = Math.max(maxStringLen, val.length); }
      return;
    }
    if (Array.isArray(val)) { arrayCount++; for (let i = 0; i < val.length && i < 1000; i++) walk(val[i], d + 1); return; }
    const keys = Object.keys(val); keyCount += keys.length;
    for (let i = 0; i < keys.length && i < 100; i++) walk(val[keys[i]], d + 1);
  }
  walk(obj, 0);
  return { keyCount, arrayCount, stringLength, maxStringLen, depth };
}

function time(label, fn) {
  const start = performance.now();
  const result = fn();
  const ms = performance.now() - start;
  return { label, ms: Math.round(ms * 100) / 100, result };
}

const current = makePayload(rows, width, 0);
const previous = makePayload(rows, width, 1);
const bytes = Buffer.byteLength(JSON.stringify(current));
const results = [
  time('inferSchema', () => inferSchema(current)),
  time('computeDiff capped500', () => computeDiff(previous, current)),
  time('gridRows', () => gridRows(current)),
  time('computeStats bounded', () => computeStats(current)),
];

const summary = {
  rows,
  width,
  approxJsonBytes: bytes,
  approxJsonMB: Math.round((bytes / 1024 / 1024) * 100) / 100,
  timings: results.map(({ label, ms, result }) => ({
    label,
    ms,
    resultSize: Array.isArray(result) ? result.length : result && typeof result === 'object' ? Object.keys(result).length : 0,
  })),
  recommendation: results.some((r) => r.ms > 50)
    ? 'Keep these operations off-main-thread. Consider Rust WASM only for operations still above 50ms inside worker after real-page benchmarks.'
    : 'JS worker is currently fast enough for these bounded algorithms. Rust WASM is not justified yet.',
};

console.log(JSON.stringify(summary, null, 2));
