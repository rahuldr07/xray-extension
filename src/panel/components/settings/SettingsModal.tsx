import React, { useState } from 'react';
import {
  IconAdjustments,
  IconArrowBackUp,
  IconCheck,
  IconClipboard,
  IconColorPicker,
  IconCopy,
  IconDatabase,
  IconDice,
  IconDownload,
  IconFilterOff,
  IconInfoCircle,
  IconKeyboard,
  IconLock,
  IconNetwork,
  IconPalette,
  IconPinnedOff,
  IconRefresh,
  IconSettings,
  IconShare,
  IconSparkles,
  IconTerminal2,
  IconTrash,
  IconWand,
} from '@tabler/icons-react';
import { usePanelStore } from '../../store';
import { PANEL_ACCENT_VALUES } from '../../models/panelSettings';
import { buildCustomThemeVars, clampHex, contrastGrade, contrastRatio, decodeTheme, encodeTheme, exportThemeCss, generateFromAccent, isHex, isTokenOverridden, OVERRIDE_KEYS, parseThemeInput, randomTheme, resolveThemeColors, themePackageToSettings } from '../../models/customTheme';
import type { CustomTokenKey } from '../../models/customTheme';
import { copyText } from '../../utils';
import { XRAY_BUILD, XRAY_VERSION } from '../../version';
import type { AiSettings, CustomTheme, DetailView, PanelAccent, PanelDensity, PanelFont, PanelSettings, PanelTheme } from '../../types';
import { ModalShell } from '../common/ModalShell';

const iconProps = { size: 16, stroke: 1.8 } as const;

// Screen color-pick is Chromium-only; this is a Chrome/Edge extension, so it's
// available in practice, but feature-check anyway so the button hides elsewhere.
interface EyeDropperCtor { new (): { open(): Promise<{ sRGBHex: string }> } }
const SUPPORTS_EYEDROPPER = typeof window !== 'undefined' && 'EyeDropper' in window;

type SettingsSection = 'general' | 'capture' | 'session' | 'appearance' | 'console' | 'ai' | 'decrypt' | 'shortcuts' | 'about';

const navItems: Array<{ id: SettingsSection; label: string; icon: React.ReactNode }> = [
  { id: 'general', label: 'General', icon: <IconAdjustments {...iconProps} /> },
  { id: 'capture', label: 'Capture', icon: <IconNetwork {...iconProps} /> },
  { id: 'session', label: 'Session', icon: <IconDatabase {...iconProps} /> },
  { id: 'appearance', label: 'Appearance', icon: <IconPalette {...iconProps} /> },
  { id: 'console', label: 'Console', icon: <IconTerminal2 {...iconProps} /> },
  { id: 'ai', label: 'AI', icon: <IconSparkles {...iconProps} /> },
  { id: 'decrypt', label: 'Decrypt', icon: <IconLock {...iconProps} /> },
  { id: 'shortcuts', label: 'Shortcuts', icon: <IconKeyboard {...iconProps} /> },
  { id: 'about', label: 'About', icon: <IconInfoCircle {...iconProps} /> },
];

const AI_MODELS: Record<AiSettings['provider'], string[]> = {
  anthropic: ['claude-fable-5', 'claude-opus-4-8', 'claude-sonnet-5', 'claude-haiku-4-5-20251001'],
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1'],
};

// Preview swatches mirror each theme's real background + accent so the picker
// shows what you're choosing, not just a label.
const THEME_PREVIEWS: Array<{ id: PanelTheme; label: string; bg: string; accent: string; text: string; accentPref?: PanelAccent }> = [
  { id: 'operator', label: 'Operator', bg: '#0b0f14', accent: '#37d5ff', text: '#d8e2ef' },
  { id: 'dev-edition', label: 'Dev', bg: '#11131f', accent: '#b18cff', text: '#e1e7ff' },
  { id: 'midnight', label: 'Midnight', bg: '#05070a', accent: '#00e5ff', text: '#d7f7ff' },
  { id: 'light-lab', label: 'Light', bg: '#edf3fb', accent: '#006adc', text: '#172033' },
  { id: 'claude', label: 'Claude', bg: '#f0eee6', accent: '#d97757', text: '#23221f', accentPref: 'coral' },
];

