import React, { createContext, useContext, useEffect, useId, useRef, useState } from 'react';
import { IconAlertCircle, IconCircleCheck, IconKey, IconPlugConnected, IconTrash } from '@tabler/icons-react';
import { usePanelSqlStore } from '../../sqlStore';
import {
  ensureHelperPermission,
  isLoopbackHost,
  parseConnectionString,
  shortServerVersion,
  TLS_REQUIRED_MESSAGE,
  validateProfile,
  type HelperPermissionOutcome,
  type PageProfile,
  type SqlEngine,
  type TlsMode,
} from '../../models/sqlProfiles';
import type { SaveProfileInput } from '../../runtime/remoteClient';
import type { SqlError } from '../../models/sqlTypes';
import { ModalShell } from '../common/ModalShell';
import { HelperInstallCard } from './HelperInstallCard';

export const PERMISSION_DENIED = 'XRAY needs permission to talk to the database helper.';
const ENGINE_LABEL: Record<SqlEngine, string> = { postgres: 'PostgreSQL', mysql: 'MySQL' };
const DEFAULT_PORT: Record<SqlEngine, number> = { postgres: 5432, mysql: 3306 };

export function engineLabel(engine: SqlEngine): string {
  return ENGINE_LABEL[engine];
}

function requestNativeMessaging(): Promise<boolean> {
  // The ambient `chrome` type only declares what the capture panel uses.
  const permissions = (typeof chrome === 'undefined' ? undefined : (chrome as unknown as { permissions?: unknown }).permissions) as
    | { request?(p: { permissions: string[] }): Promise<boolean> }
    | undefined;
  if (!permissions?.request) return Promise.resolve(false);
  return permissions.request({ permissions: ['nativeMessaging'] });
}

/**
 * Before a Test or Connect: asks for nativeMessaging when the worker said it is missing. Call it as
 * the first statement of a click handler: chrome.permissions.request needs the user gesture, so
 * nothing may be awaited before it.
 */
export function askHelperPermission(): Promise<HelperPermissionOutcome> {
  return ensureHelperPermission(usePanelSqlStore.getState().helper.state, requestNativeMessaging);
}

// Connects to a saved profile from a list (the welcome screen, the source menu): call it straight
// from the click. Returns the permission message when the user refused it; `onAllowed` runs just
// before the connect starts (the source menu closes there).
export async function connectSaved(profileId: string, onAllowed?: () => void): Promise<string | null> {
  const outcome = await askHelperPermission();
  if (outcome === 'denied') return PERMISSION_DENIED;
  onAllowed?.();
  await usePanelSqlStore.getState().connectProfile(profileId);
  return null;
}

// ------------------------------------------------------------------ dialog state, shared by the
// welcome screen and the source menu.
interface ConnectionUi {
  newConnection(): void;
  editConnection(profile: PageProfile): void;
  deleteConnection(profile: PageProfile): void;
}

const ConnectionUiContext = createContext<ConnectionUi>({
  newConnection: () => undefined,
  editConnection: () => undefined,
  deleteConnection: () => undefined,
});

export function useConnectionUi(): ConnectionUi {
  return useContext(ConnectionUiContext);
}

type Open = { kind: 'dialog'; profile: PageProfile | null } | { kind: 'delete'; profile: PageProfile } | null;

/** Provides the dialog openers and renders the connection dialog, delete confirmation and password prompt. */
export function ConnectionUiProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [open, setOpen] = useState<Open>(null);
  const [ui] = useState<ConnectionUi>(() => ({
    newConnection: () => setOpen({ kind: 'dialog', profile: null }),
    editConnection: (profile) => setOpen({ kind: 'dialog', profile }),
    deleteConnection: (profile) => setOpen({ kind: 'delete', profile }),
  }));
  const close = () => setOpen(null);
  return (
    <ConnectionUiContext.Provider value={ui}>
      {children}
      {open?.kind === 'dialog' && <ConnectionDialog profile={open.profile} onClose={close} />}
      {open?.kind === 'delete' && <DeleteConnection profile={open.profile} onClose={close} />}
      <PasswordPrompt />
    </ConnectionUiContext.Provider>
  );
}

// ------------------------------------------------------------------ the connection dialog
interface Form {
  name: string;
  engine: SqlEngine;
  host: string;
  port: string;
  database: string;
  user: string;
  password: string;
  tls: TlsMode;
  caFile: string;
  timeout: string;
  readOnly: boolean;
  savePassword: boolean;
}

