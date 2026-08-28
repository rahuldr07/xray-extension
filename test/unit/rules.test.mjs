/* Behavioural tests for src/panel/models/rules.ts.

   This module is the clamp between the panel UI / an imported file and the
   MAIN-world traffic interceptor, so the tests below focus on what CANNOT get
   through: out-of-range statuses, unbounded bodies, disabled rules and rules
   with no URL matcher. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { rules as R } from './harness.mjs';

const {
  MAX_TRAFFIC_RULES,
  RULE_PRESETS,
  TRAFFIC_RULES_KEY,
  createRuleId,
  defaultRule,
  normalizeRule,
  normalizeRules,
  parseRuleSet,
  ruleSummary,
  serializeRuleSet,
  serializeRulesForRuntime,
} = R;

const rule = (overrides = {}) => normalizeRule({
  id: 'r1',
  label: 'test',
  enabled: true,
  match: { url: '/api/', method: 'GET' },
  action: { type: 'mock', status: 200, body: '{}', headers: {}, delayMs: 0 },
  ...overrides,
});

// -------------------------------------------------------------------- basics

test('TRAFFIC_RULES_KEY and MAX_TRAFFIC_RULES are the wired constants', () => {
  assert.equal(TRAFFIC_RULES_KEY, 'traffic_rules');
  assert.equal(MAX_TRAFFIC_RULES, 50);
});

test('createRuleId produces unique, prefixed ids', () => {
  const ids = new Set(Array.from({ length: 500 }, () => createRuleId()));
  assert.equal(ids.size, 500);
  for (const id of ids) assert.match(id, /^rule_[a-z0-9]+_[a-z0-9]{6}$/);
});

test('defaultRule is already normalization-stable', () => {
  const created = defaultRule();
  const normalized = normalizeRule(created);
  assert.deepEqual(normalized, created, 'normalizing a default rule is a no-op');
  assert.equal(created.enabled, true);
  assert.equal(created.action.type, 'mock');
  assert.equal(created.action.status, 200);
});

// ----------------------------------------------------------- normalizeRule

test('normalizeRule fills in a complete rule from nothing', () => {
  const normalized = normalizeRule(undefined);
  assert.match(normalized.id, /^rule_/);
  assert.equal(normalized.label, 'Rule');
  assert.equal(normalized.enabled, true);
  assert.deepEqual(normalized.match, { url: '', method: '' });
  assert.deepEqual(normalized.action, { type: 'mock', status: 200, body: '', headers: {}, delayMs: 0 });
});

test('normalizeRule CLAMPS the mock status into 200..599', () => {
  const cases = [
    [100, 200, '1xx cannot be realized by new Response()'],
    [199, 200],
    [200, 200],
    [201, 201],
    [418, 418],
    [599, 599],
    [600, 599],
    [99999, 599],
    [-1, 200],
    [0, 200],
    [undefined, 200],
    [null, 200],
    ['404', 404, 'numeric strings are coerced'],
    ['not a number', 200],
    [NaN, 200],
    [Infinity, 200, 'non-finite falls back, it does not clamp to the max'],
    [204.7, 205, 'fractional statuses round'],
  ];
  for (const [input, expected, why] of cases) {
    assert.equal(rule({ action: { type: 'mock', status: input, body: '', headers: {}, delayMs: 0 } }).action.status, expected, `${String(input)}${why ? ` — ${why}` : ''}`);
  }
});

test('normalizeRule CLAMPS delayMs into 0..60000', () => {
  const delay = (value) => rule({ action: { type: 'delay', status: 200, body: '', headers: {}, delayMs: value } }).action.delayMs;
  assert.equal(delay(0), 0);
  assert.equal(delay(-1), 0);
  assert.equal(delay(-99999), 0);
  assert.equal(delay(60_000), 60_000);
  assert.equal(delay(60_001), 60_000);
  assert.equal(delay(Number.MAX_SAFE_INTEGER), 60_000);
  assert.equal(delay('bad'), 0);
  assert.equal(delay(undefined), 0);
});

test('normalizeRule CAPS the mock body at 100_000 characters', () => {
  const oversized = 'x'.repeat(250_000);
  const normalized = rule({ action: { type: 'mock', status: 200, body: oversized, headers: {}, delayMs: 0 } });
  assert.equal(normalized.action.body.length, 100_000);
  assert.equal(normalized.action.body, oversized.slice(0, 100_000));

  const exact = 'y'.repeat(100_000);
  assert.equal(rule({ action: { type: 'mock', status: 200, body: exact, headers: {}, delayMs: 0 } }).action.body.length, 100_000);
  assert.equal(rule({ action: { type: 'mock', status: 200, body: { not: 'a string' }, headers: {}, delayMs: 0 } }).action.body, '');
});

test('normalizeRule caps the URL matcher at 2000 chars and the method at 12 uppercase chars', () => {
  const long = '/'.repeat(5000);
  assert.equal(rule({ match: { url: long, method: '' } }).match.url.length, 2000);
  assert.equal(rule({ match: { url: '/api/', method: 'delete' } }).match.method, 'DELETE');
  assert.equal(rule({ match: { url: '/api/', method: 'verylongmethodname' } }).match.method, 'VERYLONGMETH');
  assert.equal(rule({ match: { url: 42, method: 42 } }).match.url, '');
  assert.equal(rule({ match: { url: 42, method: 42 } }).match.method, '');
});

test('normalizeRule restricts the action type to the known four', () => {
  for (const type of ['mock', 'delay', 'fail', 'passthrough']) {
    assert.equal(rule({ action: { type, status: 200, body: '', headers: {}, delayMs: 0 } }).action.type, type);
  }
  for (const bogus of ['redirect', '', null, undefined, 42, 'MOCK']) {
    assert.equal(rule({ action: { type: bogus, status: 200, body: '', headers: {}, delayMs: 0 } }).action.type, 'mock', `type ${String(bogus)}`);
  }
});

test('normalizeRule stringifies header values and drops nameless headers', () => {
  const normalized = rule({
    action: { type: 'mock', status: 200, body: '', delayMs: 0, headers: { 'X-Num': 7, 'X-Null': null, '': 'dropped', 'X-Ok': 'v' } },
  });
  assert.deepEqual(normalized.action.headers, { 'X-Num': '7', 'X-Null': 'null', 'X-Ok': 'v' });
  assert.deepEqual(rule({ action: { type: 'mock', status: 200, body: '', delayMs: 0, headers: 'nope' } }).action.headers, {});
});

test('normalizeRule keeps an empty label but replaces a non-string one', () => {
  assert.equal(rule({ label: '' }).label, '', 'a user clearing the name field must not be fought');
  assert.equal(rule({ label: undefined }).label, 'Rule');
  assert.equal(rule({ label: 42 }).label, 'Rule');
  assert.equal(rule({ label: null }).label, 'Rule');
  assert.equal(rule({ label: 'a'.repeat(500) }).label.length, 120);
});

test('normalizeRule treats enabled as opt-out, not opt-in', () => {
  assert.equal(rule({ enabled: undefined }).enabled, true);
  assert.equal(rule({ enabled: true }).enabled, true);
  assert.equal(rule({ enabled: 0 }).enabled, true, 'only a literal false disables');
  assert.equal(rule({ enabled: 'no' }).enabled, true);
  assert.equal(rule({ enabled: false }).enabled, false);
});

test('normalizeRule preserves a supplied id and mints one otherwise', () => {
  assert.equal(rule({ id: 'kept' }).id, 'kept');
  assert.match(rule({ id: '' }).id, /^rule_/);
  assert.match(rule({ id: 42 }).id, /^rule_/);
});

test('normalizeRule is idempotent', () => {
  const once = normalizeRule({ label: 'x', match: { url: '/a', method: 'post' }, action: { type: 'mock', status: 999, body: 'b', headers: { A: 1 }, delayMs: -3 } });
  assert.deepEqual(normalizeRule(once), once);
});

// ----------------------------------------------------------- normalizeRules

test('normalizeRules caps the set at MAX_TRAFFIC_RULES and rejects non-arrays', () => {
  const many = Array.from({ length: 120 }, (_, i) => ({ label: `r${i}`, match: { url: '/a', method: '' } }));
  assert.equal(normalizeRules(many).length, MAX_TRAFFIC_RULES);
  assert.deepEqual(normalizeRules(many).map((item) => item.label).slice(0, 3), ['r0', 'r1', 'r2'], 'the first N are kept');
  for (const bogus of [null, undefined, {}, 'x', 42]) assert.deepEqual(normalizeRules(bogus), []);
  assert.deepEqual(normalizeRules([]), []);
});

test('PROPERTY: every normalized rule respects every clamp, whatever the input', () => {
  let seed = 31337;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x1_0000_0000;
  };
  const junk = [undefined, null, '', 0, -1, 1e9, NaN, Infinity, 'text', {}, [], true, false];
  const pick = () => junk[Math.floor(rand() * junk.length)];

  for (let i = 0; i < 400; i += 1) {
    const normalized = normalizeRule({
      id: pick(),
      label: pick(),
      enabled: pick(),
      match: { url: rand() < 0.5 ? pick() : '/api/'.repeat(Math.floor(rand() * 900)), method: pick() },
      action: { type: pick(), status: pick(), body: rand() < 0.5 ? pick() : 'b'.repeat(Math.floor(rand() * 200_000)), headers: pick(), delayMs: pick() },
    });
    assert.ok(typeof normalized.id === 'string' && normalized.id, `iteration ${i}: bad id`);
    assert.ok(typeof normalized.label === 'string' && normalized.label.length <= 120, `iteration ${i}: bad label`);
    assert.equal(typeof normalized.enabled, 'boolean');
    assert.ok(['mock', 'delay', 'fail', 'passthrough'].includes(normalized.action.type), `iteration ${i}: type ${normalized.action.type}`);
    assert.ok(normalized.action.status >= 200 && normalized.action.status <= 599, `iteration ${i}: status ${normalized.action.status}`);
    assert.ok(Number.isInteger(normalized.action.status), `iteration ${i}: non-integer status`);
    assert.ok(normalized.action.delayMs >= 0 && normalized.action.delayMs <= 60_000, `iteration ${i}: delay ${normalized.action.delayMs}`);
    assert.ok(normalized.action.body.length <= 100_000, `iteration ${i}: body ${normalized.action.body.length}`);
    assert.ok(normalized.match.url.length <= 2000, `iteration ${i}: url ${normalized.match.url.length}`);
    assert.ok(normalized.match.method.length <= 12, `iteration ${i}: method ${normalized.match.method}`);
    assert.equal(normalized.match.method, normalized.match.method.toUpperCase());
  }
});

// --------------------------------------------- serializeRulesForRuntime

test('serializeRulesForRuntime never ships a disabled rule', () => {
  const enabled = rule({ id: 'on', enabled: true, match: { url: '/api/', method: '' } });
  const disabled = rule({ id: 'off', enabled: false, match: { url: '/api/', method: '' } });
  const shipped = serializeRulesForRuntime([enabled, disabled]);
  assert.deepEqual(shipped.map((item) => item.id), ['on']);
});

test('serializeRulesForRuntime never ships a rule with an empty or whitespace URL matcher', () => {
  const candidates = [
    rule({ id: 'empty', match: { url: '', method: '' } }),
    rule({ id: 'spaces', match: { url: '    ', method: '' } }),
    rule({ id: 'tabs', match: { url: '\t\n ', method: '' } }),
    rule({ id: 'good', match: { url: '  /api/  ', method: '' } }),
  ];
  const shipped = serializeRulesForRuntime(candidates);
  assert.deepEqual(shipped.map((item) => item.id), ['good']);
  assert.equal(shipped[0].match.url, '/api/', 'the URL is trimmed on the way out');
});

test('serializeRulesForRuntime drops the UI-only label and forces enabled: true', () => {
  const shipped = serializeRulesForRuntime([rule({ label: 'secret internal name' })]);
  assert.deepEqual(Object.keys(shipped[0]).sort(), ['action', 'enabled', 'id', 'match']);
  assert.equal(shipped[0].enabled, true);
  assert.deepEqual(Object.keys(shipped[0].match).sort(), ['method', 'url']);
});

test('PROPERTY: serializeRulesForRuntime output is always enabled + non-empty URL + in-range action', () => {
  const inputs = normalizeRules(Array.from({ length: 60 }, (_, i) => ({
    id: `r${i}`,
    enabled: i % 3 !== 0,
    match: { url: i % 4 === 0 ? '   ' : `/api/${i}`, method: i % 2 ? 'get' : '' },
    action: { type: ['mock', 'delay', 'fail', 'passthrough'][i % 4], status: i * 37, body: 'b'.repeat(i * 4000), headers: {}, delayMs: i * 5000 },
  })));
  const shipped = serializeRulesForRuntime(inputs);
  assert.ok(shipped.length > 0 && shipped.length < inputs.length, 'the filter must actually filter');
  for (const item of shipped) {
    assert.equal(item.enabled, true);
    assert.ok(item.match.url.trim().length > 0);
    assert.ok(item.action.status >= 200 && item.action.status <= 599);
    assert.ok(item.action.delayMs >= 0 && item.action.delayMs <= 60_000);
    assert.ok(item.action.body.length <= 100_000);
    assert.equal('label' in item, false);
  }
});

test('serializeRulesForRuntime on an empty set is an empty set', () => {
  assert.deepEqual(serializeRulesForRuntime([]), []);
});

// ---------------------------------------------------------------- rule sets

test('ruleSummary describes each action type', () => {
  assert.equal(ruleSummary(rule({ action: { type: 'mock', status: 404, body: '', headers: {}, delayMs: 0 } })), 'GET → mock 404');
  assert.equal(ruleSummary(rule({ action: { type: 'fail', status: 200, body: '', headers: {}, delayMs: 0 } })), 'GET → network failure');
  assert.equal(ruleSummary(rule({ action: { type: 'delay', status: 200, body: '', headers: {}, delayMs: 1500 } })), 'GET → delay 1500ms');
  assert.equal(ruleSummary(rule({ action: { type: 'passthrough', status: 200, body: '', headers: {}, delayMs: 0 } })), 'GET → passthrough');
  assert.equal(ruleSummary(rule({ match: { url: '/a', method: '' } })), 'ANY → mock 200');
});

test('RULE_PRESETS all normalize into shippable rules', () => {
  assert.ok(RULE_PRESETS.length >= 5);
  for (const preset of RULE_PRESETS) {
    const normalized = normalizeRule(preset.rule);
    assert.equal(normalized.label, preset.label);
    assert.ok(normalized.match.url.trim(), `${preset.label} must have a URL matcher`);
    assert.ok(normalized.action.status >= 200 && normalized.action.status <= 599, `${preset.label} status ${normalized.action.status}`);
    assert.equal(serializeRulesForRuntime([normalized]).length, 1, `${preset.label} must survive serialization`);
  }
  const offline = normalizeRule(RULE_PRESETS.find((preset) => preset.label === 'Offline (fail all)').rule);
  assert.equal(offline.action.status, 200, 'the fail preset declares status 0, which the clamp raises to 200');
});

test('serializeRuleSet / parseRuleSet round-trips a whole set', () => {
  const original = normalizeRules([
    { id: 'a', label: 'One', enabled: true, match: { url: '/one', method: 'GET' }, action: { type: 'mock', status: 201, body: '{"a":1}', headers: { 'X-A': 'b' }, delayMs: 10 } },
    { id: 'b', label: 'Two', enabled: false, match: { url: '/two', method: '' }, action: { type: 'delay', status: 200, body: '', headers: {}, delayMs: 2000 } },
  ]);
  const text = serializeRuleSet(original);
  assert.deepEqual(JSON.parse(text)['xray-rules'], 1, 'the marker travels with the set');

  const parsed = parseRuleSet(text);
  assert.equal(parsed.length, 2);
  for (const [index, item] of parsed.entries()) {
    assert.notEqual(item.id, original[index].id, 'imports get fresh ids so they cannot collide');
    assert.deepEqual({ ...item, id: null }, { ...original[index], id: null });
  }
  assert.equal(parsed[1].enabled, false, 'a disabled rule stays disabled through the round-trip');
});

test('parseRuleSet accepts a bare array and a session-shaped object', () => {
  const bare = parseRuleSet(JSON.stringify([{ label: 'X', match: { url: '/a', method: '' } }]));
  assert.equal(bare.length, 1);
  assert.equal(bare[0].label, 'X');

  const wrapped = parseRuleSet(JSON.stringify({ rules: [{ label: 'Y', match: { url: '/b', method: '' } }], other: 1 }));
  assert.equal(wrapped.length, 1);
  assert.equal(wrapped[0].label, 'Y');
});

test('parseRuleSet returns null for anything unparseable or empty', () => {
  for (const input of ['', '   ', 'not json', '{}', '[]', '{"rules":[]}', 'null', '"a string"', '42']) {
    assert.equal(parseRuleSet(input), null, `input ${JSON.stringify(input)}`);
  }
  assert.equal(parseRuleSet(null), null);
  assert.equal(parseRuleSet(undefined), null);
});

test('parseRuleSet applies every clamp to imported rules', () => {
  const hostile = JSON.stringify([{
    id: 'attacker-chosen',
    label: 'x'.repeat(400),
    enabled: true,
    match: { url: '/api/'.repeat(1000), method: 'supercalifragilistic' },
    action: { type: 'exfiltrate', status: 999, body: 'z'.repeat(400_000), headers: { A: 1 }, delayMs: 999_999 },
  }]);
  const [imported] = parseRuleSet(hostile);
  assert.notEqual(imported.id, 'attacker-chosen');
  assert.equal(imported.label.length, 120);
  assert.equal(imported.action.type, 'mock');
  assert.equal(imported.action.status, 599);
  assert.equal(imported.action.body.length, 100_000);
  assert.equal(imported.action.delayMs, 60_000);
  assert.equal(imported.match.url.length, 2000);
  assert.equal(imported.match.method, 'SUPERCALIFRA');
});

test('parseRuleSet caps an oversized import at MAX_TRAFFIC_RULES', () => {
  const many = JSON.stringify(Array.from({ length: 500 }, () => ({ match: { url: '/a', method: '' } })));
  assert.equal(parseRuleSet(many).length, MAX_TRAFFIC_RULES);
});
