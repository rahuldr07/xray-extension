// panel/floating.js — World-class redesign (shadcn/Linear/Vercel-inspired)
window.XRAY_Panel = (() => {
  'use strict';

  const HOST_ID = '__xray_root__';
  const STORE_KEY = 'panel_v2';

  // ── State ─────────────────────────────────────────────────────────────────
  const _state = {
    open: false,
    activeTab: 'api',        // 'api' | 'logs' | 'console' | 'insights'
    activeView: 'tree',       // 'tree' | 'raw' | 'grid' | 'diff' | 'waterfall'
    activeDTab: 'response',   // 'response' | 'request' | 'headers'
    selectedId: null,
    theme: 'zinc',
    filter: '',
    listWidth: 320,          // Wider for new grid layout
    panelWidth: 680,
    entries: [],
    diffCompareId: null,         // ID of entry to diff against
    gridDrillRow: null,         // drilled-in row data from grid view
    expandedGroups: new Set(),    // expanded endpoint groups
    treePath: '',
    paneSearch: { active: false, query: '', hits: [], current: -1 },
    pinned: new Set(),    // pinned entry IDs
    filters: { statusCodes: [], types: [] },  // filter state (moved to settings)
    maxEntries: 500,
    autoOpen: false,
    // Sorting state for API list
    sort: { field: 'timestamp', order: 'desc' },  // field: 'method' | 'status' | 'url' | 'time' | 'size' | 'timestamp'
    // Timeline reference for waterfall
    timelineStart: null,
    timelineEnd: null,
  };

  // ── DOM refs ──────────────────────────────────────────────────────────────
  let _root = null;
  let _host = null;
  let _isDevtoolsMode = false;
  let _dom = {};
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
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--xr-bg);
  color: var(--xr-text);
  font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
  font-size: 12px;
  line-height: 1.5;
  overflow: hidden;
  container-type: inline-size;
}

/* Standalone mode (legacy / devtools) */
#xr-panel.xr-standalone {
  position: fixed;
  top: 0; right: 0;
  width: 680px;
  min-width: 480px;
  max-width: 92vw;
  height: 100vh;
  z-index: 2147483647;
  border-left: 1px solid var(--xr-border);
  box-shadow: -8px 0 56px rgba(0,0,0,.65), -1px 0 0 rgba(255,255,255,.04);
  transform: translateX(102%);
  transition: transform .24s cubic-bezier(.16,1,.3,1);
}
#xr-panel.xr-standalone.xr-open { transform: translateX(0); }

/* DevTools mode */
#xr-panel.xr-devtools {
  position: relative;
  top: 0;
  right: auto;
  width: 100%;
  min-width: 0;
  max-width: none;
  height: 100vh;
  border-left: none;
  transform: none;
}
#xr-panel.xr-devtools #xr-panel-resize,
#xr-panel.xr-devtools #xr-close { display: none; }

/* HUD embedded mode - hide redundant elements */
#xr-panel.xr-hud-embed #xr-panel-resize,
#xr-panel.xr-hud-embed #xr-close { display: none; }

/* ─── Panel resize edge (standalone only) ─────────────────────────────────── */
#xr-panel-resize {
  position: absolute;
  top: 0; left: 0;
  width: 5px;
  height: 100%;
  cursor: ew-resize;
  z-index: 10;
  background: transparent;
  transition: background .15s;
  display: none; /* Hidden when embedded in HUD */
}
#xr-panel.xr-standalone #xr-panel-resize { display: block; }
#xr-panel-resize:hover,
#xr-panel-resize.xr-dragging {
  background: var(--xr-accent);
  opacity: .4;
}

/* ─── Header (macOS-style toolbar) ──────────────────────────────────────── */
.xr-header {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 44px;
  padding: 0 12px;
  background: var(--xr-bg2);
  border-bottom: 1px solid var(--xr-border);
  flex-shrink: 0;
  user-select: none;
  backdrop-filter: blur(var(--xr-blur, 12px));
  -webkit-backdrop-filter: blur(var(--xr-blur, 12px));
  position: relative;
}

/* Subtle gradient overlay for depth */
.xr-header::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%);
  pointer-events: none;
}

/* Wordmark */
.xr-wordmark {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 12px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}
.xr-logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 22px;
  background: linear-gradient(135deg, var(--xr-accent) 0%, var(--xr-purple, #a855f7) 100%);
  color: #fff;
  border-radius: var(--xr-radius, 6px);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: -0.5px;
  font-family: 'SF Mono', 'JetBrains Mono', 'Fira Code', monospace;
  flex-shrink: 0;
  line-height: 1;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15);
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}
.xr-logo-text {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--xr-text);
  text-transform: uppercase;
}

/* Live capture indicator */
.xr-capture-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--xr-muted);
  flex-shrink: 0;
  transition: all 0.3s ease;
  margin-left: -4px;
}
.xr-capture-dot.xr-live {
  background: var(--xr-success, #22c55e);
  box-shadow: 0 0 0 2px var(--xr-success-muted, rgba(34, 197, 94, 0.2));
  animation: xr-pulse 2s ease-in-out infinite;
}
@keyframes xr-pulse {
  0%, 100% { 
    opacity: 1; 
    box-shadow: 0 0 0 2px var(--xr-success-muted, rgba(34, 197, 94, 0.2));
  }
  50% { 
    opacity: 0.8; 
    box-shadow: 0 0 0 4px var(--xr-success-muted, rgba(34, 197, 94, 0.1));
  }
}

/* ─── Tabs (macOS segmented control style) ─────────────────────────────────── */
.xr-tabs {
  display: flex;
  gap: 2px;
  padding: 3px;
  background: var(--xr-bg3);
  border-radius: var(--xr-radius-md, 8px);
  position: relative;
  z-index: 1;
}
.xr-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: var(--xr-radius, 6px);
  border: none;
  background: transparent;
  color: var(--xr-muted);
  font-size: 11px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--xr-transition, 0.15s ease);
  white-space: nowrap;
  line-height: 1;
  position: relative;
}
.xr-tab:hover { 
  color: var(--xr-subtext); 
}
.xr-tab.xr-active {
  background: var(--xr-surface);
  color: var(--xr-text);
  font-weight: 600;
  box-shadow: var(--xr-shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.4));
}
.xr-tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 16px;
  padding: 0 5px;
  background: var(--xr-bg);
  color: var(--xr-muted);
  border-radius: var(--xr-radius-full, 9999px);
  font-size: 9px;
  font-weight: 600;
  transition: all var(--xr-transition, 0.15s ease);
  font-family: 'SF Mono', 'JetBrains Mono', 'Fira Code', monospace;
}
.xr-tab.xr-active .xr-tab-badge {
  background: var(--xr-accent);
  color: #fff;
}

.xr-hspacer { flex: 1; }

/* ─── Header summary (request count) ────────────────────────────────────────── */
.xr-header-summary {
  color: var(--xr-muted);
  font-size: 10px;
  font-weight: 500;
  font-family: 'SF Mono', 'JetBrains Mono', 'Fira Code', monospace;
  white-space: nowrap;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
  z-index: 1;
}

/* ─── Theme selector (macOS-style dots) ─────────────────────────────────────── */
.xr-dots { 
  display: flex; 
  align-items: center; 
  gap: 6px; 
  margin-right: 6px; 
  position: relative;
  z-index: 1;
}
.xr-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  opacity: 0.5;
  transition: all var(--xr-transition, 0.15s ease);
  flex-shrink: 0;
  outline: 2px solid transparent;
}
.xr-dot:hover { 
  opacity: 1; 
  transform: scale(1.25);
}
.xr-dot.xr-active {
  opacity: 1;
  transform: scale(1.1);
  box-shadow: 0 0 0 2px var(--xr-bg), 0 0 0 3px currentColor;
}

/* Theme dropdown (glassmorphic) */
.xr-theme-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--xr-surface);
  backdrop-filter: blur(var(--xr-blur, 12px));
  -webkit-backdrop-filter: blur(var(--xr-blur, 12px));
  border: 1px solid var(--xr-border-hover);
  border-radius: var(--xr-radius-lg, 10px);
  padding: 6px;
  min-width: 160px;
  z-index: 10000;
  box-shadow: var(--xr-shadow-lg, 0 8px 32px rgba(0, 0, 0, 0.4));
  display: none;
}
.xr-theme-dropdown.xr-open { display: flex; flex-direction: column; gap: 2px; }
.xr-theme-dropdown button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: none;
  background: transparent;
  text-align: left;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  color: var(--xr-text);
  border-radius: var(--xr-radius, 6px);
  transition: all var(--xr-transition, 0.15s ease);
  font-family: inherit;
}
.xr-theme-dropdown button:hover { 
  background: var(--xr-bg3); 
}
.xr-theme-dropdown button::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--xr-muted);
  opacity: 0.5;
  transition: all var(--xr-transition, 0.15s ease);
}
.xr-theme-dropdown button.xr-active::before {
  background: var(--xr-accent);
  opacity: 1;
  box-shadow: 0 0 0 2px var(--xr-accent-muted);
}

/* Filter bar (hidden - moved to settings) */
.xr-filter-bar {
  display: none;
}
.xr-filter-btn {
  display: none;
}

/* ═══════════════════════════════════════════════════════════════════════════
   PREMIUM API LIST (macOS/Linear-inspired)
   Ultra-dense, high-signal layout with semantic visual hierarchy
   ═══════════════════════════════════════════════════════════════════════════ */

/* ─── List Header (minimal, sticky) ─────────────────────────────────────────── */
.xr-list-header {
  display: none; /* Headers removed - content is self-explanatory */
}

/* ─── API Entry Row (Premium 4-column layout) ───────────────────────────────── */
/*
   Layout: [status-dot 8px] [method-pill 42px] [url flex] [meta 70px]
   Total visual weight: URL is hero, everything else is supporting cast
*/
.xr-entry.xr-api-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--xr-divider, var(--xr-border));
  cursor: pointer;
  transition: all var(--xr-transition, 0.15s ease);
  min-height: 40px;
  position: relative;
  background: transparent;
}

/* Hover state - subtle lift effect */
.xr-entry.xr-api-row:hover {
  background: var(--xr-bg2);
}

/* Selected state - accent highlight */
.xr-entry.xr-api-row.xr-selected {
  background: var(--xr-accent-muted, rgba(59, 130, 246, 0.08));
  box-shadow: inset 2px 0 0 var(--xr-accent);
}
.xr-entry.xr-api-row.xr-selected:hover {
  background: var(--xr-accent-muted, rgba(59, 130, 246, 0.12));
}

/* ─── Status Dot (semantic color indicator) ─────────────────────────────────── */
.xr-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: transform var(--xr-transition, 0.15s ease), box-shadow var(--xr-transition, 0.15s ease);
}
.xr-api-row:hover .xr-status-dot {
  transform: scale(1.2);
}

/* Status dot colors */
.xr-status-dot.xr-s-2xx { background: var(--xr-dot-success, var(--xr-success)); box-shadow: 0 0 0 2px var(--xr-success-muted, rgba(34, 197, 94, 0.2)); }
.xr-status-dot.xr-s-3xx { background: var(--xr-dot-info, var(--xr-info)); box-shadow: 0 0 0 2px var(--xr-info-muted, rgba(14, 165, 233, 0.2)); }
.xr-status-dot.xr-s-4xx { background: var(--xr-dot-warning, var(--xr-warning)); box-shadow: 0 0 0 2px var(--xr-warning-muted, rgba(245, 158, 11, 0.2)); }
.xr-status-dot.xr-s-5xx { background: var(--xr-dot-error, var(--xr-error)); box-shadow: 0 0 0 2px var(--xr-error-muted, rgba(239, 68, 68, 0.2)); }
.xr-status-dot.xr-s-pending { background: var(--xr-dot-muted, var(--xr-muted)); opacity: 0.5; }

/* ─── Method Pill (compact, colored) ────────────────────────────────────────── */
.xr-method-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 42px;
  height: 20px;
  padding: 0 6px;
  border-radius: var(--xr-radius-sm, 4px);
  font-family: 'SF Mono', 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  flex-shrink: 0;
  transition: all var(--xr-transition, 0.15s ease);
}

/* Method colors with muted backgrounds */
.xr-method-pill.xr-m-get {
  background: var(--xr-success-muted, rgba(34, 197, 94, 0.12));
  color: var(--xr-success);
}
.xr-method-pill.xr-m-post {
  background: var(--xr-info-muted, rgba(14, 165, 233, 0.12));
  color: var(--xr-info);
}
.xr-method-pill.xr-m-put {
  background: var(--xr-warning-muted, rgba(245, 158, 11, 0.12));
  color: var(--xr-warning);
}
.xr-method-pill.xr-m-patch {
  background: rgba(249, 115, 22, 0.12);
  color: var(--xr-orange);
}
.xr-method-pill.xr-m-delete {
  background: var(--xr-error-muted, rgba(239, 68, 68, 0.12));
  color: var(--xr-error);
}
.xr-method-pill.xr-m-options,
.xr-method-pill.xr-m-head {
  background: var(--xr-bg3);
  color: var(--xr-muted);
}

