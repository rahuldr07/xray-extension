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
const CB = await import('../../src/panel/models/capturedBody.ts');
const LV = await import('../../src/panel/models/logValue.ts');
const { entryRequest } = await import('../../src/panel/utils.ts');
const { printJson, fromValue } = await import('../../src/panel/models/jsonText.ts');

// What chrome.storage.local keeps of a value: its JSON (the quota counts the stringification).
const stored = (value) => JSON.parse(JSON.stringify(value));
// …and it gives objects back with their keys sorted (the real extension shows it: a saved
// {"$xray":"map","size":2,"entries":…} reads back as {"$xray":…,"entries":…,"size":2}).
const chromeStorage = (value) => JSON.parse(JSON.stringify(value, (key, item) => (item && typeof item === 'object' && !Array.isArray(item)
  ? Object.fromEntries(Object.keys(item).sort().map((name) => [name, item[name]])) : item)));
// Save, keep as chrome.storage keeps it, restore: what the panel holds after a reload.
const save = (entries, options) => deserializeSessionEntries(chromeStorage(serializeSessionEntries(entries, options)));
// Since fix round 1 the budget counts every saved field, so byte-exact budget tests use bare
// entries: what an entry costs besides its bodies is the JSON of its other fields.
const bare = (id, fields = {}) => ({ id, type: 'api', ...fields });
const fixedBytes = (fields) => JSON.stringify(fields).length;

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
  for (const tab of ['console', 'api', 'logs', 'rules', 'insights', 'sql']) {
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
  assert.equal(patch.settings.theme, 'xray-dark');
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

// ------------------------------------------------- sessionStore: J9 bodies

test('J9 body text over the per-slot cap is cut with metadata, never an in-band "…"', () => {
  assert.equal(SS.MAX_PERSISTED_TEXT_CHARS, 250_000, 'a slot keeps up to the response capture cap');
  const huge = 'x'.repeat(300_000);
  const [saved] = serializeSessionEntries([apiEntry({
    responseRaw: huge, responseDecrypted: huge, requestBodyKind: 'text', requestBodyText: 'q'.repeat(60_000), requestBody: 'q'.repeat(60_000),
  })]);
  assert.equal(saved.responseRaw, huge.slice(0, 250_000));
  assert.deepEqual(saved.responseTruncated, { totalChars: 300_000, keptChars: 250_000 });
  assert.equal(saved.responseDecrypted, huge.slice(0, 250_000));
  assert.deepEqual(saved.responseDecryptedTruncated, { totalChars: 300_000, keptChars: 250_000 });
  assert.equal(saved.requestBodyText.length, 60_000, 'request text under the cap is kept whole');
  assert.equal(saved.requestTruncated, undefined);
  for (const field of ['responseRaw', 'responseDecrypted', 'requestBodyText']) {
    assert.ok(!saved[field].endsWith('…'), `${field} carries no in-band marker`);
  }
  assert.equal('requestBody' in saved, false, 'a text body is its text: no parsed copy beside it (final fix M1)');
  // The body model reads the cut back as a banner, not as a different body.
  const body = CB.responseBody(stored(saved));
  assert.equal(CB.truncationNotice(body), 'Response truncated: showing the first 250,000 of 300,000 characters');
  assert.equal(body.decrypted, true, 'the decrypted text is what the response facet shows');
});

test('J9 a 32,300-char JSON body persists whole and re-parses after a reload (Tree and Table work)', () => {
  const rows = [];
  let text = '';
  for (let i = 0; text.length < 32_300; i++) {
    rows.push(`{"z":${i},"id":9007199254740993,"a":"row-${i}"}`);
    text = `{"zeta":1,"data":[${rows.join(',')}],"alpha":2}`;
  }
  const [saved] = stored(serializeSessionEntries([apiEntry({ responseRaw: text })]));
  const [restored] = deserializeSessionEntries([saved]);
  assert.equal(restored.responseRaw, text, 'the captured text, every character');
  assert.equal(restored.responseTruncated, undefined);
  const doc = CB.bodyDoc(CB.responseBody(restored));
  assert.ok(doc && doc.ok, 'the restored text parses');
  assert.deepEqual(doc.root.entries.map((member) => member.key), ['zeta', 'data', 'alpha'], 'keys in source order');
  const first = doc.root.entries[1].value.items[0];
  assert.deepEqual(first.entries.map((member) => member.key), ['z', 'id', 'a']);
  assert.equal(first.entries[1].value.raw, '9007199254740993', 'the integer past 2^53 keeps its digits');
});

test('J9 keptChars always matches the saved text, and the capture-time total is kept', () => {
  const text = 'y'.repeat(250_000);
  const fixed = fixedBytes({ id: 'k', type: 'api' });
  for (const captured of [{ totalChars: 938_891, keptChars: 250_000 }, { totalBytes: 2_000_000, keptChars: 250_000 }]) {
    const [saved] = serializeSessionEntries([bare('k', { responseRaw: text, responseTruncated: captured })], { budgetBytes: 100_000 + fixed });
    assert.equal(saved.responseRaw.length, 100_000);
    assert.deepEqual(saved.responseTruncated, { ...captured, keptChars: 100_000 });
  }
  const requestText = 'q'.repeat(30_000);
  const [request] = serializeSessionEntries([bare('k', { requestBodyText: requestText, requestTruncated: { totalChars: 900_000, keptChars: 30_000 } })], { budgetBytes: 20_000 + fixed });
  assert.equal(request.requestBodyText, requestText.slice(0, 20_000));
  assert.deepEqual(request.requestTruncated, { totalChars: 900_000, keptChars: 20_000 });

  const pair = 'a'.repeat(19_999) + '\u{1F600}' + 'b'.repeat(10);
  const [split] = serializeSessionEntries([bare('k', { requestBodyText: pair })], { budgetBytes: 20_001 + fixed });
  assert.equal(split.requestBodyText, 'a'.repeat(19_999), 'the cut never splits a surrogate pair');
  assert.deepEqual(split.requestTruncated, { totalChars: pair.length, keptChars: 19_999 });

  const [kept] = serializeSessionEntries([apiEntry({ requestBodyText: 'null', requestTruncated: undefined })]);
  assert.equal(kept.requestBodyText, 'null');
  assert.equal(kept.requestTruncated, undefined);
});

test('J9 one budget for the session: the newest bodies stay whole, older ones are cut (to nothing at the end)', () => {
  assert.equal(SS.SESSION_BUDGET_BYTES, 6_000_000, 'fix round 1 ruling: 6,000,000 bytes, every saved field counted');
  const entries = Array.from({ length: 5 }, (_, i) => bare(`b${i}`, { responseRaw: String(i).repeat(40_000) }));
  const fixed = fixedBytes({ id: 'b0', type: 'api' });
  const saved = serializeSessionEntries(entries, { budgetBytes: 100_000, floorBytes: 0 });
  assert.deepEqual(saved.map((entry) => entry.id), ['b0', 'b1', 'b2', 'b3', 'b4'], 'entries keep their order');
  assert.equal(saved[4].responseRaw, '4'.repeat(40_000));
  assert.equal(saved[4].responseTruncated, undefined);
  assert.equal(saved[3].responseRaw.length, 40_000);
  // The third newest gets what is left once each entry's other fields are paid for.
  const left = 100_000 - 3 * fixed - 80_000;
  assert.equal(saved[2].responseRaw, '2'.repeat(left));
  assert.deepEqual(saved[2].responseTruncated, { totalChars: 40_000, keptChars: left });
  for (const old of [saved[0], saved[1]]) {
    assert.equal(old.responseRaw, '');
    assert.deepEqual(old.responseTruncated, { totalChars: 40_000, keptChars: 0 });
    assert.equal(CB.responseBody(old).kind, 'text', 'a body cut to nothing is still a truncated body, not "no body"');
    assert.match(CB.truncationNotice(CB.responseBody(old)), /showing the first 0 of 40,000 characters/);
  }
  // The real budget holds a 5.8 MB session without cutting anything.
  const real = serializeSessionEntries(Array.from({ length: 24 }, (_, i) => apiEntry({ id: `r${i}`, responseRaw: 'r'.repeat(240_000) })));
  assert.ok(real.every((entry) => entry.responseRaw.length === 240_000 && !entry.responseTruncated));
});

test('J9 past the budget every entry still keeps its first 2 KB, the smaller bodies first', () => {
  assert.equal(SS.ENTRY_FLOOR_BYTES, 2_048);
  const big = bare('big', { responseRaw: 'B'.repeat(50_000) });
  const small = bare('small', { method: 'POST', requestBodyKind: 'text', requestBodyText: '{"q":1}', requestBody: { q: 1 }, responseRaw: '{"tiny":true}' });
  const mixed = bare('mixed', { method: 'POST', requestBodyKind: 'binary', requestBody: { binary: true, size: 3, base64Prefix: 'AAEC' }, responseRaw: 'M'.repeat(10_000) });
  const saved = serializeSessionEntries([small, mixed, big], { budgetBytes: 50_000 + fixedBytes({ id: 'big', type: 'api' }) });
  assert.equal(saved[2].responseRaw.length, 50_000, 'the newest entry spends the budget');
  assert.equal(saved[0].responseRaw, '{"tiny":true}', 'a small body is whole past the budget');
  assert.equal(saved[0].requestBodyText, '{"q":1}');
  assert.equal('requestBody' in saved[0], false, 'a text body is its text (final fix M1)');
  assert.deepEqual(saved[1].requestBody, { binary: true, size: 3, base64Prefix: 'AAEC' }, 'the small body goes first');
  assert.ok(saved[1].responseRaw.length > 1_900 && saved[1].responseRaw.length < 2_048, 'the large one gets what is left of 2 KB');
  assert.deepEqual(saved[1].responseTruncated, { totalChars: 10_000, keptChars: saved[1].responseRaw.length });
});

test('J9 the budget counts what storage keeps: JSON escapes and UTF-8 bytes', () => {
  assert.equal(SS.storedTextBytes('plain'), 5);
  // " \ \n → two bytes each; U+0001 → \u0001; é → 2 bytes; € → 3; 😀 → 4; a lone surrogate → \ud800.
  assert.equal(SS.storedTextBytes('a"\\\n\u0001é€😀\ud800'), 1 + 2 + 2 + 2 + 6 + 2 + 3 + 4 + 6);
  const cjk = '漢'.repeat(10_000);
  const [saved] = serializeSessionEntries([bare('c', { responseRaw: cjk })], { budgetBytes: 15_000 + fixedBytes({ id: 'c', type: 'api' }) });
  assert.equal(saved.responseRaw.length, 5_000, 'three bytes a character');
  assert.deepEqual(saved.responseTruncated, { totalChars: 10_000, keptChars: 5_000 });
});

test('J9 typed arrays and other non-JSON values are never saved', () => {
  const bytes = new Uint8Array([123, 34, 97, 34, 58, 49, 125]);
  const entry = apiEntry({
    requestBody: bytes,
    responseDecrypted: new ArrayBuffer(4),
    args: [new Int16Array([1, 2]), 10n],
    wsFrames: [{ dir: 'in', ts: 1, preview: 'hi', size: 2, raw: new DataView(new ArrayBuffer(2)) }],
    extra: { nested: [new Float64Array([1.5])], when: new Date(0), never: new Date(NaN), big: 10n, nan: NaN, inf: -Infinity, negz: -0,
      undef: undefined, fn() {}, sym: Symbol('s'), map: new Map([['k', 1]]), set: new Set([1]) },
  });
  const [saved] = serializeSessionEntries([entry]);
  const offenders = [];
  (function walk(value, path) {
    if (typeof value === 'bigint' || typeof value === 'function' || typeof value === 'symbol' || value === undefined) offenders.push(path);
    else if (typeof value === 'number' && (!Number.isFinite(value) || Object.is(value, -0))) offenders.push(path);
    else if (value && typeof value === 'object') {
      if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer || value instanceof Map || value instanceof Set || value instanceof Date) offenders.push(path);
      else for (const key of Object.keys(value)) walk(value[key], `${path}.${key}`);
    }
  })(saved, 'entry');
  assert.deepEqual(offenders, [], 'only JSON values are left');
  assert.deepEqual(stored(saved), saved, 'and they survive the storage round trip unchanged');
  assert.deepEqual(saved.requestBody, { binary: true, size: 7, base64Prefix: 'eyJhIjoxfQ==' }, 'bytes are described, as capture describes them');
  assert.deepEqual(saved.responseDecrypted, { binary: true, size: 4, base64Prefix: 'AAAAAA==' });
  assert.deepEqual(saved.args, [{ binary: true, size: 4, base64Prefix: 'AQACAA==' }, '10']);
  assert.deepEqual(saved.wsFrames, [{ dir: 'in', ts: 1, preview: 'hi', size: 2, raw: { binary: true, size: 2, base64Prefix: 'AAA=' } }]);
  assert.deepEqual(saved.extra, { nested: [{ binary: true, size: 8, base64Prefix: 'AAAAAAAA+D8=' }], when: '1970-01-01T00:00:00.000Z', never: null,
    big: '10', nan: null, inf: null, negz: 0, map: {}, set: {} });
});

