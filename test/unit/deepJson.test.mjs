/* Final fix C1: a deeply nested JSON body (8,000 levels, 16 KB, is enough; the spec's fixture is
 * 100,000) never throws on a panel path. Every path the panel runs for an entry — the session
 * index and search, the list's body flags, the response operations, schema drift and the
 * schema / TypeScript / Zod exports — stays iterative or bounded, and safeStringify never throws.
 * These run the panel's fallback paths (no XRAY_ConsoleHelpers, see harness.mjs).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { utils, sessionIndex as SI, globalSearch as G, entries as EN, operations as OPS, drift as DR, exportModel as X, apiEntry, assertSchemaFallback } from './harness.mjs';

const { parseJson, printJson, fromValue } = await import('../../src/panel/models/jsonText.ts');

const DEPTH = 100_000;
const deepText = (depth = DEPTH) => '['.repeat(depth) + ']'.repeat(depth);
const deepValue = (depth = DEPTH) => {
  let value = [];
  for (let i = 1; i < depth; i++) value = [value];
  return value;
};
const deepEntry = (overrides = {}) => apiEntry({ url: 'https://x.test/deep', urlPath: '/deep', size: DEPTH * 2, responseRaw: deepText(), ...overrides });

test('safeStringify never throws: a value too deep for JSON.stringify (and String) becomes a marker', () => {
  const text = utils.safeStringify(deepValue(), 0, 20_000);
  assert.equal(typeof text, 'string');
  assert.equal(text, '[unserializable]');
  assert.equal(utils.safeStringify({ a: 1 }, 0), '{"a":1}', 'ordinary values are unchanged');
});

test('printJson { decoded: true } prints strings and keys from their values, numbers as written, at any depth', () => {
  const doc = parseJson('{"caf\\u00e9": "\\u00e9t\\u00e9 \\"q\\"", "n": 1.0, "id": 9007199254740993, "e": 1E5, "dup": 1, "dup": 2}');
  assert.equal(printJson(doc.root), '{"caf\\u00e9":"\\u00e9t\\u00e9 \\"q\\"","n":1.0,"id":9007199254740993,"e":1E5,"dup":1,"dup":2}', 'default: as written');
  assert.equal(printJson(doc.root, { decoded: true }), '{"café":"été \\"q\\"","n":1.0,"id":9007199254740993,"e":1E5,"dup":1,"dup":2}');
  assert.equal(printJson(doc.root, { decoded: true, indent: 2 }).split('\n')[1], '  "café": "été \\"q\\"",', 'pretty too');
  const deep = parseJson(deepText());
  assert.ok(deep.ok);
  assert.equal(printJson(deep.root, { decoded: true }).length, DEPTH * 2, 'iterative: 100,000 levels');
});

test('the session index and search read a 100,000-deep body without throwing (response, decrypted value, request)', () => {
  const response = deepEntry();
  const decrypted = deepEntry({ responseRaw: 'cipher', responseDecrypted: deepValue() });
  const request = deepEntry({ method: 'POST', requestHeaders: { 'content-type': 'application/json' }, requestBodyKind: 'text', requestBodyText: deepText(), responseRaw: '{}' });
  const index = SI.buildSessionIndex([response, decrypted, request]);
  assert.equal(index.searchDocuments.size, 3);
  const fields = (entry) => SI.entrySearchFields(entry).filter(([label]) => label.endsWith('body'));
  assert.deepEqual(fields(response).map(([label, text]) => [label, text.length]), [['Response body', SI.SEARCH_FIELD_SCAN_CHARS]],
    'the captured text (cut to the scan limit); its compact print is the same text');
  assert.deepEqual(fields(decrypted).map(([label, text]) => [label, text.length]), [['Response body', SI.SEARCH_FIELD_SCAN_CHARS]],
    'a value-only body is its compact print, built iteratively');
  assert.deepEqual(fields(request).map(([label, text]) => [label, text.length]), [['Request body', SI.SEARCH_FIELD_SCAN_CHARS], ['Response body', 2]]);
  // Newest first: the request, the decrypted value, the response.
  assert.deepEqual(G.searchEntries([response, decrypted, request], '[[[[').matches.map((match) => match.field), ['Request body', 'Response body', 'Response body']);
});

test('search still finds decoded text and lexemes through the iterative compact print', () => {
  const entry = apiEntry({ responseRaw: '{\n  "s": "\\u00e9t\\u00e9",\n  "id": 9007199254740993,\n  "k\\u00e9y": 1\n}' });
  const find = (query) => G.searchEntries([entry], query).matches.map((match) => match.field);
  assert.deepEqual(find('été'), ['Response body']);
  assert.deepEqual(find('"kéy":1'), ['Response body'], 'decoded keys, compact');
  assert.deepEqual(find('9007199254740993'), ['Response body']);
  assert.deepEqual(find('9007199254740992'), [], 'never a rounded number');
  const pairs = apiEntry({ method: 'POST', requestBodyKind: 'formdata', requestBodyText: 'user=bøb', requestBody: [['user', 'bøb']], responseRaw: '{}' });
  assert.deepEqual(SI.entrySearchFields(pairs).filter(([label]) => label === 'Request body').map(([, text]) => text), ['user=bøb', '[["user","bøb"]]'],
    'FormData: its text and its fields, as before');
});

test('list flags, operations, drift and exports handle a 100,000-deep body', () => {
  assertSchemaFallback(assert);
  const entry = deepEntry();
  const decrypted = deepEntry({ size: 10, responseRaw: 'cipher', responseDecrypted: deepValue() });
  assert.deepEqual(EN.getEntryFlags(decrypted, [decrypted]), [], 'body flags of a value-only body (measured by its JSON)');
  const previous = deepEntry({ id: 'prev', timestamp: entry.timestamp - 1000, responseRaw: '[]' });
  const ops = OPS.getResponseOperations(entry, [previous, entry]);
  assert.ok(ops.some((op) => op.id === 'schema'), 'the drift check (schema of each response) runs');
  assert.equal(typeof DR.schemaSignature(deepEntry({ id: 'sig' })), 'string');
  // The fallback schema stops typing at the console helpers' depth (5), so a deep body has a shape.
  assert.equal(X.exportText(entry, [entry], 'typescript'), 'export type XrayResponse = unknown[][][][][][];');
  assert.match(X.exportText(entry, [entry], 'zod'), /= z\.array\(z\.array\(z\.array\(z\.array\(z\.array\(z\.array\(z\.unknown\(\)\)\)\)\)\)\);$/);
  assert.equal(X.exportText(entry, [entry], 'schema'), JSON.stringify([[[[[['any']]]]]], null, 2));
});

test('schema / TypeScript / Zod exports say when a value is too deeply nested instead of throwing', () => {
  // A stack overflow is a RangeError; this value raises one while its type is inferred.
  const overflowing = { get items() { throw new RangeError('Maximum call stack size exceeded'); } };
  const entry = apiEntry({ responseRaw: 'cipher', responseDecrypted: overflowing });
  assert.equal(X.exportText(entry, [entry], 'typescript'), '// The response is too deeply nested to export as TypeScript.');
  assert.equal(X.exportText(entry, [entry], 'zod'), '// The response is too deeply nested to export as a Zod schema.');
  assert.equal(X.exportText(entry, [entry], 'schema'), '// The response is too deeply nested to export as a schema.');
  const other = apiEntry({ responseRaw: 'cipher', responseDecrypted: { get items() { throw new TypeError('not a depth problem'); } } });
  assert.throws(() => X.exportText(other, [other], 'typescript'), TypeError, 'only a stack overflow is reported as depth');
});

test('fromValue + decoded print equals the old compact JSON for ordinary values (search compact form unchanged)', () => {
  for (const value of [{ a: 1, b: [true, null, 'x'] }, [{ id: 1 }, { id: 2 }], { 'é': 'ü' }]) {
    assert.equal(printJson(fromValue(value), { decoded: true }), JSON.stringify(value));
  }
});

test('a rebuilt index reuses the search document of every unchanged entry (each capture rebuilds it)', () => {
  // Entries are immutable (an update mints a new object), so an unchanged entry's document — its body
  // texts and compact print included — is computed once, not on every capture.
  const a = apiEntry({ responseRaw: '{"a":1}' });
  const b = apiEntry({ responseRaw: deepText(2_000) });
  const first = SI.buildSessionIndex([a, b]);
  const c = apiEntry({ responseRaw: '{"c":3}' });
  const second = SI.buildSessionIndex([a, b, c]);
  assert.equal(second.searchDocuments.get(a.id), first.searchDocuments.get(a.id), 'same document object for an unchanged entry');
  assert.equal(second.searchDocuments.get(b.id), first.searchDocuments.get(b.id));
  assert.ok(second.searchDocuments.get(c.id), 'the new entry gets one');
  const updated = { ...a, status: 500 };
  const third = SI.buildSessionIndex([updated, b, c]);
  assert.notEqual(third.searchDocuments.get(a.id), first.searchDocuments.get(a.id), 'an updated entry (a new object) is indexed again');
  assert.equal(third.searchDocuments.get(a.id).entry, updated);
  assert.equal(third.searchDocuments.get(b.id), first.searchDocuments.get(b.id));
});

test('a JSON text already in its compact print (no escape, nothing at or below a space outside strings) is searched once, as itself', () => {
  const bodyTexts = (responseRaw) => SI.entrySearchFields(apiEntry({ responseRaw })).filter(([label]) => label === 'Response body').map(([, text]) => text);
  assert.deepEqual(bodyTexts('{"name":"item 1","n":1.0,"id":9007199254740993}'), ['{"name":"item 1","n":1.0,"id":9007199254740993}'], 'its print would be the same text');
  assert.deepEqual(bodyTexts('{"a": 1}'), ['{"a": 1}', '{"a":1}'], 'spacing outside strings: the compact print too');
  assert.deepEqual(bodyTexts('{"s":"\\u00e9"}'), ['{"s":"\\u00e9"}', '{"s":"é"}'], 'an escape: the decoded print too');
  assert.deepEqual(bodyTexts('{"a":1}\n{"a":2}'), ['{"a":1}\n{"a":2}', '[{"a":1},{"a":2}]'], 'NDJSON: the documents as one list');
  const ndjson = apiEntry({ responseHeaders: { 'content-type': 'application/x-ndjson' }, responseRaw: '{"a":1}' });
  assert.deepEqual(SI.entrySearchFields(ndjson).filter(([label]) => label === 'Response body').map(([, text]) => text), ['{"a":1}', '[{"a":1}]'],
    'a one-line NDJSON body is a list of one document');
});

// ------------------------------------------- addendum: a deep request body stored only as a value
// An entry saved before J4, or imported from a session file, keeps its request body as a value with no
// kind or text. Selecting it builds Copy cURL / Copy fetch during render, and JSON.stringify of a value
// nested 100,000 deep overflowed the stack there.
const deepValueEntry = () => apiEntry({ method: 'POST', url: 'https://x.test/old', urlPath: '/old', requestHeaders: { 'x-a': '1' },
  requestBodyKind: undefined, requestBodyText: undefined, requestBody: { data: deepValue() }, responseRaw: '{"ok":true}' });
const TOO_DEEP = 'the request body is nested too deeply to print as JSON, so it is left out';

test('Addendum: Copy cURL / fetch of a request value too deep for JSON.stringify say so instead of throwing', () => {
  assertSchemaFallback(assert);
  const entry = deepValueEntry();
  assert.equal(utils.buildCurl(entry), [`# Partial: ${TOO_DEEP}.`, "curl 'https://x.test/old' \\", "  -X 'POST' \\", "  -H 'x-a: 1'"].join('\n'));
  assert.equal(utils.buildFetch(entry), `// Partial: ${TOO_DEEP}.\nfetch("https://x.test/old", {\n  "method": "POST",\n  "headers": {\n    "x-a": "1"\n  }\n})`);
  // The render path that selecting the entry runs, and every request export.
  assert.ok(OPS.getResponseOperations(entry, [entry]).some((op) => op.id === 'copy-curl'));
  for (const format of ['curl', 'fetch', 'axios', 'playwright']) assert.equal(typeof X.exportText(entry, [entry], format), 'string', format);
  // A value JSON.stringify can print is sent as its JSON, as before.
  assert.ok(utils.buildCurl({ ...entry, requestBody: { a: [1, 2] } }).endsWith(`--data-raw '{"a":[1,2]}'`));
});
