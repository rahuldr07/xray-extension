// panel/search.js — Entry filter
window.XRAY_Search = (() => {
  'use strict';

  /**
   * Filter entries against a query string.
   * Matches against: URL, method, status, logLevel, and a JSON preview of the data.
   */
  function filter(entries, query) {
    if (!query || !query.trim()) return entries;
    const q = query.trim().toLowerCase();
    return entries.filter(entry => {
      if (entry.type === 'api') {
        return (
          (entry.url        || '').toLowerCase().includes(q) ||
          (entry.method     || '').toLowerCase().includes(q) ||
          String(entry.status || '').includes(q) ||
          _jsonIncludes(entry.responseDecrypted, q) ||
          _jsonIncludes(entry.requestBody, q)
        );
      }
      if (entry.type === 'log') {
        return (
          (entry.logLevel || '').includes(q) ||
          _jsonIncludes(entry.logData, q)
        );
      }
      return false;
    });
  }

  function _jsonIncludes(data, q) {
    if (data == null) return false;
    try { return JSON.stringify(data).toLowerCase().includes(q); } catch { return false; }
  }

  return { filter };
})();
