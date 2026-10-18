import { LOG_TYPE_KEY } from './logValue';

/*
 * The typed log model under a bound (spec J7, J9): content/content.js's checker in TypeScript, so
 * the panel can bound a log in the same units and with the same cut rules — a saved session keeps
 * its logs in the model, cut as metadata, never as a JSON-prefix string (plan Task 8).
 *
 * `nodes` counts every value (argument, item, entry value, Map key and value, Set value, typed-array
 * value, cause); `chars` every character of string values, keys, Error messages and stacks, Symbol
 * descriptions and BigInt digits. A container stops at the first child the budget cannot pay for and
 * records the cut (`length`, `size`, `omitted`, a `string` or `depth` envelope); a key over the key
 * cap is left out and counted; BigInt digits are all or nothing (`unreadable`). Natives a page or a
 * hand-built entry can hold (NaN, -0, BigInt, undefined, Date, Map, Set, Error, typed arrays,
 * functions, Symbols, cycles) become envelopes, and an object with the reserved key that is not a
 * valid envelope is listed as an `object` envelope, so the output is JSON-safe and reads as data.
 * At content.js's limits the two give the same model (test/log-model.test.js "J9 parity"), and
 * bounding a bounded value changes nothing.
 */

export interface LogLimits {
  depth: number;
  items: number;
  string: number;
  stack: number;
  key: number;
  nodes: number;
  chars: number;
}

/** content.js's per-entry limits (LOG_ENTRY_LIMITS there): what the bridge lets through. */
export const LOG_ENTRY_LIMITS: Readonly<LogLimits> = Object.freeze({ depth: 8, items: 500, string: 100_000, stack: 100_000, key: 20_000, nodes: 20_000, chars: 2_000_000 });

/**
 * One log in a saved session: the encoder's preview budget in values (so a preview log is saved as it
 * is), and the 20,000 characters a log has always been saved with.
 */
export const LOG_PERSIST_LIMITS: Readonly<LogLimits> = Object.freeze({ depth: 8, items: 500, string: 20_000, stack: 20_000, key: 20_000, nodes: 10_000, chars: 20_000 });

/** The arguments content.js carries for one console call. */
const MAX_ARGS = 500;
const MAX_NAME = 200;
const NUMBER_WORDS = new Set(['NaN', 'Infinity', '-Infinity', '-0']);
const TYPE_NAME = /^[A-Za-z][A-Za-z0-9]{0,39}$/;
const DIGITS = /^-?\d+$/;

type Bag = Record<string, unknown>;

interface Budget {
  limits: LogLimits;
  nodes: number;
  chars: number;
  ancestors: object[];
}

function budgetFor(limits: LogLimits): Budget {
  return { limits, nodes: limits.nodes, chars: limits.chars, ancestors: [] };
}

