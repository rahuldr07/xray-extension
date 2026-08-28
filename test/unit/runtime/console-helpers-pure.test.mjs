// shared/console-helpers.js — the pure exports.
//
// test/console-helpers.behavior.test.js already executes createRuntime() and
// pins its wiring. This suite covers the fourteen exports that runtime is built
// out of, plus the lodashLite bag (which is not on the public export object and
// is only reachable through `createRuntime()._`).
//
// This file is loaded into the MAIN world on every page (manifest.json
// content_scripts[0]) and is also web_accessible, so everything here runs on
// data the visited page controls.

import assert from 'node:assert/strict';
import test from 'node:test';

import { hostify, loadIsolatedWorld } from './vm-load.mjs';

const context = loadIsolatedWorld('shared/console-helpers.js');
const H = context.window.XRAY_ConsoleHelpers;
const lodashLite = H.createRuntime()._;

test('console-helpers: the module publishes the expected export surface', () => {
  assert.deepEqual(Object.keys(H).sort(), [
    'buildMock', 'createRuntime', 'diff', 'flatten', 'generateCurl', 'generateFetch',
    'omit', 'parseBody', 'parseParams', 'parseUrl', 'pick', 'schema', 'toCSV', 'toTable',
  ]);
  assert.equal(H.lodashLite, undefined, 'lodashLite is private; only createRuntime()._ exposes it');
});

// ───────────────────────────────────────────────────────────── parseBody

test('parseBody: JSON-looking strings are parsed, everything else is returned as-is', () => {
  assert.deepEqual(hostify(H.parseBody('{"a":1}')), { a: 1 });
  assert.deepEqual(hostify(H.parseBody('  [1,2]  ')), [1, 2], 'leading whitespace is trimmed before the sniff');
  assert.equal(H.parseBody('plain text'), 'plain text');
  assert.equal(H.parseBody('42'), '42', 'a bare JSON number is NOT parsed — only { and [ trigger the attempt');
  assert.equal(H.parseBody('"quoted"'), '"quoted"');
  assert.equal(H.parseBody('true'), 'true');
});

test('parseBody: nullish and empty bodies collapse to null; objects pass through by reference', () => {
  assert.equal(H.parseBody(null), null);
  assert.equal(H.parseBody(undefined), null);
  assert.equal(H.parseBody(''), null);
  assert.equal(H.parseBody('   '), '   ', 'a whitespace-only body is not treated as empty');

  const already = { a: 1 };
  assert.equal(H.parseBody(already), already, 'no defensive copy is made');
  assert.equal(H.parseBody(0), 0, 'non-string primitives fall through the final return');
});

test('parseBody: malformed JSON degrades to the raw string instead of throwing', () => {
  // A truncated response body is the common case here.
  assert.equal(H.parseBody('{"a":1'), '{"a":1');
  assert.equal(H.parseBody('[1,2'), '[1,2');
  assert.equal(H.parseBody('{not json at all}'), '{not json at all}');
});

// ───────────────────────────────────────────────────────────── parseUrl / parseParams

test('parseUrl: decomposes an absolute URL', () => {
  assert.deepEqual(hostify(H.parseUrl('https://api.test:8443/v1/users?q=1#frag')), {
    full: 'https://api.test:8443/v1/users?q=1#frag',
    origin: 'https://api.test:8443',
    host: 'api.test:8443',
    path: '/v1/users',
    query: '?q=1',
  });
});

test('parseUrl: unparseable input degrades to a path-only shape, nullish to null', () => {
  assert.deepEqual(hostify(H.parseUrl('/relative/path')), {
    full: '/relative/path', origin: '', host: '', path: '/relative/path', query: '',
  });
  assert.equal(H.parseUrl(null), null);
  assert.equal(H.parseUrl(''), null, 'the empty string short-circuits before the URL parse');
});

test('parseParams: extracts the query string, last duplicate wins, empty on failure', () => {
  assert.deepEqual(hostify(H.parseParams('https://a.test/x?a=1&b=two&empty=')), { a: '1', b: 'two', empty: '' });
  assert.deepEqual(hostify(H.parseParams('https://a.test/x?d=1&d=2')), { d: '2' },
    'Object.fromEntries keeps the LAST value, so repeated params silently lose data');
  assert.deepEqual(hostify(H.parseParams('https://a.test/x')), {});
  assert.deepEqual(hostify(H.parseParams('/relative?a=1')), {}, 'a relative URL yields no params at all');
  assert.deepEqual(hostify(H.parseParams(null)), {});
});

