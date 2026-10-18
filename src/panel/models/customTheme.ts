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
  accent: '#a99aff',
};


// The four colors that must always be present (a theme is coherent from these alone).
export const BASE_KEYS = ['bg', 'surface', 'text', 'accent'] as const;
// Every token the UI paints. Anything past the base four is an optional override
// that defaults to a derived value — this is what makes editing "full freedom".
export const TOKEN_KEYS = [
  'bg', 'surface', 'surface2', 'surface3',
  'text', 'subtext', 'hint', 'border',
  'border-control', 'focus', 'selection', 'hover', 'active', 'disabled',
  'accent',
  'accent-soft',
  'green', 'red', 'yellow', 'blue', 'mauve', 'teal', 'peach', 'pending', 'neutral',
  'shadow', 'overlay',
] as const;
export type CustomTokenKey = typeof TOKEN_KEYS[number];
export const OVERRIDE_KEYS: CustomTokenKey[] = TOKEN_KEYS.filter(
  (k) => !(BASE_KEYS as readonly string[]).includes(k),
);

// Theme packages are intentionally more permissive than the four required base
// colors. The persisted CustomTheme interface predates semantic roles, so keep
// those fields structurally compatible while allowing old packages and new role
// overrides to round-trip without rewriting user input.
type ThemeInput = Partial<CustomTheme> & Partial<Record<CustomTokenKey, string>>;

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

export function normalizeCustomTheme(input: ThemeInput | undefined): CustomTheme {
  const base = input || {};
  const theme: CustomTheme = {
    bg: clampHex(base.bg, DEFAULT_CUSTOM_THEME.bg),
    surface: clampHex(base.surface, DEFAULT_CUSTOM_THEME.surface),
    text: clampHex(base.text, DEFAULT_CUSTOM_THEME.text),
    accent: clampHex(base.accent, DEFAULT_CUSTOM_THEME.accent),
  };
  // Keep only valid hex overrides; anything else falls back to the derived value.
  for (const key of OVERRIDE_KEYS) {
    const value = (base as Partial<Record<CustomTokenKey, string>>)[key];
    if (isHexInput(value)) (theme as Partial<Record<CustomTokenKey, string>>)[key] = clampHex(value, '#000000');
  }
  return theme;
}

// The set of overrides currently pinned on a theme (used by export / share codes).
export function themeOverrides(theme: CustomTheme): Partial<CustomTheme> {
  const out: Partial<CustomTheme> = {};
  for (const key of OVERRIDE_KEYS) {
    const value = (theme as Partial<Record<CustomTokenKey, string>>)[key];
    if (isHex(value)) (out as Partial<Record<CustomTokenKey, string>>)[key] = clampHex(value, '#000000');
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
  // Run the pick through the same lightness-only accent solve as the presets, so a
  // pastel accent on a generated light theme still reads as text.
  return solveThemeAccent(generateFromAccent(accent, mode));
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
function ratioRgb(a: RGB, b: RGB): number {
  const la = relLuminance(a), lb = relLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
// ── OKLCH (lightness-only adjustments that keep a colour's hue) ────────────
function linearChannel(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}
function encodeChannel(c: number): number {
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
  return v * 255;
}
export function rgbToOklch(rgb: RGB): [number, number, number] {
  const [r, g, b] = rgb.map(linearChannel) as RGB;
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
  return [L, Math.hypot(A, B), Math.atan2(B, A)];
}
function oklchToLinear(L: number, C: number, h: number): RGB {
  const A = C * Math.cos(h), B = C * Math.sin(h);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.2914855480 * B) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ];
}
// The colour at OKLCH lightness L with the given hue, keeping as much of the chroma
// as the sRGB gamut allows (binary search on chroma).
export function oklchInGamut(L: number, C: number, h: number): RGB {
  const inGamut = (rgb: RGB) => rgb.every((v) => v >= -1e-6 && v <= 1 + 1e-6);
  let lo = 0, hi = C;
  if (!inGamut(oklchToLinear(L, hi, h))) {
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToLinear(L, mid, h))) lo = mid; else hi = mid;
    }
    hi = lo;
  }
  return oklchToLinear(L, hi, h).map((v) => encodeChannel(Math.min(1, Math.max(0, v)))) as RGB;
}
/** Smallest OKLCH-lightness move (in `dir`) at which `start` reaches `target` on every host. */
function solveLightness(start: RGB, dir: 1 | -1, hosts: (fg: RGB) => RGB[], target: number, extra: (fg: RGB) => boolean = () => true): RGB {
  const passes = (fg: RGB) => Math.min(...hosts(fg).map((h) => ratioRgb(fg, h))) >= target && extra(fg);
  if (passes(start)) return start;
  const [L0, C, h] = rgbToOklch(start);
  let last = start;
  for (let L = L0 + dir * 0.005; L >= 0 && L <= 1; L += dir * 0.005) {
    last = toRgb(toHex(oklchInGamut(L, C, h)));
    if (passes(last)) return last;
  }
  return last;
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
  const extras: ThemeInput = {};
  for (const key of OVERRIDE_KEYS) {
    const value = pick(key);
    if (value) (extras as Partial<Record<CustomTokenKey, string>>)[key] = value;
  }
  return normalizeCustomTheme({ bg, surface, text: textColor, accent, ...extras });
}

