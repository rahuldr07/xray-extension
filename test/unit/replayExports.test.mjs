/* JSON fidelity Task 9 (spec J10, audit #3, #5, #19, #27, #29): Replay sends the request text that
   was captured, and every export embeds bodies exactly — lexemes as written, members in source order.

   Entries are shaped as capture leaves them after a session save: requestBodyText verbatim beside a
   parsed `requestBody` copy that JSON.parse rounded and chrome.storage key-sorted (Task 8 carry), so a
   surface that still reads the copy fails here. Runs against the local fallbacks (no
   XRAY_ConsoleHelpers), like the rest of the export suite. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { exportModel as E, importModel as I, utils as U, apiEntry, assertSchemaFallback } from './harness.mjs';

const { parseJson, printJson } = await import('../../src/panel/models/jsonText.ts');
const replayBodyUrl = new URL('../../src/panel/models/replayBody.ts', import.meta.url);
const replayModel = existsSync(replayBodyUrl) ? await import(replayBodyUrl.href) : {};
const ai = await import('../../src/panel/models/aiContext.ts');

// The audit's request fixtures (#5) plus the empty body (J4: distinct from no body).
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

// Response fixtures: integer-like keys after others, unsafe integers, lexemes JSON.parse forgets.
const RESPONSES = {
  order: '{"z":1,"10":2,"2":3,"a":4}',
  bigint: '{"id":9007199254740993,"neg":-9007199254740993,"big":12345678901234567890}',
  lexemes: '[1.0,1E5,-0,1e400,5e-324]',
  dup: '{"a":1,"a":2}',
  pretty: '{\n  "b": [\n    1,\n    2\n  ],\n  "a": true\n}',
};

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortKeys(value[key])]));
  return value;
}

/** The parsed copy as JSON.parse and chrome.storage leave it: rounded, keys sorted. */
function storedCopy(text) {
  try { return sortKeys(JSON.parse(text)); } catch { return text; }
}

function captured(text, extra = {}) {
  return apiEntry({
    method: 'POST', url: 'https://api.test/echo', urlPath: '/echo',
    requestHeaders: { 'Content-Type': 'application/json' },
    requestBodyKind: text === null ? 'none' : 'text',
    ...(text === null ? {} : { requestBodyText: text }),
    requestBody: text === null ? null : storedCopy(text),
    ...extra,
  });
}

/** A member of a parsed object node by key path (the lossless parse of an export's output). */
function member(node, ...keys) {
  let current = node;
  for (const key of keys) {
    if (typeof key === 'number') current = current?.t === 'arr' ? current.items[key] : undefined;
    else current = current?.t === 'obj' ? current.entries.find((item) => item.key === key)?.value : undefined;
  }
  return current;
}

function lossless(text) {
  const doc = parseJson(text);
  assert.ok(doc.ok, `export output is JSON: ${doc.error?.message}`);
  return doc.root;
}

// ---------------------------------------------------------------- replay body

test('J10 replay body: the captured request text, verbatim, for every request fixture', () => {
  assert.equal(typeof replayModel.replayBody, 'function', 'src/panel/models/replayBody.ts exports replayBody');
  for (const [name, text] of Object.entries(REQUEST_TEXTS)) {
    assert.deepEqual(replayModel.replayBody(captured(text)), { text, exact: true, reason: null }, name);
  }
  assert.deepEqual(replayModel.replayBody(captured(null)), { text: null, exact: true, reason: null }, 'no body');
  const urlencoded = captured('a=1&b=two%20words', { requestBodyKind: 'urlencoded', requestBody: 'a=1&b=two%20words' });
  assert.equal(replayModel.replayBody(urlencoded).text, 'a=1&b=two%20words');
});

