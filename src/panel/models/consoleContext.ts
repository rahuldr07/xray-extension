import type { XrayEntry } from '../types';

/*
 * What the evaluation engine can see of the capture, mirrored for panel-side
 * decisions that must match it. panel/console.js is a plain content script and
 * cannot import this module, so these are copies of its constants; a unit test
 * (test/unit/consoleContext.test.mjs) reads panel/console.js and fails if they drift.
 */

/** panel/console.js MAX_CONTEXT_ENTRIES: only the newest entries travel with a run. */
export const CONSOLE_CONTEXT_ENTRIES = 300;
/** panel/console.js MAX_SAME_ENDPOINT_FULL: same-endpoint entries that keep their bodies. */
export const CONSOLE_SAME_ENDPOINT_FULL = 10;

function endpointKey(entry: XrayEntry): string {
  return String(entry.urlPath || entry.url || '');
}

/**
 * Whether the runtime's `prev` (the previous call to the selected request's endpoint)
 * will resolve to a response body. Mirrors panel/console.js `_contextPayload` (the
 * last CONSOLE_CONTEXT_ENTRIES entries; bodies only on the current entry and the
 * newest CONSOLE_SAME_ENDPOINT_FULL same-endpoint entries; the current entry appended
 * when it fell out of the window) and shared/console-helpers.js `siblingEntry(…, -1)`.
 * Entries are oldest first.
 */
export function previousCallAvailable(entries: XrayEntry[], selectedId: string | null): boolean {
  if (!selectedId) return false;
  const current = entries.find((entry) => entry.id === selectedId);
  if (!current || current.type !== 'api') return false;
  const key = endpointKey(current);
  if (!key) return false;
  const windowed = entries.slice(-CONSOLE_CONTEXT_ENTRIES);
  const withBody = new Set<string>([current.id]);
  windowed
    .filter((entry) => entry.type === 'api' && endpointKey(entry) === key)
    .slice(-CONSOLE_SAME_ENDPOINT_FULL)
    .forEach((entry) => withBody.add(entry.id));
  const list = windowed.some((entry) => entry.id === current.id) ? windowed : [...windowed, current];
  const index = list.findIndex((entry) => entry.id === current.id);
  for (let i = index - 1; i >= 0; i -= 1) {
    const entry = list[i];
    if (entry.type !== 'api' || endpointKey(entry) !== key) continue;
    return withBody.has(entry.id) && Boolean(entry.responseDecrypted || entry.responseRaw);
  }
  return false;
}
