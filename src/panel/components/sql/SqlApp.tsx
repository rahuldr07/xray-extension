import React, { useEffect, useRef, useState } from 'react';
import { IconAlertTriangle, IconDeviceFloppy, IconPlayerPlay, IconPlayerStop, IconPlus, IconX } from '@tabler/icons-react';
import { usePanelSqlStore } from '../../sqlStore';
import { PANEL_FONT_VALUES, resolveAccentValue } from '../../models/panelSettings';
import { buildCustomThemeVars } from '../../models/customTheme';
import { clampMaxRows } from '../../models/sqlValues';
import type { PanelSettings } from '../../types';
import { ModalShell } from '../common/ModalShell';
import { ConnectionRail } from './ConnectionRail';
import { OpenFileButton } from './OpenFileButton';
import { ResultsPane } from './ResultsPane';
import { SqlEditor } from './SqlEditor';

const iconProps = { size: 16, stroke: 1.8 } as const;

function formatSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function MaxRowsInput(): React.ReactElement {
  const maxRows = usePanelSqlStore((s) => s.tabs.find((t) => t.id === s.activeTabId)?.maxRows ?? 1000);
  const setMaxRows = usePanelSqlStore((s) => s.setMaxRows);
  const [draft, setDraft] = useState(String(maxRows));
  const [shown, setShown] = useState(maxRows);
  // A tab switch or a clamp changes the stored value: reset the draft during render.
  if (shown !== maxRows) {
    setShown(maxRows);
    setDraft(String(maxRows));
  }

  function commit(): void {
    const value = clampMaxRows(Number(draft));
    setMaxRows(value);
    setDraft(String(value));
  }

  return (
    <label className="xray-sql-field">
      <span>Max rows</span>
      <input
        className="xray-input xray-sql-max-rows"
        type="number"
        min={1}
        max={50000}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
        }}
      />
    </label>
  );
}

function Toolbar(): React.ReactElement {
  const connection = usePanelSqlStore((s) => s.connection);
  const readOnlyChoice = usePanelSqlStore((s) => s.readOnlyChoice);
  const running = usePanelSqlStore((s) => s.running);
  const opening = usePanelSqlStore((s) => s.opening);
  const dirty = usePanelSqlStore((s) => s.dirty);
  const { setReadOnly, run, stop, save } = usePanelSqlStore.getState();
  const readOnly = readOnlyChoice;

  return (
    <header className="xray-sql-toolbar">
      <span className="xray-sql-brand">XRAY SQL</span>
      <OpenFileButton disabled={!!running || opening} />
      <label className="xray-sql-field xray-sql-check">
        <input type="checkbox" checked={readOnly} disabled={!!running || opening} onChange={(e) => void setReadOnly(e.target.checked)} />
        <span>Read-only</span>
      </label>
      {connection && (
        <span className="xray-sql-connection" title={connection.name}>
          <span className="xray-sql-connection-name">{connection.name}</span>
          <span className="xray-sql-connection-meta">
            {formatSize(connection.size)}
            {dirty ? ' · unsaved changes' : ''}
          </span>
        </span>
      )}
      <span className="xray-spacer" />
      <MaxRowsInput />
      <button className="xray-btn primary" disabled={!connection || !!running || opening} onClick={() => void run('current')} title="Run the selection or the statement at the cursor (Ctrl+Enter). Ctrl+Shift+Enter runs all.">
        <IconPlayerPlay {...iconProps} />
        Run
      </button>
      <button className="xray-btn" disabled={!running} onClick={stop}>
        <IconPlayerStop {...iconProps} />
        Stop
      </button>
      <button className="xray-btn" disabled={!connection || !dirty || !!running} onClick={() => void save()}>
        <IconDeviceFloppy {...iconProps} />
        Save
      </button>
    </header>
  );
}