test('J9 a typed log keeps its non-JSON values as envelopes: no NaN, BigInt or -0 is lost on the way to storage', () => {
  const [saved] = save([logEntry({ message: undefined, logArgCount: 1,
    logData: { n: NaN, i: -Infinity, z: -0, b: 10n, u: undefined, t: new Uint8Array([1, 2]), d: new Date(0), m: new Map([['k', 1n]]) } })]);
  assert.deepEqual(saved.logData, {
    n: { $xray: 'number', value: 'NaN' }, i: { $xray: 'number', value: '-Infinity' }, z: { $xray: 'number', value: '-0' },
    b: { $xray: 'bigint', value: '10' }, u: { $xray: 'undefined' },
    t: { $xray: 'typedarray', type: 'Uint8Array', length: 2, values: [1, 2] },
    d: { $xray: 'date', iso: '1970-01-01T00:00:00.000Z' },
    m: { $xray: 'map', size: 1, entries: [['k', { $xray: 'bigint', value: '1' }]] },
  });
  assert.equal(LV.logArgsText(LV.logArgs(saved)), '{"n":NaN,"i":-Infinity,"z":-0,"b":10n,"u":undefined,"t":Uint8Array(2) [1,2],"d":1970-01-01T00:00:00.000Z,"m":Map(1) {"k" => 1n}}');
});

