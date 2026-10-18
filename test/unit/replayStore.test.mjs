/* JSON fidelity Task 9 (spec J10, audit #5): Replay, Edit & Replay and experiment runs post the request
   text that was captured to the page — unchanged unless the user edited it — instead of re-serializing
   the parsed copy (which JSON.parse rounded and chrome.storage key-sorted). The page side (the
   interceptor sends that text as the fetch body) is in test/capture-interceptor.test.js; the editor in
   test/e2e/replay-exports.e2e.mjs. */
import test, { after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { apiEntry } from './harness.mjs';

const { usePanelStore } = await import('../../src/panel/store.ts');

const messages = [];
window.__XRAY_bridgeToken = 'token';
window.postMessage = (message) => { messages.push(JSON.parse(JSON.stringify(message))); };
window.XRAY_Store = { get: async () => undefined, set: async () => {} };

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

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortKeys(value[key])]));
  return value;
}

function captured(text, extra = {}) {
  let copy = text;
  try { copy = sortKeys(JSON.parse(text)); } catch { /* text that is not JSON stays text */ }
  return apiEntry({
    method: 'POST', url: 'https://api.test/echo', urlPath: '/echo',
    requestHeaders: { 'content-type': 'application/json' },
    requestBodyKind: text === null ? 'none' : 'text',
    ...(text === null ? {} : { requestBodyText: text }),
    requestBody: text === null ? null : copy,
    ...extra,
  });
}

const replays = () => messages.filter((message) => message.__xray_replay__).map((message) => message.request);
const state = () => usePanelStore.getState();

// A running experiment holds a timeout: cancel it so the next test (and the process) starts clean.
const cancelRuns = () => { for (const record of state().experiments) state().cancelExperiment(record.id); };
after(cancelRuns);

beforeEach(() => {
  cancelRuns();
  messages.length = 0;
  usePanelStore.setState(usePanelStore.getInitialState());
});

test('J10 Replay posts the captured request text for every fixture', () => {
  for (const [name, text] of Object.entries(REQUEST_TEXTS)) {
    assert.equal(state().replayEntry(captured(text)), null, name);
    assert.equal(replays().at(-1).body, text, `${name}: the text as captured`);
  }
  state().replayEntry(captured(null));
  assert.equal(replays().at(-1).body, null, 'no body');
});

test('J10 Edit & Replay posts the editor text exactly as typed', () => {
  const entry = captured('{"a":1}');
  state().replayEntry(entry, { requestBodyText: '{ "edited" : 9007199254740993 }' });
  assert.equal(replays().at(-1).body, '{ "edited" : 9007199254740993 }');
  state().replayEntry(entry, { requestBodyText: null });
  assert.equal(replays().at(-1).body, null, 'an emptied editor sends no body');
});

test('J10 a request body cut at capture is never replayed silently', () => {
  const entry = captured('{"a":"' + 'x'.repeat(100), { requestTruncated: { totalChars: 60_000, keptChars: 50_000 } });
  const reason = state().replayEntry(entry);
  assert.match(String(reason), /cut at capture/i);
  assert.equal(replays().length, 0, 'nothing posted');
  assert.match(String(state().toastMessage), /cut at capture/i);
  // Edit & Replay sends what the user put in the editor after seeing the warning.
  assert.equal(state().replayEntry(entry, { requestBodyText: '{"a":"short"}' }), null);
  assert.equal(replays().at(-1).body, '{"a":"short"}');
});

const SECRET_BODY = '{"b":1,"a":2,"id":9007199254740993,"password":"pw-secret"}';

function runDrafted(baseline, plan) {
  usePanelStore.setState({ entries: [baseline] });
  const id = state().draftExperiment(baseline, plan);
  assert.ok(id, `drafted: ${state().toastMessage}`);
  state().armExperiment(id);
  state().runExperiment(id);
  return id;
}

