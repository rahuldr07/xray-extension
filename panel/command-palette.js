// panel/command-palette.js — Premium ⌘K Spotlight Experience
// Inspired by Linear, Raycast, Vercel, and macOS Spotlight

window.XRAY_CommandPalette = (() => {
  'use strict';

  // ══════════════════════════════════════════════════════════════════════════
  // Constants & Config
  // ══════════════════════════════════════════════════════════════════════════
  const STORAGE_KEY = 'xray_cmd_recent';
  const MAX_RECENT = 5;
  const DEBOUNCE_MS = 50;
  
  // Spring animation curves (macOS/Linear feel)
  const SPRING = {
    smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    snappy: 'cubic-bezier(0.2, 0, 0, 1)',
  };

  // ══════════════════════════════════════════════════════════════════════════
  // State
  // ══════════════════════════════════════════════════════════════════════════
  let _isOpen = false;
  let _root = null;        // Shadow root to inject into
  let _container = null;   // Main palette container
  let _input = null;       // Search input
  let _results = null;     // Results container
  let _selectedIdx = 0;
  let _currentResults = [];
  let _recentCommands = [];
  let _panelRef = null;    // Reference to XRAY_Panel
  let _debounceTimer = null;

  // ══════════════════════════════════════════════════════════════════════════
  // Command Registry
  // ══════════════════════════════════════════════════════════════════════════
  const COMMANDS = [
    // ── Navigation ─────────────────────────────────────────────────────────
    { 
      id: 'tab-api', 
      label: 'Go to API Tab', 
      keywords: ['api', 'network', 'requests', 'fetch'],
      icon: '📡',
      category: 'Navigation',
      action: () => switchTab('api'),
    },
    { 
      id: 'tab-logs', 
      label: 'Go to Logs Tab', 
      keywords: ['logs', 'console', 'messages'],
      icon: '📋',
      category: 'Navigation',
      action: () => switchTab('logs'),
    },
    { 
      id: 'tab-console', 
      label: 'Go to Console Tab', 
      keywords: ['console', 'repl', 'execute', 'js'],
      icon: '⌨️',
      category: 'Navigation',
      action: () => switchTab('console'),
    },
    { 
      id: 'tab-insights', 
      label: 'Go to Insights Tab', 
      keywords: ['insights', 'analytics', 'stats', 'dashboard'],
      icon: '📊',
      category: 'Navigation',
      action: () => switchTab('insights'),
    },

    // ── Views ──────────────────────────────────────────────────────────────
    { 
      id: 'view-tree', 
      label: 'Tree View', 
      keywords: ['tree', 'json', 'structure', 'hierarchy'],
      icon: '🌳',
      category: 'View',
      shortcut: 'T',
      action: () => setView('tree'),
    },
    { 
      id: 'view-grid', 
      label: 'Grid View', 
      keywords: ['grid', 'table', 'columns'],
      icon: '▦',
      category: 'View',
      shortcut: 'G',
      action: () => setView('grid'),
    },
    { 
      id: 'view-raw', 
      label: 'Raw JSON', 
      keywords: ['raw', 'json', 'text', 'code'],
      icon: '{ }',
      category: 'View',
      shortcut: 'R',
      action: () => setView('raw'),
    },
    { 
      id: 'view-diff', 
      label: 'Diff View', 
      keywords: ['diff', 'compare', 'changes', 'difference'],
      icon: '±',
      category: 'View',
      shortcut: 'D',
      action: () => setView('diff'),
    },
    { 
      id: 'view-waterfall', 
      label: 'Waterfall View', 
      keywords: ['waterfall', 'timing', 'performance', 'timeline'],
      icon: '📊',
      category: 'View',
      shortcut: 'W',
      action: () => setView('waterfall'),
    },

    // ── Filters ────────────────────────────────────────────────────────────
    { 
      id: 'filter-get', 
      label: 'Filter: GET requests', 
      keywords: ['get', 'filter', 'method'],
      icon: '🔍',
      category: 'Filter',
      action: () => filterByMethod('GET'),
    },
    { 
      id: 'filter-post', 
      label: 'Filter: POST requests', 
      keywords: ['post', 'filter', 'method', 'create'],
      icon: '📤',
      category: 'Filter',
      action: () => filterByMethod('POST'),
    },
    { 
      id: 'filter-put', 
      label: 'Filter: PUT requests', 
      keywords: ['put', 'filter', 'method', 'update'],
      icon: '📝',
      category: 'Filter',
      action: () => filterByMethod('PUT'),
    },
    { 
      id: 'filter-delete', 
      label: 'Filter: DELETE requests', 
      keywords: ['delete', 'filter', 'method', 'remove'],
      icon: '🗑️',
      category: 'Filter',
      action: () => filterByMethod('DELETE'),
    },
    { 
      id: 'filter-errors', 
      label: 'Filter: Errors only (4xx/5xx)', 
      keywords: ['error', 'errors', '4xx', '5xx', 'failed', 'failure'],
      icon: '❌',
      category: 'Filter',
      action: () => filterByStatus('errors'),
    },
    { 
      id: 'filter-clear', 
      label: 'Clear all filters', 
      keywords: ['clear', 'reset', 'all', 'remove'],
      icon: '✨',
      category: 'Filter',
      action: () => clearFilters(),
    },

    // ── Export ─────────────────────────────────────────────────────────────
    { 
      id: 'export-curl', 
      label: 'Copy as cURL', 
      keywords: ['curl', 'copy', 'export', 'command'],
      icon: '📋',
      category: 'Export',
      action: () => exportAs('curl'),
    },
    { 
      id: 'export-fetch', 
      label: 'Copy as fetch()', 
      keywords: ['fetch', 'copy', 'export', 'javascript'],
      icon: '📋',
      category: 'Export',
      action: () => exportAs('fetch'),
    },
    { 
      id: 'export-json', 
      label: 'Export all as JSON', 
      keywords: ['json', 'export', 'download', 'save'],
      icon: '💾',
      category: 'Export',
      action: () => exportAs('json'),
    },
    { 
      id: 'export-har', 
      label: 'Export as HAR', 
      keywords: ['har', 'export', 'download', 'http archive'],
      icon: '💾',
      category: 'Export',
      action: () => exportAs('har'),
    },

    // ── Actions ────────────────────────────────────────────────────────────
    { 
      id: 'action-clear', 
      label: 'Clear all entries', 
      keywords: ['clear', 'delete', 'reset', 'entries'],
      icon: '🗑️',
      category: 'Actions',
      action: () => clearEntries(),
    },
    { 
      id: 'action-pin', 
      label: 'Pin selected entry', 
      keywords: ['pin', 'star', 'favorite', 'save'],
      icon: '📌',
      category: 'Actions',
      shortcut: 'S',
      action: () => pinSelected(),
    },
    { 
      id: 'action-copy', 
      label: 'Copy selected JSON', 
      keywords: ['copy', 'json', 'clipboard'],
      icon: '📋',
      category: 'Actions',
      shortcut: 'C',
      action: () => copySelected(),
    },
    { 
      id: 'action-replay', 
      label: 'Replay selected request', 
      keywords: ['replay', 'resend', 'retry', 'execute'],
      icon: '🔄',
      category: 'Actions',
      action: () => replaySelected(),
    },

    // ── Panel ──────────────────────────────────────────────────────────────
    { 
      id: 'panel-dock-right', 
      label: 'Dock panel to right', 
      keywords: ['dock', 'right', 'side', 'position'],
      icon: '▶️',
      category: 'Panel',
      action: () => setDock('right'),
    },
    { 
      id: 'panel-dock-bottom', 
      label: 'Dock panel to bottom', 
      keywords: ['dock', 'bottom', 'position'],
      icon: '🔽',
      category: 'Panel',
      action: () => setDock('bottom'),
    },
    { 
      id: 'panel-close', 
      label: 'Close panel', 
      keywords: ['close', 'hide', 'exit', 'escape'],
      icon: '✕',
      category: 'Panel',
      shortcut: 'Esc',
      action: () => closePanel(),
    },
    { 
      id: 'panel-settings', 
      label: 'Open Settings', 
      keywords: ['settings', 'preferences', 'options', 'config'],
      icon: '⚙️',
      category: 'Panel',
      action: () => openSettings(),
    },

    // ── Theme ──────────────────────────────────────────────────────────────
    { 
      id: 'theme-zinc', 
      label: 'Theme: Zinc (Dark)', 
      keywords: ['theme', 'zinc', 'dark', 'gray'],
      icon: '🎨',
      category: 'Theme',
      action: () => setTheme('zinc'),
    },
    { 
      id: 'theme-mocha', 
      label: 'Theme: Mocha (Dark)', 
      keywords: ['theme', 'mocha', 'dark', 'brown'],
      icon: '🎨',
      category: 'Theme',
      action: () => setTheme('mocha'),
    },
    { 
      id: 'theme-dracula', 
      label: 'Theme: Dracula', 
      keywords: ['theme', 'dracula', 'dark', 'purple'],
      icon: '🎨',
      category: 'Theme',
      action: () => setTheme('dracula'),
    },
    { 
      id: 'theme-nord', 
      label: 'Theme: Nord', 
      keywords: ['theme', 'nord', 'dark', 'blue'],
      icon: '🎨',
      category: 'Theme',
      action: () => setTheme('nord'),
    },
    { 
      id: 'theme-latte', 
      label: 'Theme: Latte (Light)', 
      keywords: ['theme', 'latte', 'light', 'white'],
      icon: '🎨',
      category: 'Theme',
      action: () => setTheme('latte'),
    },
  ];

  // ══════════════════════════════════════════════════════════════════════════
  // Command Actions (delegated to XRAY_Panel)
  // ══════════════════════════════════════════════════════════════════════════
  function switchTab(tab) {
    // Query within shadow root, not document
    const tabBtn = _root?.querySelector?.(`[data-tab="${tab}"]`) || 
                   document.querySelector(`#__xray_root__`)?.shadowRoot?.querySelector(`[data-tab="${tab}"]`);
    tabBtn?.click();
  }

  function setView(view) {
    _panelRef?.setView?.(view);
  }

  function filterByMethod(method) {
    // Trigger fuzzy search with method filter
    const input = _root?.querySelector('#xr-fuzzy-input');
    if (input) {
      input.value = method;
      input.dispatchEvent(new Event('input'));
    }
  }

  function filterByStatus(type) {
    // Open settings and check error filters
    if (type === 'errors') {
      _root?.querySelector('[data-status="4xx"]')?.click();
      _root?.querySelector('[data-status="5xx"]')?.click();
    }
  }

  function clearFilters() {
    _root?.querySelectorAll('[data-status]').forEach(el => {
      if (el.checked) el.click();
    });
    _root?.querySelectorAll('[data-type]').forEach(el => {
      if (el.checked) el.click();
    });
  }

  function exportAs(format) {
    if (window.XRAY_Export) {
      const selected = _panelRef?.getSelectedEntry?.();
      if (format === 'curl' && selected) {
        window.XRAY_Export.copyAsCurl(selected);
      } else if (format === 'fetch' && selected) {
        window.XRAY_Export.copyAsFetch(selected);
      } else if (format === 'json') {
        window.XRAY_Export.exportJSON();
      } else if (format === 'har') {
        window.XRAY_Export.exportHAR();
      }
    }
  }

  function clearEntries() {
    _root?.querySelector('#xr-clear')?.click();
  }

  function pinSelected() {
    _panelRef?.pinSelected?.();
  }

  function copySelected() {
    _panelRef?.copySelected?.();
  }

  function replaySelected() {
    // Future: implement replay
    console.log('[XRAY] Replay not yet implemented');
  }

  function setDock(mode) {
    window.XRAY_HUD?.setDockMode?.(mode);
  }

  function closePanel() {
    _panelRef?.hide?.();
  }

  function openSettings() {
    // Directly open settings modal via panel's shadow root
    const backdrop = _root?.querySelector('#xr-settings-backdrop') ||
                     _root?.querySelector('.xr-settings-backdrop');
    if (backdrop) {
      backdrop.classList.add('xr-open');
    }
  }

  function setTheme(theme) {
    const select = _root?.querySelector('#xr-settings-theme');
    if (select) {
      select.value = theme;
      select.dispatchEvent(new Event('change'));
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Fuzzy Search
  // ══════════════════════════════════════════════════════════════════════════
  function fuzzyMatch(query, text) {
    if (!query) return { match: true, score: 0, indices: [] };
    
    const q = query.toLowerCase();
    const t = text.toLowerCase();
    
    // Exact match gets highest score
    if (t === q) return { match: true, score: 1000, indices: Array.from(q, (_, i) => i) };
    
    // Starts with gets high score
    if (t.startsWith(q)) return { match: true, score: 500 + q.length, indices: Array.from(q, (_, i) => i) };
    
    // Contains gets medium score
    const containsIdx = t.indexOf(q);
    if (containsIdx !== -1) {
      return { 
        match: true, 
        score: 200 + q.length, 
        indices: Array.from(q, (_, i) => containsIdx + i)
      };
    }
    
    // Fuzzy match
    let qi = 0;
    let score = 0;
    const indices = [];
    let consecutiveBonus = 0;
    
    for (let ti = 0; ti < t.length && qi < q.length; ti++) {
      if (t[ti] === q[qi]) {
        indices.push(ti);
        score += 10;
        
        // Bonus for consecutive matches
        if (indices.length > 1 && indices[indices.length - 1] - indices[indices.length - 2] === 1) {
          consecutiveBonus += 5;
        }
        
        // Bonus for word boundary matches
        if (ti === 0 || t[ti - 1] === ' ' || t[ti - 1] === '-' || t[ti - 1] === '_') {
          score += 15;
        }
        
        qi++;
      }
    }
    
    if (qi === q.length) {
      return { match: true, score: score + consecutiveBonus, indices };
    }
    
    return { match: false, score: 0, indices: [] };
  }

  function searchCommands(query) {
    if (!query.trim()) {
      // Show recent commands first, then all commands
      const recent = _recentCommands
        .map(id => COMMANDS.find(c => c.id === id))
        .filter(Boolean);
      
      const others = COMMANDS.filter(c => !_recentCommands.includes(c.id));
      
      return [
        ...recent.map(c => ({ ...c, isRecent: true, score: 1000 })),
        ...others.map(c => ({ ...c, score: 0 })),
      ];
    }
    
    const results = [];
    
    for (const cmd of COMMANDS) {
      // Match against label
      const labelMatch = fuzzyMatch(query, cmd.label);
      
      // Match against keywords
      let keywordScore = 0;
      for (const kw of cmd.keywords) {
        const kwMatch = fuzzyMatch(query, kw);
        if (kwMatch.match) {
          keywordScore = Math.max(keywordScore, kwMatch.score);
        }
      }
      
      const bestScore = Math.max(labelMatch.score, keywordScore);
      
      if (labelMatch.match || keywordScore > 0) {
        results.push({
          ...cmd,
          score: bestScore,
          matchIndices: labelMatch.match ? labelMatch.indices : [],
        });
      }
    }
    
    // Sort by score descending
    results.sort((a, b) => b.score - a.score);
    
    return results;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Recent Commands
  // ══════════════════════════════════════════════════════════════════════════
  function loadRecent() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      _recentCommands = saved ? JSON.parse(saved) : [];
    } catch {
      _recentCommands = [];
    }
  }

  function saveRecent(cmdId) {
    _recentCommands = _recentCommands.filter(id => id !== cmdId);
    _recentCommands.unshift(cmdId);
    _recentCommands = _recentCommands.slice(0, MAX_RECENT);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_recentCommands));
    } catch {}
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CSS (Premium macOS feel)
  // ══════════════════════════════════════════════════════════════════════════
  function buildCSS() {
    return `
/* ═══════════════════════════════════════════════════════════════════════════
   Command Palette — Premium Spotlight Experience
   ═══════════════════════════════════════════════════════════════════════════ */

/* Backdrop with blur */
.xr-cmd-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px) saturate(150%);
  -webkit-backdrop-filter: blur(8px) saturate(150%);
  z-index: 2147483646;
  opacity: 0;
  visibility: hidden;
  transition: 
    opacity 0.2s ${SPRING.smooth},
    visibility 0.2s;
}

.xr-cmd-backdrop.xr-open {
  opacity: 1;
  visibility: visible;
}

/* Main palette container */
.xr-cmd-palette {
  position: fixed;
  top: 15%;
  left: 50%;
  width: 560px;
  max-width: calc(100vw - 48px);
  max-height: 70vh;
  transform: translateX(-50%) translateY(-20px) scale(0.96);
  opacity: 0;
  
  background: rgba(24, 24, 27, 0.92);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.3),
    0 24px 72px rgba(0, 0, 0, 0.5),
    0 8px 24px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  
  overflow: hidden;
  z-index: 2147483647;
  
  transition: 
    transform 0.25s ${SPRING.bounce},
    opacity 0.2s ${SPRING.smooth};
  
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', system-ui, sans-serif;
}

.xr-cmd-backdrop.xr-open .xr-cmd-palette {
  transform: translateX(-50%) translateY(0) scale(1);
  opacity: 1;
}

/* Search input area */
.xr-cmd-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.xr-cmd-icon {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
  transition: color 0.15s;
}

.xr-cmd-header:focus-within .xr-cmd-icon {
  color: #3b82f6;
}

.xr-cmd-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 16px;
  font-weight: 400;
  color: #fafafa;
  caret-color: #3b82f6;
  font-family: inherit;
}

.xr-cmd-input::placeholder {
  color: rgba(255, 255, 255, 0.35);
}

.xr-cmd-shortcut {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}

.xr-cmd-shortcut kbd {
  font-family: 'SF Mono', 'JetBrains Mono', monospace;
  font-size: 10px;
}

/* Results area */
.xr-cmd-results {
  max-height: calc(70vh - 100px);
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 8px;
}

.xr-cmd-results::-webkit-scrollbar {
  width: 6px;
}

.xr-cmd-results::-webkit-scrollbar-track {
  background: transparent;
}

.xr-cmd-results::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.xr-cmd-results::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Category header */
.xr-cmd-category {
  padding: 8px 12px 4px;
  font-size: 10px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.35);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.xr-cmd-category:first-child {
  padding-top: 0;
}

/* Result item */
.xr-cmd-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: 
    background 0.1s,
    transform 0.1s ${SPRING.snappy};
  position: relative;
  margin-bottom: 2px;
}

.xr-cmd-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.xr-cmd-item.xr-selected {
  background: rgba(59, 130, 246, 0.15);
}

.xr-cmd-item:active {
  transform: scale(0.98);
}

/* Selection indicator */
.xr-cmd-item.xr-selected::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: #3b82f6;
  border-radius: 0 2px 2px 0;
  opacity: 0;
  animation: slideIn 0.15s ${SPRING.smooth} forwards;
}

@keyframes slideIn {
  from { 
    opacity: 0;
    transform: translateY(-50%) translateX(-3px);
  }
  to { 
    opacity: 1;
    transform: translateY(-50%) translateX(0);
  }
}

/* Item icon */
.xr-cmd-item-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  font-size: 14px;
  flex-shrink: 0;
  transition: background 0.15s, transform 0.15s ${SPRING.bounce};
}

.xr-cmd-item.xr-selected .xr-cmd-item-icon {
  background: rgba(59, 130, 246, 0.2);
  transform: scale(1.05);
}

/* Item content */
.xr-cmd-item-content {
  flex: 1;
  min-width: 0;
}

.xr-cmd-item-label {
  font-size: 13px;
  font-weight: 500;
  color: #fafafa;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.xr-cmd-item-label mark {
  background: transparent;
  color: #3b82f6;
  font-weight: 600;
}

.xr-cmd-item-subtitle {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 1px;
}

/* Recent badge */
.xr-cmd-recent-badge {
  font-size: 9px;
  padding: 2px 6px;
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border-radius: 4px;
  font-weight: 500;
}

/* Item shortcut */
.xr-cmd-item-shortcut {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

.xr-cmd-item-shortcut kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 5px;
  font-family: 'SF Mono', 'JetBrains Mono', monospace;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
}

/* Empty state */
.xr-cmd-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
}

.xr-cmd-empty-icon {
  font-size: 32px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.xr-cmd-empty-text {
  font-size: 13px;
  font-weight: 500;
}

.xr-cmd-empty-hint {
  font-size: 11px;
  margin-top: 4px;
  opacity: 0.7;
}

/* Footer hint */
.xr-cmd-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 10px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
}

.xr-cmd-footer-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.xr-cmd-footer kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  font-family: 'SF Mono', monospace;
  font-size: 9px;
}

/* Entry search results (API entries) */
.xr-cmd-entry {
  display: flex;
  align-items: center;
  gap: 10px;
}

.xr-cmd-entry-method {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
}

.xr-cmd-entry-method.xr-get { color: #4ade80; }
.xr-cmd-entry-method.xr-post { color: #60a5fa; }
.xr-cmd-entry-method.xr-put { color: #fbbf24; }
.xr-cmd-entry-method.xr-delete { color: #f87171; }

.xr-cmd-entry-url {
  flex: 1;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.xr-cmd-entry-status {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 600;
}

.xr-cmd-entry-status.xr-2xx { color: #4ade80; }
.xr-cmd-entry-status.xr-3xx { color: #60a5fa; }
.xr-cmd-entry-status.xr-4xx { color: #fbbf24; }
.xr-cmd-entry-status.xr-5xx { color: #f87171; }
`;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // DOM Construction
  // ══════════════════════════════════════════════════════════════════════════
  function buildHTML() {
    const backdrop = document.createElement('div');
    backdrop.className = 'xr-cmd-backdrop';
    backdrop.innerHTML = `
      <div class="xr-cmd-palette">
        <div class="xr-cmd-header">
          <span class="xr-cmd-icon">⌘</span>
          <input 
            type="text" 
            class="xr-cmd-input" 
            placeholder="Search commands, entries, or type to filter..."
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
          >
          <span class="xr-cmd-shortcut"><kbd>esc</kbd> to close</span>
        </div>
        <div class="xr-cmd-results"></div>
        <div class="xr-cmd-footer">
          <span class="xr-cmd-footer-item"><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span class="xr-cmd-footer-item"><kbd>↵</kbd> select</span>
          <span class="xr-cmd-footer-item"><kbd>esc</kbd> close</span>
        </div>
      </div>
    `;
    return backdrop;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Rendering
  // ══════════════════════════════════════════════════════════════════════════
  function renderResults(results) {
    _currentResults = results;
    _selectedIdx = Math.min(_selectedIdx, Math.max(0, results.length - 1));
    
    if (results.length === 0) {
      _results.innerHTML = `
        <div class="xr-cmd-empty">
          <div class="xr-cmd-empty-icon">🔍</div>
          <div class="xr-cmd-empty-text">No results found</div>
          <div class="xr-cmd-empty-hint">Try a different search term</div>
        </div>
      `;
      return;
    }
    
    // Group by category
    const groups = new Map();
    let hasRecent = false;
    
    for (const item of results) {
      if (item.isRecent && !hasRecent) {
        groups.set('Recent', []);
        hasRecent = true;
      }
      
      const category = item.isRecent ? 'Recent' : item.category;
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category).push(item);
    }
    
    // Build HTML
    let html = '';
    let globalIdx = 0;
    
    for (const [category, items] of groups) {
      html += `<div class="xr-cmd-category">${category}</div>`;
      
      for (const item of items) {
        const isSelected = globalIdx === _selectedIdx;
        const label = item.matchIndices?.length 
          ? highlightMatches(item.label, item.matchIndices)
          : item.label;
        
        html += `
          <div class="xr-cmd-item ${isSelected ? 'xr-selected' : ''}" data-idx="${globalIdx}" data-id="${item.id}">
            <div class="xr-cmd-item-icon">${item.icon}</div>
            <div class="xr-cmd-item-content">
              <div class="xr-cmd-item-label">${label}</div>
            </div>
            ${item.isRecent ? '<span class="xr-cmd-recent-badge">Recent</span>' : ''}
            ${item.shortcut ? `<div class="xr-cmd-item-shortcut"><kbd>${item.shortcut}</kbd></div>` : ''}
          </div>
        `;
        globalIdx++;
      }
    }
    
    _results.innerHTML = html;
    
    // Bind click handlers
    _results.querySelectorAll('.xr-cmd-item').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.idx, 10);
        executeCommand(idx);
      });
      
      el.addEventListener('mouseenter', () => {
        _selectedIdx = parseInt(el.dataset.idx, 10);
        updateSelection();
      });
    });
  }

  function highlightMatches(text, indices) {
    if (!indices.length) return text;
    
    let result = '';
    let lastIdx = 0;
    
    for (const idx of indices) {
      result += text.slice(lastIdx, idx);
      result += `<mark>${text[idx]}</mark>`;
      lastIdx = idx + 1;
    }
    
    result += text.slice(lastIdx);
    return result;
  }

  function updateSelection() {
    _results.querySelectorAll('.xr-cmd-item').forEach((el, idx) => {
      el.classList.toggle('xr-selected', idx === _selectedIdx);
    });
    
    // Scroll into view
    const selected = _results.querySelector('.xr-cmd-item.xr-selected');
    if (selected) {
      selected.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Command Execution
  // ══════════════════════════════════════════════════════════════════════════
  function executeCommand(idx) {
    const cmd = _currentResults[idx];
    if (!cmd) return;
    
    // Save to recent
    saveRecent(cmd.id);
    
    // Close palette with animation
    close();
    
    // Execute after animation
    setTimeout(() => {
      try {
        cmd.action();
      } catch (err) {
        console.error('[XRAY Command Palette] Action failed:', err);
      }
    }, 150);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Keyboard Navigation
  // ══════════════════════════════════════════════════════════════════════════
  function handleKeyDown(e) {
    if (!_isOpen) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        _selectedIdx = Math.min(_selectedIdx + 1, _currentResults.length - 1);
        updateSelection();
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        _selectedIdx = Math.max(_selectedIdx - 1, 0);
        updateSelection();
        break;
        
      case 'Enter':
        e.preventDefault();
        executeCommand(_selectedIdx);
        break;
        
      case 'Escape':
        e.preventDefault();
        close();
        break;
        
      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) {
          _selectedIdx = Math.max(_selectedIdx - 1, 0);
        } else {
          _selectedIdx = Math.min(_selectedIdx + 1, _currentResults.length - 1);
        }
        updateSelection();
        break;
    }
  }

  function handleInput(e) {
    const query = e.target.value;
    
    clearTimeout(_debounceTimer);
    _debounceTimer = setTimeout(() => {
      _selectedIdx = 0;
      const results = searchCommands(query);
      renderResults(results);
    }, DEBOUNCE_MS);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Open / Close
  // ══════════════════════════════════════════════════════════════════════════
  function open() {
    if (_isOpen || !_container) return;
    
    _isOpen = true;
    _selectedIdx = 0;
    _input.value = '';
    
    // Show with animation
    _container.classList.add('xr-open');
    
    // Focus after animation starts
    requestAnimationFrame(() => {
      _input.focus();
    });
    
    // Render initial results
    const results = searchCommands('');
    renderResults(results);
  }

  function close() {
    if (!_isOpen || !_container) return;
    
    _isOpen = false;
    _container.classList.remove('xr-open');
    _input.blur();
  }

  function toggle() {
    _isOpen ? close() : open();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Global Keyboard Shortcut
  // ══════════════════════════════════════════════════════════════════════════
  function handleGlobalKeyDown(e) {
    // Cmd/Ctrl + K
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      e.stopPropagation();
      toggle();
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Initialization
  // ══════════════════════════════════════════════════════════════════════════
  function init(shadowRoot, panelRef) {
    if (_container) return; // Already initialized
    
    _root = shadowRoot;
    _panelRef = panelRef;
    
    loadRecent();
    
    // Inject styles
    const style = document.createElement('style');
    style.textContent = buildCSS();
    _root.appendChild(style);
    
    // Build and inject DOM
    _container = buildHTML();
    _root.appendChild(_container);
    
    // Cache refs
    _input = _container.querySelector('.xr-cmd-input');
    _results = _container.querySelector('.xr-cmd-results');
    
    // Bind events
    _input.addEventListener('input', handleInput);
    _input.addEventListener('keydown', handleKeyDown);
    _container.addEventListener('click', (e) => {
      if (e.target === _container) close();
    });
    
    // Global shortcut (attached to document for capture)
    document.addEventListener('keydown', handleGlobalKeyDown, true);
    
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
    
    // Allow external command registration
    registerCommand(cmd) {
      if (cmd.id && cmd.label && cmd.action) {
        COMMANDS.push(cmd);
      }
    },
  };

  return _public;
})();
