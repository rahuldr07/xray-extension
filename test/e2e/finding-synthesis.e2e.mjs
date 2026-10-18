import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { after, before } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';

const projectRoot = fileURLToPath(new URL('../../', import.meta.url));
const { outputFiles } = await build({
  stdin: {
    resolveDir: projectRoot,
    loader: 'jsx',
    contents: `
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      import { flushSync } from 'react-dom';
      import { FindingSynthesisModal } from './src/panel/components/ai/FindingSynthesisModal';
      import { SettingsModal } from './src/panel/components/settings/SettingsModal';
      import { usePanelStore } from './src/panel/store';
      import { installPanelKeyboard } from './src/panel/runtime/panelKeyboard';
      const messages = [], callbacks = [];
      window.chrome = { runtime: { sendMessage(message, callback) { messages.push(message); callbacks.push(callback); } } };
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('synthetic clipboard denial'); } } });
      const record = (patch = {}) => ({
        id: 'finding-1', title: 'Slow request', summary: 'The request exceeded the configured threshold.', kind: 'slow', severity: 'warning',
        sessionId: 'session-a', fingerprint: 'fingerprint-a', active: true,
        createdAt: 1, updatedAt: 1,
        evidence: [{ entryId: 'entry-1', sessionId: 'session-a', role: 'current', method: 'POST', origin: 'https://user:synthetic-origin-secret@api.test/?auth=synthetic-origin-query', path: '/v1/items?token=synthetic-evidence-query#fragment', status: 500, durationMs: 1200, size: 100, timestamp: 1 }],
        requestHeaders: { 'X-Auth': 'synthetic-header-secret' }, requestBody: { password: 'synthetic-body-secret' },
        responseBody: 'synthetic-response-secret', ...patch,
      });
      window.synthesisTest = {
        setup(shadow) {
          const host = document.body.appendChild(document.createElement('div'));
          const root = shadow ? host.attachShadow({ mode: 'closed' }) : document;
          const mount = shadow ? root.appendChild(document.createElement('div')) : host;
          this.root = root;
          installPanelKeyboard({ dismissible: true, getRoot: () => root });
          usePanelStore.setState({
            open: true,
            findingSynthesisIds: null,
            findings: { schemaVersion: 1, sessionId: 'session-a', findings: [record()], dismissals: {} },
            aiSettings: { provider: 'custom', model: 'synthetic-model', baseUrl: 'https://provider.test/v1', authHeader: 'x-auth', authPrefix: 'Bearer ', apiKey: 'synthetic-key-never-in-message' },
          });
          flushSync(() => createRoot(mount).render(<><FindingSynthesisModal /><SettingsModal /></>));
        },
        set(state) { flushSync(() => usePanelStore.setState(state)); },
        settings(patch) { this.set({ aiSettings: { ...usePanelStore.getState().aiSettings, ...patch } }); },
        record(patch) { this.set({ findings: { ...usePanelStore.getState().findings, findings: [record(patch)] } }); },
        session() { this.set({ session: { ...usePanelStore.getState().session, sessionId: 'session-b' } }); },
        reply(index, response) { callbacks[index]?.(response); },
        click(text) { [...this.root.querySelectorAll('button')].find(button => button.textContent.trim() === text)?.click(); },
        snapshot() {
          return {
            messages,
            dialogs: [...this.root.querySelectorAll('[role="dialog"]')].length,
            text: this.root.body?.textContent || this.root.textContent || '',
            prompt: this.root.querySelector('[aria-label="Exact sanitized prompt"]')?.textContent || '',
            settingsSection: usePanelStore.getState().settingsSection,
            settingsOpen: usePanelStore.getState().settingsOpen,
            settingsText: this.root.querySelector('[role="dialog"]:last-of-type')?.textContent || '',
            findings: usePanelStore.getState().findings,
            focus: this.root.activeElement?.getAttribute('aria-label'),
          };
        },
      };
    `,
  },
  bundle: true,
  format: 'iife',
  write: false,
});

let browser;
before(async () => {
  const executablePath = process.env.XRAY_BROWSER_EXECUTABLE || (!existsSync(chromium.executablePath()) && existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined);
  browser = await chromium.launch({ executablePath, headless: true });
});
after(async () => { await browser?.close(); });