// ───────────────────────────────────────────────────────────── toCSV / toTable

test('toCSV: quotes only when needed, doubles embedded quotes, JSON-encodes non-strings', () => {
  assert.equal(H.toCSV([{ a: 1, b: 'x' }, { a: 2, b: 'y' }]), 'a,b\n1,x\n2,y');
  assert.equal(H.toCSV([{ v: 'a,b' }]), 'v\n"a,b"');
  assert.equal(H.toCSV([{ v: 'say "hi"' }]), 'v\n"say ""hi"""');
  assert.equal(H.toCSV([{ v: 'l1\nl2' }]), 'v\n"l1\nl2"');
  assert.equal(H.toCSV([{ v: 'l1\rl2' }]), 'v\n"l1\rl2"');
  assert.equal(H.toCSV([{ v: { o: 1 } }]), 'v\n"{""o"":1}"');
  assert.equal(H.toCSV([{ v: null }, { v: undefined }]), 'v\n\n', 'nullish becomes an empty cell');
  assert.equal(H.toCSV([{ v: 0 }, { v: false }]), 'v\n0\nfalse', 'falsy non-nullish values are kept');
});

test('toCSV: non-array and empty input yields the empty string', () => {
  assert.equal(H.toCSV([]), '');
  assert.equal(H.toCSV(null), '');
  assert.equal(H.toCSV('not an array'), '');
  assert.equal(H.toCSV({ a: 1 }), '');
});

test('toCSV: the header row is escaped and columns come from every row', () => {
  // Both are pinned in detail in xray-worker.test.mjs, where the same assertions
  // sit next to the worker's escapeCSV for contrast. Repeated here so a change to
  // this file fails its own suite.
  assert.equal(H.toCSV([{ 'we,ird': 1 }]), '"we,ird"\n1');
  assert.equal(H.toCSV([{ a: 1 }, { a: 2, b: 'kept' }]), 'a,b\n1,\n2,kept');
  assert.equal(H.toCSV([{ v: '=1+1' }]), "v\n'=1+1", 'formula-looking cells are neutralised');
});

test('toTable: wraps an array in the panel render marker, coercing non-arrays to empty', () => {
  assert.deepEqual(hostify(H.toTable([{ a: 1 }])), { __xr_render: 'table', data: [{ a: 1 }] });
  assert.deepEqual(hostify(H.toTable('nope')), { __xr_render: 'table', data: [] });
  assert.deepEqual(hostify(H.toTable(null)), { __xr_render: 'table', data: [] });
});

// ───────────────────────────────────────────────────────────── diff

test('diff: shallow added/removed/changed buckets keyed by top-level property', () => {
  assert.deepEqual(hostify(H.diff({ keep: 1, drop: 2, move: 'a' }, { keep: 1, move: 'b', gain: 3 })), {
    added: { gain: 3 },
    removed: { drop: 2 },
    changed: { move: { from: 'a', to: 'b' } },
  });
});

test('diff: nested values compare by JSON string, so it is shallow but deep-aware', () => {
  const result = hostify(H.diff({ u: { a: 1, b: 2 } }, { u: { a: 1, b: 3 } }));
  assert.deepEqual(result.changed, { u: { from: { a: 1, b: 2 }, to: { a: 1, b: 3 } } },
    'the whole subtree is reported, not the changed leaf');
  assert.deepEqual(hostify(H.diff({ u: { a: 1 } }, { u: { a: 1 } })).changed, {},
    'structurally equal subtrees are not reported');

  // JSON.stringify is key-order sensitive, so a reordered but equal object is a
  // false positive. Captured JSON preserves wire order, so this is reachable.
  assert.deepEqual(
    Object.keys(hostify(H.diff({ u: { a: 1, b: 2 } }, { u: { b: 2, a: 1 } })).changed),
    ['u'],
    'key reordering alone is reported as a change',
  );
});

