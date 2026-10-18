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

// ─────────────────────────────────────────── token index / search (removed)

test('the worker keeps no token index or search (JSON fidelity Task 6 ruling)', async () => {
  // content.js fed every capture to addEntry so the worker could tokenize it for a `search`
  // action nothing called; the panel searches its own session index. The index and the search are
  // gone, and with the final fix (M7) addEntry and its entry cache too.
  for (const name of ['tokenizeEntry', 'extractKeys', 'extractLogKeys', 'searchEntries']) {
    assert.equal(typeof W[name], 'undefined', `${name} is gone`);
  }
  const worker = loadWorker();
  assert.deepEqual(hostify(await dispatch(worker, 'search', { query: 'users', entries: [] }, 'gone')),
    { id: 'gone', success: false, error: 'Unknown action: search' });
});

// ─────────────────────────────────────────── table / schema / diff (removed)

test('the worker keeps no table, schema or diff of its own (JSON fidelity spec J11)', async () => {
  // DevTools used to get these from the worker while every other surface ran the panel's models:
  // the worker picked the FIRST array ({"errors":[],"data":[…]} showed no rows), typed to depth 10
  // instead of 5, diffed to depth 50 instead of 6, and received integers past 2^53 already rounded.
  // The panel's node models (src/panel/models/detail.ts, viz.ts) now serve every surface.
  for (const name of ['computeDiff', 'inferSchema', 'gridRows', 'detailAnalysis', 'cycleSafe', 'diffValue']) {
    assert.equal(typeof W[name], 'undefined', `${name} is gone`);
  }
  const worker = loadWorker();
  for (const action of ['computeDiff', 'inferSchema', 'detailAnalysis']) {
    assert.deepEqual(hostify(await dispatch(worker, action, { a: 1, b: 2, data: 1, current: 1 }, action)),
      { id: action, success: false, error: `Unknown action: ${action}` });
  }
});

// ───────────────────────────────────────────────────────────── CSV (console helpers)

// The extension's one CSV writer is toCSV in shared/console-helpers.js (the console csv() / toCSV()
// builtins); the worker's own exportCSV writer had no caller and went with the final fix (M7). Its
// escaping rules are pinned here on toCSV's cells.
const csvCell = (value) => {
  const csv = loadIsolatedWorld('shared/console-helpers.js').window.XRAY_ConsoleHelpers.toCSV([{ v: value }]);
  return csv.slice(csv.indexOf('\n') + 1); // after the header row; a cell may hold a line break
};

test('toCSV cells: quoted only when needed, embedded quotes doubled, non-strings JSON-encoded', () => {
  assert.equal(csvCell('plain'), 'plain');
  assert.equal(csvCell('a,b'), '"a,b"');
  assert.equal(csvCell('say "hi"'), '"say ""hi"""');
  assert.equal(csvCell('line1\nline2'), '"line1\nline2"');
  assert.equal(csvCell(null), '');
  assert.equal(csvCell(0), '0');
  assert.equal(csvCell(false), 'false');
  assert.equal(csvCell({ o: 1 }), '"{""o"":1}"', 'JSON.stringify, not String()');
  assert.equal(csvCell([1, 2]), '"[1,2]"', 'an array keeps its structure inside one cell');
});

test('toCSV neutralises CSV formula injection', () => {
  // A response value starting with = + - or @ is evaluated as a formula by Excel /
  // Sheets / LibreOffice on open. RFC4180 quoting is NOT a defence: the spreadsheet
  // strips the quotes before evaluating. A leading apostrophe is what stops it.
  assert.equal(csvCell('=1+1'), "'=1+1");
  assert.equal(csvCell('+SUM(A1)'), "'+SUM(A1)");
  assert.equal(csvCell('@SUM(A1)'), "'@SUM(A1)");
  assert.equal(csvCell("=cmd|'/c calc'!A1"), "'=cmd|'/c calc'!A1");
  assert.equal(csvCell('=HYPERLINK("http://evil.test")'), String.raw`"'=HYPERLINK(""http://evil.test"")"`);

  // Plain numbers keep their type — neutralising them would turn every negative
  // duration into text.
  assert.equal(csvCell(-5), '-5');
  assert.equal(csvCell('-12.5'), '-12.5');
  assert.equal(csvCell('-1e3'), '-1e3');
  assert.equal(csvCell('-2+3'), "'-2+3", 'an expression that merely starts like a number is not one');
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
  assert.deepEqual(hostify(await dispatch(worker, 'init', {}, 's1')), { id: 's1', success: true, result: { ready: true } });
  assert.deepEqual(hostify((await dispatch(worker, 'clone', { data: { a: 1 } }, 's2')).result), { a: 1 });
  assert.equal((await dispatch(worker, 'captureReceipt', { accepted: 2 }, 's3')).result.accepted, 2);
  assert.equal((await dispatch(worker, 'getCaptureReceipt', {}, 's4')).result.accepted, 2);
  assert.deepEqual(worker.posted.slice(1).map((message) => message.id), ['s1', 's2', 's3', 's4']);
});

test('onmessage: an unknown action is reported as a failure, not silence', async () => {
  const worker = loadWorker();
  const reply = await dispatch(worker, 'notARealAction', {}, 'u1');
  assert.deepEqual(hostify(reply), { id: 'u1', success: false, error: 'Unknown action: notARealAction' });
});