async function fixture(t, shadow = false) {
  const page = await browser.newPage();
  page.setDefaultTimeout(5000);
  t.after(() => page.close());
  await page.setContent('<div></div>');
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(shadowRoot => window.synthesisTest.setup(shadowRoot), shadow);
  return page;
}

const set = (page, state) => page.evaluate(next => window.synthesisTest.set(next), state);
const snapshot = page => page.evaluate(() => window.synthesisTest.snapshot());
const clickInRoot = (page, text) => page.evaluate(label => window.synthesisTest.click(label), text);

test('opens inert with exact frozen metadata prompt and prevents duplicate sends', async t => {
  const page = await fixture(t);
  await set(page, { findingSynthesisIds: ['finding-1'] });
  const initial = await snapshot(page);
  assert.equal(initial.messages.length, 0);
  assert.match(initial.text, /Raw bodies, headers, and schema payloads are not included/);
  const approved = initial.prompt;
  await page.evaluate(() => window.synthesisTest.record({ title: 'changed live title', summary: 'changed', evidence: [] }));
  assert.equal((await snapshot(page)).prompt, approved);
  assert.ok(!(await snapshot(page)).text.includes('changed live title'));
  await page.getByRole('button', { name: 'Analyze', exact: true }).evaluate(button => { button.click(); button.click(); });
  const sent = await snapshot(page);
  assert.equal(sent.messages.length, 1);
  assert.equal(sent.messages[0].prompt, approved);
  for (const secret of ['synthetic-key-never-in-message', 'synthetic-header-secret', 'synthetic-body-secret', 'synthetic-response-secret', 'synthetic-origin-secret', 'synthetic-origin-query', 'synthetic-evidence-query']) assert.ok(!JSON.stringify(sent.messages).includes(secret));
  assert.ok(!approved.includes('requestBody'));
  assert.equal(await page.getByRole('checkbox').count(), 0);
  assert.equal(await page.getByRole('region', { name: 'Exact sanitized prompt' }).evaluate(el => el.tagName), 'PRE');
  assert.equal(await page.getByRole('button', { name: 'Analyzing…', exact: true }).isDisabled(), true);
  await page.evaluate(() => window.synthesisTest.reply(0, { ok: true, text: 'Synthetic interpretation' }));
  await page.getByText('AI interpretation — not a diagnosis').waitFor();
});

test('target fingerprint and session changes require a new Analyze and discard late results', async t => {
  const page = await fixture(t);
  await set(page, { findingSynthesisIds: ['finding-1'] });
  await page.getByRole('button', { name: 'Analyze', exact: true }).click();
  await page.evaluate(() => window.synthesisTest.record({ fingerprint: 'fingerprint-b', summary: 'New compact fact' }));
  await page.evaluate(() => window.synthesisTest.reply(0, { ok: true, text: 'STALE FINGERPRINT RESULT' }));
  assert.equal(await page.getByText('STALE FINGERPRINT RESULT').count(), 0);
  await page.getByRole('button', { name: 'Analyze', exact: true }).click();
  await page.evaluate(() => window.synthesisTest.session());
  await page.evaluate(() => window.synthesisTest.reply(1, { ok: true, text: 'STALE SESSION RESULT' }));
  assert.equal(await page.getByText('STALE SESSION RESULT').count(), 0);
  assert.equal((await snapshot(page)).messages.length, 2);
  await page.getByRole('button', { name: 'Analyze', exact: true }).click();
  await page.evaluate(() => window.synthesisTest.record({ id: 'finding-2' }));
  await set(page, { findingSynthesisIds: ['finding-2'] });
  await page.evaluate(() => window.synthesisTest.reply(2, { ok: true, text: 'STALE TARGET RESULT' }));
  assert.equal(await page.getByText('STALE TARGET RESULT').count(), 0);
});

