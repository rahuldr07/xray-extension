// Shared fixture helpers for the source-pinning suites.
//
// Every test/*.test.js file in this repo asserts against the *text* of source
// files rather than importing them, so a single reader keeps the repo root
// resolution in one place.

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');

const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
// The Console workspace is split across focused component files; assertions
// about "the console source" read all of them together.
// Every module in src/panel/components/console/ (components are .tsx; consoleCaret is .ts).
const CONSOLE_COMPONENT_FILES = [
  'ConsoleWorkspace.tsx', 'ConsoleStream.tsx', 'ConsolePrompt.tsx', 'RequestContextLine.tsx', 'ConsoleEditor.tsx',
  'SnippetsMenu.tsx', 'ConsoleStatusbar.tsx', 'LevelChips.tsx', 'ExampleCommands.tsx', 'CommandCell.tsx',
  'ResultView.tsx', 'ResultInspector.tsx', 'StarterChips.tsx', 'consoleErrors.tsx', 'consoleCaret.ts',
];
const readConsoleSources = () => CONSOLE_COMPONENT_FILES
  .map((name) => read(`src/panel/components/console/${name}`))
  .join('\n');
const readManifest = () => JSON.parse(read('manifest.json'));
const readPkg = () => JSON.parse(read('package.json'));
const exists = (relPath) => fs.existsSync(path.join(root, relPath));

module.exports = { root, read, readConsoleSources, readManifest, readPkg, exists };
