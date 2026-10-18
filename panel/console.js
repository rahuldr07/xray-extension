// panel/console.js - XRAY Console Engine.
window.XRAY_Console = (() => {
  'use strict';

  const STORAGE_KEY = 'xray_console_history';
  const MAX_HISTORY = 100;

  let _history = [];
  let _historyIndex = -1;
  let _currentEntry = null;
  let _pins = {};
  let _scope = {};
  let _initialized = false;

  function init() {
    if (_initialized) return;
    _initialized = true;

    // C-14: this used to read the PAGE's localStorage, so every site could read the
    // console history the analyst had typed on every OTHER site. Extension storage is
    // per-extension and the page cannot reach it. Loading is async, so history is
    // briefly empty on first open; that is strictly better than the alternative.
    if (window.XRAY_Store?.get) {
      window.XRAY_Store.get(STORAGE_KEY, null).then((stored) => {
        if (Array.isArray(stored)) {
          _history = stored.filter((item) => typeof item === 'string').slice(0, MAX_HISTORY);
        }
      }).catch(() => {});
    }

    // C-1: init used to postMessage a console session id to the page world and
    // listen for XRAY_EVAL_RESULT back. That handshake existed only to serve the
    // MAIN-world fallback executor, which received the whole console context with
    // targetOrigin '*'. Both are gone; execution is privileged-path only.
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
      try { window.XRAY_Store?.set?.(STORAGE_KEY, _history); } catch {}
    }
    _historyIndex = -1;
  }

  const MAX_CONTEXT_ENTRIES = 300;
  const MAX_SAME_ENDPOINT_FULL = 10;

  function _slimEntry(entry) {
    if (!entry) return entry;
    return {
      id: entry.id,
      type: entry.type,
      source: entry.source,
      method: entry.method,
      url: entry.url,
      urlPath: entry.urlPath,
      status: entry.status,
      duration: entry.duration,
      size: entry.size,
      timestamp: entry.timestamp,
      ...(entry.logLevel ? { logLevel: entry.logLevel } : {}),
      ...(entry.graphql ? { graphql: { operationType: entry.graphql.operationType, operationName: entry.graphql.operationName } } : {}),
      ...(entry.mocked ? { mocked: true } : {}),
      ...(entry.replayed ? { replayed: true } : {}),
      __slim__: true,
    };
  }

  // The payload is structured-cloned to the background, JSON-inlined into a
  // debugger expression, and parsed again in the page — shipping every entry
  // with full bodies cost megabytes per Run. Helpers only need full data for
  // the current entry and its same-endpoint neighbours (res/req/prev/next/
  // diff); the rest travels as slim projections for $all()/$errors()/$slow().
  // Saved variables (`temp1`, `$_`) can each be a large result. Only ship the ones
  // the code actually names; an identifier token is enough (over-inclusion from a
  // string literal or comment is harmless). Without `code` (runtime preview) the
  // whole scope is included.
  function _referencedNames(code) {
    return typeof code === 'string' ? new Set(code.match(/[$A-Za-z_][\w$]*/g) || []) : null;
  }

  function _referencedScope(code) {
    const names = _referencedNames(code);
    if (!names) return _scope;
    const scope = {};
    for (const name of Object.keys(_scope)) {
      if (names.has(name)) scope[name] = _scope[name];
    }
    return scope;
  }

  // JSON text of a value, or null when it cannot be written (a BigInt, a cycle, too deep).
  function _json(value) {
    try {
      const text = JSON.stringify(value);
      return typeof text === 'string' ? text : null;
    } catch {
      return null;
    }
  }

  // A member whose JSON text is already written (a nested object, a typed value). A private
  // class, so no value from the page or a saved variable can pose as one.
  class WrittenJson {
    constructor(text) {
      this.text = text;
    }
  }

  // A JSON object from [key, value] members, each written on its own: a member that cannot
  // be written is left out instead of costing the whole object.
  function _jsonObject(members) {
    const parts = [];
    for (const [key, value] of members) {
      const text = value instanceof WrittenJson ? value.text : _json(value);
      if (text !== null) parts.push(`${JSON.stringify(key)}:${text}`);
    }
    return new WrittenJson(`{${parts.join(',')}}`);
  }

  // The typed body the running surface reads (spec J8: its lossless parse, integers past 2^53
  // as bigint envelopes), as JSON text — or null, and the page parses the raw text instead.
  function _readValue(readBody, entry, side) {
    if (!readBody || !entry) return null;
    let text = null;
    try {
      text = _json(readBody(entry, side));
    } catch {
      text = null;
    }
    return text === null ? null : new WrittenJson(text);
  }

  // Which typed values the code needs; names as in shared/console-helpers.js createRuntime.
  const VALUE_NAMES = {
    res: ['res', 'response', '$res'],
    req: ['req', 'request', '$req'],
    prev: ['prev'],
    next: ['next'],
  };

  // Pinned requests (`a`…`f`) travel only when the code names them (same identifier
  // rule as the scope), and only as `{ id, value }` (the typed body, spec J8) or
  // `{ id, body }` (its text, when no typed value can be read) — never the full entry with
  // its headers, cookies or token lenses. The panel store owns the pins and re-sends them
  // whenever a pinned entry is patched or evicted, so what is held here is current;
  // an evicted pin is already gone, never substituted.
  function _referencedPins(code, readBody) {
    const names = _referencedNames(code);
    const pins = [];
    for (const name of Object.keys(_pins)) {
      if (names && !names.has(name)) continue;
      const entry = _pins[name];
      const value = _readValue(readBody, entry, 'response');
      pins.push([name, value === null
        ? _jsonObject([['id', entry.id], ['body', entry.responseDecrypted || entry.responseRaw || null]])
        : _jsonObject([['id', entry.id], ['value', value]])]);
    }
    return _jsonObject(pins);
  }

  // res, req, prev and next as typed JSON text, for the names the code uses (all of them
  // without code). prev/next are the same-endpoint neighbours in the list the page gets.
  function _referencedValues(code, readBody, current, entries) {
    if (!readBody || !current) return new WrittenJson('{}');
    const names = _referencedNames(code);
    const wanted = (key) => !names || VALUE_NAMES[key].some((name) => names.has(name));
    const sibling = window.XRAY_ConsoleHelpers?.siblingEntry;
    const sources = {
      res: () => [current, 'response'],
      req: () => [current, 'request'],
      prev: () => [sibling ? sibling(entries, current, -1) : null, 'response'],
      next: () => [sibling ? sibling(entries, current, 1) : null, 'response'],
    };
    const members = [];
    for (const key of Object.keys(VALUE_NAMES)) {
      if (!wanted(key)) continue;
      const [entry, side] = sources[key]();
      const value = _readValue(readBody, entry, side);
      if (value !== null) members.push([key, value]);
    }
    return _jsonObject(members);
  }

  // The context as tagged JSON text (spec J8): entries are plain data; the saved variables
  // (`scope`, already in the typed model), `values` and pin values are typed and revived in
  // the page (shared/console-helpers.js reviveContext). Text, so nothing between here and
  // the page reorders it, and the page parses it — never runs it.
  function _contextPayload(code, readBody) {
    const all = _entries();
    const current = _currentEntry;
    const windowed = all.slice(-MAX_CONTEXT_ENTRIES);
    const fullIds = new Set();
    if (current) {
      fullIds.add(current.id);
      const currentPath = String(current.urlPath || current.url || '');
      if (currentPath) {
        const sameEndpoint = [];
        for (const entry of windowed) {
          if (entry && entry.type === 'api' && String(entry.urlPath || entry.url || '') === currentPath) {
            sameEndpoint.push(entry.id);
          }
        }
        sameEndpoint.slice(-MAX_SAME_ENDPOINT_FULL).forEach((id) => fullIds.add(id));
      }
    }
    const entries = windowed.map((entry) => (entry && fullIds.has(entry.id) ? entry : _slimEntry(entry)));
    if (current && !entries.some((entry) => entry && entry.id === current.id)) entries.push(current);
    const scope = _referencedScope(code);
    return _jsonObject([
      ['currentEntry', current],
      ['entries', entries],
      ['scope', _jsonObject(Object.keys(scope).map((name) => [name, scope[name]]))],
      ['pins', _referencedPins(code, readBody)],
      ['values', _referencedValues(code, readBody, current, entries)],
    ]).text;
  }

  // The result arrives as typed JSON text (shared/console-helpers.js encodeResult); the
  // panel holds the typed model (src/panel/models/logValue.ts renders it). `render` is the
  // out-of-band table() flag. Errors and empty answers pass through.
  function _reviveResult(response) {
    if (!response || typeof response !== 'object' || typeof response.result !== 'string') return response;
    let result;
    try {
      result = JSON.parse(response.result);
    } catch {
      return { type: 'error', error: { message: 'XRAY could not read the console result.' } };
    }
    const out = { type: String(response.type || typeof result), result, truncated: response.truncated === true };
    if (response.render === 'table') out.render = 'table';
    return out;
  }

  // `options.readBody(entry, side)` gives the typed body of an entry's 'response' or
  // 'request' (the running surface's lossless parse); without it the page parses raw text.
  async function execute(code, options) {
    const trimmed = (code || '').trim();
    if (!trimmed) return { type: 'empty' };
    init();
    _saveHistory(trimmed);
    const readBody = typeof options?.readBody === 'function' ? options.readBody : null;
    const context = _contextPayload(trimmed, readBody);
    const privileged = await _executePrivileged(trimmed, context);
    if (privileged) return _reviveResult(privileged);
    // C-1: the MAIN-world fallback used to run here. It posted the entire console
    // context — cross-origin captured URLs, full bodies, decoded JWT claims — into
    // the page with targetOrigin '*'. Failing loudly is the correct trade: the
    // context must never enter the page world.
    return {
      type: 'error',
      error: { message: 'XRAY console needs the debugger attachment to run. Reload the page and try again.' },
    };
  }

  function _executePrivileged(code, context) {
    if (!window.chrome?.runtime?.sendMessage) return Promise.resolve(null);

    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        type: 'xray:console-eval',
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


  function getRuntimePreview() {
    const helpers = window.XRAY_ConsoleHelpers;
    if (!helpers?.createRuntime || !helpers.reviveContext) return {};
    try {
      return helpers.createRuntime(helpers.reviveContext(_contextPayload()), (text) => navigator.clipboard?.writeText?.(text));
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

  // The panel store owns pins (session-only, `a`…`f`); it replaces them wholesale.
  function setPins(pins) {
    _pins = {};
    for (const [name, entry] of Object.entries(pins || {})) {
      if (/^[a-f]$/.test(name) && entry && typeof entry === 'object') _pins[name] = entry;
    }
  }

  function clearScope() {
    _scope = {};
    _pins = {};
  }

  // Saved variables only (temp1…, $_); pins are request references and survive.
  function clearVariables() {
    _scope = {};
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
    setPins,
    clearScope,
    clearVariables,
    getScope,
  };
})();
