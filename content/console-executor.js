// content/console-executor.js - Console code executor (MAIN world).
(function () {
  'use strict';

  if (window.__XRAY_console_executor__) return;
  window.__XRAY_console_executor__ = true;

  const MAX_RESULT_CHARS = 200000;
  const VALID_NAME = /^[A-Za-z_$][\w$]*$/;

  function _sessionOk(sessionId) {
    if (sessionId !== window.__XRAY_CONSOLE_SESSION) return false;
    return !!sessionId;
  }

  function _resultType(value) {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  }

  function _safeSerialize(value) {
    const seen = typeof WeakSet !== 'undefined' ? new WeakSet() : null;
    let truncated = false;

    function normalize(input, depth = 0) {
      if (depth > 8) {
        truncated = true;
        return '[Max depth]';
      }
      if (input === null || input === undefined) return input;
      const type = typeof input;
      if (type === 'string') {
        if (input.length > MAX_RESULT_CHARS) {
          truncated = true;
          return input.slice(0, MAX_RESULT_CHARS) + `... (${input.length} chars)`;
        }
        return input;
      }
      if (type === 'number' || type === 'boolean') return input;
      if (type === 'bigint') return input.toString() + 'n';
      if (type === 'symbol') return String(input);
      if (type === 'function') return `[Function: ${input.name || 'anonymous'}]`;
      if (input instanceof Error) {
        return { __type__: 'Error', name: input.name, message: input.message, stack: input.stack };
      }
      if (input instanceof Date) return { __type__: 'Date', iso: input.toISOString() };
      if (typeof Element !== 'undefined' && input instanceof Element) {
        return `<${input.tagName.toLowerCase()}${input.id ? '#' + input.id : ''}>`;
      }
      if (seen) {
        if (seen.has(input)) return '[Circular]';
        seen.add(input);
      }
      if (Array.isArray(input)) {
        const limit = Math.min(input.length, 1000);
        const out = input.slice(0, limit).map((item) => normalize(item, depth + 1));
        if (input.length > limit) {
          truncated = true;
          out.push(`... +${input.length - limit} more`);
        }
        return out;
      }
      const out = {};
      const keys = Object.keys(input);
      const limit = Math.min(keys.length, 500);
      for (let i = 0; i < limit; i++) {
        const key = keys[i];
        try { out[key] = normalize(input[key], depth + 1); } catch { out[key] = '[Error reading property]'; }
      }
      if (keys.length > limit) {
        truncated = true;
        out['...'] = `+${keys.length - limit} more keys`;
      }
      return out;
    }

    const result = normalize(value);
    let json = '';
    try { json = JSON.stringify(result); } catch {}
    if (json.length > MAX_RESULT_CHARS) {
      truncated = true;
      return {
        result: json.slice(0, MAX_RESULT_CHARS) + `... (${json.length} chars)`,
        truncated,
      };
    }
    return { result, truncated };
  }

  function _isExpression(code) {
    return !code.includes(';') &&
      !code.includes('\n') &&
      !/^(const|let|var|if|for|while|switch|try|class|function|return)\s/.test(code.trim());
  }

  function _post(payload) {
    window.postMessage(payload, '*');
  }

  window.addEventListener('message', async (event) => {
    if (event.source !== window) return;
    if (!event.data || typeof event.data !== 'object') return;

    if (event.data.type === 'XRAY_CONSOLE_SESSION') {
      const { sessionId } = event.data;
      // First write wins, matching the bridge-token handshake in content.js. Assigning
      // unconditionally let any page script overwrite the live session id, after which
      // every real XRAY_EXEC_REQUEST failed _sessionOk and was silently dropped —
      // a one-line permanent denial of service against the console.
      if (
        !window.__XRAY_CONSOLE_SESSION &&
        typeof sessionId === 'string' &&
        sessionId.startsWith('xray_console_')
      ) {
        window.__XRAY_CONSOLE_SESSION = sessionId;
      }
      return;
    }

    if (event.data.type !== 'XRAY_EXEC_REQUEST') return;

    const { id, code, context, sessionId } = event.data;
    if (!_sessionOk(sessionId)) return;

    try {
      const helpers = window.XRAY_ConsoleHelpers;
      const runtime = helpers?.createRuntime
        ? helpers.createRuntime(context || {}, (text) => navigator.clipboard?.writeText?.(text))
        : {};
      Object.assign(runtime, context?.scope || {}, context?.pins || {});

      const names = Object.keys(runtime).filter((name) => VALID_NAME.test(name));
      const values = names.map((name) => runtime[name]);
      const body = _isExpression(code) ? `return (${code})` : code;

      const fn = new Function(...names, `'use strict'; return (async () => { ${body} })()`);
      const raw = await fn(...values);
      const serialized = _safeSerialize(raw);

      _post({
        type: 'XRAY_EVAL_RESULT',
        sessionId,
        id,
        success: true,
        resultType: _resultType(raw),
        result: serialized.result,
        truncated: serialized.truncated,
      });
    } catch (err) {
      _post({
        type: 'XRAY_EVAL_RESULT',
        sessionId,
        id,
        success: false,
        error: {
          message: err?.message || String(err),
          stack: err?.stack || '',
        },
      });
    }
  });
})();
