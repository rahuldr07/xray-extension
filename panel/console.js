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

  // ── Init ────────────────────────────────────────────────────────────────────
  function init() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) _history = JSON.parse(raw);
    } catch (e) {}
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
    const ctx = {
      $r: _currentEntry,
      $res: _parseBody(_currentEntry?.responseDecrypted || _currentEntry?.responseRaw),
      $req: _parseBody(_currentEntry?.requestBody),
      $all: () => window.XRAY_Panel?.getEntries?.() || [],
      copy: _copy,
      pin: _pin,
      assert: _assert,
      _: _,
      ..._scope,
      ..._pins,
    };

    // Lazy getters
    if (_currentEntry) {
      Object.defineProperty(ctx, '$curl', { get: () => _generateCurl(_currentEntry), enumerable: true });
      Object.defineProperty(ctx, '$fetch', { get: () => _generateFetch(_currentEntry), enumerable: true });
    }

    try {
      // Detect expression vs statement
      const isExpr = !trimmed.includes(';') && !trimmed.includes('\n') &&
        !/^(const|let|var|if|for|while|switch|try)\s/.test(trimmed);

      const body = isExpr ? `return (${trimmed})` : trimmed;
      const argNames = Object.keys(ctx);
      const argVals = Object.values(ctx);

      const fn = new Function(...argNames, `return (async () => { ${body} })()`);
      const result = await fn(...argVals);

      // Assertion check
      if (result && result.__xr_assert__) {
        return { type: 'assertion', pass: result.pass, message: result.message };
      }

      return { type: _getType(result), result };
    } catch (err) {
      return { type: 'error', error: { message: err.message, stack: err.stack } };
    }
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
