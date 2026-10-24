// Real end-to-end tests for Postgres and MySQL: the built xray-db-helper, real Postgres 16 and
// MySQL 8.4 servers, the real service worker and the real sql.html. Nothing is faked.
//
// Run with `bash helper/scripts/test-with-docker.sh --e2e`, which starts both servers in Docker,
// exports XRAY_E2E_PG_DSN and XRAY_E2E_MYSQL_DSN (connection strings as a user pastes them) and
// runs this file. Without both variables every test is skipped, so `npm run test:e2e` stays green
// on machines without Docker or Go.
//
// The test builds the helper with `go build` into a temp folder and registers it as
// com.xray.db_helper in the temp profile's NativeMessagingHosts folder (test/helpers/nativeHost.mjs;
// Chrome for Testing on Linux reads host manifests from <user-data-dir>/NativeMessagingHosts).
//
// Permission: nativeMessaging is an optional permission and Playwright cannot click Chrome's
// permission prompt, so the extension is loaded from a temp copy whose manifest moves
// nativeMessaging into `permissions`. The chrome.permissions.request call itself is covered by a
// unit test with a stubbed chrome.permissions (Task 9).
//
// The fixture tables are created by speaking the helper's own protocol to a second helper process
// (read-write), so no database client is needed here or in CI. This is a behaviour test: it does
// not write files on the server and does not probe read-only bypasses.

import assert from 'node:assert/strict';
import test from 'node:test';
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { extensionCopyWithNativeMessaging, registerNativeHost } from '../helpers/nativeHost.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const PG_DSN = process.env.XRAY_E2E_PG_DSN ?? '';
const MYSQL_DSN = process.env.XRAY_E2E_MYSQL_DSN ?? '';
const skip = PG_DSN && MYSQL_DSN ? false : 'XRAY_E2E_PG_DSN and XRAY_E2E_MYSQL_DSN are unset (run helper/scripts/test-with-docker.sh --e2e)';

// 2^53 + 1: a JavaScript number would read it as 9007199254740992.
const BIG = '9007199254740993';

let binDir = '';
let helperBin = '';

test.before(async () => {
  if (skip) return;
  binDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xray-e2e-helper-'));
  helperBin = path.join(binDir, 'xray-db-helper');
  execFileSync('go', ['build', '-o', helperBin, './cmd/xray-db-helper'], { cwd: path.join(root, 'helper'), stdio: 'inherit' });
  await seed(PG_DSN, [
    'drop table if exists e2e_items',
    'drop table if exists e2e_notes',
    'create table e2e_items (id int primary key, big int8 not null, label text not null)',
    `insert into e2e_items select g, case when g = 1 then ${BIG} else g end, 'item ' || g from generate_series(1, 25) g`,
    'create table e2e_notes (id serial primary key, body text not null)',
  ]);
  await seed(MYSQL_DSN, [
    'drop table if exists e2e_items',
    'create table e2e_items (id int primary key, big bigint not null, label varchar(40) not null)',
    'insert into e2e_items (id, big, label) with recursive g(n) as (select 1 union all select n + 1 from g where n < 25) ' +
      `select n, if(n = 1, ${BIG}, n), concat('item ', n) from g`,
  ]);
});

test.after(() => {
  if (binDir) fs.rmSync(binDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------- the helper's protocol, for seeding
// A 4-byte native-endian length, then JSON (helper/internal/protocol/frame.go).
function helperClient(bin) {
  const child = spawn(bin, [], { stdio: ['pipe', 'pipe', 'ignore'] });
  const LE = os.endianness() === 'LE';
  const pending = new Map();
  let nextId = 1;
  let buffer = Buffer.alloc(0);
  child.stdout.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    while (buffer.length >= 4) {
      const n = LE ? buffer.readUInt32LE(0) : buffer.readUInt32BE(0);
      if (buffer.length < 4 + n) break;
      const msg = JSON.parse(buffer.subarray(4, 4 + n).toString('utf8'));
      buffer = buffer.subarray(4 + n);
      if (msg.stream) continue;
      const p = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.ok) p?.resolve(msg.value);
      else p?.reject(new Error(`${msg.error.code}: ${msg.error.message}`));
    }
  });
  const call = (op, fields = {}) =>
    new Promise((resolve, reject) => {
      const id = nextId++;
      pending.set(id, { resolve, reject });
      const body = Buffer.from(JSON.stringify({ id, op, ...fields }), 'utf8');
      const head = Buffer.alloc(4);
      if (LE) head.writeUInt32LE(body.length);
      else head.writeUInt32BE(body.length);
      child.stdin.write(Buffer.concat([head, body]));
    });
  const close = () =>
    new Promise((resolve) => {
      child.once('exit', resolve);
      child.stdin.end();
    });
  return { call, close };
}

