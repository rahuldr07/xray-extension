import React from 'react';
import { logErrorInfo } from '../../models/logValue';
import type { ConsoleEvent } from '../../types';

// Error shapes shared by page-log rows (ConsoleRow) and command cells (CommandCell).

export interface ConsoleError {
  name: string;
  message: string;
  stack: string;
  /** One-line text of the Error's cause (page logs, spec J7). */
  cause?: string;
  /** Command errors: where the page threw, in the command (`<anonymous>:1:7`; background.js). */
  location?: string;
  /** Command errors: the page threw (or the command did not compile), so it reads `Uncaught …`. */
  thrown?: boolean;
  /** Command errors: a failure of the debugger itself (attach, detached, tab-closed, timeout, evaluation). */
  kind?: string;
  /** Command errors: XRAY could not display the value (its own failure, not the page's). */
  internal?: boolean;
  /** Command errors: the thrown value had no readable message and could not be encoded. */
  unreadable?: boolean;
  /** Command errors: the thrown value in the typed log model (`5`, `{a: 1}`, an Error envelope). */
  value?: unknown;
}

// A console.error(new Error()) arrives as an error-level log whose argument is a typed
// Error ({"$xray":"error", name, message, stack, cause?} — spec J7), and a command that
// returns an Error has the same typed value (spec J8). Detect it (or a REPL failure) so we
// can render a clean "Name: message" line + an expandable stack instead.
export function extractConsoleError(event: ConsoleEvent): ConsoleError | null {
  // Only the typed Error envelope is an Error: the encoder knows which values really were
  // Errors, so an object shaped { name, message, stack } — or with __type__: 'Error' — is
  // data and keeps its tree.
  if (event.type === 'log') {
    return (event.args || []).map((arg) => logErrorInfo(arg)).find(Boolean) || logErrorInfo(event.data) || null;
  }
  if (event.type === 'result') return logErrorInfo(event.data);
  // REPL failures: event.data is the evaluator's { message, stack }.
  if (event.type === 'error' && event.data && typeof event.data === 'object') {
    const record = event.data as Record<string, unknown>;
    return {
      name: 'Error',
      message: String(record.message || event.message || 'Execution failed'),
      stack: String(record.stack || ''),
      ...(typeof record.location === 'string' && record.location ? { location: record.location } : {}),
      ...(record.thrown === true ? { thrown: true } : {}),
      ...(typeof record.kind === 'string' ? { kind: record.kind } : {}),
      ...(record.internal === true ? { internal: true } : {}),
      ...(record.unreadable === true ? { unreadable: true } : {}),
      // The thrown value, already revived from typed JSON text by panel/console.js.
      ...(Object.prototype.hasOwnProperty.call(record, 'value') ? { value: record.value } : {}),
    };
  }
  return null;
}

export interface StackFrame {
  fn: string;
  loc: string;
}

// A JS stack's first line is usually "Name: message" (redundant with the row);
// each remaining "at fn (file:line:col)" frame becomes a function + location pair.
export function stackFrames(error: ConsoleError): StackFrame[] {
  const lines = error.stack.split('\n').map((line) => line.trim()).filter(Boolean);
  const start = lines[0] && (lines[0] === `${error.name}: ${error.message}` || lines[0].startsWith(error.name) ||
    /^[A-Za-z_$][\w$]*(?:Error|Exception)\b/.test(lines[0])) ? 1 : 0;
  return lines.slice(start).map((line) => {
    const match = line.replace(/^at\s+/, '').match(/^(.*?)\s*\(?((?:https?|chrome-extension|webpack|file|blob):[^)\s]+|<anonymous>[^)]*)\)?$/);
    if (match && match[2]) return { fn: match[1] || '(anonymous)', loc: match[2] };
    return { fn: line, loc: '' };
  });
}

// Frames of an error thrown by a console command. The background maps the command's own
// frames to `<anonymous>:line:col` in the command and drops the evaluation wrapper's (spec §1),
// so a located error keeps them; an unlocated one still loses every `<anonymous>` frame (the
// debugger-evaluated expression). Empty means "no stack".
export function commandStackFrames(error: ConsoleError): StackFrame[] {
  const frames = stackFrames(error);
  if (error.location) return frames;
  return frames.filter((frame) => !frame.loc.startsWith('<anonymous>'));
}

// `frames` lets a caller pass an already-filtered list (command cells drop the
// XRAY evaluation wrapper's own <anonymous> frames).
export function ErrorBlock({ error, frames: given }: { error: ConsoleError; frames?: StackFrame[] }): React.ReactElement {
  const frames = React.useMemo(() => given ?? stackFrames(error), [error, given]);
  const cause = error.cause ? <p className="xray-muted xray-error-cause">Caused by: {error.cause}</p> : null;
  if (!frames.length) return <><p className="xray-muted">No stack trace available.</p>{cause}</>;
  return (
    <>
      <ol className="xray-error-frames">
        {frames.map((frame, index) => (
          <li key={index}>
            <span className="xray-error-fn">{frame.fn}</span>
            {frame.loc && <code className="xray-error-loc" title={frame.loc}>{frame.loc}</code>}
          </li>
        ))}
      </ol>
      {cause}
    </>
  );
}
