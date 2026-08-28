// src/panel/models/entries.ts and the API network inspector wiring.

const assert = require('node:assert/strict');
const test = require('node:test');

const { read } = require('./helpers/source');

test('React preview models old API tab parity before live manifest switch', () => {
  const app = read('src/panel/App.tsx');
  const store = read('src/panel/store.ts');
  const entriesModel = read('src/panel/models/entries.ts');
  const entriesWorkspace = read('src/panel/components/api/EntriesWorkspace.tsx');
  const detailModel = read('src/panel/models/detail.ts');
  const exportModel = read('src/panel/models/export.ts');
  const preview = read('preview/ui-preview.html');

  assert.match(preview, /dist\/panel-ui\.js/);
  assert.match(app, /import \{ EntriesWorkspace \}/);
  assert.match(entriesWorkspace, /buildEntryListItems/);
  assert.match(entriesModel, /export function buildEntryListItems/);
  assert.match(entriesModel, /groupCount/);
  assert.match(entriesWorkspace, /togglePinned/);
  assert.match(entriesWorkspace, /toggleStatusFilter/);
  assert.match(entriesWorkspace, /toggleTypeFilter/);
  assert.match(entriesWorkspace, /setSort/);
  assert.match(detailModel, /export function detailValue/);
  assert.match(exportModel, /export type ExportFormat/);
  assert.match(store, /expandedGroups:\s*new Set<string>\(\)/);
  assert.match(store, /pinnedIds:\s*new Set<string>\(\)/);
  assert.doesNotMatch(app, /function EntriesWorkspace/);
  assert.doesNotMatch(app, /function ListControls/);
});

test('React API list parity logic is pure and covers grouping, filters, sorting, and pinning', () => {
  const entriesModel = read('src/panel/models/entries.ts');

  assert.match(entriesModel, /export interface EntryListOptions/);
  assert.match(entriesModel, /mode:\s*'api' \| 'logs'/);
  assert.match(entriesModel, /statusFilters:\s*ReadonlySet<string>/);
  assert.match(entriesModel, /typeFilters:\s*ReadonlySet<string>/);
  assert.match(entriesModel, /methodFilters\?:\s*ReadonlySet<string>/);
  assert.match(entriesModel, /expandedGroups:\s*ReadonlySet<string>/);
  assert.match(entriesModel, /pinnedIds:\s*ReadonlySet<string>/);
  assert.match(entriesModel, /entries\.filter\(mode === 'api' \? isApi : isLog\)/);
  assert.match(entriesModel, /matchesEntry\(entry, query\)/);
  assert.match(entriesModel, /methodFilters\.has\(String\(entry\.method \|\| 'GET'\)\.toUpperCase\(\)\)/);
  assert.match(entriesModel, /statusFilters\.has\(statusRange\(entry\)\)/);
  assert.match(entriesModel, /typeFilters\.has\(String\(entry\.source \|\| 'fetch'\)\.toLowerCase\(\)\)/);
  assert.match(entriesModel, /const groups = new Map<string, XrayEntry\[\]>\(\)/);
  assert.match(entriesModel, /key:\s*'api:' \+ groupKey/);
  // groups are ordered as units and emitted header+children contiguously — a
  // global row re-sort used to interleave unrelated groups between a parent
  // and its expanded children
  assert.match(entriesModel, /groupA\.entries\.some\(\(entry\) => pinnedIds\.has\(entry\.id\)\)/);
  assert.doesNotMatch(entriesModel, /return rows\.sort/);
});

test('React virtualized rows provide TanStack measurement indexes', () => {
  const entriesWorkspace = read('src/panel/components/api/EntriesWorkspace.tsx');
  const consoleWorkspace = read('src/panel/components/console/ConsoleWorkspace.tsx');

  assert.match(entriesWorkspace, /data-index=\{item\.index\}/);
  assert.match(consoleWorkspace, /data-index=\{item\.index\}/);
});