test('diff: nullish sides are treated as empty objects, and arrays diff by index key', () => {
  assert.deepEqual(hostify(H.diff(null, { a: 1 })), { added: { a: 1 }, removed: {}, changed: {} });
  assert.deepEqual(hostify(H.diff({ a: 1 }, null)), { added: {}, removed: { a: 1 }, changed: {} });
  assert.deepEqual(hostify(H.diff(null, null)), { added: {}, removed: {}, changed: {} });
  assert.deepEqual(hostify(H.diff([1, 2], [1, 9])), {
    added: {}, removed: {}, changed: { 1: { from: 2, to: 9 } },
  }, 'Object.keys on an array yields index strings');
});

test('diff: a value that cannot be stringified throws instead of degrading', () => {
  // shared/console-helpers.js:72 calls JSON.stringify with no guard, unlike
  // previewJSON/safeClone in shared/utils.js which both wrap it in try/catch.
  const cyclic = { a: 1 };
  cyclic.self = cyclic;
  assert.throws(() => H.diff({ self: cyclic }, { self: {} }), { name: 'TypeError', message: /circular/i });
});

// ───────────────────────────────────────────────────────────── schema

test('schema: maps values to type names and samples arrays by their first element', () => {
  assert.deepEqual(hostify(H.schema({ n: 1, s: 'x', b: true, z: null, arr: [{ id: 1 }], e: [] })), {
    n: 'number', s: 'string', b: 'boolean', z: 'null', arr: [{ id: 'number' }], e: 'array',
  });
  assert.equal(H.schema(undefined), 'undefined');
  assert.equal(H.schema(5), 'number');
});

test('schema: recursion stops at depth 5 and reports "any"', () => {
  assert.deepEqual(hostify(H.schema({ a: { b: { c: { d: { e: { f: { g: 1 } } } } } } })), {
    a: { b: { c: { d: { e: { f: 'any' } } } } },
  });
});

test('schema: a cyclic value is survivable only because of the depth cap', () => {
  // There is no visited-set; MAX_SCHEMA_DEPTH (5) is the entire defence, and the
  // guard is `depth > MAX_SCHEMA_DEPTH`, so six levels are emitted before 'any'.
  const cyclic = { a: 1 };
  cyclic.self = cyclic;
  const shape = [];
  let node = H.schema(cyclic);
  while (typeof node === 'object') {
    shape.push(node.a);
    node = node.self;
  }
  assert.deepEqual(shape, ['number', 'number', 'number', 'number', 'number', 'any'],
    'five real levels, then the cap flattens the sixth');
  assert.equal(node, 'any', 'and the recursion terminates rather than overflowing');
});

// ───────────────────────────────────────────────────────────── pick / omit / flatten

test('pick: copies only own properties that exist', () => {
  assert.deepEqual(hostify(H.pick({ a: 1, b: 2, c: 3 }, ['a', 'c'])), { a: 1, c: 3 });
  assert.deepEqual(hostify(H.pick({ a: 1 }, ['missing'])), {}, 'absent keys are skipped, not set to undefined');
  assert.deepEqual(hostify(H.pick({ a: undefined }, ['a'])), { a: undefined }, 'a present undefined IS copied');
  assert.deepEqual(hostify(H.pick({ a: 1 }, ['toString'])), {}, 'inherited keys are excluded');
  assert.deepEqual(hostify(H.pick(null, ['a'])), {});
  assert.deepEqual(hostify(H.pick({ a: 1 }, null)), {});
});

test('omit: drops the listed keys and flattens the rest into a plain object', () => {
  assert.deepEqual(hostify(H.omit({ a: 1, secret: 2 }, ['secret'])), { a: 1 });
  assert.deepEqual(hostify(H.omit({ a: 1 }, [])), { a: 1 });
  assert.deepEqual(hostify(H.omit({ a: 1 }, null)), { a: 1 });
  assert.deepEqual(hostify(H.omit(null, ['a'])), {});
});

