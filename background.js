// background.js — Service Worker
// Bridges the extension action / keyboard command to the content script panel toggle.

const _devtoolsPortsByTab = new Map();
let popoutWindowId = null;
let sqlWindowId = null;
const CONSOLE_EVAL_TIMEOUT_MS = 10000;
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

// The SQL client gets its own window: the HUD lives inside the inspected page, and database
// rows must never render there.
async function _openSqlWindow() {
  if (sqlWindowId !== null) {
    try {
      await chrome.windows.update(sqlWindowId, { focused: true });
      return { ok: true, focused: true };
    } catch {
      sqlWindowId = null;
    }
  }

  const win = await chrome.windows.create({
    url: chrome.runtime.getURL('sql.html'),
    type: 'popup',
    width: 1280,
    height: 800,
  });
  sqlWindowId = win?.id ?? null;
  return { ok: true, focused: false, id: sqlWindowId };
}

// Index just past the last top-level statement separator (`;` or newline outside
// brackets, strings, template literals and comments), or -1. Lets multi-statement input
// return its final expression the way DevTools does: `const x = 2; x * 3` -> 6.
function _lastStatementStart(code) {
  let depth = 0;
  let quote = '';
  let last = -1;
  for (let i = 0; i < code.length; i++) {
    const ch = code[i];
    const next = code[i + 1];
    if (quote) {
      if (ch === '\\') { i++; continue; }
      if (ch === quote) quote = '';
      continue;
    }
    if (ch === '/' && next === '/') {
      const end = code.indexOf('\n', i);
      if (end === -1) break;
      i = end - 1;
      continue;
    }
    if (ch === '/' && next === '*') {
      const end = code.indexOf('*/', i + 2);
      if (end === -1) break;
      i = end + 1;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') depth = Math.max(0, depth - 1);
    else if (depth === 0 && (ch === ';' || ch === '\n')) last = i + 1;
  }
  return last;
}

function _consoleUserBody(trimmed) {
  if (_isConsoleExpression(trimmed)) return `return (${trimmed});`;
  const body = trimmed.replace(/[;\s]+$/, '');
  const start = _lastStatementStart(body);
  if (start <= 0) return trimmed;
  const tail = body.slice(start).trim();
  // Strip leading line comments so `// note\nexpr` still returns expr.
  const tailCode = tail.replace(/^(\/\/[^\n]*\n\s*)+/, '');
  // The tail is a single top-level statement, so only its leading keyword decides.
  if (!tailCode || tailCode.startsWith('//') || CONSOLE_STATEMENT_START.test(tailCode) || /^[}\])]/.test(tailCode)) return trimmed;
  return `${body.slice(0, start)}\nreturn (${tailCode});`;
}

const CONSOLE_STATEMENT_START = /^(const|let|var|if|for|while|do|switch|try|throw|class|function|return|break|continue|debugger|import|export)\b/;

function _isConsoleExpression(code) {
  const trimmed = String(code || '').trim();
  return !trimmed.includes(';') &&
    !trimmed.includes('\n') &&
    !CONSOLE_STATEMENT_START.test(trimmed);
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

// Spec J8: the command context arrives from the panel as tagged JSON text
// (panel/console.js _contextPayload). It is inlined as a JSON *string literal* and parsed
// in the page by the inlined helper (reviveContext) — never interpolated as an object
// literal, whose `"__proto__":` would set a prototype instead of a key. A caller that still
// passes an object is stringified here (plain data, no tags).
function _consoleContextText(context) {
  if (typeof context === 'string') return context;
  try {
    return JSON.stringify(context ?? {}) ?? '{}';
  } catch {
    return '{}';
  }
}

// Saved-variable and pin names to declare. Read from the same text the page will parse;
// text that is not a JSON object declares none (the page then sees an empty context).
function _consoleContextNames(text) {
  let parsed = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = null;
  }
  const keys = (value) => (value && typeof value === 'object' && !Array.isArray(value) ? Object.keys(value) : []);
  return {
    scope: keys(parsed?.scope),
    // Pins are the single letters a-f; nothing else is declared from context.pins.
    pins: keys(parsed?.pins).filter((name) => /^[a-f]$/.test(name)),
  };
}

function _buildConsoleExpression(code, context, helperSource) {
  const trimmed = String(code || '').trim();
  const contextText = _consoleContextText(context);
  const { scope: scopeNames, pins: pinNames } = _consoleContextNames(contextText);
  const names = [...new Set([...RUNTIME_HELPER_NAMES, ...scopeNames, ...pinNames])]
    .filter((name) => VALID_CONSOLE_NAME.test(name));
  const declarations = names
    .map((name) => `const ${name} = __runtime[${JSON.stringify(name)}];`)
    .join('\n');
  const userBody = _consoleUserBody(trimmed);

  return `(async () => {
    // The helper module is an IIFE whose only global write is
    // \`window.XRAY_ConsoleHelpers\`. Shadowing \`window\` with a local object
    // captures that write here instead of reading — or touching — the page's global.
    const __helpers = (() => {
      const window = {};
      ${helperSource}
      return window.XRAY_ConsoleHelpers;
    })();
    // Tagged JSON text in a string literal, revived by the helper: integers past 2^53 become
    // BigInt, NaN/±Infinity/-0/undefined come back, "__proto__" stays a plain key.
    const __context = __helpers?.reviveContext ? __helpers.reviveContext(${JSON.stringify(contextText)}) : {};
    const __runtime = __helpers?.createRuntime
      ? __helpers.createRuntime(__context || {}, (text) => {
          try { navigator.clipboard?.writeText?.(text); } catch {}
        })
      : {};
    // Pins (a-f) are resolved by createRuntime to their parsed response bodies;
    // only saved variables are copied over the runtime here.
    Object.assign(__runtime, __context?.scope || {});
    ${declarations}

    try {
      const __raw = await (async () => {
        ${userBody}
      })();
      // Typed JSON text (shared/console-helpers.js encodeResult): returnByValue carries a
      // string, so no browser-side dictionary sorts its keys or drops what JSON cannot hold.
      return __helpers.encodeResult(__raw);
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
  _registerDebuggerDetach();
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

// `debugger` is optional, so chrome.debugger is undefined until it is granted. Touching
// it at top level threw and aborted this script before any onMessage/onConnect/command
// listener was registered — which broke the whole extension on a fresh install.
// Register when the API exists, and again when the permission is granted later.
let _debuggerDetachRegistered = false;
function _registerDebuggerDetach() {
  if (_debuggerDetachRegistered || !chrome.debugger?.onDetach) return;
  _debuggerDetachRegistered = true;
  chrome.debugger.onDetach.addListener((source) => {
    const tabId = source?.tabId;
    if (!Number.isInteger(tabId)) return;
    const session = _debuggerSessions.get(tabId);
    if (session?.timer) clearTimeout(session.timer);
    _debuggerSessions.delete(tabId);
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

async function _evaluateConsoleInTab(tabId, code, context) {
  if (!Number.isInteger(tabId) || tabId < 0) {
    return { type: 'error', error: { message: 'No inspected tab available for console execution.' } };
  }

  if (!(await _hasDebuggerPermission())) {
    return {
      type: 'error',
      error: {
        message: 'XRAY could not use its "debugger" permission. Reload XRAY at chrome://extensions, then run this again.',
      },
    };
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
  if (id === sqlWindowId) sqlWindowId = null;
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

  if (msg.type === 'XRAY_OPEN_SQL_WINDOW') {
    _openSqlWindow()
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
