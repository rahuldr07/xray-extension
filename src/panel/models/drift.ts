import type { XrayEntry } from '../types';
import { entryGroupPath, isApi } from './entries';
import { entryResponse, safeStringify, schema } from '../utils';

// Structural schema signature used to detect response-shape drift between
// successive calls to the same endpoint.
// Memoized by entry id: detectDrift re-reads baseline signatures on every
// capture, and entry responses never change after they arrive (updates only
// touch timing/frames), so recomputing the JSON.parse + schema walk per
// capture would make the panel jank under polling traffic.
const signatureCache = new Map<string, string>();

export function schemaSignature(entry: XrayEntry): string {
  if (!isApi(entry)) return '';
  const status = Number(entry.status) || 0;
  if (status >= 400 || status === 0) return '';
  const cached = signatureCache.get(entry.id);
  if (cached !== undefined) return cached;
  const response = entryResponse(entry);
  const signature = response == null ? '' : safeStringify(schema(response), 0, 20_000);
  if (signatureCache.size > 4096) signatureCache.clear();
  signatureCache.set(entry.id, signature);
  return signature;
}

export interface DriftResult {
  driftFromId: string | null;
}

// Given a newly-captured entry and the entries that preceded it, decide whether
// its response schema differs from the most recent successful call to the same
// endpoint. Returns the id of the baseline entry it drifted from, if any.
export function detectDrift(entry: XrayEntry, previousEntries: XrayEntry[]): DriftResult {
  const signature = schemaSignature(entry);
  if (!signature) return { driftFromId: null };
  // Group by entryGroupPath (path#operationName) so distinct GraphQL operations
  // sharing one /graphql endpoint are separate baselines, not false drift.
  const path = entryGroupPath(entry);
  for (let i = previousEntries.length - 1; i >= 0; i -= 1) {
    const candidate = previousEntries[i];
    if (!isApi(candidate) || candidate.id === entry.id) continue;
    if (entryGroupPath(candidate) !== path) continue;
    const baseline = schemaSignature(candidate);
    if (!baseline) continue;
    return { driftFromId: baseline === signature ? null : candidate.id };
  }
  return { driftFromId: null };
}
