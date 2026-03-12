// background.js — Service Worker
// Bridges the extension action / keyboard command to the content script panel toggle.

chrome.action.onClicked.addListener((tab) => {
  if (!tab.id) return;
  chrome.tabs.sendMessage(tab.id, { type: 'xray:toggle' }).catch(() => {
    // Tab may not have content script injected (e.g. chrome:// pages). Ignore.
  });
});

chrome.commands.onCommand.addListener((command, tab) => {
  if (command === 'toggle-xray' && tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: 'xray:toggle' }).catch(() => {});
  }
});

// Keep service worker alive for message relaying (Phase 4: DevTools bridge)
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'xray:ping') {
    sendResponse({ alive: true });
    return true;
  }
});