function EditorTabs(): React.ReactElement {
  const tabs = usePanelSqlStore((s) => s.tabs);
  const activeTabId = usePanelSqlStore((s) => s.activeTabId);
  const runningTab = usePanelSqlStore((s) => s.running?.tabId);
  const { setActiveTab, addTab, closeTab } = usePanelSqlStore.getState();

  return (
    <div className="xray-sql-editor-tabs" role="tablist" aria-label="Queries">
      {tabs.map((tab) => (
        <div key={tab.id} className={`xray-sql-editor-tab${tab.id === activeTabId ? ' active' : ''}`}>
          <button role="tab" aria-selected={tab.id === activeTabId} className="xray-sql-editor-tab-name" onClick={() => setActiveTab(tab.id)} title={tab.title}>
            {tab.title}
          </button>
          <button className="xray-sql-editor-tab-close" aria-label={`Close ${tab.title}`} disabled={runningTab === tab.id} onClick={() => closeTab(tab.id)}>
            <IconX size={12} stroke={2} />
          </button>
        </div>
      ))}
      <button className="xray-icon-btn xray-sql-add-tab" aria-label="New query tab" title="New query tab" onClick={addTab}>
        <IconPlus {...iconProps} />
      </button>
    </div>
  );
}

// "Run could not parse?" reads badly; the classifier's reason is phrased for the other kinds.
function confirmTitle(reason: string): string {
  return reason === 'could not parse' ? 'Run a statement that could not be parsed?' : `Run ${reason}?`;
}

function Dialogs(): React.ReactElement | null {
  const pendingConfirm = usePanelSqlStore((s) => s.pendingConfirm);
  const pendingPrompt = usePanelSqlStore((s) => s.pendingPrompt);
  const { confirmPending, cancelPending, confirmPrompt, cancelPrompt } = usePanelSqlStore.getState();
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  if (pendingConfirm) {
    return (
      <ModalShell
        title={confirmTitle(pendingConfirm.reason)}
        icon={<IconAlertTriangle size={17} stroke={1.8} />}
        className="xray-confirm-modal"
        initialFocusRef={cancelRef}
        onClose={cancelPending}
        footer={
          <>
            <span className="xray-spacer" />
            <button ref={cancelRef} className="xray-btn" onClick={cancelPending}>
              Cancel
            </button>
            <button className="xray-btn danger" onClick={() => void confirmPending()}>
              Run anyway
            </button>
          </>
        }
      >
        <div className="xray-modal-body">
          <pre className="xray-sql-confirm-sql">{pendingConfirm.sql}</pre>
        </div>
      </ModalShell>
    );
  }
  if (pendingPrompt) {
    return (
      <ModalShell
        title={pendingPrompt.title}
        icon={<IconAlertTriangle size={17} stroke={1.8} />}
        className="xray-confirm-modal"
        initialFocusRef={cancelRef}
        onClose={cancelPrompt}
        footer={
          <>
            <span className="xray-spacer" />
            <button ref={cancelRef} className="xray-btn" onClick={cancelPrompt}>
              Cancel
            </button>
            <button className="xray-btn danger" onClick={() => void confirmPrompt()}>
              {pendingPrompt.confirmLabel}
            </button>
          </>
        }
      >
        <div className="xray-modal-body">
          <p className="xray-confirm-message">{pendingPrompt.message}</p>
        </div>
      </ModalShell>
    );
  }
  return null;
}

export function SqlApp({ settings }: { settings: PanelSettings }): React.ReactElement {
  const dirty = usePanelSqlStore((s) => s.dirty);

  // Unsaved writes live only in the worker; leaving the page would drop them silently.
  useEffect(() => {
    if (!dirty) return undefined;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  // Same theme scope as App.tsx: tokens live on this wrapper, and sql.html reads the theme
  // class back with :has() for the document background.
  const accent = resolveAccentValue(settings);
  const themeVars = {
    ...(accent ? { '--xray-accent': accent } : {}),
    '--xray-font': PANEL_FONT_VALUES[settings.font],
    '--xray-radius': `${settings.radius}px`,
    ...(settings.theme === 'custom' ? buildCustomThemeVars(settings.customTheme) : {}),
  } as React.CSSProperties;

  return (
    <div className={`xray-theme-scope xray-theme-${settings.theme} xray-font-${settings.font}`} style={themeVars}>
      <div className="xray-sql-app">
        <Toolbar />
        <div className="xray-sql-body">
          <ConnectionRail />
          <main className="xray-sql-main" aria-label="SQL workspace">
            <EditorTabs />
            <SqlEditor />
            <ResultsPane />
          </main>
        </div>
      </div>
      <Dialogs />
    </div>
  );
}
