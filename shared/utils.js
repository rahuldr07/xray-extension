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
    return `xr-m-${(method || 'get').toLowerCase()}`;
  }

  /** Deeply clone plain JSON-safe values */
  function safeClone(v) {
    try { return JSON.parse(JSON.stringify(v)); } catch { return v; }
  }

  /** Truncate a URL path to a readable form */
  function shortPath(url) {
    try {
      const u = new URL(url);
      const p = u.pathname;
      return p.length > 42 ? '…' + p.slice(-42) : p;
    } catch { return url.length > 45 ? '…' + url.slice(-45) : url; }
  }

  return { uid, formatTime, formatDuration, formatSize, previewJSON, statusClass, methodClass, safeClone, shortPath };
})();
