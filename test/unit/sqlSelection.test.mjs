// #19 (spec §1): a cell and row range selection in the results grid, copied through the same
// CSV / JSON / INSERT models as copy-all, with the R9 blob notice and the cut-text notice. The
// selection is kept as source rows plus columns, so it survives a sort, a filter and Fetch more.
import test from 'node:test';
import assert from 'node:assert/strict';
import './harness.mjs';

const {
  selectRange, extendSelection, selectAll, selectRows, selectionLookup, reconcileSelection, isAppended,
  selectionSlice, countCutText, cutTextNotice, copySlice, COPY_CELL_LIMIT, COPY_CAPPED_NOTICE,
} = await import('../../src/panel/models/sqlSelection.ts');

const cols = [{ name: 'id', type: 'int' }, { name: 'name', type: 'text' }, { name: 'photo', type: 'blob' }];
const cut = { hex: 'ab'.repeat(256), length: 4096 };
// Source rows; the view shows them sorted descending by id (order maps view row → source row).
const rows = [[1, 'ann', null], [2, 'bob', cut], [3, 'cy', null]];
const order = [2, 1, 0];

test('a range is stored as source rows and columns, from an anchor in either direction', () => {
  const sel = selectRange(order, { row: 1, col: 2 }, { row: 0, col: 1 });
  assert.deepEqual(sel, { rows: [1, 2], left: 1, right: 2, anchor: { row: 1, col: 2 } });
  const at = selectionLookup(sel);
  assert.equal(at(2, 1), true);
  assert.equal(at(0, 1), false);
  assert.equal(at(1, 0), false);
  assert.equal(selectionLookup(null)(0, 0), false);
});

test('extendSelection keeps the anchor, or starts from the active cell, also after a sort', () => {
  const active = { row: 2, col: 1 };
  assert.deepEqual(extendSelection(null, order, active, { row: 1, col: 1 }), { rows: [0, 1], left: 1, right: 1, anchor: { row: 0, col: 1 } });
  const sel = selectRange(order, { row: 0, col: 0 }, { row: 0, col: 0 }); // source row 2
  // Sorted the other way: source row 2 is now at view row 2.
  const ascending = [0, 1, 2];
  assert.deepEqual(extendSelection(sel, ascending, { row: 0, col: 0 }, { row: 1, col: 2 }).rows, [1, 2]);
  // The anchor row filtered out: extend from the active cell.
  assert.deepEqual(extendSelection(sel, [0, 1], { row: 0, col: 0 }, { row: 1, col: 0 }).rows, [0, 1]);
});

test('selectAll and selectRows cover whole rows; an empty grid has no selection', () => {
  assert.deepEqual(selectAll(order, 3), { rows: [0, 1, 2], left: 0, right: 2, anchor: { row: 2, col: 0 } });
  assert.equal(selectAll([], 2), null);
  assert.equal(selectAll(order, 0), null);
  assert.deepEqual(selectRows(null, order, 0, 1, 3, false).rows, [1]);
  // Shift: from the anchor's row (or the active row) to this one.
  const one = selectRows(null, order, 0, 2, 3, false);
  assert.deepEqual(selectRows(one, order, 0, 0, 3, true).rows, [0, 1, 2]);
  assert.deepEqual(selectRows(null, order, 1, 2, 3, true).rows, [0, 1]);
  // A single row of a one-column result is still a selection.
  assert.deepEqual(selectRows(null, [0, 1], 0, 1, 1, false), { rows: [1], left: 0, right: 0, anchor: { row: 1, col: 0 } });
});

test('reconcileSelection: filtered-out rows leave the selection, none left clears it', () => {
  const sel = selectAll(order, 3);
  assert.equal(reconcileSelection(sel, [0, 2, 1], 3), sel, 'a sort keeps it as it is');
  assert.deepEqual(reconcileSelection(sel, [2], 3).rows, [2]);
  assert.equal(reconcileSelection(sel, [], 3), null);
  assert.equal(reconcileSelection(selectRange(order, { row: 0, col: 1 }, { row: 0, col: 1 }), [2], 1), null, 'its columns are gone');
  assert.equal(reconcileSelection(null, order, 3), null);
});

