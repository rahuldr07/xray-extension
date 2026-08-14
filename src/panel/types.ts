export type EntryType = 'api' | 'log';
export type ActiveTab = 'console' | 'api' | 'logs' | 'rules' | 'insights';
export type XrayAppMode = 'devtools' | 'hud' | 'window';
export type DetailView = 'tree' | 'grid' | 'raw' | 'schema' | 'diff' | 'viz' | 'waterfall' | 'headers';
export type PanelAccent = 'blue' | 'mauve' | 'teal' | 'green' | 'peach' | 'coral';
export type PanelTheme = 'operator' | 'dev-edition' | 'midnight' | 'light-lab' | 'claude' | 'custom';

export interface CustomTheme {
  // The four base colors are always present; a theme built from only these stays
  // fully coherent because every other token is derived from them.
  bg: string;
  surface: string;
  text: string;
  accent: string;
  // Optional per-token overrides for full color freedom (tweakcn-style). When a
  // field is omitted it falls back to the derived value, so partial themes are
  // valid and old 4-color themes keep working unchanged.
  surface2?: string;
  surface3?: string;
  subtext?: string;
  hint?: string;
  border?: string;
  green?: string;
  red?: string;
  yellow?: string;
  blue?: string;
  mauve?: string;
  teal?: string;
  peach?: string;
}
export type PanelFont = 'jetbrains' | 'cascadia' | 'iosevka' | 'system';
export type PanelDensity = 'compact' | 'comfortable' | 'spacious';
export type DetailTab = 'response' | 'request' | 'headers';
export type ConsoleMiniTab = 'network' | 'console';
export type NetworkFilter = 'all' | 'xhr' | 'fetch' | 'ws' | 'errors';
export type ApiQuickFilter = 'all' | 'errors' | 'slow' | 'repeated' | 'pinned' | 'large' | 'empty' | 'drift' | 'graphql' | 'ws' | 'mocked' | 'replayed';
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
  decryptStatus?: 'ok' | 'failed' | 'none';
  parseToken?: string | null;
  initiator?: string[];
  timing?: RequestTiming | null;
  graphql?: GraphqlInfo;
  wsState?: 'connecting' | 'open' | 'closed' | 'error';
  wsFrames?: WsFrame[];
  wsCloseCode?: number;
  mocked?: boolean;
  mockRuleId?: string;
  mockAction?: string;
  delayedByRuleMs?: number;
  replayed?: boolean;
  replayOf?: string | null;
  driftFromId?: string | null;
  imported?: boolean;
  // Decoded (never raw) JWT claims captured by the interceptor from sensitive
  // request headers before redaction.
  jwtLenses?: Array<{ source: string; header: unknown; payload: unknown }>;
  [key: string]: unknown;
}

export interface RequestTiming {
  startTime?: number;
  totalMs?: number;
  dnsMs?: number;
  connectMs?: number;
  tlsMs?: number;
  ttfbMs?: number;
  downloadMs?: number;
  transferSize?: number;
}

export interface GraphqlInfo {
  operationType: string;
  operationName: string;
  variables?: unknown;
}

export interface WsFrame {
  dir: 'in' | 'out';
  ts: number;
  preview: string;
  size: number;
}

export interface TrafficRuleMatch {
  url: string;
  method: string;
}

export interface TrafficRuleAction {
  type: 'mock' | 'delay' | 'fail' | 'passthrough';
  status: number;
  body: string;
  headers: Record<string, string>;
  delayMs: number;
}

export interface TrafficRule {
  id: string;
  label: string;
  enabled: boolean;
  match: TrafficRuleMatch;
  action: TrafficRuleAction;
}

export type AiProvider = 'anthropic' | 'openai' | 'custom';

export interface AiSettings {
  provider: AiProvider;
  model: string;
  apiKey: string;
  /**
   * Custom provider only. Either a complete chat-completions endpoint or a base URL —
   * `/chat/completions` is appended when the path does not already name one. Must be
   * https, except for localhost, so a local model server still works.
   */
  baseUrl: string;
  /** Custom provider only. Header carrying the key. Defaults to `authorization`. */
  authHeader: string;
  /** Custom provider only. Prefix before the key. Defaults to `Bearer `; blank sends it raw. */
  authPrefix: string;
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

export interface Snippet {
  id: string;
  title?: string;
  code: string;
}

export interface PanelSettings {
  captureFetch: boolean;
  captureXhr: boolean;
  captureWs: boolean;
  maxEntries: number;
  slowThresholdMs: number;
  verySlowThresholdMs: number;
  defaultDetailView: DetailView;
  compactRows: boolean;
  showHostInPath: boolean;
  accent: PanelAccent;
  theme: PanelTheme;
  customTheme: CustomTheme;
  font: PanelFont;
  density: PanelDensity;
  radius: number;
  glow: boolean;
  hacker: boolean;
  confirmDestructiveActions: boolean;
  /** Width (px) of the injected side panel; ignored in devtools/window/HUD modes. */
  panelWidth: number;
  /** Which edge the injected side panel docks to. */
  dockSide: DockSide;
  /** User-dragged width (px) of the API request-list pane; 0 = automatic. */
  apiSplit: number;
  /** User-dragged width (px) of the Logs list pane; 0 = automatic. */
  logsSplit: number;
}

export type DockSide = 'left' | 'right';

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
  addAll(entries: XrayEntry[]): void;
  update(patch: Partial<XrayEntry> & { id: string }): void;
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
    XRAY_Worker?: {
      init(): Promise<void>;
      isReady(): boolean;
      whenReady(): Promise<void>;
      addEntry(entry: XrayEntry): Promise<unknown>;
      search(query: string, entries: XrayEntry[]): Promise<XrayEntry[]>;
      computeStats(data: unknown): Promise<unknown>;
      computeDiff(a: unknown, b: unknown): Promise<unknown[]>;
      inferSchema(data: unknown): Promise<unknown>;
      detailAnalysis(current: unknown, previous?: unknown): Promise<unknown>;
    };
    __XRAY_focusTrapActive?: boolean;
    __XRAY_bridgeToken?: string | null;
  }
}

export {};
