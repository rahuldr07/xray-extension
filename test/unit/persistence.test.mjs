/* Behavioural tests for the persistence models: panelPersistence.ts,
   sessionStore.ts and sessionSummary.ts. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  panelPersistence as PP,
  sessionStore as SS,
  sessionSummary as SUM,
  panelSettings as PS,
  apiEntry,
  logEntry,
} from './harness.mjs';

const { REACT_PANEL_PREFERENCES_KEY, applyPanelPreferences, serializePanelPreferences } = PP;
const { AI_SETTINGS_KEY, SESSION_ENTRIES_KEY, deserializeSessionEntries, serializeSessionEntries } = SS;
const { buildSessionSummary } = SUM;

const fullState = () => ({
  activeTab: 'api',
  detailView: 'schema',
  detailTab: 'request',
  consoleMiniTab: 'output',
  networkFilter: 'errors',
  apiSearchQuery: 'orders',
  apiQuickFilter: 'slow',
  apiGroupingMode: 'flat',
  apiDetailOpen: true,
  apiDrawerPlacement: 'right',
  methodFilters: new Set(['GET', 'POST']),
  statusFilters: new Set(['4xx']),
  typeFilters: new Set(['fetch']),
  expandedGroups: new Set(['api:/a', 'api:/b']),
  collapsedSections: new Set(['insights']),
  sortField: 'duration',
  sortOrder: 'asc',
  recording: false,
  pinnedIds: new Set(['p1', 'p2']),
  snippets: [{ id: 's1', title: 'One', code: 'schema(res)' }],
  settings: PS.normalizePanelSettings({ maxEntries: 250 }),
});

// -------------------------------------------------------- panelPersistence

test('the storage keys are the wired constants', () => {
  assert.equal(REACT_PANEL_PREFERENCES_KEY, 'react_panel_preferences');
  assert.equal(SESSION_ENTRIES_KEY, 'session_entries');
  assert.equal(AI_SETTINGS_KEY, 'ai_settings');
});

test('serializePanelPreferences turns every Set into a JSON-safe array', () => {
  const serialized = serializePanelPreferences(fullState());
  assert.deepEqual(serialized.methodFilters, ['GET', 'POST']);
  assert.deepEqual(serialized.statusFilters, ['4xx']);
  assert.deepEqual(serialized.typeFilters, ['fetch']);
  assert.deepEqual(serialized.expandedGroups, ['api:/a', 'api:/b']);
  assert.deepEqual(serialized.collapsedSections, ['insights']);
  assert.deepEqual(serialized.pinnedIds, ['p1', 'p2']);
  // The whole thing must survive a real JSON round-trip (this is what goes to
  // chrome.storage).
  assert.deepEqual(JSON.parse(JSON.stringify(serialized)), serialized);
});

test('ROUND-TRIP serialize -> JSON -> apply restores the whole preference state', () => {
  const state = fullState();
  const restored = applyPanelPreferences(JSON.parse(JSON.stringify(serializePanelPreferences(state))));
  for (const key of Object.keys(state)) {
    if (state[key] instanceof Set) {
      assert.ok(restored[key] instanceof Set, `${key} should come back as a Set`);
      assert.deepEqual([...restored[key]].sort(), [...state[key]].sort(), `${key} contents`);
    } else {
      assert.deepEqual(restored[key], state[key], `${key}`);
    }
  }
});

test('applyPanelPreferences returns an empty patch for an empty blob', () => {
  assert.deepEqual(applyPanelPreferences({}), {});
});

test('applyPanelPreferences rejects an unknown activeTab but keeps the known ones', () => {
  for (const tab of ['console', 'api', 'logs', 'rules', 'insights']) {
    assert.equal(applyPanelPreferences({ activeTab: tab }).activeTab, tab);
  }
  for (const tab of ['settings', '', 'API', 42, null]) {
    assert.equal('activeTab' in applyPanelPreferences({ activeTab: tab }), false, `activeTab ${JSON.stringify(tab)} should be dropped`);
  }
});

test('applyPanelPreferences ignores non-array collections rather than crashing', () => {
  const patch = applyPanelPreferences({ pinnedIds: 'p1', methodFilters: { GET: true }, expandedGroups: null });
  assert.equal('pinnedIds' in patch, false);
  assert.equal('methodFilters' in patch, false);
  assert.equal('expandedGroups' in patch, false);
});

test('applyPanelPreferences distinguishes false from absent for the boolean fields', () => {
  assert.equal(applyPanelPreferences({ recording: false }).recording, false);
  assert.equal(applyPanelPreferences({ apiDetailOpen: false }).apiDetailOpen, false);
  assert.equal('recording' in applyPanelPreferences({ recording: 'no' }), false, 'only a real boolean is honoured');
  assert.equal(applyPanelPreferences({ apiSearchQuery: '' }).apiSearchQuery, '', 'an empty search string is a real value');
});

test('applyPanelPreferences normalizes the settings blob through the settings model', () => {
  const patch = applyPanelPreferences({ settings: { maxEntries: 99_999, theme: 'nonsense', bogus: 1 } });
  assert.equal(patch.settings.maxEntries, 5000);
  assert.equal(patch.settings.theme, 'operator');
  assert.equal('bogus' in patch.settings, false);
  assert.deepEqual(Object.keys(patch.settings).sort(), Object.keys(PS.DEFAULT_PANEL_SETTINGS).sort());
});

test('applyPanelPreferences sanitizes snippets: cap 30, id+code required, extra keys stripped', () => {
  const snippets = [
    { id: 's1', title: 'Keep', code: 'a', extra: 'dropped' },
    { id: 's2', code: 'b' },
    { id: 's3' },
    { code: 'no id' },
    null,
    ...Array.from({ length: 40 }, (_, i) => ({ id: `bulk${i}`, code: 'x' })),
  ];
  const patch = applyPanelPreferences({ snippets });
  assert.equal(patch.snippets.length, 30);
  assert.deepEqual(patch.snippets[0], { id: 's1', title: 'Keep', code: 'a' });
  assert.deepEqual(patch.snippets[1], { id: 's2', title: undefined, code: 'b' });
  assert.ok(!patch.snippets.some((snippet) => snippet.id === 's3'), 'a snippet with no code is dropped');
  assert.equal('snippets' in applyPanelPreferences({ snippets: 'nope' }), false);
  assert.deepEqual(applyPanelPreferences({ snippets: [] }).snippets, []);
});

// ------------------------------------------------------------ sessionStore

test('serializeSessionEntries keeps the newest 500 entries', () => {
  const all = Array.from({ length: 720 }, (_, i) => apiEntry({ id: `e${i}` }));
  const stored = serializeSessionEntries(all);
  assert.equal(stored.length, 500);
  assert.equal(stored[0].id, 'e220', 'the oldest 220 are dropped');
  assert.equal(stored[499].id, 'e719');
  assert.deepEqual(serializeSessionEntries([]), []);
});

test('serializeSessionEntries trims every heavy string field to 20_000 chars', () => {
  const huge = 'x'.repeat(50_000);
  const [stored] = serializeSessionEntries([apiEntry({
    responseRaw: huge, responseDecrypted: huge, requestBody: huge, logData: huge, message: huge,
  })]);
  for (const field of ['responseRaw', 'responseDecrypted', 'requestBody', 'logData', 'message']) {
    assert.equal(stored[field].length, 20_001, `${field} should be trimmed + an ellipsis`);
    assert.ok(stored[field].endsWith('…'), `${field} should be marked as truncated`);
  }
});

test('serializeSessionEntries measures structured values by their serialized length', () => {
  const small = { a: 1 };
  const big = { blob: 'y'.repeat(50_000) };
  const [stored] = serializeSessionEntries([apiEntry({ requestBody: small, logData: big, responseRaw: null })]);
  assert.deepEqual(stored.requestBody, small, 'a small object is kept structured');
  assert.equal(typeof stored.logData, 'string', 'a big object collapses to a truncated preview string');
  assert.equal(stored.logData.length, 20_001);
});

test('serializeSessionEntries drops an unserializable (cyclic) value instead of throwing', () => {
  const cyclic = { name: 'loop' };
  cyclic.self = cyclic;
  const [stored] = serializeSessionEntries([apiEntry({ logData: cyclic, responseRaw: null })]);
  assert.equal(stored.logData, undefined);
});

test('serializeSessionEntries caps args at 20 and ws frames at the newest 50', () => {
  const [stored] = serializeSessionEntries([apiEntry({
    args: Array.from({ length: 50 }, (_, i) => `arg${i}`),
    wsFrames: Array.from({ length: 120 }, (_, i) => ({ i })),
  })]);
  assert.equal(stored.args.length, 20);
  assert.equal(stored.args[0], 'arg0');
  assert.equal(stored.wsFrames.length, 50);
  assert.deepEqual(stored.wsFrames[0], { i: 70 }, 'the newest 50 frames are kept');

  const [few] = serializeSessionEntries([apiEntry({ wsFrames: [{ i: 1 }] })]);
  assert.equal(few.wsFrames.length, 1, 'a short frame log is untouched');
});

test('serializeSessionEntries does not mutate the entries it is given', () => {
  const huge = 'x'.repeat(50_000);
  const original = apiEntry({ responseRaw: huge, args: Array.from({ length: 50 }, (_, i) => i) });
  const snapshot = { responseRaw: original.responseRaw, argsLength: original.args.length };
  serializeSessionEntries([original]);
  assert.equal(original.responseRaw.length, snapshot.responseRaw.length);
  assert.equal(original.args.length, snapshot.argsLength);
});

test('serializeSessionEntries output is JSON-serializable (chrome.storage requires it)', () => {
  const cyclic = { name: 'loop' };
  cyclic.self = cyclic;
  const stored = serializeSessionEntries([
    apiEntry({ responseRaw: 'x'.repeat(50_000) }),
    apiEntry({ logData: cyclic, responseRaw: null }),
    logEntry({ args: [1, 'two', { three: 3 }] }),
  ]);
  assert.doesNotThrow(() => JSON.stringify(stored));
});

test('deserializeSessionEntries filters junk and keeps the newest 500', () => {
  assert.deepEqual(deserializeSessionEntries(null), []);
  assert.deepEqual(deserializeSessionEntries('nope'), []);
  assert.deepEqual(deserializeSessionEntries({}), []);
  assert.deepEqual(deserializeSessionEntries([null, 42, 'x', { noId: 1 }, { id: 7 }]), []);
  const valid = deserializeSessionEntries([{ id: 'a', type: 'api' }, { id: 'b', type: 'log' }, null]);
  assert.deepEqual(valid.map((entry) => entry.id), ['a', 'b']);
  assert.equal(deserializeSessionEntries(Array.from({ length: 700 }, (_, i) => ({ id: `e${i}` }))).length, 500);
});

test('ROUND-TRIP serializeSessionEntries -> JSON -> deserializeSessionEntries', () => {
  const all = [apiEntry({ responseRaw: '{"a":1}' }), logEntry({ message: 'hi' })];
  const restored = deserializeSessionEntries(JSON.parse(JSON.stringify(serializeSessionEntries(all))));
  assert.deepEqual(restored.map((entry) => entry.id), all.map((entry) => entry.id));
  assert.equal(restored[0].responseRaw, '{"a":1}');
  assert.equal(restored[1].message, 'hi');
});

// ---------------------------------------------------------- sessionSummary

test('buildSessionSummary splits API and log counts', () => {
  const all = [
    apiEntry({ status: 200, size: 100 }),
    apiEntry({ status: 404, size: 200 }),
    apiEntry({ status: 500, size: 0 }),
    logEntry(),
    logEntry(),
  ];
  assert.deepEqual(buildSessionSummary(all), { apiCount: 3, logCount: 2, errorCount: 2, totalBytes: 300 });
  assert.deepEqual(buildSessionSummary([]), { apiCount: 0, logCount: 0, errorCount: 0, totalBytes: 0 });
});

test('buildSessionSummary ignores non-numeric sizes', () => {
  const all = [apiEntry({ size: 'big' }), apiEntry({ size: null }), apiEntry({ size: 50 })];
  assert.equal(buildSessionSummary(all).totalBytes, 50);
});
