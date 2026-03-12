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
    const pre = document.createElement('pre');
    pre.className = 'xr-raw';
    try {
      pre.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    } catch {
      pre.textContent = String(data);
    }
    return pre;
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

  return { buildTree, buildRaw, buildHeaders, expandAll };
})();
