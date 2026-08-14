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

test('interaction polish honors reduced-motion and consistent focus rings', () => {
  const styles = read('src/panel/styles.css');
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /button:focus-visible/);
  assert.match(styles, /@keyframes xray-bar-grow/);
});