/* ─── URL (Hero element) ────────────────────────────────────────────────────── */
.xr-url-wrap {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.xr-url-path {
  font-family: 'SF Mono', 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 11px;
  font-weight: 500;
  color: var(--xr-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.3;
}

/* URL path segments coloring */
.xr-url-path .xr-url-param {
  color: var(--xr-accent);
}
.xr-url-path .xr-url-query {
  color: var(--xr-muted);
  font-weight: 400;
}

/* N+1 badge inline with URL */
.xr-n1-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-left: 6px;
  padding: 1px 5px;
  border-radius: var(--xr-radius-full, 9999px);
  font-size: 9px;
  font-weight: 600;
  font-family: 'SF Mono', 'JetBrains Mono', monospace;
  vertical-align: middle;
}
.xr-n1-badge.xr-n1-info {
  background: var(--xr-info-muted);
  color: var(--xr-info);
}
.xr-n1-badge.xr-n1-warning {
  background: var(--xr-warning-muted);
  color: var(--xr-warning);
}
.xr-n1-badge.xr-n1-critical {
  background: var(--xr-error-muted);
  color: var(--xr-error);
}

/* ─── Meta (time + size, secondary info) ────────────────────────────────────── */
.xr-meta-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  min-width: 70px;
  justify-content: flex-end;
}

.xr-meta-time,
.xr-meta-size {
  font-family: 'SF Mono', 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--xr-muted);
  white-space: nowrap;
}

/* Time color coding */
.xr-meta-time.xr-time-fast { color: var(--xr-success); }
.xr-meta-time.xr-time-medium { color: var(--xr-warning); }
.xr-meta-time.xr-time-slow { color: var(--xr-error); }

/* ─── Quick Actions (glassmorphic hover menu) ───────────────────────────────── */
.xr-api-row .xr-quick-actions {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%) scale(0.95);
  display: flex;
  gap: 2px;
  padding: 4px;
  background: var(--xr-surface);
  backdrop-filter: blur(var(--xr-blur-sm, 8px));
  -webkit-backdrop-filter: blur(var(--xr-blur-sm, 8px));
  border: 1px solid var(--xr-border-hover);
  border-radius: var(--xr-radius-md, 8px);
  box-shadow: var(--xr-shadow, 0 2px 8px rgba(0, 0, 0, 0.3));
  z-index: 10;
  opacity: 0;
  pointer-events: none;
  transition: all var(--xr-transition, 0.15s ease);
}
.xr-api-row:hover .xr-quick-actions {
  opacity: 1;
  transform: translateY(-50%) scale(1);
  pointer-events: auto;
}

.xr-quick-actions button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  background: transparent;
  border: none;
  color: var(--xr-muted);
  font-size: 13px;
  cursor: pointer;
  border-radius: var(--xr-radius-sm, 4px);
  transition: all var(--xr-transition-fast, 0.1s ease);
}
.xr-quick-actions button:hover {
  background: var(--xr-bg3);
  color: var(--xr-text);
  transform: scale(1.1);
}
.xr-quick-actions button:active {
  transform: scale(0.95);
}

/* ─── Pinned indicator ──────────────────────────────────────────────────────── */
.xr-api-row.xr-pinned {
  background: linear-gradient(90deg, var(--xr-warning-muted) 0%, transparent 100%);
}
.xr-api-row.xr-pinned::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--xr-warning);
}

/* ═══════════════════════════════════════════════════════════════════════════
   LEGACY COMPATIBILITY (keeping old class names working)
   ═══════════════════════════════════════════════════════════════════════════ */
.xr-api-row .xr-col { display: none; }
.xr-api-row .xr-col-waterfall { display: none; }
.xr-waterfall-bar { display: none; }

/* Status colors for old classes (redirect to new dot system) */
.xr-col-status.xr-s-2xx { color: var(--xr-success); }
.xr-col-status.xr-s-3xx { color: var(--xr-info); }
.xr-col-status.xr-s-4xx { color: var(--xr-warning); }
.xr-col-status.xr-s-5xx { color: var(--xr-error); }
.xr-col-status.xr-s-pending { color: var(--xr-muted); }

/* Method colors for old classes */
.xr-col-method.xr-m-get { color: var(--xr-success); }
.xr-col-method.xr-m-post { color: var(--xr-info); }
.xr-col-method.xr-m-put { color: var(--xr-warning); }
.xr-col-method.xr-m-patch { color: var(--xr-orange); }
.xr-col-method.xr-m-delete { color: var(--xr-error); }

/* ═══════════════════════════════════════════════════════════════════════════
   TOAST NOTIFICATION (micro-feedback)
   ═══════════════════════════════════════════════════════════════════════════ */
.xr-toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  padding: 8px 16px;
  background: var(--xr-surface);
  backdrop-filter: blur(var(--xr-blur, 12px));
  -webkit-backdrop-filter: blur(var(--xr-blur, 12px));
  border: 1px solid var(--xr-border-hover);
  border-radius: var(--xr-radius-lg, 10px);
  box-shadow: var(--xr-shadow-lg, 0 8px 32px rgba(0, 0, 0, 0.4));
  font-size: 12px;
  font-weight: 500;
  color: var(--xr-text);
  z-index: 99999;
  opacity: 0;
  pointer-events: none;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.xr-toast.xr-toast-show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* ═══════════════════════════════════════════════════════════════════════════
   ICON BUTTONS (premium hover states)
   ═══════════════════════════════════════════════════════════════════════════ */
.xr-ibtn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid transparent;
  border-radius: var(--xr-radius, 6px);
  background: transparent;
  color: var(--xr-muted);
  cursor: pointer;
  font-size: 14px;
  font-family: inherit;
  transition: all var(--xr-transition, 0.15s ease);
  flex-shrink: 0;
  line-height: 1;
  position: relative;
  z-index: 1;
}
.xr-ibtn:hover {
  background: var(--xr-bg3);
  color: var(--xr-text);
  transform: scale(1.05);
}
.xr-ibtn:active {
  transform: scale(0.95);
}
.xr-ibtn svg {
  width: 16px;
  height: 16px;
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
  min-width: 280px;
  max-width: 500px;
  flex: 1;
  /* Premium scroll styling */
  scrollbar-width: thin;
  scrollbar-color: var(--xr-surface) transparent;
}
.xr-list-pane::-webkit-scrollbar {
  width: 6px;
}
.xr-list-pane::-webkit-scrollbar-track {
  background: transparent;
}
.xr-list-pane::-webkit-scrollbar-thumb {
  background: var(--xr-surface);
  border-radius: 3px;
}
.xr-list-pane::-webkit-scrollbar-thumb:hover {
  background: var(--xr-overlay);
}

/* ─── List wrap (holds pane + fade mask) ──────────────────────────────────── */
.xr-list-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
  border-right: 1px solid var(--xr-border);
  min-width: 280px;
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

/* ─── Drag handle (premium resize indicator) ────────────────────────────────── */
.xr-drag-handle {
  width: 4px;
  background: transparent;
  cursor: col-resize;
  flex-shrink: 0;
  transition: all var(--xr-transition, 0.15s ease);
  position: relative;
}
.xr-drag-handle::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 2px;
  height: 24px;
  background: var(--xr-surface);
  border-radius: 2px;
  opacity: 0;
  transition: opacity var(--xr-transition, 0.15s ease);
}
.xr-drag-handle:hover::before,
.xr-drag-handle.xr-dragging::before {
  opacity: 1;
}
.xr-drag-handle:hover,
.xr-drag-handle.xr-dragging {
  background: var(--xr-accent-muted);
}

/* ═══════════════════════════════════════════════════════════════════════════
   EMPTY STATES (premium placeholder)
   ═══════════════════════════════════════════════════════════════════════════ */
.xr-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 24px;
  text-align: center;
  color: var(--xr-muted);
  flex: 1;
  width: 100%;
}
.xr-empty-icon {
  font-size: 36px;
  line-height: 1;
  opacity: 0.3;
  filter: grayscale(1);
}
.xr-empty-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--xr-subtext);
  margin-top: 4px;
}
.xr-empty-desc {
  font-size: 11px;
  color: var(--xr-muted);
  line-height: 1.6;
  max-width: 220px;
}
.xr-kbd-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  flex-wrap: wrap;
  justify-content: center;
}
.xr-kbd {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 7px;
  background: var(--xr-surface);
  border: 1px solid var(--xr-border);
  border-radius: var(--xr-radius-sm, 4px);
  font-family: 'SF Mono', 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 10px;
  font-weight: 500;
  color: var(--xr-subtext);
  white-space: nowrap;
  box-shadow: 0 1px 0 var(--xr-border);
}
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
  --xr-heat: 0;
  background-image: linear-gradient(90deg, rgba(251,191,36,var(--xr-heat)) 0%, rgba(251,191,36,0) 72%);
}
.xr-entry:hover {
  background:
    linear-gradient(90deg, rgba(255,255,255,.03) 0%, transparent 100%),
    linear-gradient(90deg, rgba(251,191,36,var(--xr-heat)) 0%, rgba(251,191,36,0) 72%);
  transform: translateX(1px);
}
.xr-entry.xr-selected {
  background:
    linear-gradient(90deg, rgba(255,255,255,.05) 0%, transparent 100%),
    linear-gradient(90deg, rgba(251,191,36,var(--xr-heat)) 0%, rgba(251,191,36,0) 72%);
  border-left-color: var(--xr-accent);
}
/* Color the left stripe by method */
.xr-entry[data-method="GET"]    { --xr-stripe: var(--xr-blue);   }
.xr-entry[data-method="POST"]   { --xr-stripe: var(--xr-green);  }
.xr-entry[data-method="PUT"]    { --xr-stripe: var(--xr-yellow); }
.xr-entry[data-method="DELETE"] { --xr-stripe: var(--xr-red);    }
.xr-entry[data-method="PATCH"]  { --xr-stripe: var(--xr-purple); }
.xr-entry.xr-selected { border-left-color: var(--xr-stripe, var(--xr-accent)); }

.xr-group-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 16px;
  border: 1px solid var(--xr-border);
  border-radius: 10px;
  background: var(--xr-bg3);
  color: var(--xr-subtext);
  font-size: 9px;
  font-weight: 700;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  padding: 0 6px;
  cursor: pointer;
}
.xr-group-badge:hover { border-color: var(--xr-ring); color: var(--xr-text); }
.xr-group-badge.xr-open { color: var(--xr-accent); border-color: var(--xr-accent); }
.xr-group-children { display: flex; flex-direction: column; }
.xr-entry.xr-group-child {
  margin-left: 14px;
  border-left-width: 2px;
  opacity: .95;
}
.xr-entry.xr-group-child::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--xr-border);
}

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

