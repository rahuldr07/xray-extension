import test from 'node:test';
import assert from 'node:assert/strict';
import './harness.mjs';

const { ghostFor } = await import('../../src/panel/models/consoleGhost.ts');

const item = (label, extra = {}) => ({ label, insert: label, detail: '', kind: 'method', ...extra });
const at = (draft, top, extra = {}) => ghostFor({ draft, caret: draft.length, top, history: [], listOpen: true, ...extra });

test('ghost: the top suggestion\'s remaining characters (the label, not the call insert)', () => {
  assert.equal(at('JSON.str', item('stringify', { insert: 'stringify(', caret: 10, from: 5 })), 'ingify');
  assert.equal(at('JSON.str', item('stringify')), 'ingify', 'without `from` the token before the caret is the typed part');
  assert.equal(at('$end', item('$endpoint', { kind: 'helper' })), 'point');
  assert.equal(at('res.users.ma', item('map', { insert: 'map(x => x.)' })), 'p');
});

test('ghost: nothing unless the label continues exactly what was typed', () => {
  assert.equal(at('ma', item('Math')), '', 'case differs: accepting would rewrite the typed text');
  assert.equal(at('qSA', item('querySelectorAll')), '', 'a word-boundary match is not a continuation');
  assert.equal(at('map', item('map')), '', 'nothing left');
  assert.equal(at('res.', item('users')), '', 'nothing typed yet');
  assert.equal(at('res["us', item('users', { from: 3, insert: '["users"]' })), '', 'the typed range is not a prefix of the label');
  assert.equal(at('JSON.str', undefined), '');
});

test('ghost: never with the caret inside a token; nothing may follow it on the line (fix round 1)', () => {
  const top = item('stringify', { from: 5 });
  assert.equal(ghostFor({ draft: 'JSON.strxx', caret: 8, top, history: [], listOpen: true }), '', 'caret mid-token');
  assert.equal(ghostFor({ draft: 'log(JSON.str)', caret: 12, top: item('stringify', { from: 9 }), history: [], listOpen: true }), '', 'a closer after the caret would be pushed out of line');
  assert.equal(ghostFor({ draft: 'JSON.str ', caret: 8, top, history: [], listOpen: true }), '', 'trailing space too');
  assert.equal(ghostFor({ draft: 'JSON.str\nres', caret: 8, top, history: [], listOpen: true }), 'ingify', 'end of a line that is not the last');
  assert.equal(ghostFor({ draft: 'JSON.str + 1', caret: 8, top, history: [], listOpen: true }), '', 'code after the caret on the same line');
});

test('ghost: a history match only with the list closed, newest first, longer than the draft', () => {
  const history = ['res.users', 'schema(res)', 'schema(req)'];
  const closed = (draft, extra = {}) => ghostFor({ draft, caret: draft.length, history, listOpen: false, ...extra });
  assert.equal(closed('sch'), 'ema(res)');
  assert.equal(closed('schema(r'), 'es)', 'the newest match wins');
  assert.equal(closed('res.users'), '', 'an equal entry is not longer');
  assert.equal(closed('nothing'), '');
  assert.equal(closed(''), '', 'an empty draft shows nothing');
  assert.equal(closed('  '), '', 'nor does whitespace');
  assert.equal(ghostFor({ draft: 'sch', caret: 3, history, listOpen: true }), '', 'list open: history is not offered');
  assert.equal(ghostFor({ draft: 'sch', caret: 3, top: item('schema', { kind: 'helper' }), history, listOpen: true }), 'ema', 'list open: the suggestion');
  assert.equal(ghostFor({ draft: 'sch x', caret: 3, history: ['sch xyz'], listOpen: false }), '', 'history needs the caret at the end of the draft');
  assert.equal(ghostFor({ draft: 'ab', caret: 2, history: ['ab +\nc', 'abc'], listOpen: false }), 'c', 'a multi-line remainder is skipped');
  assert.equal(ghostFor({ draft: 'r', caret: 1, history: ['res.users'], listOpen: false }), '', 'no history ghost for a 1-character draft (the list\'s 2-character gate)');
  assert.equal(ghostFor({ draft: ' r', caret: 2, history: [' res'], listOpen: false }), '', 'one character after spaces counts as one');
  assert.equal(ghostFor({ draft: 'JSON.str', caret: 8, top: item('stringify'), history: ['JSON.stringify(res)'], listOpen: false }), 'ingify(res)', 'closed: the top suggestion is ignored');
});

test('ghost: tolerates odd input', () => {
  assert.equal(ghostFor({ draft: 'ab', caret: 99, history: ['abc'], listOpen: false }), 'c', 'caret past the end is clamped');
  assert.equal(ghostFor({ draft: 'ab', caret: 2, history: [null, 5, 'abd'], listOpen: false }), 'd', 'non-string history entries are ignored');
  assert.equal(ghostFor({ draft: 'ab', caret: 2, history: undefined, listOpen: false }), '');
});