function formFor(profile: PageProfile | null): Form {
  if (!profile) {
    return {
      name: '',
      engine: 'postgres',
      host: '',
      port: '5432',
      database: '',
      user: '',
      password: '',
      tls: 'require',
      caFile: '',
      timeout: '',
      readOnly: true,
      savePassword: true,
    };
  }
  return {
    name: profile.name,
    engine: profile.engine,
    host: profile.host,
    port: String(profile.port),
    database: profile.database,
    user: profile.user,
    password: '',
    tls: profile.tls,
    caFile: profile.caFile,
    timeout: profile.statementTimeoutMs === null ? '' : String(profile.statementTimeoutMs),
    readOnly: profile.readOnly,
    // A password kept for this browser session only stays there unless the user ticks this.
    savePassword: profile.hasSavedPassword,
  };
}

function inputFor(form: Form, id: string | undefined): SaveProfileInput | { error: string } {
  const port = Number(form.port);
  const problem = validateProfile({ host: form.host, port: form.port.trim() === '' ? NaN : port, tls: form.tls });
  if (problem) return { error: problem };
  const timeout = form.timeout.trim();
  if (timeout !== '' && (!/^\d+$/.test(timeout) || Number(timeout) < 1)) {
    return { error: 'Statement timeout must be a whole number of milliseconds.' };
  }
  return {
    ...(id ? { id } : {}),
    name: form.name.trim(),
    engine: form.engine,
    host: form.host.trim(),
    port,
    database: form.database,
    user: form.user,
    tls: form.tls,
    caFile: form.tls === 'verify-full' ? form.caFile.trim() : '',
    statementTimeoutMs: timeout === '' ? null : Number(timeout),
    readOnly: form.readOnly,
    password: form.password,
    savePassword: form.savePassword,
  };
}

type Outcome = { kind: 'ok' | 'error'; text: string } | null;

function errorText(raw: unknown): string {
  const err = raw as Partial<SqlError> | null;
  return typeof err?.message === 'string' && err.message !== '' ? err.message : 'Could not reach the database helper.';
}

// A labelled input. The hint sits outside the <label>, so the input's name is the label alone.
function Field({ label, children, wide = false, hint }: { label: string; children: React.ReactElement; wide?: boolean; hint?: string }): React.ReactElement {
  const hintId = useId();
  return (
    <div className={`xray-sql-conn-field${wide ? ' wide' : ''}`}>
      <label>
        <span className="xray-sql-conn-label">{label}</span>
        {hint ? React.cloneElement(children as React.ReactElement<{ 'aria-describedby'?: string }>, { 'aria-describedby': hintId }) : children}
      </label>
      {hint && (
        <span id={hintId} className="xray-sql-conn-hint">
          {hint}
        </span>
      )}
    </div>
  );
}

// A switch or checkbox with a one-line explanation beside it (described by, not part of, its name).
function Toggle({
  label,
  hint,
  checked,
  asSwitch = false,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  asSwitch?: boolean;
  onChange(checked: boolean): void;
}): React.ReactElement {
  const hintId = useId();
  return (
    <div className="xray-sql-conn-toggle">
      <label className="xray-toggle-field">
        <input
          type="checkbox"
          role={asSwitch ? 'switch' : undefined}
          className={asSwitch ? 'xray-switch' : 'xray-sql-conn-check'}
          checked={checked}
          aria-describedby={hint ? hintId : undefined}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>{label}</span>
      </label>
      {hint && (
        <span id={hintId} className="xray-sql-conn-hint">
          {hint}
        </span>
      )}
    </div>
  );
}

function Segmented<T extends string>({
  label,
  name,
  value,
  options,
  onChange,
}: {
  label: string;
  name: string;
  value: T;
  options: { value: T; label: string; disabled?: boolean; title?: string }[];
  onChange(value: T): void;
}): React.ReactElement {
  return (
    <div className="xray-sql-segmented" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <label key={o.value} className={`xray-sql-segment${value === o.value ? ' active' : ''}${o.disabled ? ' disabled' : ''}`} title={o.title}>
          <input type="radio" name={name} value={o.value} checked={value === o.value} disabled={o.disabled} onChange={() => onChange(o.value)} />
          {o.label}
        </label>
      ))}
    </div>
  );
}