.xr-spark-wrap {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  min-width: 44px;
}
.xr-spark {
  width: 44px;
  height: 12px;
}
.xr-spark-line {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  opacity: .9;
}
.xr-spark-dot { fill: currentColor; }
.xr-spark-fast { color: var(--xr-green); }
.xr-spark-mid { color: var(--xr-yellow); }
.xr-spark-slow { color: var(--xr-red); }

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
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.xr-status-icon { font-size: 9px; opacity: .92; line-height: 1; }
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
.xr-insights-pane {
  display: none;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  overflow: auto;
  padding: 16px;
  background: var(--xr-bg);
}
.xr-insights-pane.xr-active {
  display: flex;
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
.xr-copy-dropdown-btn {
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
.xr-copy-dropdown-btn:hover { border-color: var(--xr-ring); color: var(--xr-text); background: var(--xr-surface); }
.xr-copy-dropdown-btn.xr-copied { border-color: var(--xr-green); color: var(--xr-green); background: rgba(74,222,128,.06); }

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
.xr-export-btn {
  padding: 4px 10px;
  background: var(--xr-bg3);
  border: 1px solid var(--xr-border);
  border-radius: 4px;
  color: var(--xr-subtext);
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all .15s;
}
.xr-export-btn:hover {
  background: var(--xr-surface);
  border-color: var(--xr-ring);
  color: var(--xr-text);
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
.xr-grid-table thead th.xr-grid-idx,
.xr-grid-table tbody td.xr-grid-idx {
  position: sticky;
  left: 0;
  z-index: 3;
  background: var(--xr-bg2);
}
.xr-grid-table tbody td.xr-grid-idx { background: var(--xr-bg); z-index: 2; }
.xr-grid-table thead th:nth-child(2),
.xr-grid-table tbody td:nth-child(2) {
  position: sticky;
  left: 36px;
  z-index: 2;
  background: var(--xr-bg);
  box-shadow: 2px 0 0 var(--xr-border);
}
.xr-grid-table thead th:nth-child(2) { background: var(--xr-bg2); z-index: 3; }
.xr-grid-row:hover td.xr-grid-idx,
.xr-grid-row:hover td:nth-child(2) { background: var(--xr-bg3); }
.xr-grid-row.xr-grid-sel td.xr-grid-idx,
.xr-grid-row.xr-grid-sel td:nth-child(2) { background: rgba(99,102,241,.1); }
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
.xr-diff-auto-info {
  padding: 5px 10px;
  font-size: 10px;
  color: var(--xr-subtext);
  border-bottom: 1px solid var(--xr-border);
  background: var(--xr-bg2);
}

/* ─── Tree breadcrumb ─────────────────────────────────────────────────────── */
.xr-tree-breadcrumb {
  display: none;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  padding: 6px 10px;
  border-bottom: 1px solid var(--xr-border);
  background: var(--xr-bg2);
  flex-shrink: 0;
}
.xr-tree-breadcrumb.xr-open { display: flex; }
.xr-tree-crumb {
  border: 1px solid var(--xr-border);
  background: var(--xr-bg3);
  color: var(--xr-subtext);
  border-radius: 4px;
  font-size: 10px;
  padding: 2px 6px;
  cursor: pointer;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}
.xr-tree-crumb:hover { color: var(--xr-text); border-color: var(--xr-ring); }
.xr-tree-crumb-sep { color: var(--xr-muted); font-size: 9px; }
.xr-tree-path-hit {
  outline: 1px solid var(--xr-accent);
  background: rgba(99,102,241,.08);
}

/* ─── Waterfall view ──────────────────────────────────────────────────────── */
.xr-waterfall-wrap { display: flex; flex-direction: column; height: 100%; overflow: hidden; }
.xr-waterfall-axis {
  position: relative;
  height: 18px;
  border-bottom: 1px solid var(--xr-border);
  font-size: 9px;
  color: var(--xr-muted);
  margin: 0 10px;
}
.xr-waterfall-axis-tick {
  position: absolute;
  top: 2px;
  transform: translateX(-50%);
  white-space: nowrap;
}
.xr-waterfall-axis-tick::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 12px;
  width: 1px;
  height: 8px;
  background: var(--xr-border);
}
.xr-waterfall-body { flex: 1; overflow: auto; padding: 6px 10px 10px; display: flex; flex-direction: column; gap: 6px; }
.xr-waterfall-row { display: grid; grid-template-columns: 210px 1fr; gap: 8px; align-items: center; }
.xr-waterfall-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--xr-subtext);
  font-size: 10px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}
.xr-waterfall-lane {
  position: relative;
  height: 18px;
  background: var(--xr-bg2);
  border: 1px solid var(--xr-border);
  border-radius: 4px;
}
.xr-waterfall-bar {
  position: absolute;
  top: 1px;
  height: 14px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  min-width: 2px;
  color: var(--xr-bg);
  font-size: 9px;
  padding: 0 4px;
  text-align: left;
  overflow: hidden;
  white-space: nowrap;
}
.xr-waterfall-bar-text { pointer-events: none; font-weight: 700; opacity: .9; }
.xr-waterfall-bar.xr-selected { outline: 1px solid var(--xr-accent); }
.xr-wf-get { background: rgba(96,165,250,.75); }
.xr-wf-post { background: rgba(74,222,128,.75); }
.xr-wf-put { background: rgba(251,191,36,.75); }
.xr-wf-delete { background: rgba(248,113,113,.75); }
.xr-wf-patch { background: rgba(192,132,252,.75); }
.xr-wf-head, .xr-wf-options { background: rgba(139, 92, 246, .65); }

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

/* ─── Settings Modal ─────────────────────────────────────────────────────── */
.xr-settings-backdrop {
  display: none;
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,.6);
  z-index: 9998;
  align-items: center;
  justify-content: center;
  font-family: inherit;
}
.xr-settings-backdrop.xr-open {
  display: flex;
}
.xr-settings-modal {
  background: var(--xr-bg);
  border: 1px solid var(--xr-border);
  border-radius: 8px;
  width: 90%;
  max-width: 480px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,.3);
}
.xr-settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--xr-border);
  flex-shrink: 0;
}
.xr-settings-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--xr-text);
  font-family: inherit;
}
.xr-settings-close {
  background: none;
  border: none;
  color: var(--xr-muted);
  font-size: 16px;
  cursor: pointer;
  padding: 4px 8px;
  transition: color .12s;
}
.xr-settings-close:hover {
  color: var(--xr-text);
}
.xr-settings-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px 20px;
  flex: 1;
  overflow-y: auto;
}
.xr-settings-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.xr-settings-section-title {
  font-size: 10px;
  font-weight: 700;
  color: var(--xr-muted);
  text-transform: uppercase;
  letter-spacing: .5px;
}
.xr-settings-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0;
}
.xr-settings-label {
  font-size: 11px;
  color: var(--xr-text);
  flex: 1;
}
.xr-settings-select {
  background: var(--xr-bg2);
  border: 1px solid var(--xr-border);
  border-radius: 5px;
  color: var(--xr-text);
  font-size: 11px;
  padding: 6px 8px;
  font-family: inherit;
  cursor: pointer;
}
.xr-settings-checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: var(--xr-bg2);
  border: 1px solid var(--xr-border);
  border-radius: 4px;
  cursor: pointer;
  transition: background .12s, border-color .12s;
}
.xr-settings-checkbox:hover {
  background: var(--xr-surface);
}
.xr-settings-checkbox input {
  cursor: pointer;
  accent-color: var(--xr-ring);
}
.xr-settings-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}
.xr-settings-checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: var(--xr-bg2);
  border: 1px solid var(--xr-border);
  border-radius: 4px;
  cursor: pointer;
  transition: background .12s, border-color .12s;
  font-size: 11px;
  color: var(--xr-text);
}
.xr-settings-checkbox:hover {
  background: var(--xr-surface);
}
.xr-settings-checkbox:has(input:checked) {
  background: var(--xr-surface);
  border-color: var(--xr-accent);
}
/* Range slider */
.xr-settings-range {
  -webkit-appearance: none;
  appearance: none;
  width: 120px;
  height: 4px;
  background: var(--xr-bg3);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}
.xr-settings-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--xr-accent);
  cursor: pointer;
  transition: transform .15s;
}
.xr-settings-range::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}
.xr-settings-range::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--xr-accent);
  border: none;
  cursor: pointer;
}
.xr-filter-tag {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  font-size: 10px;
}
.xr-filter-tag.xr-s-2xx { color: var(--xr-success); }
.xr-filter-tag.xr-s-3xx { color: var(--xr-info); }
.xr-filter-tag.xr-s-4xx { color: var(--xr-warning); }
.xr-filter-tag.xr-s-5xx { color: var(--xr-error); }
.xr-settings-stat {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.xr-settings-stat-label {
  font-size: 11px;
  color: var(--xr-muted);
}
.xr-settings-stat-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--xr-ring);
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}
.xr-settings-kbd-table {
  font-size: 10px;
  width: 100%;
  border-collapse: collapse;
}
.xr-settings-kbd-table td {
  padding: 4px 6px;
  border-bottom: 1px solid var(--xr-border);
  color: var(--xr-text);
}
.xr-settings-kbd-table td:first-child {
  color: var(--xr-muted);
  width: 50%;
}
.xr-settings-kbd-table td:last-child {
  text-align: right;
}
.xr-settings-footer {
  display: flex;
  gap: 8px;
  padding: 16px 20px;
  border-top: 1px solid var(--xr-border);
  flex-shrink: 0;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.xr-settings-btn {
  background: transparent;
  border: 1px solid var(--xr-border);
  color: var(--xr-text);
  border-radius: 5px;
  padding: 7px 14px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: background .12s;
  font-family: inherit;
}
.xr-settings-footer #xr-settings-export-all { margin-right: auto; }
.xr-settings-btn:hover {
  background: var(--xr-surface);
}
.xr-settings-btn-danger {
  color: var(--xr-red);
  border-color: var(--xr-red);
}
.xr-settings-btn-danger:hover {
  background: rgba(248,113,113,.1);
}

/* ─── Container queries (panel-width responsive) ─────────────────────────── */
@container (max-width: 500px) {
  .xr-header { padding: 0 7px 0 9px; }
  .xr-tab { padding: 4px 8px; font-size: 10px; }
  .xr-header-summary { max-width: 140px; font-size: 9px; }
  .xr-detail-url { font-size: 10px; }
  .xr-pills-row { gap: 5px; }
  .xr-pill { padding: 4px 6px; }
  .xr-waterfall-row { grid-template-columns: 150px 1fr; }
}

@container (max-width: 420px) {
  .xr-header-summary { display: none; }
  .xr-filter-btn { padding: 3px 5px; font-size: 9px; }
  .xr-filter-btn[data-filter-type] {
    font-size: 0;
    min-width: 24px;
    padding: 3px 4px;
  }
  .xr-filter-btn[data-filter-type]::before {
    content: attr(data-short);
    font-size: 10px;
  }
  .xr-dtabs {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    padding: 0 8px;
  }
  .xr-dtab { padding: 8px 6px; text-align: center; }
  .xr-toolbar-row { padding: 6px 8px; }
  .xr-waterfall-row { grid-template-columns: 120px 1fr; }
}

@container (min-width: 600px) {
  .xr-header { padding: 0 12px 0 14px; }
  .xr-entry-content { padding-right: 10px; }
  .xr-waterfall-row { grid-template-columns: 240px 1fr; }
}


/* ─── Scrollbar ──────────────────────────────────────────────────────────── */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--xr-surface); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--xr-overlay); }

/* ─── N+1 Detection ─────────────────────────────────────────────────────── */
${window.XRAY_NPlusOne?.getCSS?.() || ''}
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
    <button class="xr-tab" data-tab="console">
      Console <span class="xr-console-icon">&gt;_</span>
    </button>
    <button class="xr-tab" data-tab="insights">
      📊 Insights
    </button>
  </div>
  <div class="xr-header-summary" id="xr-header-summary">0 APIs · 0 Errors · 0.0 MB</div>
  <div class="xr-hspacer"></div>
  <button class="xr-ibtn" id="xr-settings-btn" title="Settings">⚙️</button>
  <div class="xr-dots" id="xr-dots"></div>
  <button class="xr-ibtn" id="xr-close" title="Close (Esc)">✕</button>
</div>
<div class="xr-body">
  <div class="xr-list-wrap">
    <div class="xr-list-pane" id="xr-list-pane"></div>
  </div>
  <div class="xr-drag-handle" id="xr-drag-handle"></div>
  <div class="xr-detail-pane" id="xr-detail-pane"></div>
  <div class="xr-console-pane" id="xr-console-pane"></div>
  <div class="xr-insights-pane" id="xr-insights-pane"></div>
