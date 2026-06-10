import React from 'react';
import { IconDownload, IconFilterOff, IconPlayerRecord, IconPinnedOff, IconSettings, IconTrash } from '@tabler/icons-react';
import { usePanelStore } from '../../store';
import { iconProps } from '../shell/panelTabs';

export function Settings(): React.ReactElement {
  const entries = usePanelStore((state) => state.entries);
  const consoleEvents = usePanelStore((state) => state.consoleEvents);
  const pinnedIds = usePanelStore((state) => state.pinnedIds);
  const recording = usePanelStore((state) => state.recording);
  const setRecording = usePanelStore((state) => state.setRecording);
  const clearEntries = usePanelStore((state) => state.clearEntries);
  const clearConsole = usePanelStore((state) => state.clearConsole);
  const clearPinned = usePanelStore((state) => state.clearPinned);
  const clearApiFilters = usePanelStore((state) => state.clearApiFilters);
  const setExportOpen = usePanelStore((state) => state.setExportOpen);
  const setSettingsOpen = usePanelStore((state) => state.setSettingsOpen);
  const requestConfirmation = usePanelStore((state) => state.requestConfirmation);
  const showToast = usePanelStore((state) => state.showToast);
  const settings = usePanelStore((state) => state.settings);

  function confirmDanger(title: string, message: string, confirmLabel: string, action: () => void): void {
    if (!settings.confirmDestructiveActions) {
      action();
      return;
    }
    requestConfirmation({ title, message, confirmLabel, tone: 'danger', onConfirm: action });
  }

  return (
    <section className="xray-page">
      <header className="xray-page-head">
        <div>
          <h3>Settings</h3>
          <p>Full diagnostics and session controls. Use quick settings for runtime preferences.</p>
        </div>
        <button className="xray-btn primary" onClick={() => setSettingsOpen(true)}><IconSettings {...iconProps} />Open quick settings</button>
      </header>
      <div className="xray-settings-grid">
        <section className="xray-card">
          <h3>Session</h3>
          <p className="xray-muted">{entries.length} entries, {consoleEvents.length} console events, {pinnedIds.size} pinned.</p>
          <div className="xray-settings-actions">
            <button className="xray-btn" onClick={() => setExportOpen(true)}><IconDownload {...iconProps} />Export session</button>
            <button className="xray-btn" onClick={() => setRecording(!recording)}><IconPlayerRecord {...iconProps} />{recording ? 'Pause recording' : 'Resume recording'}</button>
          </div>
        </section>
        <section className="xray-card">
          <h3>Active preferences</h3>
          <p className="xray-muted">Fetch {settings.captureFetch ? 'on' : 'off'}, XHR {settings.captureXhr ? 'on' : 'off'}, max {settings.maxEntries} entries, slow &gt;{settings.slowThresholdMs}ms.</p>
          <div className="xray-settings-actions">
            <button className="xray-btn" onClick={() => setSettingsOpen(true)}><IconSettings {...iconProps} />Edit preferences</button>
          </div>
        </section>
        <section className="xray-card">
          <h3>Reset</h3>
          <div className="xray-settings-actions">
            <button className="xray-btn" onClick={() => { clearApiFilters(); showToast('API filters cleared.'); }}><IconFilterOff {...iconProps} />Clear filters</button>
            <button className="xray-btn" onClick={() => confirmDanger('Clear pinned requests?', 'This removes all pinned request markers from the React UI.', 'Clear pinned', () => { clearPinned(); showToast('Pinned requests cleared.'); })}><IconPinnedOff {...iconProps} />Clear pinned</button>
            <button className="xray-btn" onClick={() => confirmDanger('Clear console stream?', 'This clears console UI events but keeps captured API entries.', 'Clear console', () => { clearConsole(); showToast('Console stream cleared.'); })}><IconTrash {...iconProps} />Clear console</button>
            <button className="xray-btn danger" onClick={() => confirmDanger('Clear all captured entries?', 'This removes requests, logs, console events, and pins from the React UI session.', 'Clear all entries', () => { clearEntries(); showToast('Captured entries cleared.'); })}><IconTrash {...iconProps} />Clear all entries</button>
          </div>
        </section>
        <section className="xray-card">
          <h3>Runtime Boundary</h3>
          <p className="xray-muted">React owns user-facing UI. Background worker, interceptors, decrypt bridge, console executor, and content capture remain vanilla. Fetch/XHR toggles are passed to the MAIN-world interceptor through a bounded config bridge.</p>
        </section>
      </div>
    </section>
  );
}
