/* The models behind the API detail Raw and Tree views (spec §2 J2, J3 tree, J13; plan Task 5):
 * - capturedBody.ts: what a facet's body is (captured text verbatim, its truncation, its kind),
 *   whether it parses as JSON, and the one cached parse every view shares;
 * - jsonTree.ts: the Tree's rows flattened from JsonNode, iteratively, chunked and row-budgeted;
 * - textDisplay.ts: bidi controls made visible, and the Raw view's line/segment layout.
 * Deep fixtures are checked with loops (deepEqual recurses).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { apiEntry } from './harness.mjs';

const { parseJson } = await import('../../src/panel/models/jsonText.ts');
const CB = await import('../../src/panel/models/capturedBody.ts');
const JT = await import('../../src/panel/models/jsonTree.ts');
const TD = await import('../../src/panel/models/textDisplay.ts');

// ------------------------------------------------------------------ bidi (J13)

test('splitBidi isolates every bidi control the spec lists and leaves other text alone', () => {
  for (const code of [0x200e, 0x200f, 0x202a, 0x202b, 0x202c, 0x202d, 0x202e, 0x2066, 0x2067, 0x2068, 0x2069]) {
    assert.deepEqual(TD.splitBidi(`a${String.fromCharCode(code)}b`), ['a', code, 'b'], code.toString(16));
  }
  assert.deepEqual(TD.splitBidi('plain é 😀 ​ '), ['plain é 😀 ​ ']);
  assert.deepEqual(TD.splitBidi('‮⁦x'), [0x202e, 0x2066, 'x']);
  assert.deepEqual(TD.splitBidi(''), []);
  assert.equal(TD.bidiEscape(0x202e), '\\u202E');
  assert.equal(TD.escapeBidi('abc ‮RTL‏'), 'abc \\u202ERTL\\u200F');
  assert.equal(TD.escapeBidi('no controls'), 'no controls');
  assert.match(TD.bidiName(0x202e), /RIGHT-TO-LEFT OVERRIDE/);
  assert.match(TD.bidiName(0x2066), /LEFT-TO-RIGHT ISOLATE/);
});

// ---------------------------------------------------------- Raw layout (J2)

test('layoutRawText splits on \\n, keeps a trailing empty line and cuts long lines into segments', () => {
  const rows = (layout) => Array.from({ length: layout.count }, (_, i) => [layout.start[i], layout.end[i], layout.line[i], layout.first[i]]);
  assert.deepEqual(rows(TD.layoutRawText('a\nbc\n', 10)), [[0, 1, 1, 1], [2, 4, 2, 1], [5, 5, 3, 1]]);
  assert.deepEqual(rows(TD.layoutRawText('', 10)), [[0, 0, 1, 1]]);
  assert.deepEqual(rows(TD.layoutRawText('x'.repeat(25), 10)), [[0, 10, 1, 1], [10, 20, 1, 0], [20, 25, 1, 0]]);
  // A segment boundary never splits a surrogate pair.
  const pair = TD.layoutRawText('x'.repeat(9) + '😀' + 'y', 10);
  assert.notEqual(pair.end[0], 10);
  assert.equal(pair.end[pair.count - 1], 12);
  for (let i = 1; i < pair.count; i++) assert.equal(pair.start[i], pair.end[i - 1]);
  assert.equal(TD.layoutRawText('one line').lineCount, 1);
  assert.equal(TD.layoutRawText('a\nb\nc').lineCount, 3);
});

test('rawBlocks groups rows into windowed blocks by row count and size', () => {
  const lines = TD.layoutRawText(Array.from({ length: 10 }, (_, i) => `line ${i}`).join('\n'), 100);
  assert.deepEqual(Array.from(TD.rawBlocks(lines, 4, 1_000)), [0, 4, 8, 10], 'at most 4 rows per block; the last entry is the row count');
  const long = TD.layoutRawText('a\n' + 'x'.repeat(30) + '\nb', 10);
  // Rows: "a", three 10-char segments, "b". A block stops before it would pass 12 characters.
  assert.deepEqual(Array.from(TD.rawBlocks(long, 64, 12)), [0, 2, 3, 5]);
  assert.deepEqual(Array.from(TD.rawBlocks(TD.layoutRawText(''), 64, 100)), [0, 1]);
  const pretty = TD.layoutRawText('{\n' + '  "k": 1,\n'.repeat(200_000) + '}');
  const blocks = TD.rawBlocks(pretty);
  assert.ok(blocks.length - 1 <= Math.ceil(pretty.count / TD.RAW_BLOCK_ROWS) + 1, '200,000 lines are a few thousand blocks');
  assert.equal(blocks[blocks.length - 1], pretty.count);
});

test('rowForOffset finds the row holding a text offset, end of input included', () => {
  const layout = TD.layoutRawText('a\nbc\n' + 'x'.repeat(25), 10);
  assert.equal(TD.rowForOffset(layout, 0), 0);
  assert.equal(TD.rowForOffset(layout, 3), 1);
  assert.equal(TD.rowForOffset(layout, 5), 2);
  assert.equal(TD.rowForOffset(layout, 16), 3);
  assert.equal(TD.rowForOffset(layout, 30), 4);
});

// ----------------------------------------------------- captured body model

test('responseBody keeps the captured text verbatim with its media type', () => {
  const body = CB.responseBody(apiEntry({ responseRaw: '{"b":1,"a":2}', responseHeaders: { 'Content-Type': 'Application/JSON; charset=utf-8' } }));
  assert.equal(body.kind, 'text');
  assert.equal(body.text, '{"b":1,"a":2}');
  assert.equal(body.contentType, 'application/json');
  assert.equal(body.truncation, null);
  assert.equal(body.legacyTruncation, false);
});

test('responseBody: truncation metadata is kept; a legacy in-band suffix becomes metadata', () => {
  const prefix = '[' + '1,'.repeat(10);
  const cut = CB.responseBody(apiEntry({ responseRaw: prefix, responseTruncated: { totalChars: 938_891, keptChars: prefix.length } }));
  assert.equal(cut.text, prefix);
  assert.deepEqual(cut.truncation, { totalChars: 938_891, keptChars: prefix.length });
  assert.equal(cut.legacyTruncation, false);

  // An imported file may predate J6 (it carries no version); a saved session is migrated by its
  // schema version instead (sessionEnvelope.ts), so only an imported entry is read for the suffix.
  const legacy = CB.responseBody(apiEntry({ imported: true, responseRaw: `${prefix}\n... truncated 688891 chars` }));
  assert.equal(legacy.text, prefix, 'the suffix is not part of the body');
  assert.deepEqual(legacy.truncation, { keptChars: prefix.length, totalChars: prefix.length + 688_891 });
  assert.equal(legacy.legacyTruncation, true);

  const mid = CB.responseBody(apiEntry({ imported: true, responseRaw: '"x\\n... truncated 5 chars and more"' }));
  assert.equal(mid.truncation, null, 'the phrase inside a body is just text');
});

test('J9 a captured body that ends like the old suffix is not read as cut (the suffix is keyed to imported data)', () => {
  const text = '{"log":"tail"}\n... truncated 12 chars';
  const live = CB.responseBody(apiEntry({ responseRaw: text }));
  assert.equal(live.text, text);
  assert.equal(live.truncation, null);
  assert.equal(live.legacyTruncation, false);
  const request = CB.requestBody(apiEntry({ method: 'POST', requestBody: text }));
  assert.equal(request.truncation, null);
  const decrypted = CB.responseBody(apiEntry({ responseDecrypted: text }));
  assert.equal(decrypted.truncation, null);
});

test('J9 cuts the saved session made: decrypted text, an unknown total, a FormData body saved without its fields', () => {
  const decrypted = CB.responseBody(apiEntry({ responseRaw: '{"enc":1}', responseDecrypted: '{"plain":', responseDecryptedTruncated: { totalChars: 90_000, keptChars: 9 } }));
  assert.equal(decrypted.decrypted, true);
  assert.deepEqual(decrypted.truncation, { totalChars: 90_000, keptChars: 9 });
  assert.equal(CB.truncationNotice(decrypted), 'Response truncated: showing the first 9 of 90,000 characters');
  assert.equal(CB.bodyDoc(decrypted), null, 'a cut body is not parsed as JSON');

  const unknown = CB.responseBody(apiEntry({ responseRaw: '{"a":', responseTruncated: { keptChars: 5 } }));
  assert.deepEqual(unknown.truncation, { keptChars: 5 });
  assert.equal(CB.truncationNotice(unknown), 'Response truncated: showing the first 5 characters');
  assert.equal(CB.responseBody(apiEntry({ responseRaw: '{}', responseTruncated: { keptChars: 'x' } })).truncation, null, 'malformed metadata is ignored');

  const form = CB.requestBody(apiEntry({ method: 'POST', requestBodyKind: 'formdata', requestBodyText: 'a=1\nb=2' }));
  assert.equal(form.format, 'text', 'without its fields a FormData body is its text rendering');
  assert.equal(form.text, 'a=1\nb=2');
});

test('responseBody: a decrypted body wins; binary and missing bodies are explicit', () => {
  const decrypted = CB.responseBody(apiEntry({ responseRaw: '{"enc":"x"}', responseDecrypted: '{"plain":1}' }));
  assert.equal(decrypted.kind, 'text');
  assert.equal(decrypted.text, '{"plain":1}');
  assert.equal(decrypted.decrypted, true);
  const object = CB.responseBody(apiEntry({ responseRaw: '{"enc":"x"}', responseDecrypted: { plain: 1 } }));
  assert.equal(object.kind, 'value');
  assert.deepEqual(object.value, { plain: 1 });
  const binary = { binary: true, size: 2048, base64Prefix: 'iVBORw0KGgo=' };
  const bytes = CB.responseBody(apiEntry({ responseRaw: null, responseBinary: binary }));
  assert.equal(bytes.kind, 'binary');
  assert.deepEqual(bytes.binary, binary);
  assert.equal(CB.responseBody(apiEntry({ responseRaw: null })).kind, 'none');
  const empty = CB.responseBody(apiEntry({ responseRaw: '' }));
  assert.equal(empty.kind, 'text');
  assert.equal(empty.text, '');
});

test('requestBody follows requestBodyKind (J4)', () => {
  const request = (fields) => CB.requestBody(apiEntry({ method: 'POST', requestHeaders: { 'Content-Type': 'application/json' }, ...fields }));
  const literal = request({ requestBodyKind: 'text', requestBodyText: 'null', requestBody: null });
  assert.equal(literal.kind, 'text', 'a "null" body is a body');
  assert.equal(literal.text, 'null');
  assert.equal(literal.contentType, 'application/json');
  const cut = request({ requestBodyKind: 'text', requestBodyText: '{"a":', requestTruncated: { totalChars: 60_000, keptChars: 5 } });
  assert.deepEqual(cut.truncation, { totalChars: 60_000, keptChars: 5 });
  const form = request({ requestBodyKind: 'urlencoded', requestBodyText: 'a=1&a=2', requestBody: 'a=1&a=2' });
  assert.equal(form.kind, 'text');
  assert.equal(form.format, 'urlencoded');
  assert.equal(form.text, 'a=1&a=2');
  const pairs = [['a', '1'], ['f', { file: 'x.png', size: 4, type: 'image/png' }]];
  const multipart = request({ requestBodyKind: 'formdata', requestBodyText: 'a=1\nf=[file "x.png", image/png, 4 bytes]', requestBody: pairs });
  assert.equal(multipart.format, 'formdata');
  assert.deepEqual(multipart.pairs, pairs);
  const binary = request({ requestBodyKind: 'binary', requestBody: { binary: true, size: 3, base64Prefix: 'AAEC' } });
  assert.equal(binary.kind, 'binary');
  assert.deepEqual(binary.binary, { binary: true, size: 3, base64Prefix: 'AAEC' });
  assert.equal(request({ requestBodyKind: 'none', requestBody: null }).kind, 'none');
});

test('entryBody picks the facet', () => {
  const entry = apiEntry({ method: 'POST', requestBodyKind: 'text', requestBodyText: '{"q":1}', responseRaw: '{"r":1}' });
  assert.equal(CB.entryBody(entry, 'request').text, '{"q":1}');
  assert.equal(CB.entryBody(entry, 'response').text, '{"r":1}');
  assert.equal(CB.entryBody(entry, 'request'), CB.requestBody(entry), 'one model per entry and facet');
});

test('bodyRawValue is what Copy raw gives when a body view fails: the captured text, never a legacy suffix', () => {
  const prefix = '[{"id":1},{"i';
  assert.equal(CB.bodyRawValue(CB.responseBody(apiEntry({ imported: true, responseRaw: `${prefix}\n... truncated 900 chars` }))), prefix);
  assert.equal(CB.bodyRawValue(CB.responseBody(apiEntry({ responseRaw: '{"b":1,"a":2}' }))), '{"b":1,"a":2}');
  assert.deepEqual(CB.bodyRawValue(CB.responseBody(apiEntry({ responseRaw: '{"e":1}', responseDecrypted: { plain: 1 } }))), { plain: 1 });
  const binary = { binary: true, size: 3, base64Prefix: 'AAEC' };
  assert.deepEqual(CB.bodyRawValue(CB.requestBody(apiEntry({ method: 'POST', requestBodyKind: 'binary', requestBody: binary }))), binary);
  assert.equal(CB.bodyRawValue(CB.requestBody(apiEntry({ method: 'POST', requestBodyKind: 'text', requestBodyText: 'null' }))), 'null');
  assert.equal(CB.bodyRawValue(CB.responseBody(apiEntry({ responseRaw: null }))), null);
});

test('a degraded capture is flagged on both facets', () => {
  const entry = apiEntry({ method: 'POST', captureDegraded: true, requestBodyKind: 'text', requestBodyText: '{}', responseRaw: '{}' });
  assert.equal(CB.responseBody(entry).degraded, true);
  assert.equal(CB.requestBody(entry).degraded, true);
  assert.equal(CB.responseBody(apiEntry({ responseRaw: '{}' })).degraded, undefined);
  assert.equal(CB.responseBody(apiEntry({ responseRaw: null, captureDegraded: true })).degraded, true, 'also when nothing of the body arrived');
});

test('requestBody reads sessions stored before J4', () => {
  const request = (requestBody) => CB.requestBody(apiEntry({ method: 'POST', imported: true, requestBody }));
  const text = request('{"q":1}');
  assert.equal(text.kind, 'text');
  assert.equal(text.text, '{"q":1}');
  const legacy = request('{"q":"' + 'x'.repeat(20) + '\n... truncated 70 chars');
  assert.equal(legacy.text, '{"q":"' + 'x'.repeat(20));
  assert.deepEqual(legacy.truncation, { keptChars: 26, totalChars: 96 });
  assert.equal(request({ q: 2 }).kind, 'value');
  assert.deepEqual(request({ q: 2 }).value, { q: 2 });
  assert.equal(request(false).kind, 'value');
  assert.equal(request(null).kind, 'none');
  assert.equal(request('').kind, 'none');
});

test('parsesAsJson: JSON types parse any text; other types only text that looks like JSON; truncated or empty never', () => {
  for (const type of ['application/json', 'application/problem+json', 'application/vnd.api+json', 'application/x-ndjson', 'application/jsonl', 'application/json-seq', 'text/json']) {
    assert.equal(CB.isJsonContentType(type), true, type);
  }
  for (const type of ['text/plain', 'text/html', 'application/xml', '']) assert.equal(CB.isJsonContentType(type), false, type);
  for (const text of ['{}', ' [1]', '"s"', '-1', '42', 'true', 'false', 'null', ")]}'\n{}", 'while(1);[]', '﻿ {"a":1}']) {
    assert.equal(CB.looksLikeJson(text), true, JSON.stringify(text));
  }
  for (const text of ['hello', 'NaN', '<html>', '', '   ', 'nullable', 'trueish']) assert.equal(CB.looksLikeJson(text), false, JSON.stringify(text));

  const body = (responseRaw, type, extra = {}) => CB.responseBody(apiEntry({ responseRaw, responseHeaders: { 'content-type': type }, ...extra }));
  assert.equal(CB.parsesAsJson(body('plain', 'application/json')), true, 'declared JSON is checked (Raw shows the error)');
  assert.equal(CB.parsesAsJson(body('plain', 'text/plain')), false);
  assert.equal(CB.parsesAsJson(body('42', 'text/plain')), true);
  assert.equal(CB.parsesAsJson(body('', 'application/json')), false);
  assert.equal(CB.parsesAsJson(body('[1,', 'application/json', { responseTruncated: { totalChars: 9, keptChars: 3 } })), false);
});

test('bodyDoc parses once per text and passes the content type', () => {
  const text = '{"shared":' + Math.random() + '}';
  const first = CB.bodyDoc(CB.responseBody(apiEntry({ responseRaw: text })));
  const second = CB.bodyDoc(CB.responseBody(apiEntry({ responseRaw: text })));
  assert.equal(first.ok, true);
  assert.equal(second, first, 'two entries with the same text share one doc');
  const ndjson = CB.bodyDoc(CB.responseBody(apiEntry({ responseRaw: '{"a":1}\n{"a":2}\n', responseHeaders: { 'content-type': 'application/x-ndjson' } })));
  assert.equal(ndjson.kind, 'ndjson');
  assert.equal(CB.bodyDoc(CB.responseBody(apiEntry({ responseRaw: 'hello', responseHeaders: { 'content-type': 'text/plain' } }))), null);
  const fresh = CB.responseBody(apiEntry({ responseRaw: '[' + Math.random() + ']' }));
  assert.equal(CB.peekBodyDoc(fresh), undefined, 'not parsed yet');
  CB.bodyDoc(fresh);
  assert.equal(CB.peekBodyDoc(fresh).ok, true);
  // One text read two ways (JSON and NDJSON by content type): both parses stay cached.
  const lines = `{"n":${Math.random()}}\n{"n":2}\n`;
  const asJson = CB.responseBody(apiEntry({ responseRaw: lines }));
  const asLines = CB.responseBody(apiEntry({ responseRaw: lines, responseHeaders: { 'content-type': 'application/x-ndjson' } }));
  const jsonDoc = CB.bodyDoc(asJson);
  const linesDoc = CB.bodyDoc(asLines);
  assert.equal(linesDoc.kind, 'ndjson');
  assert.equal(CB.peekBodyDoc(asJson), jsonDoc);
  assert.equal(CB.peekBodyDoc(asLines), linesDoc);
});

test('bodyNeedsDeferredParse: only a big body that is not parsed yet waits for an idle moment', () => {
  const big = CB.responseBody(apiEntry({ responseRaw: '[' + '0,'.repeat(CB.DEFER_PARSE_CHARS) + '0]' }));
  assert.equal(CB.bodyNeedsDeferredParse(big), true);
  CB.bodyDoc(big);
  assert.equal(CB.bodyNeedsDeferredParse(big), false, 'cached');
  assert.equal(CB.bodyNeedsDeferredParse(CB.responseBody(apiEntry({ responseRaw: '[1]' }))), false);
});

test('bodyValue is what entryResponse returns: a value for JSON, the text otherwise', () => {
  assert.deepEqual(CB.bodyValue(CB.responseBody(apiEntry({ responseRaw: '{"a":[1]}' }))), { a: [1] });
  assert.equal(CB.bodyValue(CB.responseBody(apiEntry({ responseRaw: 'hello', responseHeaders: { 'content-type': 'text/plain' } }))), 'hello');
  assert.equal(CB.bodyValue(CB.responseBody(apiEntry({ responseRaw: '' }))), null);
  assert.equal(CB.bodyValue(CB.responseBody(apiEntry({ responseRaw: null }))), null);
});

test('truncationNotice says what is shown out of what was sent', () => {
  const prefix = 'x'.repeat(250_000);
  assert.equal(
    CB.truncationNotice(CB.responseBody(apiEntry({ responseRaw: prefix, responseTruncated: { totalChars: 938_891, keptChars: 250_000 } }))),
    'Response truncated: showing the first 250,000 of 938,891 characters',
  );
  assert.equal(
    CB.truncationNotice(CB.requestBody(apiEntry({ method: 'POST', requestBodyKind: 'text', requestBodyText: 'y'.repeat(50_000), requestTruncated: { totalBytes: 1_000_000, keptChars: 50_000 } }))),
    'Request truncated: showing the first 50,000 characters of 1,000,000 bytes',
  );
  assert.equal(CB.truncationNotice(CB.responseBody(apiEntry({ responseRaw: '{}' }))), null);
});

test('formDataNode and urlEncodedNode keep field order and mark repeated names', () => {
  const form = CB.formDataNode([['a', '1'], ['f', { file: 'x.png', size: 4, type: 'image/png' }], ['a', '2']]);
  assert.equal(form.t, 'obj');
  assert.deepEqual(form.entries.map((entry) => [entry.key, entry.value.t, !!entry.dup]), [['a', 'str', false], ['f', 'obj', false], ['a', 'str', true]]);
  assert.deepEqual(form.entries[1].value.entries.map((entry) => [entry.key, entry.value.t]), [['file', 'str'], ['size', 'num'], ['type', 'str']]);
  const query = CB.urlEncodedNode('a=1&b=x+y&a=%20&c');
  assert.deepEqual(query.entries.map((entry) => [entry.key, entry.value.value, !!entry.dup]), [['a', '1', false], ['b', 'x y', false], ['a', ' ', true], ['c', '', false]]);
});

// --------------------------------------------------------------- Tree (J3)

const label = (row) => (row.type === 'node' ? `${row.depth}:${row.key ?? '$'}${row.dup ? '*' : ''}${row.open === true ? '+' : row.open === false ? '-' : ''}` : `${row.depth}:${row.type}`);
const state = (patch = {}) => ({ ...JT.defaultTreeState(), ...patch });

test('flattenJsonTree lists members in source order, marks duplicates and closes containers', () => {
  const { root } = parseJson('{"b":1,"a":2,"10":3,"2":4,"-1":5,"a":6}');
  assert.deepEqual(JT.flattenJsonTree(root, state()).map(label), ['0:$+', '1:b', '1:a', '1:10', '1:2', '1:-1', '1:a*', '0:close']);
  const { root: list } = parseJson('[true,{},[],null]');
  assert.deepEqual(JT.flattenJsonTree(list, state()).map(label), ['0:$+', '1:0', '1:1', '1:2', '1:3', '0:close'], 'empty containers have nothing to open');
  const { root: scalar } = parseJson('42');
  assert.deepEqual(JT.flattenJsonTree(scalar, state()).map(label), ['0:$']);
});

test('containers open to the default depth; Expand all, Collapse all and one toggle', () => {
  const { root } = parseJson('{"a":{"b":{"c":{"d":{"e":1}}}}}');
  assert.equal(JT.TREE_DEFAULT_OPEN_DEPTH, 4);
  assert.deepEqual(JT.flattenJsonTree(root, state()).map(label), ['0:$+', '1:a+', '2:b+', '3:c+', '4:d-', '3:close', '2:close', '1:close', '0:close']);
  assert.deepEqual(JT.flattenJsonTree(root, state({ all: true })).map(label), ['0:$+', '1:a+', '2:b+', '3:c+', '4:d+', '5:e', '4:close', '3:close', '2:close', '1:close', '0:close']);
  assert.deepEqual(JT.flattenJsonTree(root, state({ all: false })).map(label), ['0:$-']);
  const a = root.entries[0].value;
  assert.deepEqual(JT.flattenJsonTree(root, state({ overrides: new Map([[a, false]]) })).map(label), ['0:$+', '1:a-', '0:close']);
});

test('children come in chunks with a "more" row', () => {
  const { root } = parseJson(JSON.stringify(Array.from({ length: 250 }, (_, i) => i)));
  let rows = JT.flattenJsonTree(root, state());
  assert.equal(rows.length, 1 + JT.TREE_CHILD_CHUNK + 2);
  assert.deepEqual([rows.at(-2).type, rows.at(-2).hidden], ['more', 150]);
  rows = JT.flattenJsonTree(root, state({ shown: new Map([[root, 200]]) }));
  assert.equal(rows.filter((row) => row.type === 'node').length, 201);
  assert.equal(rows.at(-2).hidden, 50);
});

test('Expand all on 2,000 levels lists every level; 100,000 levels stop at the row budget', () => {
  const deep = (levels) => parseJson('['.repeat(levels) + ']'.repeat(levels)).root;
  const rows = JT.flattenJsonTree(deep(2_000), state({ all: true }));
  assert.equal(rows.length, 1_999 + 1 + 1_999);
  assert.equal(rows[1_999].type, 'node');
  assert.equal(rows[1_999].depth, 1_999);
  assert.equal(rows[1_999].open, null, 'the innermost [] is empty');

  const huge = deep(100_000);
  const cut = JT.flattenJsonTree(huge, state({ all: true }));
  assert.equal(cut.length, JT.TREE_ROW_BUDGET + 1);
  assert.equal(cut.at(-1).type, 'budget');
  assert.equal(JT.flattenJsonTree(huge, state({ all: true, budget: JT.TREE_ROW_BUDGET * 2 })).length, JT.TREE_ROW_BUDGET * 2 + 1);
});

test('numbers keep their lexeme; the hint says what JavaScript reads', () => {
  const { root } = parseJson('[9007199254740993, 1e400, -0, 1.0, 9007199254740992, 1E5]');
  assert.deepEqual(root.items.map((node) => JT.numberHint(node)), [
    'JavaScript reads this as 9007199254740992',
    'JavaScript reads this as Infinity',
    'JavaScript reads this as 0',
    null,
    null,
    null,
  ]);
});

test('containerSummary counts items and keys', () => {
  assert.equal(JT.containerSummary(parseJson('[1,2,3]').root), '3 items');
  assert.equal(JT.containerSummary(parseJson('[1]').root), '1 item');
  assert.equal(JT.containerSummary(parseJson('{"a":1}').root), '1 key');
  assert.equal(JT.containerSummary(parseJson('{"a":1,"a":2}').root), '2 keys');
});

test('nodeKey is stable across flattens and distinct for duplicate keys', () => {
  const { root } = parseJson('{"a":1,"a":1}');
  const keys = JT.flattenJsonTree(root, state()).map(JT.rowKey);
  assert.deepEqual(JT.flattenJsonTree(root, state()).map(JT.rowKey), keys);
  assert.equal(new Set(keys).size, keys.length);
});
