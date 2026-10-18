/**
 * Lossless JSON — the one parser for captured text in the panel
 * (docs/superpowers/specs/2026-10-14-json-fidelity-design.md §1, J1).
 *
 * JSON.parse rounds 9007199254740993, reorders integer-like keys, collapses duplicate keys, forgets
 * how a number or a string was written and reports errors as an offset. This module keeps what went
 * over the wire: a JsonNode tree in source order with every number lexeme, duplicate keys marked,
 * string escapes as written where they differ from the canonical form, the first syntax error with
 * its line and column, a stripped XSSI guard or BOM, and NDJSON as an array of documents.
 *
 * Hand-written and iterative — an explicit stack, no recursion in parse, print, toValue or isExact —
 * so any nesting depth works (ruling in .superpowers/sdd/2026-10-14-json-fidelity-implementation/
 * progress.md). Pure: no DOM, no store.
 */

// ---------------------------------------------------------------------- types

export interface JsonObjectNode {
  t: 'obj';
  /** Every member in source order, duplicates included. */
  entries: JsonEntry[];
}

export interface JsonEntry {
  /** The decoded key. */
  key: string;
  value: JsonNode;
  /** True on the second and later occurrences of the same key in one object. */
  dup?: boolean;
  /** The key exactly as written (with quotes), present only when it differs from JSON.stringify(key). */
  keyRaw?: string;
}

export interface JsonArrayNode {
  t: 'arr';
  items: JsonNode[];
}

export interface JsonStringNode {
  t: 'str';
  /** The decoded value, exactly as JSON.parse decodes it (lone surrogates kept as they are). */
  value: string;
  /**
   * The string exactly as written (with quotes), present only when it differs from
   * JSON.stringify(value) — non-canonical escapes such as `é`, `\/`, `\u001F` or an unescaped
   * lone surrogate. printJson writes `raw` when present, else JSON.stringify(value). Nodes built or
   * edited by hand must leave `raw` out.
   */
  raw?: string;
}

export interface JsonNumberNode {
  t: 'num';
  /** The number exactly as written: `1.0`, `1E5`, `-0` and `9007199254740993` print back unchanged. */
  raw: string;
  /** Number(raw). */
  value: number;
  /**
   * Whether JavaScript holds the number that was written — the hint exists for integers (IDs,
   * counters) a JS number cannot carry (ruling in .superpowers/sdd/2026-10-14-json-fidelity-
   * implementation/progress.md). False when:
   * - an integer-valued lexeme written without an exponent (digits, optionally a fraction of zeros)
   *   is not exactly the integer Number(raw) holds, compared as BigInt: `9007199254740993`,
   *   `12345678901234567890`, `9007199254740993.0`. `9007199254740992`, `10000000000000000` and
   *   `18446744073709551616` (2^64) are exact — JavaScript holds those integers exactly;
   * - the value overflows to ±Infinity (`1e400`, a 400-digit integer);
   * - a non-zero lexeme underflows to 0 (`1e-400`, `2e-324`);
   * - a zero lexeme has a minus sign (`-0`, `-0.0`, `-0e5`): the sign does not survive display or
   *   JSON.stringify.
   * A lexeme with an exponent or a non-zero fraction is floating point and otherwise exact, even when
   * the nearest double differs in a late digit (`1e23`, `6.02e23`, `0.10000000000000001`, `4e-324`).
   */
  exact: boolean;
}

export interface JsonBoolNode {
  t: 'bool';
  value: boolean;
}

export interface JsonNullNode {
  t: 'null';
}

export type JsonContainerNode = JsonObjectNode | JsonArrayNode;
export type JsonScalarNode = JsonStringNode | JsonNumberNode | JsonBoolNode | JsonNullNode;
export type JsonNode = JsonContainerNode | JsonScalarNode;

export interface JsonParseError {
  /** Offset into the text given to parseJson (UTF-16 code units; a BOM or XSSI guard counts). */
  pos: number;
  /** 1-based; lines end at `\n` (a `\r` before it belongs to the line). */
  line: number;
  /** 1-based, in UTF-16 code units from the start of the line. */
  col: number;
  /** Short, position-free: "Unexpected token }", "Trailing comma", "Unterminated string" … */
  message: string;
}

export type JsonKind = 'json' | 'ndjson';

interface JsonDocInfo {
  /** 'ndjson': the root is a synthetic array with one item per document line. */
  kind: JsonKind;
  /** The XSSI guard stripped from the start, exactly as matched (`)]}'`, `)]}',`, `while(1);`, `for(;;);`). */
  prefix?: string;
  /** A leading U+FEFF was stripped. */
  bom?: boolean;
  /** Members that repeat an earlier key of the same object (each has `dup: true`). */
  duplicates: number;
  /** Number nodes with `exact: false`. */
  inexactNumbers: number;
}

export interface JsonDocOk extends JsonDocInfo {
  ok: true;
  root: JsonNode;
  error?: undefined;
}

export interface JsonDocFailed extends JsonDocInfo {
  ok: false;
  /** null for a JSON document; for NDJSON, the lines that did parse. */
  root: JsonNode | null;
  /** The first syntax error. */
  error: JsonParseError;
}

export type JsonDoc = JsonDocOk | JsonDocFailed;

