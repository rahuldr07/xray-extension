// workers/xray-worker.js — executed in a vm realm with a stubbed worker global.
//
// The worker is a `script`-sourceType file that declares its helpers as
// top-level function declarations, so every one of them lands on the context's
// global object and can be called directly. `self.postMessage` has to exist
// before the file finishes loading (its last statement posts a ready message)
// and `indexedDB` has to exist for openDB(); see test/unit/runtime/vm-load.mjs.

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import test from 'node:test';

import { dispatch, hostify, loadIsolatedWorld, loadWorker, repoRoot } from './vm-load.mjs';

const W = loadWorker();

// ───────────────────────────────────────────────────────────── module load

test('worker: posts a ready handshake and installs an onmessage handler at load', () => {
  const fresh = loadWorker();
  assert.equal(typeof fresh.self.onmessage, 'function');
  assert.deepEqual(hostify(fresh.posted), [
    { id: '__ready__', success: true, result: { worker: 'xray-worker', version: '1.0.0' } },
  ]);
  // Loading must not touch IndexedDB — that is deferred to the 'init' action.
  assert.deepEqual(fresh.idbOpenCalls, []);
});

// ───────────────────────────────────────────────────────────── tokenizeEntry

test('tokenizeEntry: api entries yield lowercased url, path segments, method, status and keys', () => {
  const tokens = W.tokenizeEntry({
    type: 'api',
    url: 'https://API.test/V1/Users?x=1',
    method: 'Get',
    status: 200,
    responseDecrypted: { Data: { Inner: { TooDeep: 1 } } },
    requestBody: { Q: 1 },
  });
  assert.deepEqual(hostify(tokens), [
    'https://api.test/v1/users?x=1', 'v1', 'users', 'get', '200', 'data', 'inner', 'q',
  ]);
  assert.ok(!tokens.includes('toodeep'), 'extractKeys stops at depth 2');
});

test('tokenizeEntry: falsy status and method contribute nothing', () => {
  // A request that never completed has status 0; `if (entry.status)` drops it,
  // so "0" is not searchable. Same for an empty method.
  assert.deepEqual(hostify(W.tokenizeEntry({ type: 'api', status: 0, method: '' })), []);
  assert.deepEqual(hostify(W.tokenizeEntry({ type: 'api', status: 204 })), ['204']);
});

test('tokenizeEntry: an unparseable url still contributes its raw lowercased form', () => {
  assert.deepEqual(hostify(W.tokenizeEntry({ type: 'api', url: 'NOT a url' })), ['not a url']);
});

test('tokenizeEntry: log entries index the level plus words longer than two chars', () => {
  const tokens = W.tokenizeEntry({ type: 'log', logLevel: 'warn', logData: 'Hello Big to World' });
  assert.deepEqual(hostify(tokens), ['warn', 'hello', 'big', 'world']);
  assert.ok(!tokens.includes('to'), 'two-character words are filtered out');
});

test('tokenizeEntry: entry types other than api/log are not indexed at all', () => {
  // WebSocket and GraphQL frames are captured by content/interceptor.js but
  // tokenize to nothing here, so they can never match a search query.
  assert.deepEqual(hostify(W.tokenizeEntry({ type: 'ws', url: 'wss://a.test/socket' })), []);
  assert.deepEqual(hostify(W.tokenizeEntry({ type: 'graphql', url: 'https://a.test/gql' })), []);
});

test('tokenizeEntry: extractKeys caps at 50 keys per object level', () => {
  const wide = {};
  for (let i = 0; i < 60; i++) wide[`k${i}`] = i;
  const tokens = W.tokenizeEntry({ type: 'api', responseDecrypted: wide });
  assert.ok(tokens.includes('k49'));
  assert.ok(!tokens.includes('k50'), 'keys past the 50th are dropped from the index');
});

// ───────────────────────────────────────────────────────────── searchEntries

const searchFixture = [
  { type: 'api', url: 'https://a.test/users', method: 'GET', status: 200 },
  { type: 'api', url: 'https://a.test/orders', method: 'POST', status: 500 },
];

test('searchEntries: blank queries return the input array untouched', () => {
  assert.equal(W.searchEntries('', searchFixture), searchFixture);
  assert.equal(W.searchEntries('   ', searchFixture), searchFixture);
  assert.equal(W.searchEntries(null, searchFixture), searchFixture);
});

