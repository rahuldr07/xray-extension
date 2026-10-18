/* The typed log model on the panel side (spec J7): text for Logs rows, Console messages
   and search; the display tree the JSON viewer renders; the plain projection for the
   inspector; legacy (pre-model) entries; Session JSON, import and persistence. */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { entries as entriesModel, exportModel, importModel, sessionIndex, sessionStore, uniqueId } from './harness.mjs';

const logValue = await import('../../src/panel/models/logValue.ts');
const { TreeBranch, TreeLeaf } = await import('../../src/panel/models/treeDisplay.ts');
const { usePanelStore } = await import('../../src/panel/store.ts');

const T = (kind, fields = {}) => ({ $xray: kind, ...fields });
// A log entry as console-capture.js + content.js deliver it.
const typed = (args, extra = {}) => ({
  id: uniqueId('log'), type: 'log', logLevel: 'log', timestamp: 1_700_000_000_000,
  logArgCount: args.length, logData: args.length === 1 ? args[0] : args, objectRefs: [], ...extra,
});
const text = (entry, limit) => logValue.logEntryText(entry, limit);

test('every typed kind has a distinct text: top-level and nested', () => {
  const cases = [
    [T('bigint', { value: '10' }), '10n'],
    [T('bigint', { value: '-1180591620717411303424' }), '-1180591620717411303424n'],
    [T('number', { value: 'NaN' }), 'NaN'],
    [T('number', { value: '-0' }), '-0'],
    [T('number', { value: 'Infinity' }), 'Infinity'],
    [T('number', { value: '-Infinity' }), '-Infinity'],
    [T('undefined'), 'undefined'],
    [null, 'null'],
    [T('function', { name: 'namedFn' }), 'ƒ namedFn()'],
    [T('function', { name: '' }), 'ƒ anonymous()'],
    [T('symbol', { description: 'desc' }), 'Symbol(desc)'],
    [T('date', { iso: null }), 'Invalid Date'],
    [T('date', { iso: '1970-01-01T00:00:00.000Z' }), '1970-01-01T00:00:00.000Z'],
    [T('dom', { text: '<div#app.main>' }), '<div#app.main>'],
    [T('circular'), '[Circular]'],
    [T('unreadable'), '[unreadable]'],
    [T('map', { size: 3, entries: [['k', { v: 1 }], ['n', 2]] }), 'Map(3) {"k" => {"v":1}, "n" => 2, …}'],
    [T('set', { size: 2, values: [1, 'two'] }), 'Set(2) {1, "two"}'],
    [T('error', { name: 'TypeError', message: 'boom', stack: 'TypeError: boom\n    at x' }), 'TypeError: boom'],
    [T('typedarray', { type: 'Uint8Array', length: 4, values: [1, 2, 3, 4] }), 'Uint8Array(4) [1,2,3,4]'],
    [T('typedarray', { type: 'ArrayBuffer', length: 8 }), 'ArrayBuffer(8)'],
    [T('array', { items: [0, 1], length: 15 }), '[0,1,…13 more]'],
    [T('object', { class: 'Point', entries: [['x', 1]] }), 'Point {"x":1}'],
    [T('object', { entries: [['a', 1]], omitted: 5 }), '{"a":1,…5 more}'],
    [T('object', { entries: [['$xray', 'bigint'], ['value', '1']] }), '{"$xray":"bigint","value":"1"}'],
    [T('depth', { type: 'object' }), '{…}'],
    [T('depth', { type: 'object', class: 'Point' }), 'Point {…}'],
    [T('depth', { type: 'array', length: 3 }), 'Array(3)'],
  ];
  for (const [value, expected] of cases) {
    assert.equal(logValue.logValueText(value), expected, JSON.stringify(value));
  }
  // Strings: as written at the top level, quoted when nested.
  assert.equal(logValue.logValueText('hi', { top: true }), 'hi');
  assert.equal(logValue.logValueText('hi'), '"hi"');
  assert.equal(logValue.logValueText(T('string', { value: 'abc', length: 900 }), { top: true }), 'abc…');
  assert.equal(logValue.logValueText(T('string', { value: 'abc', length: 900 })), '"abc…"');
  assert.equal(logValue.logValueText({ nested: { big: T('bigint', { value: '7' }), list: [T('undefined')] } }), '{"nested":{"big":7n,"list":[undefined]}}');
});

