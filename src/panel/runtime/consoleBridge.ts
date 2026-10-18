import type { XrayEntry } from '../types';

export interface ConsoleExecutionResult {
  type: string;
  /** The value in the typed log model (spec J8; models/consoleResults.ts describes it). */
  result?: unknown;
  error?: {
    code?: string;
    message?: string;
    stack?: string;
  };
  truncated?: boolean;
  /** table()/toTable() returned the value: lay its rows out as a table (an out-of-band flag). */
  render?: 'table';
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

export function navigateConsoleHistory(direction: 'up' | 'down'): string | null {
  return window.XRAY_Console?.navigateHistory(direction) ?? null;
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
