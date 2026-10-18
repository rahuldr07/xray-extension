/* Behavioural tests for the theme-aware accent resolution in models/panelSettings.ts. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { panelSettings as P } from './harness.mjs';

const {
  DEFAULT_PANEL_SETTINGS,
  PANEL_ACCENT_VALUES,
  PANEL_ACCENT_VALUES_LIGHT,
  isLightTheme,
  resolveAccentValue,
} = P;

const settings = (patch) => ({ ...DEFAULT_PANEL_SETTINGS, ...patch });
// A swatch the user picked (spec P2: only a picked accent is applied over the preset's own).
const picked = (theme, accent) => resolveAccentValue(settings({ theme, accent, accentChosen: true }));

// WCAG relative luminance and contrast, so the thresholds below are measured rather
// than asserted by eye.
function luminance(hex) {
  const value = hex.replace('#', '');
  const channels = [0, 2, 4].map((i) => {
    const c = parseInt(value.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const LIGHT = P.THEME_PRESETS.filter(({ kind }) => kind === 'light');
const DARK = P.THEME_PRESETS.filter(({ kind }) => kind === 'dark');

test('light presets are classified as light, dark presets as dark', () => {
  assert.deepEqual(LIGHT.map(({ id }) => id), ['xray-light', 'github-light']);
  for (const { id } of LIGHT) assert.equal(isLightTheme(settings({ theme: id })), true, `${id} should be light`);
  for (const { id } of DARK) assert.equal(isLightTheme(settings({ theme: id })), false, `${id} should be dark`);
});

test('a custom theme is classified by its actual background, not by name', () => {
  const light = settings({ theme: 'custom', customTheme: { ...DEFAULT_PANEL_SETTINGS.customTheme, bg: '#ffffff' } });
  const dark = settings({ theme: 'custom', customTheme: { ...DEFAULT_PANEL_SETTINGS.customTheme, bg: '#101014' } });
  assert.equal(isLightTheme(light), true);
  assert.equal(isLightTheme(dark), false);
});

test('a malformed custom background falls back to the dark palette', () => {
  // Failing open to the dark accent is the safer default: the dark accents still
  // reach ~5:1 on a light background's worst case, whereas the reverse does not.
  for (const bg of ['', 'nope', '#fff', undefined]) {
    const s = settings({ theme: 'custom', customTheme: { ...DEFAULT_PANEL_SETTINGS.customTheme, bg } });
    assert.equal(isLightTheme(s), false, `bg ${JSON.stringify(bg)} should not be treated as light`);
  }
});

test('no accent is applied over a preset until the user picks one', () => {
  for (const { id } of P.THEME_PRESETS) {
    for (const accent of Object.keys(PANEL_ACCENT_VALUES)) {
      assert.equal(resolveAccentValue(settings({ theme: id, accent, accentChosen: false })), undefined, `${id} ${accent}`);
    }
  }
});

test('XRAY Dark keeps the original pastel accents', () => {
  for (const accent of Object.keys(PANEL_ACCENT_VALUES)) {
    assert.equal(picked('xray-dark', accent), PANEL_ACCENT_VALUES[accent]);
  }
});

test('light presets swap in the darkened accents', () => {
  for (const accent of Object.keys(PANEL_ACCENT_VALUES_LIGHT)) {
    for (const { id } of LIGHT) assert.equal(picked(id, accent), PANEL_ACCENT_VALUES_LIGHT[accent], `${id} ${accent}`);
  }
});

test('every picked accent clears the 3:1 non-text contrast floor on the light presets', () => {
  // WCAG 1.4.11. The focus ring is drawn in the accent, so below 3:1 keyboard focus
  // is untrackable. The original pastels measured 1.33-2.80 here.
  for (const accent of Object.keys(PANEL_ACCENT_VALUES_LIGHT)) {
    for (const { id, preview } of LIGHT) {
      const ratio = contrast(picked(id, accent), preview.bg);
      assert.ok(ratio >= 3, `${accent} on ${id} is ${ratio.toFixed(2)}:1, below the 3:1 floor`);
    }
  }
});

test('the original pastels really did fail on light backgrounds', () => {
  // Guards the premise of this whole mechanism: if someone reverts to using
  // PANEL_ACCENT_VALUES everywhere, this documents why that regressed.
  for (const accent of ['blue', 'mauve', 'teal', 'green']) {
    for (const { id, preview } of LIGHT) {
      assert.ok(contrast(PANEL_ACCENT_VALUES[accent], preview.bg) < 3, `${accent} pastel unexpectedly passes on ${id}`);
    }
  }
});

test('every picked accent clears 3:1 on the dark presets', () => {
  for (const accent of Object.keys(PANEL_ACCENT_VALUES)) {
    for (const { id, preview } of DARK) {
      const ratio = contrast(picked(id, accent), preview.bg);
      assert.ok(ratio >= 3, `${accent} on ${id} is ${ratio.toFixed(2)}:1`);
    }
  }
});
