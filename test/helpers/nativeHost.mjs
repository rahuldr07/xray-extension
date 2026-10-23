// Registers a native messaging host for the e2e tests, the way an installed xray-db-helper is
// registered: a host manifest named com.xray.db_helper.json in the browser profile's
// NativeMessagingHosts folder. Task 9 points it at the fake helper; Task 10 points it at the real one.
//
// Chrome for Testing on Linux reads per-user host manifests from <user-data-dir>/NativeMessagingHosts
// (verified with Chrome for Testing 151), so a temp profile is enough; no XDG_CONFIG_HOME override.
//
// nativeMessaging is an optional permission, and a test cannot click Chrome's permission prompt, so
// the extension is loaded from a temp copy whose manifest moves it into `permissions`. The copy keeps
// the manifest "key", so the extension ID (and the host manifest's allowed origin) stays the same.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export const HOST_NAME = 'com.xray.db_helper';
export const EXTENSION_ID = 'kjfoocnkoajdcjabnadfojdfaghpbeep';
export const FAKE_HELPER = path.join(root, 'test/fixtures/fake-helper.mjs');

// The release allowList in scripts/package-extension.mjs: everything the unpacked extension needs.
const EXTENSION_FILES = [
  'manifest.json',
  'background.js',
  'background',
  'window.html',
  'sql.html',
  'content',
  'devtools',
  'dist',
  'icons',
  'panel',
  'settings',
  'shared',
  'workers',
];

/**
 * A temp copy of the extension with nativeMessaging granted at install. Returns its path;
 * the caller removes it.
 */
export function extensionCopyWithNativeMessaging() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'xray-e2e-ext-'));
  for (const item of EXTENSION_FILES) fs.cpSync(path.join(root, item), path.join(dir, item), { recursive: true });
  const manifestPath = path.join(dir, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.optional_permissions = (manifest.optional_permissions ?? []).filter((p) => p !== 'nativeMessaging');
  if (!manifest.optional_permissions.length) delete manifest.optional_permissions;
  manifest.permissions = [...new Set([...(manifest.permissions ?? []), 'nativeMessaging'])];
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  return dir;
}

/** Writes the host manifest into a profile directory, pointing at an executable `helperPath`. */
export function registerNativeHost(userDataDir, helperPath = FAKE_HELPER) {
  const dir = path.join(userDataDir, 'NativeMessagingHosts');
  fs.mkdirSync(dir, { recursive: true });
  const manifest = {
    name: HOST_NAME,
    description: 'XRAY database helper (e2e)',
    path: helperPath,
    type: 'stdio',
    allowed_origins: [`chrome-extension://${EXTENSION_ID}/`],
  };
  const file = path.join(dir, `${HOST_NAME}.json`);
  fs.writeFileSync(file, JSON.stringify(manifest, null, 2));
  return file;
}
