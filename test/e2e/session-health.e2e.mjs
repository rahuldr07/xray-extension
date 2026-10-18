import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { before, after } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { PANEL_CSS } from '../helpers/panel-css.mjs';
import { setStandardsContent } from '../helpers/standards-page.mjs';

const { outputFiles } = await build({
  stdin: {
    resolveDir: fileURLToPath(new URL('../../', import.meta.url)), loader: 'jsx',
    contents: `
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      import { flushSync } from 'react-dom';
      import { PanelShell } from './src/panel/components/shell/PanelShell';
      import { SettingsModal } from './src/panel/components/settings/SettingsModal';
      import { usePanelStore } from './src/panel/store';
      const writes = [], errors = [], healthHistory = [];
      window.addEventListener('unhandledrejection', event => { errors.push(String(event.reason)); event.preventDefault(); });
      window.sessionTest = {
         async setup({ shadow, css, stored, missingStore, missingRoute, failWrite, failRead, missingWorker, holdSessionWrites }) {
           this.stored = stored;
           this.sessionWriteStarts = 0;
           this.sessionWriteActive = 0;
           this.sessionWriteMaxActive = 0;
           this.releaseSessionWrite = null;
           if (!missingRoute) window.__XRAY_bridgeToken = 'synthetic-token';
           if (!missingStore) window.XRAY_Store = {
            async get(key) {
              if (failRead) throw new Error('synthetic secret query=credential');
              return stored[key] ?? null;
             },
             async set(key, value) {
               if (failWrite && (key === 'session_envelope' || failWrite === 'all')) throw new Error('synthetic secret query=credential');
               if (holdSessionWrites && key === 'session_envelope') {
                 window.sessionTest.sessionWriteStarts += 1;
                 const firstNonEmpty = holdSessionWrites === 'first' && value.entries?.length && window.sessionTest.sessionWriteStarts === 1;
                 if (holdSessionWrites === 'first' && value.entries?.length && !firstNonEmpty) throw new Error('synthetic later snapshot failure');
                 if (holdSessionWrites === true || firstNonEmpty) {
                   window.sessionTest.sessionWriteActive += 1;
                   window.sessionTest.sessionWriteMaxActive = Math.max(window.sessionTest.sessionWriteMaxActive, window.sessionTest.sessionWriteActive);
                   await new Promise(resolve => { window.sessionTest.releaseSessionWrite = resolve; });
                   window.sessionTest.sessionWriteActive -= 1;
                 }
               }
               const copy = structuredClone(value); writes.push({ key, value: copy }); stored[key] = copy;
             },
          };
          let workerListener;
          if (!missingWorker) window.XRAY_Worker = {
            isReady: () => true,
            getHealth: () => ({ state: 'healthy', lastEventAt: 123, lastErrorCode: null }),
            onHealth: listener => { workerListener = listener; return () => { workerListener = null; }; },
          };
          this.workerHealth = receipt => workerListener?.(receipt);
          const unsubscribe = usePanelStore.subscribe(s => healthHistory.push(s.runtimeHealth.health));
          await usePanelStore.getState().restorePreferences();
          unsubscribe();
          usePanelStore.setState({ open: true, devtoolsMode: true });
          const host = document.body.appendChild(document.createElement('div'));
          this.root = shadow ? host.attachShadow({ mode: 'closed' }) : document;
          const style = document.createElement('style'); style.textContent = css;
          (shadow ? this.root : document.head).appendChild(style);
          const mount = shadow ? this.root.appendChild(document.createElement('div')) : host;
          flushSync(() => createRoot(mount).render(<><PanelShell mode="devtools"><div>Fixture workspace</div></PanelShell><SettingsModal /></>));
        },
        action(name, ...args) { return flushSync(() => usePanelStore.getState()[name](...args)); },
        async watchRestore() {
          const unsubscribe = usePanelStore.subscribe(s => window.transientHealth.push(s.runtimeHealth.health));
          try { await usePanelStore.getState().restorePreferences(); } finally { unsubscribe(); }
        },
        click(label) {
          const button = [...this.root.querySelectorAll('button')].find(el => el.getAttribute('aria-label') === label || el.textContent.trim() === label);
          if (!button) throw new Error('No button: ' + label);
          button.click();
        },
         snapshot() {
          const s = usePanelStore.getState();
          return { session: s.session, health: s.runtimeHealth, entries: s.entries, pins: [...s.pinnedIds], selected: s.selectedId,
            writes, errors, healthHistory, toast: s.toastMessage, text: (this.root === document ? document.body : this.root).textContent,
            diagnostic: this.root.querySelector('[aria-label="Runtime diagnostics"]')?.title,
             restartDisabled: this.root.querySelector('[aria-label="Restart runtime worker"]')?.disabled,
             sessionWriteStarts: this.sessionWriteStarts,
             sessionWriteActive: this.sessionWriteActive,
             sessionWriteMaxActive: this.sessionWriteMaxActive };
        },
        notice() {
          const nodes = [...this.root.querySelectorAll('.xray-save-notice')];
          const box = nodes[0]?.getBoundingClientRect();
          return { count: nodes.length, text: nodes[0]?.textContent ?? null, role: nodes[0]?.closest('[role]')?.getAttribute('role') ?? null,
            visible: !!box && box.width > 0 && box.height > 0, workspace: (this.root === document ? document.body : this.root).textContent.includes('Fixture workspace') };
        },
      };
    `,
  }, bundle: true, format: 'iife', write: false,
});

