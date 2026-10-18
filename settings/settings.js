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

  // A theme/accent added to the panel but not yet mirrored here must survive a
  // round-trip through this page: surface it as a real option instead of
  // silently rewriting it to the fallback on Save.
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
    return Object.assign({}, settings, { theme, accentChosen, themeRefreshPending });
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
  const accentOptions = ensureOption(accentSelect, settings.accent, ACCENTS);
  themeSelect.value = pick(settings.theme, themeOptions, DEFAULT_SETTINGS.theme);
  accentSelect.value = settings.accentChosen ? pick(settings.accent, accentOptions, DEFAULT_SETTINGS.accent) : THEME_ACCENT;
  fontSelect.value = pick(settings.font, FONTS, DEFAULT_SETTINGS.font);
  densitySelect.value = pick(settings.density, DENSITIES, DEFAULT_SETTINGS.density);
  maxEntriesInput.value = String(clamp(settings.maxEntries, DEFAULT_SETTINGS.maxEntries, 50, 5000));
  slowThresholdInput.value = String(clamp(settings.slowThresholdMs, DEFAULT_SETTINGS.slowThresholdMs, 100, 5000));
  captureFetchInput.checked = settings.captureFetch !== false;
  captureXhrInput.checked = settings.captureXhr !== false;

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
        accent: themeAccent ? settings.accent : pick(accentSelect.value, accentOptions, DEFAULT_SETTINGS.accent),
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
