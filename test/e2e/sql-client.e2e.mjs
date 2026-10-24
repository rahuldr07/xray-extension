/* global chrome */
// End-to-end tests for the SQL client: sql.html on its own, framed by the SQL tab in the pop-out
// window, opened in its own window from the in-page HUD, and framed in the HUD with the inline option.
//
// Each test launches the unpacked extension in a fresh profile, so persisted editor tabs and
// history from one test never leak into the next. `window.showOpenFilePicker` is deleted before
// page scripts run, which forces the hidden <input type="file"> fallback that Playwright can drive;
// one test instead makes the picker throw SecurityError, as it does in the DevTools panel's subframe.

import assert from 'node:assert/strict';
import test from 'node:test';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { shopDatabaseBytes } from '../helpers/sqliteFixture.mjs';
import { extensionCopyWithNativeMessaging, registerNativeHost } from '../helpers/nativeHost.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xray-e2e-sql-files-'));
const shopPath = path.join(fileDir, 'shop.sqlite');
const emptyPath = path.join(fileDir, 'empty.db');
const notesPath = path.join(fileDir, 'notes.db');
fs.writeFileSync(shopPath, await shopDatabaseBytes());
fs.writeFileSync(emptyPath, new Uint8Array(0));
fs.writeFileSync(notesPath, 'Remember to buy milk.\n');
test.after(() => fs.rmSync(fileDir, { recursive: true, force: true }));

async function launch(t) {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xray-e2e-sql-'));
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: true,
    // The full Chromium build: the headless shell cannot load extensions.
    channel: 'chromium',
    viewport: { width: 1280, height: 900 },
    args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`, '--no-sandbox'],
  });
  t.after(async () => {
    await context.close();
    fs.rmSync(userDataDir, { recursive: true, force: true });
  });
  const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker', { timeout: 30_000 }));
  const extensionId = new URL(worker.url()).host;
  return { context, extensionId };
}

async function openSqlPage(t) {
  const { context, extensionId } = await launch(t);
  const page = await context.newPage();
  await page.addInitScript(() => {
    delete window.showOpenFilePicker;
  });
  await page.goto(`chrome-extension://${extensionId}/sql.html`);
  await page.getByRole('button', { name: 'Open SQLite file' }).waitFor();
  return { context, extensionId, page };
}

async function openFile(page, filePath) {
  await page.locator('input[type="file"]').setInputFiles(filePath);
}

const railItem = (page, name) => page.getByRole('treeitem', { name, exact: true });
const summary = (page) => page.locator('.xray-sql-results-summary');
const messages = (page) => page.getByRole('log', { name: 'Messages' });
const runButton = (page) => page.getByRole('button', { name: 'Run', exact: true });

// With a file open, "Open SQLite file" lives in the header's source menu, and Read-only is the
// header's mode switch (role="switch", name "Read-only").
const readOnlySwitch = (page) => page.getByRole('switch', { name: 'Read-only', exact: true });

async function openShop(page) {
  await openFile(page, shopPath);
  await railItem(page, 'orders').waitFor();
}

// Replaces the active tab's SQL. Escape closes any completion popup so it cannot take the key.
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