export interface ParseJsonOptions {
  /**
   * The body's Content-Type. application/x-ndjson and application/jsonl read one document per line;
   * application/json-seq reads RS-delimited records (RFC 7464).
   */
  contentType?: string | null;
}

export interface PrintJsonOptions {
  /** Spaces per level, clamped to 0–10 like JSON.stringify; 0 (the default) prints compact. */
  indent?: number;
  /**
   * Strings and keys as JSON.stringify writes their values (`é` prints é), never the kept
   * source slice; numbers keep their lexemes. The search's compact form (spec J15).
   */
  decoded?: boolean;
}

export interface ToValueOptions {
  /** Integers past Number.MAX_SAFE_INTEGER become BigInt instead of LosslessNumber. */
  bigint?: boolean;
}

/**
 * Pretty printing indents at most this many levels; deeper lines keep the deepest indent. Up to
 * this depth the layout is exactly JSON.stringify(value, null, indent); past it the output stays
 * linear in the input (a 100,000-deep document would otherwise need gigabytes of spaces).
 */
export const PRETTY_MAX_INDENT_LEVELS = 64;

// ---------------------------------------------------------------- constants

const TAB = 0x09;
const LF = 0x0a;
const CR = 0x0d;
const SPACE = 0x20;
const QUOTE = 0x22;
const PLUS = 0x2b;
const COMMA = 0x2c;
const MINUS = 0x2d;
const DOT = 0x2e;
const SLASH = 0x2f;
const DIGIT_0 = 0x30;
const DIGIT_9 = 0x39;
const COLON = 0x3a;
const UPPER_A = 0x41;
const UPPER_E = 0x45;
const UPPER_F = 0x46;
const LBRACKET = 0x5b;
const BACKSLASH = 0x5c;
const RBRACKET = 0x5d;
const LOWER_A = 0x61;
const LOWER_E = 0x65;
const LOWER_F = 0x66;
const LBRACE = 0x7b;
const RBRACE = 0x7d;
const BOM = 0xfeff;

const END_OF_INPUT = 'Unexpected end of input';
/** `)]}',` before `)]}'`, so the longer guard wins. */
const XSSI_GUARDS = [")]}',", ")]}'", 'while(1);', 'for(;;);', 'for (;;);'];
const LINE_TYPES = new Set(['application/x-ndjson', 'application/jsonl']);
const JSON_SEQ_TYPE = 'application/json-seq';
const RECORD_SEPARATOR = '\u001e'; // RS, RFC 7464
/** Objects switch from a linear key scan to a Set once they hold this many members. */
const KEY_SET_THRESHOLD = 8;
const NUMBER_LEXEME = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/;
/** Digits, optionally a fraction of zeros, no exponent: the lexemes toValue reads as integers. */
const INTEGER_VALUED_LEXEME = /^-?\d+(?:\.0+)?$/;

// Parser scratch state. parseJson is synchronous and never re-entered, so module-level registers
// avoid allocating a result object per string and number.
let cursor = 0; // index just past the last value parseValue/scanNumber read
let errPos = 0;
let errMsg = '';
let dupCount = 0;
let inexactCount = 0;
let strValue = '';
let strRaw: string | undefined;

// ------------------------------------------------------------------- parse

/**
 * Parse captured text. Never throws: syntax errors come back as `ok: false` with the first error.
 * Strict RFC 8259 grammar, except that a leading BOM and one XSSI guard (at the very start, after
 * optional whitespace) are stripped and recorded. Any top-level value parses, scalars included.
 *
 * NDJSON (`kind: 'ndjson'`, root = an array of the documents): one document per line when the
 * content type is application/x-ndjson or application/jsonl, or when the text is several
 * newline-separated values (the first value on a line of its own, at least two lines parse);
 * application/json-seq reads RS-delimited records instead (RFC 7464; a record may span lines, text
 * before the first RS is a record too). Records are parsed on their own; blank ones are skipped; a
 * bad record makes the doc `ok: false` with that record's error while every other record is kept.
 */
export function parseJson(text: string, opts?: ParseJsonOptions | null): JsonDoc {
  const source = typeof text === 'string' ? text : '';
  const end = source.length;
  let start = 0;
  const bom = end > 0 && source.charCodeAt(0) === BOM;
  if (bom) start = 1;
  let prefix: string | undefined;
  const guardAt = skipWs(source, start, end);
  for (const guard of XSSI_GUARDS) {
    if (source.startsWith(guard, guardAt)) {
      prefix = guard;
      start = guardAt + guard.length;
      break;
    }
  }

  const type = mediaType(opts?.contentType);
  if (LINE_TYPES.has(type) || type === JSON_SEQ_TYPE) {
    const items = parseRecords(source, start, end, type === JSON_SEQ_TYPE ? RECORD_SEPARATOR : '\n');
    return makeDoc(source, 'ndjson', { t: 'arr', items }, prefix, bom);
  }

  dupCount = 0;
  inexactCount = 0;
  errPos = -1;
  const valueStart = skipWs(source, start, end);
  const root = parseValue(source, valueStart, end);
  if (root === null) return makeDoc(source, 'json', null, prefix, bom);
  const valueEnd = cursor;
  const after = skipWs(source, valueEnd, end);
  if (after >= end) return makeDoc(source, 'json', root, prefix, bom);

  // Something follows the value. Newline-separated values whose first one sits on its own line
  // are NDJSON; anything else is a syntax error at the second value.
  const trailingPos = after;
  const trailingMsg = `${unexpectedToken(source, after)} after the JSON value`;
  const firstNewline = source.indexOf('\n', valueStart);
  if (firstNewline >= valueEnd && firstNewline < after) {
    const items = parseRecords(source, start, end, '\n');
    if (items.length >= 2) return makeDoc(source, 'ndjson', { t: 'arr', items }, prefix, bom);
  }
  errPos = trailingPos;
  errMsg = trailingMsg;
  return makeDoc(source, 'json', null, prefix, bom);
}

