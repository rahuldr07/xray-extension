import type { XrayEntry } from '../types';
import { duration, entryPath, isApi } from './entries';

export interface SlowRequestInsight {
  id: string;
  method: string;
  path: string;
  duration: number;
  status: number;
}

export interface InsightsSummary {
  requests: number;
  errors: number;
  slow: number;
  avgDuration: number;
  totalBytes: number;
  statusCounts: Record<string, number>;
  repeatedEndpoints: Record<string, number>;
  nPlusOneCandidates: Array<{ path: string; count: number; avgDuration: number }>;
  topSlowRequests: SlowRequestInsight[];
}

export function repeatedEndpoints(entries: XrayEntry[]): Record<string, number> {
  return entries.reduce<Record<string, number>>((acc, entry) => {
    const key = entryPath(entry);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function statusBucket(entry: XrayEntry): string {
  const status = Number(entry.status) || 0;
  if (status >= 500) return '5xx';
  if (status >= 400) return '4xx';
  if (status >= 300) return '3xx';
  if (status >= 200) return '2xx';
  return 'other';
}

export function buildInsightsSummary(entries: XrayEntry[]): InsightsSummary {
  const apis = entries.filter(isApi);
  const errors = apis.filter((entry) => Number(entry.status) >= 400);
  const slow = apis.filter((entry) => duration(entry) > 500);
  const repeated = repeatedEndpoints(apis);
  const statusCounts = apis.reduce<Record<string, number>>((acc, entry) => {
    const bucket = statusBucket(entry);
    acc[bucket] = (acc[bucket] || 0) + 1;
    return acc;
  }, {});

  return {
    requests: apis.length,
    errors: errors.length,
    slow: slow.length,
    avgDuration: apis.length ? apis.reduce((sum, entry) => sum + duration(entry), 0) / apis.length : 0,
    totalBytes: apis.reduce((sum, entry) => sum + (Number(entry.size) || 0), 0),
    statusCounts,
    repeatedEndpoints: repeated,
    nPlusOneCandidates: Object.entries(repeated)
      .filter(([, count]) => count >= 3)
      .map(([path, count]) => {
        const group = apis.filter((entry) => entryPath(entry) === path);
        return {
          path,
          count,
          avgDuration: group.length ? group.reduce((sum, entry) => sum + duration(entry), 0) / group.length : 0,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    topSlowRequests: apis
      .slice()
      .sort((a, b) => duration(b) - duration(a))
      .slice(0, 8)
      .map((entry) => ({
        id: entry.id,
        method: String(entry.method || 'GET'),
        path: entryPath(entry),
        duration: duration(entry),
        status: Number(entry.status) || 0,
      })),
  };
}
