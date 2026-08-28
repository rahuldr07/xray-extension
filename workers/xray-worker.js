// workers/xray-worker.js — High-performance off-main-thread processing
// This worker handles ALL heavy computation to keep UI responsive
'use strict';

// ════════════════════════════════════════════════════════════════════════════
// STORAGE: IndexedDB for unlimited, persistent, fast storage
// ════════════════════════════════════════════════════════════════════════════

const DB_NAME = 'xray_db';
const DB_VERSION = 1;
let _db = null;

// C-11: this store used to grow without bound. Every entry, bodies included, was
// written and NOTHING was ever deleted: no retention policy, no size cap, and no
// way to clear it from the UI. On a tool that runs on every URL and keeps response
// bodies, that is an ever-growing archive of other people's traffic.
const IDB_MAX_ENTRIES = 5000;
// Pruning walks a cursor, so it is not run on every single write.
const PRUNE_EVERY = 250;
let _writesSincePrune = 0;

// C-11: the blob-worker fallback in shared/worker-client.js builds the worker from a
// `blob:` URL, and a blob worker inherits the CREATING DOCUMENT'S origin. On that
// path IndexedDB is the VISITED SITE'S database, readable by page script, so
// captured traffic from every origin would be written into whatever site the user
// happened to be on. Detect it and stay in memory instead.
function _isPageOriginWorker() {
  try {
    // An extension-origin worker reports chrome-extension:; the blob fallback does not.
    return !String(self.location?.protocol || '').startsWith('chrome-extension');
  } catch {
    return true;
  }
}

async function openDB() {
  if (_db) return _db;
  if (_isPageOriginWorker()) {
    return Promise.reject(new Error('xray: refusing to open IndexedDB on a page-origin worker'));
  }
  
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    
    req.onerror = () => reject(req.error);
    
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      
      // Entries store: all captured API calls + console logs
      if (!db.objectStoreNames.contains('entries')) {
        const store = db.createObjectStore('entries', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('url', 'url', { unique: false });
        store.createIndex('status', 'status', { unique: false });
      }
      
      // Sessions store: group entries by page session
      if (!db.objectStoreNames.contains('sessions')) {
        const store = db.createObjectStore('sessions', { keyPath: 'id' });
        store.createIndex('startTime', 'startTime', { unique: false });
      }
      
      // Search index: pre-computed search tokens
      if (!db.objectStoreNames.contains('searchIndex')) {
        const store = db.createObjectStore('searchIndex', { keyPath: 'entryId' });
        store.createIndex('token', 'tokens', { unique: false, multiEntry: true });
      }
    };
    
    req.onsuccess = () => {
      _db = req.result;
      resolve(_db);
    };
  });
}

// ════════════════════════════════════════════════════════════════════════════
// ENTRY PROCESSING: Zero-copy, lazy serialization
// ════════════════════════════════════════════════════════════════════════════

// In-memory cache for recent entries (fast access, limited size)
const MEMORY_CACHE_SIZE = 1000;
const _memoryCache = new Map();
const _cacheOrder = [];

function addToMemoryCache(entry) {
  if (_memoryCache.has(entry.id)) return;
  
  _memoryCache.set(entry.id, entry);
  _cacheOrder.push(entry.id);
  
  // Evict oldest entries when cache is full
  while (_cacheOrder.length > MEMORY_CACHE_SIZE) {
    const oldId = _cacheOrder.shift();
    _memoryCache.delete(oldId);
  }
}

function getFromMemoryCache(id) {
  return _memoryCache.get(id) || null;
}

// Deletes oldest-first via the timestamp index until the store is back under the cap.
function pruneStoredEntries(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('entries', 'readwrite');
    const store = tx.objectStore('entries');
    const countReq = store.count();
    countReq.onerror = () => reject(countReq.error);
    countReq.onsuccess = () => {
      let excess = countReq.result - IDB_MAX_ENTRIES;
      if (excess <= 0) { resolve(0); return; }
      const removed = excess;
      const cursorReq = store.index('timestamp').openCursor();
      cursorReq.onerror = () => reject(cursorReq.error);
      cursorReq.onsuccess = (event) => {
        const cursor = event.target.result;
        if (!cursor || excess <= 0) { resolve(removed); return; }
        cursor.delete();
        excess -= 1;
        cursor.continue();
      };
    };
  });
}

