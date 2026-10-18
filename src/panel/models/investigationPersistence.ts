import type { AssertionResult, AssertionSpec, EntryRef, InvestigationStore, RunSummary, SavedInvestigation, ScenarioSpec, ScenarioStep } from './investigations';
import { boundedItems, cleanText, dataRecord, MAX_ASSERTIONS, MAX_INVESTIGATIONS, MAX_INVESTIGATION_NOTES, MAX_INVESTIGATION_REFS, MAX_INVESTIGATION_TITLE, MAX_SCENARIOS, MAX_SCENARIO_RUNS, MAX_SCENARIO_STEPS, normalizeCheck, normalizeFilters, normalizeScenarioPlan, ownValue, safeId, stringIds } from './investigations';

export const SAVED_INVESTIGATIONS_KEY = 'saved_investigations';
export const INVESTIGATION_SCHEMA_VERSION = 1;
export const MAX_INVESTIGATION_STORE_BYTES = 1_000_000;

function timestamp(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback;
}

function normalizeRef(value: unknown): EntryRef | null {
  if (!dataRecord(value)) return null;
  const entryId = safeId(ownValue(value, 'entryId'));
  const sessionId = safeId(ownValue(value, 'sessionId'));
  if (!entryId || !sessionId) return null;
  const originValue = ownValue(value, 'origin');
  let origin = '';
  if (typeof originValue === 'string') {
    try { const url = new URL(originValue); if (['http:', 'https:'].includes(url.protocol)) origin = url.origin; } catch { /* metadata remains unavailable */ }
  }
  const status = ownValue(value, 'status');
  return { entryId, sessionId, method: cleanText(ownValue(value, 'method'), 12, 'GET').toUpperCase(), path: cleanText(ownValue(value, 'path'), 2_048).split(/[?#]/)[0], origin, status: typeof status === 'number' && Number.isInteger(status) && status >= 0 && status <= 599 ? status : 0 };
}

function unique<T>(value: unknown, limit: number, project: (item: unknown) => T | null, key: (item: T) => string): T[] {
  const seen = new Set<string>();
  const output: T[] = [];
  for (const item of boundedItems(value, limit)) {
    const result = project(item);
    if (!result || seen.has(key(result))) continue;
    seen.add(key(result)); output.push(result);
  }
  return output;
}

function normalizeAssertion(value: unknown): AssertionSpec | null {
  if (!dataRecord(value)) return null;
  const id = safeId(ownValue(value, 'id'));
  const entryRef = normalizeRef(ownValue(value, 'entryRef'));
  const check = normalizeCheck(ownValue(value, 'check'));
  if (!id || !entryRef || !check) return null;
  // Authored assertions never rebind a missing structural expectation on reload.
  if (check.type === 'structural' && check.expected === undefined) check.expected = '[UNAVAILABLE]';
  return { id, label: cleanText(ownValue(value, 'label'), MAX_INVESTIGATION_TITLE, `${check.type} check`), entryRef, check };
}

function normalizeStep(value: unknown): ScenarioStep | null {
  if (!dataRecord(value)) return null;
  const id = safeId(ownValue(value, 'id'));
  const source = normalizeRef(ownValue(value, 'source'));
  if (!id || !source || !source.origin) return null;
  const input = ownValue(value, 'plan');
  if (!dataRecord(input) || typeof ownValue(input, 'url') !== 'string') return null;
  try {
    const target = new URL(ownValue(input, 'url') as string);
    // Keep the exact-target intent recorded at authoring, independently of query
    // redaction. Retargeted endpoints cannot ask the executor for a captured URL.
    const queryIsSanitized = Array.from(target.searchParams.values()).every(item => item === '[REDACTED]');
    const preserve = ownValue(input, 'preserveCapturedUrl') === true && target.origin === source.origin && target.pathname === source.path && !target.username && !target.password && !target.hash && queryIsSanitized;
    const plan = normalizeScenarioPlan(input, `${source.origin}${source.path || '/'}`, preserve);
    const checks = boundedItems(ownValue(value, 'checks'), 10).flatMap(item => {
      const check = normalizeCheck(item);
      if (!check) return [];
      if (check.type === 'structural' && check.expected === undefined) check.expected = '[UNAVAILABLE]';
      return [check];
    });
    return { id, label: cleanText(ownValue(value, 'label'), MAX_INVESTIGATION_TITLE, 'Step'), source, plan, checks };
  } catch { return null; }
}

function normalizeScenario(value: unknown): ScenarioSpec | null {
  if (!dataRecord(value)) return null;
  const id = safeId(ownValue(value, 'id'));
  if (!id) return null;
  const steps = unique(ownValue(value, 'steps'), MAX_SCENARIO_STEPS, normalizeStep, step => step.id);
  return { id, title: cleanText(ownValue(value, 'title'), MAX_INVESTIGATION_TITLE, 'Scenario'), steps };
}

function normalizeResult(value: unknown): AssertionResult | null {
  if (!dataRecord(value)) return null;
  const id = safeId(ownValue(value, 'id'));
  const type = ownValue(value, 'type');
  const outcome = ownValue(value, 'outcome');
  if (!id || (type !== 'status' && type !== 'response' && type !== 'structural')) return null;
  const expected = ownValue(value, 'expected');
  const actual = ownValue(value, 'actual');
  const expectedValid = type === 'status' ? typeof expected === 'number' && Number.isInteger(expected) && expected >= 100 && expected <= 599 : type === 'response' ? typeof expected === 'boolean' : expected === 'equal' || expected === 'contains' || expected === 'schema';
  const actualValid = type === 'status' ? typeof actual === 'number' && Number.isInteger(actual) && actual >= 100 && actual <= 599 : type === 'response' ? typeof actual === 'boolean' : actual === 'match' || actual === 'different';
  const valid = expectedValid && actualValid && (outcome === 'passed' || outcome === 'failed');
  const reason = cleanText(ownValue(value, 'reason'), 500);
  return { id, type, outcome: valid ? outcome : 'unavailable', expected: expectedValid ? expected as AssertionResult['expected'] : 'unavailable', actual: actualValid ? actual as AssertionResult['actual'] : 'unavailable', ...(!valid ? { reason: reason || 'Saved assertion result unavailable.' } : reason ? { reason } : {}) };
}

function normalizeRun(value: unknown, restoring: boolean): RunSummary | null {
  if (!dataRecord(value)) return null;
  const id = safeId(ownValue(value, 'id'));
  const scenarioId = safeId(ownValue(value, 'scenarioId'));
  const stepId = safeId(ownValue(value, 'stepId'));
  const experimentId = safeId(ownValue(value, 'experimentId'));
  const status = ownValue(value, 'status');
  if (!id || !scenarioId || !stepId || !experimentId || !['running', 'passed', 'failed', 'unavailable', 'cancelled', 'interrupted'].some(item => item === status)) return null;
  const interrupted = restoring && status === 'running';
  const reason = cleanText(ownValue(value, 'reason'), 500);
  const finishedAt = ownValue(value, 'finishedAt');
  const observedEntryId = safeId(ownValue(value, 'observedEntryId'));
  return { id, scenarioId, stepId, experimentId, status: interrupted ? 'interrupted' : status as RunSummary['status'], startedAt: timestamp(ownValue(value, 'startedAt')), ...(typeof finishedAt === 'number' && Number.isFinite(finishedAt) && finishedAt >= 0 ? { finishedAt } : {}), ...(observedEntryId ? { observedEntryId } : {}), results: unique(ownValue(value, 'results'), MAX_ASSERTIONS, normalizeResult, item => item.id), ...(interrupted ? { reason: 'Previous run was interrupted. It was not restarted.' } : reason ? { reason } : {}) };
}

function normalizeInvestigation(value: unknown, restoring: boolean): SavedInvestigation | null {
  if (!dataRecord(value)) return null;
  const id = safeId(ownValue(value, 'id'));
  const sourceSessionId = safeId(ownValue(value, 'sourceSessionId'));
  if (!id || !sourceSessionId) return null;
  const scenarios = unique(ownValue(value, 'scenarios'), MAX_SCENARIOS, normalizeScenario, item => item.id);
  const scenarioIds = new Set(scenarios.map(item => item.id));
  const runInput = boundedItems(ownValue(value, 'runs'), MAX_SCENARIOS * MAX_SCENARIO_RUNS * 2, true);
  const runs = unique(runInput, MAX_SCENARIOS * MAX_SCENARIO_RUNS * 2, item => normalizeRun(item, restoring), item => item.id).filter(item => scenarioIds.has(item.scenarioId));
  const counts = new Map<string, number>();
  // Receipts are ordered oldest-to-newest. Bound each scenario independently.
  const retainedRuns = runs.reverse().filter(item => {
    const count = counts.get(item.scenarioId) || 0;
    counts.set(item.scenarioId, count + 1);
    return count < MAX_SCENARIO_RUNS;
  }).reverse();
  const createdAt = timestamp(ownValue(value, 'createdAt'));
  return { id, title: cleanText(ownValue(value, 'title'), MAX_INVESTIGATION_TITLE, 'Investigation'), notes: cleanText(ownValue(value, 'notes'), MAX_INVESTIGATION_NOTES), sourceSessionId, createdAt, updatedAt: timestamp(ownValue(value, 'updatedAt'), createdAt), entryRefs: unique(ownValue(value, 'entryRefs'), MAX_INVESTIGATION_REFS, normalizeRef, item => `${item.sessionId}:${item.entryId}`), selectedEntryId: safeId(ownValue(value, 'selectedEntryId')) || null, pinnedEntryIds: stringIds(ownValue(value, 'pinnedEntryIds'), MAX_INVESTIGATION_REFS), compareLeftId: safeId(ownValue(value, 'compareLeftId')) || null, compareRightId: safeId(ownValue(value, 'compareRightId')) || null, filters: normalizeFilters(ownValue(value, 'filters')), findingIds: stringIds(ownValue(value, 'findingIds'), 100), assertions: unique(ownValue(value, 'assertions'), MAX_ASSERTIONS, normalizeAssertion, item => item.id), scenarios, runs: retainedRuns };
}

function byteLength(store: InvestigationStore): number {
  return new TextEncoder().encode(JSON.stringify(store)).byteLength;
}

function projectStore(input: unknown, restoring: boolean): InvestigationStore {
  const store: InvestigationStore = { schemaVersion: 1, investigations: [] };
  if (!dataRecord(input) || ownValue(input, 'schemaVersion') !== INVESTIGATION_SCHEMA_VERSION) return store;
  const seen = new Set<string>();
  for (const value of boundedItems(ownValue(input, 'investigations'), MAX_INVESTIGATIONS)) {
    const id = safeId(ownValue(value, 'id'));
    if (!id || seen.has(id)) continue;
    const investigation = normalizeInvestigation(value, restoring);
    if (!investigation) continue;
    seen.add(id);
    store.investigations.push(investigation);
    if (byteLength(store) <= MAX_INVESTIGATION_STORE_BYTES) continue;
    // Preserve a first investigation's compact context, dropping complete late
    // scenarios/assertions rather than partial expected-value prefixes.
    if (store.investigations.length === 1) {
      while (byteLength(store) > MAX_INVESTIGATION_STORE_BYTES && investigation.scenarios.length) {
        const removed = investigation.scenarios.pop();
        investigation.runs = investigation.runs.filter(run => run.scenarioId !== removed?.id);
      }
      while (byteLength(store) > MAX_INVESTIGATION_STORE_BYTES && investigation.assertions.length) investigation.assertions.pop();
      if (byteLength(store) > MAX_INVESTIGATION_STORE_BYTES) store.investigations.pop();
    } else store.investigations.pop();
    break;
  }
  return store;
}

/** Call only after the caller's future-version guard; unknown versions are inert. */
export function normalizeInvestigationStore(input: unknown): InvestigationStore {
  return projectStore(input, true);
}

/** Storage projection does not interrupt a currently-running in-memory receipt. */
export function serializeInvestigationStore(state: unknown): InvestigationStore {
  return projectStore(state, false);
}