test('React API tab has premium request intelligence controls and mobile detail parity', () => {
  const entriesModel = read('src/panel/models/entries.ts');
  const entriesWorkspace = read('src/panel/components/api/EntriesWorkspace.tsx');
  const store = read('src/panel/store.ts');
  const styles = read('src/panel/styles.css');

  assert.match(entriesModel, /export interface ApiListSummary/);
  assert.match(entriesModel, /export function buildApiListSummary/);
  assert.match(entriesModel, /export function entryGroupStats/);
  assert.match(entriesWorkspace, /function ApiWorkspace/);
  assert.match(entriesWorkspace, /function ApiRequestRow/);
  assert.match(entriesWorkspace, /function RequestContextPane/);
  assert.match(entriesWorkspace, /function ApiDetailDrawer/);
  assert.match(entriesWorkspace, /entryGroupStats\(entry, entries\)/);
  assert.match(entriesWorkspace, /IconFilterOff/);
  assert.match(entriesWorkspace, /quickFilters/);
  assert.match(entriesWorkspace, /ApiFlagPills/);
  assert.match(entriesWorkspace, /xray-api-collection-pane/);
  assert.match(entriesWorkspace, /xray-request-context-pane/);
  assert.match(entriesWorkspace, /Captured Requests/);
  assert.match(entriesWorkspace, /Request tabs/);
  assert.match(entriesWorkspace, /xray-api-table-head/);
  assert.match(entriesWorkspace, /xray-api-detail-drawer/);
  assert.match(store, /clearApiFilters\(\): void/);
  assert.match(store, /clearApiFilters: \(\) =>/);
  assert.match(store, /apiQuickFilter:\s*'all'/);
  assert.match(store, /apiGroupingMode:\s*'flat'/);
  assert.match(store, /apiDetailOpen:\s*false/);
  assert.match(store, /methodFilters:\s*new Set<string>\(\)/);
  assert.match(styles, /\.xray-api-workspace/);
  // list track = minmax(min, --xray-api-split): the divider caps the width but
  // the list still yields to the detail pane's min when the panel shrinks, so
  // an outer resize can't starve the inner panes
  assert.match(styles, /grid-template-columns:\s*minmax\(260px,\s*var\(--xray-api-split,\s*440px\)\) minmax\(260px,\s*\.64fr\) minmax\(400px,\s*1\.55fr\)/);
  assert.match(styles, /\.xray-pane-divider/);
  assert.match(styles, /\.xray-request-context-pane/);
  assert.match(styles, /\.xray-api-row\.selected/);
  assert.match(styles, /\.xray-api-detail-drawer/);
  assert.match(styles, /\.xray-api-flag\.error/);
  assert.match(styles, /\.xray-entry-duration/);
});

