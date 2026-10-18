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
  assert.match(persistence, /settings:\s*state\.settings/);
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

test('content continues indexing when a ready worker reports degraded optional cache health', async () => {
  let listener;
  const added = [];
  const fixture = await relayContent({ delivery: 'no-consumer' }, null, {
    init: async () => {}, isReady: () => true,
    onHealth(callback) { listener = callback; },
    async addEntry(entry) { added.push(entry.id); },
  });
  listener({ state: 'degraded', cache: { state: 'degraded', lastErrorCode: 'cache-write-failed' } });
  await fixture.dispatch({ __xray_capture__: true, token: 'token', entry: { id: 'after-cache-failure', type: 'log' } });
  assert.ok(added.includes('after-cache-failure'), 'optional cache health must not turn off in-memory indexing');
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
function interceptorHarness({ fetchImpl, streams = false } = {}) {
  const listeners = {};
  const posted = [];
  const timers = [];
  let now = 0;
  const fakeSetTimeout = (fn, ms = 0) => { const t = { fn, at: now + ms, cleared: false }; timers.push(t); return t; };
  const fakeClearTimeout = (t) => { if (t) t.cleared = true; };
  const fetchCalls = [];
  const window = {
    addEventListener(type, listener) { (listeners[type] ||= []).push(listener); },
    postMessage(message) { posted.push(message); },
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
    constructor() { this._l = {}; this.readyState = 0; }
    open(...a) { xhrCalls.open.push(a); this.readyState = 1; }
    send(...a) { xhrCalls.send.push(a); }
    setRequestHeader() {}
    addEventListener(type, fn) { (this._l[type] ||= []).push(fn); }
    dispatchEvent() { return true; }
    getAllResponseHeaders() { return ''; }
  }
  class FakeProgressEvent { constructor(type) { this.type = type; } }
  const context = {
    window, console, Date: { now: () => now }, Math, JSON, Object, Array, Set, Map, String, Number, Promise, Error, TypeError, RegExp,
    URL, Request, Response, Headers, TextEncoder, XMLHttpRequest: FakeXHR, Event: FakeProgressEvent, ProgressEvent: FakeProgressEvent,
    Blob, ArrayBuffer, setTimeout: fakeSetTimeout, clearTimeout: fakeClearTimeout,
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
  const captures = () => posted.filter(m => m.__xray_capture__ && !m.update);
  const settle = () => new Promise(resolve => setImmediate(resolve));
  const pendingTimers = () => timers.filter(t => !t.cleared).length;
  return { window, posted, FakeXHR, xhrCalls, fetchCalls, advance, sendConfig, captures, settle, pendingTimers };
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
