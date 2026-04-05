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

  /** Truncate a URL path to a readable form - show meaningful endpoint */
  function shortPath(url) {
    try {
      const u = new URL(url);
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
      return lastParts.length > 35 ? '…/' + segments.slice(-2).join('/') : '…/' + lastParts;
    } catch { return url.length > 40 ? '…' + url.slice(-38) : url; }
  }

  return { uid, formatTime, formatDuration, formatSize, previewJSON, statusClass, methodClass, safeClone, shortPath };
})();
