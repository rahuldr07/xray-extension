import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { before, after } from 'node:test';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { PANEL_CSS } from '../helpers/panel-css.mjs';
import { setStandardsContent } from '../helpers/standards-page.mjs';

const projectRoot = fileURLToPath(new URL('../../', import.meta.url));
const { outputFiles } = await build({
  stdin: {
    resolveDir: projectRoot,
    loader: 'jsx',
    contents: `
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      import { flushSync } from 'react-dom';
      import { SettingsModal } from './src/panel/components/settings/SettingsModal';
      import { ExportModal } from './src/panel/components/export/ExportModal';
      import { usePanelStore } from './src/panel/store';

      const apiEntry = {
        id: 'modal-api', type: 'api', method: 'GET', status: 200,
        url: 'https://example.test/widgets', urlPath: '/widgets', source: 'fetch',
        timestamp: 1700000000000, duration: 12, responseRaw: '{"ok":true}',
        responseHeaders: { 'content-type': 'application/json' },
      };
      window.modalTest = {
        setup(kind, shadow, css, section) {
          const host = document.body.appendChild(document.createElement('div'));
          this.root = shadow ? host.attachShadow({ mode: 'closed' }) : document;
          const style = document.createElement('style'); style.textContent = css;
          (shadow ? this.root : document.head).appendChild(style);
          const mount = (shadow ? this.root : host).appendChild(document.createElement('div'));
          mount.className = 'xray-theme-scope xray-theme-xray-dark';
          window.XRAY_Store = { get: async () => null, set: async () => {} };
          usePanelStore.setState({
            open: true, settingsOpen: kind === 'settings', settingsSection: section || 'general', settingsSectionHint: null,
            exportOpen: kind === 'export', entries: [apiEntry], selectedId: 'modal-api',
          });
          flushSync(() => createRoot(mount).render(kind === 'settings' ? <SettingsModal /> : <ExportModal />));
        },
        deepActive() {
          let a = this.root.activeElement;
          while (a && a.shadowRoot && a.shadowRoot.activeElement) a = a.shadowRoot.activeElement;
          return a ? { text: a.textContent.trim(), pressed: a.getAttribute('aria-pressed'), cls: a.className } : null;
        },
        click(label) {
          const b = [...this.root.querySelectorAll('button')].find(el => el.textContent.trim() === label);
          if (!b) throw new Error('No button: ' + label);
          b.click();
        },
        pick(value) {
          const select = this.root.querySelector('select[aria-label="Export format"]');
          select.value = value;
          select.dispatchEvent(new Event('change', { bubbles: true }));
        },
        section(id) { flushSync(() => usePanelStore.getState().setSettingsSection(id)); },
        measure() {
          const root = this.root;
          const r = el => { const b = el.getBoundingClientRect(); return { left: b.left, top: b.top, right: b.right, bottom: b.bottom, width: b.width, height: b.height }; };
          const visible = el => { const b = el.getBoundingClientRect(); return b.width > 0 && b.height > 0 && getComputedStyle(el).visibility !== 'hidden'; };
          const dialog = root.querySelector('[role="dialog"]');
          const out = { vh: innerHeight, vw: innerWidth, dialog: r(dialog) };
          const nav = root.querySelector('.xray-settings-nav');
          if (nav) {
            out.navItems = [...nav.querySelectorAll('.xray-settings-nav-item')].map(el => ({ text: el.textContent.trim(), h: el.getBoundingClientRect().height, lines: el.querySelector('span').getClientRects().length, spanH: el.querySelector('span').getBoundingClientRect().height, lh: parseFloat(getComputedStyle(el.querySelector('span')).lineHeight) || parseFloat(getComputedStyle(el.querySelector('span')).fontSize) * 1.2, clipped: el.scrollWidth > el.clientWidth }));
            out.swatchTops = [...root.querySelectorAll('.xray-color-swatch')].map(el => Math.round(el.getBoundingClientRect().top));
            out.themeLabels = [...root.querySelectorAll('.xray-theme-swatch-label')].map(el => ({ text: el.textContent, h: el.getBoundingClientRect().height, fs: parseFloat(getComputedStyle(el).fontSize), clipped: el.scrollWidth > el.clientWidth + 1 }));
            out.themeLefts = [...new Set([...root.querySelectorAll('.xray-theme-swatch')].map(el => Math.round(el.getBoundingClientRect().left)))];
          }
          // A <select> never reports clipped text via scrollWidth, so measure the option text itself.
          const needed = el => {
            const cs = getComputedStyle(el);
            const probe = document.createElement('span');
            probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font:' + cs.font;
            probe.textContent = el.selectedOptions[0]?.textContent || '';
            document.body.appendChild(probe);
            const w = probe.getBoundingClientRect().width + parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) + 16;
            probe.remove();
            return w;
          };
          out.selects = [...root.querySelectorAll('.xray-settings-content select')].map(el => ({ text: el.selectedOptions[0]?.textContent, clipped: needed(el) > el.clientWidth, w: el.getBoundingClientRect().width }));
          const body = root.querySelector('.xray-export-body');
          if (body) {
            const rail = root.querySelector('.xray-export-rail');
            const select = root.querySelector('select[aria-label="Export format"]');
            out.body = r(body); out.rail = r(rail); out.railOverflow = rail.scrollHeight - rail.clientHeight;
            out.preview = r(root.querySelector('.xray-export-preview'));
            out.groupLabels = [...root.querySelectorAll('.xray-export-group')].filter(visible).map(g => g.getAttribute('aria-label'));
            out.chips = [...root.querySelectorAll('.xray-export-format')].filter(visible).map(c => ({ text: c.textContent.trim(), ...r(c), clipped: c.scrollWidth > c.clientWidth }));
            out.select = select ? { visible: visible(select), groups: [...select.querySelectorAll('optgroup')].map(g => g.label), options: [...select.options].map(o => ({ text: o.textContent, disabled: o.disabled })), value: select.value } : null;
            out.modeChips = [...root.querySelectorAll('.xray-export-mode .xray-chip')].map(c => r(c).height);
            out.formatHeights = out.chips.map(c => c.height);
            out.text = dialog.textContent;
            out.head = root.querySelector('.xray-export-preview-head h3').textContent;
          }
          return out;
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
  const executablePath = process.env.XRAY_BROWSER_EXECUTABLE ||
    (!existsSync(chromium.executablePath()) && existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined);
  browser = await chromium.launch({ executablePath, headless: true });
});
after(async () => { await browser?.close(); });

const css = PANEL_CSS;

async function fixture(t, kind, shadow, viewport, section) {
  const page = await browser.newPage({ viewport });
  page.setDefaultTimeout(3000);
  t.after(() => page.close());
  await setStandardsContent(page, '<style>html,body{margin:0;background:#1e1e2e}</style><div></div>');
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(({ kind, shadow, css, section }) => window.modalTest.setup(kind, shadow, css, section), { kind, shadow, css, section });
  return page;
}
// With tokens.css loaded the modal's entrance animation (scale .985 → 1) really runs; measure the
// settled box, not a mid-animation frame.
const settle = page => page.evaluate(() => Promise.all(window.modalTest.root.getAnimations().filter(a => a.effect?.getComputedTiming().endTime !== Infinity).map(a => a.finished)));
const measure = async page => { await settle(page); return page.evaluate(() => window.modalTest.measure()); };

for (const shadow of [false, true]) {
  const surface = shadow ? 'closed shadow' : 'document';

  test(`settings height is fixed across sections (${surface})`, async t => {
    for (const [width, height] of [[1440, 900], [1440, 600]]) {
      const page = await fixture(t, 'settings', shadow, { width, height });
      const heights = [];
      for (const id of ['general', 'capture', 'session', 'appearance', 'shortcuts', 'about']) {
        await page.evaluate(id => window.modalTest.section(id), id);
        heights.push((await measure(page)).dialog.height);
      }
      const expected = Math.min(640, 0.9 * height);
      for (const h of heights) assert.ok(Math.abs(h - expected) < 1, `${width}x${height}: ${JSON.stringify(heights)} expected ${expected}`);
    }
  });

  test(`settings width fits its content on one line (${surface})`, async t => {
    const page = await fixture(t, 'settings', shadow, { width: 1440, height: 900 }, 'appearance');
    const m = await measure(page);
    assert.ok(Math.abs(m.dialog.width - Math.min(780, 0.94 * 1440)) < 1, `dialog width ${m.dialog.width}`);
    for (const label of m.themeLabels) {
      assert.ok(label.h <= label.fs * 1.7, `theme name wraps: ${JSON.stringify(label)}`);
      assert.equal(label.clipped, false, `theme name clipped: ${label.text}`);
    }
    assert.equal(m.themeLefts.length, 2, `theme grid is two columns: ${m.themeLefts}`);
    assert.equal(new Set(m.swatchTops).size, 1, `accent swatches wrap: ${m.swatchTops}`);
    const session = m.navItems.find(item => item.text === 'Session & storage');
    assert.equal(session.lines, 1, 'Session & storage wraps');
    assert.equal(session.clipped, false);
    assert.ok(session.spanH <= session.lh * 1.3, JSON.stringify(session));
  });

  test(`settings selects show their full selected option (${surface})`, async t => {
    for (const width of [1440, 820, 420]) {
      for (const section of ['appearance', 'ai']) {
        const page = await fixture(t, 'settings', shadow, { width, height: 900 }, section);
        const m = await measure(page);
        assert.ok(m.selects.length > 0, `${section}: no selects`);
        for (const sel of m.selects) assert.equal(sel.clipped, false, `${width} ${section}: "${sel.text}" truncated (${sel.w}px)`);
      }
    }
  });

  test(`settings focuses the active section on open (${surface})`, async t => {
    let page = await fixture(t, 'settings', shadow, { width: 1440, height: 900 });
    let active = await page.evaluate(() => window.modalTest.deepActive());
    assert.equal(active.text, 'General');
    assert.equal(active.pressed, 'true');
    page = await fixture(t, 'settings', shadow, { width: 1440, height: 900 }, 'appearance');
    await page.waitForFunction(() => window.modalTest.deepActive()?.text === 'Appearance');
    active = await page.evaluate(() => window.modalTest.deepActive());
    assert.equal(active.text, 'Appearance');
  });

  test(`export mode shows only its own formats (${surface})`, async t => {
    const page = await fixture(t, 'export', shadow, { width: 1440, height: 900 });
    let m = await measure(page);
    assert.deepEqual(m.groupLabels, ['Request', 'Response', 'Types', 'Tests'], 'selected request opens in Selected mode');
    await page.evaluate(() => window.modalTest.click('Session'));
    m = await measure(page);
    assert.deepEqual(m.groupLabels, ['Session']);
    assert.ok(m.chips.some(c => /Import HAR/.test(c.text)), 'Import stays in Session mode');
    assert.ok(!m.chips.some(c => /^cURL/.test(c.text)), 'per-request chips are not rendered');
  });

  test(`export wide rail shows every chip unclipped (${surface})`, async t => {
    const page = await fixture(t, 'export', shadow, { width: 1440, height: 900 });
    for (const mode of ['Selected', 'Session']) {
      await page.evaluate(label => window.modalTest.click(label), mode);
      const m = await measure(page);
      assert.equal(m.select.visible, false, 'select hidden when wide');
      assert.equal(m.railOverflow <= 0, true, `${mode}: rail scrolls/clips (${m.railOverflow})`);
      for (const c of m.chips) {
        assert.equal(c.clipped, false, `${mode}: ${c.text} clipped`);
        assert.ok(c.left >= m.rail.left - 1 && c.right <= m.rail.right + 1 && c.bottom <= m.rail.bottom + 1, `${mode}: ${c.text} outside rail`);
      }
    }
  });

  test(`export narrow modal swaps the rail for a grouped select (${surface})`, async t => {
    const page = await fixture(t, 'export', shadow, { width: 640, height: 900 });
    let m = await measure(page);
    assert.ok(m.dialog.width < 640 && m.dialog.width > 560, `modal width ${m.dialog.width}`);
    assert.equal(m.select.visible, true);
    assert.deepEqual(m.select.groups, ['Request', 'Response', 'Types', 'Tests']);
    assert.equal(m.chips.length, 0, 'chip rail hidden');
    assert.ok(m.preview.height >= 0.5 * m.body.height, `preview ${m.preview.height} of ${m.body.height}`);
    await page.evaluate(() => window.modalTest.pick('fetch'));
    assert.match((await measure(page)).head, /fetch/i);
    await page.evaluate(() => window.modalTest.click('Session'));
    m = await measure(page);
    assert.deepEqual(m.select.groups, ['Session']);
    assert.ok(m.preview.height >= 0.5 * m.body.height);
    const wide = await fixture(t, 'export', shadow, { width: 820, height: 700 });
    assert.equal((await measure(wide)).select.visible, false, '771px modal keeps the rail');
  });

  test(`export privacy label appears once and the mode switch matches chip height (${surface})`, async t => {
    const page = await fixture(t, 'export', shadow, { width: 1440, height: 900 });
    let m = await measure(page);
    assert.equal(m.text.match(/may contain credentials/g)?.length, 1);
    for (const h of m.modeChips) assert.ok(Math.abs(h - m.formatHeights[0]) < 0.5, `mode ${m.modeChips} vs chip ${m.formatHeights[0]}`);
    await page.evaluate(() => window.modalTest.click('Session'));
    m = await measure(page);
    assert.equal(m.text.match(/Local\/private/g)?.length, 1, 'Local/private once');
    assert.doesNotMatch(m.head, /Local\/private/);
  });

  test(`export at a 420px pop-out width keeps the select, a full-height preview and Download (${surface})`, async t => {
    const page = await fixture(t, 'export', shadow, { width: 420, height: 800 });
    const m = await measure(page);
    assert.equal(m.select.visible, true);
    assert.ok(m.preview.height >= 0.5 * m.body.height, `preview ${m.preview.height} of ${m.body.height}`);
    assert.ok(m.preview.bottom <= m.body.bottom + 1);
    const download = await page.evaluate(() => { const b = [...window.modalTest.root.querySelectorAll('button')].find(e => e.textContent.trim() === 'Download'); const r = b.getBoundingClientRect(); return { disabled: b.disabled, w: r.width, right: r.right, vw: innerWidth }; });
    assert.equal(download.disabled, false);
    assert.ok(download.w > 0 && download.right <= download.vw + 1);
  });
}