test('J10 an experiment run replays the captured request text', () => {
  const baseline = captured(SECRET_BODY, { id: 'baseline' });
  const id = runDrafted(baseline);
  assert.equal(state().experiments.find((record) => record.id === id).status, 'running');
  assert.equal(replays().at(-1).body, SECRET_BODY);
  assert.equal(replays().at(-1).replayOf, 'baseline');
  assert.doesNotMatch(JSON.stringify(state().experiments), /pw-secret/, 'the saved plan stays sanitized');
});

test('J10 a retargeted (cross-origin) experiment sends the sanitized body, its integer printed as written', () => {
  const baseline = captured(SECRET_BODY, { id: 'baseline' });
  runDrafted(baseline, { url: 'https://other.test/echo', retargetAcknowledged: true });
  assert.equal(replays().at(-1).url, 'https://other.test/echo');
  assert.equal(replays().at(-1).body, '{"b":1,"a":2,"id":9007199254740993,"password":"[REDACTED]"}');
});

test('J10 an experiment whose captured body cannot be sent as captured fails instead of sending it', () => {
  const baseline = captured('{"a":"' + 'x'.repeat(100), { id: 'baseline', requestTruncated: { totalChars: 60_000, keptChars: 50_000 } });
  const id = runDrafted(baseline);
  const record = state().experiments.find((item) => item.id === id);
  assert.equal(record.status, 'failed');
  assert.equal(record.errorCode, 'BODY_NOT_REPLAYABLE');
  assert.match(record.errorReason, /cannot be replayed exactly/i);
  assert.equal(replays().length, 0);
});

// Found in self-review: a plan body that is a JSON string (the double-encoded fixture, "hello") must not
// be decoded a second time — not when drafted, not when a scenario step or a saved plan passes it back.
test('J10 an experiment replays every request fixture as captured, a JSON string body included', () => {
  for (const [name, text] of Object.entries(REQUEST_TEXTS)) {
    cancelRuns();
    messages.length = 0;
    runDrafted(captured(text, { id: `baseline-${name}` }));
    assert.equal(replays().at(-1)?.body, text, name);
  }
});

test('J10 retargeted, a JSON scalar body is sent as its text (quotes kept), not decoded', () => {
  for (const text of [REQUEST_TEXTS.jsonstring, REQUEST_TEXTS.double, REQUEST_TEXTS.literalnull, REQUEST_TEXTS.literalfalse]) {
    cancelRuns();
    messages.length = 0;
    runDrafted(captured(text, { id: 'baseline' }), { url: 'https://other.test/echo', retargetAcknowledged: true });
    assert.equal(replays().at(-1)?.body, text, text);
  }
});

// An edited body is planned as its sanitized value, so a run re-prints it canonically: integers stay
// exact, 1.0 and 1E5 are normalised, and a JSON string is not decoded twice. An edit that only
// reformats the captured body plans the same value, so the run sends the captured text.
test('J10 an edited experiment body is sent re-printed from its planned value; a reformat-only edit sends the captured text', async () => {
  const { planValueOfText } = await import('../../src/panel/models/replayBody.ts');
  const cases = [
    ['"{\\"a\\":2}"', '"{\\"a\\":2}"'],
    ['{"b":1,"id":9007199254740993}', '{"b":1,"id":9007199254740993}'],
    ['false', 'false'],
    ['{ "b" : 1.0, "e": 1E5, "id": 9007199254740993 }', '{"b":1,"e":100000,"id":9007199254740993}'],
    ['{ "a" : 1 }', '{"a":1}'],
  ];
  for (const [typed, sent] of cases) {
    cancelRuns();
    messages.length = 0;
    runDrafted(captured('{"a":1, "pad": true}', { id: 'baseline' }), { body: planValueOfText(typed) });
    assert.equal(replays().at(-1)?.body, sent, typed);
  }
  cancelRuns();
  messages.length = 0;
  runDrafted(captured('{ "a": 1.0 }', { id: 'baseline' }), { body: planValueOfText('{\n  "a": 1\n}') });
  assert.equal(replays().at(-1)?.body, '{ "a": 1.0 }', 'reformatted only: the captured text, as captured');
});