test('React API network inspector models quick filters, flags, groups, and drawer state', () => {
  const types = read('src/panel/types.ts');
  const entriesModel = read('src/panel/models/entries.ts');
  const persistence = read('src/panel/models/panelPersistence.ts');
  const entriesWorkspace = read('src/panel/components/api/EntriesWorkspace.tsx');
  const detail = read('src/panel/components/detail/RequestDetail.tsx');
  const styles = read('src/panel/styles.css');

  assert.match(types, /export type ApiQuickFilter = 'all' \| 'errors' \| 'slow' \| 'repeated' \| 'pinned' \| 'large' \| 'empty'/);
  assert.match(types, /export type ApiGroupingMode = 'flat' \| 'endpoint'/);
  assert.match(entriesModel, /export type ApiEntryFlag = 'error' \| 'slow' \| 'repeated' \| 'large' \| 'empty' \| 'pinned'/);
  assert.match(entriesModel, /export function getEntryDomain/);
  assert.match(entriesModel, /export function getEntryContentType/);
  assert.match(entriesModel, /export function getEntryFlags/);
  assert.match(entriesModel, /export function matchesApiQuickFilter/);
  assert.match(entriesModel, /export function buildEndpointGroups/);
  assert.match(entriesModel, /apiGroupingMode === 'flat'/);
  assert.match(entriesModel, /matchesApiQuickFilter\(entry, apiQuickFilter, entries, pinnedIds, slowThresholdMs\)/);
  assert.match(entriesWorkspace, /Primary API filters/);
  assert.match(entriesWorkspace, /\['GET', 'POST'\]/);
  assert.match(entriesWorkspace, /toggleMethodFilter/);
  assert.match(entriesWorkspace, /Flat/);
  assert.match(entriesWorkspace, /Endpoint Groups/);
  // rows are proper listbox options with selection semantics for screen readers
  assert.match(entriesWorkspace, /role="option"/);
  assert.match(entriesWorkspace, /aria-selected=\{selected\}/);
  assert.match(entriesWorkspace, /onKeyDown/);
  assert.match(entriesWorkspace, /copyText\(String\(entry\.url \|\| path\)\)/);
  assert.match(entriesWorkspace, /setApiDetailOpen\(true\)/);
  assert.match(persistence, /apiQuickFilter:\s*state\.apiQuickFilter/);
  assert.match(persistence, /apiGroupingMode:\s*state\.apiGroupingMode/);
  assert.match(persistence, /apiDetailOpen:\s*state\.apiDetailOpen/);
  assert.match(persistence, /methodFilters:\s*Array\.from\(state\.methodFilters\)/);
  assert.match(detail, /xray-detail-tabs/);
  assert.match(detail, /operationGroups/);
  assert.match(detail, /Inspect/);
  assert.match(detail, /Transform/);
  assert.match(detail, /Copy/);
  assert.match(detail, /Send/);
  assert.match(detail, /Response tabs/);
  assert.match(detail, /View modes/);
  assert.match(detail, /xray-detail-footer/);
  assert.match(detail, /Console/);
  assert.match(detail, /Snippet/);
  assert.match(detail, /Copy/);
  assert.match(detail, /Export/);
  // panel-internal breakpoints are container-based (the docked panel's width
  // is independent of the window)
  assert.match(styles, /@container xray \(max-width: 420px\)/);
  assert.match(styles, /\.xray-detail-footer/);
  assert.match(styles, /\.xray-detail-footer \.xray-action-btn\s*\{[\s\S]*flex:\s*1 1 calc\(50% - 8px\)/);
  assert.doesNotMatch(entriesWorkspace, /dangerouslySetInnerHTML|innerHTML/);
});

test('React API summary uses the configured slow threshold instead of a hidden constant', () => {
  const entriesModel = read('src/panel/models/entries.ts');
  const entriesWorkspace = read('src/panel/components/api/EntriesWorkspace.tsx');

  assert.match(entriesModel, /buildApiListSummary\(entries: XrayEntry\[], pinnedIds: ReadonlySet<string>, slowThresholdMs = 500\)/);
  assert.match(entriesModel, /slow:\s*apis\.filter\(\(entry\) => duration\(entry\) >= slowThresholdMs\)\.length/);
  assert.match(entriesWorkspace, /settings\.slowThresholdMs/);
  assert.match(entriesWorkspace, /buildApiListSummary\(entries, pinnedIds, slowThresholdMs\)/);
});

test('drift detection is a pure module wired into the store', () => {
  const drift = read('src/panel/models/drift.ts');
  assert.match(drift, /export function schemaSignature/);
  assert.match(drift, /export function detectDrift/);
  assert.match(drift, /driftFromId/);
  const store = read('src/panel/store.ts');
  const entriesWorkspace = read('src/panel/components/api/EntriesWorkspace.tsx');
  // drift runs inside the batched ingest so a capture batch is one store commit,
  // against a per-batch index instead of a backwards scan per entry
  assert.match(drift, /export function buildDriftIndex/);
  assert.match(drift, /export function noteDriftEntry/);
  assert.match(store, /addEntries: \(batch\)/);
  assert.match(store, /const driftIndex = buildDriftIndex\(entries\);/);
  assert.match(store, /detectDrift\(\{ \.\.\.raw, id \}, entries, driftIndex\)/);
  assert.match(store, /noteDriftEntry\(driftIndex, normalized\);/);
  // the Drift chip counts from the entries themselves; the store keeps no
  // second copy that trimming would silently desync
  assert.match(entriesWorkspace, /entries\.reduce\(\(count, entry\) => count \+ \(entry\.driftFromId \? 1 : 0\), 0\)/);
  assert.doesNotMatch(store, /driftCount/);
});

test('toasts auto-dismiss and the request list supports keyboard navigation', () => {
  const shell = read('src/panel/components/shell/PanelShell.tsx');
  const workspace = read('src/panel/components/api/EntriesWorkspace.tsx');
  // toast auto-dismisses on a timer
  assert.match(shell, /setTimeout\(clearToast/);
  // arrow-key navigation + Enter to open, with virtualizer scroll-into-view
  assert.match(workspace, /function handleListKeyDown/);
  assert.match(workspace, /event\.key === 'ArrowDown'/);
  assert.match(workspace, /virtualizer\.scrollToIndex\(nextIndex/);
  assert.match(workspace, /role="listbox"/);
});
