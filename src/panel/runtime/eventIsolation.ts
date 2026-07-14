// Keep interactions with an injected XRAY surface from leaking to the page behind
// it. When the panel/HUD is mounted into a website (Ctrl+Shift+X side panel or the
// floating HUD), its events are composed and would otherwise bubble across the
// shadow boundary and up to the site's own document/window listeners — causing
// ghost page scrolls, clicks landing on the site, and keystrokes triggering the
// site's keyboard shortcuts while you type in the panel.
//
// The fix is boundary-based: the shadow host sits in the page's light DOM, above
// the React mount but below document. Stopping these events in the BUBBLE phase on
// the host means:
//   • the panel has already handled them (React listens on the mount inside the
//     shadow, and the app's Escape/Ctrl+K/toggle run in the document CAPTURE phase,
//     all of which fire before this host bubble listener), and
//   • the page's document/window listeners never see them.
// Only propagation is stopped — defaults (text entry, caret, in-panel scrolling)
// are untouched. Scroll chaining is handled separately by `overscroll-behavior`.

const ISOLATED_EVENTS = [
  'wheel',
  'mousedown', 'mouseup', 'click', 'dblclick', 'contextmenu',
  'pointerdown', 'pointerup',
  'keydown', 'keyup', 'keypress',
  'input', 'beforeinput',
  'touchstart', 'touchmove', 'touchend',
  // Focus events compose and bubble too, so a page's focus/analytics/keylogger
  // listeners would otherwise observe focus moving into the panel's own inputs.
  'focusin', 'focusout',
  // Drag-and-drop inside the panel (e.g. reordering, text selection drags) must
  // not reach the site's drop zones or drag listeners.
  'dragstart', 'drag', 'dragover', 'drop', 'dragend',
  // Copying/cutting/pasting within the panel is the panel's business, not the
  // page's — keep clipboard events from surfacing to site handlers.
  'copy', 'cut', 'paste',
] as const;

// Marks a host so listeners are only attached once, even if init runs again.
const ISOLATED_FLAG = 'xrayIsolated';

export function isolatePanelEvents(host: HTMLElement): void {
  if (host.dataset[ISOLATED_FLAG] === '1') return;
  host.dataset[ISOLATED_FLAG] = '1';
  const stop = (event: Event): void => {
    event.stopPropagation();
  };
  for (const type of ISOLATED_EVENTS) {
    // Bubble phase (capture omitted): fires after the panel handled the event, so
    // the panel stays fully interactive while the page is shielded from it.
    host.addEventListener(type, stop);
  }
}