test('J10 replay body: what cannot be sent as captured says so instead of being sent silently', () => {
  assert.equal(typeof replayModel.replayBody, 'function');
  const cut = replayModel.replayBody(captured('{"a":"' + 'x'.repeat(49_994), { requestTruncated: { totalChars: 60_000, keptChars: 50_000 } }));
  assert.equal(cut.exact, false);
  assert.match(cut.reason, /cut at capture/i);
  assert.match(cut.reason, /50,000 of 60,000/);
  assert.equal(cut.text.length, 50_000, 'the kept text is still what the editor shows');
  // A form with a file field: the file was never captured (fix round 1 ruling).
  const form = replayModel.replayBody(captured('a=1\nf=[file "a.png", image/png, 4 bytes]', { requestBodyKind: 'formdata',
    requestBody: [['a', '1'], ['f', { file: 'a.png', size: 4, type: 'image/png' }]] }));
  assert.equal(form.exact, false);
  assert.match(form.reason, /FormData with file fields; the files were not captured/);
  assert.equal(form.form, undefined);
  const binary = replayModel.replayBody(apiEntry({ method: 'POST', requestBodyKind: 'binary', requestBody: { binary: true, size: 5, base64Prefix: 'AAAA' } }));
  assert.equal(binary.exact, false);
  assert.equal(binary.text, null);
  for (const result of [cut, form, binary]) assert.ok(result.reason.length <= 160 && !/[\r\n]/.test(result.reason));
  assert.equal(form.editHint, false, 'no invitation to edit a file form into a text body');
  assert.equal(cut.editHint, true);
  assert.equal(binary.editHint, true);
});

test('J10 replay body: an entry saved before J4 (a parsed value, no text) is printed from its value', () => {
  assert.equal(typeof replayModel.replayBody, 'function');
  const body = (requestBody) => replayModel.replayBody(apiEntry({ method: 'POST', requestBody })).text;
  assert.equal(body({ a: 1, list: [true, null] }), '{"a":1,"list":[true,null]}');
  assert.equal(body(false), 'false', 'false is a body (audit #5)');
  assert.equal(body(0), '0');
  assert.equal(body('raw text'), 'raw text');
  assert.equal(body(null), null);
});

// ---------------------------------------------------------------- HAR

test('J10 HAR: postData.text is the request text and content.text the response text, exactly', () => {
  for (const [name, text] of Object.entries(REQUEST_TEXTS)) {
    const har = JSON.parse(E.buildSessionHar([captured(text, { responseRaw: '{"ok":true}' })]));
    const request = har.log.entries[0].request;
    assert.equal(request.postData?.text, text, `${name}: postData.text`);
    assert.equal(request.postData.mimeType, 'application/json', name);
  }
  const none = JSON.parse(E.buildSessionHar([captured(null)]));
  assert.equal(none.log.entries[0].request.postData, undefined, 'no body: no postData');
  assert.equal(none.log.entries[0].request.bodySize, 0);
  for (const [name, raw] of Object.entries(RESPONSES)) {
    const har = JSON.parse(E.buildSessionHar([apiEntry({ responseRaw: raw })]));
    assert.equal(har.log.entries[0].response.content.text, raw, `${name}: content.text`);
  }
});

test('J10 HAR: mimeType comes from the headers whatever their case', () => {
  const entry = apiEntry({ responseHeaders: { 'CONTENT-TYPE': 'text/plain; charset=utf-8' }, contentType: undefined, responseRaw: 'plain' });
  const har = JSON.parse(E.buildSessionHar([entry]));
  assert.equal(har.log.entries[0].response.content.mimeType, 'text/plain; charset=utf-8');
});

test('J10 HAR: a re-import restores every body exactly (twice round)', () => {
  const originals = [
    ...Object.values(REQUEST_TEXTS).map((text) => captured(text, { responseRaw: RESPONSES.bigint })),
    ...Object.values(RESPONSES).map((raw) => captured('{"q":1}', { responseRaw: raw })),
  ];
  const once = I.parseImport(E.buildSessionHar(originals)).entries;
  const twice = I.parseImport(E.buildSessionHar(once)).entries;
  for (const restored of [once, twice]) {
    assert.equal(restored.length, originals.length);
    restored.forEach((entry, index) => {
      assert.equal(entry.requestBodyText, originals[index].requestBodyText, `request ${index}`);
      assert.equal(entry.responseRaw, originals[index].responseRaw, `response ${index}`);
    });
  }
});

test('J10 HAR import keeps postData.text verbatim as the request text', () => {
  const text = '{\n  "b": 1,\n  "id": 9007199254740993\n}';
  const har = { log: { entries: [{ request: { method: 'POST', url: 'https://x.test/a', postData: { mimeType: 'application/json', text } }, response: { status: 200 } }] } };
  const [entry] = I.parseImport(JSON.stringify(har)).entries;
  assert.equal(entry.requestBodyText, text);
  assert.equal(entry.requestBodyKind, 'text');
  assert.equal(U.entryRequest(entry).id.raw, '9007199254740993', 'views read the text losslessly');
});

