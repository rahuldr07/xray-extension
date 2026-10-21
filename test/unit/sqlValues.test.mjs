import test from 'node:test';
import assert from 'node:assert/strict';
import './harness.mjs';

const { toCell, displayCell, toCsv, toJsonRows, toInsertStatements, quoteIdent, clampMaxRows, CELL_DISPLAY_LIMIT } =
  await import('../../src/panel/models/sqlValues.ts');

test('toCell keeps values lossless', () => {
  assert.equal(toCell(9007199254740993n), '9007199254740993');
  assert.equal(toCell(NaN), 'NaN');
  assert.equal(toCell(Infinity), 'Infinity');
  assert.equal(toCell(1.5), 1.5);
  assert.equal(toCell(null), null);
  assert.equal(toCell(undefined), null);
  assert.equal(toCell(true), true);
  assert.equal(toCell('x'), 'x');
  assert.equal(toCell(Symbol.for('s')), 'Symbol(s)');
  const big = toCell(new Uint8Array(300));
  assert.equal(big.length, 300);
  assert.equal(big.hex.length, 512);
  assert.deepEqual(toCell(new Uint8Array([0xab, 0x01])), { hex: 'ab01', length: 2 });
});

test('displayCell renders each kind', () => {
  assert.deepEqual(displayCell(null), { text: 'NULL', truncated: false, kind: 'null' });
  assert.equal(displayCell(5).kind, 'number');
  assert.equal(displayCell(true).kind, 'boolean');
  assert.equal(displayCell(true).text, 'true');
  const blob = displayCell({ hex: 'ab01', length: 2 });
  assert.equal(blob.kind, 'blob');
  assert.ok(blob.text.startsWith('\\xab01…'));
  assert.ok(blob.text.includes('2'));
  const long = displayCell('x'.repeat(70000));
  assert.equal(long.truncated, true);
  assert.equal(long.text.length, CELL_DISPLAY_LIMIT);
  assert.equal(CELL_DISPLAY_LIMIT, 65536);
  assert.equal(displayCell('{"a":1}').kind, 'json');
  assert.equal(displayCell('  [1,2]').kind, 'json');
  assert.equal(displayCell('{oops').kind, 'text');
  assert.equal(displayCell('plain').kind, 'text');
});

const cols = [
  { name: 'a', type: 'text' },
  { name: 'b', type: 'blob' },
];

test('toCsv follows RFC 4180', () => {
  const csv = toCsv([cols[0]], [['a,"b"\nc'], [null], ['plain']]);
  assert.equal(csv, 'a\r\n"a,""b""\nc"\r\n\r\nplain');
  assert.equal(toCsv(cols, [[1, { hex: 'ff', length: 1 }]]), 'a,b\r\n1,ff');
  assert.equal(toCsv([{ name: 'x,y', type: '' }], []), '"x,y"');
});

test('toJsonRows emits objects with blobs as hex/length', () => {
  const out = JSON.parse(toJsonRows(cols, [['s', { hex: 'ff', length: 1 }], [null, null]]));
  assert.deepEqual(out, [
    { a: 's', b: { hex: 'ff', length: 1 } },
    { a: null, b: null },
  ]);
  assert.ok(toJsonRows(cols, [['s', null]]).includes('\n  '));
});

test('toInsertStatements quotes per dialect', () => {
  const sql = toInsertStatements('my table', cols, [["it's", { hex: 'ab', length: 1 }], [null, 3], [true, false]], 'mysql');
  const lines = sql.split('\n');
  assert.equal(lines[0], "INSERT INTO `my table` (`a`, `b`) VALUES ('it''s', X'ab');");
  assert.equal(lines[1], 'INSERT INTO `my table` (`a`, `b`) VALUES (NULL, 3);');
  assert.equal(lines[2], 'INSERT INTO `my table` (`a`, `b`) VALUES (TRUE, FALSE);');
  const pg = toInsertStatements('t"x', [{ name: 'c"d', type: '' }], [[1]], 'postgres');
  assert.equal(pg, 'INSERT INTO "t""x" ("c""d") VALUES (1);');
  assert.equal(quoteIdent('a`b', 'mysql'), '`a``b`');
  assert.equal(quoteIdent('a"b', 'sqlite'), '"a""b"');
});

test('clampMaxRows bounds the cap', () => {
  assert.equal(clampMaxRows(0), 1);
  assert.equal(clampMaxRows(1e9), 50000);
  assert.equal(clampMaxRows(NaN), 1000);
  assert.equal(clampMaxRows(12.9), 12);
  assert.equal(clampMaxRows(-5), 1);
});
