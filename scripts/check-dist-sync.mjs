#!/usr/bin/env node
// Fails when the committed dist/ bundles do not match what the current source builds.
//
// dist/ is tracked in git because the extension loads it directly — an unpacked
// install runs the committed bundles, not a fresh build. That makes a stale dist/
// a shipping bug: source is fixed, the extension still misbehaves. CI runs this so
// the two cannot drift.
//
// The build stamp is normalised out before comparing, since it legitimately differs
// between the commit that produced dist/ and this run.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bundles = [
  'dist/panel-ui.js',
  'dist/hud-ui.js',
  'dist/window-ui.js',
  'dist/sql-ui.js',
  'dist/sql-worker.js',
  'dist/sqlite3.wasm',
];

// e.g. "2026-08-14 02:52 UTC" — injected as __XRAY_BUILD__ by vite.config.ts.
const STAMP = /\d{4}-\d{2}-\d{2} \d{2}:\d{2} UTC/g;
const normalise = (text) => text.replace(STAMP, '<build-stamp>');
// The wasm is binary and carries no stamp: compare its bytes, not a lossy utf8 decoding.
const readBundle = (abs) =>
  abs.endsWith('.wasm') ? fs.readFileSync(abs).toString('base64') : normalise(fs.readFileSync(abs, 'utf8'));

const committed = new Map();
for (const bundle of bundles) {
  const abs = path.join(root, bundle);
  if (!fs.existsSync(abs)) {
    console.error(`dist-sync: ${bundle} is missing from the working tree.`);
    process.exit(1);
  }
  committed.set(bundle, readBundle(abs));
}

execFileSync('npm', ['run', 'build'], { cwd: root, stdio: 'inherit' });

const stale = bundles.filter((bundle) => {
  const rebuilt = readBundle(path.join(root, bundle));
  return rebuilt !== committed.get(bundle);
});

if (stale.length > 0) {
  console.error('');
  console.error('dist-sync: the committed bundles are stale:');
  for (const bundle of stale) console.error(`  - ${bundle}`);
  console.error('');
  console.error('Run `npm run build` and commit the updated dist/ alongside your source change.');
  process.exit(1);
}

console.log(`dist-sync: all ${bundles.length} bundles match the current source.`);
