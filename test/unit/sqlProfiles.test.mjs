import test from 'node:test';
import assert from 'node:assert/strict';
import './harness.mjs';

const { parseConnectionString, validateProfile, isLoopbackHost, helperInstallCommand, HELPER_EXTENSION_ID } =
  await import('../../src/panel/models/sqlProfiles.ts');

test('percent-encoded userinfo and an explicit sslmode', () => {
  const r = parseConnectionString('postgres://us%40er:p%40ss%3Aw%2Fd@db.supabase.co:6543/postgres?sslmode=require');
  assert.equal('error' in r, false);
  assert.equal(r.profile.engine, 'postgres');
  assert.equal(r.profile.user, 'us@er');
  assert.equal(r.password, 'p@ss:w/d');
  assert.equal(r.profile.host, 'db.supabase.co');
  assert.equal(r.profile.port, 6543);
  assert.equal(r.profile.database, 'postgres');
  assert.equal(r.profile.tls, 'require');
  assert.equal(r.profile.readOnly, true);
  assert.equal(r.profile.name, 'postgres@db.supabase.co');
});

test('mysql on a loopback host defaults to tls disable and port 3306', () => {
  const r = parseConnectionString('mysql://root@localhost/shop');
  assert.equal(r.profile.engine, 'mysql');
  assert.equal(r.profile.tls, 'disable');
  assert.equal(r.profile.port, 3306);
  assert.equal(r.password, '');
});

test('postgresql scheme, bracketed IPv6 host and default port', () => {
  const r = parseConnectionString('postgresql://u@[::1]:5433/x');
  assert.equal(r.profile.host, '::1');
  assert.equal(r.profile.port, 5433);
  assert.equal(parseConnectionString('postgres://u@db.example.com/x').profile.port, 5432);
});

test('sslmode and ssl-mode map onto the three TLS modes', () => {
  const tls = (q) => parseConnectionString(`postgres://u@db.example.com/x?${q}`).profile.tls;
  assert.equal(tls('sslmode=disable'), 'disable');
  for (const m of ['require', 'prefer', 'allow']) assert.equal(tls(`sslmode=${m}`), 'require');
  for (const m of ['verify-ca', 'verify-full']) assert.equal(tls(`sslmode=${m}`), 'verify-full');
  assert.equal(tls('ssl-mode=VERIFY_FULL'.replace('_', '-')), 'verify-full');
  assert.equal(tls(''), 'require');
});

test('bad input returns the exact errors', () => {
  assert.deepEqual(parseConnectionString('http://x'), { error: 'Use a postgres:// or mysql:// connection string.' });
  assert.deepEqual(parseConnectionString('nonsense'), { error: 'Use a postgres:// or mysql:// connection string.' });
  assert.deepEqual(parseConnectionString('postgres:///db'), { error: 'The connection string has no host.' });
});

test('validateProfile reports the first problem', () => {
  const ok = { host: 'db.example.com', port: 5432, tls: 'require' };
  assert.equal(validateProfile(ok), null);
  assert.equal(validateProfile({ ...ok, host: ' ' }), 'Host is required.');
  assert.equal(validateProfile({ ...ok, port: 0 }), 'Port must be between 1 and 65535.');
  assert.equal(validateProfile({ ...ok, port: 70000 }), 'Port must be between 1 and 65535.');
  assert.equal(validateProfile({ ...ok, port: 1.5 }), 'Port must be between 1 and 65535.');
  assert.equal(
    validateProfile({ ...ok, tls: 'disable' }),
    'This server is not on this computer, so XRAY requires TLS. Choose Require or Verify full.',
  );
  assert.equal(validateProfile({ ...ok, host: 'localhost', tls: 'disable' }), null);
});

test('isLoopbackHost follows the helper rule', () => {
  for (const h of ['localhost', 'LOCALHOST', '127.0.0.5', '::1', '[::1]']) assert.equal(isLoopbackHost(h), true, h);
  for (const h of ['db.example.com', '10.0.0.1', '', '127.0.0.1.evil.com', '128.0.0.1']) assert.equal(isLoopbackHost(h), false, h);
});

test('install commands and the pinned extension id', () => {
  assert.equal(
    helperInstallCommand('linux'),
    'curl -fsSL https://raw.githubusercontent.com/rahuldr07/xray-extension/main/helper/install/install.sh | sh',
  );
  assert.equal(helperInstallCommand('mac'), helperInstallCommand('linux'));
  assert.equal(
    helperInstallCommand('windows'),
    'irm https://raw.githubusercontent.com/rahuldr07/xray-extension/main/helper/install/install.ps1 | iex',
  );
  assert.match(HELPER_EXTENSION_ID, /^[a-p]{32}$/);
});
