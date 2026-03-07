// content/console-capture.js — console.log/warn/error hijack (MAIN world)
(function () {
  'use strict';

  if (window.__xray_console_installed__) return;
  window.__xray_console_installed__ = true;

  function _uid() {
    return 'xrl_' + Date.now().toString(36) + '_' + (Math.random() * 1e9 | 0).toString(36);
  }

  function _emit(level, args) {
    let data;
    if (args.length === 0) {
      data = null;
    } else if (args.length === 1) {
      data = args[0];
    } else {
      // Multiple args: store as array, but try to serialise safely
      data = Array.from(args).map(a => {
        if (a === null || a === undefined) return a;
        if (typeof a !== 'object' && typeof a !== 'function') return a;
        try { return JSON.parse(JSON.stringify(a)); } catch { return String(a); }
      });
    }

    window.postMessage({ __xray_capture__: true, entry: {
        id: _uid(),
        type: 'log',
        timestamp: Date.now(),
        logLevel: level,
        logData: data,
        pinned: false,
      }
    }, '*');
  }

  ['log', 'warn', 'error'].forEach(level => {
    const orig = console[level].bind(console);
    console[level] = function (...args) {
      orig(...args);         // always preserve original behaviour
      try { _emit(level, args); } catch { /* never crash the page */ }
    };
  });
})();
