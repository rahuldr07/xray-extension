import { create } from 'zustand';
import { evictEntries, pinnedAndSelected } from './models/entries';
import { isCommandItem } from './models/logLevels';
import { clearConsoleVariables, executeConsoleCommand, setConsoleContext, syncConsolePins, type ConsoleExecutionResult } from './runtime/consoleBridge';
import { getStoredValue, setStoredValue } from './runtime/storageBridge';
import {
  REACT_PANEL_PREFERENCES_KEY,
  applyPanelPreferences,
  serializePanelPreferences,
  type SerializedPanelPreferences,
} from './models/panelPersistence';
import { DEFAULT_PANEL_SETTINGS, normalizePanelSettings, THEME_DEFAULT_ACCENT, themeDefaultAccent } from './models/panelSettings';
import { hasPageBridgeRoute, postToPageBridge, publishCaptureSettings, publishTrafficRules } from './runtime/captureConfig';
import { MAX_EXPERIMENTS, armExperiment, cancelExperiment, createExperiment, evaluateExperiment, failExperiment, observeExperiment, startExperiment } from './models/experiments';
import { buildDriftIndex, detectDrift, noteDriftEntry } from './models/drift';
import { MAX_TRAFFIC_RULES, TRAFFIC_RULES_KEY, createRuleId, defaultRule, normalizeRule, normalizeRules, ruleMatcherError } from './models/rules';
import { AI_SETTINGS_KEY, SESSION_ENTRIES_KEY, SESSION_ENVELOPE_KEY } from './models/sessionStore';
import { clearSessionEnvelope, createSessionEnvelope, migrateSessionEnvelope, summarizeSessionEntries, updateRuntimeHealth, type RuntimeHealthUpdate } from './models/sessionEnvelope';
import type { RuntimeHealth, SessionEnvelope, XrayAppMode } from './types';
import type { ActiveTab, AiSettings, ApiDrawerPlacement, ApiGroupingMode, ApiQuickFilter, ConfirmationRequest, ConsoleClearScope, ConsoleEvent, ConsoleMiniTab, ConsolePin, ConsoleRun, DetailTab, DetailView, NetworkFilter, PanelSettings, RulesSubTab, Snippet, SortField, SortOrder, TrafficRule, XrayEntry } from './types';
import type { ExperimentCheck, ExperimentPlan, ExperimentRecord } from './types';
import { FINDING_STATE_KEY, createFindingState, deriveFindings, dismissFinding, restoreFinding, reconcileFindingState, normalizeFindingState, isUnsupportedFindingState, type FindingsState } from './models/findings';
import { createInvestigation, createAssertion, createScenario, evaluateAssertions, ownValue, resolveEntryRef, MAX_INVESTIGATIONS, MAX_ASSERTIONS, MAX_SCENARIO_STEPS, MAX_SCENARIO_RUNS, type InvestigationStore, type SavedInvestigation, type AssertionResult, type RunSummary } from './models/investigations';
import { SAVED_INVESTIGATIONS_KEY, normalizeInvestigationStore, serializeInvestigationStore } from './models/investigationPersistence';
import { isReplayableEntry, replayabilityReason } from './models/replayability';

const MAX_ENTRIES = 1000;

const MAX_CONSOLE_EVENTS = 2000;

// restorePreferences spreads these under whatever was persisted, so settings saved
// before the custom provider existed pick up the new fields rather than being undefined.
const DEFAULT_AI_SETTINGS: AiSettings = {
  provider: 'anthropic',
  model: 'claude-fable-5',
  apiKey: '',
  baseUrl: '',
  authHeader: 'authorization',
  authPrefix: 'Bearer ',
};

let _sessionPersistTimer: ReturnType<typeof setTimeout> | null = null;
let _sessionWriteActive = false;
type SessionWriteRequest = { session: SessionEnvelope; clearLegacy: boolean; generation: number; resolve: () => void };
let _sessionWritePending: SessionWriteRequest | null = null;
let _sessionWriteAfterBarrier: SessionWriteRequest | null = null;
let _sessionRestoreGeneration = 0;
let _storageIssue: string | null = null;
let _unsubscribeWorkerHealth: (() => void) | undefined;
let _unsubscribeCaptureReceipt: (() => void) | undefined;
let _captureDropped = 0;
let _captureDeliverySeen = { delivered: 0, noConsumer: 0, relayFailed: 0 };
let _runtimeRestartRequested = false;

// These are private isolated-world APIs, never page-posted payloads.
interface WorkerHealthReceipt {
  state?: unknown;
  lastEventAt?: unknown;
  lastErrorCode?: unknown;
  cache?: { state?: unknown; lastEventAt?: unknown; lastErrorCode?: unknown };
}
interface RuntimeWorker {
  isReady?(): boolean;
  getHealth?(): WorkerHealthReceipt;
  onHealth?(listener: (receipt: WorkerHealthReceipt) => void): () => void;
  restart?(): Promise<unknown>;
}
interface CaptureReceipt {
  accepted?: unknown;
  dropped?: unknown;
  validated?: unknown;
  delivered?: unknown;
  noConsumer?: unknown;
  relayFailed?: unknown;
  deliveryReasons?: unknown;
  lastEventAt?: unknown;
}
interface CaptureReceipts {
  get?(): CaptureReceipt;
  subscribe?(listener: (receipt: CaptureReceipt) => void): () => void;
}
function runtimeWorker(): RuntimeWorker | undefined {
  return window.XRAY_Worker as RuntimeWorker | undefined;
}
function captureReceipts(): CaptureReceipts | undefined {
  return (window as unknown as { XRAY_CaptureReceipt?: CaptureReceipts }).XRAY_CaptureReceipt;
}
function hasSessionStorage(): boolean {
  return typeof window.XRAY_Store?.get === 'function' && typeof window.XRAY_Store?.set === 'function';
}
const RUNTIME_ERROR_CODES = new Set([
  'bridge-token', 'invalid-update', 'batch-limit', 'invalid-entry', 'duplicate-entry', 'capture-drop',
  'worker-error', 'worker-message-error', 'worker-create-failed', 'worker-restart-failed', 'worker-init-failed',
  'worker-origin-unavailable', 'worker-policy-blocked', 'worker-startup-timeout',
  'worker-missing', 'worker-terminated', 'worker-restart-unavailable', 'storage-unavailable', 'storage-read-failed', 'storage-write-failed',
  'cache-open-failed', 'cache-write-failed', 'cache-prune-failed', 'cache-clear-failed', 'no-consumer', 'relay-failed',
]);
function safeRuntimeCode(value: unknown): string | null {
  return typeof value === 'string' && RUNTIME_ERROR_CODES.has(value) ? value : null;
}
function runtimeHealth(current: RuntimeHealth, update: RuntimeHealthUpdate): RuntimeHealth {
  const next = updateRuntimeHealth(current, {
    ...update, lastEventAt: update.lastEventAt ?? Date.now(),
    ...(update.lastErrorCode !== undefined ? { lastErrorCode: safeRuntimeCode(update.lastErrorCode) } : {}),
  });
  if (!hasSessionStorage()) _storageIssue = 'storage-unavailable';
  next.health = next.captureRouteState === 'unavailable' ? 'unavailable'
    : _storageIssue || next.workerState === 'degraded' || next.workerState === 'unavailable' || next.captureRouteState === 'degraded' ? 'degraded'
      : next.captureRouteState === 'healthy' && next.workerState === 'healthy' ? 'healthy' : 'unknown';
  if (_storageIssue) next.lastErrorCode = _storageIssue;
  return next;
}
function sessionSnapshot(state: Pick<PanelState, 'session' | 'entries' | 'runtimeHealth'>): SessionEnvelope {
  const entries = state.entries.slice(-500);
  let source = state.session.source;
  for (let i = entries.length - 1; i >= 0; i -= 1) {
    try {
      const url = new URL(String(entries[i].url || ''));
      if (url.protocol !== 'http:' && url.protocol !== 'https:') continue;
      source = { origin: url.origin };
      break;
    } catch { /* logs and malformed URLs have no origin metadata */ }
  }
  return { ...state.session, source, updatedAt: Date.now(), ...summarizeSessionEntries(entries), entries, runtime: state.runtimeHealth };
}
const CONSOLE_PIN_NAMES = ['a', 'b', 'c', 'd', 'e', 'f'];

/**
 * Console pins left after an eviction, or null when none was dropped. A pin is never
 * re-pointed at another request: its entry is gone, so the pin goes, with a notice.
 */
function survivingConsolePins(state: Pick<PanelState, 'consolePins' | 'showToast'>, entries: readonly XrayEntry[]): ConsolePin[] | null {
  if (!state.consolePins.length) return null;
  const ids = new Set(entries.map((entry) => entry.id));
  const kept = state.consolePins.filter((pin) => ids.has(pin.entryId));
  if (kept.length === state.consolePins.length) return null;
  const removed = state.consolePins.filter((pin) => !ids.has(pin.entryId)).map((pin) => pin.name);
  state.showToast(removed.length === 1
    ? `Pin ${removed[0]} removed: request no longer captured`
    : `Pins ${removed.join(', ')} removed: requests no longer captured`);
  return kept;
}

/** Store the pins; the subscription below hands them to the engine. */
function commitConsolePins(pins: ConsolePin[]): void {
  usePanelStore.setState({ consolePins: pins });
}

// The page element that held focus when the injected side panel opened, so we can
// hand focus back to the page when it closes (Escape / close button).
let _lastPageFocus: HTMLElement | null = null;

