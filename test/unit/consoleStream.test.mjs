/* Console stream model (spec S2/S6): chip counts over cells and page logs, the
   shared Logs-tab chips staying put, and Clear console scopes in the store. */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import './harness.mjs';

const { usePanelStore } = await import('../../src/panel/store.ts');
const levels = await import('../../src/panel/models/logLevels.ts');

const log = (id, level = 'log') => ({ id, type: 'log', level, timestamp: 0, message: id });
const cmd = (id) => ({ id, type: 'command', level: 'info', timestamp: 0, message: id, commandId: id });
const out = (id, type = 'result') => ({ id: 'res_' + id, type, level: type === 'error' ? 'error' : 'info', timestamp: 0, message: 'r', commandId: id });
const MIXED = [log('a'), cmd('c1'), out('c1'), log('b', 'info'), log('w', 'warn'), cmd('c2'), out('c2', 'error'), log('e', 'error'), log('c'), log('d')];

const counts = (events) => levels.consoleFilterCounts(levels.pairConsoleEvents(events).map(levels.pairedUnit));

test('a command and its result count once; a failed command once under Errors', () => {
  assert.deepEqual(counts(MIXED), { all: 8, mine: 2, page: 6, warn: 1, error: 2 });
});

test('an output whose command is gone stays a row of its own and counts as mine', () => {
  assert.deepEqual(counts([out('gone', 'error'), log('x')]), { all: 2, mine: 1, page: 1, warn: 0, error: 1 });
  assert.deepEqual(levels.pairConsoleEvents([out('gone')]).map((row) => row.kind), ['event']);
});

test('pairing keeps cells at the command position', () => {
  assert.deepEqual(levels.pairConsoleEvents(MIXED).map((row) => row.kind === 'cell' ? row.command.id : row.event.id),
    ['a', 'c1', 'b', 'w', 'c2', 'e', 'c', 'd']);
});

test('the Logs tab keeps its own chips and buckets', () => {
  assert.deepEqual(levels.logLevelFilters.map((filter) => filter.label), ['All', 'Logs', 'Warnings', 'Errors']);
  assert.deepEqual(levels.consoleLevelFilters.map((filter) => filter.label), ['All', 'My commands', 'Page logs', 'Warnings', 'Errors']);
  assert.equal(levels.levelBucket({ type: 'log', level: 'info' }), 'log');
  assert.equal(levels.levelBucket({ type: 'log', level: 'warn' }), 'warn');
});

let cleared;
beforeEach(() => {
  cleared = 0;
  window.XRAY_Store = { set: async () => {}, get: async () => undefined };
  window.XRAY_Console = { setContext() {}, setPins() {}, clearVariables: () => { cleared += 1; } };
  usePanelStore.setState({ ...usePanelStore.getInitialState(), consoleEvents: MIXED.slice(),
    consoleRun: { id: 'c2', startedAt: 0 }, consolePins: [{ name: 'a', entryId: 'x' }] });
});
const store = () => usePanelStore.getState();
const ids = () => store().consoleEvents.map((event) => event.id);

test('clearConsole() defaults to everything: output, run and variables, not pins', () => {
  store().clearConsole();
  assert.deepEqual(ids(), []);
  assert.equal(store().consoleRun, null);
  assert.equal(cleared, 1);
  assert.equal(store().consolePins.length, 1);
});

test("clearConsole('commands') removes cells, the run and variables; page logs stay", () => {
  usePanelStore.setState({ expandedId: 'res_c1' });
  store().clearConsole('commands');
  assert.deepEqual(ids(), ['a', 'b', 'w', 'e', 'c', 'd']);
  assert.equal(store().consoleRun, null);
  assert.equal(store().expandedId, null);
  assert.equal(cleared, 1);
  assert.equal(store().consolePins.length, 1);
});

test("clearConsole('page') removes page logs only: commands, the run and variables stay", () => {
  usePanelStore.setState({ expandedId: 'res_c1' });
  store().clearConsole('page');
  assert.deepEqual(ids(), ['c1', 'res_c1', 'c2', 'res_c2']);
  assert.deepEqual(store().consoleRun, { id: 'c2', startedAt: 0 });
  assert.equal(store().expandedId, 'res_c1');
  assert.equal(cleared, 0);
  assert.equal(store().consolePins.length, 1);
});

test("clearConsole('page') also drops buffered page logs while paused", () => {
  store().setRecording(false);
  store().addEntries([{ id: 'p1', type: 'log', logLevel: 'log', logData: 'buffered', timestamp: 1 }]);
  assert.equal(store().pausedCount, 1, 'the log was buffered');
  store().clearConsole('page');
  assert.equal(store().pausedCount, 0);
  store().setRecording(true);
  assert.deepEqual(ids(), ['c1', 'res_c1', 'c2', 'res_c2']);
});
