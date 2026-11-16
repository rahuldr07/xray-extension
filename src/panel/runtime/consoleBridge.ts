import type { XrayEntry } from '../types';
import type { DeclaredName, LiveName } from '../models/consoleAssist';
import { previewTexts } from '../models/consoleEager';

export interface ConsoleExecutionResult {
  type: string;
  /** The value in the typed log model (spec J8; models/consoleResults.ts describes it). */
  result?: unknown;
  error?: {
    code?: string;
    message?: string;
    stack?: string;
    /** A failure of the debugger itself (background.js): what failed. Absent for the page's own exception. */
    kind?: 'attach' | 'detached' | 'tab-closed' | 'timeout' | 'evaluation' | 'skipped';
    /** The page threw (or the command did not compile): shown as `Uncaught …`. */
    thrown?: boolean;
    /** Where it was thrown in the command: `<anonymous>:1:7`. */
    location?: string;
    /** The thrown value in the typed log model (revived by panel/console.js). */
    value?: unknown;
    /** XRAY could not display the value (its own failure). */
    internal?: boolean;
    /** The thrown value could not be read at all (no message, no encoding). */
    unreadable?: boolean;
  };
  truncated?: boolean;
  /** table()/toTable() returned the value: lay its rows out as a table (an out-of-band flag). */
  render?: 'table';
  /** The top-level promise the run awaited: its state and how long it took (console round 2). */
  meta?: { promise?: { state: 'fulfilled' | 'rejected' | 'pending'; ms: number } };
  /** The variables earlier commands declared were lost (page reloaded, debugger detached; spec §2). */
  scopeReset?: true;
}

/** The typed body of an entry's response or request, as the Console context carries it. */
export type ConsoleBodyReader = (entry: XrayEntry, side: 'response' | 'request') => unknown;

export function initConsoleRuntime(): void {
  window.XRAY_Console?.init?.();
}

export function setConsoleContext(entry: XrayEntry | null): void {
  window.XRAY_Console?.setContext?.(entry);
}

/**
 * Run `code` through the engine. `readBody` (the running surface's lossless parse) gives the
 * values `res`, `req`, `prev`, `next` and pins carry, so an integer past 2^53 reaches the page
 * exactly (as a BigInt); without it the page parses the raw text.
 */
export async function executeConsoleCommand(code: string, readBody?: ConsoleBodyReader): Promise<ConsoleExecutionResult | null> {
  const bridge = window.XRAY_Console;
  if (!bridge?.execute) {
    return {
      type: 'error',
      error: {
        code: 'console-bridge-unavailable',
        message: 'XRAY console is unavailable. Reload the page and try again.',
      },
    };
  }
  try {
    return await bridge.execute(code, readBody ? { readBody } : undefined);
  } catch {
    return {
      type: 'error',
      error: {
        code: 'console-execution-failed',
        message: 'XRAY console execution failed. Try again.',
      },
    };
  }
}

/**
 * The Console prompt gained or lost focus: the background keeps the debugger session — and the
 * variables commands declared — for 5 min instead of 30 s while it has focus (spec §2). `source`
 * names the prompt, so one prompt's blur never cancels another's focus.
 */
export function setPromptFocused(focused: boolean, source?: string): void {
  try {
    window.XRAY_Console?.setPromptFocused?.(focused, source);
  } catch {
    // No engine: nothing to keep alive.
  }
}

/** The background's live completion answer (Task 7): names the page holds, from descriptors only. */
export interface LiveAnswer {
  requestId: number;
  /** null: nothing was asked (no session and no attach allowed, a refused path, a run in flight). */
  names: LiveName[] | null;
  /** A debugger session answered (or is attached). */
  attached: boolean;
  /** A primitive's type (`string`): its prototype comes from the catalogue. */
  type?: string;
  /** With the globals: the names earlier commands declared in the tab's scope. */
  declared?: DeclaredName[];
  /** The list was cut (500 names, or too many to scan): not the whole picture. */
  capped?: boolean;
  /** The path stopped at an accessor: nothing was evaluated. */
  getter?: boolean;
  /** With the globals: how old the worker's read is (ms) — freshness counts from it. */
  age?: number;
}

/**
 * Live completion (spec §3 source 4): the page's names for the plain path `expr`, or its globals
 * (`expr` null). `attach` lets this request attach the debugger (the editor allows it only after
 * ≥ 2 characters and a 150 ms pause). Null when the engine is unavailable or the answer is malformed.
 */
