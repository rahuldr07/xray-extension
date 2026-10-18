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
    const text = JSON.stringify(value, _bigintSafe, indent);
    return text === undefined ? String(value) : text;
  }

  function csvCell(value) {
    if (value == null) return '';
    let text = typeof value === 'string' ? value : JSON.stringify(value, _bigintSafe);
    if (text === undefined) text = String(value);
    if (CSV_FORMULA_LEAD.test(text) && !CSV_PLAIN_NUMBER.test(text)) text = `'${text}`;
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  function toCSV(arr) {
    if (!Array.isArray(arr) || !arr.length) return '';
    // Columns are the union across every row, not row 0's keys: captured payloads
    // are routinely heterogeneous, and toCSV([{}, {a: 1}]) used to erase the table.
    const keys = [];
    const seen = new Set();
    for (const row of arr) {
      if (!row || typeof row !== 'object') continue;
      for (const key of Object.keys(row)) {
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
    const rows = Array.isArray(data) ? data.slice() : [];
    if (_tables) _tables.add(rows);
    return rows;
  }

  // Results are built with defineProperty, so a captured key named "__proto__" stays an own key
  // (out[key] = … would set the prototype instead and drop it); "constructor" is a key like any other.
  function setOwn(target, key, value) {
    Object.defineProperty(target, key, { value, writable: true, enumerable: true, configurable: true });
    return target;
  }

  function diff(a, b) {
    const result = { added: {}, removed: {}, changed: {} };
    const aKeys = new Set(Object.keys(a || {}));
    const bKeys = new Set(Object.keys(b || {}));
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
    if (Array.isArray(value)) return value.length ? [schema(value[0], depth + 1)] : 'array';
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
      if (Object.prototype.hasOwnProperty.call(obj || {}, key)) setOwn(acc, key, obj[key]);
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
    if (!Array.isArray(entry.requestBody)) notes.push('the form fields were not kept with this entry, so the body is left out');
    else {
      for (const pair of entry.requestBody) {
        if (!Array.isArray(pair) || pair.length < 2) continue;
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
    return { fields, notes, sent: Array.isArray(entry.requestBody) };
  }

  // Page data inside a comment: quoted, every line break escaped (JSON.stringify escapes \n and \r;
  // U+2028 and U+2029 end a JavaScript comment too), so it can never end the comment early.
  function _noteText(value) {
    return JSON.stringify(String(value)).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
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
      const options = JSON.stringify({ method, headers: _formHeaders(entry) }, null, 2);
      const notes = form.notes.map((note) => `// Partial: ${note}.\n`).join('');
      if (!form.sent) return `${notes}fetch(${JSON.stringify(entry.url || '')}, ${options})`;
      const appends = form.fields.map(([name, value]) => `form.append(${JSON.stringify(name)}, ${JSON.stringify(value)});\n`).join('');
      return `${notes}const form = new FormData();\n${appends}\nfetch(${JSON.stringify(entry.url || '')}, ${options.replace(/\n\}$/, ',\n  "body": form\n}')})`;
    }
    const options = { method, headers: entry.requestHeaders || {} };
    const body = _requestText(entry);
    if (typeof body === 'string') options.body = body;
    const note = body !== null && typeof body === 'object' ? `// Partial: ${body.note}.\n` : '';
    return `${note}fetch(${JSON.stringify(entry.url || '')}, ${JSON.stringify(options, null, 2)})`;
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
      try { return JSON.parse(trimmed, _keepIntegers); } catch { /* not JSON: parseBody keeps it as text */ }
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
    map: (arr, fn) => Array.isArray(arr) ? arr.map(fn) : [],
    filter: (arr, fn) => Array.isArray(arr) ? arr.filter(fn) : [],
    find: (arr, fn) => Array.isArray(arr) ? arr.find(fn) : undefined,
    pluck: (arr, key) => Array.isArray(arr) ? arr.map((item) => item?.[key]) : [],
    // Null-prototype accumulators: a group named "constructor" or "__proto__" is a group, not
    // Object.prototype's function or the prototype setter.
    groupBy: (arr, key) => Array.isArray(arr)
      ? arr.reduce((acc, item) => {
        const group = typeof key === 'function' ? key(item) : item?.[key];
        (acc[group] = acc[group] || []).push(item);
        return acc;
      }, Object.create(null))
      : {},
    // Same key/function rule as groupBy, counting instead of collecting.
    countBy: (arr, key) => Array.isArray(arr)
      ? arr.reduce((acc, item) => {
        const group = typeof key === 'function' ? key(item) : item?.[key];
        acc[group] = (acc[group] || 0) + 1;
        return acc;
      }, Object.create(null))
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
    // res, req, prev and next arrive as typed values the panel read losslessly (spec J8:
    // reviveContext turned integers past 2^53 into BigInt); the raw text, parsed here, is
    // only the fallback for a value that was not sent.
    const values = context.values && typeof context.values === 'object' ? context.values : {};
    const valueOr = (name, read) => (Object.prototype.hasOwnProperty.call(values, name) ? values[name] : read());
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
    for (const name of Object.keys(pins)) {
      const pin = pins[name];
      if (!PIN_NAME.test(name) || !pin || typeof pin !== 'object') continue;
      if (Object.prototype.hasOwnProperty.call(runtime, name)) continue;
      runtime[name] = Object.prototype.hasOwnProperty.call(pin, 'value') ? pin.value : parseBody(pin.body);
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
      return Object.getOwnPropertyDescriptor(proto, key).get || null;
    } catch {
      return null;
    }
  }

  // Brand checks call the built-ins' own accessors: a Symbol.toStringTag can lie, a slot cannot.
  const _mapSize = _getter(Map.prototype, 'size');
  const _setSize = _getter(Set.prototype, 'size');
  const _bufferBytes = _getter(ArrayBuffer.prototype, 'byteLength');
  const _mapEntries = Map.prototype.entries;
  const _setValues = Set.prototype.values;
  const _mapNext = Object.getPrototypeOf(new Map().entries()).next;
  const _setNext = Object.getPrototypeOf(new Set().values()).next;

  function _hasOwn(value, key) {
    return Object.prototype.hasOwnProperty.call(value, key);
  }

  // Literals and spreads define own data properties: a setter on Object.prototype never runs.
  function _typed(kind, fields) {
    return fields ? { [TYPE_KEY]: kind, ...fields } : { [TYPE_KEY]: kind };
  }

  function _hasBrand(method, value) {
    if (!method) return false;
    try {
      method.call(value);
      return true;
    } catch {
      return false;
    }
  }

  function _count(value) {
    return Number.isSafeInteger(value) && value >= 0 ? value : 0;
  }

  function _typedNumber(value) {
    if (value !== value) return _typed('number', { value: 'NaN' });
    if (value === Infinity) return _typed('number', { value: 'Infinity' });
    if (value === -Infinity) return _typed('number', { value: '-Infinity' });
    if (value === 0 && 1 / value < 0) return _typed('number', { value: '-0' });
    return value;
  }

  function _readText(source, key, max) {
    try {
      const value = source[key];
      return typeof value === 'string' ? value.slice(0, max) : '';
    } catch {
      return '';
    }
  }

  function _functionName(fn) {
    return _readText(fn, 'name', MAX_NAME);
  }

  function _isError(value, tag) {
    return typeof Error.isError === 'function' ? Error.isError(value) : tag === '[object Error]';
  }

  function _isElement(value) {
    try {
      return typeof Element === 'function' && Object.prototype.isPrototypeOf.call(Element.prototype, value);
    } catch {
      return false;
    }
  }

  // "<tag#id.firstClass>", as the Logs show an element.
  function _domText(element) {
    const tag = _readText(element, 'tagName', MAX_NAME).toLowerCase() || 'element';
    const id = _readText(element, 'id', MAX_NAME);
    let classes = '';
    try {
      const raw = element.className;
      classes = typeof raw === 'string' ? raw : raw && typeof raw.baseVal === 'string' ? raw.baseVal : '';
    } catch {
      classes = '';
    }
    const first = classes.trim().split(/\s+/)[0];
    return `<${tag}${id ? '#' + id : ''}${first ? '.' + first : ''}>`.slice(0, 500);
  }

  // Constructor name of a class instance; '' for plain and null-prototype objects (also from
  // another realm, whose Object.prototype differs but whose constructor is "Object").
  function _className(value) {
    const proto = Object.getPrototypeOf(value);
    if (proto === null || proto === Object.prototype) return '';
    const ctor = proto.constructor;
    const name = typeof ctor === 'function' ? ctor.name : undefined;
    return typeof name === 'string' && name !== 'Object' ? name.slice(0, MAX_NAME) : '';
  }

  // At most the per-string cap and what is left of the budget, never ending inside a pair.
  function _resultString(text, state) {
    let kept = Math.min(text.length, RESULT_STRING, Math.max(0, state.budget));
    if (kept < text.length && kept > 0) {
      const code = text.charCodeAt(kept - 1);
      if (code >= 0xd800 && code <= 0xdbff) kept -= 1;
    }
    state.budget -= kept + 2;
    if (kept === text.length) return text;
    state.truncated = true;
    return _typed('string', { value: text.slice(0, kept), length: text.length });
  }

  // BigInt digits are all or nothing: a cut number would be a different number.
  function _resultBigint(value, state) {
    const digits = String(value);
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
      case 'symbol': state.budget -= 40; return _typed('symbol', { description: String(value).slice(7, -1).slice(0, MAX_DESCRIPTION) });
      case 'function': state.budget -= 40; return _typed('function', { name: _functionName(value) });
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
    ancestors[ancestors.length] = value;
    try {
      return _resultObject(value, depth, state);
    } catch {
      // A proxy trap or a getter refused (a revoked proxy throws on every touch).
      return _typed('unreadable');
    } finally {
      ancestors.length -= 1;
    }
  }

  function _resultChild(container, key, depth, state) {
    let child;
    try {
      child = container[key];
    } catch {
      return _typed('unreadable');
    }
    return _resultValue(child, depth + 1, state);
  }

  function _resultObject(value, depth, state) {
    const capped = depth > RESULT_DEPTH;
    const tag = Object.prototype.toString.call(value);
    if (_isError(value, tag)) return _resultError(value, depth, state, capped);
    if (tag === '[object Date]' && _hasBrand(Date.prototype.getTime, value)) {
      const time = Date.prototype.getTime.call(value);
      state.budget -= 40;
      return _typed('date', { iso: time === time ? Date.prototype.toISOString.call(value) : null });
    }
    if (_isElement(value)) {
      state.budget -= 40;
      return _typed('dom', { text: _domText(value) });
    }
    if (ArrayBuffer.isView(value)) return _resultView(value, state, capped);
    if (tag === '[object ArrayBuffer]' && _hasBrand(_bufferBytes, value)) {
      return _typed('typedarray', { type: 'ArrayBuffer', length: _bufferBytes.call(value) });
    }
    if (Array.isArray(value)) {
      if (!capped) return _resultArray(value, depth, state);
      state.truncated = true;
      return _typed('depth', { type: 'array', length: _count(value.length) });
    }
    if (tag === '[object Map]' || tag === '[object Set]') {
      const isMap = tag === '[object Map]';
      const sizeOf = isMap ? _mapSize : _setSize;
      if (_hasBrand(sizeOf, value)) {
        const size = sizeOf.call(value);
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
    const limit = Math.min(length, RESULT_ITEMS);
    const items = [];
    state.budget -= 2;
    for (let i = 0; i < limit && state.budget > 0; i += 1) items[i] = _resultChild(array, i, depth, state);
    if (items.length === length) return items;
    state.truncated = true;
    return _typed('array', { items, length });
  }

  // An object's entries while the caps last; `skip` is handled by the caller (an Error's cause).
  function _resultEntries(value, depth, state, skip) {
    const keys = Object.keys(value);
    const entries = [];
    let reserved = false;
    let omitted = 0;
    let index = 0;
    for (; index < keys.length && entries.length < RESULT_KEYS; index += 1) {
      const key = keys[index];
      if (key === skip) continue;
      if (state.budget <= 0 || key.length + 4 > state.budget) break;
      state.budget -= key.length + 4;
      if (key === TYPE_KEY) reserved = true;
      entries[entries.length] = [key, _resultChild(value, key, depth, state)];
    }
    for (; index < keys.length; index += 1) {
      if (keys[index] !== skip) omitted += 1;
    }
    if (omitted > 0) state.truncated = true;
    return { entries, omitted, reserved };
  }

  // A plain object stays a plain JSON object; a class instance, an object cut by a cap, or one
  // that has the reserved key itself is an `object` envelope listing its entries.
  function _resultRecord(value, depth, state, cls) {
    state.budget -= 2;
    const { entries, omitted, reserved } = _resultEntries(value, depth, state);
    if (!cls && !reserved && omitted === 0) {
      const out = {};
      for (let i = 0; i < entries.length; i += 1) setOwn(out, entries[i][0], entries[i][1]);
      return out;
    }
    return _typed('object', { ...(cls ? { class: cls } : {}), entries, ...(omitted ? { omitted } : {}) });
  }

  function _resultMap(map, size, depth, state) {
    const iterator = _mapEntries.call(map);
    const limit = Math.min(size, RESULT_ITEMS);
    const entries = [];
    state.budget -= 30;
    for (let i = 0; i < limit && state.budget > 0; i += 1) {
      const step = _mapNext.call(iterator);
      if (step.done) break;
      const key = _resultValue(step.value[0], depth + 1, state);
      entries[entries.length] = [key, _resultValue(step.value[1], depth + 1, state)];
    }
    if (entries.length < size) state.truncated = true;
    return _typed('map', { size, entries });
  }

  function _resultSet(set, size, depth, state) {
    const iterator = _setValues.call(set);
    const limit = Math.min(size, RESULT_ITEMS);
    const values = [];
    state.budget -= 30;
    for (let i = 0; i < limit && state.budget > 0; i += 1) {
      const step = _setNext.call(iterator);
      if (step.done) break;
      values[values.length] = _resultValue(step.value, depth + 1, state);
    }
    if (values.length < size) state.truncated = true;
    return _typed('set', { size, values });
  }

  // Typed arrays keep their first values; a DataView only its size.
  function _resultView(view, state, capped) {
    const type = Object.prototype.toString.call(view).slice(8, -1);
    if (!TYPED_ARRAYS.has(type)) return _typed('typedarray', { type: 'DataView', length: _count(view.byteLength) });
    const length = _count(view.length);
    if (capped) return _typed('typedarray', { type, length });
    const limit = Math.min(length, RESULT_ITEMS);
    const values = [];
    for (let i = 0; i < limit && state.budget > 0; i += 1) {
      const item = view[i];
      state.budget -= 8;
      values[i] = typeof item === 'bigint' ? _resultBigint(item, state) : _typedNumber(item);
    }
    if (values.length < length) state.truncated = true;
    return _typed('typedarray', { type, length, values });
  }

  // name, message, stack, own enumerable properties and the cause chain (one level deeper each).
  // The message and the stack stay plain strings, cut like any string at what is left of the
  // budget (read one past the cap, so a cut there is stated too).
  function _resultError(error, depth, state, capped) {
    const name = _readText(error, 'name', MAX_NAME) || 'Error';
    const message = _resultString(_readText(error, 'message', RESULT_STRING + 1), state);
    state.budget -= name.length + 30;
    const stackText = _resultString(_readText(error, 'stack', RESULT_STRING + 1), state);
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
    });
  }

  // JSON text of a typed value without JSON.stringify's object walk: a page's own
  // Array.prototype.toJSON (old Prototype.js, say) is never consulted.
  function _stringify(value) {
    if (value === null) return 'null';
    switch (typeof value) {
      case 'string': return JSON.stringify(value);
      case 'number': return Number.isFinite(value) ? String(value) : 'null';
      case 'boolean': return value ? 'true' : 'false';
      default: break;
    }
    let out;
    if (Array.isArray(value)) {
      out = '[';
      for (let i = 0; i < value.length; i += 1) out += (i ? ',' : '') + _stringify(value[i]);
      return out + ']';
    }
    const keys = Object.keys(value);
    out = '{';
    for (let i = 0; i < keys.length; i += 1) out += (i ? ',' : '') + JSON.stringify(keys[i]) + ':' + _stringify(value[keys[i]]);
    return out + '}';
  }

  function _resultType(value) {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    try {
      if (Array.isArray(value)) return 'array';
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
    const state = { budget: RESULT_BUDGET, truncated: false, ancestors: [] };
    let table = false;
    try {
      table = _tables !== null && Array.isArray(value) && _tables.has(value);
    } catch {
      table = false;
    }
    let typed;
    try {
      typed = _resultValue(value, 0, state);
    } catch {
      typed = _typed('unreadable');
    }
    let text;
    try {
      text = _stringify(typed);
    } catch {
      text = `{"${TYPE_KEY}":"unreadable"}`;
    }
    const out = { type: _resultType(value), result: text, truncated: state.truncated };
    if (table) out.render = 'table';
    return out;
  }

  // ── The typed model → page values ───────────────────────────────────────────────
  function _list(value) {
    return Array.isArray(value) ? value : [];
  }

  function _pairs(value) {
    return _list(value).filter((pair) => Array.isArray(pair) && pair.length === 2);
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
      case 'function': return `ƒ ${name || 'anonymous'}()`;
      case 'dom': return typeof value.text === 'string' ? value.text : '<element>';
      case 'circular': return '[Circular]';
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
    const hidden = (key, item) => Object.defineProperty(error, key, { value: item, writable: true, enumerable: false, configurable: true });
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
    if (!TYPED_ARRAYS.has(type) || !Array.isArray(value.values) || typeof globalThis[type] !== 'function') return _typedText(value);
    try {
      return new globalThis[type](value.values.map((item) => _revive(item)));
    } catch {
      return _typedText(value);
    }
  }

  function _revive(value) {
    if (value === null || typeof value !== 'object') return value;
    if (Array.isArray(value)) {
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
      case 'function':
      case 'dom':
      case 'circular':
      case 'unreadable':
      case 'depth':
        return _typedText(value);
      default: break;
    }
    // Plain data — also an object whose "$xray" names no kind. defineProperty, so an own
    // "__proto__" key stays a key instead of becoming the prototype.
    const out = {};
    for (const key of Object.keys(value)) setOwn(out, key, _revive(value[key]));
    return out;
  }

  /** A typed value as the page value it stands for (BigInt, NaN, undefined, Map, …). */
  function reviveValue(value) {
    return _revive(value);
  }

  function _record(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
  }

  /**
   * The command context from its tagged JSON text (panel/console.js _contextPayload): entries
   * stay plain data; saved variables (`scope`), `values` (res, req, prev, next) and pin
   * `value`s are typed and revived. A value that cannot be revived is dropped (createRuntime
   * then parses the raw text). Never throws: unreadable text is an empty context.
   */
  function reviveContext(text) {
    let context;
    try {
      context = JSON.parse(String(text));
    } catch {
      return {};
    }
    if (!_record(context)) return {};
    const scope = _record(context.scope);
    if (scope) {
      for (const name of Object.keys(scope)) {
        let value;
        try {
          value = _revive(scope[name]);
        } catch {
          value = undefined;
        }
        setOwn(scope, name, value);
      }
    }
    const values = _record(context.values);
    if (values) for (const name of Object.keys(values)) _reviveMember(values, name);
    const pins = _record(context.pins);
    if (pins) {
      for (const name of Object.keys(pins)) {
        const pin = _record(pins[name]);
        if (pin && _hasOwn(pin, 'value')) _reviveMember(pin, 'value');
      }
    }
    return context;
  }

  function _reviveMember(holder, key) {
    try {
      setOwn(holder, key, _revive(holder[key]));
    } catch {
      delete holder[key];
    }
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
  ].join('\n');

  window.XRAY_ConsoleHelpers = {
    encodeResult,
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
