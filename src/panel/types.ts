export type EntryType = 'api' | 'log';
export type ActiveTab = 'console' | 'api' | 'logs' | 'notebook' | 'insights' | 'settings';
export type XrayAppMode = 'devtools' | 'hud' | 'window';
export type DetailView = 'tree' | 'grid' | 'raw' | 'schema' | 'diff' | 'viz' | 'waterfall' | 'headers';
export type PanelAccent = 'blue' | 'mauve' | 'teal' | 'green' | 'peach';
export type DetailTab = 'response' | 'request' | 'headers';
export type ConsoleMiniTab = 'network' | 'console';
export type NetworkFilter = 'all' | 'xhr' | 'fetch' | 'ws' | 'errors';
export type ApiQuickFilter = 'all' | 'errors' | 'slow' | 'repeated' | 'pinned' | 'large' | 'empty';
export type ApiGroupingMode = 'flat' | 'endpoint';
export type ApiDrawerPlacement = 'right' | 'bottom';
export type SortField = 'timestamp' | 'method' | 'status' | 'url' | 'duration' | 'size';
export type SortOrder = 'asc' | 'desc';
export type ConsoleEventType = 'network' | 'log' | 'command' | 'result' | 'error' | 'system';
export type ConsoleLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

export interface XrayEntry {
  id: string;
  type: EntryType;
  timestamp?: number;
  method?: string;
  status?: number;
  url?: string;
  urlPath?: string;
  source?: string;
  duration?: number;
  size?: number;
  requestHeaders?: Record<string, unknown>;
  responseHeaders?: Record<string, unknown>;
  requestBody?: unknown;
  responseRaw?: unknown;
  responseDecrypted?: unknown;
  contentType?: string;
  logLevel?: ConsoleLevel;
  message?: string;
  args?: unknown[];
  logData?: unknown;
  [key: string]: unknown;
}

export interface ConsoleEvent {
  id: string;
  type: ConsoleEventType;
  level: ConsoleLevel;
  timestamp: number;
  message: string;
  args?: unknown[];
  data?: unknown;
  entryId?: string;
  commandId?: string;
  truncated?: boolean;
}

export interface NotebookCell {
  id: string;
  title?: string;
  code: string;
  output?: unknown;
  error?: string;
  running?: boolean;
}

export interface PanelSettings {
  captureFetch: boolean;
  captureXhr: boolean;
  maxEntries: number;
  slowThresholdMs: number;
  verySlowThresholdMs: number;
  defaultDetailView: DetailView;
  compactRows: boolean;
  showHostInPath: boolean;
  accent: PanelAccent;
  confirmDestructiveActions: boolean;
}

export interface ConfirmationRequest {
  id: string;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
  onConfirm(): void;
}

export interface XrayPanelInitOptions {
  mountEl?: HTMLElement;
  useShadow?: boolean;
  devtoolsMode?: boolean;
  clearMount?: boolean;
}

export interface XrayPanelApi {
  init(options?: XrayPanelInitOptions): Promise<void>;
  add(entry: XrayEntry): void;
  show(): void;
  hide(): void;
  toggle(): void;
  isOpen(): boolean;
  setActiveTab(tab: ActiveTab): void;
  selectEntry(id: string): void;
  selectEntryContext(id: string): void;
  getSelectedEntry(): XrayEntry | null;
  getEntries(): XrayEntry[];
  hasSelection(): boolean;
  openExport(): void;
  focusSearch(): void;
}

declare global {
  interface Window {
    XRAY_Panel: XrayPanelApi;
    XRAY_Console?: {
      init(): void;
      setContext(entry: XrayEntry | null): void;
      execute(code: string): Promise<{ type: string; result?: unknown; error?: { message?: string; stack?: string }; truncated?: boolean }>;
      navigateHistory(direction: 'up' | 'down'): string | null;
      getRuntimePreview?(): Record<string, unknown>;
    };
    XRAY_ConsoleHelpers?: {
      parseBody?(body: unknown): unknown;
      schema?(value: unknown): unknown;
      generateCurl?(entry: XrayEntry | null): string;
      generateFetch?(entry: XrayEntry | null): string;
      buildMock?(entry: XrayEntry | null): unknown;
      toTable?(data: unknown): { __xr_render: 'table'; data: unknown };
    };
    XRAY_Store?: {
      get<T = unknown>(key: string): Promise<T | null>;
      set<T = unknown>(key: string, value: T): Promise<void>;
    };
    XRAY_HUD?: {
      mount(): void;
      destroy(): void;
      collapse(): void;
      expand(): void;
      isVisible(): boolean;
      updateCount(n: number): void;
    };
    __XRAY_focusTrapActive?: boolean;
  }
}

export {};
