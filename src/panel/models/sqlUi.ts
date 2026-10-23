// Small display decisions for the SQL page: file sizes, shortcut labels, dropped files and the
// rail's table filter. Pure logic; keep React and the runtime out of this file.

export function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`;
  const kb = size / 1024;
  if (kb < 1024) return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
}

/** True on macOS, where the editor's Mod key is Cmd. */
export function isMacPlatform(platform: string): boolean {
  return /mac|iphone|ipad/i.test(platform);
}

export function shortcutLabels(mac: boolean): { mod: string; run: string; runAll: string } {
  const mod = mac ? 'Cmd' : 'Ctrl';
  return { mod, run: mac ? '⌘ ↵' : 'Ctrl ↵', runAll: mac ? '⌘ ⇧ ↵' : 'Ctrl ⇧ ↵' };
}

export function editorPlaceholder(mac: boolean): string {
  const mod = shortcutLabels(mac).mod;
  return `Write SQL here — ${mod}+Enter runs the statement at the cursor, ${mod}+Shift+Enter runs all.`;
}

/** Of the files dropped on the page, the one to open and the names of the ones ignored. */
export function pickDroppedFile<T extends { name: string }>(files: readonly T[]): { file: T | null; ignored: string[] } {
  if (!files.length) return { file: null, ignored: [] };
  return { file: files[0], ignored: files.slice(1).map((f) => f.name) };
}

/** The Messages line for a drop of several files, said before the first one opens. */
export function ignoredFilesMessage(opened: string, ignored: readonly string[]): string | null {
  if (!ignored.length) return null;
  const noun = ignored.length === 1 ? 'file' : 'files';
  return `Only one file opens at a time: opening ${opened}, ignored ${ignored.length} other ${noun}: ${ignored.join(', ')}.`;
}

/** The rail's "Filter tables" match: a case-insensitive substring of the name. */
export function matchesTableFilter(name: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  return !q || name.toLowerCase().includes(q);
}
