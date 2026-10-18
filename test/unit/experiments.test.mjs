import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import './harness.mjs';

const E = await import('../../src/panel/models/experiments.ts');

const baseline = {
  id: 'entry-1',
  url: 'https://api.example.test/users',
  method: 'GET',
  status: 200,
  responseDecrypted: { ok: true, users: [{ id: 1 }] },
};

const plan = {
  method: 'POST',
  url: 'https://api.example.test/users',
  headers: {
    authorization: 'Bearer super-secret',
    'x-client': 'visible',
  },
  body: { password: 'do-not-persist', name: 'Ada' },
};

function draft(overrides = {}) {
  return E.createExperiment({
    title: 'Create user',
    baselineEntryId: baseline.id,
    baselineUrl: baseline.url,
    plan,
    checks: [{ type: 'status', expected: 201 }, { type: 'response', expected: true }, { type: 'structural', mode: 'equal' }],
    now: 100,
    ...overrides,
  });
}

test('createExperiment creates a draft with a bounded sanitized plan', () => {
  const record = draft();
  assert.equal(record.status, 'draft');
  assert.equal(record.baselineEntryId, baseline.id);
  assert.equal(record.createdAt, 100);
  assert.equal(record.updatedAt, 100);
  assert.equal(record.plan.headers.authorization, '[REDACTED]');
  assert.equal(record.plan.headers['x-client'], 'visible');
  assert.equal(record.plan.body.password, '[REDACTED]');
  assert.equal(JSON.stringify(record).includes('super-secret'), false);
  assert.equal(JSON.stringify(record).includes('do-not-persist'), false);
});

test('lifecycle requires explicit arm and returns immutable transitions', () => {
  const created = draft();
  assert.throws(() => E.startExperiment(created), /armed/i);
  const armed = E.armExperiment(created, 200);
  assert.equal(armed.status, 'armed');
  assert.equal(created.status, 'draft');
  const running = E.startExperiment(armed, [], 300);
  assert.equal(running.status, 'running');
  assert.equal(running.startedAt, 300);
  assert.equal(armed.status, 'armed');
  assert.throws(() => E.armExperiment(running), /running/i);
});

test('one active run per baseline and a cap helper enforce bounds', () => {
  const running = E.startExperiment(E.armExperiment(draft(), 2), [], 3);
  assert.equal(E.hasActiveRun([running], baseline.id), true);
  assert.throws(() => E.startExperiment(E.armExperiment(draft({ now: 4 }), 5), [running], 6), /active/i);
  assert.equal(E.canCreateExperiment(Array.from({ length: E.MAX_EXPERIMENTS }, () => running)), false);
  assert.equal(E.canCreateExperiment(Array.from({ length: E.MAX_EXPERIMENTS - 1 }, () => running)), true);
});

test('invalid and cross-origin URLs are refused unless explicitly retargeted', () => {
  assert.throws(() => draft({ plan: { ...plan, url: '' } }), /URL/i);
  assert.throws(() => draft({ plan: { ...plan, url: 'not a url' } }), /URL/i);
  assert.throws(() => draft({ plan: { ...plan, url: 'https://other.example.test/users' } }), /origin/i);
  assert.doesNotThrow(() => draft({ plan: { ...plan, url: 'https://other.example.test/users', retargetAcknowledged: true } }));
});

test('observe associates only matching replay or mock entries and keeps observed id immutable', () => {
  const running = E.startExperiment(E.armExperiment(draft(), 2), [], 3);
  assert.throws(() => E.observeExperiment(running, { id: 'wrong', replayOf: 'other' }), /match/i);
  const observed = E.observeExperiment(running, {
    id: 'result-1', replayOf: baseline.id, status: 201,
    responseDecrypted: { ok: true, users: [{ id: 1 }] },
  }, 4);
  assert.equal(observed.status, 'observed');
  assert.equal(observed.observedEntryId, 'result-1');
  assert.throws(() => E.observeExperiment(observed, { id: 'result-2', replayOf: baseline.id }), /observed/i);
});

test('mock association requires the configured rule and mocked marker', () => {
  const running = E.startExperiment(E.armExperiment(draft({ plan: { ...plan, mockRuleId: 'rule-1' } }), 2), [], 3);
  assert.throws(() => E.observeExperiment(running, { id: 'result-1', mockRuleId: 'rule-1' }), /match/i);
  const observed = E.observeExperiment(running, { id: 'result-1', mockRuleId: 'rule-1', mocked: true, status: 201, responseDecrypted: {} });
  assert.equal(observed.status, 'observed');
});