test('searchEntries: case-insensitive substring match, AND across whitespace-split terms', () => {
  assert.equal(W.searchEntries('users', searchFixture).length, 1);
  assert.equal(W.searchEntries('USERS', searchFixture).length, 1);
  assert.equal(W.searchEntries('user', searchFixture).length, 1, 'terms match as substrings of a token');
  assert.equal(W.searchEntries('users get', searchFixture).length, 1, 'every term must match');
  assert.equal(W.searchEntries('users post', searchFixture).length, 0);
  assert.equal(W.searchEntries('500', searchFixture).length, 1);
});

test('searchEntries: a precomputed _searchTokens cache wins over the live entry', () => {
  // addEntry stamps _searchTokens once; searchEntries never revalidates it, so a
  // stale cache silently decides the result. This pins that behaviour.
  const stale = [{ type: 'api', url: 'https://a.test/current', _searchTokens: ['legacy-token'] }];
  assert.equal(W.searchEntries('legacy', stale).length, 1);
  assert.equal(W.searchEntries('current', stale).length, 0, 'the live url is not consulted');
});

// ───────────────────────────────────────────────────────────── computeStats

test('computeStats: counts keys, arrays, string bytes and observed depth', () => {
  assert.deepEqual(hostify(W.computeStats({ a: 'xx', b: [1, 2, 3] })), {
    keyCount: 2, arrayCount: 1, stringLength: 2, maxStringLen: 2, depth: 2,
  });
  assert.deepEqual(hostify(W.computeStats('bare string')), {
    keyCount: 0, arrayCount: 0, stringLength: 11, maxStringLen: 11, depth: 0,
  });
  assert.deepEqual(hostify(W.computeStats(null)), {
    keyCount: 0, arrayCount: 0, stringLength: 0, maxStringLen: 0, depth: 0,
  });
});

test('computeStats: depth is capped, and wide containers are sampled not counted', () => {
  let deep = 'leaf';
  for (let i = 0; i < 30; i++) deep = { nested: deep };
  assert.equal(W.computeStats(deep).depth, 10, 'the walk refuses to descend past maxDepth (10)');
  assert.equal(W.computeStats(deep, 3).depth, 3, 'maxDepth is configurable');

  const wide = {};
  for (let i = 0; i < 150; i++) wide[`k${i}`] = 'v';
  const stats = W.computeStats(wide);
  assert.equal(stats.keyCount, 150, 'keyCount sees every key');
  assert.equal(stats.stringLength, 100, 'but only the first 100 values are walked');
});

test('computeStats: a cyclic object terminates because of the depth cap', () => {
  // This is the contrast case for the two functions below: computeStats has a
  // depth guard, so postMessage-delivered cycles are contained here.
  const cyclic = { a: 1 };
  cyclic.self = cyclic;
  const stats = W.computeStats(cyclic);
  assert.equal(stats.depth, 10);
  assert.equal(stats.keyCount, 22, '2 keys at each of the 11 visited levels');
});

// ───────────────────────────────────────────────────────────── computeDiff

test('computeDiff: reports changed / added / removed with dotted paths', () => {
  const diffs = W.computeDiff({ a: 1, b: 2, gone: true }, { a: 1, b: 3, fresh: 'x' });
  assert.deepEqual(hostify(diffs), [
    { type: 'changed', path: 'b', from: 2, to: 3 },
    { type: 'removed', path: 'gone', value: true },
    { type: 'added', path: 'fresh', value: 'x' },
  ]);
});

test('computeDiff: nested paths, array indices and length changes', () => {
  assert.deepEqual(hostify(W.computeDiff({ u: { name: 'a' } }, { u: { name: 'b' } })), [
    { type: 'changed', path: 'u.name', from: 'a', to: 'b' },
  ]);
  assert.deepEqual(hostify(W.computeDiff([1, 2], [1, 9, 3])), [
    { type: 'changed', path: '[1]', from: 2, to: 9 },
    { type: 'added', path: '[2]', value: 3 },
  ]);
  assert.deepEqual(hostify(W.computeDiff([1, 2], [1])), [
    { type: 'removed', path: '[1]', value: 2 },
  ]);
});

test('computeDiff: a type change is one "changed" record, not a recursive walk', () => {
  assert.deepEqual(hostify(W.computeDiff({ v: { deep: 1 } }, { v: 'now a string' })), [
    { type: 'changed', path: 'v', from: { deep: 1 }, to: 'now a string' },
  ]);
  assert.deepEqual(hostify(W.computeDiff({ v: [1] }, { v: { 0: 1 } })), [
    { type: 'changed', path: 'v', from: [1], to: { 0: 1 } },
  ], 'array vs object is a type change even with identical contents');
  assert.deepEqual(hostify(W.computeDiff(null, {})), [
    { type: 'changed', path: '', from: null, to: {} },
  ]);
  assert.deepEqual(hostify(W.computeDiff({ a: 1 }, { a: 1 })), [], 'identical inputs produce no records');
});