interface PanelState {
  initialized: boolean;
  open: boolean;
  devtoolsMode: boolean;
  activeTab: ActiveTab;
  detailView: DetailView;
  detailTab: DetailTab;
  consoleMiniTab: ConsoleMiniTab;
  rulesSubTab: RulesSubTab;
  networkFilter: NetworkFilter;
  searchQuery: string;
  apiSearchQuery: string;
  apiQuickFilter: ApiQuickFilter;
  apiGroupingMode: ApiGroupingMode;
  apiDetailOpen: boolean;
  // Logs tab detail; session-local, deliberately not part of persisted preferences.
  logDetailOpen: boolean;
  apiDrawerPlacement: ApiDrawerPlacement;
  methodFilters: Set<string>;
  statusFilters: Set<string>;
  typeFilters: Set<string>;
  expandedGroups: Set<string>;
  // Ids of collapsible sections the user has collapsed (default = expanded).
  collapsedSections: Set<string>;
  sortField: SortField;
  sortOrder: SortOrder;
  recording: boolean;
  pausedCount: number;
  entries: XrayEntry[];
  session: SessionEnvelope;
  runtimeHealth: RuntimeHealth;
  consoleEvents: ConsoleEvent[];
  consoleDraft: string;
  // Transient signal for the editor to focus each explicitly prepared draft.
  consolePreparationId: number;
  snippets: Snippet[];
  rules: TrafficRule[];
  experiments: ExperimentRecord[];
  findings: FindingsState;
  findingSynthesisIds: string[] | null;
  dismissFinding(id: string): void;
  restoreFinding(id: string): void;
  openFindingEvidence(findingId: string, entryId?: string): void;
  openFindingSynthesis(ids: string[]): void;
  closeFindingSynthesis(): void;
  investigationStore: InvestigationStore;
  investigationStorageState: 'ready' | 'unavailable' | 'unsupported' | 'failed';
  saveInvestigation(title?: string, notes?: string): string | null;
  updateInvestigation(id: string, patch: { title?: string; notes?: string }): void;
  deleteInvestigation(id: string): void;
  openInvestigation(id: string): void;
  addInvestigationAssertion(id: string, entryId: string, check: ExperimentCheck): void;
  evaluateInvestigationAssertions(id: string): AssertionResult[];
  removeInvestigationAssertion(id: string, assertionId: string): void;
  addInvestigationScenario(id: string, entryId: string, plan?: Partial<ExperimentPlan>, checks?: ExperimentCheck[]): void;
  addScenarioStep(id: string, scenarioId: string, entryId: string, plan?: Partial<ExperimentPlan>, checks?: ExperimentCheck[]): void;
  removeInvestigationScenario(id: string, scenarioId: string): void;
  rebindScenarioStep(id: string, scenarioId: string, stepId: string, entryId: string): void;
  runScenarioStep(id: string, scenarioId: string, stepId: string): void;
  cancelScenarioStep(id: string, runId: string): void;
  draftExperiment(entry: XrayEntry, plan?: Partial<ExperimentPlan>, checks?: ExperimentCheck[]): string | null;
  updateExperiment(id: string, plan: Partial<ExperimentPlan>, checks: ExperimentCheck[]): boolean;
  armExperiment(id: string): void;
  runExperiment(id: string): void;
  cancelExperiment(id: string): void;
  deleteExperiment(id: string): void;
  aiSettings: AiSettings;
  selectedId: string | null;
  expandedId: string | null;
  /** The command currently being evaluated (UI state, never persisted). Lives here so
   * leaving and re-entering the Console tab keeps Running…/Cancel and the run guard. */
  consoleRun: ConsoleRun | null;
  /** Requests pinned as Console variables `a`…`f` (spec P2). Panel-session only:
   * never in persisted preferences or the session envelope. */
  consolePins: ConsolePin[];
  pinnedIds: Set<string>;
  exportOpen: boolean;
  settingsOpen: boolean;
  settingsSection: string;
  settingsSectionHint: string | null;
  commandOpen: boolean;
  globalSearchOpen: boolean;
  compareLeftId: string | null;
  compareRightId: string | null;
  compareOpen: boolean;
  replayEditorEntry: XrayEntry | null;
  explainEntry: XrayEntry | null;
  pendingConfirmation: ConfirmationRequest | null;
  /** False when the last capture-settings publish could not reach the page (pop-out window). */
  captureDelivered: boolean;
  /** Which surface hosts this panel instance; the pop-out window cannot reach the page bridge. */
  surface: XrayAppMode;
  setSurface(surface: XrayAppMode): void;
  settings: PanelSettings;
  toastMessage: string | null;
  setInitialized(value: boolean): void;
  setOpen(value: boolean): void;
  setDevtoolsMode(value: boolean): void;
  setActiveTab(tab: ActiveTab): void;
  setDetailView(view: DetailView): void;
  setDetailTab(tab: DetailTab): void;
  setConsoleMiniTab(tab: ConsoleMiniTab): void;
  setRulesSubTab(tab: RulesSubTab): void;
  setNetworkFilter(filter: NetworkFilter): void;
  setSearchQuery(query: string): void;
  setApiSearchQuery(query: string): void;
  setApiQuickFilter(filter: ApiQuickFilter): void;
  setApiGroupingMode(mode: ApiGroupingMode): void;
  setApiDetailOpen(value: boolean): void;
  setLogDetailOpen(value: boolean): void;
  setApiDrawerPlacement(placement: ApiDrawerPlacement): void;
  toggleMethodFilter(method: string): void;
  toggleStatusFilter(status: string): void;
  toggleTypeFilter(type: string): void;
  clearApiFilters(): void;
  togglePinned(id: string): void;
  clearPinned(): void;
  toggleGroup(key: string): void;
  toggleSection(id: string): void;
  setSort(field: SortField): void;
  setRecording(value: boolean): void;
  addEntry(entry: XrayEntry): void;
  addEntries(batch: XrayEntry[]): void;
  updateEntry(patch: Partial<XrayEntry> & { id: string }): void;
  restoreEntries(entries: XrayEntry[]): { accepted: number; duplicates: number; omitted: number };
  addRule(rule?: Partial<TrafficRule>): { accepted: number; omitted: number };
  importRules(rules: TrafficRule[]): { accepted: number; omitted: number };
  updateRule(id: string, patch: Partial<TrafficRule>): void;
  removeRule(id: string): void;
  toggleRule(id: string): void;
  setRules(rules: TrafficRule[]): void;
  setAiSettings(patch: Partial<AiSettings>): void;
  replayEntry(entry: XrayEntry, overrides?: Partial<XrayEntry>): string | null;
  openReplayEditor(entry: XrayEntry): void;
  closeReplayEditor(): void;
  openExplain(entry: XrayEntry): void;
  closeExplain(): void;
  clearConsole(scope?: ConsoleClearScope): void;
  clearEntries(): void;
  clearSession(): void;
  noteRuntimeEvent(event: RuntimeHealthUpdate): void;
  noteRuntimeDrop(reason?: string, count?: number): void;
  restartRuntime(): Promise<void>;
  addConsoleEvent(event: ConsoleEvent): void;
  setConsoleRun(run: ConsoleRun | null): void;
  /** Pin an API request as the next free letter; returns it, the existing letter, or null (limit / not a request). */
  pinConsoleRequest(entryId: string): string | null;
  unpinConsoleRequest(name: string): void;
  updateConsoleEvent(id: string, patch: Partial<ConsoleEvent>): void;
  removeConsoleCommand(commandId: string): void;
  setConsoleDraft(command: string): void;
  insertConsoleCommand(command: string): void;
  saveSnippet(snippet: { code: string; title?: string }): void;
  renameSnippet(id: string, title: string): void;
  removeSnippet(id: string): void;
  selectEntry(id: string | null, options?: { openDetail?: boolean }): void;
  toggleExpanded(id: string): void;
  setExportOpen(value: boolean): void;
  setSettingsOpen(value: boolean): void;
  setSettingsSection(section: string): void;
  consumeSettingsSectionHint(): string | null;
  openSettings(section: string): void;
  setCommandOpen(value: boolean): void;
  setGlobalSearchOpen(value: boolean): void;
  setComparisonEntry(side: 'left' | 'right', id: string | null): void;
  openComparison(): void;
  closeComparison(): void;
  swapComparison(): void;
  clearComparison(): void;
  updateSettings(patch: Partial<PanelSettings>): void;
  resetSettings(): void;
  requestConfirmation(request: Omit<ConfirmationRequest, 'id'> & { id?: string }): void;
  closeConfirmation(): void;
  confirmPending(): void;
  showToast(message: string): void;
  clearToast(): void;
  restorePreferences(): Promise<void>;
}

function entryToConsoleEvent(entry: XrayEntry): ConsoleEvent {
  if (entry.type === 'api') {
    const status = Number(entry.status) || 0;
    return {
      id: 'evt_' + entry.id,
      type: 'network',
      level: status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info',
      timestamp: Number(entry.timestamp) || Date.now(),
      message: `${entry.method || 'GET'} ${entry.status || ''} ${entry.urlPath || entry.url || ''}`.trim(),
      args: [entry],
      entryId: entry.id,
    };
  }

  const level = entry.logLevel || 'log';
  const data = Array.isArray(entry.args) ? entry.args : Array.isArray(entry.logData) ? entry.logData : [entry.logData ?? entry.message ?? ''];
  return {
    id: 'evt_' + entry.id,
    type: 'log',
    level,
    timestamp: Number(entry.timestamp) || Date.now(),
    message: String(entry.message ?? data.map((item) => typeof item === 'string' ? item : previewJson(item)).join(' ')).slice(0, 600),
    args: data,
    entryId: entry.id,
  };
}

// Message previews must not expose the internal __xray_ref__ lazy-load marker.
function previewJson(value: unknown): string {
  try {
    return JSON.stringify(value, (key, item) => (key === '__xray_ref__' ? undefined : item)) ?? String(value);
  } catch {
    return String(value);
  }
}

// Events captured while the stream is paused are buffered here (not dropped)
// and flushed back into the stream when the user resumes.
let _pausedEvents: ConsoleEvent[] = [];

// Entry patches awaiting the coalesced updateEntry flush.
let _pendingEntryPatches = new Map<string, Partial<XrayEntry> & { id: string }>();
let _entryPatchTimer: number | null = null;

const initialSession = createSessionEnvelope();

type SettingsSetter = (partial: Partial<PanelState>) => void;

/** Commits already-normalized settings: evicts to the cap, republishes, persists. */
function applySettings(set: SettingsSetter, get: () => PanelState, settings: PanelSettings, patch: Partial<PanelSettings>): void {
  set({
    settings,
    findings: refreshedFindings({ ...get(), settings }, get().entries),
    detailView: patch.defaultDetailView ? settings.defaultDetailView : get().detailView,
    entries: evictEntries(get().entries, settings.maxEntries, pinnedAndSelected(get())).entries,
  });
  const consolePins = survivingConsolePins(get(), get().entries);
  if (consolePins) commitConsolePins(consolePins);
  set({ captureDelivered: publishCaptureSettings(settings) });
  persistPanelPreferences(get());
  set({ session: sessionSnapshot(get()) });
  scheduleSessionPersist(get);
  scheduleFindingPersist();
}

