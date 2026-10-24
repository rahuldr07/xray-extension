import type { DetailView, DockSide, PanelAccent, PanelDensity, PanelFont, PanelSettings, PanelTheme } from '../types';
import { DEFAULT_CUSTOM_THEME, normalizeCustomTheme, solveThemeAccent } from './customTheme';
import { clampNumber } from '../utils';

export type ThemeKind = 'dark' | 'light';

export interface ThemePreset {
  id: Exclude<PanelTheme, 'custom'>;
  label: string;
  kind: ThemeKind;
  /** The text contrast the preset is held to (High Contrast: 7:1), and a picked accent with it. */
  contrast: 4.5 | 7;
  /** The preset's own --xray-bg / --xray-accent / --xray-text, for the picker swatch. */
  preview: { bg: string; accent: string; text: string };
  /** Its --xray-surface / --xray-surface2 / --xray-mauve: what a picked accent swatch is solved against. */
  hosts: { surface: string; surface2: string; mauve: string };
}

/**
 * The preset lineup, in picker order (Custom follows, from the user's own theme). The
 * single source for the Appearance picker, isLightTheme, the accent solve and the tests:
 * each preview and host is its `.xray-theme-<id>` block's value in styles.css
 * (test/unit/themePresets.test.mjs).
 */
export const THEME_PRESETS: readonly ThemePreset[] = [
  { id: 'xray-dark', label: 'XRAY Dark', kind: 'dark', contrast: 4.5, preview: { bg: '#141517', accent: '#3dc8f5', text: '#eeeff1' }, hosts: { surface: '#1b1c1f', surface2: '#25272a', mauve: '#c6a0f2' } },
  { id: 'xray-light', label: 'XRAY Light', kind: 'light', contrast: 4.5, preview: { bg: '#f3f4f6', accent: '#00698f', text: '#16171a' }, hosts: { surface: '#ffffff', surface2: '#eaecef', mauve: '#793fad' } },
  { id: 'github-dark', label: 'GitHub Dark', kind: 'dark', contrast: 4.5, preview: { bg: '#0d1117', accent: '#5297ff', text: '#e6edf3' }, hosts: { surface: '#161b22', surface2: '#21262d', mauve: '#ad7fff' } },
  { id: 'github-light', label: 'GitHub Light', kind: 'light', contrast: 4.5, preview: { bg: '#f6f8fa', accent: '#005eca', text: '#1f2328' }, hosts: { surface: '#ffffff', surface2: '#eaeef2', mauve: '#723cca' } },
  { id: 'tokyo-night', label: 'Tokyo Night', kind: 'dark', contrast: 4.5, preview: { bg: '#16161e', accent: '#7ba4f9', text: '#c0caf5' }, hosts: { surface: '#1a1b26', surface2: '#292e42', mauve: '#bb9af7' } },
  { id: 'catppuccin-mocha', label: 'Catppuccin Mocha', kind: 'dark', contrast: 4.5, preview: { bg: '#181825', accent: '#cba6f7', text: '#cdd6f4' }, hosts: { surface: '#1e1e2e', surface2: '#313244', mauve: '#f5c2e7' } },
  { id: 'dracula', label: 'Dracula', kind: 'dark', contrast: 4.5, preview: { bg: '#21222c', accent: '#c59dff', text: '#f8f8f2' }, hosts: { surface: '#282a36', surface2: '#343746', mauve: '#ff86ca' } },
  { id: 'gruvbox-dark', label: 'Gruvbox Dark', kind: 'dark', contrast: 4.5, preview: { bg: '#1d2021', accent: '#8ec07c', text: '#ebdbb2' }, hosts: { surface: '#282828', surface2: '#3c3836', mauve: '#ea9bb0' } },
  { id: 'midnight', label: 'High Contrast', kind: 'dark', contrast: 7, preview: { bg: '#000000', accent: '#00e5ff', text: '#ffffff' }, hosts: { surface: '#101010', surface2: '#1d1d1d', mauve: '#d4a8ff' } },
];

/** Preset ids from before the lineup (spec V2): stored settings may still name them; nothing renders them. */
export type RetiredTheme = 'operator' | 'dev-edition' | 'light-lab' | 'claude';