test('FIXED computeDiff bounds cyclic input instead of blowing the stack', () => {
  // Was (workers/xray-worker.js:234): no depth cap and no visited tracking, so a
  // cyclic payload — reachable, because postMessage's structured-clone transport
  // carries cycles — recursed to RangeError and lost the whole diff.
  const a = { id: 1 };
  a.self = a;
  const b = { id: 2 };
  b.self = b;

  const diffs = W.computeDiff(a, b);
  assert.deepEqual(hostify(diffs), [{ type: 'changed', path: 'id', from: 1, to: 2 }],
    'the real difference is reported and the shared cycle is not');

  // Two objects that are only a cycle diff to nothing at all.
  const p1 = {}; p1.self = p1;
  const p2 = {}; p2.self = p2;
  assert.deepEqual(hostify(W.computeDiff(p1, p2)), [], 'identical cycles are not a difference');
});

test('FIXED computeDiff emits a serialisable marker for a cycle on one side only', () => {
  // The recursion only continues when both sides have the key, so an asymmetric
  // cycle escaped as a raw `value`. Structured clone carried it, but every export
  // path in this repo JSON-stringifies the diff, and that threw.
  const a = { id: 1 };
  a.self = a;
  const diffs = W.computeDiff(a, { id: 1 });
  assert.equal(diffs.length, 1);
  assert.equal(diffs[0].type, 'removed');
  assert.equal(diffs[0].path, 'self');
  assert.deepEqual(hostify(diffs[0].value), { id: 1, self: '[Circular]' },
    'the cycle becomes a marker rather than the raw object');
  assert.doesNotThrow(() => JSON.stringify(hostify(diffs)), 'so consumers can serialise it');
});

test('computeDiff: a cyclic payload now returns a successful reply through onmessage', async () => {
  const worker = loadWorker();
  const a = {};
  a.self = a;
  const b = {};
  b.self = b;
  const reply = await dispatch(worker, 'computeDiff', { a, b }, 'diff-cyclic');
  assert.equal(reply.success, true, 'was {success:false} with a RangeError message');
  assert.deepEqual(hostify(reply.result), []);
  assert.equal(typeof worker.self.onmessage, 'function', 'and the worker is still alive');
});


// ───────────────────────────────────────────────────────────── inferSchema

test('inferSchema: maps values to type names, sampling arrays by their first element', () => {
  assert.deepEqual(hostify(W.inferSchema({ a: [{ b: 1 }], c: null, d: 's', e: true })), {
    a: [{ b: 'number' }], c: 'null', d: 'string', e: 'boolean',
  });
  assert.equal(W.inferSchema([]), 'array', 'an empty array has no element to sample');
  assert.equal(W.inferSchema(undefined), 'undefined');
  assert.deepEqual(hostify(W.inferSchema([{ a: 1 }, { totallyDifferent: 1 }])), [{ a: 'number' }],
    'only element 0 is inspected, so heterogeneous arrays are misreported');
});

test('inferSchema: depth and key-count caps are marked in the output', () => {
  assert.deepEqual(hostify(W.inferSchema({ a: { b: { c: { d: 1 } } } }, 0, 2)), {
    a: { b: { c: '[Max depth]' } },
  });

  const wide = {};
  for (let i = 0; i < 205; i++) wide[`k${i}`] = 1;
  const schema = W.inferSchema(wide);
  assert.equal(Object.keys(schema).length, 201, '200 sampled keys plus the marker');
  assert.equal(schema['...'], '+5 more keys');
});

test('inferSchema: a cyclic object is bounded by maxDepth rather than throwing', () => {
  const cyclic = { a: 1 };
  cyclic.self = cyclic;
  let node = W.inferSchema(cyclic);
  let levels = 0;
  while (typeof node === 'object' && node.self) { node = node.self; levels++; }
  assert.equal(levels, 11, 'the guard is `depth > maxDepth`, so level 11 is the first to be cut');
  assert.equal(node, '[Max depth]');
});

// ───────────────────────────────────────────────────────────── gridRows

test('gridRows: unions the keys of object rows and caps rows at 200 / columns at 20', () => {
  assert.deepEqual(hostify(W.gridRows([{ a: 1 }, { b: 2 }, 'scalar', [1]])), {
    objects: [{ a: 1 }, { b: 2 }], columns: ['a', 'b'],
  });

  const many = Array.from({ length: 250 }, (_, i) => ({ [`c${i}`]: i }));
  const grid = W.gridRows(many);
  assert.equal(grid.objects.length, 200);
  assert.equal(grid.columns.length, 200, 'the 20-key cap is PER ROW, not on the column union');

  const wideRow = {};
  for (let i = 0; i < 30; i++) wideRow[`k${i}`] = i;
  assert.equal(W.gridRows([wideRow]).columns.length, 20);
});

