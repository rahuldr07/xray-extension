// R9/R14: copying results whose blob previews were cut at 256 bytes is flagged.
import test from 'node:test';
import assert from 'node:assert/strict';
import './harness.mjs';

const { toCell, isTruncatedBlob, countTruncatedBlobs, truncatedBlobNotice, toInsertCopy, toInsertStatements } =
  await import('../../src/panel/models/sqlValues.ts');

const columns = [
  { name: 'id', type: 'INTEGER' },
  { name: 'note', type: 'TEXT' },
  { name: 'a', type: 'BLOB' },
  { name: 'b', type: 'BLOB' },
];

test('a blob is truncated exactly when its hex is shorter than its length', () => {
  assert.equal(isTruncatedBlob(toCell(new Uint8Array(300))), true);
  assert.equal(isTruncatedBlob(toCell(new Uint8Array(256))), false);
  assert.equal(isTruncatedBlob(toCell(new Uint8Array(0))), false);
  assert.equal(isTruncatedBlob({ hex: 'ab', length: 2 }), true);
  assert.equal(isTruncatedBlob({ hex: 'abcd', length: 2 }), false);
  for (const cell of [null, 1, 'x', true]) assert.equal(isTruncatedBlob(cell), false);
});

test('countTruncatedBlobs counts cells, not rows', () => {
  const big = toCell(new Uint8Array(300));
  assert.equal(countTruncatedBlobs([[big, big], [null, toCell(new Uint8Array(4))], [big]]), 3);
  assert.equal(countTruncatedBlobs([]), 0);
});

test('the notice is the ruled sentence', () => {
  assert.equal(truncatedBlobNotice(3), '3 blob values were truncated to 256 bytes');
});

test('INSERT copy puts one comment line before each affected row, listing every cut size', () => {
  const rows = [
    [1, 'plain', null, toCell(new Uint8Array(4))],
    [2, 'one', toCell(new Uint8Array(300)), null],
    [3, 'two', toCell(new Uint8Array(300)), toCell(new Uint8Array(4096))],
  ];
  const { text, truncatedBlobs } = toInsertCopy('t', columns, rows, 'sqlite');
  assert.equal(truncatedBlobs, 3);
  const expected = [
    toInsertStatements('t', columns, [rows[0]], 'sqlite'),
    '-- blob truncated: 300 bytes',
    toInsertStatements('t', columns, [rows[1]], 'sqlite'),
    '-- blob truncated: 300 bytes, 4096 bytes',
    toInsertStatements('t', columns, [rows[2]], 'sqlite'),
  ].join('\n');
  assert.equal(text, expected);
});

test('INSERT copy keeps text literals with newlines intact and adds no comment for them', () => {
  const rows = [[1, "line one\n-- blob truncated: 1 bytes\nline 'three'", null, null]];
  const { text, truncatedBlobs } = toInsertCopy('t', columns, rows, 'sqlite');
  assert.equal(truncatedBlobs, 0);
  assert.equal(text, toInsertStatements('t', columns, rows, 'sqlite'));
  assert.match(text, /'line one\n-- blob truncated: 1 bytes\nline ''three'''/);
  assert.ok(text.startsWith('INSERT INTO'));
});

test('INSERT copy without truncated blobs matches toInsertStatements', () => {
  const rows = [[1, 'a', null, null], [2, 'b', toCell(new Uint8Array(10)), null]];
  assert.deepEqual(toInsertCopy('t', columns, rows, 'sqlite'), {
    text: toInsertStatements('t', columns, rows, 'sqlite'),
    truncatedBlobs: 0,
  });
});
