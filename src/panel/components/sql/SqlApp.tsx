import React, { useEffect, useRef, useState } from 'react';
import {
  IconAlertTriangle,
  IconChevronDown,
  IconDatabase,
  IconDeviceFloppy,
  IconDots,
  IconLock,
  IconLockOpen,
  IconPlayerPlay,
  IconPlayerStop,
  IconPlugConnected,
  IconPlus,
  IconServer2,
  IconX,
} from '@tabler/icons-react';
import { usePanelSqlStore } from '../../sqlStore';
import { PANEL_FONT_VALUES, resolveAccentValue } from '../../models/panelSettings';
import { buildCustomThemeVars } from '../../models/customTheme';
import { DEFAULT_SQL_LAYOUT, EDITOR_PCT_MAX, EDITOR_PCT_MIN, editorPctAfter, RAIL_PX_MAX, RAIL_PX_MIN } from '../../models/sqlLayout';
import { formatFileSize, isMacPlatform, shortcutLabels } from '../../models/sqlUi';
import { lastOpenedLabel } from '../../models/sqlRecent';
import { forgetRecentFile, loadRecentFiles, readRecentFile, recentFilesAvailable, type RecentSqlFile } from '../../runtime/recentFiles';
import type { PanelSettings } from '../../types';
import { ModalShell } from '../common/ModalShell';
import { shortServerVersion, type PageProfile } from '../../models/sqlProfiles';
import { ConnectionRail } from './ConnectionRail';
import { ConnectionUiProvider, connectSaved, engineLabel, useConnectionUi } from './ConnectionDialog';
import { HelperInstallCard } from './HelperInstallCard';
import { FileOpenInput, OpenFileButton, requestOpenFile } from './OpenFileButton';
import { SqlDivider } from './SqlDivider';
import { ResultsPane } from './ResultsPane';
import { QuickStarts, SqlEditor } from './SqlEditor';

const iconProps = { size: 16, stroke: 1.8 } as const;

const MAC = isMacPlatform(typeof navigator === 'undefined' ? '' : navigator.platform);
const SHORTCUTS = shortcutLabels(MAC);

// The Read-only switch, shown as the header's mode badge (TablePlus-style safe mode). Its name stays
// "Read-only" and aria-checked carries the state; the visible label says the current mode.
function ReadOnlySwitch(): React.ReactElement {
  const readOnly = usePanelSqlStore((s) => s.readOnlyChoice);
  const busy = usePanelSqlStore((s) => !!s.running || s.opening || !!s.pendingConfirm || !!s.pendingPrompt);
  const setReadOnly = usePanelSqlStore((s) => s.setReadOnly);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={readOnly}
      aria-label="Read-only"
      className={`xray-sql-mode-badge ${readOnly ? 'read-only' : 'editable'}`}
      disabled={busy}
      title={readOnly ? 'Read-only: writes are refused. Click to allow writes.' : 'Editable: writes run, and Save writes them to the file. Click to make it read-only.'}
      onClick={() => void setReadOnly(!readOnly)}
    >
      {readOnly ? <IconLock size={11} stroke={2.2} aria-hidden="true" /> : <IconLockOpen size={11} stroke={2.2} aria-hidden="true" />}
      {readOnly ? 'Read-only' : 'Editable'}
    </button>
  );
}