/** "Unexpected token } at line 3, col 5". */
export function describeJsonError(error: JsonParseError): string {
  return `${error.message} at line ${error.line}, col ${error.col}`;
}

function mediaType(contentType: string | null | undefined): string {
  if (typeof contentType !== 'string') return '';
  const semicolon = contentType.indexOf(';');
  return (semicolon < 0 ? contentType : contentType.slice(0, semicolon)).trim().toLowerCase();
}

/** Builds the doc from the registers: errPos ≥ 0 means the first error is errPos/errMsg. */
function makeDoc(
  text: string,
  kind: JsonKind,
  root: JsonNode | null,
  prefix: string | undefined,
  bom: boolean,
): JsonDoc {
  const failed = errPos >= 0;
  // A failed JSON document has no root, so nothing is counted; NDJSON counts the lines it kept.
  const duplicates = root === null ? 0 : dupCount;
  const inexactNumbers = root === null ? 0 : inexactCount;
  let doc: JsonDoc;
  if (failed) {
    doc = { ok: false, kind, root, error: locate(text, errPos, errMsg), duplicates, inexactNumbers };
  } else {
    doc = { ok: true, kind, root: root as JsonNode, duplicates, inexactNumbers };
  }
  if (prefix !== undefined) doc.prefix = prefix;
  if (bom) doc.bom = true;
  return doc;
}

function locate(text: string, pos: number, message: string): JsonParseError {
  let line = 1;
  let lineStart = 0;
  let newline = text.indexOf('\n');
  while (newline !== -1 && newline < pos) {
    line += 1;
    lineStart = newline + 1;
    newline = text.indexOf('\n', lineStart);
  }
  return { pos, line, col: pos - lineStart + 1, message };
}

/**
 * One document per record; a record ends at `separator` (a newline for NDJSON / JSON Lines, RS for
 * json-seq). Resets the counters; on return they cover only the kept records, and errPos/errMsg
 * hold the first bad record's error (errPos is -1 when every record parsed).
 */
function parseRecords(text: string, start: number, end: number, separator: string): JsonNode[] {
  dupCount = 0;
  inexactCount = 0;
  let firstErrPos = -1;
  let firstErrMsg = '';
  const items: JsonNode[] = [];
  let recordStart = start;
  for (;;) {
    let recordEnd = text.indexOf(separator, recordStart);
    if (recordEnd === -1 || recordEnd > end) recordEnd = end;
    const i = skipWs(text, recordStart, recordEnd);
    if (i < recordEnd) {
      const duplicatesBefore = dupCount;
      const inexactBefore = inexactCount;
      errPos = -1;
      let node = parseValue(text, i, recordEnd);
      if (node !== null) {
        const after = skipWs(text, cursor, recordEnd);
        if (after < recordEnd) {
          errPos = after;
          errMsg = `${unexpectedToken(text, after)} after the JSON value`;
          node = null;
        }
      }
      if (node !== null) {
        items.push(node);
      } else {
        dupCount = duplicatesBefore;
        inexactCount = inexactBefore;
        if (firstErrPos < 0) {
          firstErrPos = errPos;
          firstErrMsg = errMsg;
        }
      }
    }
    if (recordEnd >= end) break;
    recordStart = recordEnd + 1;
  }
  errPos = firstErrPos;
  errMsg = firstErrMsg;
  return items;
}

function skipWs(text: string, i: number, end: number): number {
  while (i < end) {
    const c = text.charCodeAt(i);
    if (c > SPACE || (c !== SPACE && c !== LF && c !== CR && c !== TAB)) break;
    i++;
  }
  return i;
}

function fail(pos: number, message: string): null {
  errPos = pos;
  errMsg = message;
  return null;
}

function unexpectedToken(text: string, pos: number): string {
  const code = text.codePointAt(pos) ?? 0;
  const shown =
    code > SPACE && code < 0x7f
      ? String.fromCharCode(code)
      : `U+${code.toString(16).toUpperCase().padStart(4, '0')}`;
  return `Unexpected token ${shown}`;
}

const VALUE = 0; // expecting a value
const AFTER = 1; // a value just ended: expecting `,` or the container's closer
const KEY = 2; // expecting a member name

/**
 * Parses one value starting at `start` (whitespace already skipped or allowed) within [start, end).
 * Returns the node with `cursor` just past it, or null with errPos/errMsg set.
 */