function connectFields(dsn) {
  const url = new URL(dsn);
  const engine = url.protocol === 'mysql:' ? 'mysql' : 'postgres';
  return {
    engine,
    host: url.hostname,
    port: Number(url.port),
    database: decodeURIComponent(url.pathname.slice(1)),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    tls: 'disable',
    readOnly: false,
  };
}

async function seed(dsn, statements) {
  const client = helperClient(helperBin);
  try {
    await client.call('hello');
    const { sessionId } = await client.call('connect', connectFields(dsn));
    for (const sql of statements) await client.call('execute', { sessionId, tabId: 'seed', sql });
    await client.call('close', { sessionId });
  } finally {
    await client.close();
  }
}

// ---------------------------------------------------------------- the page
// A fresh profile per test, with the helper at `bin` registered as com.xray.db_helper. Console
// messages from the page and the extension are collected for the password check.
async function openRemotePage(t, { bin = helperBin } = {}) {
  const ext = extensionCopyWithNativeMessaging();
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xray-e2e-sql-real-'));
  registerNativeHost(userDataDir, bin);
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: true,
    channel: 'chromium',
    viewport: { width: 1280, height: 900 },
    args: [`--disable-extensions-except=${ext}`, `--load-extension=${ext}`, '--no-sandbox'],
  });
  t.after(async () => {
    await context.close();
    fs.rmSync(userDataDir, { recursive: true, force: true });
    fs.rmSync(ext, { recursive: true, force: true });
  });
  const consoleText = [];
  context.on('console', (m) => consoleText.push(m.text()));
  const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker', { timeout: 30_000 }));
  const extensionId = new URL(worker.url()).host;
  const page = await context.newPage();
  page.on('console', (m) => consoleText.push(m.text()));
  page.on('pageerror', (e) => consoleText.push(String(e)));
  await page.goto(`chrome-extension://${extensionId}/sql.html`);
  await page.getByRole('button', { name: 'Connect to a database', exact: true }).waitFor();
  return { context, page, worker, consoleText };
}

const railItem = (page, name) => page.getByRole('treeitem', { name, exact: true });
const summary = (page) => page.locator('.xray-sql-results-summary');
const messages = (page) => page.getByRole('log', { name: 'Messages' });
const runButton = (page) => page.getByRole('button', { name: 'Run', exact: true });
const readOnlySwitch = (page) => page.getByRole('switch', { name: 'Read-only', exact: true });
const summaryMatches = (page, re) => async () => re.test((await summary(page).textContent()) ?? '');

async function openConnectionDialog(page) {
  await page.getByRole('button', { name: 'Connect to a database', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'New connection', exact: true });
  await dialog.waitFor();
  return dialog;
}

// Pastes the connection string into the dialog, names it, and saves and connects.
async function connect(page, dsn, name) {
  const dialog = await openConnectionDialog(page);
  await dialog.getByLabel('Connection string', { exact: true }).fill(dsn);
  await dialog.getByText('Filled in the fields below.', { exact: true }).waitFor();
  await dialog.getByLabel('Name', { exact: true }).fill(name);
  await dialog.getByRole('button', { name: 'Save & connect', exact: true }).click();
  await dialog.waitFor({ state: 'detached' });
}

async function connectPostgres(page) {
  await connect(page, PG_DSN, 'E2E PG');
  await page.locator('.xray-sql-source', { hasText: /E2E PG · PostgreSQL 16\./ }).waitFor();
  await railItem(page, 'e2e_items').waitFor();
}

async function setSql(page, sql) {
  const editor = page.getByLabel('SQL editor');
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.keyboard.insertText(sql);
  await page.keyboard.press('Escape');
}

async function runSql(page, sql) {
  await setSql(page, sql);
  await page.keyboard.press('Control+Enter');
}

async function assertEventually(check, label, timeout = 15_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await check()) return;
    await sleep(100);
  }
  assert.fail(`timed out: ${label}`);
}

// PIDs of processes running exactly `bin` (by /proc/<pid>/exe), never a pattern match.
function pidsOf(bin) {
  const target = fs.realpathSync(bin);
  const pids = [];
  for (const entry of fs.readdirSync('/proc')) {
    if (!/^\d+$/.test(entry)) continue;
    try {
      if (fs.readlinkSync(`/proc/${entry}/exe`) === target) pids.push(Number(entry));
    } catch {
      // Another user's process, or one that just exited.
    }
  }
  return pids;
}

