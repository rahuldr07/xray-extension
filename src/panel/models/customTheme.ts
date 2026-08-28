import type { CustomTheme, PanelFont } from '../types';

// A shadcn-style custom theme: the user picks four colors (background, surface,
// text, accent) and everything else — elevated surfaces, muted text, borders,
// translucent-surface RGB triples, and readable status colors — is derived so the
// result is always coherent and legible on both light and dark backgrounds.
//
// The output is a plain map of CSS custom properties. It is applied as INLINE
// styles on `.xray-panel` only, so a custom theme is fully scoped to the panel UI
// and can never touch the host page or the extension's capture runtime.

export const DEFAULT_CUSTOM_THEME: CustomTheme = {
  bg: '#0f1117',
  surface: '#171a23',
  text: '#e7e9f0',
  accent: '#7c5cff',
};

// The four colors that must always be present (a theme is coherent from these alone).
export const BASE_KEYS = ['bg', 'surface', 'text', 'accent'] as const;
// Every token the UI paints. Anything past the base four is an optional override
// that defaults to a derived value — this is what makes editing "full freedom".
export const TOKEN_KEYS = [
  'bg', 'surface', 'surface2', 'surface3',
  'text', 'subtext', 'hint', 'border',
  'accent',
  'green', 'red', 'yellow', 'blue', 'mauve', 'teal', 'peach',
] as const;
export type CustomTokenKey = typeof TOKEN_KEYS[number];
export const OVERRIDE_KEYS: CustomTokenKey[] = TOKEN_KEYS.filter(
  (k) => !(BASE_KEYS as readonly string[]).includes(k),
);

const HEX = /^#[0-9a-fA-F]{6}$/;

type RGB = [number, number, number];

export function isHex(value: unknown): value is string {
  return typeof value === 'string' && HEX.test(value);
}

// True when clampHex can resolve this value to a colour: 6-digit or 3-digit, with
// or without the leading '#'. `isHex` is the STRICT canonical test and stays that
// way because it is also used on already-normalised values — but gating user INPUT
// on it meant a 3-digit override was discarded while a 3-digit base colour in the
// very same pasted block survived, because base colours go through clampHex.
export function isHexInput(value: unknown): value is string {
  return clampHex(value, '') !== '';
}

export function clampHex(value: unknown, fallback: string): string {
  if (typeof value === 'string') {
    let v = value.trim();
    if (/^[0-9a-fA-F]{6}$/.test(v)) v = '#' + v;
    if (/^#[0-9a-fA-F]{3}$/.test(v)) v = '#' + v.slice(1).split('').map((c) => c + c).join('');
    if (HEX.test(v)) return v.toLowerCase();
  }
  return fallback;
}

export function normalizeCustomTheme(input: Partial<CustomTheme> | undefined): CustomTheme {
  const base = input || {};
  const theme: CustomTheme = {
    bg: clampHex(base.bg, DEFAULT_CUSTOM_THEME.bg),
    surface: clampHex(base.surface, DEFAULT_CUSTOM_THEME.surface),
    text: clampHex(base.text, DEFAULT_CUSTOM_THEME.text),
    accent: clampHex(base.accent, DEFAULT_CUSTOM_THEME.accent),
  };
  // Keep only valid hex overrides; anything else falls back to the derived value.
  for (const key of OVERRIDE_KEYS) {
    const value = base[key];
    if (isHexInput(value)) theme[key] = clampHex(value, '#000000');
  }
  return theme;
}

// The set of overrides currently pinned on a theme (used by export / share codes).
export function themeOverrides(theme: CustomTheme): Partial<CustomTheme> {
  const out: Partial<CustomTheme> = {};
  for (const key of OVERRIDE_KEYS) {
    if (isHex(theme[key])) out[key] = clampHex(theme[key], '#000000');
  }
  return out;
}

function toRgb(hex: string): RGB {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex([r, g, b]: RGB): string {
  const h = (c: number) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

function rgbStr([r, g, b]: RGB): string {
  return `${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}`;
}

// Blend `from` toward `to` by amount t (0..1).
function mix(from: RGB, to: RGB, t: number): RGB {
  return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t, from[2] + (to[2] - from[2]) * t];
}

export function luminance([r, g, b]: RGB): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function rgbToHsl([r, g, b]: RGB): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360; s = Math.max(0, Math.min(100, s)) / 100; l = Math.max(0, Math.min(100, l)) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; } else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; } else if (h < 300) { r = x; b = c; } else { r = c; b = x; }
  return toHex([(r + m) * 255, (g + m) * 255, (b + m) * 255]);
}

// Build a whole coherent theme from a single accent color + a light/dark mode:
// the accent's hue tints neutral surfaces so the result feels designed, not random.
export function generateFromAccent(accentHex: string, mode: 'dark' | 'light'): CustomTheme {
  const accent = clampHex(accentHex, DEFAULT_CUSTOM_THEME.accent);
  const [h] = rgbToHsl(toRgb(accent));
  if (mode === 'light') {
    return { bg: hslToHex(h, 30, 96), surface: hslToHex(h, 42, 99), text: hslToHex(h, 22, 12), accent };
  }
  return { bg: hslToHex(h, 22, 7), surface: hslToHex(h, 18, 11), text: hslToHex(h, 16, 92), accent };
}