test('gridRows: finds the first array-valued property of an envelope object', () => {
  assert.deepEqual(hostify(W.gridRows({ meta: { page: 1 }, items: [{ a: 1 }] })), {
    objects: [{ a: 1 }], columns: ['a'],
  });
  assert.deepEqual(hostify(W.gridRows({ a: 1 })), { objects: [{ a: 1 }], columns: ['a'] },
    'an envelope with no array is treated as a single row');
  assert.deepEqual(hostify(W.gridRows(5)), { objects: [], columns: [] });
  assert.deepEqual(hostify(W.gridRows(null)), { objects: [], columns: [] });
});

// ───────────────────────────────────────────────────────────── detailAnalysis

test('detailAnalysis: bundles schema/grid/viz/stats and omits diff when there is no previous', () => {
  const result = W.detailAnalysis({ items: [{ id: 1 }] });
  assert.equal(result.diff, null);
  assert.equal(result.engine, 'worker-js');
  assert.deepEqual(hostify(result.schema), { items: [{ id: 'number' }] });
  assert.deepEqual(hostify(result.grid), { objects: [{ id: 1 }], columns: ['id'] });
  assert.deepEqual(hostify(result.viz.rows), 1, 'a non-array root counts as one row');
  assert.equal(typeof result.durationMs, 'number');
});

test('detailAnalysis: with a previous value it emits both schemas and a capped structural diff', () => {
  const result = W.detailAnalysis({ a: 2 }, { a: 1 });
  assert.deepEqual(hostify(result.diff.structuralDiff), [{ type: 'changed', path: 'a', from: 1, to: 2 }]);
  assert.deepEqual(hostify(result.diff.previousSchema), { a: 'number' });

  const big = Array.from({ length: 700 }, (_, i) => i);
  const capped = W.detailAnalysis(big, big.map((n) => n + 1));
  assert.equal(capped.diff.structuralDiff.length, 500, 'structuralDiff is sliced to 500 records');
  assert.equal(capped.viz.rows, 700, 'but viz.rows still reports the true length');
});

test('detailAnalysis: a cyclic previous value is bounded, not fatal', () => {
  const a = { v: 1 };
  a.self = a;
  const b = { v: 2 };
  b.self = b;
  const result = W.detailAnalysis(a, b);
  assert.deepEqual(hostify(result.diff.structuralDiff), [{ type: 'changed', path: 'v', from: 2, to: 1 }],
    'was: RangeError out of the whole analysis');
});

// ───────────────────────────────────────────────────────────── escapeCSV / exports

test('escapeCSV: quotes only when needed, doubles embedded quotes, JSON-encodes non-strings', () => {
  // Was: unconditional quoting and String() for non-strings. Both now match toCSV
  // in shared/console-helpers.js, so the same value produces the same bytes
  // whichever of the extension's two CSV writers wrote the file.
  assert.equal(W.escapeCSV('plain'), 'plain');
  assert.equal(W.escapeCSV('a,b'), '"a,b"');
  assert.equal(W.escapeCSV('say "hi"'), '"say ""hi"""');
  assert.equal(W.escapeCSV('line1\nline2'), '"line1\nline2"');
  assert.equal(W.escapeCSV(null), '');
  assert.equal(W.escapeCSV(undefined), '');
  assert.equal(W.escapeCSV(0), '0');
  assert.equal(W.escapeCSV(false), 'false');
  assert.equal(W.escapeCSV({ o: 1 }), '"{""o"":1}"', 'JSON.stringify, not String()');
  assert.equal(W.escapeCSV([1, 2]), '"[1,2]"', 'an array keeps its structure inside one cell');
});

test('FIXED escapeCSV neutralises CSV formula injection', () => {
  // A response value starting with = + - or @ is evaluated as a formula by Excel /
  // Sheets / LibreOffice on open. RFC4180 quoting is NOT a defence: the spreadsheet
  // strips the quotes before evaluating. A leading apostrophe is what stops it.
  assert.equal(W.escapeCSV('=1+1'), "'=1+1");
  assert.equal(W.escapeCSV('+SUM(A1)'), "'+SUM(A1)");
  assert.equal(W.escapeCSV('@SUM(A1)'), "'@SUM(A1)");
  assert.equal(W.escapeCSV("=cmd|'/c calc'!A1"), "'=cmd|'/c calc'!A1");
  assert.equal(W.escapeCSV('=HYPERLINK("http://evil.test")'), String.raw`"'=HYPERLINK(""http://evil.test"")"`);

  // Plain numbers keep their type — neutralising them would turn every negative
  // duration into text.
  assert.equal(W.escapeCSV(-5), '-5');
  assert.equal(W.escapeCSV('-12.5'), '-12.5');
  assert.equal(W.escapeCSV('-1e3'), '-1e3');
  assert.equal(W.escapeCSV('-2+3'), "'-2+3", 'an expression that merely starts like a number is not one');
});

