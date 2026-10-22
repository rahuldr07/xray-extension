// background.js — Service Worker
// Bridges the extension action / keyboard command to the content script panel toggle.

const _devtoolsPortsByTab = new Map();
let popoutWindowId = null;
const CONSOLE_EVAL_TIMEOUT_MS = 10000;
// The runtime helpers' names (createRuntime's keys): one list, shared/console-helpers.js RUNTIME_NAMES.
function _runtimeHelperNames() {
  const names = globalThis.XRAY_ConsoleHelpers?.RUNTIME_NAMES;
  return Array.isArray(names) ? names : [];
}

function _relayCapture(tabId, message, count, sendResponse) {
  const port = _devtoolsPortsByTab.get(tabId);
  if (!port) {
    sendResponse({ ok: false, delivery: 'no-consumer', count: Math.max(0, Math.min(500, count)) });
    return;
  }
  try {
    port.postMessage(message);
    sendResponse({ ok: true, delivery: 'delivered', count: Math.max(0, Math.min(500, count)) });
  } catch {
    sendResponse({ ok: false, delivery: 'relay-failed', count: Math.max(0, Math.min(500, count)) });
  }
}

function _addCandidateTabId(ids, tabLike) {
  const tabId = Number(tabLike?.id);
  if (!Number.isInteger(tabId) || tabId < 0) return;
  if (!ids.includes(tabId)) ids.push(tabId);
}

async function _collectToggleTargets(tabArg) {
  const ids = [];
  _addCandidateTabId(ids, tabArg);

  const queries = [
    { active: true, currentWindow: true },
    { active: true, lastFocusedWindow: true },
    { active: true },
  ];

  for (const query of queries) {
    try {
      const tabs = await chrome.tabs.query(query);
      tabs
        .slice()
        .sort((a, b) => (Number(b.lastAccessed) || 0) - (Number(a.lastAccessed) || 0))
        .forEach((tab) => _addCandidateTabId(ids, tab));
    } catch (err) {
      console.debug('[XRAY] tab query failed', query, err?.message || String(err));
    }
  }

  return ids;
}

async function _sendToggle(tabId) {
  if (!Number.isInteger(tabId) || tabId < 0) {
    console.debug('[XRAY] toggle ignored: invalid tabId', tabId);
    return false;
  }
  console.debug('[XRAY] sending toggle to tab', tabId);
  try {
    await chrome.tabs.sendMessage(tabId, { type: 'xray:toggle' });
    return true;
  } catch (err) {
    // Tab may not have content script injected (e.g. chrome:// pages). Ignore.
    console.debug('[XRAY] toggle message failed (likely unsupported page)', tabId, err?.message || String(err));
    return false;
  }
}

async function _sendHudToggle(tabId) {
  if (!Number.isInteger(tabId) || tabId < 0) {
    console.debug('[XRAY] HUD toggle ignored: invalid tabId', tabId);
    return false;
  }
  try {
    await chrome.tabs.sendMessage(tabId, { type: 'XRAY_HUD_TOGGLE' });
    return true;
  } catch (err) {
    console.debug('[XRAY] HUD toggle message failed', tabId, err?.message || String(err));
    return false;
  }
}

async function _toggleHudOnBestTab(tabArg) {
  const targetIds = await _collectToggleTargets(tabArg);
  for (const targetId of targetIds) {
    if (await _sendHudToggle(targetId)) return true;
  }
  return false;
}

async function _openPopoutWindow() {
  if (popoutWindowId !== null) {
    try {
      await chrome.windows.update(popoutWindowId, { focused: true });
      return { ok: true, focused: true };
    } catch {
      popoutWindowId = null;
    }
  }

  const win = await chrome.windows.create({
    url: chrome.runtime.getURL('window.html'),
    type: 'popup',
    width: 1280,
    height: 720,
  });
  popoutWindowId = win?.id ?? null;
  return { ok: true, focused: false, id: popoutWindowId };
}

// The console scope's builders (spec §2): planRun, planComplete, planPreview, buildScopeExpression
// and the command-body transform, and the helpers' names (RUNTIME_NAMES; the helpers themselves run
// only in the page's scope). A classic service worker loads them with importScripts; a context
// without it (a test that only needs the listeners) simply has no console.
/* global importScripts -- a classic service worker global */
try {
  if (typeof importScripts === 'function') importScripts('shared/console-helpers.js', 'shared/console-scope.js');
} catch { /* _evaluateConsoleInTab reports the console as unavailable */ }

function _consoleScopeApi() {
  return globalThis.XRAY_ConsoleScope || null;
}

function _consoleUserSource(trimmed, box) {
  return _consoleScopeApi().userSource(trimmed, box);
}

// C-1: the evaluated expression used to read `window.XRAY_ConsoleHelpers`, a plain
// writable page global. A page that replaced `createRuntime` received the entire
// console context — captured URLs across every origin in the session, full bodies
// for the selected entry, decoded JWT claims — as soon as the user ran any
// expression, including `1+1`. The helper source is now inlined into the scope expression
// (shared/console-scope.js buildScopeExpression) and evaluated against a SHADOWED `window`,
// once per scope, so the page's global is never read and never written. The source is bundled
// with the extension, so this is our own code, not the page's.
let _consoleHelperSource = null;

async function _loadConsoleHelperSource() {
  if (_consoleHelperSource !== null) return _consoleHelperSource;
  const response = await fetch(chrome.runtime.getURL('shared/console-helpers.js'));
  _consoleHelperSource = await response.text();
  return _consoleHelperSource;
}

// Spec J8: the command context arrives from the panel as tagged JSON text
// (panel/console.js _contextPayload). It is parsed here, in the worker (_consoleContextValue), and
// reaches the page only as a callFunctionOn ARGUMENT of ordered pairs (encodeContext) that the scope
// rebuilds with syntax — never interpolated into source, never an object literal, whose
// `"__proto__":` would set a prototype instead of a key. A caller that still passes an object is
// stringified here (plain data, no tags).
function _consoleContextText(context) {
  if (typeof context === 'string') return context;
  try {
    return JSON.stringify(context ?? {}) ?? '{}';
  } catch {
    return '{}';
  }
}

// The scope script's name in stack frames: its frames are XRAY's (helpers, the result
// machinery), never the command's, and are dropped from a thrown error's stack.
const CONSOLE_SCOPE_URL = 'xray-console-scope.js';

function _consoleScopeExpression(helperSource, key) {
  return `${_consoleScopeApi().buildScopeExpression(helperSource, key)}\n//# sourceURL=${CONSOLE_SCOPE_URL}`;
}

