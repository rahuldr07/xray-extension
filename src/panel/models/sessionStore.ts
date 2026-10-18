import type { BinaryBodyDescriptor, BodyTruncation, XrayEntry } from '../types';
import { legacySuffix } from './capturedBody';
import { LosslessNumber, parseJson, toValue } from './jsonText';
import { LOG_ENTRY_LIMITS, LOG_PERSIST_LIMITS, boundLogArgs } from './logBound';
import { isTypedLog, logArgs } from './logValue';

export const SESSION_ENTRIES_KEY = 'session_entries';
export const SESSION_ENVELOPE_KEY = 'session_envelope';
export const AI_SETTINGS_KEY = 'ai_settings';

/*
 * The saved session (spec J9, docs/superpowers/specs/2026-10-14-json-fidelity-design.md §6).
 *
 * Bodies are saved as the captured text — the views re-parse it after a reload, so Tree, Table and
 * Schema work as they did — and a cut is metadata (`responseTruncated`, `requestTruncated`,
 * `responseDecryptedTruncated`: `keptChars` is the saved text's length, the capture-time total is
 * kept), never an in-band "…". Logs are saved in the typed log model (models/logValue.ts), bounded
 * with its own envelopes (models/logBound.ts). Every value is JSON-safe: what chrome.storage keeps is
 * the value's JSON, so a typed array, BigInt, NaN or ±Infinity would be rejected or silently changed.
 * chrome.storage also gives every object back with its keys sorted, so a log's typed value is saved
 * as its JSON text (`logDataJson`, the stored form) and read back with the lossless parser, keys in
 * the order logged; deserializeSessionEntries turns the stored form back into the panel's.
 *
 * The manifest has no unlimitedStorage, so one budget bounds the session, counting every saved field
 * as storage counts it (its JSON, in UTF-8): newest entries first, an entry's other fields (headers,
 * URL, timing, a log's message…) are paid for and never cut, then its bodies, log and frames — the
 * smaller first — each up to the response capture cap; once the budget is spent older bodies are cut,
 * and every entry still keeps up to 2 KB of them. What a session saved before J9 kept is never cut:
 * migration flags its entries `legacySession`, and every save keeps them whole (they already fit
 * storage) and counts them first, so new entries share what they leave of the budget — none left,
 * and new bodies fall to the floor — until they leave the session (maxEntries, the 500-entry window,
 * Clear). A save that then overflows the quota fails and the panel says so (store.ts).
 */

export const MAX_PERSISTED_ENTRIES = 500;
/** A saved body text keeps at most this many characters (the response capture cap). */
export const MAX_PERSISTED_TEXT_CHARS = 250_000;
/**
 * Bytes one saved session holds, every field counted, newest entries first: chrome.storage.local
 * holds 10,485,760 bytes for everything XRAY stores (rules, investigations, preferences), counted as
 * JSON in UTF-8 (fix round 1 ruling).
 */
export const SESSION_BUDGET_BYTES = 6_000_000;
/** Bytes of bodies every entry keeps past the budget, so a small body is never lost to a big one. */
export const ENTRY_FLOOR_BYTES = 2_048;
/** A log message is display text, cut with an ellipsis as it always was. */
const MAX_PERSISTED_MESSAGE_CHARS = 20_000;
const MAX_PERSISTED_ARGS = 20;
const MAX_PERSISTED_FRAMES = 50;
/** Deeper values are left out rather than walked (a body's text is kept; this is its parsed copy). */
const MAX_SAFE_DEPTH = 200;
const BINARY_PREFIX_BYTES = 64;
/** The cut the session store made before J9: the first 20,000 characters and "…". */
const LEGACY_CUT_CHARS = 20_000;

type Bag = Record<string, unknown>;

/** The stored form of a log's typed value: its JSON text (chrome.storage would sort its keys). */
export const LOG_DATA_JSON = 'logDataJson';

export interface SerializeOptions {
  /** The session budget in bytes (SESSION_BUDGET_BYTES). */
  budgetBytes?: number;
  /** Bytes of bodies every entry keeps past the budget (ENTRY_FLOOR_BYTES). */
  floorBytes?: number;
}

/** What an entry's bodies, log and frames may still spend, and what they spent. */
interface Allowance {
  bytes: number;
  spent: number;
}

function charge(allowance: Allowance, bytes: number): void {
  allowance.bytes -= bytes;
  allowance.spent += bytes;
}

