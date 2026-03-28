// settings/settings.js — Preferences manager
(async () => {
  const DEFAULTS = { theme: 'zinc', maxEntries: 500, autoOpen: false };
  const THEME_ALIASES = {
    'catppuccin-mocha': 'mocha',
    'catppuccin-latte': 'latte',
  };

  function normalizeTheme(theme) {
    return THEME_ALIASES[theme] || theme || DEFAULTS.theme;
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
  const normalizedTheme = normalizeTheme(prefs.theme);
  themeSelect.value = themeSelect.querySelector(`option[value="${normalizedTheme}"]`)
    ? normalizedTheme
    : DEFAULTS.theme;
  document.getElementById('maxEntries').value  = prefs.maxEntries;
  document.getElementById('autoOpen').value    = String(prefs.autoOpen);

  document.getElementById('save').addEventListener('click', async () => {
    await save({
      theme:      normalizeTheme(document.getElementById('theme').value),
      maxEntries: parseInt(document.getElementById('maxEntries').value) || 500,
      autoOpen:   document.getElementById('autoOpen').value === 'true',
    });
    const btn = document.getElementById('save');
    btn.textContent = '✓ Saved';
    setTimeout(() => { btn.textContent = 'Save Settings'; }, 1500);
  });
})();
