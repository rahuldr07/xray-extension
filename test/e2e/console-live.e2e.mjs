/* global chrome, _detachDebuggerNow */
// Console round 2, Task 7 (spec §3 source 4, §4 session policy): live page completion through the
// REAL extension — the unpacked build, its closed-shadow HUD and chrome.debugger — on a real page.
// `appState.` lists the page's members, `formatP` offers the page function with its own parameter
// list, a declared array's lambda parameter lists its item keys, and a hostile page (a window
// getter with a side effect, a Proxy global) shows its names without anything running. The
// setting "Preview results while typing" off sends nothing and never attaches; on, typing attaches
// only after 2 characters and a pause — never on focus alone. The closed shadow root is reached
// through CDP (DOM.getDocument pierce), as test/e2e/console-scope.e2e.mjs does.

import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const USERS = { users: [{ id: 1, name: 'Ada' }, { id: 2, name: 'Linus' }, { id: 3, name: 'Grace' }] };
const PAGE = `<!doctype html><html><head><title>Console live fixture</title></head><body><h1>Live</h1>
<script>
localStorage.clear();
var appState = { user: { id: 1, name: 'Ada' }, count: 2 };
var slowVal = 5;
const lexState = { inner: 1 };
var acc = {}; Object.defineProperty(acc, 'z', { get() { localStorage.setItem('getterRan', '1'); return {}; } });
// A page global that is a native (bound) function: listed, so Enter on it runs it (fix round 2).
window.big = document.querySelector.bind(document);
function formatPrice(cents, currency = 'EUR') { return (cents / 100).toFixed(2) + ' ' + currency; }
Object.defineProperty(window, 'trap', { get() { localStorage.setItem('x', '1'); return 1; }, configurable: true });
window.prox = new Proxy({ a: 1 }, {
  get(t, k) { localStorage.setItem('proxy', String(k)); return t[k]; },
  ownKeys(t) { localStorage.setItem('proxy', 'ownKeys'); return Reflect.ownKeys(t); },
  getOwnPropertyDescriptor(t, k) { localStorage.setItem('proxy', 'gopd'); return Reflect.getOwnPropertyDescriptor(t, k); },
  getPrototypeOf(t) { localStorage.setItem('proxy', 'getPrototypeOf'); return Object.prototype; },
});
fetch('/api/users').then((r) => r.json());
fetch('/api/items').then((r) => r.json());
</script></body></html>`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function openConsole(t, pagePath = '/') {
  const server = http.createServer((req, res) => {
    if (req.url.startsWith('/api/items')) {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ items: [1, 2] }));
      return;
    }
    if (req.url.startsWith('/api/users')) {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(USERS));
      return;
    }
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end(PAGE);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xray-e2e-live-'));
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: true, channel: 'chromium', viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce',
    args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`, '--no-sandbox'],
  });
  t.after(async () => {
    await context.close();
    server.close();
    fs.rmSync(userDataDir, { recursive: true, force: true });
  });
  const page = context.pages()[0] || await context.newPage();
  const cdp = await context.newCDPSession(page);
  let rootId = null;

  async function resolveRoot() {
    for (let attempt = 0; attempt < 40; attempt++) {
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
        if (ok.result.value) { rootId = object.objectId; return; }
      }
      await sleep(250);
    }
    throw new Error('XRAY shadow root not found');
  }

  // Runs `body` with `this` = the HUD's closed shadow root.
  async function inPanel(body, ...args) {
    const call = () => cdp.send('Runtime.callFunctionOn', {
      objectId: rootId, functionDeclaration: `function(...args){ ${body} }`,
      arguments: args.map((value) => ({ value })), returnByValue: true, awaitPromise: true,
    });
    let out;
    try { out = await call(); } catch { await resolveRoot(); out = await call(); }
    if (out.exceptionDetails) throw new Error(JSON.stringify(out.exceptionDetails).slice(0, 400));
    return out.result.value;
  }
  async function click(selector, text) {
    const point = await inPanel(`const [sel, text] = args;
      const els = [...this.querySelectorAll(sel)].filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
      const el = text ? els.find((e) => e.textContent.includes(text) || e.getAttribute('aria-label') === text) : els[0];
      if (!el) return null; el.scrollIntoView({ block: 'center' }); const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };`, selector, text || null);
    assert.ok(point, `nothing to click: ${selector} ${text || ''}`);
    await page.mouse.click(point.x, point.y);
    await sleep(150);
  }
  const cellCount = () => inPanel('return this.querySelectorAll(".xray-command-cell").length');
  // Runs `code` from the prompt and answers the new cell's text and its notes.
  async function run(code, waitMs = 8000) {
    const before = await cellCount();
    await click('[aria-label="Console command"]');
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.insertText(code);
    await sleep(150);
    if (await inPanel('return !!this.querySelector(".xray-editor-suggestions")')) { await page.keyboard.press('Escape'); await sleep(80); }
    await page.keyboard.press('Enter');
    const deadline = Date.now() + waitMs;
    while (Date.now() < deadline) {
      const cell = await inPanel(`const cells = this.querySelectorAll('.xray-command-cell'); const c = cells[cells.length - 1];
        if (!(cells.length > ${before} && !!c && !c.classList.contains('is-running') && !!c.querySelector('.xray-cell-time'))) return null;
        return { text: c.textContent.replace(/\\s+/g, ' '), error: c.classList.contains('is-error'), notes: [...c.querySelectorAll('.xray-cell-note')].map((n) => n.textContent) };`);
      if (cell) return cell;
      await sleep(100);
    }
    throw new Error(`no result for ${code}`);
  }
  // Opens the HUD on the page, selects the captured /api/users request (it becomes `res`) and
  // switches to the Console.
  async function openHud() {
    await sleep(1200);
    await page.keyboard.press('Control+Shift+X');
    await resolveRoot();
    await sleep(800);
    if (await inPanel('return !!this.querySelector("button.xray-firstrun-dismiss")')) await click('button.xray-firstrun-dismiss');
    await click('#xray-tab-api');
    for (let attempt = 0; attempt < 20 && !(await inPanel('return [...this.querySelectorAll(\'[role="option"]\')].some((el) => el.textContent.includes("/api/users"))')); attempt++) await sleep(250);
    await click('[role="option"]', '/api/users');
    await click('#xray-tab-console');
    await sleep(400);
  }

  const url = `http://127.0.0.1:${server.address().port}${pagePath}`;
  await page.goto(url);
  await openHud();
  const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker', { timeout: 30_000 }));
  // Counts the background's live-completion calls (the message handler calls the global by name).
  await worker.evaluate(() => {
    self.__completions = [];
    const original = self._completeConsoleInTab;
    self._completeConsoleInTab = (...args) => { self.__completions.push(args[1]); return original(...args); };
    // chrome.debugger.getTargets counts Playwright's own CDP session too: count XRAY's attaches.
    // Task 8: the eager previews the panel asked for (the handler calls the global by name); a
    // draft naming slowVal answers 700 ms late (out-of-order answers).
    self.__previews = [];
    const preview = self._previewConsoleInTab;
    self._previewConsoleInTab = async (...args) => {
      self.__previews.push(args[1]);
      const out = await preview(...args);
      if (/slowVal \* 2$/.test(args[1])) await new Promise((resolve) => setTimeout(resolve, 700));
      return out;
    };
    self.__attaches = 0;
    const attach = chrome.debugger.attach.bind(chrome.debugger);
    chrome.debugger.attach = (...args) => { self.__attaches++; return attach(...args); };
  });
  const completions = () => worker.evaluate(() => self.__completions.slice());
  const previews = () => worker.evaluate(() => self.__previews.slice());
  const attached = () => worker.evaluate(() => self.__attaches > 0);
  // Types into the prompt key by key (each key an input event, as the user types).
  async function type(text, { clear = true } = {}) {
    await click('[aria-label="Console command"]');
    if (clear) {
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
    }
    await page.keyboard.type(text, { delay: 15 });
  }
  const options = () => inPanel(`return [...this.querySelectorAll('.xray-editor-option')].map((o) => ({
    label: o.querySelector('.xray-editor-option-label')?.textContent || '',
    params: o.querySelector('.xray-editor-option-params')?.textContent || '',
    detail: o.querySelector('.xray-editor-option-detail')?.textContent || '' }))`);
  // Waits until an option labelled `label` shows; answers the ms it took from now.
  async function waitFor(label, ms = 4000) {
    const started = Date.now();
    while (Date.now() - started < ms) {
      if ((await options()).some((o) => o.label === label)) return Date.now() - started;
      await sleep(15);
    }
    throw new Error(`no option ${label}: ${JSON.stringify(await options())}`);
  }
  const draft = () => inPanel('return this.querySelector(\'[aria-label="Console command"]\').value');
  const panelBroken = () => inPanel('return !!this.querySelector(".xray-root-fallback")');
  // The idle detach, now (background.js _detachDebuggerNow).
  const detach = () => worker.evaluate(async (target) => { const id = (await chrome.tabs.query({})).find((tab) => tab.url === target)?.id; _detachDebuggerNow(id); }, url);
  // The line under the prompt: { kind, main, text } or null.
  const hint = () => inPanel(`const h = this.querySelector('.xray-editor-hint'); return h ? { kind: h.className.replace('xray-editor-hint', '').trim(), main: h.querySelector('.xray-editor-hint-main')?.textContent || '', text: h.textContent } : null`);
  // Waits until the hint's main text is `want`; answers the ms it took from now.
  async function waitHint(want, ms = 3000) {
    const started = Date.now();
    let last = null;
    while (Date.now() - started < ms) {
      last = await hint();
      if (last && (typeof want === 'string' ? last.main === want : want.test(last.main))) return Date.now() - started;
      await sleep(10);
    }
    throw new Error(`no hint ${want}: ${JSON.stringify(last)}`);
  }
  return { page, run, openHud, click, inPanel, type, options, waitFor, draft, completions, previews, attached, panelBroken, detach, hint, waitHint };
}


