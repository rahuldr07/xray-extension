// background.js — Service Worker
// Bridges the extension action / keyboard command to the content script panel toggle.

const _devtoolsPortsByTab = new Map();

function _sendToggle(tabId) {
  if (!Number.isInteger(tabId) || tabId < 0) {
    console.debug('[XRAY] toggle ignored: invalid tabId', tabId);
    return;
  }
  console.debug('[XRAY] sending toggle to tab', tabId);
  chrome.tabs.sendMessage(tabId, { type: 'xray:toggle' }).catch(() => {
    // Tab may not have content script injected (e.g. chrome:// pages). Ignore.
    console.debug('[XRAY] toggle message failed (likely unsupported page)', tabId);
  });
}

chrome.action.onClicked.addListener((tab) => {
  _sendToggle(tab?.id);
});

chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command !== 'toggle-xray') return;
  console.debug('[XRAY] command received', command, 'tabArg:', tab?.id ?? null);

  // Some browsers don't provide tab for command events. Fall back to active tab.
  let tabId = Number.isInteger(tab?.id) ? tab.id : null;
  if (!Number.isInteger(tabId)) {
    const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    tabId = activeTab?.id;
    console.debug('[XRAY] command fallback active tab', tabId ?? null);
  }

  _sendToggle(tabId);
});

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'xray-devtools') return;

  let boundTabId = null;

  port.onMessage.addListener((msg) => {
    if (!msg || msg.type !== 'xray:devtools:init') return;
    const tabId = Number(msg.tabId);
    if (!Number.isInteger(tabId) || tabId < 0) return;

    boundTabId = tabId;
    _devtoolsPortsByTab.set(tabId, port);
  });

  port.onDisconnect.addListener(() => {
    if (boundTabId !== null && _devtoolsPortsByTab.get(boundTabId) === port) {
      _devtoolsPortsByTab.delete(boundTabId);
    }
    for (const [tabId, mappedPort] of _devtoolsPortsByTab.entries()) {
      if (mappedPort === port) _devtoolsPortsByTab.delete(tabId);
    }
  });
});

// Keep service worker alive for message relaying (Phase 4: DevTools bridge)
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'xray:ping') {
    sendResponse({ alive: true });
    return true;
  }

  if (msg.type === 'xray:capture') {
    const tabId = sender?.tab?.id;
    if (Number.isInteger(tabId) && msg.entry) {
      const port = _devtoolsPortsByTab.get(tabId);
      if (port) {
        try { port.postMessage({ type: 'xray:capture', entry: msg.entry }); } catch {}
      }
    }
  }
});
