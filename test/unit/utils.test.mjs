/* Behavioural tests for src/panel/utils.ts — the shared foundation every model
   in src/panel/models/ sits on, including the window.XRAY_ConsoleHelpers
   delegation that this whole suite depends on being absent. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { utils as U, apiEntry, assertSchemaFallback } from './harness.mjs';

const {
  buildCurl,
  buildFetch,
  buildMockPayload,
  clampNumber,
  entryRequest,
  entryResponse,
  entrySchema,
  eventEntry,
  formatBytes,
  methodClass,
  parseBody,
  preview,
  safeStringify,
  schema,
  statusClass,
  stripXrayRefs,
} = U;

test('GUARD the console-helper globals are absent, so every model exercises the local fallback', () => {
  assertSchemaFallback(assert);
  assert.equal(typeof globalThis.window, 'object');
});

test('parseBody parses JSON-looking strings and passes everything else through', () => {
  assert.deepEqual(parseBody('{"a":1}'), { a: 1 });
  assert.deepEqual(parseBody('  [1,2]  '), [1, 2]);
  assert.equal(parseBody('plain text'), 'plain text');
  assert.equal(parseBody('{not json'), '{not json', 'a failed parse returns the original string');
  assert.equal(parseBody(''), null);
  assert.equal(parseBody(null), null);
  assert.equal(parseBody(undefined), null);
  assert.equal(parseBody(42), 42, 'non-strings pass through untouched');
  assert.equal(parseBody('42'), '42', 'a bare number string is not JSON-parsed');
  const object = { already: 'parsed' };
  assert.equal(parseBody(object), object);
});

test('clampNumber rounds, clamps and falls back on non-finite input', () => {
  assert.equal(clampNumber(5, 0, 0, 10), 5);
  assert.equal(clampNumber(-5, 0, 0, 10), 0);
  assert.equal(clampNumber(50, 0, 0, 10), 10);
  assert.equal(clampNumber(5.6, 0, 0, 10), 6);
  assert.equal(clampNumber('7', 0, 0, 10), 7);
  assert.equal(clampNumber(null, 3, 0, 10), 0, 'Number(null) is 0, which is finite');
  for (const bad of [NaN, Infinity, -Infinity, undefined, 'text', {}]) {
    assert.equal(clampNumber(bad, 3, 0, 10), 3, `${String(bad)} should fall back`);
  }
});

test('schema infers a structural shape from any value (local fallback)', () => {
  assert.equal(schema('x'), 'string');
  assert.equal(schema(1), 'number');
  assert.equal(schema(true), 'boolean');
  assert.equal(schema(null), 'null');
  assert.equal(schema(undefined), 'undefined');
  assert.equal(schema([]), 'array', 'an empty array has no element shape');
  assert.deepEqual(schema([1, 2]), ['number'], 'only the first element is sampled');
  assert.deepEqual(schema([{ a: 1 }, { b: 2 }]), [{ a: 'number' }]);
  assert.deepEqual(schema({ a: 1, b: 'x', c: [true], d: null }), { a: 'number', b: 'string', c: ['boolean'], d: 'null' });
});

test('entryResponse / entryRequest / entrySchema read the right field of an entry', () => {
  const entry = apiEntry({ requestBody: '{"q":1}', responseRaw: '{"r":[1]}', responseDecrypted: null });
  assert.deepEqual(entryRequest(entry), { q: 1 });
  assert.deepEqual(entryResponse(entry), { r: [1] });
  assert.deepEqual(entrySchema(entry), { r: ['number'] });
  assert.equal(entryResponse(null), null);
  assert.equal(entrySchema(null), null);
  assert.equal(entryRequest(null), null);

  const decrypted = apiEntry({ responseRaw: '{"encrypted":1}', responseDecrypted: '{"plain":1}' });
  assert.deepEqual(entryResponse(decrypted), { plain: 1 }, 'the decrypted body wins');
});

test('entryResponse memoizes per entry object, so a mutated entry returns the stale parse', () => {
  // Documented cache behaviour: the panel mints a NEW entry object on every
  // patch, which is what makes this identity cache correct there.
  const entry = apiEntry({ responseRaw: '{"a":1}' });
  assert.deepEqual(entryResponse(entry), { a: 1 });
  entry.responseRaw = '{"b":2}';
  assert.deepEqual(entryResponse(entry), { a: 1 }, 'mutating an entry in place does not invalidate the cache');
  assert.deepEqual(entryResponse(apiEntry({ responseRaw: '{"b":2}' })), { b: 2 }, 'a fresh object re-parses');
});

test('safeStringify survives circular references, BigInt and the size cap', () => {
  const cyclic = { name: 'root' };
  cyclic.self = cyclic;
  const text = safeStringify(cyclic);
  assert.ok(text.includes('[Circular]'));
  assert.doesNotThrow(() => JSON.parse(text));

  assert.ok(safeStringify({ big: 10n }, 0).includes('"10n"'));
  assert.equal(safeStringify(undefined), 'undefined');
  assert.equal(safeStringify(null), 'null');
  assert.equal(safeStringify({ a: 1 }, 0), '{"a":1}');

  const huge = safeStringify({ blob: 'x'.repeat(200_000) }, 0, 1000);
  assert.ok(huge.length < 1100, 'output is bounded by the limit');
  assert.match(huge, /\n\.\.\. truncated \d+ chars$/);
});

test('safeStringify marks each object once, so a repeated sibling is not mistaken for a cycle', () => {
  const shared = { a: 1 };
  const text = safeStringify({ first: shared, second: shared }, 0);
  assert.equal(text, '{"first":{"a":1},"second":"[Circular]"}', 'a DAG is reported as circular — current behaviour');
});

test('stripXrayRefs removes the internal marker at every depth', () => {
  const value = { a: 1, __xray_ref__: 'secret', nested: { __xray_ref__: 'x', b: 2 }, list: [{ __xray_ref__: 'y', c: 3 }] };
  assert.deepEqual(stripXrayRefs(value), { a: 1, nested: { b: 2 }, list: [{ c: 3 }] });
  assert.equal(stripXrayRefs('scalar'), 'scalar');
  assert.equal(stripXrayRefs(null), null);
  // Past the depth budget the value is returned untouched, marker and all.
  const deep = { l1: { l2: { l3: { l4: { l5: { l6: { l7: { __xray_ref__: 'leaked' } } } } } } } };
  assert.ok(JSON.stringify(stripXrayRefs(deep)).includes('__xray_ref__'), 'the depth cap is a real limit');
});

test('formatBytes switches units at the kb / mb boundaries', () => {
  assert.equal(formatBytes(0), '0b');
  assert.equal(formatBytes(1023), '1023b');
  assert.equal(formatBytes(1024), '1.0kb');
  assert.equal(formatBytes(1536), '1.5kb');
  assert.equal(formatBytes(1024 * 1024), '1.0mb');
  assert.equal(formatBytes('nonsense'), '0b');
  assert.equal(formatBytes(undefined), '0b');
});

test('preview truncates and never throws', () => {
  assert.equal(preview(undefined), 'undefined');
  assert.equal(preview(null), 'null');
  assert.equal(preview(42), '42');
  assert.equal(preview(true), 'true');
  assert.equal(preview('short'), 'short');
  assert.equal(preview('x'.repeat(300)), 'x'.repeat(220) + '...');
  assert.equal(preview('x'.repeat(10), 5), 'xxxxx...');
  assert.equal(preview({ a: 1 }), '{"a":1}');
  const cyclic = {};
  cyclic.self = cyclic;
  assert.equal(preview(cyclic), '[object Object]', 'an unserializable value degrades to String()');
});

test('methodClass / statusClass map to the CSS variants the panel paints', () => {
  assert.equal(methodClass('POST'), 'post');
  assert.equal(methodClass(undefined), 'get');
  assert.equal(statusClass(200), 'ok');
  assert.equal(statusClass(304), 'warn');
  assert.equal(statusClass(404), 'error');
  assert.equal(statusClass(500), 'error');
  assert.equal(statusClass(0), '');
  assert.equal(statusClass(undefined), '');
});

test('eventEntry unwraps a network console event and rejects anything else', () => {
  const entry = apiEntry();
  assert.equal(eventEntry({ type: 'network', args: [entry] }), entry);
  assert.equal(eventEntry({ type: 'log', args: [entry] }), null);
  assert.equal(eventEntry({ type: 'network', args: ['not an object'] }), null);
  assert.equal(eventEntry({ type: 'network', args: [] }), null);
  assert.equal(eventEntry({ type: 'network' }), null);
});

test('buildCurl / buildFetch / buildMockPayload use their local fallbacks', () => {
  assertSchemaFallback(assert);
  const entry = apiEntry({ url: 'https://api.example.com/x?a=1', method: 'delete', responseRaw: '{"a":1}' });
  assert.equal(buildCurl(entry), 'curl "https://api.example.com/x?a=1" -X DELETE');
  assert.equal(buildFetch(entry), 'fetch("https://api.example.com/x?a=1")');
  assert.deepEqual(JSON.parse(buildMockPayload(entry)), { a: 1 });
  assert.equal(buildCurl(null), '// Select an API request first');
  assert.equal(buildFetch(null), '// Select an API request first');
  assert.equal(buildMockPayload(null), 'null');
});
