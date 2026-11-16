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
 * borders, scrollbar thumbs) ≥ 3:1; the state markers the calm accent keeps (selection
 * bar, active-tab indicator, focus ring) ≥ 3:1, High Contrast ≥ 7:1. Every failing pair
 * is listed in the message.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { customTheme as T, panelSettings as P } from './harness.mjs';
import { lab, deltaE2000 } from './colourDistance.mjs';

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

const { PANEL_ACCENT_VALUES: DARK_ACCENTS, PANEL_ACCENT_VALUES_LIGHT: LIGHT_ACCENTS } = P;

// The preset lineup (spec P1), in picker order. Each is evaluated with its OWN block
// accent: a preset owns its accent (P2). `vars` is lazy so a missing block fails only
// its own test.
const LINEUP = [
  ['XRAY Dark', 'xray-dark'], ['XRAY Light', 'xray-light'], ['GitHub Dark', 'github-dark'], ['GitHub Light', 'github-light'],
  ['Tokyo Night', 'tokyo-night'], ['Catppuccin Mocha', 'catppuccin-mocha'], ['Dracula', 'dracula'], ['Gruvbox Dark', 'gruvbox-dark'],
  ['High Contrast', 'midnight'],
];

const THEMES = {
  ...Object.fromEntries(LINEUP.map(([label, id]) => [label, {
    get vars() { return { ...baseTokens, ...themeBlock(`xray-theme-${id}`) }; },
    need: id === 'midnight' ? 7 : 4.5,
  }])),
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
// The selected and the hovered row stay visibly different fills (CIEDE2000; ~1–2 is a just-noticeable
// difference). The presets' --xray-selection percentages and --xray-hover values were solved for ≥ 4
// over every swatch (observed minimum 4.02, Catppuccin Mocha; custom themes ≥ 6.1); the test holds
// 3.5 so a later lightness nudge has room, and the accent bar remains the primary selection mark.
const ROW_STATES_DELTA_E = 3.5;
function matrix(name, { vars, need }) {
  const rows = [];
  const color = (value) => parseColor(value, vars);
  const add = (label, fg, bg, min) => rows.push({ label, fg: hex(over(fg, bg)), bg: hex(bg), ratio: ratio(fg, bg), min });
  const bg = color('var(--xray-bg)');
  const surface = color('var(--xray-surface)');
  const surface2 = color('var(--xray-surface2)');

  // Composite surfaces, evaluated from the real rules.
  const inputRule = '.xray-panel .xray-input, .xray-panel .xray-select, .xray-panel textarea, .xray-panel input, .xray-panel select';
  // Pane layering (spec S6): panel chrome --xray-surface, content panes --xray-bg, wells and inputs
  // --xray-surface2. Each layer is the flat token itself, so the pairs below are the real hosts.
  const inputBgValue = ruleValue(inputRule, 'background');
  assert.equal(inputBgValue, 'var(--xray-surface2)', 'inputs are wells: --xray-surface2 (spec S6)');
  const input = over(color(inputBgValue), bg);
  const wellValue = ruleValue('.xray-panel .xray-json, .xray-panel .xray-json-editor', 'background');
  assert.equal(wellValue, 'var(--xray-surface2)', 'the JSON well is --xray-surface2 (spec S6)');
  const well = over(color(wellValue), bg);

  for (const fg of ['text', 'subtext', 'hint']) {
    add(`${fg} on bg`, color(`var(--xray-${fg})`), bg, need);
    add(`${fg} on surface2`, color(`var(--xray-${fg})`), surface2, need);
  }
  // Pressed and neutral-active fills (chips, menu toggles, raw-view buttons) are --xray-surface3.
  add('text on surface3', color('var(--xray-text)'), color('var(--xray-surface3)'), need);
  // Status / syntax colours that render as text (teal = POST), plus the wired state tokens (spec
  // S5): --xray-pending (an in-flight request's status) and --xray-neutral (JSON null).
  for (const fg of ['red', 'green', 'blue', 'mauve', 'peach', 'yellow', 'teal', 'pending', 'neutral']) {
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

  // State markers (the selection bar, the active tab's indicator, the focus ring) are UI graphics:
  // 3:1, and High Contrast's 7:1, so its states stay distinguishable at its own target.
  const marker = need === 7 ? 7 : 3;
  const accent = color('var(--xray-accent)');

  // API rows (T7): the selected row is a flat neutral fill (spec A3) marked by the accent bar
  // (A1). Its text, 4xx/5xx status text (red) and each row flag's text on its own tint, on a
  // plain row and on the selected row. SLOW, REPEATED and LARGE share one rule.
  // Spec S5: the selected row is --xray-selection (one source for every list), a hovered row
  // --xray-hover; rows sit on the content pane (--xray-bg, spec S6).
  const selectedRule = '.xray-panel :is(.xray-api-row, .xray-entry-row, .xray-console-row, .xray-log-row).selected';
  const selectedValue = ruleValue(selectedRule, 'background');
  assert.equal(selectedValue, 'var(--xray-selection)', `the selected row is --xray-selection (spec S5): \`${selectedRule}\``);
  const selected = over(color(selectedValue), bg);
  add('text on selected row', color('var(--xray-text)'), selected, need);
  add('red on selected row', color('var(--xray-red)'), selected, need);
  const hoverRule = '.xray-panel :is(.xray-api-row, .xray-entry-row, .xray-console-row, .xray-log-row):is(:hover, :focus-visible)';
  const hoverValue = ruleValue(hoverRule, 'background');
  assert.equal(hoverValue, 'var(--xray-hover)', `a hovered row is --xray-hover (spec S5): \`${hoverRule}\``);
  const hovered = over(color(hoverValue), bg);
  add('text on hovered row', color('var(--xray-text)'), hovered, need);
  add('red on hovered row', color('var(--xray-red)'), hovered, need);
  // Row states distinct: the selected and the hovered row must not read as the same state.
  const states = deltaE2000(lab(hex(selected)), lab(hex(hovered)));
  if (states < ROW_STATES_DELTA_E) rows.push({ label: `row states distinct: selected ${hex(selected)} vs hovered ${hex(hovered)} ΔE2000 ${states.toFixed(2)}`, fg: hex(selected), bg: hex(hovered), ratio: 0, min: ROW_STATES_DELTA_E });
  const bar = ruleValue('.xray-api-row.selected, .xray-entry-row.selected', 'box-shadow');
  assert.match(bar ?? '', /^inset 3px 0 0 var\(--xray-accent\)$/, `the selection bar is the accent: ${bar}`);
  add('selection bar (accent) vs selected row', accent, selected, marker);
  for (const [flag, selector] of [
    ['error', '.xray-api-flag.error'],
    ['slow', '.xray-api-flag.slow, .xray-api-flag.repeated, .xray-api-flag.large'],
    ['empty', '.xray-api-flag.empty'],
    ['pinned', '.xray-api-flag.pinned'],
    // Categorical flags are neutral chips (spec S1, A2), like the plain flag (subtext on a text tint).
    ['drift / graphql', '.xray-api-flag.drift, .xray-api-flag.graphql'],
    ['plain', '.xray-api-flag'],
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

  // Calm accent (spec A1): pressed and active controls that are not the active tab are neutral —
  // text on --xray-surface3, outlined with the control border. The export format chip sits on the
  // export rail (surface at .55) inside the modal (surface); filter and view chips on surface.
  const rail = over(color(ruleValue('.xray-export-rail', 'background')), surface);
  for (const [name, selector, host] of [
    ['active export format (export rail)', '.xray-export-format.active', rail],
    ['active chip', '.xray-chip.active', surface],
    ['active detail tab / view chip', '.xray-panel .xray-detail-tab.active, .xray-panel .xray-detail-views .xray-chip.active', surface],
  ]) {
    const fill = ruleValue(selector, 'background');
    assert.ok(fill, `${selector} background rule not found`);
    assert.doesNotMatch(fill, /--xray-accent/, `${name} is neutral (spec A1): ${fill}`);
    add(`text on ${name}`, color(ruleValue(selector, 'color')), over(color(fill), host), need);
  }
  add('<small> on active export format', color(ruleValue('.xray-export-format.active small', 'color')), over(color(ruleValue('.xray-export-format.active', 'background')), rail), need);
  // Spec S5: a control being pressed (:active) fills with --xray-active, a tint of the effective
  // accent; its label stays --xray-text. (Persistent active states above stay neutral, spec A1.)
  const pressedRule = '.xray-theme-scope :is(.xray-btn, .xray-icon-btn, .xray-chip, .xray-action-btn, .xray-menu-item):not(.primary):not(:disabled):active';
  assert.equal(ruleValue(pressedRule, 'background'), 'var(--xray-active)', `a pressed control is --xray-active (spec S5): \`${pressedRule}\``);
  add('text on a pressed control (--xray-active)', color('var(--xray-text)'), color('var(--xray-active)'), need);
  // A filter count inside the active chip (spec A1: filter counts are --xray-subtext).
  const countColour = ruleValue('.xray-chip-count', 'color');
  assert.equal(countColour, 'var(--xray-subtext)', 'filter counts are --xray-subtext');
  add('subtext count on active chip', color(countColour), over(color(ruleValue('.xray-chip-count', 'background')), over(color(ruleValue('.xray-chip.active', 'background')), surface)), need);

  // The active top tab keeps the accent: text on its accent-soft fill over the tab bar, and the
  // accent indicator against the bar.
  const topbar = color(ruleValue('.xray-topbar', 'background'));
  const activeTab = over(color(ruleValue('.xray-panel .xray-tab.active', 'background')), topbar);
  add('text on active tab', color(ruleValue('.xray-tab.active', 'color')), activeTab, need);
  add('active tab indicator (accent) vs tab bar', color(ruleValue('.xray-tab::after', 'background')), topbar, marker);

  // The active Settings item: text on its accent tint over the nav, and the accent bar against it.
  const nav = over(color(ruleValue('.xray-settings-nav', 'background')), surface);
  const navItem = over(color(ruleValue('.xray-settings-nav-item.active', 'background')), nav);
  add('text on active Settings item', color(ruleValue('.xray-settings-nav-item.active', 'color')), navItem, need);
  add('active Settings item bar (accent) vs nav', color(ruleValue('.xray-settings-nav-item.active', 'border-left-color')), navItem, 3);

  // Focus rings follow the effective accent (--xray-focus), against bg and surface.
  for (const [host, hostName] of [[bg, 'bg'], [surface, 'surface']]) add(`focus ring vs ${hostName}`, color('var(--xray-focus)'), host, marker);
  // The request list and the Logs listbox (final review I-7): rows are aria-activedescendant
  // options, so the list's own ring is the only keyboard focus indicator. It is the ring that
  // ships — read from its rule, full strength, 2px, drawn inside the list (which sits on bg).
  const listFocusRule = '.xray-panel :is(.xray-api-table-scroll, .xray-logs-list)[tabindex]:focus-visible';
  const listOutline = ruleValue(listFocusRule, 'outline');
  assert.equal(listOutline, '2px solid var(--xray-focus)', `the list focus ring is full-strength --xray-focus, 2px: \`${listFocusRule}\``);
  assert.equal(ruleValue(listFocusRule, 'outline-offset'), '-2px', 'drawn inside the list, so its scroller cannot clip it');
  add('list focus ring vs bg', color(listOutline.replace(/^2px solid /, '')), bg, marker);

  // A find highlight in Global Search results (the modal is surface): marker yellow, not the accent.
  const mark = '.xray-gsearch-snippet mark';
  assert.doesNotMatch(ruleValue(mark, 'background') ?? '', /--xray-accent/, 'search highlights are not the accent (spec A1)');
  add('text on search highlight', color(ruleValue(mark, 'color')), over(color(ruleValue(mark, 'background')), surface), need);

  // Primary buttons: accent text on a FLAT accent fill (spec A2: no gradient, no mauve). Colour
  // and fill live in different rules, so the generic scan above cannot see this pair.
  const primaryRule = '.xray-theme-scope .xray-action-btn.primary, .xray-theme-scope .xray-btn.primary';
  const primary = ruleValue(primaryRule, 'background');
  assert.ok(primary, 'primary button background rule not found');
  assert.doesNotMatch(primary, /gradient|--xray-mauve/, `the primary button is a flat accent fill: ${primary}`);
  assert.match(primary, /var\(--xray-accent\)/, `the primary button fill is the accent: ${primary}`);
  for (const [host, hostName] of [[surface, 'surface'], [surface2, 'surface2']]) {
    add(`accent on primary button flat fill (${hostName})`, color(ruleValue(primaryRule, 'color')), over(color(primary), host), need);
  }

  // Column headers are --xray-hint on the table head (spec A1, not the accent).
  const head = '.xray-panel .xray-api-table-head';
  assert.equal(ruleValue(head, 'color'), 'var(--xray-hint)', 'API column headers are --xray-hint');
  add('hint on API column header', color('var(--xray-hint)'), over(color(ruleValue(head, 'background')), bg), need);

  // Console prompt (spec §3, Task 5). Ghost text is a decorative hint (the textarea holds the
  // real text, the suggestion is also in the list): 3:1 on the editor field, not 4.5. Matched
  // characters are text: `need` on a plain and on the active row of the popup (surface). Kind
  // icons are UI graphics: 3:1 on both rows.
  const ghostValue = ruleValue('.xray-panel .xray-prompt .xray-editor-ghost', 'color');
  assert.ok(ghostValue, 'ghost text colour rule `.xray-panel .xray-prompt .xray-editor-ghost` not found');
  const editorField = over(color(ruleValue('.xray-editor-field', 'background')), bg);
  add('ghost text on the editor field', color(ghostValue), editorField, 3);
  const activeOption = over(color(ruleValue('.xray-editor-option.active', 'background')), surface);
  const matchValue = ruleValue('.xray-editor-option-match', 'color');
  // Fix round 1: emphasis is weight + the normal text colour (no data hue, spec A1); the rest of a
  // matched label dims to --xray-subtext. The ghost carries a non-colour cue (a dotted underline),
  // so it reads as a suggestion even where hint and text are close (High Contrast).
  assert.equal(matchValue, 'var(--xray-text)', 'matched characters are --xray-text');
  assert.equal(ruleValue('.xray-editor-option-match', 'font-weight'), '600', 'matched characters are weight 600');
  const unmatchedValue = ruleValue('.xray-editor-option-label.has-match', 'color');
  assert.equal(unmatchedValue, 'var(--xray-subtext)', 'the unmatched part of a matched label is --xray-subtext');
  assert.match(ruleValue('.xray-panel .xray-prompt .xray-editor-ghost', 'text-decoration') ?? '', /underline dotted/, 'the ghost has a dotted underline');
  for (const [host, hostName] of [[surface, 'row'], [activeOption, 'active row']]) {
    add(`matched characters (${hostName})`, color(matchValue), host, need);
    add(`unmatched label part (${hostName})`, color(unmatchedValue), host, need);
    add(`option params (${hostName})`, color(ruleValue('.xray-editor-option-params', 'color')), host, need);
    for (const kind of ['helper', 'variable', 'property', 'method', 'index', 'value', 'function', 'class', 'keyword', 'namespace']) {
      const iconValue = ruleValue(`.xray-editor-option-icon.kind-${kind}`, 'color');
      assert.ok(iconValue, `kind icon colour rule \`.xray-editor-option-icon.kind-${kind}\` not found`);
      add(`${kind} kind icon (${hostName})`, color(iconValue), host, 3);
    }
  }
  const docLine = over(color(ruleValue('.xray-editor-doc', 'background')), surface);
  add('doc line text', color(ruleValue('.xray-editor-doc', 'color')), docLine, need);

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

// Every accent swatch the user can pick, on every preset (spec P2): the value the panel
// actually applies inline (resolveAccentValue, i.e. the swatch solved for that preset's
// surfaces) through the FULL matrix — own-tint rules, the selected row, its flags and its
// accent bar, the calm-accent active states, focus and the primary button's flat fill — at the
// preset's own target.
const SWATCHES = Object.keys(DARK_ACCENTS);
const pickedAccent = (id, accent) => P.resolveAccentValue({ ...P.DEFAULT_PANEL_SETTINGS, theme: id, accent, accentChosen: true });
for (const [name, id] of LINEUP) {
  test(`${name}: every accent swatch the user can pick meets the contrast targets`, () => {
    const { vars, need } = THEMES[name];
    const problems = [];
    for (const accent of SWATCHES) {
      const value = pickedAccent(id, accent);
      assert.match(value ?? '', /^#[0-9a-f]{6}$/, `${name} ${accent}: a picked accent resolves to a hex`);
      const { fails } = matrix(`${name} + ${accent} ${value}`, { vars: { ...vars, '--xray-accent': value }, need });
      if (fails.length) problems.push(fmt(`${name} + ${accent} ${value}`, fails));
    }
    assert.equal(problems.length, 0, `failing pairs:\n${problems.join('\n')}`);
  });
}

// Accent swatches as text on their own tint, composited over the preset's --xray-bg, per
// the presets that use each palette: a stricter stand-in for the primary button's flat
// fill (10 %, checked exactly in the matrix above) — 14 % and over bg, which is darker
// than the button hosts on the light presets. Each swatch is the value the preset applies
// when it is picked.
const TINT = 0.14;
function swatchFails(palette, themeNames) {
  const fails = [];
  for (const themeName of themeNames) {
    const { vars, need } = THEMES[themeName];
    const id = LINEUP.find(([label]) => label === themeName)[1];
    const bg = parseColor('var(--xray-bg)', vars);
    for (const swatch of Object.keys(palette)) {
      const accent = pickedAccent(id, swatch);
      const a = parseColor(accent, vars);
      const tint = over([a[0], a[1], a[2], TINT], bg);
      const r = ratio(a, tint);
      if (r >= need) continue;
      fails.push({ label: `accent ${swatch} ${accent} on its ${Math.round(TINT * 100)}% tint`, fg: accent, bg: hex(tint), ratio: r, min: need, themeName });
    }
  }
  return fails;
}
test('every light accent swatch reads on its tint over the light presets', () => {
  const fails = swatchFails(LIGHT_ACCENTS, ['XRAY Light', 'GitHub Light']);
  assert.equal(fails.length, 0, `failing pairs:\n${fails.map((f) => fmt(f.themeName, [f])).join('\n')}`);
});
test('every dark accent swatch reads on its tint over the dark presets (High Contrast 7:1)', () => {
  const fails = swatchFails(DARK_ACCENTS, ['XRAY Dark', 'GitHub Dark', 'Tokyo Night', 'Catppuccin Mocha', 'Dracula', 'Gruvbox Dark', 'High Contrast']);
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

// A picked swatch is solved for each preset in OKLCH lightness only (spec P2), so it still
// reads as Amber, Lavender, … on every preset; one that already reads is applied as is.
test('picked accent swatches keep their hue and chroma on every preset', () => {
  const problems = [];
  for (const preset of P.THEME_PRESETS) {
    const palette = preset.kind === 'light' ? LIGHT_ACCENTS : DARK_ACCENTS;
    for (const [accent, swatch] of Object.entries(palette)) problems.push(...hueKept(`${preset.id} ${accent}`, swatch, pickedAccent(preset.id, accent)));
  }
  assert.deepEqual(problems, []);
  assert.equal(pickedAccent('xray-dark', 'teal'), DARK_ACCENTS.teal, 'a swatch that already reads is not moved');
  assert.equal(pickedAccent('xray-light', 'teal'), LIGHT_ACCENTS.teal, 'light presets start from the light swatch table');
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
