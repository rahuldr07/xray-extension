import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  IconBulb,
  IconChevronDown,
  IconChevronRight,
  IconCircleX,
  IconCopy,
  IconDots,
  IconPencil,
  IconRefresh,
  IconTrash,
  IconVariable,
} from '@tabler/icons-react';
import { usePanelStore } from '../../store';
import type { ConsoleEvent } from '../../types';
import { errorHint } from '../../models/consoleAssist';
import { saveConsoleVariable } from '../../runtime/consoleBridge';
import { copyText } from '../../utils';
import { focusFirstItem, handleMenuKeyDown, useMenuDismiss } from '../common/menuBehavior';
import { commandStackFrames, ErrorBlock, extractConsoleError, type ConsoleError } from './consoleErrors';
import { describeCommandResult, ResultView, resultCopyText, unwrap, type ResultViewMode } from './ResultView';

const iconProps = { size: 15, stroke: 1.8 } as const;
// Room the More menu needs below its trigger before it opens upward instead.
const MENU_ROOM = 96;

export interface InspectRequest {
  cellId: string;
  value: unknown;
  label: string;
}

function formatDuration(ms: number | undefined): string {
  if (ms === undefined) return '';
  if (ms < 1000) return `${Math.max(0, Math.round(ms))} ms`;
  return `${(ms / 1000).toFixed(ms < 10_000 ? 2 : 1)} s`;
}

// REPL errors carry no `name`; recover it from the stack header or a
// "TypeError: …" message prefix.
function commandError(result: ConsoleEvent): ConsoleError {
  const base = extractConsoleError(result) ?? { name: 'Error', message: result.message, stack: '' };
  if (base.name && base.name !== 'Error') return base;
  const header = /^([A-Za-z_$][\w$]*(?:Error|Exception))\b:?\s*/;
  const fromStack = header.exec(base.stack.trim());
  const fromMessage = header.exec(base.message);
  if (fromMessage) return { ...base, name: fromMessage[1], message: base.message.slice(fromMessage[0].length) || base.message };
  if (fromStack) return { ...base, name: fromStack[1] };
  return base;
}

function CellError({ result, code }: { result: ConsoleEvent; code: string }): React.ReactElement {
  const error = useMemo(() => commandError(result), [result]);
  // Only the user's own frames count; the evaluation wrapper's are noise.
  const frames = useMemo(() => commandStackFrames(error), [error]);
  // The selection captured when the command ran (unknown → assume one, so the
  // "No request selected" hint is never shown wrongly).
  const hint = errorHint(`${error.name}: ${error.message}`, code, result.hasRequest !== false);
  const [showStack, setShowStack] = useState(false);
  return (
    <div className="xray-cell-error">
      <p className="xray-cell-error-line">
        <IconCircleX {...iconProps} aria-hidden="true" />
        <span className="xray-error-name">{error.name}</span>
        <span className="xray-cell-error-message">{error.message}</span>
      </p>
      {hint && (
        <p className="xray-cell-hint"><IconBulb {...iconProps} aria-hidden="true" /><span>{hint}</span></p>
      )}
      {frames.length > 0 && (
        <>
          <button type="button" className="xray-cell-stack" aria-expanded={showStack} onClick={() => setShowStack((open) => !open)}>
            {showStack ? <IconChevronDown {...iconProps} /> : <IconChevronRight {...iconProps} />}Stack
          </button>
          {showStack && <div className="xray-cell-stack-body"><ErrorBlock error={error} frames={frames} /></div>}
        </>
      )}
    </div>
  );
}