test('opening a database lists its tables and previews one', { timeout: 120_000 }, async (t) => {
  const { page } = await openSqlPage(t);
  await openShop(page);
  for (const name of ['customers', 'orders', 'big_orders']) await railItem(page, name).waitFor();

  // Spec §1 (Ruling R18): a table expands to its columns with type, PK and NOT NULL markers.
  const toggle = page.getByRole('button', { name: 'Columns of orders', exact: true });
  assert.equal(await toggle.getAttribute('aria-expanded'), 'false', 'collapsed by default');
  await toggle.click();
  assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
  const columns = page.getByRole('group', { name: 'orders columns', exact: true });
  const id = columns.getByRole('treeitem', { name: 'id, INTEGER, primary key', exact: true });
  await id.waitFor();
  await id.getByRole('img', { name: 'primary key', exact: true }).waitFor();
  await columns.getByRole('treeitem', { name: 'customer_id, INTEGER', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Columns of customers', exact: true }).click();
  await page
    .getByRole('group', { name: 'customers columns', exact: true })
    .getByRole('treeitem', { name: 'email, TEXT, not null', exact: true })
    .getByRole('img', { name: 'not null', exact: true })
    .waitFor();

  await railItem(page, 'orders').click();
  await assertEventually(async () => /^100 rows/.test(await summary(page).textContent()), 'preview header reads 100 rows');
  const big = page.getByRole('gridcell', { name: '9007199254740993', exact: true });
  await big.waitFor();
  // Spec §2 (Ruling R18): a big integer arrives as a digit string but is laid out as a number.
  assert.match(await big.getAttribute('class'), /\bkind-number\b/);
});

test('a blocked file picker falls back to the file chooser, and a download save stays unsaved', { timeout: 120_000 }, async (t) => {
  const { context, extensionId } = await launch(t);
  const page = await context.newPage();
  // Inside the DevTools panel sql.html is a cross-origin subframe, where the picker throws SecurityError.
  await page.addInitScript(() => {
    window.showOpenFilePicker = () =>
      Promise.reject(new DOMException("Cross origin sub frames aren't allowed to show a file picker.", 'SecurityError'));
  });
  await page.goto(`chrome-extension://${extensionId}/sql.html`);
  const open = page.getByRole('button', { name: 'Open SQLite file' });
  await open.waitFor();
  const chooser = page.waitForEvent('filechooser', { timeout: 10_000 });
  await open.click();
  await (await chooser).setFiles(shopPath);
  await railItem(page, 'orders').waitFor();

  // Opened through <input type=file>, so there is no file handle and Save downloads the bytes.
  await readOnlySwitch(page).uncheck();
  await assertEventually(async () => !(await readOnlySwitch(page).isChecked()) && (await runButton(page).isEnabled()), 'connection reopened read-write');
  await runSql(page, "insert into customers values (4, 'kay@example.test', null)");
  const save = page.getByRole('button', { name: 'Save', exact: true });
  await assertEventually(() => save.isEnabled(), 'Save enabled after a write');
  const download = page.waitForEvent('download', { timeout: 10_000 });
  await save.click();
  await download;
  await page.getByRole('tab', { name: 'Messages', exact: true }).click();
  await messages(page).getByText('Download started — the file is saved when the download completes.', { exact: false }).waitFor();
  // The download may still be cancelled, so the changes still count as unsaved.
  assert.equal(await save.isEnabled(), true, 'Save stays enabled');
  // The status bar carries the unsaved state.
  await page.locator('.xray-sql-status .xray-sql-connection-meta', { hasText: 'unsaved changes' }).waitFor({ timeout: 2_000 });
});

test('a write on a read-only connection is refused with a message', { timeout: 120_000 }, async (t) => {
  const { page } = await openSqlPage(t);
  await openShop(page);
  assert.equal(await readOnlySwitch(page).isChecked(), true, 'read-only is on by default');
  assert.equal(await readOnlySwitch(page).textContent(), 'Read-only');

  await runSql(page, 'update orders set total = 0');
  await messages(page).getByText('This connection is read-only', { exact: false }).waitFor();
});

test('DROP asks for confirmation and Cancel leaves the table in place', { timeout: 120_000 }, async (t) => {
  const { page } = await openSqlPage(t);
  await openShop(page);
  await readOnlySwitch(page).uncheck();
  await assertEventually(async () => !(await readOnlySwitch(page).isChecked()) && (await runButton(page).isEnabled()), 'connection reopened read-write');

  assert.equal(await readOnlySwitch(page).textContent(), 'Editable', 'the switch shows the mode');
  await runSql(page, 'drop table customers');
  const dialog = page.getByRole('dialog', { name: 'Run DROP?' });
  await dialog.waitFor();
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await dialog.waitFor({ state: 'detached' });
  await railItem(page, 'customers').waitFor();
});

test('Stop cancels a runaway query and the connection keeps working', { timeout: 120_000 }, async (t) => {
  const { page } = await openSqlPage(t);
  await openShop(page);

  await setSql(page, 'with recursive c(x) as (select 1 union all select x+1 from c) select count(*) from c');
  await runButton(page).click();
  const stop = page.getByRole('button', { name: 'Stop', exact: true });
  const started = Date.now();
  await assertEventually(() => stop.isEnabled(), 'Stop enabled while the query runs', 2_000);
  await stop.click();
  assert.ok(Date.now() - started < 2_000, 'Stop was clicked within 2 s');
  await messages(page).getByText('Query cancelled.', { exact: false }).waitFor();

  await assertEventually(() => runButton(page).isEnabled(), 'Run enabled after cancel');
  await runSql(page, 'select count(*) from orders');
  await assertEventually(async () => /^1 rows/.test((await summary(page).textContent()) ?? ''), 'count returns one row');
  await page.getByRole('gridcell', { name: '2500', exact: true }).waitFor();
});

test('the pop-out window frames the SQL client in its SQL tab', { timeout: 120_000 }, async (t) => {
  const { context, extensionId } = await launch(t);
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/window.html`);
  await page.getByRole('tab', { name: 'SQL', exact: true }).click();
  const frame = page.locator('iframe[title="SQL client"]');
  await frame.waitFor();
  assert.match(await frame.getAttribute('src'), /\/sql\.html$/);
  // The extension page CSP allows the frame: the client itself loads inside it.
  await page.frameLocator('iframe[title="SQL client"]').getByRole('button', { name: 'Open SQLite file' }).waitFor();
  // An extension ancestor: sql.html's web-page gate (sqlClientAllowedIn) lets it run with the inline option off.
  const inner = await (await frame.elementHandle()).contentFrame();
  assert.deepEqual(await inner.evaluate(() => [...location.ancestorOrigins]), [`chrome-extension://${extensionId}`]);
});

test('the framed client keeps its open database across tab switches', { timeout: 120_000 }, async (t) => {
  const { context, extensionId } = await launch(t);
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/window.html`);
  await page.getByRole('tab', { name: 'SQL', exact: true }).click();
  const frameEl = page.locator('iframe[title="SQL client"]');
  await frameEl.waitFor();
  const frame = page.frameLocator('iframe[title="SQL client"]');
  await frame.getByRole('button', { name: 'Open SQLite file' }).waitFor();
  // Inside a web page the client offers files only: saved connections open in the XRAY window.
  await frame.getByRole('button', { name: 'Open in window', exact: true }).waitFor();
  assert.equal(await frame.getByRole('button', { name: 'Connect to a database' }).count(), 0, 'no Connect inside the page');
  await frame.locator('input[type="file"]').setInputFiles(shopPath);
  await frame.getByRole('treeitem', { name: 'orders', exact: true }).waitFor();
  // Marks this document: a reloaded or re-created frame would lose it.
  const frameHandle = await (await frameEl.elementHandle()).contentFrame();
  await frameHandle.evaluate(() => { window.__sameDocument = true; });

  await page.getByRole('tab', { name: 'API', exact: true }).click();
  await frameEl.waitFor({ state: 'hidden' });
  await page.getByRole('tab', { name: 'SQL', exact: true }).click();
  await frameEl.waitFor({ state: 'visible' });

  assert.equal(await page.locator('iframe[title="SQL client"]').count(), 1);
  const after = await (await frameEl.elementHandle()).contentFrame();
  assert.equal(await after.evaluate(() => window.__sameDocument === true), true, 'the same document, never re-created');
  await frame.getByRole('treeitem', { name: 'orders', exact: true }).waitFor({ timeout: 2_000 });
  await frame.locator('.xray-sql-source').click();
  assert.equal(await frame.getByRole('button', { name: 'Open SQLite file' }).isEnabled(), true);
});

// Opens the in-page HUD on a fixture page and returns a clicker that reaches into its closed shadow
// root. `inline` writes settings.sqlInlineInHud through the storage the panel reads before the page
// loads; `csp` serves the fixture with that Content-Security-Policy header.
async function openHud(t, { inline = false, csp = null, databases = false } = {}) {
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'content-type': 'text/html', ...(csp ? { 'content-security-policy': csp } : {}) });
    // The page records every window message it receives: the SQL frame must never post to it.
    res.end('<!doctype html><html><head><title>XRAY e2e fixture</title></head><body><h1>fixture</h1>'
      + '<script>window.__messages = []; addEventListener("message", (e) => window.__messages.push(e.data));</script></body></html>');
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => server.close());
  const { context } = await launch(t);
  if (inline) {
    const worker = context.serviceWorkers()[0];
    // themeRefreshPending is stored too, or the record reads as settings from before the theme refresh.
    await worker.evaluate((db) => chrome.storage.local.set({ xray_react_panel_preferences: { settings: { sqlInlineInHud: true, sqlDatabasesInHud: db, themeRefreshPending: false } } }), databases);
  }
  const page = context.pages()[0] || (await context.newPage());
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await sleep(1200);
  await page.keyboard.press('Control+Shift+X');

  // The HUD's shadow root is closed; CDP's pierce mode is the only way in.
  const cdp = await context.newCDPSession(page);
  let rootId = null;
  for (let attempt = 0; attempt < 40 && !rootId; attempt++) {
    const { root: doc } = await cdp.send('DOM.getDocument', { depth: -1, pierce: true });
    const found = [];
    const walk = (node) => {
      for (const shadow of node.shadowRoots || []) { found.push(shadow); walk(shadow); }
      for (const child of node.children || []) walk(child);
    };
    walk(doc);
    for (const shadow of found) {
      const { object } = await cdp.send('DOM.resolveNode', { backendNodeId: shadow.backendNodeId });
      const ok = await cdp.send('Runtime.callFunctionOn', {
        objectId: object.objectId, returnByValue: true,
        functionDeclaration: 'function(){ return !!this.host && this.host.id === "__xray_root__" && !!this.querySelector(".xray-panel"); }',
      });
      if (ok.result.value) { rootId = object.objectId; break; }
    }
    if (!rootId) await sleep(250);
  }
  assert.ok(rootId, 'XRAY shadow root not found');

  async function evaluateInHud(declaration, ...args) {
    const out = await cdp.send('Runtime.callFunctionOn', {
      objectId: rootId, returnByValue: true, arguments: args.map((value) => ({ value })), functionDeclaration: declaration,
    });
    return out.result.value;
  }

  async function click(selector, text) {
    let point = null;
    for (let attempt = 0; attempt < 20 && !point; attempt++) {
      point = await evaluateInHud(`function(sel, text){
          const els = [...this.querySelectorAll(sel)].filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
          const el = text ? els.find((e) => e.textContent.includes(text)) : els[0];
          if (!el) return null; el.scrollIntoView({ block: 'center' }); const r = el.getBoundingClientRect();
          return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }`, selector, text);
      if (!point) await sleep(150);
    }
    assert.ok(point, `nothing to click: ${selector} ${text || ''}`);
    await page.mouse.click(point.x, point.y);
  }

  return { context, page, click, evaluateInHud };
}

async function sqlFrameOf(page) {
  let frame = null;
  await assertEventually(() => {
    frame = page.frames().find((f) => /\/sql\.html$/.test(f.url()));
    return Boolean(frame);
  }, 'the HUD frames sql.html');
  return frame;
}

test('the HUD opens the SQL client in its own window', { timeout: 120_000 }, async (t) => {
  const { context, click, evaluateInHud } = await openHud(t);
  await click('#xray-tab-sql', null);
  assert.equal(await evaluateInHud('function(){ return this.querySelectorAll("iframe").length; }'), 0, 'the setting is off: no frame');
  const opened = context.waitForEvent('page', { timeout: 15_000 });
  await click('button', 'Open SQL client');
  const sqlPage = await opened;
  assert.match(sqlPage.url(), /\/sql\.html$/);
});

// settings.sqlInlineInHud: the HUD frames sql.html (web-accessible only through its dynamic URL)
// instead of opening a window. Opening a database proves the framed extension page still loads its
// bundle, worker and wasm, none of which are web-accessible.
async function assertInlineClientWorks(t, options) {
  const { context, page, click, evaluateInHud } = await openHud(t, { inline: true, ...options });
  const pagesBefore = context.pages().length;
  await click('#xray-tab-sql', null);

  const frame = await sqlFrameOf(page);
  const ancestors = await frame.evaluate(() => [...location.ancestorOrigins]);
  assert.match(ancestors[0], /^http:\/\/127\.0\.0\.1:/, `framed by the web page: ${ancestors}`);
  const box = await evaluateInHud(`function(){ const f = this.querySelector('iframe.xray-sql-frame[title="SQL client"]');
    if (!f) return null; const r = f.getBoundingClientRect(); return { width: r.width, height: r.height }; }`);
  assert.ok(box && box.width > 200 && box.height > 200, `the frame fills the tab: ${JSON.stringify(box)}`);

  await frame.getByRole('button', { name: 'Open SQLite file' }).waitFor();
  // Inside a web page the client offers files only: saved connections open in the XRAY window.
  await frame.getByRole('button', { name: 'Open in window', exact: true }).waitFor();
  assert.equal(await frame.getByRole('button', { name: 'Connect to a database' }).count(), 0, 'no Connect inside the page');
  await frame.locator('input[type="file"]').setInputFiles(shopPath);
  await frame.getByRole('treeitem', { name: 'orders', exact: true }).waitFor();
  assert.equal(context.pages().length, pagesBefore, 'no window opened');

  // Past SQL_FRAME_READY_TIMEOUT_MS: the ready signal arrived through the service worker relay, so the
  // frame was never replaced, and the page's window received nothing from it.
  await sleep(4500);
  const pageMessages = await page.evaluate(() => window.__messages.map((data) => JSON.stringify(data)));
  assert.ok(!pageMessages.some((text) => /sql/i.test(text)), `the page saw no SQL message: ${pageMessages}`);
  assert.equal(await evaluateInHud('function(){ return this.querySelectorAll("iframe.xray-sql-frame").length; }'), 1, 'the frame stays');
  assert.equal(await evaluateInHud('function(){ return this.textContent.includes("This site blocked the embedded client."); }'), false);
  await frame.getByRole('treeitem', { name: 'orders', exact: true }).waitFor({ timeout: 2_000 });
}

test('with the inline option on, the HUD frames the SQL client in the page', { timeout: 120_000 }, async (t) => {
  await assertInlineClientWorks(t);
});

// Chrome exempts extension frames from a page's frame-src (observed on Chromium 151), so a page CSP
// does not trigger the "This site blocked the embedded client." fallback; the unit test in
// test/unit/sqlFrameReady.test.mjs covers the timeout path instead.
// sql.html is web-accessible for the inline option, so with the option off it refuses to run under a
// web page: the HUD's frame, reloaded after the setting is turned off, shows only a notice.
test('with the inline option off, sql.html framed by a web page shows a notice instead of the client', { timeout: 120_000 }, async (t) => {
  const { context, page, click } = await openHud(t, { inline: true });
  await click('#xray-tab-sql', null);
  const frame = await sqlFrameOf(page);
  await frame.getByRole('button', { name: 'Open SQLite file' }).waitFor();
  await context.serviceWorkers()[0].evaluate(() => chrome.storage.local.set({ xray_react_panel_preferences: { settings: { sqlInlineInHud: false, themeRefreshPending: false } } }));
  await frame.evaluate(() => location.reload());
  const reloaded = await sqlFrameOf(page);
  await reloaded.getByText('The SQL client is not enabled for this page.', { exact: true }).waitFor();
  assert.equal(await reloaded.getByRole('button', { name: 'Open SQLite file' }).count(), 0, 'no client');
});

// Ruling M3-R27: with the second opt-in on too, the inline client offers saved connections.
test('with both HUD options on, the inline client offers Connect to a database', { timeout: 120_000 }, async (t) => {
  const { page, click } = await openHud(t, { inline: true, databases: true });
  await click('#xray-tab-sql', null);
  const frame = await sqlFrameOf(page);
  await frame.getByRole('button', { name: 'Connect to a database', exact: true }).waitFor();
  assert.equal(await frame.getByRole('button', { name: 'Open in window', exact: true }).count(), 0);
});

test('a page CSP of frame-src \'none\' does not block the inline client', { timeout: 120_000 }, async (t) => {
  await assertInlineClientWorks(t, { csp: "frame-src 'none'" });
});

test('a 50,000-row, 60-column result renders a bounded window of rows and columns', { timeout: 180_000 }, async (t) => {
  const { page } = await openSqlPage(t);
  await openShop(page);

  const maxRows = page.getByLabel('Max rows');
  await maxRows.fill('50000');
  await maxRows.press('Enter');
  assert.equal(await maxRows.inputValue(), '50000');

  // 60 columns, so the < 40 bound below proves the columns are virtualized (Ruling R17).
  const columns = ['x', ...Array.from({ length: 59 }, (_, i) => `x as c${i + 1}`)].join(', ');
  await runSql(page, `with recursive c(x) as (select 1 union all select x+1 from c where x < 50000) select ${columns} from c`);
  await assertEventually(async () => /^50000 rows/.test((await summary(page).textContent()) ?? ''), 'header reads 50000 rows', 60_000);

  const grid = page.getByRole('grid', { name: 'Query results' });
  const counts = await grid.evaluate((el) => ({
    rows: el.querySelectorAll('[role="row"]').length,
    columns: Math.max(...[...el.querySelectorAll('[role="row"]')].map((row) => row.querySelectorAll('[role="gridcell"], [role="columnheader"]').length)),
  }));
  assert.ok(counts.rows < 200, `row elements in the DOM: ${counts.rows}`);
  assert.ok(counts.columns < 40, `cell columns in the DOM: ${counts.columns}`);

  await grid.evaluate((el) => { el.scrollTop = el.scrollHeight; });
  const last = grid.getByRole('gridcell', { name: '50000', exact: true }).first();
  await last.waitFor();
  assert.equal(await last.isVisible(), true);
});

test('a file that is not a database is refused and the next one still opens', { timeout: 120_000 }, async (t) => {
  const { page } = await openSqlPage(t);

  // A zero-byte file is a valid, empty SQLite database (Task 7: hasSqliteHeader).
  await openFile(page, emptyPath);
  await page.getByText('No tables or views.', { exact: true }).waitFor();

  await openFile(page, notesPath);
  await messages(page).getByText('This file is not a SQLite database.', { exact: false }).waitFor();

  await openShop(page);
  await railItem(page, 'customers').waitFor();
});

test('the first screen welcomes, and the editor/results divider steps with the keyboard and persists', { timeout: 120_000 }, async (t) => {
  const { page } = await openSqlPage(t);
  // Before a file is open: the welcome holds the one open button; the header shows just the brand.
  await page.getByRole('heading', { name: 'Open a database', exact: true }).waitFor();
  await page.getByText('or drop a .sqlite / .db file anywhere on this page', { exact: true }).waitFor();
  await page.getByText('Files open read-only. Nothing leaves your machine.', { exact: true }).waitFor();
  await page.getByText('No database open.', { exact: true }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Open SQLite file' }).count(), 1, 'one open button');
  assert.equal(await page.locator('.xray-sql-toolbar .xray-sql-source').count(), 0, 'no source control yet');
  assert.equal(await runButton(page).count(), 0, 'no Run before a file is open');
  // Ctrl+O opens a file from anywhere (here, the file-input fallback: the picker is removed).
  const chooser = page.waitForEvent('filechooser', { timeout: 5_000 });
  await page.keyboard.press('Control+O');
  await (await chooser).setFiles(shopPath);
  await railItem(page, 'orders').waitFor();
  await page.reload();
  await page.getByRole('button', { name: 'Open SQLite file' }).waitFor();

  await openShop(page);
  await page.getByText('Run a query, or click a table on the left to preview it.', { exact: true }).waitFor();
  await page.locator('.xray-sql-source', { hasText: 'shop.sqlite · SQLite · ' }).waitFor();
  const divider = page.getByRole('separator', { name: 'Resize editor and results', exact: true });
  assert.equal(await divider.getAttribute('aria-orientation'), 'horizontal');
  assert.equal(await divider.getAttribute('aria-valuenow'), '30', 'the editor starts at 30%');
  await divider.focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  const moved = Number(await divider.getAttribute('aria-valuenow'));
  assert.ok(moved > 30 && moved <= 75, `two steps down grow the editor: ${moved}`);
  const rail = page.getByRole('separator', { name: 'Resize schema rail', exact: true });
  assert.equal(await rail.getAttribute('aria-orientation'), 'vertical');
  await rail.focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await rail.getAttribute('aria-valuenow'), '244');
  assert.equal(await rail.getAttribute('aria-valuetext'), '244 pixels');
  await page.keyboard.press('End');
  assert.equal(await rail.getAttribute('aria-valuenow'), '420', 'End jumps to the maximum');
  await page.keyboard.press('Home');
  assert.equal(await rail.getAttribute('aria-valuenow'), '160', 'Home jumps to the minimum');
  await rail.dblclick();
  assert.equal(await rail.getAttribute('aria-valuenow'), '220', 'a double-click restores the default');
  await rail.focus();
  await page.keyboard.press('ArrowRight');

  // Persisted (debounced 300 ms) as sql_layout, and read back before the first render.
  await sleep(700);
  await page.reload();
  await page.getByRole('button', { name: 'Open SQLite file' }).waitFor();
  assert.equal(await rail.getAttribute('aria-valuenow'), '244');
  await openShop(page);
  assert.equal(Number(await divider.getAttribute('aria-valuenow')), moved, 'the editor share survives a reload');
});

test('the grid sizes columns to their content, sorts and filters loaded rows, and inspects a cell', { timeout: 120_000 }, async (t) => {
  const { page } = await openSqlPage(t);
  // Clipboard reads cannot be granted to an extension origin: record what reaches writeText instead,
  // still passing it through to the real clipboard.
  await page.evaluate(() => {
    const write = navigator.clipboard.writeText.bind(navigator.clipboard);
    navigator.clipboard.writeText = (text) => {
      window.__copied = text;
      return write(text);
    };
  });
  await openShop(page);
  await railItem(page, 'orders').click();
  await assertEventually(async () => /^100 rows/.test(await summary(page).textContent()), 'preview header reads 100 rows');
  await page.getByText('Click a cell to inspect it', { exact: true }).waitFor();

  // Typed headers: the declared type under the name, and a key on the preview's primary key.
  const header = (name) => page.getByRole('columnheader', { name: new RegExp(`^(primary key )?${name}\\b`) });
  assert.match(await header('total').textContent(), /^total\s*NUMERIC$/);
  await header('id').getByRole('img', { name: 'primary key', exact: true }).waitFor();
  // Auto widths: the JSON column is wider than the id column.
  const widthOf = async (name) => (await header(name).boundingBox()).width;
  assert.ok((await widthOf('meta')) > (await widthOf('id')), 'meta is wider than id');

  // The header row is one tab stop (APG grid): ArrowUp from the first row enters it, ArrowLeft/Right
  // move along it, Enter sorts, ArrowDown returns to the first row.
  const grid = page.getByRole('grid', { name: 'Query results' });
  assert.equal(await grid.locator('[role="columnheader"][tabindex="0"]').count(), 1, 'one header tab stop');
  assert.equal(await grid.locator('[role="gridcell"][tabindex="0"]').count(), 1, 'one cell tab stop');
  const focused = () => page.evaluate(() => {
    const el = document.activeElement;
    return { role: el.getAttribute('role'), col: el.getAttribute('aria-colindex'), row: el.closest('[role="row"]')?.getAttribute('aria-rowindex') };
  });
  await page.getByRole('gridcell', { name: '1250.5', exact: true }).focus();
  await page.keyboard.press('ArrowUp');
  assert.deepEqual(await focused(), { role: 'columnheader', col: '4', row: '1' });
  await page.keyboard.press('ArrowLeft');
  assert.deepEqual(await focused(), { role: 'columnheader', col: '3', row: '1' });
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  assert.equal(await header('total').getAttribute('aria-sort'), 'ascending', 'Enter on a header sorts');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  assert.equal(await header('total').getAttribute('aria-sort'), 'none');
  await page.keyboard.press('ArrowDown');
  assert.deepEqual(await focused(), { role: 'gridcell', col: '4', row: '2' });

  // Header clicks sort the loaded rows: ascending, then descending.
  const totals = () => page.locator('[role="row"][aria-rowindex="2"] [role="gridcell"][aria-colindex="4"]').textContent();
  await header('total').click();
  assert.equal(await header('total').getAttribute('aria-sort'), 'ascending');
  assert.equal(await totals(), '3');
  await header('total').click();
  assert.equal(await header('total').getAttribute('aria-sort'), 'descending');
  assert.equal(await totals(), '1250.5', 'the first row holds the largest of the 100 loaded totals');

  // Filter rows narrows the loaded rows and the summary says so.
  const filter = page.getByRole('searchbox', { name: 'Filter rows', exact: true });
  await filter.fill('gift');
  await assertEventually(async () => /^1 of 100 rows/.test(await summary(page).textContent()), 'summary reads 1 of 100 rows');
  assert.equal(await page.getByRole('grid', { name: 'Query results' }).getAttribute('aria-rowcount'), '2');
  await filter.fill('');

  // Clicking a cell opens the inspector; Copy value confirms with a toast; Escape closes it.
  await page.getByRole('gridcell', { name: '{"gift":true}', exact: true }).click();
  const inspector = page.getByRole('complementary', { name: 'Cell inspector' });
  await inspector.waitFor();
  assert.equal(await page.getByText('Click a cell to inspect it', { exact: true }).count(), 0, 'the hint goes after the first inspection');
  await inspector.getByRole('button', { name: 'Copy value', exact: true }).click();
  await page.getByRole('status').getByText('Copied the value.', { exact: true }).waitFor();
  assert.equal(await page.evaluate(() => window.__copied), '{\n  "gift": true\n}', 'JSON is copied pretty-printed');
  // The inspector follows its row through a sort, a filter that keeps it, and a tab switch.
  await header('id').click();
  await header('id').click();
  await filter.fill('gift');
  await page.getByRole('tab', { name: 'Messages', exact: true }).click();
  await page.getByRole('tab', { name: 'Results', exact: true }).click();
  await inspector.waitFor({ timeout: 2_000 });
  assert.match(await inspector.textContent(), /^meta row 1 · json/);
  await page.locator('.xray-sql-grid-row.inspected .xray-sql-grid-index').waitFor();
  // A filter that hides its row closes it.
  await filter.fill('no such text');
  await inspector.waitFor({ state: 'detached' });
  // Escape in the filter clears it, and the row comes back with the inspector.
  await filter.press('Escape');
  assert.equal(await filter.inputValue(), '');
  await inspector.waitFor();
  // Escape closes the inspector and returns focus to the active cell (unsorted again: id's third click).
  await header('id').click();
  await page.getByRole('gridcell', { name: '{"gift":true}', exact: true }).click();
  await page.keyboard.press('Escape');
  await inspector.waitFor({ state: 'detached' });
  assert.equal(await page.evaluate(() => document.activeElement.textContent), '{"gift":true}');
  // Enter on a focused cell opens it again.
  await page.keyboard.press('Enter');
  await inspector.waitFor();
  // A blob copies as the cell shows it.
  await page.getByRole('gridcell', { name: /^\\x0000/ }).click();
  await inspector.getByRole('button', { name: 'Copy value', exact: true }).click();
  assert.match(await page.evaluate(() => window.__copied), /^\\x(00)+$/);
  await page.getByRole('status').getByText('1 blob values were truncated to 256 bytes', { exact: true }).waitFor();
});

test('a fresh tab offers quick starts that insert SQL without running it, and the editor marks what runs', { timeout: 120_000 }, async (t) => {
  const { page } = await openSqlPage(t);
  await openShop(page);
  const editor = page.getByLabel('SQL editor');
  await page.locator('.cm-placeholder', { hasText: 'Write SQL here — Ctrl+Enter runs the statement at the cursor, Ctrl+Shift+Enter runs all.' }).waitFor();
  const starters = page.getByRole('group', { name: 'Quick starts', exact: true });
  for (const label of ['List tables', 'Row counts', 'Table columns']) await starters.getByRole('button', { name: label, exact: true }).waitFor();

  await starters.getByRole('button', { name: 'List tables', exact: true }).click();
  assert.equal(await editor.textContent(), "SELECT name, type FROM sqlite_schema WHERE name NOT LIKE 'sqlite_%' ORDER BY name;");
  assert.equal(await editor.evaluate((el) => el === document.activeElement), true, 'the editor has focus');
  await starters.waitFor({ state: 'detached' });
  // Inserted, not run: no result and nothing in History.
  await page.getByText('Run a query, or click a table on the left to preview it.', { exact: true }).waitFor();
  await page.getByRole('tab', { name: 'History', exact: true }).click();
  await page.getByText('Queries you run on shop.sqlite appear here.', { exact: true }).waitFor();
  await page.getByRole('tab', { name: 'Results', exact: true }).click();

  // The statement Ctrl+Enter would run carries a band, and the status bar follows the caret.
  await setSql(page, 'select 1;\nselect 2\n  from orders;');
  assert.equal(await page.locator('.cm-line.xray-sql-active-statement').count(), 2, 'both lines of the statement at the caret');
  await page.locator('.xray-sql-status', { hasText: 'Ln 3, Col 15' }).waitFor();
  await page.keyboard.press('Control+Home');
  assert.equal(await page.locator('.cm-line.xray-sql-active-statement').count(), 1);
  await page.locator('.xray-sql-status', { hasText: 'Ln 1, Col 1' }).waitFor();
});

test('dropping files opens the first through the open path, and the rail filters tables', { timeout: 120_000 }, async (t) => {
  const { page } = await openSqlPage(t);
  await page.getByRole('heading', { name: 'Open a database', exact: true }).waitFor();

  // A drop built in the page from the fixture's bytes, with a second file that is ignored.
  await page.evaluate((bytes) => {
    const dt = new DataTransfer();
    dt.items.add(new File([new Uint8Array(bytes)], 'shop.sqlite', { type: 'application/vnd.sqlite3' }));
    dt.items.add(new File(['not a database'], 'notes.txt', { type: 'text/plain' }));
    window.__drop = dt;
    for (const type of ['dragenter', 'dragover']) {
      document.querySelector('.xray-sql-welcome').dispatchEvent(new DragEvent(type, { dataTransfer: dt, bubbles: true, cancelable: true }));
    }
  }, [...fs.readFileSync(shopPath)]);
  await page.locator('.xray-sql-drop', { hasText: 'Drop to open the SQLite file' }).waitFor();
  await page.evaluate(() => {
    document.querySelector('.xray-sql-welcome').dispatchEvent(new DragEvent('drop', { dataTransfer: window.__drop, bubbles: true, cancelable: true }));
  });
  await page.locator('.xray-sql-drop').waitFor({ state: 'detached' });
  await railItem(page, 'orders').waitFor();

  // A link dropped outside the editor is refused (no navigation); the editor keeps its own text drop.
  const before = page.url();
  const refused = await page.evaluate(() => {
    const dt = new DataTransfer();
    dt.setData('text/uri-list', 'https://example.com/');
    const target = document.querySelector('.xray-sql-rail');
    target.dispatchEvent(new DragEvent('dragover', { dataTransfer: dt, bubbles: true, cancelable: true }));
    const drop = new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true });
    target.dispatchEvent(drop);
    return drop.defaultPrevented;
  });
  assert.equal(refused, true, 'the page refuses a non-file drop outside the editor');
  await sleep(300);
  assert.equal(page.url(), before, 'the URL is unchanged');
  await page.getByRole('tab', { name: 'Messages', exact: true }).click();
  await messages(page).getByText('Only one file opens at a time: opening shop.sqlite, ignored 1 other file: notes.txt.', { exact: true }).waitFor();
  await messages(page).getByText('Opened shop.sqlite (read-only).', { exact: true }).waitFor();

  // "/" focuses the rail filter (outside the editor); typing narrows the tree by name.
  await page.locator('.xray-sql-status').click();
  await page.keyboard.press('/');
  const filter = page.getByRole('searchbox', { name: 'Filter tables', exact: true });
  assert.equal(await filter.evaluate((el) => el === document.activeElement), true, '/ focuses the filter');
  await page.keyboard.type('cust');
  await assertEventually(async () => (await page.getByRole('tree', { name: 'Tables and views' }).getByRole('treeitem').count()) === 1, 'only one tree item left');
  await railItem(page, 'customers').waitFor();
  assert.equal(await railItem(page, 'orders').count(), 0);
  assert.equal(await railItem(page, 'big_orders').count(), 0);
  // In the editor, "/" is just a character.
  await page.getByLabel('SQL editor').click();
  await page.keyboard.press('/');
  assert.equal(await page.getByLabel('SQL editor').textContent(), '/');
  // The editor keeps CodeMirror's own text drop.
  await setSql(page, '');
  const editorDrop = await page.evaluate(() => {
    const dt = new DataTransfer();
    dt.setData('text/plain', 'select 42');
    const content = document.querySelector('.cm-content');
    const box = content.getBoundingClientRect();
    const init = { dataTransfer: dt, bubbles: true, cancelable: true, clientX: box.left + 20, clientY: box.top + 8 };
    content.dispatchEvent(new DragEvent('dragover', init));
    content.dispatchEvent(new DragEvent('drop', init));
    return content.textContent;
  });
  assert.equal(editorDrop, 'select 42', 'CodeMirror inserts dropped text');
});

// Recent files need a real FileSystemFileHandle. The origin-private file system hands out real ones
// without a picker, so the picker is stubbed to return an OPFS handle to the fixture's bytes.
test('the welcome screen lists picker-opened files and reopens them, or explains and removes a missing one', { timeout: 120_000 }, async (t) => {
  const { context, extensionId } = await launch(t);
  const page = await context.newPage();
  await page.addInitScript(() => {
    window.showOpenFilePicker = async () => {
      const root = await navigator.storage.getDirectory();
      return [await root.getFileHandle('shop.sqlite')];
    };
  });
  await page.goto(`chrome-extension://${extensionId}/sql.html`);
  await page.getByRole('button', { name: 'Open SQLite file' }).waitFor();
  assert.equal(await page.getByRole('heading', { name: 'Recent', exact: true }).count(), 0, 'no list while it is empty');
  await page.evaluate(async (bytes) => {
    const root = await navigator.storage.getDirectory();
    const writable = await (await root.getFileHandle('shop.sqlite', { create: true })).createWritable();
    await writable.write(new Uint8Array(bytes));
    await writable.close();
  }, [...fs.readFileSync(shopPath)]);

  await page.getByRole('button', { name: 'Open SQLite file' }).click();
  await railItem(page, 'orders').waitFor();
  await sleep(300);
  await page.reload();
  const recent = page.getByRole('region', { name: 'Recent' });
  const item = recent.getByRole('button', { name: /^shop\.sqlite/ });
  await item.waitFor();
  assert.match(await item.textContent(), /^shop\.sqlite\d+ KB · Today \d\d:\d\d$/);
  await item.click();
  await railItem(page, 'orders').waitFor();

  // The file is gone: a short inline error, and Remove takes it off the list.
  await page.reload();
  await page.evaluate(async () => (await navigator.storage.getDirectory()).removeEntry('shop.sqlite'));
  await item.click();
  await recent.getByRole('alert').getByText('This file is no longer there.', { exact: true }).waitFor();
  await recent.getByRole('button', { name: 'Remove shop.sqlite from recent files', exact: true }).click();
  await recent.waitFor({ state: 'detached' });
  await page.reload();
  await page.getByRole('button', { name: 'Open SQLite file' }).waitFor();
  await sleep(300);
  assert.equal(await page.getByRole('heading', { name: 'Recent', exact: true }).count(), 0, 'removed for good');
});

// ---------------------------------------------------------------- Postgres/MySQL (Task 9)
// A temp copy of the extension with nativeMessaging granted, and a profile whose NativeMessagingHosts
// folder registers test/fixtures/fake-helper.mjs (unless `helper` is false: "helper missing"). The
// real service worker and connection manager run against the fake.
// The fake helper appends each request to `helperLog` as JSON, a connect's password redacted to
// "<redacted:N>"; helperRequests() reads it back.
async function openRemotePage(t, { helper = true } = {}) {
  const ext = extensionCopyWithNativeMessaging();
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xray-e2e-sql-remote-'));
  const helperLog = path.join(userDataDir, 'fake-helper.log');
  if (helper) registerNativeHost(userDataDir);
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: true,
    channel: 'chromium',
    viewport: { width: 1280, height: 900 },
    args: [`--disable-extensions-except=${ext}`, `--load-extension=${ext}`, '--no-sandbox'],
    // Chrome starts the native host with its own environment.
    env: { ...process.env, FAKE_HELPER_LOG: helperLog },
  });
  t.after(async () => {
    await context.close();
    fs.rmSync(userDataDir, { recursive: true, force: true });
    fs.rmSync(ext, { recursive: true, force: true });
  });
  const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker', { timeout: 30_000 }));
  const extensionId = new URL(worker.url()).host;
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/sql.html`);
  await page.getByRole('button', { name: 'Connect to a database', exact: true }).waitFor();
  const readHelperLog = () => (fs.existsSync(helperLog) ? fs.readFileSync(helperLog, 'utf8') : '');
  const helperRequests = () =>
    readHelperLog()
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  return { context, page, worker, readHelperLog, helperRequests };
}

// The worker's stored profiles and session-only secrets.
const storedSql = (worker) =>
  worker.evaluate(async () => ({
    local: (await chrome.storage.local.get('sql_connections')).sql_connections ?? null,
    session: (await chrome.storage.session.get('sql_session_secrets')).sql_session_secrets ?? null,
  }));

const SUPABASE = 'postgresql://postgres.abcdefgh:s3cret%21@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require';
const LINUX_INSTALL = ['curl -fsSL https://raw.githubusercontent.com/rahuldr07/xray-extension/main/helper/install/install.sh', 'bash'].join(' | ');

async function openConnectionDialog(page) {
  await page.getByRole('button', { name: 'Connect to a database', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'New connection', exact: true });
  await dialog.waitFor();
  return dialog;
}

// Fills the dialog by pasting a connection string, then names the connection.
async function fillConnection(dialog, { url, name, savePassword = true }) {
  await dialog.getByLabel('Connection string', { exact: true }).fill(url);
  await dialog.getByLabel('Name', { exact: true }).fill(name);
  const save = dialog.getByRole('checkbox', { name: 'Save password', exact: true });
  if ((await save.isChecked()) !== savePassword) await save.click();
}

test('the connection dialog fills its fields from a pasted connection string and tests it', { timeout: 120_000 }, async (t) => {
  const { page, worker, readHelperLog, helperRequests } = await openRemotePage(t);
  const before = await storedSql(worker);
  const dialog = await openConnectionDialog(page);
  const box = dialog.getByLabel('Connection string', { exact: true });
  await box.fill('redis://localhost');
  await dialog.getByText('Use a postgres:// or mysql:// connection string.', { exact: true }).waitFor();

  await box.fill(SUPABASE);
  assert.equal(await dialog.getByText('Use a postgres:// or mysql:// connection string.').count(), 0, 'the error clears');
  // The string (and the password in it) leaves the box once it has filled the fields.
  await dialog.getByText('Filled in the fields below.', { exact: true }).waitFor();
  assert.equal(await box.inputValue(), '', 'the paste box is cleared');
  assert.equal(await dialog.getByRole('radio', { name: 'PostgreSQL', exact: true }).isChecked(), true);
  assert.equal(await dialog.getByLabel('Host', { exact: true }).inputValue(), 'aws-0-us-east-1.pooler.supabase.com');
  assert.equal(await dialog.getByLabel('Port', { exact: true }).inputValue(), '6543');
  assert.equal(await dialog.getByLabel('Database', { exact: true }).inputValue(), 'postgres');
  assert.equal(await dialog.getByLabel('User', { exact: true }).inputValue(), 'postgres.abcdefgh');
  assert.equal(await dialog.getByLabel('Password', { exact: true }).inputValue(), 's3cret!');
  assert.equal(await dialog.getByLabel('Name', { exact: true }).inputValue(), 'postgres@aws-0-us-east-1.pooler.supabase.com');
  assert.equal(await dialog.getByRole('radio', { name: 'Require', exact: true }).isChecked(), true);
  // TLS can be turned off only for a server on this computer.
  assert.equal(await dialog.getByRole('radio', { name: 'Disable', exact: true }).isDisabled(), true);
  await dialog
    .getByText('This server is not on this computer, so XRAY requires TLS. Choose Require or Verify full.', { exact: true })
    .waitFor();
  assert.equal(await dialog.getByRole('switch', { name: 'Read-only', exact: true }).isChecked(), true);
  assert.equal(await dialog.getByRole('checkbox', { name: 'Save password', exact: true }).isChecked(), true);
  assert.equal(await dialog.getByLabel('CA file path', { exact: true }).count(), 0, 'CA file only for Verify full');
  await dialog.getByRole('radio', { name: 'Verify full', exact: true }).check();
  await dialog.getByLabel('CA file path', { exact: true }).waitFor();

  await dialog.getByRole('button', { name: 'Test connection', exact: true }).click();
  await dialog.getByRole('status').getByText('Connected — PostgreSQL 16.4', { exact: true }).waitFor();
  await dialog.getByLabel('Password', { exact: true }).fill('wrong');
  await dialog.getByRole('button', { name: 'Test connection', exact: true }).click();
  await dialog.getByText('Password authentication failed for user "postgres".', { exact: true }).waitFor();

  // A Test stores nothing: no profile, no secret.
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await dialog.waitFor({ state: 'detached' });
  assert.deepEqual(await storedSql(worker), before, 'sql_connections and sql_session_secrets are unchanged');
  // The helper saw a read-only connect and an immediate close for each Test. The password went only
  // inside connect (logged redacted, by length), and nowhere else.
  const requests = helperRequests().filter((r) => r.op !== 'hello');
  assert.deepEqual(
    requests.map((r) => [r.op, r.password, r.readOnly]),
    [
      ['connect', '<redacted:7>', true],
      ['close', undefined, undefined],
      ['connect', '<redacted:5>', true],
    ],
  );
  assert.equal(requests[0].host, 'aws-0-us-east-1.pooler.supabase.com');
  assert.doesNotMatch(readHelperLog(), /s3cret|wrong/);
  await page.reload();
  await page.getByRole('button', { name: 'Connect to a database', exact: true }).waitFor();
  await sleep(500);
  assert.equal(await page.getByRole('region', { name: 'Saved connections' }).count(), 0, 'nothing was saved');
});

test('without the helper, the welcome screen and the dialog show the install card', { timeout: 120_000 }, async (t) => {
  const { page } = await openRemotePage(t, { helper: false });
  const card = page.getByRole('region', { name: 'Install the XRAY database helper', exact: true });
  // Nothing asks for the helper until someone wants a connection: no saved ones, no dialog yet.
  await sleep(500);
  assert.equal(await card.count(), 0, 'no status check on a bare welcome screen');
  const first = await openConnectionDialog(page);
  await first.getByRole('region', { name: 'Install the XRAY database helper', exact: true }).waitFor();
  await first.getByRole('button', { name: 'Cancel', exact: true }).click();
  await card.waitFor();
  await card
    .getByText('Postgres and MySQL need a small helper app on this computer. Run this once in a terminal, then click Retry.', { exact: true })
    .waitFor();
  assert.equal(await card.locator('code').textContent(), LINUX_INSTALL);
  assert.equal(
    await card.getByRole('link', { name: 'What does it install?', exact: true }).getAttribute('href'),
    'https://github.com/rahuldr07/xray-extension/tree/main/helper#readme',
  );
  await card.getByRole('button', { name: 'Copy', exact: true }).waitFor();
  await card.getByRole('button', { name: 'Retry', exact: true }).click();
  await card.waitFor();

  const dialog = await openConnectionDialog(page);
  const inDialog = dialog.getByRole('region', { name: 'Install the XRAY database helper', exact: true });
  await inDialog.waitFor();
  assert.equal(await inDialog.locator('code').textContent(), LINUX_INSTALL);
});

test('a saved connection connects, lists in the source menu and on the welcome screen, and Fetch more appends rows', { timeout: 180_000 }, async (t) => {
  const { page } = await openRemotePage(t);
  const dialog = await openConnectionDialog(page);
  await fillConnection(dialog, { url: 'postgres://app:pw@db.example.com:5432/shop', name: 'Shop PG' });
  await dialog.getByRole('button', { name: 'Save & connect', exact: true }).click();
  await dialog.waitFor({ state: 'detached' });
  await page.locator('.xray-sql-source', { hasText: 'Shop PG · PostgreSQL 16.4 · db.example.com' }).waitFor();
  await railItem(page, 'orders').waitFor();

  // 25 rows behind a 10-row limit: Fetch more pulls the rest through the open cursor.
  const maxRows = page.getByRole('spinbutton');
  await maxRows.fill('10');
  await maxRows.press('Enter');
  await runSql(page, 'select * from public.orders');
  await assertEventually(async () => /^10 rows/.test((await summary(page).textContent()) ?? ''), 'first page of 10 rows');
  assert.doesNotMatch((await summary(page).textContent()) ?? '', /Run with higher limit/);
  const fetchMore = page.getByRole('button', { name: 'Fetch more', exact: true });
  await fetchMore.waitFor();
  // The cursor belongs to the tab that ran the query: another tab shows no Fetch more.
  await page.getByRole('button', { name: 'New query tab', exact: true }).click();
  assert.equal(await fetchMore.count(), 0, 'no Fetch more on another tab');
  await page.getByRole('tab', { name: 'Query 1', exact: true }).click();
  await fetchMore.click();
  await assertEventually(async () => /^25 rows/.test((await summary(page).textContent()) ?? ''), 'all 25 rows after Fetch more');
  await fetchMore.waitFor({ state: 'detached' });
  await page.getByRole('gridcell', { name: 'customer 25', exact: true }).waitFor();

  // The source menu: files, then connections.
  await page.locator('.xray-sql-source').click();
  const menu = page.getByRole('dialog', { name: 'Databases', exact: true });
  await menu.getByRole('group', { name: 'Files', exact: true }).getByRole('button', { name: 'Open SQLite file' }).waitFor();
  const conns = menu.getByRole('group', { name: 'Connections', exact: true });
  await conns.getByRole('button', { name: /^Shop PG/ }).waitFor();
  await conns.getByRole('button', { name: 'New connection…', exact: true }).waitFor();
  await page.keyboard.press('Escape');

  // The helper dies: the banner offers Reconnect, which starts it again.
  await runSql(page, 'select pg_crash_helper() from orders');
  const banner = page.getByRole('alert').filter({ hasText: 'Connection lost.' });
  await banner.waitFor();
  await banner.getByRole('button', { name: 'Reconnect', exact: true }).click();
  await banner.waitFor({ state: 'detached' });
  await runSql(page, 'select * from public.orders');
  await assertEventually(async () => /^10 rows/.test((await summary(page).textContent()) ?? ''), 'queries run after Reconnect');

  await page.reload();
  const saved = page.getByRole('region', { name: 'Saved connections', exact: true });
  const item = saved.getByRole('button', { name: /^Shop PG/ });
  await item.waitFor();
  assert.match(await item.textContent(), /PostgreSQL.*db\.example\.com/);
  await item.click();
  await railItem(page, 'orders').waitFor();
});

test('a connection without a saved password asks for it, and can be deleted from the source menu', { timeout: 120_000 }, async (t) => {
  const { page } = await openRemotePage(t);
  const dialog = await openConnectionDialog(page);
  await fillConnection(dialog, { url: 'postgres://app@db.example.com/shop', name: 'No secret' });
  await dialog.getByRole('button', { name: 'Save & connect', exact: true }).click();
  const prompt = page.getByRole('dialog', { name: 'Password for No secret', exact: true });
  await prompt.waitFor();
  assert.equal(await prompt.getByRole('checkbox', { name: 'Remember on this computer', exact: true }).isChecked(), false);
  await prompt.getByLabel('Password', { exact: true }).fill('typed');
  await prompt.getByRole('button', { name: 'Connect', exact: true }).click();
  await prompt.waitFor({ state: 'detached' });
  await page.locator('.xray-sql-source', { hasText: 'No secret · PostgreSQL 16.4 · db.example.com' }).waitFor();

  await page.locator('.xray-sql-source').click();
  const menu = page.getByRole('dialog', { name: 'Databases', exact: true });
  await menu.getByRole('button', { name: 'More actions for No secret', exact: true }).click();
  await menu.getByRole('menuitem', { name: 'Delete', exact: true }).click();
  const confirm = page.getByRole('dialog', { name: 'Delete No secret?', exact: true });
  await confirm.getByRole('button', { name: 'Delete', exact: true }).click();
  await confirm.waitFor({ state: 'detached' });
  await page.locator('.xray-sql-source').click();
  const after = page.getByRole('dialog', { name: 'Databases', exact: true }).getByRole('group', { name: 'Connections', exact: true });
  await after.getByRole('button', { name: 'New connection…', exact: true }).waitFor();
  assert.equal(await after.getByRole('button', { name: /^No secret/ }).count(), 0, 'the profile is gone');
});

// Ruling M3-R24: a saved password is bound to its server (engine, host, port, user).
test('editing a saved connection to point at another server never sends it the saved password', { timeout: 120_000 }, async (t) => {
  const { page, helperRequests } = await openRemotePage(t);
  const create = await openConnectionDialog(page);
  await fillConnection(create, { url: 'postgres://postgres:savedpw@db.example.com:5432/shop', name: 'Shop' });
  await create.getByRole('button', { name: 'Save & connect', exact: true }).click();
  await page.locator('.xray-sql-source', { hasText: 'Shop · PostgreSQL 16.4 · db.example.com' }).waitFor();

  const openEdit = async () => {
    await page.locator('.xray-sql-source').click();
    const menu = page.getByRole('dialog', { name: 'Databases', exact: true });
    await menu.getByRole('button', { name: 'More actions for Shop', exact: true }).click();
    await menu.getByRole('menuitem', { name: 'Edit', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Edit connection', exact: true });
    await dialog.waitFor();
    return dialog;
  };

  // Unchanged server: Test uses the saved password.
  let edit = await openEdit();
  assert.equal(await edit.getByLabel('Host', { exact: true }).inputValue(), 'db.example.com');
  assert.equal(await edit.getByLabel('Password', { exact: true }).getAttribute('placeholder'), 'Saved — type to replace');
  await edit.getByRole('button', { name: 'Test connection', exact: true }).click();
  await edit.getByRole('status').getByText('Connected — PostgreSQL 16.4', { exact: true }).waitFor();

  // Another host, no password typed: refused before anything reaches the helper.
  const connectsBefore = helperRequests().filter((r) => r.op === 'connect').length;
  await edit.getByLabel('Connection string', { exact: true }).fill('postgres://postgres@other.example:5432/db');
  assert.equal(await edit.getByLabel('Host', { exact: true }).inputValue(), 'other.example');
  await edit.getByRole('button', { name: 'Test connection', exact: true }).click();
  await edit.getByRole('status').getByText(/^Enter the password for /).waitFor();
  assert.equal(helperRequests().filter((r) => r.op === 'connect').length, connectsBefore, 'the cross-host Test sent no connect');

  // Save & connect drops the saved password with the server change, so it asks for one.
  await edit.getByRole('button', { name: 'Save & connect', exact: true }).click();
  const prompt = page.getByRole('dialog', { name: /^Password for / });
  await prompt.waitFor();
  await prompt.getByRole('button', { name: 'Cancel', exact: true }).click();
  const toOther = helperRequests().filter((r) => r.op === 'connect' && r.host === 'other.example');
  assert.deepEqual(toOther, [], 'other.example never received a connect');
  assert.ok(helperRequests().every((r) => r.op !== 'connect' || r.host === 'db.example.com'));
});

async function assertEventually(check, label, timeout = 15_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await check()) return;
    await sleep(100);
  }
  assert.fail(`timed out: ${label}`);
}

test('an open transaction asks before Read-only switches sessions, and before the page closes', { timeout: 120_000 }, async (t) => {
  const { page } = await openRemotePage(t);
  const dialog = await openConnectionDialog(page);
  await fillConnection(dialog, { url: 'postgres://app:pw@db.example.com:5432/shop', name: 'Shop PG' });
  await dialog.getByRole('button', { name: 'Save & connect', exact: true }).click();
  await dialog.waitFor({ state: 'detached' });
  await railItem(page, 'orders').waitFor();
  await runSql(page, 'begin');
  await assertEventually(async () => /rows affected/.test((await summary(page).textContent()) ?? ''), 'BEGIN ran');

  await page.getByRole('switch', { name: 'Read-only', exact: true }).click();
  const prompt = page.getByRole('dialog', { name: 'Discard the open transaction?', exact: true });
  await prompt.getByText('Its changes will be rolled back.', { exact: true }).waitFor();
  await prompt.getByRole('button', { name: 'Cancel', exact: true }).click();
  await prompt.waitFor({ state: 'detached' });

  // Closing the page asks too (the browser's own leave-page dialog).
  const asked = new Promise((resolve) => page.once('dialog', async (d) => { resolve(d.type()); await d.dismiss(); }));
  await page.close({ runBeforeUnload: true });
  assert.equal(await asked, 'beforeunload');
  assert.equal(page.isClosed(), false, 'dismissing the dialog keeps the page');

  // After COMMIT nothing is open: the switch reconnects without asking.
  await runSql(page, 'commit');
  await assertEventually(async () => /rows affected/.test((await summary(page).textContent()) ?? ''), 'COMMIT ran');
  const toggle = page.getByRole('switch', { name: 'Read-only', exact: true });
  await toggle.click();
  await assertEventually(async () => !(await toggle.isChecked()), 'Read-only off after COMMIT');
  assert.equal(await prompt.count(), 0, 'no prompt without an open transaction');
});