let browser;
before(async () => {
  const executablePath = process.env.XRAY_BROWSER_EXECUTABLE || (!existsSync(chromium.executablePath()) && existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined);
  browser = await chromium.launch({ executablePath, headless: true });
});
after(async () => { await browser?.close(); });
const css = PANEL_CSS;
const entry = id => ({ id, type: 'api', timestamp: 1700000000000, method: 'GET', url: 'https://synthetic.test/api', urlPath: '/api', status: 200, responseRaw: '{}' });
async function fixture(t, options = {}) {
  const page = await browser.newPage({ viewport: { width: options.width || 960, height: 800 } });
  t.after(() => page.close());
  await setStandardsContent(page, '<title>Synthetic session fixture</title>');
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(options => window.sessionTest.setup(options), { css, stored: {}, ...options });
  return page;
}
const snapshot = page => page.evaluate(() => window.sessionTest.snapshot());
const action = (page, name, ...args) => page.evaluate(({ name, args }) => window.sessionTest.action(name, ...args), { name, args });
const click = (page, label) => page.evaluate(label => window.sessionTest.click(label), label);
const sessionWrites = state => state.writes.filter(write => write.key === 'session_envelope');

test('legacy entries migrate once and debounced writes contain one bounded envelope', async t => {
  const page = await fixture(t, { stored: { session_entries: [entry('legacy')], react_panel_preferences: { pinnedIds: ['legacy'] } } });
  let state = await snapshot(page);
  assert.equal(state.session?.entryCount, 1, 'legacy traffic has a session summary');
  assert.deepEqual(state.pins, ['legacy']);
  const id = state.session.sessionId;
  await action(page, 'selectEntry', 'legacy');
  await action(page, 'addEntries', [entry('new'), entry('new')]);
  await action(page, 'updateEntry', { id: 'new', status: 201 });
  await page.waitForTimeout(100);
  assert.equal(sessionWrites(await snapshot(page)).length, 0, 'no eager traffic snapshot writes');
  await page.waitForTimeout(4050);
  state = await snapshot(page);
  assert.equal(sessionWrites(state).length, 1);
  const persisted = sessionWrites(state)[0].value;
  assert.equal(persisted.schemaVersion, 2);
  assert.equal(persisted.sessionId, id);
  assert.deepEqual(persisted.entries.map(item => item.id), ['legacy', 'new']);
  assert.equal(persisted.entries[1].status, 201);
  assert.equal(state.selected, 'legacy');
  assert.deepEqual(state.pins, ['legacy']);
  assert.ok(state.writes.every(write => write.key !== 'session_entries'), 'legacy key is read-only');
  await page.evaluate(() => window.sessionTest.stored.session_entries.push({ id: 'stale', type: 'api' }));
  await action(page, 'restorePreferences');
  assert.equal((await snapshot(page)).session.sessionId, id, 'current envelope wins on repeated restore');
  assert.equal((await snapshot(page)).entries.length, 2);
});