test('one array argument and three arguments read differently; null and undefined are words, never blank', () => {
  assert.equal(text(typed([[1, 2, 3]])), '[1,2,3]');
  assert.equal(text(typed([1, 2, 3])), '1 2 3');
  assert.equal(text(typed([null])), 'null');
  assert.equal(text(typed([T('undefined')])), 'undefined');
  assert.equal(text(typed([])), '');
  assert.equal(text(typed(['count', T('bigint', { value: '10' })])), 'count 10n');
  const key = (entry) => logValue.logRepeatKey(logValue.logArgs(entry));
  assert.notEqual(key(typed([[1, 2, 3]])), key(typed([1, 2, 3])));
  assert.notEqual(key(typed([null])), key(typed([T('undefined')])));
  assert.notEqual(key(typed(['1 2 3'])), key(typed([1, 2, 3])), 'a string that reads the same is still a different log');
  assert.equal(key(typed([{ a: 1 }])), key(typed([{ a: 1 }])), 'identical logs share a key');
});

test('the store builds Console messages and repeat keys from the typed model', () => {
  window.XRAY_Store = { set: async () => {}, get: async () => undefined };
  usePanelStore.setState({ ...usePanelStore.getInitialState(), recording: true, consoleEvents: [], entries: [] });
  usePanelStore.getState().addEntries([
    typed([[1, 2, 3]]), typed([1, 2, 3]), typed([null]), typed([T('undefined')]),
    typed([T('bigint', { value: '10' })]), typed([{ __type__: 'Error', message: 'fake' }]),
  ]);
  const events = usePanelStore.getState().consoleEvents;
  assert.deepEqual(events.map((event) => event.message), ['[1,2,3]', '1 2 3', 'null', 'undefined', '10n', '{"__type__":"Error","message":"fake"}']);
  assert.equal(new Set(events.map((event) => event.repeatKey)).size, 6, 'no two of these may merge as repeats');
  assert.deepEqual(events[0].args, [[1, 2, 3]], 'one argument: the array itself');
  assert.deepEqual(events[1].args, [1, 2, 3]);
});

test('a repeat key is only computed for small arguments; large ones fall back to the message', () => {
  const big = { list: Array.from({ length: 2000 }, (_, i) => i) };
  assert.equal(logValue.logRepeatKey([big]), undefined);
  assert.equal(typeof logValue.logRepeatKey([{ small: true }]), 'string');
  usePanelStore.setState({ ...usePanelStore.getInitialState(), recording: true, consoleEvents: [], entries: [] });
  usePanelStore.getState().addEntries([typed([big])]);
  const [event] = usePanelStore.getState().consoleEvents;
  assert.equal('repeatKey' in event, false);
});

test('a typed user object with __type__: "Error" is plain data: not an error, rendered as an object', () => {
  const fake = { __type__: 'Error', message: 'fake' };
  assert.equal(logValue.logErrorInfo(fake), null);
  assert.equal(logValue.logValueText(fake), '{"__type__":"Error","message":"fake"}');
  const display = logValue.logDisplay(fake);
  assert.ok(!(display instanceof TreeBranch) && !(display instanceof TreeLeaf), 'a plain object stays a plain object');
  assert.deepEqual(Object.keys(display), ['__type__', 'message']);
  // A real typed Error is one.
  const info = logValue.logErrorInfo(T('error', { name: 'Error', message: 'outer', stack: 'Error: outer\n    at a (x.js:1:1)', cause: T('error', { name: 'Error', message: 'inner' }) }));
  assert.deepEqual(info, { name: 'Error', message: 'outer', stack: 'Error: outer\n    at a (x.js:1:1)', cause: 'Error: inner' });
});

