// shared/utils.js — executed, not regex-matched.
//
// DEAD-CODE CAVEAT: this file is listed in manifest.json's ISOLATED-world
// content_scripts and in devtools/devtools-panel.html, so it is parsed and run on
// every page the user visits, but a repo-wide search finds no reader of
// `window.XRAY_Utils` outside of eslint.config.mjs's globals declaration.
// docs/architecture.md:177 says the same. These tests therefore pin the CONTRACT
// of an unused module; they exist so that (a) the boundary behaviour is written
// down before anyone wires it up, and (b) the two crash-on-input bugs below are
// on record rather than waiting in ambush for the first caller.

import assert from 'node:assert/strict';
import test from 'node:test';

import { hostify, loadIsolatedWorld } from './vm-load.mjs';

const load = () => loadIsolatedWorld('shared/utils.js').window.XRAY_Utils;
const U = load();

test('utils: module publishes exactly the nine documented helpers', () => {
  assert.deepEqual(Object.keys(U).sort(), [
    'formatDuration', 'formatSize', 'formatTime', 'methodClass',
    'previewJSON', 'safeClone', 'shortPath', 'statusClass', 'uid',
  ]);
});

test('utils.uid: base36 counter is strictly increasing and per-load', () => {
  const a = U.uid();
  const b = U.uid();
  assert.match(a, /^xr_[0-9a-z]+_[0-9a-z]+$/);
  assert.notEqual(a, b);

  const seen = new Set();
  for (let i = 0; i < 2000; i++) seen.add(U.uid());
  assert.equal(seen.size, 2000, 'uid must not collide inside a single millisecond');

  // The counter is module-private and resets on reload, so two independently
  // loaded copies (e.g. the ISOLATED world and the devtools panel, which both
  // load this file) can and do mint identical ids inside the same millisecond.
  const fresh = load();
  assert.equal(fresh.uid().split('_')[2], '1');
});

test('utils.formatTime: local HH:MM:SS, and "Invalid " for an unparseable stamp', () => {
  // Built from local components so the assertion is timezone-independent.
  assert.equal(U.formatTime(new Date(2020, 0, 2, 3, 4, 5).getTime()), '03:04:05');
  assert.equal(U.formatTime(new Date(2020, 0, 2, 23, 59, 59).getTime()), '23:59:59');
  assert.match(U.formatTime(Date.now()), /^\d{2}:\d{2}:\d{2}$/);

  // BUG (cosmetic, shared/utils.js:11): no validity check. A NaN or unparseable
  // timestamp renders as the first 8 characters of "Invalid Date".
  assert.equal(U.formatTime(NaN), 'Invalid ');
  assert.equal(U.formatTime('not a date'), 'Invalid ');
  assert.equal(U.formatTime(undefined), 'Invalid ');
});

test('utils.formatDuration: ms below 1s, 2dp seconds above, em dash for nullish', () => {
  assert.equal(U.formatDuration(null), '—');
  assert.equal(U.formatDuration(undefined), '—');
  assert.equal(U.formatDuration(0), '0ms');
  assert.equal(U.formatDuration(999), '999ms');
  assert.equal(U.formatDuration(999.9), '999.9ms');
  assert.equal(U.formatDuration(1000), '1.00s');
  assert.equal(U.formatDuration(1500), '1.50s');
  assert.equal(U.formatDuration(3_600_000), '3600.00s', 'no hour/minute rollover exists');
});

test('utils.formatDuration: negative and non-finite input is passed straight through', () => {
  // Characterisation. A clock skew between request start and end yields a
  // negative duration; nothing guards it, so the UI would render "-5ms".
  assert.equal(U.formatDuration(-5), '-5ms');
  assert.equal(U.formatDuration(-5000), '-5000ms', 'negatives never reach the seconds branch');
  assert.equal(U.formatDuration(NaN), 'NaNs', 'NaN < 1000 is false, so it takes the seconds branch');
  assert.equal(U.formatDuration(Infinity), 'Infinitys');
});

test('utils.formatSize: B / KB / MB bands and their exact boundaries', () => {
  assert.equal(U.formatSize(null), '—');
  assert.equal(U.formatSize(undefined), '—');
  assert.equal(U.formatSize(0), '0 B');
  assert.equal(U.formatSize(1023), '1023 B');
  assert.equal(U.formatSize(1024), '1.0 KB');
  assert.equal(U.formatSize(1_048_575), '1024.0 KB', 'the KB band runs right up to 1024.0 KB');
  assert.equal(U.formatSize(1_048_576), '1.00 MB');
  assert.equal(U.formatSize(1_000_000_000_000), '953674.32 MB', 'there is no GB band');
});