interface Slot {
  /** Cheap size estimate: an entry spends its allowance on its smaller bodies first. */
  estimate: number;
  apply(allowance: Allowance): void;
}

// ------------------------------------------------------------------ measuring

/**
 * The longest prefix of `text` (at most `maxChars`, never splitting a surrogate pair) whose stored
 * form fits `budget` bytes: JSON escapes (`"`, `\` and \b \t \n \f \r two bytes, other controls and
 * lone surrogates six) and UTF-8 (two to four bytes past ASCII).
 */
function fitText(text: string, maxChars: number, budget: number): { kept: number; bytes: number } {
  const end = Math.min(maxChars, text.length);
  let bytes = 0;
  let i = 0;
  while (i < end) {
    const code = text.charCodeAt(i);
    let size: number;
    let width = 1;
    if (code < 0x80) {
      if (code >= 0x20) size = code === 0x22 || code === 0x5c ? 2 : 1;
      else size = code === 0x08 || code === 0x09 || code === 0x0a || code === 0x0c || code === 0x0d ? 2 : 6;
    } else if (code < 0x800) {
      size = 2;
    } else if (code >= 0xd800 && code <= 0xdbff) {
      const next = i + 1 < text.length ? text.charCodeAt(i + 1) : 0;
      if (next >= 0xdc00 && next <= 0xdfff) {
        size = 4;
        width = 2;
      } else {
        size = 6;
      }
    } else {
      size = code >= 0xdc00 && code <= 0xdfff ? 6 : 3;
    }
    if (i + width > end || bytes + size > budget) break;
    bytes += size;
    i += width;
  }
  return { kept: i, bytes };
}

/** The bytes a text takes in storage as a string value (its JSON escapes, in UTF-8). */
export function storedTextBytes(text: string): number {
  return fitText(text, text.length, Infinity).bytes;
}

/** The bytes a value takes in storage, from its JSON text: that text in UTF-8 (nothing more to escape). */
function jsonBytes(json: string): number {
  let bytes = 0;
  for (let i = 0; i < json.length; i += 1) {
    const code = json.charCodeAt(i);
    if (code < 0x80) bytes += 1;
    else if (code < 0x800) bytes += 2;
    else if (code >= 0xd800 && code <= 0xdbff && i + 1 < json.length) {
      bytes += 4;
      i += 1;
    } else bytes += 3;
  }
  return bytes;
}

// -------------------------------------------------------------- JSON safety

function define(target: Bag, key: string, value: unknown): void {
  // defineProperty, so an own "__proto__" key stays data instead of a prototype.
  Object.defineProperty(target, key, { value, enumerable: true, configurable: true, writable: true });
}

