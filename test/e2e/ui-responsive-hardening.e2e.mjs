import assert from 'node:assert/strict';
import { existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { before, after } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { PANEL_CSS } from '../helpers/panel-css.mjs';
import { setStandardsContent } from '../helpers/standards-page.mjs';

const projectRoot = fileURLToPath(new URL('../../', import.meta.url));
const screenshotDir = '/tmp/omnirush/ui-hardening';
mkdirSync(screenshotDir, { recursive: true });

const { outputFiles } = await build({
  stdin: {
    resolveDir: projectRoot,
    loader: 'jsx',
    contents: `
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      import { flushSync } from 'react-dom';
      import { App } from './src/panel/App';
      import { ExportModal } from './src/panel/components/export/ExportModal';
      import { ReplayModal } from './src/panel/components/replay/ReplayModal';
      import { ExperimentPanel } from './src/panel/components/experiments/ExperimentPanel';
      import { usePanelStore } from './src/panel/store';
      const styles = ${JSON.stringify(PANEL_CSS)};

      const apiEntry = {
        id: 'responsive-api', type: 'api', method: 'GET', status: 200,
        url: 'https://example.test/widgets', urlPath: '/widgets', source: 'fetch',
        timestamp: 1700000000000, duration: 12, responseRaw: '{"ok":true}',
        responseHeaders: { 'content-type': 'application/json' },
      };
      const logEntries = [
        { id: 'log-wide', type: 'log', logLevel: 'warn', timestamp: 1700000000000, message: 'A deliberately long console message that must stay inside the message track without covering its timestamp or pin action.' },
        { id: 'log-second', type: 'log', logLevel: 'log', timestamp: 1700000001234, message: 'second log message' },
      ];
      const experiment = {
        id: 'responsive-experiment', baselineEntryId: 'responsive-api', status: 'draft',
        plan: { method: 'GET', url: 'https://example.test/widgets', headers: {}, body: null, timeoutMs: 30000 },
        checks: [{ type: 'status', expected: 200 }],
      };

      window.uiHardening = {
        setup(kind) {
          const baseKind = kind.startsWith('export') ? 'export' : kind.startsWith('replay') ? 'replay' : kind.startsWith('logs') || kind.startsWith('pin') ? 'logs' : kind.startsWith('experiment') ? 'experiment' : 'api';
          const host = document.body.appendChild(document.createElement('div'));
          const sheet = document.createElement('style'); sheet.textContent = styles; document.head.appendChild(sheet);
          const mount = host.appendChild(document.createElement('div'));
          window.XRAY_Store = { get: async () => null, set: async () => {} };
          const state = usePanelStore.getState();
          usePanelStore.setState({
            open: true, activeTab: baseKind === 'logs' ? 'logs' : 'api', apiDetailOpen: false,
            exportOpen: baseKind === 'export', replayEditorEntry: baseKind === 'replay' ? apiEntry : null,
            entries: baseKind === 'logs' ? logEntries : (baseKind === 'replay' ? [apiEntry] : []),
            selectedId: null, pinnedIds: new Set(), experiments: baseKind === 'experiment' ? [experiment] : [],
            settings: { ...state.settings, panelWidth: 380 },
          });
          if (baseKind === 'experiment') {
            mount.className = 'xray-theme-scope xray-theme-xray-dark';
            const panel = mount.appendChild(document.createElement('div'));
            panel.className = 'xray-panel xray-mode-window xray-open';
            panel.style.cssText = 'container-type:inline-size;container-name:xray;width:380px;max-width:380px;height:800px;display:block;position:relative;';
            panel.style.setProperty('--xray-accent', '#f5c2e7');
            flushSync(() => createRoot(panel).render(<ExperimentPanel />));
          } else if (baseKind === 'export' || baseKind === 'replay') {
            mount.className = 'xray-theme-scope xray-theme-xray-dark';
            mount.style.setProperty('--xray-accent', '#f5c2e7');
            flushSync(() => createRoot(mount).render(baseKind === 'export' ? <ExportModal /> : <ReplayModal />));
          } else {
            mount.className = 'xray-app-root';
            flushSync(() => createRoot(mount).render(<App mode={kind.startsWith('first-run') ? 'hud' : 'window'} />));
          }
          this.root = document;
        },
        activate(kind) {
          flushSync(() => usePanelStore.setState({
            open: true,
            activeTab: kind === 'logs' ? 'logs' : 'api',
            exportOpen: kind === 'export',
            replayEditorEntry: kind === 'replay' ? apiEntry : null,
            entries: kind === 'logs' ? logEntries : (kind === 'replay' ? [apiEntry] : []),
          }));
        },
        addSpinner() {
          const spinner = document.body.appendChild(document.createElement('span'));
          spinner.className = 'xray-spinner';
          this.spinner = spinner;
        },
        state() { return usePanelStore.getState(); },
      };
    `,
  },
  bundle: true,
  format: 'iife',
  write: false,
  loader: { '.css': 'text' },
});

let browser;
before(async () => {
  const executablePath = process.env.XRAY_BROWSER_EXECUTABLE ||
    (!existsSync(chromium.executablePath()) && existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined);
  browser = await chromium.launch({ executablePath, headless: true });
});
after(async () => { await browser?.close(); });

async function fixture(t, kind, width, height) {
  const page = await browser.newPage({ viewport: { width, height } });
  page.on('pageerror', error => console.error(`[ui-hardening:${kind}] ${error.message}`));
  t.after(async () => {
    if (process.env.XRAY_UI_HARDENING_SCREENSHOTS) {
      await page.screenshot({ path: `${screenshotDir}/${kind}-${width}x${height}.png`, fullPage: true });
    }
    await page.close();
  });
  await setStandardsContent(page, '<style>html,body{margin:0;min-height:100%;background:#1e1e2e}</style>');
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(kindName => window.uiHardening.setup(kindName), kind);
  const activationKind = kind.startsWith('export') ? 'export' : kind.startsWith('replay') ? 'replay' : kind.startsWith('logs') || kind.startsWith('pin') ? 'logs' : null;
  if (activationKind) await page.evaluate(kindName => window.uiHardening.activate(kindName), activationKind);
  return page;
}

test('export and replay footers keep every action visible without horizontal overflow at phone widths', async t => {
  for (const kind of ['export', 'replay']) for (const width of [360, 420]) {
    const page = await fixture(t, `${kind}-footer`, width, 350);
    const modal = page.locator('[role="dialog"]');
    assert.ok(await modal.count(), `modal did not mount: ${await page.locator('body').innerHTML()}`);
    const state = await modal.evaluate(dialog => {
      const footer = dialog.querySelector('.xray-modal-foot');
      const actions = [...footer.querySelectorAll('button')];
      const modalRect = dialog.getBoundingClientRect();
      return {
        overflow: dialog.scrollWidth > dialog.clientWidth || footer.scrollWidth > footer.clientWidth,
        modalWithinViewport: modalRect.left >= 0 && modalRect.right <= innerWidth + 1 && modalRect.top >= 0 && modalRect.bottom <= innerHeight + 1,
        actionRects: actions.map(button => { const rect = button.getBoundingClientRect(); return { text: button.textContent.trim(), left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height }; }),
        visibleActions: actions.filter(button => { const rect = button.getBoundingClientRect(); return rect.width > 0 && rect.height > 0 && rect.left >= 0 && rect.right <= innerWidth + 1 && rect.top >= 0 && rect.bottom <= innerHeight + 1; }).map(button => button.textContent.trim()),
      };
    });
    assert.equal(state.overflow, false, `${kind} footer overflows at ${width}px`);
    assert.equal(state.modalWithinViewport, true, `${kind} modal escapes the short viewport at ${width}px`);
    assert.ok(state.visibleActions.length >= (kind === 'export' ? 2 : 3), `${kind} actions are not all visible: ${JSON.stringify(state)}`);
  }
});

test('experiment grid uses one column in a 380px panel even on a wide viewport', async t => {
  const page = await fixture(t, 'experiment-grid', 1600, 800);
  const grid = page.locator('.xray-experiment-grid');
  await grid.waitFor();
  const state = await grid.evaluate(element => ({
    columns: getComputedStyle(element).gridTemplateColumns.split(' ').length,
    width: element.getBoundingClientRect().width,
    overflow: element.scrollWidth > element.clientWidth,
  }));
  assert.ok(state.width >= 340 && state.width <= 380, `unexpected narrow panel content width: ${state.width}`);
  assert.equal(state.columns, 1);
  assert.equal(state.overflow, false);
});

test('first-run API guidance uses one column in a narrow panel', async t => {
  const page = await fixture(t, 'first-run-grid', 1600, 700);
  const grid = page.locator('.xray-firstrun-grid');
  await grid.waitFor();
  assert.equal(await grid.evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length), 1);
  assert.equal(await grid.evaluate(element => element.scrollWidth > element.clientWidth), false);
});

