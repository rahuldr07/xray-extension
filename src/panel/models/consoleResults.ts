export type ResultKind = 'scalar' | 'text' | 'table' | 'tree';

export interface ResultDescription {
  kind: ResultKind;
  badge: string;
  big: boolean;
  bytes: number;
  count: number | null;
  summary: string;
  columns: string[];
}

export const BIG_ITEM_LIMIT = 50;
export const BIG_BYTES_LIMIT = 20 * 1024;
export const TEXT_CHAR_LIMIT = 120;
export const TABLE_MAX_COLUMNS = 12;
export const TABLE_SAMPLE = 20;
export const TABLE_MAX_ROWS = 100;
const SUMMARY_LIMIT = 80;

/**
 * Console size label ("25 kb"). Deliberately not the shared utils.formatBytes,
 * which renders "25.0kb" and is used by the Network-style size columns.
 */
export function formatResultBytes(n: number): string {
  const bytes = Number(n) || 0;
  if (bytes >= 1024 * 1024) return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} mb`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} kb`;
  return `${bytes} b`;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export function tableColumns(rows: unknown[]): string[] | null {
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const sample = rows.slice(0, TABLE_SAMPLE);
  const objects = sample.filter(isPlainObject);
  if (objects.length / sample.length < 0.8) return null;
  const columns: string[] = [];
  const seen = new Set<string>();
  for (const row of objects) {
    for (const key of Object.keys(row)) {
      if (seen.has(key)) continue;
      seen.add(key);
      columns.push(key);
    }
  }
  if (!columns.length) return null;
  return columns.slice(0, TABLE_MAX_COLUMNS);
}

function serializedLength(value: unknown): number {
  if (typeof value === 'string') return value.length;
  try {
    const json = JSON.stringify(value);
    return json === undefined ? 0 : json.length;
  } catch {
    return 0;
  }
}

function clip(text: string, limit = SUMMARY_LIMIT): string {
  return text.length > limit ? text.slice(0, limit - 1) + '…' : text;
}

function shortValue(value: unknown): string {
  if (Array.isArray(value)) return `Array(${value.length})`;
  if (value === null) return 'null';
  if (typeof value === 'object') return '{…}';
  if (typeof value === 'string') return JSON.stringify(value.length > 16 ? value.slice(0, 15) + '…' : value);
  return String(value);
}

function summarize(value: unknown): string {
  if (Array.isArray(value)) {
    const head = `Array(${value.length})`;
    if (!value.length) return head + ' []';
    let text = head + ' [';
    for (let i = 0; i < value.length && i < 3; i++) {
      const piece = shortValue(value[i]);
      if (text.length + piece.length + 6 > SUMMARY_LIMIT) break;
      text += (i ? ', ' : ' ') + piece;
    }
    return clip(text + (value.length > 3 ? ', … ]' : ' ]'));
  }
  if (value !== null && typeof value === 'object') {
    const keys = Object.keys(value);
    if (!keys.length) return '{}';
    const bag = value as Record<string, unknown>;
    let text = '{';
    let shown = 0;
    for (const key of keys) {
      const piece = `${key}: ${shortValue(bag[key])}`;
      if (text.length + piece.length + 7 > SUMMARY_LIMIT) break;
      text += (shown ? ', ' : ' ') + piece;
      shown++;
    }
    return clip(text + (shown < keys.length ? ', … }' : ' }'));
  }
  if (typeof value === 'string') return clip(JSON.stringify(value));
  return String(value);
}

function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

export function describeResult(value: unknown, type: string): ResultDescription {
  const isArray = Array.isArray(value);
  const isObject = !isArray && value !== null && typeof value === 'object';
  const bytes = serializedLength(value);

  if (isArray || isObject) {
    const count = isArray ? (value as unknown[]).length : Object.keys(value as object).length;
    const columns = isArray ? tableColumns(value as unknown[]) : null;
    const label = isArray ? `array · ${plural(count, 'item', 'items')}` : `object · ${plural(count, 'key', 'keys')}`;
    return {
      kind: columns ? 'table' : 'tree',
      badge: bytes >= 1024 ? `${label} · ${formatResultBytes(bytes)}` : label,
      big: count > BIG_ITEM_LIMIT || bytes > BIG_BYTES_LIMIT,
      bytes,
      count,
      summary: summarize(value),
      columns: columns ?? [],
    };
  }

  if (typeof value === 'string') {
    const long = value.length > TEXT_CHAR_LIMIT;
    const label = `string · ${plural(value.length, 'char', 'chars')}`;
    return {
      kind: long ? 'text' : 'scalar',
      badge: bytes >= 1024 ? `${label} · ${formatResultBytes(bytes)}` : label,
      big: bytes > BIG_BYTES_LIMIT,
      bytes,
      count: value.length,
      summary: clip(JSON.stringify(value)),
      columns: [],
    };
  }

  const badge = value === null ? 'null' : value === undefined ? 'undefined' : (typeof value === 'number' || typeof value === 'boolean') ? typeof value : (type || typeof value);
  return {
    kind: 'scalar',
    badge,
    big: false,
    bytes,
    count: null,
    summary: String(value),
    columns: [],
  };
}
