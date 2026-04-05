// panel/hud-core.js — Sliding HUD Panel Architecture
// GPU-accelerated, dock-agnostic, resize-aware shell

window.XRAY_HUD = (() => {
  'use strict';

  // ══════════════════════════════════════════════════════════════════════════
  // Constants
  // ══════════════════════════════════════════════════════════════════════════
  const STORAGE_KEY = 'xray_hud_v1';
  const MIN_SIZE = 320;
  const SNAP_THRESHOLDS = [0.30, 0.50, 0.70, 1.0]; // Snap points as viewport ratios
  const SPRING_CURVE = 'cubic-bezier(0.16, 1, 0.3, 1)'; // Vercel/Linear spring

  // ══════════════════════════════════════════════════════════════════════════
  // State
  // ══════════════════════════════════════════════════════════════════════════
  const _state = {
    isOpen: false,
    dockMode: 'right',        // 'right' | 'bottom'
    size: 680,                // Width (right) or Height (bottom) in px
    opacity: 0.92,            // 0-1, background opacity
    backdropBlur: true,       // Enable glassmorphism
    isResizing: false,
    isDraggingDock: false,
  };

  let _host = null;     // Shadow host element
  let _root = null;     // Shadow root
  let _panel = null;    // Main panel element
  let _resizeHandle = null;
  let _dockToggle = null;
  let _listeners = [];  // Cleanup registry

  // ══════════════════════════════════════════════════════════════════════════
  // Persistence
  // ══════════════════════════════════════════════════════════════════════════
  function _loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.assign(_state, {
          dockMode: parsed.dockMode || 'right',
          size: Math.max(MIN_SIZE, parsed.size || 680),
          opacity: Math.min(1, Math.max(0, parsed.opacity ?? 0.92)),
          backdropBlur: parsed.backdropBlur !== false,
        });
      }
    } catch {}
  }

  function _saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        dockMode: _state.dockMode,
        size: _state.size,
        opacity: _state.opacity,
        backdropBlur: _state.backdropBlur,
      }));
    } catch {}
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CSS Generation
  // ══════════════════════════════════════════════════════════════════════════
  function _buildCSS() {
    return `
/* ─────────────────────────────────────────────────────────────────────────────
   HUD Core Shell — GPU-accelerated, dock-agnostic
   ───────────────────────────────────────────────────────────────────────────── */

:host {
  all: initial;
  display: block;
  position: fixed !important;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  z-index: 2147483647;
  pointer-events: none;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* ─── Panel Container ────────────────────────────────────────────────────── */
.xr-hud {
  position: fixed;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
  
  /* GPU layer promotion */
  will-change: transform, opacity;
  contain: layout style paint;
  
  /* Visual isolation */
  background: rgba(10, 10, 12, var(--hud-opacity, 0.92));
  color: #fafafa;
  font-size: 12px;
  line-height: 1.5;
  overflow: hidden;
  
  /* Transition only transform for 60fps */
  transition: transform 0.32s ${SPRING_CURVE}, opacity 0.2s ease-out;
}

/* Glassmorphism layer */
.xr-hud.xr-blur {
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
}

/* ─── Right Dock Mode ────────────────────────────────────────────────────── */
.xr-hud.xr-dock-right {
  top: 0;
  right: 0;
  width: var(--hud-size, 680px);
  height: 100vh;
  max-width: 95vw;
  min-width: ${MIN_SIZE}px;
  border-left: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 
    -12px 0 48px rgba(0, 0, 0, 0.5),
    -1px 0 0 rgba(255, 255, 255, 0.03),
    inset 1px 0 0 rgba(255, 255, 255, 0.02);
  
  /* Hidden state: slide right */
  transform: translateX(102%);
}

.xr-hud.xr-dock-right.xr-open {
  transform: translateX(0);
}

/* ─── Bottom Dock Mode ───────────────────────────────────────────────────── */
.xr-hud.xr-dock-bottom {
  bottom: 0;
  left: 0;
  right: 0;
  width: 100vw;
  height: var(--hud-size, 400px);
  max-height: 80vh;
  min-height: ${MIN_SIZE}px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 
    0 -12px 48px rgba(0, 0, 0, 0.5),
    0 -1px 0 rgba(255, 255, 255, 0.03),
    inset 0 1px 0 rgba(255, 255, 255, 0.02);
  
  /* Hidden state: slide down */
  transform: translateY(102%);
}

.xr-hud.xr-dock-bottom.xr-open {
  transform: translateY(0);
}

/* ─── Resize Handle (Shared) ─────────────────────────────────────────────── */
.xr-resize-handle {
  position: absolute;
  background: transparent;
  z-index: 100;
  transition: background 0.15s;
}

.xr-resize-handle::after {
  content: '';
  position: absolute;
  background: rgba(59, 130, 246, 0);
  transition: background 0.15s;
  border-radius: 2px;
}

.xr-resize-handle:hover::after,
.xr-resize-handle.xr-active::after {
  background: rgba(59, 130, 246, 0.6);
}

/* Right dock: vertical resize on left edge */
.xr-dock-right .xr-resize-handle {
  top: 0;
  left: 0;
  width: 6px;
  height: 100%;
  cursor: ew-resize;
}

.xr-dock-right .xr-resize-handle::after {
  top: 50%;
  left: 1px;
  width: 3px;
  height: 48px;
  transform: translateY(-50%);
}

/* Bottom dock: horizontal resize on top edge */
.xr-dock-bottom .xr-resize-handle {
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  cursor: ns-resize;
}

.xr-dock-bottom .xr-resize-handle::after {
  left: 50%;
  top: 1px;
  width: 48px;
  height: 3px;
  transform: translateX(-50%);
}

/* ─── Dock Toggle Button ─────────────────────────────────────────────────── */
.xr-dock-toggle {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: rgba(39, 39, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #a1a1aa;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;
  z-index: 101;
}

.xr-dock-toggle:hover {
  background: rgba(63, 63, 70, 0.9);
  color: #fafafa;
  transform: scale(1.05);
}

.xr-dock-toggle:active {
  transform: scale(0.95);
}

/* Position dock toggle based on mode */
.xr-dock-right .xr-dock-toggle {
  top: 10px;
  left: 10px;
}

.xr-dock-bottom .xr-dock-toggle {
  top: 10px;
  right: 48px;
}

/* ─── Snap Indicators (shown during resize) ──────────────────────────────── */
.xr-snap-indicator {
  position: fixed;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s;
  z-index: 2147483646;
}

.xr-snap-indicator.xr-visible {
  opacity: 1;
}

.xr-snap-indicator.xr-right {
  top: 0;
  width: 2px;
  height: 100vh;
  background: linear-gradient(180deg, 
    rgba(59, 130, 246, 0) 0%,
    rgba(59, 130, 246, 0.4) 20%,
    rgba(59, 130, 246, 0.4) 80%,
    rgba(59, 130, 246, 0) 100%
  );
}

.xr-snap-indicator.xr-bottom {
  left: 0;
  width: 100vw;
  height: 2px;
  background: linear-gradient(90deg, 
    rgba(59, 130, 246, 0) 0%,
    rgba(59, 130, 246, 0.4) 20%,
    rgba(59, 130, 246, 0.4) 80%,
    rgba(59, 130, 246, 0) 100%
  );
}

/* ─── Content Slot ───────────────────────────────────────────────────────── */
.xr-hud-content {
  flex: 1;
  min-height: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ─── Keyboard Hint (shown briefly on toggle) ────────────────────────────── */
.xr-kbd-hint {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  font-size: 11px;
  color: #a1a1aa;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: all 0.25s ${SPRING_CURVE};
}

.xr-kbd-hint kbd {
  display: inline-block;
  padding: 2px 6px;
  margin: 0 2px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: #fafafa;
}

.xr-kbd-hint.xr-visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* ─── Utility ────────────────────────────────────────────────────────────── */
.xr-hud.xr-resizing {
  transition: none !important;
  user-select: none !important;
}

.xr-hud.xr-resizing * {
  user-select: none !important;
  pointer-events: none !important;
}

.xr-hud.xr-resizing .xr-resize-handle {
  pointer-events: auto !important;
}
`;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // DOM Construction
  // ══════════════════════════════════════════════════════════════════════════
  function _buildShell() {
    const panel = document.createElement('div');
    panel.className = `xr-hud xr-dock-${_state.dockMode}`;
    if (_state.backdropBlur) panel.classList.add('xr-blur');
    panel.style.setProperty('--hud-size', `${_state.size}px`);
    panel.style.setProperty('--hud-opacity', _state.opacity.toString());

    // Resize handle
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'xr-resize-handle';
    panel.appendChild(resizeHandle);

    // Dock toggle button
    const dockToggle = document.createElement('button');
    dockToggle.className = 'xr-dock-toggle';
    dockToggle.title = 'Toggle dock position (Ctrl+Shift+D)';
    dockToggle.innerHTML = _state.dockMode === 'right' ? '⇊' : '⇉';
    panel.appendChild(dockToggle);

    // Content slot (where XRAY_Panel content goes)
    const content = document.createElement('div');
    content.className = 'xr-hud-content';
    content.id = 'xr-hud-content';
    panel.appendChild(content);

    // Keyboard hint
    const kbdHint = document.createElement('div');
    kbdHint.className = 'xr-kbd-hint';
    kbdHint.innerHTML = '<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd> to toggle';
    panel.appendChild(kbdHint);

    return { panel, resizeHandle, dockToggle, content, kbdHint };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Resize Logic (with snap points)
  // ══════════════════════════════════════════════════════════════════════════
  function _initResize() {
    let startPos = 0;
    let startSize = 0;
    let snapIndicator = null;

    function getViewportSize() {
      return _state.dockMode === 'right' ? window.innerWidth : window.innerHeight;
    }

    function findSnapPoint(currentSize) {
      const vpSize = getViewportSize();
      const ratio = currentSize / vpSize;
      
      // Find closest snap threshold within 30px
      for (const threshold of SNAP_THRESHOLDS) {
        const snapSize = vpSize * threshold;
        if (Math.abs(currentSize - snapSize) < 30) {
          return { size: snapSize, ratio: threshold };
        }
      }
      return null;
    }

    function createSnapIndicator() {
      const indicator = document.createElement('div');
      indicator.className = `xr-snap-indicator xr-${_state.dockMode}`;
      document.body.appendChild(indicator);
      return indicator;
    }

    function updateSnapIndicator(snapPoint) {
      if (!snapIndicator) return;
      
      if (snapPoint) {
        const vpSize = getViewportSize();
        if (_state.dockMode === 'right') {
          snapIndicator.style.right = `${snapPoint.size}px`;
        } else {
          snapIndicator.style.bottom = `${snapPoint.size}px`;
        }
        snapIndicator.classList.add('xr-visible');
      } else {
        snapIndicator.classList.remove('xr-visible');
      }
    }

    function onMouseDown(e) {
      e.preventDefault();
      _state.isResizing = true;
      _panel.classList.add('xr-resizing');
      _resizeHandle.classList.add('xr-active');
      
      startPos = _state.dockMode === 'right' ? e.clientX : e.clientY;
      startSize = _state.size;
      
      snapIndicator = createSnapIndicator();
      
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }

    function onMouseMove(e) {
      const vpSize = getViewportSize();
      let delta, newSize;
      
      if (_state.dockMode === 'right') {
        delta = startPos - e.clientX;
        newSize = Math.max(MIN_SIZE, Math.min(vpSize * 0.95, startSize + delta));
      } else {
        delta = startPos - e.clientY;
        newSize = Math.max(MIN_SIZE, Math.min(vpSize * 0.80, startSize + delta));
      }
      
      // Check for snap points
      const snapPoint = findSnapPoint(newSize);
      updateSnapIndicator(snapPoint);
      
      // Apply size
      _state.size = newSize;
      _panel.style.setProperty('--hud-size', `${newSize}px`);
    }

    function onMouseUp() {
      // Snap to nearest threshold if close
      const snapPoint = findSnapPoint(_state.size);
      if (snapPoint) {
        _state.size = Math.round(snapPoint.size);
        _panel.style.setProperty('--hud-size', `${_state.size}px`);
      }
      
      _state.isResizing = false;
      _panel.classList.remove('xr-resizing');
      _resizeHandle.classList.remove('xr-active');
      
      if (snapIndicator) {
        snapIndicator.remove();
        snapIndicator = null;
      }
      
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      
      _saveState();
    }

    _resizeHandle.addEventListener('mousedown', onMouseDown);
    _listeners.push(() => _resizeHandle.removeEventListener('mousedown', onMouseDown));
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Dock Mode Toggle
  // ══════════════════════════════════════════════════════════════════════════
  function _setDockMode(mode) {
    if (mode === _state.dockMode) return;
    
    const wasOpen = _state.isOpen;
    
    // Close with animation
    if (wasOpen) {
      _panel.classList.remove('xr-open');
    }
    
    // Switch mode after animation completes
    setTimeout(() => {
      _panel.classList.remove(`xr-dock-${_state.dockMode}`);
      _state.dockMode = mode;
      _panel.classList.add(`xr-dock-${_state.dockMode}`);
      
      // Adjust size for new orientation
      const vpSize = mode === 'right' ? window.innerWidth : window.innerHeight;
      if (_state.size > vpSize * 0.8) {
        _state.size = Math.round(vpSize * 0.5);
        _panel.style.setProperty('--hud-size', `${_state.size}px`);
      }
      
      // Update toggle icon
      _dockToggle.innerHTML = mode === 'right' ? '⇊' : '⇉';
      _dockToggle.title = mode === 'right' 
        ? 'Switch to bottom dock' 
        : 'Switch to right dock';
      
      // Reopen if was open
      if (wasOpen) {
        requestAnimationFrame(() => {
          _panel.classList.add('xr-open');
        });
      }
      
      _saveState();
      
      // Dispatch event for panels to adjust
      _host.dispatchEvent(new CustomEvent('xray-dock-change', {
        detail: { mode: _state.dockMode }
      }));
    }, wasOpen ? 320 : 0);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Show / Hide with GPU Animation
  // ══════════════════════════════════════════════════════════════════════════
  function _show() {
    if (_state.isOpen) return;
    _state.isOpen = true;
    
    // Force layout before adding class for proper animation
    void _panel.offsetHeight;
    _panel.classList.add('xr-open');
    
    // Show keyboard hint briefly
    const hint = _panel.querySelector('.xr-kbd-hint');
    if (hint) {
      hint.classList.add('xr-visible');
      setTimeout(() => hint.classList.remove('xr-visible'), 2500);
    }
    
    _host.dispatchEvent(new CustomEvent('xray-show'));
  }

  function _hide() {
    if (!_state.isOpen) return;
    _state.isOpen = false;
    _panel.classList.remove('xr-open');
    _host.dispatchEvent(new CustomEvent('xray-hide'));
  }

  function _toggle() {
    _state.isOpen ? _hide() : _show();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Settings API
  // ══════════════════════════════════════════════════════════════════════════
  function _setOpacity(value) {
    _state.opacity = Math.min(1, Math.max(0, value));
    _panel.style.setProperty('--hud-opacity', _state.opacity.toString());
    _saveState();
  }

  function _setBlur(enabled) {
    _state.backdropBlur = !!enabled;
    _panel.classList.toggle('xr-blur', _state.backdropBlur);
    _saveState();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Keyboard Shortcuts
  // ══════════════════════════════════════════════════════════════════════════
  function _initKeyboard() {
    function onKeyDown(e) {
      // Ctrl+Shift+X → Toggle panel
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyX') {
        e.preventDefault();
        e.stopPropagation();
        _toggle();
        return;
      }
      
      // Ctrl+Shift+D → Toggle dock mode
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyD') {
        e.preventDefault();
        e.stopPropagation();
        _setDockMode(_state.dockMode === 'right' ? 'bottom' : 'right');
        return;
      }
      
      // Escape → Close if open
      if (e.key === 'Escape' && _state.isOpen) {
        e.preventDefault();
        _hide();
        return;
      }
    }
    
    document.addEventListener('keydown', onKeyDown, true);
    _listeners.push(() => document.removeEventListener('keydown', onKeyDown, true));
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Initialization
  // ══════════════════════════════════════════════════════════════════════════
  function _init(options = {}) {
    if (_host) return _public; // Already initialized
    
    _loadState();
    
    // Create shadow host
    _host = document.createElement('div');
    _host.id = '__xray_hud__';
    document.documentElement.appendChild(_host);
    
    // Attach shadow DOM for style isolation
    _root = _host.attachShadow({ mode: 'open' });
    
    // Inject styles
    const style = document.createElement('style');
    style.textContent = _buildCSS();
    _root.appendChild(style);
    
    // Build shell
    const shell = _buildShell();
    _panel = shell.panel;
    _resizeHandle = shell.resizeHandle;
    _dockToggle = shell.dockToggle;
    _root.appendChild(_panel);
    
    // Bind resize
    _initResize();
    
    // Bind dock toggle
    _dockToggle.addEventListener('click', () => {
      _setDockMode(_state.dockMode === 'right' ? 'bottom' : 'right');
    });
    
    // Bind keyboard shortcuts
    _initKeyboard();
    
    // Auto-open if requested
    if (options.autoOpen) {
      requestAnimationFrame(() => _show());
    }
    
    return _public;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Cleanup
  // ══════════════════════════════════════════════════════════════════════════
  function _destroy() {
    _listeners.forEach(fn => fn());
    _listeners = [];
    if (_host?.parentNode) {
      _host.parentNode.removeChild(_host);
    }
    _host = null;
    _root = null;
    _panel = null;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Public API
  // ══════════════════════════════════════════════════════════════════════════
  const _public = {
    init: _init,
    destroy: _destroy,
    
    // Visibility
    show: _show,
    hide: _hide,
    toggle: _toggle,
    isOpen: () => _state.isOpen,
    
    // Dock mode
    getDockMode: () => _state.dockMode,
    setDockMode: _setDockMode,
    
    // Settings
    setOpacity: _setOpacity,
    setBlur: _setBlur,
    getOpacity: () => _state.opacity,
    getBlur: () => _state.backdropBlur,
    getSize: () => _state.size,
    getState: () => ({ ..._state }),
    
    // DOM access (for embedding panel content)
    getContentSlot: () => _root?.querySelector('#xr-hud-content'),
    getShadowRoot: () => _root,
    getHost: () => _host,
    
    // Events: 'xray-show', 'xray-hide', 'xray-dock-change'
    on(event, handler) {
      _host?.addEventListener(event, handler);
      return () => _host?.removeEventListener(event, handler);
    },
  };

  return _public;
})();