export const usePanelStore = create<PanelState>((set, get) => ({
  initialized: false,
  open: false,
  devtoolsMode: false,
  activeTab: 'console',
  detailView: 'tree',
  detailTab: 'response',
  consoleMiniTab: 'console',
  rulesSubTab: 'rules',
  networkFilter: 'all',
  searchQuery: '',
  apiSearchQuery: '',
  apiQuickFilter: 'all',
  apiGroupingMode: 'flat',
  apiDetailOpen: false,
  logDetailOpen: false,
  apiDrawerPlacement: 'right',
  methodFilters: new Set<string>(),
  statusFilters: new Set<string>(),
  typeFilters: new Set<string>(),
  expandedGroups: new Set<string>(),
  collapsedSections: new Set<string>(),
  sortField: 'timestamp',
  sortOrder: 'desc',
  recording: true,
  pausedCount: 0,
  entries: [],
  session: initialSession,
  runtimeHealth: initialSession.runtime,
  consoleEvents: [],
  consoleDraft: '',
  consolePreparationId: 0,
  snippets: [{ id: 'snip_default', title: 'Response schema', code: 'schema(res)' }],
  rules: [],
  experiments: [],
  findings: createFindingState(initialSession.sessionId),
  findingSynthesisIds: null,
  investigationStore: { schemaVersion: 1, investigations: [] },
  investigationStorageState: hasSessionStorage() ? 'ready' : 'unavailable',
  dismissFinding: (id) => {
    const findings = dismissFinding(get().findings, id);
    if (findings.dismissals[id]) _findingLocalDismissals.set(`${findings.sessionId}:${id}`, findings.dismissals[id]);
    set({ findings }); scheduleFindingPersist();
  },
  restoreFinding: (id) => {
    const findings = restoreFinding(get().findings, id);
    if (findings.findings.some(item => item.id === id)) _findingLocalDismissals.set(`${findings.sessionId}:${id}`, null);
    set({ findings }); scheduleFindingPersist();
  },
  openFindingEvidence: (findingId, entryId) => {
    const state = get();
    const finding = state.findings.findings.find(item => item.id === findingId);
    const ref = finding?.evidence.find(item => entryId ? item.entryId === entryId : item.role === 'current') ?? (!entryId ? finding?.evidence[0] : undefined);
    const entry = ref && ref.sessionId === state.session.sessionId ? state.entries.find(item => item.id === ref.entryId) : undefined;
    if (!entry) { state.showToast('Finding evidence is no longer retained in this session.'); return; }
    state.selectEntry(entry.id);
    set({ activeTab: entry.type === 'api' ? 'api' : 'logs' });
  },
  openFindingSynthesis: (ids) => {
    const allowed = new Set(get().findings.findings.map(item => item.id));
    const selected = [...new Set(ids)].filter(id => allowed.has(id)).slice(0, 5);
    if (selected.length) set({ findingSynthesisIds: selected });
  },
  closeFindingSynthesis: () => set({ findingSynthesisIds: null }),
  saveInvestigation: (title, notes) => {
    const state = get();
    if (!canEditInvestigations()) return null;
    if (state.investigationStore.investigations.length >= MAX_INVESTIGATIONS) { state.showToast('Investigation limit reached (25).'); return null; }
    try {
      const investigation = createInvestigation({ sessionId: state.session.sessionId, entries: state.entries,
        selectedId: state.selectedId, pinnedIds: state.pinnedIds, compareLeftId: state.compareLeftId, compareRightId: state.compareRightId,
        filters: { ...state, methodFilters: [...state.methodFilters], statusFilters: [...state.statusFilters], typeFilters: [...state.typeFilters] },
        findingIds: state.findings.findings.map(item => item.id), title, notes });
      if (!commitInvestigations([...state.investigationStore.investigations, investigation])) return null;
      set({ rulesSubTab: 'investigations' });
      state.showToast('Investigation prepared. Local storage write pending.');
      return investigation.id;
    } catch { state.showToast('Investigation could not be prepared.'); return null; }
  },
  updateInvestigation: (id, patch) => editInvestigation(id, item => ({ ...item,
    ...(typeof ownValue(patch, 'title') === 'string' ? { title: ownValue(patch, 'title') as string } : {}),
    ...(typeof ownValue(patch, 'notes') === 'string' ? { notes: ownValue(patch, 'notes') as string } : {}) })),
  deleteInvestigation: (id) => {
    if (!canEditInvestigations()) return;
    _investigationLocalIds.add(id);
    const item = get().investigationStore.investigations.find(item => item.id === id);
    for (const run of item?.runs ?? []) if (run.status === 'running') get().cancelExperiment(run.experimentId);
    commitInvestigations(get().investigationStore.investigations.filter(item => item.id !== id));
  },
  openInvestigation: (id) => {
    const state = get();
    const investigation = state.investigationStore.investigations.find(item => item.id === id);
    if (!investigation) return;
    const retained = (entryId: string | null) => {
      const ref = investigation.entryRefs.find(ref => ref.entryId === entryId && ref.sessionId === investigation.sourceSessionId);
      return ref ? resolveEntryRef(ref, state.session.sessionId, state.entries)?.id ?? null : null;
    };
    const selectedId = retained(investigation.selectedEntryId);
    setConsoleContext(state.entries.find(entry => entry.id === selectedId) ?? null);
    set({ ...investigation.filters, methodFilters: new Set(investigation.filters.methodFilters), statusFilters: new Set(investigation.filters.statusFilters),
      typeFilters: new Set(investigation.filters.typeFilters), selectedId, expandedId: selectedId ? 'evt_' + selectedId : null,
      pinnedIds: new Set(investigation.pinnedEntryIds.flatMap(id => retained(id) ? [id] : [])),
      compareLeftId: retained(investigation.compareLeftId), compareRightId: retained(investigation.compareRightId), compareOpen: false, activeTab: 'rules', rulesSubTab: 'investigations' });
  },
  addInvestigationAssertion: (id, entryId, check) => editInvestigation(id, item => {
    const state = get();
    const entry = state.entries.find(entry => entry.id === entryId);
    if (!entry || item.assertions.length >= MAX_ASSERTIONS) throw new Error('Unavailable assertion.');
    return { ...item, assertions: [...item.assertions, createAssertion(entry, state.session.sessionId, check)] };
  }),
  evaluateInvestigationAssertions: (id) => {
    const state = get();
    const item = state.investigationStore.investigations.find(item => item.id === id);
    return (item?.assertions ?? []).flatMap(spec => evaluateAssertions([spec], resolveEntryRef(spec.entryRef, state.session.sessionId, state.entries)));
  },
  removeInvestigationAssertion: (id, assertionId) => editInvestigation(id, item => ({ ...item, assertions: item.assertions.filter(spec => spec.id !== assertionId) })),
  addInvestigationScenario: (id, entryId, plan, checks) => editInvestigation(id, item => {
    const state = get();
    const entry = state.entries.find(entry => entry.id === entryId && entry.type === 'api');
    if (!entry) throw new Error('Unavailable source.');
    const scenario = createScenario({ ...item, sourceSessionId: state.session.sessionId }, entry, plan, checks);
    return { ...item, scenarios: [...item.scenarios, scenario] };
  }),
  addScenarioStep: (id, scenarioId, entryId, plan, checks) => editInvestigation(id, item => {
    const state = get();
    const entry = state.entries.find(entry => entry.id === entryId && entry.type === 'api');
    const scenario = item.scenarios.find(scenario => scenario.id === scenarioId);
    if (!entry || !scenario || scenario.steps.length >= MAX_SCENARIO_STEPS) throw new Error('Unavailable step.');
    const step = createScenario({ ...item, scenarios: [], sourceSessionId: state.session.sessionId }, entry, plan, checks).steps[0];
    return { ...item, scenarios: item.scenarios.map(scenario => scenario.id === scenarioId ? { ...scenario, steps: [...scenario.steps, step] } : scenario) };
  }),
  removeInvestigationScenario: (id, scenarioId) => {
    if (!canEditInvestigations()) return;
    const item = get().investigationStore.investigations.find(item => item.id === id);
    for (const run of item?.runs ?? []) if (run.scenarioId === scenarioId && run.status === 'running') get().cancelExperiment(run.experimentId);
    editInvestigation(id, item => ({ ...item, scenarios: item.scenarios.filter(scenario => scenario.id !== scenarioId), runs: item.runs.filter(run => run.scenarioId !== scenarioId) }));
  },
  rebindScenarioStep: (id, scenarioId, stepId, entryId) => editInvestigation(id, item => {
    const state = get();
    const entry = state.entries.find(entry => entry.id === entryId && entry.type === 'api');
    const step = item.scenarios.find(scenario => scenario.id === scenarioId)?.steps.find(step => step.id === stepId);
    if (!entry || !step || item.runs.some(run => run.stepId === stepId && run.status === 'running')) throw new Error('Unavailable rebind.');
    // Only an original-target recipe adopts the newly chosen captured URL. Edited targets remain edited.
    const replacement = createScenario({ ...item, scenarios: [], sourceSessionId: state.session.sessionId }, entry,
      { ...step.plan, ...(step.plan.preserveCapturedUrl ? { url: String(entry.url) } : {}) }, step.checks).steps[0];
    return { ...item, scenarios: item.scenarios.map(scenario => scenario.id === scenarioId ? { ...scenario,
      steps: scenario.steps.map(current => current.id === stepId ? { ...replacement, id: stepId, label: step.label } : current) } : scenario) };
  }),
  runScenarioStep: (id, scenarioId, stepId) => {
    if (!canEditInvestigations()) return;
    const state = get();
    // Authoring may happen while the first read is pending, but irreversible
    // page work must wait until we know the stored schema can retain its receipt.
    if (!_investigationReadOK) {
      state.showToast('Investigation storage is still being checked. Select Run again after it is ready.');
      return;
    }
    const item = state.investigationStore.investigations.find(item => item.id === id);
    const step = item?.scenarios.find(scenario => scenario.id === scenarioId)?.steps.find(step => step.id === stepId);
    const entry = step && resolveEntryRef(step.source, state.session.sessionId, state.entries);
    if (!step || !entry || entry.type !== 'api') { state.showToast('Step baseline unavailable. Explicitly rebind to retained traffic.'); return; }
    // Running a step drafts its experiment, but the user stays on the Investigations section.
    const section = state.rulesSubTab;
    const experimentId = state.draftExperiment(entry, { ...step.plan, url: step.plan.preserveCapturedUrl ? String(entry.url) : step.plan.url }, step.checks);
    if (!experimentId) return;
    set({ rulesSubTab: section });
    const run: RunSummary = { id: experimentId, experimentId, scenarioId, stepId, status: 'running', startedAt: Date.now(), results: [] };
    // Reserve bounded terminal scalars before dispatch. A full envelope must not
    // execute a step whose eventual receipt could silently drop saved recipes.
    const candidate = get().investigationStore.investigations.map(item => item.id === id ? { ...item, runs: appendScenarioRun(item.runs, run) } : item);
    if (!hasReceiptCapacity(candidate)) {
      state.deleteExperiment(experimentId);
      state.showToast('Step did not start: bounded storage has no room for its result receipt.');
      return;
    }
    state.armExperiment(experimentId);
    state.runExperiment(experimentId);
    const experiment = get().experiments.find(record => record.id === experimentId);
    if (!experiment || !['running', 'failed'].includes(experiment.status)) { state.showToast('Step did not start. Review the experiment refusal.'); return; }
    run.startedAt = experiment.startedAt ?? run.startedAt;
    editInvestigation(id, item => ({ ...item, runs: appendScenarioRun(item.runs, adaptScenarioRun(run, experiment)) }));
  },
  cancelScenarioStep: (id, runId) => {
    const run = get().investigationStore.investigations.find(item => item.id === id)?.runs.find(run => run.id === runId);
    if (run?.status === 'running') get().cancelExperiment(run.experimentId);
  },
  aiSettings: DEFAULT_AI_SETTINGS,
  selectedId: null,
  expandedId: null,
  consoleRun: null,
  consolePins: [],
  pinnedIds: new Set<string>(),
  exportOpen: false,
  settingsOpen: false,
  settingsSection: 'general',
  settingsSectionHint: null,
  commandOpen: false,
  globalSearchOpen: false,
  compareLeftId: null,
  compareRightId: null,
  compareOpen: false,
  replayEditorEntry: null,
  explainEntry: null,
  pendingConfirmation: null,
  captureDelivered: true,
  surface: 'hud',
  setSurface: (surface) => set({ surface }),
  settings: DEFAULT_PANEL_SETTINGS,
  toastMessage: null,
  setInitialized: (value) => set({ initialized: value }),
  setOpen: (value) => {
    window.__XRAY_focusTrapActive = value;
    // Only the injected side panel (not devtools/window) hands focus back to the
    // page on close. Capture on open while focus is still on the page element.
    const sidePanel = !get().devtoolsMode;
    if (value && sidePanel) {
      const active = document.activeElement;
      _lastPageFocus = active instanceof HTMLElement && active.id !== '__xray_root__' ? active : null;
    }
    set({ open: value });
    if (!value && sidePanel && _lastPageFocus) {
      const el = _lastPageFocus;
      _lastPageFocus = null;
      try { el.focus(); } catch {}
    }
  },
  setDevtoolsMode: (value) => set({ devtoolsMode: value, open: value ? true : get().open }),
  setActiveTab: (tab) => { set({ activeTab: tab }); persistPanelPreferences(get()); },
  setDetailView: (view) => { set({ detailView: view }); persistPanelPreferences(get()); },
  setDetailTab: (tab) => { set({ detailTab: tab }); persistPanelPreferences(get()); },
  // Pure UI state: which Rules section is showing. Not persisted.
  setRulesSubTab: (tab) => set({ rulesSubTab: tab }),
  setConsoleMiniTab: (tab) => { set({ consoleMiniTab: tab }); persistPanelPreferences(get()); },
  setNetworkFilter: (filter) => { set({ networkFilter: filter }); persistPanelPreferences(get()); },
  setSearchQuery: (query) => set({ searchQuery: query }),
  setApiSearchQuery: (query) => { set({ apiSearchQuery: query }); persistPanelPreferences(get()); },
  setApiQuickFilter: (filter) => { set({ apiQuickFilter: filter }); persistPanelPreferences(get()); },
  setApiGroupingMode: (mode) => { set({ apiGroupingMode: mode }); persistPanelPreferences(get()); },
  setApiDetailOpen: (value) => { set({ apiDetailOpen: value }); persistPanelPreferences(get()); },
  setLogDetailOpen: (value) => set({ logDetailOpen: value }),
  setApiDrawerPlacement: (placement) => { set({ apiDrawerPlacement: placement }); persistPanelPreferences(get()); },
  toggleMethodFilter: (method) => {
    const methodFilters = new Set(get().methodFilters);
    const normalized = method.toUpperCase();
    if (methodFilters.has(normalized)) methodFilters.delete(normalized);
    else methodFilters.add(normalized);
    set({ methodFilters });
    persistPanelPreferences(get());
  },
  toggleStatusFilter: (status) => {
    const statusFilters = new Set(get().statusFilters);
    if (statusFilters.has(status)) statusFilters.delete(status);
    else statusFilters.add(status);
    set({ statusFilters });
    persistPanelPreferences(get());
  },
  toggleTypeFilter: (type) => {
    const typeFilters = new Set(get().typeFilters);
    if (typeFilters.has(type)) typeFilters.delete(type);
    else typeFilters.add(type);
    set({ typeFilters });
    persistPanelPreferences(get());
  },
  // Clears FILTERS only. Sort, grouping mode, and the typed search survive —
  // "All"/Reset silently discarding those was a repeated complaint.
  clearApiFilters: () => {
    set({
      apiQuickFilter: 'all',
      methodFilters: new Set<string>(),
      statusFilters: new Set<string>(),
      typeFilters: new Set<string>(),
    });
    persistPanelPreferences(get());
  },
  togglePinned: (id) => {
    const pinnedIds = new Set(get().pinnedIds);
    if (pinnedIds.has(id)) pinnedIds.delete(id);
    else pinnedIds.add(id);
    set({ pinnedIds });
    persistPanelPreferences(get());
  },
  clearPinned: () => {
    set({ pinnedIds: new Set<string>() });
    persistPanelPreferences(get());
  },
  toggleGroup: (key) => {
    const expandedGroups = new Set(get().expandedGroups);
    if (expandedGroups.has(key)) expandedGroups.delete(key);
    else expandedGroups.add(key);
    set({ expandedGroups });
    persistPanelPreferences(get());
  },
  toggleSection: (id) => {
    const collapsedSections = new Set(get().collapsedSections);
    if (collapsedSections.has(id)) collapsedSections.delete(id);
    else collapsedSections.add(id);
    set({ collapsedSections });
    persistPanelPreferences(get());
  },
  setSort: (field) => {
    const { sortField, sortOrder } = get();
    set({
      sortField: field,
      sortOrder: sortField === field && sortOrder === 'desc' ? 'asc' : 'desc',
    });
    persistPanelPreferences(get());
  },
  setRecording: (value) => {
    if (value && _pausedEvents.length) {
      const buffered = _pausedEvents;
      _pausedEvents = [];
      set({
        recording: true,
        pausedCount: 0,
        consoleEvents: [...get().consoleEvents, ...buffered].slice(-MAX_CONSOLE_EVENTS),
      });
    } else {
      set({ recording: value, ...(value ? { pausedCount: 0 } : {}) });
    }
    persistPanelPreferences(get());
  },
  addEntry: (entry) => get().addEntries([entry]),
  // Capture batches (log storms flush ~16ms of messages at once) land as ONE
  // store commit: one entries copy, one consoleEvents copy, one render pass —
  // instead of an O(entries) copy and full re-render per message.
  addEntries: (batch) => {
    if (!batch.length) return;
    const state = get();
    const maxEntries = Math.max(50, Math.min(5000, Number(state.settings.maxEntries) || MAX_ENTRIES));
    const entries = state.entries.slice();
    // One pass to index the buffer, then an O(1) baseline lookup per entry —
    // the previous backwards scan per entry ran to completion on every unique
    // URL, which is the common case for cache-busted or id-bearing paths.
    const driftIndex = buildDriftIndex(entries);
    const added: ConsoleEvent[] = [];
    const seen = new Set(entries.map((entry) => entry.id));
    let dropped = 0;
    for (const raw of batch) {
      if (!raw || (raw.type !== 'api' && raw.type !== 'log')) { dropped += 1; continue; }
      const id = raw.id || 'entry_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
      if (seen.has(id)) { dropped += 1; continue; }
      seen.add(id);
      const drift = detectDrift({ ...raw, id }, entries, driftIndex);
      const normalized: XrayEntry = { ...raw, id, ...(drift.driftFromId ? { driftFromId: drift.driftFromId } : {}) };
      entries.push(normalized);
      noteDriftEntry(driftIndex, normalized);
      added.push(entryToConsoleEvent(normalized));
    }
    const evicted = evictEntries(entries, maxEntries, pinnedAndSelected(state));
    const health = runtimeHealth(state.runtimeHealth, {
      accepted: added.length, dropped, captureRouteState: added.length ? 'healthy' : state.runtimeHealth.captureRouteState,
      ...(dropped ? { lastErrorCode: 'invalid-entry' } : {}),
    });
    const next: Partial<PanelState> = { entries: evicted.entries, runtimeHealth: health,
      findings: refreshedFindings(state, entries),
      session: sessionSnapshot({ ...state, entries: evicted.entries, runtimeHealth: health }) };
    if (evicted.dropped.size) {
      const pinnedIds = new Set([...state.pinnedIds].filter((id) => !evicted.dropped.has(id)));
      if (pinnedIds.size !== state.pinnedIds.size) next.pinnedIds = pinnedIds;
    }
    const consolePins = survivingConsolePins(state, evicted.entries);
    if (state.recording) {
      next.consoleEvents = [...state.consoleEvents, ...added].slice(-MAX_CONSOLE_EVENTS);
    } else {
      _pausedEvents = [..._pausedEvents, ...added].slice(-MAX_CONSOLE_EVENTS);
      next.pausedCount = _pausedEvents.length;
    }
    set(next);
    if (consolePins) commitConsolePins(consolePins);
    scheduleFindingPersist();
    scheduleSessionPersist(get);
  },
  // Patches are coalesced: each WS/SSE socket flushes frames independently and
  // fetch completions land unthrottled — mapping the whole entries array (and
  // re-rendering every subscriber) once per patch caused storms. One flush per
  // 50ms window applies all pending patches in a single commit.
  updateEntry: (patch) => {
    const pending = _pendingEntryPatches.get(patch.id);
    _pendingEntryPatches.set(patch.id, pending ? { ...pending, ...patch } : patch);
    if (_entryPatchTimer !== null) return;
    _entryPatchTimer = window.setTimeout(() => {
      _entryPatchTimer = null;
      const patches = _pendingEntryPatches;
      if (!patches.size) return;
      _pendingEntryPatches = new Map();
      let accepted = 0;
      const entries = get().entries.map((entry) => {
        const merge = patches.get(entry.id);
        if (!merge) return entry;
        accepted += 1;
        return { ...entry, ...merge };
      });
      const state = get();
      const health = runtimeHealth(state.runtimeHealth, { accepted, dropped: patches.size - accepted,
        ...(accepted ? { captureRouteState: 'healthy' } : {}),
        ...(patches.size > accepted ? { lastErrorCode: 'invalid-update' } : {}),
      });
      set({ entries, findings: refreshedFindings(state, entries), runtimeHealth: health, session: sessionSnapshot({ ...state, entries, runtimeHealth: health }) });
      const selectedId = get().selectedId;
      if (selectedId && patches.has(selectedId)) {
        setConsoleContext(entries.find((entry) => entry.id === selectedId) || null);
      }
      scheduleFindingPersist();
      scheduleSessionPersist(get);
    }, 50);
  },
  restoreEntries: (restored) => {
    if (!restored.length) return { accepted: 0, duplicates: 0, omitted: 0 };
    const state = get();
    const maxEntries = Math.max(50, Math.min(5000, Number(state.settings.maxEntries) || MAX_ENTRIES));
    const seen = new Set(state.entries.map((entry) => entry.id));
    let duplicates = 0;
    const fresh = restored.filter((entry) => {
      if (seen.has(entry.id)) { duplicates += 1; return false; }
      seen.add(entry.id);
      return true;
    });
    // Reserve room for the incoming entries BEFORE trimming. This was
    // `[...fresh, ...entries].slice(-maxEntries)`, which trims from the front — and the
    // imported entries are at the front — so importing into a session already at the cap
    // (1000 by default, minutes of traffic on a busy app) kept exactly the entries that
    // were already there and dropped every imported one, while the modal reported
    // "Imported 40 HAR entries."
    //
    // Note this list is ordered newest-first, the opposite of the ingest path, which is
    // why it cannot just call evictEntries on the concatenation.
    const protectedIds = pinnedAndSelected(state);
    const protectedEntries = state.entries.filter((entry) => protectedIds.has(entry.id)).slice(-maxEntries);
    const freshRoom = maxEntries - protectedEntries.length;
    const freshKept = freshRoom ? fresh.slice(-freshRoom) : [];
    const room = Math.max(0, maxEntries - freshKept.length);
    // Avoid slice(-0) in the eviction helper when only protected rows fit.
    const existingKept = room <= protectedEntries.length
      ? protectedEntries
      : evictEntries(state.entries, room, protectedIds).entries;
    const merged = [...freshKept, ...existingKept];
    const survivingIds = new Set(merged.map((entry) => entry.id));
    // Console events have to be rebuilt here too. addEntries derives them from every
    // entry it accepts, but this path used to set `entries` alone — so after a session
    // restore or a HAR import the API and Logs tabs were populated while the Console
    // tab, which reads consoleEvents and nothing else, rendered "No network activity
    // yet". Console is the default tab, so that was the first thing shown on reopen.
    // Only for entries that survived the merge: this used to derive an event for every
    // imported entry regardless, so a full buffer gained console rows pointing at
    // entries that did not exist, and clicking one cleared the console context.
    const restoredEvents = freshKept.map(entryToConsoleEvent);
    set({
      entries: merged,
      findings: refreshedFindings(state, [...fresh, ...state.entries]),
      session: sessionSnapshot({ ...state, entries: merged }),
      consoleEvents: [...restoredEvents, ...state.consoleEvents].slice(-MAX_CONSOLE_EVENTS),
      pinnedIds: new Set([...state.pinnedIds].filter((id) => survivingIds.has(id))),
    });
    const consolePins = survivingConsolePins(state, merged);
    if (consolePins) commitConsolePins(consolePins);
    scheduleSessionPersist(get);
    scheduleFindingPersist();
    return { accepted: freshKept.length, duplicates, omitted: fresh.length - freshKept.length };
  },
  addRule: (rule) => {
    if (get().rules.length >= MAX_TRAFFIC_RULES) return { accepted: 0, omitted: 1 };
    const base = defaultRule();
    const created = normalizeRule({ ...base, ...(rule || {}), id: base.id, enabled: false });
    const rules = [...get().rules, created];
    set({ rules, activeTab: 'rules', rulesSubTab: 'rules' });
    persistRules(rules);
    return { accepted: 1, omitted: 0 };
  },
  importRules: (incoming) => {
    const available = Math.max(0, MAX_TRAFFIC_RULES - get().rules.length);
    const accepted = incoming.slice(0, available).map((rule) => normalizeRule({ ...rule, id: createRuleId(), enabled: false }));
    if (accepted.length) {
      const rules = [...get().rules, ...accepted];
      set({ rules, activeTab: 'rules', rulesSubTab: 'rules' });
      persistRules(rules);
    }
    return { accepted: accepted.length, omitted: incoming.length - accepted.length };
  },
  updateRule: (id, patch) => {
    const rules = get().rules.map((rule) => {
      if (rule.id !== id) return rule;
      const updated = normalizeRule({ ...rule, ...patch, id: rule.id, match: { ...rule.match, ...(patch.match || {}) }, action: { ...rule.action, ...(patch.action || {}) } });
      const effectiveEdit = JSON.stringify(updated.match) !== JSON.stringify(rule.match) || JSON.stringify(updated.action) !== JSON.stringify(rule.action);
      if (effectiveEdit || (patch.enabled === true && ruleMatcherError(updated))) updated.enabled = false;
      return updated;
    });
    set({ rules });
    persistRulesDebounced(rules);
  },
  removeRule: (id) => {
    const rules = get().rules.filter((rule) => rule.id !== id);
    set({ rules });
    persistRules(rules);
  },
  toggleRule: (id) => {
    const rules = get().rules.map((rule) => rule.id === id ? { ...rule, enabled: !rule.enabled && !ruleMatcherError(rule) } : rule);
    set({ rules });
    persistRules(rules);
  },
  setRules: (rules) => {
    const normalized = normalizeRules(rules);
    set({ rules: normalized });
    persistRules(normalized);
  },
  setAiSettings: (patch) => {
    const aiSettings = { ...get().aiSettings, ...patch };
    set({ aiSettings });
    void setStoredValue(AI_SETTINGS_KEY, aiSettings)
      .catch(() => noteStorageIssue(usePanelStore.getState, 'storage-write-failed'));
  },
  draftExperiment: (entry, plan, checks) => {
    if (get().experiments.length >= MAX_EXPERIMENTS) { get().showToast('Experiment limit reached (50). Delete a record to make room.'); return null; }
    if (!isReplayableEntry(entry)) {
      const reason = replayabilityReason(entry) || 'This entry cannot be used for an experiment.';
      get().showToast(`Experiment not drafted: ${reason}`);
      return null;
    }
    try {
      const record = safeExperiment(entry, plan, checks);
      const experiments = [...get().experiments, record];
      set({ experiments, activeTab: 'rules', rulesSubTab: 'experiments' });
      persistExperiments(experiments);
      get().showToast('Experiment drafted. Arm and Run explicitly when ready.');
      return record.id;
    } catch {
      get().showToast('Experiment not drafted: use a valid HTTP(S) URL and acknowledge cross-origin retargeting.');
      return null;
    }
  },
  updateExperiment: (id, plan, checks) => {
    const record = get().experiments.find(item => item.id === id);
    const baseline = record && get().entries.find(entry => entry.id === record.baselineEntryId);
    if (!record || record.status !== 'draft' || !baseline) return false;
    try {
      const replacement = safeExperiment(baseline, { ...record.plan, ...plan }, checks);
      const experiments = get().experiments.map(item => item.id === id ? { ...replacement, id, createdAt: record.createdAt } : item);
      set({ experiments }); persistExperiments(experiments);
      return true;
    } catch { get().showToast('Plan not saved: check the URL and retarget acknowledgement.'); return false; }
  },
  armExperiment: (id) => {
    const record = get().experiments.find(item => item.id === id);
    if (!record || record.status !== 'draft') return;
    const baseline = get().entries.find(entry => entry.id === record.baselineEntryId);
    if (!baseline) { get().showToast('Baseline is no longer retained. Prepare a new experiment from captured traffic.'); return; }
    try {
      safeExperiment(baseline, record.plan, record.checks);
      const experiments = get().experiments.map(item => item.id === id ? armExperiment(item, Date.now()) : item);
      set({ experiments }); persistExperiments(experiments);
    } catch { get().showToast('Cannot arm this plan: review its URL and retarget acknowledgement.'); }
  },
  runExperiment: (id) => {
    const state = get();
    const record = state.experiments.find(item => item.id === id);
    if (!record || record.status !== 'armed') return;
    let running: ExperimentRecord;
    try { running = startExperiment(record, state.experiments, Date.now()); }
    catch { state.showToast('Another run is active for this baseline. Cancel it or wait for captured evidence.'); return; }
    const baseline = state.entries.find(entry => entry.id === record.baselineEntryId);
    const rule = record.plan.mockRuleId ? state.rules.find(item => item.id === record.plan.mockRuleId) : undefined;
    const invalidMock = record.plan.mockRuleId && (!rule || rule.enabled || rule.action.type !== 'mock' || ruleMatcherError(rule)
      || state.experiments.some(item => item.status === 'running' && item.plan.mockRuleId === record.plan.mockRuleId));
    let code: string | null = !baseline ? 'BASELINE_UNAVAILABLE' : !isReplayableEntry(baseline) ? 'UNREPLAYABLE_ENTRY' : !hasPageBridgeRoute() ? 'ROUTE_UNAVAILABLE' : invalidMock ? 'INVALID_MOCK' : null;
    if (baseline) {
      try { safeExperiment(baseline, record.plan, record.checks); } catch { code = 'INVALID_PLAN'; }
    }
    if (code) {
      const experiments = state.experiments.map(item => item.id === id ? failExperiment(running, { code, reason: experimentReason(code), now: Date.now() }) : item);
      set({ experiments }); persistExperiments(experiments); return;
    }
    const context: ExperimentRun = { seenIds: new Set(state.entries.map(entry => entry.id)), mockRuleId: rule?.id, timer: null };
    experimentRuns.set(id, context);
    const experiments = state.experiments.map(item => item.id === id ? running : item);
    set({ experiments }); persistExperiments(experiments);
    context.timer = setTimeout(() => finishExperiment(id, 'TIMEOUT'), record.plan.timeoutMs ?? 30_000);
    try {
      if (rule) {
        // Run is the explicit enable action. A post is only a submission receipt.
        state.toggleRule(rule.id);
        state.showToast('Mock submitted. Waiting for a captured mocked entry; trigger the request on the page.');
      } else if (baseline) {
        const headers = Object.fromEntries(Object.entries(record.plan.headers).map(([key, value]) => [key, value === '[REDACTED]' ? '[redacted]' : value]));
        state.replayEntry(baseline, {
          method: record.plan.method,
          // An unchanged captured URL must reach MAIN verbatim for its origin-pinned restoration.
          url: record.plan.preserveCapturedUrl ? baseline.url : record.plan.url,
          requestHeaders: headers,
          requestBody: record.plan.body ?? null,
        });
      }
    } catch { finishExperiment(id, 'DISPATCH_FAILED'); }
  },
  cancelExperiment: (id) => {
    const record = get().experiments.find(item => item.id === id);
    if (!record || ['observed', 'failed', 'cancelled'].includes(record.status)) return;
    stopExperimentRun(id);
    const experiments = get().experiments.map(item => item.id === id ? cancelExperiment(item, 'Stopped waiting. An in-flight replay cannot be recalled.', Date.now()) : item);
    set({ experiments }); persistExperiments(experiments);
  },
  deleteExperiment: (id) => {
    stopExperimentRun(id);
    const experiments = get().experiments.filter(item => item.id !== id);
    set({ experiments }); persistExperiments(experiments);
  },
  replayEntry: (entry, overrides) => {
    if (!isReplayableEntry(entry)) {
      const reason = replayabilityReason(entry) || 'This entry cannot be replayed.';
      get().showToast(reason);
      return reason;
    }
    const source = { ...entry, ...(overrides || {}) };
    if (!isReplayableEntry(source)) {
      const reason = replayabilityReason(source) || 'This replay target is unavailable.';
      get().showToast(reason);
      return reason;
    }
    const request = {
      url: String(source.url || ''),
      method: String(source.method || 'GET'),
      headers: source.requestHeaders || {},
      body: source.requestBody ?? null,
      replayOf: entry.id,
    };
    if (postToPageBridge('replay', { request })) {
      get().showToast('Replaying request…');
    } else {
      get().showToast('Replay needs a live page — open XRAY on the page itself.');
    }
    return null;
  },
  openReplayEditor: (entry) => set({ replayEditorEntry: entry }),
  closeReplayEditor: () => set({ replayEditorEntry: null }),
  openExplain: (entry) => set({ explainEntry: entry }),
  closeExplain: () => set({ explainEntry: null }),
  // Clearing the stream keeps the selected request: the prompt's eval context
  // (res/$curl) still targets it, so dropping the selection here desynced the
  // chip from what the runtime actually evaluated against.
  // Pins are never cleared here (they are request references, not output).
  // 'all' and 'commands' also forget saved variables and abandon an in-flight run;
  // 'page' leaves commands, the run and variables alone.
  clearConsole: (scope = 'all') => {
    // Anything but the two partial scopes is 'all' (a stray argument must never
    // turn Clear console into a partial clear).
    if (scope !== 'commands' && scope !== 'page') {
      _pausedEvents = [];
      clearConsoleVariables();
      // Dropping consoleRun abandons an in-flight command: its cell is gone, the
      // prompt is free at once, and the run's late result is discarded (ConsolePrompt
      // only reports for the run the store still names).
      set({ consoleEvents: [], expandedId: null, pausedCount: 0, consoleRun: null });
      return;
    }
    // 'commands' keeps page logs; 'page' keeps commands and their outputs. Network
    // events (not shown in the Console) go with the page logs.
    const keep = scope === 'commands'
      ? (event: ConsoleEvent): boolean => !isCommandItem(event)
      : (event: ConsoleEvent): boolean => isCommandItem(event);
    _pausedEvents = _pausedEvents.filter(keep);
    const events = get().consoleEvents;
    const kept = events.filter(keep);
    const expandedId = get().expandedId;
    const next: Partial<PanelState> = {
      consoleEvents: kept,
      expandedId: expandedId && !kept.some((event) => event.id === expandedId) ? null : expandedId,
      pausedCount: _pausedEvents.length,
    };
    if (scope === 'commands') {
      clearConsoleVariables();
      next.consoleRun = null;
    }
    set(next);
  },
  clearEntries: () => get().clearSession(),
  clearSession: () => {
    _sessionRestoreGeneration += 1;
    if (_sessionPersistTimer) { clearTimeout(_sessionPersistTimer); _sessionPersistTimer = null; }
    if (_entryPatchTimer !== null) { window.clearTimeout(_entryPatchTimer); _entryPatchTimer = null; }
    _pendingEntryPatches.clear();
    _pausedEvents = [];
    for (const id of experimentRuns.keys()) get().cancelExperiment(id);
    _findingLocalDismissals.clear();
    setConsoleContext(null);
    clearConsoleVariables();
    const session = clearSessionEnvelope();
    const health = runtimeHealth(session.runtime, { workerState: get().runtimeHealth.workerState,
      captureRouteState: get().runtimeHealth.captureRouteState });
    session.runtime = health;
    set({ session, runtimeHealth: health, findings: createFindingState(session.sessionId), findingSynthesisIds: null,
      entries: [], consoleEvents: [], consoleRun: null, consolePins: [], selectedId: null, expandedId: null, logDetailOpen: false, pinnedIds: new Set<string>(), pausedCount: 0,
      compareLeftId: null, compareRightId: null, compareOpen: false });
    scheduleFindingPersist(true);
    persistPanelPreferences(get());
    void persistSession(get, true);
  },
  noteRuntimeEvent: (event) => {
    const state = get();
    const health = runtimeHealth(state.runtimeHealth, event);
    set({ runtimeHealth: health, session: sessionSnapshot({ ...state, runtimeHealth: health }) });
    scheduleSessionPersist(get);
  },
  noteRuntimeDrop: (reason = 'capture-drop', count = 1) => {
    get().noteRuntimeEvent({ dropped: count, lastErrorCode: safeRuntimeCode(reason) || 'capture-drop' });
  },
  restartRuntime: async () => {
    const worker = runtimeWorker();
    if (!worker?.restart || _runtimeRestartRequested) {
      get().showToast('Runtime restart unavailable — reload the XRAY surface to reconnect.');
      return;
    }
    _runtimeRestartRequested = true;
    get().noteRuntimeEvent({ workerState: 'degraded' });
    try {
      await worker.restart();
      const receipt = worker.getHealth?.();
      get().noteRuntimeEvent({ workerState: receipt?.state ?? (worker.isReady?.() ? 'healthy' : 'unavailable'), lastErrorCode: receipt?.lastErrorCode ?? null });
      get().showToast(get().runtimeHealth.workerState === 'healthy' ? 'Runtime worker reconnected.' : 'Runtime worker remains unavailable.');
    } catch {
      get().noteRuntimeEvent({ workerState: 'unavailable', lastErrorCode: 'worker-restart-failed' });
      get().showToast('Runtime worker restart failed.');
    }
  },
  // A command's result renders inside its cell, so nothing auto-expands here:
  // expanding results too showed every result twice (preview line + tree).
  addConsoleEvent: (event) => {
    set({ consoleEvents: [...get().consoleEvents, event].slice(-MAX_CONSOLE_EVENTS) });
  },
  setConsoleRun: (run) => set({ consoleRun: run }),
  pinConsoleRequest: (entryId) => {
    const state = get();
    const existing = state.consolePins.find((pin) => pin.entryId === entryId);
    if (existing) return existing.name;
    const entry = state.entries.find((item) => item.id === entryId);
    if (!entry || entry.type !== 'api') return null;
    const used = new Set(state.consolePins.map((pin) => pin.name));
    const name = CONSOLE_PIN_NAMES.find((letter) => !used.has(letter));
    if (!name) {
      state.showToast(`Pin limit reached: ${CONSOLE_PIN_NAMES.length} pins (a–f). Remove one to pin another request.`);
      return null;
    }
    const pins = [...state.consolePins, { name, entryId }].sort((a, b) => a.name.localeCompare(b.name));
    commitConsolePins(pins);
    return name;
  },
  unpinConsoleRequest: (name) => {
    const pins = get().consolePins.filter((pin) => pin.name !== name);
    if (pins.length !== get().consolePins.length) commitConsolePins(pins);
  },
  updateConsoleEvent: (id, patch) => {
    const events = get().consoleEvents;
    const index = events.findIndex((event) => event.id === id);
    if (index < 0) return;
    const next = events.slice();
    next[index] = { ...events[index], ...patch, id };
    set({ consoleEvents: next });
  },
  removeConsoleCommand: (commandId) => {
    const keep = (event: ConsoleEvent): boolean => event.commandId !== commandId && event.id !== commandId;
    _pausedEvents = _pausedEvents.filter(keep);
    const expandedId = get().expandedId;
    const removed = get().consoleEvents.filter((event) => !keep(event)).map((event) => event.id);
    set({
      consoleEvents: get().consoleEvents.filter(keep),
      expandedId: expandedId && removed.includes(expandedId) ? null : expandedId,
    });
  },
  setConsoleDraft: (command) => set({ consoleDraft: command }),
  insertConsoleCommand: (command) => set({ consoleDraft: command, activeTab: 'console', consoleMiniTab: 'console', consolePreparationId: get().consolePreparationId + 1 }),
  saveSnippet: (snippet) => {
    const code = snippet.code.trim();
    if (!code) return;
    const existing = get().snippets.filter((item) => item.code !== code);
    const saved: Snippet = {
      id: 'snip_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8),
      title: snippet.title,
      code,
    };
    const snippets = [saved, ...existing].slice(0, 30);
    set({ snippets, activeTab: 'console' });
    persistPanelPreferences(get());
  },
  renameSnippet: (id, title) => {
    const trimmed = title.trim();
    set({ snippets: get().snippets.map((snippet) => snippet.id === id ? { ...snippet, title: trimmed || undefined } : snippet) });
    persistPanelPreferences(get());
  },
  removeSnippet: (id) => {
    set({ snippets: get().snippets.filter((snippet) => snippet.id !== id) });
    persistPanelPreferences(get());
  },
  // detailView is deliberately NOT reset per selection: arrowing through rows
  // while comparing Schema/Headers must keep the inspection context. openDetail
  // false (keyboard navigation) also respects a drawer the user closed.
  selectEntry: (id, options) => {
    const entry = id ? get().entries.find((item) => item.id === id) || null : null;
    setConsoleContext(entry);
    const openDetail = options?.openDetail !== false;
    set({
      selectedId: id,
      expandedId: id ? 'evt_' + id : null,
      apiDetailOpen: entry?.type === 'api' && openDetail ? true : get().apiDetailOpen,
      logDetailOpen: entry?.type === 'log' && openDetail ? true : get().logDetailOpen,
    });
  },
  toggleExpanded: (id) => set({ expandedId: get().expandedId === id ? null : id }),
  setExportOpen: (value) => set({ exportOpen: value }),
  setSettingsOpen: (value) => set({ settingsOpen: value, ...(value ? {} : { settingsSectionHint: null }) }),
  setSettingsSection: (section) => set({ settingsSection: section }),
  consumeSettingsSectionHint: () => {
    const hint = get().settingsSectionHint;
    if (hint) set({ settingsSectionHint: null });
    return hint;
  },
  openSettings: (section) => set({ settingsSectionHint: section, settingsOpen: true }),
  setCommandOpen: (value) => set({ commandOpen: value }),
  setGlobalSearchOpen: (value) => set({ globalSearchOpen: value }),
  // IDs only: comparison is transient, read-only and independent of the selected
  // detail/drift baseline. Evicted IDs remain visible as unavailable until cleared.
  setComparisonEntry: (side, id) => {
    if (id !== null && !get().entries.some((entry) => entry.id === id && entry.type === 'api')) return;
    set(side === 'left' ? { compareLeftId: id } : { compareRightId: id });
  },
  openComparison: () => set({ compareOpen: true }),
  closeComparison: () => set({ compareOpen: false }),
  swapComparison: () => set({ compareLeftId: get().compareRightId, compareRightId: get().compareLeftId }),
  clearComparison: () => set({ compareLeftId: null, compareRightId: null, compareOpen: false }),
  updateSettings: (patch) => {
    const current = get().settings;
    let effective: Partial<PanelSettings> = patch;
    // A preset theme sets its own accent only while the user has never picked one.
    if (patch.theme && patch.theme !== current.theme && patch.accent === undefined
      && patch.theme in THEME_DEFAULT_ACCENT && !(patch.accentChosen ?? current.accentChosen)) {
      effective = { ...effective, accent: themeDefaultAccent(patch.theme) };
    }
    const next = normalizePanelSettings({ ...current, ...effective });
    // Lowering Max entries below what is held deletes entries now: ask first (S1 applies).
    const lowered = effective.maxEntries !== undefined && next.maxEntries < current.maxEntries
      ? evictEntries(get().entries, next.maxEntries, pinnedAndSelected(get())).dropped.size : 0;
    if (lowered > 0) {
      const { maxEntries, ...rest } = effective;
      if (Object.keys(rest).length) get().updateSettings(rest);
      get().requestConfirmation({
        title: 'Lower Max entries?',
        message: `This deletes ${lowered} of ${get().entries.length} captured entries now, oldest first. Pinned and selected entries are kept.`,
        confirmLabel: 'Delete entries',
        tone: 'danger',
        onConfirm: () => applySettings(set, get, normalizePanelSettings({ ...get().settings, maxEntries }), effective),
      });
      return;
    }
    applySettings(set, get, next, effective);
  },
  resetSettings: () => {
    // Layout is not a preference the user is asking to lose: a reset that also collapsed
    // the panel and the dragged splits was surprising.
    const kept = get().settings;
    const settings = normalizePanelSettings({
      ...DEFAULT_PANEL_SETTINGS,
      panelWidth: kept.panelWidth,
      dockSide: kept.dockSide,
      apiSplit: kept.apiSplit,
      logsSplit: kept.logsSplit,
      firstRunDismissed: kept.firstRunDismissed,
    });
    applySettings(set, get, settings, { defaultDetailView: settings.defaultDetailView });
  },
  requestConfirmation: (request) => {
    // The setting is honoured here, once, for every caller.
    if (get().settings.confirmDestructiveActions === false) {
      request.onConfirm();
      return;
    }
    set({
      pendingConfirmation: {
        id: request.id || 'confirm_' + Date.now().toString(36),
        title: request.title,
        message: request.message,
        confirmLabel: request.confirmLabel,
        cancelLabel: request.cancelLabel,
        tone: request.tone,
        onConfirm: request.onConfirm,
      },
    });
  },
  closeConfirmation: () => set({ pendingConfirmation: null }),
  confirmPending: () => {
    const request = get().pendingConfirmation;
    if (!request) return;
    set({ pendingConfirmation: null });
    request.onConfirm();
  },
  showToast: (message) => set({ toastMessage: message }),
  clearToast: () => set({ toastMessage: null }),
  restorePreferences: async () => {
    const restoreGeneration = _sessionRestoreGeneration;
    const findingRevision = _findingRevision;
    const rulesAtRestore = get().rules;
    const artifacts = readArtifacts(true);
    const artifactGeneration = _artifactReadGeneration;
    if (!hasSessionStorage()) _storageIssue = 'storage-unavailable';
    const restoredExperiments = await getStoredValue<unknown>(EXPERIMENTS_KEY, []).catch(() => {
      _storageIssue = hasSessionStorage() ? 'storage-read-failed' : 'storage-unavailable';
      return [];
    });
    if (!get().experiments.length) set({ experiments: restoreExperiments(restoredExperiments) });
    let preferences: SerializedPanelPreferences = {};
    let storedRules: unknown = [];
    let aiSettings: AiSettings | null = null;
    let storedEnvelope: unknown = null;
    let legacyEntries: unknown = [];
    let authoritativeReadOK = false;
    try {
      [preferences, storedRules, aiSettings, storedEnvelope, legacyEntries] = await Promise.all([
        getStoredValue<SerializedPanelPreferences>(REACT_PANEL_PREFERENCES_KEY, {}),
        getStoredValue<unknown>(TRAFFIC_RULES_KEY, []),
        getStoredValue<AiSettings | null>(AI_SETTINGS_KEY, null),
        getStoredValue<unknown>(SESSION_ENVELOPE_KEY, null),
        getStoredValue<unknown>(SESSION_ENTRIES_KEY, []),
      ]);
      authoritativeReadOK = true;
    } catch {
      _storageIssue = hasSessionStorage() ? 'storage-read-failed' : 'storage-unavailable';
    }
    if (authoritativeReadOK && (_storageIssue === 'storage-unavailable' || _storageIssue === 'storage-read-failed')) {
      noteStorageIssue(usePanelStore.getState, null);
    }
    const restored = applyPanelPreferences(preferences);
    if (restoreGeneration !== _sessionRestoreGeneration) delete restored.pinnedIds;
    // A mock run or a local rule edit can occur while storage is being read.
    const rules = get().rules === rulesAtRestore && !experimentRuns.size && !get().rules.some(rule => rule.enabled)
      ? normalizeRules(storedRules) : get().rules;
    set({
      ...restored,
      rules,
      ...(aiSettings ? { aiSettings: { ...DEFAULT_AI_SETTINGS, ...aiSettings } } : {}),
    });
    const settings = usePanelStore.getState().settings;
    set({ captureDelivered: publishCaptureSettings(settings) });
    publishTrafficRules(rules);
    const session = migrateSessionEnvelope(storedEnvelope ?? legacyEntries);
    // Persisted receipts describe history, never readiness of this runtime.
    session.runtime = runtimeHealth(session.runtime, { health: 'unknown', workerState: 'unknown', captureRouteState: 'unknown' });
    const previousEntries = session.entries;
    // A restore racing live capture cannot replace the current investigation.
    if (restoreGeneration === _sessionRestoreGeneration && !get().entries.length) set({ session, runtimeHealth: session.runtime });
    const storedFindings = await artifacts;
    if (restoreGeneration === _sessionRestoreGeneration && artifactGeneration === _artifactReadGeneration && findingRevision === _findingRevision && _findingReadOK) {
      const findings = reconcileFindingState(normalizeFindingState(storedFindings, get().session.sessionId),
        deriveFindings(get().entries, { sessionId: get().session.sessionId, slowThresholdMs: get().settings.slowThresholdMs }));
      for (const finding of findings.findings) {
        const key = `${findings.sessionId}:${finding.id}`;
        if (!_findingLocalDismissals.has(key)) continue;
        const fingerprint = _findingLocalDismissals.get(key);
        if (fingerprint) findings.dismissals[finding.id] = fingerprint;
        else delete findings.dismissals[finding.id];
      }
      set({ findings });
    }
    if (restoreGeneration === _sessionRestoreGeneration && previousEntries.length && !usePanelStore.getState().entries.length) {
      usePanelStore.getState().restoreEntries(previousEntries);
    }
    // Preferences may alter the slow threshold without importing any rows.
    set({ findings: refreshedFindings(get(), get().entries) });
    const worker = runtimeWorker();
    _unsubscribeWorkerHealth?.();
    const noteWorker = (receipt: WorkerHealthReceipt): void => get().noteRuntimeEvent({ workerState: receipt.state,
      lastEventAt: receipt.lastEventAt, lastErrorCode: receipt.cache?.lastErrorCode ?? receipt.lastErrorCode });
    _unsubscribeWorkerHealth = worker?.onHealth?.(noteWorker);
    const receipt = worker?.getHealth?.();
    get().noteRuntimeEvent({ captureRouteState: hasPageBridgeRoute() ? 'unknown' : 'unavailable',
      workerState: receipt?.state ?? (worker?.isReady?.() ? 'healthy' : 'unavailable'),
      lastErrorCode: receipt?.lastErrorCode ?? (worker ? null : 'worker-missing') });
    _unsubscribeCaptureReceipt?.();
    const receipts = captureReceipts();
    const noteCapture = (receipt: CaptureReceipt): void => {
      const count = typeof receipt.dropped === 'number' && Number.isFinite(receipt.dropped) ? Math.max(0, receipt.dropped) : _captureDropped;
      const dropped = Math.max(0, count - _captureDropped);
      _captureDropped = count;
      const counter = (value: unknown): number => typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
      const delivered = counter(receipt.delivered);
      const noConsumer = counter(receipt.noConsumer);
      const relayFailed = counter(receipt.relayFailed);
      const lastError = get().runtimeHealth.lastErrorCode;
      const deliveryError = relayFailed > _captureDeliverySeen.relayFailed ? 'relay-failed'
        : noConsumer > _captureDeliverySeen.noConsumer ? 'no-consumer'
          : delivered > _captureDeliverySeen.delivered && lastError !== null && ['relay-failed', 'no-consumer'].includes(lastError) ? null : undefined;
      _captureDeliverySeen = { delivered, noConsumer, relayFailed };
      if (dropped || deliveryError !== undefined) get().noteRuntimeEvent({
        ...(dropped ? { dropped } : {}),
        lastEventAt: receipt.lastEventAt,
        ...(deliveryError !== undefined ? { lastErrorCode: deliveryError } : { lastErrorCode: 'capture-drop' }),
      });
    };
    _unsubscribeCaptureReceipt = receipts?.subscribe?.(noteCapture);
    if (receipts?.get) noteCapture(receipts.get());
  },
}));

