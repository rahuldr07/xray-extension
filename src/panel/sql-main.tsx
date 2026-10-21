import React from 'react';
import { createRoot } from 'react-dom/client';
import { SqlApp } from './components/sql/SqlApp';
import { flushSqlPersistence, loadSqlStorage } from './sqlStore';
import { getStoredValue } from './runtime/storageBridge';
import { applyPanelPreferences, REACT_PANEL_PREFERENCES_KEY, type SerializedPanelPreferences } from './models/panelPersistence';
import { DEFAULT_PANEL_SETTINGS } from './models/panelSettings';
import type { PanelSettings } from './types';
import tokensCss from './styles/tokens.css?inline';
import appCss from './styles.css?inline';
import sqlCss from './styles/sql.css?inline';

const root = document.getElementById('xray-sql-root');

// The SQL page reads the panel's stored preferences for theme, accent and font, as the pop-out
// does, but without the panel store: that would pull the capture console into this bundle.
async function readSettings(): Promise<PanelSettings> {
  try {
    const preferences = await getStoredValue<SerializedPanelPreferences>(REACT_PANEL_PREFERENCES_KEY, {});
    return applyPanelPreferences(preferences ?? {}).settings ?? DEFAULT_PANEL_SETTINGS;
  } catch {
    return DEFAULT_PANEL_SETTINGS;
  }
}

if (root) {
  void (async () => {
    const style = document.createElement('style');
    style.setAttribute('data-xray-sql-ui', '1');
    style.textContent = `${tokensCss.replace(/:host/g, '#xray-sql-root')}\n${appCss}\n${sqlCss}`;
    document.head.appendChild(style);

    root.className = 'xray-app-root';
    const [settings] = await Promise.all([readSettings(), loadSqlStorage()]);
    window.addEventListener('pagehide', flushSqlPersistence);
    createRoot(root).render(<SqlApp settings={settings} />);
  })();
}
