// panel/floating.js — World-class redesign (shadcn/Linear/Vercel-inspired)
window.XRAY_Panel = (() => {
  'use strict';

  const HOST_ID   = '__xray_root__';
  const STORE_KEY = 'panel_v2';

  // ── State ─────────────────────────────────────────────────────────────────
  const _state = {
    open:        false,
    activeTab:   'api',        // 'api' | 'logs'
    activeView:  'tree',       // 'tree' | 'raw'
    activeDTab:  'response',   // 'response' | 'request' | 'headers'
    selectedId:  null,
    theme:       'zinc',
    filter:      '',
    listWidth:   220,
    panelWidth:  520,
    entries:     [],
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
  transition: background .12s, color .12s, border-color .12s;
  white-space: nowrap;
  line-height: 1;
}
.xr-tab:hover { background: var(--xr-bg3); color: var(--xr-subtext); }
.xr-tab.xr-active {
  background: var(--xr-bg3);
  border-color: var(--xr-border);
  color: var(--xr-text);
  font-weight: 600;
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
.xr-dots { display: flex; align-items: center; gap: 6px; margin-right: 4px; }
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
.xr-empty-icon { font-size: 26px; line-height: 1; }
.xr-empty-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--xr-subtext);
}
.xr-empty-desc {
  font-size: 11px;
  color: var(--xr-muted);
  line-height: 1.55;
  max-width: 180px;
}

/* ─── Entry rows ─────────────────────────────────────────────────────────── */
.xr-entry {
  padding: 8px 10px 8px 12px;
  border-bottom: 1px solid var(--xr-border);
  cursor: pointer;
  transition: background .1s;
  border-left: 3px solid transparent;
  user-select: none;
  flex-shrink: 0;
  position: relative;
}
.xr-entry:hover {
  background: linear-gradient(90deg, rgba(255,255,255,.025) 0%, transparent 100%);
}
.xr-entry.xr-selected {
  background: linear-gradient(90deg, rgba(255,255,255,.04) 0%, transparent 100%);
  border-left-color: var(--xr-accent);
}
/* Color the left stripe by method */
.xr-entry[data-method="GET"]    { --xr-stripe: var(--xr-blue);   }
.xr-entry[data-method="POST"]   { --xr-stripe: var(--xr-green);  }
.xr-entry[data-method="PUT"]    { --xr-stripe: var(--xr-yellow); }
.xr-entry[data-method="DELETE"] { --xr-stripe: var(--xr-red);    }
.xr-entry[data-method="PATCH"]  { --xr-stripe: var(--xr-purple); }
.xr-entry.xr-selected { border-left-color: var(--xr-stripe, var(--xr-accent)); }

/* New entry slide-in */
@keyframes xr-slide-in {
  from { opacity: 0; transform: translateX(8px); }
  to   { opacity: 1; transform: translateX(0); }
}
.xr-entry-new { animation: xr-slide-in .18s ease-out both; }

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
.xr-detail-empty .xr-kbd-hint {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 4px;
}
.xr-kbd {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  background: var(--xr-bg3);
  border: 1px solid var(--xr-border);
  border-radius: 4px;
  font-size: 9.5px;
  color: var(--xr-muted);
  font-family: 'JetBrains Mono', monospace;
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
  gap: 2px;
}
.xr-dtab {
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--xr-muted);
  font-size: 11px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: color .12s, border-color .12s;
  margin-bottom: -1px;
  line-height: 1.4;
}
.xr-dtab:hover { color: var(--xr-subtext); }
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
  height: 42px;
  padding: 0 10px;
  background: linear-gradient(0deg, var(--xr-bg) 0%, var(--xr-bg2) 100%);
  border-top: 1px solid var(--xr-border);
  flex-shrink: 0;
}
.xr-search-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  height: 28px;
  padding: 0 9px;
  background: var(--xr-bg3);
  border: 1px solid var(--xr-border);
  border-radius: 6px;
  transition: border-color .15s, box-shadow .15s;
  min-width: 0;
}
.xr-search-wrap:focus-within {
  border-color: var(--xr-ring);
  box-shadow: 0 0 0 3px rgba(99,102,241,.12), 0 0 12px rgba(99,102,241,.06);
}
.xr-search-icon { color: var(--xr-muted); font-size: 12px; flex-shrink: 0; }
.xr-search {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  color: var(--xr-text);
  font-size: 11.5px;
  font-family: inherit;
  padding: 0;
}
.xr-search::placeholder { color: var(--xr-muted); letter-spacing: .02em; }
.xr-search-kbd {
  font-size: 9.5px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  color: var(--xr-muted);
  background: var(--xr-surface);
  border: 1px solid var(--xr-border);
  border-radius: 3px;
  padding: 1px 4px;
  flex-shrink: 0;
  pointer-events: none;
  transition: opacity .15s;
}
.xr-search-wrap:focus-within .xr-search-kbd { opacity: 0; }
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
  <div class="xr-search-wrap">
    <span class="xr-search-icon">⌕</span>
    <input
      class="xr-search" id="xr-search" type="text"
      placeholder="Filter requests…"
      autocomplete="off" spellcheck="false"
    />
    <span class="xr-search-kbd">Ctrl+F</span>
  </div>
  <span class="xr-count" id="xr-count">0</span>
  <button class="xr-clear-btn" id="xr-clear">Clear</button>
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
    Object.entries(window.XRAY_Themes || {}).forEach(([key, th]) => {
      const dot = document.createElement('div');
      dot.className = 'xr-dot' + (key === _state.theme ? ' xr-active' : '');
      dot.dataset.theme = key;
      dot.style.background = th.dot;
      dot.title = th.name;
      dot.addEventListener('click', () => { _applyTheme(key); _saveState(); });
      container.appendChild(dot);
    });
  }

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
    return window.XRAY_Search.filter(byTab, _state.filter);
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

  // ══════════════════════════════════════════════════════════════════════════
  // List rendering
  // ══════════════════════════════════════════════════════════════════════════
  function _renderEntry(entry) {
    const { formatTime, formatDuration, formatSize, statusClass, methodClass, shortPath, previewJSON } =
      window.XRAY_Utils;

    const el = document.createElement('div');
    el.className = 'xr-entry' + (entry.id === _state.selectedId ? ' xr-selected' : '');
    el.dataset.id = entry.id;

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
      `;
    } else {
      const level   = (entry.logLevel || 'log').toLowerCase();
      const preview = previewJSON(entry.logData, 64);
      el.innerHTML = `
        <div class="xr-entry-row1">
          <span class="xr-method-badge xr-m-${level}">${level.toUpperCase()}</span>
          <span style="flex:1"></span>
          <span style="font-size:9.5px;color:var(--xr-muted)">${formatTime(entry.timestamp || Date.now())}</span>
        </div>
        <div class="xr-entry-row2" title="${String(preview)}">${preview}</div>
      `;
    }

    el.addEventListener('click', () => _selectEntry(entry.id));
    return el;
  }

  function _rebuildList() {
    const pane = _dom.listPane;
    if (!pane) return;
    pane.innerHTML = '';
    const filtered = _filteredEntries();

    if (filtered.length === 0) {
      const icon  = _state.activeTab === 'api' ? '🌐' : '📋';
      const title = _state.filter
        ? 'No matches'
        : `No ${_state.activeTab === 'api' ? 'requests' : 'logs'} yet`;
      const desc  = _state.filter
        ? 'Try a different search term.'
        : 'Intercepted entries will appear here automatically.';
      pane.innerHTML = `
        <div class="xr-empty-state">
          <div class="xr-empty-icon">${icon}</div>
          <div class="xr-empty-title">${title}</div>
          <div class="xr-empty-desc">${desc}</div>
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
    toolbar.innerHTML = `
      <div class="xr-view-toggle">
        <button class="xr-toggle-btn ${_state.activeView === 'tree' ? 'xr-active' : ''}" data-view="tree">Tree</button>
        <button class="xr-toggle-btn ${_state.activeView === 'raw'  ? 'xr-active' : ''}" data-view="raw">Raw</button>
      </div>
      <div class="xr-toolbar-spacer"></div>
      <button class="xr-copy-btn" id="xr-copy-btn">
        <span>⎘</span><span>Copy</span>
      </button>
    `;
    toolbar.querySelectorAll('.xr-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        _state.activeView = btn.dataset.view;
        toolbar.querySelectorAll('.xr-toggle-btn').forEach(b =>
          b.classList.toggle('xr-active', b.dataset.view === _state.activeView)
        );
        _renderContent();
      });
    });
    toolbar.querySelector('#xr-copy-btn').addEventListener('click', () => _copySelected());
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
          dtabs.querySelectorAll('.xr-dtab').forEach(b =>
            b.classList.toggle('xr-active', b.dataset.dtab === _state.activeDTab)
          );
          _renderContent();
        });
      });
      pane.appendChild(dtabs);
    }

    // ── Content area ──────────────────────────────────────────────────────
    const content = document.createElement('div');
    content.className = 'xr-content';
    pane.appendChild(content);
    _dom.content = content;

    _renderContent();
  }

  function _renderContent() {
    const content = _dom.content;
    if (!content) return;
    content.innerHTML = '';

    const entry = _state.selectedId
      ? _state.entries.find(e => e.id === _state.selectedId)
      : null;
    if (!entry) return;

    let data;

    if (entry.type === 'log') {
      data = entry.logData;
    } else {
      if (_state.activeDTab === 'headers') {
        content.appendChild(
          window.XRAY_Renderer.buildHeaders(entry.requestHeaders, entry.responseHeaders)
        );
        return;
      }
      data = _state.activeDTab === 'response'
        ? (entry.responseDecrypted ?? entry.responseBody ?? null)
        : (entry.requestBody ?? null);
    }

    if (data === null || data === undefined) {
      content.innerHTML = `<div style="color:var(--xr-muted);font-size:11px;padding:4px 0">No data</div>`;
      return;
    }

    if (_state.activeView === 'tree') {
      try {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        content.appendChild(window.XRAY_Renderer.buildTree(parsed));
      } catch {
        content.appendChild(window.XRAY_Renderer.buildRaw(data));
      }
    } else {
      content.appendChild(window.XRAY_Renderer.buildRaw(data));
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Copy
  // ══════════════════════════════════════════════════════════════════════════
  function _copySelected() {
    const entry = _state.selectedId
      ? _state.entries.find(e => e.id === _state.selectedId)
      : null;
    if (!entry) return;

    let data;
    if (entry.type === 'log') {
      data = entry.logData;
    } else {
      if (_state.activeDTab === 'response')  data = entry.responseDecrypted ?? entry.responseBody;
      else if (_state.activeDTab === 'request') data = entry.requestBody;
      else data = { request: entry.requestHeaders, response: entry.responseHeaders };
    }

    const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(text || '').catch(() => {});

    const btn = _dom.detailPane?.querySelector('#xr-copy-btn');
    if (btn) {
      btn.classList.add('xr-copied');
      const label = btn.querySelector('span:last-child');
      if (label) label.textContent = 'Copied!';
      setTimeout(() => {
        btn.classList.remove('xr-copied');
        if (label) label.textContent = 'Copy';
      }, 1500);
    }
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

    _dom.search.addEventListener('input', (e) => {
      _state.filter = e.target.value;
      _rebuildList();
      _updateCounts();
      if (_state.selectedId && !_filteredEntries().find(e => e.id === _state.selectedId)) {
        _state.selectedId = null;
        _renderDetail(null);
      }
    });

    _dom.clearBtn.addEventListener('click', () => {
      _state.entries    = [];
      _state.selectedId = null;
      _rebuildList();
      _renderDetail(null);
      _updateCounts();
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
      _dom.panel       = _root.getElementById('xr-panel');
      _dom.panelResize = _root.getElementById('xr-panel-resize');
      _dom.dots        = _root.getElementById('xr-dots');
      _dom.closeBtn    = _root.getElementById('xr-close');
      _dom.listPane    = _root.getElementById('xr-list-pane');
      _dom.dragHandle  = _root.getElementById('xr-drag-handle');
      _dom.detailPane  = _root.getElementById('xr-detail-pane');
      _dom.search      = _root.getElementById('xr-search');
      _dom.footerCount = _root.getElementById('xr-count');
      _dom.apiCount    = _root.getElementById('xr-api-count');
      _dom.logCount    = _root.getElementById('xr-log-count');
      _dom.clearBtn    = _root.getElementById('xr-clear');

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
      const mapped = (v === 'grid' || v === 'diff') ? 'raw' : v;
      if (mapped !== 'tree' && mapped !== 'raw') return;
      _state.activeView = mapped;
      _dom.detailPane?.querySelectorAll('.xr-toggle-btn').forEach(btn =>
        btn.classList.toggle('xr-active', btn.dataset.view === mapped)
      );
      _renderContent();
    },

    focusSearch() { _dom.search?.focus(); _dom.search?.select(); },

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
