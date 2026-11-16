// Console round 2, Task 8 (spec §4): eager preview — which drafts may be previewed in the page, the
// attach/debounce rule, and how the page's answer (a typed-model text built by XRAY's own in-page
// projector) becomes the grey line under the prompt. The page projector itself is tested with the
// scope in test/unit/consoleScope.test.mjs; the worker in test/background-service-worker.test.js.
import test from 'node:test';
import assert from 'node:assert/strict';
import './harness.mjs';
import { loadIsolatedWorld } from './runtime/vm-load.mjs';

const E = await import('../../src/panel/models/consoleEager.ts');
const { previewEligible, eagerDelay, previewTexts, EAGER_DEBOUNCE_MS, PREVIEW_DRAFT_MAX } = E;

// One table, shared in spirit with the worker's own check (console-scope.js previewable): a single
// complete expression, no await, no top-level declaration, no depth-0 assignment/++/--/delete, and
// nothing that cannot compile (a SyntaxError's message reaches the page's prepareStackTrace).
const ELIGIBLE = [
  // A property named get/set and a call named get preview as usual.
  '({ get: 1, set: 2 })',
  'get(x)',
  '1+1',
  'res.users.length * 2',
  'res.users.map(u => u.id)',
  'null.x',
  "localStorage.setItem('a','b')",
  'a === b',
  'a <= b && c >= d || e != f',
  'x => x + 1',
  '({ a: 1 })',
  '[1, 2, 3]',
  '`t ${1}`',
  'fn(a = 1)',
  "typeof x === 'string'",
  'a ? b : c',
  '/a=b/.test(s)',
  "'x = 1'",
  'arr.filter(Boolean)\n  .length',
  '!done',
  'new Date()',
  'a?.b ?? c',
  'res.new.in',
  'res.do.for',
  "`a${`b${1}`}c ${'}'} ${[1][0]}`",
  '1e-5 + 0x1F + 1_000 + .5 + 1. + 10n',
  'a ? b : c ? d : e',
  '({ a: b ? 1 : 2 })',
  '`${res.users.length * 2}`',
  'new Date().getTime()',
  '/[/]x\\//i.test(s)',
  '1 // note',
  '/* c */ 1',
  'x => { const y = x; return y * 2; }',
];
const INELIGIBLE = [
  // Final review M-3 (measured in Chromium): V8's side-effect check refuses defining an accessor, so
  // an object literal with one would only send the page a bare EvalError (C-1 (iii)); never sent.
  // An object that already has accessors (a declared value) previews them as `(…)`.
  '({get g() { return 1 }})',
  '({ set s(v) {} })',
  "({ a: 1, get 'b c'() { return 2 } })",
  'get g()',
  '({ get g })',
  '({ get g: 1 })',
  '(a, get g())',
  '',
  '   ',
  'res.users.',
  'res.users.map(u =>',
  'const a = 1',
  'let x',
  'var y = 2',
  'function f() {}',
  'async function f() {}',
  'class A {}',
  'x = 1',
  'x += 1',
  'x ??= 1',
  'a.b >>>= 2',
  'x++',
  '--x',
  'delete a.b',
  'await fetch("/")',
  'fetch("/").then(async (r) => await r.json())',
  '1; 2',
  '1+1;',
  'if (a) b',
  'return 1',
  'throw new Error()',
  'x'.repeat(2001),
  '{ a: 1 }',
  'a b',
  'res.users lenght',
  'a\nb',
  '"open',
  '/* open',
  '(1))',
  '(() => { for (;;) {} })()',
  'xs.map(x => { while (x) x = x.next; return x })',
  // Fix round 1 (review Important 4): inside template substitutions too; invalid literals.
  '`${(() => { while (1) {} })()}`',
  '`${ a b }`',
  '`${ secretWord otherWord }`',
  '`a ${`b ${x = 1}`}`',
  '`${}`',
  '/(SECRETRE/',
  '/a/gg',
  '1.2.3',
  '017',
  '0 ? 1 : 2 : 3',
  'a ? b',
  'super.x',
  'import("x")',
  'import.meta',
  'new.target',
];

