// Local page preferences only; never touches the mining engine or its settings.
(function () {
  'use strict';
  const root = document.documentElement;
  const languages = ['es', 'en'];
  const themes = ['light', 'dark', 'system'];
  function read(key, allowed, fallback) {
    try { const value = localStorage.getItem(key); return allowed.includes(value) ? value : fallback; }
    catch (_) { return fallback; }
  }
  function save(key, value) { try { localStorage.setItem(key, value); } catch (_) {} }
  let language = read('randomx.ui.language', languages, 'es');
  let theme = read('randomx.ui.theme', themes, 'system');
  const media = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function syncControls() {
    const languageControl = document.getElementById('uiLanguage');
    const themeControl = document.getElementById('uiTheme');
    if (languageControl) languageControl.value = language;
    if (themeControl) themeControl.value = theme;
  }
  function applyTheme() {
    const resolved = theme === 'system' ? (media && media.matches ? 'dark' : 'light') : theme;
    root.dataset.theme = resolved;
    root.style.colorScheme = resolved;
    document.querySelectorAll('meta[name="theme-color"]').forEach(meta => {
      meta.content = resolved === 'dark' ? '#141718' : '#ffcfde';
    });
    syncControls();
  }
  window.RandomXPreferences = Object.freeze({
    get language() { return language; },
    get theme() { return theme; },
    setLanguage(value) {
      if (!languages.includes(value) || value === language) return;
      language = value;
      root.lang = value;
      save('randomx.ui.language', value);
      syncControls();
      window.dispatchEvent(new CustomEvent('randomx:languagechange', { detail: { language } }));
    },
    setTheme(value) {
      if (!themes.includes(value)) return;
      theme = value;
      save('randomx.ui.theme', value);
      applyTheme();
    },
  });
  root.lang = language;
  applyTheme();
  const systemChanged = () => { if (theme === 'system') applyTheme(); };
  if (media && media.addEventListener) media.addEventListener('change', systemChanged);
  else if (media && media.addListener) media.addListener(systemChanged);
  function connectControls() {
    syncControls();
    const languageControl = document.getElementById('uiLanguage');
    const themeControl = document.getElementById('uiTheme');
    if (languageControl) languageControl.addEventListener('change', () => window.RandomXPreferences.setLanguage(languageControl.value));
    if (themeControl) themeControl.addEventListener('change', () => window.RandomXPreferences.setTheme(themeControl.value));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', connectControls);
  else connectControls();
})();