// The context as the worker holds it: parsed here, in the worker, so the page's JSON.parse never
// sees its text. Text that is not a JSON object is an empty context.
function _consoleContextValue(context) {
  try {
    const value = JSON.parse(_consoleContextText(context));
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

// What goes to the page for one command: only the context members the command uses
// (contextFor), encoded so key order and "__proto__" keys survive CDP (encodeContext). A command
// that names no context name sends an empty context.
function _consoleContextArgument(full, needed) {
  const api = _consoleScopeApi();
  return api.encodeContext(api.contextFor(full, needed));
}

// What a command can bind from the scope: this context's names and the scope's declarations.
function _consoleKnownNames(contextValue, declared) {
  return { context: _consoleScopeApi().contextNames(contextValue), declared: declared || {} };
}

// A finished run's record (TAKE_FUNCTION) as the panel's envelope: the answer, and the
// top-level promise's state beside it with the time the worker measured.
function _consoleAnswer(record, promiseMs) {
  const answer = record && record.answer && typeof record.answer === 'object' ? { ...record.answer } : { type: 'undefined' };
  if (record?.promise) answer.meta = { promise: { state: record.promise, ms: Math.max(0, Math.round(promiseMs || 0)) } };
  return answer;
}

// A command error as the page reported it, with its stack frames in the command's coordinates
// (spec §1: `Uncaught Error: x` at `<anonymous>:1:7`). Frames in the wrapper or the inlined
// helpers are dropped; the page's own frames (its scripts, native code) are kept as they are.
function _mapConsoleStack(stack, expression, code) {
  // The line just before the command's own text (shared/console-scope.js BODY_MARKER, planRun).
  const markerAt = expression.indexOf(_consoleScopeApi().BODY_MARKER);
  if (markerAt < 0 || typeof stack !== 'string' || !stack) return { stack: stack || '', location: '' };
  const firstLine = expression.slice(0, markerAt).split('\n').length + 1;
  // The run's own box name (per-scope suffix), as planRun wrote it.
  const box = /const (__x[a-z0-9]+_box) = /i.exec(expression)?.[1];
  const source = _consoleUserSource(String(code || '').trim(), box);
  const lineCount = source.body.split('\n').length;
  const toCommand = (line, col) => {
    const local = line - firstLine + 1;
    return local >= 1 && local <= lineCount ? source.map(local, col) : null;
  };
  let location = '';
  const lines = [];
  for (const text of stack.split('\n')) {
    if (text.includes(CONSOLE_SCOPE_URL)) continue;
    const frame = /<anonymous>:(\d+):(\d+)/.exec(text);
    if (!frame) { lines.push(text); continue; }
    const at = toCommand(Number(frame[1]), Number(frame[2]));
    if (!at) continue;
    const mapped = `<anonymous>:${at.line}:${at.col}`;
    if (!location) location = mapped;
    lines.push(text.replace(frame[0], mapped));
  }
  return { stack: lines.join('\n'), location, toCommand };
}

// The page's answer, finished in the worker: a thrown error's frames mapped into the command.
function _finishConsoleResult(value, expression, code) {
  if (value && typeof value === 'object' && 'declared' in value) {
    const { declared: _declared, ...rest } = value;
    value = rest;
  }
  if (!value || typeof value !== 'object' || value.type !== 'error' || !value.error || value.error.thrown !== true) return value;
  const { stack, location } = _mapConsoleStack(value.error.stack, expression, code);
  return { ...value, error: { ...value.error, stack, ...(location ? { location } : {}) } };
}

function _debuggerCommand(target, method, params = {}) {
  return new Promise((resolve, reject) => {
    chrome.debugger.sendCommand(target, method, params, (result) => {
      const err = chrome.runtime.lastError;
      if (err) reject(new Error(err.message || String(err)));
      else resolve(result);
    });
  });
}

// Attaching the debugger costs 50-300ms and re-flashes Chrome's debugging
// infobar; paying that per eval made every console Run feel sluggish. Cache the
// attachment per tab and detach only after an idle window — 30 s, or 5 min while the
// Console prompt has focus (spec §2: a pause to think must not wipe declared variables).
// The deadline is kept in session storage so a restarted worker re-arms it; a worker that
// sleeps through it detaches when it next wakes (no `alarms` permission — accepted).
const DEBUGGER_IDLE_DETACH_MS = 30000;
const DEBUGGER_FOCUSED_DETACH_MS = 300000;
const _debuggerSessions = new Map(); // tabId -> { timer }
const _restoredDetachTimers = new Map(); // tabId -> timer re-armed from a previous worker
const _consolePromptFocused = new Map(); // tabId -> true while the Console prompt has focus
const CONSOLE_IDLE_KEY = 'xray_console_idle:';

function _sessionStore() {
  try {
    return chrome.storage?.session || null;
  } catch {
    return null;
  }
}

async function _sessionGet(key) {
  try {
    const store = _sessionStore();
    if (!store?.get) return undefined;
    const out = await store.get(key);
    return out && typeof out === 'object' ? out[key] : undefined;
  } catch {
    return undefined;
  }
}

function _sessionSet(key, value) {
  try {
    const pending = _sessionStore()?.set?.({ [key]: value });
    pending?.catch?.(() => {});
    return pending;
  } catch {
    return undefined;
  }
}

function _sessionRemove(key) {
  try {
    _sessionStore()?.remove?.(key)?.catch?.(() => {});
  } catch { /* nothing stored */ }
}

function _debuggerIdleMs(tabId) {
  return _consolePromptFocused.get(tabId) ? DEBUGGER_FOCUSED_DETACH_MS : DEBUGGER_IDLE_DETACH_MS;
}

function _detachDebuggerNow(tabId) {
  _debuggerSessions.delete(tabId);
  _restoredDetachTimers.delete(tabId);
  _sessionRemove(CONSOLE_IDLE_KEY + tabId);
  try { chrome.debugger.detach({ tabId }, () => void chrome.runtime.lastError); } catch {}
}

function _scheduleDebuggerDetach(tabId) {
  const session = _debuggerSessions.get(tabId);
  if (session?.timer) clearTimeout(session.timer);
  clearTimeout(_restoredDetachTimers.get(tabId));
  _restoredDetachTimers.delete(tabId);
  const ms = _debuggerIdleMs(tabId);
  const timer = setTimeout(() => _detachDebuggerNow(tabId), ms);
  _debuggerSessions.set(tabId, { timer });
  _sessionSet(CONSOLE_IDLE_KEY + tabId, { detachAt: Date.now() + ms, focused: !!_consolePromptFocused.get(tabId) });
}

// A previous worker's deadline: detach when it passes, unless this worker takes the session
// over first (its own timer then replaces this one).
function _armRestoredDetach(tabId, ms) {
  clearTimeout(_restoredDetachTimers.get(tabId));
  _restoredDetachTimers.set(tabId, setTimeout(() => {
    if (_debuggerSessions.has(tabId)) return;
    _detachDebuggerNow(tabId);
  }, Math.max(0, ms)));
}

async function _restoreDebuggerDetachTimers() {
  try {
    const store = _sessionStore();
    if (!store?.get) return;
    const all = await store.get(null);
    if (!all || typeof all !== 'object') return;
    for (const [key, record] of Object.entries(all)) {
      if (!key.startsWith(CONSOLE_IDLE_KEY) || !record || typeof record !== 'object') continue;
      const tabId = Number(key.slice(CONSOLE_IDLE_KEY.length));
      if (!Number.isInteger(tabId) || _debuggerSessions.has(tabId) || !Number.isFinite(record.detachAt)) continue;
      if (record.focused === true && !_consolePromptFocused.has(tabId)) _consolePromptFocused.set(tabId, true);
      _armRestoredDetach(tabId, record.detachAt - Date.now());
    }
  } catch { /* no stored deadlines */ }
}
_restoreDebuggerDetachTimers();

// A navigation takes the page's Console prompt with it: its focus no longer holds the debugger.
try {
  chrome.tabs?.onUpdated?.addListener?.((tabId, info) => {
    if (info?.status === 'loading' && _consolePromptFocused.has(tabId)) _setConsolePromptFocused(tabId, false);
    // The page's globals are the old page's: the next completion asks again.
    if (info?.status === 'loading') _forgetLiveGlobals(tabId);
  });
} catch { /* no tabs events in this context */ }

// `xray:console-focus`: the Console prompt gained or lost focus in this tab.
function _setConsolePromptFocused(tabId, focused) {
  if (focused) _consolePromptFocused.set(tabId, true);
  else _consolePromptFocused.delete(tabId);
  if (_debuggerSessions.has(tabId)) {
    _scheduleDebuggerDetach(tabId);
  } else if (_restoredDetachTimers.has(tabId)) {
    const ms = _debuggerIdleMs(tabId);
    _armRestoredDetach(tabId, ms);
    _sessionSet(CONSOLE_IDLE_KEY + tabId, { detachAt: Date.now() + ms, focused: !!focused });
  }
}

// How the session was obtained: 'cached' (this worker attached it), 'adopted' (a previous
// worker's attachment still answers) or 'new' (attached now — any stored scope belonged to a
// session that is gone).
async function _ensureDebuggerAttached(tabId) {
  _registerDebuggerDetach();
  const target = { tabId };
  if (_debuggerSessions.has(tabId)) {
    _scheduleDebuggerDetach(tabId);
    return 'cached';
  }
  try {
    await new Promise((resolve, reject) => {
      chrome.debugger.attach(target, '1.3', () => {
        const err = chrome.runtime.lastError;
        if (err) reject(new Error(err.message || String(err)));
        else resolve();
      });
    });
  } catch (err) {
    // The attachment can outlive this service worker instance; if the stale
    // attach still answers commands, adopt it instead of failing.
    try {
      await _debuggerCommand(target, 'Runtime.enable');
      _scheduleDebuggerDetach(tabId);
      return 'adopted';
    } catch {
      throw err;
    }
  }
  await _debuggerCommand(target, 'Runtime.enable');
  _scheduleDebuggerDetach(tabId);
  return 'new';
}

// `debugger` is optional, so chrome.debugger is undefined until it is granted. Touching
// it at top level threw and aborted this script before any onMessage/onConnect/command
// listener was registered — which broke the whole extension on a fresh install.
// Register when the API exists, and again when the permission is granted later.
let _debuggerDetachRegistered = false;
function _registerDebuggerDetach() {
  if (_debuggerDetachRegistered || !chrome.debugger?.onDetach) return;
  _debuggerDetachRegistered = true;
  chrome.debugger.onDetach.addListener((source, reason) => {
    const tabId = source?.tabId;
    if (!Number.isInteger(tabId)) return;
    const session = _debuggerSessions.get(tabId);
    if (session?.timer) clearTimeout(session.timer);
    _debuggerSessions.delete(tabId);
    clearTimeout(_restoredDetachTimers.get(tabId));
    _restoredDetachTimers.delete(tabId);
    _sessionRemove(CONSOLE_IDLE_KEY + tabId);
    // The scope record stays (the next attach is 'new', so it is replaced with the reset note);
    // a closed tab has no next command.
    if (reason === 'target_closed') _forgetConsoleScope(tabId);
    _forgetLiveGlobals(tabId);
    // The user closed Chrome's debugging bar: typing in the Console never brings it back
    // (spec §4); the next explicit Run may.
    if (reason === 'canceled_by_user') _setConsoleAttachRefused(tabId, true);
  });
}
_registerDebuggerDetach();
chrome.permissions?.onAdded?.addListener?.(() => _registerDebuggerDetach());

// C-8: `debugger` is an OPTIONAL permission now. Combined with <all_urls> and
// MAIN-world injection it was close to the maximum-scrutiny configuration for Chrome
// Web Store review, and it was requested at install time from every user whether or
// not they ever opened the console.
//
// C-8's own stated direction was to try MAIN-world `new Function` first and fall back
// to the debugger. That half is SUPERSEDED by the C-1 fix: MAIN-world execution is
// deleted outright, because it handed the whole console context to page-controlled
// code. So the debugger is the only execution path, and the right move is to stop
// demanding it up front and ask only when the user actually runs an expression.
function _hasDebuggerPermission() {
  return new Promise((resolve) => {
    try {
      chrome.permissions.contains({ permissions: ['debugger'] }, (granted) => {
        void chrome.runtime.lastError;
        resolve(!!granted);
      });
    } catch {
      resolve(false);
    }
  });
}

// ── The console scope (spec §2) ────────────────────────────────────────────────────────────
// One scope object per tab, held by CDP — never by the page — and known by its objectId and a
// random key (open(key) is its only member), kept in memory and in session storage with the
// names declared in it ({ name: kind }; losing a scope that held some earns the reset note). A
// reload invalidates it ("Cannot find context with specified id"), a detach too ("Could not find
// object with given id"); either way a new one is made.
const CONSOLE_SCOPE_KEY = 'xray_console_scope:';
const CONSOLE_SCOPE_LOST = /Cannot find context with specified id|Could not find object with given id|Invalid remote object id|Cannot find object with id/i;
const _consoleScopes = new Map(); // tabId -> { objectId, key, declared }

function _forgetConsoleScope(tabId) {
  _consoleScopes.delete(tabId);
  _consoleContextDigests.delete(tabId);
  _forgetLiveGlobals(tabId);
  _sessionRemove(CONSOLE_SCOPE_KEY + tabId);
}

const _hasDeclarations = (scope) => !!scope?.declared && typeof scope.declared === 'object' && Object.keys(scope.declared).length > 0;

async function _storedConsoleScope(tabId) {
  const known = _consoleScopes.get(tabId) || await _sessionGet(CONSOLE_SCOPE_KEY + tabId);
  return known && typeof known.objectId === 'string' && typeof known.key === 'string' && typeof known.suffix === 'string' ? known : null;
}

async function _saveConsoleScope(tabId, record) {
  _consoleScopes.set(tabId, record);
  await _sessionSet(CONSOLE_SCOPE_KEY + tabId, { objectId: record.objectId, key: record.key, suffix: record.suffix, declared: record.declared || {} });
}

function _consoleScopeKey() {
  try {
    if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  } catch { /* below */ }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

function _timeoutError(message) {
  const err = new Error(message);
  err.kind = 'timeout';
  return err;
}

// One creation at a time per tab: two surfaces running at once share the new scope. Bounded by
// the run's cap: a page whose main thread is busy answers a timeout, and the next run retries.
const _consoleScopeCreating = new Map(); // tabId -> Promise<record>

function _createConsoleScope(tabId, timeoutMs = CONSOLE_EVAL_TIMEOUT_MS) {
  if (!_consoleScopeCreating.has(tabId)) {
    const pending = (async () => {
      const making = _makeConsoleScope(tabId);
      const made = await _raceTimeout(making, timeoutMs);
      if (made === CONSOLE_TIMED_OUT) {
        // A scope the page makes after all is released, never left behind.
        making.then((late) => _debuggerCommand({ tabId }, 'Runtime.releaseObject', { objectId: late.objectId }).catch(() => {}), () => {});
        throw _timeoutError('The page did not answer while XRAY prepared the console.');
      }
      await _saveConsoleScope(tabId, made);
      return made;
    })();
    _consoleScopeCreating.set(tabId, pending);
    pending.then(() => _consoleScopeCreating.delete(tabId), () => _consoleScopeCreating.delete(tabId));
  }
  return _consoleScopeCreating.get(tabId);
}

async function _makeConsoleScope(tabId) {
  const key = _consoleScopeKey();
  const created = await _debuggerCommand({ tabId }, 'Runtime.evaluate', {
    expression: _consoleScopeExpression(await _loadConsoleHelperSource(), key),
    returnByValue: false,
    silent: true,
  });
  const objectId = created?.result?.objectId;
  if (created?.exceptionDetails || typeof objectId !== 'string') {
    const detail = created?.exceptionDetails?.exception?.description || created?.exceptionDetails?.text || 'no scope object';
    throw new Error(`XRAY could not prepare the console scope: ${detail}`);
  }
  // The wrapper's names in this scope's commands end in a random suffix (planRun).
  return { objectId, key, suffix: _consoleScopeKey().replace(/[^a-z0-9]/gi, '').slice(0, 12) || 'x', declared: {} };
}

// Runs `fn(scope)` against the tab's scope, creating one when there is none (or when the
// debugger was attached anew: `fresh`), and once more on a new scope when the old one is lost —
// only when nothing ran yet (an error that `fn` marks `started` is never retried: the command may
// have had its side effects). Answers { value, scope, reset } — `reset`: a scope that held
// declarations was replaced. Tasks 7–8 (completion, preview) call it with read-only functions.
async function _withConsoleScope(tabId, fresh, fn, timeoutMs = CONSOLE_EVAL_TIMEOUT_MS) {
  const known = await _storedConsoleScope(tabId);
  let reset = false;
  let scope = known && !fresh ? known : null;
  if (!scope) {
    reset = _hasDeclarations(known);
    scope = await _createConsoleScope(tabId, timeoutMs);
  }
  try {
    return { value: await fn(scope), scope, reset };
  } catch (err) {
    if (err?.started || !CONSOLE_SCOPE_LOST.test(String(err?.message || err))) throw err;
    reset = reset || _hasDeclarations(scope);
    _consoleScopes.delete(tabId);
    scope = await _createConsoleScope(tabId, timeoutMs);
    return { value: await fn(scope), scope, reset };
  }
}

const CONSOLE_TIMED_OUT = Symbol('timeout');

function _raceTimeout(promise, ms) {
  let timer;
  return Promise.race([
    promise,
    new Promise((resolve) => { timer = setTimeout(() => resolve(CONSOLE_TIMED_OUT), Math.max(0, ms)); }),
  ]).finally(() => clearTimeout(timer));
}

// A CDP RemoteObject as a CallArgument (an object by its id, a primitive by value).
function _consoleCallArgument(remote) {
  if (!remote || typeof remote !== 'object') return {};
  if (typeof remote.objectId === 'string') return { objectId: remote.objectId };
  if (typeof remote.unserializableValue === 'string') return { unserializableValue: remote.unserializableValue };
  if (remote.type === 'undefined') return {};
  return { value: remote.value };
}

// One command against the scope. Runtime.callFunctionOn has no `timeout` (spike: a
// `while (true) {}` ran on), and nothing XRAY reads may pass through page code — no promise
// carries an XRAY object, and whether the value is a promise is CDP's answer, never a `then`
// the page could define on Object.prototype. So:
//   1. the run function starts the command and returns its promise once the synchronous part is
//      done — still running at the cap it is a loop, and only then is the page's execution
//      terminated (an awaiting command never is: that would cut the page's next task);
//   2. Runtime.awaitPromise waits for that promise (it resolves to `undefined`);
//   3. INSPECT hands the command's value to CDP as a RemoteObject: a native promise
//      (`subtype: 'promise'`) is awaited with Runtime.awaitPromise until the cap — still pending,
//      the promise itself is the answer; any other value, a thenable too, is shown as it is;
//   4. FINISH encodes the answer in the page (its promise resolves to `undefined`);
//   5. TAKE reads it synchronously, by value, as a prototype-less record.
// Runs are serialized per tab (_queueConsoleRun), so a termination can only reach this run —
// or, accepted limit, the page's own task when the page was too busy to start the command
// before the cap. Answers { timeout } | { exceptionDetails } | { record, promiseMs }.
async function _runInConsoleScope(target, scope, functionDeclaration, context, timeoutMs, graceMs) {
  const started = Date.now();
  const remaining = () => timeoutMs - (Date.now() - started);
  const call = (functionDeclaration, args, extra = {}) => _debuggerCommand(target, 'Runtime.callFunctionOn', {
    objectId: scope.objectId, functionDeclaration, arguments: args, returnByValue: false, awaitPromise: false, ...extra,
  });
  const release = (objectId) => {
    if (typeof objectId === 'string') _debuggerCommand(target, 'Runtime.releaseObject', { objectId }).catch(() => {});
  };
  const api = _consoleScopeApi();
  const key = { value: scope.key };
  // Round 3: the run carries its deadline (the worker's clock): a page too busy to start it before
  // then makes it return api.SKIPPED without running the command.
  const run = call(functionDeclaration, [key, { value: context }, { value: started + timeoutMs }]);
  // The race may settle first; a later rejection is not an unhandled one.
  run.catch(() => {});
  const skipped = (answer) => answer?.result?.type === 'string' && answer.result.value === api.SKIPPED;
  // Terminate a little after the deadline (CONSOLE_DEADLINE_MARGIN_MS): when the page's own task
  // was what held the run back, the run then starts after its deadline and skips itself.
  const first = await _raceTimeout(run, timeoutMs + CONSOLE_DEADLINE_MARGIN_MS);
  if (first === CONSOLE_TIMED_OUT) {
    _debuggerCommand(target, 'Runtime.terminateExecution').catch(() => {});
    // Absorbs a termination that arrives just after the command finished, so it can never
    // land on the page's own next script.
    _debuggerCommand(target, 'Runtime.evaluate', { expression: '0', silent: true }).catch(() => {});
    // A command still in its statements is terminated (the call rejects); one the page had not
    // started yet starts now, past its deadline, and runs nothing: it says so.
    const late = await _raceTimeout(run, graceMs).catch(() => null);
    return skipped(late) ? { skipped: true } : { timeout: true };
  }
  if (skipped(first)) return { skipped: true };
  if (first?.exceptionDetails) return { exceptionDetails: first.exceptionDetails };
  const held = [first?.result?.objectId];
  try {
    if (typeof first?.result?.objectId === 'string') {
      const wait = _debuggerCommand(target, 'Runtime.awaitPromise', { promiseObjectId: first.result.objectId, returnByValue: false });
      wait.catch(() => {});
      await _raceTimeout(wait, remaining());
    }
    const taken = async () => {
      const take = call(api.TAKE_FUNCTION, [key], { returnByValue: true });
      take.catch(() => {});
      const answer = await _raceTimeout(take, Math.max(graceMs, remaining() + graceMs));
      if (answer === CONSOLE_TIMED_OUT) return null;
      if (answer?.exceptionDetails) throw new Error(answer.exceptionDetails.exception?.description || answer.exceptionDetails.text || 'the run failed');
      return answer?.result?.value || null;
    };
    const state = await taken();
    // Still in its statements at the cap (a hung await): a timeout, as before.
    if (!state || state.state !== 'ran') return { timeout: true, record: state };
    // What the value is, as V8 classifies it.
    const inspected = await call(api.INSPECT_FUNCTION, [key]);
    const value = inspected?.result;
    held.push(value?.objectId);
    let mode = 'value';
    let settled = {};
    let promiseMs = 0;
    if (value?.subtype === 'promise' && typeof value.objectId === 'string') {
      const waitedFrom = Date.now();
      const wait = _debuggerCommand(target, 'Runtime.awaitPromise', { promiseObjectId: value.objectId, returnByValue: false });
      wait.catch(() => {});
      const outcome = await _raceTimeout(wait, remaining());
      promiseMs = Date.now() - waitedFrom;
      if (outcome === CONSOLE_TIMED_OUT) {
        mode = 'pending';
      } else if (outcome?.exceptionDetails) {
        mode = 'rejected';
        settled = _consoleCallArgument(outcome.exceptionDetails.exception);
        held.push(outcome.exceptionDetails.exception?.objectId);
      } else {
        mode = 'fulfilled';
        settled = _consoleCallArgument(outcome?.result);
        held.push(outcome?.result?.objectId);
      }
    }
    const finishing = await call(api.FINISH_FUNCTION, [key, { value: mode }, settled]);
    held.push(finishing?.result?.objectId);
    if (typeof finishing?.result?.objectId === 'string') {
      const wait = _debuggerCommand(target, 'Runtime.awaitPromise', { promiseObjectId: finishing.result.objectId, returnByValue: false });
      wait.catch(() => {});
      await _raceTimeout(wait, Math.max(graceMs, remaining() + graceMs));
    }
    const record = await taken();
    if (!record || record.state !== 'done') return { timeout: true, record };
    return { record, promiseMs };
  } catch (err) {
    // The command started: whatever failed now, it is never run again.
    const marked = err instanceof Error ? err : new Error(String(err));
    marked.started = true;
    throw marked;
  } finally {
    held.forEach(release);
  }
}

// One console run at a time per tab (Task 6 review, Minor 3).
const _consoleQueues = new Map(); // tabId -> Promise

function _queueConsoleRun(tabId, task) {
  const previous = _consoleQueues.get(tabId) || Promise.resolve();
  const next = previous.then(task, task);
  const tail = next.then(() => {}, () => {});
  _consoleQueues.set(tabId, tail);
  tail.then(() => { if (_consoleQueues.get(tabId) === tail) _consoleQueues.delete(tabId); });
  return next;
}

// `options` (tests): { timeoutMs, graceMs } shorten the run's cap and the worker's backstop.
// Explicit Runs queued or running per tab: typing (completion, preview) asks nothing meanwhile.
const _consoleRunsInFlight = new Map(); // tabId -> count

function _evaluateConsoleInTab(tabId, code, context, options = {}) {
  if (!Number.isInteger(tabId) || tabId < 0) {
    return Promise.resolve({ type: 'error', error: { message: 'No inspected tab available for console execution.' } });
  }
  _consoleRunsInFlight.set(tabId, (_consoleRunsInFlight.get(tabId) || 0) + 1);
  const done = () => {
    const left = (_consoleRunsInFlight.get(tabId) || 1) - 1;
    if (left > 0) _consoleRunsInFlight.set(tabId, left); else _consoleRunsInFlight.delete(tabId);
  };
  const run = _queueConsoleRun(tabId, () => _evaluateConsoleNow(tabId, code, context, options));
  run.then(done, done);
  return run;
}

async function _evaluateConsoleNow(tabId, code, context, options) {
  const timeoutMs = Number.isFinite(options.timeoutMs) ? options.timeoutMs : CONSOLE_EVAL_TIMEOUT_MS;
  const graceMs = Number.isFinite(options.graceMs) ? options.graceMs : CONSOLE_TIMEOUT_GRACE_MS;

  if (!(await _hasDebuggerPermission())) {
    return {
      type: 'error',
      error: {
        message: 'XRAY could not use its "debugger" permission. Reload XRAY at chrome://extensions, then run this again.',
      },
    };
  }

  const api = _consoleScopeApi();
  if (!api) return { type: 'error', error: { message: 'XRAY console is unavailable. Reload XRAY at chrome://extensions, then run this again.' } };

  const target = { tabId };
  // A previous worker's refusal and reset note are this Run's to clear and to show.
  await _consoleTypingStateRestored;
  let attached;
  try {
    attached = await _ensureDebuggerAttached(tabId);
  } catch (err) {
    _dropDebuggerSession(tabId);
    // An attach whose Runtime.enable failed is still attached: leave nothing behind.
    try { chrome.debugger.detach(target, () => void chrome.runtime.lastError); } catch { /* nothing attached */ }
    return _consoleDebuggerError('attach', err);
  }
  // An explicit Run re-attached: live completion may use this session again.
  _setConsoleAttachRefused(tabId, false);
  _liveBackoff.delete(tabId);
  await _settleAbandonedWalk(tabId);

  const trimmed = String(code || '').trim();
  const full = _consoleContextValue(context);
  const started = Date.now();
  let runFunction = '';
  let runNeeded = [];
  let ran;
  try {
    ran = await _withConsoleScope(tabId, attached === 'new', (scope) => {
      // The scope's own declarations decide what the command binds (a new scope has none), and
      // what it binds decides which context members travel.
      const plan = api.planRun(trimmed, _consoleKnownNames(full, scope.declared), scope.suffix);
      runFunction = plan.text;
      runNeeded = plan.needed;
      return _runInConsoleScope(target, scope, runFunction, _consoleContextArgument(full, plan.needed), timeoutMs, graceMs);
    }, timeoutMs);
  } catch (err) {
    // Bug 2: only a dead session is dropped (detached, tab gone); any other CDP failure is an
    // evaluation failure and the cached session stays for the next run.
    // A CDP rejection at or after the cap is a timeout, and so is a scope the page never made.
    _consoleContextDigests.delete(tabId);
    const kind = err?.kind === 'timeout' || Date.now() - started >= timeoutMs ? 'timeout' : _debuggerFailureKind(err);
    if (kind !== 'evaluation' && kind !== 'timeout') {
      _dropDebuggerSession(tabId);
      try { chrome.debugger.detach(target, () => void chrome.runtime.lastError); } catch {}
    }
    return _consoleDebuggerError(kind, kind === 'timeout' ? null : err, timeoutMs);
  }

  const { value: outcome, scope } = ran;
  // The context this Run revived in the scope (fix round 1): previews may read it while it is current.
  if (outcome.skipped || outcome.timeout || outcome.exceptionDetails) _consoleContextDigests.delete(tabId);
  else _recordConsoleContext(tabId, scope, full, runNeeded);
  if (outcome.skipped) {
    const pendingSkip = _takePendingScopeReset(tabId);
    const result = _consoleDebuggerError('skipped', null, timeoutMs);
    return ran.reset || pendingSkip ? { ...result, scopeReset: true } : result;
  }
  // A completion may have replaced a scope that held declarations: the note is this run's.
  const pendingReset = _takePendingScopeReset(tabId);
  const reset = ran.reset || pendingReset;
  // A run can declare names and change the page's globals: the next completion asks again.
  _forgetLiveGlobals(tabId);
  const noted = (result) => (reset ? { ...result, scopeReset: true } : result);
  if (outcome.timeout) {
    if (outcome.record?.declared && typeof outcome.record.declared === 'object') {
      scope.declared = outcome.record.declared;
      await _saveConsoleScope(tabId, scope);
    }
    return noted(_consoleDebuggerError('timeout', null, timeoutMs));
  }
  if (outcome.exceptionDetails) {
    // The command did not compile (a SyntaxError): the page's exception, located in the command.
    const details = outcome.exceptionDetails;
    const description = details.exception?.description || details.text || 'Console execution failed';
    const { toCommand } = _mapConsoleStack(description, runFunction, code);
    const at = toCommand && Number.isInteger(details.lineNumber) && Number.isInteger(details.columnNumber)
      ? toCommand(details.lineNumber + 1, details.columnNumber + 1)
      : null;
    return noted({
      type: 'error',
      error: {
        message: description.split('\n')[0],
        stack: '',
        thrown: true,
        ...(at ? { location: `<anonymous>:${at.line}:${at.col}` } : {}),
      },
    });
  }
  // The scope's declarations ride back with the answer; the panel never sees them.
  const declared = outcome.record?.declared;
  if (declared && typeof declared === 'object') {
    scope.declared = declared;
    await _saveConsoleScope(tabId, scope);
  }
  return noted(_finishConsoleResult(_consoleAnswer(outcome.record, outcome.promiseMs), runFunction, code));
}

// How long past the page's own cap the worker waits for an answer before it calls a timeout.
const CONSOLE_TIMEOUT_GRACE_MS = 2000;
// Past a run's deadline (the page allows no grace: ruling 118) before the worker terminates (round 3).
const CONSOLE_DEADLINE_MARGIN_MS = 100;

// ── Live completion (spec §3 source 4, Task 7; fix round 1) ────────────────────────────────────
// `<path>.` and bare identifiers ask the page what it holds, through the same debugger session and
// scope as a Run, and the typing path never creates a remote object of a page or declared value:
// CDP describes an Error value by formatting its stack through the page's Error.prepareStackTrace,
// with full rights (Task 7 review, Critical 1 — a declared value reached page code). So:
//   1. one STRICT function on the scope (shared/console-scope.js planComplete) walks the plain path
//      IN THE PAGE (`walk`): descriptor reads only, with natives taken when the scope was created,
//      data properties only — an accessor ends the walk, so no page getter runs — and lists own and
//      inherited names the same way (cap 500, at most 3,000 scanned, no source text, parameter
//      lists ≤ 200 characters). Its answer is one string XRAY's own code built, read with
//      returnByValue; throwOnSideEffect stays as defence in depth on a path walk;
//   2. it is never terminated (review, Critical 2: a 250 ms terminate killed the page's own task
//      when the page was busy): at CONSOLE_COMPLETE_TIMEOUT_MS the worker answers null and abandons
//      the call (its object group is released when it settles), then backs off for 5 s. What a
//      later explicit Run does with it: _settleAbandonedWalk;
//   3. the page globals: the walk lists the real global's own names; the top-level let/const/class
//      names come from Runtime.globalLexicalScopeNames (strings only). Cached 5 s per scope, dropped
//      on a Run, a navigation and a detach.
// No context travels (the panel answers captured roots itself); completions share the per-tab
// queue with runs and are skipped while one is in flight.
const CONSOLE_COMPLETE_TIMEOUT_MS = 250;
// Creating the scope (the first thing typed on a fresh session) has its own budget; it abandons too.
const CONSOLE_COMPLETE_SCOPE_MS = 1000;
const CONSOLE_COMPLETE_GROUP = 'xray-complete';
const CONSOLE_LIVE_TTL_MS = 5000;
const CONSOLE_LIVE_BACKOFF_MS = 5000;
const _liveGlobals = new Map(); // tabId -> { objectId (the scope's), answer, at }
const _liveBackoff = new Map(); // tabId -> time before which typing asks nothing (after a walk timed out)
const _pendingWalks = new Map(); // tabId -> promise: an abandoned walk still running in the page (at most one)
const CONSOLE_ABANDONED_SETTLE_MS = 500;
const _consoleAttachRefused = new Set(); // tabs whose debugging bar the user cancelled: typing never re-attaches
const _pendingScopeReset = new Set(); // a completion replaced a scope that held declarations: the next Run says so
// Both outlive the worker (final review I-2, M-4): MV3 stops an idle worker after ~30 s, and a
// rebuilt one must neither bring the cancelled debugging bar back from typing nor lose a reset
// note. Kept in session storage like CONSOLE_IDLE_KEY/CONSOLE_SCOPE_KEY, read back once at start.
const CONSOLE_REFUSED_KEY = 'xray_console_refused:';
const CONSOLE_RESET_KEY = 'xray_console_reset:';

function _setConsoleAttachRefused(tabId, refused) {
  if (refused) {
    _consoleAttachRefused.add(tabId);
    _sessionSet(CONSOLE_REFUSED_KEY + tabId, true);
  } else {
    _consoleAttachRefused.delete(tabId);
    _sessionRemove(CONSOLE_REFUSED_KEY + tabId);
  }
}

function _notePendingScopeReset(tabId) {
  _pendingScopeReset.add(tabId);
  _sessionSet(CONSOLE_RESET_KEY + tabId, true);
}

// The note, once: true when a typing call replaced a scope that held declarations.
function _takePendingScopeReset(tabId) {
  _sessionRemove(CONSOLE_RESET_KEY + tabId);
  return _pendingScopeReset.delete(tabId);
}

const _consoleTypingStateRestored = (async () => {
  try {
    const all = await _sessionStore()?.get?.(null);
    if (!all || typeof all !== 'object') return;
    for (const [key, value] of Object.entries(all)) {
      if (value !== true) continue;
      const prefix = key.startsWith(CONSOLE_REFUSED_KEY) ? CONSOLE_REFUSED_KEY : key.startsWith(CONSOLE_RESET_KEY) ? CONSOLE_RESET_KEY : null;
      const tabId = prefix ? Number(key.slice(prefix.length)) : NaN;
      if (!Number.isInteger(tabId)) continue;
      (prefix === CONSOLE_REFUSED_KEY ? _consoleAttachRefused : _pendingScopeReset).add(tabId);
    }
  } catch { /* nothing stored */ }
})();

// A name the panel answers from captured data (helpers, pins a–f, saved variables): never asked of the page.
const _consoleContextRoot = (root) => _runtimeHelperNames().includes(root) || /^(?:[a-f]|temp\d+|\$_)$/.test(root);

// The globals and the back-off belong to the page, the session and the scope they were read from.
function _forgetLiveGlobals(tabId) {
  _liveGlobals.delete(tabId);
  _liveBackoff.delete(tabId);
}

try {
  chrome.tabs?.onRemoved?.addListener?.((tabId) => {
    _forgetLiveGlobals(tabId);
    _pendingWalks.delete(tabId);
    _setConsoleAttachRefused(tabId, false);
    _takePendingScopeReset(tabId);
  });
} catch { /* no tabs events in this context */ }

// Answers { names: LiveName[] | null, attached, type?, capped?, declared? } — `names` null: no
// answer (not asked: no session and no attach allowed, a refused path, a run in flight, backing
// off; or the page did not answer in time, or the walk is off on this page); [] nothing to list
// (an accessor or a missing name on the path, a primitive: its `type`). `capped`: the list was cut
// (500 names, or 3,000 scanned) — the panel then treats the globals as unknown.
// `options.attach`: the panel saw ≥ 2 characters and a 150 ms pause.
async function _completeConsoleInTab(tabId, expr, options = {}) {
  const none = (attached) => ({ names: null, attached });
  if (!Number.isInteger(tabId) || tabId < 0) return none(false);
  const api = _consoleScopeApi();
  if (!api || (expr !== null && typeof expr !== 'string')) return none(_debuggerSessions.has(tabId));
  if (expr !== null) {
    const path = api.livePath(expr);
    const known = path ? await _storedConsoleScope(tabId) : null;
    const declared = !!path && !!known?.declared && Object.prototype.hasOwnProperty.call(known.declared, path.root);
    if (!path || (!declared && _consoleContextRoot(path.root))) return none(_debuggerSessions.has(tabId));
  }
  await _consoleTypingStateRestored;
  const session = _debuggerSessions.has(tabId);
  if (!session && (options.attach !== true || _consoleAttachRefused.has(tabId))) return none(false);
  if ((_liveBackoff.get(tabId) || 0) > Date.now()) return none(session);
  // A Run in flight, or an abandoned walk or preview still running in the page: nothing more is
  // sent. Typing calls (completion, preview) queue behind each other (Task 8).
  if (_consoleRunsInFlight.has(tabId) || _pendingWalks.has(tabId)) return none(session);
  if (!(await _hasDebuggerPermission())) return none(false);
  return _queueConsoleRun(tabId, () => _completeConsoleNow(tabId, expr));
}

async function _completeConsoleNow(tabId, expr) {
  const api = _consoleScopeApi();
  const target = { tabId };
  // Queued behind a preview that was abandoned meanwhile (Task 8): one pending typing call per tab.
  if (_pendingWalks.has(tabId)) return { names: null, attached: _debuggerSessions.has(tabId) };
  let attached;
  try {
    attached = await _ensureDebuggerAttached(tabId);
  } catch {
    _dropDebuggerSession(tabId);
    try { chrome.debugger.detach(target, () => void chrome.runtime.lastError); } catch { /* nothing attached */ }
    return { names: null, attached: false };
  }
  // Only a page too slow to answer earns the pause (fix round 2): a typo, a refusal or a walk that is
  // off answers at once and costs the page nothing.
  const backOff = () => _liveBackoff.set(tabId, Date.now() + CONSOLE_LIVE_BACKOFF_MS);
  try {
    const ran = await _withConsoleScope(tabId, attached === 'new', async (scope) => {
      const cached = _liveGlobals.get(tabId);
      const fresh = cached && cached.objectId === scope.objectId && Date.now() - cached.at < CONSOLE_LIVE_TTL_MS ? cached : null;
      // The globals' age goes with them: the panel's freshness counts from this read.
      if (expr === null && fresh) return { ...fresh.answer, age: Date.now() - fresh.at };
      const lexical = expr === null ? null : fresh ? fresh.lexical : await _liveLexicalNames(target);
      const plan = api.planComplete(expr, { context: [], declared: scope.declared || {}, lexical: lexical || [] }, scope.suffix);
      if (!plan) return { names: [] };
      const answer = await _liveWalk(tabId, target, scope, plan, expr === null);
      if (answer?.names && expr === null) _liveGlobals.set(tabId, { objectId: scope.objectId, answer, lexical: answer.lexical, at: Date.now() });
      return answer;
    }, CONSOLE_COMPLETE_SCOPE_MS);
    if (ran.reset) _notePendingScopeReset(tabId);
    const value = ran.value || { names: null };
    if (value.timeout) backOff();
    if (!value.names) return { names: null, attached: true };
    const answer = { names: value.names, attached: true };
    if (value.type) answer.type = value.type;
    if (value.capped) answer.capped = true;
    if (value.getter) answer.getter = true;
    if (expr === null) {
      answer.age = Number.isFinite(value.age) ? value.age : 0;
      answer.declared = Object.entries(ran.scope.declared || {}).map(([name, kind]) => ({ name, kind }));
    }
    return answer;
  } catch (err) {
    const kind = _debuggerFailureKind(err);
    if (kind !== 'evaluation') {
      _dropDebuggerSession(tabId);
      return { names: null, attached: false };
    }
    // A scope the page did not make in time: no answer, and a pause before asking again.
    if (err?.kind === 'timeout') backOff();
    return { names: null, attached: true };
  }
}

// The page's top-level let/const/class names (strings only), or null.
async function _liveLexicalNames(target) {
  const call = _debuggerCommand(target, 'Runtime.globalLexicalScopeNames', {});
  call.catch(() => {});
  const got = await _raceTimeout(call, CONSOLE_COMPLETE_TIMEOUT_MS).catch(() => null);
  return got !== CONSOLE_TIMED_OUT && Array.isArray(got?.names) ? got.names.filter((name) => typeof name === 'string') : null;
}

// One walk (see above). Answers the decoded { names, type?, capped, getter? }, { names: null } (refused,
// the walk off on this page) or { names: null, timeout: true }. Never terminates: a late call is
// abandoned — and stays the tab's one pending walk (no other is sent) until it settles, or until an
// explicit Run stops it first (_settleAbandonedWalk).
async function _liveWalk(tabId, target, scope, plan, globals) {
  const api = _consoleScopeApi();
  const send = (method, params) => _debuggerCommand(target, method, params);
  const release = () => send('Runtime.releaseObjectGroup', { objectGroup: CONSOLE_COMPLETE_GROUP }).catch(() => {});
  const call = send('Runtime.callFunctionOn', {
    objectId: scope.objectId, functionDeclaration: plan.text,
    // The walk's deadline (round 3): one the page could only start later does nothing ('S').
    arguments: [{ value: scope.key }, { value: plan.path }, { value: Date.now() + CONSOLE_COMPLETE_TIMEOUT_MS }],
    // Defence in depth for a path walk (a Proxy reached on the walk runs its traps without write
    // rights). Not for the globals list: the global object is no Proxy, its listing runs no page
    // code at all, and V8 counts the lazy materialisation of some built-in globals (`Temporal`)
    // as a side effect — which would refuse the whole list.
    returnByValue: true, throwOnSideEffect: !globals, objectGroup: CONSOLE_COMPLETE_GROUP, silent: true,
  });
  // Whenever it settles — now or after it was abandoned — its group goes.
  const settled = call.then(release, release);
  // A rejection (a lost scope) propagates: _withConsoleScope makes a new one.
  const first = await _raceTimeout(call, CONSOLE_COMPLETE_TIMEOUT_MS);
  if (first === CONSOLE_TIMED_OUT) {
    const pending = settled.then(() => { if (_pendingWalks.get(tabId) === pending) _pendingWalks.delete(tabId); });
    _pendingWalks.set(tabId, pending);
    return { names: null, timeout: true };
  }
  if (!first || first.exceptionDetails) return { names: null };
  const decoded = api.decodeLive(first?.result?.value);
  if (!decoded || !globals) return decoded || { names: null };
  // The page's top-level let/const/class names: no properties of the global object (strings only).
  const lexical = await _liveLexicalNames(target);
  if (lexical === null) return { names: null };
  const seen = new Set(decoded.names.map((n) => n.name));
  const pageNames = decoded.names.filter((n) => !n.native);
  const builtIns = decoded.names.filter((n) => n.native);
  for (const name of lexical) {
    if (name === '__proto__' || seen.has(name)) continue;
    seen.add(name);
    pageNames.push({ name, kind: 'property', own: true });
  }
  // Never cut silently (fix round 2): everything up to the hard bound, `capped` past it.
  const merged = [...pageNames, ...builtIns];
  return { names: merged.slice(0, api.LIVE_GLOBALS_MAX), capped: decoded.capped || merged.length > api.LIVE_GLOBALS_MAX, lexical };
}

// Before an explicit Run (round 4): a completion walk still pending in the page (abandoned at its
// deadline) is waited for, at most CONSOLE_ABANDONED_SETTLE_MS — never terminated: what holds it
// back may be the page's own task, which a terminate would cut. It stays tracked until it settles
// (no second walk is sent meanwhile). A walk that has not started skips itself past its deadline;
// one hung inside a Proxy trap holds the Run until the Run's own cap, and the Run then reports
// truthfully that it was not run.
async function _settleAbandonedWalk(tabId) {
  const pending = _pendingWalks.get(tabId);
  if (pending) await _raceTimeout(pending, CONSOLE_ABANDONED_SETTLE_MS);
}

// ── Eager preview (spec §4, Task 8) ─────────────────────────────────────────────────────────────
// While the user types a complete expression, the page evaluates it through the same session and
// scope, and the typing path's rules hold (Task 7 fix round 1 ruling, binding here):
//   1. no remote object of a page or declared value is ever created: the draft runs in a STRICT
//      function on the scope (shared/console-scope.js planPreview: the run builder's locals, nothing
//      written back) under throwOnSideEffect, and its value — or what it threw, caught in the page —
//      is projected IN THE PAGE by the scope's own projector (descriptor reads, natives taken at
//      scope creation, no getter, no `stack`, no `then`) into typed-model text read by value. No
//      returnByValue:false, no generatePreview: CDP would describe an Error value by running the
//      page's Error.prepareStackTrace with full rights;
//   2. the typing path never sends or refreshes the context (fix round 1, ruling option C: the
//      first version's context call ran the helpers' revival outside the side-effect check, so a
//      page that wrapped JSON.parse/trim/isArray received the selected entry and the entry list from
//      typing alone). A draft that names context members reads the members the user's last explicit
//      Run revived in the scope — only when each one's digest (taken by the worker from the context
//      text the panel sends it; nothing goes to the page) equals the digest at that Run;
//   3. nothing is terminated: past CONSOLE_PREVIEW_TIMEOUT_MS the call is abandoned (its object group
//      released when it settles), becomes the tab's one pending typing call (_pendingWalks, shared
//      with completion: nothing more is sent until it settles; a Run waits for it ≤ 500 ms) and
//      typing backs off 5 s. Every call carries its deadline: one the page starts later does nothing.
// A side effect V8 refuses is an uncatchable EvalError (exceptionDetails): no preview. So is a draft
// the worker's own check refuses (previewable): what would not compile is never sent, because CDP
// describes a SyntaxError through the page's prepareStackTrace, which can quote a token of it.
const CONSOLE_PREVIEW_TIMEOUT_MS = 300;

// Per tab: the scope (objectId) the last explicit Run revived its context in, and a digest of each
// context member it named (fix round 1). A preview may read a member only while its digest is the
// same now. A Run that never began (compile error, skipped, timed out) leaves none.
const _consoleContextDigests = new Map(); // tabId -> { objectId, digests: { name: digest } }

function _consoleContextDigest(full, name) {
  const text = JSON.stringify(_consoleContextArgument(full, [name]));
  // Two FNV-1a passes (different offsets): a digest, not a secret — a collision could only show a
  // preview of what the last Run already revived.
  let a = 0x811c9dc5;
  let b = 0x01000193 ^ 0x5bd1e995;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    a = Math.imul(a ^ c, 0x01000193) >>> 0;
    b = Math.imul(b ^ c, 0x01000193 + 2) >>> 0;
  }
  return `${text.length}:${a.toString(16)}:${b.toString(16)}`;
}

function _recordConsoleContext(tabId, scope, full, needed) {
  const digests = {};
  for (const name of needed) digests[name] = _consoleContextDigest(full, name);
  _consoleContextDigests.set(tabId, { objectId: scope.objectId, digests });
}

function _consoleContextCurrent(tabId, scope, full, needed) {
  const known = _consoleContextDigests.get(tabId);
  if (!known || known.objectId !== scope.objectId) return false;
  return needed.every((name) => Object.prototype.hasOwnProperty.call(known.digests, name) && known.digests[name] === _consoleContextDigest(full, name));
}
const CONSOLE_PREVIEW_GROUP = 'xray-preview';

// Answers { attached, value?, thrown? } — `value`/`thrown`: typed-model text (the panel's
// consoleEager.previewTexts draws it); neither: nothing to show (not asked, refused, a side effect,
// too late, or the preview is off on this page). `options.attach`: ≥ 2 characters and a 150 ms pause.
async function _previewConsoleInTab(tabId, code, context, options = {}) {
  const none = (attached) => ({ attached });
  if (!Number.isInteger(tabId) || tabId < 0) return none(false);
  const api = _consoleScopeApi();
  const session = _debuggerSessions.has(tabId);
  if (!api || typeof code !== 'string' || !api.previewable(code)) return none(session);
  await _consoleTypingStateRestored;
  if (!session && (options.attach !== true || _consoleAttachRefused.has(tabId))) return none(false);
  if ((_liveBackoff.get(tabId) || 0) > Date.now()) return none(session);
  if (_consoleRunsInFlight.has(tabId) || _pendingWalks.has(tabId)) return none(session);
  if (!(await _hasDebuggerPermission())) return none(false);
  return _queueConsoleRun(tabId, () => _previewConsoleNow(tabId, code, context));
}

async function _previewConsoleNow(tabId, code, context) {
  const api = _consoleScopeApi();
  const target = { tabId };
  // Queued behind another typing call that was abandoned meanwhile: nothing more is sent.
  if (_pendingWalks.has(tabId)) return { attached: _debuggerSessions.has(tabId) };
  let attached;
  try {
    attached = await _ensureDebuggerAttached(tabId);
  } catch {
    _dropDebuggerSession(tabId);
    try { chrome.debugger.detach(target, () => void chrome.runtime.lastError); } catch { /* nothing attached */ }
    return { attached: false };
  }
  try {
    const ran = await _withConsoleScope(tabId, attached === 'new', async (scope) => {
      const full = _consoleContextValue(context);
      const plan = api.planPreview(code, _consoleKnownNames(full, scope.declared), scope.suffix);
      if (!plan) return {};
      const deadline = Date.now() + CONSOLE_PREVIEW_TIMEOUT_MS;
      const key = { value: scope.key };
      const base = { objectId: scope.objectId, returnByValue: true, objectGroup: CONSOLE_PREVIEW_GROUP, silent: true };
      // Fix round 1 (ruling option C): nothing of the context is ever sent or refreshed from here.
      // A draft that names context members reads what the user's last Run revived in this scope,
      // and only while those members are still the current ones (same digest); else no preview.
      if (plan.needed.length && !_consoleContextCurrent(tabId, scope, full, plan.needed)) return {};
      const answer = await _typingCall(tabId, target, {
        ...base, functionDeclaration: plan.text, arguments: [key, { value: deadline }], throwOnSideEffect: true,
      }, deadline);
      if (answer.timeout) return { timeout: true };
      // A refused side effect (EvalError) or a compile error: nothing to show.
      if (!answer.answer || answer.answer.exceptionDetails) return {};
      return api.decodePreview(answer.answer.result?.value) || {};
    }, CONSOLE_COMPLETE_SCOPE_MS);
    if (ran.reset) _notePendingScopeReset(tabId);
    const value = ran.value || {};
    if (value.timeout) _liveBackoff.set(tabId, Date.now() + CONSOLE_LIVE_BACKOFF_MS);
    const out = { attached: true };
    if (typeof value.value === 'string') out.value = value.value;
    else if (typeof value.thrown === 'string') out.thrown = value.thrown;
    return out;
  } catch (err) {
    if (_debuggerFailureKind(err) !== 'evaluation') {
      _dropDebuggerSession(tabId);
      return { attached: false };
    }
    // A scope the page did not make in time: nothing, and a pause before asking again.
    if (err?.kind === 'timeout') _liveBackoff.set(tabId, Date.now() + CONSOLE_LIVE_BACKOFF_MS);
    return { attached: true };
  }
}

// One typing-path call: answered by its deadline, or abandoned — never terminated. An abandoned call
// is the tab's one pending typing call until it settles; its object group goes when it does.
async function _typingCall(tabId, target, params, deadline) {
  const release = () => _debuggerCommand(target, 'Runtime.releaseObjectGroup', { objectGroup: params.objectGroup }).catch(() => {});
  const call = _debuggerCommand(target, 'Runtime.callFunctionOn', params);
  const settled = call.then(release, release);
  // A rejection (a lost scope) propagates: _withConsoleScope makes a new one.
  const first = await _raceTimeout(call, deadline - Date.now());
  if (first === CONSOLE_TIMED_OUT) {
    const pending = settled.then(() => { if (_pendingWalks.get(tabId) === pending) _pendingWalks.delete(tabId); });
    _pendingWalks.set(tabId, pending);
    return { timeout: true };
  }
  return { answer: first };
}

function _dropDebuggerSession(tabId) {
  const session = _debuggerSessions.get(tabId);
  if (session?.timer) clearTimeout(session.timer);
  _debuggerSessions.delete(tabId);
  _sessionRemove(CONSOLE_IDLE_KEY + tabId);
}

// What a rejected CDP command means for the session (bug 2): the debugger was detached (the
// user closed Chrome's debugging bar, or another debugger took over), the tab is gone, or the
// evaluation itself failed while the session lives on.
function _debuggerFailureKind(err) {
  const message = String(err?.message || err || '');
  if (/detached|not attached/i.test(message)) return 'detached';
  // A navigation keeps the debugger attached ("Inspected target navigated or closed"): only a
  // tab or target that is gone drops the session.
  if (/no tab with|tab (?:was )?closed|target closed|no target with given id/i.test(message)) return 'tab-closed';
  return 'evaluation';
}

const CONSOLE_DEBUGGER_MESSAGES = {
  attach: 'XRAY could not attach the Chrome debugger to this tab.',
  detached: 'The debugger was detached from this tab (its debugging bar was closed, or another debugger took over). Run the command again to reattach.',
  'tab-closed': 'The tab was closed before the command finished.',
};

// A failure of the debugger itself (never the page's exception): `kind` says what failed and
// the message says so; the CDP text, when there is one, rides along as the stack.
function _consoleDebuggerError(kind, err, timeoutMs = CONSOLE_EVAL_TIMEOUT_MS) {
  const detail = err ? String(err?.message || err) : '';
  const message = kind === 'evaluation'
    ? `Evaluation failed: ${detail || 'the debugger gave no reason'}`
    : kind === 'timeout' ? `Execution timeout (${timeoutMs / 1000}s)`
      : kind === 'skipped' ? `Not run: the page was busy for more than ${timeoutMs / 1000} s` : CONSOLE_DEBUGGER_MESSAGES[kind];
  return { type: 'error', error: { kind, message, stack: detail } };
}

const AI_TIMEOUT_MS = 45000;
const MAX_AI_PROMPT_CHARS = 40000;

async function _callAnthropic(settings, prompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': settings.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: settings.model || 'claude-fable-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || `Anthropic error ${response.status}`);
  }
  const text = Array.isArray(data?.content) ? data.content.map((part) => part?.text || '').join('').trim() : '';
  return text || 'No explanation returned.';
}

