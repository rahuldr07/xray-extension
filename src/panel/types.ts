export type EntryType = 'api' | 'log';
export type ActiveTab = 'console' | 'api' | 'logs' | 'rules' | 'insights' | 'sql';
export type XrayAppMode = 'devtools' | 'hud' | 'window';
export type DetailView = 'tree' | 'grid' | 'raw' | 'schema' | 'diff' | 'viz' | 'waterfall' | 'headers';
export type PanelAccent = 'blue' | 'mauve' | 'teal' | 'green' | 'peach' | 'coral';
// The preset lineup + custom. Retired preset ids are not themes: stored ones migrate on load
// (RETIRED_THEMES in models/panelSettings.ts).
export type PanelTheme = 'xray-dark' | 'xray-light' | 'github-dark' | 'github-light' | 'tokyo-night' | 'catppuccin-mocha' | 'dracula' | 'gruvbox-dark' | 'midnight' | 'custom';

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
export type RulesSubTab = 'rules' | 'experiments' | 'investigations';
export type NetworkFilter = 'all' | 'xhr' | 'fetch' | 'ws' | 'errors';
export type ApiQuickFilter = 'all' | 'errors' | 'slow' | 'repeated' | 'pinned' | 'large' | 'empty' | 'drift' | 'graphql' | 'ws' | 'mocked' | 'replayed';
export type ApiGroupingMode = 'flat' | 'endpoint';
export type ApiDrawerPlacement = 'right' | 'bottom';
export type SortField = 'timestamp' | 'method' | 'status' | 'url' | 'duration' | 'size';
export type SortOrder = 'asc' | 'desc';
export type ConsoleEventType = 'network' | 'log' | 'command' | 'result' | 'error' | 'system';
export type ConsoleLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

export type ExperimentStatus = 'draft' | 'armed' | 'running' | 'observed' | 'failed' | 'cancelled';

export interface ExperimentPlan {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: unknown;
  mockRuleId?: string;
  retargetAcknowledged?: boolean;
  preserveCapturedUrl?: boolean;
  timeoutMs?: number;
}

export type ExperimentCheck =
  | { type: 'status'; expected: number }
  | { type: 'response'; expected: boolean }
  | { type: 'structural'; mode: 'equal' | 'contains' | 'schema'; expected?: unknown };

export interface ExperimentCheckResult {
  type: ExperimentCheck['type'];
  passed: boolean;
  expected: unknown;
  actual: unknown;
  reason?: string;
}

export interface ExperimentEvaluation {
  passed: boolean;
  checks: ExperimentCheckResult[];
}

export interface ExperimentRecord {
  id: string;
  title: string;
  status: ExperimentStatus;
  baselineEntryId: string;
  plan: ExperimentPlan;
  checks: ExperimentCheck[];
  createdAt: number;
  updatedAt: number;
  startedAt?: number;
  observedEntryId?: string;
  checkResults?: ExperimentCheckResult[];
  errorCode?: string;
  errorReason?: string;
}
export type RuntimeHealthState = 'unknown' | 'healthy' | 'degraded' | 'unavailable';

export interface RuntimeHealth {
  health: RuntimeHealthState;
  captureRouteState: RuntimeHealthState;
  workerState: RuntimeHealthState;
  lastEventAt: number | null;
  lastErrorCode: string | null;
  acceptedCount: number;
  droppedCount: number;
}

export interface SessionSource {
  origin?: string;
  title?: string;
}

export interface SessionEnvelope {
  /**
   * 2 (spec J9): bodies are saved as text with truncation metadata, logs in the typed model. A session
   * saved before (1, or the bare `session_entries` array) is migrated once on restore.
   */
  schemaVersion: 2;
  sessionId: string;
  createdAt: number;
  updatedAt: number;
  source: SessionSource;
  entryCount: number;
  apiCount: number;
  logCount: number;
  lastEntryAt: number | null;
  entries: XrayEntry[];
  runtime: RuntimeHealth;
}

