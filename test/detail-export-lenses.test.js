// Request detail, export formats, smart operations, JWT/HAR lenses, and the JSON viewer.

const assert = require('node:assert/strict');
const test = require('node:test');

const { read } = require('./helpers/source');

test('React detail parity logic is typed outside the component tree', () => {
  const app = read('src/panel/App.tsx');
  const detailModel = read('src/panel/models/detail.ts');
  const requestDetail = read('src/panel/components/detail/RequestDetail.tsx');
  const entriesWorkspace = read('src/panel/components/api/EntriesWorkspace.tsx');
  const consoleWorkspace = read('src/panel/components/console/ConsoleWorkspace.tsx');
  const jsonView = read('src/panel/components/detail/JsonView.tsx');
  const emptyState = read('src/panel/components/common/EmptyState.tsx');

  assert.match(detailModel, /export const detailViews/);
  assert.match(detailModel, /export function detailValue/);
  assert.match(detailModel, /detailTab === 'request'/);
  assert.match(detailModel, /detailTab === 'headers'/);
  assert.match(detailModel, /requestHeaders/);
  assert.match(detailModel, /responseHeaders/);
  assert.match(detailModel, /export function gridRows/);
  assert.match(detailModel, /slice\(0, 200\)/);
  assert.match(detailModel, /Object\.keys\(row\)\.slice\(0, 20\)/);
  assert.match(detailModel, /export function vizSummary/);
  assert.match(detailModel, /schema\(value\)/);
  assert.match(requestDetail, /detailValue\(entry, detailTab\)/);
  assert.match(requestDetail, /gridRows\(value\)/);
  assert.match(requestDetail, /buildVizSpec\(value\)/);
  assert.match(jsonView, /safeStringify\(value\)/);
  assert.match(emptyState, /export function EmptyState/);
  assert.match(entriesWorkspace, /import \{ RequestDetail \}/);
  assert.match(consoleWorkspace, /import \{ RequestDetail \}/);
  assert.doesNotMatch(app, /function buildTypeScriptShape/);
  assert.doesNotMatch(app, /function RequestDetail/);
  assert.doesNotMatch(app, /function JsonView/);
});

