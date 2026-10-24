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
  IconInfoCircle,
  IconKeyboard,
  IconNetwork,
  IconPalette,
  IconPinnedOff,
  IconRefresh,
  IconSettings,
  IconShare,
  IconSparkles,
  IconTrash,
  IconWand,
} from '@tabler/icons-react';
import { usePanelStore } from '../../store';
import { accentSwatchValue, PANEL_ACCENT_VALUES, THEME_PRESETS } from '../../models/panelSettings';
import { ACCENT_NAMES, AI_PROVIDER_OPTIONS, DENSITY_OPTIONS, FONT_OPTIONS } from '../../models/settingsLabels';
import type { LabelledOption } from '../../models/settingsLabels';
import { buildCustomThemeVars, THEME_STUDIO_PRESETS, clampHex, contrastGrade, contrastRatio, decodeTheme, encodeTheme, exportThemeCss, generateFromAccent, isHex, isTokenOverridden, OVERRIDE_KEYS, parseThemeInput, randomTheme, resolveThemeColors, themePackageToSettings } from '../../models/customTheme';
import type { CustomTokenKey } from '../../models/customTheme';
import { copyText } from '../../utils';
import { XRAY_BUILD, XRAY_VERSION } from '../../version';
import type { AiSettings, CustomTheme, PanelAccent, PanelDensity, PanelFont, PanelSettings } from '../../types';
import { ModalShell } from '../common/ModalShell';
import { useSqlHudOptions, writeSqlHudOptions, type SqlHudOptions } from '../../runtime/sqlHudOptions';

const iconProps = { size: 16, stroke: 1.8 } as const;

// Screen color-pick is Chromium-only; this is a Chrome/Edge extension, so it's
// available in practice, but feature-check anyway so the button hides elsewhere.
interface EyeDropperCtor { new (): { open(): Promise<{ sRGBHex: string }> } }
const SUPPORTS_EYEDROPPER = typeof window !== 'undefined' && 'EyeDropper' in window;

type SettingsSection = 'general' | 'capture' | 'session' | 'appearance' | 'ai' | 'shortcuts' | 'about';

const navGroups: Array<{ label: string; items: Array<{ id: SettingsSection; label: string; icon: React.ReactNode }> }> = [
  {
    label: 'Workspace',
    items: [
      { id: 'general', label: 'General', icon: <IconAdjustments {...iconProps} /> },
      { id: 'capture', label: 'Capture', icon: <IconNetwork {...iconProps} /> },
      { id: 'session', label: 'Session & storage', icon: <IconDatabase {...iconProps} /> },
    ],
  },
  {
    label: 'Interface',
    items: [
      { id: 'appearance', label: 'Appearance', icon: <IconPalette {...iconProps} /> },
      { id: 'shortcuts', label: 'Shortcuts', icon: <IconKeyboard {...iconProps} /> },
    ],
  },
  {
    label: 'Runtime',
    items: [
      { id: 'ai', label: 'AI', icon: <IconSparkles {...iconProps} /> },
      { id: 'about', label: 'About', icon: <IconInfoCircle {...iconProps} /> },
    ],
  },
];

function isSettingsSection(value: string): value is SettingsSection {
  return navGroups.some((group) => group.items.some((item) => item.id === value));
}

// The two built-in providers offer a model list. `custom` deliberately does not — the
// whole point is that the model name is whatever the user's endpoint serves, so it is a
// free-text field there.
const AI_MODELS: Record<AiSettings['provider'], string[]> = {
  anthropic: ['claude-opus-5', 'claude-sonnet-5', 'claude-fable-5', 'claude-haiku-4-5-20251001'],
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1'],
  custom: [],
};

