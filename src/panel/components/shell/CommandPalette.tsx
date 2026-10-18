import React, { useMemo, useRef, useState } from 'react';
import {
  IconArrowRight,
  IconArrowsMaximize,
  IconBolt,
  IconChartBar,
  IconDeviceLaptop,
  IconDice,
  IconDownload,
  IconEraser,
  IconFilterOff,
  IconFileDiff,
  IconPalette,
  IconPictureInPicture,
  IconRepeat,
  IconSearch,
  IconSettings,
  IconSparkles,
  IconTerminal2,
  IconWand,
} from '@tabler/icons-react';
import { usePanelStore } from '../../store';
import { devtoolsHint, openWindowSurface, toggleHudSurface } from '../../runtime/surfaces';
import { iconProps, panelTabs } from './panelTabs';
import { ModalShell } from '../common/ModalShell';
import { CompareModal } from '../compare/CompareModal';
import { fuzzyMatch, highlightSegments } from '../../models/fuzzy';
import { rankCommands } from '../../models/commandRanking';
import { generateFromAccent, randomTheme } from '../../models/customTheme';
import { entryPath } from '../../models/entries';
import { isReplayableEntry } from '../../models/replayability';
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
  group: string;
  order: number;
  ranges: Array<[number, number]>;
  score: number;
}

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
  const saveInvestigation = usePanelStore((state) => state.saveInvestigation);
  const setComparisonEntry = usePanelStore((state) => state.setComparisonEntry);
  const openComparison = usePanelStore((state) => state.openComparison);
  const swapComparison = usePanelStore((state) => state.swapComparison);
  const clearComparison = usePanelStore((state) => state.clearComparison);
  const hasComparison = usePanelStore((state) => Boolean(state.compareLeftId || state.compareRightId));
  const updateSettings = usePanelStore((state) => state.updateSettings);
  const customTheme = usePanelStore((state) => state.settings.customTheme);
  const hacker = usePanelStore((state) => state.settings.hacker);
  const slowThresholdMs = usePanelStore((state) => state.settings.slowThresholdMs);
  const showToast = usePanelStore((state) => state.showToast);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);

  const selected = selectedId ? entries.find((entry) => entry.id === selectedId) || null : null;
  const selectedLabel = selected ? `${selected.method || 'GET'} ${entryPath(selected)}` : '';

  const commands = useMemo<PaletteCommand[]>(() => {
    const list: PaletteCommand[] = [];

    if (selected) {
      if (isReplayableEntry(selected)) list.push(
        { id: 'sel-replay', label: 'Replay', group: 'Selection', icon: <IconRepeat {...iconProps} />, run: () => replayEntry(selected) },
        { id: 'sel-edit', label: 'Edit & replay', group: 'Selection', icon: <IconRepeat {...iconProps} />, run: () => openReplayEditor(selected) },
      );
      list.push({ id: 'sel-explain', label: 'Explain', group: 'Selection', icon: <IconSparkles {...iconProps} />, run: () => openExplain(selected) });
      if (selected.type === 'api') list.push(
        { id: 'sel-investigation', label: 'Save investigation', group: 'Selection', icon: <IconFileDiff {...iconProps} />, run: () => { if (saveInvestigation()) setActiveTab('rules'); } },
        { id: 'sel-compare-left', label: 'Compare left', group: 'Selection', icon: <IconFileDiff {...iconProps} />, keywords: 'set as comparison left', run: () => setComparisonEntry('left', selected.id) },
        { id: 'sel-compare-right', label: 'Compare right', group: 'Selection', icon: <IconFileDiff {...iconProps} />, keywords: 'set as comparison right', run: () => setComparisonEntry('right', selected.id) },
      );
    }
    if (hasComparison) list.push(
      { id: 'compare-swap', label: 'Swap comparison sides', group: 'Actions', icon: <IconFileDiff {...iconProps} />, run: swapComparison },
      { id: 'compare-clear', label: 'Clear comparison', group: 'Actions', icon: <IconEraser {...iconProps} />, run: clearComparison },
    );

    panelTabs.map((tab) => list.push({ id: `tab-${tab.id}`, label: `Go to ${tab.label}`, group: 'Go to', icon: tab.icon, run: () => setActiveTab(tab.id) }));

    list.push(
      { id: 'compare-open', label: 'Open comparison', group: 'Actions', icon: <IconFileDiff {...iconProps} />, keywords: 'compare two requests left right diff evidence', run: openComparison },
      { id: 'investigations-open', label: 'Open saved investigations', group: 'Actions', icon: <IconFileDiff {...iconProps} />, keywords: 'scenario assertion reproduction recipes saved', run: () => { usePanelStore.getState().setRulesSubTab('investigations'); setActiveTab('rules'); } },
      { id: 'export', label: 'Export session', group: 'Actions', icon: <IconDownload {...iconProps} />, run: () => setExportOpen(true) },
      { id: 'find', label: 'Find in traffic (bodies, headers, URLs)', group: 'Actions', icon: <IconSearch {...iconProps} />, keywords: 'search grep regex response body header ctrl shift f', run: () => setGlobalSearchOpen(true) },
      { id: 'appearance', label: 'Open Theme Studio', group: 'Appearance', icon: <IconPalette {...iconProps} />, keywords: 'theme color radius', run: () => openSettings('appearance') },
      { id: 'settings', label: 'Open Settings', group: 'Actions', icon: <IconSettings {...iconProps} />, run: () => openSettings('general') },
      { id: 'insights', label: 'Open Insights', group: 'Actions', icon: <IconChartBar {...iconProps} />, run: () => setActiveTab('insights') },
      // The header's mode switcher is the only other way to reach these, and it does
      // not fit on a narrow panel — without these entries the pop-out and the HUD had
      // no entry point at all below ~560px.
      { id: 'surface-window', label: 'Open in separate window', group: 'Actions', icon: <IconArrowsMaximize {...iconProps} />, keywords: 'popout pop-out detach surface', run: () => openWindowSurface({ showToast }) },
      { id: 'surface-hud', label: 'Float over page (HUD)', group: 'Actions', icon: <IconPictureInPicture {...iconProps} />, keywords: 'hud overlay float surface', run: () => toggleHudSurface({ showToast }) },
      { id: 'surface-devtools', label: 'Open in DevTools', group: 'Actions', icon: <IconDeviceLaptop {...iconProps} />, keywords: 'devtools f12 surface', run: () => devtoolsHint({ showToast }) },
      { id: 'clear-filters', label: 'Reset API filters', group: 'Actions', icon: <IconFilterOff {...iconProps} />, run: clearApiFilters },
      { id: 'clear-console', label: 'Clear console output', group: 'Actions', icon: <IconEraser {...iconProps} />, run: () => requestConfirmation({ title: 'Clear console output?', message: 'This clears the console output and saved variables ($_, temp1…). Captured API entries remain available.', confirmLabel: 'Clear console', tone: 'danger', onConfirm: clearConsole }) },
      { id: 'clear-all', label: 'Clear all captured entries', group: 'Actions', icon: <IconEraser {...iconProps} />, run: () => requestConfirmation({ title: 'Clear all captured entries?', message: 'This removes requests, logs, console events, and pins.', confirmLabel: 'Clear all', tone: 'danger', onConfirm: clearEntries }) },
      { id: 'theme-random', label: 'Randomize theme', group: 'Appearance', icon: <IconDice {...iconProps} />, keywords: 'surprise color', run: () => { updateSettings({ theme: 'custom', customTheme: randomTheme(Math.random()) }); showToast('Rolled a fresh theme.'); } },
      { id: 'theme-dark', label: 'Custom theme: dark from accent', group: 'Appearance', icon: <IconWand {...iconProps} />, run: () => updateSettings({ theme: 'custom', customTheme: generateFromAccent(customTheme.accent, 'dark') }) },
      { id: 'theme-light', label: 'Custom theme: light from accent', group: 'Appearance', icon: <IconWand {...iconProps} />, run: () => updateSettings({ theme: 'custom', customTheme: generateFromAccent(customTheme.accent, 'light') }) },
      { id: 'hacker', label: hacker ? 'Turn off hacker mode' : 'Turn on hacker mode', group: 'Appearance', icon: <IconBolt {...iconProps} />, keywords: 'crt scanline', run: () => { updateSettings({ hacker: !hacker }); showToast(hacker ? 'Hacker mode off.' : 'Hacker mode on - close this to see it.'); } },
      { id: 'cmd-errors', label: 'Prepare $errors()', group: 'Console', icon: <IconTerminal2 {...iconProps} />, run: () => insertConsoleCommand('$errors()') },
      { id: 'cmd-slow', label: `Prepare $slow(${slowThresholdMs})`, group: 'Console', icon: <IconTerminal2 {...iconProps} />, run: () => insertConsoleCommand(`$slow(${slowThresholdMs})`) },
      { id: 'cmd-schema', label: 'Prepare schema(res)', group: 'Console', icon: <IconTerminal2 {...iconProps} />, run: () => insertConsoleCommand('schema(res)') },
      { id: 'cmd-diff', label: 'Prepare diff(prev, res)', group: 'Console', icon: <IconTerminal2 {...iconProps} />, run: () => insertConsoleCommand('diff(prev, res)') },
    );
    return list;
  }, [clearApiFilters, clearComparison, clearConsole, clearEntries, customTheme, hacker, hasComparison, insertConsoleCommand, openComparison, openExplain, openReplayEditor, openSettings, replayEntry, requestConfirmation, saveInvestigation, selected, setActiveTab, setComparisonEntry, setExportOpen, setGlobalSearchOpen, showToast, slowThresholdMs, swapComparison, updateSettings]);

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
    if (!q) {
      const defaults = commands.filter((command) => command.group !== 'Requests');
      const recent = requestCommands.slice(0, 5);
      return rankCommands([...defaults, ...recent].map((command, order) => ({ command, group: command.group, order, ranges: [], score: 0 })), false);
    }
    const pool = [...commands, ...requestCommands];
    const scored: ScoredCommand[] = [];
    for (const [order, command] of pool.entries()) {
      const labelMatch = fuzzyMatch(q, command.label);
      if (labelMatch) { scored.push({ command, group: command.group, order, ranges: labelMatch.ranges, score: labelMatch.score + 25 }); continue; }
      const altMatch = fuzzyMatch(q, `${command.group} ${command.keywords || ''}`);
      if (altMatch) scored.push({ command, group: command.group, order, ranges: [], score: altMatch.score });
    }
    return rankCommands(scored, true).slice(0, 60);
  }, [commands, query, requestCommands]);

  const activeIndex = Math.max(0, Math.min(active, filteredCommands.length - 1));
  const activeCommand = filteredCommands[activeIndex]?.command;

  if (active !== activeIndex) setActive(activeIndex);

  React.useEffect(() => { setActive(0); }, [query, open]);

  React.useEffect(() => {
    if (!open) { setQuery(''); return; }
  }, [open]);

  React.useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-cmd-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, filteredCommands]);

  function runCommand(index: number): void {
    const target = filteredCommands[index];
    if (!target) return;
    target.command.run();
    setOpen(false);
  }

  function onKeyDown(event: React.KeyboardEvent): void {
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive((activeIndex + 1) % Math.max(1, filteredCommands.length)); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setActive((activeIndex - 1 + Math.max(1, filteredCommands.length)) % Math.max(1, filteredCommands.length)); }
    else if (event.key === 'Enter') { event.preventDefault(); runCommand(activeIndex); }
    else if (event.key === 'Home') { event.preventDefault(); setActive(0); }
    else if (event.key === 'End') { event.preventDefault(); setActive(Math.max(0, filteredCommands.length - 1)); }
  }

  // This launcher is mounted across every workspace. Keep comparison alongside
  // it rather than inside request detail so changing list views never unmounts it.
  if (!open) return <CompareModal />;

  const searching = query.trim().length > 0;
  const grouped: Array<{ group: string; items: Array<{ scored: ScoredCommand; index: number }> }> = [];
  filteredCommands.forEach((scored, index) => {
    const last = grouped[grouped.length - 1];
    if (last && last.group === scored.command.group) last.items.push({ scored, index });
    else grouped.push({ group: scored.command.group, items: [{ scored, index }] });
  });

  function commandRow(scored: ScoredCommand, index: number): React.ReactElement {
    return (
      <button
        key={scored.command.id}
        data-cmd-index={index}
        title={scored.command.label}
          className={`xray-command-row ${index === activeIndex ? 'active' : ''}`}
          id={`xray-command-result-${scored.command.id}`}
          role="option"
          aria-selected={index === activeIndex}
        onMouseMove={() => setActive(index)}
        onClick={() => runCommand(index)}
      >
        <span className="xray-command-icon">{scored.command.icon}</span>
        <span className="xray-command-label">
          {highlightSegments(scored.command.label, scored.ranges).map((segment, i) => (
            segment.match ? <mark key={i}>{segment.text}</mark> : <span key={i}>{segment.text}</span>
          ))}
        </span>
        {searching && <small className="xray-command-hint">{scored.command.group === 'Selection' && selectedLabel ? selectedLabel : scored.command.group}</small>}
        {scored.command.hint && <span className={`xray-command-hint ${statusClass(Number(scored.command.hint))}`}>{scored.command.hint}</span>}
        {index === activeIndex && <IconArrowRight size={14} stroke={2} className="xray-command-enter" />}
      </button>
    );
  }

  return (
    <><CompareModal />
    <ModalShell title="Command center" subtitle="Jump anywhere · run actions · find requests" icon={<IconBolt {...iconProps} />} className="xray-command-modal" onClose={() => setOpen(false)}>
      <label className="xray-search xray-command-search">
        <IconSearch {...iconProps} />
        <input
          className="xray-input"
          aria-label="Search commands and requests"
          aria-controls="xray-command-results"
          aria-activedescendant={activeCommand ? `xray-command-result-${activeCommand.id}` : undefined}
          autoFocus
          value={query}
          onChange={(event) => { setQuery(event.currentTarget.value); setActive(0); }}
          onKeyDown={onKeyDown}
          placeholder="Type a command, tab, or search captured requests…"
        />
      </label>
      <div className="xray-modal-body xray-command-list" id="xray-command-results" role="listbox" aria-label="Command results" ref={listRef}>
        {filteredCommands.length === 0 && (
          <div className="xray-command-empty">
            <IconSearch size={20} stroke={1.6} />
            <span>No matches for “{query}”</span>
            <small>Try a tab name, an action, or part of a request path.</small>
          </div>
        )}
        {searching ? filteredCommands.map(commandRow) : grouped.map((section) => (
          <div key={section.group} className="xray-command-group">
            {section.group === 'Selection' && selectedLabel
              ? <div className="xray-command-group-label request" title={selectedLabel}>{selectedLabel}</div>
              : <div className="xray-command-group-label">{section.group}</div>}
            {section.items.map(({ scored, index }) => commandRow(scored, index))}
          </div>
        ))}
      </div>
      <div className="xray-command-foot">
        <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
        <span><kbd>↵</kbd> run</span>
        <span><kbd>esc</kbd> close</span>
        <span className="xray-spacer" />
        <span role="status" aria-live="polite" aria-atomic="true">{filteredCommands.length} result{filteredCommands.length === 1 ? '' : 's'}</span>
        <span className="xray-visually-hidden" role="status" aria-live="polite" aria-atomic="true">
          {activeCommand ? `Active result ${activeIndex + 1} of ${filteredCommands.length}: ${activeCommand.label}${activeCommand.group === 'Selection' ? ` ${selectedLabel}` : ''}` : 'No active command result'}
        </span>
      </div>
    </ModalShell>
    </>
  );
}
