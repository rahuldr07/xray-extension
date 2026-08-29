import { create } from 'zustand';
import { evictEntries, pinnedAndSelected } from './models/entries';
import { setConsoleContext } from './runtime/consoleBridge';
import { getStoredValue, setStoredValue } from './runtime/storageBridge';
import {
  REACT_PANEL_PREFERENCES_KEY,
  applyPanelPreferences,
  serializePanelPreferences,
  type SerializedPanelPreferences,
} from './models/panelPersistence';
import { DEFAULT_PANEL_SETTINGS, normalizePanelSettings } from './models/panelSettings';
import { postToPageBridge, publishCaptureSettings, publishTrafficRules } from './runtime/captureConfig';
import { buildDriftIndex, detectDrift, noteDriftEntry } from './models/drift';
import { TRAFFIC_RULES_KEY, defaultRule, normalizeRule, normalizeRules } from './models/rules';
import { AI_SETTINGS_KEY, SESSION_ENTRIES_KEY, deserializeSessionEntries, serializeSessionEntries } from './models/sessionStore';
import type { ActiveTab, AiSettings, ApiDrawerPlacement, ApiGroupingMode, ApiQuickFilter, ConfirmationRequest, ConsoleEvent, ConsoleMiniTab, DetailTab, DetailView, NetworkFilter, PanelSettings, Snippet, SortField, SortOrder, TrafficRule, XrayEntry } from './types';

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
  networkFilter: NetworkFilter;
  searchQuery: string;
  apiSearchQuery: string;
  apiQuickFilter: ApiQuickFilter;
  apiGroupingMode: ApiGroupingMode;
  apiDetailOpen: boolean;
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
  consoleEvents: ConsoleEvent[];
  consoleDraft: string;
  snippets: Snippet[];
  rules: TrafficRule[];
  aiSettings: AiSettings;
  selectedId: string | null;
  expandedId: string | null;
  pinnedIds: Set<string>;
  exportOpen: boolean;
  settingsOpen: boolean;
  settingsSection: string;
  commandOpen: boolean;
  globalSearchOpen: boolean;
  replayEditorEntry: XrayEntry | null;
  explainEntry: XrayEntry | null;
  pendingConfirmation: ConfirmationRequest | null;
  settings: PanelSettings;
  toastMessage: string | null;
  setInitialized(value: boolean): void;
  setOpen(value: boolean): void;
  setDevtoolsMode(value: boolean): void;
  setActiveTab(tab: ActiveTab): void;
  setDetailView(view: DetailView): void;
  setDetailTab(tab: DetailTab): void;
  setConsoleMiniTab(tab: ConsoleMiniTab): void;
  setNetworkFilter(filter: NetworkFilter): void;
  setSearchQuery(query: string): void;
  setApiSearchQuery(query: string): void;
  setApiQuickFilter(filter: ApiQuickFilter): void;
  setApiGroupingMode(mode: ApiGroupingMode): void;
  setApiDetailOpen(value: boolean): void;
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
  restoreEntries(entries: XrayEntry[]): void;
  addRule(rule?: Partial<TrafficRule>): void;
  updateRule(id: string, patch: Partial<TrafficRule>): void;
  removeRule(id: string): void;
  toggleRule(id: string): void;
  setRules(rules: TrafficRule[]): void;
  setAiSettings(patch: Partial<AiSettings>): void;
  replayEntry(entry: XrayEntry, overrides?: Partial<XrayEntry>): void;
  openReplayEditor(entry: XrayEntry): void;
  closeReplayEditor(): void;
  openExplain(entry: XrayEntry): void;
  closeExplain(): void;
  clearConsole(): void;
  clearEntries(): void;
  addConsoleEvent(event: ConsoleEvent): void;
  setConsoleDraft(command: string): void;
  insertConsoleCommand(command: string): void;
  saveSnippet(snippet: { code: string; title?: string }): void;
  renameSnippet(id: string, title: string): void;
  removeSnippet(id: string): void;
  selectEntry(id: string | null, options?: { openDetail?: boolean }): void;
  toggleExpanded(id: string): void;
  setExportOpen(value: boolean): void;
  setSettingsOpen(value: boolean): void;
  openSettings(section: string): void;
  setCommandOpen(value: boolean): void;
  setGlobalSearchOpen(value: boolean): void;
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

