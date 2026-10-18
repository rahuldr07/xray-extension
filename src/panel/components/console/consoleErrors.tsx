import React from 'react';
import type { ConsoleEvent } from '../../types';

// Error shapes shared by page-log rows (ConsoleRow) and command cells (CommandCell).

export interface ConsoleError {
  name: string;
  message: string;
  stack: string;
}

// A console.error(new Error()) arrives as an error-level log whose data is a
// captured {__type__:'Error', name, message, stack} preview — stringifying that
// gives ugly raw JSON. Detect the error shape (page logs OR REPL error results)
// so we can render a clean "Name: message" line + an expandable stack instead.
export function extractConsoleError(event: ConsoleEvent): ConsoleError | null {
  // A captured Error is tagged __type__:'Error'. Untagged objects are only
  // treated as errors when the stack itself looks like one — a plain API payload
  // shaped { name, message, stack } (a validation DTO, say) must keep its JSON
  // tree, or every other property on it becomes unreachable in the UI.
  const looksLikeStack = (stack: string): boolean => /\n\s*at\s/.test(stack) || /^\w*Error\b/.test(stack);
  const isErrorObject = (value: unknown): ConsoleError | null => {
    if (!value || typeof value !== 'object') return null;
    const record = value as Record<string, unknown>;
    const looksLikeError = record.__type__ === 'Error' ||
      (typeof record.stack === 'string' && typeof record.message === 'string' && 'name' in record &&
        looksLikeStack(record.stack));
    if (!looksLikeError) return null;
    return { name: String(record.name || 'Error'), message: String(record.message || ''), stack: String(record.stack || '') };
  };
  const found = isErrorObject(event.data) || (event.args || []).map(isErrorObject).find(Boolean) || null;
  if (found) return found;
  // REPL failures: event.data is { message, stack } with no __type__.
  if (event.type === 'error' && event.data && typeof event.data === 'object') {
    const record = event.data as Record<string, unknown>;
    return { name: 'Error', message: String(record.message || event.message || 'Execution failed'), stack: String(record.stack || '') };
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

// Frames of an error thrown by a console command, minus the evaluation wrapper's own
// `<anonymous>` frames (the debugger-evaluated expression). Empty means "no stack".
export function commandStackFrames(error: ConsoleError): StackFrame[] {
  return stackFrames(error).filter((frame) => !frame.loc.startsWith('<anonymous>'));
}

// `frames` lets a caller pass an already-filtered list (command cells drop the
// XRAY evaluation wrapper's own <anonymous> frames).
export function ErrorBlock({ error, frames: given }: { error: ConsoleError; frames?: StackFrame[] }): React.ReactElement {
  const frames = React.useMemo(() => given ?? stackFrames(error), [error, given]);
  if (!frames.length) return <p className="xray-muted">No stack trace available.</p>;
  return (
    <ol className="xray-error-frames">
      {frames.map((frame, index) => (
        <li key={index}>
          <span className="xray-error-fn">{frame.fn}</span>
          {frame.loc && <code className="xray-error-loc" title={frame.loc}>{frame.loc}</code>}
        </li>
      ))}
    </ol>
  );
}
