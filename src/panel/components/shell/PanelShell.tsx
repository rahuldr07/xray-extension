import React from 'react';
import { IconArrowsMaximize, IconDeviceLaptop, IconDownload, IconPictureInPicture, IconSettings, IconTerminal2 } from '@tabler/icons-react';
import { usePanelStore } from '../../store';
import { PANEL_ACCENT_VALUES, PANEL_FONT_VALUES } from '../../models/panelSettings';
import { buildSessionSummary } from '../../models/sessionSummary';
import { formatBytes } from '../../utils';
import { panelTabs } from './panelTabs';
import type { XrayAppMode } from '../../types';

const modeIconProps = { size: 16, stroke: 1.8 } as const;

export function PanelShell({ children, mode }: { children: React.ReactNode; mode: XrayAppMode }): React.ReactElement {
  const open = usePanelStore((state) => state.open);
  const devtoolsMode = usePanelStore((state) => state.devtoolsMode);
  const activeTab = usePanelStore((state) => state.activeTab);
  const setActiveTab = usePanelStore((state) => state.setActiveTab);
  const entries = usePanelStore((state) => state.entries);
  const settings = usePanelStore((state) => state.settings);
  const setExportOpen = usePanelStore((state) => state.setExportOpen);
  const setSettingsOpen = usePanelStore((state) => state.setSettingsOpen);
  const showToast = usePanelStore((state) => state.showToast);
  const toastMessage = usePanelStore((state) => state.toastMessage);
  const clearToast = usePanelStore((state) => state.clearToast);
  const { apiCount, logCount, errorCount, totalBytes } = buildSessionSummary(entries);

  function sendRuntimeMessage(message: Record<string, unknown>, fallback: string): void {
    if (typeof chrome !== 'undefined' && chrome?.runtime?.sendMessage) {
      try {
        chrome.runtime.sendMessage(message, () => void 0);
        return;
      } catch {}
    }
    showToast(fallback);
  }

  function openDevtoolsHint(): void {
    showToast('Press F12, then open the XRAY tab.');
  }

  function toggleHud(): void {
    if (window.XRAY_HUD?.isVisible?.()) {
      window.XRAY_HUD.collapse();
      return;
    }
    sendRuntimeMessage({ type: 'XRAY_HUD_TOGGLE_ACTIVE' }, 'Open a normal page tab, then use XRAY from the extension icon.');
  }

  function openWindow(): void {
    sendRuntimeMessage({ type: 'XRAY_OPEN_WINDOW' }, 'Pop-out window is available when the extension runtime is loaded.');
  }

  return (
    <div
      className={`xray-panel xray-mode-${mode} xray-theme-${settings.theme} xray-density-${settings.density} xray-font-${settings.font} ${settings.glow ? 'xray-glow' : 'xray-no-glow'} ${open ? 'xray-open' : ''} ${devtoolsMode ? 'xray-devtools' : ''} ${settings.compactRows ? 'xray-compact-rows' : ''}`}
      style={{ '--xray-accent': PANEL_ACCENT_VALUES[settings.accent], '--xray-font': PANEL_FONT_VALUES[settings.font] } as React.CSSProperties}
    >
      <header className="xray-topbar">
        <div className="xray-brand xray-drag-handle">
          <span className="xray-brand-mark"><IconTerminal2 size={18} stroke={2} /></span>
          <span>CONSOLE</span>
          <span className={`xray-live-dot ${open ? 'on' : ''}`} />
        </div>
        <nav className="xray-tabs" aria-label="XRAY panel tabs">
          {panelTabs.map((tab) => (
            <button key={tab.id} className={`xray-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              {tab.icon}
              <span>{tab.label}</span>
              {tab.id === 'api' && <span className="xray-badge">{apiCount}</span>}
              {tab.id === 'logs' && <span className="xray-badge">{logCount}</span>}
            </button>
          ))}
        </nav>
        <div className="xray-spacer" />
        <div className="xray-summary">{apiCount} APIs - {errorCount} Errors - {formatBytes(totalBytes)}</div>
        <div className="xray-mode-switcher" aria-label="XRAY display mode">
          <button className={`xray-icon-btn ${mode === 'devtools' ? 'active' : ''}`} title="Open in DevTools" aria-label="Open in DevTools" onClick={openDevtoolsHint}>
            <IconDeviceLaptop {...modeIconProps} />
          </button>
          <button className={`xray-icon-btn ${mode === 'hud' ? 'active' : ''}`} title="Float over page" aria-label="Float over page" onClick={toggleHud}>
            <IconPictureInPicture {...modeIconProps} />
          </button>
          <button className={`xray-icon-btn ${mode === 'window' ? 'active' : ''}`} title="Open in separate window" aria-label="Open in separate window" onClick={openWindow}>
            <IconArrowsMaximize {...modeIconProps} />
          </button>
        </div>
        <button className="xray-icon-btn" aria-label="Open export modal" onClick={() => setExportOpen(true)}><IconDownload size={16} stroke={1.8} /></button>
        <button className="xray-icon-btn" aria-label="Open settings" onClick={() => setSettingsOpen(true)}><IconSettings size={16} stroke={1.8} /></button>
      </header>
      <main className="xray-body">{children}</main>
      {toastMessage && (
        <button className="xray-toast" onClick={clearToast} aria-label="Dismiss notification">
          {toastMessage}
        </button>
      )}
    </div>
  );
}
