// Turns a response body into a single-series horizontal bar spec.
// One series → one hue (the panel accent), title names it, values direct-labeled.
// When nothing is meaningfully chartable we say so honestly rather than faking it.
//
// It reads the lossless parser's nodes (spec §2 J3, J14), like Table, Schema and Diff, so a value is
// labelled as it was written whenever the formatted number would misstate it (-0, 5e-324, an integer
// past 2^53).

import { nodeText, objectMembers, rowArrayNode } from './detail';
import { type JsonNode, type JsonNumberNode, type JsonObjectNode } from './jsonText';

export interface VizBar {
  label: string;
  value: number;
  negative: boolean;
  /** The number as written, when formatVizValue(value) would misstate it (see bar). */
  text?: string;
}

export interface VizSpec {
  kind: 'bars' | 'none';
  title: string;
  subtitle?: string;
  bars: VizBar[];
  truncated: number;
  maxAbs: number;
}

const MAX_BARS = 40;

/** A number that can be drawn: a number node whose value is finite (1e400 is not). */
function isChartable(node: JsonNode | undefined): node is JsonNumberNode {
  return node !== undefined && node.t === 'num' && Number.isFinite(node.value);
}

/**
 * A bar for a number node. Its value text is the lexeme when JavaScript does not hold the number
 * written (an integer past 2^53, -0) or when formatting collapses a non-zero number to zero (5e-324
 * and 0.00012 format as "0"); otherwise the formatted value (1,234,567; 1,234.6 for 1234.5678).
 */
function bar(label: string, node: JsonNumberNode): VizBar {
  const out: VizBar = { label, value: node.value, negative: node.value < 0 };
  if (!node.exact || (node.value !== 0 && Number(formatVizValue(node.value).replace(/,/g, '')) === 0)) out.text = node.raw;
  return out;
}

/** The value text a bar shows: the number as written when formatting would misstate it. */
export function vizValueText(item: VizBar): string {
  return item.text ?? formatVizValue(item.value);
}

/** A scalar as a category: a number by its value, or as written when JavaScript cannot hold it. */
function categoryOf(node: JsonNode | undefined): string {
  if (!node || node.t === 'null') return 'null';
  if (node.t === 'str') return node.value;
  if (node.t === 'num') return node.exact ? String(node.value) : node.raw;
  if (node.t === 'bool') return String(node.value);
  return '[object]';
}

function labelFor(node: JsonNode | undefined, index: number): string {
  if (!node || node.t === 'null') return `#${index + 1}`;
  const text = node.t === 'str' ? node.value : node.t === 'num' ? categoryOf(node) : nodeText(node);
  return text.length > 40 ? text.slice(0, 40) + '…' : text || `#${index + 1}`;
}

function frequency(items: Array<JsonNode | undefined>): VizBar[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = categoryOf(item);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value, negative: false }));
}

function fromObjects(rows: Array<Map<string, JsonNode>>): VizSpec | null {
  const numericCoverage = new Map<string, number>();
  const stringFields: string[] = [];
  const seenString = new Set<string>();
  for (const row of rows) {
    for (const [key, val] of row) {
      if (isChartable(val)) numericCoverage.set(key, (numericCoverage.get(key) || 0) + 1);
      else if (val.t === 'str' && !seenString.has(key)) { seenString.add(key); stringFields.push(key); }
    }
  }
  const bestNumeric = Array.from(numericCoverage.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
  const labelField = stringFields[0];

  if (bestNumeric) {
    const numericRows = rows.filter((row) => isChartable(row.get(bestNumeric)));
    const bars = numericRows
      .slice(0, MAX_BARS)
      .map((row, index) => bar(labelField ? labelFor(row.get(labelField), index) : `#${index + 1}`, row.get(bestNumeric) as JsonNumberNode));
    if (!bars.length) return null;
    return {
      kind: 'bars',
      title: `${bestNumeric} across ${numericRows.length} rows`,
      subtitle: labelField ? `Labeled by ${labelField}` : undefined,
      bars,
      truncated: Math.max(0, numericRows.length - bars.length),
      maxAbs: Math.max(...bars.map((item) => Math.abs(item.value)), 0),
    };
  }

  if (labelField) {
    const categories = frequency(rows.map((row) => row.get(labelField)));
    const bars = categories.slice(0, MAX_BARS);
    return {
      kind: 'bars',
      title: `Distribution of ${labelField}`,
      subtitle: `${rows.length} rows`,
      bars,
      truncated: Math.max(0, categories.length - bars.length),
      maxAbs: Math.max(...bars.map((item) => item.value), 0),
    };
  }
  return null;
}

/**
 * The chart for a body's nodes (capturedBody.bodyNode): its row array (the same array the Table shows,
 * rowArrayNode) as numbers, numeric fields of object rows, or a distribution; else an object's numeric
 * members; else a single number.
 */
export function buildVizSpecFromNode(node: JsonNode | null): VizSpec {
  const none = (title: string): VizSpec => ({ kind: 'none', title, bars: [], truncated: 0, maxAbs: 0 });
  const array = rowArrayNode(node);
  const rows = array ? array.items : [];

  if (rows.length) {
    if (rows.every(isChartable)) {
      const bars = (rows as JsonNumberNode[]).slice(0, MAX_BARS).map((item, index) => bar(`#${index + 1}`, item));
      return { kind: 'bars', title: `${rows.length} values`, bars, truncated: Math.max(0, rows.length - bars.length), maxAbs: Math.max(...bars.map((item) => Math.abs(item.value)), 0) };
    }
    if (rows.every((row) => row.t === 'obj')) {
      const spec = fromObjects((rows as JsonObjectNode[]).map(objectMembers));
      if (spec) return spec;
    }
    if (rows.every((row) => row.t !== 'obj' && row.t !== 'arr')) {
      const categories = frequency(rows);
      const bars = categories.slice(0, MAX_BARS);
      return { kind: 'bars', title: `Distribution of ${rows.length} values`, bars, truncated: Math.max(0, categories.length - bars.length), maxAbs: Math.max(...bars.map((item) => item.value), 0) };
    }
    return none('This array has no numeric or categorical field to chart.');
  }

  if (node && (node.t === 'obj' || node.t === 'arr')) {
    const numeric = node.t === 'obj' ? Array.from(objectMembers(node)).filter(([, val]) => isChartable(val)) as Array<[string, JsonNumberNode]> : [];
    if (numeric.length) {
      const bars = numeric.slice(0, MAX_BARS).map(([key, val]) => bar(key, val));
      return { kind: 'bars', title: `${numeric.length} numeric fields`, bars, truncated: Math.max(0, numeric.length - bars.length), maxAbs: Math.max(...bars.map((item) => Math.abs(item.value)), 0) };
    }
    return none('No numeric fields in this object to chart.');
  }

  if (isChartable(node ?? undefined)) {
    const single = bar('value', node as JsonNumberNode);
    return { kind: 'bars', title: 'Single value', bars: [single], truncated: 0, maxAbs: Math.abs(single.value) };
  }
  return none('Select a response with arrays or numbers to visualize.');
}

export function formatVizValue(value: number): string {
  if (Number.isInteger(value)) return value.toLocaleString('en-US');
  if (Math.abs(value) >= 1000) return value.toLocaleString('en-US', { maximumFractionDigits: 1 });
  return String(Number(value.toFixed(3)));
}
