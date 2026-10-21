import test from 'node:test';
import assert from 'node:assert/strict';
import './harness.mjs';

const { normalizeSqlError } = await import('../../src/panel/models/sqlErrors.ts');

test('syntax errors carry the position of the near token', () => {
  const e = normalizeSqlError(new Error('near "frm": syntax error'), 'select * frm t');
  assert.equal(e.code, 'syntax');
  assert.equal(e.position, 9);
  assert.equal(normalizeSqlError(new Error('near "frm": syntax error')).position, undefined);
});

test('classifies by name and message', () => {
  const abort = new Error('x');
  abort.name = 'AbortError';
  assert.equal(normalizeSqlError(abort).code, 'cancelled');
  assert.equal(normalizeSqlError({ name: 'AbortError' }).code, 'cancelled');
  assert.equal(normalizeSqlError(new Error('attempt to write a readonly database')).code, 'read-only');
  assert.equal(normalizeSqlError('cannot execute in a read-only transaction').code, 'read-only');
  assert.equal(normalizeSqlError(new Error('file is not a database')).code, 'not-a-database');
  assert.equal(normalizeSqlError(new Error('boom')).code, 'server');
});

test('SqlError-shaped objects pass through; messages are never empty', () => {
  const shaped = { code: 'timeout', message: 'slow', hint: 'h' };
  assert.deepEqual(normalizeSqlError(shaped), shaped);
  for (const raw of [undefined, null, '', new Error(''), {}, 42]) {
    const e = normalizeSqlError(raw);
    assert.equal(typeof e.message, 'string');
    assert.ok(e.message.length > 0);
  }
});
