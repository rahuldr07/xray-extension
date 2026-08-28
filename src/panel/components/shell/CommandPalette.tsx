import React, { useMemo, useRef, useState } from 'react';
import {
  IconArrowRight,
  IconBolt,
  IconChartBar,
  IconDice,
  IconDownload,
  IconEraser,
  IconFilterOff,
  IconPalette,
  IconRepeat,
  IconSearch,
  IconSettings,
  IconSparkles,
  IconTerminal2,
  IconWand,
} from '@tabler/icons-react';
import { usePanelStore } from '../../store';
import { iconProps, panelTabs } from './panelTabs';
import { ModalShell } from '../common/ModalShell';
import { fuzzyMatch, highlightSegments } from '../../models/fuzzy';
import { generateFromAccent, randomTheme } from '../../models/customTheme';
import { entryPath } from '../../models/entries';
import { methodClass, statusClass } from '../../utils';
import type { XrayEntry } from '../../types';

interface PaletteCommand {
  id: string;
  label: string;
  group: string;
  icon: React.ReactNode;
  hint?: string;
  keywords?: string;
  run(): void;
}

interface ScoredCommand {
  command: PaletteCommand;
  ranges: Array<[number, number]>;
  score: number;
}

const GROUP_ORDER = ['Selection', 'Go to', 'Requests', 'Actions', 'Appearance', 'Console'];

