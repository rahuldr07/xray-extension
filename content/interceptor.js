// content/interceptor.js — fetch interceptor (MAIN world)
(function () {
  'use strict';
  if (window.__xray_interceptor_installed__) return;
  window.__xray_interceptor_installed__ = true;

  const _origFetch = window.fetch;

  function _uid() {
    return 'xr_' + Date.now().toString(36) + '_' + (Math.random() * 1e9 | 0).toString(36);
  }

  function _emit(entry) {
    console.log('[XRAY]', entry);  // TODO: send to content script
  }

  function _parseHeaders(headers) {
    const out = {};
    if (!headers) return out;
    if (headers instanceof Headers) headers.forEach((v, k) => { out[k] = v; });
    else if (typeof headers === 'object') Object.assign(out, headers);
    return out;
  }

  function _path(url) {
    try { return new URL(url).pathname; } catch { return url; }
  }

  window.fetch = async function (...args) {
    const id = _uid(), start = Date.now();
    let url = '', method = 'GET', reqHeaders = {}, reqBody = null;
    try {
      const req = args[0], init = args[1] || {};
      if (req instanceof Request) {
        url = req.url; method = req.method || 'GET';
        reqHeaders = _parseHeaders(req.headers);
        try { reqBody = await req.clone().json(); } catch {}
      } else {
        url = String(req); method = (init.method || 'GET').toUpperCase();
        reqHeaders = _parseHeaders(init.headers);
        if (init.body) try { reqBody = JSON.parse(init.body); } catch { reqBody = init.body; }
      }
    } catch {}

    let response;
    try {
      response = await _origFetch.apply(this, args);
    } catch (err) {
      _emit({ id, type: 'api', timestamp: start, source: 'fetch', method, url, urlPath: _path(url), status: 0, duration: Date.now() - start, requestHeaders: reqHeaders, requestBody: reqBody, responseHeaders: {}, responseRaw: null });
      throw err;
    }

    const duration = Date.now() - start;
    const clone = response.clone();
    const resHeaders = _parseHeaders(response.headers);

    clone.text().then(raw => {
      let size = 0; try { size = new TextEncoder().encode(raw).length; } catch {}
      _emit({ id, type: 'api', timestamp: start, source: 'fetch', method, url, urlPath: _path(url), status: response.status, duration, size, requestHeaders: reqHeaders, requestBody: reqBody, responseHeaders: resHeaders, responseRaw: raw });
    }).catch(() => {});

    return response;
  };
})();
