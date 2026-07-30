// background.js — Service Worker
// Bridges the extension action / keyboard command to the content script panel toggle.

const _devtoolsPortsByTab = new Map();
let popoutWindowId = null;
const CONSOLE_EVAL_TIMEOUT_MS = 10000;
const MAX_RESULT_CHARS = 200000;
const VALID_CONSOLE_NAME = /^[A-Za-z_$][\w$]*$/;
const RUNTIME_HELPER_NAMES = [
  '$r', '$res', '$req', '$headers', '$h', '$rh', '$url', '$params',
  '$statusCode', '$time', '$size', '$method', '$all', '$similar', '$prev',
  '$next', '$errors', '$slow', '$status', '$endpoint', '$domain', '$schema',
  '$mock', '$copy', '$curl', '$fetch', 'copy', 'toCSV', 'toTable', 'diff',
  'schema', 'pick', 'omit', 'flatten', '_',
  'entry', 'res', 'response', 'req', 'request', 'headers', 'responseHeaders',
  'requestHeaders', 'prev', 'next', 'prevEntry', 'nextEntry', 'all', 'similar',
  'errors', 'slow', 'csv', 'table', 'mock', '$help', 'help',
];

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

function _isConsoleExpression(code) {
  const trimmed = String(code || '').trim();
  return !trimmed.includes(';') &&
    !trimmed.includes('\n') &&
    !/^(const|let|var|if|for|while|switch|try|class|function|return)\s/.test(trimmed);
}

function _buildConsoleExpression(code, context) {
  const trimmed = String(code || '').trim();
  const contextJson = JSON.stringify(context || {});
  const scopeNames = Object.keys(context?.scope || {});
  const pinNames = Object.keys(context?.pins || {});
  const names = [...new Set([...RUNTIME_HELPER_NAMES, ...scopeNames, ...pinNames])]
    .filter((name) => VALID_CONSOLE_NAME.test(name));
  const declarations = names
    .map((name) => `const ${name} = __runtime[${JSON.stringify(name)}];`)
    .join('\n');
  const userBody = _isConsoleExpression(trimmed) ? `return (${trimmed});` : trimmed;

  return `(async () => {
    const MAX_RESULT_CHARS = ${MAX_RESULT_CHARS};
    const __context = ${contextJson};
    const __helpers = window.XRAY_ConsoleHelpers;
    const __runtime = __helpers?.createRuntime
      ? __helpers.createRuntime(__context || {}, (text) => {
          try { navigator.clipboard?.writeText?.(text); } catch {}
        })
      : {};
    Object.assign(__runtime, __context?.scope || {}, __context?.pins || {});
    ${declarations}

    function __resultType(value) {
      if (value === undefined) return 'undefined';
      if (value === null) return 'null';
      if (Array.isArray(value)) return 'array';
      return typeof value;
    }

    function __safeSerialize(value) {
      const seen = typeof WeakSet !== 'undefined' ? new WeakSet() : null;
      let truncated = false;
      function normalize(input, depth = 0) {
        if (depth > 8) {
          truncated = true;
          return '[Max depth]';
        }
        if (input === null || input === undefined) return input;
        const type = typeof input;
        if (type === 'string') {
          if (input.length > MAX_RESULT_CHARS) {
            truncated = true;
            return input.slice(0, MAX_RESULT_CHARS) + '... (' + input.length + ' chars)';
          }
          return input;
        }
        if (type === 'number' || type === 'boolean') return input;
        if (type === 'bigint') return input.toString() + 'n';
        if (type === 'symbol') return String(input);
        if (type === 'function') return '[Function: ' + (input.name || 'anonymous') + ']';
        if (input instanceof Error) {
          return { __type__: 'Error', name: input.name, message: input.message, stack: input.stack };
        }
        if (input instanceof Date) return { __type__: 'Date', iso: input.toISOString() };
        if (typeof Element !== 'undefined' && input instanceof Element) {
          return '<' + input.tagName.toLowerCase() + (input.id ? '#' + input.id : '') + '>';
        }
        if (seen) {
          if (seen.has(input)) return '[Circular]';
          seen.add(input);
        }
        if (Array.isArray(input)) {
          const limit = Math.min(input.length, 1000);
          const out = input.slice(0, limit).map((item) => normalize(item, depth + 1));
          if (input.length > limit) {
            truncated = true;
            out.push('... +' + (input.length - limit) + ' more');
          }
          return out;
        }
        const out = {};
        const keys = Object.keys(input);
        const limit = Math.min(keys.length, 500);
        for (let i = 0; i < limit; i++) {
          const key = keys[i];
          try { out[key] = normalize(input[key], depth + 1); } catch { out[key] = '[Error reading property]'; }
        }
        if (keys.length > limit) {
          truncated = true;
          out['...'] = '+' + (keys.length - limit) + ' more keys';
        }
        return out;
      }
      const result = normalize(value);
      let json = '';
      try { json = JSON.stringify(result); } catch {}
      if (json.length > MAX_RESULT_CHARS) {
        truncated = true;
        return { result: json.slice(0, MAX_RESULT_CHARS) + '... (' + json.length + ' chars)', truncated };
      }
      return { result, truncated };
    }

    try {
      const __raw = await (async () => {
        ${userBody}
      })();
      const __serialized = __safeSerialize(__raw);
      return {
        type: __resultType(__raw),
        result: __serialized.result,
        truncated: !!__serialized.truncated,
      };
    } catch (err) {
      return {
        type: 'error',
        error: {
          message: err?.message || String(err),
          stack: err?.stack || '',
        },
      };
    }
  })()`;
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
// attachment per tab and detach only after an idle window.
const DEBUGGER_IDLE_DETACH_MS = 30000;
const _debuggerSessions = new Map(); // tabId -> { timer }

function _scheduleDebuggerDetach(tabId) {
  const session = _debuggerSessions.get(tabId);
  if (session?.timer) clearTimeout(session.timer);
  const timer = setTimeout(() => {
    _debuggerSessions.delete(tabId);
    try { chrome.debugger.detach({ tabId }, () => void chrome.runtime.lastError); } catch {}
  }, DEBUGGER_IDLE_DETACH_MS);
  _debuggerSessions.set(tabId, { timer });
}

async function _ensureDebuggerAttached(tabId) {
  const target = { tabId };
  if (_debuggerSessions.has(tabId)) {
    _scheduleDebuggerDetach(tabId);
    return;
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
      return;
    } catch {
      throw err;
    }
  }
  await _debuggerCommand(target, 'Runtime.enable');
  _scheduleDebuggerDetach(tabId);
}