test('live completion: page members, page functions with their parameters, declared item keys, a hostile page', { timeout: 150_000 }, async (t) => {
  const { page, run, type, options, waitFor, draft, panelBroken, inPanel } = await openConsole(t);

  // appState. lists the page's own members (cold: this request attaches the debugger).
  await type('appState.');
  const cold = await waitFor('user');
  assert.ok((await options()).some((o) => o.label === 'count'));
  // Warm: the session and the scope exist.
  await type('appState.user.');
  const warm = await waitFor('name');
  assert.ok(warm <= 1000, `live merge took ${warm} ms`);

  // formatP → formatPrice with the parameter list from its source.
  await type('formatP');
  await waitFor('formatPrice');
  const fp = (await options()).find((o) => o.label === 'formatPrice');
  assert.equal(fp.params, "(cents, currency = 'EUR')");

  // A page `const` is a global too (not a property of window).
  await type('lexSt');
  await waitFor('lexState');
  await type('lexState.');
  await waitFor('inner');

  // A declared array: its lambda parameter lists the item keys.
  const declared = await run('const rows = res.users');
  assert.equal(declared.error, false, declared.text);
  await type('rows.filter(r => r.');
  await waitFor('name');
  assert.ok((await options()).some((o) => o.label === 'id'));

  // Hostile page: the window getter is listed and never runs; the Proxy's traps never run.
  await type('tra');
  await waitFor('trap');
  await type('prox.');
  await sleep(600);
  await type('prox');
  await sleep(400);
  assert.deepEqual(await page.evaluate(() => [localStorage.getItem('x'), localStorage.getItem('proxy')]), [null, null]);
  assert.equal(await panelBroken(), false);

  // Enter on a catalogue name once the page globals are known: `fet` is no page global → fetch(.
  await type('fet');
  await waitFor('fetch');
  await sleep(250);
  await page.keyboard.press('Enter');
  await sleep(150);
  assert.equal(await draft(), 'fetch(');

  // A bound-native page global is a known global: `big` + Enter runs it, never `BigInt(`.
  const bound = await run('typeof big');
  assert.match(bound.text, /function/);
  await type('big');
  await sleep(400);
  await page.keyboard.press('Enter');
  await sleep(600);
  assert.equal(await draft(), '', 'Enter ran `big` (the draft was sent), it did not accept a catalogue guess');

  // A path that stops at a getter: one quiet row, announced, and Escape dismisses it (round 4).
  await type('acc.z.');
  let note = '';
  for (let i = 0; i < 60 && !note; i++) { note = await inPanel('return this.querySelector(".xray-editor-suggestions-empty")?.textContent || ""'); if (!note) await sleep(25); }
  assert.equal(note, 'getter — not evaluated');
  assert.equal(await inPanel('return this.querySelector(".xray-editor-live").textContent'), 'getter — not evaluated');
  await page.keyboard.press('Escape');
  await sleep(100);
  assert.equal(await inPanel('return !!this.querySelector(".xray-editor-suggestions-empty")'), false, 'Escape dismissed it');
  assert.equal(await page.evaluate(() => localStorage.getItem('getterRan')), null);

  // Did-you-mean offers the page global.
  const typo = await run('apState.user');
  assert.equal(typo.error, true);
  assert.match(typo.text, /Did you mean `appState`\?/);
  t.diagnostic(`live merge latency: cold (attach + scope) ${cold} ms, warm ${warm} ms`);
});

