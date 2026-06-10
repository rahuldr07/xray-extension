import type { XrayEntry } from '../types';

export interface ConsoleExecutionResult {
  type: string;
  result?: unknown;
  error?: {
    message?: string;
    stack?: string;
  };
  truncated?: boolean;
}

export function initConsoleRuntime(): void {
  window.XRAY_Console?.init?.();
}

export function setConsoleContext(entry: XrayEntry | null): void {
  window.XRAY_Console?.setContext(entry);
}

export async function executeConsoleCommand(code: string): Promise<ConsoleExecutionResult | null> {
  return window.XRAY_Console?.execute(code) ?? null;
}

export function navigateConsoleHistory(direction: 'up' | 'down'): string | null {
  return window.XRAY_Console?.navigateHistory(direction) ?? null;
}