function ConnectionDialog({ profile, onClose }: { profile: PageProfile | null; onClose(): void }): React.ReactElement {
  const helperState = usePanelSqlStore((s) => s.helper.state);
  const busyStore = usePanelSqlStore((s) => !!s.running || s.opening);
  const ids = useId();
  const [form, setForm] = useState<Form>(() => formFor(profile));
  const [pasted, setPasted] = useState('');
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [filled, setFilled] = useState(false);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [busy, setBusy] = useState<'test' | 'save' | null>(null);
  // The profile this dialog edits: the one it opened with, or the one Save & connect created.
  const savedId = useRef<string | undefined>(profile?.id);

  // The install card needs the helper's state; asked only now that someone wants a connection.
  useEffect(() => {
    void usePanelSqlStore.getState().checkHelper();
  }, []);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setOutcome(null);
  };

  // A pasted (or fully typed) string fills the fields below, then the box is cleared so the
  // password it carries does not stay on screen. Typing shows parse errors live; the fields fill
  // once the text arrives in one go (a paste) or the box loses focus.
  function paste(text: string, apply: boolean): void {
    setPasted(text);
    setOutcome(null);
    setFilled(false);
    if (text.trim() === '') {
      setPasteError(null);
      return;
    }
    const parsed = parseConnectionString(text);
    if ('error' in parsed) {
      setPasteError(parsed.error);
      return;
    }
    setPasteError(null);
    if (!apply) return;
    const p = parsed.profile;
    setForm((f) => ({
      ...f,
      name: p.name,
      engine: p.engine,
      host: p.host,
      port: String(p.port),
      database: p.database,
      user: p.user,
      password: parsed.password,
      tls: p.tls,
    }));
    setPasted('');
    setFilled(true);
  }

  function setEngine(engine: SqlEngine): void {
    setForm((f) => ({ ...f, engine, port: f.port === String(DEFAULT_PORT[f.engine]) || f.port === '' ? String(DEFAULT_PORT[engine]) : f.port }));
    setOutcome(null);
  }

  // Validation, then the permission (inside the click), then the helper.
  async function preflight(): Promise<SaveProfileInput | null> {
    const input = inputFor(form, savedId.current);
    if ('error' in input) {
      setOutcome({ kind: 'error', text: input.error });
      return null;
    }
    const permission = await askHelperPermission();
    if (permission === 'denied') {
      setOutcome({ kind: 'error', text: PERMISSION_DENIED });
      return null;
    }
    if (permission === 'missing') {
      // The card may be stale: the helper could have been installed since.
      await usePanelSqlStore.getState().checkHelper();
      const state = usePanelSqlStore.getState().helper.state;
      if (state === 'missing' || state === 'outdated') {
        setOutcome({ kind: 'error', text: state === 'outdated' ? 'Update the XRAY database helper.' : 'Install the XRAY database helper.' });
        return null;
      }
    }
    return input;
  }

  async function test(): Promise<void> {
    const pending = preflight();
    setBusy('test');
    setOutcome(null);
    try {
      const input = await pending;
      if (!input) return;
      const version = await usePanelSqlStore.getState().testProfile(input);
      setOutcome({ kind: 'ok', text: `Connected — ${shortServerVersion(version) || engineLabel(input.engine)}` });
    } catch (raw) {
      setOutcome({ kind: 'error', text: errorText(raw) });
    } finally {
      setBusy(null);
    }
  }

  async function saveAndConnect(): Promise<void> {
    const pending = preflight();
    setBusy('save');
    setOutcome(null);
    try {
      const input = await pending;
      if (!input) return;
      const store = usePanelSqlStore.getState();
      let saved: PageProfile;
      try {
        saved = await store.saveProfile(input);
      } catch (raw) {
        setOutcome({ kind: 'error', text: errorText(raw) });
        return;
      }
      savedId.current = saved.id;
      setForm((f) => ({ ...f, password: '' }));
      await store.connectProfile(saved.id);
      const s = usePanelSqlStore.getState();
      const connected = s.connection?.kind === 'remote' && s.connection.profileId === saved.id;
      // Connected, or another dialog took over: the password prompt or the discard prompt.
      if (connected || s.pendingPassword || s.pendingPrompt) {
        onClose();
        return;
      }
      setOutcome({ kind: 'error', text: s.error?.message ?? 'Could not connect.' });
    } finally {
      setBusy(null);
    }
  }

  // A Test stores nothing, so Cancel has nothing to undo.
  const cancel = onClose;

  const remoteHost = form.host.trim() !== '' && !isLoopbackHost(form.host);
  const working = busy !== null;
  const showCard = helperState === 'missing' || helperState === 'outdated';
  const pasteHint = `${ids}-paste-hint`;
  return (
    <ModalShell
      title={profile ? 'Edit connection' : 'New connection'}
      icon={<IconPlugConnected size={17} stroke={1.8} />}
      className="xray-sql-conn-modal"
      onClose={cancel}
      footer={
        <>
          <button type="button" className="xray-btn" disabled={working} onClick={() => void test()}>
            {busy === 'test' ? 'Testing…' : 'Test connection'}
          </button>
          <span className="xray-spacer" />
          <button type="button" className="xray-btn" onClick={cancel}>
            Cancel
          </button>
          <button type="button" className="xray-btn primary" disabled={working || busyStore} onClick={() => void saveAndConnect()}>
            {busy === 'save' ? 'Connecting…' : 'Save & connect'}
          </button>
        </>
      }
    >
      <form
        className="xray-modal-body xray-sql-conn-body"
        onSubmit={(e) => {
          e.preventDefault();
          if (!working) void saveAndConnect();
        }}
      >
        {showCard && <HelperInstallCard state={helperState} compact />}
        <div className="xray-sql-conn-paste">
          <label className="xray-sql-conn-field wide xray-sql-conn-paste-label">
            <span className="xray-sql-conn-label">Connection string</span>
            <input
              className="xray-input xray-sql-conn-mono"
              type="text"
              spellCheck={false}
              autoComplete="off"
              placeholder="postgres://user:password@host:5432/database"
              value={pasted}
              aria-invalid={pasteError ? true : undefined}
              aria-describedby={pasteHint}
              onChange={(e) => paste(e.target.value, e.target.value.length - pasted.length > 1)}
              onBlur={() => {
                if (pasted.trim() !== '') paste(pasted, true);
              }}
            />
          </label>
          <p id={pasteHint} className={`xray-sql-conn-hint${pasteError ? ' error' : ''}`} aria-live="polite">
            {pasteError ?? (filled ? 'Filled in the fields below.' : 'Paste a postgres:// or mysql:// URL to fill in the fields below.')}
          </p>
        </div>

        <fieldset className="xray-sql-conn-group">
          <legend>Server</legend>
          <div className="xray-sql-conn-row name wide">
            <Field label="Name">
              <input
                className="xray-input"
                value={form.name}
                placeholder={form.host ? `${form.database || 'db'}@${form.host}` : 'My database'}
                onChange={(e) => set('name', e.target.value)}
              />
            </Field>
            <div className="xray-sql-conn-field">
              <span className="xray-sql-conn-label" aria-hidden="true">
                Engine
              </span>
              <Segmented
                label="Engine"
                name={`${ids}-engine`}
                value={form.engine}
                options={[
                  { value: 'postgres', label: 'PostgreSQL' },
                  { value: 'mysql', label: 'MySQL' },
                ]}
                onChange={setEngine}
              />
            </div>
          </div>
          <div className="xray-sql-conn-row wide">
            <Field label="Host">
              <input className="xray-input xray-sql-conn-mono" spellCheck={false} value={form.host} placeholder="db.example.com" onChange={(e) => set('host', e.target.value)} />
            </Field>
            <Field label="Port">
              <input className="xray-input xray-sql-conn-port" inputMode="numeric" value={form.port} onChange={(e) => set('port', e.target.value)} />
            </Field>
          </div>
          <Field label="Database" wide>
            <input className="xray-input xray-sql-conn-mono" spellCheck={false} value={form.database} onChange={(e) => set('database', e.target.value)} />
          </Field>
          <Field label="User">
            <input className="xray-input xray-sql-conn-mono" spellCheck={false} autoComplete="off" value={form.user} onChange={(e) => set('user', e.target.value)} />
          </Field>
          <Field label="Password">
            <input
              className="xray-input"
              type="password"
              autoComplete="new-password"
              value={form.password}
              placeholder={profile?.hasSavedPassword ? 'Saved — type to replace' : ''}
              onChange={(e) => set('password', e.target.value)}
            />
          </Field>
        </fieldset>

        <fieldset className="xray-sql-conn-group">
          <legend>Security</legend>
          <div className="xray-sql-conn-field wide">
            <span className="xray-sql-conn-label" aria-hidden="true">
              TLS
            </span>
            <Segmented
              label="TLS"
              name={`${ids}-tls`}
              value={form.tls}
              options={[
                { value: 'require', label: 'Require' },
                { value: 'verify-full', label: 'Verify full' },
                { value: 'disable', label: 'Disable', disabled: remoteHost && form.tls !== 'disable', title: remoteHost ? TLS_REQUIRED_MESSAGE : undefined },
              ]}
              onChange={(tls) => set('tls', tls)}
            />
            {remoteHost && <span className="xray-sql-conn-hint">{TLS_REQUIRED_MESSAGE}</span>}
          </div>
          {form.tls === 'verify-full' && (
            <Field label="CA file path" wide hint="Optional. Leave empty to use the system’s certificates.">
              <input
                className="xray-input xray-sql-conn-mono"
                spellCheck={false}
                value={form.caFile}
                placeholder="/path/to/ca.pem"
                onChange={(e) => set('caFile', e.target.value)}
              />
            </Field>
          )}
        </fieldset>

        <fieldset className="xray-sql-conn-group">
          <legend>Options</legend>
          <Field label="Statement timeout (ms)" hint="Optional. Stops any statement that runs longer.">
            <input
              className="xray-input"
              inputMode="numeric"
              placeholder="No limit"
              value={form.timeout}
              onChange={(e) => set('timeout', e.target.value)}
            />
          </Field>
          <div className="xray-sql-conn-toggles">
            <Toggle
              label="Read-only"
              hint="Every statement runs in a read-only transaction."
              asSwitch
              checked={form.readOnly}
              onChange={(on) => set('readOnly', on)}
            />
            <Toggle
              label="Save password"
              hint="Off keeps it only until the browser closes."
              checked={form.savePassword}
              onChange={(on) => set('savePassword', on)}
            />
          </div>
        </fieldset>
        {/* Enter in a field submits; the visible buttons live in the footer. */}
        <button type="submit" hidden tabIndex={-1} aria-hidden="true" />
      </form>
      <div className={`xray-sql-conn-result${outcome ? ` ${outcome.kind}` : ''}`} role="status">
        {outcome && (
          <>
            {outcome.kind === 'ok' ? (
              <IconCircleCheck size={15} stroke={1.9} aria-hidden="true" />
            ) : (
              <IconAlertCircle size={15} stroke={1.9} aria-hidden="true" />
            )}
            <span>{outcome.text}</span>
          </>
        )}
      </div>
    </ModalShell>
  );
}

