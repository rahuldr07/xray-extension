// shared/store.js — chrome.storage.local wrapper
window.XRAY_Store = (() => {
  'use strict';

  const PREFIX = 'xray_';

  async function get(key, defaultVal = null) {
    try {
      const full = PREFIX + key;
      const result = await chrome.storage.local.get(full);
      return full in result ? result[full] : defaultVal;
    } catch { return defaultVal; }
  }

  async function set(key, value) {
    try {
      await chrome.storage.local.set({ [PREFIX + key]: value });
    } catch { /* quota or context errors — silently ignore */ }
  }

  async function remove(key) {
    try { await chrome.storage.local.remove(PREFIX + key); } catch {}
  }

  async function clear() {
    try {
      const all = await chrome.storage.local.get(null);
      const keys = Object.keys(all).filter(k => k.startsWith(PREFIX));
      if (keys.length) await chrome.storage.local.remove(keys);
    } catch {}
  }

  return { get, set, remove, clear };
})();
