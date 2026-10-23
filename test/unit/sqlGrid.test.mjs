import test from 'node:test';
import assert from 'node:assert/strict';
import './harness.mjs';

const {
  columnWidths,
  columnTypeLabel,
  indexColumnWidth,
  nextSort,
  sortRows,
  filterRows,
  filterIndexes,
  viewOrder,
  columnsKey,
  primaryKeyColumns,
  filteredSummary,
  cellCopyText,
  COLUMN_MIN_PX,
  COLUMN_MAX_PX,
} = await import('../../src/panel/models/sqlGrid.ts');

const chars = (text) => text.length * 10;

test('columnWidths sizes from the header and the first 50 rows, clamped to 64–480 px', () => {
  const columns = [
    { name: 'id', type: 'INTEGER' },
    { name: 'meta', type: 'TEXT' },
    { name: 'x', type: '' },
    { name: 'body', type: 'TEXT' },
  ];
  const rows = [
    [1, '{"gift":true}', null, 'y'.repeat(500)],
    [2, null, null, 'short'],
  ];
  const [id, meta, x, body] = columnWidths(columns, rows, chars);
  // id: the type label INTEGER (7 chars) + header room beats "1".
  assert.equal(id, 7 * 10 + 22);
  // meta: the JSON text (13 chars) + padding beats its header.
  assert.equal(meta, 13 * 10 + 16);
  assert.ok(meta > id, 'a wide column is wider than id');
  assert.equal(x, COLUMN_MIN_PX, 'never narrower than the minimum');
  assert.equal(body, COLUMN_MAX_PX, 'never wider than the maximum');

  // Only the first 50 rows are sampled.
  const many = Array.from({ length: 60 }, (_, i) => [i < 50 ? 'a' : 'z'.repeat(40)]);
  assert.equal(columnWidths([{ name: 'c', type: '' }], many, chars)[0], COLUMN_MIN_PX);
});

test('the type label falls back to an em dash', () => {
  assert.equal(columnTypeLabel('integer'), 'INTEGER');
  assert.equal(columnTypeLabel(''), '—');
  assert.equal(columnTypeLabel('  '), '—');
});

test('the row-number column stays narrow', () => {
  assert.equal(indexColumnWidth(9, chars), 40);
  assert.equal(indexColumnWidth(100, chars), 46);
  assert.equal(indexColumnWidth(50000000, chars), 72);
});

test('header clicks cycle ascending, descending, unsorted', () => {
  assert.deepEqual(nextSort(null, 2), { col: 2, dir: 'asc' });
  assert.deepEqual(nextSort({ col: 2, dir: 'asc' }, 2), { col: 2, dir: 'desc' });
  assert.equal(nextSort({ col: 2, dir: 'desc' }, 2), null);
  assert.deepEqual(nextSort({ col: 2, dir: 'desc' }, 0), { col: 0, dir: 'asc' });
});

test('sortRows compares numeric strings as numbers and keeps NULLs last', () => {
  const rows = [['10'], [null], ['9'], [2.5], ['apple'], ['Banana'], ['9007199254740993'], [null], [{ hex: '00', length: 1 }]];
  const asc = sortRows(rows, { col: 0, dir: 'asc' }).map((r) => r[0]);
  assert.deepEqual(asc, [2.5, '9', '10', '9007199254740993', 'apple', 'Banana', { hex: '00', length: 1 }, null, null]);
  const desc = sortRows(rows, { col: 0, dir: 'desc' }).map((r) => r[0]);
  assert.deepEqual(desc, [{ hex: '00', length: 1 }, 'Banana', 'apple', '9007199254740993', '10', '9', 2.5, null, null]);
  assert.deepEqual(rows[0], ['10'], 'the input is not mutated');
  assert.notEqual(sortRows(rows, null), rows, 'unsorted is a copy');
  assert.deepEqual(sortRows(rows, null), rows);
});

test('sortRows is stable for equal keys', () => {
  const rows = [[1, 'a'], [0, 'b'], [1, 'c'], [0, 'd']];
  assert.deepEqual(sortRows(rows, { col: 0, dir: 'asc' }).map((r) => r[1]), ['b', 'd', 'a', 'c']);
  assert.deepEqual(sortRows(rows, { col: 0, dir: 'desc' }).map((r) => r[1]), ['a', 'c', 'b', 'd']);
});

