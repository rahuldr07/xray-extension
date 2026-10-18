/* Themeable lines (spec S4): borders, dividers and outlines use --xray-border (decorative) or
 * --xray-border-control (inputs) — or a state token (focus, accent, a status colour) where the
 * line itself carries meaning. No line is drawn with a literal colour, a --xray-hint mix (the
 * pre-refresh habit that ignored each preset's own line colour) or a surface/background token
 * pretending to be a line. Token blocks (where literals belong) are skipped.
 *
 * Every stylesheet a surface loads is scanned: the panel (styles.css, hud.css) and the options
 * page (settings.html's <style>). The allowlist below is the complete set of exceptions; each is
 * a glyph, a knockout or a text-coloured state ring drawn with a border, not a line. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../../', import.meta.url).pathname;
const read = (path) => readFileSync(root + path, 'utf8');
const SHEETS = {
  'src/panel/styles.css': read('src/panel/styles.css'),
  'src/panel/styles/hud.css': read('src/panel/styles/hud.css'),
  'settings/settings.html': read('settings/settings.html').match(/<style>([\s\S]*?)<\/style>/)[1],
};

// A token block is a rule that defines the palette (it declares --xray-bg): the preset blocks, the
// options page's :root blocks. Literal colours are the point there. Identified by content, not by
// selector shape, so a component rule such as .xray-theme-swatch is scanned like any other.
const isTokenBlock = (body) => /(?:^|[;{\s])--xray-bg\s*:/.test(body);
// Theme tokens every surface defines (tokens.css's base block). A line may also read a component
// variable, but only one its own rule defines — an undefined var() makes the whole border invalid.
const BASE_TOKENS = new Set([...read('src/panel/styles/tokens.css').matchAll(/(--xray-[a-z0-9-]+)\s*:/g)].map(([, name]) => name));

// selector (normalised) -> why its border is not a line.
const ALLOW = new Map([
  ['.xray-app-root *::-webkit-scrollbar-thumb, .xray-hud *::-webkit-scrollbar-thumb',
    'a track-coloured gap that insets the thumb inside its track (padding drawn as a border)'],
  ['.xray-settings-diagnostics > summary::before',
    'the disclosure chevron glyph, drawn with two borders in the hint icon colour'],
  ['.xray-range::-webkit-slider-thumb', 'the range thumb\'s knockout ring in the surface colour'],
  ['.xray-range::-moz-range-thumb', 'the range thumb\'s knockout ring in the surface colour'],
  // Text-coloured lines (final review M-4b): each marks a state the accent cannot draw.
  ['.xray-color-swatch.active', 'the chosen accent swatch\'s ring: the swatch is filled with the accent, so an accent ring would vanish'],
  ['.xray-color-theme.active', 'the chosen custom-colour chip\'s ring, for the same reason as the accent swatch'],
  ['.xray-spinner', 'the spinner\'s moving arc, a glyph drawn with one coloured border side'],
]);

const LINE_PROPS = /^(?:border(?:-(?:top|right|bottom|left|block|inline|block-start|block-end|inline-start|inline-end))?(?:-color)?|outline(?:-color)?|column-rule(?:-color)?)$/;
const LITERAL = /#[0-9a-f]{3,8}\b|\brgba?\(\s*[\d.]|\bhsla?\(|(?<![\w-])(?:white|black|red|blue|gray|grey|silver)\b/i;
const HINT = /--xray-hint\b/;
const SURFACE = /--xray-(?:bg|surface|surface2|surface3)(?:-rgb)?\b/;
// A text colour drawn as a line (final review M-4b): never a plain divider, so every use is listed
// in ALLOW with its reason rather than passing silently.
const TEXT = /--xray-(?:text|subtext)(?:-rgb)?\b/;

function offenders(sheets = SHEETS) {
  const out = [];
  const seen = new Set();
  for (const [file, text] of Object.entries(sheets)) {
    const css = text.replace(/\/\*[\s\S]*?\*\//g, '');
    for (const [, rawSel, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const sel = rawSel.replace(/\s+/g, ' ').trim();
      if (isTokenBlock(body)) continue;
      const local = new Set([...body.matchAll(/(--[a-z0-9-]+)\s*:/g)].map(([, name]) => name));
      for (const [, prop, value] of body.matchAll(/(?:^|;)\s*([a-z-]+)\s*:\s*([^;]+)/g)) {
        if (!LINE_PROPS.test(prop)) continue;
        const undefinedVars = [...value.matchAll(/var\((--[a-z0-9-]+)\s*\)/g)].map(([, name]) => name).filter((name) => !BASE_TOKENS.has(name) && !local.has(name));
        const why = [LITERAL.test(value) && 'a literal colour', HINT.test(value) && 'a --xray-hint mix', SURFACE.test(value) && 'a surface token', TEXT.test(value) && 'a text token',
          undefinedVars.length && `an undefined variable (${undefinedVars.join(', ')})`].filter(Boolean);
        if (!why.length) continue;
        if (ALLOW.has(sel)) { seen.add(sel); continue; }
        out.push(`${file}: ${sel} { ${prop}: ${value.trim()} } — ${why.join(', ')}`);
      }
    }
  }
  return { out, seen };
}

test('lines use the line tokens: no literal colour, --xray-hint mix, surface or text token in a border/outline (spec S4)', () => {
  const { out } = offenders();
  assert.deepEqual(out, []);
});

test('every allowlisted exception still exists (a stale entry would hide nothing and should go)', () => {
  const { seen } = offenders();
  assert.deepEqual([...ALLOW.keys()].filter((sel) => !seen.has(sel)), []);
});

test('the scan sees the stylesheets (fails loudly if the parser stops matching rules)', () => {
  const lines = Object.values(SHEETS).join('\n').match(/(?:^|[;{\s])(?:border(?:-[a-z]+)?|outline)\s*:/g) ?? [];
  assert.ok(lines.length > 300, `only ${lines.length} border/outline declarations found`);
  // Planted offenders are caught (the scan's own teeth), including a component rule whose class
  // starts with .xray-theme- and a border whose colour variable no rule defines; a real token block
  // is still skipped.
  const { out } = offenders({ planted: [
    '.x { border: 1px solid color-mix(in srgb, var(--xray-hint) 30%, transparent); }',
    '.xray-theme-foo { border: 1px solid #fff; }',
    '.y { border: 1px solid color-mix(in srgb, var(--xray-undefined-tone) 36%, transparent); }',
    '.z { --xray-z-tone: var(--xray-blue); border: 1px solid color-mix(in srgb, var(--xray-z-tone) 36%, transparent); }',
    '.xray-theme-bar { --xray-bg: #000; --xray-border: #fff; border-color: #fff; }',
    '.w { border-bottom: 1px solid var(--xray-subtext); }',
  ].join('\n') });
  assert.deepEqual(out.map((line) => line.split(' { ')[0]), ['planted: .x', 'planted: .xray-theme-foo', 'planted: .y', 'planted: .w']);
});
