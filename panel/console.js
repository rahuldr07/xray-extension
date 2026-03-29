// panel/console.js — XRAY Console Engine
// Notebook-style REPL with persistent scope, async support, and smart context.

window.XRAY_Console = (() => {
  'use strict';

  const STORAGE_KEY = 'xray_console_history';
  const MAX_HISTORY = 100;

  // State
  let _history = [];
  let _historyIndex = -1;
  let _currentEntry = null;
  let _pins = {};
  let _scope = {};
  let _evalId = 0;
  let _pendingEvals = new Map();

  // ── Init ────────────────────────────────────────────────────────────────────
  function init() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) _history = JSON.parse(raw);
    } catch (e) {}
    
    // Listen for eval results from MAIN world
    window.addEventListener('message', (e) => {
      if (e.data?.type !== 'XRAY_EVAL_RESULT') return;
      const { id, success, resultType, result, error } = e.data;
      const resolver = _pendingEvals.get(id);
      if (!resolver) return;
      _pendingEvals.delete(id);
      
      if (success) {
        resolver.resolve({ type: resultType, result });
      } else {
        resolver.resolve({ type: 'error', error });
      }
    });
  }

  // ── Context ─────────────────────────────────────────────────────────────────
  function setContext(entry) {
    _currentEntry = entry || null;
  }

  function getContext() {
    return _currentEntry;
  }

  function getContextSummary() {
    if (!_currentEntry) return null;
    const e = _currentEntry;
    return {
      method: e.method || 'GET',
      url: e.urlPath || e.url || '(unknown)',
      status: e.status || 0,
      duration: e.duration || 0,
    };
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function _parseBody(body) {
    if (!body) return null;
    if (typeof body === 'object') return body;
    if (typeof body === 'string') {
      const t = body.trim();
      if (t.startsWith('{') || t.startsWith('[')) {
        try { return JSON.parse(t); } catch {}
      }
    }
    return body;
  }

  function _copy(val) {
    const text = typeof val === 'string' ? val : JSON.stringify(val, null, 2);
    navigator.clipboard.writeText(text);
    return `✓ Copied ${text.length} chars`;
  }

  function _pin(name) {
    if (!_currentEntry) return '✗ No request selected';
    if (!name || typeof name !== 'string') return '✗ Usage: pin("name")';
    _pins[name] = _currentEntry;
    return `✓ Pinned as $${name}`;
  }

  function _assert(condition, message) {
    return { __xr_assert__: true, pass: !!condition, message: message || (condition ? 'Pass' : 'Fail') };
  }

  function _generateCurl(entry) {
    if (!entry) return '// No entry';
    let cmd = `curl '${entry.url}' \\\n  -X ${entry.method || 'GET'}`;
    if (entry.requestHeaders) {
      for (const [k, v] of Object.entries(entry.requestHeaders)) {
        cmd += ` \\\n  -H '${k}: ${v}'`;
      }
    }
    if (entry.requestBody) {
      const b = typeof entry.requestBody === 'string' ? entry.requestBody : JSON.stringify(entry.requestBody);
      cmd += ` \\\n  --data-raw '${b.replace(/'/g, "'\\''")}'`;
    }
    return cmd;
  }

  function _generateFetch(entry) {
    if (!entry) return '// No entry';
    const opts = { method: entry.method || 'GET', headers: entry.requestHeaders || {} };
    if (entry.requestBody && opts.method !== 'GET' && opts.method !== 'HEAD') {
      opts.body = typeof entry.requestBody === 'string' ? entry.requestBody : JSON.stringify(entry.requestBody);
    }
    return `fetch('${entry.url}', ${JSON.stringify(opts, null, 2)})`;
  }

  // Lodash-lite
  const _ = {
    map: (arr, fn) => Array.isArray(arr) ? arr.map(fn) : [],
    filter: (arr, fn) => Array.isArray(arr) ? arr.filter(fn) : [],
    find: (arr, fn) => Array.isArray(arr) ? arr.find(fn) : undefined,
    pluck: (arr, key) => Array.isArray(arr) ? arr.map(i => i?.[key]) : [],
    groupBy: (arr, key) => {
      if (!Array.isArray(arr)) return {};
      return arr.reduce((acc, item) => {
        const k = typeof key === 'function' ? key(item) : item?.[key];
        (acc[k] = acc[k] || []).push(item);
        return acc;
      }, {});
    },
    uniq: (arr) => [...new Set(arr)],
    sortBy: (arr, key) => {
      if (!Array.isArray(arr)) return [];
      return [...arr].sort((a, b) => {
        const va = typeof key === 'function' ? key(a) : a?.[key];
        const vb = typeof key === 'function' ? key(b) : b?.[key];
        return va < vb ? -1 : va > vb ? 1 : 0;
      });
    },
    sum: (arr, key) => {
      if (!Array.isArray(arr)) return 0;
      return arr.reduce((s, i) => s + (Number(key ? (typeof key === 'function' ? key(i) : i?.[key]) : i) || 0), 0);
    },
  };

  // ── Utils ───────────────────────────────────────────────────────────────────
  function _toCSV(arr) {
    if (!Array.isArray(arr) || !arr.length) return '';
    const keys = Object.keys(arr[0] || {});
    const header = keys.join(',');
    const rows = arr.map(item => keys.map(k => {
      const v = item[k];
      return typeof v === 'string' && (v.includes(',') || v.includes('"')) 
        ? `"${v.replace(/"/g, '""')}"` : v ?? '';
    }).join(','));
    return [header, ...rows].join('\n');
  }
  function _toTable(arr) { return { __xr_render: 'table', data: arr }; }
  function _diff(a, b) {
    const result = { added: {}, removed: {}, changed: {} };
    const aKeys = new Set(Object.keys(a || {}));
    const bKeys = new Set(Object.keys(b || {}));
    for (const k of bKeys) if (!aKeys.has(k)) result.added[k] = b[k];
    for (const k of aKeys) {
      if (!bKeys.has(k)) result.removed[k] = a[k];
      else if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) result.changed[k] = { from: a[k], to: b[k] };
    }
    return result;
  }
  function _schema(obj, depth = 0) {
    if (depth > 5) return 'any';
    if (obj === null) return 'null';
    if (Array.isArray(obj)) return obj.length ? [_schema(obj[0], depth + 1)] : 'array';
    if (typeof obj === 'object') {
      const s = {};
      for (const [k, v] of Object.entries(obj)) s[k] = _schema(v, depth + 1);
      return s;
    }
    return typeof obj;
  }
  function _parseUrl(url) {
    if (!url) return null;
    try { const u = new URL(url); return { full: url, host: u.host, path: u.pathname, query: u.search }; } catch { return null; }
  }
  function _parseParams(url) {
    if (!url) return {};
    try { const u = new URL(url); return Object.fromEntries(u.searchParams); } catch { return {}; }
  }

  // ── Execution ───────────────────────────────────────────────────────────────
  async function execute(code) {
    const trimmed = (code || '').trim();
    if (!trimmed) return { type: 'empty' };

    // History (dedupe consecutive)
    if (_history[0] !== trimmed) {
      _history.unshift(trimmed);
      if (_history.length > MAX_HISTORY) _history.pop();
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(_history)); } catch {}
    }
    _historyIndex = -1;

    // Build context
    const allEntries = () => window.XRAY_Panel?.getEntries?.() || [];
    const currentIdx = _currentEntry ? allEntries().findIndex(e => e.id === _currentEntry.id) : -1;
    
    const ctx = {
      $r: _currentEntry,
      $res: _parseBody(_currentEntry?.responseDecrypted || _currentEntry?.responseRaw),
      $req: _parseBody(_currentEntry?.requestBody),
      $h: _currentEntry?.responseHeaders || {},
      $rh: _currentEntry?.requestHeaders || {},
      $url: _parseUrl(_currentEntry?.url),
      $params: _parseParams(_currentEntry?.url),
      $status: _currentEntry?.status || 0,
      $time: _currentEntry?.duration || 0,
      $size: _currentEntry?.size || 0,
      $method: (_currentEntry?.method || 'GET').toUpperCase(),
      $all: allEntries,
      $similar: () => allEntries().filter(e => e.urlPath === _currentEntry?.urlPath && e.id !== _currentEntry?.id),
      $prev: () => currentIdx > 0 ? allEntries()[currentIdx - 1] : null,
      $next: () => currentIdx >= 0 && currentIdx < allEntries().length - 1 ? allEntries()[currentIdx + 1] : null,
      copy: _copy,
      pin: _pin,
      assert: _assert,
      toCSV: _toCSV,
      toTable: _toTable,
      diff: _diff,
      schema: _schema,
      pick: (obj, keys) => keys.reduce((acc, k) => (k in (obj || {}) && (acc[k] = obj[k]), acc), {}),
      omit: (obj, keys) => Object.fromEntries(Object.entries(obj || {}).filter(([k]) => !keys.includes(k))),
      flatten: (obj, prefix = '') => {
        const result = {};
        for (const [k, v] of Object.entries(obj || {})) {
          const key = prefix ? `${prefix}.${k}` : k;
          if (v && typeof v === 'object' && !Array.isArray(v)) Object.assign(result, ctx.flatten(v, key));
          else result[key] = v;
        }
        return result;
      },
      _: _,
      ..._scope,
      ..._pins,
    };

    // Lazy getters
    if (_currentEntry) {
      Object.defineProperty(ctx, '$curl', { get: () => _generateCurl(_currentEntry), enumerable: true });
      Object.defineProperty(ctx, '$fetch', { get: () => _generateFetch(_currentEntry), enumerable: true });
    }

    // Execute in MAIN world to avoid CSP restrictions
    return _executeInMainWorld(trimmed, ctx);
  }

  function _executeInMainWorld(code, ctx) {
    return new Promise((resolve) => {
      const id = ++_evalId;
      _pendingEvals.set(id, { resolve });
      
      // Serialize context - convert functions to their return values where safe
      const serializedCtx = {};
      for (const [key, val] of Object.entries(ctx)) {
        if (typeof val === 'function') {
          // Skip functions - they can't be serialized
          // But call value-returning ones like $all, $similar, $prev, $next
          if (['$all', '$similar', '$prev', '$next'].includes(key)) {
            try { serializedCtx[key] = val(); } catch { serializedCtx[key] = null; }
          }
        } else if (typeof val === 'object' && val !== null) {
          try { serializedCtx[key] = JSON.parse(JSON.stringify(val)); } catch { serializedCtx[key] = null; }
        } else {
          serializedCtx[key] = val;
        }
      }

      // Inject script into MAIN world
      const script = document.createElement('script');
      script.textContent = `
        (async () => {
          const _xrayId = ${id};
          const _xrayCode = ${JSON.stringify(code)};
          const _xrayCtx = ${JSON.stringify(serializedCtx)};
          
          try {
            // Helper functions available in console
            const toCSV = (arr) => {
              if (!Array.isArray(arr) || !arr.length) return '';
              const keys = Object.keys(arr[0]);
              const header = keys.join(',');
              const rows = arr.map(row => keys.map(k => {
                let v = row[k];
                if (typeof v === 'string' && (v.includes(',') || v.includes('"'))) v = '"' + v.replace(/"/g, '""') + '"';
                return v ?? '';
              }).join(','));
              return [header, ...rows].join('\\n');
            };
            const toTable = (arr) => ({ __xr_render: 'table', data: arr });
            const diff = (a, b) => {
              const result = { added: {}, removed: {}, changed: {} };
              const aKeys = new Set(Object.keys(a || {}));
              const bKeys = new Set(Object.keys(b || {}));
              for (const k of bKeys) if (!aKeys.has(k)) result.added[k] = b[k];
              for (const k of aKeys) {
                if (!bKeys.has(k)) result.removed[k] = a[k];
                else if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) result.changed[k] = { from: a[k], to: b[k] };
              }
              return result;
            };
            const schema = (obj, depth = 0) => {
              if (depth > 5) return 'any';
              if (obj === null) return 'null';
              if (Array.isArray(obj)) return obj.length ? [schema(obj[0], depth + 1)] : 'array';
              if (typeof obj === 'object') {
                const s = {};
                for (const [k, v] of Object.entries(obj)) s[k] = schema(v, depth + 1);
                return s;
              }
              return typeof obj;
            };
            const pick = (obj, keys) => keys.reduce((acc, k) => (k in (obj || {}) && (acc[k] = obj[k]), acc), {});
            const omit = (obj, keys) => Object.fromEntries(Object.entries(obj || {}).filter(([k]) => !keys.includes(k)));
            const flatten = (obj, prefix = '') => {
              const result = {};
              for (const [k, v] of Object.entries(obj || {})) {
                const key = prefix ? prefix + '.' + k : k;
                if (v && typeof v === 'object' && !Array.isArray(v)) Object.assign(result, flatten(v, key));
                else result[key] = v;
              }
              return result;
            };
            const copy = (val) => { navigator.clipboard.writeText(typeof val === 'string' ? val : JSON.stringify(val, null, 2)); return '✓ Copied'; };
            
            // Detect expression vs statement
            const isExpr = !_xrayCode.includes(';') && !_xrayCode.includes('\\n') &&
              !/^(const|let|var|if|for|while|switch|try)\\s/.test(_xrayCode);
            const body = isExpr ? 'return (' + _xrayCode + ')' : _xrayCode;
            
            // Build context args
            const { $res, $req, $h, $rh, $url, $params, $status, $time, $size, $method, $all, $similar, $prev, $next, $r, $curl, $fetch } = _xrayCtx;
            
            const fn = new Function('$res', '$req', '$h', '$rh', '$url', '$params', '$status', '$time', '$size', '$method', '$all', '$similar', '$prev', '$next', '$r', '$curl', '$fetch', 'toCSV', 'toTable', 'diff', 'schema', 'pick', 'omit', 'flatten', 'copy', 'return (async () => { ' + body + ' })()');
            const result = await fn($res, $req, $h, $rh, $url, $params, $status, $time, $size, $method, $all, $similar, $prev, $next, $r, $curl, $fetch, toCSV, toTable, diff, schema, pick, omit, flatten, copy);
            
            // Determine type
            let resultType = typeof result;
            if (result === undefined) resultType = 'undefined';
            else if (result === null) resultType = 'null';
            else if (Array.isArray(result)) resultType = 'array';
            else if (typeof result === 'object') resultType = 'object';
            
            // Serialize result
            let serialized = result;
            if (typeof result === 'object' && result !== null) {
              try { serialized = JSON.parse(JSON.stringify(result)); } catch { serialized = String(result); }
            }
            
            window.postMessage({ type: 'XRAY_EVAL_RESULT', id: _xrayId, success: true, resultType, result: serialized }, '*');
          } catch (err) {
            window.postMessage({ type: 'XRAY_EVAL_RESULT', id: _xrayId, success: false, error: { message: err.message, stack: err.stack } }, '*');
          }
        })();
      `;
      document.documentElement.appendChild(script);
      script.remove();
      
      // Timeout after 30s
      setTimeout(() => {
        if (_pendingEvals.has(id)) {
          _pendingEvals.delete(id);
          resolve({ type: 'error', error: { message: 'Execution timeout (30s)' } });
        }
      }, 30000);
    });
  }

  function _getType(val) {
    if (val === undefined) return 'undefined';
    if (val === null) return 'null';
    if (Array.isArray(val)) return 'array';
    if (typeof val === 'object') return 'object';
    return typeof val;
  }

  // ── History Navigation ──────────────────────────────────────────────────────
  function navigateHistory(dir) {
    if (!_history.length) return null;
    if (dir === 'up' && _historyIndex < _history.length - 1) _historyIndex++;
    else if (dir === 'down' && _historyIndex > -1) _historyIndex--;
    return _historyIndex === -1 ? '' : _history[_historyIndex];
  }

  function getHistory() { return [..._history]; }

  // ── Scope ───────────────────────────────────────────────────────────────────
  function setVar(name, val) { _scope[name] = val; }
  function getVar(name) { return _scope[name]; }
  function clearScope() { _scope = {}; _pins = {}; }
  function getScope() { return { ..._scope, ..._pins }; }

  return { init, setContext, getContext, getContextSummary, execute, navigateHistory, getHistory, setVar, getVar, clearScope, getScope };
})();