// ---------------------------------------------------------------- Selected JSON, Mock, Jest, MSW

const RICH_REQUEST = '{"z":1,"10":2,"2":3,"id":9007199254740993,"f":1.0}';
const RICH_RESPONSE = '{"z":1,"10":2,"2":3,"id":9007199254740993,"f":1.0,"e":1E5,"neg":-0,"d":1,"d":2}';

test('J10 Selected JSON embeds the response and request bodies exactly (lexemes, order, duplicates)', () => {
  const entry = captured(RICH_REQUEST, { responseRaw: RICH_RESPONSE });
  const text = E.exportText(entry, [entry], 'json');
  assert.doesNotThrow(() => JSON.parse(text), 'still JSON');
  const root = lossless(text);
  assert.equal(printJson(member(root, 'response')), RICH_RESPONSE);
  assert.equal(printJson(member(root, 'entry', 'requestBody')), RICH_REQUEST);
  assert.equal(member(root, 'entry', 'requestBodyText').value, RICH_REQUEST);
  assert.match(text, /"id": 9007199254740993/);
});

test('J10 Mock embeds the response exactly, and the Copy mock JSON text is the same', () => {
  const entry = captured('{}', { responseRaw: RICH_RESPONSE, status: 201 });
  const text = E.exportText(entry, [entry], 'mock');
  const root = lossless(text);
  assert.equal(printJson(member(root, 'response')), RICH_RESPONSE);
  assert.equal(member(root, 'status').raw, '201');
  assert.equal(U.buildMockPayload(entry), text);
  assert.equal(JSON.parse(U.buildMockPayload(null)), '// Select an API request first');
});

test('J10 Jest and MSW embed the response with printJson, and Jest text() is the captured text', () => {
  const entry = captured('{}', { responseRaw: RICH_RESPONSE });
  const pretty = printJson(parseJson(RICH_RESPONSE).root, { indent: 2 });
  const jest = E.exportText(entry, [entry], 'jest');
  assert.ok(jest.includes(`json: async () => (${pretty})`), 'Jest json() embeds the lossless print');
  assert.ok(jest.includes(`text: async () => ${JSON.stringify(RICH_RESPONSE)}`), 'Jest text() is the captured text');
  const msw = E.exportText(entry, [entry], 'msw');
  assert.ok(msw.includes(`HttpResponse.json(${pretty}, `), 'MSW embeds the lossless print');
  const plain = apiEntry({ responseHeaders: { 'content-type': 'text/csv' }, responseRaw: 'a,b\n9007199254740993,2' });
  assert.ok(E.exportText(plain, [plain], 'msw').includes(`new HttpResponse(${JSON.stringify('a,b\n9007199254740993,2')}, `));
});

// ---------------------------------------------------------------- request code

test('J10 cURL and fetch send the raw request text, false and null bodies included', () => {
  assertSchemaFallback(assert);
  for (const [name, text] of Object.entries(REQUEST_TEXTS)) {
    const entry = captured(text);
    const quoted = `'${text.replace(/'/g, "'\\''")}'`;
    assert.ok(U.buildCurl(entry).endsWith(` \\\n  --data-raw ${quoted}`), `${name}: cURL --data-raw`);
    const fetchText = U.buildFetch(entry);
    const options = JSON.parse(fetchText.slice(fetchText.indexOf(', ') + 2, -1));
    assert.equal(options.body, text, `${name}: fetch body`);
  }
  assert.ok(!U.buildCurl(captured(null)).includes('--data-raw'), 'no body: no --data-raw');
  // An entry saved before J4 keeps its parsed value only: false is still a body.
  assert.ok(U.buildCurl(apiEntry({ method: 'POST', requestBody: false })).endsWith("--data-raw 'false'"));
});

test('J10 Axios and Playwright send the raw request text as data', () => {
  for (const [name, text] of Object.entries(REQUEST_TEXTS)) {
    if (text === '') continue;
    const entry = captured(text);
    const axios = E.buildAxios(entry);
    const options = JSON.parse(axios.slice(axios.indexOf('axios(') + 6, axios.lastIndexOf(')')));
    assert.equal(options.data, text, `${name}: Axios data`);
    const playwright = E.exportText(entry, [entry], 'playwright');
    const args = playwright.slice(playwright.indexOf('request.post(') + 'request.post('.length, playwright.indexOf(');\n'));
    const playwrightOptions = JSON.parse(args.slice(args.indexOf(', ') + 2));
    assert.equal(playwrightOptions.data, text, `${name}: Playwright data`);
  }
});

