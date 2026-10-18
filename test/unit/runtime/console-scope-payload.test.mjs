import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';

import { hostify, readSource } from './vm-load.mjs';

// panel/console.js ships `context.scope` with every Run. Saved variables (temp1…,
// $_) can each be a large result, so only the names the code mentions travel.
function loadConsole() {
  const sent = [];
  const chrome = {
    runtime: {
      lastError: undefined,
      sendMessage(message, callback) { sent.push(message); callback({ type: 'number', result: 1 }); },
    },
  };
  const window = { chrome };
  const context = { window, chrome };
  vm.createContext(context);
  vm.runInContext(readSource('panel/console.js'), context);
  return { api: window.XRAY_Console, sent };
}

test('only scope variables named in the code are sent with a run', async () => {
  const { api, sent } = loadConsole();
  api.setVar('temp1', { big: 'x'.repeat(1000) });
  api.setVar('temp2', [1, 2, 3]);
  api.setVar('$_', { last: true });
  await api.execute('$_.last && temp2.length');
  assert.equal(sent.length, 1);
  assert.deepEqual(hostify(sent[0].context.scope), { temp2: [1, 2, 3], $_: { last: true } });
  assert.equal(Object.hasOwn(sent[0].context.scope, 'temp1'), false, 'unreferenced temp1 is not shipped');
});

test('a run that names no variables ships an empty scope', async () => {
  const { api, sent } = loadConsole();
  api.setVar('$_', 42);
  await api.execute('1 + 1');
  assert.deepEqual(hostify(sent[0].context.scope), {});
});

test('clearVariables forgets saved variables but keeps pins', async () => {
  const { api } = loadConsole();
  api.setVar('temp1', 1);
  api.setPins({ a: { id: 'entry-a' } });
  api.clearVariables();
  assert.equal(api.getVar('temp1'), undefined);
  assert.deepEqual(Object.keys(api.getScope()), ['a']);
});

// P2: pinned requests travel as { id, body } only, and only the ones the code names.
test('only pinned requests named in the code are sent, as { id, body } without headers', async () => {
  const { api, sent } = loadConsole();
  api.setPins({
    a: { id: 'e1', type: 'api', urlPath: '/users', responseRaw: '{"users":[1,2]}', requestHeaders: { cookie: 'sid=secret' }, responseHeaders: { 'set-cookie': 'x' } },
    b: { id: 'e2', type: 'api', responseDecrypted: { orders: [] }, responseRaw: 'ciphertext' },
  });
  await api.execute('a.users.length');
  assert.deepEqual(hostify(sent[0].context.pins), { a: { id: 'e1', body: '{"users":[1,2]}' } }, 'unreferenced b is not shipped; a carries no headers');
  await api.execute('b.orders');
  assert.deepEqual(hostify(sent[1].context.pins), { b: { id: 'e2', body: { orders: [] } } }, 'the decrypted body wins, like res');
  await api.execute('1 + 1');
  assert.deepEqual(hostify(sent[2].context.pins), {});
});

test('setPins accepts only a-f, replaces every pin, and clearScope drops them', async () => {
  const { api } = loadConsole();
  api.setPins({ z: { id: 'old' }, res: { id: 'x' }, a: { id: 'e1' }, b: null });
  assert.deepEqual(Object.keys(api.getScope()), ['a']);
  api.setPins({ c: { id: 'e3' } });
  assert.deepEqual(Object.keys(api.getScope()), ['c']);
  api.clearScope();
  assert.deepEqual(Object.keys(api.getScope()), []);
});
