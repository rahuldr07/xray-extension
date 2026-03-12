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

  function _onKeyDown(e) {
    if (!_panel) return;

    const tag = (e.target.tagName || '').toLowerCase();
    const inInput = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;

    // Ctrl+Shift+X — toggle (always fires regardless of focus)
    if (e.ctrlKey && e.shiftKey && e.key === 'X') {
      e.preventDefault();
      e.stopPropagation();
      _panel.toggle();
      return;
    }

    if (!_panel.isOpen()) return;

    // Ctrl+F — focus search
    if (e.ctrlKey && e.key === 'f') {
      e.preventDefault();
      _panel.focusSearch();
      return;
    }

    // Escape — close panel (unless in a text input)
    if (e.key === 'Escape' && !inInput) {
      e.preventDefault();
      _panel.hide();
      return;
    }

    // The remaining shortcuts only fire when not in an input field
    if (inInput) return;

    switch (e.key.toLowerCase()) {
      case 't': e.preventDefault(); _panel.setView('tree');  break;
      case 'g': e.preventDefault(); _panel.setView('grid');  break;
      case 'r': e.preventDefault(); _panel.setView('raw');   break;
      case 'd': e.preventDefault(); _panel.setView('diff');  break;
      case 'c': e.preventDefault(); _panel.copySelected();   break;
      case 's': e.preventDefault(); _panel.pinSelected();    break;
      case 'e': e.preventDefault(); _panel.expandAll(true);  break;
      case 'w': e.preventDefault(); _panel.expandAll(false); break;
      case 'arrowdown': e.preventDefault(); _panel.selectNext(1);  break;
      case 'arrowup':   e.preventDefault(); _panel.selectNext(-1); break;
    }
  }

  return { init, destroy };
})();
