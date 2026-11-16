import test from 'node:test';
import assert from 'node:assert/strict';
import './harness.mjs';

const { restoreLayout, clampEditorPct, clampRailPx, editorPctAfter, DEFAULT_SQL_LAYOUT, SQL_LAYOUT_KEY } = await import(
  '../../src/panel/models/sqlLayout.ts'
);
const { formatFileSize, shortcutLabels, editorPlaceholder, isMacPlatform, pickDroppedFile, ignoredFilesMessage, matchesTableFilter } =
  await import('../../src/panel/models/sqlUi.ts');

test('the layout defaults to a 30% editor and a 220 px rail, stored as sql_layout', () => {
  assert.equal(SQL_LAYOUT_KEY, 'sql_layout');
  assert.deepEqual(DEFAULT_SQL_LAYOUT, { editorPct: 30, railPx: 220 });
  assert.deepEqual(restoreLayout(undefined), { editorPct: 30, railPx: 220 });
  assert.deepEqual(restoreLayout([1, 2]), { editorPct: 30, railPx: 220 });
  assert.deepEqual(restoreLayout({ editorPct: 'x', railPx: null }), { editorPct: 30, railPx: 220 });
});

test('the layout clamps the editor to 15–75% and the rail to 160–420 px', () => {
  assert.equal(clampEditorPct(5), 15);
  assert.equal(clampEditorPct(90), 75);
  assert.equal(clampEditorPct(42.5), 42.5);
  assert.equal(clampEditorPct(NaN), 30);
  assert.equal(clampRailPx(10), 160);
  assert.equal(clampRailPx(9999), 420);
  assert.equal(clampRailPx(250.6), 251);
  assert.deepEqual(restoreLayout({ editorPct: 80, railPx: 100 }), { editorPct: 75, railPx: 160 });
  // Round-trips: a stored layout reads back unchanged.
  assert.deepEqual(restoreLayout({ editorPct: 40, railPx: 300 }), { editorPct: 40, railPx: 300 });
});

test('editorPctAfter converts a pixel move into a clamped share', () => {
  assert.equal(editorPctAfter(30, 24, 240), 40);
  assert.equal(editorPctAfter(30, -240, 240), 15);
  assert.equal(editorPctAfter(30, 24, 0), 30);
});

test('formatFileSize reads as the header shows it', () => {
  assert.equal(formatFileSize(0), '0 B');
  assert.equal(formatFileSize(1023), '1023 B');
  assert.equal(formatFileSize(2048), '2.0 KB');
  assert.equal(formatFileSize(115 * 1024), '115 KB');
  assert.equal(formatFileSize(3 * 1024 * 1024), '3.0 MB');
  assert.equal(formatFileSize(30 * 1024 * 1024), '30 MB');
});

test('shortcut labels and the placeholder follow the platform', () => {
  assert.equal(isMacPlatform('MacIntel'), true);
  assert.equal(isMacPlatform('Linux x86_64'), false);
  assert.equal(shortcutLabels(false).run, 'Ctrl ↵');
  assert.equal(shortcutLabels(true).run, '⌘ ↵');
  assert.equal(shortcutLabels(false).save, 'Ctrl+S');
  assert.equal(shortcutLabels(true).open, '⌘ O');
  assert.equal(
    editorPlaceholder(false),
    'Write SQL here — Ctrl+Enter runs the statement at the cursor, Ctrl+Shift+Enter runs all.',
  );
  assert.equal(editorPlaceholder(true), 'Write SQL here — Cmd+Enter runs the statement at the cursor, Cmd+Shift+Enter runs all.');
});

test('a drop opens the first file and names the rest', () => {
  assert.deepEqual(pickDroppedFile([]), { file: null, ignored: [] });
  const a = { name: 'a.db' };
  assert.deepEqual(pickDroppedFile([a]), { file: a, ignored: [] });
  assert.deepEqual(pickDroppedFile([a, { name: 'b.db' }, { name: 'c.txt' }]), { file: a, ignored: ['b.db', 'c.txt'] });
  assert.equal(ignoredFilesMessage('a.db', []), null);
  assert.equal(ignoredFilesMessage('a.db', ['b.db']), 'Only one file opens at a time: opening a.db, ignored 1 other file: b.db.');
  assert.equal(
    ignoredFilesMessage('a.db', ['b.db', 'c.txt']),
    'Only one file opens at a time: opening a.db, ignored 2 other files: b.db, c.txt.',
  );
});

test('the rail filter matches a case-insensitive substring', () => {
  assert.equal(matchesTableFilter('customers', ''), true);
  assert.equal(matchesTableFilter('customers', '  '), true);
  assert.equal(matchesTableFilter('customers', 'CUST'), true);
  assert.equal(matchesTableFilter('orders', 'cust'), false);
});
