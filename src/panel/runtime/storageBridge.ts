// Storage access for the panel, always through XRAY_Store (chrome.storage.local).
//
// There is deliberately no localStorage fallback. In a content script `localStorage`
// belongs to the *page*, not the extension, so falling back to it would write panel
// state — including the BYOK API key, which setStoredValue is called with — into the
// visited site's own storage in plaintext, readable by one line of page script.
//
// XRAY_Store is loaded before every bundle that calls this (see the script order in
// manifest.json and window.html). If it is ever missing, that is a wiring bug: fail
// closed and lose the preference rather than leak it to the page.

function warnMissingStore(operation: string, key: string): void {
  console.warn(`[XRAY] XRAY_Store unavailable; skipping ${operation} of "${key}".`);
}

export async function getStoredValue<T>(key: string, fallback: T): Promise<T> {
  if (window.XRAY_Store?.get) {
    return (await window.XRAY_Store.get<T>(key)) ?? fallback;
  }
  warnMissingStore('read', key);
  return fallback;
}

export async function setStoredValue<T>(key: string, value: T): Promise<void> {
  if (window.XRAY_Store?.set) {
    await window.XRAY_Store.set(key, value);
    return;
  }
  warnMissingStore('write', key);
}