const EXPERIMENTS_KEY = 'experiment_records';
interface ExperimentRun {
  seenIds: Set<string>;
  mockRuleId?: string;
  timer: ReturnType<typeof setTimeout> | null;
}
const experimentRuns = new Map<string, ExperimentRun>();

let _findingRevision = 0;
let _investigationRevision = 0;
let _artifactReadGeneration = 0;
const _investigationLocalIds = new Set<string>();
const _findingLocalDismissals = new Map<string, string | null>();
let _findingReadOK = false;
let _investigationReadOK = false;
let _findingUnsupported = false;
let _findingLoad: Promise<unknown> | null = null;
let _investigationLoad: Promise<void> | null = null;
let _findingPersistTimer: ReturnType<typeof setTimeout> | null = null;
let _investigationPersistTimer: ReturnType<typeof setTimeout> | null = null;
let _findingWriteQueue = Promise.resolve();
let _investigationWriteQueue = Promise.resolve();

function refreshedFindings(state: PanelState, entries: XrayEntry[]): FindingsState {
  const previous = state.findings.sessionId === state.session.sessionId ? state.findings : createFindingState(state.session.sessionId);
  return reconcileFindingState(previous, deriveFindings(entries, { sessionId: state.session.sessionId, slowThresholdMs: state.settings.slowThresholdMs }));
}