// ---------------------------------------------------------------- share-safe

const SAFE_REQUEST = '{"z":1,"password":"private-pw","id":9007199254740993,"10":1,"2":2,"f":1.0,"link":"/next?token=private-q"}';
const SAFE_RESPONSE = '{"token":"private-tok","id":12345678901234567890,"b":1,"a":2,"items":[{"n":-0,"e":1E5}]}';

function safeEntry() {
  return captured(SAFE_REQUEST, {
    responseRaw: SAFE_RESPONSE,
    wsFrames: [{ dir: 'in', ts: 1, size: 40, preview: '{"n":9007199254740993,"secret":"private-s","b":1,"a":2}' }],
  });
}

test('J10 share-safe JSON redacts over the lossless parse and prints it: digits, lexemes and order kept', () => {
  const { text } = E.buildShareSafeExport([safeEntry()], 'session-json-safe');
  assert.doesNotMatch(text, /private-/);
  const entry = member(lossless(text), 'entries', 0);
  assert.equal(printJson(member(entry, 'requestBody')),
    '{"z":1,"password":"[REDACTED]","id":9007199254740993,"10":1,"2":2,"f":1.0,"link":"/next?token=%5BREDACTED%5D"}');
  assert.equal(printJson(member(entry, 'response')),
    '{"token":"[REDACTED]","id":12345678901234567890,"b":1,"a":2,"items":[{"n":-0,"e":1E5}]}');
  assert.equal(member(entry, 'wsFrames', 0, 'preview').value, '{"n":9007199254740993,"secret":"[REDACTED]","b":1,"a":2}');
});

test('J10 share-safe HAR prints the redacted bodies losslessly', () => {
  const { text } = E.buildShareSafeExport([safeEntry()], 'session-har-safe');
  assert.doesNotMatch(text, /private-/);
  const har = JSON.parse(text);
  assert.equal(har.log.entries[0].response.content.text, '{"token":"[REDACTED]","id":12345678901234567890,"b":1,"a":2,"items":[{"n":-0,"e":1E5}]}');
  assert.equal(har.log.entries[0].request.postData.text,
    '{"z":1,"password":"[REDACTED]","id":9007199254740993,"10":1,"2":2,"f":1.0,"link":"/next?token=%5BREDACTED%5D"}');
});

test('J10 share-safe projection still hands out plain values, the integer kept as written', () => {
  const result = E.buildShareSafeSession([safeEntry()]);
  const body = result.entries[0].requestBody;
  assert.equal(body.password, '[REDACTED]');
  assert.equal(body.z, 1);
  assert.equal(String(body.id), '9007199254740993');
  assert.doesNotMatch(JSON.stringify(result), /private-|9007199254740992/);
  assert.ok(result.redactedCount >= 4, `redactions counted: ${result.redactedCount}`);
});

// ---------------------------------------------------------------- AI prompt

test('J10 the AI prompt reads the request text, not the stored parsed copy', () => {
  const entry = captured('{"b":1,"id":9007199254740993,"password":"private-pw"}');
  const destination = ai.aiDestination({ provider: 'anthropic', model: 'm', baseUrl: '', authHeader: '', authPrefix: '' });
  const { prompt } = ai.prepareAiContext(entry, [], { headers: false, requestBody: true, responseBody: false }, destination);
  assert.match(prompt, /"id": 9007199254740993/);
  assert.doesNotMatch(prompt, /9007199254740992|private-pw/);
  const body = prompt.slice(prompt.indexOf('"requestBody"'));
  assert.ok(body.indexOf('"b"') < body.indexOf('"id"'), 'source order');
});

// ---------------------------------------------------------------- edges

test('J10 replay body: a cut known only in bytes, or with no total, still says so', () => {
  assert.equal(typeof replayModel.replayBody, 'function');
  const bytes = replayModel.replayBody(captured('{"a":', { requestTruncated: { totalBytes: 300_000, keptChars: 5 } }));
  assert.match(bytes.reason, /cut at capture \(5 characters of 300,000 bytes kept\)/);
  const unknown = replayModel.replayBody(captured('{"a":', { requestTruncated: { keptChars: 5 } }));
  assert.match(unknown.reason, /cut at capture \(5 characters kept\)/);
  const stream = replayModel.replayBody(apiEntry({ method: 'POST', requestBodyKind: 'binary', requestBody: { binary: true, stream: true } }));
  assert.equal(stream.exact, false);
});