/**
 * A body text cut at capture or persistence (spec J6, J9): the kept prefix is `keptChars`
 * long. `totalChars` is the whole text's length when known; `totalBytes` is the body's
 * size when only a byte window of it was decoded (a large Blob or binary upload). Neither,
 * for a cut a session saved before J9 made without recording the total.
 */
export interface BodyTruncation {
  keptChars: number;
  totalChars?: number;
  totalBytes?: number;
}

/** What a captured request body was (spec J4); see content/interceptor.js _requestBodyFields. */
export type RequestBodyKind = 'text' | 'urlencoded' | 'formdata' | 'binary' | 'none';

/** Bytes that are not UTF-8 text: their size and their first 64 bytes as base64. */
export interface BinaryBodyDescriptor {
  binary: true;
  size: number;
  base64Prefix: string;
}

/** A ReadableStream request body: it cannot be read without consuming the page's stream. */
export interface StreamBodyDescriptor {
  binary: true;
  stream: true;
}

/** One FormData field: [name, value], a file described by its name, size and type. */
export type FormDataPair = [string, string | { file: string; size: number; type: string }];

/**
 * `requestBody` by `requestBodyKind`: the parsed text (any JSON value) or the text for
 * 'text'; the string for 'urlencoded'; FormDataPair[] for 'formdata'; a binary or
 * stream descriptor for 'binary'; null for 'none'.
 */
export type CapturedRequestBody = FormDataPair[] | BinaryBodyDescriptor | StreamBodyDescriptor | string | null;

export interface XrayEntry {
  id: string;
  type: EntryType;
  timestamp?: number;
  method?: string;
  status?: number;
  statusText?: string;
  url?: string;
  urlPath?: string;
  source?: string;
  duration?: number;
  size?: number;
  requestHeaders?: Record<string, unknown>;
  responseHeaders?: Record<string, unknown>;
  /** Parsed JSON for 'text' bodies (any value), else a CapturedRequestBody shape. */
  requestBody?: unknown;
  /**
   * The request body as sent (spec J4): verbatim for 'text' and 'urlencoded', a
   * `name=value` line rendering for 'formdata', absent for 'binary' and 'none'.
   * `requestBody` stays the parsed form for now.
   */
  requestBodyText?: string;
  requestBodyKind?: RequestBodyKind;
  requestTruncated?: BodyTruncation;
  responseRaw?: unknown;
  responseTruncated?: BodyTruncation;
  /** An XHR arraybuffer/blob response that is not UTF-8 (responseRaw is then null). */
  responseBinary?: BinaryBodyDescriptor;
  responseDecrypted?: unknown;
  /** A decrypted text the saved session cut (spec J9). */
  responseDecryptedTruncated?: BodyTruncation;
  /**
   * Restored from a session saved before J9 (spec J9): every save keeps what that session kept,
   * uncut, until the entry leaves (maxEntries, Clear). Set by migration only — capture and import drop it.
   */
  legacySession?: boolean;
  /** The capture kept the entry but lost part of it (an uncloneable value, an unreadable body). */
  captureDegraded?: boolean;
  /** responseRaw was rebuilt from a parsed value (XHR responseType 'json'), not the bytes received. */
  bodyReserialized?: boolean;
  /** console-capture handles for "Load full object". */
  objectRefs?: string[];
  /** The console argument each objectRefs handle belongs to (typed logs). */
  objectRefArgs?: number[];
  contentType?: string;
  logLevel?: ConsoleLevel;
  message?: string;
  args?: unknown[];
  /**
   * The console arguments. With `logArgCount` it is the typed log model (spec J7, see
   * models/logValue.ts): the single argument's value when there is one, else the list.
   * Without it, a pre-model shape (old sessions), decoded by models/logValue.ts.
   */
  logData?: unknown;
  /** How many arguments the console call had; marks logData as the typed log model. */
  logArgCount?: number;
  /**
   * Stored form only (spec J9, models/sessionStore.ts): a saved log's `logData` as JSON text, because
   * chrome.storage gives objects back with sorted keys. Restoring turns it back into `logData`; it never
   * appears on an entry the panel holds.
   */
  logDataJson?: string;
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
  /** Bytes on the wire (UTF-8 for text frames; UTF-16 units in sessions captured before J16). */
  size: number;
  /** Set when the preview is a cut of a longer text frame (spec J16). */
  truncated?: BodyTruncation;
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
  /** Page logs: consecutive logs merge (×N) only when their keys match (identical arguments). */
  repeatKey?: string;
  commandId?: string;
  truncated?: boolean;
  /** Command results: wall-clock run time of the evaluation, in ms. */
  durationMs?: number;
  /** Command results: the console variable (`temp1`…) the result was saved as. */
  variable?: string;
  /** Command results: the run was cancelled; any late result was discarded. */
  cancelled?: boolean;
  /** Command results: the evaluator's result type (`number`, `array`, `function`…). */
  resultType?: string;
  /** Command results: table()/toTable() returned the value (an out-of-band flag, spec J8). */
  resultRender?: 'table';
  /** Command errors: whether a request was selected when the command ran (C5 hint). */
  hasRequest?: boolean;
}

