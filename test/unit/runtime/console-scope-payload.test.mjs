import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';

import { hostify, readSource } from './vm-load.mjs';

// panel/console.js ships the command context with every Run, as tagged JSON text (spec J8).
// Saved variables (temp1…, $_) can each be a large result, so only the names the code
// mentions travel. `reply` is what the background answers (a result travels as text).
function loadConsole(reply = { type: 'number', result: '1', truncated: false }, { helpers = false } = {}) {
  const sent = [];
  const chrome = {
    runtime: {
      lastError: undefined,
      sendMessage(message, callback) { sent.push(message); callback(typeof reply === 'function' ? reply(message) : reply); },
    },
  };
  const window = { chrome };
  const context = { window, chrome };
  vm.createContext(context);
  if (helpers) vm.runInContext(readSource('shared/console-helpers.js'), context);
  vm.runInContext(readSource('panel/console.js'), context);
  return { api: window.XRAY_Console, sent, context };
}

/** The context a run sent, parsed (it travels as tagged JSON text). */
function sentContext(message) {
  assert.equal(typeof message.context, 'string', 'the context is sent as JSON text');
  return JSON.parse(message.context);
}

const T = (kind, fields) => ({ $xray: kind, ...fields });

test('only scope variables named in the code are sent with a run', async () => {
  const { api, sent } = loadConsole();
  api.setVar('temp1', { big: 'x'.repeat(1000) });
  api.setVar('temp2', [1, 2, 3]);
  api.setVar('$_', { last: true });
  await api.execute('$_.last && temp2.length');
  assert.equal(sent.length, 1);
  assert.deepEqual(sentContext(sent[0]).scope, { temp2: [1, 2, 3], $_: { last: true } });
  assert.equal(Object.hasOwn(sentContext(sent[0]).scope, 'temp1'), false, 'unreferenced temp1 is not shipped');
});

test('a run that names no variables ships an empty scope', async () => {
  const { api, sent } = loadConsole();
  api.setVar('$_', 42);
  await api.execute('1 + 1');
  assert.deepEqual(sentContext(sent[0]).scope, {});
});