function parseValue(text: string, start: number, end: number): JsonNode | null {
  let i = start;
  let root: JsonNode | null = null;
  // Open containers. `container` is the innermost; `stack` holds its ancestors.
  const stack: JsonContainerNode[] = [];
  const keySets: (Set<string> | null)[] = [];
  let container: JsonContainerNode | null = null;
  let keySet: Set<string> | null = null;
  let key = '';
  let keyRaw: string | undefined;
  let keyDup = false;
  let state = VALUE;

  for (;;) {
    if (state === VALUE) {
      i = skipWs(text, i, end);
      if (i >= end) return fail(i, END_OF_INPUT);
      const c = text.charCodeAt(i);
      let node: JsonNode;
      if (c === QUOTE) {
        i = scanString(text, i, end);
        if (i < 0) return null;
        node =
          strRaw === undefined ? { t: 'str', value: strValue } : { t: 'str', value: strValue, raw: strRaw };
      } else if (c === LBRACE) {
        node = { t: 'obj', entries: [] };
        i++;
      } else if (c === LBRACKET) {
        node = { t: 'arr', items: [] };
        i++;
      } else if (c === MINUS || (c >= DIGIT_0 && c <= DIGIT_9)) {
        const number = scanNumber(text, i, end);
        if (number === null) return null;
        node = number;
        i = cursor;
      } else if (c === 0x74 /* t */) {
        if (!matchLiteral(text, i, end, 'true')) return null;
        node = { t: 'bool', value: true };
        i += 4;
      } else if (c === 0x66 /* f */) {
        if (!matchLiteral(text, i, end, 'false')) return null;
        node = { t: 'bool', value: false };
        i += 5;
      } else if (c === 0x6e /* n */) {
        if (!matchLiteral(text, i, end, 'null')) return null;
        node = { t: 'null' };
        i += 4;
      } else {
        return fail(i, unexpectedToken(text, i));
      }

      // Attach to the parent now: containers are filled in place as the parse descends.
      if (container === null) {
        root = node;
      } else if (container.t === 'arr') {
        container.items.push(node);
      } else {
        const member: JsonEntry = { key, value: node };
        if (keyRaw !== undefined) member.keyRaw = keyRaw;
        if (keyDup) member.dup = true;
        container.entries.push(member);
      }

      if (node.t === 'obj' || node.t === 'arr') {
        i = skipWs(text, i, end);
        if (i < end && text.charCodeAt(i) === (node.t === 'obj' ? RBRACE : RBRACKET)) {
          i++; // empty container
        } else {
          if (container !== null) {
            stack.push(container);
            keySets.push(keySet);
          }
          container = node;
          keySet = null;
          state = node.t === 'obj' ? KEY : VALUE;
          continue;
        }
      }
      state = AFTER;
    } else if (state === AFTER) {
      if (container === null) {
        cursor = i;
        return root;
      }
      i = skipWs(text, i, end);
      if (i >= end) return fail(i, END_OF_INPUT);
      const c = text.charCodeAt(i);
      const closer = container.t === 'obj' ? RBRACE : RBRACKET;
      if (c === COMMA) {
        const comma = i;
        i = skipWs(text, i + 1, end);
        if (i < end && text.charCodeAt(i) === closer) return fail(comma, 'Trailing comma');
        state = container.t === 'obj' ? KEY : VALUE;
      } else if (c === closer) {
        i++;
        container = stack.pop() ?? null;
        keySet = keySets.pop() ?? null;
      } else {
        return fail(
          i,
          container.t === 'obj'
            ? "Expected ',' or '}' after property value"
            : "Expected ',' or ']' after array element",
        );
      }
    } else {
      // KEY: a member name, then `:`.
      i = skipWs(text, i, end);
      if (i >= end) return fail(i, END_OF_INPUT);
      if (text.charCodeAt(i) !== QUOTE) return fail(i, 'Expected property name');
      i = scanString(text, i, end);
      if (i < 0) return null;
      key = strValue;
      keyRaw = strRaw;
      keyDup = false;
      if (keySet !== null) {
        if (keySet.has(key)) keyDup = true;
        else keySet.add(key);
      } else {
        const entries = (container as JsonObjectNode).entries;
        for (let k = 0; k < entries.length; k++) {
          if (entries[k].key === key) {
            keyDup = true;
            break;
          }
        }
        if (entries.length >= KEY_SET_THRESHOLD) {
          keySet = new Set();
          for (let k = 0; k < entries.length; k++) keySet.add(entries[k].key);
          keySet.add(key);
        }
      }
      if (keyDup) dupCount++;
      i = skipWs(text, i, end);
      if (i >= end) return fail(i, END_OF_INPUT);
      if (text.charCodeAt(i) !== COLON) return fail(i, "Expected ':' after property name");
      i++;
      state = VALUE;
    }
  }
}

function matchLiteral(text: string, start: number, end: number, word: string): boolean {
  for (let k = 1; k < word.length; k++) {
    const at = start + k;
    if (at >= end) {
      fail(at, END_OF_INPUT);
      return false;
    }
    if (text.charCodeAt(at) !== word.charCodeAt(k)) {
      fail(at, unexpectedToken(text, at));
      return false;
    }
  }
  return true;
}

/**
 * Reads the string whose opening quote is at `start`. Returns the index past the closing quote and
 * sets strValue/strRaw, or -1 with the error registers set ("Unterminated string" points at the
 * opening quote). The common case — no escapes — is one pass and one slice.
 */
