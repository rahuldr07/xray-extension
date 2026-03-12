// settings/settings.js — Preferences manager
(async () => {
  const DEFAULTS = { theme: 'catppuccin-mocha', maxEntries: 500, autoOpen: false };

  async function load() {
    const result = await chrome.storage.local.get('xray_settings');
    return Object.assign({}, DEFAULTS, result.xray_settings || {});
  }

  async function save(prefs) {
    await chrome.storage.local.set({ xray_settings: prefs });
  }

  const prefs = await load();
  document.getElementById('theme').value       = prefs.theme;
  document.getElementById('maxEntries').value  = prefs.maxEntries;
  document.getElementById('autoOpen').value    = String(prefs.autoOpen);

  document.getElementById('save').addEventListener('click', async () => {
    await save({
      theme:      document.getElementById('theme').value,
      maxEntries: parseInt(document.getElementById('maxEntries').value) || 500,
      autoOpen:   document.getElementById('autoOpen').value === 'true',
    });
    const btn = document.getElementById('save');
    btn.textContent = '✓ Saved';
    setTimeout(() => { btn.textContent = 'Save Settings'; }, 1500);
  });
})();
