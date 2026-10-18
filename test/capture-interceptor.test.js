// content/interceptor.js: capture config, WebSocket/SSE, GraphQL, timing, mock rules, replay.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const test = require('node:test');

const { read } = require('./helpers/source');

test('React settings persist user preferences and publish capture config to vanilla interceptor', () => {
  const types = read('src/panel/types.ts');
  const settingsModel = read('src/panel/models/panelSettings.ts');
  const persistence = read('src/panel/models/panelPersistence.ts');
  const store = read('src/panel/store.ts');
  const captureConfig = read('src/panel/runtime/captureConfig.ts');
  const interceptor = read('content/interceptor.js');

  assert.match(types, /export interface PanelSettings/);
  for (const field of ['captureFetch', 'captureXhr', 'maxEntries', 'slowThresholdMs', 'defaultDetailView', 'compactRows', 'showHostInPath', 'accent', 'theme', 'font', 'density', 'glow', 'confirmDestructiveActions']) {
    assert.match(types, new RegExp(field));
    assert.match(settingsModel, new RegExp(field));
  }
  // The whole settings object is persisted (the legacy marker themeRefreshPending pinned to a boolean).
  assert.match(persistence, /settings:\s*\{ \.\.\.state\.settings, themeRefreshPending: Boolean\(state\.settings\.themeRefreshPending\) \}/);
  assert.match(persistence, /normalizePanelSettings\(preferences\.settings\)/);
  assert.match(store, /updateSettings\(patch: Partial<PanelSettings>\): void/);
  assert.match(store, /publishCaptureSettings\(settings\)/);
  assert.match(captureConfig, /__xray_config__/);
  assert.match(captureConfig, /__XRAY_bridgeToken/);
  assert.match(captureConfig, /__XRAY_BRIDGE_TOKEN__/);
  assert.match(interceptor, /event\.source !== window/);
  assert.match(interceptor, /event\.data\.token !== _bridgeToken/);
  assert.match(interceptor, /captureFetch/);
  assert.match(interceptor, /captureXhr/);
  // C2: the capture guard no longer returns before rules run; it only picks the rule-only path
  assert.match(interceptor, /if \(!_captureOn\('captureFetch'\)\) return _ruleOnlyFetch/);
  assert.match(interceptor, /if \(!_captureOn\('captureXhr'\)\) \{/);
});

test('interceptor wraps WebSocket and EventSource and streams frames', () => {
  const interceptor = read('content/interceptor.js');
  assert.match(interceptor, /const _OrigWebSocket = window\.WebSocket/);
  assert.match(interceptor, /const _OrigEventSource = window\.EventSource/);
  assert.match(interceptor, /window\.WebSocket = WrappedWebSocket/);
  assert.match(interceptor, /window\.EventSource = WrappedEventSource/);
  assert.match(interceptor, /source:\s*'ws'/);
  assert.match(interceptor, /source:\s*'sse'/);
  assert.match(interceptor, /wsFrames/);
  assert.match(interceptor, /MAX_WS_FRAMES/);
  assert.match(interceptor, /update:\s*true/);
});

test('interceptor captures GraphQL operations, initiator stacks, and resource timing', () => {
  const interceptor = read('content/interceptor.js');
  assert.match(interceptor, /function _graphqlInfo/);
  assert.match(interceptor, /operationName/);
  assert.match(interceptor, /function _initiatorStack/);
  assert.match(interceptor, /function _resourceTiming/);
  // timing comes from an observer-fed index; getEntriesByName stays only as the
  // miss path, and late timings resolve through the observer instead of one
  // 300ms rescan timer per request
  assert.match(interceptor, /new PerformanceObserver\(/);
  assert.match(interceptor, /_timingObserver\.observe\(\{ type: 'resource', buffered: true \}\)/);
  assert.match(interceptor, /const indexed = _timingIndex\.get\(url\);/);
  assert.match(interceptor, /getEntriesByName/);
  assert.match(interceptor, /_pendingTiming\.delete\(entry\.name\);/);
  assert.match(interceptor, /if \(!_timingObserver\) \{/);
});

test('interceptor applies mock, delay, and fail rules before the real network call', () => {
  const interceptor = read('content/interceptor.js');
  assert.match(interceptor, /function _matchRule/);
  assert.match(interceptor, /function _sanitizeRule/);
  assert.match(interceptor, /rule\.action\.type === 'mock'/);
  assert.match(interceptor, /rule\.action\.type === 'fail'/);
  assert.match(interceptor, /rule\.action\.type === 'delay'/);
  // Null-body statuses (204/205/304) must not be handed a body — Response() throws.
  assert.match(interceptor, /new Response\(status === 204 \|\| status === 205 \|\| status === 304 \? null : body/);
  assert.match(interceptor, /function _simulateXhrResponse/);
  assert.match(interceptor, /mocked:\s*true/);
  // the simulated response shadows prototype getters with own properties: a
  // reused XHR must be scrubbed on open(), or it reports the old mock forever
  assert.match(interceptor, /function _clearMockShadow/);
  assert.match(interceptor, /XMLHttpRequest\.prototype\.open = function \(method, url, \.\.\.rest\) \{\s*\n\s*_clearMockShadow\(this\);/);
  assert.match(interceptor, /xhr\.__xrMockShadow = true;/);
  // header lookups are case-insensitive even though rules keep the author's casing
  assert.match(interceptor, /xhr\.getResponseHeader = \(name\) => headerLookup\[String\(name\)\.toLowerCase\(\)\] \?\? null;/);
});

test('interceptor serves panel replay requests from the page world', () => {
  const interceptor = read('content/interceptor.js');
  assert.match(interceptor, /__xray_replay__/);
  assert.match(interceptor, /replayed:\s*true/);
});

test('content relay publishes aggregate downstream-delivery receipts only', () => {
  const content = read('content/content.js');
  assert.match(content, /validated/);
  assert.match(content, /delivered/);
  assert.match(content, /noConsumer/);
  assert.match(content, /relayFailed/);
  assert.match(content, /relay-failed/);
  assert.match(content, /no-consumer/);
  assert.doesNotMatch(content, /__xray_capture_receipt__[^\n]*entry/);
});

async function relayContent(response, lastError = null, worker = {}) {
  const listeners = {};
  const posted = [];
  const workerReceipts = [];
  const window = {
    addEventListener(type, listener) { (listeners[type] ||= []).push(listener); },
    postMessage(message) { posted.push(message); },
    XRAY_Panel: { init: async () => {}, add() {} },
    XRAY_Worker: { captureReceipt(receipt) { workerReceipts.push(receipt); return Promise.resolve(receipt); }, ...worker },
  };
  const document = { addEventListener() {} };
  const chrome = { runtime: { lastError, onMessage: { addListener() {} }, sendMessage(message, callback) { callback(response); } }, };
  const context = { window, document, chrome, console, Date, Set, Map, URL, structuredClone, setTimeout, clearTimeout };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../content/content.js'), 'utf8'), context);
  const dispatch = async data => {
    for (const listener of listeners.message || []) await listener({ source: window, data });
  };
  await dispatch({ __xray_bridge_ready__: true, token: 'token' });
  await dispatch({ __xray_capture__: true, token: 'token', entry: { id: 'capture', type: 'api', url: 'https://private.test', requestHeaders: { authorization: 'secret-header' }, requestBody: 'secret-body' } });
  await new Promise(resolve => setTimeout(resolve, 0));
  return { receipt: window.XRAY_CaptureReceipt.get(), posted, workerReceipts, dispatch };
}

test('content relay fixtures distinguish no-consumer, disconnected-port, and delivered aggregate outcomes', async () => {
  const noConsumer = await relayContent({ ok: false, delivery: 'no-consumer', count: 1 });
  const disconnected = await relayContent(undefined, { message: 'raw relay secret' });
  const delivered = await relayContent({ ok: true, delivery: 'delivered', count: 1 });
  assert.equal(noConsumer.receipt.noConsumer, 1);
  assert.equal(disconnected.receipt.relayFailed, 1);
  assert.equal(delivered.receipt.delivered, 1);
  assert.notDeepEqual(noConsumer.receipt.deliveryReasons, disconnected.receipt.deliveryReasons);
  assert.notDeepEqual(disconnected.receipt.deliveryReasons, delivered.receipt.deliveryReasons);
  for (const fixture of [noConsumer, disconnected, delivered]) {
    assert.doesNotMatch(JSON.stringify(fixture.receipt), /private\.test|secret-header|secret-body|raw relay secret|error|url|header|body/i);
    assert.doesNotMatch(JSON.stringify(fixture.posted), /private\.test|secret-header|secret-body|raw relay secret/);
    assert.ok(fixture.workerReceipts.every(receipt => !('url' in receipt) && !('headers' in receipt) && !('body' in receipt)));
  }
});

test('content does not feed the worker a copy of every capture (JSON fidelity Task 6 ruling)', async () => {
  // Every capture used to be posted to the worker's addEntry for a token index nothing searched.
  // Health still flows: the worker's receipts reach the panel.
  let listener;
  const added = [];
  const fixture = await relayContent({ delivery: 'no-consumer' }, null, {
    init: async () => {}, isReady: () => true,
    onHealth(callback) { listener = callback; },
    async addEntry(entry) { added.push(entry.id); },
  });
  listener({ state: 'degraded', cache: { state: 'degraded', lastErrorCode: 'cache-write-failed' } });
  await fixture.dispatch({ __xray_capture__: true, token: 'token', entry: { id: 'single', type: 'log' } });
  await fixture.dispatch({ __xray_capture__: true, token: 'token', batch: true, entries: [{ id: 'batched', type: 'log' }] });
  assert.deepEqual(added, []);
});

function contentHarness(panel) {
  const listeners = {};
  const posted = [];
  const window = {
    addEventListener(type, listener) { (listeners[type] ||= []).push(listener); },
    postMessage(message) { posted.push(message); },
    XRAY_Panel: panel,
  };
  const chrome = { runtime: { lastError: null, onMessage: { addListener() {} }, sendMessage(message, callback) { callback({ delivery: 'no-consumer' }); } } };
  const context = { window, document: { addEventListener() {} }, chrome, console, Date, Set, Map, URL, structuredClone, setTimeout, clearTimeout };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../content/content.js'), 'utf8'), context);
  const dispatch = data => Promise.all((listeners.message || []).map(listener => listener({ source: window, data })));
  return { window, posted, dispatch };
}

test('content init is shared, so an early update is not dropped before its entry registers', async () => {
  let release;
  const updates = [];
  const harness = contentHarness({ init: () => new Promise(resolve => { release = resolve; }), add() {}, update(entry) { updates.push(entry.id); } });
  await harness.dispatch({ __xray_bridge_ready__: true, token: 'token' });
  const first = harness.dispatch({ __xray_capture__: true, token: 'token', entry: { id: 'socket', type: 'api', url: 'wss://x.test/s', source: 'ws' } });
  const second = harness.dispatch({ __xray_capture__: true, token: 'token', update: true, entry: { id: 'socket', type: 'api', url: 'wss://x.test/s', source: 'ws' } });
  release();
  await Promise.all([first, second]);
  assert.deepEqual(updates, ['socket']);
  assert.equal(harness.window.XRAY_CaptureReceipt.get().dropReasons['invalid-update'], undefined);
});

test('early stored config treats a stored rule as enabled unless enabled === false, like the panel', async () => {
  const harness = contentHarness({ init: async () => {}, add() {} });
  const rule = (id, extra) => ({ id, match: { url: `https://x.test/${id}` }, action: { type: 'block' }, ...extra });
  const stored = [rule('on', { enabled: true }), rule('off', { enabled: false }), rule('missing', {}), rule('truthy', { enabled: 'yes' })];
  harness.window.XRAY_Store = { get: async key => (key === 'traffic_rules' ? stored : { settings: {} }) };
  await harness.dispatch({ __xray_bridge_ready__: true, token: 'token' });
  await new Promise(resolve => setTimeout(resolve, 0));
  const config = harness.posted.find(message => message.__xray_config__);
  assert.ok(config, 'stored config is posted');
  const early = config.config.rules.map(r => r.id);
  assert.deepEqual(early, ['on', 'missing', 'truthy'], 'a stored rule without enabled counts as enabled; enabled: false is disabled');
  // The panel normalizes stored rules (enabled !== false) before publishing them, so
  // the page must get the same rules before and after the panel mounts.
  const { rules: panelRules } = await import('./unit/harness.mjs');
  assert.deepEqual(panelRules.serializeRulesForRuntime(panelRules.normalizeRules(stored)).map(r => r.id), early);
});

test('forged capture messages are counted but receipt publication is coalesced', async () => {
  const harness = contentHarness({ init: async () => {}, add() {} });
  await harness.dispatch({ __xray_bridge_ready__: true, token: 'token' });
  for (let i = 0; i < 200; i += 1) await harness.dispatch({ __xray_capture__: true, token: 'forged', entry: { id: `f${i}`, type: 'log' } });
  assert.equal(harness.window.XRAY_CaptureReceipt.get().dropReasons['bridge-token'], 200);
  const receiptsNow = harness.posted.filter(message => message.__xray_capture_receipt__).length;
  assert.ok(receiptsNow <= 1, `expected coalesced receipts, got ${receiptsNow}`);
  await new Promise(resolve => setTimeout(resolve, 300));
  const last = harness.posted.filter(message => message.__xray_capture_receipt__).at(-1);
  assert.equal(last.receipt.dropReasons['bridge-token'], 200);
});

// ── behavioural harness: run content/interceptor.js in a fake MAIN world ──────
// postMessage structured-clones like the real bridge (Node's clone rejects FormData,
// URLSearchParams, Headers, Request, functions and Symbols exactly as Chrome's does), so
// a capture the bridge cannot carry is lost here the same way it is in the page.
// `cloneFails(message)` makes the bridge reject a message it could otherwise carry, to
// reach the fallback paths no real entry should need.
function interceptorHarness({ fetchImpl, streams = false, cloneFails = null, json = JSON } = {}) {
  const listeners = {};
  const posted = [];
  const timers = [];
  let now = 0;
  const fakeSetTimeout = (fn, ms = 0) => { const t = { fn, at: now + ms, cleared: false }; timers.push(t); return t; };
  const fakeClearTimeout = (t) => { if (t) t.cleared = true; };
  const fetchCalls = [];
  const window = {
    addEventListener(type, listener) { (listeners[type] ||= []).push(listener); },
    postMessage(message) {
      if (cloneFails && cloneFails(message)) throw new DOMException('#<Object> could not be cloned.', 'DataCloneError');
      posted.push(structuredClone(message));
    },
    location: { href: 'https://page.test/app', origin: 'https://page.test' },
    fetch: async (...args) => { fetchCalls.push(args); return fetchImpl ? fetchImpl(...args) : new Response('{"ok":true}', { status: 200 }); },
  };
  window.URL = URL;
  if (streams) {
    // Minimal page WebSocket/EventSource: just enough for the wrappers to attach listeners.
    class FakeStream {
      constructor(url) { this.url = url; this._l = {}; this.readyState = 0; }
      addEventListener(type, fn) { (this._l[type] ||= []).push(fn); }
      fire(type, event = {}) { (this._l[type] || []).forEach(fn => fn(event)); }
      send() {}
    }
    window.WebSocket = class WebSocket extends FakeStream {};
    window.EventSource = class EventSource extends FakeStream {};
  }
  const xhrCalls = { open: [], send: [] };
  class FakeXHR {
    constructor() { this._l = {}; this.readyState = 0; this.responseType = ''; this.status = 0; this.response = null; this.responseText = ''; }
    open(...a) { xhrCalls.open.push(a); this.readyState = 1; }
    send(...a) { xhrCalls.send.push(a); }
    setRequestHeader() {}
    addEventListener(type, fn) { (this._l[type] ||= []).push(fn); }
    dispatchEvent() { return true; }
    getAllResponseHeaders() { return ''; }
  }
  class FakeProgressEvent { constructor(type) { this.type = type; } }
  const context = {
    window, console, Date: { now: () => now }, Math, JSON: json, Object, Array, Set, Map, String, Number, Promise, Error, TypeError, RegExp,
    URL, Request, Response, Headers, TextEncoder, TextDecoder, XMLHttpRequest: FakeXHR, Event: FakeProgressEvent, ProgressEvent: FakeProgressEvent,
    Blob, File, FormData, URLSearchParams, ReadableStream, ArrayBuffer, btoa, atob, setTimeout: fakeSetTimeout, clearTimeout: fakeClearTimeout,
    performance: { getEntriesByName: () => [] },
  };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../content/interceptor.js'), 'utf8'), context);
  const token = posted.find(m => m.__xray_bridge_ready__).token;
  const advance = (ms) => {
    now += ms;
    for (const t of timers.slice()) if (!t.cleared && t.at <= now) { t.cleared = true; t.fn(); }
  };
  const sendConfig = (config) => {
    for (const l of listeners.message || []) l({ source: window, data: { __xray_config__: true, source: 'xray-relay', token, config } });
  };
  // A replay request as the panel (or the DevTools relay in content.js) posts it.
  const sendReplay = (request) => {
    for (const l of listeners.message || []) l({ source: window, data: { __xray_replay__: true, source: 'xray-react-ui', token, request } });
  };
  const captures = () => posted.filter(m => m.__xray_capture__ && !m.update);
  const drops = () => posted.filter(m => m.__xray_capture_drop__);
  const entry = (fragment) => captures().map(m => m.entry).find(e => String(e.url).includes(fragment));
  const settle = () => new Promise(resolve => setImmediate(resolve));
  // Async body reads (Blob) finish on Node's own schedule, so wait on the outcome.
  const waitFor = async (predicate, label) => {
    for (let i = 0; i < 300; i += 1) {
      if (predicate()) return;
      await new Promise(resolve => setImmediate(resolve));
    }
    assert.fail(`timed out waiting for ${label}; captured: ${captures().map(m => m.entry.url).join(', ') || 'nothing'}`);
  };
  // Completes a FakeXHR the way the browser does: response fields, then loadend.
  const finishXhr = (xhr, fields = {}) => {
    Object.assign(xhr, { status: 200, readyState: 4 }, fields);
    (xhr._l.loadend || []).forEach(fn => fn());
  };
  const pendingTimers = () => timers.filter(t => !t.cleared).length;
  return { window, context, posted, token, FakeXHR, xhrCalls, fetchCalls, advance, sendConfig, sendReplay, captures, drops, entry, settle, waitFor, finishXhr, pendingTimers };
}

const ALL_ON = { captureFetch: true, captureXhr: true, captureWs: true };

// The path to the first ArrayBuffer, typed array, DataView or Blob in a posted value, or
// null: the store, the DevTools relay and chrome.storage cannot carry them (#7).
function findBinary(value, path = 'entry', seen = new Set()) {
  if (!value || typeof value !== 'object' || seen.has(value)) return null;
  seen.add(value);
  if (value instanceof ArrayBuffer || ArrayBuffer.isView(value) || value instanceof Blob) return path;
  for (const [key, child] of Object.entries(value)) {
    const hit = findBinary(child, `${path}.${key}`, seen);
    if (hit) return hit;
  }
  return null;
}

const mockRule = (url) => ({ id: 'r1', enabled: true, match: { url, method: '' }, action: { type: 'mock', status: 201, body: '{"mocked":1}', headers: {}, delayMs: 0 } });

test('no capture before config when the transport is off', async () => {
  const h = interceptorHarness();
  await h.window.fetch('https://api.test/early');
  await h.settle();
  h.sendConfig({ captureFetch: false, captureXhr: true, captureWs: true });
  await h.settle();
  h.advance(5000);
  assert.equal(h.captures().length, 0, 'an early fetch must not reach the panel when fetch capture is off');
});

test('early captures flush when enabled', async () => {
  const h = interceptorHarness();
  await h.window.fetch('https://api.test/early');
  await h.settle();
  assert.equal(h.captures().length, 0, 'held back until config arrives');
  h.sendConfig({ captureFetch: true, captureXhr: true, captureWs: true });
  assert.equal(h.captures().length, 1);
  h.advance(5000);
  assert.equal(h.captures().length, 1, 'flushed exactly once');
  assert.equal(h.pendingTimers(), 0, 'the 3 s timer is cleared once config arrives');
});

test('only the enabled transports flush; the rest are discarded', async () => {
  const h = interceptorHarness();
  await h.window.fetch('https://api.test/early');
  const xhr = new h.FakeXHR();
  xhr.open('GET', 'https://api.test/x');
  xhr.send();
  xhr.status = 200; xhr.responseText = '{}';
  (xhr._l.loadend || []).forEach(fn => fn());
  await h.settle();
  h.sendConfig({ captureFetch: true, captureXhr: false, captureWs: true });
  await h.settle();
  const sources = h.captures().map(m => m.entry.source);
  assert.deepEqual(sources, ['fetch']);
});

// A WebSocket and an EventSource that open and carry frames before any config arrives.
async function earlyStreams(h) {
  const ws = new h.window.WebSocket('wss://api.test/socket');
  ws.fire('open');
  ws.send('secret-out');
  ws.fire('message', { data: 'secret-in' });
  const sse = new h.window.EventSource('https://api.test/stream');
  sse.fire('open');
  sse.fire('message', { data: 'secret-event' });
  h.advance(500); // throttled frame updates fire inside the pending window
  await h.settle();
  assert.equal(h.posted.filter(m => m.__xray_capture__).length, 0, 'held back until config arrives');
  return { ws, sse };
}

test('control: the same early WebSocket and SSE traffic flushes when the first config has captureWs:true', async () => {
  const h = interceptorHarness({ streams: true });
  await earlyStreams(h);
  h.sendConfig({ captureFetch: true, captureXhr: true, captureWs: true });
  await h.settle();
  const posted = h.posted.filter(m => m.__xray_capture__);
  assert.deepEqual(posted.filter(m => !m.update).map(m => m.entry.source).sort(), ['sse', 'ws'], 'both stream entries were held, then flushed');
  assert.ok(posted.some(m => m.update && m.entry.wsFrames.length > 0), 'their held frame updates follow');
});

test('early WebSocket and SSE captures are discarded when the first config has captureWs:false', async () => {
  const h = interceptorHarness({ streams: true });
  const { ws, sse } = await earlyStreams(h);
  h.sendConfig({ captureFetch: true, captureXhr: true, captureWs: false });
  h.advance(5000);
  await h.settle();
  assert.deepEqual(h.posted.filter(m => m.__xray_capture__), [], 'no WS/SSE entry or update reaches the panel');
  ws.fire('message', { data: 'later' });
  ws.fire('close', { code: 1000 });
  sse.fire('error');
  h.advance(5000);
  assert.deepEqual(h.posted.filter(m => m.__xray_capture__), [], 'nor any later frame or state change');
});

test('pending buffer: timeout flush and cap', async () => {
  const h = interceptorHarness();
  await Promise.all(Array.from({ length: 60 }, (_, i) => h.window.fetch(`https://api.test/r${i}`)));
  await h.settle();
  assert.equal(h.captures().length, 0);
  h.advance(2999);
  assert.equal(h.captures().length, 0, 'not flushed before 3 s');
  h.advance(1);
  const urls = h.captures().map(m => m.entry.url);
  assert.equal(urls.length, 50);
  assert.ok(urls.includes('https://api.test/r59') && !urls.includes('https://api.test/r9'), 'oldest dropped, newest kept');
  await h.window.fetch('https://api.test/after');
  await h.settle();
  assert.equal(h.captures().length, 51, 'after the timeout flush captures go straight out');
});

test('rules-only config does not end the pending window', async () => {
  const h = interceptorHarness();
  await h.window.fetch('https://api.test/early');
  await h.settle();
  h.sendConfig({ rules: [] });
  assert.equal(h.captures().length, 0);
  h.sendConfig({ captureFetch: false });
  h.advance(5000);
  assert.equal(h.captures().length, 0);
});

test('fetch rules apply with capture off, and nothing is captured', async () => {
  const h = interceptorHarness();
  h.sendConfig({ captureFetch: false, captureXhr: true, captureWs: true, rules: [mockRule('/mocked')] });
  const response = await h.window.fetch('https://api.test/mocked');
  assert.equal(response.status, 201);
  assert.equal(await response.text(), '{"mocked":1}');
  assert.equal(h.fetchCalls.length, 0, 'mock must not hit the network');
  const passthrough = await h.window.fetch('https://api.test/other');
  assert.equal(await passthrough.text(), '{"ok":true}');
  await h.settle();
  assert.equal(h.captures().length, 0);
});

test('fetch fail rule applies with capture off', async () => {
  const h = interceptorHarness();
  h.sendConfig({ captureFetch: false, rules: [{ ...mockRule('/boom'), action: { type: 'fail' } }] });
  await assert.rejects(() => h.window.fetch('https://api.test/boom'), TypeError);
  assert.equal(h.captures().length, 0);
});

test('xhr rules apply with capture off, and nothing is captured', async () => {
  const h = interceptorHarness();
  h.sendConfig({ captureFetch: true, captureXhr: false, captureWs: true, rules: [mockRule('/mocked')] });
  const xhr = new h.FakeXHR();
  xhr.open('GET', 'https://api.test/mocked');
  xhr.send();
  h.advance(10);
  assert.equal(xhr.responseText, '{"mocked":1}');
  assert.equal(xhr.status, 201);
  assert.equal(h.xhrCalls.send.length, 0, 'mock must not hit the network');
  const other = new h.FakeXHR();
  other.open('GET', 'https://api.test/other');
  other.send();
  assert.equal(h.xhrCalls.send.length, 1);
  assert.equal(h.captures().length, 0);
});

// ── JSON fidelity, Task 3: capture keeps bodies as text, never loses an entry ──
// (spec J4, J5, J6, J16; audit findings #5, #6, #7, #10, #18, #27)

const REQUEST_TEXTS = {
  jsonstring: '"hello"',
  double: '"{\\"a\\":1}"',
  literalnull: 'null',
  literalfalse: 'false',
  pretty: '{\n  "a": 1\n}',
  keyorder: '{"b":1,"a":2,"10":3,"2":4}',
  bigint: '{"id": 9007199254740993, "n": 12345678901234567890}',
  empty: '',
};

test('J4 fetch keeps the request text verbatim, and "", "false" and "null" bodies stay distinct from no body', async () => {
  const h = interceptorHarness();
  h.sendConfig(ALL_ON);
  for (const [name, text] of Object.entries(REQUEST_TEXTS)) {
    await h.window.fetch(`https://api.test/echo?req=${name}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: text });
  }
  // fetch sends a primitive body as its string; a JS null body is no body at all.
  await h.window.fetch('https://api.test/echo?req=bool', { method: 'POST', body: false });
  await h.window.fetch('https://api.test/echo?req=zero', { method: 'POST', body: 0 });
  await h.window.fetch('https://api.test/echo?req=jsnull', { method: 'POST', body: null });
  await h.window.fetch('https://api.test/echo?req=get');
  await h.waitFor(() => h.captures().length === Object.keys(REQUEST_TEXTS).length + 4, 'every request');

  for (const [name, text] of Object.entries(REQUEST_TEXTS)) {
    const entry = h.entry(`req=${name}`);
    assert.equal(entry.requestBodyText, text, `${name}: the text as sent`);
    assert.equal(entry.requestBodyKind, 'text', name);
    assert.equal(entry.requestTruncated, undefined, name);
  }
  assert.equal(h.entry('req=bool').requestBodyText, 'false');
  assert.equal(h.entry('req=zero').requestBodyText, '0');
  for (const name of ['jsnull', 'get']) {
    const entry = h.entry(`req=${name}`);
    assert.equal(entry.requestBodyKind, 'none', name);
    assert.equal(entry.requestBodyText, undefined, name);
    assert.equal(entry.requestBody, null, name);
  }
  // The parsed body stays derived from the text for today's views (Tasks 5 and 9 move them to the text).
  assert.deepEqual(h.entry('req=keyorder').requestBody, { b: 1, a: 2, 10: 3, 2: 4 });
  assert.equal(h.entry('req=jsonstring').requestBody, 'hello');
});

test('J4 a Request body is read as text, and init.body overrides it as fetch does', async () => {
  const h = interceptorHarness();
  h.sendConfig(ALL_ON);
  const text = '{"id": 9007199254740993, "b":1, "a":2}';
  await h.window.fetch(new Request('https://api.test/echo?req=request-obj', { method: 'POST', headers: { 'content-type': 'application/json' }, body: text }));
  await h.window.fetch(new Request('https://api.test/echo?req=override', { method: 'POST', body: 'from-request' }), { body: 'from-init' });
  await h.window.fetch(new Request('https://api.test/echo?req=request-get'));
  await h.waitFor(() => h.captures().length === 3, 'every Request');
  assert.equal(h.entry('req=request-obj').requestBodyText, text);
  assert.equal(h.entry('req=request-obj').requestBodyKind, 'text');
  assert.equal(h.entry('req=override').requestBodyText, 'from-init');
  assert.equal(h.entry('req=request-get').requestBodyKind, 'none');
});

test('J4/J5 URLSearchParams, FormData, Blob, ArrayBuffer and typed-array bodies arrive as text or descriptors', async () => {
  const h = interceptorHarness();
  h.sendConfig(ALL_ON);
  const json = '{"id":9007199254740993}';
  const bytes = new TextEncoder().encode(json);
  const form = new FormData();
  form.append('json', json);
  form.append('name', 'x');
  form.append('upload', new File([new Uint8Array([137, 80, 78, 71])], 'x.png', { type: 'image/png' }));
  const binary = new Uint8Array([0xff, 0xfe, 0x00, 0x01, 0x80]);
  const post = (q, body) => h.window.fetch(`https://api.test/echo?req=${q}`, { method: 'POST', body });
  await Promise.all([
    post('urlsearch', new URLSearchParams({ id: '9007199254740993', q: 'a b' })),
    post('formdata', form),
    post('blob', new Blob([json], { type: 'application/json' })),
    post('arraybuffer', bytes.slice().buffer),
    post('uint8', bytes),
    post('dataview', new DataView(bytes.slice().buffer)),
    post('subarray', new Uint8Array([0x20, ...bytes, 0x20]).subarray(1, bytes.length + 1)),
    post('bom', new Uint8Array([0xef, 0xbb, 0xbf, ...bytes])),
    post('binary', binary),
  ]);
  await h.waitFor(() => h.captures().length === 9, 'every body kind');

  const e = (q) => h.entry(`req=${q}`);
  assert.equal(e('urlsearch').requestBodyText, 'id=9007199254740993&q=a+b');
  assert.equal(e('urlsearch').requestBodyKind, 'urlencoded');
  assert.equal(e('formdata').requestBodyKind, 'formdata');
  assert.deepEqual(e('formdata').requestBody, [['json', json], ['name', 'x'], ['upload', { file: 'x.png', size: 4, type: 'image/png' }]]);
  assert.equal(e('formdata').requestBodyText, `json=${json}\nname=x\nupload=[file "x.png", image/png, 4 bytes]`);
  for (const q of ['blob', 'arraybuffer', 'uint8', 'dataview', 'subarray']) {
    assert.equal(e(q).requestBodyText, json, `${q}: the bytes as UTF-8 text`);
    assert.equal(e(q).requestBodyKind, 'text', q);
  }
  assert.equal(e('bom').requestBodyText, '﻿' + json, 'the BOM is kept, so the text re-encodes to the bytes sent');
  assert.equal(e('binary').requestBodyKind, 'binary');
  assert.equal(e('binary').requestBodyText, undefined);
  assert.deepEqual(e('binary').requestBody, { binary: true, size: 5, base64Prefix: Buffer.from(binary).toString('base64') });
  for (const message of h.captures()) assert.equal(findBinary(message.entry), null, `no binary object posted for ${message.entry.url}`);
});

test('J4/J6 a byte body past the 200,000-byte decode window keeps a text prefix with byte-based metadata, or a binary descriptor', async () => {
  const h = interceptorHarness();
  h.sendConfig(ALL_ON);
  // 'a' then 3-byte '€' chars: one starts at byte 199,999 and straddles the window end, so
  // a non-streaming fatal decode would call valid UTF-8 binary.
  const text = 'a' + '€'.repeat(100_000);
  const bytes = new TextEncoder().encode(text);
  const binary = new Uint8Array(250_000).fill(0xff);
  await h.window.fetch('https://api.test/echo?req=big-utf8', { method: 'POST', body: bytes });
  await h.window.fetch('https://api.test/echo?req=big-blob', { method: 'POST', body: new Blob([bytes]) });
  await h.window.fetch('https://api.test/echo?req=big-binary', { method: 'POST', body: binary });
  await h.waitFor(() => h.captures().length === 3, 'every large body');
  for (const q of ['big-utf8', 'big-blob']) {
    const entry = h.entry(`req=${q}`);
    assert.equal(entry.requestBodyKind, 'text', `${q}: still UTF-8 text`);
    assert.equal(entry.requestBodyText, text.slice(0, 50_000), q);
    assert.deepEqual(entry.requestTruncated, { totalBytes: bytes.byteLength, keptChars: 50_000 }, `${q}: the full text length is unknown, so the total is in bytes`);
  }
  const big = h.entry('req=big-binary');
  assert.equal(big.requestBodyKind, 'binary');
  assert.deepEqual(big.requestBody, { binary: true, size: 250_000, base64Prefix: Buffer.from(binary.subarray(0, 64)).toString('base64') });
  assert.equal(big.requestBodyText, undefined);
});

test('J4/J6 FormData pairs share the text budget, so a huge form cannot push an unbounded array', async () => {
  const h = interceptorHarness();
  h.sendConfig(ALL_ON);
  const form = new FormData();
  form.append('big', 'v'.repeat(60_000));
  form.append('after', 'x');
  await h.window.fetch('https://api.test/echo?req=big-form', { method: 'POST', body: form });
  await h.waitFor(() => h.captures().length === 1, 'the entry');
  const entry = h.entry('req=big-form');
  assert.equal(entry.requestBodyText, 'big=' + 'v'.repeat(49_996));
  assert.deepEqual(entry.requestTruncated, { totalChars: 'big='.length + 60_000 + '\nafter=x'.length, keptChars: 50_000 });
  assert.deepEqual(entry.requestBody, [['big', 'v'.repeat(49_996)]], 'the value is cut at the budget and later fields are left out');
});

test('Final fix M10: FormData fields are cut where the text is, the separator before a field counted', async () => {
  const h = interceptorHarness();
  h.sendConfig(ALL_ON);
  const form = new FormData();
  form.append('a', '1');
  form.append('big', 'v'.repeat(60_000));
  await h.window.fetch('https://api.test/echo?req=sep-form', { method: 'POST', body: form });
  await h.waitFor(() => h.captures().length === 1, 'the entry');
  const entry = h.entry('req=sep-form');
  assert.equal(entry.requestBodyText.length, 50_000);
  assert.equal(entry.requestBody.map(([name, value]) => `${name}=${value}`).join('\n'), entry.requestBodyText, 'the kept fields render exactly the kept text');
});

test('J4 XHR send() captures the same body kinds, and a GET body (never sent) is no body', async () => {
  const h = interceptorHarness();
  h.sendConfig(ALL_ON);
  const send = (method, q, body) => {
    const xhr = new h.FakeXHR();
    xhr.open(method, `https://api.test/echo?req=${q}`);
    xhr.send(body);
    h.finishXhr(xhr, { responseText: '{"ok":true}' });
  };
  const form = new FormData();
  form.append('a', '1');
  send('POST', 'xhr-formdata', form);
  send('POST', 'xhr-false', 'false');
  send('POST', 'xhr-empty', '');
  send('POST', 'xhr-urlsearch', new URLSearchParams('a=1&b=%20'));
  send('POST', 'xhr-bytes', new TextEncoder().encode('{"a":1}'));
  send('GET', 'xhr-get', 'never sent');
  await h.waitFor(() => h.captures().length === 6, 'every XHR');
  assert.deepEqual(h.entry('req=xhr-formdata').requestBody, [['a', '1']]);
  assert.equal(h.entry('req=xhr-formdata').requestBodyText, 'a=1');
  assert.equal(h.entry('req=xhr-false').requestBodyText, 'false');
  assert.equal(h.entry('req=xhr-empty').requestBodyText, '');
  assert.equal(h.entry('req=xhr-empty').requestBodyKind, 'text');
  assert.equal(h.entry('req=xhr-urlsearch').requestBodyText, 'a=1&b=+');
  assert.equal(h.entry('req=xhr-bytes').requestBodyText, '{"a":1}');
  assert.equal(h.entry('req=xhr-get').requestBodyKind, 'none');
});

test('J5 header values are captured as the strings fetch sends, so an odd value cannot drop the entry', async () => {
  const h = interceptorHarness();
  h.sendConfig(ALL_ON);
  await h.window.fetch('https://api.test/headers', { headers: { 'x-fn': () => 1, 'x-n': 5 } });
  await h.waitFor(() => h.captures().length === 1, 'the entry');
  assert.equal(h.entry('/headers').requestHeaders['x-fn'], '() => 1');
  assert.equal(h.entry('/headers').requestHeaders['x-n'], '5');
  assert.equal(h.entry('/headers').captureDegraded, undefined);
});

test('J6 request text over 50,000 chars is cut with truncation metadata, never an in-band suffix', async () => {
  const h = interceptorHarness();
  h.sendConfig(ALL_ON);
  const long = '{"pad":"' + 'x'.repeat(60_000) + '"}';
  await h.window.fetch('https://api.test/echo?req=long', { method: 'POST', body: long });
  await h.waitFor(() => h.captures().length === 1, 'the entry');
  const entry = h.entry('req=long');
  assert.equal(entry.requestBodyText, long.slice(0, 50_000));
  assert.deepEqual(entry.requestTruncated, { totalChars: long.length, keptChars: 50_000 });
  assert.doesNotMatch(JSON.stringify(entry), /truncated \d+ chars/);
});

test('J6 response text over 250,000 chars keeps the prefix and records truncation as metadata', async () => {
  const big = 'a'.repeat(260_000);
  const pair = 'a'.repeat(249_999) + '\u{1F600}' + 'b'.repeat(10);
  const h = interceptorHarness({ fetchImpl: (url) => new Response(String(url).includes('pair') ? pair : big) });
  h.sendConfig(ALL_ON);
  await (await h.window.fetch('https://api.test/big')).text();
  await (await h.window.fetch('https://api.test/pair')).text();
  await h.waitFor(() => h.captures().length === 2, 'both responses');
  const bigEntry = h.entry('/big');
  assert.equal(bigEntry.responseRaw, big.slice(0, 250_000));
  assert.deepEqual(bigEntry.responseTruncated, { totalChars: 260_000, keptChars: 250_000 });
  assert.equal(bigEntry.size, 260_000, 'size stays the whole body in bytes');
  const pairEntry = h.entry('/pair');
  assert.equal(pairEntry.responseRaw, 'a'.repeat(249_999), 'the cut never splits a surrogate pair');
  assert.deepEqual(pairEntry.responseTruncated, { totalChars: pair.length, keptChars: 249_999 });
});

test('J6 large GraphQL variables are cut without an in-band suffix', async () => {
  const h = interceptorHarness();
  h.sendConfig(ALL_ON);
  const variables = { v: 'x'.repeat(12_000) };
  const body = JSON.stringify({ query: 'query Q($v: String) { q(v: $v) { id } }', operationName: 'Q', variables });
  await h.window.fetch('https://api.test/graphql', { method: 'POST', body });
  await h.waitFor(() => h.captures().length === 1, 'the entry');
  const { graphql } = h.entry('/graphql');
  assert.equal(graphql.operationName, 'Q');
  assert.equal(graphql.variables, JSON.stringify(variables).slice(0, 10_000));
  assert.deepEqual(graphql.variablesTruncated, { totalChars: JSON.stringify(variables).length, keptChars: 10_000 });
});

test('J5 XHR responseType json, arraybuffer and blob responses are captured', async () => {
  const h = interceptorHarness();
  h.sendConfig(ALL_ON);
  const get = (q, fields) => {
    const xhr = new h.FakeXHR();
    xhr.open('GET', `https://api.test/x?res=${q}`);
    xhr.send();
    h.finishXhr(xhr, fields);
  };
  get('json', { responseType: 'json', response: { viaXhrJson: true, id: 1, list: [1, 2] } });
  get('json-null', { responseType: 'json', response: null });
  get('arraybuffer', { responseType: 'arraybuffer', response: new TextEncoder().encode('{"a":1}').buffer });
  get('arraybuffer-binary', { responseType: 'arraybuffer', response: new Uint8Array([0xff, 0x00, 0xfe]).buffer });
  get('blob', { responseType: 'blob', response: new Blob(['{"viaBlob":true}'], { type: 'application/json' }) });
  get('text', { responseType: 'text', responseText: 'plain' });
  await h.waitFor(() => h.captures().length === 6, 'every XHR response');

  const e = (q) => h.entry(`res=${q}`);
  assert.equal(e('json').responseRaw, '{"viaXhrJson":true,"id":1,"list":[1,2]}');
  assert.equal(e('json').bodyReserialized, true, 'rebuilt from the parsed value, so flagged');
  assert.equal(e('json-null').responseRaw, null);
  assert.equal(e('arraybuffer').responseRaw, '{"a":1}');
  assert.equal(e('arraybuffer').size, 7);
  assert.equal(e('arraybuffer').bodyReserialized, undefined);
  assert.equal(e('arraybuffer-binary').responseRaw, null, 'bytes that are not UTF-8 are not shown as text');
  assert.equal(e('arraybuffer-binary').size, 3);
  assert.equal(e('blob').responseRaw, '{"viaBlob":true}');
  assert.equal(e('blob').size, 16);
  assert.equal(e('text').responseRaw, 'plain');
  for (const message of h.captures()) assert.equal(findBinary(message.entry), null, `no binary object posted for ${message.entry.url}`);
});

test('J5 a reused XHR keeps each send apart while a blob response is still being read', async () => {
  const h = interceptorHarness();
  h.sendConfig(ALL_ON);
  const xhr = new h.FakeXHR();
  xhr.open('GET', 'https://api.test/poll?n=1');
  xhr.send();
  h.finishXhr(xhr, { responseType: 'blob', response: new Blob(['{"n":1}']), status: 201 });
  // The page reuses the object before the first blob read settles.
  xhr.open('GET', 'https://api.test/poll?n=2');
  xhr.send();
  h.finishXhr(xhr, { responseType: '', response: null, responseText: '{"n":2}', status: 202 });
  await h.waitFor(() => h.captures().length === 2, 'both polls');
  const first = h.entry('n=1');
  const second = h.entry('n=2');
  assert.equal(first.responseRaw, '{"n":1}');
  assert.equal(first.status, 201, 'the status read when that send finished');
  assert.equal(second.responseRaw, '{"n":2}');
  assert.equal(second.status, 202);
  assert.notEqual(first.id, second.id);
});

test('J5 an entry the bridge cannot clone is re-posted degraded instead of disappearing', async () => {
  const h = interceptorHarness({ cloneFails: (message) => !!message.entry && /flaky/.test(String(message.entry.url)) && !message.entry.captureDegraded });
  h.sendConfig(ALL_ON);
  await h.window.fetch('https://api.test/flaky?access_token=secret-token', { method: 'POST', body: '{"keep":1}' });
  await h.window.fetch('https://api.test/fine');
  await h.waitFor(() => h.captures().length === 2, 'both entries');
  const entry = h.entry('/flaky');
  assert.equal(entry.captureDegraded, true);
  assert.equal(entry.requestBodyText, '{"keep":1}', 'the degraded entry keeps the body text');
  assert.equal(entry.status, 200);
  assert.equal(entry.url, 'https://api.test/flaky?access_token=REDACTED', 'the degraded copy carries the scrubbed URL (C-4b)');
  assert.equal(h.entry('/fine').captureDegraded, undefined);
  assert.equal(h.drops().length, 0);
});

test('J5 when even the degraded entry cannot be posted, a clone-failed drop is reported', async () => {
  const h = interceptorHarness({ cloneFails: (message) => !!message.entry && /doomed/.test(String(message.entry.url)) });
  h.sendConfig(ALL_ON);
  await h.window.fetch('https://api.test/doomed');
  await h.window.fetch('https://api.test/fine');
  await h.waitFor(() => h.captures().length === 1 && h.drops().length === 1, 'the fine entry and one drop report');
  assert.deepEqual(h.drops().map(({ reason, count, token }) => ({ reason, count, token })), [{ reason: 'clone-failed', count: 1, token: h.token }]);
  assert.ok(h.entry('/fine'));
});

test('J5 mixed burst: FormData, URLSearchParams, Uint8Array, Blob, XHR FormData and a plain fetch all arrive, and the page sees no error', async () => {
  const h = interceptorHarness();
  h.sendConfig(ALL_ON);
  const form = new FormData();
  form.append('a', '1');
  const xhrForm = new FormData();
  xhrForm.append('b', '2');
  const results = await Promise.allSettled([
    h.window.fetch('https://api.test/mixed?k=formdata', { method: 'POST', body: form }),
    h.window.fetch('https://api.test/mixed?k=urlsearch', { method: 'POST', body: new URLSearchParams({ a: '1' }) }),
    h.window.fetch('https://api.test/mixed?k=uint8', { method: 'POST', body: new TextEncoder().encode('{"a":1}') }),
    h.window.fetch('https://api.test/mixed?k=blob', { method: 'POST', body: new Blob(['{"b":2}']) }),
    h.window.fetch('https://api.test/mixed?k=plain'),
    (async () => {
      const xhr = new h.FakeXHR();
      xhr.open('POST', 'https://api.test/mixed?k=xhr-formdata');
      xhr.send(xhrForm);
      h.finishXhr(xhr, { responseText: '{}' });
    })(),
  ]);
  assert.deepEqual(results.map((result) => result.status), Array(6).fill('fulfilled'), 'the page sees no error');
  await h.waitFor(() => h.captures().length === 6, 'every entry of the burst');
  assert.deepEqual(h.captures().map((m) => new URL(m.entry.url).searchParams.get('k')).sort(),
    ['blob', 'formdata', 'plain', 'uint8', 'urlsearch', 'xhr-formdata']);
  assert.equal(h.drops().length, 0);
});

test('J16 WebSocket and SSE frames carry their size in bytes and truncation metadata, not an ellipsis', async () => {
  const h = interceptorHarness({ streams: true });
  h.sendConfig(ALL_ON);
  const ws = new h.window.WebSocket('wss://api.test/socket');
  ws.fire('open');
  ws.send('é'.repeat(10));
  ws.fire('message', { data: 'z'.repeat(3000) });
  ws.fire('message', { data: '\u{1F600}' });
  const sse = new h.window.EventSource('https://api.test/stream');
  sse.fire('open');
  sse.fire('message', { data: 'ü' });
  h.advance(500);
  await h.settle();
  const latest = (source) => {
    const id = h.captures().find((m) => m.entry.source === source).entry.id;
    return h.posted.filter((m) => m.update && m.entry.id === id && m.entry.wsFrames).at(-1).entry;
  };
  const socket = latest('ws');
  assert.deepEqual(socket.wsFrames.map(({ dir, preview, size, truncated }) => ({ dir, preview, size, truncated })), [
    { dir: 'out', preview: 'é'.repeat(10), size: 20, truncated: undefined },
    { dir: 'in', preview: 'z'.repeat(2000), size: 3000, truncated: { totalChars: 3000, keptChars: 2000 } },
    { dir: 'in', preview: '\u{1F600}', size: 4, truncated: undefined },
  ]);
  assert.equal(socket.size, 3024, 'the socket total is in bytes too');
  const stream = latest('sse');
  assert.deepEqual(stream.wsFrames.map(({ preview, size }) => ({ preview, size })), [{ preview: 'ü', size: 2 }]);
});

// ── content.js boundary for the new fields ─────────────────────────────────────
function contentCapture() {
  const added = [];
  // Cloned out of the VM realm so deepEqual compares data, not prototypes.
  const harness = contentHarness({ init: async () => {}, add(entry) { added.push(structuredClone(entry)); } });
  const capture = (entry) => harness.dispatch({ __xray_capture__: true, token: 'token', entry });
  const byId = () => Object.fromEntries(added.map((entry) => [entry.id, entry]));
  return { harness, capture, byId };
}

test('J4–J6 content bridge carries body text, kind, truncation metadata, captureDegraded, bodyReserialized and objectRefs', async () => {
  const { harness, capture, byId } = contentCapture();
  await harness.dispatch({ __xray_bridge_ready__: true, token: 'token' });
  await capture({ id: 'full', type: 'api', url: 'https://x.test', requestBodyText: 'null', requestBodyKind: 'text', requestBody: null,
    requestTruncated: { totalChars: 60_000, keptChars: 50_000 }, responseRaw: '[1',
    responseTruncated: { totalChars: 938_891, keptChars: 250_000 }, captureDegraded: true, bodyReserialized: true });
  await capture({ id: 'bytes', type: 'api', requestBodyText: 'abc', requestBodyKind: 'text', requestTruncated: { totalBytes: 2_000_000, keptChars: 3 } });
  await capture({ id: 'log', type: 'log', logData: ['x'], objectRefs: ['xrl_1', 7, 'xrl_2', 'r'.repeat(201)] });
  await capture({ id: 'bad', type: 'api', requestBodyKind: 'evil', requestTruncated: { totalChars: -1, keptChars: 'x' },
    responseTruncated: [1], captureDegraded: 'yes', bodyReserialized: 1, requestBodyText: 42, objectRefs: 'xrl_1' });
  await capture({ id: 'long', type: 'api', requestBodyText: 'q'.repeat(70_000), requestBodyKind: 'text' });
  const entries = byId();
  assert.equal(entries.full.requestBodyText, 'null');
  assert.equal(entries.full.requestBodyKind, 'text');
  // keptChars is the length of the text actually carried (fix round 1).
  assert.deepEqual(entries.full.requestTruncated, { totalChars: 60_000, keptChars: 4 });
  assert.deepEqual(entries.full.responseTruncated, { totalChars: 938_891, keptChars: 2 });
  assert.equal(entries.full.captureDegraded, true);
  assert.equal(entries.full.bodyReserialized, true);
  assert.deepEqual(entries.bytes.requestTruncated, { totalBytes: 2_000_000, keptChars: 3 });
  assert.deepEqual(entries.log.objectRefs, ['xrl_1', 'xrl_2'], 'refs are strings of a bounded length');
  for (const key of ['requestBodyKind', 'requestTruncated', 'responseTruncated', 'captureDegraded', 'bodyReserialized', 'requestBodyText', 'objectRefs']) {
    assert.equal(entries.bad[key], undefined, `an invalid ${key} is not carried`);
  }
  assert.equal(entries.long.requestBodyText.length, 60_000, 'the bridge bounds the text');
  assert.deepEqual(entries.long.requestTruncated, { totalChars: 70_000, keptChars: 60_000 }, 'and records its own cut as metadata');

  // console-capture's batch path (Task 1 sets captureDegraded on a log it had to degrade).
  await harness.dispatch({ __xray_capture__: true, token: 'token', batch: true, entries: [
    { id: 'degraded-log', type: 'log', logLevel: 'log', logData: '[XRAY: this value could not be captured]', objectRefs: ['xrl_9'], captureDegraded: true },
  ] });
  const log = byId()['degraded-log'];
  assert.equal(log.captureDegraded, true);
  assert.deepEqual(log.objectRefs, ['xrl_9']);
});

test('J9 fix round 1: a page cannot mark a capture as imported (only import.ts sets it)', async () => {
  // "imported" switches on the pre-J6 in-band suffix reading and the Imported flag; a capture is never one.
  const { harness, capture, byId } = contentCapture();
  await harness.dispatch({ __xray_bridge_ready__: true, token: 'token' });
  await capture({ id: 'forged', type: 'api', url: 'https://x.test/a', responseRaw: '{"x":1}\n... truncated 99 chars', imported: true, mocked: true, pinned: true });
  await harness.dispatch({ __xray_capture__: true, token: 'token', batch: true, entries: [{ id: 'forged-log', type: 'log', logLevel: 'log', imported: true }] });
  const entries = byId();
  assert.equal(entries.forged.imported, undefined);
  assert.equal(entries['forged-log'].imported, undefined);
  assert.equal(entries.forged.mocked, true, 'the other flags still cross');
  assert.equal(entries.forged.pinned, true);
});

test('Ruling: the content bridge clamps timestamps into the Date range (|t| <= 8.64e15)', async () => {
  const { harness, capture, byId } = contentCapture();
  await harness.dispatch({ __xray_bridge_ready__: true, token: 'token' });
  await capture({ id: 'far', type: 'api', timestamp: 9e15 });
  await capture({ id: 'huge', type: 'log', timestamp: 1e300 });
  await capture({ id: 'neg', type: 'log', timestamp: -1 });
  await capture({ id: 'ok', type: 'api', timestamp: 1_700_000_000_000 });
  const entries = byId();
  assert.equal(entries.far.timestamp, 8.64e15);
  assert.equal(entries.huge.timestamp, 8.64e15);
  assert.equal(entries.neg.timestamp, 0);
  assert.equal(entries.ok.timestamp, 1_700_000_000_000);
  for (const entry of Object.values(entries)) {
    assert.doesNotThrow(() => new Date(entry.timestamp).toISOString(), `${entry.id} stays a valid Date`);
  }
});

test('J5 clone-failed drops reported by the page bridge are counted in the capture receipt', async () => {
  const harness = contentHarness({ init: async () => {}, add() {} });
  await harness.dispatch({ __xray_bridge_ready__: true, token: 'token' });
  const drop = (data) => harness.dispatch({ __xray_capture_drop__: true, token: 'token', reason: 'clone-failed', count: 1, ...data });
  await drop({});
  await drop({ count: 2 });
  await drop({ token: 'forged' });
  await drop({ reason: 'made-up' });
  for (const count of [0, -1, 1.5, NaN, '3', undefined, null]) await drop({ count });
  await drop({ count: 1e9 });
  const receipt = harness.window.XRAY_CaptureReceipt.get();
  assert.equal(receipt.dropReasons['clone-failed'], 503, '1 + 2 + one count capped at 500');
  assert.equal(receipt.dropped, 503);
  assert.equal(receipt.dropReasons['made-up'], undefined);
  assert.ok(Number.isFinite(receipt.dropped));
});

// ── Task 3 fix round 1 ─────────────────────────────────────────────────────────
const INTERCEPTOR_SOURCE = fs.readFileSync(require.resolve('../content/interceptor.js'), 'utf8');

test('Fix1 GraphQL is read from the whole body: a > 50,000-char string body and a byte body inside the decode window', async () => {
  const h = interceptorHarness();
  h.sendConfig(ALL_ON);
  const variables = { v: 'x'.repeat(60_000) };
  const body = JSON.stringify({ query: 'mutation Save($v: String) { save(v: $v) { id } }', operationName: 'Save', variables });
  await h.window.fetch('https://api.test/graphql?case=string', { method: 'POST', body });
  await h.window.fetch('https://api.test/graphql?case=bytes', { method: 'POST', body: new TextEncoder().encode(body) });
  const xhr = new h.FakeXHR();
  xhr.open('POST', 'https://api.test/graphql?case=xhr');
  xhr.send(body);
  h.finishXhr(xhr, { responseText: '{}' });
  await h.waitFor(() => h.captures().length === 3, 'every GraphQL request');
  for (const q of ['string', 'bytes', 'xhr']) {
    const entry = h.entry(`case=${q}`);
    assert.equal(entry.requestTruncated?.keptChars, 50_000, `${q}: the body text is cut`);
    assert.equal(entry.graphql?.operationType, 'mutation', `${q}: still detected as GraphQL`);
    assert.equal(entry.graphql.operationName, 'Save', q);
    assert.equal(entry.graphql.variables, JSON.stringify(variables).slice(0, 10_000), `${q}: the variables keep their own cut`);
    assert.deepEqual(entry.graphql.variablesTruncated, { totalChars: JSON.stringify(variables).length, keptChars: 10_000 }, q);
  }
});

test('Fix1 a Request upload is read through a bounded window: every byte counted, only the window kept', async () => {
  const h = interceptorHarness();
  h.sendConfig(ALL_ON);
  const big = 'a'.repeat(1_000_000);
  await h.window.fetch(new Request('https://api.test/upload?case=big', { method: 'POST', body: big }));
  await h.waitFor(() => h.entry('case=big'), 'the large upload');
  const entry = h.entry('case=big');
  assert.equal(entry.requestBodyText, big.slice(0, 50_000));
  assert.deepEqual(entry.requestTruncated, { totalBytes: 1_000_000, keptChars: 50_000 });
  assert.equal(entry.captureDegraded, undefined);
  assert.doesNotMatch(INTERCEPTOR_SOURCE, /clone\(\)\.arrayBuffer\(\)/, 'a Request body is never read whole');
});

test('Fix1 a streaming upload that never closes still yields its entry once the request settles (answered or aborted)', async () => {
  const h = interceptorHarness({
    fetchImpl: (input) => (String(input.url).includes('aborted')
      ? Promise.reject(new DOMException('The user aborted a request.', 'AbortError'))
      : new Response('{"ok":true}')),
  });
  h.sendConfig(ALL_ON);
  const open = () => new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode('{"partial":')); } });
  const answered = await h.window.fetch(new Request('https://api.test/upload?case=answered', { method: 'POST', body: open(), duplex: 'half' }));
  assert.equal(answered.status, 200, 'the page gets its response untouched');
  await assert.rejects(h.window.fetch(new Request('https://api.test/upload?case=aborted', { method: 'POST', body: open(), duplex: 'half' })), /aborted/);
  await h.settle();
  h.advance(1_000); // the short grace after the request settles
  await h.waitFor(() => h.entry('case=answered') && h.entry('case=aborted'), 'both stalled uploads');
  for (const q of ['answered', 'aborted']) {
    const entry = h.entry(`case=${q}`);
    assert.equal(entry.captureDegraded, true, `${q}: the body read never finished`);
    assert.equal(entry.requestBodyText, '{"partial":', `${q}: what arrived is kept`);
    assert.deepEqual(entry.requestTruncated, { totalBytes: 11, keptChars: 11 }, `${q}: bytes seen so far`);
  }
  assert.equal(h.entry('case=answered').status, 200);
  assert.equal(h.entry('case=aborted').status, 0);
});

test('Fix1 unreadable bodies degrade instead of disappearing: response read rejects, a used Request, a failing Blob read; a stream body is described', async () => {
  const h = interceptorHarness({
    fetchImpl: (input) => (String(input.url || input).includes('broken-response')
      ? new Response(new ReadableStream({ start(controller) { controller.error(new Error('network reset')); } }))
      : new Response('{"ok":true}')),
  });
  h.sendConfig(ALL_ON);
  const response = await h.window.fetch('https://api.test/broken-response');
  await response.text().catch(() => {});
  const used = new Request('https://api.test/used-request', { method: 'POST', body: 'x' });
  await used.text();
  await h.window.fetch(used);
  const badBlob = { [Symbol.toStringTag]: 'Blob', size: 10, slice: () => ({ arrayBuffer: () => Promise.reject(new Error('NotReadableError')) }) };
  await h.window.fetch('https://api.test/bad-blob', { method: 'POST', body: badBlob });
  await h.window.fetch('https://api.test/stream-body', { method: 'POST', body: new ReadableStream(), duplex: 'half' });
  await h.waitFor(() => h.captures().length === 4, 'every entry');
  const broken = h.entry('/broken-response');
  assert.equal(broken.captureDegraded, true);
  assert.equal(broken.responseRaw, null);
  assert.equal(broken.status, 200);
  assert.equal(h.entry('/used-request').captureDegraded, true, 'req.clone() threw');
  assert.equal(h.entry('/used-request').requestBody, null);
  assert.equal(h.entry('/bad-blob').requestBodyKind, 'binary');
  assert.equal(h.entry('/bad-blob').captureDegraded, true);
  assert.deepEqual(h.entry('/bad-blob').requestBody, { binary: true, size: 10, base64Prefix: '' });
  assert.equal(h.entry('/stream-body').requestBodyKind, 'binary');
  assert.deepEqual(h.entry('/stream-body').requestBody, { binary: true, stream: true });
});

test('Fix1 degraded re-posts also cover XHR entries and WebSocket/SSE updates', async () => {
  const h = interceptorHarness({
    streams: true,
    cloneFails: (message) => !!message.__xray_capture__ && !message.entry.captureDegraded
      && (message.entry.source === 'xhr' || (message.update && Array.isArray(message.entry.wsFrames))),
  });
  h.sendConfig(ALL_ON);
  const xhr = new h.FakeXHR();
  xhr.open('POST', 'https://api.test/xhr-degraded');
  xhr.send('{"a":1}');
  h.finishXhr(xhr, { responseText: '{"ok":1}' });
  const ws = new h.window.WebSocket('wss://api.test/socket');
  ws.fire('open');
  ws.fire('message', { data: 'frame-1' });
  const sse = new h.window.EventSource('https://api.test/stream');
  sse.fire('message', { data: 'event-1' });
  h.advance(500);
  await h.waitFor(() => h.entry('/xhr-degraded'), 'the XHR entry');
  const entry = h.entry('/xhr-degraded');
  assert.equal(entry.captureDegraded, true);
  assert.equal(entry.requestBodyText, '{"a":1}');
  assert.equal(entry.responseRaw, '{"ok":1}');
  for (const source of ['ws', 'sse']) {
    const id = h.captures().find((m) => m.entry.source === source).entry.id;
    const update = h.posted.filter((m) => m.update && m.entry.id === id && m.entry.wsFrames).at(-1);
    assert.equal(update.entry.captureDegraded, true, `${source}: the update arrives degraded`);
    assert.equal(update.entry.wsFrames.at(-1).preview, source === 'ws' ? 'frame-1' : 'event-1');
  }
  assert.equal(h.drops().length, 0);
});

test('Fix1 the degraded copy keeps an own __proto__ key as data', async () => {
  const h = interceptorHarness({ cloneFails: (message) => !!message.entry && /proto/.test(String(message.entry.url)) && !message.entry.captureDegraded });
  h.sendConfig(ALL_ON);
  await h.window.fetch('https://api.test/proto', { method: 'POST', body: '{"__proto__":{"polluted":true},"x":1}' });
  await h.waitFor(() => h.captures().length === 1, 'the entry');
  const { requestBody } = h.entry('/proto');
  assert.equal(Object.hasOwn(requestBody, '__proto__'), true, 'kept as an own key');
  assert.deepEqual(Object.getOwnPropertyDescriptor(requestBody, '__proto__').value, { polluted: true });
  assert.equal(requestBody.x, 1);
  assert.equal({}.polluted, undefined);
});

test('Fix1 a Document body: XHR sends it serialized (doctype, comments, markup); fetch sends its string', async () => {
  const h = interceptorHarness();
  h.sendConfig(ALL_ON);
  const doc = {
    [Symbol.toStringTag]: 'HTMLDocument',
    childNodes: [{ nodeType: 10, name: 'html' }, { nodeType: 8, data: ' note ' }, { nodeType: 1, outerHTML: '<html><body><h1>doc</h1></body></html>' }],
  };
  const xhr = new h.FakeXHR();
  xhr.open('POST', 'https://api.test/doc?via=xhr');
  xhr.send(doc);
  h.finishXhr(xhr, { responseText: '{}' });
  await h.window.fetch('https://api.test/doc?via=fetch', { method: 'POST', body: doc });
  await h.waitFor(() => h.captures().length === 2, 'both document posts');
  assert.equal(h.entry('via=xhr').requestBodyText, '<!DOCTYPE html><!-- note --><html><body><h1>doc</h1></body></html>');
  assert.equal(h.entry('via=fetch').requestBodyText, '[object HTMLDocument]', 'fetch converts a Document to its string');
});

test('Ruling: XHR open() and setRequestHeader() never throw into the page for non-string arguments', async () => {
  const h = interceptorHarness();
  h.sendConfig(ALL_ON);
  const xhr = new h.FakeXHR();
  assert.doesNotThrow(() => xhr.open(5, 'https://api.test/odd'));
  assert.doesNotThrow(() => xhr.setRequestHeader(7, 'seven'));
  assert.doesNotThrow(() => xhr.setRequestHeader({ toString() { throw new Error('page toString'); } }, 'x'));
  xhr.send();
  h.finishXhr(xhr, { responseText: '{}' });
  await h.waitFor(() => h.captures().length === 1, 'the odd request');
  assert.equal(h.entry('/odd').method, '5');
  assert.equal(h.entry('/odd').requestHeaders['7'], 'seven');
  // A method whose conversion throws is the native open()'s to reject, not the wrapper's.
  assert.doesNotThrow(() => new h.FakeXHR().open({ toString() { throw new Error('page toString'); } }, 'https://api.test/x'));
  assert.equal(h.xhrCalls.open.length, 2, 'the native open() still runs every time');
});

test('Final fix M4: a header value is converted once, inside setRequestHeader\'s try; send() never throws into the page', async () => {
  const h = interceptorHarness();
  h.sendConfig(ALL_ON);
  // 1. A value whose conversion throws: the native setRequestHeader throws on it and the page may
  //    catch that; send() used to convert the kept raw value again, outside any try.
  const hostile = new h.FakeXHR();
  hostile.open('POST', 'https://api.test/m4-hostile');
  assert.doesNotThrow(() => hostile.setRequestHeader('Authorization', { toString() { throw new Error('page toString'); } }));
  assert.doesNotThrow(() => hostile.send('{}'), 'send() reads no raw page value');
  h.finishXhr(hostile, { responseText: '{}' });
  // 2. A value that converts once and throws after: it is converted where it is stored, and only there.
  const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtNCJ9.sig';
  let conversions = 0;
  const once = { toString() { conversions += 1; if (conversions > 1) throw new Error('page toString'); return `Bearer ${token}`; } };
  const xhr = new h.FakeXHR();
  xhr.open('POST', 'https://api.test/m4-once');
  xhr.setRequestHeader('Authorization', once);
  assert.equal(conversions, 1, 'converted by setRequestHeader');
  assert.doesNotThrow(() => xhr.send('{}'));
  h.finishXhr(xhr, { responseText: '{}' });
  await h.waitFor(() => h.captures().length === 2, 'both requests');
  assert.equal(h.entry('/m4-hostile').requestHeaders.authorization, '[redacted]');
  assert.equal(h.entry('/m4-hostile').jwtLenses, undefined);
  assert.equal(h.entry('/m4-once').jwtLenses?.[0]?.payload?.sub, 'm4', 'the lens decodes the stored text');
  assert.equal(conversions, 1, 'never converted again');
});

test('Final fix M4 (fetch): a sensitive header value is kept as text, converted inside a try; XRAY never rejects the page\'s fetch', async () => {
  const h = interceptorHarness();
  h.sendConfig(ALL_ON);
  const hostile = { toString() { throw new Error('page toString'); } };
  // The real fetch is still called: only it may reject a value it cannot convert, as it would without XRAY.
  await h.window.fetch('https://api.test/m4-fetch', { method: 'POST', headers: { Authorization: hostile, 'x-other': '1' }, body: '{"a":1}' });
  await h.waitFor(() => h.captures().length === 1, 'the entry');
  assert.equal(h.fetchCalls.length, 1, 'the request went out');
  const entry = h.entry('/m4-fetch');
  assert.equal(entry.requestHeaders.Authorization, '[redacted]', 'fetch keeps the name as the page wrote it');
  assert.equal(entry.requestBodyText, '{"a":1}', 'the rest of the capture is unaffected');
  assert.equal(entry.jwtLenses, undefined);
});

test('Ruling: captures the pre-config buffer drops are counted as pending-overflow, only for transports that are on', async () => {
  const on = interceptorHarness();
  await Promise.all(Array.from({ length: 60 }, (_, i) => on.window.fetch(`https://api.test/r${i}`)));
  await on.settle();
  assert.equal(on.drops().length, 0, 'nothing is reported before the config says what is captured');
  on.sendConfig(ALL_ON);
  assert.equal(on.captures().length, 50);
  assert.deepEqual(on.drops().map(({ reason, count, token }) => ({ reason, count, token })), [{ reason: 'pending-overflow', count: 10, token: on.token }]);

  const off = interceptorHarness();
  await Promise.all(Array.from({ length: 60 }, (_, i) => off.window.fetch(`https://api.test/r${i}`)));
  await off.settle();
  off.sendConfig({ captureFetch: false, captureXhr: true, captureWs: true });
  assert.deepEqual(off.drops(), [], 'traffic the user turned off is not reported as lost');
});

test('Fix1 XHR arraybuffer/blob responses that are not UTF-8 carry a binary descriptor', async () => {
  const h = interceptorHarness();
  h.sendConfig(ALL_ON);
  const bytes = new Uint8Array([0xff, 0x00, 0xfe, 0x01]);
  for (const [q, fields] of [['ab', { responseType: 'arraybuffer', response: bytes.slice().buffer }], ['blob', { responseType: 'blob', response: new Blob([bytes]) }]]) {
    const xhr = new h.FakeXHR();
    xhr.open('GET', `https://api.test/bin?res=${q}`);
    xhr.send();
    h.finishXhr(xhr, fields);
  }
  await h.waitFor(() => h.captures().length === 2, 'both binary responses');
  for (const q of ['ab', 'blob']) {
    const entry = h.entry(`res=${q}`);
    assert.equal(entry.responseRaw, null, q);
    assert.equal(entry.size, 4, q);
    assert.deepEqual(entry.responseBinary, { binary: true, size: 4, base64Prefix: Buffer.from(bytes).toString('base64') }, q);
    assert.equal(findBinary(entry), null);
  }
});

test('Fix1 content bridge keeps truncation metadata consistent with the text it carries', async () => {
  const { harness, capture, byId } = contentCapture();
  await harness.dispatch({ __xray_bridge_ready__: true, token: 'token' });
  await capture({ id: 'kept', type: 'api', responseRaw: 'abc', responseTruncated: { totalChars: 10, keptChars: 999 } });
  await capture({ id: 'short-total', type: 'api', responseRaw: 'abcdef', responseTruncated: { totalChars: 3, keptChars: 6 } });
  await capture({ id: 'not-cut', type: 'api', responseRaw: 'abc', responseTruncated: { totalChars: 3, keptChars: 3 } });
  await capture({ id: 'no-text', type: 'api', responseTruncated: { totalChars: 10, keptChars: 3 } });
  await capture({ id: 'bytes-ok', type: 'api', requestBodyText: 'abc', requestTruncated: { totalBytes: 2_000_000, keptChars: 1 } });
  await capture({ id: 'bytes-bad', type: 'api', requestBodyText: 'abcdef', requestTruncated: { totalBytes: 2, keptChars: 6 } });
  const entries = byId();
  assert.deepEqual(entries.kept.responseTruncated, { totalChars: 10, keptChars: 3 }, 'keptChars is the carried text length');
  for (const id of ['short-total', 'not-cut', 'no-text']) assert.equal(entries[id].responseTruncated, undefined, `${id}: inconsistent metadata is dropped`);
  assert.deepEqual(entries['bytes-ok'].requestTruncated, { totalBytes: 2_000_000, keptChars: 3 });
  assert.equal(entries['bytes-bad'].requestTruncated, undefined, 'fewer bytes than kept chars is impossible');

  // An XHR binary response descriptor is carried only in its exact shape.
  await capture({ id: 'bin', type: 'api', responseRaw: null, responseBinary: { binary: true, size: 4, base64Prefix: '//4AAQ==', extra: 'x' } });
  await capture({ id: 'bin-bad', type: 'api', responseBinary: { binary: true, size: -1, base64Prefix: '<img onerror>' } });
  const more = byId();
  assert.deepEqual(more.bin.responseBinary, { binary: true, size: 4, base64Prefix: '//4AAQ==' });
  assert.equal(more['bin-bad'].responseBinary, undefined);
});

test('Ruling: content bridge carries jwtLenses and delayedByRuleMs', async () => {
  const { harness, capture, byId } = contentCapture();
  await harness.dispatch({ __xray_bridge_ready__: true, token: 'token' });
  await capture({ id: 'lens', type: 'api', delayedByRuleMs: 250,
    jwtLenses: [{ source: 'authorization', header: { alg: 'HS256' }, payload: { sub: '1', exp: 1 } }, 'junk', { source: 5 }, { source: 'x-token', header: null, payload: [1] }] });
  await capture({ id: 'bad', type: 'api', jwtLenses: 'x', delayedByRuleMs: 'soon' });
  await capture({ id: 'long', type: 'api', delayedByRuleMs: 1e12 });
  const entries = byId();
  assert.deepEqual(entries.lens.jwtLenses, [
    { source: 'authorization', header: { alg: 'HS256' }, payload: { sub: '1', exp: 1 } },
    { source: 'x-token', header: null, payload: null },
  ]);
  assert.equal(entries.lens.delayedByRuleMs, 250);
  assert.equal(entries.bad.jwtLenses, undefined);
  assert.equal(entries.bad.delayedByRuleMs, undefined);
  assert.equal(entries.long.delayedByRuleMs, 60_000, 'bounded by the rule delay cap');
});

test('Ruling: content bridge counts pending-overflow drops like clone-failed ones', async () => {
  const harness = contentHarness({ init: async () => {}, add() {} });
  await harness.dispatch({ __xray_bridge_ready__: true, token: 'token' });
  await harness.dispatch({ __xray_capture_drop__: true, token: 'token', reason: 'pending-overflow', count: 10 });
  await harness.dispatch({ __xray_capture_drop__: true, token: 'token', reason: 'clone-failed', count: 1 });
  const receipt = harness.window.XRAY_CaptureReceipt.get();
  assert.equal(receipt.dropReasons['pending-overflow'], 10);
  assert.equal(receipt.dropReasons['clone-failed'], 1);
  assert.equal(receipt.dropped, 11);
});

// ── JSON fidelity Task 9 (spec J10) ─────────────────────────────────────────────

test('J10 replay sends the request text it is given unchanged; a value body is never re-serialized', async () => {
  const h = interceptorHarness();
  h.sendConfig(ALL_ON);
  const texts = Object.entries(REQUEST_TEXTS);
  for (const [name, text] of texts) {
    h.sendReplay({ url: `https://api.test/echo?replay=${name}`, method: 'POST', headers: { 'content-type': 'application/json' }, body: text, replayOf: `orig-${name}` });
  }
  h.sendReplay({ url: 'https://api.test/echo?replay=none', method: 'POST', headers: {}, body: null, replayOf: 'orig-none' });
  h.sendReplay({ url: 'https://api.test/echo?replay=value', method: 'POST', headers: {}, body: { b: 1, a: 2 }, replayOf: 'orig-value' });
  h.sendReplay({ url: 'https://api.test/echo?replay=get', method: 'GET', headers: {}, body: 'never sent', replayOf: 'orig-get' });
  await h.waitFor(() => h.fetchCalls.length === texts.length + 3, 'every replay reaches fetch');
  const sent = (fragment) => h.fetchCalls.find(([url]) => String(url).includes(fragment))[1];
  for (const [name, text] of texts) assert.equal(sent(`replay=${name}`).body, text, `${name}: sent exactly as captured`);
  for (const name of ['none', 'value', 'get']) assert.equal('body' in sent(`replay=${name}`), false, `${name}: no body`);
  await h.waitFor(() => h.captures().length === texts.length + 3, 'every replay captured');
  assert.equal(h.entry('replay=bigint').requestBodyText, REQUEST_TEXTS.bigint, 'the replay is captured with the same text');
  assert.equal(h.entry('replay=bigint').replayOf, 'orig-bigint');
});

test('Carry (Task 3 ruling): a string body is parsed in the page only when the parse is used, and never past 1,000,000 chars', async () => {
  const parsedLengths = [];
  const json = Object.create(JSON);
  json.parse = (text, reviver) => { parsedLengths.push(String(text).length); return JSON.parse(text, reviver); };
  const h = interceptorHarness({ json });
  h.sendConfig(ALL_ON);
  // A big JSON body that cannot be GraphQL (no "query" in it): cut at 50,000 chars, never parsed.
  const plain = JSON.stringify({ rows: 'x'.repeat(60_000) });
  await h.window.fetch('https://api.test/upload?case=plain', { method: 'POST', body: plain });
  const xhr = new h.FakeXHR();
  xhr.open('POST', 'https://api.test/upload?case=xhr');
  xhr.send(plain);
  h.finishXhr(xhr, { responseText: '{}' });
  // A GraphQL-looking body past the 1,000,000-char ceiling: not parsed, so no GraphQL label (the ruling's cost).
  const huge = JSON.stringify({ query: 'mutation Save { save { id } }', variables: { v: 'y'.repeat(1_000_010) } });
  await h.window.fetch('https://api.test/graphql?case=huge', { method: 'POST', body: huge });
  // A small body is still parsed for its requestBody copy; a mid-size GraphQL body still gets its label.
  await h.window.fetch('https://api.test/upload?case=small', { method: 'POST', body: '{"b":1,"a":2}' });
  const mid = JSON.stringify({ query: 'query Users { users { id } }', variables: { v: 'z'.repeat(70_000) } });
  await h.window.fetch('https://api.test/graphql?case=mid', { method: 'POST', body: mid });
  await h.waitFor(() => h.captures().length === 5, 'every request');
  assert.deepEqual(parsedLengths.filter((length) => length >= 50_000 && length !== mid.length), [], 'no big body parsed except the GraphQL candidate under the ceiling');
  assert.equal(h.entry('case=plain').requestTruncated.keptChars, 50_000);
  assert.equal(h.entry('case=xhr').requestTruncated.keptChars, 50_000);
  assert.equal(h.entry('case=huge').graphql, undefined);
  assert.equal(h.entry('case=huge').requestTruncated.totalChars, huge.length);
  assert.deepEqual(h.entry('case=small').requestBody, { b: 1, a: 2 });
  assert.equal(h.entry('case=mid').graphql?.operationName, 'Users');
});

test('Fix1 replay rebuilds a FormData of text fields in order with the constructor pinned at document_start; the multipart Content-Type is dropped; an invalid form is not sent', async () => {
  const h = interceptorHarness();
  h.sendConfig(ALL_ON);
  // Page script replacing FormData after document_start cannot see or break the rebuilt form.
  h.context.FormData = class PageFormData { append() { throw new Error('page code ran'); } };
  const pairs = [['a', '1'], ['b', 'two words'], ['a', '3'], ['note', 'é = 1\nx']];
  h.sendReplay({ url: 'https://api.test/form?replay=ok', method: 'POST', headers: { 'Content-Type': 'multipart/form-data; boundary=----captured', 'x-trace': '7' }, body: { formdata: pairs }, replayOf: 'orig-form' });
  // Not sent at all: a value that is not text, a pair that is not two strings, more than 1,000 fields,
  // more than 50,000 characters of names and values, a form that is not a list.
  const invalid = {
    value: [['a', 1]], pair: [['a']], many: Array.from({ length: 1_001 }, (_, i) => [`f${i}`, 'v']),
    long: [['a', 'x'.repeat(50_001)]], notarray: 'a=1',
  };
  for (const [name, formdata] of Object.entries(invalid)) {
    h.sendReplay({ url: `https://api.test/form?replay=${name}`, method: 'POST', headers: {}, body: { formdata }, replayOf: `bad-${name}` });
  }
  await h.waitFor(() => h.fetchCalls.length >= 1, 'the form replay');
  await h.settle();
  assert.equal(h.fetchCalls.length, 1, 'only the valid form is sent');
  const [url, init] = h.fetchCalls[0];
  assert.match(String(url), /replay=ok/);
  assert.ok(init.body instanceof FormData, 'a real FormData, from the constructor pinned at document_start');
  assert.deepEqual([...init.body.entries()], pairs, 'names, values and order');
  assert.deepEqual({ ...init.headers }, { 'x-trace': '7' }, 'the captured multipart Content-Type is dropped (the browser sets the new boundary)');
  await h.waitFor(() => h.captures().length === 1, 'the replay is captured');
  assert.deepEqual(h.entry('replay=ok').requestBody, pairs);
  assert.equal(h.entry('replay=ok').replayOf, 'orig-form');
});

test('Task 10 a replay request that breaks a conversion never throws into the page; that replay is dropped', async () => {
  const h = interceptorHarness();
  h.sendConfig(ALL_ON);
  // A value whose text conversion throws, as String() does in a page that broke the built-ins
  // the replay path uses (Object.prototype.toString, String.prototype.slice, …).
  const hostile = { toString() { throw new Error('page code'); } };
  assert.doesNotThrow(() => h.sendReplay({ url: 'https://api.test/echo?replay=header', method: 'POST', headers: { 'x-a': hostile }, body: '{}', replayOf: 'orig-header' }), 'a header value');
  assert.doesNotThrow(() => h.sendReplay({ url: hostile, method: 'POST', headers: {}, body: '{}', replayOf: 'orig-url' }), 'the URL');
  h.sendReplay({ url: 'https://api.test/echo?replay=after', method: 'POST', headers: { 'x-b': '1' }, body: '{}', replayOf: 'orig-after' });
  await h.waitFor(() => h.fetchCalls.length >= 1, 'the next replay');
  await h.settle();
  assert.equal(h.fetchCalls.length, 1, 'the broken replays are dropped; the next one is sent');
  assert.match(String(h.fetchCalls[0][0]), /replay=after/);
  assert.deepEqual({ ...h.fetchCalls[0][1].headers }, { 'x-b': '1' });
});
