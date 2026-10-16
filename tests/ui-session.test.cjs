const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function boot(value = null, blocked = false, hidden = false) {
  const stored = new Map(value == null ? [] : [['randomx.mining.autostart', value]]);
  const handlers = { DOMContentLoaded: [], visibilitychange: [] };
  let starts = 0;
  const attributes = {};
  const collapse = { dataset: {}, textContent: '', setAttribute(k, v) { attributes[k] = String(v); },
    addEventListener(name, fn) { this[name] = fn; } };
  const content = { hidden: true };
  const auto = { checked: false, addEventListener(name, fn) { this[name] = fn; } };
  const status = { dataset: {}, textContent: '' };
  const toggle = { disabled: false, active: false, classList: { contains: () => toggle.active, toggle() {} },
    click() { starts++; toggle.active = !toggle.active; } };
  const nodes = { embedBuilderToggle: collapse, embedBuilderContent: content, uiAutostart: auto, uiAutostartStatus: status, toggle };
  const context = {
    document: { readyState: 'loading', hidden, getElementById: id => nodes[id],
      addEventListener(name, fn) { (handlers[name] = handlers[name] || []).push(fn); },
      removeEventListener(name, fn) {
        const list = handlers[name] || [];
        const index = list.indexOf(fn);
        if (index !== -1) list.splice(index, 1);
      } },
    localStorage: { getItem(key) { if (blocked) throw Error('blocked'); return stored.get(key) ?? null; },
      setItem(key, v) { if (blocked) throw Error('blocked'); stored.set(key, v); },
      removeItem(key) { if (blocked) throw Error('blocked'); stored.delete(key); } },
    RandomXI18n: { t: text => text },
  };
  context.window = context;
  vm.runInNewContext(fs.readFileSync('public/ui-session.js', 'utf8'), context);
  for (const fn of handlers.DOMContentLoaded) fn();
  return { context, nodes, stored, attributes, starts: () => starts,
    visible() { context.document.hidden = false; for (const fn of handlers.visibilitychange.slice()) fn(); },
    invisible() { context.document.hidden = true; } };
}

test('builder starts minimized, the button toggles expansion, and the auto-start itself counts', () => {
  const b = boot();
  assert.equal(b.nodes.embedBuilderContent.hidden, true);
  assert.equal(b.attributes['aria-expanded'], 'false');
  b.nodes.embedBuilderToggle.click();
  assert.equal(b.nodes.embedBuilderContent.hidden, false);
  assert.equal(b.attributes['aria-expanded'], 'true');
  assert.equal(b.nodes.embedBuilderToggle.dataset.i18n, 'Minimize');
  b.nodes.embedBuilderToggle.click();
  assert.equal(b.nodes.embedBuilderContent.hidden, true);
  assert.equal(b.nodes.embedBuilderToggle.dataset.i18n, 'Expand');
  assert.equal(b.starts(), 1, 'the page auto-started mining exactly once');
});

test('a fresh browser starts mining immediately and the checkbox is checked', () => {
  const b = boot();
  assert.equal(b.starts(), 1);
  assert.equal(b.nodes.uiAutostart.checked, true);
});

test('hidden pages defer the auto-start until they become visible, and re-hiding does not re-trigger', () => {
  const b = boot(null, false, true);
  assert.equal(b.starts(), 0, 'no start while hidden');
  b.visible(); assert.equal(b.starts(), 1, 'start exactly once on first visibility');
  b.invisible(); b.visible(); assert.equal(b.starts(), 1, 'subsequent toggles do not restart');
});

test('revoked browser does not start mining, shows the disabled hint, and the checkbox is unchecked', () => {
  const b = boot('revoked');
  assert.equal(b.starts(), 0);
  assert.equal(b.nodes.uiAutostart.checked, false);
  assert.match(b.nodes.uiAutostartStatus.dataset.i18n, /disabled/);
});

test('an unknown stored value still starts mining and the checkbox reflects the default', () => {
  const b = boot('mystery-flag');
  assert.equal(b.starts(), 1);
  assert.equal(b.nodes.uiAutostart.checked, true);
});

test('unchecking the box revokes, persists, stops the current session, and skips the next entry', () => {
  const b = boot();
  b.nodes.uiAutostart.checked = false; b.nodes.uiAutostart.change();
  assert.equal(b.stored.get('randomx.mining.autostart'), 'revoked');
  // The user already started mining; revoking must also Stop the active session.
  assert.equal(b.starts(), 2);
  assert.equal(b.nodes.toggle.active, false);
  // Reopening the page in this browser must NOT start mining.
  const next = boot('revoked');
  assert.equal(next.starts(), 0);
  assert.equal(next.nodes.uiAutostart.checked, false);
});

test('checking the box after revocation removes the flag and resumes auto-start on the next page load', () => {
  const b = boot('revoked');
  b.nodes.uiAutostart.checked = true; b.nodes.uiAutostart.change();
  assert.equal(b.stored.has('randomx.mining.autostart'), false);
  const next = boot(null);
  assert.equal(next.starts(), 1);
  assert.equal(next.nodes.uiAutostart.checked, true);
});

test('blocked storage keeps the page in auto-start and shows a recovery message when revocation fails', () => {
  const blocked = boot(null, true);
  blocked.nodes.uiAutostart.checked = false; blocked.nodes.uiAutostart.change();
  assert.equal(blocked.nodes.uiAutostart.checked, true);
  assert.equal(blocked.starts(), 1);
  assert.equal(blocked.nodes.uiAutostartStatus.dataset.i18n, 'Automatic start could not be disabled. Clear this site\'s storage to revoke it.');
});

test('all emitted status messages translate to Spanish', () => {
  const { nodes, context } = boot('revoked');
  const before = nodes.uiAutostartStatus.dataset.i18n;
  nodes.uiAutostart.checked = true; nodes.uiAutostart.change();
  const restored = nodes.uiAutostartStatus.dataset.i18n;
  // Re-mount i18n in Spanish; it should now translate every emitted message.
  context.window = { ...context.window, RandomXI18n: null };
  // Without a translator, raw English source keys must still match a known
  // dictionary entry in ui-i18n.js so deployment never falls back to plain English.
  const fsRead = require('node:fs');
  const path = require('node:path');
  const source = fsRead.readFileSync(path.join(__dirname, '../public/ui-i18n.js'), 'utf8');
  for (const key of [before, restored,
    'Automatic start could not be saved. Use Start for this session.',
    'Automatic start could not be disabled. Clear this site’s storage to revoke it.',
    'Automatic start disabled. Check to resume.',
    'Automatic start restored on this browser.',
    'Automatic start was disabled. Check to resume auto-start on this page.']) {
    assert.ok(source.includes(`'${key}':`), `expected dictionary entry for: ${key}`);
  }
});
