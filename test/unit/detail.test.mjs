/* Behavioural tests for src/panel/models/detail.ts. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { detail as D, viz, apiEntry, assertSchemaFallback } from './harness.mjs';

const { detailValue, detailViews, gridRows, structuralDiff, timingPhases, vizSummary } = D;

const byPath = (lines) => Object.fromEntries(lines.map((line) => [line.path, line.kind]));

// ------------------------------------------------------------- timingPhases

test('timingPhases uses real Resource Timing when present and drops zero phases', () => {
  const entry = apiEntry({
    duration: 999,
    timing: { totalMs: 250, dnsMs: 10, connectMs: 40, tlsMs: 15, ttfbMs: 120, downloadMs: 30 },
  });
  const { phases, totalMs, real } = timingPhases(entry);
  assert.equal(real, true);
  assert.equal(totalMs, 250, 'the timing total wins over entry.duration');
  assert.deepEqual(phases.map((phase) => [phase.label, phase.ms]), [
    ['DNS', 10],
    ['Connect', 25],
    ['TLS', 15],
    ['Wait (TTFB)', 120],
    ['Download', 30],
  ]);
  assert.deepEqual(phases.map((phase) => phase.className), ['dns', 'connect', 'tls', 'ttfb', 'download']);
});

test('timingPhases clamps a TLS span larger than the connect span to zero and omits it', () => {
  const entry = apiEntry({ timing: { totalMs: 100, connectMs: 10, tlsMs: 40, ttfbMs: 60 } });
  const { phases } = timingPhases(entry);
  assert.deepEqual(phases.map((phase) => phase.label), ['TLS', 'Wait (TTFB)'], 'Connect collapses to 0 and is dropped');
});

test('timingPhases falls back to a single wall-clock bar', () => {
  for (const timing of [undefined, null, { totalMs: 0 }, { totalMs: -5 }]) {
    const result = timingPhases(apiEntry({ duration: 321, timing }));
    assert.equal(result.real, false);
    assert.equal(result.totalMs, 321);
    assert.deepEqual(result.phases, [{ label: 'Total', ms: 321, className: 'total' }]);
  }
  const negative = timingPhases(apiEntry({ duration: -5, timing: null }));
  assert.equal(negative.totalMs, 0, 'a negative duration clamps to 0');
});

// -------------------------------------------------------------- detailValue

test('detailValue routes each tab to the right slice of the entry', () => {
  const entry = apiEntry({
    requestBody: '{"q":1}',
    responseRaw: '{"r":2}',
    requestHeaders: { a: '1' },
    responseHeaders: { b: '2' },
  });
  assert.deepEqual(detailValue(entry, 'request'), { q: 1 });
  assert.deepEqual(detailValue(entry, 'response'), { r: 2 });
  assert.deepEqual(detailValue(entry, 'headers'), { requestHeaders: { a: '1' }, responseHeaders: { b: '2' } });

  const bare = apiEntry({ requestHeaders: undefined, responseHeaders: undefined });
  assert.deepEqual(detailValue(bare, 'headers'), { requestHeaders: {}, responseHeaders: {} });
});

test('detailViews lists every view the panel can render', () => {
  assert.deepEqual(detailViews, ['tree', 'grid', 'raw', 'schema', 'diff', 'viz', 'waterfall', 'headers']);
});

// ----------------------------------------------------------------- gridRows

test('gridRows finds the row array, keeps object rows only, and unions the columns', () => {
  assert.deepEqual(gridRows([{ a: 1 }, { b: 2 }]), { objects: [{ a: 1 }, { b: 2 }], columns: ['a', 'b'] });
  assert.deepEqual(gridRows({ items: [{ a: 1 }] }), { objects: [{ a: 1 }], columns: ['a'] }, 'the first array-valued property wins');
  assert.deepEqual(gridRows({ a: 1 }), { objects: [{ a: 1 }], columns: ['a'] }, 'a bare object is one row');
  assert.deepEqual(gridRows([1, 'x', null, [1]]), { objects: [], columns: [] }, 'non-object rows are dropped');
  assert.deepEqual(gridRows('text'), { objects: [], columns: [] });
  assert.deepEqual(gridRows(null), { objects: [], columns: [] });
});

test('gridRows caps at 200 rows and 20 columns per row', () => {
  const many = Array.from({ length: 250 }, (_, i) => ({ i }));
  assert.equal(gridRows(many).objects.length, 200);

  const wide = [Object.fromEntries(Array.from({ length: 40 }, (_, i) => [`c${i}`, i]))];
  assert.equal(gridRows(wide).columns.length, 20, 'only the first 20 keys of a row become columns');
  assert.equal(Object.keys(gridRows(wide).objects[0]).length, 40, 'the row data itself is not trimmed');
});

// --------------------------------------------------------------- vizSummary

test('vizSummary reports the inferred schema and a row count', () => {
  assertSchemaFallback(assert);
  assert.deepEqual(vizSummary([{ a: 1 }, { a: 2 }]), { inferredType: [{ a: 'number' }], rows: 2 });
  assert.deepEqual(vizSummary({ a: 'x' }), { inferredType: { a: 'string' }, rows: 1 });
  assert.deepEqual(vizSummary('plain'), { inferredType: 'string', rows: 0 });
  assert.deepEqual(vizSummary(null), { inferredType: 'null', rows: 0 });
  assert.deepEqual(vizSummary([]), { inferredType: 'array', rows: 0 });
});

// ------------------------------------------------------------ structuralDiff

test('structuralDiff reports added, removed and changed leaves with dotted paths', () => {
  const lines = structuralDiff(
    { keep: 1, drop: 2, change: 'a', nested: { deep: 1 } },
    { keep: 1, add: 3, change: 'b', nested: { deep: 2 } },
  );
  assert.deepEqual(byPath(lines), { drop: 'removed', add: 'added', change: 'changed', 'nested.deep': 'changed' });
  const changed = lines.find((line) => line.path === 'change');
  assert.equal(changed.before, 'a');
  assert.equal(changed.after, 'b');
  const added = lines.find((line) => line.path === 'add');
  assert.equal(added.after, 3);
  assert.equal('before' in added, false);
});

test('structuralDiff returns [] for identical structures', () => {
  assert.deepEqual(structuralDiff({ a: [1, 2, { b: 'c' }] }, { a: [1, 2, { b: 'c' }] }), []);
  assert.deepEqual(structuralDiff(null, null), []);
  assert.deepEqual(structuralDiff(undefined, undefined), []);
});

test('structuralDiff treats a whole-value type flip as one changed line', () => {
  assert.deepEqual(structuralDiff([1, 2], { a: 1 }), [{ path: '', kind: 'changed', before: [1, 2], after: { a: 1 } }]);
  assert.deepEqual(structuralDiff({ a: 1 }, 'text').map((line) => line.kind), ['changed']);
  assert.deepEqual(structuralDiff(null, { a: 1 }).map((line) => line.kind), ['changed'], 'null is not object-like here');
});

test('structuralDiff uses Object.is, so NaN==NaN and 0 !== -0', () => {
  assert.deepEqual(structuralDiff({ v: NaN }, { v: NaN }), []);
  assert.deepEqual(structuralDiff({ v: 0 }, { v: -0 }).map((line) => line.kind), ['changed']);
});

test('structuralDiff walks arrays by index', () => {
  const lines = structuralDiff([1, 2, 3], [1, 9, 3, 4]);
  assert.deepEqual(byPath(lines), { '[1]': 'changed', '[3]': 'added' });
  assert.deepEqual(structuralDiff([1, 2, 3], [1, 2]).map((line) => line.path), ['[2]']);
});

test('CAP structuralDiff stops at maxLines', () => {
  const before = Object.fromEntries(Array.from({ length: 500 }, (_, i) => [`k${i}`, i]));
  const after = Object.fromEntries(Array.from({ length: 500 }, (_, i) => [`k${i}`, i + 1]));
  assert.equal(structuralDiff(before, after).length, 200, 'default cap');
  assert.equal(structuralDiff(before, after, 5).length, 5, 'explicit cap');
  assert.equal(structuralDiff(before, after, 0).length, 0);
});

test('CAP structuralDiff stops descending past depth 6', () => {
  const nest = (leaf) => ({ a: { b: { c: { d: { e: { f: { g: leaf } } } } } } });
  // a=1 b=2 c=3 d=4 e=5 f=6 g=7 — the walk into `g` is at depth 7 and is skipped.
  assert.deepEqual(structuralDiff(nest('x'), nest('y')), [], 'a change at depth 7 is invisible');
  const shallower = (leaf) => ({ a: { b: { c: { d: { e: { f: leaf } } } } } });
  assert.deepEqual(structuralDiff(shallower('x'), shallower('y')).map((line) => line.path), ['a.b.c.d.e.f']);
});

test('CAP structuralDiff compares at most the first 50 array indices, and says when it stopped', () => {
  const before = Array.from({ length: 60 }, (_, i) => i);
  const after = before.slice();
  after[10] = 'changed-early';
  after[55] = 'changed-late';
  const lines = structuralDiff(before, after);
  assert.deepEqual(lines.map((line) => line.path), ['[10]', '[…]'],
    'index 55 is past the scan window, so the […] notice reports the cap was hit');
});

test('FIXED detail.ts:106-111 — differences past index 50 no longer vanish for equal-length arrays', () => {
  const before = Array.from({ length: 60 }, (_, i) => i);
  const equalLength = before.slice();
  equalLength[55] = 'DIFFERENT';
  // Was: the `prev.length !== curr.length` guard blocked the "[…]" summary line,
  // so two demonstrably different 60-element arrays diffed to NOTHING. The notice
  // is now driven by the cap alone, which is what it was always documenting.
  const lines = structuralDiff(before, equalLength);
  assert.deepEqual(lines.map((line) => line.path), ['[…]'], 'the truncation notice fires');
  assert.equal(lines[0].before, '60 items');
  assert.equal(lines[0].after, '60 items');

  // A length change still produces the same line, now with differing counts.
  const differentLength = before.slice(0, 59);
  differentLength[55] = 'DIFFERENT';
  const changed = structuralDiff(before, differentLength);
  assert.deepEqual(changed.map((line) => line.path), ['[…]']);
  assert.equal(changed[0].before, '60 items');
  assert.equal(changed[0].after, '59 items');

  // Arrays inside the window are unaffected: no cap hit, no notice.
  assert.deepEqual(structuralDiff([1, 2, 3], [1, 2, 3]), [], 'identical short arrays still diff to nothing');
});

test('structuralDiff scopes the array cap to each array, not the whole payload', () => {
  const mk = (marker) => ({
    left: Array.from({ length: 60 }, (_, i) => (i === 55 ? marker : i)),
    right: Array.from({ length: 3 }, (_, i) => (i === 1 ? marker : i)),
  });
  const lines = structuralDiff(mk('a'), mk('b'));
  assert.deepEqual(lines.map((line) => line.path), ['left[…]', 'right[1]'],
    'the long array reports its cap; the short array is still fully compared');
});

test('FIXED: two identical long arrays are not reported as a difference', () => {
  // structuralDiff emitted a synthetic `[…]` line whenever an array exceeded 50
  // elements, WITHOUT comparing anything — so two byte-identical 60-row responses
  // rendered "1 difference vs the previous call". Any endpoint returning more than 50
  // rows (a paginated list at limit=100 is the norm) could never show "no differences",
  // which is exactly where the Diff view earns its place.
  const rows = (n, tweak = -1) =>
    Array.from({ length: n }, (_, index) => ({ id: index, name: index === tweak ? 'CHANGED' : `row ${index}` }));

  assert.deepEqual(structuralDiff({ items: rows(60) }, { items: rows(60) }), []);

  // The older bug this guard originally fixed must stay fixed: a difference PAST
  // index 50 is still reported, even though the element-wise walk stops at 50.
  const tailDiff = structuralDiff({ items: rows(60) }, { items: rows(60, 55) });
  assert.equal(tailDiff.length, 1);
  assert.equal(tailDiff[0].path, 'items[…]');

  // A length change is still a difference.
  assert.equal(structuralDiff({ items: rows(60) }, { items: rows(61) }).length, 1);
});

test('FIXED: Table and Chart read the largest array, not the first one', () => {
  // Both located the payload with Object.values(value).find(Array.isArray) — the FIRST
  // array-valued property, even when empty. GraphQL ({errors: [], data: […]}), JSON:API
  // ({included: [], data: […]}) and {warnings: [], items: […]} all put an empty array
  // first, so the Table rendered zero rows and the chart said "No numeric fields in
  // this object to chart" — a verdict on a property it had never looked at.
  const rows = Array.from({ length: 25 }, (_, index) => ({ id: index, amount: index * 3 }));

  for (const payload of [{ errors: [], data: rows }, { warnings: [], items: rows }, { included: [], data: rows }]) {
    const grid = gridRows(payload);
    assert.equal(grid.objects.length, 25, JSON.stringify(Object.keys(payload)));
    assert.deepEqual(grid.columns, ['id', 'amount']);
    assert.equal(viz.buildVizSpec(payload).kind, 'bars');
  }

  // With no non-empty array there is still nothing to show, and that is honest.
  assert.equal(gridRows({ errors: [], data: [] }).objects.length, 0);
});