test('log rows keep timestamp, message, and pin action in non-overlapping tracks wide and narrow', async t => {
  for (const width of [360, 960]) {
    const page = await fixture(t, `logs-${width}`, width, 700);
    const row = page.locator('.xray-entry-row').first();
    await row.waitFor();
    const state = await row.evaluate(element => {
      const children = [...element.children].map(child => {
        const rect = child.getBoundingClientRect();
        return { left: rect.left, right: rect.right, width: rect.width };
      });
      return {
        columns: getComputedStyle(element).gridTemplateColumns.split(' ').length,
        overflow: element.scrollWidth > element.clientWidth,
        children,
        pinCursor: getComputedStyle(element.querySelector('.xray-pin')).cursor,
      };
    });
    assert.equal(state.columns, 4, `expected four log tracks at ${width}px`);
    assert.equal(state.overflow, false, `log row overflows at ${width}px`);
    for (let index = 1; index < state.children.length; index++) assert.ok(state.children[index - 1].right <= state.children[index].left + 1, `log children overlap at ${width}px`);
    assert.equal(state.pinCursor, 'pointer');
  }
});

// The hover is neutral since the calm accent (spec A1); it is read once its transition has run.
test('pin buttons expose hover and focus treatment', async t => {
  const page = await fixture(t, 'pin-interaction', 960, 700);
  const pin = page.locator('.xray-pin').first();
  await pin.waitFor();
  const before = await pin.evaluate(element => ({ border: getComputedStyle(element).borderColor, background: getComputedStyle(element).backgroundColor }));
  await pin.hover();
  await pin.evaluate(element => Promise.all(element.getAnimations().map(animation => animation.finished)));
  const hovered = await pin.evaluate(element => ({ border: getComputedStyle(element).borderColor, background: getComputedStyle(element).backgroundColor }));
  await pin.focus();
  const focused = await pin.evaluate(element => ({ outline: getComputedStyle(element).outlineStyle, outlineColor: getComputedStyle(element).outlineColor }));
  assert.notDeepEqual(hovered, before);
  assert.equal(focused.outline, 'solid');
  assert.notEqual(focused.outlineColor, 'rgba(0, 0, 0, 0)');
});