test('the display tree: typed scalars are leaves with their text; Map, Set, Error, truncated containers are labelled branches', () => {
  const leaf = logValue.logDisplay(T('bigint', { value: '10' }));
  assert.ok(leaf instanceof TreeLeaf);
  assert.equal(leaf.text, '10n');
  const map = logValue.logDisplay(T('map', { size: 3, entries: [['k', { v: 1 }], [{ o: 1 }, 2]] }));
  assert.ok(map instanceof TreeBranch);
  assert.equal(map.label, 'Map(3)');
  assert.equal(map.count, 3);
  assert.deepEqual(map.children.map((child) => child.label), ['"k" =>', '{"o":1} =>', '']);
  assert.equal(map.children[2].value.text, '… 1 more');
  const error = logValue.logDisplay(T('error', { name: 'TypeError', message: 'boom', stack: 'TypeError: boom', cause: T('error', { name: 'Error', message: 'inner' }) }));
  assert.ok(error instanceof TreeBranch);
  assert.equal(error.label, 'TypeError');
  assert.deepEqual(error.children.map((child) => child.name), ['message', 'stack', 'cause']);
  assert.ok(error.children[2].value instanceof TreeBranch);
  const set = logValue.logDisplay(T('set', { size: 2, values: [1, T('number', { value: 'NaN' })] }));
  assert.equal(set.kind, 'array');
  assert.equal(set.children[1].value.text, 'NaN');
  const array = logValue.logDisplay(T('array', { items: [1], length: 4 }));
  assert.equal(array.count, 4);
  assert.equal(array.children.at(-1).value.text, '… 3 more');
  const nested = logValue.logDisplay({ a: T('undefined'), b: [T('number', { value: '-0' })] });
  assert.equal(nested.a.text, 'undefined');
  assert.equal(nested.b[0].text, '-0');
  // Marker-free JSON for the viewer's flat-text fallback.
  assert.equal(JSON.stringify(nested).includes('$xray'), false);
});

test('only containers have detail to expand: typed scalars read fully on their one line', () => {
  for (const value of [T('bigint', { value: '1' }), T('undefined'), T('function', { name: 'f' }), T('date', { iso: null }), T('depth', { type: 'object' }),
    T('typedarray', { type: 'ArrayBuffer', length: 8 }), 'text', 7, null]) {
    assert.equal(logValue.logHasDetail(value), false, JSON.stringify(value));
  }
  for (const value of [{ a: 1 }, [1], T('map', { size: 0, entries: [] }), T('set', { size: 0, values: [] }), T('error', { name: 'E', message: '' }),
    T('object', { entries: [] }), T('array', { items: [], length: 3 }), T('typedarray', { type: 'Uint8Array', length: 1, values: [1] })]) {
    assert.equal(logValue.logHasDetail(value), true, JSON.stringify(value));
  }
});

test('the plain projection (inspector) keeps what JS can hold and names the rest', () => {
  const plain = logValue.logPlain({
    big: T('bigint', { value: '10' }), nan: T('number', { value: 'NaN' }), u: T('undefined'),
    map: T('map', { size: 1, entries: [['k', 1]] }), set: T('set', { size: 1, values: [2] }),
    err: T('error', { name: 'Error', message: 'm', stack: 's' }), fn: T('function', { name: 'f' }),
    point: T('object', { class: 'Point', entries: [['x', 1]] }),
  });
  assert.equal(plain.big, 10n);
  assert.ok(Number.isNaN(plain.nan));
  assert.ok('u' in plain && plain.u === undefined);
  assert.deepEqual(plain.map, [['k', 1]]);
  assert.deepEqual(plain.set, [2]);
  assert.deepEqual(plain.err, { name: 'Error', message: 'm', stack: 's' });
  assert.equal(plain.fn, 'ƒ f()');
  assert.deepEqual(plain.point, { x: 1 });
});

