// Page-only controls. Automatic CPU work requires this browser's explicit opt-in.
(function () {
  'use strict';
  const key = 'randomx.mining.autostart';
  const t = source => window.RandomXI18n ? window.RandomXI18n.t(source) : source;
  function text(element, source) {
    if (!element) return;
    element.dataset.i18n = source;
    element.textContent = t(source);
  }
  let initialized = false;
  function initialize() {
    if (initialized) return;
    initialized = true;
    const panel = document.getElementById('embedBuilderContent');
    const panelToggle = document.getElementById('embedBuilderToggle');
    if (panel && panelToggle) {
      const render = () => {
        panelToggle.setAttribute('aria-expanded', String(!panel.hidden));
        text(panelToggle, panel.hidden ? 'Expand' : 'Minimize');
      };
      panel.hidden = true;
      render();
      panelToggle.addEventListener('click', () => { panel.hidden = !panel.hidden; render(); });
    }

    const checkbox = document.getElementById('uiAutostart');
    const status = document.getElementById('uiAutostartStatus');
    const start = document.getElementById('toggle');
    if (!checkbox || !start) return;
    let revoked = false;
    let consumed = false;
    try { revoked = localStorage.getItem(key) === 'revoked'; } catch {}
    checkbox.checked = !revoked;
    if (revoked) text(status, 'Automatic start was disabled. Check to resume auto-start on this page.');
    function startOnce() {
      if (consumed || revoked || document.hidden) return;
      consumed = true;
      if (!start.disabled && !start.classList.contains('active')) start.click();
      document.removeEventListener('visibilitychange', startOnce);
    }
    checkbox.addEventListener('change', () => {
      const requested = checkbox.checked;
      try {
        if (requested) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, 'revoked');
          if (localStorage.getItem(key) !== 'revoked') throw new Error('Revocation not saved');
        }
      } catch {
        checkbox.checked = !revoked;
        text(status, requested
          ? 'Automatic start could not be saved. Use Start for this session.'
          : 'Automatic start could not be disabled. Clear this site\'s storage to revoke it.');
        return;
      }
      revoked = !requested;
      if (!requested) {
        if (start.classList.contains('active')) start.click();
        document.removeEventListener('visibilitychange', startOnce);
        text(status, 'Automatic start disabled. Check to resume.');
        return;
      }
      text(status, 'Automatic start restored on this browser.');
      consumed = false;
      document.addEventListener('visibilitychange', startOnce);
      startOnce();
    });
    document.addEventListener('visibilitychange', startOnce);
    startOnce();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
  else initialize();
})();
