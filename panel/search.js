// panel/search.js — High-performance entry filter with debouncing
window.XRAY_Search = (() => {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════════
  
  const DEBOUNCE_MS = 150;  // Debounce search input
  const MAX_RESULTS = 1000; // Limit results for performance

  // ═══════════════════════════════════════════════════════════════════════════
  // PRE-INDEXED TOKENS: Computed once per entry
  // ═══════════════════════════════════════════════════════════════════════════
  
  const _tokenCache = new WeakMap();  // entry -> tokens[]

  function _tokenize(entry) {
    // Check cache first
    if (_tokenCache.has(entry)) {
      return _tokenCache.get(entry);
    }
    
    const tokens = new Set();
    
    if (entry.type === 'api') {
      // URL: full URL + path segments
      if (entry.url) {
        tokens.add(entry.url.toLowerCase());
        try {
          const parsed = new URL(entry.url);
          parsed.pathname.split('/').filter(Boolean).forEach(seg => {
            tokens.add(seg.toLowerCase());
          });
          // Also add query params
          parsed.searchParams.forEach((v, k) => {
            tokens.add(k.toLowerCase());
            if (v) tokens.add(v.toLowerCase());
          });
        } catch {}
      }
      
      // Method
      if (entry.method) tokens.add(entry.method.toLowerCase());
      
      // Status (as string for searching "404", "500", etc.)
      if (entry.status) tokens.add(String(entry.status));
      
      // Response data: extract top-level keys only (FAST)
      _extractTopKeys(entry.responseDecrypted, tokens);
      _extractTopKeys(entry.requestBody, tokens);
    }
    
    if (entry.type === 'log') {
      // Log level
      if (entry.logLevel) tokens.add(entry.logLevel.toLowerCase());
      
      // Log data
      const data = entry.logData;
      if (typeof data === 'string') {
        // Extract words from string
        data.toLowerCase().split(/\s+/).filter(w => w.length > 2).forEach(w => tokens.add(w));
      } else {
        _extractTopKeys(data, tokens);
      }
    }
    
    const tokenArray = Array.from(tokens);
    _tokenCache.set(entry, tokenArray);
    return tokenArray;
  }

  function _extractTopKeys(obj, tokens, depth = 0, maxDepth = 2) {
    if (depth > maxDepth || obj === null || typeof obj !== 'object') return;
    
    const keys = Object.keys(obj);
    const limit = Math.min(keys.length, 30); // Only first 30 keys
    
    for (let i = 0; i < limit; i++) {
      const key = keys[i];
      tokens.add(key.toLowerCase());
      
      const val = obj[key];
      if (typeof val === 'string' && val.length < 100) {
        tokens.add(val.toLowerCase());
      } else if (typeof val === 'number') {
        tokens.add(String(val));
      } else if (typeof val === 'object') {
        _extractTopKeys(val, tokens, depth + 1, maxDepth);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FILTER: Fast token-based matching
  // ═══════════════════════════════════════════════════════════════════════════

  function filter(entries, query) {
    if (!query || !query.trim()) return entries;
    
    const q = query.trim().toLowerCase();
    
    // Split query into terms (AND logic)
    const queryTerms = q.split(/\s+/).filter(t => t.length > 0);
    if (queryTerms.length === 0) return entries;
    
    // Fast path: single term
    if (queryTerms.length === 1) {
      const term = queryTerms[0];
      const results = [];
      
      for (let i = 0; i < entries.length && results.length < MAX_RESULTS; i++) {
        const entry = entries[i];
        const tokens = _tokenize(entry);
        
        // Check if any token contains the search term
        if (tokens.some(t => t.includes(term))) {
          results.push(entry);
        }
      }
      
      return results;
    }
    
    // Multiple terms: all must match
    const results = [];
    
    for (let i = 0; i < entries.length && results.length < MAX_RESULTS; i++) {
      const entry = entries[i];
      const tokens = _tokenize(entry);
      
      // All query terms must match some token
      const matches = queryTerms.every(term => 
        tokens.some(t => t.includes(term))
      );
      
      if (matches) {
        results.push(entry);
      }
    }
    
    return results;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DEBOUNCED FILTER: For use with input handlers
  // ═══════════════════════════════════════════════════════════════════════════

  let _debounceTimer = null;
  let _lastQuery = '';
  let _lastResults = null;
  let _lastEntries = null;

  function filterDebounced(entries, query, callback) {
    // Clear pending debounce
    if (_debounceTimer) {
      clearTimeout(_debounceTimer);
    }
    
    // Cache hit: same query and entries reference
    if (query === _lastQuery && entries === _lastEntries && _lastResults !== null) {
      callback(_lastResults);
      return;
    }
    
    // Immediate empty query
    if (!query || !query.trim()) {
      _lastQuery = query;
      _lastEntries = entries;
      _lastResults = entries;
      callback(entries);
      return;
    }
    
    // Debounce non-empty queries
    _debounceTimer = setTimeout(() => {
      const results = filter(entries, query);
      _lastQuery = query;
      _lastEntries = entries;
      _lastResults = results;
      callback(results);
    }, DEBOUNCE_MS);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CLEAR CACHE: Call when entries are modified
  // ═══════════════════════════════════════════════════════════════════════════
  
  function clearCache() {
    _lastQuery = '';
    _lastResults = null;
    _lastEntries = null;
    // WeakMap automatically handles GC of removed entries
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ADVANCED: Structured queries (future)
  // ═══════════════════════════════════════════════════════════════════════════

  function parseQuery(query) {
    // Future: Support syntax like "status:404 method:POST /api/users"
    const filters = {};
    const terms = [];
    
    const parts = query.split(/\s+/);
    for (const part of parts) {
      const colonIdx = part.indexOf(':');
      if (colonIdx > 0 && colonIdx < part.length - 1) {
        const key = part.slice(0, colonIdx).toLowerCase();
        const val = part.slice(colonIdx + 1).toLowerCase();
        filters[key] = val;
      } else {
        terms.push(part.toLowerCase());
      }
    }
    
    return { filters, terms };
  }

  return { 
    filter, 
    filterDebounced, 
    clearCache,
    parseQuery,
  };
})();
