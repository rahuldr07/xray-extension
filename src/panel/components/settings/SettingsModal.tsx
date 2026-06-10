import React, { useState } from 'react';
import {
  IconAdjustments,
  IconCheck,
  IconInfoCircle,
  IconKeyboard,
  IconLock,
  IconNetwork,
  IconPalette,
  IconRefresh,
  IconSettings,
  IconTerminal2,
  IconTrash,
} from '@tabler/icons-react';
import { usePanelStore } from '../../store';
import { PANEL_ACCENT_VALUES } from '../../models/panelSettings';
import type { DetailView, PanelAccent, PanelSettings } from '../../types';
import { ModalShell } from '../common/ModalShell';

const iconProps = { size: 16, stroke: 1.8 } as const;

type SettingsSection = 'general' | 'capture' | 'appearance' | 'console' | 'decrypt' | 'shortcuts' | 'about';

const navItems: Array<{ id: SettingsSection; label: string; icon: React.ReactNode }> = [
  { id: 'general', label: 'General', icon: <IconAdjustments {...iconProps} /> },
  { id: 'capture', label: 'Capture', icon: <IconNetwork {...iconProps} /> },
  { id: 'appearance', label: 'Appearance', icon: <IconPalette {...iconProps} /> },
  { id: 'console', label: 'Console', icon: <IconTerminal2 {...iconProps} /> },
  { id: 'decrypt', label: 'Decrypt', icon: <IconLock {...iconProps} /> },
  { id: 'shortcuts', label: 'Shortcuts', icon: <IconKeyboard {...iconProps} /> },
  { id: 'about', label: 'About', icon: <IconInfoCircle {...iconProps} /> },
];

const detailViews: DetailView[] = ['tree', 'raw', 'grid', 'schema', 'diff', 'waterfall', 'viz', 'headers'];