test('filterRows matches the displayed text of any cell, ignoring case', () => {
  const columns = [{ name: 'id', type: 'INTEGER' }, { name: 'meta', type: 'TEXT' }, { name: 'flag', type: '' }];
  const rows = [
    [1, '{"gift":true}', null],
    [2, null, 'GIFTED'],
    [3, 'x', 'y'],
    [4, { hex: 'abcd', length: 2 }, true],
  ];
  assert.deepEqual(filterRows(rows, columns, 'gift').map((r) => r[0]), [1, 2]);
  // NULL cells show "NULL", and the filter matches what is shown.
  assert.deepEqual(filterRows(rows, columns, 'null').map((r) => r[0]), [1, 2]);
  // A blob is shown as \xabcd… (2 bytes).
  assert.deepEqual(filterRows(rows, columns, '\\xab').map((r) => r[0]), [4]);
  assert.deepEqual(filterRows(rows, columns, '2 bytes').map((r) => r[0]), [4]);
  assert.deepEqual(filterRows(rows, columns, 'tru').map((r) => r[0]), [1, 4]);
  assert.equal(filterRows(rows, columns, '  ').length, 4);
  assert.deepEqual(filterIndexes(rows, columns, 'gift'), [0, 1]);
  assert.equal(filteredSummary(12, 100, 4.6), '12 of 100 rows · 5 ms');
});

test('viewOrder filters then sorts, as indexes into the loaded rows', () => {
  const columns = [{ name: 'n', type: 'INTEGER' }, { name: 's', type: 'TEXT' }];
  const rows = [[3, 'keep'], [1, 'drop'], [2, 'keep'], [null, 'keep']];
  assert.deepEqual(viewOrder(rows, columns, 'keep', { col: 0, dir: 'desc' }), [0, 2, 3]);
  assert.deepEqual(viewOrder(rows, columns, '', { col: 0, dir: 'asc' }), [1, 2, 0, 3]);
  assert.deepEqual(viewOrder(rows, columns, '', null), [0, 1, 2, 3]);
});

test('columnsKey changes with a column name or type, and primaryKeyColumns reads the previewed table', () => {
  const a = columnsKey([{ name: 'id', type: 'INTEGER' }, { name: 'v', type: '' }]);
  assert.equal(a, columnsKey([{ name: 'id', type: 'INTEGER' }, { name: 'v', type: '' }]));
  assert.notEqual(a, columnsKey([{ name: 'id', type: 'TEXT' }, { name: 'v', type: '' }]));
  assert.notEqual(a, columnsKey([{ name: 'idv', type: 'INTEGER' }]));
  const col = (name, pk) => ({ name, type: '', nullable: true, defaultValue: null, pk });
  const schema = {
    schemas: [
      { name: 'main', tables: [{ name: 'orders', columns: [col('id', true), col('total', false)], indexes: [] }], views: [] },
      { name: 'aux', tables: [{ name: 'other', columns: [col('k', true)], indexes: [] }], views: [] },
    ],
  };
  assert.deepEqual([...primaryKeyColumns(schema, 'orders')], ['id']);
  assert.deepEqual([...primaryKeyColumns(schema, 'other')], [], 'only the main schema is previewed by name');
  assert.deepEqual([...primaryKeyColumns(schema, null)], []);
  assert.deepEqual([...primaryKeyColumns(null, 'orders')], []);
});

test('cellCopyText pretty-prints JSON, writes blobs as \\x hex like the cell and flags a cut blob', () => {
  assert.deepEqual(cellCopyText('{"gift":true,"n":1.50}'), { text: '{\n  "gift": true,\n  "n": 1.50\n}', truncatedBlob: false });
  assert.deepEqual(cellCopyText('plain'), { text: 'plain', truncatedBlob: false });
  assert.deepEqual(cellCopyText(null), { text: 'NULL', truncatedBlob: false });
  assert.deepEqual(cellCopyText(12.5), { text: '12.5', truncatedBlob: false });
  assert.deepEqual(cellCopyText({ hex: 'ab01', length: 2 }), { text: '\\xab01', truncatedBlob: false });
  assert.deepEqual(cellCopyText({ hex: 'ab', length: 300 }), { text: '\\xab', truncatedBlob: true });
});
