const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../public/ui-i18n.js'), 'utf8');

function createNode(text = '') {
  const attrs = {};
  return {
    textContent: text,
    value: text,
    dataset: {},
    attributes: attrs,
    getAttribute(name) { return attrs[name] ?? null; },
    setAttribute(name, value) { attrs[name] = String(value); },
  };
}

function makeI18n(language = 'es', nodes = []) {
  const listeners = {};
  const document = {
    querySelectorAll(selector) {
      if (selector === '[data-i18n]') return nodes.filter(node => node.getAttribute('data-i18n') !== null);
      if (selector === '[data-i18n-title]') return nodes.filter(node => node.getAttribute('data-i18n-title') !== null);
      if (selector === '[data-i18n-aria-label]') return nodes.filter(node => node.getAttribute('data-i18n-aria-label') !== null);
      if (selector === '[data-i18n-placeholder]') return nodes.filter(node => node.getAttribute('data-i18n-placeholder') !== null);
      if (selector === '[data-i18n-log-source]') return nodes.filter(node => node.dataset.i18nLogSource !== undefined);
      return [];
    },
    addEventListener(type, listener) { listeners[type] = listener; },
  };
  let currentLanguage = language;
  const window = {
    RandomXPreferences: {
      get language() { return currentLanguage; },
      setLanguage(next) { currentLanguage = next; if (listeners['randomx:languagechange']) listeners['randomx:languagechange']({ detail: { language: next } }); },
    },
    addEventListener(type, listener) { listeners[type] = listener; },
  };
  const context = { window, document, CustomEvent: function () {}, console };
  vm.runInNewContext(source, context, { filename: 'ui-i18n.js' });
  return { i18n: window.RandomXI18n, listeners, document, window };
}

test('Spanish is the default and known interface labels have Spanish translations', () => {
  const { i18n } = makeI18n();
  assert.equal(i18n.t('Start'), 'Iniciar');
  assert.equal(i18n.t('Hashrate'), 'Tasa de hash');
  assert.equal(i18n.t('disconnected'), 'desconectado');
});

test('English round trip restores source text after a language change', () => {
  const label = createNode('');
  label.setAttribute('data-i18n', 'Wallet setup');
  const { i18n } = makeI18n('es', [label]);
  i18n.apply();
  assert.equal(label.textContent, 'Configuración de cartera');
  i18n.setLanguage('en');
  assert.equal(label.textContent, 'Wallet setup');
  i18n.setLanguage('es');
  assert.equal(label.textContent, 'Configuración de cartera');
});

test('dynamic templates translate without changing numeric, hash, or URL values', () => {
  const { i18n } = makeI18n();
  assert.equal(i18n.t('mining with 8 threads'), 'minando con 8 hilos');
  assert.equal(i18n.t('complete · 32 init threads'), 'completo · 32 hilos de inicio');
  assert.equal(i18n.t('~4s remaining · 32 init threads'), '~4 s restantes · 32 hilos de inicio');
  assert.equal(i18n.t('Starting miner in full mode (32 threads)...'), 'Iniciando minero en modo completo (32 hilos)…');
  assert.equal(i18n.t('Pool target → pool.example:3333, wallet 48abc123…'), 'Destino del pool → pool.example:3333, cartera 48abc123…');
  assert.equal(i18n.t('Found share! Nonce: a0ff, share diff 12 / job diff 99'), '¡Share encontrado! Nonce: a0ff, dificultad del share 12 / dificultad del trabajo 99');
});

test('static content and accessible attributes translate, then restore', () => {
  const label = createNode('');
  label.setAttribute('data-i18n', 'Embed configuration');
  const button = createNode('');
  button.setAttribute('data-i18n-title', 'collapse / expand');
  button.setAttribute('data-i18n-aria-label', 'Embed script builder');
  const input = createNode('numeric/address payload');
  input.value = '4abc1234567890';
  input.setAttribute('data-i18n-placeholder', 'monero address');
  const { i18n } = makeI18n('es', [label, button, input]);
  i18n.apply();
  assert.equal(label.textContent, 'Configuración de inserción');
  assert.equal(button.getAttribute('title'), 'contraer / expandir');
  assert.equal(button.getAttribute('aria-label'), 'Constructor de script insertable');
  assert.equal(input.getAttribute('placeholder'), 'dirección de Monero');
  assert.equal(input.value, '4abc1234567890');
  i18n.setLanguage('en');
  assert.equal(button.getAttribute('title'), 'collapse / expand');
  assert.equal(input.getAttribute('placeholder'), 'monero address');
});

test('existing log entries are retranslated from retained source text', () => {
  const line = createNode('[12:00:00] Mining stopped');
  line.dataset.i18nLogSource = 'Mining stopped';
  line.dataset.i18nLogTime = '[12:00:00]';
  const { i18n } = makeI18n('es', [line]);
  i18n.apply();
  assert.equal(line.textContent, '[12:00:00] Minería detenida');
  i18n.setLanguage('en');
  assert.equal(line.textContent, '[12:00:00] Mining stopped');
});

test('disconnect retry notices translate completely and retain their source across language switches', () => {
  const source = 'Disconnected; reconnecting in 5s…';
  const line = createNode('');
  line.dataset.i18nLogSource = source;
  line.dataset.i18nLogTime = '[12:00:00]';
  const { i18n } = makeI18n('es', [line]);
  assert.equal(i18n.t(source), 'Desconectado; reconectando en 5 s…');
  i18n.apply();
  assert.equal(line.textContent, '[12:00:00] Desconectado; reconectando en 5 s…');
  i18n.setLanguage('en');
  assert.equal(line.textContent, `[12:00:00] ${source}`);
  i18n.setLanguage('es');
  assert.equal(line.textContent, '[12:00:00] Desconectado; reconectando en 5 s…');
});

test('unknown technical messages fall back unchanged', () => {
  const { i18n } = makeI18n();
  assert.equal(i18n.t('Vendor error 0xdeadbeef: unusual transport'), 'Vendor error 0xdeadbeef: unusual transport');
});

test('locale switching does not mutate miner protocol/state or worker/socket references', () => {
  const { i18n } = makeI18n();
  const state = { status: 'connected to proxy', mode: 'light', mining: true };
  const worker = { postMessage() {} };
  const ws = { send() {} };
  const before = { state: JSON.stringify(state), worker, ws };
  i18n.setLanguage('en');
  assert.equal(JSON.stringify(state), before.state);
  assert.equal(worker, before.worker);
  assert.equal(ws, before.ws);
  assert.equal(i18n.t(state.status), 'connected to proxy');
});