test('React export parity logic is isolated and keeps old export formats', () => {
  const app = read('src/panel/App.tsx');
  const exportModel = read('src/panel/models/export.ts');
  const exportModal = read('src/panel/components/export/ExportModal.tsx');

  assert.match(exportModel, /export type ExportFormat =/);
  for (const format of ['json', 'curl', 'fetch', 'axios', 'schema', 'mock', 'typescript', 'zod', 'jest', 'msw', 'playwright', 'session-json', 'session-csv', 'session-har']) {
    assert.match(exportModel, new RegExp("'" + format + "'"));
  }
  // Playwright API test generation dispatches through exportText like the others
  assert.match(exportModel, /function buildPlaywright/);
  assert.match(exportModel, /buildPlaywright\(entry\)/);
  assert.match(exportModel, /@playwright\/test/);
  assert.match(exportModel, /export const exportFormats/);
  assert.match(exportModel, /export const exportGroups/);
  assert.match(exportModel, /export const exportMeta/);
  assert.match(exportModel, /export function buildTypeScriptShape/);
  assert.match(exportModel, /export function buildZodSchema/);
  assert.match(exportModel, /export function buildSessionCsv/);
  assert.match(exportModel, /export function buildSessionHar/);
  assert.match(exportModel, /export function filenameForExport/);
  assert.match(exportModel, /export function exportText/);
  assert.match(exportModel, /buildCurl\(entry\)/);
  assert.match(exportModel, /buildFetch\(entry\)/);
  assert.match(exportModel, /buildAxios\(entry\)/);
  assert.match(exportModel, /schema\(entryResponse\(entry\)\)/);
  assert.match(exportModel, /buildMock\?\.\(entry\)/);
  assert.match(exportModel, /safeStringify\(entry \? \{ entry, response: entryResponse\(entry\) \} : \{ entries \}/);
  assert.match(exportModel, /buildSessionCsv\(entries\)/);
  assert.match(exportModel, /buildSessionHar\(entries\)/);
  assert.match(exportModal, /exportText\(selectedForExport, entries, format\)/);
  assert.match(exportModal, /exportGroups\.map/);
  assert.match(exportModal, /exportMeta\[format\]/);
  assert.match(exportModal, /filenameForExport\(selectedForExport, format\)/);
  assert.match(exportModal, /copyText\(text\)/);
  assert.match(exportModel, /export function mimeForExport/);
  assert.match(exportModal, /downloadText\(filename, text, mimeForExport\(format\)\)/);
  assert.match(exportModal, /mode === 'selected'/);
  assert.match(exportModal, /mode === 'session'/);
  assert.match(exportModal, /insertConsoleCommand\(text\)/);
  assert.match(exportModal, /saveSnippet/);
  assert.match(exportModal, /showToast/);
  assert.doesNotMatch(exportModal, /dangerouslySetInnerHTML|innerHTML/);
  assert.match(app, /import \{ ExportModal \}/);
  assert.doesNotMatch(app, /type ExportFormat =/);
  assert.doesNotMatch(app, /function ExportModal/);
});

test('React response detail has native contextual operations, not a separate copilot surface', () => {
  const operations = read('src/panel/models/operations.ts');
  const detail = read('src/panel/components/detail/RequestDetail.tsx');
  const store = read('src/panel/store.ts');

  assert.match(operations, /export interface ResponseOperation/);
  assert.match(operations, /export function getResponseOperations/);
  assert.match(operations, /kind: 'view' \| 'console' \| 'snippet' \| 'copy' \| 'export' \| 'select'/);
  for (const label of ['Schema', 'Table', 'Visualize', 'Compare Previous', 'Mock', 'Copy cURL', 'Copy fetch', 'Send to Console', 'Save Snippet', 'Export', 'Related Errors', 'Similar Calls']) {
    assert.match(operations, new RegExp(label));
  }
  assert.match(detail, /insertConsoleCommand\('res'\)/);
  assert.match(detail, /saveSnippet\(/);
  assert.match(detail, /copyActiveValue/);
  assert.match(detail, /setExportOpen\(true\)/);
  assert.doesNotMatch(detail, /dangerouslySetInnerHTML/);
  assert.match(store, /insertConsoleCommand\(command: string\): void/);
  assert.match(store, /saveSnippet\(snippet:/);
});

test('React response detail renders native smart operations and bounded schema diff views', () => {
  const detail = read('src/panel/components/detail/RequestDetail.tsx');
  const operations = read('src/panel/models/operations.ts');

  // reads the fresh array via getState so streaming commits don't re-run the
  // operations pipeline while the drawer is open
  assert.match(detail, /getResponseOperations\(entry, usePanelStore\.getState\(\)\.entries\)/);
  assert.match(detail, /xray-smart-ops/);
  assert.match(detail, /xray-operation-groups/);
  assert.match(detail, /runOperation/);
  assert.match(detail, /setDetailView\(operation\.view\)/);
  assert.match(detail, /insertConsoleCommand\(operation\.command\)/);
  assert.match(detail, /saveSnippet\(\{ title:/);
  // copy payloads may be lazy (built on click) — 500KB copy-full strings are
  // no longer materialized on every render of the action bar
  assert.match(detail, /operation\.command \?\? operation\.lazyCommand\?\.\(\)/);
  assert.match(operations, /lazyCommand: \(\) => safeStringify\(response, 2, 500_000\)/);
  assert.match(detail, /setExportOpen\(true\)/);
  assert.match(detail, /detailView === 'schema'/);
  assert.match(detail, /detailView === 'diff'/);
  assert.match(operations, /view:\s*'schema'/);
  assert.match(operations, /view:\s*'diff'/);
  assert.doesNotMatch(detail, /dangerouslySetInnerHTML|innerHTML/);
});

test('JWT lens decodes base64url tokens found in headers and bodies', () => {
  const lenses = read('src/panel/models/lenses.ts');
  assert.match(lenses, /export function decodeJwt/);
  assert.match(lenses, /export function extractJwts/);
  assert.match(lenses, /const JWT_PATTERN = \/eyJ/);
  assert.match(lenses, /base64UrlDecode/);
  assert.match(lenses, /TextDecoder/);
  assert.match(lenses, /toIso\(payloadRecord\.exp\)/);
  // scans headers and bodies, request and response
  assert.match(lenses, /collectStrings\(entry\.requestHeaders/);
  assert.match(lenses, /collectStrings\(entry\.responseHeaders/);
  const detail = read('src/panel/components/detail/RequestDetail.tsx');
  assert.match(detail, /extractJwts\(entry\)/);
  assert.match(detail, /TokensView/);
});

test('HAR and session import parse into XRAY entries', () => {
  const importer = read('src/panel/models/import.ts');
  assert.match(importer, /export function parseImport/);
  // HAR detection via log.entries
  assert.match(importer, /log && Array\.isArray\(log\.entries\)/);
  assert.match(importer, /harEntryToXray/);
  // XRAY session detection via entries array
  assert.match(importer, /Array\.isArray\(sessionEntries\)/);
  assert.match(importer, /imported: true/);
  const exportModal = read('src/panel/components/export/ExportModal.tsx');
  assert.match(exportModal, /parseImport\(content\)/);
  assert.match(exportModal, /restoreEntries\(result\.entries\)/);
  assert.match(exportModal, /Import HAR \/ session/);
});

test('Visualize view renders a real chart, not fake metadata JSON', () => {
  const viz = read('src/panel/models/viz.ts');
  const detail = read('src/panel/components/detail/RequestDetail.tsx');
  assert.match(viz, /export function buildVizSpec/);
  assert.match(viz, /kind: 'bars' \| 'none'/);
  assert.match(viz, /function coerceRows/);
  assert.match(viz, /function frequency/);
  assert.match(detail, /buildVizSpec\(value\)/);
  assert.match(detail, /xray-viz-bars/);
  assert.match(detail, /xray-viz-fill/);
  // the old fake viz that rendered schema metadata as JSON is gone
  assert.doesNotMatch(detail, /engine: workerMeta\?\.engine/);
  assert.doesNotMatch(detail, /main-thread-fallback/);
});

test('Logs tab can lazily load full logged objects', () => {
  const bridge = read('src/panel/runtime/logObjects.ts');
  const logDetail = read('src/panel/components/detail/LogDetail.tsx');
  const workspace = read('src/panel/components/api/EntriesWorkspace.tsx');
  assert.match(bridge, /export async function fetchLogObject/);
  assert.match(bridge, /__XRAY_fetchLogObject__/);
  assert.match(bridge, /__XRAY_getLogObject__/);
  assert.match(logDetail, /export function LogDetail/);
  assert.match(logDetail, /fetchLogObject\(ref\)/);
  assert.match(logDetail, /Load full object/);
  assert.match(workspace, /<LogDetail entry=\{selected\}/);
});

test('JSON viewer is an interactive collapsible tree with expand/collapse all and a size fallback', () => {
  const jsonView = read('src/panel/components/detail/JsonView.tsx');
  const styles = read('src/panel/styles.css');

  // per-node expand/collapse via a recursive tree, not a flat <pre>
  assert.match(jsonView, /function TreeNode/);
  assert.match(jsonView, /role="tree"/);
  assert.match(jsonView, /aria-expanded=\{open\}/);
  assert.match(jsonView, /xray-json-chevron/);
  // expand-all / collapse-all
  assert.match(jsonView, /Expand all/);
  assert.match(jsonView, /Collapse all/);
  // syntax colors preserved (token classes still emitted)
  assert.match(jsonView, /xray-json-key/);
  assert.match(jsonView, /xray-json-string/);
  // huge payloads fall back to the flat text view instead of thousands of nodes
  assert.match(jsonView, /TREE_CHAR_BUDGET/);
  assert.match(jsonView, /safeStringify\(value\)/);
  assert.match(styles, /\.xray-json-tree/);
  assert.match(styles, /prefers-reduced-motion: reduce[\s\S]*\.xray-json-chevron/);
});
