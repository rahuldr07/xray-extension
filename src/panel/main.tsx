import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { App } from './App';
import { createPanelApi } from './bridge/panelApi';
import { usePanelStore } from './store';
import type { XrayAppMode, XrayPanelInitOptions } from './types';
import tokensCss from './styles/tokens.css?inline';
import appCss from './styles.css?inline';

let reactRoot: Root | null = null;
let mountNode: HTMLElement | null = null;
let shadowHost: HTMLElement | null = null;
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

function createShadowMount(): HTMLElement {
  let host = document.getElementById('__xray_root__') as HTMLElement | null;
  if (!host) {
    host = document.createElement('div');
    host.id = '__xray_root__';
    document.documentElement.appendChild(host);
  }
  shadowHost = host;
  const root = host.shadowRoot || host.attachShadow({ mode: 'open' });
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

function installKeyboard(): void {
  document.addEventListener('keydown', (event) => {
    const key = event.key?.toLowerCase();
    if ((event.ctrlKey || event.metaKey) && key === 'k') {
      event.preventDefault();
      usePanelStore.getState().setCommandOpen(true);
    }
    if (key === 'escape') {
      const store = usePanelStore.getState();
      if (store.pendingConfirmation) store.closeConfirmation();
      else if (store.exportOpen) store.setExportOpen(false);
      else if (store.commandOpen) store.setCommandOpen(false);
      else if (store.settingsOpen) store.setSettingsOpen(false);
    }
  }, true);
}

async function init(options: XrayPanelInitOptions = {}): Promise<void> {
  const alreadyInitialized = initialized;
  if (!initialized) {
    installKeyboard();
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
  getSearchRoot: () => shadowHost?.shadowRoot || document,
});

export {};
