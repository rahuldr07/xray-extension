// panel/floating.js — Shadow DOM floating panel
window.XRAY_Panel = (() => {
  'use strict';
  const HOST_ID = '__xray_root__';
  let _root = null, _host = null, _open = false, _entries = [];

  function _buildCSS() {
    return `
:host { all: initial; display: block; }
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
#xr-panel { position: fixed; top: 0; right: 0; width: 460px; height: 100vh; z-index: 2147483647; display: flex; flex-direction: column; background: #1e1e2e; color: #cdd6f4; border-left: 1px solid #313244; font-family: system-ui, sans-serif; font-size: 12px; transform: translateX(102%); transition: transform .24s cubic-bezier(.16,1,.3,1); }
#xr-panel.xr-open { transform: translateX(0); }
.xr-header { display: flex; align-items: center; padding: 8px 12px; border-bottom: 1px solid #313244; background: #11111b; }
.xr-logo { font-weight: 600; margin-right: auto; }
.xr-close { cursor: pointer; padding: 4px; }
.xr-content { flex: 1; overflow: auto; padding: 12px; }
    `;
  }

  function init() {
    if (_root) return;
    _host = document.createElement('div'); _host.id = HOST_ID;
    _root = _host.attachShadow({ mode: 'open' });
    const style = document.createElement('style'); style.textContent = _buildCSS(); _root.appendChild(style);
    const panel = document.createElement('div'); panel.id = 'xr-panel';
    panel.innerHTML = '<div class="xr-header"><span class="xr-logo">XRAY</span><span class="xr-close" id="xr-close">✕</span></div><div class="xr-content" id="xr-content"><p style="color:#6c7086">No entries yet</p></div>';
    _root.appendChild(panel);
    _root.getElementById('xr-close').addEventListener('click', hide);
    document.body.appendChild(_host);
  }

  function show() { init(); _root.getElementById('xr-panel').classList.add('xr-open'); _open = true; }
  function hide() { if (!_root) return; _root.getElementById('xr-panel').classList.remove('xr-open'); _open = false; }
  function toggle() { _open ? hide() : show(); }
  function add(entry) { _entries.push(entry); }

  return { init, show, hide, toggle, add };
})();
