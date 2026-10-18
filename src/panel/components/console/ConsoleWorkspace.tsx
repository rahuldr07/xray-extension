import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  IconChevronDown,
  IconDownload,
  IconPlayerRecord,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react';
import { usePanelStore } from '../../store';
import { consoleFilterCounts, pairConsoleEvents, pairedUnit, type ConsoleFilter } from '../../models/logLevels';
import type { ConsoleClearScope } from '../../types';
import { LevelChips } from './LevelChips';
import { ConsoleStream, useConsoleEvents } from './ConsoleStream';
import { ConsolePrompt, type ConsolePromptHandle } from './ConsolePrompt';
import { ConsoleStatusbar } from './ConsoleStatusbar';
import { PaneDivider } from '../common/PaneDivider';
import { DisclosureMenu } from '../common/DisclosureMenu';
import type { InspectRequest } from './CommandCell';
import { inspectorRoot, ResultInspector } from './ResultInspector';
import { insertAtConsoleCaret } from './consoleCaret';

const iconProps = { size: 16, stroke: 1.8 } as const;

// S6: what each Clear option removes, in the confirmation's words. The 'all' copy
// is the one the command palette and Settings use for their Clear console.
const CLEAR_OPTIONS: Array<{ scope: ConsoleClearScope; label: string; title: string; message: string; confirmLabel: string }> = [
  {
    scope: 'all', label: 'Clear everything', title: 'Clear console output?',
    message: 'This clears the console output and saved variables ($_, temp1…). Captured API entries remain available.',
    confirmLabel: 'Clear console',
  },
  {
    scope: 'commands', label: 'Clear my commands', title: 'Clear your commands?',
    message: 'This clears your commands, their results and saved variables ($_, temp1…). Page logs stay, and captured API entries remain available.',
    confirmLabel: 'Clear commands',
  },
  {
    scope: 'page', label: 'Clear page logs', title: 'Clear page logs?',
    message: 'This clears page logs from the console. Your commands, results and saved variables stay, and captured logs remain in the Logs tab.',
    confirmLabel: 'Clear page logs',
  },
];
// Docked inspector split (spec C7): the divider's value is the stream column's width.
const MIN_STREAM = 480;
const MIN_INSPECTOR = 320;

// Docked vs overlay is decided by the stylesheet's container query (Console ≥ 900 px
// sets --xray-console-docked: 1); the component reads it back so semantics (dialog vs
// complementary, Back, divider) always match what is painted.
function readDocked(layout: HTMLElement | null): boolean {
  return !!layout && getComputedStyle(layout).getPropertyValue('--xray-console-docked').trim() === '1';
}

