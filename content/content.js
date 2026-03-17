// content/content.js — ISOLATED world entry point
// Listens for capture events from MAIN world scripts and feeds them to the panel.
// Also handles toggle messages from the background service worker.
(function () {
  'use strict';

  let _panelReady = false;

  async function _initPanel() {
    if (_panelReady) return;
    _panelReady = true;
    await XRAY_Panel.init();
  }

  // Receive captured entries from MAIN world via postMessage
  // (CustomEvent.detail is nullified by Chrome when crossing MAIN→ISOLATED worlds)
  window.addEventListener('message', async (e) => {
    if (!e.data?.__xray_capture__) return;
    const entry = e.data.entry;
    if (!entry) return;
    await _initPanel();
    XRAY_Panel.add(entry);
  });

  // Receive toggle / show command from background.js
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'xray:toggle') {
      _initPanel().then(() => XRAY_Panel.toggle());
    }
  });

  // Expose global helper: jv(data) — opens panel and injects data as a manual log entry
  window.jv = function (data) {
    _initPanel().then(() => {
      XRAY_Panel.add({
        id: 'jv_' + Date.now().toString(36),
        type: 'log',
        timestamp: Date.now(),
        logLevel: 'log',
        logData: data,
        pinned: false,
      });
      XRAY_Panel.show();
    });
  };
})();
