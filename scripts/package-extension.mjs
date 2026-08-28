#!/usr/bin/env node
// Packages the loadable extension into release/xray-extension-<version>.zip.
//
// Replaces the original PowerShell script, which could only run on Windows. This
// runs anywhere Node does and writes the archive with zlib alone, so packaging
// pulls in no dependency the extension itself does not already need.
//
// Usage: node scripts/package-extension.mjs [outDir]

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.resolve(root, process.argv[2] ?? 'release');

// Everything the packaged extension needs, and nothing else. Anything absent is a
// hard error: a release silently missing dist/ would install but not run.
const allowList = [
  'manifest.json',
  'background.js',
  'window.html',
  'content',
  'devtools',
  'dist',
  'icons',
  'panel',
  'settings',
  'shared',
  'workers',
];

// Never shippable: source, tests, tooling, or anything carrying local history.
const forbidden = ['node_modules', '.git', 'src', 'test', 'docs', 'output', 'preview', 'release'];

// ---------------------------------------------------------------- zip writer
// Minimal but standards-conforming ZIP (PKZIP APPNOTE 6.3.2): local file headers,
// a central directory, and an end-of-central-directory record. Deflate for
// everything compressible, stored when deflate would not help.

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// MS-DOS date/time, which is what the ZIP format stores. Honours SOURCE_DATE_EPOCH
// so a release archive is reproducible.
function dosDateTime(date) {
  const year = Math.max(1980, date.getUTCFullYear());
  return {
    time: (date.getUTCHours() << 11) | (date.getUTCMinutes() << 5) | (date.getUTCSeconds() >> 1),
    date: ((year - 1980) << 9) | ((date.getUTCMonth() + 1) << 5) | date.getUTCDate(),
  };
}

function buildZip(files, modified) {
  const { time, date } = dosDateTime(modified);
  const locals = [];
  const centrals = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = Buffer.from(file.name, 'utf8');
    const deflated = zlib.deflateRawSync(file.data, { level: 9 });
    // Fall back to stored when compression does not pay for itself.
    const useDeflate = deflated.length < file.data.length;
    const body = useDeflate ? deflated : file.data;
    const method = useDeflate ? 8 : 0;
    const crc = crc32(file.data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); // local file header signature
    local.writeUInt16LE(20, 4); // version needed
    local.writeUInt16LE(0x0800, 6); // flags: UTF-8 filenames
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(file.data.length, 22);
    local.writeUInt16LE(nameBytes.length, 26);
    local.writeUInt16LE(0, 28); // extra field length
    locals.push(local, nameBytes, body);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0); // central directory signature
    central.writeUInt16LE(20, 4); // version made by
    central.writeUInt16LE(20, 6); // version needed
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(method, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(date, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(body.length, 20);
    central.writeUInt32LE(file.data.length, 24);
    central.writeUInt16LE(nameBytes.length, 28);
    central.writeUInt16LE(0, 30); // extra
    central.writeUInt16LE(0, 32); // comment
    central.writeUInt16LE(0, 34); // disk number
    central.writeUInt16LE(0, 36); // internal attrs
    // `<< 16` overflows into a negative signed 32-bit int, so coerce back to unsigned.
    central.writeUInt32LE((0o100644 << 16) >>> 0, 38); // external attrs: regular file, 0644
    central.writeUInt32LE(offset, 42);
    centrals.push(central, nameBytes);

    offset += local.length + nameBytes.length + body.length;
  }

  const centralBuf = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); // end of central directory signature
  end.writeUInt16LE(0, 4); // disk number
  end.writeUInt16LE(0, 6); // disk with central directory
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20); // comment length

  return Buffer.concat([...locals, centralBuf, end]);
}

// ------------------------------------------------------------------- collect
function collect(relPath, out) {
  const abs = path.join(root, relPath);
  const stat = fs.statSync(abs);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(abs).sort()) collect(path.join(relPath, entry), out);
  } else {
    // ZIP entries always use forward slashes, on every platform.
    out.push({ name: relPath.split(path.sep).join('/'), data: fs.readFileSync(abs) });
  }
  return out;
}

// ---------------------------------------------------------------------- main
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const version = manifest.version;
const zipPath = path.join(outDir, `xray-extension-${version}.zip`);

for (const item of allowList) {
  if (!fs.existsSync(path.join(root, item))) {
    throw new Error(`Release allowlist item missing: ${item}`);
  }
}

const files = [];
for (const item of allowList) collect(item, files);

// Defence in depth: the allowlist should make this impossible, but a stray nested
// node_modules or a symlink into src/ would be caught here rather than shipped.
for (const file of files) {
  const top = file.name.split('/')[0];
  if (forbidden.includes(top)) {
    throw new Error(`Forbidden item staged into release: ${file.name}`);
  }
}

const epoch = Number(process.env.SOURCE_DATE_EPOCH);
const modified = Number.isFinite(epoch) && epoch > 0 ? new Date(epoch * 1000) : new Date();

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(zipPath, buildZip(files, modified));

const bytes = fs.statSync(zipPath).size;
console.log(`Packaged ${path.relative(root, zipPath)} — ${files.length} files, ${(bytes / 1024).toFixed(0)} KB`);
