import test from 'node:test';
import assert from 'node:assert/strict';
import './harness.mjs';

const { rankCommands } = await import('../../src/panel/models/commandRanking.ts');

test('search ranks stronger later-group matches before the result cap', () => {
  const weaker = Array.from({ length: 60 }, (_, order) => ({ id: `weak-${order}`, score: 20, group: 'Selection', order }));
  const strong = { id: 'strong', score: 100, group: 'Console', order: 60 };
  const input = [...weaker, strong];
  assert.equal(rankCommands(input, true).slice(0, 60)[0].id, 'strong');
  assert.equal(input[0].id, 'weak-0', 'ranking does not mutate candidates');
});

test('search ties use group order then original candidate order', () => {
  const input = [
    { id: 'console', score: 10, group: 'Console', order: 1 },
    { id: 'request-later', score: 10, group: 'Requests', order: 5 },
    { id: 'selection', score: 10, group: 'Selection', order: 9 },
    { id: 'request-first', score: 10, group: 'Requests', order: 2 },
  ];
  assert.deepEqual(rankCommands(input, true).map(item => item.id), ['selection', 'request-first', 'request-later', 'console']);
});

test('empty query keeps grouped browsing in candidate order regardless of score', () => {
  const input = [
    { id: 'console', score: 100, group: 'Console', order: 0 },
    { id: 'action-later', score: 80, group: 'Actions', order: 4 },
    { id: 'request', score: 1, group: 'Requests', order: 8 },
    { id: 'action-first', score: 2, group: 'Actions', order: 3 },
  ];
  assert.deepEqual(rankCommands(input, false).map(item => item.id), ['request', 'action-first', 'action-later', 'console']);
  assert.deepEqual(rankCommands([], true), []);
});
