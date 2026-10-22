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
  await page.getByLabel('Read-only').uncheck();
  await assertEventually(async () => !(await page.getByLabel('Read-only').isChecked()) && (await runButton(page).isEnabled()), 'connection reopened read-write');
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
  await page.locator('.xray-sql-connection-meta', { hasText: 'unsaved changes' }).waitFor({ timeout: 2_000 });
});

test('a write on a read-only connection is refused with a message', { timeout: 120_000 }, async (t) => {
  const { page } = await openSqlPage(t);
  await openShop(page);
  assert.equal(await page.getByLabel('Read-only').isChecked(), true, 'read-only is on by default');

  await runSql(page, 'update orders set total = 0');
  await messages(page).getByText('This connection is read-only', { exact: false }).waitFor();
});

test('DROP asks for confirmation and Cancel leaves the table in place', { timeout: 120_000 }, async (t) => {
  const { page } = await openSqlPage(t);
  await openShop(page);
  await page.getByLabel('Read-only').uncheck();
  await assertEventually(async () => !(await page.getByLabel('Read-only').isChecked()) && (await runButton(page).isEnabled()), 'connection reopened read-write');

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
  assert.equal(await frame.getByRole('button', { name: 'Open SQLite file' }).isEnabled(), true);
});

// Opens the in-page HUD on a fixture page and returns a clicker that reaches into its closed shadow
// root. `inline` writes settings.sqlInlineInHud through the storage the panel reads before the page
// loads; `csp` serves the fixture with that Content-Security-Policy header.
async function openHud(t, { inline = false, csp = null } = {}) {
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
    await worker.evaluate(() => chrome.storage.local.set({ xray_react_panel_preferences: { settings: { sqlInlineInHud: true, themeRefreshPending: false } } }));
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

async function assertEventually(check, label, timeout = 15_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await check()) return;
    await sleep(100);
  }
  assert.fail(`timed out: ${label}`);
}
