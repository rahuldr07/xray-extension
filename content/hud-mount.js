// content/hud-mount.js - standalone floating HUD host
(function () {
  'use strict';

  const HOST_ID = 'xray-hud-host';
  const HANDLE_CLASS = 'xray-hud-resize-handle';
  const STORE_KEY = 'xray_hud_state';
  const SNAP = 40;
  const MIN_WIDTH = 320;
  const MIN_HEIGHT = 400;
  const DEFAULT_STATE = {
    x: 20,
    y: 20,
    width: 920,
    height: 560,
    collapsed: false,
  };

  let host = null;
  let shadow = null;
  let pill = null;
  let handles = [];
  let state = { ...DEFAULT_STATE };
  let count = 0;
  let interaction = null;

  function storageGet() {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get(STORE_KEY, (result) => {
          resolve(result && result[STORE_KEY] && typeof result[STORE_KEY] === 'object'
            ? result[STORE_KEY]
            : {});
        });
      } catch {
        resolve({});
      }
    });
  }

  function storageSet(nextState) {
    try {
      chrome.storage.local.set({ [STORE_KEY]: nextState });
    } catch {}
  }

  function viewport() {
    return {
      width: Math.max(320, window.innerWidth || document.documentElement.clientWidth || 1280),
      height: Math.max(420, window.innerHeight || document.documentElement.clientHeight || 720),
    };
  }

  function clampState(input) {
    const vp = viewport();
    const maxWidth = Math.max(MIN_WIDTH, Math.floor(vp.width * 0.9));
    const maxHeight = Math.max(MIN_HEIGHT, Math.floor(vp.height * 0.9));
    const width = Math.min(maxWidth, Math.max(MIN_WIDTH, Number(input.width) || DEFAULT_STATE.width));
    const height = Math.min(maxHeight, Math.max(MIN_HEIGHT, Number(input.height) || DEFAULT_STATE.height));
    return {
      x: Math.max(0, Math.min(Number(input.x) || 0, vp.width - width)),
      y: Math.max(0, Math.min(Number(input.y) || 0, vp.height - height)),
      width,
      height,
      collapsed: !!input.collapsed,
    };
  }

  function snap(nextState) {
    const vp = viewport();
    const output = { ...nextState };
    if (output.x < SNAP) output.x = 0;
    if (output.y < SNAP) output.y = 0;
    if (output.x + output.width > vp.width - SNAP) output.x = Math.max(0, vp.width - output.width);
    if (output.y + output.height > vp.height - SNAP) output.y = Math.max(0, vp.height - output.height);
    return clampState(output);
  }

  function applyState() {
    if (!host) return;
    host.style.position = 'fixed';
    host.style.left = state.x + 'px';
    host.style.top = state.y + 'px';
    host.style.width = (state.collapsed ? 180 : state.width) + 'px';
    host.style.height = (state.collapsed ? 40 : state.height) + 'px';
    host.style.zIndex = '2147483646';
    // hud-main.tsx mirrors the panel's resolved --xray-radius onto this host, so
    // the frame follows the user's radius setting instead of a frozen 10px.
    host.style.borderRadius = 'var(--xray-radius, 10px)';
    host.style.overflow = 'visible';
    host.classList.toggle('xray-collapsed', state.collapsed);
    syncHandles();
  }

  function saveState() {
    storageSet({ ...state });
  }

  function updatePill() {
    if (!pill) return;
    pill.textContent = 'XRAY  ' + count + '  ●';
  }

  function injectHudChrome() {
    if (!shadow) return;

    const style = document.createElement('style');
    style.textContent = `
      /* 'style' only — 'layout' containment would make the host a containing block
         for position:fixed descendants (e.g. the theme popover), anchoring them to
         the HUD box instead of the viewport. */
      :host { contain: style; }
      /* hud-main.tsx's syncHostTheme mirrors the panel's resolved --xray-radius,
         --xray-surface/-2, --xray-text and --xray-bg onto this host element, so
         the collapsed pill inherits them here. The literals are pre-mount
         fallbacks only — hardcoding them left a dark Catppuccin box floating on
         the page in Light Lab and Claude. */
      .xray-hud-pill {
        width: 100%;
        height: 100%;
        display: none;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--xray-surface2, #313244);
        border-radius: var(--xray-radius, 10px);
        color: var(--xray-text, #cdd6f4);
        background: var(--xray-surface, #181825);
        box-shadow: 0 14px 40px rgba(0,0,0,.36);
        cursor: pointer;
        font: 800 12px/1 var(--xray-font, 'JetBrains Mono','Fira Code','Cascadia Code',monospace);
      }
      :host(.xray-collapsed) .xray-hud-pill { display: flex; }
      :host(.xray-collapsed) #xray-hud-root { display: none; }
    `;
    shadow.appendChild(style);

    pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'xray-hud-pill';
    pill.setAttribute('aria-label', 'Expand XRAY HUD');
    pill.addEventListener('click', () => window.XRAY_HUD.expand());
    shadow.appendChild(pill);
    updatePill();
  }

  function injectReactScript() {
    if (!shadow) return;
    // A <script> inside a shadow tree executes with document.currentScript =
    // null, so the bundle could never find this closed root on its own. Both
    // this file and the bundle run in the isolated world: stash the root on
    // the (page-invisible) isolated-world window and load the bundle as a
    // module. Re-toggles reuse the already-imported module via the remount hook.
    window.__xrayHudShadow = shadow;
    if (typeof window.__xrayHudRemount === 'function') {
      window.__xrayHudRemount();
      return;
    }
    import(chrome.runtime.getURL('dist/hud-ui.js')).catch(() => {});
  }

  function createHandles() {
    destroyHandles();
    const dirs = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
    handles = dirs.map((dir) => {
      const handle = document.createElement('div');
      handle.className = HANDLE_CLASS + ' ' + HANDLE_CLASS + '-' + dir;
      handle.dataset.dir = dir;
      handle.style.position = 'fixed';
      handle.style.zIndex = '2147483647';
      handle.style.width = '8px';
      handle.style.height = '8px';
      handle.style.background = 'transparent';
      handle.style.pointerEvents = 'auto';
      handle.style.cursor = dir + '-resize';
      handle.addEventListener('mousedown', startResize);
      document.body.appendChild(handle);
      return handle;
    });
    syncHandles();
  }

  function destroyHandles() {
    handles.forEach((handle) => handle.remove());
    handles = [];
  }

  function syncHandles() {
    if (!host || !handles.length) return;
    const rect = host.getBoundingClientRect();
    const hidden = state.collapsed;
    handles.forEach((handle) => {
      const dir = handle.dataset.dir || '';
      handle.style.display = hidden ? 'none' : 'block';
      const midX = rect.left + rect.width / 2 - 4;
      const midY = rect.top + rect.height / 2 - 4;
      const left = rect.left - 4;
      const right = rect.right - 4;
      const top = rect.top - 4;
      const bottom = rect.bottom - 4;
      handle.style.left = (dir.includes('w') ? left : dir.includes('e') ? right : midX) + 'px';
      handle.style.top = (dir.includes('n') ? top : dir.includes('s') ? bottom : midY) + 'px';
      handle.style.cursor = cursorForDirection(dir);
    });
  }

  function cursorForDirection(dir) {
    if (dir === 'n' || dir === 's') return 'ns-resize';
    if (dir === 'e' || dir === 'w') return 'ew-resize';
    if (dir === 'ne' || dir === 'sw') return 'nesw-resize';
    return 'nwse-resize';
  }

  function startDrag(event) {
    const target = event.target;
    if (!target || !target.classList || !target.classList.contains('xray-drag-handle')) return;
    if (state.collapsed) return;
    event.preventDefault();
    interaction = {
      type: 'drag',
      startX: event.clientX,
      startY: event.clientY,
      state: { ...state },
    };
    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('mouseup', stopInteraction, true);
  }

  function startResize(event) {
    if (state.collapsed) return;
    event.preventDefault();
    interaction = {
      type: 'resize',
      dir: event.currentTarget.dataset.dir || '',
      startX: event.clientX,
      startY: event.clientY,
      state: { ...state },
    };
    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('mouseup', stopInteraction, true);
  }

  function onMove(event) {
    if (!interaction) return;
    event.preventDefault();
    const dx = event.clientX - interaction.startX;
    const dy = event.clientY - interaction.startY;
    const base = interaction.state;

    if (interaction.type === 'drag') {
      state = clampState({ ...base, x: base.x + dx, y: base.y + dy });
      applyState();
      return;
    }

    const dir = interaction.dir || '';
    const next = { ...base };
    if (dir.includes('e')) next.width = base.width + dx;
    if (dir.includes('s')) next.height = base.height + dy;
    if (dir.includes('w')) {
      next.width = base.width - dx;
      next.x = base.x + dx;
    }
    if (dir.includes('n')) {
      next.height = base.height - dy;
      next.y = base.y + dy;
    }
    state = clampState(next);
    applyState();
  }

  function stopInteraction() {
    if (!interaction) return;
    interaction = null;
    state = snap(state);
    applyState();
    saveState();
    document.removeEventListener('mousemove', onMove, true);
    document.removeEventListener('mouseup', stopInteraction, true);
  }

  async function mount() {
    if (host) {
      applyState();
      return;
    }

    const saved = await storageGet();
    state = clampState({ ...DEFAULT_STATE, ...saved });

    host = document.createElement('div');
    host.id = HOST_ID;
    host.style.boxSizing = 'border-box';
    shadow = host.attachShadow({ mode: 'closed' });
    injectHudChrome();
    (document.body || document.documentElement).appendChild(host);
    createHandles();
    shadow.addEventListener('mousedown', startDrag, true);
    injectReactScript();
    applyState();
  }

  function destroy() {
    if (!host) return;
    destroyHandles();
    host.remove();
    host = null;
    shadow = null;
    pill = null;
  }

  function collapse() {
    if (!host) return;
    state = { ...state, collapsed: true };
    applyState();
    saveState();
  }

  function expand() {
    if (!host) {
      void mount();
      return;
    }
    state = snap({ ...state, collapsed: false });
    applyState();
    saveState();
  }

  function isVisible() {
    return !!host;
  }

  function updateCount(nextCount) {
    count = Math.max(0, Number(nextCount) || 0);
    updatePill();
  }

  function toggle() {
    if (host) destroy();
    else void mount();
  }

  window.XRAY_HUD = {
    mount,
    destroy,
    collapse,
    expand,
    isVisible,
    updateCount,
  };

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg && msg.type === 'XRAY_HUD_TOGGLE') toggle();
  });

  window.addEventListener('resize', () => {
    if (!host) return;
    state = clampState(state);
    applyState();
    saveState();
  });
})();