// ---------------------------------------------------------------- Postgres
test('Postgres: a pasted connection string connects, the rail lists the tables, and a preview keeps int8 exact', { skip, timeout: 120_000 }, async (t) => {
  const { page } = await openRemotePage(t);
  await connectPostgres(page);
  await railItem(page, 'e2e_notes').waitFor();
  assert.equal(await readOnlySwitch(page).isChecked(), true, 'a new connection is read-only');

  await railItem(page, 'e2e_items').click();
  await assertEventually(summaryMatches(page, /^25 rows/), 'preview header reads 25 rows');
  await page.getByRole('gridcell', { name: BIG, exact: true }).waitFor();
  await page.getByRole('gridcell', { name: 'item 25', exact: true }).waitFor();
});

test('Postgres read-only: UPDATE is refused before it is sent, set_config runs, and COMMIT is refused by the helper', { skip, timeout: 120_000 }, async (t) => {
  const { page } = await openRemotePage(t);
  await connectPostgres(page);

  // The page's pre-check refuses the write.
  await runSql(page, "update e2e_items set label = 'changed' where id = 1");
  await messages(page).getByText('This connection is read-only. Turn off Read-only to run UPDATE', { exact: false }).waitFor();

  // A function call is a read to the page; inside the read-only transaction it runs.
  await runSql(page, "select set_config('xray.e2e', 'y', false) as v");
  await assertEventually(summaryMatches(page, /^1 rows/), 'set_config returns one row');
  await page.getByRole('gridcell', { name: 'y', exact: true }).waitFor();

  // COMMIT passes the page (transaction control) and is refused by the helper's guard.
  await runSql(page, 'commit;');
  await messages(page).getByText('This connection is read-only, so COMMIT is not allowed.', { exact: true }).waitFor();

  await runSql(page, 'select label from e2e_items where id = 1');
  await page.getByRole('gridcell', { name: 'item 1', exact: true }).waitFor();
});

test('Postgres read-write: with Read-only off an INSERT commits and a count sees it', { skip, timeout: 120_000 }, async (t) => {
  const { page } = await openRemotePage(t);
  await connectPostgres(page);
  await readOnlySwitch(page).click();
  await assertEventually(async () => !(await readOnlySwitch(page).isChecked()), 'Read-only switched off');
  await page.getByRole('tab', { name: 'Messages', exact: true }).click();
  await messages(page).getByText('E2E PG is open for writing. Statements commit as they run.', { exact: true }).waitFor();

  await runSql(page, "insert into e2e_notes (body) values ('from e2e')");
  await assertEventually(summaryMatches(page, /^1 rows affected/), 'the insert affects one row');
  await runSql(page, "select count(*) as n from e2e_notes where body = 'from e2e'");
  await assertEventually(summaryMatches(page, /^1 rows/), 'count returns one row');
  await page.getByRole('gridcell', { name: '1', exact: true }).waitFor();
});

test('Postgres: Stop cancels pg_sleep(30) within 2 s and the connection keeps working', { skip, timeout: 120_000 }, async (t) => {
  const { page } = await openRemotePage(t);
  await connectPostgres(page);

  await runSql(page, 'select pg_sleep(30)');
  const stop = page.getByRole('button', { name: 'Stop', exact: true });
  await assertEventually(() => stop.isEnabled(), 'Stop enabled while the query runs', 5_000);
  await sleep(500);
  const clicked = Date.now();
  await stop.click();
  await messages(page).getByText('Query cancelled.', { exact: false }).waitFor({ timeout: 5_000 });
  const took = Date.now() - clicked;
  assert.ok(took < 2_000, `cancelled ${took} ms after Stop`);

  await assertEventually(() => runButton(page).isEnabled(), 'Run enabled after cancel');
  await runSql(page, 'select 1 as one');
  await assertEventually(summaryMatches(page, /^1 rows/), 'select 1 returns one row');
  await page.getByRole('gridcell', { name: '1', exact: true }).waitFor();
});

test('Postgres: a 10-row limit over 25 rows, then Fetch more reads the rest from the open cursor', { skip, timeout: 120_000 }, async (t) => {
  const { page } = await openRemotePage(t);
  await connectPostgres(page);

  const maxRows = page.getByRole('spinbutton');
  await maxRows.fill('10');
  await maxRows.press('Enter');
  await runSql(page, 'select * from e2e_items order by id');
  await assertEventually(summaryMatches(page, /^10 rows/), 'first page of 10 rows');
  const fetchMore = page.getByRole('button', { name: 'Fetch more', exact: true });
  await fetchMore.click();
  // Fetch more asks for 1,000 rows (the plan's fetchMore default), so the remaining 15 arrive at once.
  await assertEventually(summaryMatches(page, /^25 rows/), 'all 25 rows after Fetch more');
  await fetchMore.waitFor({ state: 'detached' });
  await page.getByRole('gridcell', { name: 'item 25', exact: true }).waitFor();
});

