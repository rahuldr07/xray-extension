import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { before, after } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';

const { outputFiles } = await build({
  stdin: {
    resolveDir: fileURLToPath(new URL('../../', import.meta.url)), loader: 'jsx',
    contents: `
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      import { flushSync } from 'react-dom';
      import { Rules } from './src/panel/components/rules/Rules';
      import { ConfirmationModal } from './src/panel/components/common/ConfirmationModal';
      import { usePanelStore } from './src/panel/store';
      window.XRAY_Store = { set: async () => {}, get: async () => undefined };
      const messages = [];
      const postMessage = window.postMessage.bind(window);
      window.postMessage = (message, target) => { messages.push(message); postMessage(message, target); };
      let acceptCopy, rejectCopy;
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
        writeText: () => new Promise((resolve, reject) => { acceptCopy = resolve; rejectCopy = reject; })
      } });
      window.ruleTest = {
        setup(rules, bridge) {
          if (bridge) window.__XRAY_bridgeToken = 'synthetic-rule-token';
          usePanelStore.setState({ rules, activeTab: 'rules' });
          flushSync(() => createRoot(document.body.appendChild(document.createElement('div'))).render(<><Rules /><ConfirmationModal /></>));
        },
        copied(ok) { ok ? acceptCopy() : rejectCopy(new Error('synthetic clipboard denial')); },
        confirmation(on) { usePanelStore.setState({ settings: { ...usePanelStore.getState().settings, confirmDestructiveActions: on } }); },
        snapshot() { const s = usePanelStore.getState(); return { rules: s.rules, toast: s.toastMessage, messages }; },
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

const rule = (id = 'saved', enabled = true) => ({ id, label: 'Synthetic rule', enabled, match: { url: '/api', method: 'GET' }, action: { type: 'mock', status: 200, body: '{}', headers: {}, delayMs: 0 } });
async function fixture(t, rules = [], bridge = false) {
  const page = await browser.newPage();
  page.setDefaultTimeout(3000);
  t.after(() => page.close());
  await page.setContent('<div></div>');
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(({ rules, bridge }) => window.ruleTest.setup(rules, bridge), { rules, bridge });
  return page;
}
const snapshot = page => page.evaluate(() => window.ruleTest.snapshot());
const card = page => page.locator('.xray-rule-card').first();
async function openMore(page) {
  const trigger = page.getByRole('button', { name: 'More rule actions', exact: true });
  if (await trigger.getAttribute('aria-expanded') !== 'true') await trigger.click();
}
async function loadRules(page, rules) {
  await openMore(page);
  await page.getByRole('button', { name: 'Import', exact: true }).click();
  await page.getByPlaceholder('Paste a rule set exported from XRAY (JSON)').fill(JSON.stringify(rules));
  await page.getByRole('button', { name: 'Load rules', exact: true }).click();
}

test('new rules and presets remain disabled until explicitly enabled; empty/invalid matchers block enabling', async t => {
  const page = await fixture(t, [], true);
  await page.getByRole('button', { name: 'New rule', exact: true }).click();
  assert.equal((await snapshot(page)).rules[0].enabled, false);
  assert.equal(await card(page).getByRole('button', { name: 'Enable rule', exact: true }).isDisabled(), true);
  await card(page).getByText('Disabled', { exact: true }).waitFor();
  const matcher = card(page).getByLabel('URL contains / re:pattern');
  await matcher.fill('re:[');
  assert.equal(await card(page).getByRole('button', { name: 'Enable rule', exact: true }).isDisabled(), true);
  await card(page).getByText(/Invalid regular expression/).waitFor();
  await matcher.fill('/api');
  await card(page).getByRole('button', { name: 'Enable rule', exact: true }).click();
  await card(page).getByText('Enabled locally', { exact: true }).waitFor();
  assert.equal((await snapshot(page)).rules[0].enabled, true);
  await card(page).getByPlaceholder('Rule name').fill('Renamed');
  assert.equal((await snapshot(page)).rules[0].enabled, true);
  await matcher.fill('/changed');
  assert.equal((await snapshot(page)).rules[0].enabled, false);
  await card(page).getByText(/enable it again/i).waitFor();
  await card(page).getByRole('button', { name: 'Enable rule', exact: true }).click();
  await card(page).getByRole('combobox', { name: /^Action/ }).selectOption('delay');
  assert.equal((await snapshot(page)).rules[0].enabled, false);
  await page.getByRole('button', { name: 'Presets', exact: true }).click();
  await page.getByRole('button', { name: 'Offline (fail all)', exact: true }).click();
  assert.equal((await snapshot(page)).rules[1].enabled, false);
});

test('saved enabled state is local and an unavailable page bridge never claims application', async t => {
  const page = await fixture(t, [rule()]);
  await card(page).getByText('Enabled locally', { exact: true }).waitFor();
  await page.getByText(/Page bridge unavailable/).waitFor();
  await page.getByText(/not applied to the page/).waitFor();
  assert.equal((await snapshot(page)).messages.length, 0);
});

test('rule import reports accepted/skipped capacity counts and zero acceptance does not claim success', async t => {
  const old = Array.from({ length: 49 }, (_, i) => rule(`old${i}`));
  const page = await fixture(t, old);
  await loadRules(page, [rule('incoming'), rule('incoming'), rule('old0')]);
  let state = await snapshot(page);
  assert.match(state.toast, /Imported 1 rule.*2 skipped/i);
  assert.deepEqual(state.rules.slice(0, 49), old);
  assert.equal(state.rules[49].enabled, false);
  await page.getByRole('button', { name: 'Presets', exact: true }).click();
  await page.getByRole('button', { name: 'Offline (fail all)', exact: true }).click();
  assert.match((await snapshot(page)).toast, /No rules added.*1 skipped/i);
  await loadRules(page, [rule('incoming')]);
  state = await snapshot(page);
  assert.match(state.toast, /No rules imported.*1 skipped/i);
  assert.equal(state.rules.length, 50);
  assert.equal(await page.getByRole('button', { name: 'Load rules', exact: true }).count(), 1, 'failed import remains available for correction');
});

test('oversized input is counted fully and repeated duplicate rule ids stay independently controllable', async t => {
  const page = await fixture(t);
  await loadRules(page, Array.from({ length: 55 }, () => rule('same')));
  assert.match((await snapshot(page)).toast, /Imported 50 rules.*5 skipped/i);
  const imported = (await snapshot(page)).rules;
  assert.equal(new Set(imported.map(rule => rule.id)).size, 50);
  assert.ok(imported.every(rule => !rule.enabled && rule.id !== 'same'));

  const repeated = await fixture(t);
  await loadRules(repeated, [rule('same'), rule('same')]);
  await loadRules(repeated, [rule('same')]);
  await card(repeated).getByRole('button', { name: 'Enable rule', exact: true }).click();
  assert.deepEqual((await snapshot(repeated)).rules.map(rule => rule.enabled), [true, false, false]);
  await card(repeated).getByRole('button', { name: 'Delete rule', exact: true }).click();
  assert.equal((await snapshot(repeated)).rules.length, 3, 'delete asks first (S1)');
  await repeated.getByRole('dialog').getByRole('button', { name: 'Delete rule', exact: true }).click();
  assert.equal((await snapshot(repeated)).rules.length, 2);
});

test('rule delete runs immediately with Confirm destructive actions off, through the real control', async t => {
  const page = await fixture(t, [rule('a'), rule('b')]);
  await page.evaluate(() => window.ruleTest.confirmation(false));
  await card(page).getByRole('button', { name: 'Delete rule', exact: true }).click();
  assert.equal((await snapshot(page)).rules.length, 1);
  assert.equal(await page.getByRole('dialog').count(), 0, 'no dialog');
});

test('rule export awaits clipboard acceptance and catches denial without a copied receipt or unhandled error', async t => {
  const page = await fixture(t, [rule()]);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await openMore(page);
  await page.getByRole('button', { name: 'Export', exact: true }).click();
  assert.equal((await snapshot(page)).toast, null, 'pending write has no success receipt');
  await page.evaluate(() => window.ruleTest.copied(false));
  await page.waitForFunction(() => /Could not copy/.test(window.ruleTest.snapshot().toast || ''));
  assert.match((await snapshot(page)).toast, /permissions|manually/i);
  assert.deepEqual(errors, []);
  await openMore(page);
  await page.getByRole('button', { name: 'Export', exact: true }).click();
  await page.evaluate(() => window.ruleTest.copied(true));
  await page.waitForFunction(() => /Copied 1 rule/.test(window.ruleTest.snapshot().toast || ''));
});

test('Presets and overflow are keyboard-operable disclosure groups; presets keep real-case labels and arm nothing', async t => {
  const page = await fixture(t, [], true);
  const presets = page.getByRole('button', { name: 'Presets', exact: true });
  assert.equal(await presets.getAttribute('aria-expanded'), 'false');
  assert.equal(await presets.getAttribute('aria-haspopup'), null, 'a group of buttons is not an ARIA menu');
  await presets.click();
  assert.equal(await presets.getAttribute('aria-expanded'), 'true');
  const group = page.getByRole('group', { name: 'Rule presets' });
  await group.waitFor();
  assert.equal(await presets.getAttribute('aria-controls'), await group.getAttribute('id'));
  const labels = await group.getByRole('button').allTextContents();
  assert.ok(labels.length > 1 && labels.every(label => label === label.trim() && label !== label.toUpperCase()), JSON.stringify(labels));
  const first = group.getByRole('button').first();
  assert.equal(await first.evaluate(el => el === el.getRootNode().activeElement), true, 'focus moves to the first item');
  await page.keyboard.press('ArrowDown');
  assert.equal(await group.getByRole('button').nth(1).evaluate(el => el === el.getRootNode().activeElement), true);
  await page.keyboard.press('End');
  assert.equal(await group.getByRole('button').last().evaluate(el => el === el.getRootNode().activeElement), true);
  await page.keyboard.press('Home');
  assert.equal(await first.evaluate(el => el === el.getRootNode().activeElement), true);
  await page.keyboard.press('Escape');
  assert.equal(await group.count(), 0);
  assert.equal(await presets.evaluate(el => el === el.getRootNode().activeElement), true, 'Escape returns focus to the trigger');
  await presets.click();
  await page.keyboard.press('Tab');
  assert.equal(await group.count(), 0, 'Tab closes the group');
  await presets.click();
  await page.mouse.click(5, 5);
  assert.equal(await group.count(), 0, 'outside press closes the group');
  await presets.click();
  await group.getByRole('button').first().click();
  const state = await snapshot(page);
  assert.equal(state.rules.length, 1);
  assert.equal(state.rules[0].enabled, false, 'a preset never arms on click');
  const more = page.getByRole('button', { name: 'More rule actions', exact: true });
  await more.click();
  assert.deepEqual(await page.getByRole('group', { name: 'Import and export rules' }).getByRole('button').allTextContents(), ['Export', 'Import']);
});

test('Rules, Experiments and Investigations are tabs with counts; arrows move between them', async t => {
  const page = await fixture(t, [rule()]);
  const tabs = page.getByRole('tab');
  assert.deepEqual(await tabs.allTextContents(), ['Rules1', 'Experiments0', 'Investigations0']);
  assert.equal(await tabs.nth(0).getAttribute('aria-selected'), 'true');
  await tabs.nth(0).focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await tabs.nth(1).getAttribute('aria-selected'), 'true');
  assert.equal(await page.getByRole('tabpanel', { name: 'Experiments' }).count(), 1);
  assert.equal(await page.getByRole('button', { name: 'New rule', exact: true }).count(), 0, 'inactive sections are hidden');
  await page.keyboard.press('End');
  assert.equal(await tabs.nth(2).getAttribute('aria-selected'), 'true');
  await page.keyboard.press('Home');
  assert.equal(await page.getByRole('button', { name: 'New rule', exact: true }).count(), 1);
});
