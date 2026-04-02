// content/console-executor.js — Console code executor (MAIN world)
// Executes user code in MAIN world to avoid CSP restrictions.
(function () {
  'use strict';

  if (window.__XRAY_console_executor__) return; // Already installed
  window.__XRAY_console_executor__ = true;

  // Listen for execution requests from ISOLATED world
  window.addEventListener('message', async (event) => {
    if (!event.data || event.data.type !== 'XRAY_EXEC_REQUEST') return;

    const { id, code, context } = event.data;

    try {
      // Helper functions available in console
      const toCSV = (arr) => {
        if (!Array.isArray(arr) || !arr.length) return '';
        const keys = Object.keys(arr[0]);
        const header = keys.join(',');
        const rows = arr.map(row => keys.map(k => {
          let v = row[k];
          if (typeof v === 'string' && (v.includes(',') || v.includes('"'))) {
            v = '"' + v.replace(/"/g, '""') + '"';
          }
          return v ?? '';
        }).join(','));
        return [header, ...rows].join('\n');
      };

      const toTable = (arr) => ({ __xr_render: 'table', data: arr });

      const diff = (a, b) => {
        const result = { added: {}, removed: {}, changed: {} };
        const aKeys = new Set(Object.keys(a || {}));
        const bKeys = new Set(Object.keys(b || {}));
        for (const k of bKeys) if (!aKeys.has(k)) result.added[k] = b[k];
        for (const k of aKeys) {
          if (!bKeys.has(k)) result.removed[k] = a[k];
          else if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) {
            result.changed[k] = { from: a[k], to: b[k] };
          }
        }
        return result;
      };

      const schema = (obj, depth = 0) => {
        if (depth > 5) return 'any';
        if (obj === null) return 'null';
        if (Array.isArray(obj)) return obj.length ? [schema(obj[0], depth + 1)] : 'array';
        if (typeof obj === 'object') {
          const s = {};
          for (const [k, v] of Object.entries(obj)) s[k] = schema(v, depth + 1);
          return s;
        }
        return typeof obj;
      };

      const pick = (obj, keys) => keys.reduce((acc, k) => {
        if (k in (obj || {})) acc[k] = obj[k];
        return acc;
      }, {});

      const omit = (obj, keys) => Object.fromEntries(
        Object.entries(obj || {}).filter(([k]) => !keys.includes(k))
      );

      const flatten = (obj, prefix = '') => {
        const result = {};
        for (const [k, v] of Object.entries(obj || {})) {
          const key = prefix ? prefix + '.' + k : k;
          if (v && typeof v === 'object' && !Array.isArray(v)) {
            Object.assign(result, flatten(v, key));
          } else {
            result[key] = v;
          }
        }
        return result;
      };

      const copy = (val) => {
        navigator.clipboard.writeText(
          typeof val === 'string' ? val : JSON.stringify(val, null, 2)
        );
        return '✓ Copied';
      };

      // Detect expression vs statement
      const isExpr = !code.includes(';') && !code.includes('\n') &&
        !/^(const|let|var|if|for|while|switch|try)\s/.test(code);
      const body = isExpr ? 'return (' + code + ')' : code;

      // Extract context variables
      const {
        $res, $req, $h, $rh, $url, $params, $status, $time, $size, $method,
        $all, $similar, $prev, $next, $r, $curl, $fetch
      } = context;

      // Execute code
      const fn = new Function(
        '$res', '$req', '$h', '$rh', '$url', '$params', '$status', '$time', '$size', '$method',
        '$all', '$similar', '$prev', '$next', '$r', '$curl', '$fetch',
        'toCSV', 'toTable', 'diff', 'schema', 'pick', 'omit', 'flatten', 'copy',
        'return (async () => { ' + body + ' })()'
      );

      const result = await fn(
        $res, $req, $h, $rh, $url, $params, $status, $time, $size, $method,
        $all, $similar, $prev, $next, $r, $curl, $fetch,
        toCSV, toTable, diff, schema, pick, omit, flatten, copy
      );

      // Determine type
      let resultType = typeof result;
      if (result === undefined) resultType = 'undefined';
      else if (result === null) resultType = 'null';
      else if (Array.isArray(result)) resultType = 'array';
      else if (typeof result === 'object') resultType = 'object';

      // Serialize result
      let serialized = result;
      if (typeof result === 'object' && result !== null) {
        try {
          serialized = JSON.parse(JSON.stringify(result));
        } catch {
          serialized = String(result);
        }
      }

      // Send result back to ISOLATED world
      window.postMessage({
        type: 'XRAY_EVAL_RESULT',
        id,
        success: true,
        resultType,
        result: serialized
      }, '*');

    } catch (err) {
      // Send error back
      window.postMessage({
        type: 'XRAY_EVAL_RESULT',
        id,
        success: false,
        error: {
          message: err.message,
          stack: err.stack
        }
      }, '*');
    }
  });
})();
