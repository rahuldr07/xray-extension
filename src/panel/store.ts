import { create } from 'zustand';
import { setConsoleContext } from './runtime/consoleBridge';
import { getStoredValue, setStoredValue } from './runtime/storageBridge';
import {
  REACT_PANEL_PREFERENCES_KEY,
  applyPanelPreferences,
  serializePanelPreferences,
  type SerializedPanelPreferences,
} from './models/panelPersistence';
import { DEFAULT_PANEL_SETTINGS, normalizePanelSettings } from './models/panelSettings';
import { publishCaptureSettings } from './runtime/captureConfig';
import type { ActiveTab, ApiDrawerPlacement, ApiGroupingMode, ApiQuickFilter, ConfirmationRequest, ConsoleEvent, ConsoleMiniTab, DetailTab, DetailView, NetworkFilter, NotebookCell, PanelSettings, SortField, SortOrder, XrayEntry } from './types';

const MAX_ENTRIES = 1000;
const MAX_CONSOLE_EVENTS = 2000;

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
  sortField: SortField;
  sortOrder: SortOrder;
  recording: boolean;
  entries: XrayEntry[];
  consoleEvents: ConsoleEvent[];
  consoleDraft: string;
  notebookCells: NotebookCell[];
  selectedId: string | null;
  expandedId: string | null;
  pinnedIds: Set<string>;
  exportOpen: boolean;
  settingsOpen: boolean;
  commandOpen: boolean;
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
  setSort(field: SortField): void;
  setRecording(value: boolean): void;
  addEntry(entry: XrayEntry): void;
  clearConsole(): void;
  clearEntries(): void;
  addConsoleEvent(event: ConsoleEvent): void;
  setConsoleDraft(command: string): void;
  insertConsoleCommand(command: string): void;
  addNotebookCell(cell: Pick<NotebookCell, 'code'> & Partial<Pick<NotebookCell, 'title' | 'id'>>): void;
  updateNotebookCell(id: string, code: string): void;
  setNotebookCellResult(id: string, result: { output?: unknown; error?: string; running?: boolean }): void;
  selectEntry(id: string | null): void;
  toggleExpanded(id: string): void;
  setExportOpen(value: boolean): void;
  setSettingsOpen(value: boolean): void;
  setCommandOpen(value: boolean): void;
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
    message: String(entry.message ?? data.map((item) => typeof item === 'string' ? item : JSON.stringify(item)).join(' ')),
    args: data,
    entryId: entry.id,
  };
}

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
  sortField: 'timestamp',
  sortOrder: 'desc',
  recording: true,
  entries: [],
  consoleEvents: [],
  consoleDraft: '',
  notebookCells: [{ id: 'cell_default', title: 'Current response schema', code: 'schema(res)' }],
  selectedId: null,
  expandedId: null,
  pinnedIds: new Set<string>(),
  exportOpen: false,
  settingsOpen: false,
  commandOpen: false,
  pendingConfirmation: null,
  settings: DEFAULT_PANEL_SETTINGS,
  toastMessage: null,
  setInitialized: (value) => set({ initialized: value }),
  setOpen: (value) => {
    window.__XRAY_focusTrapActive = value;
    set({ open: value });
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
  clearApiFilters: () => {
    set({
      apiSearchQuery: '',
      apiQuickFilter: 'all',
      apiGroupingMode: 'flat',
      methodFilters: new Set<string>(),
      statusFilters: new Set<string>(),
      typeFilters: new Set<string>(),
      sortField: 'timestamp',
      sortOrder: 'desc',
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
  setSort: (field) => {
    const { sortField, sortOrder } = get();
    set({
      sortField: field,
      sortOrder: sortField === field && sortOrder === 'desc' ? 'asc' : 'desc',
    });
    persistPanelPreferences(get());
  },
  setRecording: (value) => { set({ recording: value }); persistPanelPreferences(get()); },
  addEntry: (entry) => {
    const id = entry.id || 'entry_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
    const normalized = { ...entry, id };
    const maxEntries = Math.max(50, Math.min(5000, Number(get().settings.maxEntries) || MAX_ENTRIES));
    const entries = [...get().entries, normalized].slice(-maxEntries);
    const next: Partial<PanelState> = { entries };
    if (get().recording) {
      next.consoleEvents = [...get().consoleEvents, entryToConsoleEvent(normalized)].slice(-MAX_CONSOLE_EVENTS);
    }
    set(next);
  },
  clearConsole: () => set({ consoleEvents: [], expandedId: null, selectedId: null }),
  clearEntries: () => {
    set({ entries: [], consoleEvents: [], selectedId: null, expandedId: null, pinnedIds: new Set<string>() });
    persistPanelPreferences(get());
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
  addNotebookCell: (cell) => set({
    notebookCells: [
      ...get().notebookCells,
      {
        id: cell.id || 'cell_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8),
        title: cell.title,
        code: cell.code,
      },
    ],
    activeTab: 'notebook',
  }),
  updateNotebookCell: (id, code) => set({
    notebookCells: get().notebookCells.map((cell) => cell.id === id ? { ...cell, code, error: undefined } : cell),
  }),
  setNotebookCellResult: (id, result) => set({
    notebookCells: get().notebookCells.map((cell) => cell.id === id ? { ...cell, ...result } : cell),
  }),
  selectEntry: (id) => {
    const entry = id ? get().entries.find((item) => item.id === id) || null : null;
    setConsoleContext(entry);
    set({
      selectedId: id,
      expandedId: id ? 'evt_' + id : null,
      detailView: entry?.type === 'api' ? get().settings.defaultDetailView : get().detailView,
      apiDetailOpen: entry?.type === 'api' ? true : get().apiDetailOpen,
    });
  },
  toggleExpanded: (id) => set({ expandedId: get().expandedId === id ? null : id }),
  setExportOpen: (value) => set({ exportOpen: value }),
  setSettingsOpen: (value) => set({ settingsOpen: value }),
  setCommandOpen: (value) => set({ commandOpen: value }),
  updateSettings: (patch) => {
    const settings = normalizePanelSettings({ ...get().settings, ...patch });
    set({
      settings,
      detailView: patch.defaultDetailView ? settings.defaultDetailView : get().detailView,
      entries: get().entries.slice(-settings.maxEntries),
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
    const preferences = await getStoredValue<SerializedPanelPreferences>(REACT_PANEL_PREFERENCES_KEY, {});
    const restored = applyPanelPreferences(preferences);
    set(restored);
    publishCaptureSettings(usePanelStore.getState().settings);
  },
}));

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