// Read the version before *any* write, even if a user edits before initial restore.
// Findings and recipes use independent reads, queues and failure receipts.
function readArtifacts(force = false): Promise<unknown> {
  if (force || !_findingLoad || !_investigationLoad) _artifactReadGeneration += 1;
  const generation = _artifactReadGeneration;
  if (!_findingLoad || force) {
    _findingLoad = getStoredValue<unknown>(FINDING_STATE_KEY, null).then(input => {
      if (generation !== _artifactReadGeneration) return input;
      _findingUnsupported = isUnsupportedFindingState(input);
      _findingReadOK = !_findingUnsupported;
      if (_findingUnsupported) usePanelStore.getState().showToast('Finding storage version is unsupported. Stored data was left intact.');
      return input;
    }).catch(() => {
      if (generation !== _artifactReadGeneration) return null;
      _findingReadOK = false;
      noteStorageIssue(usePanelStore.getState, hasSessionStorage() ? 'storage-read-failed' : 'storage-unavailable');
      return null;
    });
  }
  if (!_investigationLoad || force) {
    _investigationLoad = getStoredValue<unknown>(SAVED_INVESTIGATIONS_KEY, null).then(input => {
      if (generation !== _artifactReadGeneration) return;
      const version = ownValue(input, 'schemaVersion');
      const unsupported = version !== undefined && version !== 1;
      _investigationReadOK = !unsupported;
      usePanelStore.setState({ investigationStorageState: unsupported ? 'unsupported' : 'ready' });
      if (unsupported) return;
      const restored = normalizeInvestigationStore(input);
      const local = usePanelStore.getState().investigationStore.investigations;
      const localById = new Map(local.map(item => [item.id, item]));
      const restoredIds = new Set(restored.investigations.map(item => item.id));
      const merged = restored.investigations.flatMap(item => _investigationLocalIds.has(item.id)
        ? localById.has(item.id) ? [localById.get(item.id)!] : [] : [item]);
      for (const item of local) if (_investigationLocalIds.has(item.id) && !restoredIds.has(item.id)) merged.push(item);
      const projected = serializeInvestigationStore({ schemaVersion: 1, investigations: merged });
      if (!fitsInvestigationStore(merged, projected) || !hasReceiptCapacity(projected.investigations)) {
        _investigationReadOK = false;
        usePanelStore.setState({ investigationStorageState: 'failed' });
        usePanelStore.getState().showToast('Investigation restore exceeds bounded limits. Stored data was left intact.');
        return;
      }
      usePanelStore.setState({ investigationStore: projected });
    }).catch(() => {
      if (generation !== _artifactReadGeneration) return;
      _investigationReadOK = false;
      usePanelStore.setState({ investigationStorageState: hasSessionStorage() ? 'failed' : 'unavailable' });
    });
  }
  return Promise.all([_findingLoad, _investigationLoad]).then(([findings]) => findings);
}