export const usePanelStore = create<PanelState>((set, get) => ({
  initialized: false,
  open: false,
  devtoolsMode: false,
  activeTab: 'console',
  detailView: 'tree',
  detailTab: 'response',
  consoleMiniTab: 'network',
  networkFilter: 'all',
  searchQuery: '',
  apiSearchQuery: '',
  apiQuickFilter: 'all',
  apiGroupingMode: 'flat',
  apiDetailOpen: false,
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
  consoleEvents: [],
  consoleDraft: '',
  snippets: [{ id: 'snip_default', title: 'Response schema', code: 'schema(res)' }],
  rules: [],
  aiSettings: DEFAULT_AI_SETTINGS,
  selectedId: null,
  expandedId: null,
  pinnedIds: new Set<string>(),
  exportOpen: false,
  settingsOpen: false,
  settingsSection: 'general',
  commandOpen: false,
  globalSearchOpen: false,
  replayEditorEntry: null,
  explainEntry: null,
  pendingConfirmation: null,
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
  setConsoleMiniTab: (tab) => { set({ consoleMiniTab: tab }); persistPanelPreferences(get()); },
  setNetworkFilter: (filter) => { set({ networkFilter: filter }); persistPanelPreferences(get()); },
  setSearchQuery: (query) => set({ searchQuery: query }),
  setApiSearchQuery: (query) => { set({ apiSearchQuery: query }); persistPanelPreferences(get()); },
  setApiQuickFilter: (filter) => { set({ apiQuickFilter: filter }); persistPanelPreferences(get()); },
  setApiGroupingMode: (mode) => { set({ apiGroupingMode: mode }); persistPanelPreferences(get()); },
  setApiDetailOpen: (value) => { set({ apiDetailOpen: value }); persistPanelPreferences(get()); },
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
    for (const raw of batch) {
      if (!raw) continue;
      const id = raw.id || 'entry_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
      const drift = detectDrift({ ...raw, id }, entries, driftIndex);
      const normalized: XrayEntry = { ...raw, id, ...(drift.driftFromId ? { driftFromId: drift.driftFromId } : {}) };
      entries.push(normalized);
      noteDriftEntry(driftIndex, normalized);
      added.push(entryToConsoleEvent(normalized));
    }
    const evicted = evictEntries(entries, maxEntries, pinnedAndSelected(state));
    const next: Partial<PanelState> = { entries: evicted.entries };
    if (evicted.dropped.size) {
      const pinnedIds = new Set([...state.pinnedIds].filter((id) => !evicted.dropped.has(id)));
      if (pinnedIds.size !== state.pinnedIds.size) next.pinnedIds = pinnedIds;
    }
    if (state.recording) {
      next.consoleEvents = [...state.consoleEvents, ...added].slice(-MAX_CONSOLE_EVENTS);
    } else {
      _pausedEvents = [..._pausedEvents, ...added].slice(-MAX_CONSOLE_EVENTS);
      next.pausedCount = _pausedEvents.length;
    }
    set(next);
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
      let changed = false;
      const entries = get().entries.map((entry) => {
        const merge = patches.get(entry.id);
        if (!merge) return entry;
        changed = true;
        return { ...entry, ...merge };
      });
      if (!changed) return;
      set({ entries });
      scheduleSessionPersist(get);
    }, 50);
  },
  restoreEntries: (restored) => {
    if (!restored.length) return;
    const maxEntries = Math.max(50, Math.min(5000, Number(get().settings.maxEntries) || MAX_ENTRIES));
    const existing = new Set(get().entries.map((entry) => entry.id));
    const fresh = restored.filter((entry) => !existing.has(entry.id));
    // Reserve room for the incoming entries BEFORE trimming. This was
    // `[...fresh, ...entries].slice(-maxEntries)`, which trims from the front — and the
    // imported entries are at the front — so importing into a session already at the cap
    // (1000 by default, minutes of traffic on a busy app) kept exactly the entries that
    // were already there and dropped every imported one, while the modal reported
    // "Imported 40 HAR entries."
    //
    // Note this list is ordered newest-first, the opposite of the ingest path, which is
    // why it cannot just call evictEntries on the concatenation.
    const freshKept = fresh.slice(-maxEntries);
    const room = Math.max(0, maxEntries - freshKept.length);
    const existingKept = evictEntries(get().entries, room, pinnedAndSelected(get())).entries;
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
    const restoredEvents = fresh.filter((entry) => survivingIds.has(entry.id)).map(entryToConsoleEvent);
    set({
      entries: merged,
      consoleEvents: [...restoredEvents, ...get().consoleEvents].slice(-MAX_CONSOLE_EVENTS),
    });
  },
  addRule: (rule) => {
    const created = normalizeRule({ ...defaultRule(), ...(rule || {}) });
    const rules = [...get().rules, created].slice(0, 50);
    set({ rules, activeTab: 'rules' });
    persistRules(rules);
  },
  updateRule: (id, patch) => {
    const rules = get().rules.map((rule) => rule.id === id ? normalizeRule({ ...rule, ...patch, match: { ...rule.match, ...(patch.match || {}) }, action: { ...rule.action, ...(patch.action || {}) } }) : rule);
    set({ rules });
    persistRulesDebounced(rules);
  },
  removeRule: (id) => {
    const rules = get().rules.filter((rule) => rule.id !== id);
    set({ rules });
    persistRules(rules);
  },
  toggleRule: (id) => {
    const rules = get().rules.map((rule) => rule.id === id ? { ...rule, enabled: !rule.enabled } : rule);
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
    void setStoredValue(AI_SETTINGS_KEY, aiSettings);
  },
  replayEntry: (entry, overrides) => {
    const source = { ...entry, ...(overrides || {}) };
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
  },
  openReplayEditor: (entry) => set({ replayEditorEntry: entry }),
  closeReplayEditor: () => set({ replayEditorEntry: null }),
  openExplain: (entry) => set({ explainEntry: entry }),
  closeExplain: () => set({ explainEntry: null }),
  // Clearing the stream keeps the selected request: the prompt's eval context
  // (res/$curl) still targets it, so dropping the selection here desynced the
  // chip from what the runtime actually evaluated against.
  clearConsole: () => {
    _pausedEvents = [];
    set({ consoleEvents: [], expandedId: null, pausedCount: 0 });
  },
  clearEntries: () => {
    _pausedEvents = [];
    setConsoleContext(null);
    set({ entries: [], consoleEvents: [], selectedId: null, expandedId: null, pinnedIds: new Set<string>(), pausedCount: 0 });
    persistPanelPreferences(get());
    void setStoredValue(SESSION_ENTRIES_KEY, []);
  },
  addConsoleEvent: (event) => {
    const events = [...get().consoleEvents, event].slice(-MAX_CONSOLE_EVENTS);
    set({
      consoleEvents: events,
      expandedId: event.type === 'result' || event.type === 'error' ? event.id : get().expandedId,
    });
  },
  setConsoleDraft: (command) => set({ consoleDraft: command }),
  insertConsoleCommand: (command) => set({ consoleDraft: command, activeTab: 'console' }),
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
    });
  },
  toggleExpanded: (id) => set({ expandedId: get().expandedId === id ? null : id }),
  setExportOpen: (value) => set({ exportOpen: value }),
  setSettingsOpen: (value) => set({ settingsOpen: value }),
  openSettings: (section) => set({ settingsSection: section, settingsOpen: true }),
  setCommandOpen: (value) => set({ commandOpen: value }),
  setGlobalSearchOpen: (value) => set({ globalSearchOpen: value }),
  updateSettings: (patch) => {
    const settings = normalizePanelSettings({ ...get().settings, ...patch });
    // Lowering maxEntries must not silently discard the entry the user pinned or is
    // looking at right now.

    set({
      settings,
      detailView: patch.defaultDetailView ? settings.defaultDetailView : get().detailView,
      entries: evictEntries(get().entries, settings.maxEntries, pinnedAndSelected(get())).entries,
    });
    publishCaptureSettings(settings);
    persistPanelPreferences(get());
  },
  resetSettings: () => {
    const settings = DEFAULT_PANEL_SETTINGS;
    set({ settings, detailView: settings.defaultDetailView });
    publishCaptureSettings(settings);
    persistPanelPreferences(get());
  },
  requestConfirmation: (request) => set({
    pendingConfirmation: {
      id: request.id || 'confirm_' + Date.now().toString(36),
      title: request.title,
      message: request.message,
      confirmLabel: request.confirmLabel,
      cancelLabel: request.cancelLabel,
      tone: request.tone,
      onConfirm: request.onConfirm,
    },
  }),
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
    const [preferences, storedRules, aiSettings, sessionEntries] = await Promise.all([
      getStoredValue<SerializedPanelPreferences>(REACT_PANEL_PREFERENCES_KEY, {}),
      getStoredValue<unknown>(TRAFFIC_RULES_KEY, []),
      getStoredValue<AiSettings | null>(AI_SETTINGS_KEY, null),
      getStoredValue<unknown>(SESSION_ENTRIES_KEY, []),
    ]);
    const restored = applyPanelPreferences(preferences);
    const rules = normalizeRules(storedRules);
    set({
      ...restored,
      rules,
      ...(aiSettings ? { aiSettings: { ...DEFAULT_AI_SETTINGS, ...aiSettings } } : {}),
    });
    const settings = usePanelStore.getState().settings;
    publishCaptureSettings(settings);
    publishTrafficRules(rules);
    const previousEntries = deserializeSessionEntries(sessionEntries);
    if (previousEntries.length && !usePanelStore.getState().entries.length) {
      usePanelStore.getState().restoreEntries(previousEntries);
    }
  },
}));

