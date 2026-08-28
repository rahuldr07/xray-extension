/* Behavioural tests for src/panel/models/globalSearch.ts. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { globalSearch as G, apiEntry, logEntry } from './harness.mjs';

const { searchEntries } = G;

test('an empty or whitespace query returns nothing without error', () => {
  const all = [apiEntry()];
  for (const query of ['', '   ', null, undefined]) {
    assert.deepEqual(searchEntries(all, query), { matches: [], error: null, truncated: false });
  }
});

test('searchEntries finds a substring, case-insensitively by default', () => {
  const entry = apiEntry({ url: 'https://api.example.com/V1/Orders' });
  const result = searchEntries([entry], 'orders');
  assert.equal(result.error, null);
  assert.equal(result.matches.length, 1);
  assert.equal(result.matches[0].id, entry.id);
  assert.equal(result.matches[0].field, 'URL');
});

test('searchEntries honours caseSensitive', () => {
  const entry = apiEntry({ url: 'https://api.example.com/Orders', responseRaw: '{}' });
  assert.equal(searchEntries([entry], 'orders', { caseSensitive: true }).matches.length, 0);
  assert.equal(searchEntries([entry], 'Orders', { caseSensitive: true }).matches.length, 1);
});

test('searchEntries walks fields in priority order and reports only the first hit per entry', () => {
  const entry = apiEntry({
    method: 'POST',
    url: 'https://api.example.com/needle',
    status: 200,
    requestHeaders: { 'x-needle': '1' },
    requestBody: '{"needle":1}',
    responseHeaders: { 'x-needle': '2' },
    responseRaw: '{"needle":3}',
  });
  const result = searchEntries([entry], 'needle');
  assert.equal(result.matches.length, 1, 'one match per entry, not one per field');
  assert.equal(result.matches[0].field, 'URL', 'URL outranks headers and bodies');

  const bodyOnly = apiEntry({ url: 'https://api.example.com/x', responseRaw: '{"needle":3}', requestHeaders: {}, responseHeaders: {} });
  assert.equal(searchEntries([bodyOnly], 'needle').matches[0].field, 'Response body');

  const headerOnly = apiEntry({ url: 'https://api.example.com/x', requestHeaders: { 'x-needle': '1' }, responseRaw: '{}' });
  assert.equal(searchEntries([headerOnly], 'needle').matches[0].field, 'Request headers');

  assert.equal(searchEntries([apiEntry({ method: 'PATCH', url: 'https://x/a', responseRaw: '{}' })], 'PATCH').matches[0].field, 'Method');
  assert.equal(searchEntries([apiEntry({ url: 'https://x/a', status: 418, responseRaw: '{}' })], '418').matches[0].field, 'Status');
  assert.equal(searchEntries([logEntry({ message: 'needle in a log' })], 'needle').matches[0].field, 'Message');
});

test('searchEntries returns newest entries first', () => {
  const oldest = apiEntry({ url: 'https://x/match-1' });
  const middle = apiEntry({ url: 'https://x/match-2' });
  const newest = apiEntry({ url: 'https://x/match-3' });
  const result = searchEntries([oldest, middle, newest], 'match');
  assert.deepEqual(result.matches.map((match) => match.id), [newest.id, middle.id, oldest.id]);
});

test('the snippet offsets point at the matched text', () => {
  const entry = apiEntry({ url: 'https://api.example.com/v1/needle/end', responseRaw: '{}' });
  const [match] = searchEntries([entry], 'needle').matches;
  assert.equal(match.snippet.slice(match.matchStart, match.matchStart + match.matchLength), 'needle');
});

test('the snippet is elided on both sides for a match deep inside a long field', () => {
  const filler = 'z'.repeat(500);
  const entry = apiEntry({ url: 'https://x/a', responseRaw: JSON.stringify({ pre: filler, hit: 'needle', post: filler }) });
  const [match] = searchEntries([entry], 'needle').matches;
  assert.ok(match.snippet.startsWith('…'), 'leading ellipsis');
  assert.ok(match.snippet.endsWith('…'), 'trailing ellipsis');
  assert.equal(match.snippet.slice(match.matchStart, match.matchStart + match.matchLength), 'needle');
  // 44 chars of radius either side, plus the match, plus the two ellipses.
  assert.equal(match.snippet.length, 2 + 44 * 2 + 'needle'.length);
});

test('newlines and tabs are replaced 1:1 so the offsets stay exact', () => {
  const entry = apiEntry({ url: 'https://x/a', responseRaw: 'line one\n\tline two needle here', responseHeaders: {} });
  const [match] = searchEntries([entry], 'needle').matches;
  assert.ok(!/[\n\r\t]/.test(match.snippet), 'control whitespace is flattened');
  assert.equal(match.snippet.slice(match.matchStart, match.matchStart + match.matchLength), 'needle');
});

test('regex mode compiles the query and reports an invalid pattern', () => {
  const entry = apiEntry({ url: 'https://api.example.com/v1/users/12345', responseRaw: '{}' });
  const digits = searchEntries([entry], 'users/\\d+', { regex: true });
  assert.equal(digits.matches.length, 1);
  assert.equal(digits.matches[0].snippet.slice(digits.matches[0].matchStart, digits.matches[0].matchStart + digits.matches[0].matchLength), 'users/12345');

  const broken = searchEntries([entry], '([unclosed', { regex: true });
  assert.deepEqual(broken, { matches: [], error: 'Invalid regular expression', truncated: false });

  assert.equal(searchEntries([entry], 'USERS', { regex: true }).matches.length, 1, 'regex is case-insensitive by default');
  assert.equal(searchEntries([entry], 'USERS', { regex: true, caseSensitive: true }).matches.length, 0);
});

test('a zero-width regex match still reports a length of 1', () => {
  const entry = apiEntry({ url: 'https://x/a', responseRaw: '{}' });
  const [match] = searchEntries([entry], 'x*', { regex: true }).matches;
  assert.equal(match.matchLength, 1, 'an empty match is widened so the highlight is visible');
});

test('searchEntries returns no matches and no error when nothing matches', () => {
  const result = searchEntries([apiEntry(), logEntry()], 'definitely-not-present');
  assert.deepEqual(result, { matches: [], error: null, truncated: false });
});

test('CAP searchEntries stops at 200 matches', () => {
  const all = Array.from({ length: 500 }, () => apiEntry({ url: 'https://x/needle' }));
  const result = searchEntries(all, 'needle');
  assert.equal(result.matches.length, 200);
  assert.equal(result.truncated, true);
});

test('FIXED globalSearch.ts:107 — truncated is false when exactly 200 matched and nothing was dropped', () => {
  const exactly200 = Array.from({ length: 200 }, () => apiEntry({ url: 'https://x/needle' }));
  const result = searchEntries(exactly200, 'needle');
  assert.equal(result.matches.length, 200);
  // Was: derived from `matches.length >= MAX_MATCHES`, so a complete scan that
  // happened to find exactly the cap told the UI results had been dropped.
  assert.equal(result.truncated, false, 'every entry was scanned, so nothing was cut');

  const justUnder = Array.from({ length: 199 }, () => apiEntry({ url: 'https://x/needle' }));
  assert.equal(searchEntries(justUnder, 'needle').truncated, false, '199 still reports honestly');

  const over = Array.from({ length: 201 }, () => apiEntry({ url: 'https://x/needle' }));
  assert.equal(searchEntries(over, 'needle').truncated, true, 'and a real cut is still reported');
});

test('CAP each field is scanned only to 20_000 chars', () => {
  const filler = 'a'.repeat(25_000);
  const beyondCap = apiEntry({ url: 'https://x/a', responseRaw: filler + 'needle', responseHeaders: {} });
  assert.equal(searchEntries([beyondCap], 'needle').matches.length, 0, 'a match past the scan window is invisible');

  const withinCap = apiEntry({ url: 'https://x/a', responseRaw: 'a'.repeat(19_000) + 'needle', responseHeaders: {} });
  assert.equal(searchEntries([withinCap], 'needle').matches.length, 1);
});

test('searchEntries skips absent fields rather than matching on "undefined"', () => {
  const bare = { id: 'bare-1', type: 'api' };
  assert.equal(searchEntries([bare], 'undefined').matches.length, 0);
  assert.equal(searchEntries([bare], 'null').matches.length, 0);
  assert.deepEqual(searchEntries([bare], 'anything'), { matches: [], error: null, truncated: false });
});
