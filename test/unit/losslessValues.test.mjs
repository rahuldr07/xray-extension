/* entryResponse / entryRequest read captured text through the lossless parser (spec §1/§2, J1–J3;
 * plan Task 5), and the panel helpers that type values (schema, Table rows, Diff, Visualize) treat a
 * LosslessNumber — what toValue gives for an integer past Number.MAX_SAFE_INTEGER — as the number
 * it is, never as an object with a "raw" field.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { utils as U, detail as D, viz as V, apiEntry } from './harness.mjs';

const { LosslessNumber, fromValue, toValue } = await import('../../src/panel/models/jsonText.ts');
const { entryResponse, entryRequest, parseBody, schema } = U;

// Table, Diff and Visualize read nodes; the value wrappers only tests called went with the final fix
// (M7). Plain values (with their LosslessNumbers) reach the node models through fromValue, as before.
const gridRows = (value) => {
  const table = D.tableFromNode(fromValue(value));
  return { objects: table.rows.map((row) => toValue(row)), columns: table.columns };
};
const structuralDiff = (previous, current) => D.diffNodes(fromValue(previous), fromValue(current)).lines.map((line) => ({
  path: line.path, kind: line.kind, ...(line.before ? { before: toValue(line.before) } : {}), ...(line.after ? { after: toValue(line.after) } : {}),
}));
const buildVizSpec = (value) => V.buildVizSpecFromNode(fromValue(value));

const json = { 'content-type': 'application/json' };

test('entryResponse keeps integers JavaScript cannot hold exactly as written', () => {
  const value = entryResponse(apiEntry({ responseRaw: '{"id": 9007199254740993, "n": 12345678901234567890, "neg": -9007199254740993, "ok": 1}' }));
  assert.ok(value.id instanceof LosslessNumber, 'an unsafe integer is a LosslessNumber, not a rounded number');
  assert.equal(value.id.raw, '9007199254740993');
  assert.equal(value.n.raw, '12345678901234567890');
  assert.equal(value.neg.raw, '-9007199254740993');
  assert.equal(value.ok, 1);
  assert.equal(JSON.stringify(value), '{"id":9007199254740993,"n":12345678901234567890,"neg":-9007199254740993,"ok":1}');
});

test('entryResponse parses any top-level JSON value when the content type says JSON', () => {
  const read = (responseRaw, responseHeaders = json) => entryResponse(apiEntry({ responseRaw, responseHeaders }));
  assert.equal(read('42'), 42);
  assert.equal(read('true'), true);
  assert.equal(read('"hi"'), 'hi');
  assert.equal(read('null'), null);
  // Not JSON by type: parsed only when it looks like JSON, otherwise kept as text.
  assert.equal(read('42', { 'content-type': 'text/plain' }), 42);
  assert.equal(read('hello', { 'content-type': 'text/plain' }), 'hello');
  assert.equal(read('plain words', json), 'plain words', 'declared JSON that is not JSON stays text');
});

test('entryResponse strips an XSSI guard and reads NDJSON as an array of documents', () => {
  assert.deepEqual(entryResponse(apiEntry({ responseRaw: ")]}'\n{\"a\":1,\"b\":[1,2]}" })), { a: 1, b: [1, 2] });
  assert.deepEqual(entryResponse(apiEntry({ responseRaw: 'while(1);{"a":1}' })), { a: 1 });
  assert.deepEqual(
    entryResponse(apiEntry({ responseRaw: '{"a":1}\n{"a":2}\n{"a":3}\n', responseHeaders: { 'content-type': 'application/x-ndjson' } })),
    [{ a: 1 }, { a: 2 }, { a: 3 }],
  );
});

test('entryResponse makes __proto__ an own key and leaves the prototype alone', () => {
  const value = entryResponse(apiEntry({ responseRaw: '{"__proto__":{"polluted":true},"constructor":{"x":1}}' }));
  assert.ok(Object.prototype.hasOwnProperty.call(value, '__proto__'));
  assert.equal(Object.getPrototypeOf(value), Object.prototype);
  assert.equal(value.polluted, undefined);
  assert.equal({}.polluted, undefined);
});

test('entryResponse of a truncated body is its captured prefix, never with an in-band suffix', () => {
  const prefix = '[{"id":1},{"id":2},{"i';
  assert.equal(entryResponse(apiEntry({ responseRaw: prefix, responseTruncated: { totalChars: 938_891, keptChars: prefix.length } })), prefix);
  assert.equal(entryResponse(apiEntry({ imported: true, responseRaw: `${prefix}\n... truncated 938869 chars` })), prefix, 'a legacy suffix (imported data) is not part of the body');
});

test('entryRequest reads requestBodyText by requestBodyKind (J4)', () => {
  const request = (fields) => entryRequest(apiEntry({ method: 'POST', requestHeaders: json, ...fields }));
  const big = request({ requestBodyKind: 'text', requestBodyText: '{"id": 9007199254740993}', requestBody: { id: 9007199254740992 } });
  assert.ok(big.id instanceof LosslessNumber, 'the text wins over the interceptor’s rounded parse');
  assert.equal(big.id.raw, '9007199254740993');
  assert.equal(request({ requestBodyKind: 'text', requestBodyText: 'null', requestBody: null }), null);
  assert.equal(request({ requestBodyKind: 'text', requestBodyText: 'false', requestBody: false }), false);
  assert.equal(request({ requestBodyKind: 'text', requestBodyText: '"hello"', requestBody: 'hello' }), 'hello');
  const pairs = [['a', '1'], ['f', { file: 'x.png', size: 4, type: 'image/png' }]];
  assert.deepEqual(request({ requestBodyKind: 'formdata', requestBodyText: 'a=1\nf=[file "x.png", image/png, 4 bytes]', requestBody: pairs }), pairs);
  assert.equal(request({ requestBodyKind: 'urlencoded', requestBodyText: 'a=1&b=2', requestBody: 'a=1&b=2' }), 'a=1&b=2');
  const binary = { binary: true, size: 3, base64Prefix: 'AAEC' };
  assert.deepEqual(request({ requestBodyKind: 'binary', requestBody: binary }), binary);
  assert.equal(request({ requestBodyKind: 'none', requestBody: null }), null);
  // Sessions stored before J4: the parsed body or its text.
  assert.deepEqual(request({ requestBody: '{"q":1}' }), { q: 1 });
  assert.deepEqual(request({ requestBody: { q: 2 } }), { q: 2 });
});

test('parseBody goes through the lossless parser and keeps its contract', () => {
  assert.deepEqual(parseBody('{"a":1}'), { a: 1 });
  assert.deepEqual(parseBody(' [1,2] '), [1, 2]);
  // Edit & Replay and HAR import send/store what parseBody returns: a body JavaScript cannot hold
  // exactly stays the text it was, rather than becoming rounded numbers (or a wrapper object).
  const big = '{"id": 9007199254740993}';
  assert.equal(parseBody(big), big);
  assert.equal(parseBody('42'), '42', 'still only {…} and […] are parsed');
  assert.equal(parseBody('{bad'), '{bad');
  assert.equal(parseBody(''), null);
});

test('schema types a lossless number as a number', () => {
  const value = entryResponse(apiEntry({ responseRaw: '{"id":9007199254740993,"list":[12345678901234567890],"nested":{"n":-9007199254740993}}' }));
  assert.deepEqual(schema(value), { id: 'number', list: ['number'], nested: { n: 'number' } });
  assert.equal(schema(new LosslessNumber('9007199254740993')), 'number');
});

test('schema gives the console helpers a sample where a lossless number is a number', () => {
  // The panel delegates to shared/console-helpers.js schema when it is loaded (every surface).
  const seen = [];
  globalThis.window.XRAY_ConsoleHelpers = { schema: (value) => { seen.push(value); return 'delegated'; } };
  try {
    const value = entryResponse(apiEntry({ responseRaw: '{"id":9007199254740993,"list":[9007199254740994,1],"plain":{"a":1}}' }));
    assert.equal(schema(value), 'delegated');
    const sample = seen[0];
    assert.equal(sample.id, 9007199254740992);
    assert.deepEqual(sample.list, [9007199254740994], 'arrays are sampled by their first item, as the helper does');
    assert.equal(sample.plain, value.plain, 'a part without one is passed through, not copied');
    assert.ok(value.id instanceof LosslessNumber, 'the value itself is not changed');
    const plain = { a: [1, { b: 'x' }] };
    schema(plain);
    assert.equal(seen[1], plain, 'a value without a lossless number is passed as it is');
  } finally {
    delete globalThis.window.XRAY_ConsoleHelpers;
  }
});

test('gridRows does not read a lossless number as an object row', () => {
  const big = (raw) => new LosslessNumber(raw);
  assert.equal(gridRows([big('9007199254740993'), big('9007199254740994')]).objects.length, 0);
  assert.deepEqual(gridRows([{ id: big('9007199254740993'), name: 'a' }]).columns, ['id', 'name']);
});

test('structuralDiff compares lossless numbers by lexeme (…992 ≠ …993)', () => {
  const big = (raw) => new LosslessNumber(raw);
  const lines = structuralDiff({ id: big('9007199254740992') }, { id: big('9007199254740993') });
  assert.deepEqual(lines.map((line) => [line.path, line.kind]), [['id', 'changed']], 'one change at the number, not inside it');
  assert.equal(lines[0].before.raw, '9007199254740992');
  assert.equal(lines[0].after.raw, '9007199254740993');
  assert.deepEqual(structuralDiff({ id: big('9007199254740992') }, { id: big('9007199254740992') }), [], 'equal lexemes are equal');
  assert.deepEqual(structuralDiff({ id: big('9007199254740992') }, { id: 1 }).map((line) => line.kind), ['changed']);
  // End to end: two captured bodies that JSON.parse reads as the same number.
  const a = entryResponse(apiEntry({ responseRaw: '{"id":9007199254740992}' }));
  const b = entryResponse(apiEntry({ responseRaw: '{"id":9007199254740993}' }));
  assert.deepEqual(structuralDiff(a, b).map((line) => line.path), ['id']);
});

test('Visualize charts a lossless number as the number it approximates', () => {
  const big = (raw) => new LosslessNumber(raw);
  const spec = buildVizSpec([big('9007199254740993'), 1]);
  assert.equal(spec.kind, 'bars');
  assert.deepEqual(spec.bars.map((bar) => bar.value), [9007199254740992, 1]);
  const objects = buildVizSpec([{ name: 'a', total: big('9007199254740993') }, { name: 'b', total: 2 }]);
  assert.equal(objects.title, 'total across 2 rows');
  assert.deepEqual(objects.bars.map((bar) => bar.value), [9007199254740992, 2]);
  const fields = buildVizSpec({ total: big('-9007199254740993'), name: 'x' });
  assert.deepEqual(fields.bars.map((bar) => [bar.label, bar.value, bar.negative]), [['total', -9007199254740992, true]]);
  assert.deepEqual(buildVizSpec(big('9007199254740993')).bars.map((bar) => bar.value), [9007199254740992]);
});
