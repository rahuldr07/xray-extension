/* global _debuggerCommand */
// Console round 2, Task 6 (spec §2): declarations persist, through the REAL extension — the
// unpacked build, its closed-shadow HUD and the chrome.debugger path — on a real page. A command's
// top-level `const`/`let`/`function`/`class` live on a scope object CDP holds for the tab, so a
// later command reads them, `const` stays read-only, the page's own scripts never see them, and a
// reload replaces the scope with one quiet note. The closed shadow root is reached through CDP
// (DOM.getDocument pierce), as test/e2e/console-output.e2e.mjs does.

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
const PAGE = `<!doctype html><html><head><title>Console scope fixture</title></head><body><h1>Scope</h1>
<script>
window.pageSees = (name) => { try { return (0, eval)('typeof ' + name); } catch (err) { return 'error: ' + err.name; } };
fetch('/api/users').then((r) => r.json());
</script></body></html>`;
// Task 6 review (Critical 1): the page installs its probes at load, before XRAY creates anything:
// a prepareStackTrace that walks every frame (getThis, getFunction, .arguments, .caller), and
// wrapped JSON.parse / Object.defineProperty. Nothing it sees may hold the scope or a value only
// the scope holds (SECRET-LOCAL is built by a command, never by the page).
const LEAK_PAGE = `<!doctype html><html><head><title>Console leak probe</title></head><body><h1>Probe</h1>
<script>
window.stolen = [];
const look = (how, value) => {
  if (value == null || value === window) return;
  let text = '';
  try { text = typeof value === 'function' ? Function.prototype.toString.call(value) : JSON.stringify(value, (k, x) => (typeof x === 'bigint' ? String(x) : x)) || ''; } catch {}
  try { if (typeof value === 'object' && ('open' in value || 'refresh' in value || '__xrayScope' in value)) text += ' [scope]'; } catch {}
  if (/SECRET-LOCAL|__xray|\\[scope\\]/.test(text)) window.stolen.push(how + ': ' + text.slice(0, 120));
};
Error.prepareStackTrace = (error, sites) => {
  for (const site of sites) {
    let self; let fn;
    try { self = site.getThis(); } catch {}
    try { fn = site.getFunction(); } catch {}
    look('this', self); look('function', fn);
    if (typeof fn === 'function') { try { look('arguments', [...fn.arguments]); } catch {} try { look('caller', fn.caller); } catch {} }
  }
  return String(error && error.message);
};
const parse = JSON.parse; JSON.parse = function (t, r) { look('JSON.parse', String(t)); return parse(t, r); };
const define = Object.defineProperty; Object.defineProperty = function (o, k, d) { look('defineProperty', d && d.value); return define(o, k, d); };
window.pageFn = function pageFn(x) { void new Error('p').stack; try { look('caller', pageFn.caller); } catch {} return x + 1; };
window.appState = { get probe() { void new Error('g').stack; return 2; } };
fetch('/api/users').then((r) => r.json());
</script></body></html>`;
const RESET_NOTE = 'Declared variables were reset (page reloaded or debugger detached)';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function openConsole(t, pagePath = '/') {
  const server = http.createServer((req, res) => {
    if (req.url.startsWith('/api/users')) {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(USERS));
      return;
    }
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end(req.url.startsWith('/leak') ? LEAK_PAGE : PAGE);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xray-e2e-scope-'));
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

  await page.goto(`http://127.0.0.1:${server.address().port}${pagePath}`);
  await openHud();
  // Task 7 round 3: the worker, armed, makes the page's main thread busy for 12 s right before it
  // sends the next Run — deterministic, as a page task that starts just before the Run arrives.
  const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker', { timeout: 30_000 }));
  const armBusy = () => worker.evaluate(() => {
    const original = self._evaluateConsoleInTab;
    self._evaluateConsoleInTab = async (tabId, ...rest) => {
      self._evaluateConsoleInTab = original;
      _debuggerCommand({ tabId }, 'Runtime.evaluate', { expression: 'window.busyStarted = Date.now(); { const t0 = performance.now(); while (performance.now() - t0 < 12000) {} }', silent: true }).catch(() => {});
      await new Promise((resolve) => setTimeout(resolve, 50));
      return original(tabId, ...rest);
    };
  });
  return { page, run, openHud, click, armBusy };
}

test('declarations persist through the real debugger; the page never sees them; a reload resets them once', { timeout: 120_000 }, async (t) => {
  const { page, run, openHud } = await openConsole(t);

  // const u = res.users, then u.length → 3.
  const declared = await run('const u = res.users');
  assert.equal(declared.error, false, declared.text);
  const length = await run('u.length');
  assert.equal(length.error, false, length.text);
  assert.match(length.text, /→\s*3(?!\d)/, length.text);
  assert.deepEqual(length.notes, [], 'no reset note on a live scope');

  // A function declared in one command is callable from the next.
  await run('function names(list) { return list.map((x) => x.name).join(",") }');
  assert.match((await run('names(u)')).text, /Ada,Linus,Grace/);

  // const stays read-only in a later command.
  await run('const n = 1');
  const write = await run('n = 2');
  assert.equal(write.error, true, write.text);
  assert.match(write.text, /Assignment to constant variable\./);
  assert.match((await run('n')).text, /→\s*1(?!\d)/);

  // The page's own scripts never see a scope name, and nothing was written to window.
  assert.deepEqual(await page.evaluate(() => [window.pageSees('u'), window.pageSees('n'), window.pageSees('names'), 'u' in window, 'res' in window]),
    ['undefined', 'undefined', 'undefined', false, false]);

  // Reload: the next command runs normally and its cell carries the reset note — once.
  await page.reload();
  await openHud();
  const after = await run('typeof u');
  assert.equal(after.error, false, after.text);
  assert.match(after.text, /undefined/);
  assert.deepEqual(after.notes, [RESET_NOTE]);
  const next = await run('res.users.length');
  assert.match(next.text, /→\s*3(?!\d)/, next.text);
  assert.deepEqual(next.notes, [], 'the note shows once');
});

// Issue #15: one expression whose `;` or newlines sit inside brackets/braces, or whose lines
// continue a chain, is still one expression — the cell shows its value, not `undefined`.
test('a single expression with ; or newlines inside brackets, or a multi-line chain, shows its value (issue #15)', { timeout: 120_000 }, async (t) => {
  const { run } = await openConsole(t);
  const cases = [
    ['res.users.map(x => { const y = x.id; return y })', /Array\(3\)|\[\s*0\s*:\s*1/],
    ['(() => { const f = new FormData(); f.append("name", "Ada"); return f; })()', /FormData\(1\)/],
    ['({ a: 1,\n  b: 2 })', /a\s*:\s*1[\s\S]*b\s*:\s*2/],
    ['res.users\n  .map((u) => u.name)\n  .join(",")', /"Ada,Linus,Grace"/],
  ];
  for (const [code, want] of cases) {
    const cell = await run(code);
    assert.equal(cell.error, false, `${code}: ${cell.text}`);
    assert.doesNotMatch(cell.text, /→\s*undefined/, `${code}: ${cell.text}`);
    assert.match(cell.text, want, `${code}: ${cell.text}`);
  }
});

test('a page that walks stack frames and wraps JSON.parse/defineProperty never reaches the scope', { timeout: 120_000 }, async (t) => {
  const { page, run } = await openConsole(t, '/leak');
  const thrown = await run("const secretLocal = ['SECRET', 'LOCAL'].join('-'); nope");
  assert.equal(thrown.error, true, thrown.text);
  await run('const n = 1');
  assert.match((await run('n = 2')).text, /Assignment to constant variable\./);
  assert.match((await run('secretLocal.length + pageFn(1) + res.users.length')).text, /→\s*17(?!\d)/);
  assert.match((await run('appState.probe')).text, /→\s*2(?!\d)/);
  assert.deepEqual(await page.evaluate(() => window.stolen), []);
});

test('a Run the page is too busy to start within 10 s is not run, and says so; a looping command still times out', { timeout: 150_000 }, async (t) => {
  const { page, run, armBusy } = await openConsole(t);
  assert.match((await run('1 + 1')).text, /→\s*2/);
  await armBusy();
  const busy = await run('window.ran = 1', 30000);
  assert.equal(busy.error, true, busy.text);
  assert.match(busy.text, /Not run: the page was busy for more than 10 s/);
  assert.doesNotMatch(busy.text, /Execution timeout/);
  await sleep(1500);
  assert.equal(await page.evaluate(() => window.ran), undefined, 'the command never ran later');
  const loop = await run('while (true) {}', 30000);
  assert.match(loop.text, /Execution timeout \(10s\)/);
});