function scheduleSessionPersist(get: () => PanelState): void {
  if (_sessionPersistTimer) return;
  // Serializing the session copies up to 500 entries (bodies, frames) into one
  // storage write — at 1.5s a busy WebSocket kept a multi-MB write loop running
  // continuously, so batch a little longer; crash-loss window stays small.
  _sessionPersistTimer = setTimeout(() => {
    _sessionPersistTimer = null;
    try {
      void setStoredValue(SESSION_ENTRIES_KEY, serializeSessionEntries(get().entries));
    } catch {}
  }, 4000);
}

let _rulesPersistTimer: ReturnType<typeof setTimeout> | null = null;

function persistRules(rules: TrafficRule[]): void {
  // Supersede any coalesced edit write so a stale snapshot can't land after this.
  if (_rulesPersistTimer) { clearTimeout(_rulesPersistTimer); _rulesPersistTimer = null; }
  void setStoredValue(TRAFFIC_RULES_KEY, rules);
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
    void setStoredValue(TRAFFIC_RULES_KEY, rules);
    publishTrafficRules(rules);
  }, 300);
}

function persistPanelPreferences(state: PanelState): void {
  void setStoredValue(REACT_PANEL_PREFERENCES_KEY, serializePanelPreferences(state));
}

export function selectedEntry(): XrayEntry | null {
  const { entries, selectedId } = usePanelStore.getState();
  return selectedId ? entries.find((entry) => entry.id === selectedId) || null : null;
}

export function getEntries(): XrayEntry[] {
  return [...usePanelStore.getState().entries];
}