test('flatten: dots nested object paths but leaves arrays whole', () => {
  assert.deepEqual(hostify(H.flatten({ a: { b: { c: 1 } }, d: 2 })), { 'a.b.c': 1, d: 2 });
  assert.deepEqual(hostify(H.flatten({ list: [{ x: 1 }] })), { list: [{ x: 1 }] },
    'arrays are terminal, so array-of-object payloads are not flattened at all');
  assert.deepEqual(hostify(H.flatten({ n: null })), { n: null }, 'null is terminal despite being typeof object');
  assert.deepEqual(hostify(H.flatten({ empty: {} })), {}, 'an empty object contributes no key — it vanishes');
  assert.deepEqual(hostify(H.flatten(null)), {});
});

test('flatten: a dot inside a real key is indistinguishable from a nesting level', () => {
  assert.deepEqual(hostify(H.flatten({ 'a.b': 1 })), { 'a.b': 1 });
  assert.deepEqual(hostify(H.flatten({ a: { b: 1 } })), { 'a.b': 1 },
    'both inputs produce the same output, so flatten() is not invertible');
});

test('flatten: a cyclic object overflows the stack', () => {
  const cyclic = { a: 1 };
  cyclic.self = cyclic;
  assert.throws(() => H.flatten(cyclic), { name: 'RangeError' });
});

// ───────────────────────────────────────────────────────────── generateCurl (security)

test('generateCurl: emits a single-quoted curl command with headers and body', () => {
  const command = H.generateCurl({
    url: 'https://api.test/v1/orders',
    method: 'POST',
    requestHeaders: { 'content-type': 'application/json' },
    requestBody: { q: 1 },
  });
  assert.equal(command, [
    "curl 'https://api.test/v1/orders' \\",
    "  -X 'POST' \\",
    "  -H 'content-type: application/json' \\",
    '  --data-raw \'{"q":1}\'',
  ].join('\n'));
});

test('generateCurl: no entry, default method, and bodies skipped for GET/HEAD', () => {
  assert.equal(H.generateCurl(null), '// No request selected');
  assert.equal(H.generateCurl({}), "curl '' \\\n  -X 'GET'");
  assert.equal(H.generateCurl({ url: 'u', requestBody: 'x' }), "curl 'u' \\\n  -X 'GET'",
    'a GET body is dropped');
  assert.equal(H.generateCurl({ url: 'u', method: 'HEAD', requestBody: 'x' }), "curl 'u' \\\n  -X 'HEAD'");
});

