import React from 'react';
import { usePanelStore } from './store';
import { EntriesWorkspace } from './components/api/EntriesWorkspace';
import { ConsoleWorkspace } from './components/console/ConsoleWorkspace';
import { ExportModal } from './components/export/ExportModal';
import { ConfirmationModal } from './components/common/ConfirmationModal';
import { Insights } from './components/insights/Insights';
import { Notebook } from './components/notebook/Notebook';
import { Settings } from './components/settings/Settings';
import { SettingsModal } from './components/settings/SettingsModal';
import { CommandPalette } from './components/shell/CommandPalette';
import { PanelShell } from './components/shell/PanelShell';
import type { XrayAppMode } from './types';

export function App({ mode = 'hud' }: { mode?: XrayAppMode }): React.ReactElement {
  const activeTab = usePanelStore((state) => state.activeTab);

  return (
    <>
      <PanelShell mode={mode}>
        {activeTab === 'console' && <ConsoleWorkspace />}
        {activeTab === 'api' && <EntriesWorkspace mode="api" />}
        {activeTab === 'logs' && <EntriesWorkspace mode="logs" />}
        {activeTab === 'notebook' && <Notebook />}
        {activeTab === 'insights' && <Insights />}
        {activeTab === 'settings' && <Settings />}
      </PanelShell>
      <ExportModal />
      <SettingsModal />
      <CommandPalette />
      <ConfirmationModal />
    </>
  );
}
