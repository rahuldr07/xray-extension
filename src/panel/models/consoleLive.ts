/**
 * When the Console editor asks the page for live names (spec §3 source 4, §4 session policy),
 * and which answers it keeps. Pure: the editor supplies the sender and the clock.
 */

/** Live completion's debounce once a debugger session is known (spec §3). */
export const LIVE_DEBOUNCE_MS = 120;
/** The pause before the first request may attach the debugger (spec §4). */
export const LIVE_ATTACH_PAUSE_MS = 150;

/**
 * How long to wait after the last edit, and whether the request may attach the debugger. A
 * session already attached is asked after the completion debounce and never re-attached from
 * here; without one, only a draft of at least 2 non-space characters after a 150 ms pause may
 * attach (Chrome then shows its debugging bar) — never focus alone, never one character.
 */
export function liveDelay(draft: string, attached: boolean): { ms: number; attach: boolean } | null {
  if (attached) return { ms: LIVE_DEBOUNCE_MS, attach: false };
  if (String(draft ?? '').replace(/\s/g, '').length < 2) return null;
  return { ms: LIVE_ATTACH_PAUSE_MS, attach: true };
}

/**
 * One request at a time from the editor's point of view: every request gets the next id, and
 * an answer counts only while it is for the latest request (by its echoed `requestId`) — a
 * slow answer to an older draft never replaces a newer list. `cancel()` (the next keystroke)
 * drops whatever is in flight.
 */
export function createLiveChannel(): {
  request<T extends { requestId: number }>(send: (requestId: number) => Promise<T | null>): Promise<T | null>;
  cancel(): void;
} {
  let latest = 0;
  return {
    async request(send) {
      latest += 1;
      const id = latest;
      const answer = await send(id);
      return answer && answer.requestId === id && id === latest ? answer : null;
    },
    cancel() {
      latest += 1;
    },
  };
}