test('evaluateExperiment produces deterministic status, presence, and structural checks', () => {
  const record = draft();
  const result = E.evaluateExperiment(record, { status: 201, responseDecrypted: { ok: true, users: [{ id: 1 }] } }, baseline);
  assert.equal(result.passed, true);
  assert.deepEqual(result.checks.map(check => check.passed), [true, true, true]);
  const failed = E.evaluateExperiment(record, { status: 500, responseDecrypted: { ok: false } }, baseline);
  assert.equal(failed.passed, false);
  assert.deepEqual(failed.checks.map(check => check.passed), [false, true, false]);
});

test('fail and cancel are terminal, with bounded reasons and no payloads', () => {
  const running = E.startExperiment(E.armExperiment(draft(), 2), [], 3);
  const failed = E.failExperiment(running, 'x'.repeat(5000), 4);
  assert.equal(failed.status, 'failed');
  assert.equal(failed.errorReason.length, E.MAX_ERROR_REASON);
  assert.throws(() => E.startExperiment(failed), /failed/i);
  const cancelled = E.cancelExperiment(draft(), 'user cancelled', 5);
  assert.equal(cancelled.status, 'cancelled');
  assert.throws(() => E.cancelExperiment(cancelled), /cancelled/i);
});

function structural(expected, mode = 'equal') {
  return draft({ checks: [{ type: 'structural', mode, ...(expected !== undefined ? { expected } : {}) }] });
}

function assertUnavailable(result) {
  assert.equal(result.passed, false);
  assert.equal(result.checks[0].actual, 'unavailable');
  assert.match(result.checks[0].reason, /unavailable/i);
  for (const check of result.checks) {
    assert.ok(['string', 'number', 'boolean'].includes(typeof check.actual));
    assert.ok(['string', 'number', 'boolean'].includes(typeof check.expected));
  }
}

test('numeric branching and key-heavy plans have a total serialized budget', () => {
  let body = 1;
  for (let depth = 0; depth < 3; depth += 1) body = Array.from({ length: 100 }, () => body);
  const record = draft({ plan: { ...plan, body } });
  assert.ok(JSON.stringify(record.plan.body).length <= E.MAX_PLAN_BODY);
  const keys = Object.fromEntries(Array.from({ length: 100 }, (_, i) => ['x'.repeat(120) + i, Array(100).fill(123456789)]));
  assert.ok(JSON.stringify(draft({ plan: { ...plan, body: keys } }).plan.body).length <= E.MAX_PLAN_BODY);
});

test('model URL sanitization removes credentials and fragments', () => {
  const record = draft({ plan: { ...plan, url: 'https://user:password@api.example.test/users?token=secret&next=visible#private-fragment' } });
  const url = new URL(record.plan.url);
  assert.equal(url.username, '');
  assert.equal(url.password, '');
  assert.equal(url.hash, '');
  assert.equal(url.searchParams.get('token'), '[REDACTED]');
  assert.equal(url.searchParams.get('next'), '[REDACTED]');
});

test('duplicate query parameters cannot skip redaction of later secrets', () => {
  const record = draft({ plan: { ...plan, url: 'https://api.example.test/users?a=one&a=two&next=private-value' } });
  assert.equal(new URL(record.plan.url).searchParams.get('next'), '[REDACTED]');
  assert.equal(record.plan.url.includes('private-value'), false);
});

test('structural expectations are detached immutable sanitized snapshots', () => {
  const expected = { user: { id: 1, password: 'expected-secret' }, values: [1] };
  const record = structural(expected);
  expected.user.id = 2;
  expected.values.push(2);
  assert.equal(record.checks[0].expected.user.id, 1);
  assert.deepEqual(record.checks[0].expected.values, [1]);
  assert.ok(Object.isFrozen(record.checks[0].expected));
  assert.ok(Object.isFrozen(record.checks[0].expected.user));
  assert.ok(Object.isFrozen(record.checks[0].expected.values));
  assert.equal(JSON.stringify(record).includes('expected-secret'), false);
});