function CellMenu({ code, disabled, onDelete }: { code: string; disabled: boolean; onDelete: () => void }): React.ReactElement {
  const showToast = usePanelStore((state) => state.showToast);
  const [open, setOpen] = useState<false | 'up' | 'down'>(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  useMenuDismiss(Boolean(open), wrapRef, triggerRef, () => setOpen(false));
  useEffect(() => { if (open) focusFirstItem(menuRef.current); }, [open]);

  function toggle(): void {
    if (open) { setOpen(false); return; }
    const trigger = triggerRef.current;
    const stream = trigger?.closest('.xray-console-stream');
    const room = trigger && stream ? stream.getBoundingClientRect().bottom - trigger.getBoundingClientRect().bottom : Infinity;
    setOpen(room < MENU_ROOM ? 'up' : 'down');
  }

  async function copyCommand(): Promise<void> {
    setOpen(false);
    triggerRef.current?.focus();
    try {
      await copyText(code);
      showToast('Copied command.');
    } catch {
      showToast('Could not copy. Check clipboard permissions.');
    }
  }

  return (
    <div className="xray-cell-menu-wrap" ref={wrapRef}>
      <button
        ref={triggerRef}
        type="button"
        className="xray-icon-btn xray-cell-action"
        aria-label="More cell actions"
        aria-expanded={Boolean(open)}
        title="More"
        onClick={toggle}
      >
        <IconDots {...iconProps} />
      </button>
      {open && (
        <div
          ref={menuRef}
          className={`xray-cell-menu ${open === 'up' ? 'is-up' : ''}`}
          role="group"
          aria-label="Cell actions"
          onKeyDown={(event) => handleMenuKeyDown(event, menuRef.current, wrapRef.current, triggerRef.current, () => setOpen(false))}
        >
          <button type="button" className="xray-menu-item" aria-label="Copy command" onClick={() => void copyCommand()}>
            <IconCopy {...iconProps} /><span>Copy command</span>
          </button>
          <button
            type="button"
            className="xray-menu-item xray-cell-delete"
            aria-label="Delete cell"
            disabled={disabled}
            title={disabled ? 'Cancel the run before deleting its cell' : undefined}
            onClick={() => { setOpen(false); onDelete(); }}
          >
            <IconTrash {...iconProps} /><span>Delete cell</span>
          </button>
        </div>
      )}
    </div>
  );
}

function ResultActions({ result }: { result: ConsoleEvent }): React.ReactElement {
  const showToast = usePanelStore((state) => state.showToast);
  const updateConsoleEvent = usePanelStore((state) => state.updateConsoleEvent);
  const copyRef = useRef<HTMLButtonElement | null>(null);

  async function copyResult(): Promise<void> {
    try {
      await copyText(resultCopyText(result.data));
      showToast('Copied result.');
    } catch {
      showToast('Could not copy. Check clipboard permissions.');
    }
  }

  function save(): void {
    try {
      // The rows of a table() result, not its render marker (paths index the rows).
      const name = saveConsoleVariable(unwrap(result.data).value);
      updateConsoleEvent(result.id, { variable: name });
      // The Save button is replaced by the name chip; keep focus in the cell.
      copyRef.current?.focus();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not save the variable.');
    }
  }

  return (
    <>
      <button ref={copyRef} type="button" className="xray-icon-btn xray-result-action" aria-label="Copy result" title="Copy result (JSON)" onClick={() => void copyResult()}>
        <IconCopy {...iconProps} />
      </button>
      {result.variable ? (
        <code className="xray-cell-variable" title={`Saved as ${result.variable}`}>{result.variable}</code>
      ) : (
        <button type="button" className="xray-icon-btn xray-result-action" aria-label="Save as variable" title="Save as variable (temp1, temp2…)" onClick={save}>
          <IconVariable {...iconProps} />
        </button>
      )}
    </>
  );
}

/**
 * One command and its result as a single card (spec C1–C5). The header carries the
 * command, run time and cell actions; a scalar result sits inline in the header,
 * anything larger renders once below it.
 */
export const CommandCell = React.memo(function CommandCell({
  command, result, running, rerunDisabled, view, onViewChange, onRerun, onOpenInspector,
}: {
  command: ConsoleEvent;
  result?: ConsoleEvent;
  running: boolean;
  rerunDisabled?: boolean;
  view?: ResultViewMode;
  onViewChange?: (cellId: string, view: ResultViewMode) => void;
  onRerun?: (code: string) => void;
  onOpenInspector?: (request: InspectRequest) => void;
}): React.ReactElement {
  const insertConsoleCommand = usePanelStore((state) => state.insertConsoleCommand);
  const removeConsoleCommand = usePanelStore((state) => state.removeConsoleCommand);
  const cellRef = useRef<HTMLElement | null>(null);
  const cellId = command.commandId || command.id;
  const code = command.message;
  const lines = code.split('\n');
  const firstLine = lines[0];
  const cancelled = !!result?.cancelled;
  const failed = result?.type === 'error';
  const succeeded = !!result && !failed && !cancelled;
  const described = useMemo(
    () => (succeeded ? describeCommandResult(result.data, result.resultType || '', !!result.truncated) : null),
    [succeeded, result],
  );
  const scalar = described?.description.kind === 'scalar';

  function remove(): void {
    // The cell unmounts under focus: hand it to the prompt rather than <body>.
    const root = cellRef.current?.getRootNode() as Document | ShadowRoot | undefined;
    removeConsoleCommand(cellId);
    root?.querySelector<HTMLElement>('[aria-label="Console command"]')?.focus();
  }

  const resultView = succeeded ? (
    <ResultView
      value={result.data}
      type={result.resultType || ''}
      described={described ?? undefined}
      truncated={!!result.truncated}
      actions={<ResultActions result={result} />}
      view={view}
      onViewChange={onViewChange ? (next) => onViewChange(cellId, next) : undefined}
      onOpenInspector={onOpenInspector ? (value) => onOpenInspector({ cellId, value, label: firstLine }) : undefined}
      inspectId={cellId}
    />
  ) : null;

  const state = running ? 'is-running' : cancelled ? 'is-cancelled' : failed ? 'is-error' : scalar ? 'is-scalar' : '';
  return (
    <article ref={cellRef} className={`xray-command-cell ${state}`} aria-label={`Command: ${firstLine}`} data-command-id={cellId}>
      <header className="xray-cell-head">
        <span className="xray-cell-glyph" aria-hidden="true"><IconChevronRight {...iconProps} /></span>
        <code className="xray-cell-command" title={code}>{firstLine}</code>
        {lines.length > 1 && <span className="xray-cell-lines" title={code}>{lines.length} lines</span>}
        {scalar && resultView}
        {result?.truncated && <span className="xray-truncated-badge" title="The result was truncated to fit the transfer limit">truncated</span>}
        <span className="xray-cell-tail">
          {result?.durationMs !== undefined && <span className="xray-cell-time" title="Run time">{formatDuration(result.durationMs)}</span>}
          <span className="xray-cell-actions">
            <button type="button" className="xray-icon-btn xray-cell-action" aria-label="Re-run" title="Re-run" disabled={rerunDisabled || !onRerun} onClick={() => onRerun?.(code)}>
              <IconRefresh {...iconProps} />
            </button>
            <button type="button" className="xray-icon-btn xray-cell-action" aria-label="Edit in prompt" title="Edit in prompt" onClick={() => insertConsoleCommand(code)}>
              <IconPencil {...iconProps} />
            </button>
            <CellMenu code={code} disabled={running} onDelete={remove} />
          </span>
        </span>
      </header>
      {running ? (
        <p className="xray-cell-status"><IconRefresh {...iconProps} className="xray-spin" aria-hidden="true" />Running…</p>
      ) : cancelled ? (
        <p className="xray-cell-status">Cancelled</p>
      ) : failed && result ? (
        <CellError result={result} code={code} />
      ) : !scalar && resultView}
    </article>
  );
});
