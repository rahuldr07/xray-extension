// The one suite that executes product code: shared/console-helpers.js runs in a vm context.

const assert = require('node:assert/strict');
const test = require('node:test');
const vm = require('node:vm');

const { read } = require('./helpers/source');

test('shared console helpers build request-aware runtime helpers', () => {
  const context = { window: {}, URL };
  vm.createContext(context);
  vm.runInContext(read('shared/console-helpers.js'), context);

  const entries = [
    { id: 'a', type: 'api', method: 'GET', url: 'https://api.test/orders', urlPath: '/orders', status: 200, duration: 20, responseRaw: '{"items":[{"id":1,"total":10}]}' },
    { id: 'b', type: 'api', method: 'POST', url: 'https://api.test/orders', urlPath: '/orders', status: 500, duration: 1200, responseRaw: '{"error":"fail"}' },
  ];
  const runtime = context.window.XRAY_ConsoleHelpers.createRuntime({ currentEntry: entries[1], entries });

  assert.equal(JSON.stringify(runtime.$res), '{"error":"fail"}');
  assert.equal(runtime.res.error, 'fail');
  assert.equal(runtime.entry.id, 'b');
  assert.equal(JSON.stringify(runtime.headers), '{}');
  assert.equal(runtime.prev.items[0].total, 10);
  // table() evaluates to its rows; the render flag travels beside the value (spec J8).
  const rows = runtime.table([{ ok: true }]);
  assert.equal(Array.isArray(rows) && rows[0].ok, true);
  assert.equal(context.window.XRAY_ConsoleHelpers.encodeResult(rows).render, 'table');
  assert.equal(runtime.schema(runtime.res).error, 'string');
  assert.equal(runtime.$errors().length, 1);
  assert.equal(runtime.$slow(1000)[0].id, 'b');
  assert.equal(runtime.$status(500)[0].id, 'b');
  assert.equal(runtime.$endpoint('/orders').length, 2);
  assert.equal(runtime.$domain('api.test').length, 2);
});