// Only these may be reached over plaintext http, so a local model server works while a
// typo'd public endpoint cannot silently send captured traffic in the clear.
const AI_LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

// A custom endpoint is user-supplied, unlike the two hardcoded providers, so it is
// validated here in the service worker rather than trusted from the settings page.
function _resolveCustomEndpoint(rawUrl) {
  let url;
  try {
    url = new URL(String(rawUrl || '').trim());
  } catch {
    throw new Error('Custom AI endpoint is not a valid URL.');
  }
  const isLocal = AI_LOCAL_HOSTS.has(url.hostname);
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && isLocal)) {
    throw new Error('Custom AI endpoint must use https. Plain http is allowed only for localhost.');
  }
  // Accept either a complete endpoint or a base URL, so both
  // "https://host/v1" and "https://host/v1/chat/completions" work.
  if (/\/(chat\/completions|completions|messages|responses)\/?$/.test(url.pathname)) return url.toString();
  url.pathname = `${url.pathname.replace(/\/+$/, '')}/chat/completions`;
  return url.toString();
}

// Reads both common response shapes so one code path covers OpenAI-compatible servers
// and Anthropic-shaped ones without the user having to say which they are.
function _extractCompletionText(data) {
  const openAiStyle = data?.choices?.[0]?.message?.content;
  if (typeof openAiStyle === 'string') return openAiStyle.trim();
  // Some servers return the older completion shape.
  const legacy = data?.choices?.[0]?.text;
  if (typeof legacy === 'string') return legacy.trim();
  if (Array.isArray(data?.content)) {
    return data.content.map((part) => part?.text || '').join('').trim();
  }
  return '';
}

