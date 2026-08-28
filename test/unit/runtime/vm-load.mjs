// Loader for the vanilla capture runtime (content/, shared/, workers/).
//
// WHY THIS FILE EXISTS
// --------------------
// shared/*.js and workers/xray-worker.js are browser IIFEs: they are `script`
// sourceType, have no exports, and publish themselves by assigning to `window`
// (ISOLATED world) or by declaring top-level functions and hanging a handler off
// `self` (worker). Nothing about them is importable from Node.
//
// The repo's established way to execute them anyway is `vm.runInContext` against
// a hand-built global — see test/console-helpers.behavior.test.js. This module
// generalises that pattern so the four suites in this directory share one
// definition of "what globals does the browser actually give this file".
//
// Two deliberate choices:
//
//   1. Host-realm `URL`, `Date` and `Set` are injected rather than left to the
//      vm's own intrinsics. Fixtures are built in the test realm, so `val
//      instanceof Date` inside worker code only works if both sides agree on
//      which `Date` that is.
//   2. Nothing is auto-stubbed beyond what the file needs to *load*. If a
//      function reaches for a global the browser has and we did not provide, the
//      test should blow up rather than silently exercise a fallback path.
//
// This file is intentionally NOT named *.test.mjs: `npm test` globs
// test/**/*.test.mjs, so a helper module here is loaded by its importers only.

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

export const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '../../..');

export function readSource(relPath) {
  return fs.readFileSync(path.join(repoRoot, relPath), 'utf8');
}

/**
 * Re-create a value produced inside the vm realm using host intrinsics.
 *
 * A vm context is a separate realm, so an object literal built by the code under
 * test has the *vm's* Object.prototype. assert/strict's deepEqual compares
 * prototypes, so it rejects an otherwise-identical shape. structuredClone walks
 * the value with the structured-serialize algorithm and rebuilds it here, which
 * is exactly the normalisation postMessage would apply on the way out of a real
 * worker anyway. JSON-hostile values (functions, cycles) must not be passed.
 */
export function hostify(value) {
  return value === undefined ? value : structuredClone(value);
}

/** Globals every one of these files can assume exist in a browser. */
function baseGlobals() {
  // structuredClone and WeakMap are ordinary globals in a content script and a
  // worker; the sandbox has to offer them or code that legitimately relies on them
  // fails here for a reason that has nothing to do with the code under test.
  return {
    URL, Date, Set, Map, WeakMap, WeakSet, console,
    setTimeout, clearTimeout, queueMicrotask, structuredClone,
  };
}

/**
 * Run an ISOLATED-world script (shared/utils.js, shared/store.js,
 * shared/console-helpers.js) and hand back both the context and the `window`
 * object it published onto.
 */
export function loadIsolatedWorld(relPath, extraGlobals = {}) {
  const context = { window: {}, ...baseGlobals(), ...extraGlobals };
  context.self = context.window;
  vm.createContext(context);
  vm.runInContext(readSource(relPath), context);
  return context;
}

/**
 * Run workers/xray-worker.js.
 *
 * The worker declares its helpers as top-level `function` declarations in a
 * `script`-sourceType file, so they land on the context's global object and are
 * reachable as `worker.tokenizeEntry` etc. `self.postMessage` must exist before
 * the file finishes loading — the last line of the worker posts a ready message
 * unconditionally — and `indexedDB` must exist for openDB().
 *
 * @returns the vm context, plus `posted` (every self.postMessage payload, in
 *          order) and `idbOpenCalls`.
 */
export function loadWorker({ indexedDBOpen } = {}) {
  const posted = [];
  const idbOpenCalls = [];
  let clock = 0;

  const context = {
    ...baseGlobals(),
    posted,
    idbOpenCalls,
    performance: { now: () => (clock += 1) },
    indexedDB: {
      open(name, version) {
        idbOpenCalls.push({ name, version });
        // A request object that never fires a callback: openDB()'s promise stays
        // pending, which is what we want for every test that is not about IDB.
        return indexedDBOpen ? indexedDBOpen(name, version) : { onerror: null, onsuccess: null, onupgradeneeded: null };
      },
    },
  };
  context.self = { postMessage: (message) => posted.push(message) };
  context.globalThis = context;

  vm.createContext(context);
  vm.runInContext(readSource('workers/xray-worker.js'), context);
  return context;
}

/** Drive the worker's self.onmessage and resolve once it has posted a reply. */
export async function dispatch(worker, action, payload, id = `m${worker.posted.length}`) {
  const before = worker.posted.length;
  await worker.self.onmessage({ data: { id, action, payload } });
  return worker.posted.slice(before).find((m) => m.id === id);
}
