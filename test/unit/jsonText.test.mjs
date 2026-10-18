/* Behavioural tests for src/panel/models/jsonText.ts — the lossless JSON parser (spec §1, J1).
 *
 * The fixture battery is the audit's (output/json-audit/fixtures.mjs.txt, spec §9): every body is the
 * exact text a server sends. Deep fixtures are checked with loops only: assert.deepEqual and
 * JSON.stringify recurse and would overflow on 100,000 levels themselves.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import './harness.mjs'; // registers the extensionless/.ts resolution hook

const {
  parseJson,
  printJson,
  toValue,
  isExact,
  LosslessNumber,
  describeJsonError,
  PRETTY_MAX_INDENT_LEVELS,
} = await import('../../src/panel/models/jsonText.ts');

// ------------------------------------------------------------------ fixtures

const deepArray = (levels) => '['.repeat(levels) + ']'.repeat(levels);
const deepObject = (levels) => '{"a":'.repeat(levels) + '1' + '}'.repeat(levels);
const manyKeys = (count) => '{' + Array.from({ length: count }, (_, i) => `"key-${i}":${i}`).join(',') + '}';

// The audit's 5 MB generator, verbatim: an array of small objects.
function hugeArrayBytes(targetBytes) {
  const items = [];
  let size = 2;
  for (let i = 0; size < targetBytes; i++) {
    const item = { id: i, name: `item-${i}`, note: 'lorem ipsum dolor sit amet '.repeat(3) };
    const text = JSON.stringify(item);
    items.push(text);
    size += text.length + 1;
  }
  return `[${items.join(',')}]`;
}

// A "realistic" API page: every node kind, nesting, escapes, floats, nulls.
function realisticBytes(targetBytes) {
  const items = [];
  let size = 2;
  for (let i = 0; size < targetBytes; i++) {
    const item = {
      id: i,
      uuid: `0b7e${i.toString(16).padStart(8, '0')}-41d4-a716-446655440000`,
      active: i % 3 !== 0,
      score: Math.round(i * 7.31) / 100,
      ratio: i / 7,
      owner: i % 5 === 0 ? null : { name: `User "${i}"`, email: `user${i}@example.com`, tags: ['a', 'b\nc', 'é'] },
      created: '2026-10-14T12:00:00.000Z',
      path: `/v1/items/${i}?q=a&b=c`,
    };
    const text = JSON.stringify(item);
    items.push(text);
    size += text.length + 1;
  }
  return `{"page":1,"data":[${items.join(',')}],"next":null}`;
}

const HUGE_5MB = hugeArrayBytes(5 * 1024 * 1024);

const BATTERY = [
  { name: 'bigint', type: 'application/json', body: '{"id": 9007199254740993, "n": 12345678901234567890, "neg": -9007199254740993}' },
  { name: 'floats', type: 'application/json', body: '{"a": 0.1, "big": 1e400, "negz": -0, "one": 1.0, "e5": 1E5, "tiny": 5e-324}' },
  { name: 'keyorder', type: 'application/json', body: '{"b":1,"a":2,"10":3,"2":4,"-1":5}' },
  { name: 'dupkeys', type: 'application/json', body: '{"a":1,"a":2}' },
  { name: 'proto', type: 'application/json', body: '{"__proto__":{"polluted":true},"constructor":{"x":1},"toString":"s"}' },
  { name: 'strings', type: 'application/json', body: '{"u":"\\u00e9\\ud83d\\ude00","lone":"\\ud800","nul":"\\u0000","nl":"line1\\nline2\\ttab","html":"<img src=x onerror=alert(1)>","rtl":"\\u05e9\\u05dc\\u05d5\\u05dd abc \\u202eRTL-override"}' },
  { name: 'longstring', type: 'application/json', body: JSON.stringify({ s: 'x'.repeat(200 * 1024) }) },
  { name: 'empty-obj', type: 'application/json', body: '{}' },
  { name: 'empty-arr', type: 'application/json', body: '[]' },
  { name: 'empty-str', type: 'application/json', body: '""' },
  { name: 'null', type: 'application/json', body: 'null' },
  { name: 'bare-str', type: 'application/json', body: '"hi"' },
  { name: 'bare-num', type: 'application/json', body: '42' },
  { name: 'bare-true', type: 'application/json', body: 'true' },
  { name: 'deep', type: 'application/json', body: deepArray(2000) },
  { name: 'huge5mb', type: 'application/json', body: HUGE_5MB },
  { name: 'fifty-k', type: 'application/json', body: JSON.stringify(Array.from({ length: 50000 }, (_, i) => ({ id: i, v: i % 7 }))) },
  { name: 'mid120k', type: 'application/json', body: JSON.stringify({ items: Array.from({ length: 1200 }, (_, i) => ({ id: i, label: `row-${i}`, pad: 'p'.repeat(60) })) }) },
  { name: 'xssi', type: 'application/json', body: ")]}'\n{\"a\":1,\"b\":[1,2]}" },
  { name: 'while1', type: 'application/json', body: 'while(1);{"a":1}' },
  { name: 'ndjson', type: 'application/x-ndjson', body: '{"a":1}\n{"a":2}\n{"a":3}\n' },
  { name: 'bom', type: 'application/json', body: '\u{FEFF}{"bom":true}' },
  { name: 'textplain', type: 'text/plain', body: '{"plain":true,"n":1}' },
  { name: 'problem', type: 'application/problem+json', body: '{"type":"about:blank","title":"Not Found","status":404}' },
  { name: 'jsonapi', type: 'application/vnd.api+json', body: '{"data":{"type":"articles","id":"1","attributes":{"title":"JSON:API"}}}' },
  { name: 'trailing', type: 'application/json', body: '{"a":1,} // comment' },
  { name: 'invalid', type: 'application/json', body: '{"a": 1, "b": }' },
  { name: 'double', type: 'application/json', body: '"{\\"a\\":1}"' },
  { name: 'errors-first', type: 'application/json', body: '{"errors":[],"data":[{"id":1,"name":"a"},{"id":2,"name":"b"}]}' },
  { name: 'pretty', type: 'application/json', body: '{\n  "a": 1,\n  "list": [1, 2]\n}' },
  { name: 'deep8', type: 'application/json', body: '{"l1":{"l2":{"l3":{"l4":{"l5":{"l6":{"l7":{"l8":"OLD"}}}}}}}}' },
];
const byName = Object.fromEntries(BATTERY.map((fixture) => [fixture.name, fixture]));

// Request bodies the audit POSTed (as strings): each must parse to exactly what was sent.
const REQUEST_BODIES = {
  bigint: '{"id": 9007199254740993, "n": 12345678901234567890}',
  keyorder: '{"b":1,"a":2,"10":3,"2":4}',
  dupkeys: '{"a":1,"a":2}',
  floats: '{"one": 1.0, "negz": -0, "big": 1e400}',
  proto: '{"__proto__":{"polluted":true},"x":1}',
  jsonstring: '"hello"',
  double: '"{\\"a\\":1}"',
  literalnull: 'null',
  literalfalse: 'false',
  pretty: '{\n  "a": 1\n}',
};

// ------------------------------------------------------------------- helpers

// Removes JSON's insignificant whitespace (outside string literals). For any valid input this is
// exactly what a lexeme-preserving compact printer must produce.
function stripWs(text) {
  const parts = [];
  let start = 0;
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (inString) {
      if (c === 0x5c) i++;
      else if (c === 0x22) inString = false;
    } else if (c === 0x22) {
      inString = true;
    } else if (c === 0x20 || c === 0x0a || c === 0x0d || c === 0x09) {
      parts.push(text.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(text.slice(start));
  return parts.join('');
}

function parseOk(text, opts) {
  const doc = parseJson(text, opts);
  assert.equal(doc.ok, true, `expected ${JSON.stringify(text.slice(0, 80))} to parse: ${doc.error && describeJsonError(doc.error)}`);
  return doc;
}

const entry = (node, key) => node.entries.find((item) => item.key === key);

// Depth of `[[[…]]]` / `{"a":{"a":…}}` values, by loop (never recursion).
function arrayDepth(value) {
  let depth = 0;
  while (Array.isArray(value)) {
    depth += 1;
    value = value[0];
  }
  return depth;
}

function nodeDepth(node) {
  let depth = 0;
  while (node && (node.t === 'arr' || node.t === 'obj')) {
    depth += 1;
    node = node.t === 'arr' ? node.items[0] : node.entries[0]?.value;
  }
  return depth;
}

function medianMs(fn, runs = 3) {
  const times = [];
  for (let i = 0; i < runs; i++) {
    const started = performance.now();
    fn();
    times.push(performance.now() - started);
  }
  times.sort((a, b) => a - b);
  return times[Math.floor(runs / 2)];
}

// Deterministic PRNG for the parity fuzz (mulberry32).
function prng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function minMs(fn, runs = 5) {
  let best = Infinity;
  for (let i = 0; i < runs; i++) {
    const started = performance.now();
    fn();
    best = Math.min(best, performance.now() - started);
  }
  return best;
}

// The oracle for the parity fuzz. V8's JSON.parse has a realm-wide bug: once an object with a
// one-backslash key ({"a":1,"\\":2}) has been parsed, a later escaped one-character key in the same
// position ({"a":1,"\n":2}) comes back as "\\" (node v24.21). Texts with a backslash are therefore
// parsed in a fresh realm per call; values from it compare fine with firstDifference().
function nativeParse(text) {
  return text.includes('\\') ? vm.runInNewContext('JSON.parse(text)', { text }) : JSON.parse(text);
}

// Key-order-aware, realm-agnostic comparison of a toValue() result with an oracle value. A
// LosslessNumber compares as the Number JSON.parse would give. Returns the first difference or ''.
function firstDifference(actual, expected, path = '$') {
  if (actual instanceof LosslessNumber) actual = Number(actual.raw);
  if (typeof actual !== typeof expected) return `${path}: ${typeof actual} vs ${typeof expected}`;
  if (actual === null || expected === null || typeof actual !== 'object') {
    return Object.is(actual, expected) ? '' : `${path}: ${String(actual)} vs ${String(expected)}`;
  }
  if (Array.isArray(actual) !== Array.isArray(expected)) return `${path}: array vs object`;
  const keys = Object.keys(actual);
  if (JSON.stringify(keys) !== JSON.stringify(Object.keys(expected))) {
    return `${path}: keys ${JSON.stringify(keys)} vs ${JSON.stringify(Object.keys(expected))}`;
  }
  for (const key of keys) {
    const difference = firstDifference(actual[key], expected[key], `${path}.${key}`);
    if (difference) return difference;
  }
  return '';
}

// What an independent NDJSON reader makes of `text`: one JSON.parse per non-blank line.
function ndjsonOracle(text) {
  const values = [];
  let allValid = true;
  for (const line of text.split('\n')) {
    if (stripWs(line) === '') continue;
    try {
      values.push(nativeParse(line));
    } catch {
      allValid = false;
    }
  }
  return { values, allValid };
}

// ------------------------------------------------------------ audit battery

const VALID_JSON = [
  'bigint', 'floats', 'keyorder', 'dupkeys', 'proto', 'strings', 'longstring', 'empty-obj', 'empty-arr',
  'empty-str', 'null', 'bare-str', 'bare-num', 'bare-true', 'deep', 'huge5mb', 'fifty-k', 'mid120k',
  'textplain', 'problem', 'jsonapi', 'double', 'errors-first', 'pretty', 'deep8',
];

// Compact (no insignificant whitespace) inputs: the compact print must equal them byte for byte —
// including `strings`, whose non-canonical escapes (\u00e9, \u202e) are kept as written.
const COMPACT_EXACT = VALID_JSON.filter((name) => !['bigint', 'floats', 'pretty'].includes(name));

test('audit battery: every valid fixture parses as one JSON document with no error', () => {
  for (const name of VALID_JSON) {
    const { body, type } = byName[name];
    const doc = parseJson(body, { contentType: type });
    assert.equal(doc.ok, true, name);
    assert.equal(doc.kind, 'json', name);
    assert.equal(doc.error, undefined, name);
    assert.equal(doc.prefix, undefined, name);
    assert.notEqual(doc.root, null, name);
  }
});

test('audit battery: compact canonical fixtures round-trip byte for byte through printJson', () => {
  for (const name of COMPACT_EXACT) {
    const { body } = byName[name];
    assert.equal(printJson(parseJson(body).root), body, name);
  }
});

test('audit battery: every valid fixture prints token-equivalent, compact and pretty', () => {
  for (const name of VALID_JSON) {
    const { body } = byName[name];
    const { root } = parseJson(body);
    const tokens = stripWs(body);
    assert.equal(printJson(root), tokens, `${name}: compact print keeps every lexeme and key in order`);
    assert.equal(stripWs(printJson(root, { indent: 2 })), tokens, `${name}: pretty print is token-equivalent`);
  }
});

test('audit battery: toValue matches JSON.parse wherever JavaScript can hold the values', () => {
  const representable = [
    'floats', 'keyorder', 'dupkeys', 'proto', 'strings', 'longstring', 'empty-obj', 'empty-arr', 'empty-str',
    'null', 'bare-str', 'bare-num', 'bare-true', 'fifty-k', 'mid120k', 'textplain', 'problem', 'jsonapi',
    'double', 'errors-first', 'pretty', 'deep8',
  ];
  for (const name of representable) {
    const { body } = byName[name];
    assert.deepStrictEqual(toValue(parseJson(body).root), JSON.parse(body), name);
  }
  // The 5 MB body: compare through the native serializer (fast, and no deep recursion at this shape).
  assert.equal(JSON.stringify(toValue(parseJson(HUGE_5MB).root)), HUGE_5MB);
});

test('audit request bodies parse to exactly what was sent', () => {
  for (const [name, body] of Object.entries(REQUEST_BODIES)) {
    const doc = parseOk(body);
    assert.equal(printJson(doc.root), stripWs(body), name);
  }
  assert.deepEqual(parseOk(REQUEST_BODIES.jsonstring).root, { t: 'str', value: 'hello' });
  assert.deepEqual(parseOk(REQUEST_BODIES.literalnull).root, { t: 'null' });
  assert.deepEqual(parseOk(REQUEST_BODIES.literalfalse).root, { t: 'bool', value: false });
  const double = parseOk(REQUEST_BODIES.double).root;
  assert.deepEqual(double, { t: 'str', value: '{"a":1}' }, 'a double-encoded body is one string, not an object');
});

// --------------------------------------------------------------- big ints

test('big integers keep their lexeme, are flagged inexact and counted', () => {
  const doc = parseOk(byName.bigint.body);
  const { root } = doc;
  assert.equal(root.t, 'obj');
  assert.deepEqual(root.entries.map((item) => item.key), ['id', 'n', 'neg']);
  assert.deepEqual(entry(root, 'id').value, { t: 'num', raw: '9007199254740993', value: 9007199254740992, exact: false });
  assert.deepEqual(entry(root, 'n').value, { t: 'num', raw: '12345678901234567890', value: 12345678901234567000, exact: false });
  assert.deepEqual(entry(root, 'neg').value, { t: 'num', raw: '-9007199254740993', value: -9007199254740992, exact: false });
  assert.equal(doc.inexactNumbers, 3);
  assert.equal(doc.duplicates, 0);
  assert.equal(printJson(root), '{"id":9007199254740993,"n":12345678901234567890,"neg":-9007199254740993}');
});

test('toValue turns unsafe integers into LosslessNumber by default and BigInt on request', () => {
  const { root } = parseOk(byName.bigint.body);
  const plain = toValue(root);
  assert.ok(plain.id instanceof LosslessNumber);
  assert.equal(plain.id.raw, '9007199254740993');
  assert.equal(String(plain.id), '9007199254740993');
  assert.equal(`${plain.n}`, '12345678901234567890');
  assert.equal(plain.id.valueOf(), 9007199254740992, 'valueOf is the nearest double, for arithmetic');
  assert.equal(plain.id + 1, 9007199254740992 + 1);
  assert.equal(plain.neg.raw, '-9007199254740993');
  assert.equal(JSON.stringify(plain), '{"id":9007199254740993,"n":12345678901234567890,"neg":-9007199254740993}', 'toJSON writes the lexeme back');

  const big = toValue(root, { bigint: true });
  assert.equal(big.id, 9007199254740993n);
  assert.equal(big.n, 12345678901234567890n);
  assert.equal(big.neg, -9007199254740993n);

  const huge = '1' + '0'.repeat(400);
  assert.equal(toValue(parseOk(huge).root, { bigint: true }), BigInt(huge), 'an integer past Number range still converts exactly');
  assert.equal(toValue(parseOk(huge).root).raw, huge);
  assert.equal(toValue(parseOk('42').root, { bigint: true }), 42, 'safe integers stay numbers even with bigint');
});

test('toValue wraps every integer-valued lexeme past Number.MAX_SAFE_INTEGER, exact or not', () => {
  const wrapped = [
    // [lexeme, BigInt with bigint:true] — one ID column, one type
    ['9007199254740992', 9007199254740992n], // exact, still wrapped
    ['9007199254740993', 9007199254740993n],
    ['-9007199254740993', -9007199254740993n],
    ['9007199254740993.0', 9007199254740993n],
    ['-9007199254740993.000', -9007199254740993n],
    ['10000000000000000', 10000000000000000n],
    ['18446744073709551616', 18446744073709551616n],
  ];
  for (const [lexeme, big] of wrapped) {
    const { root } = parseOk(lexeme);
    assert.equal(toValue(root, { bigint: true }), big, lexeme);
    const lossless = toValue(root);
    assert.ok(lossless instanceof LosslessNumber, lexeme);
    assert.equal(lossless.raw, lexeme);
    assert.equal(JSON.stringify(lossless), lexeme);
  }
  // Safe integers, exponent or fraction notation and overflowed floats stay plain numbers.
  for (const lexeme of ['9007199254740991', '-9007199254740991', '1e20', '9007199254740993e0', '9007199254740992.5', '1e400', '-0']) {
    const value = toValue(parseOk(lexeme).root, { bigint: true });
    assert.equal(typeof value, 'number', lexeme);
    assert.ok(Object.is(value, Number(lexeme)), lexeme);
  }
});

test('LosslessNumber: validates its lexeme, and toJSON falls back to the lexeme string without JSON.rawJSON', () => {
  assert.throws(() => new LosslessNumber('abc'), TypeError);
  assert.throws(() => new LosslessNumber('01'), TypeError);
  assert.throws(() => new LosslessNumber(' 1'), TypeError);
  const number = new LosslessNumber('-12345678901234567890.5e3');
  assert.equal(number.raw, '-12345678901234567890.5e3');
  const descriptor = Object.getOwnPropertyDescriptor(JSON, 'rawJSON');
  try {
    delete JSON.rawJSON;
    assert.equal(JSON.stringify({ id: new LosslessNumber('9007199254740993') }), '{"id":"9007199254740993"}', 'digits are never silently rounded');
  } finally {
    if (descriptor) Object.defineProperty(JSON, 'rawJSON', descriptor);
  }
  assert.equal(JSON.stringify([new LosslessNumber('9007199254740993')]), '[9007199254740993]');
});

// ------------------------------------------------------------------ numbers

// [lexeme, exact] — the rule documented on JsonNumberNode.exact (controller ruling, fix round 1):
// an integer-valued lexeme without an exponent must be exactly the integer JS reads; exponent and
// non-zero-fraction lexemes are floating point, exact unless they overflow or underflow to 0; a zero
// with a minus sign is never exact.
const NUMBER_CASES = [
  ['0', true],
  ['-0', false],
  ['0.0', true],
  ['-0.0', false],
  ['0e5', true],
  ['-0e5', false],
  ['0E-5', true],
  ['1', true],
  ['-1', true],
  ['42', true],
  ['100.000', true],
  ['9007199254740991', true], // Number.MAX_SAFE_INTEGER
  ['-9007199254740991', true],
  ['9007199254740992', true], // 2^53: JS holds exactly this integer
  ['-9007199254740992', true],
  ['9007199254740993', false], // reads as …992
  ['-9007199254740993', false],
  ['9007199254740993.0', false], // integer-valued without an exponent: same rule
  ['9007199254740992.000', true],
  ['10000000000000000', true], // 10^16, exactly representable
  ['9223372036854775808', true], // 2^63
  ['18446744073709551616', true], // 2^64
  ['12345678901234567890', false],
  ['1' + '0'.repeat(400), false], // overflows to Infinity
  ['0.1', true],
  ['1.0', true],
  ['1.50', true],
  ['100e-2', true],
  ['1E5', true],
  ['1e+5', true],
  ['1E+2', true],
  ['1e-2', true],
  ['1e20', true],
  ['1e23', true], // exponent notation is floating point: the nearest double is the reading
  ['1e+300', true],
  ['6.02e23', true],
  ['9007199254740993e0', true],
  ['0.10000000000000001', true],
  ['0.30000000000000004', true],
  ['-0.30000000000000004', true],
  ['123456789012345.6', true],
  ['1234567890.123456789', true],
  ['0.1000000000000000055511151231257827', true],
  ['0.000000000000000000001', true],
  ['1.7976931348623157e308', true], // Number.MAX_VALUE
  ['1e400', false], // overflow → Infinity
  ['-1e400', false],
  ['2.2250738585072014e-308', true], // smallest normal
  ['5e-324', true], // smallest subnormal
  ['4e-324', true], // rounds to 5e-324, not to 0
  ['-5e-324', true],
  ['2e-324', false], // underflows to 0
  ['1e-400', false],
  ['-1e-400', false], // underflows to -0
  ['0.' + '0'.repeat(400) + '1', false], // underflow without an exponent
];

test('number exactness follows the documented rule for every edge lexeme', () => {
  for (const [lexeme, exact] of NUMBER_CASES) {
    const doc = parseOk(lexeme);
    assert.equal(doc.root.t, 'num', lexeme);
    assert.equal(doc.root.raw, lexeme, `${lexeme}: raw is the lexeme`);
    assert.ok(Object.is(doc.root.value, Number(lexeme)), `${lexeme}: value is Number(raw)`);
    assert.equal(doc.root.exact, exact, `${lexeme}: exact`);
    assert.equal(doc.inexactNumbers, exact ? 0 : 1, `${lexeme}: counted`);
    assert.equal(isExact(doc.root), exact, `${lexeme}: isExact`);
    assert.equal(printJson(doc.root), lexeme, `${lexeme}: printed as written`);
    assert.equal(printJson(parseOk(`[${lexeme}]`).root), `[${lexeme}]`);
    // The same lexeme anywhere in a document: same verdict, never a throw.
    const member = parseOk(`{"pad":"…","k": ${lexeme} }`).root.entries[1].value;
    assert.equal(member.exact, exact, `${lexeme} inside an object: exact`);
  }
});

test('floats fixture: lexemes kept, overflow and -0 flagged, toValue mirrors JSON.parse', () => {
  const doc = parseOk(byName.floats.body);
  const raws = Object.fromEntries(doc.root.entries.map((item) => [item.key, [item.value.raw, item.value.exact]]));
  assert.deepEqual(raws, {
    a: ['0.1', true],
    big: ['1e400', false],
    negz: ['-0', false],
    one: ['1.0', true],
    e5: ['1E5', true],
    tiny: ['5e-324', true],
  });
  assert.equal(doc.inexactNumbers, 2);
  assert.equal(printJson(doc.root), '{"a":0.1,"big":1e400,"negz":-0,"one":1.0,"e5":1E5,"tiny":5e-324}');
  const value = toValue(doc.root);
  assert.equal(value.big, Infinity, 'only unsafe integer lexemes are wrapped; overflow reads as JSON.parse reads it');
  assert.ok(Object.is(value.negz, -0));
  assert.equal(value.one, 1);
  assert.equal(value.e5, 100000);
  assert.equal(value.tiny, 5e-324);
  assert.ok(toValue(parseOk('9007199254740993.0').root) instanceof LosslessNumber, 'an integer written with .0 is an integer');
});

// ------------------------------------------------------------------ objects

test('key order is source order, including integer-like keys', () => {
  const { root } = parseOk(byName.keyorder.body);
  assert.deepEqual(root.entries.map((item) => item.key), ['b', 'a', '10', '2', '-1']);
  assert.equal(printJson(root), byName.keyorder.body);
});

test('duplicate keys are kept in order, marked from the second occurrence, and counted', () => {
  const doc = parseOk('{"a":1,"b":2,"a":3,"a":4}');
  assert.deepEqual(
    doc.root.entries.map((item) => [item.key, item.value.raw, item.dup === true]),
    [['a', '1', false], ['b', '2', false], ['a', '3', true], ['a', '4', true]],
  );
  assert.equal(doc.duplicates, 2);
  assert.equal(printJson(doc.root), '{"a":1,"b":2,"a":3,"a":4}');
  const value = toValue(doc.root);
  assert.deepEqual(Object.keys(value), ['a', 'b'], 'JSON.parse semantics: first position');
  assert.equal(value.a, 4, 'JSON.parse semantics: last value wins');

  const dupkeys = parseOk(byName.dupkeys.body);
  assert.equal(dupkeys.duplicates, 1);
  assert.equal(dupkeys.root.entries[0].dup, undefined);
  assert.equal(dupkeys.root.entries[1].dup, true);

  // Duplicates are found on the decoded key, and also in large objects.
  assert.equal(parseOk('{"a":1,"\\u0061":2}').duplicates, 1);
  const wide = '{' + Array.from({ length: 300 }, (_, i) => `"k${i}":${i}`).join(',') + ',"k7":7,"k299":299}';
  assert.equal(parseOk(wide).duplicates, 2);
  // Every key repeated once, across the switch from a linear scan to a Set (at 8 members).
  const keys = Array.from({ length: 21 }, (_, i) => `"k${i}":${i}`).join(',');
  const twice = parseOk(`{${keys},${keys}}`);
  assert.equal(twice.duplicates, 21);
  assert.deepEqual(
    twice.root.entries.map((item) => item.dup === true),
    [...Array(21).fill(false), ...Array(21).fill(true)],
  );
  assert.equal(parseOk('[{"a":1},{"a":1}]').duplicates, 0, 'same key in sibling objects is not a duplicate');
  assert.equal(parseOk('{"a":{"a":1}}').duplicates, 0, 'same key at another depth is not a duplicate');
  assert.equal(parseOk('{}').duplicates, 0, 'counters reset between documents');
});

test('__proto__, constructor and toString are plain own keys — no prototype pollution', () => {
  const { root } = parseOk(byName.proto.body);
  const value = toValue(root);
  assert.equal(Object.getPrototypeOf(value), Object.prototype);
  assert.deepEqual(Object.keys(value), ['__proto__', 'constructor', 'toString']);
  assert.ok(Object.prototype.hasOwnProperty.call(value, '__proto__'));
  assert.deepEqual(Object.getOwnPropertyDescriptor(value, '__proto__'), {
    value: value.__proto__,
    writable: true,
    enumerable: true,
    configurable: true,
  });
  assert.equal(value.__proto__.polluted, true);
  assert.equal({}.polluted, undefined);
  assert.equal(Object.prototype.polluted, undefined);
  assert.deepEqual(value.constructor, { x: 1 });
  assert.equal(value.toString, 's');
  assert.deepStrictEqual(value, JSON.parse(byName.proto.body));
  // Nested, and via toValue on a request body.
  const nested = toValue(parseOk('{"x":{"__proto__":{"isAdmin":true}}}').root);
  assert.equal(Object.getPrototypeOf(nested.x), Object.prototype);
  assert.equal(nested.x.isAdmin, undefined);
  assert.equal(nested.x.__proto__.isAdmin, true);
});

// ------------------------------------------------------------------ strings

test('strings fixture: escapes decode like JSON.parse and print back exactly as written', () => {
  const { body } = byName.strings;
  const { root } = parseOk(body);
  const native = JSON.parse(body);
  for (const item of root.entries) assert.equal(item.value.value, native[item.key], item.key);
  assert.equal(printJson(root), body);
  // `raw` is kept only where JSON.stringify of the decoded value would differ from the source.
  const kept = Object.fromEntries(root.entries.map((item) => [item.key, item.value.raw]));
  assert.deepEqual(kept, {
    u: '"\\u00e9\\ud83d\\ude00"',
    lone: undefined,
    nul: undefined,
    nl: undefined,
    html: undefined,
    rtl: '"\\u05e9\\u05dc\\u05d5\\u05dd abc \\u202eRTL-override"',
  });
  assert.equal(entry(root, 'u').value.value, 'é😀');
  assert.equal(entry(root, 'lone').value.value, '\ud800', 'a lone surrogate is kept as-is');
  assert.equal(entry(root, 'rtl').value.value.includes('\u202e'), true);
});

test('string escapes: decoding, raw retention and printing for every escape form', () => {
  const cases = [
    // [source, decoded, raw kept?]
    ['"plain"', 'plain', false],
    ['"\\/"', '/', true],
    ['"\\"\\\\\\b\\f\\n\\r\\t"', '"\\\b\f\n\r\t', false],
    ['"\\u001f"', '\u001f', false],
    ['"\\u001F"', '\u001f', true], // JSON.stringify writes lowercase hex
    ['"\\u0008"', '\b', true], // JSON.stringify writes \b
    ['"\\u000a"', '\n', true],
    ['"\\u0041"', 'A', true],
    ['"\\ud83d\\ude00"', '😀', true],
    ['"😀"', '😀', false],
    ['"\\ud800"', '\ud800', false],
    ['"\\uD800"', '\ud800', true],
    ['"\\udc00x"', '\udc00x', false],
    ['"\\ud800\\u0041"', '\ud800A', true],
    ['"\u2028\u2029"', '\u2028\u2029', false], // raw line separators are legal in JSON strings
    ['"\\u2028"', '\u2028', true],
    ['"\ud800"', '\ud800', true], // an unescaped lone surrogate: JSON.stringify would escape it
    ['"\udc00"', '\udc00', true],
    ['"a\ud800"', 'a\ud800', true],
    ['"\ud83d\ude00"', '😀', false],
    ['"\u007f\u0080\u00ff"', '\u007f\u0080\u00ff', false],
    ['""', '', false],
  ];
  for (const [source, decoded, keepsRaw] of cases) {
    const { root } = parseOk(source);
    assert.equal(root.t, 'str', source);
    assert.equal(root.value, decoded, `${source}: decoded`);
    if (source.isWellFormed()) assert.equal(root.value, JSON.parse(source), `${source}: matches JSON.parse`);
    assert.equal(root.raw === undefined ? false : root.raw === source, keepsRaw, `${source}: raw kept`);
    assert.equal(printJson(root), source, `${source}: printed as written`);
  }
});

test('string decoding matches JSON.parse on a randomized escape corpus', () => {
  const random = prng(0x5eed);
  const pieces = ['a', 'é', '😀', '\\n', '\\t', '\\"', '\\\\', '\\/', '\\b', '\\f', '\\r', '\\u0000', '\\u001f', '\\u00e9',
    '\\uD83D', '\\uDE00', '\\ud83d\\ude00', '\\udfff', '\\u2028', ' ', '<', '\u2028', '\u00a0', 'x'.repeat(20)];
  for (let i = 0; i < 2000; i++) {
    let body = '"';
    const count = 1 + Math.floor(random() * 8);
    for (let k = 0; k < count; k++) body += pieces[Math.floor(random() * pieces.length)];
    body += '"';
    const { root } = parseOk(body);
    assert.equal(root.value, JSON.parse(body), body);
    assert.equal(printJson(root), body, body);
  }
});

test('keys keep non-canonical escapes for printing and decode for lookup', () => {
  const { root } = parseOk('{"\\u0061":1,"\\/b":2,"c":3}');
  assert.deepEqual(root.entries.map((item) => [item.key, item.keyRaw]), [['a', '"\\u0061"'], ['/b', '"\\/b"'], ['c', undefined]]);
  assert.equal(printJson(root), '{"\\u0061":1,"\\/b":2,"c":3}');
  assert.deepEqual(toValue(root), { a: 1, '/b': 2, c: 3 });
});

test('long strings and double-encoded bodies', () => {
  const long = parseOk(byName.longstring.body);
  assert.equal(long.root.entries[0].value.value.length, 200 * 1024);
  const double = parseOk(byName.double.body);
  assert.equal(double.root.value, '{"a":1}');
  assert.equal(double.root.raw, undefined, '\\" is the canonical escape');
  assert.equal(printJson(double.root), byName.double.body);
  const inner = parseOk(double.root.value);
  assert.deepEqual(toValue(inner.root), { a: 1 });
});

// ------------------------------------------------------- scalars and empties

test('every top-level value kind parses, prints and converts', () => {
  const cases = [
    ['{}', { t: 'obj', entries: [] }, {}],
    ['[]', { t: 'arr', items: [] }, []],
    ['""', { t: 'str', value: '' }, ''],
    ['null', { t: 'null' }, null],
    ['true', { t: 'bool', value: true }, true],
    ['false', { t: 'bool', value: false }, false],
    ['"hi"', { t: 'str', value: 'hi' }, 'hi'],
    ['42', { t: 'num', raw: '42', value: 42, exact: true }, 42],
    [' \n\t\r 7 \r\n', { t: 'num', raw: '7', value: 7, exact: true }, 7],
  ];
  for (const [text, node, value] of cases) {
    const doc = parseOk(text);
    assert.deepEqual(doc.root, node, text);
    assert.deepStrictEqual(toValue(doc.root), value, text);
    assert.equal(printJson(doc.root), text.trim(), text);
    assert.equal(printJson(doc.root, { indent: 2 }), text.trim(), text);
    assert.equal(isExact(doc.root), true, text);
  }
});

// ------------------------------------------------------------------ errors

// [input, message, pos, line, col]
const ERROR_CASES = [
  ['{"a": 1, "b": }', 'Unexpected token }', 14, 1, 15],
  ['{"a":1,} // comment', 'Trailing comma', 6, 1, 7],
  ['[1,]', 'Trailing comma', 2, 1, 3],
  ['[1 , \n ]', 'Trailing comma', 3, 1, 4],
  ['{\n  "a": 1,\n  "b": }', 'Unexpected token }', 19, 3, 8],
  ['{\r\n  "a": }', 'Unexpected token }', 10, 2, 8],
  ['', 'Unexpected end of input', 0, 1, 1],
  ['   ', 'Unexpected end of input', 3, 1, 4],
  ['"abc', 'Unterminated string', 0, 1, 1],
  ['{"a":"b', 'Unterminated string', 5, 1, 6],
  ['[\n"x\n"]', 'Bad control character in string', 4, 2, 3],
  ['[', 'Unexpected end of input', 1, 1, 2],
  ['{', 'Unexpected end of input', 1, 1, 2],
  ['[1, 2', 'Unexpected end of input', 5, 1, 6],
  ['{"a":', 'Unexpected end of input', 5, 1, 6],
  ['[1 2]', "Expected ',' or ']' after array element", 3, 1, 4],
  ['{"a" 1}', "Expected ':' after property name", 5, 1, 6],
  ['{"a":1 "b":2}', "Expected ',' or '}' after property value", 7, 1, 8],
  ['{a:1}', 'Expected property name', 1, 1, 2],
  ['{"a":1,,"b":2}', 'Expected property name', 7, 1, 8],
  ['[,1]', 'Unexpected token ,', 1, 1, 2],
  ['[1,,2] x', 'Unexpected token ,', 3, 1, 4],
  [']', 'Unexpected token ]', 0, 1, 1],
  ['{"a":1}}', 'Unexpected token } after the JSON value', 7, 1, 8],
  ['{"a":1} {"a":2}', 'Unexpected token { after the JSON value', 8, 1, 9],
  ['01', 'Leading zeros are not allowed', 0, 1, 1],
  ['[-01]', 'Leading zeros are not allowed', 2, 1, 3],
  ['-', 'No number after minus sign', 1, 1, 2],
  ['-x', 'No number after minus sign', 1, 1, 2],
  ['--1', 'No number after minus sign', 1, 1, 2],
  ['1.', 'Unterminated fractional number', 2, 1, 3],
  ['1.e5', 'Unterminated fractional number', 2, 1, 3],
  ['.5', 'Unexpected token .', 0, 1, 1],
  ['1e', 'Exponent part is missing a number', 2, 1, 3],
  ['1e+', 'Exponent part is missing a number', 3, 1, 4],
  ['1E-x', 'Exponent part is missing a number', 3, 1, 4],
  ['+1', 'Unexpected token +', 0, 1, 1],
  ['NaN', 'Unexpected token N', 0, 1, 1],
  ['[Infinity]', 'Unexpected token I', 1, 1, 2],
  ['0x1', 'Unexpected token x after the JSON value', 1, 1, 2],
  ['"a\tb"', 'Bad control character in string', 2, 1, 3],
  ['"a\nb"', 'Bad control character in string', 2, 1, 3],
  ['"\\x41"', 'Invalid escape sequence', 1, 1, 2],
  ["\"\\'\"", 'Invalid escape sequence', 1, 1, 2],
  ['"\\U0041"', 'Invalid escape sequence', 1, 1, 2],
  ['"\\u12"', 'Invalid Unicode escape', 1, 1, 2],
  ['"\\u12G4"', 'Invalid Unicode escape', 1, 1, 2],
  ['"\\', 'Unterminated string', 0, 1, 1],
  ['["ok", "a\\n b', 'Unterminated string', 7, 1, 8],
  ['"\\n\u0001"', 'Bad control character in string', 3, 1, 4],
  ['tru', 'Unexpected end of input', 3, 1, 4],
  ['trux', 'Unexpected token x', 3, 1, 4],
  ['nul', 'Unexpected end of input', 3, 1, 4],
  ['True', 'Unexpected token T', 0, 1, 1],
  ['falsey', 'Unexpected token y after the JSON value', 5, 1, 6],
  ["['a']", "Unexpected token '", 1, 1, 2],
  ['\u00a0{}', 'Unexpected token U+00A0', 0, 1, 1],
  ['[1,\u2028 2]', 'Unexpected token U+2028', 3, 1, 4],
  ['\f1', 'Unexpected token U+000C', 0, 1, 1],
  ['\u{FEFF}\u{FEFF}{}', 'Unexpected token U+FEFF', 1, 1, 2],
  ['[😀]', 'Unexpected token U+1F600', 1, 1, 2],
  ["\u{FEFF})]}'\n{\"a\":}", 'Unexpected token }', 11, 2, 6],
];

test('invalid JSON reports the first error with position, line and column', () => {
  for (const [input, message, pos, line, col] of ERROR_CASES) {
    const doc = parseJson(input);
    assert.equal(doc.ok, false, `${JSON.stringify(input)} must not parse`);
    assert.deepEqual(doc.error, { pos, line, col, message }, JSON.stringify(input));
    assert.equal(doc.kind, 'json', JSON.stringify(input));
    assert.equal(doc.root, null, JSON.stringify(input));
    assert.equal(doc.duplicates, 0);
    assert.equal(doc.inexactNumbers, 0);
    let native = true;
    try {
      JSON.parse(input);
    } catch {
      native = false;
    }
    // BOM / XSSI cases are accepted by us by design; everything else agrees with JSON.parse.
    if (!input.startsWith('\u{FEFF}')) assert.equal(native, false, `JSON.parse also rejects ${JSON.stringify(input)}`);
  }
});

test('audit invalid fixtures: trailing comma and missing value carry positions', () => {
  assert.deepEqual(parseJson(byName.trailing.body).error, { pos: 6, line: 1, col: 7, message: 'Trailing comma' });
  assert.deepEqual(parseJson(byName.invalid.body).error, { pos: 14, line: 1, col: 15, message: 'Unexpected token }' });
});

test('describeJsonError formats message, line and column', () => {
  const { error } = parseJson('{\n  "a": 1,\n  "b": }');
  assert.equal(describeJsonError(error), 'Unexpected token } at line 3, col 8');
});

test('non-string input is an empty document, never a throw', () => {
  for (const input of [undefined, null, 42, {}]) {
    const doc = parseJson(input);
    assert.equal(doc.ok, false);
    assert.equal(doc.error.message, 'Unexpected end of input');
  }
});

// ------------------------------------------------- grammar parity with JSON.parse

test('grammar parity: JSON.parse and parseJson agree on a mutation fuzz corpus', () => {
  const random = prng(20261014);
  const seeds = [
    '{"a":[1,2.5,-3e2,true,false,null,"s\\n"],"b":{"c":{}}}',
    '[0,-0,0.0,1E5,1e-5,"\\u00e9",[],[[]],{"k":"v"}]',
    '{"x":"y","n":12,"m":-0.5,"z":[{"q":null}]}',
    '"just a string"',
    '123.456e-7',
    '[true,false,null]',
    '{"id":9007199254740993.0,"n":[12345678901234567890,1.000000000000000000,-0]}',
  ];
  const alphabet = ['{', '}', '[', ']', ',', ':', '"', '\\', ' ', '\n', '\t', '0', '1', '9', '-', '+', '.', 'e', 'E', 't', 'n', 'u', 'l', 'x', 'a', '/', '\u0001'];
  let agreedValid = 0;
  let sniffedNdjson = 0;
  for (let i = 0; i < 4000; i++) {
    let text = seeds[i % seeds.length];
    const edits = 1 + Math.floor(random() * 3);
    for (let k = 0; k < edits; k++) {
      const at = Math.floor(random() * (text.length + 1));
      const op = random();
      if (op < 0.4) text = text.slice(0, at) + alphabet[Math.floor(random() * alphabet.length)] + text.slice(at);
      else if (op < 0.8) text = text.slice(0, at) + text.slice(at + 1);
      else text = text.slice(0, at) + text.slice(at, at + 3) + text.slice(at);
    }
    let native;
    let nativeOk = true;
    try {
      native = nativeParse(text);
    } catch {
      nativeOk = false;
    }
    const doc = parseJson(text);
    const label = JSON.stringify(text);
    if (nativeOk) {
      assert.equal(doc.ok, true, `parseJson rejected valid ${label}: ${doc.error && describeJsonError(doc.error)}`);
      assert.equal(doc.kind, 'json', label);
      assert.equal(firstDifference(toValue(doc.root), native), '', label);
      assert.equal(printJson(doc.root), stripWs(text), label);
      agreedValid += 1;
    } else if (doc.kind === 'ndjson') {
      // Accepted as newline-separated values: every line must agree with a per-line JSON.parse.
      const oracle = ndjsonOracle(text);
      assert.ok(oracle.values.length >= 2, label);
      assert.equal(doc.ok, oracle.allValid, label);
      assert.equal(doc.root.items.length, oracle.values.length, label);
      doc.root.items.forEach((item, k) => assert.equal(firstDifference(toValue(item), oracle.values[k]), '', label));
      sniffedNdjson += 1;
    } else {
      assert.equal(doc.ok, false, `parseJson accepted invalid ${label}`);
      assert.equal(typeof doc.error.pos, 'number');
    }
  }
  assert.ok(agreedValid > 200, `the corpus exercised enough valid documents (${agreedValid})`);
  assert.ok(sniffedNdjson > 0, `the corpus exercised NDJSON sniffing (${sniffedNdjson})`);
});

// ---------------------------------------------------------------- XSSI + BOM

test('XSSI guards are stripped only at the very start and recorded', () => {
  const xssi = parseOk(byName.xssi.body);
  assert.equal(xssi.prefix, ")]}'");
  assert.equal(printJson(xssi.root), '{"a":1,"b":[1,2]}');
  const while1 = parseOk(byName.while1.body);
  assert.equal(while1.prefix, 'while(1);');
  assert.equal(printJson(while1.root), '{"a":1}');
  assert.equal(parseOk(")]}',\n[1]").prefix, ")]}',", 'longest guard wins');
  assert.equal(parseOk('for(;;);[1]').prefix, 'for(;;);');
  assert.equal(parseOk('for (;;);{"a":1}').prefix, 'for (;;);');
  assert.equal(parseOk(" \n)]}'\n{\"a\":1}").prefix, ")]}'", 'leading whitespace before the guard');
  const both = parseOk("\u{FEFF})]}'\n[true]");
  assert.equal(both.bom, true);
  assert.equal(both.prefix, ")]}'");
  assert.equal(parseOk('[1]').prefix, undefined);
  assert.equal(parseOk('[")]}\'"]').prefix, undefined, 'a guard inside the document is data');
  const late = parseJson("{\"a\":1})]}'");
  assert.equal(late.ok, false, 'a guard after the value is not stripped');
  assert.equal(late.prefix, undefined);
  const alone = parseJson(")]}'");
  assert.equal(alone.ok, false);
  assert.equal(alone.prefix, ")]}'");
  assert.deepEqual(alone.error, { pos: 4, line: 1, col: 5, message: 'Unexpected end of input' });
  assert.equal(parseJson('while (1);{}').ok, false, 'only the exact guard spellings are stripped');
});

test('a leading BOM is stripped and recorded, never printed', () => {
  const doc = parseOk(byName.bom.body);
  assert.equal(doc.bom, true);
  assert.equal(printJson(doc.root), '{"bom":true}');
  assert.equal(parseOk('{}').bom, undefined);
});

// -------------------------------------------------------------------- NDJSON

test('NDJSON by content type: one document per line', () => {
  const doc = parseOk(byName.ndjson.body, { contentType: 'application/x-ndjson' });
  assert.equal(doc.kind, 'ndjson');
  assert.equal(doc.root.t, 'arr');
  assert.deepEqual(toValue(doc.root), [{ a: 1 }, { a: 2 }, { a: 3 }]);
  for (const type of ['application/jsonl', 'Application/X-NDJSON; charset=utf-8', ' application/x-ndjson ']) {
    assert.equal(parseOk('{"a":1}\n{"a":2}', { contentType: type }).kind, 'ndjson', type);
  }
  const single = parseOk('{"a":1}', { contentType: 'application/x-ndjson' });
  assert.equal(single.kind, 'ndjson');
  assert.deepEqual(toValue(single.root), [{ a: 1 }]);
  const empty = parseOk('', { contentType: 'application/x-ndjson' });
  assert.equal(empty.kind, 'ndjson');
  assert.deepEqual(empty.root, { t: 'arr', items: [] });
  const seq = parseOk('\u001e{"a":1}\n\u001e{"a":2}\n', { contentType: 'application/json-seq' });
  assert.deepEqual(toValue(seq.root), [{ a: 1 }, { a: 2 }], 'json-seq record separators are stripped');
});

test('application/json-seq: records are split on RS (RFC 7464) and may span lines', () => {
  const RS = '\u001e';
  const seq = parseOk(`${RS}{"a":1}\n${RS}{\n  "b": [1,\n 2]\n}\n${RS}"x"\n`, {
    contentType: 'Application/JSON-SEQ; charset=utf-8',
  });
  assert.equal(seq.kind, 'ndjson');
  assert.deepEqual(toValue(seq.root), [{ a: 1 }, { b: [1, 2] }, 'x']);
  const bad = parseJson(`${RS}{"a":1}\n${RS}{"a":\n${RS}[3]\n`, { contentType: 'application/json-seq' });
  assert.equal(bad.ok, false);
  assert.deepEqual(bad.error, { pos: 16, line: 3, col: 1, message: 'Unexpected end of input' });
  assert.deepEqual(toValue(bad.root), [{ a: 1 }, [3]], 'the other records are kept');
  const unmarked = parseOk('{"a":1}\n', { contentType: 'application/json-seq' });
  assert.deepEqual(toValue(unmarked.root), [{ a: 1 }], 'text before the first RS is a record');
  const twoInOne = parseJson(`${RS}{"a":1}\n{"a":2}\n`, { contentType: 'application/json-seq' });
  assert.equal(twoInOne.ok, false, 'a newline does not separate json-seq records');
  assert.equal(twoInOne.error.message, 'Unexpected token { after the JSON value');
  assert.deepEqual(parseOk(`${RS}${RS}\n${RS}`, { contentType: 'application/json-seq' }).root, { t: 'arr', items: [] });
});

test('NDJSON by shape: newline-separated top-level values without a content type', () => {
  const sniffed = parseOk(byName.ndjson.body, { contentType: 'application/json' });
  assert.equal(sniffed.kind, 'ndjson');
  assert.equal(sniffed.root.items.length, 3);
  assert.equal(parseOk('1\n2').kind, 'ndjson');
  const crlf = parseOk('{"a":1}\r\n\r\n  \r\n{"a":2}\r\n');
  assert.equal(crlf.kind, 'ndjson');
  assert.deepEqual(toValue(crlf.root), [{ a: 1 }, { a: 2 }], 'CRLF and blank lines are ignored');
  assert.equal(parseOk('{"a":1}\n').kind, 'json', 'a trailing newline is not a second document');
  assert.equal(parseOk('{\n  "a": 1\n}\n').kind, 'json', 'pretty JSON is one document');
  const counted = parseOk('{"a":1,"a":2}\n{"n":9007199254740993}\n');
  assert.equal(counted.duplicates, 1);
  assert.equal(counted.inexactNumbers, 1);
});

test('NDJSON: a bad line is reported with its line number and the other lines are kept', () => {
  const doc = parseJson('{"a":1}\n{"a":2}\ngarbage');
  assert.equal(doc.ok, false);
  assert.equal(doc.kind, 'ndjson');
  assert.deepEqual(doc.error, { pos: 16, line: 3, col: 1, message: 'Unexpected token g' });
  assert.deepEqual(toValue(doc.root), [{ a: 1 }, { a: 2 }]);

  const middle = parseJson('{"a":1}\n{"a":\n{"a":3}\n', { contentType: 'application/x-ndjson' });
  assert.equal(middle.ok, false);
  assert.deepEqual(middle.error, { pos: 13, line: 2, col: 6, message: 'Unexpected end of input' });
  assert.deepEqual(toValue(middle.root), [{ a: 1 }, { a: 3 }], 'lines after the bad one still parse');

  const partial = parseJson('{"a":1,"a":2}\n{"a":3,"a":4,\n', { contentType: 'application/x-ndjson' });
  assert.equal(partial.duplicates, 1, 'a failed line contributes nothing to the counters');
});

test('NDJSON is never guessed from one value plus junk, a same-line value, or pretty concatenation', () => {
  const junk = parseJson('{"a":1}\nhello');
  assert.equal(junk.kind, 'json');
  assert.deepEqual(junk.error, { pos: 8, line: 2, col: 1, message: 'Unexpected token h after the JSON value' });
  assert.equal(parseJson('{"a":1} {"a":2}').kind, 'json');
  const pretty = parseJson('{\n"a":1\n}\n{\n"a":2\n}');
  assert.equal(pretty.kind, 'json');
  assert.deepEqual(pretty.error, { pos: 10, line: 4, col: 1, message: 'Unexpected token { after the JSON value' });
  // A multi-line first value is one document even when single-line values follow it.
  const prettyThenLines = parseJson('{\n"a":1\n}\n{"b":2}\n{"c":3}');
  assert.equal(prettyThenLines.kind, 'json');
  assert.deepEqual(prettyThenLines.error, { pos: 10, line: 4, col: 1, message: 'Unexpected token { after the JSON value' });
  // A record separator is only stripped for application/json-seq.
  assert.deepEqual(parseJson('\u001e{"a":1}').error, { pos: 0, line: 1, col: 1, message: 'Unexpected token U+001E' });
});

test('NDJSON after an XSSI guard or BOM', () => {
  const guarded = parseOk(")]}'\n{\"a\":1}\n{\"a\":2}\n");
  assert.equal(guarded.prefix, ")]}'");
  assert.equal(guarded.kind, 'ndjson');
  assert.deepEqual(toValue(guarded.root), [{ a: 1 }, { a: 2 }]);
  const marked = parseOk('\u{FEFF}[1]\n[2]', { contentType: 'application/jsonl' });
  assert.equal(marked.bom, true);
  assert.deepEqual(toValue(marked.root), [[1], [2]]);
});

// ----------------------------------------------------------------- printJson

test('printJson pretty layout equals JSON.stringify(value, null, indent) for canonical documents', () => {
  for (const name of ['pretty', 'mid120k', 'errors-first', 'deep8', 'empty-obj', 'empty-arr', 'proto', 'jsonapi']) {
    const { body } = byName[name];
    for (const indent of [1, 2, 4]) {
      assert.equal(printJson(parseOk(body).root, { indent }), JSON.stringify(JSON.parse(body), null, indent), `${name} indent ${indent}`);
    }
  }
  assert.equal(printJson(parseOk(byName.pretty.body).root), '{"a":1,"list":[1,2]}');
  assert.equal(printJson(parseOk('{"a":[],"b":{},"c":[{}]}').root, { indent: 2 }), '{\n  "a": [],\n  "b": {},\n  "c": [\n    {}\n  ]\n}');
  const realistic = realisticBytes(64 * 1024);
  assert.equal(printJson(parseOk(realistic).root, { indent: 2 }), JSON.stringify(JSON.parse(realistic), null, 2));
});

test('printJson indent is clamped like JSON.stringify (0–10) and 0 or less is compact', () => {
  const { root } = parseOk('{"a":[1]}');
  assert.equal(printJson(root, { indent: 0 }), '{"a":[1]}');
  assert.equal(printJson(root, { indent: -3 }), '{"a":[1]}');
  assert.equal(printJson(root, {}), '{"a":[1]}');
  assert.equal(printJson(root, { indent: 20 }), JSON.stringify({ a: [1] }, null, 20));
  assert.equal(printJson(root, { indent: 2.7 }), JSON.stringify({ a: [1] }, null, 2));
});

test('printJson escapes nodes without raw exactly like JSON.stringify', () => {
  const tricky = '"\\\u0000\u0001\u001f\b\f\n\r\t\u007f\u2028\u2029\ud800\udfff😀é/<>&\u202e';
  assert.equal(printJson({ t: 'str', value: tricky }), JSON.stringify(tricky));
  assert.equal(
    printJson({ t: 'obj', entries: [{ key: tricky, value: { t: 'bool', value: true } }] }),
    JSON.stringify({ [tricky]: true }),
  );
  assert.equal(printJson({ t: 'num', raw: '-0', value: -0, exact: false }), '-0');
});

test('printJson writes a kept raw slice only while it still decodes to the node value', () => {
  const text = '{"url":"http:\\/\\/example.com\\/a","\\u0074oken":"s3cr\\u0065t"}';
  const { root } = parseOk(text);
  assert.equal(printJson(root), text, 'as parsed: written exactly as captured (PHP-style \\/ kept)');
  const [url, token] = root.entries;
  url.value.value = 'http://example.com/b'; // edited in place, raw left behind
  token.value.value = '[REDACTED]';
  assert.equal(printJson(root), '{"url":"http://example.com/b","\\u0074oken":"[REDACTED]"}', 'no original text leaks');
  assert.equal(stripWs(printJson(root, { indent: 2 })), '{"url":"http://example.com/b","\\u0074oken":"[REDACTED]"}');
  token.key = 'credential'; // renamed in place, keyRaw left behind
  assert.equal(printJson(root), '{"url":"http://example.com/b","credential":"[REDACTED]"}');
  // A raw slice that is not exactly one JSON string is never written.
  assert.equal(printJson({ t: 'str', value: 'x', raw: '"x" , "y"' }), '"x"');
  assert.equal(printJson({ t: 'str', value: 'x', raw: 'x' }), '"x"');
  assert.equal(printJson({ t: 'str', value: 'x', raw: '"\\u0078"' }), '"\\u0078"');
  // Numbers: the lexeme is written while Number(raw) is still the node's value.
  const numbers = parseOk('[9007199254740993, 1.50]').root;
  assert.equal(printJson(numbers), '[9007199254740993,1.50]');
  numbers.items[1].value = 2;
  assert.equal(printJson(numbers), '[9007199254740993,2]');
  numbers.items[0].value = 0;
  assert.equal(printJson(numbers), '[0,2]');
});

test('options may be omitted, undefined or null', () => {
  const { root } = parseOk('[1]');
  assert.equal(parseJson('[1]', null).ok, true);
  assert.equal(parseJson('[1]', undefined).ok, true);
  assert.equal(printJson(root, null), '[1]');
  assert.deepEqual(toValue(root, null), [1]);
});

test('pretty indentation stops growing after PRETTY_MAX_INDENT_LEVELS levels', () => {
  assert.equal(PRETTY_MAX_INDENT_LEVELS, 64);
  const atCap = deepArray(PRETTY_MAX_INDENT_LEVELS + 1);
  assert.equal(printJson(parseOk(atCap).root, { indent: 2 }), JSON.stringify(JSON.parse(atCap), null, 2), 'identical up to the cap');
  const past = printJson(parseOk(deepArray(PRETTY_MAX_INDENT_LEVELS + 6)).root, { indent: 2 });
  const indents = past.split('\n').map((line) => line.length - line.trimStart().length);
  assert.equal(Math.max(...indents), PRETTY_MAX_INDENT_LEVELS * 2);
  assert.equal(stripWs(past), deepArray(PRETTY_MAX_INDENT_LEVELS + 6));
});

// ------------------------------------------------------------------ isExact

test('isExact walks the whole subtree', () => {
  assert.equal(isExact(parseOk('{"a":[1,{"b":2.5}],"c":"x"}').root), true);
  assert.equal(isExact(parseOk('{"a":[1,{"b":9007199254740993}],"c":"x"}').root), false);
  assert.equal(isExact(parseOk('[[[[-0]]]]').root), false);
  assert.equal(isExact(parseOk('{"a":1,"a":2}').root), true, 'duplicates are reported separately, not as inexact numbers');
  assert.equal(isExact(parseOk('"9007199254740993"').root), true);
});

// --------------------------------------------------------------- deep nesting

test('2,000-deep fixture: parses, prints and converts without recursion', () => {
  const { body } = byName.deep;
  const { root } = parseOk(body);
  assert.equal(nodeDepth(root), 2000);
  assert.equal(printJson(root), body);
  assert.equal(stripWs(printJson(root, { indent: 2 })), body);
  assert.equal(arrayDepth(toValue(root)), 2000);
});

test('100,000-deep arrays and objects: parse, print (compact and pretty), toValue and isExact all work', () => {
  const levels = 100_000;
  const arrays = deepArray(levels);
  const arrayDoc = parseOk(arrays);
  assert.equal(nodeDepth(arrayDoc.root), levels);
  assert.equal(printJson(arrayDoc.root), arrays);
  const prettyArrays = printJson(arrayDoc.root, { indent: 2 });
  // Every token sits on a line of at most 2 × 64 indent + itself + newline, so the size is linear.
  assert.ok(prettyArrays.length <= arrays.length * (PRETTY_MAX_INDENT_LEVELS * 2 + 2), 'pretty output stays linear in the input');
  assert.equal(stripWs(prettyArrays), arrays);
  assert.equal(arrayDepth(toValue(arrayDoc.root)), levels);
  assert.equal(isExact(arrayDoc.root), true);

  const objects = deepObject(levels);
  const objectDoc = parseOk(objects);
  assert.equal(nodeDepth(objectDoc.root), levels);
  assert.equal(printJson(objectDoc.root), objects);
  assert.equal(stripWs(printJson(objectDoc.root, { indent: 1 })), objects);
  let value = toValue(objectDoc.root);
  let depth = 0;
  while (value && typeof value === 'object') {
    value = value.a;
    depth += 1;
  }
  assert.equal(depth, levels);
  assert.equal(value, 1);
  assert.equal(isExact(parseOk(deepArray(levels - 1).replace('[]', '[9007199254740993]')).root), false);

  const unterminated = parseJson('['.repeat(levels));
  assert.deepEqual(unterminated.error, { pos: levels, line: 1, col: levels + 1, message: 'Unexpected end of input' });
});

// --------------------------------------------------------------- performance
//
// These run while node --test executes other files in parallel, so they are built to survive load:
// absolute budgets are generous (5 MB parses in ~37–68 ms and 250 KB in ~2.5 ms on the development
// machine, Node 24 / 12 cores — see task-2-report.md) and judged on the median of 5 runs; the
// linearity check compares the fastest of 5 runs of each size, because load only ever adds time.

const PARSE_5MB_BUDGET_MS = 1500;
const PARSE_250KB_BUDGET_MS = 100;

test('performance: a 5 MB array of objects parses within budget', () => {
  const ms = medianMs(() => parseJson(HUGE_5MB), 5);
  assert.ok(ms < PARSE_5MB_BUDGET_MS, `5 MB parse took ${ms.toFixed(1)} ms (budget ${PARSE_5MB_BUDGET_MS} ms)`);
  const realistic = realisticBytes(5 * 1024 * 1024);
  const realisticMs = medianMs(() => parseJson(realistic), 5);
  assert.ok(realisticMs < PARSE_5MB_BUDGET_MS, `5 MB mixed parse took ${realisticMs.toFixed(1)} ms`);
  const ndjson = HUGE_5MB.slice(1, -1).replaceAll('},{', '}\n{');
  const ndjsonMs = medianMs(() => assert.equal(parseJson(ndjson).kind, 'ndjson'), 5);
  assert.ok(ndjsonMs < PARSE_5MB_BUDGET_MS, `5 MB NDJSON parse took ${ndjsonMs.toFixed(1)} ms`);
});

test('performance: a 250 KB response parses within budget', () => {
  const body = realisticBytes(250_000);
  assert.ok(body.length >= 250_000);
  parseJson(body);
  const ms = medianMs(() => parseJson(body), 5);
  assert.ok(ms < PARSE_250KB_BUDGET_MS, `250 KB parse took ${ms.toFixed(1)} ms (budget ${PARSE_250KB_BUDGET_MS} ms)`);
});

test('performance: parse, printJson and toValue scale linearly in width and depth', () => {
  // 8× the input must cost far less than 8²× the time: a quadratic step shows ~64×, linear code
  // ~8× (GC on a growing live heap adds noise, hence 32× and a 2 ms floor under the small case).
  // Each large case also has to finish within the 5 MB parse budget.
  const ratio = (small, large, fn) => {
    const largeMs = minMs(() => fn(large));
    assert.ok(largeMs < PARSE_5MB_BUDGET_MS, `${largeMs.toFixed(1)} ms for the large input`);
    return largeMs / Math.max(minMs(() => fn(small)), 2);
  };
  const wideSmall = parseOk(hugeArrayBytes(640 * 1024)).root;
  const wideLarge = parseOk(HUGE_5MB).root;
  const deepSmall = parseOk(deepArray(12_500)).root;
  const deepLarge = parseOk(deepArray(100_000)).root;
  const checks = {
    'parse wide': ratio(hugeArrayBytes(640 * 1024), HUGE_5MB, (text) => parseJson(text)),
    'parse deep': ratio(deepArray(12_500), deepArray(100_000), (text) => parseJson(text)),
    'parse many keys': ratio(manyKeys(12_500), manyKeys(100_000), (text) => parseJson(text)),
    'print wide': ratio(wideSmall, wideLarge, (node) => printJson(node)),
    'print wide pretty': ratio(wideSmall, wideLarge, (node) => printJson(node, { indent: 2 })),
    'print deep pretty': ratio(deepSmall, deepLarge, (node) => printJson(node, { indent: 2 })),
    'toValue wide': ratio(wideSmall, wideLarge, (node) => toValue(node)),
    'toValue deep': ratio(deepSmall, deepLarge, (node) => toValue(node)),
  };
  for (const [label, value] of Object.entries(checks)) {
    assert.ok(value < 32, `${label}: 8× input took ${value.toFixed(1)}× the time`);
  }
});