test('"Preview results while typing" off: no completion request and no attach while typing', { timeout: 120_000 }, async (t) => {
  const { type, click, completions, previews, attached, inPanel, hint } = await openConsole(t);
  await click('[aria-label="Open settings"]');
  await click('.xray-settings-nav-item', 'General');
  assert.equal(await inPanel('return this.querySelector(\'[aria-label="Preview results while typing"]\')?.getAttribute("aria-pressed")'), 'true', 'on by default');
  await click('[aria-label="Preview results while typing"]');
  assert.equal(await inPanel('return this.querySelector(\'[aria-label="Preview results while typing"]\')?.getAttribute("aria-pressed")'), 'false');
  await click('[aria-label="Close Settings"]');
  await type('appState.');
  await sleep(500);
  await type('formatP');
  await sleep(500);
  // Task 8: no eager preview either.
  await type('1+1');
  await sleep(500);
  assert.deepEqual(await completions(), []);
  assert.deepEqual(await previews(), []);
  assert.equal(await hint(), null);
  assert.equal(await attached(), false);
});

test('typing attaches only after 2 characters and a 150 ms pause — never on focus alone', { timeout: 120_000 }, async (t) => {
  const { page, type, click, completions, attached, detach, waitFor } = await openConsole(t);
  await click('[aria-label="Console command"]');
  await sleep(600);
  assert.equal(await attached(), false, 'focus alone');
  await type('a');
  await sleep(600);
  assert.equal(await attached(), false, 'one character');
  assert.deepEqual(await completions(), []);
  await page.keyboard.type('p');
  await sleep(100);
  assert.equal(await attached(), false, 'before the pause');
  await sleep(700);
  assert.equal(await attached(), true, 'two characters and a pause');
  assert.deepEqual(await completions(), [null], 'one request: the page globals');
  // An idle detach since: the next pause asks again and may attach again (no silent miss).
  await detach();
  await type('appState.');
  await waitFor('user');
});

