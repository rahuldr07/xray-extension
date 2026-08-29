// Turns an arbitrary response value into a single-series horizontal bar spec.
// One series → one hue (the panel accent), title names it, values direct-labeled.
// When nothing is meaningfully chartable we say so honestly rather than faking it.

import { largestArrayProperty } from './detail';

export interface VizBar {
  label: string;
  value: number;
  negative: boolean;
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

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function labelFor(value: unknown, index: number): string {
  if (value == null) return `#${index + 1}`;
  const text = typeof value === 'string' ? value : String(value);
  return text.length > 40 ? text.slice(0, 40) + '…' : text || `#${index + 1}`;
}

// Find the array most worth charting: the value itself if it's an array, otherwise its
// largest array-valued property. Shares one helper with gridRows so the Table and Chart
// views can never disagree about which array a payload is "really" about.
function coerceRows(value: unknown): unknown[] | null {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') {
    return largestArrayProperty(value as Record<string, unknown>);
  }
  return null;
}

function frequency(items: unknown[]): VizBar[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = item == null ? 'null' : typeof item === 'object' ? '[object]' : String(item);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value, negative: false }));
}

function fromObjects(rows: Array<Record<string, unknown>>): VizSpec | null {
  const numericCoverage = new Map<string, number>();
  const stringFields: string[] = [];
  const seenString = new Set<string>();
  for (const row of rows) {
    for (const [key, val] of Object.entries(row)) {
      if (isNumber(val)) numericCoverage.set(key, (numericCoverage.get(key) || 0) + 1);
      else if (typeof val === 'string' && !seenString.has(key)) { seenString.add(key); stringFields.push(key); }
    }
  }
  const bestNumeric = Array.from(numericCoverage.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
  const labelField = stringFields[0];

  if (bestNumeric) {
    const bars = rows
      .filter((row) => isNumber(row[bestNumeric]))
      .slice(0, MAX_BARS)
      .map((row, index) => {
        const value = row[bestNumeric] as number;
        return { label: labelField ? labelFor(row[labelField], index) : `#${index + 1}`, value, negative: value < 0 };
      });
    if (!bars.length) return null;
    const numericTotal = rows.filter((row) => isNumber(row[bestNumeric])).length;
    return {
      kind: 'bars',
      title: `${bestNumeric} across ${numericTotal} rows`,
      subtitle: labelField ? `Labeled by ${labelField}` : undefined,
      bars,
      truncated: Math.max(0, numericTotal - bars.length),
      maxAbs: Math.max(...bars.map((bar) => Math.abs(bar.value)), 0),
    };
  }

  if (labelField) {
    const categories = frequency(rows.map((row) => row[labelField]));
    const bars = categories.slice(0, MAX_BARS);
    return {
      kind: 'bars',
      title: `Distribution of ${labelField}`,
      subtitle: `${rows.length} rows`,
      bars,
      truncated: Math.max(0, categories.length - bars.length),
      maxAbs: Math.max(...bars.map((bar) => bar.value), 0),
    };
  }
  return null;
}

export function buildVizSpec(value: unknown): VizSpec {
  const none = (title: string): VizSpec => ({ kind: 'none', title, bars: [], truncated: 0, maxAbs: 0 });
  const rows = coerceRows(value);

  if (rows && rows.length) {
    if (rows.every(isNumber)) {
      const bars = (rows as number[]).slice(0, MAX_BARS).map((num, index) => ({ label: `#${index + 1}`, value: num, negative: num < 0 }));
      return { kind: 'bars', title: `${rows.length} values`, bars, truncated: Math.max(0, rows.length - bars.length), maxAbs: Math.max(...bars.map((bar) => Math.abs(bar.value)), 0) };
    }
    if (rows.every((row) => row && typeof row === 'object' && !Array.isArray(row))) {
      const spec = fromObjects(rows as Array<Record<string, unknown>>);
      if (spec) return spec;
    }
    if (rows.every((row) => row == null || typeof row !== 'object')) {
      const categories = frequency(rows);
      const bars = categories.slice(0, MAX_BARS);
      return { kind: 'bars', title: `Distribution of ${rows.length} values`, bars, truncated: Math.max(0, categories.length - bars.length), maxAbs: Math.max(...bars.map((bar) => bar.value), 0) };
    }
    return none('This array has no numeric or categorical field to chart.');
  }

  if (value && typeof value === 'object') {
    const numericEntries = Object.entries(value as Record<string, unknown>).filter(([, val]) => isNumber(val));
    if (numericEntries.length) {
      const bars = numericEntries.slice(0, MAX_BARS).map(([key, val]) => ({ label: key, value: val as number, negative: (val as number) < 0 }));
      return { kind: 'bars', title: `${numericEntries.length} numeric fields`, bars, truncated: Math.max(0, numericEntries.length - bars.length), maxAbs: Math.max(...bars.map((bar) => Math.abs(bar.value)), 0) };
    }
    return none('No numeric fields in this object to chart.');
  }

  if (isNumber(value)) {
    return { kind: 'bars', title: 'Single value', bars: [{ label: 'value', value, negative: value < 0 }], truncated: 0, maxAbs: Math.abs(value) };
  }
  return none('Select a response with arrays or numbers to visualize.');
}

export function formatVizValue(value: number): string {
  if (Number.isInteger(value)) return value.toLocaleString('en-US');
  if (Math.abs(value) >= 1000) return value.toLocaleString('en-US', { maximumFractionDigits: 1 });
  return String(Number(value.toFixed(3)));
}
