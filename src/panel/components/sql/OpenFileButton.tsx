import React from 'react';
import { IconFolderOpen } from '@tabler/icons-react';
import { usePanelSqlStore } from '../../sqlStore';

declare global {
  interface Window {
    // File System Access API; Chromium only, not in lib.dom.
    showOpenFilePicker?: (options?: {
      multiple?: boolean;
      excludeAcceptAllOption?: boolean;
      types?: { description?: string; accept: Record<string, string[]> }[];
    }) => Promise<FileSystemFileHandle[]>;
  }
}

const ACCEPT = '.sqlite,.sqlite3,.db,.db3,application/vnd.sqlite3';
const PICKER_TYPES = [
  { description: 'SQLite database', accept: { 'application/vnd.sqlite3': ['.sqlite', '.sqlite3', '.db', '.db3'] } },
];

// The page's one <input type="file">, mounted once by SqlApp: the welcome screen and the source menu
// both open files through it when the File System Access picker is missing or refused.
let fileInput: HTMLInputElement | null = null;

/** Opens a file the way the Open button does: the picker, else the file input. Ctrl/Cmd+O uses it. */
export function requestOpenFile(): Promise<void> {
  return pickFile(usePanelSqlStore.getState().openFile);
}

async function pickFile(openFile: (file: File, handle?: FileSystemFileHandle) => Promise<void>): Promise<void> {
  const picker = window.showOpenFilePicker;
  if (typeof picker !== 'function') {
    fileInput?.click();
    return;
  }
  let handle: FileSystemFileHandle | undefined;
  try {
    [handle] = await picker.call(window, { multiple: false, types: PICKER_TYPES });
  } catch (err) {
    // The user dismissed the picker.
    if ((err as { name?: unknown } | null)?.name === 'AbortError') return;
    // Anything else means the picker cannot run here: inside the DevTools panel sql.html is a
    // cross-origin subframe and the picker throws SecurityError. The file input still works.
    fileInput?.click();
    return;
  }
  if (!handle) return;
  await openFile(await handle.getFile(), handle);
}

export function FileOpenInput(): React.ReactElement {
  const openFile = usePanelSqlStore((s) => s.openFile);
  return (
    // Always mounted: the fallback when the File System Access API is missing.
    <input
      ref={(el) => {
        fileInput = el;
      }}
      type="file"
      accept={ACCEPT}
      hidden
      tabIndex={-1}
      aria-hidden="true"
      onChange={(e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (file) void openFile(file);
      }}
    />
  );
}

export function OpenFileButton({
  disabled,
  className = 'xray-btn',
  label = 'Open SQLite file',
  title,
  onPicked,
}: {
  disabled?: boolean;
  className?: string;
  label?: string;
  title?: string;
  onPicked?(): void;
}): React.ReactElement {
  const openFile = usePanelSqlStore((s) => s.openFile);
  return (
    // The accessible name stays "Open SQLite file" whatever the visible label adds (an ellipsis).
    <button
      type="button"
      className={className}
      disabled={disabled}
      title={title}
      aria-label="Open SQLite file"
      onClick={() => {
        onPicked?.();
        void pickFile(openFile);
      }}
    >
      <IconFolderOpen size={16} stroke={1.8} aria-hidden="true" />
      {label}
    </button>
  );
}
