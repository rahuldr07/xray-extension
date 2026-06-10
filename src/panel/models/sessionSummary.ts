import type { XrayEntry } from '../types';
import { isApi, isLog } from './entries';

export interface SessionSummary {
  apiCount: number;
  logCount: number;
  errorCount: number;
  totalBytes: number;
}

export function buildSessionSummary(entries: XrayEntry[]): SessionSummary {
  const apis = entries.filter(isApi);
  return {
    apiCount: apis.length,
    logCount: entries.filter(isLog).length,
    errorCount: apis.filter((entry) => Number(entry.status) >= 400).length,
    totalBytes: apis.reduce((sum, entry) => sum + (Number(entry.size) || 0), 0),
  };
}