// One OpenAI-compatible caller serves both the built-in OpenAI provider and any custom
// endpoint. That shape is the de facto standard — OpenRouter, Groq, Together, DeepSeek,
// Mistral, Ollama, LM Studio and vLLM all speak it — which is what makes "bring any
// API key" work without a per-provider adapter.
async function _callOpenAiCompatible(settings, prompt, { endpoint, defaultModel }) {
  const headerName = String(settings.authHeader || 'authorization').trim().toLowerCase() || 'authorization';
  const prefix = settings.authPrefix === undefined || settings.authPrefix === null ? 'Bearer ' : String(settings.authPrefix);
  const headers = {
    'content-type': 'application/json',
    [headerName]: `${prefix}${settings.apiKey}`,
  };
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: settings.model || defaultModel,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  let data = null;
  try {
    data = await response.json();
  } catch {
    // A non-JSON body is common from proxies and misconfigured local servers; fall
    // through to the status-based error below rather than throwing a parse error.
  }
  if (!response.ok) {
    throw new Error(data?.error?.message || data?.message || `AI provider error ${response.status}`);
  }
  return _extractCompletionText(data) || 'No explanation returned.';
}

function _callOpenAI(settings, prompt) {
  return _callOpenAiCompatible(settings, prompt, {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    defaultModel: 'gpt-4o-mini',
  });
}

