// panel/renderer.js — Tree / Raw / Headers view builders
window.XRAY_Renderer = (() => {
  'use strict';

  // ── Tree ─────────────────────────────────────────────────────────────────

  function buildTree(data) {
    const root = document.createElement('div');
    root.className = 'xr-tree-root';
    _node(root, data, null, 0);
    return root;
  }

  function _node(parent, val, key, depth) {
    const type = val === null ? 'null' : Array.isArray(val) ? 'array' : typeof val;
    const isComplex = type === 'object' || type === 'array';
    const indent = depth * 14;

    if (isComplex) {
      const keys = Object.keys(val);
      const autoExpand = depth < 3 && keys.length <= 150;

      // ── Opening line ──────────────────────────────────────────────────────
      const line = document.createElement('div');
      line.className = 'xr-line';
      line.style.paddingLeft = `${indent}px`;

      const tog = document.createElement('span');
      tog.className = 'xr-tog' + (autoExpand ? ' xr-open' : '');
      line.appendChild(tog);

      if (key !== null) {
        const k = document.createElement('span');
        k.className = 'xr-key';
        k.textContent = typeof key === 'number' ? String(key) : `"${key}"`;
        line.appendChild(k);
        const sep = document.createElement('span');
        sep.className = 'xr-punct';
        sep.textContent = ': ';
        line.appendChild(sep);
      }

      const ob = document.createElement('span');
      ob.className = 'xr-brack';
      ob.textContent = type === 'array' ? '[' : '{';
      line.appendChild(ob);

      // Collapsed preview
      const prev = document.createElement('span');
      prev.className = 'xr-prev';
      if (type === 'array') {
        prev.textContent = ` ${keys.length} item${keys.length !== 1 ? 's' : ''} `;
      } else {
        const pk = keys.slice(0, 3).map(k => `"${k}"`).join(', ');
        prev.textContent = ` ${pk}${keys.length > 3 ? ', …' : ''} `;
      }
      const cbInline = document.createElement('span');
      cbInline.className = 'xr-brack';
      cbInline.textContent = type === 'array' ? ']' : '}';

      if (autoExpand) {
        prev.style.display = 'none';
        cbInline.style.display = 'none';
      }
      line.appendChild(prev);
      line.appendChild(cbInline);
      parent.appendChild(line);

      // ── Children container ────────────────────────────────────────────────
      const children = document.createElement('div');
      children.className = 'xr-children';
      children.style.display = autoExpand ? 'block' : 'none';
      // connector line — offset = indent + tog width/2
      children.style.setProperty('--xr-connector-left', `${indent + 7}px`);

      let rendered = false;
      function renderChildren() {
        if (rendered) return;
        rendered = true;
        keys.forEach((k, i) => _node(children, val[k], type === 'array' ? i : k, depth + 1));
        // Closing bracket line
        const cl = document.createElement('div');
        cl.className = 'xr-line';
        cl.style.paddingLeft = `${indent}px`;
        const togSpacer = document.createElement('span');
        togSpacer.className = 'xr-tog xr-leaf';
        cl.appendChild(togSpacer);
        const cb = document.createElement('span');
        cb.className = 'xr-brack';
        cb.textContent = type === 'array' ? ']' : '}';
        cl.appendChild(cb);
        children.appendChild(cl);
      }

      if (autoExpand) renderChildren();
      parent.appendChild(children);

      // Toggle click
      tog.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = children.style.display !== 'none';
        if (isOpen) {
          children.style.display = 'none';
          prev.style.display = 'inline';
          cbInline.style.display = 'inline';
          tog.classList.remove('xr-open');
        } else {
          renderChildren();
          children.style.display = 'block';
          prev.style.display = 'none';
          cbInline.style.display = 'none';
          tog.classList.add('xr-open');
        }
      });

    } else {
      // ── Primitive ─────────────────────────────────────────────────────────
      const line = document.createElement('div');
      line.className = 'xr-line';
      line.style.paddingLeft = `${indent}px`;

      const togLeaf = document.createElement('span');
      togLeaf.className = 'xr-tog xr-leaf';
      line.appendChild(togLeaf);

      if (key !== null) {
        const k = document.createElement('span');
        k.className = 'xr-key';
        k.textContent = typeof key === 'number' ? String(key) : `"${key}"`;
        line.appendChild(k);
        const sep = document.createElement('span');
        sep.className = 'xr-punct';
        sep.textContent = ': ';
        line.appendChild(sep);
      }

      const v = document.createElement('span');
      v.className = `xr-val xr-${type}`;
      if (type === 'string') {
        // Long string truncation with expand
        if (val.length > 200) {
          const short = `"${val.slice(0, 200)}…"`;
          const full  = `"${val}"`;
          v.textContent = short;
          v.title = 'Click to copy · Double-click to expand';
          v.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            v.textContent = v.textContent === short ? full : short;
          });
        } else {
          v.textContent = `"${val}"`;
          v.title = 'Click to copy';
        }
      } else {
        v.textContent = String(val);
        v.title = 'Click to copy';
      }

      v.addEventListener('click', (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(type === 'string' ? val : String(val)).catch(() => {});
        v.classList.add('xr-flash');
        setTimeout(() => v.classList.remove('xr-flash'), 700);
      });

      line.appendChild(v);
      parent.appendChild(line);
    }
  }

  // ── Raw ───────────────────────────────────────────────────────────────────

  function buildRaw(data) {
    const wrap = document.createElement('div');
    wrap.className = 'xr-raw-wrap';
    try {
      const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      const lines = text.split('\n');
      const gutter = document.createElement('div');
      gutter.className = 'xr-raw-gutter';
      const code = document.createElement('pre');
      code.className = 'xr-raw';
      lines.forEach((ln, i) => {
        const num = document.createElement('div');
        num.className = 'xr-raw-ln';
        num.textContent = i + 1;
        gutter.appendChild(num);
      });
      code.textContent = text;
      wrap.appendChild(gutter);
      wrap.appendChild(code);
    } catch {
      const pre = document.createElement('pre');
      pre.className = 'xr-raw';
      pre.textContent = String(data);
      wrap.appendChild(pre);
    }
    return wrap;
  }

  // ── Headers ───────────────────────────────────────────────────────────────

  function buildHeaders(reqHeaders, resHeaders) {
    const wrap = document.createElement('div');

    function addSection(title, headers) {
      if (!headers || Object.keys(headers).length === 0) return;
      const sec = document.createElement('div');
      sec.className = 'xr-hsec';
      sec.textContent = title;
      wrap.appendChild(sec);

      const table = document.createElement('table');
      table.className = 'xr-htable';
      Object.entries(headers).forEach(([k, v]) => {
        const tr = document.createElement('tr');
        const td1 = document.createElement('td');
        td1.textContent = k;
        const td2 = document.createElement('td');
        td2.textContent = v;
        tr.appendChild(td1);
        tr.appendChild(td2);
        table.appendChild(tr);
      });
      wrap.appendChild(table);
    }

    addSection('Response Headers', resHeaders);
    addSection('Request Headers', reqHeaders);

    if (wrap.children.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'xr-empty';
      empty.textContent = 'No headers captured';
      wrap.appendChild(empty);
    }

    return wrap;
  }

  // ── Expand / Collapse all ─────────────────────────────────────────────────

  function expandAll(treeRoot, expand) {
    treeRoot.querySelectorAll('.xr-tog:not(.xr-leaf)').forEach(tog => {
      const isOpen = tog.classList.contains('xr-open');
      if ((expand && !isOpen) || (!expand && isOpen)) tog.click();
    });
  }

  // ── Grid ─────────────────────────────────────────────────────────────────

  function buildGrid(data, onRowClick) {
    const rows = Array.isArray(data) ? data
      : (data && typeof data === 'object' ? [data] : null);

    if (!rows || rows.length === 0) {
      const el = document.createElement('div');
      el.className = 'xr-empty';
      el.textContent = Array.isArray(data) ? 'Empty array' : 'Not a list response';
      return el;
    }

    // Collect columns from first 100 rows
    const colSet = new Set();
    rows.slice(0, 100).forEach(r => {
      if (r && typeof r === 'object') Object.keys(r).forEach(k => colSet.add(k));
    });
    const cols = [...colSet];

    if (cols.length === 0) {
      const el = document.createElement('div');
      el.className = 'xr-empty';
      el.textContent = 'No columns detected';
      return el;
    }

    // Column type inference
    const colTypes = {};
    cols.forEach(col => {
      const vals = rows.slice(0, 50).map(r => r?.[col]).filter(v => v != null);
      if (vals.length && vals.every(v => typeof v === 'number')) colTypes[col] = 'number';
      else if (vals.length && vals.every(v => typeof v === 'boolean')) colTypes[col] = 'boolean';
      else colTypes[col] = 'string';
    });

    let sortCol = null, sortDir = 1;

    const wrap = document.createElement('div');
    wrap.className = 'xr-grid-wrap';

    const infoBar = document.createElement('div');
    infoBar.className = 'xr-grid-info';
    wrap.appendChild(infoBar);

    const tableWrap = document.createElement('div');
    tableWrap.className = 'xr-grid-table-wrap';
    wrap.appendChild(tableWrap);

    const table = document.createElement('table');
    table.className = 'xr-grid-table';
    tableWrap.appendChild(table);

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    const thIdx = document.createElement('th');
    thIdx.className = 'xr-grid-th xr-grid-idx';
    thIdx.textContent = '#';
    headerRow.appendChild(thIdx);

    cols.forEach(col => {
      const th = document.createElement('th');
      th.className = `xr-grid-th${colTypes[col] === 'number' ? ' xr-grid-col-num' : ''}`;
      th.dataset.col = col;

      const label = document.createElement('span');
      label.textContent = col;
      const sortIco = document.createElement('span');
      sortIco.className = 'xr-grid-sort-ico';
      th.appendChild(label);
      th.appendChild(sortIco);

      th.addEventListener('click', () => {
        if (sortCol === col) {
          if (sortDir === 1) sortDir = -1;
          else { sortCol = null; sortDir = 1; }
        } else { sortCol = col; sortDir = 1; }
        thead.querySelectorAll('.xr-grid-sort-ico').forEach(el => el.textContent = '');
        if (sortCol === col) sortIco.textContent = sortDir === 1 ? ' ↑' : ' ↓';
        renderRows();
      });
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    table.appendChild(tbody);

    const MAX = 500;

    function cellVal(v) {
      if (v === null || v === undefined) return { text: '—', cls: 'xr-gc-null' };
      if (typeof v === 'boolean') return { text: String(v), cls: v ? 'xr-gc-true' : 'xr-gc-false' };
      if (typeof v === 'number') return { text: String(v), cls: 'xr-gc-num' };
      if (Array.isArray(v)) return { text: `[${v.length}]`, cls: 'xr-gc-chip', tip: JSON.stringify(v).slice(0, 300) };
      if (typeof v === 'object') {
        const k = Object.keys(v).length;
        return { text: `{${k}}`, cls: 'xr-gc-chip', tip: JSON.stringify(v, null, 2).slice(0, 300) };
      }
      const s = String(v);
      return s.length > 80 ? { text: s.slice(0, 80) + '…', cls: '', tip: s } : { text: s, cls: '' };
    }

    function renderRows() {
      tbody.innerHTML = '';
      let sorted = rows;
      if (sortCol) {
        sorted = [...rows].sort((a, b) => {
          const av = a?.[sortCol], bv = b?.[sortCol];
          if (av == null && bv == null) return 0;
          if (av == null) return sortDir;
          if (bv == null) return -sortDir;
          if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sortDir;
          return String(av).localeCompare(String(bv)) * sortDir;
        });
      }

      const visible = sorted.slice(0, MAX);
      infoBar.textContent = rows.length > MAX
        ? `Showing ${MAX} of ${rows.length} rows · ${cols.length} cols`
        : `${rows.length} row${rows.length !== 1 ? 's' : ''} · ${cols.length} col${cols.length !== 1 ? 's' : ''}`;

      visible.forEach((row, idx) => {
        const tr = document.createElement('tr');
        tr.className = 'xr-grid-row';

        const tdIdx = document.createElement('td');
        tdIdx.className = 'xr-grid-td xr-grid-idx';
        tdIdx.textContent = idx + 1;
        tr.appendChild(tdIdx);

        cols.forEach(col => {
          const td = document.createElement('td');
          td.className = 'xr-grid-td';
          const { text, cls, tip } = cellVal(row?.[col]);
          if (cls) {
            const span = document.createElement('span');
            span.className = `xr-gc-badge ${cls}`;
            span.textContent = text;
            if (tip) span.title = tip;
            td.appendChild(span);
          } else {
            td.textContent = text;
            if (tip) td.title = tip;
          }
          tr.appendChild(td);
        });

        tr.addEventListener('click', () => {
          tbody.querySelectorAll('.xr-grid-row.xr-grid-sel').forEach(r => r.classList.remove('xr-grid-sel'));
          tr.classList.add('xr-grid-sel');
          if (onRowClick) onRowClick(row, idx);
        });

        tbody.appendChild(tr);
      });
    }

    renderRows();
    return wrap;
  }

  // ── Diff ──────────────────────────────────────────────────────────────────

  function buildDiff(a, b) {
    const wrap = document.createElement('div');
    wrap.className = 'xr-diff-wrap';

    const toolbar = document.createElement('div');
    toolbar.className = 'xr-diff-toolbar';

    const toggleLabel = document.createElement('label');
    toggleLabel.className = 'xr-diff-toggle';
    const toggleInput = document.createElement('input');
    toggleInput.type = 'checkbox';
    toggleLabel.appendChild(toggleInput);
    toggleLabel.appendChild(document.createTextNode(' Only changes'));
    toolbar.appendChild(toggleLabel);

    const legend = document.createElement('div');
    legend.className = 'xr-diff-legend';
    legend.innerHTML = `
      <span class="xr-diff-dot xr-diff-dot-added">+ added</span>
      <span class="xr-diff-dot xr-diff-dot-removed">− removed</span>
      <span class="xr-diff-dot xr-diff-dot-changed">~ changed</span>`;
    toolbar.appendChild(legend);
    wrap.appendChild(toolbar);

    const content = document.createElement('div');
    content.className = 'xr-diff-content';
    wrap.appendChild(content);

    let onlyChanges = false;

    function render() {
      content.innerHTML = '';
      if (a === undefined || b === undefined) {
        const msg = document.createElement('div');
        msg.className = 'xr-empty';
        msg.textContent = 'Select an entry to compare against';
        content.appendChild(msg);
        return;
      }
      _diffRender(content, a, b, null, 0, onlyChanges);
    }

    toggleInput.addEventListener('change', e => { onlyChanges = e.target.checked; render(); });
    render();
    return wrap;
  }

  function _hasDiff(a, b) {
    if (a === b) return false;
    if (a == null || b == null) return true;
    const ta = Array.isArray(a) ? 'array' : typeof a;
    const tb = Array.isArray(b) ? 'array' : typeof b;
    if (ta !== tb) return true;
    if (ta === 'object' || ta === 'array') {
      const all = new Set([...Object.keys(a), ...Object.keys(b)]);
      for (const k of all) if (_hasDiff(a[k], b[k])) return true;
      return false;
    }
    return a !== b;
  }

  function _diffStatus(a, b) {
    if (a === undefined) return 'added';
    if (b === undefined) return 'removed';
    if (a === b) return 'same';
    const ta = Array.isArray(a) ? 'array' : typeof a;
    const tb = Array.isArray(b) ? 'array' : typeof b;
    if (ta !== tb) return 'changed';
    if (ta === 'object' || ta === 'array') return _hasDiff(a, b) ? 'modified' : 'same';
    return 'changed';
  }

  function _diffRender(parent, a, b, key, depth, onlyChanges) {
    const indent = depth * 14;
    const status = _diffStatus(a, b);
    const val = b !== undefined ? b : a;
    const isComplex = val !== null && val !== undefined && typeof val === 'object';

    if (isComplex && (status === 'same' || status === 'modified')) {
      if (onlyChanges && status === 'same') return;

      const ta = Array.isArray(val) ? 'array' : 'object';
      const line = document.createElement('div');
      line.className = `xr-line xr-diff-line xr-diff-${status}`;
      line.style.paddingLeft = `${indent}px`;

      const tog = document.createElement('span');
      tog.className = 'xr-tog xr-open';
      line.appendChild(tog);

      if (key !== null) {
        const k = document.createElement('span');
        k.className = 'xr-key';
        k.textContent = typeof key === 'number' ? String(key) : `"${key}"`;
        const sep = document.createElement('span');
        sep.className = 'xr-punct';
        sep.textContent = ': ';
        line.appendChild(k);
        line.appendChild(sep);
      }

      const brack = document.createElement('span');
      brack.className = 'xr-brack';
      brack.textContent = ta === 'array' ? '[' : '{';
      line.appendChild(brack);
      parent.appendChild(line);

      const children = document.createElement('div');
      children.className = 'xr-children';
      children.style.setProperty('--xr-connector-left', `${indent + 7}px`);

      const aObj = (a && typeof a === 'object') ? a : {};
      const bObj = (b && typeof b === 'object') ? b : {};
      const allKeys = new Set([...Object.keys(aObj), ...Object.keys(bObj)]);

      // Sort: changed/added/removed first
      const sortedKeys = [...allKeys].sort((ka, kb) => {
        const sa = _diffStatus(aObj[ka], bObj[ka]) === 'same' ? 1 : 0;
        const sb = _diffStatus(aObj[kb], bObj[kb]) === 'same' ? 1 : 0;
        return sa - sb;
      });

      sortedKeys.forEach(k => _diffRender(children, aObj[k], bObj[k], k, depth + 1, onlyChanges));

      const cl = document.createElement('div');
      cl.className = 'xr-line xr-diff-line xr-diff-same';
      cl.style.paddingLeft = `${indent}px`;
      const spacer = document.createElement('span');
      spacer.className = 'xr-tog xr-leaf';
      cl.appendChild(spacer);
      const clBrack = document.createElement('span');
      clBrack.className = 'xr-brack';
      clBrack.textContent = ta === 'array' ? ']' : '}';
      cl.appendChild(clBrack);
      children.appendChild(cl);
      parent.appendChild(children);

      tog.addEventListener('click', e => {
        e.stopPropagation();
        const open = children.style.display !== 'none';
        children.style.display = open ? 'none' : 'block';
        tog.classList.toggle('xr-open', !open);
      });

    } else {
      if (onlyChanges && status === 'same') return;

      const line = document.createElement('div');
      line.className = `xr-line xr-diff-line xr-diff-${status}`;
      line.style.paddingLeft = `${indent}px`;

      const leaf = document.createElement('span');
      leaf.className = 'xr-tog xr-leaf';
      line.appendChild(leaf);

      if (key !== null) {
        const k = document.createElement('span');
        k.className = 'xr-key';
        k.textContent = typeof key === 'number' ? String(key) : `"${key}"`;
        const sep = document.createElement('span');
        sep.className = 'xr-punct';
        sep.textContent = ': ';
        line.appendChild(k);
        line.appendChild(sep);
      }

      if (status === 'changed') {
        const oldEl = _diffValEl(a);
        oldEl.classList.add('xr-diff-old-val');
        const arrow = document.createElement('span');
        arrow.className = 'xr-diff-arrow';
        arrow.textContent = ' → ';
        const newEl = _diffValEl(b);
        newEl.classList.add('xr-diff-new-val');
        line.appendChild(oldEl);
        line.appendChild(arrow);
        line.appendChild(newEl);
      } else {
        line.appendChild(_diffValEl(status === 'removed' ? a : b));
      }

      parent.appendChild(line);
    }
  }

  function _diffValEl(v) {
    const el = document.createElement('span');
    if (v === null) { el.className = 'xr-val xr-null'; el.textContent = 'null'; }
    else if (v === undefined) { el.className = 'xr-val xr-null'; el.textContent = 'undefined'; }
    else if (typeof v === 'boolean') { el.className = 'xr-val xr-boolean'; el.textContent = String(v); }
    else if (typeof v === 'number') { el.className = 'xr-val xr-number'; el.textContent = String(v); }
    else if (typeof v === 'object') {
      el.className = 'xr-val xr-object';
      const s = JSON.stringify(v);
      el.textContent = s.length > 80 ? s.slice(0, 80) + '…' : s;
    } else {
      el.className = 'xr-val xr-string';
      const s = String(v);
      el.textContent = `"${s.length > 80 ? s.slice(0, 80) + '…' : s}"`;
    }
    return el;
  }

  // ── Search mark/clear ─────────────────────────────────────────────────────

  function markSearch(root, query) {
    clearSearch(root);
    if (!query || query.length < 1) return { total: 0, els: [] };
    const q = query.toLowerCase();
    const hits = [];
    root.querySelectorAll('.xr-key, .xr-val').forEach(el => {
      if (el.textContent.toLowerCase().includes(q)) {
        el.classList.add('xr-search-hit');
        hits.push(el);
      }
    });
    return { total: hits.length, els: hits };
  }

  function clearSearch(root) {
    root.querySelectorAll('.xr-search-hit, .xr-search-current').forEach(el => {
      el.classList.remove('xr-search-hit', 'xr-search-current');
    });
  }

  return { buildTree, buildRaw, buildHeaders, expandAll, buildGrid, buildDiff, markSearch, clearSearch };
})();
