import type { DetailView, PanelAccent, PanelDensity, PanelFont, PanelSettings, PanelTheme } from '../types';

const DETAIL_VIEWS: DetailView[] = ['tree', 'grid', 'raw', 'schema', 'diff', 'viz', 'waterfall', 'headers'];
const ACCENTS: PanelAccent[] = ['blue', 'mauve', 'teal', 'green', 'peach'];
const THEMES: PanelTheme[] = ['operator', 'dev-edition', 'midnight', 'light-lab'];
const FONTS: PanelFont[] = ['jetbrains', 'cascadia', 'iosevka', 'system'];
const DENSITIES: PanelDensity[] = ['compact', 'comfortable', 'spacious'];

export const PANEL_ACCENT_VALUES: Record<PanelAccent, string> = {
  blue: '#89b4fa',
  mauve: '#cba6f7',
  teal: '#94e2d5',
  green: '#a6e3a1',
  peach: '#fab387',
};

export const PANEL_FONT_VALUES: Record<PanelFont, string> = {
  jetbrains: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
  cascadia: "'Cascadia Code', 'Cascadia Mono', 'JetBrains Mono', monospace",
  iosevka: "'Iosevka', 'JetBrains Mono', 'Fira Code', monospace",
  system: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
};

export const DEFAULT_PANEL_SETTINGS: PanelSettings = {
  captureFetch: true,
  captureXhr: true,
  maxEntries: 1000,
  slowThresholdMs: 500,
  verySlowThresholdMs: 1000,
  defaultDetailView: 'tree',
  compactRows: false,
  showHostInPath: true,
  accent: 'blue',
  theme: 'operator',
  font: 'jetbrains',
  density: 'compact',
  glow: true,
  confirmDestructiveActions: true,
};

function clampNumber(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function asDetailView(value: unknown, fallback: DetailView): DetailView {
  return DETAIL_VIEWS.includes(value as DetailView) ? value as DetailView : fallback;
}

function asAccent(value: unknown, fallback: PanelAccent): PanelAccent {
  return ACCENTS.includes(value as PanelAccent) ? value as PanelAccent : fallback;
}

function asTheme(value: unknown, fallback: PanelTheme): PanelTheme {
  return THEMES.includes(value as PanelTheme) ? value as PanelTheme : fallback;
}

function asFont(value: unknown, fallback: PanelFont): PanelFont {
  return FONTS.includes(value as PanelFont) ? value as PanelFont : fallback;
}

function asDensity(value: unknown, fallback: PanelDensity): PanelDensity {
  return DENSITIES.includes(value as PanelDensity) ? value as PanelDensity : fallback;
}

export function normalizePanelSettings(input: Partial<PanelSettings> | undefined): PanelSettings {
  const base = { ...DEFAULT_PANEL_SETTINGS, ...(input || {}) };
  return {
    captureFetch: Boolean(base.captureFetch),
    captureXhr: Boolean(base.captureXhr),
    maxEntries: clampNumber(base.maxEntries, DEFAULT_PANEL_SETTINGS.maxEntries, 50, 5000),
    slowThresholdMs: clampNumber(base.slowThresholdMs, DEFAULT_PANEL_SETTINGS.slowThresholdMs, 100, 5000),
    verySlowThresholdMs: clampNumber(base.verySlowThresholdMs, DEFAULT_PANEL_SETTINGS.verySlowThresholdMs, 200, 10000),
    defaultDetailView: asDetailView(base.defaultDetailView, DEFAULT_PANEL_SETTINGS.defaultDetailView),
    compactRows: Boolean(base.compactRows),
    showHostInPath: Boolean(base.showHostInPath),
    accent: asAccent(base.accent, DEFAULT_PANEL_SETTINGS.accent),
    theme: asTheme(base.theme, DEFAULT_PANEL_SETTINGS.theme),
    font: asFont(base.font, DEFAULT_PANEL_SETTINGS.font),
    density: asDensity(base.density, DEFAULT_PANEL_SETTINGS.density),
    glow: Boolean(base.glow),
    confirmDestructiveActions: Boolean(base.confirmDestructiveActions),
  };
}
