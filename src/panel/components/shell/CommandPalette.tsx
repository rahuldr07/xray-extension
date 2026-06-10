import React, { useMemo, useState } from 'react';
import { IconBolt, IconSearch, IconTerminal2 } from '@tabler/icons-react';
import { usePanelStore } from '../../store';
import { iconProps, panelTabs } from './panelTabs';
import { ModalShell } from '../common/ModalShell';

interface PaletteCommand {
  id: string;
  label: string;
  hint: string;
  run(): void;
}

export function CommandPalette(): React.ReactElement | null {
  const open = usePanelStore((state) => state.commandOpen);
  const setOpen = usePanelStore((state) => state.setCommandOpen);
  const setActiveTab = usePanelStore((state) => state.setActiveTab);
  const setExportOpen = usePanelStore((state) => state.setExportOpen);
  const setSettingsOpen = usePanelStore((state) => state.setSettingsOpen);
  const clearConsole = usePanelStore((state) => state.clearConsole);
  const clearApiFilters = usePanelStore((state) => state.clearApiFilters);
  const insertConsoleCommand = usePanelStore((state) => state.insertConsoleCommand);
  const requestConfirmation = usePanelStore((state) => state.requestConfirmation);
  const [query, setQuery] = useState('');

  const commands = useMemo<PaletteCommand[]>(() => [
    ...panelTabs.map((tab) => ({
      id: `tab-${tab.id}`,
      label: `Open ${tab.label}`,
      hint: 'Navigation',
      run: () => setActiveTab(tab.id),
    })),
    { id: 'export', label: 'Open export modal', hint: 'Session', run: () => setExportOpen(true) },
    { id: 'settings-modal', label: 'Open quick settings', hint: 'Settings', run: () => setSettingsOpen(true) },
    { id: 'clear-console', label: 'Clear console stream', hint: 'Console', run: () => requestConfirmation({
      title: 'Clear console stream?',
      message: 'This clears console UI events but keeps captured API requests.',
      confirmLabel: 'Clear console',
      tone: 'danger',
      onConfirm: clearConsole,
    }) },
    { id: 'clear-filters', label: 'Reset API filters', hint: 'API', run: clearApiFilters },
    { id: 'cmd-errors', label: 'Prepare $errors()', hint: 'Console command', run: () => insertConsoleCommand('$errors()') },
    { id: 'cmd-slow', label: 'Prepare $slow(500)', hint: 'Console command', run: () => insertConsoleCommand('$slow(500)') },
    { id: 'cmd-schema', label: 'Prepare schema(res)', hint: 'Console command', run: () => insertConsoleCommand('schema(res)') },
  ], [clearApiFilters, clearConsole, insertConsoleCommand, requestConfirmation, setActiveTab, setExportOpen, setSettingsOpen]);

  const filteredCommands = commands.filter((command) => `${command.label} ${command.hint}`.toLowerCase().includes(query.toLowerCase()));

  if (!open) return null;
  return (
    <ModalShell title="Commands" subtitle="Navigate, export, and prepare console commands" icon={<IconBolt {...iconProps} />} className="xray-command-modal" onClose={() => setOpen(false)}>
        <label className="xray-search xray-command-search">
          <IconSearch {...iconProps} />
          <input className="xray-input" autoFocus value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Search tabs, actions, commands..." />
        </label>
        <div className="xray-modal-body xray-command-list">
          {filteredCommands.map((command) => (
          <button key={command.id} className="xray-command-row" onClick={() => { command.run(); setOpen(false); }}>
            <IconTerminal2 {...iconProps} />
            <span>{command.label}</span>
            <small>{command.hint}</small>
          </button>
          ))}
        </div>
    </ModalShell>
  );
}
