// workers/xray-worker.js — off-main-thread helpers for the extension's own pages
// (the DevTools panel page and the pop-out): capture receipts and a non-blocking clone.
'use strict';

// ════════════════════════════════════════════════════════════════════════════
// STORAGE: none
// ════════════════════════════════════════════════════════════════════════════

// The worker kept an IndexedDB entry cache (threat model C-11: capped, prunable) that nothing has
// written since content.js stopped posting captures here (JSON fidelity Task 6) and nothing read; it
// went with the final fix (M7), together with the exports, stats and analysis nothing called. A
// database an earlier version left holds captured traffic, so init deletes it — on the extension's
// own origin only: a worker built on a page's origin would see that site's databases.
const LEGACY_DB_NAME = 'xray_db';

function _isPageOriginWorker() {
  try {
    // An extension-origin worker reports chrome-extension:; a page-origin worker does not.
    return !String(self.location?.protocol || '').startsWith('chrome-extension');
  } catch {
    return true;
  }
}

function dropLegacyCache() {
  if (_isPageOriginWorker()) return;
  try {
    indexedDB.deleteDatabase(LEGACY_DB_NAME);
  } catch {
    // Best effort: the database is unreadable by every feature either way.
  }
}

// Runtime receipts carry only aggregate counters and fixed reason codes. They are
// intentionally separate from captured entries so no URL, header, or body can be
// included by accident.
const _captureReceipt = {
  accepted: 0,
  dropped: 0,
  dropReasons: {},
  validated: 0,
  delivered: 0,
  noConsumer: 0,
  relayFailed: 0,
  deliveryReasons: {},
};

function captureReceiptSnapshot() {
  return {
    accepted: _captureReceipt.accepted,
    dropped: _captureReceipt.dropped,
    dropReasons: { ..._captureReceipt.dropReasons },
    validated: _captureReceipt.validated,
    delivered: _captureReceipt.delivered,
    noConsumer: _captureReceipt.noConsumer,
    relayFailed: _captureReceipt.relayFailed,
    deliveryReasons: { ..._captureReceipt.deliveryReasons },
  };
}

function recordCaptureReceipt(payload = {}) {
  const accepted = Number.isFinite(Number(payload.accepted))
    ? Math.max(0, Math.min(500000, Math.floor(Number(payload.accepted)))) : 0;
  const dropped = Number.isFinite(Number(payload.dropped))
    ? Math.max(0, Math.min(500000, Math.floor(Number(payload.dropped)))) : 0;
  _captureReceipt.accepted = Math.max(_captureReceipt.accepted, Math.min(500000, accepted));
  _captureReceipt.dropped = Math.max(_captureReceipt.dropped, Math.min(500000, dropped));
  if (payload.dropReasons && typeof payload.dropReasons === 'object' && !Array.isArray(payload.dropReasons)) {
    for (const [reason, value] of Object.entries(payload.dropReasons).slice(0, 20)) {
      if (!/^[a-z][a-z0-9-]{0,40}$/.test(reason)) continue;
      const count = Number.isFinite(Number(value))
        ? Math.max(0, Math.min(500000, Math.floor(Number(value)))) : 0;
      _captureReceipt.dropReasons[reason] = Math.max(_captureReceipt.dropReasons[reason] || 0, Math.min(500000, count));
    }
  }
  for (const field of ['validated', 'delivered', 'noConsumer', 'relayFailed']) {
    const count = Number.isFinite(Number(payload[field])) ? Math.max(0, Math.min(500000, Math.floor(Number(payload[field])))) : 0;
    _captureReceipt[field] = Math.max(_captureReceipt[field], count);
  }
  if (payload.deliveryReasons && typeof payload.deliveryReasons === 'object' && !Array.isArray(payload.deliveryReasons)) {
    for (const [reason, value] of Object.entries(payload.deliveryReasons).slice(0, 10)) {
      if (!/^[a-z][a-z0-9-]{0,40}$/.test(reason)) continue;
      const count = Number.isFinite(Number(value)) ? Math.max(0, Math.min(500000, Math.floor(Number(value)))) : 0;
      _captureReceipt.deliveryReasons[reason] = Math.max(_captureReceipt.deliveryReasons[reason] || 0, count);
    }
  }
  return captureReceiptSnapshot();
}

// ════════════════════════════════════════════════════════════════════════════
// SEARCH: not here
// ════════════════════════════════════════════════════════════════════════════

// The panel searches its own session index (src/panel/models/sessionIndex.ts, globalSearch.ts). The
// token index this worker kept (tokenizeEntry, a `search` action) had no caller, and content.js no
// longer posts every capture here for it (JSON fidelity Task 6 ruling).

// ════════════════════════════════════════════════════════════════════════════
// JSON PROCESSING: Streaming, chunked, non-blocking
// ════════════════════════════════════════════════════════════════════════════

// Safe deep clone that doesn't block (yields every N items).
//
// The WeakMap is load-bearing, not an optimisation. Without it a cyclic payload —
// which postMessage's structured-clone transport carries in perfectly happily —
// recursed forever. Because the recursion is `async`, every level is a microtask,
// so the stack never grew and NOTHING EVER THREW: the promise neither resolved nor
// rejected, self.onmessage's try/catch never ran, no reply was ever posted, and the
// caller's pending request hung for the life of the worker while the clone tree grew
// until the heap died (~4 GB in 40 s), taking every other in-flight request with it.
//
// Mapping source -> clone rather than merely recording "seen" also means an object
// referenced twice as a sibling is cloned once and shares identity in the copy,
// instead of being mistaken for a cycle.
async function safeClone(obj, yieldEvery = 1000) {
  let count = 0;
  const cloned = new WeakMap();
  
  async function clone(val) {
    count++;
    if (count % yieldEvery === 0) {
      // Yield to allow other messages to process
      await new Promise(r => setTimeout(r, 0));
    }
    
    if (val === null || val === undefined) return val;
    if (typeof val !== 'object') return val;
    if (val instanceof Date) return new Date(val);
    if (cloned.has(val)) return cloned.get(val);
    
    if (Array.isArray(val)) {
      const arr = [];
      cloned.set(val, arr);
      for (let i = 0; i < val.length; i++) {
        arr.push(await clone(val[i]));
      }
      return arr;
    }
    
    const result = {};
    cloned.set(val, result);
    const keys = Object.keys(val);
    for (let i = 0; i < keys.length; i++) {
      result[keys[i]] = await clone(val[keys[i]]);
    }
    return result;
  }
  
  return clone(obj);
}

// ════════════════════════════════════════════════════════════════════════════
// MESSAGE HANDLER
// ════════════════════════════════════════════════════════════════════════════

self.onmessage = async function(e) {
  const { id, action, payload } = e.data;

  try {
    let result;

    switch (action) {
      case 'init':
        dropLegacyCache();
        result = { ready: true };
        break;

      case 'captureReceipt':
        result = recordCaptureReceipt(payload);
        break;

      case 'getCaptureReceipt':
        result = captureReceiptSnapshot();
        break;

      case 'clone': {
        result = await safeClone(payload.data);
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    self.postMessage({ id, success: true, result });

  } catch (error) {
    const safeError = typeof error?.message === 'string' && error.message.startsWith('Unknown action:')
      ? error.message : `worker-${action}-failed`;
    self.postMessage({ id, success: false, error: safeError });
  }
};

// Signal ready
self.postMessage({ id: '__ready__', success: true, result: { worker: 'xray-worker', version: '1.0.0' } });