test('legacy entries (no logArgCount) decode the historical shapes; markers never show', () => {
  const legacy = (logData, extra = {}) => ({ id: uniqueId('old'), type: 'log', logLevel: 'error', timestamp: 1, logData, ...extra });
  const error = legacy({ __type__: 'Error', name: 'TypeError', message: 'old boom', stack: 'TypeError: old boom\n    at x', __xray_ref__: 'xrl_1_a' });
  assert.equal(text(error), 'TypeError: old boom');
  assert.deepEqual(logValue.logErrorInfo(logValue.logArgs(error)[0]).message, 'old boom');
  assert.equal(text(legacy({ __type__: 'Date', iso: 'Invalid Date' })), 'Invalid Date');
  assert.equal(text(legacy({ __type__: 'Date', iso: '1970-01-01T00:00:00.000Z', __xray_ref__: 'r' })), '1970-01-01T00:00:00.000Z');
  assert.equal(text(legacy({ __type__: 'Map', __xray_ref__: 'r' })), 'Map {…}');
  assert.equal(text(legacy({ __type__: 'function', name: 'cb' })), 'ƒ cb()', "Task 1's interim function shape");
  assert.equal(text(legacy({ cb: '[Function: cb]', deep: '[...]', loop: '[Circular]' })), '{"cb":ƒ cb(),"deep":…,"loop":[Circular]}');
  assert.equal(text(legacy({ __type__: 'Point', x: 1, __xray_ref__: 'r' })), 'Point {"x":1}');
  assert.equal(text(legacy({ a: 1, '...': '+3 more keys', __xray_ref__: 'r' })), '{"a":1,…3 more}');
  assert.equal(text(legacy({ s: 'x'.repeat(500) + '... (900 chars)' }), 1000), `{"s":"${'x'.repeat(500)}…"}`);
  assert.equal(text(legacy({ __type__: 'table', data: [{ a: 1 }], columns: undefined })), '[{"a":1}]');
  // A legacy array is the argument list (it always was) — unless it carries the array preview's tail.
  assert.equal(text(legacy([1, 2, 3])), '1 2 3');
  assert.equal(text(legacy([0, 1, '... +5 more'])), '[0,1,…5 more]');
  // Native values from older sessions or hand-built entries.
  assert.equal(text(legacy(NaN)), 'NaN');
  assert.equal(text(legacy(-0)), '-0');
  assert.equal(text(legacy(10n)), '10n');
  assert.equal(text(legacy(undefined)), '');
  assert.equal(text(legacy(null)), 'null');
  for (const entry of [error, legacy({ __type__: 'Point', x: 1, __xray_ref__: 'r' })]) {
    assert.equal(JSON.stringify(logValue.logDisplay(logValue.logArgs(entry)[0])).includes('__xray_ref__'), false);
  }
});

test('an Error\'s own message, stack or cause property never collides with its fields in the tree', () => {
  const error = logValue.logDisplay(T('error', { name: 'E', message: 'm', stack: 's', entries: [['message', 'own'], ['stack', 'own'], ['x', 1]], cause: 'c' }));
  const keys = error.children.map((child) => child.key);
  assert.equal(new Set(keys).size, keys.length, 'every child has its own key (React key and path)');
  assert.deepEqual(error.children.map((child) => child.name), ['message', 'stack', 'message', 'stack', 'x', 'cause']);
  // A forged envelope may repeat a key; the tree still keys each child once.
  const object = logValue.logDisplay(T('object', { entries: [['a', 1], ['a', 2]] }));
  assert.equal(new Set(object.children.map((child) => child.key)).size, 2);
  assert.deepEqual(object.children.map((child) => child.name), ['a', 'a']);
});

