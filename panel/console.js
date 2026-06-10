// panel/console.js - XRAY Console Engine.
window.XRAY_Console = (() => {
  'use strict';

  const STORAGE_KEY = 'xray_console_history';
  const MAX_HISTORY = 100;
  const EXEC_TIMEOUT_MS = 10000;

  let _history = [];
  let _historyIndex = -1;
  let _currentEntry = null;
  let _pins = {};
  let _scope = {};
  let _evalId = 0;
  let _pendingEvals = new Map();
  let _sessionId = 'xray_console_' + Math.random().toString(36).slice(2) + '_' + Date.now().toString(36);
  let _initialized = false;

  function init() {
    if (_initialized) return;
    _initialized = true;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) _history = JSON.parse(raw).filter((item) => typeof item === 'string').slice(0, MAX_HISTORY);
    } catch {}

    window.postMessage({ type: 'XRAY_CONSOLE_SESSION', sessionId: _sessionId }, '*');

    window.addEventListener('message', (event) => {
      if (event.source !== window) return;
      if (!event.data || event.data.type !== 'XRAY_EVAL_RESULT') return;
      if (event.data.sessionId !== _sessionId) return;

      const { id, success, resultType, result, error, truncated } = event.data;
      const resolver = _pendingEvals.get(id);
      if (!resolver) return;
      _pendingEvals.delete(id);
      clearTimeout(resolver.timer);

      if (success) {
        resolver.resolve({ type: resultType, result, truncated: !!truncated });
      } else {
        resolver.resolve({ type: 'error', error: error || { message: 'Unknown execution error' } });
      }
    });
  }

  function setContext(entry) {
    _currentEntry = entry || null;
  }

  function getContext() {
    return _currentEntry;
  }

  function getContextSummary() {
    if (!_currentEntry) return null;
    return {
      method: _currentEntry.method || 'GET',
      url: _currentEntry.urlPath || _currentEntry.url || '(unknown)',
      status: Number(_currentEntry.status) || 0,
      duration: Number(_currentEntry.duration) || 0,
    };
  }

  function _entries() {
    return window.XRAY_Panel?.getEntries?.() || [];
  }

  function _saveHistory(command) {
    const trimmed = (command || '').trim();
    if (!trimmed) return;
    if (_history[0] !== trimmed) {
      _history.unshift(trimmed);
      if (_history.length > MAX_HISTORY) _history.pop();
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(_history)); } catch {}
    }
    _historyIndex = -1;
  }

  function _contextPayload() {
    return {
      currentEntry: _currentEntry,
      entries: _entries(),
      scope: _scope,
      pins: _pins,
    };
  }

  async function execute(code) {
    const trimmed = (code || '').trim();
    if (!trimmed) return { type: 'empty' };
    init();
    _saveHistory(trimmed);
    const privileged = await _executePrivileged(trimmed, _contextPayload());
    if (privileged) return privileged;
    return _executeInMainWorld(trimmed, _contextPayload());
  }

  function _executePrivileged(code, context) {
    if (!window.chrome?.runtime?.sendMessage) return Promise.resolve(null);

    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        type: 'xray:console-eval',
        sessionId: _sessionId,
        code,
        context,
      }, (response) => {
        const err = chrome.runtime.lastError;
        if (err) {
          resolve(null);
          return;
        }
        resolve(response || { type: 'undefined' });
      });
    });
  }

  function _executeInMainWorld(code, context) {
    return new Promise((resolve) => {
      const id = ++_evalId;
      const timer = setTimeout(() => {
        if (!_pendingEvals.has(id)) return;
        _pendingEvals.delete(id);
        resolve({ type: 'error', error: { message: `Execution timeout (${EXEC_TIMEOUT_MS / 1000}s)` } });
      }, EXEC_TIMEOUT_MS);

      _pendingEvals.set(id, { resolve, timer });
      window.postMessage({
        type: 'XRAY_EXEC_REQUEST',
        sessionId: _sessionId,
        id,
        code,
        context,
      }, '*');
    });
  }

  function getRuntimePreview() {
    const helpers = window.XRAY_ConsoleHelpers;
    if (!helpers?.createRuntime) return {};
    try {
      return helpers.createRuntime(_contextPayload(), (text) => navigator.clipboard?.writeText?.(text));
    } catch {
      return {};
    }
  }

  function navigateHistory(dir) {
    if (!_history.length) return null;
    if (dir === 'up' && _historyIndex < _history.length - 1) _historyIndex++;
    else if (dir === 'down' && _historyIndex > -1) _historyIndex--;
    return _historyIndex === -1 ? '' : _history[_historyIndex];
  }

  function getHistory() {
    return [..._history];
  }

  function setVar(name, value) {
    if (!/^[A-Za-z_$][\w$]*$/.test(name)) throw new Error('Invalid console variable name');
    _scope[name] = value;
  }

  function getVar(name) {
    return _scope[name];
  }

  function pin(name, entry = _currentEntry) {
    if (!entry) return 'No request selected';
    if (!/^[A-Za-z_$][\w$]*$/.test(name || '')) return 'Usage: pin("name")';
    _pins[name] = entry;
    return `Pinned as ${name}`;
  }

  function clearScope() {
    _scope = {};
    _pins = {};
  }

  function getScope() {
    return { ..._scope, ..._pins };
  }

  return {
    init,
    setContext,
    getContext,
    getContextSummary,
    getRuntimePreview,
    execute,
    navigateHistory,
    getHistory,
    setVar,
    getVar,
    pin,
    clearScope,
    getScope,
  };
})();