test('previewEligible: single complete expressions only (table)', () => {
  for (const draft of ELIGIBLE) assert.equal(previewEligible(draft), true, JSON.stringify(draft));
  for (const draft of INELIGIBLE) assert.equal(previewEligible(draft), false, JSON.stringify(draft.slice(0, 40)));
  assert.equal(PREVIEW_DRAFT_MAX, 2000);
  assert.equal(previewEligible('x'.repeat(2000)), true, 'the bound is inclusive');
});

test('the worker checks the same table again (shared/console-scope.js previewable)', () => {
  const S = loadIsolatedWorld('shared/console-scope.js').window.XRAY_ConsoleScope;
  for (const draft of ELIGIBLE) assert.equal(S.previewable(draft), true, JSON.stringify(draft));
  for (const draft of INELIGIBLE) assert.equal(S.previewable(draft), false, JSON.stringify(draft.slice(0, 40)));
});

test('eagerDelay: nothing before 2 non-space characters; then a 150 ms pause that may attach', () => {
  assert.equal(EAGER_DEBOUNCE_MS, 150);
  assert.equal(eagerDelay(''), null);
  assert.equal(eagerDelay(' 1 '), null);
  assert.deepEqual(eagerDelay('1+'), { ms: 150, attach: true });
  assert.deepEqual(eagerDelay(' a b '), { ms: 150, attach: true });
});

const model = (value) => JSON.stringify(value);

test('previewTexts: a value becomes the one-line preview (previewLine); a throw becomes Uncaught …', () => {
  assert.deepEqual(previewTexts({ value: model(6) }), { text: '6' });
  assert.deepEqual(previewTexts({ value: model({ $xray: 'array', length: 3, items: [1, 2, 3] }) }), { text: 'Array(3) [1, 2, 3]' });
  assert.deepEqual(previewTexts({ value: model({ $xray: 'object', entries: [['id', 1], ['name', 'Ada']], omitted: 0 }) }), { text: "{id: 1, name: 'Ada'}" });
  assert.deepEqual(previewTexts({ value: model({ $xray: 'instance', cls: 'Point', entries: [['x', 1]], getters: ['len'], omitted: 0 }) }), { text: 'Point {x: 1, len: (…)}' });
  assert.deepEqual(previewTexts({ value: model({ $xray: 'map', size: 1, entries: [[1, 'a']] }) }), { text: "Map(1) {1 => 'a'}" });
  assert.deepEqual(previewTexts({ value: model({ $xray: 'function', name: 'f', kind: 'function', params: 'a, b' }) }), { text: 'ƒ f(a, b)' });
  assert.deepEqual(previewTexts({ value: model({ $xray: 'undefined' }) }), { text: 'undefined' });
  assert.deepEqual(previewTexts({ value: model('x') }), { text: "'x'" });
  assert.deepEqual(previewTexts({ thrown: model({ $xray: 'error', name: 'TypeError', message: "Cannot read properties of null (reading 'x')" }) }), { error: "Uncaught TypeError: Cannot read properties of null (reading 'x')" });
  assert.deepEqual(previewTexts({ thrown: model(5) }), { error: 'Uncaught 5' });
  assert.deepEqual(previewTexts({ thrown: model({ $xray: 'error', name: 'Error', message: '' }) }), { error: 'Uncaught Error' });
});

test('previewTexts: anything malformed or missing shows nothing', () => {
  assert.equal(previewTexts(null), null);
  assert.equal(previewTexts({}), null);
  assert.equal(previewTexts({ value: '{not json' }), null);
  assert.equal(previewTexts({ value: 42 }), null, 'the model travels as text');
  assert.equal(previewTexts({ thrown: '' }), null);
});

test('previewTexts: the line is bounded (previewLine max 120)', () => {
  const long = previewTexts({ value: model('y'.repeat(500)) });
  assert.ok(long.text.length <= 120, String(long.text.length));
  assert.ok(long.text.endsWith('…'));
});