// ------------------------------------------------------------------ delete confirmation
function DeleteConnection({ profile, onClose }: { profile: PageProfile; onClose(): void }): React.ReactElement {
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  async function remove(): Promise<void> {
    try {
      await usePanelSqlStore.getState().deleteProfile(profile.id);
      onClose();
    } catch (raw) {
      setError(errorText(raw));
    }
  }
  return (
    <ModalShell
      title={`Delete ${profile.name}?`}
      icon={<IconTrash size={17} stroke={1.8} />}
      className="xray-confirm-modal"
      initialFocusRef={cancelRef}
      onClose={onClose}
      footer={
        <>
          <span className="xray-spacer" />
          <button ref={cancelRef} className="xray-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="xray-btn danger" onClick={() => void remove()}>
            Delete
          </button>
        </>
      }
    >
      <div className="xray-modal-body">
        <p className="xray-confirm-message">The saved connection and its password are removed from this browser.</p>
        {error && (
          <p className="xray-sql-conn-hint error" role="alert">
            {error}
          </p>
        )}
      </div>
    </ModalShell>
  );
}

// ------------------------------------------------------------------ password prompt
function PasswordPrompt(): React.ReactElement | null {
  const pending = usePanelSqlStore((s) => s.pendingPassword);
  if (!pending) return null;
  return <PasswordPromptDialog key={pending.profileId} profileId={pending.profileId} name={pending.name} />;
}

function PasswordPromptDialog({ profileId, name }: { profileId: string; name: string }): React.ReactElement {
  const { connectProfile, cancelPassword } = usePanelSqlStore.getState();
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const submit = () => void connectProfile(profileId, { password, remember });
  return (
    <ModalShell
      title={`Password for ${name}`}
      icon={<IconKey size={17} stroke={1.8} />}
      className="xray-confirm-modal"
      initialFocusRef={inputRef}
      onClose={cancelPassword}
      footer={
        <>
          <span className="xray-spacer" />
          <button className="xray-btn" onClick={cancelPassword}>
            Cancel
          </button>
          <button className="xray-btn primary" onClick={submit}>
            Connect
          </button>
        </>
      }
    >
      <form
        className="xray-modal-body xray-sql-password-body"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label className="xray-sql-conn-field wide">
          <span className="xray-sql-conn-label">Password</span>
          <input ref={inputRef} className="xray-input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <Toggle label="Remember on this computer" checked={remember} onChange={setRemember} />
      </form>
    </ModalShell>
  );
}
