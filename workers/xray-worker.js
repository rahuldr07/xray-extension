// workers/xray-worker.js — High-performance off-main-thread processing
// This worker handles ALL heavy computation to keep UI responsive
'use strict';

// ════════════════════════════════════════════════════════════════════════════
// STORAGE: IndexedDB for unlimited, persistent, fast storage
// ════════════════════════════════════════════════════════════════════════════

const DB_NAME = 'xray_db';
const DB_VERSION = 1;
let _db = null;

async function openDB() {
  if (_db) return _db;
  
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

// Safe deep clone that doesn't block (yields every N items)
async function safeClone(obj, yieldEvery = 1000) {
  let count = 0;
  
  async function clone(val) {
    count++;
    if (count % yieldEvery === 0) {
      // Yield to allow other messages to process
      await new Promise(r => setTimeout(r, 0));
    }
    
    if (val === null || val === undefined) return val;
    if (typeof val !== 'object') return val;
    if (val instanceof Date) return new Date(val);
    if (Array.isArray(val)) {
      const arr = [];
      for (let i = 0; i < val.length; i++) {
        arr.push(await clone(val[i]));
      }
      return arr;
    }
    
    const result = {};
    const keys = Object.keys(val);
    for (let i = 0; i < keys.length; i++) {
      result[keys[i]] = await clone(val[keys[i]]);
    }
    return result;
  }
  
  return clone(obj);
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

function computeDiff(a, b, path = '') {
  const diffs = [];
  
  function diff(valA, valB, p) {
    const typeA = valA === null ? 'null' : Array.isArray(valA) ? 'array' : typeof valA;
    const typeB = valB === null ? 'null' : Array.isArray(valB) ? 'array' : typeof valB;
    
    if (typeA !== typeB) {
      diffs.push({ type: 'changed', path: p, from: valA, to: valB });
      return;
    }
    
    if (typeA !== 'object' && typeA !== 'array') {
      if (valA !== valB) {
        diffs.push({ type: 'changed', path: p, from: valA, to: valB });
      }
      return;
    }
    
    if (typeA === 'array') {
      const maxLen = Math.max(valA.length, valB.length);
      for (let i = 0; i < maxLen; i++) {
        const childPath = `${p}[${i}]`;
        if (i >= valA.length) {
          diffs.push({ type: 'added', path: childPath, value: valB[i] });
        } else if (i >= valB.length) {
          diffs.push({ type: 'removed', path: childPath, value: valA[i] });
        } else {
          diff(valA[i], valB[i], childPath);
        }
      }
      return;
    }
    
    // Object
    const keysA = new Set(Object.keys(valA));
    const keysB = new Set(Object.keys(valB));
    
    for (const key of keysA) {
      const childPath = p ? `${p}.${key}` : key;
      if (!keysB.has(key)) {
        diffs.push({ type: 'removed', path: childPath, value: valA[key] });
      } else {
        diff(valA[key], valB[key], childPath);
      }
    }
    
    for (const key of keysB) {
      if (!keysA.has(key)) {
        const childPath = p ? `${p}.${key}` : key;
        diffs.push({ type: 'added', path: childPath, value: valB[key] });
      }
    }
  }
  
  diff(a, b, path);
  return diffs;
}

// ════════════════════════════════════════════════════════════════════════════
// EXPORT: Various formats
// ════════════════════════════════════════════════════════════════════════════

function exportToCSV(entries, options = {}) {
  if (!entries.length) return '';
  
  const apiEntries = entries.filter(e => e.type === 'api');
  if (!apiEntries.length) return '';
  
  const headers = ['timestamp', 'method', 'url', 'status', 'duration', 'size'];
  const rows = [headers.join(',')];
  
  for (const entry of apiEntries) {
    const row = [
      new Date(entry.timestamp).toISOString(),
      entry.method || '',
      `"${(entry.url || '').replace(/"/g, '""')}"`,
      entry.status || '',
      entry.duration || '',
      entry.size || '',
    ];
    rows.push(row.join(','));
  }
  
  return rows.join('\n');
}

function exportToHAR(entries) {
  const apiEntries = entries.filter(e => e.type === 'api');
  
  return {
    log: {
      version: '1.2',
      creator: { name: 'XRAY Extension', version: '1.0.0' },
      entries: apiEntries.map(entry => ({
        startedDateTime: new Date(entry.timestamp).toISOString(),
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
    avgDuration: apiEntries.length ? Math.round(totalDuration / apiEntries.length) : 0,
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
