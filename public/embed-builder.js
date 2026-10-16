(function () {
  'use strict';
  const form = document.getElementById('embedBuilder');
  if (!form) return;
  const field = name => form.elements.namedItem(name);
  const output = document.getElementById('embedSnippet');
  const status = document.getElementById('embedBuilderStatus');
  const preview = document.getElementById('embedPreview');
  const defaults = window.MINER_DEFAULTS || {};
  field('wallet').value = defaults.wallet || '';
  field('pool').value = defaults.poolHost || '';
  field('port').value = defaults.poolPort || 3333;
  field('proxy').value = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host;
  let instance = null;
  const t = text => window.RandomXI18n ? window.RandomXI18n.t(text) : text;
  const copy = {
    en: { controls: 'Mining controls', consent: 'I agree to use my device for this session.', start: 'Start mining', stop: 'Stop mining', allow: 'Allow this session', decline: 'Decline', custom: 'Custom DOM · headless API' },
    es: { controls: 'Controles de minería', consent: 'Acepto que se use mi dispositivo durante esta sesión.', start: 'Iniciar minería', stop: 'Detener minería', allow: 'Permitir esta sesión', decline: 'Rechazar', custom: 'DOM personalizado · API sin interfaz' },
  };
  const language = () => window.RandomXPreferences && window.RandomXPreferences.language === 'en' ? 'en' : 'es';
  function setStatus(source) { status.dataset.i18nSource = source; status.textContent = t(source); }
  let budgetModel = null;
  function renderBudget() {
    if (!budgetModel) return;
    const { threads, cores, workers, memory, initThreads } = budgetModel;
    document.getElementById('embedBudget').textContent = language() === 'es'
      ? `${threads}/${cores} hilos de minería en este dispositivo · ${workers != null ? `${workers} worker${workers === 1 ? '' : 's'} ligeros, aproximadamente ${memory} GB` : `inicialización con ${initThreads} hilos`}`
      : `${threads}/${cores} mining threads on this device · ${workers != null ? `${workers} light worker${workers === 1 ? '' : 's'}, about ${memory} GB` : `initialization ${initThreads} threads`}`;
  }

  function settings() {
    const config = { wallet: field('wallet').value.trim(), pool: field('pool').value.trim(),
      port: Number(field('port').value), proxy: field('proxy').value.trim(), routeQuery: field('routeQuery').value !== 'false',
      workerName: field('workerName').value.trim(), workload: Number(field('workload').value),
      nonceMode: field('nonceMode').value, keepalive: field('keepalive').value,
      mode: field('mode').value, headless: field('display').value === 'headless', quickstart: field('quickstart').checked };
    // This builder has no full-dataset control: its light snippets stay replica-free.
    if (config.mode === 'light') config.replicas = 0;
    return config;
  }
  const html = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const json = value => JSON.stringify(value, null, 2).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  function snippet(config) {
    const src = new URL(field('scriptURL').value.trim(), location.href);
    if (!['http:', 'https:'].includes(src.protocol) || src.username || src.password) throw new Error('Use an HTTP(S) embed script URL');
    const lines = [];
    const labels = copy[language()];
    if (config.headless) {
      lines.push(`<section id="randomx-custom" aria-label="${labels.controls}">
  <p id="rx-disclosure"></p>
  <label>CPU % <input id="rx-workload" type="number" min="0" max="80" step="any" value="${config.workload}"></label>
  ${config.quickstart ? '' : `<label><input id="rx-consent" type="checkbox"> ${labels.consent}</label>\n  `}<button id="rx-start" type="button">${labels.start}</button>
  <button id="rx-stop" type="button">${labels.stop}</button>
  <p id="rx-status" role="status"></p><output id="rx-rate">0 H/s</output>
</section>`);
    }
    lines.push(`<script src="${html(src.href)}" crossorigin="anonymous" data-auto="false"></script>`);
    lines.push('<script>');
    if (config.quickstart) {
      lines.push(`// Replace this handler with your site's consent statement / dialog.
// Call accept() only after informed consent; decline() cancels the request.
document.addEventListener('randomx:consent-request', function (event) {
  if (event.detail.instance !== window.randomxMiner) return;
  if (window.confirm(event.detail.disclosure)) event.detail.accept();
  else event.detail.decline();
});`);
    }
    lines.push('window.randomxMiner = RandomXEmbed.create(' + json(config) + ');');
    if (config.headless) {
      lines.push(`window.randomxMiner.bindControls({
  start: '#rx-start', stop: '#rx-stop', ${config.quickstart ? '' : "consent: '#rx-consent', "}
  workload: '#rx-workload', disclosure: '#rx-disclosure',
  status: '#rx-status', hashrate: '#rx-rate'
});`);
    }
    lines.push('</script>');
    return lines.join('\n');
  }
  function generate() {
    if (!form.reportValidity()) return false;
    try {
      const config = settings();
      // Validate through the actual API, without a widget, engine or network.
      const probe = RandomXEmbed.create({ ...config, headless: true, quickstart: false });
      const budget = probe.limits;
      const { threads, engine } = probe.state;
      probe.destroy();
      output.value = snippet(config);
      budgetModel = { threads, cores: budget.cores,
        workers: engine.runtime === 'workers' ? engine.workers : null,
        memory: (engine.memoryMiB / 1000).toFixed(1), initThreads: probe.config.initThreads };
      renderBudget();
      setStatus('Script generated');
      return true;
    } catch (error) { setStatus(error.message); return false; }
  }
  form.addEventListener('submit', event => { event.preventDefault(); generate(); });
  form.addEventListener('input', generate);
  document.getElementById('embedCopy').addEventListener('click', async () => {
    if (!generate()) return;
    try { await navigator.clipboard.writeText(output.value); setStatus('Script copied'); }
    catch (_) { output.focus(); output.select(); setStatus('Select and copy the script'); }
  });
  document.getElementById('embedShowPreview').addEventListener('click', () => {
    if (!generate()) return;
    if (instance) instance.destroy();
    preview.replaceChildren();
    const config = settings();
    config.assetBase = new URL('.', location.href).href;
    // This preview intentionally uses the local proxy and local build. The
    // exported snippet retains the deployer's selected bridge/CDN settings.
    config.proxy = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host;
    config.routeQuery = true;
    config.nonceMode = 'auto'; config.keepalive = 'auto';
    config.container = preview;
    instance = RandomXEmbed.create(config);
    if (config.headless) {
      const labels = copy[language()];
      const custom = document.createElement('div'); custom.className = 'custom-preview';
      const heading = document.createElement('p'); heading.className = 'rx-preview-heading'; heading.textContent = labels.custom;
      const disclosure = document.createElement('p'); disclosure.className = 'rx-disclosure';
      const workloadLabel = document.createElement('label'); workloadLabel.appendChild(document.createTextNode('CPU % '));
      const workload = document.createElement('input'); workload.className = 'rx-workload';
      workload.type = 'number'; workload.min = '0'; workload.max = '80'; workload.step = 'any'; workload.value = String(config.workload);
      workloadLabel.appendChild(workload);
      custom.append(heading, disclosure, workloadLabel);
      let consent = null;
      if (!config.quickstart) {
        const consentLabel = document.createElement('label');
        consent = document.createElement('input'); consent.className = 'rx-consent'; consent.type = 'checkbox';
        const consentText = document.createElement('span'); consentText.className = 'rx-preview-consent-text'; consentText.textContent = ` ${labels.consent}`;
        consentLabel.append(consent, consentText);
        custom.appendChild(consentLabel);
      }
      const start = document.createElement('button'); start.className = 'rx-start'; start.type = 'button'; start.textContent = labels.start;
      const stop = document.createElement('button'); stop.className = 'rx-stop'; stop.type = 'button'; stop.textContent = labels.stop;
      const runtimeStatus = document.createElement('p'); runtimeStatus.className = 'rx-status'; runtimeStatus.setAttribute('role', 'status');
      const rate = document.createElement('output'); rate.className = 'rx-rate'; rate.textContent = '0 H/s';
      custom.append(start, stop, runtimeStatus, rate);
      preview.appendChild(custom);
      instance.bindControls({ start, stop, consent, workload, disclosure, status: runtimeStatus, hashrate: rate });
    }
    setStatus('Preview ready');
  });
  document.getElementById('embedClearPreview').addEventListener('click', () => {
    if (instance) instance.destroy(); instance = null; preview.replaceChildren();
    setStatus('Preview cleared');
  });
  document.addEventListener('randomx:consent-request', ({ detail }) => {
    if (!instance || detail.instance !== instance) return;
    const old = preview.querySelector('.site-consent'); if (old) old.remove();
    const notice = document.createElement('div'); notice.className = 'site-consent';
    const text = document.createElement('p'); text.textContent = detail.disclosure;
    const allow = document.createElement('button'); allow.type = 'button'; allow.textContent = copy[language()].allow;
    const decline = document.createElement('button'); decline.type = 'button'; decline.textContent = copy[language()].decline;
    allow.addEventListener('click', () => { detail.accept(); notice.remove(); });
    decline.addEventListener('click', () => { detail.decline(); notice.remove(); });
    notice.append(text, allow, decline); preview.appendChild(notice); allow.focus();
    setStatus('Consent required');
  });
  window.addEventListener('randomx:languagechange', () => {
    if (status.dataset.i18nSource) status.textContent = t(status.dataset.i18nSource);
    renderBudget();
    const labels = copy[language()];
    const heading = preview.querySelector('.rx-preview-heading');
    const consentText = preview.querySelector('.rx-preview-consent-text');
    if (heading) heading.textContent = labels.custom;
    if (consentText) consentText.textContent = ` ${labels.consent}`;
    const starts = preview.querySelectorAll('.rx-start');
    const stops = preview.querySelectorAll('.rx-stop');
    starts.forEach(button => { button.textContent = labels.start; });
    stops.forEach(button => { button.textContent = labels.stop; });
    const consentButtons = preview.querySelectorAll('.site-consent button');
    if (consentButtons[0]) consentButtons[0].textContent = labels.allow;
    if (consentButtons[1]) consentButtons[1].textContent = labels.decline;
    if (output.value) generate();
  });
  window.addEventListener('pagehide', () => { if (instance) instance.destroy(); });
  generate();
})();