test('J9 chrome.storage sorts object keys: a saved log keeps its keys in the order logged', () => {
  const logData = [{ b: 1, a: 2, nested: { z: 1, y: [{ d: 1, c: 2 }] }, __proto__x: 0 }, { $xray: 'map', size: 1, entries: [['k', { y: 1, x: 2 }]] }];
  const [restored] = save([logEntry({ message: undefined, logArgCount: 2, logData })]);
  assert.deepEqual(Object.keys(restored.logData[0]), ['b', 'a', 'nested', '__proto__x']);
  assert.deepEqual(Object.keys(restored.logData[0].nested), ['z', 'y']);
  assert.equal(LV.logArgsText(LV.logArgs(restored)), '{"b":1,"a":2,"nested":{"z":1,"y":[{"d":1,"c":2}]},"__proto__x":0} Map(1) {"k" => {"y":1,"x":2}}');
  // Integers past 2^53 that JavaScript holds as doubles come back as the same numbers, never wrapped.
  const [numbers] = save([logEntry({ message: undefined, logArgCount: 1, logData: { big: 2 ** 60, e: 1e21, small: 0.1 } })]);
  assert.deepEqual(numbers.logData, { big: 2 ** 60, e: 1e21, small: 0.1 });
  assert.equal(typeof numbers.logData.big, 'number');
  // An own "__proto__" key stays a key.
  const own = JSON.parse('{"__proto__":{"polluted":true},"k":1}');
  const [proto] = save([logEntry({ message: undefined, logArgCount: 1, logData: own })]);
  assert.ok(Object.prototype.hasOwnProperty.call(proto.logData, '__proto__'));
  assert.equal(Object.getPrototypeOf(proto.logData), Object.prototype);
  assert.equal({}.polluted, undefined);
});

