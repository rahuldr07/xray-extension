// Task 7 (spec §3 source 4, §4 session policy): when the editor asks the page, and which answers it keeps.
import test from 'node:test';
import assert from 'node:assert/strict';
import './harness.mjs';

const { liveDelay, createLiveChannel } = await import('../../src/panel/models/consoleLive.ts');

test('liveDelay: attach only after 2 non-space characters and a 150 ms pause; an attached session asks after 120 ms', () => {
  assert.equal(liveDelay('', false), null);
  assert.equal(liveDelay(' a ', false), null, 'one character never attaches');
  assert.deepEqual(liveDelay('ap', false), { ms: 150, attach: true });
  assert.deepEqual(liveDelay('a p', false), { ms: 150, attach: true });
  assert.deepEqual(liveDelay('a', true), { ms: 120, attach: false }, 'already attached: the completion debounce');
});

test('createLiveChannel: an answer older than the latest request is dropped (out of order)', async () => {
  const pending = new Map();
  const channel = createLiveChannel();
  const send = (id) => new Promise((resolve) => pending.set(id, () => resolve({ requestId: id, names: [String(id)] })));
  const first = channel.request(send);
  const second = channel.request(send);
  pending.get(2)();
  assert.deepEqual(await second, { requestId: 2, names: ['2'] });
  pending.get(1)();
  assert.equal(await first, null, 'request 1 answered after 2: dropped');
  // A mismatched id (another surface's answer) is dropped too, and so is a missing one.
  assert.equal(await channel.request(async () => ({ requestId: 99 })), null);
  assert.equal(await channel.request(async () => null), null);
  channel.cancel();
  const third = channel.request(send);
  channel.cancel();
  pending.get(6)();
  assert.equal(await third, null, 'cancelled by the next keystroke');
});
