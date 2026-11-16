// The welcome screen's recent files: newest first, one entry per file, at most five. Pure logic;
// the handles themselves are stored by runtime/recentFiles.ts.

export const RECENT_FILES_LIMIT = 5;

export interface RecentFile<H = unknown> {
  name: string;
  size: number;
  lastOpened: number;
  handle: H;
  /** The file's stable id: part of its SQL history key (models/sqlHistory.ts connectionKeyForFile). */
  id?: string;
}

/** How many file ids are kept: as many as SQL history keeps connection keys (CONNECTION_KEY_LIMIT). */
export const FILE_IDS_LIMIT = 50;

/** A picker-opened file's stable id, kept apart from the five-file recent list so it outlives it. */
export interface FileId<H = unknown> {
  id: string;
  lastOpened: number;
  handle: H;
}

export function addFileId<H>(list: readonly FileId<H>[], entry: FileId<H>, limit = FILE_IDS_LIMIT): FileId<H>[] {
  return [entry, ...list.filter((item) => item.id !== entry.id)].sort((a, b) => b.lastOpened - a.lastOpened).slice(0, limit);
}

/** A stored value as a valid id list: well-formed entries with a handle, newest first, capped. */
export function restoreFileIds<H>(raw: unknown, limit = FILE_IDS_LIMIT): FileId<H>[] {
  if (!Array.isArray(raw)) return [];
  const valid = raw.filter(
    (item): item is FileId<H> =>
      !!item &&
      typeof item === 'object' &&
      typeof item.id === 'string' &&
      item.id !== '' &&
      Number.isFinite(item.lastOpened) &&
      !!item.handle &&
      typeof item.handle === 'object',
  );
  let out: FileId<H>[] = [];
  for (const item of valid.slice().sort((a, b) => a.lastOpened - b.lastOpened)) out = addFileId(out, item, limit);
  return out;
}

function sameFile(a: { name: string; size: number }, b: { name: string; size: number }): boolean {
  return a.name === b.name && a.size === b.size;
}

/** The list with `entry` at the front, replacing an older entry for the same file, capped. */
export function addRecent<H>(list: readonly RecentFile<H>[], entry: RecentFile<H>, limit = RECENT_FILES_LIMIT): RecentFile<H>[] {
  return [entry, ...list.filter((item) => !sameFile(item, entry))]
    .sort((a, b) => b.lastOpened - a.lastOpened)
    .slice(0, limit);
}

export function removeRecent<H>(list: readonly RecentFile<H>[], file: { name: string; size: number }): RecentFile<H>[] {
  return list.filter((item) => !sameFile(item, file));
}

/** A stored value as a valid list: well-formed entries with a handle, newest first, capped. */
export function restoreRecent<H>(raw: unknown, limit = RECENT_FILES_LIMIT): RecentFile<H>[] {
  if (!Array.isArray(raw)) return [];
  const valid = raw.filter(
    (item): item is RecentFile<H> =>
      !!item &&
      typeof item === 'object' &&
      typeof item.name === 'string' &&
      typeof item.size === 'number' &&
      Number.isFinite(item.lastOpened) &&
      !!item.handle &&
      typeof item.handle === 'object',
  );
  let out: RecentFile<H>[] = [];
  // Oldest first, so the newest entry for a file wins.
  for (const item of valid.slice().sort((a, b) => a.lastOpened - b.lastOpened)) out = addRecent(out, item, limit);
  return out;
}

/** "Today 14:05", "Yesterday", or a date: when a recent file was last opened. */
export function lastOpenedLabel(at: number, now: number): string {
  const day = (t: number) => new Date(t).toDateString();
  if (day(at) === day(now)) {
    const d = new Date(at);
    return `Today ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  if (day(at) === day(now - 86_400_000)) return 'Yesterday';
  return new Date(at).toLocaleDateString();
}
