/* Behavioural tests for the semantic theme contract and explicit accent precedence. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { customTheme as T, panelSettings as P } from './harness.mjs';

const { DEFAULT_CUSTOM_THEME, buildCustomThemeVars, encodeTheme, decodeTheme, normalizeCustomTheme } = T;
const { DEFAULT_PANEL_SETTINGS, resolveAccentValue } = P;

const SEMANTIC_VARS = [
  '--xray-bg', '--xray-surface', '--xray-surface2', '--xray-surface3',
  '--xray-text', '--xray-subtext', '--xray-hint',
  '--xray-border', '--xray-border-control', '--xray-focus', '--xray-selection',
  '--xray-hover', '--xray-active', '--xray-disabled',
  '--xray-accent', '--xray-accent-soft',
  '--xray-green', '--xray-yellow', '--xray-red', '--xray-blue', '--xray-pending', '--xray-neutral',
  '--xray-shadow', '--xray-overlay',
];

test('custom themes emit every semantic role as a concrete scoped variable', () => {
  const vars = buildCustomThemeVars(DEFAULT_CUSTOM_THEME);
  for (const name of SEMANTIC_VARS) {
    assert.equal(typeof vars[name], 'string', `${name} must be emitted`);
    assert.notEqual(vars[name].trim(), '', `${name} must not be empty`);
  }
});

test('custom explicit accent wins over the legacy preset accent resolver', () => {
  const settings = {
    ...DEFAULT_PANEL_SETTINGS,
    theme: 'custom',
    customTheme: { ...DEFAULT_CUSTOM_THEME, accent: '#f59e0b' },
  };
  assert.equal(resolveAccentValue(settings), '#f59e0b');
});

test('share codes preserve explicit semantic colors without rewriting them', () => {
  const colors = normalizeCustomTheme({
    ...DEFAULT_CUSTOM_THEME,
    accent: '#f59e0b',
    border: '#b87333',
    focus: '#ffcc66',
    shadow: '#111111',
    overlay: '#222222',
  });
  const decoded = decodeTheme(encodeTheme({ colors }));
  assert.deepEqual(decoded.colors, colors);
  const vars = buildCustomThemeVars(colors);
  assert.equal(vars['--xray-shadow'], '#111111');
  assert.equal(vars['--xray-overlay'], '#222222');
});
