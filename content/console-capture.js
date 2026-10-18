// content/console-capture.js — console capture (MAIN world)
//
// Every console call becomes one log entry in the TYPED LOG MODEL (spec J7). The stable
// form is documented in src/panel/models/logValue.ts (and docs/architecture.md):
//   * logArgCount is the number of arguments; logData is that one value when there is a
//     single argument, otherwise the list of arguments (so console.log([1,2,3]) and
//     console.log(1,2,3) stay distinct).
//   * A value is plain JSON where JSON says it exactly: strings, finite numbers, booleans,
//     null, arrays, plain objects. Anything else is an envelope under a reserved key,
//     { "$xray": kind, … }: bigint (exact digits), NaN/±Infinity/-0, undefined, functions,
//     Symbols, Dates, Maps, Sets, Errors (with cause), cycles, DOM elements, typed arrays,
//     class instances, and truncated strings/arrays/objects — a cut is metadata, never
//     in-band text.
//   * Unforgeable: a logged object that has an own "$xray" key is always sent as an
//     `object` envelope listing its entries, so no logged value can be read as a typed one.
//     "__type__" and "__xray_ref__" are ordinary keys; no marker is ever added to a value.
//   * "Load full object": objectRefs[i] is the lazy handle for argument objectRefArgs[i].
// The model is JSON-safe, so the DevTools relay, chrome.storage and Session JSON carry it
// unchanged. Previews are bounded (depth, items, keys, string length, node budget) because
// this runs for every console call on every page; the full copy has wider, finite bounds.
// Nothing here may throw into the page.
(function () {
  'use strict';

  if (window.__xray_console_installed__) return;
  window.__xray_console_installed__ = true;

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════════

  const BATCH_DELAY_MS = 16;      // ~1 frame, batches rapid logs
  // The reserved key of a typed value. Not "__"-prefixed: share-safe export drops such keys.
  const LOG_KEY = '$xray';
  // The bounds of one console call's preview and of one full copy. The encoder owns them,
  // in the units content.js checks, so content.js never has to rewrite what it is sent:
  //   nodes  — every value counts one: each argument, array item, entry value, Map key and
  //            value, Set value, typed-array value and cause;
  //   chars  — every character of string values, keys, Error messages and stacks, Symbol
  //            descriptions and BigInt digits.
  // A container stops at the first child the budget cannot pay for and records the cut as
  // metadata (an array's length, an object's `omitted` keys, a Map's or Set's size).
  // Containers deeper than `depth` are summarised as a `depth` value. A key longer than
  // `key` is left out (counted in `omitted`); BigInt digits are all or nothing.
  // `collection` bounds Map/Set/typed-array entries.
  const PREVIEW = { depth: 3, items: 10, keys: 20, collection: 10, string: 500, stack: 2000, key: 1000, nodes: 10000, chars: 1000000 };
  const FULL = { depth: 24, items: 1000, keys: 1000, collection: 1000, string: 100000, stack: 20000, key: 10000, nodes: 100000, chars: 10000000 };
  // A top-level string argument is kept whole up to this length (the call's budget allowing).
  const MAX_ARG_STRING = 100000;
  // Arguments beyond this are not captured (content.js carries no more either).
  const MAX_ARGS = 500;
  const MAX_NAME = 200;
  const MAX_DESCRIPTION = 1000;
  // Stands in for a value that could not be previewed or posted (spec J7: degrade and
  // flag, never drop the log). The entry carries captureDegraded: true.
  const UNCAPTURED_TEXT = '[XRAY: this value could not be captured]';

  // Natives captured at document_start, before page script can replace them: the encoder
  // checks brands with them instead of trusting a patched prototype or a Symbol.toStringTag.
  const _natives = (() => {
    const proto = Object.getPrototypeOf;
    const getter = (target, key) => Object.getOwnPropertyDescriptor(target, key).get;
    const typedArrayProto = proto(Uint8Array.prototype);
    return {
      keys: Object.keys,
      define: Object.defineProperty,
      getPrototypeOf: proto,
      isArray: Array.isArray,
      isSafeInteger: Number.isSafeInteger,
      hasOwn: Object.prototype.hasOwnProperty,
      isPrototypeOf: Object.prototype.isPrototypeOf,
      tag: Object.prototype.toString,
      objectProto: Object.prototype,
      // Prototype checks, not instanceof: a page can give Element or Error its own
      // Symbol.hasInstance after document_start.
      elementProto: typeof Element === 'function' ? Element.prototype : null,
      errorProto: Error.prototype,
      isError: typeof Error.isError === 'function' ? Error.isError : null,
      getTime: Date.prototype.getTime,
      toISOString: Date.prototype.toISOString,
      mapSize: getter(Map.prototype, 'size'),
      setSize: getter(Set.prototype, 'size'),
      mapEntries: Map.prototype.entries,
      setValues: Set.prototype.values,
      mapNext: proto(new Map().entries()).next,
      setNext: proto(new Set().values()).next,
      isView: ArrayBuffer.isView,
      bufferBytes: getter(ArrayBuffer.prototype, 'byteLength'),
      typedLength: getter(typedArrayProto, 'length'),
      typedName: getter(typedArrayProto, Symbol.toStringTag),
      viewBytes: getter(DataView.prototype, 'byteLength'),
    };
  })();

  // ═══════════════════════════════════════════════════════════════════════════
  // STORAGE: Keep references to original objects for lazy access
  // ═══════════════════════════════════════════════════════════════════════════

  const _objectStore = new Map();  // id -> { ref: WeakRef, fallback: the emitted preview }
  let _idCounter = 0;
  // Log ids and object handles carry a random per-load part: entries and their handles are
  // persisted and exported now, and a handle from another page load must never fetch this
  // load's object (nor a restored entry's id swallow a new one).
  const _loadId = Math.random().toString(36).slice(2, 10);
  const _bridgeToken = window.__XRAY_BRIDGE_TOKEN__ || _uid();
  try { Object.defineProperty(window, '__XRAY_BRIDGE_TOKEN__', { value: _bridgeToken, configurable: false, writable: false }); } catch { window.__XRAY_BRIDGE_TOKEN__ = _bridgeToken; }
  window.postMessage({ __xray_bridge_ready__: true, token: _bridgeToken }, '*');

  function _uid() {
    return 'xrl_' + _loadId + '_' + (++_idCounter).toString(36);
  }

  // The caller passes the preview it already computed, so each logged object is walked
  // once; it is the answer when the object itself has been collected.
  function _storeObject(obj, preview) {
    const id = _uid();
    _objectStore.set(id, { ref: typeof WeakRef !== 'undefined' ? new WeakRef(obj) : null, fallback: preview });
    // Trim opportunistically instead of letting a log storm hold thousands of
    // previews until the 60s sweep.
    if (_objectStore.size > 600) {
      const keys = Array.from(_objectStore.keys());
      keys.slice(0, keys.length - 500).forEach((key) => _objectStore.delete(key));
    }
    return id;
  }

  // Expose for panel to retrieve full object
  window.__XRAY_getLogObject__ = function (id) {
    const stored = _objectStore.get(id);
    if (!stored) return null;
    const obj = stored.ref ? stored.ref.deref() : undefined;
    // The full typed copy while the page still holds the object, else the preview.
    return obj !== undefined ? _encode(obj, 0, _context(FULL)) : stored.fallback;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ENCODER: one value -> the typed log model (preview or full copy)
  // ═══════════════════════════════════════════════════════════════════════════

  // Object literals and spreads only create own data properties, so a setter a page put
  // on Object.prototype never sees an envelope's fields.
  function _typed(kind, fields) {
    return fields ? { [LOG_KEY]: kind, ...fields } : { [LOG_KEY]: kind };
  }

  function _context(limits) {
    return { limits, nodes: limits.nodes, chars: limits.chars, ancestors: [] };
  }

  // A charged text: at most `max` characters and what is left of the character budget,
  // never ending inside a surrogate pair. content.js cuts with the same rule.
  function _take(text, max, ctx) {
    let kept = Math.min(text.length, max, ctx.chars > 0 ? ctx.chars : 0);
    if (kept < text.length && kept > 0) {
      const code = text.charCodeAt(kept - 1);
      if (code >= 0xd800 && code <= 0xdbff) kept -= 1;
    }
    ctx.chars -= kept;
    return kept === text.length ? text : text.slice(0, kept);
  }

  function _string(text, max, ctx) {
    const kept = _take(text, max, ctx);
    return kept.length === text.length ? text : _typed('string', { value: kept, length: text.length });
  }

  // BigInt digits are all or nothing: a cut number would be a different number.
  function _bigint(value, ctx) {
    const digits = String(value);
    if (digits.length > ctx.chars) return _typed('unreadable');
    ctx.chars -= digits.length;
    return _typed('bigint', { value: digits });
  }

  // A length or size from page objects (a proxy can answer anything): a safe integer or 0.
  function _count(value) {
    return _natives.isSafeInteger(value) && value >= 0 ? value : 0;
  }

  function _number(value) {
    if (value !== value) return _typed('number', { value: 'NaN' });
    if (value === Infinity) return _typed('number', { value: 'Infinity' });
    if (value === -Infinity) return _typed('number', { value: '-Infinity' });
    if (value === 0 && 1 / value < 0) return _typed('number', { value: '-0' });
    return value;
  }

  // A class with a static name() makes fn.name a function; only a string is carried.
  function _functionName(fn) {
    const name = fn.name;
    return typeof name === 'string' ? name.slice(0, MAX_NAME) : '';
  }

  // String(symbol) is the built-in "Symbol(desc)"; Symbol.prototype.description is a
  // getter a page can replace.
  function _symbolDescription(symbol, ctx) {
    return _take(String(symbol).slice(7, -1), MAX_DESCRIPTION, ctx);
  }

  function _readText(source, key, max) {
    try {
      const value = source[key];
      return typeof value === 'string' ? value.slice(0, max) : '';
    } catch {
      return '';
    }
  }

  // "<tag#id.firstClass>", as DevTools' compact element preview. An SVG element's
  // className is an SVGAnimatedString, not a string.
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

  // Constructor name of a class instance; '' for plain and null-prototype objects (also
  // from another realm, whose Object.prototype differs but whose constructor is "Object").
  function _className(value) {
    const proto = _natives.getPrototypeOf(value);
    if (proto === null || proto === _natives.objectProto) return '';
    const ctor = proto.constructor;
    const name = typeof ctor === 'function' ? ctor.name : undefined;
    return typeof name === 'string' && name !== 'Object' ? name.slice(0, MAX_NAME) : '';
  }

  // A built-in's internal slot, checked by calling one of its own methods (throws otherwise).
  function _hasBrand(method, value) {
    try {
      method.call(value);
      return true;
    } catch {
      return false;
    }
  }

  function _isError(value) {
    return _natives.isError ? _natives.isError(value) : _natives.isPrototypeOf.call(_natives.errorProto, value);
  }

  function _isElement(value) {
    return _natives.elementProto !== null && _natives.isPrototypeOf.call(_natives.elementProto, value);
  }

  // A property the page's getter (or proxy) refuses to give is `unreadable`, and costs
  // nothing else of its container.
  function _encodeChild(container, key, depth, ctx) {
    try {
      return _encode(container[key], depth + 1, ctx);
    } catch {
      return _typed('unreadable');
    }
  }

  function _encodeValue(value, depth, ctx) {
    try {
      return _encode(value, depth + 1, ctx);
    } catch {
      return _typed('unreadable');
    }
  }

  function _encode(value, depth, ctx) {
    ctx.nodes -= 1;
    switch (typeof value) {
      case 'string': return _string(value, ctx.limits.string, ctx);
      case 'number': return _number(value);
      case 'boolean': return value;
      case 'undefined': return _typed('undefined');
      case 'bigint': return _bigint(value, ctx);
      case 'symbol': return _typed('symbol', { description: _symbolDescription(value, ctx) });
      case 'function': return _typed('function', { name: _functionName(value) });
      default: break;
    }
    if (value === null) return null;
    const ancestors = ctx.ancestors;
    // A cycle is an object that is its own ancestor. A sibling reached twice is not.
    for (let i = 0; i < ancestors.length; i += 1) {
      if (ancestors[i] === value) return _typed('circular');
    }
    if (_isElement(value)) return _typed('dom', { text: _domText(value) });
    // Only a value past the budget (an argument or a cause after the call's values ran
    // out) gets here with none left: it is summarised, not walked.
    const capped = depth > ctx.limits.depth || ctx.nodes < 0;
    ancestors[ancestors.length] = value;
    try {
      return _isError(value) ? _encodeError(value, depth, ctx, capped) : _encodeObject(value, depth, ctx, capped);
    } finally {
      ancestors.length -= 1;
    }
  }

  function _encodeObject(value, depth, ctx, capped) {
    const tag = _natives.tag.call(value);
    if (tag === '[object Date]' && _hasBrand(_natives.getTime, value)) {
      const time = _natives.getTime.call(value);
      return _typed('date', { iso: time === time ? _natives.toISOString.call(value) : null });
    }
    if (_natives.isView(value)) return _encodeView(value, ctx, capped);
    if (tag === '[object ArrayBuffer]' && _hasBrand(_natives.bufferBytes, value)) {
      return _typed('typedarray', { type: 'ArrayBuffer', length: _natives.bufferBytes.call(value) });
    }
    if (_natives.isArray(value)) {
      return capped ? _typed('depth', { type: 'array', length: _count(value.length) }) : _encodeArray(value, depth, ctx);
    }
    if (tag === '[object Map]' || tag === '[object Set]') {
      const isMap = tag === '[object Map]';
      const sizeOf = isMap ? _natives.mapSize : _natives.setSize;
      if (_hasBrand(sizeOf, value)) {
        const size = sizeOf.call(value);
        if (capped) return _typed('depth', { type: 'object', class: isMap ? 'Map' : 'Set', length: size });
        return isMap ? _encodeMap(value, size, depth, ctx) : _encodeSet(value, size, depth, ctx);
      }
    }
    const cls = _className(value);
    if (capped) return _typed('depth', cls ? { type: 'object', class: cls } : { type: 'object' });
    return _encodeRecord(value, depth, ctx, cls);
  }

  function _encodeArray(array, depth, ctx) {
    const length = _count(array.length);
    const limit = Math.min(length, ctx.limits.items);
    const items = [];
    for (let i = 0; i < limit && ctx.nodes > 0; i += 1) items[i] = _encodeChild(array, i, depth, ctx);
    return items.length < length ? _typed('array', { items, length }) : items;
  }

  // An object's entries while the budgets last. A key longer than the key cap is left out;
  // once the values or the characters run out, every remaining key is. Left-out keys are
  // counted in `omitted`. Keys are charged like string values. `skip` is handled elsewhere
  // (an Error's cause).
  function _encodeEntries(source, keys, depth, ctx, skip) {
    const entries = [];
    let omitted = 0;
    let reserved = false;
    const limit = Math.min(keys.length, ctx.limits.keys);
    let i = 0;
    for (; i < limit; i += 1) {
      const key = keys[i];
      if (key === skip) continue;
      if (ctx.nodes <= 0) break;
      if (key.length > ctx.limits.key) { omitted += 1; continue; }
      if (key.length > ctx.chars) break;
      ctx.chars -= key.length;
      if (key === LOG_KEY) reserved = true;
      entries[entries.length] = [key, _encodeChild(source, key, depth, ctx)];
    }
    for (; i < keys.length; i += 1) {
      if (keys[i] !== skip) omitted += 1;
    }
    return { entries, omitted, reserved };
  }

  // A plain object stays a plain JSON object. A class instance, an object cut by a budget
  // or the key cap, or one that has the reserved key itself is an `object` envelope listing
  // its entries — the last is what makes the encoding unforgeable.
  function _encodeRecord(value, depth, ctx, cls) {
    const { entries, omitted, reserved } = _encodeEntries(value, _natives.keys(value), depth, ctx);
    if (!cls && !reserved && omitted === 0) {
      const out = {};
      // defineProperty, so an own "__proto__" key stays data instead of a prototype.
      for (let i = 0; i < entries.length; i += 1) {
        _natives.define(out, entries[i][0], { __proto__: null, value: entries[i][1], enumerable: true, configurable: true, writable: true });
      }
      return out;
    }
    return _typed('object', { ...(cls ? { class: cls } : {}), entries, ...(omitted ? { omitted } : {}) });
  }

  function _encodeMap(map, size, depth, ctx) {
    const iterator = _natives.mapEntries.call(map);
    const limit = Math.min(size, ctx.limits.collection);
    const entries = [];
    for (let i = 0; i < limit && ctx.nodes > 0; i += 1) {
      const step = _natives.mapNext.call(iterator);
      if (step.done) break;
      const pair = step.value;
      const key = _encodeValue(pair[0], depth, ctx);
      entries[i] = [key, _encodeValue(pair[1], depth, ctx)];
    }
    return _typed('map', { size, entries });
  }

  function _encodeSet(set, size, depth, ctx) {
    const iterator = _natives.setValues.call(set);
    const limit = Math.min(size, ctx.limits.collection);
    const values = [];
    for (let i = 0; i < limit && ctx.nodes > 0; i += 1) {
      const step = _natives.setNext.call(iterator);
      if (step.done) break;
      values[i] = _encodeValue(step.value, depth, ctx);
    }
    return _typed('set', { size, values });
  }

  // Typed arrays keep their first values (each one a value of the budget); a DataView or
  // an ArrayBuffer only its size.
  function _encodeView(view, ctx, capped) {
    const name = _natives.typedName.call(view);
    if (typeof name !== 'string') return _typed('typedarray', { type: 'DataView', length: _natives.viewBytes.call(view) });
    const length = _natives.typedLength.call(view);
    if (capped) return _typed('typedarray', { type: name, length });
    const limit = Math.min(length, ctx.limits.collection);
    const values = [];
    for (let i = 0; i < limit && ctx.nodes > 0; i += 1) {
      ctx.nodes -= 1;
      const item = view[i];
      values[i] = typeof item === 'bigint' ? _bigint(item, ctx) : _number(item);
    }
    return _typed('typedarray', { type: name, length, values });
  }

  // name, message, stack, own enumerable properties, and the cause chain (each cause one
  // level deeper, so a chain is bounded by the depth limit; a cycle is [Circular]). The
  // message and stack are charged; a cause is always kept (summarised past the budget).
  function _encodeError(error, depth, ctx, capped) {
    const name = _readText(error, 'name', MAX_NAME) || 'Error';
    const message = _take(_readText(error, 'message', ctx.limits.string), ctx.limits.string, ctx);
    const stack = _take(_readText(error, 'stack', ctx.limits.stack), ctx.limits.stack, ctx);
    let entries = [];
    let omitted = 0;
    let cause;
    let hasCause = false;
    if (!capped) {
      ({ entries, omitted } = _encodeEntries(error, _natives.keys(error), depth, ctx, 'cause'));
      hasCause = _natives.hasOwn.call(error, 'cause');
      if (hasCause) cause = _encodeChild(error, 'cause', depth, ctx);
    }
    return _typed('error', {
      name,
      message,
      ...(stack ? { stack } : {}),
      ...(entries.length ? { entries } : {}),
      ...(omitted > 0 ? { omitted } : {}),
      ...(hasCause ? { cause } : {}),
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BATCHING: Collect rapid logs and emit together
  // ═══════════════════════════════════════════════════════════════════════════

  let _batch = [];
  let _batchTimer = null;

  // True when the bridge took the message. postMessage structured-clones it here, so
  // a value the encoder let through that clone rejects throws a DataCloneError.
  function _post(entries) {
    try {
      window.postMessage({ __xray_capture__: true, token: _bridgeToken, batch: true, entries }, '*');
      return true;
    } catch {
      return false;
    }
  }

  // The whole payload replaced: one placeholder argument. The handles stay (Load full
  // object still works) but their argument positions no longer apply.
  function _degradedEntry(entry) {
    return {
      id: entry.id,
      type: 'log',
      timestamp: entry.timestamp,
      logLevel: entry.logLevel,
      logArgCount: 1,
      logData: UNCAPTURED_TEXT,
      objectRefs: entry.objectRefs,
      pinned: false,
      captureDegraded: true,
    };
  }

  function _cloneable(value) {
    try {
      structuredClone(value);
      return true;
    } catch {
      return false;
    }
  }

  // The entry with only the arguments clone rejects replaced, so the rest of the log
  // survives (a single logged array is checked item by item the same way).
  function _cloneableArgsEntry(entry) {
    const data = entry.logData;
    let logData = UNCAPTURED_TEXT;
    if (Array.isArray(data)) {
      logData = data.map((arg) => (_cloneable(arg) ? arg : UNCAPTURED_TEXT));
    } else if (_cloneable(data)) {
      logData = data;
    }
    return { ..._degradedEntry(entry), logArgCount: entry.logArgCount, logData, objectRefArgs: entry.objectRefArgs };
  }

  // One postMessage for the whole batch. If clone rejects it, every entry is retried
  // on its own so one bad value never costs its siblings; an entry that still fails
  // is re-sent without the arguments clone rejects, then with its whole payload
  // replaced. If even that fails, the loss is counted as a 'clone-failed' drop (spec J5),
  // which content.js shows in the capture receipt.
  function _flushBatch() {
    _batchTimer = null;
    if (_batch.length === 0) return;
    const entries = _batch;
    _batch = [];
    if (_post(entries)) {
      if (_cloneFailed) _reportDrops();
      return;
    }
    for (const entry of entries) {
      if (_post([entry])) continue;
      if (typeof structuredClone === 'function' && _post([_cloneableArgsEntry(entry)])) continue;
      if (_post([_degradedEntry(entry)])) continue;
      _cloneFailed += 1;
    }
    if (_cloneFailed) _reportDrops();
  }

  // Logs lost even degraded, not yet reported. Only primitives cross in the report, so it
  // cannot fail on cloning; if postMessage fails anyway, the count waits for the next flush.
  let _cloneFailed = 0;
  function _reportDrops() {
    const count = Math.min(500, _cloneFailed);
    try {
      window.postMessage({ __xray_capture_drop__: true, token: _bridgeToken, reason: 'clone-failed', count }, '*');
      _cloneFailed -= count;
    } catch {
      // reported with the next flush that posts
    }
  }

  // The flush runs from XRAY's timer: nothing may be thrown into the page from it.
  function _flushSafely() {
    try {
      _flushBatch();
    } catch {
      // Swallowed on purpose; _flushBatch already reset the batch and the timer.
    }
  }

  // One top-level console argument in the typed model. Strings, finite numbers, booleans
  // and null pass by value (the common case, no walk); everything else goes through the
  // preview encoder, and objects are kept for "Load full object" with their argument
  // position. An argument the encoder cannot read at all becomes UNCAPTURED_TEXT and
  // degrades the entry.
  function _encodeArg(arg, index, refs, flags, ctx) {
    const type = typeof arg;
    if (type === 'string') { ctx.nodes -= 1; return _string(arg, MAX_ARG_STRING, ctx); }
    if (arg === null || type === 'boolean') { ctx.nodes -= 1; return arg; }
    if (type === 'number') { ctx.nodes -= 1; return _number(arg); }
    try {
      // One preview walk shared between the emitted data and the stored fallback
      // (this runs for every console.log on every page).
      const preview = _encode(arg, 0, ctx);
      if (type === 'object') {
        refs.objectRefs[refs.objectRefs.length] = _storeObject(arg, preview);
        refs.objectRefArgs[refs.objectRefArgs.length] = index;
      }
      return preview;
    } catch {
      flags.degraded = true;
      return UNCAPTURED_TEXT;
    }
  }

  function _emit(level, args) {
    const refs = { objectRefs: [], objectRefArgs: [] };
    const flags = { degraded: false };
    // One budget for the whole call, shared by its arguments.
    const ctx = _context(PREVIEW);
    const count = args.length < MAX_ARGS ? args.length : MAX_ARGS;
    const values = [];
    for (let i = 0; i < count; i += 1) values[i] = _encodeArg(args[i], i, refs, flags, ctx);

    const entry = {
      id: _uid(),
      type: 'log',
      timestamp: Date.now(),
      logLevel: level,
      logArgCount: values.length,
      logData: values.length === 1 ? values[0] : values,
      objectRefs: refs.objectRefs,
      objectRefArgs: refs.objectRefArgs,
      pinned: false,
      ...(flags.degraded ? { captureDegraded: true } : {}),
    };

    _batch[_batch.length] = entry;

    // Schedule flush
    if (!_batchTimer) {
      _batchTimer = setTimeout(_flushSafely, BATCH_DELAY_MS);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HIJACK: Wrap console methods
  // ═══════════════════════════════════════════════════════════════════════════

  const _original = {};
  
  ['log', 'warn', 'error', 'info', 'debug'].forEach(level => {
    _original[level] = console[level].bind(console);
    
    console[level] = function (...args) {
      _original[level](...args);
      try { 
        _emit(level === 'info' ? 'log' : level === 'debug' ? 'log' : level, args); 
      } catch { 
        /* never crash the page */ 
      }
    };
  });

  // Also capture console.table, console.dir
  _original.table = console.table?.bind(console);
  _original.dir = console.dir?.bind(console);
  
  // The table's data (and its columns when given) are logged as arguments: no marker object.
  if (_original.table) {
    console.table = function (data, columns) {
      _original.table(data, columns);
      try { _emit('log', columns === undefined ? [data] : [data, columns]); } catch { /* never crash the page */ }
    };
  }
  
  if (_original.dir) {
    console.dir = function (obj, options) {
      _original.dir(obj, options);
      try { _emit('log', [obj]); } catch { /* never crash the page */ }
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MESSAGE HANDLER: Respond to requests for full object data
  // ═══════════════════════════════════════════════════════════════════════════

  window.addEventListener('message', (e) => {
    // Every other bridge listener rejects messages that did not come from this window
    // (interceptor.js, content.js, console-executor.js all do). This one was missed;
    // without it a cross-origin frame or opener can address the handler directly.
    if (e.source !== window) return;
    if (!e.data?.__xray_fetch_object__) return;
    if (e.data.token !== _bridgeToken) return;

    const { msgId, refId } = e.data;
    // Never throws into the page, and the panel's request always settles: a copy that
    // cannot be made or cloned is answered with the stored preview, else null.
    const fallback = () => _objectStore.get(refId)?.fallback ?? null;
    let data;
    try {
      data = window.__XRAY_getLogObject__(refId);
    } catch {
      data = fallback();
    }
    if (!_respond(msgId, data) && !_respond(msgId, fallback())) _respond(msgId, null);
  });

  function _respond(msgId, data) {
    try {
      window.postMessage({
        __xray_fetch_response__: true,
        token: _bridgeToken,
        msgId,
        data,
      }, '*');
      return true;
    } catch {
      return false;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CLEANUP: Periodically clean up old object references
  // ═══════════════════════════════════════════════════════════════════════════

  setInterval(() => {
    // Keep only last 500 object refs
    if (_objectStore.size > 500) {
      const keys = Array.from(_objectStore.keys());
      const toDelete = keys.slice(0, keys.length - 500);
      toDelete.forEach(k => _objectStore.delete(k));
    }
  }, 60000); // Every minute

})();
