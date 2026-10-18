import React, { useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import {
  IconPlayerStop,
  IconHelp,
  IconPlayerPlay,
  IconRefresh,
} from '@tabler/icons-react';
import { evaluateConsoleCommand, usePanelStore } from '../../store';
import { rememberConsoleResult } from '../../runtime/consoleBridge';
import { entryRequest, entryResponse, preview } from '../../utils';
import { SnippetsMenu } from './SnippetsMenu';
import { unwrap } from './ResultView';
import { ConsoleEditor } from './ConsoleEditor';
import { summarizeCaptured } from '../../models/consoleAssist';
import { RequestContextLine, usePinnedRoots } from './RequestContextLine';
import { StarterChips, useStarters } from './StarterChips';

const iconProps = { size: 16, stroke: 1.8 } as const;
// P11: Cancel is offered once a run has been waiting this long.
const CANCEL_AFTER_MS = 2000;
// Saved console variables (Chrome style `temp1`… and `$_`); other scope names are pins.
const SAVED_VARIABLE = /^(?:temp\d+|\$_)$/;
const NO_ROOTS: Record<string, unknown> = {};

/**
 * Saved variables straight from the console scope (stored values, never evaluated).
 * Read on every render: the scope changes outside the store (a run's `$_`, Save as variable).
 */
function savedVariables(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  try {
    const scope = window.XRAY_Console?.getScope?.() ?? {};
    for (const name of Object.keys(scope)) if (SAVED_VARIABLE.test(name)) out[name] = scope[name];
  } catch {
    // No console scope: no saved variables to offer.
  }
  return out;
}

let commandSeq = 0;

export interface ConsolePromptHandle {
  /** Run code as a new command (Re-run); the draft is left alone. */
  run(code: string): void;
}

interface RunToken {
  id: string;
  started: number;
  cancelled: boolean;
}

// The in-flight run outlives this component: App mounts the Console only while its
// tab is active, so the token is module-level and the visible run state is in the
// store (`consoleRun`). Leaving and returning mid-run keeps Running…/Cancel. The store
// is authoritative: a run is current only while `consoleRun` names it, so Clear
// (which drops `consoleRun`) abandons it without reaching into this module.
let activeRun: RunToken | null = null;

function isCurrentRun(token: RunToken): boolean {
  return !token.cancelled && usePanelStore.getState().consoleRun?.id === token.id;
}

function selectionHasRequest(): boolean {
  const state = usePanelStore.getState();
  return !!state.selectedId && state.entries.some((entry) => entry.id === state.selectedId && entry.type === 'api');
}

// Stop waiting. The in-page evaluation is not recalled; its late result is
// discarded (the run token is marked) and the cell shows "Cancelled".
function cancelActiveRun(): boolean {
  const token = activeRun;
  activeRun = null;
  if (!token || !isCurrentRun(token)) return false;
  token.cancelled = true;
  const state = usePanelStore.getState();
  state.setConsoleRun(null);
  // The cell may already be gone (deleted, or evicted from the stream); a
  // "Cancelled" result for it would surface as an orphan row.
  if (!state.consoleEvents.some((event) => event.id === token.id)) return true;
  state.addConsoleEvent({
    id: 'res_' + token.id, type: 'result', level: 'info', timestamp: Date.now(), message: 'Cancelled',
    commandId: token.id, cancelled: true, durationMs: Math.round(performance.now() - token.started),
  });
  return true;
}

/** The expanded editor takes the whole Console (narrow Console): read back from CSS. */
function editorFillsConsole(prompt: HTMLElement | null): boolean {
  return !!prompt && getComputedStyle(prompt).getPropertyValue('--xray-editor-full').trim() === '1';
}

export const ConsolePrompt = React.forwardRef<ConsolePromptHandle, {
  onRun: () => void;
  /** Extra variables the editor resolves locally (Task 7: pinned requests `a`…`f` → parsed response bodies). */
  extraRoots?: Record<string, unknown>;
  /**
   * The stream is empty and unfiltered, so its empty state already shows chips
   * (starters, or the fixed examples): the prompt does not repeat them.
   */
  emptyStream?: boolean;
}>(function ConsolePrompt({ onRun, extraRoots = NO_ROOTS, emptyStream = false }, ref): React.ReactElement {
  const entries = usePanelStore((state) => state.entries);
  const selectedId = usePanelStore((state) => state.selectedId);
  const selected = selectedId ? entries.find((entry) => entry.id === selectedId) || null : null;
  const addConsoleEvent = usePanelStore((state) => state.addConsoleEvent);
  const removeConsoleCommand = usePanelStore((state) => state.removeConsoleCommand);
  const command = usePanelStore((state) => state.consoleDraft);
  const setConsoleDraft = usePanelStore((state) => state.setConsoleDraft);
  const preparationId = usePanelStore((state) => state.consolePreparationId);
  const blocked = usePanelStore((state) => Boolean(state.pendingConfirmation || state.settingsOpen || state.exportOpen || state.commandOpen || state.globalSearchOpen || state.explainEntry || state.replayEditorEntry || state.compareOpen || state.findingSynthesisIds));
  const consoleRun = usePanelStore((state) => state.consoleRun);
  const setConsoleRun = usePanelStore((state) => state.setConsoleRun);
  const [cancelVisible, setCancelVisible] = useState(false);
  const running = consoleRun !== null;
  const [announcement, setAnnouncement] = useState('');
  // P10: the expanded editor. Collapsing keeps the draft (it lives in the store).
  const [expanded, setExpanded] = useState(false);
  const saveSnippet = usePanelStore((state) => state.saveSnippet);
  const starterItems = useStarters();
  const promptRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const focusedPreparation = useRef(0);

  useEffect(() => {
    if (!preparationId || preparationId === focusedPreparation.current || blocked) return;
    const el = inputRef.current;
    if (!el) return;
    focusedPreparation.current = preparationId;
    el.focus();
  }, [preparationId, blocked]);

  // Cancel shows 2 s after the run started — recomputed from the stored start time,
  // so a remount mid-run (tab switch) neither resets nor loses it.
  useEffect(() => {
    if (!consoleRun) return;
    const remaining = CANCEL_AFTER_MS - (Date.now() - consoleRun.startedAt);
    if (remaining <= 0) {
      setCancelVisible(true);
      return () => setCancelVisible(false);
    }
    const timer = window.setTimeout(() => setCancelVisible(true), remaining);
    return () => { window.clearTimeout(timer); setCancelVisible(false); };
  }, [consoleRun]);

  useImperativeHandle(ref, () => ({ run: (code: string) => { void run(code); } }));

  function cancel(): void {
    if (!cancelActiveRun()) return;
    setAnnouncement('Run cancelled');
    inputRef.current?.focus();
  }

  async function run(codeOverride?: string): Promise<void> {
    const code = (codeOverride ?? command).trim();
    if (!code || usePanelStore.getState().consoleRun) return;
    onRun();
    if (codeOverride === undefined) setConsoleDraft('');
    commandSeq += 1;
    const commandId = 'cmd_' + Date.now().toString(36) + '_' + commandSeq.toString(36);
    const token: RunToken = { id: commandId, started: performance.now(), cancelled: false };
    activeRun = token;
    setConsoleRun({ id: commandId, startedAt: Date.now() });
    // The selection the command evaluated against, for the error hint (C5).
    const hasRequest = selectionHasRequest();
    addConsoleEvent({ id: commandId, type: 'command', level: 'info', timestamp: Date.now(), message: code, args: [code], commandId });
    // Only the current, uncancelled run may report — and only while its cell
    // still exists (Clear during a run must not leave an orphan result row).
    const live = (): boolean => isCurrentRun(token) &&
      usePanelStore.getState().consoleEvents.some((event) => event.id === commandId);
    try {
      // This surface's selection and pins, re-sent first: the HUD and panel share one engine.
      const result = await evaluateConsoleCommand(code);
      if (!live()) return;
      const durationMs = Math.round(performance.now() - token.started);
      if (!result) {
        const message = 'Console execution unavailable';
        addConsoleEvent({
          id: 'res_' + commandId, type: 'error', level: 'error', timestamp: Date.now(),
          message, data: { message }, commandId, durationMs, hasRequest,
        });
        if (!codeOverride) setConsoleDraft(code);
        setAnnouncement(`Error: ${message}`);
        return;
      }
      if (result.type === 'empty') {
        removeConsoleCommand(commandId);
        return;
      }
      if (result.type === 'error') {
        const message = result.error?.message || 'Execution failed';
        addConsoleEvent({
          id: 'res_' + commandId,
          type: 'error',
          level: 'error',
          timestamp: Date.now(),
          message,
          data: result.error,
          commandId,
          durationMs,
          hasRequest,
        });
        // Give the failed command back so it can be fixed instead of retyped.
        if (!codeOverride) setConsoleDraft(code);
        setAnnouncement(`Error: ${message}`);
      } else {
        // The value, not a table() render marker around it: this is the stream's
        // searchable text and the screen-reader announcement.
        const value = unwrap(result.result).value;
        const message = preview(value, 260);
        addConsoleEvent({
          id: 'res_' + commandId,
          type: 'result',
          level: 'info',
          timestamp: Date.now(),
          message,
          data: result.result,
          commandId,
          truncated: !!result.truncated,
          durationMs,
          resultType: result.type,
        });
        // `$_` holds the value, not a table() render marker around it.
        rememberConsoleResult(value);
        setAnnouncement(`Result: ${message.slice(0, 140)}`);
      }
    } catch (error) {
      if (!live()) return;
      const message = error instanceof Error ? error.message : String(error);
      addConsoleEvent({
        id: 'res_' + commandId, type: 'error', level: 'error', timestamp: Date.now(),
        message, data: { message, stack: error instanceof Error ? error.stack : undefined }, commandId,
        durationMs: Math.round(performance.now() - token.started), hasRequest,
      });
      if (!codeOverride) setConsoleDraft(code);
      setAnnouncement(`Error: ${message}`);
    } finally {
      if (activeRun === token) activeRun = null;
      if (usePanelStore.getState().consoleRun?.id === token.id) usePanelStore.getState().setConsoleRun(null);
    }
  }

  // Run all / Run selection from the expanded editor go through the same run(), as
  // explicit code, so the draft survives. When the editor covers the whole Console
  // (narrow), it steps aside so the result cell is visible; Ctrl/⌘+↑ brings it back.
  function runFromEditor(code: string): void {
    if (usePanelStore.getState().consoleRun) return;
    if (editorFillsConsole(promptRef.current)) setExpanded(false);
    void run(code);
  }

  function saveAsSnippet(code: string): void {
    if (!code.trim()) return;
    saveSnippet({ code });
    setAnnouncement('Saved as snippet');
  }

  // Roots for suggestions and the live preview: captured data only (P5, P7).
  const selectedApi = selected?.type === 'api' ? selected : null;
  const capturedSummary = useMemo(() => summarizeCaptured(entries), [entries]);
  const captured = useMemo(() => (selectedApi ? { res: entryResponse(selectedApi), req: entryRequest(selectedApi) } : NO_ROOTS), [selectedApi]);
  // The scope changes outside the store (a run's `$_`, Save as variable), so it is
  // re-read every render; resolving and suggesting against it is cheap and local.
  const saved = savedVariables();
  // Pinned requests `a`…`f` resolve to their parsed response bodies (P2).
  const pinned = usePinnedRoots();
  const roots = { ...captured, ...pinned, ...extraRoots, ...saved };
  const variables = [...Object.keys(pinned), ...Object.keys(extraRoots), ...Object.keys(saved)];

  return (
    <div className={`xray-prompt ${expanded ? 'is-expanded' : ''}`} ref={promptRef}>
      <RequestContextLine selected={selected} />
      {/* P8: starters above the editor while the draft is empty (the empty stream shows its own). */}
      {!emptyStream && !command && <StarterChips items={starterItems} className="xray-starter-row" />}
      <ConsoleEditor
        ref={inputRef}
        value={command}
        onChange={(value) => setConsoleDraft(value)}
        onRun={() => void run()}
        onExpandToggle={() => setExpanded((value) => !value)}
        expanded={expanded}
        onRunCode={runFromEditor}
        onSaveSnippet={saveAsSnippet}
        running={running}
        // The empty stream's fixed examples (no request selected) are the helper
        // chips again, so the editor's row steps aside — unless it also carries
        // saved/pinned variables. Starters are not repeated above.
        showChips={!(emptyStream && starterItems.length === 0 && variables.length === 0)}
        roots={roots}
        variables={variables}
        captured={capturedSummary}
        actions={(
          <>
            <button className="xray-btn xray-prompt-help" aria-label="Console help" title="Show the console helpers cheatsheet ($help)" disabled={running} onClick={() => void run('$help')}>
              <IconHelp {...iconProps} />
            </button>
            <SnippetsMenu onLoaded={() => inputRef.current?.focus()} />
            <button className="xray-btn primary xray-console-run" aria-label={running ? 'Running command' : 'Run'} title={expanded ? 'Run all (Ctrl/⌘+Enter)' : 'Run command (Enter)'} disabled={running || !command.trim()} onClick={() => (expanded ? runFromEditor(command) : void run())}>
              {running ? <IconRefresh {...iconProps} className="xray-spin" /> : <IconPlayerPlay {...iconProps} />}
              <span>{running ? 'Running…' : 'Run'}</span>
            </button>
            {running && cancelVisible && (
              <button className="xray-btn xray-console-cancel" aria-label="Cancel run" title="Stop waiting for this command; a late result is discarded" onClick={cancel}>
                <IconPlayerStop {...iconProps} /><span>Cancel</span>
              </button>
            )}
          </>
        )}
      />
      <span className="xray-visually-hidden" aria-live="polite">{announcement}</span>
    </div>
  );
});
