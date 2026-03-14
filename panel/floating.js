// panel/floating.js — World-class redesign (shadcn/Linear/Vercel-inspired)
window.XRAY_Panel = (() => {
  'use strict';

  const HOST_ID   = '__xray_root__';
  const STORE_KEY = 'panel_v2';

  // ── State ─────────────────────────────────────────────────────────────────
  const _state = {
    open:          false,
    activeTab:     'api',        // 'api' | 'logs'
    activeView:    'tree',       // 'tree' | 'raw' | 'grid' | 'diff'
    activeDTab:    'response',   // 'response' | 'request' | 'headers'
    selectedId:    null,
    theme:         'zinc',
    filter:        '',
    listWidth:     220,
    panelWidth:    520,
    entries:       [],
    diffCompareId: null,         // ID of entry to diff against
    gridDrillRow:  null,         // drilled-in row data from grid view
    paneSearch:    { active: false, query: '', hits: [], current: -1 },
    pinned:        new Set(),    // pinned entry IDs
    filters:       { statusCodes: [], types: [] },  // filter state
  };

  // ── DOM refs ──────────────────────────────────────────────────────────────
  let _root = null;
  let _host = null;
  let _dom  = {};
  const MIN_PANEL_W = 360;
  const MAX_PANEL_W = Math.round(window.screen.width * 0.92) || 1400;

  // ══════════════════════════════════════════════════════════════════════════
  // CSS
  // ══════════════════════════════════════════════════════════════════════════
  function _buildCSS() {
    return `
/* ─── Reset ─────────────────────────────────────────────────────────────── */
:host { all: initial; display: block; }
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ─── Panel shell ────────────────────────────────────────────────────────── */
#xr-panel {
  position: fixed;
  top: 0; right: 0;
  width: 520px;
  min-width: 360px;
  max-width: 92vw;
  height: 100vh;
  z-index: 2147483647;
  display: flex;
  flex-direction: column;
  background: var(--xr-bg);
  color: var(--xr-text);
  border-left: 1px solid var(--xr-border);
  font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
  font-size: 12px;
  line-height: 1.5;
  box-shadow: -8px 0 56px rgba(0,0,0,.65), -1px 0 0 rgba(255,255,255,.04);
  transform: translateX(102%);
  transition: transform .24s cubic-bezier(.16,1,.3,1);
  overflow: hidden;
}
#xr-panel.xr-open { transform: translateX(0); }

/* ─── Panel resize edge ───────────────────────────────────────────────────── */
#xr-panel-resize {
  position: absolute;
  top: 0; left: 0;
  width: 5px;
  height: 100%;
  cursor: ew-resize;
  z-index: 10;
  background: transparent;
  transition: background .15s;
}
#xr-panel-resize:hover,
#xr-panel-resize.xr-dragging {
  background: var(--xr-accent);
  opacity: .4;
}

/* ─── Header ─────────────────────────────────────────────────────────────── */
.xr-header {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 46px;
  padding: 0 10px 0 14px;
  background: linear-gradient(180deg, var(--xr-bg2) 0%, var(--xr-bg) 100%);
  border-bottom: 1px solid var(--xr-border);
  flex-shrink: 0;
  user-select: none;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Wordmark */
.xr-wordmark {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-right: 8px;
  flex-shrink: 0;
}
.xr-logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 20px;
  background: linear-gradient(135deg, var(--xr-accent) 0%, var(--xr-purple) 100%);
  color: var(--xr-bg);
  border-radius: 5px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  flex-shrink: 0;
  line-height: 1;
  box-shadow: 0 2px 8px rgba(0,0,0,.4);
}
.xr-logo-text {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .5px;
  color: var(--xr-text);
  text-transform: uppercase;
}

/* Live capture dot */
.xr-capture-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--xr-muted);
  flex-shrink: 0;
  transition: background .3s;
  margin-left: -2px;
}
.xr-capture-dot.xr-live {
  background: var(--xr-green);
  animation: xr-pulse 1.8s ease-in-out infinite;
}
@keyframes xr-pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(74,222,128,.5); }
  50%       { opacity: .7; box-shadow: 0 0 0 4px rgba(74,222,128,0); }
}

/* Tabs */
.xr-tabs { display: flex; gap: 1px; }
.xr-tab {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--xr-muted);
  font-size: 11px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: background .12s, color .12s, border-color .12s, box-shadow .12s;
  white-space: nowrap;
  line-height: 1;
  position: relative;
}
.xr-tab:hover { background: var(--xr-bg3); color: var(--xr-subtext); }
.xr-tab.xr-active {
  background: var(--xr-bg3);
  border-color: var(--xr-border);
  color: var(--xr-text);
  font-weight: 600;
  box-shadow: inset 0 -2px 0 var(--xr-accent);
}
.xr-tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 16px;
  padding: 0 4px;
  background: var(--xr-surface);
  color: var(--xr-muted);
  border-radius: 10px;
  font-size: 9.5px;
  font-weight: 700;
  transition: background .12s, color .12s;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}
.xr-tab.xr-active .xr-tab-badge {
  background: var(--xr-accent);
  color: var(--xr-bg);
}

.xr-hspacer { flex: 1; }

/* Theme dots */
.xr-dots { display: flex; align-items: center; gap: 6px; margin-right: 4px; position: relative; }
.xr-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  opacity: .45;
  transition: opacity .15s, transform .15s, border-color .15s, box-shadow .15s;
  flex-shrink: 0;
  outline: 2px solid transparent;
}
.xr-dot:hover { opacity: 1; transform: scale(1.4); }
.xr-dot.xr-active {
  opacity: 1;
  border-color: rgba(255,255,255,.25);
  box-shadow: 0 0 0 2px var(--xr-bg2), 0 0 0 3.5px currentColor;
  transform: scale(1.15);
}

/* Theme dropdown */
.xr-theme-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--xr-surface);
  border: 1px solid var(--xr-border);
  border-radius: 6px;
  padding: 4px;
  margin-top: 4px;
  min-width: 150px;
  z-index: 10000;
  box-shadow: 0 2px 12px rgba(0,0,0,.2);
  display: none;
}
.xr-theme-dropdown.xr-open { display: flex; flex-direction: column; }
.xr-theme-dropdown button {
  padding: 6px 8px;
  border: none;
  background: transparent;
  text-align: left;
  font-size: 12px;
  cursor: pointer;
  color: var(--xr-text);
  border-radius: 4px;
  transition: background .15s;
  font-family: inherit;
}
.xr-theme-dropdown button:hover { background: var(--xr-bg3); }
.xr-theme-dropdown button::before {
  content: '○ ';
  opacity: .4;
  margin-right: 4px;
}
.xr-theme-dropdown button.xr-active::before {
  content: '● ';
  opacity: 1;
  color: var(--xr-accent);
}

/* Filter bar */
.xr-filter-bar {
  display: flex;
  gap: 4px;
  padding: 6px 8px;
  background: var(--xr-bg2);
  border-bottom: 1px solid var(--xr-border);
  overflow-x: auto;
  align-items: center;
}
.xr-filter-btn {
  padding: 4px 8px;
  border: 1px solid var(--xr-border);
  background: transparent;
  color: var(--xr-muted);
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all .15s;
  white-space: nowrap;
  flex-shrink: 0;
}
.xr-filter-btn:hover {
  color: var(--xr-text);
  border-color: var(--xr-accent);
}
.xr-filter-btn.xr-active {
  background: var(--xr-accent);
  color: var(--xr-bg);
  border-color: var(--xr-accent);
}
.xr-filter-sep { width: 1px; height: 14px; background: var(--xr-border); margin: 0 2px; }


/* Icon buttons */
.xr-ibtn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--xr-muted);
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
  transition: background .12s, color .12s, border-color .12s;
  flex-shrink: 0;
  line-height: 1;
}
.xr-ibtn:hover {
  background: var(--xr-bg3);
  border-color: var(--xr-border);
  color: var(--xr-text);
}

/* ─── Body ───────────────────────────────────────────────────────────────── */
.xr-body { display: flex; flex: 1; min-height: 0; overflow: hidden; }

/* ─── List pane ──────────────────────────────────────────────────────────── */
.xr-list-pane {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow-y: auto;
  overflow-x: hidden;
  min-width: 130px;
  max-width: 300px;
  flex: 1;
}

/* ─── List wrap (holds pane + fade mask) ──────────────────────────────────── */
.xr-list-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
  border-right: 1px solid var(--xr-border);
}
.xr-list-wrap::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 28px;
  background: linear-gradient(transparent, var(--xr-bg));
  pointer-events: none;
  z-index: 1;
}

/* ─── Drag handle ────────────────────────────────────────────────────────── */
.xr-drag-handle {
  width: 3px;
  background: transparent;
  cursor: col-resize;
  flex-shrink: 0;
  transition: background .15s;
}
.xr-drag-handle:hover,
.xr-drag-handle.xr-dragging {
  background: var(--xr-accent);
  opacity: .35;
}

/* ─── Empty states ───────────────────────────────────────────────────────── */
.xr-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px 20px;
  text-align: center;
  color: var(--xr-muted);
  flex: 1;
  width: 100%;
}
.xr-empty-icon {
  font-size: 28px;
  line-height: 1;
  opacity: .4;
  filter: grayscale(1);
}
.xr-empty-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--xr-subtext);
}
.xr-empty-desc {
  font-size: 11px;
  color: var(--xr-muted);
  line-height: 1.55;
  max-width: 190px;
}
.xr-kbd-hint {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 4px;
  flex-wrap: wrap;
  justify-content: center;
}
.xr-kbd {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 5px;
  background: var(--xr-surface);
  border: 1px solid var(--xr-border);
  border-radius: 4px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 9.5px;
  color: var(--xr-subtext);
  white-space: nowrap;
}

/* ─── Entry rows ─────────────────────────────────────────────────────────── */
.xr-entry {
  padding: 0;
  border-bottom: 1px solid var(--xr-border);
  cursor: pointer;
  transition: background .1s, transform .1s;
  border-left: 3px solid transparent;
  user-select: none;
  flex-shrink: 0;
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 6px;
}
.xr-entry:hover {
  background: linear-gradient(90deg, rgba(255,255,255,.03) 0%, transparent 100%);
  transform: translateX(1px);
}
.xr-entry.xr-selected {
  background: linear-gradient(90deg, rgba(255,255,255,.05) 0%, transparent 100%);
  border-left-color: var(--xr-accent);
}
/* Color the left stripe by method */
.xr-entry[data-method="GET"]    { --xr-stripe: var(--xr-blue);   }
.xr-entry[data-method="POST"]   { --xr-stripe: var(--xr-green);  }
.xr-entry[data-method="PUT"]    { --xr-stripe: var(--xr-yellow); }
.xr-entry[data-method="DELETE"] { --xr-stripe: var(--xr-red);    }
.xr-entry[data-method="PATCH"]  { --xr-stripe: var(--xr-purple); }
.xr-entry.xr-selected { border-left-color: var(--xr-stripe, var(--xr-accent)); }

/* Pin button */
.xr-entry-pin {
  flex-shrink: 0;
  cursor: pointer;
  padding: 8px 6px;
  font-size: 12px;
  opacity: 0.4;
  transition: opacity .2s, color .2s, background .2s;
  border-radius: 3px;
  height: 100%;
  align-self: stretch;
  display: flex;
  align-items: center;
}
.xr-entry-pin:hover {
  opacity: 1;
  background: var(--xr-bg3);
}
.xr-entry-pin.xr-active {
  opacity: 1;
  color: var(--xr-accent);
  background: rgba(255, 215, 0, 0.08);
}

/* Entry menu button */
.xr-entry-menu {
  flex-shrink: 0;
  cursor: pointer;
  padding: 8px 6px;
  font-size: 14px;
  opacity: 0.4;
  transition: opacity .2s, background .2s;
  border-radius: 3px;
  height: 100%;
  align-self: stretch;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.xr-entry-menu:hover {
  opacity: 1;
  background: var(--xr-bg3);
}
.xr-entry-menu.xr-open {
  opacity: 1;
  background: var(--xr-surface);
}

/* Content wrapper */
.xr-entry-content {
  flex: 1;
  min-width: 0;
  padding: 8px 10px 8px 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* New entry slide-in */
@keyframes xr-slide-in {
  from { opacity: 0; transform: translateX(8px); }
  to   { opacity: 1; transform: translateX(0); }
}
.xr-entry-new { animation: xr-slide-in .18s ease-out both; }

/* Entry context menu */
.xr-entry-menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--xr-surface);
  border: 1px solid var(--xr-border);
  border-radius: 6px;
  padding: 4px;
  margin-top: 4px;
  min-width: 140px;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0,0,0,.25);
  display: none;
  flex-direction: column;
}
.xr-entry-menu-dropdown.xr-open {
  display: flex;
}
.xr-entry-menu-dropdown button {
  padding: 6px 10px;
  border: none;
  background: transparent;
  text-align: left;
  font-size: 11px;
  cursor: pointer;
  color: var(--xr-text);
  border-radius: 4px;
  transition: background .15s;
  font-family: inherit;
  white-space: nowrap;
}
.xr-entry-menu-dropdown button:hover { background: var(--xr-bg3); }
.xr-entry-menu-dropdown-sep {
  height: 1px;
  background: var(--xr-border);
  margin: 2px 0;
}

.xr-entry-row1 {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 4px;
}
.xr-entry-row2 {
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
  font-size: 10.5px;
  color: var(--xr-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 3px;
  line-height: 1.4;
}
.xr-entry-row3 {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  color: var(--xr-muted);
}
.xr-entry-row3 span { white-space: nowrap; }
.xr-entry-row3 .xr-sep {
  width: 3px; height: 3px;
  border-radius: 50%;
  background: var(--xr-surface);
  flex-shrink: 0;
}

/* Timing bar */
.xr-timing-bar-wrap {
  flex: 1;
  height: 3px;
  background: var(--xr-bg3);
  border-radius: 2px;
  overflow: hidden;
  min-width: 20px;
  max-width: 60px;
  align-self: center;
}
.xr-timing-bar {
  height: 100%;
  border-radius: 2px;
  background: var(--xr-accent);
  opacity: .5;
  max-width: 100%;
  transition: width .3s ease-out;
}
.xr-timing-bar.xr-slow  { background: var(--xr-yellow); }
.xr-timing-bar.xr-vslow { background: var(--xr-red);    }

/* ─── Method / level badges ──────────────────────────────────────────────── */
.xr-method-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 17px;
  min-width: 32px;
  padding: 0 6px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .6px;
  text-transform: uppercase;
  flex-shrink: 0;
  line-height: 1;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}
/* HTTP methods — solid look */
.xr-m-get     { background: rgba(96,165,250,.18);  color: var(--xr-blue);   border: 1px solid rgba(96,165,250,.2);  }
.xr-m-post    { background: rgba(74,222,128,.18);  color: var(--xr-green);  border: 1px solid rgba(74,222,128,.2);  }
.xr-m-put     { background: rgba(251,191,36,.18);  color: var(--xr-yellow); border: 1px solid rgba(251,191,36,.2);  }
.xr-m-delete  { background: rgba(248,113,113,.18); color: var(--xr-red);    border: 1px solid rgba(248,113,113,.2); }
.xr-m-patch   { background: rgba(192,132,252,.18); color: var(--xr-purple); border: 1px solid rgba(192,132,252,.2); }
.xr-m-head    { background: rgba(96,165,250,.11);  color: var(--xr-blue);   border: 1px solid rgba(96,165,250,.15); }
.xr-m-options { background: rgba(251,146,60,.11);  color: var(--xr-orange); border: 1px solid rgba(251,146,60,.15); }
/* Log levels */
.xr-m-log     { background: rgba(45,212,191,.15);  color: #2dd4bf;          border: 1px solid rgba(45,212,191,.2);  }
.xr-m-warn    { background: rgba(251,191,36,.15);  color: var(--xr-yellow); border: 1px solid rgba(251,191,36,.2);  }
.xr-m-error   { background: rgba(248,113,113,.15); color: var(--xr-red);    border: 1px solid rgba(248,113,113,.2); }
.xr-m-info    { background: rgba(96,165,250,.15);  color: var(--xr-blue);   border: 1px solid rgba(96,165,250,.2);  }
.xr-m-debug   { background: rgba(192,132,252,.15); color: var(--xr-purple); border: 1px solid rgba(192,132,252,.2); }

/* ─── Status codes ───────────────────────────────────────────────────────── */
.xr-status {
  font-size: 10px;
  font-weight: 700;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  letter-spacing: .2px;
  padding: 1px 5px;
  border-radius: 3px;
}
.xr-s0 { color: var(--xr-muted);  background: rgba(255,255,255,.04); }
.xr-s2 { color: var(--xr-green);  background: rgba(74,222,128,.1);   }
.xr-s3 { color: var(--xr-blue);   background: rgba(96,165,250,.1);   }
.xr-s4 { color: var(--xr-yellow); background: rgba(251,191,36,.1);   }
.xr-s5 { color: var(--xr-red);    background: rgba(248,113,113,.1);  }

/* ─── Detail pane ────────────────────────────────────────────────────────── */
.xr-detail-pane {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}
.xr-detail-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 12px;
  padding: 24px;
  text-align: center;
}
.xr-detail-empty .xr-empty-icon {
  font-size: 32px;
  opacity: .35;
  filter: grayscale(1);
}
.xr-detail-empty .xr-empty-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--xr-subtext);
}
.xr-detail-empty .xr-empty-desc {
  font-size: 11px;
  color: var(--xr-muted);
  max-width: 220px;
  line-height: 1.65;
}

/* Detail header */
.xr-detail-header {
  background: linear-gradient(180deg, var(--xr-bg2) 0%, var(--xr-bg) 100%);
  border-bottom: 1px solid var(--xr-border);
  flex-shrink: 0;
}
.xr-detail-url-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 11px 12px 6px;
}
.xr-detail-url {
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 11px;
  color: var(--xr-text);
  word-break: break-all;
  line-height: 1.6;
  flex: 1;
  min-width: 0;
}
/* highlight the path part */
.xr-detail-url .xr-url-host { color: var(--xr-muted); }
.xr-detail-url .xr-url-path { color: var(--xr-text); }
.xr-detail-url .xr-url-qs   { color: var(--xr-subtext); }

/* Pills */
.xr-pills-row {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 2px 12px 10px;
  flex-wrap: wrap;
}
.xr-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: var(--xr-bg3);
  border: 1px solid var(--xr-border);
  border-radius: 20px;
  font-size: 10px;
  line-height: 1;
  transition: border-color .12s;
}
.xr-pill:hover { border-color: var(--xr-ring); }
.xr-pill-label { color: var(--xr-muted); }
.xr-pill-val   { color: var(--xr-text); font-weight: 600; font-family: 'JetBrains Mono', monospace; font-size: 9.5px; }
.xr-pill-val.xr-s2 { color: var(--xr-green);  }
.xr-pill-val.xr-s3 { color: var(--xr-blue);   }
.xr-pill-val.xr-s4 { color: var(--xr-yellow); }
.xr-pill-val.xr-s5 { color: var(--xr-red);    }
.xr-pill-val.xr-decrypted { color: var(--xr-green); }
.xr-pill-val.xr-plain     { color: var(--xr-muted);  }

/* Toolbar */
.xr-toolbar-row {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
}
.xr-view-toggle {
  display: flex;
  gap: 1px;
  background: var(--xr-bg3);
  border: 1px solid var(--xr-border);
  border-radius: 6px;
  padding: 2px;
}
.xr-toggle-btn {
  padding: 3px 11px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--xr-muted);
  font-size: 10px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background .12s, color .12s;
  line-height: 1.4;
}
.xr-toggle-btn:hover { color: var(--xr-subtext); }
.xr-toggle-btn.xr-active {
  background: var(--xr-surface);
  color: var(--xr-text);
  box-shadow: 0 1px 3px rgba(0,0,0,.25);
}
.xr-toolbar-spacer { flex: 1; }
.xr-copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 11px;
  background: var(--xr-bg3);
  border: 1px solid var(--xr-border);
  border-radius: 6px;
  color: var(--xr-subtext);
  font-size: 10px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: border-color .12s, color .12s, background .12s;
  line-height: 1.4;
}
.xr-copy-btn:hover { border-color: var(--xr-ring); color: var(--xr-text); background: var(--xr-surface); }
.xr-copy-btn.xr-copied { border-color: var(--xr-green); color: var(--xr-green); background: rgba(74,222,128,.06); }

/* Sub-tabs */
.xr-dtabs {
  display: flex;
  padding: 0 12px;
  background: var(--xr-bg2);
  border-bottom: 1px solid var(--xr-border);
  flex-shrink: 0;
  gap: 0;
}
.xr-dtab {
  padding: 9px 13px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--xr-muted);
  font-size: 10.5px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: color .12s, border-color .12s, background .12s;
  margin-bottom: -1px;
  line-height: 1.4;
  border-radius: 4px 4px 0 0;
}
.xr-dtab:hover { color: var(--xr-subtext); background: rgba(255,255,255,.02); }
.xr-dtab.xr-active {
  color: var(--xr-text);
  border-bottom-color: var(--xr-accent);
  font-weight: 600;
}

/* Content area */
.xr-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
  padding: 12px;
  min-height: 0;
}

/* ─── Tree ───────────────────────────────────────────────────────────────── */
.xr-tree-root {
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
  font-size: 11px;
  line-height: 1.75;
}
.xr-line {
  display: flex;
  align-items: baseline;
  min-height: 22px;
  border-radius: 3px;
}
.xr-line:hover { background: rgba(255,255,255,.03); }
/* Connector guide lines */
.xr-children {
  position: relative;
}
.xr-children::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 11px;
  left: var(--xr-connector-left, 7px);
  width: 1px;
  background: var(--xr-border);
  pointer-events: none;
}
.xr-tog {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  cursor: pointer;
  color: var(--xr-muted);
  font-size: 7px;
  margin-right: 2px;
  border-radius: 2px;
  transition: color .1s, background .1s;
  align-self: center;
}
.xr-tog::before { content: '▶'; }
.xr-tog.xr-open::before { content: '▼'; }
.xr-tog.xr-leaf::before { content: ''; cursor: default; }
.xr-tog:not(.xr-leaf):hover { color: var(--xr-text); background: rgba(255,255,255,.05); }
.xr-key   { color: var(--xr-blue); }
.xr-punct { color: var(--xr-muted); }
.xr-brack { color: var(--xr-subtext); font-weight: 600; }
.xr-prev  { color: var(--xr-muted); font-style: italic; }
/* Value types */
.xr-val {
  cursor: pointer;
  border-radius: 2px;
  padding: 0 1px;
  transition: background .1s;
}
.xr-val:hover { background: rgba(255,255,255,.07); }
.xr-string  { color: var(--xr-green);  }
.xr-number  { color: var(--xr-blue);   }
.xr-boolean { color: var(--xr-orange); }
.xr-null    { color: var(--xr-muted); font-style: italic; }
/* Copy flash */
@keyframes xr-flash {
  0%   { background: rgba(74,222,128,.35); }
  100% { background: transparent; }
}
.xr-flash { animation: xr-flash .65s ease-out forwards; }

/* ─── Raw view with line numbers ─────────────────────────────────────────── */
.xr-raw-wrap {
  display: flex;
  background: var(--xr-bg2);
  border: 1px solid var(--xr-border);
  border-radius: var(--xr-radius);
  overflow: auto;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 11px;
  line-height: 1.7;
}
.xr-raw-gutter {
  display: flex;
  flex-direction: column;
  padding: 12px 10px 12px 14px;
  background: var(--xr-bg3);
  border-right: 1px solid var(--xr-border);
  text-align: right;
  user-select: none;
  flex-shrink: 0;
}
.xr-raw-ln {
  color: var(--xr-muted);
  font-size: 10px;
  line-height: 1.7;
  min-width: 2ch;
}
.xr-raw {
  display: block;
  padding: 12px 14px;
  background: transparent;
  border: none;
  border-radius: 0;
  font-family: inherit;
  font-size: inherit;
  line-height: 1.7;
  color: var(--xr-text);
  white-space: pre-wrap;
  word-break: break-word;
  overflow-x: auto;
  tab-size: 2;
  flex: 1;
  margin: 0;
}

/* ─── Headers view ───────────────────────────────────────────────────────── */
.xr-hsec {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .7px;
  text-transform: uppercase;
  color: var(--xr-muted);
  padding: 10px 0 6px;
  border-bottom: 1px solid var(--xr-border);
  margin-bottom: 4px;
}
.xr-hsec:first-child { padding-top: 0; }
.xr-htable {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
  margin-bottom: 14px;
}
.xr-htable tr { border-bottom: 1px solid var(--xr-border); }
.xr-htable tr:last-child { border-bottom: none; }
.xr-htable td {
  padding: 5px 0;
  vertical-align: top;
  line-height: 1.5;
}
.xr-htable td:first-child {
  color: var(--xr-blue);
  font-weight: 600;
  width: 38%;
  padding-right: 14px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 10.5px;
  word-break: break-all;
}
.xr-htable td:last-child {
  color: var(--xr-subtext);
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 10.5px;
  word-break: break-all;
}

/* ─── Footer ─────────────────────────────────────────────────────────────── */
.xr-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 10px;
  background: linear-gradient(0deg, var(--xr-bg) 0%, var(--xr-bg2) 100%);
  border-top: 1px solid var(--xr-border);
  flex-shrink: 0;
}
.xr-footer-hint {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  color: var(--xr-muted);
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  user-select: none;
}
.xr-footer-hint .xr-kbd {
  font-size: 9px;
  background: var(--xr-surface);
  border: 1px solid var(--xr-border);
  border-radius: 3px;
  padding: 1px 4px;
  color: var(--xr-subtext);
}

/* ─── Grid view ──────────────────────────────────────────────────────────── */
.xr-grid-wrap { display: flex; flex-direction: column; height: 100%; overflow: hidden; }
.xr-grid-info {
  font-size: 10px; color: var(--xr-muted); padding: 4px 10px;
  flex-shrink: 0; border-bottom: 1px solid var(--xr-border);
}
.xr-grid-table-wrap { flex: 1; overflow: auto; }
.xr-grid-table { width: 100%; border-collapse: collapse; font-size: 11px; }
.xr-grid-table thead { position: sticky; top: 0; z-index: 1; }
.xr-grid-th {
  background: var(--xr-bg2); padding: 6px 10px; text-align: left;
  font-weight: 600; font-size: 10px; color: var(--xr-subtext);
  border-bottom: 1px solid var(--xr-border);
  cursor: pointer; user-select: none; white-space: nowrap;
}
.xr-grid-th:hover { color: var(--xr-text); }
.xr-grid-col-num { text-align: right; }
.xr-grid-idx { color: var(--xr-muted); width: 36px; min-width: 36px; text-align: right; cursor: default; }
.xr-grid-sort-ico { color: var(--xr-accent); font-size: 10px; }
.xr-grid-row { cursor: pointer; border-bottom: 1px solid rgba(255,255,255,.03); }
.xr-grid-row:hover td { background: var(--xr-bg3); }
.xr-grid-row.xr-grid-sel td { background: rgba(99,102,241,.1); }
.xr-grid-td {
  padding: 5px 10px; font-size: 11px; color: var(--xr-text);
  white-space: nowrap; max-width: 220px; overflow: hidden; text-overflow: ellipsis;
}
.xr-gc-badge { display: inline-block; padding: 1px 6px; border-radius: 4px; font-size: 10px; }
.xr-gc-null { color: var(--xr-muted); font-style: italic; }
.xr-gc-true { color: var(--xr-green); }
.xr-gc-false { color: var(--xr-red); }
.xr-gc-num { font-family: 'JetBrains Mono','Fira Code',monospace; color: var(--xr-blue); }
.xr-gc-chip {
  background: var(--xr-bg3); color: var(--xr-subtext);
  border: 1px solid var(--xr-border); cursor: help;
}
.xr-grid-drill-back {
  display: flex; align-items: center; gap: 6px;
  padding: 5px 10px; font-size: 11px; color: var(--xr-subtext);
  border-bottom: 1px solid var(--xr-border); cursor: pointer; flex-shrink: 0;
}
.xr-grid-drill-back:hover { color: var(--xr-text); }

/* ─── Diff view ──────────────────────────────────────────────────────────── */
.xr-diff-wrap { display: flex; flex-direction: column; height: 100%; overflow: hidden; }
.xr-diff-toolbar {
  display: flex; align-items: center; gap: 10px;
  padding: 5px 10px; border-bottom: 1px solid var(--xr-border);
  flex-shrink: 0; font-size: 10px;
}
.xr-diff-compare-row {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 10px; border-bottom: 1px solid var(--xr-border);
  flex-shrink: 0; font-size: 10px;
}
.xr-diff-compare-label { color: var(--xr-subtext); white-space: nowrap; }
.xr-diff-compare-row select {
  flex: 1; background: var(--xr-bg3); border: 1px solid var(--xr-border);
  color: var(--xr-text); border-radius: 4px; padding: 3px 8px; font-size: 11px;
}
.xr-diff-toggle { display: flex; align-items: center; gap: 5px; color: var(--xr-subtext); cursor: pointer; }
.xr-diff-toggle input { cursor: pointer; accent-color: var(--xr-accent); }
.xr-diff-legend { display: flex; gap: 8px; margin-left: auto; }
.xr-diff-dot { font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 3px; }
.xr-diff-dot-added  { color: var(--xr-green); background: rgba(74,222,128,.1); }
.xr-diff-dot-removed{ color: var(--xr-red);   background: rgba(248,113,113,.1); }
.xr-diff-dot-changed{ color: var(--xr-yellow);background: rgba(251,191,36,.1); }
.xr-diff-content { flex: 1; overflow: auto; padding: 4px 0; }
.xr-diff-line { position: relative; }
.xr-diff-added   { background: rgba(74,222,128,.08);  border-left: 2px solid var(--xr-green); }
.xr-diff-removed { background: rgba(248,113,113,.08); border-left: 2px solid var(--xr-red); }
.xr-diff-changed { background: rgba(251,191,36,.08);  border-left: 2px solid var(--xr-yellow); }
.xr-diff-modified { }
.xr-diff-same { }
.xr-diff-old-val { color: var(--xr-red) !important; text-decoration: line-through; opacity: .8; }
.xr-diff-new-val { color: var(--xr-green) !important; }
.xr-diff-arrow  { color: var(--xr-muted); margin: 0 4px; font-size: 10px; }

/* ─── Pane search bar ────────────────────────────────────────────────────── */
.xr-pane-search {
  display: flex; align-items: center; gap: 6px;
  padding: 5px 8px; background: var(--xr-bg2);
  border-bottom: 1px solid var(--xr-border); flex-shrink: 0;
}
.xr-pane-search input {
  flex: 1; background: var(--xr-bg3); border: 1px solid var(--xr-border);
  color: var(--xr-text); border-radius: 4px; padding: 3px 8px;
  font-size: 11px; outline: none; font-family: inherit;
}
.xr-pane-search input:focus { border-color: var(--xr-ring); }
.xr-ps-count { font-size: 10px; color: var(--xr-muted); white-space: nowrap; min-width: 48px; text-align: right; }
.xr-ps-nav { display: flex; gap: 2px; }
.xr-ps-nav button, .xr-ps-close {
  background: var(--xr-bg3); border: 1px solid var(--xr-border);
  color: var(--xr-subtext); border-radius: 3px; padding: 2px 6px;
  font-size: 10px; cursor: pointer; font-family: inherit;
}
.xr-ps-nav button:hover, .xr-ps-close:hover { color: var(--xr-text); }
.xr-search-hit     { background: rgba(251,191,36,.25) !important; border-radius: 2px; outline: 1px solid rgba(251,191,36,.4); }
.xr-search-current { background: rgba(251,191,36,.6)  !important; outline: 1px solid rgba(251,191,36,.9); }

/* ─── Copy dropdown ──────────────────────────────────────────────────────── */
.xr-copy-wrap { position: relative; }
.xr-copy-menu {
  position: absolute; right: 0; top: calc(100% + 4px);
  background: var(--xr-bg2); border: 1px solid var(--xr-border);
  border-radius: 6px; box-shadow: 0 8px 28px rgba(0,0,0,.45);
  z-index: 999; min-width: 170px; overflow: hidden;
}
.xr-copy-menu button {
  display: flex; align-items: center; gap: 8px; width: 100%;
  background: none; border: none; color: var(--xr-text);
  padding: 8px 14px; text-align: left; font-size: 11px;
  cursor: pointer; font-family: inherit; white-space: nowrap;
}
.xr-copy-menu button:hover { background: var(--xr-bg3); }
.xr-copy-menu-icon { font-size: 12px; opacity: .7; }

/* ─── Fuzzy overlay ──────────────────────────────────────────────────────── */
.xr-fuzzy-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,.45);
  backdrop-filter: blur(2px);
  z-index: 100;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 48px;
  opacity: 0;
  pointer-events: none;
  transition: opacity .12s;
}
.xr-fuzzy-backdrop.xr-open {
  opacity: 1;
  pointer-events: all;
}
.xr-fuzzy-modal {
  width: calc(100% - 40px);
  max-width: 560px;
  background: var(--xr-bg2);
  border: 1px solid var(--xr-ring);
  border-radius: 10px;
  box-shadow: 0 24px 64px rgba(0,0,0,.5), 0 0 0 1px rgba(99,102,241,.15);
  overflow: hidden;
  transform: translateY(-6px) scale(.98);
  transition: transform .12s;
}
.xr-fuzzy-backdrop.xr-open .xr-fuzzy-modal {
  transform: translateY(0) scale(1);
}
.xr-fuzzy-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--xr-border);
}
.xr-fuzzy-icon {
  color: var(--xr-ring);
  font-size: 14px;
  flex-shrink: 0;
  opacity: .8;
}
.xr-fuzzy-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--xr-text);
  font-size: 13px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  caret-color: var(--xr-ring);
}
.xr-fuzzy-input::placeholder { color: var(--xr-muted); }
.xr-fuzzy-esc {
  font-size: 9px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  color: var(--xr-muted);
  background: var(--xr-surface);
  border: 1px solid var(--xr-border);
  border-radius: 3px;
  padding: 2px 5px;
  flex-shrink: 0;
}
.xr-fuzzy-results {
  max-height: 320px;
  overflow-y: auto;
  padding: 4px 0;
}
.xr-fuzzy-empty {
  padding: 22px 14px;
  text-align: center;
  color: var(--xr-muted);
  font-size: 11.5px;
}
.xr-fuzzy-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  cursor: pointer;
  transition: background .08s;
  border-radius: 0;
}
.xr-fuzzy-row:hover, .xr-fuzzy-row.xr-fuzzy-sel {
  background: var(--xr-surface);
}
.xr-fuzzy-row.xr-fuzzy-sel {
  background: rgba(99,102,241,.13);
  border-left: 2px solid var(--xr-ring);
  padding-left: 12px;
}
.xr-fuzzy-badge {
  font-size: 9px;
  font-weight: 700;
  padding: 2px 5px;
  border-radius: 3px;
  flex-shrink: 0;
  text-transform: uppercase;
  letter-spacing: .5px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}
.xr-fuzzy-url {
  flex: 1;
  font-size: 11.5px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  color: var(--xr-subtext);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
.xr-fuzzy-url mark {
  background: transparent;
  color: var(--xr-text);
  font-weight: 700;
}
.xr-fuzzy-status {
  font-size: 10px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  flex-shrink: 0;
  opacity: .7;
}
.xr-fuzzy-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px;
  border-top: 1px solid var(--xr-border);
  background: var(--xr-bg);
}
.xr-fuzzy-footer span {
  font-size: 9.5px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  color: var(--xr-muted);
  display: flex;
  align-items: center;
  gap: 4px;
}
.xr-fuzzy-footer .xr-kbd {
  font-size: 8.5px;
  background: var(--xr-surface);
  border: 1px solid var(--xr-border);
  border-radius: 3px;
  padding: 1px 4px;
}
.xr-count {
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  font-weight: 600;
  color: var(--xr-subtext);
  background: var(--xr-surface);
  border: 1px solid var(--xr-border);
  border-radius: 20px;
  padding: 2px 7px;
  white-space: nowrap;
  flex-shrink: 0;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  letter-spacing: .02em;
}
.xr-clear-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0 10px;
  background: var(--xr-bg3);
  border: 1px solid var(--xr-border);
  border-radius: 6px;
  color: var(--xr-subtext);
  font-size: 10px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background .12s, border-color .12s, color .12s;
  white-space: nowrap;
  flex-shrink: 0;
  line-height: 1;
}
.xr-clear-btn:hover {
  background: rgba(248,113,113,.1);
  border-color: var(--xr-red);
  color: var(--xr-red);
}

/* ─── Copy & Export Modal ────────────────────────────────────────────────── */
.xr-copy-backdrop {
  display: none;
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,.6);
  z-index: 9999;
  align-items: center;
  justify-content: center;
  font-family: inherit;
}
.xr-copy-backdrop.xr-open {
  display: flex;
}
.xr-copy-modal {
  background: var(--xr-bg);
  border: 1px solid var(--xr-border);
  border-radius: 8px;
  width: 90%;
  max-width: 580px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,.3);
}
.xr-copy-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--xr-border);
  flex-shrink: 0;
}
.xr-copy-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--xr-text);
  font-family: inherit;
  flex: 1;
}
.xr-copy-close {
  background: none;
  border: none;
  color: var(--xr-muted);
  font-size: 16px;
  cursor: pointer;
  padding: 4px 8px;
  transition: color .12s;
  flex-shrink: 0;
}
.xr-copy-close:hover {
  color: var(--xr-text);
}
.xr-copy-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 20px;
  flex: 1;
  overflow-y: auto;
}
.xr-copy-format {
  display: flex;
  align-items: center;
  gap: 8px;
}
.xr-copy-format-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--xr-muted);
  text-transform: uppercase;
  letter-spacing: .5px;
  flex-shrink: 0;
  width: 60px;
}
.xr-copy-format-select {
  flex: 1;
  background: var(--xr-bg2);
  border: 1px solid var(--xr-border);
  border-radius: 5px;
  color: var(--xr-text);
  font-size: 11px;
  padding: 6px 8px;
  font-family: inherit;
  cursor: pointer;
}
.xr-copy-preview {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.xr-copy-preview-label {
  font-size: 10px;
  color: var(--xr-muted);
  text-transform: uppercase;
  letter-spacing: .5px;
  font-weight: 600;
}
.xr-copy-code {
  background: var(--xr-bg2);
  border: 1px solid var(--xr-border);
  border-radius: 5px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 10px;
  color: var(--xr-text);
  padding: 10px;
  overflow-y: auto;
  max-height: 320px;
  white-space: pre-wrap;
  word-break: break-word;
}
.xr-copy-footer {
  display: flex;
  gap: 8px;
  padding: 16px 20px;
  border-top: 1px solid var(--xr-border);
  flex-shrink: 0;
  justify-content: flex-end;
}
.xr-copy-btn {
  background: var(--xr-ring);
  border: 1px solid var(--xr-ring);
  color: white;
  border-radius: 5px;
  padding: 7px 14px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity .12s;
  font-family: inherit;
}
.xr-copy-btn:hover {
  opacity: 0.9;
}
.xr-copy-btn-cancel {
  background: transparent;
  border: 1px solid var(--xr-border);
  color: var(--xr-text);
}
.xr-copy-btn-cancel:hover {
  background: var(--xr-surface);
}


/* ─── Scrollbar ──────────────────────────────────────────────────────────── */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--xr-surface); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--xr-overlay); }
    `;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // HTML template
  // ══════════════════════════════════════════════════════════════════════════
  function _buildHTML() {
    const panel = document.createElement('div');
    panel.id = 'xr-panel';
    panel.innerHTML = `
<div class="xr-fuzzy-backdrop" id="xr-fuzzy-backdrop">
  <div class="xr-fuzzy-modal">
    <div class="xr-fuzzy-input-row">
      <span class="xr-fuzzy-icon">⌕</span>
      <input class="xr-fuzzy-input" id="xr-fuzzy-input" type="text" placeholder="Search requests…" autocomplete="off" spellcheck="false" />
      <span class="xr-fuzzy-esc">esc</span>
    </div>
    <div class="xr-fuzzy-results" id="xr-fuzzy-results"></div>
    <div class="xr-fuzzy-footer">
      <span><span class="xr-kbd">↑↓</span> navigate</span>
      <span><span class="xr-kbd">↵</span> select</span>
      <span><span class="xr-kbd">esc</span> close</span>
    </div>
  </div>
</div>
<div id="xr-panel-resize" title="Drag to resize panel"></div>
<div class="xr-header">
  <div class="xr-wordmark">
    <span class="xr-logo-icon">&gt;_</span>
    <span class="xr-logo-text">Console</span>
    <span class="xr-capture-dot" id="xr-capture-dot"></span>
  </div>
  <div class="xr-tabs">
    <button class="xr-tab xr-active" data-tab="api">
      API <span class="xr-tab-badge" id="xr-api-count">0</span>
    </button>
    <button class="xr-tab" data-tab="logs">
      Logs <span class="xr-tab-badge" id="xr-log-count">0</span>
    </button>
  </div>
  <div class="xr-hspacer"></div>
  <div class="xr-dots" id="xr-dots"></div>
  <button class="xr-ibtn" id="xr-close" title="Close (Esc)">✕</button>
</div>
<div class="xr-body">
  <div class="xr-list-wrap">
    <div class="xr-list-pane" id="xr-list-pane"></div>
  </div>
  <div class="xr-drag-handle" id="xr-drag-handle"></div>
  <div class="xr-detail-pane" id="xr-detail-pane"></div>
</div>
<div class="xr-footer">
  <div class="xr-footer-hint">
    <span class="xr-kbd">Ctrl+K</span> search
  </div>
  <span class="xr-count" id="xr-count">0</span>
  <button class="xr-clear-btn" id="xr-clear">Clear</button>
</div>
<div class="xr-copy-backdrop" id="xr-copy-backdrop">
  <div class="xr-copy-modal">
    <div class="xr-copy-header">
      <div class="xr-copy-title" id="xr-copy-title">Copy & Export</div>
      <button class="xr-copy-close" id="xr-copy-close">✕</button>
    </div>
    <div class="xr-copy-body">
      <div class="xr-copy-format">
        <label class="xr-copy-format-label">Format:</label>
        <select class="xr-copy-format-select" id="xr-copy-format">
          <option value="fetch">JavaScript: fetch()</option>
          <option value="js-object">JavaScript: Object</option>
          <option value="ts-object">TypeScript: Object</option>
          <option value="json">JSON</option>
          <option value="curl">cURL</option>
          <option value="python">Python: requests</option>
          <option value="go">Go: http.Client</option>
          <option value="jest">Jest: Test case</option>
        </select>
      </div>
      <div class="xr-copy-preview">
        <div class="xr-copy-preview-label">Preview:</div>
        <pre class="xr-copy-code" id="xr-copy-code"></pre>
      </div>
    </div>
    <div class="xr-copy-footer">
      <button class="xr-copy-btn xr-copy-btn-cancel" id="xr-copy-cancel">Cancel</button>
      <button class="xr-copy-btn" id="xr-copy-btn">Copy</button>
    </div>
  </div>
</div>
    `.trim();
    return panel;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Theme management
  // ══════════════════════════════════════════════════════════════════════════
  function _applyTheme(name) {
    const themes = window.XRAY_Themes || {};
    const theme  = themes[name] || themes['zinc'];
    if (!theme || !_dom.panel) return;
    Object.entries(theme.vars).forEach(([k, v]) => _dom.panel.style.setProperty(k, v));
    _state.theme = name;
    _root.querySelectorAll('.xr-dot').forEach(d =>
      d.classList.toggle('xr-active', d.dataset.theme === name)
    );
  }

  function _buildDots() {
    const container = _dom.dots;
    if (!container) return;
    container.innerHTML = '';

    // Create theme dots with dropdown
    const dotsWrapper = document.createElement('div');
    dotsWrapper.style.display = 'flex';
    dotsWrapper.style.alignItems = 'center';
    dotsWrapper.style.gap = '6px';
    dotsWrapper.style.position = 'relative';

    const themeList = window.XRAY_ThemesList || [];
    
    // Show first dot as "picker" trigger
    if (themeList.length > 0) {
      const triggerDot = document.createElement('div');
      triggerDot.className = 'xr-dot' + (_state.theme === themeList[0].id ? ' xr-active' : '');
      triggerDot.style.background = themeList[0].dot;
      triggerDot.title = 'Change theme';
      triggerDot.style.cursor = 'pointer';

      const dropdown = document.createElement('div');
      dropdown.className = 'xr-theme-dropdown';

      themeList.forEach(({ id, name, dot }) => {
        const btn = document.createElement('button');
        btn.textContent = name;
        btn.dataset.theme = id;
        if (id === _state.theme) btn.classList.add('xr-active');
        btn.addEventListener('click', () => {
          _applyTheme(id);
          _saveTheme(id);
          dropdown.classList.remove('xr-open');
          _buildDots();
        });
        dropdown.appendChild(btn);
      });

      triggerDot.addEventListener('click', () => {
        dropdown.classList.toggle('xr-open');
      });

      dotsWrapper.appendChild(triggerDot);
      dotsWrapper.appendChild(dropdown);
    }

    container.appendChild(dotsWrapper);
  }

  // Close theme dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const dropdown = _dom.dots?.querySelector('.xr-theme-dropdown');
    if (dropdown && !_dom.dots?.contains(e.target)) {
      dropdown.classList.remove('xr-open');
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // State persistence
  // ══════════════════════════════════════════════════════════════════════════
  function _saveState() {
    window.XRAY_Store.set(STORE_KEY, {
      open:       _state.open,
      theme:      _state.theme,
      listWidth:  _state.listWidth,
      panelWidth: _state.panelWidth,
    });
  }

  async function _loadState() {
    const saved = await window.XRAY_Store.get(STORE_KEY, {});
    if (saved.theme && window.XRAY_Themes?.[saved.theme]) {
      _state.theme = saved.theme;
    }
    if (typeof saved.listWidth === 'number') {
      _state.listWidth = Math.min(300, Math.max(130, saved.listWidth));
    }
    if (typeof saved.panelWidth === 'number') {
      _state.panelWidth = Math.min(MAX_PANEL_W, Math.max(MIN_PANEL_W, saved.panelWidth));
    }
    if (typeof saved.open === 'boolean') {
      _state.open = saved.open;
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Entry helpers
  // ══════════════════════════════════════════════════════════════════════════
  function _filteredEntries() {
    const byTab = _state.entries.filter(e =>
      (_state.activeTab === 'api'  && e.type === 'api') ||
      (_state.activeTab === 'logs' && e.type === 'log')
    );
    const searched = window.XRAY_Search.filter(byTab, _state.filter);
    const filtered = _applyFilters(searched);
    
    // Sort: pinned first, then by timestamp desc
    return filtered.sort((a, b) => {
      const aPinned = _state.pinned.has(a.id);
      const bPinned = _state.pinned.has(b.id);
      if (aPinned !== bPinned) return aPinned ? -1 : 1;
      return (b.timestamp || 0) - (a.timestamp || 0);
    });
  }

  function _entryMatchesCurrentTab(entry) {
    return (_state.activeTab === 'api'  && entry.type === 'api') ||
           (_state.activeTab === 'logs' && entry.type === 'log');
  }

  function _entryMatchesFilter(entry) {
    return window.XRAY_Search.filter([entry], _state.filter).length > 0;
  }

  function _updateCounts() {
    const api  = _state.entries.filter(e => e.type === 'api').length;
    const logs = _state.entries.filter(e => e.type === 'log').length;
    if (_dom.apiCount)   _dom.apiCount.textContent   = api;
    if (_dom.logCount)   _dom.logCount.textContent   = logs;
    const shown = _filteredEntries().length;
    if (_dom.footerCount)
      _dom.footerCount.textContent = shown;
  }

  function _updateFilterUI() {
    // Update status code buttons
    _root.querySelectorAll('.xr-filter-btn[data-filter]').forEach(btn => {
      const filter = btn.dataset.filter;
      if (filter === 'all') {
        btn.classList.toggle('xr-active', _state.filters.statusCodes.length === 0);
      } else {
        const range = filter + 'xx';
        btn.classList.toggle('xr-active', _state.filters.statusCodes.includes(range));
      }
    });
    // Update type buttons
    _root.querySelectorAll('.xr-filter-btn[data-filter-type]').forEach(btn => {
      btn.classList.toggle('xr-active', _state.filters.types.includes(btn.dataset.filterType));
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // List rendering
  // ══════════════════════════════════════════════════════════════════════════
  function _renderEntry(entry) {
    const { formatTime, formatDuration, formatSize, statusClass, methodClass, shortPath, previewJSON } =
      window.XRAY_Utils;

    const el = document.createElement('div');
    el.className = 'xr-entry' + (entry.id === _state.selectedId ? ' xr-selected' : '');
    el.dataset.id = entry.id;

    const isPinned = _state.pinned.has(entry.id);

    if (entry.type === 'api') {
      const method  = (entry.method || 'GET').toUpperCase();
      const mClass  = methodClass(entry.method || 'GET');
      const sClass  = statusClass(entry.status);
      const path    = shortPath(entry.url || '');
      const dur     = entry.duration ?? 0;
      // timing bar: 0-200ms=fast, 200-1000ms=slow, 1000+ms=very slow
      const barPct  = Math.min(100, dur <= 0 ? 0 : dur < 200 ? (dur / 200) * 50 : dur < 1000 ? 50 + ((dur-200)/800)*40 : 90 + Math.min(10, (dur-1000)/500));
      const barCls  = dur > 1000 ? 'xr-vslow' : dur > 300 ? 'xr-slow' : '';
      el.dataset.method = method;
      el.innerHTML = `
        <div class="xr-entry-pin ${isPinned ? 'xr-active' : ''}" title="${isPinned ? 'Unpin' : 'Pin'}">${isPinned ? '⭐' : '☆'}</div>
        <div class="xr-entry-content">
          <div class="xr-entry-row1">
            <span class="xr-method-badge ${mClass}">${method}</span>
            <span class="xr-status ${sClass}">${entry.status || '—'}</span>
            <span style="flex:1"></span>
            <span style="font-size:9.5px;color:var(--xr-muted);font-family:'JetBrains Mono',monospace">${formatDuration(entry.duration)}</span>
          </div>
          <div class="xr-entry-row2" title="${entry.url || ''}">${path}</div>
          <div class="xr-entry-row3">
            <span>${formatSize(entry.size)}</span>
            <span class="xr-sep"></span>
            <span>${formatTime(entry.timestamp || Date.now())}</span>
            <div class="xr-timing-bar-wrap" title="${dur}ms">
              <div class="xr-timing-bar ${barCls}" style="width:${barPct}%"></div>
            </div>
          </div>
        </div>
        <div class="xr-entry-menu" title="More options">⋯</div>
      `;
      
      // Pin button click handler
      el.querySelector('.xr-entry-pin').addEventListener('click', (e) => {
        e.stopPropagation();
        if (_state.pinned.has(entry.id)) {
          _state.pinned.delete(entry.id);
        } else {
          _state.pinned.add(entry.id);
        }
        _savePinned();
        _rebuildList();
      });
    } else {
      const level   = (entry.logLevel || 'log').toLowerCase();
      const preview = previewJSON(entry.logData, 64);
      el.innerHTML = `
        <div class="xr-entry-pin ${isPinned ? 'xr-active' : ''}" title="${isPinned ? 'Unpin' : 'Pin'}">${isPinned ? '⭐' : '☆'}</div>
        <div class="xr-entry-content">
          <div class="xr-entry-row1">
            <span class="xr-method-badge xr-m-${level}">${level.toUpperCase()}</span>
            <span style="flex:1"></span>
            <span style="font-size:9.5px;color:var(--xr-muted)">${formatTime(entry.timestamp || Date.now())}</span>
          </div>
          <div class="xr-entry-row2" title="${String(preview)}">${preview}</div>
        </div>
        <div class="xr-entry-menu" title="More options">⋯</div>
      `;
      
      el.querySelector('.xr-entry-pin').addEventListener('click', (e) => {
        e.stopPropagation();
        if (_state.pinned.has(entry.id)) {
          _state.pinned.delete(entry.id);
        } else {
          _state.pinned.add(entry.id);
        }
        _savePinned();
        _rebuildList();
      });
    }

    // Menu button handler
    const menuBtn = el.querySelector('.xr-entry-menu');
    if (menuBtn) {
      // Create dropdown menu
      const dropdown = document.createElement('div');
      dropdown.className = 'xr-entry-menu-dropdown';

      const menuItems = [
        { label: isPinned ? '☆ Unpin' : '⭐ Pin', action: () => {
          if (_state.pinned.has(entry.id)) _state.pinned.delete(entry.id);
          else _state.pinned.add(entry.id);
          _savePinned();
          _rebuildList();
        }},
        { label: '🔗 Open in tab', action: () => {
          if (entry.url) window.open(entry.url, '_blank');
        }},
        { label: '🔄 Replay', action: () => {
          // TODO: implement replay
          console.log('Replay:', entry.id);
        }},
        null, // separator
        { label: '📋 Copy & Export', action: () => {
          _openCopyModal(entry);
        }},
      ];

      menuItems.forEach(item => {
        if (!item) {
          const sep = document.createElement('div');
          sep.className = 'xr-entry-menu-dropdown-sep';
          dropdown.appendChild(sep);
          return;
        }
        const btn = document.createElement('button');
        btn.textContent = item.label;
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          item.action();
          dropdown.classList.remove('xr-open');
        });
        dropdown.appendChild(btn);
      });

      menuBtn.appendChild(dropdown);

      menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('xr-open');
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!el.contains(e.target)) {
          dropdown.classList.remove('xr-open');
        }
      });
    }

    el.addEventListener('click', () => _selectEntry(entry.id));
    return el;
  }

  function _rebuildList() {
    const pane = _dom.listPane;
    if (!pane) return;
    pane.innerHTML = '';

    // Build filter bar
    const filterBar = document.createElement('div');
    filterBar.className = 'xr-filter-bar';
    filterBar.id = 'xr-filter-bar';

    const filters = [
      { attr: 'data-filter', val: 'all', label: 'All' },
      { attr: 'data-filter', val: '2xx', label: '2xx' },
      { attr: 'data-filter', val: '3xx', label: '3xx' },
      { attr: 'data-filter', val: '4xx', label: '4xx' },
      { attr: 'data-filter', val: '5xx', label: '5xx' },
    ];

    filters.forEach(({ attr, val, label }) => {
      const btn = document.createElement('button');
      btn.className = 'xr-filter-btn';
      btn.setAttribute(attr, val);
      btn.textContent = label;
      if ((val === 'all' && _state.filters.statusCodes.length === 0) ||
          (val !== 'all' && _state.filters.statusCodes.includes(val + 'xx'))) {
        btn.classList.add('xr-active');
      }
      btn.addEventListener('click', () => {
        if (val === 'all') {
          _state.filters.statusCodes = [];
        } else {
          const range = val + 'xx';
          if (_state.filters.statusCodes.includes(range)) {
            _state.filters.statusCodes = _state.filters.statusCodes.filter(f => f !== range);
          } else {
            _state.filters.statusCodes.push(range);
          }
        }
        _saveFilters();
        _rebuildList();
        _updateCounts();
      });
      filterBar.appendChild(btn);
    });

    // Type toggles
    const types = [
      { val: 'fetch', label: '📡 Fetch' },
      { val: 'xhr', label: '🔗 XHR' },
      { val: 'log', label: '📋 Log' },
    ];

    types.forEach(({ val, label }) => {
      const btn = document.createElement('button');
      btn.className = 'xr-filter-btn';
      btn.setAttribute('data-filter-type', val);
      btn.textContent = label;
      if (_state.filters.types.includes(val)) btn.classList.add('xr-active');
      btn.addEventListener('click', () => {
        if (_state.filters.types.includes(val)) {
          _state.filters.types = _state.filters.types.filter(t => t !== val);
        } else {
          _state.filters.types.push(val);
        }
        _saveFilters();
        _rebuildList();
        _updateCounts();
      });
      filterBar.appendChild(btn);
    });

    pane.appendChild(filterBar);

    const filtered = _filteredEntries();

    if (filtered.length === 0) {
      const icon  = _state.activeTab === 'api' ? '◈' : '◉';
      const title = _state.filter
        ? 'No matches'
        : `No ${_state.activeTab === 'api' ? 'requests' : 'logs'} yet`;
      const desc  = _state.filter
        ? 'Try a different search term.'
        : _state.activeTab === 'api'
          ? 'Make a fetch/XHR call on the page and it will appear here.'
          : 'Use console.log() on the page or call jv(data) to inspect any object.';
      const hint = !_state.filter && _state.activeTab === 'api'
        ? `<div class="xr-kbd-hint"><span class="xr-kbd">Ctrl+Shift+X</span> toggle panel</div>`
        : '';
      pane.innerHTML += `
        <div class="xr-empty-state">
          <div class="xr-empty-icon">${icon}</div>
          <div class="xr-empty-title">${title}</div>
          <div class="xr-empty-desc">${desc}</div>
          ${hint}
        </div>
      `;
      return;
    }

    filtered.forEach(entry => pane.appendChild(_renderEntry(entry)));
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Selection
  // ══════════════════════════════════════════════════════════════════════════
  function _selectEntry(id) {
    _state.selectedId = id;
    _dom.listPane.querySelectorAll('.xr-entry').forEach(el =>
      el.classList.toggle('xr-selected', el.dataset.id === id)
    );
    const entry = _state.entries.find(e => e.id === id) || null;
    _renderDetail(entry);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Detail pane
  // ══════════════════════════════════════════════════════════════════════════
  function _renderDetail(entry) {
    const pane = _dom.detailPane;
    if (!pane) return;
    pane.innerHTML = '';
    _dom.content = null;

    if (!entry) {
      pane.innerHTML = `
        <div class="xr-detail-empty">
          <div class="xr-empty-icon">◈</div>
          <div class="xr-empty-title">No request selected</div>
          <div class="xr-empty-desc">Select an entry from the list to inspect its response, headers and body.</div>
          <div class="xr-kbd-hint">
            <span class="xr-kbd">↑↓ navigate</span>
            <span class="xr-kbd">T tree</span>
            <span class="xr-kbd">R raw</span>
            <span class="xr-kbd">C copy</span>
          </div>
        </div>
      `;
      return;
    }

    const { formatDuration, formatSize, statusClass, methodClass } = window.XRAY_Utils;
    const isApi  = entry.type === 'api';
    const method = isApi
      ? (entry.method || 'GET').toUpperCase()
      : (entry.logLevel || 'log').toUpperCase();
    const mClass = isApi
      ? methodClass(entry.method || 'GET')
      : `xr-m-${(entry.logLevel || 'log').toLowerCase()}`;

    // ── Header block ──────────────────────────────────────────────────────
    const header = document.createElement('div');
    header.className = 'xr-detail-header';

    // URL row — colorize host/path/qs
    const urlRow = document.createElement('div');
    urlRow.className = 'xr-detail-url-row';
    let urlDisplay = '';
    if (isApi && entry.url) {
      try {
        const u = new URL(entry.url);
        urlDisplay = `<span class="xr-url-host">${u.origin}</span>` +
                     `<span class="xr-url-path">${u.pathname}</span>` +
                     (u.search ? `<span class="xr-url-qs">${u.search}</span>` : '');
      } catch { urlDisplay = entry.url; }
    } else {
      urlDisplay = isApi ? (entry.url || '—') : window.XRAY_Utils.previewJSON(entry.logData, 140);
    }
    urlRow.innerHTML = `
      <span class="xr-method-badge ${mClass}" style="margin-top:2px;flex-shrink:0">${method}</span>
      <span class="xr-detail-url">${urlDisplay}</span>
    `;
    header.appendChild(urlRow);

    // Pills (API only)
    if (isApi) {
      const sClass = statusClass(entry.status);
      const hasDecrypted = entry.responseDecrypted !== undefined && entry.responseDecrypted !== null;
      const pillsRow = document.createElement('div');
      pillsRow.className = 'xr-pills-row';
      pillsRow.innerHTML = `
        <div class="xr-pill">
          <span class="xr-pill-label">Status</span>
          <span class="xr-pill-val ${sClass}">${entry.status || '—'}</span>
        </div>
        <div class="xr-pill">
          <span class="xr-pill-label">Time</span>
          <span class="xr-pill-val">${formatDuration(entry.duration)}</span>
        </div>
        <div class="xr-pill">
          <span class="xr-pill-label">Size</span>
          <span class="xr-pill-val">${formatSize(entry.size)}</span>
        </div>
        <div class="xr-pill">
          <span class="xr-pill-label">Body</span>
          <span class="xr-pill-val ${hasDecrypted ? 'xr-decrypted' : 'xr-plain'}">
            ${hasDecrypted ? '🔓 Decrypted' : 'Plain'}
          </span>
        </div>
      `;
      header.appendChild(pillsRow);
    }

    // Toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'xr-toolbar-row';

    // View toggle
    const viewToggle = document.createElement('div');
    viewToggle.className = 'xr-view-toggle';
    viewToggle.id = 'xr-view-toggle';
    const views = [
      { id: 'tree', label: 'Tree' },
      { id: 'grid', label: 'Grid' },
      { id: 'raw',  label: 'Raw'  },
      { id: 'diff', label: 'Diff' },
    ];
    views.forEach(({ id, label }) => {
      const btn = document.createElement('button');
      btn.className = `xr-toggle-btn${_state.activeView === id ? ' xr-active' : ''}`;
      btn.dataset.view = id;
      btn.textContent = label;
      btn.addEventListener('click', () => {
        _state.activeView = id;
        _state.gridDrillRow = null;
        viewToggle.querySelectorAll('.xr-toggle-btn').forEach(b =>
          b.classList.toggle('xr-active', b.dataset.view === _state.activeView)
        );
        _renderContent();
      });
      viewToggle.appendChild(btn);
    });
    toolbar.appendChild(viewToggle);

    const spacer = document.createElement('div');
    spacer.className = 'xr-toolbar-spacer';
    toolbar.appendChild(spacer);

    // Copy dropdown
    const copyWrap = document.createElement('div');
    copyWrap.className = 'xr-copy-wrap';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'xr-copy-btn';
    copyBtn.id = 'xr-copy-btn';
    copyBtn.innerHTML = `<span>⎘</span><span>Copy ▾</span>`;

    const copyMenu = document.createElement('div');
    copyMenu.className = 'xr-copy-menu';
    copyMenu.id = 'xr-copy-menu';
    copyMenu.style.display = 'none';
    [
      { id: 'json',  icon: '{ }', label: 'Copy JSON'       },
      { id: 'curl',  icon: '⌘',  label: 'Copy as cURL'    },
      { id: 'fetch', icon: '⚡',  label: 'Copy as fetch()' },
    ].forEach(({ id, icon, label }) => {
      const item = document.createElement('button');
      item.dataset.copyAs = id;
      item.innerHTML = `<span class="xr-copy-menu-icon">${icon}</span>${label}`;
      item.addEventListener('click', () => {
        copyMenu.style.display = 'none';
        _copySelected(id);
      });
      copyMenu.appendChild(item);
    });

    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = copyMenu.style.display !== 'none';
      copyMenu.style.display = open ? 'none' : 'block';
    });

    // Close dropdown when clicking outside
    _root.addEventListener('click', () => { copyMenu.style.display = 'none'; }, true);

    copyWrap.appendChild(copyBtn);
    copyWrap.appendChild(copyMenu);
    toolbar.appendChild(copyWrap);
    _dom.viewToggle = viewToggle;
    header.appendChild(toolbar);

    pane.appendChild(header);

    // ── Sub-tabs (API only) ───────────────────────────────────────────────
    if (isApi) {
      const dtabs = document.createElement('div');
      dtabs.className = 'xr-dtabs';
      dtabs.innerHTML = `
        <button class="xr-dtab ${_state.activeDTab === 'response' ? 'xr-active' : ''}" data-dtab="response">Response</button>
        <button class="xr-dtab ${_state.activeDTab === 'request'  ? 'xr-active' : ''}" data-dtab="request">Request</button>
        <button class="xr-dtab ${_state.activeDTab === 'headers'  ? 'xr-active' : ''}" data-dtab="headers">Headers</button>
      `;
      dtabs.querySelectorAll('.xr-dtab').forEach(btn => {
        btn.addEventListener('click', () => {
          _state.activeDTab = btn.dataset.dtab;
          _state.gridDrillRow = null;
          dtabs.querySelectorAll('.xr-dtab').forEach(b =>
            b.classList.toggle('xr-active', b.dataset.dtab === _state.activeDTab)
          );
          _renderContent();
        });
      });
      pane.appendChild(dtabs);
    }

    // ── Pane search bar ───────────────────────────────────────────────────
    const psBar = document.createElement('div');
    psBar.className = 'xr-pane-search';
    psBar.style.display = 'none';

    const psInput = document.createElement('input');
    psInput.type = 'text';
    psInput.placeholder = 'Search in response…';
    psInput.value = _state.paneSearch.query;

    const psCount = document.createElement('span');
    psCount.className = 'xr-ps-count';

    const psNav = document.createElement('div');
    psNav.className = 'xr-ps-nav';
    const psPrev = document.createElement('button');
    psPrev.textContent = '↑';
    psPrev.title = 'Previous match (Shift+Enter)';
    const psNext = document.createElement('button');
    psNext.textContent = '↓';
    psNext.title = 'Next match (Enter)';
    psNav.appendChild(psPrev);
    psNav.appendChild(psNext);

    const psClose = document.createElement('button');
    psClose.className = 'xr-ps-close';
    psClose.textContent = '✕';

    psBar.appendChild(psInput);
    psBar.appendChild(psCount);
    psBar.appendChild(psNav);
    psBar.appendChild(psClose);
    pane.appendChild(psBar);

    _dom.paneSearchBar   = psBar;
    _dom.paneSearchInput = psInput;
    _dom.paneSearchCount = psCount;

    psInput.addEventListener('input', () => {
      _state.paneSearch.query = psInput.value;
      _state.paneSearch.current = 0;
      _paneSearchUpdate();
    });
    psInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); e.shiftKey ? _paneSearchNav(-1) : _paneSearchNav(1); }
      if (e.key === 'Escape') { e.stopPropagation(); _paneSearchClose(); }
    });
    psPrev.addEventListener('click', () => _paneSearchNav(-1));
    psNext.addEventListener('click', () => _paneSearchNav(1));
    psClose.addEventListener('click', () => _paneSearchClose());

    // ── Content area ──────────────────────────────────────────────────────
    const content = document.createElement('div');
    content.className = 'xr-content';
    pane.appendChild(content);
    _dom.content = content;

    _renderContent();
  }

  function _tryParseRaw(raw) {
    if (!raw || typeof raw !== 'string') return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  function _getEntryData(entry) {
    if (!entry) return null;
    if (entry.type === 'log') return entry.logData ?? null;
    if (_state.activeDTab === 'request') return entry.requestBody ?? null;
    return entry.responseDecrypted ?? _tryParseRaw(entry.responseRaw) ?? entry.responseRaw ?? null;
  }

  function _findPrevSameUrl(entry) {
    if (!entry?.urlPath) return null;
    const idx = _state.entries.findIndex(e => e.id === entry.id);
    for (let i = idx - 1; i >= 0; i--) {
      if (_state.entries[i].urlPath === entry.urlPath) return _state.entries[i];
    }
    return null;
  }

  function _updateGridBtn(data) {
    const gridBtn = _dom.viewToggle?.querySelector('[data-view="grid"]');
    if (!gridBtn) return;
    const isArray = Array.isArray(data) || (data && typeof data === 'object' && !Array.isArray(data));
    gridBtn.disabled = false; // always allow — buildGrid handles non-array gracefully
    gridBtn.title = Array.isArray(data) ? '' : 'Works best with array responses';
  }

  function _renderContent() {
    const content = _dom.content;
    if (!content) return;
    content.innerHTML = '';

    const entry = _state.selectedId
      ? _state.entries.find(e => e.id === _state.selectedId)
      : null;
    if (!entry) return;

    // Headers tab — same for all views
    if (entry.type !== 'log' && _state.activeDTab === 'headers') {
      content.appendChild(
        window.XRAY_Renderer.buildHeaders(entry.requestHeaders, entry.responseHeaders)
      );
      return;
    }

    const data = _getEntryData(entry);

    if (data === null || data === undefined) {
      content.innerHTML = `<div style="color:var(--xr-muted);font-size:11px;padding:4px 0">No data</div>`;
      return;
    }

    const parsed = typeof data === 'string' ? (_tryParseRaw(data) ?? data) : data;
    _updateGridBtn(parsed);

    if (_state.activeView === 'grid') {
      // Grid view — if we've drilled into a row, show tree with back button
      if (_state.gridDrillRow !== null) {
        const backBar = document.createElement('div');
        backBar.className = 'xr-grid-drill-back';
        backBar.innerHTML = `← Back to grid`;
        backBar.addEventListener('click', () => {
          _state.gridDrillRow = null;
          _renderContent();
        });
        content.appendChild(backBar);
        const tree = document.createElement('div');
        tree.style.flex = '1';
        tree.style.overflow = 'auto';
        tree.appendChild(window.XRAY_Renderer.buildTree(_state.gridDrillRow));
        content.appendChild(tree);
      } else {
        content.appendChild(window.XRAY_Renderer.buildGrid(parsed, (row) => {
          _state.gridDrillRow = row;
          _renderContent();
        }));
      }

    } else if (_state.activeView === 'diff') {
      _renderDiffView(entry, parsed, content);

    } else if (_state.activeView === 'tree') {
      try {
        content.appendChild(window.XRAY_Renderer.buildTree(parsed));
      } catch {
        content.appendChild(window.XRAY_Renderer.buildRaw(data));
      }

    } else {
      content.appendChild(window.XRAY_Renderer.buildRaw(data));
    }

    // Re-apply pane search highlights after render
    if (_state.paneSearch.active && _state.paneSearch.query) {
      _paneSearchUpdate(false);
    }
  }

  function _renderDiffView(entry, data, content) {
    const prev = _state.diffCompareId
      ? _state.entries.find(e => e.id === _state.diffCompareId)
      : _findPrevSameUrl(entry);

    // Compare selector bar
    const compareRow = document.createElement('div');
    compareRow.className = 'xr-diff-compare-row';
    const lbl = document.createElement('span');
    lbl.className = 'xr-diff-compare-label';
    lbl.textContent = 'vs:';
    const sel = document.createElement('select');
    sel.innerHTML = `<option value="">— auto (previous ${entry.urlPath || 'call'}) —</option>`;
    _state.entries
      .filter(e => e.id !== entry.id && e.type === 'api')
      .slice().reverse()
      .forEach(e => {
        const opt = document.createElement('option');
        opt.value = e.id;
        const { formatTime } = window.XRAY_Utils;
        opt.textContent = `${e.method || '?'} ${e.urlPath || e.url || '?'} — ${formatTime(e.timestamp)}`;
        if (_state.diffCompareId === e.id) opt.selected = true;
        sel.appendChild(opt);
      });
    sel.addEventListener('change', () => {
      _state.diffCompareId = sel.value || null;
      _renderContent();
    });
    compareRow.appendChild(lbl);
    compareRow.appendChild(sel);
    content.appendChild(compareRow);

    const prevData = prev ? _getEntryData(prev) : undefined;
    const prevParsed = prevData
      ? (typeof prevData === 'string' ? (_tryParseRaw(prevData) ?? prevData) : prevData)
      : undefined;

    if (prevParsed === undefined) {
      const msg = document.createElement('div');
      msg.className = 'xr-empty';
      msg.style.padding = '24px';
      msg.textContent = 'No previous call to this URL found. Select an entry above to compare.';
      content.appendChild(msg);
      return;
    }

    content.appendChild(window.XRAY_Renderer.buildDiff(prevParsed, data));
  }

  // ── Pane search ───────────────────────────────────────────────────────────

  function _paneSearchOpen() {
    if (!_dom.paneSearchBar) return;
    _state.paneSearch.active = true;
    _dom.paneSearchBar.style.display = 'flex';
    _dom.paneSearchInput.focus();
    _dom.paneSearchInput.select();
    _paneSearchUpdate(true);
  }

  function _paneSearchClose() {
    if (!_dom.paneSearchBar) return;
    _state.paneSearch.active = false;
    _state.paneSearch.hits = [];
    _state.paneSearch.current = -1;
    _dom.paneSearchBar.style.display = 'none';
    if (_dom.content) window.XRAY_Renderer.clearSearch(_dom.content);
    if (_dom.paneSearchCount) _dom.paneSearchCount.textContent = '';
  }

  function _paneSearchUpdate(resetCurrent = true) {
    if (!_dom.content) return;
    const q = _state.paneSearch.query;
    const { total, els } = window.XRAY_Renderer.markSearch(_dom.content, q);
    _state.paneSearch.hits = els;
    if (resetCurrent) _state.paneSearch.current = total > 0 ? 0 : -1;
    _paneSearchHighlightCurrent();
    const c = _state.paneSearch.current;
    _dom.paneSearchCount.textContent = total > 0 ? `${c + 1}/${total}` : (q ? '0/0' : '');
  }

  function _paneSearchNav(dir) {
    const { hits } = _state.paneSearch;
    if (!hits.length) return;
    _state.paneSearch.current = (_state.paneSearch.current + dir + hits.length) % hits.length;
    _paneSearchHighlightCurrent();
    const c = _state.paneSearch.current;
    _dom.paneSearchCount.textContent = `${c + 1}/${hits.length}`;
  }

  function _paneSearchHighlightCurrent() {
    const { hits, current } = _state.paneSearch;
    hits.forEach((el, i) => el.classList.toggle('xr-search-current', i === current));
    if (hits[current]) hits[current].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Copy
  // ══════════════════════════════════════════════════════════════════════════
  function _copySelected(as = 'json') {
    const entry = _state.selectedId
      ? _state.entries.find(e => e.id === _state.selectedId)
      : null;
    if (!entry) return;

    let text;

    if (as === 'curl') {
      text = _buildCurl(entry);
    } else if (as === 'fetch') {
      text = _buildFetch(entry);
    } else {
      let data;
      if (entry.type === 'log') {
        data = entry.logData;
      } else if (_state.activeDTab === 'request') {
        data = entry.requestBody;
      } else if (_state.activeDTab === 'headers') {
        data = { request: entry.requestHeaders, response: entry.responseHeaders };
      } else {
        data = entry.responseDecrypted ?? _tryParseRaw(entry.responseRaw) ?? entry.responseRaw;
      }
      text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    }

    navigator.clipboard.writeText(text || '').catch(() => {});

    const btn = _dom.detailPane?.querySelector('#xr-copy-btn');
    if (btn) {
      btn.classList.add('xr-copied');
      const label = btn.querySelector('span:last-child');
      const orig = label?.textContent;
      if (label) label.textContent = 'Copied!';
      setTimeout(() => {
        btn.classList.remove('xr-copied');
        if (label) label.textContent = orig || 'Copy ▾';
      }, 1500);
    }
  }

  function _buildCurl(entry) {
    const method = (entry.method || 'GET').toUpperCase();
    const url = entry.url || '';
    const headers = entry.requestHeaders || {};
    const body = entry.requestBody;

    let parts = [`curl -X ${method} '${url}'`];
    Object.entries(headers).forEach(([k, v]) => {
      parts.push(`  -H '${k}: ${v}'`);
    });
    if (body) {
      const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
      parts.push(`  --data '${bodyStr.replace(/'/g, "'\\''")}'`);
    }
    return parts.join(' \\\n');
  }

  function _buildFetch(entry) {
    const method = (entry.method || 'GET').toUpperCase();
    const url = entry.url || '';
    const headers = entry.requestHeaders || {};
    const body = entry.requestBody;
    const opts = { method };
    if (Object.keys(headers).length) opts.headers = headers;
    if (body) opts.body = typeof body === 'string' ? body : JSON.stringify(body);

    const optsStr = JSON.stringify(opts, null, 2);
    return `const response = await fetch('${url}', ${optsStr});\nconst data = await response.json();`;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Drag resize — list pane + panel width
  // ══════════════════════════════════════════════════════════════════════════
  function _initDrag() {
    // ── Internal list-pane divider ──
    const handle = _dom.dragHandle;
    if (handle) {
      handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const startX = e.clientX;
        const startW = _state.listWidth;
        handle.classList.add('xr-dragging');

        const onMove = (ev) => {
          const w = Math.min(300, Math.max(130, startW + (ev.clientX - startX)));
          _state.listWidth = w;
          _dom.listPane.style.width = `${w}px`;
        };
        const onUp = () => {
          handle.classList.remove('xr-dragging');
          document.removeEventListener('mousemove', onMove, true);
          document.removeEventListener('mouseup',   onUp,   true);
          _saveState();
        };
        document.addEventListener('mousemove', onMove, true);
        document.addEventListener('mouseup',   onUp,   true);
      });
    }

    // ── Panel width resize (left edge) ──
    const panelEdge = _dom.panelResize;
    if (panelEdge) {
      panelEdge.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const startX    = e.clientX;
        const startW    = _state.panelWidth;
        // disable transition during drag for instant feedback
        _dom.panel.style.transition = 'none';
        panelEdge.classList.add('xr-dragging');

        const onMove = (ev) => {
          // panel is anchored to right edge — dragging left makes it wider
          const delta = startX - ev.clientX;
          const w = Math.min(MAX_PANEL_W, Math.max(MIN_PANEL_W, startW + delta));
          _state.panelWidth = w;
          _dom.panel.style.width = `${w}px`;
        };
        const onUp = () => {
          panelEdge.classList.remove('xr-dragging');
          _dom.panel.style.transition = '';
          document.removeEventListener('mousemove', onMove, true);
          document.removeEventListener('mouseup',   onUp,   true);
          _saveState();
        };
        document.addEventListener('mousemove', onMove, true);
        document.addEventListener('mouseup',   onUp,   true);
      });
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Fuzzy search — fzf-grade algorithm
  // ══════════════════════════════════════════════════════════════════════════
  let _fuzzyIdx = -1;

  // Scoring constants (tuned to match fzf v2 feel)
  const FZ = {
    MATCH:        16,
    CONSECUTIVE:  32,   // per consecutive char after first
    WORD_START:   48,   // char after / . - _ space
    CAMEL:        24,   // uppercase after lowercase
    STR_START:    72,   // very first char of string
    GAP_PENALTY: - 2,   // per skipped char between matches
    FIELD_METHOD: 1.4,  // multiplier when matching method token
    FIELD_STATUS: 1.3,  // multiplier when matching status
    FIELD_PATH:   1.1,  // multiplier for path segment vs full url
  };

  // Returns { score, positions } or null if no match
  function _fzScore(query, text) {
    if (!query) return { score: 1, positions: [] };
    const q  = query.toLowerCase();
    const t  = text.toLowerCase();
    const m  = q.length;
    const n  = t.length;

    // Quick reject — all query chars must appear in order
    let qi = 0;
    for (let i = 0; i < n && qi < m; i++) if (t[i] === q[qi]) qi++;
    if (qi < m) return null;

    // Per-position boundary bonus
    const bonus = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      const p = i > 0 ? text[i - 1] : '';
      if (i === 0)                                    bonus[i] = FZ.STR_START;
      else if ('/._- ?&=#'.includes(p))              bonus[i] = FZ.WORD_START;
      else if (p === p.toLowerCase() && p !== p.toUpperCase() &&
               text[i] !== text[i].toLowerCase())    bonus[i] = FZ.CAMEL;
    }

    // Greedy forward pass — find first valid match set
    const pos = [];
    qi = 0;
    for (let i = 0; i < n && qi < m; i++) {
      if (t[i] === q[qi]) { pos.push(i); qi++; }
    }

    // Backward refinement — slide each match as late as possible to prefer
    // word boundaries further right (mirrors fzf's backwards pass)
    for (let k = pos.length - 1; k >= 0; k--) {
      const charToFind = q[k];
      const limit = k < pos.length - 1 ? pos[k + 1] - 1 : n - 1;
      let best = pos[k], bestBonus = bonus[pos[k]];
      for (let i = pos[k] + 1; i <= limit; i++) {
        if (t[i] === charToFind && bonus[i] > bestBonus) {
          best = i; bestBonus = bonus[i];
        }
      }
      pos[k] = best;
    }

    // Final scoring over chosen positions
    let score = 0, streak = 0;
    for (let k = 0; k < pos.length; k++) {
      const i = pos[k];
      score += FZ.MATCH + bonus[i];
      if (k > 0) {
        const gap = pos[k] - pos[k - 1] - 1;
        if (gap === 0) {
          streak++;
          score += FZ.CONSECUTIVE * streak;
        } else {
          streak = 0;
          score += FZ.GAP_PENALTY * gap;
        }
      }
    }

    return { score, positions: pos };
  }

  // Build a search target string + remember field offsets for multi-field search
  function _entryTarget(entry) {
    if (entry.type !== 'api') {
      const s = window.XRAY_Utils.previewJSON(entry.logData, 120) || '';
      return { display: s, fields: [{ text: s, multiplier: 1 }] };
    }
    const method = (entry.method || 'GET').toUpperCase();
    const status = String(entry.status || '');
    let path = '';
    try { path = new URL(entry.url || '').pathname; } catch { path = entry.url || ''; }
    const full = entry.url || '';
    return {
      display: full,
      fields: [
        { text: method, multiplier: FZ.FIELD_METHOD },
        { text: status, multiplier: FZ.FIELD_STATUS },
        { text: path,   multiplier: FZ.FIELD_PATH   },
        { text: full,   multiplier: 1               },
      ]
    };
  }

  // Score an entry against a query — returns best (score, positions, fieldText)
  function _scoreEntry(query, entry) {
    const { display, fields } = _entryTarget(entry);
    let best = null;
    for (const { text, multiplier } of fields) {
      const r = _fzScore(query, text);
      if (!r) continue;
      const adj = r.score * multiplier;
      if (!best || adj > best.score) {
        best = { score: adj, positions: r.positions, matchText: text };
      }
    }
    if (!best) return null;
    return { entry, display, matchText: best.matchText, positions: best.positions, score: best.score };
  }

  // Render match text with highlighted positions
  function _fzHighlight(text, positions) {
    if (!positions || !positions.length) return _escHtml(text);
    const set = new Set(positions);
    let out = '', inMark = false;
    for (let i = 0; i < text.length; i++) {
      const hi = set.has(i);
      if (hi && !inMark)  { out += '<mark>'; inMark = true; }
      if (!hi && inMark)  { out += '</mark>'; inMark = false; }
      out += _escHtml(text[i]);
    }
    if (inMark) out += '</mark>';
    return out;
  }

  function _escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function _fuzzyOpen() {
    if (!_dom.fuzzyBackdrop) return;
    _dom.fuzzyBackdrop.classList.add('xr-open');
    _dom.fuzzyInput.value = '';
    _fuzzyIdx = -1;
    _fuzzyRender('');
    setTimeout(() => _dom.fuzzyInput.focus(), 30);
  }

  function _fuzzyClose() {
    _dom.fuzzyBackdrop?.classList.remove('xr-open');
  }

  function _fuzzyRender(query) {
    const results = _dom.fuzzyResults;
    results.innerHTML = '';
    _fuzzyIdx = -1;

    const q = query.trim();
    const entries = _state.entries.filter(e =>
      _state.activeTab === 'all' || e.type === (_state.activeTab === 'api' ? 'api' : 'log')
    );

    let scored;
    if (!q) {
      // No query — show all, most recent first
      scored = entries.slice().reverse().slice(0, 80).map(entry => ({
        entry,
        display: _entryTarget(entry).display,
        matchText: _entryTarget(entry).display,
        positions: [],
        score: 0,
      }));
    } else {
      scored = [];
      for (const entry of entries) {
        const r = _scoreEntry(q, entry);
        if (r) scored.push(r);
      }
      scored.sort((a, b) => b.score - a.score);
      scored = scored.slice(0, 80);
    }

    if (!scored.length) {
      results.innerHTML = `<div class="xr-fuzzy-empty">${q ? 'No matches for <b>' + _escHtml(q) + '</b>' : 'No requests captured yet'}</div>`;
      return;
    }

    const { methodClass, statusClass } = window.XRAY_Utils;
    scored.forEach(({ entry, display, matchText, positions }, i) => {
      const row = document.createElement('div');
      row.className = 'xr-fuzzy-row';
      row.dataset.id = entry.id;

      // Decide what label to show: if best match was on path/method/status, show full URL
      // but highlight within the matched field shown separately
      const showUrl = display !== matchText
        ? `${_escHtml(display)}`   // full url undecorated, match was on a sub-field
        : _fzHighlight(display, positions);

      if (entry.type === 'api') {
        const mClass = methodClass(entry.method || 'GET');
        const sClass = statusClass(entry.status);
        const methodHtml = matchText === (entry.method || 'GET').toUpperCase()
          ? _fzHighlight(matchText, positions)
          : _escHtml((entry.method || 'GET').toUpperCase());
        row.innerHTML = `
          <span class="xr-fuzzy-badge xr-method-badge ${mClass}">${methodHtml}</span>
          <span class="xr-fuzzy-url">${showUrl}</span>
          <span class="xr-fuzzy-status ${sClass}">${entry.status || ''}</span>
        `;
      } else {
        row.innerHTML = `
          <span class="xr-fuzzy-badge" style="background:rgba(99,102,241,.15);color:var(--xr-ring)">LOG</span>
          <span class="xr-fuzzy-url">${_fzHighlight(display, positions)}</span>
        `;
      }

      row.addEventListener('mouseenter', () => { _fuzzyIdx = i; _fuzzySetSel(); });
      row.addEventListener('click', () => _fuzzySelect(entry.id));
      results.appendChild(row);
    });

    _fuzzyIdx = 0;
    _fuzzySetSel();
  }

  function _fuzzySetSel() {
    const rows = _dom.fuzzyResults.querySelectorAll('.xr-fuzzy-row');
    rows.forEach((r, i) => r.classList.toggle('xr-fuzzy-sel', i === _fuzzyIdx));
    const sel = rows[_fuzzyIdx];
    if (sel) sel.scrollIntoView({ block: 'nearest' });
  }

  function _fuzzySelect(id) {
    _fuzzyClose();
    _state.selectedId = id;
    _state.filter = '';
    const entry = _state.entries.find(e => e.id === id);
    if (entry) {
      const targetTab = entry.type === 'api' ? 'api' : 'logs';
      if (_state.activeTab !== targetTab) {
        _state.activeTab = targetTab;
        _root.querySelectorAll('.xr-tab').forEach(b =>
          b.classList.toggle('xr-active', b.dataset.tab === targetTab)
        );
      }
    }
    _rebuildList();
    _updateCounts();
    // Highlight + render
    _dom.listPane.querySelectorAll('.xr-entry').forEach(el =>
      el.classList.toggle('xr-selected', el.dataset.id === id)
    );
    if (entry) _renderDetail(entry);
    // Scroll selected into view
    const selEl = _dom.listPane.querySelector(`.xr-entry[data-id="${id}"]`);
    if (selEl) selEl.scrollIntoView({ block: 'nearest' });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Storage (Theme, Filters, Pinned)
  // ══════════════════════════════════════════════════════════════════════════

  async function _loadState() {
    // Load theme
    const themeData = await window.XRAY_Store.get('theme', {});
    if (themeData.value && window.XRAY_Themes[themeData.value]) {
      _state.theme = themeData.value;
    }

    // Load filters
    const filterData = await window.XRAY_Store.get('filters', {});
    if (filterData.statusCodes) _state.filters.statusCodes = filterData.statusCodes;
    if (filterData.types) _state.filters.types = filterData.types;

    // Load pinned
    const pinnedData = await window.XRAY_Store.get('pinned_entries', {});
    if (Array.isArray(pinnedData.ids)) {
      _state.pinned = new Set(pinnedData.ids);
    }
  }

  function _saveTheme(themeId) {
    window.XRAY_Store.set('theme', { value: themeId });
  }

  function _saveFilters() {
    window.XRAY_Store.set('filters', {
      statusCodes: Array.from(_state.filters.statusCodes),
      types: Array.from(_state.filters.types)
    });
  }

  function _savePinned() {
    window.XRAY_Store.set('pinned_entries', {
      ids: Array.from(_state.pinned)
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Copy & Export Modal
  // ══════════════════════════════════════════════════════════════════════════

  function _openCopyModal(entry) {
    const backdrop = _dom.copyBackdrop;
    const title = _dom.copyTitle;
    const code = _dom.copyCode;
    const format = _dom.copyFormat;

    if (!backdrop || !title || !code || !format) return;

    title.textContent = `Copy & Export: ${entry.method || 'LOG'} ${entry.urlPath || ''}`;
    
    _updateCopyPreview(entry, format.value);
    
    format.addEventListener('change', () => _updateCopyPreview(entry, format.value));
    
    backdrop.classList.add('xr-open');

    _dom.copyBtn.onclick = () => {
      navigator.clipboard.writeText(code.textContent).then(() => {
        _dom.copyBtn.textContent = '✓ Copied';
        setTimeout(() => { _dom.copyBtn.textContent = 'Copy'; }, 2000);
      }).catch(err => console.error('Copy failed:', err));
    };

    _dom.copyCancel.onclick = () => backdrop.classList.remove('xr-open');
    _dom.copyClose.onclick = () => backdrop.classList.remove('xr-open');
  }

  function _updateCopyPreview(entry, format) {
    const code = _dom.copyCode;
    if (!code) return;

    let preview = '';

    if (entry.type === 'api') {
      switch(format) {
        case 'fetch':
          preview = _buildFetchCall(entry);
          break;
        case 'js-object':
          preview = _buildJSObject(entry);
          break;
        case 'ts-object':
          preview = _buildTSObject(entry);
          break;
        case 'json':
          preview = JSON.stringify(entry.responseDecrypted || entry.responseRaw, null, 2);
          break;
        case 'curl':
          preview = _buildCurlCommand(entry);
          break;
        case 'python':
          preview = _buildPythonRequest(entry);
          break;
        case 'go':
          preview = _buildGoRequest(entry);
          break;
        case 'jest':
          preview = _buildJestTest(entry);
          break;
      }
    } else if (entry.type === 'log') {
      // For logs, show formats that make sense
      if (format === 'json') {
        preview = JSON.stringify(entry.logData, null, 2);
      } else if (format === 'js-object') {
        preview = 'const logData = ' + JSON.stringify(entry.logData, null, 2) + ';';
      } else if (format === 'ts-object') {
        preview = 'const logData: any = ' + JSON.stringify(entry.logData, null, 2) + ';';
      } else {
        preview = JSON.stringify(entry.logData, null, 2);
      }
    }

    code.textContent = preview;
  }

  function _buildFetchCall(entry) {
    const headers = entry.requestHeaders || {};
    const body = entry.requestBody ? JSON.stringify(entry.requestBody, null, 2) : null;

    let code = `fetch('${entry.url}', {
  method: '${entry.method}',
  headers: {
${Object.entries(headers).map(([k, v]) => `    '${k}': '${v}'`).join(',\n')}
  }`;

    if (body) {
      code += `,
  body: ${body}`;
    }

    code += '\n}).then(r => r.json()).then(data => console.log(data))';
    return code;
  }

  function _buildJSObject(entry) {
    const data = entry.responseDecrypted || entry.responseRaw || {};
    return 'const data = ' + JSON.stringify(data, null, 2) + ';';
  }

  function _buildTSObject(entry) {
    const data = entry.responseDecrypted || entry.responseRaw || {};
    return 'const data: any = ' + JSON.stringify(data, null, 2) + ';';
  }

  function _buildCurlCommand(entry) {
    const headers = entry.requestHeaders || {};
    const body = entry.requestBody ? JSON.stringify(entry.requestBody) : null;

    let cmd = `curl -X ${entry.method} '${entry.url}'`;

    Object.entries(headers).forEach(([k, v]) => {
      cmd += ` \\\n  -H '${k}: ${v}'`;
    });

    if (body) {
      cmd += ` \\\n  -d '${body}'`;
    }

    return cmd;
  }

  function _buildPythonRequest(entry) {
    const headers = entry.requestHeaders || {};
    const body = entry.requestBody ? JSON.stringify(entry.requestBody, null, 2) : null;

    let code = `import requests

url = '${entry.url}'
headers = {
${Object.entries(headers).map(([k, v]) => `    '${k}': '${v}'`).join(',\n')}
}`;

    if (body) {
      code += `
data = ${body}
response = requests.${entry.method.toLowerCase()}(url, headers=headers, json=data)`;
    } else {
      code += `
response = requests.${entry.method.toLowerCase()}(url, headers=headers)`;
    }

    code += `
print(response.json())`;
    return code;
  }

  function _buildGoRequest(entry) {
    const body = entry.requestBody ? JSON.stringify(entry.requestBody) : null;
    const headers = entry.requestHeaders || {};

    let code = `package main

import (
  "fmt"
  "io/ioutil"
  "net/http"
  "strings"
)

func main() {
  url := "${entry.url}"`;

    if (body) {
      code += `
  payload := strings.NewReader(\`${body}\`)
  req, _ := http.NewRequest("${entry.method}", url, payload)`;
    } else {
      code += `
  req, _ := http.NewRequest("${entry.method}", url, nil)`;
    }

    code += `
  
  client := &http.Client{}`;
    Object.entries(headers).forEach(([k, v]) => {
      code += `\n  req.Header.Add("${k}", "${v}")`;
    });

    code += `

  resp, _ := client.Do(req)
  defer resp.Body.Close()
  body, _ := ioutil.ReadAll(resp.Body)
  fmt.Println(string(body))
}`;

    return code;
  }

  function _buildJestTest(entry) {
    const method = entry.method || 'GET';
    const url = entry.url || '';
    const expectedData = entry.responseDecrypted || entry.responseRaw || {};

    let code = `describe('API: ${method} ${entry.urlPath}', () => {
  it('should return valid response', async () => {
    const response = await fetch('${url}', {
      method: '${method}'
    });
    const data = await response.json();
    
    expect(response.status).toBe(${entry.status});
    expect(data).toEqual(${JSON.stringify(expectedData, null, 4).split('\n').join('\n    ')});
  });
});`;

    return code;
  }

  function _applyFilters(entries) {
    if (_state.filters.statusCodes.length === 0 && _state.filters.types.length === 0) {
      return entries;
    }
    return entries.filter(e => {
      if (_state.filters.statusCodes.length > 0) {
        const codeRange = String(e.status || '').charAt(0) + 'xx';
        if (!_state.filters.statusCodes.includes(codeRange)) return false;
      }
      if (_state.filters.types.length > 0) {
        const eType = e.type === 'api' ? (e.method ? 'fetch' : 'doc') : 'log';
        if (!_state.filters.types.includes(eType)) return false;
      }
      return true;
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Event binding
  // ══════════════════════════════════════════════════════════════════════════
  function _bindEvents() {
    _dom.closeBtn.addEventListener('click', () => _public.hide());

    _root.querySelectorAll('.xr-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        _state.activeTab = btn.dataset.tab;
        _root.querySelectorAll('.xr-tab').forEach(b =>
          b.classList.toggle('xr-active', b.dataset.tab === _state.activeTab)
        );
        _state.selectedId = null;
        _rebuildList();
        _renderDetail(null);
        _updateCounts();
      });
    });

    _dom.clearBtn.addEventListener('click', () => {
      _state.entries    = [];
      _state.selectedId = null;
      _state.pinned.clear();
      _rebuildList();
      _renderDetail(null);
      _updateCounts();
    });

    // Fuzzy overlay events
    _dom.fuzzyBackdrop.addEventListener('click', (e) => {
      if (e.target === _dom.fuzzyBackdrop) _fuzzyClose();
    });

    _dom.fuzzyInput.addEventListener('input', (e) => {
      _fuzzyRender(e.target.value.trim());
    });

    _dom.fuzzyInput.addEventListener('keydown', (e) => {
      const rows = _dom.fuzzyResults.querySelectorAll('.xr-fuzzy-row');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        _fuzzyIdx = Math.min(_fuzzyIdx + 1, rows.length - 1);
        _fuzzySetSel();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        _fuzzyIdx = Math.max(_fuzzyIdx - 1, 0);
        _fuzzySetSel();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const sel = rows[_fuzzyIdx];
        if (sel) _fuzzySelect(sel.dataset.id);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        _fuzzyClose();
      }
    });

    _initDrag();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Public API
  // ══════════════════════════════════════════════════════════════════════════
  const _public = {

    async init() {
      await _loadState();

      let host = document.getElementById(HOST_ID);
      if (!host) {
        host = document.createElement('div');
        host.id = HOST_ID;
        document.documentElement.appendChild(host);
      }
      _host = host;

      // Attach Shadow DOM
      _root = host.attachShadow({ mode: 'open' });

      const style = document.createElement('style');
      style.textContent = _buildCSS();
      _root.appendChild(style);

      const panel = _buildHTML();
      _root.appendChild(panel);

      // Collect refs
      _dom.panel        = _root.getElementById('xr-panel');
      _dom.panelResize  = _root.getElementById('xr-panel-resize');
      _dom.dots         = _root.getElementById('xr-dots');
      _dom.closeBtn     = _root.getElementById('xr-close');
      _dom.listPane     = _root.getElementById('xr-list-pane');
      _dom.dragHandle   = _root.getElementById('xr-drag-handle');
      _dom.detailPane   = _root.getElementById('xr-detail-pane');
      _dom.footerCount  = _root.getElementById('xr-count');
      _dom.apiCount     = _root.getElementById('xr-api-count');
      _dom.logCount     = _root.getElementById('xr-log-count');
      _dom.clearBtn     = _root.getElementById('xr-clear');
      _dom.fuzzyBackdrop = _root.getElementById('xr-fuzzy-backdrop');
      _dom.fuzzyInput   = _root.getElementById('xr-fuzzy-input');
      _dom.fuzzyResults = _root.getElementById('xr-fuzzy-results');
      _dom.copyBackdrop = _root.getElementById('xr-copy-backdrop');
      _dom.copyTitle   = _root.getElementById('xr-copy-title');
      _dom.copyFormat  = _root.getElementById('xr-copy-format');
      _dom.copyCode    = _root.getElementById('xr-copy-code');
      _dom.copyBtn     = _root.getElementById('xr-copy-btn');
      _dom.copyCancel  = _root.getElementById('xr-copy-cancel');
      _dom.copyClose   = _root.getElementById('xr-copy-close');

      // Apply persisted state
      _dom.panel.style.width = `${_state.panelWidth}px`;
      _dom.listPane.style.width = `${_state.listWidth}px`;
      _buildDots();
      _applyTheme(_state.theme);

      // Initial render
      _rebuildList();
      _renderDetail(null);
      _updateCounts();

      // Events + shortcuts
      _bindEvents();
      if (window.XRAY_Shortcuts?.init) window.XRAY_Shortcuts.init(_public);

      // Restore open state
      if (_state.open) _dom.panel.classList.add('xr-open');
    },

    show() {
      if (!_dom.panel) return;
      _state.open = true;
      _dom.panel.classList.add('xr-open');
      _saveState();
    },

    hide() {
      if (!_dom.panel) return;
      _state.open = false;
      _dom.panel.classList.remove('xr-open');
      _saveState();
    },

    toggle() { _state.open ? _public.hide() : _public.show(); },

    isOpen() { return _state.open; },

    add(entry) {
      if (!entry) return;
      if (!entry.id) entry.id = window.XRAY_Utils.uid();
      _state.entries.push(entry);

      // Flash the live capture dot
      const dot = _root?.getElementById('xr-capture-dot');
      if (dot) {
        dot.classList.add('xr-live');
        clearTimeout(dot._fadeTimer);
        dot._fadeTimer = setTimeout(() => dot.classList.remove('xr-live'), 2200);
      }

      if (_entryMatchesCurrentTab(entry) && _entryMatchesFilter(entry)) {
        const emptyEl = _dom.listPane?.querySelector('.xr-empty-state');
        if (emptyEl) emptyEl.remove();
        const el = _renderEntry(entry);
        el.classList.add('xr-entry-new');
        _dom.listPane?.appendChild(el);
      }
      _updateCounts();
    },

    setView(v) {
      const views = ['tree', 'grid', 'raw', 'diff'];
      if (!views.includes(v)) return;
      _state.activeView = v;
      _state.gridDrillRow = null;
      _dom.viewToggle?.querySelectorAll('.xr-toggle-btn').forEach(btn =>
        btn.classList.toggle('xr-active', btn.dataset.view === v)
      );
      _renderContent();
    },

    focusSearch() { _fuzzyOpen(); },

    hasSelection()      { return !!_state.selectedId; },
    paneSearchFocus()   { _paneSearchOpen(); },

    copySelected() { _copySelected(); },

    pinSelected() { /* stub — reserved for pin/star feature */ },

    expandAll(expand) {
      const treeRoot = _dom.content?.querySelector('.xr-tree-root');
      if (treeRoot) window.XRAY_Renderer.expandAll(treeRoot, expand);
    },

    selectNext(dir) {
      const filtered = _filteredEntries();
      if (!filtered.length) return;
      const idx  = filtered.findIndex(e => e.id === _state.selectedId);
      let   next = idx === -1
        ? (dir > 0 ? 0 : filtered.length - 1)
        : (idx + dir + filtered.length) % filtered.length;
      const target = filtered[next];
      _selectEntry(target.id);
      _dom.listPane?.querySelector(`[data-id="${target.id}"]`)?.scrollIntoView({ block: 'nearest' });
    },

  };

  return _public;
})();