chrome.debugger.onDetach.addListener((source) => {
  const tabId = source?.tabId;
  if (!Number.isInteger(tabId)) return;
  const session = _debuggerSessions.get(tabId);
  if (session?.timer) clearTimeout(session.timer);
  _debuggerSessions.delete(tabId);
});

async function _evaluateConsoleInTab(tabId, code, context) {
  if (!Number.isInteger(tabId) || tabId < 0) {
    return { type: 'error', error: { message: 'No inspected tab available for console execution.' } };
  }

  const target = { tabId };
  try {
    await _ensureDebuggerAttached(tabId);
    const expression = _buildConsoleExpression(code, context);
    const evalPromise = _debuggerCommand(target, 'Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
      timeout: CONSOLE_EVAL_TIMEOUT_MS,
    });
    const result = await Promise.race([
      evalPromise,
      new Promise((resolve) => setTimeout(() => {
        resolve({ __xrayTimeout: true });
      }, CONSOLE_EVAL_TIMEOUT_MS + 500)),
    ]);

    if (result?.__xrayTimeout) {
      return { type: 'error', error: { message: `Execution timeout (${CONSOLE_EVAL_TIMEOUT_MS / 1000}s)` } };
    }
    if (result?.exceptionDetails) {
      const details = result.exceptionDetails;
      return {
        type: 'error',
        error: {
          message: details.exception?.description || details.text || 'Console execution failed',
          stack: details.exception?.description || '',
        },
      };
    }
    return result?.result?.value || { type: 'undefined' };
  } catch (err) {
    // Drop a dead cached session (closed tab, user cancelled the infobar) so
    // the next eval re-attaches instead of failing forever.
    const session = _debuggerSessions.get(tabId);
    if (session?.timer) clearTimeout(session.timer);
    _debuggerSessions.delete(tabId);
    try { chrome.debugger.detach(target, () => void chrome.runtime.lastError); } catch {}
    return {
      type: 'error',
      error: {
        message: 'XRAY console could not attach Chrome debugger for CSP-safe execution.',
        stack: err?.message || String(err),
      },
    };
  }
}

const AI_TIMEOUT_MS = 45000;
const MAX_AI_PROMPT_CHARS = 60000;

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

async function _callOpenAI(settings, prompt) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model || 'gpt-4o-mini',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || `OpenAI error ${response.status}`);
  }
  const text = data?.choices?.[0]?.message?.content?.trim();
  return text || 'No explanation returned.';
}

async function _runAiExplain(settings, prompt) {
  if (!settings || typeof settings.apiKey !== 'string' || !settings.apiKey) {
    return { ok: false, error: 'Missing API key.' };
  }
  const safePrompt = String(prompt || '').slice(0, MAX_AI_PROMPT_CHARS);
  const provider = settings.provider === 'openai' ? 'openai' : 'anthropic';
  try {
    const call = provider === 'openai' ? _callOpenAI(settings, safePrompt) : _callAnthropic(settings, safePrompt);
    const text = await Promise.race([
      call,
      new Promise((_, reject) => setTimeout(() => reject(new Error(`AI request timed out after ${AI_TIMEOUT_MS / 1000}s`)), AI_TIMEOUT_MS)),
    ]);
    return { ok: true, text };
  } catch (err) {
    return { ok: false, error: err?.message || String(err) };
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
    const tabId = Number(msg.tabId);
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
    if (Number.isInteger(tabId) && msg.entry) {
      const port = _devtoolsPortsByTab.get(tabId);
      if (port) {
        try { port.postMessage({ type: 'xray:capture', entry: msg.entry }); } catch {}
      }
    }
  }

  if (msg.type === 'xray:capture-batch') {
    const tabId = sender?.tab?.id;
    if (Number.isInteger(tabId) && Array.isArray(msg.entries)) {
      const port = _devtoolsPortsByTab.get(tabId);
      if (port) {
        try { port.postMessage({ type: 'xray:capture-batch', entries: msg.entries }); } catch {}
      }
    }
  }

  if (msg.type === 'xray:capture-update') {
    const tabId = sender?.tab?.id;
    if (Number.isInteger(tabId) && msg.update) {
      const port = _devtoolsPortsByTab.get(tabId);
      if (port) {
        try { port.postMessage({ type: 'xray:capture-update', update: msg.update }); } catch {}
      }
    }
  }

  if (msg.type === 'xray:ai-explain') {
    _runAiExplain(msg.settings, msg.prompt)
      .then((result) => sendResponse(result))
      .catch((err) => sendResponse({ ok: false, error: err?.message || String(err) }));
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
