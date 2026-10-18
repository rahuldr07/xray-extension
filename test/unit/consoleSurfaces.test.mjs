/* Two surfaces, one engine (final review I2). The HUD and the panel are separate
   bundles with separate stores, but on one page both drive the single
   window.XRAY_Console engine (panel/console.js). Each store pushes its pins to the
   engine whenever they change, so the surface that synced last used to decide what
   `a`…`f` and `res` meant for the other surface's runs too. evaluateConsoleCommand()
   — the prompt's run path — re-sends the running store's own view first.

   The real engine runs here; only chrome.runtime.sendMessage (the debugger hop) is
   stubbed, so `sent` is exactly the context that would reach the page. */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import './harness.mjs';

const sent = [];
globalThis.chrome = {
  runtime: {
    lastError: undefined,
    sendMessage(message, reply) { sent.push(message); reply({ type: 'number', result: 1 }); },
  },
};
window.XRAY_Store = { set: async () => {}, get: async () => undefined };
vm.runInThisContext(fs.readFileSync(new URL('../../panel/console.js', import.meta.url), 'utf8'));
const engine = window.XRAY_Console;

// Two module instances of the store = the panel bundle and the HUD bundle.
const panel = await import('../../src/panel/store.ts');
const hud = await import('../../src/panel/store.ts?surface=hud');

const sentContext = () => JSON.parse(sent.at(-1).context);

const entry = (id, body) => ({ id, type: 'api', timestamp: 1, method: 'GET', status: 200,
  url: `https://x.test/${id}`, urlPath: `/${id}`, responseRaw: JSON.stringify(body) });

beforeEach(() => {
  sent.length = 0;
  for (const surface of [panel, hud]) surface.usePanelStore.setState(surface.usePanelStore.getInitialState());
});

test('the panel and the HUD are separate stores over one engine', () => {
  assert.notEqual(panel.usePanelStore, hud.usePanelStore);
  assert.equal(typeof engine.setPins, 'function');
});

test('each surface evaluates with its own pins and selection, whichever synced last', async () => {
  panel.usePanelStore.setState({ entries: [entry('p1', { who: 'panel' })] });
  panel.usePanelStore.getState().pinConsoleRequest('p1');
  panel.usePanelStore.setState({ selectedId: 'p1' });
  hud.usePanelStore.setState({ entries: [entry('h1', { who: 'hud' })] });
  hud.usePanelStore.getState().pinConsoleRequest('h1');
  hud.usePanelStore.setState({ selectedId: 'h1' });
  // The HUD's pin sync ran last: the shared engine holds the HUD's `a`.
  assert.equal(engine.getScope().a.id, 'h1');

  await panel.evaluateConsoleCommand('a.who');
  // The context travels as tagged JSON text; a pin carries its typed body (spec J8).
  assert.deepEqual(sentContext().pins, { a: { id: 'p1', value: { who: 'panel' } } }, "the panel's run carries the panel's pin");
  assert.equal(sentContext().currentEntry.id, 'p1', "and the panel's selection");

  await hud.evaluateConsoleCommand('a.who');
  assert.deepEqual(sentContext().pins, { a: { id: 'h1', value: { who: 'hud' } } }, "the HUD's run carries the HUD's pin");
  assert.equal(sentContext().currentEntry.id, 'h1');

  await panel.evaluateConsoleCommand('a');
  assert.equal(sentContext().pins.a.id, 'p1', 'back to the panel: its pin again');
});

test('a surface with no pins and no selection clears what the other surface left behind', async () => {
  hud.usePanelStore.setState({ entries: [entry('h1', { who: 'hud' })] });
  hud.usePanelStore.getState().pinConsoleRequest('h1');
  hud.usePanelStore.setState({ selectedId: 'h1' });
  engine.setContext(hud.usePanelStore.getState().entries[0]);

  await panel.evaluateConsoleCommand('a');
  assert.deepEqual(sentContext().pins, {}, 'no pin of the other surface travels');
  assert.equal(sentContext().currentEntry, null, 'no request context of the other surface');
});