// Status hues chosen to stay readable against the chosen background's brightness.
const DARK_STATUS = { green: '#a6e3a1', red: '#f38ba8', yellow: '#f9e2af', blue: '#89b4fa', mauve: '#cba6f7', teal: '#94e2d5', peach: '#fab387' };
// Light values read at >= 4.5:1 as text on light backgrounds, surfaces, JSON wells and
// their own 10% flag tints (test/unit/themeContrast.test.mjs, light custom presets).
const LIGHT_STATUS = { green: '#0e7e48', red: '#ad2353', yellow: '#805516', blue: '#1970c0', mauve: '#6135e6', teal: '#0b788a', peach: '#a6370b' };
/** The palettes status colours start from before the readability solve (exported for tests). */
export const STATUS_PALETTES = { dark: DARK_STATUS, light: LIGHT_STATUS } as const;

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

  // Readability solve. Each faint/status colour starts from its usual value and, only
  // if it misses its target on a surface it is painted on (the same composites the
  // stylesheet builds), moves in OKLCH LIGHTNESS toward the text colour — hue kept,
  // chroma only clamped to the sRGB gamut — so red stays red and a theme that already
  // reads well is unchanged. Hosts mirror test/unit/themeContrast.test.mjs.
  const pinned = (key: CustomTokenKey): RGB | null => {
    const value = (theme as Partial<Record<CustomTokenKey, string>>)[key];
    return isHex(value) ? toRgb(clampHex(value, '#000000')) : null;
  };
  const s2 = pinned('surface2') ?? toRgb(toHex(mix(surface, text, 0.10)));
  const sink: RGB = light ? [255, 255, 255] : [0, 0, 0];
  const input = mix(s2, sink, 0.12);
  const well = mix(bg, sink, 0.14);
  const selectedRow = mix(bg, toRgb(accent), 0.10);
  const dir: 1 | -1 = rgbToOklch(text)[0] > rgbToOklch(bg)[0] ? 1 : -1;
  const TEXT_TARGET = 4.51;
  const hint = solveLightness(toRgb(toHex(mix(text, bg, light ? 0.32 : 0.38))), dir, () => [bg, surface, s2, input], TEXT_TARGET);
  // Subtext must also stay visibly brighter (≥ 8 % more contrast on bg) than hint.
  const subtext = solveLightness(toRgb(toHex(mix(text, bg, light ? 0.26 : 0.34))), dir, () => [bg, surface, s2], TEXT_TARGET,
    (fg) => ratioRgb(fg, bg) >= ratioRgb(hint, bg) * 1.08);
  const neutral = solveLightness(toRgb(toHex(mix(text, bg, light ? 0.34 : 0.46))), dir, () => [bg, surface, well], TEXT_TARGET);
  const borderControl = solveLightness(toRgb(toHex(mix(surface, text, light ? 0.56 : 0.44))), dir, () => [input, bg], 3.01);
  // Status colours also sit on their own 10 % tint (chips, badges, flags), on a
  // plain row, a surface, the elevated surface and the selected-row tint.
  const statusHosts = (fg: RGB): RGB[] => [
    bg, surface, s2, well, selectedRow,
    mix(bg, fg, 0.10), mix(surface, fg, 0.10), mix(s2, fg, 0.10), mix(selectedRow, fg, 0.10),
  ];
  const readable = (hex: string): string => toHex(solveLightness(toRgb(hex), dir, statusHosts, TEXT_TARGET));

  const derived: Record<CustomTokenKey, string> = {
    bg: toHex(bg),
    surface: toHex(surface),
    surface2: toHex(mix(surface, text, 0.10)),
    surface3: toHex(mix(surface, text, 0.18)),
    text: toHex(text),
    // Solved above: faint text reaches 4.5:1 on the elevated surface (the console
    // editor's placeholder sits on surface2) while staying dimmer than subtext.
    subtext: toHex(subtext),
    hint: toHex(hint),
    border: toHex(mix(surface, text, 0.16)),
    'border-control': toHex(borderControl),
    focus: accent,
    selection: toHex(mix(toRgb(accent), bg, 0.82)),
    hover: toHex(mix(bg, text, 0.08)),
    active: toHex(mix(toRgb(accent), bg, 0.68)),
    disabled: toHex(mix(text, bg, 0.62)),
    accent,
    'accent-soft': toHex(mix(toRgb(accent), bg, 0.82)),
    green: readable(status.green),
    red: readable(status.red),
    yellow: readable(status.yellow),
    blue: readable(status.blue),
    mauve: readable(status.mauve),
    teal: readable(status.teal),
    peach: readable(status.peach),
    pending: readable(status.yellow),
    neutral: toHex(neutral),
    shadow: '#000000',
    overlay: toHex(bg),
  };

  const out = { ...derived };
  for (const key of TOKEN_KEYS) {
    const value = (theme as Partial<Record<CustomTokenKey, string>>)[key];
    if (isHex(value)) out[key] = clampHex(value, derived[key]);
  }
  return out;
}