test('escapeCSV and shared/console-helpers.js toCSV now agree cell for cell', () => {
  // These are the extension's two CSV writers: the worker one backs the panel's
  // "Export CSV", the helper one backs the console csv() / toCSV() builtins. They
  // used to disagree on quoting policy AND on non-string handling, so the same
  // value round-tripped to two different files.
  const helpers = loadIsolatedWorld('shared/console-helpers.js').window.XRAY_ConsoleHelpers;
  const cell = (value) => helpers.toCSV([{ v: value }]).split('\n')[1];

  for (const value of ['plain', 'a,b', 'say "hi"', '=1+1', '-2+3', '@x', 0, false, -5, { o: 1 }, [1, 2], null]) {
    assert.equal(W.escapeCSV(value), cell(value), JSON.stringify(value) + ' agrees across both writers');
  }
});

test('FIXED shared/console-helpers.js toCSV escapes its header row', () => {
  // Was: `keys.join(',')` while every DATA cell went through the escaper, so a
  // response key containing a comma or quote produced a header whose column count
  // did not match its rows.
  const helpers = loadIsolatedWorld('shared/console-helpers.js').window.XRAY_ConsoleHelpers;
  assert.equal(helpers.toCSV([{ 'we,ird': 1 }]), '"we,ird"\n1', 'one header cell stays one cell');
  assert.equal(helpers.toCSV([{ 'q"k': 1 }]), '"q""k"\n1', 'a quote in a header is doubled');
});

test('FIXED shared/console-helpers.js toCSV takes columns from every row', () => {
  // Captured payloads are routinely heterogeneous (an error row carries `error`, a
  // success row does not). Keys absent from row 0 used to be dropped silently.
  const helpers = loadIsolatedWorld('shared/console-helpers.js').window.XRAY_ConsoleHelpers;
  assert.equal(helpers.toCSV([{ a: 1 }, { a: 2, b: 'kept' }]), 'a,b\n1,\n2,kept');
  assert.equal(helpers.toCSV([{}, { a: 1 }]), 'a\n\n1', 'an empty first row no longer erases the table');
  assert.equal(helpers.toCSV([{}, {}]), '', 'genuinely keyless input is still empty');
});

test('exportToCSV: fixed header, api entries only, ISO timestamps', () => {
  const csv = W.exportToCSV([
    { type: 'api', timestamp: 0, method: 'GET', url: 'https://a.test/x,y', status: 200, duration: 5, size: 10 },
    { type: 'log', logLevel: 'error' },
  ]);
  // Cells are quoted only when they need it now, matching the console helper.
  assert.deepEqual(csv.split('\n'), [
    'timestamp,method,url,status,duration,size',
    '1970-01-01T00:00:00.000Z,GET,"https://a.test/x,y",200,5,10',
  ]);
  assert.equal(W.exportToCSV([]), '');
  assert.equal(W.exportToCSV([{ type: 'log' }]), '', 'a log-only capture exports an empty string, not a header');
});

test('exportToCSV: missing values become empty cells', () => {
  assert.equal(
    W.exportToCSV([{ type: 'api', timestamp: 0 }]),
    'timestamp,method,url,status,duration,size\n1970-01-01T00:00:00.000Z,,,,,',
    'every missing field degrades to an empty cell',
  );
});

test('FIXED exportToCSV survives an entry with no valid timestamp', () => {
  // Was: `new Date(entry.timestamp).toISOString()` unguarded, so Invalid Date threw
  // RangeError and a SINGLE bad entry — an imported HAR with a string date, or an
  // entry the interceptor never stamped — discarded the whole export, good rows
  // included. Every other column already had a fallback; now this one does too.
  const header = 'timestamp,method,url,status,duration,size';
  assert.equal(W.exportToCSV([{ type: 'api' }]), header + '\n,,,,,');
  assert.equal(W.exportToCSV([{ type: 'api', timestamp: 'not-a-date' }]), header + '\n,,,,,');

  const mixed = W.exportToCSV([{ type: 'api', timestamp: 0 }, { type: 'api', timestamp: NaN }]);
  assert.deepEqual(mixed.split('\n'), [header, '1970-01-01T00:00:00.000Z,,,,,', ',,,,,'],
    'the good entry survives alongside the malformed one');

  // exportToHAR had the identical unguarded call and the same fix.
  const har = W.exportToHAR([{ type: 'api' }]);
  assert.equal(har.log.entries[0].startedDateTime, '', 'an unknown time is empty, not invented');

  assert.equal(W.exportToCSV(null), '', 'a non-array entries list is empty, not a TypeError');
  assert.equal(W.exportToHAR(null).log.entries.length, 0);
});