// Full-freedom token editor (tweakcn-style): every color the panel paints is
// individually editable, grouped so the surface is scannable. The four base
// colors are required; everything else auto-derives until you pin it. Tokens no
// rule reads (selection, hover, active, pending, neutral) are not offered; stored
// values for them stay readable and are ignored.
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
      { key: 'border-control', label: 'Control border' },
    ],
  },
  {
    title: 'Interaction',
    hint: 'Keyboard focus and state surfaces',
    fields: [
      { key: 'focus', label: 'Focus' },
      { key: 'disabled', label: 'Disabled' },
      { key: 'accent-soft', label: 'Accent soft' },
      { key: 'shadow', label: 'Shadow' },
      { key: 'overlay', label: 'Overlay' },
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

// The Theme Studio starter presets live in the model so the contrast test covers them.
const CUSTOM_PRESETS = THEME_STUDIO_PRESETS;

export function SettingsModal(): React.ReactElement | null {
  const open = usePanelStore((state) => state.settingsOpen);
  const setOpen = usePanelStore((state) => state.setSettingsOpen);
  const settings = usePanelStore((state) => state.settings);
  const captureDelivered = usePanelStore((state) => state.captureDelivered);
  const surface = usePanelStore((state) => state.surface);
  const updateSettings = usePanelStore((state) => state.updateSettings);
  const resetSettings = usePanelStore((state) => state.resetSettings);
  const aiSettings = usePanelStore((state) => state.aiSettings);
  const setAiSettings = usePanelStore((state) => state.setAiSettings);
  const clearEntries = usePanelStore((state) => state.clearEntries);
  const clearConsole = usePanelStore((state) => state.clearConsole);
  const clearPinned = usePanelStore((state) => state.clearPinned);
  const setExportOpen = usePanelStore((state) => state.setExportOpen);
  const entries = usePanelStore((state) => state.entries);
  const session = usePanelStore((state) => state.session);
  const runtimeHealth = usePanelStore((state) => state.runtimeHealth);
  const restartRuntime = usePanelStore((state) => state.restartRuntime);
  const consoleEvents = usePanelStore((state) => state.consoleEvents);
  const pinnedIds = usePanelStore((state) => state.pinnedIds);
  const requestConfirmation = usePanelStore((state) => state.requestConfirmation);
  const showToast = usePanelStore((state) => state.showToast);
  // The HUD SQL options are the service worker's (Ruling M3-R28); the toggles write through it.
  const sqlHud = useSqlHudOptions();
  const setSqlHud = (patch: Partial<SqlHudOptions>): void => {
    writeSqlHudOptions(patch).catch((err: unknown) => showToast(err instanceof Error ? err.message : String(err)));
  };
  const openOptionsPage = (): void => {
    if (typeof chrome !== 'undefined') chrome.runtime?.sendMessage?.({ type: 'XRAY_OPEN_OPTIONS' }, () => void chrome.runtime?.lastError);
  };
  const settingsSection = usePanelStore((state) => state.settingsSection);
  const settingsSectionHint = usePanelStore((state) => state.settingsSectionHint);
  const consumeSettingsSectionHint = usePanelStore((state) => state.consumeSettingsSectionHint);
  const setSettingsSection = usePanelStore((state) => state.setSettingsSection);
  const [section, setSection] = useState<SettingsSection>('general');
  const settingsWasOpen = React.useRef(false);
  const activeNavRef = React.useRef<HTMLButtonElement | null>(null);
  const pendingFocusSection = React.useRef<SettingsSection | null>(null);

  // Explicit deep links are consumed once. The ordinary gear uses the section the
  // user last visited, so an AI error link cannot permanently retarget the gear.
  React.useEffect(() => {
    if (!open) {
      settingsWasOpen.current = false;
      return;
    }
    const explicit = consumeSettingsSectionHint();
    const opening = !settingsWasOpen.current;
    let target: SettingsSection | null = null;
    if (explicit) target = isSettingsSection(explicit) ? explicit : 'general';
    else if (opening) target = isSettingsSection(settingsSection) ? settingsSection : 'general';
    if (target) setSection(target);
    // The shell focuses before this effect picks the section, so a deep link opens on a
    // stale nav item; the effect below moves focus once the target section has rendered.
    if (opening) pendingFocusSection.current = target ?? section;
    settingsWasOpen.current = true;
  }, [consumeSettingsSectionHint, open, settingsSection, settingsSectionHint]);

  React.useEffect(() => {
    if (pendingFocusSection.current !== section) return;
    pendingFocusSection.current = null;
    activeNavRef.current?.focus();
  }, [open, section]);

  if (!open) return null;

  function confirmDanger(title: string, message: string, confirmLabel: string, onConfirm: () => void): void {
    requestConfirmation({ title, message, confirmLabel, tone: 'danger', onConfirm });
  }

  function resetAll(): void {
    confirmDanger('Reset XRAY settings?', 'This restores panel preferences to defaults and keeps your layout. Captured entries beyond the restored Max entries are trimmed; AI settings and credentials are kept.', 'Reset settings', () => {
      resetSettings();
      showToast('Settings reset.');
    });
  }

  function clearAll(): void {
    confirmDanger('Clear all captured entries?', 'This removes requests, logs, console events, pins, and the persisted session receipt.', 'Clear data', () => {
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
      initialFocusRef={activeNavRef}
      onClose={() => setOpen(false)}
      footer={(
        <>
          <span className="xray-modal-version">Changes apply immediately.</span>
          <span className="xray-spacer" />
          <button className="xray-btn primary" onClick={() => setOpen(false)}><IconCheck {...iconProps} />Done</button>
        </>
      )}
    >
      <div className="xray-settings-modal-body">
        <nav className="xray-settings-nav" aria-label="Settings sections">
          {navGroups.map((group) => (
            <div className="xray-settings-nav-group" key={group.label}>
              <div className="xray-settings-nav-group-title">{group.label}</div>
              {group.items.map((item) => (
                <button key={item.id} ref={section === item.id ? activeNavRef : undefined} className={`xray-settings-nav-item ${section === item.id ? 'active' : ''}`} aria-pressed={section === item.id} onClick={() => { setSection(item.id); setSettingsSection(item.id); }}>
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="xray-settings-content">
          {section === 'general' && (
            <>
              <SettingsSectionTitle label="General" />
              <NumberRow label="Slow threshold" desc="Requests at or above this are marked slow in the list, Insights and Findings." value={settings.slowThresholdMs} min={100} max={5000} step={50} suffix="ms" onChange={(value) => updateSettings({ slowThresholdMs: value })} />
              <ToggleRow label="Confirm destructive actions" desc="Ask before clearing captured data, console output, pins, rules, or settings." checked={settings.confirmDestructiveActions} onChange={(value) => updateSettings({ confirmDestructiveActions: value })} />
              {surface === 'hud' ? (
                // The in-page panel runs inside the web page, so it cannot change who reaches the
                // SQL client there (Ruling M3-R28): the options page, DevTools or the pop-out can.
                <div className="xray-settings-row">
                  <span>
                    <strong>SQL client in the page HUD</strong>
                    <small>
                      Change this in{' '}
                      <button type="button" className="xray-link-btn" onClick={openOptionsPage}>
                        XRAY&apos;s settings page
                      </button>
                      .
                    </small>
                  </span>
                </div>
              ) : (
                <>
                  <ToggleRow label="Show SQL client inside the page HUD" desc="Shows the client in a frame inside the page instead of a separate window. The page cannot read the frame, but any site could embed the client." checked={sqlHud.sqlInlineInHud} onChange={(value) => setSqlHud({ sqlInlineInHud: value })} />
                  <ToggleRow
                    label="Allow saved database connections in the page HUD"
                    desc={sqlHud.sqlInlineInHud ? HUD_DATABASES_WARNING : 'Turn on the option above first.'}
                    checked={sqlHud.sqlDatabasesInHud}
                    disabled={!sqlHud.sqlInlineInHud}
                    onChange={(value) => {
                      if (!value) {
                        setSqlHud({ sqlDatabasesInHud: false });
                        return;
                      }
                      requestConfirmation({
                        title: 'Allow saved database connections in the page HUD?',
                        message: HUD_DATABASES_WARNING,
                        confirmLabel: 'Allow',
                        cancelLabel: 'Cancel',
                        always: true,
                        onConfirm: () => setSqlHud({ sqlDatabasesInHud: true }),
                      });
                    }}
                  />
                </>
              )}
            </>
          )}
          {section === 'capture' && (
            <>
              <SettingsSectionTitle label="Capture" />
              <ToggleRow label="Intercept fetch" desc="Capture native fetch() requests from the page." checked={settings.captureFetch} onChange={(value) => updateSettings({ captureFetch: value })} />
              <ToggleRow label="Intercept XHR" desc="Capture XMLHttpRequest calls from the page." checked={settings.captureXhr} onChange={(value) => updateSettings({ captureXhr: value })} />
              <ToggleRow label="Capture WebSocket & SSE" desc="Capture WebSocket and Server-Sent Event connections opened from now on." checked={settings.captureWs} onChange={(value) => updateSettings({ captureWs: value })} />
              <NumberRow label="Max entries" desc="Keep at most this many in memory; oldest go first (pinned and selected are kept). Lowering it deletes entries now. Only the newest 500 are restored after reload." value={settings.maxEntries} min={50} max={5000} step={50} suffix="entries" onChange={(value) => updateSettings({ maxEntries: value })} />
              {surface === 'window' && !captureDelivered && <p className="xray-custom-note">Changes apply to the page the next time XRAY opens there.</p>}
            </>
          )}
          {section === 'session' && (
            <>
               <SettingsSectionTitle label="Session & storage" />
              <InfoRow label="Captured data" desc={`${entries.length} entries · ${consoleEvents.length} console events · ${pinnedIds.size} pinned.`} />
              <details className="xray-settings-diagnostics">
                <summary>Diagnostics</summary>
                <InfoRow label="Session identity" desc={`${session.sessionId} · ${session.entryCount} retained for persistence (up to 500).`} />
                <InfoRow label="Runtime health" desc={`${runtimeHealth.health} · Capture route ${runtimeHealth.captureRouteState} · Worker ${runtimeHealth.workerState}.`} />
                <InfoRow label="Message receipt" desc={`${runtimeHealth.acceptedCount} accepted · ${runtimeHealth.droppedCount} dropped · Last event ${runtimeHealth.lastEventAt ? new Date(runtimeHealth.lastEventAt).toLocaleTimeString() : 'not observed'}${runtimeHealth.lastErrorCode ? ` · Code ${runtimeHealth.lastErrorCode}` : ''}.`} />
                <InfoRow label="Private storage" desc={typeof window.XRAY_Store?.get === 'function' && typeof window.XRAY_Store?.set === 'function'
                  ? runtimeHealth.lastErrorCode === 'storage-write-failed' || runtimeHealth.lastErrorCode === 'storage-read-failed' ? 'Storage degraded — last operation failed. Live traffic remains in memory.' : 'XRAY_Store available. Session snapshots are bounded and coalesced; availability is not a save receipt.'
                  : 'Storage unavailable — session changes remain in memory only.'} />
              </details>
              <div className="xray-settings-row">
                <span><strong>Runtime worker</strong><small>Restart is available only when the runtime supports it. Recovery keeps requests, selection, and pins.</small></span>
                <button className="xray-btn" aria-label="Restart runtime worker"
                  disabled={typeof (window.XRAY_Worker as unknown as { restart?: unknown } | undefined)?.restart !== 'function'}
                  onClick={() => { void restartRuntime(); }}><IconRefresh {...iconProps} />Restart worker</button>
              </div>
              <div className="xray-settings-row">
                <span><strong>Export session</strong><small>Open the export modal for JSON, CSV, HAR, and per-request formats.</small></span>
                <button className="xray-btn" onClick={() => { setOpen(false); setExportOpen(true); }}><IconDownload {...iconProps} />Export</button>
              </div>
              <div className="xray-settings-row">
                <span><strong>Clear pinned</strong><small>Remove all pinned request markers.</small></span>
                <button className="xray-btn" onClick={() => confirmDanger('Clear pinned requests?', 'This removes all pinned request markers.', 'Clear pinned', () => { clearPinned(); showToast('Pinned requests cleared.'); })}><IconPinnedOff {...iconProps} />Clear pinned</button>
              </div>
               <div className="xray-settings-row">
                 <span><strong>Clear console output</strong><small>Clear console output but keep captured API entries.</small></span>
                 <button className="xray-btn" onClick={() => confirmDanger('Clear console output?', 'This clears the console output and saved variables ($_, temp1…). Captured API entries remain available.', 'Clear console', () => { clearConsole(); showToast('Console output cleared.'); })}><IconTrash {...iconProps} />Clear console</button>
               </div>
               <div className="xray-settings-danger">
                 <div className="xray-danger-title">Danger zone</div>
                 <button className="xray-danger-row" onClick={clearAll}><span>Clear all captured data</span><IconTrash {...iconProps} /></button>
                 <button className="xray-danger-row" onClick={resetAll}><span>Reset all settings to defaults</span><IconRefresh {...iconProps} /></button>
                 <p className="xray-custom-note">Reset restores panel preferences and keeps your layout. Captured entries beyond the restored Max entries are trimmed; AI settings and credentials are kept.</p>
               </div>
             </>
          )}
          {section === 'ai' && (
            <>
              <SettingsSectionTitle label="AI (bring your own key)" />
              <InfoRow label="Local & private" desc="Your key is stored only in this browser's extension storage. XRAY calls the provider directly from the extension background - nothing is sent anywhere else." />
              <SelectRow
                label="Provider"
                desc="Anthropic and OpenAI are built in. Custom works with any OpenAI-compatible endpoint - OpenRouter, Groq, Together, DeepSeek, Mistral, Azure, or a local Ollama or LM Studio server."
                value={aiSettings.provider}
                options={AI_PROVIDER_OPTIONS}
                onChange={(value) => {
                  const provider = value as AiSettings['provider'];
                  // Carry the model across only when the new provider actually offers
                  // one; a stale gpt-4o would fail at request time on Anthropic.
                  setAiSettings({ provider, model: AI_MODELS[provider][0] ?? '' });
                }}
              />
              {aiSettings.provider === 'custom' ? (
                <TextRow
                  label="Model"
                  desc="Model name exactly as your endpoint expects it."
                  value={aiSettings.model}
                  placeholder="llama3.1:8b"
                  onChange={(value) => setAiSettings({ model: value })}
                />
              ) : (
                <SelectRow label="Model" desc="Model used for request explanations." value={aiSettings.model} options={AI_MODELS[aiSettings.provider]} onChange={(value) => setAiSettings({ model: value })} />
              )}
              {aiSettings.provider === 'custom' && (
                <>
                  <TextRow
                    label="Endpoint"
                    desc="Base URL or full chat-completions URL. Must be https, except localhost for a local model server."
                    value={aiSettings.baseUrl}
                    placeholder="https://openrouter.ai/api/v1"
                    onChange={(value) => setAiSettings({ baseUrl: value })}
                  />
                  <TextRow
                    label="Auth header"
                    desc="Header carrying the key. Almost every provider uses authorization."
                    value={aiSettings.authHeader}
                    placeholder="authorization"
                    onChange={(value) => setAiSettings({ authHeader: value })}
                  />
                  <TextRow
                    label="Auth prefix"
                    desc="Text before the key. Usually 'Bearer ' - leave blank to send the key on its own."
                    value={aiSettings.authPrefix}
                    placeholder="Bearer "
                    onChange={(value) => setAiSettings({ authPrefix: value })}
                  />
                </>
              )}
              <div className="xray-settings-row">
                <span><strong>API key</strong><small>Stored locally. Used only for Explain requests.</small></span>
                <input className="xray-input" type="password" aria-label="AI provider API key" value={aiSettings.apiKey} placeholder="sk-…" onChange={(event) => setAiSettings({ apiKey: event.currentTarget.value })} autoComplete="off" />
              </div>
            </>
          )}
          {section === 'appearance' && (
            <>
              <SettingsSectionTitle label="Appearance" />
              <div className="xray-settings-row xray-theme-picker-row">
                <span><strong>Theme</strong><small>Pick a preset, or build your own with full color freedom. Themes only restyle this panel - never the page or the extension.</small></span>
                <div className="xray-theme-grid">
                  {/* Swatches paint each preset's own block values (THEME_PRESETS), so the picker shows what you're choosing. */}
                  {THEME_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      className={`xray-theme-swatch ${settings.theme === preset.id ? 'active' : ''}`}
                      style={{ background: preset.preview.bg, color: preset.preview.text }}
                      onClick={() => updateSettings({ theme: preset.id })}
                      aria-pressed={settings.theme === preset.id}
                    >
                      <span className="xray-theme-swatch-dot" style={{ background: preset.preview.accent }} />
                      <span className="xray-theme-swatch-label">{preset.label}</span>
                      {settings.theme === preset.id && <IconCheck size={13} stroke={2.6} />}
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
              <SelectRow label="Font stack" desc="Monospace font for data — URLs, JSON, console. Uses fonts installed on this computer." value={settings.font} options={FONT_OPTIONS} onChange={(value) => updateSettings({ font: value as PanelFont })} />
              <SelectRow label="Density" desc="Control global spacing, row heights, and panel chrome." value={settings.density} options={DENSITY_OPTIONS} onChange={(value) => updateSettings({ density: value as PanelDensity })} />
              <RangeRow label="Corner radius" desc="Roundness of cards, buttons, inputs, and drawers." value={settings.radius} min={0} max={20} step={1} suffix="px" onChange={(value) => updateSettings({ radius: value })} />
              <AccentRow settings={settings} onChange={(accent) => updateSettings({
                accent,
                accentChosen: true,
                ...(settings.theme === 'custom' ? { customTheme: { ...settings.customTheme, accent: PANEL_ACCENT_VALUES[accent] } } : {}),
              })} onUseTheme={() => updateSettings({ accentChosen: false })} />
              <ToggleRow label="Glow" desc="Accent-coloured glow on selected rows and buttons, plus the background grid." checked={settings.glow} onChange={(value) => updateSettings({ glow: value })} />
              <ToggleRow label="Hacker mode" desc="CRT scanlines, vignette, a moving scan sweep, and phosphor glow. Close Settings to see it - it styles the panel behind this dialog. Respects reduced-motion." checked={settings.hacker} onChange={(value) => { updateSettings({ hacker: value }); showToast(value ? 'Hacker mode ON - close Settings to see the CRT.' : 'Hacker mode off.'); }} />
              <ToggleRow label="Compact API rows" desc="Shorter rows in the API list. Same as the list's row-height button." checked={settings.compactRows} onChange={(value) => updateSettings({ compactRows: value })} />
              <ToggleRow label="Show host in path column" desc="Display request host below endpoint paths." checked={settings.showHostInPath} onChange={(value) => updateSettings({ showHostInPath: value })} />
            </>
          )}
          {section === 'shortcuts' && (
            <>
              <SettingsSectionTitle label="Shortcuts" />
              <ShortcutRow keys="Ctrl/⌘ + Shift + X" label="Toggle XRAY" note="Change in chrome://extensions/shortcuts" />
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
              <InfoRow label="Theme" desc={`Fully token-driven themes (${THEME_PRESETS.length} presets + a custom Theme Studio) scoped to the panel via inline CSS variables.`} />
              <div className="xray-settings-row read-only"><span><small>Decryption: responses to requests with an X-Parse-Token header pass through the decrypt hook in shared/decrypt.js, which does nothing until a developer edits it.</small></span></div>
            </>
          )}
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
    updateSettings({ theme: 'custom', customTheme: theme, ...(theme.accent !== custom.accent ? { accentChosen: true } : {}) });
  }
  function setField(key: CustomTokenKey, value: string): void {
    setTheme({ ...custom, [key]: value });
  }
  // Un-pin a token so it goes back to auto-deriving from the base colors. Base
  // colors have no auto value, so they're never removed (their reset is disabled).
  function resetField(key: CustomTokenKey): void {
    const next: CustomTheme = { ...custom };
    delete (next as Partial<Record<CustomTokenKey, string>>)[key];
    setTheme(next);
  }
  function resetOverrides(): void {
    const next: CustomTheme = { bg: custom.bg, surface: custom.surface, text: custom.text, accent: custom.accent };
    setTheme(next);
    showToast('Reverted every token to auto.');
  }

  async function copyTheme(text: string, receipt: string): Promise<void> {
    try {
      await copyText(text);
      showToast(receipt);
    } catch {
      showToast('Could not copy. Copy manually or check browser clipboard permissions.');
    }
  }
  async function copyCss(): Promise<void> {
    await copyTheme(exportThemeCss(custom), 'Theme CSS copied to clipboard.');
  }
  async function copyShareCode(): Promise<void> {
    await copyTheme(encodeTheme({ colors: custom, font, radius, hacker }), 'Share code copied - colors, font, radius & effects included.');
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
                onCopy={() => copyTheme(resolved[field.key], `Copied ${resolved[field.key]}`)}
              />
            ))}
          </div>
        </div>
      ))}
      <div className="xray-custom-footnote">
        <span>
          {overrideCount > 0
            ? `${overrideCount} token${overrideCount === 1 ? '' : 's'} pinned · the rest auto-derive from your base colors.`
            : 'Every token auto-derives from your four base colors - pin any swatch for full control.'}
        </span>
        {overrideCount > 0 && (
          <button className="xray-chip" onClick={resetOverrides} title="Revert every token to auto-derived">
            <IconArrowBackUp {...iconProps} />Reset all to auto
          </button>
        )}
      </div>
      <p className="xray-custom-note">Themes are applied as inline CSS variables on this panel only - they never touch the page or the extension&apos;s capture runtime.</p>
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
    } catch { /* user pressed Escape - ignore */ }
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

// Ruling M3-R27: shown as the hint of the HUD databases option and in its confirmation.
const HUD_DATABASES_WARNING = 'The page you are on cannot read the client, but it could try to trick you into clicking it. Keep connections read-only, or leave this off.';

function ToggleRow({ label, desc, checked, disabled = false, onChange }: { label: string; desc: string; checked: boolean; disabled?: boolean; onChange(value: boolean): void }): React.ReactElement {
  return (
    <div className="xray-settings-row">
      <span><strong>{label}</strong><small>{desc}</small></span>
      <button className={`xray-toggle ${checked ? 'on' : ''}`} aria-label={label} aria-pressed={checked} disabled={disabled} onClick={() => onChange(!checked)} />
    </div>
  );
}

/**
 * A number field that commits on blur or Enter, not on every keystroke.
 *
 * It used to be fully controlled and call onChange for each character typed, which
 * made "Max entries" destructive: clearing the field and typing 2000 committed 2 on
 * the first keypress, normalizePanelSettings clamped that to the floor of 50, and
 * updateSettings immediately trimmed the session to 50 entries — measured, 411
 * captured entries destroyed by one keypress, and persisted. The field then showed
 * "50" so the remaining digits could not be typed either.
 *
 * Committing on blur also means an out-of-range intermediate value never reaches the
 * store, so the same class of bug cannot come back through another caller.
 */
function NumberRow({ label, desc, value, min, max, step, suffix, onChange }: { label: string; desc: string; value: number; min: number; max: number; step: number; suffix: string; onChange(value: number): void }): React.ReactElement {
  const [draft, setDraft] = React.useState(String(value));
  const [editing, setEditing] = React.useState(false);

  // While the user is typing, the draft is the truth. Outside that, follow the store —
  // otherwise a reset or a change made on another surface would not show up here.
  React.useEffect(() => {
    if (!editing) setDraft(String(value));
  }, [value, editing]);

  function commit(): void {
    setEditing(false);
    const parsed = Number(draft);
    if (draft.trim() === '' || !Number.isFinite(parsed)) {
      setDraft(String(value));
      return;
    }
    const clamped = Math.min(max, Math.max(min, Math.round(parsed)));
    setDraft(String(clamped));
    if (clamped !== value) onChange(clamped);
  }

  return (
    <label className="xray-settings-row">
      <span><strong>{label}</strong><small>{desc}</small></span>
      <span className="xray-number-input">
        <input
          type="number"
          value={draft}
          min={min}
          max={max}
          step={step}
          onFocus={() => setEditing(true)}
          onChange={(event) => setDraft(event.currentTarget.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur(); }
            // Escape abandons the edit rather than committing a half-typed number.
            if (event.key === 'Escape') { setDraft(String(value)); setEditing(false); event.currentTarget.blur(); }
          }}
        />
        <small>{suffix}</small>
      </span>
    </label>
  );
}

function SelectRow({ label, desc, value, options, onChange }: { label: string; desc: string; value: string; options: Array<string | LabelledOption>; onChange(value: string): void }): React.ReactElement {
  return (
    <label className="xray-settings-row">
      <span><strong>{label}</strong><small>{desc}</small></span>
      <select className="xray-select" value={value} onChange={(event) => onChange(event.currentTarget.value)}>
        {options.map((option) => {
          const item = typeof option === 'string' ? { value: option, label: option } : option;
          return <option key={item.value} value={item.value}>{item.label}</option>;
        })}
      </select>
    </label>
  );
}

function TextRow({ label, desc, value, placeholder, onChange }: { label: string; desc: string; value: string; placeholder?: string; onChange(value: string): void }): React.ReactElement {
  return (
    <label className="xray-settings-row">
      <span><strong>{label}</strong><small>{desc}</small></span>
      <input
        className="xray-input"
        type="text"
        value={value}
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="off"
        autoCapitalize="off"
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </label>
  );
}

function AccentRow({ settings, onChange, onUseTheme }: { settings: PanelSettings; onChange(accent: PanelAccent): void; onUseTheme(): void }): React.ReactElement {
  // A preset owns its accent until a swatch is picked (spec P2); the custom theme's is its own.
  const preset = THEME_PRESETS.find(({ id }) => id === settings.theme);
  const themeAccent = Boolean(preset) && !settings.accentChosen;
  return (
    <div className="xray-settings-row">
      <span><strong>Accent color</strong><small>Selections, active states, and primary actions.</small></span>
      <div className="xray-color-row">
        {preset && (
          <button
            className={`xray-color-theme ${themeAccent ? 'active' : ''}`}
            aria-label="Use theme accent"
            title={`${preset.label}'s own accent`}
            aria-pressed={themeAccent}
            onClick={onUseTheme}
          >
            <span className="xray-theme-swatch-dot" style={{ background: preset.preview.accent }} />
            Theme
          </button>
        )}
        {(Object.keys(PANEL_ACCENT_VALUES) as PanelAccent[]).map((accent) => {
          const active = !themeAccent && settings.accent === accent;
          return (
            <button
              key={accent}
              className={`xray-color-swatch ${active ? 'active' : ''}`}
              aria-label={`Use ${ACCENT_NAMES[accent]} accent`}
              title={ACCENT_NAMES[accent]}
              aria-pressed={active}
              // Preview the accent this theme will actually apply: the swatch solved for the
              // active preset. Showing the raw pastel while the theme renders a darkened or
              // lightened variant made the swatch a misleading preview of its own effect.
              style={{ background: accentSwatchValue(settings, accent) }}
              onClick={() => onChange(accent)}
            />
          );
        })}
      </div>
    </div>
  );
}

function InfoRow({ label, desc }: { label: string; desc: string }): React.ReactElement {
  return <div className="xray-settings-row read-only"><span><strong>{label}</strong><small>{desc}</small></span></div>;
}

function ShortcutRow({ keys, label, note }: { keys: string; label: string; note?: string }): React.ReactElement {
  return <div className="xray-settings-row"><span><strong>{label}</strong>{note && <small>{note}</small>}</span><kbd>{keys}</kbd></div>;
}