test('J10 a scenario step planned from the entry replays the captured text', async () => {
  const { createScenario } = await import('../../src/panel/models/investigations.ts');
  for (const text of [REQUEST_TEXTS.double, REQUEST_TEXTS.bigint, '{"b":1,"a":2,"password":"pw-secret"}']) {
    cancelRuns();
    messages.length = 0;
    const entry = captured(text, { id: 'step-baseline' });
    const step = createScenario({ scenarios: [], sourceSessionId: 'session' }, entry).steps[0];
    assert.doesNotMatch(JSON.stringify(step.plan), /pw-secret/, 'the saved step stays sanitized');
    // What runScenarioStep drafts: the step's (sanitized) plan, its URL restored when unchanged.
    runDrafted(entry, { ...step.plan, url: step.plan.preserveCapturedUrl ? entry.url : step.plan.url });
    assert.equal(replays().at(-1)?.body, text, text);
  }
});

// ---------------------------------------------------------------- FormData (fix round 1 ruling)

const TEXT_PAIRS = [['user', 'ada'], ['password', 'pw-secret'], ['user', 'second'], ['note', 'é = 1']];
function textForm(extra = {}) {
  return captured('user=ada\npassword=pw-secret\nuser=second\nnote=é = 1', {
    requestBodyKind: 'formdata', requestBody: TEXT_PAIRS.map((pair) => [...pair]),
    requestHeaders: { 'Content-Type': 'multipart/form-data; boundary=----captured', 'x-trace': '7' }, ...extra,
  });
}

test('Fix1 Replay of a FormData of text fields posts its fields, names, values and order kept', () => {
  assert.equal(state().replayEntry(textForm()), null);
  assert.deepEqual(replays().at(-1).body, { formdata: TEXT_PAIRS });
});

test('Fix1 a form with a file field is refused: the file was not captured', () => {
  const entry = textForm({ requestBody: [['user', 'ada'], ['avatar', { file: 'a.png', size: 4, type: 'image/png' }]] });
  assert.match(String(state().replayEntry(entry)), /files were not captured/);
  assert.equal(replays().length, 0);
});

test('Fix1 an edited body in place of a form is sent as text, without the multipart Content-Type', () => {
  state().replayEntry(textForm(), { requestHeaders: { 'Content-Type': 'multipart/form-data; boundary=----captured', 'x-trace': '7' }, requestBodyText: 'user=edited' });
  const sent = replays().at(-1);
  assert.equal(sent.body, 'user=edited');
  assert.deepEqual(sent.headers, { 'x-trace': '7' });
});

test('Fix1 an experiment run replays the captured form on its origin, and the sanitized fields when retargeted', () => {
  runDrafted(textForm({ id: 'form-baseline' }));
  assert.deepEqual(replays().at(-1)?.body, { formdata: TEXT_PAIRS }, 'same origin: the captured fields');
  assert.doesNotMatch(JSON.stringify(state().experiments), /pw-secret/, 'the saved plan redacts the sensitive field');
  cancelRuns();
  messages.length = 0;
  runDrafted(textForm({ id: 'form-baseline' }), { url: 'https://other.test/echo', retargetAcknowledged: true });
  assert.deepEqual(replays().at(-1)?.body, { formdata: [['user', 'ada'], ['password', '[REDACTED]'], ['user', 'second'], ['note', 'é = 1']] });
  cancelRuns();
  messages.length = 0;
  const id = runDrafted(textForm({ id: 'form-baseline', requestBody: [['user', 'ada'], ['avatar', { file: 'a.png', size: 4, type: 'image/png' }]] }));
  assert.equal(state().experiments.find((record) => record.id === id).errorCode, 'BODY_NOT_REPLAYABLE');
  assert.equal(replays().length, 0);
});
