// Recent SQLite files for the welcome screen: FileSystemFileHandles kept in IndexedDB in the
// extension origin (chrome.storage cannot hold handles). Only files opened through the File System
// Access picker have a handle, so the list exists only where that picker works. The list's ordering
// and capping live in models/sqlRecent.ts.

import { addRecent, removeRecent, restoreRecent, type RecentFile } from '../models/sqlRecent';

const DB_NAME = 'xray-sql';
const STORE = 'recent-files';
const KEY = 'list';

type PermissionMode = { mode: 'read' | 'readwrite' };
interface PermissionedHandle extends FileSystemFileHandle {
  queryPermission?(descriptor: PermissionMode): Promise<PermissionState>;
  requestPermission?(descriptor: PermissionMode): Promise<PermissionState>;
}

export type RecentSqlFile = RecentFile<FileSystemFileHandle>;

/** The picker works only in a top-level page or under a same-origin parent (not the DevTools panel). */
export function recentFilesAvailable(): boolean {
  if (typeof indexedDB === 'undefined' || typeof window.showOpenFilePicker !== 'function') return false;
  if (window.parent === window) return true;
  try {
    return window.parent.location.origin === window.location.origin;
  } catch {
    return false;
  }
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const request = run(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(request.result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

export async function loadRecentFiles(): Promise<RecentSqlFile[]> {
  if (!recentFilesAvailable()) return [];
  return restoreRecent<FileSystemFileHandle>(await withStore('readonly', (store) => store.get(KEY)));
}

async function saveRecentFiles(list: RecentSqlFile[]): Promise<void> {
  await withStore('readwrite', (store) => store.put(list, KEY));
}

/** Records a file opened through the picker. Failures are ignored: the list is a convenience. */
export async function rememberRecentFile(handle: FileSystemFileHandle, file: File): Promise<void> {
  try {
    const list = await loadRecentFiles();
    // The same file under a new size is still the same file.
    const same = await Promise.all(list.map((item) => item.handle.isSameEntry(handle).catch(() => false)));
    const others = list.filter((_, i) => !same[i]);
    await saveRecentFiles(addRecent(others, { name: file.name, size: file.size, lastOpened: Date.now(), handle }));
  } catch {
    // IndexedDB unavailable or a handle that no longer compares: keep the old list.
  }
}

export async function forgetRecentFile(entry: { name: string; size: number }): Promise<RecentSqlFile[]> {
  const list = removeRecent(await loadRecentFiles(), entry);
  await saveRecentFiles(list);
  return list;
}

/** Asks for read access again (it lapses between sessions) and reads the file. */
export async function readRecentFile(entry: RecentSqlFile): Promise<{ file: File } | { error: string }> {
  const handle = entry.handle as PermissionedHandle;
  try {
    let state = (await handle.queryPermission?.({ mode: 'read' })) ?? 'granted';
    if (state !== 'granted') state = (await handle.requestPermission?.({ mode: 'read' })) ?? 'denied';
    if (state !== 'granted') return { error: 'Permission to read this file was denied.' };
    return { file: await handle.getFile() };
  } catch (err) {
    const name = (err as { name?: unknown } | null)?.name;
    if (name === 'NotFoundError') return { error: 'This file is no longer there.' };
    if (name === 'NotAllowedError' || name === 'SecurityError') return { error: 'Permission to read this file was denied.' };
    return { error: 'This file could not be read.' };
  }
}