function base64Prefix(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < Math.min(bytes.length, BINARY_PREFIX_BYTES); i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

/** Bytes as capture describes a body it did not decode (spec J4): size and the first 64 bytes. */
function binaryDescriptor(value: ArrayBuffer | ArrayBufferView): BinaryBodyDescriptor {
  const bytes = ArrayBuffer.isView(value) ? new Uint8Array(value.buffer, value.byteOffset, value.byteLength) : new Uint8Array(value);
  return { binary: true, size: bytes.byteLength, base64Prefix: base64Prefix(bytes) };
}

class TooDeep extends Error {}

/**
 * A JSON-safe copy (undefined: leave it out). JSON's own conversions — a non-finite number is null,
 * -0 is 0, a Date its ISO text, undefined, functions and Symbols are left out (null in an array) —
 * except where JSON would throw or lose bytes: a BigInt keeps its digits as a string, a typed array,
 * ArrayBuffer or DataView becomes the binary descriptor capture uses, a reference back to an ancestor
 * is left out. Throws TooDeep past MAX_SAFE_DEPTH.
 */
function jsonSafe(value: unknown, ancestors: object[] = []): unknown {
  switch (typeof value) {
    case 'string':
    case 'boolean':
      return value;
    case 'number':
      return Number.isFinite(value) ? (Object.is(value, -0) ? 0 : value) : null;
    case 'bigint':
      return String(value);
    case 'object':
      break;
    default:
      return undefined;
  }
  if (value === null) return null;
  const object = value as object;
  if (ancestors.includes(object)) return undefined;
  if (ancestors.length >= MAX_SAFE_DEPTH) throw new TooDeep();
  if (object instanceof ArrayBuffer || ArrayBuffer.isView(object)) return binaryDescriptor(object as ArrayBuffer | ArrayBufferView);
  if (object instanceof LosslessNumber) {
    const number = Number(object.raw);
    return Number.isSafeInteger(number) ? number : object.raw;
  }
  if (object instanceof Date) {
    const time = object.getTime();
    return Number.isFinite(time) ? object.toISOString() : null;
  }
  ancestors.push(object);
  try {
    if (Array.isArray(object)) {
      return object.map((item) => {
        const safe = jsonSafe(item, ancestors);
        return safe === undefined ? null : safe;
      });
    }
    const out: Bag = {};
    for (const key of Object.keys(object)) {
      let item: unknown;
      try {
        item = (object as Bag)[key];
      } catch {
        continue;
      }
      const safe = jsonSafe(item, ancestors);
      if (safe !== undefined) define(out, key, safe);
    }
    return out;
  } finally {
    ancestors.pop();
  }
}

/** jsonSafe, with a value too deep to walk left out. */
function safeValue(value: unknown): unknown {
  try {
    return jsonSafe(value);
  } catch {
    return undefined;
  }
}

// --------------------------------------------------------------- truncation

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

/** Truncation metadata that holds together (keptChars, and a total when one is known), or null. */
function validTruncation(value: unknown): BodyTruncation | null {
  if (!value || typeof value !== 'object') return null;
  const { keptChars, totalChars, totalBytes } = value as Bag;
  if (!isCount(keptChars)) return null;
  const out: BodyTruncation = { keptChars };
  if (isCount(totalChars)) out.totalChars = totalChars;
  if (isCount(totalBytes)) out.totalBytes = totalBytes;
  return out;
}

/**
 * The metadata of a text saved as its first `kept` of `length` characters: the capture-time total
 * when there is one (or none, when it was never known), else the text's own length; undefined for a
 * whole text the capture did not cut.
 */
function savedTruncation(captured: unknown, length: number, kept: number): BodyTruncation | undefined {
  const meta = validTruncation(captured);
  if (!meta && kept === length) return undefined;
  const out: BodyTruncation = { keptChars: kept };
  if (meta) {
    if (meta.totalChars !== undefined) out.totalChars = meta.totalChars;
    if (meta.totalBytes !== undefined) out.totalBytes = meta.totalBytes;
  } else {
    out.totalChars = length;
  }
  return out;
}

// -------------------------------------------------------------------- slots

function textSlot(copy: Bag, key: string, cutKey: string, text: string, captured: unknown, onCut?: () => void): Slot {
  return {
    estimate: text.length,
    apply(allowance) {
      const { kept, bytes } = fitText(text, MAX_PERSISTED_TEXT_CHARS, allowance.bytes);
      charge(allowance, bytes);
      define(copy, key, kept === text.length ? text : text.slice(0, kept));
      const cut = savedTruncation(captured, text.length, kept);
      if (cut) define(copy, cutKey, cut);
      if (kept < text.length) onCut?.();
    },
  };
}

/**
 * A body that exists only as a value (a decrypted object, a request body stored before J4): kept as
 * a JSON-safe value when it fits, else saved as its JSON text, cut, with the cut as metadata — the
 * body model then reads it as a truncated text (banner), never as a "string" value.
 */
function valueSlot(copy: Bag, key: string, cutKey: string, value: unknown): Slot {
  const safe = safeValue(value);
  const json = safe === undefined ? '' : JSON.stringify(safe);
  return {
    estimate: json.length,
    apply(allowance) {
      if (safe === undefined) return;
      const bytes = jsonBytes(json);
      if (json.length <= MAX_PERSISTED_TEXT_CHARS && bytes <= allowance.bytes) {
        charge(allowance, bytes);
        define(copy, key, safe);
        return;
      }
      textSlot(copy, key, cutKey, json, null).apply(allowance);
    },
  };
}

/** The JSON-safe frames, newest kept first while they fit (the newest 50 at most, as always). */
function framesSlot(copy: Bag, frames: unknown[]): Slot {
  const safe = frames.slice(-MAX_PERSISTED_FRAMES).map((frame) => safeValue(frame) ?? null);
  const costs = safe.map((frame) => jsonBytes(JSON.stringify(frame)) + 1);
  return {
    estimate: costs.reduce((sum, cost) => sum + cost, 0),
    apply(allowance) {
      let first = safe.length;
      let bytes = 0;
      while (first > 0 && bytes + costs[first - 1] <= allowance.bytes) {
        first -= 1;
        bytes += costs[first];
      }
      charge(allowance, bytes);
      define(copy, 'wsFrames', safe.slice(first));
    },
  };
}

/** The smallest log a saved session keeps: one depth envelope ("…"). */
const LOG_SKELETON_MINIMUM = { logData: { $xray: 'depth' }, logArgCount: 1 };

/**
 * The console arguments in the typed model under LOG_PERSIST_LIMITS (content.js's own limits for a
 * legacy entry, which keeps what it held) and what is left of the allowance; a log saved before the
 * model (no logArgCount) is decoded into it, so it reads the same. A log the allowance cannot hold
 * keeps its skeleton (every argument's scalars and lengths), or else one depth envelope: never more
 * than its allowance (every entry has at least the 2 KB floor; one depth envelope is 21 bytes),
 * charged as written.
 */
function logSlot(copy: Bag, entry: XrayEntry, keepStored: boolean): Slot {
  return {
    estimate: 0,
    apply(allowance) {
      let source: { logData: unknown; logArgCount: unknown };
      if (isTypedLog(entry)) {
        source = { logData: entry.logData, logArgCount: entry.logArgCount };
      } else {
        try {
          const args = logArgs(entry);
          source = { logData: args.length === 1 ? args[0] : args, logArgCount: args.length };
        } catch {
          // Only a hand-built value refuses the legacy decoder; the bound reads it (unreadable parts marked).
          const list = entry.logData === undefined && Array.isArray(entry.args) ? entry.args : null;
          source = list ? { logData: list, logArgCount: list.length } : { logData: entry.logData, logArgCount: 1 };
        }
      }
      const limits = keepStored ? LOG_ENTRY_LIMITS : { ...LOG_PERSIST_LIMITS, chars: Math.min(LOG_PERSIST_LIMITS.chars, allowance.bytes) };
      let bounded = boundLogArgs(source.logData, source.logArgCount, limits);
      let json = JSON.stringify(bounded.logData);
      let cost = storedTextBytes(json);
      if (cost > allowance.bytes) {
        bounded = boundLogArgs(source.logData, source.logArgCount, { ...LOG_PERSIST_LIMITS, nodes: 0, chars: 0 });
        json = JSON.stringify(bounded.logData);
        cost = storedTextBytes(json);
      }
      if (cost > allowance.bytes) {
        bounded = LOG_SKELETON_MINIMUM;
        json = JSON.stringify(bounded.logData);
        cost = storedTextBytes(json);
      }
      charge(allowance, cost);
      define(copy, LOG_DATA_JSON, json);
      define(copy, 'logArgCount', bounded.logArgCount);
    },
  };
}

// The fields the slots, the message and the frames own; everything else is copied JSON-safe.
const OWNED = new Set([
  'responseRaw', 'responseTruncated', 'responseDecrypted', 'responseDecryptedTruncated',
  'requestBodyText', 'requestTruncated', 'requestBody', 'logData', 'logArgCount', 'args', 'message', 'wsFrames',
  LOG_DATA_JSON,
]);

/**
 * One entry in the stored form and the bytes it takes: its other fields (never cut) first, then its
 * bodies, log and frames within `max(remaining - those, floor)` — or whole, for a legacy entry.
 */
function persistEntry(entry: XrayEntry, remaining: number, floor: number): { entry: XrayEntry; spent: number } {
  const keepStored = entry.legacySession === true;
  const copy: Bag = {};
  for (const key of Object.keys(entry)) {
    if (OWNED.has(key)) continue;
    const safe = safeValue(entry[key]);
    if (safe !== undefined) define(copy, key, safe);
  }
  if (typeof entry.message === 'string') {
    define(copy, 'message', entry.message.length > MAX_PERSISTED_MESSAGE_CHARS ? entry.message.slice(0, MAX_PERSISTED_MESSAGE_CHARS) + '…' : entry.message);
  } else {
    const safe = safeValue(entry.message);
    if (safe !== undefined) define(copy, 'message', safe);
  }
  if (entry.type !== 'log') {
    for (const key of ['logData', 'logArgCount']) {
      const safe = safeValue(entry[key]);
      if (safe !== undefined) define(copy, key, safe);
    }
    if (Array.isArray(entry.args)) define(copy, 'args', safeValue(entry.args.slice(0, MAX_PERSISTED_ARGS)));
  }
  if (entry.wsFrames !== undefined && !Array.isArray(entry.wsFrames)) {
    const safe = safeValue(entry.wsFrames);
    if (safe !== undefined) define(copy, 'wsFrames', safe);
  }
  // Every field so far is paid for and kept: the fixed part of the entry.
  const fixed = jsonBytes(JSON.stringify(copy));
  const allowance: Allowance = { bytes: keepStored ? Infinity : Math.max(remaining - fixed, floor), spent: 0 };

  const slots: Slot[] = [];
  const nullOrSlot = (key: string, cutKey: string, value: unknown): void => {
    if (value === null) define(copy, key, null);
    else if (typeof value === 'string') slots.push(textSlot(copy, key, cutKey, value, entry[cutKey]));
    else if (value !== undefined) slots.push(valueSlot(copy, key, cutKey, value));
  };
  nullOrSlot('responseRaw', 'responseTruncated', entry.responseRaw);
  nullOrSlot('responseDecrypted', 'responseDecryptedTruncated', entry.responseDecrypted);

  // The request text is the body. Beside it only FormData fields are saved (replay rebuilds the form
  // from them; a binary descriptor has no text and takes the branch below) — never the parsed copy of
  // a text, which every reader derives from the text (entryRequest), so it would only spend the budget
  // twice. The fields go beside a text kept whole, and only when they fit after every body of the entry.
  let derived: Slot | null = null;
  if (typeof entry.requestBodyText === 'string') {
    let textCut = false;
    slots.push(textSlot(copy, 'requestBodyText', 'requestTruncated', entry.requestBodyText, entry.requestTruncated, () => { textCut = true; }));
    if (entry.requestBodyKind === 'formdata' && entry.requestBody !== undefined && entry.requestBody !== null) {
      const safe = safeValue(entry.requestBody);
      const json = safe === undefined ? '' : JSON.stringify(safe);
      derived = {
        estimate: json.length,
        apply(allowance) {
          if (textCut || safe === undefined) return;
          const bytes = jsonBytes(json);
          if (bytes > allowance.bytes) return;
          charge(allowance, bytes);
          define(copy, 'requestBody', safe);
        },
      };
    }
  } else {
    nullOrSlot('requestBody', 'requestTruncated', entry.requestBody);
  }
  if (entry.type === 'log') slots.push(logSlot(copy, entry, keepStored));
  if (Array.isArray(entry.wsFrames)) slots.push(framesSlot(copy, entry.wsFrames));

  slots.sort((a, b) => a.estimate - b.estimate);
  for (const slot of slots) slot.apply(allowance);
  derived?.apply(allowance);
  return { entry: copy as XrayEntry, spent: fixed + allowance.spent };
}

function budgetOption(value: unknown, fallback: number): number {
  return typeof value === 'number' && value >= 0 ? value : fallback;
}

/**
 * A bounded, storage-safe snapshot of the newest 500 entries, in the stored form (see the module
 * comment). It takes entries in either form; saving a restored session changes nothing: the snapshot
 * of a snapshot is the snapshot.
 */
export function serializeSessionEntries(entries: XrayEntry[], options: SerializeOptions = {}): XrayEntry[] {
  const budget = budgetOption(options.budgetBytes, SESSION_BUDGET_BYTES);
  const floor = budgetOption(options.floorBytes, ENTRY_FLOOR_BYTES);
  const kept = entries.slice(-MAX_PERSISTED_ENTRIES).map(fromStoredForm);
  const out: Array<XrayEntry | undefined> = new Array(kept.length);
  // Legacy entries first: kept whole, and what they take comes off the budget before anything else.
  let legacy = 0;
  kept.forEach((item, i) => {
    if (item.legacySession !== true) return;
    const { entry, spent } = persistEntry(item, Infinity, floor);
    out[i] = entry;
    legacy += spent;
  });
  let remaining = Math.max(0, budget - legacy);
  for (let i = kept.length - 1; i >= 0; i -= 1) {
    if (out[i]) continue;
    const { entry, spent } = persistEntry(kept[i], remaining, floor);
    out[i] = entry;
    remaining = Math.max(0, remaining - spent);
  }
  return out as XrayEntry[];
}

/** Saved entries as the panel holds them: a log's stored JSON text parsed back (keys in order). */
export function deserializeSessionEntries(value: unknown): XrayEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is XrayEntry => !!entry && typeof entry === 'object' && typeof (entry as XrayEntry).id === 'string')
    .slice(-MAX_PERSISTED_ENTRIES)
    .map(fromStoredForm);
}