// Full-freedom token editor (tweakcn-style): every color the panel paints is
// individually editable, grouped so the surface is scannable. The four base
// colors are required; everything else auto-derives until you pin it.
const CUSTOM_GROUPS: Array<{ title: string; hint: string; fields: Array<{ key: CustomTokenKey; label: string }> }> = [
  {
    title: 'Base',
    hint: 'Canvas and stacked surfaces',
    fields: [
      { key: 'bg', label: 'Background' },
      { key: 'surface', label: 'Surface' },
      { key: 'surface2', label: 'Elevated' },
      { key: 'surface3', label: 'Overlay' },
    ],
  },
  {
    title: 'Foreground',
    hint: 'Text ramp and separators',
    fields: [
      { key: 'text', label: 'Text' },
      { key: 'subtext', label: 'Muted' },
      { key: 'hint', label: 'Faint' },
      { key: 'border', label: 'Border' },
    ],
  },
  {
    title: 'Accent',
    hint: 'Selections and primary actions',
    fields: [{ key: 'accent', label: 'Accent' }],
  },
  {
    title: 'Status',
    hint: 'Method, status, and severity colors',
    fields: [
      { key: 'green', label: 'Success' },
      { key: 'red', label: 'Error' },
      { key: 'yellow', label: 'Warning' },
      { key: 'blue', label: 'Info' },
      { key: 'mauve', label: 'Accent 2' },
      { key: 'teal', label: 'Teal' },
      { key: 'peach', label: 'Peach' },
    ],
  },
];

const CUSTOM_PRESETS: Array<{ label: string; theme: CustomTheme }> = [
  { label: 'Slate', theme: { bg: '#0f1117', surface: '#171a23', text: '#e7e9f0', accent: '#7c5cff' } },
  { label: 'Graphite', theme: { bg: '#0e0e10', surface: '#19191c', text: '#ededed', accent: '#22d3ee' } },
  { label: 'Rosé', theme: { bg: '#1a1114', surface: '#241519', text: '#f4e9ec', accent: '#fb7185' } },
  { label: 'Emerald', theme: { bg: '#0b1210', surface: '#131c19', text: '#e6f0ec', accent: '#34d399' } },
  { label: 'Nord', theme: { bg: '#2e3440', surface: '#3b4252', text: '#eceff4', accent: '#88c0d0' } },
  { label: 'Solarized', theme: { bg: '#002b36', surface: '#073642', text: '#eee8d5', accent: '#268bd2' } },
  { label: 'Amber', theme: { bg: '#161207', surface: '#211a0c', text: '#f6ecd6', accent: '#f5a623' } },
  { label: 'Sakura', theme: { bg: '#1c141a', surface: '#281b26', text: '#f6e9f1', accent: '#ec4899' } },
  { label: 'Paper', theme: { bg: '#faf9f6', surface: '#ffffff', text: '#1c1b19', accent: '#2563eb' } },
  { label: 'Sky', theme: { bg: '#eef4fb', surface: '#ffffff', text: '#16273b', accent: '#0284c7' } },
  { label: 'Sage', theme: { bg: '#eef2ec', surface: '#fbfdfa', text: '#1e2a20', accent: '#3f8a4f' } },
];

const detailViews: DetailView[] = ['tree', 'raw', 'grid', 'schema', 'diff', 'waterfall', 'viz', 'headers'];
const themes: PanelTheme[] = ['operator', 'dev-edition', 'midnight', 'light-lab', 'claude'];
const fonts: PanelFont[] = ['jetbrains', 'cascadia', 'iosevka', 'system'];
const densities: PanelDensity[] = ['compact', 'comfortable', 'spacious'];

