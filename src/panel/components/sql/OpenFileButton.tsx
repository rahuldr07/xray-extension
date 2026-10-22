import React, { useRef } from 'react';
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

export function OpenFileButton({ disabled }: { disabled?: boolean }): React.ReactElement {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const openFile = usePanelSqlStore((s) => s.openFile);

  async function pick(): Promise<void> {
    const picker = window.showOpenFilePicker;
    if (typeof picker !== 'function') {
      inputRef.current?.click();
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
      inputRef.current?.click();
      return;
    }
    if (!handle) return;
    await openFile(await handle.getFile(), handle);
  }

  return (
    <>
      <button className="xray-btn" disabled={disabled} onClick={() => void pick()}>
        <IconFolderOpen size={16} stroke={1.8} />
        Open SQLite file
      </button>
      {/* Always mounted: the fallback when the File System Access API is missing. */}
      <input
        ref={inputRef}
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
    </>
  );
}
