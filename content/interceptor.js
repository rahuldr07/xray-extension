// content/interceptor.js — fetch + XHR interceptor (MAIN world)
(function () {
  'use strict';
  if (window.__xray_interceptor_installed__) return;
  window.__xray_interceptor_installed__ = true;

  const _origFetch = window.fetch;
  const _origXHROpen = XMLHttpRequest.prototype.open;
  const _origXHRSend = XMLHttpRequest.prototype.send;
  const _origXHRSetHeader = XMLHttpRequest.prototype.setRequestHeader;

  function _uid() { return 'xr_' + Date.now().toString(36) + '_' + (Math.random() * 1e9 | 0).toString(36); }
  function _emit(entry) { console.log('[XRAY]', entry); }
  function _parseHeaders(h) { const o = {}; if (!h) return o; if (h instanceof Headers) h.forEach((v,k) => o[k]=v); else if (typeof h === 'object') Object.assign(o,h); return o; }
  function _path(url) { try { return new URL(url).pathname; } catch { return url; } }

  // fetch wrapper (same as before)
  window.fetch = async function (...args) {
    const id = _uid(), start = Date.now();
    let url = '', method = 'GET', reqHeaders = {}, reqBody = null;
    try { const req = args[0], init = args[1] || {}; if (req instanceof Request) { url = req.url; method = req.method || 'GET'; reqHeaders = _parseHeaders(req.headers); try { reqBody = await req.clone().json(); } catch {} } else { url = String(req); method = (init.method || 'GET').toUpperCase(); reqHeaders = _parseHeaders(init.headers); if (init.body) try { reqBody = JSON.parse(init.body); } catch { reqBody = init.body; } } } catch {}
    let response; try { response = await _origFetch.apply(this, args); } catch (err) { _emit({ id, type: 'api', timestamp: start, source: 'fetch', method, url, urlPath: _path(url), status: 0, duration: Date.now() - start, requestHeaders: reqHeaders, requestBody: reqBody, responseHeaders: {}, responseRaw: null }); throw err; }
    const duration = Date.now() - start, clone = response.clone(), resHeaders = _parseHeaders(response.headers);
    clone.text().then(raw => { let size = 0; try { size = new TextEncoder().encode(raw).length; } catch {} _emit({ id, type: 'api', timestamp: start, source: 'fetch', method, url, urlPath: _path(url), status: response.status, duration, size, requestHeaders: reqHeaders, requestBody: reqBody, responseHeaders: resHeaders, responseRaw: raw }); }).catch(() => {});
    return response;
  };

  // XHR wrapper — BUG: not passing rest args to open()
  XMLHttpRequest.prototype.open = function (method, url) {
    this.__xr = { id: _uid(), method: (method || 'GET').toUpperCase(), url: String(url), reqHeaders: {}, start: 0 };
    return _origXHROpen.call(this, method, url);  // BUG: missing rest args
  };

  XMLHttpRequest.prototype.setRequestHeader = function (name, value) {
    if (this.__xr) this.__xr.reqHeaders[name.toLowerCase()] = value;
    return _origXHRSetHeader.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function (body) {
    if (!this.__xr) return _origXHRSend.apply(this, arguments);
    const xr = this.__xr; xr.start = Date.now();
    let reqBody = null; if (body) try { reqBody = JSON.parse(body); } catch { reqBody = body; }
    this.addEventListener('loadend', () => {
      const duration = Date.now() - xr.start, raw = this.responseText || null;
      let size = 0; try { size = new TextEncoder().encode(raw || '').length; } catch {}
      const resHeaders = {}; try { (this.getAllResponseHeaders() || '').trim().split('\r\n').forEach(line => { const idx = line.indexOf(':'); if (idx > 0) resHeaders[line.slice(0, idx).trim().toLowerCase()] = line.slice(idx + 1).trim(); }); } catch {}
      _emit({ id: xr.id, type: 'api', timestamp: xr.start, source: 'xhr', method: xr.method, url: xr.url, urlPath: _path(xr.url), status: this.status, duration, size, requestHeaders: xr.reqHeaders, requestBody: reqBody, responseHeaders: resHeaders, responseRaw: raw });
    });
    return _origXHRSend.apply(this, arguments);
  };
})();