const RANDOM_ACCENTS = ['#7c5cff', '#22d3ee', '#fb7185', '#34d399', '#f59e0b', '#a78bfa', '#38bdf8', '#f472b6', '#4ade80', '#e879f9'];

// A coherent random theme: pick an accent + mode, then generate around it.
export function randomTheme(seed: number): CustomTheme {
  // A negative seed made `Math.floor(seed * len) % len` negative, so the lookup was
  // undefined and clampHex substituted the default accent — every out-of-range seed
  // returned one identical "random" theme. NaN behaved the same way. Both call sites
  // pass Math.random(), so this was latent, but the function is exported.
  const safe = Number.isFinite(seed) ? seed : 0;
  const len = RANDOM_ACCENTS.length;
  const accent = RANDOM_ACCENTS[(((Math.floor(safe * len) % len) + len) % len)];
  const mode: 'dark' | 'light' = ((((safe * 100) % 5) + 5) % 5) < 1 ? 'light' : 'dark';
  return generateFromAccent(accent, mode);
}

// Shareable export: the full derived token block (paste anywhere, or re-import here).
export function exportThemeCss(theme: CustomTheme): string {
  const vars = buildCustomThemeVars(theme);
  const lines = Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`).join('\n');
  return `/* XRAY custom theme */\n.xray-theme {\n${lines}\n}`;
}

// ── WCAG contrast ──────────────────────────────────────────────────────────
function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}
function relLuminance([r, g, b]: RGB): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}
export function contrastRatio(a: string, b: string): number {
  const la = relLuminance(toRgb(clampHex(a, '#000000')));
  const lb = relLuminance(toRgb(clampHex(b, '#ffffff')));
  const hi = Math.max(la, lb), lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}
export type ContrastGrade = 'AAA' | 'AA' | 'AA Large' | 'Fail';
export function contrastGrade(ratio: number): ContrastGrade {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA Large';
  return 'Fail';
}

// ── Shareable theme package (colors + font + radius + effect) ──────────────
export interface ThemePackage {
  colors: CustomTheme;
  font?: PanelFont;
  radius?: number;
  hacker?: boolean;
}

// The one mapping from a decoded share package to panel settings — used by both
// the Settings import flow and the window.html#theme= hash so they can't drift.
export function themePackageToSettings(pkg: ThemePackage): {
  theme: 'custom';
  customTheme: CustomTheme;
  font?: PanelFont;
  radius?: number;
  hacker?: boolean;
} {
  return {
    theme: 'custom',
    customTheme: pkg.colors,
    ...(pkg.font ? { font: pkg.font } : {}),
    ...(pkg.radius != null ? { radius: pkg.radius } : {}),
    ...(pkg.hacker != null ? { hacker: pkg.hacker } : {}),
  };
}

const CODE_PREFIX = 'xray1:';

function b64encode(text: string): string {
  return btoa(unescape(encodeURIComponent(text)));
}
function b64decode(text: string): string {
  const padded = text + '='.repeat((4 - (text.length % 4)) % 4);
  return decodeURIComponent(escape(atob(padded)));
}

// A compact, portable token: "xray1:<base64>". Travels as a share code or a
// window URL hash (#theme=<code>). Carries the full look, not just colors.
export function encodeTheme(pkg: ThemePackage): string {
  const overrides = themeOverrides(pkg.colors);
  const compact = {
    c: [pkg.colors.bg, pkg.colors.surface, pkg.colors.text, pkg.colors.accent],
    // Per-token overrides travel too, so a shared "full freedom" theme round-trips
    // exactly. Omitted when the theme is just the four base colors.
    o: Object.keys(overrides).length ? overrides : undefined,
    f: pkg.font,
    r: pkg.radius,
    h: pkg.hacker ? 1 : 0,
  };
  return CODE_PREFIX + b64encode(JSON.stringify(compact)).replace(/=+$/, '');
}

export function decodeTheme(input: string): ThemePackage | null {
  try {
    let s = String(input || '').trim();
    s = s.replace(/^#?/, '').replace(/^theme=/, '');
    if (s.startsWith(CODE_PREFIX)) s = s.slice(CODE_PREFIX.length);
    if (!s) return null;
    const json = JSON.parse(b64decode(s));
    if (!json || !Array.isArray(json.c)) return null;
    const overrides = json.o && typeof json.o === 'object' ? json.o : {};
    const colors = normalizeCustomTheme({ bg: json.c[0], surface: json.c[1], text: json.c[2], accent: json.c[3], ...overrides });
    return {
      colors,
      font: typeof json.f === 'string' ? json.f as PanelFont : undefined,
      radius: typeof json.r === 'number' ? json.r : undefined,
      hacker: json.h === 1,
    };
  } catch {
    return null;
  }
}

// Import accepts a JSON blob { bg, surface, text, accent } or any text containing
// --xray-bg / --xray-surface / --xray-text / --xray-accent hex declarations
// (so a previously-copied export round-trips).
export function parseThemeInput(text: string): CustomTheme | null {
  const input = String(text || '').trim();
  if (!input) return null;
  try {
    const json = JSON.parse(input);
    if (json && typeof json === 'object' && (json.bg || json.accent)) return normalizeCustomTheme(json);
  } catch { /* not JSON, try CSS */ }
  const pick = (name: string): string | undefined => {
    const m = input.match(new RegExp(`--xray-${name}\\s*:\\s*(#[0-9a-fA-F]{3,6})`));
    return m ? m[1] : undefined;
  };
  const bg = pick('bg'), surface = pick('surface'), textColor = pick('text'), accent = pick('accent');
  if (!bg && !surface && !textColor && !accent) return null;
  // Pull any overridden tokens out of an exported --xray-* block so a copied CSS
  // theme round-trips with all its pinned colors, not just the base four.
  const extras: Partial<CustomTheme> = {};
  for (const key of OVERRIDE_KEYS) {
    const value = pick(key);
    if (value) extras[key] = value;
  }
  return normalizeCustomTheme({ bg, surface, text: textColor, accent, ...extras });
}

