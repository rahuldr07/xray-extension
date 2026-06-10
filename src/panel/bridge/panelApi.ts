import { getEntries, selectedEntry, usePanelStore } from '../store';
import { initConsoleRuntime } from '../runtime/consoleBridge';
import type { ActiveTab, XrayEntry, XrayPanelApi, XrayPanelInitOptions } from '../types';

interface PanelApiDeps {
  initialize(options?: XrayPanelInitOptions): Promise<void>;
  getSearchRoot(): Document | ShadowRoot;
}

let consoleInitialized = false;

function ensureConsoleRuntime(): void {
  if (consoleInitialized) return;
  consoleInitialized = true;
  initConsoleRuntime();
}

function setOpenState(open: boolean): void {
  window.__XRAY_focusTrapActive = open;
  usePanelStore.getState().setOpen(open);
}

export function createPanelApi(deps: PanelApiDeps): XrayPanelApi {
  function ensureInit(): void {
    ensureConsoleRuntime();
    void deps.initialize();
  }

  return {
    async init(options?: XrayPanelInitOptions) {
      ensureConsoleRuntime();
      await deps.initialize(options || {});
    },
    add(entry: XrayEntry) {
      ensureInit();
      usePanelStore.getState().addEntry(entry);
    },
    show() {
      ensureInit();
      setOpenState(true);
    },
    hide() {
      setOpenState(false);
    },
    toggle() {
      ensureInit();
      const store = usePanelStore.getState();
      setOpenState(!store.open);
    },
    isOpen() {
      return usePanelStore.getState().open;
    },
    setActiveTab(tab: ActiveTab) {
      usePanelStore.getState().setActiveTab(tab);
    },
    selectEntry(id: string) {
      const entry = usePanelStore.getState().entries.find((item) => item.id === id);
      if (entry?.type === 'api') usePanelStore.getState().setActiveTab('api');
      if (entry?.type === 'log') usePanelStore.getState().setActiveTab('logs');
      usePanelStore.getState().selectEntry(id);
    },
    selectEntryContext(id: string) {
      usePanelStore.getState().selectEntry(id);
    },
    getSelectedEntry() {
      return selectedEntry();
    },
    getEntries() {
      return getEntries();
    },
    hasSelection() {
      return !!usePanelStore.getState().selectedId;
    },
    openExport() {
      ensureInit();
      usePanelStore.getState().setExportOpen(true);
    },
    focusSearch() {
      ensureInit();
      const input = deps.getSearchRoot().querySelector<HTMLInputElement>('.xray-input');
      input?.focus();
    },
  };
}
