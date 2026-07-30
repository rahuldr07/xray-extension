// content/console-capture.js — High-performance console hijack (MAIN world)
// 
// PERFORMANCE OPTIMIZATIONS:
// 1. Zero-copy for primitives - pass by value, no serialization
// 2. Lazy serialization - only serialize when panel requests it
// 3. WeakRef storage - allows GC to reclaim large objects
// 4. Batched emission - group rapid logs into single postMessage
// 5. Circular reference safe - handles self-referential objects
//
(function () {
  'use strict';

  if (window.__xray_console_installed__) return;
  window.__xray_console_installed__ = true;

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════════
  
  const BATCH_DELAY_MS = 16;      // ~1 frame, batches rapid logs
  const MAX_STRING_PREVIEW = 500; // Truncate long strings in preview
  const MAX_ARRAY_PREVIEW = 10;   // Show first N array items in preview
  const MAX_KEYS_PREVIEW = 20;    // Show first N object keys in preview
  const MAX_DEPTH = 3;            // Max depth for preview serialization

  // ═══════════════════════════════════════════════════════════════════════════
  // STORAGE: Keep references to original objects for lazy access
  // ═══════════════════════════════════════════════════════════════════════════
  
  const _objectStore = new Map();  // id -> { weakRef, fallbackPreview }
  let _idCounter = 0;
  const _bridgeToken = window.__XRAY_BRIDGE_TOKEN__ || _uid();
  try { Object.defineProperty(window, '__XRAY_BRIDGE_TOKEN__', { value: _bridgeToken, configurable: false, writable: false }); } catch { window.__XRAY_BRIDGE_TOKEN__ = _bridgeToken; }
  window.postMessage({ __xray_bridge_ready__: true, token: _bridgeToken }, '*');

  function _uid() {
    return 'xrl_' + (++_idCounter).toString(36) + '_' + (Date.now() % 100000).toString(36);
  }

  function _storeObject(obj, fallbackPreview) {
    const id = _uid();
    try {
      // Store WeakRef so GC can still reclaim if needed. The caller passes the
      // preview it already computed so each logged object is walked only once.
      _objectStore.set(id, {
        ref: typeof WeakRef !== 'undefined' ? new WeakRef(obj) : null,
        fallback: fallbackPreview !== undefined ? fallbackPreview : _createPreview(obj, 0),
      });
    } catch {
      _objectStore.set(id, { ref: null, fallback: String(obj) });
    }
    // Trim opportunistically instead of letting a log storm hold thousands of
    // previews until the 60s sweep.
    if (_objectStore.size > 600) {
      const keys = Array.from(_objectStore.keys());
      keys.slice(0, keys.length - 500).forEach((key) => _objectStore.delete(key));
    }
    return id;
  }

  // The emitted preview carries __xray_ref__ for lazy loading, but the stored
  // fallback must stay clean — clone the top level before tagging.
  function _tagPreview(preview, refId) {
    if (preview === null || typeof preview !== 'object') return preview;
    const tagged = Array.isArray(preview) ? preview.slice() : Object.assign({}, preview);
    tagged.__xray_ref__ = refId;
    return tagged;
  }

  // Expose for panel to retrieve full object
  window.__XRAY_getLogObject__ = function(id) {
    const stored = _objectStore.get(id);
    if (!stored) return null;
    
    // Try to get from WeakRef first
    if (stored.ref) {
      const obj = stored.ref.deref();
      if (obj !== undefined) {
        return _safeCopy(obj);
      }
    }
    
    // Fall back to preview
    return stored.fallback;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // PREVIEW: Create lightweight preview without full serialization
  // ═══════════════════════════════════════════════════════════════════════════

  function _createPreview(val, depth) {
    if (depth > MAX_DEPTH) return '[...]';
    
    if (val === null) return null;
    if (val === undefined) return undefined;
    
    const type = typeof val;
    
    // Primitives: pass through
    if (type === 'string') {
      return val.length > MAX_STRING_PREVIEW 
        ? val.slice(0, MAX_STRING_PREVIEW) + `... (${val.length} chars)`
        : val;
    }
    if (type === 'number' || type === 'boolean') return val;
    if (type === 'bigint') return val.toString() + 'n';
    if (type === 'symbol') return val.toString();
    if (type === 'function') return `[Function: ${val.name || 'anonymous'}]`;
    
    // DOM elements
    if (val instanceof Element) {
      const tag = val.tagName.toLowerCase();
      const id = val.id ? `#${val.id}` : '';
      const cls = val.className ? `.${val.className.split(' ')[0]}` : '';
      return `<${tag}${id}${cls}>`;
    }
    
    // Error objects
    if (val instanceof Error) {
      return { __type__: 'Error', name: val.name, message: val.message, stack: val.stack?.slice(0, 500) };
    }
    
    // Date objects
    if (val instanceof Date) {
      return { __type__: 'Date', iso: val.toISOString() };
    }
    
    // Arrays: preview first N items
    if (Array.isArray(val)) {
      const preview = val.slice(0, MAX_ARRAY_PREVIEW).map(v => _createPreview(v, depth + 1));
      if (val.length > MAX_ARRAY_PREVIEW) {
        preview.push(`... +${val.length - MAX_ARRAY_PREVIEW} more`);
      }
      return preview;
    }
    
    // Objects: preview first N keys
    if (type === 'object') {
      const keys = Object.keys(val);
      const preview = {};
      
      // Add type hint for special objects
      const constructor = val.constructor?.name;
      if (constructor && constructor !== 'Object') {
        preview.__type__ = constructor;
      }
      
      for (let i = 0; i < keys.length && i < MAX_KEYS_PREVIEW; i++) {
        const key = keys[i];
        try {
          preview[key] = _createPreview(val[key], depth + 1);
        } catch {
          preview[key] = '[Error accessing property]';
        }
      }
      
      if (keys.length > MAX_KEYS_PREVIEW) {
        preview['...'] = `+${keys.length - MAX_KEYS_PREVIEW} more keys`;
      }
      
      return preview;
    }
    
    return String(val);
  }

  // Safe copy for when panel requests full object
  function _safeCopy(val, seen = new WeakSet()) {
    if (val === null || val === undefined) return val;
    
    const type = typeof val;
    if (type !== 'object' && type !== 'function') return val;
    if (type === 'function') return `[Function: ${val.name || 'anonymous'}]`;
    
    // Circular reference check
    if (seen.has(val)) return '[Circular]';
    seen.add(val);
    
    // DOM elements - don't try to copy
    if (val instanceof Element) return _createPreview(val, 0);
    
    // Error, Date
    if (val instanceof Error) return { __type__: 'Error', name: val.name, message: val.message, stack: val.stack };
    if (val instanceof Date) return { __type__: 'Date', iso: val.toISOString() };
    
    // Arrays
    if (Array.isArray(val)) {
      return val.map(v => _safeCopy(v, seen));
    }
    
    // Objects
    const copy = {};
    const constructor = val.constructor?.name;
    if (constructor && constructor !== 'Object') {
      copy.__type__ = constructor;
    }
    
    for (const key of Object.keys(val)) {
      try {
        copy[key] = _safeCopy(val[key], seen);
      } catch {
        copy[key] = '[Error copying]';
      }
    }
    
    return copy;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BATCHING: Collect rapid logs and emit together
  // ═══════════════════════════════════════════════════════════════════════════

  let _batch = [];
  let _batchTimer = null;

  function _flushBatch() {
    if (_batch.length === 0) return;
    
    const entries = _batch;
    _batch = [];
    _batchTimer = null;
    
    // Single postMessage for all batched logs
    window.postMessage({ 
      __xray_capture__: true, 
      token: _bridgeToken,
      batch: true,
      entries: entries 
    }, '*');
  }

  function _emit(level, args) {
    const id = _uid();
    let data;
    let objectRefs = [];
    
    if (args.length === 0) {
      data = null;
    } else if (args.length === 1) {
      const arg = args[0];
      if (arg === null || arg === undefined || typeof arg !== 'object') {
        // Primitives: direct value
        data = arg;
      } else {
        // Objects: one preview walk shared between the emitted data and the
        // stored fallback (this runs for every console.log on every page).
        const preview = _createPreview(arg, 0);
        const refId = _storeObject(arg, preview);
        objectRefs.push(refId);
        data = _tagPreview(preview, refId);
      }
    } else {
      // Multiple args
      data = args.map(arg => {
        if (arg === null || arg === undefined || typeof arg !== 'object') {
          return arg;
        }
        const preview = _createPreview(arg, 0);
        const refId = _storeObject(arg, preview);
        objectRefs.push(refId);
        return _tagPreview(preview, refId);
      });
    }

    const entry = {
      id,
      type: 'log',
      timestamp: Date.now(),
      logLevel: level,
      logData: data,
      objectRefs,
      pinned: false,
    };

    // Add to batch
    _batch.push(entry);
    
    // Schedule flush
    if (!_batchTimer) {
      _batchTimer = setTimeout(_flushBatch, BATCH_DELAY_MS);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HIJACK: Wrap console methods
  // ═══════════════════════════════════════════════════════════════════════════

  const _original = {};
  
  ['log', 'warn', 'error', 'info', 'debug'].forEach(level => {
    _original[level] = console[level].bind(console);
    
    console[level] = function (...args) {
      _original[level](...args);
      try { 
        _emit(level === 'info' ? 'log' : level === 'debug' ? 'log' : level, args); 
      } catch { 
        /* never crash the page */ 
      }
    };
  });

  // Also capture console.table, console.dir
  _original.table = console.table?.bind(console);
  _original.dir = console.dir?.bind(console);
  
  if (_original.table) {
    console.table = function (data, columns) {
      _original.table(data, columns);
      try { _emit('log', [{ __type__: 'table', data, columns }]); } catch {}
    };
  }
  
  if (_original.dir) {
    console.dir = function (obj, options) {
      _original.dir(obj, options);
      try { _emit('log', [obj]); } catch {}
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MESSAGE HANDLER: Respond to requests for full object data
  // ═══════════════════════════════════════════════════════════════════════════

  window.addEventListener('message', (e) => {
    if (!e.data?.__xray_fetch_object__) return;
    if (e.data.token !== _bridgeToken) return;
    
    const { msgId, refId } = e.data;
    const data = window.__XRAY_getLogObject__(refId);
    
    window.postMessage({
      __xray_fetch_response__: true,
      token: _bridgeToken,
      msgId,
      data,
    }, '*');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CLEANUP: Periodically clean up old object references
  // ═══════════════════════════════════════════════════════════════════════════

  setInterval(() => {
    // Keep only last 500 object refs
    if (_objectStore.size > 500) {
      const keys = Array.from(_objectStore.keys());
      const toDelete = keys.slice(0, keys.length - 500);
      toDelete.forEach(k => _objectStore.delete(k));
    }
  }, 60000); // Every minute

})();
