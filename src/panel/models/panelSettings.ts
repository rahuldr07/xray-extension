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
  // The persisted `blue` ID is retained for compatibility, but Signal Gray's
  // default instrument accent is amber rather than neon cyan.
  blue: '#d99a2b',
  mauve: '#cba6f7',
  teal: '#94e2d5',
  green: '#a6e3a1',
  peach: '#ffd166',
  coral: '#eaa388',
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
 * These darker equivalents read as text on their own badge / primary-button tint in both
 * light presets (test/unit/themeContrast.test.mjs asserts every swatch).
 */
export const PANEL_ACCENT_VALUES_LIGHT: Record<PanelAccent, string> = {
  blue: '#845600',
  mauve: '#7418ec',
  teal: '#0d696e',
  green: '#226d15',
  peach: '#865100',
  coral: '#a23f1e',
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
  // A custom theme's explicit accent is authoritative. Keeping the legacy
  // accent enum in front of it caused the editor to display one color while
  // the panel and sibling modals rendered another.
  if (settings.theme === 'custom') return settings.customTheme?.accent ?? DEFAULT_CUSTOM_THEME.accent;
  const palette = isLightTheme(settings) ? PANEL_ACCENT_VALUES_LIGHT : PANEL_ACCENT_VALUES;
  return palette[settings.accent] ?? palette.blue;
}

export const PANEL_FONT_VALUES: Record<PanelFont, string> = {
  jetbrains: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
  cascadia: "'Cascadia Code', 'Cascadia Mono', 'JetBrains Mono', monospace",
  iosevka: "'Iosevka', 'JetBrains Mono', 'Fira Code', monospace",
  system: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
};

/** The accent each preset theme applies while the user has never picked one. */
export const THEME_DEFAULT_ACCENT: Partial<Record<PanelTheme, PanelAccent>> = {
  operator: 'blue',
  'dev-edition': 'coral',
  'light-lab': 'blue',
  midnight: 'peach',
  claude: 'coral',
};

export function themeDefaultAccent(theme: PanelTheme): PanelAccent {
  return THEME_DEFAULT_ACCENT[theme] ?? DEFAULT_PANEL_SETTINGS.accent;
}

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
  accentChosen: false,
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
  firstRunDismissed: false,
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
  // An explicit `key: undefined` in the input used to SHADOW the default through the
  // spread, and Boolean(undefined) is false — so every boolean defaulting to true
  // (captureFetch, captureXhr, showHostInPath, glow, confirmDestructiveActions)
  // silently switched off on a partial in-memory update. JSON-persisted preferences
  // never hit it because JSON.stringify drops undefined; in-memory callers did.
  const provided = Object.fromEntries(
    Object.entries(input || {}).filter(([, value]) => value !== undefined),
  ) as Partial<PanelSettings>;
  const base = { ...DEFAULT_PANEL_SETTINGS, ...provided };
  const theme = asTheme(base.theme, DEFAULT_PANEL_SETTINGS.theme);
  const accent = asAccent(base.accent, DEFAULT_PANEL_SETTINGS.accent);
  // Settings stored before accentChosen existed: the accent counts as chosen only when
  // it differs from what the current theme would have set itself.
  const accentChosen = typeof provided.accentChosen === 'boolean'
    ? provided.accentChosen
    : accent !== themeDefaultAccent(theme);
  return {
    captureFetch: Boolean(base.captureFetch),
    captureXhr: Boolean(base.captureXhr),
    // (captureWs carried a bespoke undefined guard; the filter above now covers all of them.)
    captureWs: Boolean(base.captureWs),
    maxEntries: clampNumber(base.maxEntries, DEFAULT_PANEL_SETTINGS.maxEntries, 50, 5000),
    slowThresholdMs: clampNumber(base.slowThresholdMs, DEFAULT_PANEL_SETTINGS.slowThresholdMs, 100, 5000),
    verySlowThresholdMs: clampNumber(base.verySlowThresholdMs, DEFAULT_PANEL_SETTINGS.verySlowThresholdMs, 200, 10000),
    defaultDetailView: asDetailView(base.defaultDetailView, DEFAULT_PANEL_SETTINGS.defaultDetailView),
    compactRows: Boolean(base.compactRows),
    showHostInPath: Boolean(base.showHostInPath),
    accent,
    accentChosen,
    theme,
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
    firstRunDismissed: Boolean(base.firstRunDismissed),
  };
}