</div>
<div class="xr-footer">
  <div class="xr-footer-hint">
    <span class="xr-kbd">Ctrl+K</span> search
  </div>
  <button class="xr-export-btn" id="xr-export-btn" title="Export all entries">⬇ Export</button>
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
<div class="xr-settings-backdrop" id="xr-settings-backdrop">
  <div class="xr-settings-modal">
    <div class="xr-settings-header">
      <div class="xr-settings-title">Settings</div>
      <button class="xr-settings-close" id="xr-settings-close">✕</button>
    </div>
    <div class="xr-settings-body">
      <!-- Panel Appearance -->
      <div class="xr-settings-section">
        <div class="xr-settings-section-title">Panel</div>
        <div class="xr-settings-item">
          <label class="xr-settings-label">Dock Position</label>
          <select class="xr-settings-select" id="xr-settings-dock">
            <option value="right">Right Side</option>
            <option value="bottom">Bottom</option>
          </select>
        </div>
        <div class="xr-settings-item">
          <label class="xr-settings-label">Background Opacity</label>
          <div style="display:flex;align-items:center;gap:8px;">
            <input type="range" min="50" max="100" value="92" class="xr-settings-range" id="xr-settings-opacity">
            <span id="xr-settings-opacity-val" style="font-size:11px;color:var(--xr-subtext);min-width:32px;">92%</span>
          </div>
        </div>
        <div class="xr-settings-item">
          <label class="xr-settings-checkbox">
            <input type="checkbox" id="xr-settings-blur" checked>
            <span>Glassmorphism (frosted blur)</span>
          </label>
        </div>
      </div>

      <!-- Theme -->
      <div class="xr-settings-section">
        <div class="xr-settings-section-title">Theme</div>
        <div class="xr-settings-item">
          <label class="xr-settings-label">Color Scheme</label>
          <select class="xr-settings-select" id="xr-settings-theme">
            <option value="zinc">Zinc (Dark)</option>
            <option value="mocha">Mocha (Dark)</option>
            <option value="latte">Latte (Light)</option>
            <option value="dracula">Dracula (Dark)</option>
            <option value="nord">Nord (Dark)</option>
          </select>
        </div>
      </div>

      <!-- Filters (moved from list) -->
      <div class="xr-settings-section">
        <div class="xr-settings-section-title">Filters</div>
        <div class="xr-settings-item">
          <label class="xr-settings-label">Status Codes</label>
          <div class="xr-settings-filters" id="xr-settings-status-filters">
            <label class="xr-settings-checkbox"><input type="checkbox" data-status="2xx"> <span class="xr-filter-tag xr-s-2xx">2xx</span></label>
            <label class="xr-settings-checkbox"><input type="checkbox" data-status="3xx"> <span class="xr-filter-tag xr-s-3xx">3xx</span></label>
            <label class="xr-settings-checkbox"><input type="checkbox" data-status="4xx"> <span class="xr-filter-tag xr-s-4xx">4xx</span></label>
            <label class="xr-settings-checkbox"><input type="checkbox" data-status="5xx"> <span class="xr-filter-tag xr-s-5xx">5xx</span></label>
          </div>
          <div style="font-size:10px;color:var(--xr-muted);margin-top:4px;">Leave all unchecked to show all status codes</div>
        </div>
        <div class="xr-settings-item">
          <label class="xr-settings-label">Request Types</label>
          <div class="xr-settings-filters" id="xr-settings-type-filters">
            <label class="xr-settings-checkbox"><input type="checkbox" data-type="fetch"> 📡 Fetch</label>
            <label class="xr-settings-checkbox"><input type="checkbox" data-type="xhr"> 🔗 XHR</label>
          </div>
          <div style="font-size:10px;color:var(--xr-muted);margin-top:4px;">Leave all unchecked to show all types</div>
        </div>
      </div>

      <!-- Statistics -->
      <div class="xr-settings-section">
        <div class="xr-settings-section-title">Statistics</div>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <div class="xr-settings-stat">
            <span class="xr-settings-stat-label">Total API calls:</span>
            <span class="xr-settings-stat-value" id="xr-stat-api">0</span>
          </div>
          <div class="xr-settings-stat">
            <span class="xr-settings-stat-label">Console logs:</span>
            <span class="xr-settings-stat-value" id="xr-stat-logs">0</span>
          </div>
          <div class="xr-settings-stat">
            <span class="xr-settings-stat-label">Pinned entries:</span>
            <span class="xr-settings-stat-value" id="xr-stat-pinned">0</span>
          </div>
          <div class="xr-settings-stat">
            <span class="xr-settings-stat-label">Error responses (4xx/5xx):</span>
            <span class="xr-settings-stat-value" id="xr-stat-errors">0</span>
          </div>
        </div>
      </div>

      <!-- Keyboard Shortcuts -->
      <div class="xr-settings-section">
        <div class="xr-settings-section-title">Keyboard Shortcuts</div>
        <table class="xr-settings-kbd-table">
          <tr><td><span class="xr-kbd">Ctrl+Shift+X</span></td><td>Toggle panel</td></tr>
          <tr><td><span class="xr-kbd">Ctrl+Shift+D</span></td><td>Toggle dock mode</td></tr>
          <tr><td><span class="xr-kbd">Ctrl+K</span></td><td>Command palette</td></tr>
          <tr><td><span class="xr-kbd">Ctrl+F</span></td><td>Search in JSON</td></tr>
          <tr><td><span class="xr-kbd">T</span></td><td>Tree view</td></tr>
          <tr><td><span class="xr-kbd">G</span></td><td>Grid view</td></tr>
          <tr><td><span class="xr-kbd">R</span></td><td>Raw JSON</td></tr>
          <tr><td><span class="xr-kbd">D</span></td><td>Diff view</td></tr>
          <tr><td><span class="xr-kbd">W</span></td><td>Waterfall view</td></tr>
          <tr><td><span class="xr-kbd">Shift+W</span></td><td>Collapse all</td></tr>
          <tr><td><span class="xr-kbd">S</span></td><td>Pin/Star</td></tr>
          <tr><td><span class="xr-kbd">C</span></td><td>Copy JSON</td></tr>
          <tr><td><span class="xr-kbd">Esc</span></td><td>Close panel</td></tr>
        </table>
      </div>
    </div>

    <div class="xr-settings-footer">
      <button class="xr-settings-btn" id="xr-settings-export-all">Export All (JSON)</button>
      <button class="xr-settings-btn xr-settings-btn-danger" id="xr-settings-clear-pins">Clear Pins</button>
      <button class="xr-settings-btn xr-settings-btn-danger" id="xr-settings-clear-all">Clear All</button>
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
    const theme = themes[name] || themes['zinc'];
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
    const inEntryMenu = typeof e.target?.closest === 'function' &&
      !!e.target.closest('.xr-entry-menu, .xr-entry-menu-dropdown');
    if (!inEntryMenu) {
      _root?.querySelectorAll('.xr-entry-menu-dropdown.xr-open').forEach((menu) => {
        menu.classList.remove('xr-open');
        menu.style.position = '';
        menu.style.left = '';
        menu.style.top = '';
      });
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // State persistence
  // ══════════════════════════════════════════════════════════════════════════
  function _saveState() {
    window.XRAY_Store.set(STORE_KEY, {
      open: _state.open,
      listWidth: _state.listWidth,
      panelWidth: _state.panelWidth,
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Entry helpers
  // ══════════════════════════════════════════════════════════════════════════
  function _filteredEntries() {
    const byTab = _state.entries.filter(e =>
      (_state.activeTab === 'api' && e.type === 'api') ||
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
    return (_state.activeTab === 'api' && entry.type === 'api') ||
      (_state.activeTab === 'logs' && entry.type === 'log');
  }

  function _entryMatchesFilter(entry) {
    if (window.XRAY_Search.filter([entry], _state.filter).length === 0) return false;
    return _applyFilters([entry]).length > 0;
  }

  function _updateCounts() {
    const apiEntries = _state.entries.filter(e => e.type === 'api');
    const api = apiEntries.length;
    const logs = _state.entries.filter(e => e.type === 'log').length;
    const errors = apiEntries.filter((e) => Number(e.status) >= 400).length;
    const totalBytes = apiEntries.reduce((sum, e) => {
      const size = Number(e.size);
      return sum + (Number.isFinite(size) ? Math.max(0, size) : 0);
    }, 0);
    const totalMb = totalBytes / (1024 * 1024);

    if (_dom.apiCount) _dom.apiCount.textContent = api;
    if (_dom.logCount) _dom.logCount.textContent = logs;
    if (_dom.headerSummary) {
      _dom.headerSummary.textContent = `${api} APIs · ${errors} Errors · ${totalMb.toFixed(1)} MB`;
    }
    const shown = _filteredEntries().length;
    if (_dom.footerCount)
      _dom.footerCount.textContent = shown;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // List rendering
  // ══════════════════════════════════════════════════════════════════════════
  function _statusGlyph(status) {
    const code = Number(status) || 0;
    if (code >= 200 && code < 300) return '✓';
    if (code >= 300 && code < 400) return '↗';
    if (code >= 400 && code < 500) return '⚠';
    if (code >= 500) return '✕';
    return '•';
  }

  function _recentEndpointDurations(entry, limit = 8) {
    const endpoint = entry?.urlPath || entry?.url || null;
    if (!endpoint) return [Math.max(0, Number(entry?.duration) || 0)];
    const durations = _state.entries
      .filter((e) => e.type === 'api' && ((e.urlPath || e.url || null) === endpoint))
      .slice(-limit)
      .map((e) => Math.max(0, Number(e.duration) || 0));
    if (!durations.length) durations.push(Math.max(0, Number(entry?.duration) || 0));
    return durations;
  }

  function _buildSparklineSVG(durations, currentDuration) {
    const vals = durations.length ? durations : [0];
    const width = 44;
    const height = 12;
    const max = Math.max(1, ...vals);
    const points = vals.map((d, i) => {
      const x = vals.length === 1 ? 0 : (i / (vals.length - 1)) * width;
      const y = height - (Math.min(max, d) / max) * height;
      return `${x.toFixed(2)},${Math.max(1, y).toFixed(2)}`;
    }).join(' ');
    const last = points.split(' ').pop() || `0,${height}`;
    const sparkClass = currentDuration > 1000 ? 'xr-spark-slow' : currentDuration > 300 ? 'xr-spark-mid' : 'xr-spark-fast';
    return `<svg class="xr-spark ${sparkClass}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true">
      <polyline class="xr-spark-line" points="${points}" />
      <circle class="xr-spark-dot" cx="${last.split(',')[0]}" cy="${last.split(',')[1]}" r="1.8"></circle>
    </svg>`;
  }

  function _renderEntry(entry, opts = {}) {
    const { formatTime, formatDuration, formatSize, statusClass, methodClass, shortPath, previewJSON } =
      window.XRAY_Utils;

    const el = document.createElement('div');
    const isSelected = opts.forceSelected || entry.id === _state.selectedId;
    el.className = 'xr-entry' + (isSelected ? ' xr-selected' : '');
    el.dataset.id = entry.id;
    if (opts.isChild) el.classList.add('xr-group-child');

    const isPinned = _state.pinned.has(entry.id);
    const groupCount = opts.groupCount || 1;
    const groupExpanded = !!opts.groupExpanded;
    const groupKey = opts.groupKey || '';
    const groupBadge = groupCount > 1
      ? `<button class="xr-group-badge ${groupExpanded ? 'xr-open' : ''}" title="${groupExpanded ? 'Collapse group' : 'Expand group'}" data-group-key="${groupKey}">×${groupCount}</button>`
      : '';

    if (entry.type === 'api') {
      const method = (entry.method || 'GET').toUpperCase();
      const mClass = methodClass(entry.method || 'GET');
      const sClass = statusClass(entry.status);
      const path = shortPath(entry.url || '');
      const dur = entry.duration ?? 0;
      const heat = Math.min(0.18, Math.max(0, ((Number(entry.size) || 0) / 102400) * 0.18));
      const sparkline = _buildSparklineSVG(_recentEndpointDurations(entry, 8), dur);
      el.dataset.method = method;
      el.classList.add('xr-api-entry');
      el.style.setProperty('--xr-heat', heat.toFixed(3));
      el.innerHTML = `
        <div class="xr-entry-pin ${isPinned ? 'xr-active' : ''}" title="${isPinned ? 'Unpin' : 'Pin'}">${isPinned ? '⭐' : '☆'}</div>
        <div class="xr-entry-content">
          <div class="xr-entry-row1">
            <span class="xr-method-badge ${mClass}">${method}</span>
            <span class="xr-status ${sClass}"><span class="xr-status-icon">${_statusGlyph(entry.status)}</span>${entry.status || '—'}</span>
            ${groupBadge}
            <span style="flex:1"></span>
            <span style="font-size:9.5px;color:var(--xr-muted);font-family:'JetBrains Mono',monospace">${formatDuration(entry.duration)}</span>
          </div>
          <div class="xr-entry-row2" title="${entry.url || ''}">${path}</div>
          <div class="xr-entry-row3">
            <span>${formatSize(entry.size)}</span>
            <span class="xr-sep"></span>
            <span>${formatTime(entry.timestamp || Date.now())}</span>
            <span class="xr-spark-wrap" title="${dur}ms">${sparkline}</span>
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
      const level = (entry.logLevel || 'log').toLowerCase();
      const preview = previewJSON(entry.logData, 64);
      el.style.setProperty('--xr-heat', '0');
      el.innerHTML = `
        <div class="xr-entry-pin ${isPinned ? 'xr-active' : ''}" title="${isPinned ? 'Unpin' : 'Pin'}">${isPinned ? '⭐' : '☆'}</div>
        <div class="xr-entry-content">
          <div class="xr-entry-row1">
            <span class="xr-method-badge xr-m-${level}">${level.toUpperCase()}</span>
            ${groupBadge}
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

    const groupBadgeEl = el.querySelector('.xr-group-badge');
    if (groupBadgeEl && groupKey) {
      groupBadgeEl.addEventListener('click', (e) => {
        e.stopPropagation();
        if (_state.expandedGroups.has(groupKey)) _state.expandedGroups.delete(groupKey);
        else _state.expandedGroups.add(groupKey);
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
        {
          label: isPinned ? '☆ Unpin' : '⭐ Pin', action: () => {
            if (_state.pinned.has(entry.id)) _state.pinned.delete(entry.id);
            else _state.pinned.add(entry.id);
            _savePinned();
            _rebuildList();
          }
        },
        {
          label: '🔗 Open in tab', action: () => {
            if (entry.url) window.open(entry.url, '_blank');
          }
        },
        {
          label: '🔄 Replay', action: () => {
            _replayRequest(entry);
          }
        },
        null, // separator
        {
          label: '📋 Copy & Export', action: () => {
            _openCopyModal(entry);
          }
        },
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
          dropdown.style.position = '';
          dropdown.style.left = '';
          dropdown.style.top = '';
        });
        dropdown.appendChild(btn);
      });

      menuBtn.appendChild(dropdown);

      const openDropdown = ({ fixedX = null, fixedY = null } = {}) => {
        _root?.querySelectorAll('.xr-entry-menu-dropdown.xr-open').forEach((openMenu) => {
          openMenu.classList.remove('xr-open');
          openMenu.style.position = '';
          openMenu.style.left = '';
          openMenu.style.top = '';
        });

        dropdown.style.position = '';
        dropdown.style.left = '';
        dropdown.style.top = '';
        dropdown.classList.add('xr-open');

        if (fixedX === null || fixedY === null) return;

        dropdown.style.position = 'fixed';
        dropdown.style.left = '0px';
        dropdown.style.top = '0px';

        const panelRect = _dom.panel?.getBoundingClientRect() || {
          left: 0,
          top: 0,
          right: window.innerWidth,
          bottom: window.innerHeight,
        };
        const menuRect = dropdown.getBoundingClientRect();
        const pad = 6;
        const maxX = Math.max(panelRect.left + pad, panelRect.right - menuRect.width - pad);
        const maxY = Math.max(panelRect.top + pad, panelRect.bottom - menuRect.height - pad);
        const x = Math.min(maxX, Math.max(panelRect.left + pad, fixedX));
        const y = Math.min(maxY, Math.max(panelRect.top + pad, fixedY));
        dropdown.style.left = `${x}px`;
        dropdown.style.top = `${y}px`;
      };

      menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (dropdown.classList.contains('xr-open')) {
          dropdown.classList.remove('xr-open');
          dropdown.style.position = '';
          dropdown.style.left = '';
          dropdown.style.top = '';
          return;
        }
        openDropdown();
      });

      el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        _selectEntry(entry.id);
        openDropdown({ fixedX: e.clientX, fixedY: e.clientY });
      });
    }

    el.addEventListener('click', () => _selectEntry(entry.id));
    return el;
  }

  function _rebuildList() {
    const pane = _dom.listPane;
    if (!pane) return;
    pane.innerHTML = '';

    const isApiTab = _state.activeTab === 'api';
    const filtered = _filteredEntries();

    // Calculate timeline bounds for waterfall visualization
    if (isApiTab && filtered.length > 0) {
      const timestamps = filtered.map(e => e.timestamp || 0);
      const durations = filtered.map(e => e.duration || 0);
      _state.timelineStart = Math.min(...timestamps);
      _state.timelineEnd = Math.max(...timestamps.map((t, i) => t + durations[i]));
    }

    // Build column header for API tab
    if (isApiTab) {
      pane.appendChild(_buildListHeader());
    }

    if (filtered.length === 0) {
      const icon = isApiTab ? '◈' : '◉';
      const title = `No ${isApiTab ? 'requests' : 'logs'} yet`;
      const desc = isApiTab
        ? 'Make a fetch/XHR call on the page and it will appear here.'
        : 'Use console.log() on the page or call jv(data) to inspect any object.';
      const hint = isApiTab
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

    // Render entries based on tab type
    if (isApiTab) {
      // Sort entries
      const sorted = _sortEntries(filtered);
      sorted.forEach(entry => {
        pane.appendChild(_renderApiRow(entry));
      });
    } else {
      // Logs tab - keep original grouping behavior
      const groups = [];
      const logGroups = new Map();
      filtered.forEach((entry) => {
        groups.push({ key: `log:${entry.id}`, entries: [entry] });
      });
      groups.forEach((group) => {
        const [head] = group.entries;
        pane.appendChild(_renderEntry(head, {}));
      });
    }
  }

  /* ──────────────────────────────────────────────────────────────────────────
     List Header with Sortable Columns
     ────────────────────────────────────────────────────────────────────────── */
  function _buildListHeader() {
    const header = document.createElement('div');
    header.className = 'xr-list-header';

    const columns = [
      { id: 'method', label: 'Method' },
      { id: 'status', label: 'Status' },
      { id: 'url', label: 'URL' },
      { id: 'time', label: 'Time' },
      { id: 'size', label: 'Size' },
      { id: 'waterfall', label: 'Waterfall' },
    ];

    columns.forEach(col => {
      const colEl = document.createElement('div');
      colEl.className = 'xr-list-header-col';
      if (_state.sort.field === col.id) {
        colEl.classList.add('xr-sorted', `xr-${_state.sort.order}`);
      }
      colEl.innerHTML = `
        <span>${col.label}</span>
        <span class="xr-sort-icon"></span>
      `;

      if (col.id !== 'waterfall') { // Waterfall is not sortable
        colEl.addEventListener('click', () => {
          if (_state.sort.field === col.id) {
            _state.sort.order = _state.sort.order === 'asc' ? 'desc' : 'asc';
          } else {
            _state.sort.field = col.id;
            _state.sort.order = col.id === 'timestamp' ? 'desc' : 'asc';
          }
          _rebuildList();
        });
      } else {
        colEl.style.cursor = 'default';
      }

      header.appendChild(colEl);
    });

    return header;
  }

  function _sortEntries(entries) {
    const { field, order } = _state.sort;
    const mult = order === 'asc' ? 1 : -1;

    return [...entries].sort((a, b) => {
      // Pinned always first
      const aPinned = _state.pinned.has(a.id);
      const bPinned = _state.pinned.has(b.id);
      if (aPinned !== bPinned) return aPinned ? -1 : 1;

      let cmp = 0;
      switch (field) {
        case 'method':
          cmp = (a.method || '').localeCompare(b.method || '');
          break;
        case 'status':
          cmp = (Number(a.status) || 0) - (Number(b.status) || 0);
          break;
        case 'url':
          cmp = (a.urlPath || a.url || '').localeCompare(b.urlPath || b.url || '');
          break;
        case 'time':
          cmp = (a.duration || 0) - (b.duration || 0);
          break;
        case 'size':
          cmp = (a.size || 0) - (b.size || 0);
          break;
        case 'timestamp':
        default:
          cmp = (a.timestamp || 0) - (b.timestamp || 0);
          break;
      }
      return cmp * mult;
    });
  }

  /* ──────────────────────────────────────────────────────────────────────────
     Render API Row (Premium macOS-inspired layout)
     Layout: [status-dot] [method-pill] [url-hero] [time] [size] [quick-actions]
     ────────────────────────────────────────────────────────────────────────── */
  function _renderApiRow(entry) {
    const { formatDuration, formatSize, shortPath } = window.XRAY_Utils;

    const row = document.createElement('div');
    row.className = 'xr-entry xr-api-row';
    row.dataset.id = entry.id;
    if (entry.id === _state.selectedId) row.classList.add('xr-selected');
    if (_state.pinned.has(entry.id)) row.classList.add('xr-pinned');

    const method = (entry.method || 'GET').toUpperCase();
    const status = entry.status || 0;
    const statusNum = Number(status) || 0;
    
    // Status class for colored dot
    const statusClass = statusNum >= 500 ? 'xr-s-5xx' :
      statusNum >= 400 ? 'xr-s-4xx' :
        statusNum >= 300 ? 'xr-s-3xx' :
          statusNum >= 200 ? 'xr-s-2xx' : 'xr-s-pending';
    
    // Method class for colored pill
    const methodClass = `xr-m-${method.toLowerCase()}`;

    const path = shortPath(entry.url || '');
    const duration = entry.duration || 0;
    const size = entry.size || 0;

    // Time color coding (fast < 100ms, medium < 500ms, slow >= 500ms)
    const timeClass = duration < 100 ? 'xr-time-fast' : 
                      duration < 500 ? 'xr-time-medium' : 'xr-time-slow';

    // N+1 detection badge
    const n1Warning = window.XRAY_NPlusOne?.getWarningForEntry?.(entry);
    let n1Html = '';
    if (n1Warning) {
      const severity = n1Warning.severity || 'info';
      n1Html = `<span class="xr-n1-badge xr-n1-${severity}">N+1: ${n1Warning.count}x</span>`;
    }

    // Build premium row HTML
    row.innerHTML = `
      <span class="xr-status-dot ${statusClass}" title="Status: ${statusNum || 'pending'}"></span>
      <span class="xr-method-pill ${methodClass}">${method}</span>
      <div class="xr-url-wrap">
        <span class="xr-url-path" title="${_escapeHtml(entry.url || '')}">${_escapeHtml(path)}${n1Html}</span>
      </div>
      <div class="xr-meta-wrap">
        <span class="xr-meta-time ${timeClass}">${formatDuration(duration)}</span>
        <span class="xr-meta-size">${formatSize(size)}</span>
      </div>
      <div class="xr-quick-actions">
        <button title="Copy URL" data-action="copy-url">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
        <button title="Replay request" data-action="replay">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
        </button>
        <button title="${_state.pinned.has(entry.id) ? 'Unpin' : 'Pin'}" data-action="pin">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="${_state.pinned.has(entry.id) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </button>
      </div>
    `;

    // Quick action handlers
    row.querySelector('[data-action="copy-url"]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(entry.url || '');
      _showToast('URL copied');
    });
    row.querySelector('[data-action="replay"]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      _replayRequest(entry);
    });
    row.querySelector('[data-action="pin"]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (_state.pinned.has(entry.id)) {
        _state.pinned.delete(entry.id);
        _showToast('Unpinned');
      } else {
        _state.pinned.add(entry.id);
        _showToast('Pinned');
      }
      _savePinned();
      _rebuildList();
    });

    row.addEventListener('click', () => _selectEntry(entry.id));
    row.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      _selectEntry(entry.id);
      _openCopyModal(entry);
    });

    return row;
  }

  // Simple HTML escaping
  function _escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;');
  }

  // Toast notification (micro-feedback)
  function _showToast(message, duration = 1500) {
    // Remove existing toast
    const existing = _root?.querySelector('.xr-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'xr-toast';
    toast.textContent = message;
    _root?.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('xr-toast-show');
    });

    setTimeout(() => {
      toast.classList.remove('xr-toast-show');
      setTimeout(() => toast.remove(), 200);
    }, duration);
  }

  // Keep waterfall for backwards compatibility (hidden by CSS)
  function _buildWaterfallBar(entry) {
    return ''; // Waterfall removed in premium layout
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Selection
  // ══════════════════════════════════════════════════════════════════════════
  function _selectEntry(id) {
    const changed = _state.selectedId !== id;
    _state.selectedId = id;
    if (changed) _state.treePath = '';
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
    const isApi = entry.type === 'api';
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
      { id: 'raw', label: 'Raw' },
      { id: 'diff', label: 'Diff' },
      { id: 'waterfall', label: 'Waterfall' },
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
    copyBtn.className = 'xr-copy-dropdown-btn';
    copyBtn.id = 'xr-copy-dropdown-btn';
    copyBtn.innerHTML = `<span>⎘</span><span>Copy ▾</span>`;

    const copyMenu = document.createElement('div');
    copyMenu.className = 'xr-copy-menu';
    copyMenu.id = 'xr-copy-menu';
    copyMenu.style.display = 'none';
    [
      { id: 'json', icon: '{ }', label: 'Copy JSON' },
      { id: 'curl', icon: '⌘', label: 'Copy as cURL' },
      { id: 'fetch', icon: '⚡', label: 'Copy as fetch()' },
      { id: 'axios', icon: '📦', label: 'Copy as axios' },
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
        <button class="xr-dtab ${_state.activeDTab === 'request' ? 'xr-active' : ''}" data-dtab="request">Request</button>
        <button class="xr-dtab ${_state.activeDTab === 'headers' ? 'xr-active' : ''}" data-dtab="headers">Headers</button>
      `;
      dtabs.querySelectorAll('.xr-dtab').forEach(btn => {
        btn.addEventListener('click', () => {
          _state.activeDTab = btn.dataset.dtab;
          _state.gridDrillRow = null;
          _state.treePath = '';
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

    _dom.paneSearchBar = psBar;
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

    // ── Tree breadcrumb ────────────────────────────────────────────────────
    const treeBreadcrumb = document.createElement('div');
    treeBreadcrumb.className = 'xr-tree-breadcrumb';
    pane.appendChild(treeBreadcrumb);
    _dom.treeBreadcrumb = treeBreadcrumb;

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
    if (_dom.treeBreadcrumb) {
      _dom.treeBreadcrumb.classList.remove('xr-open');
      _dom.treeBreadcrumb.innerHTML = '';
    }

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
        const rootPath = entry.type === 'log'
          ? 'logData'
          : (_state.activeDTab === 'request' ? 'requestBody' : 'response');
        let treeRoot = null;
        treeRoot = window.XRAY_Renderer.buildTree(parsed, {
          rootPath,
          onPathSelect: (path) => {
            _state.treePath = path;
            _renderTreeBreadcrumb(path, treeRoot);
          },
        });
        content.appendChild(treeRoot);
        _renderTreeBreadcrumb(_state.treePath || rootPath, treeRoot);
      } catch {
        content.appendChild(window.XRAY_Renderer.buildRaw(data));
      }

    } else if (_state.activeView === 'waterfall') {
      const apiEntries = _state.entries.filter((e) => e.type === 'api');
      if (window.XRAY_Waterfall?.buildWaterfall) {
        content.appendChild(window.XRAY_Waterfall.buildWaterfall(apiEntries, {
          selectedId: entry.id,
          onSelect: (id) => _selectEntry(id),
        }));
      } else {
        const msg = document.createElement('div');
        msg.className = 'xr-empty';
        msg.textContent = 'Waterfall renderer is not loaded';
        content.appendChild(msg);
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

    if (prev) {
      const info = document.createElement('div');
      info.className = 'xr-diff-auto-info';
      const deltaMs = Math.max(0, (entry.timestamp || 0) - (prev.timestamp || 0));
      const deltaSec = Math.round(deltaMs / 1000);
      const ago = deltaSec < 60
        ? `${Math.max(1, deltaSec)}s ago`
        : `${Math.max(1, Math.round(deltaSec / 60))}m ago`;
      info.textContent = _state.diffCompareId
        ? `Comparing with selected call · ${ago}`
        : `Comparing with previous call · ${ago}`;
      content.appendChild(info);
    }

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

  function _parsePathSegments(path) {
    return String(path || '').match(/[^.[\]]+|\[\d+\]/g) || [];
  }

  function _jumpToTreePath(path, treeRoot) {
    if (!treeRoot || !path) return;
    const lines = treeRoot.querySelectorAll('[data-xr-path]');
    let target = null;
    lines.forEach((line) => {
      if (line.getAttribute('data-xr-path') === path) target = line;
    });
    if (!target) return;
    treeRoot.querySelectorAll('.xr-tree-path-hit').forEach((line) => line.classList.remove('xr-tree-path-hit'));
    target.classList.add('xr-tree-path-hit');
    target.scrollIntoView({ block: 'center', behavior: 'smooth' });
    setTimeout(() => target.classList.remove('xr-tree-path-hit'), 1200);
  }

  function _renderTreeBreadcrumb(path, treeRoot) {
    const bar = _dom.treeBreadcrumb;
    if (!bar || !path || !treeRoot) return;
    const segments = _parsePathSegments(path);
    if (!segments.length) {
      bar.classList.remove('xr-open');
      bar.innerHTML = '';
      return;
    }

    bar.innerHTML = '';
    bar.classList.add('xr-open');

    let fullPath = '';
    segments.forEach((seg, idx) => {
      fullPath = idx === 0
        ? seg
        : (seg.startsWith('[') ? `${fullPath}${seg}` : `${fullPath}.${seg}`);
      const targetPath = fullPath;

      const btn = document.createElement('button');
      btn.className = 'xr-tree-crumb';
      btn.textContent = seg;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        _state.treePath = targetPath;
        _jumpToTreePath(targetPath, treeRoot);
      });
      bar.appendChild(btn);

      if (idx < segments.length - 1) {
        const sep = document.createElement('span');
        sep.className = 'xr-tree-crumb-sep';
        sep.textContent = '→';
        bar.appendChild(sep);
      }
    });
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

    // Use XRAY_Export module if available, fallback to built-in
    if (window.XRAY_Export) {
      if (as === 'curl') {
        text = window.XRAY_Export.toCurl(entry);
      } else if (as === 'fetch') {
        text = window.XRAY_Export.toFetch(entry);
      } else if (as === 'axios') {
        text = window.XRAY_Export.toAxios(entry);
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
    } else {
      // Fallback to built-in functions
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
    }

    navigator.clipboard.writeText(text || '').catch(() => { });

    const btn = _dom.detailPane?.querySelector('#xr-copy-dropdown-btn');
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
    function shellQuote(value) {
      return `'${String(value ?? '').replace(/'/g, `'\\''`)}'`;
    }

    const method = (entry.method || 'GET').toUpperCase();
    const url = entry.url || '';
    const headers = entry.requestHeaders || {};
    const body = entry.requestBody;

    let parts = [`curl -X ${method} ${shellQuote(url)}`];
    Object.entries(headers).forEach(([k, v]) => {
      parts.push(`  -H ${shellQuote(`${k}: ${v}`)}`);
    });
    if (body !== undefined && body !== null && body !== '') {
      const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
      parts.push(`  --data-raw ${shellQuote(bodyStr)}`);
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
          document.removeEventListener('mouseup', onUp, true);
          _saveState();
        };
        document.addEventListener('mousemove', onMove, true);
        document.addEventListener('mouseup', onUp, true);
      });
    }

    // ── Panel width resize (left edge) ──
    const panelEdge = _dom.panelResize;
    if (panelEdge) {
      panelEdge.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const startX = e.clientX;
        const startW = _state.panelWidth;
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
          document.removeEventListener('mouseup', onUp, true);
          _saveState();
        };
        document.addEventListener('mousemove', onMove, true);
        document.addEventListener('mouseup', onUp, true);
      });
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Fuzzy search — fzf-grade algorithm
  // ══════════════════════════════════════════════════════════════════════════
  let _fuzzyIdx = -1;

  // Scoring constants (tuned to match fzf v2 feel)
  const FZ = {
    MATCH: 16,
    CONSECUTIVE: 32,   // per consecutive char after first
    WORD_START: 48,   // char after / . - _ space
    CAMEL: 24,   // uppercase after lowercase
    STR_START: 72,   // very first char of string
    GAP_PENALTY: - 2,   // per skipped char between matches
    FIELD_METHOD: 1.4,  // multiplier when matching method token
    FIELD_STATUS: 1.3,  // multiplier when matching status
    FIELD_PATH: 1.1,  // multiplier for path segment vs full url
  };

  // Returns { score, positions } or null if no match
  function _fzScore(query, text) {
    if (!query) return { score: 1, positions: [] };
    const q = query.toLowerCase();
    const t = text.toLowerCase();
    const m = q.length;
    const n = t.length;

    // Quick reject — all query chars must appear in order
    let qi = 0;
    for (let i = 0; i < n && qi < m; i++) if (t[i] === q[qi]) qi++;
    if (qi < m) return null;

    // Per-position boundary bonus
    const bonus = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      const p = i > 0 ? text[i - 1] : '';
      if (i === 0) bonus[i] = FZ.STR_START;
      else if ('/._- ?&=#'.includes(p)) bonus[i] = FZ.WORD_START;
      else if (p === p.toLowerCase() && p !== p.toUpperCase() &&
        text[i] !== text[i].toLowerCase()) bonus[i] = FZ.CAMEL;
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
        { text: path, multiplier: FZ.FIELD_PATH },
        { text: full, multiplier: 1 },
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
      if (hi && !inMark) { out += '<mark>'; inMark = true; }
      if (!hi && inMark) { out += '</mark>'; inMark = false; }
      out += _escHtml(text[i]);
    }
    if (inMark) out += '</mark>';
    return out;
  }

  function _escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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

  /* ──────────────────────────────────────────────────────────────────────────
     Export Menu (uses XRAY_Export if available)
     ────────────────────────────────────────────────────────────────────────── */
  function _showExportMenu() {
    const entries = _getVisibleEntries();
    if (entries.length === 0) {
      alert('No entries to export');
      return;
    }

    const menu = document.createElement('div');
    menu.className = 'xr-export-menu';
    menu.innerHTML = `
      <div class="xr-export-menu-title">Export ${entries.length} entries</div>
      <button data-fmt="json">📄 JSON</button>
      <button data-fmt="csv">📊 CSV</button>
      <button data-fmt="har">🌐 HAR</button>
    `;
    menu.style.cssText = `
      position: fixed; z-index: 100000;
      background: var(--xr-surface); border: 1px solid var(--xr-border);
      border-radius: 6px; padding: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      display: flex; flex-direction: column; gap: 4px;
    `;
    const btnRect = _dom.exportBtn.getBoundingClientRect();
    menu.style.bottom = `${window.innerHeight - btnRect.top + 4}px`;
    menu.style.left = `${btnRect.left}px`;

    const styleTitle = `font-size:10px;color:var(--xr-muted);margin-bottom:4px;`;
    const styleBtn = `
      padding:6px 12px; text-align:left; border:none; background:transparent;
      color:var(--xr-text); border-radius:4px; cursor:pointer; font-size:11px;
    `;
    menu.querySelector('.xr-export-menu-title').style.cssText = styleTitle;
    menu.querySelectorAll('button').forEach(b => b.style.cssText = styleBtn);
    menu.querySelectorAll('button').forEach(b => {
      b.addEventListener('mouseenter', () => b.style.background = 'var(--xr-bg3)');
      b.addEventListener('mouseleave', () => b.style.background = 'transparent');
    });

    menu.addEventListener('click', (e) => {
      const fmt = e.target.dataset?.fmt;
      if (!fmt) return;
      menu.remove();
      _exportEntries(entries, fmt);
    });

    document.body.appendChild(menu);
    const closeMenu = (e) => {
      if (!menu.contains(e.target) && e.target !== _dom.exportBtn) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    };
    setTimeout(() => document.addEventListener('click', closeMenu), 10);
  }

  function _getVisibleEntries() {
    return _state.entries.filter(e =>
      _state.activeTab === 'all' ||
      e.type === (_state.activeTab === 'api' ? 'api' : 'log')
    );
  }

  function _exportEntries(entries, fmt) {
    const Export = window.XRAY_Export;
    if (Export) {
      if (fmt === 'json') Export.downloadJSON(entries, `xray-export-${Date.now()}.json`);
      else if (fmt === 'csv') Export.downloadCSV(entries, `xray-export-${Date.now()}.csv`);
      else if (fmt === 'har') Export.downloadHAR(entries, `xray-export-${Date.now()}.har`);
    } else {
      // Fallback: simple JSON download
      const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `xray-export-${Date.now()}.${fmt === 'csv' ? 'csv' : 'json'}`;
      a.click();
      URL.revokeObjectURL(url);
    }
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

  function _normalizeThemeId(themeId) {
    if (!themeId) return null;
    const aliases = {
      'catppuccin-mocha': 'mocha',
      'catppuccin-latte': 'latte',
    };
    return aliases[themeId] || themeId;
  }

  async function _loadState() {
    // Panel dimensions / open state
    const panelState = await window.XRAY_Store.get(STORE_KEY, {});
    if (typeof panelState.listWidth === 'number') {
      _state.listWidth = Math.min(300, Math.max(130, panelState.listWidth));
    }
    if (typeof panelState.panelWidth === 'number') {
      _state.panelWidth = Math.min(MAX_PANEL_W, Math.max(MIN_PANEL_W, panelState.panelWidth));
    }
    if (typeof panelState.open === 'boolean') {
      _state.open = panelState.open;
    }

    // Load theme
    const themeData = await window.XRAY_Store.get('theme', {});
    const panelTheme = _normalizeThemeId(themeData.value);
    if (panelTheme && window.XRAY_Themes[panelTheme]) {
      _state.theme = panelTheme;
    }

    // Load settings page preferences (xray_settings via XRAY_Store key "settings")
    const settingsData = await window.XRAY_Store.get('settings', {});
    const settingsTheme = _normalizeThemeId(settingsData.theme);
    if (settingsTheme && window.XRAY_Themes[settingsTheme]) {
      _state.theme = settingsTheme;
    }
    const parsedMaxEntries = Number.parseInt(settingsData.maxEntries, 10);
    if (Number.isFinite(parsedMaxEntries) && parsedMaxEntries > 0) {
      _state.maxEntries = parsedMaxEntries;
    }
    if (typeof settingsData.autoOpen === 'boolean') {
      _state.autoOpen = settingsData.autoOpen;
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
    window.XRAY_Store.get('settings', {}).then((settings) => {
      const existing = settings && typeof settings === 'object' ? settings : {};
      window.XRAY_Store.set('settings', { ...existing, theme: themeId });
    });
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

    format.onchange = () => _updateCopyPreview(entry, format.value);

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
      switch (format) {
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
    return _buildCurl(entry);
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

  // ══════════════════════════════════════════════════════════════════════════
  // Replay Request
  // ══════════════════════════════════════════════════════════════════════════

  async function _replayRequest(entry) {
    if (entry.type !== 'api' || !entry.url) {
      alert('Cannot replay: Not an API call');
      return;
    }

    try {
      const startedAt = Date.now();
      const startedPerf = performance.now();
      const headers = { ...entry.requestHeaders };
      delete headers['host'];
      delete headers['origin'];
      delete headers['referer'];

      const fetchOpts = {
        method: entry.method || 'GET',
        headers,
        mode: 'cors',
        credentials: 'include',
      };

      if (entry.requestBody && (entry.method === 'POST' || entry.method === 'PUT' || entry.method === 'PATCH')) {
        fetchOpts.body = typeof entry.requestBody === 'string' ? entry.requestBody : JSON.stringify(entry.requestBody);
      }

      const response = await fetch(entry.url, fetchOpts);
      const contentType = response.headers.get('content-type');
      const raw = await response.text();
      const duration = Math.max(0, Math.round(performance.now() - startedPerf));
      let parsed = null;
      if (contentType && contentType.includes('application/json')) {
        try { parsed = JSON.parse(raw); } catch { }
      }
      const size = new TextEncoder().encode(raw || '').length;

      const replayEntry = {
        id: window.XRAY_Utils.uid(),
        type: 'api',
        source: 'fetch',
        timestamp: startedAt,
        method: entry.method,
        url: entry.url,
        urlPath: entry.urlPath,
        status: response.status,
        duration,
        size,
        requestHeaders: headers,
        requestBody: entry.requestBody,
        responseHeaders: Object.fromEntries(response.headers),
        responseRaw: raw,
        responseDecrypted: parsed,
        decryptStatus: 'none',
        pinned: false,
      };

      _public.add(replayEntry);
      _selectEntry(replayEntry.id);
    } catch (err) {
      alert(`Replay failed: ${err.message}`);
      console.error('Replay error:', err);
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Insights Pane
  // ══════════════════════════════════════════════════════════════════════════

  let _insightsInitialized = false;

  function _toggleInsightsPane(show) {
    if (!_dom.insightsPane) return;

    _dom.insightsPane.classList.toggle('xr-active', show);

    if (show) {
      _renderInsights();
    }
  }

  function _renderInsights() {
    const Insights = window.XRAY_Insights;
    const entries = _state.entries;

    if (Insights && entries.length > 0) {
      // Use XRAY_Insights module
      if (!_insightsInitialized) {
        Insights.init(_dom.insightsPane);
        _insightsInitialized = true;
      }
      Insights.update(entries);
    } else if (entries.length === 0) {
      _dom.insightsPane.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;gap:12px;color:var(--xr-muted);">
          <div style="font-size:32px;opacity:0.4;">📊</div>
          <div style="font-size:13px;">No data to analyze</div>
          <div style="font-size:11px;opacity:0.7;">Capture some API requests or logs to see insights</div>
        </div>
      `;
    } else {
      // Fallback without XRAY_Insights: show basic stats
      _renderBasicInsights(entries);
    }
  }

  function _renderBasicInsights(entries) {
    const apis = entries.filter(e => e.type === 'api');
    const logs = entries.filter(e => e.type === 'log');
    const errors = apis.filter(e => String(e.status || '').match(/^[45]/));
    const avgTime = apis.length > 0
      ? (apis.reduce((s, e) => s + (e.duration || 0), 0) / apis.length).toFixed(0)
      : 0;

    const statusCounts = {};
    apis.forEach(e => {
      const code = String(e.status || 'unknown');
      statusCounts[code] = (statusCounts[code] || 0) + 1;
    });

    const topEndpoints = {};
    apis.forEach(e => {
      try {
        const url = new URL(e.url);
        const path = url.pathname;
        topEndpoints[path] = (topEndpoints[path] || 0) + 1;
      } catch { }
    });
    const sortedEndpoints = Object.entries(topEndpoints)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    _dom.insightsPane.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:20px;">
        <div style="background:var(--xr-surface);border-radius:8px;padding:16px;text-align:center;">
          <div style="font-size:24px;font-weight:700;color:var(--xr-info);">${apis.length}</div>
          <div style="font-size:11px;color:var(--xr-muted);margin-top:4px;">API Requests</div>
        </div>
        <div style="background:var(--xr-surface);border-radius:8px;padding:16px;text-align:center;">
          <div style="font-size:24px;font-weight:700;color:var(--xr-success);">${logs.length}</div>
          <div style="font-size:11px;color:var(--xr-muted);margin-top:4px;">Console Logs</div>
        </div>
        <div style="background:var(--xr-surface);border-radius:8px;padding:16px;text-align:center;">
          <div style="font-size:24px;font-weight:700;color:var(--xr-error);">${errors.length}</div>
          <div style="font-size:11px;color:var(--xr-muted);margin-top:4px;">Errors</div>
        </div>
        <div style="background:var(--xr-surface);border-radius:8px;padding:16px;text-align:center;">
          <div style="font-size:24px;font-weight:700;color:var(--xr-warning);">${avgTime}ms</div>
          <div style="font-size:11px;color:var(--xr-muted);margin-top:4px;">Avg Response</div>
        </div>
      </div>
      
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div style="background:var(--xr-surface);border-radius:8px;padding:16px;">
          <div style="font-size:12px;font-weight:600;color:var(--xr-text);margin-bottom:12px;">Status Distribution</div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            ${Object.entries(statusCounts).map(([code, count]) => `
              <div style="display:flex;justify-content:space-between;font-size:11px;">
                <span style="color:${code.startsWith('2') ? 'var(--xr-success)' : code.startsWith('4') || code.startsWith('5') ? 'var(--xr-error)' : 'var(--xr-warning)'};">${code}</span>
                <span style="color:var(--xr-muted);">${count}</span>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div style="background:var(--xr-surface);border-radius:8px;padding:16px;">
          <div style="font-size:12px;font-weight:600;color:var(--xr-text);margin-bottom:12px;">Top Endpoints</div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            ${sortedEndpoints.map(([path, count]) => `
              <div style="display:flex;justify-content:space-between;font-size:10px;gap:8px;">
                <span style="color:var(--xr-subtext);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${path}">${path}</span>
                <span style="color:var(--xr-muted);flex-shrink:0;">${count}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Settings Modal
  // ══════════════════════════════════════════════════════════════════════════

  function _exportAllEntries() {
    const payload = JSON.stringify(_state.entries, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xray-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function _openSettingsModal() {
    const backdrop = _dom.settingsBackdrop;
    if (!backdrop) return;

    _updateSettingsStats();
    _updateSettingsFilters();
    _dom.settingsTheme.value = _state.theme;

    backdrop.classList.add('xr-open');
  }

  function _updateSettingsFilters() {
    // Update status filter checkboxes
    const statusContainer = _root.querySelector('#xr-settings-status-filters');
    if (statusContainer) {
      statusContainer.querySelectorAll('input[data-status]').forEach(input => {
        const status = input.dataset.status;
        input.checked = _state.filters.statusCodes.includes(status);
      });
    }
    // Update type filter checkboxes
    const typeContainer = _root.querySelector('#xr-settings-type-filters');
    if (typeContainer) {
      typeContainer.querySelectorAll('input[data-type]').forEach(input => {
        const type = input.dataset.type;
        input.checked = _state.filters.types.includes(type);
      });
    }
  }

  function _bindSettingsFilters() {
    // ── HUD Settings (dock, opacity, blur) ─────────────────────────────────
    const dockSelect = _root.querySelector('#xr-settings-dock');
    const opacityRange = _root.querySelector('#xr-settings-opacity');
    const opacityVal = _root.querySelector('#xr-settings-opacity-val');
    const blurCheck = _root.querySelector('#xr-settings-blur');
    
    if (dockSelect && window.XRAY_HUD) {
      dockSelect.value = window.XRAY_HUD.getDockMode();
      dockSelect.addEventListener('change', () => {
        window.XRAY_HUD.setDockMode(dockSelect.value);
      });
    }
    
    if (opacityRange && window.XRAY_HUD) {
      const initialOpacity = Math.round(window.XRAY_HUD.getOpacity() * 100);
      opacityRange.value = initialOpacity;
      if (opacityVal) opacityVal.textContent = `${initialOpacity}%`;
      
      opacityRange.addEventListener('input', () => {
        const val = parseInt(opacityRange.value, 10);
        if (opacityVal) opacityVal.textContent = `${val}%`;
        window.XRAY_HUD.setOpacity(val / 100);
      });
    }
    
    if (blurCheck && window.XRAY_HUD) {
      blurCheck.checked = window.XRAY_HUD.getBlur();
      blurCheck.addEventListener('change', () => {
        window.XRAY_HUD.setBlur(blurCheck.checked);
      });
    }
    
    // ── Status filter change handlers ──────────────────────────────────────
    const statusContainer = _root.querySelector('#xr-settings-status-filters');
    if (statusContainer) {
      statusContainer.querySelectorAll('input[data-status]').forEach(input => {
        input.addEventListener('change', () => {
          const status = input.dataset.status;
          if (input.checked) {
            if (!_state.filters.statusCodes.includes(status)) {
              _state.filters.statusCodes.push(status);
            }
          } else {
            _state.filters.statusCodes = _state.filters.statusCodes.filter(s => s !== status);
          }
          _saveFilters();
          _rebuildList();
          _updateCounts();
        });
      });
    }
    // ── Type filter change handlers ────────────────────────────────────────
    const typeContainer = _root.querySelector('#xr-settings-type-filters');
    if (typeContainer) {
      typeContainer.querySelectorAll('input[data-type]').forEach(input => {
        input.addEventListener('change', () => {
          const type = input.dataset.type;
          if (input.checked) {
            if (!_state.filters.types.includes(type)) {
              _state.filters.types.push(type);
            }
          } else {
            _state.filters.types = _state.filters.types.filter(t => t !== type);
          }
          _saveFilters();
          _rebuildList();
          _updateCounts();
        });
      });
    }
  }

  function _updateSettingsStats() {
    const allEntries = _state.entries;
    const apiEntries = allEntries.filter(e => e.type === 'api');
    const logEntries = allEntries.filter(e => e.type === 'log');
    const errors = allEntries.filter(e => {
      const code = String(e.status || '');
      return code.startsWith('4') || code.startsWith('5');
    });

    if (_dom.statApi) _dom.statApi.textContent = apiEntries.length;
    if (_dom.statLogs) _dom.statLogs.textContent = logEntries.length;
    if (_dom.statPinned) _dom.statPinned.textContent = _state.pinned.size;
    if (_dom.statErrors) _dom.statErrors.textContent = errors.length;
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
        const eType = e.type === 'api' ? (e.source || 'fetch') : 'log';
        if (!_state.filters.types.includes(eType)) return false;
      }
      return true;
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // HUD Dock Mode Adjustment
  // ══════════════════════════════════════════════════════════════════════════
  function _adjustForDockMode(mode) {
    if (!_dom.panel) return;
    
    // In bottom dock mode, we might want to adjust layouts
    // For now, just ensure the list/detail split works
    if (mode === 'bottom') {
      // Bottom dock has full width but limited height
      // Could adjust flex ratios, hide certain elements, etc.
      _dom.panel.classList.add('xr-dock-bottom');
      _dom.panel.classList.remove('xr-dock-right');
    } else {
      _dom.panel.classList.add('xr-dock-right');
      _dom.panel.classList.remove('xr-dock-bottom');
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Event binding
  // ══════════════════════════════════════════════════════════════════════════
  function _bindEvents() {
    _dom.closeBtn.addEventListener('click', () => _public.hide());

    _dom.settingsBtn.addEventListener('click', () => _openSettingsModal());
    _dom.settingsClose.addEventListener('click', () => {
      _dom.settingsBackdrop.classList.remove('xr-open');
    });
    _dom.settingsBackdrop.addEventListener('click', (e) => {
      if (e.target === _dom.settingsBackdrop) _dom.settingsBackdrop.classList.remove('xr-open');
    });
    _dom.settingsTheme.addEventListener('change', (e) => {
      _state.theme = e.target.value;
      _applyTheme(_state.theme);
      _saveTheme(_state.theme);
    });
    _dom.settingsClrPins.addEventListener('click', () => {
      _state.pinned.clear();
      _savePinned();
      _rebuildList();
      _updateSettingsStats();
      _updateCounts();
    });
    _dom.settingsClrAll.addEventListener('click', () => {
      if (!confirm('Delete all entries? This cannot be undone.')) return;
      _state.entries = [];
      _state.selectedId = null;
      _state.treePath = '';
      _state.expandedGroups.clear();
      _state.pinned.clear();
      _savePinned();
      _rebuildList();
      _renderDetail(null);
      _updateCounts();
      _updateSettingsStats();
    });
    _dom.settingsExport?.addEventListener('click', () => _exportAllEntries());

    _root.querySelectorAll('.xr-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        _state.activeTab = btn.dataset.tab;
        _root.querySelectorAll('.xr-tab').forEach(b =>
          b.classList.toggle('xr-active', b.dataset.tab === _state.activeTab)
        );

        const isConsole = _state.activeTab === 'console';
        const isInsights = _state.activeTab === 'insights';

        // Hide/show main panes
        if (_dom.listWrap) _dom.listWrap.style.display = (isConsole || isInsights) ? 'none' : '';
        if (_dom.dragHandle) _dom.dragHandle.style.display = (isConsole || isInsights) ? 'none' : '';
        if (_dom.detailPane) _dom.detailPane.style.display = (isConsole || isInsights) ? 'none' : '';
        if (_dom.consolePane) _dom.consolePane.classList.toggle('xr-active', isConsole);

        // Show/hide insights pane
        _toggleInsightsPane(isInsights);

        if (window.XRAY_ConsoleUI) window.XRAY_ConsoleUI.handleTabSwitch(isConsole);

        if (!isConsole && !isInsights) {
          _state.selectedId = null;
          _rebuildList();
          _renderDetail(null);
          _updateCounts();
        }
      });
    });

    _dom.clearBtn.addEventListener('click', () => {
      _state.entries = [];
      _state.selectedId = null;
      _state.treePath = '';
      _state.expandedGroups.clear();
      _state.pinned.clear();
      _rebuildList();
      _renderDetail(null);
      _updateCounts();
    });

    // Export button click - show export menu
    if (_dom.exportBtn) {
      _dom.exportBtn.addEventListener('click', _showExportMenu);
    }

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
  let _hudMode = false;  // Track if embedded in HUD shell

  const _public = {

    async init(options = {}) {
      await _loadState();
      const opts = options || {};
      const useShadow = opts.useShadow !== false;
      const mountEl = opts.mountEl && typeof opts.mountEl.appendChild === 'function'
        ? opts.mountEl
        : null;
      _isDevtoolsMode = !!opts.devtoolsMode;
      _hudMode = !!opts.hudMode;

      // ── HUD Mode: Embed into XRAY_HUD shell ──────────────────────────────
      if (!_isDevtoolsMode && window.XRAY_HUD && !opts.legacyMode) {
        _hudMode = true;
        
        // Initialize HUD shell
        window.XRAY_HUD.init({ autoOpen: _state.open });
        
        // Get HUD's shadow root and content slot
        const hudRoot = window.XRAY_HUD.getShadowRoot();
        const hudContent = window.XRAY_HUD.getContentSlot();
        
        if (hudRoot && hudContent) {
          _host = hudContent;
          _root = hudContent; // Content is inside HUD's shadow DOM
          
          // Inject styles into HUD shadow root
          const style = document.createElement('style');
          style.textContent = _buildCSS();
          hudRoot.insertBefore(style, hudRoot.firstChild);
          
          // Build and mount panel
          const panel = _buildHTML();
          panel.classList.add('xr-hud-embed');
          _host.appendChild(panel);
          
          // Wire HUD events
          window.XRAY_HUD.on('xray-show', () => {
            _state.open = true;
            _saveState();
          });
          window.XRAY_HUD.on('xray-hide', () => {
            _state.open = false;
            _saveState();
          });
          window.XRAY_HUD.on('xray-dock-change', (e) => {
            // Adjust layout for dock mode if needed
            _adjustForDockMode(e.detail.mode);
          });
        }
      }
      // ── DevTools or Mount Element Mode ───────────────────────────────────
      else if (mountEl && !useShadow) {
        _host = mountEl;
        if (opts.clearMount !== false) _host.innerHTML = '';
        _root = _host;
        
        const style = document.createElement('style');
        style.textContent = _buildCSS();
        _root.appendChild(style);
        
        const panel = _buildHTML();
        _root.appendChild(panel);
      }
      // ── Standalone Mode (Legacy) ─────────────────────────────────────────
      else {
        let host = document.getElementById(HOST_ID);
        if (!host) {
          host = document.createElement('div');
          host.id = HOST_ID;
          document.documentElement.appendChild(host);
        }
        _host = host;
        _root = host.attachShadow({ mode: 'open' });
        
        const style = document.createElement('style');
        style.textContent = _buildCSS();
        _root.appendChild(style);
        
        const panel = _buildHTML();
        panel.classList.add('xr-standalone');
        _root.appendChild(panel);
      }

      // ── Load fonts ─────────────────────────────────────────────────────────
      const fontTarget = _hudMode 
        ? (window.XRAY_HUD.getShadowRoot() || document.head)
        : (useShadow ? _root : (document.head || _root));
      if (!fontTarget.querySelector('link[data-xr-font="jetbrains-mono"]')) {
        const fontLink = document.createElement('link');
        fontLink.rel = 'stylesheet';
        fontLink.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&display=swap';
        fontLink.setAttribute('data-xr-font', 'jetbrains-mono');
        fontTarget.appendChild(fontLink);
      }

      // ── Collect DOM refs ───────────────────────────────────────────────────
      const getById = (id) => (_root.getElementById
        ? _root.getElementById(id)
        : _root.querySelector(`#${id}`));

      _dom.panel = getById('xr-panel');
      _dom.panelResize = getById('xr-panel-resize');
      _dom.dots = getById('xr-dots');
      _dom.settingsBtn = getById('xr-settings-btn');
      _dom.closeBtn = getById('xr-close');
      _dom.listWrap = _root.querySelector('.xr-list-wrap');
      _dom.listPane = getById('xr-list-pane');
      _dom.dragHandle = getById('xr-drag-handle');
      _dom.detailPane = getById('xr-detail-pane');
      _dom.consolePane = getById('xr-console-pane');
      _dom.insightsPane = getById('xr-insights-pane');
      _dom.footerCount = getById('xr-count');
      _dom.apiCount = getById('xr-api-count');
      _dom.logCount = getById('xr-log-count');
      _dom.headerSummary = getById('xr-header-summary');
      _dom.clearBtn = getById('xr-clear');
      _dom.exportBtn = getById('xr-export-btn');
      _dom.fuzzyBackdrop = getById('xr-fuzzy-backdrop');
      _dom.fuzzyInput = getById('xr-fuzzy-input');
      _dom.fuzzyResults = getById('xr-fuzzy-results');
      _dom.copyBackdrop = getById('xr-copy-backdrop');
      _dom.copyTitle = getById('xr-copy-title');
      _dom.copyFormat = getById('xr-copy-format');
      _dom.copyCode = getById('xr-copy-code');
      _dom.copyBtn = getById('xr-copy-btn');
      _dom.copyCancel = getById('xr-copy-cancel');
      _dom.copyClose = getById('xr-copy-close');

      _dom.settingsBackdrop = getById('xr-settings-backdrop');
      _dom.settingsTheme = getById('xr-settings-theme');
      _dom.settingsClose = getById('xr-settings-close');
      _dom.settingsExport = getById('xr-settings-export-all');
      _dom.settingsClrPins = getById('xr-settings-clear-pins');
      _dom.settingsClrAll = getById('xr-settings-clear-all');
      _dom.statApi = getById('xr-stat-api');
      _dom.statLogs = getById('xr-stat-logs');
      _dom.statPinned = getById('xr-stat-pinned');
      _dom.statErrors = getById('xr-stat-errors');

      // ── Apply state ────────────────────────────────────────────────────────
      _dom.listPane.style.width = `${_state.listWidth}px`;
      if (_isDevtoolsMode) {
        _state.open = true;
        _dom.panel.classList.add('xr-devtools', 'xr-open');
        _dom.panel.style.width = '100%';
      } else if (!_hudMode) {
        // Standalone mode
        _dom.panel.style.width = `${_state.panelWidth}px`;
      }
      _buildDots();
      _applyTheme(_state.theme);

      // ── Initial render ─────────────────────────────────────────────────────
      _rebuildList();
      _renderDetail(null);
      _updateCounts();

      // ── Events + shortcuts ─────────────────────────────────────────────────
      _bindEvents();
      _bindSettingsFilters();
      
      // In HUD mode, shortcuts are handled by HUD
      if (!_hudMode && window.XRAY_Shortcuts?.init) {
        window.XRAY_Shortcuts.init(_public);
      }
      
      if (window.XRAY_Console?.init) window.XRAY_Console.init();
      if (window.XRAY_ConsoleUI?.init) window.XRAY_ConsoleUI.init(_root);

      // ── Initialize Command Palette (⌘K) ────────────────────────────────────
      if (window.XRAY_CommandPalette?.init) {
        const paletteRoot = _hudMode ? window.XRAY_HUD?.getShadowRoot() : _root;
        if (paletteRoot) {
          window.XRAY_CommandPalette.init(paletteRoot, _public);
        }
      }

      // ── Initialize Web Worker ──────────────────────────────────────────────
      if (window.XRAY_Worker?.init) {
        window.XRAY_Worker.init().catch(() => {
          // Worker failed to initialize, continue without it
        });
      }

      // ── Restore open state (standalone only) ───────────────────────────────
      if (!_isDevtoolsMode && !_hudMode && _state.open) {
        _dom.panel.classList.add('xr-open');
      }
    },

    show() {
      if (!_dom.panel) return;
      _state.open = true;
      
      if (_hudMode && window.XRAY_HUD) {
        window.XRAY_HUD.show();
      } else {
        _dom.panel.classList.add('xr-open');
      }
      
      if (!_isDevtoolsMode) _saveState();
    },

    hide() {
      if (!_dom.panel) return;
      if (_isDevtoolsMode) return;
      _state.open = false;
      
      if (_hudMode && window.XRAY_HUD) {
        window.XRAY_HUD.hide();
      } else {
        _dom.panel.classList.remove('xr-open');
      }
      
      _saveState();
    },

    toggle() {
      if (_isDevtoolsMode) return;
      
      if (_hudMode && window.XRAY_HUD) {
        window.XRAY_HUD.toggle();
        _state.open = window.XRAY_HUD.isOpen();
      } else {
        _state.open ? _public.hide() : _public.show();
      }
    },

    isOpen() { 
      if (_hudMode && window.XRAY_HUD) {
        return window.XRAY_HUD.isOpen();
      }
      return _state.open; 
    },

    add(entry) {
      if (!entry) return;
      if (!entry.id) entry.id = window.XRAY_Utils.uid();
      _state.entries.push(entry);

      // Track for N+1 detection
      if (window.XRAY_NPlusOne?.trackEntry) {
        window.XRAY_NPlusOne.trackEntry(entry);
      }

      const maxEntries = Math.max(1, Number.parseInt(_state.maxEntries, 10) || 500);
      let listTrimmed = false;
      let selectedWasTrimmed = false;
      let pinnedChanged = false;
      if (_state.entries.length > maxEntries) {
        const overflow = _state.entries.length - maxEntries;
        const removed = _state.entries.splice(0, overflow);
        listTrimmed = true;
        removed.forEach((oldEntry) => {
          if (oldEntry.id === _state.selectedId) selectedWasTrimmed = true;
          if (_state.pinned.delete(oldEntry.id)) pinnedChanged = true;
        });
      }
      if (pinnedChanged) _savePinned();
      if (selectedWasTrimmed) {
        _state.selectedId = null;
        _renderDetail(null);
      }

      // Flash the live capture dot
      const dot = _root?.getElementById('xr-capture-dot');
      if (dot) {
        dot.classList.add('xr-live');
        clearTimeout(dot._fadeTimer);
        dot._fadeTimer = setTimeout(() => dot.classList.remove('xr-live'), 2200);
      }

      _rebuildList();
      if (!listTrimmed && _entryMatchesCurrentTab(entry) && _entryMatchesFilter(entry)) {
        const rows = _dom.listPane?.querySelectorAll('.xr-entry') || [];
        rows.forEach((row) => {
          if (row.dataset.id === entry.id) row.classList.add('xr-entry-new');
        });
      }
      _updateCounts();
      if (_state.autoOpen && !_state.open) _public.show();
    },

    setView(v) {
      const views = ['tree', 'grid', 'raw', 'diff', 'waterfall'];
      if (!views.includes(v)) return;
      if (!_state.selectedId && v === 'waterfall') {
        const latestApi = _state.entries.slice().reverse().find((e) => e.type === 'api');
        if (latestApi) _selectEntry(latestApi.id);
      }
      _state.activeView = v;
      _state.gridDrillRow = null;
      _dom.viewToggle?.querySelectorAll('.xr-toggle-btn').forEach(btn =>
        btn.classList.toggle('xr-active', btn.dataset.view === v)
      );
      _renderContent();
    },

    focusSearch() { _fuzzyOpen(); },

    hasSelection() { return !!_state.selectedId; },
    paneSearchFocus() { _paneSearchOpen(); },

    copySelected() { _copySelected(); },

    pinSelected() {
      if (!_state.selectedId) return;
      const entry = _state.entries.find(e => e.id === _state.selectedId);
      if (!entry) return;
      if (_state.pinned.has(entry.id)) {
        _state.pinned.delete(entry.id);
      } else {
        _state.pinned.add(entry.id);
      }
      _savePinned();
      _rebuildList();
    },

    expandAll(expand) {
      const treeRoot = _dom.content?.querySelector('.xr-tree-root');
      if (treeRoot) window.XRAY_Renderer.expandAll(treeRoot, expand);
    },

    selectNext(dir) {
      const filtered = _filteredEntries();
      if (!filtered.length) return;
      const idx = filtered.findIndex(e => e.id === _state.selectedId);
      let next = idx === -1
        ? (dir > 0 ? 0 : filtered.length - 1)
        : (idx + dir + filtered.length) % filtered.length;
      const target = filtered[next];
      _selectEntry(target.id);
      _dom.listPane?.querySelector(`[data-id="${target.id}"]`)?.scrollIntoView({ block: 'nearest' });
    },

    // Console API
    getEntries() {
      return [..._state.entries];
    },

    getSelectedId() {
      return _state.selectedId;
    },

    getEntry(id) {
      return _state.entries.find(e => e.id === id) || null;
    },

    getSelectedEntry() {
      return _state.selectedId 
        ? _state.entries.find(e => e.id === _state.selectedId) 
        : null;
    },

  };

  return _public;
})();
