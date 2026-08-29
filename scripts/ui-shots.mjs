// UI screenshot harness — renders the real panel bundle and writes PNGs.
//
// Why this exists: the panel has five surfaces, six themes and a container-query
// layout, so "does it look right" is a matrix, not a glance. Reviewing a UI change
// by reading CSS does not catch a tab bar that clips at 420px or a workspace that
// stops filling its height. This renders the actual dist bundle in Chromium and
// writes one PNG per cell of that matrix, plus every console message the panel
// emitted while rendering.
//
// It is a review tool, not a test: nothing here asserts. Run it, look at the
// output, and delete it when you are done. `output/` is gitignored.
//
//   npm run build && node scripts/ui-shots.mjs
//   node scripts/ui-shots.mjs --out output/before --tabs api,console --widths 1600,420
//
// Themes are not yet a dimension here: the preview page has no entry point for
// setting one, and swapping the `.xray-theme-*` class from outside would leave the
// inline accent behind and paint a combination the product never renders (see
// docs/ui-conventions.md §1a). Drive themes through Theme Studio until the preview
// page accepts one.
//
// Requires Playwright's Chromium (`npx playwright install chromium`, or set
// PLAYWRIGHT_BROWSERS_PATH where one is already unpacked). If the build this
// Playwright pins is absent but another one is unpacked beside it, we use that —
// see resolveChromium().

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const TABS = ['console', 'api', 'logs', 'rules', 'insights'];
// A wide docked panel, two mid widths either side of the breakpoint where the detail
// pane stops sitting beside the list, and the narrowest panel the shell supports.
const WIDTHS = [1600, 1100, 760, 420];

function parseArgs(argv) {
  const args = { out: 'output/ui-shots', tabs: TABS, widths: WIDTHS };
  for (let i = 0; i < argv.length; i += 1) {
    const [flag, inlineValue] = argv[i].split('=');
    const value = inlineValue ?? argv[i + 1];
    if (inlineValue === undefined && value !== undefined) i += 1;
    if (flag === '--out') args.out = value;
    else if (flag === '--tabs') args.tabs = value.split(',');
    else if (flag === '--widths') args.widths = value.split(',').map(Number);
  }
  return args;
}

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

// Playwright resolves one exact Chromium build number, and a machine that has a
// different one unpacked (a preinstalled image, a Playwright upgrade without a
// re-install) gets a path that does not exist. Launching on it does not fail fast —
// it hangs — so look before leaping and fall back to whatever build is actually
// there. Returns undefined to mean "let Playwright choose", which is right when the
// pinned build is present.
function resolveChromium() {
  const pinned = chromium.executablePath();
  if (fs.existsSync(pinned)) return undefined;

  const browsersPath = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!browsersPath || !fs.existsSync(browsersPath)) return undefined;

  // Layout differs across versions: chrome-linux/chrome and chrome-linux64/chrome.
  // Prefer a full Chromium over the headless shell — the shell cannot load extensions.
  const candidates = fs
    .readdirSync(browsersPath)
    .filter((entry) => entry.startsWith('chromium-'))
    .flatMap((entry) => [
      path.join(browsersPath, entry, 'chrome-linux', 'chrome'),
      path.join(browsersPath, entry, 'chrome-linux64', 'chrome'),
    ])
    .filter((candidate) => fs.existsSync(candidate));

  if (!candidates.length) return undefined;
  console.warn(`Pinned Chromium is missing (${pinned}); using ${candidates[0]}`);
  return candidates[0];
}

// The panel bundle is loaded with a <script src>, so file:// would put it on an
// opaque origin and the preview's fixture seeding would be blocked. Serve the tree.
function serveRepo() {
  const server = http.createServer((req, res) => {
    const file = path.join(root, decodeURIComponent(req.url.split('?')[0]));
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404);
      res.end('not found');
      return;
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(fs.readFileSync(file));
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const outDir = path.resolve(root, args.out);
  fs.mkdirSync(outDir, { recursive: true });

  if (!fs.existsSync(path.join(root, 'dist/panel-ui.js'))) {
    throw new Error('dist/panel-ui.js is missing — run `npm run build` first.');
  }

  const { server, port } = await serveRepo();
  const base = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch({
    args: ['--no-sandbox'],
    executablePath: resolveChromium(),
  });
  const messages = [];
  let shots = 0;

  try {
    for (const width of args.widths) {
      for (const tab of args.tabs) {
        const label = `${width}-${tab}`;
        const context = await browser.newContext({
          viewport: { width, height: 1000 },
          deviceScaleFactor: 2,
        });
        const page = await context.newPage();
        page.on('console', (message) => {
          if (message.type() === 'error' || message.type() === 'warning') {
            messages.push(`${label}  ${message.type()}: ${message.text()}`);
          }
        });
        page.on('pageerror', (error) => messages.push(`${label}  pageerror: ${error.message}`));

        await page.goto(`${base}/preview/ui-preview.html?tab=${tab}`, { waitUntil: 'networkidle' });
        // The preview seeds its fixtures after mount; give the first paint a beat.
        await page.waitForTimeout(400);
        await page.screenshot({ path: path.join(outDir, `${label}.png`) });
        shots += 1;
        await context.close();
      }
    }
  } finally {
    await browser.close();
    server.close();
  }

  const log = messages.length ? messages.join('\n') : 'No console errors or warnings.';
  fs.writeFileSync(path.join(outDir, 'console.log'), `${log}\n`);
  console.log(`${shots} screenshots → ${path.relative(root, outDir)}`);
  console.log(log);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