function scheduleFindingPersist(immediate = false): void {
  _findingRevision += 1;
  void readArtifacts();
  if (_findingPersistTimer) clearTimeout(_findingPersistTimer);
  const enqueue = (): void => {
    _findingPersistTimer = null;
    const state = usePanelStore.getState();
    const snapshot = normalizeFindingState(state.findings, state.session.sessionId);
    _findingWriteQueue = _findingWriteQueue.then(async () => {
      await _findingLoad;
      if (!_findingReadOK || _findingUnsupported) return;
      try { await setStoredValue(FINDING_STATE_KEY, snapshot); }
      catch { noteStorageIssue(usePanelStore.getState, hasSessionStorage() ? 'storage-write-failed' : 'storage-unavailable'); }
    });
  };
  if (immediate) enqueue();
  else _findingPersistTimer = setTimeout(enqueue, 250);
}

function canEditInvestigations(): boolean {
  void readArtifacts();
  const state = usePanelStore.getState();
  if (!hasSessionStorage()) {
    usePanelStore.setState({ investigationStorageState: 'unavailable' });
    state.showToast('Investigation storage unavailable. Nothing was saved.');
    return false;
  }
  if (state.investigationStorageState === 'unsupported' || (!_investigationReadOK && state.investigationStorageState === 'failed')) {
    state.showToast('Investigation storage could not be read. Stored data was left intact.');
    return false;
  }
  return true;
}

