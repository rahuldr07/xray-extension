// content/content.js — ISOLATED world entry point
// Listens for capture events from MAIN world scripts and feeds them to the panel.
// Also handles toggle messages from the background service worker.
(function () {
  'use strict';

  // shared/console-helpers.js is now listed in the ISOLATED group directly, so it
  // arrives with the rest of this world's scripts and no dynamic import is needed.
  //
  // It used to sit in the MAIN group, and the single-injection rule (Chrome injects a
  // file once per frame even when it is listed in both worlds) meant the isolated
  // world had to import it at runtime. That arrangement existed for the MAIN-world
  // console executor, which C-1 deleted. Nothing in the page realm read the helpers
  // after that, so the file was being parsed on every page visit for no consumer
  // while leaving a writable global there. Moving it here removes both, and lets it
  // drop out of web_accessible_resources as well.

  let _panelReady = false;
  let _panelInitPromise = null;
  let _bridgeToken = null;
  const _captureReceiptState = {
    accepted: 0,
    dropped: 0,
    dropReasons: {},
    validated: 0,
    delivered: 0,
    noConsumer: 0,
    relayFailed: 0,
    deliveryReasons: {},
    lastEventAt: null,
  };
  const _captureReceiptListeners = new Set();
  // Drops the page-side capture scripts report over the bridge (spec J5): 'clone-failed'
  // (not postable even degraded) and 'pending-overflow' (the pre-config buffer was full).
  const PAGE_DROP_REASONS = new Set(['clone-failed', 'pending-overflow']);

  function _captureReceiptSnapshot() {
    return {
      accepted: _captureReceiptState.accepted,
      dropped: _captureReceiptState.dropped,
      dropReasons: { ..._captureReceiptState.dropReasons },
      validated: _captureReceiptState.validated,
      delivered: _captureReceiptState.delivered,
      noConsumer: _captureReceiptState.noConsumer,
      relayFailed: _captureReceiptState.relayFailed,
      deliveryReasons: { ..._captureReceiptState.deliveryReasons },
      lastEventAt: _captureReceiptState.lastEventAt,
    };
  }

  function _publishCaptureReceipt() {
    const receipt = _captureReceiptSnapshot();
    _captureReceiptListeners.forEach((listener) => {
      try { listener(receipt); } catch { /* receipt observers are diagnostic only */ }
    });
    window.XRAY_Panel?.noteCaptureReceipt?.(receipt);
    // Aggregate-only bridge for diagnostics/e2e. No entry fields cross this message.
    window.postMessage({ __xray_capture_receipt__: true, receipt }, '*');
    window.XRAY_Worker?.captureReceipt?.(receipt).catch?.(() => {});
  }

  function _recordCaptureAccepted(count = 1) {
    _captureReceiptState.accepted = Math.min(500000,
      _captureReceiptState.accepted + Math.max(0, Math.min(500, count)));
    _captureReceiptState.validated = Math.min(500000,
      _captureReceiptState.validated + Math.max(0, Math.min(500, count)));
    _captureReceiptState.lastEventAt = Date.now();
    _publishCaptureReceipt();
  }

  function _recordDelivery(outcome, count = 1) {
    const bounded = Math.max(0, Math.min(500, Number(count) || 0));
    if (!bounded) return;
    const key = outcome === 'delivered' || outcome === 'no-consumer' || outcome === 'relay-failed' ? outcome : 'relay-failed';
    const field = key === 'delivered' ? 'delivered' : key === 'no-consumer' ? 'noConsumer' : 'relayFailed';
    _captureReceiptState[field] = Math.min(500000, _captureReceiptState[field] + bounded);
    _captureReceiptState.deliveryReasons[key] = Math.min(500000,
      (_captureReceiptState.deliveryReasons[key] || 0) + bounded);
    _captureReceiptState.lastEventAt = Date.now();
    _publishCaptureReceipt();
  }

  // Bad-token drops come from page-controlled messages: count them, but publish at
  // most once per window so a postMessage flood cannot drive the panel store.
  let _dropPublishTimer = null;
  function _publishCaptureReceiptSoon() {
    if (_dropPublishTimer) return;
    _dropPublishTimer = setTimeout(() => {
      _dropPublishTimer = null;
      _publishCaptureReceipt();
    }, 250);
  }

  function _recordCaptureDrop(reason, count = 1) {
    const bounded = Math.max(0, Math.min(500, count));
    _captureReceiptState.dropped = Math.min(500000, _captureReceiptState.dropped + bounded);
    _captureReceiptState.dropReasons[reason] = Math.min(500000,
      (_captureReceiptState.dropReasons[reason] || 0) + bounded);
    _captureReceiptState.lastEventAt = Date.now();
    // These come from page-readable channels, so a flood must not drive the panel store.
    if (reason === 'bridge-token' || PAGE_DROP_REASONS.has(reason)) _publishCaptureReceiptSoon();
    else _publishCaptureReceipt();
  }

  window.XRAY_CaptureReceipt = {
    get: _captureReceiptSnapshot,
    subscribe(listener) {
      if (typeof listener !== 'function') return () => {};
      _captureReceiptListeners.add(listener);
      return () => _captureReceiptListeners.delete(listener);
    },
  };
  const XRAY_FOCUS_TRAP_EVENTS = [
    'keydown', 'keyup', 'keypress', 'beforeinput', 'input',
    'pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'dblclick',
    'contextmenu', 'wheel', 'touchstart', 'touchmove', 'touchend',
  ];
  const XRAY_FOCUS_TRAP_TARGETS = [window, document];

  function _isToggleShortcut(event) {
    return (event.ctrlKey || event.metaKey) &&
      event.shiftKey &&
      (event.key?.toLowerCase() === 'x' || event.code === 'KeyX');
  }

  function _isKeyboardEvent(event) {
    return event.type === 'keydown' ||
      event.type === 'keyup' ||
      event.type === 'keypress' ||
      event.type === 'beforeinput' ||
      event.type === 'input';
  }

  function _isBrowserShortcut(event) {
    if (!event.ctrlKey && !event.metaKey && !event.altKey) return false;
    if (_isToggleShortcut(event)) return false;
    return true;
  }

  // Hosts the focus trap must treat as "inside XRAY". The HUD host was missing, so with
  // the HUD open every keystroke aimed at it was cancelled on the window capture
  // listener before React inside the shadow root ever saw it -- the filter box and the
  // console prompt simply could not be typed into. `xr-panel` and `.xr-hud` are names
  // no code in this repo produces any more; the data attribute is the durable check,
  // because isolatePanelEvents stamps it on every host it wires up.
  const XRAY_HOST_IDS = new Set(['__xray_root__', 'xray-hud-host']);

  function _eventInsideXray(event) {
    const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
    return path.some((node) => XRAY_HOST_IDS.has(node?.id) || node?.dataset?.xrayIsolated === '1');
  }

  function _trapFocusedPanelEvent(event) {
    if (!window.__XRAY_focusTrapActive) return;
    if (_isKeyboardEvent(event) && _isToggleShortcut(event)) return;
    if (_isKeyboardEvent(event) && _isBrowserShortcut(event)) return;

    const insideXray = _eventInsideXray(event);
    if (insideXray) return;
    if (!insideXray && !_isKeyboardEvent(event)) return;

    if (_isKeyboardEvent(event)) event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
  }

  XRAY_FOCUS_TRAP_EVENTS.forEach((type) => {
    XRAY_FOCUS_TRAP_TARGETS.forEach((target) => {
      target.addEventListener(type, _trapFocusedPanelEvent, true);
    });
  });

  // Memoized so every caller awaits the same init: a second capture message must not
  // validate (and drop its updates as unknown) before the first one registered.
  function _initPanel() {
    if (!_panelInitPromise) _panelInitPromise = _runPanelInit();
    return _panelInitPromise;
  }

  async function _runPanelInit() {
    _panelReady = true;
    
    // Initialize worker (non-blocking). Captures are not posted to it (it kept a token index nothing
    // searched); its health still reaches the panel.
    if (window.XRAY_Worker?.init) {
      window.XRAY_Worker.onHealth?.((receipt) => {
        window.XRAY_Panel?.noteWorkerHealth?.(receipt);
      });
      window.XRAY_Worker.init().catch(() => {});
    }
    
    await window.XRAY_Panel?.init?.();
  }

  function _relayToDevtools(entry) {
    _sendRelay({ type: 'xray:capture', entry }, 1);
  }

  function _relayUpdateToDevtools(update) {
    _sendRelay({ type: 'xray:capture-update', update }, 1);
  }

  function _relayBatchToDevtools(entries) {
    _sendRelay({ type: 'xray:capture-batch', entries }, entries.length);
  }

  function _sendRelay(message, count) {
    try {
      chrome.runtime.sendMessage(message, (response) => {
        const browserError = chrome.runtime.lastError;
        if (browserError || !response || response.delivery === 'relay-failed') {
          _recordDelivery('relay-failed', count);
        } else {
          _recordDelivery(response.delivery === 'no-consumer' ? 'no-consumer' : 'delivered', count);
        }
      });
    } catch {
      _recordDelivery('relay-failed', count);
    }
  }

  // C-3: everything arriving from the MAIN world is UNTRUSTED INPUT, whatever gate it
  // came through. `window.__XRAY_BRIDGE_TOKEN__` is a MAIN-world global, so every check
  // built on it is one property read from bypass — and the extension is trivially
  // fingerprintable, which makes detect-then-forge easy. The token still filters
  // accidents; these checks are what actually contain a hostile page:
  //
  //   * poisoning — forged entries entering the store, session persistence, the
  //     DevTools relay and IndexedDB;
  //   * overwriting real captured entries by reusing a known id;
  //   * unbounded strings and arrays driven straight into the panel.
  const ENTRY_TYPES = new Set(['api', 'log', 'ws', 'sse', 'graphql']);
  const MAX_BRIDGE_TEXT = 300000;
  // The interceptor keeps 50,000 chars of request text; the bridge's own bound for hostile
  // input has the same slack MAX_BRIDGE_TEXT has over the 250,000-char response cap.
  const MAX_BRIDGE_BODY_TEXT = 60000;
  // GraphQL variables arrive as up to 10,000 chars of JSON text when they are large.
  const MAX_BRIDGE_GRAPHQL_STRING = 10000;
  const MAX_BRIDGE_ARRAY = 500;
  const MAX_BRIDGE_KEYS = 200;
  const MAX_BATCH_ENTRIES = 500;
  // The latest instant a Date can hold. Intl and toISOString throw a RangeError past it,
  // and one such timestamp used to unmount the row that showed it.
  const MAX_DATE_MS = 8.64e15;
  const BODY_KINDS = new Set(['text', 'urlencoded', 'formdata', 'binary', 'none']);
  // Ids this world has seen arrive as fresh captures. An update for anything else is
  // a page inventing a target, so it is dropped rather than applied.
  const _knownEntryIds = new Set();
  const MAX_KNOWN_IDS = 5000;

  function _rememberEntryId(id) {
    if (_knownEntryIds.size >= MAX_KNOWN_IDS) {
      const oldest = _knownEntryIds.values().next().value;
      _knownEntryIds.delete(oldest);
    }
    _knownEntryIds.add(id);
  }

  function _cappedString(value, max) {
    return typeof value === 'string' ? value.slice(0, max) : undefined;
  }

  function _cappedRecord(value, maxString = 8000) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
    const out = {};
    for (const [key, raw] of Object.entries(value).slice(0, MAX_BRIDGE_KEYS)) {
      if (typeof key !== 'string' || key.length > 500) continue;
      // defineProperty, so an own "__proto__" key stays data instead of a prototype.
      Object.defineProperty(out, key, {
        value: typeof raw === 'string' ? raw.slice(0, maxString) : raw, enumerable: true, configurable: true, writable: true,
      });
    }
    return out;
  }

  const _count = (n) => (Number.isSafeInteger(n) && n >= 0 ? n : undefined);

  // A body text with its truncation metadata (spec J6). keptChars is the length of the text
  // actually carried, and metadata that cannot describe it is dropped: no text, a total
  // below what is kept (or equal to it: nothing was cut), fewer bytes than kept chars. A
  // text over the bridge's bound is cut here and the cut recorded the same way, never as
  // an in-band suffix.
  function _carryText(entry, raw, textKey, truncationKey, max) {
    const value = raw[textKey];
    if (typeof value !== 'string') return;
    const text = value.length > max ? value.slice(0, max) : value;
    entry[textKey] = text;
    const meta = raw[truncationKey];
    const given = meta && typeof meta === 'object' && !Array.isArray(meta) ? meta : {};
    let totalChars = _count(given.totalChars);
    const totalBytes = _count(given.totalBytes);
    if (text.length < value.length) totalChars = Math.max(totalChars ?? 0, value.length);
    const out = { keptChars: text.length };
    if (totalChars !== undefined && totalChars > text.length) out.totalChars = totalChars;
    if (totalBytes !== undefined && totalBytes >= text.length && (totalChars === undefined || totalChars > text.length)) out.totalBytes = totalBytes;
    if (out.totalChars !== undefined || out.totalBytes !== undefined) entry[truncationKey] = out;
  }

  // A binary body descriptor: { binary: true, size, base64Prefix } (at most 64 bytes).
  function _binaryDescriptor(value) {
    if (!value || typeof value !== 'object' || value.binary !== true) return undefined;
    const size = _count(value.size);
    const prefix = typeof value.base64Prefix === 'string' && value.base64Prefix.length <= 88
      && /^[A-Za-z0-9+/]*={0,2}$/.test(value.base64Prefix) ? value.base64Prefix : undefined;
    if (size === undefined || prefix === undefined) return undefined;
    return { binary: true, size, base64Prefix: prefix };
  }

  // Decoded JWT parts the interceptor read from sensitive request headers (claims only;
  // the raw token never leaves the page). Read by the Tokens facet and lenses.
  function _jwtLenses(value) {
    if (!Array.isArray(value)) return undefined;
    const record = (part) => _cappedRecord(part) ?? null;
    return value.slice(0, 5)
      .filter((lens) => lens && typeof lens === 'object' && typeof lens.source === 'string' && lens.source.length <= 200)
      .map((lens) => ({ source: lens.source, header: record(lens.header), payload: record(lens.payload) }));
  }

  // ── The typed log model (spec J7) ────────────────────────────────────────────
  // console-capture.js sends log values in the typed model (stable form documented in
  // src/panel/models/logValue.ts): plain JSON where JSON is exact, and `{"$xray": kind, …}`
  // envelopes for everything else. Like every field here, a value is rebuilt, never carried
  // through: each envelope is checked field by field (unknown fields dropped); one that does
  // not check out becomes a plain `object` envelope, so it reads as the data it is and never
  // as a typed value; natives the bridge can carry (NaN, -0, BigInt, undefined, Date, Map,
  // Set, Error, typed arrays, cycles) become envelopes.
  //
  // The encoder owns the bounds. These count in its units — `nodes`: every value (argument,
  // item, entry value, Map key and value, Set value, typed-array value, cause); `chars`:
  // every character of string values, keys, Error messages and stacks, Symbol descriptions
  // and BigInt digits — cut the same way (a container stops and records the cut, a key over
  // the key cap is left out and counted, BigInt digits are all or nothing), and sit at
  // twice the encoder's preview and full-copy budgets with every per-value cap at least the
  // encoder's. So anything the encoder emits passes unchanged — the docked panel shows what
  // the HUD (which stores the page's batches as posted) shows — and only hostile input is
  // cut. `encode` (jv(), whose argument is a live value, not a capture) escapes every object
  // that has the reserved key, as the page-side encoder does.
  const LOG_KEY = '$xray';
  const LOG_ENTRY_LIMITS = { depth: 8, items: 500, string: 100000, stack: 100000, key: 20000, nodes: 20000, chars: 2000000 };
  const LOG_FULL_LIMITS = { depth: 32, items: 2000, string: 100000, stack: 100000, key: 20000, nodes: 200000, chars: 20000000 };
  const LOG_NUMBER_WORDS = new Set(['NaN', 'Infinity', '-Infinity', '-0']);
  const LOG_TYPE_NAME = /^[A-Za-z][A-Za-z0-9]{0,39}$/;
  const LOG_MAX_NAME = 200;
  const _hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
  const _isLogCount = (value) => Number.isSafeInteger(value) && value >= 0;

  function _logBudget(limits, encode = false) {
    return { limits, nodes: limits.nodes, chars: limits.chars, ancestors: [], encode };
  }

  function _logTyped(kind, fields) {
    return fields ? { [LOG_KEY]: kind, ...fields } : { [LOG_KEY]: kind };
  }

  // A prefix of `text` within `max` and the budget's characters, never ending inside a
  // surrogate pair (the encoder's rule).
  function _logClip(text, max, budget) {
    let kept = Math.max(0, Math.min(max, budget.chars, text.length));
    if (kept < text.length && kept > 0) {
      const code = text.charCodeAt(kept - 1);
      if (code >= 0xd800 && code <= 0xdbff) kept -= 1;
    }
    budget.chars -= kept;
    return kept === text.length ? text : text.slice(0, kept);
  }

  function _logString(text, budget) {
    const kept = _logClip(text, budget.limits.string, budget);
    return kept.length === text.length ? kept : _logTyped('string', { value: kept, length: text.length });
  }

  // Digits all or nothing: a cut number would be a different number.
  function _logBigint(digits, budget) {
    if (digits.length > budget.chars) return _logTyped('unreadable');
    budget.chars -= digits.length;
    return _logTyped('bigint', { value: digits });
  }

  function _logNumber(value) {
    if (Number.isNaN(value)) return _logTyped('number', { value: 'NaN' });
    if (value === Infinity) return _logTyped('number', { value: 'Infinity' });
    if (value === -Infinity) return _logTyped('number', { value: '-Infinity' });
    if (Object.is(value, -0)) return _logTyped('number', { value: '-0' });
    return value;
  }

  function _logDefine(target, key, value) {
    Object.defineProperty(target, key, { value, enumerable: true, configurable: true, writable: true });
  }

  function _logChild(container, key, budget, depth) {
    try {
      return _logValue(container[key], budget, depth + 1);
    } catch {
      return _logTyped('unreadable');
    }
  }

  // [key, value] pairs with string keys, as an object or error envelope lists them.
  const _isEntryList = (value) => Array.isArray(value)
    && value.every((pair) => Array.isArray(pair) && pair.length === 2 && typeof pair[0] === 'string');

  // Entries while the budget lasts, under the encoder's rules: a key over the key cap is
  // left out, and once the values or the characters run out every remaining key is; left-out
  // keys are counted. Keys are charged like string values. `read(i)` decodes entry i's value.
  function _logKeyed(keys, read, budget) {
    const entries = [];
    let omitted = 0;
    const limit = Math.min(keys.length, budget.limits.items);
    let i = 0;
    for (; i < limit; i += 1) {
      const key = keys[i];
      if (budget.nodes <= 0) break;
      if (key.length > budget.limits.key) { omitted += 1; continue; }
      if (key.length > budget.chars) break;
      budget.chars -= key.length;
      entries.push([key, read(i)]);
    }
    return { entries, omitted: omitted + keys.length - i };
  }

  function _logValue(value, budget, depth = 0) {
    budget.nodes -= 1;
    switch (typeof value) {
      case 'string': return _logString(value, budget);
      case 'number': return _logNumber(value);
      case 'boolean': return value;
      case 'undefined': return _logTyped('undefined');
      case 'bigint': return _logBigint(String(value), budget);
      case 'symbol': return _logTyped('symbol', { description: _logClip(String(value).slice(7, -1), 1000, budget) });
      case 'function': {
        let name = '';
        try { name = typeof value.name === 'string' ? value.name.slice(0, LOG_MAX_NAME) : ''; } catch { name = ''; }
        return _logTyped('function', { name });
      }
      default: break;
    }
    if (value === null) return null;
    if (budget.ancestors.includes(value)) return _logTyped('circular');
    if (depth > budget.limits.depth || budget.nodes < 0) {
      return Array.isArray(value)
        ? _logTyped('depth', { type: 'array', length: _isLogCount(value.length) ? value.length : 0 })
        : _logTyped('depth', { type: 'object' });
    }
    budget.ancestors.push(value);
    try {
      return _logObject(value, budget, depth);
    } finally {
      budget.ancestors.pop();
    }
  }

  // Items of a list while the budget lasts; `read(i)` decodes item i.
  function _logItems(count, read, budget) {
    const limit = Math.min(count, budget.limits.items);
    const items = [];
    for (let i = 0; i < limit && budget.nodes > 0; i += 1) items.push(read(i));
    return items;
  }

  function _logObject(value, budget, depth) {
    if (Array.isArray(value)) {
      const items = _logItems(value.length, (i) => _logChild(value, i, budget, depth), budget);
      return items.length < value.length ? _logTyped('array', { items, length: value.length }) : items;
    }
    const tag = Object.prototype.toString.call(value);
    if (tag === '[object Object]' && _hasOwn(value, LOG_KEY)) {
      return (!budget.encode && _logEnvelope(value, budget, depth)) || _logEscaped(value, budget, depth);
    }
    if (tag === '[object Date]') {
      const time = Date.prototype.getTime.call(value);
      return _logTyped('date', { iso: Number.isNaN(time) ? null : new Date(time).toISOString() });
    }
    if (tag === '[object Map]' || tag === '[object Set]') {
      const isMap = tag === '[object Map]';
      const list = Array.from(value);
      const out = _logItems(list.length, (i) => (isMap
        ? [_logValue(list[i][0], budget, depth + 1), _logValue(list[i][1], budget, depth + 1)]
        : _logValue(list[i], budget, depth + 1)), budget);
      return isMap ? _logTyped('map', { size: value.size, entries: out }) : _logTyped('set', { size: value.size, values: out });
    }
    if (tag === '[object Error]') {
      const text = (key, max) => { try { return typeof value[key] === 'string' ? _logClip(value[key], max, budget) : ''; } catch { return ''; } };
      const name = (() => { try { return typeof value.name === 'string' ? value.name.slice(0, LOG_MAX_NAME) : ''; } catch { return ''; } })() || 'Error';
      const message = text('message', budget.limits.string);
      const stack = text('stack', budget.limits.stack);
      return _logTyped('error', {
        name,
        message,
        ...(stack ? { stack } : {}),
        ...(_hasOwn(value, 'cause') ? { cause: _logChild(value, 'cause', budget, depth) } : {}),
      });
    }
    if (tag === '[object ArrayBuffer]') return _logTyped('typedarray', { type: 'ArrayBuffer', length: value.byteLength });
    if (ArrayBuffer.isView(value)) {
      const type = tag.slice(8, -1);
      if (type === 'DataView') return _logTyped('typedarray', { type, length: value.byteLength });
      const values = _logItems(value.length, (i) => _logValue(value[i], budget, depth + 1), budget);
      return _logTyped('typedarray', { type: LOG_TYPE_NAME.test(type) ? type : 'TypedArray', length: value.length, values });
    }
    const keys = Object.keys(value);
    const proto = Object.getPrototypeOf(value);
    let cls = '';
    if (proto && proto !== Object.prototype) {
      const name = typeof proto.constructor === 'function' ? proto.constructor.name : '';
      if (typeof name === 'string' && name !== 'Object') cls = name.slice(0, LOG_MAX_NAME);
    }
    const { entries, omitted } = _logKeyed(keys, (i) => _logChild(value, keys[i], budget, depth), budget);
    if (!cls && !omitted) {
      const out = {};
      for (const [key, item] of entries) _logDefine(out, key, item);
      return out;
    }
    return _logTyped('object', { ...(cls ? { class: cls } : {}), entries, ...(omitted ? { omitted } : {}) });
  }

  // An object that has the reserved key but is not a valid envelope: plain data, listed.
  function _logEscaped(value, budget, depth) {
    const keys = Object.keys(value);
    const { entries, omitted } = _logKeyed(keys, (i) => _logChild(value, keys[i], budget, depth), budget);
    return _logTyped('object', { entries, ...(omitted ? { omitted } : {}) });
  }

  // A rebuilt envelope, or null when `value` is not a valid one.
  function _logEnvelope(value, budget, depth) {
    const own = (key) => (_hasOwn(value, key) ? value[key] : undefined);
    const optionalCount = (key) => own(key) === undefined || _isLogCount(own(key));
    const optionalName = (key) => own(key) === undefined || (typeof own(key) === 'string' && own(key).length <= LOG_MAX_NAME);
    const listed = (pairs) => _logKeyed(pairs.map((pair) => pair[0]), (i) => _logValue(pairs[i][1], budget, depth + 1), budget);
    const kind = own(LOG_KEY);
    switch (kind) {
      case 'undefined':
      case 'circular':
      case 'unreadable':
        return _logTyped(kind);
      case 'number':
        return LOG_NUMBER_WORDS.has(own('value')) ? _logTyped('number', { value: own('value') }) : null;
      case 'bigint': {
        const digits = own('value');
        return typeof digits === 'string' && /^-?\d+$/.test(digits) ? _logBigint(digits, budget) : null;
      }
      case 'function':
        return typeof own('name') === 'string' ? _logTyped('function', { name: own('name').slice(0, LOG_MAX_NAME) }) : null;
      case 'symbol':
        return typeof own('description') === 'string' ? _logTyped('symbol', { description: _logClip(own('description'), 1000, budget) }) : null;
      case 'date': {
        const iso = own('iso');
        if (iso === null) return _logTyped('date', { iso: null });
        return typeof iso === 'string' && iso.length <= 40 && !Number.isNaN(Date.parse(iso)) ? _logTyped('date', { iso }) : null;
      }
      case 'dom':
        return typeof own('text') === 'string' ? _logTyped('dom', { text: own('text').slice(0, 500) }) : null;
      case 'depth': {
        const type = own('type');
        if (type !== undefined && type !== 'array' && type !== 'object') return null;
        if (!optionalCount('length') || !optionalName('class')) return null;
        return _logTyped('depth', {
          ...(type !== undefined ? { type } : {}),
          ...(own('class') !== undefined ? { class: own('class') } : {}),
          ...(own('length') !== undefined ? { length: own('length') } : {}),
        });
      }
      case 'string': {
        const text = own('value');
        const length = own('length');
        if (typeof text !== 'string' || !_isLogCount(length) || length < text.length) return null;
        return _logTyped('string', { value: _logClip(text, budget.limits.string, budget), length });
      }
      case 'array': {
        const items = own('items');
        const length = own('length');
        if (!Array.isArray(items) || !_isLogCount(length) || length < items.length) return null;
        return _logTyped('array', { items: _logItems(items.length, (i) => _logValue(items[i], budget, depth + 1), budget), length });
      }
      case 'object': {
        const pairs = own('entries');
        if (!_isEntryList(pairs) || !optionalName('class') || !optionalCount('omitted')) return null;
        const { entries, omitted } = listed(pairs);
        const total = (own('omitted') || 0) + omitted;
        return _logTyped('object', {
          ...(own('class') !== undefined ? { class: own('class') } : {}),
          entries,
          ...(total ? { omitted: total } : {}),
        });
      }
      case 'map':
      case 'set': {
        const size = own('size');
        const list = own(kind === 'map' ? 'entries' : 'values');
        if (!_isLogCount(size) || !Array.isArray(list) || list.length > size) return null;
        if (kind === 'map' && !list.every((pair) => Array.isArray(pair) && pair.length === 2)) return null;
        const rebuilt = _logItems(list.length, (i) => (kind === 'map'
          ? [_logValue(list[i][0], budget, depth + 1), _logValue(list[i][1], budget, depth + 1)]
          : _logValue(list[i], budget, depth + 1)), budget);
        return kind === 'map' ? _logTyped('map', { size, entries: rebuilt }) : _logTyped('set', { size, values: rebuilt });
      }
      case 'error': {
        const name = own('name');
        const message = own('message');
        const stack = own('stack');
        const pairs = own('entries');
        if (typeof name !== 'string' || typeof message !== 'string') return null;
        if (stack !== undefined && typeof stack !== 'string') return null;
        if ((pairs !== undefined && !_isEntryList(pairs)) || !optionalCount('omitted')) return null;
        const kept = {
          name: name.slice(0, LOG_MAX_NAME),
          message: _logClip(message, budget.limits.string, budget),
        };
        if (stack !== undefined) kept.stack = _logClip(stack, budget.limits.stack, budget);
        const { entries, omitted } = pairs ? listed(pairs) : { entries: [], omitted: 0 };
        const total = (own('omitted') || 0) + omitted;
        return _logTyped('error', {
          ...kept,
          ...(entries.length ? { entries } : {}),
          ...(total ? { omitted: total } : {}),
          ...(_hasOwn(value, 'cause') ? { cause: _logValue(value.cause, budget, depth + 1) } : {}),
        });
      }
      case 'typedarray': {
        const type = own('type');
        const length = own('length');
        const values = own('values');
        if (typeof type !== 'string' || !LOG_TYPE_NAME.test(type) || !_isLogCount(length)) return null;
        if (values !== undefined && (!Array.isArray(values) || values.length > length)) return null;
        if (values === undefined) return _logTyped('typedarray', { type, length });
        return _logTyped('typedarray', { type, length, values: _logItems(values.length, (i) => _logValue(values[i], budget, depth + 1), budget) });
      }
      default:
        return null;
    }
  }

  // A log entry's arguments: one value when logArgCount is 1, else the list. An entry
  // without a valid logArgCount is a pre-model shape and stays as it was.
  function _carryLog(entry, raw) {
    if (!_isLogCount(raw.logArgCount)) {
      if (raw.logData !== undefined) entry.logData = raw.logData;
      return;
    }
    const budget = _logBudget(LOG_ENTRY_LIMITS);
    if (raw.logArgCount !== 1 && Array.isArray(raw.logData)) {
      const args = raw.logData.slice(0, MAX_BRIDGE_ARRAY);
      entry.logData = args.map((arg) => _logValue(arg, budget));
      entry.logArgCount = args.length;
    } else {
      entry.logData = _logValue(raw.logData, budget);
      entry.logArgCount = 1;
    }
  }

  // Lazy "Load full object" handles (audit #9) and, for typed logs, the argument each one
  // belongs to. A pair with an invalid half is dropped whole.
  function _carryObjectRefs(entry, raw) {
    if (!Array.isArray(raw.objectRefs)) return;
    const validRef = (ref) => typeof ref === 'string' && ref.length > 0 && ref.length <= 200;
    if (entry.logArgCount === undefined || !Array.isArray(raw.objectRefArgs)) {
      entry.objectRefs = raw.objectRefs.slice(0, MAX_BRIDGE_ARRAY).filter(validRef);
      return;
    }
    const refs = [];
    const positions = [];
    const pairs = Math.min(raw.objectRefs.length, raw.objectRefArgs.length, MAX_BRIDGE_ARRAY);
    for (let i = 0; i < pairs; i += 1) {
      const ref = raw.objectRefs[i];
      const at = raw.objectRefArgs[i];
      if (validRef(ref) && Number.isSafeInteger(at) && at >= 0 && at < entry.logArgCount) {
        refs.push(ref);
        positions.push(at);
      }
    }
    entry.objectRefs = refs;
    entry.objectRefArgs = positions;
  }

  // Returns a NEW object built field by field. Nothing the page sends is carried
  // through unexamined, so an unknown property cannot ride along into the store.
  function _validateEntry(raw, { isUpdate = false } = {}) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    if (typeof raw.id !== 'string' || !raw.id || raw.id.length > 200) return null;
    // An update is a PARTIAL PATCH -- { id, status, wsFrames, ... } or { id, timing } --
    // and carries no `type`, so requiring one here silently discarded every WebSocket
    // and SSE frame update and every deferred resource-timing update. Sockets stayed
    // frozen at status 0 / wsState 'connecting' / zero frames forever, and any request
    // whose timing landed after the response never got a waterfall.
    //
    // For an update, membership in _knownEntryIds is the real anti-forgery gate: the
    // page cannot patch an entry the isolated world never created.
    if (!isUpdate && !ENTRY_TYPES.has(raw.type)) return null;
    if (isUpdate && !_knownEntryIds.has(raw.id)) return null;

    const entry = ENTRY_TYPES.has(raw.type) ? { id: raw.id, type: raw.type } : { id: raw.id };
    const num = (value, min, max) => (Number.isFinite(Number(value)) ? Math.min(max, Math.max(min, Number(value))) : undefined);

    const timestamp = num(raw.timestamp, 0, MAX_DATE_MS);
    if (timestamp !== undefined) entry.timestamp = timestamp;
    const status = num(raw.status, 0, 999);
    if (status !== undefined) entry.status = status;
    const duration = num(raw.duration, 0, 86400000);
    if (duration !== undefined) entry.duration = duration;
    const size = num(raw.size, 0, Number.MAX_SAFE_INTEGER);
    if (size !== undefined) entry.size = size;
    const wsCloseCode = num(raw.wsCloseCode, 0, 65535);
    if (wsCloseCode !== undefined) entry.wsCloseCode = wsCloseCode;
    // A traffic rule's delay (rules cap it at 60 s).
    const delayedByRuleMs = num(raw.delayedByRuleMs, 0, 60000);
    if (delayedByRuleMs !== undefined) entry.delayedByRuleMs = delayedByRuleMs;

    for (const key of ['method', 'url', 'urlPath', 'source', 'contentType', 'logLevel', 'message', 'mockRuleId', 'mockAction', 'driftFromId', 'replayOf', 'wsState', 'decryptStatus']) {
      const value = _cappedString(raw[key], 4000);
      if (value !== undefined) entry[key] = value;
    }
    // Spec J4/J6: captured text with its truncation metadata, and what kind of request
    // body the text stands for.
    _carryText(entry, raw, 'responseRaw', 'responseTruncated', MAX_BRIDGE_TEXT);
    _carryText(entry, raw, 'requestBodyText', 'requestTruncated', MAX_BRIDGE_BODY_TEXT);
    if (BODY_KINDS.has(raw.requestBodyKind)) entry.requestBodyKind = raw.requestBodyKind;
    const responseBinary = _binaryDescriptor(raw.responseBinary);
    if (responseBinary) entry.responseBinary = responseBinary;
    entry.parseToken = _cappedString(raw.parseToken, 4000) ?? null;
    const jwtLenses = _jwtLenses(raw.jwtLenses);
    if (jwtLenses) entry.jwtLenses = jwtLenses;

    for (const key of ['requestHeaders', 'responseHeaders', 'timing']) {
      const value = _cappedRecord(raw[key]);
      if (value !== undefined) entry[key] = value;
    }
    const graphql = _cappedRecord(raw.graphql, MAX_BRIDGE_GRAPHQL_STRING);
    if (graphql !== undefined) entry.graphql = graphql;
    for (const key of ['requestBody', 'responseDecrypted']) {
      if (raw[key] !== undefined) entry[key] = raw[key];
    }
    // Spec J7: console arguments in the typed log model, rebuilt and bounded.
    _carryLog(entry, raw);
    for (const key of ['args', 'initiator', 'wsFrames']) {
      if (Array.isArray(raw[key])) entry[key] = raw[key].slice(0, MAX_BRIDGE_ARRAY);
    }
    _carryObjectRefs(entry, raw);
    // captureDegraded: the capture kept the entry but lost part of it (spec J5);
    // bodyReserialized: responseRaw was rebuilt from a parsed value (XHR 'json').
    // Not `imported`: only the panel's import sets it (it reads pre-J6 in-band suffixes, spec J9).
    for (const key of ['mocked', 'replayed', 'pinned', 'captureDegraded', 'bodyReserialized']) {
      if (typeof raw[key] === 'boolean') entry[key] = raw[key];
    }
    if (!isUpdate) _rememberEntryId(entry.id);
    return entry;
  }

  // Receive captured entries from MAIN world via postMessage
  // Supports both single entries and batched entries for performance
  // C-6: decryption runs HERE, in the isolated world, not in the page's realm.
  // The interceptor marks `decryptStatus: 'pending'` when a parse token was present
  // and leaves the work to us. `window.XRAY_Decrypt` in this realm is our own module
  // (shared/decrypt.js, loaded by content_scripts[1]); page script cannot read it,
  // replace it, or use it as an oracle the way it could the old MAIN-world global.
  function _resolveDecrypt(entry) {
    if (!entry || entry.decryptStatus !== 'pending') return entry;
    let parsed = null;
    try { parsed = JSON.parse(entry.responseRaw); } catch { /* not JSON */ }
    if (parsed === null) {
      entry.decryptStatus = 'none';
      return entry;
    }
    try {
      const result = window.XRAY_Decrypt?.decrypt?.(entry.parseToken, parsed);
      if (result !== null && result !== undefined) {
        entry.responseDecrypted = result;
        entry.decryptStatus = 'ok';
      } else {
        entry.decryptStatus = 'none';
      }
    } catch {
      entry.decryptStatus = 'failed';
    }
    return entry;
  }

  // C1: tell the page interceptor the saved capture toggles and traffic rules as soon
  // as the bridge token is known, without waiting for the panel to mount. Until it
  // hears from us (or the panel, or 3 s pass) the interceptor holds early captures
  // back. Any failure is silent: the interceptor's own timeout covers it.
  function _postStoredCaptureConfig() {
    const store = window.XRAY_Store;
    if (!store || typeof store.get !== 'function') return;
    const token = _bridgeToken;
    Promise.all([
      store.get('react_panel_preferences', null, true),
      store.get('traffic_rules', [], true),
    ]).then(([preferences, storedRules]) => {
      if (!token || token !== _bridgeToken) return;
      const settings = preferences && typeof preferences === 'object' && preferences.settings && typeof preferences.settings === 'object'
        ? preferences.settings : {};
      const flag = (value) => (typeof value === 'boolean' ? value : true);
      const rules = (Array.isArray(storedRules) ? storedRules : [])
        .filter((rule) => rule && rule.enabled !== false && rule.match && typeof rule.match.url === 'string' && rule.match.url.trim())
        .map((rule) => ({
          id: rule.id,
          enabled: true,
          match: { url: rule.match.url.trim(), method: rule.match.method },
          action: rule.action,
        }));
      window.postMessage({
        __xray_config__: true,
        source: 'xray-relay',
        token,
        config: {
          captureFetch: flag(settings.captureFetch),
          captureXhr: flag(settings.captureXhr),
          captureWs: flag(settings.captureWs),
          rules,
        },
      }, '*');
    }).catch(() => {});
  }

  window.addEventListener('message', async (e) => {
    if (e.source !== window) return;
    // First write wins: the interceptor posts the handshake at document_start,
    // before any page script runs, so a later forged __xray_bridge_ready__
    // cannot swap in an attacker-chosen token.
    if (!_bridgeToken && e.data?.__xray_bridge_ready__ && typeof e.data.token === 'string') {
      _bridgeToken = e.data.token;
      window.__XRAY_bridgeToken = _bridgeToken;
      _postStoredCaptureConfig();
      return;
    }
    // Spec J5: an entry the interceptor could not post even degraded is counted, not lost
    // silently. Page script can read the token, so the count is checked and bounded.
    if (e.data?.__xray_capture_drop__) {
      if (!_bridgeToken || e.data.token !== _bridgeToken || !PAGE_DROP_REASONS.has(e.data.reason)) return;
      const count = e.data.count;
      if (Number.isInteger(count) && count >= 1) _recordCaptureDrop(e.data.reason, Math.min(500, count));
      return;
    }
    if (!e.data?.__xray_capture__) return;
    if (!_bridgeToken || e.data.token !== _bridgeToken) {
      _recordCaptureDrop('bridge-token');
      return;
    }

    await _initPanel();

    // Handle in-place entry updates (WebSocket/SSE frames, deferred timing)
    if (e.data.update && e.data.entry) {
      const updated = _resolveDecrypt(_validateEntry(e.data.entry, { isUpdate: true }));
      if (!updated) {
        _recordCaptureDrop('invalid-update');
        return;
      }
      _recordCaptureAccepted();
      window.XRAY_Panel?.update?.(updated);
      _relayUpdateToDevtools(updated);
      return;
    }

    // Handle batched entries (from console-capture.js): one store commit and
    // one devtools IPC per batch instead of one of each per message.
    if (e.data.batch && Array.isArray(e.data.entries)) {
      const sourceEntries = e.data.entries;
      const overLimit = Math.max(0, sourceEntries.length - MAX_BATCH_ENTRIES);
      const entries = e.data.entries.slice(0, MAX_BATCH_ENTRIES)
        .map((raw) => _validateEntry(raw))
        .filter(Boolean)
        .map(_resolveDecrypt);
      const invalid = Math.max(0, Math.min(MAX_BATCH_ENTRIES, sourceEntries.length - overLimit - entries.length));
      if (overLimit) _recordCaptureDrop('batch-limit', overLimit);
      if (invalid) _recordCaptureDrop('invalid-entry', invalid);
      if (!entries.length) return;
      _recordCaptureAccepted(entries.length);
      if (window.XRAY_Panel?.addAll) window.XRAY_Panel.addAll(entries);
      else entries.forEach((entry) => window.XRAY_Panel?.add?.(entry));
      _relayBatchToDevtools(entries);
      return;
    }
    
    // Handle single entry (from interceptor.js)
    const entry = _resolveDecrypt(_validateEntry(e.data.entry));
    if (!entry) {
      _recordCaptureDrop('invalid-entry');
      return;
    }
    _recordCaptureAccepted();
    
    window.XRAY_Panel?.add?.(entry);
    _relayToDevtools(entry);
  });

  // Local fallback: handle Ctrl/Cmd+Shift+X even if background command routing fails.
  document.addEventListener('keydown', (e) => {
    if (!((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key?.toLowerCase() === 'x' || e.code === 'KeyX'))) {
      return;
    }
    if (e.__xrayToggleHandled) return;
    if (e.repeat) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }

    e.__xrayToggleHandled = true;
    e.preventDefault();
    e.stopImmediatePropagation();
    window.__XRAY_lastToggleShortcutTs = Date.now();
    console.debug('[XRAY] Local shortcut handler toggling panel');
    _initPanel().then(() => window.XRAY_Panel?.toggle?.());
  }, true);

  // Receive toggle / show command from background.js
  chrome.runtime.onMessage.addListener((msg) => {
    // Relayed config/replay from surfaces without an in-page bridge (DevTools
    // panel). Re-post into the MAIN world with this frame's bridge token; the
    // interceptor sanitizes the payload itself.
    if (msg.type === 'xray:page-bridge') {
      if (!_bridgeToken) return;
      if (msg.kind === 'config' && msg.config && typeof msg.config === 'object') {
        window.postMessage({ __xray_config__: true, source: 'xray-relay', token: _bridgeToken, config: msg.config }, '*');
      } else if (msg.kind === 'replay' && msg.request && typeof msg.request === 'object') {
        window.postMessage({ __xray_replay__: true, source: 'xray-relay', token: _bridgeToken, request: msg.request }, '*');
      }
      return;
    }
    if (msg.type === 'xray:toggle') {
      const now = Date.now();
      const lastLocalToggle = Number(window.__XRAY_lastToggleShortcutTs || 0);
      if (lastLocalToggle && (now - lastLocalToggle) < 400) {
        console.debug('[XRAY] Ignoring background toggle as duplicate of local shortcut');
        return;
      }
      console.debug('[XRAY] Received xray:toggle from background');
      _initPanel().then(() => window.XRAY_Panel?.toggle?.());
    }
  });

  // Expose global helper: jv(data) — opens panel and injects data as a manual log entry
  window.jv = function (data) {
    _initPanel().then(() => {
      // A live value, not a capture: encoded like console-capture.js does.
      let logData;
      try {
        logData = _logValue(data, _logBudget(LOG_FULL_LIMITS, true));
      } catch {
        logData = '[XRAY: this value could not be captured]';
      }
      const entry = {
        id: 'jv_' + Date.now().toString(36),
        type: 'log',
        timestamp: Date.now(),
        logLevel: 'log',
        logArgCount: 1,
        logData,
        pinned: false,
      };
      window.XRAY_Panel?.add?.(entry);
      _relayToDevtools(entry);
      window.XRAY_Panel?.show?.();
    });
  };

  // Expose helper to get full object from console log (lazy loading)
  window.__XRAY_fetchLogObject__ = async function(refId) {
    // This bridges ISOLATED → MAIN world to fetch the stored object
    return new Promise((resolve) => {
      const msgId = 'fetch_' + Date.now() + '_' + Math.random().toString(36);
      
      const handler = (e) => {
        if (e.source !== window) return;
        if (e.data?.__xray_fetch_response__ && e.data.token === _bridgeToken && e.data.msgId === msgId) {
          window.removeEventListener('message', handler);
          // The page's answer is checked and rebuilt like a capture (spec J7); nothing
          // stored under the handle (or an answer that cannot be read) is null.
          let full = null;
          try {
            const data = e.data.data;
            full = data === null || data === undefined ? null : _logValue(data, _logBudget(LOG_FULL_LIMITS));
          } catch {
            full = null;
          }
          resolve(full);
        }
      };
      
      window.addEventListener('message', handler);
      window.postMessage({ __xray_fetch_object__: true, token: _bridgeToken, msgId, refId }, '*');
      
      // Timeout after 1 second
      setTimeout(() => {
        window.removeEventListener('message', handler);
        resolve(null);
      }, 1000);
    });
  };
})();
