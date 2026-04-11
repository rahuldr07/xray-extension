// panel/export.js — Multi-format export functionality
// Uses Web Worker for heavy processing when available
window.XRAY_Export = (() => {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPORT FORMATS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Export entries to JSON
   */
  async function toJSON(entries, options = {}) {
    const { pretty = true, includeRaw = false } = options;
    
    const data = entries.map(entry => {
      const clean = { ...entry };
      
      // Remove internal fields
      delete clean._searchTokens;
      
      // Optionally exclude raw response (large)
      if (!includeRaw && clean.responseRaw) {
        delete clean.responseRaw;
      }
      
      return clean;
    });
    
    return JSON.stringify(data, null, pretty ? 2 : 0);
  }

  /**
   * Export entries to CSV (API entries only)
   */
  function _escapeCSV(value) {
    const raw = value === undefined || value === null ? '' : String(value);
    return `"${raw.replace(/"/g, '""')}"`;
  }

  async function toCSV(entries) {
    // Use worker if available
    if (window.XRAY_Worker?.isReady()) {
      return window.XRAY_Worker.exportCSV(entries);
    }
    
    // Fallback
    const apiEntries = entries.filter(e => e.type === 'api');
    if (!apiEntries.length) return '';
    
    const headers = ['timestamp', 'method', 'url', 'status', 'duration_ms', 'size_bytes'];
    const rows = [headers.map(_escapeCSV).join(',')];
    
    apiEntries.forEach(entry => {
      rows.push([
        new Date(entry.timestamp).toISOString(),
        entry.method || 'GET',
        entry.url || '',
        entry.status || '',
        entry.duration || '',
        entry.size || '',
      ].map(_escapeCSV).join(','));
    });
    
    return rows.join('\n');
  }

  /**
   * Export entries to HAR (HTTP Archive) format
   */
  async function toHAR(entries) {
    // Use worker if available
    if (window.XRAY_Worker?.isReady()) {
      return JSON.stringify(await window.XRAY_Worker.exportHAR(entries), null, 2);
    }
    
    // Fallback
    const apiEntries = entries.filter(e => e.type === 'api');
    
    const har = {
      log: {
        version: '1.2',
        creator: {
          name: 'XRAY Extension',
          version: '0.2.0',
        },
        entries: apiEntries.map(entry => ({
          startedDateTime: new Date(entry.timestamp).toISOString(),
          time: entry.duration || 0,
          request: {
            method: entry.method || 'GET',
            url: entry.url || '',
            httpVersion: 'HTTP/1.1',
            headers: Object.entries(entry.requestHeaders || {}).map(([name, value]) => ({ name, value })),
            queryString: [],
            cookies: [],
            headersSize: -1,
            bodySize: entry.requestBody ? JSON.stringify(entry.requestBody).length : 0,
            postData: entry.requestBody ? {
              mimeType: 'application/json',
              text: JSON.stringify(entry.requestBody),
            } : undefined,
          },
          response: {
            status: entry.status || 0,
            statusText: _statusText(entry.status),
            httpVersion: 'HTTP/1.1',
            headers: Object.entries(entry.responseHeaders || {}).map(([name, value]) => ({ name, value })),
            cookies: [],
            content: {
              size: entry.size || 0,
              mimeType: 'application/json',
              text: entry.responseRaw || '',
            },
            redirectURL: '',
            headersSize: -1,
            bodySize: entry.size || 0,
          },
          cache: {},
          timings: {
            blocked: -1,
            dns: -1,
            connect: -1,
            send: 0,
            wait: entry.duration || 0,
            receive: 0,
            ssl: -1,
          },
        })),
      },
    };
    
    return JSON.stringify(har, null, 2);
  }

  /**
   * Export single entry to cURL command
   */
  function toCurl(entry) {
    if (entry.type !== 'api') return '';
    
    const shellQuote = (value) => `'${String(value ?? '').replace(/'/g, "'\\''")}'`;
    const parts = ['curl'];
    
    // Method
    if (entry.method && entry.method !== 'GET') {
      parts.push(`-X ${entry.method}`);
    }
    
    // URL
    parts.push(shellQuote(entry.url || ''));
    
    // Headers
    Object.entries(entry.requestHeaders || {}).forEach(([name, value]) => {
      // Skip pseudo-headers and sensitive ones
      if (name.startsWith(':') || name.toLowerCase() === 'cookie') return;
      parts.push(`-H ${shellQuote(`${name}: ${value}`)}`);
    });
    
    // Body
    if (entry.requestBody) {
      const body = typeof entry.requestBody === 'string'
        ? entry.requestBody
        : JSON.stringify(entry.requestBody);
      parts.push(`-d ${shellQuote(body)}`);
    }
    
    return parts.join(' \\\n  ');
  }

  /**
   * Export single entry to fetch() code
   */
  function toFetch(entry) {
    if (entry.type !== 'api') return '';
    
    const options = {
      method: entry.method || 'GET',
    };
    
    // Headers
    const headers = {};
    Object.entries(entry.requestHeaders || {}).forEach(([name, value]) => {
      if (name.startsWith(':') || name.toLowerCase() === 'cookie') return;
      headers[name] = value;
    });
    
    if (Object.keys(headers).length > 0) {
      options.headers = headers;
    }
    
    // Body
    if (entry.requestBody) {
      options.body = typeof entry.requestBody === 'string'
        ? entry.requestBody
        : JSON.stringify(entry.requestBody);
    }
    
    const url = entry.url || '';
    const optionsStr = JSON.stringify(options, null, 2);
    
    return `fetch(${JSON.stringify(url)}, ${optionsStr})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));`;
  }

  /**
   * Export single entry to axios code
   */
  function toAxios(entry) {
    if (entry.type !== 'api') return '';
    
    const method = (entry.method || 'get').toLowerCase();
    const url = entry.url || '';
    
    // Headers
    const headers = {};
    Object.entries(entry.requestHeaders || {}).forEach(([name, value]) => {
      if (name.startsWith(':') || name.toLowerCase() === 'cookie') return;
      headers[name] = value;
    });
    
    // Build config
    const config = {};
    if (Object.keys(headers).length > 0) {
      config.headers = headers;
    }
    
    // Body for POST/PUT/PATCH
    const hasBody = ['post', 'put', 'patch'].includes(method);
    const body = entry.requestBody;
    
    let code;
    if (hasBody && body) {
      const bodyStr = typeof body === 'string' ? JSON.stringify(body) : JSON.stringify(body, null, 2);
      const configStr = Object.keys(config).length > 0 ? `, ${JSON.stringify(config, null, 2)}` : '';
      code = `axios.${method}(${JSON.stringify(url)}, ${bodyStr}${configStr})`;
    } else {
      const configStr = Object.keys(config).length > 0 ? `, ${JSON.stringify(config, null, 2)}` : '';
      code = `axios.${method}(${JSON.stringify(url)}${configStr})`;
    }
    
    return `${code}
  .then(res => console.log(res.data))
  .catch(err => console.error(err));`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DOWNLOAD HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  function download(content, filename, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function downloadJSON(entries, filename = 'xray-export.json') {
    const content = await toJSON(entries);
    download(content, filename, 'application/json');
  }

  async function downloadCSV(entries, filename = 'xray-export.csv') {
    const content = await toCSV(entries);
    download(content, filename, 'text/csv');
  }

  async function downloadHAR(entries, filename = 'xray-export.har') {
    const content = await toHAR(entries);
    download(content, filename, 'application/json');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CLIPBOARD
  // ═══════════════════════════════════════════════════════════════════════════

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.cssText = 'position:fixed;left:-9999px;';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    }
  }

  async function copyCurl(entry) {
    const code = toCurl(entry);
    return copyToClipboard(code);
  }

  async function copyFetch(entry) {
    const code = toFetch(entry);
    return copyToClipboard(code);
  }

  async function copyAxios(entry) {
    const code = toAxios(entry);
    return copyToClipboard(code);
  }

  async function copyJSON(entry) {
    const json = JSON.stringify(entry.responseDecrypted || entry.responseRaw, null, 2);
    return copyToClipboard(json);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  function _statusText(status) {
    const texts = {
      200: 'OK', 201: 'Created', 204: 'No Content',
      301: 'Moved Permanently', 302: 'Found', 304: 'Not Modified',
      400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found',
      500: 'Internal Server Error', 502: 'Bad Gateway', 503: 'Service Unavailable',
    };
    return texts[status] || '';
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════════════════════

  return {
    // Format converters
    toJSON,
    toCSV,
    toHAR,
    toCurl,
    toFetch,
    toAxios,
    
    // Download helpers
    download,
    downloadJSON,
    downloadCSV,
    downloadHAR,
    
    // Clipboard helpers
    copyToClipboard,
    copyCurl,
    copyFetch,
    copyAxios,
    copyJSON,
  };
})();
