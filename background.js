// background.js — Service Worker
// Bridges the extension action / keyboard command to the content script panel toggle.

const _devtoolsPortsByTab = new Map();

function _addCandidateTabId(ids, tabLike) {
  const tabId = Number(tabLike?.id);
  if (!Number.isInteger(tabId) || tabId < 0) return;
  if (!ids.includes(tabId)) ids.push(tabId);
}

async function _collectToggleTargets(tabArg) {
  const ids = [];
  _addCandidateTabId(ids, tabArg);

  const queries = [
    { active: true, currentWindow: true },
    { active: true, lastFocusedWindow: true },
    { active: true },
  ];

  for (const query of queries) {
    try {
      const tabs = await chrome.tabs.query(query);
      tabs
        .slice()
        .sort((a, b) => (Number(b.lastAccessed) || 0) - (Number(a.lastAccessed) || 0))
        .forEach((tab) => _addCandidateTabId(ids, tab));
    } catch (err) {
      console.debug('[XRAY] tab query failed', query, err?.message || String(err));
    }
  }

  return ids;
}

async function _sendToggle(tabId) {
  if (!Number.isInteger(tabId) || tabId < 0) {
    console.debug('[XRAY] toggle ignored: invalid tabId', tabId);
    return false;
  }
  console.debug('[XRAY] sending toggle to tab', tabId);
  try {
    await chrome.tabs.sendMessage(tabId, { type: 'xray:toggle' });
    return true;
  } catch (err) {
    // Tab may not have content script injected (e.g. chrome:// pages). Ignore.
    console.debug('[XRAY] toggle message failed (likely unsupported page)', tabId, err?.message || String(err));
    return false;
  }
}

chrome.action.onClicked.addListener((tab) => {
  void _sendToggle(tab?.id);
});

chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command !== 'toggle-xray') return;
  console.debug('[XRAY] command received', command, 'tabArg:', tab?.id ?? null);

  // Some browsers do not provide tab for command events.
  // Try several active-tab strategies and send to the first reachable tab.
  const targetIds = await _collectToggleTargets(tab);
  console.debug('[XRAY] command target candidates', targetIds);
  for (const targetId of targetIds) {
    if (await _sendToggle(targetId)) return;
  }

  console.debug('[XRAY] command toggle failed: no reachable target tab');
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
