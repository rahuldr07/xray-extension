// shared/store.js — chrome.storage.local wrapper
window.XRAY_Store = (() => {
  'use strict';

  const PREFIX = 'xray_';

  function storageFailure(code) {
    const error = new Error(code);
    error.code = code;
    return error;
  }

  // Legacy callers keep defaults/best-effort writes. Only the React bridge opts
  // into strict failures; receipts never retain Chrome messages, keys or values.
  async function get(key, defaultVal = null, strict = false) {
    let available = false;
    try {
      const storage = typeof chrome === 'undefined' ? null : chrome.storage?.local;
      available = typeof storage?.get === 'function';
      if (!available) throw storageFailure('storage-unavailable');
      const full = PREFIX + key;
      const result = await storage.get(full);
      return full in result ? result[full] : defaultVal;
    } catch {
      if (strict) throw storageFailure(available ? 'storage-read-failed' : 'storage-unavailable');
      return defaultVal;
    }
  }

  async function set(key, value, strict = false) {
    let available = false;
    try {
      const storage = typeof chrome === 'undefined' ? null : chrome.storage?.local;
      available = typeof storage?.set === 'function';
      if (!available) throw storageFailure('storage-unavailable');
      await storage.set({ [PREFIX + key]: value });
    } catch {
      if (strict) throw storageFailure(available ? 'storage-write-failed' : 'storage-unavailable');
      // Legacy quota or context errors remain best effort.
    }
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