export async function completeMembers(expr: string | null, requestId: number, options: { attach?: boolean } = {}): Promise<LiveAnswer | null> {
  try {
    const answer = await window.XRAY_Console?.complete?.(expr, requestId, options.attach === true);
    if (!answer || typeof answer !== 'object') return null;
    const out = answer as Partial<LiveAnswer>;
    if (out.requestId !== requestId) return null;
    const names = Array.isArray(out.names) ? out.names.filter(isLiveName) : null;
    const result: LiveAnswer = { requestId, names, attached: out.attached === true };
    if (typeof out.type === 'string') result.type = out.type;
    if (out.capped === true) result.capped = true;
    if (out.getter === true) result.getter = true;
    if (typeof out.age === 'number' && Number.isFinite(out.age) && out.age >= 0) result.age = out.age;
    if (Array.isArray(out.declared)) result.declared = out.declared.filter((d): d is DeclaredName => !!d && typeof d.name === 'string' && typeof d.kind === 'string');
    return result;
  } catch {
    return null;
  }
}

const LIVE_KINDS = new Set(['function', 'property', 'getter', 'class']);
function isLiveName(value: unknown): value is LiveName {
  const n = value as LiveName;
  return !!n && typeof n.name === 'string' && LIVE_KINDS.has(n.kind) && typeof n.own === 'boolean' && (n.params === undefined || typeof n.params === 'string') && (n.native === undefined || n.native === true);
}

/** The background's eager preview (Task 8, spec §4) as the line under the prompt. */
export interface PreviewAnswer {
  requestId: number;
  /** A debugger session answered (or is attached). */
  attached: boolean;
  /** The one-line preview (without the arrow); null: nothing to show. */
  text: string | null;
  /** The draft threw: `Uncaught TypeError: …`. */
  error?: string;
}

/**
 * Eager preview: `code` evaluated side-effect-free in the page (models/consoleEager.ts says which
 * drafts may be), answered as typed-model text and drawn here with previewLine. `attach` lets the
 * request attach the debugger (≥ 2 characters and a 150 ms pause); `readBody` types the context
 * values as a Run's would. Null when the engine is unavailable, the answer is another request's,
 * or it is malformed.
 */
export async function previewCommand(code: string, requestId: number, options: { attach?: boolean; readBody?: ConsoleBodyReader } = {}): Promise<PreviewAnswer | null> {
  try {
    const answer = await window.XRAY_Console?.preview?.(code, requestId, options.attach === true, options.readBody ? { readBody: options.readBody } : undefined);
    if (!answer || typeof answer !== 'object') return null;
    const out = answer as { requestId?: unknown; attached?: unknown; value?: unknown; thrown?: unknown };
    if (out.requestId !== requestId) return null;
    const texts = previewTexts({ value: out.value, thrown: out.thrown });
    const result: PreviewAnswer = { requestId, attached: out.attached === true, text: texts && 'text' in texts ? texts.text : null };
    if (texts && 'error' in texts) result.error = texts.error;
    return result;
  } catch {
    return null;
  }
}

export function navigateConsoleHistory(direction: 'up' | 'down'): string | null {
  return window.XRAY_Console?.navigateHistory(direction) ?? null;
}

/** The remembered commands, newest first; `[]` when the engine is unavailable (ghost text, spec §3). */
export function getConsoleHistory(): string[] {
  try {
    const list = window.XRAY_Console?.getHistory?.();
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

const TEMP_NAME = /^temp(\d+)$/;
let lastTempIndex = 0;

/**
 * Save a result as the next free `tempN` console variable (Chrome DevTools style)
 * and return its name. The value reaches later evaluations through the console
 * scope (`context.scope`). Throws when the console scope is unavailable.
 */
export function saveConsoleVariable(value: unknown): string {
  const bridge = window.XRAY_Console;
  if (!bridge?.setVar) throw new Error('Console variables are unavailable.');
  let index = lastTempIndex;
  for (const name of Object.keys(bridge.getScope?.() ?? {})) {
    const match = TEMP_NAME.exec(name);
    if (match) index = Math.max(index, Number(match[1]));
  }
  let name = `temp${index + 1}`;
  while (bridge.getVar?.(name) !== undefined) name = `temp${++index + 1}`;
  bridge.setVar(name, value);
  lastTempIndex = index + 1;
  return name;
}

/** `$_` always refers to the last successful command result. */
export function rememberConsoleResult(value: unknown): void {
  try {
    window.XRAY_Console?.setVar?.('$_', value);
  } catch {
    // A missing scope only costs `$_`; the result itself still renders.
  }
}

/** Forget saved variables (`temp1`…, `$_`); numbering restarts at temp1. Pins are kept. */
export function clearConsoleVariables(): void {
  lastTempIndex = 0;
  try {
    window.XRAY_Console?.clearVariables?.();
  } catch {
    // Nothing to clear when the console engine is unavailable.
  }
}

/**
 * Hand the engine the current pins (`a` → entry), replacing what it holds. The engine
 * keeps these entry objects as given and never looks entries up itself, so the store
 * re-sends whenever a pin changes or a pinned entry is patched or evicted, and the
 * prompt re-sends before every run (another surface may have synced since).
 */
export function syncConsolePins(pins: Record<string, XrayEntry>): void {
  try {
    window.XRAY_Console?.setPins?.(pins);
  } catch {
    // No engine: pins still show in the panel; evaluation reports itself unavailable.
  }
}