test('exportToHAR: emits a 1.2 log with header pairs and omits postData when absent', () => {
  const har = hostify(W.exportToHAR([
    {
      type: 'api', timestamp: 0, method: 'GET', url: 'https://a.test/x', status: 200,
      duration: 3, size: 9, requestHeaders: { a: 'b' }, responseHeaders: { c: 'd' }, responseRaw: '{}',
    },
    { type: 'log' },
  ]));
  assert.equal(har.log.version, '1.2');
  assert.deepEqual(har.log.creator, { name: 'XRAY Extension', version: '1.0.0' });
  assert.equal(har.log.entries.length, 1, 'log entries are excluded');

  const [entry] = har.log.entries;
  assert.equal(entry.startedDateTime, '1970-01-01T00:00:00.000Z');
  assert.deepEqual(entry.request.headers, [{ name: 'a', value: 'b' }]);
  assert.deepEqual(entry.response.headers, [{ name: 'c', value: 'd' }]);
  assert.equal(entry.request.postData, undefined, 'no request body means no postData');
  assert.deepEqual(entry.timings, { wait: 3, receive: 0 });
});

test('exportToHAR: defaults every missing field rather than throwing', () => {
  const har = W.exportToHAR([{ type: 'api', timestamp: 0, requestBody: { q: 1 } }]);
  const [entry] = har.log.entries;
  assert.equal(entry.request.method, 'GET');
  assert.equal(entry.request.url, '');
  assert.equal(entry.response.status, 0);
  assert.deepEqual(hostify(entry.request.postData), { mimeType: 'application/json', text: '{"q":1}' });
  assert.equal(entry.response.content.text, '', 'responseRaw is the only body source; decrypted bodies are lost');
});

// ───────────────────────────────────────────────────────────── analyzeEntries

test('analyzeEntries: request/log split, status bands, averages and the slowest entry', () => {
  const result = hostify(W.analyzeEntries([
    { type: 'api', id: '1', method: 'GET', urlPath: '/a', status: 200, duration: 10 },
    { type: 'api', id: '2', method: 'GET', urlPath: '/a', status: 404, duration: 50, url: 'https://a.test/a' },
    { type: 'api', id: '3', method: 'GET', urlPath: '/b', status: 503, duration: 5 },
    { type: 'log', logLevel: 'error' },
    { type: 'log', logLevel: 'trace' },
  ]));

  assert.equal(result.totalRequests, 3);
  assert.equal(result.totalLogs, 2);
  assert.equal(result.avgDuration, 22, 'rounded mean of 10/50/5');
  assert.deepEqual(result.slowestEntry, { id: '2', url: 'https://a.test/a', duration: 50 });
  assert.deepEqual(result.statusCounts, { success: 1, clientError: 1, serverError: 1 });
  assert.deepEqual(result.logLevels, { log: 0, warn: 0, error: 1 }, 'unknown levels like "trace" are dropped');
  assert.deepEqual(result.topEndpoints, [{ endpoint: 'GET /a', count: 2 }, { endpoint: 'GET /b', count: 1 }]);
});

test('analyzeEntries: 3xx counts as success and a 0/failed request counts as nothing', () => {
  const result = W.analyzeEntries([
    { type: 'api', status: 301 }, { type: 'api', status: 399 }, { type: 'api', status: 0 },
  ]);
  assert.deepEqual(hostify(result.statusCounts), { success: 2, clientError: 0, serverError: 0 });
  assert.equal(result.totalRequests, 3, 'the failed request is still counted in the total');
});

test('FIXED analyzeEntries: avgDuration divides by the timed requests only', () => {
  // Was (workers/xray-worker.js:462): totalDuration accumulated only entries with a
  // truthy duration while the divisor was apiEntries.length, so any in-flight or
  // zero-duration request dragged the reported average down.
  const result = W.analyzeEntries([
    { type: 'api', duration: 100 }, { type: 'api' }, { type: 'api', duration: 0 },
  ]);
  assert.equal(result.avgDuration, 100, 'the mean of the timed requests, not 33');
  assert.equal(result.totalRequests, 3, 'while the request count still counts them all');

  assert.equal(W.analyzeEntries([{ type: 'api' }]).avgDuration, 0, 'nothing timed reports 0');
  assert.equal(W.analyzeEntries([
    { type: 'api', duration: 100 }, { type: 'api', duration: 200 },
  ]).avgDuration, 150);
});

