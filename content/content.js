// content/content.js — ISOLATED world entry point
(function () {
  'use strict';
  window.addEventListener('message', (e) => {
    if (!e.data?.__xray_capture__) return;
    const entry = e.data.entry;
    if (!entry) return;
    console.log('[XRAY content.js]', entry);
  });
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'xray:toggle') console.log('[XRAY] toggle');
  });
})();
