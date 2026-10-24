// settings/settings.js — Options page for the shared React panel preferences.
// Reads and writes the same chrome.storage.local record the React UI persists
// (xray_react_panel_preferences), so both surfaces stay in sync.
(async () => {
  const STORAGE_KEY = 'xray_react_panel_preferences';
  // The panel's preset lineup (THEME_PRESETS in src/panel/models/panelSettings.ts), in picker
  // order. This page is a plain script and cannot import it, so it keeps this copy, which
  // test/unit/settingsContent.test.mjs pins to the model (ids, labels, order).
  const THEME_PRESETS = [
    ['xray-dark', 'XRAY Dark'],
    ['xray-light', 'XRAY Light'],
    ['github-dark', 'GitHub Dark'],
    ['github-light', 'GitHub Light'],
    ['tokyo-night', 'Tokyo Night'],
    ['catppuccin-mocha', 'Catppuccin Mocha'],
    ['dracula', 'Dracula'],
    ['gruvbox-dark', 'Gruvbox Dark'],
    ['midnight', 'High Contrast'],
  ];
  // Retired presets load as their replacement, and the accent each applied by default hands
  // over to the new preset's own (spec V2: RETIRED_THEMES in panelSettings.ts; the same test
  // checks this page migrates exactly as the panel does).
  const RETIRED_THEMES = {
    operator: ['xray-dark', 'blue'],
    'dev-edition': ['xray-dark', 'coral'],
    'light-lab': ['xray-light', 'blue'],
    claude: ['xray-light', 'coral'],
  };
  const THEMES = THEME_PRESETS.map(([id]) => id).concat('custom');
  const ACCENTS = ['blue', 'mauve', 'teal', 'green', 'peach', 'coral'];
  // What each accent swatch (in ACCENTS order) paints on each preset: the panel's
  // accentSwatchValue (the swatch solved for that preset's surfaces). This page cannot run the
  // solver, so it keeps the solved values, pinned value for value by settingsContent.test.mjs.
  const ACCENT_SWATCHES = {
    'xray-dark': ['#d99a2b', '#cba6f7', '#94e2d5', '#a6e3a1', '#f2d457', '#eaa388'],
    'xray-light': ['#845600', '#7418ec', '#0d696e', '#226d15', '#6e6200', '#a23f1e'],
    'github-dark': ['#d99a2b', '#cba6f7', '#94e2d5', '#a6e3a1', '#f2d457', '#eaa388'],
    'github-light': ['#845600', '#7418ec', '#0d696e', '#226d15', '#6e6200', '#a23f1e'],
    'tokyo-night': ['#d99a2b', '#cba6f7', '#94e2d5', '#a6e3a1', '#f2d457', '#eaa388'],
    'catppuccin-mocha': ['#e5a53a', '#cba6f7', '#94e2d5', '#a6e3a1', '#f2d457', '#eaa388'],
    dracula: ['#e3a338', '#cba6f7', '#94e2d5', '#a6e3a1', '#f2d457', '#eaa388'],
    'gruvbox-dark': ['#e6a73c', '#cba6f7', '#94e2d5', '#a6e3a1', '#f2d457', '#eaa388'],
    midnight: ['#edad43', '#cea9fa', '#94e2d5', '#a6e3a1', '#f2d457', '#efa88d'],
  };
  // The accent select's first choice: no swatch picked, so the preset shows its own accent.
  const THEME_ACCENT = 'theme';
  const FONTS = ['jetbrains', 'cascadia', 'iosevka', 'system'];
  const DENSITIES = ['compact', 'comfortable', 'spacious'];
  const DEFAULT_SETTINGS = {
    captureFetch: true,
    captureXhr: true,
    maxEntries: 1000,
    slowThresholdMs: 500,
    theme: 'xray-dark',
    accent: 'blue',
    font: 'jetbrains',
    density: 'compact',
  };

  function clamp(value, fallback, min, max) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(max, Math.max(min, Math.round(parsed)));
  }

  function pick(value, options, fallback) {
    return options.includes(value) ? value : fallback;
  }

  function addOption(select, value, label) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    select.appendChild(option);
  }

  // A theme added to the panel but not yet mirrored here must survive a round-trip
  // through this page: surface it as a real option instead of silently rewriting it
  // to the fallback on Save. (An unknown accent is not kept: it reads as the panel's
  // fallback, see migrate.)
  function ensureOption(select, value, options) {
    if (typeof value !== 'string' || !value || options.includes(value)) return options;
    addOption(select, value, value);
    return options.concat(value);
  }

  // The panel's normalizePanelSettings rules for the theme, accentChosen and the refresh notice
  // (spec V2, P2); test/unit/settingsContent.test.mjs checks both give the same result.
  function migrate(settings) {
    // Settings stored before the theme refresh carry no themeRefreshPending.
    const legacy = typeof settings.themeRefreshPending !== 'boolean';
    const valid = ACCENTS.includes(settings.accent);
    const retired = Object.prototype.hasOwnProperty.call(RETIRED_THEMES, settings.theme) ? RETIRED_THEMES[settings.theme] : null;
    const theme = retired ? retired[0] : settings.theme;
    // The accent a theme used to set itself (a retired preset's default; Gold on High Contrast
    // before the refresh) hands over to the theme's own accent; any other valid accent was picked.
    const formerDefault = retired ? retired[1] : legacy && theme === 'midnight' ? 'peach' : null;
    const accentChosen = formerDefault ? valid && settings.accent !== formerDefault
      : typeof settings.accentChosen === 'boolean' ? settings.accentChosen
        : valid && settings.accent !== 'blue';
    const themeRefreshPending = Boolean(settings.themeRefreshPending) || retired !== null || (formerDefault !== null && !accentChosen);
    // A corrupt accent reads as the panel's fallback (Amber), so this page shows what the panel
    // paints and Save never writes the corrupt value back.
    const accent = valid ? settings.accent : DEFAULT_SETTINGS.accent;
    return Object.assign({}, settings, { theme, accent, accentChosen, themeRefreshPending });
  }

  async function loadPreferences() {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEY);
      const stored = result[STORAGE_KEY];
      return stored && typeof stored === 'object' ? stored : {};
    } catch {
      return {};
    }
  }

  async function savePreferences(preferences) {
    await chrome.storage.local.set({ [STORAGE_KEY]: preferences });
  }

  const preferences = await loadPreferences();
  const settings = migrate(Object.assign({}, DEFAULT_SETTINGS, preferences.settings || {}));

  const themeSelect = document.getElementById('theme');
  const accentSelect = document.getElementById('accent');
  const fontSelect = document.getElementById('font');
  const densitySelect = document.getElementById('density');
  const maxEntriesInput = document.getElementById('maxEntries');
  const slowThresholdInput = document.getElementById('slowThreshold');
  const captureFetchInput = document.getElementById('captureFetch');
  const captureXhrInput = document.getElementById('captureXhr');
  const saveBtn = document.getElementById('save');

  for (const [id, label] of THEME_PRESETS) addOption(themeSelect, id, id === DEFAULT_SETTINGS.theme ? `${label} (default)` : label);
  addOption(themeSelect, 'custom', 'Custom (Theme Studio)');
  const themeOptions = ensureOption(themeSelect, settings.theme, THEMES);
  themeSelect.value = pick(settings.theme, themeOptions, DEFAULT_SETTINGS.theme);
  accentSelect.value = settings.accentChosen ? settings.accent : THEME_ACCENT;
  fontSelect.value = pick(settings.font, FONTS, DEFAULT_SETTINGS.font);
  densitySelect.value = pick(settings.density, DENSITIES, DEFAULT_SETTINGS.density);
  maxEntriesInput.value = String(clamp(settings.maxEntries, DEFAULT_SETTINGS.maxEntries, 50, 5000));
  slowThresholdInput.value = String(clamp(settings.slowThresholdMs, DEFAULT_SETTINGS.slowThresholdMs, 100, 5000));
  captureFetchInput.checked = settings.captureFetch !== false;
  captureXhrInput.checked = settings.captureXhr !== false;

  // A picked swatch is painted here as in the panel: the swatch solved for the shown preset, set
  // on :root over the preset's :has() block (setProperty: the CSP rules out inline script). The
  // preset's own accent applies otherwise, and on Custom, which has no static palette here.
  function applyAccent() {
    const swatches = ACCENT_SWATCHES[themeSelect.value];
    const index = ACCENTS.indexOf(accentSelect.value);
    if (swatches && index >= 0) document.documentElement.style.setProperty('--xray-accent', swatches[index]);
    else document.documentElement.style.removeProperty('--xray-accent');
  }
  applyAccent();
  themeSelect.addEventListener('change', applyAccent);
  accentSelect.addEventListener('change', applyAccent);

  // The HUD SQL options belong to the service worker (Ruling M3-R28): they are read and changed
  // through it, at once, not by Save. Turning on saved databases in the HUD asks first.
  const HUD_DATABASES_WARNING = 'The page you are on cannot read the client, but it could try to trick you into clicking it. Keep connections read-only, or leave this off.';
  const inlineInput = document.getElementById('sqlInlineInHud');
  const databasesInput = document.getElementById('sqlDatabasesInHud');
  const databasesHint = document.getElementById('sqlDatabasesHint');
  const hudDialog = document.getElementById('hudDialog');
  const runtime = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage ? chrome.runtime : null;
  const hudMessage = (msg) => new Promise((resolve) => {
    if (!runtime) return resolve(null);
    runtime.sendMessage(msg, (response) => resolve(runtime.lastError ? null : response));
  });
  function showHud(options) {
    inlineInput.checked = options.sqlInlineInHud === true;
    databasesInput.checked = options.sqlDatabasesInHud === true;
    databasesInput.disabled = !inlineInput.checked;
    databasesHint.textContent = inlineInput.checked ? HUD_DATABASES_WARNING : 'Turn on the option above first.';
  }
  async function setHud(patch) {
    const res = await hudMessage({ type: 'xray:sql-hud-options:set', options: patch });
    if (res && res.ok) showHud(res.value);
    return res;
  }
  showHud({});
  hudMessage({ type: 'xray:sql-hud-options:get' }).then((res) => { if (res && res.ok) showHud(res.value); });
  inlineInput.addEventListener('change', () => { void setHud({ sqlInlineInHud: !!inlineInput.checked }); });
  databasesInput.addEventListener('change', () => {
    if (!databasesInput.checked) {
      void setHud({ sqlDatabasesInHud: false });
      return;
    }
    // Not on until the user allows it in the dialog.
    databasesInput.checked = false;
    if (hudDialog.showModal) hudDialog.showModal();
  });
  document.getElementById('hudAllow').addEventListener('click', async () => {
    if (hudDialog.close) hudDialog.close();
    await setHud({ sqlDatabasesInHud: true });
  });
  document.getElementById('hudCancel').addEventListener('click', () => {
    if (hudDialog.close) hudDialog.close();
  });

  saveBtn.addEventListener('click', async () => {
    const latest = await loadPreferences();
    const latestSettings = latest.settings || {};
    // A refresh notice the panel raised (or dismissed) since this page loaded wins over ours.
    const { themeRefreshPending } = migrate(Object.assign({}, DEFAULT_SETTINGS, latestSettings));
    // Same contract as the panel: a picked swatch overrides every preset and survives later
    // theme changes; "Theme accent" hands the accent back to the preset (the swatch is kept).
    const themeAccent = accentSelect.value === THEME_ACCENT;
    const merged = Object.assign({}, latest, {
      settings: Object.assign({}, latestSettings, {
        theme: pick(themeSelect.value, themeOptions, DEFAULT_SETTINGS.theme),
        accent: themeAccent ? settings.accent : pick(accentSelect.value, ACCENTS, DEFAULT_SETTINGS.accent),
        accentChosen: !themeAccent,
        themeRefreshPending,
        font: pick(fontSelect.value, FONTS, DEFAULT_SETTINGS.font),
        density: pick(densitySelect.value, DENSITIES, DEFAULT_SETTINGS.density),
        maxEntries: clamp(maxEntriesInput.value, DEFAULT_SETTINGS.maxEntries, 50, 5000),
        slowThresholdMs: clamp(slowThresholdInput.value, DEFAULT_SETTINGS.slowThresholdMs, 100, 5000),
        captureFetch: !!captureFetchInput.checked,
        captureXhr: !!captureXhrInput.checked,
      }),
    });
    maxEntriesInput.value = String(merged.settings.maxEntries);
    slowThresholdInput.value = String(merged.settings.slowThresholdMs);
    await savePreferences(merged);
    saveBtn.textContent = '✓ Saved';
    saveBtn.classList.add('is-saved');
    setTimeout(() => {
      saveBtn.textContent = 'Save Settings';
      saveBtn.classList.remove('is-saved');
    }, 1500);
  });
})();
