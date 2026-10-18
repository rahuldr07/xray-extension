import test from 'node:test';
import assert from 'node:assert/strict';
import { apiEntry } from './harness.mjs';

const I = await import('../../src/panel/models/investigations.ts');
const P = await import('../../src/panel/models/investigationPersistence.ts');
const source = apiEntry({ id: 'source', url: 'https://api.example.test/items?q=private-query' });
const saved = () => I.createInvestigation({ sessionId: 'session', entries: [source], selectedId: source.id });
const envelope = investigation => ({ schemaVersion: 1, investigations: [investigation] });

test('normalization returns only schema-v1 plain envelopes and refuses future versions', () => {
  for (const input of [null, undefined, 1, 'bad', {}, [], { schemaVersion: 2, investigations: [saved()] }]) assert.deepEqual(P.normalizeInvestigationStore(input), { schemaVersion: 1, investigations: [] });
  assert.equal(P.SAVED_INVESTIGATIONS_KEY, 'saved_investigations');
  const state = envelope(saved());
  assert.deepEqual(P.normalizeInvestigationStore(JSON.parse(JSON.stringify(state))), state);
  assert.deepEqual(P.serializeInvestigationStore(state), state);
});

test('malformed cyclic data, accessor fields and duplicate IDs are inert', () => {
  let reads = 0;
  const original = saved();
  const malicious = Object.defineProperty({}, 'id', { get() { reads += 1; throw Error('must not read'); } });
  const cycle = { schemaVersion: 1 }; cycle.investigations = [cycle, malicious, original, original];
  const result = P.normalizeInvestigationStore(cycle);
  assert.equal(result.investigations.length, 1);
  assert.equal(reads, 0);
  const array = []; Object.defineProperty(array, '0', { get() { reads += 1; return original; } });
  assert.deepEqual(P.normalizeInvestigationStore({ schemaVersion: 1, investigations: array }).investigations, []);
  assert.equal(reads, 0);
});

test('all nested storage collections obey exact caps with latest scalar receipts per scenario', () => {
  const original = saved();
  const assertion = I.createAssertion(source, 'session', { type: 'status', expected: 200 });
  const scenario = I.createScenario(original, source);
  original.assertions = Array.from({ length: 60 }, (_, index) => ({ ...assertion, id: `a${index}` }));
  original.scenarios = Array.from({ length: 30 }, (_, index) => ({ ...scenario, id: `s${index}`, steps: Array.from({ length: 30 }, (_, step) => ({ ...scenario.steps[0], id: `step${step}` })) }));
  original.runs = Array.from({ length: 25 }, (_, index) => ({ id: `r${index}`, scenarioId: 's0', stepId: 'step0', experimentId: `e${index}`, status: 'passed', startedAt: index, results: [{ id: 'a0', outcome: 'passed', type: 'status', expected: 200, actual: 200 }] }));
  const capped = P.normalizeInvestigationStore({ schemaVersion: 1, investigations: Array.from({ length: 35 }, (_, index) => ({ ...saved(), id: `i${index}` })) });
  assert.equal(capped.investigations.length, 25);
  const result = P.normalizeInvestigationStore(envelope(original));
  assert.equal(result.investigations[0].assertions.length, 50);
  assert.equal(result.investigations[0].scenarios.length, 20);
  assert.equal(result.investigations[0].scenarios[0].steps.length, 20);
  assert.equal(result.investigations[0].runs.length, 20);
  assert.equal(result.investigations[0].runs[0].id, 'r5');
});

test('running receipts restore interrupted, serialization retains current running state', () => {
  const original = saved();
  const scenario = I.createScenario(original, source); original.scenarios = [scenario];
  original.runs = [{ id: 'run', scenarioId: scenario.id, stepId: scenario.steps[0].id, experimentId: 'experiment', status: 'running', startedAt: 10, results: [] }];
  assert.equal(P.serializeInvestigationStore(envelope(original)).investigations[0].runs[0].status, 'running');
  const restored = P.normalizeInvestigationStore(envelope(original)).investigations[0].runs[0];
  assert.equal(restored.status, 'interrupted');
  assert.match(restored.reason, /interrupt/i);
});

