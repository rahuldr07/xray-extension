/**
 * How captured text is displayed (docs/superpowers/specs/2026-10-14-json-fidelity-design.md §2).
 *
 * - Bidi controls (J13): an embedding, override, isolate or mark inside a captured string reorders
 *   the text around it on screen — `"abc ‮RTL"` reads backwards. Views show each one as a visible
 *   escape (`‮`) instead; the data itself is untouched (Copy still copies the exact text).
 * - Raw layout (J2): the Raw view windows its rows, so the text is cut into rows once: one per line,
 *   and a long line (minified JSON is one line) into segments of RAW_SEGMENT_CHARS, never splitting
 *   a surrogate pair. Rows are offsets into the text, so a 5 MB body costs a few typed arrays.
 *
 * Pure: no DOM, no store.
 */

/** U+200E/F (marks), U+202A–U+202E (embeddings, overrides), U+2066–U+2069 (isolates). */
const BIDI_CONTROL = /[‎‏‪-‮⁦-⁩]/;

const BIDI_NAMES: Record<number, string> = {
  0x200e: 'LEFT-TO-RIGHT MARK',
  0x200f: 'RIGHT-TO-LEFT MARK',
  0x202a: 'LEFT-TO-RIGHT EMBEDDING',
  0x202b: 'RIGHT-TO-LEFT EMBEDDING',
  0x202c: 'POP DIRECTIONAL FORMATTING',
  0x202d: 'LEFT-TO-RIGHT OVERRIDE',
  0x202e: 'RIGHT-TO-LEFT OVERRIDE',
  0x2066: 'LEFT-TO-RIGHT ISOLATE',
  0x2067: 'RIGHT-TO-LEFT ISOLATE',
  0x2068: 'FIRST STRONG ISOLATE',
  0x2069: 'POP DIRECTIONAL ISOLATE',
};

/** Plain runs and the bidi controls between them, in order: `'a‮b'` → `['a', 0x202e, 'b']`. */
export function splitBidi(text: string): Array<string | number> {
  if (!text) return [];
  if (!BIDI_CONTROL.test(text)) return [text];
  const parts: Array<string | number> = [];
  let run = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (BIDI_NAMES[code] === undefined) continue;
    if (i > run) parts.push(text.slice(run, i));
    parts.push(code);
    run = i + 1;
  }
  if (run < text.length) parts.push(text.slice(run));
  return parts;
}

/** The escape shown in place of a control: `‮`. */
export function bidiEscape(code: number): string {
  return '\\u' + code.toString(16).toUpperCase().padStart(4, '0');
}

/** `U+202E RIGHT-TO-LEFT OVERRIDE`, for a tooltip. */
export function bidiName(code: number): string {
  return `U+${code.toString(16).toUpperCase().padStart(4, '0')} ${BIDI_NAMES[code] ?? 'BIDI CONTROL'}`;
}

/** The text with every bidi control replaced by its escape (attributes, plain-text receipts). */
export function escapeBidi(text: string): string {
  if (!BIDI_CONTROL.test(text)) return text;
  return splitBidi(text).map((part) => (typeof part === 'number' ? bidiEscape(part) : part)).join('');
}

// ------------------------------------------------------------------ Raw layout

/** A long line is shown in rows of at most this many characters. */
export const RAW_SEGMENT_CHARS = 4_000;

/**
 * Rows of a text: row `i` shows `text.slice(start[i], end[i])` (the `\n` ending a line is not part of
 * a row), from line `line[i]` (1-based); `first[i]` is 1 for the row that starts its line, 0 for the
 * rows continuing it. A trailing `\n` leaves a last, empty line — as an editor shows it.
 */
export interface RawLayout {
  count: number;
  lineCount: number;
  start: Int32Array;
  end: Int32Array;
  line: Int32Array;
  first: Uint8Array;
}

export function layoutRawText(text: string, segment = RAW_SEGMENT_CHARS): RawLayout {
  const size = Math.max(2, Math.floor(segment));
  let capacity = 64;
  let start = new Int32Array(capacity);
  let end = new Int32Array(capacity);
  let line = new Int32Array(capacity);
  let first = new Uint8Array(capacity);
  let count = 0;
  const push = (from: number, to: number, lineNumber: number, isFirst: boolean): void => {
    if (count === capacity) {
      capacity *= 2;
      const grow = <T extends Int32Array | Uint8Array>(array: T, Make: new (length: number) => T): T => {
        const next = new Make(capacity);
        next.set(array);
        return next;
      };
      start = grow(start, Int32Array);
      end = grow(end, Int32Array);
      line = grow(line, Int32Array);
      first = grow(first, Uint8Array);
    }
    start[count] = from;
    end[count] = to;
    line[count] = lineNumber;
    first[count] = isFirst ? 1 : 0;
    count++;
  };

  let lineNumber = 0;
  let lineStart = 0;
  for (;;) {
    lineNumber++;
    let lineEnd = text.indexOf('\n', lineStart);
    if (lineEnd === -1) lineEnd = text.length;
    let from = lineStart;
    let isFirst = true;
    do {
      let to = Math.min(lineEnd, from + size);
      // Never end a row between the two halves of a surrogate pair.
      if (to < lineEnd && (text.charCodeAt(to) & 0xfc00) === 0xdc00 && (text.charCodeAt(to - 1) & 0xfc00) === 0xd800) to--;
      push(from, to, lineNumber, isFirst);
      isFirst = false;
      from = to;
    } while (from < lineEnd);
    if (lineEnd >= text.length) break;
    lineStart = lineEnd + 1;
  }
  return {
    count,
    lineCount: lineNumber,
    start: start.subarray(0, count),
    end: end.subarray(0, count),
    line: line.subarray(0, count),
    first: first.subarray(0, count),
  };
}

/** The row showing text offset `offset` (an offset at the end of the text is in the last row). */
export function rowForOffset(layout: RawLayout, offset: number): number {
  let low = 0;
  let high = layout.count - 1;
  while (low < high) {
    const mid = (low + high + 1) >> 1;
    if (layout.start[mid] <= offset) low = mid;
    else high = mid - 1;
  }
  return low;
}

/** The Raw view windows blocks of rows: at most this many rows… */
export const RAW_BLOCK_ROWS = 64;
/** …and this many characters per block (a longer single row is a block of its own). */
export const RAW_BLOCK_CHARS = 16_000;

/**
 * Consecutive rows grouped into the blocks the Raw view windows, so a 200,000-line pretty print is a
 * few thousand windowed items rather than 200,000. Returns each block's first row, then the row
 * count as the end of the last block.
 */
export function rawBlocks(layout: RawLayout, maxRows = RAW_BLOCK_ROWS, maxChars = RAW_BLOCK_CHARS): Int32Array {
  const starts: number[] = [0];
  let rows = 0;
  let chars = 0;
  for (let row = 0; row < layout.count; row++) {
    const size = layout.end[row] - layout.start[row];
    if (rows > 0 && (rows >= maxRows || chars + size > maxChars)) {
      starts.push(row);
      rows = 0;
      chars = 0;
    }
    rows++;
    chars += size;
  }
  starts.push(layout.count);
  return Int32Array.from(starts);
}
