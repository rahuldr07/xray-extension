import test from 'node:test';
import assert from 'node:assert/strict';
import { apiEntry } from './harness.mjs';

const I = await import('../../src/panel/models/investigations.ts');
const entry = () => apiEntry({ id: 'source', url: 'https://user:password@api.example.test/items?q=private-query#private-fragment', responseDecrypted: { ok: true } });
const investigation = (overrides = {}) => I.createInvestigation({ sessionId: 'session', entries: [entry()], selectedId: 'source', pinnedIds: new Set(['source']), ...overrides });

test('save snapshots compact context without bodies, query values or implicit references', () => {
  const saved = investigation({ title: 'token=private-title', notes: 'Bearer private-notes', filters: { apiSearchQuery: 'password=private-search', methodFilters: new Set(['GET']) }, findingIds: ['f1', 'f1'] });
  assert.equal(saved.sourceSessionId, 'session');
  assert.deepEqual(saved.pinnedEntryIds, ['source']);
  assert.equal(saved.entryRefs[0].path, '/items');
  assert.equal(saved.entryRefs[0].origin, 'https://api.example.test');
  assert.deepEqual(saved.filters.methodFilters, ['GET']);
  assert.deepEqual(saved.findingIds, ['f1']);
  for (const secret of ['private-query', 'private-fragment', 'private-title', 'private-notes', 'private-search', 'responseDecrypted']) assert.equal(JSON.stringify(saved).includes(secret), false);
  assert.deepEqual(investigation({ selectedId: null, pinnedIds: [], compareLeftId: null }).entryRefs, []);
});

test('references resolve only matching session and entry, never silently substitute', () => {
  const source = entry();
  const ref = I.makeEntryRef(source, 'session');
  assert.equal(I.resolveEntryRef(ref, 'session', [source]), source);
  assert.equal(I.resolveEntryRef(ref, 'different-session', [source]), null);
  assert.equal(I.resolveEntryRef(ref, 'session', [entryWithId('different')]), null);
  assert.equal(I.resolveEntryRef(null, 'session', [source]), null);
  assert.equal(I.resolveEntryRef({ entryId: source.id }, undefined, [source]), null);
});
function entryWithId(id) { return apiEntry({ id }); }

test('structural assertions freeze parsed baseline values and delegate scalar tri-state evaluation', () => {
  const source = apiEntry({ id: 'source', responseRaw: '{"ok":true}', responseDecrypted: null });
  const structural = I.createAssertion(source, 'session', { type: 'structural', mode: 'equal' });
  source.responseRaw = '{"ok":false}';
  assert.deepEqual(structural.check.expected, { ok: true });
  assert.ok(Object.isFrozen(structural.check.expected));
  const status = I.createAssertion(source, 'session', { type: 'status', expected: 200 });
  const results = I.evaluateAssertions([structural, status], apiEntry({ responseRaw: '{"ok":true}' }));
  assert.deepEqual(results.map(result => result.outcome), ['passed', 'passed']);
  assert.equal(I.evaluateAssertions([structural], source)[0].outcome, 'failed');
  assert.equal(I.evaluateAssertions([structural], null)[0].outcome, 'unavailable');
  assert.equal(I.evaluateAssertions([status], { status: 0 })[0].outcome, 'unavailable');
  assert.equal(I.evaluateAssertions([I.createAssertion(source, 'session', { type: 'response', expected: false })], {})[0].outcome, 'passed');
  for (const result of results) for (const key of ['expected', 'actual']) assert.ok(['string', 'number', 'boolean'].includes(typeof result[key]));
});

test('redacted, absent, cyclic and getter baseline evidence stays unavailable after save', () => {
  let reads = 0;
  const cyclic = {}; cyclic.self = cyclic;
  const accessor = Object.defineProperty({}, 'hidden', { enumerable: true, get() { reads += 1; return 'private-getter'; } });
  for (const value of [{ password: 'private-secret' }, cyclic, accessor, undefined]) {
    const source = apiEntry({ responseDecrypted: value, responseRaw: undefined });
    const spec = I.createAssertion(source, 'session', { type: 'structural', mode: 'equal' });
    assert.equal(JSON.stringify(spec).includes('private-secret'), false);
    assert.equal(I.evaluateAssertions([JSON.parse(JSON.stringify(spec))], source)[0].outcome, 'unavailable');
  }
  assert.equal(reads, 0);
});

test('scenario preparation is inert and preserves captured URL intent only for exact unchanged targets', () => {
  const source = entry();
  const saved = investigation();
  const scenario = I.createScenario(saved, source);
  assert.equal(scenario.steps.length, 1);
  assert.equal(scenario.steps[0].plan.preserveCapturedUrl, true);
  assert.equal(scenario.steps[0].source.sessionId, 'session');
  assert.equal(saved.scenarios.length, 0);
  assert.equal(JSON.stringify(scenario).includes('private-query'), false);
  const edited = I.createScenario(saved, source, { url: source.url.replace('private-query', 'different-query'), preserveCapturedUrl: true });
  assert.notEqual(edited.steps[0].plan.preserveCapturedUrl, true);
  assert.throws(() => I.createScenario(saved, source, { url: 'https://other.test/items' }), /origin/i);
  assert.equal(I.createScenario(saved, source, { url: 'https://other.test/items', retargetAcknowledged: true }).steps[0].plan.retargetAcknowledged, true);
  assert.throws(() => I.createScenario({ ...saved, scenarios: Array(20).fill(scenario) }, source), /limit|20|cap/i);
});

