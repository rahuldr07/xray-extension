// JSON fidelity Task 9 (spec J10, audit #5, #29): Edit & Replay holds the request text as captured —
// no pretty re-print, no "… truncated" suffix — and Replay, Edit & Replay and an experiment run post it
// unchanged unless the user edits it; a body cut at capture is never sent silently; a mock rule made
// from a request keeps the captured response text. Document and closed shadow root.
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { before, after } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { PANEL_CSS } from '../helpers/panel-css.mjs';
import { setStandardsContent } from '../helpers/standards-page.mjs';

const { outputFiles } = await build({
  stdin: { resolveDir: fileURLToPath(new URL('../../', import.meta.url)), loader: 'jsx', contents: `
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    import { flushSync } from 'react-dom';
    import { RequestDetail } from './src/panel/components/detail/RequestDetail';
    import { ReplayModal } from './src/panel/components/replay/ReplayModal';
    import { usePanelStore } from './src/panel/store';
    const styles = ${JSON.stringify(PANEL_CSS)};
    const messages = [];
    window.XRAY_Store = { get: async () => undefined, set: async () => {} };
    window.postMessage = (message) => messages.push(JSON.parse(JSON.stringify(message)));
    window.__XRAY_bridgeToken = 'fixture-token';
    function Fixture() {
      const entry = usePanelStore((s) => s.entries[0]);
      return <div className="xray-theme-scope xray-theme-xray-dark"><div className="xray-panel xray-mode-window xray-open">
        {entry && <RequestDetail entry={entry} />}<ReplayModal />
      </div></div>;
    }
    window.replayTest = {
      setup(shadow) {
        const host = document.body.appendChild(document.createElement('div'));
        this.root = shadow ? host.attachShadow({ mode: 'closed' }) : document;
        const sheet = document.createElement('style'); sheet.textContent = styles; (shadow ? this.root : document.head).appendChild(sheet);
        const mount = shadow ? this.root.appendChild(document.createElement('div')) : host;
        flushSync(() => createRoot(mount).render(<Fixture />));
      },
      show(entry) {
        messages.length = 0;
        flushSync(() => usePanelStore.setState({ entries: [entry], selectedId: entry.id, activeTab: 'api', open: true, replayEditorEntry: null, toastMessage: null, rules: [], experiments: [] }));
      },
      buttons(text) { return [...this.root.querySelectorAll('button')].filter((b) => b.textContent.trim() === text); },
      click(text) {
        const button = this.buttons(text)[0];
        if (!button) throw Error('Missing ' + text);
        flushSync(() => button.click());
      },
      menu(text) { this.click('More actions'); this.click(text); },
      disabled(text) { const button = this.buttons(text)[0]; return button ? button.disabled : null; },
      editor() { return this.root.querySelector('.xray-replay-bodyfield')?.value ?? null; },
      type(value) {
        const field = this.root.querySelector('.xray-replay-bodyfield');
        const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
        flushSync(() => { setter.call(field, value); field.dispatchEvent(new Event('input', { bubbles: true })); });
      },
      notice() { return [...this.root.querySelectorAll('.xray-replay-modal [role="status"], .xray-replay-modal .xray-notice, .xray-replay-modal [class*="notice"]')].map((n) => n.textContent).join(' '); },
      replays() { return messages.filter((m) => m.__xray_replay__).map((m) => m.request); },
      state() { const s = usePanelStore.getState(); return { toast: s.toastMessage, rules: s.rules, experiments: s.experiments, editorOpen: !!s.replayEditorEntry }; },
      action(name, ...args) { return usePanelStore.getState()[name](...args); },
    };
  ` }, loader: { '.css': 'text' }, bundle: true, format: 'iife', write: false,
});

const REQUEST_TEXTS = {
  jsonstring: '"hello"',
  double: '"{\\"a\\":1}"',
  literalnull: 'null',
  literalfalse: 'false',
  pretty: '{\n  "a": 1\n}',
  keyorder: '{"b":1,"a":2,"10":3,"2":4}',
  bigint: '{"id": 9007199254740993, "n": 12345678901234567890}',
};

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortKeys(value[key])]));
  return value;
}

