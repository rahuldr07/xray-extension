// panel/virtual-list.js — High-performance virtual scrolling for large lists
// Renders only visible items, handles 100K+ entries smoothly
window.XRAY_VirtualList = (() => {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════════
  
  const OVERSCAN = 5;           // Extra items to render above/below viewport
  const ITEM_HEIGHT = 32;       // Default item height in pixels
  const SCROLL_DEBOUNCE = 16;   // ~1 frame

  // ═══════════════════════════════════════════════════════════════════════════
  // VIRTUAL LIST CLASS
  // ═══════════════════════════════════════════════════════════════════════════

  class VirtualList {
    constructor(options) {
      this.container = options.container;
      this.items = options.items || [];
      this.itemHeight = options.itemHeight || ITEM_HEIGHT;
      this.renderItem = options.renderItem;
      this.onSelect = options.onSelect;
      this.className = options.className || '';
      
      this._scrollTop = 0;
      this._visibleStart = 0;
      this._visibleEnd = 0;
      this._renderedItems = new Map(); // index -> DOM element
      this._selectedIndex = -1;
      this._scrollTimer = null;
      
      this._init();
    }

    _init() {
      // Create scroll container
      this._viewport = document.createElement('div');
      this._viewport.className = 'xr-vlist-viewport ' + this.className;
      this._viewport.style.cssText = `
        overflow-y: auto;
        overflow-x: hidden;
        height: 100%;
        position: relative;
      `;
      
      // Create spacer for total scroll height
      this._spacer = document.createElement('div');
      this._spacer.className = 'xr-vlist-spacer';
      this._spacer.style.cssText = `
        width: 100%;
        pointer-events: none;
      `;
      
      // Create content container for rendered items
      this._content = document.createElement('div');
      this._content.className = 'xr-vlist-content';
      this._content.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
      `;
      
      this._viewport.appendChild(this._spacer);
      this._viewport.appendChild(this._content);
      this.container.appendChild(this._viewport);
      
      // Bind scroll handler
      this._viewport.addEventListener('scroll', this._onScroll.bind(this), { passive: true });
      
      // Initial render
      this._updateSpacerHeight();
      this._render();
    }

    _onScroll() {
      this._scrollTop = this._viewport.scrollTop;
      
      // Debounce render
      if (this._scrollTimer) return;
      
      this._scrollTimer = setTimeout(() => {
        this._scrollTimer = null;
        this._render();
      }, SCROLL_DEBOUNCE);
    }

    _updateSpacerHeight() {
      const totalHeight = this.items.length * this.itemHeight;
      this._spacer.style.height = `${totalHeight}px`;
    }

    _render() {
      const viewportHeight = this._viewport.clientHeight;
      const scrollTop = this._scrollTop;
      
      // Calculate visible range
      const startIndex = Math.max(0, Math.floor(scrollTop / this.itemHeight) - OVERSCAN);
      const endIndex = Math.min(
        this.items.length,
        Math.ceil((scrollTop + viewportHeight) / this.itemHeight) + OVERSCAN
      );
      
      // Skip if range unchanged
      if (startIndex === this._visibleStart && endIndex === this._visibleEnd) {
        return;
      }
      
      this._visibleStart = startIndex;
      this._visibleEnd = endIndex;
      
      // Remove items outside visible range
      for (const [index, el] of this._renderedItems) {
        if (index < startIndex || index >= endIndex) {
          el.remove();
          this._renderedItems.delete(index);
        }
      }
      
      // Add items in visible range
      for (let i = startIndex; i < endIndex; i++) {
        if (!this._renderedItems.has(i)) {
          const item = this.items[i];
          const el = this.renderItem(item, i, i === this._selectedIndex);
          el.style.position = 'absolute';
          el.style.top = `${i * this.itemHeight}px`;
          el.style.left = '0';
          el.style.right = '0';
          el.style.height = `${this.itemHeight}px`;
          el.dataset.index = i;
          
          // Click handler
          el.addEventListener('click', () => {
            this.select(i);
            if (this.onSelect) this.onSelect(item, i);
          });
          
          this._content.appendChild(el);
          this._renderedItems.set(i, el);
        }
      }
      
      // Position content container
      this._content.style.top = `${startIndex * this.itemHeight}px`;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════════

    setItems(items) {
      this.items = items;
      this._renderedItems.clear();
      this._content.innerHTML = '';
      this._visibleStart = 0;
      this._visibleEnd = 0;
      this._selectedIndex = -1;
      this._updateSpacerHeight();
      this._render();
    }

    getItems() {
      return this.items;
    }

    select(index) {
      const prevIndex = this._selectedIndex;
      this._selectedIndex = index;
      
      // Update previous selection
      if (prevIndex !== -1 && this._renderedItems.has(prevIndex)) {
        this._renderedItems.get(prevIndex).classList.remove('xr-selected');
      }
      
      // Update new selection
      if (index !== -1 && this._renderedItems.has(index)) {
        this._renderedItems.get(index).classList.add('xr-selected');
      }
    }

    selectById(id, idKey = 'id') {
      const index = this.items.findIndex(item => item[idKey] === id);
      if (index !== -1) {
        this.select(index);
        this.scrollToIndex(index);
      }
      return index;
    }

    getSelectedIndex() {
      return this._selectedIndex;
    }

    getSelectedItem() {
      return this._selectedIndex >= 0 ? this.items[this._selectedIndex] : null;
    }

    scrollToIndex(index, position = 'center') {
      if (index < 0 || index >= this.items.length) return;
      
      const itemTop = index * this.itemHeight;
      const viewportHeight = this._viewport.clientHeight;
      
      let scrollTop;
      switch (position) {
        case 'start':
          scrollTop = itemTop;
          break;
        case 'end':
          scrollTop = itemTop - viewportHeight + this.itemHeight;
          break;
        case 'center':
        default:
          scrollTop = itemTop - (viewportHeight / 2) + (this.itemHeight / 2);
      }
      
      this._viewport.scrollTop = Math.max(0, scrollTop);
    }

    scrollToItem(item, idKey = 'id') {
      const index = this.items.findIndex(i => i[idKey] === item[idKey]);
      if (index !== -1) this.scrollToIndex(index);
    }

    refresh() {
      this._renderedItems.clear();
      this._content.innerHTML = '';
      this._visibleStart = 0;
      this._visibleEnd = 0;
      this._updateSpacerHeight();
      this._render();
    }

    destroy() {
      this._viewport.remove();
      this._renderedItems.clear();
    }

    // Keyboard navigation
    selectNext() {
      const newIndex = Math.min(this._selectedIndex + 1, this.items.length - 1);
      if (newIndex !== this._selectedIndex) {
        this.select(newIndex);
        this.scrollToIndex(newIndex, 'center');
        if (this.onSelect) this.onSelect(this.items[newIndex], newIndex);
      }
    }

    selectPrev() {
      const newIndex = Math.max(this._selectedIndex - 1, 0);
      if (newIndex !== this._selectedIndex) {
        this.select(newIndex);
        this.scrollToIndex(newIndex, 'center');
        if (this.onSelect) this.onSelect(this.items[newIndex], newIndex);
      }
    }

    selectFirst() {
      if (this.items.length > 0) {
        this.select(0);
        this.scrollToIndex(0, 'start');
        if (this.onSelect) this.onSelect(this.items[0], 0);
      }
    }

    selectLast() {
      if (this.items.length > 0) {
        const lastIndex = this.items.length - 1;
        this.select(lastIndex);
        this.scrollToIndex(lastIndex, 'end');
        if (this.onSelect) this.onSelect(this.items[lastIndex], lastIndex);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FACTORY
  // ═══════════════════════════════════════════════════════════════════════════

  function create(options) {
    return new VirtualList(options);
  }

  return { create, VirtualList };
})();
