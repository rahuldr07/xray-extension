import type { DetailTab, DetailView, XrayEntry } from '../types';
import { entryRequest, entryResponse, schema } from '../utils';

export const detailViews: DetailView[] = ['tree', 'grid', 'raw', 'schema', 'diff', 'viz', 'waterfall', 'headers'];

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
