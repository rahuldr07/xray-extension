// content/interceptor.js — fetch + XHR interceptor (MAIN world)
// Runs in MAIN world so it can wrap the real fetch/XHR on the page.
// Captured data is emitted via CustomEvent to be picked up by content.js (ISOLATED world).
(function () {
  'use strict';

  if (window.__xray_interceptor_installed__) return;
  window.__xray_interceptor_installed__ = true;

  const _origFetch = window.fetch;
  const _origXHROpen = XMLHttpRequest.prototype.open;
  const _origXHRSend = XMLHttpRequest.prototype.send;
  const _origXHRSetHeader = XMLHttpRequest.prototype.setRequestHeader;

  function _uid() {
    return 'xr_' + Date.now().toString(36) + '_' + (Math.random() * 1e9 | 0).toString(36);
  }

  function _emit(entry) {
    window.postMessage({ __xray_capture__: true, entry }, '*');
  }

  function _tryDecrypt(token, data) {
    try {
      if (typeof window.__XRAY_decrypt__ === 'function' && token) {
        const result = window.__XRAY_decrypt__(token, data);
        if (result !== null && result !== undefined) return { ok: true, data: result };
      }
    } catch { return { ok: false, data: null }; }
    return { ok: null, data: null };
  }

  function _parseHeaders(headers) {
    const out = {};
    if (!headers) return out;
    if (headers instanceof Headers) {
      headers.forEach((v, k) => { out[k] = v; });
    } else if (typeof headers === 'object') {
      Object.assign(out, headers);
    }
    return out;
  }

  // ── fetch wrapper ─────────────────────────────────────────────────────────
  window.fetch = async function (...args) {
    const id    = _uid();
    const start = Date.now();

    let url = '', method = 'GET', reqHeaders = {}, reqBody = null;
    try {
      const req = args[0];
      const init = args[1] || {};
      if (req instanceof Request) {
        url        = req.url;
        method     = req.method || 'GET';
        reqHeaders = _parseHeaders(req.headers);
        try { reqBody = await req.clone().json(); } catch { reqBody = null; }
      } else {
        url        = String(req);
        method     = (init.method || 'GET').toUpperCase();
        reqHeaders = _parseHeaders(init.headers);
        if (init.body) {
          try { reqBody = JSON.parse(init.body); } catch { reqBody = init.body; }
        }
      }
    } catch { /* ignore parse errors */ }

    let response;
    try {
      response = await _origFetch.apply(this, args);
    } catch (err) {
      _emit({
        id, type: 'api', timestamp: start,
        method, url, urlPath: _path(url),
        status: 0, duration: Date.now() - start,
        requestHeaders: reqHeaders, requestBody: reqBody,
        responseHeaders: {}, responseRaw: null,
        responseDecrypted: null, decryptStatus: 'none',
        parseToken: null, size: 0, pinned: false,
      });
      throw err;
    }

    const duration = Date.now() - start;
    const clone = response.clone();
    const resHeaders = _parseHeaders(response.headers);
    const token = reqHeaders['x-parse-token'] || reqHeaders['X-Parse-Token'] || null;

    clone.text().then(raw => {
      let parsed = null, size = 0;
      try { size = new TextEncoder().encode(raw).length; } catch {}
      try { parsed = JSON.parse(raw); } catch {}

      let decryptStatus = 'none', decrypted = null;
      if (token && parsed !== null) {
        const d = _tryDecrypt(token, parsed);
        if (d.ok === true)  { decryptStatus = 'ok';     decrypted = d.data; }
        else if (d.ok === false) { decryptStatus = 'failed'; }
      }

      _emit({
        id, type: 'api', timestamp: start,
        method, url, urlPath: _path(url),
        status: response.status, duration, size,
        requestHeaders: reqHeaders, requestBody: reqBody,
        responseHeaders: resHeaders,
        responseRaw: raw,
        responseDecrypted: decrypted,
        decryptStatus, parseToken: token, pinned: false,
      });
    }).catch(() => {});

    return response;
  };

  // ── XHR wrapper ───────────────────────────────────────────────────────────
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this.__xr = { id: _uid(), method: (method || 'GET').toUpperCase(), url: String(url), reqHeaders: {}, start: 0 };
    return _origXHROpen.apply(this, [method, url, ...rest]);
  };

  XMLHttpRequest.prototype.setRequestHeader = function (name, value) {
    if (this.__xr) this.__xr.reqHeaders[name.toLowerCase()] = value;
    return _origXHRSetHeader.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function (body) {
    if (!this.__xr) return _origXHRSend.apply(this, arguments);
    const xr = this.__xr;
    xr.start = Date.now();

    let reqBody = null;
    if (body) { try { reqBody = JSON.parse(body); } catch { reqBody = body; } }

    this.addEventListener('loadend', () => {
      const duration = Date.now() - xr.start;
      const raw = this.responseText || null;
      let parsed = null, size = 0;
      try { size = new TextEncoder().encode(raw || '').length; } catch {}
      try { parsed = JSON.parse(raw); } catch {}

      const resHeaders = {};
      try {
        (this.getAllResponseHeaders() || '').trim().split('\r\n').forEach(line => {
          const idx = line.indexOf(':');
          if (idx > 0) resHeaders[line.slice(0, idx).trim().toLowerCase()] = line.slice(idx + 1).trim();
        });
      } catch {}

      const token = xr.reqHeaders['x-parse-token'] || null;
      let decryptStatus = 'none', decrypted = null;
      if (token && parsed !== null) {
        const d = _tryDecrypt(token, parsed);
        if (d.ok === true)  { decryptStatus = 'ok';     decrypted = d.data; }
        else if (d.ok === false) { decryptStatus = 'failed'; }
      }

      _emit({
        id: xr.id, type: 'api', timestamp: xr.start,
        method: xr.method, url: xr.url, urlPath: _path(xr.url),
        status: this.status, duration, size,
        requestHeaders: xr.reqHeaders, requestBody: reqBody,
        responseHeaders: resHeaders,
        responseRaw: raw,
        responseDecrypted: decrypted,
        decryptStatus, parseToken: token, pinned: false,
      });
    });

    return _origXHRSend.apply(this, arguments);
  };

  function _path(url) {
    try { return new URL(url).pathname; } catch { return url; }
  }
})();