test('J9 a typed log over the bound is cut with envelopes, never turned into a JSON-prefix string', () => {
  const huge = 'z'.repeat(100_000);
  const [single] = save([logEntry({ message: undefined, logArgCount: 1, logData: huge })]);
  assert.equal(single.logArgCount, 1);
  assert.deepEqual(single.logData, { $xray: 'string', value: 'z'.repeat(20_000), length: 100_000 });
  assert.equal(LV.logPayload(single).kind, 'value');

  const many = Array.from({ length: 30 }, (_, i) => String(i).padEnd(1_000, '.'));
  const [multi] = save([logEntry({ message: undefined, logArgCount: 30, logData: many })]);
  assert.equal(multi.logArgCount, 30);
  assert.deepEqual(multi.logData.slice(0, 20), many.slice(0, 20), 'arguments within the bound are kept whole');
  assert.deepEqual(multi.logData[20], { $xray: 'string', value: '', length: 1_000 }, 'later ones say how long they were');

  const wide = Object.fromEntries(Array.from({ length: 50 }, (_, i) => [`k${i}`, 'v'.repeat(1_000)]));
  const [object] = save([logEntry({ message: undefined, logArgCount: 1, logData: wide })]);
  assert.equal(object.logData.$xray, 'object');
  assert.ok(object.logData.omitted > 0, 'the keys left out are counted');
  assert.ok(JSON.stringify(object.logData).length < 25_000);
  assert.match(LV.logValueText(object.logData), /^\{"k0":"v{1000}",/);

  // A log already within the bound is saved exactly as it is.
  const battery = [{ a: [1, 2, 3], b: { $xray: 'bigint', value: '9007199254740993' } }, { $xray: 'map', size: 3, entries: [['x', 1]] }];
  const [small] = save([logEntry({ message: undefined, logArgCount: 2, logData: battery })]);
  assert.deepEqual(small.logData, battery);
});

test('J9 a legacy log (no logArgCount) is saved in the typed model and reads the same', () => {
  const legacy = [
    logEntry({ logData: { a: 1, __xray_ref__: 'r1' } }),
    logEntry({ message: undefined, logData: [1, 'two', { three: 3 }] }),
    logEntry({ logData: { __type__: 'Error', name: 'TypeError', message: 'boom', stack: 'TypeError: boom' } }),
    logEntry({ message: undefined, logData: '[Function: load]' }),
    logEntry({ message: undefined, logData: { __type__: 'function', name: 'f' } }),
    logEntry({ message: undefined, args: ['x', 2], logData: undefined }),
  ];
  const saved = save(legacy);
  saved.forEach((entry, i) => {
    assert.ok(LV.isTypedLog(entry), `entry ${i} is in the typed model`);
    assert.equal(LV.logArgsText(LV.logArgs(entry)), LV.logArgsText(LV.logArgs(legacy[i])), `entry ${i} reads the same in the Console`);
    assert.equal(entry.args, undefined);
  });
  assert.doesNotMatch(JSON.stringify(serializeSessionEntries(legacy)), /__xray_ref__|__type__/, 'internal markers are not saved');
  assert.equal(LV.logErrorInfo(LV.logArgs(saved[2])[0]).name, 'TypeError');

  const cyclic = { name: 'loop' };
  cyclic.self = cyclic;
  const [loop] = save([logEntry({ logData: cyclic })]);
  assert.deepEqual(loop.logData, { name: 'loop', self: { $xray: 'circular' } }, 'a cycle is a marker, never a throw');

  const [big] = save([logEntry({ logData: { blob: 'y'.repeat(50_000) } })]);
  assert.equal(big.logArgCount, 1);
  assert.equal(big.logData.blob.$xray, 'string');
  assert.equal(big.logData.blob.length, 50_000);
  assert.ok(big.logData.blob.value.length < 50_000);
});

test('J9 request bodies: the parsed form goes when it does not fit, a pre-J4 value becomes cut text', () => {
  const text = JSON.stringify({ rows: Array.from({ length: 2_000 }, (_, i) => ({ i })) });
  const parsed = JSON.parse(text);
  // Every quote of this JSON text is stored escaped: two bytes, so 10,000 bytes hold fewer characters.
  const [current] = serializeSessionEntries([apiEntry({ method: 'POST', requestBodyKind: 'text', requestBodyText: text, requestBody: parsed, responseRaw: null })], { budgetBytes: 10_000 });
  const keptText = current.requestBodyText.length;
  assert.ok(keptText > 6_000 && keptText < 10_000);
  assert.equal(current.requestBodyText, text.slice(0, keptText));
  assert.ok(SS.storedTextBytes(current.requestBodyText) <= 10_000);
  assert.deepEqual(current.requestTruncated, { totalChars: text.length, keptChars: keptText });
  assert.equal(current.requestBody, undefined, 'the parsed copy of a cut text is not saved');
  assert.match(CB.truncationNotice(CB.requestBody(current)), /^Request truncated: showing the first [\d,]+ of /);

  const [old] = serializeSessionEntries([apiEntry({ method: 'POST', requestBody: parsed, responseRaw: null })], { budgetBytes: 10_000 });
  assert.equal(old.requestBodyText, undefined);
  const keptValue = old.requestBody.length;
  assert.ok(keptValue > 6_000 && keptValue < 10_000);
  assert.equal(old.requestBody, text.slice(0, keptValue), 'the value as JSON text, cut');
  assert.deepEqual(old.requestTruncated, { totalChars: text.length, keptChars: keptValue });
  const body = CB.requestBody(stored(old));
  assert.equal(body.kind, 'text');
  assert.match(CB.truncationNotice(body), /^Request truncated: showing the first [\d,]+ of /);

  const [whole] = serializeSessionEntries([apiEntry({ method: 'POST', requestBodyKind: 'text', requestBodyText: text, requestBody: parsed })]);
  assert.equal('requestBody' in whole, false, 'a text body is its text, even within the budget (final fix M1)');
  const [form] = serializeSessionEntries([apiEntry({ method: 'POST', requestBodyKind: 'formdata', requestBodyText: 'a=1', requestBody: [['a', '1']] })]);
  assert.deepEqual(form.requestBody, [['a', '1']], 'within the budget FormData fields are kept beside their text');
});

test('J9 saving a restored session changes nothing (the saved form is stable)', () => {
  const mixed = [
    apiEntry({ id: 'm0', responseRaw: 'a'.repeat(30_000), responseTruncated: { totalChars: 900_000, keptChars: 30_000 } }),
    apiEntry({ id: 'm1', method: 'POST', requestBody: { big: 'b'.repeat(20_000) } }),
    apiEntry({ id: 'm2', requestBody: new Uint8Array([1, 2, 3]), responseDecrypted: { plain: 'c'.repeat(5_000) } }),
    logEntry({ id: 'm3', logData: { legacy: 'd'.repeat(30_000), __xray_ref__: 'r' } }),
    logEntry({ id: 'm4', message: undefined, logArgCount: 2, logData: ['e'.repeat(25_000), { n: NaN }] }),
    apiEntry({ id: 'm5', responseRaw: '{"f":"' + 'f'.repeat(40_000) + '"}', wsFrames: [{ dir: 'in', ts: 1, preview: 'g', size: 1 }] }),
  ];
  for (const budgetBytes of [1_000, 60_000, 150_000, undefined]) {
    const once = chromeStorage(serializeSessionEntries(mixed, { budgetBytes }));
    const twice = chromeStorage(serializeSessionEntries(once, { budgetBytes }));
    assert.deepEqual(twice, once, `budget ${budgetBytes}`);
    const restored = chromeStorage(serializeSessionEntries(deserializeSessionEntries(once), { budgetBytes }));
    assert.deepEqual(restored, once, `budget ${budgetBytes}: restore, then save`);
  }
});

// ------------------------------------------------- fix round 1 (review)

test('Fix 1: the budget counts every saved field — headers, the log message and frames, not only bodies', () => {
  const headers = { 'x-big': 'h'.repeat(60_000) };
  const saved = serializeSessionEntries([bare('o', { requestHeaders: headers, responseRaw: 'o'.repeat(30_000) }),
    bare('n', { requestHeaders: headers, responseRaw: 'n'.repeat(30_000) })], { budgetBytes: 100_000, floorBytes: 0 });
  assert.equal(saved[1].responseRaw.length, 30_000, 'the newest entry: its headers and its body fit');
  assert.equal(saved[0].requestHeaders['x-big'].length, 60_000, 'headers are never cut…');
  assert.equal(saved[0].responseRaw, '', '…but they count: no room is left for the older body');
  assert.deepEqual(saved[0].responseTruncated, { totalChars: 30_000, keptChars: 0 });

  const log = { id: 'm', type: 'log', message: 'm'.repeat(19_000), logArgCount: 1, logData: 'x' };
  const afterLog = serializeSessionEntries([bare('a', { responseRaw: 'a'.repeat(5_000) }), log], { budgetBytes: 21_000, floorBytes: 0 });
  assert.ok(afterLog[0].responseRaw.length < 2_000, 'a log message counts too');
  assert.equal(afterLog[1].message.length, 19_000);

  const frames = Array.from({ length: 50 }, (_, i) => ({ dir: 'in', ts: i, preview: 'f'.repeat(2_000), size: 2_000 }));
  const [ws] = serializeSessionEntries([bare('w', { source: 'ws', wsFrames: frames })], { budgetBytes: 20_000, floorBytes: 0 });
  assert.ok(ws.wsFrames.length > 5 && ws.wsFrames.length < 10, `frames are cut to the budget (${ws.wsFrames.length} kept)`);
  assert.deepEqual(ws.wsFrames.map((frame) => frame.ts), frames.slice(-ws.wsFrames.length).map((frame) => frame.ts), 'the newest frames stay');
  const [allFrames] = serializeSessionEntries([bare('w', { source: 'ws', wsFrames: frames })]);
  assert.equal(allFrames.wsFrames.length, 50);
});

test('Final fix M1: only FormData fields and binary descriptors are saved beside the request text; a text body is its text', () => {
  const json = bare('j', { method: 'POST', requestHeaders: { 'content-type': 'application/json' }, requestBodyKind: 'text', requestBodyText: '{"q":1,"id":9007199254740993}', requestBody: { q: 1, id: 9007199254740992 } });
  const urlenc = bare('u', { method: 'POST', requestBodyKind: 'urlencoded', requestBodyText: 'a=1&b=2', requestBody: 'a=1&b=2' });
  const literal = bare('n', { method: 'POST', requestBodyKind: 'text', requestBodyText: 'null', requestBody: null });
  const form = bare('f', { method: 'POST', requestBodyKind: 'formdata', requestBodyText: 'a=1', requestBody: [['a', '1']] });
  const binary = bare('b', { method: 'POST', requestBodyKind: 'binary', requestBody: { binary: true, size: 3, base64Prefix: 'AAEC' } });
  const [j, u, n, f, b] = serializeSessionEntries([json, urlenc, literal, form, binary]);
  for (const saved of [j, u, n]) assert.equal('requestBody' in saved, false, `${saved.id}: the text is the body; no parsed copy is saved beside it`);
  assert.equal(j.requestBodyText, '{"q":1,"id":9007199254740993}');
  assert.deepEqual(f.requestBody, [['a', '1']], 'FormData fields are kept');
  assert.deepEqual(b.requestBody, { binary: true, size: 3, base64Prefix: 'AAEC' }, 'a binary descriptor is kept');
  // Restored, the views and the console read the body from the text, as they do for a live entry.
  const [rj, , rn] = save([json, urlenc, literal]);
  assert.equal(printJson(fromValue(entryRequest(rj))), '{"q":1,"id":9007199254740993}');
  assert.equal(CB.requestBody(rn).kind, 'text');
  assert.equal(CB.requestBody(rn).text, 'null', 'a JSON null body is still a body');
  // A session saved before this fix still carries the copy: it loads as it was, and the next save drops it.
  const [old] = deserializeSessionEntries(chromeStorage([{ ...json, schemaVersion: undefined }]).map((entry) => ({ ...entry })));
  assert.deepEqual(old.requestBody, { id: 9007199254740992, q: 1 }, 'restored as stored');
  assert.equal(printJson(fromValue(entryRequest(old))), '{"q":1,"id":9007199254740993}', 'and read from its text');
  assert.equal('requestBody' in serializeSessionEntries([old])[0], false);
});

test('Fix 1: a value and the parsed request copy are charged in bytes, not characters', () => {
  const cjk = { t: '漢'.repeat(3_000) };
  const valueFixed = fixedBytes({ id: 'v', type: 'api' });
  const [value] = serializeSessionEntries([bare('v', { requestBody: cjk })], { budgetBytes: 5_000 + valueFixed, floorBytes: 0 });
  assert.equal(typeof value.requestBody, 'string', '3,010 characters but 9,010 bytes: it does not fit, so it is saved as cut JSON text');
  assert.ok(SS.storedTextBytes(value.requestBody) <= 5_000);
  assert.deepEqual(value.requestTruncated, { totalChars: JSON.stringify(cjk).length, keptChars: value.requestBody.length });
  // FormData fields are the one copy saved beside a request text (final fix M1), charged the same way.
  const derivedFixed = fixedBytes({ id: 'd', type: 'api', requestBodyKind: 'formdata' });
  const pairs = [['t', cjk.t]];
  const [derived] = serializeSessionEntries([bare('d', { requestBodyKind: 'formdata', requestBodyText: 'a', requestBody: pairs })], { budgetBytes: 5_000 + derivedFixed, floorBytes: 0 });
  assert.equal(derived.requestBodyText, 'a');
  assert.equal(derived.requestBody, undefined, '3,010 characters but 9,010 bytes: the fields do not fit, so they are not saved');
  const [fits] = serializeSessionEntries([bare('d', { requestBodyKind: 'formdata', requestBodyText: 'a', requestBody: pairs })], { budgetBytes: 10_000 + derivedFixed, floorBytes: 0 });
  assert.deepEqual(fits.requestBody, pairs, 'with the bytes to spare they are');
});

test('Fix 1: a log that does not fit keeps a skeleton within its allowance, at least a depth envelope, and charges what it writes', () => {
  const args = Array.from({ length: 500 }, () => 'a'.repeat(100));
  const [skeleton] = serializeSessionEntries([{ id: 'l', type: 'log', logArgCount: 500, logData: args }], { budgetBytes: 0, floorBytes: 100 });
  assert.ok(SS.storedTextBytes(skeleton.logDataJson) <= 100, `never more than its allowance (${SS.storedTextBytes(skeleton.logDataJson)} bytes)`);
  const [restored] = deserializeSessionEntries([skeleton]);
  assert.deepEqual([restored.logData, restored.logArgCount], [{ $xray: 'depth' }, 1]);
  assert.equal(LV.logArgsText(LV.logArgs(restored)), '…');
  // The skeleton when it fits: every argument, each string's length, no characters.
  const [lengths] = save([{ id: 'l', type: 'log', logArgCount: 3, logData: ['x'.repeat(5_000), { a: 'y'.repeat(5_000) }, 7] }], { budgetBytes: 0, floorBytes: 120 });
  assert.deepEqual(lengths.logData, [{ $xray: 'string', value: '', length: 5_000 }, { $xray: 'depth', type: 'object' }, 7]);
  assert.equal(lengths.logArgCount, 3);
  // What a log writes is what it is charged: the session after it gets the rest.
  const charged = serializeSessionEntries([bare('after', { responseRaw: 'r'.repeat(10_000) }), { id: 'l', type: 'log', logArgCount: 1, logData: 'z'.repeat(3_000) }], { budgetBytes: 8_000, floorBytes: 0 });
  const logCost = fixedBytes({ id: 'l', type: 'log' }) + SS.storedTextBytes(charged[1].logDataJson);
  assert.equal(charged[0].responseRaw.length, 8_000 - logCost - fixedBytes({ id: 'after', type: 'api' }));
});

// ------------------------------------------------- fix round 2 (clarified ruling)

test('Fix 2: a legacy-flagged entry is never cut; new entries share the budget it leaves, never below the floor', () => {
  const legacy = bare('old', { legacySession: true, responseRaw: 'L'.repeat(70_000), requestBodyText: 'q'.repeat(30_000), requestBody: 'q'.repeat(30_000) });
  const legacyLog = { id: 'old-log', type: 'log', legacySession: true, logData: { blob: 'b'.repeat(30_000) } };
  const fresh = bare('new', { responseRaw: 'N'.repeat(40_000) });
  const saved = serializeSessionEntries([legacy, legacyLog, fresh], { budgetBytes: 60_000, floorBytes: 1_000 });
  assert.equal(saved[0].responseRaw.length, 70_000, 'legacy bodies are kept whole past the budget');
  assert.equal(saved[0].requestBodyText.length, 30_000);
  assert.equal('requestBody' in saved[0], false, 'the copy of its text is not saved (final fix M1: readers derive it from the text, which stays whole)');
  assert.equal(saved[0].legacySession, true, 'the flag is saved with the entry');
  const [log] = deserializeSessionEntries([saved[1]]);
  assert.equal(log.logData.blob, 'b'.repeat(30_000), 'a legacy log keeps what it held (content.js limits, not the save bound)');
  assert.equal(saved[2].responseRaw.length, 1_000, 'the legacy cost exceeds the budget: a new body falls to the floor');
  assert.deepEqual(saved[2].responseTruncated, { totalChars: 40_000, keptChars: 1_000 });
  // With room left after the legacy entries, new entries share it, newest first.
  const roomy = serializeSessionEntries([bare('small-old', { legacySession: true, responseRaw: 's'.repeat(10_000) }), fresh], { budgetBytes: 60_000, floorBytes: 0 });
  assert.equal(roomy[1].responseRaw.length, 40_000);
  const tight = serializeSessionEntries([bare('small-old', { legacySession: true, responseRaw: 's'.repeat(30_000) }), fresh], { budgetBytes: 60_000, floorBytes: 0 });
  const legacyCost = fixedBytes({ id: 'small-old', type: 'api', legacySession: true }) + 30_000;
  assert.equal(tight[1].responseRaw.length, 60_000 - legacyCost - fixedBytes({ id: 'new', type: 'api' }), 'budget minus the legacy cost');
});

test('J9 a log message is display text: still cut with an ellipsis', () => {
  const [saved] = serializeSessionEntries([logEntry({ message: 'm'.repeat(30_000) })]);
  assert.equal(saved.message, 'm'.repeat(20_000) + '…');
});

test('J9 hand-built and corrupted values never break a save or a restore', async () => {
  const { LosslessNumber } = await import('../../src/panel/models/jsonText.ts');
  const hostile = {};
  Object.defineProperty(hostile, 'bad', { enumerable: true, get() { throw new Error('unreadable'); } });
  hostile.ok = 1;
  let deep = { leaf: 1 };
  for (let i = 0; i < 300; i++) deep = { next: deep };
  const [saved] = serializeSessionEntries([apiEntry({ method: 'POST', requestBodyKind: 'text', requestBodyText: '{}', requestBody: deep, extra: hostile,
    big: new LosslessNumber('12345678901234567890'), small: new LosslessNumber('42'), wsFrames: 'not frames' })]);
  assert.deepEqual(saved.extra, { ok: 1 }, 'a property that throws when read is left out');
  assert.equal(saved.requestBody, undefined, 'a parsed copy too deep to walk is left out; the text is the body');
  assert.equal(saved.requestBodyText, '{}');
  assert.deepEqual([saved.big, saved.small], ['12345678901234567890', 42]);
  assert.equal(saved.wsFrames, 'not frames');
  // A legacy log the decoder cannot read is saved from its arguments through the bound.
  const [log] = save([logEntry({ message: undefined, logData: undefined, args: [hostile, 2] })]);
  assert.equal(log.logArgCount, 2);
  assert.deepEqual(log.logData, [{ bad: { $xray: 'unreadable' }, ok: 1 }, 2]);
  // A stored log text that does not parse restores without a value, never a throw.
  const [corrupt] = deserializeSessionEntries([{ id: 'c', type: 'log', logArgCount: 1, logDataJson: '{"broken":' }]);
  assert.equal(corrupt.logData, undefined);
  assert.equal(corrupt.logDataJson, undefined);
  assert.doesNotThrow(() => LV.logArgsText(LV.logArgs(corrupt)));
});

test('serializeSessionEntries never throws on a cyclic value', () => {
  const cyclic = { name: 'loop' };
  cyclic.self = cyclic;
  const [saved] = serializeSessionEntries([apiEntry({ requestBody: cyclic, responseRaw: null })]);
  assert.deepEqual(saved.requestBody, { name: 'loop' }, 'the reference back is left out, as JSON would have to');
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

test('sqlInlineInHud survives the stored round-trip and reads as off from preferences stored before it', () => {
  const on = applyPanelPreferences(JSON.parse(JSON.stringify({ settings: { sqlInlineInHud: true, themeRefreshPending: false } })));
  assert.equal(on.settings.sqlInlineInHud, true);
  const before = applyPanelPreferences({ settings: { theme: 'dracula', glow: true, themeRefreshPending: false } });
  assert.equal(before.settings.sqlInlineInHud, false);
});

test('sqlDatabasesInHud survives the stored round-trip and reads as off from preferences stored before it', () => {
  const on = applyPanelPreferences(JSON.parse(JSON.stringify({ settings: { sqlInlineInHud: true, sqlDatabasesInHud: true, themeRefreshPending: false } })));
  assert.equal(on.settings.sqlDatabasesInHud, true);
  const before = applyPanelPreferences({ settings: { sqlInlineInHud: true, themeRefreshPending: false } });
  assert.equal(before.settings.sqlDatabasesInHud, false);
});
