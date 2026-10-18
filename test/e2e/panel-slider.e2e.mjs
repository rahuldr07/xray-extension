import assert from 'node:assert/strict';
import test, { after, before } from 'node:test';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const { outputFiles } = await build({
  stdin: {
    resolveDir: fileURLToPath(new URL('../../', import.meta.url)),
    loader: 'jsx',
    contents: `
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      import { flushSync } from 'react-dom';
      import { App } from './src/panel/App';
      import { usePanelStore } from './src/panel/store';
      import styles from './src/panel/styles.css';

      const entry = {
        id: 'retained-entry', type: 'api', method: 'GET', status: 200,
        url: 'https://example.test/widgets', urlPath: '/widgets', source: 'fetch',
        timestamp: 1700000000000, duration: 12, size: 12, responseRaw: '{"ok":true}',
      };

      window.panelSlider = {
        setup(width, panelWidth) {
          const host = document.body.appendChild(document.createElement('div'));
          const root = host.attachShadow({ mode: 'closed' });
          const sheet = document.createElement('style');
          sheet.textContent = styles;
          root.appendChild(sheet);
          const mount = root.appendChild(document.createElement('div'));
          mount.className = 'xray-app-root';
          const state = usePanelStore.getState();
          usePanelStore.setState({
            open: true, activeTab: 'console', selectedId: entry.id,
            entries: [entry], pinnedIds: new Set([entry.id]), consoleDraft: 'res.data',
            settings: { ...state.settings, panelWidth, dockSide: 'right' },
          });
          flushSync(() => createRoot(mount).render(<App mode="hud" />));
          this.root = root;
          this.host = host;
          this.width = width;
        },
        panel() { return this.root.querySelector('.xray-panel'); },
        handle() { return this.root.querySelector('.xray-resize-handle'); },
        dock(side) {
          flushSync(() => usePanelStore.getState().updateSettings({ dockSide: side }));
        },
        setWidth(width) {
          flushSync(() => usePanelStore.getState().updateSettings({ panelWidth: width }));
        },
        state() {
          const panel = this.panel();
          const handle = this.handle();
          const rect = panel.getBoundingClientRect();
          return {
            rect: { x: rect.x, width: rect.width, right: rect.right },
            width: usePanelStore.getState().settings.panelWidth,
            draft: usePanelStore.getState().consoleDraft,
            selected: usePanelStore.getState().selectedId,
            pinned: [...usePanelStore.getState().pinnedIds],
            dockSide: usePanelStore.getState().settings.dockSide,
            handle: {
              width: handle.getBoundingClientRect().width,
              label: handle.getAttribute('aria-label'),
              value: Number(handle.getAttribute('aria-valuenow')),
            },
          };
        },
      };
    `,
  },
  bundle: true,
  format: 'iife',
  write: false,
  loader: { '.css': 'text' },
});

let browser;
before(async () => { browser = await chromium.launch({ headless: true }); });
after(async () => { await browser?.close(); });

async function fixture(t, viewport, storedWidth = 640) {
  const page = await browser.newPage({ viewport, reducedMotion: 'reduce' });
  t.after(() => page.close());
  await page.setContent('<style>html,body{margin:0;min-width:100%;min-height:100%}</style>');
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(({ width, storedWidth }) => window.panelSlider.setup(width, storedWidth), { width: viewport.width, storedWidth });
  await page.waitForFunction(() => window.panelSlider.panel().getBoundingClientRect().width > 0);
  await page.waitForTimeout(250);
  return page;
}

async function dragHandle(page, deltaX) {
  const handle = (await page.evaluateHandle(() => window.panelSlider.handle())).asElement();
  const box = await handle.boundingBox();
  assert.ok(box, 'resize handle is rendered');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + deltaX, box.y + box.height / 2);
  await page.mouse.up();
  await handle.dispose();
  await page.waitForTimeout(40);
}