/** An entry in the panel's form: a stored log value (LOG_DATA_JSON) back as `logData`; others as they are. */
function fromStoredForm(entry: XrayEntry): XrayEntry {
  const text = entry[LOG_DATA_JSON];
  if (typeof text !== 'string') return entry;
  const copy: Bag = {};
  for (const key of Object.keys(entry)) if (key !== LOG_DATA_JSON) define(copy, key, entry[key]);
  const value = storedLogData(text);
  if (value !== undefined) define(copy, 'logData', value);
  return copy as XrayEntry;
}

/**
 * A log's typed value from its stored JSON text, with the lossless parser (keys in the order logged;
 * an own "__proto__" stays a key). The model holds no integer JSON can't, so a lexeme the parser keeps
 * as a LosslessNumber (a double past 2^53, written without an exponent) is that number again.
 * undefined when the text does not parse.
 */
function storedLogData(text: string): unknown {
  const doc = parseJson(text);
  if (!doc.ok) return undefined;
  try {
    return plainNumbers(toValue(doc.root));
  } catch {
    return undefined;
  }
}

function plainNumbers(value: unknown): unknown {
  if (value instanceof LosslessNumber) return Number(value.raw);
  if (!value || typeof value !== 'object') return value;
  const record = value as Bag;
  for (const key of Object.keys(record)) {
    const item = record[key];
    const plain = plainNumbers(item);
    if (plain !== item) define(record, key, plain);
  }
  return value;
}