test('J10 the value a plan is made from: objects parsed losslessly, every other body kept as its text or shape', () => {
  const { capturedPlanValue, planValueOfText } = replayModel;
  assert.equal(String(planValueOfText('{"id":9007199254740993}').id), '9007199254740993');
  for (const text of ['"hello"', '"{\\"a\\":1}"', 'null', 'false', '42', 'not json', '']) assert.equal(planValueOfText(text), text);
  assert.equal(capturedPlanValue(apiEntry({ requestBody: undefined })), undefined, 'no body field at all');
  assert.equal(capturedPlanValue(captured(null)), null, 'no body');
  assert.deepEqual(capturedPlanValue(captured('[1,{"b":2}]')), [1, { b: 2 }]);
  assert.equal(capturedPlanValue(captured('null')), 'null');
  assert.equal(capturedPlanValue(captured('{"a":', { requestTruncated: { totalChars: 60_000, keptChars: 5 } })), '{"a":', 'a cut text stays text');
  assert.equal(capturedPlanValue(captured('a=1', { requestBodyKind: 'urlencoded', requestBody: 'a=1' })), 'a=1');
  assert.deepEqual(capturedPlanValue(captured('a=1', { requestBodyKind: 'formdata', requestBody: [['a', '1']] })), [['a', '1']]);
  assert.deepEqual(capturedPlanValue(apiEntry({ requestBodyKind: 'binary', requestBody: { binary: true, size: 1, base64Prefix: 'AA==' } })), { binary: true, size: 1, base64Prefix: 'AA==' });
  assert.deepEqual(capturedPlanValue(apiEntry({ requestBody: { legacy: true } })), { legacy: true }, 'saved before J4: its value');
});

test('J10 Selected JSON adds the request body from the text when the entry kept no parsed copy', () => {
  const entry = captured(RICH_REQUEST, { responseRaw: '{}' });
  delete entry.requestBody;
  assert.equal(printJson(member(lossless(E.exportText(entry, [entry], 'json')), 'entry', 'requestBody')), RICH_REQUEST);
});

test('J10 share-safe: a text body past the snapshot budgets is omitted whole, as a value body is', () => {
  const deep = '[[[[[[[[1]]]]]]]]';
  const wide = JSON.stringify(Array.from({ length: 1_500 }, (_, i) => i));
  for (const text of [deep, wide]) {
    const result = E.buildShareSafeSession([captured(text)]);
    assert.equal(result.entries[0].requestBody, '[OMITTED]', text.slice(0, 20));
    assert.ok(result.omittedCount >= 1);
  }
});

test('J10 replay body: a body the capture could not read (degraded, no kind recorded) is not "no body"', () => {
  assert.equal(typeof replayModel.replayBody, 'function');
  const unread = replayModel.replayBody(apiEntry({ method: 'POST', requestBody: null, captureDegraded: true }));
  assert.equal(unread.exact, false);
  assert.match(unread.reason, /could not be read at capture/);
  // A degraded entry whose request had no body (a GET whose response read failed) is still no body.
  assert.deepEqual(replayModel.replayBody(apiEntry({ requestBodyKind: 'none', requestBody: null, captureDegraded: true })), { text: null, exact: true, reason: null });
});

// ---------------------------------------------------------------- FormData (fix round 1 ruling)

const TEXT_PAIRS = [['a', '1'], ['b', 'two words'], ['a', '3'], ['note', 'line 1\nline 2 = é']];
const textForm = (extra = {}) => captured('a=1\nb=two words\na=3\nnote=line 1\nline 2 = é', {
  requestBodyKind: 'formdata', requestBody: TEXT_PAIRS.map((pair) => [...pair]),
  requestHeaders: { 'Content-Type': 'multipart/form-data; boundary=----captured' }, ...extra });

test('Fix1 replay body: a FormData of text fields replays as its fields, names, values and order kept', () => {
  assert.deepEqual(replayModel.replayBody(textForm()), {
    text: 'a=1\nb=two words\na=3\nnote=line 1\nline 2 = é', form: TEXT_PAIRS, exact: true, reason: null,
  });
});