function scanString(text: string, start: number, end: number): number {
  let lone = false;
  for (let i = start + 1; i < end; i++) {
    const c = text.charCodeAt(i);
    if (c === QUOTE) {
      strValue = text.slice(start + 1, i);
      // JSON.stringify escapes lone surrogates, so a raw one makes the source non-canonical.
      strRaw = lone ? text.slice(start, i + 1) : undefined;
      return i + 1;
    }
    if (c === BACKSLASH) return scanEscapedString(text, start, i, end);
    if (c < SPACE) {
      fail(i, 'Bad control character in string');
      return -1;
    }
    if ((c & 0xf800) === 0xd800) {
      if (c < 0xdc00 && i + 1 < end && (text.charCodeAt(i + 1) & 0xfc00) === 0xdc00) i++;
      else lone = true;
    }
  }
  fail(start, 'Unterminated string');
  return -1;
}

function scanEscapedString(text: string, start: number, firstEscape: number, end: number): number {
  let out = text.slice(start + 1, firstEscape);
  let run = firstEscape; // start of the pending unescaped run
  let i = firstEscape;
  while (i < end) {
    const c = text.charCodeAt(i);
    if (c === QUOTE) {
      out += text.slice(run, i);
      const raw = text.slice(start, i + 1);
      strValue = out;
      strRaw = JSON.stringify(out) === raw ? undefined : raw;
      return i + 1;
    }
    if (c === BACKSLASH) {
      out += text.slice(run, i);
      if (i + 1 >= end) {
        fail(start, 'Unterminated string');
        return -1;
      }
      const escape = text.charCodeAt(i + 1);
      let decoded: string;
      let length = 2;
      if (escape === QUOTE) decoded = '"';
      else if (escape === BACKSLASH) decoded = '\\';
      else if (escape === SLASH) decoded = '/';
      else if (escape === 0x62 /* b */) decoded = '\b';
      else if (escape === 0x66 /* f */) decoded = '\f';
      else if (escape === 0x6e /* n */) decoded = '\n';
      else if (escape === 0x72 /* r */) decoded = '\r';
      else if (escape === 0x74 /* t */) decoded = '\t';
      else if (escape === 0x75 /* u */) {
        const code = hex4(text, i + 2, end);
        if (code < 0) {
          fail(i, 'Invalid Unicode escape');
          return -1;
        }
        // One code unit per escape, exactly like JSON.parse: pairs combine, lone halves stay.
        decoded = String.fromCharCode(code);
        length = 6;
      } else {
        fail(i, 'Invalid escape sequence');
        return -1;
      }
      out += decoded;
      i += length;
      run = i;
      continue;
    }
    if (c < SPACE) {
      fail(i, 'Bad control character in string');
      return -1;
    }
    i++;
  }
  fail(start, 'Unterminated string');
  return -1;
}

function hex4(text: string, at: number, end: number): number {
  if (at + 4 > end) return -1;
  let code = 0;
  for (let k = 0; k < 4; k++) {
    const c = text.charCodeAt(at + k);
    let digit: number;
    if (c >= DIGIT_0 && c <= DIGIT_9) digit = c - DIGIT_0;
    else if (c >= LOWER_A && c <= LOWER_F) digit = c - LOWER_A + 10;
    else if (c >= UPPER_A && c <= UPPER_F) digit = c - UPPER_A + 10;
    else return -1;
    code = code * 16 + digit;
  }
  return code;
}

/** Reads the number at `start` (a `-` or a digit). Sets `cursor` past it. */
function scanNumber(text: string, start: number, end: number): JsonNumberNode | null {
  let i = start;
  let c = text.charCodeAt(i);
  const negative = c === MINUS;
  if (negative) {
    i++;
    c = i < end ? text.charCodeAt(i) : -1;
    if (c < DIGIT_0 || c > DIGIT_9) return fail(i, 'No number after minus sign');
  }
  let floating = false; // an exponent or a non-zero fraction digit: floating-point notation
  let fractionAt = -1; // offset of the `.` within the lexeme
  let significant = 0; // mantissa digits from the first non-zero one (trailing zeros included)
  if (c === DIGIT_0) {
    i++;
    if (i < end) {
      const next = text.charCodeAt(i);
      if (next >= DIGIT_0 && next <= DIGIT_9) return fail(i - 1, 'Leading zeros are not allowed');
    }
  } else {
    while (i < end) {
      c = text.charCodeAt(i);
      if (c < DIGIT_0 || c > DIGIT_9) break;
      significant++;
      i++;
    }
  }
  if (i < end && text.charCodeAt(i) === DOT) {
    fractionAt = i - start;
    i++;
    c = i < end ? text.charCodeAt(i) : -1;
    if (c < DIGIT_0 || c > DIGIT_9) return fail(i, 'Unterminated fractional number');
    while (i < end) {
      c = text.charCodeAt(i);
      if (c < DIGIT_0 || c > DIGIT_9) break;
      if (c !== DIGIT_0) floating = true;
      if (significant > 0 || c !== DIGIT_0) significant++;
      i++;
    }
  }
  if (i < end) {
    c = text.charCodeAt(i);
    if (c === LOWER_E || c === UPPER_E) {
      floating = true;
      i++;
      if (i < end) {
        c = text.charCodeAt(i);
        if (c === PLUS || c === MINUS) i++;
      }
      c = i < end ? text.charCodeAt(i) : -1;
      if (c < DIGIT_0 || c > DIGIT_9) return fail(i, 'Exponent part is missing a number');
      while (i < end) {
        c = text.charCodeAt(i);
        if (c < DIGIT_0 || c > DIGIT_9) break;
        i++;
      }
    }
  }
  const raw = text.slice(start, i);
  const value = +raw;
  const exact = numberIsExact(raw, value, floating, fractionAt, significant, negative);
  if (!exact) inexactCount++;
  cursor = i;
  return { t: 'num', raw, value, exact };
}