/** Each retired preset, the lineup preset it now loads as, and the accent it applied by default (spec V2). */
export const RETIRED_THEMES: Readonly<Record<RetiredTheme, { to: Exclude<PanelTheme, 'custom'>; accent: PanelAccent }>> = {
  operator: { to: 'xray-dark', accent: 'blue' }, // Signal Gray
  'dev-edition': { to: 'xray-dark', accent: 'coral' }, // Harbor Instrument
  'light-lab': { to: 'xray-light', accent: 'blue' }, // Paper Relay
  claude: { to: 'xray-light', accent: 'coral' }, // Claude
};

/** The retired preset a stored theme value names, if it is one. */
export function retiredTheme(value: unknown): RetiredTheme | null {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(RETIRED_THEMES, value) ? value as RetiredTheme : null;
}

const THEME_LABELS = {
  ...Object.fromEntries(THEME_PRESETS.map(({ id, label }) => [id, label])),
  custom: 'Custom',
} as Record<PanelTheme, string>;

/**
 * The theme-refresh notice (spec V2), worded when it is shown: it names the theme the user is on
 * then, which another surface may have changed since the migration raised it.
 */
export function themeRefreshNotice(theme: PanelTheme): string {
  return `Themes were refreshed — you're on ${THEME_LABELS[theme]}. Change it in Settings → Appearance.`;
}

const THEME_KINDS: ReadonlyMap<PanelTheme, ThemeKind> = new Map(THEME_PRESETS.map(({ id, kind }) => [id, kind]));

const DETAIL_VIEWS: DetailView[] = ['tree', 'grid', 'raw', 'schema', 'diff', 'viz', 'waterfall', 'headers'];
const ACCENTS: PanelAccent[] = ['blue', 'mauve', 'teal', 'green', 'peach', 'coral'];
const THEMES: PanelTheme[] = [...THEME_KINDS.keys(), 'custom'];
const FONTS: PanelFont[] = ['jetbrains', 'cascadia', 'iosevka', 'system'];
const DENSITIES: PanelDensity[] = ['compact', 'comfortable', 'spacious'];
const DOCK_SIDES: DockSide[] = ['left', 'right'];

// Bounds for the resizable side panel (px). Upper bound is generous; CSS also
// caps it at 96vw so it can never fully hide the page on a small viewport.
export const PANEL_WIDTH_MIN = 360;
export const PANEL_WIDTH_MAX = 2000;

export const PANEL_ACCENT_VALUES: Record<PanelAccent, string> = {
  // The persisted `blue` ID is retained for compatibility; the swatch it names is
  // Amber (settingsLabels.ts ACCENT_NAMES), not blue.
  blue: '#d99a2b',
  mauve: '#cba6f7',
  teal: '#94e2d5',
  green: '#a6e3a1',
  peach: '#f2d457',
  coral: '#eaa388',
};

/**
 * Accents for light backgrounds.
 *
 * The values above are pastels chosen for the dark themes, and a picked accent is applied
 * as an INLINE custom property, so it outranks every `.xray-theme-*` block. On the light
 * presets the pastels land at 1.33–2.80 contrast: the primary button reads as blank, and
 * the focus ring — which needs 3:1 under WCAG 1.4.11 — becomes untrackable, so keyboard
 * focus is effectively invisible.
 *
 * These darker equivalents read as text on their own badge / primary-button tint in every
 * light preset (test/unit/themeContrast.test.mjs asserts every swatch).
 */
export const PANEL_ACCENT_VALUES_LIGHT: Record<PanelAccent, string> = {
  blue: '#845600',
  mauve: '#7418ec',
  teal: '#0d696e',
  green: '#226d15',
  peach: '#6e6200',
  coral: '#a23f1e',
};

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
  return THEME_KINDS.get(settings.theme) === 'light';
}

// Swatches solved per preset, by `${theme}:${accent}` (the solve is pure, so once is enough).
const solvedSwatches = new Map<string, string>();

/**
 * What the accent swatch `accent` paints on the active theme: on a preset, the swatch for its
 * kind moved in OKLCH lightness only (solveThemeAccent, hue kept) until it reads on that
 * preset's own surfaces at the preset's contrast target, so every swatch works on every preset
 * (spec P2). On a custom theme, the dark swatch the Accent row writes into it.
 */