// Is this token currently pinned to an explicit value (vs. auto-derived)?
export function isTokenOverridden(theme: CustomTheme, key: CustomTokenKey): boolean {
  return !(BASE_KEYS as readonly string[]).includes(key) && isHex((theme as Partial<Record<CustomTokenKey, string>>)[key]);
}

// Lowest alpha (from `start`, in 0.02 steps) at which the hint-coloured thumb reaches
// 3:1 against the scrollbar track (bg at 44 %) over both bg and surface.
function scrollThumbAlpha(hint: RGB, bg: RGB, surface: RGB, start: number): number {
  for (let a = start; a < 1; a = Math.round((a + 0.02) * 100) / 100) {
    const ok = [bg, surface].every((under) => {
      const track = mix(under, bg, 0.44);
      return ratioRgb(mix(track, hint, a), track) >= 3.01;
    });
    if (ok) return a;
  }
  return 1;
}

export function buildCustomThemeVars(theme: CustomTheme): Record<string, string> {
  const c = resolveThemeColors(theme);
  const bg = toRgb(c.bg);
  const surface = toRgb(c.surface);
  const surface2 = toRgb(c.surface2);
  const text = toRgb(c.text);
  const light = luminance(bg) > 140;
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
    '--xray-border-control': c['border-control'],
    '--xray-focus': c.focus,
    '--xray-selection': c.selection,
    '--xray-hover': c.hover,
    '--xray-active': c.active,
    '--xray-disabled': c.disabled,
    '--xray-accent': c.accent,
    '--xray-accent-soft': c['accent-soft'],
    '--xray-green': c.green,
    '--xray-red': c.red,
    '--xray-yellow': c.yellow,
    '--xray-blue': c.blue,
    '--xray-mauve': c.mauve,
    '--xray-teal': c.teal,
    '--xray-peach': c.peach,
    '--xray-pending': c.pending,
    '--xray-neutral': c.neutral,
    '--xray-shadow': isTokenOverridden(theme, 'shadow') ? c.shadow : 'rgba(0, 0, 0, .38)',
    '--xray-overlay': isTokenOverridden(theme, 'overlay') ? c.overlay : `rgba(${rgbStr(bg)}, .74)`,
    '--xray-operator-grid': `rgba(${rgbStr(text)}, 0.03)`,
    // Composite wells (inputs, JSON, table head, status bar) lighten on a light
    // theme instead of greying toward black.
    '--xray-sink': light ? '#ffffff' : '#000000',
    // Scrollbar thumb at >= 3:1 against its track (the global default is hint 62%).
    '--xray-scroll-thumb': `rgba(${rgbStr(toRgb(c.hint))}, ${scrollThumbAlpha(toRgb(c.hint), bg, surface, light ? 0.8 : 0.64)})`,
  };
}