/** The rule documented on JsonNumberNode.exact. */
function numberIsExact(
  raw: string,
  value: number,
  floating: boolean,
  fractionAt: number,
  significant: number,
  negative: boolean,
): boolean {
  if (value === 0) return significant === 0 && !negative; // a minus zero, or a non-zero lexeme underflowed
  if (!Number.isFinite(value)) return false; // overflow
  if (floating) return true; // exponent or non-zero fraction: floating point, the nearest double is fine
  // Integer-valued without an exponent: exact iff the double is that very integer. Up to 15
  // significant digits it always is (|n| < 10^15 < 2^53); past that, compare as BigInt.
  if (significant <= 15) return true;
  return BigInt(value) === BigInt(fractionAt < 0 ? raw : raw.slice(0, fractionAt));
}

// ------------------------------------------------------------------- print

/**
 * Text for a node, keeping every lexeme (numbers as written, strings as written where `raw` is
 * kept, else JSON.stringify escaping) and member order, duplicates included. Compact by default:
 * for a parsed document that is the input minus insignificant whitespace, so a compact input
 * round-trips byte for byte. With `indent` the layout is JSON.stringify(value, null, indent),
 * capped at PRETTY_MAX_INDENT_LEVELS levels of indentation.
 *
 * A kept `raw` / `keyRaw` / number lexeme is written only while it still decodes to the node's
 * current value (Number(raw) for numbers); a node edited in place prints canonically instead, so an
 * in-place redaction never leaks the original text.
 */
export function printJson(node: JsonNode, opts?: PrintJsonOptions | null): string {
  const decoded = opts?.decoded === true;
  if (node.t !== 'obj' && node.t !== 'arr') return scalarText(node, decoded);
  if (isEmptyContainer(node)) return node.t === 'obj' ? '{}' : '[]';
  const width = clampIndent(opts?.indent);
  const pretty = width > 0;
  const breaks: string[] = []; // '\n' + indentation, per depth
  const lineBreak = (depth: number): string => {
    const level = depth < PRETTY_MAX_INDENT_LEVELS ? depth : PRETTY_MAX_INDENT_LEVELS;
    return breaks[level] ?? (breaks[level] = '\n' + ' '.repeat(level * width));
  };
  const colon = pretty ? ': ' : ':';
  let out = node.t === 'obj' ? '{' : '[';
  const open: JsonContainerNode[] = [node];
  const next: number[] = [0];
  descend: while (open.length > 0) {
    const top = open.length - 1;
    const current = open[top];
    if (current.t === 'arr') {
      const items = current.items;
      for (let index = next[top]; index < items.length; index++) {
        if (index > 0) out += ',';
        if (pretty) out += lineBreak(top + 1);
        const child = items[index];
        if (child.t === 'obj' || child.t === 'arr') {
          if (isEmptyContainer(child)) {
            out += child.t === 'obj' ? '{}' : '[]';
            continue;
          }
          out += child.t === 'obj' ? '{' : '[';
          next[top] = index + 1;
          open.push(child);
          next.push(0);
          continue descend;
        }
        out += scalarText(child, decoded);
      }
    } else {
      const entries = current.entries;
      for (let index = next[top]; index < entries.length; index++) {
        if (index > 0) out += ',';
        if (pretty) out += lineBreak(top + 1);
        const member = entries[index];
        out += keyText(member, decoded) + colon;
        const child = member.value;
        if (child.t === 'obj' || child.t === 'arr') {
          if (isEmptyContainer(child)) {
            out += child.t === 'obj' ? '{}' : '[]';
            continue;
          }
          out += child.t === 'obj' ? '{' : '[';
          next[top] = index + 1;
          open.push(child);
          next.push(0);
          continue descend;
        }
        out += scalarText(child, decoded);
      }
    }
    open.pop();
    next.pop();
    if (pretty) out += lineBreak(top);
    out += current.t === 'obj' ? '}' : ']';
  }
  return out;
}

function isEmptyContainer(node: JsonContainerNode): boolean {
  return node.t === 'obj' ? node.entries.length === 0 : node.items.length === 0;
}

function clampIndent(indent: number | undefined): number {
  if (typeof indent !== 'number' || !(indent >= 1)) return 0;
  return Math.min(10, Math.floor(indent));
}

function scalarText(node: JsonScalarNode, decoded: boolean): string {
  if (node.t === 'str') return (decoded ? undefined : keptRaw(node.raw, node.value)) ?? JSON.stringify(node.value);
  if (node.t === 'num') {
    return Object.is(Number(node.raw), node.value) ? node.raw : JSON.stringify(node.value);
  }
  if (node.t === 'bool') return node.value ? 'true' : 'false';
  return 'null';
}

