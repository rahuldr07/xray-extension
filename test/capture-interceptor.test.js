// content/interceptor.js: capture config, WebSocket/SSE, GraphQL, timing, mock rules, replay.

const assert = require('node:assert/strict');
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
  assert.match(interceptor, /if \(!_config\.captureFetch\) return _origFetch/);
  assert.match(interceptor, /if \(!_config\.captureXhr\) return _origXHRSend/);
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