test('onmessage: a thrown handler error is reported with only its message', async () => {
  const worker = loadWorker();
  // clone dereferences payload.data, so a null payload throws inside the switch.
  const reply = await dispatch(worker, 'clone', null, 'e1');
  assert.equal(reply.success, false);
  assert.equal(typeof reply.error, 'string');
  assert.equal('stack' in reply, false, 'stacks are not leaked back to the panel');
});

test('capture receipt aggregation exposes only bounded counters and reason codes', async () => {
  const worker = loadWorker();
  const receipt = hostify((await dispatch(worker, 'captureReceipt', {
    accepted: 3,
    dropped: 2,
    dropReasons: { 'invalid-entry': 2 },
  }, 'receipt-1')).result);
  assert.equal(receipt.accepted, 3);
  assert.equal(receipt.dropped, 2);
  assert.deepEqual(receipt.dropReasons, { 'invalid-entry': 2 });

  const storedReceipt = (await dispatch(worker, 'getCaptureReceipt', {}, 'receipt-2')).result;
  assert.equal(hostify(storedReceipt).accepted, 3);
  assert.equal(hostify(storedReceipt).dropped, 2);
  assert.deepEqual(hostify(storedReceipt).dropReasons, { 'invalid-entry': 2 });
  assert.equal('url' in storedReceipt, false);
  assert.equal('headers' in storedReceipt, false);
  assert.equal('body' in storedReceipt, false);
});

test('the client over a real worker core is ready and healthy; receipts and clone round-trip', async t => {
  let creations = 0;
  class InMemoryWorker {
    constructor() {
      creations += 1;
      this.core = loadWorker();
      this.core.self.postMessage = message => queueMicrotask(() => this.onmessage?.({ data: message }));
      queueMicrotask(() => this.onmessage?.({ data: this.core.posted[0] }));
    }
    postMessage(message) { void this.core.self.onmessage({ data: message }); }
    terminate() {}
  }
  const context = loadIsolatedWorld('shared/worker-client.js', {
    Worker: InMemoryWorker,
    chrome: { runtime: { getURL: () => 'chrome-extension://fixture/workers/xray-worker.js' } },
  });
  const client = context.window.XRAY_Worker;
  t.after(() => client.terminate());
  await client.init();
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(creations, 1);
  assert.equal(client.isReady(), true);
  assert.equal(client.getHealth().state, 'healthy');
  assert.equal(client.getHealth().lastErrorCode, null);
  assert.deepEqual(hostify(await client.clone({ a: [1, { b: 2 }] })), { a: [1, { b: 2 }] });
  assert.equal((await client.captureReceipt({ accepted: 4, dropped: 1 })).accepted, 4);
});

test('capture receipt keeps cumulative accepted/dropped totals beyond 500', async () => {
  const worker = loadWorker();
  const receipt = hostify((await dispatch(worker, 'captureReceipt', {
    accepted: 1_200, dropped: 900, validated: 1_200, dropReasons: { 'invalid-entry': 900 },
  }, 'receipt-big')).result);
  assert.equal(receipt.accepted, 1_200);
  assert.equal(receipt.dropped, 900);
  assert.equal(receipt.dropReasons['invalid-entry'], 900);
});

// ───────────────────────────────────────────── dead operations (final fix M7)

test('Final fix M7: the worker keeps no entry cache, IndexedDB, exports or analysis (nothing called them)', async () => {
  for (const name of ['computeStats', 'exportToCSV', 'exportToHAR', 'analyzeEntries', 'escapeCSV', 'addToMemoryCache', 'getFromMemoryCache',
    'openDB', 'pruneStoredEntries', 'clearStoredEntries', 'noteCacheHealth']) {
    assert.equal(typeof W[name], 'undefined', `${name} is gone`);
  }
  const worker = loadWorker();
  for (const action of ['addEntry', 'getFromCache', 'computeStats', 'exportCSV', 'exportHAR', 'analyze', 'clearStored', 'pruneStored']) {
    assert.deepEqual(hostify(await dispatch(worker, action, { entries: [], entry: { id: 'x' }, data: {}, id: 'x' }, action)),
      { id: action, success: false, error: `Unknown action: ${action}` });
  }
});

test('Final fix M7: init opens no IndexedDB and deletes the database an earlier version kept, on the extension origin only', { timeout: 5_000 }, async () => {
  const extension = loadWorker();
  assert.deepEqual(hostify(await dispatch(extension, 'init', {}, 'i1')), { id: 'i1', success: true, result: { ready: true } });
  assert.deepEqual(hostify(extension.idbOpenCalls), []);
  assert.deepEqual(hostify(extension.idbDeleteCalls), ['xray_db'], 'captured traffic an older version cached is not left on disk');
  // A page-origin worker would see the visited site's own databases: it touches none.
  const page = loadWorker({ origin: 'https:' });
  assert.equal((await dispatch(page, 'init', {}, 'p1')).success, true);
  assert.deepEqual(hostify(page.idbOpenCalls), []);
  assert.deepEqual(hostify(page.idbDeleteCalls), []);
});

test('Final fix M7: the client offers what is used — health, receipts, clone — and no removed operation', () => {
  const client = loadIsolatedWorld('shared/worker-client.js').window.XRAY_Worker;
  for (const name of ['addEntry', 'computeStats', 'exportCSV', 'exportHAR', 'analyze', 'getFromCache']) assert.equal(client[name], undefined, name);
  for (const name of ['init', 'isReady', 'whenReady', 'onHealth', 'subscribeHealth', 'getHealth', 'captureReceipt', 'clone', 'terminate']) {
    assert.equal(typeof client[name], 'function', name);
  }
});
