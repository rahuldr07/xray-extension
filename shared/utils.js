// shared/utils.js — Utility helpers (ISOLATED world)
window.XRAY_Utils = (() => {
  'use strict';

  let _counter = 0;
  function uid() {
    return `xr_${Date.now().toString(36)}_${(++_counter).toString(36)}`;
  }

  function formatTime(ts) {
    return new Date(ts).toTimeString().slice(0, 8);
  }

  function formatDuration(ms) {
    if (ms == null) return '—';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }

  function formatSize(bytes) {
    if (bytes == null) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(2)} MB`;
  }

  function previewJSON(data, maxLen = 80) {
    if (data === null || data === undefined) return 'null';
    if (typeof data === 'string') return data.length > maxLen ? data.slice(0, maxLen) + '…' : data;
    if (typeof data !== 'object') return String(data);
    try {
      const s = JSON.stringify(data);
      return s.length > maxLen ? s.slice(0, maxLen) + '…' : s;
    } catch { return '[object]'; }
  }

  function statusClass(status) {
    if (!status) return 'xr-s0';
    const d = Math.floor(status / 100);
    return `xr-s${d >= 2 && d <= 5 ? d : 0}`;
  }

  function methodClass(method) {
    // Was `(method || 'get').toLowerCase()`, which threw TypeError on any truthy
    // non-string — a number, an object, anything an imported HAR might carry.
    const name = typeof method === 'string' && method ? method : 'get';
    return `xr-m-${name.toLowerCase()}`;
  }

  /** Deeply clone plain JSON-safe values */
  function safeClone(v) {
    // On failure this used to return the ORIGINAL reference, so a "safe clone" of a
    // cyclic value aliased the caller's object and writes to the clone mutated the
    // source — the exact opposite of the contract. structuredClone handles cycles
    // and Dates; null is the honest answer when even that cannot copy the value.
    try { return JSON.parse(JSON.stringify(v)); } catch { /* fall through */ }
    try { return structuredClone(v); } catch { return null; }
  }

  /** Truncate a URL path to a readable form - show meaningful endpoint */
  function shortPath(url) {
    // The catch handler dereferenced `url.length` on the very value whose nullness
    // caused the throw, so shortPath(null) raised TypeError out of a function whose
    // whole job is to degrade gracefully.
    const raw = typeof url === 'string' ? url : '';
    try {
      const u = new URL(raw);
      let p = u.pathname;
      // Remove trailing slash
      if (p.endsWith('/') && p.length > 1) p = p.slice(0, -1);
      // If path is short enough, show it
      if (p.length <= 35) return p || '/';
      // Otherwise show last 2-3 segments
      const segments = p.split('/').filter(Boolean);
      if (segments.length <= 2) return p.length > 40 ? '…' + p.slice(-38) : p;
      // Show last 2-3 meaningful segments
      const lastParts = segments.slice(-3).join('/');
      // The 3-segment branch had no absolute cap, so one very long final segment was
      // returned essentially in full — defeating the point of the function. Every
      // return path is now bounded by the same 40-character budget.
      const short = lastParts.length > 35 ? '…/' + segments.slice(-2).join('/') : '…/' + lastParts;
      return short.length > 40 ? '…' + short.slice(-38) : short;
    } catch { return raw.length > 40 ? '…' + raw.slice(-38) : raw; }
  }

  return { uid, formatTime, formatDuration, formatSize, previewJSON, statusClass, methodClass, safeClone, shortPath };
})();
