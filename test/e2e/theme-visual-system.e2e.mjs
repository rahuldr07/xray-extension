/* Rendered themes, control precedence, the calm accent (spec A1–A3), sibling overlays, and isolation. */
import assert from 'node:assert/strict';
import { existsSync, readFileSync, mkdirSync } from 'node:fs';
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
      import { App } from './src/panel/App';
      import { usePanelStore } from './src/panel/store';
      import * as panelSettings from './src/panel/models/panelSettings';
      const { DEFAULT_PANEL_SETTINGS } = panelSettings;
      import { decodeTheme, encodeTheme, themePackageToSettings } from './src/panel/models/customTheme';
      // Computed colours as [r, g, b, a] (0..255, 0..1): Chromium serialises color-mix() results as color(srgb …).
      const parseColour = c => {
        if (!c || c === 'transparent') return [0, 0, 0, 0];
        let m = c.match(/^color\\(srgb\\s+([-\\d.e]+)\\s+([-\\d.e]+)\\s+([-\\d.e]+)(?:\\s*\\/\\s*([-\\d.e]+))?\\)$/);
        if (m) return [m[1] * 255, m[2] * 255, m[3] * 255, m[4] == null ? 1 : +m[4]];
        m = c.match(/^rgba?\\(\\s*([-\\d.]+)[,\\s]+([-\\d.]+)[,\\s]+([-\\d.]+)(?:[,\\s/]+([-\\d.]+))?\\s*\\)$/);
        return m ? [+m[1], +m[2], +m[3], m[4] == null ? 1 : +m[4]] : null;
      };
      // Every colour named in a computed value list (box-shadow, background-image).
      const coloursIn = text => (String(text).match(/color\\(srgb[^)]*\\)|rgba?\\([^)]*\\)/g) || []).map(parseColour);
      const lin = v => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; };
      const lum = c => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
      const ratio = (a, b) => { const x = lum(a); const y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
      const over = (f, b) => [0, 1, 2].map(i => f[i] * f[3] + b[i] * (1 - f[3])).concat(1);
      // The opaque colour under an element: its own fill composited over its ancestors' (shadow hosts included).
      const under = el => {
        const chain = [];
        for (let n = el; n && n.nodeType === 1; n = n.parentElement || n.getRootNode().host) {
          const c = parseColour(getComputedStyle(n).backgroundColor);
          chain.push(c);
          if (c[3] >= 0.999) break;
        }
        return chain.reverse().reduce((bg, c) => over(c, bg), [255, 255, 255, 1]);
      };
      window.themeTest = {
        setup(shadow, css, mode) {
          const host = document.body.appendChild(document.createElement('div'));
          this.root = shadow ? host.attachShadow({ mode: 'closed' }) : document;
          const style = document.createElement('style'); style.textContent = css;
          (shadow ? this.root : document.head).appendChild(style);
          const mount = shadow ? this.root.appendChild(document.createElement('div')) : host;
          mount.className = 'xray-app-root';
          usePanelStore.setState({ open: true, firstRunOpen: false, settingsOpen: false, activeTab: 'api', settings: { ...DEFAULT_PANEL_SETTINGS, firstRunDismissed: true } });
          flushSync(() => createRoot(mount).render(<App mode={mode} />));
        },
        settings(patch) { flushSync(() => usePanelStore.getState().updateSettings(patch)); },
        swatch(accent) { return panelSettings.accentSwatchValue?.(usePanelStore.getState().settings, accent); },
        // Restores preferences from an in-memory chrome.storage stand-in, as a surface does on load.
        async restore(stored) {
          if (stored !== undefined) {
            const data = this.storage = { react_panel_preferences: stored };
            window.XRAY_Store = { get: async (key, fallback) => (key in data ? structuredClone(data[key]) : fallback), set: async (key, value) => { data[key] = structuredClone(value); } };
          }
          await usePanelStore.getState().restorePreferences();
          return this.storage.react_panel_preferences;
        },
        toasts() { return [...this.root.querySelectorAll('.xray-toast')].map(el => el.textContent); },
        // The theme-refresh notice has its own class: .xray-notice is the shared in-flow callout (Notice.tsx).
        notices() { return [...this.root.querySelectorAll('.xray-theme-notice')].map(el => el.querySelector('span').textContent); },
        // A captured session to style: a selected 200 with a JSON body (its tree has booleans, the
        // mauve data colour), a 500 and a slow call, plus a console command with a table result.
        seed() {
          const s = usePanelStore.getState();
          const t = 1760000000000;
          const users = [{ id: 1, name: 'Ada Lovelace', active: true, manager: null }, { id: 2, name: 'Linus Torvalds', active: false, manager: 1 }];
          const base = { type: 'api', source: 'fetch', size: 512, requestHeaders: {}, responseHeaders: { 'content-type': 'application/json' } };
          flushSync(() => {
            s.addEntry({ ...base, id: 'report', method: 'GET', status: 200, url: 'https://example.test/api/report', urlPath: '/api/report', timestamp: t, duration: 1300, responseRaw: '{"rows":[]}' });
            s.addEntry({ ...base, id: 'orders', method: 'POST', status: 500, url: 'https://example.test/api/orders', urlPath: '/api/orders', timestamp: t + 1, duration: 12, responseRaw: '{"error":"boom"}' });
            s.addEntry({ ...base, id: 'users', method: 'GET', status: 200, url: 'https://example.test/api/users', urlPath: '/api/users', timestamp: t + 2, duration: 42, responseRaw: JSON.stringify({ users }) });
            s.addConsoleEvent({ id: 'cmd_seed', type: 'command', level: 'info', timestamp: t, message: 'res.users', args: ['res.users'], commandId: 'cmd_seed' });
            s.addConsoleEvent({ id: 'res_cmd_seed', type: 'result', level: 'info', timestamp: t, message: 'Array(2)', data: users, commandId: 'cmd_seed', durationMs: 9, resultType: 'array' });
            usePanelStore.setState({ selectedId: 'users', apiDetailOpen: true, detailTab: 'response', detailView: 'tree' });
          });
        },
        // The categorical chrome (spec S1 + ruling): a GraphQL call, a drifted response (selected, so
        // its banner shows; its body keeps a boolean for the mauve scan), a pinned request and a
        // console pin chip.
        seedChrome() {
          const s = usePanelStore.getState();
          const t = 1760000000100;
          const base = { type: 'api', source: 'fetch', size: 256, requestHeaders: {}, responseHeaders: { 'content-type': 'application/json' } };
          flushSync(() => {
            s.addEntry({ ...base, id: 'gql', method: 'POST', status: 200, url: 'https://example.test/graphql', urlPath: '/graphql', timestamp: t, duration: 30, responseRaw: '{"data":{"user":null}}', graphql: { operationType: 'query', operationName: 'GetUser' } });
            // Its body also repeats a key and holds a number JavaScript cannot represent (JSON tags).
            s.addEntry({ ...base, id: 'drifted', method: 'GET', status: 200, url: 'https://example.test/api/users', urlPath: '/api/users', timestamp: t + 1, duration: 20, responseRaw: '{"people":[],"ok":true,"id":1,"id":2,"big":9007199254740993}', driftFromId: 'users' });
            // A repeated page log (×2 badge) and a truncated one.
            for (const id of ['tick_1', 'tick_2']) s.addConsoleEvent({ id, type: 'log', level: 'info', timestamp: t + 2, message: 'tick', args: ['tick'] });
            s.addConsoleEvent({ id: 'big_log', type: 'log', level: 'info', timestamp: t + 3, message: 'big payload', args: ['big payload'], truncated: true });
            usePanelStore.setState({ pinnedIds: new Set(['report']), consolePins: [{ name: 'p1', entryId: 'users' }], selectedId: 'drifted', apiDetailOpen: true, detailTab: 'response', detailView: 'tree' });
          });
        },
        // Spec S1/S3 facts for the open tab: unboxed method/status, borderless tinted flags and
        // badges, icon buttons outlined only on hover/focus, the calmer column header.
        unboxed() {
          const panel = this.root.querySelector('.xray-panel');
          (this.root.activeElement || document.activeElement)?.blur?.();
          const cs = el => getComputedStyle(el);
          const sig = el => el.tagName.toLowerCase() + [...el.classList].map(c => '.' + c).join('') + (el.getAttribute('aria-label') ? '[' + el.getAttribute('aria-label') + ']' : '');
          const visible = el => { const r = el.getBoundingClientRect(); return r.width >= 1 && r.height >= 1; };
          // A drawn border: some side with a style, a width and a colour that is not transparent.
          const border = el => {
            const s = cs(el);
            return ['Top', 'Right', 'Bottom', 'Left'].filter(side => s['border' + side + 'Style'] !== 'none' && parseFloat(s['border' + side + 'Width']) > 0 && parseColour(s['border' + side + 'Color'])[3] > 0)
              .map(side => side.toLowerCase() + ' ' + s['border' + side + 'Width'] + ' ' + s['border' + side + 'Color']);
          };
          const all = sel => [...panel.querySelectorAll(sel)].filter(visible);
          const head = panel.querySelector('.xray-api-table-head');
          return {
            pills: all('.xray-api-row .xray-method, .xray-api-row .xray-status, .xray-response-chip').map(el => ({ el: sig(el), border: border(el), weight: +cs(el).fontWeight })),
            flags: all('.xray-api-flag, .xray-badge, .xray-repeat-badge, .xray-truncated-badge, .xray-json-tag').map(el => ({ el: sig(el) + ' ' + el.textContent.trim(), border: border(el), weight: +cs(el).fontWeight, bg: parseColour(cs(el).backgroundColor) })),
            // Idle icon(-only) buttons: no outline and no resting fill (pressed/expanded/primary keep theirs).
            idleIcons: all('.xray-icon-btn:not(.active):not(:disabled):not([aria-pressed="true"]), .xray-detail-action:not(.primary):not([aria-expanded="true"]), .xray-editor-expand:not([aria-pressed="true"]), .xray-prompt-help:not(:disabled)')
              .map(el => ({ el: sig(el), border: border(el), fill: parseColour(cs(el).backgroundColor)[3] })).filter(x => x.border.length || x.fill > 0),
            head: head && { weight: +cs(head).fontWeight, transform: cs(head).textTransform, spacing: cs(head).letterSpacing },
          };
        },
        // The icon button an E2E hovers or focuses: its centre, and its drawn border afterwards.
        iconBox(label) {
          const el = this.root.querySelector('[aria-label="' + label + '"]');
          const r = el.getBoundingClientRect();
          return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        },
        iconBorder(label, focus) {
          const el = this.root.querySelector('[aria-label="' + label + '"]');
          if (focus) el.focus();
          const s = getComputedStyle(el);
          const probe = el.appendChild(document.createElement('i'));
          probe.style.color = 'var(--xray-border)';
          const token = getComputedStyle(probe).color;
          probe.remove();
          const out = { style: s.borderTopStyle, width: parseFloat(s.borderTopWidth), color: parseColour(s.borderTopColor), token: parseColour(token), fill: parseColour(s.backgroundColor)[3], focusVisible: el.matches(':focus-visible') };
          if (focus) el.blur();
          return out;
        },
        // Every rendered element (and drawn ::before/::after) under the surface root heavier than 700.
        heavy() {
          const found = [];
          for (const el of this.root.querySelectorAll('*')) {
            const r = el.getBoundingClientRect();
            if (r.width < 1 || r.height < 1) continue;
            const sig = el.tagName.toLowerCase() + [...el.classList].map(c => '.' + c).join('');
            if (+getComputedStyle(el).fontWeight > 700) found.push(sig + ' ' + getComputedStyle(el).fontWeight);
            for (const pseudo of ['::before', '::after']) {
              const p = getComputedStyle(el, pseudo);
              if (!['none', 'normal'].includes(p.content) && +p.fontWeight > 700) found.push(sig + pseudo + ' ' + p.fontWeight);
            }
          }
          return [...new Set(found)];
        },
        // Spec S3 type facts: statusbar weight, section titles / h4 (600, real case), Settings nav group labels (uppercase).
        type() {
          const cs = el => getComputedStyle(el);
          const visible = el => { const r = el.getBoundingClientRect(); return r.width >= 1 && r.height >= 1; };
          const pick = sel => [...this.root.querySelectorAll(sel)].filter(visible).map(el => ({ el: el.tagName.toLowerCase() + [...el.classList].map(c => '.' + c).join('') + ' ' + el.textContent.trim().slice(0, 24), weight: +cs(el).fontWeight, transform: cs(el).textTransform }));
          return { statusbar: pick('.xray-statusbar'), titles: pick('.xray-settings-section-title, .xray-danger-title, h4'), groups: pick('.xray-settings-nav-group-title') };
        },
        // Spec S2 type roles: what --xray-font-ui and --xray-font (the Font stack setting) resolve to
        // here, the computed font-family of the named chrome and data elements, and every rendered
        // text element (or text field) that computes neither stack.
        fonts(chrome, data) {
          const scope = this.root.querySelector('.xray-theme-scope');
          const probe = scope.appendChild(document.createElement('i'));
          const resolve = value => { probe.style.fontFamily = value; return getComputedStyle(probe).fontFamily; };
          const ui = resolve('var(--xray-font-ui)');
          const mono = resolve('var(--xray-font)');
          probe.remove();
          const visible = el => { const r = el.getBoundingClientRect(); return r.width >= 1 && r.height >= 1; };
          const sig = el => el.tagName.toLowerCase() + [...el.classList].map(c => '.' + c).join('') + ' "' + (el.value ?? el.textContent).trim().slice(0, 24) + '"';
          const pick = sel => [...scope.querySelectorAll(sel)].filter(visible).map(el => ({ el: sig(el), family: getComputedStyle(el).fontFamily }));
          const field = el => el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || (el.tagName === 'INPUT' && !['range', 'checkbox', 'radio', 'color'].includes(el.type));
          const stray = [];
          for (const el of scope.querySelectorAll('*')) {
            if (!visible(el) || !(field(el) || [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()))) continue;
            const family = getComputedStyle(el).fontFamily;
            if (family !== ui && family !== mono) stray.push(sig(el) + ' ' + family);
          }
          return { ui, mono, chrome: pick(chrome), data: pick(data), stray: [...new Set(stray)] };
        },
        // Spec S2 watch-out: does the chrome still fit? The tablist (a silent horizontal scroller)
        // and its tabs and labels, the chrome rows and their controls, fixed-width controls whose
        // content outgrows them, and the panel's own sideways scroll.
        fit() {
          const panel = this.root.querySelector('.xray-panel');
          const visible = el => { const r = el.getBoundingClientRect(); return r.width >= 1 && r.height >= 1; };
          const sig = el => el.tagName.toLowerCase() + [...el.classList].map(c => '.' + c).join('') + ' "' + (el.getAttribute('aria-label') || el.textContent.trim()).slice(0, 24) + '"';
          const inside = (a, b) => a.left >= b.left - 0.5 && a.right <= b.right + 0.5;
          const list = panel.querySelector('.xray-tabs');
          const box = list.getBoundingClientRect();
          const tabs = [...list.querySelectorAll('.xray-tab')].filter(visible);
          const labels = tabs.map(tab => [tab, tab.querySelector('span:not(.xray-badge)')]).filter(([, label]) => label && visible(label));
          const rows = {};
          for (const sel of ['.xray-topbar', '.xray-api-summary-line', '.xray-api-toolbar', '.xray-page-head', '.xray-detail-nav', '.xray-detail-hero', '.xray-statusbar']) {
            const row = [...panel.querySelectorAll(sel)].find(visible);
            if (!row) continue;
            const r = row.getBoundingClientRect();
            rows[sel] = { overflow: Math.max(0, row.scrollWidth - row.clientWidth), outside: [...row.querySelectorAll('button, select, input, .xray-chip')].filter(visible).filter(el => !el.closest('.xray-tabs') && !inside(el.getBoundingClientRect(), r)).map(sig) };
          }
          const controls = [...panel.querySelectorAll('button, select, .xray-chip, .xray-statusbar > *')].filter(visible);
          return {
            tabs: tabs.length,
            labels: labels.length,
            tabsOverflow: Math.max(0, list.scrollWidth - list.clientWidth),
            tabsOutside: tabs.filter(tab => !inside(tab.getBoundingClientRect(), box)).map(sig),
            labelsCut: labels.filter(([tab, label]) => !inside(label.getBoundingClientRect(), tab.getBoundingClientRect()) || label.scrollWidth > label.clientWidth + 1).map(([, label]) => sig(label)),
            rows,
            clipped: controls.filter(el => el.scrollWidth > el.clientWidth + 1).map(sig),
            panelOverflow: panel.scrollWidth - panel.clientWidth,
            width: Math.round(panel.getBoundingClientRect().width),
          };
        },
        // The pre-S2 state for the fit comparison: chrome back on the mono stack.
        monoChrome(on) { this.root.querySelector('.xray-theme-scope').style.setProperty('--xray-font-ui', on ? 'var(--xray-font)' : ''); },
        navItems() { return [...this.root.querySelectorAll('.xray-settings-nav-item')].map(el => el.textContent.trim()); },
        nav(i) { flushSync(() => this.root.querySelectorAll('.xray-settings-nav-item')[i].click()); },
        // Computed calm-accent facts (spec A1–A3) for the open tab: tokens resolved in the panel, the
        // marked states, the flat surfaces, and every element painted with the accent or with mauve.
        calm() {
          const root = this.root;
          const panel = root.querySelector('.xray-panel');
          (root.activeElement || document.activeElement)?.blur?.();
          const parse = parseColour;
          const colours = coloursIn;
          const probe = panel.appendChild(document.createElement('i'));
          const token = name => { probe.style.color = 'var(--xray-' + name + ')'; return parse(getComputedStyle(probe).color); };
          const tokens = Object.fromEntries(['accent', 'mauve', 'hint', 'border', 'text', 'focus'].map(name => [name, token(name)]));
          probe.remove();
          const same = (a, b) => !!a && !!b && a[3] > 0 && [0, 1, 2].every(i => Math.abs(a[i] - b[i]) < 1.5);
          const cs = el => getComputedStyle(el);
          const sig = el => el.tagName.toLowerCase() + [...el.classList].map(c => '.' + c).join('');
          // Every colour an element paints: text, fill, drawn borders and outline, shadows, gradient stops.
          const painted = el => {
            const s = cs(el);
            const out = [['color', parse(s.color)], ['background', parse(s.backgroundColor)]];
            for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
              if (s['border' + side + 'Style'] !== 'none' && parseFloat(s['border' + side + 'Width']) > 0) out.push(['border-' + side.toLowerCase(), parse(s['border' + side + 'Color'])]);
            }
            if (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) out.push(['outline', parse(s.outlineColor)]);
            for (const c of colours(s.boxShadow)) out.push(['box-shadow', c]);
            for (const c of colours(s.backgroundImage)) out.push(['background-image', c]);
            return out;
          };
          // The scans walk the whole theme scope: the panel and every open sibling modal (final review M-4a).
          const scope = root.querySelector('.xray-theme-scope');
          const scan = (colour, allowed) => {
            const found = [];
            let data = 0;
            for (const el of scope.querySelectorAll('*')) {
              const r = el.getBoundingClientRect();
              if (r.width < 1 || r.height < 1) continue;
              const hits = painted(el).filter(([, c]) => same(c, colour)).map(([prop]) => prop);
              if (!hits.length) continue;
              if (el.closest(allowed)) { data += 1; continue; }
              found.push(sig(el) + ' {' + hits.join(', ') + '}');
            }
            return { stray: [...new Set(found)], allowed: data };
          };
          const one = sel => panel.querySelector(sel);
          const tab = one('.xray-tab.active');
          const selected = one('.xray-api-row.selected');
          const primary = one('.xray-action-btn.primary:not(:disabled), .xray-btn.primary:not(:disabled)');
          return {
            tokens,
            glow: usePanelStore.getState().settings.glow,
            before: getComputedStyle(panel, '::before').backgroundImage,
            head: one('.xray-api-table-head') && parse(cs(one('.xray-api-table-head')).color),
            th: [...panel.querySelectorAll('.xray-table th')].map(el => parse(cs(el).color)),
            chips: [...panel.querySelectorAll('.xray-api-toolbar .xray-filter-chips .xray-chip')].map(el => ({ text: el.textContent.trim(), active: el.classList.contains('active'), border: parse(cs(el).borderTopColor), bg: parse(cs(el).backgroundColor) })),
            activeTab: tab && { border: parse(cs(tab).borderTopColor), bg: parse(cs(tab).backgroundColor), indicator: parse(getComputedStyle(tab, '::after').backgroundColor), halo: cs(tab).boxShadow },
            selectedRow: selected && { image: cs(selected).backgroundImage, bg: parse(cs(selected).backgroundColor), shadow: colours(cs(selected).boxShadow) },
            primary: primary && { label: primary.textContent.trim(), image: cs(primary).backgroundImage, bg: parse(cs(primary).backgroundColor), color: parse(cs(primary).color) },
            commandCell: one('.xray-command-cell') && painted(one('.xray-command-cell')),
            // A3: these surfaces are flat token colours (no gradient or radial wash).
            flat: Object.fromEntries(['.xray-topbar', '.xray-body', '.xray-api-workspace', '.xray-console-workspace', '.xray-api-collection-pane', '.xray-request-detail', '.xray-detail-hero', '.xray-detail-nav', '.xray-detail-content', '.xray-api-row:not(.selected)', '.xray-json', '.xray-command-cell', '.xray-brand-mark']
              .filter(sel => one(sel)).map(sel => [sel, cs(one(sel)).backgroundImage])),
            // A2: mauve paints data only (JSON values, methods).
            mauve: scan(tokens.mauve, '.xray-json-bool, .xray-method'),
            // A1: the accent paints only the active tab, the primary button, the selection bar, links,
            // on/off controls, the active Settings item and theme swatch (focus rings: nothing is focused).
            // In the modals: the active command-palette row and Compare's equal-fields link (A1 states and
            // links). The pickers' colour samples are data: each paints the colour it would apply.
            accent: scan(tokens.accent, '.xray-tab.active, .xray-btn.primary, .xray-action-btn.primary, .xray-api-row.selected, .xray-entry-row.selected, .xray-json-flatrow[aria-selected="true"], .xray-link-btn, .xray-context-change, .xray-switch:checked, .xray-toggle.on, .xray-settings-nav-item.active, .xray-theme-swatch.active, .xray-command-row.active, .xray-compare-equal-toggle, .xray-color-swatch, .xray-theme-swatch-dot'),
          };
        },
        // High Contrast states (Review Focus): the active tab, the selected row and a focus ring, each
        // against what it sits on, plus the unmarked counterparts they must differ from.
        states() {
          const panel = this.root.querySelector('.xray-panel');
          const cs = el => getComputedStyle(el);
          const tab = panel.querySelector('.xray-tab.active');
          const idle = panel.querySelector('.xray-tab:not(.active)');
          const row = panel.querySelector('.xray-api-row.selected');
          const plain = panel.querySelector('.xray-api-row:not(.selected)');
          // The selection bar: the opaque inset shadow (a glow, when on, is translucent and outset).
          const bar = coloursIn(cs(row).boxShadow).find(c => c[3] >= 0.999);
          const out = {
            tab: { bg: cs(tab).backgroundColor, idleBg: cs(idle).backgroundColor, border: cs(tab).borderTopColor, idleBorder: cs(idle).borderTopColor,
              text: ratio(parseColour(cs(tab).color), under(tab)), indicator: ratio(parseColour(getComputedStyle(tab, '::after').backgroundColor), under(tab.parentElement)) },
            row: { bg: cs(row).backgroundColor, plainBg: cs(plain).backgroundColor, bar: bar ? ratio(bar, under(row)) : 0,
              text: ratio(parseColour(cs(row.querySelector('.xray-path')).color), under(row)), shadow: cs(row).boxShadow, plainShadow: cs(plain).boxShadow },
          };
          // Keyboard focus on an inactive top tab and on the request list.
          for (const [key, el] of [['tabFocus', idle], ['listFocus', panel.querySelector('.xray-api-table-scroll')]]) {
            el.focus();
            const s = cs(el);
            out[key] = { visible: el.matches(':focus-visible'), style: s.outlineStyle, width: parseFloat(s.outlineWidth), color: s.outlineColor,
              ring: ratio(parseColour(s.outlineColor), under(el.parentElement)), activeTabOutline: cs(tab).outlineStyle };
            el.blur();
          }
          return out;
        },
        // Spec S4–S6 facts for the open screen: each token resolved in the panel; the fill each named
        // element paints (S6: a flat token, so an exact, opaque match); a hovered row's fill; the
        // colour of JSON null and of an in-flight status (S5); and every drawn line whose colour is
        // not one of the line or state tokens (S4).
        layers(sels) {
          const root = this.root;
          const panel = root.querySelector('.xray-panel');
          const probe = panel.appendChild(document.createElement('i'));
          const names = ['bg', 'surface', 'surface2', 'surface3', 'selection', 'hover', 'active', 'neutral', 'pending', 'border', 'border-control', 'focus', 'accent', 'text', 'subtext', 'hint', 'disabled', 'red', 'yellow', 'green', 'blue', 'peach', 'teal', 'mauve', 'operator-grid'];
          const tokens = {};
          for (const name of names) { probe.style.color = 'var(--xray-' + name + ')'; tokens[name] = parseColour(getComputedStyle(probe).color); }
          probe.remove();
          const visible = el => { const r = el.getBoundingClientRect(); return r.width >= 1 && r.height >= 1; };
          const sig = el => el.tagName.toLowerCase() + [...el.classList].map(c => '.' + c).join('');
          const fills = {};
          for (const sel of sels) {
            const el = [...root.querySelectorAll(sel)].find(visible);
            fills[sel] = el ? parseColour(getComputedStyle(el).backgroundColor) : null;
          }
          const one = sel => [...root.querySelectorAll(sel)].find(visible);
          const nul = one('.xray-json-null');
          const pending = one('.xray-api-row .xray-status.pending');
          const same = (a, b) => !!a && !!b && [0, 1, 2].every(i => Math.abs(a[i] - b[i]) < 1.5);
          // Line tokens, state colours that a line itself carries (focus, accent, status), and the text
          // colour, which rings a chosen swatch (the swatch is filled with the accent, so an accent ring
          // would vanish).
          const lineTokens = ['border', 'border-control', 'focus', 'accent', 'disabled', 'text', 'red', 'yellow', 'green', 'blue', 'peach', 'teal', 'mauve', 'pending'];
          const strayLines = [];
          let lines = 0;
          for (const el of root.querySelectorAll('*')) {
            if (!visible(el)) continue;
            const s = getComputedStyle(el);
            const drawn = [];
            for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
              if (s['border' + side + 'Style'] !== 'none' && parseFloat(s['border' + side + 'Width']) > 0) drawn.push(['border-' + side.toLowerCase(), s['border' + side + 'Color']]);
            }
            if (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) drawn.push(['outline', s.outlineColor]);
            for (const [prop, value] of drawn) {
              const c = parseColour(value);
              if (!c || c[3] === 0) continue;
              lines += 1;
              if (!lineTokens.some(name => same(c, tokens[name]))) strayLines.push(sig(el) + ' {' + prop + ': ' + value + '}');
            }
          }
          return { tokens, fills, nul: nul && parseColour(getComputedStyle(nul).color), pending: pending && parseColour(getComputedStyle(pending).color), lines, strayLines: [...new Set(strayLines)] };
        },
        rowBox(sel) {
          const el = [...this.root.querySelectorAll(sel)].find(x => x.getBoundingClientRect().height > 0);
          el.scrollIntoView({ block: 'center' });
          const r = el.getBoundingClientRect();
          return { x: r.left + Math.min(40, r.width / 2), y: r.top + r.height / 2 };
        },
        fill(sel) { const el = this.root.querySelector(sel); return el && parseColour(getComputedStyle(el).backgroundColor); },
        glowGrid() { return coloursIn(getComputedStyle(this.root.querySelector('.xray-panel'), '::before').backgroundImage); },
        // An in-flight request (no response yet, so no status): spec S5 paints its status --xray-pending.
        seedPending() {
          flushSync(() => usePanelStore.getState().addEntry({ type: 'api', source: 'fetch', id: 'inflight', method: 'GET', url: 'https://example.test/api/slow', urlPath: '/api/slow', timestamp: 1760000000300, requestHeaders: {}, responseHeaders: {} }));
        },
        moreActions() { flushSync(() => this.root.querySelector('[aria-label="More actions"]').click()); },
        // A console command whose run was cancelled, on the Console tab.
        seedCancelled() {
          const s = usePanelStore.getState();
          flushSync(() => {
            s.addConsoleEvent({ id: 'cmd_cancel', type: 'command', level: 'info', timestamp: 1760000000500, message: 'await slow()', args: ['await slow()'], commandId: 'cmd_cancel' });
            s.addConsoleEvent({ id: 'res_cmd_cancel', type: 'result', level: 'info', timestamp: 1760000000501, message: 'Cancelled', commandId: 'cmd_cancel', cancelled: true });
            s.setActiveTab('console');
          });
        },
        // A FormData POST, open on its Request facet: the body shows an info notice (Task 6 fix round).
        seedForm() {
          const s = usePanelStore.getState();
          flushSync(() => {
            s.addEntry({ type: 'api', source: 'fetch', id: 'form', method: 'POST', status: 200, url: 'https://example.test/api/upload', urlPath: '/api/upload', timestamp: 1760000000400, duration: 20, size: 4, requestHeaders: {}, responseHeaders: {}, requestBodyKind: 'formdata', requestBodyText: 'a=1', requestBody: [['a', '1']], responseRaw: '{}' });
            usePanelStore.setState({ selectedId: 'form', apiDetailOpen: true, detailTab: 'request' });
          });
        },
        // The drawn top border of the first visible element, and the token it should be.
        edge(sel, token) {
          const el = [...this.root.querySelectorAll(sel)].find(x => x.getBoundingClientRect().height > 0);
          if (!el) return null;
          const s = getComputedStyle(el);
          const probe = el.appendChild(document.createElement('i'));
          probe.style.color = 'var(--xray-' + token + ')';
          const want = parseColour(getComputedStyle(probe).color);
          probe.remove();
          return { style: s.borderTopStyle, width: parseFloat(s.borderTopWidth), color: parseColour(s.borderTopColor), want };
        },
        setOpen(open) { flushSync(() => usePanelStore.getState().setOpen(open)); },
        toast(message) { flushSync(() => usePanelStore.getState().showToast(message)); },
        open() { flushSync(() => usePanelStore.getState().openSettings('appearance')); },
        close() { flushSync(() => usePanelStore.getState().setSettingsOpen(false)); },
        tab(tab) { flushSync(() => usePanelStore.getState().setActiveTab(tab)); },
        detail(tab) { flushSync(() => usePanelStore.setState(tab === 'timing' ? { detailTab: 'response', detailView: 'waterfall' } : { detailTab: tab, ...(tab === 'response' ? { detailView: 'tree' } : {}) })); },
        listOnly() { flushSync(() => usePanelStore.setState({ apiDetailOpen: false })); },
        // A page log, selected on the Logs tab so its detail (message, time) shows.
        logSeed() {
          const s = usePanelStore.getState();
          flushSync(() => { s.addEntry({ id: 'log_seed', type: 'log', logLevel: 'warn', source: 'console', timestamp: 1760000000200, message: 'GET /api/users took 1300ms', args: ['GET /api/users took 1300ms'] }); s.setActiveTab('logs'); });
          flushSync(() => usePanelStore.getState().selectEntry('log_seed', { openDetail: true }));
        },
        replay(open) { flushSync(() => usePanelStore.getState().openReplayEditor(open ? usePanelStore.getState().entries.find(e => e.id === 'users') : null)); },
        draft(text) { flushSync(() => usePanelStore.getState().setConsoleDraft(text)); },
        click(text) {
          const button = [...this.root.querySelectorAll('button')].find(el => el.textContent.trim() === text || el.getAttribute('aria-label') === text);
          if (!button) throw new Error('Missing control: ' + text);
          flushSync(() => button.click());
        },
        focus(label) { this.root.querySelector('[aria-label="' + label + '"]').focus(); },
        // Final fix wave helpers. Opens Compare with the given sides (none: an empty comparison).
        compare(left, right) {
          const s = usePanelStore.getState();
          flushSync(() => { if (left) s.setComparisonEntry('left', left); if (right) s.setComparisonEntry('right', right); s.openComparison(); });
        },
        closeCompare() { flushSync(() => usePanelStore.getState().closeComparison()); },
        palette(open) { flushSync(() => usePanelStore.getState().setCommandOpen(open)); },
        // The JSON value colours painted inside the first element matching scopeSel, and the data
        // tokens resolved there (spec A2: numbers --xray-peach, booleans --xray-mauve).
        jsonColours(scopeSel) {
          const scope = this.root.querySelector(scopeSel);
          if (!scope) return null;
          const probe = scope.appendChild(document.createElement('i'));
          const token = name => { probe.style.color = 'var(--xray-' + name + ')'; return parseColour(getComputedStyle(probe).color); };
          const tokens = { peach: token('peach'), mauve: token('mauve'), green: token('green') };
          probe.remove();
          const visible = el => { const r = el.getBoundingClientRect(); return r.width >= 1 && r.height >= 1; };
          const pick = sel => [...scope.querySelectorAll(sel)].filter(visible).map(el => parseColour(getComputedStyle(el).color));
          return { tokens, number: pick('.xray-json-number'), bool: pick('.xray-json-bool'), string: pick('.xray-json-string') };
        },
        // A list's keyboard focus ring (the request list, the Logs listbox), focused as the keyboard does.
        listRing(sel) {
          const el = this.root.querySelector(sel);
          el.focus();
          const s = getComputedStyle(el);
          const probe = el.appendChild(document.createElement('i'));
          probe.style.color = 'var(--xray-focus)';
          const focus = parseColour(getComputedStyle(probe).color);
          probe.remove();
          const out = { visible: el.matches(':focus-visible'), style: s.outlineStyle, width: parseFloat(s.outlineWidth), offset: parseFloat(s.outlineOffset), color: parseColour(s.outlineColor), focus, shadow: s.boxShadow, ring: ratio(parseColour(s.outlineColor), under(el)) };
          el.blur();
          return out;
        },
        // Where the theme-refresh notice sits: its box, the panel's and the console Run button's.
        noticeGeometry() {
          const box = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom }; };
          const notice = this.root.querySelector('.xray-theme-notice');
          return { notice: box(notice), panel: box(this.root.querySelector('.xray-panel')), run: box(this.root.querySelector('.xray-console-run')), inPanel: !!notice && !!notice.closest('.xray-panel'), position: notice && getComputedStyle(notice).position };
        },
        // A button at rest: its classes, drawn border sides, fill alpha and text colour, and the accent.
        restLook(sel) {
          const el = this.root.querySelector(sel);
          if (!el) return null;
          (this.root.activeElement || document.activeElement)?.blur?.();
          const s = getComputedStyle(el);
          const probe = el.appendChild(document.createElement('i'));
          probe.style.color = 'var(--xray-accent)';
          const accent = parseColour(getComputedStyle(probe).color);
          probe.remove();
          const border = ['Top', 'Right', 'Bottom', 'Left'].filter(side => s['border' + side + 'Style'] !== 'none' && parseFloat(s['border' + side + 'Width']) > 0 && parseColour(s['border' + side + 'Color'])[3] > 0);
          return { className: el.className, border, fill: parseColour(s.backgroundColor)[3], color: parseColour(s.color), accent };
        },
        // A button's look: its text colour and cursor, and the --xray-disabled token resolved on it.
        look(label) {
          const el = [...this.root.querySelectorAll('button')].find(b => b.getAttribute('aria-label') === label || b.textContent.trim() === label);
          if (!el) return null;
          const probe = el.appendChild(document.createElement('i'));
          probe.style.color = 'var(--xray-disabled)';
          const token = parseColour(getComputedStyle(probe).color);
          probe.remove();
          const s = getComputedStyle(el);
          return { disabled: el.disabled, color: parseColour(s.color), cursor: s.cursor, token };
        },
        // A table cell's text colour and font, the document's rendering mode (quirks-mode host
        // pages reset colour and font size on tables), and what the table's container computes.
        tableText(sel) {
          const el = [...this.root.querySelectorAll(sel)].find(x => x.getBoundingClientRect().height > 0);
          if (!el) return null;
          const s = getComputedStyle(el);
          const outer = getComputedStyle(el.closest('table').parentElement);
          return { color: s.color, family: s.fontFamily, size: s.fontSize, outerColor: outer.color, mode: document.compatMode };
        },
        snapshot() {
          const s = usePanelStore.getState();
          const props = el => {
            if (!el) return null;
            const cs = getComputedStyle(el);
            return Object.fromEntries(['bg', 'surface', 'surface2', 'surface3', 'text', 'subtext', 'hint', 'border', 'border-control', 'focus', 'selection', 'hover', 'active', 'disabled', 'accent', 'accent-soft', 'green', 'yellow', 'red', 'blue', 'pending', 'neutral', 'shadow', 'overlay'].map(key => [key, cs.getPropertyValue('--xray-' + key).trim()]));
          };
          const panel = this.root.querySelector('.xray-panel');
          const dialog = this.root.querySelector('[role="dialog"]');
          const active = this.root instanceof ShadowRoot ? this.root.activeElement : document.activeElement;
          return { settings: s.settings, toast: s.toastMessage, accentPressed: [...this.root.querySelectorAll('.xray-color-row [aria-pressed="true"]')].map(el => el.getAttribute('aria-label')), swatchBg: Object.fromEntries([...this.root.querySelectorAll('.xray-color-swatch')].map(el => [el.getAttribute('aria-label'), el.style.background])), panel: props(panel), dialog: props(dialog), buttons: [...this.root.querySelectorAll('button')].map(el => el.textContent.trim()), swatches: [...this.root.querySelectorAll('.xray-theme-swatch-label')].map(el => el.textContent.trim()), pressed: [...this.root.querySelectorAll('.xray-theme-swatch[aria-pressed="true"]')].map(el => el.textContent.trim()), scopeClass: this.root.querySelector('.xray-theme-scope')?.className ?? '', panelClass: panel.className, promptBg: panel.querySelector('.xray-prompt .xray-editor-field') ? getComputedStyle(panel.querySelector('.xray-prompt .xray-editor-field')).backgroundColor : null, focusedOutline: active ? getComputedStyle(active).outlineStyle : null, motion: dialog ? getComputedStyle(dialog).animationName : null, hostBg: getComputedStyle(document.querySelector('#host-page')).backgroundColor };
        },
        share() { const s = usePanelStore.getState().settings; return encodeTheme({ colors: s.customTheme, font: s.font, radius: s.radius, hacker: s.hacker }); },
        hash(code) { this.settings(themePackageToSettings(decodeTheme('#theme=' + code))); },
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
const screenshotDir = '/tmp/omnirush/xray-theme-visual-system';
// Spec P1: the picker's presets in order, each with its block's --xray-bg and its own --xray-accent (P2).
const LINEUP = [
  ['XRAY Dark', 'xray-dark', '#141517', '#3dc8f5'], ['XRAY Light', 'xray-light', '#f3f4f6', '#00698f'], ['GitHub Dark', 'github-dark', '#0d1117', '#5297ff'],
  ['GitHub Light', 'github-light', '#f6f8fa', '#005eca'], ['Tokyo Night', 'tokyo-night', '#16161e', '#7ba4f9'], ['Catppuccin Mocha', 'catppuccin-mocha', '#181825', '#cba6f7'],
  ['Dracula', 'dracula', '#21222c', '#c59dff'], ['Gruvbox Dark', 'gruvbox-dark', '#1d2021', '#8ec07c'], ['High Contrast', 'midnight', '#000000', '#00e5ff'],
];
const rgbOf = hex => `rgb(${[1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(', ')})`;
// Two painted colours are the same hue source when their channels match (any alpha: a tint of the
// accent is the accent at a lower alpha); a fully transparent colour paints nothing.
const same = (a, b) => !!a && !!b && a[3] > 0 && [0, 1, 2].every(i => Math.abs(a[i] - b[i]) < 1.5);
const fmt = c => (c ? `rgba(${c.slice(0, 3).map(Math.round).join(', ')}, ${+c[3].toFixed(2)})` : String(c));
// The colours named in a computed box-shadow / background-image, as [r, g, b, a] (0..255, 0..1).
const coloursOf = text => (String(text).match(/color\(srgb[^)]*\)|rgba?\([^)]*\)/g) || []).map(c => {
  const srgb = c.match(/^color\(srgb\s+([-\d.e]+)\s+([-\d.e]+)\s+([-\d.e]+)(?:\s*\/\s*([-\d.e]+))?\)$/);
  if (srgb) return [srgb[1] * 255, srgb[2] * 255, srgb[3] * 255, srgb[4] == null ? 1 : +srgb[4]];
  const rgb = c.match(/[-\d.]+/g).map(Number);
  return [rgb[0], rgb[1], rgb[2], rgb[3] ?? 1];
});
const NOTICE = label => `Themes were refreshed — you're on ${label}. Change it in Settings → Appearance.`;
const snapshot = page => page.evaluate(() => window.themeTest.snapshot());
// The floating HUD's own sheet (closed shadow root, container-sized chrome).
const hudCss = readFileSync(new URL('../../src/panel/styles/hud.css', import.meta.url), 'utf8');
// A HUD is a box of its own width on a wider page (the panel caps itself at 96vw of the page); the
// panel's root is inline (`all: initial`), so the nearest block — here the body — sizes it, as the
// HUD frame does in the extension.
// `quirks`: the host page has no doctype (a real site can render in quirks mode; the panel must not care).
async function fixture(t, shadow, mode = 'window', width = 960, { quirks = false } = {}) {
  const page = await browser.newPage({ viewport: { width: mode === 'hud' ? 1280 : width, height: 760 }, reducedMotion: 'reduce' });
  t.after(() => page.close());
  const host = (mode === 'hud' ? `<style>body { margin: 0; overflow: hidden; width: ${width}px; height: 700px; }</style>` : '') + '<div id="host-page" style="background:rgb(12, 34, 56)">Host page</div>';
  await (quirks ? page.setContent(host) : setStandardsContent(page, host));
  await page.addScriptTag({ content: outputFiles[0].text });
  await page.evaluate(({ shadow, css, mode }) => window.themeTest.setup(shadow, css, mode), { shadow, css: mode === 'hud' ? css + '\n' + hudCss : css, mode });
  return page;
}

