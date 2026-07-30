// settings/settings.js — Options page for the shared React panel preferences.
// Reads and writes the same chrome.storage.local record the React UI persists
// (xray_react_panel_preferences), so both surfaces stay in sync.
(async () => {
  const STORAGE_KEY = 'xray_react_panel_preferences';
  const THEMES = ['operator', 'dev-edition', 'midnight', 'light-lab', 'claude', 'custom'];
  const ACCENTS = ['blue', 'mauve', 'teal', 'green', 'peach', 'coral'];
  const FONTS = ['jetbrains', 'cascadia', 'iosevka', 'system'];
  const DENSITIES = ['compact', 'comfortable', 'spacious'];
  const DEFAULT_SETTINGS = {
    captureFetch: true,
    captureXhr: true,
    maxEntries: 1000,
    slowThresholdMs: 500,
    theme: 'operator',
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

  // A theme/accent added to the panel but not yet mirrored here must survive a
  // round-trip through this page: surface it as a real option instead of
  // silently rewriting it to the fallback on Save.
  function ensureOption(select, value, options) {
    if (typeof value !== 'string' || !value || options.includes(value)) return options;
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
    return options.concat(value);
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
  const settings = Object.assign({}, DEFAULT_SETTINGS, preferences.settings || {});

  const themeSelect = document.getElementById('theme');
  const accentSelect = document.getElementById('accent');
  const fontSelect = document.getElementById('font');
  const densitySelect = document.getElementById('density');
  const maxEntriesInput = document.getElementById('maxEntries');
  const slowThresholdInput = document.getElementById('slowThreshold');
  const captureFetchInput = document.getElementById('captureFetch');
  const captureXhrInput = document.getElementById('captureXhr');
  const saveBtn = document.getElementById('save');

  const themeOptions = ensureOption(themeSelect, settings.theme, THEMES);
  const accentOptions = ensureOption(accentSelect, settings.accent, ACCENTS);
  themeSelect.value = pick(settings.theme, themeOptions, DEFAULT_SETTINGS.theme);
  accentSelect.value = pick(settings.accent, accentOptions, DEFAULT_SETTINGS.accent);
  fontSelect.value = pick(settings.font, FONTS, DEFAULT_SETTINGS.font);
  densitySelect.value = pick(settings.density, DENSITIES, DEFAULT_SETTINGS.density);
  maxEntriesInput.value = String(clamp(settings.maxEntries, DEFAULT_SETTINGS.maxEntries, 50, 5000));
  slowThresholdInput.value = String(clamp(settings.slowThresholdMs, DEFAULT_SETTINGS.slowThresholdMs, 100, 5000));
  captureFetchInput.checked = settings.captureFetch !== false;
  captureXhrInput.checked = settings.captureXhr !== false;

  saveBtn.addEventListener('click', async () => {
    const latest = await loadPreferences();
    const merged = Object.assign({}, latest, {
      settings: Object.assign({}, latest.settings || {}, {
        theme: pick(themeSelect.value, themeOptions, DEFAULT_SETTINGS.theme),
        accent: pick(accentSelect.value, accentOptions, DEFAULT_SETTINGS.accent),
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