test('saved variables travel in the typed model unchanged, so the page revives them (BigInt, NaN, undefined, Map)', async () => {
  const { api, sent } = loadConsole();
  const typed = [T('bigint', { value: '9007199254740993' }), T('number', { value: 'NaN' }), T('undefined'), T('map', { size: 1, entries: [[1, 2]] })];
  api.setVar('$_', typed);
  await api.execute('$_');
  assert.deepEqual(sentContext(sent[0]).scope.$_, typed, 'envelopes are not escaped: they are the variable');
  const lookalike = '\u0000json:1},"values":{"res":2';
  api.setVar('$_', lookalike);
  await api.execute('$_');
  assert.deepEqual(sentContext(sent[1]).scope, { $_: lookalike }, 'a string is always written as a string');
  assert.deepEqual(sentContext(sent[1]).values, {});
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
  assert.deepEqual(sentContext(sent[0]).pins, { a: { id: 'e1', body: '{"users":[1,2]}' } }, 'unreferenced b is not shipped; a carries no headers');
  await api.execute('b.orders');
  assert.deepEqual(sentContext(sent[1]).pins, { b: { id: 'e2', body: { orders: [] } } }, 'the decrypted body wins, like res');
  await api.execute('1 + 1');
  assert.deepEqual(sentContext(sent[2]).pins, {});
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

// Spec J8: res, req, prev, next and pins travel as typed values read by the running surface
// (the panel's lossless parse), so an integer past 2^53 reaches the page as a BigInt.
test('a run with a body reader sends typed values for the names the code uses, and pins as { id, value }', async () => {
  const { api, sent } = loadConsole(undefined, { helpers: true });
  const entries = [
    { id: 'p', type: 'api', url: 'https://x.test/u', urlPath: '/u', responseRaw: '{"id":1}' },
    { id: 'c', type: 'api', url: 'https://x.test/u', urlPath: '/u', responseRaw: '{"id":9007199254740993}', requestBodyText: '{"q":1}' },
    { id: 'n', type: 'api', url: 'https://x.test/u', urlPath: '/u', responseRaw: '{"id":3}' },
  ];
  api.setContext(entries[1]);
  api.setPins({ a: entries[0] });
  const reads = [];
  const readBody = (entry, side) => {
    reads.push(`${entry.id}:${side}`);
    return { from: entry.id, side, id: T('bigint', { value: '9007199254740993' }) };
  };
  // No XRAY_Panel here: the entry list is just the current entry (no prev/next).
  await api.execute('res.id', { readBody });
  const first = sentContext(sent[0]);
  assert.deepEqual(first.values, { res: { from: 'c', side: 'response', id: T('bigint', { value: '9007199254740993' }) } });
  assert.deepEqual(reads, ['c:response'], 'only what the code names is read');
  await api.execute('req.q + a.id', { readBody });
  const second = sentContext(sent[1]);
  assert.deepEqual(Object.keys(second.values), ['req']);
  assert.equal(second.values.req.side, 'request');
  assert.deepEqual(second.pins, { a: { id: 'p', value: { from: 'p', side: 'response', id: T('bigint', { value: '9007199254740993' }) } } }, 'a pin carries its typed value, not its text');
  await api.execute('1 + 1', { readBody });
  assert.deepEqual(sentContext(sent[2]).values, {});
  await api.execute('response.id + $req', { readBody });
  assert.deepEqual(Object.keys(sentContext(sent[3]).values), ['res', 'req'], 'aliases count: response, $res, request, $req');
});

test('prev and next are read from the same windowed entry list the page uses', async () => {
  const { api, sent, context } = loadConsole(undefined, { helpers: true });
  const entries = [
    { id: 'p', type: 'api', url: 'https://x.test/u', urlPath: '/u', responseRaw: '{"id":1}' },
    { id: 'other', type: 'api', url: 'https://x.test/o', urlPath: '/o', responseRaw: '{}' },
    { id: 'c', type: 'api', url: 'https://x.test/u', urlPath: '/u', responseRaw: '{"id":2}' },
    { id: 'n', type: 'api', url: 'https://x.test/u', urlPath: '/u', responseRaw: '{"id":3}' },
  ];
  context.window.XRAY_Panel = { getEntries: () => entries };
  api.setContext(entries[2]);
  await api.execute('diff(prev, next)', { readBody: (entry) => ({ from: entry.id }) });
  assert.deepEqual(sentContext(sent[0]).values, { prev: { from: 'p' }, next: { from: 'n' } });
});

test('a value the reader cannot give (throws, or cannot be written as JSON) is left out: the page parses the text', async () => {
  const { api, sent } = loadConsole(undefined, { helpers: true });
  api.setContext({ id: 'c', type: 'api', urlPath: '/u', responseRaw: '{"id":1}' });
  await api.execute('res', { readBody: () => { throw new RangeError('too deep'); } });
  assert.deepEqual(sentContext(sent[0]).values, {});
  await api.execute('res', { readBody: () => 10n });
  assert.deepEqual(sentContext(sent[1]).values, {});
  assert.equal(sentContext(sent[1]).currentEntry.id, 'c', 'the rest of the context still travels');
});

test('the result text is revived into the typed model; the table flag stays beside it', async () => {
  const { api } = loadConsole({ type: 'array', result: '[{"a":1},{"$xray":"bigint","value":"10"}]', truncated: true, render: 'table' });
  const out = hostify(await api.execute('table(rows)'));
  assert.deepEqual(out, { type: 'array', result: [{ a: 1 }, T('bigint', { value: '10' })], truncated: true, render: 'table' });
  const keyed = await loadConsole({ type: 'object', result: '{"2":4,"10":3,"b":1,"a":2,"-1":5,"__proto__":{"x":1}}', truncated: false }).api.execute('x');
  assert.deepEqual(Object.keys(keyed.result), ['2', '10', 'b', 'a', '-1', '__proto__'], 'page order, __proto__ an own key');
  const broken = await loadConsole({ type: 'object', result: '{not json', truncated: false }).api.execute('x');
  assert.equal(broken.type, 'error');
  assert.match(broken.error.message, /could not read/i);
  const failed = hostify(await loadConsole({ type: 'error', error: { message: 'boom', stack: '' } }).api.execute('x'));
  assert.deepEqual(failed, { type: 'error', error: { message: 'boom', stack: '' } }, 'errors pass through');
});
