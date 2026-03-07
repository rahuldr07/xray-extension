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
      if (!msg || msg.type !== 'xray:capture' || !msg.entry) return;
      XRAY_Panel.add(msg.entry);
    });
  }

  initPanel().then(connectBridge).catch((err) => {
    console.error('XRAY DevTools panel failed to initialize', err);
  });
})();