test('storage strips unknown/raw fields, snapshots sanitized checks/plans and scalar results', () => {
  const original = saved();
  original.title = 'token=private-title'; original.notes = 'Bearer private-note';
  original.entryRefs[0].responseRaw = 'private-response';
  const scenario = I.createScenario(original, source, { headers: { authorization: 'Bearer private-header' }, body: { password: 'private-body' } });
  scenario.steps[0].plan.body = { token: 'private-plan' };
  original.scenarios = [scenario];
  original.assertions = [{ ...I.createAssertion(source, 'session', { type: 'status', expected: 200 }), check: { type: 'structural', mode: 'equal', expected: { password: 'private-expected' } } }];
  original.runs = [{ id: 'run', scenarioId: scenario.id, stepId: scenario.steps[0].id, experimentId: 'experiment', status: 'failed', startedAt: 10, results: [{ id: 'a', type: 'structural', outcome: 'passed', expected: { password: 'private-result' }, actual: { password: 'private-result' } }], reason: 'token=private-reason' }];
  original.rawEntry = source;
  const output = P.serializeInvestigationStore(envelope(original));
  const text = JSON.stringify(output);
  assert.equal(text.includes('private-'), false);
  assert.equal(text.includes('rawEntry'), false);
  assert.equal(text.includes('responseRaw'), false);
  assert.equal(output.investigations[0].runs[0].results[0].outcome, 'unavailable');
});

test('malformed scalar fields never execute coercion and accessor response evidence cannot pass absence checks', () => {
  let reads = 0;
  const scalar = { toString() { reads += 1; throw Error('unsafe coercion'); }, valueOf() { reads += 1; throw Error('unsafe coercion'); } };
  const original = saved();
  original.filters.apiQuickFilter = scalar; original.filters.sortField = scalar;
  original.assertions = [{ id: 'invalid', entryRef: original.entryRefs[0], check: { type: 'status', expected: scalar } }];
  assert.doesNotThrow(() => P.normalizeInvestigationStore(envelope(original)));
  const absent = I.createAssertion(source, 'session', { type: 'response', expected: false });
  const observed = Object.defineProperty({}, 'responseRaw', { get() { reads += 1; return 'private-response'; } });
  assert.equal(I.evaluateAssertions([absent], observed)[0].outcome, 'unavailable');
  assert.equal(reads, 0);
});

test('aggregate UTF-8 serialized envelope stays within one megabyte without truncating structural expectations', () => {
  const original = saved();
  const scenario = I.createScenario(original, source, { body: '界'.repeat(6_000) });
  original.scenarios = Array.from({ length: 20 }, (_, index) => ({ ...scenario, id: `s${index}`, steps: Array.from({ length: 20 }, (_, step) => ({ ...scenario.steps[0], id: `step${step}` })) }));
  const result = P.serializeInvestigationStore({ schemaVersion: 1, investigations: Array.from({ length: 25 }, (_, index) => ({ ...original, id: `i${index}` })) });
  assert.ok(Buffer.byteLength(JSON.stringify(result)) <= P.MAX_INVESTIGATION_STORE_BYTES);
  for (const investigation of result.investigations) for (const scenario of investigation.scenarios) for (const step of scenario.steps) assert.equal(step.plan.body, '界'.repeat(6_000));
});

test('receipt cap keeps newest runs even for an oversized untrusted receipt array', () => {
  const original = saved();
  const scenario = I.createScenario(original, source); original.scenarios = [scenario];
  original.runs = Array.from({ length: 1_000 }, (_, index) => ({ id: `r${index}`, scenarioId: scenario.id, stepId: scenario.steps[0].id, experimentId: `e${index}`, status: 'passed', startedAt: index, results: [] }));
  const runs = P.normalizeInvestigationStore(envelope(original)).investigations[0].runs;
  assert.equal(runs.length, 20);
  assert.equal(runs[0].id, 'r980');
  assert.equal(runs.at(-1).id, 'r999');
});