test('isAppended tells Fetch more from a new result', () => {
  const columns = [{ name: 'n', type: 'int' }];
  const a = [1], b = [2], c = [3];
  const prev = { columns, rows: [a, b] };
  assert.equal(isAppended(prev, { ...prev, rows: [a, b, c] }), true);
  assert.equal(isAppended(prev, { ...prev, rows: [[1], [2], c] }), false, 'a re-run brings new rows');
  assert.equal(isAppended(prev, { ...prev, columns: [...columns] }), false);
  assert.equal(isAppended(null, prev), false);
});

test('selectionSlice maps to source rows in view order and keeps the selected columns', () => {
  const slice = selectionSlice(selectRange(order, { row: 1, col: 2 }, { row: 0, col: 1 }), cols, rows, order);
  assert.deepEqual(slice.columns.map((c) => c.name), ['name', 'photo']);
  assert.deepEqual(slice.rows, [['cy', null], ['bob', cut]]);
  assert.deepEqual(slice.sourceRows, [2, 1]);
  assert.deepEqual(slice.sourceCols, [1, 2]);
  assert.equal(slice.capped, false);
  const all = selectionSlice(null, cols, rows, order);
  assert.deepEqual(all.rows.map((r) => r[0]), [3, 2, 1]);
});

test('a copy holds at most 200,000 cells: the first whole rows, and says so', () => {
  assert.equal(COPY_CELL_LIMIT, 200_000);
  assert.equal(COPY_CAPPED_NOTICE, 'Copied the first 200,000 cells; narrow the selection to copy the rest.');
  const many = Array.from({ length: 70_000 }, (_, i) => [i, 'x', null]);
  const view = many.map((_, i) => i);
  const slice = selectionSlice(null, cols, many, view);
  assert.equal(slice.capped, true);
  assert.equal(slice.rows.length, 66_666);
  assert.ok(slice.rows.length * slice.columns.length <= COPY_CELL_LIMIT);
  assert.equal(slice.rows[0][0], 0, 'from the first row');
  assert.equal(selectionSlice(null, cols, many, view.slice(0, 1000)).capped, false);
  // Small limit, wide rows: never more cells than the limit.
  assert.equal(selectionSlice(null, cols, rows, order, 2).columns.length, 2);
});

test('countCutText counts marked text cells; an empty list means nothing was cut', () => {
  const result = { columns: cols, rows, truncatedCells: 2, cutCells: [[1, 1], [2, 0]] };
  assert.equal(countCutText(result, [0, 1, 2], [0, 1, 2]), 2);
  assert.equal(countCutText(result, [1], [1, 2]), 1);
  assert.equal(countCutText(result, [2], [1, 2]), 0);
  // A helper with marks that cut only blobs: truncatedCells counts them, cutCells is empty.
  assert.equal(countCutText({ columns: cols, rows, truncatedCells: 1, cutCells: [] }, [0, 1, 2], [0, 1, 2]), 0);
  // A helper without per-cell marks: only a copy of every row and column can say how many.
  const unmarked = { columns: cols, rows, truncatedCells: 2 };
  assert.equal(countCutText(unmarked, [0, 1, 2], [0, 1, 2]), 2);
  assert.equal(countCutText(unmarked, [0, 1], [0, 1, 2]), 0);
  assert.equal(cutTextNotice(2), '2 long text values were cut');
});

test('copySlice builds CSV, JSON and INSERT from the slice, with both notices', () => {
  const result = { columns: cols, rows, truncatedCells: 1, cutCells: [[1, 1]] };
  const slice = selectionSlice(selectRange(order, { row: 1, col: 1 }, { row: 1, col: 2 }), cols, rows, order);
  const csv = copySlice('CSV', result, slice, 'people', 'sqlite');
  assert.equal(csv.text, `name,photo\r\nbob,${cut.hex}`);
  assert.deepEqual(csv.notices, ['1 blob values were truncated to 256 bytes', '1 long text values were cut']);
  const json = copySlice('JSON', result, slice, 'people', 'sqlite');
  assert.deepEqual(JSON.parse(json.text), [{ name: 'bob', photo: cut }]);
  const insert = copySlice('INSERT', result, slice, 'people', 'postgres');
  assert.equal(insert.text, `-- blob truncated: 4096 bytes\nINSERT INTO "people" ("name", "photo") VALUES ('bob', X'${cut.hex}');`);
  assert.equal(insert.notices.length, 2);
  const clean = selectionSlice(selectRange(order, { row: 0, col: 0 }, { row: 0, col: 1 }), cols, rows, order);
  assert.deepEqual(copySlice('CSV', result, clean, 'people', 'sqlite').notices, []);
});
