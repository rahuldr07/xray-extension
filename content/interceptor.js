// content/interceptor.js — fetch + XHR + WebSocket + SSE interceptor (MAIN world)
// Runs in MAIN world so it can wrap the real network objects on the page.
// Captured data is emitted via postMessage to be picked up by content.js (ISOLATED world).
// Also applies user-defined traffic rules (mock / delay / fail) and serves replay requests.
(function () {
  'use strict';

  if (window.__xray_interceptor_installed__) return;
  window.__xray_interceptor_installed__ = true;

  const _origFetch = window.fetch;
  // C-2: the secret-bearing replay path must not depend on globals the page can
  // replace. `_URL` is captured at document_start, before page script runs; replacing
  // `window.URL` afterwards used to make `_originOf` return whatever the attacker
  // wanted, and `sameOrigin` then held for ANY target — sending the original site's
  // bearer token to a host of the page's choosing.
  const _URL = window.URL;
  const _pageHref = () => {
    try { return window.location.href; } catch { return ''; }
  };
  const _origXHROpen = XMLHttpRequest.prototype.open;
  const _origXHRSend = XMLHttpRequest.prototype.send;
  const _origXHRSetHeader = XMLHttpRequest.prototype.setRequestHeader;
  const _OrigWebSocket = window.WebSocket;
  const _OrigEventSource = window.EventSource;
  const _config = { captureFetch: true, captureXhr: true, captureWs: true, rules: [] };
  const MAX_CAPTURE_TEXT_CHARS = 250000;
  const MAX_CAPTURE_BODY_CHARS = 50000;
  const MAX_RULES = 50;
  const MAX_RULE_BODY_CHARS = 100000;
  const MAX_WS_FRAMES = 200;
  const MAX_WS_FRAME_PREVIEW = 2000;
  const MAX_INITIATOR_FRAMES = 8;
  const WS_UPDATE_THROTTLE_MS = 250;
  const SENSITIVE_HEADER = /^(authorization|proxy-authorization|cookie|set-cookie|x-api-key|api-key|x-auth-token|x-csrf-token|x-xsrf-token)$/i;
  const _bridgeToken = window.__XRAY_BRIDGE_TOKEN__ || _uid();
  try { Object.defineProperty(window, '__XRAY_BRIDGE_TOKEN__', { value: _bridgeToken, configurable: false, writable: false }); } catch { window.__XRAY_BRIDGE_TOKEN__ = _bridgeToken; }
  window.postMessage({ __xray_bridge_ready__: true, token: _bridgeToken }, '*');

  let _replayMark = null;

  function _uid() {
    return 'xr_' + Date.now().toString(36) + '_' + (Math.random() * 1e9 | 0).toString(36);
  }

  function _emit(entry) {
    window.postMessage({ __xray_capture__: true, token: _bridgeToken, entry }, '*');
  }

  function _emitUpdate(entry) {
    window.postMessage({ __xray_capture__: true, token: _bridgeToken, update: true, entry }, '*');
  }

  // ── config bridge (capture toggles + traffic rules from the panel) ─────────
  function _sanitizeRule(rule) {
    if (!rule || typeof rule !== 'object') return null;
    const match = rule.match && typeof rule.match === 'object' ? rule.match : {};
    const action = rule.action && typeof rule.action === 'object' ? rule.action : {};
    const url = typeof match.url === 'string' ? match.url.slice(0, 2000) : '';
    if (!url) return null;
    // Precompile 're:' patterns once per config push — _matchRule runs inside
    // every fetch/XHR on the page. An invalid pattern invalidates the rule.
    let regex = null;
    if (url.startsWith('re:')) {
      try { regex = new RegExp(url.slice(3)); } catch { return null; }
    }
    const type = ['mock', 'delay', 'fail', 'passthrough'].includes(action.type) ? action.type : 'passthrough';
    let body = typeof action.body === 'string' ? action.body : action.body != null ? (() => { try { return JSON.stringify(action.body); } catch { return ''; } })() : '';
    if (body.length > MAX_RULE_BODY_CHARS) body = body.slice(0, MAX_RULE_BODY_CHARS);
    const headers = {};
    if (action.headers && typeof action.headers === 'object') {
      Object.entries(action.headers).slice(0, 30).forEach(([key, value]) => {
        if (typeof key === 'string' && key.length < 200) headers[key] = String(value).slice(0, 2000);
      });
    }
    return {
      id: typeof rule.id === 'string' ? rule.id.slice(0, 100) : _uid(),
      enabled: rule.enabled !== false,
      match: {
        url,
        regex,
        method: typeof match.method === 'string' && match.method ? match.method.toUpperCase().slice(0, 12) : '',
      },
      action: {
        type,
        // Mocks are realized via new Response()/XHR simulation, which cannot
        // represent 1xx or >599 (Response() throws RangeError).
        status: Math.min(599, Math.max(200, Number(action.status) || 200)),
        body,
        headers,
        delayMs: Math.min(60000, Math.max(0, Number(action.delayMs) || 0)),
      },
    };
  }

  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    if (!event.data?.__xray_config__) return;
    if (event.data.token !== _bridgeToken) return;
    const config = event.data.config || {};
    if (typeof config.captureFetch === 'boolean') _config.captureFetch = config.captureFetch;
    if (typeof config.captureXhr === 'boolean') _config.captureXhr = config.captureXhr;
    if (typeof config.captureWs === 'boolean') _config.captureWs = config.captureWs;
    if (Array.isArray(config.rules)) {
      _config.rules = config.rules.slice(0, MAX_RULES).map(_sanitizeRule).filter(Boolean);
    }
  });

  function _matchRule(method, url) {
    for (const rule of _config.rules) {
      if (!rule.enabled) continue;
      if (rule.match.method && rule.match.method !== method) continue;
      const pattern = rule.match.url;
      let hit = false;
      if (pattern.startsWith('re:')) {
        hit = rule.match.regex ? rule.match.regex.test(url) : false;
      } else {
        hit = url.includes(pattern);
      }
      if (hit && rule.action.type !== 'passthrough') return rule;
    }
    return null;
  }

  function _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ── shared helpers ─────────────────────────────────────────────────────────
  // C-6: decryption used to run HERE, in the page's realm, through a writable page
  // global installed by the now-deleted content/decrypt-bridge.js. The shipped stub
  // returned null so nothing leaked yet, but the file existed to be filled in — and
  // once it is, a page can read whatever
  // the closure captures, use it as a decryption oracle, or replace it outright and
  // feed the analyst fabricated plaintext stamped `decryptStatus: 'ok'`.
  //
  // The interceptor now only marks that a token was present. `content/content.js` runs
  // the real hook in the ISOLATED world, which the page cannot reach at all. The stated
  // reason for MAIN-world placement — page CSP blocking eval — never applied there:
  // isolated-world content scripts are exempt from the page's CSP.
  function _decryptPending(token, data) {
    return token && data !== null && data !== undefined;
  }

  function _parseHeaders(headers) {
    const out = {};
    if (!headers) return out;
    if (headers instanceof Headers) {
      headers.forEach((v, k) => { out[k] = _safeHeader(k, v); });
    } else if (Array.isArray(headers)) {
      headers.forEach((pair) => {
        if (Array.isArray(pair) && pair.length >= 2) out[String(pair[0])] = _safeHeader(pair[0], pair[1]);
      });
    } else if (typeof headers === 'object') {
      Object.entries(headers).forEach(([k, v]) => { out[k] = _safeHeader(k, v); });
    }
    return out;
  }

  function _safeHeader(name, value) {
    if (SENSITIVE_HEADER.test(String(name || ''))) return '[redacted]';
    return value;
  }

  // Sensitive header values are kept ONLY in this MAIN-world map, keyed by entry id.
  // They are never postMessaged to the panel or persisted, but they let an
  // auth-carrying request be replayed successfully (see the replay handler below).
  const _secretStore = new Map();
  const MAX_SECRETS = 300;
  // Forbidden request headers the browser controls itself; never worth restoring.
  const FORBIDDEN_REPLAY_HEADER = /^(cookie|set-cookie|host|content-length|connection|origin|referer|user-agent)$/i;

  function _collectSecrets(source) {
    const out = {};
    const add = (name, value) => { if (SENSITIVE_HEADER.test(String(name || ''))) out[String(name).toLowerCase()] = value; };
    if (source instanceof Headers) source.forEach((v, k) => add(k, v));
    else if (Array.isArray(source)) source.forEach((pair) => { if (Array.isArray(pair) && pair.length >= 2) add(pair[0], pair[1]); });
    else if (source && typeof source === 'object') Object.entries(source).forEach(([k, v]) => add(k, v));
    return out;
  }

  function _originOf(url) {
    try {
      return new _URL(String(url), _pageHref()).origin;
    } catch {
      return null;
    }
  }

  // A plain-string origin check used alongside _originOf on the secret-bearing replay
  // path. It parses nothing, so it holds even if the URL constructor is compromised.
  function _urlIsUnder(url, origin) {
    const u = String(url);
    if (!origin) return false;
    return u === origin || u.startsWith(origin + '/') || u.startsWith(origin + '?') || u.startsWith(origin + '#');
  }

  // Secrets are pinned to the origin they were captured from. Edit & Replay lets
  // the URL be rewritten freely, so without this an authed request retargeted at
  // another host would carry the original site's bearer token to it — see the
  // origin check in the replay handler below.
  function _rememberSecrets(id, url, ...sources) {
    const secret = {};
    sources.forEach((source) => { if (source) Object.assign(secret, _collectSecrets(source)); });
    if (!Object.keys(secret).length) return;
    _secretStore.set(id, { origin: _originOf(url), values: secret });
    if (_secretStore.size > MAX_SECRETS) {
      const oldest = _secretStore.keys().next().value;
      _secretStore.delete(oldest);
    }
  }

  // Sensitive headers are redacted before entries leave this world, which
  // blinded the panel's JWT lens to Authorization tokens — their most common
  // home. Decode the claims here (no signature, size-capped) and ship ONLY the
  // decoded parts; the raw token never leaves the MAIN world.
  const JWT_IN_HEADER = /eyJ[A-Za-z0-9_-]{4,}\.[A-Za-z0-9_-]{4,}\.[A-Za-z0-9_-]*/;

  function _b64UrlJson(segment) {
    try {
      const padded = segment.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(segment.length / 4) * 4, '=');
      const binary = atob(padded);
      const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
      const text = new TextDecoder().decode(bytes);
      if (text.length > 5000) return null;
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  function _extractJwtLenses(secrets) {
    if (!secrets) return [];
    const out = [];
    for (const [name, value] of Object.entries(secrets)) {
      const match = String(value || '').match(JWT_IN_HEADER);
      if (!match || match[0].length > 6000) continue;
      const parts = match[0].split('.');
      const header = _b64UrlJson(parts[0]);
      const payload = _b64UrlJson(parts[1]);
      if (header == null && payload == null) continue;
      out.push({ source: name, header, payload });
      if (out.length >= 5) break;
    }
    return out;
  }

  function _limitText(value, limit) {
    if (typeof value !== 'string') return value;
    if (value.length <= limit) return value;
    return value.slice(0, limit) + `\n... truncated ${value.length - limit} chars`;
  }

  function _limitBody(value) {
    if (typeof value === 'string') return _limitText(value, MAX_CAPTURE_BODY_CHARS);
    try {
      const text = JSON.stringify(value);
      if (text && text.length > MAX_CAPTURE_BODY_CHARS) return _limitText(text, MAX_CAPTURE_BODY_CHARS);
    } catch {}
    return value;
  }

  function _resolveUrl(url) {
    try {
      return new _URL(url, _pageHref()).href;
    } catch {
      return url;
    }
  }

  function _path(url) {
    try { return new _URL(url).pathname; } catch { return url; }
  }

  // ── GraphQL awareness ──────────────────────────────────────────────────────
  function _graphqlInfo(url, body) {
    try {
      if (!body || typeof body !== 'object') return null;
      const query = typeof body.query === 'string' ? body.query : null;
      if (!query) return null;
      const looksLikeGraphql = /(^|\s)(query|mutation|subscription|fragment)[\s{(]/.test(query) || /^\s*\{/.test(query);
      if (!looksLikeGraphql && !String(url).toLowerCase().includes('graphql')) return null;
      const opMatch = query.match(/\b(query|mutation|subscription)\b\s*([A-Za-z_][\w]*)?/);
      const fieldMatch = query.match(/\{\s*([A-Za-z_][\w]*)/);
      const operationType = opMatch?.[1] || 'query';
      const operationName = String(body.operationName || opMatch?.[2] || fieldMatch?.[1] || 'anonymous').slice(0, 120);
      let variables = null;
      if (body.variables && typeof body.variables === 'object') {
        try {
          const text = JSON.stringify(body.variables);
          variables = text.length > 10000 ? _limitText(text, 10000) : body.variables;
        } catch {}
      }
      return { operationType, operationName, variables };
    } catch {
      return null;
    }
  }

  // ── initiator stack ────────────────────────────────────────────────────────
  function _initiatorStack() {
    try {
      const lines = String(new Error().stack || '').split('\n');
      return lines
        .map((line) => line.trim())
        .filter((line) => line.startsWith('at ') || /@/.test(line))
        .filter((line) => !/interceptor\.js|__xray|chrome-extension:/i.test(line))
        .slice(0, MAX_INITIATOR_FRAMES)
        .map((line) => line.replace(/^at\s+/, '').slice(0, 300));
    } catch {
      return [];
    }
  }

  // ── resource timing ────────────────────────────────────────────────────────
  // performance.getEntriesByName scans the whole resource buffer, which grows for
  // the lifetime of the page — one call per request makes that O(requests²).
  // Index entries as the observer reports them so the common case is a Map hit,
  // and resolve requests whose timing lands late from the same observer instead
  // of a 300ms timer per request (a burst used to queue one timer each, and every
  // one of them re-ran the full scan).
  const MAX_TIMING_INDEX = 500;
  const _timingIndex = new Map();
  const _pendingTiming = new Map();

  function _readTiming(timing) {
    try {
      if (!timing || !(timing.responseEnd > 0)) return null;
      return {
        startTime: Math.round(timing.startTime),
        totalMs: Math.round(timing.duration),
        dnsMs: Math.max(0, Math.round(timing.domainLookupEnd - timing.domainLookupStart)),
        connectMs: Math.max(0, Math.round(timing.connectEnd - timing.connectStart)),
        tlsMs: timing.secureConnectionStart > 0 ? Math.max(0, Math.round(timing.connectEnd - timing.secureConnectionStart)) : 0,
        ttfbMs: Math.max(0, Math.round(timing.responseStart - timing.requestStart)),
        downloadMs: Math.max(0, Math.round(timing.responseEnd - timing.responseStart)),
        transferSize: Number(timing.transferSize) || 0,
      };
    } catch {
      return null;
    }
  }

  function _rememberTiming(entry) {
    if (!entry || !entry.name) return;
    _timingIndex.set(entry.name, entry);
    if (_timingIndex.size > MAX_TIMING_INDEX) _timingIndex.delete(_timingIndex.keys().next().value);
    const waiting = _pendingTiming.get(entry.name);
    if (!waiting) return;
    _pendingTiming.delete(entry.name);
    const timing = _readTiming(entry);
    if (timing) waiting.forEach((id) => _emitUpdate({ id, timing }));
  }

  let _timingObserver = null;
  try {
    _timingObserver = new PerformanceObserver((list) => { list.getEntries().forEach(_rememberTiming); });
    _timingObserver.observe({ type: 'resource', buffered: true });
  } catch { _timingObserver = null; }

  function _resourceTiming(url) {
    const indexed = _timingIndex.get(url);
    if (indexed) return _readTiming(indexed);
    // The observer callback can lag the response by a task, so fall back to the
    // buffer scan on a miss rather than reporting no timing at all.
    try {
      const entries = performance.getEntriesByName(url, 'resource');
      return _readTiming(entries[entries.length - 1]);
    } catch {
      return null;
    }
  }

  function _attachTimingLater(id, url) {
    if (!_timingObserver) {
      setTimeout(() => {
        const timing = _resourceTiming(url);
        if (timing) _emitUpdate({ id, timing });
      }, 300);
      return;
    }
    let waiting = _pendingTiming.get(url);
    if (!waiting) {
      waiting = new Set();
      _pendingTiming.set(url, waiting);
      if (_pendingTiming.size > MAX_TIMING_INDEX) _pendingTiming.delete(_pendingTiming.keys().next().value);
    }
    waiting.add(id);
  }

  // ── mock response construction ─────────────────────────────────────────────
  function _mockEntry(base, rule) {
    return Object.assign(base, {
      status: rule.action.type === 'fail' ? 0 : rule.action.status,
      mocked: true,
      mockRuleId: rule.id,
      mockAction: rule.action.type,
    });
  }

  // ── fetch wrapper ─────────────────────────────────────────────────────────
  // Assigned to `window.fetch` below AND kept in `_xrayFetch`. The replay path calls
  // the reference, not the global: routing through `window.fetch` meant a page that
  // re-wrapped fetch after document_start read the raw restored Authorization value
  // on every replay. Calling our own wrapper keeps replays captured and diffed while
  // taking the page's wrapper out of the path.
  const _xrayFetch = async function (...args) {
    // Consume the replay mark before the capture guard: if fetch capture is
    // off, the mark must still be cleared or it would tag the next captured
    // request as a replay.
    const replayMark = _replayMark;
    _replayMark = null;
    if (!_config.captureFetch) return _origFetch.apply(this, args);
    const id    = _uid();
    const start = Date.now();
    const initiator = _initiatorStack();

    let url = '', method = 'GET', reqHeaders = {}, reqBody = null;
    try {
      const req = args[0];
      const init = args[1] || {};
      if (req instanceof Request) {
        url        = req.url; // Request.url is always absolute
        method     = (init.method || req.method || 'GET').toUpperCase();
        reqHeaders = Object.assign(_parseHeaders(req.headers), _parseHeaders(init.headers));
        _rememberSecrets(id, url, req.headers, init.headers);
        try { reqBody = await req.clone().json(); } catch { reqBody = null; }
        if (reqBody === null && init.body) {
          try { reqBody = JSON.parse(init.body); } catch { reqBody = init.body; }
        }
      } else {
        url        = _resolveUrl(String(req)); // Resolve relative URLs
        method     = (init.method || 'GET').toUpperCase();
        reqHeaders = _parseHeaders(init.headers);
        _rememberSecrets(id, url, init.headers);
        if (init.body) {
          try { reqBody = JSON.parse(init.body); } catch { reqBody = init.body; }
        }
      }
    } catch { /* ignore parse errors */ }

    const graphql = _graphqlInfo(url, reqBody);
    const jwtLenses = _extractJwtLenses(_secretStore.get(id)?.values);
    const baseEntry = {
      id, type: 'api', timestamp: start,
      source: 'fetch',
      method, url, urlPath: _path(url),
      requestHeaders: reqHeaders, requestBody: _limitBody(reqBody),
      pinned: false,
      initiator,
      ...(graphql ? { graphql } : {}),
      ...(jwtLenses.length ? { jwtLenses } : {}),
      ...(replayMark ? { replayed: true, replayOf: replayMark.replayOf } : {}),
    };

    const rule = _matchRule(method, url);
    if (rule && rule.action.type === 'fail') {
      _emit(_mockEntry(Object.assign(baseEntry, {
        duration: 0, size: 0,
        responseHeaders: {}, responseRaw: null,
        responseDecrypted: null, decryptStatus: 'none', parseToken: null,
      }), rule));
      throw new TypeError(`Failed to fetch (XRAY rule "${rule.id}")`);
    }
    if (rule && rule.action.type === 'mock') {
      if (rule.action.delayMs) await _sleep(rule.action.delayMs);
      const body = rule.action.body || '';
      const headers = Object.assign({ 'content-type': 'application/json' }, rule.action.headers);
      _emit(_mockEntry(Object.assign(baseEntry, {
        duration: Date.now() - start,
        size: body.length,
        responseHeaders: headers,
        responseRaw: _limitText(body, MAX_CAPTURE_TEXT_CHARS),
        responseDecrypted: null, decryptStatus: 'none', parseToken: null,
      }), rule));
      const status = rule.action.status;
      // 204/205/304 are null-body statuses — Response() throws if given a body.
      return new Response(status === 204 || status === 205 || status === 304 ? null : body, { status, headers });
    }
    if (rule && rule.action.type === 'delay' && rule.action.delayMs) {
      baseEntry.delayedByRuleMs = rule.action.delayMs;
      baseEntry.mockRuleId = rule.id;
      await _sleep(rule.action.delayMs);
    }

    let response;
    try {
      response = await _origFetch.apply(this, args);
    } catch (err) {
      _emit(Object.assign(baseEntry, {
        status: 0, duration: Date.now() - start,
        responseHeaders: {}, responseRaw: null,
        responseDecrypted: null, decryptStatus: 'none',
        parseToken: null, size: 0,
      }));
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

      // 'pending' is resolved in the isolated world by content.js — see C-6.
      const decryptStatus = _decryptPending(token, parsed) ? 'pending' : 'none';
      const decrypted = null;

      const timing = _resourceTiming(url);
      _emit(Object.assign(baseEntry, {
        status: response.status, duration, size,
        responseHeaders: resHeaders,
        responseRaw: _limitText(raw, MAX_CAPTURE_TEXT_CHARS),
        responseDecrypted: decrypted,
        decryptStatus, parseToken: token,
        timing,
      }));
      if (!timing) _attachTimingLater(id, url);
    }).catch(() => {});

    return response;
  };
  window.fetch = _xrayFetch;

  // ── XHR wrapper ───────────────────────────────────────────────────────────
  // A simulated response installs own properties that shadow the prototype's
  // readyState/status/response getters. They must be removed when the object is
  // reused (polling with a single XHR is common), or the instance reports the
  // old mocked result forever — and a later `delay` rule would see readyState 4
  // instead of 1 and drop the request entirely.
  const MOCK_SHADOWED = ['readyState', 'status', 'statusText', 'responseText', 'responseURL', 'response',
    'getAllResponseHeaders', 'getResponseHeader'];

  function _clearMockShadow(xhr) {
    if (!xhr || !xhr.__xrMockShadow) return;
    for (const name of MOCK_SHADOWED) {
      try { delete xhr[name]; } catch {}
    }
    try { delete xhr.__xrMockShadow; } catch {}
  }

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    _clearMockShadow(this);
    if (!_config.captureXhr) return _origXHROpen.apply(this, [method, url, ...rest]);
    this.__xr = {
      id: _uid(), method: (method || 'GET').toUpperCase(), url: _resolveUrl(String(url)),
      reqHeaders: {}, start: 0, initiator: _initiatorStack(),
      sync: rest.length > 0 && rest[0] === false,
    };
    return _origXHROpen.apply(this, [method, url, ...rest]);
  };

  XMLHttpRequest.prototype.setRequestHeader = function (name, value) {
    if (this.__xr) {
      this.__xr.reqHeaders[name.toLowerCase()] = _safeHeader(name, value);
      if (SENSITIVE_HEADER.test(String(name || ''))) {
        (this.__xr.rawSecrets || (this.__xr.rawSecrets = {}))[String(name).toLowerCase()] = value;
      }
    }
    return _origXHRSetHeader.apply(this, arguments);
  };

  function _simulateXhrResponse(xhr, xr, rule, baseEntry) {
    const fail = rule.action.type === 'fail';
    const body = fail ? '' : rule.action.body || '';
    const status = fail ? 0 : rule.action.status;
    const headers = fail ? {} : Object.assign({ 'content-type': 'application/json' }, rule.action.headers);
    const headerText = Object.entries(headers).map(([k, v]) => `${k}: ${v}`).join('\r\n');
    // Header names are case-insensitive, but the rule author's casing is what
    // lands in `headers` — look up through a lowercased copy so a page asking for
    // 'X-Request-Id' finds a header the rule spelled the same way.
    const headerLookup = {};
    Object.entries(headers).forEach(([key, value]) => { headerLookup[String(key).toLowerCase()] = value; });

    setTimeout(() => {
      try {
        Object.defineProperty(xhr, 'readyState', { value: 4, configurable: true });
        Object.defineProperty(xhr, 'status', { value: status, configurable: true });
        Object.defineProperty(xhr, 'statusText', { value: fail ? '' : 'XRAY Mock', configurable: true });
        Object.defineProperty(xhr, 'responseText', { value: body, configurable: true });
        Object.defineProperty(xhr, 'responseURL', { value: xr.url, configurable: true });
        let responseValue = body;
        if (xhr.responseType === 'json') {
          try { responseValue = JSON.parse(body); } catch { responseValue = null; }
        }
        Object.defineProperty(xhr, 'response', { value: responseValue, configurable: true });
        xhr.getAllResponseHeaders = () => headerText;
        xhr.getResponseHeader = (name) => headerLookup[String(name).toLowerCase()] ?? null;
        // Marks the instance so a later open() can strip these shadows again.
        xhr.__xrMockShadow = true;
      } catch {}

      _emit(_mockEntry(Object.assign(baseEntry, {
        duration: Date.now() - xr.start,
        size: body.length,
        responseHeaders: headers,
        responseRaw: _limitText(body, MAX_CAPTURE_TEXT_CHARS),
        responseDecrypted: null, decryptStatus: 'none', parseToken: null,
      }), rule));

      try {
        xhr.dispatchEvent(new Event('readystatechange'));
        if (fail) xhr.dispatchEvent(new ProgressEvent('error'));
        else xhr.dispatchEvent(new ProgressEvent('load'));
        xhr.dispatchEvent(new ProgressEvent('loadend'));
      } catch {}
    }, rule.action.delayMs || 0);
  }

  XMLHttpRequest.prototype.send = function (body) {
    if (!_config.captureXhr) return _origXHRSend.apply(this, arguments);
    if (!this.__xr) return _origXHRSend.apply(this, arguments);
    const xr = this.__xr;
    xr.start = Date.now();
    _rememberSecrets(xr.id, xr.url, xr.rawSecrets);

    let reqBody = null;
    if (body) { try { reqBody = JSON.parse(body); } catch { reqBody = body; } }
    const graphql = _graphqlInfo(xr.url, reqBody);
    const jwtLenses = _extractJwtLenses(xr.rawSecrets);

    const baseEntry = {
      id: xr.id, type: 'api', timestamp: xr.start,
      source: 'xhr',
      method: xr.method, url: xr.url, urlPath: _path(xr.url),
      requestHeaders: xr.reqHeaders, requestBody: _limitBody(reqBody),
      pinned: false,
      initiator: xr.initiator,
      ...(graphql ? { graphql } : {}),
      ...(jwtLenses.length ? { jwtLenses } : {}),
    };

    // Rules are skipped for synchronous XHR: mock/fail/delay all resolve via
    // setTimeout, but sync callers read status/responseText as soon as send()
    // returns, so deferred simulation would hand them an empty response.
    const rule = xr.sync ? null : _matchRule(xr.method, xr.url);
    if (rule && (rule.action.type === 'mock' || rule.action.type === 'fail')) {
      _simulateXhrResponse(this, xr, rule, baseEntry);
      return;
    }
    if (rule && rule.action.type === 'delay' && rule.action.delayMs) {
      baseEntry.delayedByRuleMs = rule.action.delayMs;
      baseEntry.mockRuleId = rule.id;
    }

    this.addEventListener('loadend', () => {
      const duration = Date.now() - xr.start;
      let raw = null;
      try { raw = this.responseType === '' || this.responseType === 'text' ? this.responseText : null; } catch {}
      let parsed = null, size = 0;
      try { size = new TextEncoder().encode(raw || '').length; } catch {}
      try { parsed = JSON.parse(raw); } catch {}

      const resHeaders = {};
      try {
        (this.getAllResponseHeaders() || '').trim().split('\r\n').forEach(line => {
          const idx = line.indexOf(':');
          if (idx > 0) resHeaders[line.slice(0, idx).trim().toLowerCase()] = _safeHeader(line.slice(0, idx).trim(), line.slice(idx + 1).trim());
        });
      } catch {}

      const token = xr.reqHeaders['x-parse-token'] || null;
      // 'pending' is resolved in the isolated world by content.js — see C-6.
      const decryptStatus = _decryptPending(token, parsed) ? 'pending' : 'none';
      const decrypted = null;

      const timing = _resourceTiming(xr.url);
      _emit(Object.assign(baseEntry, {
        status: this.status, duration, size,
        responseHeaders: resHeaders,
        responseRaw: _limitText(raw, MAX_CAPTURE_TEXT_CHARS),
        responseDecrypted: decrypted,
        decryptStatus, parseToken: token,
        timing,
      }));
      if (!timing) _attachTimingLater(xr.id, xr.url);
    });

    if (rule && rule.action.type === 'delay' && rule.action.delayMs) {
      const args = arguments;
      setTimeout(() => {
        // readyState 1 = opened-but-unsent; anything else means the caller
        // aborted (or re-opened) during the delay window, so don't send.
        if (this.readyState !== 1) return;
        try { _origXHRSend.apply(this, args); } catch {}
      }, rule.action.delayMs);
      return;
    }

    return _origXHRSend.apply(this, arguments);
  };

  // ── WebSocket wrapper ──────────────────────────────────────────────────────
  function _framePreview(data) {
    try {
      if (typeof data === 'string') {
        return { preview: data.length > MAX_WS_FRAME_PREVIEW ? data.slice(0, MAX_WS_FRAME_PREVIEW) + '…' : data, size: data.length };
      }
      if (data instanceof Blob) return { preview: `[Blob ${data.size} bytes]`, size: data.size };
      if (data instanceof ArrayBuffer) return { preview: `[ArrayBuffer ${data.byteLength} bytes]`, size: data.byteLength };
      if (ArrayBuffer.isView(data)) return { preview: `[Binary ${data.byteLength} bytes]`, size: data.byteLength };
      return { preview: String(data).slice(0, MAX_WS_FRAME_PREVIEW), size: 0 };
    } catch {
      return { preview: '[unreadable frame]', size: 0 };
    }
  }

  function _trackSocketEntry(entry) {
    let dirty = false;
    let timer = null;
    function flush() {
      timer = null;
      if (!dirty) return;
      dirty = false;
      _emitUpdate({
        id: entry.id,
        status: entry.status,
        duration: entry.duration,
        size: entry.size,
        wsState: entry.wsState,
        wsFrames: entry.wsFrames.slice(-MAX_WS_FRAMES),
        wsCloseCode: entry.wsCloseCode,
      });
    }
    return {
      markDirty() {
        dirty = true;
        if (!timer) timer = setTimeout(flush, WS_UPDATE_THROTTLE_MS);
      },
      flushNow() {
        dirty = true;
        if (timer) { clearTimeout(timer); timer = null; }
        flush();
      },
    };
  }

  function _trackWebSocket(ws, url) {
    const start = Date.now();
    const entry = {
      id: _uid(), type: 'api', timestamp: start,
      source: 'ws', method: 'WS', url, urlPath: _path(url),
      status: 0, duration: 0, size: 0,
      requestHeaders: {}, requestBody: null,
      responseHeaders: {}, responseRaw: null,
      responseDecrypted: null, decryptStatus: 'none', parseToken: null,
      pinned: false,
      initiator: _initiatorStack(),
      wsState: 'connecting',
      wsFrames: [],
    };
    _emit(entry);
    const tracker = _trackSocketEntry(entry);

    function pushFrame(dir, data) {
      const { preview, size } = _framePreview(data);
      entry.wsFrames.push({ dir, ts: Date.now(), preview, size });
      if (entry.wsFrames.length > MAX_WS_FRAMES) entry.wsFrames = entry.wsFrames.slice(-MAX_WS_FRAMES);
      entry.size += size;
      tracker.markDirty();
    }

    const origSend = ws.send;
    ws.send = function (data) {
      try { pushFrame('out', data); } catch {}
      return origSend.apply(this, arguments);
    };
    ws.addEventListener('open', () => {
      entry.status = 101;
      entry.wsState = 'open';
      tracker.flushNow();
    });
    ws.addEventListener('message', (event) => {
      try { pushFrame('in', event.data); } catch {}
    });
    ws.addEventListener('error', () => {
      entry.wsState = 'error';
      tracker.flushNow();
    });
    ws.addEventListener('close', (event) => {
      entry.wsState = 'closed';
      entry.wsCloseCode = event?.code;
      entry.duration = Date.now() - start;
      tracker.flushNow();
    });
  }

  if (typeof _OrigWebSocket === 'function') {
    const WrappedWebSocket = function WebSocket(url, protocols) {
      const ws = protocols !== undefined ? new _OrigWebSocket(url, protocols) : new _OrigWebSocket(url);
      if (_config.captureWs) {
        try { _trackWebSocket(ws, _resolveUrl(String(url))); } catch {}
      }
      return ws;
    };
    WrappedWebSocket.prototype = _OrigWebSocket.prototype;
    ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'].forEach((key) => {
      try { WrappedWebSocket[key] = _OrigWebSocket[key]; } catch {}
    });
    window.WebSocket = WrappedWebSocket;
  }

  // ── EventSource (SSE) wrapper ──────────────────────────────────────────────
  function _trackEventSource(source, url) {
    const start = Date.now();
    const entry = {
      id: _uid(), type: 'api', timestamp: start,
      source: 'sse', method: 'SSE', url, urlPath: _path(url),
      status: 0, duration: 0, size: 0,
      requestHeaders: {}, requestBody: null,
      responseHeaders: {}, responseRaw: null,
      responseDecrypted: null, decryptStatus: 'none', parseToken: null,
      pinned: false,
      initiator: _initiatorStack(),
      wsState: 'connecting',
      wsFrames: [],
    };
    _emit(entry);
    const tracker = _trackSocketEntry(entry);

    source.addEventListener('open', () => {
      entry.status = 200;
      entry.wsState = 'open';
      tracker.flushNow();
    });
    source.addEventListener('message', (event) => {
      try {
        const { preview, size } = _framePreview(event.data);
        entry.wsFrames.push({ dir: 'in', ts: Date.now(), preview, size });
        if (entry.wsFrames.length > MAX_WS_FRAMES) entry.wsFrames = entry.wsFrames.slice(-MAX_WS_FRAMES);
        entry.size += size;
        tracker.markDirty();
      } catch {}
    });
    source.addEventListener('error', () => {
      entry.wsState = source.readyState === 2 ? 'closed' : 'error';
      entry.duration = Date.now() - start;
      tracker.flushNow();
    });
  }

  if (typeof _OrigEventSource === 'function') {
    const WrappedEventSource = function EventSource(url, config) {
      const source = config !== undefined ? new _OrigEventSource(url, config) : new _OrigEventSource(url);
      if (_config.captureWs) {
        try { _trackEventSource(source, _resolveUrl(String(url))); } catch {}
      }
      return source;
    };
    WrappedEventSource.prototype = _OrigEventSource.prototype;
    ['CONNECTING', 'OPEN', 'CLOSED'].forEach((key) => {
      try { WrappedEventSource[key] = _OrigEventSource[key]; } catch {}
    });
    window.EventSource = WrappedEventSource;
  }

  // ── replay bridge ──────────────────────────────────────────────────────────
  // The panel posts a replay request; the wrapped fetch captures it like any
  // page request, so replays appear in the stream with a replay marker.
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    if (!event.data?.__xray_replay__) return;
    if (event.data.token !== _bridgeToken) return;
    const request = event.data.request || {};
    const url = _resolveUrl(String(request.url || ''));
    if (!/^https?:/i.test(url)) return;
    const method = /^[A-Z]+$/.test(String(request.method || '').toUpperCase()) ? String(request.method).toUpperCase() : 'GET';
    const replayOf = typeof request.replayOf === 'string' ? request.replayOf.slice(0, 100) : null;
    // Restore the original request's sensitive header values (kept only here in
    // the MAIN world) so authed requests replay successfully. The panel only ever
    // sent us '[redacted]' placeholders.
    //
    // Only restore them when the replay still targets the origin the secrets came
    // from: Edit & Replay lets the URL be rewritten, and the editor hides the
    // redacted auth rows, so a request retargeted at another host would silently
    // carry the original site's bearer token there. On a mismatch the placeholders
    // are dropped instead (the replay just fails unauthenticated). Cookies need no
    // such check — the browser only ever attaches an origin's own cookies.
    const record = replayOf ? _secretStore.get(replayOf) : null;
    // C-2: two independent checks, so neither alone is a single point of failure.
    // `_originOf` now parses with the URL constructor pinned at document_start, and
    // `_urlIsUnder` is a plain string comparison that touches no global at all.
    const pinnedOrigin = record && record.origin ? String(record.origin) : '';
    const sameOrigin = !!pinnedOrigin
      && pinnedOrigin === _originOf(url)
      && _urlIsUnder(url, pinnedOrigin);
    const secrets = sameOrigin ? record.values : {};
    const headers = {};
    const applied = new Set();
    if (request.headers && typeof request.headers === 'object') {
      Object.entries(request.headers).slice(0, 50).forEach(([key, value]) => {
        if (typeof key !== 'string' || key.length > 200) return;
        if (FORBIDDEN_REPLAY_HEADER.test(key)) return;
        const lower = key.toLowerCase();
        if (String(value) === '[redacted]') {
          if (secrets[lower] != null) { headers[key] = String(secrets[lower]).slice(0, 4000); applied.add(lower); }
          return; // can't restore -> drop rather than send the literal placeholder
        }
        headers[key] = String(value).slice(0, 4000);
        applied.add(lower);
      });
    }
    // Re-attach any remembered secrets not present in the (possibly edited) header list.
    Object.entries(secrets).forEach(([lower, value]) => {
      if (applied.has(lower) || FORBIDDEN_REPLAY_HEADER.test(lower)) return;
      headers[lower] = String(value).slice(0, 4000);
    });
    // credentials:'include' lets the browser re-attach cookies (a forbidden header
    // we can't set manually) so cookie-based auth also survives replay.
    const init = { method, headers, credentials: 'include' };
    if (request.body != null && method !== 'GET' && method !== 'HEAD') {
      init.body = typeof request.body === 'string' ? request.body : (() => { try { return JSON.stringify(request.body); } catch { return String(request.body); } })();
    }
    _replayMark = { replayOf };
    try {
      _xrayFetch(url, init).catch(() => {});
    } catch {
      _replayMark = null;
    }
  });
})();
