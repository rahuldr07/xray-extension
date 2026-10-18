// Storage access for the panel, always through XRAY_Store (chrome.storage.local).
//
// There is deliberately no localStorage fallback. In a content script `localStorage`
// belongs to the *page*, not the extension, so falling back to it would write panel
// state — including the BYOK API key, which setStoredValue is called with — into the
// visited site's own storage in plaintext, readable by one line of page script.
//
// XRAY_Store is loaded before every bundle that calls this (see the script order in
// manifest.json and window.html). If it is ever missing, that is a wiring bug: fail
// closed with a generic failure receipt rather than leak it to the page.

type StorageErrorCode = 'storage-unavailable' | 'storage-read-failed' | 'storage-write-failed';
/** Why a write failed, when shared/store.js could tell: a full quota (spec J9's save notice). */
export type StorageFailureReason = 'quota';

function storageFailure(code: StorageErrorCode, caught?: unknown): Error & { code: StorageErrorCode; reason?: StorageFailureReason } {
  const safeCode = typeof caught === 'object' && caught !== null && 'code' in caught && caught.code === 'storage-unavailable'
    ? 'storage-unavailable' : code;
  const quota = safeCode === 'storage-write-failed' && typeof caught === 'object' && caught !== null && 'reason' in caught && caught.reason === 'quota';
  return Object.assign(new Error(safeCode), { code: safeCode }, quota ? { reason: 'quota' as const } : {});
}

export async function getStoredValue<T>(key: string, fallback: T): Promise<T> {
  if (typeof window.XRAY_Store?.get !== 'function') throw storageFailure('storage-unavailable');
  try {
    return (await window.XRAY_Store.get<T>(key, fallback, true)) ?? fallback;
  } catch (error) {
    throw storageFailure('storage-read-failed', error);
  }
}

export async function setStoredValue<T>(key: string, value: T): Promise<void> {
  if (typeof window.XRAY_Store?.set !== 'function') throw storageFailure('storage-unavailable');
  try {
    await window.XRAY_Store.set(key, value, true);
  } catch (error) {
    throw storageFailure('storage-write-failed', error);
  }
}