function keyText(member: JsonEntry, decoded: boolean): string {
  return (decoded ? undefined : keptRaw(member.keyRaw, member.key)) ?? JSON.stringify(member.key);
}

/**
 * A kept slice, if it is exactly one JSON string that still decodes to `value` — so a node edited in
 * place (a redacted value, a renamed key) never prints the original text.
 */
function keptRaw(raw: string | undefined, value: string): string | undefined {
  if (raw === undefined || raw.charCodeAt(0) !== QUOTE) return undefined;
  return scanString(raw, 0, raw.length) === raw.length && strValue === value ? raw : undefined;
}

// ----------------------------------------------------------------- toValue

/**
 * A JSON number kept as written: what toValue gives for integers past Number.MAX_SAFE_INTEGER
 * (without `bigint`). `valueOf` gives the nearest double so arithmetic and comparisons still work; `toString` and template
 * literals give the lexeme (note `'' + n` goes through valueOf); JSON.stringify writes the lexeme
 * back unquoted where JSON.rawJSON exists (Chrome 114+, Node 21+), else as a string — never rounded.
 */
export class LosslessNumber {
  readonly raw: string;

  constructor(raw: string) {
    if (typeof raw !== 'string' || !NUMBER_LEXEME.test(raw)) {
      throw new TypeError(`Not a JSON number: ${String(raw).slice(0, 40)}`);
    }
    this.raw = raw;
  }

  valueOf(): number {
    return Number(this.raw);
  }

  toString(): string {
    return this.raw;
  }

  toJSON(): unknown {
    const rawJSON = (JSON as unknown as { rawJSON?: (text: string) => unknown }).rawJSON;
    return typeof rawJSON === 'function' ? rawJSON.call(JSON, this.raw) : this.raw;
  }
}

/**
 * Plain JavaScript for a node, with JSON.parse semantics: a duplicate key keeps its first position
 * and its last value. Every member is created with Object.defineProperty, so `__proto__` and
 * `constructor` are ordinary own data properties (no prototype change, no pollution). Integers
 * written without an exponent (digits, optionally a fraction of zeros) past Number.MAX_SAFE_INTEGER
 * become BigInt with `bigint`, else LosslessNumber — exact or not, so a column of IDs has one type;
 * every other number is Number(raw), including the inexact `1e400` (Infinity) and `-0`, which the
 * node flags but a plain value cannot carry.
 */
export function toValue(node: JsonNode, opts?: ToValueOptions | null): unknown {
  const bigint = opts?.bigint === true;
  if (node.t !== 'obj' && node.t !== 'arr') return scalarValue(node, bigint);
  const root: object = node.t === 'obj' ? {} : [];
  const open: JsonContainerNode[] = [node];
  const outs: object[] = [root];
  const next: number[] = [0];
  descend: while (open.length > 0) {
    const top = open.length - 1;
    const current = open[top];
    if (current.t === 'arr') {
      const items = current.items;
      const list = outs[top] as unknown[];
      for (let index = next[top]; index < items.length; index++) {
        const child = items[index];
        if (child.t === 'obj' || child.t === 'arr') {
          const made = child.t === 'obj' ? {} : [];
          list.push(made);
          next[top] = index + 1;
          open.push(child);
          outs.push(made);
          next.push(0);
          continue descend;
        }
        list.push(scalarValue(child, bigint));
      }
    } else {
      const entries = current.entries;
      const target = outs[top];
      for (let index = next[top]; index < entries.length; index++) {
        const member = entries[index];
        const child = member.value;
        if (child.t === 'obj' || child.t === 'arr') {
          const made = child.t === 'obj' ? {} : [];
          defineMember(target, member.key, made);
          next[top] = index + 1;
          open.push(child);
          outs.push(made);
          next.push(0);
          continue descend;
        }
        defineMember(target, member.key, scalarValue(child, bigint));
      }
    }
    open.pop();
    outs.pop();
    next.pop();
  }
  return root;
}

function defineMember(target: object, key: string, value: unknown): void {
  Object.defineProperty(target, key, { value, writable: true, enumerable: true, configurable: true });
}

function scalarValue(node: JsonScalarNode, bigint: boolean): unknown {
  if (node.t === 'num') {
    const { raw, value } = node;
    // Every integer past Number.MAX_SAFE_INTEGER written without an exponent is wrapped — exact or
    // not (9007199254740992 is exact, …993 is not) — so a column of IDs has one type.
    if (!(Math.abs(value) <= Number.MAX_SAFE_INTEGER) && INTEGER_VALUED_LEXEME.test(raw)) {
      if (!bigint) return new LosslessNumber(raw);
      const dot = raw.indexOf('.');
      return BigInt(dot < 0 ? raw : raw.slice(0, dot));
    }
    return value;
  }
  if (node.t === 'str' || node.t === 'bool') return node.value;
  return null;
}

// --------------------------------------------------------------- fromValue

const CIRCULAR_TEXT = '[Circular]';
const UNREADABLE_TEXT = '[Unreadable]';

type Prepared = { node: JsonNode } | { source: object; isArray: boolean } | null;

interface ValueFrame {
  source: object;
  node: JsonContainerNode;
  /** Object.keys for an object; null for an array (indices up to `length`). */
  keys: string[] | null;
  length: number;
  index: number;
}