/** A request pinned as a Console variable (`a`…`f`). Panel-session only, never persisted. */
export interface ConsolePin {
  name: string;
  entryId: string;
}

/** What Clear console removes (spec S6): everything, only your commands, or only page logs. */
export type ConsoleClearScope = 'all' | 'commands' | 'page';

/** An in-flight console command: its id and when it started (Date.now()). */
export interface ConsoleRun {
  id: string;
  startedAt: number;
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
  /** True once the user has picked an accent; theme presets then stop overwriting it. */
  accentChosen: boolean;
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
  /** Set once the first-run introduction has been dismissed. */
  firstRunDismissed: boolean;
  /**
   * A theme-refresh notice is waiting to be seen: raised when loading settings from before the
   * theme refresh changed what the user sees (spec V2), cleared only when the user dismisses it.
   * Settings stored before the refresh lack the key, which is how they are told apart.
   */
  themeRefreshPending: boolean;
  /**
   * Frame the SQL client inline in the in-page HUD instead of opening it in its own window. Opt-in:
   * it makes sql.html web-accessible to pages (dynamic URL only), so any site could embed the client.
   */
  sqlInlineInHud: boolean;
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
      execute(code: string, options?: { readBody?(entry: XrayEntry, side: 'response' | 'request'): unknown }): Promise<{ type: string; result?: unknown; error?: { message?: string; stack?: string }; truncated?: boolean; render?: 'table' }>;
      navigateHistory(direction: 'up' | 'down'): string | null;
      getRuntimePreview?(): Record<string, unknown>;
      setVar?(name: string, value: unknown): void;
      getVar?(name: string): unknown;
      getScope?(): Record<string, unknown>;
      clearVariables?(): void;
      setPins?(pins: Record<string, XrayEntry>): void;
    };
    XRAY_ConsoleHelpers?: {
      parseBody?(body: unknown): unknown;
      schema?(value: unknown): unknown;
      generateCurl?(entry: XrayEntry | null): string;
      generateFetch?(entry: XrayEntry | null): string;
      buildMock?(entry: XrayEntry | null): unknown;
      toTable?(data: unknown): unknown[];
      reviveValue?(value: unknown): unknown;
    };
    XRAY_Store?: {
      get<T = unknown>(key: string, defaultVal?: T | null, strict?: boolean): Promise<T | null>;
      set<T = unknown>(key: string, value: T, strict?: boolean): Promise<void>;
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
    };
    __XRAY_focusTrapActive?: boolean;
    __XRAY_bridgeToken?: string | null;
  }
}

export {};