export function SettingsModal(): React.ReactElement | null {
  const open = usePanelStore((state) => state.settingsOpen);
  const setOpen = usePanelStore((state) => state.setSettingsOpen);
  const settings = usePanelStore((state) => state.settings);
  const recording = usePanelStore((state) => state.recording);
  const setRecording = usePanelStore((state) => state.setRecording);
  const updateSettings = usePanelStore((state) => state.updateSettings);
  const resetSettings = usePanelStore((state) => state.resetSettings);
  const clearEntries = usePanelStore((state) => state.clearEntries);
  const requestConfirmation = usePanelStore((state) => state.requestConfirmation);
  const showToast = usePanelStore((state) => state.showToast);
  const [section, setSection] = useState<SettingsSection>('general');

  if (!open) return null;

  function confirmDanger(title: string, message: string, confirmLabel: string, onConfirm: () => void): void {
    if (!settings.confirmDestructiveActions) {
      onConfirm();
      return;
    }
    requestConfirmation({ title, message, confirmLabel, tone: 'danger', onConfirm });
  }

  function resetAll(): void {
    confirmDanger('Reset XRAY settings?', 'This restores panel preferences to defaults. Captured requests are not deleted.', 'Reset settings', () => {
      resetSettings();
      showToast('Settings reset.');
    });
  }

  function clearAll(): void {
    confirmDanger('Clear all captured entries?', 'This removes requests, logs, console events, and pins from the React UI session.', 'Clear data', () => {
      clearEntries();
      showToast('Captured data cleared.');
    });
  }

  return (
    <ModalShell
      title="Settings"
      subtitle="Runtime controls and UI preferences"
      icon={<IconSettings {...iconProps} />}
      className="xray-settings-modal"
      onClose={() => setOpen(false)}
      footer={(
        <>
          <span className="xray-modal-version">XRAY React UI - local deterministic runtime</span>
          <span className="xray-spacer" />
          <button className="xray-btn" onClick={() => setOpen(false)}>Cancel</button>
          <button className="xray-btn primary" onClick={() => { setOpen(false); showToast('Settings saved.'); }}><IconCheck {...iconProps} />Save</button>
        </>
      )}
    >
      <div className="xray-settings-modal-body">
        <nav className="xray-settings-nav" aria-label="Settings sections">
          {navItems.map((item) => (
            <button key={item.id} className={`xray-settings-nav-item ${section === item.id ? 'active' : ''}`} onClick={() => setSection(item.id)}>
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="xray-settings-content">
          {section === 'general' && (
            <>
              <SettingsSectionTitle label="General" />
              <ToggleRow label="Auto-record on open" desc="Start rendering new console entries immediately." checked={recording} onChange={setRecording} />
              <SelectRow label="Default detail view" desc="View opened when selecting a request." value={settings.defaultDetailView} options={detailViews} onChange={(value) => updateSettings({ defaultDetailView: value as DetailView })} />
              <ToggleRow label="Confirm destructive actions" desc="Ask before clearing data, pins, or settings." checked={settings.confirmDestructiveActions} onChange={(value) => updateSettings({ confirmDestructiveActions: value })} />
            </>
          )}
          {section === 'capture' && (
            <>
              <SettingsSectionTitle label="Capture" />
              <ToggleRow label="Intercept fetch" desc="Capture native fetch() requests from the page." checked={settings.captureFetch} onChange={(value) => updateSettings({ captureFetch: value })} />
              <ToggleRow label="Intercept XHR" desc="Capture XMLHttpRequest calls from the page." checked={settings.captureXhr} onChange={(value) => updateSettings({ captureXhr: value })} />
              <NumberRow label="Max entries" desc="Trim oldest entries after this limit." value={settings.maxEntries} min={50} max={5000} step={50} suffix="entries" onChange={(value) => updateSettings({ maxEntries: value })} />
            </>
          )}
          {section === 'appearance' && (
            <>
              <SettingsSectionTitle label="Appearance" />
              <AccentRow settings={settings} onChange={(accent) => updateSettings({ accent })} />
              <ToggleRow label="Compact rows" desc="Reduce request row height for dense API sessions." checked={settings.compactRows} onChange={(value) => updateSettings({ compactRows: value })} />
              <ToggleRow label="Show host in path column" desc="Display request host below endpoint paths." checked={settings.showHostInPath} onChange={(value) => updateSettings({ showHostInPath: value })} />
            </>
          )}
          {section === 'console' && (
            <>
              <SettingsSectionTitle label="Console" />
              <NumberRow label="Slow threshold" desc="Highlight requests above this in yellow." value={settings.slowThresholdMs} min={100} max={5000} step={50} suffix="ms" onChange={(value) => updateSettings({ slowThresholdMs: value })} />
              <NumberRow label="Very slow threshold" desc="Reserved red threshold for heavier timing views." value={settings.verySlowThresholdMs} min={200} max={10000} step={100} suffix="ms" onChange={(value) => updateSettings({ verySlowThresholdMs: value })} />
            </>
          )}
          {section === 'decrypt' && (
            <>
              <SettingsSectionTitle label="Decrypt" />
              <InfoRow label="Runtime boundary" desc="Decrypt bridge stays in the vanilla runtime. React only displays decrypted fields when the runtime provides them." />
              <InfoRow label="Network access" desc="No AI provider or remote analysis is used by this settings surface." />
            </>
          )}
          {section === 'shortcuts' && (
            <>
              <SettingsSectionTitle label="Shortcuts" />
              <ShortcutRow keys="Ctrl/⌘ + Shift + X" label="Toggle XRAY" />
              <ShortcutRow keys="Ctrl/⌘ + K" label="Open command palette" />
              <ShortcutRow keys="Esc" label="Close modal or panel surface" />
            </>
          )}
          {section === 'about' && (
            <>
              <SettingsSectionTitle label="About" />
              <InfoRow label="UI stack" desc="React, TypeScript, Zustand, TanStack Virtual, and Tabler icons." />
              <InfoRow label="Theme" desc="Catppuccin Mocha tokens inside Shadow DOM with local font stack only." />
            </>
          )}
          <div className="xray-settings-danger">
            <div className="xray-danger-title">Danger zone</div>
            <button className="xray-danger-row" onClick={clearAll}><span>Clear all captured sessions</span><IconTrash {...iconProps} /></button>
            <button className="xray-danger-row" onClick={resetAll}><span>Reset all settings to defaults</span><IconRefresh {...iconProps} /></button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

function SettingsSectionTitle({ label }: { label: string }): React.ReactElement {
  return <div className="xray-settings-section-title">{label}</div>;
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange(value: boolean): void }): React.ReactElement {
  return (
    <div className="xray-settings-row">
      <span><strong>{label}</strong><small>{desc}</small></span>
      <button className={`xray-toggle ${checked ? 'on' : ''}`} aria-label={label} aria-pressed={checked} onClick={() => onChange(!checked)} />
    </div>
  );
}

function NumberRow({ label, desc, value, min, max, step, suffix, onChange }: { label: string; desc: string; value: number; min: number; max: number; step: number; suffix: string; onChange(value: number): void }): React.ReactElement {
  return (
    <label className="xray-settings-row">
      <span><strong>{label}</strong><small>{desc}</small></span>
      <span className="xray-number-input">
        <input type="number" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.currentTarget.value))} />
        <small>{suffix}</small>
      </span>
    </label>
  );
}

function SelectRow({ label, desc, value, options, onChange }: { label: string; desc: string; value: string; options: string[]; onChange(value: string): void }): React.ReactElement {
  return (
    <label className="xray-settings-row">
      <span><strong>{label}</strong><small>{desc}</small></span>
      <select className="xray-select" value={value} onChange={(event) => onChange(event.currentTarget.value)}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function AccentRow({ settings, onChange }: { settings: PanelSettings; onChange(accent: PanelAccent): void }): React.ReactElement {
  return (
    <div className="xray-settings-row">
      <span><strong>Accent color</strong><small>Selections, active states, and primary actions.</small></span>
      <div className="xray-color-row">
        {(Object.keys(PANEL_ACCENT_VALUES) as PanelAccent[]).map((accent) => (
          <button
            key={accent}
            className={`xray-color-swatch ${settings.accent === accent ? 'active' : ''}`}
            aria-label={`Use ${accent} accent`}
            style={{ background: PANEL_ACCENT_VALUES[accent] }}
            onClick={() => onChange(accent)}
          />
        ))}
      </div>
    </div>
  );
}

function InfoRow({ label, desc }: { label: string; desc: string }): React.ReactElement {
  return <div className="xray-settings-row read-only"><span><strong>{label}</strong><small>{desc}</small></span></div>;
}

function ShortcutRow({ keys, label }: { keys: string; label: string }): React.ReactElement {
  return <div className="xray-settings-row"><span><strong>{label}</strong></span><kbd>{keys}</kbd></div>;
}
