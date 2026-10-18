/* Table, Schema, Diff, Visualize and Search read what was captured (spec §2 J3, J14, J15; §8 J11;
 * plan Task 6): the lossless parser's nodes, so 9007199254740993 never becomes …992, a lexeme such as
 * -0 or 5e-324 is shown as written, a capped Table or a stopped Diff says so, and the search finds the
 * captured text as well as its compact form. Values that exist only as values (a decrypted response, a
 * request body stored before J4) are read through the same node model (fromValue).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { detail as D, viz as V, globalSearch as G, sessionIndex as SI, exportModel as X, entries as EN, apiEntry, logEntry } from './harness.mjs';
import { hostify, loadIsolatedWorld } from './runtime/vm-load.mjs';

const { parseJson, printJson, fromValue, LosslessNumber } = await import('../../src/panel/models/jsonText.ts');
const { bodyDoc, bodyNode, requestBody, responseBody } = await import('../../src/panel/models/capturedBody.ts');
const { compareEntries } = await import('../../src/panel/models/comparison.ts');
const E = await import('../../src/panel/models/experiments.ts');
const I = await import('../../src/panel/models/investigations.ts');
const P = await import('../../src/panel/models/investigationPersistence.ts');
const L = await import('../../src/panel/models/lenses.ts');
const { logSearchText } = await import('../../src/panel/models/logValue.ts');

const node = (text) => {
  const doc = parseJson(text);
  assert.ok(doc.ok, `fixture parses: ${text.slice(0, 60)}`);
  return doc.root;
};
const json = { 'content-type': 'application/json' };

// ------------------------------------------------------------------ fromValue

test('fromValue reads a plain value as nodes with JSON semantics', () => {
  const value = { a: [1, 'x', null, true, undefined, () => 1], b: undefined, c: () => 1, d: { e: -0 }, when: new Date(0) };
  assert.equal(printJson(fromValue(value)), '{"a":[1,"x",null,true,null,null],"d":{"e":-0},"when":"1970-01-01T00:00:00.000Z"}');
  assert.deepEqual(fromValue(new LosslessNumber('9007199254740993')), { t: 'num', raw: '9007199254740993', value: 9007199254740992, exact: false });
  assert.deepEqual(fromValue(new LosslessNumber('9007199254740992')), { t: 'num', raw: '9007199254740992', value: 9007199254740992, exact: true });
  assert.deepEqual(fromValue(10n), { t: 'num', raw: '10', value: 10, exact: true });
  assert.deepEqual(fromValue(-0), { t: 'num', raw: '-0', value: -0, exact: false });
  assert.deepEqual(fromValue(NaN), { t: 'num', raw: 'NaN', value: NaN, exact: false });
  assert.deepEqual(fromValue(5e-324), { t: 'num', raw: '5e-324', value: 5e-324, exact: true });
  assert.deepEqual(fromValue(undefined), { t: 'null' });
  assert.deepEqual(fromValue('s'), { t: 'str', value: 's' });
});

test('fromValue keeps __proto__ as a key, survives cycles, getters and any depth', () => {
  const proto = fromValue(JSON.parse('{"__proto__":{"x":1},"constructor":2}'));
  assert.deepEqual(proto.entries.map((entry) => entry.key), ['__proto__', 'constructor']);
  const cyclic = { name: 'c' };
  cyclic.self = cyclic;
  const shared = { v: 1 };
  assert.equal(printJson(fromValue({ cyclic, a: shared, b: shared })), '{"cyclic":{"name":"c","self":"[Circular]"},"a":{"v":1},"b":{"v":1}}');
  const getter = Object.defineProperty({ ok: 1 }, 'bad', { enumerable: true, get() { throw new Error('no'); } });
  assert.equal(printJson(fromValue(getter)), '{"ok":1,"bad":"[Unreadable]"}');
  let deep = [];
  for (let i = 0; i < 100_000; i++) deep = [deep];
  assert.equal(printJson(fromValue(deep)).length, 200_002, '100,000 levels without a stack overflow');
  // Hostile shapes never throw: a throwing toJSON, a proxy whose keys cannot be listed, a lexeme
  // that was overwritten after construction.
  assert.equal(printJson(fromValue({ bad: { toJSON() { throw new Error('no'); } } })), '{"bad":"[Unreadable]"}');
  assert.equal(printJson(fromValue({ keys: new Proxy({}, { ownKeys() { throw new Error('no'); } }) })), '{"keys":{}}');
  const forged = new LosslessNumber('1');
  Object.defineProperty(forged, 'raw', { value: 'x' });
  assert.deepEqual(fromValue(forged), { t: 'num', raw: 'x', value: NaN, exact: false });
});

// ------------------------------------------------------------------- bodyNode

test('bodyNode is the parse every view shares, or the value, fields or text as nodes', () => {
  const body = responseBody(apiEntry({ responseRaw: '{"a":1.0}' }));
  assert.equal(bodyNode(body), bodyDoc(body).root, 'a JSON body is its lossless parse');
  assert.equal(bodyNode(body), bodyNode(body));
  assert.equal(bodyNode(responseBody(apiEntry({ responseRaw: null }))), null, 'no body');
  assert.equal(bodyNode(responseBody(apiEntry({ responseRaw: '' }))), null, 'an empty body');
  assert.deepEqual(bodyNode(responseBody(apiEntry({ responseRaw: 'plain words', responseHeaders: { 'content-type': 'text/plain' } }))), { t: 'str', value: 'plain words' });
  const decrypted = responseBody(apiEntry({ responseDecrypted: { id: 1, list: [true] } }));
  assert.equal(printJson(bodyNode(decrypted)), '{"id":1,"list":[true]}');
  assert.equal(bodyNode(decrypted), bodyNode(decrypted), 'built once per body');
  const form = bodyNode(requestBody(apiEntry({ method: 'POST', requestBodyKind: 'formdata', requestBodyText: 'a=1\na=2', requestBody: [['a', '1'], ['a', '2']] })));
  assert.equal(printJson(form), '{"a":"1","a":"2"}');
  assert.equal(form.entries[1].dup, true);
  assert.equal(printJson(bodyNode(requestBody(apiEntry({ method: 'POST', requestBodyKind: 'urlencoded', requestBodyText: 'q=a+b&q=c', requestBody: 'q=a+b&q=c' })))), '{"q":"a b","q":"c"}');
  const binary = { binary: true, size: 3, base64Prefix: 'AAEC' };
  assert.equal(printJson(bodyNode(requestBody(apiEntry({ method: 'POST', requestBodyKind: 'binary', requestBody: binary })))), '{"binary":true,"size":3,"base64Prefix":"AAEC"}');
  assert.equal(printJson(bodyNode(requestBody(apiEntry({ method: 'POST', requestBody: { legacy: true } })))), '{"legacy":true}', 'a request body stored before J4');
});

// ---------------------------------------------------------------------- Table

test('Table rows come from the largest array (same choice on every surface), cells by lexeme', () => {
  const table = D.tableFromNode(node('{"errors":[],"data":[{"id":9007199254740993,"name":"a"},{"id":2,"name":"b","extra":true}]}'));
  assert.deepEqual(table.columns, ['id', 'name', 'extra']);
  assert.deepEqual(table.cells, [['9007199254740993', 'a', ''], ['2', 'b', 'true']]);
  assert.equal(table.rows.length, 2);
  assert.equal(table.totalRows, 2);
  assert.equal(table.totalColumns, 3);
  assert.equal(table.notice, null, 'nothing capped, nothing to say');

  const lexemes = D.tableFromNode(node('[{"a":1.0,"b":-0,"c":1E5,"d":5e-324,"e":"x","f":null,"g":true,"h":{"k":[1,2]},"i":"\\u00e9","big":1e400}]'));
  assert.deepEqual(lexemes.cells, [['1.0', '-0', '1E5', '5e-324', 'x', 'null', 'true', '{"k":[1,2]}', 'é', '1e400']]);

  assert.deepEqual(D.tableFromNode(node('{"meta":{"page":1},"items":[{"a":1}]}')).cells, [['1']]);
  assert.deepEqual(D.tableFromNode(node('{"a":1}')).columns, ['a'], 'an object without arrays is one row');
  assert.equal(D.tableFromNode(node('[1,"x",null,[1]]')).rows.length, 0, 'non-object items are not rows');
  assert.equal(D.tableFromNode(node('{"errors":[],"data":[]}')).rows.length, 0);
  assert.equal(D.tableFromNode(node('"text"')).rows.length, 0);
  assert.equal(D.tableFromNode(null).rows.length, 0);
  assert.deepEqual(D.tableFromNode(node('[{"a":1,"a":2}]')).cells, [['2']], 'a duplicate key reads as JSON.parse reads it: the last value');
  const proto = D.tableFromNode(node('[{"__proto__":{"x":1},"b":2}]'));
  assert.deepEqual([proto.columns, proto.cells], [['__proto__', 'b'], [['{"x":1}', '2']]]);
});

test('a capped Table says so: "Showing R of N rows · C of K columns"', () => {
  const many = D.tableFromNode(node('[' + Array.from({ length: 1200 }, (_, i) => `{"i":${i},"v":"x"}`).join(',') + ']'));
  assert.equal(many.rows.length, 200);
  assert.equal(many.totalRows, 1200);
  assert.equal(many.notice, 'Showing 200 of 1,200 rows · 2 of 2 columns');
  const wide = D.tableFromNode(node(JSON.stringify([Object.fromEntries(Array.from({ length: 40 }, (_, i) => [`c${i}`, i]))])));
  assert.equal(wide.columns.length, 20);
  assert.equal(wide.totalColumns, 40);
  assert.equal(wide.notice, 'Showing 1 of 1 rows · 20 of 40 columns');
  // Keys that only rows past the 200th carry are columns the Table does not show.
  const late = D.tableFromNode(node('[' + [...Array.from({ length: 200 }, () => '{"a":1}'), '{"late":1}'].join(',') + ']'));
  assert.equal(late.notice, 'Showing 200 of 201 rows · 1 of 2 columns');
});

// --------------------------------------------------------------------- Schema

test('Schema types come from nodes: 42 → number, true → boolean, null → null, "hi" → string', () => {
  assert.equal(D.schemaFromNode(node('42')), 'number');
  assert.equal(D.schemaFromNode(node('true')), 'boolean');
  assert.equal(D.schemaFromNode(node('null')), 'null');
  assert.equal(D.schemaFromNode(node('"hi"')), 'string');
  assert.equal(D.schemaFromNode(node('9007199254740993')), 'number');
  // Through the body model, for a captured top-level scalar.
  for (const [raw, type] of [['42', 'number'], ['true', 'boolean'], ['null', 'null'], ['"hi"', 'string']]) {
    assert.equal(D.schemaFromNode(bodyNode(responseBody(apiEntry({ responseRaw: raw, responseHeaders: json })))), type, raw);
  }
  assert.deepEqual(D.schemaFromNode(node('{"a":[{"b":"s","c":[1]}],"d":null,"e":[],"f":{}}')), { a: [{ b: 'string', c: ['number'] }], d: 'null', e: 'array', f: {} });
  assert.deepEqual(D.schemaFromNode(node('{"a":1,"a":"x"}')), { a: 'string' }, 'the last duplicate wins, as in JSON.parse');
});

test('Schema keeps __proto__ and constructor as plain keys', () => {
  const schema = D.schemaFromNode(node('{"__proto__":{"x":1},"constructor":"c"}'));
  assert.ok(Object.prototype.hasOwnProperty.call(schema, '__proto__'));
  assert.deepEqual(Object.getOwnPropertyDescriptor(schema, '__proto__').value, { x: 'number' });
  assert.equal(schema.constructor, 'string');
  assert.equal(Object.getPrototypeOf(schema), Object.prototype);
  assert.equal({}.x, undefined);
  assert.equal(JSON.stringify(schema), '{"__proto__":{"x":"number"},"constructor":"string"}');
});

test('Schema matches the console helpers schema (depth 5, then "any") for plain JSON', () => {
  const helpers = loadIsolatedWorld('shared/console-helpers.js').window.XRAY_ConsoleHelpers;
  for (const text of ['[[[[[[[1]]]]]]]', '{"a":{"b":{"c":{"d":{"e":{"f":{"g":1}}}}}}}', '[{"a":1},{"b":2}]', '[]', '{}', '"x"', '0']) {
    assert.deepEqual(D.schemaFromNode(node(text)), hostify(helpers.schema(JSON.parse(text))), text);
  }
});

// ----------------------------------------------------------------------- Diff

const diff = (a, b, maxLines) => D.diffNodes(node(a), node(b), maxLines);
const lines = (result) => result.lines.map((line) => [line.path, line.kind, line.before && printJson(line.before), line.after && printJson(line.after)]);

test('Diff compares number lexemes: …992 ≠ …993 (and 1.0 ≠ 1)', () => {
  assert.deepEqual(lines(diff('{"id":9007199254740992}', '{"id":9007199254740993}')), [['id', 'changed', '9007199254740992', '9007199254740993']]);
  assert.deepEqual(diff('{"id":9007199254740993}', '{"id":9007199254740993}'), { lines: [], notices: [] });
  assert.deepEqual(lines(diff('{"n":1.0}', '{"n":1}')), [['n', 'changed', '1.0', '1']]);
  assert.deepEqual(lines(diff('{"z":0}', '{"z":-0}')), [['z', 'changed', '0', '-0']]);
  assert.deepEqual(diff('{"s":"\\u00e9"}', '{"s":"é"}').lines, [], 'strings compare as decoded text');
  assert.deepEqual(diff('{"a":1,"b":[1,2]}', '{"b":[1,2],"a":1}'), { lines: [], notices: [] }, 'key order is not a difference');
  assert.deepEqual(lines(diff('{"keep":1,"drop":2}', '{"keep":1,"add":3}')), [['drop', 'removed', '2', undefined], ['add', 'added', undefined, '3']]);
  assert.deepEqual(lines(diff('[1,2]', '{"a":1}')), [['', 'changed', '[1,2]', '{"a":1}']]);
  assert.deepEqual(lines(D.diffNodes(null, node('{"a":1}'))), [['', 'added', undefined, '{"a":1}']]);
});

const nest = (leaf, levels) => (levels === 0 ? leaf : { a: nest(leaf, levels - 1) });

test('Diff never says "no differences" silently: a depth limit is a change plus a notice', () => {
  const result = diff(JSON.stringify(nest('x', 12)), JSON.stringify(nest('y', 12)));
  const path = Array(D.DIFF_MAX_DEPTH + 1).fill('a').join('.');
  assert.deepEqual(result.lines.map((line) => [line.path, line.kind]), [[path, 'changed']]);
  assert.equal(result.notices.length, 1);
  assert.match(result.notices[0], new RegExp(`${D.DIFF_MAX_DEPTH} levels deep`));
  assert.ok(result.notices[0].includes(path), result.notices[0]);
  // Equal below the limit: nothing hidden, nothing to say.
  assert.deepEqual(diff(JSON.stringify(nest('x', 12)), JSON.stringify(nest('x', 12))), { lines: [], notices: [] });
  // A change at depth 7 (the old silent limit was 6) is a plain line.
  assert.deepEqual(diff(JSON.stringify(nest('x', 7)), JSON.stringify(nest('y', 7))).lines.map((line) => line.path), ['a.a.a.a.a.a.a']);
});

test('nodesEqual: lexemes, decoded strings, members by key, items by position', () => {
  const equal = (a, b) => D.nodesEqual(node(a), node(b));
  assert.equal(equal('[1,[2]]', '[1,[2]]'), true);
  assert.equal(equal('[1,2]', '[1]'), false);
  assert.equal(equal('{"a":1,"b":2}', '{"b":2,"a":1}'), true);
  assert.equal(equal('{"a":1}', '{"b":1}'), false);
  assert.equal(equal('{"a":1}', '{"a":1,"b":2}'), false);
  assert.equal(equal('1.0', '1'), false);
  assert.equal(equal('"\\u00e9"', '"é"'), true);
  assert.equal(equal('true', 'false'), false);
  assert.equal(equal('null', 'null'), true);
  assert.equal(equal('[]', '{}'), false);
});

test('Diff says when the line cap or the array window stops it', () => {
  const before = JSON.stringify(Object.fromEntries(Array.from({ length: 500 }, (_, i) => [`k${i}`, i])));
  const after = JSON.stringify(Object.fromEntries(Array.from({ length: 500 }, (_, i) => [`k${i}`, i + 1])));
  const capped = diff(before, after);
  assert.equal(capped.lines.length, 200);
  assert.deepEqual(capped.notices, ['Showing the first 200 differences; the diff stopped there.']);
  const exactly = diff(JSON.stringify(Object.fromEntries(Array.from({ length: 200 }, (_, i) => [`k${i}`, i]))),
    JSON.stringify(Object.fromEntries(Array.from({ length: 200 }, (_, i) => [`k${i}`, i + 1]))));
  assert.equal(exactly.lines.length, 200);
  assert.deepEqual(exactly.notices, [], '200 differences and no more: nothing was cut');

  const list = Array.from({ length: 60 }, (_, i) => i);
  const late = list.slice();
  late[55] = 'late';
  const window = diff(JSON.stringify({ items: list }), JSON.stringify({ items: late }));
  assert.deepEqual(lines(window), [['items[…]', 'changed', '"60 items"', '"60 items"']]);
  assert.equal(window.notices.length, 1);
  assert.match(window.notices[0], /first 50 items of items/);
  assert.deepEqual(diff(JSON.stringify({ items: list }), JSON.stringify({ items: list })), { lines: [], notices: [] });
});

// ------------------------------------------------------------------ Visualize

test('Visualize shows -0, 5e-324 and integers past 2^53 as written', () => {
  const spec = V.buildVizSpecFromNode(node('{"negz":-0,"tiny":5e-324,"one":1.0,"big":9007199254740993,"inf":1e400,"label":"x"}'));
  assert.equal(spec.title, '4 numeric fields');
  assert.deepEqual(spec.bars.map((bar) => [bar.label, V.vizValueText(bar)]), [['negz', '-0'], ['tiny', '5e-324'], ['one', '1'], ['big', '9007199254740993']]);
  assert.equal(V.vizValueText(V.buildVizSpecFromNode(node('5e-324')).bars[0]), '5e-324');
  assert.equal(V.vizValueText(V.buildVizSpecFromNode(node('-0')).bars[0]), '-0');
  assert.equal(V.vizValueText(V.buildVizSpecFromNode(node('0.00012')).bars[0]), '0.00012', 'never a rounded-away 0');
  assert.equal(V.vizValueText(V.buildVizSpecFromNode(node('1234567')).bars[0]), '1,234,567', 'a number that formats faithfully keeps its separators');
  assert.equal(V.vizValueText(V.buildVizSpecFromNode(node('1234.5678')).bars[0]), '1,234.6', 'rounding a decimal for display is not misstating it');
  assert.equal(V.buildVizSpecFromNode(node('{"errors":[],"data":[{"n":1},{"n":2}]}')).title, 'n across 2 rows', 'the same array as the Table');
  assert.deepEqual(V.buildVizSpecFromNode(node('["a",9007199254740993,"a"]')).bars.map((bar) => bar.label), ['a', '9007199254740993']);
  assert.deepEqual(V.buildVizSpecFromNode(node('[true,false,true,null]')).bars.map((bar) => [bar.label, bar.value]), [['true', 2], ['false', 1], ['null', 1]]);
  assert.deepEqual(V.buildVizSpecFromNode(node('[{"kind":"a"},{"kind":{"x":1}}]')).bars.map((bar) => bar.label), ['a', '[object]']);
  assert.equal(V.buildVizSpecFromNode(node('[{"ok":true},{"ok":false}]')).title, 'This array has no numeric or categorical field to chart.');
  assert.deepEqual(V.buildVizSpecFromNode(node('[{"name":"a","n":1},{"name":[1,2],"n":2},{"name":true,"n":3},{"name":null,"n":4},{"name":9007199254740993,"n":5}]')).bars.map((bar) => bar.label),
    ['a', '[1,2]', 'true', '#4', '9007199254740993'], 'labels from the label field, as written');
});

// --------------------------------------------------------------------- Search

test('search finds the captured text (lexemes, escapes, pretty spacing) and its compact form', () => {
  const pretty = '{\n  "a": 1,\n  "id": 9007199254740993,\n  "one": 1.0,\n  "s": "\\u00e9t\\u00e9"\n}';
  const entry = apiEntry({ url: 'https://x/search', responseRaw: pretty });
  const find = (query) => G.searchEntries([entry], query).matches.map((match) => match.field);
  assert.deepEqual(find('"a": 1'), ['Response body'], 'pretty spacing as captured');
  assert.deepEqual(find('"a":1'), ['Response body'], 'the compact form');
  assert.deepEqual(find('9007199254740993'), ['Response body']);
  assert.deepEqual(find('9007199254740992'), [], 'never the rounded digits');
  assert.deepEqual(find('1.0'), ['Response body'], 'the lexeme as written');
  assert.deepEqual(find('\\u00e9t'), ['Response body'], 'the escape as written');
  assert.deepEqual(find('été'), ['Response body'], 'the decoded text too');
  const [hit] = G.searchEntries([entry], '"id"').matches;
  assert.ok(hit.snippet.includes('"id": 9007199254740993'), `the snippet is the captured text: ${hit.snippet}`);

  const post = apiEntry({ url: 'https://x/post', method: 'POST', requestHeaders: json, requestBodyKind: 'text',
    requestBodyText: '{"id": 9007199254740993}', requestBody: { id: 9007199254740992 }, responseRaw: '{}' });
  assert.deepEqual(G.searchEntries([post], '"id": 9007199254740993').matches.map((match) => match.field), ['Request body']);
  assert.deepEqual(G.searchEntries([post], '9007199254740992').matches, []);

  // The bounded index and the transient path for entries past it read the same texts.
  for (const query of ['"a": 1', '"a":1', '\\u00e9t', 'été', '9007199254740993']) {
    assert.deepEqual(G.searchEntries([entry, post], query, { index: SI.buildSessionIndex([entry, post]) }),
      G.searchEntries([entry, post], query, { index: SI.buildSessionIndex([]) }), query);
  }
});

// ----------------------------------------------------------------- Comparison

test('Compare reads an integer past 2^53 as one number compared by lexeme', () => {
  const left = apiEntry({ id: 'left', responseRaw: '{"id":9007199254740992,"n":1}' });
  const right = apiEntry({ id: 'right', responseRaw: '{"id":9007199254740993,"n":1}' });
  const result = compareEntries(left, right);
  assert.deepEqual(result.responseBody.differences.map((change) => [change.path, change.kind, String(change.before), String(change.after)]),
    [['id', 'changed', '9007199254740992', '9007199254740993']]);
  assert.equal(result.responseBody.equal, false);
  assert.ok(result.responseBody.left.id instanceof LosslessNumber, 'the captured evidence keeps the number, not {raw}');
  const same = compareEntries(left, apiEntry({ id: 'same', responseRaw: '{"n":1,"id":9007199254740992}' }));
  assert.equal(same.responseBody.equal, true);
  assert.deepEqual(same.responseBody.differences, []);
});

test('Compare tells a JSON null request body from no body (J4)', () => {
  const left = apiEntry({ id: 'left', method: 'POST', requestHeaders: json, requestBodyKind: 'text', requestBodyText: 'null', requestBody: null });
  const right = apiEntry({ id: 'right', method: 'POST', requestBodyKind: 'none', requestBody: null });
  const result = compareEntries(left, right);
  assert.ok(result.requestBody.notices.includes('Request body missing on right'), result.requestBody.notices.join(' | '));
  assert.ok(!result.requestBody.notices.includes('Request body missing on left'));
});

// ------------------------------------------------- Experiments, investigations

test('experiment structural checks compare integers past 2^53 exactly', () => {
  const record = E.createExperiment({ id: 'big', baselineEntryId: 'baseline', baselineUrl: 'https://a.test/x',
    plan: { method: 'GET', url: 'https://a.test/x', headers: {} }, checks: [{ type: 'structural', mode: 'equal' }, { type: 'structural', mode: 'schema' }] });
  const run = (observed, baseline) => E.evaluateExperiment(record, { responseRaw: observed }, { responseRaw: baseline }).checks.map((check) => check.passed);
  assert.deepEqual(run('{"id":9007199254740993}', '{"id":9007199254740992}'), [false, true]);
  assert.deepEqual(run('{"id":9007199254740993}', '{"id":9007199254740993}'), [true, true]);
  assert.deepEqual(run('plain text', 'plain text'), [true, true], 'text that is not JSON still compares as text');
});

test('an assertion baseline keeps an integer past 2^53 exactly, also after it is saved and restored', () => {
  const source = apiEntry({ id: 'big-source', responseRaw: '{"id":9007199254740993}', responseDecrypted: null });
  const spec = I.createAssertion(source, 'session', { type: 'structural', mode: 'equal' });
  const outcome = (assertion, raw) => I.evaluateAssertions([assertion], apiEntry({ responseRaw: raw }))[0].outcome;
  assert.equal(outcome(spec, '{"id":9007199254740993}'), 'passed');
  assert.equal(outcome(spec, '{"id":9007199254740992}'), 'failed');
  const investigation = I.createInvestigation({ sessionId: 'session', entries: [source], selectedId: source.id });
  investigation.assertions = [spec];
  const restored = P.normalizeInvestigationStore(JSON.parse(JSON.stringify({ schemaVersion: 1, investigations: [investigation] }))).investigations[0].assertions[0];
  assert.equal(outcome(restored, '{"id":9007199254740993}'), 'passed');
  assert.equal(outcome(restored, '{"id":9007199254740992}'), 'failed');
});

test('snapshot integers past 2^53 stay compatible: a saved rounded expectation, schema mode, exact digits', () => {
  // An assertion saved before exact integers holds the number JSON.parse rounded to: 9007199254740992.
  const source = apiEntry({ id: 'legacy-source', responseRaw: '{"id":1}', responseDecrypted: null });
  const saved = I.createAssertion(source, 'session', { type: 'structural', mode: 'equal' });
  const investigation = I.createInvestigation({ sessionId: 'session', entries: [source], selectedId: source.id });
  investigation.assertions = [{ ...saved, check: { type: 'structural', mode: 'equal', expected: { id: 9007199254740992 } } }];
  const [legacy] = P.normalizeInvestigationStore(JSON.parse(JSON.stringify({ schemaVersion: 1, investigations: [investigation] }))).investigations[0].assertions;
  const outcome = (assertion, raw) => I.evaluateAssertions([assertion], apiEntry({ responseRaw: raw }))[0].outcome;
  assert.equal(outcome(legacy, '{"id":9007199254740993}'), 'passed', 'the digits a saved rounded number came from still match it');
  assert.equal(outcome(legacy, '{"id":9007199254740992}'), 'passed');
  assert.equal(outcome(legacy, '{"id":9007199254740995}'), 'failed', 'digits that round elsewhere do not');
  assert.equal(outcome(legacy, '{"id":"9007199254740993"}'), 'failed', 'a string is not the number');

  const experiment = (mode) => E.createExperiment({ id: `mode-${mode}`, baselineEntryId: 'baseline', baselineUrl: 'https://a.test/x',
    plan: { method: 'GET', url: 'https://a.test/x', headers: {} }, checks: [{ type: 'structural', mode }] });
  const passed = (mode, observed, baseline) => E.evaluateExperiment(experiment(mode), { responseRaw: observed }, { responseRaw: baseline }).checks[0].passed;
  assert.equal(passed('schema', '{"id":9007199254740993}', '{"id":5}'), true, 'an integer past 2^53 is a number to the schema');
  assert.equal(passed('schema', '{"id":5}', '{"id":9007199254740993}'), true);
  assert.equal(passed('schema', '{"id":"x"}', '{"id":9007199254740993}'), false);
  assert.equal(passed('equal', '{"id":9007199254740993}', '{"id":9007199254740992}'), false, 'exact digits on both sides');
  assert.equal(passed('contains', '{"id":9007199254740993,"more":1}', '{"id":9007199254740993}'), true);
  assert.equal(passed('contains', '{"id":9007199254740993,"more":1}', '{"id":9007199254740992}'), false);
});

// ------------------------------------------------------------------ Log search

test('log search finds keys inside array, map and set envelopes and an Error with its cause', () => {
  const log = (logData) => logEntry({ message: undefined, logArgCount: 1, logData });
  const error = log({ $xray: 'error', name: 'TypeError', message: 'outer failure', entries: [['code', 'E_OUTER']],
    cause: { $xray: 'error', name: 'Error', message: 'inner failure', entries: [['innerCode', 7]] } });
  for (const text of ['TypeError: outer failure', 'code', 'E_OUTER', 'innerCode', 'inner failure']) {
    assert.ok(logSearchText(error).includes(text), `${text} in ${logSearchText(error)}`);
    assert.equal(EN.matchesEntry(error, text.toLowerCase()), true, `list search finds ${text}`);
  }
  const array = log({ $xray: 'array', items: [{ itemKey: 1 }], length: 9 });
  const map = log({ $xray: 'map', size: 1, entries: [['mapKey', { mapValueKey: 1 }]] });
  const set = log({ $xray: 'set', size: 1, values: [{ setKey: true }] });
  for (const [entry, key] of [[array, 'itemKey'], [map, 'mapKey'], [map, 'mapValueKey'], [set, 'setKey']]) {
    assert.ok(logSearchText(entry).includes(key), `${key} in ${logSearchText(entry)}`);
  }
  // Keys stay findable when the value's text is longer than the haystack keeps.
  const late = log({ $xray: 'array', items: ['x'.repeat(400), { lateKey: 1 }], length: 2 });
  assert.equal(EN.matchesEntry(late, 'latekey'), true);
  assert.ok(logSearchText(late).length <= 600, 'still bounded');
});

// --------------------------------------------------------------------- Lenses

test('a JWT claim past 2^53 is kept as written', () => {
  const segment = (text) => Buffer.from(text).toString('base64url');
  const token = `${segment('{"alg":"none"}')}.${segment('{"sub":9007199254740993,"exp":4102444800}')}.`;
  const jwt = L.decodeJwt(token, 'response');
  assert.ok(jwt.payload.sub instanceof LosslessNumber);
  assert.equal(jwt.payload.sub.raw, '9007199254740993');
  assert.equal(jwt.expiresAt, '2100-01-01T00:00:00.000Z');
  assert.equal(L.decodeJwt(`${segment('not json')}.${segment('{bad')}.`, 'response'), null);
});

// ------------------------------------------------------------ Console helpers

test('console helpers keep __proto__ and constructor as data (schema, pick, flatten, diff, groupBy, countBy)', () => {
  const helpers = loadIsolatedWorld('shared/console-helpers.js').window.XRAY_ConsoleHelpers;
  const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
  const schema = helpers.schema(JSON.parse('{"__proto__":{"x":1},"a":1}'));
  assert.ok(own(schema, '__proto__'), 'schema');
  assert.deepEqual(hostify(Object.getOwnPropertyDescriptor(schema, '__proto__').value), { x: 'number' });
  assert.ok(own(helpers.pick(JSON.parse('{"__proto__":{"x":1},"a":1}'), ['__proto__', 'a']), '__proto__'), 'pick');
  assert.ok(own(helpers.flatten(JSON.parse('{"__proto__":5}')), '__proto__'), 'flatten');
  const changes = helpers.diff({}, JSON.parse('{"__proto__":{"x":1}}'));
  assert.ok(own(changes.added, '__proto__'), 'diff');
  const runtime = helpers.createRuntime({ entries: [], currentEntry: null });
  const rows = [{ name: 'constructor' }, { name: '__proto__' }, { name: 'constructor' }, { name: 'toString' }];
  const grouped = runtime._.groupBy(rows, 'name');
  assert.deepEqual(Object.keys(grouped), ['constructor', '__proto__', 'toString']);
  assert.equal(grouped.constructor.length, 2);
  const counted = runtime._.countBy(rows, 'name');
  assert.deepEqual(Object.entries(counted), [['constructor', 2], ['__proto__', 1], ['toString', 1]]);
});

test('TypeScript and Zod exports keep a __proto__ key, also through the console helpers schema', () => {
  const value = JSON.parse('{"__proto__":{"x":1},"a":"s"}');
  const check = () => {
    assert.match(X.buildTypeScriptShape(value), /"__proto__": \{\n {4}"x": number;/);
    assert.match(X.buildZodSchema(value), /"__proto__": z\.object\(\{/);
  };
  check();
  // Every real surface loads shared/console-helpers.js, and utils.schema() delegates to it.
  globalThis.window.XRAY_ConsoleHelpers = loadIsolatedWorld('shared/console-helpers.js').window.XRAY_ConsoleHelpers;
  try {
    check();
  } finally {
    delete globalThis.window.XRAY_ConsoleHelpers;
  }
});
