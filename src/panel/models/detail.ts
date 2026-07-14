import type { DetailTab, DetailView, RequestTiming, XrayEntry } from '../types';
import { entryRequest, entryResponse, schema } from '../utils';

function duration(entry: XrayEntry): number {
  return Math.max(0, Number(entry.duration) || 0);
}

export const detailViews: DetailView[] = ['tree', 'grid', 'raw', 'schema', 'diff', 'viz', 'waterfall', 'headers'];

export interface TimingPhase {
  label: string;
  ms: number;
  className: string;
}

// Break a request's timing into phases for the waterfall bar. Uses real Resource
// Timing when the interceptor captured it, otherwise falls back to a single
// wall-clock duration bar.
export function timingPhases(entry: XrayEntry): { phases: TimingPhase[]; totalMs: number; real: boolean } {
  const timing: RequestTiming | null | undefined = entry.timing;
  if (timing && Number(timing.totalMs) > 0) {
    const phases: TimingPhase[] = [
      { label: 'DNS', ms: Number(timing.dnsMs) || 0, className: 'dns' },
      { label: 'Connect', ms: Math.max(0, (Number(timing.connectMs) || 0) - (Number(timing.tlsMs) || 0)), className: 'connect' },
      { label: 'TLS', ms: Number(timing.tlsMs) || 0, className: 'tls' },
      { label: 'Wait (TTFB)', ms: Number(timing.ttfbMs) || 0, className: 'ttfb' },
      { label: 'Download', ms: Number(timing.downloadMs) || 0, className: 'download' },
    ].filter((phase) => phase.ms > 0);
    return { phases, totalMs: Number(timing.totalMs), real: true };
  }
  const total = duration(entry);
  return { phases: [{ label: 'Total', ms: total, className: 'total' }], totalMs: total, real: false };
}

export interface GridData {
  objects: Array<Record<string, unknown>>;
  columns: string[];
}

export interface VizSummary {
  inferredType: unknown;
  rows: number;
}

export function detailValue(entry: XrayEntry, detailTab: DetailTab): unknown {
  if (detailTab === 'request') return entryRequest(entry);
  if (detailTab === 'headers') {
    return {
      requestHeaders: entry.requestHeaders || {},
      responseHeaders: entry.responseHeaders || {},
    };
  }
  return entryResponse(entry);
}

export function gridRows(value: unknown): GridData {
  const rows = Array.isArray(value)
    ? value
    : value && typeof value === 'object'
      ? Object.values(value).find(Array.isArray) || [value]
      : [];
  const objects = (rows as unknown[])
    .filter((row) => row && typeof row === 'object' && !Array.isArray(row))
    .slice(0, 200) as Array<Record<string, unknown>>;
  const columns = Array.from(objects.reduce((set, row) => {
    Object.keys(row).slice(0, 20).forEach((key) => set.add(key));
    return set;
  }, new Set<string>()));
  return { objects, columns };
}

export function vizSummary(value: unknown): VizSummary {
  return {
    inferredType: schema(value),
    rows: Array.isArray(value) ? value.length : value && typeof value === 'object' ? 1 : 0,
  };
}

export interface DiffLine {
  path: string;
  kind: 'added' | 'removed' | 'changed';
  before?: unknown;
  after?: unknown;
}

// Path-level structural diff for the Diff view: added/removed/changed leaves,
// depth- and line-capped so a huge payload can't stall the panel.
export function structuralDiff(previous: unknown, current: unknown, maxLines = 200): DiffLine[] {
  const lines: DiffLine[] = [];
  const walk = (prev: unknown, curr: unknown, path: string, depth: number): void => {
    if (lines.length >= maxLines || depth > 6) return;
    if (prev === undefined && curr !== undefined) { lines.push({ path, kind: 'added', after: curr }); return; }
    if (prev !== undefined && curr === undefined) { lines.push({ path, kind: 'removed', before: prev }); return; }
    const prevIsObj = prev !== null && typeof prev === 'object';
    const currIsObj = curr !== null && typeof curr === 'object';
    if (!prevIsObj || !currIsObj) {
      if (!Object.is(prev, curr)) lines.push({ path, kind: 'changed', before: prev, after: curr });
      return;
    }
    if (Array.isArray(prev) !== Array.isArray(curr)) {
      lines.push({ path, kind: 'changed', before: prev, after: curr });
      return;
    }
    if (Array.isArray(prev) && Array.isArray(curr)) {
      const length = Math.max(prev.length, curr.length);
      for (let index = 0; index < Math.min(length, 50); index += 1) {
        walk(prev[index], curr[index], `${path}[${index}]`, depth + 1);
      }
      if (length > 50 && prev.length !== curr.length && lines.length < maxLines) {
        lines.push({ path: `${path}[…]`, kind: 'changed', before: `${prev.length} items`, after: `${curr.length} items` });
      }
      return;
    }
    const keys = new Set([...Object.keys(prev as object), ...Object.keys(curr as object)]);
    for (const key of keys) {
      walk((prev as Record<string, unknown>)[key], (curr as Record<string, unknown>)[key], path ? `${path}.${key}` : key, depth + 1);
    }
  };
  walk(previous, current, '', 0);
  return lines;
}
