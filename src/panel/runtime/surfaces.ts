// Switching between XRAY's user-facing surfaces.
//
// The header's mode switcher owned this logic privately, which made the three surfaces
// reachable only by clicking those icons — nothing in the command palette offered them,
// so on a narrow panel where the switcher does not fit they became unreachable
// entirely. Both callers now share one implementation.

/** Fallback text shown when the extension runtime is not reachable from this surface. */
export interface SurfaceMessenger {
  showToast(message: string): void;
}

function sendRuntimeMessage(message: Record<string, unknown>, fallback: string, io: SurfaceMessenger): void {
  if (typeof chrome !== 'undefined' && chrome?.runtime?.sendMessage) {
    try {
      chrome.runtime.sendMessage(message, () => void 0);
      return;
    } catch {
      // The runtime can be gone after an extension reload; fall through to the toast.
    }
  }
  io.showToast(fallback);
}

/** Collapse the HUD if it is showing, otherwise ask the background to open it here. */
export function toggleHudSurface(io: SurfaceMessenger): void {
  if (window.XRAY_HUD?.isVisible?.()) {
    window.XRAY_HUD.collapse();
    return;
  }
  sendRuntimeMessage({ type: 'XRAY_HUD_TOGGLE_ACTIVE' }, 'Open a normal page tab, then use XRAY from the extension icon.', io);
}

/** Open the pop-out window. */
export function openWindowSurface(io: SurfaceMessenger): void {
  sendRuntimeMessage({ type: 'XRAY_OPEN_WINDOW' }, 'Pop-out window is available when the extension runtime is loaded.', io);
}

/**
 * There is no API to open a DevTools panel programmatically — the user has to open
 * DevTools themselves — so this is a hint, not a navigation.
 */
export function devtoolsHint(io: SurfaceMessenger): void {
  io.showToast('Press F12, then open the XRAY tab.');
}
