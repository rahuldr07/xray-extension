// panel/command-palette-v2.js — Premium Two-Column Command Palette
// Unified settings + commands in Raycast/Linear style
window.XRAY_CommandPalette = (() => {
  'use strict';

  // ══════════════════════════════════════════════════════════════════════════
  // State
  // ══════════════════════════════════════════════════════════════════════════
  let _root = null;        // Command palette's own shadow root
  let _panelRoot = null;   // Panel's shadow root (for querying panel elements)
  let _panelRef = null;    // Panel public API reference
  let _container = null;
  let _input = null;
  let _leftCol = null;
  let _rightCol = null;
  let _isOpen = false;
  let _query = '';
  let _selGroup = 'appearance';
  let _selIdx = 0;

  // Settings state (synced with panel)
  const _settings = {
    theme: 'zinc',
    dock: 'right',
    opacity: 92,
    blur: true,
    filters: { s2: false, s3: false, s4: false, s5: false },
    activeView: 'tree',
    activeTab: 'api',
  };

  // ══════════════════════════════════════════════════════════════════════════
  // Data
  // ══════════════════════════════════════════════════════════════════════════
  const THEMES = [
    { id: 'zinc', dot: '#71717a', name: 'Zinc', desc: 'Default dark' },
    { id: 'mocha', dot: '#cba6f7', name: 'Mocha', desc: 'Catppuccin dark' },
    { id: 'latte', dot: '#dc8a78', name: 'Latte', desc: 'Light mode' },
    { id: 'dracula', dot: '#bd93f9', name: 'Dracula', desc: 'Classic dark' },
    { id: 'nord', dot: '#88c0d0', name: 'Nord', desc: 'Arctic dark' },
  ];

  const VIEWS = [
    { id: 'tree', label: 'Tree', key: 'T', icon: '<path d="M3 4h2M3 8h2M3 12h2M5 4h8M5 8h6M5 12h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>' },
    { id: 'grid', label: 'Grid', key: 'G', icon: '<rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.2"/><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.2"/><rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.2"/><rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.2"/>' },
    { id: 'raw', label: 'Raw', key: 'R', icon: '<path d="M5 5L2 8l3 3M11 5l3 3-3 3M8 3l-2 10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>' },
    { id: 'diff', label: 'Diff', key: 'D', icon: '<path d="M2 5h5M2 8h5M2 11h3M9 5h5M9 8h5M9 11h5M7.5 2v12" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>' },
    { id: 'waterfall', label: 'Waterfall', key: 'W', icon: '<path d="M2 4h4M6 8h5M11 12h3M2 4v4M6 8v4M11 12v2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>' },
  ];

  const TABS = [
    { id: 'api', label: 'API', key: '⌘1', icon: '<path d="M2 4h3v8H2zM6 8h3v4H6zM10 2h4v10h-4z" stroke="currentColor" stroke-width="1.2"/>' },
    { id: 'logs', label: 'Logs', key: '⌘2', icon: '<path d="M3 4h10M3 7h10M3 10h6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>' },
    { id: 'console', label: 'Console', key: '⌘3', icon: '<path d="M3 5l4 3-4 3M9 11h4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>' },
    { id: 'insights', label: 'Insights', key: '⌘4', icon: '<path d="M2 12l3-4 3 2 3-5 3 3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>' },
  ];

  const EXPORTS = [
    { id: 'curl', label: 'Copy as cURL', desc: 'Shell command with headers', color: '#22c55e' },
    { id: 'fetch', label: 'Copy as fetch()', desc: 'JavaScript fetch snippet', color: '#3b82f6' },
    { id: 'axios', label: 'Copy as axios', desc: 'Axios request snippet', color: '#a855f7' },
    { id: 'json', label: 'Export JSON', desc: 'All captured entries', color: '#f59e0b' },
    { id: 'har', label: 'Export HAR', desc: 'HTTP Archive format', color: '#6b7280' },
  ];

  const GROUPS = [
    { id: 'navigation', label: 'Navigation', icon: '<path d="M8 3l5 5-5 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>' },
    { id: 'appearance', label: 'Appearance', icon: '<circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.3"/>' },
    { id: 'views', label: 'Views', icon: '<rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.2"/><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.2"/><rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.2"/><rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.2"/>' },
    { id: 'filters', label: 'Filters', icon: '<path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>' },
    { id: 'export', label: 'Export', icon: '<path d="M8 2v8M5 7l3 3 3-3M3 12h10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>' },
    { id: 'danger', label: 'Danger', icon: '<path d="M8 3L14 13H2L8 3Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>' },
  ];

  // All searchable commands for fuzzy search
  const ALL_COMMANDS = () => [
    ...TABS.map(t => ({ action: `tab:${t.id}`, label: `Go to ${t.label} tab`, desc: 'Navigation', icon: t.icon })),
    ...VIEWS.map(v => ({ action: `view:${v.id}`, label: `${v.label} view`, desc: 'Switch response view', icon: v.icon, key: v.key })),
    ...THEMES.map(t => ({ action: `theme:${t.id}`, label: `Theme: ${t.name}`, desc: t.desc, icon: `<circle cx="8" cy="8" r="5.5" stroke="${t.dot}" stroke-width="1.5"/>` })),
    { action: 'blur', label: 'Toggle blur effect', desc: 'Glassmorphism panel', icon: '<circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.2" stroke-dasharray="2.5 2"/>' },
    { action: 'filter:s2', label: 'Filter: 2xx success', desc: 'Show success responses', icon: '<circle cx="8" cy="8" r="5.5" fill="rgba(34,197,94,0.2)" stroke="#22c55e" stroke-width="1.2"/>' },
    { action: 'filter:s3', label: 'Filter: 3xx redirect', desc: 'Show redirects', icon: '<circle cx="8" cy="8" r="5.5" fill="rgba(59,130,246,0.2)" stroke="#3b82f6" stroke-width="1.2"/>' },
    { action: 'filter:s4', label: 'Filter: 4xx errors', desc: 'Show client errors', icon: '<circle cx="8" cy="8" r="5.5" fill="rgba(245,158,11,0.2)" stroke="#f59e0b" stroke-width="1.2"/>' },
    { action: 'filter:s5', label: 'Filter: 5xx errors', desc: 'Show server errors', icon: '<circle cx="8" cy="8" r="5.5" fill="rgba(239,68,68,0.2)" stroke="#ef4444" stroke-width="1.2"/>' },
    { action: 'clear-filters', label: 'Clear all filters', desc: 'Reset to show all', icon: '<path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>' },
    ...EXPORTS.map(e => ({ action: `export:${e.id}`, label: e.label, desc: e.desc, icon: '<path d="M8 2v8M5 7l3 3 3-3M3 12h10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>' })),
    { action: 'clear-pins', label: 'Clear pinned entries', desc: 'Remove all starred items', icon: '<path d="M6 2h4M8 2v8M5 12l3-2 3 2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>' },
    { action: 'clear-all', label: 'Clear all entries', desc: 'Delete everything captured', icon: '<path d="M2 4h12M6 4V2h4v2M3 4l1 10h8l1-10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>' },
    { action: 'dock:right', label: 'Dock panel right', desc: 'Panel position', icon: '<rect x="9" y="2" width="5" height="12" rx="1" stroke="currentColor" stroke-width="1.2"/>' },
    { action: 'dock:bottom', label: 'Dock panel bottom', desc: 'Panel position', icon: '<rect x="2" y="9" width="12" height="5" rx="1" stroke="currentColor" stroke-width="1.2"/>' },
    { action: 'close', label: 'Close panel', desc: 'Hide XRAY', icon: '<path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>', key: 'Esc' },
  ];

  // ══════════════════════════════════════════════════════════════════════════
  // CSS
  // ══════════════════════════════════════════════════════════════════════════
  function buildCSS() {
    return `
/* ═══════════════════════════════════════════════════════════════════════════
   Command Palette V2 — Premium macOS-style Design
   ═══════════════════════════════════════════════════════════════════════════ */

/* Variables scoped to shadow host */
:host, .xr-cmd-backdrop {
  --cp-bg0: #09090b; --cp-bg1: #111113; --cp-bg2: #18181b; --cp-bg3: #222225; --cp-bg4: #2a2a2e;
  --cp-t0: #fafafa; --cp-t1: #e4e4e7; --cp-t2: #a1a1aa; --cp-t3: #71717a; --cp-t4: #52525b;
  --cp-bd: rgba(255,255,255,0.06); --cp-bd2: rgba(255,255,255,0.1); --cp-bd3: rgba(255,255,255,0.15);
  --cp-acc: #818cf8; --cp-acc-l: #a5b4fc; --cp-acc-dim: rgba(129,140,248,0.12);
  --cp-grn: #34d399; --cp-grn-dim: rgba(52,211,153,0.12);
  --cp-red: #f87171; --cp-red-dim: rgba(248,113,113,0.12);
  --cp-ylw: #fbbf24; --cp-ylw-dim: rgba(251,191,36,0.12);
  --cp-blu: #60a5fa; --cp-blu-dim: rgba(96,165,250,0.12);
  --cp-mono: 'SF Mono', 'JetBrains Mono', 'Fira Code', monospace;
  --cp-sans: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', system-ui, sans-serif;
}

.xr-cmd-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(20px) saturate(200%);
  -webkit-backdrop-filter: blur(20px) saturate(200%);
  z-index: 2147483646;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.2s ease-out, visibility 0.2s;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 12vh;
}
.xr-cmd-backdrop.xr-open {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

.xr-cmd-shell {
  width: 640px;
  max-width: calc(100vw - 48px);
  max-height: 480px;
  background: rgba(17, 17, 19, 0.85);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transform: translateY(-10px) scale(0.96);
  opacity: 0;
  transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.18s ease;
  font-family: var(--cp-sans);
  font-size: 13px;
  color: var(--cp-t0);
  box-shadow: 
    0 0 0 1px rgba(255,255,255,0.08) inset,
    0 25px 60px -15px rgba(0,0,0,0.6),
    0 10px 30px -10px rgba(0,0,0,0.4),
    0 0 1px rgba(0,0,0,0.3);
  pointer-events: auto;
}
.xr-cmd-backdrop.xr-open .xr-cmd-shell {
  transform: translateY(0) scale(1);
  opacity: 1;
}

/* ── Header ── */
.xr-cmd-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--cp-bd);
  background: rgba(255,255,255,0.03);
  backdrop-filter: blur(10px);
}
.xr-cmd-head svg { color: var(--cp-t3); flex-shrink: 0; }
.xr-cmd-inp {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--cp-t0);
  font-size: 14px;
  font-family: var(--cp-sans);
  font-weight: 400;
  caret-color: var(--cp-acc);
  letter-spacing: -0.01em;
}
.xr-cmd-inp::placeholder { color: var(--cp-t4); }
.xr-cmd-esc {
  padding: 3px 8px;
  background: var(--cp-bg3);
  border: 1px solid var(--cp-bd2);
  border-radius: 5px;
  font-size: 10px;
  font-family: var(--cp-mono);
  color: var(--cp-t3);
  cursor: pointer;
  transition: all 0.12s;
}
.xr-cmd-esc:hover { background: var(--cp-bg4); color: var(--cp-t1); }

/* ── Body (Two Column) ── */
.xr-cmd-body {
  display: flex;
  min-height: 0;
  max-height: 360px;
  flex: 1;
}

/* Left column - categories */
.xr-cmd-left {
  width: 170px;
  flex-shrink: 0;
  border-right: 1px solid var(--cp-bd);
  overflow-y: auto;
  padding: 8px;
  background: rgba(0,0,0,0.2);
}
.xr-cmd-left::-webkit-scrollbar { width: 0; }

/* Right column - detail panel */
.xr-cmd-right {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  padding: 16px 18px;
}
.xr-cmd-right::-webkit-scrollbar { width: 5px; }
.xr-cmd-right::-webkit-scrollbar-track { background: transparent; }
.xr-cmd-right::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
.xr-cmd-right::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }

/* ── Group item (left sidebar) ── */
.xr-cmd-grp {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  margin-bottom: 2px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.12s ease;
  pointer-events: auto;
  user-select: none;
  position: relative;
}
.xr-cmd-grp::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: var(--cp-acc);
  border-radius: 0 2px 2px 0;
  transition: height 0.15s ease;
}
.xr-cmd-grp:hover { 
  background: rgba(255,255,255,0.04);
}
.xr-cmd-grp.sel {
  background: rgba(255,255,255,0.06);
}
.xr-cmd-grp.sel::before {
  height: 18px;
}
.xr-cmd-grp-icon {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--cp-bd);
  border-radius: 6px;
  transition: all 0.12s;
}
.xr-cmd-grp:hover .xr-cmd-grp-icon { 
  background: rgba(255,255,255,0.06); 
  border-color: var(--cp-bd2);
}
.xr-cmd-grp.sel .xr-cmd-grp-icon { 
  background: var(--cp-acc-dim); 
  border-color: rgba(129,140,248,0.25);
}
.xr-cmd-grp.sel .xr-cmd-grp-icon svg { color: var(--cp-acc-l); }
.xr-cmd-grp-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--cp-t2);
  flex: 1;
  letter-spacing: -0.01em;
}
.xr-cmd-grp:hover .xr-cmd-grp-label { color: var(--cp-t1); }
.xr-cmd-grp.sel .xr-cmd-grp-label { color: var(--cp-t0); }
.xr-cmd-grp-arrow { 
  color: var(--cp-t4); 
  opacity: 0;
  transition: opacity 0.12s;
}
.xr-cmd-grp:hover .xr-cmd-grp-arrow,
.xr-cmd-grp.sel .xr-cmd-grp-arrow { opacity: 1; }

/* ── Right Panel Title ── */
.xr-rp-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--cp-t2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.xr-rp-title-icon {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cp-acc-dim);
  border-radius: 6px;
}
.xr-rp-title-icon svg { color: var(--cp-acc-l); }

/* ── Section Label ── */
.xr-section-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--cp-t3);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 10px;
  margin-top: 4px;
}

/* ── Theme Grid ── */
.xr-theme-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-bottom: 18px;
}
.xr-theme-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 6px;
  border: 1px solid var(--cp-bd);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  pointer-events: auto;
  user-select: none;
  background: rgba(255,255,255,0.02);
}
.xr-theme-card:hover { 
  background: rgba(255,255,255,0.05); 
  border-color: var(--cp-bd2);
  transform: translateY(-1px);
}
.xr-theme-card.on { 
  border-color: var(--cp-acc); 
  background: var(--cp-acc-dim);
  box-shadow: 0 0 0 1px var(--cp-acc-dim);
}
.xr-theme-swatch {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.12);
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.xr-theme-card.on .xr-theme-swatch { 
  border-color: var(--cp-acc-l);
  box-shadow: 0 0 12px rgba(129,140,248,0.4);
}
.xr-theme-name { 
  font-size: 10px; 
  font-weight: 500;
  color: var(--cp-t3); 
  text-align: center; 
  pointer-events: none; 
}
.xr-theme-card:hover .xr-theme-name { color: var(--cp-t2); }
.xr-theme-card.on .xr-theme-name { color: var(--cp-acc-l); font-weight: 600; }

/* ── Setting Row ── */
.xr-setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--cp-bd);
}
.xr-setting-row:last-child { border-bottom: none; }
.xr-sr-left { display: flex; flex-direction: column; gap: 3px; }
.xr-sr-label { font-size: 12px; font-weight: 500; color: var(--cp-t1); letter-spacing: -0.01em; }
.xr-sr-desc { font-size: 11px; color: var(--cp-t4); }

/* ── Toggle ── */
.xr-tgl {
  width: 38px;
  height: 22px;
  background: var(--cp-bg3);
  border-radius: 11px;
  position: relative;
  cursor: pointer;
  border: 1px solid var(--cp-bd2);
  transition: all 0.2s ease;
  flex-shrink: 0;
  pointer-events: auto;
  user-select: none;
}
.xr-tgl:hover { border-color: var(--cp-bd3); }
.xr-tgl.on { 
  background: var(--cp-acc); 
  border-color: var(--cp-acc);
  box-shadow: 0 0 12px rgba(129,140,248,0.3);
}
.xr-tgl-thumb {
  position: absolute;
  width: 16px;
  height: 16px;
  background: var(--cp-t3);
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: none;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}
.xr-tgl.on .xr-tgl-thumb { 
  left: 18px; 
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}

/* ── Segmented Control ── */
.xr-seg {
  display: flex;
  background: var(--cp-bg2);
  border: 1px solid var(--cp-bd);
  border-radius: 8px;
  padding: 3px;
  gap: 2px;
}
.xr-seg-o {
  padding: 5px 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--cp-t3);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--cp-sans);
  transition: all 0.15s ease;
  white-space: nowrap;
  pointer-events: auto;
  user-select: none;
}
.xr-seg-o:hover { color: var(--cp-t1); background: rgba(255,255,255,0.03); }
.xr-seg-o.on { 
  background: var(--cp-acc-dim); 
  color: var(--cp-acc-l);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

/* ── Chips (Filters) ── */
.xr-chip-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
.xr-chip {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  font-family: var(--cp-sans);
  cursor: pointer;
  border: 1px solid var(--cp-bd2);
  background: rgba(255,255,255,0.02);
  color: var(--cp-t3);
  pointer-events: auto;
  user-select: none;
  transition: all 0.15s ease;
}
.xr-chip:hover { 
  border-color: var(--cp-bd3); 
  color: var(--cp-t1);
  background: rgba(255,255,255,0.04);
}
.xr-chip.c2.on { 
  background: var(--cp-grn-dim); 
  border-color: rgba(52,211,153,0.35); 
  color: var(--cp-grn);
  box-shadow: 0 0 10px rgba(52,211,153,0.2);
}
.xr-chip.c3.on { 
  background: var(--cp-blu-dim); 
  border-color: rgba(96,165,250,0.35); 
  color: var(--cp-blu);
  box-shadow: 0 0 10px rgba(96,165,250,0.2);
}
.xr-chip.c4.on { 
  background: var(--cp-ylw-dim); 
  border-color: rgba(251,191,36,0.35); 
  color: var(--cp-ylw);
  box-shadow: 0 0 10px rgba(251,191,36,0.2);
}
.xr-chip.c5.on { 
  background: var(--cp-red-dim); 
  border-color: rgba(248,113,113,0.35); 
  color: var(--cp-red);
  box-shadow: 0 0 10px rgba(248,113,113,0.2);
}

/* ── View Grid ── */
.xr-view-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}
.xr-view-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  border: 1px solid var(--cp-bd);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  pointer-events: auto;
  user-select: none;
  background: rgba(255,255,255,0.02);
}
.xr-view-card:hover { background: var(--cp-bg3); border-color: var(--cp-bd2); }
.xr-view-card.on { border-color: var(--cp-acc); background: var(--cp-acc-dim); }
.xr-view-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cp-bg3);
  border-radius: 6px;
  pointer-events: none;
}
.xr-view-card.on .xr-view-icon { background: rgba(99,102,241,0.25); }
.xr-view-label { font-size: 10px; color: var(--cp-t2); pointer-events: none; }
.xr-view-card.on .xr-view-label { color: var(--cp-acc-l); }
.xr-view-key { font-size: 9px; font-family: var(--cp-mono); color: var(--cp-t4); pointer-events: none; }

/* ── Nav Grid ── */
.xr-nav-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
.xr-nav-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 10px;
  border: 1px solid var(--cp-bd);
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.12s;
  pointer-events: auto;
  user-select: none;
}
.xr-nav-card:hover { background: var(--cp-bg3); border-color: var(--cp-bd2); }
.xr-nav-card.on { border-color: var(--cp-acc); background: var(--cp-acc-dim); }
.xr-nav-icon {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cp-bg3);
  border-radius: 5px;
  pointer-events: none;
}
.xr-nav-card.on .xr-nav-icon { background: rgba(99,102,241,0.25); }
.xr-nav-label { font-size: 11px; color: var(--cp-t1); pointer-events: none; }
.xr-nav-key { font-size: 9px; font-family: var(--cp-mono); color: var(--cp-t4); margin-left: auto; pointer-events: none; }

/* ── Export List ── */
.xr-export-list { display: flex; flex-direction: column; gap: 4px; }
.xr-exp-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid var(--cp-bd);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.1s;
  pointer-events: auto;
  user-select: none;
}
.xr-exp-item:hover { background: var(--cp-bg3); border-color: var(--cp-bd2); }
.xr-exp-icon {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cp-bg3);
  border-radius: 5px;
  pointer-events: none;
}
.xr-exp-label { font-size: 11.5px; color: var(--cp-t1); flex: 1; pointer-events: none; }
.xr-exp-desc { font-size: 10px; color: var(--cp-t4); pointer-events: none; }

/* ── Danger Zone ── */
.xr-danger-zone {
  border: 1px solid rgba(239,68,68,0.15);
  border-radius: 7px;
  overflow: hidden;
}
.xr-dz-header {
  padding: 8px 10px;
  background: rgba(239,68,68,0.05);
  border-bottom: 1px solid rgba(239,68,68,0.1);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(239,68,68,0.6);
}
.xr-dz-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  cursor: pointer;
  transition: background 0.1s;
  border-bottom: 1px solid rgba(239,68,68,0.07);
  pointer-events: auto;
  user-select: none;
}
.xr-dz-item:last-child { border-bottom: none; }
.xr-dz-item:hover { background: rgba(239,68,68,0.06); }
.xr-dz-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cp-red-dim);
  border-radius: 5px;
  pointer-events: none;
}
.xr-dz-text { flex: 1; pointer-events: none; }
.xr-dz-label { font-size: 11.5px; color: var(--cp-t1); }
.xr-dz-sub { font-size: 10px; color: var(--cp-t4); }
.xr-dz-badge {
  padding: 2px 7px;
  background: var(--cp-red-dim);
  border-radius: 8px;
  font-size: 9px;
  font-weight: 700;
  color: var(--cp-red);
  pointer-events: none;
}

/* ── Search Results ── */
.xr-search-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 7px 10px;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.07s;
  border-left: 2px solid transparent;
  pointer-events: auto;
  user-select: none;
}
.xr-search-item:hover { background: var(--cp-bg3); }
.xr-search-item.sel { background: var(--cp-bg3); border-left-color: var(--cp-acc); }
.xr-search-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cp-bg3);
  border: 1px solid var(--cp-bd);
  border-radius: 5px;
}
.xr-search-item.sel .xr-search-icon { background: var(--cp-bg4); }
.xr-search-text { flex: 1; min-width: 0; }
.xr-search-label { font-size: 11.5px; color: var(--cp-t1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.xr-search-item.sel .xr-search-label { color: var(--cp-t0); }
.xr-search-desc { font-size: 10px; color: var(--cp-t4); margin-top: 1px; }
.xr-search-key {
  padding: 2px 5px;
  background: var(--cp-bg4);
  border: 1px solid var(--cp-bd);
  border-radius: 3px;
  font-size: 9.5px;
  font-family: var(--cp-mono);
  color: var(--cp-t3);
}
.xr-search-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  gap: 8px;
  color: var(--cp-t4);
}
.xr-search-empty svg { opacity: 0.2; }
.xr-search-empty span { font-size: 11.5px; }

mark { background: rgba(245,158,11,0.22); color: var(--cp-t0); border-radius: 2px; padding: 0 1px; }

/* ── Footer ── */
.xr-cmd-foot {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  border-top: 1px solid var(--cp-bd);
  background: var(--cp-bg0);
}
.xr-cmd-fhint {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-family: var(--cp-mono);
  color: var(--cp-t4);
}
.xr-cmd-fhint .k {
  padding: 1px 4px;
  background: var(--cp-bg3);
  border: 1px solid var(--cp-bd);
  border-radius: 3px;
  font-size: 9px;
  color: var(--cp-t3);
}
.xr-cmd-fspacer { flex: 1; }
.xr-cmd-fctx { font-size: 10px; color: var(--cp-t4); font-family: var(--cp-mono); }

/* ── Section Label ── */
.xr-section-label {
  font-size: 9.5px;
  color: var(--cp-t4);
  margin-bottom: 7px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
`;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // HTML
  // ══════════════════════════════════════════════════════════════════════════
  function buildHTML() {
    return `
<div class="xr-cmd-backdrop" id="xr-cmd-backdrop">
  <div class="xr-cmd-shell">
    <div class="xr-cmd-head">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" stroke-width="1.4"/><path d="m10 10 3.5 3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
      <input class="xr-cmd-inp" id="xr-cmd-inp" placeholder="Search commands, settings, filters…" autocomplete="off" spellcheck="false"/>
      <span class="xr-cmd-esc" id="xr-cmd-esc">esc</span>
    </div>
    <div class="xr-cmd-body">
      <div class="xr-cmd-left" id="xr-cmd-left"></div>
      <div class="xr-cmd-right" id="xr-cmd-right"></div>
    </div>
    <div class="xr-cmd-foot">
      <span class="xr-cmd-fhint"><span class="k">↑↓</span>navigate</span>
      <span class="xr-cmd-fhint"><span class="k">↵</span>select</span>
      <span class="xr-cmd-fhint"><span class="k">Tab</span>switch</span>
      <span class="xr-cmd-fspacer"></span>
      <span class="xr-cmd-fctx" id="xr-cmd-fctx">XRAY DevTools</span>
    </div>
  </div>
</div>
    `.trim();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Rendering
  // ══════════════════════════════════════════════════════════════════════════
  function render() {
    if (!_leftCol || !_rightCol) return;

    // Sync settings from panel
    syncSettingsFromPanel();

    if (_query) {
      renderSearchResults();
    } else {
      renderCategories();
      renderDetailPanel();
    }

    updateFooter();
  }

  function renderCategories() {
    let html = '';
    GROUPS.forEach(g => {
      const isSel = _selGroup === g.id;
      html += `
        <div class="xr-cmd-grp${isSel ? ' sel' : ''}" data-group="${g.id}">
          <div class="xr-cmd-grp-icon"><svg width="12" height="12" viewBox="0 0 16 16" fill="none">${g.icon}</svg></div>
          <span class="xr-cmd-grp-label">${g.label}</span>
          <svg class="xr-cmd-grp-arrow" width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
      `;
    });
    _leftCol.innerHTML = html;

    // Bind click events
    _leftCol.querySelectorAll('.xr-cmd-grp').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        _selGroup = el.dataset.group;
        render();
      });
    });
  }

  function renderDetailPanel() {
    let html = '';

    if (_selGroup === 'navigation') {
      html = renderNavigation();
    } else if (_selGroup === 'appearance') {
      html = renderAppearance();
    } else if (_selGroup === 'views') {
      html = renderViews();
    } else if (_selGroup === 'filters') {
      html = renderFilters();
    } else if (_selGroup === 'export') {
      html = renderExport();
    } else if (_selGroup === 'danger') {
      html = renderDanger();
    }

    _rightCol.innerHTML = html;
    bindDetailEvents();
  }

  function renderNavigation() {
    return `
      <div class="xr-rp-title">
        <div class="xr-rp-title-icon"><svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M8 3l5 5-5 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        Navigation
      </div>
      <div class="xr-nav-grid">
        ${TABS.map(t => `
          <div class="xr-nav-card${_settings.activeTab === t.id ? ' on' : ''}" data-action="tab:${t.id}">
            <div class="xr-nav-icon"><svg width="13" height="13" viewBox="0 0 16 16" fill="none">${t.icon}</svg></div>
            <span class="xr-nav-label">${t.label}</span>
            <span class="xr-nav-key">${t.key}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderAppearance() {
    return `
      <div class="xr-rp-title">
        <div class="xr-rp-title-icon"><svg width="11" height="11" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.3"/></svg></div>
        Appearance
      </div>
      <div class="xr-section-label">Color theme</div>
      <div class="xr-theme-grid">
        ${THEMES.map(t => `
          <div class="xr-theme-card${_settings.theme === t.id ? ' on' : ''}" data-action="theme:${t.id}">
            <div class="xr-theme-swatch" style="background:${t.dot};"></div>
            <span class="xr-theme-name">${t.name}</span>
          </div>
        `).join('')}
      </div>
      <div class="xr-setting-row">
        <div class="xr-sr-left">
          <div class="xr-sr-label">Dock position</div>
          <div class="xr-sr-desc">Where the panel attaches</div>
        </div>
        <div class="xr-seg">
          <button class="xr-seg-o${_settings.dock === 'right' ? ' on' : ''}" data-action="dock:right">Right</button>
          <button class="xr-seg-o${_settings.dock === 'bottom' ? ' on' : ''}" data-action="dock:bottom">Bottom</button>
        </div>
      </div>
      <div class="xr-setting-row">
        <div class="xr-sr-left">
          <div class="xr-sr-label">Glassmorphism blur</div>
          <div class="xr-sr-desc">Frosted glass panel background</div>
        </div>
        <div class="xr-tgl${_settings.blur ? ' on' : ''}" data-action="blur"><div class="xr-tgl-thumb"></div></div>
      </div>
      <div class="xr-setting-row">
        <div class="xr-sr-left">
          <div class="xr-sr-label">Background opacity</div>
          <div class="xr-sr-desc">Panel transparency</div>
        </div>
        <div class="xr-seg">
          ${[70, 80, 90, 100].map(v => `
            <button class="xr-seg-o${_settings.opacity === v ? ' on' : ''}" data-action="opacity:${v}">${v}%</button>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderViews() {
    const viewDescs = {
      tree: 'Collapsible JSON explorer with copy-on-click',
      grid: 'Array responses rendered as sortable data table',
      raw: 'Syntax-highlighted JSON with line numbers',
      diff: 'Side-by-side diff against previous same-URL call',
      waterfall: 'Timeline of all captured requests'
    };
    return `
      <div class="xr-rp-title">
        <div class="xr-rp-title-icon"><svg width="11" height="11" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.2"/></svg></div>
        Response views
      </div>
      <div class="xr-view-grid">
        ${VIEWS.map(v => `
          <div class="xr-view-card${_settings.activeView === v.id ? ' on' : ''}" data-action="view:${v.id}">
            <div class="xr-view-icon"><svg width="14" height="14" viewBox="0 0 16 16" fill="none">${v.icon}</svg></div>
            <span class="xr-view-label">${v.label}</span>
            <span class="xr-view-key">${v.key}</span>
          </div>
        `).join('')}
      </div>
      <div style="margin-top:10px;padding:9px;background:var(--cp-bg3);border-radius:6px;border:1px solid var(--cp-bd);">
        <div style="font-size:10px;color:var(--cp-t3);margin-bottom:5px;">Active: <span style="color:var(--cp-acc-l);font-family:var(--cp-mono);">${_settings.activeView}</span></div>
        <div style="font-size:10px;color:var(--cp-t4);">${viewDescs[_settings.activeView] || ''}</div>
      </div>
    `;
  }

  function renderFilters() {
    const active = Object.values(_settings.filters).filter(Boolean).length;
    return `
      <div class="xr-rp-title">
        <div class="xr-rp-title-icon"><svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg></div>
        Filters
        ${active > 0 ? `<span style="margin-left:4px;padding:2px 6px;background:var(--cp-ylw-dim);border-radius:8px;font-size:9px;font-weight:700;color:var(--cp-ylw);">${active} active</span>` : ''}
      </div>
      <div class="xr-section-label">Status codes</div>
      <div class="xr-chip-row">
        <button class="xr-chip c2${_settings.filters.s2 ? ' on' : ''}" data-action="filter:s2">2xx Success</button>
        <button class="xr-chip c3${_settings.filters.s3 ? ' on' : ''}" data-action="filter:s3">3xx Redirect</button>
        <button class="xr-chip c4${_settings.filters.s4 ? ' on' : ''}" data-action="filter:s4">4xx Client</button>
        <button class="xr-chip c5${_settings.filters.s5 ? ' on' : ''}" data-action="filter:s5">5xx Server</button>
      </div>
      <div class="xr-setting-row">
        <div class="xr-sr-left">
          <div class="xr-sr-label">Quick filter: errors only</div>
          <div class="xr-sr-desc">Enable 4xx + 5xx together</div>
        </div>
        <button style="padding:4px 10px;background:var(--cp-bg4);border:1px solid var(--cp-bd2);border-radius:5px;color:var(--cp-t2);font-size:10px;font-weight:600;cursor:pointer;font-family:var(--cp-sans);" data-action="errors-only">Errors only</button>
      </div>
      <div class="xr-setting-row">
        <div class="xr-sr-left">
          <div class="xr-sr-label">Reset all filters</div>
          <div class="xr-sr-desc">Show all captured requests</div>
        </div>
        <button style="padding:4px 10px;background:var(--cp-bg4);border:1px solid var(--cp-bd2);border-radius:5px;color:var(--cp-t2);font-size:10px;font-weight:600;cursor:pointer;font-family:var(--cp-sans);" data-action="clear-filters">Clear</button>
      </div>
    `;
  }

  function renderExport() {
    return `
      <div class="xr-rp-title">
        <div class="xr-rp-title-icon"><svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M8 2v8M5 7l3 3 3-3M3 12h10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        Export & copy
      </div>
      <div class="xr-export-list">
        ${EXPORTS.map(e => `
          <div class="xr-exp-item" data-action="export:${e.id}">
            <div class="xr-exp-icon"><svg width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="3" y="2" width="9" height="11" rx="1.5" stroke="${e.color}" stroke-width="1.2"/><path d="M5 6h5M5 9h3" stroke="${e.color}" stroke-width="1.1" stroke-linecap="round"/></svg></div>
            <div style="flex:1;min-width:0;"><div class="xr-exp-label">${e.label}</div><div class="xr-exp-desc">${e.desc}</div></div>
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderDanger() {
    const stats = getStats();
    return `
      <div class="xr-rp-title">
        <div class="xr-rp-title-icon" style="background:var(--cp-red-dim);"><svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M8 3L14 13H2L8 3Z" stroke="#ef4444" stroke-width="1.2" stroke-linejoin="round"/><path d="M8 7v3M8 11.5v.5" stroke="#ef4444" stroke-width="1.2" stroke-linecap="round"/></svg></div>
        <span style="color:var(--cp-red)">Danger zone</span>
      </div>
      <div class="xr-danger-zone">
        <div class="xr-dz-header">Irreversible actions</div>
        <div class="xr-dz-item" data-action="clear-pins">
          <div class="xr-dz-icon"><svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M6 2h4M8 2v8M5 12l3-2 3 2" stroke="#ef4444" stroke-width="1.2" stroke-linecap="round"/></svg></div>
          <div class="xr-dz-text"><div class="xr-dz-label">Clear pinned entries</div><div class="xr-dz-sub">Remove all starred items</div></div>
          <span class="xr-dz-badge">${stats.pinned} pinned</span>
        </div>
        <div class="xr-dz-item" data-action="clear-all">
          <div class="xr-dz-icon"><svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M6 4V2h4v2M3 4l1 10h8l1-10" stroke="#ef4444" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
          <div class="xr-dz-text"><div class="xr-dz-label">Clear all entries</div><div class="xr-dz-sub">Delete all ${stats.total} captured items</div></div>
          <span class="xr-dz-badge">irreversible</span>
        </div>
      </div>
    `;
  }

  function renderSearchResults() {
    const commands = ALL_COMMANDS();
    const filtered = commands.filter(c => 
      c.label.toLowerCase().includes(_query.toLowerCase()) ||
      (c.desc && c.desc.toLowerCase().includes(_query.toLowerCase()))
    ).slice(0, 12);

    _leftCol.innerHTML = '<div style="padding:8px 10px;font-size:9.5px;color:var(--cp-t4);text-transform:uppercase;letter-spacing:0.5px;">Results</div>';

    if (filtered.length === 0) {
      _rightCol.innerHTML = `
        <div class="xr-search-empty">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.4"/><path d="m21 21-4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          <span>No commands match "${escapeHtml(_query)}"</span>
        </div>
      `;
      return;
    }

    let html = '';
    filtered.forEach((cmd, idx) => {
      html += `
        <div class="xr-search-item${idx === _selIdx ? ' sel' : ''}" data-action="${cmd.action}" data-idx="${idx}">
          <div class="xr-search-icon"><svg width="12" height="12" viewBox="0 0 16 16" fill="none">${cmd.icon}</svg></div>
          <div class="xr-search-text">
            <div class="xr-search-label">${highlightMatch(cmd.label, _query)}</div>
            ${cmd.desc ? `<div class="xr-search-desc">${highlightMatch(cmd.desc, _query)}</div>` : ''}
          </div>
          ${cmd.key ? `<span class="xr-search-key">${cmd.key}</span>` : ''}
        </div>
      `;
    });

    _rightCol.innerHTML = html;

    // Bind events
    _rightCol.querySelectorAll('.xr-search-item').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        executeAction(el.dataset.action);
      });
      el.addEventListener('mouseenter', () => {
        _selIdx = parseInt(el.dataset.idx, 10);
        updateSearchSelection();
      });
    });
  }

  function bindDetailEvents() {
    _rightCol.querySelectorAll('[data-action]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        executeAction(el.dataset.action);
      });
    });
  }

  function updateSearchSelection() {
    _rightCol.querySelectorAll('.xr-search-item').forEach((el, idx) => {
      el.classList.toggle('sel', idx === _selIdx);
    });
  }

  function updateFooter() {
    const stats = getStats();
    const ctx = _root?.querySelector?.('#xr-cmd-fctx');
    if (ctx) ctx.textContent = `${stats.apis} requests · ${stats.logs} logs`;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Actions
  // ══════════════════════════════════════════════════════════════════════════
  function executeAction(action) {
    if (!action) return;

    const [type, value] = action.split(':');

    switch (type) {
      case 'tab':
        switchTab(value);
        close();
        break;
      case 'theme':
        setTheme(value);
        break;
      case 'dock':
        setDock(value);
        break;
      case 'blur':
        toggleBlur();
        break;
      case 'opacity':
        setOpacity(parseInt(value, 10));
        break;
      case 'view':
        setView(value);
        break;
      case 'filter':
        toggleFilter(value);
        break;
      case 'errors-only':
        _settings.filters = { s2: false, s3: false, s4: true, s5: true };
        applyFilters();
        render();
        break;
      case 'clear-filters':
        _settings.filters = { s2: false, s3: false, s4: false, s5: false };
        applyFilters();
        render();
        break;
      case 'export':
        doExport(value);
        close();
        break;
      case 'clear-pins':
        clearPins();
        render();
        break;
      case 'clear-all':
        clearAll();
        close();
        break;
      case 'close':
        _panelRef?.hide?.();
        close();
        break;
    }
  }

  // ── Tab switching ──
  function switchTab(tabId) {
    const tabBtn = _panelRoot?.querySelector?.(`[data-tab="${tabId}"]`);
    if (tabBtn) {
      tabBtn.click();
      _settings.activeTab = tabId;
    }
  }

  // ── Theme ──
  function setTheme(themeId) {
    _settings.theme = themeId;
    
    // Use panel's public API if available
    if (_panelRef?.setTheme) {
      _panelRef.setTheme(themeId);
    } else if (window.XRAY_Panel?.setTheme) {
      window.XRAY_Panel.setTheme(themeId);
    } else if (window.XRAY_Themes && window.XRAY_Themes[themeId]) {
      // Fallback: try direct application
      const panel = _panelRoot?.querySelector?.('#xr-panel');
      if (panel) {
        Object.entries(window.XRAY_Themes[themeId].vars).forEach(([k, v]) => {
          panel.style.setProperty(k, v);
        });
      }
    }
    
    render();
  }

  // ── Dock ──
  function setDock(position) {
    _settings.dock = position;
    if (window.XRAY_HUD?.setDockMode) {
      window.XRAY_HUD.setDockMode(position);
    }
    render();
  }

  // ── Blur ──
  function toggleBlur() {
    _settings.blur = !_settings.blur;
    if (window.XRAY_HUD?.setBlur) {
      window.XRAY_HUD.setBlur(_settings.blur);
    }
    render();
  }

  // ── Opacity ──
  function setOpacity(value) {
    _settings.opacity = value;
    if (window.XRAY_HUD?.setOpacity) {
      window.XRAY_HUD.setOpacity(value / 100);
    }
    render();
  }

  // ── View ──
  function setView(viewId) {
    _settings.activeView = viewId;
    if (_panelRef?.setView) {
      _panelRef.setView(viewId);
    }
    render();
  }

  // ── Filters ──
  function toggleFilter(filterId) {
    _settings.filters[filterId] = !_settings.filters[filterId];
    applyFilters();
    render();
  }

  function applyFilters() {
    // Apply to panel settings checkboxes
    const container = _panelRoot?.querySelector?.('#xr-settings-status-filters');
    if (container) {
      container.querySelectorAll('input[data-status]').forEach(cb => {
        const status = cb.dataset.status;
        const key = 's' + status.charAt(0);
        cb.checked = _settings.filters[key] || false;
        cb.dispatchEvent(new Event('change'));
      });
    }
  }

  // ── Export ──
  function doExport(type) {
    // Get selected entry for copy operations
    const selectedEntry = _panelRef?.getSelectedEntry?.() || window.XRAY_Panel?.getSelectedEntry?.();
    const allEntries = _panelRef?.getEntries?.() || window.XRAY_Panel?.getEntries?.() || [];
    
    if (window.XRAY_Export) {
      switch (type) {
        case 'curl':
          if (selectedEntry) window.XRAY_Export.copyCurl(selectedEntry);
          break;
        case 'fetch':
          if (selectedEntry) window.XRAY_Export.copyFetch(selectedEntry);
          break;
        case 'axios':
          if (selectedEntry) window.XRAY_Export.copyAxios(selectedEntry);
          break;
        case 'json':
          window.XRAY_Export.downloadJSON(allEntries);
          break;
        case 'har':
          window.XRAY_Export.downloadHAR(allEntries);
          break;
      }
    }
  }

  // ── Clear ──
  function clearPins() {
    _panelRef?.clearPins?.();
  }

  function clearAll() {
    _panelRef?.clearAll?.();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Helpers
  // ══════════════════════════════════════════════════════════════════════════
  function syncSettingsFromPanel() {
    // Sync theme
    const themeSelect = _panelRoot?.querySelector?.('#xr-settings-theme');
    if (themeSelect) _settings.theme = themeSelect.value;

    // Sync active tab
    const activeTab = _panelRoot?.querySelector?.('.xr-tab.xr-active');
    if (activeTab) _settings.activeTab = activeTab.dataset.tab;

    // Sync view - try to get from panel state
    // _settings.activeView stays as last set
  }

  function getStats() {
    const entries = _panelRef?.getEntries?.() || [];
    const apis = entries.filter(e => e.type === 'api').length;
    const logs = entries.filter(e => e.type === 'log').length;
    const pinned = _panelRef?.getPinnedCount?.() || 0;
    return { apis, logs, pinned, total: entries.length };
  }

  function highlightMatch(text, query) {
    if (!query) return escapeHtml(text);
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx < 0) return escapeHtml(text);
    return escapeHtml(text.slice(0, idx)) + '<mark>' + escapeHtml(text.slice(idx, idx + query.length)) + '</mark>' + escapeHtml(text.slice(idx + query.length));
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Open / Close
  // ══════════════════════════════════════════════════════════════════════════
  let _host = null;
  
  function open() {
    if (_isOpen) return;
    _isOpen = true;
    _query = '';
    _selIdx = 0;
    _selGroup = 'appearance';

    // Enable pointer events on host
    _host = document.getElementById('__xray_cmd_host__');
    if (_host) _host.style.pointerEvents = 'auto';
    
    _container.classList.add('xr-open');
    setTimeout(() => {
      _input?.focus();
      render();
    }, 20);
  }

  function close() {
    if (!_isOpen) return;
    _isOpen = false;
    _container.classList.remove('xr-open');
    if (_input) _input.value = '';
    _query = '';
    
    // Disable pointer events on host so page is interactive
    _host = document.getElementById('__xray_cmd_host__');
    if (_host) _host.style.pointerEvents = 'none';
  }

  function toggle() {
    _isOpen ? close() : open();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Keyboard
  // ══════════════════════════════════════════════════════════════════════════
  function handleKeyDown(e) {
    // Global: Ctrl+K to toggle
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      e.stopPropagation();
      toggle();
      return;
    }

    if (!_isOpen) return;

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        close();
        break;
      case 'ArrowDown':
        e.preventDefault();
        navigateDown();
        break;
      case 'ArrowUp':
        e.preventDefault();
        navigateUp();
        break;
      case 'Enter':
        e.preventDefault();
        executeSelected();
        break;
      case 'Tab':
        e.preventDefault();
        // Switch between left/right columns
        break;
    }
  }

  function navigateDown() {
    if (_query) {
      const items = _rightCol.querySelectorAll('.xr-search-item');
      _selIdx = Math.min(_selIdx + 1, items.length - 1);
      updateSearchSelection();
      items[_selIdx]?.scrollIntoView({ block: 'nearest' });
    } else {
      const groupIds = GROUPS.map(g => g.id);
      const idx = groupIds.indexOf(_selGroup);
      if (idx < groupIds.length - 1) {
        _selGroup = groupIds[idx + 1];
        render();
      }
    }
  }

  function navigateUp() {
    if (_query) {
      _selIdx = Math.max(_selIdx - 1, 0);
      updateSearchSelection();
      _rightCol.querySelectorAll('.xr-search-item')[_selIdx]?.scrollIntoView({ block: 'nearest' });
    } else {
      const groupIds = GROUPS.map(g => g.id);
      const idx = groupIds.indexOf(_selGroup);
      if (idx > 0) {
        _selGroup = groupIds[idx - 1];
        render();
      }
    }
  }

  function executeSelected() {
    if (_query) {
      const items = _rightCol.querySelectorAll('.xr-search-item');
      const sel = items[_selIdx];
      if (sel) executeAction(sel.dataset.action);
    }
  }

  function handleInput(e) {
    _query = e.target.value.trim();
    _selIdx = 0;
    render();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Initialization
  // ══════════════════════════════════════════════════════════════════════════
  function init(shadowRoot, panelRef) {
    if (_container) return; // Already initialized

    _panelRoot = shadowRoot;  // Store panel's shadow root for querying panel elements
    _panelRef = panelRef;

    // Create our own top-level shadow host for the command palette
    // This ensures it's at document root level and can properly overlay everything
    let host = document.getElementById('__xray_cmd_host__');
    if (!host) {
      host = document.createElement('div');
      host.id = '__xray_cmd_host__';
      host.style.cssText = 'position:fixed;inset:0;z-index:2147483647;pointer-events:none;';
      document.documentElement.appendChild(host);
    }
    
    _root = host.shadowRoot || host.attachShadow({ mode: 'open' });

    // Inject styles
    const style = document.createElement('style');
    style.textContent = buildCSS();
    _root.appendChild(style);

    // Inject HTML
    const wrapper = document.createElement('div');
    wrapper.innerHTML = buildHTML();
    _root.appendChild(wrapper.firstElementChild);

    // Cache DOM refs
    _container = _root.querySelector('#xr-cmd-backdrop');
    _input = _root.querySelector('#xr-cmd-inp');
    _leftCol = _root.querySelector('#xr-cmd-left');
    _rightCol = _root.querySelector('#xr-cmd-right');
    
    const shell = _root.querySelector('.xr-cmd-shell');

    // Bind events
    _input.addEventListener('input', handleInput);
    _root.querySelector('#xr-cmd-esc')?.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      close();
    });
    
    // Shell captures all clicks to prevent pass-through
    shell?.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    shell?.addEventListener('mousedown', (e) => {
      e.stopPropagation();
    });
    
    // Backdrop click closes
    _container.addEventListener('click', (e) => {
      e.stopPropagation();
      if (e.target === _container) {
        close();
      }
    });
    _container.addEventListener('mousedown', (e) => {
      e.stopPropagation();
    });

    // Global keyboard
    document.addEventListener('keydown', handleKeyDown, true);

    return _public;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Public API
  // ══════════════════════════════════════════════════════════════════════════
  const _public = {
    init,
    open,
    close,
    toggle,
    isOpen: () => _isOpen,
  };

  return _public;
})();