// C-11 also noted there was no "clear" control at all. This backs one.
function clearStoredEntries(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['entries', 'searchIndex'], 'readwrite');
    tx.objectStore('entries').clear();
    tx.objectStore('searchIndex').clear();
    tx.oncomplete = () => resolve({ cleared: true });
    tx.onerror = () => reject(tx.error);
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SEARCH: Pre-indexed, incremental, blazing fast
// ════════════════════════════════════════════════════════════════════════════

// Tokenize entry for search (computed once, stored in index)
function tokenizeEntry(entry) {
  const tokens = new Set();
  
  if (entry.type === 'api') {
    // URL tokens
    if (entry.url) {
      const url = entry.url.toLowerCase();
      tokens.add(url);
      // Extract path segments
      try {
        const parsed = new URL(entry.url);
        parsed.pathname.split('/').filter(Boolean).forEach(seg => tokens.add(seg.toLowerCase()));
      } catch {}
    }
    
    // Method
    if (entry.method) tokens.add(entry.method.toLowerCase());
    
    // Status
    if (entry.status) tokens.add(String(entry.status));
    
    // Response keys (first 2 levels only - fast)
    if (entry.responseDecrypted) {
      extractKeys(entry.responseDecrypted, tokens, 0, 2);
    }
    
    // Request body keys
    if (entry.requestBody) {
      extractKeys(entry.requestBody, tokens, 0, 2);
    }
  } else if (entry.type === 'log') {
    if (entry.logLevel) tokens.add(entry.logLevel);
    if (entry.logData) {
      extractKeys(entry.logData, tokens, 0, 2);
      // For strings, add words
      if (typeof entry.logData === 'string') {
        entry.logData.toLowerCase().split(/\s+/).filter(w => w.length > 2).forEach(w => tokens.add(w));
      }
    }
  }
  
  return Array.from(tokens);
}

function extractKeys(obj, tokens, depth, maxDepth) {
  if (depth >= maxDepth || obj === null || typeof obj !== 'object') return;
  
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length && i < 50; i++) {
    const key = keys[i];
    tokens.add(key.toLowerCase());
    extractKeys(obj[key], tokens, depth + 1, maxDepth);
  }
}

// Fast search using pre-computed tokens
function searchEntries(query, entries) {
  if (!query || !query.trim()) return entries;
  
  const q = query.trim().toLowerCase();
  const queryTokens = q.split(/\s+/).filter(Boolean);
  
  return entries.filter(entry => {
    const entryTokens = entry._searchTokens || tokenizeEntry(entry);
    return queryTokens.every(qt => 
      entryTokens.some(et => et.includes(qt))
    );
  });
}

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
// until the heap died (~4 GB in 40 s), taking every other in-flight request and the
// in-memory entry cache with it.
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

// Snapshot a value with circular references replaced by a marker, so a diff entry
// can always be serialised by whatever consumes it. Ancestors are tracked along the
// CURRENT BRANCH and removed on the way back up: an object referenced twice as a
// sibling is a legitimate repeat, not a cycle, and must not be reported as one.
function cycleSafe(value, ancestors, depth, maxDepth) {
  if (value === null || typeof value !== 'object') return value;
  if (ancestors.has(value)) return '[Circular]';
  if (depth > maxDepth) return '[Max depth]';
  if (value instanceof Date) return new Date(value);
  
  ancestors.add(value);
  let out;
  if (Array.isArray(value)) {
    out = [];
    for (const item of value) out.push(cycleSafe(item, ancestors, depth + 1, maxDepth));
  } else {
    out = {};
    for (const key of Object.keys(value)) out[key] = cycleSafe(value[key], ancestors, depth + 1, maxDepth);
  }
  ancestors.delete(value);
  return out;
}

function diffValue(value) {
  return cycleSafe(value, new Set(), 0, 20);
}

// Compute JSON stats without full serialization
function computeStats(obj, maxDepth = 10) {
  let keyCount = 0;
  let arrayCount = 0;
  let stringLength = 0;
  let maxStringLen = 0;
  let depth = 0;
  
  function walk(val, d) {
    if (d > maxDepth) return;
    depth = Math.max(depth, d);
    
    if (val === null || val === undefined || typeof val !== 'object') {
      if (typeof val === 'string') {
        stringLength += val.length;
        maxStringLen = Math.max(maxStringLen, val.length);
      }
      return;
    }
    
    if (Array.isArray(val)) {
      arrayCount++;
      for (let i = 0; i < val.length && i < 1000; i++) {
        walk(val[i], d + 1);
      }
    } else {
      const keys = Object.keys(val);
      keyCount += keys.length;
      for (let i = 0; i < keys.length && i < 100; i++) {
        walk(val[keys[i]], d + 1);
      }
    }
  }
  
  walk(obj, 0);
  
  return { keyCount, arrayCount, stringLength, maxStringLen, depth };
}

