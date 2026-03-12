// panel/floating.js — Shadow DOM floating sidebar
window.XRAY_Panel = (() => {
  'use strict';

  const HOST_ID   = '__xray_root__';
  const STORE_KEY = 'panel_state';

  // ── State ─────────────────────────────────────────────────────────────────
  const _state = {
    open:       false,
    activeTab:  'api',       // 'api' | 'logs'
    activeView: 'tree',      // 'tree' | 'raw'
    activeDTab: 'response',  // 'response' | 'request' | 'headers'
    selectedId: null,
    theme:      'catppuccin-mocha',
    filter:     '',
    listWidth:  165,
    entries:    [],          // CapturedEntry[]
  };

  // ── DOM refs ──────────────────────────────────────────────────────────────
  let _root = null;   // shadow root
  let _dom  = {};     // keyed element refs

  // ── CSS ───────────────────────────────────────────────────────────────────
  function _css(vars) {
    const v = Object.entries(vars).map(([k, val]) => `${k}:${val}`).join(';');
    return `
:host { all: initial; }
#xr-panel {
  ${v};
  position: fixed; top: 0; right: 0;
  width: 460px; height: 100vh;
  z-index: 2147483647;
  display: flex; flex-direction: column;
  background: var(--xr-bg); color: var(--xr-text);
  border-left: 1px solid var(--xr-border);
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  font-size: 12px; line-height: 1.5;
  box-shadow: -6px 0 40px rgba(0,0,0,.55);
  transition: transform .22s cubic-bezier(.4,0,.2,1);
  overflow: hidden;
}
#xr-panel.xr-hidden { transform: translateX(102%); }

/* ── Header ── */
.xr-header {
  display: flex; align-items: center; gap: 5px;
  padding: 7px 10px; background: var(--xr-bg2);
  border-bottom: 1px solid var(--xr-border);
  flex-shrink: 0; user-select: none;
}
.xr-logo {
  font-weight: 800; font-size: 12px; letter-spacing: 1px;
  color: var(--xr-accent); margin-right: 4px; flex-shrink: 0;
}
.xr-tabs { display: flex; gap: 2px; }
.xr-tab {
  background: transparent; border: 1px solid transparent;
  border-radius: 5px; color: var(--xr-subtext); cursor: pointer;
  font-size: 11px; font-weight: 600; padding: 3px 9px;
  display: flex; align-items: center; gap: 5px; transition: all .15s;
}
.xr-tab:hover { background: var(--xr-bg3); color: var(--xr-text); }
.xr-tab.xr-active {
  background: var(--xr-bg3); border-color: var(--xr-border); color: var(--xr-accent);
}
.xr-badge {
  background: var(--xr-bg3); border-radius: 10px;
  color: var(--xr-subtext); font-size: 10px;
  min-width: 18px; padding: 0 4px; text-align: center;
}
.xr-tab.xr-active .xr-badge { background: var(--xr-accent); color: var(--xr-bg); }
.xr-spacer { flex: 1; }
.xr-dots { display: flex; align-items: center; gap: 5px; }
.xr-dot {
  border-radius: 50%; cursor: pointer; border: 2px solid transparent;
  height: 11px; width: 11px; opacity: .55; transition: all .15s;
}
.xr-dot:hover { opacity: 1; transform: scale(1.25); }
.xr-dot.xr-active { opacity: 1; border-color: var(--xr-text); }
.xr-ibtn {
  background: transparent; border: none; border-radius: 4px;
  color: var(--xr-overlay); cursor: pointer; font-size: 15px;
  height: 22px; line-height: 1; padding: 0 6px; transition: all .15s;
}
.xr-ibtn:hover { background: var(--xr-bg3); color: var(--xr-text); }

/* ── Body ── */
.xr-body {
  display: flex; flex: 1; min-height: 0; overflow: hidden;
}

/* ── List pane ── */
.xr-list {
  display: flex; flex-direction: column;
  overflow-y: auto; overflow-x: hidden;
  flex-shrink: 0; border-right: 1px solid var(--xr-border);
}
.xr-list-empty {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 8px; padding: 32px 12px;
  color: var(--xr-overlay); text-align: center; flex: 1;
}
.xr-list-empty-icon { font-size: 26px; opacity: .4; }
.xr-list-empty-text { font-size: 11px; line-height: 1.6; }
.xr-entry {
  border-bottom: 1px solid var(--xr-border);
  cursor: pointer; padding: 7px 9px 6px;
  transition: background .1s; position: relative; flex-shrink: 0;
}
.xr-entry:hover { background: var(--xr-bg3); }
.xr-entry.xr-sel {
  background: var(--xr-bg3);
  border-left: 2px solid var(--xr-accent); padding-left: 7px;
}
.xr-entry-top {
  display: flex; align-items: center; gap: 4px; margin-bottom: 2px;
}
.xr-meth {
  border-radius: 3px; font-size: 9px; font-weight: 700;
  padding: 1px 4px; text-transform: uppercase; flex-shrink: 0;
}
.xr-m-get    { background: rgba(137,180,250,.18); color: #89b4fa; }
.xr-m-post   { background: rgba(166,227,161,.18); color: #a6e3a1; }
.xr-m-put    { background: rgba(250,179,135,.18); color: #fab387; }
.xr-m-delete { background: rgba(243,139,168,.18); color: #f38ba8; }
.xr-m-patch  { background: rgba(249,226,175,.18); color: #f9e2af; }
.xr-m-log    { background: rgba(148,226,213,.18); color: #94e2d5; }
.xr-m-warn   { background: rgba(249,226,175,.18); color: #f9e2af; }
.xr-m-error  { background: rgba(243,139,168,.18); color: #f38ba8; }
.xr-stat {
  font-size: 10px; font-weight: 700; margin-left: auto; flex-shrink: 0;
}
.xr-s2 { color: #a6e3a1; } .xr-s3 { color: #89b4fa; }
.xr-s4 { color: #f9e2af; } .xr-s5 { color: #f38ba8; } .xr-s0 { color: #6c7086; }
.xr-entry-path {
  color: var(--xr-subtext); font-size: 11px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.xr-entry-meta {
  display: flex; align-items: center;
  color: var(--xr-overlay); font-size: 10px; gap: 5px; margin-top: 2px;
}
.xr-dec-ok   { color: #a6e3a1; font-weight: 700; }
.xr-dec-fail { color: #f38ba8; }
.xr-pin-icon {
  position: absolute; right: 7px; top: 6px;
  font-size: 10px; color: var(--xr-yellow);
}

/* ── Resize handle ── */
.xr-resize {
  background: transparent; cursor: col-resize;
  flex-shrink: 0; width: 4px; transition: background .15s;
}
.xr-resize:hover, .xr-resize.xr-dragging { background: var(--xr-accent); }

/* ── Detail pane ── */
.xr-detail {
  display: flex; flex: 1; flex-direction: column; min-width: 0; overflow: hidden;
}
.xr-detail-empty {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  flex: 1; gap: 8px; color: var(--xr-overlay); user-select: none;
}
.xr-detail-empty-icon { font-size: 34px; opacity: .3; }
.xr-detail-empty-text { font-size: 12px; }
.xr-dhead {
  background: var(--xr-bg2); border-bottom: 1px solid var(--xr-border);
  flex-shrink: 0; padding: 8px 12px;
}
.xr-dhead-url {
  color: var(--xr-text); font-family: 'Consolas','Fira Code',monospace;
  font-size: 11px; overflow: hidden; text-overflow: ellipsis;
  white-space: nowrap; margin-bottom: 5px;
}
.xr-dhead-meta { display: flex; align-items: center; gap: 14px; }
.xr-dstat { display: flex; flex-direction: column; gap: 1px; }
.xr-dstat-lbl {
  color: var(--xr-overlay); font-size: 9px;
  text-transform: uppercase; letter-spacing: .5px;
}
.xr-dstat-val { color: var(--xr-text); font-size: 12px; font-weight: 600; }
.xr-dhead-actions { display: flex; gap: 4px; margin-left: auto; align-items: center; }
.xr-vbtn {
  background: transparent; border: 1px solid var(--xr-border);
  border-radius: 4px; color: var(--xr-subtext);
  cursor: pointer; font-size: 10px; font-weight: 700;
  padding: 2px 7px; transition: all .15s;
}
.xr-vbtn:hover { background: var(--xr-bg3); color: var(--xr-text); }
.xr-vbtn.xr-active { background: var(--xr-accent); border-color: var(--xr-accent); color: var(--xr-bg); }
.xr-copy-btn {
  background: transparent; border: 1px solid var(--xr-border);
  border-radius: 4px; color: var(--xr-subtext);
  cursor: pointer; font-size: 10px; padding: 2px 7px; transition: all .15s;
}
.xr-copy-btn:hover { background: var(--xr-accent); border-color: var(--xr-accent); color: var(--xr-bg); }

/* ── Detail sub-tabs ── */
.xr-dtabs {
  border-bottom: 1px solid var(--xr-border);
  display: flex; flex-shrink: 0; padding: 0 12px;
}
.xr-dtab {
  background: transparent; border: none;
  border-bottom: 2px solid transparent;
  color: var(--xr-subtext); cursor: pointer;
  font-size: 11px; font-weight: 500;
  padding: 6px 12px; transition: all .15s;
}
.xr-dtab:hover { color: var(--xr-text); }
.xr-dtab.xr-active { border-bottom-color: var(--xr-accent); color: var(--xr-accent); }

/* ── Detail content ── */
.xr-dcont {
  flex: 1; overflow-y: auto; padding: 10px 12px;
  font-family: 'Consolas','Fira Code',monospace; font-size: 12px;
}

/* ── Tree view ── */
.xr-tree-root { line-height: 1.75; }
.xr-line {
  display: flex; align-items: baseline;
  min-height: 21px; border-radius: 3px; padding: 0 2px;
}
.xr-line:hover { background: rgba(255,255,255,.04); }
.xr-tog {
  cursor: pointer; display: inline-flex;
  align-items: center; justify-content: center;
  flex-shrink: 0; font-size: 7px; margin-right: 3px;
  opacity: .55; user-select: none; width: 10px; transition: color .1s;
}
.xr-tog::before { content: '▶'; }
.xr-tog.xr-open::before { content: '▼'; }
.xr-tog.xr-leaf { opacity: 0; pointer-events: none; }
.xr-tog:not(.xr-leaf):hover { opacity: 1; color: var(--xr-accent); }
.xr-key { color: var(--xr-blue); }
.xr-punct, .xr-brack { color: var(--xr-overlay); }
.xr-prev { color: var(--xr-overlay); font-style: italic; }
.xr-val {
  cursor: pointer; border-radius: 2px; padding: 0 1px; transition: background .1s;
}
.xr-val:hover { background: rgba(255,255,255,.1); }
.xr-val.xr-flash { background: var(--xr-accent) !important; color: var(--xr-bg); border-radius: 2px; }
.xr-string   { color: var(--xr-green); }
.xr-number   { color: var(--xr-blue); }
.xr-boolean  { color: var(--xr-orange); }
.xr-null, .xr-undefined { color: var(--xr-overlay); font-style: italic; }

/* ── Raw view ── */
.xr-raw {
  background: var(--xr-bg2); border: 1px solid var(--xr-border);
  border-radius: 6px; color: var(--xr-text);
  font-family: 'Consolas','Fira Code',monospace;
  font-size: 11px; line-height: 1.6; margin: 0;
  overflow: auto; padding: 12px; white-space: pre;
}

/* ── Headers ── */
.xr-htable { border-collapse: collapse; font-size: 11px; width: 100%; }
.xr-htable td {
  padding: 4px 8px; vertical-align: top;
  border-bottom: 1px solid rgba(255,255,255,.05);
}
.xr-htable td:first-child {
  color: var(--xr-blue); font-weight: 500; width: 38%;
  white-space: nowrap; font-family: 'Consolas','Fira Code',monospace;
}
.xr-htable td:last-child { color: var(--xr-subtext); word-break: break-all; }
.xr-hsec {
  color: var(--xr-accent); font-size: 10px; font-weight: 700;
  margin: 10px 0 3px; text-transform: uppercase; letter-spacing: .5px;
}
.xr-empty { color: var(--xr-overlay); padding: 20px; text-align: center; }

/* ── Footer ── */
.xr-footer {
  display: flex; align-items: center; gap: 7px;
  background: var(--xr-bg2); border-top: 1px solid var(--xr-border);
  flex-shrink: 0; padding: 5px 10px;
}
.xr-srchwrap {
  display: flex; align-items: center;
  background: var(--xr-bg3); border: 1px solid var(--xr-border);
  border-radius: 5px; flex: 1; gap: 5px; padding: 4px 8px;
}
.xr-srchwrap:focus-within { border-color: var(--xr-accent); }
.xr-srch-icon { color: var(--xr-overlay); font-size: 11px; flex-shrink: 0; }
.xr-srch {
  background: transparent; border: none;
  color: var(--xr-text); flex: 1; font-family: inherit;
  font-size: 12px; outline: none; width: 100%;
}
.xr-srch::placeholder { color: var(--xr-overlay); }
.xr-count { color: var(--xr-overlay); font-size: 11px; white-space: nowrap; }
.xr-clearbtn {
  background: transparent; border: none; border-radius: 4px;
  color: var(--xr-subtext); cursor: pointer; font-size: 11px;
  padding: 3px 8px; transition: all .15s;
}
.xr-clearbtn:hover { background: var(--xr-red); color: var(--xr-bg); }

/* ── Scrollbar ── */
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--xr-border); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--xr-overlay); }
`;
  }

  // ── Build HTML scaffold ───────────────────────────────────────────────────
  function _buildHTML() {
    const dots = Object.entries(window.XRAY_Themes)
      .map(([id, t]) =>
        `<span class="xr-dot${id === _state.theme ? ' xr-active' : ''}"
               data-theme="${id}" style="background:${t.dot}"
               title="${t.name}"></span>`
      ).join('');

    return `
<div class="xr-header">
  <span class="xr-logo">⬡ XRAY</span>
  <div class="xr-tabs">
    <button class="xr-tab xr-active" data-tab="api">
      API <span class="xr-badge" id="xr-api-cnt">0</span>
    </button>
    <button class="xr-tab" data-tab="logs">
      LOGS <span class="xr-badge" id="xr-log-cnt">0</span>
    </button>
  </div>
  <div class="xr-spacer"></div>
  <div class="xr-dots">${dots}</div>
  <button class="xr-ibtn" id="xr-close" title="Close (Esc)">✕</button>
</div>
<div class="xr-body" id="xr-body">
  <div class="xr-list" id="xr-list" style="width:${_state.listWidth}px">
    <div class="xr-list-empty">
      <div class="xr-list-empty-icon">⬡</div>
      <div class="xr-list-empty-text">Waiting for API calls…<br>Navigate the page to capture requests.</div>
    </div>
  </div>
  <div class="xr-resize" id="xr-resize"></div>
  <div class="xr-detail" id="xr-detail">
    <div class="xr-detail-empty">
      <div class="xr-detail-empty-icon">←</div>
      <div class="xr-detail-empty-text">Select a request to inspect</div>
    </div>
  </div>
</div>
<div class="xr-footer">
  <div class="xr-srchwrap">
    <span class="xr-srch-icon">⌕</span>
    <input type="text" class="xr-srch" id="xr-srch" placeholder="Filter… (Ctrl+F)" autocomplete="off">
  </div>
  <span class="xr-count" id="xr-count">0 entries</span>
  <button class="xr-clearbtn" id="xr-clear">Clear</button>
</div>`;
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  async function init() {
    if (document.getElementById(HOST_ID)) return;

    const theme = window.XRAY_Themes[_state.theme];

    const host = document.createElement('div');
    host.id = HOST_ID;
    _root = host.attachShadow({ mode: 'open' });

    const styleEl = document.createElement('style');
    styleEl.textContent = _css(theme.vars);
    _root.appendChild(styleEl);

    const panel = document.createElement('div');
    panel.id = 'xr-panel';
    panel.className = 'xr-hidden';
    panel.innerHTML = _buildHTML();
    _root.appendChild(panel);

    document.body.appendChild(host);

    // Cache DOM refs
    _dom = {
      panel,
      styleEl,
      list:    _root.getElementById('xr-list'),
      detail:  _root.getElementById('xr-detail'),
      resize:  _root.getElementById('xr-resize'),
      apiCnt:  _root.getElementById('xr-api-cnt'),
      logCnt:  _root.getElementById('xr-log-cnt'),
      count:   _root.getElementById('xr-count'),
      srch:    _root.getElementById('xr-srch'),
      clear:   _root.getElementById('xr-clear'),
      close:   _root.getElementById('xr-close'),
    };

    _bindEvents();
    await _loadState();
    XRAY_Shortcuts.init(_public);
  }

  // ── Event binding ─────────────────────────────────────────────────────────
  function _bindEvents() {
    // Close
    _dom.close.addEventListener('click', () => hide());

    // Tab switch
    _root.querySelectorAll('.xr-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        _state.activeTab = btn.dataset.tab;
        _state.selectedId = null;
        _root.querySelectorAll('.xr-tab').forEach(t => t.classList.remove('xr-active'));
        btn.classList.add('xr-active');
        _renderList();
        _renderDetail();
      });
    });

    // Theme dots
    _root.querySelectorAll('.xr-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        _applyTheme(dot.dataset.theme);
        _root.querySelectorAll('.xr-dot').forEach(d => d.classList.remove('xr-active'));
        dot.classList.add('xr-active');
        XRAY_Store.set('theme', dot.dataset.theme);
      });
    });

    // Search / filter
    _dom.srch.addEventListener('input', () => {
      _state.filter = _dom.srch.value;
      _renderList();
    });

    // Clear
    _dom.clear.addEventListener('click', () => {
      _state.entries = [];
      _state.selectedId = null;
      _renderList();
      _renderDetail();
      _updateCounts();
    });

    // List resize drag
    let resizing = false, startX = 0, startW = 0;
    _dom.resize.addEventListener('pointerdown', (e) => {
      resizing = true; startX = e.clientX; startW = _state.listWidth;
      _dom.resize.classList.add('xr-dragging');
      _dom.resize.setPointerCapture(e.pointerId);
    });
    _dom.resize.addEventListener('pointermove', (e) => {
      if (!resizing) return;
      const w = Math.max(120, Math.min(280, startW + (e.clientX - startX)));
      _state.listWidth = w;
      _dom.list.style.width = `${w}px`;
    });
    _dom.resize.addEventListener('pointerup', () => {
      resizing = false;
      _dom.resize.classList.remove('xr-dragging');
    });
  }

  // ── State persistence ─────────────────────────────────────────────────────
  async function _loadState() {
    const saved = await XRAY_Store.get(STORE_KEY, {});
    if (saved.theme && XRAY_Themes[saved.theme]) {
      _state.theme = saved.theme;
      _applyTheme(_state.theme);
      _root.querySelectorAll('.xr-dot').forEach(d => {
        d.classList.toggle('xr-active', d.dataset.theme === _state.theme);
      });
    }
    if (saved.open) show();
  }

  // ── Theme ─────────────────────────────────────────────────────────────────
  function _applyTheme(name) {
    const t = window.XRAY_Themes[name];
    if (!t) return;
    _state.theme = name;
    // Rebuild CSS with new vars
    _dom.styleEl.textContent = _css(t.vars);
  }

  // ── List rendering ────────────────────────────────────────────────────────
  function _renderList() {
    const list = _dom.list;
    list.innerHTML = '';

    const all = _state.entries.filter(e => e.type === _state.activeTab);
    const filtered = XRAY_Search.filter(all, _state.filter);

    if (filtered.length === 0) {
      list.innerHTML = `
        <div class="xr-list-empty">
          <div class="xr-list-empty-icon">⬡</div>
          <div class="xr-list-empty-text">${
            _state.filter
              ? 'No matches for <em>' + _esc(_state.filter) + '</em>'
              : _state.activeTab === 'api'
                ? 'Waiting for API calls…<br>Navigate the page to capture requests.'
                : 'No console output captured yet.'
          }</div>
        </div>`;
      return;
    }

    filtered.forEach(e => list.appendChild(_makeEntryEl(e)));
  }

  function _appendEntry(entry) {
    if (entry.type !== _state.activeTab) {
      _updateCounts();
      return;
    }
    if (_state.filter && !XRAY_Search.filter([entry], _state.filter).length) {
      _updateCounts();
      return;
    }
    // Remove empty state if present
    const empty = _dom.list.querySelector('.xr-list-empty');
    if (empty) empty.remove();

    _dom.list.appendChild(_makeEntryEl(entry));
    _updateCounts();
  }

  function _makeEntryEl(entry) {
    const el = document.createElement('div');
    el.className = 'xr-entry' + (entry.id === _state.selectedId ? ' xr-sel' : '');
    el.dataset.id = entry.id;

    if (entry.type === 'api') {
      const u = XRAY_Utils;
      const sc = u.statusClass(entry.status);
      const mc = u.methodClass(entry.method);
      const dec = entry.decryptStatus === 'ok'
        ? '<span class="xr-dec-ok" title="Decrypted">⬡</span>'
        : entry.decryptStatus === 'failed'
          ? '<span class="xr-dec-fail" title="Decrypt failed">✗</span>'
          : '';
      el.innerHTML = `
        ${entry.pinned ? '<span class="xr-pin-icon">★</span>' : ''}
        <div class="xr-entry-top">
          <span class="xr-meth ${mc}">${_esc(entry.method)}</span>
          <span class="xr-stat ${sc}">${entry.status || 'ERR'}</span>
        </div>
        <div class="xr-entry-path">${_esc(u.shortPath(entry.url || ''))}</div>
        <div class="xr-entry-meta">
          <span>${u.formatDuration(entry.duration)}</span>
          <span>·</span>
          <span>${u.formatSize(entry.size)}</span>
          ${dec ? '<span>·</span>' + dec : ''}
        </div>`;
    } else {
      // LOG entry
      const levelClass = `xr-m-${entry.logLevel || 'log'}`;
      const preview = XRAY_Utils.previewJSON(entry.logData, 70);
      el.innerHTML = `
        <div class="xr-entry-top">
          <span class="xr-meth ${levelClass}">${(entry.logLevel || 'log').toUpperCase()}</span>
        </div>
        <div class="xr-entry-path">${_esc(preview)}</div>
        <div class="xr-entry-meta">${XRAY_Utils.formatTime(entry.timestamp)}</div>`;
    }

    el.addEventListener('click', () => _selectEntry(entry.id));
    return el;
  }

  // ── Detail rendering ──────────────────────────────────────────────────────
  function _selectEntry(id) {
    _state.selectedId = id;
    // Update selected highlight in list
    _dom.list.querySelectorAll('.xr-entry').forEach(el => {
      el.classList.toggle('xr-sel', el.dataset.id === id);
    });
    _renderDetail();
  }

  function _renderDetail() {
    const detail = _dom.detail;
    detail.innerHTML = '';

    const entry = _state.selectedId
      ? _state.entries.find(e => e.id === _state.selectedId)
      : null;

    if (!entry) {
      detail.innerHTML = `
        <div class="xr-detail-empty">
          <div class="xr-detail-empty-icon">←</div>
          <div class="xr-detail-empty-text">Select a request to inspect</div>
        </div>`;
      return;
    }

    if (entry.type === 'log') {
      _renderLogDetail(detail, entry);
    } else {
      _renderAPIDetail(detail, entry);
    }
  }

  function _renderAPIDetail(detail, entry) {
    const u = XRAY_Utils;
    const sc = u.statusClass(entry.status);
    const mc = u.methodClass(entry.method);

    // Header
    const dhead = document.createElement('div');
    dhead.className = 'xr-dhead';
    dhead.innerHTML = `
      <div class="xr-dhead-url">
        <span class="xr-meth ${mc}" style="margin-right:6px">${_esc(entry.method)}</span>${_esc(entry.url || '')}
      </div>
      <div class="xr-dhead-meta">
        <div class="xr-dstat">
          <span class="xr-dstat-lbl">Status</span>
          <span class="xr-dstat-val ${sc}">${entry.status || 'ERR'}</span>
        </div>
        <div class="xr-dstat">
          <span class="xr-dstat-lbl">Duration</span>
          <span class="xr-dstat-val">${u.formatDuration(entry.duration)}</span>
        </div>
        <div class="xr-dstat">
          <span class="xr-dstat-lbl">Size</span>
          <span class="xr-dstat-val">${u.formatSize(entry.size)}</span>
        </div>
        ${entry.decryptStatus === 'ok' ? `
        <div class="xr-dstat">
          <span class="xr-dstat-lbl">Decrypt</span>
          <span class="xr-dstat-val xr-dec-ok">✓ OK</span>
        </div>` : entry.decryptStatus === 'failed' ? `
        <div class="xr-dstat">
          <span class="xr-dstat-lbl">Decrypt</span>
          <span class="xr-dstat-val xr-dec-fail">✗ Failed</span>
        </div>` : ''}
        <div class="xr-dhead-actions">
          <button class="xr-vbtn${_state.activeView === 'tree' ? ' xr-active' : ''}" data-view="tree" title="Tree view (T)">T</button>
          <button class="xr-vbtn${_state.activeView === 'raw'  ? ' xr-active' : ''}" data-view="raw"  title="Raw view (R)">R</button>
          <button class="xr-copy-btn" id="xr-copybtn" title="Copy JSON (C)">Copy</button>
        </div>
      </div>`;
    detail.appendChild(dhead);

    // View buttons
    dhead.querySelectorAll('.xr-vbtn').forEach(btn => {
      btn.addEventListener('click', () => {
        _state.activeView = btn.dataset.view;
        dhead.querySelectorAll('.xr-vbtn').forEach(b => b.classList.toggle('xr-active', b.dataset.view === _state.activeView));
        _refreshDetailContent(detail, entry);
      });
    });

    // Copy button
    dhead.getElementById('xr-copybtn').addEventListener('click', () => _copyEntry(entry));

    // Sub-tabs
    const dtabs = document.createElement('div');
    dtabs.className = 'xr-dtabs';
    ['response', 'request', 'headers'].forEach(tab => {
      const btn = document.createElement('button');
      btn.className = 'xr-dtab' + (tab === _state.activeDTab ? ' xr-active' : '');
      btn.textContent = tab.charAt(0).toUpperCase() + tab.slice(1);
      btn.addEventListener('click', () => {
        _state.activeDTab = tab;
        dtabs.querySelectorAll('.xr-dtab').forEach(b => b.classList.toggle('xr-active', b.textContent.toLowerCase() === tab));
        _refreshDetailContent(detail, entry);
      });
      dtabs.appendChild(btn);
    });
    detail.appendChild(dtabs);

    // Content area
    const dcont = document.createElement('div');
    dcont.className = 'xr-dcont';
    dcont.id = 'xr-dcont';
    detail.appendChild(dcont);

    _refreshDetailContent(detail, entry);
  }

  function _refreshDetailContent(detail, entry) {
    const dcont = detail.querySelector('#xr-dcont');
    if (!dcont) return;
    dcont.innerHTML = '';

    if (_state.activeDTab === 'headers') {
      dcont.appendChild(XRAY_Renderer.buildHeaders(entry.requestHeaders, entry.responseHeaders));
      return;
    }

    let data;
    if (_state.activeDTab === 'response') {
      data = entry.responseDecrypted !== null && entry.responseDecrypted !== undefined
        ? entry.responseDecrypted
        : _tryParse(entry.responseRaw);
    } else {
      data = entry.requestBody;
    }

    if (data === null || data === undefined) {
      if (_state.activeDTab === 'response' && entry.responseRaw) {
        // Show raw text if JSON parse failed
        dcont.appendChild(XRAY_Renderer.buildRaw(entry.responseRaw));
        return;
      }
      const empty = document.createElement('div');
      empty.className = 'xr-empty';
      empty.textContent = 'No data';
      dcont.appendChild(empty);
      return;
    }

    if (_state.activeView === 'raw') {
      dcont.appendChild(XRAY_Renderer.buildRaw(data));
    } else {
      dcont.appendChild(XRAY_Renderer.buildTree(data));
    }
  }

  function _renderLogDetail(detail, entry) {
    const dhead = document.createElement('div');
    dhead.className = 'xr-dhead';
    const levelClass = `xr-m-${entry.logLevel || 'log'}`;
    dhead.innerHTML = `
      <div class="xr-dhead-url">
        <span class="xr-meth ${levelClass}" style="margin-right:6px">${(entry.logLevel || 'log').toUpperCase()}</span>
        ${XRAY_Utils.formatTime(entry.timestamp)}
      </div>
      <div class="xr-dhead-meta">
        <div class="xr-dhead-actions">
          <button class="xr-vbtn${_state.activeView === 'tree' ? ' xr-active' : ''}" data-view="tree">T</button>
          <button class="xr-vbtn${_state.activeView === 'raw'  ? ' xr-active' : ''}" data-view="raw">R</button>
          <button class="xr-copy-btn" id="xr-copybtn">Copy</button>
        </div>
      </div>`;
    detail.appendChild(dhead);

    dhead.querySelectorAll('.xr-vbtn').forEach(btn => {
      btn.addEventListener('click', () => {
        _state.activeView = btn.dataset.view;
        dhead.querySelectorAll('.xr-vbtn').forEach(b => b.classList.toggle('xr-active', b.dataset.view === _state.activeView));
        const dc = detail.querySelector('#xr-log-dcont');
        if (dc) { dc.innerHTML = ''; _fillLogContent(dc, entry); }
      });
    });

    dhead.getElementById('xr-copybtn').addEventListener('click', () => {
      const text = JSON.stringify(entry.logData, null, 2);
      navigator.clipboard.writeText(text).catch(() => {});
    });

    const dcont = document.createElement('div');
    dcont.className = 'xr-dcont';
    dcont.id = 'xr-log-dcont';
    detail.appendChild(dcont);
    _fillLogContent(dcont, entry);
  }

  function _fillLogContent(dcont, entry) {
    if (entry.logData === null || entry.logData === undefined) {
      dcont.textContent = 'null';
      return;
    }
    if (_state.activeView === 'raw') {
      dcont.appendChild(XRAY_Renderer.buildRaw(entry.logData));
    } else {
      dcont.appendChild(XRAY_Renderer.buildTree(entry.logData));
    }
  }

  // ── Counts ────────────────────────────────────────────────────────────────
  function _updateCounts() {
    const api  = _state.entries.filter(e => e.type === 'api').length;
    const logs = _state.entries.filter(e => e.type === 'log').length;
    _dom.apiCnt.textContent  = api;
    _dom.logCnt.textContent  = logs;
    _dom.count.textContent   = `${api + logs} entr${api + logs === 1 ? 'y' : 'ies'}`;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  function _esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function _tryParse(str) {
    if (str == null) return null;
    try { return JSON.parse(str); } catch { return null; }
  }

  function _copyEntry(entry) {
    let data = entry.responseDecrypted ?? _tryParse(entry.responseRaw) ?? entry.responseRaw;
    const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(text || '').catch(() => {});
  }

  // ── Public API ────────────────────────────────────────────────────────────
  function show() {
    _state.open = true;
    _dom.panel.classList.remove('xr-hidden');
    XRAY_Store.set(STORE_KEY, { open: true, theme: _state.theme });
  }

  function hide() {
    _state.open = false;
    _dom.panel.classList.add('xr-hidden');
    XRAY_Store.set(STORE_KEY, { open: false, theme: _state.theme });
  }

  function toggle() { _state.open ? hide() : show(); }
  function isOpen() { return _state.open; }

  function add(entry) {
    _state.entries.push(entry);
    _appendEntry(entry);
    _updateCounts();
  }

  function setView(v) {
    if (!['tree', 'raw', 'grid', 'diff'].includes(v)) return;
    _state.activeView = v === 'grid' || v === 'diff' ? 'raw' : v; // Phase 2/3 stubs
    _renderDetail();
  }

  function focusSearch() {
    if (_dom.srch) _dom.srch.focus();
  }

  function copySelected() {
    const entry = _state.selectedId
      ? _state.entries.find(e => e.id === _state.selectedId)
      : null;
    if (entry) {
      if (entry.type === 'api') _copyEntry(entry);
      else navigator.clipboard.writeText(JSON.stringify(entry.logData, null, 2)).catch(() => {});
    }
  }

  function pinSelected() {
    const entry = _state.entries.find(e => e.id === _state.selectedId);
    if (entry) {
      entry.pinned = !entry.pinned;
      _renderList();
      if (_state.selectedId) _selectEntry(_state.selectedId);
    }
  }

  function expandAll(expand) {
    const dcont = _root && _root.querySelector('#xr-dcont, #xr-log-dcont');
    if (dcont) XRAY_Renderer.expandAll(dcont, expand);
  }

  function selectNext(dir) {
    const visible = _state.entries.filter(e => {
      if (e.type !== _state.activeTab) return false;
      return !_state.filter || XRAY_Search.filter([e], _state.filter).length > 0;
    });
    if (!visible.length) return;
    const idx = visible.findIndex(e => e.id === _state.selectedId);
    const next = visible[Math.max(0, Math.min(visible.length - 1, idx + dir))];
    if (next) _selectEntry(next.id);
  }

  const _public = {
    init, show, hide, toggle, isOpen, add, setView,
    focusSearch, copySelected, pinSelected, expandAll, selectNext,
  };

  return _public;
})();