export function CommandPalette(): React.ReactElement | null {
  const open = usePanelStore((state) => state.commandOpen);
  const setOpen = usePanelStore((state) => state.setCommandOpen);
  const setActiveTab = usePanelStore((state) => state.setActiveTab);
  const setExportOpen = usePanelStore((state) => state.setExportOpen);
  const setGlobalSearchOpen = usePanelStore((state) => state.setGlobalSearchOpen);
  const openSettings = usePanelStore((state) => state.openSettings);
  const clearConsole = usePanelStore((state) => state.clearConsole);
  const clearApiFilters = usePanelStore((state) => state.clearApiFilters);
  const clearEntries = usePanelStore((state) => state.clearEntries);
  const insertConsoleCommand = usePanelStore((state) => state.insertConsoleCommand);
  const requestConfirmation = usePanelStore((state) => state.requestConfirmation);
  const entries = usePanelStore((state) => state.entries);
  const selectedId = usePanelStore((state) => state.selectedId);
  const selectEntry = usePanelStore((state) => state.selectEntry);
  const replayEntry = usePanelStore((state) => state.replayEntry);
  const openReplayEditor = usePanelStore((state) => state.openReplayEditor);
  const openExplain = usePanelStore((state) => state.openExplain);
  const updateSettings = usePanelStore((state) => state.updateSettings);
  const customTheme = usePanelStore((state) => state.settings.customTheme);
  const hacker = usePanelStore((state) => state.settings.hacker);
  const showToast = usePanelStore((state) => state.showToast);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);

  const selected = selectedId ? entries.find((entry) => entry.id === selectedId) || null : null;

  const commands = useMemo<PaletteCommand[]>(() => {
    const list: PaletteCommand[] = [];

    if (selected) {
      const label = `${selected.method || 'GET'} ${entryPath(selected)}`;
      list.push(
        { id: 'sel-replay', label: `Replay ${label}`, group: 'Selection', icon: <IconRepeat {...iconProps} />, run: () => replayEntry(selected) },
        { id: 'sel-edit', label: `Edit & replay ${label}`, group: 'Selection', icon: <IconRepeat {...iconProps} />, run: () => openReplayEditor(selected) },
        { id: 'sel-explain', label: `Explain ${label}`, group: 'Selection', icon: <IconSparkles {...iconProps} />, run: () => openExplain(selected) },
      );
    }

    panelTabs.map((tab) => list.push({ id: `tab-${tab.id}`, label: `Go to ${tab.label}`, group: 'Go to', icon: tab.icon, run: () => setActiveTab(tab.id) }));

    list.push(
      { id: 'export', label: 'Export session', group: 'Actions', icon: <IconDownload {...iconProps} />, run: () => setExportOpen(true) },
      { id: 'find', label: 'Find in traffic (bodies, headers, URLs)', group: 'Actions', icon: <IconSearch {...iconProps} />, keywords: 'search grep regex response body header ctrl shift f', run: () => setGlobalSearchOpen(true) },
      { id: 'appearance', label: 'Open Theme Studio', group: 'Appearance', icon: <IconPalette {...iconProps} />, keywords: 'theme color radius', run: () => openSettings('appearance') },
      { id: 'settings', label: 'Open Settings', group: 'Actions', icon: <IconSettings {...iconProps} />, run: () => openSettings('general') },
      { id: 'insights', label: 'Open Insights', group: 'Actions', icon: <IconChartBar {...iconProps} />, run: () => setActiveTab('insights') },
      { id: 'clear-filters', label: 'Reset API filters', group: 'Actions', icon: <IconFilterOff {...iconProps} />, run: clearApiFilters },
      { id: 'clear-console', label: 'Clear console stream', group: 'Actions', icon: <IconEraser {...iconProps} />, run: () => requestConfirmation({ title: 'Clear console stream?', message: 'This clears console UI events but keeps captured API requests.', confirmLabel: 'Clear console', tone: 'danger', onConfirm: clearConsole }) },
      { id: 'clear-all', label: 'Clear all captured entries', group: 'Actions', icon: <IconEraser {...iconProps} />, run: () => requestConfirmation({ title: 'Clear all captured entries?', message: 'This removes requests, logs, console events, and pins.', confirmLabel: 'Clear all', tone: 'danger', onConfirm: clearEntries }) },
      { id: 'theme-random', label: 'Randomize theme', group: 'Appearance', icon: <IconDice {...iconProps} />, keywords: 'surprise color', run: () => { updateSettings({ theme: 'custom', customTheme: randomTheme(Math.random()) }); showToast('Rolled a fresh theme.'); } },
      { id: 'theme-dark', label: 'Custom theme: dark from accent', group: 'Appearance', icon: <IconWand {...iconProps} />, run: () => updateSettings({ theme: 'custom', customTheme: generateFromAccent(customTheme.accent, 'dark') }) },
      { id: 'theme-light', label: 'Custom theme: light from accent', group: 'Appearance', icon: <IconWand {...iconProps} />, run: () => updateSettings({ theme: 'custom', customTheme: generateFromAccent(customTheme.accent, 'light') }) },
      { id: 'hacker', label: hacker ? 'Turn off hacker mode' : 'Turn on hacker mode', group: 'Appearance', icon: <IconBolt {...iconProps} />, keywords: 'crt scanline', run: () => { updateSettings({ hacker: !hacker }); showToast(hacker ? 'Hacker mode off.' : 'Hacker mode on - close this to see it.'); } },
      { id: 'cmd-errors', label: 'Prepare $errors()', group: 'Console', icon: <IconTerminal2 {...iconProps} />, run: () => insertConsoleCommand('$errors()') },
      { id: 'cmd-slow', label: 'Prepare $slow(500)', group: 'Console', icon: <IconTerminal2 {...iconProps} />, run: () => insertConsoleCommand('$slow(500)') },
      { id: 'cmd-schema', label: 'Prepare schema(res)', group: 'Console', icon: <IconTerminal2 {...iconProps} />, run: () => insertConsoleCommand('schema(res)') },
      { id: 'cmd-diff', label: 'Prepare diff(prev, res)', group: 'Console', icon: <IconTerminal2 {...iconProps} />, run: () => insertConsoleCommand('diff(prev, res)') },
    );
    return list;
  }, [clearApiFilters, clearConsole, clearEntries, customTheme, hacker, insertConsoleCommand, openExplain, openReplayEditor, openSettings, replayEntry, requestConfirmation, selected, setActiveTab, setExportOpen, setGlobalSearchOpen, showToast, updateSettings]);

  const requestCommands = useMemo<PaletteCommand[]>(() => entries.slice(-300).reverse().map((entry: XrayEntry) => {
    const path = entryPath(entry);
    const method = String(entry.method || entry.logLevel || 'GET').toUpperCase();
    return {
      id: `req-${entry.id}`,
      label: `${method} ${path}`,
      group: 'Requests',
      icon: <span className={`xray-cmd-method ${methodClass(entry.method)}`}>{method.slice(0, 4)}</span>,
      hint: entry.status ? String(entry.status) : undefined,
      keywords: `${entry.url || ''} ${entry.status || ''}`,
      run: () => { selectEntry(entry.id); setActiveTab(entry.type === 'api' ? 'api' : 'logs'); },
    };
  }), [entries, selectEntry, setActiveTab]);

  const filteredCommands = useMemo<ScoredCommand[]>(() => {
    const q = query.trim();
    // Cluster by group (in GROUP_ORDER), best score first within each group, so
    // the display shows one header per group and keyboard nav follows what's seen.
    const byGroup = (a: ScoredCommand, b: ScoredCommand): number => {
      const ga = GROUP_ORDER.indexOf(a.command.group);
      const gb = GROUP_ORDER.indexOf(b.command.group);
      const oa = ga < 0 ? 99 : ga, ob = gb < 0 ? 99 : gb;
      return oa !== ob ? oa - ob : b.score - a.score;
    };
    if (!q) {
      const defaults = commands.filter((command) => command.group !== 'Requests');
      const recent = requestCommands.slice(0, 5);
      return [...defaults, ...recent].map((command) => ({ command, ranges: [], score: 0 })).sort(byGroup);
    }
    const pool = [...commands, ...requestCommands];
    const scored: ScoredCommand[] = [];
    for (const command of pool) {
      const labelMatch = fuzzyMatch(q, command.label);
      if (labelMatch) { scored.push({ command, ranges: labelMatch.ranges, score: labelMatch.score + 25 }); continue; }
      const altMatch = fuzzyMatch(q, `${command.group} ${command.keywords || ''}`);
      if (altMatch) scored.push({ command, ranges: [], score: altMatch.score });
    }
    return scored.sort(byGroup).slice(0, 60);
  }, [commands, query, requestCommands]);

  React.useEffect(() => { setActive(0); }, [query, open]);

  React.useEffect(() => {
    if (!open) { setQuery(''); return; }
  }, [open]);

  React.useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-cmd-index="${active}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  function runCommand(index: number): void {
    const target = filteredCommands[index];
    if (!target) return;
    target.command.run();
    setOpen(false);
  }

  function onKeyDown(event: React.KeyboardEvent): void {
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive((i) => (i + 1) % Math.max(1, filteredCommands.length)); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setActive((i) => (i - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length)); }
    else if (event.key === 'Enter') { event.preventDefault(); runCommand(active); }
    else if (event.key === 'Home') { event.preventDefault(); setActive(0); }
    else if (event.key === 'End') { event.preventDefault(); setActive(filteredCommands.length - 1); }
  }

  if (!open) return null;

  // filteredCommands is already clustered by group, so consecutive grouping here
  // yields exactly one header per group and matches the keyboard-nav index order.
  const grouped: Array<{ group: string; items: Array<{ scored: ScoredCommand; index: number }> }> = [];
  filteredCommands.forEach((scored, index) => {
    const last = grouped[grouped.length - 1];
    if (last && last.group === scored.command.group) last.items.push({ scored, index });
    else grouped.push({ group: scored.command.group, items: [{ scored, index }] });
  });

  return (
    <ModalShell title="Command center" subtitle="Jump anywhere · run actions · find requests" icon={<IconBolt {...iconProps} />} className="xray-command-modal" onClose={() => setOpen(false)}>
      <label className="xray-search xray-command-search">
        <IconSearch {...iconProps} />
        <input
          className="xray-input"
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          onKeyDown={onKeyDown}
          placeholder="Type a command, tab, or search captured requests…"
        />
      </label>
      <div className="xray-modal-body xray-command-list" ref={listRef}>
        {filteredCommands.length === 0 && (
          <div className="xray-command-empty">
            <IconSearch size={20} stroke={1.6} />
            <span>No matches for “{query}”</span>
            <small>Try a tab name, an action, or part of a request path.</small>
          </div>
        )}
        {grouped.map((section) => (
          <div key={section.group} className="xray-command-group">
            <div className="xray-command-group-label">{section.group}</div>
            {section.items.map(({ scored, index }) => (
              <button
                key={scored.command.id}
                data-cmd-index={index}
                className={`xray-command-row ${index === active ? 'active' : ''}`}
                onMouseMove={() => setActive(index)}
                onClick={() => runCommand(index)}
              >
                <span className="xray-command-icon">{scored.command.icon}</span>
                <span className="xray-command-label">
                  {highlightSegments(scored.command.label, scored.ranges).map((segment, i) => (
                    segment.match ? <mark key={i}>{segment.text}</mark> : <span key={i}>{segment.text}</span>
                  ))}
                </span>
                {scored.command.hint && <span className={`xray-command-hint ${statusClass(Number(scored.command.hint))}`}>{scored.command.hint}</span>}
                {index === active && <IconArrowRight size={14} stroke={2} className="xray-command-enter" />}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="xray-command-foot">
        <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
        <span><kbd>↵</kbd> run</span>
        <span><kbd>esc</kbd> close</span>
        <span className="xray-spacer" />
        <span>{filteredCommands.length} result{filteredCommands.length === 1 ? '' : 's'}</span>
      </div>
    </ModalShell>
  );
}
