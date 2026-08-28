// content/content.js — ISOLATED world entry point
// Listens for capture events from MAIN world scripts and feeds them to the panel.
// Also handles toggle messages from the background service worker.
(function () {
  'use strict';

  // Chrome injects a given file only once per frame even when it is listed in
  // both the MAIN and ISOLATED content-script groups, so the isolated world
  // never receives shared/console-helpers.js from the manifest. Import it here
  // (helpers are only read lazily, so the async load is safe).
  if (!window.XRAY_ConsoleHelpers) {
    import(chrome.runtime.getURL('shared/console-helpers.js')).catch(() => {});
  }

  let _panelReady = false;
  let _workerReady = false;
  let _bridgeToken = null;
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

  function _eventInsideXray(event) {
    const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
    return path.some((node) => node?.id === '__xray_root__' ||
      node?.id === 'xr-panel' ||
      node?.classList?.contains?.('xr-hud'));
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

  async function _initPanel() {
    if (_panelReady) return;
    _panelReady = true;
    
    // Initialize worker (non-blocking)
    if (window.XRAY_Worker?.init) {
      window.XRAY_Worker.init().then(() => {
        _workerReady = true;
      }).catch(() => {
        // Worker failed, continue without it
      });
    }
    
    await window.XRAY_Panel?.init?.();
  }

  function _relayToDevtools(entry) {
    chrome.runtime.sendMessage({ type: 'xray:capture', entry }, () => {
      void chrome.runtime.lastError;
    });
  }

  function _relayUpdateToDevtools(update) {
    chrome.runtime.sendMessage({ type: 'xray:capture-update', update }, () => {
      void chrome.runtime.lastError;
    });
  }

  function _relayBatchToDevtools(entries) {
    chrome.runtime.sendMessage({ type: 'xray:capture-batch', entries }, () => {
      void chrome.runtime.lastError;
    });
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
  const MAX_BRIDGE_ARRAY = 500;
  const MAX_BRIDGE_KEYS = 200;
  const MAX_BATCH_ENTRIES = 500;
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

  function _cappedRecord(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
    const out = {};
    for (const [key, raw] of Object.entries(value).slice(0, MAX_BRIDGE_KEYS)) {
      if (typeof key !== 'string' || key.length > 500) continue;
      out[key] = typeof raw === 'string' ? raw.slice(0, 8000) : raw;
    }
    return out;
  }

  // Returns a NEW object built field by field. Nothing the page sends is carried
  // through unexamined, so an unknown property cannot ride along into the store.
  function _validateEntry(raw, { isUpdate = false } = {}) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    if (typeof raw.id !== 'string' || !raw.id || raw.id.length > 200) return null;
    if (!ENTRY_TYPES.has(raw.type)) return null;
    if (isUpdate && !_knownEntryIds.has(raw.id)) return null;

    const entry = { id: raw.id, type: raw.type };
    const num = (value, min, max) => (Number.isFinite(Number(value)) ? Math.min(max, Math.max(min, Number(value))) : undefined);

    const timestamp = num(raw.timestamp, 0, Number.MAX_SAFE_INTEGER);
    if (timestamp !== undefined) entry.timestamp = timestamp;
    const status = num(raw.status, 0, 999);
    if (status !== undefined) entry.status = status;
    const duration = num(raw.duration, 0, 86400000);
    if (duration !== undefined) entry.duration = duration;
    const size = num(raw.size, 0, Number.MAX_SAFE_INTEGER);
    if (size !== undefined) entry.size = size;
    const wsCloseCode = num(raw.wsCloseCode, 0, 65535);
    if (wsCloseCode !== undefined) entry.wsCloseCode = wsCloseCode;

    for (const key of ['method', 'url', 'urlPath', 'source', 'contentType', 'logLevel', 'message', 'mockRuleId', 'mockAction', 'driftFromId', 'replayOf', 'wsState', 'decryptStatus']) {
      const value = _cappedString(raw[key], 4000);
      if (value !== undefined) entry[key] = value;
    }
    const responseRaw = _cappedString(raw.responseRaw, MAX_BRIDGE_TEXT);
    if (responseRaw !== undefined) entry.responseRaw = responseRaw;
    entry.parseToken = _cappedString(raw.parseToken, 4000) ?? null;

    for (const key of ['requestHeaders', 'responseHeaders', 'graphql', 'timing']) {
      const value = _cappedRecord(raw[key]);
      if (value !== undefined) entry[key] = value;
    }
    for (const key of ['requestBody', 'responseDecrypted', 'logData']) {
      if (raw[key] !== undefined) entry[key] = raw[key];
    }
    for (const key of ['args', 'initiator', 'wsFrames']) {
      if (Array.isArray(raw[key])) entry[key] = raw[key].slice(0, MAX_BRIDGE_ARRAY);
    }
    for (const key of ['mocked', 'replayed', 'pinned', 'imported']) {
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

  window.addEventListener('message', async (e) => {
    if (e.source !== window) return;
    // First write wins: the interceptor posts the handshake at document_start,
    // before any page script runs, so a later forged __xray_bridge_ready__
    // cannot swap in an attacker-chosen token.
    if (!_bridgeToken && e.data?.__xray_bridge_ready__ && typeof e.data.token === 'string') {
      _bridgeToken = e.data.token;
      window.__XRAY_bridgeToken = _bridgeToken;
      return;
    }
    if (!e.data?.__xray_capture__) return;
    if (!_bridgeToken || e.data.token !== _bridgeToken) return;

    await _initPanel();

    // Handle in-place entry updates (WebSocket/SSE frames, deferred timing)
    if (e.data.update && e.data.entry) {
      const updated = _resolveDecrypt(_validateEntry(e.data.entry, { isUpdate: true }));
      if (!updated) return;
      window.XRAY_Panel?.update?.(updated);
      _relayUpdateToDevtools(updated);
      return;
    }

    // Handle batched entries (from console-capture.js): one store commit and
    // one devtools IPC per batch instead of one of each per message.
    if (e.data.batch && Array.isArray(e.data.entries)) {
      const entries = e.data.entries.slice(0, MAX_BATCH_ENTRIES)
        .map((raw) => _validateEntry(raw))
        .filter(Boolean)
        .map(_resolveDecrypt);
      if (!entries.length) return;
      if (window.XRAY_Panel?.addAll) window.XRAY_Panel.addAll(entries);
      else entries.forEach((entry) => window.XRAY_Panel?.add?.(entry));
      _relayBatchToDevtools(entries);

      // Send to worker for indexing (non-blocking)
      if (_workerReady && window.XRAY_Worker) {
        entries.forEach((entry) => window.XRAY_Worker.addEntry(entry).catch(() => {}));
      }
      return;
    }
    
    // Handle single entry (from interceptor.js)
    const entry = _resolveDecrypt(_validateEntry(e.data.entry));
    if (!entry) return;
    
    window.XRAY_Panel?.add?.(entry);
    _relayToDevtools(entry);
    
    // Send to worker for indexing (non-blocking)
    if (_workerReady && window.XRAY_Worker) {
      window.XRAY_Worker.addEntry(entry).catch(() => {});
    }
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
      const entry = {
        id: 'jv_' + Date.now().toString(36),
        type: 'log',
        timestamp: Date.now(),
        logLevel: 'log',
        logData: data,
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
          resolve(e.data.data);
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
