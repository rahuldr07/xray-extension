// shared/console-helpers.js - Shared XRAY console helper primitives.
(function () {
  'use strict';

  // Natives taken when the module is evaluated — in the page, that is when XRAY creates the
  // console scope, before any command — so a page that replaces JSON.parse/stringify,
  // Object.defineProperty or hasOwnProperty later never sees what the helpers pass them
  // (threat model C-1; a page that replaced them earlier is an accepted limit).
  const _jsonParse = JSON.parse;
  const _jsonStringify = JSON.stringify;
  const _defineProperty = Object.defineProperty;
  const _keys = Object.keys;
  const _isArray = Array.isArray;
  // `_uncurry(fn)` is fn as a plain function of (self, ...args): a bound `call`, so invoking it
  // looks nothing up a page could replace later (no .call, no prototype method).
  const _uncurry = Function.prototype.bind.bind(Function.prototype.call);
  const _invoke = _uncurry(Function.prototype.call); // _invoke(fn, self, ...args)
  const _hasOwnCall = _uncurry(Object.prototype.hasOwnProperty);
  // What the result encoder uses, all taken here (console round 2, threat model C-1): a page
  // that patches a built-in after the console scope exists cannot change what a result shows.
  const _gopd = Object.getOwnPropertyDescriptor;
  const _getProto = Object.getPrototypeOf;
  const _ownNames = Object.getOwnPropertyNames;
  const _ObjectProto = Object.prototype;
  const _objToString = Object.prototype.toString;
  const _isPrototypeOf = Object.prototype.isPrototypeOf;
  const _min = Math.min;
  const _max = Math.max;
  const _isSafeInteger = Number.isSafeInteger;
  const _String = String;
  const _strSlice = _uncurry(String.prototype.slice);
  const _strIndexOf = _uncurry(String.prototype.indexOf);
  const _strLower = _uncurry(String.prototype.toLowerCase);
  const _charCodeAt = _uncurry(String.prototype.charCodeAt);
  const _arrIndexOf = _uncurry(Array.prototype.indexOf);
  const _Set = Set;
  const _setHas = _uncurry(Set.prototype.has);
  const _setAdd = _uncurry(Set.prototype.add);
  const _WeakMap = WeakMap;
  const _weakMapGet = _uncurry(WeakMap.prototype.get);
  const _weakMapSet = _uncurry(WeakMap.prototype.set);
  const _weakSetHas = typeof WeakSet === 'function' ? _uncurry(WeakSet.prototype.has) : null;
  const _mapGet = _uncurry(Map.prototype.get);
  const _isView = ArrayBuffer.isView;
  const _errorIsError = typeof Error.isError === 'function' ? Error.isError : null;
  const _dateGetTime = Date.prototype.getTime;
  const _dateToISO = Date.prototype.toISOString;
  const _ElementProto = typeof Element === 'function' ? Element.prototype : null;
  // Own data properties, defined (never set): no setter on a prototype runs, and the descriptor
  // has no prototype, so a page's Object.prototype.get cannot turn it into an accessor.
  const _put = (target, key, value) => {
    _defineProperty(target, key, { __proto__: null, value, writable: true, enumerable: true, configurable: true });
  };
  // A descriptor's own fields only (one from getOwnPropertyDescriptor has every field it uses).
  const _descGet = (desc) => (_hasOwnCall(desc, 'get') ? desc.get : undefined);
  const _descSet = (desc) => (_hasOwnCall(desc, 'set') ? desc.set : undefined);
  const _descValue = (desc) => (_hasOwnCall(desc, 'value') ? desc.value : undefined);
  const _isAccessor = (desc) => !!(_descGet(desc) || _descSet(desc));
  // Whitespace, as String.prototype.trim and \s know it, by comparison only.
  const _isSpace = (unit) => unit === ' ' || unit === '\t' || unit === '\n' || unit === '\r' || unit === '\v' || unit === '\f' ||
    unit === '\u00a0' || unit === '\u1680' || (unit >= '\u2000' && unit <= '\u200a') || unit === '\u2028' || unit === '\u2029' ||
    unit === '\u202f' || unit === '\u205f' || unit === '\u3000' || unit === '\ufeff';
  // Runs of whitespace as one space, trimmed, at most `max` units (`max` read past, then cut).
  function _collapse(text, max) {
    let out = '';
    let space = false;
    for (let i = 0; i < text.length && out.length <= max; i += 1) {
      const unit = text[i];
      if (_isSpace(unit)) {
        space = out.length > 0;
      } else {
        if (space) out += ' ';
        space = false;
        out += unit;
      }
    }
    return out.length > max ? _strSlice(out, 0, max) : out;
  }
  // Words split on whitespace, at most `max` of them.
  function _words(text, max) {
    const words = [];
    let word = '';
    for (let i = 0; i <= text.length && words.length < max; i += 1) {
      const unit = text[i];
      if (unit === undefined || _isSpace(unit)) {
        if (word) _put(words, words.length, word);
        word = '';
      } else {
        word += unit;
      }
    }
    return words;
  }

  const MAX_SCHEMA_DEPTH = 5;

  function parseBody(body) {
    if (body == null || body === '') return null;
    if (typeof body === 'object') return body;
    if (typeof body === 'string') {
      const trimmed = body.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try { return _jsonParse(trimmed); } catch {}
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

  // A cell a spreadsheet will evaluate as a formula. Excel, Sheets and LibreOffice
  // strip RFC4180 quoting BEFORE evaluating, so quoting is not a defence — the value
  // has to stop looking like a formula. Plain numbers are exempt so a negative
  // number stays a number. Kept identical to escapeCSV in workers/xray-worker.js.
  const CSV_FORMULA_LEAD = /^[=+\-@\t\r]/;
  const CSV_PLAIN_NUMBER = /^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/;

  // JSON.stringify for values that may hold a BigInt (an integer past 2^53 in `res` is one,
  // spec J8): its digits go out as written — a JSON number where JSON.rawJSON exists
  // (Chrome 114+), else a string — instead of the TypeError JSON.stringify throws.
  function _bigintSafe(_key, value) {
    if (typeof value !== 'bigint') return value;
    const rawJSON = JSON.rawJSON;
    return typeof rawJSON === 'function' ? rawJSON.call(JSON, String(value)) : String(value);
  }

  function _json(value, indent) {
    const text = _jsonStringify(value, _bigintSafe, indent);
    return text === undefined ? String(value) : text;
  }

  function csvCell(value) {
    if (value == null) return '';
    let text = typeof value === 'string' ? value : _jsonStringify(value, _bigintSafe);
    if (text === undefined) text = String(value);
    if (CSV_FORMULA_LEAD.test(text) && !CSV_PLAIN_NUMBER.test(text)) text = `'${text}`;
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  function toCSV(arr) {
    if (!_isArray(arr) || !arr.length) return '';
    // Columns are the union across every row, not row 0's keys: captured payloads
    // are routinely heterogeneous, and toCSV([{}, {a: 1}]) used to erase the table.
    const keys = [];
    const seen = new Set();
    for (const row of arr) {
      if (!row || typeof row !== 'object') continue;
      for (const key of _keys(row)) {
        if (!seen.has(key)) { seen.add(key); keys.push(key); }
      }
    }
    if (!keys.length) return '';
    // The header goes through the same escaper as the cells. `keys.join(',')` meant
    // a key containing a comma or quote produced a header whose column count did
    // not match its rows.
    const header = keys.map(csvCell).join(',');
    const rows = arr.map((row) => keys.map((key) => csvCell(row?.[key])).join(','));
    return [header, ...rows].join('\n');
  }

  // table(rows) evaluates to the rows themselves (a copy, so the caller's array is never
  // marked); the copy is remembered here and encodeResult says `render: 'table'` beside the
  // value. A user value can never carry the instruction: no key of it is read (spec J8,
  // audit #28 — the old `{ __xr_render: 'table', data }` marker was a plain string key).
  const _tables = typeof WeakSet === 'function' ? new WeakSet() : null;

  function toTable(data) {
    const rows = _isArray(data) ? data.slice() : [];
    if (_tables) _tables.add(rows);
    return rows;
  }

  // Results are built with defineProperty, so a captured key named "__proto__" stays an own key
  // (out[key] = … would set the prototype instead and drop it); "constructor" is a key like any other.
  function setOwn(target, key, value) {
    _put(target, key, value);
    return target;
  }

  function diff(a, b) {
    const result = { added: {}, removed: {}, changed: {} };
    const aKeys = new Set(_keys(a || {}));
    const bKeys = new Set(_keys(b || {}));
    for (const key of bKeys) {
      if (!aKeys.has(key)) setOwn(result.added, key, b[key]);
    }
    for (const key of aKeys) {
      if (!bKeys.has(key)) {
        setOwn(result.removed, key, a[key]);
      } else if (_json(a[key]) !== _json(b[key])) {
        setOwn(result.changed, key, { from: a[key], to: b[key] });
      }
    }
    return result;
  }

  function schema(value, depth = 0) {
    if (depth > MAX_SCHEMA_DEPTH) return 'any';
    if (value === null) return 'null';
    if (_isArray(value)) return value.length ? [schema(value[0], depth + 1)] : 'array';
    if (typeof value === 'object') {
      const out = {};
      for (const [key, child] of Object.entries(value || {})) {
        setOwn(out, key, schema(child, depth + 1));
      }
      return out;
    }
    // A BigInt is an integer past 2^53 from a JSON body (spec J8): JSON's type is number, as
    // the panel's Schema view says for the same field.
    return typeof value === 'bigint' ? 'number' : typeof value;
  }

  function pick(obj, keys) {
    return (keys || []).reduce((acc, key) => {
      if (_hasOwn(obj || {}, key)) setOwn(acc, key, obj[key]);
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
      if (value && typeof value === 'object' && !_isArray(value)) {
        for (const [nested, leaf] of Object.entries(flatten(value, path))) setOwn(out, nested, leaf);
      } else {
        setOwn(out, path, value);
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

  // The body cURL and fetch send (spec J10): the request text as captured — false, null and ""
  // included — never a re-serialization of its parsed copy. An entry saved before J4 has only that
  // copy: any value but null and "" is sent as its JSON. A FormData is rebuilt from its fields
  // instead (_formFields); a binary body keeps its captured shape. src/panel/utils.ts mirrors this
  // (a unit test pins parity).
  // A value JSON.stringify cannot print — nested too deep for the stack (a session file or a session
  // saved before J4 can hold one) — is { note }: the export says the body is left out instead of
  // throwing while the selected entry renders.
  function _requestText(entry) {
    const method = entry.method || 'GET';
    if (method === 'GET' || method === 'HEAD') return null;
    const kind = entry.requestBodyKind;
    if (kind === 'none') return null;
    if ((kind === 'text' || kind === 'urlencoded') && typeof entry.requestBodyText === 'string') return entry.requestBodyText;
    const body = entry.requestBody;
    if (body === undefined || body === null || body === '') return null;
    if (typeof body === 'string') return body;
    try {
      return _json(body);
    } catch (error) {
      return { note: error instanceof RangeError ? 'the request body is nested too deeply to print as JSON, so it is left out'
        : 'the request body could not be printed as JSON, so it is left out' };
    }
  }

  // A FormData body (spec J4) as exports rebuild it: its text fields in the order sent, and why the
  // export is partial — a file (never captured), fields not kept with the entry, a form cut at capture.
  // null when the request is not a FormData. src/panel/utils.ts mirrors this (a unit test pins parity).
  function _formFields(entry) {
    const method = entry.method || 'GET';
    if (entry.requestBodyKind !== 'formdata' || method === 'GET' || method === 'HEAD') return null;
    const fields = [];
    const notes = [];
    if (!_isArray(entry.requestBody)) notes.push('the form fields were not kept with this entry, so the body is left out');
    else {
      for (const pair of entry.requestBody) {
        if (!_isArray(pair) || pair.length < 2) continue;
        const name = String(pair[0]);
        const value = pair[1];
        if (value && typeof value === 'object') {
          notes.push(`the file in field ${_noteText(name)} (${_noteText(value.file ?? '')}, ${_noteText(value.type ?? '')}, ${Number(value.size) || 0} bytes) was not captured`);
        } else {
          fields.push([name, String(value ?? '')]);
        }
      }
    }
    if (entry.requestTruncated) notes.push('the form was cut at capture, so its last field may be short and later fields are missing');
    return { fields, notes, sent: _isArray(entry.requestBody) };
  }

  // Page data inside a comment: quoted, every line break escaped (JSON.stringify escapes \n and \r;
  // U+2028 and U+2029 end a JavaScript comment too), so it can never end the comment early.
  function _noteText(value) {
    return _jsonStringify(String(value)).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  }

  // The headers an export sends with a FormData: the captured multipart Content-Type goes, since its
  // boundary belongs to the original body; curl, fetch, Axios and Playwright write their own.
  function _formHeaders(entry) {
    const headers = {};
    for (const [key, value] of Object.entries(entry.requestHeaders || {})) {
      if (String(key).toLowerCase() === 'content-type' && /^\s*multipart\//i.test(String(value))) continue;
      setOwn(headers, key, value);
    }
    return headers;
  }

  // A form field as curl's argument, as a browser's FormData sends it: the multipart encoding writes
  // every line break as CRLF, so one with a line break is $'…'-quoted (the CR survives a paste) and
  // its breaks normalized; anything else is single-quoted.
  function _formArg(text) {
    if (!/[\r\n]/.test(text)) return _shellQuote(text);
    const crlf = text.replace(/\r\n|\r|\n/g, '\r\n');
    return `$'${crlf.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r/g, '\\r').replace(/\n/g, '\\n')}'`;
  }

  function generateCurl(entry) {
    if (!entry) return '// No request selected';
    const method = entry.method || 'GET';
    const form = _formFields(entry);
    const body = form ? null : _requestText(entry);
    let notes = '';
    if (form) {
      // --form-string takes the value literally: -F reads a value starting with @ or < from a local
      // file and cuts one at ";type=". A name ends at its first "=", so such a name cannot be sent.
      const names = form.fields.filter(([name]) => name.includes('=')).map(([name]) => `field ${_noteText(name)} is left out: curl cannot send a name that contains "="`);
      notes = form.notes.concat(names).map((note) => `# Partial: ${note}.\n`).join('');
    } else if (body !== null && typeof body === 'object') {
      notes = `# Partial: ${body.note}.\n`;
    }
    let command = `${notes}curl ${_shellQuote(entry.url || '')} \\\n  -X ${_shellQuote(method)}`;
    for (const [key, value] of Object.entries(form ? _formHeaders(entry) : entry.requestHeaders || {})) {
      command += ` \\\n  -H ${_shellQuote(`${String(key)}: ${String(value)}`)}`;
    }
    if (form) {
      for (const [name, value] of form.fields) {
        if (!name.includes('=')) command += ` \\\n  --form-string ${_formArg(`${name}=${value}`)}`;
      }
      return command;
    }
    if (typeof body === 'string') command += ` \\\n  --data-raw ${_shellQuote(body)}`;
    return command;
  }

  function generateFetch(entry) {
    if (!entry) return '// No request selected';
    const method = entry.method || 'GET';
    const form = _formFields(entry);
    if (form) {
      const options = _jsonStringify({ method, headers: _formHeaders(entry) }, null, 2);
      const notes = form.notes.map((note) => `// Partial: ${note}.\n`).join('');
      if (!form.sent) return `${notes}fetch(${_jsonStringify(entry.url || '')}, ${options})`;
      const appends = form.fields.map(([name, value]) => `form.append(${_jsonStringify(name)}, ${_jsonStringify(value)});\n`).join('');
      return `${notes}const form = new FormData();\n${appends}\nfetch(${_jsonStringify(entry.url || '')}, ${options.replace(/\n\}$/, ',\n  "body": form\n}')})`;
    }
    const options = { method, headers: entry.requestHeaders || {} };
    const body = _requestText(entry);
    if (typeof body === 'string') options.body = body;
    const note = body !== null && typeof body === 'object' ? `// Partial: ${body.note}.\n` : '';
    return `${note}fetch(${_jsonStringify(entry.url || '')}, ${_jsonStringify(options, null, 2)})`;
  }

  // JSON.parse keeping every integer past 2^53 exact, as a BigInt — what `res` holds (spec J8). The
  // reviver reads each number's source text (Chrome 114+); without it a number stays as parsed.
  function _keepIntegers(_key, value, context) {
    if (typeof value !== 'number' || Number.isSafeInteger(value) || !context || typeof context.source !== 'string') return value;
    const digits = /^(-?\d+)(?:\.0+)?$/.exec(context.source);
    return digits ? BigInt(digits[1]) : value;
  }

  // parseBody's rule (only text starting with { or [ is parsed), losslessly.
  function _parseBodyExact(body) {
    if (typeof body !== 'string') return parseBody(body);
    const trimmed = body.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try { return _jsonParse(trimmed, _keepIntegers); } catch { /* not JSON: parseBody keeps it as text */ }
    }
    return parseBody(body);
  }

  function buildMock(entry) {
    if (!entry || entry.type !== 'api') return '// Select an API request first';
    // Carry (Task 7): the response keeps integers past 2^53 exact, like `res`.
    const body = _parseBodyExact(entry.responseDecrypted || entry.responseRaw);
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
    map: (arr, fn) => _isArray(arr) ? arr.map(fn) : [],
    filter: (arr, fn) => _isArray(arr) ? arr.filter(fn) : [],
    find: (arr, fn) => _isArray(arr) ? arr.find(fn) : undefined,
    pluck: (arr, key) => _isArray(arr) ? arr.map((item) => item?.[key]) : [],
    // Null-prototype accumulators: a group named "constructor" or "__proto__" is a group, not
    // Object.prototype's function or the prototype setter.
    groupBy: (arr, key) => _isArray(arr)
      ? arr.reduce((acc, item) => {
        const group = typeof key === 'function' ? key(item) : item?.[key];
        (acc[group] = acc[group] || []).push(item);
        return acc;
      }, Object.create(null))
      : {},
    // Same key/function rule as groupBy, counting instead of collecting.
    countBy: (arr, key) => _isArray(arr)
      ? arr.reduce((acc, item) => {
        const group = typeof key === 'function' ? key(item) : item?.[key];
        acc[group] = (acc[group] || 0) + 1;
        return acc;
      }, Object.create(null))
      : {},
    uniq: (arr) => [...new Set(_isArray(arr) ? arr : [])],
    sortBy: (arr, key) => _isArray(arr)
      ? [...arr].sort((a, b) => {
        const av = typeof key === 'function' ? key(a) : a?.[key];
        const bv = typeof key === 'function' ? key(b) : b?.[key];
        return av < bv ? -1 : av > bv ? 1 : 0;
      })
      : [],
    sum: (arr, key) => _isArray(arr)
      ? arr.reduce((sum, item) => sum + (Number(key ? (typeof key === 'function' ? key(item) : item?.[key]) : item) || 0), 0)
      : 0,
  };

  // The names createRuntime binds: the one list the worker (background.js, shared/console-scope.js
  // contextNames) and the content script (panel/console.js) read (final review M-7). A test checks it
  // against createRuntime's keys and console-scope.js's member map.
  const RUNTIME_NAMES = [
    '$r', '$res', '$req', '$headers', '$h', '$rh', '$url', '$params',
    '$statusCode', '$time', '$size', '$method', '$all', '$similar', '$prev',
    '$next', '$errors', '$slow', '$status', '$endpoint', '$domain', '$schema',
    '$mock', '$copy', '$curl', '$fetch', 'copy', 'toCSV', 'toTable', 'diff',
    'schema', 'pick', 'omit', 'flatten', '_',
    'entry', 'res', 'response', 'req', 'request', 'headers', 'responseHeaders',
    'requestHeaders', 'prev', 'next', 'prevEntry', 'nextEntry', 'all', 'similar',
    'errors', 'slow', 'csv', 'table', 'mock', '$help', 'help',
  ];

  function createRuntime(context = {}, clipboardWriter) {
    const entries = _isArray(context.entries) ? context.entries : [];
    const current = context.currentEntry || null;
    const currentIndex = current ? entries.findIndex((entry) => entry.id === current.id) : -1;
    // res, req, prev and next arrive as typed values the panel read losslessly (spec J8:
    // reviveContext turned integers past 2^53 into BigInt); the raw text, parsed here, is
    // only the fallback for a value that was not sent.
    const values = context.values && typeof context.values === 'object' ? context.values : {};
    const valueOr = (name, read) => (_hasOwn(values, name) ? values[name] : read());
    const response = valueOr('res', () => parseBody(current?.responseDecrypted || current?.responseRaw));
    const request = valueOr('req', () => parseBody(typeof current?.requestBodyText === 'string' ? current.requestBodyText : current?.requestBody));
    const responseHeaders = current?.responseHeaders || {};
    const requestHeaders = current?.requestHeaders || {};
    const similarEntries = () => entries.filter((entry) => entry.type === 'api' && sameEndpoint(entry, current) && entry.id !== current?.id);
    const previousSameEndpoint = siblingEntry(entries, current, -1);
    const nextSameEndpoint = siblingEntry(entries, current, 1);
    const previousResponse = valueOr('prev', () => parseBody(previousSameEndpoint?.responseDecrypted || previousSameEndpoint?.responseRaw));
    const nextResponse = valueOr('next', () => parseBody(nextSameEndpoint?.responseDecrypted || nextSameEndpoint?.responseRaw));
    const copy = (value) => {
      const text = typeof value === 'string' ? value : _json(value, 2);
      if (clipboardWriter) clipboardWriter(text);
      return `Copied ${text.length} chars`;
    };

    const runtime = {
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
    // Pinned requests `a`…`f` arrive as `{ id, value }` (the typed body, like `res`) or
    // `{ id, body }` (its text, parsed here). Only the six letters are accepted, so a pin
    // can never replace a helper.
    const pins = context.pins && typeof context.pins === 'object' ? context.pins : {};
    for (const name of _keys(pins)) {
      const pin = pins[name];
      if (!PIN_NAME.test(name) || !pin || typeof pin !== 'object') continue;
      if (_hasOwn(runtime, name)) continue;
      runtime[name] = _hasOwn(pin, 'value') ? pin.value : parseBody(pin.body);
    }
    return runtime;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Console values both ways (spec J8)
  // ═══════════════════════════════════════════════════════════════════════════
  // Results and the command context travel as text in the typed model the Logs use
  // (src/panel/models/logValue.ts documents it): JSON, where every value JSON cannot hold is
  // an envelope under the reserved key "$xray" — {"$xray":"bigint","value":"…"},
  // {"$xray":"number","value":"NaN"|"Infinity"|"-Infinity"|"-0"}, {"$xray":"undefined"},
  // map, set, date, error, … — and an object that has the key itself is listed as an
  // `object` envelope, so no value can pose as one. Text, because CDP's returnByValue hands
  // the extension a browser-side dictionary that sorts keys and drops what JSON cannot hold.
  const TYPE_KEY = '$xray';
  // The caps the console always had, now stated (a cut is metadata, never text): containers
  // past depth 8 are summarised, an array keeps its first 1,000 items, an object its first
  // 500 keys, a Map, Set or typed array its first 1,000 entries, a string its first 200,000
  // characters, and the whole result about 200,000 characters of JSON (the old transfer
  // limit) — past it, containers stop and say how much they left out.
  const RESULT_DEPTH = 8;
  const RESULT_ITEMS = 1000;
  const RESULT_KEYS = 500;
  const RESULT_STRING = 200000;
  const RESULT_BUDGET = 200000;
  const MAX_NAME = 200;
  const MAX_DESCRIPTION = 1000;
  const TYPED_ARRAYS = new Set(['Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array', 'Uint16Array', 'Int32Array',
    'Uint32Array', 'Float16Array', 'Float32Array', 'Float64Array', 'BigInt64Array', 'BigUint64Array']);

  function _getter(proto, key) {
    try {
      return _descGet(_gopd(proto, key)) || null;
    } catch {
      return null;
    }
  }

  // Brand checks call the built-ins' own accessors: a Symbol.toStringTag can lie, a slot cannot.
  const _mapSize = _getter(Map.prototype, 'size');
  const _setSize = _getter(Set.prototype, 'size');
  const _bufferBytes = _getter(ArrayBuffer.prototype, 'byteLength');
  // %TypedArray%.prototype's own accessors and DataView's: a subclass `get length()` never runs.
  const _typedArrayProto = _getProto(Uint8Array.prototype);
  const _typedArrayLength = _getter(_typedArrayProto, 'length');
  const _typedArrayName = _getter(_typedArrayProto, Symbol.toStringTag);
  const _dataViewBytes = typeof DataView === 'function' ? _getter(DataView.prototype, 'byteLength') : null;
  const _mapEntries = Map.prototype.entries;
  const _setValues = Set.prototype.values;
  const _mapNext = _getProto(new Map().entries()).next;
  const _setNext = _getProto(new Set().values()).next;

  function _hasOwn(value, key) {
    return _hasOwnCall(value, key);
  }

  // Literals and spreads define own data properties: a setter on Object.prototype never runs.
  function _typed(kind, fields) {
    return fields ? { [TYPE_KEY]: kind, ...fields } : { [TYPE_KEY]: kind };
  }

  function _hasBrand(method, value) {
    if (!method) return false;
    try {
      _invoke(method, value);
      return true;
    } catch {
      return false;
    }
  }

  function _count(value) {
    return _isSafeInteger(value) && value >= 0 ? value : 0;
  }

  function _typedNumber(value) {
    if (value !== value) return _typed('number', { value: 'NaN' });
    if (value === Infinity) return _typed('number', { value: 'Infinity' });
    if (value === -Infinity) return _typed('number', { value: '-Infinity' });
    if (value === 0 && 1 / value < 0) return _typed('number', { value: '-0' });
    return value;
  }

  // The descriptor that answers `key` on `source` (own, then up its prototype chain), or null.
  // Reading descriptors never calls an accessor (a Proxy's traps do run: an accepted limit).
  function _findDescriptor(source, key) {
    let level = source;
    for (let i = 0; level && i < 32; i += 1) {
      const desc = _gopd(level, key);
      if (desc) return desc;
      level = _getProto(level);
    }
    return null;
  }

  // The engine's own Error#stack accessor (V8 installs it on each error): the one getter outside
  // the web classes the encoder calls, recognised by identity, so a page getter never passes.
  const _stackGetter = (() => {
    try {
      const desc = _gopd(new Error(''), 'stack');
      return desc && typeof _descGet(desc) === 'function' ? _descGet(desc) : null;
    } catch {
      return null;
    }
  })();

  // An Error field as text, read through its descriptor: { text } for data (or the engine's stack),
  // { lazy: true } for a page accessor (never called), { text: '' } when absent or not a string.
  function _errorField(error, key, max, stackSafe) {
    let desc;
    try {
      desc = _findDescriptor(error, key);
    } catch {
      return { text: '' };
    }
    if (!desc) return { text: '' };
    let value;
    if (_isAccessor(desc)) {
      if (!(key === 'stack' && stackSafe && _stackGetter && _descGet(desc) === _stackGetter)) return { lazy: true, text: '' };
      try {
        value = _invoke(_stackGetter, error);
      } catch {
        return { text: '' };
      }
    } else {
      value = _descValue(desc);
    }
    return { text: typeof value === 'string' ? _strSlice(value, 0, max) : '' };
  }

  function _noPrepareStackTrace() {
    try {
      const desc = _gopd(Error, 'prepareStackTrace');
      return !desc || (!_isAccessor(desc) && _descValue(desc) === undefined);
    } catch {
      return false;
    }
  }

  // Object.prototype.toString's tag without running a page accessor: a data @@toStringTag (own
  // or inherited) is used as written; an accessor one counts as no tag ("[object Object]"); with
  // none on the chain, the built-in tag (Array, Date, RegExp, Error, …) is safe to ask for.
  function _safeTag(value) {
    let desc;
    try {
      desc = _findDescriptor(value, Symbol.toStringTag);
    } catch {
      return '[object Object]';
    }
    if (desc && _isAccessor(desc)) return '[object Object]';
    if (desc && typeof _descValue(desc) === 'string') return `[object ${_descValue(desc)}]`;
    return _invoke(_objToString, value);
  }

  // An own data property's value; undefined for an accessor (never called) or a missing key.
  function _ownData(source, key) {
    try {
      const desc = _gopd(source, key);
      return desc && !_isAccessor(desc) ? _descValue(desc) : undefined;
    } catch {
      return undefined;
    }
  }

  function _functionName(fn) {
    const name = _ownData(fn, 'name');
    return typeof name === 'string' ? _strSlice(name, 0, MAX_NAME) : '';
  }

  function _isError(value, tag) {
    return _errorIsError ? _errorIsError(value) : tag === '[object Error]';
  }

  function _isElement(value) {
    try {
      return _ElementProto !== null && _invoke(_isPrototypeOf, _ElementProto, value);
    } catch {
      return false;
    }
  }

  // ── Per-class projections (console round 2, spec §1) ─────────────────────────────
  // The spec's web classes (and DOM elements) are the only objects whose accessors the encoder
  // calls; everywhere else an accessor, own or inherited, is listed by name and never run. Every
  // web read goes through a getter or method of the class's prototype (a brand check: it throws
  // for anything that is not that class) — never an instance property, never a body read. The
  // members are resolved once, when this module is evaluated, and only built-ins ("[native code]")
  // are kept, so a polyfill or replacement under the same global name is never called; a class
  // the page lacks is skipped. Accepted limit: this module runs in the page's realm after its
  // scripts, so a page that fakes Function.prototype.toString, or installs a callable Proxy or a
  // bound function, passes the native check; the Object.prototype.toString tag pre-filter bounds
  // that to objects carrying the class's own tag. Likewise a Proxy's traps (ownKeys,
  // getOwnPropertyDescriptor, getPrototypeOf) are page code and still run when it is walked; no
  // accessor a trap reports is ever called.
  const FUNCTION_SOURCE = 4000;
  const WEB_ENTRY_STEPS = 100000;
  const MAX_PARAMS = 200;
  const DOM_CHILDREN = 50;
  const DOM_DEPTH = 3;
  const DOM_TEXT = 200;
  const DOM_ATTRS = 50;
  const DOM_ATTR_VALUE = 1000;
  const INSTANCE_GETTERS = 50; // accessor names listed per instance
  const PROMISE_ROUNDS = 3;
  const PROMISE_TICKS = 10;
  const _fnToString = Function.prototype.toString;
  const _promiseThen = Promise.prototype.then;
  const _dateString = Date.prototype.toString;
  const _regexpSource = _getter(RegExp.prototype, 'source');
  const _regexpFlags = _getter(RegExp.prototype, 'flags');

  // `{ [native code] }` at the end, whitespace allowed around its parts — by comparison only.
  function _nativeSource(source) {
    if (typeof source !== 'string') return false;
    let i = source.length - 1;
    const back = (unit) => {
      while (i >= 0 && _isSpace(source[i])) i -= 1;
      if (source[i] !== unit) return false;
      i -= 1;
      return true;
    };
    if (!back('}') || !back(']')) return false;
    const word = '[native code';
    for (let k = word.length - 1; k >= 0; k -= 1, i -= 1) if (source[i] !== word[k]) return false;
    return back('{');
  }

  // Only a built-in is trusted: a page's polyfill or replacement under the same global name is
  // page code, which the encoder never calls (and whose "brand" would accept any object).
  function _isNative(fn) {
    if (typeof fn !== 'function') return false;
    try {
      return _nativeSource(_invoke(_fnToString, fn));
    } catch {
      return false;
    }
  }

  // The built-in getter (or, with `method`, function) for `key` on `name`'s prototype chain; null
  // when the class is missing or the member is not native code.
  function _protoMember(name, key, method) {
    let proto;
    try {
      const ctor = globalThis[name];
      proto = typeof ctor === 'function' ? ctor.prototype : null;
    } catch {
      return null;
    }
    for (let i = 0; proto && i < 8; i += 1) {
      let desc;
      try {
        desc = _gopd(proto, key);
      } catch {
        return null;
      }
      if (desc) {
        const fn = method ? _descValue(desc) : _descGet(desc);
        return _isNative(fn) ? fn : null;
      }
      proto = _getProto(proto);
    }
    return null;
  }

  // [class, brand getter (null: its entries() method), fields]. The value's Object.prototype.toString
  // tag picks the one candidate, so a plain or user object never reaches a brand check.
  const WEB_CLASSES = [
    ['Response', 'status', ['status', 'ok', 'statusText', 'url', 'type', 'redirected', 'bodyUsed', 'headers']],
    ['Request', 'method', ['method', 'url', 'mode', 'credentials', 'headers']],
    ['Headers', null, []],
    ['URLSearchParams', null, []],
    ['FormData', null, []],
    ['URL', 'href', ['href', 'origin', 'protocol', 'host', 'pathname', 'search', 'hash', 'searchParams']],
    ['File', 'name', ['name', 'size', 'type']],
    ['Blob', 'size', ['size', 'type']],
    ['PerformanceResourceTiming', 'initiatorType', ['name', 'entryType', 'initiatorType', 'startTime', 'duration',
      'transferSize', 'encodedBodySize', 'decodedBodySize', 'nextHopProtocol', 'responseStatus']],
    ['AbortSignal', 'aborted', ['aborted', 'reason']],
    ['AbortController', 'signal', ['aborted', 'reason']],
  ];
  const DOM_MEMBERS = ['tagName', 'id', 'className', 'attributes', 'children', 'childElementCount', 'textContent'];

  // Every member the encoder may call, resolved once, when the module is evaluated (before the
  // user's command runs): "Class.key" -> built-in function, or absent.
  const _members = new Map();
  function _resolve(name, key, method) {
    const fn = _protoMember(name, key, method);
    if (fn) _members.set(`${name}.${key}`, fn);
  }
  for (let i = 0; i < WEB_CLASSES.length; i += 1) {
    const [cls, brand, keys] = WEB_CLASSES[i];
    if (brand === null) _resolve(cls, 'entries', true);
    for (let k = 0; k < keys.length; k += 1) _resolve(cls === 'AbortController' ? 'AbortSignal' : cls, keys[k]);
    if (brand) _resolve(cls, brand);
  }
  for (let i = 0; i < DOM_MEMBERS.length; i += 1) _resolve('Element', DOM_MEMBERS[i]);
  // A DOM snapshot reads attributes and children through their built-ins too.
  _resolve('Attr', 'name');
  _resolve('Attr', 'value');
  _resolve('NamedNodeMap', 'length');
  _resolve('NamedNodeMap', 'item', true);
  _resolve('HTMLCollection', 'length');
  _resolve('HTMLCollection', 'item', true);

  function _member(name, key) {
    return _mapGet(_members, `${name}.${key}`) || null;
  }

  function _call(fn, self, arg) {
    try {
      return { ok: true, value: arguments.length > 2 ? _invoke(fn, self, arg) : _invoke(fn, self) };
    } catch {
      return { ok: false };
    }
  }

  function _webFields(value, cls, keys, depth, state) {
    let source = value;
    let owner = cls;
    if (cls === 'AbortController') {
      // Its state is its signal's: aborted and reason, read through AbortSignal's getters.
      source = _invoke(_member('AbortController', 'signal'), value);
      owner = 'AbortSignal';
    }
    const fields = {};
    for (let i = 0; i < keys.length; i += 1) {
      const getter = _member(owner, keys[i]);
      if (!getter) continue;
      const read = _call(getter, source);
      if (!read.ok) continue;
      state.budget -= keys[i].length + 4;
      setOwn(fields, keys[i], _resultValue(read.value, depth + 1, state));
    }
    return fields;
  }

  // [key, value] pairs of an entries() iterator, in its order: the first RESULT_ITEMS listed, the
  // rest counted up to WEB_ENTRY_STEPS (the iterator's `next` is the page's to patch, so it may
  // never finish); `size` is said only when the listing is cut, `sizeAtLeast` past the step cap.
  function _webEntries(iterator, depth, state) {
    const next = _getProto(iterator).next;
    const entries = [];
    let size = 0;
    let more = false;
    for (;; size += 1) {
      if (size >= WEB_ENTRY_STEPS) {
        more = true;
        break;
      }
      const step = _invoke(next, iterator);
      if (step.done) break;
      if (entries.length >= RESULT_ITEMS || state.budget <= 0) continue;
      const pair = step.value;
      const key = _resultValue(pair[0], depth + 1, state);
      _put(entries, entries.length, [key, _resultValue(pair[1], depth + 1, state)]);
    }
    if (entries.length < size) state.truncated = true;
    return { entries, size, more };
  }

  function _resultWeb(value, tag, depth, state) {
    if (tag === '[object RegExp]') {
      if (!_regexpSource || !_hasBrand(_regexpSource, value)) return null;
      state.budget -= 40;
      const source = _invoke(_regexpSource, value);
      const flags = _call(_regexpFlags, value);
      return _typed('web', { cls: 'RegExp', fields: { source: _strSlice(source, 0, RESULT_STRING), flags: flags.ok ? _String(flags.value) : '' } });
    }
    for (let i = 0; i < WEB_CLASSES.length; i += 1) {
      const [cls, brand, keys] = WEB_CLASSES[i];
      if (tag !== `[object ${cls}]`) continue;
      if (brand === null) {
        const entries = _member(cls, 'entries');
        if (!entries) return null;
        const iterator = _call(entries, value);
        if (!iterator.ok) return null;
        state.budget -= 40;
        const listed = _webEntries(iterator.value, depth, state);
        return _typed('web', {
          cls, fields: {}, entries: listed.entries,
          ...(listed.entries.length < listed.size ? { size: listed.size } : {}),
          ...(listed.more ? { sizeAtLeast: true } : {}),
        });
      }
      const getter = _member(cls, brand);
      if (!getter || !_hasBrand(getter, value)) return null;
      state.budget -= 40;
      return _typed('web', { cls, fields: _webFields(value, cls, keys, depth, state) });
    }
    return null;
  }

  // A nested promise: a placeholder now, its state after the encoder's microtask flush. The
  // ancestors and depth are kept so the settled value is walked as if it were reached here.
  function _resultPromise(value, depth, state) {
    const target = _typed('promise', { state: 'pending' });
    const ancestors = [];
    for (let i = 0; i < state.ancestors.length; i += 1) _put(ancestors, i, state.ancestors[i]);
    const record = { target, settled: null, ancestors, depth };
    try {
      _invoke(_promiseThen, value,
        (result) => { record.settled = { state: 'fulfilled', value: result }; },
        (reason) => { record.settled = { state: 'rejected', value: reason }; });
    } catch {
      return null;
    }
    state.budget -= 40;
    _put(state.promises, state.promises.length, record);
    return target;
  }

  async function _settlePromises(state) {
    for (let round = 0; round < PROMISE_ROUNDS && state.promises.length; round += 1) {
      for (let tick = 0; tick < PROMISE_TICKS; tick += 1) await undefined;
      _settleBatch(state);
    }
  }

  function _settleBatch(state) {
    const batch = state.promises;
    state.promises = [];
    for (let i = 0; i < batch.length; i += 1) {
      const record = batch[i];
      if (!record.settled) continue;
      record.target.state = record.settled.state;
      state.ancestors = record.ancestors;
      try {
        _put(record.target, 'value', _resultValue(record.settled.value, record.depth + 1, state));
      } catch {
        _put(record.target, 'value', _typed('unreadable'));
      }
    }
    state.ancestors = [];
  }

  // The index of the bracket closing the one at `open`, skipping strings and comments; -1 if none.
  function _closing(source, open) {
    let depth = 0;
    for (let i = open; i < source.length; i += 1) {
      const c = source[i];
      if (c === '"' || c === "'" || c === '`') {
        for (i += 1; i < source.length && source[i] !== c; i += 1) if (source[i] === '\\') i += 1;
      } else if (c === '/' && source[i + 1] === '/') {
        const end = _strIndexOf(source, '\n', i);
        if (end < 0) return -1;
        i = end;
      } else if (c === '/' && source[i + 1] === '*') {
        const end = _strIndexOf(source, '*' + '/', i + 2);
        if (end < 0) return -1;
        i = end + 1;
      } else if (c === '(' || c === '[' || c === '{') {
        depth += 1;
      } else if (c === ')' || c === ']' || c === '}') {
        depth -= 1;
        if (depth === 0) return i;
      }
    }
    return -1;
  }

  function _paramsText(text) {
    return _collapse(text, MAX_PARAMS);
  }

  // Whether `source` starts with `word` as a whole word (not `functional` for `function`).
  function _startsWord(source, word) {
    for (let i = 0; i < word.length; i += 1) if (source[i] !== word[i]) return false;
    const next = source[word.length];
    return next === undefined || !((next >= 'a' && next <= 'z') || (next >= 'A' && next <= 'Z') || (next >= '0' && next <= '9') || next === '_' || next === '$');
  }

  function _skipSpaces(source, i) {
    while (i < source.length && _isSpace(source[i])) i += 1;
    return i;
  }

  const _isIdentifierUnit = (unit) => (unit >= 'a' && unit <= 'z') || (unit >= 'A' && unit <= 'Z') || (unit >= '0' && unit <= '9') || unit === '_' || unit === '$';

  // kind and parameter list from the source text: `function f(a)`, `async (a) =>`, `x =>`,
  // a method `go(a) {}`, `class Foo`, or native code. String indexing and comparison only.
  function _functionShape(source) {
    if (_nativeSource(source)) return { kind: 'native', params: '' };
    if (_startsWord(source, 'class')) return { kind: 'class', params: '' };
    const rest = _startsWord(source, 'async') ? _strSlice(source, _skipSpaces(source, 5)) : source;
    if (!_startsWord(rest, 'function')) {
      let end = 0;
      while (end < rest.length && _isIdentifierUnit(rest[end])) end += 1;
      if (end > 0) {
        const after = _skipSpaces(rest, end);
        if (rest[after] === '=' && rest[after + 1] === '>') return { kind: 'arrow', params: _strSlice(rest, 0, end) };
      }
      if (rest[0] === '(') {
        const close = _closing(rest, 0);
        const after = close > 0 ? _skipSpaces(rest, close + 1) : -1;
        if (close > 0 && rest[after] === '=' && rest[after + 1] === '>') return { kind: 'arrow', params: _paramsText(_strSlice(rest, 1, close)) };
      }
    }
    const open = _strIndexOf(rest, '(');
    const close = open < 0 ? -1 : _closing(rest, open);
    return { kind: 'function', params: close > open ? _paramsText(_strSlice(rest, open + 1, close)) : '' };
  }

  function _resultFunction(fn, state) {
    let name = _functionName(fn);
    let source = '';
    try {
      source = _String(_invoke(_fnToString, fn));
    } catch {
      source = '';
    }
    const shape = _functionShape(source);
    const tag = _safeTag(fn);
    // XRAY's own wrapper (content/interceptor.js `_xrayFetch`) is labelled as what it stands for.
    const wrapped = name[0] === '_' && name[1] === 'x' && name[2] === 'r' && name[3] === 'a' && name[4] === 'y' && name[5] >= 'A' && name[5] <= 'Z';
    if (wrapped) name = _strLower(name[5]) + _strSlice(name, 6);
    const kept = shape.kind === 'native' ? '' : _strSlice(source, 0, FUNCTION_SOURCE);
    state.budget -= 80 + kept.length + shape.params.length;
    return _typed('function', {
      name,
      params: shape.params,
      async: tag === '[object AsyncFunction]' || tag === '[object AsyncGeneratorFunction]',
      kind: shape.kind,
      ...(kept ? { source: kept } : {}),
      ...(wrapped ? { wrappedByXray: true } : {}),
    });
  }

  // Through the built-in prototype getter only: an instance property (a <form> control named
  // "id") is never read in its place.
  function _domRead(element, key) {
    const getter = _member('Element', key);
    if (!getter) return undefined;
    try {
      return _invoke(getter, element);
    } catch {
      return undefined;
    }
  }

  function _domString(element, key, max) {
    const value = _domRead(element, key);
    return typeof value === 'string' ? _strSlice(value, 0, max) : '';
  }

  // The built-in `length` and item(i) of a NamedNodeMap / HTMLCollection.
  function _listLength(list, cls) {
    const getter = _member(cls, 'length');
    const read = getter ? _call(getter, list) : { ok: false };
    return read.ok ? _count(read.value) : 0;
  }

  function _listItem(list, cls, index) {
    const item = _member(cls, 'item');
    const read = item ? _call(item, list, index) : { ok: false };
    return read.ok ? read.value : null;
  }

  // A snapshot of an element: its own facts, and its child elements down to DOM_DEPTH levels.
  function _resultDom(element, level, state) {
    const tag = _strLower(_domString(element, 'tagName', MAX_NAME)) || 'element';
    const id = _domString(element, 'id', MAX_NAME);
    const rawClass = _domRead(element, 'className');
    const classText = typeof rawClass === 'string' ? rawClass : '';
    const words = _words(classText, 50);
    const classes = [];
    for (let i = 0; i < words.length; i += 1) _put(classes, i, _strSlice(words[i], 0, MAX_NAME));
    const attrs = [];
    const list = _domRead(element, 'attributes');
    const attrCount = list ? _listLength(list, 'NamedNodeMap') : 0;
    const attrName = _member('Attr', 'name');
    const attrValue = _member('Attr', 'value');
    for (let i = 0; i < attrCount && attrs.length < DOM_ATTRS && attrName && attrValue; i += 1) {
      try {
        const attr = _listItem(list, 'NamedNodeMap', i);
        _put(attrs, attrs.length, [_strSlice(_String(_invoke(attrName, attr)), 0, MAX_NAME), _strSlice(_String(_invoke(attrValue, attr)), 0, DOM_ATTR_VALUE)]);
      } catch {
        // an attribute that cannot be read is left out
      }
    }
    const content = _domRead(element, 'textContent');
    const text = typeof content === 'string' ? _collapse(_strSlice(content, 0, DOM_TEXT * 4), DOM_TEXT) : '';
    const kids = _domRead(element, 'children');
    const total = kids ? _listLength(kids, 'HTMLCollection') : _count(_domRead(element, 'childElementCount'));
    const children = [];
    state.budget -= 80 + text.length + tag.length;
    for (let i = 0; i < attrs.length; i += 1) state.budget -= attrs[i][0].length + attrs[i][1].length + 6;
    if (level < DOM_DEPTH && kids) {
      for (let i = 0; i < total && children.length < DOM_CHILDREN && state.budget > 0; i += 1) {
        try {
          _put(children, children.length, _resultDom(_listItem(kids, 'HTMLCollection', i), level + 1, state));
        } catch {
          _put(children, children.length, _typed('unreadable'));
        }
      }
    }
    if (children.length < total && level < DOM_DEPTH) state.truncated = true;
    return _typed('dom', { tag, id, classes, attrs, text, children, more: total - children.length });
  }

  // The accessor names on a class instance's prototype chain (up to Object.prototype), listed and
  // never called: outside the web classes no getter runs (DevTools' lazy "(…)"). Cached per
  // prototype for one result, so an array of instances walks each chain once.
  function _accessorNames(value, state) {
    const first = _getProto(value);
    if (!first) return [];
    const cached = _weakMapGet(state.accessorNames, first);
    if (cached) return cached;
    const names = [];
    const seen = new _Set();
    _setAdd(seen, 'constructor');
    _setAdd(seen, '__proto__');
    let proto = _getProto(value);
    for (let level = 0; proto && proto !== _ObjectProto && level < 16 && names.length < INSTANCE_GETTERS; level += 1) {
      const keys = _ownNames(proto);
      for (let i = 0; i < keys.length && names.length < INSTANCE_GETTERS; i += 1) {
        const key = keys[i];
        if (_setHas(seen, key)) continue;
        _setAdd(seen, key);
        const desc = _gopd(proto, key);
        if (desc && typeof _descGet(desc) === 'function') _put(names, names.length, _strSlice(key, 0, MAX_NAME));
      }
      proto = _getProto(proto);
    }
    _weakMapSet(state.accessorNames, first, names);
    return names;
  }

  // Constructor name of a class instance; '' for plain and null-prototype objects (also from
  // another realm, whose Object.prototype differs but whose constructor is "Object").
  function _className(value) {
    const proto = _getProto(value);
    if (proto === null || proto === _ObjectProto) return '';
    const ctor = _ownData(proto, 'constructor');
    const name = typeof ctor === 'function' ? _ownData(ctor, 'name') : undefined;
    return typeof name === 'string' && name !== 'Object' ? _strSlice(name, 0, MAX_NAME) : '';
  }

  // At most the per-string cap and what is left of the budget, never ending inside a pair.
  function _resultString(text, state) {
    let kept = _min(text.length, RESULT_STRING, _max(0, state.budget));
    if (kept < text.length && kept > 0) {
      const code = _charCodeAt(text, kept - 1);
      if (code >= 0xd800 && code <= 0xdbff) kept -= 1;
    }
    state.budget -= kept + 2;
    if (kept === text.length) return text;
    state.truncated = true;
    return _typed('string', { value: _strSlice(text, 0, kept), length: text.length });
  }

  // BigInt digits are all or nothing: a cut number would be a different number.
  function _resultBigint(value, state) {
    const digits = _String(value);
    if (digits.length > state.budget) {
      state.truncated = true;
      return _typed('unreadable');
    }
    state.budget -= digits.length + 30;
    return _typed('bigint', { value: digits });
  }

  function _resultValue(value, depth, state) {
    switch (typeof value) {
      case 'string': return _resultString(value, state);
      case 'number': state.budget -= 8; return _typedNumber(value);
      case 'boolean': state.budget -= 5; return value;
      case 'undefined': state.budget -= 20; return _typed('undefined');
      case 'bigint': return _resultBigint(value, state);
      case 'symbol': state.budget -= 40; return _typed('symbol', { description: _strSlice(_strSlice(_String(value), 7, -1), 0, MAX_DESCRIPTION) });
      case 'function': return _resultFunction(value, state);
      default: break;
    }
    if (value === null) {
      state.budget -= 4;
      return null;
    }
    // A cycle is an object that is its own ancestor; a value reached twice side by side is not.
    const ancestors = state.ancestors;
    for (let i = 0; i < ancestors.length; i += 1) {
      if (ancestors[i] === value) {
        state.budget -= 20;
        return _typed('circular');
      }
    }
    _put(ancestors, ancestors.length, value);
    try {
      return _resultObject(value, depth, state);
    } catch {
      // A proxy trap or a getter refused (a revoked proxy throws on every touch).
      return _typed('unreadable');
    } finally {
      ancestors.length -= 1;
    }
  }

  // A member read through its descriptor: a data property's value; an accessor is never called
  // (outside the web classes no getter runs) and stands as `accessor`, shown as DevTools' "(…)".
  function _resultChild(container, key, depth, state) {
    let desc;
    try {
      desc = _gopd(container, key);
    } catch {
      return _typed('unreadable');
    }
    if (desc && _isAccessor(desc)) {
      state.budget -= 20;
      return _typed('accessor');
    }
    return _resultValue(desc ? _descValue(desc) : undefined, depth + 1, state);
  }

  function _resultObject(value, depth, state) {
    const capped = depth > RESULT_DEPTH;
    const tag = _safeTag(value);
    if (_isError(value, tag)) return _resultError(value, depth, state, capped);
    if (tag === '[object Date]' && _hasBrand(_dateGetTime, value)) {
      const time = _invoke(_dateGetTime, value);
      state.budget -= 40;
      if (time !== time) return _typed('date', { iso: null });
      return _typed('date', { iso: _invoke(_dateToISO, value), local: _strSlice(_invoke(_dateString, value), 0, MAX_NAME) });
    }
    if (_isElement(value)) return _resultDom(value, 0, state);
    if (tag === '[object Promise]') {
      const promise = _resultPromise(value, depth, state);
      if (promise) return promise;
    }
    const proto = _getProto(value);
    if (proto !== null && proto !== _ObjectProto && !_isArray(value)) {
      const web = _resultWeb(value, tag, depth, state);
      if (web) return web;
    }
    if (_isView(value)) return _resultView(value, state, capped);
    if (tag === '[object ArrayBuffer]' && _hasBrand(_bufferBytes, value)) {
      return _typed('typedarray', { type: 'ArrayBuffer', length: _invoke(_bufferBytes, value) });
    }
    if (_isArray(value)) {
      if (!capped) return _resultArray(value, depth, state);
      state.truncated = true;
      return _typed('depth', { type: 'array', length: _count(value.length) });
    }
    if (tag === '[object Map]' || tag === '[object Set]') {
      const isMap = tag === '[object Map]';
      const sizeOf = isMap ? _mapSize : _setSize;
      if (_hasBrand(sizeOf, value)) {
        const size = _invoke(sizeOf, value);
        if (!capped) return isMap ? _resultMap(value, size, depth, state) : _resultSet(value, size, depth, state);
        state.truncated = true;
        return _typed('depth', { type: 'object', class: isMap ? 'Map' : 'Set', length: size });
      }
    }
    const cls = _className(value);
    if (!capped) return _resultRecord(value, depth, state, cls);
    state.truncated = true;
    return _typed('depth', cls ? { type: 'object', class: cls } : { type: 'object' });
  }

  function _resultArray(array, depth, state) {
    const length = _count(array.length);
    const limit = _min(length, RESULT_ITEMS);
    const items = [];
    state.budget -= 2;
    for (let i = 0; i < limit && state.budget > 0; i += 1) _put(items, i, _resultChild(array, i, depth, state));
    if (items.length === length) return items;
    state.truncated = true;
    return _typed('array', { items, length });
  }

  // An object's entries while the caps last; `skip` is handled by the caller (an Error's cause).
  function _resultEntries(value, depth, state, skip) {
    const keys = _keys(value);
    const entries = [];
    const getters = [];
    let reserved = false;
    let omitted = 0;
    let index = 0;
    for (; index < keys.length && entries.length + getters.length < RESULT_KEYS; index += 1) {
      const key = keys[index];
      if (key === skip) continue;
      if (state.budget <= 0 || key.length + 4 > state.budget) break;
      state.budget -= key.length + 4;
      if (key === TYPE_KEY) reserved = true;
      const child = _resultChild(value, key, depth, state);
      // An own accessor is listed by name, lazily, beside the prototype's (never called).
      if (child && typeof child === 'object' && _hasOwnCall(child, TYPE_KEY) && child[TYPE_KEY] === 'accessor' && skip === undefined) _put(getters, getters.length, key);
      else _put(entries, entries.length, [key, child]);
    }
    for (; index < keys.length; index += 1) {
      if (keys[index] !== skip) omitted += 1;
    }
    if (omitted > 0) state.truncated = true;
    return { entries, getters, omitted, reserved };
  }

  // A plain object stays a plain JSON object; a class instance, an object cut by a cap, or one
  // that has the reserved key itself is an `object` envelope listing its entries.
  function _resultRecord(value, depth, state, cls) {
    state.budget -= 2;
    const listed = _resultEntries(value, depth, state);
    const { entries, omitted, reserved } = listed;
    // Accessors, own and (for a class instance) inherited, by name only: never their values.
    const getters = listed.getters;
    if (cls) {
      // An inherited accessor that an own property shadows is not listed (the own one is read).
      const inherited = _accessorNames(value, state);
      for (let i = 0; i < inherited.length && getters.length < INSTANCE_GETTERS + RESULT_KEYS; i += 1) {
        const key = inherited[i];
        if (_arrIndexOf(getters, key) < 0 && !_hasOwn(value, key)) _put(getters, getters.length, key);
      }
    }
    if (!getters.length && !cls && !reserved && omitted === 0) {
      const out = {};
      for (let i = 0; i < entries.length; i += 1) setOwn(out, entries[i][0], entries[i][1]);
      return out;
    }
    if (getters.length) {
      for (let i = 0; i < getters.length; i += 1) state.budget -= getters[i].length + 4;
      return _typed('instance', { cls, entries, ...(omitted ? { omitted } : {}), getters });
    }
    return _typed('object', { ...(cls ? { class: cls } : {}), entries, ...(omitted ? { omitted } : {}) });
  }

  function _resultMap(map, size, depth, state) {
    const iterator = _invoke(_mapEntries, map);
    const limit = _min(size, RESULT_ITEMS);
    const entries = [];
    state.budget -= 30;
    for (let i = 0; i < limit && state.budget > 0; i += 1) {
      const step = _invoke(_mapNext, iterator);
      if (step.done) break;
      const key = _resultValue(step.value[0], depth + 1, state);
      _put(entries, entries.length, [key, _resultValue(step.value[1], depth + 1, state)]);
    }
    if (entries.length < size) state.truncated = true;
    return _typed('map', { size, entries });
  }

  function _resultSet(set, size, depth, state) {
    const iterator = _invoke(_setValues, set);
    const limit = _min(size, RESULT_ITEMS);
    const values = [];
    state.budget -= 30;
    for (let i = 0; i < limit && state.budget > 0; i += 1) {
      const step = _invoke(_setNext, iterator);
      if (step.done) break;
      _put(values, values.length, _resultValue(step.value, depth + 1, state));
    }
    if (values.length < size) state.truncated = true;
    return _typed('set', { size, values });
  }

  // Typed arrays keep their first values; a DataView only its size.
  function _resultView(view, state, capped) {
    const type = _typedArrayName ? _invoke(_typedArrayName, view) : undefined;
    if (!_setHas(TYPED_ARRAYS, type)) {
      let bytes = 0;
      try {
        bytes = _dataViewBytes ? _invoke(_dataViewBytes, view) : 0;
      } catch {
        bytes = 0;
      }
      return _typed('typedarray', { type: 'DataView', length: _count(bytes) });
    }
    const length = _count(_invoke(_typedArrayLength, view));
    if (capped) return _typed('typedarray', { type, length });
    const limit = _min(length, RESULT_ITEMS);
    const values = [];
    for (let i = 0; i < limit && state.budget > 0; i += 1) {
      const item = view[i];
      state.budget -= 8;
      _put(values, i, typeof item === 'bigint' ? _resultBigint(item, state) : _typedNumber(item));
    }
    if (values.length < length) state.truncated = true;
    return _typed('typedarray', { type, length, values });
  }

  // name, message, stack, own enumerable properties and the cause chain (one level deeper each).
  // The message and the stack stay plain strings, cut like any string at what is left of the
  // budget (read one past the cap, so a cut there is stated too).
  function _resultError(error, depth, state, capped) {
    const nameField = _errorField(error, 'name', MAX_NAME);
    const messageField = _errorField(error, 'message', RESULT_STRING + 1);
    // The engine formats a stack on first read from `name`, `message` and Error.prepareStackTrace:
    // with a page accessor among the first two, or a page prepareStackTrace, it is not read.
    const stackField = _errorField(error, 'stack', RESULT_STRING + 1, !nameField.lazy && !messageField.lazy && _noPrepareStackTrace());
    // A page accessor for name, message or stack is listed by name ("(…)"), never called.
    const getters = [];
    if (nameField.lazy) _put(getters, getters.length, 'name');
    if (messageField.lazy) _put(getters, getters.length, 'message');
    if (stackField.lazy) _put(getters, getters.length, 'stack');
    const name = nameField.text || 'Error';
    const message = _resultString(messageField.text, state);
    state.budget -= name.length + 30;
    const stackText = _resultString(stackField.text, state);
    const stack = typeof stackText === 'string' ? stackText : stackText.value;
    let listed = { entries: [], omitted: 0 };
    let hasCause = false;
    let cause;
    if (!capped) {
      listed = _resultEntries(error, depth, state, 'cause');
      hasCause = _hasOwn(error, 'cause');
      if (hasCause) cause = _resultChild(error, 'cause', depth, state);
    }
    return _typed('error', {
      name,
      message: typeof message === 'string' ? message : message.value,
      ...(stack ? { stack } : {}),
      ...(listed.entries.length ? { entries: listed.entries } : {}),
      ...(listed.omitted > 0 ? { omitted: listed.omitted } : {}),
      ...(hasCause ? { cause } : {}),
      ...(getters.length ? { getters } : {}),
    });
  }

  // JSON text of a typed value without JSON.stringify's object walk: a page's own
  // Array.prototype.toJSON (old Prototype.js, say) is never consulted.
  // JSON string quoting with syntax only — string indexing, comparison and concatenation, no
  // built-in a page could have replaced (console round 2, threat model C-1): the result text
  // never passes through page code. Matches JSON.stringify: short escapes, \u00XX for other
  // controls, a lone surrogate as \uXXXX (well-formed JSON.stringify).
  const _CONTROL_ESCAPES = { __proto__: null, '\u0000': '\\u0000', '\u0001': '\\u0001', '\u0002': '\\u0002', '\u0003': '\\u0003', '\u0004': '\\u0004', '\u0005': '\\u0005', '\u0006': '\\u0006', '\u0007': '\\u0007', '\u0008': '\\b', '\u0009': '\\t', '\u000a': '\\n', '\u000b': '\\u000b', '\u000c': '\\f', '\u000d': '\\r', '\u000e': '\\u000e', '\u000f': '\\u000f', '\u0010': '\\u0010', '\u0011': '\\u0011', '\u0012': '\\u0012', '\u0013': '\\u0013', '\u0014': '\\u0014', '\u0015': '\\u0015', '\u0016': '\\u0016', '\u0017': '\\u0017', '\u0018': '\\u0018', '\u0019': '\\u0019', '\u001a': '\\u001a', '\u001b': '\\u001b', '\u001c': '\\u001c', '\u001d': '\\u001d', '\u001e': '\\u001e', '\u001f': '\\u001f' };
  const _HEX = '0123456789abcdef';
  const _SURROGATES = '\ud800\ud801\ud802\ud803\ud804\ud805\ud806\ud807\ud808\ud809\ud80a\ud80b\ud80c\ud80d\ud80e\ud80f\ud810\ud811\ud812\ud813\ud814\ud815\ud816\ud817\ud818\ud819\ud81a\ud81b\ud81c\ud81d\ud81e\ud81f\ud820\ud821\ud822\ud823\ud824\ud825\ud826\ud827\ud828\ud829\ud82a\ud82b\ud82c\ud82d\ud82e\ud82f\ud830\ud831\ud832\ud833\ud834\ud835\ud836\ud837\ud838\ud839\ud83a\ud83b\ud83c\ud83d\ud83e\ud83f\ud840\ud841\ud842\ud843\ud844\ud845\ud846\ud847\ud848\ud849\ud84a\ud84b\ud84c\ud84d\ud84e\ud84f\ud850\ud851\ud852\ud853\ud854\ud855\ud856\ud857\ud858\ud859\ud85a\ud85b\ud85c\ud85d\ud85e\ud85f\ud860\ud861\ud862\ud863\ud864\ud865\ud866\ud867\ud868\ud869\ud86a\ud86b\ud86c\ud86d\ud86e\ud86f\ud870\ud871\ud872\ud873\ud874\ud875\ud876\ud877\ud878\ud879\ud87a\ud87b\ud87c\ud87d\ud87e\ud87f\ud880\ud881\ud882\ud883\ud884\ud885\ud886\ud887\ud888\ud889\ud88a\ud88b\ud88c\ud88d\ud88e\ud88f\ud890\ud891\ud892\ud893\ud894\ud895\ud896\ud897\ud898\ud899\ud89a\ud89b\ud89c\ud89d\ud89e\ud89f\ud8a0\ud8a1\ud8a2\ud8a3\ud8a4\ud8a5\ud8a6\ud8a7\ud8a8\ud8a9\ud8aa\ud8ab\ud8ac\ud8ad\ud8ae\ud8af\ud8b0\ud8b1\ud8b2\ud8b3\ud8b4\ud8b5\ud8b6\ud8b7\ud8b8\ud8b9\ud8ba\ud8bb\ud8bc\ud8bd\ud8be\ud8bf\ud8c0\ud8c1\ud8c2\ud8c3\ud8c4\ud8c5\ud8c6\ud8c7\ud8c8\ud8c9\ud8ca\ud8cb\ud8cc\ud8cd\ud8ce\ud8cf\ud8d0\ud8d1\ud8d2\ud8d3\ud8d4\ud8d5\ud8d6\ud8d7\ud8d8\ud8d9\ud8da\ud8db\ud8dc\ud8dd\ud8de\ud8df\ud8e0\ud8e1\ud8e2\ud8e3\ud8e4\ud8e5\ud8e6\ud8e7\ud8e8\ud8e9\ud8ea\ud8eb\ud8ec\ud8ed\ud8ee\ud8ef\ud8f0\ud8f1\ud8f2\ud8f3\ud8f4\ud8f5\ud8f6\ud8f7\ud8f8\ud8f9\ud8fa\ud8fb\ud8fc\ud8fd\ud8fe\ud8ff\ud900\ud901\ud902\ud903\ud904\ud905\ud906\ud907\ud908\ud909\ud90a\ud90b\ud90c\ud90d\ud90e\ud90f\ud910\ud911\ud912\ud913\ud914\ud915\ud916\ud917\ud918\ud919\ud91a\ud91b\ud91c\ud91d\ud91e\ud91f\ud920\ud921\ud922\ud923\ud924\ud925\ud926\ud927\ud928\ud929\ud92a\ud92b\ud92c\ud92d\ud92e\ud92f\ud930\ud931\ud932\ud933\ud934\ud935\ud936\ud937\ud938\ud939\ud93a\ud93b\ud93c\ud93d\ud93e\ud93f\ud940\ud941\ud942\ud943\ud944\ud945\ud946\ud947\ud948\ud949\ud94a\ud94b\ud94c\ud94d\ud94e\ud94f\ud950\ud951\ud952\ud953\ud954\ud955\ud956\ud957\ud958\ud959\ud95a\ud95b\ud95c\ud95d\ud95e\ud95f\ud960\ud961\ud962\ud963\ud964\ud965\ud966\ud967\ud968\ud969\ud96a\ud96b\ud96c\ud96d\ud96e\ud96f\ud970\ud971\ud972\ud973\ud974\ud975\ud976\ud977\ud978\ud979\ud97a\ud97b\ud97c\ud97d\ud97e\ud97f\ud980\ud981\ud982\ud983\ud984\ud985\ud986\ud987\ud988\ud989\ud98a\ud98b\ud98c\ud98d\ud98e\ud98f\ud990\ud991\ud992\ud993\ud994\ud995\ud996\ud997\ud998\ud999\ud99a\ud99b\ud99c\ud99d\ud99e\ud99f\ud9a0\ud9a1\ud9a2\ud9a3\ud9a4\ud9a5\ud9a6\ud9a7\ud9a8\ud9a9\ud9aa\ud9ab\ud9ac\ud9ad\ud9ae\ud9af\ud9b0\ud9b1\ud9b2\ud9b3\ud9b4\ud9b5\ud9b6\ud9b7\ud9b8\ud9b9\ud9ba\ud9bb\ud9bc\ud9bd\ud9be\ud9bf\ud9c0\ud9c1\ud9c2\ud9c3\ud9c4\ud9c5\ud9c6\ud9c7\ud9c8\ud9c9\ud9ca\ud9cb\ud9cc\ud9cd\ud9ce\ud9cf\ud9d0\ud9d1\ud9d2\ud9d3\ud9d4\ud9d5\ud9d6\ud9d7\ud9d8\ud9d9\ud9da\ud9db\ud9dc\ud9dd\ud9de\ud9df\ud9e0\ud9e1\ud9e2\ud9e3\ud9e4\ud9e5\ud9e6\ud9e7\ud9e8\ud9e9\ud9ea\ud9eb\ud9ec\ud9ed\ud9ee\ud9ef\ud9f0\ud9f1\ud9f2\ud9f3\ud9f4\ud9f5\ud9f6\ud9f7\ud9f8\ud9f9\ud9fa\ud9fb\ud9fc\ud9fd\ud9fe\ud9ff\uda00\uda01\uda02\uda03\uda04\uda05\uda06\uda07\uda08\uda09\uda0a\uda0b\uda0c\uda0d\uda0e\uda0f\uda10\uda11\uda12\uda13\uda14\uda15\uda16\uda17\uda18\uda19\uda1a\uda1b\uda1c\uda1d\uda1e\uda1f\uda20\uda21\uda22\uda23\uda24\uda25\uda26\uda27\uda28\uda29\uda2a\uda2b\uda2c\uda2d\uda2e\uda2f\uda30\uda31\uda32\uda33\uda34\uda35\uda36\uda37\uda38\uda39\uda3a\uda3b\uda3c\uda3d\uda3e\uda3f\uda40\uda41\uda42\uda43\uda44\uda45\uda46\uda47\uda48\uda49\uda4a\uda4b\uda4c\uda4d\uda4e\uda4f\uda50\uda51\uda52\uda53\uda54\uda55\uda56\uda57\uda58\uda59\uda5a\uda5b\uda5c\uda5d\uda5e\uda5f\uda60\uda61\uda62\uda63\uda64\uda65\uda66\uda67\uda68\uda69\uda6a\uda6b\uda6c\uda6d\uda6e\uda6f\uda70\uda71\uda72\uda73\uda74\uda75\uda76\uda77\uda78\uda79\uda7a\uda7b\uda7c\uda7d\uda7e\uda7f\uda80\uda81\uda82\uda83\uda84\uda85\uda86\uda87\uda88\uda89\uda8a\uda8b\uda8c\uda8d\uda8e\uda8f\uda90\uda91\uda92\uda93\uda94\uda95\uda96\uda97\uda98\uda99\uda9a\uda9b\uda9c\uda9d\uda9e\uda9f\udaa0\udaa1\udaa2\udaa3\udaa4\udaa5\udaa6\udaa7\udaa8\udaa9\udaaa\udaab\udaac\udaad\udaae\udaaf\udab0\udab1\udab2\udab3\udab4\udab5\udab6\udab7\udab8\udab9\udaba\udabb\udabc\udabd\udabe\udabf\udac0\udac1\udac2\udac3\udac4\udac5\udac6\udac7\udac8\udac9\udaca\udacb\udacc\udacd\udace\udacf\udad0\udad1\udad2\udad3\udad4\udad5\udad6\udad7\udad8\udad9\udada\udadb\udadc\udadd\udade\udadf\udae0\udae1\udae2\udae3\udae4\udae5\udae6\udae7\udae8\udae9\udaea\udaeb\udaec\udaed\udaee\udaef\udaf0\udaf1\udaf2\udaf3\udaf4\udaf5\udaf6\udaf7\udaf8\udaf9\udafa\udafb\udafc\udafd\udafe\udaff\udb00\udb01\udb02\udb03\udb04\udb05\udb06\udb07\udb08\udb09\udb0a\udb0b\udb0c\udb0d\udb0e\udb0f\udb10\udb11\udb12\udb13\udb14\udb15\udb16\udb17\udb18\udb19\udb1a\udb1b\udb1c\udb1d\udb1e\udb1f\udb20\udb21\udb22\udb23\udb24\udb25\udb26\udb27\udb28\udb29\udb2a\udb2b\udb2c\udb2d\udb2e\udb2f\udb30\udb31\udb32\udb33\udb34\udb35\udb36\udb37\udb38\udb39\udb3a\udb3b\udb3c\udb3d\udb3e\udb3f\udb40\udb41\udb42\udb43\udb44\udb45\udb46\udb47\udb48\udb49\udb4a\udb4b\udb4c\udb4d\udb4e\udb4f\udb50\udb51\udb52\udb53\udb54\udb55\udb56\udb57\udb58\udb59\udb5a\udb5b\udb5c\udb5d\udb5e\udb5f\udb60\udb61\udb62\udb63\udb64\udb65\udb66\udb67\udb68\udb69\udb6a\udb6b\udb6c\udb6d\udb6e\udb6f\udb70\udb71\udb72\udb73\udb74\udb75\udb76\udb77\udb78\udb79\udb7a\udb7b\udb7c\udb7d\udb7e\udb7f\udb80\udb81\udb82\udb83\udb84\udb85\udb86\udb87\udb88\udb89\udb8a\udb8b\udb8c\udb8d\udb8e\udb8f\udb90\udb91\udb92\udb93\udb94\udb95\udb96\udb97\udb98\udb99\udb9a\udb9b\udb9c\udb9d\udb9e\udb9f\udba0\udba1\udba2\udba3\udba4\udba5\udba6\udba7\udba8\udba9\udbaa\udbab\udbac\udbad\udbae\udbaf\udbb0\udbb1\udbb2\udbb3\udbb4\udbb5\udbb6\udbb7\udbb8\udbb9\udbba\udbbb\udbbc\udbbd\udbbe\udbbf\udbc0\udbc1\udbc2\udbc3\udbc4\udbc5\udbc6\udbc7\udbc8\udbc9\udbca\udbcb\udbcc\udbcd\udbce\udbcf\udbd0\udbd1\udbd2\udbd3\udbd4\udbd5\udbd6\udbd7\udbd8\udbd9\udbda\udbdb\udbdc\udbdd\udbde\udbdf\udbe0\udbe1\udbe2\udbe3\udbe4\udbe5\udbe6\udbe7\udbe8\udbe9\udbea\udbeb\udbec\udbed\udbee\udbef\udbf0\udbf1\udbf2\udbf3\udbf4\udbf5\udbf6\udbf7\udbf8\udbf9\udbfa\udbfb\udbfc\udbfd\udbfe\udbff\udc00\udc01\udc02\udc03\udc04\udc05\udc06\udc07\udc08\udc09\udc0a\udc0b\udc0c\udc0d\udc0e\udc0f\udc10\udc11\udc12\udc13\udc14\udc15\udc16\udc17\udc18\udc19\udc1a\udc1b\udc1c\udc1d\udc1e\udc1f\udc20\udc21\udc22\udc23\udc24\udc25\udc26\udc27\udc28\udc29\udc2a\udc2b\udc2c\udc2d\udc2e\udc2f\udc30\udc31\udc32\udc33\udc34\udc35\udc36\udc37\udc38\udc39\udc3a\udc3b\udc3c\udc3d\udc3e\udc3f\udc40\udc41\udc42\udc43\udc44\udc45\udc46\udc47\udc48\udc49\udc4a\udc4b\udc4c\udc4d\udc4e\udc4f\udc50\udc51\udc52\udc53\udc54\udc55\udc56\udc57\udc58\udc59\udc5a\udc5b\udc5c\udc5d\udc5e\udc5f\udc60\udc61\udc62\udc63\udc64\udc65\udc66\udc67\udc68\udc69\udc6a\udc6b\udc6c\udc6d\udc6e\udc6f\udc70\udc71\udc72\udc73\udc74\udc75\udc76\udc77\udc78\udc79\udc7a\udc7b\udc7c\udc7d\udc7e\udc7f\udc80\udc81\udc82\udc83\udc84\udc85\udc86\udc87\udc88\udc89\udc8a\udc8b\udc8c\udc8d\udc8e\udc8f\udc90\udc91\udc92\udc93\udc94\udc95\udc96\udc97\udc98\udc99\udc9a\udc9b\udc9c\udc9d\udc9e\udc9f\udca0\udca1\udca2\udca3\udca4\udca5\udca6\udca7\udca8\udca9\udcaa\udcab\udcac\udcad\udcae\udcaf\udcb0\udcb1\udcb2\udcb3\udcb4\udcb5\udcb6\udcb7\udcb8\udcb9\udcba\udcbb\udcbc\udcbd\udcbe\udcbf\udcc0\udcc1\udcc2\udcc3\udcc4\udcc5\udcc6\udcc7\udcc8\udcc9\udcca\udccb\udccc\udccd\udcce\udccf\udcd0\udcd1\udcd2\udcd3\udcd4\udcd5\udcd6\udcd7\udcd8\udcd9\udcda\udcdb\udcdc\udcdd\udcde\udcdf\udce0\udce1\udce2\udce3\udce4\udce5\udce6\udce7\udce8\udce9\udcea\udceb\udcec\udced\udcee\udcef\udcf0\udcf1\udcf2\udcf3\udcf4\udcf5\udcf6\udcf7\udcf8\udcf9\udcfa\udcfb\udcfc\udcfd\udcfe\udcff\udd00\udd01\udd02\udd03\udd04\udd05\udd06\udd07\udd08\udd09\udd0a\udd0b\udd0c\udd0d\udd0e\udd0f\udd10\udd11\udd12\udd13\udd14\udd15\udd16\udd17\udd18\udd19\udd1a\udd1b\udd1c\udd1d\udd1e\udd1f\udd20\udd21\udd22\udd23\udd24\udd25\udd26\udd27\udd28\udd29\udd2a\udd2b\udd2c\udd2d\udd2e\udd2f\udd30\udd31\udd32\udd33\udd34\udd35\udd36\udd37\udd38\udd39\udd3a\udd3b\udd3c\udd3d\udd3e\udd3f\udd40\udd41\udd42\udd43\udd44\udd45\udd46\udd47\udd48\udd49\udd4a\udd4b\udd4c\udd4d\udd4e\udd4f\udd50\udd51\udd52\udd53\udd54\udd55\udd56\udd57\udd58\udd59\udd5a\udd5b\udd5c\udd5d\udd5e\udd5f\udd60\udd61\udd62\udd63\udd64\udd65\udd66\udd67\udd68\udd69\udd6a\udd6b\udd6c\udd6d\udd6e\udd6f\udd70\udd71\udd72\udd73\udd74\udd75\udd76\udd77\udd78\udd79\udd7a\udd7b\udd7c\udd7d\udd7e\udd7f\udd80\udd81\udd82\udd83\udd84\udd85\udd86\udd87\udd88\udd89\udd8a\udd8b\udd8c\udd8d\udd8e\udd8f\udd90\udd91\udd92\udd93\udd94\udd95\udd96\udd97\udd98\udd99\udd9a\udd9b\udd9c\udd9d\udd9e\udd9f\udda0\udda1\udda2\udda3\udda4\udda5\udda6\udda7\udda8\udda9\uddaa\uddab\uddac\uddad\uddae\uddaf\uddb0\uddb1\uddb2\uddb3\uddb4\uddb5\uddb6\uddb7\uddb8\uddb9\uddba\uddbb\uddbc\uddbd\uddbe\uddbf\uddc0\uddc1\uddc2\uddc3\uddc4\uddc5\uddc6\uddc7\uddc8\uddc9\uddca\uddcb\uddcc\uddcd\uddce\uddcf\uddd0\uddd1\uddd2\uddd3\uddd4\uddd5\uddd6\uddd7\uddd8\uddd9\uddda\udddb\udddc\udddd\uddde\udddf\udde0\udde1\udde2\udde3\udde4\udde5\udde6\udde7\udde8\udde9\uddea\uddeb\uddec\udded\uddee\uddef\uddf0\uddf1\uddf2\uddf3\uddf4\uddf5\uddf6\uddf7\uddf8\uddf9\uddfa\uddfb\uddfc\uddfd\uddfe\uddff\ude00\ude01\ude02\ude03\ude04\ude05\ude06\ude07\ude08\ude09\ude0a\ude0b\ude0c\ude0d\ude0e\ude0f\ude10\ude11\ude12\ude13\ude14\ude15\ude16\ude17\ude18\ude19\ude1a\ude1b\ude1c\ude1d\ude1e\ude1f\ude20\ude21\ude22\ude23\ude24\ude25\ude26\ude27\ude28\ude29\ude2a\ude2b\ude2c\ude2d\ude2e\ude2f\ude30\ude31\ude32\ude33\ude34\ude35\ude36\ude37\ude38\ude39\ude3a\ude3b\ude3c\ude3d\ude3e\ude3f\ude40\ude41\ude42\ude43\ude44\ude45\ude46\ude47\ude48\ude49\ude4a\ude4b\ude4c\ude4d\ude4e\ude4f\ude50\ude51\ude52\ude53\ude54\ude55\ude56\ude57\ude58\ude59\ude5a\ude5b\ude5c\ude5d\ude5e\ude5f\ude60\ude61\ude62\ude63\ude64\ude65\ude66\ude67\ude68\ude69\ude6a\ude6b\ude6c\ude6d\ude6e\ude6f\ude70\ude71\ude72\ude73\ude74\ude75\ude76\ude77\ude78\ude79\ude7a\ude7b\ude7c\ude7d\ude7e\ude7f\ude80\ude81\ude82\ude83\ude84\ude85\ude86\ude87\ude88\ude89\ude8a\ude8b\ude8c\ude8d\ude8e\ude8f\ude90\ude91\ude92\ude93\ude94\ude95\ude96\ude97\ude98\ude99\ude9a\ude9b\ude9c\ude9d\ude9e\ude9f\udea0\udea1\udea2\udea3\udea4\udea5\udea6\udea7\udea8\udea9\udeaa\udeab\udeac\udead\udeae\udeaf\udeb0\udeb1\udeb2\udeb3\udeb4\udeb5\udeb6\udeb7\udeb8\udeb9\udeba\udebb\udebc\udebd\udebe\udebf\udec0\udec1\udec2\udec3\udec4\udec5\udec6\udec7\udec8\udec9\udeca\udecb\udecc\udecd\udece\udecf\uded0\uded1\uded2\uded3\uded4\uded5\uded6\uded7\uded8\uded9\udeda\udedb\udedc\udedd\udede\udedf\udee0\udee1\udee2\udee3\udee4\udee5\udee6\udee7\udee8\udee9\udeea\udeeb\udeec\udeed\udeee\udeef\udef0\udef1\udef2\udef3\udef4\udef5\udef6\udef7\udef8\udef9\udefa\udefb\udefc\udefd\udefe\udeff\udf00\udf01\udf02\udf03\udf04\udf05\udf06\udf07\udf08\udf09\udf0a\udf0b\udf0c\udf0d\udf0e\udf0f\udf10\udf11\udf12\udf13\udf14\udf15\udf16\udf17\udf18\udf19\udf1a\udf1b\udf1c\udf1d\udf1e\udf1f\udf20\udf21\udf22\udf23\udf24\udf25\udf26\udf27\udf28\udf29\udf2a\udf2b\udf2c\udf2d\udf2e\udf2f\udf30\udf31\udf32\udf33\udf34\udf35\udf36\udf37\udf38\udf39\udf3a\udf3b\udf3c\udf3d\udf3e\udf3f\udf40\udf41\udf42\udf43\udf44\udf45\udf46\udf47\udf48\udf49\udf4a\udf4b\udf4c\udf4d\udf4e\udf4f\udf50\udf51\udf52\udf53\udf54\udf55\udf56\udf57\udf58\udf59\udf5a\udf5b\udf5c\udf5d\udf5e\udf5f\udf60\udf61\udf62\udf63\udf64\udf65\udf66\udf67\udf68\udf69\udf6a\udf6b\udf6c\udf6d\udf6e\udf6f\udf70\udf71\udf72\udf73\udf74\udf75\udf76\udf77\udf78\udf79\udf7a\udf7b\udf7c\udf7d\udf7e\udf7f\udf80\udf81\udf82\udf83\udf84\udf85\udf86\udf87\udf88\udf89\udf8a\udf8b\udf8c\udf8d\udf8e\udf8f\udf90\udf91\udf92\udf93\udf94\udf95\udf96\udf97\udf98\udf99\udf9a\udf9b\udf9c\udf9d\udf9e\udf9f\udfa0\udfa1\udfa2\udfa3\udfa4\udfa5\udfa6\udfa7\udfa8\udfa9\udfaa\udfab\udfac\udfad\udfae\udfaf\udfb0\udfb1\udfb2\udfb3\udfb4\udfb5\udfb6\udfb7\udfb8\udfb9\udfba\udfbb\udfbc\udfbd\udfbe\udfbf\udfc0\udfc1\udfc2\udfc3\udfc4\udfc5\udfc6\udfc7\udfc8\udfc9\udfca\udfcb\udfcc\udfcd\udfce\udfcf\udfd0\udfd1\udfd2\udfd3\udfd4\udfd5\udfd6\udfd7\udfd8\udfd9\udfda\udfdb\udfdc\udfdd\udfde\udfdf\udfe0\udfe1\udfe2\udfe3\udfe4\udfe5\udfe6\udfe7\udfe8\udfe9\udfea\udfeb\udfec\udfed\udfee\udfef\udff0\udff1\udff2\udff3\udff4\udff5\udff6\udff7\udff8\udff9\udffa\udffb\udffc\udffd\udffe\udfff';
  function _surrogateEscape(unit) {
    let low = 0;
    let high = 2047;
    while (low < high) {
      const mid = (low + high) >> 1;
      if (_SURROGATES[mid] < unit) low = mid + 1;
      else high = mid;
    }
    const code = 0xd800 + low;
    return '\\u' + _HEX[(code >> 12) & 15] + _HEX[(code >> 8) & 15] + _HEX[(code >> 4) & 15] + _HEX[code & 15];
  }
  function _quote(text) {
    let out = '"';
    for (let i = 0; i < text.length; i += 1) {
      const unit = text[i];
      if (unit === '"') out += '\\"';
      else if (unit === '\\') out += '\\\\';
      else if (unit < ' ') out += _CONTROL_ESCAPES[unit];
      else if (unit >= '\ud800' && unit <= '\udfff') {
        const next = text[i + 1];
        if (unit <= '\udbff' && next !== undefined && next >= '\udc00' && next <= '\udfff') {
          out += unit + next;
          i += 1;
        } else {
          out += _surrogateEscape(unit);
        }
      } else out += unit;
    }
    return out + '"';
  }

  function _stringify(value) {
    if (value === null) return 'null';
    switch (typeof value) {
      case 'string': return _quote(value);
      // A template literal formats the number without calling a page-replaceable String().
      case 'number': return value === value && value !== Infinity && value !== -Infinity ? `${value}` : 'null';
      case 'boolean': return value ? 'true' : 'false';
      default: break;
    }
    let out;
    if (_isArray(value)) {
      out = '[';
      for (let i = 0; i < value.length; i += 1) out += (i ? ',' : '') + _stringify(value[i]);
      return out + ']';
    }
    const keys = _keys(value);
    out = '{';
    for (let i = 0; i < keys.length; i += 1) out += (i ? ',' : '') + _quote(keys[i]) + ':' + _stringify(value[keys[i]]);
    return out + '}';
  }

  function _resultType(value) {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    try {
      if (_isArray(value)) return 'array';
    } catch {
      return 'object';
    }
    return typeof value;
  }

  /**
   * A command's value as the panel receives it: `result` is typed JSON text, in the page's key
   * order; `truncated` says a cap cut something (each cut is metadata in the value); `render`
   * is 'table' for what table() returned. Never throws.
   */
  function encodeResult(value) {
    const job = encodeBegin(value);
    // A nested promise is read after a microtask flush: then (only then) the result is a promise.
    if (job.state.promises.length) {
      const finish = () => encodeEnd(job);
      return _settlePromises(job.state).then(finish, finish);
    }
    return encodeEnd(job);
  }

  // The same encoding in steps, for the console scope (spec §2), which must never await or
  // resolve a promise with its own objects: encodeBegin walks the value (registering nested
  // promises), the caller flushes ENCODE_TICKS microtasks with `await undefined` while
  // encodePending says so, calling encodeRound after each flush, then encodeEnd builds the answer.
  // The job is prototype-less and only its existing keys are ever written.
  function encodeBegin(value) {
    const state = { budget: RESULT_BUDGET, truncated: false, ancestors: [], promises: [], accessorNames: new _WeakMap() };
    let table = false;
    try {
      table = _tables !== null && _weakSetHas !== null && _isArray(value) && _weakSetHas(_tables, value);
    } catch {
      table = false;
    }
    let typed;
    try {
      typed = _resultValue(value, 0, state);
    } catch {
      typed = _typed('unreadable');
    }
    return { __proto__: null, value, typed, state, table, rounds: 0 };
  }

  function encodePending(job) {
    return job.state.promises.length > 0 && job.rounds < PROMISE_ROUNDS;
  }

  function encodeRound(job) {
    job.rounds += 1;
    _settleBatch(job.state);
  }

  // A thrown value's message and stack, as the console cell shows them: own data properties (or
  // the engine's own stack accessor) only — a page accessor or Error.prepareStackTrace is never
  // run, and a primitive's message is its own text.
  function thrownText(value) {
    if (value === null || (typeof value !== 'object' && typeof value !== 'function')) {
      let text = '';
      try { text = typeof value === 'symbol' ? _String(value) : `${value}`; } catch { text = ''; }
      return { __proto__: null, message: text, stack: '' };
    }
    try {
      const name = _errorField(value, 'name', MAX_NAME);
      const message = _errorField(value, 'message', RESULT_STRING);
      const stack = _errorField(value, 'stack', RESULT_STRING, !name.lazy && !message.lazy && _noPrepareStackTrace());
      return { __proto__: null, message: message.text, stack: stack.text };
    } catch {
      return { __proto__: null, message: '', stack: '' };
    }
  }

  function encodeEnd(job) {
    return _encodedResult(job.value, job.typed, job.state, job.table);
  }

  function _encodedResult(value, typed, state, table) {
    let text;
    try {
      text = _stringify(typed);
    } catch {
      text = `{"${TYPE_KEY}":"unreadable"}`;
    }
    // Prototype-less, `render` own only for a table: the console scope reads it without a page
    // getter on Object.prototype ever answering.
    const out = { __proto__: null, type: _resultType(value), result: text, truncated: state.truncated };
    if (table) out.render = 'table';
    return out;
  }

  // ── The typed model → page values ───────────────────────────────────────────────
  function _list(value) {
    return _isArray(value) ? value : [];
  }

  function _pairs(value) {
    return _list(value).filter((pair) => _isArray(pair) && pair.length === 2);
  }

  function _numberFrom(text) {
    if (text === 'NaN') return NaN;
    if (text === 'Infinity') return Infinity;
    if (text === '-Infinity') return -Infinity;
    if (text === '-0') return -0;
    return Number(text);
  }

  function _bigintFrom(text) {
    if (typeof text !== 'string' || !/^-?\d+$/.test(text)) return String(text);
    return BigInt(text);
  }

  // What cannot be rebuilt in the page (a function, a DOM node, a cycle, a cut-off subtree)
  // arrives as the text the Logs show for it.
  function _typedText(value) {
    const kind = value[TYPE_KEY];
    const name = typeof value.name === 'string' ? value.name : '';
    const length = _count(value.length);
    switch (kind) {
      case 'function': return `ƒ ${name || 'anonymous'}(${typeof value.params === 'string' ? value.params : ''})`;
      case 'dom': {
        if (typeof value.tag !== 'string') return typeof value.text === 'string' ? value.text : '<element>';
        const id = typeof value.id === 'string' && value.id ? '#' + value.id : '';
        return `<${value.tag}${id}${_list(value.classes).map((cls) => '.' + cls).join('')}>`;
      }
      case 'promise': return `Promise {<${typeof value.state === 'string' ? value.state : 'pending'}>}`;
      case 'circular': return '[Circular]';
      case 'accessor': return '(…)';
      case 'unreadable': return '[unreadable]';
      case 'typedarray': return `${typeof value.type === 'string' ? value.type : 'TypedArray'}(${length})`;
      case 'depth': {
        if (value.type === 'array') return _hasOwn(value, 'length') ? `Array(${length})` : '[…]';
        const cls = typeof value.class === 'string' ? value.class : '';
        return cls ? `${cls} {…}` : '{…}';
      }
      default: return '…';
    }
  }

  function _errorFrom(value) {
    const error = new Error(typeof value.message === 'string' ? value.message : '');
    const hidden = (key, item) => _defineProperty(error, key, { value: item, writable: true, enumerable: false, configurable: true });
    const name = typeof value.name === 'string' && value.name ? value.name : 'Error';
    if (name !== 'Error') hidden('name', name);
    if (typeof value.stack === 'string') hidden('stack', value.stack);
    for (const [key, item] of _pairs(value.entries)) setOwn(error, String(key), _revive(item));
    if (_hasOwn(value, 'cause')) hidden('cause', _revive(value.cause));
    return error;
  }

  // Only the values sent are rebuilt: a length or size alone never allocates.
  function _typedArrayFrom(value) {
    const type = value.type;
    if (!TYPED_ARRAYS.has(type) || !_isArray(value.values) || typeof globalThis[type] !== 'function') return _typedText(value);
    try {
      return new globalThis[type](value.values.map((item) => _revive(item)));
    } catch {
      return _typedText(value);
    }
  }

  function _revive(value) {
    if (value === null || typeof value !== 'object') return value;
    if (_isArray(value)) {
      const out = [];
      for (let i = 0; i < value.length; i += 1) out[i] = _revive(value[i]);
      return out;
    }
    switch (_hasOwn(value, TYPE_KEY) ? value[TYPE_KEY] : null) {
      case 'undefined': return undefined;
      case 'number': return _numberFrom(value.value);
      case 'bigint': return _bigintFrom(value.value);
      case 'string': return typeof value.value === 'string' ? value.value : '';
      case 'array': return _list(value.items).map((item) => _revive(item));
      case 'object': {
        const out = {};
        for (const [key, item] of _pairs(value.entries)) setOwn(out, String(key), _revive(item));
        return out;
      }
      case 'map': {
        const map = new Map();
        for (const [key, item] of _pairs(value.entries)) map.set(_revive(key), _revive(item));
        return map;
      }
      case 'set': {
        const set = new Set();
        for (const item of _list(value.values)) set.add(_revive(item));
        return set;
      }
      case 'date': return new Date(typeof value.iso === 'string' ? value.iso : NaN);
      case 'error': return _errorFrom(value);
      case 'symbol': return Symbol(typeof value.description === 'string' ? value.description : '');
      case 'typedarray': return _typedArrayFrom(value);
      case 'web': {
        // What a later command can read off it: its fields; or, for Headers, URLSearchParams and
        // FormData, its [key, value] entries as pairs — a repeated key (z=1&z=3) keeps both.
        const fields = _record(value.fields) || {};
        if (value.cls === 'RegExp') {
          try { return new RegExp(String(fields.source), String(fields.flags)); } catch { return String(fields.source); }
        }
        if (_isArray(value.entries)) return _pairs(value.entries).map(([key, item]) => [_revive(key), _revive(item)]);
        const out = {};
        for (const key of _keys(fields)) setOwn(out, key, _revive(fields[key]));
        return out;
      }
      case 'instance': {
        // Its own entries; the accessors were never read, so there is nothing to rebuild for them.
        const out = {};
        for (const [key, item] of _pairs(value.entries)) setOwn(out, String(key), _revive(item));
        return out;
      }
      case 'function':
      case 'dom':
      case 'promise':
      case 'accessor':
      case 'circular':
      case 'unreadable':
      case 'depth':
        return _typedText(value);
      default: break;
    }
    // Plain data — also an object whose "$xray" names no kind. defineProperty, so an own
    // "__proto__" key stays a key instead of becoming the prototype.
    const out = {};
    for (const key of _keys(value)) setOwn(out, key, _revive(value[key]));
    return out;
  }

  /** A typed value as the page value it stands for (BigInt, NaN, undefined, Map, …). */
  function reviveValue(value) {
    return _revive(value);
  }

  function _record(value) {
    return value && typeof value === 'object' && !_isArray(value) ? value : null;
  }

  /**
   * The command context, revived: saved variables (`scope`), `values` (res, req, prev, next) and
   * pin `value`s are typed and become page values; entries stay plain data. The context arrives
   * as a value the worker handed CDP (the console scope, spec §2) — never through the page's
   * JSON.parse — or as tagged JSON text (the panel's own preview). It is ours, fresh, so its
   * members are revived IN PLACE: every key written already exists as an own data property, so
   * no setter on Object.prototype runs. A value that cannot be revived is dropped (createRuntime
   * then parses the raw text). Never throws: an unreadable context is an empty one.
   */
  function reviveContext(input) {
    let context = input;
    if (typeof input === 'string') {
      try {
        context = _jsonParse(input);
      } catch {
        return {};
      }
    }
    if (!_record(context)) return {};
    const scope = _hasOwn(context, 'scope') ? _record(context.scope) : null;
    if (scope) {
      for (const name of _keys(scope)) {
        try {
          scope[name] = _reviveOwned(scope[name]);
        } catch {
          scope[name] = undefined;
        }
      }
    }
    const values = _hasOwn(context, 'values') ? _record(context.values) : null;
    if (values) for (const name of _keys(values)) _reviveMember(values, name);
    const pins = _hasOwn(context, 'pins') ? _record(context.pins) : null;
    if (pins) {
      for (const name of _keys(pins)) {
        const pin = _record(pins[name]);
        if (pin && _hasOwn(pin, 'value')) _reviveMember(pin, 'value');
      }
    }
    return context;
  }

  function _reviveMember(holder, key) {
    try {
      holder[key] = _reviveOwned(holder[key]);
    } catch {
      delete holder[key];
    }
  }

  // Plain JSON containers keep their identity (revived in place, each key already own); a typed
  // envelope becomes its page value.
  function _reviveOwned(value) {
    if (value === null || typeof value !== 'object') return value;
    if (_isArray(value)) {
      for (let i = 0; i < value.length; i += 1) value[i] = _reviveOwned(value[i]);
      return value;
    }
    if (_hasOwn(value, TYPE_KEY)) return _revive(value);
    for (const key of _keys(value)) value[key] = _reviveOwned(value[key]);
    return value;
  }

  const PIN_NAME = /^[a-f]$/;

  const HELP_TEXT = [
    'XRAY console helpers — the prompt evaluates against the selected request.',
    '',
    'Selected request',
    '  res / response        parsed response body (integers past 2^53 are BigInt: 9007199254740993n)',
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
    '',
    'Pinned requests',
    "  a … f                 pinned requests' parsed response bodies",
    '                        (pin via the context picker or request More actions;',
    '                        a letter is reused after its pin is removed)',
    '',
    'Multiline: Shift+Enter. History: ArrowUp / ArrowDown.',
    'Suggestions: Tab or → accepts the grey suggestion; Esc dismisses it.',
  ].join('\n');

  // The page scope and the content script publish on (a shadowed) `window`; the service worker,
  // which loads this file with importScripts for RUNTIME_NAMES, on its global.
  (typeof window !== 'undefined' ? window : globalThis).XRAY_ConsoleHelpers = {
    RUNTIME_NAMES,
    encodeResult,
    encodeBegin,
    encodePending,
    encodeRound,
    encodeEnd,
    ENCODE_TICKS: PROMISE_TICKS,
    thrownText,
    reviveContext,
    reviveValue,
    siblingEntry,
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