// ------------------------------------------------------------------- legacy

function isLegacyCut(value: unknown): boolean {
  return typeof value === 'string' && value.length === LEGACY_CUT_CHARS + 1 && value.endsWith('…');
}

/** The bytes a legacy response's `size` says the whole text had, when it says more than was kept. */
function legacyBytes(size: unknown): number | undefined {
  return isCount(size) && size > LEGACY_CUT_CHARS ? size : undefined;
}

function upgradeText(entry: Bag, key: string, cutKey: string, bytesTotal?: number): void {
  const text = entry[key];
  if (typeof text !== 'string') return;
  const meta = validTruncation(entry[cutKey]);
  if (isLegacyCut(text)) {
    // The old cut: 20,000 characters and "…". The capture's total, else the response's byte size,
    // else no total at all ("showing the first 20,000 characters").
    const cut: BodyTruncation = { keptChars: LEGACY_CUT_CHARS };
    if (meta?.totalChars !== undefined || meta?.totalBytes !== undefined) {
      if (meta.totalChars !== undefined) cut.totalChars = meta.totalChars;
      if (meta.totalBytes !== undefined) cut.totalBytes = meta.totalBytes;
    } else if (bytesTotal !== undefined) {
      cut.totalBytes = bytesTotal;
    }
    entry[key] = text.slice(0, LEGACY_CUT_CHARS);
    entry[cutKey] = cut;
    return;
  }
  if (meta) return;
  const suffix = legacySuffix(text);
  if (suffix) {
    entry[key] = text.slice(0, suffix.kept);
    entry[cutKey] = { keptChars: suffix.kept, totalChars: suffix.kept + suffix.omitted };
  }
}

/**
 * An entry of a session saved before J9 (schema version 1, or the older bare array), read once on
 * restore: the in-band "\n... truncated N chars" suffix capture wrote before J6 and the "…" the
 * session store appended become truncation metadata, and a cut parsed copy of a request text is
 * dropped. Logs are moved into the typed model when the session is next saved (logArgs). The entry
 * is flagged `legacySession`, so no save cuts what the old session kept. A session saved by this
 * version is never read this way (sessionEnvelope.ts keys it to the schema version), so a body that
 * really ends in "… truncated 12 chars" or "…" stays as it is.
 */
export function upgradeLegacyEntry(value: unknown): unknown {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
  const entry: Bag = { ...(value as Bag), legacySession: true };
  upgradeText(entry, 'responseRaw', 'responseTruncated', legacyBytes(entry.size));
  upgradeText(entry, 'responseDecrypted', 'responseDecryptedTruncated');
  if (typeof entry.requestBodyText === 'string') {
    upgradeText(entry, 'requestBodyText', 'requestTruncated');
    if (isLegacyCut(entry.requestBody)) delete entry.requestBody;
  } else {
    upgradeText(entry, 'requestBody', 'requestTruncated');
  }
  return entry;
}
