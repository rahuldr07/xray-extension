// shared/worker-client.js — Typed client for communicating with xray-worker.js
// Provides promise-based API with automatic message ID management
window.XRAY_Worker = (() => {
  'use strict';

  let _worker = null;
  let _ready = false;
  const _pending = new Map(); // id -> { resolve, reject }
  let _idCounter = 0;
  let _readyPromise = null;
  let _readyResolve = null;
  let _readySettled = false;
  let _restartAttempts = 0;
  let _startupTimer = null;
  let _health = {
    state: 'unknown',
    event: 'initializing',
    restartCount: 0,
    lastErrorCode: null,
    lastEventAt: null,
    cache: { state: 'unknown', lastErrorCode: null, lastEventAt: null },
  };
  const _healthListeners = new Set();

  function _healthSnapshot() {
    return { ..._health };
  }

  function _emitHealth(state, event, errorCode = null) {
    _health = { ..._health, state, event, lastErrorCode: errorCode, lastEventAt: Date.now() };
    const receipt = _healthSnapshot();
    _healthListeners.forEach((listener) => {
      try { listener(receipt); } catch { /* diagnostics must not affect transport */ }
    });
  }

  function _applyCacheHealth(receipt) {
    const cache = receipt && typeof receipt === 'object' ? receipt : {};
    const state = cache.state === 'healthy' || cache.state === 'degraded' ? cache.state : 'unknown';
    const lastErrorCode = typeof cache.lastErrorCode === 'string' && /^cache-[a-z-]+$/.test(cache.lastErrorCode)
      ? cache.lastErrorCode : null;
    const lastEventAt = Number.isFinite(Number(cache.lastEventAt)) ? Number(cache.lastEventAt) : null;
    const previousCode = _health.cache?.lastErrorCode;
    const workerError = _health.lastErrorCode === previousCode || _health.lastErrorCode?.startsWith('cache-')
      ? lastErrorCode : _health.lastErrorCode;
    const workerState = state === 'degraded' && ['healthy', 'unknown'].includes(_health.state)
      ? 'degraded'
      : state === 'healthy' && _health.state === 'degraded' && _health.event === 'cache-degraded'
        ? 'healthy' : _health.state;
    _health = { ..._health, state: workerState, event: state === 'degraded' ? 'cache-degraded' : _health.event, lastErrorCode: workerError, cache: { state, lastErrorCode, lastEventAt } };
    const next = _healthSnapshot();
    _healthListeners.forEach((listener) => {
      try { listener(next); } catch { /* diagnostics must not affect transport */ }
    });
  }

  function _settleReady(receipt = _healthSnapshot()) {
    if (_readySettled) return;
    _readySettled = true;
    _readyResolve?.(receipt);
  }

  function _beginReadyWait() {
    _readySettled = false;
    _readyPromise = new Promise((resolve) => { _readyResolve = resolve; });
    return _readyPromise;
  }

  function _rejectPending(error) {
    const handlers = Array.from(_pending.values());
    _pending.clear();
    handlers.forEach((handler) => handler.reject(error));
  }

  function _detachWorker(worker) {
    clearTimeout(_startupTimer);
    _startupTimer = null;
    if (!worker) return;
    try { worker.terminate?.(); } catch { /* already terminated */ }
  }

  function _isPolicyFailure(error) {
    return error?.name === 'SecurityError' || error?.error?.name === 'SecurityError'
      || /securityerror|content security policy|\bcsp\b|worker-src|script-src|cannot be accessed from origin/i.test(error?.message || '');
  }

  function _handleWorkerFailure(worker, event, errorCode, retryable = true) {
    if (worker !== _worker) return;
    _worker = null;
    _ready = false;
    _rejectPending(new Error('Worker unavailable'));
    _detachWorker(worker);

    if (retryable && _restartAttempts < 1) {
      _restartAttempts += 1;
      _health = { ..._health, restartCount: _restartAttempts };
      _emitHealth('degraded', 'restart-attempt', errorCode);
      // Keep callers already waiting for initial readiness attached to this attempt.
      if (_readySettled) _beginReadyWait();
      const workerUrl = globalThis.chrome?.runtime?.getURL?.('workers/xray-worker.js');
      if (workerUrl) {
        _startWorker(workerUrl);
        return;
      }
    }

    _emitHealth('unavailable', retryable ? 'restart-failed' : event, errorCode);
    _settleReady();
  }

  function _startWorker(workerUrl) {
    try {
      // Packaged workers only: blob workers inherit the visited site's origin/CSP.
      _worker = new Worker(workerUrl);
    } catch (error) {
      const blocked = _isPolicyFailure(error);
      _handleWorkerFailure(null, 'create-failed', blocked ? 'worker-policy-blocked' : 'worker-create-failed', !blocked);
      return false;
    }

    const worker = _worker;
    worker.onmessage = (e) => {
      if (worker !== _worker) return;
       const { id, success, result, error, health } = e.data || {};
       if (health?.cache) _applyCacheHealth(health.cache);
      if (id === '__ready__') {
        clearTimeout(_startupTimer);
        _startupTimer = null;
        _ready = true;
        _emitHealth(
          _health.cache.state === 'degraded' ? 'degraded' : 'healthy',
          _health.cache.state === 'degraded' ? 'cache-degraded' : _restartAttempts ? 'restarted' : 'ready',
          _health.cache.lastErrorCode ?? (_restartAttempts ? _health.lastErrorCode : null),
        );
        _settleReady();
        return;
      }

      const handler = _pending.get(id);
      if (!handler) return;
      _pending.delete(id);
      if (success) handler.resolve(result);
      else handler.reject(new Error(error || 'Worker error'));
    };
    worker.onerror = (error) => {
      const blocked = _isPolicyFailure(error);
      _handleWorkerFailure(worker, 'error', blocked ? 'worker-policy-blocked' : 'worker-error', !blocked);
    };
    worker.onmessageerror = () => _handleWorkerFailure(worker, 'message-error', 'worker-message-error');
    _startupTimer = setTimeout(() => {
      _handleWorkerFailure(worker, 'startup-timeout', 'worker-startup-timeout');
    }, 30000);
    _send('init', {}).catch((error) => {
      const blocked = _isPolicyFailure(error);
      _handleWorkerFailure(worker, 'init-failed', blocked ? 'worker-policy-blocked' : 'worker-init-failed', !blocked);
    });
    return true;
  }

  function init() {
    if (_worker || (_readyPromise && !_readySettled)) return _readyPromise;
    if (_readyPromise && _readySettled && _health.state !== 'unknown') return _readyPromise;
    _beginReadyWait();

    // Create worker - ONLY use chrome.runtime.getURL for proper extension context.
    const workerUrl = globalThis.chrome?.runtime?.getURL?.('workers/xray-worker.js');
    if (!workerUrl) {
      console.warn('[XRAY Worker] chrome.runtime.getURL not available, running without worker');
      _ready = false;
      _emitHealth('degraded', 'missing-worker', 'worker-missing');
      _settleReady();
      return _readyPromise;
    }
    // Isolated content scripts still use the document's HTTP(S) origin. A packaged
    // extension worker is incompatible there; leave analysis to existing fallbacks.
    if (typeof location !== 'undefined' && /^https?:$/.test(location.protocol)
      && /^(chrome|moz)-extension:/.test(workerUrl)) {
      _emitHealth('unavailable', 'origin-unavailable', 'worker-origin-unavailable');
      _settleReady();
      return _readyPromise;
    }
    _startWorker(workerUrl);
    return _readyPromise;
  }

  function _send(action, payload, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const id = `msg_${++_idCounter}`;
      const timer = setTimeout(() => {
        _pending.delete(id);
        reject(new Error(`Worker timeout: ${action}`));
      }, timeout);

      _pending.set(id, {
        resolve: (result) => { clearTimeout(timer); resolve(result); },
        reject: (error) => { clearTimeout(timer); reject(error); },
      });

      if (_worker) {
        try {
          _worker.postMessage({ id, action, payload });
        } catch {
          _pending.delete(id);
          clearTimeout(timer);
          reject(new Error('Worker unavailable'));
        }
      } else {
        _pending.delete(id);
        clearTimeout(timer);
        reject(new Error('Worker not available'));
      }
    });
  }

  return {
    init,
    isReady() { return _ready; },
    async whenReady() { await init(); },
    onHealth(listener) {
      if (typeof listener !== 'function') return () => {};
      _healthListeners.add(listener);
      return () => _healthListeners.delete(listener);
    },
    subscribeHealth(listener) {
      if (typeof listener !== 'function') return () => {};
      _healthListeners.add(listener);
      return () => _healthListeners.delete(listener);
    },
    getHealth() { return _healthSnapshot(); },

    async addEntry(entry) {
      if (!_worker) return { added: false };
      return _send('addEntry', { entry });
    },
    async search(query, entries) {
      if (!_worker) {
        if (!query?.trim()) return entries;
        const q = query.trim().toLowerCase();
        return entries.filter(e => JSON.stringify(e).toLowerCase().includes(q));
      }
      return _send('search', { query, entries });
    },
    async computeStats(data) {
      if (!_worker) return { keyCount: 0, arrayCount: 0 };
      return _send('computeStats', { data });
    },
    async computeDiff(a, b) {
      if (!_worker) return [];
      return _send('computeDiff', { a, b });
    },
    async inferSchema(data) {
      if (!_worker) return null;
      return _send('inferSchema', { data });
    },
    async detailAnalysis(current, previous = null) {
      if (!_worker) return null;
      return _send('detailAnalysis', { current, previous });
    },
    async exportCSV(entries) {
      if (!_worker) return '';
      return _send('exportCSV', { entries });
    },
    async exportHAR(entries) {
      if (!_worker) return { log: { entries: [] } };
      return _send('exportHAR', { entries });
    },
    async analyze(entries) {
      if (!_worker) return {};
      return _send('analyze', { entries });
    },
    async clone(data) {
      if (!_worker) {
        try { return JSON.parse(JSON.stringify(data)); } catch { return null; }
      }
      return _send('clone', { data });
    },
    async getFromCache(id) {
      if (!_worker) return null;
      return _send('getFromCache', { id });
    },
     async captureReceipt(accepted, dropped, dropReasons = {}, delivery = {}) {
       if (!_worker) return { accepted: 0, dropped: 0, dropReasons: {} };
       if (accepted && typeof accepted === 'object') return _send('captureReceipt', accepted);
       return _send('captureReceipt', { accepted, dropped, dropReasons, delivery });
    },
    terminate() {
      if (!_worker) return;
      const worker = _worker;
      _worker = null;
      _ready = false;
      _rejectPending(new Error('Worker terminated'));
      _detachWorker(worker);
      _emitHealth('unavailable', 'terminated', 'worker-terminated');
      _settleReady();
    },
    // Test-only transport observability; no captured data crosses this boundary.
    __testing: { send: _send, pendingCount: () => _pending.size },
  };
})();