test('null decrypted responses fall back to raw JSON for presence and structural comparisons', () => {
  const record = draft({ checks: [{ type: 'response', expected: true }, { type: 'structural', mode: 'equal', expected: { ok: true } }] });
  const result = E.evaluateExperiment(record, { responseDecrypted: null, responseRaw: '{"ok":true}' });
  assert.equal(result.passed, true);
  assert.equal(E.evaluateExperiment(structural(undefined), { responseRaw: '{"ok":true}' }, { responseDecrypted: null, responseRaw: '{"ok":true}' }).passed, true);
});

test('raw JSON schemas compare parsed fields rather than the string type', () => {
  const record = structural(undefined, 'schema');
  assert.equal(E.evaluateExperiment(record, { responseRaw: '{"different":1}' }, { responseRaw: '{"ok":true}' }).passed, false);
  assert.equal(E.evaluateExperiment(record, { responseRaw: '{"ok":false}' }, { responseRaw: '{"ok":true}' }).passed, true);
});

test('redacted or truncated structural data cannot establish a match in any mode', () => {
  for (const mode of ['equal', 'contains', 'schema']) {
    for (const value of [{ password: 'secret' }, { value: '[REDACTED]' }, { value: '[TRUNCATED]' }, { value: 'Bearer private-value' }, { value: 'x'.repeat(E.MAX_PLAN_BODY + 1) }]) {
      assertUnavailable(E.evaluateExperiment(structural(value, mode), { responseDecrypted: value }));
      assertUnavailable(E.evaluateExperiment(structural(undefined, mode), { responseDecrypted: value }, { responseDecrypted: value }));
    }
  }
});

test('cyclic and beyond-depth structural data report unavailable without recursion failure', () => {
  const cyclic = {};
  cyclic.self = cyclic;
  let deep = { leaf: 1 };
  for (let depth = 0; depth < 10_000; depth += 1) deep = { nested: deep };
  for (const mode of ['equal', 'contains', 'schema']) {
    for (const value of [cyclic, deep]) {
      assertUnavailable(E.evaluateExperiment(structural(undefined, mode), { responseDecrypted: value }, { responseDecrypted: value }));
      assertUnavailable(E.evaluateExperiment(structural(value, mode), { responseDecrypted: value }));
    }
  }
});

test('contains does not pass partial prefixes or inherited fields', () => {
  const huge = Array(10_000).fill(1);
  assertUnavailable(E.evaluateExperiment(structural([1], 'contains'), { responseDecrypted: huge }));
  assert.equal(E.evaluateExperiment(structural({ hidden: 1 }, 'contains'), { responseDecrypted: Object.create({ hidden: 1 }) }).passed, false);
});

test('comparison preserves deterministic complete-data semantics and shared subtrees', () => {
  const shared = { value: 1 };
  assert.equal(E.evaluateExperiment(structural({ a: shared, b: shared }), { responseDecrypted: { b: { value: 1 }, a: { value: 1 } } }).passed, true);
  assert.equal(E.evaluateExperiment(structural({ a: 1 }, 'contains'), { responseDecrypted: { a: 1, extra: true } }).passed, true);
  assert.equal(E.evaluateExperiment(structural([1, 2]), { responseDecrypted: [1, 3] }).passed, false);
  assert.equal(E.evaluateExperiment(structural(null), { responseRaw: 'null' }).passed, true);
});

test('accessors and non-JSON values are unavailable without invoking payload getters', () => {
  let reads = 0;
  const accessor = Object.defineProperty({}, 'value', { enumerable: true, get() { reads += 1; return 'private-value'; } });
  const sparse = Array(2);
  for (const value of [accessor, sparse, { value: undefined }, { value: NaN }, { value: Infinity }, new Date(0)]) {
    const record = structural(value);
    assertUnavailable(E.evaluateExperiment(record, { responseDecrypted: value }));
    assert.equal(JSON.stringify(record).includes('private-value'), false);
  }
  assert.equal(reads, 0);
});

test('serialized escaping and object keys count toward the budget on both sides', () => {
  const escaped = { text: '\u0000'.repeat(E.MAX_PLAN_BODY / 2) };
  const keyHeavy = Object.fromEntries(Array.from({ length: 300 }, (_, index) => ['field'.repeat(20) + index, index]));
  for (const value of [escaped, keyHeavy, Array(10_000).fill(0)]) {
    const record = structural(value);
    assert.ok(JSON.stringify(record.checks[0].expected).length <= E.MAX_PLAN_BODY);
    assertUnavailable(E.evaluateExperiment(record, { responseDecrypted: value }));
    const restored = JSON.parse(JSON.stringify(record));
    assertUnavailable(E.evaluateExperiment(restored, { responseDecrypted: {} }));
    assertUnavailable(E.evaluateExperiment(structural(undefined), { responseDecrypted: value }, { responseDecrypted: value }));
  }
});