// As capture and a session save leave it: the text verbatim beside a rounded, key-sorted parsed copy.
function captured(id, text, extra = {}) {
  let copy = text;
  try { copy = sortKeys(JSON.parse(text)); } catch { /* not JSON: the copy is the text */ }
  return {
    id, type: 'api', method: 'POST', status: 200, url: 'https://example.test/api/echo', urlPath: '/api/echo', source: 'fetch', timestamp: 1, duration: 5, size: 20,
    requestHeaders: { 'content-type': 'application/json' }, responseHeaders: { 'content-type': 'application/json' },
    requestBodyKind: 'text', requestBodyText: text, requestBody: copy, responseRaw: '{"ok":true}',
    ...extra,
  };
}

let browser;
before(async () => {
  const executablePath = process.env.XRAY_BROWSER_EXECUTABLE || (!existsSync(chromium.executablePath()) && existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined);
  browser = await chromium.launch({ executablePath, headless: true });
});
after(async () => { await browser?.close(); });

async function fixture(t, shadow) {
  const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  t.after(() => page.close());
  page.setDefaultTimeout(4000);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await setStandardsContent(page, '<style>body{margin:0}</style>');
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate((shadow) => window.replayTest.setup(shadow), shadow);
  const call = (name, ...args) => page.evaluate(({ name, args }) => window.replayTest[name](...args), { name, args });
  return { page, call, errors };
}