function _callCustomProvider(settings, prompt) {
  return _callOpenAiCompatible(settings, prompt, {
    endpoint: _resolveCustomEndpoint(settings.baseUrl),
    defaultModel: settings.model || '',
  });
}

// C-12: the panel used to send its whole AI settings object, API KEY INCLUDED, to
// the background on every explain call. That meant the key was resident in
// isolated-world memory on every page the user visited purely to be relayed, which
// is exactly what made C-5 (the storage fallback writing to the page's localStorage)
// a key-disclosure bug rather than a nuisance.
//
// The service worker now reads the key from chrome.storage.local itself. The panel
// sends a prompt and its noncredential expected destination. Any credentials sent are
// ignored: a content script is not a trusted source for them.
const AI_SETTINGS_STORAGE_KEY = 'xray_ai_settings';

async function _loadAiSettings() {
  try {
    const stored = await chrome.storage.local.get(AI_SETTINGS_STORAGE_KEY);
    const settings = stored?.[AI_SETTINGS_STORAGE_KEY];
    return settings && typeof settings === 'object' ? settings : null;
  } catch {
    return null;
  }
}

function _normalizeAiDestination(settings) {
  const provider = settings.provider === 'openai' || settings.provider === 'custom' ? settings.provider : 'anthropic';
  return {
    provider,
    model: String(settings.model || (provider === 'openai' ? 'gpt-4o-mini' : provider === 'anthropic' ? 'claude-fable-5' : '')),
    baseUrl: provider === 'custom' ? _resolveCustomEndpoint(settings.baseUrl) : provider === 'openai' ? 'https://api.openai.com/v1/chat/completions' : 'https://api.anthropic.com/v1/messages',
    authHeader: provider !== 'anthropic' ? String(settings.authHeader || 'authorization').trim().toLowerCase() || 'authorization' : 'x-api-key',
    authPrefix: provider !== 'anthropic' ? settings.authPrefix == null ? 'Bearer ' : String(settings.authPrefix) : '',
  };
}