test('Fix1 replay body: a cut form, a form saved without its fields, or one past the field bound is refused with its reason', () => {
  const cut = replayModel.replayBody(textForm({ requestTruncated: { totalChars: 70_000, keptChars: 50_000 } }));
  assert.equal(cut.exact, false);
  assert.match(cut.reason, /cut at capture/);
  assert.equal(cut.form, undefined);
  const unsaved = replayModel.replayBody(textForm({ requestBody: undefined }));
  assert.equal(unsaved.exact, false);
  assert.match(unsaved.reason, /fields were not kept/);
  const many = Array.from({ length: 1_001 }, (_, i) => [`f${i}`, 'v']);
  const tooMany = replayModel.replayBody(textForm({ requestBody: many }));
  assert.equal(tooMany.exact, false);
  assert.match(tooMany.reason, /more than 1,000 fields/);
  for (const result of [cut, unsaved, tooMany]) assert.equal(result.editHint, false, 'a form refusal never invites an edit into text');
});

test('Fix1 the plan value of a FormData redacts fields under sensitive names, like object keys', () => {
  const entry = textForm({ requestBody: [['user', 'ada'], ['password', 'pw-secret'], ['api_key', 'k-1']] });
  assert.deepEqual(replayModel.capturedPlanValue(entry), [['user', 'ada'], ['password', '[REDACTED]'], ['api_key', '[REDACTED]']]);
});

test('Fix1 fields that are not text pairs, or past the character bound, are not rebuilt as a form', () => {
  const odd = replayModel.replayBody(textForm({ requestBody: [['a', '1'], ['b', 2]] }));
  assert.equal(odd.exact, false);
  assert.match(odd.reason, /fields that are not text/);
  assert.deepEqual(replayModel.replayFormPairs([['a', '1'], ['a', '2']]), [['a', '1'], ['a', '2']]);
  for (const value of [[['a', 1]], [['a']], 'a=1', [['a', 'x'.repeat(50_000)]], [['f', { file: 'a.png', size: 1, type: '' }]]]) {
    assert.equal(replayModel.replayFormPairs(value), null, JSON.stringify(value).slice(0, 40));
  }
});

// ------------------------------------------------- FormData exports (final fix I2)
// Copy cURL / fetch / Axios / Playwright and HAR rebuild a FormData from its captured fields (spec J4):
// the JSON of the fields under the captured multipart Content-Type (whose boundary it does not contain)
// was a request no server could read. Files were never captured: each is a note, and the export says it
// is partial. cURL sends a text field with --form-string, which takes the value literally (-F reads a
// value starting with @ or < from a local file, and cuts one at ";type=").

const FORM_TEXT = "it's a;type=text/x @/etc/passwd <x\nline 2 \"q\"";
const FORM_PAIRS = [['user', 'bob'], ['note', FORM_TEXT], ['avatar', { file: 'a.png', size: 4, type: 'image/png' }], ['user', 'second']];
const formEntry = (extra = {}) => apiEntry({
  method: 'POST', url: 'https://api.test/upload', urlPath: '/upload', status: 200, responseRaw: '{"ok":true}',
  requestHeaders: { 'Content-Type': 'multipart/form-data; boundary=----captured', 'x-csrf': 'abc' },
  requestBodyKind: 'formdata', requestBodyText: `user=bob\nnote=${FORM_TEXT}\navatar=[file "a.png", image/png, 4 bytes]\nuser=second`,
  requestBody: FORM_PAIRS.map((pair) => [...pair]), ...extra,
});
const FILE_NOTE = 'the file in field "avatar" ("a.png", "image/png", 4 bytes) was not captured';

