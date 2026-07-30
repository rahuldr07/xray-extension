import type { XrayEntry } from '../types';

export const SESSION_ENTRIES_KEY = 'session_entries';
export const AI_SETTINGS_KEY = 'ai_settings';

const MAX_PERSISTED_ENTRIES = 500;
const MAX_PERSISTED_BODY_CHARS = 20_000;

const MAX_PERSISTED_ARGS = 20;

// Bound one body-ish value. Strings are sliced; structured values are measured
// by their serialized length and replaced with a truncated preview, because a
// parsed body is just as capable of blowing the quota as a raw one (capture
// allows up to MAX_CAPTURE_TEXT_CHARS per body).
function trimValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.length > MAX_PERSISTED_BODY_CHARS ? value.slice(0, MAX_PERSISTED_BODY_CHARS) + '…' : value;
  }
  if (!value || typeof value !== 'object') return value;
  try {
    const text = JSON.stringify(value);
    if (!text || text.length <= MAX_PERSISTED_BODY_CHARS) return value;
    return text.slice(0, MAX_PERSISTED_BODY_CHARS) + '…';
  } catch {
    // cyclic or otherwise unserializable — chrome.storage would reject it anyway
    return undefined;
  }
}

// Produce a bounded, storage-safe snapshot. Large WS frame logs and oversized
// bodies are trimmed so a session stays comfortably under the storage quota —
// EVERY heavy field has to be covered, not just responseRaw: a 500-entry session
// of decrypted bodies used to serialize to tens of megabytes, and the resulting
// quota rejection was swallowed, leaving the user with no session restore at all.
export function serializeSessionEntries(entries: XrayEntry[]): XrayEntry[] {
  return entries.slice(-MAX_PERSISTED_ENTRIES).map((entry) => {
    const copy: XrayEntry = { ...entry };
    copy.responseRaw = trimValue(entry.responseRaw);
    copy.responseDecrypted = trimValue(entry.responseDecrypted);
    copy.requestBody = trimValue(entry.requestBody);
    copy.logData = trimValue(entry.logData);
    copy.message = typeof entry.message === 'string' ? trimValue(entry.message) as string : entry.message;
    if (Array.isArray(entry.args)) {
      copy.args = entry.args.slice(0, MAX_PERSISTED_ARGS).map(trimValue);
    }
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