// Task 8 (spec §4): eager preview through the REAL extension. A complete expression shows its value
// grey under the prompt before Enter — evaluated side-effect-free in the page, projected by XRAY's
// own code in the page and read by value; a side effect shows nothing and never happens; a throw
// shows a faint `Uncaught …`; an incomplete draft shows nothing; a stale answer never replaces a
// newer draft's; plain paths into captured data still answer locally.
test('eager preview: values before Enter, nothing for a side effect or an incomplete draft, a faint Uncaught for a throw', { timeout: 150_000 }, async (t) => {
  const { page, type, hint, waitHint, previews, panelBroken, run, click } = await openConsole(t);
  const latency = [];
  // Cold: this preview attaches the debugger and creates the scope.
  await type('1+1');
  latency.push(['cold 1+1', await waitHint('→ 2')]);
  // Fix round 1 (ruling option C): typing never sends the context. A draft naming `res` previews
  // nothing until a Run has revived `res` for this selection.
  await type('res.users.length * 2');
  await sleep(700);
  assert.equal(await hint(), null, 'no Run yet: no preview of res');
  await run('res.users.length');
  await type('res.users.length * 2');
  latency.push(['res.users.length * 2', await waitHint('→ 6')]);
  await type('res.users.map(u => u.id)');
  latency.push(['res.users.map(u => u.id)', await waitHint('→ Array(3) [1, 2, 3]')]);
  for (const [draft, want] of [['appState.count * 10', '→ 20'], ['formatPrice(250)', "→ '2.50 EUR'"], ['appState.user', "→ {id: 1, name: 'Ada'}"]]) {
    await type(draft);
    latency.push([draft, await waitHint(want)]);
  }
  // A side effect: nothing shows, and nothing was written.
  await type("localStorage.setItem('a','b')");
  await sleep(800);
  assert.equal(await hint(), null);
  assert.equal(await page.evaluate(() => localStorage.getItem('a')), null);
  // A name still being typed, with the suggestion list open: no `Uncaught ReferenceError` under it.
  await type('formatP');
  await sleep(700);
  assert.equal(await hint(), null, 'nothing while the list is open');
  // A throw: a faint Uncaught line.
  await type('null.x');
  await waitHint(/^Uncaught TypeError: Cannot read properties of null/);
  assert.equal((await hint()).kind, 'thrown');
  // Incomplete: nothing (and never asked).
  const before = (await previews()).length;
  await type('res.users.');
  await sleep(600);
  assert.equal((await hint())?.main ?? null, null);
  assert.equal((await previews()).length, before, 'an incomplete draft is never sent');
  // A plain path into captured data answers locally, without the page.
  await type('res.users[0].name');
  // Final review M-2: drawn by previewLine, like the Run's result (single quotes).
  await waitHint("→ 'Ada'");
  assert.match((await hint()).text, /from captured data/);
  assert.equal((await previews()).includes('res.users[0].name'), false);
  // Out of order: the older draft's late answer never replaces the newer one's.
  await type('slowVal * 2');
  await sleep(300);
  await page.keyboard.type(' + 1', { delay: 15 });
  await waitHint('→ 11');
  await sleep(900);
  assert.equal((await hint()).main, '→ 11', 'the late answer for `slowVal * 2` was dropped');
  // The Run itself still works after previews.
  const ran = await run('res.users.length');
  assert.match(ran.text, /3/);
  // Another selection: the scope still holds the old `res` — no stale preview.
  await click('#xray-tab-api');
  await click('[role="option"]', '/api/items');
  await click('#xray-tab-console');
  await type('res.users.length * 2');
  await sleep(700);
  assert.equal(await hint(), null, 'a changed selection: no stale preview');
  await run('res.items.length');
  await type('res.items.length * 2');
  await waitHint('→ 4');
  assert.equal(await panelBroken(), false);
  for (const [label, ms] of latency) t.diagnostic(`preview after the last key: ${label} ${ms} ms`);
  // Spec §4: visible ≤ 450 ms after the last key (150 ms pause + the page's answer).
  for (const [label, ms] of latency) assert.ok(ms <= 450, `${label}: ${ms} ms`);
});