test('utils.formatSize: negative and non-finite byte counts are not guarded', () => {
  assert.equal(U.formatSize(-1), '-1 B');
  assert.equal(U.formatSize(-2048), '-2048 B', 'negatives stay in the B band');
  assert.equal(U.formatSize(NaN), 'NaN MB', 'every NaN comparison is false, so it falls to MB');
  assert.equal(U.formatSize(Infinity), 'Infinity MB');
});

test('utils.previewJSON: strings pass through, long values gain a single ellipsis', () => {
  assert.equal(U.previewJSON('short'), 'short');
  assert.equal(U.previewJSON(''), '');

  const long = 'x'.repeat(100);
  const preview = U.previewJSON(long);
  assert.equal(preview.length, 81, '80 chars of payload plus one ellipsis');
  assert.ok(preview.endsWith('…'));
  assert.equal(preview.slice(0, 80), 'x'.repeat(80));

  assert.equal(U.previewJSON('x'.repeat(80)), 'x'.repeat(80), 'exactly maxLen is not truncated');
  assert.equal(U.previewJSON('abcdef', 3), 'abc…');
  assert.equal(U.previewJSON('abc', 0), '…', 'maxLen 0 yields ellipsis only');
});

test('utils.previewJSON: nullish collapses to the string "null", primitives to String()', () => {
  assert.equal(U.previewJSON(null), 'null');
  assert.equal(U.previewJSON(undefined), 'null', 'undefined is indistinguishable from null here');
  assert.equal(U.previewJSON(42), '42');
  assert.equal(U.previewJSON(false), 'false');
  assert.equal(U.previewJSON(0), '0');
});

test('utils.previewJSON: objects are serialised, and unserialisable ones degrade safely', () => {
  assert.equal(U.previewJSON({ a: 1, b: [2, 3] }), '{"a":1,"b":[2,3]}');
  assert.equal(U.previewJSON([1, 2, 3]), '[1,2,3]');

  const big = U.previewJSON({ v: 'y'.repeat(200) });
  assert.equal(big.length, 81);

  const cyclic = { name: 'root' };
  cyclic.self = cyclic;
  assert.equal(U.previewJSON(cyclic), '[object]', 'the try/catch absorbs the circular-structure TypeError');

  const throwing = { get boom() { throw new Error('nope'); } };
  assert.equal(U.previewJSON(throwing), '[object]');
});

test('utils.statusClass: every HTTP band, plus the out-of-range fallbacks', () => {
  const cases = [
    [200, 'xr-s2'], [201, 'xr-s2'], [299, 'xr-s2'],
    [300, 'xr-s3'], [304, 'xr-s3'], [399, 'xr-s3'],
    [400, 'xr-s4'], [404, 'xr-s4'], [499, 'xr-s4'],
    [500, 'xr-s5'], [503, 'xr-s5'], [599, 'xr-s5'],
  ];
  for (const [status, expected] of cases) {
    assert.equal(U.statusClass(status), expected, `status ${status}`);
  }

  // 1xx and 6xx+ are real HTTP-adjacent values that collapse into the "unknown"
  // bucket alongside 0/null — a 1xx informational response is styled as if the
  // request never completed.
  for (const status of [100, 199, 600, 999]) {
    assert.equal(U.statusClass(status), 'xr-s0', `status ${status} has no band`);
  }
  for (const falsy of [0, null, undefined, NaN, '']) {
    assert.equal(U.statusClass(falsy), 'xr-s0');
  }
  assert.equal(U.statusClass('200'), 'xr-s2', 'numeric strings coerce through Math.floor');
});

test('utils.methodClass: lowercases, defaults to get — and throws on a non-string method', () => {
  assert.equal(U.methodClass('GET'), 'xr-m-get');
  assert.equal(U.methodClass('PoSt'), 'xr-m-post');
  assert.equal(U.methodClass('PATCH'), 'xr-m-patch');
  for (const falsy of [undefined, null, '', 0]) {
    assert.equal(U.methodClass(falsy), 'xr-m-get', 'falsy methods fall back to get');
  }

  // BUG (shared/utils.js:44): `(method || 'get').toLowerCase()` assumes a string.
  // Any truthy non-string — e.g. a numeric method smuggled through a HAR import
  // or a postMessage payload — throws instead of degrading.
  assert.throws(() => U.methodClass(123), { name: 'TypeError' });
  assert.throws(() => U.methodClass({ toString: () => 'GET' }), { name: 'TypeError' });
});