test('status and presence remain usable when structural responses are unavailable', () => {
  const cyclic = {};
  cyclic.self = cyclic;
  const record = draft({ checks: [{ type: 'status', expected: 200 }, { type: 'response', expected: true }] });
  assert.equal(E.evaluateExperiment(record, { status: 200, responseDecrypted: cyclic }).passed, true);
  const absent = draft({ checks: [{ type: 'response', expected: false }] });
  for (const responseRaw of [undefined, null, '']) {
    assert.equal(E.evaluateExperiment(absent, { responseDecrypted: null, responseRaw }).passed, true);
  }
  assert.equal(E.evaluateExperiment(record, { status: 200, responseDecrypted: false, responseRaw: '' }).passed, true);
});

test('experiment helpers bound malformed collections and ignore unsupported checks', () => {
  assert.deepEqual(E.capExperiments(null), []);
  assert.deepEqual(E.normalizeExperiments({}), []);
  assert.equal(E.canCreateExperiment(null), false);
  const record = E.createExperiment({
    baseline: { id: 'fallback-baseline', url: baseline.url },
    method: 'GET', url: baseline.url, headers: {},
    checks: [{ type: 'unsupported' }, null],
  });
  assert.deepEqual(record.checks, []);
});

test('quoted sensitive fields inside JSON text are sanitized and cannot pass structural checks', () => {
  const text = '{"password":"private-json-secret","ok":true}';
  const record = structural({ nested: text });
  assert.equal(JSON.stringify(record).includes('private-json-secret'), false);
  assert.equal(JSON.stringify(draft({ plan: { ...plan, body: text } })).includes('private-json-secret'), false);
  assertUnavailable(E.evaluateExperiment(record, { responseDecrypted: { nested: text } }));
  const escaped = '{"password":"prefix\\"private-escaped-secret"}';
  assert.equal(JSON.stringify(structural({ nested: escaped })).includes('private-escaped-secret'), false);
});

test('embedded sensitive keys preserve quoted/escaped redaction and snapshot reasons', () => {
  const cases = [
    ['prefix_access_token_suffix=private-value&ok=yes', 'prefix_access_token_suffix=[REDACTED]&ok=yes'],
    ['{"password":"prefix\\"private-value","ok":true}', '{"password"=[REDACTED],"ok":true}'],
    ["'private-key': 'prefix\\'private-value'; ok=yes", "'private-key'=[REDACTED]; ok=yes"],
    ['x.authorization.header : private-value, ok=yes', 'x.authorization.header=[REDACTED], ok=yes'],
    ['api_key="private-value" session-id=private-session', 'api_key=[REDACTED] session-id=[REDACTED]'],
    ['Bearer private-value', '[REDACTED]'],
    ['prefixeyJabc.eyJdef.private-value', 'prefix[REDACTED]'],
    ['ordinary.eyJabc.eyJdef.private-value', 'ordinary.[REDACTED]'],
    ['eyJ.eyJabc.eyJdef.private-value', 'eyJ.[REDACTED]'],
    ['plain=token=private-value', 'plain=token=[REDACTED]'],
  ];
  for (const [input, expected] of cases) {
    assert.deepEqual(E.snapshotExperimentValue(input), { value: expected, reason: 'redacted or incomplete data' });
    assert.equal(draft({ plan: { ...plan, body: input } }).plan.body, expected);
    assertUnavailable(E.evaluateExperiment(structural(input), { responseDecrypted: input }));
  }
});

// A node:test timeout cannot interrupt synchronous regex backtracking. Run the
// real model in a killable child so regressions cannot stall the whole suite.
const performanceCases = [
  ['19500-character alphanumeric run', 'abcToken123XY'.repeat(1500)],
  ['plain alphanumeric control', 'a1B'.repeat(6500)],
  ['punctuation control', '!,:;'.repeat(4875)],
  ['repeated sensitive prefixes without delimiter', 'token'.repeat(3900)],
  ['long eyJ near miss without dots', 'eyJ'.repeat(6500)],
  ['long eyJ near miss with incomplete signature', 'eyJ'.repeat(3250) + '.' + 'eyJ'.repeat(3249) + '.'],
  ['sensitive key followed by whitespace without delimiter', 'token' + ' '.repeat(19495)],
  ['unterminated quoted value', 'password="' + 'a'.repeat(19490), 'password=[REDACTED]'],
  ['long token with embedded sensitive key', 'a'.repeat(19450) + 'token=private-value', 'a'.repeat(19450) + 'token=[REDACTED]'],
  ['long quoted sensitive key', '"' + 'a'.repeat(19450) + 'password":"private-value"', '"' + 'a'.repeat(19450) + 'password"=[REDACTED]'],
];