test('capture and worker health changes keep request context and omit raw diagnostic input', async t => {
  const page = await fixture(t);
  await action(page, 'addEntry', entry('keep'));
  await action(page, 'togglePinned', 'keep');
  await action(page, 'selectEntry', 'keep');
  await action(page, 'noteRuntimeDrop', 'invalid-entry', 2);
  await action(page, 'noteRuntimeEvent', { workerState: 'degraded', lastErrorCode: 'raw https://secret.test/?key=credential', payload: 'PRIVATE_PAYLOAD' });
  let state = await snapshot(page);
  assert.equal(state.health?.acceptedCount, 1);
  assert.equal(state.health.droppedCount, 2);
  assert.equal(state.health.workerState, 'degraded');
  assert.equal(state.health.health, 'degraded');
  assert.equal(state.selected, 'keep');
  assert.deepEqual(state.pins, ['keep']);
  assert.doesNotMatch(JSON.stringify(state.session.runtime), /credential|PRIVATE_PAYLOAD|secret.test/);
  await action(page, 'addEntry', entry('after-drop'));
  assert.equal((await snapshot(page)).health.droppedCount, 2);
  await page.evaluate(() => window.sessionTest.workerHealth({ state: 'healthy', lastEventAt: 200, lastErrorCode: null }));
  state = await snapshot(page);
  assert.equal(state.health.workerState, 'healthy');
  assert.equal(state.health.health, 'healthy');
  assert.equal(state.selected, 'keep');
});

test('worker origin and policy denial codes remain visible as sanitized diagnostics', async t => {
  const page = await fixture(t);
  for (const code of ['worker-origin-unavailable', 'worker-policy-blocked', 'worker-startup-timeout']) {
    await page.evaluate(code => window.sessionTest.workerHealth({ state: 'unavailable', lastErrorCode: code }), code);
    const state = await snapshot(page);
    assert.equal(state.health.workerState, 'unavailable');
    assert.equal(state.health.lastErrorCode, code);
    assert.notEqual(state.health.health, 'healthy');
  }
});

for (const shadow of [false, true]) {
  test(`compact diagnostics disclose unavailable route/storage and unsupported restart (${shadow ? 'closed shadow' : 'document'})`, async t => {
    const page = await fixture(t, { shadow, width: 360, missingStore: true, missingRoute: true });
    const state = await snapshot(page);
    assert.equal(state.health?.captureRouteState, 'unavailable');
    assert.notEqual(state.health.health, 'healthy');
    assert.match(state.diagnostic || '', /unavailable|degraded/);
    await click(page, 'Runtime diagnostics');
    await page.waitForTimeout(50);
    const opened = await snapshot(page);
    assert.match(opened.text, /Storage unavailable/);
    assert.match(opened.text, /Capture route.*unavailable/);
    assert.equal(opened.restartDisabled, true);
    await action(page, 'restartRuntime');
    assert.match((await snapshot(page)).toast, /unavailable|unsupported/i);
    assert.equal(sessionWrites(await snapshot(page)).length, 0);
  });
}

test('clearEntries compatibility resets the envelope immediately and cancels queued patches/writes', async t => {
  const page = await fixture(t);
  await action(page, 'addEntry', entry('clear'));
  await action(page, 'togglePinned', 'clear');
  await action(page, 'selectEntry', 'clear');
  const before = await snapshot(page);
  await action(page, 'updateEntry', { id: 'clear', responseRaw: 'late-body' });
  await action(page, 'clearEntries');
  await page.waitForTimeout(4100);
  const state = await snapshot(page);
  assert.equal(state.entries.length, 0);
  assert.equal(state.selected, null);
  assert.deepEqual(state.pins, []);
  assert.notEqual(state.session?.sessionId, before.session?.sessionId);
  assert.equal(state.health?.acceptedCount, 0);
  assert.equal(state.health.droppedCount, 0);
  assert.equal(sessionWrites(state).length, 1, 'clear cancels the pending persistence write');
  assert.deepEqual(sessionWrites(state)[0].value.entries, []);
  assert.deepEqual(state.errors, []);
});

test('storage rejection leaves live traffic intact with a secret-free degraded receipt', async t => {
  const page = await fixture(t, { failWrite: true });
  await action(page, 'addEntry', entry('unsaved'));
  await page.waitForTimeout(4100);
  const state = await snapshot(page);
  assert.equal(state.entries.length, 1);
  assert.equal(state.health?.health, 'degraded');
  assert.equal(state.health.lastErrorCode, 'storage-write-failed');
  assert.doesNotMatch(JSON.stringify(state.session.runtime), /credential|synthetic secret/);
  assert.deepEqual(state.errors, []);
});