/**
 * A plain value as nodes, for a body that exists only as a value (a decrypted response, a request body
 * stored before J4), so Table, Schema, Diff and Visualize read one model. JSON.stringify semantics:
 * toJSON is called (a Date becomes its ISO string), undefined, functions and symbols are left out of
 * objects and become null in arrays and at the top. A LosslessNumber or BigInt keeps its digits (with
 * `exact` as the parser would set it); NaN and ±Infinity keep their names and -0 its sign, all inexact.
 * Members come in Object.keys order, an own `__proto__` included. A reference back to an ancestor is the
 * string "[Circular]" and a property that throws when read "[Unreadable]". Iterative: any depth works.
 */
export function fromValue(value: unknown): JsonNode {
  const first = prepareValue(value);
  if (first === null) return { t: 'null' };
  if ('node' in first) return first.node;
  const root = emptyNode(first.isArray);
  const ancestors = new Set<object>([first.source]);
  const stack: ValueFrame[] = [valueFrame(first.source, first.isArray, root)];
  while (stack.length > 0) {
    const top = stack[stack.length - 1];
    if (top.index >= top.length) {
      ancestors.delete(top.source);
      stack.pop();
      continue;
    }
    const key = top.keys ? top.keys[top.index] : String(top.index);
    top.index++;
    let prepared: Prepared;
    try {
      prepared = prepareValue((top.source as Record<string, unknown>)[key]);
    } catch {
      prepared = { node: { t: 'str', value: UNREADABLE_TEXT } };
    }
    if (prepared === null) {
      if (top.node.t === 'arr') top.node.items.push({ t: 'null' });
      continue;
    }
    if ('node' in prepared) {
      addMember(top.node, key, prepared.node);
      continue;
    }
    if (ancestors.has(prepared.source)) {
      addMember(top.node, key, { t: 'str', value: CIRCULAR_TEXT });
      continue;
    }
    const made = emptyNode(prepared.isArray);
    addMember(top.node, key, made);
    ancestors.add(prepared.source);
    stack.push(valueFrame(prepared.source, prepared.isArray, made));
  }
  return root;
}

/** A leaf node, a container still to walk, or null for a value JSON leaves out (undefined, function, symbol). */
function prepareValue(input: unknown): Prepared {
  let value = input;
  try {
    if (value instanceof LosslessNumber) return { node: lexemeNode(value.raw) };
    if (value !== null && typeof value === 'object') {
      const toJSON = (value as { toJSON?: unknown }).toJSON;
      if (typeof toJSON === 'function') value = toJSON.call(value);
      if (value instanceof LosslessNumber) return { node: lexemeNode(value.raw) };
    }
    switch (typeof value) {
      case 'string':
        return { node: { t: 'str', value } };
      case 'boolean':
        return { node: { t: 'bool', value } };
      case 'number':
        return { node: numberValueNode(value) };
      case 'bigint':
        return { node: lexemeNode(value.toString()) };
      case 'object':
        return value === null ? { node: { t: 'null' } } : { source: value, isArray: Array.isArray(value) };
      default:
        return null;
    }
  } catch {
    return { node: { t: 'str', value: UNREADABLE_TEXT } };
  }
}

/** A JavaScript number as a node: its shortest round-trip text, exact unless it is -0, NaN or ±Infinity. */
function numberValueNode(value: number): JsonNumberNode {
  if (Object.is(value, -0)) return { t: 'num', raw: '-0', value, exact: false };
  return { t: 'num', raw: String(value), value, exact: Number.isFinite(value) };
}

/** A number lexeme (a LosslessNumber's, a BigInt's digits) as the parser reads it. */
function lexemeNode(raw: string): JsonNumberNode {
  const node = scanNumber(raw, 0, raw.length);
  return node !== null && cursor === raw.length ? node : { t: 'num', raw, value: Number(raw), exact: false };
}

function emptyNode(isArray: boolean): JsonContainerNode {
  return isArray ? { t: 'arr', items: [] } : { t: 'obj', entries: [] };
}

function valueFrame(source: object, isArray: boolean, node: JsonContainerNode): ValueFrame {
  let keys: string[] | null = null;
  let length = 0;
  try {
    if (isArray) length = (source as unknown[]).length;
    else {
      keys = Object.keys(source);
      length = keys.length;
    }
  } catch {
    keys = [];
    length = 0;
  }
  return { source, node, keys, length, index: 0 };
}

function addMember(node: JsonContainerNode, key: string, value: JsonNode): void {
  if (node.t === 'arr') node.items.push(value);
  else node.entries.push({ key, value });
}

// ----------------------------------------------------------------- isExact

/**
 * True when every number in the subtree is `exact` (see JsonNumberNode.exact), so toValue loses no
 * number. Duplicate keys are reported separately (JsonEntry.dup / JsonDoc.duplicates).
 */
export function isExact(node: JsonNode): boolean {
  const pending: JsonNode[] = [node];
  while (pending.length > 0) {
    const current = pending.pop() as JsonNode;
    if (current.t === 'num') {
      if (!current.exact) return false;
    } else if (current.t === 'arr') {
      const items = current.items;
      for (let k = 0; k < items.length; k++) pending.push(items[k]);
    } else if (current.t === 'obj') {
      const entries = current.entries;
      for (let k = 0; k < entries.length; k++) pending.push(entries[k].value);
    }
  }
  return true;
}
