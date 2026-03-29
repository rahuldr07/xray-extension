// panel/console-ui.js — XRAY Console UI
// Notebook-style CodeMirror UI for the XRAY Console Engine

window.XRAY_ConsoleUI = (() => {
  'use strict';

  let _root = null;
  let _dom = {};
  let _cells = [];
  let _activeContext = null;

  // CodeMirror exports
  let EditorState, EditorView, keymap, placeholder, lineNumbers, drawSelection, dropCursor;
  let highlightActiveLine, highlightSpecialChars, defaultKeymap, history, historyKeymap;
  let indentWithTab, javascript, syntaxHighlighting, HighlightStyle, tags;
  let autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap;
  let indentOnInput, bracketMatching;

  function _loadCM() {
    if (!window.CM) return false;
    ({
      EditorState, EditorView, keymap, placeholder, lineNumbers, drawSelection, dropCursor,
      highlightActiveLine, highlightSpecialChars, defaultKeymap, history, historyKeymap,
      indentWithTab, javascript, syntaxHighlighting, HighlightStyle, t: tags,
      autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap,
      indentOnInput, bracketMatching
    } = window.CM);
    return true;
  }

  function _injectCSS() {
    const style = document.createElement('style');
    style.textContent = `
/* Console Base */
.xr-console-pane {
  display: none;
  flex-direction: column;
  height: 100%;
  background: var(--xr-bg);
  overflow: hidden;
  container-type: inline-size;
}
.xr-console-pane.xr-active { display: flex; }

/* Toolbar */
.xr-console-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--xr-bg2);
  border-bottom: 1px solid var(--xr-border);
  flex-shrink: 0;
  overflow-x: auto;
}
.xr-console-toolbar button {
  padding: 4px 10px;
  border: 1px solid var(--xr-border);
  background: var(--xr-surface);
  color: var(--xr-text);
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}
.xr-console-toolbar button:hover {
  background: var(--xr-bg3);
  border-color: var(--xr-accent);
}

.xr-console-ctx-badge {
  margin-left: auto;
  font-family: var(--xr-mono, 'JetBrains Mono', monospace);
  font-size: 10.5px;
  color: var(--xr-muted);
  background: rgba(255,255,255,0.05);
  padding: 2px 6px;
  border-radius: 4px;
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Cells Container */
.xr-console-cells {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Individual Cell */
.xr-cell {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--xr-border);
  border-radius: 6px;
  background: var(--xr-surface);
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: border-color 0.2s;
}
.xr-cell.xr-focused {
  border-color: var(--xr-accent);
  box-shadow: 0 0 0 1px var(--xr-accent), 0 4px 12px rgba(0,0,0,0.1);
}

.xr-cell-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  background: rgba(0,0,0,0.2);
  border-bottom: 1px solid rgba(255,255,255,0.04);
  font-size: 10px;
  color: var(--xr-muted);
  user-select: none;
}
.xr-cell-actions { display: flex; gap: 4px; }
.xr-cell-actions button {
  background: transparent;
  border: none;
  color: var(--xr-muted);
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 3px;
}
.xr-cell-actions button:hover { background: var(--xr-bg3); color: var(--xr-text); }

/* CodeMirror Overrides */
.xr-cell-input .cm-editor {
  background: transparent !important;
  font-family: var(--xr-mono, 'JetBrains Mono', monospace) !important;
  font-size: 12px;
}
.xr-cell-input .cm-gutters {
  background: rgba(0,0,0,0.1) !important;
  border-right: 1px solid rgba(255,255,255,0.04) !important;
  color: var(--xr-muted) !important;
}
.xr-cell-input .cm-activeLine, .xr-cell-input .cm-activeLineGutter {
  background: rgba(255,255,255,0.03) !important;
}
.cm-tooltip-autocomplete {
  background: var(--xr-surface) !important;
  border: 1px solid var(--xr-border) !important;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

/* Output Area */
.xr-cell-output {
  border-top: 1px solid rgba(255,255,255,0.04);
  padding: 8px;
  font-family: var(--xr-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  background: rgba(0,0,0,0.15);
  min-height: 24px;
}
.xr-cell-output:empty { display: none; }
.xr-out-error { color: var(--xr-red, #ef4444); white-space: pre-wrap; word-break: break-all; }
.xr-out-string { color: var(--xr-green, #22c55e); }
.xr-out-number { color: var(--xr-blue, #60a5fa); }
.xr-out-boolean { color: var(--xr-purple, #c084fc); }
.xr-out-null { color: var(--xr-muted); font-style: italic; }

/* Snippets Menu */
.xr-snippets-menu {
  display: none;
  position: absolute;
  flex-direction: column;
  background: var(--xr-bg2);
  border: 1px solid var(--xr-border);
  border-radius: 6px;
  padding: 4px;
  z-index: 1000;
  min-width: 180px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
}
.xr-snippets-menu.xr-show { display: flex; }
.xr-snip-header {
  padding: 6px 10px;
  font-size: 10px;
  color: var(--xr-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--xr-border);
  margin-bottom: 4px;
}
.xr-snip-item {
  background: none;
  border: none;
  color: var(--xr-text);
  padding: 6px 10px;
  text-align: left;
  cursor: pointer;
  border-radius: 4px;
  font-size: 11px;
  white-space: nowrap;
  transition: background 0.1s;
}
.xr-snip-item:hover {
  background: var(--xr-bg3);
}
.xr-hist-empty {
  padding: 12px;
  color: var(--xr-muted);
  font-size: 11px;
  text-align: center;
}

/* Table Output */
.xr-console-table-wrap {
  max-width: 100%; overflow-x: auto; overflow-y: auto; max-height: 400px;
  border: 1px solid var(--xr-border); border-radius: 4px;
}
.xr-console-table {
  width: 100%; border-collapse: collapse; font-family: var(--xr-mono, 'JetBrains Mono', monospace); font-size: 11px;
}
.xr-console-table th {
  background: var(--xr-bg2); color: var(--xr-muted); text-align: left; padding: 4px 8px;
  position: sticky; top: 0; border-bottom: 1px solid var(--xr-border); z-index: 1;
}
.xr-console-table td {
  padding: 4px 8px; border-bottom: 1px solid rgba(255,255,255,0.04); color: var(--xr-text);
  white-space: nowrap; max-width: 200px; overflow: hidden; text-overflow: ellipsis;
}
.xr-console-table tr:hover td { background: rgba(255,255,255,0.03); }
    `;
    _root.appendChild(style);
  }

  function _renderTableObject(data) {
    if (!Array.isArray(data) || !data.length) {
      const div = document.createElement('div');
      div.textContent = '(Empty table)';
      return div;
    }
    const keys = Object.keys(data[0] || {});
    const wrap = document.createElement('div');
    wrap.className = 'xr-console-table-wrap';
    const table = document.createElement('table');
    table.className = 'xr-console-table';
    
    let html = '<thead><tr><th>#</th>' + keys.map(k => `<th>${k}</th>`).join('') + '</tr></thead><tbody>';
    const limit = Math.min(data.length, 100);
    for (let i = 0; i < limit; i++) {
      html += `<tr><td>${i}</td>` + keys.map(k => {
        let val = data[i][k];
        if (typeof val === 'object' && val !== null) val = Array.isArray(val) ? '[Array]' : '{...}';
        return `<td>${val ?? ''}</td>`;
      }).join('') + '</tr>';
    }
    if (data.length > 100) html += `<tr><td colspan="${keys.length + 1}">... ${data.length - 100} more rows not shown.</td></tr>`;
    html += '</tbody>';
    table.innerHTML = html;
    wrap.appendChild(table);
    return wrap;
  }

  function _getById(id) {
    return _root.getElementById 
      ? _root.getElementById(id) 
      : _root.querySelector(`#${id}`);
  }

  function _buildUI() {
    const pane = _getById('xr-console-pane');
    console.log('[XRAY ConsoleUI] _buildUI, pane:', pane);
    if (!pane) {
      console.warn('XRAY ConsoleUI: console pane not found');
      return;
    }

    // Check if CodeMirror loaded
    if (!window.CM) {
      console.warn('[XRAY ConsoleUI] CM not available, showing error');
      pane.innerHTML = `
        <div style="padding: 20px; color: var(--xr-muted); text-align: center;">
          <p>⚠️ CodeMirror failed to load</p>
          <p style="font-size: 11px;">Console requires the CodeMirror bundle</p>
        </div>
      `;
      return;
    }
    
    console.log('[XRAY ConsoleUI] Building full UI');
    pane.innerHTML = `
      <div class="xr-console-toolbar">
        <button id="xr-console-add-cell">+ Cell</button>
        <button id="xr-console-run-all">▶ Run All</button>
        <button id="xr-console-clear">🗑 Clear</button>
        <button id="xr-console-snippets" title="Code snippets">📚 Snips</button>
        <button id="xr-console-history" title="Command history">📜 History</button>
        <div class="xr-console-ctx-badge" id="xr-console-ctx-badge">No context</div>
      </div>
      <div id="xr-snippets-menu" class="xr-snippets-menu">
        <div class="xr-snip-header">Snippets</div>
        <button class="xr-snip-item" data-code="toTable($res.items || $res)">📊 toTable($res)</button>
        <button class="xr-snip-item" data-code="schema($res)">🔍 schema($res)</button>
        <button class="xr-snip-item" data-code="$all().filter(e => e.status >= 400)">❌ Errors Only</button>
        <button class="xr-snip-item" data-code="_.groupBy($res, 'type')">📁 Group by 'type'</button>
        <button class="xr-snip-item" data-code="toCSV($res.items || $res)">📄 Export CSV</button>
        <button class="xr-snip-item" data-code="diff($prev()?.responseDecrypted, $res)">🔀 Diff with prev</button>
      </div>
      <div id="xr-history-menu" class="xr-snippets-menu">
        <div class="xr-snip-header">History</div>
        <div id="xr-history-items"></div>
      </div>
      <div class="xr-console-cells" id="xr-console-cells"></div>
    `;

    _dom.toolbar = pane.querySelector('.xr-console-toolbar');
    _dom.cellsContainer = pane.querySelector('#xr-console-cells');
    _dom.ctxBadge = pane.querySelector('#xr-console-ctx-badge');
    const snipMenu = pane.querySelector('#xr-snippets-menu');
    const histMenu = pane.querySelector('#xr-history-menu');
    const histItems = pane.querySelector('#xr-history-items');
    let snipMenuActive = false;
    let histMenuActive = false;

    // Close menus when clicking outside
    _root.addEventListener('click', (e) => {
      if (snipMenuActive && !snipMenu.contains(e.target) && !e.target.closest('#xr-console-snippets')) {
        snipMenu.classList.remove('xr-show');
        snipMenuActive = false;
      }
      if (histMenuActive && !histMenu.contains(e.target) && !e.target.closest('#xr-console-history')) {
        histMenu.classList.remove('xr-show');
        histMenuActive = false;
      }
    });

    pane.querySelector('#xr-console-snippets').onclick = (e) => {
      e.stopPropagation();
      histMenu.classList.remove('xr-show');
      histMenuActive = false;
      snipMenuActive = !snipMenuActive;
      snipMenu.classList.toggle('xr-show', snipMenuActive);
      if (snipMenuActive) {
        const rect = e.target.getBoundingClientRect();
        snipMenu.style.left = rect.left + 'px';
        snipMenu.style.top = (rect.bottom + 4) + 'px';
      }
    };

    pane.querySelector('#xr-console-history').onclick = (e) => {
      e.stopPropagation();
      snipMenu.classList.remove('xr-show');
      snipMenuActive = false;
      histMenuActive = !histMenuActive;
      
      // Populate history from XRAY_Console
      if (histMenuActive) {
        const history = window.XRAY_Console?.getHistory?.() || [];
        if (history.length === 0) {
          histItems.innerHTML = '<div class="xr-hist-empty">No history yet</div>';
        } else {
          histItems.innerHTML = history.slice(0, 20).map((cmd, i) => {
            const short = cmd.length > 40 ? cmd.slice(0, 40) + '…' : cmd;
            return `<button class="xr-snip-item xr-hist-item" data-idx="${i}">${short}</button>`;
          }).join('');
          
          histItems.querySelectorAll('.xr-hist-item').forEach(btn => {
            btn.onclick = () => {
              const idx = parseInt(btn.dataset.idx);
              const code = history[idx];
              histMenu.classList.remove('xr-show');
              histMenuActive = false;
              createCell(code);
            };
          });
        }
        
        const rect = e.target.getBoundingClientRect();
        histMenu.style.left = rect.left + 'px';
        histMenu.style.top = (rect.bottom + 4) + 'px';
      }
      histMenu.classList.toggle('xr-show', histMenuActive);
    };
    
    pane.querySelectorAll('.xr-snip-item').forEach(btn => {
      btn.onclick = () => {
        snipMenu.classList.remove('xr-show');
        snipMenuActive = false;
        createCell(btn.dataset.code);
      };
    });
    
    pane.querySelector('#xr-console-run-all').onclick = () => {
      _cells.forEach(c => _executeCell(c));
    };

    pane.querySelector('#xr-console-add-cell').onclick = () => createCell();
    pane.querySelector('#xr-console-clear').onclick = () => {
      _cells = [];
      _dom.cellsContainer.innerHTML = '';
      createCell();
    };
  }

  const xrHighlightStyle = () => HighlightStyle.define([
    {tag: tags.keyword, color: '#c678dd'},
    {tag: tags.operator, color: '#56b6c2'},
    {tag: tags.propertyName, color: '#e06c75'},
    {tag: tags.variableName, color: '#e4e4e7'},
    {tag: tags.string, color: '#98c379'},
    {tag: tags.number, color: '#d19a66'},
    {tag: tags.bool, color: '#d19a66'},
    {tag: tags.null, color: '#5c6370'},
    {tag: tags.comment, color: '#5c6370', fontStyle: 'italic'}
  ]);

  const _myCompletions = (context) => {
    let word = context.matchBefore(/\$\w*(?:\.\w*)?|_(?:\.\w*)?/);
    if (!word) return null;
    if (word.from === word.to && !context.explicit) return null;

    let options = [];
    const text = word.text;

    if (text.startsWith('$res.') || text.startsWith('$req.')) {
      const isRes = text.startsWith('$res');
      let bodyStr = isRes 
        ? (_activeContext?.responseDecrypted || _activeContext?.responseRaw)
        : _activeContext?.requestBody;
      
      let bodyObj = bodyStr;
      if (typeof bodyStr === 'string') {
        try { bodyObj = JSON.parse(bodyStr); } catch {}
      }

      if (bodyObj && typeof bodyObj === 'object') {
        const prefix = isRes ? '$res.' : '$req.';
        // CodeMirror will naturally filter if we just return the full prefixed labels
        // But cleaner: we return just the properties matching after the dot, 
        // mapping 'from' to the position after the dot
        const dotIdx = text.indexOf('.');
        const realFrom = word.from + dotIdx + 1;
        
        for (const k of Object.keys(bodyObj)) {
          options.push({ label: k, type: 'property' });
        }
        return { from: realFrom, options, validFor: /^\w*$/ };
      }
    } else if (text.startsWith('$')) {
      options = [
        { label: '$res', type: 'variable', detail: 'Response' },
        { label: '$req', type: 'variable', detail: 'Request' },
        { label: '$h', type: 'variable', detail: 'Res Headers' },
        { label: '$rh', type: 'variable', detail: 'Req Headers' },
        { label: '$url', type: 'variable', detail: 'URL info' },
        { label: '$params', type: 'variable', detail: 'Query params' },
        { label: '$status', type: 'variable' },
        { label: '$time', type: 'variable' },
        { label: '$size', type: 'variable' },
        { label: '$all', type: 'function' },
        { label: '$similar', type: 'function' }
      ];
    } else if (text.startsWith('_.')) {
      options = ['map','filter','find','pluck','groupBy','uniq','sortBy','sum'].map(m => ({ label: m, type: 'function' }));
      return { from: word.from + 2, options, validFor: /^\w*$/ };
    }
    
    return { from: word.from, options, validFor: /^(?:\$\w*|_\.?\w*)$/ };
  };

  function _createEditor(parentEl, initialCode = '', onRun, onRunAndNew) {
    const theme = EditorView.theme({
      "&": { color: "#e4e4e7", backgroundColor: "transparent" },
      ".cm-content": { caretColor: "#e4e4e7" },
      ".cm-cursor, .cm-dropCursor": { borderLeftColor: "#e4e4e7" },
      "&.cm-focused": { outline: "none" }
    }, { dark: true });

    // Build keybindings including Ctrl+Enter
    const runKeymap = [];
    if (onRun) {
      runKeymap.push({ key: "Mod-Enter", run: () => { onRun(); return true; } });
    }
    if (onRunAndNew) {
      runKeymap.push({ key: "Shift-Enter", run: () => { onRunAndNew(); return true; } });
    }

    const state = EditorState.create({
      doc: initialCode,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        highlightSpecialChars(),
        history(),
        drawSelection(),
        dropCursor(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        syntaxHighlighting(xrHighlightStyle(), { fallback: true }),
        bracketMatching(),
        closeBrackets(),
        autocompletion({ override: [_myCompletions] }),
        javascript(),
        keymap.of([
          ...runKeymap,
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...historyKeymap,
          ...completionKeymap,
          indentWithTab
        ]),
        theme
      ]
    });

    return new EditorView({
      state,
      parent: parentEl
    });
  }

  function createCell(code = '') {
    const id = 'cell_' + Math.random().toString(36).substr(2, 9);
    const cellEl = document.createElement('div');
    cellEl.className = 'xr-cell';
    cellEl.id = id;

    cellEl.innerHTML = `
      <div class="xr-cell-header">
        <span>[ ] Cell</span>
        <div class="xr-cell-actions">
          <button class="xr-cell-run" title="Run (Ctrl+Enter)">▶</button>
          <button class="xr-cell-del" title="Delete">✕</button>
        </div>
      </div>
      <div class="xr-cell-input"></div>
      <div class="xr-cell-output"></div>
    `;

    const inputWrap = cellEl.querySelector('.xr-cell-input');
    const outWrap = cellEl.querySelector('.xr-cell-output');
    
    _dom.cellsContainer.appendChild(cellEl);

    // Create cell object first so we can reference it in callbacks
    const cellObj = { id, el: cellEl, editor: null, outWrap };
    _cells.push(cellObj);

    // Create editor with run callbacks
    const editor = _createEditor(
      inputWrap, 
      code,
      () => _executeCell(cellObj),           // Ctrl+Enter
      () => { _executeCell(cellObj); createCell(); }  // Shift+Enter
    );
    cellObj.editor = editor;

    // Focus handling
    editor.dom.addEventListener('focusin', () => cellEl.classList.add('xr-focused'));
    editor.dom.addEventListener('focusout', () => cellEl.classList.remove('xr-focused'));

    cellEl.querySelector('.xr-cell-run').onclick = () => _executeCell(cellObj);
    cellEl.querySelector('.xr-cell-del').onclick = () => {
      cellEl.remove();
      _cells = _cells.filter(c => c.id !== id);
      _renumberCells();
    };

    _renumberCells();
    editor.focus();
    return cellObj;
  }

  function _renumberCells() {
    _cells.forEach((cell, i) => {
      const headerSpan = cell.el.querySelector('.xr-cell-header span');
      // Preserve timestamp if already executed, otherwise show In [n]
      if (!headerSpan.textContent.includes(':')) {
        headerSpan.textContent = `In [${i + 1}]`;
      }
    });
  }

  async function _executeCell(cell) {
    const idx = _cells.indexOf(cell);
    const code = cell.editor.state.doc.toString();
    const headerSpan = cell.el.querySelector('.xr-cell-header span');
    headerSpan.textContent = `In [${idx + 1}] *`;
    
    const result = await window.XRAY_Console.execute(code);
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    headerSpan.textContent = `In [${idx + 1}] · ${time}`;
    
    cell.outWrap.innerHTML = '';
    
    if (result.type === 'error') {
      cell.outWrap.innerHTML = `<div class="xr-out-error">✗ ${result.error.message}</div>`;
    } else if (result.result && result.result.__xr_render === 'table') {
      cell.outWrap.appendChild(_renderTableObject(result.result.data));
    } else if (result.type === 'object' || result.type === 'array') {
      if (window.XRAY_Renderer) {
        const tree = window.XRAY_Renderer.buildTree(result.result);
        cell.outWrap.appendChild(tree);
      } else {
        cell.outWrap.textContent = JSON.stringify(result.result, null, 2);
      }
    } else {
      const sp = document.createElement('span');
      sp.className = `xr-out-${result.type}`;
      sp.textContent = result.type === 'string' ? `"${result.result}"` : String(result.result);
      cell.outWrap.appendChild(sp);
    }
  }

  function updateContext(entry) {
    _activeContext = entry;
    if (_dom.ctxBadge) {
      if (!entry) {
        _dom.ctxBadge.textContent = 'No context';
      } else {
        const path = window.XRAY_Utils?.shortPath(entry.url) || entry.url;
        _dom.ctxBadge.textContent = `${entry.method} ${path}`;
      }
    }
    if (window.XRAY_Console) window.XRAY_Console.setContext(entry);
  }

  function init(root, panelUtils) {
    console.log('[XRAY ConsoleUI] init called, root:', root);
    _root = root;
    
    // Always inject CSS first (even if CM not loaded)
    _injectCSS();
    console.log('[XRAY ConsoleUI] CSS injected');
    
    if (!_loadCM()) {
      console.warn('[XRAY ConsoleUI] CodeMirror bundle not found!');
    } else {
      console.log('[XRAY ConsoleUI] CodeMirror loaded');
    }
    
    _buildUI();
    console.log('[XRAY ConsoleUI] UI built, cells:', _cells.length);
    if (_cells.length === 0 && window.CM) createCell();
  }

  function handleTabSwitch(isConsole) {
    if (isConsole && _cells.length > 0) {
      const lastCell = _cells[_cells.length - 1];
      if (lastCell?.editor) {
        setTimeout(() => lastCell.editor.focus(), 50);
      }
    }
    // Sync context from floating panel's selected entry
    if (isConsole && window.XRAY_Panel) {
      const selectedId = window.XRAY_Panel.getSelectedId?.() || null;
      if (selectedId) {
        const entry = window.XRAY_Panel.getEntry?.(selectedId);
        if (entry) updateContext(entry);
      }
    }
  }

  const _public = {
    init,
    handleTabSwitch,
    updateContext,
    createCell
  };

  return _public;
})();
