import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { usePanelStore } from './store';
import tokensCss from './styles/tokens.css?inline';
import appCss from './styles.css?inline';

const root = document.getElementById('xray-window-root');

if (root) {
  void (async () => {
    const style = document.createElement('style');
    style.setAttribute('data-xray-window-ui', '1');
    style.textContent = `${tokensCss.replace(/:host/g, '#xray-window-root')}\n${appCss}`;
    document.head.appendChild(style);

    root.className = 'xray-app-root';
    await usePanelStore.getState().restorePreferences();
    usePanelStore.getState().setOpen(true);
    usePanelStore.getState().setDevtoolsMode(false);
    usePanelStore.getState().setInitialized(true);
    createRoot(root).render(<App mode="window" />);
  })();
}
