// panel/n-plus-one.js - Intelligent N+1 Query Detection
// Automatically detects duplicate API calls (common performance anti-pattern)

window.XRAY_NPlusOne = (() => {
  'use strict';

  // Config
  const CONFIG = {
    clusterWindowMs: 2000,
    minDuplicates: 3,
    idPatterns: [
      /\/\d+(?=\/|$|\?)/g,
      /\/[a-f0-9-]{36}(?=\/|$|\?)/gi,
      /\/[a-f0-9]{24}(?=\/|$|\?)/gi,
      /\/[a-zA-Z0-9_-]{20,}(?=\/|$|\?)/g,
    ],
  };

  // State
  const _signatureMap = new Map();
  const _warnings = new Map();
  let _onWarningCallback = null;

  // Create URL signature by stripping dynamic IDs
  function createSignature(method, url) {
    try {
      const parsed = new URL(url, 'http://localhost');
      let path = parsed.pathname;
      
      for (const pattern of CONFIG.idPatterns) {
        path = path.replace(pattern, '/*');
      }
      
      path = path.replace(/\/+$/, '');
      const queryKeys = [...parsed.searchParams.keys()].sort().join(',');
      
      return method.toUpperCase() + ' ' + path + (queryKeys ? '?' + queryKeys : '');
    } catch (e) {
      return method.toUpperCase() + ' ' + url;
    }
  }

  function getDisplayEndpoint(signature) {
    const match = signature.match(/^(\w+)\s+(.+?)(?:\?|$)/);
    if (match) {
      return { method: match[1], path: match[2] };
    }
    return { method: '???', path: signature };
  }

  // Track entry and check for N+1 pattern
  function trackEntry(entry) {
    if (!entry || entry.type !== 'api') return null;
    
    const signature = createSignature(entry.method || 'GET', entry.url);
    const now = entry.timestamp || Date.now();
    
    let data = _signatureMap.get(signature);
    if (!data) {
      data = { count: 0, timestamps: [], entryIds: [] };
      _signatureMap.set(signature, data);
    }
    
    const cutoff = now - CONFIG.clusterWindowMs;
    data.timestamps = data.timestamps.filter(function(t) { return t > cutoff; });
    data.entryIds = data.entryIds.slice(-20);
    
    data.count++;
    data.timestamps.push(now);
    data.entryIds.push(entry.id);
    
    const recentCount = data.timestamps.length;
    
    if (recentCount >= CONFIG.minDuplicates) {
      const warning = {
        signature: signature,
        count: recentCount,
        totalCount: data.count,
        endpoint: getDisplayEndpoint(signature),
        severity: recentCount >= 10 ? 'critical' : recentCount >= 5 ? 'warning' : 'info',
        entryIds: data.entryIds.slice(),
        lastSeen: now,
      };
      
      _warnings.set(signature, warning);
      
      if (_onWarningCallback) {
        _onWarningCallback(warning);
      }
      
      return warning;
    }
    
    return null;
  }

  function getWarningForEntry(entry) {
    if (!entry || entry.type !== 'api') return null;
    const signature = createSignature(entry.method || 'GET', entry.url);
    return _warnings.get(signature) || null;
  }

  function getAllWarnings() {
    return Array.from(_warnings.values()).sort(function(a, b) { return b.count - a.count; });
  }

  function getSignature(entry) {
    if (!entry || entry.type !== 'api') return null;
    return createSignature(entry.method || 'GET', entry.url);
  }

  // Badge rendering
  function renderBadge(warning) {
    if (!warning) return '';
    
    var severityClass = 'xr-n1-info';
    if (warning.severity === 'critical') severityClass = 'xr-n1-critical';
    else if (warning.severity === 'warning') severityClass = 'xr-n1-warning';
    
    return '<span class="xr-n1-badge ' + severityClass + '" title="N+1: ' + warning.count + ' calls">[N+1: ' + warning.count + 'x]</span>';
  }

  function getCSS() {
    return '\
.xr-n1-badge {\
  display: inline-flex;\
  align-items: center;\
  padding: 1px 5px;\
  margin-left: 6px;\
  border-radius: 4px;\
  font-family: "JetBrains Mono", monospace;\
  font-size: 9px;\
  font-weight: 700;\
  letter-spacing: 0.3px;\
  white-space: nowrap;\
  animation: xr-n1-pulse 2s ease-in-out infinite;\
}\
.xr-n1-info {\
  background: rgba(59, 130, 246, 0.15);\
  color: #60a5fa;\
  border: 1px solid rgba(59, 130, 246, 0.3);\
}\
.xr-n1-warning {\
  background: rgba(251, 191, 36, 0.15);\
  color: #fbbf24;\
  border: 1px solid rgba(251, 191, 36, 0.3);\
}\
.xr-n1-critical {\
  background: rgba(239, 68, 68, 0.15);\
  color: #f87171;\
  border: 1px solid rgba(239, 68, 68, 0.3);\
  animation: xr-n1-shake 0.5s ease-in-out;\
}\
@keyframes xr-n1-pulse {\
  0%, 100% { opacity: 1; }\
  50% { opacity: 0.7; }\
}\
@keyframes xr-n1-shake {\
  0%, 100% { transform: translateX(0); }\
  20%, 60% { transform: translateX(-2px); }\
  40%, 80% { transform: translateX(2px); }\
}';
  }

  function renderSummary() {
    var warnings = getAllWarnings();
    if (warnings.length === 0) return '';
    
    var items = warnings.slice(0, 5).map(function(w) {
      return '<div class="xr-n1-summary-item">' +
        '<span class="xr-n1-summary-method">' + w.endpoint.method + '</span>' +
        '<span class="xr-n1-summary-path">' + w.endpoint.path + '</span>' +
        '<span class="xr-n1-summary-count">' + w.count + 'x</span>' +
        '</div>';
    }).join('');
    
    return '<div class="xr-n1-summary">' +
      '<div class="xr-n1-summary-header">' +
        '<span>N+1 Pattern Detected (' + warnings.length + ')</span>' +
      '</div>' +
      '<div class="xr-n1-summary-list">' + items + '</div>' +
    '</div>';
  }

  function clear() {
    _signatureMap.clear();
    _warnings.clear();
  }

  return {
    trackEntry: trackEntry,
    getWarningForEntry: getWarningForEntry,
    getAllWarnings: getAllWarnings,
    getSignature: getSignature,
    renderBadge: renderBadge,
    renderSummary: renderSummary,
    getCSS: getCSS,
    clear: clear,
    onWarning: function(callback) { _onWarningCallback = callback; },
  };
})();