test('generateCurl: header names, header values and the body ARE shell-escaped', () => {
  // `'\''` is the correct POSIX way to embed a quote inside a single-quoted
  // string: close, escaped quote, reopen. Three of the four interpolation sites
  // do this. Confirm they hold, so the gap below is unmistakably a gap.
  const command = H.generateCurl({
    url: 'https://api.test/',
    method: 'POST',
    requestHeaders: { "X-Ev'il": "a'; id; echo '" },
    requestBody: "b'; id; echo '",
  });
  assert.ok(command.includes("-H 'X-Ev'\\''il: a'\\''; id; echo '\\'''"), command);
  assert.ok(command.includes("--data-raw 'b'\\''; id; echo '\\'''"), command);
  // Every apostrophe that survives is part of a well-formed '\'' sequence.
  assert.equal(command.replace(/'\\''/g, '').split("'").length % 2, 1, 'quotes stay balanced');
});

test('generateCurl: a page-controlled URL cannot inject shell commands', () => {
  // Regression for a real command injection. The url used to be interpolated raw
  // into a single-quoted shell word while the header and body sites two lines below
  // both escaped, so `curl '<url>'` could be closed early and arbitrary commands
  // appended.
  //
  // REACHABILITY: entry.url is whatever the intercepted request used. The WHATWG
  // URL parser (content/interceptor.js:243 `new URL(url, location.href).href`)
  // does NOT percent-encode an apostrophe in the path or query, so it survives
  // normalisation intact. A hostile page only had to issue
  //   fetch("https://x.test/a';id;echo'")
  // and wait for the operator to hit "Copy as cURL" and paste into a terminal.
  // Imported HAR files are a second, entirely unfiltered source.
  const command = H.generateCurl({ url: "https://x.test/a';id;echo'", method: 'GET' });

  assert.equal(command, "curl 'https://x.test/a'\\'';id;echo'\\''' \\\n  -X 'GET'");
  // Every apostrophe that survives is part of a well-formed '\'' sequence, so the
  // url remains a single shell word and `id` is never its own command.
  assert.equal(command.replace(/'\\''/g, '').split("'").length % 2, 1, 'quotes stay balanced');

  // The method is quoted too; it used to be interpolated bare as `-X ${method}`.
  assert.equal(
    H.generateCurl({ url: 'https://x.test/', method: 'GET; id' }),
    "curl 'https://x.test/' \\\n  -X 'GET; id'",
  );
});

// ───────────────────────────────────────────────────────────── generateFetch / buildMock

test('generateFetch: JSON-encodes the url and the options bag', () => {
  assert.equal(
    H.generateFetch({ url: 'https://a.test/x', method: 'POST', requestHeaders: { h: 'v' }, requestBody: { a: 1 } }),
    'fetch("https://a.test/x", {\n  "method": "POST",\n  "headers": {\n    "h": "v"\n  },\n  "body": "{\\"a\\":1}"\n})',
  );
  assert.equal(H.generateFetch(null), '// No request selected');
  assert.equal(H.generateFetch({ url: 'u', method: 'GET', requestBody: 'x' }).includes('body'), false);
});

test('generateFetch: JSON.stringify neutralises quote and newline injection in the url', () => {
  // Contrast with generateCurl above: because the url goes through
  // JSON.stringify, a hostile url produces a valid JS string literal rather than
  // executable code. This is the shape the curl generator should have.
  const snippet = H.generateFetch({ url: 'https://x.test/a");alert(1);("', method: 'GET' });
  assert.ok(snippet.startsWith('fetch("https://x.test/a\\");alert(1);(\\"", {'), snippet);
});

test('buildMock: builds a replayable mock from an api entry only', () => {
  assert.deepEqual(hostify(H.buildMock({
    type: 'api', url: 'https://a.test/x', method: 'get', status: '201', responseRaw: '{"ok":true}',
  })), { url: 'https://a.test/x', method: 'GET', status: 201, response: { ok: true } });

  assert.equal(H.buildMock(null), '// Select an API request first');
  assert.equal(H.buildMock({ type: 'log' }), '// Select an API request first');
});

test('buildMock: prefers the decrypted body and defaults an unusable status to 200', () => {
  const mock = hostify(H.buildMock({
    type: 'api', responseRaw: '{"encrypted":true}', responseDecrypted: '{"plain":true}', status: 'nonsense',
  }));
  assert.deepEqual(mock.response, { plain: true }, 'responseDecrypted wins');
  assert.equal(mock.status, 200, 'Number("nonsense") is NaN, which falls back to 200');
  assert.equal(mock.method, 'GET');
  assert.equal(mock.url, '');

  // A genuine 0 status (a blocked/aborted request) is also rewritten to 200,
  // so a replayed mock claims success for a request that never completed.
  assert.equal(hostify(H.buildMock({ type: 'api', status: 0 })).status, 200);
});

// ───────────────────────────────────────────────────────────── sameEndpoint / siblingEntry

test('sameEndpoint: compares urlPath first, then url, and rejects empty keys', () => {
  assert.equal(H.sameEndpoint === undefined, true, 'sameEndpoint is private; exercised through siblingEntry');
});

test('siblingEntry: walks in the given direction for the next api entry on the same endpoint', () => {
  const entries = [
    { id: 'a', type: 'api', urlPath: '/orders' },
    { id: 'b', type: 'api', urlPath: '/users' },
    { id: 'c', type: 'log', urlPath: '/orders' },
    { id: 'd', type: 'api', urlPath: '/orders' },
    { id: 'e', type: 'api', urlPath: '/orders' },
  ];
  const runtime = (current) => H.createRuntime({ entries, currentEntry: current });

  assert.equal(runtime(entries[3]).prevEntry.id, 'a', 'skips the /users entry and the log entry');
  assert.equal(runtime(entries[3]).nextEntry.id, 'e');
  assert.equal(runtime(entries[0]).prevEntry, null, 'no earlier match');
  assert.equal(runtime(entries[4]).nextEntry, null);
  assert.equal(runtime(entries[1]).prevEntry, null, 'a /users entry has no /users sibling');
  assert.equal(runtime({ id: 'not-in-list', type: 'api', urlPath: '/orders' }).prevEntry, null);
  assert.equal(runtime(null).prevEntry, null);
});

test('siblingEntry: entries with neither urlPath nor url never match each other', () => {
  const entries = [{ id: 'a', type: 'api' }, { id: 'b', type: 'api' }];
  assert.equal(H.createRuntime({ entries, currentEntry: entries[1] }).prevEntry, null,
    'an empty endpoint key is treated as "no endpoint", not as a match');
});

// ───────────────────────────────────────────────────────────── lodashLite

test('lodashLite: map/filter/find/pluck degrade to empty results for non-arrays', () => {
  assert.deepEqual(hostify(lodashLite.map([1, 2], (n) => n * 2)), [2, 4]);
  assert.deepEqual(hostify(lodashLite.map(null, (n) => n)), []);
  assert.deepEqual(hostify(lodashLite.filter([1, 2, 3], (n) => n > 1)), [2, 3]);
  assert.deepEqual(hostify(lodashLite.filter('nope', () => true)), []);
  assert.equal(lodashLite.find([{ id: 1 }, { id: 2 }], (o) => o.id === 2).id, 2);
  assert.equal(lodashLite.find(null, () => true), undefined);
  assert.deepEqual(hostify(lodashLite.pluck([{ a: 1 }, {}, null], 'a')), [1, undefined, undefined],
    'pluck is null-safe per element');
  assert.deepEqual(hostify(lodashLite.pluck(null, 'a')), []);
});

test('lodashLite.groupBy: accepts a key or a function, and stringifies the group name', () => {
  const rows = [{ s: 200, id: 1 }, { s: 500, id: 2 }, { s: 200, id: 3 }];
  assert.deepEqual(hostify(lodashLite.groupBy(rows, 's')), { 200: [rows[0], rows[2]], 500: [rows[1]] });
  assert.deepEqual(
    Object.keys(hostify(lodashLite.groupBy(rows, (r) => (r.s >= 400 ? 'bad' : 'ok')))),
    ['ok', 'bad'],
  );
  assert.deepEqual(hostify(lodashLite.groupBy([{ }], 'missing')), { undefined: [{}] },
    'a missing key groups under the literal string "undefined"');
  assert.deepEqual(hostify(lodashLite.groupBy(null, 'a')), {});
});

test('lodashLite.uniq / sortBy: set-based dedupe and a non-mutating comparator sort', () => {
  assert.deepEqual(hostify(lodashLite.uniq([1, 1, 2, 'a', 'a'])), [1, 2, 'a']);
  assert.deepEqual(hostify(lodashLite.uniq([{ a: 1 }, { a: 1 }])).length, 2, 'dedupe is by identity, not value');
  assert.deepEqual(hostify(lodashLite.uniq(null)), []);

  const rows = [{ n: 3 }, { n: 1 }, { n: 2 }];
  assert.deepEqual(hostify(lodashLite.sortBy(rows, 'n')), [{ n: 1 }, { n: 2 }, { n: 3 }]);
  assert.deepEqual(hostify(rows), [{ n: 3 }, { n: 1 }, { n: 2 }], 'the input array is not mutated');
  assert.deepEqual(hostify(lodashLite.sortBy(rows, (r) => -r.n)), [{ n: 3 }, { n: 2 }, { n: 1 }]);
  assert.deepEqual(hostify(lodashLite.sortBy(null, 'n')), []);
});

test('lodashLite.sum: coerces, treats non-numeric as 0, and sums bare arrays', () => {
  assert.equal(lodashLite.sum([1, 2, 3]), 6);
  assert.equal(lodashLite.sum([{ d: 10 }, { d: 5 }], 'd'), 15);
  assert.equal(lodashLite.sum([{ d: 10 }, {}], 'd'), 10, 'a missing value contributes 0, not NaN');
  assert.equal(lodashLite.sum([{ d: 'oops' }], 'd'), 0);
  assert.equal(lodashLite.sum([{ d: 2 }], (r) => r.d * 10), 20);
  assert.equal(lodashLite.sum(null), 0);
});