export function SettingsModal(): React.ReactElement | null {
  const open = usePanelStore((state) => state.settingsOpen);
  const setOpen = usePanelStore((state) => state.setSettingsOpen);
  const settings = usePanelStore((state) => state.settings);
  const recording = usePanelStore((state) => state.recording);
  const setRecording = usePanelStore((state) => state.setRecording);
  const updateSettings = usePanelStore((state) => state.updateSettings);
  const resetSettings = usePanelStore((state) => state.resetSettings);
  const aiSettings = usePanelStore((state) => state.aiSettings);
  const setAiSettings = usePanelStore((state) => state.setAiSettings);
  const clearEntries = usePanelStore((state) => state.clearEntries);
  const clearConsole = usePanelStore((state) => state.clearConsole);
  const clearPinned = usePanelStore((state) => state.clearPinned);
  const clearApiFilters = usePanelStore((state) => state.clearApiFilters);
  const setExportOpen = usePanelStore((state) => state.setExportOpen);
  const entries = usePanelStore((state) => state.entries);
  const consoleEvents = usePanelStore((state) => state.consoleEvents);
  const pinnedIds = usePanelStore((state) => state.pinnedIds);
  const requestConfirmation = usePanelStore((state) => state.requestConfirmation);
  const showToast = usePanelStore((state) => state.showToast);
  const settingsSection = usePanelStore((state) => state.settingsSection);
  const [section, setSection] = useState<SettingsSection>('general');

  // When the modal is opened (e.g. via the header palette button which requests
  // 'appearance'), jump to the requested section.
  React.useEffect(() => {
    if (open) setSection(settingsSection as SettingsSection);
  }, [open, settingsSection]);

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
              <ToggleRow label="Stream to console live" desc="Append newly captured events to the console stream as they arrive. Pausing this does not stop capture — that's under Capture." checked={recording} onChange={setRecording} />
              <SelectRow label="Default detail view" desc="View opened when selecting a request." value={settings.defaultDetailView} options={detailViews} onChange={(value) => updateSettings({ defaultDetailView: value as DetailView })} />
              <ToggleRow label="Confirm destructive actions" desc="Ask before clearing data, pins, or settings." checked={settings.confirmDestructiveActions} onChange={(value) => updateSettings({ confirmDestructiveActions: value })} />
            </>
          )}
          {section === 'capture' && (
            <>
              <SettingsSectionTitle label="Capture" />
              <ToggleRow label="Intercept fetch" desc="Capture native fetch() requests from the page." checked={settings.captureFetch} onChange={(value) => updateSettings({ captureFetch: value })} />
              <ToggleRow label="Intercept XHR" desc="Capture XMLHttpRequest calls from the page." checked={settings.captureXhr} onChange={(value) => updateSettings({ captureXhr: value })} />
              <ToggleRow label="Capture WebSocket & SSE" desc="Stream WebSocket and Server-Sent Event frames into the timeline." checked={settings.captureWs} onChange={(value) => updateSettings({ captureWs: value })} />
              <NumberRow label="Max entries" desc="Trim oldest entries after this limit." value={settings.maxEntries} min={50} max={5000} step={50} suffix="entries" onChange={(value) => updateSettings({ maxEntries: value })} />
            </>
          )}
          {section === 'session' && (
            <>
              <SettingsSectionTitle label="Session" />
              <InfoRow label="Captured data" desc={`${entries.length} entries · ${consoleEvents.length} console events · ${pinnedIds.size} pinned.`} />
              <div className="xray-settings-row">
                <span><strong>Export session</strong><small>Open the export modal for JSON, CSV, HAR, and per-request formats.</small></span>
                <button className="xray-btn" onClick={() => { setOpen(false); setExportOpen(true); }}><IconDownload {...iconProps} />Export</button>
              </div>
              <div className="xray-settings-row">
                <span><strong>Clear API filters</strong><small>Reset search, quick filters, method/status/source, sort, and grouping.</small></span>
                <button className="xray-btn" onClick={() => { clearApiFilters(); showToast('API filters cleared.'); }}><IconFilterOff {...iconProps} />Clear filters</button>
              </div>
              <div className="xray-settings-row">
                <span><strong>Clear pinned</strong><small>Remove all pinned request markers.</small></span>
                <button className="xray-btn" onClick={() => confirmDanger('Clear pinned requests?', 'This removes all pinned request markers.', 'Clear pinned', () => { clearPinned(); showToast('Pinned requests cleared.'); })}><IconPinnedOff {...iconProps} />Clear pinned</button>
              </div>
              <div className="xray-settings-row">
                <span><strong>Clear console stream</strong><small>Clear console UI events but keep captured API entries.</small></span>
                <button className="xray-btn" onClick={() => confirmDanger('Clear console stream?', 'This clears console UI events but keeps captured API entries.', 'Clear console', () => { clearConsole(); showToast('Console stream cleared.'); })}><IconTrash {...iconProps} />Clear console</button>
              </div>
            </>
          )}
          {section === 'ai' && (
            <>
              <SettingsSectionTitle label="AI (bring your own key)" />
              <InfoRow label="Local & private" desc="Your key is stored only in this browser's extension storage. XRAY calls the provider directly from the extension background — nothing is sent anywhere else." />
              <SelectRow label="Provider" desc="Which model provider to use for Explain." value={aiSettings.provider} options={['anthropic', 'openai']} onChange={(value) => setAiSettings({ provider: value as AiSettings['provider'], model: AI_MODELS[value as AiSettings['provider']][0] })} />
              <SelectRow label="Model" desc="Model used for request explanations." value={aiSettings.model} options={AI_MODELS[aiSettings.provider]} onChange={(value) => setAiSettings({ model: value })} />
              <div className="xray-settings-row">
                <span><strong>API key</strong><small>Stored locally. Used only for Explain requests.</small></span>
                <input className="xray-input" type="password" value={aiSettings.apiKey} placeholder="sk-..." onChange={(event) => setAiSettings({ apiKey: event.currentTarget.value })} autoComplete="off" />
              </div>
            </>
          )}
          {section === 'appearance' && (
            <>
              <SettingsSectionTitle label="Appearance" />
              <div className="xray-settings-row xray-theme-picker-row">
                <span><strong>Theme</strong><small>Pick a preset, or build your own with full color freedom. Themes only restyle this panel — never the page or the extension.</small></span>
                <div className="xray-theme-grid">
                  {THEME_PREVIEWS.map((preview) => (
                    <button
                      key={preview.id}
                      className={`xray-theme-swatch ${settings.theme === preview.id ? 'active' : ''}`}
                      style={{ background: preview.bg, color: preview.text }}
                      onClick={() => updateSettings(preview.accentPref ? { theme: preview.id, accent: preview.accentPref } : { theme: preview.id })}
                      aria-pressed={settings.theme === preview.id}
                    >
                      <span className="xray-theme-swatch-dot" style={{ background: preview.accent }} />
                      <span className="xray-theme-swatch-label">{preview.label}</span>
                      {settings.theme === preview.id && <IconCheck size={13} stroke={2.6} />}
                    </button>
                  ))}
                  <button
                    className={`xray-theme-swatch ${settings.theme === 'custom' ? 'active' : ''}`}
                    style={{ background: settings.customTheme.bg, color: settings.customTheme.text }}
                    onClick={() => updateSettings({ theme: 'custom' })}
                    aria-pressed={settings.theme === 'custom'}
                  >
                    <span className="xray-theme-swatch-dot" style={{ background: settings.customTheme.accent }} />
                    <span className="xray-theme-swatch-label">Custom</span>
                    {settings.theme === 'custom' && <IconCheck size={13} stroke={2.6} />}
                  </button>
                </div>
              </div>
              {settings.theme === 'custom' && <CustomThemeEditor />}
              <SelectRow label="Font stack" desc="Choose the code-first monospace stack used across tables, JSON, and console." value={settings.font} options={fonts} onChange={(value) => updateSettings({ font: value as PanelFont })} />
              <SelectRow label="Density" desc="Control global spacing, row heights, and panel chrome." value={settings.density} options={densities} onChange={(value) => updateSettings({ density: value as PanelDensity })} />
              <RangeRow label="Corner radius" desc="Roundness of cards, buttons, inputs, and drawers." value={settings.radius} min={0} max={20} step={1} suffix="px" onChange={(value) => updateSettings({ radius: value })} />
              <AccentRow settings={settings} onChange={(accent) => updateSettings({ accent })} />
              <ToggleRow label="Operator glow" desc="Enable subtle cyan/purple terminal glow and active-focus lighting." checked={settings.glow} onChange={(value) => updateSettings({ glow: value })} />
              <ToggleRow label="Hacker mode" desc="CRT scanlines, vignette, a moving scan sweep, and phosphor glow. Close Settings to see it — it styles the panel behind this dialog. Respects reduced-motion." checked={settings.hacker} onChange={(value) => { updateSettings({ hacker: value }); showToast(value ? 'Hacker mode ON — close Settings to see the CRT.' : 'Hacker mode off.'); }} />
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
              <ShortcutRow keys="Ctrl/⌘ + Shift + F" label="Find in traffic (search bodies)" />
              <ShortcutRow keys="Esc" label="Close modal or panel surface" />
            </>
          )}
          {section === 'about' && (
            <>
              <SettingsSectionTitle label="About" />
              <InfoRow label="Version" desc={`XRAY ${XRAY_VERSION} · built ${XRAY_BUILD}`} />
              <InfoRow label="UI stack" desc="React, TypeScript, Zustand, TanStack Virtual, and Tabler icons." />
              <InfoRow label="Theme" desc="Fully token-driven themes (5 presets + a custom Theme Studio) scoped to the panel via inline CSS variables." />
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

function CustomThemeEditor(): React.ReactElement {
  const custom = usePanelStore((state) => state.settings.customTheme);
  const font = usePanelStore((state) => state.settings.font);
  const radius = usePanelStore((state) => state.settings.radius);
  const hacker = usePanelStore((state) => state.settings.hacker);
  const updateSettings = usePanelStore((state) => state.updateSettings);
  const showToast = usePanelStore((state) => state.showToast);
  const [importText, setImportText] = useState('');
  const [importOpen, setImportOpen] = useState(false);

  // Resolve every token to the exact color the panel renders, so each swatch shows
  // the live value whether it's pinned or auto-derived.
  const resolved = resolveThemeColors(custom);
  const overrideCount = OVERRIDE_KEYS.filter((key) => isTokenOverridden(custom, key)).length;

  function setTheme(theme: CustomTheme): void {
    updateSettings({ theme: 'custom', customTheme: theme });
  }
  function setField(key: CustomTokenKey, value: string): void {
    setTheme({ ...custom, [key]: value });
  }
  // Un-pin a token so it goes back to auto-deriving from the base colors. Base
  // colors have no auto value, so they're never removed (their reset is disabled).
  function resetField(key: CustomTokenKey): void {
    const next: CustomTheme = { ...custom };
    delete (next as Partial<CustomTheme>)[key];
    setTheme(next);
  }
  function resetOverrides(): void {
    const next: CustomTheme = { bg: custom.bg, surface: custom.surface, text: custom.text, accent: custom.accent };
    setTheme(next);
    showToast('Reverted every token to auto.');
  }

  function copyCss(): void {
    void copyText(exportThemeCss(custom));
    showToast('Theme CSS copied to clipboard.');
  }
  function copyShareCode(): void {
    void copyText(encodeTheme({ colors: custom, font, radius, hacker }));
    showToast('Share code copied — colors, font, radius & effects included.');
  }
  function importFromText(): void {
    // A full share code carries font/radius/effect too; fall back to colors-only.
    const pkg = decodeTheme(importText);
    if (pkg) {
      updateSettings(themePackageToSettings(pkg));
      setImportText('');
      setImportOpen(false);
      showToast('Theme imported.');
      return;
    }
    const parsed = parseThemeInput(importText);
    if (!parsed) { showToast('Could not read a theme from that text.'); return; }
    setTheme(parsed);
    setImportText('');
    setImportOpen(false);
    showToast('Theme imported.');
  }

  return (
    <div className="xray-custom-theme">
      <ThemePreview theme={custom} />
      <div className="xray-custom-toolbar">
        <button className="xray-chip" onClick={() => setTheme(generateFromAccent(custom.accent, 'dark'))} title="Build a dark theme around the current accent">
          <IconWand {...iconProps} />Dark from accent
        </button>
        <button className="xray-chip" onClick={() => setTheme(generateFromAccent(custom.accent, 'light'))} title="Build a light theme around the current accent">
          <IconWand {...iconProps} />Light from accent
        </button>
        <button className="xray-chip" onClick={() => setTheme(randomTheme(Math.random()))} title="Roll a coherent random theme">
          <IconDice {...iconProps} />Surprise me
        </button>
        <span className="xray-spacer" />
        <button className="xray-chip" onClick={copyShareCode} title="Copy a portable share code (colors + font + radius + effects)"><IconShare {...iconProps} />Share</button>
        <button className="xray-chip" onClick={copyCss} title="Copy this theme as CSS variables"><IconCopy {...iconProps} />CSS</button>
        <button className="xray-chip" onClick={() => setImportOpen((v) => !v)} title="Paste a theme to load"><IconClipboard {...iconProps} />Import</button>
      </div>
      {importOpen && (
        <div className="xray-custom-import">
          <textarea
            className="xray-input xray-custom-import-field"
            placeholder='Paste a share code (xray1:…), JSON { "bg": "#…" }, or an exported --xray-* CSS block'
            value={importText}
            spellCheck={false}
            onChange={(event) => setImportText(event.currentTarget.value)}
          />
          <button className="xray-btn primary" onClick={importFromText}>Load theme</button>
        </div>
      )}
      <ContrastReport theme={custom} />
      <div className="xray-custom-presets">
        <span className="xray-custom-presets-label">Start from</span>
        {CUSTOM_PRESETS.map((preset) => (
          <button key={preset.label} className="xray-chip" onClick={() => setTheme(preset.theme)}>
            <span className="xray-custom-preset-dot" style={{ background: preset.theme.accent }} />
            {preset.label}
          </button>
        ))}
      </div>
      {CUSTOM_GROUPS.map((group) => (
        <div key={group.title} className="xray-custom-group">
          <div className="xray-custom-group-head">
            <span className="xray-custom-group-title">{group.title}</span>
            <span className="xray-custom-group-hint">{group.hint}</span>
          </div>
          <div className="xray-custom-grid">
            {group.fields.map((field) => (
              <TokenField
                key={field.key}
                label={field.label}
                value={resolved[field.key]}
                overridden={isTokenOverridden(custom, field.key)}
                onChange={(value) => setField(field.key, value)}
                onReset={() => resetField(field.key)}
                onCopy={() => { void copyText(resolved[field.key]); showToast(`Copied ${resolved[field.key]}`); }}
              />
            ))}
          </div>
        </div>
      ))}
      <div className="xray-custom-footnote">
        <span>
          {overrideCount > 0
            ? `${overrideCount} token${overrideCount === 1 ? '' : 's'} pinned · the rest auto-derive from your base colors.`
            : 'Every token auto-derives from your four base colors — pin any swatch for full control.'}
        </span>
        {overrideCount > 0 && (
          <button className="xray-chip" onClick={resetOverrides} title="Revert every token to auto-derived">
            <IconArrowBackUp {...iconProps} />Reset all to auto
          </button>
        )}
      </div>
      <p className="xray-custom-note">Themes are applied as inline CSS variables on this panel only — they never touch the page or the extension's capture runtime.</p>
    </div>
  );
}

// A live, composed preview of the panel painted with the exact CSS variables the
// real panel would get (buildCustomThemeVars). The Settings modal renders as a
// sibling of the panel, so without this you can't see a theme while editing it.
function ThemePreview({ theme }: { theme: CustomTheme }): React.ReactElement {
  const vars = buildCustomThemeVars(theme) as React.CSSProperties;
  return (
    <div className="xray-theme-preview" style={vars} aria-label="Live theme preview">
      <div className="xray-tp-bar">
        <span className="xray-tp-dot" />
        <span className="xray-tp-brand">CONSOLE</span>
        <span className="xray-tp-tab active">Network</span>
        <span className="xray-tp-tab">Console</span>
        <span className="xray-tp-grow" />
        <span className="xray-tp-btn">Explain</span>
      </div>
      <div className="xray-tp-rows">
        <div className="xray-tp-row">
          <span className="xray-tp-method get">GET</span>
          <span className="xray-tp-path">/api/users</span>
          <span className="xray-tp-code ok">200</span>
        </div>
        <div className="xray-tp-row selected">
          <span className="xray-tp-method post">POST</span>
          <span className="xray-tp-path">/api/session/login</span>
          <span className="xray-tp-code warn">302</span>
        </div>
        <div className="xray-tp-row">
          <span className="xray-tp-method delete">DELETE</span>
          <span className="xray-tp-path">/api/cart/item</span>
          <span className="xray-tp-code err">500</span>
        </div>
      </div>
      <div className="xray-tp-badges">
        <span className="xray-tp-badge green">success</span>
        <span className="xray-tp-badge yellow">slow</span>
        <span className="xray-tp-badge red">error</span>
        <span className="xray-tp-badge blue">info</span>
        <span className="xray-tp-badge mauve">graphql</span>
      </div>
    </div>
  );
}

function ContrastReport({ theme }: { theme: CustomTheme }): React.ReactElement {
  // Read the fully-resolved tokens (pinned or derived) so the grades reflect what
  // the panel actually renders, and cover the pairs themes most often fail:
  // muted text on bg, and text over the accent (selected rows / primary button).
  const c = resolveThemeColors(theme);
  const rows = [
    { label: 'Text on background', ratio: contrastRatio(c.text, c.bg) },
    { label: 'Muted on background', ratio: contrastRatio(c.subtext, c.bg) },
    { label: 'Text on surface', ratio: contrastRatio(c.text, c.surface) },
    { label: 'Text on elevated', ratio: contrastRatio(c.text, c.surface2) },
    { label: 'Accent on background', ratio: contrastRatio(c.accent, c.bg) },
    { label: 'Text on accent', ratio: contrastRatio(c.text, c.accent) },
  ];
  return (
    <div className="xray-contrast" aria-label="WCAG contrast" aria-live="polite">
      <span className="xray-contrast-title">Contrast</span>
      {rows.map((row) => {
        const grade = contrastGrade(row.ratio);
        const tone = grade === 'Fail' ? 'fail' : grade === 'AA Large' ? 'warn' : 'ok';
        return (
          <div key={row.label} className="xray-contrast-row">
            <span className="xray-contrast-label">{row.label}</span>
            <strong>{row.ratio.toFixed(2)}:1</strong>
            <span className={`xray-contrast-grade ${tone}`}>{grade}</span>
          </div>
        );
      })}
    </div>
  );
}

function RangeRow({ label, desc, value, min, max, step, suffix, onChange }: { label: string; desc: string; value: number; min: number; max: number; step: number; suffix: string; onChange(value: number): void }): React.ReactElement {
  return (
    <label className="xray-settings-row">
      <span><strong>{label}</strong><small>{desc}</small></span>
      <span className="xray-range-control">
        <input type="range" className="xray-range" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.currentTarget.value))} />
        <small className="xray-range-value">{value}{suffix}</small>
      </span>
    </label>
  );
}

