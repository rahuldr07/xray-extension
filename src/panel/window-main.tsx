import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { usePanelStore } from './store';
import { decodeTheme, themePackageToSettings } from './models/customTheme';
import tokensCss from './styles/tokens.css?inline';
import appCss from './styles.css?inline';

const root = document.getElementById('xray-window-root');

// A shared theme can travel as a URL hash: window.html#theme=<code>. Applying it
// here only mutates panel settings — it never touches the page or the runtime.
function applyThemeFromHash(): void {
  try {
    const hash = window.location.hash || '';
    if (!/theme=/.test(hash)) return;
    const pkg = decodeTheme(hash);
    if (!pkg) return;
    usePanelStore.getState().updateSettings(themePackageToSettings(pkg));
  } catch { /* ignore malformed hash */ }
}

if (root) {
  void (async () => {
    const style = document.createElement('style');
    style.setAttribute('data-xray-window-ui', '1');
    style.textContent = `${tokensCss.replace(/:host/g, '#xray-window-root')}\n${appCss}`;
    document.head.appendChild(style);

    root.className = 'xray-app-root';
    await usePanelStore.getState().restorePreferences();
    applyThemeFromHash();
    usePanelStore.getState().setOpen(true);
    usePanelStore.getState().setDevtoolsMode(false);
    usePanelStore.getState().setInitialized(true);
    createRoot(root).render(<App mode="window" />);
  })();
}