test('analyzeEntries: an empty capture produces a fully-zeroed report', () => {
  assert.deepEqual(hostify(W.analyzeEntries([])), {
    totalRequests: 0, totalLogs: 0, avgDuration: 0, slowestEntry: null,
    statusCounts: { success: 0, clientError: 0, serverError: 0 },
    logLevels: { log: 0, warn: 0, error: 0 },
    topEndpoints: [],
  });
});

test('analyzeEntries: topEndpoints is capped at ten, sorted by descending count', () => {
  const entries = [];
  for (let i = 0; i < 15; i++) {
    for (let n = 0; n <= i; n++) entries.push({ type: 'api', method: 'GET', urlPath: `/e${i}` });
  }
  const top = W.analyzeEntries(entries).topEndpoints;
  assert.equal(top.length, 10);
  assert.equal(top[0].endpoint, 'GET /e14');
  assert.equal(top[0].count, 15);
});

// ───────────────────────────────────────────────────────────── safeClone

test('safeClone: produces a detached deep copy and preserves Date instances', async () => {
  const source = { a: 1, nested: { list: [1, { deep: true }] }, when: new Date(0) };
  const clone = await W.safeClone(source);

  assert.notEqual(clone, source);
  assert.notEqual(clone.nested, source.nested);
  clone.nested.list[1].deep = false;
  assert.equal(source.nested.list[1].deep, true);

  assert.ok(clone.when instanceof Date, 'unlike the JSON round-trip in shared/utils.js, Dates survive');
  assert.notEqual(clone.when, source.when);
  assert.equal(clone.when.getTime(), 0);
});

test('safeClone: primitives and nullish values pass straight through', async () => {
  assert.equal(await W.safeClone(null), null);
  assert.equal(await W.safeClone(undefined), undefined);
  assert.equal(await W.safeClone(42), 42);
  assert.equal(await W.safeClone('s'), 's');
  assert.deepEqual(hostify(await W.safeClone([])), []);
});

test('safeClone: yields to the event loop on schedule for large payloads', async () => {
  // The yieldEvery parameter exists so a big clone cannot monopolise the worker.
  // Drive it with a tiny threshold and confirm the awaited setTimeout really fires.
  const big = Array.from({ length: 50 }, (_, i) => ({ i }));
  let macrotasks = 0;
  let running = true;
  const tick = () => { macrotasks++; if (running) setTimeout(tick, 0); };
  setTimeout(tick, 0);
  const clone = await W.safeClone(big, 5);
  running = false;
  assert.equal(clone.length, 50);
  assert.ok(macrotasks > 0, 'other macrotasks ran while the clone was in flight');

  // With a threshold larger than the payload no yield happens at all.
  let solo = 0;
  let soloRunning = true;
  const soloTick = () => { solo++; if (soloRunning) setTimeout(soloTick, 0); };
  setTimeout(soloTick, 0);
  await W.safeClone({ a: 1 }, 1000);
  soloRunning = false;
  assert.equal(solo, 0, 'a small clone completes within a single microtask drain');
});

test('FIXED safeClone settles on cyclic input instead of hanging and leaking', () => {
  // Was (workers/xray-worker.js:159): no cycle detection. Because the recursion is
  // `async`, the failure was NOT a catchable stack overflow the way computeDiff's
  // was — every level is a microtask, so the stack stayed shallow and the function
  // simply allocated forever:
  //
  //   * the promise neither resolved nor rejected, so self.onmessage's try/catch
  //     never ran and no reply was posted — the panel's pending request for that
  //     message id hung for the life of the worker;
  //   * the clone tree grew until the heap died (measured: ~4 GB in 40 s), tearing
  //     down the worker with every other in-flight request and the entry cache.
  //
  // Still verified out-of-process, under a deliberately tight heap: if the cycle
  // fix ever regresses, this child exhausts 256 MB rather than the test runner.
  const probe = `
    const vm = require('node:vm');
    const fs = require('node:fs');
    const ctx = {
      self: { postMessage() {} },
      indexedDB: { open: () => ({}) },
      performance: { now: () => 0 },
      setTimeout, URL, Date, console, WeakMap, Set,
    };
    vm.createContext(ctx);
    vm.runInContext(fs.readFileSync(process.argv[1], 'utf8'), ctx);
    const cyclic = { a: 1 };
    cyclic.self = cyclic;
    let outcome = 'pending';
    ctx.safeClone(cyclic).then((clone) => {
      outcome = clone.self === clone && clone.a === 1 ? 'resolved' : 'wrong-shape';
    }, () => { outcome = 'rejected'; });
    setTimeout(() => { console.log(outcome); process.exit(0); }, 400);
  `;
  const out = execFileSync(
    process.execPath,
    ['--max-old-space-size=256', '-e', probe, path.join(repoRoot, 'workers/xray-worker.js')],
    { encoding: 'utf8', timeout: 20_000 },
  ).trim();

  assert.equal(out, 'resolved', 'safeClone(cyclic) resolves, and the clone preserves the cycle');
});