// Spec J9: a failed session write is said in the panel, once per failure streak, as well as in the
// diagnostics receipt; a successful save ends the streak.
for (const shadow of [false, true]) {
  test(`a failed session save shows one notice per failure streak (${shadow ? 'closed shadow' : 'document'})`, async t => {
    const page = await fixture(t, { shadow, failWrite: true });
    const notice = () => page.evaluate(() => window.sessionTest.notice());
    const storeWrites = (mode) => page.evaluate(mode => {
      window.XRAY_Store.set = mode === 'ok'
        ? async (key, value) => { window.sessionTest.stored[key] = structuredClone(value); }
        : async () => { throw Object.assign(new Error('storage-write-failed'), { code: 'storage-write-failed', reason: 'quota' }); };
    }, mode);
    await action(page, 'addEntry', entry('unsaved'));
    assert.equal((await notice()).count, 0, 'nothing is said before a write fails');
    await page.waitForTimeout(4100);
    let shown = await notice();
    assert.equal(shown.count, 1);
    assert.ok(shown.visible);
    assert.equal(shown.role, 'alert');
    assert.equal(shown.text.replace('Dismiss', '').trim(), "Couldn't save the session — the browser refused the write.");
    assert.ok(shown.workspace, 'non-blocking: the panel body is still there');
    assert.equal((await snapshot(page)).health.lastErrorCode, 'storage-write-failed', 'the diagnostics receipt stays');
    assert.doesNotMatch(shown.text, /credential|synthetic secret/);
    await click(page, 'Dismiss save notice');
    assert.equal((await notice()).count, 0);
    await action(page, 'clearSession');
    await page.waitForTimeout(100);
    assert.equal((await notice()).count, 0, 'the same streak does not raise it again');
    await storeWrites('ok');
    await action(page, 'clearSession');
    await page.waitForTimeout(100);
    await storeWrites('quota');
    await action(page, 'clearSession');
    await page.waitForTimeout(100);
    shown = await notice();
    assert.equal(shown.count, 1, 'a new streak raises it again');
    assert.equal(shown.text.replace('Dismiss', '').trim(), "Couldn't save the session — the browser's storage for XRAY is full.");
    await storeWrites('ok');
    await action(page, 'clearSession');
    await page.waitForTimeout(100);
    assert.equal((await notice()).count, 0, 'a successful save ends the streak and the notice');
    assert.deepEqual((await snapshot(page)).errors, []);
  });
}

test('failed initial storage read still initializes runtime receipts and accepts traffic', async t => {
  const page = await fixture(t, { failRead: true });
  await action(page, 'addEntry', entry('read-failed-live'));
  const state = await snapshot(page);
  assert.equal(state.health.lastErrorCode, 'storage-read-failed');
  assert.equal(state.health.health, 'degraded');
  assert.equal(state.health.workerState, 'healthy');
  assert.equal(state.entries[0].id, 'read-failed-live');
  assert.deepEqual(state.errors, []);
  assert.doesNotMatch(JSON.stringify(state.session.runtime), /credential|synthetic secret/);
});

test('clear invalidates a pending restore including stale pins and buffered traffic', async t => {
  const page = await fixture(t);
  await page.evaluate(old => {
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    window.XRAY_Store.get = async key => {
      await gate;
      return key === 'session_envelope' ? { entries: [old] }
        : key === 'react_panel_preferences' ? { pinnedIds: [old.id] } : null;
    };
    window.restoreTask = window.sessionTest.action('restorePreferences');
    window.releaseRestore = release;
  }, entry('old'));
  await action(page, 'clearSession');
  const clearedId = (await snapshot(page)).session.sessionId;
  await page.evaluate(async () => { window.releaseRestore(); await window.restoreTask; });
  const state = await snapshot(page);
  assert.deepEqual(state.entries, []);
  assert.deepEqual(state.pins, []);
  assert.equal(state.selected, null);
  assert.equal(state.session.sessionId, clearedId);
});

test('clear tombstones legacy traffic even when the empty envelope cannot be written', async t => {
  const page = await fixture(t, { failWrite: true, stored: { session_entries: [entry('legacy-clear')] } });
  await action(page, 'clearSession');
  await page.waitForTimeout(50);
  const stored = await page.evaluate(() => window.sessionTest.stored);
  assert.deepEqual(stored.session_entries, []);
  const reload = await fixture(t, { stored });
  assert.deepEqual((await snapshot(reload)).entries, []);
  assert.equal((await snapshot(page)).health.lastErrorCode, 'storage-write-failed');
});