// ---------------------------------------------------------------- MySQL
test('MySQL: a pasted connection string connects, and a preview keeps BIGINT exact', { skip, timeout: 120_000 }, async (t) => {
  const { page } = await openRemotePage(t);
  await connect(page, MYSQL_DSN, 'E2E MySQL');
  await page.locator('.xray-sql-source', { hasText: /E2E MySQL · MySQL 8\.4/ }).waitFor();
  await railItem(page, 'e2e_items').click();
  await assertEventually(summaryMatches(page, /^25 rows/), 'preview header reads 25 rows');
  await page.getByRole('gridcell', { name: BIG, exact: true }).waitFor();
  await page.getByRole('gridcell', { name: 'item 25', exact: true }).waitFor();
});

// ---------------------------------------------------------------- failures
test('the helper dying mid-query shows Connection lost, and Reconnect starts it again', { skip, timeout: 120_000 }, async (t) => {
  // A copy of the binary only this test registers, so the kill below can only hit its process.
  const crashDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xray-e2e-crash-'));
  const crashBin = path.join(crashDir, 'xray-db-helper');
  fs.copyFileSync(helperBin, crashBin);
  fs.chmodSync(crashBin, 0o755);
  t.after(() => fs.rmSync(crashDir, { recursive: true, force: true }));

  const { page } = await openRemotePage(t, { bin: crashBin });
  await connectPostgres(page);
  await runSql(page, 'select pg_sleep(30)');
  await assertEventually(() => page.getByRole('button', { name: 'Stop', exact: true }).isEnabled(), 'query running', 5_000);
  const pids = pidsOf(crashBin);
  assert.equal(pids.length, 1, `exactly one helper runs ${crashBin}: ${pids}`);
  process.kill(pids[0], 'SIGKILL');

  const banner = page.getByRole('alert').filter({ hasText: 'Connection lost.' });
  await banner.waitFor();
  await banner.getByRole('button', { name: 'Reconnect', exact: true }).click();
  await banner.waitFor({ state: 'detached' });
  await assertEventually(() => pidsOf(crashBin).length === 1, 'a new helper process');
  await runSql(page, 'select 41 + 1 as answer');
  await page.getByRole('gridcell', { name: '42', exact: true }).waitFor();
});

test('a wrong password is rejected, the prompt asks again, and no password shows in the page or console', { skip, timeout: 120_000 }, async (t) => {
  const { page, worker, consoleText } = await openRemotePage(t);
  // The collector sees the service worker's console too (the password passes through it).
  await worker.evaluate(() => console.log('xray-e2e-console-probe'));
  await assertEventually(() => consoleText.some((line) => line.includes('xray-e2e-console-probe')), 'the worker console is collected', 5_000);
  const url = new URL(PG_DSN);
  const realPassword = decodeURIComponent(url.password);
  const wrongPassword = 'Wrong-e2e-guess9';
  url.password = '';
  await connect(page, url.toString(), 'E2E no secret');

  const prompt = page.getByRole('dialog', { name: 'Password for E2E no secret', exact: true });
  await prompt.waitFor();
  await prompt.getByLabel('Password', { exact: true }).fill(wrongPassword);
  await prompt.getByRole('button', { name: 'Connect', exact: true }).click();
  await prompt.waitFor({ state: 'detached' });
  // auth-failed from the server, in the helper's fixed wording, on the welcome screen.
  await page.getByText('The server rejected the user name or password.', { exact: true }).waitFor();

  // The wrong password was not kept, so the saved connection asks again.
  const saved = page.getByRole('region', { name: 'Saved connections', exact: true });
  await saved.getByRole('button', { name: /^E2E no secret/ }).click();
  await prompt.waitFor();
  await prompt.getByLabel('Password', { exact: true }).fill(realPassword);
  await prompt.getByRole('button', { name: 'Connect', exact: true }).click();
  await prompt.waitFor({ state: 'detached' });
  await railItem(page, 'e2e_items').waitFor();

  const text = await page.evaluate(() => document.body.innerText);
  const html = await page.content();
  for (const secret of [wrongPassword, realPassword]) {
    assert.ok(!text.includes(secret), 'no password in the page text');
    assert.ok(!html.includes(secret), 'no password in the page markup');
    assert.ok(!consoleText.some((line) => line.includes(secret)), 'no password in any console message');
  }
});
