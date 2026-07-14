import type { XrayEntry } from '../types';

export const SESSION_ENTRIES_KEY = 'session_entries';
export const AI_SETTINGS_KEY = 'ai_settings';

const MAX_PERSISTED_ENTRIES = 500;
const MAX_PERSISTED_BODY_CHARS = 20_000;

function trimValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.length > MAX_PERSISTED_BODY_CHARS ? value.slice(0, MAX_PERSISTED_BODY_CHARS) + '…' : value;
  }
  return value;
}

// Produce a bounded, storage-safe snapshot. Large WS frame logs and oversized
// bodies are trimmed so a session stays comfortably under the storage quota.
export function serializeSessionEntries(entries: XrayEntry[]): XrayEntry[] {
  return entries.slice(-MAX_PERSISTED_ENTRIES).map((entry) => {
    const copy: XrayEntry = { ...entry };
    copy.responseRaw = trimValue(entry.responseRaw);
    if (Array.isArray(entry.wsFrames) && entry.wsFrames.length > 50) {
      copy.wsFrames = entry.wsFrames.slice(-50);
    }
    return copy;
  });
}

export function deserializeSessionEntries(value: unknown): XrayEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is XrayEntry => !!entry && typeof entry === 'object' && typeof (entry as XrayEntry).id === 'string')
    .slice(-MAX_PERSISTED_ENTRIES);
}