test('docked closed-shadow panel drag persists width and retains console context', async t => {
  const page = await fixture(t, { width: 1400, height: 800 });
  const before = await page.evaluate(() => window.panelSlider.state());
  assert.equal(before.handle.label, 'Resize panel - drag, or use arrow keys');
  assert.ok(before.handle.width >= 8, 'resize handle has a usable hit area');

  await dragHandle(page, -120);
  const afterDrag = await page.evaluate(() => window.panelSlider.state());
  assert.equal(afterDrag.width, before.width + 120);
  assert.equal(afterDrag.rect.width, before.rect.width + 120);
  assert.equal(afterDrag.draft, 'res.data');
  assert.equal(afterDrag.selected, 'retained-entry');
  assert.deepEqual(afterDrag.pinned, ['retained-entry']);

  await page.evaluate(() => window.panelSlider.dock('left'));
  const left = await page.evaluate(() => window.panelSlider.state());
  assert.equal(left.dockSide, 'left');
  assert.equal(left.rect.x, 0);
  await dragHandle(page, 80);
  const leftDragged = await page.evaluate(() => window.panelSlider.state());
  assert.equal(leftDragged.width, left.width + 80);
  assert.equal(leftDragged.rect.width, left.rect.width + 80);
  assert.equal(leftDragged.draft, 'res.data');
  assert.equal(leftDragged.selected, 'retained-entry');
  assert.deepEqual(leftDragged.pinned, ['retained-entry']);
});

test('overflowed saved width starts each drag from the rendered viewport-clamped width', async t => {
  const page = await fixture(t, { width: 800, height: 700 }, 1600);
  const initial = await page.evaluate(() => window.panelSlider.state());
  assert.equal(initial.width, 1600);
  assert.equal(initial.rect.width, 768);

  await dragHandle(page, 48);
  const first = await page.evaluate(() => window.panelSlider.state());
  assert.equal(first.width, 720);
  assert.equal(first.rect.width, 720);

  await page.evaluate(() => window.panelSlider.setWidth(1600));
  await page.waitForTimeout(20);
  const resetToOverflow = await page.evaluate(() => window.panelSlider.state());
  assert.equal(resetToOverflow.rect.width, 768);
  await dragHandle(page, 24);
  const second = await page.evaluate(() => window.panelSlider.state());
  assert.equal(second.width, 744);
  assert.equal(second.rect.width, 744);
});

test('resize handle supports dock-aware keyboard nudges and keyboard or double-click reset', async t => {
  const page = await fixture(t, { width: 1400, height: 800 }, 640);
  const handle = (await page.evaluateHandle(() => window.panelSlider.handle())).asElement();
  await handle.focus();
  await handle.press('ArrowLeft');
  let state = await page.evaluate(() => window.panelSlider.state());
  assert.equal(state.width, 664);
  await handle.press('ArrowRight');
  state = await page.evaluate(() => window.panelSlider.state());
  assert.equal(state.width, 640);
  await handle.press('Home');
  state = await page.evaluate(() => window.panelSlider.state());
  assert.equal(state.width, 960);
  await handle.press('ArrowRight');
  state = await page.evaluate(() => window.panelSlider.state());
  assert.equal(state.width, 936);
  await handle.dblclick();
  state = await page.evaluate(() => window.panelSlider.state());
  assert.equal(state.width, 960);
});

test('keyboard resize starts at rendered width and double-click resets the saved default', async t => {
  const page = await fixture(t, { width: 800, height: 700 }, 1600);
  const handle = (await page.evaluateHandle(() => window.panelSlider.handle())).asElement();
  await handle.focus();
  await handle.press('ArrowRight');
  assert.equal((await page.evaluate(() => window.panelSlider.state())).width, 744);
  await handle.dblclick();
  assert.equal((await page.evaluate(() => window.panelSlider.state())).width, 768);
  assert.equal(await handle.evaluate(el => el.getRootNode().activeElement === el), true);
});

test('viewport clamping keeps saved width and accessible separator bounds truthful', async t => {
  const page = await fixture(t, { width: 1400, height: 800 }, 1200);
  await page.setViewportSize({ width: 320, height: 700 });
  await page.waitForTimeout(60);
  let state = await page.evaluate(() => window.panelSlider.state());
  const range = await page.evaluate(() => {
    const handle = window.panelSlider.handle();
    return ['aria-valuemin', 'aria-valuenow', 'aria-valuemax'].map(name => Number(handle.getAttribute(name)));
  });
  assert.ok(range[0] <= range[1] && range[1] <= range[2], `invalid separator range ${range}`);
  assert.ok(Math.abs(range[1] - state.rect.width) <= 1, 'announced width matches rendered width');
  assert.equal(state.width, 1200, 'viewport changes must not replace the chosen width');
  await page.setViewportSize({ width: 1400, height: 800 });
  await page.waitForTimeout(60);
  state = await page.evaluate(() => window.panelSlider.state());
  assert.equal(state.rect.width, 1200);
});