// Recent files in the source menu: the same list as the welcome screen, newest first.
function MenuRecentFiles({ disabled, onPicked }: { disabled: boolean; onPicked(): void }): React.ReactElement | null {
  const [list, setList] = useState<RecentSqlFile[]>([]);
  const [failed, setFailed] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    loadRecentFiles()
      .then((files) => {
        if (live) setList(files.slice(0, 5));
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, []);
  if (!list.length) return null;
  async function open(entry: RecentSqlFile): Promise<void> {
    const read = await readRecentFile(entry);
    if ('error' in read) {
      setFailed(`${entry.name}: ${read.error}`);
      return;
    }
    onPicked();
    await usePanelSqlStore.getState().openFile(read.file, entry.handle);
  }
  return (
    <>
      {list.map((entry) => (
        <button
          key={`${entry.name}:${entry.size}`}
          type="button"
          className="xray-menu-item xray-sql-menu-entry"
          disabled={disabled}
          onClick={() => void open(entry)}
        >
          <IconDatabase size={14} stroke={1.8} aria-hidden="true" />
          <span className="xray-sql-menu-entry-name">{entry.name}</span>
          <span className="xray-sql-menu-entry-meta">{formatFileSize(entry.size)}</span>
        </button>
      ))}
      {failed && (
        <p className="xray-sql-menu-error" role="alert">
          {failed}
        </p>
      )}
    </>
  );
}

function profileMeta(p: PageProfile): string {
  return `${engineLabel(p.engine)} · ${p.host}`;
}

// Saved connections in the source menu, each with Edit and Delete behind "…", then New connection.
function MenuConnections({ disabled, onDone }: { disabled: boolean; onDone(): void }): React.ReactElement {
  const profiles = usePanelSqlStore((s) => s.profiles);
  const current = usePanelSqlStore((s) => (s.connection?.kind === 'remote' ? s.connection.profileId : null));
  const ui = useConnectionUi();
  const [actionsFor, setActionsFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  return (
    <>
      {profiles.map((p) => (
        <div key={p.id} className="xray-sql-menu-conn">
          <button
            type="button"
            className={`xray-menu-item xray-sql-menu-entry${current === p.id ? ' current' : ''}`}
            disabled={disabled}
            aria-current={current === p.id || undefined}
            onClick={() => {
              void connectSaved(p.id, onDone).then(setError);
            }}
          >
            <IconServer2 size={14} stroke={1.8} aria-hidden="true" />
            <span className="xray-sql-menu-entry-text">
              <span className="xray-sql-menu-entry-name">{p.name}</span>
              <span className="xray-sql-menu-entry-meta">{profileMeta(p)}</span>
            </span>
          </button>
          <button
            type="button"
            className="xray-icon-btn xray-sql-menu-more"
            aria-label={`More actions for ${p.name}`}
            aria-haspopup="menu"
            aria-expanded={actionsFor === p.id}
            onClick={() => setActionsFor((id) => (id === p.id ? null : p.id))}
          >
            <IconDots size={14} stroke={1.8} />
          </button>
          {actionsFor === p.id && (
            <div role="menu" aria-label={`${p.name} actions`} className="xray-sql-menu-actions">
              <button
                type="button"
                role="menuitem"
                className="xray-menu-item"
                onClick={() => {
                  onDone();
                  ui.editConnection(p);
                }}
              >
                Edit
              </button>
              <button
                type="button"
                role="menuitem"
                className="xray-menu-item xray-sql-menu-danger"
                onClick={() => {
                  onDone();
                  ui.deleteConnection(p);
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      ))}
      {error && (
        <p className="xray-sql-menu-error" role="alert">
          {error}
        </p>
      )}
      <button
        type="button"
        className="xray-menu-item"
        disabled={disabled}
        onClick={() => {
          onDone();
          ui.newConnection();
        }}
      >
        <IconPlus size={14} stroke={1.8} aria-hidden="true" />
        New connection…
      </button>
    </>
  );
}

// The open file, as a button that opens a small panel to open another file.
function SourceControl(): React.ReactElement | null {
  const connection = usePanelSqlStore((s) => s.connection);
  const busy = usePanelSqlStore((s) => !!s.running || s.opening);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return undefined;
    // Focus moves into the panel when it opens.
    menuRef.current?.querySelector<HTMLElement>('button:not([disabled])')?.focus();
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
      onBlur={(e) => {
        // Tabbing out of the panel closes it.
        if (open && !wrapRef.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
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
        <span className="xray-sql-source-meta">
          {connection.kind === 'sqlite'
            ? `· SQLite · ${formatFileSize(connection.size)}`
            : `· ${shortServerVersion(connection.serverVersion) || engineLabel(connection.engine)} · ${connection.host}`}
        </span>
        <IconChevronDown size={14} stroke={2} aria-hidden="true" className="xray-sql-source-chevron" />
      </button>
      <ReadOnlySwitch />
      {open && (
        <div ref={menuRef} className="xray-sql-source-menu" role="dialog" aria-label="Databases">
          <div role="group" aria-labelledby="xray-sql-menu-files" className="xray-sql-menu-group">
            <h2 id="xray-sql-menu-files" className="xray-sql-menu-heading">
              Files
            </h2>
            <OpenFileButton
              className="xray-menu-item"
              label="Open SQLite file…"
              title={`Open another database (${SHORTCUTS.open})`}
              disabled={busy}
              onPicked={close}
            />
            {recentFilesAvailable() && <MenuRecentFiles disabled={busy} onPicked={() => setOpen(false)} />}
            <p className="xray-sql-source-note">
              Files open read-only. The Read-only switch beside the file allows writes; Save writes them back.
            </p>
          </div>
          <div role="group" aria-labelledby="xray-sql-menu-connections" className="xray-sql-menu-group">
            <h2 id="xray-sql-menu-connections" className="xray-sql-menu-heading">
              Connections
            </h2>
            <MenuConnections disabled={busy} onDone={() => setOpen(false)} />
          </div>
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
        <button
          className="xray-btn primary xray-sql-save"
          disabled={!!running}
          onClick={() => void save()}
          aria-keyshortcuts={MAC ? 'Meta+S' : 'Control+S'}
          title={`Write the changes back to the file (${SHORTCUTS.save})`}
        >
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

// Files opened through the picker before, newest first. Hidden when empty, and where the picker
// cannot run (the DevTools panel's cross-origin frame): there a handle could never be reopened.
function RecentFiles(): React.ReactElement | null {
  const opening = usePanelSqlStore((s) => s.opening);
  const [list, setList] = useState<RecentSqlFile[]>([]);
  const [failed, setFailed] = useState<{ name: string; size: number; message: string } | null>(null);
  const [now] = useState(() => Date.now());
  useEffect(() => {
    let live = true;
    loadRecentFiles()
      .then((files) => {
        if (live) setList(files);
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, []);
  if (!list.length) return null;

  async function open(entry: RecentSqlFile): Promise<void> {
    setFailed(null);
    const read = await readRecentFile(entry);
    if ('error' in read) {
      setFailed({ name: entry.name, size: entry.size, message: read.error });
      return;
    }
    await usePanelSqlStore.getState().openFile(read.file, entry.handle);
  }

  async function remove(entry: RecentSqlFile): Promise<void> {
    setFailed(null);
    setList(await forgetRecentFile(entry).catch(() => list.filter((e) => e !== entry)));
  }

  return (
    <section className="xray-sql-recent" aria-labelledby="xray-sql-recent-title">
      <h2 id="xray-sql-recent-title">Recent</h2>
      <ul>
        {list.map((entry) => {
          const error = failed && failed.name === entry.name && failed.size === entry.size ? failed.message : null;
          return (
            <li key={`${entry.name}:${entry.size}`}>
              <button type="button" className="xray-sql-recent-item" disabled={opening} onClick={() => void open(entry)}>
                <IconDatabase size={14} stroke={1.8} aria-hidden="true" />
                <span className="xray-sql-recent-name">{entry.name}</span>
                <span className="xray-sql-recent-meta">
                  {formatFileSize(entry.size)} · {lastOpenedLabel(entry.lastOpened, now)}
                </span>
              </button>
              {error && (
                <div className="xray-sql-recent-error" role="alert">
                  <span>{error}</span>
                  <button type="button" className="xray-btn xray-btn-sm" aria-label={`Remove ${entry.name} from recent files`} onClick={() => void remove(entry)}>
                    Remove
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// Saved Postgres/MySQL connections on the welcome screen; a click connects.
function SavedConnections(): React.ReactElement | null {
  const profiles = usePanelSqlStore((s) => s.profiles);
  const opening = usePanelSqlStore((s) => s.opening);
  const [error, setError] = useState<string | null>(null);
  if (!profiles.length) return null;
  return (
    <section className="xray-sql-recent" aria-labelledby="xray-sql-saved-title">
      <h2 id="xray-sql-saved-title">Saved connections</h2>
      <ul>
        {profiles.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              className="xray-sql-recent-item"
              disabled={opening}
              onClick={() => {
                void connectSaved(p.id).then(setError);
              }}
            >
              <IconServer2 size={14} stroke={1.8} aria-hidden="true" />
              <span className="xray-sql-recent-name">{p.name}</span>
              <span className="xray-sql-recent-meta xray-sql-saved-meta">{profileMeta(p)}</span>
            </button>
          </li>
        ))}
      </ul>
      {error && (
        <p className="xray-sql-welcome-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}

function Welcome(): React.ReactElement {
  const opening = usePanelSqlStore((s) => s.opening);
  const error = usePanelSqlStore((s) => s.error);
  const helper = usePanelSqlStore((s) => s.helper.state);
  const lastMessage = usePanelSqlStore((s) => s.messages[s.messages.length - 1]);
  const ui = useConnectionUi();
  return (
    <section className="xray-sql-welcome" aria-labelledby="xray-sql-welcome-title">
      <IconDatabase size={36} stroke={1.4} aria-hidden="true" className="xray-sql-welcome-icon" />
      <h1 id="xray-sql-welcome-title">Open a SQLite database</h1>
      <div className="xray-sql-welcome-actions">
        <OpenFileButton className="xray-btn primary xray-sql-welcome-open" title={`Open a database (${SHORTCUTS.open})`} disabled={opening} />
        <button type="button" className="xray-btn xray-sql-welcome-open" disabled={opening} onClick={ui.newConnection}>
          <IconPlugConnected size={16} stroke={1.8} aria-hidden="true" />
          Connect to a database
        </button>
      </div>
      <p className="xray-sql-welcome-drop">or drop a .sqlite / .db file anywhere on this page</p>
      <p className="xray-sql-welcome-note">Files open read-only. Nothing leaves your machine.</p>
      {(helper === 'missing' || helper === 'outdated') && <HelperInstallCard state={helper} />}
      {recentFilesAvailable() && <RecentFiles />}
      <SavedConnections />
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

// Transient state only; the file and its mode live in the header, the run summary in Results.
function StatusBar(): React.ReactElement {
  const connection = usePanelSqlStore((s) => s.connection);
  const dirty = usePanelSqlStore((s) => s.dirty);
  const lastRunMs = usePanelSqlStore((s) => s.result?.durationMs);
  const running = usePanelSqlStore((s) => !!s.running);
  const cursor = usePanelSqlStore((s) => s.cursor);
  return (
    <footer className="xray-sql-status">
      {connection && (
        <>
          {running ? <span>Running…</span> : lastRunMs !== undefined && <span>Last run {Math.round(lastRunMs)} ms</span>}
          {dirty && <span className="xray-sql-connection-meta">unsaved changes</span>}
          <span className="xray-spacer" />
          <span className="xray-sql-status-cursor">
            Ln {cursor.line}, Col {cursor.col}
          </span>
        </>
      )}
    </footer>
  );
}

function hasFiles(e: DragEvent): boolean {
  return Array.from(e.dataTransfer?.types ?? []).includes('Files');
}

function inEditor(e: DragEvent): boolean {
  return e.target instanceof Element && !!e.target.closest('.cm-editor');
}

// Dropping a file anywhere opens it like the picker does. Listens in the capture phase so the
// editor's own drop handling never inserts a database's bytes as text.
function useFileDrop(): boolean {
  const [over, setOver] = useState(false);
  useEffect(() => {
    let depth = 0;
    const onEnter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth += 1;
      setOver(true);
    };
    const onOver = (e: DragEvent) => {
      if (!hasFiles(e)) {
        // Text or a link dropped outside the editor would navigate the page away; the editor keeps
        // its own text drop.
        if (!inEditor(e)) {
          e.preventDefault();
          if (e.dataTransfer) e.dataTransfer.dropEffect = 'none';
        }
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    };
    const onLeave = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depth = Math.max(0, depth - 1);
      if (depth === 0) setOver(false);
    };
    const onDrop = (e: DragEvent) => {
      if (!hasFiles(e)) {
        if (!inEditor(e)) e.preventDefault();
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      depth = 0;
      setOver(false);
      void usePanelSqlStore.getState().openDropped(Array.from(e.dataTransfer?.files ?? []));
    };
    window.addEventListener('dragenter', onEnter, true);
    window.addEventListener('dragover', onOver, true);
    window.addEventListener('dragleave', onLeave, true);
    window.addEventListener('drop', onDrop, true);
    return () => {
      window.removeEventListener('dragenter', onEnter, true);
      window.removeEventListener('dragover', onOver, true);
      window.removeEventListener('dragleave', onLeave, true);
      window.removeEventListener('drop', onDrop, true);
    };
  }, []);
  return over;
}

// Ctrl/Cmd+S saves (when there is something to save) and Ctrl/Cmd+O opens a file, anywhere on the
// page; neither acts behind a modal dialog.
function usePageShortcuts(): void {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = MAC ? e.metaKey && !e.ctrlKey : e.ctrlKey && !e.metaKey;
      if (!mod || e.shiftKey || e.altKey) return;
      const key = e.key.toLowerCase();
      if (key !== 's' && key !== 'o') return;
      e.preventDefault();
      const s = usePanelSqlStore.getState();
      if (document.querySelector('[aria-modal="true"]') || s.running || s.opening || s.pendingConfirm || s.pendingPrompt) return;
      if (key === 's') {
        if (s.connection && s.dirty) void s.save();
      } else {
        void requestOpenFile();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
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
        valueText={`Editor ${Math.round(editorPct)}%`}
        min={EDITOR_PCT_MIN}
        max={EDITOR_PCT_MAX}
        defaultValue={DEFAULT_SQL_LAYOUT.editorPct}
        onSet={(pct) => setLayout({ editorPct: pct })}
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
  const dropping = useFileDrop();
  usePageShortcuts();

  // Saved connections and the helper's state, for the welcome screen and the source menu.
  useEffect(() => {
    void usePanelSqlStore
      .getState()
      .refreshRemote()
      .catch(() => undefined);
  }, []);

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
      <ConnectionUiProvider>
      <div className="xray-sql-app">
        <Toolbar />
        <div ref={bodyRef} className="xray-sql-body" style={{ gridTemplateColumns: `${railPx}px auto minmax(0, 1fr)` }}>
          <ConnectionRail />
          <SqlDivider
            orientation="vertical"
            label="Resize schema rail"
            value={railPx}
            valueText={`${railPx} pixels`}
            min={RAIL_PX_MIN}
            max={RAIL_PX_MAX}
            defaultValue={DEFAULT_SQL_LAYOUT.railPx}
            onSet={(px) => setLayout({ railPx: px })}
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
        {dropping && (
          <div className="xray-sql-drop" aria-hidden="true">
            <div className="xray-sql-drop-card">
              <IconDatabase size={28} stroke={1.5} />
              <span>Drop to open the SQLite file</span>
              <span className="xray-sql-drop-note">Opens read-only. Nothing leaves your machine.</span>
            </div>
          </div>
        )}
      </div>
      <FileOpenInput />
      <Dialogs />
      </ConnectionUiProvider>
    </div>
  );
}
