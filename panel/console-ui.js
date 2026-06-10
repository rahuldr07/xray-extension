// panel/console-ui.js - XRAY DevTools-first console UI.
window.XRAY_ConsoleUI = (() => {
  'use strict';

  const MAX_EVENTS = 2000;
  const MAX_RENDERED_ROWS = 180;
  const MAX_INLINE_CHARS = 8000;
  const FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'errors', label: 'Errors' },
    { id: 'warnings', label: 'Warnings' },
    { id: 'logs', label: 'Logs' },
    { id: 'network', label: 'Network' },
    { id: 'commands', label: 'Commands' },
  ];
  const CONSOLE_TABS = [
    { id: 'network', label: 'Network', icon: 'network' },
    { id: 'console', label: 'Console', icon: 'terminal' },
  ];
  const NETWORK_FILTERS = [
    { id: 'all', label: 'All', icon: 'filter' },
    { id: 'xhr', label: 'XHR', icon: 'arrow-up-right' },
    { id: 'fetch', label: 'Fetch', icon: 'arrow-down-left' },
    { id: 'ws', label: 'WS', icon: 'refresh' },
    { id: 'errors', label: 'Errors', icon: 'circle-x' },
  ];

  let _root = null;
  let _dom = {};
  let _events = [];
  let _expanded = new Set();
  let _filter = 'all';
  let _recording = true;
  let _consoleTab = 'network';
  let _networkFilter = 'all';
  let _searchQuery = '';
  let _selectedEventId = null;
  let _activeContext = null;
  let _cells = [];
  let _renderQueued = false;
  let _renderStickToBottom = false;
  let _notebookBuilt = false;

  let EditorState, EditorView, lineNumbers, drawSelection, dropCursor;
  let highlightActiveLine, highlightSpecialChars, defaultKeymap, history, historyKeymap;
  let indentWithTab, javascript, syntaxHighlighting, HighlightStyle, tags;
  let autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap;
  let indentOnInput, bracketMatching, keymap;

  function _loadCM() {
    if (!window.CM) return false;
    ({
      EditorState, EditorView, keymap, lineNumbers, drawSelection, dropCursor,
      highlightActiveLine, highlightSpecialChars, defaultKeymap, history, historyKeymap,
      indentWithTab, javascript, syntaxHighlighting, HighlightStyle, t: tags,
      autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap,
      indentOnInput, bracketMatching,
    } = window.CM);
    return true;
  }

  function _injectCSS() {
    if (_root.querySelector?.('style[data-xr-console-ui]')) return;
    const style = document.createElement('style');
    style.setAttribute('data-xr-console-ui', '1');
    style.textContent = `
.xr-console-pane {
  display: none;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  background: var(--xr-bg);
  overflow: hidden;
}
.xr-console-pane.xr-active { display: flex; }
.xr-console-shell {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--xr-bg);
  color: var(--xr-text);
}
.xr-console-topbar {
  display: flex;
  align-items: stretch;
  min-height: 34px;
  border-bottom: 1px solid var(--xr-border);
  background: #141423;
  flex-shrink: 0;
}
.xr-console-mini-tabs {
  display: flex;
  min-width: 0;
}
.xr-console-mini-tab {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 34px;
  padding: 0 18px;
  border: 0;
  border-right: 1px solid rgba(63,63,70,.5);
  border-bottom: 2px solid transparent;
  color: var(--xr-muted);
  background: transparent;
  cursor: pointer;
  font: 700 11px/1 'JetBrains Mono', monospace;
  transition: background .15s ease, color .15s ease, border-color .15s ease;
}
.xr-console-mini-tab:hover {
  color: var(--xr-text);
  background: rgba(255,255,255,.035);
}
.xr-console-mini-tab.xr-active {
  color: #93c5fd;
  border-bottom-color: #60a5fa;
  background: rgba(96,165,250,.08);
}
.xr-console-tab-icon {
  width: 17px;
  height: 17px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  opacity: .85;
}
.xr-icon {
  width: 1em;
  height: 1em;
  display: inline-block;
  flex-shrink: 0;
  color: currentColor;
  stroke: currentColor;
  fill: none;
  vertical-align: -0.125em;
}
.xr-console-mini-tab .xr-icon { font-size: 17px; }
.xr-console-action-btn .xr-icon { font-size: 15px; }
.xr-network-chip .xr-icon { font-size: 14px; }
.xr-network-search-icon .xr-icon { font-size: 15px; }
.xr-console-row-icon .xr-icon,
.xr-console-disclosure .xr-icon { font-size: 15px; }
.xr-console-prompt-symbol .xr-icon { font-size: 16px; }
.xr-console-run .xr-icon { font-size: 13px; }
.xr-console-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  padding: 0 8px;
}
.xr-console-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 28px;
  padding: 0 12px;
  border: 1px solid rgba(113,113,122,.7);
  border-radius: 7px;
  color: var(--xr-text);
  background: rgba(24,24,37,.86);
  cursor: pointer;
  font: 800 11px/1 'JetBrains Mono', monospace;
  white-space: nowrap;
  transition: background .15s ease, border-color .15s ease, transform .15s ease;
}
.xr-console-action-btn:hover {
  border-color: rgba(148,163,184,.9);
  background: rgba(39,39,54,.95);
  transform: translateY(-1px);
}
.xr-console-action-btn.xr-recording .xr-icon-record {
  background: #f8fafc;
  color: #f8fafc;
  filter: drop-shadow(0 0 4px rgba(255,255,255,.12));
}
.xr-console-action-btn.xr-paused {
  color: var(--xr-yellow, #eab308);
}
.xr-console-kebab {
  width: 30px;
  padding: 0;
  justify-content: center;
}
.xr-network-filterbar {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) auto;
  align-items: center;
  gap: 8px;
  padding: 10px 10px 8px;
  border-bottom: 1px solid rgba(63,63,70,.55);
  background: #171728;
  flex-shrink: 0;
}
.xr-network-search-wrap {
  position: relative;
  min-width: 0;
}
.xr-network-search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--xr-muted);
  pointer-events: none;
  font: 900 12px/1 'JetBrains Mono', monospace;
}
.xr-network-search {
  width: 100%;
  height: 40px;
  min-width: 0;
  padding: 0 12px 0 34px;
  border: 1px solid rgba(71,85,105,.75);
  border-radius: 7px;
  outline: none;
  color: var(--xr-text);
  background: rgba(39,39,42,.72);
  font: 700 13px/1 'JetBrains Mono', monospace;
}
.xr-network-search:focus {
  border-color: rgba(96,165,250,.8);
  box-shadow: 0 0 0 1px rgba(96,165,250,.35);
}
.xr-network-filterchips {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
}
.xr-network-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 36px;
  padding: 0 15px;
  border: 1px solid rgba(113,113,122,.78);
  border-radius: 8px;
  color: var(--xr-text);
  background: #151525;
  cursor: pointer;
  font: 800 11px/1 'JetBrains Mono', monospace;
  white-space: nowrap;
  transition: background .15s ease, border-color .15s ease, color .15s ease;
}
.xr-network-chip:hover,
.xr-network-chip.xr-active {
  color: #fff;
  border-color: rgba(147,197,253,.75);
  background: rgba(30,41,59,.92);
}
.xr-network-panel {
  min-height: 0;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(63,63,70,.6);
  background: #171728;
}
.xr-network-head,
.xr-network-line {
  display: grid;
  grid-template-columns: 52px 48px minmax(170px, 1fr) 90px 62px 74px;
  align-items: center;
  gap: 0;
}
.xr-network-head {
  height: 24px;
  padding: 0 10px;
  color: #818cf8;
  text-transform: uppercase;
  letter-spacing: .08em;
  font: 800 9px/1 'JetBrains Mono', monospace;
}
.xr-network-body {
  max-height: min(34vh, 260px);
  overflow: auto;
}
.xr-network-line {
  min-height: 26px;
  padding: 0 10px;
  border-top: 1px solid transparent;
  color: var(--xr-text);
  cursor: pointer;
  font: 700 10.5px/1.2 'JetBrains Mono', monospace;
}
.xr-network-line:hover {
  background: rgba(255,255,255,.035);
}
.xr-network-line.xr-selected {
  background: rgba(96,165,250,.13);
  box-shadow: inset 2px 0 0 #60a5fa;
}
.xr-network-line.xr-expanded {
  border-top-color: rgba(96,165,250,.18);
}
.xr-network-method {
  color: #a7f3d0;
  text-transform: uppercase;
}
.xr-network-method.xr-post { color: #fde68a; }
.xr-network-method.xr-put { color: #f9a8d4; }
.xr-network-method.xr-del,
.xr-network-method.xr-delete { color: #fb7185; }
.xr-network-status {
  color: #86efac;
}
.xr-network-status.xr-warn { color: #fde68a; }
.xr-network-status.xr-error { color: #fb7185; }
.xr-network-path {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #a5b4fc;
}
.xr-network-timing {
  display: grid;
  grid-template-columns: minmax(26px, 1fr) auto;
  align-items: center;
  gap: 5px;
  color: #bfdbfe;
}
.xr-network-bar-track {
  height: 3px;
  background: rgba(148,163,184,.22);
  border-radius: 999px;
  overflow: hidden;
}
.xr-network-bar {
  height: 100%;
  min-width: 5px;
  border-radius: 999px;
  background: #93c5fd;
}
.xr-network-line.xr-slow .xr-network-bar { background: #fde68a; }
.xr-network-line.xr-error .xr-network-bar { background: #f472b6; }
.xr-network-size,
.xr-network-time {
  color: var(--xr-muted);
}
.xr-network-detail {
  padding: 8px 10px 10px 108px;
  border-top: 1px solid rgba(63,63,70,.45);
  background: #151525;
}
.xr-network-empty {
  min-height: 84px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--xr-muted);
  font: 700 11px/1 'JetBrains Mono', monospace;
}
.xr-console-stream {
  min-height: 0;
  flex: 1;
  overflow: auto;
  background: #151525;
}
.xr-console-stream .xr-console-row {
  min-height: 28px;
  background: transparent;
}
.xr-console-stream .xr-console-row:nth-child(even) {
  background: rgba(255,255,255,.015);
}
.xr-console-tab-panel {
  padding: 12px;
  color: var(--xr-text);
}
.xr-console-snippets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.xr-console-statusbar {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 22px;
  padding: 0 10px;
  border-top: 1px solid rgba(63,63,70,.55);
  color: var(--xr-muted);
  background: #171728;
  font: 700 10px/1 'JetBrains Mono', monospace;
  flex-shrink: 0;
}
.xr-console-status-spacer { flex: 1; }
.xr-console-status-ok { color: #86efac; }
.xr-console-status-error { color: #f472b6; }
.xr-console-status-slow { color: #fde68a; }
.xr-console-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 30px;
  padding: 4px 8px;
  border-bottom: 1px solid var(--xr-border);
  background: var(--xr-bg2);
  flex-shrink: 0;
  overflow-x: auto;
}
.xr-console-filter-btn,
.xr-console-tool-btn {
  height: 22px;
  padding: 0 7px;
  border: 1px solid transparent;
  border-radius: var(--xr-radius-sm, 4px);
  color: var(--xr-muted);
  background: transparent;
  font: 600 10.5px/1 var(--xr-font, inherit);
  cursor: pointer;
  white-space: nowrap;
  transition: background .15s ease, color .15s ease, border-color .15s ease;
}
.xr-console-filter-btn:hover,
.xr-console-tool-btn:hover {
  color: var(--xr-text);
  background: var(--xr-bg3);
}
.xr-console-filter-btn.xr-active {
  color: var(--xr-text);
  border-color: var(--xr-border);
  background: var(--xr-surface);
}
.xr-console-tool-btn {
  margin-left: 2px;
  border-color: var(--xr-border);
  background: var(--xr-bg);
}
.xr-console-spacer { flex: 1; min-width: 8px; }
.xr-console-context-chip {
  display: inline-flex;
  align-items: center;
  max-width: 280px;
  height: 22px;
  padding: 0 8px;
  border: 1px solid var(--xr-border);
  border-radius: 999px;
  color: var(--xr-muted);
  background: var(--xr-bg);
  font: 600 10px/1 'JetBrains Mono', monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.xr-console-context-chip.xr-selected {
  color: var(--xr-text);
  border-color: rgba(96,165,250,.55);
  background: rgba(59,130,246,.12);
  box-shadow: inset 0 0 0 1px rgba(59,130,246,.12);
}
.xr-console-scroll {
  min-height: 0;
  flex: 1;
  overflow: auto;
  background: var(--xr-bg);
}
.xr-console-empty {
  height: 100%;
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--xr-muted);
  font-size: 11px;
}
.xr-console-trim-note {
  padding: 5px 10px;
  border-bottom: 1px solid var(--xr-border);
  color: var(--xr-muted);
  background: var(--xr-bg2);
  font: 500 10px/1.4 'JetBrains Mono', monospace;
}
.xr-console-row {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr) auto;
  align-items: start;
  gap: 6px;
  min-height: 28px;
  padding: 4px 8px;
  border-bottom: 1px solid rgba(63,63,70,.38);
  color: var(--xr-text);
  font: 500 11.5px/1.45 'JetBrains Mono', monospace;
}
.xr-console-row:hover { background: var(--xr-bg2); }
.xr-console-row.xr-error { color: var(--xr-red, #ef4444); }
.xr-console-row.xr-warn { color: var(--xr-yellow, #eab308); }
.xr-console-row.xr-network { color: var(--xr-text); }
.xr-console-row.xr-command { color: var(--xr-purple, #c084fc); }
.xr-console-row.xr-expanded {
  background: rgba(255,255,255,.035);
}
.xr-console-row.xr-selected {
  background: rgba(59,130,246,.12);
  box-shadow: inset 2px 0 0 var(--xr-accent, #60a5fa);
}
.xr-console-row.xr-selected:hover {
  background: rgba(59,130,246,.16);
}
.xr-console-row.xr-selected .xr-console-message-main {
  color: var(--xr-text);
  font-weight: 750;
}
.xr-console-row.xr-selected .xr-console-chip:first-child {
  color: var(--xr-accent, #60a5fa);
  border-color: rgba(96,165,250,.55);
  background: rgba(59,130,246,.12);
}
.xr-console-row-icon {
  width: 18px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--xr-muted);
  user-select: none;
}
.xr-console-disclosure {
  width: 18px;
  height: 20px;
  border: 0;
  padding: 0;
  border-radius: 3px;
  color: var(--xr-muted);
  background: transparent;
  cursor: pointer;
  font: 700 10px/1 'JetBrains Mono', monospace;
}
.xr-console-disclosure:hover {
  color: var(--xr-text);
  background: var(--xr-bg3);
}
.xr-console-message {
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 5px;
  word-break: break-word;
}
.xr-console-message-main {
  min-width: 0;
  white-space: pre-wrap;
}
.xr-console-meta {
  color: var(--xr-muted);
  font-size: 10px;
  white-space: nowrap;
  padding-top: 1px;
}
.xr-console-chip {
  display: inline-flex;
  align-items: center;
  height: 17px;
  padding: 0 5px;
  border: 1px solid var(--xr-border);
  border-radius: 4px;
  color: var(--xr-muted);
  background: var(--xr-surface);
  font: 700 9px/1 'JetBrains Mono', monospace;
}
.xr-console-chip.xr-ok { color: var(--xr-green, #22c55e); border-color: rgba(34,197,94,.35); }
.xr-console-chip.xr-warn { color: var(--xr-yellow, #eab308); border-color: rgba(234,179,8,.35); }
.xr-console-chip.xr-error { color: var(--xr-red, #ef4444); border-color: rgba(239,68,68,.35); }
.xr-console-row-detail {
  grid-column: 2 / 4;
  min-width: 0;
  margin: 4px 0 2px;
  padding: 8px;
  border: 1px solid var(--xr-border);
  border-radius: var(--xr-radius-md, 6px);
  background: var(--xr-bg2);
  color: var(--xr-text);
  overflow: auto;
  max-height: 360px;
}
.xr-console-row-detail pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font: 500 11px/1.5 'JetBrains Mono', monospace;
}
.xr-console-row-detail .xr-tree-root {
  color: var(--xr-text);
  font: 500 11.5px/1.65 'JetBrains Mono', monospace;
}
.xr-console-row-detail .xr-line {
  min-height: 21px;
  border-radius: 3px;
}
.xr-console-row-detail .xr-line:hover { background: rgba(255,255,255,.045); }
.xr-console-row-detail .xr-key { color: #93c5fd; font-weight: 650; }
.xr-console-row-detail .xr-string { color: #86efac; }
.xr-console-row-detail .xr-number { color: #7dd3fc; }
.xr-console-row-detail .xr-boolean { color: #fbbf24; }
.xr-console-row-detail .xr-null { color: var(--xr-muted); font-style: italic; }
.xr-console-row-detail .xr-brack,
.xr-console-row-detail .xr-punct { color: var(--xr-subtext); }
.xr-console-row-detail .xr-prev { color: var(--xr-muted); }
.xr-console-detail-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}
.xr-console-inline-btn {
  height: 22px;
  padding: 0 7px;
  border: 1px solid var(--xr-border);
  border-radius: var(--xr-radius-sm, 4px);
  color: var(--xr-text);
  background: var(--xr-surface);
  font: 600 10px/1 var(--xr-font, inherit);
  cursor: pointer;
}
.xr-console-inline-btn:hover { background: var(--xr-bg3); }
.xr-console-output-note {
  margin: 0 0 6px;
  color: var(--xr-yellow, #eab308);
  font-size: 10.5px;
}
.xr-console-table-wrap { overflow: auto; max-height: 300px; }
.xr-console-table {
  width: 100%;
  border-collapse: collapse;
  font: 500 11px/1.4 'JetBrains Mono', monospace;
}
.xr-console-table th,
.xr-console-table td {
  padding: 4px 6px;
  border: 1px solid var(--xr-border);
  text-align: left;
  vertical-align: top;
}
.xr-console-table th {
  position: sticky;
  top: 0;
  background: var(--xr-bg);
  color: var(--xr-muted);
}
.xr-console-prompt {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  border-top: 1px solid var(--xr-border);
  background: var(--xr-bg2);
  flex-shrink: 0;
}
.xr-console-prompt-symbol {
  color: var(--xr-accent);
  font: 800 13px/1 'JetBrains Mono', monospace;
}
.xr-console-input {
  width: 100%;
  height: 28px;
  min-width: 0;
  border: 1px solid var(--xr-border);
  border-radius: var(--xr-radius-sm, 4px);
  padding: 0 8px;
  outline: none;
  color: var(--xr-text);
  background: var(--xr-bg);
  font: 500 12px/1 'JetBrains Mono', monospace;
}
.xr-console-input:focus {
  border-color: var(--xr-accent);
  box-shadow: 0 0 0 1px var(--xr-accent);
}
.xr-console-run {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border: 1px solid var(--xr-accent);
  border-radius: var(--xr-radius-sm, 4px);
  color: #fff;
  background: var(--xr-accent);
  font: 700 11px/1 var(--xr-font, inherit);
  cursor: pointer;
}
.xr-notebook-pane {
  display: none;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  min-height: 0;
  background: var(--xr-bg);
  overflow: hidden;
}
.xr-notebook-pane.xr-active { display: flex; }
.xr-notebook-shell {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.xr-console-notebook-head {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 6px 8px;
  border-bottom: 1px solid var(--xr-border);
  background: var(--xr-bg2);
}
.xr-console-notebook-title {
  color: var(--xr-text);
  font: 700 11px/1 var(--xr-font, inherit);
}
.xr-console-cells {
  min-height: 0;
  flex: 1;
  overflow: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.xr-cell {
  border: 1px solid var(--xr-border);
  border-radius: var(--xr-radius-md, 6px);
  background: var(--xr-surface);
  overflow: hidden;
}
.xr-cell.xr-focused { border-color: var(--xr-accent); box-shadow: 0 0 0 1px var(--xr-accent); }
.xr-cell-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 26px;
  padding: 0 8px;
  border-bottom: 1px solid rgba(255,255,255,.04);
  color: var(--xr-muted);
  font: 600 10px/1 'JetBrains Mono', monospace;
}
.xr-cell-actions { display: flex; gap: 4px; }
.xr-cell-actions button {
  border: 0;
  border-radius: 4px;
  color: var(--xr-muted);
  background: transparent;
  cursor: pointer;
  font: 600 10px/1 var(--xr-font, inherit);
}
.xr-cell-actions button:hover { color: var(--xr-text); background: var(--xr-bg3); }
.xr-cell-input .cm-editor {
  background: transparent !important;
  color: var(--xr-text) !important;
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 12px;
}
.xr-cell-input .cm-gutters {
  background: rgba(0,0,0,.12) !important;
  border-right: 1px solid rgba(255,255,255,.04) !important;
  color: var(--xr-muted) !important;
}
.xr-cell-output {
  border-top: 1px solid rgba(255,255,255,.04);
  padding: 8px;
  background: rgba(0,0,0,.12);
  font: 500 11px/1.5 'JetBrains Mono', monospace;
}
.xr-cell-output:empty { display: none; }
@container (max-width: 620px) {
  .xr-console-toolbar { flex-wrap: wrap; }
  .xr-console-context-chip { max-width: 180px; }
  .xr-console-row { grid-template-columns: 16px minmax(0, 1fr); }
  .xr-console-meta { display: none; }
  .xr-console-row-detail { grid-column: 2; }
  .xr-console-prompt { grid-template-columns: auto minmax(0, 1fr) auto; }
  .xr-console-run { display: none; }
}
@media (max-width: 760px) {
  .xr-console-mini-tab { padding: 0 10px; }
  .xr-network-filterbar { grid-template-columns: 1fr; }
  .xr-network-head,
  .xr-network-line { grid-template-columns: 46px 42px minmax(120px, 1fr) 76px 0 0; }
  .xr-network-size,
  .xr-network-time { display: none; }
  .xr-network-detail { padding-left: 10px; }
}
@media (max-width: 520px) {
  .xr-console-actions { gap: 4px; padding: 0 4px; }
  .xr-console-action-btn { padding: 0 8px; }
  .xr-console-mini-tab { padding: 0 8px; }
  .xr-network-head,
  .xr-network-line { grid-template-columns: 42px 40px minmax(100px, 1fr) 0 0 0; }
  .xr-network-timing { display: none; }
}
`;
    _root.appendChild(style);
  }

  function _getById(id) {
    return _root.getElementById ? _root.getElementById(id) : _root.querySelector(`#${id}`);
  }

  function _time(timestamp) {
    return new Date(timestamp || Date.now()).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  function _preview(value, limit = 220) {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    if (typeof value === 'string') return value.length > limit ? value.slice(0, limit) + '...' : value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    try {
      const text = JSON.stringify(value);
      return text.length > limit ? text.slice(0, limit) + '...' : text;
    } catch {
      return String(value);
    }
  }

  function _parseJSONText(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed || (!trimmed.startsWith('{') && !trimmed.startsWith('['))) return null;
    try { return JSON.parse(trimmed); } catch { return null; }
  }

  function _isStructuredValue(value) {
    if (value && typeof value === 'object') return true;
    return !!_parseJSONText(value);
  }

  function _entryMessage(entry) {
    if (!entry) return '';
    if (entry.type === 'api') {
      const status = entry.status ? ` ${entry.status}` : '';
      return `${entry.method || 'GET'}${status} ${entry.urlPath || entry.url || '(unknown URL)'}`;
    }
    if (entry.message != null) return String(entry.message);
    return _preview(entry.logData);
  }

  function _eventFromEntry(entry) {
    if (entry.type === 'api') {
      const status = Number(entry.status) || 0;
      return {
        type: 'network',
        level: status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info',
        id: 'evt_' + entry.id,
        timestamp: entry.timestamp || Date.now(),
        message: _entryMessage(entry),
        args: [entry],
        entryId: entry.id,
        expanded: false,
      };
    }
    const level = entry.logLevel || 'log';
    return {
      type: 'log',
      level,
      id: 'evt_' + entry.id,
      timestamp: entry.timestamp || Date.now(),
      message: _entryMessage(entry),
      args: Array.isArray(entry.args) ? entry.args : Array.isArray(entry.logData) ? entry.logData : [entry.logData],
      entryId: entry.id,
      expanded: false,
    };
  }

  function _appendEvent(event) {
    _events.push(event);
    if (event.expanded) {
      _expanded.clear();
      _expanded.add(event.id);
    }
    if (_events.length > MAX_EVENTS) {
      const removed = _events.splice(0, _events.length - MAX_EVENTS);
      removed.forEach((item) => _expanded.delete(item.id));
    }
    _scheduleRenderRows(true);
  }

  function _scheduleRenderRows(stickToBottom = false) {
    _renderStickToBottom = _renderStickToBottom || !!stickToBottom;
    if (_renderQueued) return;
    _renderQueued = true;
    const schedule = window.requestAnimationFrame || ((fn) => setTimeout(fn, 16));
    schedule(() => {
      _renderQueued = false;
      const shouldStick = _renderStickToBottom;
      _renderStickToBottom = false;
      _renderRows(shouldStick);
    });
  }

  function _matchesFilter(event) {
    if (_filter === 'all') return true;
    if (_filter === 'errors') return event.level === 'error' || event.type === 'error';
    if (_filter === 'warnings') return event.level === 'warn';
    if (_filter === 'logs') return event.type === 'log';
    if (_filter === 'network') return event.type === 'network';
    if (_filter === 'commands') return event.type === 'command' || event.type === 'result' || event.type === 'error';
    return true;
  }

  function _filteredEvents() {
    return _events.filter(_matchesFilter);
  }

  function _networkEvents() {
    const query = _searchQuery.trim().toLowerCase();
    return _events.filter((event) => {
      if (event.type !== 'network') return false;
      const entry = event.args?.[0] || {};
      const source = String(entry.source || '').toLowerCase();
      const status = Number(entry.status) || 0;
      if (_networkFilter === 'errors' && status < 400) return false;
      if (_networkFilter !== 'all' && _networkFilter !== 'errors' && source !== _networkFilter) return false;
      if (!query) return true;
      return String(entry.method || '').toLowerCase().includes(query) ||
        String(entry.status || '').includes(query) ||
        String(entry.urlPath || entry.url || '').toLowerCase().includes(query) ||
        source.includes(query);
    });
  }

  function _consoleStreamEvents() {
    return _events.filter((event) => event.type !== 'network' && _matchesFilter(event));
  }

  function _formatSize(value) {
    if (window.XRAY_Utils?.formatBytes) return window.XRAY_Utils.formatBytes(value);
    const bytes = Number(value) || 0;
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + 'mb';
    if (bytes >= 1024) return (bytes / 1024).toFixed(1) + 'kb';
    return bytes + 'b';
  }

  function _durationValue(entry) {
    return Math.max(0, Number(entry?.duration) || 0);
  }

  function _durationPct(entry) {
    const max = Math.max(100, ..._networkEvents().map((event) => _durationValue(event.args?.[0])));
    return Math.max(6, Math.min(100, _durationValue(entry) / max * 100));
  }

  function _entryResponse(entry) {
    return _parseMaybeJSON(entry?.responseDecrypted ?? entry?.responseRaw ?? entry?.response ?? null);
  }

  function _selectedNetworkEvent() {
    return _events.find((event) => event.id === _selectedEventId && event.type === 'network') || null;
  }

  function _svgIcon(name, size = 16) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('xr-icon', 'xr-icon-' + String(name || 'dot'));
    svg.setAttribute('width', String(size));
    svg.setAttribute('height', String(size));
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.7');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');

    const add = (tag, attrs) => {
      const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
      Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
      svg.appendChild(node);
      return node;
    };

    switch (name) {
      case 'network':
        add('rect', { x: 3, y: 3, width: 10, height: 7, rx: 1.5 });
        add('path', { d: 'M8 10v3M5.5 13h5' });
        break;
      case 'terminal':
        add('path', { d: 'M3.5 5.5 6 8l-2.5 2.5M8 10.5h4.5' });
        break;
      case 'code':
        add('path', { d: 'M6 4.5 3 8l3 3.5M10 4.5 13 8l-3 3.5' });
        break;
      case 'bolt':
        add('path', { d: 'M9 2.5 4.5 8.5H8l-1 5 4.5-6H8z' });
        break;
      case 'settings':
        add('circle', { cx: 8, cy: 8, r: 2.2 });
        add('path', { d: 'M8 2.5v1.2M8 12.3v1.2M3.6 3.6l.9.9M11.5 11.5l.9.9M2.5 8h1.2M12.3 8h1.2M3.6 12.4l.9-.9M11.5 4.5l.9-.9' });
        break;
      case 'search':
        add('circle', { cx: 7, cy: 7, r: 4.2 });
        add('path', { d: 'M10.2 10.2 13.5 13.5' });
        break;
      case 'record':
        svg.setAttribute('fill', 'currentColor');
        svg.setAttribute('stroke', 'none');
        add('circle', { cx: 8, cy: 8, r: 4 });
        break;
      case 'trash':
        add('path', { d: 'M3.5 5h9M6 5V3.5h4V5M5 5l.5 8h5L11 5M7 7v4M9 7v4' });
        break;
      case 'download':
        add('path', { d: 'M8 2.5v7M5 6.8 8 9.8l3-3M3.5 13h9' });
        break;
      case 'filter':
        add('path', { d: 'M3 4h10M5 8h6M7 12h2' });
        break;
      case 'refresh':
        add('path', { d: 'M12.5 6A4.5 4.5 0 0 0 4.8 4.2L3.5 5.5M3.5 3v2.5H6M3.5 10A4.5 4.5 0 0 0 11.2 11.8l1.3-1.3M12.5 13v-2.5H10' });
        break;
      case 'circle-check':
        add('circle', { cx: 8, cy: 8, r: 5 });
        add('path', { d: 'M5.7 8.2 7.2 9.7l3.2-3.4' });
        break;
      case 'circle-x':
        add('circle', { cx: 8, cy: 8, r: 5 });
        add('path', { d: 'M6.2 6.2 9.8 9.8M9.8 6.2 6.2 9.8' });
        break;
      case 'alert-triangle':
        add('path', { d: 'M8 2.5 14 13H2zM8 6v3M8 11.2h.01' });
        break;
      case 'loader':
        add('path', { d: 'M8 2.5v2M8 11.5v2M2.5 8h2M11.5 8h2M4.1 4.1l1.4 1.4M10.5 10.5l1.4 1.4M11.9 4.1l-1.4 1.4M5.5 10.5l-1.4 1.4' });
        break;
      case 'clock':
        add('circle', { cx: 8, cy: 8, r: 5 });
        add('path', { d: 'M8 5.3V8l2 1.2' });
        break;
      case 'arrow-up-right':
        add('path', { d: 'M5 11 11 5M6.5 5H11v4.5' });
        break;
      case 'arrow-down-left':
        add('path', { d: 'M11 5 5 11M9.5 11H5V6.5' });
        break;
      case 'eye':
        add('path', { d: 'M2.5 8s2-3.5 5.5-3.5S13.5 8 13.5 8s-2 3.5-5.5 3.5S2.5 8 2.5 8Z' });
        add('circle', { cx: 8, cy: 8, r: 1.5 });
        break;
      case 'chevron-right':
        add('path', { d: 'm6 4 4 4-4 4' });
        break;
      case 'chevron-down':
        add('path', { d: 'm4 6 4 4 4-4' });
        break;
      case 'chevron-left':
        add('path', { d: 'm10 4-4 4 4 4' });
        break;
      case 'play':
        svg.setAttribute('fill', 'currentColor');
        add('path', { d: 'M5 3.5v9l7-4.5z', stroke: 'none' });
        break;
      case 'variable':
        add('path', { d: 'M4 11c1.5-1.8 2.5-4.2 3-7M5.5 5.5h4M8.5 5.5c.7 0 1.1.5 1.3 1.2l.7 2.6c.2.7.5 1.2 1.3 1.2' });
        break;
      case 'copy':
        add('rect', { x: 6, y: 5, width: 7, height: 8, rx: 1.5 });
        add('path', { d: 'M4 11.5V3.8c0-.7.4-1.2 1.1-1.2h6.4' });
        break;
      case 'more':
        svg.setAttribute('fill', 'currentColor');
        svg.setAttribute('stroke', 'none');
        add('circle', { cx: 4, cy: 8, r: 1 });
        add('circle', { cx: 8, cy: 8, r: 1 });
        add('circle', { cx: 12, cy: 8, r: 1 });
        break;
      case 'info':
        add('circle', { cx: 8, cy: 8, r: 5 });
        add('path', { d: 'M8 7.5v3M8 5.2h.01' });
        break;
      default:
        add('circle', { cx: 8, cy: 8, r: 2.5 });
        break;
    }
    return svg;
  }

  function _canExpand(event) {
    if (!event) return false;
    if (event.type === 'network' || event.type === 'error') return true;
    if (event.truncated) return true;
    if (Array.isArray(event.args) && event.args.some((arg) => arg && typeof arg === 'object')) return true;
    return event.data && typeof event.data === 'object';
  }

  function _isSelectedEvent(event) {
    return !!(event?.entryId && _activeContext?.id && event.entryId === _activeContext.id);
  }

  function _rowClass(event) {
    const classes = ['xr-console-row'];
    if (event.level === 'error' || event.type === 'error') classes.push('xr-error');
    else if (event.level === 'warn') classes.push('xr-warn');
    if (event.type === 'network') classes.push('xr-network');
    if (event.type === 'command' || event.type === 'result') classes.push('xr-command');
    if (_expanded.has(event.id)) classes.push('xr-expanded');
    if (_isSelectedEvent(event)) classes.push('xr-selected');
    return classes.join(' ');
  }

  function _iconNameFor(event) {
    if (event.type === 'command') return 'chevron-right';
    if (event.type === 'result') return 'chevron-left';
    if (event.type === 'network') return 'network';
    if (event.type === 'error' || event.level === 'error') return 'circle-x';
    if (event.level === 'warn') return 'alert-triangle';
    if (event.level === 'info') return 'info';
    return 'terminal';
  }

  function _statusClass(status) {
    const value = Number(status) || 0;
    if (value >= 500) return 'xr-error';
    if (value >= 400) return 'xr-error';
    if (value >= 300) return 'xr-warn';
    if (value >= 200) return 'xr-ok';
    return '';
  }

  function _addChip(parent, text, className = '') {
    const chip = document.createElement('span');
    chip.className = 'xr-console-chip' + (className ? ' ' + className : '');
    chip.textContent = text;
    parent.appendChild(chip);
    return chip;
  }

  function _renderRow(event) {
    const row = document.createElement('div');
    row.className = _rowClass(event);
    row.dataset.id = event.id;

    const iconSlot = document.createElement('div');
    iconSlot.className = 'xr-console-row-icon';
    if (_canExpand(event)) {
      const disclosure = document.createElement('button');
      disclosure.className = 'xr-console-disclosure';
      disclosure.appendChild(_svgIcon(_expanded.has(event.id) ? 'chevron-down' : 'chevron-right', 15));
      disclosure.title = _expanded.has(event.id) ? 'Collapse' : 'Expand';
      disclosure.addEventListener('click', (e) => {
        e.stopPropagation();
        _toggleExpanded(event.id);
      });
      iconSlot.appendChild(disclosure);
    } else {
      iconSlot.appendChild(_svgIcon(_iconNameFor(event), 15));
    }

    const message = document.createElement('div');
    message.className = 'xr-console-message';

    if (event.type === 'network') {
      const entry = event.args?.[0] || {};
      _addChip(message, entry.method || 'GET');
      _addChip(message, String(entry.status || '---'), _statusClass(entry.status));
      const main = document.createElement('span');
      main.className = 'xr-console-message-main';
      main.textContent = entry.urlPath || entry.url || event.message || '';
      message.appendChild(main);
      if (entry.duration != null) _addChip(message, `${Math.round(Number(entry.duration) || 0)}ms`);
      if (entry.size != null && window.XRAY_Utils?.formatBytes) _addChip(message, window.XRAY_Utils.formatBytes(entry.size));
    } else {
      const main = document.createElement('span');
      main.className = 'xr-console-message-main';
      main.textContent = event.message || '';
      message.appendChild(main);
    }

    const meta = document.createElement('div');
    meta.className = 'xr-console-meta';
    meta.textContent = _time(event.timestamp);

    row.append(iconSlot, message, meta);
    row.addEventListener('click', () => {
      if (event.entryId && event.type === 'network') {
        const panel = window.XRAY_Panel;
        if (panel?.selectEntryContext) panel.selectEntryContext(event.entryId);
        else panel?.selectEntry?.(event.entryId);
      }
      if (_canExpand(event)) _toggleExpanded(event.id);
    });

    if (_expanded.has(event.id)) {
      row.appendChild(_renderDetail(event));
    }

    return row;
  }

  function _toggleExpanded(id) {
    if (_expanded.has(id)) {
      _expanded.delete(id);
    } else {
      _expanded.clear();
      _expanded.add(id);
    }
    _scheduleRenderRows(false);
  }

  function _renderRows(stickToBottom = false) {
    _renderNetworkTable();
    _renderConsoleStream(stickToBottom);
    _renderStatusbar();
  }

  function _renderNetworkTable() {
    if (!_dom.networkPanel || !_dom.networkBody) return;
    const showNetwork = _consoleTab === 'network';
    _dom.networkPanel.style.display = showNetwork ? '' : 'none';
    if (!showNetwork) return;

    const events = _networkEvents();
    _dom.networkBody.textContent = '';
    if (!events.length) {
      const empty = document.createElement('div');
      empty.className = 'xr-network-empty';
      empty.textContent = _searchQuery || _networkFilter !== 'all'
        ? 'No matching requests'
        : 'No requests captured yet';
      _dom.networkBody.appendChild(empty);
      return;
    }

    events.slice(-140).forEach((event) => {
      _dom.networkBody.appendChild(_renderNetworkLine(event));
      if (_expanded.has(event.id)) {
        const detail = document.createElement('div');
        detail.className = 'xr-network-detail';
        detail.appendChild(_renderDetail(event));
        _dom.networkBody.appendChild(detail);
      }
    });
  }

  function _renderNetworkLine(event) {
    const entry = event.args?.[0] || {};
    const status = Number(entry.status) || 0;
    const method = String(entry.method || 'GET').toUpperCase();
    const row = document.createElement('div');
    row.className = 'xr-network-line' +
      (status >= 400 ? ' xr-error' : '') +
      (_durationValue(entry) >= 500 ? ' xr-slow' : '') +
      (_expanded.has(event.id) ? ' xr-expanded' : '') +
      (_isSelectedEvent(event) || _selectedEventId === event.id ? ' xr-selected' : '');
    row.dataset.id = event.id;

    const methodEl = document.createElement('div');
    methodEl.className = 'xr-network-method xr-' + method.toLowerCase();
    methodEl.textContent = method === 'DELETE' ? 'DEL' : method;
    const statusEl = document.createElement('div');
    statusEl.className = 'xr-network-status' + (_statusClass(status) ? ' ' + _statusClass(status) : '');
    statusEl.textContent = status ? String(status) : '---';
    const pathEl = document.createElement('div');
    pathEl.className = 'xr-network-path';
    pathEl.title = entry.url || entry.urlPath || '';
    pathEl.textContent = entry.urlPath || entry.url || '(unknown)';

    const timingEl = document.createElement('div');
    timingEl.className = 'xr-network-timing';
    const track = document.createElement('div');
    track.className = 'xr-network-bar-track';
    const bar = document.createElement('div');
    bar.className = 'xr-network-bar';
    bar.style.width = _durationPct(entry).toFixed(0) + '%';
    track.appendChild(bar);
    const duration = document.createElement('span');
    duration.textContent = Math.round(_durationValue(entry)) + 'ms';
    timingEl.append(track, duration);

    const sizeEl = document.createElement('div');
    sizeEl.className = 'xr-network-size';
    sizeEl.textContent = _formatSize(entry.size);
    const timeEl = document.createElement('div');
    timeEl.className = 'xr-network-time';
    timeEl.textContent = _time(entry.timestamp || event.timestamp);

    row.append(methodEl, statusEl, pathEl, timingEl, sizeEl, timeEl);
    row.addEventListener('click', () => _selectNetworkEvent(event.id));
    return row;
  }

  function _renderConsoleStream(stickToBottom = false) {
    if (!_dom.rows) return;
    _dom.rows.textContent = '';

    if (_consoleTab === 'schema') {
      _renderSchemaPanel(_dom.rows);
      return;
    }
    if (_consoleTab === 'snippets') {
      _renderSnippetsPanel(_dom.rows);
      return;
    }

    const events = _consoleStreamEvents();
    if (!events.length) {
      const empty = document.createElement('div');
      empty.className = 'xr-console-empty';
      empty.textContent = _consoleTab === 'console' ? 'No console messages' : 'Run commands against the selected request below';
      _dom.rows.appendChild(empty);
      return;
    }

    const start = Math.max(0, events.length - MAX_RENDERED_ROWS);
    if (start > 0) {
      const note = document.createElement('div');
      note.className = 'xr-console-trim-note';
      note.textContent = `Showing latest ${MAX_RENDERED_ROWS} of ${events.length} console events`;
      _dom.rows.appendChild(note);
    }
    events.slice(start).forEach((event) => _dom.rows.appendChild(_renderRow(event)));
    if (stickToBottom) _dom.rows.scrollTop = _dom.rows.scrollHeight;
  }

  function _renderSchemaPanel(parent) {
    const wrap = document.createElement('div');
    wrap.className = 'xr-console-tab-panel';
    const title = document.createElement('div');
    title.className = 'xr-console-output-note';
    title.textContent = _activeContext ? 'Schema for selected response' : 'Select a request to inspect its schema';
    wrap.appendChild(title);
    if (_activeContext) {
      const schemaValue = window.XRAY_ConsoleHelpers?.schema
        ? window.XRAY_ConsoleHelpers.schema(_entryResponse(_activeContext))
        : _entryResponse(_activeContext);
      _renderValue(wrap, schemaValue);
    }
    parent.appendChild(wrap);
  }

  function _renderSnippetsPanel(parent) {
    const wrap = document.createElement('div');
    wrap.className = 'xr-console-tab-panel';
    const title = document.createElement('div');
    title.className = 'xr-console-output-note';
    title.textContent = 'Click a snippet to insert it into the prompt';
    const list = document.createElement('div');
    list.className = 'xr-console-snippets';
    [
      'res.data',
      'Object.keys(res)',
      'schema(res)',
      'table(res.items || res)',
      'diff(prev, res)',
      '$errors()',
      '$slow(500)',
    ].forEach((command) => {
      const button = document.createElement('button');
      button.className = 'xr-console-inline-btn';
      button.textContent = command;
      button.addEventListener('click', () => insertCommand(command));
      list.appendChild(button);
    });
    wrap.append(title, list);
    parent.appendChild(wrap);
  }

  function _renderStatusbar() {
    if (!_dom.statusbar) return;
    const networks = _events.filter((event) => event.type === 'network');
    const errors = networks.filter((event) => Number(event.args?.[0]?.status) >= 400);
    const slow = networks.filter((event) => _durationValue(event.args?.[0]) > 500);
    const totalBytes = networks.reduce((sum, event) => sum + Math.max(0, Number(event.args?.[0]?.size) || 0), 0);
    const avg = networks.length
      ? networks.reduce((sum, event) => sum + _durationValue(event.args?.[0]), 0) / networks.length
      : 0;
    _dom.statusbar.textContent = '';
    [
      { text: `${networks.filter((event) => Number(event.args?.[0]?.status) < 400).length} ok`, className: 'xr-console-status-ok' },
      { text: `${errors.length} errors`, className: 'xr-console-status-error' },
      { text: `${slow.length} slow (>500ms)`, className: 'xr-console-status-slow' },
    ].forEach((item) => {
      const span = document.createElement('span');
      span.className = item.className;
      span.textContent = item.text;
      _dom.statusbar.appendChild(span);
    });
    const spacer = document.createElement('span');
    spacer.className = 'xr-console-status-spacer';
    const summary = document.createElement('span');
    summary.textContent = `${networks.length} requests - ${_formatSize(totalBytes)} total - avg ${Math.round(avg)}ms`;
    _dom.statusbar.append(spacer, summary);
  }

  function _selectNetworkEvent(eventId) {
    const event = _events.find((item) => item.id === eventId && item.type === 'network');
    if (!event) return;
    _selectedEventId = event.id;
    _expanded.clear();
    _expanded.add(event.id);
    const entry = event.args?.[0] || null;
    if (entry) {
      _activeContext = entry;
      if (window.XRAY_Console) window.XRAY_Console.setContext(_activeContext);
      const panel = window.XRAY_Panel;
      if (panel?.selectEntryContext) panel.selectEntryContext(entry.id);
      else panel?.selectEntry?.(entry.id);
      _updateContextChip();
    }
    _scheduleRenderRows(false);
  }

  function _renderDetail(event) {
    const detail = document.createElement('div');
    detail.className = 'xr-console-row-detail';

    const actions = document.createElement('div');
    actions.className = 'xr-console-detail-actions';

    const copy = document.createElement('button');
    copy.className = 'xr-console-inline-btn';
    copy.textContent = event.type === 'network' ? 'Copy full' : 'Copy';
    copy.addEventListener('click', (e) => {
      e.stopPropagation();
      const entry = event.type === 'network' ? event.args?.[0] : null;
      const value = entry ? _entryResponse(entry) : event.data !== undefined ? event.data : event.args;
      const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
      navigator.clipboard?.writeText?.(text || '');
    });
    actions.appendChild(copy);

    if (event.entryId) {
      const open = document.createElement('button');
      open.className = 'xr-console-inline-btn';
      open.textContent = 'Open request';
      open.addEventListener('click', (e) => {
        e.stopPropagation();
        window.XRAY_Panel?.selectEntry?.(event.entryId);
      });
      actions.appendChild(open);
      const send = document.createElement('button');
      send.className = 'xr-console-inline-btn';
      send.textContent = 'Send res';
      send.addEventListener('click', (e) => {
        e.stopPropagation();
        insertCommand('res');
      });
      actions.appendChild(send);
    }
    detail.appendChild(actions);

    if (event.truncated) {
      const note = document.createElement('div');
      note.className = 'xr-console-output-note';
      note.textContent = 'Large output was truncated for UI safety.';
      detail.appendChild(note);
    }

    if (event.type === 'error' && event.data?.stack) {
      const pre = document.createElement('pre');
      pre.textContent = event.data.stack;
      detail.appendChild(pre);
      return detail;
    }

    if (event.type === 'network') {
      const entry = event.args?.[0] || {};
      const meta = document.createElement('pre');
      meta.textContent = `${entry.method || 'GET'} ${entry.status || '---'} ${entry.urlPath || entry.url || ''}`;
      detail.appendChild(meta);
      _renderValue(detail, _entryResponse(entry));
      return detail;
    }

    const values = event.data !== undefined ? [event.data] : (event.args || []);
    values.forEach((value) => _renderValue(detail, value));
    return detail;
  }

  function _renderValue(parent, value) {
    if (value && value.__xr_render === 'table') {
      parent.appendChild(_renderTableObject(value.data));
      return;
    }
    if (typeof value === 'string' && value.length > MAX_INLINE_CHARS) {
      const pre = document.createElement('pre');
      pre.textContent = value.slice(0, MAX_INLINE_CHARS);
      parent.appendChild(pre);
      const note = document.createElement('div');
      note.className = 'xr-console-output-note';
      note.textContent = `Value truncated in UI. Copy to inspect the full value.`;
      parent.appendChild(note);
      return;
    }
    const parsedJSON = _parseJSONText(value);
    if (parsedJSON && window.XRAY_Renderer?.buildTree) {
      parent.appendChild(window.XRAY_Renderer.buildTree(parsedJSON));
      return;
    }
    if (value && typeof value === 'object' && window.XRAY_Renderer?.buildTree) {
      parent.appendChild(window.XRAY_Renderer.buildTree(value));
      return;
    }
    const pre = document.createElement('pre');
    pre.textContent = typeof value === 'string' ? value : _preview(value, MAX_INLINE_CHARS);
    parent.appendChild(pre);
  }

  function _renderTableObject(data) {
    const rows = Array.isArray(data) ? data : [];
    const wrap = document.createElement('div');
    wrap.className = 'xr-console-table-wrap';
    if (!rows.length) {
      wrap.textContent = '(Empty table)';
      return wrap;
    }
    const columns = Array.from(rows.reduce((set, row) => {
      Object.keys(row || {}).slice(0, 20).forEach((key) => set.add(key));
      return set;
    }, new Set()));
    const table = document.createElement('table');
    table.className = 'xr-console-table';
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    columns.forEach((column) => {
      const th = document.createElement('th');
      th.textContent = column;
      tr.appendChild(th);
    });
    thead.appendChild(tr);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    rows.slice(0, 200).forEach((row) => {
      const bodyRow = document.createElement('tr');
      columns.forEach((column) => {
        const td = document.createElement('td');
        td.textContent = _preview(row?.[column], 180);
        bodyRow.appendChild(td);
      });
      tbody.appendChild(bodyRow);
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
    return wrap;
  }

  function _setFilter(filter) {
    _filter = FILTERS.some((item) => item.id === filter) ? filter : 'all';
    _dom.filters?.forEach((button) => button.classList.toggle('xr-active', button.dataset.filter === _filter));
    _scheduleRenderRows(false);
  }

  function _setConsoleTab(tab) {
    _consoleTab = CONSOLE_TABS.some((item) => item.id === tab) ? tab : 'network';
    _dom.consoleTabs?.forEach((button) => button.classList.toggle('xr-active', button.dataset.tab === _consoleTab));
    _scheduleRenderRows(false);
  }

  function _setNetworkFilter(filter) {
    _networkFilter = NETWORK_FILTERS.some((item) => item.id === filter) ? filter : 'all';
    _dom.networkFilters?.forEach((button) => button.classList.toggle('xr-active', button.dataset.filter === _networkFilter));
    _scheduleRenderRows(false);
  }

  function _setRecording(active) {
    _recording = !!active;
    if (_dom.recordButton) {
      _dom.recordButton.classList.toggle('xr-recording', _recording);
      _dom.recordButton.classList.toggle('xr-paused', !_recording);
      const label = _dom.recordButton.querySelector('.xr-record-label');
      if (label) label.textContent = _recording ? 'Record' : 'Paused';
      _dom.recordButton.title = _recording ? 'Pause Console capture' : 'Resume Console capture';
    }
  }

  function _exportConsoleSelection() {
    const selected = _selectedNetworkEvent();
    if (selected?.entryId) {
      const panel = window.XRAY_Panel;
      if (panel?.selectEntryContext) panel.selectEntryContext(selected.entryId);
      else panel?.selectEntry?.(selected.entryId);
    }
    window.XRAY_Panel?.openExport?.();
  }

  async function _runCommand(code = _dom.input?.value || '') {
    const command = code.trim();
    if (!command) return;
    if (_dom.input) _dom.input.value = '';
    const commandId = 'cmd_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
    _appendEvent({
      type: 'command',
      level: 'info',
      id: commandId,
      timestamp: Date.now(),
      message: command,
      args: [command],
      commandId,
      expanded: false,
    });
    const result = await window.XRAY_Console.execute(command);
    if (result.type === 'error') {
      _appendEvent({
        type: 'error',
        level: 'error',
        id: 'res_' + commandId,
        timestamp: Date.now(),
        message: result.error?.message || 'Execution failed',
        args: [result.error],
        data: result.error,
        commandId,
        expanded: false,
      });
      return;
    }
    const shouldExpand = _isStructuredValue(result.result);
    _appendEvent({
      type: 'result',
      level: 'info',
      id: 'res_' + commandId,
      timestamp: Date.now(),
      message: _preview(result.result, 260),
      args: [result.result],
      data: result.result,
      commandId,
      truncated: !!result.truncated,
      expanded: shouldExpand,
    });
  }

  function _buildUI() {
    const pane = _getById('xr-console-pane');
    if (!pane) return;
    pane.textContent = '';

    const shell = document.createElement('div');
    shell.className = 'xr-console-shell';

    const topbar = document.createElement('div');
    topbar.className = 'xr-console-topbar';
    const tabs = document.createElement('div');
    tabs.className = 'xr-console-mini-tabs';
    CONSOLE_TABS.forEach((tab) => {
      const button = document.createElement('button');
      button.className = 'xr-console-mini-tab';
      button.dataset.tab = tab.id;
      if (tab.id === _consoleTab) button.classList.add('xr-active');
      const icon = document.createElement('span');
      icon.className = 'xr-console-tab-icon';
      icon.appendChild(_svgIcon(tab.icon, 17));
      const label = document.createElement('span');
      label.textContent = tab.label;
      button.append(icon, label);
      button.addEventListener('click', () => _setConsoleTab(tab.id));
      tabs.appendChild(button);
    });

    const actions = document.createElement('div');
    actions.className = 'xr-console-actions';
    const clearButton = document.createElement('button');
    clearButton.className = 'xr-console-action-btn';
    clearButton.append(_svgIcon('trash', 15), document.createTextNode('Clear'));
    const recordButton = document.createElement('button');
    recordButton.className = 'xr-console-action-btn xr-recording';
    const recordLabel = document.createElement('span');
    recordLabel.className = 'xr-record-label';
    recordLabel.textContent = 'Record';
    recordButton.append(_svgIcon('record', 14), recordLabel);
    const exportButton = document.createElement('button');
    exportButton.className = 'xr-console-action-btn';
    exportButton.append(_svgIcon('download', 15), document.createTextNode('Export'));
    const menuButton = document.createElement('button');
    menuButton.className = 'xr-console-action-btn xr-console-kebab';
    menuButton.appendChild(_svgIcon('more', 16));
    actions.append(clearButton, recordButton, exportButton, menuButton);
    topbar.append(tabs, actions);

    const filterbar = document.createElement('div');
    filterbar.className = 'xr-network-filterbar';
    const searchWrap = document.createElement('div');
    searchWrap.className = 'xr-network-search-wrap';
    const searchIcon = document.createElement('span');
    searchIcon.className = 'xr-network-search-icon';
    searchIcon.appendChild(_svgIcon('search', 15));
    const searchInput = document.createElement('input');
    searchInput.className = 'xr-network-search';
    searchInput.placeholder = 'Filter by path, method, status...';
    searchInput.autocomplete = 'off';
    searchInput.spellcheck = false;
    searchWrap.append(searchIcon, searchInput);
    const filterChips = document.createElement('div');
    filterChips.className = 'xr-network-filterchips';
    NETWORK_FILTERS.forEach((filter) => {
      const button = document.createElement('button');
      button.className = 'xr-network-chip';
      button.dataset.filter = filter.id;
      button.append(_svgIcon(filter.icon, 14), document.createTextNode(filter.label));
      if (filter.id === _networkFilter) button.classList.add('xr-active');
      button.addEventListener('click', () => _setNetworkFilter(filter.id));
      filterChips.appendChild(button);
    });
    filterbar.append(searchWrap, filterChips);

    const networkPanel = document.createElement('div');
    networkPanel.className = 'xr-network-panel';
    const networkHead = document.createElement('div');
    networkHead.className = 'xr-network-head';
    ['Method', 'Status', 'Path', 'Timing', 'Size', 'Time'].forEach((labelText) => {
      const label = document.createElement('div');
      label.textContent = labelText;
      networkHead.appendChild(label);
    });
    const networkBody = document.createElement('div');
    networkBody.className = 'xr-network-body';
    networkPanel.append(networkHead, networkBody);

    const rows = document.createElement('div');
    rows.className = 'xr-console-stream';

    const prompt = document.createElement('div');
    prompt.className = 'xr-console-prompt';
    const symbol = document.createElement('div');
    symbol.className = 'xr-console-prompt-symbol';
    symbol.appendChild(_svgIcon('chevron-right', 16));
    const input = document.createElement('input');
    input.className = 'xr-console-input';
    input.placeholder = _contextPlaceholder(_activeContext);
    input.autocomplete = 'off';
    input.spellcheck = false;
    const suggestions = document.createElement('datalist');
    suggestions.id = 'xr-console-suggestions-' + Date.now().toString(36);
    input.setAttribute('list', suggestions.id);
    const runButton = document.createElement('button');
    runButton.className = 'xr-console-run';
    runButton.append(_svgIcon('play', 13), document.createTextNode('Run'));
    prompt.append(symbol, input, runButton, suggestions);

    const contextChip = document.createElement('div');
    contextChip.className = 'xr-console-context-chip';
    contextChip.textContent = 'No request context';
    prompt.insertBefore(contextChip, runButton);

    const statusbar = document.createElement('div');
    statusbar.className = 'xr-console-statusbar';

    shell.append(topbar, filterbar, networkPanel, rows, prompt, statusbar);
    pane.appendChild(shell);

    _dom = {
      pane,
      shell,
      topbar,
      searchInput,
      networkPanel,
      networkBody,
      rows,
      input,
      runButton,
      recordButton,
      exportButton,
      contextChip,
      statusbar,
      promptSuggestions: suggestions,
      consoleTabs: [...tabs.querySelectorAll('.xr-console-mini-tab')],
      networkFilters: [...filterChips.querySelectorAll('.xr-network-chip')],
      filters: [...filterChips.querySelectorAll('.xr-network-chip')],
    };

    searchInput.addEventListener('input', (event) => {
      _searchQuery = event.target.value || '';
      _scheduleRenderRows(false);
    });
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        void _runCommand();
      } else if (event.key === 'ArrowUp' && !input.value) {
        const previous = window.XRAY_Console?.navigateHistory?.('up');
        if (previous != null) input.value = previous;
      } else if (event.key === 'ArrowDown') {
        const next = window.XRAY_Console?.navigateHistory?.('down');
        if (next != null) input.value = next;
      }
    });
    input.addEventListener('input', _updatePromptSuggestions);
    input.addEventListener('focus', _updatePromptSuggestions);
    runButton.addEventListener('click', () => { void _runCommand(); });
    recordButton.addEventListener('click', () => _setRecording(!_recording));
    exportButton.addEventListener('click', _exportConsoleSelection);
    menuButton.addEventListener('click', () => {
      _dom.searchInput?.focus?.();
    });
    clearButton.addEventListener('click', () => {
      _events = [];
      _expanded.clear();
      _selectedEventId = null;
      _activeContext = null;
      if (window.XRAY_Console) window.XRAY_Console.setContext(null);
      _updateContextChip();
      _scheduleRenderRows(false);
    });

    _setRecording(_recording);
    _renderRows(false);
  }

  function _buildNotebookUI() {
    const pane = _getById('xr-notebook-pane');
    if (!pane || _notebookBuilt) return;
    _notebookBuilt = true;
    pane.textContent = '';
    _loadCM();

    const shell = document.createElement('div');
    shell.className = 'xr-notebook-shell';
    const head = document.createElement('div');
    head.className = 'xr-console-notebook-head';
    const title = document.createElement('div');
    title.className = 'xr-console-notebook-title';
    title.textContent = 'Investigation Notebook';
    const spacer = document.createElement('div');
    spacer.className = 'xr-console-spacer';
    const contextChip = document.createElement('div');
    contextChip.className = 'xr-console-context-chip';
    contextChip.textContent = 'Same context as Console';
    const addCell = document.createElement('button');
    addCell.className = 'xr-console-tool-btn';
    addCell.textContent = 'Add cell';
    const runAll = document.createElement('button');
    runAll.className = 'xr-console-tool-btn';
    runAll.textContent = 'Run all';
    head.append(title, contextChip, spacer, addCell, runAll);

    const cells = document.createElement('div');
    cells.className = 'xr-console-cells';
    shell.append(head, cells);
    pane.appendChild(shell);

    _dom.notebookPane = pane;
    _dom.notebookContextChip = contextChip;
    _dom.cells = cells;

    addCell.addEventListener('click', () => createCell());
    runAll.addEventListener('click', () => _cells.forEach((cell) => { void _executeCell(cell); }));
    if (_cells.length === 0) createCell('$schema($res)');
  }

  const _highlightStyle = () => HighlightStyle.define([
    { tag: tags.keyword, color: '#c678dd' },
    { tag: tags.operator, color: '#56b6c2' },
    { tag: tags.propertyName, color: '#e06c75' },
    { tag: tags.variableName, color: '#e4e4e7' },
    { tag: tags.string, color: '#98c379' },
    { tag: tags.number, color: '#d19a66' },
    { tag: tags.bool, color: '#d19a66' },
    { tag: tags.null, color: '#5c6370' },
    { tag: tags.comment, color: '#5c6370', fontStyle: 'italic' },
  ]);

  function _parseMaybeJSON(value) {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (!trimmed || (!trimmed.startsWith('{') && !trimmed.startsWith('['))) return value;
    try { return JSON.parse(trimmed); } catch { return value; }
  }

  function _activeResponse() {
    return _parseMaybeJSON(_activeContext?.responseDecrypted ?? _activeContext?.responseRaw ?? null);
  }

  function _activeRequest() {
    return _parseMaybeJSON(_activeContext?.requestBody ?? null);
  }

  function _rootValue(name) {
    const runtime = window.XRAY_Console?.getRuntimePreview?.() || {};
    if (Object.prototype.hasOwnProperty.call(runtime, name)) return runtime[name];
    if (name === 'res' || name === '$res' || name === 'response') return _activeResponse();
    if (name === 'req' || name === '$req' || name === 'request') return _activeRequest();
    if (name === 'headers' || name === '$headers') return _activeContext?.responseHeaders || {};
    if (name === 'entry' || name === '$r') return _activeContext || null;
    if (name === 'prev' || name === 'next') return runtime[name] ?? null;
    return undefined;
  }

  function _pathTokens(pathText) {
    const tokens = [];
    String(pathText || '').replace(/\.([A-Za-z_$][\w$]*)|\[(\d+)\]/g, (_match, key, index) => {
      tokens.push(key ?? Number(index));
      return '';
    });
    return tokens;
  }

  function _resolvePath(rootValue, pathText) {
    return _pathTokens(pathText).reduce((value, token) => value == null ? undefined : value[token], rootValue);
  }

  function _pathCompletion(tokenText, absoluteFrom) {
    const rootMatch = String(tokenText || '').match(/^(\$res|\$req|\$headers|\$r|res|response|req|request|headers|entry|prev|next)(.*)$/);
    if (!rootMatch) return null;
    const root = rootMatch[1];
    let suffix = rootMatch[2] || '';
    let partial = '';
    let pathText = suffix;

    if (!suffix.endsWith('.')) {
      const dot = suffix.lastIndexOf('.');
      if (dot >= 0 && dot > suffix.lastIndexOf(']')) {
        partial = suffix.slice(dot + 1);
        pathText = suffix.slice(0, dot + 1);
      }
    }
    if (pathText.endsWith('.')) pathText = pathText.slice(0, -1);

    const base = _resolvePath(_rootValue(root), pathText);
    const sample = Array.isArray(base) ? base[0] : base;
    const keys = sample && typeof sample === 'object'
      ? Object.keys(sample).slice(0, 80)
      : [];
    const arrayOptions = Array.isArray(base)
      ? ['length', 'map', 'filter', 'find', 'slice']
      : [];
    const options = [...new Set([...keys, ...arrayOptions])]
      .filter((label) => label.toLowerCase().startsWith(partial.toLowerCase()))
      .slice(0, 30)
      .map((label) => ({ label, type: typeof base?.[label] === 'function' ? 'function' : 'property' }));
    if (!options.length) return null;
    return { from: absoluteFrom + tokenText.length - partial.length, options };
  }

  function _currentInputToken(input) {
    const caret = input.selectionStart ?? input.value.length;
    const before = input.value.slice(0, caret);
    const match = before.match(/(?:\$?[A-Za-z_$][\w$]*)(?:\.[A-Za-z_$][\w$]*|\[\d+\])*\.?\w*$/);
    if (!match) return null;
    return { text: match[0], start: caret - match[0].length, end: caret };
  }

  function _updatePromptSuggestions() {
    if (!_dom.promptSuggestions || !_dom.input) return;
    const token = _currentInputToken(_dom.input);
    const completion = token ? _pathCompletion(token.text, token.start) : null;
    _dom.promptSuggestions.textContent = '';
    (completion?.options || []).slice(0, 12).forEach((option) => {
      const opt = document.createElement('option');
      const prefix = token.text.slice(0, completion.from - token.start);
      opt.value = _dom.input.value.slice(0, token.start) + prefix + option.label + _dom.input.value.slice(token.end);
      opt.label = option.label;
      _dom.promptSuggestions.appendChild(opt);
    });
  }

  function _contextPlaceholder(entry) {
    if (!entry) return 'Select a request, then try res.data, table(res.items || res), schema(res)';
    const response = _activeResponse();
    if (Number(entry.status) >= 400) return 'Try res.error, headers, diff(prev, res)';
    if (Array.isArray(response)) return 'Try res[0], table(res), res.map(x => x.name)';
    if (response && typeof response === 'object') {
      const arrayKey = Object.keys(response).find((key) => Array.isArray(response[key]));
      return arrayKey
        ? `Try res.${arrayKey}, table(res.${arrayKey}), schema(res)`
        : 'Try res.data, Object.keys(res), schema(res)';
    }
    return 'Try res, req, headers, entry';
  }

  const _completions = (context) => {
    const word = context.matchBefore(/(?:\$?[A-Za-z_$][\w$]*)(?:\.[A-Za-z_$][\w$]*|\[\d+\])*\.?\w*|_(?:\.\w*)?/);
    if (!word || (word.from === word.to && !context.explicit)) return null;
    const text = word.text;
    const pathCompletion = _pathCompletion(text, word.from);
    if (pathCompletion) return { ...pathCompletion, validFor: /^\w*$/ };
    if (text.startsWith('_.')) {
      return {
        from: word.from + 2,
        options: ['map', 'filter', 'find', 'pluck', 'groupBy', 'uniq', 'sortBy', 'sum'].map((label) => ({ label, type: 'function' })),
        validFor: /^\w*$/,
      };
    }
    return {
      from: word.from,
      options: [
        '$r', '$res', '$req', '$headers', '$h', '$rh', '$url', '$params', '$statusCode', '$time', '$size', '$method',
        '$all', '$similar', '$prev', '$next', '$errors', '$slow', '$status', '$endpoint', '$domain', '$schema', '$mock', '$copy',
        '$curl', '$fetch', 'res', 'req', 'headers', 'entry', 'prev', 'next', 'table', 'csv', 'copy', 'mock',
        'toCSV', 'toTable', 'diff', 'schema', 'pick', 'omit', 'flatten', '_',
      ].map((label) => ({ label, type: label.startsWith('$') ? 'variable' : 'function' })),
      validFor: /^(?:\$?\w*|_\.?\w*)$/,
    };
  };

  function _createEditor(parentEl, initialCode, onRun, onRunAndNew) {
    if (!window.CM) return null;
    const runKeymap = [
      { key: 'Mod-Enter', run: () => { onRun(); return true; } },
      { key: 'Shift-Enter', run: () => { onRunAndNew(); return true; } },
    ];
    const theme = EditorView.theme({
      '&': { color: '#e4e4e7', backgroundColor: 'transparent' },
      '.cm-content': { caretColor: '#e4e4e7' },
      '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#e4e4e7' },
      '&.cm-focused': { outline: 'none' },
    }, { dark: true });
    const state = EditorState.create({
      doc: initialCode || '',
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        highlightSpecialChars(),
        history(),
        drawSelection(),
        dropCursor(),
        indentOnInput(),
        syntaxHighlighting(_highlightStyle(), { fallback: true }),
        bracketMatching(),
        closeBrackets(),
        autocompletion({ override: [_completions], activateOnTypingDelay: 150 }),
        javascript(),
        keymap.of([
          ...runKeymap,
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...historyKeymap,
          ...completionKeymap,
          indentWithTab,
        ]),
        theme,
      ],
    });
    return new EditorView({ state, parent: parentEl });
  }

  function createCell(code = '') {
    if (!_dom.cells) return null;
    if (!_loadCM()) {
      const fallback = document.createElement('div');
      fallback.className = 'xr-console-empty';
      fallback.textContent = 'CodeMirror failed to load';
      _dom.cells.appendChild(fallback);
      return null;
    }

    const cellEl = document.createElement('div');
    cellEl.className = 'xr-cell';
    const header = document.createElement('div');
    header.className = 'xr-cell-header';
    const label = document.createElement('span');
    label.textContent = `In [${_cells.length + 1}]`;
    const actions = document.createElement('div');
    actions.className = 'xr-cell-actions';
    const run = document.createElement('button');
    run.textContent = 'Run';
    const del = document.createElement('button');
    del.textContent = 'Del';
    actions.append(run, del);
    header.append(label, actions);
    const inputWrap = document.createElement('div');
    inputWrap.className = 'xr-cell-input';
    const outWrap = document.createElement('div');
    outWrap.className = 'xr-cell-output';
    cellEl.append(header, inputWrap, outWrap);
    _dom.cells.appendChild(cellEl);

    const cell = { el: cellEl, label, outWrap, editor: null };
    _cells.push(cell);
    cell.editor = _createEditor(inputWrap, code, () => _executeCell(cell), () => {
      void _executeCell(cell);
      createCell();
    });
    cell.editor?.dom.addEventListener('focusin', () => cellEl.classList.add('xr-focused'));
    cell.editor?.dom.addEventListener('focusout', () => cellEl.classList.remove('xr-focused'));
    run.addEventListener('click', () => { void _executeCell(cell); });
    del.addEventListener('click', () => {
      cellEl.remove();
      _cells = _cells.filter((item) => item !== cell);
      _cells.forEach((item, idx) => { item.label.textContent = `In [${idx + 1}]`; });
    });
    cell.editor?.focus();
    return cell;
  }

  async function _executeCell(cell) {
    const index = _cells.indexOf(cell);
    const code = cell.editor?.state.doc.toString() || '';
    cell.label.textContent = `In [${index + 1}] *`;
    const result = await window.XRAY_Console.execute(code);
    cell.label.textContent = `In [${index + 1}] ${_time(Date.now())}`;
    cell.outWrap.textContent = '';
    if (result.type === 'error') {
      const error = document.createElement('div');
      error.className = 'xr-console-row xr-error';
      error.textContent = result.error?.message || 'Execution failed';
      cell.outWrap.appendChild(error);
      return;
    }
    _renderValue(cell.outWrap, result.result);
    if (result.truncated) {
      const note = document.createElement('div');
      note.className = 'xr-console-output-note';
      note.textContent = 'Large output was truncated for UI safety.';
      cell.outWrap.appendChild(note);
    }
  }

  function addEntry(entry) {
    if (!entry) return;
    if (!_recording) return;
    _appendEvent(_eventFromEntry(entry));
  }

  function insertCommand(command = '') {
    const value = String(command || '').trim();
    if (!value) return;
    window.XRAY_Panel?.setActiveTab?.('console');
    if (_dom.input) {
      _dom.input.value = value;
      _dom.input.focus();
      _dom.input.setSelectionRange(value.length, value.length);
    }
  }

  function sendCommandToNotebook(command = '', title = '') {
    const value = String(command || '').trim();
    if (!value) return null;
    window.XRAY_Panel?.setActiveTab?.('notebook');
    _buildNotebookUI();
    const cleanTitle = String(title || 'Response operation').replace(/\s+/g, ' ').slice(0, 90);
    return createCell(`// ${cleanTitle}\n${value}`);
  }

  function _updateContextChip() {
    if (!_dom.contextChip) return;
    if (!_activeContext) {
      _dom.contextChip.textContent = 'No request context';
      _dom.contextChip.classList.remove('xr-selected');
      _dom.contextChip.title = '';
      if (_dom.input) _dom.input.placeholder = _contextPlaceholder(null);
      if (_dom.notebookContextChip) _dom.notebookContextChip.textContent = 'No request context';
      return;
    }
    const path = window.XRAY_Utils?.shortPath?.(_activeContext.url) || _activeContext.urlPath || _activeContext.url || '(unknown)';
    _dom.contextChip.textContent = `Selected ${_activeContext.method || 'GET'} ${path} - res req headers entry`;
    _dom.contextChip.classList.add('xr-selected');
    _dom.contextChip.title = 'Selected response aliases available: res, req, headers, entry, prev, next';
    if (_dom.input) {
      _dom.input.placeholder = _contextPlaceholder(_activeContext);
      _updatePromptSuggestions();
    }
    if (_dom.notebookContextChip) _dom.notebookContextChip.textContent = `${_activeContext.method || 'GET'} ${path}`;
  }

  function updateContext(entry) {
    _activeContext = entry || null;
    if (window.XRAY_Console) window.XRAY_Console.setContext(_activeContext);
    const event = _activeContext
      ? _events.find((item) => item.entryId === _activeContext.id && item.type === 'network')
      : null;
    _selectedEventId = event?.id || null;
    _updateContextChip();
    _scheduleRenderRows(false);
  }

  function handleTabSwitch(isConsole, isNotebook = false) {
    if (!isConsole && !isNotebook) return;
    const selected = window.XRAY_Panel?.getSelectedEntry?.();
    if (selected) updateContext(selected);
    if (isNotebook) {
      _buildNotebookUI();
      setTimeout(() => _cells[_cells.length - 1]?.editor?.focus(), 40);
      return;
    }
    setTimeout(() => _dom.input?.focus(), 40);
  }

  function init(root) {
    _root = root;
    _injectCSS();
    _buildUI();
    _appendEvent({
      type: 'system',
      level: 'info',
      id: 'evt_system_ready',
      timestamp: Date.now(),
      message: 'XRAY console ready',
      args: [{ helpers: ['res.data', 'res[0]', 'table(res.items || res)', 'schema(res)', 'diff(prev, res)'] }],
      expanded: false,
    });
  }

  return {
    init,
    addEntry,
    updateContext,
    insertCommand,
    sendCommandToNotebook,
    handleTabSwitch,
    createCell,
  };
})();