for (const [surface, shadow] of [['document', false], ['closed shadow', true]]) {
  test(`J10 Edit & Replay holds the captured request text and sends it unchanged (${surface})`, async (t) => {
    const { call, errors } = await fixture(t, shadow);
    for (const [name, text] of Object.entries(REQUEST_TEXTS)) {
      await call('show', captured(`e-${name}`, text));
      await call('menu', 'Edit & Replay');
      assert.equal(await call('editor'), text, `${name}: the editor holds the text as captured`);
      await call('click', 'Send replay');
      const sent = await call('replays');
      assert.equal(sent.length, 1, name);
      assert.equal(sent[0].body, text, `${name}: sent unchanged`);
    }
    assert.deepEqual(errors, []);
  });

  test(`J10 an edited body is sent exactly as typed; Replay sends the captured text (${surface})`, async (t) => {
    const { call } = await fixture(t, shadow);
    await call('show', captured('edit', REQUEST_TEXTS.bigint));
    await call('menu', 'Edit & Replay');
    await call('type', '{ "edited" :\t9007199254740993 }');
    await call('click', 'Send replay');
    assert.equal((await call('replays'))[0].body, '{ "edited" :\t9007199254740993 }');
    await call('show', captured('quick', REQUEST_TEXTS.keyorder));
    await call('menu', 'Replay');
    assert.equal((await call('replays'))[0].body, REQUEST_TEXTS.keyorder, 'quick Replay posts the captured text');
  });

  test(`J10 a body cut at capture is shown without a suffix, warned about, and never sent silently (${surface})`, async (t) => {
    const { call } = await fixture(t, shadow);
    const kept = '{"rows":"' + 'x'.repeat(49_991);
    await call('show', captured('cut', kept, { requestTruncated: { totalChars: 120_000, keptChars: 50_000 } }));
    await call('menu', 'Replay');
    assert.equal((await call('replays')).length, 0, 'quick Replay refuses');
    assert.match(String((await call('state')).toast), /cut at capture/i);
    await call('menu', 'Edit & Replay');
    assert.equal(await call('editor'), kept, 'the kept text, no "… truncated" suffix');
    assert.match(await call('notice'), /cut at capture.*50,000 of 120,000/i);
    assert.equal(await call('disabled', 'Send replay'), true, 'Send waits for an edit');
    assert.equal(await call('disabled', 'Prepare experiment'), true);
    await call('type', '{"rows":"short"}');
    assert.equal(await call('disabled', 'Send replay'), false);
    await call('click', 'Send replay');
    assert.equal((await call('replays'))[0].body, '{"rows":"short"}');
  });

  test(`Fix1 Replay and Edit & Replay of a FormData of text fields post its fields; a form with files is refused (${surface})`, async (t) => {
    const { call } = await fixture(t, shadow);
    const pairs = [['a', '1'], ['b', 'two words'], ['a', '3']];
    const form = captured('form', 'a=1\nb=two words\na=3', {
      requestBodyKind: 'formdata', requestBody: pairs, requestHeaders: { 'content-type': 'multipart/form-data; boundary=----captured' },
    });
    await call('show', form);
    await call('menu', 'Replay');
    assert.deepEqual((await call('replays'))[0]?.body, { formdata: pairs }, 'Replay posts the fields');
    await call('show', form);
    await call('menu', 'Edit & Replay');
    assert.match(await call('notice'), /rebuilds this FormData from its captured fields/i);
    await call('click', 'Send replay');
    assert.deepEqual((await call('replays'))[0]?.body, { formdata: pairs }, 'Edit & Replay, unedited, posts the fields');
    await call('show', form);
    await call('menu', 'Edit & Replay');
    await call('type', 'a=edited');
    await call('click', 'Send replay');
    const edited = (await call('replays'))[0];
    assert.equal(edited?.body, 'a=edited', 'an edit is sent as text');
    assert.equal(Object.keys(edited.headers).some((name) => name.toLowerCase() === 'content-type'), false, 'without the multipart Content-Type');
    const files = { ...form, id: 'files', requestBody: [['a', '1'], ['f', { file: 'a.png', size: 4, type: 'image/png' }]] };
    await call('show', files);
    await call('menu', 'Replay');
    assert.equal((await call('replays')).length, 0, 'a form with files is refused');
    assert.match(String((await call('state')).toast), /files were not captured/);
    await call('menu', 'Edit & Replay');
    const notice = await call('notice');
    assert.match(notice, /files were not captured/);
    assert.doesNotMatch(notice, /Edit the body/, 'no invitation to edit it into a malformed request');
    assert.equal(await call('disabled', 'Send replay'), true);
  });

  test(`J10 a mock rule made from a request keeps the captured response text (${surface})`, async (t) => {
    const { call } = await fixture(t, shadow);
    const raw = '{"z":1,"10":2,"2":3,"id":9007199254740993,"f":1.0}';
    await call('show', captured('mock', '{}', { method: 'GET', responseRaw: raw }));
    await call('menu', 'Create disabled mock rule');
    assert.equal((await call('state')).rules[0]?.action.body, raw);
  });

  test(`J10 an experiment prepared from Edit & Replay replays the captured text (${surface})`, async (t) => {
    const { call } = await fixture(t, shadow);
    const text = '{"b":1,"a":2,"id":9007199254740993}';
    await call('show', captured('baseline', text));
    await call('menu', 'Edit & Replay');
    await call('click', 'Prepare experiment');
    const [record] = (await call('state')).experiments;
    assert.ok(record, 'drafted');
    await call('action', 'armExperiment', record.id);
    await call('action', 'runExperiment', record.id);
    assert.equal((await call('replays')).at(-1)?.body, text);
    await call('action', 'cancelExperiment', record.id);
    // An edited body is planned as its value and sent as typed — a JSON string not decoded twice.
    const typed = '"{\\"a\\":2}"';
    await call('show', captured('baseline-edited', text));
    await call('menu', 'Edit & Replay');
    await call('type', typed);
    await call('click', 'Prepare experiment');
    const [edited] = (await call('state')).experiments;
    await call('action', 'armExperiment', edited.id);
    await call('action', 'runExperiment', edited.id);
    assert.equal((await call('replays')).at(-1)?.body, typed);
    await call('action', 'cancelExperiment', edited.id);
  });
}
