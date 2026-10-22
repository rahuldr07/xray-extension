// The HUD's inline SQL frame (settings.sqlInlineInHud) waits for sql.html to say it loaded. A page
// can block an extension frame (Chrome refusing it, or the frame failing to commit), and then nothing
// arrives: after the timeout the HUD falls back to the "Open SQL client" window card.
//
// The signal travels through the extension runtime: sql.html sends it to the service worker, which
// checks the sender and relays it to the tab's top frame. Nothing is posted to the page's window,
// where event.source would hand the page a WindowProxy to the frame and a listener could swallow it.

export const SQL_FRAME_READY_MESSAGE = 'xray:sql-frame-ready';
export const SQL_FRAME_READY_TIMEOUT_MS = 4000;

export type SqlFrameReadiness = 'waiting' | 'ready' | 'timed-out';

export type SqlFrameReadyEvent = { kind: 'message'; data: unknown } | { kind: 'timeout' };

export function isSqlFrameReadyMessage(data: unknown): boolean {
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
  return isSqlFrameReadyMessage(event.data) ? 'ready' : 'waiting';
}

const EXTENSION_ORIGIN = /^(chrome-extension|devtools):\/\//;

/**
 * Whether sql.html may run where it is framed (`location.ancestorOrigins`). Its own window, the
 * pop-out (chrome-extension:) and the DevTools panel (chrome-extension: inside devtools:) always may;
 * under a web origin anywhere up the chain, only with the inline HUD option on. sql.html is
 * web-accessible for that option, so this keeps a page from embedding the client while it is off.
 */
export function sqlClientAllowedIn(ancestorOrigins: readonly string[], inlineInHud: boolean): boolean {
  return inlineInHud || ancestorOrigins.every((origin) => EXTENSION_ORIGIN.test(origin));
}