test('malformed creation validates required context without invoking accessors', () => {
  assert.throws(() => I.createInvestigation({}), /session/i);
  let reads = 0;
  const bad = Object.defineProperty({}, 'sessionId', { get() { reads += 1; return 'session'; } });
  assert.throws(() => I.createInvestigation(bad), /session/i);
  assert.equal(reads, 0);
  assert.throws(() => I.createAssertion(entry(), 'session', { type: 'status', expected: 900 }), /check|assertion/i);
});

test('creation consumes bounded iterable IDs and snapshots invalid/deep baselines fail closed', () => {
  function* ids() { for (let index = 0; index < 1_000_000; index += 1) yield `entry${index}`; }
  const saved = investigation({ pinnedIds: ids() });
  assert.equal(saved.pinnedEntryIds.length, I.MAX_INVESTIGATION_REFS);
  let deep = { ok: true };
  for (let index = 0; index < 100; index += 1) deep = { child: deep };
  const source = apiEntry({ responseDecrypted: deep });
  const spec = I.createAssertion(source, 'session', { type: 'structural', mode: 'schema' });
  assert.equal(I.evaluateAssertions([spec], apiEntry({ responseDecrypted: {} }))[0].outcome, 'unavailable');
});

test('scenario overrides retain intentional null bodies and refuse malformed target/mock intent', () => {
  const source = apiEntry({ requestBody: { private: 'captured body' } });
  const saved = investigation();
  assert.equal(I.createScenario(saved, source, { body: null }).steps[0].plan.body, null);
  for (const plan of [{ url: {} }, { url: null }, { mockRuleId: {} }, { mockRuleId: 'token=private-rule' }]) assert.throws(() => I.createScenario(saved, source, plan), /url|plan|mock/i);
  let reads = 0;
  const accessor = Object.defineProperty({}, 'url', { get() { reads += 1; return source.url; } });
  assert.throws(() => I.createScenario(saved, source, accessor), /plan|accessor/i);
  assert.equal(reads, 0);
});

test('untrusted metadata and iterables fail closed without accessor reads or raw payload copies', () => {
  let reads = 0;
  const getter = () => { reads += 1; throw Error('must not read'); };
  const iterator = Object.defineProperty({}, Symbol.iterator, { get: getter });
  const invalidIterator = { [Symbol.iterator]() { throw Error('invalid iteration'); } };
  for (const pinnedIds of [iterator, invalidIterator, null, 'not an ID list']) assert.deepEqual(investigation({ pinnedIds }).pinnedEntryIds, []);
  const record = investigation({ title: 'https://[invalid-url', filters: { apiQuickFilter: 'errors', apiGroupingMode: 'flat', sortField: 'duration', sortOrder: 'asc', statusFilters: ['4xx', 'bad'], typeFilters: ['xhr', 'bad'] }, now: 0 });
  assert.equal(record.title, '[UNAVAILABLE]');
  assert.equal(record.createdAt, 0);
  assert.equal(record.filters.apiQuickFilter, 'errors');
  assert.deepEqual(record.filters.statusFilters, ['4xx']);
  assert.deepEqual(record.filters.typeFilters, ['xhr']);
  assert.equal(record.filters.sortOrder, 'asc');
  const ref = I.makeEntryRef(apiEntry({ url: 'not a url', urlPath: '/fallback?token=private' }), 'session');
  assert.equal(ref.origin, ''); assert.equal(ref.path, '/fallback');
  assert.equal(I.makeEntryRef(apiEntry({ url: 'file:///private' }), 'session').origin, '');
  assert.throws(() => I.makeEntryRef({ id: '' }, 'session'), /IDs/i);
  assert.throws(() => I.createScenario(investigation(), { id: 'missing' }), /URL/i);
  assert.deepEqual(I.evaluateAssertions([null, { id: 'bad', check: { type: 'js' } }], {}), []);
  const maliciousExpected = Object.defineProperty({ type: 'structural', mode: 'contains' }, 'expected', { get: getter });
  const spec = I.createAssertion(entry(), 'session', maliciousExpected);
  assert.equal(I.evaluateAssertions([spec], entry())[0].outcome, 'unavailable');
  const baseline = apiEntry({ responseDecrypted: { ok: true } });
  const transient = { ...spec, check: { type: 'structural', mode: 'contains' } };
  assert.equal(I.evaluateAssertions([transient], baseline, baseline)[0].outcome, 'passed');
  assert.equal(I.evaluateAssertions([transient], new Date())[0].outcome, 'unavailable');
  assert.equal(reads, 0);
});

test('cleanText keeps the leading text of long or escape-heavy input instead of collapsing to a marker', () => {
  assert.equal(I.cleanText('a'.repeat(25_000), 4_000), 'a'.repeat(4_000));
  const lines = 'note\n'.repeat(3_000);
  assert.equal(I.cleanText(lines, 4_000), lines.slice(0, 4_000));
  assert.equal(I.cleanText('"\\'.repeat(9_000), 4_000), '"\\'.repeat(2_000));
});
