import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { isolatePanelEvents } from './runtime/eventIsolation';
import { usePanelStore } from './store';
import type { XrayEntry } from './types';
import tokensCss from './styles/tokens.css?inline';
import appCss from './styles.css?inline';
import hudCss from './styles/hud.css?inline';

// The HUD bundle has its own store instance, so it must listen for capture
// events directly (unlike the panel bundle, which content.js feeds). postMessage
// events cross worlds; the token lives on the MAIN world window (frozen by the
// interceptor) or is mirrored onto the isolated world by content.js.
function installHudCaptureListener(): void {
  const w = window as unknown as { __xray_hud_capture__?: boolean; __XRAY_BRIDGE_TOKEN__?: string; __XRAY_bridgeToken?: string };
  if (w.__xray_hud_capture__) return;
  w.__xray_hud_capture__ = true;

  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    const data = event.data;
    if (!data || !data.__xray_capture__) return;
    // Hard-require the token like content.js does — without it, any page
    // script could postMessage forged entries straight into the HUD store.
    const token = w.__XRAY_BRIDGE_TOKEN__ || w.__XRAY_bridgeToken;
    if (!token || data.token !== token) return;
    const store = usePanelStore.getState();

    if (data.update && data.entry) {
      store.updateEntry(data.entry as Partial<XrayEntry> & { id: string });
      return;
    }
    if (data.batch && Array.isArray(data.entries)) {
      // One store commit per capture batch — per-item addEntry defeated the
      // batching the panel bundle gets via content.js.
      store.addEntries((data.entries as XrayEntry[]).filter(Boolean));
      return;
    }
    if (data.entry) store.addEntry(data.entry as XrayEntry);
  });
}

async function mountHud(): Promise<void> {
  // hud-mount.js imports this bundle into the isolated world and passes the
  // closed shadow root via the isolated-world window (document.currentScript
  // is null for scripts in shadow trees, and null for modules, so it can never
  // be the primary channel). The getRootNode path stays as a fallback for a
  // direct <script> embed in a document tree.
  const w = window as unknown as { __xrayHudShadow?: unknown; __xrayHudRemount?: () => void };
  const script = document.currentScript;
  const rootNode = script?.getRootNode?.();
  const shadowRoot =
    w.__xrayHudShadow instanceof ShadowRoot
      ? w.__xrayHudShadow
      : rootNode instanceof ShadowRoot
        ? rootNode
        : null;
  if (!shadowRoot) return;
  // Shield the page under the floating HUD from its scroll/click/keyboard.
  if (shadowRoot.host instanceof HTMLElement) isolatePanelEvents(shadowRoot.host);

  if (!shadowRoot.querySelector('style[data-xray-hud-ui]')) {
    const style = document.createElement('style');
    style.setAttribute('data-xray-hud-ui', '1');
    style.textContent = `${tokensCss}\n${appCss}\n${hudCss}`;
    shadowRoot.appendChild(style);
  }

  let mount = shadowRoot.querySelector('#xray-hud-root') as HTMLElement | null;
  if (!mount) {
    mount = document.createElement('div');
    mount.id = 'xray-hud-root';
    mount.className = 'xray-app-root';
    shadowRoot.appendChild(mount);
  }

  installHudCaptureListener();
  await usePanelStore.getState().restorePreferences();
  usePanelStore.getState().setOpen(true);
  usePanelStore.getState().setDevtoolsMode(false);
  usePanelStore.getState().setInitialized(true);
  createRoot(mount).render(<App mode="hud" />);
  syncHostTheme(shadowRoot);
}

// The HUD frame (:host) is an ancestor of .xray-panel, so the theme/radius vars
// PanelShell sets inline on the panel don't reach it. Mirror the resolved values
// onto the host element so the frame's corners, border, and background always
// match the active theme and radius (works for presets and custom themes alike).
const HOST_MIRROR_VARS = ['--xray-radius', '--xray-bg', '--xray-surface', '--xray-surface2', '--xray-text', '--xray-accent'];

let unsubscribeHostTheme: (() => void) | null = null;

function syncHostTheme(shadowRoot: ShadowRoot): void {
  const host = shadowRoot.host;
  if (!(host instanceof HTMLElement)) return;
  const apply = (): void => {
    const panel = shadowRoot.querySelector('.xray-panel') as HTMLElement | null;
    if (!panel) return;
    const cs = getComputedStyle(panel);
    for (const name of HOST_MIRROR_VARS) {
      const value = cs.getPropertyValue(name).trim();
      if (value) host.style.setProperty(name, value);
    }
  };
  // Coalesce to one mirror per frame: every capture commits to the store, and a
  // getComputedStyle per commit forces a style recalc per captured request.
  let frame = 0;
  const schedule = (): void => {
    if (frame) return;
    frame = requestAnimationFrame(() => { frame = 0; apply(); });
  };
  requestAnimationFrame(() => requestAnimationFrame(apply));
  // Toggling the HUD destroys the host and mounts a fresh shadow root, so drop
  // the previous subscription first — otherwise every re-open leaves another
  // live subscriber mirroring vars onto a detached host forever.
  unsubscribeHostTheme?.();
  unsubscribeHostTheme = usePanelStore.subscribe(schedule);
}

(window as unknown as { __xrayHudRemount?: () => void }).__xrayHudRemount = () => {
  void mountHud();
};
void mountHud();
