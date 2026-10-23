// The SQL page's resizable layout: the editor's share of the editor+results column and the schema
// rail's width, clamped and stored as `sql_layout`. Pure logic; keep React and the runtime out.

export const SQL_LAYOUT_KEY = 'sql_layout';

export interface SqlLayout {
  editorPct: number;
  railPx: number;
}

export const DEFAULT_SQL_LAYOUT: SqlLayout = { editorPct: 30, railPx: 220 };
export const EDITOR_PCT_MIN = 15;
export const EDITOR_PCT_MAX = 75;
export const RAIL_PX_MIN = 160;
export const RAIL_PX_MAX = 420;
/** One arrow-key step of either divider, in pixels. */
export const DIVIDER_STEP_PX = 24;

function clamp(n: number, min: number, max: number, fallback: number): number {
  if (typeof n !== 'number' || !Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export function clampEditorPct(pct: number): number {
  return clamp(pct, EDITOR_PCT_MIN, EDITOR_PCT_MAX, DEFAULT_SQL_LAYOUT.editorPct);
}

export function clampRailPx(px: number): number {
  return Math.round(clamp(px, RAIL_PX_MIN, RAIL_PX_MAX, DEFAULT_SQL_LAYOUT.railPx));
}

/** A stored value (anything, possibly from an older or newer build) as a valid layout. */
export function restoreLayout(raw: unknown): SqlLayout {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ...DEFAULT_SQL_LAYOUT };
  const value = raw as Record<string, unknown>;
  return {
    editorPct: clampEditorPct(value.editorPct as number),
    railPx: clampRailPx(value.railPx as number),
  };
}

/** The editor share after moving the divider by `deltaPx` in a column `heightPx` tall. */
export function editorPctAfter(pct: number, deltaPx: number, heightPx: number): number {
  if (!(heightPx > 0)) return clampEditorPct(pct);
  return clampEditorPct(pct + (deltaPx / heightPx) * 100);
}
