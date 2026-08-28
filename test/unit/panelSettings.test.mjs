/* Behavioural tests for src/panel/models/panelSettings.ts — every clamp boundary. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { panelSettings as P, customTheme as T } from './harness.mjs';

const {
  DEFAULT_PANEL_SETTINGS,
  PANEL_ACCENT_VALUES,
  PANEL_FONT_VALUES,
  PANEL_WIDTH_MAX,
  PANEL_WIDTH_MIN,
  normalizePanelSettings,
} = P;

const at = (key, value) => normalizePanelSettings({ [key]: value })[key];

test('normalizePanelSettings(undefined) returns the defaults verbatim', () => {
  assert.deepEqual(normalizePanelSettings(undefined), DEFAULT_PANEL_SETTINGS);
  assert.deepEqual(normalizePanelSettings({}), DEFAULT_PANEL_SETTINGS);
  assert.deepEqual(normalizePanelSettings(null), DEFAULT_PANEL_SETTINGS);
});

test('normalizePanelSettings is idempotent and never leaks unknown keys', () => {
  const once = normalizePanelSettings({ maxEntries: 99999, theme: 'nonsense', bogusKey: 'x' });
  assert.deepEqual(normalizePanelSettings(once), once);
  assert.equal('bogusKey' in once, false);
  assert.deepEqual(Object.keys(once).sort(), Object.keys(DEFAULT_PANEL_SETTINGS).sort());
});

// ------------------------------------------------------------ numeric clamps

const NUMERIC_BOUNDS = [
  ['maxEntries', 50, 5000, 1000],
  ['slowThresholdMs', 100, 5000, 500],
  ['verySlowThresholdMs', 200, 10_000, 1000],
  ['radius', 0, 20, 10],
  ['panelWidth', PANEL_WIDTH_MIN, PANEL_WIDTH_MAX, 960],
  ['apiSplit', 0, 2000, 0],
  ['logsSplit', 0, 2000, 0],
];

test('every numeric setting clamps at both bounds', () => {
  for (const [key, min, max] of NUMERIC_BOUNDS) {
    assert.equal(at(key, min), min, `${key} accepts its minimum`);
    assert.equal(at(key, max), max, `${key} accepts its maximum`);
    assert.equal(at(key, min - 1), min, `${key} clamps below its minimum`);
    assert.equal(at(key, max + 1), max, `${key} clamps above its maximum`);
    assert.equal(at(key, -Number.MAX_SAFE_INTEGER), min, `${key} clamps a huge negative`);
    assert.equal(at(key, Number.MAX_SAFE_INTEGER), max, `${key} clamps a huge positive`);
    assert.equal(at(key, min + 0.4), min, `${key} rounds within range`);
  }
});

test('every numeric setting falls back (not clamps) for a non-finite value', () => {
  for (const [key, min, max, fallback] of NUMERIC_BOUNDS) {
    for (const bad of [NaN, Infinity, -Infinity, 'text', {}, [1, 2], undefined]) {
      assert.equal(at(key, bad), fallback, `${key} = ${String(bad)} should fall back to ${fallback}`);
    }
    assert.equal(at(key, '250'), Math.min(max, Math.max(min, 250)), `${key} coerces numeric strings`);
  }
});

test('null and [] coerce to 0 for numeric settings, so they clamp to the minimum rather than falling back', () => {
  // Number(null) === 0 and Number([]) === 0 are finite, so clampNumber never
  // reaches its fallback. A persisted `maxEntries: null` therefore becomes 50,
  // not the 1000 default.
  for (const [key, min, , fallback] of NUMERIC_BOUNDS) {
    assert.equal(at(key, null), min, `${key} = null`);
    assert.equal(at(key, []), min, `${key} = []`);
    if (min !== fallback) assert.notEqual(at(key, null), fallback, `${key} does not fall back for null`);
  }
});

test('the numeric defaults all sit inside their own clamps', () => {
  for (const [key, min, max, fallback] of NUMERIC_BOUNDS) {
    assert.equal(DEFAULT_PANEL_SETTINGS[key], fallback, `${key} default`);
    assert.ok(fallback >= min && fallback <= max, `${key} default ${fallback} outside ${min}..${max}`);
  }
});

test('slow / very-slow thresholds are clamped independently (they can be inverted)', () => {
  const inverted = normalizePanelSettings({ slowThresholdMs: 5000, verySlowThresholdMs: 200 });
  assert.equal(inverted.slowThresholdMs, 5000);
  assert.equal(inverted.verySlowThresholdMs, 200, 'no cross-field consistency check exists');
});

// ------------------------------------------------------------ boolean fields

test('captureWs is the one boolean that treats undefined as true', () => {
  assert.equal(normalizePanelSettings({ captureWs: undefined }).captureWs, true);
  assert.equal(normalizePanelSettings({}).captureWs, true);
  assert.equal(normalizePanelSettings({ captureWs: false }).captureWs, false);
  assert.equal(normalizePanelSettings({ captureWs: 0 }).captureWs, false, 'anything falsy but defined is false');
  assert.equal(normalizePanelSettings({ captureWs: '' }).captureWs, false);
  assert.equal(normalizePanelSettings({ captureWs: null }).captureWs, false, 'null is defined, so it coerces to false');
  assert.equal(normalizePanelSettings({ captureWs: 'yes' }).captureWs, true);
});

test('the other booleans are plain Boolean() coercions', () => {
  const keys = ['captureFetch', 'captureXhr', 'compactRows', 'showHostInPath', 'glow', 'hacker', 'confirmDestructiveActions'];
  for (const key of keys) {
    assert.equal(at(key, false), false, `${key} false`);
    assert.equal(at(key, true), true, `${key} true`);
    assert.equal(at(key, 0), false, `${key} 0`);
    assert.equal(at(key, 'x'), true, `${key} truthy string`);
    assert.equal(at(key, null), false, `${key} null`);
    assert.equal(at(key, []), true, `${key} [] is truthy in JS`);
  }
});

test('an explicit undefined turns every boolean except captureWs OFF, even ones that default to true', () => {
  // `{ ...DEFAULTS, ...input }` lets an explicit `key: undefined` shadow the
  // default, and Boolean(undefined) is false. Only captureWs has the
  // `=== undefined ? true` guard. A stored preferences blob that round-trips
  // through JSON never hits this (JSON drops undefined), but an in-memory
  // partial update does.
  const trueByDefault = ['captureFetch', 'captureXhr', 'showHostInPath', 'glow', 'confirmDestructiveActions'];
  for (const key of trueByDefault) {
    assert.equal(DEFAULT_PANEL_SETTINGS[key], true, `${key} default`);
    assert.equal(at(key, undefined), false, `${key} = undefined silently turns off`);
  }
  assert.equal(at('captureWs', undefined), true, 'captureWs is the documented exception');
});

// --------------------------------------------------------------- enum fields

const ENUMS = [
  ['defaultDetailView', ['tree', 'grid', 'raw', 'schema', 'diff', 'viz', 'waterfall', 'headers'], 'tree'],
  ['accent', ['blue', 'mauve', 'teal', 'green', 'peach', 'coral'], 'blue'],
  ['theme', ['operator', 'dev-edition', 'midnight', 'light-lab', 'claude', 'custom'], 'operator'],
  ['font', ['jetbrains', 'cascadia', 'iosevka', 'system'], 'jetbrains'],
  ['density', ['compact', 'comfortable', 'spacious'], 'compact'],
  ['dockSide', ['left', 'right'], 'right'],
];

test('every enum setting accepts its whole domain and rejects everything else', () => {
  for (const [key, allowed, fallback] of ENUMS) {
    for (const value of allowed) assert.equal(at(key, value), value, `${key} should accept ${value}`);
    for (const bad of ['', 'NOPE', 'Tree', 0, 1, null, {}, [], true]) {
      assert.equal(at(key, bad), fallback, `${key} = ${JSON.stringify(bad)} should fall back to ${fallback}`);
    }
    assert.equal(DEFAULT_PANEL_SETTINGS[key], fallback, `${key} default`);
  }
});

test('PANEL_ACCENT_VALUES and PANEL_FONT_VALUES cover their whole enum', () => {
  const accents = ENUMS.find(([key]) => key === 'accent')[1];
  const fonts = ENUMS.find(([key]) => key === 'font')[1];
  assert.deepEqual(Object.keys(PANEL_ACCENT_VALUES).sort(), [...accents].sort());
  assert.deepEqual(Object.keys(PANEL_FONT_VALUES).sort(), [...fonts].sort());
  for (const value of Object.values(PANEL_ACCENT_VALUES)) assert.ok(T.isHex(value), `${value} must be a hex color`);
  for (const value of Object.values(PANEL_FONT_VALUES)) assert.match(value, /monospace$/, 'every font stack ends in a generic monospace fallback');
});

// ------------------------------------------------------------- custom theme

test('customTheme is normalized through the theme model', () => {
  assert.deepEqual(normalizePanelSettings({}).customTheme, T.DEFAULT_CUSTOM_THEME);
  assert.deepEqual(normalizePanelSettings({ customTheme: 'garbage' }).customTheme, T.DEFAULT_CUSTOM_THEME);
  assert.deepEqual(normalizePanelSettings({ customTheme: { bg: '#abc' } }).customTheme, {
    ...T.DEFAULT_CUSTOM_THEME,
    bg: '#aabbcc',
  });
  const withOverride = normalizePanelSettings({ customTheme: { ...T.DEFAULT_CUSTOM_THEME, border: '#FF0000' } }).customTheme;
  assert.equal(withOverride.border, '#ff0000', 'per-token overrides survive settings normalization');
});

test('PANEL_WIDTH_MIN/MAX are the wired bounds', () => {
  assert.equal(PANEL_WIDTH_MIN, 360);
  assert.equal(PANEL_WIDTH_MAX, 2000);
  assert.equal(normalizePanelSettings({ panelWidth: 359 }).panelWidth, 360);
  assert.equal(normalizePanelSettings({ panelWidth: 2001 }).panelWidth, 2000);
});

test('a fully hostile settings blob normalizes into something the panel can render', () => {
  const settings = normalizePanelSettings({
    captureFetch: 'x', captureXhr: null, captureWs: null,
    maxEntries: -99, slowThresholdMs: 1e12, verySlowThresholdMs: 'soon',
    defaultDetailView: '<script>', compactRows: [], showHostInPath: 0,
    accent: 42, theme: {}, customTheme: [], font: null, density: 'ULTRA',
    radius: 1e9, glow: '', hacker: 'yes', confirmDestructiveActions: undefined,
    panelWidth: NaN, dockSide: 'up', apiSplit: -5, logsSplit: 1e9,
  });
  assert.deepEqual(settings, {
    ...DEFAULT_PANEL_SETTINGS,
    captureFetch: true,
    captureXhr: false,
    captureWs: false,
    maxEntries: 50,
    slowThresholdMs: 5000,
    verySlowThresholdMs: 1000,
    compactRows: true,
    showHostInPath: false,
    radius: 20,
    glow: false,
    hacker: true,
    confirmDestructiveActions: false,
    apiSplit: 0,
    logsSplit: 2000,
  });
});