for (const shadow of [false, true]) {
  const surface = shadow ? 'closed shadow' : 'document';
  test(`preset overview supplies complete semantic roles and readable layering (${surface})`, async t => {
    const page = await fixture(t, shadow);
    await page.evaluate(() => window.themeTest.open());
    for (const [label, theme, bg] of LINEUP) {
      await page.evaluate(label => window.themeTest.click(label), label);
      const state = await snapshot(page);
      assert.equal(state.settings.theme, theme);
      assert.equal(state.panel.bg, bg);
      for (const [key, value] of Object.entries(state.panel)) assert.notEqual(value, '', `${label}: ${key} is missing`);
      assert.notEqual(state.panel.bg, state.panel.surface);
      assert.notEqual(state.panel.surface, state.panel.surface2);
      assert.equal(state.dialog.accent, state.panel.accent, 'sibling modal inherits active accent');
      assert.equal(state.hostBg, 'rgb(12, 34, 56)', 'theme never changes the host page');
    }
  });

  test(`theme picker lists the P1 lineup in order and each swatch applies its preset (${surface})`, async t => {
    const page = await fixture(t, shadow);
    await page.evaluate(() => window.themeTest.open());
    let state = await snapshot(page);
    assert.deepEqual(state.swatches, [...LINEUP.map(([label]) => label), 'Custom'], 'picker order and labels');
    assert.deepEqual(state.pressed, ['XRAY Dark'], 'a fresh install is on XRAY Dark (V1)');
    // Walk the lineup from High Contrast back round, so every click changes the preset.
    let previousBg = state.panel.bg;
    for (const [label, theme, bg] of [...LINEUP.slice(-1), ...LINEUP.slice(0, -1)]) {
      await page.evaluate(label => window.themeTest.click(label), label);
      state = await snapshot(page);
      assert.equal(state.settings.theme, theme);
      assert.ok(state.scopeClass.split(' ').includes(`xray-theme-${theme}`), `theme scope carries xray-theme-${theme}: ${state.scopeClass}`);
      assert.ok(state.panelClass.split(' ').includes(`xray-theme-${theme}`), `panel carries xray-theme-${theme}: ${state.panelClass}`);
      assert.equal(state.panel.bg, bg, `${label} paints its own --xray-bg`);
      assert.notEqual(state.panel.bg, previousBg, `${label} changes the computed --xray-bg`);
      assert.equal(state.dialog.bg, bg, `${label}: the sibling Settings modal follows the preset`);
      assert.deepEqual(state.pressed, [label], 'only the picked swatch is pressed');
      previousBg = state.panel.bg;
    }
  });

  test(`each preset shows its own accent until one is picked; "Use theme accent" hands it back (${surface})`, async t => {
    const page = await fixture(t, shadow);
    await page.evaluate(() => window.themeTest.open());
    let state = await snapshot(page);
    assert.equal(state.settings.theme, 'xray-dark', 'fresh install: XRAY Dark (V1)');
    assert.equal(state.panel.accent, '#3dc8f5', 'with its own accent');
    assert.deepEqual(state.accentPressed, ['Use theme accent']);
    for (const [label, theme, , accent] of LINEUP) {
      await page.evaluate(label => window.themeTest.click(label), label);
      state = await snapshot(page);
      assert.equal(state.settings.theme, theme);
      assert.equal(state.settings.accentChosen, false, `${label}: picking a preset picks no accent`);
      assert.equal(state.panel.accent, accent, `${label}: the computed accent is the block's own`);
      assert.equal(state.dialog.accent, accent, `${label}: the sibling Settings modal follows`);
      assert.deepEqual(state.accentPressed, ['Use theme accent'], `${label}: no swatch claims to be applied`);
      // Each swatch previews what picking it would paint on this preset.
      for (const [name, swatch] of [['Amber', 'blue'], ['Teal', 'teal'], ['Coral', 'coral']]) {
        assert.equal(state.swatchBg[`Use ${name} accent`], rgbOf(await page.evaluate(swatch => window.themeTest.swatch(swatch), swatch)), `${label}: ${name} preview`);
      }
    }
    // Picking a swatch overrides the preset (solved for it) and survives preset changes ...
    await page.evaluate(() => window.themeTest.click('Use Amber accent'));
    for (const [label, , , accent] of [LINEUP[7], LINEUP[1], LINEUP[8]]) {
      await page.evaluate(label => window.themeTest.click(label), label);
      state = await snapshot(page);
      const amber = await page.evaluate(() => window.themeTest.swatch('blue'));
      assert.equal(state.settings.accentChosen, true);
      assert.equal(state.panel.accent, amber, `${label}: the picked Amber, solved for this preset`);
      assert.equal(state.dialog.accent, amber);
      assert.notEqual(state.panel.accent, accent);
      assert.deepEqual(state.accentPressed, ['Use Amber accent']);
    }
    // ... until "Use theme accent" hands it back.
    await page.evaluate(() => window.themeTest.click('Use theme accent'));
    state = await snapshot(page);
    assert.equal(state.settings.accentChosen, false);
    assert.equal(state.panel.accent, '#00e5ff', 'High Contrast\'s own accent again');
    assert.equal(state.dialog.accent, '#00e5ff');
    assert.deepEqual(state.accentPressed, ['Use theme accent']);
  });

  test(`a retired theme migrates on load; its notice waits for a visible panel and for dismissal (${surface})`, async t => {
    for (const [stored, label, theme, accent] of [
      [{ theme: 'operator', accent: 'blue' }, 'XRAY Dark', 'xray-dark', '#3dc8f5'],
      [{ theme: 'claude', accent: 'teal', accentChosen: true }, 'XRAY Light', 'xray-light', null],
    ]) {
      const page = await fixture(t, shadow);
      // Restored in the background (the in-page panel loads before it is opened).
      await page.evaluate(() => window.themeTest.setOpen(false));
      let saved = await page.evaluate(settings => window.themeTest.restore({ settings }), stored);
      let state = await snapshot(page);
      assert.equal(state.settings.theme, theme, `${stored.theme} loads as ${theme}`);
      assert.ok(state.scopeClass.split(' ').includes(`xray-theme-${theme}`), state.scopeClass);
      if (accent) assert.equal(state.panel.accent, accent, `${stored.theme} + its default accent: ${label}'s own accent`);
      else assert.equal(state.panel.accent, await page.evaluate(() => window.themeTest.swatch('teal')), 'a picked accent is kept');
      assert.equal(saved.settings.theme, theme, 'the new id is stored at once');
      assert.equal(saved.settings.themeRefreshPending, true, 'with the notice pending');
      assert.deepEqual(await page.evaluate(() => window.themeTest.notices()), [], 'not shown while the panel is hidden');
      // A second background load does not spend it either.
      saved = await page.evaluate(() => window.themeTest.restore());
      assert.equal(saved.settings.themeRefreshPending, true);
      assert.deepEqual(await page.evaluate(() => window.themeTest.notices()), []);
      // Opening the panel shows it, in its own slot: a receipt toast neither replaces nor hides it.
      await page.evaluate(() => window.themeTest.setOpen(true));
      await page.waitForFunction(() => window.themeTest.notices().length > 0, undefined, { timeout: 5000 });
      assert.deepEqual(await page.evaluate(() => window.themeTest.notices()), [NOTICE(label)]);
      await page.evaluate(() => window.themeTest.toast('Receipt'));
      assert.deepEqual(await page.evaluate(() => window.themeTest.toasts()), ['Receipt']);
      assert.deepEqual(await page.evaluate(() => window.themeTest.notices()), [NOTICE(label)], 'a toast does not overwrite it');
      // No auto-hide: the receipt goes after 2.8 s, the notice stays.
      await page.waitForTimeout(3300);
      assert.deepEqual(await page.evaluate(() => window.themeTest.toasts()), [], 'the receipt timed out');
      assert.deepEqual(await page.evaluate(() => window.themeTest.notices()), [NOTICE(label)], 'the notice did not');
      // Dismissing is what clears it, and that is stored.
      await page.evaluate(() => window.themeTest.click('Dismiss theme notice'));
      await page.waitForFunction(() => window.themeTest.notices().length === 0, undefined, { timeout: 5000 });
      state = await snapshot(page);
      assert.equal(state.settings.themeRefreshPending, false);
      saved = await page.evaluate(() => window.themeTest.restore());
      assert.equal(saved.settings.themeRefreshPending, false, 'dismissal is stored');
      assert.deepEqual(await page.evaluate(() => window.themeTest.notices()), [], 'shown once');
      assert.equal((await snapshot(page)).settings.theme, theme);
    }
  });

  test(`on Custom, each accent swatch previews the colour it writes (${surface})`, async t => {
    const page = await fixture(t, shadow);
    await page.evaluate(() => { window.themeTest.settings({ theme: 'custom' }); window.themeTest.open(); });
    const state = await snapshot(page);
    // Gold moved from #ffd166 (final fix wave, I-1): solved on High Contrast it sat ΔE2000 9.5 from Amber.
    const expected = { Amber: '#d99a2b', Lavender: '#cba6f7', Teal: '#94e2d5', Green: '#a6e3a1', Gold: '#f2d457', Coral: '#eaa388' };
    for (const [name, hex] of Object.entries(expected)) assert.equal(state.swatchBg[`Use ${name} accent`], rgbOf(hex), name);
    assert.deepEqual(state.accentPressed.filter(label => label === 'Use theme accent'), [], 'Custom has no separate theme accent control');
  });

  test(`custom accent edits and palette edits agree with panel and sibling modal (${surface})`, async t => {
    const page = await fixture(t, shadow);
    await page.evaluate(() => {
      window.themeTest.settings({ theme: 'custom', customTheme: { bg: '#101010', surface: '#202020', text: '#eeeeee', accent: '#f59e0b', border: '#334455' } });
      window.themeTest.open();
    });
    assert.equal((await snapshot(page)).panel.accent, '#f59e0b');
    await page.evaluate(() => window.themeTest.click('Use Green accent'));
    let state = await snapshot(page);
    assert.equal(state.settings.customTheme.accent, '#a6e3a1', 'palette edits custom accent instead of the hidden legacy value');
    assert.equal(state.panel.accent, '#a6e3a1');
    assert.equal(state.dialog.accent, '#a6e3a1');
    assert.equal(state.settings.customTheme.border, '#334455', 'unrelated explicit override is preserved');
    const code = await page.evaluate(() => window.themeTest.share());
    await page.evaluate(() => window.themeTest.settings({ theme: 'xray-dark' }));
    await page.evaluate(code => window.themeTest.hash(code), code);
    state = await snapshot(page);
    assert.equal(state.panel.accent, '#a6e3a1');
    assert.equal(state.dialog.accent, '#a6e3a1');
    assert.equal(state.settings.customTheme.border, '#334455');
  });

  test(`prompt surface and sibling modal reduced motion remain defined (${surface})`, async t => {
    const page = await fixture(t, shadow);
    await page.evaluate(() => window.themeTest.tab('console'));
    // The textarea is transparent by design (syntax overlay); the themed surface is the editor field.
    const promptBg = (await snapshot(page)).promptBg;
    assert.ok(promptBg, 'the prompt editor field is rendered');
    assert.notEqual(promptBg, 'rgba(0, 0, 0, 0)', 'prompt background must resolve');
    await page.evaluate(() => window.themeTest.open());
    assert.equal((await snapshot(page)).motion, 'none');
  });

  // Spec A1–A3 on a captured session, on the default theme and on High Contrast.
  for (const [label, theme] of [['XRAY Dark', 'xray-dark'], ['High Contrast', 'midnight']]) {
    test(`calm accent: one accent on state and actions, mauve only on data, flat surfaces, Glow off (${label}, ${surface})`, async t => {
      const page = await fixture(t, shadow);
      await page.evaluate(theme => { window.themeTest.settings({ theme }); window.themeTest.seed(); }, theme);
      await page.waitForFunction(() => window.themeTest.root.querySelector('.xray-json-tree .xray-json-bool'), undefined, { timeout: 5000 });
      let c = await page.evaluate(() => window.themeTest.calm());
      const { accent, hint, border } = c.tokens;
      // A1: column headers are hint, chips are bordered neutrally, the active tab and the selection bar carry the accent.
      assert.ok(same(c.head, hint), `${label}: the API column header is --xray-hint ${fmt(hint)}, not ${fmt(c.head)}`);
      assert.ok(c.chips.length >= 3, `${label}: the API filter chips render: ${JSON.stringify(c.chips.map(chip => chip.text))}`);
      for (const chip of c.chips) {
        if (!chip.active) assert.ok(same(chip.border, border), `${label}: chip "${chip.text}" border is --xray-border ${fmt(border)}, not ${fmt(chip.border)}`);
        assert.ok(!same(chip.border, accent) && !same(chip.bg, accent), `${label}: chip "${chip.text}" is neutral, not accent`);
      }
      assert.ok(same(c.activeTab.indicator, accent) && same(c.activeTab.border, accent), `${label}: the active tab carries the accent: ${JSON.stringify(c.activeTab)}`);
      assert.ok(c.selectedRow.shadow.some(colour => same(colour, accent)), `${label}: the selected row's indicator bar is the accent: ${JSON.stringify(c.selectedRow.shadow)}`);
      // A3: the selected row and the surfaces are flat. (The API tab has no primary action since the
      // request-detail Export icon joined its unboxed group — final review I-3; the Console's Run is
      // measured below.)
      assert.equal(c.primary, null, `${label}: no primary action on the API tab: ${JSON.stringify(c.primary)}`);
      assert.equal(c.selectedRow.image, 'none', `${label}: the selected row is a flat fill`);
      for (const [selector, image] of Object.entries(c.flat)) assert.equal(image, 'none', `${label}: ${selector} is a flat token colour`);
      // A3: Glow is opt-in, so a fresh install draws no grid or glow behind the panel.
      assert.equal(c.glow, false, `${label}: Glow is off by default`);
      assert.equal(c.before, 'none', `${label}: .xray-panel::before paints nothing with Glow off`);
      assert.equal(c.activeTab.halo, 'none', `${label}: no halo on the active tab with Glow off`);
      // ...and Glow keeps its effect as an opt-in: the grid, the active tab's halo and the selected row's glow.
      await page.evaluate(() => window.themeTest.settings({ glow: true }));
      const glowing = await page.evaluate(() => window.themeTest.calm());
      assert.match(glowing.before, /linear-gradient/, `${label}: Glow on draws the background grid`);
      assert.ok(coloursOf(glowing.activeTab.halo).some(colour => same(colour, accent)), `${label}: Glow on haloes the active tab: ${glowing.activeTab.halo}`);
      assert.ok(glowing.selectedRow.shadow.length >= 2 && glowing.selectedRow.shadow.every(colour => same(colour, accent)), `${label}: Glow on adds the selected row's glow: ${JSON.stringify(glowing.selectedRow.shadow)}`);
      await page.evaluate(() => window.themeTest.settings({ glow: false }));
      // A2: mauve only on data (here: the JSON booleans), the accent only where A1 puts it.
      assert.ok(c.mauve.allowed > 0, `${label}: the scan sees the mauve JSON booleans`);
      assert.deepEqual(c.mauve.stray, [], `${label}: mauve paints only data`);
      assert.deepEqual(c.accent.stray, [], `${label}: the accent paints only state and actions`);
      // The Console: the command cell and its table are neutral chrome too. A draft enables Run.
      await page.evaluate(() => { window.themeTest.tab('console'); window.themeTest.draft('res.users'); });
      await page.waitForFunction(() => window.themeTest.root.querySelector('.xray-command-cell .xray-table th') && window.themeTest.root.querySelector('.xray-console-run:not(:disabled)'), undefined, { timeout: 5000 });
      c = await page.evaluate(() => window.themeTest.calm());
      // A2/A3: the primary button (Run) is a flat accent fill.
      assert.equal(c.primary.image, 'none', `${label}: primary "${c.primary.label}" has no gradient`);
      assert.ok(same(c.primary.bg, accent) && same(c.primary.color, accent), `${label}: primary "${c.primary.label}" is filled with the accent: ${JSON.stringify(c.primary)}`);
      assert.ok(c.th.length > 0 && c.th.every(colour => same(colour, hint)), `${label}: console table headers are --xray-hint: ${c.th.map(fmt).join(' ')}`);
      assert.ok(c.commandCell.every(([, colour]) => !same(colour, c.tokens.mauve)), `${label}: the command cell is not mauve: ${JSON.stringify(c.commandCell)}`);
      for (const [selector, image] of Object.entries(c.flat)) assert.equal(image, 'none', `${label}: ${selector} is a flat token colour (Console)`);
      assert.deepEqual(c.mauve.stray, [], `${label}: mauve paints only data (Console)`);
      assert.deepEqual(c.accent.stray, [], `${label}: the accent paints only state and actions (Console)`);
    });
  }

  // Ruling (Task 3 → 4): the calm-accent scan over every preset, with the categorical chrome on
  // screen (PINNED / DRIFT / GRAPHQL flags, the drift banner, console pin chips): mauve paints data
  // only, the accent only A1's elements. One page per surface; a preset change is a settings patch.
  test(`calm accent on every preset: mauve only on data, the accent only on state and actions (${surface})`, async t => {
    const page = await fixture(t, shadow);
    await page.evaluate(() => { window.themeTest.seed(); window.themeTest.seedChrome(); });
    await page.waitForFunction(() => window.themeTest.root.querySelector('.xray-drift-banner') && window.themeTest.root.querySelector('.xray-json-tree .xray-json-bool'), undefined, { timeout: 5000 });
    const problems = [];
    for (const [label, theme] of LINEUP) {
      for (const tab of ['api', 'console']) {
        await page.evaluate(({ theme, tab }) => { window.themeTest.settings({ theme }); window.themeTest.tab(tab); }, { theme, tab });
        if (tab === 'console') await page.waitForFunction(() => window.themeTest.root.querySelector('.xray-pin-chip'), undefined, { timeout: 5000 });
        const c = await page.evaluate(() => window.themeTest.calm());
        if (tab === 'api') {
          if (!same(c.head, c.tokens.hint)) problems.push(`${label}: column header ${fmt(c.head)} is not --xray-hint`);
          if (!c.mauve.allowed) problems.push(`${label}: the scan saw no mauve data`);
        }
        for (const stray of c.mauve.stray) problems.push(`${label} ${tab}: mauve on ${stray}`);
        for (const stray of c.accent.stray) problems.push(`${label} ${tab}: accent on ${stray}`);
      }
      // The sibling modals too (final review M-4a): Settings → Appearance, Compare and the command palette.
      for (const [modal, openIt, closeIt] of [
        ['Settings', () => window.themeTest.open(), () => window.themeTest.close()],
        ['Compare', () => window.themeTest.compare('users', 'orders'), () => window.themeTest.closeCompare()],
        ['Command palette', () => window.themeTest.palette(true), () => window.themeTest.palette(false)],
      ]) {
        await page.evaluate(`(${openIt})()`);
        await page.waitForFunction(() => window.themeTest.root.querySelector('[role="dialog"]'), undefined, { timeout: 5000 });
        const c = await page.evaluate(() => window.themeTest.calm());
        for (const stray of c.mauve.stray) problems.push(`${label} ${modal}: mauve on ${stray}`);
        for (const stray of c.accent.stray) problems.push(`${label} ${modal}: accent on ${stray}`);
        await page.evaluate(`(${closeIt})()`);
      }
    }
    assert.deepEqual(problems, []);
  });

  // Spec S1 (unboxed tokens) and S3 (calmer type), on the default theme and on High Contrast (whose
  // white --xray-border must not outline the method/status pills).
  for (const [label, theme] of [['XRAY Dark', 'xray-dark'], ['High Contrast', 'midnight']]) {
    test(`unboxed tokens: method/status are coloured text, flags and badges a borderless tint, icon buttons outlined on hover/focus only (${label}, ${surface})`, async t => {
      const page = await fixture(t, shadow);
      await page.evaluate(theme => { window.themeTest.settings({ theme }); window.themeTest.seed(); window.themeTest.seedChrome(); }, theme);
      await page.waitForFunction(() => window.themeTest.root.querySelector('.xray-api-flag.graphql') && window.themeTest.root.querySelector('.xray-response-chip') && window.themeTest.root.querySelector('.xray-json-tag.inexact'), undefined, { timeout: 5000 });
      const u = await page.evaluate(() => window.themeTest.unboxed());
      assert.ok(u.pills.length >= 6, `method, status and response chips render: ${u.pills.length}`);
      for (const pill of u.pills) {
        assert.deepEqual(pill.border, [], `${label}: ${pill.el} draws no outline`);
        assert.ok(pill.weight <= 600, `${label}: ${pill.el} weight ${pill.weight} ≤ 600`);
      }
      assert.ok(u.flags.some(flag => /graphql/.test(flag.el)) && u.flags.some(flag => /pinned/.test(flag.el)) && u.flags.some(flag => /drift/.test(flag.el)) && u.flags.some(flag => /xray-badge/.test(flag.el)), `flags and badges render: ${u.flags.map(flag => flag.el).join(', ')}`);
      assert.ok(u.flags.some(flag => /xray-json-tag\.dup/.test(flag.el)) && u.flags.some(flag => /xray-json-tag\.inexact/.test(flag.el)), `JSON tags render: ${u.flags.map(flag => flag.el).join(', ')}`);
      // The Console's badge peers: the ×N repeat count and "truncated".
      await page.evaluate(() => window.themeTest.tab('console'));
      await page.waitForFunction(() => window.themeTest.root.querySelector('.xray-repeat-badge') && window.themeTest.root.querySelector('.xray-truncated-badge'), undefined, { timeout: 5000 });
      const consoleFacts = await page.evaluate(() => window.themeTest.unboxed());
      assert.deepEqual(consoleFacts.idleIcons, [], `${label}: idle Console icon buttons (expand, help, …) draw no outline or resting fill`);
      assert.ok(consoleFacts.flags.some(flag => /xray-repeat-badge/.test(flag.el)) && consoleFacts.flags.some(flag => /xray-truncated-badge/.test(flag.el)), `console badges render: ${consoleFacts.flags.map(flag => flag.el).join(', ')}`);
      for (const flag of consoleFacts.flags.filter(flag => /repeat|truncated/.test(flag.el))) {
        assert.deepEqual(flag.border, [], `${label}: ${flag.el} draws no outline`);
        assert.ok(flag.bg[3] > 0 && flag.bg[3] <= 0.1001, `${label}: ${flag.el} keeps a soft tint fill (≤ 10 %): ${fmt(flag.bg)}`);
      }
      const consoleIdle = await page.evaluate(() => window.themeTest.iconBorder('Expand editor'));
      assert.ok(consoleIdle.style === 'none' || consoleIdle.width === 0 || consoleIdle.color[3] === 0, `${label}: idle Expand editor has no outline: ${JSON.stringify(consoleIdle)}`);
      await page.evaluate(() => window.themeTest.tab('api'));
      for (const flag of u.flags) {
        assert.deepEqual(flag.border, [], `${label}: ${flag.el} draws no outline`);
        assert.ok(flag.weight <= 600, `${label}: ${flag.el} weight ${flag.weight} ≤ 600`);
        assert.ok(flag.bg[3] > 0 && flag.bg[3] <= 0.1001, `${label}: ${flag.el} keeps a soft tint fill (≤ 10 %): ${fmt(flag.bg)}`);
      }
      assert.deepEqual(u.idleIcons, [], `${label}: idle icon buttons (incl. the request-detail actions) draw no outline or resting fill`);
      // S3: the column header is a quiet sentence-case label.
      assert.equal(u.head.weight, 600, `${label}: column header weight`);
      assert.equal(u.head.transform, 'none', `${label}: column header is sentence case`);
      assert.ok(['normal', '0px'].includes(u.head.spacing), `${label}: column header letter-spacing ${u.head.spacing}`);
      // An icon button gains its outline (--xray-border) on hover and on keyboard focus.
      const idle = await page.evaluate(() => window.themeTest.iconBorder('Open settings'));
      assert.ok(idle.style === 'none' || idle.width === 0 || idle.color[3] === 0, `${label}: idle icon button has no outline: ${JSON.stringify(idle)}`);
      const box = await page.evaluate(() => window.themeTest.iconBox('Open settings'));
      await page.mouse.move(box.x, box.y);
      const hovered = await page.evaluate(() => window.themeTest.iconBorder('Open settings'));
      assert.ok(hovered.style !== 'none' && hovered.width >= 1 && same(hovered.color, hovered.token), `${label}: hovered icon button is outlined with --xray-border: ${JSON.stringify(hovered)}`);
      assert.ok(hovered.fill > 0, `${label}: hovered icon button keeps its hover fill: ${JSON.stringify(hovered)}`);
      // The request-detail action row: the same idle / hover treatment.
      const moreBox = await page.evaluate(() => window.themeTest.iconBox('More actions'));
      await page.mouse.move(moreBox.x, moreBox.y);
      const moreHovered = await page.evaluate(() => window.themeTest.iconBorder('More actions'));
      assert.ok(moreHovered.style !== 'none' && moreHovered.width >= 1 && same(moreHovered.color, moreHovered.token), `${label}: hovered detail action is outlined with --xray-border: ${JSON.stringify(moreHovered)}`);
      await page.mouse.move(1, 1);
      const focused = await page.evaluate(() => window.themeTest.iconBorder('Open settings', true));
      assert.ok(focused.focusVisible, `${label}: keyboard-style focus`);
      assert.ok(focused.style !== 'none' && focused.width >= 1 && same(focused.color, focused.token), `${label}: focused icon button is outlined with --xray-border: ${JSON.stringify(focused)}`);
    });
  }

  // Spec S3 / constraint: no computed text weight above 700 anywhere in the panel — API with a
  // request open, Console, Rules, Insights and every Settings section — and the S3 type roles.
  test(`calmer type: no computed font-weight above 700; statusbar 500; section titles 600 in real case (${surface})`, async t => {
    const page = await fixture(t, shadow);
    await page.evaluate(() => { window.themeTest.seed(); window.themeTest.seedChrome(); });
    await page.waitForFunction(() => window.themeTest.root.querySelector('.xray-drift-banner'), undefined, { timeout: 5000 });
    const heavy = [];
    for (const tab of ['api', 'console', 'rules', 'insights']) {
      await page.evaluate(tab => window.themeTest.tab(tab), tab);
      if (tab === 'console') {
        await page.waitForFunction(() => window.themeTest.root.querySelector('.xray-statusbar'), undefined, { timeout: 5000 });
        const { statusbar } = await page.evaluate(() => window.themeTest.type());
        assert.ok(statusbar.length > 0 && statusbar.every(bar => bar.weight === 500), `the statusbar is 500: ${JSON.stringify(statusbar)}`);
      }
      heavy.push(...(await page.evaluate(() => window.themeTest.heavy())).map(found => `${tab}: ${found}`));
    }
    await page.evaluate(() => { window.themeTest.tab('api'); window.themeTest.open(); });
    const sections = await page.evaluate(() => window.themeTest.navItems());
    assert.ok(sections.length >= 4, `Settings sections: ${sections.join(', ')}`);
    const titles = [];
    let groups = [];
    for (let i = 0; i < sections.length; i += 1) {
      await page.evaluate(i => window.themeTest.nav(i), i);
      heavy.push(...(await page.evaluate(() => window.themeTest.heavy())).map(found => `Settings ${sections[i]}: ${found}`));
      const type = await page.evaluate(() => window.themeTest.type());
      titles.push(...type.titles);
      groups = type.groups;
    }
    assert.deepEqual(heavy, [], 'no computed font-weight above 700');
    assert.ok(titles.length > 0, 'Settings section titles render');
    for (const title of titles) {
      assert.equal(title.weight, 600, `${title.el}: weight 600`);
      assert.equal(title.transform, 'none', `${title.el}: real case`);
    }
    assert.ok(groups.length > 0 && groups.every(group => group.transform === 'uppercase'), `the small Settings nav group labels keep uppercase: ${JSON.stringify(groups)}`);
  });

  test(`high contrast states: the active tab, the selected row and focus stay distinguishable at 7:1 (${surface})`, async t => {
    const page = await fixture(t, shadow);
    await page.evaluate(() => { window.themeTest.settings({ theme: 'midnight' }); window.themeTest.seed(); });
    await page.waitForFunction(() => window.themeTest.root.querySelector('.xray-api-row.selected'), undefined, { timeout: 5000 });
    const s = await page.evaluate(() => window.themeTest.states());
    // The active tab differs from an idle one, reads at 7:1, and its indicator stands out from the bar at 7:1.
    assert.notEqual(s.tab.bg, s.tab.idleBg, 'active tab fill differs from an idle tab');
    assert.notEqual(s.tab.border, s.tab.idleBorder, 'active tab border differs from an idle tab');
    assert.ok(s.tab.text >= 7, `active tab text ${s.tab.text.toFixed(2)}:1`);
    assert.ok(s.tab.indicator >= 7, `active tab indicator ${s.tab.indicator.toFixed(2)}:1 against the tab bar`);
    // The selected row differs from a plain one, reads at 7:1, and its bar stands out at 7:1.
    assert.notEqual(s.row.bg, s.row.plainBg, 'selected row fill differs from a plain row');
    assert.notEqual(s.row.shadow, s.row.plainShadow, 'only the selected row draws the bar');
    assert.ok(s.row.text >= 7, `selected row text ${s.row.text.toFixed(2)}:1`);
    assert.ok(s.row.bar >= 7, `selection bar ${s.row.bar.toFixed(2)}:1 against the selected row`);
    // Focus is a ring of its own (the active tab draws none), at 7:1.
    for (const key of ['tabFocus', 'listFocus']) {
      const f = s[key];
      assert.ok(f.visible, `${key}: :focus-visible after keyboard-style focus`);
      assert.equal(f.style, 'solid', `${key}: a solid focus ring`);
      assert.ok(f.width >= 2, `${key}: ring width ${f.width}`);
      assert.equal(f.activeTabOutline, 'none', `${key}: the active tab is not drawn as focused`);
      assert.ok(f.ring >= 7, `${key}: focus ring ${f.ring.toFixed(2)}:1`);
    }
  });

  test(`focus rings follow the effective accent: the theme's, or the swatch picked over it (${surface})`, async t => {
    const page = await fixture(t, shadow);
    await page.evaluate(() => window.themeTest.open());
    let state = await snapshot(page);
    assert.equal(state.panel.focus, state.panel.accent, 'XRAY Dark: focus is its accent');
    for (const [label, swatch] of [['Amber', 'blue'], ['Teal', 'teal']]) {
      await page.evaluate(label => window.themeTest.click(`Use ${label} accent`), label);
      state = await snapshot(page);
      const picked = await page.evaluate(swatch => window.themeTest.swatch(swatch), swatch);
      assert.equal(state.panel.accent, picked);
      assert.equal(state.panel.focus, picked, `${label}: the panel's focus ring follows the picked accent`);
      assert.equal(state.dialog.focus, picked, `${label}: so does the sibling Settings modal's`);
    }
    await page.evaluate(() => window.themeTest.click('High Contrast'));
    state = await snapshot(page);
    assert.equal(state.panel.focus, state.panel.accent, 'High Contrast + Teal: focus is the solved swatch');
    await page.evaluate(() => window.themeTest.click('Use theme accent'));
    state = await snapshot(page);
    assert.equal(state.panel.focus, '#00e5ff', 'and High Contrast\'s own accent once the theme accent is back');
    assert.equal(state.dialog.focus, '#00e5ff');
  });

  test(`the shared Notice callout stays in the flow; the theme-refresh notice is an in-flow strip inside the panel (${surface})`, async t => {
    const page = await fixture(t, shadow);
    await page.evaluate(() => window.themeTest.tab('rules'));
    const notice = await page.evaluate(() => {
      const el = window.themeTest.root.querySelector('.xray-rules .xray-notice, .xray-notice');
      const s = getComputedStyle(el);
      return { position: s.position, right: s.right, bottom: s.bottom, text: el.textContent };
    });
    assert.match(notice.text, /Page bridge unavailable/);
    assert.equal(notice.position, 'static', 'the shared callout is laid out where it is used, not floated over the panel');
    await page.evaluate(() => window.themeTest.restore({ settings: { theme: 'operator', accent: 'blue' } }));
    await page.waitForFunction(() => window.themeTest.notices().length > 0, undefined, { timeout: 5000 });
    // Final review I-4 (ruling): it no longer floats over the viewport (it covered the console's Run
    // and, in the HUD, the host page); it is a strip inside .xray-panel, above the content.
    const g = await page.evaluate(() => window.themeTest.noticeGeometry());
    assert.equal(g.position, 'static', 'the theme-refresh notice is laid out in the panel, not floated');
    assert.ok(g.inPanel, 'it renders inside .xray-panel');
  });

  // Final review I-4: in every mode the notice sits inside the panel's box and clear of the console
  // prompt's Run button (the Console is the tab a migrated user lands on), never over the host page.
  for (const [mode, width, dockSide] of [['window', 960, 'right'], ['hud', 420, 'right'], ['hud', 420, 'left'], ['hud', 960, 'left']]) {
    test(`the theme-refresh notice stays inside the panel and clear of Run (${mode} ${width} dock ${dockSide}, ${surface})`, async t => {
      const page = await fixture(t, shadow, mode, width);
      await page.evaluate(dockSide => window.themeTest.restore({ settings: { theme: 'operator', accent: 'blue', dockSide } }), dockSide);
      await page.evaluate(() => window.themeTest.tab('console'));
      await page.waitForFunction(() => window.themeTest.notices().length > 0 && window.themeTest.root.querySelector('.xray-console-run'), undefined, { timeout: 5000 });
      const g = await page.evaluate(() => window.themeTest.noticeGeometry());
      assert.ok(g.inPanel, 'the notice renders inside .xray-panel');
      const inside = g.notice.left >= g.panel.left - 0.5 && g.notice.right <= g.panel.right + 0.5 && g.notice.top >= g.panel.top - 0.5 && g.notice.bottom <= g.panel.bottom + 0.5;
      assert.ok(inside, `the notice ${JSON.stringify(g.notice)} lies within the panel ${JSON.stringify(g.panel)}`);
      const overlaps = g.notice.left < g.run.right && g.run.left < g.notice.right && g.notice.top < g.run.bottom && g.run.top < g.notice.bottom;
      assert.ok(!overlaps, `the notice ${JSON.stringify(g.notice)} does not cover Run ${JSON.stringify(g.run)}`);
    });
  }

  // Spec S2: chrome (tabs, buttons, chips, Settings, modal titles, toasts) computes the UI sans stack;
  // data (URL paths, methods, status, JSON, console input and table cells, header values, statusbar
  // numbers) computes the mono Font stack — and the Font stack setting moves only the data.
  test(`two type roles: chrome in the UI sans stack, data in the mono Font stack the setting governs (${surface})`, async t => {
    const page = await fixture(t, shadow);
    await page.evaluate(() => { window.themeTest.seed(); window.themeTest.seedChrome(); window.themeTest.toast('Copied to clipboard'); });
    await page.waitForFunction(() => window.themeTest.root.querySelector('.xray-json-tag.inexact') && window.themeTest.root.querySelector('.xray-toast'), undefined, { timeout: 5000 });
    const problems = [];
    const facts = {};
    const screen = async (name, chrome, data, prepare) => {
      if (prepare) await page.evaluate(prepare);
      if (data.length || chrome.length) await page.waitForFunction(sel => window.themeTest.root.querySelector(sel), (chrome[0] || data[0]), { timeout: 5000 }).catch(() => problems.push(`${name}: ${chrome[0] || data[0]} never rendered`));
      const f = await page.evaluate(([chrome, data]) => window.themeTest.fonts(chrome.join(', ') || ':not(*)', data.join(', ') || ':not(*)'), [chrome, data]);
      facts[name] = f;
      if (!/^ui-sans-serif, system-ui/.test(f.ui)) problems.push(`${name}: --xray-font-ui resolves to ${f.ui}`);
      if (!/monospace$/.test(f.mono)) problems.push(`${name}: --xray-font resolves to ${f.mono}`);
      for (const x of f.chrome) if (x.family !== f.ui) problems.push(`${name}: chrome ${x.el} computes ${x.family}`);
      for (const x of f.data) if (x.family !== f.mono) problems.push(`${name}: data ${x.el} computes ${x.family}`);
      for (const x of f.stray) problems.push(`${name}: ${x} is neither stack`);
      return f;
    };
    const chromeApi = ['.xray-tab span:not(.xray-badge)', '.xray-filter-chips .xray-chip', '.xray-detail-tab', '.xray-action-btn', '.xray-toast', '.xray-json-tag', '.xray-api-table-head'];
    const dataApi = ['.xray-api-row .xray-path', '.xray-api-row .xray-method', '.xray-api-row .xray-status', '.xray-json-key', '.xray-json-value', '.xray-response-chip'];
    await screen('API', chromeApi, dataApi);
    // Every named selector renders at least once on its screen.
    const each = async (name, list) => {
      for (const sel of list) {
        if (!(await page.evaluate(sel => !!window.themeTest.root.querySelector(sel), sel))) problems.push(`${name}: ${sel} is not rendered`);
      }
    };
    await each('API', [...chromeApi, ...dataApi]);
    await screen('API headers', ['.xray-detail-tab'], ['.xray-header-name', '.xray-header-value'], () => window.themeTest.detail('headers'));
    await each('API headers', ['.xray-header-name', '.xray-header-value']);
    // Timings and sizes are data wherever they appear (controller ruling): the topbar and API
    // summaries and the timing pane keep their labels in the UI stack and their numbers mono.
    const chromeTiming = ['.xray-api-summary-stat', '.xray-summary', '.xray-waterfall-head .xray-muted'];
    const dataTiming = ['.xray-api-summary-stat .xray-num', '.xray-summary .xray-num', '.xray-waterfall-head .xray-num', '.xray-waterfall-legend strong'];
    await screen('API timing', chromeTiming, dataTiming, () => window.themeTest.detail('timing'));
    await each('API timing', [...chromeTiming, ...dataTiming]);
    // URL entry is data (ruling): the Replay modal's URL; the modal's chrome stays sans.
    const chromeReplay = ['.xray-modal h3', '.xray-modal .xray-btn', '.xray-modal .xray-select'];
    const dataReplay = ['.xray-input-data[aria-label="Replay URL"]', '.xray-replay-headers'];
    await screen('Replay', chromeReplay, dataReplay, () => { window.themeTest.detail('response'); window.themeTest.replay(true); });
    await each('Replay', [...chromeReplay, ...dataReplay]);
    await page.evaluate(() => window.themeTest.replay(false));
    const chromeConsole = ['.xray-tab span:not(.xray-badge)', '.xray-statusbar', '.xray-console-title'];
    const dataConsole = ['.xray-editor-input', '.xray-table td', '.xray-cell-command', '.xray-console-message', '.xray-statusbar .xray-status-num'];
    await screen('Console', chromeConsole, dataConsole, () => window.themeTest.tab('console'));
    await each('Console', [...chromeConsole, ...dataConsole]);
    // The editor's signature hint is a code preview (mono); its note is chrome.
    await page.evaluate(() => window.themeTest.root.querySelector('.xray-editor-input').focus());
    await page.keyboard.type('diff(');
    await screen('Console hint', ['.xray-editor-hint-note'], ['.xray-editor-hint-main']);
    await each('Console hint', ['.xray-editor-hint-note', '.xray-editor-hint-main']);
    await page.evaluate(() => window.themeTest.draft(''));
    const chromeInsights = ['.xray-insight-stat-label', '.xray-collapsible-title'];
    const dataInsights = ['.xray-insight-stat strong', '.xray-finding-path'];
    await screen('Insights', chromeInsights, dataInsights, () => window.themeTest.tab('insights'));
    await each('Insights', [...chromeInsights, ...dataInsights]);
    const chromeLogs = ['.xray-tab span:not(.xray-badge)', '.xray-filter-chips .xray-chip'];
    const dataLogs = ['.xray-log-message', '.xray-entry-row'];
    await screen('Logs', chromeLogs, dataLogs, () => window.themeTest.logSeed());
    await each('Logs', [...chromeLogs, ...dataLogs]);
    const chromeSettings = ['.xray-modal h3', '.xray-settings-nav-item', '.xray-settings-section-title', '.xray-settings-row span', '.xray-settings-row small', '.xray-select', '.xray-btn'];
    const before = await screen('Settings', chromeSettings, [], () => { window.themeTest.tab('api'); window.themeTest.open(); });
    await each('Settings', chromeSettings);
    assert.deepEqual(problems, []);
    // The Font stack setting governs data only.
    await page.evaluate(() => window.themeTest.settings({ font: 'system' }));
    const after = await page.evaluate(([chrome, data]) => window.themeTest.fonts(chrome.join(', '), data.join(', ')), [chromeSettings, ['.xray-api-row .xray-path', '.xray-json-key']]);
    assert.notEqual(after.mono, before.mono, 'the Font stack setting changes --xray-font');
    assert.match(after.mono, /^ui-monospace/);
    assert.equal(after.ui, before.ui, 'the Font stack setting leaves the UI stack alone');
    assert.ok(after.data.length > 0 && after.data.every(x => x.family === after.mono), `data follows the Font stack setting: ${JSON.stringify(after.data)}`);
    assert.ok(after.chrome.length > 0 && after.chrome.every(x => x.family === before.ui), `chrome ignores the Font stack setting: ${JSON.stringify(after.chrome.filter(x => x.family !== before.ui))}`);
  });

  // Spec S2 watch-out: sans is wider than mono in places (bold tab labels). Where the chrome fit on
  // the pre-S2 mono chrome it must still fit — every tab inside the tablist's box with no hidden
  // scroll, every label whole inside its tab, every row's controls inside the row, no clipped
  // control, no sideways panel scroll; where it already overflowed on mono, no worse. Tab labels
  // show above 680 px (styles.css @container xray), so 700–960 window and a 720 HUD check them.
  for (const [mode, width] of [['hud', 420], ['window', 700], ['window', 760], ['hud', 720], ['window', 960], ['window', 1600]]) {
    test(`chrome fits at ${width} (${mode}, ${surface})`, async t => {
      const page = await fixture(t, shadow, mode, width);
      await page.evaluate(() => { window.themeTest.seed(); window.themeTest.seedChrome(); });
      await page.waitForFunction(() => window.themeTest.root.querySelector('.xray-detail-tab'), undefined, { timeout: 5000 });
      const problems = [];
      // The API request detail, then the request list, then each tab.
      for (const tab of ['api', 'api list', 'console', 'logs', 'rules', 'insights', 'sql']) {
        await page.evaluate(tab => (tab === 'api list' ? window.themeTest.listOnly() : window.themeTest.tab(tab)), tab);
        await page.waitForTimeout(50);
        await page.evaluate(() => window.themeTest.monoChrome(true));
        const mono = await page.evaluate(() => window.themeTest.fit());
        await page.evaluate(() => window.themeTest.monoChrome(false));
        const now = await page.evaluate(() => window.themeTest.fit());
        const at = `${tab} @${width}`;
        assert.equal(now.width, width, `${at}: the panel is ${width} px wide`);
        // Six top tabs since the SQL tab (SQL client M1 Task 8).
        assert.equal(now.tabs, 6, `${at}: six top tabs`);
        assert.equal(now.labels, width > 680 ? 6 : 0, `${at}: tab labels shown above 680 px only`);
        if (mono.tabsOverflow === 0) {
          if (now.tabsOverflow > 0) problems.push(`${at}: the tablist scrolls ${now.tabsOverflow} px (fit on mono)`);
          if (now.tabsOutside.length) problems.push(`${at}: tabs outside the tablist: ${now.tabsOutside.join(', ')}`);
        } else if (now.tabsOverflow > mono.tabsOverflow) problems.push(`${at}: the tablist scrolls ${now.tabsOverflow} px, mono ${mono.tabsOverflow}`);
        if (now.labelsCut.length) problems.push(`${at}: tab labels cut: ${now.labelsCut.join(', ')}`);
        for (const [sel, row] of Object.entries(now.rows)) {
          const before = mono.rows[sel] || { overflow: 0, outside: [] };
          if (row.overflow > before.overflow) problems.push(`${at}: ${sel} overflows ${row.overflow} px, mono ${before.overflow}`);
          const fresh = row.outside.filter(x => !before.outside.includes(x));
          if (fresh.length) problems.push(`${at}: ${sel} controls outside the row: ${fresh.join(', ')}`);
        }
        const clipped = now.clipped.filter(x => !mono.clipped.includes(x));
        if (clipped.length) problems.push(`${at}: clipped controls: ${clipped.join(', ')}`);
        if (now.panelOverflow > 0) problems.push(`${at}: the panel scrolls sideways ${now.panelOverflow} px`);
      }
      assert.deepEqual(problems, []);
    });
  }

  // Spec S5 (wired state tokens) and S6 (pane layering), on a dark, two light and the High Contrast
  // preset: panel chrome is --xray-surface, content panes --xray-bg, wells and inputs
  // --xray-surface2; raised menus and modals stay --xray-surface (raised by border and shadow — see
  // the Task 6 report: surface3 fails the matrix for hint/subtext). The selected row is
  // --xray-selection, a hovered row --xray-hover, JSON null --xray-neutral, an in-flight status
  // --xray-pending; and no drawn line on API (list, detail, an open menu), Console, Logs or the
  // Settings modal uses a colour outside the line and state tokens (S4).
  for (const [label, theme] of [['XRAY Dark', 'xray-dark'], ['XRAY Light', 'xray-light'], ['GitHub Light', 'github-light'], ['High Contrast', 'midnight']]) {
    test(`state tokens and pane layering: selection, hover, null, pending; chrome / panes / wells; themeable lines (${label}, ${surface})`, async t => {
      const page = await fixture(t, shadow);
      await page.evaluate(theme => { window.themeTest.settings({ theme }); window.themeTest.seed(); window.themeTest.seedPending(); window.themeTest.detail('response'); }, theme);
      await page.waitForFunction(() => window.themeTest.root.querySelector('.xray-api-row.selected') && window.themeTest.root.querySelector('.xray-json-null'), undefined, { timeout: 5000 });
      const problems = [];
      const check = (where, facts, expect) => {
        for (const [sel, token] of Object.entries(expect)) {
          const fill = facts.fills[sel];
          if (!fill) problems.push(`${where}: ${sel} is not rendered`);
          else if (!(fill[3] > 0.999 && same(fill, facts.tokens[token]))) problems.push(`${where}: ${sel} fill ${fmt(fill)} is not --xray-${token} ${fmt(facts.tokens[token])}`);
        }
        for (const stray of facts.strayLines) problems.push(`${where}: line outside the line/state tokens: ${stray}`);
        if (facts.lines < 5) problems.push(`${where}: the line scan saw only ${facts.lines} lines`);
      };
      const api = {
        '.xray-topbar': 'surface', '.xray-api-toolbar': 'surface', '.xray-detail-hero': 'surface', '.xray-detail-nav': 'surface',
        '.xray-api-collection-pane': 'bg', '.xray-api-table-head': 'bg', '.xray-request-detail': 'bg', '.xray-detail-content': 'bg',
        '.xray-api-toolbar .xray-input': 'surface2', '.xray-json-tree': 'surface2',
        '.xray-api-row.selected': 'selection',
      };
      const facts = await page.evaluate(sels => window.themeTest.layers(sels), Object.keys(api));
      check(`${label} API`, facts, api);
      if (!same(facts.nul, facts.tokens.neutral)) problems.push(`${label}: JSON null ${fmt(facts.nul)} is not --xray-neutral`);
      if (!same(facts.pending, facts.tokens.pending)) problems.push(`${label}: in-flight status ${fmt(facts.pending)} is not --xray-pending`);
      // Hover a plain row: --xray-hover, visibly not the selection.
      const box = await page.evaluate(() => window.themeTest.rowBox('.xray-api-row:not(.selected)'));
      await page.mouse.move(box.x, box.y);
      const hovered = await page.evaluate(() => window.themeTest.fill('.xray-api-row:not(.selected):hover'));
      if (!same(hovered, facts.tokens.hover) || hovered[3] < 0.999) problems.push(`${label}: hovered row ${fmt(hovered)} is not --xray-hover ${fmt(facts.tokens.hover)}`);
      if (same(hovered, facts.fills['.xray-api-row.selected'])) problems.push(`${label}: a hovered row looks selected`);
      await page.mouse.move(1, 1);
      // An open menu is raised on --xray-surface with the line token.
      await page.evaluate(() => window.themeTest.moreActions());
      const menu = await page.evaluate(() => window.themeTest.layers(['.xray-detail-action-list']));
      check(`${label} menu`, menu, { '.xray-detail-action-list': 'surface' });
      await page.evaluate(() => window.themeTest.moreActions());
      for (const tab of ['console', 'logs']) {
        await page.evaluate(tab => window.themeTest.tab(tab), tab);
        const expect = tab === 'console' ? { '.xray-topbar': 'surface', '.xray-prompt': 'surface', '.xray-console-stream': 'bg', '.xray-prompt .xray-editor-field': 'surface2' } : { '.xray-topbar': 'surface' };
        check(`${label} ${tab}`, await page.evaluate(sels => window.themeTest.layers(sels), Object.keys(expect)), expect);
      }
      await page.evaluate(() => { window.themeTest.tab('api'); window.themeTest.open(); });
      const modal = { '.xray-modal': 'surface', '.xray-modal select, .xray-modal .xray-select': 'surface2' };
      check(`${label} Settings`, await page.evaluate(sels => window.themeTest.layers(sels), Object.keys(modal)), modal);
      assert.deepEqual(problems, []);
    });
  }

  // Fix round 1: an info body notice (FormData) draws its blue edge — the S4 sweep dropped the
  // fallback that defined its colour, which made the whole border shorthand invalid.
  test(`an info body notice draws a visible border in its tone (${surface})`, async t => {
    const page = await fixture(t, shadow);
    await page.evaluate(() => window.themeTest.seedForm());
    await page.waitForFunction(() => window.themeTest.root.querySelector('.xray-body-notice.info'), undefined, { timeout: 5000 });
    const e = await page.evaluate(() => window.themeTest.edge('.xray-body-notice.info', 'blue'));
    assert.ok(e.style === 'solid' && e.width >= 1 && e.color[3] > 0, `info notice border: ${JSON.stringify(e)}`);
    assert.ok(same(e.color, e.want), `info notice border is the blue tone: ${fmt(e.color)} vs ${fmt(e.want)}`);
  });

  // Fix round 1: a cancelled command cell keeps a leading edge of its own (--xray-neutral).
  test(`a cancelled command cell has a distinct leading edge (${surface})`, async t => {
    const page = await fixture(t, shadow);
    await page.evaluate(() => window.themeTest.seedCancelled());
    await page.waitForFunction(() => window.themeTest.root.querySelector('.xray-command-cell.is-cancelled'), undefined, { timeout: 5000 });
    const cell = await page.evaluate(() => {
      const el = window.themeTest.root.querySelector('.xray-command-cell.is-cancelled');
      const s = getComputedStyle(el);
      return { left: s.borderLeftColor, top: s.borderTopColor };
    });
    const neutral = await page.evaluate(() => window.themeTest.layers([]).tokens.neutral);
    assert.notEqual(cell.left, cell.top, 'the leading edge differs from the cell outline');
    assert.ok(same(coloursOf(cell.left)[0], neutral), `cancelled edge ${cell.left} is --xray-neutral`);
  });

  // Routed from Task 3: the Glow grid is the effective accent, so it follows a picked swatch.
  test(`the Glow grid follows the effective accent, a picked swatch included (${surface})`, async t => {
    const page = await fixture(t, shadow);
    for (const patch of [{ glow: true }, { glow: true, accent: 'blue', accentChosen: true }, { glow: true, theme: 'xray-light' }]) {
      await page.evaluate(patch => window.themeTest.settings(patch), patch);
      const grid = (await page.evaluate(() => window.themeTest.glowGrid())).filter(c => c[3] > 0);
      const { tokens } = await page.evaluate(() => window.themeTest.layers([]));
      assert.ok(grid.length >= 2 && grid.every(c => same(c, tokens.accent) && c[3] < 0.1), `${JSON.stringify(patch)}: grid ${grid.map(fmt).join(', ')} is the accent ${fmt(tokens.accent)} at a low alpha`);
      const selection = tokens.selection;
      assert.ok(!same(selection, tokens.bg), 'the selection tint is not the background');
    }
  });

  // Final review I-2 (spec A2): one source for the JSON value colours — numbers --xray-peach,
  // booleans --xray-mauve — in the panel and in a sibling modal (Compare) alike.
  test(`JSON numbers and booleans paint the same data colours in the panel and the Compare modal (${surface})`, async t => {
    const page = await fixture(t, shadow);
    await page.evaluate(() => window.themeTest.seed());
    await page.waitForFunction(() => window.themeTest.root.querySelector('.xray-json-tree .xray-json-bool') && window.themeTest.root.querySelector('.xray-json-tree .xray-json-number'), undefined, { timeout: 5000 });
    const panel = await page.evaluate(() => window.themeTest.jsonColours('.xray-panel'));
    await page.evaluate(() => window.themeTest.compare('users', 'orders'));
    await page.waitForFunction(() => window.themeTest.root.querySelector('.xray-compare-modal .xray-json-number'), undefined, { timeout: 5000 });
    const modal = await page.evaluate(() => window.themeTest.jsonColours('.xray-compare-modal'));
    assert.ok(panel.number.length > 0 && panel.bool.length > 0, 'the panel tree shows numbers and booleans');
    assert.ok(modal.number.length > 0, 'the Compare modal shows a number (the status)');
    for (const [where, c] of [['panel', panel], ['Compare modal', modal]]) {
      for (const colour of c.number) assert.ok(same(colour, c.tokens.peach), `${where}: a JSON number is --xray-peach ${fmt(c.tokens.peach)}, not ${fmt(colour)}`);
      for (const colour of c.bool) assert.ok(same(colour, c.tokens.mauve), `${where}: a JSON boolean is --xray-mauve ${fmt(c.tokens.mauve)}, not ${fmt(colour)}`);
      for (const colour of c.string) assert.ok(same(colour, c.tokens.green), `${where}: a JSON string is --xray-green ${fmt(c.tokens.green)}, not ${fmt(colour)}`);
    }
  });

  // Final review I-3 (ruling): the request-detail Export icon is a peer in its unboxed action group
  // (the Export modal's Download is the real primary), so it is not tinted with the accent at rest.
  test(`the request-detail Export icon is unboxed and untinted at rest, like its group (${surface})`, async t => {
    const page = await fixture(t, shadow);
    await page.evaluate(() => window.themeTest.seed());
    await page.waitForFunction(() => window.themeTest.root.querySelector('.xray-detail-actions [title="Export"]'), undefined, { timeout: 5000 });
    const look = await page.evaluate(() => window.themeTest.restLook('.xray-detail-actions [title="Export"]'));
    assert.doesNotMatch(look.className, /\bprimary\b/, 'Export is not a declared primary');
    assert.deepEqual(look.border, [], 'no outline at rest');
    assert.equal(look.fill, 0, 'no resting fill');
    assert.ok(!same(look.color, look.accent), `its icon is not the accent at rest: ${fmt(look.color)}`);
  });

  // Final review I-7: the request list and the Logs listbox mark keyboard focus with the full-strength
  // --xray-focus ring, 2px, drawn inside the list (≥ 3:1 on the list's background).
  for (const [label, theme] of [['XRAY Dark', 'xray-dark'], ['XRAY Light', 'xray-light']]) {
    test(`keyboard focus on the request list and the Logs listbox shows a full-strength 2px ring (${label}, ${surface})`, async t => {
      const page = await fixture(t, shadow);
      await page.evaluate(theme => { window.themeTest.settings({ theme }); window.themeTest.seed(); }, theme);
      await page.waitForFunction(() => window.themeTest.root.querySelector('.xray-api-row.selected'), undefined, { timeout: 5000 });
      const rings = { requests: await page.evaluate(() => window.themeTest.listRing('.xray-api-table-scroll')) };
      await page.evaluate(() => window.themeTest.logSeed());
      await page.waitForFunction(() => window.themeTest.root.querySelector('.xray-logs-list'), undefined, { timeout: 5000 });
      rings.logs = await page.evaluate(() => window.themeTest.listRing('.xray-logs-list'));
      for (const [list, r] of Object.entries(rings)) {
        assert.ok(r.visible, `${label} ${list}: :focus-visible after keyboard-style focus`);
        assert.deepEqual([r.style, r.width, r.offset], ['solid', 2, -2], `${label} ${list}: a 2px ring drawn inside the list`);
        assert.ok(same(r.color, r.focus) && r.color[3] === 1, `${label} ${list}: the ring is full-strength --xray-focus ${fmt(r.focus)}, not ${fmt(r.color)}`);
        assert.ok(r.ring >= 3, `${label} ${list}: the ring reads ${r.ring.toFixed(2)}:1 on the list`);
      }
    });
  }

  // Final review M-3: a host page in quirks mode resets colour and font size on tables; the panel's
  // tables (here the Compare evidence) must render exactly as on a standards-mode page.
  test(`tables keep the panel's text colour and font on a quirks-mode host page (${surface})`, async t => {
    const facts = {};
    for (const quirks of [false, true]) {
      const page = await fixture(t, shadow, 'window', 960, { quirks });
      await page.evaluate(() => { window.themeTest.seed(); window.themeTest.compare('users', 'orders'); });
      await page.waitForFunction(() => window.themeTest.root.querySelector('.xray-compare-table td'), undefined, { timeout: 5000 });
      facts[quirks ? 'quirks' : 'standards'] = await page.evaluate(() => window.themeTest.tableText('.xray-compare-table td'));
    }
    assert.deepEqual([facts.standards.mode, facts.quirks.mode], ['CSS1Compat', 'BackCompat'], 'one standards-mode and one quirks-mode host page');
    for (const key of ['color', 'family', 'size']) assert.equal(facts.quirks[key], facts.standards[key], `a table cell's ${key} on a quirks-mode page`);
    assert.equal(facts.quirks.color, facts.quirks.outerColor, 'the cell inherits the modal\'s text colour');
  });

  // Final review M-5: disabled actions read as disabled in the sibling modals too — not only the
  // panel's buttons — in --xray-disabled with a not-allowed cursor.
  test(`a disabled action in a modal looks disabled (${surface})`, async t => {
    const page = await fixture(t, shadow);
    await page.evaluate(() => { window.themeTest.seed(); window.themeTest.compare(null, null); });
    await page.waitForFunction(() => window.themeTest.root.querySelector('.xray-compare-modal'), undefined, { timeout: 5000 });
    const swap = await page.evaluate(() => window.themeTest.look('Swap comparison sides'));
    const clear = await page.evaluate(() => window.themeTest.look('Clear comparison'));
    assert.equal(swap.disabled, true, 'Swap sides is disabled with no sides set');
    assert.ok(same(swap.color, swap.token), `disabled Swap sides is --xray-disabled ${fmt(swap.token)}, not ${fmt(swap.color)}`);
    assert.equal(swap.cursor, 'not-allowed');
    assert.equal(clear.disabled, false);
    assert.ok(!same(clear.color, clear.token), 'the enabled Clear comparison is not');
  });

  // Routed from Task 5: the Logs detail header's clock time is data, mono like the row timestamps.
  test(`the Logs detail clock time renders in the mono data stack (${surface})`, async t => {
    const page = await fixture(t, shadow);
    await page.evaluate(() => window.themeTest.logSeed());
    await page.waitForFunction(() => window.themeTest.root.querySelector('.xray-log-detail-head'), undefined, { timeout: 5000 });
    const f = await page.evaluate(() => window.themeTest.fonts('.xray-tab', '.xray-log-detail-head .xray-num'));
    assert.equal(f.data.length, 1, `the clock renders as data: ${JSON.stringify(f.data)}`);
    assert.equal(f.data[0].family, f.mono, `${f.data[0].el} computes the mono stack`);
  });

  // Routed from Task 4: the no-weight-above-700 scan also covers an opened modal (Replay) and the HUD.
  test(`no computed font-weight above 700 in an open Replay modal or the HUD (${surface})`, async t => {
    const heavy = [];
    const page = await fixture(t, shadow);
    await page.evaluate(() => { window.themeTest.seed(); window.themeTest.replay(true); });
    await page.waitForFunction(() => window.themeTest.root.querySelector('.xray-modal'), undefined, { timeout: 5000 });
    heavy.push(...(await page.evaluate(() => window.themeTest.heavy())).map(found => `Replay: ${found}`));
    const hud = await fixture(t, shadow, 'hud', 560);
    await hud.evaluate(() => { window.themeTest.seed(); window.themeTest.seedChrome(); });
    for (const tab of ['api', 'console', 'logs']) {
      await hud.evaluate(tab => window.themeTest.tab(tab), tab);
      heavy.push(...(await hud.evaluate(() => window.themeTest.heavy())).map(found => `HUD ${tab}: ${found}`));
    }
    assert.ok((await hud.evaluate(() => window.themeTest.root.querySelectorAll('.xray-panel *').length)) > 50, 'the HUD rendered');
    assert.deepEqual(heavy, []);
  });

  test(`Diagnostics disclosure paints a chevron that turns, and toggles its rows (${surface})`, async t => {
    const page = await fixture(t, shadow);
    await page.evaluate(() => { window.themeTest.open(); window.themeTest.click('Session & storage'); });
    const disclosure = () => page.evaluate(() => {
      const d = [...window.themeTest.root.querySelectorAll('details')].find(x => /Diagnostics/.test(x.textContent));
      const summary = d.querySelector('summary');
      summary.scrollIntoView({ block: 'center' });
      const own = getComputedStyle(summary);
      const before = getComputedStyle(summary, '::before');
      // Visible means painted: a native marker, or a pseudo-element with a drawn, non-transparent border.
      const painted = side => before[`border${side}Style`] !== 'none' && parseFloat(before[`border${side}Width`]) > 0
        && !/^(?:transparent|rgba\(.*,\s*0\))$/.test(before[`border${side}Color`]);
      const rect = summary.getBoundingClientRect();
      const row = d.querySelector('.xray-settings-row');
      return {
        open: d.open,
        marker: own.display === 'list-item' && own.listStyleType !== 'none',
        chevron: !['none', 'normal'].includes(before.content) && parseFloat(before.width) > 0 && parseFloat(before.height) > 0
          && painted('Right') && painted('Bottom'),
        transform: before.transform,
        transition: before.transitionDuration,
        x: rect.left + 12, y: rect.top + rect.height / 2,
        rowVisible: Boolean(row?.checkVisibility() && row.getBoundingClientRect().height > 0),
      };
    });
    const closed = await disclosure();
    assert.ok(closed.marker || closed.chevron, `Diagnostics summary shows a marker or chevron: ${JSON.stringify(closed)}`);
    assert.equal(closed.open, false, 'collapsed by default');
    assert.equal(closed.rowVisible, false, 'rows hidden while collapsed');
    await page.mouse.click(closed.x, closed.y);
    const opened = await disclosure();
    assert.equal(opened.open, true, 'a click on the summary opens it');
    assert.equal(opened.rowVisible, true, 'rows shown when open');
    if (!closed.marker) {
      assert.notEqual(opened.transform, closed.transform, 'the chevron turns when open');
      assert.equal(closed.transition, '0s', 'reduced motion (this fixture): the chevron turns without a transition');
    }
    await page.mouse.click(opened.x, opened.y);
    assert.equal((await disclosure()).open, false, 'a second click closes it');
  });
}

test('dark, light, and high-contrast main surfaces render screenshots outside the repository', async t => {
  mkdirSync(screenshotDir, { recursive: true });
  const page = await fixture(t, true);
  for (const theme of ['xray-dark', 'xray-light', 'midnight']) {
    await page.evaluate(theme => window.themeTest.settings({ theme }), theme);
    for (const tab of ['api', 'console', 'logs', 'rules', 'insights']) {
      await page.evaluate(tab => window.themeTest.tab(tab), tab);
      await page.screenshot({ path: `${screenshotDir}/${theme}-${tab}.png` });
      assert.notEqual((await snapshot(page)).panel.text, '');
    }
    await page.evaluate(() => window.themeTest.open());
    await page.screenshot({ path: `${screenshotDir}/${theme}-appearance.png` });
    await page.evaluate(() => window.themeTest.close());
  }
});
