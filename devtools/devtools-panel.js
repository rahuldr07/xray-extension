(function () {
  'use strict';

  const inspectedTabId = chrome.devtools.inspectedWindow.tabId;
  let port = null;

  async function initPanel() {
    await XRAY_Panel.init({
      mountEl: document.body,
      useShadow: false,
      devtoolsMode: true,
      clearMount: true,
    });
    XRAY_Panel.show();
  }

  function connectBridge() {
    port = chrome.runtime.connect({ name: 'xray-devtools' });
    port.postMessage({ type: 'xray:devtools:init', tabId: inspectedTabId });

    port.onMessage.addListener((msg) => {
      if (!msg) return;
      if (msg.type === 'xray:capture' && msg.entry) {
        XRAY_Panel.add(msg.entry);
      } else if (msg.type === 'xray:capture-batch' && Array.isArray(msg.entries)) {
        if (XRAY_Panel.addAll) XRAY_Panel.addAll(msg.entries);
        else msg.entries.forEach((entry) => entry && XRAY_Panel.add(entry));
      } else if (msg.type === 'xray:capture-update' && msg.update) {
        XRAY_Panel.update(msg.update);
      }
    });
  }

  initPanel().then(connectBridge).catch((err) => {
    console.error('XRAY DevTools panel failed to initialize', err);
  });
})();
