import React from 'react';
import { usePanelStore } from './store';
import { PANEL_FONT_VALUES, resolveAccentValue } from './models/panelSettings';
import { buildCustomThemeVars } from './models/customTheme';
import { EntriesWorkspace } from './components/api/EntriesWorkspace';
import { ConsoleWorkspace } from './components/console/ConsoleWorkspace';
import { ExportModal } from './components/export/ExportModal';
import { ConfirmationModal } from './components/common/ConfirmationModal';
import { RootErrorBoundary } from './components/common/RootErrorBoundary';
import { Insights } from './components/insights/Insights';
import { Rules } from './components/rules/Rules';
import { SettingsModal } from './components/settings/SettingsModal';
import { ReplayModal } from './components/replay/ReplayModal';
import { ExplainModal } from './components/ai/ExplainModal';
import { FindingSynthesisModal } from './components/ai/FindingSynthesisModal';
import { CommandPalette } from './components/shell/CommandPalette';
import { GlobalSearch } from './components/search/GlobalSearch';
import { PanelShell } from './components/shell/PanelShell';
import { ToastRegion } from './components/shell/PanelShell';
import type { XrayAppMode } from './types';

export function App({ mode = 'hud' }: { mode?: XrayAppMode }): React.ReactElement {
  const activeTab = usePanelStore((state) => state.activeTab);
  const settings = usePanelStore((state) => state.settings);

  // The theme's color tokens (and accent/font/radius) live on this wrapper, not on
  // .xray-panel — because the modals below render as siblings of the panel. A
  // `display: contents` wrapper carries the tokens down to BOTH the panel and every
  // popup via inheritance, without adding a layout box. Presets get their tokens, accent
  // included, from the `.xray-theme-*` CSS block (which keys off this class); an accent
  // the user picked goes inline over it, and the custom theme supplies everything inline.
  const accent = resolveAccentValue(settings);
  const themeVars = {
    ...(accent ? { '--xray-accent': accent } : {}),
    '--xray-font': PANEL_FONT_VALUES[settings.font],
    '--xray-radius': `${settings.radius}px`,
    ...(settings.theme === 'custom' ? buildCustomThemeVars(settings.customTheme) : {}),
  } as React.CSSProperties;

  // The root boundary sits inside the theme scope, so its fallback keeps the theme's tokens. It
  // covers the shell and every modal: one failing computation never leaves the user without a way out.
  return (
    <div className={`xray-theme-scope xray-theme-${settings.theme} xray-font-${settings.font}`} style={themeVars}>
      <RootErrorBoundary mode={mode}>
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
        <FindingSynthesisModal />
        <CommandPalette />
        <GlobalSearch />
        <ConfirmationModal />
        <ToastRegion />
      </RootErrorBoundary>
    </div>
  );
}
