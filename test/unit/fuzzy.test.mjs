/* Behavioural tests for src/panel/models/fuzzy.ts — fully pure, so this file is
   heavy on invariants and property checks. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { fuzzy as F } from './harness.mjs';

const { fuzzyMatch, highlightSegments } = F;

const joined = (text, ranges) => highlightSegments(text, ranges).map((segment) => segment.text).join('');
const matchedText = (text, ranges) => ranges.map(([start, end]) => text.slice(start, end)).join('');

function assertRangesSane(text, ranges, label) {
  let previousEnd = -1;
  for (const [start, end] of ranges) {
    assert.ok(Number.isInteger(start) && Number.isInteger(end), `${label}: non-integer range ${start},${end}`);
    assert.ok(start >= 0 && end <= text.length, `${label}: range ${start},${end} out of bounds for length ${text.length}`);
    assert.ok(end > start, `${label}: empty or inverted range ${start},${end}`);
    assert.ok(start >= previousEnd, `${label}: ranges must be ascending and non-overlapping (${start} after ${previousEnd})`);
    previousEnd = end;
  }
}

// ---------------------------------------------------------------- fuzzyMatch

test('fuzzyMatch: an empty or whitespace query matches everything with no ranges', () => {
  for (const query of ['', '   ', '\t\n']) {
    assert.deepEqual(fuzzyMatch(query, 'Anything'), { score: 1, ranges: [] });
  }
  assert.deepEqual(fuzzyMatch('', ''), { score: 1, ranges: [] });
});

test('fuzzyMatch: substring hits produce exactly one range and outscore subsequence hits', () => {
  const exact = fuzzyMatch('rules', 'Open Rules');
  assert.equal(exact.ranges.length, 1);
  assert.deepEqual(exact.ranges, [[5, 10]]);
  assert.ok(exact.score > 100, `substring score should be strong, got ${exact.score}`);

  const subsequence = fuzzyMatch('rls', 'Open Rules');
  assert.ok(subsequence.ranges.length > 1);
  assert.ok(exact.score > subsequence.score);
});

test('fuzzyMatch: a substring at a word boundary beats the same substring mid-word', () => {
  const atBoundary = fuzzyMatch('rule', 'open rulebook');
  const midWord = fuzzyMatch('rule', 'openrulebook');
  assert.ok(atBoundary.score > midWord.score, `${atBoundary.score} should beat ${midWord.score}`);
  assert.equal(fuzzyMatch('open', 'open rules').score > fuzzyMatch('open', 'reopen rules').score, true, 'index 0 is a boundary');
});

test('fuzzyMatch: matching is case-insensitive and the query is trimmed', () => {
  assert.deepEqual(fuzzyMatch('RULES', 'open rules').ranges, [[5, 10]]);
  assert.deepEqual(fuzzyMatch('  rules  ', 'open rules').ranges, [[5, 10]]);
  assert.deepEqual(fuzzyMatch('rules', 'OPEN RULES').ranges, [[5, 10]]);
});

test('fuzzyMatch: returns null when the query is not a subsequence', () => {
  assert.equal(fuzzyMatch('zzz', 'open rules'), null);
  assert.equal(fuzzyMatch('rulesx', 'open rules'), null);
  assert.equal(fuzzyMatch('selur', 'open rules'), null, 'order matters');
  assert.equal(fuzzyMatch('a', ''), null);
});

test('fuzzyMatch: the documented "opr" ranking holds', () => {
  const rules = fuzzyMatch('opr', 'Open Rules');
  const reports = fuzzyMatch('opr', 'Open Reports');
  assert.ok(rules && reports);
  assert.ok(rules.score > reports.score, `Open Rules (${rules.score}) should outrank Open Reports (${reports.score})`);
});

test('fuzzyMatch: consecutive and boundary characters are rewarded', () => {
  // "ab" adjacent scores higher than "ab" split across the string.
  assert.ok(fuzzyMatch('xy', 'zxyz').score > fuzzyMatch('xy', 'zxzzzzzzzy').score);
  // A shorter haystack beats a longer one for the same match.
  assert.ok(fuzzyMatch('ac', 'a-b-c').score > fuzzyMatch('ac', 'a-b-b-b-b-b-b-c').score);
});

test('fuzzyMatch: adjacent subsequence hits are merged into one range', () => {
  const result = fuzzyMatch('ope', 'zopen');
  assert.deepEqual(result.ranges, [[1, 4]], 'three consecutive characters collapse into a single span');
});

test('fuzzyMatch: reported ranges spell the query back (subsequence path)', () => {
  const text = 'Copy as cURL';
  const result = fuzzyMatch('cul', text);
  assert.equal(matchedText(text, result.ranges).toLowerCase(), 'cul');
  assertRangesSane(text, result.ranges, 'cul');
});

// ----------------------------------------------------------- highlightSegments

test('highlightSegments returns one unmatched segment when there are no ranges', () => {
  assert.deepEqual(highlightSegments('hello', []), [{ text: 'hello', match: false }]);
  assert.deepEqual(highlightSegments('', []), [{ text: '', match: false }]);
});

test('highlightSegments alternates around the matched spans', () => {
  assert.deepEqual(highlightSegments('open rules', [[5, 10]]), [
    { text: 'open ', match: false },
    { text: 'rules', match: true },
  ]);
  assert.deepEqual(highlightSegments('open rules', [[0, 1], [5, 6]]), [
    { text: 'o', match: true },
    { text: 'pen ', match: false },
    { text: 'r', match: true },
    { text: 'ules', match: false },
  ]);
  assert.deepEqual(highlightSegments('abc', [[0, 3]]), [{ text: 'abc', match: true }]);
});

test('INVARIANT segments always reassemble into the original text', () => {
  const samples = [
    ['', []],
    ['abc', []],
    ['abc', [[0, 3]]],
    ['abcdef', [[0, 1], [2, 3], [5, 6]]],
    ['abcdef', [[3, 6]]],
    ['ünïcödé', [[1, 3]]],
    ['emoji 🎯 here', [[6, 8]]],
  ];
  for (const [text, ranges] of samples) {
    assert.equal(joined(text, ranges), text, `reassembly failed for ${JSON.stringify(text)} / ${JSON.stringify(ranges)}`);
  }
});

test('PROPERTY: for 2000 random query/text pairs, segments join back to the text exactly', () => {
  let seed = 424242;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x1_0000_0000;
  };
  const alphabet = 'abcdefg -_/.:XY';
  const randomString = (maxLength) => {
    const length = Math.floor(rand() * maxLength);
    let out = '';
    for (let i = 0; i < length; i += 1) out += alphabet[Math.floor(rand() * alphabet.length)];
    return out;
  };

  let matched = 0;
  let missed = 0;
  for (let i = 0; i < 2000; i += 1) {
    const text = randomString(24);
    const query = randomString(5);
    const result = fuzzyMatch(query, text);
    if (!result) {
      missed += 1;
      continue;
    }
    matched += 1;
    assertRangesSane(text, result.ranges, `iteration ${i} (${JSON.stringify(query)} in ${JSON.stringify(text)})`);
    assert.equal(
      joined(text, result.ranges),
      text,
      `iteration ${i}: segments did not reassemble for ${JSON.stringify(query)} in ${JSON.stringify(text)}`,
    );
    // The highlighted characters must actually be the query characters.
    const highlighted = highlightSegments(text, result.ranges).filter((segment) => segment.match).map((segment) => segment.text).join('');
    if (result.ranges.length) {
      assert.ok(
        highlighted.toLowerCase().includes(query.trim().toLowerCase()) || highlighted.toLowerCase() === query.trim().toLowerCase(),
        `iteration ${i}: highlighted ${JSON.stringify(highlighted)} does not cover ${JSON.stringify(query)}`,
      );
    }
    assert.ok(Number.isFinite(result.score), `iteration ${i}: non-finite score`);
  }
  assert.ok(matched > 100, `expected a healthy number of matches, got ${matched}`);
  assert.ok(missed > 100, `expected a healthy number of misses, got ${missed}`);
});

test('PROPERTY: a query that is a subsequence of the text always matches', () => {
  let seed = 777;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x1_0000_0000;
  };
  const alphabet = 'abcdefghij';
  for (let i = 0; i < 500; i += 1) {
    const length = 5 + Math.floor(rand() * 15);
    let text = '';
    for (let c = 0; c < length; c += 1) text += alphabet[Math.floor(rand() * alphabet.length)];
    // Build a query by sampling characters of `text` in order.
    const query = [...text].filter(() => rand() < 0.35).join('');
    if (!query.trim()) continue;
    const result = fuzzyMatch(query, text);
    assert.ok(result, `iteration ${i}: ${JSON.stringify(query)} is a subsequence of ${JSON.stringify(text)} but did not match`);
    assert.equal(joined(text, result.ranges), text);
  }
});