export function accentSwatchValue(settings: PanelSettings, accent: PanelAccent): string {
  const preset = THEME_PRESETS.find(({ id }) => id === settings.theme);
  if (!preset) return PANEL_ACCENT_VALUES[accent] ?? PANEL_ACCENT_VALUES.blue;
  const key = `${preset.id}:${accent}`;
  let value = solvedSwatches.get(key);
  if (!value) {
    const palette = preset.kind === 'light' ? PANEL_ACCENT_VALUES_LIGHT : PANEL_ACCENT_VALUES;
    const swatch = palette[accent] ?? palette.blue;
    value = solveThemeAccent({ bg: preset.preview.bg, text: preset.preview.text, accent: swatch, ...preset.hosts }, preset.contrast + 0.01).accent;
    solvedSwatches.set(key, value);
  }
  return value;
}

/**
 * The inline `--xray-accent`, or undefined when the theme's own accent applies. A preset owns
 * its accent (its `.xray-theme-*` block) until the user picks a swatch (spec P2); a custom
 * theme's explicit accent is authoritative — keeping the legacy accent enum in front of it
 * made the editor display one colour while the panel and sibling modals rendered another.
 */
export function resolveAccentValue(settings: PanelSettings): string | undefined {
  if (settings.theme === 'custom') return settings.customTheme?.accent ?? DEFAULT_CUSTOM_THEME.accent;
  return settings.accentChosen ? accentSwatchValue(settings, settings.accent) : undefined;
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
  accentChosen: false,
  theme: 'xray-dark',
  customTheme: DEFAULT_CUSTOM_THEME,
  font: 'jetbrains',
  density: 'compact',
  radius: 10,
  // Opt-in (spec A3): off for new installs and Reset; a stored value is kept.
  glow: false,
  hacker: false,
  confirmDestructiveActions: true,
  panelWidth: 960,
  dockSide: 'right',
  apiSplit: 0,
  logsSplit: 0,
  firstRunDismissed: false,
  themeRefreshPending: false,
  // Opt-in: off for new installs, Reset and settings stored before the option existed.
  sqlInlineInHud: false,
  // Opt-in under sqlInlineInHud: saved database connections inside the page HUD.
  sqlDatabasesInHud: false,
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
  const accentValid = ACCENTS.includes(base.accent);
  const accent = asAccent(base.accent, DEFAULT_PANEL_SETTINGS.accent);
  // Settings stored before the theme refresh carry no themeRefreshPending (nor do none at all).
  const legacy = typeof provided.themeRefreshPending !== 'boolean';
  // A retired preset loads as its replacement (spec V2; the stored value is rewritten at once).
  const retired = retiredTheme(base.theme);
  const theme = retired ? RETIRED_THEMES[retired].to : asTheme(base.theme, DEFAULT_PANEL_SETTINGS.theme);
  // The accent a theme used to set itself hands over to the theme's own accent: a retired
  // preset's default, and Gold on High Contrast from before the refresh (its accent is a cyan
  // now). Any other valid accent was a pick, so it stays, whatever the stored flag says; a
  // corrupt one is no pick. Settings from before accentChosen existed name only an accent,
  // which counted as picked when it differed from Amber, the default everywhere else.
  const formerDefault = retired ? RETIRED_THEMES[retired].accent : legacy && theme === 'midnight' ? 'peach' : null;
  const accentChosen = formerDefault ? accentValid && accent !== formerDefault
    : typeof provided.accentChosen === 'boolean' ? provided.accentChosen
      : accent !== DEFAULT_PANEL_SETTINGS.accent;
  // A migration that changes what the user sees raises the refresh notice; only dismissing it clears it.
  const themeRefreshPending = Boolean(base.themeRefreshPending) || retired !== null || (formerDefault !== null && !accentChosen);
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
    themeRefreshPending,
    sqlInlineInHud: Boolean(base.sqlInlineInHud),
    sqlDatabasesInHud: Boolean(base.sqlDatabasesInHud),
  };
}

/** Saved database connections are allowed in the HUD's inline client only with both options on. */
export function sqlDatabasesInHudActive(settings: Pick<PanelSettings, 'sqlInlineInHud' | 'sqlDatabasesInHud'>): boolean {
  return settings.sqlInlineInHud && settings.sqlDatabasesInHud;
}
