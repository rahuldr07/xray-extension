import React from 'react';
import { usePanelStore } from './store';
import { PANEL_FONT_VALUES, resolveAccentValue } from './models/panelSettings';
import { buildCustomThemeVars } from './models/customTheme';
import { EntriesWorkspace } from './components/api/EntriesWorkspace';
import { ConsoleWorkspace } from './components/console/ConsoleWorkspace';
import { ExportModal } from './components/export/ExportModal';
import { ConfirmationModal } from './components/common/ConfirmationModal';
import { Insights } from './components/insights/Insights';
import { Rules } from './components/rules/Rules';
import { SettingsModal } from './components/settings/SettingsModal';
import { ReplayModal } from './components/replay/ReplayModal';
import { ExplainModal } from './components/ai/ExplainModal';
import { CommandPalette } from './components/shell/CommandPalette';
import { GlobalSearch } from './components/search/GlobalSearch';
import { PanelShell } from './components/shell/PanelShell';
import type { XrayAppMode } from './types';

export function App({ mode = 'hud' }: { mode?: XrayAppMode }): React.ReactElement {
  const activeTab = usePanelStore((state) => state.activeTab);
  const settings = usePanelStore((state) => state.settings);

  // The theme's color tokens (and accent/font/radius) live on this wrapper, not on
  // .xray-panel — because the modals below render as siblings of the panel. A
  // `display: contents` wrapper carries the tokens down to BOTH the panel and every
  // popup via inheritance, without adding a layout box. Presets get their tokens
  // from the `.xray-theme-*` CSS block (which now keys off this class); the custom
  // theme supplies them inline.
  const themeVars = {
    '--xray-accent': resolveAccentValue(settings),
    '--xray-font': PANEL_FONT_VALUES[settings.font],
    '--xray-radius': `${settings.radius}px`,
    ...(settings.theme === 'custom' ? buildCustomThemeVars(settings.customTheme) : {}),
  } as React.CSSProperties;

  return (
    <div className={`xray-theme-scope xray-theme-${settings.theme} xray-font-${settings.font}`} style={themeVars}>
      <PanelShell mode={mode}>
        {activeTab === 'console' && <ConsoleWorkspace />}
        {activeTab === 'api' && <EntriesWorkspace mode="api" />}
        {activeTab === 'logs' && <EntriesWorkspace mode="logs" />}
        {activeTab === 'rules' && <Rules />}
        {activeTab === 'insights' && <Insights />}
      </PanelShell>
      <ExportModal />
      <SettingsModal />
      <ReplayModal />
      <ExplainModal />
      <CommandPalette />
      <GlobalSearch />
      <ConfirmationModal />
    </div>
  );
}
