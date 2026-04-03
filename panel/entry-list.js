// panel/entry-list.js — Optimized entry list with virtual scrolling
// Drop-in replacement for floating.js's _rebuildList()
window.XRAY_EntryList = (() => {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════════
  
  const ITEM_HEIGHT = 58;      // Height of each entry row
  const GROUP_HEIGHT = 58;     // Height of group header
  const OVERSCAN = 5;          // Extra items above/below viewport
  const BATCH_SIZE = 50;       // Items to render per frame

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════════════════
  
  let _container = null;
  let _viewport = null;
  let _content = null;
  let _spacer = null;
  let _filterBar = null;
  
  let _entries = [];
  let _filteredItems = [];  // Flattened list of items to render
  let _selectedId = null;
  let _onSelect = null;
  let _onContextMenu = null;
  
  let _scrollTop = 0;
  let _visibleStart = 0;
  let _visibleEnd = 0;
  let _renderedNodes = new Map(); // index -> DOM element
  
  let _expandedGroups = new Set();
  let _filters = { statusCodes: [], types: [] };
  let _searchQuery = '';
  let _activeTab = 'api';
  let _pinnedIds = new Set();

  // ═══════════════════════════════════════════════════════════════════════════
  // FILTERING & GROUPING
  // ═══════════════════════════════════════════════════════════════════════════

  function _applyFilters(entries) {
    return entries.filter(entry => {
      // Tab filter
      if (_activeTab === 'api' && entry.type !== 'api') return false;
      if (_activeTab === 'logs' && entry.type !== 'log') return false;
      
      // Type filter
      if (_filters.types.length > 0) {
        if (entry.type === 'api' && !_filters.types.includes(entry.source)) return false;
        if (entry.type === 'log' && !_filters.types.includes('log')) return false;
      }
      
      // Status code filter (API only)
      if (_filters.statusCodes.length > 0 && entry.type === 'api') {
        const status = entry.status || 0;
        const range = Math.floor(status / 100) + 'xx';
        if (!_filters.statusCodes.includes(range)) return false;
      }
      
      // Search filter
      if (_searchQuery) {
        return _matchesSearch(entry, _searchQuery);
      }
      
      return true;
    });
  }

  function _matchesSearch(entry, query) {
    const q = query.toLowerCase();
    
    if (entry.type === 'api') {
      if (entry.url?.toLowerCase().includes(q)) return true;
      if (entry.method?.toLowerCase().includes(q)) return true;
      if (String(entry.status).includes(q)) return true;
    }
    
    if (entry.type === 'log') {
      if (entry.logLevel?.toLowerCase().includes(q)) return true;
      // Use pre-computed tokens if available
      if (entry._searchTokens) {
        return entry._searchTokens.some(t => t.includes(q));
      }
    }
    
    return false;
  }

  function _buildFlatList(filtered) {
    // Group API entries by endpoint, keep logs individual
    const items = [];
    const apiGroups = new Map();
    
    // First pass: group entries
    filtered.forEach(entry => {
      if (entry.type === 'api') {
        const key = `api:${entry.urlPath || entry.url || 'unknown'}`;
        if (!apiGroups.has(key)) {
          apiGroups.set(key, { key, entries: [], isGroup: true });
        }
        apiGroups.get(key).entries.push(entry);
      } else {
        items.push({ entry, isGroup: false, key: `log:${entry.id}` });
      }
    });
    
    // Second pass: flatten groups
    apiGroups.forEach(group => {
      const expanded = _expandedGroups.has(group.key);
      
      // Add group header (first entry)
      items.push({
        entry: group.entries[0],
        isGroupHeader: true,
        groupKey: group.key,
        groupCount: group.entries.length,
        expanded,
      });
      
      // Add children if expanded
      if (expanded && group.entries.length > 1) {
        group.entries.slice(1).forEach(entry => {
          items.push({
            entry,
            isGroupChild: true,
            groupKey: group.key,
          });
        });
      }
    });
    
    // Sort by timestamp (newest first)
    items.sort((a, b) => b.entry.timestamp - a.entry.timestamp);
    
    return items;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDERING
  // ═══════════════════════════════════════════════════════════════════════════

  function _renderItem(item, index) {
    const { entry, isGroupHeader, isGroupChild, groupKey, groupCount, expanded } = item;
    
    const el = document.createElement('div');
    el.className = 'xr-entry';
    el.dataset.id = entry.id;
    el.dataset.index = index;
    
    if (entry.type === 'api') {
      el.dataset.method = entry.method || 'GET';
      el.classList.add('xr-api-row');
    }
    
    if (isGroupChild) {
      el.classList.add('xr-group-child');
    }
    
    if (entry.id === _selectedId) {
      el.classList.add('xr-selected');
    }
    
    if (_pinnedIds.has(entry.id)) {
      el.classList.add('xr-pinned');
    }
    
    // Build inner HTML
    if (entry.type === 'api') {
      el.innerHTML = _renderApiEntry(entry, isGroupHeader, groupCount, expanded);
    } else {
      el.innerHTML = _renderLogEntry(entry);
    }
    
    // Event handlers
    el.addEventListener('click', (e) => {
      if (e.target.closest('.xr-group-toggle')) {
        // Toggle group expansion
        if (_expandedGroups.has(groupKey)) {
          _expandedGroups.delete(groupKey);
        } else {
          _expandedGroups.add(groupKey);
        }
        refresh();
        return;
      }
      
      if (e.target.closest('.xr-entry-pin')) {
        // Toggle pin
        if (_pinnedIds.has(entry.id)) {
          _pinnedIds.delete(entry.id);
        } else {
          _pinnedIds.add(entry.id);
        }
        el.classList.toggle('xr-pinned');
        return;
      }
      
      _selectById(entry.id);
    });
    
    el.addEventListener('contextmenu', (e) => {
      if (_onContextMenu) {
        e.preventDefault();
        _onContextMenu(entry, e);
      }
    });
    
    return el;
  }

  function _renderApiEntry(entry, isGroupHeader, groupCount, expanded) {
    const method = entry.method || 'GET';
    const status = entry.status || 0;
    const statusClass = `xr-s-${status >= 500 ? '5xx' : status >= 400 ? '4xx' : status >= 300 ? '3xx' : '2xx'}`;
    const methodClass = `xr-m-${method.toLowerCase()}`;
    const duration = entry.duration ? `${entry.duration}ms` : '0ms';
    const size = entry.size ? _formatSize(entry.size) : '0B';
    const path = entry.urlPath || _extractPath(entry.url) || entry.url || '';
    const time = _formatTime(entry.timestamp);
    
    // Calculate a mock waterfall bar for now
    const left = Math.min(Math.random() * 50, 40) + '%';
    const width = Math.max(Math.random() * 40, 5) + '%';
    
    return `
      <div class="xr-col xr-col-method ${methodClass}">${method}</div>
      <div class="xr-col xr-col-status ${statusClass}"><div class="xr-status-dot"></div>${status}</div>
      <div class="xr-col xr-col-url" title="${entry.url || ''}"><span class="xr-url-path">${path}</span></div>
      <div class="xr-col xr-col-time">${duration}</div>
      <div class="xr-col xr-col-size">${size}</div>
      <div class="xr-col xr-col-waterfall">
        <div class="xr-waterfall-bar xr-wf-total" style="left:${left}; width:${width}"></div>
      </div>
      <div class="xr-quick-actions">
        <button class="xr-entry-pin" title="Pin">📌</button>
        <button title="Copy">📋</button>
      </div>
    `;
  }

  function _renderLogEntry(entry) {
    const level = entry.logLevel || 'log';
    const levelClass = `xr-log-${level}`;
    const time = _formatTime(entry.timestamp);
    const preview = _previewLogData(entry.logData);
    
    const icon = level === 'error' ? '✕' : level === 'warn' ? '⚠' : '●';
    
    return `
      <div class="xr-entry-content">
        <div class="xr-entry-row1">
          <span class="xr-log-level ${levelClass}">${icon} ${level}</span>
          <span class="xr-entry-pin" title="Pin">★</span>
        </div>
        <div class="xr-entry-row2">${preview}</div>
        <div class="xr-entry-row3">
          <span>${time}</span>
        </div>
      </div>
    `;
  }

  function _previewLogData(data) {
    if (data === null) return '<span class="xr-null">null</span>';
    if (data === undefined) return '<span class="xr-undefined">undefined</span>';
    
    const type = typeof data;
    
    if (type === 'string') {
      const truncated = data.length > 60 ? data.slice(0, 57) + '...' : data;
      return `<span class="xr-string">"${_escapeHtml(truncated)}"</span>`;
    }
    
    if (type === 'number' || type === 'boolean') {
      return `<span class="xr-${type}">${data}</span>`;
    }
    
    if (Array.isArray(data)) {
      return `<span class="xr-array">Array(${data.length})</span>`;
    }
    
    if (type === 'object') {
      const keys = Object.keys(data);
      const preview = keys.slice(0, 3).join(', ');
      const more = keys.length > 3 ? `, +${keys.length - 3}` : '';
      return `<span class="xr-object">{${preview}${more}}</span>`;
    }
    
    return String(data);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VIRTUAL SCROLLING
  // ═══════════════════════════════════════════════════════════════════════════

  function _updateViewport() {
    if (!_viewport || !_content) return;
    
    const viewportHeight = _viewport.clientHeight;
    const totalHeight = _filteredItems.length * ITEM_HEIGHT;
    
    _spacer.style.height = `${totalHeight}px`;
    
    const startIndex = Math.max(0, Math.floor(_scrollTop / ITEM_HEIGHT) - OVERSCAN);
    const endIndex = Math.min(
      _filteredItems.length,
      Math.ceil((_scrollTop + viewportHeight) / ITEM_HEIGHT) + OVERSCAN
    );
    
    if (startIndex === _visibleStart && endIndex === _visibleEnd) {
      return; // No change needed
    }
    
    _visibleStart = startIndex;
    _visibleEnd = endIndex;
    
    // Remove nodes outside visible range
    for (const [idx, node] of _renderedNodes) {
      if (idx < startIndex || idx >= endIndex) {
        node.remove();
        _renderedNodes.delete(idx);
      }
    }
    
    // Add nodes in visible range
    const fragment = document.createDocumentFragment();
    for (let i = startIndex; i < endIndex; i++) {
      if (!_renderedNodes.has(i) && _filteredItems[i]) {
        const node = _renderItem(_filteredItems[i], i);
        node.style.position = 'absolute';
        node.style.top = `${i * ITEM_HEIGHT}px`;
        node.style.left = '0';
        node.style.right = '0';
        node.style.height = `${ITEM_HEIGHT}px`;
        fragment.appendChild(node);
        _renderedNodes.set(i, node);
      }
    }
    
    _content.appendChild(fragment);
  }

  function _onScroll() {
    _scrollTop = _viewport.scrollTop;
    requestAnimationFrame(_updateViewport);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SELECTION
  // ═══════════════════════════════════════════════════════════════════════════

  function _selectById(id) {
    const prevId = _selectedId;
    _selectedId = id;
    
    // Update visual selection
    _renderedNodes.forEach((node, idx) => {
      const nodeId = node.dataset.id;
      node.classList.toggle('xr-selected', nodeId === id);
    });
    
    // Callback
    if (_onSelect && id !== prevId) {
      const entry = _entries.find(e => e.id === id);
      _onSelect(entry);
    }
  }

  function _scrollToId(id) {
    const index = _filteredItems.findIndex(item => item.entry.id === id);
    if (index === -1) return;
    
    const targetTop = index * ITEM_HEIGHT;
    const viewportHeight = _viewport.clientHeight;
    const center = targetTop - (viewportHeight / 2) + (ITEM_HEIGHT / 2);
    
    _viewport.scrollTop = Math.max(0, center);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // KEYBOARD NAVIGATION
  // ═══════════════════════════════════════════════════════════════════════════

  function selectNext() {
    const currentIndex = _filteredItems.findIndex(item => item.entry.id === _selectedId);
    const newIndex = Math.min(currentIndex + 1, _filteredItems.length - 1);
    if (newIndex >= 0 && _filteredItems[newIndex]) {
      _selectById(_filteredItems[newIndex].entry.id);
      _scrollToId(_filteredItems[newIndex].entry.id);
    }
  }

  function selectPrev() {
    const currentIndex = _filteredItems.findIndex(item => item.entry.id === _selectedId);
    const newIndex = Math.max(currentIndex - 1, 0);
    if (_filteredItems[newIndex]) {
      _selectById(_filteredItems[newIndex].entry.id);
      _scrollToId(_filteredItems[newIndex].entry.id);
    }
  }

  function selectFirst() {
    if (_filteredItems[0]) {
      _selectById(_filteredItems[0].entry.id);
      _viewport.scrollTop = 0;
    }
  }

  function selectLast() {
    const last = _filteredItems[_filteredItems.length - 1];
    if (last) {
      _selectById(last.entry.id);
      _viewport.scrollTop = _viewport.scrollHeight;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FILTER BAR
  // ═══════════════════════════════════════════════════════════════════════════

  function _buildFilterBar() {
    const bar = document.createElement('div');
    bar.className = 'xr-filter-bar';
    
    // Status filters (API tab only)
    if (_activeTab === 'api') {
      const statuses = ['all', '2xx', '3xx', '4xx', '5xx'];
      statuses.forEach(s => {
        const btn = document.createElement('button');
        btn.className = 'xr-filter-btn';
        btn.dataset.filter = s;
        btn.textContent = s === 'all' ? 'All' : s;
        
        const isActive = s === 'all' 
          ? _filters.statusCodes.length === 0
          : _filters.statusCodes.includes(s);
        if (isActive) btn.classList.add('xr-active');
        
        btn.addEventListener('click', () => {
          if (s === 'all') {
            _filters.statusCodes = [];
          } else {
            const idx = _filters.statusCodes.indexOf(s);
            if (idx >= 0) {
              _filters.statusCodes.splice(idx, 1);
            } else {
              _filters.statusCodes.push(s);
            }
          }
          refresh();
        });
        
        bar.appendChild(btn);
      });
    }
    
    // Type filters
    const types = [
      { val: 'fetch', icon: '📡' },
      { val: 'xhr', icon: '🔗' },
      { val: 'log', icon: '📋' },
    ];
    
    types.forEach(({ val, icon }) => {
      const btn = document.createElement('button');
      btn.className = 'xr-filter-btn';
      btn.dataset.filterType = val;
      btn.textContent = icon;
      btn.title = val;
      
      if (_filters.types.includes(val)) btn.classList.add('xr-active');
      
      btn.addEventListener('click', () => {
        const idx = _filters.types.indexOf(val);
        if (idx >= 0) {
          _filters.types.splice(idx, 1);
        } else {
          _filters.types.push(val);
        }
        refresh();
      });
      
      bar.appendChild(btn);
    });
    
    return bar;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  function _formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour12: false });
  }

  function _formatSize(bytes) {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }

  function _extractPath(url) {
    try {
      return new URL(url).pathname;
    } catch {
      return url;
    }
  }

  function _escapeHtml(str) {
    return str.replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════════════════════

  function init(container, options = {}) {
    _container = container;
    _onSelect = options.onSelect;
    _onContextMenu = options.onContextMenu;
    _activeTab = options.activeTab || 'api';
    
    // Build DOM structure
    _container.innerHTML = '';
    
    _filterBar = _buildFilterBar();
    _container.appendChild(_filterBar);
    
    _viewport = document.createElement('div');
    _viewport.className = 'xr-list-viewport';
    _viewport.style.cssText = `
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      position: relative;
    `;
    
    _spacer = document.createElement('div');
    _spacer.className = 'xr-list-spacer';
    _spacer.style.cssText = 'width: 100%; pointer-events: none;';
    
    _content = document.createElement('div');
    _content.className = 'xr-list-content';
    _content.style.cssText = 'position: relative;';
    
    _viewport.appendChild(_spacer);
    _viewport.appendChild(_content);
    _container.appendChild(_viewport);
    
    _viewport.addEventListener('scroll', _onScroll, { passive: true });
    
    return {
      setEntries,
      setFilter,
      setTab,
      setSearch,
      refresh,
      selectNext,
      selectPrev,
      selectFirst,
      selectLast,
      getSelectedId: () => _selectedId,
      setSelectedId: _selectById,
      setPinned: (ids) => { _pinnedIds = new Set(ids); refresh(); },
      setExpandedGroups: (keys) => { _expandedGroups = new Set(keys); refresh(); },
      getExpandedGroups: () => _expandedGroups,
      destroy,
    };
  }

  function setEntries(entries) {
    _entries = entries;
    refresh();
  }

  function setFilter(filters) {
    _filters = { ...filters };
    refresh();
  }

  function setTab(tab) {
    _activeTab = tab;
    
    // Rebuild filter bar for new tab
    if (_filterBar) {
      _filterBar.remove();
      _filterBar = _buildFilterBar();
      _container.insertBefore(_filterBar, _viewport);
    }
    
    refresh();
  }

  function setSearch(query) {
    _searchQuery = query;
    refresh();
  }

  function refresh() {
    // Apply filters and build flat list
    const filtered = _applyFilters(_entries);
    _filteredItems = _buildFlatList(filtered);
    
    // Clear rendered nodes
    _renderedNodes.forEach(node => node.remove());
    _renderedNodes.clear();
    _visibleStart = 0;
    _visibleEnd = 0;
    
    // Render empty state if no items
    if (_filteredItems.length === 0) {
      const icon = _activeTab === 'api' ? '◈' : '◉';
      const title = _searchQuery ? 'No matches' : `No ${_activeTab === 'api' ? 'requests' : 'logs'} yet`;
      const desc = _searchQuery
        ? 'Try a different search term.'
        : _activeTab === 'api'
          ? 'Make a fetch/XHR call on the page.'
          : 'Use console.log() on the page.';
      
      _content.innerHTML = `
        <div class="xr-empty-state">
          <div class="xr-empty-icon">${icon}</div>
          <div class="xr-empty-title">${title}</div>
          <div class="xr-empty-desc">${desc}</div>
        </div>
      `;
      _spacer.style.height = '0';
      return;
    }
    
    _content.innerHTML = '';
    _updateViewport();
  }

  function destroy() {
    if (_viewport) {
      _viewport.removeEventListener('scroll', _onScroll);
    }
    _container = null;
    _viewport = null;
    _content = null;
    _spacer = null;
    _filterBar = null;
    _entries = [];
    _filteredItems = [];
    _renderedNodes.clear();
  }

  return { init };
})();