test('clear catches preference and tombstone write failures without leaking rejections', async t => {
  const page = await fixture(t, { failWrite: 'all' });
  await action(page, 'addEntry', entry('unsaved-clear'));
  await action(page, 'clearSession');
  await page.waitForTimeout(100);
  const state = await snapshot(page);
  assert.deepEqual(state.entries, []);
  assert.equal(state.health.lastErrorCode, 'storage-write-failed');
  assert.deepEqual(state.errors, []);
});

test('a successful later snapshot clears the failed-write health without a diagnostic retry loop', async t => {
  const page = await fixture(t, { failWrite: true });
  await action(page, 'clearSession');
  await page.waitForTimeout(50);
  assert.equal((await snapshot(page)).health.lastErrorCode, 'storage-write-failed');
  await page.evaluate(() => {
    window.XRAY_Store.set = async (key, value) => { window.sessionTest.stored[key] = structuredClone(value); };
  });
  await action(page, 'addEntry', entry('saved-after-failure'));
  await page.waitForTimeout(4100);
  const state = await snapshot(page);
  assert.equal(state.health.health, 'healthy');
  assert.equal(state.health.lastErrorCode, null);
  assert.deepEqual(state.errors, []);
  assert.equal(await page.evaluate(() => window.sessionTest.stored.session_envelope.entries[0].id), 'saved-after-failure');
});

test('restored healthy receipts never claim readiness before live runtime evidence', async t => {
  const page = await fixture(t, { stored: { session_envelope: { entries: [entry('historical')], runtime: {
    health: 'healthy', captureRouteState: 'healthy', workerState: 'healthy', acceptedCount: 7,
  } } }, missingWorker: true });
  await page.evaluate(() => {
    window.transientHealth = [];
    window.XRAY_Worker = undefined;
  });
  // A subscriber sees each intermediate commit, including restoration before the live receipt.
  await page.evaluate(async () => {
    // The fixture exposes the store observer without reaching into Zustand's implementation.
    await window.sessionTest.watchRestore();
  });
  const state = await snapshot(page);
  assert.equal(state.health.workerState, 'unavailable');
  assert.equal(state.health.captureRouteState, 'unknown');
  assert.equal(state.health.acceptedCount, 7);
  assert.ok(state.healthHistory.every(health => health !== 'healthy'));
  assert.ok((await page.evaluate(() => window.transientHealth)).every(health => health !== 'healthy'));
});

test('an in-flight snapshot finishes before the clear snapshot so reload stays empty', async t => {
  const page = await fixture(t);
  await page.evaluate(() => {
    const original = window.XRAY_Store.set;
    window.XRAY_Store.set = async (key, value) => {
      if (key === 'session_envelope' && value.entries.length) {
        await new Promise(resolve => { window.finishOldWrite = resolve; });
      }
      return original(key, value);
    };
  });
  await action(page, 'addEntry', entry('in-flight-old'));
  await page.waitForFunction(() => typeof window.finishOldWrite === 'function', { timeout: 6000 });
  await action(page, 'clearSession');
  await page.evaluate(() => window.finishOldWrite());
  await page.waitForTimeout(100);
  const stored = await page.evaluate(() => window.sessionTest.stored);
  assert.deepEqual(stored.session_envelope.entries, []);
  const reload = await fixture(t, { stored });
  assert.deepEqual((await snapshot(reload)).entries, []);
});

