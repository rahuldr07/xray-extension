// shared/console-helpers.js - Shared XRAY console helper primitives.
(function () {
  'use strict';

  const MAX_SCHEMA_DEPTH = 5;

  function parseBody(body) {
    if (body == null || body === '') return null;
    if (typeof body === 'object') return body;
    if (typeof body === 'string') {
      const trimmed = body.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try { return JSON.parse(trimmed); } catch {}
      }
    }
    return body;
  }

  function parseUrl(url) {
    if (!url) return null;
    try {
      const parsed = new URL(url);
      return {
        full: url,
        origin: parsed.origin,
        host: parsed.host,
        path: parsed.pathname,
        query: parsed.search,
      };
    } catch {
      return { full: url, origin: '', host: '', path: String(url), query: '' };
    }
  }

  function parseParams(url) {
    if (!url) return {};
    try {
      const parsed = new URL(url);
      return Object.fromEntries(parsed.searchParams);
    } catch {
      return {};
    }
  }

  function toCSV(arr) {
    if (!Array.isArray(arr) || !arr.length) return '';
    const keys = Object.keys(arr[0] || {});
    const header = keys.join(',');
    const rows = arr.map((row) => keys.map((key) => {
      const value = row?.[key];
      if (value == null) return '';
      const text = typeof value === 'string' ? value : JSON.stringify(value);
      return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    }).join(','));
    return [header, ...rows].join('\n');
  }

  function toTable(data) {
    return { __xr_render: 'table', data: Array.isArray(data) ? data : [] };
  }

  function diff(a, b) {
    const result = { added: {}, removed: {}, changed: {} };
    const aKeys = new Set(Object.keys(a || {}));
    const bKeys = new Set(Object.keys(b || {}));
    for (const key of bKeys) {
      if (!aKeys.has(key)) result.added[key] = b[key];
    }
    for (const key of aKeys) {
      if (!bKeys.has(key)) {
        result.removed[key] = a[key];
      } else if (JSON.stringify(a[key]) !== JSON.stringify(b[key])) {
        result.changed[key] = { from: a[key], to: b[key] };
      }
    }
    return result;
  }

  function schema(value, depth = 0) {
    if (depth > MAX_SCHEMA_DEPTH) return 'any';
    if (value === null) return 'null';
    if (Array.isArray(value)) return value.length ? [schema(value[0], depth + 1)] : 'array';
    if (typeof value === 'object') {
      const out = {};
      for (const [key, child] of Object.entries(value || {})) {
        out[key] = schema(child, depth + 1);
      }
      return out;
    }
    return typeof value;
  }

  function pick(obj, keys) {
    return (keys || []).reduce((acc, key) => {
      if (Object.prototype.hasOwnProperty.call(obj || {}, key)) acc[key] = obj[key];
      return acc;
    }, {});
  }

  function omit(obj, keys) {
    const omitSet = new Set(keys || []);
    return Object.fromEntries(Object.entries(obj || {}).filter(([key]) => !omitSet.has(key)));
  }

  function flatten(obj, prefix = '') {
    const out = {};
    for (const [key, value] of Object.entries(obj || {})) {
      const path = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(out, flatten(value, path));
      } else {
        out[path] = value;
      }
    }
    return out;
  }

  // POSIX single-quote quoting: everything inside '...' is literal except a single
  // quote itself, which is emitted by closing the quote, escaping one, and reopening.
  //
  // Every field interpolated into a curl command must go through this. Entry fields are
  // attacker-controlled — the URL is whatever the intercepted request used, and the
  // WHATWG URL parser does not percent-encode an apostrophe in the path or query, so
  // a page calling fetch("https://x.test/a';id;echo'") could otherwise produce a
  // command that runs `id` when the operator pastes it into a shell. Imported HAR
  // files are a second, entirely unfiltered source.
  function _shellQuote(value) {
    return `'${String(value === undefined || value === null ? '' : value).replace(/'/g, "'\\''")}'`;
  }

  function generateCurl(entry) {
    if (!entry) return '// No request selected';
    const method = entry.method || 'GET';
    let command = `curl ${_shellQuote(entry.url || '')} \\\n  -X ${_shellQuote(method)}`;
    for (const [key, value] of Object.entries(entry.requestHeaders || {})) {
      command += ` \\\n  -H ${_shellQuote(`${String(key)}: ${String(value)}`)}`;
    }
    if (entry.requestBody && method !== 'GET' && method !== 'HEAD') {
      const body = typeof entry.requestBody === 'string' ? entry.requestBody : JSON.stringify(entry.requestBody);
      command += ` \\\n  --data-raw ${_shellQuote(body)}`;
    }
    return command;
  }

  function generateFetch(entry) {
    if (!entry) return '// No request selected';
    const method = entry.method || 'GET';
    const options = { method, headers: entry.requestHeaders || {} };
    if (entry.requestBody && method !== 'GET' && method !== 'HEAD') {
      options.body = typeof entry.requestBody === 'string' ? entry.requestBody : JSON.stringify(entry.requestBody);
    }
    return `fetch(${JSON.stringify(entry.url || '')}, ${JSON.stringify(options, null, 2)})`;
  }

  function buildMock(entry) {
    if (!entry || entry.type !== 'api') return '// Select an API request first';
    const body = parseBody(entry.responseDecrypted || entry.responseRaw);
    return {
      url: entry.url || '',
      method: (entry.method || 'GET').toUpperCase(),
      status: Number(entry.status) || 200,
      response: body,
    };
  }

  function sameEndpoint(a, b) {
    if (!a || !b) return false;
    const aKey = a.urlPath || a.url || '';
    const bKey = b.urlPath || b.url || '';
    return !!aKey && aKey === bKey;
  }

  function siblingEntry(entries, current, direction) {
    if (!current) return null;
    const currentIndex = entries.findIndex((entry) => entry.id === current.id);
    if (currentIndex < 0) return null;
    for (let i = currentIndex + direction; i >= 0 && i < entries.length; i += direction) {
      if (entries[i]?.type === 'api' && sameEndpoint(entries[i], current)) return entries[i];
    }
    return null;
  }

  const lodashLite = {
    map: (arr, fn) => Array.isArray(arr) ? arr.map(fn) : [],
    filter: (arr, fn) => Array.isArray(arr) ? arr.filter(fn) : [],
    find: (arr, fn) => Array.isArray(arr) ? arr.find(fn) : undefined,
    pluck: (arr, key) => Array.isArray(arr) ? arr.map((item) => item?.[key]) : [],
    groupBy: (arr, key) => Array.isArray(arr)
      ? arr.reduce((acc, item) => {
        const group = typeof key === 'function' ? key(item) : item?.[key];
        (acc[group] = acc[group] || []).push(item);
        return acc;
      }, {})
      : {},
    uniq: (arr) => [...new Set(Array.isArray(arr) ? arr : [])],
    sortBy: (arr, key) => Array.isArray(arr)
      ? [...arr].sort((a, b) => {
        const av = typeof key === 'function' ? key(a) : a?.[key];
        const bv = typeof key === 'function' ? key(b) : b?.[key];
        return av < bv ? -1 : av > bv ? 1 : 0;
      })
      : [],
    sum: (arr, key) => Array.isArray(arr)
      ? arr.reduce((sum, item) => sum + (Number(key ? (typeof key === 'function' ? key(item) : item?.[key]) : item) || 0), 0)
      : 0,
  };

  function createRuntime(context = {}, clipboardWriter) {
    const entries = Array.isArray(context.entries) ? context.entries : [];
    const current = context.currentEntry || null;
    const currentIndex = current ? entries.findIndex((entry) => entry.id === current.id) : -1;
    const response = parseBody(current?.responseDecrypted || current?.responseRaw);
    const request = parseBody(current?.requestBody);
    const responseHeaders = current?.responseHeaders || {};
    const requestHeaders = current?.requestHeaders || {};
    const similarEntries = () => entries.filter((entry) => entry.type === 'api' && sameEndpoint(entry, current) && entry.id !== current?.id);
    const previousSameEndpoint = siblingEntry(entries, current, -1);
    const nextSameEndpoint = siblingEntry(entries, current, 1);
    const previousResponse = parseBody(previousSameEndpoint?.responseDecrypted || previousSameEndpoint?.responseRaw);
    const nextResponse = parseBody(nextSameEndpoint?.responseDecrypted || nextSameEndpoint?.responseRaw);
    const copy = (value) => {
      const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
      if (clipboardWriter) clipboardWriter(text);
      return `Copied ${text.length} chars`;
    };

    return {
      $r: current,
      $res: response,
      $req: request,
      $headers: responseHeaders,
      $h: responseHeaders,
      $rh: requestHeaders,
      $url: parseUrl(current?.url),
      $params: parseParams(current?.url),
      $statusCode: Number(current?.status) || 0,
      $time: Number(current?.duration) || 0,
      $size: Number(current?.size) || 0,
      $method: (current?.method || 'GET').toUpperCase(),
      $all: () => entries,
      $similar: similarEntries,
      $prev: () => currentIndex > 0 ? entries[currentIndex - 1] : null,
      $next: () => currentIndex >= 0 && currentIndex < entries.length - 1 ? entries[currentIndex + 1] : null,
      $errors: () => entries.filter((entry) => entry.type === 'api' && Number(entry.status) >= 400),
      $slow: (ms = 1000) => entries.filter((entry) => entry.type === 'api' && Number(entry.duration) >= Number(ms)),
      $status: (code) => entries.filter((entry) => entry.type === 'api' && Number(entry.status) === Number(code)),
      $endpoint: (path) => entries.filter((entry) => entry.type === 'api' && String(entry.urlPath || entry.url || '').includes(String(path || ''))),
      $domain: (host) => entries.filter((entry) => {
        try { return new URL(entry.url || '').host.includes(String(host || '')); } catch { return false; }
      }),
      $schema: schema,
      $mock: (entry = current) => buildMock(entry),
      $copy: copy,
      $curl: generateCurl(current),
      $fetch: generateFetch(current),
      entry: current,
      res: response,
      response,
      req: request,
      request,
      headers: responseHeaders,
      responseHeaders,
      requestHeaders,
      prev: previousResponse,
      next: nextResponse,
      prevEntry: previousSameEndpoint,
      nextEntry: nextSameEndpoint,
      all: () => entries,
      similar: similarEntries,
      errors: () => entries.filter((entry) => entry.type === 'api' && Number(entry.status) >= 400),
      slow: (ms = 1000) => entries.filter((entry) => entry.type === 'api' && Number(entry.duration) >= Number(ms)),
      copy,
      csv: toCSV,
      table: toTable,
      toCSV,
      toTable,
      diff,
      schema,
      mock: (entry = current) => buildMock(entry),
      pick,
      omit,
      flatten,
      _: lodashLite,
      $help: HELP_TEXT,
      help: HELP_TEXT,
    };
  }

  const HELP_TEXT = [
    'XRAY console helpers — the prompt evaluates against the selected request.',
    '',
    'Selected request',
    '  res / response        parsed response body',
    '  req / request         parsed request body',
    '  entry                 the full captured entry',
    '  headers / requestHeaders    response / request headers',
    '  $curl, $fetch         copy-ready cURL / fetch() for the request',
    '',
    'Navigate & query',
    '  prev, next            previous / next response on this endpoint',
    '  prevEntry, nextEntry  the matching entries',
    '  all()                 every captured entry (recent ones in full)',
    '  similar()             entries for the same endpoint',
    '  errors()              entries with status >= 400',
    '  slow(ms = 1000)       entries slower than ms',
    '',
    'Transform',
    '  schema(x)             infer a structural schema',
    '  diff(a, b)            structural diff of two values',
    '  pick(obj, keys), omit(obj, keys), flatten(obj)',
    '  toCSV(rows), toTable(rows), mock(entry?)',
    '  _.groupBy / _.sortBy / _.uniq / _.countBy ...',
    '',
    'Utilities',
    '  copy(x)               copy a value to the clipboard',
    '  pin("name")           pin the selected entry as a variable',
    '',
    'Multiline: Shift+Enter. History: ArrowUp / ArrowDown.',
  ].join('\n');

  window.XRAY_ConsoleHelpers = {
    parseBody,
    parseUrl,
    parseParams,
    toCSV,
    toTable,
    diff,
    schema,
    pick,
    omit,
    flatten,
    generateCurl,
    generateFetch,
    buildMock,
    createRuntime,
  };
})();
