import React, { useEffect, useMemo, useRef, useState } from 'react';
import { IconBookmark, IconCopy, IconDownload, IconFileExport, IconFileImport, IconSend } from '@tabler/icons-react';
import { selectedEntry, usePanelStore } from '../../store';
import { buildShareSafeExport, exportGroups, exportMeta, exportText, exportUnavailableReason, filenameForExport, isShareSafeFormat, mimeForExport, previewText, sessionFilename, type ExportFormat } from '../../models/export';
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
  const shareSafeExport = useMemo(() => isShareSafeFormat(format) ? buildShareSafeExport(entries, format) : null, [entries, format]);
  const text = useMemo(() => shareSafeExport?.text ?? exportText(selectedForExport, entries, format), [entries, format, selectedForExport, shareSafeExport]);
  const meta = exportMeta[format];
  // Session names carry the local time, so downloadCurrent() recomputes at click time.
  const exportFilename = (): string => isSessionFormat(format)
    ? sessionFilename(isShareSafeFormat(format) ? 'share-safe' : 'session', meta.extension)
    : filenameForExport(selectedForExport, format);
  const filename = exportFilename();
  const preview = useMemo(() => previewText(text), [text]);
  const privacyLabel = isShareSafeFormat(format) ? 'Share-safe' : isSessionFormat(format) ? 'Local/private' : 'Selected request · may contain credentials';

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
    try {
      await copyText(text);
      showToast(`${meta.title} copied.`);
    } catch {
      showToast('Could not copy. Select the preview to copy manually or check clipboard permissions.');
    }
  }

  function downloadCurrent(): void {
    try {
      downloadText(exportFilename(), text, mimeForExport(format));
      showToast('Download started.');
    } catch {
      showToast('Could not start download. Try copying the preview instead.');
    }
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
      const receipt = restoreEntries(result.entries);
      if (receipt.accepted) setOpen(false);
      showToast(`${receipt.accepted ? `Imported ${receipt.accepted}` : 'No new'} ${result.format === 'har' ? 'HAR' : 'session'} entries. ${receipt.duplicates} duplicates; ${receipt.omitted} omitted by retention limit.`);
    } catch {
      showToast('Could not read the selected file.');
    }
  }

  // Each mode shows only its own formats; the other mode's are not rendered at all.
  const visibleGroups = exportGroups.filter((group) => (mode === 'session') === group.formats.every(isSessionFormat));
  function formatState(item: ExportFormat): { disabled: boolean; reason: string | undefined; unavailable: string | null } {
    const unavailable = mode === 'selected' ? exportUnavailableReason(selected, item) : null;
    const disabled = !selected && !isSessionFormat(item) ? true : !!unavailable;
    return { disabled, unavailable, reason: unavailable ?? (!selected && !isSessionFormat(item) ? 'Select a request first' : undefined) };
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
          <span className="xray-modal-foot-meta" title={filename}>{filename} · {text.length.toLocaleString()} chars</span>
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
            <div className="xray-export-mode" role="group" aria-label="Export scope">
              <button className={`xray-chip ${mode === 'selected' ? 'active' : ''}`} aria-pressed={mode === 'selected'} disabled={!selected} title={selected ? 'Use selected request' : 'Select an API request first'} onClick={() => switchMode('selected')}>Selected</button>
              <button className={`xray-chip ${mode === 'session' ? 'active' : ''}`} aria-pressed={mode === 'session'} onClick={() => switchMode('session')}>Session</button>
            </div>
            <select
              className="xray-select xray-export-select"
              aria-label="Export format"
              value={format}
              onChange={(event) => setFormat(event.currentTarget.value as ExportFormat)}
            >
              {visibleGroups.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.formats.map((item) => {
                    const state = formatState(item);
                    return <option key={item} value={item} disabled={state.disabled}>{exportMeta[item].title} .{exportMeta[item].extension}{state.reason ? ` (${state.reason})` : ''}</option>;
                  })}
                </optgroup>
              ))}
            </select>
            {visibleGroups.map((group) => (
              <div key={group.label} className="xray-export-group" role="group" aria-label={group.label}>
                <div className="xray-export-group-label">{group.label}</div>
                <div className="xray-export-group-items">
                  {group.formats.map((item) => {
                    const state = formatState(item);
                    return (
                      <button
                        key={item}
                        disabled={state.disabled}
                        aria-pressed={format === item}
                        className={`xray-export-format ${format === item ? 'active' : ''}`}
                        title={state.reason}
                        aria-description={state.unavailable ?? undefined}
                        onClick={() => setFormat(item)}
                      >
                        <span>{exportMeta[item].title}</span>
                        <small>{exportMeta[item].extension}</small>
                      </button>
                    );
                  })}
                  {group.label === 'Session' && (
                    <>
                      <input ref={fileInputRef} type="file" accept=".har,.json,application/json" style={{ display: 'none' }} onChange={(event) => void handleImportFile(event)} />
                      <button className="xray-export-format xray-export-import" title="Choose a HAR or XRAY session file to restore into this panel" onClick={() => fileInputRef.current?.click()}><IconFileImport {...iconProps} /><span>Import HAR / session</span></button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </nav>
          <section className="xray-export-preview">
            <header className="xray-export-preview-head">
              <div>
                <h3>{meta.title}</h3>
                <p>{meta.desc}</p>
                <p className="xray-export-privacy">
                  {privacyLabel}
                  {shareSafeExport && (
                    <> · {shareSafeExport.redactedCount} redacted · {shareSafeExport.omittedCount} omitted{format === 'session-har-safe' && shareSafeExport.omittedEntryCount ? ` · ${shareSafeExport.omittedEntryCount} entries omitted from HTTP HAR` : ''}</>
                  )}
                </p>
              </div>
            </header>
            <pre className="xray-json xray-export-code">{preview}</pre>
          </section>
      </div>
    </ModalShell>
  );
}
