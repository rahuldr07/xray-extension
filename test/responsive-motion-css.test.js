// Container/media query breakpoints, reduced motion, and focus-ring polish.

const assert = require('node:assert/strict');
const test = require('node:test');

const { read, readConsoleSources } = require('./helpers/source');

test('React panel uses TanStack Virtual and Tabler icons for the screenshot console UI', () => {
  const app = read('src/panel/App.tsx');
  const consoleWorkspace = readConsoleSources();

  assert.match(consoleWorkspace, /from '@tanstack\/react-virtual'/);
  assert.match(consoleWorkspace, /useVirtualizer/);
  assert.match(consoleWorkspace, /from '@tabler\/icons-react'/);
  assert.match(consoleWorkspace, /IconPlayerPlay/);
  assert.match(consoleWorkspace, /Console request context/);
  assert.doesNotMatch(consoleWorkspace, /function NetworkTable/);
  assert.match(consoleWorkspace, /xray-console-title/);
  assert.match(consoleWorkspace, /Console/);
  assert.match(app, /import \{ ConsoleWorkspace \}/);
  assert.doesNotMatch(app, /function ConsoleWorkspace/);
  assert.doesNotMatch(consoleWorkspace, /Schema['"]/);
  assert.doesNotMatch(consoleWorkspace, /Snippets['"]/);
});

test('React preview CSS protects narrow viewport console ergonomics', () => {
  const styles = read('src/panel/styles.css');

  // the panel is an inline-size container; narrow-panel ergonomics key off the
  // panel's own width, while window-coupled rules (panel width, modals) stay media
  assert.match(styles, /container-type: inline-size/);
  assert.match(styles, /@container xray \(max-width: 760px\)/);
  assert.match(styles, /@media \(max-width: 760px\)/);
  assert.match(styles, /\.xray-tabs\s*\{[\s\S]*overflow-x: auto/);
  assert.match(styles, /\.xray-console-head\s*\{[\s\S]*overflow-x: auto/);
  assert.match(styles, /\.xray-prompt-command-row\s*,\s*\.xray-prompt-context-row\s*\{[\s\S]*display: flex/);
  assert.match(styles, /\.xray-prompt-context-row\s*\{[\s\S]*overflow: hidden/);
  assert.match(styles, /@container xray \(max-width: 620px\)/);
});

test('the header gives the tablist a growth contract instead of leaving it to leftovers', () => {
  const styles = read('src/panel/styles.css');
  const shell = read('src/panel/components/shell/PanelShell.tsx');

  // FIXED: .xray-tabs had flex-basis 0 and sat next to a .xray-spacer with the same
  // `flex: 1`, so the two split whatever the eight trailing buttons left over. At a
  // 420px panel — and at PANEL_WIDTH_MIN, 360 — that share was 0px and all five tabs
  // were unreachable by mouse. The tablist now claims its content width first.
  assert.match(styles, /\.xray-tabs \{\n {2}flex: 1 1 auto;\n {2}min-width: 0;/);
  // FIXED: with no shrink priority the flex deficit was paid by the icon buttons
  // instead, which collapsed from a declared 28px to 18px at the DEFAULT 960px width.
  assert.match(styles, /\.xray-topbar > \.xray-icon-btn,[\s\S]*?flex: 0 0 auto;/);
  // The spacer div is gone from the header; the summary pushes itself right.
  assert.doesNotMatch(shell, /<div className="xray-spacer" \/>/);
  assert.match(styles, /\.xray-topbar > \.xray-summary \{\n {2}margin-left: auto;\n\}/);
  // Turning the tablist into a scroll container makes it clip on both axes, which
  // sliced the focus ring into two fragments until it got room to draw.
  assert.match(styles, /\.xray-tabs \{[\s\S]*?padding: 3px 0;/);
  // The tablist is the only shrinkable item left, so anything the header cannot fit is
  // taken out of the TABS unless something else gives way first. Two tiers give way,
  // cheapest first.
  //
  // FIXED: an earlier revision of this change had neither tier, so the tablist absorbed
  // the whole deficit and at the DEFAULT 960px panel width Rules was truncated mid-word
  // and Insights was gone entirely — behind a scrollbar suppressed on both axes, so a
  // mouse user could not reach them. Measured after this fix: zero overflow at every
  // width from 470 to 1400.
  assert.match(styles, /@container xray \(max-width: 1120px\) \{\n {2}\.xray-topbar > \.xray-summary \{\n {4}display: none;/);
  // Labels stay visible down to a 680px container (spec ~600px; measured fit) (S2); the surface switcher gives way at 880px.
  assert.match(styles, /@container xray \(max-width: 680px\) \{\n {2}\.xray-tab span \{\n {4}display: none;/);
  assert.match(styles, /@container xray \(max-width: 880px\) \{\n {2}\.xray-mode-switcher \{\n {4}display: none;/);
  // Six labelled tabs since the SQL tab: between the label tier and the surface switcher the
  // strip tightens its gap, icon-label gap and padding so it fits at 700 (window) and 720 (HUD)
  // on the CI runner's wider fonts too (theme-visual-system e2e "chrome fits at 700/720").
  assert.match(styles, /@container xray \(680px < width <= 880px\) \{\n {2}\.xray-tabs \{\n {4}gap: 2px;\n {2}\}\n\n {2}\.xray-tab \{\n {4}gap: 4px;\n {4}padding: 0 6px;/);
  // ...and just above it, where the surface switcher is back, a lighter trim up to 940px.
  assert.match(styles, /@container xray \(880px < width <= 940px\) \{\n {2}\.xray-tab \{\n {4}gap: 4px;\n {4}padding: 0 8px;/);
  assert.match(shell, /aria-label=\{tab\.label\}/);

  // Below 420px the strip scrolls and gets its scrollbar BACK. Suppressing the
  // scrollbar on a strip that overflows is what made clipped tabs unreachable.
  assert.match(styles, /@container xray \(max-width: 420px\) \{\n {2}\.xray-tabs \{\n {4}scrollbar-width: thin;/);
  // Six icon-only tabs since the SQL tab: at 420px the strip tightens its gap and padding so
  // all six fit without scrolling (theme-visual-system e2e "chrome fits at 420").
  assert.match(styles, /@container xray \(max-width: 420px\) \{\n {2}\.xray-tabs \{\n {4}gap: 2px;\n {2}\}\n\n {2}\.xray-tab \{\n {4}padding: 0 5px;/);
  assert.match(styles, /\.xray-tabs::-webkit-scrollbar \{\n {4}display: block;/);
  // ...and the active tab is scrolled into view, resolved through the tablist ref
  // rather than `document` (the panel mounts in a closed shadow root).
  assert.match(shell, /const list = tablistRef\.current;/);
  assert.match(shell, /active\?\.scrollIntoView\?\.\(\{ block: 'nearest', inline: 'nearest' \}\)/);
});

test('hiding the mode switcher is only legitimate because the palette offers those surfaces', () => {
  // FIXED: an earlier revision hid .xray-mode-switcher on narrow panels with the
  // comment "All three are in the command palette" — they were not, so the pop-out
  // window and the HUD were left with no entry point at all. This test fails if the
  // switcher is hidden again without the palette actually carrying them.
  const styles = read('src/panel/styles.css');
  const palette = read('src/panel/components/shell/CommandPalette.tsx');

  if (/\.xray-mode-switcher \{\n {4}display: none;/.test(styles)) {
    assert.match(palette, /id: 'surface-window'/);
    assert.match(palette, /id: 'surface-hud'/);
    assert.match(palette, /id: 'surface-devtools'/);
    // One implementation, shared with the header, so the two cannot drift.
    assert.match(palette, /from '\.\.\/\.\.\/runtime\/surfaces'/);
    assert.match(read('src/panel/components/shell/PanelShell.tsx'), /from '\.\.\/\.\.\/runtime\/surfaces'/);
  }
});

test('workspaces and full-bleed surfaces fill the space they are given', () => {
  const styles = read('src/panel/styles.css');

  // Console's output owns the available space; API owns captured-request scrolling.
  assert.match(styles, /\.xray-console-stream-wrap \{[\s\S]*?flex: 1;/);
  assert.match(styles, /\.xray-console-stream \{[\s\S]*?overflow: auto;/);
  assert.match(styles, /\.xray-api-table-scroll \{[\s\S]*?overflow: auto;/);
  // Logs still use the shared virtual list.
  assert.match(styles, /\.xray-virtual-list \{[\s\S]*?flex: 1 1 auto;\n {2}min-height: 0;/);

  // FIXED: .xray-bar was a plain inline span, so width/height were no-ops and it
  // measured 0x0 in every theme — the Insights status-mix chart never drew and the
  // duration bars in the API list were invisible.
  assert.match(styles, /\.xray-bar \{\n {2}display: block;/);

  // FIXED: max-width beats width, so the docked panel's 96vw cap (which stops it
  // covering a small page) also clipped the two fullscreen surfaces and leaked a 4vw
  // strip of raw document background down their right edge.
  assert.match(styles, /\.xray-panel\.xray-devtools \{[\s\S]*?max-width: 100vw;/);
  assert.match(styles, /\.xray-panel\.xray-mode-window \{[\s\S]*?max-width: 100vw;/);
});

test('a modal never pushes its own footer outside its scrollable box', () => {
  const styles = read('src/panel/styles.css');

  // FIXED: the settings body now participates in the modal's flex sizing and its
  // nav/content panes own overflow, so short DevTools drawers keep the footer reachable.
  assert.match(styles, /\.xray-settings-modal-body \{[\s\S]*?min-height: 0;[\s\S]*?flex: 1 1 auto;/);
  assert.match(styles, /\.xray-settings-nav \{[\s\S]*?min-height: 0;[\s\S]*?overflow: auto;/);
  assert.match(styles, /\.xray-modal \{[\s\S]*?max-height: min\(82vh, 100%\);/);
  assert.match(styles, /\.xray-modal-head,\n\.xray-modal-foot \{[\s\S]*?flex: 0 0 auto;/);
});

test('mobile API detail keeps the response body reachable by scrolling the drawer', () => {
  const styles = read('src/panel/styles.css');
  const entries = read('src/panel/components/api/EntriesWorkspace.tsx');

  // The mobile drawer contains a tall action/navigation stack. The drawer itself
  // must scroll instead of collapsing the response content to a sliver.
  // S20: the stacked (600-900px) and full-height (<600px) detail share these rules.
  assert.match(styles, /@container xray \(max-width: 900px\) \{[\s\S]*?\.xray-api-workspace \.xray-api-drawer-body \{\s*overflow: auto;/);
  assert.match(styles, /@container xray \(max-width: 900px\) \{[\s\S]*?\.xray-api-workspace \.xray-request-detail \{\s*height: auto;/);
  assert.match(styles, /@container xray \(max-width: 900px\) \{[\s\S]*?\.xray-api-workspace \.xray-detail-content \{\s*flex: 1 0 200px;/);

  // First-run onboarding is only valid before any API traffic exists; a filtered
  // empty result needs a clear-filter action instead.
  assert.match(entries, /const hasApiEntries = useMemo\(\(\) => entries\.some\(isApi\)/);
  assert.match(entries, /No matching API requests/);
  assert.match(entries, /Clear filters/);
});

test('interaction polish honors reduced-motion and consistent focus rings', () => {
  const styles = read('src/panel/styles.css');
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /button:focus-visible/);
  assert.match(styles, /@keyframes xray-bar-grow/);
  assert.match(styles, /\.xray-spinner,\n\s+\.xray-live-dot\.on \{/);
  // Console editor chips move on the motion tokens, not literal timings.
  const chip = /\.xray-editor-chip \{([^}]*)\}/.exec(styles)[1];
  assert.match(chip, /transition: color var\(--xray-dur-fast\) var\(--xray-ease\)/);
  assert.doesNotMatch(chip, /\d*\.\d+s ease/);
});

test('theme accents use valid color functions and narrow surfaces wrap safely', () => {
  const styles = read('src/panel/styles.css');
  const tokens = read('src/panel/styles/tokens.css');
  assert.doesNotMatch(styles, /--xray-accent-rgb/);
  assert.doesNotMatch(tokens, /--xray-accent-rgb/);
  assert.match(styles, /@media \(max-width: 560px\) \{[\s\S]*?\.xray-modal-foot \{[\s\S]*?flex-wrap: wrap;/);
  assert.match(styles, /@container xray \(max-width: 600px\) \{[\s\S]*?\.xray-experiment-grid/);
  assert.match(styles, /@container xray \(max-width: 560px\) \{[\s\S]*?\.xray-firstrun-grid/);
});

test('S22: log rows are four fixed tracks (level, time, message, pin) at every width', () => {
  const styles = read('src/panel/styles.css');
  assert.match(styles, /\.xray-entry-row \{\n\s+width: 100%;\n\s+min-height: 58px;\n\s+display: grid;\n\s+grid-template-columns: 52px 76px minmax\(0, 1fr\) 28px;/);
  assert.match(styles, /\.xray-logs-list \.xray-entry-row \{\n\s+grid-template-columns: 44px 70px minmax\(0, 1fr\) 28px;/);
});

test('S1: data and controls render in their real case; uppercase stays on eyebrows only', () => {
  const styles = read('src/panel/styles.css');
  // Rule bodies for the selectors that carry data or control labels.
  const body = (head) => {
    const start = styles.indexOf(head);
    assert.ok(start >= 0, `${head} rule exists`);
    return styles.slice(start, styles.indexOf('}', start));
  };
  for (const head of [
    '.xray-tab {\n  height',
    '.xray-panel h3 {',
    '.xray-panel .xray-detail-views .xray-chip {',
    '.xray-rule-summary {',
    '.xray-summary {',
    '.xray-panel .xray-chip {',
    '.xray-theme-scope .xray-settings-section-title,',
    '.xray-api-table-head {\n  position',
  ]) {
    assert.doesNotMatch(body(head), /text-transform: uppercase/, `${head} is not forced uppercase`);
  }
  assert.doesNotMatch(body('.xray-theme-scope .xray-method,'), /uppercase/);
  // Spec S3: only the small Settings nav group labels keep it (section titles read in real case).
  assert.match(body('.xray-settings-nav-group-title {'), /text-transform: uppercase/);
  assert.match(body('.xray-theme-scope .xray-settings-section-title,'), /text-transform: none/);
});

test('S2: the record control is a red dot when recording; the accent ring is :focus-visible only', () => {
  const styles = read('src/panel/styles.css');
  const shell = read('src/panel/components/shell/PanelShell.tsx');
  assert.match(shell, /xray-record-btn \$\{runtimeHealth\.health === 'healthy' \? 'recording' : ''\}/);
  // Resting/hover/active styling is gated on :not(:focus-visible) and out-specifies the
  // generic .xray-icon-btn accent rules, so it does not depend on source order. Like every icon
  // button it is outlined only on hover/focus (spec S1), so its resting rule draws no border.
  assert.match(styles, /\.xray-topbar \.xray-icon-btn\.xray-record-btn:not\(:focus-visible\) \{[^}]*outline: none;/);
  assert.doesNotMatch(styles, /\.xray-topbar \.xray-icon-btn\.xray-record-btn:not\(:focus-visible\) \{[^}]*border-color/);
  // The recording state paints the dot red.
  assert.match(styles, /\.xray-topbar \.xray-record-btn\.recording \.xray-live-dot \{[^}]*var\(--xray-red\)/);
  // No accent border/colour for the record button outside :focus-visible.
  assert.doesNotMatch(styles, /\.xray-record-btn(?!:not\(:focus-visible\))[^{]*\{[^}]*--xray-accent/);
});