// Status hues chosen to stay readable against the chosen background's brightness.
const DARK_STATUS = { green: '#a6e3a1', red: '#f38ba8', yellow: '#f9e2af', blue: '#89b4fa', mauve: '#cba6f7', teal: '#94e2d5', peach: '#fab387' };
const LIGHT_STATUS = { green: '#0f8a4f', red: '#d6336c', yellow: '#b7791f', blue: '#1971c2', mauve: '#7048e8', teal: '#0c8599', peach: '#d9480f' };

// Resolve every editable token to a concrete hex: an explicit override wins,
// otherwise the value is derived from the four base colors. This is the single
// source of truth for both the applied CSS variables and the editor's swatches,
// so what you see in the picker is exactly what the panel renders.
export function resolveThemeColors(theme: CustomTheme): Record<CustomTokenKey, string> {
  const bg = toRgb(clampHex(theme.bg, DEFAULT_CUSTOM_THEME.bg));
  const surface = toRgb(clampHex(theme.surface, DEFAULT_CUSTOM_THEME.surface));
  const text = toRgb(clampHex(theme.text, DEFAULT_CUSTOM_THEME.text));
  const accent = clampHex(theme.accent, DEFAULT_CUSTOM_THEME.accent);

  const light = luminance(bg) > 140;
  const status = light ? LIGHT_STATUS : DARK_STATUS;

  const derived: Record<CustomTokenKey, string> = {
    bg: toHex(bg),
    surface: toHex(surface),
    surface2: toHex(mix(surface, text, 0.10)),
    surface3: toHex(mix(surface, text, 0.18)),
    text: toHex(text),
    subtext: toHex(mix(text, bg, 0.34)),
    hint: toHex(mix(text, bg, 0.55)),
    border: toHex(mix(surface, text, 0.16)),
    accent,
    green: status.green,
    red: status.red,
    yellow: status.yellow,
    blue: status.blue,
    mauve: status.mauve,
    teal: status.teal,
    peach: status.peach,
  };

  const out = { ...derived };
  for (const key of TOKEN_KEYS) {
    if (isHex(theme[key])) out[key] = clampHex(theme[key], derived[key]);
  }
  return out;
}

// Is this token currently pinned to an explicit value (vs. auto-derived)?
export function isTokenOverridden(theme: CustomTheme, key: CustomTokenKey): boolean {
  return !(BASE_KEYS as readonly string[]).includes(key) && isHex(theme[key]);
}

export function buildCustomThemeVars(theme: CustomTheme): Record<string, string> {
  const c = resolveThemeColors(theme);
  const bg = toRgb(c.bg);
  const surface = toRgb(c.surface);
  const surface2 = toRgb(c.surface2);
  const text = toRgb(c.text);
  // Borders stay translucent (adapting to whatever surface they sit on) unless the
  // user pins an explicit border color, in which case that solid hex wins.
  const border = isHex(theme.border) ? clampHex(theme.border, c.border) : `rgba(${rgbStr(text)}, 0.16)`;

  return {
    '--xray-bg': c.bg,
    '--xray-surface': c.surface,
    '--xray-surface2': c.surface2,
    '--xray-surface3': c.surface3,
    '--xray-text': c.text,
    '--xray-subtext': c.subtext,
    '--xray-hint': c.hint,
    '--xray-bg-rgb': rgbStr(bg),
    '--xray-surface-rgb': rgbStr(surface),
    '--xray-surface2-rgb': rgbStr(surface2),
    '--xray-text-rgb': rgbStr(text),
    '--xray-border': border,
    '--xray-accent': c.accent,
    '--xray-green': c.green,
    '--xray-red': c.red,
    '--xray-yellow': c.yellow,
    '--xray-blue': c.blue,
    '--xray-mauve': c.mauve,
    '--xray-teal': c.teal,
    '--xray-peach': c.peach,
    '--xray-operator-grid': `rgba(${rgbStr(text)}, 0.03)`,
  };
}
