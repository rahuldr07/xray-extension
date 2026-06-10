import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { usePanelStore } from './store';
import tokensCss from './styles/tokens.css?inline';
import appCss from './styles.css?inline';
import hudCss from './styles/hud.css?inline';

async function mountHud(): Promise<void> {
  const script = document.currentScript;
  const rootNode = script?.getRootNode?.();
  const shadowRoot = rootNode instanceof ShadowRoot ? rootNode : null;
  if (!shadowRoot) return;

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

  await usePanelStore.getState().restorePreferences();
  usePanelStore.getState().setOpen(true);
  usePanelStore.getState().setDevtoolsMode(false);
  usePanelStore.getState().setInitialized(true);
  createRoot(mount).render(<App mode="hud" />);
}

void mountHud();
