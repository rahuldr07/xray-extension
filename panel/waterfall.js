// panel/waterfall.js — Waterfall timeline renderer
window.XRAY_Waterfall = (() => {
  'use strict';

  function _methodClass(method) {
    return `xr-wf-${String(method || 'get').toLowerCase()}`;
  }

  function _safePath(entry) {
    return entry.urlPath || entry.url || '(unknown)';
  }

  function buildWaterfall(entries, opts = {}) {
    const list = (entries || [])
      .filter((e) => e && e.type === 'api' && Number.isFinite(Number(e.timestamp)))
      .slice()
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    const wrap = document.createElement('div');
    wrap.className = 'xr-waterfall-wrap';

    if (!list.length) {
      const empty = document.createElement('div');
      empty.className = 'xr-empty';
      empty.textContent = 'No API requests captured yet';
      wrap.appendChild(empty);
      return wrap;
    }

    const minTs = list[0].timestamp || 0;
    const maxEnd = list.reduce((acc, e) => {
      const end = (e.timestamp || 0) + Math.max(1, Number(e.duration) || 0);
      return Math.max(acc, end);
    }, minTs + 1);
    const span = Math.max(1, maxEnd - minTs);

    const axis = document.createElement('div');
    axis.className = 'xr-waterfall-axis';
    [0, 25, 50, 75, 100].forEach((pct) => {
      const tick = document.createElement('div');
      tick.className = 'xr-waterfall-axis-tick';
      tick.style.left = `${pct}%`;
      const ms = Math.round((span * pct) / 100);
      tick.textContent = `${ms}ms`;
      axis.appendChild(tick);
    });
    wrap.appendChild(axis);

    const body = document.createElement('div');
    body.className = 'xr-waterfall-body';
    wrap.appendChild(body);

    list.forEach((entry) => {
      const row = document.createElement('div');
      row.className = 'xr-waterfall-row';

      const label = document.createElement('div');
      label.className = 'xr-waterfall-label';
      label.textContent = `${(entry.method || 'GET').toUpperCase()} ${_safePath(entry)}`;
      row.appendChild(label);

      const lane = document.createElement('div');
      lane.className = 'xr-waterfall-lane';

      const bar = document.createElement('button');
      bar.className = `xr-waterfall-bar ${_methodClass(entry.method)}`;
      if (opts.selectedId && opts.selectedId === entry.id) bar.classList.add('xr-selected');

      const leftPct = (((entry.timestamp || 0) - minTs) / span) * 100;
      const widthPct = Math.max(0.8, ((Math.max(1, Number(entry.duration) || 1)) / span) * 100);
      bar.style.left = `${Math.max(0, leftPct)}%`;
      bar.style.width = `${Math.min(100 - leftPct, widthPct)}%`;
      bar.title = `${(entry.method || 'GET').toUpperCase()} ${_safePath(entry)} · ${entry.status || '—'} · ${entry.duration || 0}ms`;
      bar.setAttribute('aria-label', bar.title);

      const durationText = document.createElement('span');
      durationText.className = 'xr-waterfall-bar-text';
      durationText.textContent = `${entry.duration || 0}ms`;
      bar.appendChild(durationText);

      bar.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof opts.onSelect === 'function') opts.onSelect(entry.id);
      });

      lane.appendChild(bar);
      row.appendChild(lane);
      body.appendChild(row);
    });

    return wrap;
  }

  return { buildWaterfall };
})();
