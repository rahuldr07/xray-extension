/* Behavioural tests for src/panel/models/customTheme.ts. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { customTheme as T } from './harness.mjs';

const {
  BASE_KEYS,
  DEFAULT_CUSTOM_THEME,
  OVERRIDE_KEYS,
  TOKEN_KEYS,
  buildCustomThemeVars,
  clampHex,
  contrastGrade,
  contrastRatio,
  decodeTheme,
  encodeTheme,
  exportThemeCss,
  generateFromAccent,
  isHex,
  isTokenOverridden,
  normalizeCustomTheme,
  parseThemeInput,
  randomTheme,
  resolveThemeColors,
  themeOverrides,
  themePackageToSettings,
} = T;

// A tiny deterministic PRNG so the property tests are reproducible.
function makeRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x1_0000_0000;
  };
}

function randomHex(rand) {
  return '#' + Math.floor(rand() * 0xffffff).toString(16).padStart(6, '0');
}

// ------------------------------------------------------------------ hex I/O

test('isHex accepts only #rrggbb', () => {
  assert.equal(isHex('#0f1117'), true);
  assert.equal(isHex('#0F1117'), true);
  assert.equal(isHex('#fff'), false);
  assert.equal(isHex('0f1117'), false);
  assert.equal(isHex('#0f11177'), false);
  assert.equal(isHex(null), false);
  assert.equal(isHex(0x0f1117), false);
});

test('clampHex normalizes bare, short and mixed-case hex and falls back otherwise', () => {
  assert.equal(clampHex('#AABBCC', '#000000'), '#aabbcc');
  assert.equal(clampHex('aabbcc', '#000000'), '#aabbcc', 'bare 6-digit hex gains its #');
  assert.equal(clampHex('#abc', '#000000'), '#aabbcc', '3-digit hex expands');
  assert.equal(clampHex('  #abc  ', '#000000'), '#aabbcc', 'trimmed first');
  assert.equal(clampHex('rebeccapurple', '#123456'), '#123456');
  assert.equal(clampHex(undefined, '#123456'), '#123456');
  assert.equal(clampHex(42, '#123456'), '#123456');
});

// ------------------------------------------------------------- normalization

test('normalizeCustomTheme always yields the four base colors', () => {
  assert.deepEqual(normalizeCustomTheme(undefined), DEFAULT_CUSTOM_THEME);
  assert.deepEqual(normalizeCustomTheme({}), DEFAULT_CUSTOM_THEME);
  assert.deepEqual(normalizeCustomTheme({ bg: 'nope', surface: 'nope', text: 'nope', accent: 'nope' }), DEFAULT_CUSTOM_THEME);
  const custom = normalizeCustomTheme({ bg: '#ABC', surface: '112233', text: '#ffffff', accent: 'bad' });
  assert.equal(custom.bg, '#aabbcc');
  assert.equal(custom.surface, '#112233');
  assert.equal(custom.text, '#ffffff');
  assert.equal(custom.accent, DEFAULT_CUSTOM_THEME.accent);
});

test('normalizeCustomTheme keeps valid overrides and drops invalid ones', () => {
  const theme = normalizeCustomTheme({ ...DEFAULT_CUSTOM_THEME, border: '#FF0000', green: 'not-a-color' });
  assert.equal(theme.border, '#ff0000');
  assert.equal('green' in theme, false, 'an invalid override is not carried through');
});

test('FIXED normalizeCustomTheme accepts 3-digit overrides, like it always did for base colors', () => {
  // Was a documented asymmetry: base colors ran through clampHex, which expands
  // #abc -> #aabbcc, while overrides were gated on the strict 6-digit isHex and
  // dropped outright. parseThemeInput's own picker accepts #[0-9a-f]{3,6}, so a
  // 3-digit override copied out of an exported CSS block vanished while a 3-digit
  // base color in the very same block survived.
  const theme = normalizeCustomTheme({ bg: '#abc', surface: '#def', text: '#123', accent: '#456', teal: '#0f0' });
  assert.equal(theme.bg, '#aabbcc', 'base color expands');
  assert.equal(theme.surface, '#ddeeff');
  assert.equal(theme.teal, '#00ff00', 'and so does the override now');

  const fromCss = parseThemeInput('--xray-bg: #abc; --xray-teal: #0f0;');
  assert.equal(fromCss.bg, '#aabbcc');
  assert.equal(fromCss.teal, '#00ff00', 'the CSS import path agrees');

  // Genuinely invalid overrides are still rejected.
  assert.equal('teal' in normalizeCustomTheme({ teal: 'rebeccapurple' }), false);
  assert.equal('teal' in normalizeCustomTheme({ teal: '#12' }), false);
});

test('themeOverrides returns only pinned non-base tokens', () => {
  assert.deepEqual(themeOverrides(DEFAULT_CUSTOM_THEME), {});
  const theme = normalizeCustomTheme({ ...DEFAULT_CUSTOM_THEME, border: '#ff0000', peach: '#00ff00' });
  assert.deepEqual(themeOverrides(theme), { border: '#ff0000', peach: '#00ff00' });
  for (const key of BASE_KEYS) assert.equal(key in themeOverrides(theme), false, `${key} is a base color, not an override`);
});

test('OVERRIDE_KEYS is exactly TOKEN_KEYS minus BASE_KEYS', () => {
  assert.deepEqual(OVERRIDE_KEYS, TOKEN_KEYS.filter((key) => !BASE_KEYS.includes(key)));
  assert.equal(OVERRIDE_KEYS.length, TOKEN_KEYS.length - BASE_KEYS.length);
});

// ------------------------------------------------------------ WCAG contrast

test('contrastRatio matches published WCAG golden values', () => {
  const near = (actual, expected, label) =>
    assert.ok(Math.abs(actual - expected) < 0.02, `${label}: expected ~${expected}, got ${actual}`);

  near(contrastRatio('#000000', '#ffffff'), 21, 'black on white is the maximum ratio');
  near(contrastRatio('#ffffff', '#000000'), 21, 'contrast is symmetric');
  near(contrastRatio('#ffffff', '#ffffff'), 1, 'identical colors are 1:1');
  near(contrastRatio('#767676', '#ffffff'), 4.54, '#767676 on white is the classic AA boundary');
  near(contrastRatio('#949494', '#ffffff'), 3.03, '#949494 on white is the classic AA-Large boundary');
  near(contrastRatio('#0000ff', '#ffffff'), 8.59, 'pure blue on white');
  near(contrastRatio('#ff0000', '#ffffff'), 3.998, 'pure red on white');
});

test('contrastRatio treats an unparseable color as black (first arg) / white (second arg)', () => {
  assert.equal(contrastRatio('garbage', '#ffffff'), contrastRatio('#000000', '#ffffff'));
  assert.equal(contrastRatio('#000000', 'garbage'), contrastRatio('#000000', '#ffffff'));
});

test('contrastGrade sits on the WCAG thresholds', () => {
  assert.equal(contrastGrade(21), 'AAA');
  assert.equal(contrastGrade(7), 'AAA');
  assert.equal(contrastGrade(6.999), 'AA');
  assert.equal(contrastGrade(4.5), 'AA');
  assert.equal(contrastGrade(4.499), 'AA Large');
  assert.equal(contrastGrade(3), 'AA Large');
  assert.equal(contrastGrade(2.999), 'Fail');
  assert.equal(contrastGrade(1), 'Fail');
});

// ------------------------------------------------- generateFromAccent / random

test('generateFromAccent produces a legible theme in both modes', () => {
  for (const accent of ['#7c5cff', '#22d3ee', '#fb7185']) {
    const dark = generateFromAccent(accent, 'dark');
    const light = generateFromAccent(accent, 'light');
    for (const theme of [dark, light]) {
      for (const key of BASE_KEYS) assert.ok(isHex(theme[key]), `${key} must be hex, got ${theme[key]}`);
      assert.equal(theme.accent, accent);
      assert.ok(contrastRatio(theme.text, theme.bg) >= 4.5, `text/bg contrast too low for ${accent}`);
    }
    assert.ok(contrastRatio(dark.bg, '#ffffff') > contrastRatio(light.bg, '#ffffff'), 'dark bg is darker than light bg');
  }
});

test('generateFromAccent falls back to the default accent for junk input', () => {
  assert.equal(generateFromAccent('not-a-color', 'dark').accent, DEFAULT_CUSTOM_THEME.accent);
});

test('randomTheme returns a fully-formed theme for every seed in [0, 1)', () => {
  const rand = makeRandom(7);
  for (let i = 0; i < 200; i += 1) {
    const theme = randomTheme(rand());
    for (const key of BASE_KEYS) assert.ok(isHex(theme[key]), `seed produced non-hex ${key}: ${theme[key]}`);
  }
  assert.ok(isHex(randomTheme(0).accent));
  assert.ok(isHex(randomTheme(0.999999).accent));
});

test('FIXED an out-of-range seed still picks a real accent from the palette', () => {
  // Was: Math.floor(seed * 10) % 10 is negative for a negative seed, so the lookup
  // was `undefined` and generateFromAccent's clampHex silently substituted the
  // DEFAULT accent — every out-of-range seed produced one identical "random" theme.
  const accents = new Set();
  for (const seed of [-0.5, -1, -0.05, -0.25, -0.75]) {
    const theme = randomTheme(seed);
    assert.ok(isHex(theme.accent), `seed ${seed} yields a real hex`);
    accents.add(theme.accent);
  }
  assert.ok(accents.size > 1, 'negative seeds no longer collapse to one theme');

  // NaN has no meaningful wrap, so it is pinned to a deterministic in-range choice.
  assert.ok(isHex(randomTheme(NaN).accent));
  assert.equal(randomTheme(NaN).accent, randomTheme(0).accent, 'NaN is treated as seed 0');

  // An in-range seed is untouched by the wrap.
  assert.ok(isHex(randomTheme(0.25).accent));
  assert.notEqual(randomTheme(0.25).accent, randomTheme(0.55).accent, 'distinct seeds still differ');
});

test('resolveThemeColors returns a hex for every token', () => {
  const colors = resolveThemeColors(DEFAULT_CUSTOM_THEME);
  for (const key of TOKEN_KEYS) assert.ok(isHex(colors[key]), `${key} = ${colors[key]}`);
  assert.equal(Object.keys(colors).length, TOKEN_KEYS.length);
});

test('resolveThemeColors picks light status hues for a bright background', () => {
  const dark = resolveThemeColors({ ...DEFAULT_CUSTOM_THEME, bg: '#0f1117' });
  const light = resolveThemeColors({ ...DEFAULT_CUSTOM_THEME, bg: '#ffffff' });
  assert.equal(dark.green, '#a6e3a1');
  assert.equal(light.green, '#0f8a4f');
  assert.notEqual(dark.red, light.red);
});

test('resolveThemeColors lets an explicit override beat the derived value', () => {
  const derived = resolveThemeColors(DEFAULT_CUSTOM_THEME);
  const overridden = resolveThemeColors({ ...DEFAULT_CUSTOM_THEME, border: '#ff00ff', hint: '#00ff00' });
  assert.notEqual(derived.border, '#ff00ff');
  assert.equal(overridden.border, '#ff00ff');
  assert.equal(overridden.hint, '#00ff00');
  assert.equal(overridden.subtext, derived.subtext, 'untouched tokens stay derived');
});

test('isTokenOverridden is false for base keys even when they are set', () => {
  const theme = normalizeCustomTheme({ ...DEFAULT_CUSTOM_THEME, border: '#ff0000' });
  assert.equal(isTokenOverridden(theme, 'border'), true);
  assert.equal(isTokenOverridden(theme, 'hint'), false);
  for (const key of BASE_KEYS) assert.equal(isTokenOverridden(theme, key), false, `${key} is never an override`);
});

test('buildCustomThemeVars emits translucent borders unless one is pinned', () => {
  const vars = buildCustomThemeVars(DEFAULT_CUSTOM_THEME);
  assert.match(vars['--xray-border'], /^rgba\(\d+, \d+, \d+, 0\.16\)$/);
  assert.match(vars['--xray-bg-rgb'], /^\d+, \d+, \d+$/);
  assert.equal(vars['--xray-bg'], DEFAULT_CUSTOM_THEME.bg);
  assert.equal(vars['--xray-accent'], DEFAULT_CUSTOM_THEME.accent);

  const pinned = buildCustomThemeVars({ ...DEFAULT_CUSTOM_THEME, border: '#ff0000' });
  assert.equal(pinned['--xray-border'], '#ff0000');
});

test('exportThemeCss round-trips through parseThemeInput including overrides', () => {
  const theme = normalizeCustomTheme({ bg: '#101010', surface: '#202020', text: '#f0f0f0', accent: '#ff8800', border: '#334455', peach: '#abcdef' });
  const css = exportThemeCss(theme);
  assert.match(css, /^\/\* XRAY custom theme \*\/\n\.xray-theme \{/);
  const parsed = parseThemeInput(css);
  assert.equal(parsed.bg, '#101010');
  assert.equal(parsed.surface, '#202020');
  assert.equal(parsed.text, '#f0f0f0');
  assert.equal(parsed.accent, '#ff8800');
  assert.equal(parsed.border, '#334455');
  assert.equal(parsed.peach, '#abcdef');
});

test('parseThemeInput accepts JSON, rejects unrelated text', () => {
  assert.deepEqual(parseThemeInput('{"bg":"#111111","surface":"#222222","text":"#eeeeee","accent":"#ff0000"}'), {
    bg: '#111111', surface: '#222222', text: '#eeeeee', accent: '#ff0000',
  });
  assert.equal(parseThemeInput(''), null);
  assert.equal(parseThemeInput('   '), null);
  assert.equal(parseThemeInput('hello world'), null);
  assert.equal(parseThemeInput('{"unrelated":1}'), null);
  assert.equal(parseThemeInput('{"accent":"#ff0000"}').accent, '#ff0000', 'accent alone is enough');
});

// -------------------------------------------------------- share code codec

test('encodeTheme emits the xray1: prefix with padding stripped', () => {
  const code = encodeTheme({ colors: DEFAULT_CUSTOM_THEME, hacker: false });
  assert.ok(code.startsWith('xray1:'));
  assert.ok(!code.includes('='), 'base64 padding is stripped');
});

test('encodeTheme/decodeTheme round-trips colors, font, radius and hacker', () => {
  const pkg = { colors: DEFAULT_CUSTOM_THEME, font: 'cascadia', radius: 14, hacker: true };
  const back = decodeTheme(encodeTheme(pkg));
  assert.deepEqual(back.colors, DEFAULT_CUSTOM_THEME);
  assert.equal(back.font, 'cascadia');
  assert.equal(back.radius, 14);
  assert.equal(back.hacker, true);
});

test('encodeTheme/decodeTheme round-trips per-token overrides', () => {
  const colors = normalizeCustomTheme({ ...DEFAULT_CUSTOM_THEME, border: '#ff0000', teal: '#00ffcc', surface3: '#123456' });
  const back = decodeTheme(encodeTheme({ colors }));
  assert.deepEqual(back.colors, colors);
  assert.deepEqual(themeOverrides(back.colors), { surface3: '#123456', border: '#ff0000', teal: '#00ffcc' });
});

test('encodeTheme omits the override map when the theme is just the four base colors', () => {
  const code = encodeTheme({ colors: DEFAULT_CUSTOM_THEME });
  const json = JSON.parse(Buffer.from(code.slice('xray1:'.length), 'base64').toString('utf8'));
  assert.equal('o' in json, false);
  assert.equal(json.c.length, 4);
  assert.equal(json.h, 0);
});

test('decodeTheme accepts a bare code, a #theme= hash and a theme= query fragment', () => {
  const code = encodeTheme({ colors: DEFAULT_CUSTOM_THEME, radius: 8 });
  const bare = code.slice('xray1:'.length);
  for (const input of [code, `  ${code}  `, `#theme=${code}`, `theme=${code}`, bare, `#theme=${bare}`]) {
    const back = decodeTheme(input);
    assert.ok(back, `failed to decode ${input}`);
    assert.deepEqual(back.colors, DEFAULT_CUSTOM_THEME);
    assert.equal(back.radius, 8);
  }
});

test('decodeTheme returns null for empty, non-base64 and structurally wrong payloads', () => {
  assert.equal(decodeTheme(''), null);
  assert.equal(decodeTheme('   '), null);
  assert.equal(decodeTheme('xray1:'), null);
  assert.equal(decodeTheme('xray1:!!!!'), null, 'invalid base64');
  assert.equal(decodeTheme('xray1:' + Buffer.from('not json').toString('base64')), null);
  assert.equal(decodeTheme('xray1:' + Buffer.from('{"c":"nope"}').toString('base64')), null, 'c must be an array');
  assert.equal(decodeTheme('xray1:' + Buffer.from('null').toString('base64')), null);
});

test('decodeTheme repairs a truncated color array rather than throwing', () => {
  // This is why the round-trip property test below matters: a structurally
  // plausible but wrong payload yields a theme, not null.
  const back = decodeTheme('xray1:' + Buffer.from(JSON.stringify({ c: ['#ff0000'] })).toString('base64').replace(/=+$/, ''));
  assert.ok(back);
  assert.equal(back.colors.bg, '#ff0000');
  assert.equal(back.colors.surface, DEFAULT_CUSTOM_THEME.surface, 'missing entries fall back to defaults');
  assert.equal(back.font, undefined);
  assert.equal(back.radius, undefined);
  assert.equal(back.hacker, false);
});

test('decodeTheme drops a wrongly-typed font or radius instead of trusting it', () => {
  const payload = { c: [DEFAULT_CUSTOM_THEME.bg, DEFAULT_CUSTOM_THEME.surface, DEFAULT_CUSTOM_THEME.text, DEFAULT_CUSTOM_THEME.accent], f: 7, r: 'huge', h: 'yes' };
  const back = decodeTheme('xray1:' + Buffer.from(JSON.stringify(payload)).toString('base64').replace(/=+$/, ''));
  assert.equal(back.font, undefined);
  assert.equal(back.radius, undefined);
  assert.equal(back.hacker, false, 'only the literal 1 means hacker mode');
});

test('PROPERTY: encode -> decode is the identity for 300 random themes', () => {
  const rand = makeRandom(1234);
  for (let i = 0; i < 300; i += 1) {
    const colors = normalizeCustomTheme({
      bg: randomHex(rand), surface: randomHex(rand), text: randomHex(rand), accent: randomHex(rand),
      // Pin a random subset of the override tokens.
      ...Object.fromEntries(OVERRIDE_KEYS.filter(() => rand() < 0.4).map((key) => [key, randomHex(rand)])),
    });
    const pkg = {
      colors,
      font: ['jetbrains', 'cascadia', 'iosevka', 'system'][Math.floor(rand() * 4)],
      radius: Math.floor(rand() * 21),
      hacker: rand() < 0.5,
    };
    const code = encodeTheme(pkg);
    const back = decodeTheme(code);
    assert.ok(back, `iteration ${i}: decode returned null for ${code}`);
    assert.deepEqual(back.colors, pkg.colors, `iteration ${i}: colors changed`);
    assert.equal(back.font, pkg.font, `iteration ${i}: font changed`);
    assert.equal(back.radius, pkg.radius, `iteration ${i}: radius changed`);
    assert.equal(back.hacker, pkg.hacker, `iteration ${i}: hacker changed`);
    // Codes must be URL-hash safe (they travel as window.html#theme=<code>).
    assert.equal(encodeURIComponent(code), code.replace(/:/g, '%3A').replace(/\+/g, '%2B').replace(/\//g, '%2F'), `iteration ${i}: code needs escaping beyond : + /`);
  }
});

test('PROPERTY: a decoded theme always resolves to a complete hex token set', () => {
  const rand = makeRandom(99);
  for (let i = 0; i < 100; i += 1) {
    const colors = normalizeCustomTheme({ bg: randomHex(rand), surface: randomHex(rand), text: randomHex(rand), accent: randomHex(rand) });
    const resolved = resolveThemeColors(decodeTheme(encodeTheme({ colors })).colors);
    for (const key of TOKEN_KEYS) assert.ok(isHex(resolved[key]), `iteration ${i}: ${key} = ${resolved[key]}`);
  }
});

test('themePackageToSettings maps only the fields the package carries', () => {
  assert.deepEqual(themePackageToSettings({ colors: DEFAULT_CUSTOM_THEME }), {
    theme: 'custom',
    customTheme: DEFAULT_CUSTOM_THEME,
  });
  assert.deepEqual(themePackageToSettings({ colors: DEFAULT_CUSTOM_THEME, font: 'system', radius: 0, hacker: false }), {
    theme: 'custom',
    customTheme: DEFAULT_CUSTOM_THEME,
    font: 'system',
    radius: 0,
    hacker: false,
  }, 'radius 0 and hacker false are carried, not treated as absent');
});