function fitsInvestigationStore(before: SavedInvestigation[], after: InvestigationStore): boolean {
  return before.length === after.investigations.length && before.every((item, index) => {
    const projected = after.investigations[index];
    return item.id === projected.id && item.assertions.length === projected.assertions.length
      && item.runs.length === projected.runs.length
      && item.runs.every((run, runIndex) => run.id === projected.runs[runIndex].id && run.results.length === projected.runs[runIndex].results.length)
      && item.scenarios.length === projected.scenarios.length && item.scenarios.every((scenario, scenarioIndex) =>
        scenario.steps.length === projected.scenarios[scenarioIndex].steps.length);
  });
}

function commitInvestigations(investigations: SavedInvestigation[]): boolean {
  const store = serializeInvestigationStore({ schemaVersion: 1, investigations });
  if (!fitsInvestigationStore(investigations, store) || !hasReceiptCapacity(store.investigations)) {
    usePanelStore.getState().showToast('Investigation not saved: the bounded storage limit or plan validation refused the change.');
    return false;
  }
  const before = usePanelStore.getState().investigationStore.investigations;
  const beforeById = new Map(before.map(item => [item.id, item]));
  const afterIds = new Set(store.investigations.map(item => item.id));
  for (const item of before) if (!afterIds.has(item.id)) _investigationLocalIds.add(item.id);
  for (const item of store.investigations) if (JSON.stringify(beforeById.get(item.id)) !== JSON.stringify(item)) _investigationLocalIds.add(item.id);
  _investigationRevision += 1;
  usePanelStore.setState({ investigationStore: store });
  if (_investigationPersistTimer) clearTimeout(_investigationPersistTimer);
  _investigationPersistTimer = setTimeout(() => {
    _investigationPersistTimer = null;
    _investigationWriteQueue = _investigationWriteQueue.then(async () => {
      await _investigationLoad;
      if (!_investigationReadOK || usePanelStore.getState().investigationStorageState === 'unsupported') return;
      // Capture after the initial read merges unrelated saved records; never write
      // an early local-only envelope over data that was still loading.
      const snapshot = serializeInvestigationStore(usePanelStore.getState().investigationStore);
      const revision = _investigationRevision;
      try {
        await setStoredValue(SAVED_INVESTIGATIONS_KEY, snapshot);
        if (revision === _investigationRevision) usePanelStore.setState({ investigationStorageState: 'ready' });
      } catch {
        usePanelStore.setState({ investigationStorageState: hasSessionStorage() ? 'failed' : 'unavailable' });
        usePanelStore.getState().showToast('Investigation storage write failed. Changes remain in memory.');
      }
    });
  }, 250);
  return true;
}

function editInvestigation(id: string, edit: (item: SavedInvestigation) => SavedInvestigation): void {
  if (!canEditInvestigations()) return;
  const store = usePanelStore.getState().investigationStore;
  try {
    commitInvestigations(store.investigations.map(item => item.id === id ? { ...edit(item), updatedAt: Date.now() } : item));
  } catch { usePanelStore.getState().showToast('Investigation change refused. Check the retained source, plan and bounded limits.'); }
}

function appendScenarioRun(runs: RunSummary[], run: RunSummary): RunSummary[] {
  const sameScenario = runs.filter(item => item.scenarioId === run.scenarioId);
  const dropped = new Set(sameScenario.filter(item => item.status !== 'running').slice(0, Math.max(0, sameScenario.length - MAX_SCENARIO_RUNS + 1)).map(item => item.id));
  return [...runs.filter(item => !dropped.has(item.id)), run];
}

function hasReceiptCapacity(investigations: SavedInvestigation[]): boolean {
  if (!investigations.some(item => item.runs.some(run => run.status === 'running'))) return true;
  const reserved = investigations.map(item => ({ ...item, runs: item.runs.map(run => {
    if (run.status !== 'running') return run;
    const checks = item.scenarios.find(scenario => scenario.id === run.scenarioId)?.steps.find(step => step.id === run.stepId)?.checks ?? [];
    return { ...run, status: 'unavailable' as const, finishedAt: Number.MAX_SAFE_INTEGER, observedEntryId: 'x'.repeat(200), reason: '!'.repeat(500),
      results: checks.map((check, index): AssertionResult => ({ id: `${run.id}:${index}`, type: check.type, outcome: 'unavailable',
        expected: check.type === 'structural' ? check.mode : check.expected, actual: 'unavailable', reason: '!'.repeat(500) })) };
  }) }));
  return fitsInvestigationStore(reserved, serializeInvestigationStore({ schemaVersion: 1, investigations: reserved }));
}

function adaptScenarioRun(run: RunSummary, record: ExperimentRecord): RunSummary {
  if (record.status === 'draft' || record.status === 'armed' || record.status === 'running') return run;
  const results: AssertionResult[] = (record.checkResults ?? []).map((check, index) => ({
    id: `${run.id}:${index}`, type: check.type, outcome: check.reason ? 'unavailable' : check.passed ? 'passed' : 'failed',
    expected: typeof check.expected === 'boolean' || typeof check.expected === 'number' ? check.expected : ['equal', 'contains', 'schema'].includes(String(check.expected)) ? String(check.expected) : 'unavailable',
    actual: check.reason ? 'unavailable' : typeof check.actual === 'boolean' || typeof check.actual === 'number' ? check.actual : check.passed ? 'match' : 'different',
    ...(check.reason ? { reason: check.reason } : {}),
  }));
  const unavailableCodes = ['BASELINE_UNAVAILABLE', 'ROUTE_UNAVAILABLE', 'INVALID_PLAN', 'INVALID_MOCK'];
  const status: RunSummary['status'] = record.status === 'cancelled' ? 'cancelled'
    : record.status === 'failed' ? record.errorCode === 'INTERRUPTED' ? 'interrupted' : unavailableCodes.includes(record.errorCode ?? '') ? 'unavailable' : 'failed'
      : results.some(result => result.outcome === 'unavailable') ? 'unavailable' : results.some(result => result.outcome === 'failed') ? 'failed' : results.length ? 'passed' : 'unavailable';
  return { ...run, status, finishedAt: record.updatedAt, results,
    ...(record.observedEntryId ? { observedEntryId: record.observedEntryId } : {}),
    ...(record.errorCode ? { reason: experimentReason(record.errorCode) } : {}) };
}

// Console pins → evaluation engine. The engine holds the pinned entries it was
// handed (it never looks entries up itself, so the HUD and panel cannot disagree);
// re-send whenever the pins change or a pinned entry object is replaced by a patch.
// Eviction and session clear drop the pin from `consolePins`, so it is never sent stale.
let _syncedPinEntries: readonly (XrayEntry | undefined)[] = [];

function pinnedEntries(state: Pick<PanelState, 'consolePins' | 'entries'>): (XrayEntry | undefined)[] {
  return state.consolePins.map((pin) => state.entries.find((entry) => entry.id === pin.entryId));
}

/** The engine's pin map (`a` → entry) for these pins; an evicted entry has no letter. */
export function consolePinMap(state: Pick<PanelState, 'consolePins' | 'entries'>, pinned = pinnedEntries(state)): Record<string, XrayEntry> {
  const map: Record<string, XrayEntry> = {};
  state.consolePins.forEach((pin, index) => { const entry = pinned[index]; if (entry) map[pin.name] = entry; });
  return map;
}

usePanelStore.subscribe((state, previous) => {
  if (state.consolePins === previous.consolePins && (state.entries === previous.entries || !state.consolePins.length)) return;
  const pinned = pinnedEntries(state);
  if (state.consolePins === previous.consolePins && pinned.length === _syncedPinEntries.length
    && pinned.every((entry, index) => entry === _syncedPinEntries[index])) return;
  _syncedPinEntries = pinned;
  syncConsolePins(consolePinMap(state, pinned));
});

/**
 * Evaluate a console command with THIS store's request context and pins. The HUD and
 * the panel are separate bundles with separate stores, but on one page they share a
 * single `window.XRAY_Console` engine, so whichever surface synced last would
 * otherwise decide what `res` and `a`…`f` mean. The running surface re-sends its own
 * view immediately before every run.
 */
export function evaluateConsoleCommand(code: string): Promise<ConsoleExecutionResult | null> {
  const state = usePanelStore.getState();
  setConsoleContext(state.selectedId ? state.entries.find((entry) => entry.id === state.selectedId) ?? null : null);
  syncConsolePins(consolePinMap(state));
  return executeConsoleCommand(code);
}

// Adapt only authoritative experiment transitions. No new traffic observer or executor.
usePanelStore.subscribe((state, previous) => {
  if (state.experiments === previous.experiments) return;
  let changed = false;
  const investigations = state.investigationStore.investigations.map(item => ({ ...item, runs: item.runs.map(run => {
    if (run.status !== 'running') return run;
    const record = state.experiments.find(record => record.id === run.experimentId);
    const next = record ? adaptScenarioRun(run, record) : { ...run, status: 'interrupted' as const, finishedAt: Date.now(), reason: 'Experiment record unavailable. It was not restarted.' };
    if (next !== run) changed = true;
    return next;
  }) }));
  if (changed) commitInvestigations(investigations);
});

