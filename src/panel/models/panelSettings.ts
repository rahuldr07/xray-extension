import type { DetailView, DockSide, PanelAccent, PanelDensity, PanelFont, PanelSettings, PanelTheme } from '../types';
import { DEFAULT_CUSTOM_THEME, normalizeCustomTheme } from './customTheme';
import { clampNumber } from '../utils';

const DETAIL_VIEWS: DetailView[] = ['tree', 'grid', 'raw', 'schema', 'diff', 'viz', 'waterfall', 'headers'];
const ACCENTS: PanelAccent[] = ['blue', 'mauve', 'teal', 'green', 'peach', 'coral'];
const THEMES: PanelTheme[] = ['operator', 'dev-edition', 'midnight', 'light-lab', 'claude', 'custom'];
const FONTS: PanelFont[] = ['jetbrains', 'cascadia', 'iosevka', 'system'];
const DENSITIES: PanelDensity[] = ['compact', 'comfortable', 'spacious'];
const DOCK_SIDES: DockSide[] = ['left', 'right'];

// Bounds for the resizable side panel (px). Upper bound is generous; CSS also
// caps it at 96vw so it can never fully hide the page on a small viewport.
export const PANEL_WIDTH_MIN = 360;
export const PANEL_WIDTH_MAX = 2000;

export const PANEL_ACCENT_VALUES: Record<PanelAccent, string> = {
  blue: '#89b4fa',
  mauve: '#cba6f7',
  teal: '#94e2d5',
  green: '#a6e3a1',
  peach: '#fab387',
  coral: '#d97757',
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
  captureWs: true,
  maxEntries: 1000,
  slowThresholdMs: 500,
  verySlowThresholdMs: 1000,
  defaultDetailView: 'tree',
  compactRows: false,
  showHostInPath: true,
  accent: 'blue',
  theme: 'operator',
  customTheme: DEFAULT_CUSTOM_THEME,
  font: 'jetbrains',
  density: 'compact',
  radius: 10,
  glow: true,
  hacker: false,
  confirmDestructiveActions: true,
  panelWidth: 960,
  dockSide: 'right',
};

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

function asDockSide(value: unknown, fallback: DockSide): DockSide {
  return DOCK_SIDES.includes(value as DockSide) ? value as DockSide : fallback;
}

export function normalizePanelSettings(input: Partial<PanelSettings> | undefined): PanelSettings {
  const base = { ...DEFAULT_PANEL_SETTINGS, ...(input || {}) };
  return {
    captureFetch: Boolean(base.captureFetch),
    captureXhr: Boolean(base.captureXhr),
    captureWs: base.captureWs === undefined ? true : Boolean(base.captureWs),
    maxEntries: clampNumber(base.maxEntries, DEFAULT_PANEL_SETTINGS.maxEntries, 50, 5000),
    slowThresholdMs: clampNumber(base.slowThresholdMs, DEFAULT_PANEL_SETTINGS.slowThresholdMs, 100, 5000),
    verySlowThresholdMs: clampNumber(base.verySlowThresholdMs, DEFAULT_PANEL_SETTINGS.verySlowThresholdMs, 200, 10000),
    defaultDetailView: asDetailView(base.defaultDetailView, DEFAULT_PANEL_SETTINGS.defaultDetailView),
    compactRows: Boolean(base.compactRows),
    showHostInPath: Boolean(base.showHostInPath),
    accent: asAccent(base.accent, DEFAULT_PANEL_SETTINGS.accent),
    theme: asTheme(base.theme, DEFAULT_PANEL_SETTINGS.theme),
    customTheme: normalizeCustomTheme(base.customTheme),
    font: asFont(base.font, DEFAULT_PANEL_SETTINGS.font),
    density: asDensity(base.density, DEFAULT_PANEL_SETTINGS.density),
    radius: clampNumber(base.radius, DEFAULT_PANEL_SETTINGS.radius, 0, 20),
    glow: Boolean(base.glow),
    hacker: Boolean(base.hacker),
    confirmDestructiveActions: Boolean(base.confirmDestructiveActions),
    panelWidth: clampNumber(base.panelWidth, DEFAULT_PANEL_SETTINGS.panelWidth, PANEL_WIDTH_MIN, PANEL_WIDTH_MAX),
    dockSide: asDockSide(base.dockSide, DEFAULT_PANEL_SETTINGS.dockSide),
  };
}