test('latest-only persistence keeps one pending snapshot and clear replaces it with an empty barrier', async t => {
  const page = await fixture(t, { holdSessionWrites: true });
  await action(page, 'addEntry', entry('held-old'));
  await page.waitForFunction(() => window.sessionTest.snapshot().sessionWriteStarts === 1, { timeout: 6000 });

  for (let i = 0; i < 20; i += 1) await action(page, 'addEntry', entry(`pending-${i}`));
  await page.waitForTimeout(4100);
  let state = await snapshot(page);
  assert.equal(state.sessionWriteActive, 1);
  assert.equal(state.sessionWriteMaxActive, 1);
  assert.equal(state.sessionWriteStarts, 1, 'writes after the active snapshot coalesce into one pending generation');

  await action(page, 'clearSession');
  await page.evaluate(() => window.sessionTest.releaseSessionWrite?.());
  await page.waitForFunction(() => window.sessionTest.snapshot().sessionWriteStarts === 2, { timeout: 2000 });
  state = await snapshot(page);
  assert.equal(state.sessionWriteMaxActive, 1);
  assert.equal(state.sessionWriteActive, 1);
  await page.evaluate(() => window.sessionTest.releaseSessionWrite?.());
  await page.waitForTimeout(50);
  state = await snapshot(page);
  assert.deepEqual(state.writes.filter(write => write.key === 'session_envelope').at(-1).value.entries, [], 'Clear wins over the stale pending snapshot');
});

test('a pending Clear barrier cannot be replaced by a later failing snapshot', async t => {
  const page = await fixture(t, { holdSessionWrites: 'first' });
  await action(page, 'addEntry', entry('barrier-old'));
  await page.waitForFunction(() => window.sessionTest.snapshot().sessionWriteActive === 1, undefined, { timeout: 6000 });
  assert.equal((await snapshot(page)).sessionWriteActive, 1, 'the first snapshot is held active');
  await action(page, 'clearSession');
  await action(page, 'addEntry', entry('barrier-later'));
  await page.waitForTimeout(4100);
  await page.evaluate(() => window.sessionTest.releaseSessionWrite?.());
  await page.waitForFunction(() => window.sessionTest.snapshot().sessionWriteStarts === 3, undefined, { timeout: 3000 });
  const state = await snapshot(page);
  const envelopeWrites = state.writes.filter(write => write.key === 'session_envelope');
  assert.equal(state.sessionWriteStarts, 3, 'the clear barrier and later snapshot both reached storage');
  assert.deepEqual(envelopeWrites.at(-1)?.value?.entries, [], 'Clear tombstone is written before the later failing snapshot');
  assert.deepEqual(state.writes.find(write => write.key === 'session_entries')?.value, [], 'legacy fallback is tombstoned too');
  assert.equal(state.health.lastErrorCode, 'storage-write-failed');
  assert.deepEqual(state.entries.map(entry => entry.id), ['barrier-later'], 'write failure keeps live traffic');
  const stored = await page.evaluate(() => window.sessionTest.stored);
  const reload = await fixture(t, { stored });
  assert.deepEqual((await snapshot(reload)).entries, [], 'reload cannot resurrect the old generation');
});

test('storage availability recovery clears only the stale unavailable receipt after an authoritative write', async t => {
  const page = await fixture(t, { missingStore: true });
  await action(page, 'addEntry', entry('live-during-outage'));
  let state = await snapshot(page);
  assert.equal(state.health.lastErrorCode, 'storage-unavailable');

  await page.evaluate(() => {
    window.XRAY_Store = {
      async get(key) { return window.sessionTest.stored[key] ?? null; },
      async set(key, value) { window.sessionTest.stored[key] = structuredClone(value); },
    };
  });
  await page.waitForTimeout(4100);
  state = await snapshot(page);
  assert.equal(state.entries[0].id, 'live-during-outage');
  assert.equal(state.health.lastErrorCode, null);
  assert.notEqual(state.health.health, 'degraded');
});

test('current envelopes win over legacy data and snapshots bound bodies/entries with origin-only source', async t => {
  const page = await fixture(t, { stored: {
    session_envelope: { schemaVersion: 1, sessionId: 'saved-session', createdAt: 100, updatedAt: 200,
      entries: [entry('current')], runtime: { acceptedCount: 9, droppedCount: 2 }, source: { origin: 'https://synthetic.test' } },
    session_entries: [entry('old')],
  } });
  assert.deepEqual((await snapshot(page)).entries.map(item => item.id), ['current']);
  await action(page, 'addEntries', Array.from({ length: 510 }, (_, i) => ({ ...entry('bound-' + i),
    url: 'https://last.test/api?credential=SOURCE_SECRET', responseRaw: 'x'.repeat(21000) })));
  await action(page, 'updateEntry', { id: 'missing-patch', responseRaw: 'not-captured' });
  await page.waitForTimeout(4100);
  const state = await snapshot(page);
  const saved = sessionWrites(state).at(-1).value;
  assert.equal(saved.sessionId, 'saved-session');
  assert.equal(saved.createdAt, 100);
  assert.equal(saved.entryCount, 500);
  assert.equal(saved.entries.length, 500);
  // Spec J9: one 3 MB budget, newest first, and every older entry keeps its first 2 KB; a cut is
  // metadata, never an in-band "…".
  assert.equal(saved.entries[499].responseRaw.length, 21000);
  assert.equal(saved.entries[499].responseTruncated, undefined);
  assert.equal(saved.entries[0].responseRaw.length, 2048);
  assert.deepEqual(saved.entries[0].responseTruncated, { totalChars: 21000, keptChars: 2048 });
  assert.ok(saved.entries.every(item => !item.responseRaw.endsWith('…')));
  assert.equal(saved.source.origin, 'https://last.test');
  assert.doesNotMatch(JSON.stringify(saved.source), /SOURCE_SECRET|credential/);
  assert.equal(saved.runtime.acceptedCount, 519);
  assert.equal(saved.runtime.droppedCount, 3);
});