async function _runAiExplain(prompt, expectedDestination) {
  const settings = await _loadAiSettings();
  if (!settings || typeof settings.apiKey !== 'string' || !settings.apiKey) {
    return { ok: false, error: 'Add an API key in Settings, AI to enable explanations.' };
  }
  if (typeof prompt !== 'string' || !prompt || prompt.length > MAX_AI_PROMPT_CHARS) {
    return { ok: false, error: 'Prepare a preview within 40,000 characters before analyzing.' };
  }
  const provider = settings.provider === 'openai' || settings.provider === 'custom' ? settings.provider : 'anthropic';
  if (provider === 'custom' && !settings.baseUrl) {
    return { ok: false, error: 'Custom provider needs an endpoint URL.' };
  }
  try {
    const destination = _normalizeAiDestination(settings);
    if (!expectedDestination || typeof expectedDestination !== 'object'
        || !['anthropic', 'openai', 'custom'].includes(expectedDestination.provider)
        || !['model', 'baseUrl', 'authHeader', 'authPrefix'].every(field => typeof expectedDestination[field] === 'string')
        || JSON.stringify(_normalizeAiDestination(expectedDestination)) !== JSON.stringify(destination)) {
      return { ok: false, error: 'AI destination changed. Review the new preview and select Analyze again.' };
    }
    const call =
      provider === 'custom'
        ? _callCustomProvider(settings, prompt)
        : provider === 'openai'
          ? _callOpenAI(settings, prompt)
          : _callAnthropic(settings, prompt);
    let timer;
    try {
      const text = await Promise.race([
        call,
        new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('timeout')), AI_TIMEOUT_MS); }),
      ]);
      return { ok: true, text };
    } finally { clearTimeout(timer); }
  } catch {
    // Provider/authentication failures can echo credentials or captured payloads.
    return { ok: false, error: 'AI request failed. Check the provider configuration and try again explicitly.' };
  }
}

