import type { TrafficRule } from '../types';
import { clampNumber } from '../utils';

export const TRAFFIC_RULES_KEY = 'traffic_rules';
export const MAX_TRAFFIC_RULES = 50;

export function createRuleId(): string {
  return 'rule_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

export function defaultRule(): TrafficRule {
  return {
    id: createRuleId(),
    label: 'New rule',
    enabled: true,
    match: { url: '', method: '' },
    action: { type: 'mock', status: 200, body: '{\n  "mocked": true\n}', headers: {}, delayMs: 0 },
  };
}

export function normalizeRule(input: Partial<TrafficRule> | undefined): TrafficRule {
  const base = input || {};
  const match = base.match || { url: '', method: '' };
  const action = base.action || { type: 'mock', status: 200, body: '', headers: {}, delayMs: 0 };
  const type = ['mock', 'delay', 'fail', 'passthrough'].includes(action.type as string) ? action.type as TrafficRule['action']['type'] : 'mock';
  const headers: Record<string, string> = {};
  if (action.headers && typeof action.headers === 'object') {
    Object.entries(action.headers).forEach(([key, value]) => {
      if (typeof key === 'string' && key) headers[key] = String(value);
    });
  }
  return {
    id: typeof base.id === 'string' && base.id ? base.id : createRuleId(),
    label: typeof base.label === 'string' && base.label ? base.label.slice(0, 120) : 'Rule',
    enabled: base.enabled !== false,
    match: {
      url: typeof match.url === 'string' ? match.url.slice(0, 2000) : '',
      method: typeof match.method === 'string' ? match.method.toUpperCase().slice(0, 12) : '',
    },
    action: {
      type,
      status: clampNumber(action.status, 200, 100, 599),
      body: typeof action.body === 'string' ? action.body.slice(0, 100_000) : '',
      headers,
      delayMs: clampNumber(action.delayMs, 0, 0, 60_000),
    },
  };
}

export function normalizeRules(input: unknown): TrafficRule[] {
  if (!Array.isArray(input)) return [];
  return input.slice(0, MAX_TRAFFIC_RULES).map((rule) => normalizeRule(rule as Partial<TrafficRule>));
}

// The compact shape sent to the MAIN-world interceptor. Only enabled rules with
// a URL matcher are shipped; the label is UI-only.
export function serializeRulesForRuntime(rules: TrafficRule[]): Array<Pick<TrafficRule, 'id' | 'enabled' | 'match' | 'action'>> {
  return rules
    .filter((rule) => rule.enabled && rule.match.url.trim())
    .map((rule) => ({
      id: rule.id,
      enabled: true,
      match: { url: rule.match.url.trim(), method: rule.match.method },
      action: rule.action,
    }));
}

export function ruleSummary(rule: TrafficRule): string {
  const method = rule.match.method || 'ANY';
  if (rule.action.type === 'mock') return `${method} → mock ${rule.action.status}`;
  if (rule.action.type === 'fail') return `${method} → network failure`;
  if (rule.action.type === 'delay') return `${method} → delay ${rule.action.delayMs}ms`;
  return `${method} → passthrough`;
}

// Ready-to-use starter rules. Each seeds a common testing scenario; the user tunes
// the URL matcher after adding. `re:.*` matches every request.
export const RULE_PRESETS: Array<{ label: string; rule: Partial<TrafficRule> }> = [
  { label: 'Throttle all (+2s)', rule: { label: 'Throttle all (+2s)', match: { url: 're:.*', method: '' }, action: { type: 'delay', status: 200, body: '', headers: {}, delayMs: 2000 } } },
  { label: 'Offline (fail all)', rule: { label: 'Offline (fail all)', match: { url: 're:.*', method: '' }, action: { type: 'fail', status: 0, body: '', headers: {}, delayMs: 0 } } },
  { label: 'Force 500 on /api', rule: { label: 'Force 500 on /api', match: { url: '/api/', method: '' }, action: { type: 'mock', status: 500, body: '{\n  "error": "Injected server error"\n}', headers: {}, delayMs: 0 } } },
  { label: 'Empty list on /api', rule: { label: 'Empty list on /api', match: { url: '/api/', method: 'GET' }, action: { type: 'mock', status: 200, body: '[]', headers: {}, delayMs: 0 } } },
  { label: 'Rate limit (429)', rule: { label: 'Rate limit (429)', match: { url: '/api/', method: '' }, action: { type: 'mock', status: 429, body: '{\n  "error": "Too many requests"\n}', headers: {}, delayMs: 0 } } },
];

const RULE_SET_MARKER = 'xray-rules';

// Portable JSON for a whole rule set, so a set can be copied and shared like a
// theme. Labels are preserved; the format round-trips through parseRuleSet.
export function serializeRuleSet(rules: TrafficRule[]): string {
  return JSON.stringify({ [RULE_SET_MARKER]: 1, rules }, null, 2);
}

// Accepts serializeRuleSet output, a bare array of rules, or a raw session-style
// object with a `rules` array. Returns normalized rules with fresh ids so an
// import never collides with existing rule ids. Null if nothing parseable.
export function parseRuleSet(text: string): TrafficRule[] | null {
  const input = String(text || '').trim();
  if (!input) return null;
  let raw: unknown;
  try {
    raw = JSON.parse(input);
  } catch {
    return null;
  }
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object' && Array.isArray((raw as { rules?: unknown }).rules)
      ? (raw as { rules: unknown[] }).rules
      : null;
  if (!list || !list.length) return null;
  const normalized = normalizeRules(list).map((rule) => ({ ...rule, id: createRuleId() }));
  return normalized.length ? normalized : null;
}
