/* Contrast matrix for every built-in theme preset (spec T12).
 *
 * Each preset's tokens are read from the real stylesheets (tokens.css base +
 * the `.xray-theme-*` block in styles.css), the custom theme from
 * buildCustomThemeVars(DEFAULT_CUSTOM_THEME), and the composite surfaces (input
 * field, JSON well, scrollbar) are evaluated from the actual CSS declarations —
 * var() fallbacks, color-mix(in srgb, …) and alpha compositing included — so a
 * future token or rule edit cannot silently make a theme unreadable.
 *
 * Targets: text ≥ 4.5:1 (High Contrast ≥ 7:1); meaningful UI graphics (input
 * borders, scrollbar thumbs) ≥ 3:1. Every failing pair is listed in the message.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { customTheme as T, panelSettings as P } from './harness.mjs';

const root = new URL('../../', import.meta.url).pathname;
const styles = readFileSync(root + 'src/panel/styles.css', 'utf8');
const tokensCss = readFileSync(root + 'src/panel/styles/tokens.css', 'utf8');

// ── token blocks ───────────────────────────────────────────────────────────
function declarations(body) {
  const out = {};
  for (const [, name, value] of body.matchAll(/(--xray-[a-z0-9-]+)\s*:\s*([^;]+);/g)) out[name] = value.trim();
  return out;
}
function themeBlock(cls) {
  const m = styles.match(new RegExp('\\.' + cls + '\\s*\\{([^}]*)\\}'));
  assert.ok(m, `.${cls} token block not found in styles.css`);
  return declarations(m[1]);
}
const baseTokens = (() => {
  const m = tokensCss.match(/:host,\s*\.xray-app-root\s*\{([^}]*)\}/);
  assert.ok(m, 'tokens.css base block not found');
  return declarations(m[1]);
})();

const { PANEL_ACCENT_VALUES: DARK_ACCENTS, PANEL_ACCENT_VALUES_LIGHT: LIGHT_ACCENTS, THEME_DEFAULT_ACCENT } = P;
const preset = (cls, id, light) => ({
  ...baseTokens,
  ...themeBlock(cls),
  '--xray-accent': (light ? LIGHT_ACCENTS : DARK_ACCENTS)[THEME_DEFAULT_ACCENT[id] ?? 'blue'],
});

const THEMES = {
  'Signal Gray': { vars: preset('xray-theme-operator', 'operator', false), need: 4.5 },
  'Harbor Instrument': { vars: preset('xray-theme-dev-edition', 'dev-edition', false), need: 4.5 },
  'Paper Relay': { vars: preset('xray-theme-light-lab', 'light-lab', true), need: 4.5 },
  'High Contrast': { vars: preset('xray-theme-midnight', 'midnight', false), need: 7 },
  Claude: { vars: preset('xray-theme-claude', 'claude', true), need: 4.5 },
  'Custom (defaults)': { vars: { ...baseTokens, ...T.buildCustomThemeVars(T.DEFAULT_CUSTOM_THEME) }, need: 4.5 },
  // Every Theme Studio starter preset, with the full matrix.
  ...Object.fromEntries(T.THEME_STUDIO_PRESETS.map(({ label, theme }) => [
    `Theme Studio: ${label}`, { vars: { ...baseTokens, ...T.buildCustomThemeVars(theme) }, need: 4.5 },
  ])),
};

// ── CSS rule lookup ────────────────────────────────────────────────────────
const norm = (s) => s.replace(/\s+/g, ' ').trim();
/** Last declaration of `prop` in a rule whose full selector list equals `selector`. */
function ruleValue(selector, prop) {
  let found;
  for (const [, sel, body] of styles.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (norm(sel.replace(/\/\*[\s\S]*?\*\//g, '')) !== norm(selector)) continue;
    for (const [, p, v] of body.matchAll(/(?:^|;|\s)([a-z-]+)\s*:\s*([^;]+);/g)) if (p === prop) found = v.trim();
  }
  return found;
}

/** Rules whose text colour is a token painted over a tint of the same token. */
const TINT_RULES = (() => {
  const out = [];
  for (const [, sel, body] of styles.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const fg = body.match(/(?:^|[;\s])color\s*:\s*(var\(--xray-([a-z0-9-]+)[^;]*);/);
    const tint = body.match(/(?:^|[;\s])background(?:-color)?\s*:\s*((?:color-mix|rgba)\([^;]*);/);
    if (!fg || !tint) continue;
    const token = fg[2];
    const ownTint = token === 'text' ? /--xray-text-rgb|var\(--xray-text\)/ : new RegExp(`var\\(--xray-${token}\\b`);
    if (ownTint.test(tint[1])) out.push({ selector: norm(sel), fg: fg[1].trim(), tint: tint[1].trim() });
  }
  return out;
})();

test('the own-tint scan finds the badge/chip rules (fails loudly if the CSS scan breaks)', () => {
  assert.ok(TINT_RULES.length >= 50, `only ${TINT_RULES.length} own-tint rules found`);
});

// ── colour evaluation ──────────────────────────────────────────────────────
function splitTop(text, sep) {
  const parts = []; let depth = 0; let cur = '';
  for (const ch of text) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (depth === 0 && (sep === ' ' ? /\s/.test(ch) : ch === sep)) { if (cur.trim()) parts.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}
function substituteVars(value, vars) {
  let out = value; let guard = 0;
  while (out.includes('var(') && guard++ < 50) {
    const start = out.lastIndexOf('var(');
    let depth = 0; let end = start;
    for (let i = start + 3; i < out.length; i++) {
      if (out[i] === '(') depth++;
      if (out[i] === ')' && --depth === 0) { end = i; break; }
    }
    const [name, ...fallback] = splitTop(out.slice(start + 4, end), ',');
    const replacement = vars[name.trim()] ?? fallback.join(',').trim();
    assert.ok(replacement, `unresolved ${name} with no fallback`);
    out = out.slice(0, start) + replacement + out.slice(end + 1);
  }
  return out;
}
/** -> [r, g, b, a] (non-premultiplied, 0..255 and 0..1). */
function parseColor(value, vars) {
  const v = substituteVars(value, vars).trim();
  if (v === 'transparent') return [0, 0, 0, 0];
  if (v === 'black') return [0, 0, 0, 1];
  if (v === 'white') return [255, 255, 255, 1];
  if (v.startsWith('#')) {
    let h = v.slice(1);
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h.slice(0, 6), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, h.length === 8 ? parseInt(h.slice(6), 16) / 255 : 1];
  }
  let m = v.match(/^rgba?\((.*)\)$/s);
  if (m) {
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return [p[0], p[1], p[2], p[3] ?? 1];
  }
  m = v.match(/^color-mix\(\s*in srgb\s*,(.*)\)$/s);
  if (m) {
    const [a, b] = splitTop(m[1], ',').map((part) => {
      const pm = part.match(/^(.*?)\s+([\d.]+)%$/s);
      return pm ? { color: parseColor(pm[1], vars), pct: Number(pm[2]) / 100 } : { color: parseColor(part, vars), pct: null };
    });
    let pa = a.pct; let pb = b.pct;
    if (pa == null && pb == null) { pa = 0.5; pb = 0.5; } else if (pa == null) pa = 1 - pb; else if (pb == null) pb = 1 - pa;
    const sum = pa + pb; const mult = Math.min(sum, 1); pa /= sum; pb /= sum;
    const alpha = a.color[3] * pa + b.color[3] * pb;
    if (alpha === 0) return [0, 0, 0, 0];
    const ch = (i) => (a.color[i] * a.color[3] * pa + b.color[i] * b.color[3] * pb) / alpha;
    return [ch(0), ch(1), ch(2), alpha * mult];
  }
  throw new Error(`cannot evaluate colour "${v}" (from "${value}")`);
}
const over = (fg, bg) => [0, 1, 2].map((i) => fg[i] * fg[3] + bg[i] * (1 - fg[3])).concat(1);
const hex = (c) => '#' + c.slice(0, 3).map((x) => Math.round(x).toString(16).padStart(2, '0')).join('');
const lin = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const lum = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
function ratio(fg, bg) {
  const b = bg[3] === 1 ? bg : over(bg, [255, 255, 255, 1]);
  const f = over(fg, b); const x = lum(f); const y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

// ── the matrix ─────────────────────────────────────────────────────────────
function matrix(name, { vars, need }) {
  const rows = [];
  const color = (value) => parseColor(value, vars);
  const add = (label, fg, bg, min) => rows.push({ label, fg: hex(over(fg, bg)), bg: hex(bg), ratio: ratio(fg, bg), min });
  const bg = color('var(--xray-bg)');
  const surface = color('var(--xray-surface)');
  const surface2 = color('var(--xray-surface2)');

  // Composite surfaces, evaluated from the real rules.
  const inputRule = '.xray-panel .xray-input, .xray-panel .xray-select, .xray-panel textarea, .xray-panel input, .xray-panel select';
  const inputBgValue = ruleValue(inputRule, 'background');
  assert.ok(inputBgValue, 'input background rule not found');
  const input = over(color(inputBgValue), bg);
  const wellValue = ruleValue('.xray-panel .xray-json, .xray-panel .xray-json-editor', 'background');
  assert.ok(wellValue, 'JSON well background rule not found');
  const well = over(color(splitTop(wellValue, ',').at(-1)), bg);

  for (const fg of ['text', 'subtext', 'hint']) {
    add(`${fg} on bg`, color(`var(--xray-${fg})`), bg, need);
    add(`${fg} on surface2`, color(`var(--xray-${fg})`), surface2, need);
  }
  // Status / syntax colours that render as text (teal = POST). Every theme defines
  // --xray-pending and --xray-neutral, but nothing reads them (no var() use in any
  // stylesheet or component), so they are not asserted as text here.
  for (const fg of ['red', 'green', 'blue', 'mauve', 'peach', 'yellow', 'teal']) {
    add(`${fg} on bg`, color(`var(--xray-${fg})`), bg, need);
    add(`${fg} on surface`, color(`var(--xray-${fg})`), surface, need);
    add(`${fg} on JSON well`, color(`var(--xray-${fg})`), well, need);
  }

  // Placeholder: the themed rule (T4) on the input surface.
  const placeholder = ruleValue('.xray-panel :is(.xray-input, input, textarea)::placeholder', 'color');
  if (placeholder) add('placeholder on input', color(placeholder), input, need);
  else rows.push({ label: 'placeholder rule `.xray-panel :is(.xray-input, input, textarea)::placeholder` missing', fg: '-', bg: '-', ratio: 0, min: need });

  // Input border (the colour the input rule actually paints) vs input and bg.
  const border = color(ruleValue(inputRule, 'border-color'));
  add('input border vs input surface', border, input, 3);
  add('input border vs bg', border, bg, 3);

  // Scrollbar: the standard `scrollbar-color` (what Chromium paints when it is set)
  // and the legacy ::-webkit-scrollbar thumb, each over its track on bg and surface.
  const [thumbStd, trackStd] = splitTop(ruleValue('.xray-app-root *, .xray-hud *', 'scrollbar-color'), ' ');
  const thumbWebkit = ruleValue('.xray-app-root *::-webkit-scrollbar-thumb, .xray-hud *::-webkit-scrollbar-thumb', 'background');
  for (const [under, underName] of [[bg, 'bg'], [surface, 'surface']]) {
    const track = over(color(trackStd), under);
    add(`scrollbar thumb vs track (on ${underName})`, color(thumbStd), track, 3);
    add(`webkit scrollbar thumb vs track (on ${underName})`, color(thumbWebkit), track, 3);
  }

  // API rows (T7): 4xx/5xx status text (red) on the selected-row tint, and each
  // row flag's text on its own tint, on a plain row and on the selected row.
  // SLOW, REPEATED and LARGE share one rule.
  const selectedValue = ruleValue('.xray-panel .xray-api-row.selected', 'background');
  assert.ok(selectedValue, 'selected API row background rule not found');
  const gradient = splitTop(selectedValue, ',')[0].match(/^linear-gradient\((.*)\)$/s);
  assert.ok(gradient, `selected row background is not a gradient: ${selectedValue}`);
  const selected = over(color(splitTop(gradient[1], ',')[1]), bg);
  add('red on selected row', color('var(--xray-red)'), selected, need);
  for (const [flag, selector] of [
    ['error', '.xray-api-flag.error'],
    ['slow', '.xray-api-flag.slow, .xray-api-flag.repeated, .xray-api-flag.large'],
    ['empty', '.xray-api-flag.empty'],
    ['pinned', '.xray-api-flag.pinned'],
  ]) {
    const fgValue = ruleValue(selector, 'color');
    const tint = ruleValue(selector, 'background');
    assert.ok(fgValue && tint, `${selector} colour/background rule not found`);
    const fgName = fgValue.match(/--xray-([a-z]+)/)[1];
    for (const [row, rowName] of [[bg, 'row'], [selected, 'selected row']]) add(`${fgName} on ${flag} flag (${rowName})`, color(fgValue), over(color(tint), row), need);
  }

  // Coloured text on its own tint (badges, chips, flags, banners): every rule that
  // paints `color: var(--xray-X)` over a `var(--xray-X)` tint, at the rule's own
  // tint, on surface and surface2.
  for (const { selector, fg, tint } of TINT_RULES) {
    const f = color(fg);
    for (const [host, hostName] of [[surface, 'surface'], [surface2, 'surface2']]) {
      add(`${fg.match(/--xray-([a-z0-9-]+)/)[1]} on own tint \`${selector}\` (${hostName})`, f, over(color(tint), host), need);
    }
  }

  // Export format chip (active): text and its <small> over the accent tint, which the
  // own-tint scan above cannot see (text colour and tint are different tokens). The
  // chip sits on the export rail (surface at .55) inside the modal (surface).
  const activeFormat = ruleValue('.xray-export-format.active', 'background');
  assert.match(activeFormat ?? '', /var\(--xray-accent\b/, 'active export format uses the accent tint, like the mode chips');
  const rail = over(color(ruleValue('.xray-export-rail', 'background')), surface);
  const chip = over(color(activeFormat), rail);
  for (const fg of [ruleValue('.xray-export-format.active', 'color'), ruleValue('.xray-export-format.active small', 'color')]) {
    add(`${fg} on active export format (export rail)`, color(fg), chip, need);
  }

  // Primary buttons: accent text over the panel-scope gradient (colour and tint
  // live in different rules, so the generic scan above cannot see this pair).
  const primary = ruleValue('.xray-panel .xray-operation-btn, .xray-panel .xray-action-btn.primary, .xray-panel .xray-btn.primary', 'background');
  const stops = primary?.match(/^linear-gradient\((.*)\)$/s);
  assert.ok(stops, `primary button background is not a gradient: ${primary}`);
  for (const stop of splitTop(stops[1], ',').slice(1)) {
    for (const [host, hostName] of [[surface, 'surface'], [surface2, 'surface2']]) {
      add(`accent on primary button stop ${stop} (${hostName})`, color('var(--xray-accent)'), over(color(stop), host), need);
    }
  }

  const fails = rows.filter((r) => r.ratio < r.min);
  return { name, rows, fails };
}

const fmt = (name, fails) => fails.map((r) => `  ${name}: ${r.label}  ${r.fg} / ${r.bg} = ${r.ratio.toFixed(2)} (need ${r.min})`).join('\n');

for (const [name, theme] of Object.entries(THEMES)) {
  test(`${name}: token pairs meet the contrast targets`, () => {
    const { fails } = matrix(name, theme);
    assert.equal(fails.length, 0, `failing pairs:\n${fmt(name, fails)}`);
  });
}

// Accent swatches as text on their own tint (the badge / primary-button tint),
// composited over the preset's --xray-bg, per the presets that use each palette.
// The badge and button hosts (tab bar, modal surfaces) are lighter than bg on the
// light presets, so this model is the stricter one there.
const TINT = 0.14;
function swatchFails(palette, themeNames) {
  const fails = [];
  for (const themeName of themeNames) {
    const { vars, need } = THEMES[themeName];
    const bg = parseColor('var(--xray-bg)', vars);
    for (const [id, accent] of Object.entries(palette)) {
      const a = parseColor(accent, vars);
      const tint = over([a[0], a[1], a[2], TINT], bg);
      const r = ratio(a, tint);
      if (r >= need) continue;
      fails.push({ label: `accent ${id} ${accent} on its ${Math.round(TINT * 100)}% tint`, fg: accent, bg: hex(tint), ratio: r, min: need, themeName });
    }
  }
  return fails;
}
test('every light accent swatch reads on its tint over Paper Relay and Claude', () => {
  const fails = swatchFails(LIGHT_ACCENTS, ['Paper Relay', 'Claude']);
  assert.equal(fails.length, 0, `failing pairs:\n${fails.map((f) => fmt(f.themeName, [f])).join('\n')}`);
});
test('every dark accent swatch reads on its tint over Signal Gray, Harbor and High Contrast (7:1)', () => {
  const fails = swatchFails(DARK_ACCENTS, ['Signal Gray', 'Harbor Instrument', 'High Contrast']);
  assert.equal(fails.length, 0, `failing pairs:\n${fails.map((f) => fmt(f.themeName, [f])).join('\n')}`);
});
test('the custom default accent reads on its tint over the custom background', () => {
  const vars = THEMES['Custom (defaults)'].vars;
  const bg = parseColor('var(--xray-bg)', vars);
  const a = parseColor(T.DEFAULT_CUSTOM_THEME.accent, vars);
  const r = ratio(a, over([a[0], a[1], a[2], TINT], bg));
  assert.ok(r >= 4.5, `custom accent ${T.DEFAULT_CUSTOM_THEME.accent} on its tint = ${r.toFixed(2)} (need 4.5)`);
});

// The evaluator itself: guards against a parser bug turning every pair green.
test('colour evaluator composites color-mix and var() fallbacks like the browser', () => {
  assert.deepEqual(parseColor('color-mix(in srgb, #ffffff 50%, black 50%)', {}).map(Math.round), [128, 128, 128, 1]);
  assert.deepEqual(parseColor('color-mix(in srgb, var(--x) 62%, transparent)', { '--x': '#102030' }).map((n) => +n.toFixed(2)), [16, 32, 48, 0.62]);
  assert.deepEqual(parseColor('var(--missing, black)', {}), [0, 0, 0, 1]);
  assert.deepEqual(parseColor('rgba(var(--rgb), .44)', { '--rgb': '1, 2, 3' }), [1, 2, 3, 0.44]);
  assert.equal(ratio([0, 0, 0, 1], [255, 255, 255, 1]).toFixed(1), '21.0');
});

// T1: custom themes carry the composite-well sink that matches their brightness.
test('custom themes emit a white sink when light and a black sink when dark', () => {
  assert.equal(T.buildCustomThemeVars(T.DEFAULT_CUSTOM_THEME)['--xray-sink'], '#000000');
  assert.equal(T.buildCustomThemeVars({ bg: '#faf9f6', surface: '#ffffff', text: '#1c1b19', accent: '#2563eb' })['--xray-sink'], '#ffffff');
});

// ── Hue preservation (fix round 4) ────────────────────────────────────────
// The builder's readability solve may move LIGHTNESS only: a solved status colour or
// preset accent must keep its hue (±15° OKLCH) and enough chroma (≥ 0.05) to still
// read as red / green / blue / … rather than washing out to grey or white. 0.05, not
// 0.06: at the 10 % own-tint cap, Nord's blue reaches 4.5:1 on its tint over surface2
// only at C ≈ 0.053 (the sRGB gamut narrows at that lightness); 0.06 would need a 6 %
// cap on every tint rule. For scale: round 3's washed-out Nord red #eed5e0 is C 0.031.
function oklch(hexValue) {
  const lin = (c) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  const n = parseInt(hexValue.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(lin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
  return { L, C: Math.hypot(A, B), H: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 };
}
const hueDelta = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
function hueKept(label, original, solved) {
  const o = oklch(original); const v = oklch(solved);
  const problems = [];
  if (hueDelta(o.H, v.H) > 15) problems.push(`${label}: hue ${o.H.toFixed(0)}° → ${v.H.toFixed(0)}° (${original} → ${solved})`);
  if (v.C < 0.05) problems.push(`${label}: chroma ${v.C.toFixed(3)} < 0.05 (${original} → ${solved})`);
  return problems;
}

// The builder's OKLCH helpers themselves: a bug here would move every solved colour.
test('rgb -> OKLCH -> rgb round-trips within 1 per channel', () => {
  const samples = ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#88c0d0', '#e8858d', '#f5a623', '#3f8a4f', '#6d6960', '#7f7f7f', '#123456'];
  for (const value of samples) {
    const rgb = [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16));
    const back = T.oklchInGamut(...T.rgbToOklch(rgb));
    rgb.forEach((c, i) => assert.ok(Math.abs(back[i] - c) <= 1, `${value} channel ${i}: ${c} -> ${back[i].toFixed(2)}`));
  }
});

test('oklchInGamut keeps the requested lightness when it has to cut chroma', () => {
  for (const L of [0.15, 0.3, 0.5, 0.7, 0.85]) {
    for (const h of [0, 1, 2, 3, 4, 5, 6]) { // radians: sweeps the hue circle
      const [L2] = T.rgbToOklch(T.oklchInGamut(L, 0.4, h)); // C 0.4 is outside sRGB everywhere
      assert.ok(Math.abs(L2 - L) < 0.005, `L ${L} h ${h}: got ${L2.toFixed(4)}`);
    }
  }
});

test('Theme Studio status colours keep their hue and chroma after the readability solve', () => {
  const problems = [];
  for (const { label, theme } of T.THEME_STUDIO_PRESETS) {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(theme.bg.slice(i, i + 2), 16));
    const palette = 0.2126 * r + 0.7152 * g + 0.0722 * b > 140 ? T.STATUS_PALETTES.light : T.STATUS_PALETTES.dark;
    const solved = T.resolveThemeColors(theme);
    for (const key of ['green', 'red', 'yellow', 'blue', 'mauve', 'teal', 'peach']) problems.push(...hueKept(`${label} ${key}`, palette[key], solved[key]));
    problems.push(...hueKept(`${label} pending`, palette.yellow, solved.pending));
  }
  assert.deepEqual(problems, []);
});

// The presets' brand accents before any readability adjustment.
const BRAND_ACCENTS = {
  Slate: '#9479ff', Graphite: '#22d3ee', 'Rosé': '#fb7185', Emerald: '#34d399', Nord: '#88c0d0',
  Solarized: '#268bd2', Amber: '#f5a623', Sakura: '#ec4899', Paper: '#2563eb', Sky: '#0284c7', Sage: '#3f8a4f',
};
test('Theme Studio preset accents stay recognisably their brand hue', () => {
  const problems = [];
  for (const { label, theme } of T.THEME_STUDIO_PRESETS) problems.push(...hueKept(`${label} accent`, BRAND_ACCENTS[label], theme.accent));
  assert.deepEqual(problems, []);
});

// Randomize: every accent it can pick, in both modes, yields a theme that passes the
// full matrix (seeds chosen so each accent is drawn once dark and twice light).
test('Randomize only produces readable themes', () => {
  const seeds = [...Array.from({ length: 20 }, (_, k) => k * 0.05), ...Array.from({ length: 10 }, (_, k) => 0.02 + k * 0.1)];
  const problems = [];
  for (const seed of seeds) {
    const theme = T.randomTheme(seed);
    const { fails } = matrix(`random ${seed}`, { vars: { ...baseTokens, ...T.buildCustomThemeVars(theme) }, need: 4.5 });
    if (fails.length) problems.push(`seed ${seed.toFixed(2)} (accent ${theme.accent}, bg ${theme.bg}):\n${fmt('random', fails.slice(0, 4))}${fails.length > 4 ? `\n  … +${fails.length - 4} more` : ''}`);
  }
  assert.equal(problems.length, 0, problems.join('\n'));
});
