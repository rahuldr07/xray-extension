// The HUD's inline SQL frame (settings.sqlInlineInHud) waits for sql.html to say it loaded. A page
// can block an extension frame (Chrome refusing it, or the frame failing to commit), and then nothing
// arrives: after the timeout the HUD falls back to the "Open SQL client" window card.

export const SQL_FRAME_READY_MESSAGE = 'xray:sql-ready';
export const SQL_FRAME_READY_TIMEOUT_MS = 4000;

export type SqlFrameReadiness = 'waiting' | 'ready' | 'timed-out';

export type SqlFrameReadyEvent =
  { kind: 'message'; source: unknown; data: unknown; frameWindow: unknown } | { kind: 'timeout' };

/** The ready signal counts only from the frame's own window: the page can post to the HUD's window too. */
export function isSqlFrameReadyMessage(source: unknown, data: unknown, frameWindow: unknown): boolean {
  if (frameWindow === null || frameWindow === undefined || source !== frameWindow) return false;
  return (
    typeof data === 'object' && data !== null && (data as { type?: unknown }).type === SQL_FRAME_READY_MESSAGE
  );
}

/** Ready and timed-out are both final: a late timer never removes a loaded client, nor a late message the card. */
export function nextSqlFrameReadiness(
  state: SqlFrameReadiness,
  event: SqlFrameReadyEvent,
): SqlFrameReadiness {
  if (state !== 'waiting') return state;
  if (event.kind === 'timeout') return 'timed-out';
  return isSqlFrameReadyMessage(event.source, event.data, event.frameWindow) ? 'ready' : 'waiting';
}
