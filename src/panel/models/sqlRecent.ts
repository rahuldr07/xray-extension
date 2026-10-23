// The welcome screen's recent files: newest first, one entry per file, at most five. Pure logic;
// the handles themselves are stored by runtime/recentFiles.ts.

export const RECENT_FILES_LIMIT = 5;

export interface RecentFile<H = unknown> {
  name: string;
  size: number;
  lastOpened: number;
  handle: H;
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