test('a pre-model entry with a "$xray" key is the page\'s data, not a typed value', () => {
  const legacy = { id: uniqueId('old'), type: 'log', logLevel: 'log', timestamp: 1, logData: { $xray: 'bigint', value: '1' } };
  assert.equal(text(legacy), '{"$xray":"bigint","value":"1"}');
  assert.ok(!(logValue.logDisplay(logValue.logArgs(legacy)[0]) instanceof TreeLeaf), 'not shown as 1n');
});

test('Load full object answers are shown as answered (the typed model), never decoded from old shapes', () => {
  const legacy = { id: uniqueId('old'), type: 'log', logLevel: 'log', timestamp: 1, logData: { a: 1 }, objectRefs: ['r'] };
  const answer = { __type__: 'Error', message: 'data', fn: '[Function: x]' };
  assert.deepEqual(logValue.logPayloadWithFull(legacy, [answer]), { kind: 'value', value: answer });
});

test('Copy raw of Console page-log arguments is their plain projection: typed values as text, no envelopes', () => {
  const copy = logValue.logCopyValue([T('bigint', { value: '10' }), { map: T('map', { size: 1, entries: [['k', T('undefined')]] }) }]);
  assert.deepEqual(copy, ['10n', { map: { k: 'undefined' } }]);
  assert.equal(JSON.stringify(copy).includes('$xray'), false);
  assert.equal(logValue.logCopyValue([T('number', { value: 'NaN' })]), 'NaN');
});

test('logEntryText never throws: a value that cannot be read falls back to the old preview', () => {
  const trap = { toJSON() { return { raw: 'copy-me' }; }, get boom() { throw new Error('boom'); } };
  const entry = { id: uniqueId('trap'), type: 'log', logLevel: 'warn', timestamp: 1, logData: trap };
  assert.doesNotThrow(() => text(entry, 160));
  assert.match(text(entry, 160), /copy-me/);
});

test('search uses the rendered text: typed values are findable, the $xray marker is not', () => {
  const entry = typed(['count', T('bigint', { value: '9007199254740993' }), { list: [T('number', { value: 'NaN' })] }]);
  assert.equal(entriesModel.matchesEntry(entry, '9007199254740993n'), true);
  assert.equal(entriesModel.matchesEntry(entry, 'nan'), true);
  assert.equal(entriesModel.matchesEntry(entry, '$xray'), false);
  assert.equal(entriesModel.matchesEntry(entry, 'bigint'), false);
  const other = typed([T('function', { name: 'loader' })]);
  const index = sessionIndex.buildSessionIndex([entry, other]);
  const doc = sessionIndex.getIndexedSearchDocument(entry, index);
  assert.ok(doc.searchText.includes('9007199254740993n'));
  assert.equal(doc.searchText.includes('$xray'), false);
  assert.equal(entriesModel.matchesEntry(other, 'ƒ loader()', index), true);
});

test('Session JSON carries the typed model as is (the documented form): no lazy-ref or legacy type markers; import renders the same', () => {
  const entries = [
    typed([T('bigint', { value: '10' }), T('number', { value: 'NaN' }), T('undefined')], { objectRefs: ['xrl_1'], objectRefArgs: [0] }),
    typed([[1, 2, 3]]),
    typed([1, 2, 3]),
    typed([T('error', { name: 'Error', message: 'outer', stack: 'Error: outer', cause: T('error', { name: 'Error', message: 'inner' }) })]),
    typed([T('map', { size: 1, entries: [['k', T('symbol', { description: 's' })]] })]),
  ];
  const json = exportModel.exportText(null, entries, 'session-json');
  assert.equal(json.includes('__xray_ref__'), false);
  assert.equal(json.includes('__type__'), false);
  assert.ok(json.includes('"$xray": "bigint"'));
  assert.ok(json.includes('"logArgCount": 1'));
  const imported = importModel.parseImport(json);
  assert.equal(imported.format, 'session');
  assert.deepEqual(imported.entries.map((entry) => text(entry)), entries.map((entry) => text(entry)));
  assert.deepEqual(imported.entries.map((entry) => entry.logArgCount), entries.map((entry) => entry.logArgCount));
});