function TokenField({ label, value, overridden, onChange, onReset, onCopy }: { label: string; value: string; overridden: boolean; onChange(value: string): void; onReset(): void; onCopy(): void }): React.ReactElement {
  const [text, setText] = useState(value);
  React.useEffect(() => { setText(value); }, [value]);

  function commit(raw: string): void {
    setText(raw);
    const normalized = clampHex(raw, '');
    if (normalized) onChange(normalized);
  }

  async function pickFromScreen(): Promise<void> {
    const Ctor = (window as unknown as { EyeDropper?: EyeDropperCtor }).EyeDropper;
    if (!Ctor) return;
    try {
      const result = await new Ctor().open();
      if (result?.sRGBHex) onChange(result.sRGBHex);
    } catch { /* user pressed Escape — ignore */ }
  }

  return (
    <div className={`xray-token-field ${overridden ? 'pinned' : 'auto'}`}>
      <input
        type="color"
        className="xray-color-input"
        value={clampHex(value, '#000000')}
        onChange={(event) => { setText(event.currentTarget.value); onChange(event.currentTarget.value); }}
        aria-label={`${label} color`}
      />
      <span className="xray-token-meta">
        <span className="xray-token-label">
          {label}
          <span className="xray-token-state">{overridden ? 'pinned' : 'auto'}</span>
        </span>
        <input
          className={`xray-input xray-custom-hex ${isHex(text) ? '' : 'invalid'}`}
          value={text}
          spellCheck={false}
          maxLength={7}
          onChange={(event) => commit(event.currentTarget.value)}
          onBlur={() => setText(value)}
          aria-label={`${label} hex`}
        />
      </span>
      <span className="xray-token-actions">
        {SUPPORTS_EYEDROPPER && (
          <button
            type="button"
            className="xray-token-btn"
            onClick={pickFromScreen}
            title={`Pick ${label} from screen`}
            aria-label={`Pick ${label} color from screen`}
          >
            <IconColorPicker size={14} stroke={1.8} />
          </button>
        )}
        <button
          type="button"
          className="xray-token-btn"
          onClick={onCopy}
          title={`Copy ${label} hex`}
          aria-label={`Copy ${label} hex`}
        >
          <IconCopy size={14} stroke={1.8} />
        </button>
        <button
          type="button"
          className="xray-token-reset"
          onClick={onReset}
          disabled={!overridden}
          title={overridden ? `Revert ${label} to auto` : `${label} is auto-derived`}
          aria-label={`Revert ${label} to auto`}
        >
          <IconArrowBackUp size={14} stroke={1.8} />
        </button>
      </span>
    </div>
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