/**
 * The theme with its accent moved in OKLCH lightness only (hue kept) until it reads at
 * 4.5:1 as text on its own 10 % tint over surface and surface2, on the primary
 * button's mauve stop, and on a 14 % tint over bg. An accent that already passes is
 * returned unchanged. Used for the Theme Studio presets and Randomize; a user-picked
 * accent is never rewritten.
 */
export function solveThemeAccent(theme: CustomTheme): CustomTheme {
  const c = resolveThemeColors(theme);
  const bg = toRgb(c.bg), surface = toRgb(c.surface), s2 = toRgb(c.surface2), text = toRgb(c.text);
  const mauve = toRgb(c.mauve);
  const dir: 1 | -1 = rgbToOklch(text)[0] > rgbToOklch(bg)[0] ? 1 : -1;
  const hosts = (fg: RGB): RGB[] => [
    mix(surface, fg, 0.10), mix(s2, fg, 0.10), mix(surface, mauve, 0.10), mix(s2, mauve, 0.10), mix(bg, fg, 0.14),
  ];
  const accent = toHex(solveLightness(toRgb(clampHex(theme.accent, DEFAULT_CUSTOM_THEME.accent)), dir, hosts, 4.51));
  return { ...theme, accent };
}

/**
 * Theme Studio starter presets (Settings > Appearance > Custom): each preset's brand
 * accent passed through solveThemeAccent, so it keeps its hue and reads as text.
 */
export const THEME_STUDIO_PRESETS: Array<{ label: string; theme: CustomTheme }> = [
  { label: 'Slate', theme: { bg: '#0f1117', surface: '#171a23', text: '#e7e9f0', accent: '#9479ff' } },
  { label: 'Graphite', theme: { bg: '#0e0e10', surface: '#19191c', text: '#ededed', accent: '#22d3ee' } },
  { label: 'Rosé', theme: { bg: '#1a1114', surface: '#241519', text: '#f4e9ec', accent: '#fb7185' } },
  { label: 'Emerald', theme: { bg: '#0b1210', surface: '#131c19', text: '#e6f0ec', accent: '#34d399' } },
  { label: 'Nord', theme: { bg: '#2e3440', surface: '#3b4252', text: '#eceff4', accent: '#88c0d0' } },
  { label: 'Solarized', theme: { bg: '#002b36', surface: '#073642', text: '#eee8d5', accent: '#268bd2' } },
  { label: 'Amber', theme: { bg: '#161207', surface: '#211a0c', text: '#f6ecd6', accent: '#f5a623' } },
  { label: 'Sakura', theme: { bg: '#1c141a', surface: '#281b26', text: '#f6e9f1', accent: '#ec4899' } },
  { label: 'Paper', theme: { bg: '#faf9f6', surface: '#ffffff', text: '#1c1b19', accent: '#2563eb' } },
  { label: 'Sky', theme: { bg: '#eef4fb', surface: '#ffffff', text: '#16273b', accent: '#0284c7' } },
  { label: 'Sage', theme: { bg: '#eef2ec', surface: '#fbfdfa', text: '#1e2a20', accent: '#3f8a4f' } },
].map(({ label, theme }) => ({ label, theme: solveThemeAccent(theme) }));
