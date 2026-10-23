import React, { useEffect, useRef, useState } from 'react';
import {
  IconAlertTriangle,
  IconChevronDown,
  IconDatabase,
  IconDeviceFloppy,
  IconPlayerPlay,
  IconPlayerStop,
  IconPlus,
  IconX,
} from '@tabler/icons-react';
import { resultSummary, usePanelSqlStore } from '../../sqlStore';
import { PANEL_FONT_VALUES, resolveAccentValue } from '../../models/panelSettings';
import { buildCustomThemeVars } from '../../models/customTheme';
import { EDITOR_PCT_MAX, EDITOR_PCT_MIN, editorPctAfter, RAIL_PX_MAX, RAIL_PX_MIN } from '../../models/sqlLayout';
import { formatFileSize, isMacPlatform, shortcutLabels } from '../../models/sqlUi';
import type { PanelSettings } from '../../types';
import { ModalShell } from '../common/ModalShell';
import { ConnectionRail } from './ConnectionRail';
import { FileOpenInput, OpenFileButton } from './OpenFileButton';
import { SqlDivider } from './SqlDivider';
import { ResultsPane } from './ResultsPane';
import { QuickStarts, SqlEditor } from './SqlEditor';

const iconProps = { size: 16, stroke: 1.8 } as const;

const MAC = isMacPlatform(typeof navigator === 'undefined' ? '' : navigator.platform);
const SHORTCUTS = shortcutLabels(MAC);

function ModeBadge({ readOnly }: { readOnly: boolean }): React.ReactElement {
  return <span className={`xray-sql-mode-badge ${readOnly ? 'read-only' : 'editable'}`}>{readOnly ? 'Read-only' : 'Editable'}</span>;
}

