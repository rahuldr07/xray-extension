// Shared fixture helpers for the source-pinning suites.
//
// Every test/*.test.js file in this repo asserts against the *text* of source
// files rather than importing them, so a single reader keeps the repo root
// resolution in one place.

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');

const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const readManifest = () => JSON.parse(read('manifest.json'));
const readPkg = () => JSON.parse(read('package.json'));
const exists = (relPath) => fs.existsSync(path.join(root, relPath));

module.exports = { root, read, readManifest, readPkg, exists };
