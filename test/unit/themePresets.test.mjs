/* The theme preset lineup (spec P1, P2, P3, V2). THEME_PRESETS is the single source for the
 * picker, isLightTheme, the accent solve and these tests; each preview and solve host must be
 * its token block's own value in styles.css, so the model can never drift from what the
 * preset paints. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { panelSettings as P } from './harness.mjs';
import { lab, deltaE2000 } from './colourDistance.mjs';

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

test('each block\'s focus ring follows the effective accent (the block\'s own, or a swatch set inline over it)', () => {
  // The inline --xray-accent sits on the same elements as the theme class, so var() resolves to it.
  for (const { id } of presets()) assert.equal(themeBlock(id)['--xray-focus'], 'var(--xray-accent)', id);
});

// The accent-derived state tints follow the effective accent like the focus ring: a swatch picked
// over a preset re-tints the selected row, the pressed state, the active tab's fill and the Glow
// grid (Task 3 ruling: Glow follows a picked swatch). Each is a color-mix of var(--xray-accent);
// the percentages reproduce the lineup's own values (assets/2026-10-14-theme-lineup.css).
test('each block\'s selection, active, accent-soft and Glow grid tints follow the effective accent', () => {
  for (const { id } of presets()) {
    const block = themeBlock(id);
    for (const key of ['selection', 'active']) {
      assert.match(block[`--xray-${key}`] ?? '', /^color-mix\(in srgb, var\(--xray-accent\) [\d.]+%, var\(--xray-bg\)\)$/, `${id}: --xray-${key} is a tint of the effective accent`);
    }
    assert.equal(block['--xray-accent-soft'], 'var(--xray-selection)', `${id}: the active tab's fill is the selection tint`);
    assert.match(block['--xray-operator-grid'] ?? '', /^color-mix\(in srgb, var\(--xray-accent\) [\d.]+%, transparent\)$/, `${id}: the Glow grid is the effective accent`);
  }
});

// ── Distinct meanings (CIEDE2000) ───────────────────────────────────────────
// The accent marks state (active tab, selection, focus); red, peach, yellow, green, blue, teal
// and mauve carry status and data meanings (blue: POST and info; teal: JSON numbers, WebSocket;
// mauve: JSON booleans, syntax keywords).
// Within a preset each of these pairs must be clearly different (ΔE2000 ≥ 10): an accent that
// is also the warning colour is exactly the retired Signal Gray defect (the active tab read as
// "slow"), so no pair may share a colour.
test('the CIEDE2000 evaluator matches the published reference pairs', () => {
  // Sharma, Wu & Dalal (2005), pairs 1, 2, 7 and 17–20.
  for (const [a, b, expected] of [
    [[50, 2.6772, -79.7751], [50, 0, -82.7485], 2.0425], [[50, 3.1571, -77.2803], [50, 0, -82.7485], 2.8615],
    [[50, 0, 0], [50, -1, 2], 2.3669], [[50, 2.5, 0], [73, 25, -18], 27.1492], [[50, 2.5, 0], [61, -5, 29], 22.8977],
    [[50, 2.5, 0], [56, -27, -3], 31.903], [[50, 2.5, 0], [58, 24, 15], 19.4535],
  ]) assert.equal(deltaE2000(a, b).toFixed(4), expected.toFixed(4), JSON.stringify([a, b]));
});

test('accent, error, warning and status colours stay distinct in every preset (ΔE2000 ≥ 10)', () => {
  const PAIRS = [['accent', 'red'], ['accent', 'peach'], ['accent', 'yellow'], ['accent', 'green'], ['accent', 'blue'], ['accent', 'teal'], ['accent', 'mauve'], ['red', 'peach'], ['red', 'yellow'], ['blue', 'teal']];
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
// The DevTools page is its twin (final review M-1): the same table, no frozen dark slab.
for (const [surfaceName, file] of [['pop-out window', 'window.html'], ['DevTools page', 'devtools/devtools-panel.html']]) {
  test(`the ${surfaceName} background follows every preset`, () => {
    const html = readFileSync(new URL('../../' + file, import.meta.url), 'utf8');
    const bgs = Object.fromEntries([...html.matchAll(/:root:has\(\.xray-theme-([a-z0-9-]+)\)\s*\{\s*--xray-window-bg:\s*(#[0-9a-f]{6});\s*\}/g)].map(([, id, bg]) => [id, bg]));
    assert.deepEqual(Object.keys(bgs), presets().map(({ id }) => id), 'one rule per preset, in lineup order');
    for (const { id, preview } of presets()) assert.equal(bgs[id], preview.bg, id);
    assert.match(html, /:root \{ --xray-window-bg: #141517; \}/, 'before the panel mounts: the XRAY Dark default');
    assert.match(html, /background: var\(--xray-window-bg\);/, 'the document paints it');
    assert.doesNotMatch(html.match(/<style>([\s\S]*?)<\/style>/)[1].replace(/:root[^{]*\{[^}]*\}/g, ''), /#[0-9a-f]{3,6}\b/i, 'no other literal colour');
  });
}

// Spec P2 + final-review ruling: the six accent swatches stay mutually distinct (ΔE2000 ≥ 10)
// after each is solved for a preset, so no two swatches in Settings → Appearance paint the same
// colour. Only swatch-vs-swatch pairs count: a swatch that lands on the preset's own accent
// (Lavender on Catppuccin Mocha) is accepted — picking the theme's own colour is a valid pick.
test('the accent swatches stay mutually distinct after solving on every preset (ΔE2000 ≥ 10)', () => {
  const swatches = Object.keys(P.PANEL_ACCENT_VALUES);
  const problems = [];
  for (const { id } of presets()) {
    const solved = swatches.map((accent) => [accent, P.accentSwatchValue(settings({ theme: id }), accent)]);
    for (let i = 0; i < solved.length; i += 1) {
      for (let j = i + 1; j < solved.length; j += 1) {
        const d = deltaE2000(lab(solved[i][1]), lab(solved[j][1]));
        if (d < 10) problems.push(`${id}: ${solved[i][0]} ${solved[i][1]} vs ${solved[j][0]} ${solved[j][1]} ΔE2000 ${d.toFixed(2)}`);
      }
    }
  }
  assert.deepEqual(problems, []);
});
