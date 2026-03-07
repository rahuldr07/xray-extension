// settings/settings.js — Preferences manager
(async () => {
  const DEFAULTS = { theme: 'zinc', maxEntries: 500, autoOpen: false };
  const MIN_ENTRIES = 50;
  const MAX_ENTRIES = 10000;
  const THEME_ALIASES = {
    'catppuccin-mocha': 'mocha',
    'catppuccin-latte': 'latte',
  };

  function normalizeTheme(theme) {
    return THEME_ALIASES[theme] || theme || DEFAULTS.theme;
  }

  function clampEntries(value) {
    if (!Number.isFinite(value)) return DEFAULTS.maxEntries;
    return Math.min(MAX_ENTRIES, Math.max(MIN_ENTRIES, Math.round(value)));
  }

  async function load() {
    const result = await chrome.storage.local.get('xray_settings');
    return Object.assign({}, DEFAULTS, result.xray_settings || {});
  }

  async function save(prefs) {
    await chrome.storage.local.set({ xray_settings: prefs });
  }

  const prefs = await load();
  const themeSelect = document.getElementById('theme');
  const maxEntriesInput = document.getElementById('maxEntries');
  const autoOpenInput = document.getElementById('autoOpen');
  const saveBtn = document.getElementById('save');
  const normalizedTheme = normalizeTheme(prefs.theme);
  themeSelect.value = themeSelect.querySelector(`option[value="${normalizedTheme}"]`)
    ? normalizedTheme
    : DEFAULTS.theme;
  maxEntriesInput.value = String(clampEntries(Number(prefs.maxEntries)));
  autoOpenInput.checked = !!prefs.autoOpen;

  saveBtn.addEventListener('click', async () => {
    const parsedEntries = Number.parseInt(maxEntriesInput.value, 10);
    const maxEntries = clampEntries(parsedEntries);
    maxEntriesInput.value = String(maxEntries);
    await save({
      theme: normalizeTheme(themeSelect.value),
      maxEntries,
      autoOpen: autoOpenInput.checked,
    });
    saveBtn.textContent = '✓ Saved';
    saveBtn.classList.add('is-saved');
    setTimeout(() => {
      saveBtn.textContent = 'Save Settings';
      saveBtn.classList.remove('is-saved');
    }, 1500);
  });
})();
