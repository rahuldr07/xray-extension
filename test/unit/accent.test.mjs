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

// Backgrounds measured from the running panel for the two light presets.
const LIGHT_LAB_BG = '#edf3fb';
const CLAUDE_BG = '#f0eee6';
const DARK_BG = '#1e1e2e';

test('light presets are classified as light, dark presets as dark', () => {
  for (const theme of ['light-lab', 'claude']) {
    assert.equal(isLightTheme(settings({ theme })), true, `${theme} should be light`);
  }
  for (const theme of ['operator', 'dev-edition', 'midnight']) {
    assert.equal(isLightTheme(settings({ theme })), false, `${theme} should be dark`);
  }
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

test('dark themes keep the original pastel accents', () => {
  for (const accent of Object.keys(PANEL_ACCENT_VALUES)) {
    assert.equal(resolveAccentValue(settings({ theme: 'operator', accent })), PANEL_ACCENT_VALUES[accent]);
  }
});

test('light themes swap in the darkened accents', () => {
  for (const accent of Object.keys(PANEL_ACCENT_VALUES_LIGHT)) {
    assert.equal(resolveAccentValue(settings({ theme: 'light-lab', accent })), PANEL_ACCENT_VALUES_LIGHT[accent]);
    assert.equal(resolveAccentValue(settings({ theme: 'claude', accent })), PANEL_ACCENT_VALUES_LIGHT[accent]);
  }
});

test('every accent clears the 3:1 non-text contrast floor on both light themes', () => {
  // WCAG 1.4.11. The focus ring is drawn in the accent, so below 3:1 keyboard focus
  // is untrackable. The original pastels measured 1.33-2.80 here.
  for (const accent of Object.keys(PANEL_ACCENT_VALUES_LIGHT)) {
    for (const [name, bg] of [['light-lab', LIGHT_LAB_BG], ['claude', CLAUDE_BG]]) {
      const resolved = resolveAccentValue(settings({ theme: name, accent }));
      const ratio = contrast(resolved, bg);
      assert.ok(ratio >= 3, `${accent} on ${name} is ${ratio.toFixed(2)}:1, below the 3:1 floor`);
    }
  }
});

test('the original pastels really did fail on light backgrounds', () => {
  // Guards the premise of this whole mechanism: if someone reverts to using
  // PANEL_ACCENT_VALUES everywhere, this documents why that regressed.
  for (const accent of ['blue', 'mauve', 'teal', 'green']) {
    assert.ok(
      contrast(PANEL_ACCENT_VALUES[accent], LIGHT_LAB_BG) < 3,
      `${accent} pastel unexpectedly passes on a light background`,
    );
  }
});

test('dark themes are unaffected and still clear 3:1', () => {
  for (const accent of Object.keys(PANEL_ACCENT_VALUES)) {
    const ratio = contrast(resolveAccentValue(settings({ theme: 'operator', accent })), DARK_BG);
    assert.ok(ratio >= 3, `${accent} on operator is ${ratio.toFixed(2)}:1`);
  }
});