chrome.action.onClicked.addListener((tab) => {
  void _sendHudToggle(tab?.id);
});

chrome.windows.onRemoved.addListener((id) => {
  if (id === popoutWindowId) popoutWindowId = null;
});

chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command !== 'toggle-xray') return;
  console.debug('[XRAY] command received', command, 'tabArg:', tab?.id ?? null);

  // Some browsers do not provide tab for command events.
  // Try several active-tab strategies and send to the first reachable tab.
  const targetIds = await _collectToggleTargets(tab);
  console.debug('[XRAY] command target candidates', targetIds);
  for (const targetId of targetIds) {
    if (await _sendToggle(targetId)) return;
  }

  console.debug('[XRAY] command toggle failed: no reachable target tab');
});

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'xray-devtools') return;

  let boundTabId = null;

  port.onMessage.addListener((msg) => {
    if (!msg || msg.type !== 'xray:devtools:init') return;
    const tabId = Number(msg.tabId);
    if (!Number.isInteger(tabId) || tabId < 0) return;

    boundTabId = tabId;
    _devtoolsPortsByTab.set(tabId, port);
  });

  port.onDisconnect.addListener(() => {
    if (boundTabId !== null && _devtoolsPortsByTab.get(boundTabId) === port) {
      _devtoolsPortsByTab.delete(boundTabId);
    }
    for (const [tabId, mappedPort] of _devtoolsPortsByTab.entries()) {
      if (mappedPort === port) _devtoolsPortsByTab.delete(tabId);
    }
  });
});

