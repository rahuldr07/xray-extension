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

// C-1: the evaluated expression used to read `window.XRAY_ConsoleHelpers`, a plain
// writable page global. A page that replaced `createRuntime` received the entire
// console context — captured URLs across every origin in the session, full bodies
// for the selected entry, decoded JWT claims — as soon as the user ran any
// expression, including `1+1`. The helper source is now inlined into the expression
// and evaluated against a SHADOWED `window`, so the page's global is never read and
// never written. The source is bundled with the extension, so this is our own code,
// not the page's.
let _consoleHelperSource = null;

async function _loadConsoleHelperSource() {
  if (_consoleHelperSource !== null) return _consoleHelperSource;
  const response = await fetch(chrome.runtime.getURL('shared/console-helpers.js'));
  _consoleHelperSource = await response.text();
  return _consoleHelperSource;
}

function _buildConsoleExpression(code, context, helperSource) {
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
    // The helper module is an IIFE whose only global write is
    // \`window.XRAY_ConsoleHelpers\`. Shadowing \`window\` with a local object
    // captures that write here instead of reading — or touching — the page's global.
    const __helpers = (() => {
      const window = {};
      ${helperSource}
      return window.XRAY_ConsoleHelpers;
    })();
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
    const expression = _buildConsoleExpression(code, context, await _loadConsoleHelperSource());
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

async function _runAiExplain(settings, prompt) {
  if (!settings || typeof settings.apiKey !== 'string' || !settings.apiKey) {
    return { ok: false, error: 'Missing API key.' };
  }
  const safePrompt = String(prompt || '').slice(0, MAX_AI_PROMPT_CHARS);
  const provider = settings.provider === 'openai' || settings.provider === 'custom' ? settings.provider : 'anthropic';
  if (provider === 'custom' && !settings.baseUrl) {
    return { ok: false, error: 'Custom provider needs an endpoint URL.' };
  }
  try {
    const call =
      provider === 'custom'
        ? _callCustomProvider(settings, safePrompt)
        : provider === 'openai'
          ? _callOpenAI(settings, safePrompt)
          : _callAnthropic(settings, safePrompt);
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