// ════════════════════════════════════════════════════════════════════════════
// DIFF: Structural diff between two objects
// ════════════════════════════════════════════════════════════════════════════

// maxDepth bounds the recursion. Without it a cyclic input recursed until
// RangeError. That was contained — self.onmessage's try/catch caught it and posted
// {success:false}, so the worker survived — but the caller lost the whole diff. The
// asymmetric case was worse: a cycle on ONE side only did not throw here at all, it
// emitted the raw cyclic node as a diff `value`, which then threw in any consumer
// that JSON.stringify'd the result. Every emitted value now goes through diffValue.
function computeDiff(a, b, path = '', maxDepth = 50) {
  const diffs = [];
  // Ancestors along the current branch, per side. When BOTH sides revisit an
  // ancestor at the same point they are the same cycle and there is nothing to
  // report; when only one does, that asymmetry is the real difference. Without
  // this, two structurally identical self-referencing objects diffed to 50 levels
  // of `self.self.self…` before hitting the cap — a wrong answer, just a bounded one.
  const branchA = new Set();
  const branchB = new Set();
  
  function diff(valA, valB, p, depth = 0) {
    const cycleA = valA !== null && typeof valA === 'object' && branchA.has(valA);
    const cycleB = valB !== null && typeof valB === 'object' && branchB.has(valB);
    if (cycleA && cycleB) return;
    if (cycleA || cycleB) {
      diffs.push({ type: 'changed', path: p, from: diffValue(valA), to: diffValue(valB) });
      return;
    }
    if (depth > maxDepth) {
      diffs.push({ type: 'changed', path: p, from: '[Max depth]', to: '[Max depth]' });
      return;
    }
    const typeA = valA === null ? 'null' : Array.isArray(valA) ? 'array' : typeof valA;
    const typeB = valB === null ? 'null' : Array.isArray(valB) ? 'array' : typeof valB;
    
    if (typeA !== typeB) {
      diffs.push({ type: 'changed', path: p, from: diffValue(valA), to: diffValue(valB) });
      return;
    }
    
    if (typeA !== 'object' && typeA !== 'array') {
      if (valA !== valB) {
        diffs.push({ type: 'changed', path: p, from: diffValue(valA), to: diffValue(valB) });
      }
      return;
    }
    
    if (typeA === 'array') {
      branchA.add(valA); branchB.add(valB);
      const maxLen = Math.max(valA.length, valB.length);
      for (let i = 0; i < maxLen; i++) {
        const childPath = `${p}[${i}]`;
        if (i >= valA.length) {
          diffs.push({ type: 'added', path: childPath, value: diffValue(valB[i]) });
        } else if (i >= valB.length) {
          diffs.push({ type: 'removed', path: childPath, value: diffValue(valA[i]) });
        } else {
          diff(valA[i], valB[i], childPath, depth + 1);
        }
      }
      branchA.delete(valA); branchB.delete(valB);
      return;
    }
    
    // Object
    branchA.add(valA); branchB.add(valB);
    const keysA = new Set(Object.keys(valA));
    const keysB = new Set(Object.keys(valB));
    
    for (const key of keysA) {
      const childPath = p ? `${p}.${key}` : key;
      if (!keysB.has(key)) {
        diffs.push({ type: 'removed', path: childPath, value: diffValue(valA[key]) });
      } else {
        diff(valA[key], valB[key], childPath, depth + 1);
      }
    }
    
    for (const key of keysB) {
      if (!keysA.has(key)) {
        const childPath = p ? `${p}.${key}` : key;
        diffs.push({ type: 'added', path: childPath, value: diffValue(valB[key]) });
      }
    }
    branchA.delete(valA); branchB.delete(valB);
  }
  
  diff(a, b, path);
  return diffs;
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

function gridRows(value) {
  const rows = Array.isArray(value)
    ? value
    : value && typeof value === 'object'
      ? Object.values(value).find(Array.isArray) || [value]
      : [];
  const objects = rows
    .filter((row) => row && typeof row === 'object' && !Array.isArray(row))
    .slice(0, 200);
  const columns = Array.from(objects.reduce((set, row) => {
    Object.keys(row).slice(0, 20).forEach((key) => set.add(key));
    return set;
  }, new Set()));
  return { objects, columns };
}

function detailAnalysis(current, previous = null) {
  const started = performance.now();
  const currentSchema = inferSchema(current);
  const previousSchema = previous == null ? null : inferSchema(previous);
  return {
    schema: currentSchema,
    diff: previous == null ? null : {
      previous,
      current,
      previousSchema,
      currentSchema,
      structuralDiff: computeDiff(previous, current).slice(0, 500),
    },
    grid: gridRows(current),
    viz: {
      inferredType: currentSchema,
      rows: Array.isArray(current) ? current.length : current && typeof current === 'object' ? 1 : 0,
    },
    stats: computeStats(current),
    durationMs: Math.round((performance.now() - started) * 100) / 100,
    engine: 'worker-js',
  };
}

// ════════════════════════════════════════════════════════════════════════════
// EXPORT: Various formats
// ════════════════════════════════════════════════════════════════════════════

// A cell a spreadsheet will evaluate as a formula. Excel, Sheets and LibreOffice
// strip RFC4180 quoting BEFORE evaluating, so quoting is not a defence — the value
// has to stop looking like a formula, which is what the leading apostrophe does.
// Plain numbers are exempt so a negative duration stays a number, not text.
const CSV_FORMULA_LEAD = /^[=+\-@\t\r]/;
const CSV_PLAIN_NUMBER = /^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/;
const CSV_MUST_QUOTE = /[",\n\r]/;

// Kept deliberately identical to toCSV's cell handling in shared/console-helpers.js.
// They are separate runtimes and cannot share a module, but they are the extension's
// two CSV writers and the same value must round-trip to the same bytes through both.
function csvText(value) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value;
  try {
    const json = JSON.stringify(value);
    return json === undefined ? String(value) : json;
  } catch {
    return String(value);
  }
}

function escapeCSV(value) {
  let text = csvText(value);
  if (CSV_FORMULA_LEAD.test(text) && !CSV_PLAIN_NUMBER.test(text)) text = `'${text}`;
  return CSV_MUST_QUOTE.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// #15: one unparseable timestamp used to throw RangeError out of the entire export,
// discarding every good entry with it, while every other column had a fallback.
function isoTimestamp(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

function exportToCSV(entries) {
  if (!Array.isArray(entries) || !entries.length) return '';
  
  const apiEntries = entries.filter(e => e.type === 'api');
  if (!apiEntries.length) return '';
  
  const headers = ['timestamp', 'method', 'url', 'status', 'duration', 'size'];
  const rows = [headers.map(escapeCSV).join(',')];
  
  for (const entry of apiEntries) {
    rows.push([
      isoTimestamp(entry.timestamp),
      entry.method || '',
      entry.url || '',
      entry.status || '',
      entry.duration || '',
      entry.size || '',
    ].map(escapeCSV).join(','));
  }
  
  return rows.join('\n');
}

function exportToHAR(entries) {
  const apiEntries = (Array.isArray(entries) ? entries : []).filter(e => e && e.type === 'api');
  
  return {
    log: {
      version: '1.2',
      creator: { name: 'XRAY Extension', version: '1.0.0' },
      entries: apiEntries.map(entry => ({
        startedDateTime: isoTimestamp(entry.timestamp),
        time: entry.duration || 0,
        request: {
          method: entry.method || 'GET',
          url: entry.url || '',
          headers: Object.entries(entry.requestHeaders || {}).map(([k, v]) => ({ name: k, value: v })),
          postData: entry.requestBody ? { mimeType: 'application/json', text: JSON.stringify(entry.requestBody) } : undefined,
        },
        response: {
          status: entry.status || 0,
          statusText: '',
          headers: Object.entries(entry.responseHeaders || {}).map(([k, v]) => ({ name: k, value: v })),
          content: {
            size: entry.size || 0,
            mimeType: 'application/json',
            text: entry.responseRaw || '',
          },
        },
        timings: { wait: entry.duration || 0, receive: 0 },
      })),
    },
  };
}

// ════════════════════════════════════════════════════════════════════════════
// ANALYTICS: Pattern detection, insights
// ════════════════════════════════════════════════════════════════════════════

function analyzeEntries(entries) {
  const apiEntries = entries.filter(e => e.type === 'api');
  const logEntries = entries.filter(e => e.type === 'log');
  
  // Endpoint frequency
  const endpointCounts = {};
  const statusCounts = { success: 0, clientError: 0, serverError: 0 };
  let totalDuration = 0;
  let timedRequests = 0;
  let slowestEntry = null;
  
  for (const entry of apiEntries) {
    // Count endpoints
    const endpoint = `${entry.method} ${entry.urlPath || entry.url}`;
    endpointCounts[endpoint] = (endpointCounts[endpoint] || 0) + 1;
    
    // Status distribution
    const status = entry.status || 0;
    if (status >= 200 && status < 400) statusCounts.success++;
    else if (status >= 400 && status < 500) statusCounts.clientError++;
    else if (status >= 500) statusCounts.serverError++;
    
    // Duration tracking
    if (entry.duration) {
      totalDuration += entry.duration;
      timedRequests += 1;
      if (!slowestEntry || entry.duration > slowestEntry.duration) {
        slowestEntry = entry;
      }
    }
  }
  
  // Log level distribution
  const logLevels = { log: 0, warn: 0, error: 0 };
  for (const entry of logEntries) {
    if (entry.logLevel in logLevels) {
      logLevels[entry.logLevel]++;
    }
  }
  
  // Top endpoints
  const topEndpoints = Object.entries(endpointCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([endpoint, count]) => ({ endpoint, count }));
  
  return {
    totalRequests: apiEntries.length,
    totalLogs: logEntries.length,
    // Divided by the number of TIMED requests, not every request: three requests
    // where only one carries a 100ms duration averaged to 33ms before this.
    avgDuration: timedRequests ? Math.round(totalDuration / timedRequests) : 0,
    slowestEntry: slowestEntry ? { id: slowestEntry.id, url: slowestEntry.url, duration: slowestEntry.duration } : null,
    statusCounts,
    logLevels,
    topEndpoints,
  };
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
        await openDB();
        result = { ready: true };
        break;
        
      case 'addEntry': {
        const entry = payload.entry;
        // Pre-compute search tokens
        entry._searchTokens = tokenizeEntry(entry);
        // Add to memory cache
        addToMemoryCache(entry);
        // Store in IndexedDB (async, don't wait)
        openDB().then(db => {
          const tx = db.transaction('entries', 'readwrite');
          tx.objectStore('entries').put(entry);
          _writesSincePrune += 1;
          if (_writesSincePrune >= PRUNE_EVERY) {
            _writesSincePrune = 0;
            pruneStoredEntries(db).catch(() => {});
          }
        }).catch(() => {});
        result = { added: true };
        break;
      }
      
      case 'search': {
        const { query, entries } = payload;
        result = searchEntries(query, entries);
        break;
      }
      
      case 'computeStats': {
        result = computeStats(payload.data);
        break;
      }
      
      case 'computeDiff': {
        const { a, b } = payload;
        result = computeDiff(a, b);
        break;
      }

      case 'inferSchema': {
        result = inferSchema(payload.data);
        break;
      }

      case 'detailAnalysis': {
        result = detailAnalysis(payload.current, payload.previous);
        break;
      }
      
      case 'exportCSV': {
        result = exportToCSV(payload.entries);
        break;
      }
      
      case 'exportHAR': {
        result = exportToHAR(payload.entries);
        break;
      }
      
      case 'analyze': {
        result = analyzeEntries(payload.entries);
        break;
      }
      
      case 'clone': {
        result = await safeClone(payload.data);
        break;
      }
      
      case 'clearStored': {
        const db = await openDB();
        result = await clearStoredEntries(db);
        break;
      }

      case 'pruneStored': {
        const db = await openDB();
        result = { removed: await pruneStoredEntries(db) };
        break;
      }

      case 'getFromCache': {
        result = getFromMemoryCache(payload.id);
        break;
      }
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    self.postMessage({ id, success: true, result });
    
  } catch (error) {
    self.postMessage({ id, success: false, error: error.message });
  }
};

// Signal ready
self.postMessage({ id: '__ready__', success: true, result: { worker: 'xray-worker', version: '1.0.0' } });