test('Final fix I2 cURL: one --form-string per text field in order, no captured multipart Content-Type, files noted above the command', () => {
  assertSchemaFallback(assert);
  assert.equal(U.buildCurl(formEntry()), [
    `# Partial: ${FILE_NOTE}.`,
    "curl 'https://api.test/upload' \\",
    "  -X 'POST' \\",
    "  -H 'x-csrf: abc' \\",
    "  --form-string 'user=bob' \\",
    // A line break goes as a browser's FormData sends it, CRLF, in $'…' so the CR survives a paste.
    "  --form-string $'note=it\\'s a;type=text/x @/etc/passwd <x\\r\\nline 2 \"q\"' \\",
    "  --form-string 'user=second'",
  ].join('\n'));
  // A name curl cannot send (its first "=" ends the name), fields not kept, a cut form: said, never guessed.
  const odd = U.buildCurl(formEntry({ requestBody: [['a=b', '1'], ['c', '2']], requestTruncated: { totalChars: 70_000, keptChars: 50_000 } }));
  assert.match(odd, /^# Partial: the form was cut at capture, so its last field may be short and later fields are missing\.\n# Partial: field "a=b" is left out: curl cannot send a name that contains "="\.\ncurl /);
  assert.ok(odd.endsWith("  --form-string 'c=2'"));
  const unkept = U.buildCurl(formEntry({ requestBody: undefined }));
  assert.match(unkept, /^# Partial: the form fields were not kept with this entry, so the body is left out\.\ncurl /);
  assert.doesNotMatch(unkept, /--form-string|--data-raw|multipart/);
  // Page data in a note can never end the comment early.
  const sneaky = U.buildCurl(formEntry({ requestBody: [['f\nrm -rf ~', { file: 'x\u2028y', size: 1, type: '' }]] }));
  assert.equal(sneaky.split('\n')[0], '# Partial: the file in field "f\\nrm -rf ~" ("x\\u2028y", "", 1 bytes) was not captured.');
});

test('Final fix I2 fetch: new FormData() with append(name, value) in order, the form as the body, no multipart Content-Type', () => {
  assert.equal(U.buildFetch(formEntry()), [
    `// Partial: ${FILE_NOTE}.`,
    'const form = new FormData();',
    'form.append("user", "bob");',
    `form.append("note", ${JSON.stringify(FORM_TEXT)});`,
    'form.append("user", "second");',
    '',
    'fetch("https://api.test/upload", {',
    '  "method": "POST",',
    '  "headers": {',
    '    "x-csrf": "abc"',
    '  },',
    '  "body": form',
    '})',
  ].join('\n'));
  const unkept = U.buildFetch(formEntry({ requestBody: undefined }));
  assert.doesNotMatch(unkept, /FormData|"body"/, 'no fields: no body, said in the note');
});

test('Final fix I2 Axios and Playwright build the same form; the Content-Type is theirs to write', () => {
  const axios = E.exportText(formEntry(), [], 'axios');
  const playwright = E.exportText(formEntry(), [], 'playwright');
  for (const [name, code, key] of [['axios', axios, '"data": form'], ['playwright', playwright, '"multipart": form']]) {
    assert.ok(code.startsWith(`// Partial: ${FILE_NOTE}.\n`), name);
    assert.ok(code.includes(`const form = new FormData();\n${' '.repeat(name === 'playwright' ? 2 : 0)}form.append("user", "bob");`), name);
    const appends = [...code.matchAll(/form\.append\(("[^"]*")/g)].map((match) => match[1]);
    assert.deepEqual(appends, ['"user"', '"note"', '"user"'], `${name}: text fields in order`);
    assert.ok(code.includes(key), name);
    assert.doesNotMatch(code, /multipart\/form-data|boundary|\[\["user"/, `${name}: no captured Content-Type, no JSON of the fields`);
    assert.ok(code.includes('"x-csrf": "abc"'), `${name}: the other headers stay`);
  }
  assert.match(playwright, /request\.post\("https:\/\/api\.test\/upload", \{/);
});

test('Final fix I2 HAR: postData.params in order (a file by its name and type), multipart/form-data, no text', () => {
  const har = JSON.parse(E.buildSessionHar([formEntry()]));
  const request = har.log.entries[0].request;
  assert.deepEqual(request.postData, {
    mimeType: 'multipart/form-data',
    params: [{ name: 'user', value: 'bob' }, { name: 'note', value: FORM_TEXT }, { name: 'avatar', fileName: 'a.png', contentType: 'image/png' }, { name: 'user', value: 'second' }],
    comment: 'Files were not captured.',
  });
  assert.equal(request.bodySize, -1, 'the multipart bytes were not captured');
  const unkept = JSON.parse(E.buildSessionHar([formEntry({ requestBody: undefined, requestTruncated: { totalChars: 9, keptChars: 5 } })])).log.entries[0].request.postData;
  assert.deepEqual(unkept, { mimeType: 'multipart/form-data', params: [], comment: 'The form fields were not kept with this entry. The form was cut at capture; later fields are missing.' });
});

test('Final fix I2 HAR re-import: params come back as the FormData fields, text rendering included', () => {
  const [entry] = I.parseImport(E.buildSessionHar([formEntry()])).entries;
  assert.equal(entry.requestBodyKind, 'formdata');
  assert.deepEqual(entry.requestBody, [['user', 'bob'], ['note', FORM_TEXT], ['avatar', { file: 'a.png', size: 0, type: 'image/png' }], ['user', 'second']]);
  assert.equal(entry.requestBodyText, `user=bob\nnote=${FORM_TEXT}\navatar=[file "a.png", image/png, 0 bytes]\nuser=second`);
  // And it exports the same way again.
  assert.deepEqual(JSON.parse(E.buildSessionHar([entry])).log.entries[0].request.postData.params.map((param) => param.name), ['user', 'note', 'avatar', 'user']);
});

test('Final fix I2 share-safe HAR: the redacted fields as params, never a JSON text of them', () => {
  const entry = formEntry({ requestBody: [['user', 'bob'], ['password', 'private-hunter2'], ['avatar', { file: 'a.png', size: 4, type: 'image/png' }]] });
  const har = JSON.parse(E.buildShareSafeExport([entry], 'session-har-safe').text);
  const postData = har.log.entries[0].request.postData;
  assert.deepEqual(postData.params, [{ name: 'user', value: 'bob' }, { name: 'password', value: '[REDACTED]' }, { name: 'avatar', fileName: 'a.png', contentType: 'image/png' }]);
  assert.equal(postData.mimeType, 'multipart/form-data');
  assert.equal('text' in postData, false);
  assert.doesNotMatch(JSON.stringify(har), /private-hunter2/);
});

// The generated code, run: a local server parses what arrives as multipart (the way a framework does).
async function formServer() {
  const { createServer } = await import('node:http');
  const received = [];
  const server = createServer((req, res) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', async () => {
      try {
        const form = await new Request('http://local/', { method: 'POST', headers: { 'content-type': req.headers['content-type'] || '' }, body: Buffer.concat(chunks) }).formData();
        received.push({ contentType: req.headers['content-type'], csrf: req.headers['x-csrf'], fields: [...form].map(([name, value]) => [name, String(value)]) });
      } catch (error) {
        received.push({ contentType: req.headers['content-type'], error: String(error) });
      }
      res.end('{"ok":true}');
    });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return { url: `http://127.0.0.1:${server.address().port}/upload`, received, close: () => new Promise((resolve) => server.close(resolve)) };
}

const { spawnSync } = await import('node:child_process');
const hasCurl = spawnSync('curl', ['--version']).status === 0 && spawnSync('bash', ['--version']).status === 0;

test('Final fix I2: the copied cURL and fetch, run against a server, send the captured fields', { skip: hasCurl ? false : 'curl or bash is not installed' }, async () => {
  const server = await formServer();
  try {
    const entry = formEntry({ url: server.url });
    // Asynchronously: the server answers from this process's event loop.
    const { execFile } = await import('node:child_process');
    await new Promise((resolve, reject) => execFile('bash', ['-c', U.buildCurl(entry)], { timeout: 20_000 }, (error, stdout, stderr) => (error ? reject(new Error(`${error.message}\n${stderr}`)) : resolve(stdout))));
    const fetchCode = U.buildFetch(entry).replace(/\nfetch\(/, '\nreturn fetch(');
    await (await new (Object.getPrototypeOf(async () => {}).constructor)(fetchCode)()).text();
    // What a browser's FormData sends: every line break in a field as CRLF (the multipart encoding).
    const expected = [['user', 'bob'], ['note', FORM_TEXT.replace(/\n/g, '\r\n')], ['user', 'second']];
    assert.equal(server.received.length, 2);
    for (const [index, got] of server.received.entries()) {
      assert.deepEqual(got.fields, expected, `${index ? 'fetch' : 'cURL'} sent the text fields, literally and in order`);
      assert.match(got.contentType, /^multipart\/form-data; boundary=/);
      assert.doesNotMatch(got.contentType, /----captured/, 'a boundary of its own');
      assert.equal(got.csrf, 'abc');
    }
  } finally {
    await server.close();
  }
});
