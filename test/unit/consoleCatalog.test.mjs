import test from 'node:test';
import assert from 'node:assert/strict';
import './harness.mjs';

const C = await import('../../src/panel/models/consoleCatalog.ts');
const { CATALOG_GLOBALS, KEYWORDS, catalogMembers, CATALOG_OWNERS } = C;

const OWNERS = [
  'Object', 'JSON', 'Math', 'Array', 'Promise', 'Number', 'String', 'Date', 'URL', 'URLSearchParams', 'Headers', 'Response',
  'Request', 'console', 'document', 'window', 'location', 'navigator', 'localStorage', 'sessionStorage', 'Map', 'Set', 'RegExp',
  'Element', 'Array.prototype', 'String.prototype', 'Number.prototype', 'Object.prototype', 'Promise.prototype', 'Map.prototype',
  'Set.prototype', 'Date.prototype', 'RegExp.prototype', 'Response.prototype', 'Headers.prototype', 'URL.prototype',
  'Element.prototype', 'Document.prototype',
];
const KINDS = new Set(['function', 'method', 'property', 'class', 'keyword', 'namespace', 'variable']);

function checkList(list, where) {
  assert.ok(Array.isArray(list) && list.length > 0, `${where}: non-empty`);
  const names = new Set();
  for (const e of list) {
    const at = `${where} ${e.name}`;
    assert.ok(/^[A-Za-z_$][\w$]*$/.test(e.name), `${at}: identifier name`);
    assert.ok(KINDS.has(e.kind), `${at}: kind ${e.kind}`);
    assert.ok(typeof e.doc === 'string' && e.doc.length > 0 && e.doc.length <= 80, `${at}: one short doc line`);
    assert.ok(/^[A-Z]/.test(e.doc) && /\.$/.test(e.doc), `${at}: doc is a sentence`);
    if (e.kind === 'function' || e.kind === 'method') {
      assert.ok(typeof e.signature === 'string' && e.signature.startsWith(`${e.name}(`) && e.signature.endsWith(')'), `${at}: signature`);
    }
    assert.ok(!names.has(e.name), `${at}: duplicate name`);
    names.add(e.name);
  }
}

test('catalogue integrity: every owner, the globals and the keywords', () => {
  checkList(CATALOG_GLOBALS, 'globals');
  checkList(KEYWORDS, 'keywords');
  assert.ok(KEYWORDS.every((k) => k.kind === 'keyword'));
  for (const owner of OWNERS) checkList(catalogMembers(owner), owner);
  for (const owner of CATALOG_OWNERS) checkList(catalogMembers(owner), owner);
  assert.deepEqual(catalogMembers('NoSuchThing'), []);
  assert.deepEqual(catalogMembers('toString'), [], 'an Object.prototype name is not an owner');
});

test('catalogue: entries the brief names', () => {
  const by = (owner, name) => catalogMembers(owner).find((e) => e.name === name);
  assert.equal(by('Object', 'keys').signature, 'keys(o)');
  assert.equal(by('JSON', 'stringify').signature, 'stringify(value, replacer?, space?)');
  assert.ok(by('document', 'querySelector') && by('document', 'querySelectorAll'));
  assert.equal(CATALOG_GLOBALS.find((e) => e.name === 'fetch').signature, 'fetch(input, init?)');
  for (const m of ['reduce', 'sort', 'toSorted', 'flatMap', 'forEach', 'findIndex', 'indexOf', 'concat', 'entries']) assert.ok(by('Array.prototype', m), m);
  assert.ok(by('Number.prototype', 'toFixed'));
  assert.ok(KEYWORDS.some((k) => k.name === 'await'));
  assert.equal(by('Number', 'EPSILON').doc, 'Difference between 1 and the smallest number greater than 1.');
  for (const o of ['performance', 'crypto', 'history', 'Reflect']) assert.ok(catalogMembers(o).length > 0, o);
  for (const g of ['Object', 'JSON', 'Math', 'document', 'window', 'console', 'structuredClone', 'setTimeout', 'atob', 'btoa', 'encodeURIComponent']) {
    assert.ok(CATALOG_GLOBALS.some((e) => e.name === g), g);
  }
});

test('catalogue: lists are built once and shared', () => {
  assert.equal(catalogMembers('Math'), catalogMembers('Math'));
  assert.equal(catalogMembers('localStorage'), catalogMembers('sessionStorage'), 'both are Storage');
});
