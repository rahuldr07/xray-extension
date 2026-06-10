// shared/worker-client.js — Typed client for communicating with xray-worker.js
// Provides promise-based API with automatic message ID management
window.XRAY_Worker = (() => {
  'use strict';
  
  let _worker = null;
  let _ready = false;
  let _pending = new Map(); // id -> { resolve, reject }
  let _idCounter = 0;
  let _readyPromise = null;
  let _readyResolve = null;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════
  
  function init() {
    if (_worker) return _readyPromise;
    
    _readyPromise = new Promise((resolve) => {
      _readyResolve = resolve;
    });
    
    // Create worker - ONLY use chrome.runtime.getURL for proper extension context
    // Other paths cause CSP violations on sites like GitHub
    const workerUrl = chrome.runtime?.getURL?.('workers/xray-worker.js');
    
    if (!workerUrl) {
      console.warn('[XRAY Worker] chrome.runtime.getURL not available, running without worker');
      _ready = true;
      _readyResolve?.();
      return _readyPromise;
    }
    
    try {
      _worker = _createWorker(workerUrl);
    } catch (e) {
      console.warn('[XRAY Worker] Failed to create worker:', e.message);
      // Fallback: run synchronously on main thread
      _ready = true;
      _readyResolve?.();
      return _readyPromise;
    }
    
    _worker.onmessage = (e) => {
      const { id, success, result, error } = e.data;
      
      // Handle ready signal
      if (id === '__ready__') {
        _ready = true;
        _readyResolve?.();
        return;
      }
      
      // Handle response to pending request
      const handler = _pending.get(id);
      if (handler) {
        _pending.delete(id);
        if (success) {
          handler.resolve(result);
        } else {
          handler.reject(new Error(error || 'Worker error'));
        }
      }
    };
    
    _worker.onerror = (e) => {
      console.warn('[XRAY Worker] Error:', e.message);
    };
    
    // Initialize worker
    _send('init', {});
    
    return _readyPromise;
  }

  function _createWorker(workerUrl) {
    try {
      return new Worker(workerUrl);
    } catch (directError) {
      const blob = new Blob([
        `importScripts(${JSON.stringify(workerUrl)});`,
      ], { type: 'application/javascript' });
      const blobUrl = URL.createObjectURL(blob);
      try {
        return new Worker(blobUrl);
      } catch (blobError) {
        URL.revokeObjectURL(blobUrl);
        throw blobError || directError;
      }
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // MESSAGE TRANSPORT
  // ═══════════════════════════════════════════════════════════════════════════
  
  function _send(action, payload, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const id = `msg_${++_idCounter}`;
      
      // Set timeout
      const timer = setTimeout(() => {
        _pending.delete(id);
        reject(new Error(`Worker timeout: ${action}`));
      }, timeout);
      
      _pending.set(id, {
        resolve: (result) => {
          clearTimeout(timer);
          resolve(result);
        },
        reject: (error) => {
          clearTimeout(timer);
          reject(error);
        },
      });
      
      if (_worker) {
        _worker.postMessage({ id, action, payload });
      } else {
        // Fallback: execute synchronously (for when worker fails to load)
        _pending.delete(id);
        clearTimeout(timer);
        reject(new Error('Worker not available'));
      }
    });
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════════════════════
  
  return {
    /**
     * Initialize the worker. Call once at startup.
     */
    init,
    
    /**
     * Check if worker is ready
     */
    isReady() {
      return _ready;
    },
    
    /**
     * Wait for worker to be ready
     */
    async whenReady() {
      await init();
    },
    
    /**
     * Add an entry to the worker's cache and IndexedDB
     */
    async addEntry(entry) {
      if (!_worker) return { added: false };
      return _send('addEntry', { entry });
    },
    
    /**
     * Search entries using pre-indexed tokens (FAST)
     */
    async search(query, entries) {
      if (!_worker) {
        // Fallback: simple filter on main thread
        if (!query?.trim()) return entries;
        const q = query.trim().toLowerCase();
        return entries.filter(e => JSON.stringify(e).toLowerCase().includes(q));
      }
      return _send('search', { query, entries });
    },
    
    /**
     * Compute stats about a JSON object without full serialization
     */
    async computeStats(data) {
      if (!_worker) return { keyCount: 0, arrayCount: 0 };
      return _send('computeStats', { data });
    },
    
    /**
     * Compute structural diff between two objects
     */
    async computeDiff(a, b) {
      if (!_worker) return [];
      return _send('computeDiff', { a, b });
    },
    
    /**
     * Export entries to CSV format
     */
    async exportCSV(entries) {
      if (!_worker) return '';
      return _send('exportCSV', { entries });
    },
    
    /**
     * Export entries to HAR format
     */
    async exportHAR(entries) {
      if (!_worker) return { log: { entries: [] } };
      return _send('exportHAR', { entries });
    },
    
    /**
     * Analyze entries and return insights
     */
    async analyze(entries) {
      if (!_worker) return {};
      return _send('analyze', { entries });
    },
    
    /**
     * Safe deep clone that yields to prevent blocking
     */
    async clone(data) {
      if (!_worker) {
        try { return JSON.parse(JSON.stringify(data)); } catch { return null; }
      }
      return _send('clone', { data });
    },
    
    /**
     * Get entry from worker's memory cache
     */
    async getFromCache(id) {
      if (!_worker) return null;
      return _send('getFromCache', { id });
    },
    
    /**
     * Terminate the worker (cleanup)
     */
    terminate() {
      if (_worker) {
        _worker.terminate();
        _worker = null;
        _ready = false;
        _pending.clear();
      }
    },
  };
})();