test('persistence keeps the typed model JSON-safe and unchanged', () => {
  const entries = [typed([T('bigint', { value: '10' }), { neg: T('number', { value: '-0' }), when: T('date', { iso: null }) }])];
  const stored = sessionStore.serializeSessionEntries(entries);
  const restored = sessionStore.deserializeSessionEntries(JSON.parse(JSON.stringify(stored)));
  assert.equal(restored[0].logArgCount, 2);
  assert.deepEqual(restored[0].logData, entries[0].logData);
  assert.equal(text(restored[0]), '10n {"neg":-0,"when":Invalid Date}');
});

test('share-safe export flattens the typed model so its redaction still sees every key', () => {
  const entry = typed([T('object', { class: 'User', entries: [['password', 'hunter2'], ['name', 'ada']] }),
    T('map', { size: 1, entries: [['token', 'abc123']] }), T('bigint', { value: '10' })]);
  const projection = exportModel.buildShareSafeSession([entry]);
  const serialized = JSON.stringify(projection.entries);
  assert.equal(serialized.includes('hunter2'), false, 'a class instance field is redacted by name');
  assert.equal(serialized.includes('abc123'), false, 'a Map entry is redacted by its key');
  assert.equal(serialized.includes('$xray'), false);
  assert.ok(serialized.includes('10n'));
});

beforeEach(() => {
  window.XRAY_Store = { set: async () => {}, get: async () => undefined };
});

// Spec J8 (the Console inspector renders typed results): a listed object's or an Error's children
// are keyed by name when the names are unique, so a selected path reads `.code`, not `[1]`.
test('listed entries are keyed by name when their names are unique', () => {
  const object = logValue.logDisplay(T('object', { class: 'Point', entries: [['x', 1], ['y', 2]], omitted: 1 }));
  assert.deepEqual(object.children.map((child) => child.key), ['x', 'y', '\u0000more']);
  const error = logValue.logDisplay(T('error', { name: 'E', message: 'm', entries: [['code', 1]], omitted: 2, cause: 'c' }));
  assert.deepEqual(error.children.map((child) => child.key), ['message', 'code', '\u0000more', 'cause']);
  assert.deepEqual(error.children.map((child) => child.name), ['message', 'code', undefined, 'cause']);
});

test("logPlain 'json' writes a BigInt's digits and -0 as JSON numbers; the rest as in 'text'", () => {
  const value = [T('bigint', { value: '9007199254740993' }), T('number', { value: '-0' }), T('number', { value: 'NaN' }), T('undefined'), 12n];
  assert.equal(JSON.stringify(logValue.logPlain(value, 'json')), '[9007199254740993,-0,"NaN","undefined",12]');
  assert.equal(JSON.stringify(logValue.logPlain(value, 'text')), '["9007199254740993n","-0","NaN","undefined","12n"]');
  assert.equal(JSON.stringify(logValue.logPlain(T('bigint', { value: 'x1' }), 'json')), '"x1n"', 'a malformed digit string stays text');
});

test("logPlain 'json': native values JSON cannot hold are text; a malformed bigint lexeme stays text", () => {
  assert.equal(JSON.stringify(logValue.logPlain([NaN, undefined, -0, 10n], 'json')), '["NaN","undefined",-0,10]');
  assert.equal(JSON.stringify(logValue.logPlain(T('bigint', { value: '007' }), 'json')), '"007n"', 'not a JSON number lexeme');
  assert.equal(JSON.stringify(logValue.logPlain(T('number', { value: 'Infinity' }), 'json')), '"Infinity"');
});
