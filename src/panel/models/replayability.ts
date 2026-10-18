import type { XrayEntry } from '../types';

const STREAM_SOURCES = new Set(['ws', 'sse', 'websocket', 'eventsource']);
const STREAM_METHODS = new Set(['ws', 'wss', 'sse', 'websocket', 'eventsource']);

type ReplayabilityFailure = 'entry' | 'stream' | 'url' | 'malformed-url';

function failureFor(entry: XrayEntry | null): ReplayabilityFailure | null {
  if (!entry || entry.type !== 'api') return 'entry';
  if (STREAM_SOURCES.has(String(entry.source || '').toLowerCase())) return 'stream';
  if (STREAM_METHODS.has(String(entry.method || '').toLowerCase())) return 'stream';

  const rawUrl = typeof entry.url === 'string' ? entry.url.trim() : '';
  if (!rawUrl) return 'url';

  try {
    const url = new URL(rawUrl);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return 'url';
  } catch {
    return 'malformed-url';
  }
  return null;
}

export function isReplayableEntry(entry: XrayEntry | null): boolean {
  return failureFor(entry) === null;
}

export function replayabilityReason(entry: XrayEntry | null): string | null {
  switch (failureFor(entry)) {
    case null: return null;
    case 'entry': return 'Only API entries can be replayed.';
    case 'stream': return 'Streaming entries cannot be replayed.';
    case 'malformed-url': return 'Replay URL is malformed.';
    case 'url': return 'Replay requires an HTTP(S) URL.';
  }
}