// The open file, as a button that opens a small panel: open another file, and the Read-only switch.
function SourceControl(): React.ReactElement | null {
  const connection = usePanelSqlStore((s) => s.connection);
  const readOnlyChoice = usePanelSqlStore((s) => s.readOnlyChoice);
  const busy = usePanelSqlStore((s) => !!s.running || s.opening);
  const setReadOnly = usePanelSqlStore((s) => s.setReadOnly);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  if (!connection) return null;
  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };
  return (
    <div
      ref={wrapRef}
      className="xray-sql-source-wrap"
      onKeyDown={(e) => {
        if (e.key === 'Escape' && open) {
          e.stopPropagation();
          close();
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className={`xray-sql-source${connection.readOnly ? '' : ' editable'}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        title={connection.name}
        onClick={() => setOpen((v) => !v)}
      >
        <IconDatabase size={15} stroke={1.8} aria-hidden="true" />
        <span className="xray-sql-source-name">{connection.name}</span>{' '}
        <span className="xray-sql-source-meta">· SQLite · {formatFileSize(connection.size)}</span>
        <IconChevronDown size={14} stroke={2} aria-hidden="true" className="xray-sql-source-chevron" />
      </button>
      <ModeBadge readOnly={connection.readOnly} />
      {open && (
        <div className="xray-sql-source-menu" role="dialog" aria-label="Database file">
          <OpenFileButton className="xray-menu-item" label="Open SQLite file…" disabled={busy} onPicked={() => setOpen(false)} />
          <div className="xray-menu-sep" />
          <label className="xray-menu-item xray-sql-check">
            <input type="checkbox" checked={readOnlyChoice} disabled={busy} onChange={(e) => void setReadOnly(e.target.checked)} />
            <span>Read-only</span>
          </label>
          <p className="xray-sql-source-note">Turn off Read-only to run writes; Save writes them back to the file.</p>
        </div>
      )}
    </div>
  );
}

function Toolbar(): React.ReactElement {
  const connection = usePanelSqlStore((s) => s.connection);
  const running = usePanelSqlStore((s) => s.running);
  const opening = usePanelSqlStore((s) => s.opening);
  const dirty = usePanelSqlStore((s) => s.dirty);
  const { run, stop, save } = usePanelSqlStore.getState();
  // Run and Stop swap places: keep keyboard focus on whichever one is showing.
  const actionRef = useRef<HTMLButtonElement | null>(null);
  const focusSwap = useRef(false);
  const isRunning = !!running;
  useEffect(() => {
    if (!focusSwap.current) return;
    focusSwap.current = false;
    actionRef.current?.focus();
  }, [isRunning]);

  return (
    <header className="xray-sql-toolbar">
      <span className="xray-sql-brand">XRAY SQL</span>
      <SourceControl />
      <span className="xray-spacer" />
      {connection && dirty && (
        <button className="xray-btn primary xray-sql-save" disabled={!!running} onClick={() => void save()} title="Write the changes back to the file">
          <span className="xray-sql-save-dot" aria-hidden="true" />
          <IconDeviceFloppy {...iconProps} aria-hidden="true" />
          Save
        </button>
      )}
      {connection &&
        (running ? (
          <button
            ref={actionRef}
            className="xray-btn danger xray-sql-run"
            onClick={(e) => {
              focusSwap.current = document.activeElement === e.currentTarget;
              stop();
            }}
          >
            <IconPlayerStop {...iconProps} aria-hidden="true" />
            Stop
          </button>
        ) : (
          <button
            className="xray-btn primary xray-sql-run"
            ref={actionRef}
            disabled={opening}
            aria-keyshortcuts={MAC ? 'Meta+Enter' : 'Control+Enter'}
            onClick={(e) => {
              focusSwap.current = document.activeElement === e.currentTarget;
              void run('current');
            }}
            title={`Run the selection or the statement at the cursor (${SHORTCUTS.run}). ${SHORTCUTS.runAll} runs all.`}
          >
            <IconPlayerPlay {...iconProps} aria-hidden="true" />
            Run
            <kbd className="xray-sql-kbd" aria-hidden="true">
              {SHORTCUTS.run}
            </kbd>
          </button>
        ))}
    </header>
  );
}

function Welcome(): React.ReactElement {
  const opening = usePanelSqlStore((s) => s.opening);
  const error = usePanelSqlStore((s) => s.error);
  const lastMessage = usePanelSqlStore((s) => s.messages[s.messages.length - 1]);
  return (
    <section className="xray-sql-welcome" aria-labelledby="xray-sql-welcome-title">
      <IconDatabase size={36} stroke={1.4} aria-hidden="true" className="xray-sql-welcome-icon" />
      <h1 id="xray-sql-welcome-title">Open a SQLite database</h1>
      <OpenFileButton className="xray-btn primary xray-sql-welcome-open" disabled={opening} />
      <p className="xray-sql-welcome-drop">or drop a .sqlite / .db file anywhere on this page</p>
      <p className="xray-sql-welcome-note">Files open read-only. Nothing leaves your machine.</p>
      {opening && (
        <p className="xray-sql-welcome-note" role="status">
          Opening…
        </p>
      )}
      {!opening && error && lastMessage && (
        <p className="xray-sql-welcome-error" role="alert">
          {lastMessage}
        </p>
      )}
    </section>
  );
}

function StatusBar(): React.ReactElement {
  const connection = usePanelSqlStore((s) => s.connection);
  const dirty = usePanelSqlStore((s) => s.dirty);
  const result = usePanelSqlStore((s) => s.result);
  const running = usePanelSqlStore((s) => !!s.running);
  const cursor = usePanelSqlStore((s) => s.cursor);
  return (
    <footer className="xray-sql-status">
      {connection ? (
        <>
          <span className="xray-sql-status-file" title={connection.name}>
            {connection.name}
          </span>
          <span className="xray-sql-status-sep" aria-hidden="true">·</span>
          <span>SQLite</span>
          <ModeBadge readOnly={connection.readOnly} />
          {dirty && <span className="xray-sql-connection-meta">unsaved changes</span>}
          <span className="xray-spacer" />
          {running ? <span>Running…</span> : result && <span>{resultSummary(result)}</span>}
          {(running || result) && (
            <span className="xray-sql-status-sep" aria-hidden="true">
              ·
            </span>
          )}
          <span className="xray-sql-status-cursor">
            Ln {cursor.line}, Col {cursor.col}
          </span>
        </>
      ) : (
        <span>No database open</span>
      )}
    </footer>
  );
}

// Editor above, results below, with a draggable divider between them.
function Workspace(): React.ReactElement {
  const editorPct = usePanelSqlStore((s) => s.layout.editorPct);
  const setLayout = usePanelSqlStore((s) => s.setLayout);
  const splitRef = useRef<HTMLDivElement | null>(null);
  const height = () => splitRef.current?.getBoundingClientRect().height ?? 0;
  return (
    <div
      ref={splitRef}
      className="xray-sql-split"
      style={{ gridTemplateRows: `minmax(0, ${editorPct}fr) auto minmax(0, ${100 - editorPct}fr)` }}
    >
      <div className="xray-sql-editor-wrap">
        <SqlEditor />
        <QuickStarts />
      </div>
      <SqlDivider
        orientation="horizontal"
        label="Resize editor and results"
        value={editorPct}
        min={EDITOR_PCT_MIN}
        max={EDITOR_PCT_MAX}
        onStep={(delta) => setLayout({ editorPct: editorPctAfter(editorPct, delta, height()) })}
        onDrag={(_x, y) => {
          const rect = splitRef.current?.getBoundingClientRect();
          if (rect && rect.height > 0) setLayout({ editorPct: ((y - rect.top) / rect.height) * 100 });
        }}
      />
      <ResultsPane />
    </div>
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
  const connected = usePanelSqlStore((s) => !!s.connection);
  const railPx = usePanelSqlStore((s) => s.layout.railPx);
  const setLayout = usePanelSqlStore((s) => s.setLayout);
  const bodyRef = useRef<HTMLDivElement | null>(null);

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
        <div ref={bodyRef} className="xray-sql-body" style={{ gridTemplateColumns: `${railPx}px auto minmax(0, 1fr)` }}>
          <ConnectionRail />
          <SqlDivider
            orientation="vertical"
            label="Resize schema rail"
            value={railPx}
            min={RAIL_PX_MIN}
            max={RAIL_PX_MAX}
            onStep={(delta) => setLayout({ railPx: railPx + delta })}
            onDrag={(x) => {
              const left = bodyRef.current?.getBoundingClientRect().left ?? 0;
              setLayout({ railPx: x - left });
            }}
          />
          <main className="xray-sql-main" aria-label="SQL workspace">
            {connected ? (
              <>
                <EditorTabs />
                <Workspace />
              </>
            ) : (
              <Welcome />
            )}
          </main>
        </div>
        <StatusBar />
      </div>
      <FileOpenInput />
      <Dialogs />
    </div>
  );
}
