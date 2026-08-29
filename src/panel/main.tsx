import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { App } from './App';
import { createPanelApi } from './bridge/panelApi';
import { isolatePanelEvents } from './runtime/eventIsolation';
import { installPanelKeyboard } from './runtime/panelKeyboard';
import { usePanelStore } from './store';
import type { XrayAppMode, XrayPanelInitOptions } from './types';
import tokensCss from './styles/tokens.css?inline';
import appCss from './styles.css?inline';

let reactRoot: Root | null = null;
let mountNode: HTMLElement | null = null;
// C-15: the docked panel's shadow root is CLOSED, so page script cannot read the
// rendered captured data through host.shadowRoot. It was open only because
// `host.shadowRoot || attachShadow(...)` needs an open root to re-find one across
// re-mounts; a closed root reports null there and the second attachShadow throws.
// Holding it here does the same job. This module is isolated-world, so the page
// cannot reach the reference. The HUD has always done exactly this.
let shadowRootRef: ShadowRoot | null = null;
let initialized = false;
let currentMode: XrayAppMode = 'hud';
const plainDomTokensCss = tokensCss.replace(/:host/g, '#xray-react-root');

function injectStyles(target: Document | ShadowRoot, useShadowTokens = true): void {
  if (target.querySelector?.('style[data-xray-react-ui]')) return;
  const style = document.createElement('style');
  style.setAttribute('data-xray-react-ui', '1');
  style.textContent = `${useShadowTokens ? tokensCss : plainDomTokensCss}\n${appCss}`;
  const styleTarget = target instanceof Document ? target.head || target.documentElement : target;
  styleTarget.appendChild(style);
}

// Neutralize page CSS that could match our host and either turn it into a
// containing block for the panel's `position: fixed` layout (transform / filter /
// perspective / contain) or clip it (clip-path / overflow / mask). Applied with
// !important so an aggressive page stylesheet can't override it.
const HOST_HARDENING: Record<string, string> = {
  position: 'static',
  inset: 'auto',
  margin: '0',
  padding: '0',
  border: '0',
  transform: 'none',
  filter: 'none',
  perspective: 'none',
  contain: 'none',
  'clip-path': 'none',
  mask: 'none',
  'will-change': 'auto',
  opacity: '1',
  'mix-blend-mode': 'normal',
  'max-width': 'none',
  'max-height': 'none',
  overflow: 'visible',
};

function hardenHost(host: HTMLElement): void {
  for (const [prop, value] of Object.entries(HOST_HARDENING)) {
    host.style.setProperty(prop, value, 'important');
  }
}

function createShadowMount(): HTMLElement {
  let host = document.getElementById('__xray_root__') as HTMLElement | null;
  if (!host) {
    host = document.createElement('div');
    host.id = '__xray_root__';
    document.documentElement.appendChild(host);
  }
  hardenHost(host);
  // Shield the underlying website from the panel's own scroll/click/keyboard.
  isolatePanelEvents(host);
  const root = shadowRootRef ?? host.attachShadow({ mode: 'closed' });
  shadowRootRef = root;
  injectStyles(root);
  let node = root.querySelector('#xray-react-root') as HTMLElement | null;
  if (!node) {
    node = document.createElement('div');
    node.id = 'xray-react-root';
    node.className = 'xray-app-root';
    root.appendChild(node);
  }
  return node;
}

function createPlainMount(options: XrayPanelInitOptions): HTMLElement {
  const parent = options.mountEl || document.body;
  if (options.clearMount) parent.textContent = '';
  injectStyles(document, false);
  let node = parent.querySelector?.('#xray-react-root') as HTMLElement | null;
  if (!node) {
    node = document.createElement('div');
    node.id = 'xray-react-root';
    node.className = 'xray-app-root';
    parent.appendChild(node);
  }
  return node;
}

async function init(options: XrayPanelInitOptions = {}): Promise<void> {
  const alreadyInitialized = initialized;
  if (!initialized) {
    // The panel's shadow root is CLOSED, so nothing else can resolve the focused
    // element inside it — see getSearchRoot below, which exists for the same reason.
    installPanelKeyboard({ dismissible: true, getRoot: () => shadowRootRef ?? document });
  }
  initialized = true;

  if (alreadyInitialized && !options.mountEl && options.useShadow === undefined && options.devtoolsMode === undefined && options.clearMount === undefined) {
    return;
  }

  const useShadow = options.useShadow !== false;
  currentMode = options.devtoolsMode ? 'devtools' : 'hud';
  mountNode = useShadow ? createShadowMount() : createPlainMount(options);
  await usePanelStore.getState().restorePreferences();
  if (typeof options.devtoolsMode === 'boolean' || !usePanelStore.getState().initialized) {
    usePanelStore.getState().setDevtoolsMode(!!options.devtoolsMode);
  }
  usePanelStore.getState().setInitialized(true);

  if (!reactRoot) {
    reactRoot = createRoot(mountNode);
    reactRoot.render(<App mode={currentMode} />);
  } else {
    reactRoot.render(<App mode={currentMode} />);
  }
}

window.XRAY_Panel = createPanelApi({
  initialize: init,
  getSearchRoot: () => shadowRootRef || document,
});

export {};