test('safeClone: an object referenced twice as a sibling is cloned once, not called circular', async () => {
  const shared = { v: 1 };
  const clone = await W.safeClone({ first: shared, second: shared });
  assert.deepEqual(hostify(clone), { first: { v: 1 }, second: { v: 1 } });
  assert.equal(clone.first, clone.second, 'shared identity survives the clone');
  assert.notEqual(clone.first, shared, 'but it is still detached from the source');
});


// ───────────────────────────────────────────────────────────── message handler

test('onmessage: dispatches each action and echoes the request id', async () => {
  const worker = loadWorker();
  const entries = [{ type: 'api', id: 'e1', url: 'https://a.test/users', method: 'GET', status: 200, timestamp: 0 }];

  assert.deepEqual(hostify(await dispatch(worker, 'search', { query: 'users', entries }, 's1')),
    { id: 's1', success: true, result: entries });
  assert.deepEqual(hostify((await dispatch(worker, 'computeStats', { data: { a: 1 } }, 's2')).result),
    { keyCount: 1, arrayCount: 0, stringLength: 0, maxStringLen: 0, depth: 1 });
  assert.deepEqual(hostify((await dispatch(worker, 'computeDiff', { a: { x: 1 }, b: { x: 2 } }, 's3')).result),
    [{ type: 'changed', path: 'x', from: 1, to: 2 }]);
  assert.deepEqual(hostify((await dispatch(worker, 'inferSchema', { data: { a: 1 } }, 's4')).result), { a: 'number' });
  assert.match((await dispatch(worker, 'exportCSV', { entries }, 's5')).result, /^timestamp,method,url/);
  assert.equal((await dispatch(worker, 'exportHAR', { entries }, 's6')).result.log.version, '1.2');
  assert.equal((await dispatch(worker, 'analyze', { entries }, 's7')).result.totalRequests, 1);
  assert.deepEqual(hostify((await dispatch(worker, 'clone', { data: { a: 1 } }, 's8')).result), { a: 1 });
  assert.equal((await dispatch(worker, 'detailAnalysis', { current: { a: 1 } }, 's9')).result.engine, 'worker-js');
});

test('onmessage: addEntry stamps search tokens, populates the cache, and never awaits IndexedDB', async () => {
  const worker = loadWorker();
  const entry = { id: 'e1', type: 'api', url: 'https://a.test/users', method: 'GET', status: 200 };

  const reply = await dispatch(worker, 'addEntry', { entry }, 'a1');
  assert.deepEqual(hostify(reply), { id: 'a1', success: true, result: { added: true } });
  assert.deepEqual(hostify(entry._searchTokens), ['https://a.test/users', 'users', 'get', '200']);
  assert.equal(worker.idbOpenCalls.length, 1, 'the write is fired and forgotten');

  const cached = await dispatch(worker, 'getFromCache', { id: 'e1' }, 'a2');
  assert.equal(cached.result, entry, 'the cache holds the live object, not a copy');
  assert.equal((await dispatch(worker, 'getFromCache', { id: 'nope' }, 'a3')).result, null);
});

test('onmessage: an unknown action is reported as a failure, not silence', async () => {
  const worker = loadWorker();
  const reply = await dispatch(worker, 'notARealAction', {}, 'u1');
  assert.deepEqual(hostify(reply), { id: 'u1', success: false, error: 'Unknown action: notARealAction' });
});

test('onmessage: a thrown handler error is reported with only its message', async () => {
  const worker = loadWorker();
  // addEntry dereferences payload.entry, so a null payload throws inside the switch.
  // (exportCSV used to be the vehicle here, but it now guards a non-array input.)
  const reply = await dispatch(worker, 'addEntry', null, 'e1');
  assert.equal(reply.success, false);
  assert.equal(typeof reply.error, 'string');
  assert.equal('stack' in reply, false, 'stacks are not leaked back to the panel');
});