test('nested malformed rows and plans are rejected while safe references survive unavailable metadata', () => {
  const original = saved();
  const scenario = I.createScenario(original, source);
  const step = scenario.steps[0];
  const badRef = { entryId: '', sessionId: 'session' };
  original.entryRefs.push(null, badRef, { ...original.entryRefs[0], entryId: 'fallback', origin: 'invalid', path: '/fallback?token=private', status: Infinity });
  original.assertions = [null, { id: 'bad', entryRef: badRef, check: { type: 'status', expected: 200 } }, { id: 'structural', entryRef: original.entryRefs[0], check: { type: 'structural', mode: 'schema' } }];
  original.scenarios = [null, { id: '' }, { ...scenario, steps: [null, { ...step, id: '' }, { ...step, id: 'bad-ref', source: badRef }, { ...step, id: 'bad-origin', source: { ...step.source, origin: '' } }, { ...step, id: 'bad-plan', plan: null }, { ...step, id: 'bad-url', plan: { ...step.plan, url: 'invalid' } }, { ...step, checks: [null, { type: 'js' }, { type: 'structural', mode: 'schema' }] }] }];
  original.runs = [null, { id: 'bad' }, { id: 'run', scenarioId: scenario.id, stepId: step.id, experimentId: 'experiment', status: 'failed', startedAt: NaN, finishedAt: 30, observedEntryId: 'observed', reason: 'Failed safely.', results: [null, { id: 'bad', type: 'js' }, { id: 'response', type: 'response', outcome: 'failed', expected: true, actual: false, reason: 'Missing response.' }, { id: 'shape', type: 'structural', outcome: 'passed', expected: 'schema', actual: 'match' }, { id: 'missing', type: 'status', outcome: 'unavailable', expected: 200, actual: 'unavailable' }] }];
  const clean = P.normalizeInvestigationStore(envelope(original)).investigations[0];
  assert.equal(clean.entryRefs.length, 2);
  assert.equal(clean.entryRefs[1].path, '/fallback');
  assert.equal(clean.entryRefs[1].origin, '');
  assert.equal(clean.assertions.length, 1);
  assert.equal(clean.assertions[0].check.expected, '[UNAVAILABLE]');
  assert.equal(clean.scenarios.length, 1);
  assert.equal(clean.scenarios[0].steps.length, 1);
  assert.equal(clean.scenarios[0].steps[0].checks[0].expected, '[UNAVAILABLE]');
  assert.equal(clean.runs.length, 1);
  assert.equal(clean.runs[0].startedAt, 0);
  assert.equal(clean.runs[0].finishedAt, 30);
  assert.equal(clean.runs[0].observedEntryId, 'observed');
  assert.deepEqual(clean.runs[0].results.map(item => item.outcome), ['failed', 'passed', 'unavailable']);
});

test('each scenario retains its own twenty receipts with duplicate IDs removed', () => {
  const original = saved();
  const scenarios = [I.createScenario(original, source), I.createScenario(original, source)];
  original.scenarios = scenarios;
  original.runs = Array.from({ length: 60 }, (_, index) => ({ id: `run${index}`, scenarioId: scenarios[index % 2].id, stepId: scenarios[index % 2].steps[0].id, experimentId: `experiment${index}`, status: index % 3 ? 'cancelled' : 'unavailable', startedAt: index, results: [] }));
  original.runs.push(original.runs.at(-1));
  const clean = P.serializeInvestigationStore(envelope(original)).investigations[0];
  assert.equal(clean.runs.length, 40);
  for (const scenario of scenarios) assert.equal(clean.runs.filter(run => run.scenarioId === scenario.id).length, 20);
  assert.equal(clean.runs[0].id, 'run20');
});

test('normalization never invents captured-target intent from redacted endpoint equality', () => {
  const original = saved();
  const scenario = I.createScenario(original, source, { url: source.url.replace('private-query', 'edited-query') });
  original.scenarios = [scenario];
  const restored = P.normalizeInvestigationStore(envelope(original)).investigations[0];
  assert.notEqual(restored.scenarios[0].steps[0].plan.preserveCapturedUrl, true);
  scenario.steps[0].plan = { ...scenario.steps[0].plan, url: 'https://api.example.test/items?q=raw-edited-query', preserveCapturedUrl: true };
  assert.notEqual(P.normalizeInvestigationStore(envelope(original)).investigations[0].scenarios[0].steps[0].plan.preserveCapturedUrl, true);
});
