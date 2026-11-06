// #19 (spec §1): a cell and row range selection in the results grid, copied through the same
// CSV / JSON / INSERT models as copy-all, with the R9 blob notice and the cut-text notice.
import test from 'node:test';
import assert from 'node:assert/strict';
import './harness.mjs';

const {
  selectionBounds, isCellSelected, extendSelection, selectAll, selectRows, clampSelection, hasRange,
  selectionSlice, countCutText, cutTextNotice, copySlice,
} = await import('../../src/panel/models/sqlSelection.ts');

const cols = [{ name: 'id', type: 'int' }, { name: 'name', type: 'text' }, { name: 'photo', type: 'blob' }];
const cut = { hex: 'ab'.repeat(256), length: 4096 };
// Source rows; the view shows them sorted descending by id (order maps view row → source row).
const rows = [[1, 'ann', null], [2, 'bob', cut], [3, 'cy', null]];
const order = [2, 1, 0];

test('a range is anchor to focus in either direction; a single cell is not a range', () => {
  const sel = { anchor: { row: 3, col: 2 }, focus: { row: 1, col: 0 } };
  assert.deepEqual(selectionBounds(sel), { top: 1, bottom: 3, left: 0, right: 2 });
  assert.equal(isCellSelected(sel, 2, 1), true);
  assert.equal(isCellSelected(sel, 4, 1), false);
  assert.equal(isCellSelected(null, 0, 0), false);
  assert.equal(hasRange(sel), true);
  assert.equal(hasRange({ anchor: { row: 1, col: 1 }, focus: { row: 1, col: 1 } }), false);
  assert.equal(hasRange(null), false);
});

test('extendSelection keeps the anchor, or starts from the active cell', () => {
  const active = { row: 2, col: 1 };
  assert.deepEqual(extendSelection(null, active, { row: 4, col: 1 }), { anchor: active, focus: { row: 4, col: 1 } });
  const sel = { anchor: { row: 0, col: 0 }, focus: { row: 1, col: 1 } };
  assert.deepEqual(extendSelection(sel, active, { row: 5, col: 2 }), { anchor: { row: 0, col: 0 }, focus: { row: 5, col: 2 } });
});

test('selectAll and selectRows cover whole rows; an empty grid has no selection', () => {
  assert.deepEqual(selectAll(3, 2), { anchor: { row: 0, col: 0 }, focus: { row: 2, col: 1 } });
  assert.equal(selectAll(0, 2), null);
  assert.equal(selectAll(3, 0), null);
  assert.deepEqual(selectRows(4, 1, 3), { anchor: { row: 4, col: 0 }, focus: { row: 1, col: 2 } });
  assert.equal(hasRange(selectRows(1, 1, 3)), true, 'one whole row of several columns is a range');
});

test('clampSelection fits a selection to a smaller grid, or drops it', () => {
  const sel = { anchor: { row: 0, col: 0 }, focus: { row: 9, col: 9 } };
  assert.deepEqual(clampSelection(sel, 3, 2), { anchor: { row: 0, col: 0 }, focus: { row: 2, col: 1 } });
  assert.equal(clampSelection(sel, 0, 2), null);
  assert.equal(clampSelection(null, 3, 2), null);
});

test('selectionSlice maps view rows to source rows and keeps the selected columns in order', () => {
  // View rows 0–1 are source rows 2 and 1; columns name..photo.
  const slice = selectionSlice({ anchor: { row: 1, col: 2 }, focus: { row: 0, col: 1 } }, cols, rows, order);
  assert.deepEqual(slice.columns.map((c) => c.name), ['name', 'photo']);
  assert.deepEqual(slice.rows, [['cy', null], ['bob', cut]]);
  assert.deepEqual(slice.sourceRows, [2, 1]);
  assert.deepEqual(slice.sourceCols, [1, 2]);
  // No selection: everything shown, in view order.
  const all = selectionSlice(null, cols, rows, order);
  assert.deepEqual(all.rows.map((r) => r[0]), [3, 2, 1]);
  assert.deepEqual(all.sourceCols, [0, 1, 2]);
});

test('countCutText counts the marked text cells inside the copied rows and columns', () => {
  const result = { columns: cols, rows, truncatedCells: 2, cutCells: [[1, 1], [2, 0]] };
  assert.equal(countCutText(result, [0, 1, 2], [0, 1, 2]), 2);
  assert.equal(countCutText(result, [1], [1, 2]), 1);
  assert.equal(countCutText(result, [2], [1, 2]), 0);
  // A helper without per-cell marks: only a copy of every row and column can say how many.
  const unmarked = { columns: cols, rows, truncatedCells: 2 };
  assert.equal(countCutText(unmarked, [0, 1, 2], [0, 1, 2]), 2);
  assert.equal(countCutText(unmarked, [0, 1], [0, 1, 2]), 0);
  assert.equal(cutTextNotice(2), '2 long text values were cut');
});

test('copySlice builds CSV, JSON and INSERT from the slice, with both notices', () => {
  const result = { columns: cols, rows, truncatedCells: 1, cutCells: [[1, 1]] };
  const slice = selectionSlice({ anchor: { row: 1, col: 1 }, focus: { row: 1, col: 2 } }, cols, rows, order);
  const csv = copySlice('CSV', result, slice, 'people', 'sqlite');
  assert.equal(csv.text, `name,photo\r\nbob,${cut.hex}`);
  assert.deepEqual(csv.notices, ['1 blob values were truncated to 256 bytes', '1 long text values were cut']);
  const json = copySlice('JSON', result, slice, 'people', 'sqlite');
  assert.deepEqual(JSON.parse(json.text), [{ name: 'bob', photo: cut }]);
  const insert = copySlice('INSERT', result, slice, 'people', 'postgres');
  assert.equal(insert.text, `-- blob truncated: 4096 bytes\nINSERT INTO "people" ("name", "photo") VALUES ('bob', X'${cut.hex}');`);
  assert.equal(insert.notices.length, 2);
  // Nothing cut in the slice: no notices.
  const clean = selectionSlice({ anchor: { row: 0, col: 0 }, focus: { row: 0, col: 1 } }, cols, rows, order);
  assert.deepEqual(copySlice('CSV', result, clean, 'people', 'sqlite').notices, []);
});