test('trusted cumulative drop receipts are counted once and page-posted receipts cannot change health', async t => {
  const page = await fixture(t);
  await page.evaluate(async () => {
    let listener;
    window.XRAY_CaptureReceipt = { get: () => ({ dropped: 2 }), subscribe: callback => { listener = callback; return () => {}; } };
    await window.sessionTest.action('restorePreferences');
    listener({ dropped: 2 });
    listener({ dropped: 4 });
    listener({ dropped: 4 });
    window.postMessage({ __xray_capture_receipt__: true, receipt: { dropped: 999, accepted: 999 } }, '*');
  });
  await page.waitForTimeout(50);
  assert.equal((await snapshot(page)).health.droppedCount, 4);
  assert.equal((await snapshot(page)).health.acceptedCount, 0);
});

test('a clone-failed or pending-overflow drop names its reason in the runtime diagnostics', async t => {
  const page = await fixture(t);
  await page.evaluate(async () => {
    let listener;
    window.XRAY_CaptureReceipt = { get: () => ({ dropped: 0 }), subscribe: callback => { listener = callback; return () => {}; } };
    await window.sessionTest.action('restorePreferences');
    window.emitReceipt = receipt => listener(receipt);
  });
  const health = async receipt => {
    await page.evaluate(receipt => window.emitReceipt(receipt), receipt);
    return (await snapshot(page)).health;
  };
  assert.equal((await health({ dropped: 1, dropReasons: { 'clone-failed': 1 } })).lastErrorCode, 'clone-failed');
  assert.equal((await health({ dropped: 3, dropReasons: { 'clone-failed': 1, 'pending-overflow': 2 } })).lastErrorCode, 'pending-overflow');
  const last = await health({ dropped: 4, dropReasons: { 'clone-failed': 1, 'pending-overflow': 2, 'invalid-entry': 1 } });
  assert.equal(last.lastErrorCode, 'capture-drop', 'other reasons keep the generic code');
  assert.equal(last.droppedCount, 4);
  assert.match((await snapshot(page)).diagnostic, /4 dropped · capture-drop/);
});

test('an explicit supported restart waits for health and is attempted at most once without altering context', async t => {
  const page = await fixture(t);
  await action(page, 'addEntry', entry('restart-keep'));
  await action(page, 'selectEntry', 'restart-keep');
  await action(page, 'togglePinned', 'restart-keep');
  await page.evaluate(() => {
    let ready = false;
    window.restartCalls = 0;
    window.XRAY_Worker = {
      isReady: () => ready,
      getHealth: () => ({ state: ready ? 'healthy' : 'degraded', lastErrorCode: null }),
      restart: () => { window.restartCalls++; return new Promise(resolve => { window.finishRestart = () => { ready = true; resolve(); }; }); },
    };
    window.restartTask = window.sessionTest.action('restartRuntime');
  });
  assert.equal((await snapshot(page)).health.workerState, 'degraded');
  assert.doesNotMatch((await snapshot(page)).toast || '', /reconnected/);
  await page.evaluate(async () => { window.finishRestart(); await window.restartTask; });
  await action(page, 'restartRuntime');
  const state = await snapshot(page);
  assert.equal(state.health.workerState, 'healthy');
  assert.equal(state.selected, 'restart-keep');
  assert.deepEqual(state.pins, ['restart-keep']);
  assert.equal(await page.evaluate(() => window.restartCalls), 1);
});
