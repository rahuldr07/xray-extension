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

/**
 * Accents for light backgrounds.
 *
 * The values above are pastels chosen for the dark themes, and the accent is applied as
 * an INLINE custom property, so it outranks every `.xray-theme-*` block and followed the
 * user onto Light Lab and Claude unchanged. Measured there, the pastels land at 1.33–2.80
 * contrast: the primary button reads as blank, and the focus ring — which needs 3:1 under
 * WCAG 1.4.11 — becomes untrackable, so keyboard focus is effectively invisible.
 *
 * These darker equivalents measure 3.79–4.85 against both light theme backgrounds.
 */
export const PANEL_ACCENT_VALUES_LIGHT: Record<PanelAccent, string> = {
  blue: '#1e66f5',
  mauve: '#8839ef',
  teal: '#0f7a80',
  green: '#2f8a1f',
  peach: '#c4560a',
  coral: '#b84a24',
};

const LIGHT_PRESETS: ReadonlySet<PanelTheme> = new Set<PanelTheme>(['light-lab', 'claude']);

// Relative luminance, so a custom theme is classified by its actual background rather
// than by name. Kept local to avoid importing the colour module for four lines.
function isLightHex(hex: string): boolean {
  const value = hex.replace('#', '');
  if (value.length !== 6) return false;
  const channels = [0, 2, 4].map((i) => {
    const c = parseInt(value.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const [r, g, b] = channels as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.35;
}

export function isLightTheme(settings: PanelSettings): boolean {
  if (settings.theme === 'custom') return isLightHex(settings.customTheme?.bg ?? '');
  return LIGHT_PRESETS.has(settings.theme);
}

/** The accent actually applied as `--xray-accent`, darkened for light backgrounds. */
export function resolveAccentValue(settings: PanelSettings): string {
  const palette = isLightTheme(settings) ? PANEL_ACCENT_VALUES_LIGHT : PANEL_ACCENT_VALUES;
  return palette[settings.accent] ?? palette.blue;
}

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
  apiSplit: 0,
  logsSplit: 0,
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
    // 0 = automatic (the CSS grid's default track sizing); any other value is a
    // user-dragged split width in px.
    apiSplit: clampNumber(base.apiSplit, DEFAULT_PANEL_SETTINGS.apiSplit, 0, 2000),
    logsSplit: clampNumber(base.logsSplit, DEFAULT_PANEL_SETTINGS.logsSplit, 0, 2000),
  };
}