function safeExperiment(entry: XrayEntry, overrides: Partial<ExperimentPlan> = {}, checks?: ExperimentCheck[]): ExperimentRecord {
  const url = new URL(overrides.url ?? String(entry.url || ''));
  url.username = ''; url.password = ''; url.hash = '';
  let body = overrides.body !== undefined ? overrides.body : entry.requestBody;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { /* retain non-JSON text */ } }
  const expectedChecks = checks ?? [{ type: 'status', expected: Number(entry.status) || 200 }, { type: 'response', expected: true }];
  const cleanChecks = expectedChecks.map(check => {
    if (check.type !== 'structural' || check.expected === undefined) return check;
    const sanitized = createExperiment({ baseline: entry, plan: { method: 'GET', url: url.toString(), body: check.expected, retargetAcknowledged: overrides.retargetAcknowledged } });
    return { ...check, expected: sanitized.plan.body };
  });
  const preserveCapturedUrl = overrides.url === undefined || String(overrides.url) === String(entry.url || '');
  const record = createExperiment({ baseline: entry, title: 'Experiment', checks: cleanChecks, now: Date.now(), plan: {
    method: String(entry.method || 'GET'), headers: entry.requestHeaders as Record<string, string> || {},
    ...overrides, url: url.toString(), body,
  } });
  // Keep this intent separate from the redacted URL. Once query values are
  // sanitized, an edited URL and the captured URL are otherwise indistinguishable.
  if (preserveCapturedUrl) record.plan.preserveCapturedUrl = true;
  return record;
}

function experimentReason(code: string): string {
  const reasons: Record<string, string> = {
    TIMEOUT: 'No matching captured result arrived before the timeout.',
    NETWORK_FAILED: 'Captured replay reported a network failure (status 0).',
    ROUTE_UNAVAILABLE: 'Page bridge unavailable. Open XRAY on the live page or its DevTools panel.',
    BASELINE_UNAVAILABLE: 'Baseline entry is no longer retained.',
    UNREPLAYABLE_ENTRY: 'This captured entry cannot be replayed or used for an experiment.',
    INVALID_PLAN: 'Plan URL is invalid or retargeting was not acknowledged.',
    INVALID_MOCK: 'Choose a valid disabled mock rule with no active experiment.',
    DISPATCH_FAILED: 'The replay or mock submission failed.',
    INTERRUPTED: 'Previous run was interrupted. It was not restarted.',
    FAILED: 'Experiment failed.',
    CANCELLED: 'Stopped waiting. An in-flight replay cannot be recalled.',
  };
  return reasons[code] || reasons.FAILED;
}

function persistExperiments(records: ExperimentRecord[]): void {
  void setStoredValue(EXPERIMENTS_KEY, records.slice(0, MAX_EXPERIMENTS))
    .catch(() => noteStorageIssue(usePanelStore.getState, 'storage-write-failed'));
}

function restoreExperiments(input: unknown): ExperimentRecord[] {
  if (!Array.isArray(input)) return [];
  const ids = new Set<string>();
  return input.slice(0, MAX_EXPERIMENTS).flatMap((value): ExperimentRecord[] => {
    if (!value || typeof value !== 'object') return [];
    const record = value as ExperimentRecord;
    if (typeof record.id !== 'string' || ids.has(record.id) || typeof record.baselineEntryId !== 'string') return [];
    try {
      const clean = safeExperiment({ id: record.baselineEntryId, type: 'api', url: record.plan.url }, record.plan, record.checks);
      const status = ['draft', 'armed', 'observed', 'failed', 'cancelled'].includes(record.status) ? record.status : 'failed';
      ids.add(record.id);
      // Persisted observations retain summary scalars only, never arbitrary expected/actual bodies.
      const checkResults = Array.isArray(record.checkResults) ? record.checkResults.slice(0, 10).map(check => ({
        type: ['status', 'response', 'structural'].includes(check.type) ? check.type : 'response' as const,
        passed: check.passed === true,
        expected: typeof check.expected === 'number' || typeof check.expected === 'boolean' ? check.expected : ['equal', 'contains', 'schema'].includes(String(check.expected)) ? check.expected : 'unavailable',
        actual: typeof check.actual === 'number' || typeof check.actual === 'boolean' ? check.actual : check.passed ? 'match' : 'different',
      })) : undefined;
      return [{ ...clean, id: record.id, status, createdAt: Number(record.createdAt) || clean.createdAt,
        ...(typeof record.observedEntryId === 'string' ? { observedEntryId: record.observedEntryId.slice(0, 200) } : {}),
        ...(checkResults ? { checkResults } : {}),
        ...(['failed', 'cancelled'].includes(status) ? { errorCode: record.status === 'running' ? 'INTERRUPTED' : status === 'cancelled' ? 'CANCELLED' : 'FAILED', errorReason: experimentReason(record.status === 'running' ? 'INTERRUPTED' : status === 'cancelled' ? 'CANCELLED' : 'FAILED') } : {}),
      }];
    } catch { return []; }
  });
}

function stopExperimentRun(id: string): void {
  const context = experimentRuns.get(id);
  if (!context) return;
  experimentRuns.delete(id);
  if (context.timer) clearTimeout(context.timer);
  const state = usePanelStore.getState();
  if (context.mockRuleId && state.rules.some(rule => rule.id === context.mockRuleId && rule.enabled)) state.toggleRule(context.mockRuleId);
}

function finishExperiment(id: string, code: string): void {
  const record = usePanelStore.getState().experiments.find(item => item.id === id);
  if (!record || record.status !== 'running') return;
  stopExperimentRun(id);
  const experiments = usePanelStore.getState().experiments.map(item => item.id === id ? failExperiment(item, { code, reason: experimentReason(code), now: Date.now() }) : item);
  usePanelStore.setState({ experiments }); persistExperiments(experiments);
}

// Observe only new captured representations arriving after an explicit Run.
// Keeping this subscription experiment-only leaves the shared ingest/patch paths intact.
usePanelStore.subscribe((state, previous) => {
  if (state.entries === previous.entries || !experimentRuns.size) return;
  for (const [id, context] of experimentRuns) {
    const record = usePanelStore.getState().experiments.find(item => item.id === id);
    if (!record || record.status !== 'running') continue;
    const entry = state.entries.find(item => item.type === 'api' && !item.imported && !context.seenIds.has(item.id)
      && (item.timestamp == null || Number(item.timestamp) >= Number(record.startedAt))
      && item.status !== undefined
      && (record.plan.mockRuleId ? item.mocked === true && item.mockRuleId === record.plan.mockRuleId : item.replayOf === record.baselineEntryId));
    if (!entry) continue;
    if (Number(entry.status) === 0) { finishExperiment(id, 'NETWORK_FAILED'); continue; }
    const baseline = state.entries.find(item => item.id === record.baselineEntryId);
    const captured = { ...entry, responseDecrypted: entry.responseDecrypted ?? undefined };
    const observed = observeExperiment(record, captured, Date.now());
    const evaluation = evaluateExperiment(record, captured, baseline ? { ...baseline, responseDecrypted: baseline.responseDecrypted ?? undefined } : undefined);
    stopExperimentRun(id);
    const experiments = usePanelStore.getState().experiments.map(item => item.id === id ? { ...observed, checkResults: evaluation.checks } : item);
    usePanelStore.setState({ experiments }); persistExperiments(experiments);
  }
});

function scheduleSessionPersist(get: () => PanelState): void {
  if (_sessionPersistTimer) return;
  // Serializing the session copies up to 500 entries (bodies, frames) into one
  // storage write — at 1.5s a busy WebSocket kept a multi-MB write loop running
  // continuously, so batch a little longer; crash-loss window stays small.
  _sessionPersistTimer = setTimeout(() => {
    _sessionPersistTimer = null;
    void persistSession(get);
  }, 4000);
}

function noteStorageIssue(get: () => PanelState, code: string | null): void {
  _storageIssue = code;
  const current = get();
  const health = runtimeHealth(current.runtimeHealth, { lastErrorCode: code ??
    (current.runtimeHealth.lastErrorCode?.startsWith('storage-') ? null : current.runtimeHealth.lastErrorCode) });
  // Updating the receipt must not itself schedule another failed-storage retry.
  usePanelStore.setState({ runtimeHealth: health, session: sessionSnapshot({ ...current, runtimeHealth: health }) });
}

async function runSessionWrite(get: () => PanelState, request: SessionWriteRequest): Promise<void> {
  let legacyFailed = false;
  try {
    // A request already in flight is allowed to finish, but a stale request that
    // was waiting behind Clear must never write after the generation barrier.
    if (!request.clearLegacy && request.generation !== _sessionRestoreGeneration) return;
    if (request.clearLegacy) {
      // Independently erase the migration fallback even if the envelope write fails.
      try { await setStoredValue(SESSION_ENTRIES_KEY, []); } catch {
        legacyFailed = true;
        noteStorageIssue(get, 'storage-write-failed');
      }
    }
    try {
      await setStoredValue(SESSION_ENVELOPE_KEY, request.session);
      if (!legacyFailed && (_storageIssue === 'storage-write-failed' || _storageIssue === 'storage-unavailable')) noteStorageIssue(get, null);
    } catch { noteStorageIssue(get, 'storage-write-failed'); }
  } finally {
    _sessionWriteActive = false;
    request.resolve();
    const pending = _sessionWritePending;
    // When the barrier becomes active, its newest following snapshot becomes
    // the single replaceable pending write. Do not retain a second stale copy.
    _sessionWritePending = pending?.clearLegacy ? _sessionWriteAfterBarrier : null;
    _sessionWriteAfterBarrier = null;
    if (pending) {
      _sessionWriteActive = true;
      void runSessionWrite(get, pending);
    }
  }
}

function persistSession(get: () => PanelState, clearLegacy = false): Promise<void> {
  if (!hasSessionStorage()) {
    get().noteRuntimeEvent({ lastErrorCode: 'storage-unavailable' });
    // The diagnostic update must not start a missing-store retry loop.
    if (_sessionPersistTimer) { clearTimeout(_sessionPersistTimer); _sessionPersistTimer = null; }
    return Promise.resolve();
  }
  const state = get();
  const session = createSessionEnvelope({ ...state.session, entries: state.entries, runtime: state.runtimeHealth, updatedAt: Date.now() });
  return new Promise((resolve) => {
    const request = { session, clearLegacy, generation: _sessionRestoreGeneration, resolve };
    // One active write plus one replaceable pending snapshot prevents a busy stream
    // from retaining an unbounded chain of full envelopes behind a slow storage call.
    if (_sessionWriteActive) {
      if (request.clearLegacy) {
        // A clear is a barrier, never a replaceable ordinary snapshot. Any
        // snapshot that arrives after it waits on the far side of the barrier.
        _sessionWritePending?.resolve();
        _sessionWriteAfterBarrier?.resolve();
        _sessionWritePending = request;
        _sessionWriteAfterBarrier = null;
      } else if (_sessionWritePending?.clearLegacy) {
        _sessionWriteAfterBarrier?.resolve();
        _sessionWriteAfterBarrier = request;
      } else {
        _sessionWritePending?.resolve();
        _sessionWritePending = request;
      }
      return;
    }
    _sessionWriteActive = true;
    void runSessionWrite(get, request);
  });
}

let _rulesPersistTimer: ReturnType<typeof setTimeout> | null = null;

function persistRules(rules: TrafficRule[]): void {
  // Supersede any coalesced edit write so a stale snapshot can't land after this.
  if (_rulesPersistTimer) { clearTimeout(_rulesPersistTimer); _rulesPersistTimer = null; }
  void setStoredValue(TRAFFIC_RULES_KEY, rules)
    .catch(() => noteStorageIssue(usePanelStore.getState, 'storage-write-failed'));
  publishTrafficRules(rules);
}

// Editing a rule fires on every keystroke, and each one wrote all rules to
// chrome.storage and structured-cloned the whole set into the page — with a
// 100KB mock body that is 100KB per character. Coalesce the edit path; discrete
// actions (add, remove, toggle, import) still persist immediately.
function persistRulesDebounced(rules: TrafficRule[]): void {
  if (_rulesPersistTimer) clearTimeout(_rulesPersistTimer);
  _rulesPersistTimer = setTimeout(() => {
    _rulesPersistTimer = null;
    void setStoredValue(TRAFFIC_RULES_KEY, rules)
      .catch(() => noteStorageIssue(usePanelStore.getState, 'storage-write-failed'));
    publishTrafficRules(rules);
  }, 300);
}

function persistPanelPreferences(state: PanelState): void {
  void setStoredValue(REACT_PANEL_PREFERENCES_KEY, serializePanelPreferences(state))
    .catch(() => noteStorageIssue(usePanelStore.getState, 'storage-write-failed'));
}

export function selectedEntry(): XrayEntry | null {
  const { entries, selectedId } = usePanelStore.getState();
  return selectedId ? entries.find((entry) => entry.id === selectedId) || null : null;
}

export function getEntries(): XrayEntry[] {
  return [...usePanelStore.getState().entries];
}
