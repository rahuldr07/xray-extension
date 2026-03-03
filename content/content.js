// content/content.js — ISOLATED world entry point
(function () {
  'use strict';
  let _panelReady = false;
  function _initPanel() { if (_panelReady) return; _panelReady = true; XRAY_Panel.init(); }
  window.addEventListener('message', (e) => {
    if (!e.data?.__xray_capture__) return;
    const entry = e.data.entry; if (!entry) return;
    _initPanel(); XRAY_Panel.add(entry);
  });
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'xray:toggle') { _initPanel(); XRAY_Panel.toggle(); }
  });
})();
