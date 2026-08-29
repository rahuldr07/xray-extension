// Container/media query breakpoints, reduced motion, and focus-ring polish.

const assert = require('node:assert/strict');
const test = require('node:test');

const { read } = require('./helpers/source');

test('React panel uses TanStack Virtual and Tabler icons for the screenshot console UI', () => {
  const app = read('src/panel/App.tsx');
  const consoleWorkspace = read('src/panel/components/console/ConsoleWorkspace.tsx');

  assert.match(consoleWorkspace, /from '@tanstack\/react-virtual'/);
  assert.match(consoleWorkspace, /useVirtualizer/);
  assert.match(consoleWorkspace, /from '@tabler\/icons-react'/);
  assert.match(consoleWorkspace, /IconNetwork/);
  assert.match(consoleWorkspace, /IconTerminal2/);
  assert.match(consoleWorkspace, /Network/);
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
  assert.match(styles, /\.xray-prompt\s*\{[\s\S]*grid-template-columns: 20px minmax\(120px, 1fr\) auto/);
  assert.match(styles, /\.xray-context-chip\s*\{[\s\S]*display: none/);
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
  assert.match(styles, /@container xray \(max-width: 900px\) \{\n {2}\.xray-tab span \{\n {4}display: none;/);
  assert.match(shell, /aria-label=\{tab\.label\}/);

  // Below 620px the strip scrolls and gets its scrollbar BACK. Suppressing the
  // scrollbar on a strip that overflows is what made clipped tabs unreachable.
  assert.match(styles, /@container xray \(max-width: 620px\) \{[\s\S]*?\.xray-tabs \{\n {4}scrollbar-width: thin;/);
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

  // FIXED: .xray-network was pinned at max-height: min(44vh, 380px) with no grow, so
  // at 1600x1000 the Console workspace ended 332px above the panel's bottom edge while
  // its request list was capped to five of twenty rows. Its sibling stream wrap always
  // had `flex: 1`; this is the declaration it was missing.
  assert.match(styles, /\.xray-network \{[\s\S]*?flex: 1 1 auto;/);
  assert.doesNotMatch(styles, /\.xray-network \{[\s\S]*?max-height: min\(44vh, 380px\)/);
  // The scroller sized itself off a percentage of what is now a flexible parent.
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

  // FIXED: .xray-settings-modal-body had a flat min-height: 400px that a flex column
  // cannot shrink, so head + body + foot demanded 513px and below a 626px viewport the
  // Save/Cancel row rendered outside the modal's `overflow: hidden` box, with no
  // scrollbar that could reach it. 626px is the normal height of a DevTools drawer.
  assert.match(styles, /\.xray-settings-modal-body \{[\s\S]*?min-height: min\(400px, 100%\);/);
  assert.match(styles, /\.xray-modal \{[\s\S]*?max-height: min\(82vh, 100%\);/);
  assert.match(styles, /\.xray-modal-head,\n\.xray-modal-foot \{[\s\S]*?flex: 0 0 auto;/);
});

test('interaction polish honors reduced-motion and consistent focus rings', () => {
  const styles = read('src/panel/styles.css');
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /button:focus-visible/);
  assert.match(styles, /@keyframes xray-bar-grow/);
});
