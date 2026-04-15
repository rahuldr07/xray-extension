// panel/shortcuts.js — Keyboard shortcut handler
window.XRAY_Shortcuts = (() => {
  'use strict';

  let _panel = null;

  function init(panel) {
    _panel = panel;
    document.addEventListener('keydown', _onKeyDown, true);
  }

  function destroy() {
    document.removeEventListener('keydown', _onKeyDown, true);
    _panel = null;
  }

  function _isInInput(e) {
    // composedPath() pierces Shadow DOM — gives us the real target element
    const path = e.composedPath && e.composedPath();
    const target = (path && path[0]) || e.target;
    const tag = (target.tagName || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || target.isContentEditable;
  }

  function _onKeyDown(e) {
    if (!_panel) return;

    const inInput = _isInInput(e);

    // Ctrl/Cmd+Shift+X — toggle locally for reliability.
    // We mark the event so other listeners don't process it again.
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key?.toLowerCase() === 'x' || e.code === 'KeyX')) {
      if (e.__xrayToggleHandled) return;
      e.__xrayToggleHandled = true;
      e.preventDefault();
      e.stopPropagation();
      window.__XRAY_lastToggleShortcutTs = Date.now();
      console.debug('[XRAY] Keyboard chord detected in panel, toggling locally');
      _panel.toggle();
      return;
    }

    if (!_panel.isOpen()) return;

    // Ctrl/Cmd+K is owned by command-palette-v2.js.
    if ((e.ctrlKey || e.metaKey) && e.key?.toLowerCase() === 'k' && !inInput) {
      console.debug('[XRAY] Ctrl/Cmd+K delegated to command palette');
      return;
    }

    // Ctrl+F — pane search if entry selected, else fuzzy search
    if (e.ctrlKey && e.key === 'f' && !inInput) {
      e.preventDefault();
      if (_panel.hasSelection()) {
        _panel.paneSearchFocus();
      } else {
        _panel.focusSearch();
      }
      return;
    }

    // Escape — close panel (unless in a text input)
    if (e.key === 'Escape' && !inInput) {
      if (e.__xrayOverlayHandled) return;
      if (typeof _panel.closeTopOverlay === 'function' && _panel.closeTopOverlay()) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      e.preventDefault();
      _panel.hide();
      return;
    }

    // The remaining shortcuts only fire when not in an input field
    if (inInput) return;

    // Shift+W — collapse all tree nodes
    if (e.shiftKey && e.key.toLowerCase() === 'w') {
      e.preventDefault();
      _panel.expandAll(false);
      return;
    }

    switch (e.key.toLowerCase()) {
      case '/':         e.preventDefault(); _panel.focusSearch();   break;
      case 't':         e.preventDefault(); _panel.setView('tree'); break;
      case 'g':         e.preventDefault(); _panel.setView('grid'); break;
      case 'r':         e.preventDefault(); _panel.setView('raw');  break;
      case 'd':         e.preventDefault(); _panel.setView('diff'); break;
      case 'w':         e.preventDefault(); _panel.setView('waterfall'); break;
      case 'c':         e.preventDefault(); _panel.copySelected();  break;
      case 's':         e.preventDefault(); _panel.pinSelected();   break;
      case 'e':         e.preventDefault(); _panel.openExport();    break;
      case 'arrowdown': e.preventDefault(); _panel.selectNext(1);   break;
      case 'arrowup':   e.preventDefault(); _panel.selectNext(-1);  break;
    }
  }

  return { init, destroy };
})();
