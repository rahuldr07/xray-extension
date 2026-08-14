// Traffic-rule model, runtime serialization bounds, presets, and long-running resource limits.

const assert = require('node:assert/strict');
const test = require('node:test');

const { read } = require('./helpers/source');

test('rules model bounds runtime payloads and only ships enabled matchers', () => {
  const rules = read('src/panel/models/rules.ts');
  assert.match(rules, /export function normalizeRule/);
  assert.match(rules, /export function serializeRulesForRuntime/);
  // only enabled rules with a non-empty URL matcher reach the interceptor
  assert.match(rules, /rule\.enabled && rule\.match\.url\.trim\(\)/);
  // status is clamped to the same range the runtime accepts — _sanitizeRule
  // rewrites anything below 200, so the UI must not pretend 1xx is allowed
  assert.match(rules, /clampNumber\(action\.status, 200, 200, 599\)/);
  assert.match(read('content/interceptor.js'), /Math\.min\(599, Math\.max\(200, Number\(action\.status\) \|\| 200\)\)/);
  assert.match(read('src/panel/components/rules/Rules.tsx'), /type="number" min=\{200\} max=\{599\}/);
  // an empty label survives normalization, so the name field can be cleared and
  // retyped (only a non-string falls back to 'Rule')
  assert.match(rules, /label: typeof base\.label === 'string' \? base\.label\.slice\(0, 120\) : 'Rule'/);
  // rule bodies are length-bounded
  assert.match(rules, /slice\(0, 100_000\)/);
  const interceptor = read('content/interceptor.js');
  assert.match(interceptor, /const MAX_RULES = 50/);
  assert.match(interceptor, /_config\.rules = config\.rules\.slice\(0, MAX_RULES\)\.map\(_sanitizeRule\)\.filter\(Boolean\)/);
});

test('long-running surfaces stay bounded: session size, rule writes, HUD subscribers', () => {
  const sessionStore = read('src/panel/models/sessionStore.ts');
  const store = read('src/panel/store.ts');
  const hudMain = read('src/panel/hud-main.tsx');
  const paneDivider = read('src/panel/components/common/PaneDivider.tsx');
  const consoleWorkspace = read('src/panel/components/console/ConsoleWorkspace.tsx');

  // every heavy field is trimmed, not just responseRaw — a decrypted-body
  // session used to serialize past the chrome.storage quota and fail silently
  for (const field of ['responseRaw', 'responseDecrypted', 'requestBody', 'logData']) {
    assert.match(sessionStore, new RegExp(`copy\\.${field} = trimValue\\(entry\\.${field}\\)`));
  }
  assert.match(sessionStore, /entry\.args\.slice\(0, MAX_PERSISTED_ARGS\)\.map\(trimValue\)/);
  assert.match(sessionStore, /const text = JSON\.stringify\(value\);/);

  // typing in a rule field coalesces the storage write and the page republish
  assert.match(store, /function persistRulesDebounced/);
  assert.match(store, /persistRulesDebounced\(rules\);/);
  assert.match(store, /if \(_rulesPersistTimer\) \{ clearTimeout\(_rulesPersistTimer\); _rulesPersistTimer = null; \}/);

  // the HUD remounts on every toggle: the previous theme subscriber is dropped
  // first, and mirroring is coalesced to one style read per frame
  assert.match(hudMain, /unsubscribeHostTheme\?\.\(\);/);
  assert.match(hudMain, /unsubscribeHostTheme = usePanelStore\.subscribe\(schedule\);/);

  // the divider applies the newest pointer position, not the frame's first one
  assert.match(paneDivider, /state\.latest = event\.clientX;\s*\n\s*if \(raf\.current\) return;/);
  assert.match(paneDivider, /onLiveChange\(clamp\(current\.width \+ \(current\.latest - current\.startX\)\)\)/);

  // a plain payload shaped { name, message, stack } keeps its JSON tree
  assert.match(consoleWorkspace, /const looksLikeStack = \(stack: string\): boolean =>/);
  assert.match(consoleWorkspace, /'name' in record &&\s*\n\s*looksLikeStack\(record\.stack\)/);
});

test('rules have a starter preset library and portable export/import', () => {
  const rules = read('src/panel/models/rules.ts');
  const rulesUi = read('src/panel/components/rules/Rules.tsx');
  // preset library + round-trippable rule-set serialization
  assert.match(rules, /export const RULE_PRESETS/);
  assert.match(rules, /export function serializeRuleSet/);
  assert.match(rules, /export function parseRuleSet/);
  // imported rules get fresh ids so they never collide with existing ones
  assert.match(rules, /id: createRuleId\(\)/);
  // the Rules page wires presets + export (copy) + import (paste) in
  assert.match(rulesUi, /RULE_PRESETS\.map/);
  assert.match(rulesUi, /serializeRuleSet\(rules\)/);
  assert.match(rulesUi, /parseRuleSet\(importText\)/);
  assert.match(rulesUi, /setRules\(\[\.\.\.rules, \.\.\.parsed\]\)/);
});
