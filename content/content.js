// content/content.js — ISOLATED world entry point
// Listens for capture events from MAIN world scripts and feeds them to the panel.
// Also handles toggle messages from the background service worker.
(function () {
  'use strict';

  let _panelReady = false;
  let _workerReady = false;

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
    
    await XRAY_Panel.init();
  }

  function _relayToDevtools(entry) {
    chrome.runtime.sendMessage({ type: 'xray:capture', entry }, () => {
      void chrome.runtime.lastError;
    });
  }

  // Receive captured entries from MAIN world via postMessage
  // Supports both single entries and batched entries for performance
  window.addEventListener('message', async (e) => {
    if (!e.data?.__xray_capture__) return;
    
    await _initPanel();
    
    // Handle batched entries (from console-capture.js)
    if (e.data.batch && Array.isArray(e.data.entries)) {
      const entries = e.data.entries;
      for (const entry of entries) {
        if (!entry) continue;
        XRAY_Panel.add(entry);
        _relayToDevtools(entry);
        
        // Send to worker for indexing (non-blocking)
        if (_workerReady && window.XRAY_Worker) {
          window.XRAY_Worker.addEntry(entry).catch(() => {});
        }
      }
      return;
    }
    
    // Handle single entry (from interceptor.js)
    const entry = e.data.entry;
    if (!entry) return;
    
    XRAY_Panel.add(entry);
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
    _initPanel().then(() => XRAY_Panel.toggle());
  }, true);

  // Receive toggle / show command from background.js
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'xray:toggle') {
      const now = Date.now();
      const lastLocalToggle = Number(window.__XRAY_lastToggleShortcutTs || 0);
      if (lastLocalToggle && (now - lastLocalToggle) < 400) {
        console.debug('[XRAY] Ignoring background toggle as duplicate of local shortcut');
        return;
      }
      console.debug('[XRAY] Received xray:toggle from background');
      _initPanel().then(() => XRAY_Panel.toggle());
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
      XRAY_Panel.add(entry);
      _relayToDevtools(entry);
      XRAY_Panel.show();
    });
  };

  // Expose helper to get full object from console log (lazy loading)
  window.__XRAY_fetchLogObject__ = async function(refId) {
    // This bridges ISOLATED → MAIN world to fetch the stored object
    return new Promise((resolve) => {
      const msgId = 'fetch_' + Date.now() + '_' + Math.random().toString(36);
      
      const handler = (e) => {
        if (e.data?.__xray_fetch_response__ && e.data.msgId === msgId) {
          window.removeEventListener('message', handler);
          resolve(e.data.data);
        }
      };
      
      window.addEventListener('message', handler);
      window.postMessage({ __xray_fetch_object__: true, msgId, refId }, '*');
      
      // Timeout after 1 second
      setTimeout(() => {
        window.removeEventListener('message', handler);
        resolve(null);
      }, 1000);
    });
  };
})();
