import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { before, after } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { setStandardsContent } from '../helpers/standards-page.mjs';

const { outputFiles } = await build({
  stdin: {
    resolveDir: fileURLToPath(new URL('../../', import.meta.url)), loader: 'jsx',
    contents: `
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      import { flushSync } from 'react-dom';
      import { ExplainModal } from './src/panel/components/ai/ExplainModal';
      import { SettingsModal } from './src/panel/components/settings/SettingsModal';
      import { usePanelStore } from './src/panel/store';
      const messages = [], callbacks = [];
      window.chrome = { runtime: { sendMessage(message, callback) { messages.push(message); callbacks.push(callback); } } };
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('synthetic clipboard denial'); } } });
      window.aiTest = {
        setup() {
          usePanelStore.setState({ aiSettings: { provider: 'custom', model: 'synthetic-model', baseUrl: 'https://provider.test/v1', authHeader: 'x-auth', authPrefix: 'Bearer ', apiKey: 'synthetic-key-never-in-message' } });
          flushSync(() => createRoot(document.body.appendChild(document.createElement('div'))).render(<><ExplainModal /><SettingsModal /></>));
        },
        set(state) { flushSync(() => usePanelStore.setState(state)); },
        settings(patch) { this.set({ aiSettings: { ...usePanelStore.getState().aiSettings, ...patch } }); },
        reply(index, response) { callbacks[index](response); },
        snapshot() { return { messages, settingsSection: usePanelStore.getState().settingsSection, settingsOpen: usePanelStore.getState().settingsOpen, settingsText: document.querySelector('[role="dialog"]')?.textContent || '' }; },
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
const entry = (patch = {}) => ({ id: 'consent-target', type: 'api', method: 'POST', url: 'https://user:synthetic-pass@api.test/path?token=synthetic-query#fragment', status: 200, duration: 42, requestHeaders: { 'X-Auth': 'synthetic-header' }, requestBody: { password: 'synthetic-password', visible: 'original' }, responseDecrypted: { token: 'synthetic-response', value: 'inspected-decrypted' }, graphql: { operationName: 'Update', operationType: 'mutation', variables: { secret: 'synthetic-variable', count: 1 } }, ...patch });
async function fixture(t) {
  const page = await browser.newPage();
  page.setDefaultTimeout(5000);
  t.after(() => page.close());
  await setStandardsContent(page, '<div></div>');
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(() => window.aiTest.setup());
  return page;
}
const set = (page, state) => page.evaluate(state => window.aiTest.set(state), state);
const snapshot = page => page.evaluate(() => window.aiTest.snapshot());
const preview = page => page.getByRole('region', { name: 'Exact sanitized prompt' }).textContent();

test('opening, updating, closing and reopening never send; opt-ins default unchecked', async t => {
  const page = await fixture(t);
  await set(page, { explainEntry: entry() });
  assert.equal((await snapshot(page)).messages.length, 0);
  assert.equal(await page.getByRole('checkbox', { name: 'Include headers' }).isChecked(), false);
  // The prompt is a read-only, keyboard-scrollable code block that never takes initial focus.
  const block = page.getByRole('region', { name: 'Exact sanitized prompt' });
  assert.equal(await block.evaluate(el => el.tagName), 'PRE');
  assert.equal(await block.getAttribute('tabindex'), '0');
  assert.equal(await block.evaluate(el => el === document.activeElement), false);
  assert.equal(await page.getByRole('button', { name: 'Copy prompt', exact: true }).count(), 1);
  const initial = await preview(page);
  await set(page, { explainEntry: entry({ status: 500, requestBody: { visible: 'live-patch' } }) });
  assert.equal(await preview(page), initial);
  await page.getByRole('checkbox', { name: 'Include request body' }).check();
  assert.ok((await preview(page)).includes('original'));
  assert.ok(!(await preview(page)).includes('live-patch'));
  await page.getByRole('button', { name: 'Close', exact: true }).last().click();
  await set(page, { explainEntry: entry() });
  assert.equal(await page.getByRole('checkbox', { name: 'Include request body' }).isChecked(), false);
  assert.equal((await snapshot(page)).messages.length, 0);
});

test('Analyze sends exactly the sanitized preview once, pending blocks changes, retry is explicit', async t => {
  const page = await fixture(t);
  await set(page, { explainEntry: entry() });
  for (const name of ['Include headers', 'Include request body', 'Include response body']) await page.getByRole('checkbox', { name }).check();
  const approved = await preview(page);
  assert.ok(approved.includes('inspected-decrypted'));
  for (const secret of ['synthetic-pass', 'synthetic-query', 'synthetic-header', 'synthetic-password', 'synthetic-response', 'synthetic-variable']) assert.ok(!approved.includes(secret));
  await page.getByRole('button', { name: 'Analyze', exact: true }).evaluate(button => { button.click(); button.click(); });
  let state = await snapshot(page);
  assert.equal(state.messages.length, 1);
  assert.equal(state.messages[0].prompt, approved);
  assert.ok(!JSON.stringify(state.messages).includes('synthetic-key-never-in-message'));
  assert.equal(await page.getByRole('checkbox', { name: 'Include headers' }).isDisabled(), true);
  await page.evaluate(() => window.aiTest.reply(0, { ok: false, error: 'Synthetic provider unavailable.' }));
  await page.getByText('Synthetic provider unavailable.').waitFor();
  assert.equal((await snapshot(page)).messages.length, 1);
  await page.getByRole('button', { name: 'Analyze again', exact: true }).click();
  state = await snapshot(page);
  assert.equal(state.messages.length, 2);
  assert.equal(state.messages[1].prompt, approved);
});

test('destination changes reset consent, ignore old results and require a fresh click', async t => {
  const page = await fixture(t);
  await set(page, { explainEntry: entry() });
  await page.getByRole('checkbox', { name: 'Include request body' }).check();
  await page.getByRole('button', { name: 'Analyze', exact: true }).click();
  await page.evaluate(() => window.aiTest.settings({ model: 'new-model', baseUrl: 'https://changed.test/v1' }));
  assert.equal((await snapshot(page)).messages.length, 1);
  assert.equal(await page.getByRole('checkbox', { name: 'Include request body' }).isChecked(), false);
  await page.evaluate(() => window.aiTest.reply(0, { ok: true, text: 'STALE DESTINATION RESULT' }));
  assert.equal(await page.getByText('STALE DESTINATION RESULT').count(), 0);
  await page.getByRole('button', { name: 'Analyze', exact: true }).click();
  const state = await snapshot(page);
  assert.equal(state.messages.length, 2);
  assert.equal(state.messages[1].expectedDestination.model, 'new-model');
  assert.equal(state.messages[1].expectedDestination.baseUrl, 'https://changed.test/v1/chat/completions');
});

test('closed, reopened and switched targets ignore late responses', async t => {
  const page = await fixture(t);
  await set(page, { explainEntry: entry() });
  await page.getByRole('button', { name: 'Analyze', exact: true }).click();
  await set(page, { explainEntry: null });
  await set(page, { explainEntry: entry() });
  await page.evaluate(() => window.aiTest.reply(0, { ok: true, text: 'STALE CLOSED RESULT' }));
  assert.equal(await page.getByText('STALE CLOSED RESULT').count(), 0);
  await page.getByRole('button', { name: 'Analyze', exact: true }).click();
  await set(page, { explainEntry: entry({ id: 'other-target' }) });
  await page.evaluate(() => window.aiTest.reply(1, { ok: true, text: 'STALE TARGET RESULT' }));
  assert.equal(await page.getByText('STALE TARGET RESULT').count(), 0);
  assert.equal((await snapshot(page)).messages.length, 2);
});

test('missing key/runtime states are local and AI settings routes directly to the AI section', async t => {
  const page = await fixture(t);
  await page.evaluate(() => window.aiTest.settings({ apiKey: '' }));
  await set(page, { explainEntry: entry() });
  await page.getByRole('button', { name: 'Analyze', exact: true }).click();
  await page.getByText('Add an API key in Settings → AI to enable explanations.').waitFor();
  assert.equal((await snapshot(page)).messages.length, 0);
  await page.getByRole('button', { name: 'Open AI settings' }).click();
  assert.match((await snapshot(page)).settingsText, /AI \(bring your own key\)/);
  assert.equal((await snapshot(page)).settingsOpen, true);
  await page.evaluate(() => { window.aiTest.settings({ apiKey: 'synthetic-key' }); delete window.chrome; });
  await set(page, { explainEntry: entry(), settingsOpen: false });
  await page.getByRole('button', { name: 'Analyze', exact: true }).click();
  await page.getByText('AI explanations require the extension runtime (open XRAY on an inspected page).').waitFor();
});

test('AI result copying reports denied clipboard writes without unhandled rejections', async t => {
  const page = await fixture(t);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await set(page, { explainEntry: entry() });
  await page.getByRole('button', { name: 'Analyze', exact: true }).click();
  await page.evaluate(() => window.aiTest.reply(0, { ok: true, text: 'Synthetic explanation' }));
  await page.getByRole('button', { name: 'Copy', exact: true }).click();
  await page.getByText('Could not copy. Select the result and copy it manually, or check clipboard permissions.').waitFor();
  assert.deepEqual(errors, []);
});
