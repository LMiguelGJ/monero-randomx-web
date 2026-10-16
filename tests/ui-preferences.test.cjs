const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function boot(saved = {}, dark = false, blocked = false) {
  const store = new Map(Object.entries(saved));
  const events = [];
  const handlers = {};
  const root = { dataset: {}, style: {}, lang: '' };
  const controls = Object.fromEntries(['uiLanguage', 'uiTheme'].map(id => [id, {
    value: '', addEventListener(name, fn) { this[name] = fn; },
  }]));
  const media = { matches: dark, addEventListener(_, fn) { this.change = fn; } };
  const context = {
    document: { documentElement: root, readyState: 'loading',
      getElementById: id => controls[id] || null,
      addEventListener(name, fn) { handlers[name] = fn; },
      querySelectorAll: () => [],
    },
    localStorage: { getItem(key) { if (blocked) throw Error('blocked'); return store.get(key) ?? null; },
      setItem(key, value) { if (blocked) throw Error('blocked'); store.set(key, value); } },
    matchMedia: () => media,
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
    dispatchEvent: event => { events.push(event); return true; },
    location: { reload() { throw Error('Must not reload'); } },
  };
  context.window = context;
  vm.runInNewContext(fs.readFileSync('public/ui-preferences.js', 'utf8'), context);
  handlers.DOMContentLoaded();
  return { api: context.RandomXPreferences, store, events, root, controls, media };
}

test('first visit uses Spanish and follows system appearance before UI startup', () => {
  const { api, root, controls } = boot({}, true);
  assert.equal(api.language, 'es'); assert.equal(api.theme, 'system');
  assert.equal(root.lang, 'es'); assert.equal(root.dataset.theme, 'dark');
  assert.equal(root.style.colorScheme, 'dark');
  assert.equal(controls.uiLanguage.value, 'es'); assert.equal(controls.uiTheme.value, 'system');
});

test('explicit themes persist and ignore OS changes; system resumes OS tracking', () => {
  const { api, root, store, media, controls } = boot();
  api.setTheme('dark');
  assert.equal(root.dataset.theme, 'dark'); assert.equal(store.get('randomx.ui.theme'), 'dark');
  media.matches = false; media.change(); assert.equal(root.dataset.theme, 'dark');
  api.setTheme('light'); assert.equal(root.dataset.theme, 'light');
  api.setTheme('system'); media.matches = true; media.change();
  assert.equal(root.dataset.theme, 'dark'); assert.equal(controls.uiTheme.value, 'system');
});

test('language changes live, emits one event and restores across visits', () => {
  const { api, root, store, events, controls } = boot();
  api.setLanguage('en');
  assert.equal(root.lang, 'en'); assert.equal(controls.uiLanguage.value, 'en');
  assert.equal(store.get('randomx.ui.language'), 'en');
  assert.equal(events.length, 1); assert.equal(events[0].type, 'randomx:languagechange');
  assert.equal(events[0].detail.language, 'en');
  api.setLanguage('en'); assert.equal(events.length, 1);
  api.setTheme('dark');
  const next = boot(Object.fromEntries(store));
  assert.equal(next.api.language, 'en'); assert.equal(next.root.dataset.theme, 'dark');
  api.setLanguage('es'); assert.equal(root.lang, 'es');
});

test('controls apply preferences without navigation', () => {
  const { api, controls, root } = boot();
  controls.uiLanguage.value = 'en'; controls.uiLanguage.change();
  controls.uiTheme.value = 'dark'; controls.uiTheme.change();
  assert.equal(api.language, 'en'); assert.equal(root.dataset.theme, 'dark');
});

test('invalid values do not corrupt preferences; unavailable storage stays usable', () => {
  const invalid = boot({ 'randomx.ui.language': 'fr', 'randomx.ui.theme': 'pink' });
  assert.equal(invalid.api.language, 'es'); assert.equal(invalid.api.theme, 'system');
  invalid.api.setLanguage('fr'); invalid.api.setTheme('pink');
  assert.equal(invalid.api.language, 'es'); assert.equal(invalid.api.theme, 'system');
  assert.equal(invalid.events.length, 0);
  const blocked = boot({}, false, true);
  blocked.api.setLanguage('en'); blocked.api.setTheme('dark');
  assert.equal(blocked.root.lang, 'en'); assert.equal(blocked.root.dataset.theme, 'dark');
});