test('utils.safeClone: JSON round-trip produces a genuinely detached copy', () => {
  const source = { a: 1, nested: { list: [1, 2, { deep: true }] } };
  const clone = U.safeClone(source);

  assert.deepEqual(hostify(clone), source);
  assert.notEqual(clone, source);
  assert.notEqual(clone.nested, source.nested);
  clone.nested.list[2].deep = false;
  assert.equal(source.nested.list[2].deep, true, 'mutating the clone must not reach the source');
});

test('utils.safeClone: JSON-hostile values are silently reshaped or aliased', () => {
  // Dates degrade to ISO strings; undefined/function properties vanish.
  assert.equal(U.safeClone(new Date(0)), '1970-01-01T00:00:00.000Z');
  assert.deepEqual(hostify(U.safeClone({ a: undefined, b: () => 1, c: 1 })), { c: 1 });
  assert.deepEqual(hostify(U.safeClone([undefined, () => 1])), [null, null]);
  assert.equal(U.safeClone(undefined), undefined, 'JSON.parse(undefined) throws, so v is returned as-is');
  assert.equal(typeof U.safeClone(() => 1), 'function');

  // BUG (shared/utils.js:49): on failure the ORIGINAL reference is returned, so
  // a "safe clone" of a cyclic value is not a clone at all. Callers that clone
  // in order to mutate would be writing straight through to the source.
  const cyclic = { a: 1 };
  cyclic.self = cyclic;
  const result = U.safeClone(cyclic);
  assert.equal(result, cyclic, 'the catch branch aliases rather than clones');
  result.a = 99;
  assert.equal(cyclic.a, 99, 'writes to the "clone" mutate the caller\'s object');
});

test('utils.shortPath: short paths render whole, trailing slashes are trimmed', () => {
  assert.equal(U.shortPath('https://api.test/v1/users'), '/v1/users');
  assert.equal(U.shortPath('https://api.test/'), '/', 'root keeps its single slash');
  assert.equal(U.shortPath('https://api.test'), '/');
  assert.equal(U.shortPath('https://api.test/v1/users/'), '/v1/users');
  assert.equal(U.shortPath('https://api.test/v1/users?q=1#frag'), '/v1/users', 'query and hash are dropped');
  assert.equal(U.shortPath('https://api.test/' + 'a'.repeat(34)), '/' + 'a'.repeat(34), '35 chars is the inclusive limit');
});

test('utils.shortPath: long paths collapse to the trailing segments', () => {
  assert.equal(
    U.shortPath('https://api.test/aaaa/bbbb/cccc/dddd/eeee/ffff/gggg/hhhh'),
    '…/ffff/gggg/hhhh',
    'three trailing segments when they fit in 35 chars',
  );
  assert.equal(
    U.shortPath('https://api.test/' + 'seg/'.repeat(20)),
    '…/seg/seg/seg',
  );
  // Two-or-fewer segments take the tail-slice branch instead.
  assert.equal(U.shortPath('https://api.test/' + 'x'.repeat(60)), '…' + 'x'.repeat(38));
});

test('utils.shortPath: the 3-segment branch has no absolute length cap', () => {
  // BUG (cosmetic, shared/utils.js:66): when the last three segments exceed 35
  // chars the fallback is the last TWO segments — which is itself unbounded. A
  // long final segment (a JWT, a base64 id) is returned essentially in full,
  // defeating the whole point of the function.
  const url = 'https://api.test/api/v1/' + 'y'.repeat(50);
  const out = U.shortPath(url);
  assert.equal(out, '…/v1/' + 'y'.repeat(50));
  assert.ok(out.length > 40, `shortPath returned ${out.length} chars, well past the ~40 the other branches cap at`);
});

test('utils.shortPath: unparseable URLs fall back to a tail slice', () => {
  assert.equal(U.shortPath('not a url'), 'not a url');
  assert.equal(U.shortPath('/relative/path'), '/relative/path', 'relative URLs never reach the URL branch');
  assert.equal(U.shortPath(''), '');
  assert.equal(U.shortPath('z'.repeat(50)), '…' + 'z'.repeat(38));
});

test('utils.shortPath: nullish input throws out of the catch block', () => {
  // BUG (shared/utils.js:67): `new URL(null)` throws, and the catch handler then
  // dereferences `url.length` on that same null — so the guard rethrows a
  // different TypeError instead of degrading. Every other helper in this module
  // tolerates nullish input.
  assert.throws(() => U.shortPath(null), { name: 'TypeError', message: /reading 'length'/ });
  assert.throws(() => U.shortPath(undefined), { name: 'TypeError' });
});