for (const [label, input, expected = input] of performanceCases) {
  test(`sanitizer processes ${label} in under 2 seconds`, (t) => {
    const child = spawnSync(process.execPath, ['--input-type=module', '--eval', `
      import assert from 'node:assert/strict';
      import ${JSON.stringify(new URL('./harness.mjs', import.meta.url).href)};
      const E = await import(${JSON.stringify(new URL('../../src/panel/models/experiments.ts', import.meta.url).href)});
      const input = ${JSON.stringify(input)};
      const expected = ${JSON.stringify(expected)};
      const started = performance.now();
      const snapshot = E.snapshotExperimentValue(input);
      const record = E.createExperiment({ baselineEntryId: 'baseline', baselineUrl: 'https://api.example.test/', plan: { url: 'https://api.example.test/', body: input }, checks: [{ type: 'structural', mode: 'equal', expected: input }] });
      assert.ok(JSON.stringify(record).length < 45000);
      assert.equal(JSON.stringify(record).includes('private-value'), false);
      assert.equal(JSON.stringify(snapshot).includes('private-value'), false);
      assert.deepEqual(snapshot, input === expected ? { value: expected } : { value: expected, reason: 'redacted or incomplete data' });
      assert.equal(record.plan.body, expected);
      process.stdout.write(JSON.stringify({ elapsedMs: performance.now() - started }));
    `], { timeout: 10000, killSignal: 'SIGKILL', encoding: 'utf8' });
    assert.equal(child.error?.code, undefined, `${label}: child exceeded timeout (${child.error?.code})`);
    assert.equal(child.status, 0, `${label}: child assertions failed: ${child.stderr}`);
    const { elapsedMs } = JSON.parse(child.stdout);
    assert.ok(elapsedMs < 2000, `${label}: sanitizer took ${elapsedMs}ms`);
    t.diagnostic(`sanitizer/model calls: ${elapsedMs.toFixed(2)}ms`);
  });
}

test('JWT near-miss scanning stays bounded before header truncation', (t) => {
  const child = spawnSync(process.execPath, ['--input-type=module', '--eval', `
    import assert from 'node:assert/strict';
    import ${JSON.stringify(new URL('./harness.mjs', import.meta.url).href)};
    const E = await import(${JSON.stringify(new URL('../../src/panel/models/experiments.ts', import.meta.url).href)});
    const started = performance.now();
    const record = E.createExperiment({ baselineEntryId: 'baseline', baselineUrl: 'https://api.example.test/', plan: { url: 'https://api.example.test/', headers: { 'x-debug': 'eyJ'.repeat(100000) } } });
    assert.equal(record.plan.headers['x-debug'], 'eyJ'.repeat(333) + 'e');
    process.stdout.write(JSON.stringify({ elapsedMs: performance.now() - started }));
  `], { timeout: 10000, killSignal: 'SIGKILL', encoding: 'utf8' });
  assert.equal(child.error?.code, undefined, `JWT header near miss exceeded timeout (${child.error?.code})`);
  assert.equal(child.status, 0, `JWT header assertions failed: ${child.stderr}`);
  const { elapsedMs } = JSON.parse(child.stdout);
  assert.ok(elapsedMs < 2000, `JWT header sanitizer took ${elapsedMs}ms`);
  t.diagnostic(`300000-character header sanitizer: ${elapsedMs.toFixed(2)}ms`);
});

test('experiment snapshots redact password and key synonyms by normalized name', () => {
  const { value } = E.snapshotExperimentValue({ pwd: 'synthetic-pwd', 'Access-Key': 'synthetic-ak', otp: '123456', author: 'Ann' });
  assert.equal(value.pwd, '[REDACTED]');
  assert.equal(value['Access-Key'], '[REDACTED]');
  assert.equal(value.otp, '[REDACTED]');
  assert.equal(value.author, 'Ann');
});