function hasOwn(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function typed(kind: string, fields?: Bag): Bag {
  return fields ? { [LOG_TYPE_KEY]: kind, ...fields } : { [LOG_TYPE_KEY]: kind };
}

function define(target: Bag, key: string, value: unknown): void {
  // defineProperty, so an own "__proto__" key stays data instead of a prototype.
  Object.defineProperty(target, key, { value, enumerable: true, configurable: true, writable: true });
}

/** A prefix of `text` within `max` and the budget's characters, never ending inside a surrogate pair. */
function clip(text: string, max: number, budget: Budget): string {
  let kept = Math.max(0, Math.min(max, budget.chars, text.length));
  if (kept < text.length && kept > 0) {
    const code = text.charCodeAt(kept - 1);
    if (code >= 0xd800 && code <= 0xdbff) kept -= 1;
  }
  budget.chars -= kept;
  return kept === text.length ? text : text.slice(0, kept);
}

function boundString(text: string, budget: Budget): unknown {
  const kept = clip(text, budget.limits.string, budget);
  return kept.length === text.length ? kept : typed('string', { value: kept, length: text.length });
}

/** Digits all or nothing: a cut number would be a different number. */
function boundBigint(digits: string, budget: Budget): Bag {
  if (digits.length > budget.chars) return typed('unreadable');
  budget.chars -= digits.length;
  return typed('bigint', { value: digits });
}

function boundNumber(value: number): unknown {
  if (Number.isNaN(value)) return typed('number', { value: 'NaN' });
  if (value === Infinity) return typed('number', { value: 'Infinity' });
  if (value === -Infinity) return typed('number', { value: '-Infinity' });
  if (Object.is(value, -0)) return typed('number', { value: '-0' });
  return value;
}

function readName(read: () => unknown): string {
  try {
    const name = read();
    return typeof name === 'string' ? name.slice(0, MAX_NAME) : '';
  } catch {
    return '';
  }
}

function child(container: object, key: string | number, budget: Budget, depth: number): unknown {
  try {
    return boundValue((container as Bag)[key as string], budget, depth + 1);
  } catch {
    return typed('unreadable');
  }
}

/** [key, value] pairs with string keys, as an object or error envelope lists them. */
function isEntryList(value: unknown): value is Array<[string, unknown]> {
  return Array.isArray(value) && value.every((pair) => Array.isArray(pair) && pair.length === 2 && typeof pair[0] === 'string');
}

/**
 * Entries while the budget lasts: a key over the key cap is left out, and once the values or the
 * characters run out every remaining key is; left-out keys are counted. Keys are charged like string
 * values. `read(i)` bounds entry i's value.
 */
function keyed(keys: string[], read: (index: number) => unknown, budget: Budget): { entries: Array<[string, unknown]>; omitted: number } {
  const entries: Array<[string, unknown]> = [];
  let omitted = 0;
  const limit = Math.min(keys.length, budget.limits.items);
  let i = 0;
  for (; i < limit; i += 1) {
    const key = keys[i];
    if (budget.nodes <= 0) break;
    if (key.length > budget.limits.key) { omitted += 1; continue; }
    if (key.length > budget.chars) break;
    budget.chars -= key.length;
    entries.push([key, read(i)]);
  }
  return { entries, omitted: omitted + keys.length - i };
}

/** Items of a list while the budget lasts; `read(i)` bounds item i. */
function itemsOf(count: number, read: (index: number) => unknown, budget: Budget): unknown[] {
  const limit = Math.min(count, budget.limits.items);
  const items: unknown[] = [];
  for (let i = 0; i < limit && budget.nodes > 0; i += 1) items.push(read(i));
  return items;
}

function boundValue(value: unknown, budget: Budget, depth = 0): unknown {
  budget.nodes -= 1;
  switch (typeof value) {
    case 'string': return boundString(value, budget);
    case 'number': return boundNumber(value);
    case 'boolean': return value;
    case 'undefined': return typed('undefined');
    case 'bigint': return boundBigint(String(value), budget);
    case 'symbol': return typed('symbol', { description: clip(String(value).slice(7, -1), 1000, budget) });
    case 'function': return typed('function', { name: readName(() => (value as { name?: unknown }).name) });
    default: break;
  }
  if (value === null) return null;
  const object = value as object;
  if (budget.ancestors.includes(object)) return typed('circular');
  if (depth > budget.limits.depth || budget.nodes < 0) {
    return Array.isArray(object)
      ? typed('depth', { type: 'array', length: isCount(object.length) ? object.length : 0 })
      : typed('depth', { type: 'object' });
  }
  budget.ancestors.push(object);
  try {
    return boundObject(object, budget, depth);
  } finally {
    budget.ancestors.pop();
  }
}

function boundObject(value: object, budget: Budget, depth: number): unknown {
  if (Array.isArray(value)) {
    const items = itemsOf(value.length, (i) => child(value, i, budget, depth), budget);
    return items.length < value.length ? typed('array', { items, length: value.length }) : items;
  }
  const tag = Object.prototype.toString.call(value);
  if (tag === '[object Object]' && hasOwn(value, LOG_TYPE_KEY)) return envelope(value as Bag, budget, depth) ?? escaped(value, budget, depth);
  if (tag === '[object Date]') {
    const time = Date.prototype.getTime.call(value);
    return typed('date', { iso: Number.isNaN(time) ? null : new Date(time).toISOString() });
  }
  if (tag === '[object Map]' || tag === '[object Set]') {
    const isMap = tag === '[object Map]';
    const list = Array.from(value as Iterable<unknown>);
    const out = itemsOf(list.length, (i) => (isMap
      ? [boundValue((list[i] as [unknown, unknown])[0], budget, depth + 1), boundValue((list[i] as [unknown, unknown])[1], budget, depth + 1)]
      : boundValue(list[i], budget, depth + 1)), budget);
    const size = (value as Map<unknown, unknown> | Set<unknown>).size;
    return isMap ? typed('map', { size, entries: out }) : typed('set', { size, values: out });
  }
  if (tag === '[object Error]') {
    const error = value as Bag;
    const text = (key: string, max: number): string => {
      try { return typeof error[key] === 'string' ? clip(error[key] as string, max, budget) : ''; } catch { return ''; }
    };
    const name = readName(() => error.name) || 'Error';
    const message = text('message', budget.limits.string);
    const stack = text('stack', budget.limits.stack);
    return typed('error', {
      name,
      message,
      ...(stack ? { stack } : {}),
      ...(hasOwn(value, 'cause') ? { cause: child(value, 'cause', budget, depth) } : {}),
    });
  }
  if (tag === '[object ArrayBuffer]') return typed('typedarray', { type: 'ArrayBuffer', length: (value as ArrayBuffer).byteLength });
  if (ArrayBuffer.isView(value)) {
    const type = tag.slice(8, -1);
    if (type === 'DataView') return typed('typedarray', { type, length: (value as DataView).byteLength });
    const list = value as unknown as ArrayLike<unknown>;
    const values = itemsOf(list.length, (i) => boundValue(list[i], budget, depth + 1), budget);
    return typed('typedarray', { type: TYPE_NAME.test(type) ? type : 'TypedArray', length: list.length, values });
  }
  const keys = Object.keys(value);
  const proto: unknown = Object.getPrototypeOf(value);
  let cls = '';
  if (proto && proto !== Object.prototype) {
    const name = readName(() => {
      const ctor = (proto as { constructor?: unknown }).constructor;
      return typeof ctor === 'function' ? ctor.name : '';
    });
    if (name !== 'Object') cls = name;
  }
  const { entries, omitted } = keyed(keys, (i) => child(value, keys[i], budget, depth), budget);
  if (!cls && !omitted) {
    const out: Bag = {};
    for (const [key, item] of entries) define(out, key, item);
    return out;
  }
  return typed('object', { ...(cls ? { class: cls } : {}), entries, ...(omitted ? { omitted } : {}) });
}

/** An object that has the reserved key but is not a valid envelope: plain data, listed. */
function escaped(value: object, budget: Budget, depth: number): Bag {
  const keys = Object.keys(value);
  const { entries, omitted } = keyed(keys, (i) => child(value, keys[i], budget, depth), budget);
  return typed('object', { entries, ...(omitted ? { omitted } : {}) });
}

/** A rebuilt envelope, or null when `value` is not a valid one. */
function envelope(value: Bag, budget: Budget, depth: number): Bag | null {
  const own = (key: string): unknown => (hasOwn(value, key) ? value[key] : undefined);
  const optionalCount = (key: string): boolean => own(key) === undefined || isCount(own(key));
  const optionalName = (key: string): boolean => {
    const name = own(key);
    return name === undefined || (typeof name === 'string' && name.length <= MAX_NAME);
  };
  const listed = (pairs: Array<[string, unknown]>): { entries: Array<[string, unknown]>; omitted: number } =>
    keyed(pairs.map((pair) => pair[0]), (i) => boundValue(pairs[i][1], budget, depth + 1), budget);
  const kind = own(LOG_TYPE_KEY);
  switch (kind) {
    case 'undefined':
    case 'circular':
    case 'unreadable':
      return typed(kind);
    case 'number': {
      const word = own('value');
      return typeof word === 'string' && NUMBER_WORDS.has(word) ? typed('number', { value: word }) : null;
    }
    case 'bigint': {
      const digits = own('value');
      return typeof digits === 'string' && DIGITS.test(digits) ? boundBigint(digits, budget) : null;
    }
    case 'function': {
      const name = own('name');
      return typeof name === 'string' ? typed('function', { name: name.slice(0, MAX_NAME) }) : null;
    }
    case 'symbol': {
      const description = own('description');
      return typeof description === 'string' ? typed('symbol', { description: clip(description, 1000, budget) }) : null;
    }
    case 'date': {
      const iso = own('iso');
      if (iso === null) return typed('date', { iso: null });
      return typeof iso === 'string' && iso.length <= 40 && !Number.isNaN(Date.parse(iso)) ? typed('date', { iso }) : null;
    }
    case 'dom': {
      const text = own('text');
      return typeof text === 'string' ? typed('dom', { text: text.slice(0, 500) }) : null;
    }
    case 'depth': {
      const type = own('type');
      if (type !== undefined && type !== 'array' && type !== 'object') return null;
      if (!optionalCount('length') || !optionalName('class')) return null;
      return typed('depth', {
        ...(type !== undefined ? { type } : {}),
        ...(own('class') !== undefined ? { class: own('class') } : {}),
        ...(own('length') !== undefined ? { length: own('length') } : {}),
      });
    }
    case 'string': {
      const text = own('value');
      const length = own('length');
      if (typeof text !== 'string' || !isCount(length) || length < text.length) return null;
      return typed('string', { value: clip(text, budget.limits.string, budget), length });
    }
    case 'array': {
      const items = own('items');
      const length = own('length');
      if (!Array.isArray(items) || !isCount(length) || length < items.length) return null;
      return typed('array', { items: itemsOf(items.length, (i) => boundValue(items[i], budget, depth + 1), budget), length });
    }
    case 'object': {
      const pairs = own('entries');
      if (!isEntryList(pairs) || !optionalName('class') || !optionalCount('omitted')) return null;
      const { entries, omitted } = listed(pairs);
      const total = ((own('omitted') as number | undefined) || 0) + omitted;
      return typed('object', {
        ...(own('class') !== undefined ? { class: own('class') } : {}),
        entries,
        ...(total ? { omitted: total } : {}),
      });
    }
    case 'map':
    case 'set': {
      const size = own('size');
      const list = own(kind === 'map' ? 'entries' : 'values');
      if (!isCount(size) || !Array.isArray(list) || list.length > size) return null;
      if (kind === 'map' && !list.every((pair) => Array.isArray(pair) && pair.length === 2)) return null;
      const rebuilt = itemsOf(list.length, (i) => (kind === 'map'
        ? [boundValue((list[i] as unknown[])[0], budget, depth + 1), boundValue((list[i] as unknown[])[1], budget, depth + 1)]
        : boundValue(list[i], budget, depth + 1)), budget);
      return kind === 'map' ? typed('map', { size, entries: rebuilt }) : typed('set', { size, values: rebuilt });
    }
    case 'error': {
      const name = own('name');
      const message = own('message');
      const stack = own('stack');
      const pairs = own('entries');
      if (typeof name !== 'string' || typeof message !== 'string') return null;
      if (stack !== undefined && typeof stack !== 'string') return null;
      if ((pairs !== undefined && !isEntryList(pairs)) || !optionalCount('omitted')) return null;
      const kept: Bag = { name: name.slice(0, MAX_NAME), message: clip(message, budget.limits.string, budget) };
      if (stack !== undefined) kept.stack = clip(stack, budget.limits.stack, budget);
      const { entries, omitted } = pairs ? listed(pairs) : { entries: [], omitted: 0 };
      const total = ((own('omitted') as number | undefined) || 0) + omitted;
      return typed('error', {
        ...kept,
        ...(entries.length ? { entries } : {}),
        ...(total ? { omitted: total } : {}),
        ...(hasOwn(value, 'cause') ? { cause: boundValue(value.cause, budget, depth + 1) } : {}),
      });
    }
    case 'typedarray': {
      const type = own('type');
      const length = own('length');
      const values = own('values');
      if (typeof type !== 'string' || !TYPE_NAME.test(type) || !isCount(length)) return null;
      if (values !== undefined && (!Array.isArray(values) || values.length > length)) return null;
      if (values === undefined) return typed('typedarray', { type, length });
      return typed('typedarray', { type, length, values: itemsOf(values.length, (i) => boundValue(values[i], budget, depth + 1), budget) });
    }
    default:
      return null;
  }
}

/** A top-level value: one that cannot be read (a hostile proxy) is `unreadable`, never a throw. */
function boundTop(value: unknown, budget: Budget): unknown {
  try {
    return boundValue(value, budget);
  } catch {
    return typed('unreadable');
  }
}

/** One value in the typed model under `limits`, with a budget of its own. Never throws. */
export function boundLogValue(value: unknown, limits: LogLimits): unknown {
  return boundTop(value, budgetFor(limits));
}

/**
 * A console call's arguments under `limits`, one budget for the call, as content.js carries them:
 * one argument is the value (an array logged alone stays one argument), several are the list (at
 * most 500). `logArgCount` is how many arguments were kept. Never throws.
 */
export function boundLogArgs(logData: unknown, logArgCount: unknown, limits: LogLimits): { logData: unknown; logArgCount: number } {
  const budget = budgetFor(limits);
  if (logArgCount !== 1 && Array.isArray(logData)) {
    const args = logData.slice(0, MAX_ARGS);
    return { logData: args.map((arg) => boundTop(arg, budget)), logArgCount: args.length };
  }
  return { logData: boundTop(logData, budget), logArgCount: 1 };
}
