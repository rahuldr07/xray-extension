/* The theme preset lineup (spec P1, P2, P3, V2). THEME_PRESETS is the single source for the
 * picker, isLightTheme, the accent solve and these tests; each preview and solve host must be
 * its token block's own value in styles.css, so the model can never drift from what the
 * preset paints. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { panelSettings as P } from './harness.mjs';

const styles = readFileSync(new URL('../../src/panel/styles.css', import.meta.url), 'utf8');

// Same block parser as themeContrast.test.mjs.
function themeBlock(id) {
  const m = styles.match(new RegExp('\\.xray-theme-' + id + '\\s*\\{([^}]*)\\}'));
  assert.ok(m, `.xray-theme-${id} token block not found in styles.css`);
  return Object.fromEntries([...m[1].matchAll(/(--xray-[a-z0-9-]+)\s*:\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]));
}

// P1, in picker order (Custom is rendered after these, from the user's own theme).
const LINEUP = [
  ['xray-dark', 'XRAY Dark', 'dark'],
  ['xray-light', 'XRAY Light', 'light'],
  ['github-dark', 'GitHub Dark', 'dark'],
  ['github-light', 'GitHub Light', 'light'],
  ['tokyo-night', 'Tokyo Night', 'dark'],
  ['catppuccin-mocha', 'Catppuccin Mocha', 'dark'],
  ['dracula', 'Dracula', 'dark'],
  ['gruvbox-dark', 'Gruvbox Dark', 'dark'],
  ['midnight', 'High Contrast', 'dark'],
];
const RETIRED = ['operator', 'dev-edition', 'light-lab', 'claude'];
const presets = () => {
  assert.ok(Array.isArray(P.THEME_PRESETS), 'panelSettings exports THEME_PRESETS');
  return P.THEME_PRESETS;
};
const settings = (patch) => ({ ...P.DEFAULT_PANEL_SETTINGS, ...patch });
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

test('THEME_PRESETS is the P1 lineup in picker order', () => {
  assert.deepEqual(presets().map(({ id, label, kind }) => [id, label, kind]), LINEUP);
  // The contrast target each preset is held to (and its picked accents are solved for).
  for (const { id, contrast } of presets()) assert.equal(contrast, id === 'midnight' ? 7 : 4.5, id);
});

test('each swatch preview and accent-solve host is its token block\'s own value', () => {
  for (const { id, preview, hosts } of presets()) {
    const block = themeBlock(id);
    assert.deepEqual(preview, { bg: block['--xray-bg'], accent: block['--xray-accent'], text: block['--xray-text'] }, id);
    assert.deepEqual(hosts, { surface: block['--xray-surface'], surface2: block['--xray-surface2'], mauve: block['--xray-mauve'] }, id);
  }
});

test('light presets composite toward a white sink; dark presets keep the black fallback', () => {
  for (const { id, kind } of presets()) {
    assert.equal(themeBlock(id)['--xray-sink'], kind === 'light' ? '#ffffff' : undefined, id);
  }
});

test('isLightTheme follows each preset\'s kind, and a picked accent starts from that kind\'s swatch table', () => {
  for (const { id, kind } of presets()) {
    assert.equal(P.isLightTheme(settings({ theme: id })), kind === 'light', id);
    assert.equal(P.resolveAccentValue(settings({ theme: id })), undefined, `${id}: its own accent while none is picked`);
    const table = kind === 'light' ? P.PANEL_ACCENT_VALUES_LIGHT : P.PANEL_ACCENT_VALUES;
    // Teal reads on every preset as it is, so it is applied unchanged: the table value itself.
    assert.equal(P.resolveAccentValue(settings({ theme: id, accent: 'teal', accentChosen: true })), table.teal, id);
  }
});

test('retired ids are not themes: they leave the picker, migrate on load, and their blocks are gone', () => {
  const ids = presets().map(({ id }) => id);
  for (const id of ids) assert.equal(P.normalizePanelSettings({ theme: id }).theme, id);
  for (const retired of RETIRED) {
    assert.equal(ids.includes(retired), false, `${retired} is not offered`);
    assert.equal(P.normalizePanelSettings({ theme: retired }).theme, P.RETIRED_THEMES[retired].to, `${retired} migrates`);
    assert.doesNotMatch(styles, new RegExp(`\\.xray-theme-${retired}\\b`), `${retired} has no styles left`);
  }
  assert.equal(ids.includes('custom'), false, 'Custom is not a preset');
});

test('each block\'s background grid is tinted with its own accent', () => {
  for (const { id } of presets()) {
    const block = themeBlock(id);
    const grid = block['--xray-operator-grid']?.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)$/);
    assert.ok(grid, `${id}: --xray-operator-grid is an rgba() of the accent`);
    assert.deepEqual(grid.slice(1, 4).map(Number), rgb(block['--xray-accent']), `${id}: grid RGB = accent ${block['--xray-accent']}`);
  }
});

// ── Distinct meanings (CIEDE2000) ───────────────────────────────────────────
// The accent marks state (active tab, selection, focus); red, peach, yellow, green, blue and
// teal carry status and data meanings (blue: POST and info; teal: JSON numbers, WebSocket).
// Within a preset each of these pairs must be clearly different (ΔE2000 ≥ 10): an accent that
// is also the warning colour is exactly the retired Signal Gray defect (the active tab read as
// "slow"), so no pair may share a colour.
function lab(hex) {
  const lin = (c) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  const [r, g, b] = rgb(hex).map(lin);
  const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  const x = f((0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047);
  const y = f(0.2126729 * r + 0.7151522 * g + 0.0721750 * b);
  const z = f((0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / 1.08883);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}
function deltaE2000([L1, a1, b1], [L2, a2, b2]) {
  const rad = Math.PI / 180;
  const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2), Cm = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cm ** 7 / (Cm ** 7 + 25 ** 7)));
  const a1p = (1 + G) * a1, a2p = (1 + G) * a2;
  const C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2);
  const hue = (b, a) => (a === 0 && b === 0 ? 0 : (Math.atan2(b, a) / rad + 360) % 360);
  const h1 = hue(b1, a1p), h2 = hue(b2, a2p);
  let dh = 0;
  if (C1p * C2p !== 0) { dh = h2 - h1; if (dh > 180) dh -= 360; else if (dh < -180) dh += 360; }
  const dH = 2 * Math.sqrt(C1p * C2p) * Math.sin((dh * rad) / 2);
  const Lm = (L1 + L2) / 2, Cmp = (C1p + C2p) / 2;
  let hm = h1 + h2;
  if (C1p * C2p !== 0) hm = Math.abs(h1 - h2) <= 180 ? hm / 2 : (hm < 360 ? (hm + 360) / 2 : (hm - 360) / 2);
  const T = 1 - 0.17 * Math.cos((hm - 30) * rad) + 0.24 * Math.cos(2 * hm * rad) + 0.32 * Math.cos((3 * hm + 6) * rad) - 0.2 * Math.cos((4 * hm - 63) * rad);
  const SL = 1 + (0.015 * (Lm - 50) ** 2) / Math.sqrt(20 + (Lm - 50) ** 2), SC = 1 + 0.045 * Cmp, SH = 1 + 0.015 * Cmp * T;
  const RT = -Math.sin(2 * 30 * Math.exp(-(((hm - 275) / 25) ** 2)) * rad) * 2 * Math.sqrt(Cmp ** 7 / (Cmp ** 7 + 25 ** 7));
  return Math.sqrt(((L2 - L1) / SL) ** 2 + ((C2p - C1p) / SC) ** 2 + (dH / SH) ** 2 + RT * ((C2p - C1p) / SC) * (dH / SH));
}

test('the CIEDE2000 evaluator matches the published reference pairs', () => {
  // Sharma, Wu & Dalal (2005), pairs 1, 2, 7 and 17–20.
  for (const [a, b, expected] of [
    [[50, 2.6772, -79.7751], [50, 0, -82.7485], 2.0425], [[50, 3.1571, -77.2803], [50, 0, -82.7485], 2.8615],
    [[50, 0, 0], [50, -1, 2], 2.3669], [[50, 2.5, 0], [73, 25, -18], 27.1492], [[50, 2.5, 0], [61, -5, 29], 22.8977],
    [[50, 2.5, 0], [56, -27, -3], 31.903], [[50, 2.5, 0], [58, 24, 15], 19.4535],
  ]) assert.equal(deltaE2000(a, b).toFixed(4), expected.toFixed(4), JSON.stringify([a, b]));
});

test('accent, error, warning and status colours stay distinct in every preset (ΔE2000 ≥ 10)', () => {
  const PAIRS = [['accent', 'red'], ['accent', 'peach'], ['accent', 'yellow'], ['accent', 'green'], ['accent', 'blue'], ['accent', 'teal'], ['red', 'peach'], ['red', 'yellow'], ['blue', 'teal']];
  const problems = [];
  for (const { id } of presets()) {
    const block = themeBlock(id);
    for (const [x, y] of PAIRS) {
      const [a, b] = [block[`--xray-${x}`], block[`--xray-${y}`]];
      const d = deltaE2000(lab(a), lab(b));
      if (d < 10) problems.push(`${id}: ${x} ${a} vs ${y} ${b} ΔE2000 ${d.toFixed(2)}`);
    }
  }
  assert.deepEqual(problems, []);
  // The closest pair in the lineup, accepted at 10.005 (ruling) and pinned to a narrow band, so a
  // later nudge to either colour fails here first, in either direction.
  const github = themeBlock('github-light');
  const closest = deltaE2000(lab(github['--xray-accent']), lab(github['--xray-blue']));
  assert.ok(closest >= 10 && closest < 10.1, `GitHub Light accent vs blue ΔE2000 ${closest.toFixed(4)} left [10, 10.1)`);
});

// The pop-out window paints its document behind the panel; window.html reads the theme back
// with :has() and must use each block's own --xray-bg (no dark slab around a light preset).
test('the pop-out window background follows every preset', () => {
  const html = readFileSync(new URL('../../window.html', import.meta.url), 'utf8');
  const bgs = Object.fromEntries([...html.matchAll(/:root:has\(\.xray-theme-([a-z0-9-]+)\)\s*\{\s*--xray-window-bg:\s*(#[0-9a-f]{6});\s*\}/g)].map(([, id, bg]) => [id, bg]));
  assert.deepEqual(Object.keys(bgs), presets().map(({ id }) => id), 'one rule per preset, in lineup order');
  for (const { id, preview } of presets()) assert.equal(bgs[id], preview.bg, id);
  assert.match(html, /:root \{ --xray-window-bg: #141517; \}/, 'before the panel mounts: the XRAY Dark default');
});
