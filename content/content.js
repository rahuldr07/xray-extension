// content/content.js — ISOLATED world entry point
// Listens for capture events from MAIN world scripts
(function () {
  'use strict';
  // NOTE: We use postMessage instead of CustomEvent because Chrome nullifies
  // CustomEvent.detail when crossing MAIN→ISOLATED world boundary.
  // Wasted 2 hours debugging this. Thanks Chrome.
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