test('spinner animation is disabled when Chromium prefers reduced motion', async t => {
  const page = await fixture(t, 'spinner-motion', 960, 700);
  await page.evaluate(() => window.uiHardening.addSpinner());
  assert.notEqual(await page.locator('.xray-spinner').evaluate(element => getComputedStyle(element).animationName), 'none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await page.locator('.xray-spinner').evaluate(element => getComputedStyle(element).animationName), 'none');
});

// Badges are neutral since the calm accent (spec A1): their outline and fill come from theme tokens.
test('tab badge is unboxed and its background resolves from theme tokens', async t => {
  const page = await fixture(t, 'accent-badge', 960, 700);
  await page.evaluate(() => window.uiHardening.state().addEntry({ ...window.uiHardening.state().entries[0], id: 'badge-api', type: 'api', url: 'https://example.test/badge', urlPath: '/badge' }));
  const badge = page.locator('.xray-badge').first();
  await badge.waitFor();
  const state = await badge.evaluate(element => {
    const style = getComputedStyle(element);
    return { borderWidth: parseFloat(style.borderTopWidth), borderStyle: style.borderTopStyle, background: style.backgroundColor, text: style.color, accent: style.getPropertyValue('--xray-accent').trim(), surface: style.getPropertyValue('--xray-surface').trim() };
  });
  // Spec S1: badges are unboxed — a soft token tint, no outline.
  assert.ok(state.borderStyle === 'none' || state.borderWidth === 0, `badge draws no outline: ${JSON.stringify(state)}`);
  assert.notEqual(state.background, 'rgba(0, 0, 0, 0)');
  assert.notEqual(state.background, state.text);
  assert.notEqual(state.background, state.surface);
  assert.ok(state.accent);
});

test('export modal preview fills the body and every format stays reachable at 1600, 760 and 420', async t => {
  for (const width of [1600, 760, 420]) {
    const page = await fixture(t, 'export-layout', width, 900);
    const state = await page.locator('[role="dialog"]').evaluate(dialog => {
      const pre = dialog.querySelector('pre.xray-export-code');
      const rail = dialog.querySelector('.xray-export-rail');
      const modalRect = dialog.getBoundingClientRect();
      const preRect = pre.getBoundingClientRect();
      const importButton = dialog.querySelector('.xray-export-import');
      // Below 640px of modal width the rail is a select (L5); only visible chips need reaching.
      const chips = [...dialog.querySelectorAll('.xray-export-format')].filter(chip => chip.getBoundingClientRect().width > 0);
      const reachable = chips.every(chip => {
        const r = chip.getBoundingClientRect();
        return r.width > 0 && r.right <= modalRect.right + 1 && r.left >= modalRect.left - 1 && (r.bottom <= rail.getBoundingClientRect().bottom + 1 || rail.scrollHeight > rail.clientHeight);
      });
      return {
        preHeight: preRect.height,
        preInside: preRect.top >= modalRect.top && preRect.bottom <= modalRect.bottom + 1,
        modalBottomInViewport: modalRect.bottom <= innerHeight + 1,
        reachable,
        pressed: dialog.querySelectorAll('.xray-export-format[aria-pressed="true"]').length || (dialog.querySelector('select[aria-label="Export format"]')?.getBoundingClientRect().width ? 1 : 0),
        importInSession: Boolean(importButton?.closest('[role="group"][aria-label="Session"]')),
      };
    });
    assert.ok(state.preHeight > 150, `preview collapsed at ${width}px: ${JSON.stringify(state)}`);
    assert.equal(state.preInside, true, `preview escapes modal at ${width}px`);
    assert.equal(state.modalBottomInViewport, true);
    assert.equal(state.reachable, true, `format chips unreachable at ${width}px`);
    assert.equal(state.pressed, 1, 'exactly one pressed format chip');
    assert.equal(state.importInSession, true, 'Import lives in the Session group');
  }
});
