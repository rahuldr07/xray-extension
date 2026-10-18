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
  // A byte body is decoded through at most this many bytes per kept char (UTF-8 needs at
  // most 3 bytes per UTF-16 unit), so a large upload is never read whole for a prefix.
  const DECODE_BYTES_PER_CHAR = 4;
  const REQUEST_DECODE_BYTES = MAX_CAPTURE_BODY_CHARS * DECODE_BYTES_PER_CHAR;
  const BASE64_PREFIX_BYTES = 64;
  // How long a Request body read may continue after the request settles before it stops
  // with what it has (a stream the page never closes must not hold the entry back).
  const SETTLE_GRACE_MS = 100;
  const MAX_GRAPHQL_VARIABLES_CHARS = 10000;
  // A request text past the capture cap is parsed (synchronously, inside the page's fetch() or
  // send()) only when it may be GraphQL, and only up to this many chars (Task 3 ruling): past it,
  // such a request shows as a plain POST.
  const MAX_GRAPHQL_PARSE_CHARS = 1000000;
  // A replayed FormData holds at most this many fields and characters of names and values
  // (src/panel/models/replayBody.ts holds the same bounds; a form captured whole always fits).
  const MAX_REPLAY_FORM_FIELDS = 1000;
  const MAX_REPLAY_FORM_CHARS = MAX_CAPTURE_BODY_CHARS;
  // Captured at document_start, before page script can replace them.
  const _TextDecoder = typeof TextDecoder === 'function' ? TextDecoder : null;
  const _TextEncoder = typeof TextEncoder === 'function' ? TextEncoder : null;
  const _XMLSerializer = typeof XMLSerializer === 'function' ? XMLSerializer : null;
  // Replay rebuilds a FormData of text fields with the constructor and append() as they were here,
  // so page script that later replaces FormData or FormData.prototype.append does not change how the
  // form is built. It is not sealed from the page: append runs through Function.prototype.call, and
  // the capture of the replayed request reads the form with FormData.prototype.forEach, so a page
  // that patches those can observe or alter its own replay, as it can any request it sends.
  const _FormData = typeof FormData === 'function' ? FormData : null;
  const _formAppend = _FormData && typeof _FormData.prototype.append === 'function' ? _FormData.prototype.append : null;
  const _btoa = typeof btoa === 'function' ? btoa : null;
  const _objectToString = Object.prototype.toString;
  const _isView = ArrayBuffer.isView;
  const MAX_RULES = 50;
  const MAX_RULE_BODY_CHARS = 100000;
  const MAX_RULE_PATTERN_CHARS = 300;
  // A quantified group that is itself quantified: (x+)+, (x*)*, (x+)*, (x{1,9})+ …
  const NESTED_QUANTIFIER = /\([^)]*[+*}][^)]*\)\s*[+*]|\([^)]*\)\s*\{\d+,\d*\}\s*[+*]/;
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

  // C-4b: the ONE boundary where a captured URL leaves this realm. Scrubbing here
  // rather than at each call site means every path (fetch, XHR, WebSocket, SSE,
  // deferred timing updates) is covered by construction, and the un-scrubbed URL
  // stays available inside this file for replay origin-pinning and the real request.
  function _scrubEntry(entry) {
    if (!entry || typeof entry !== 'object') return entry;
    if (typeof entry.url === 'string') entry.url = _scrubUrl(entry.url);
    if (typeof entry.urlPath === 'string') entry.urlPath = _scrubUrl(entry.urlPath);
    return entry;
  }

  // C1: until the first capture config arrives the interceptor does not know which
  // transports the user switched off, so completed captures wait in a bounded buffer
  // (oldest dropped) instead of reaching the panel. The first config flushes only the
  // enabled transports; with no config within PENDING_FLUSH_MS the defaults (all on)
  // apply, which is the behaviour for users who never changed a toggle.
  const MAX_PENDING_CAPTURES = 50;
  const PENDING_FLUSH_MS = 3000;
  const MAX_SUPPRESSED_IDS = 200;
  let _configured = false;
  let _pending = [];
  let _pendingTimer = null;
  const _suppressedIds = new Set();

  function _transportKey(entry) {
    const source = entry && entry.source;
    if (source === 'xhr') return 'captureXhr';
    if (source === 'ws' || source === 'sse') return 'captureWs';
    return 'captureFetch';
  }

  // True while a capture for this transport would be kept (or held for the config).
  function _captureOn(key) {
    return !_configured || _config[key] === true;
  }

  function _suppress(id) {
    if (typeof id !== 'string') return;
    _suppressedIds.add(id);
    if (_suppressedIds.size > MAX_SUPPRESSED_IDS) _suppressedIds.delete(_suppressedIds.values().next().value);
  }

  function _postCapture(entry, update) {
    try {
      window.postMessage(update
        ? { __xray_capture__: true, token: _bridgeToken, update: true, entry }
        : { __xray_capture__: true, token: _bridgeToken, entry }, '*');
      return true;
    } catch {
      return false; // never throw into the page
    }
  }

  // Spec J5: postMessage structured-clones the entry, and a DataCloneError used to be
  // swallowed here, so the request never appeared (audit #6). The entry is re-posted as a
  // clone-safe copy flagged captureDegraded; if even that fails, the loss is counted as a
  // 'clone-failed' drop, which content.js shows in the capture receipt.
  function _post(entry, update) {
    const scrubbed = _scrubEntry(entry);
    if (_postCapture(scrubbed, update)) {
      if (_dropsUnreported()) _reportDrops();
      return;
    }
    let degraded = null;
    try {
      degraded = Object.assign(_cloneSafe(scrubbed, 0), { captureDegraded: true });
    } catch {
      degraded = null; // fall through to the counted drop
    }
    if (degraded && _postCapture(degraded, update)) return;
    _countDrop('clone-failed', 1);
  }

  // Captures lost here are counted, never silent (spec J5): 'clone-failed' (the bridge
  // refused even the degraded copy) and 'pending-overflow' (the pre-config buffer was full).
  const _unreportedDrops = { 'clone-failed': 0, 'pending-overflow': 0 };

  function _dropsUnreported() {
    return _unreportedDrops['clone-failed'] > 0 || _unreportedDrops['pending-overflow'] > 0;
  }

  function _countDrop(reason, count) {
    _unreportedDrops[reason] += count;
    _reportDrops();
  }

  // Only primitives cross here, so this post cannot fail on cloning; if postMessage fails
  // anyway, the counts wait for the next post that succeeds.
  function _reportDrops() {
    for (const reason of Object.keys(_unreportedDrops)) {
      while (_unreportedDrops[reason] > 0) {
        const count = Math.min(500, _unreportedDrops[reason]);
        try {
          window.postMessage({ __xray_capture_drop__: true, token: _bridgeToken, reason, count }, '*');
        } catch {
          return; // reported with the next capture that posts
        }
        _unreportedDrops[reason] -= count;
      }
    }
  }

  function _tagOf(value) {
    return _objectToString.call(value);
  }

  // A copy postMessage can always clone, for the degraded re-post: strings, numbers,
  // booleans and null are kept, arrays and plain records are copied (bounded), and any
  // other value (function, typed array, Blob, FormData, DOM node, class instance) becomes
  // a short descriptor such as "[object FormData]".
  function _cloneSafe(value, depth) {
    if (value === null || value === undefined) return value;
    const type = typeof value;
    if (type === 'string' || type === 'boolean' || type === 'number') return value;
    if (type === 'bigint' || type === 'symbol') return String(value);
    if (type !== 'object') return `[${type}]`;
    if (depth > 8) return '[…]';
    try {
      const tag = _tagOf(value);
      if (tag === '[object Array]') {
        const out = [];
        for (let i = 0; i < Math.min(value.length, 500); i += 1) out.push(_cloneSafe(value[i], depth + 1));
        return out;
      }
      if (tag !== '[object Object]') return tag;
      const out = {};
      for (const key of Object.keys(value).slice(0, 200)) {
        let item;
        try {
          item = _cloneSafe(value[key], depth + 1);
        } catch {
          item = '[unreadable]';
        }
        // defineProperty, so an own "__proto__" key stays data instead of a prototype.
        Object.defineProperty(out, key, { value: item, enumerable: true, configurable: true, writable: true });
      }
      return out;
    } catch {
      return '[unreadable]';
    }
  }

  // Captures the full pre-config buffer dropped, by transport. An update carries no
  // source, so it is attributed through the transport its entry was held under.
  const _overflow = { captureFetch: 0, captureXhr: 0, captureWs: 0 };
  const _heldTransport = new Map();

  function _endPendingWindow() {
    if (_pendingTimer) { clearTimeout(_pendingTimer); _pendingTimer = null; }
    const held = _pending;
    _pending = [];
    _configured = true;
    const flushedIds = new Set();
    for (const item of held) {
      if (item.update) {
        if (flushedIds.has(item.entry.id)) _post(item.entry, true);
        continue;
      }
      if (_config[_transportKey(item.entry)] === true) {
        flushedIds.add(item.entry.id);
        _post(item.entry, false);
      } else {
        _suppress(item.entry.id);
      }
    }
    // Only now is it known which transports are captured: what the full buffer dropped
    // for those counts as lost; traffic the user turned off would never have been shown.
    let lost = 0;
    for (const key of Object.keys(_overflow)) {
      if (_config[key] === true) lost += _overflow[key];
      _overflow[key] = 0;
    }
    _heldTransport.clear();
    if (lost) _countDrop('pending-overflow', lost);
  }

  _pendingTimer = setTimeout(() => { _pendingTimer = null; if (!_configured) _endPendingWindow(); }, PENDING_FLUSH_MS);

  function _hold(entry, update) {
    if (!update && entry) _heldTransport.set(entry.id, _transportKey(entry));
    _pending.push({ entry, update });
    if (_pending.length > MAX_PENDING_CAPTURES) {
      const dropped = _pending.shift();
      const key = dropped.update ? _heldTransport.get(dropped.entry && dropped.entry.id) : _transportKey(dropped.entry);
      if (key) _overflow[key] += 1;
    }
  }

  // The capture guard only skips emitting: rules and the real request are unaffected.
  function _emit(entry) {
    if (!_configured) { _hold(entry, false); return; }
    if (!_config[_transportKey(entry)]) { _suppress(entry && entry.id); return; }
    _post(entry, false);
  }

  function _emitUpdate(entry) {
    if (!_configured) { _hold(entry, true); return; }
    if (entry && _suppressedIds.has(entry.id)) return;
    _post(entry, true);
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
      const pattern = url.slice(3);
      // C-14: rule sets are importable, so a shared malicious set is a plausible
      // ReDoS vector, and _matchRule runs inside EVERY fetch and XHR on the page.
      // A precise complexity bound is undecidable, so bound the two things that
      // actually make catastrophic backtracking possible: overall length, and
      // nested quantifiers of the (a+)+ / (a*)* / (a|a)* shape.
      if (pattern.length > MAX_RULE_PATTERN_CHARS) return null;
      if (NESTED_QUANTIFIER.test(pattern)) return null;
      try { regex = new RegExp(pattern); } catch { return null; }
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
    // A rules-only config says nothing about the toggles, so it must not end the
    // pending window (the toggles could still be off); a toggle-bearing one does.
    if (!_configured && ['captureFetch', 'captureXhr', 'captureWs'].some((key) => typeof config[key] === 'boolean')) {
      _endPendingWindow();
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

  // Header values are the strings fetch and XHR send (both convert them); a raw page value
  // such as a function used to make the whole entry uncloneable, and it was lost.
  function _safeHeader(name, value) {
    if (SENSITIVE_HEADER.test(String(name || ''))) return '[redacted]';
    if (typeof value === 'string') return value;
    try {
      return String(value);
    } catch {
      return '';
    }
  }

  // C-4b: URLs were captured VERBATIM, so every credential that travels in a query
  // string survived redaction untouched and was then persisted, restored on other
  // origins, and eligible to be sent to a third-party LLM. `?access_token=`, `?sig=`,
  // and presigned-S3 credentials are the common cases.
  //
  // The name test is a SUBSTRING match, not the `^...$` anchoring used for headers:
  // anchoring is what let near-misses like `x-api-key-v2` through, and query
  // parameters are named far less consistently than headers.
  const SENSITIVE_QUERY = /(token|auth|secret|password|passwd|signature|^sig$|credential|session|api[-_]?key|access[-_]?key|x-amz-security|x-amz-signature|x-amz-credential)/i;
  // Kept out of the denylist deliberately: these are near-universal and almost never
  // secret, and redacting them makes ordinary URLs unreadable in the request list.
  const QUERY_ALLOW = /^(page|limit|offset|sort|order|q|query|search|filter|lang|locale|format|v|version|id|ids)$/i;

  // Not '[redacted]': searchParams.set percent-encodes the brackets to %5B/%5D, and
  // these URLs are what the operator reads in the request list.
  const QUERY_REDACTED = 'REDACTED';

  function _scrubUrl(url) {
    const raw = String(url || '');
    // No early return on a missing '?': credentials also travel in the userinfo
    // component (https://user:pw@host/path), which has no query string at all.
    if (raw.indexOf('?') === -1 && raw.indexOf('@') === -1) return raw;
    try {
      const parsed = new _URL(raw, _pageHref());
      let touched = false;
      for (const key of Array.from(parsed.searchParams.keys())) {
        if (QUERY_ALLOW.test(key)) continue;
        if (!SENSITIVE_QUERY.test(key)) continue;
        parsed.searchParams.set(key, QUERY_REDACTED);
        touched = true;
      }
      if (parsed.username || parsed.password) {
        parsed.username = '';
        parsed.password = '';
        touched = true;
      }
      return touched ? parsed.href : raw;
    } catch {
      return raw;
    }
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
    // Kept as text, converted here: the JWT lens and replay read the values later, outside any try,
    // and a page value whose conversion throws is left out instead (the real request converts it again).
    const add = (name, value) => {
      if (!SENSITIVE_HEADER.test(String(name || ''))) return;
      try { out[String(name).toLowerCase()] = String(value); } catch { /* not kept */ }
    };
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
    // C-4b: the unscrubbed URL is remembered even when no header secret exists,
    // because the credential may live ONLY in the query string. Without this,
    // scrubbing the URL on the way out would silently break replay for every
    // request authenticated by `?access_token=` rather than by a header: the panel
    // would send REDACTED back and the replay would go out unauthenticated.
    // It stays in this MAIN-world map exactly like the header values do, and is
    // restored only when the replay still targets the origin it came from.
    const rawUrl = String(url || '');
    const scrubbed = _scrubUrl(rawUrl);
    const urlWasScrubbed = scrubbed !== rawUrl;
    if (!Object.keys(secret).length && !urlWasScrubbed) return;
    _secretStore.set(id, {
      origin: _originOf(url),
      values: secret,
      rawUrl: urlWasScrubbed ? rawUrl : null,
      scrubbedUrl: urlWasScrubbed ? scrubbed : null,
    });
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

  // ── body text (spec J4, J6) ────────────────────────────────────────────────
  // Truncation is metadata, never an in-band suffix: the kept prefix plus
  // { totalChars, keptChars }. The cut never ends inside a surrogate pair.
  function _cut(text, limit) {
    if (text.length <= limit) return { text, truncated: null };
    let end = limit;
    const last = text.charCodeAt(end - 1);
    const next = text.charCodeAt(end);
    if (last >= 0xD800 && last <= 0xDBFF && next >= 0xDC00 && next <= 0xDFFF) end -= 1;
    return { text: text.slice(0, end), truncated: { totalChars: text.length, keptChars: end } };
  }

  // UTF-8 byte length (a lone surrogate counts as the 3-byte U+FFFD sent in its place).
  // The native encoder measures a multi-megabyte body several times faster than a
  // char-code loop, even with the copy it makes.
  function _utf8Length(text) {
    try {
      return new _TextEncoder().encode(text).length;
    } catch {
      return text.length; // no encoder: UTF-16 units, as sizes were before J16
    }
  }

  // The first `limit` bytes of a Uint8Array, as a view (no copy).
  function _byteWindow(bytes, limit) {
    return new Uint8Array(bytes.buffer, bytes.byteOffset, Math.min(bytes.byteLength, limit));
  }

  // Bytes as text when they are valid UTF-8, else null. The decoder is fatal (bytes that
  // are not UTF-8 are binary, never replacement characters) and keeps a BOM, so the text
  // re-encodes to exactly the bytes sent. `windowBytes` are the first bytes of a body of
  // `totalBytes`. A partial window (more bytes follow, or may follow) decodes in stream
  // mode so a character cut at its end is not taken for invalid bytes, and its cut is
  // reported in bytes: the full text length is unknown. `whole` is the full text when the
  // window held the whole body.
  function _decodeUtf8(windowBytes, totalBytes, limit, partial = windowBytes.byteLength < totalBytes) {
    if (!_TextDecoder) return null;
    let text;
    try {
      text = new _TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(windowBytes, { stream: partial });
    } catch {
      return null; // not UTF-8
    }
    const cut = _cut(text, limit);
    if (partial) return { text: cut.text, truncated: { totalBytes, keptChars: cut.text.length }, whole: null };
    return { text: cut.text, truncated: cut.truncated, whole: text };
  }

  function _base64Prefix(bytes) {
    try {
      const head = _byteWindow(bytes, BASE64_PREFIX_BYTES);
      let binary = '';
      for (let i = 0; i < head.length; i += 1) binary += String.fromCharCode(head[i]);
      return _btoa ? _btoa(binary) : '';
    } catch {
      return '';
    }
  }

  // Bytes that are not UTF-8 text: their size and their first 64 bytes.
  function _binaryDescriptor(windowBytes, totalBytes) {
    return { binary: true, size: totalBytes, base64Prefix: _base64Prefix(windowBytes) };
  }

  function _parsedOrText(text) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  function _readBlobWindow(blob, limit) {
    return blob.slice(0, limit * DECODE_BYTES_PER_CHAR).arrayBuffer().then((buffer) => new Uint8Array(buffer));
  }

  // Reads a byte stream to its end, keeping copies of its first `limit` bytes and only
  // counting the rest, so a body of any size costs at most the window. `settled` stops
  // the read SETTLE_GRACE_MS after it resolves if the stream has not ended by then; the
  // result says whether the stream was read to its end.
  function _readStreamWindow(stream, limit, settled) {
    return new Promise((resolve) => {
      const chunks = [];
      let kept = 0;
      let total = 0;
      let over = false;
      let reader = null;
      const finish = (complete) => {
        if (over) return;
        over = true;
        const bytes = new Uint8Array(kept);
        let offset = 0;
        for (const chunk of chunks) {
          bytes.set(chunk, offset);
          offset += chunk.byteLength;
        }
        resolve({ bytes, total, complete });
      };
      const pump = () => {
        try {
          reader.read().then(({ done, value }) => {
            if (over) return;
            if (done) {
              finish(true);
              return;
            }
            const chunk = _isView(value) ? new Uint8Array(value.buffer, value.byteOffset, value.byteLength) : new Uint8Array(0);
            total += chunk.byteLength;
            if (kept < limit) {
              const take = Math.min(chunk.byteLength, limit - kept);
              chunks.push(chunk.slice(0, take));
              kept += take;
            }
            pump();
          }).catch(() => finish(false)); // a failed read or a throw above both end the read
        } catch {
          finish(false);
        }
      };
      try {
        reader = stream.getReader();
      } catch {
        finish(false);
        return;
      }
      pump();
      if (!settled) return;
      settled.then(() => setTimeout(() => {
        if (over) return;
        finish(false);
        // Cancels only this clone's branch of the tee; the page's request keeps its own.
        try {
          reader.cancel().catch(() => { /* already closed or errored */ });
        } catch {
          // a reader that cannot cancel is simply left to the garbage collector
        }
      }, SETTLE_GRACE_MS));
    });
  }

  function _isThenable(value) {
    return !!value && typeof value.then === 'function';
  }

  // Runs fn with the values once none is pending: synchronously when nothing is a promise,
  // so ordinary captures keep today's timing. Each async reader settles to degraded fields
  // on its own; one that rejects anyway is replaced by a degraded marker, so the entry is
  // still emitted and never lost waiting.
  function _whenReady(values, fn) {
    const run = (ready) => {
      try {
        fn(ready);
      } catch {
        // never throw into the page
      }
    };
    if (!values.some(_isThenable)) {
      run(values);
      return;
    }
    Promise.all(values.map((value) => (_isThenable(value)
      ? Promise.resolve(value).catch(() => ({ captureDegraded: true }))
      : value))).then(run);
  }

  // The request body as the entry carries it (spec J4). requestBodyText is the text sent,
  // verbatim and capped at MAX_CAPTURE_BODY_CHARS; requestTruncated records a cut;
  // requestBody stays the parsed form today's views read (Tasks 5 and 9 move them to the
  // text). requestBodyKind:
  //   'none'        no body: JS null/undefined, or an XHR GET/HEAD, which sends none
  //   'text'        a string, a primitive (sent as its string), an XHR Document (sent
  //                 serialized), or bytes that are UTF-8 (Blob, ArrayBuffer, typed array,
  //                 DataView, Request body)
  //   'urlencoded'  URLSearchParams, as its string
  //   'formdata'    FormData: see _formDataFields; requestBodyText is a rendering, not the
  //                 wire bytes (the browser picks the multipart boundary when it sends)
  //   'binary'      bytes that are not UTF-8: requestBody is {binary, size, base64Prefix}
  //                 (first 64 bytes) and there is no requestBodyText; a ReadableStream
  //                 body, which cannot be read without consuming it, is {binary, stream}
  // GraphQL is recognised from the whole body, whatever its size (the fields carry it).
  // A typed array, Blob or FormData never reaches the posted entry: the bridge, the store
  // and chrome.storage cannot carry them (audit #6, #7). Blob bodies are read
  // asynchronously, so for them this returns a promise of the fields.
  function _requestBodyFields(body, url, viaXhr) {
    try {
      if (body === undefined || body === null) return { requestBodyKind: 'none', requestBody: null };
      if (typeof body === 'string') return _textBodyFields(body, 'text', url);
      if (typeof body !== 'object') return _textBodyFields(String(body), 'text', url);
      const tag = _tagOf(body);
      if (tag === '[object URLSearchParams]') return _textBodyFields(String(body), 'urlencoded', url);
      if (tag === '[object FormData]') return _formDataFields(body);
      if (tag === '[object Blob]' || tag === '[object File]') return _blobBodyFields(body, url);
      if (tag === '[object ArrayBuffer]' || tag === '[object SharedArrayBuffer]') return _bytesBodyFields(new Uint8Array(body), url);
      if (_isView(body)) return _bytesBodyFields(new Uint8Array(body.buffer, body.byteOffset, body.byteLength), url);
      if (tag === '[object ReadableStream]') return { requestBodyKind: 'binary', requestBody: { binary: true, stream: true } };
      // XHR sends a Document serialized; fetch converts it to its string like any object.
      if (viaXhr && /^\[object (?:HTML|XML)?Document\]$/.test(tag)) return _textBodyFields(_documentText(body, tag), 'text', url);
      return _textBodyFields(String(body), 'text', url);
    } catch {
      return { requestBody: null, captureDegraded: true };
    }
  }

  // XHR's serialization of a Document body: an HTML document's children in HTML syntax
  // (doctype, comments, the root element's markup); any other document through
  // XMLSerializer.
  function _documentText(doc, tag) {
    if (tag !== '[object HTMLDocument]') return _XMLSerializer ? new _XMLSerializer().serializeToString(doc) : String(doc);
    const nodes = doc.childNodes;
    let text = '';
    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      if (node.nodeType === 10) text += `<!DOCTYPE ${node.name}>`;
      else if (node.nodeType === 8) text += `<!--${node.data}-->`;
      else if (node.nodeType === 1) text += node.outerHTML;
    }
    return text;
  }

  // A Request's own body, read from a clone (fetch tees the stream, so the page's request
  // is untouched) through a bounded window: only the first bytes are kept, the rest is
  // counted. The read ends with the stream, or shortly after the real request settles: a
  // stream the page never closes, or an upload it aborted, still yields its entry,
  // captureDegraded with the bytes seen so far.
  function _requestObjectBodyFields(req, url, settled) {
    try {
      const method = String(req.method || 'GET').toUpperCase();
      if (req.body === null || method === 'GET' || method === 'HEAD') return { requestBodyKind: 'none', requestBody: null };
      const stream = req.clone().body;
      if (!stream || typeof stream.getReader !== 'function') return { requestBody: null, captureDegraded: true };
      return _readStreamWindow(stream, REQUEST_DECODE_BYTES, settled)
        .then(({ bytes, total, complete }) => (complete
          ? _bytesFields(bytes, total, url)
          : Object.assign(_bytesFields(bytes, total, url, true), { captureDegraded: true })))
        .catch(() => ({ requestBody: null, captureDegraded: true }));
    } catch {
      return { requestBody: null, captureDegraded: true };
    }
  }

  // Whether parsing a request text is worth its cost in the page (Task 3 ruling): always for a
  // text within the capture cap (its parsed form is the entry's requestBody); past the cap only
  // to recognise GraphQL, and never past MAX_GRAPHQL_PARSE_CHARS. The cheap pre-check is the
  // text containing "query": a body _graphqlInfo can read has a string `query` member, so a
  // GraphQL content type adds no body this check misses. Any other text is never parsed whole.
  function _parseWorthwhile(text, truncated) {
    return !truncated || (text.length <= MAX_GRAPHQL_PARSE_CHARS && text.indexOf('query') !== -1);
  }

  // GraphQL is recognised from the whole text (bounded above), so its variables keep their own
  // cut; the parsed form is the entry's requestBody only when nothing was cut.
  function _textBodyFields(text, kind, url) {
    const cut = _cut(text, MAX_CAPTURE_BODY_CHARS);
    const parsed = kind === 'text' && _parseWorthwhile(text, !!cut.truncated) ? _parsedOrText(text) : text;
    const fields = {
      requestBodyKind: kind,
      requestBodyText: cut.text,
      requestBody: cut.truncated ? cut.text : parsed,
    };
    if (cut.truncated) fields.requestTruncated = cut.truncated;
    return _withGraphql(fields, url, parsed);
  }

  function _withGraphql(fields, url, parsed) {
    const graphql = _graphqlInfo(url, parsed);
    if (graphql) fields.graphql = graphql;
    return fields;
  }

  function _bytesBodyFields(bytes, url) {
    return _bytesFields(_byteWindow(bytes, REQUEST_DECODE_BYTES), bytes.byteLength, url);
  }

  // A byte body from its first bytes and its size. `partial` marks a body whose end was
  // not seen (a stream read stopped early).
  function _bytesFields(windowBytes, totalBytes, url, partial) {
    const decoded = _decodeUtf8(windowBytes, totalBytes, MAX_CAPTURE_BODY_CHARS, partial);
    if (!decoded) return { requestBodyKind: 'binary', requestBody: _binaryDescriptor(windowBytes, totalBytes) };
    const parsed = decoded.whole !== null && _parseWorthwhile(decoded.whole, !!decoded.truncated) ? _parsedOrText(decoded.whole) : null;
    const fields = {
      requestBodyKind: 'text',
      requestBodyText: decoded.text,
      requestBody: decoded.truncated ? decoded.text : parsed,
    };
    if (decoded.truncated) fields.requestTruncated = decoded.truncated;
    // Inside the decode window the whole text is known, so GraphQL is read from it too.
    return decoded.whole === null ? fields : _withGraphql(fields, url, parsed);
  }

  function _blobBodyFields(blob, url) {
    const totalBytes = Number(blob.size) || 0;
    return _readBlobWindow(blob, MAX_CAPTURE_BODY_CHARS)
      .then((windowBytes) => _bytesFields(windowBytes, totalBytes, url))
      .catch(() => ({ requestBodyKind: 'binary', requestBody: { binary: true, size: totalBytes, base64Prefix: '' }, captureDegraded: true }));
  }

  // FormData: requestBody is [[name, value | {file, size, type}], …] in order;
  // requestBodyText is one `name=value` line per field, a file as
  // `name=[file "a.png", image/png, 4 bytes]`, values unescaped. Pairs and text share the
  // 50,000-char budget, and the full rendering is measured by summing, never built, so a
  // huge field costs no copy.
  function _formDataFields(form) {
    const pairs = [];
    const pieces = [];
    let pairRoom = MAX_CAPTURE_BODY_CHARS;
    let textRoom = MAX_CAPTURE_BODY_CHARS + 1; // one char past the cap lets _cut see a pair
    let totalChars = 0;
    let count = 0;
    form.forEach((value, name) => {
      const key = String(name);
      const file = typeof value === 'string' ? null
        : { file: String(value?.name ?? ''), size: Number(value?.size) || 0, type: String(value?.type ?? '') };
      const shown = file ? `[file "${file.file}", ${file.type || 'no type'}, ${file.size} bytes]` : value;
      const separator = count ? 1 : 0;
      const lineLength = key.length + 1 + shown.length;
      count += 1;
      totalChars += separator + lineLength;
      if (textRoom > 0) {
        const piece = `${separator ? '\n' : ''}${key}=${shown.slice(0, Math.max(0, textRoom - separator - key.length - 1))}`.slice(0, textRoom);
        pieces.push(piece);
        textRoom -= piece.length;
      }
      if (pairRoom > 0) {
        // The separator before a field takes room too, as it does in the text.
        const room = pairRoom - separator;
        pairs.push([key, file || (lineLength > room ? _cut(value, Math.max(0, room - key.length - 1)).text : value)]);
        pairRoom -= separator + lineLength;
      }
    });
    const cut = _cut(pieces.join(''), MAX_CAPTURE_BODY_CHARS);
    const fields = { requestBodyKind: 'formdata', requestBodyText: cut.text, requestBody: pairs };
    if (totalChars > cut.text.length) fields.requestTruncated = { totalChars, keptChars: cut.text.length };
    return fields;
  }

  // Response text as the entry carries it: the kept prefix, and responseTruncated when
  // it was cut (spec J6).
  function _responseTextFields(raw) {
    if (typeof raw !== 'string') return { responseRaw: null };
    const cut = _cut(raw, MAX_CAPTURE_TEXT_CHARS);
    return cut.truncated ? { responseRaw: cut.text, responseTruncated: cut.truncated } : { responseRaw: cut.text };
  }

  function _responseFields(raw) {
    if (typeof raw !== 'string') return { responseRaw: null, size: 0 };
    return Object.assign({ size: _utf8Length(raw) }, _responseTextFields(raw));
  }

  // A byte response: text when it is UTF-8; otherwise no text, and responseBinary
  // describes the bytes (size and first 64 bytes).
  function _responseBytesFields(windowBytes, totalBytes) {
    const decoded = _decodeUtf8(windowBytes, totalBytes, MAX_CAPTURE_TEXT_CHARS);
    if (!decoded) return { responseRaw: null, size: totalBytes, responseBinary: _binaryDescriptor(windowBytes, totalBytes) };
    return decoded.truncated
      ? { responseRaw: decoded.text, responseTruncated: decoded.truncated, size: totalBytes }
      : { responseRaw: decoded.text, size: totalBytes };
  }

  // Spec J5: responseType 'json' is re-serialized from the parsed value (flagged
  // bodyReserialized: the browser already rounded big numbers and reordered integer keys);
  // 'arraybuffer' and 'blob' are decoded when UTF-8 (a blob is read asynchronously, so this
  // returns a promise for it). 'document' is not captured as text.
  function _xhrResponseFields(xhr) {
    try {
      const type = xhr.responseType || '';
      if (type === 'text' || type === '') return _responseFields(xhr.responseText);
      if (type === 'json') {
        const value = xhr.response;
        if (value === null || value === undefined) return { responseRaw: null, size: 0 };
        return Object.assign(_responseFields(JSON.stringify(value)), { bodyReserialized: true });
      }
      if (type === 'arraybuffer') {
        const buffer = xhr.response;
        if (!buffer) return { responseRaw: null, size: 0 };
        const bytes = new Uint8Array(buffer);
        return _responseBytesFields(_byteWindow(bytes, MAX_CAPTURE_TEXT_CHARS * DECODE_BYTES_PER_CHAR), bytes.byteLength);
      }
      if (type === 'blob') {
        const blob = xhr.response;
        if (!blob) return { responseRaw: null, size: 0 };
        const totalBytes = Number(blob.size) || 0;
        return _readBlobWindow(blob, MAX_CAPTURE_TEXT_CHARS)
          .then((windowBytes) => _responseBytesFields(windowBytes, totalBytes))
          .catch(() => ({ responseRaw: null, size: totalBytes, captureDegraded: true }));
      }
      return { responseRaw: null, size: 0 };
    } catch {
      return { responseRaw: null, size: 0, captureDegraded: true };
    }
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
      // Large variables travel as their cut JSON text, the cut recorded as metadata (J6).
      let variables = null;
      let variablesTruncated = null;
      if (body.variables && typeof body.variables === 'object') {
        try {
          const text = JSON.stringify(body.variables);
          if (text.length > MAX_GRAPHQL_VARIABLES_CHARS) {
            const cut = _cut(text, MAX_GRAPHQL_VARIABLES_CHARS);
            variables = cut.text;
            variablesTruncated = cut.truncated;
          } else {
            variables = body.variables;
          }
        } catch {
          variables = null; // unserializable variables are left out
        }
      }
      return variablesTruncated ? { operationType, operationName, variables, variablesTruncated } : { operationType, operationName, variables };
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
  // Capture is off for fetch: skip every capture-side cost, but still honour rules.
  async function _ruleOnlyFetch(args) {
    if (!_config.rules.length) return _origFetch.apply(this, args);
    let url = '', method = 'GET';
    try {
      const req = args[0];
      const init = args[1] || {};
      if (req instanceof Request) {
        url = req.url;
        method = (init.method || req.method || 'GET').toUpperCase();
      } else {
        url = _resolveUrl(String(req));
        method = (init.method || 'GET').toUpperCase();
      }
    } catch { return _origFetch.apply(this, args); }
    const rule = _matchRule(method, url);
    if (rule && rule.action.type === 'fail') throw new TypeError(`Failed to fetch (XRAY rule "${rule.id}")`);
    if (rule && rule.action.type === 'mock') {
      if (rule.action.delayMs) await _sleep(rule.action.delayMs);
      const status = rule.action.status;
      const headers = Object.assign({ 'content-type': 'application/json' }, rule.action.headers);
      return new Response(status === 204 || status === 205 || status === 304 ? null : (rule.action.body || ''), { status, headers });
    }
    if (rule && rule.action.type === 'delay' && rule.action.delayMs) await _sleep(rule.action.delayMs);
    return _origFetch.apply(this, args);
  }

  const _xrayFetch = async function (...args) {
    // Consume the replay mark before the capture guard: if fetch capture is
    // off, the mark must still be cleared or it would tag the next captured
    // request as a replay.
    const replayMark = _replayMark;
    _replayMark = null;
    if (!_captureOn('captureFetch')) return _ruleOnlyFetch.call(this, args);
    const id    = _uid();
    const start = Date.now();
    const initiator = _initiatorStack();

    let url = '', method = 'GET', reqHeaders = {};
    let bodyFields = { requestBodyKind: 'none', requestBody: null };
    // Resolved once the real request settles (answered, failed, or answered by a rule): a
    // Request body read that has not ended by then stops shortly after.
    let settle = null;
    const settled = new Promise((resolve) => { settle = resolve; });
    try {
      const req = args[0];
      const init = args[1] || {};
      if (req instanceof Request) {
        url        = req.url; // Request.url is always absolute
        method     = (init.method || req.method || 'GET').toUpperCase();
        reqHeaders = Object.assign(_parseHeaders(req.headers), _parseHeaders(init.headers));
        _rememberSecrets(id, url, req.headers, init.headers);
        // init.body, when given, replaces the Request's own body, as fetch does. The read
        // is not awaited here: the request goes out now and the entry waits for its body.
        bodyFields = init.body != null ? _requestBodyFields(init.body, url) : _requestObjectBodyFields(req, url, settled);
      } else {
        url        = _resolveUrl(String(req)); // Resolve relative URLs
        method     = (init.method || 'GET').toUpperCase();
        reqHeaders = _parseHeaders(init.headers);
        _rememberSecrets(id, url, init.headers);
        bodyFields = _requestBodyFields(init.body, url);
      }
    } catch { /* an unreadable argument keeps the defaults; the real fetch reports it */ }

    const jwtLenses = _extractJwtLenses(_secretStore.get(id)?.values);
    const baseEntry = {
      id, type: 'api', timestamp: start,
      source: 'fetch',
      method, url, urlPath: _path(url),
      requestHeaders: reqHeaders,
      pinned: false,
      initiator,
      ...(jwtLenses.length ? { jwtLenses } : {}),
      ...(replayMark ? { replayed: true, replayOf: replayMark.replayOf } : {}),
    };
    // Emits the entry once its request body is ready: now for most bodies, after the read
    // for a Blob or Request body. `after` runs once the entry is out (timing updates for
    // an id the isolated world has not seen yet would be dropped).
    const emitWithBody = (complete, after) => {
      settle();
      _whenReady([bodyFields], ([fields]) => {
        _emit(complete(Object.assign(baseEntry, fields)));
        if (after) after();
      });
    };

    const rule = _matchRule(method, url);
    if (rule && rule.action.type === 'fail') {
      emitWithBody((entry) => _mockEntry(Object.assign(entry, {
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
      const duration = Date.now() - start;
      emitWithBody((entry) => _mockEntry(Object.assign(entry, {
        duration,
        size: body.length,
        responseHeaders: headers,
        ..._responseTextFields(body),
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
      settle();
    } catch (err) {
      const duration = Date.now() - start;
      emitWithBody((entry) => Object.assign(entry, {
        status: 0, duration,
        responseHeaders: {}, responseRaw: null,
        responseDecrypted: null, decryptStatus: 'none',
        parseToken: null, size: 0,
      }));
      throw err;
    }

    const duration = Date.now() - start;
    const resHeaders = _parseHeaders(response.headers);
    const token = reqHeaders['x-parse-token'] || reqHeaders['X-Parse-Token'] || null;

    // A body that cannot be read (the page aborted it mid-stream, say) used to lose the
    // whole entry; it now arrives without a body, flagged captureDegraded (spec J5).
    const finish = (raw, extra) => {
      let parsed = null;
      if (typeof raw === 'string') {
        try { parsed = JSON.parse(raw); } catch { /* not JSON */ }
      }
      // 'pending' is resolved in the isolated world by content.js — see C-6.
      const decryptStatus = _decryptPending(token, parsed) ? 'pending' : 'none';
      const timing = _resourceTiming(url);
      emitWithBody((entry) => Object.assign(entry, {
        status: response.status, duration,
        responseHeaders: resHeaders,
        ..._responseFields(raw),
        responseDecrypted: null,
        decryptStatus, parseToken: token,
        timing,
      }, extra), () => { if (!timing) _attachTimingLater(id, url); });
    };
    try {
      response.clone().text()
        .then((raw) => finish(raw), () => finish(null, { captureDegraded: true }))
        .catch(() => { /* nothing may reach the page as an unhandled rejection */ });
    } catch {
      finish(null, { captureDegraded: true });
    }

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
    try {
      if (!xhr || !xhr.__xrMockShadow) return;
      for (const name of MOCK_SHADOWED) delete xhr[name];
      delete xhr.__xrMockShadow;
    } catch {
      // never throw into the page; a shadow that cannot be removed stays
    }
  }

  // The wrappers never throw into the page: an argument the bookkeeping cannot read
  // (a number is fine, an object whose toString throws is not) is left to the native
  // call, which reports it exactly as it would without XRAY.
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    _clearMockShadow(this);
    // Always tracked: rules need the method/URL even when capture is off.
    try {
      this.__xr = {
        id: _uid(), method: String(method ?? 'GET').toUpperCase(), url: _resolveUrl(String(url)),
        reqHeaders: {}, start: 0, initiator: _captureOn('captureXhr') ? _initiatorStack() : null,
        sync: rest.length > 0 && rest[0] === false,
      };
    } catch {
      try {
        this.__xr = null; // untracked: send() passes straight through
      } catch {
        // the native open() reports a receiver it cannot use
      }
    }
    return _origXHROpen.apply(this, [method, url, ...rest]);
  };

  XMLHttpRequest.prototype.setRequestHeader = function (name, value) {
    try {
      if (this.__xr) {
        const key = String(name).toLowerCase();
        this.__xr.reqHeaders[key] = _safeHeader(key, value);
        // The raw value is kept as text, converted here inside the try: send() reads it later outside
        // any try (the JWT lens), and a page value whose conversion throws must not throw from there.
        if (SENSITIVE_HEADER.test(key)) {
          const text = String(value);
          (this.__xr.rawSecrets || (this.__xr.rawSecrets = {}))[key] = text;
        }
      }
    } catch {
      // left to the native setRequestHeader() below
    }
    return _origXHRSetHeader.apply(this, arguments);
  };

  function _simulateXhrResponse(xhr, xr, rule, baseEntry) {
    const fail = rule.action.type === 'fail';
    // baseEntry is null when capture is off: simulate the response, report nothing.
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

      if (baseEntry) {
        const duration = Date.now() - xr.start;
        _whenReady([xr.bodyFields], ([fields]) => {
          _emit(_mockEntry(Object.assign(baseEntry, fields, {
            duration,
            size: body.length,
            responseHeaders: headers,
            ..._responseTextFields(body),
            responseDecrypted: null, decryptStatus: 'none', parseToken: null,
          }), rule));
        });
      }

      try {
        xhr.dispatchEvent(new Event('readystatechange'));
        if (fail) xhr.dispatchEvent(new ProgressEvent('error'));
        else xhr.dispatchEvent(new ProgressEvent('load'));
        xhr.dispatchEvent(new ProgressEvent('loadend'));
      } catch {}
    }, rule.action.delayMs || 0);
  }

  XMLHttpRequest.prototype.send = function (body) {
    if (!this.__xr) return _origXHRSend.apply(this, arguments);
    const xr = this.__xr;
    xr.start = Date.now();
    if (!_captureOn('captureXhr')) {
      // Capture is off: skip bodies, secrets and the loadend reporter, keep rules.
      const quietRule = xr.sync ? null : _matchRule(xr.method, xr.url);
      if (quietRule && (quietRule.action.type === 'mock' || quietRule.action.type === 'fail')) {
        _simulateXhrResponse(this, xr, quietRule, null);
        return;
      }
      if (quietRule && quietRule.action.type === 'delay' && quietRule.action.delayMs) {
        const quietArgs = arguments;
        setTimeout(() => {
          if (this.readyState !== 1) return;
          try { _origXHRSend.apply(this, quietArgs); } catch { /* page-owned xhr state */ }
        }, quietRule.action.delayMs);
        return;
      }
      return _origXHRSend.apply(this, arguments);
    }
    _rememberSecrets(xr.id, xr.url, xr.rawSecrets);

    // XHR sends no body for GET and HEAD, whatever send() was given. The body fields live
    // on the per-send state, so a reused object never mixes up two sends' bodies.
    xr.bodyFields = _requestBodyFields(xr.method === 'GET' || xr.method === 'HEAD' ? null : body, xr.url, true);
    const jwtLenses = _extractJwtLenses(xr.rawSecrets);

    const baseEntry = {
      id: xr.id, type: 'api', timestamp: xr.start,
      source: 'xhr',
      method: xr.method, url: xr.url, urlPath: _path(xr.url),
      requestHeaders: xr.reqHeaders,
      pinned: false,
      initiator: xr.initiator,
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

    // The live per-send state the loadend handler reads. It must come off `this.__xr`
    // rather than the closure: `open()` replaces `__xr` with a fresh id, and the
    // listener below outlives the send that registered it.
    xr.baseEntry = baseEntry;

    // Bound ONCE per XMLHttpRequest object. This used to register a new listener on
    // every send() and never remove the old ones, so a page polling with one reused
    // XHR -- legal, and the pattern the comment above calls common -- fired every
    // stale listener on each response: the k-th response emitted k entries, the stale
    // ones carrying the OLD id, url and timestamp with the NEW status and body. Three
    // polls produced six entries, three with duplicate ids and responses filed under
    // the wrong request; a hundred polls produced 5050 and evicted every real capture.
    if (!this.__xrLoadendBound) {
      this.__xrLoadendBound = true;
      this.addEventListener('loadend', () => {
        const xr = this.__xr;
        // No base entry means this send was mocked or failed by a rule and has already
        // been reported by _simulateXhrResponse.
        if (!xr || !xr.baseEntry || xr.emitted) return;
        xr.emitted = true;
        const baseEntry = xr.baseEntry;
        const duration = Date.now() - xr.start;
        // Everything this send reports is read now: a blob response is read
        // asynchronously, and by then the page may have reused this object.
        let status = 0;
        try { status = this.status; } catch { /* reported as 0 */ }
        const response = _xhrResponseFields(this);

        const resHeaders = {};
        try {
          (this.getAllResponseHeaders() || '').trim().split('\r\n').forEach(line => {
            const idx = line.indexOf(':');
            if (idx > 0) resHeaders[line.slice(0, idx).trim().toLowerCase()] = _safeHeader(line.slice(0, idx).trim(), line.slice(idx + 1).trim());
          });
        } catch { /* reported without response headers */ }

        const token = xr.reqHeaders['x-parse-token'] || null;
        _whenReady([xr.bodyFields, response], ([fields, res]) => {
          let parsed = null;
          if (typeof res.responseRaw === 'string') {
            try { parsed = JSON.parse(res.responseRaw); } catch { /* not JSON */ }
          }
          // 'pending' is resolved in the isolated world by content.js — see C-6.
          const decryptStatus = _decryptPending(token, parsed) ? 'pending' : 'none';
          const timing = _resourceTiming(xr.url);
          _emit(Object.assign(baseEntry, fields, {
            status, duration,
            responseHeaders: resHeaders,
            responseDecrypted: null,
            decryptStatus, parseToken: token,
            timing,
          }, res));
          // After the entry: an update for an id the isolated world has not seen is dropped.
          if (!timing) _attachTimingLater(xr.id, xr.url);
        });
      });
    }

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
  // Spec J16: a frame's size is the bytes that crossed the socket (UTF-8 for text), and a
  // text frame past the preview cap keeps its prefix with `truncated: { totalChars,
  // keptChars }` instead of an in-band ellipsis.
  function _framePreview(data) {
    try {
      if (typeof data === 'string') return _textFrame(data);
      if (data instanceof Blob) return { preview: `[Blob ${data.size} bytes]`, size: data.size };
      if (data instanceof ArrayBuffer) return { preview: `[ArrayBuffer ${data.byteLength} bytes]`, size: data.byteLength };
      if (ArrayBuffer.isView(data)) return { preview: `[Binary ${data.byteLength} bytes]`, size: data.byteLength };
      return _textFrame(String(data));
    } catch {
      return { preview: '[unreadable frame]', size: 0 };
    }
  }

  function _textFrame(text) {
    const cut = _cut(text, MAX_WS_FRAME_PREVIEW);
    const frame = { preview: cut.text, size: _utf8Length(text) };
    if (cut.truncated) frame.truncated = cut.truncated;
    return frame;
  }

  function _trackSocketEntry(entry) {
    let dirty = false;
    let timer = null;
    function flush() {
      timer = null;
      if (!dirty) return;
      dirty = false;
      if (_configured && !_config.captureWs) return; // toggled off mid-socket: stop reporting
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
      const frame = _framePreview(data);
      entry.wsFrames.push(Object.assign({ dir, ts: Date.now() }, frame));
      if (entry.wsFrames.length > MAX_WS_FRAMES) entry.wsFrames = entry.wsFrames.slice(-MAX_WS_FRAMES);
      entry.size += frame.size;
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
        const frame = _framePreview(event.data);
        entry.wsFrames.push(Object.assign({ dir: 'in', ts: Date.now() }, frame));
        if (entry.wsFrames.length > MAX_WS_FRAMES) entry.wsFrames = entry.wsFrames.slice(-MAX_WS_FRAMES);
        entry.size += frame.size;
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

  // A FormData rebuilt from its captured [name, value] text fields, names, values and order kept
  // (the browser picks a new multipart boundary), or null when the fields are not that or exceed
  // the bounds. Never throws into the page.
  function _replayForm(pairs) {
    try {
      if (!_FormData || !_formAppend || !Array.isArray(pairs) || pairs.length > MAX_REPLAY_FORM_FIELDS) return null;
      let chars = 0;
      for (const pair of pairs) {
        if (!Array.isArray(pair) || pair.length !== 2 || typeof pair[0] !== 'string' || typeof pair[1] !== 'string') return null;
        chars += pair[0].length + pair[1].length;
        if (chars > MAX_REPLAY_FORM_CHARS) return null;
      }
      const form = new _FormData();
      for (const pair of pairs) _formAppend.call(form, pair[0], pair[1]);
      return form;
    } catch {
      return null;
    }
  }

  // ── replay bridge ──────────────────────────────────────────────────────────
  // The panel posts a replay request; the wrapped fetch captures it like any
  // page request, so replays appear in the stream with a replay marker. Never throws
  // into the page: a request a conversion fails on (a page that broke a built-in this
  // path uses) is dropped.
  window.addEventListener('message', (event) => {
    try {
      _onReplayMessage(event);
    } catch {
      _replayMark = null;
    }
  });

  function _onReplayMessage(event) {
    if (event.source !== window) return;
    if (!event.data?.__xray_replay__) return;
    if (event.data.token !== _bridgeToken) return;
    const request = event.data.request || {};
    let url = _resolveUrl(String(request.url || ''));
    if (!/^https?:/i.test(url)) return;
    const method = /^[A-Z]+$/.test(String(request.method || '').toUpperCase()) ? String(request.method).toUpperCase() : 'GET';
    const replayOf = typeof request.replayOf === 'string' ? request.replayOf.slice(0, 100) : null;
    // The body (spec J10): the request text exactly as the panel gives it — the captured text or the
    // Edit & Replay editor's — or a FormData of text fields rebuilt from its captured fields. Nothing
    // else is sent; fields that cannot be rebuilt drop the replay rather than send another body.
    let body;
    if (typeof request.body === 'string') body = request.body;
    else if (request.body && typeof request.body === 'object' && 'formdata' in request.body) {
      body = _replayForm(request.body.formdata);
      if (!body) return;
    }
    const rebuiltForm = body !== undefined && typeof body !== 'string';
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
    // Restore the unscrubbed URL only when the operator did not edit it. If they
    // changed anything, their version wins and the credential is not smuggled into
    // a URL they rewrote. Gated on the same origin check as the header secrets.
    if (sameOrigin && record.rawUrl && url === record.scrubbedUrl) {
      url = record.rawUrl;
    }
    const headers = {};
    const applied = new Set();
    if (request.headers && typeof request.headers === 'object') {
      Object.entries(request.headers).slice(0, 50).forEach(([key, value]) => {
        if (typeof key !== 'string' || key.length > 200) return;
        if (FORBIDDEN_REPLAY_HEADER.test(key)) return;
        const lower = key.toLowerCase();
        // A rebuilt form gets a new boundary from the browser: the captured one would not match it.
        if (rebuiltForm && lower === 'content-type' && /^\s*multipart\//i.test(String(value))) return;
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
    if (body !== undefined && method !== 'GET' && method !== 'HEAD') init.body = body;
    _replayMark = { replayOf };
    try {
      _xrayFetch(url, init).catch(() => {});
    } catch {
      _replayMark = null;
    }
  }
})();
