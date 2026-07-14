import React, { useEffect, useMemo, useRef, useState } from 'react';
import { IconBookmark, IconCopy, IconDownload, IconFileExport, IconFileImport, IconSend } from '@tabler/icons-react';
import { selectedEntry, usePanelStore } from '../../store';
import { exportGroups, exportMeta, exportText, filenameForExport, mimeForExport, type ExportFormat } from '../../models/export';
import { parseImport } from '../../models/import';
import { copyText, downloadText } from '../../utils';
import { ModalShell } from '../common/ModalShell';

const iconProps = { size: 16, stroke: 1.8 } as const;
type ExportMode = 'selected' | 'session';

function isSessionFormat(format: ExportFormat): boolean {
  return format.startsWith('session-');
}

export function ExportModal(): React.ReactElement | null {
  const open = usePanelStore((state) => state.exportOpen);
  const setOpen = usePanelStore((state) => state.setExportOpen);
  const entries = usePanelStore((state) => state.entries);
  const showToast = usePanelStore((state) => state.showToast);
  const insertConsoleCommand = usePanelStore((state) => state.insertConsoleCommand);
  const saveSnippet = usePanelStore((state) => state.saveSnippet);
  const restoreEntries = usePanelStore((state) => state.restoreEntries);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const selected = selectedEntry();
  const [mode, setMode] = useState<ExportMode>('session');
  const [format, setFormat] = useState<ExportFormat>('curl');
  const selectedForExport = mode === 'selected' ? selected : null;
  const text = useMemo(() => exportText(selectedForExport, entries, format), [entries, format, selectedForExport]);
  const meta = exportMeta[format];
  const filename = filenameForExport(selectedForExport, format);

  useEffect(() => {
    if (!open) return;
    const nextMode: ExportMode = selected ? 'selected' : 'session';
    setMode(nextMode);
    setFormat(nextMode === 'selected' ? 'curl' : 'session-json');
  }, [open, selected?.id]);

  if (!open) return null;

  function switchMode(nextMode: ExportMode): void {
    setMode(nextMode);
    setFormat(nextMode === 'selected' ? 'curl' : 'session-json');
  }

  async function copyCurrent(): Promise<void> {
    await copyText(text);
    showToast(`${meta.title} copied.`);
  }

  function downloadCurrent(): void {
    downloadText(filename, text, mimeForExport(format));
    showToast(`${meta.title} downloaded.`);
  }

  function sendToConsole(): void {
    insertConsoleCommand(text);
    setOpen(false);
    showToast('Export snippet inserted in Console.');
  }

  function sendToSnippets(): void {
    saveSnippet({ title: meta.title, code: text });
    setOpen(false);
    showToast('Saved to Console snippets.');
  }

  async function handleImportFile(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;
    try {
      const content = await file.text();
      const result = parseImport(content);
      if (result.error || !result.entries.length) {
        showToast(result.error || 'No entries found in file.');
        return;
      }
      restoreEntries(result.entries);
      setOpen(false);
      showToast(`Imported ${result.entries.length} ${result.format === 'har' ? 'HAR' : 'session'} entries.`);
    } catch {
      showToast('Could not read the selected file.');
    }
  }

  const subtitle = mode === 'selected' && selected
    ? `${selected.method || 'GET'} ${selected.urlPath || selected.url || ''}`
    : `${entries.length} captured entries`;

  return (
    <ModalShell
      title={mode === 'selected' ? 'Export selected request' : 'Export session'}
      subtitle={subtitle}
      icon={<IconFileExport {...iconProps} />}
      className="xray-export-modal"
      onClose={() => setOpen(false)}
      footer={(
        <>
          <span className="xray-muted">{text.length.toLocaleString()} chars</span>
          <input ref={fileInputRef} type="file" accept=".har,.json,application/json" style={{ display: 'none' }} onChange={(event) => void handleImportFile(event)} />
          <button className="xray-btn" onClick={() => fileInputRef.current?.click()}><IconFileImport {...iconProps} />Import HAR / session</button>
          <span className="xray-spacer" />
          {mode === 'selected' && (
            <>
              <button className="xray-btn" onClick={sendToConsole}><IconSend {...iconProps} />Console</button>
              <button className="xray-btn" onClick={sendToSnippets}><IconBookmark {...iconProps} />Snippet</button>
            </>
          )}
          <button className="xray-btn" onClick={() => void copyCurrent()}><IconCopy {...iconProps} />Copy</button>
          <button className="xray-btn primary" onClick={downloadCurrent}><IconDownload {...iconProps} />Download</button>
        </>
      )}
    >
      <div className="xray-export-body">
          <nav className="xray-export-rail" aria-label="Export formats">
            <div className="xray-export-mode">
              <button className={`xray-chip ${mode === 'selected' ? 'active' : ''}`} disabled={!selected} title={selected ? 'Use selected request' : 'Select an API request first'} onClick={() => switchMode('selected')}>Selected</button>
              <button className={`xray-chip ${mode === 'session' ? 'active' : ''}`} onClick={() => switchMode('session')}>Session</button>
            </div>
            {exportGroups.map((group) => (
              <div key={group.label} className="xray-export-group">
                <div className="xray-export-group-label">{group.label}</div>
                {group.formats.map((item) => {
                  const disabled = mode === 'session' ? !isSessionFormat(item) : isSessionFormat(item) || !selected;
                  const disabledReason = !selected && !isSessionFormat(item)
                    ? 'Select a request first'
                    : mode === 'session' && !isSessionFormat(item)
                      ? 'Switch to Selected mode'
                      : isSessionFormat(item) && mode === 'selected'
                        ? 'Switch to Session mode'
                        : undefined;
                  return (
                    <button
                      key={item}
                      disabled={disabled}
                      className={`xray-export-format ${format === item ? 'active' : ''}`}
                      title={disabledReason}
                      onClick={() => setFormat(item)}
                    >
                      <span>{exportMeta[item].title}</span>
                      <small>{exportMeta[item].extension}</small>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
          <section className="xray-export-preview">
            <header className="xray-export-preview-head">
              <div>
                <h3>{meta.title}</h3>
                <p>{meta.desc}</p>
              </div>
              <span className="xray-count-pill">{filename}</span>
            </header>
            <pre className="xray-json xray-export-code">{text}</pre>
          </section>
      </div>
    </ModalShell>
  );
}