test('destination changes reset consent and stale close results stay hidden', async t => {
  const page = await fixture(t);
  await set(page, { findingSynthesisIds: ['finding-1'] });
  await page.getByRole('button', { name: 'Analyze', exact: true }).click();
  await set(page, { findingSynthesisIds: null });
  await set(page, { findingSynthesisIds: ['finding-1'] });
  await page.evaluate(() => window.synthesisTest.reply(0, { ok: true, text: 'STALE CLOSED RESULT' }));
  assert.equal(await page.getByText('STALE CLOSED RESULT').count(), 0);
  await page.getByRole('button', { name: 'Analyze', exact: true }).click();
  await page.evaluate(() => window.synthesisTest.settings({ model: 'new-model', baseUrl: 'https://changed.test/v1' }));
  await page.evaluate(() => window.synthesisTest.reply(1, { ok: true, text: 'STALE DESTINATION RESULT' }));
  assert.equal(await page.getByText('STALE DESTINATION RESULT').count(), 0);
  assert.equal((await snapshot(page)).messages.length, 2);
  await page.getByRole('button', { name: 'Analyze', exact: true }).click();
  assert.equal((await snapshot(page)).messages[2].expectedDestination.model, 'new-model');
});

test('provider errors require explicit retry and shadow-root copy feedback is truthful', async t => {
  const page = await fixture(t, true);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await set(page, { findingSynthesisIds: ['finding-1'] });
  assert.equal(await page.evaluate(() => window.synthesisTest.root.activeElement?.textContent), 'Close', 'initial focus is the Close button, not the prompt or Analyze');
  assert.match((await snapshot(page)).text, /Selected findings/, 'findings are listed');
  await clickInRoot(page, 'Analyze');
  await page.evaluate(() => window.synthesisTest.reply(0, { ok: false, error: 'Synthetic provider unavailable.' }));
  await page.waitForFunction(() => window.synthesisTest.snapshot().text.includes('Synthetic provider unavailable.'));
  assert.match((await snapshot(page)).text, /Synthetic provider unavailable/);
  assert.equal((await snapshot(page)).messages.length, 1);
  const state = await snapshot(page);
  await clickInRoot(page, 'Analyze again');
  await page.evaluate(() => window.synthesisTest.reply(1, { ok: true, text: 'Copy me' }));
  await page.waitForFunction(() => window.synthesisTest.snapshot().text.includes('Copy me'));
  await clickInRoot(page, 'Copy');
  await page.waitForFunction(() => window.synthesisTest.snapshot().text.includes('Could not copy'));
  assert.match((await snapshot(page)).text, /Could not copy/);
  assert.deepEqual((await snapshot(page)).findings, state.findings);
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.copiedSynthesis = text; } } }));
  await clickInRoot(page, 'Copy');
  await page.waitForFunction(() => !window.synthesisTest.snapshot().text.includes('Could not copy'));
  assert.equal(await page.evaluate(() => window.copiedSynthesis), 'Copy me');
  assert.deepEqual(errors, []);
});

test('AI settings closes the preview and Escape closes the real shell in closed shadow', async t => {
  const page = await fixture(t, true);
  await set(page, { findingSynthesisIds: ['finding-1'] });
  await clickInRoot(page, 'Analyze');
  await page.evaluate(() => window.synthesisTest.reply(0, { ok: false, error: 'Synthetic provider unavailable.' }));
  await page.waitForFunction(() => window.synthesisTest.snapshot().text.includes('Synthetic provider unavailable.'));
  await clickInRoot(page, 'Open AI settings');
  const state = await snapshot(page);
  assert.match(state.settingsText, /AI \(bring your own key\)/);
  assert.equal(state.settingsOpen, true);
  assert.equal(state.dialogs, 1);
  await set(page, { settingsOpen: false, findingSynthesisIds: ['finding-1'] });
  await page.keyboard.press('Escape');
  assert.equal((await snapshot(page)).dialogs, 0);
});

test('missing key and extension runtime report local errors without sending', async t => {
  const page = await fixture(t);
  await page.evaluate(() => window.synthesisTest.settings({ apiKey: '' }));
  await set(page, { findingSynthesisIds: ['finding-1'] });
  await page.getByRole('button', { name: 'Analyze', exact: true }).click();
  await page.getByText('Add an API key in Settings → AI to enable explanations.').waitFor();
  assert.equal((await snapshot(page)).messages.length, 0);
  await page.evaluate(() => { window.synthesisTest.settings({ apiKey: 'synthetic-key' }); delete window.chrome; });
  await page.getByRole('button', { name: 'Analyze again', exact: true }).click();
  await page.getByText('AI explanations require the extension runtime (open XRAY on an inspected page).').waitFor();
  assert.equal((await snapshot(page)).messages.length, 0);
});
