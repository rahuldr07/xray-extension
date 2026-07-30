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

// entryGroupPath rebuilds a string from the URL every call; the grouping of an
// entry never changes after capture, so memoize it the same way signatures are.
const pathCache = new Map<string, string>();

function groupPath(entry: XrayEntry): string {
  const cached = pathCache.get(entry.id);
  if (cached !== undefined) return cached;
  const path = entryGroupPath(entry);
  if (pathCache.size > 4096) pathCache.clear();
  pathCache.set(entry.id, path);
  return path;
}

export interface DriftResult {
  driftFromId: string | null;
}

// The most recent signature-bearing entry per group path — exactly what the
// backwards scan below looks for, precomputed. Ingest builds one per batch and
// notes each new entry into it, so a 50-entry batch costs one pass over the
// buffer instead of 50 full scans of it (unique URLs never match, so the scan
// ran to completion every single time).
export type DriftIndex = Map<string, XrayEntry>;

export function buildDriftIndex(entries: XrayEntry[]): DriftIndex {
  const index: DriftIndex = new Map();
  for (const entry of entries) noteDriftEntry(index, entry);
  return index;
}

export function noteDriftEntry(index: DriftIndex, entry: XrayEntry): void {
  // Entries without a usable signature (errors, unparseable bodies) are skipped
  // rather than recorded, so they can't mask an older baseline the way a plain
  // "last entry per path" index would.
  if (!isApi(entry) || !schemaSignature(entry)) return;
  index.set(groupPath(entry), entry);
}

// Given a newly-captured entry and the entries that preceded it, decide whether
// its response schema differs from the most recent successful call to the same
// endpoint. Returns the id of the baseline entry it drifted from, if any.
export function detectDrift(entry: XrayEntry, previousEntries: XrayEntry[], index?: DriftIndex): DriftResult {
  const signature = schemaSignature(entry);
  if (!signature) return { driftFromId: null };
  // Group by entryGroupPath (path#operationName) so distinct GraphQL operations
  // sharing one /graphql endpoint are separate baselines, not false drift.
  const path = groupPath(entry);
  if (index) {
    const candidate = index.get(path);
    if (!candidate || candidate.id === entry.id) return { driftFromId: null };
    const baseline = schemaSignature(candidate);
    return { driftFromId: !baseline || baseline === signature ? null : candidate.id };
  }
  for (let i = previousEntries.length - 1; i >= 0; i -= 1) {
    const candidate = previousEntries[i];
    if (!isApi(candidate) || candidate.id === entry.id) continue;
    if (groupPath(candidate) !== path) continue;
    const baseline = schemaSignature(candidate);
    if (!baseline) continue;
    return { driftFromId: baseline === signature ? null : candidate.id };
  }
  return { driftFromId: null };
}