// Keep service worker alive for message relaying (Phase 4: DevTools bridge)
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // Only accept messages from this extension's own surfaces. There is no
  // externally_connectable, so a web page cannot reach here directly, but this makes
  // the assumption explicit rather than inherited from a manifest omission.
  if (sender?.id !== chrome.runtime.id) return false;
  // sendMessage(null) or sendMessage(undefined) from any surface would otherwise throw
  // inside the listener on the first property access.
  if (!msg || typeof msg !== 'object') return false;

  if (msg.type === 'XRAY_HUD_TOGGLE_ACTIVE') {
    _toggleHudOnBestTab(sender?.tab)
      .then((ok) => sendResponse({ ok }))
      .catch((err) => sendResponse({ ok: false, error: err?.message || String(err) }));
    return true;
  }

  if (msg.type === 'XRAY_OPEN_WINDOW') {
    _openPopoutWindow()
      .then((result) => sendResponse(result))
      .catch((err) => sendResponse({ ok: false, error: err?.message || String(err) }));
    return true;
  }

  if (msg.type === 'xray:ping') {
    sendResponse({ alive: true });
    return true;
  }

  // Config/replay relay for surfaces without an in-page bridge (DevTools panel):
  // forward to the inspected tab's content script, which posts into the MAIN
  // world with its own bridge token.
  if (msg.type === 'xray:page-bridge') {
    // A content script may only drive its own tab. Without this, any content script —
    // and XRAY runs one on every frame of every URL — could push config or a replay
    // request into any other tab by naming its id. Extension pages (the DevTools
    // panel, which has no sender.tab) legitimately target the inspected tab, so they
    // keep supplying it.
    const senderTabId = sender?.tab?.id;
    const tabId = Number.isInteger(senderTabId) ? senderTabId : Number(msg.tabId);
    const kind = msg.kind;
    if (!Number.isInteger(tabId) || tabId < 0 || (kind !== 'config' && kind !== 'replay')) {
      sendResponse({ ok: false });
      return true;
    }
    chrome.tabs.sendMessage(tabId, { type: 'xray:page-bridge', kind, config: msg.config, request: msg.request })
      .then(() => sendResponse({ ok: true }))
      .catch((err) => sendResponse({ ok: false, error: err?.message || String(err) }));
    return true;
  }

  if (msg.type === 'xray:capture') {
    const tabId = sender?.tab?.id;
    if (Number.isInteger(tabId) && msg.entry) _relayCapture(tabId, { type: 'xray:capture', entry: msg.entry }, 1, sendResponse);
    else sendResponse({ ok: false, delivery: 'relay-failed', count: 1 });
    return true;
  }

  if (msg.type === 'xray:capture-batch') {
    const tabId = sender?.tab?.id;
    if (Number.isInteger(tabId) && Array.isArray(msg.entries)) _relayCapture(tabId, { type: 'xray:capture-batch', entries: msg.entries }, msg.entries.length, sendResponse);
    else sendResponse({ ok: false, delivery: 'relay-failed', count: 1 });
    return true;
  }

  if (msg.type === 'xray:capture-update') {
    const tabId = sender?.tab?.id;
    if (Number.isInteger(tabId) && msg.update) _relayCapture(tabId, { type: 'xray:capture-update', update: msg.update }, 1, sendResponse);
    else sendResponse({ ok: false, delivery: 'relay-failed', count: 1 });
    return true;
  }

  if (msg.type === 'xray:ai-explain') {
    // msg.settings is deliberately NOT read: the key comes from storage, not the page.
    _runAiExplain(msg.prompt, msg.expectedDestination)
      .then((result) => sendResponse(result))
      .catch(() => sendResponse({ ok: false, error: 'AI request failed. Check the provider configuration.' }));
    return true;
  }

  if (msg.type === 'xray:has-debugger-permission') {
    _hasDebuggerPermission().then((granted) => sendResponse({ granted }));
    return true;
  }

  if (msg.type === 'xray:console-focus') {
    // Like console-eval, only the in-page surfaces run the Console: the sender's own tab.
    const tabId = sender?.tab?.id;
    if (Number.isInteger(tabId)) _setConsolePromptFocused(tabId, msg.focused === true);
    sendResponse({ ok: Number.isInteger(tabId) });
    return false;
  }

  if (msg.type === 'xray:console-complete') {
    // Live completion (Task 7): like console-eval, only for the sender's own tab.
    const tabId = sender?.tab?.id;
    const requestId = Number.isInteger(msg.requestId) ? msg.requestId : 0;
    if (!Number.isInteger(tabId)) {
      sendResponse({ requestId, names: null, attached: false });
      return false;
    }
    _completeConsoleInTab(tabId, msg.expr === null ? null : msg.expr, { attach: msg.attach === true })
      .then((out) => sendResponse({ requestId, ...out }))
      .catch(() => sendResponse({ requestId, names: null, attached: false }));
    return true;
  }

  if (msg.type === 'xray:console-preview') {
    // Eager preview (Task 8): like console-eval, only for the sender's own tab.
    const tabId = sender?.tab?.id;
    const requestId = Number.isInteger(msg.requestId) ? msg.requestId : 0;
    if (!Number.isInteger(tabId)) {
      sendResponse({ requestId, attached: false });
      return false;
    }
    _previewConsoleInTab(tabId, typeof msg.code === 'string' ? msg.code : '', typeof msg.context === 'string' ? msg.context : null, { attach: msg.attach === true })
      .then((out) => sendResponse({ requestId, ...out }))
      .catch(() => sendResponse({ requestId, attached: false }));
    return true;
  }

  if (msg.type === 'xray:console-eval') {
    const tabId = sender?.tab?.id;
    _evaluateConsoleInTab(tabId, msg.code, msg.context)
      .then((result) => sendResponse(result))
      .catch((err) => sendResponse({
        type: 'error',
        error: {
          message: err?.message || String(err),
          stack: err?.stack || '',
        },
      }));
    return true;
  }
});