function escapeAttr(value: string): string {
  return typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(value) : value.replace(/["\\]/g, '\\$&');
}

export function ConsoleWorkspace(): React.ReactElement {
  const setMini = usePanelStore((state) => state.setConsoleMiniTab);
  const recording = usePanelStore((state) => state.recording);
  const pausedCount = usePanelStore((state) => state.pausedCount);
  const setRecording = usePanelStore((state) => state.setRecording);
  const clearConsole = usePanelStore((state) => state.clearConsole);
  const requestConfirmation = usePanelStore((state) => state.requestConfirmation);
  const setExportOpen = usePanelStore((state) => state.setExportOpen);
  const [levelFilter, setLevelFilter] = useState<ConsoleFilter>('all');
  const [consoleQuery, setConsoleQuery] = useState('');
  const consoleEvents = useConsoleEvents();
  // run() lives in the prompt; cells reach it for Re-run. The running command
  // itself is store state (consoleRun).
  const promptRef = useRef<ConsolePromptHandle | null>(null);
  const rerun = useCallback((code: string) => promptRef.current?.run(code), []);

  // C7: one inspected value at a time; opening another replaces it.
  const [inspected, setInspected] = useState<InspectRequest | null>(null);
  const rootExpression = usePanelStore((state) => {
    if (!inspected) return null;
    let code: string | undefined;
    let variable: string | undefined;
    for (const event of state.consoleEvents) {
      if (event.type === 'command' && (event.commandId || event.id) === inspected.cellId) code = event.message;
      else if (event.commandId === inspected.cellId && event.type === 'result') variable = event.variable;
    }
    if (code === undefined) return null;
    // table() evaluates to its rows (the render flag is out of band, spec J8), so paths
    // index the expression directly.
    return inspectorRoot(code, variable);
  });
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const layoutRef = useRef<HTMLDivElement | null>(null);
  const columnRef = useRef<HTMLDivElement | null>(null);
  const [docked, setDocked] = useState(false);
  const [layoutWidth, setLayoutWidth] = useState(0);
  const [columnWidth, setColumnWidth] = useState(0);
  const [split, setSplit] = useState(0);
  const focusOnClose = useRef<string | null>(null);

  useLayoutEffect(() => {
    const layout = layoutRef.current;
    const column = columnRef.current;
    if (!layout || !column) return undefined;
    const update = (): void => {
      setDocked(readDocked(layout));
      setLayoutWidth(Math.round(layout.getBoundingClientRect().width));
      setColumnWidth(Math.round(column.getBoundingClientRect().width));
    };
    update();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(update);
    observer.observe(layout);
    observer.observe(column);
    return () => observer.disconnect();
  }, []);

  // Opening/closing the inspector or a resize changes the column before the observer
  // reports it; re-measure before paint so the divider never starts from a stale width.
  useLayoutEffect(() => {
    const column = columnRef.current;
    if (column) setColumnWidth(Math.round(column.getBoundingClientRect().width));
  }, [inspected, docked, split]);

  // The overlay covers the Console: everything under it leaves the focus and
  // accessibility order (a layout effect, so it lifts before focus is restored).
  const overlayOpen = !!inspected && !docked;
  useLayoutEffect(() => {
    const column = columnRef.current;
    if (!column) return undefined;
    column.inert = overlayOpen;
    return () => { column.inert = false; };
  }, [overlayOpen]);

  const openInspector = useCallback((request: InspectRequest) => setInspected(request), []);
  const closeInspector = useCallback((restoreFocus = true) => {
    setInspected((current) => {
      focusOnClose.current = restoreFocus && current ? current.cellId : null;
      return null;
    });
  }, []);
  // The inspected cell (or page log) left the stream — Delete cell, any Clear scope that
  // covers it, a session clear, eviction: the inspector closes with it.
  const inspectedGone = usePanelStore((state) => !!inspected && !state.consoleEvents.some(
    (event) => event.id === inspected.cellId || (event.type === 'command' && event.commandId === inspected.cellId),
  ));
  useEffect(() => {
    if (inspectedGone) closeInspector();
  }, [inspectedGone, closeInspector]);
  // Return focus to the opener's Open in inspector control once the inspector is gone
  // (or to the prompt when the opener has been scrolled out or deleted).
  useEffect(() => {
    if (inspected || focusOnClose.current === null) return;
    const id = focusOnClose.current;
    focusOnClose.current = null;
    const root = workspaceRef.current?.getRootNode() as Document | ShadowRoot | undefined;
    const target = root?.querySelector<HTMLElement>(`[data-inspect-id="${escapeAttr(id)}"]`) ??
      root?.querySelector<HTMLElement>('[aria-label="Console command"]');
    target?.focus();
  }, [inspected]);

  const usePath = useCallback((path: string) => {
    const scope = workspaceRef.current;
    // The overlay covers the prompt, so it steps aside; docked, it stays open.
    if (!docked) closeInspector(false);
    if (scope) insertAtConsoleCaret(scope, path);
  }, [docked, closeInspector]);

  const splitMax = Math.max(MIN_STREAM, layoutWidth - MIN_INSPECTOR);
  const splitValue = Math.min(splitMax, Math.max(MIN_STREAM, split || columnWidth || MIN_STREAM));
  const layoutStyle = docked && split > 0
    ? ({ '--xray-console-split': `${splitValue}px` } as React.CSSProperties)
    : undefined;

  // S2: a command and its result are one cell, counted once (a failed one once
  // under Errors too); page logs count per message.
  const levelCounts = useMemo(
    () => consoleFilterCounts(pairConsoleEvents(consoleEvents).map(pairedUnit)),
    [consoleEvents],
  );

  return (
    <div className="xray-console-workspace" ref={workspaceRef}>
      <div className={`xray-console-layout ${inspected ? 'has-inspector' : ''}`} ref={layoutRef} style={layoutStyle} data-split={docked && split > 0 ? '' : undefined}>
      <div className="xray-console-column" ref={columnRef}>
      <section className="xray-console-head">
        <div className="xray-console-title">Console</div>
        <div className="xray-toolbar">
          <DisclosureMenu
            triggerClassName="xray-btn xray-console-action"
            triggerLabel="Clear console"
            triggerTitle="Clear console"
            trigger={<><IconTrash {...iconProps} /><span>Clear</span><IconChevronDown size={14} stroke={1.8} /></>}
            menuLabel="Clear console options"
          >
            {CLEAR_OPTIONS.map((option) => (
              <button
                key={option.scope}
                type="button"
                className="xray-menu-item"
                onClick={() => requestConfirmation({
                  title: option.title,
                  message: option.message,
                  confirmLabel: option.confirmLabel,
                  tone: 'danger',
                  onConfirm: () => clearConsole(option.scope),
                })}
              >{option.label}</button>
            ))}
          </DisclosureMenu>
          <button
            className={`xray-btn ${recording ? 'xray-live' : 'xray-paused'}`}
            title="Pause the live console stream. Messages keep buffering and flush back in when you resume; capture itself is toggled in Settings → Capture."
            aria-pressed={recording}
            aria-label={recording ? 'Pause console stream' : `Resume console stream${pausedCount > 0 ? ` · ${pausedCount} new` : ''}`}
            onClick={() => setRecording(!recording)}
          >
            <IconPlayerRecord {...iconProps} /><span>{recording ? 'Live' : pausedCount > 0 ? `Paused · ${pausedCount} new` : 'Paused'}</span>
          </button>
          <button className="xray-btn xray-console-action" aria-label="Export console" title="Export console" onClick={() => setExportOpen(true)}><IconDownload {...iconProps} /><span>Export</span></button>
        </div>
      </section>
      {/* Requests live in API only; a legacy persisted consoleMiniTab='network'
          no longer hides output. The request-context picker sits in the prompt. */}
      <section className="xray-filterbar">
        <label className="xray-search">
          <IconSearch {...iconProps} />
          <input className="xray-input" aria-label="Filter console messages" placeholder="Filter console messages…" value={consoleQuery} onChange={(event) => setConsoleQuery(event.currentTarget.value)} />
        </label>
        <LevelChips levelFilter={levelFilter} counts={levelCounts} onChange={setLevelFilter} />
      </section>
      <ConsoleStream levelFilter={levelFilter} query={consoleQuery} onClearFilter={() => { setLevelFilter('all'); setConsoleQuery(''); }} onRerun={rerun} onOpenInspector={openInspector} />
      <ConsolePrompt
        ref={promptRef}
        emptyStream={consoleEvents.length === 0 && levelFilter === 'all' && !consoleQuery.trim()}
        onRun={() => { setMini('console'); setLevelFilter('all'); setConsoleQuery(''); }}
      />
      <ConsoleStatusbar />
      </div>
      {inspected && (
        <div className="xray-inspector-pane">
          {docked && (
            <PaneDivider
              label="Resize inspector"
              value={splitValue}
              min={MIN_STREAM}
              max={splitMax}
              valueText={(next) => `Inspector ${Math.max(0, layoutWidth - next)} px wide`}
              onLiveChange={setSplit}
              onCommit={setSplit}
              onReset={() => setSplit(0)}
            />
          )}
          <ResultInspector
            key={inspected.cellId}
            value={inspected.value}
            label={inspected.label}
            rootExpression={rootExpression}
            mode={docked ? 'docked' : 'overlay'}
            onClose={() => closeInspector()}
            onUsePath={usePath}
          />
        </div>
      )}
      </div>
    </div>
  );
}
