// Run this function with the Playwright MCP browser_run_code tool.
// A fresh context and mocked worker/socket exercise the real page without CPU mining.
async (page) => {
  const context = await page.context().browser().newContext({ viewport: { width: 1280, height: 900 }, colorScheme: 'light' });
  const tab = await context.newPage();
  const errors = [];
  tab.on('pageerror', error => errors.push(error.message));
  const check = (condition, message) => { if (!condition) throw Error(message); };
  try {
    await tab.addInitScript(() => {
      window.uiProbe = { workers: 0, sockets: 0, terminated: 0, closed: 0, messages: [] };
      window.Worker = class {
        constructor() { window.uiProbe.workers++; }
        postMessage(message) {
          window.uiProbe.messages.push(message.type);
          if (message.type === 'init') queueMicrotask(() => this.onmessage({ data: { type: 'ready' } }));
          if (message.type === 'job') queueMicrotask(() => {
            this.onmessage({ data: { type: 'mode', mode: 'full' } });
            this.onmessage({ data: { type: 'dataset_progress', done: 100, total: 100, threads: 32 } });
            this.onmessage({ data: { type: 'hashrate', rate: 284 } });
          });
        }
        terminate() { window.uiProbe.terminated++; }
      };
      window.WebSocket = class {
        static OPEN = 1;
        constructor() {
          window.uiProbe.sockets++;
          this.readyState = 1;
          queueMicrotask(() => this.onopen());
        }
        send(raw) {
          const message = JSON.parse(raw);
          window.uiProbe.messages.push(message.method);
          if (message.method === 'login') queueMicrotask(() => this.onmessage({ data: JSON.stringify({ id: 1, result: { job: {
            job_id: 'ui-fixture', blob: '00'.repeat(76), seed_hash: '00'.repeat(32), target: 'ffffffff',
          } } }) }));
        }
        close() { window.uiProbe.closed++; }
      };
    });
    await tab.goto('http://localhost:8080/');
    check(await tab.locator('html').getAttribute('lang') === 'es', 'Spanish must be the first-visit language');
    check((await tab.locator('#toggle').textContent()).trim() === 'Iniciar', 'Default start control is Spanish');
    await tab.locator('#toggle').click();
    await tab.waitForFunction(() => document.getElementById('status').textContent === 'minando con 32 hilos');
    const before = await tab.evaluate(() => JSON.stringify(window.uiProbe));
    check((await tab.locator('#hashrateBar').innerText()).includes('284 H/s'), 'Rate received through worker boundary');
    await tab.selectOption('#uiLanguage', 'en');
    check(await tab.locator('#status').innerText() === 'mining with 32 threads', 'Live mining state switches to English');
    check(await tab.locator('#datasetBarMeta').innerText() === 'complete · 32 init threads', 'Completed dataset switches language without a new worker event');
    check((await tab.locator('#log').innerText()).includes('Logged in, received first job'), 'Existing log entries switch language');
    await tab.selectOption('#uiTheme', 'dark');
    check(await tab.locator('html').getAttribute('data-theme') === 'dark', 'Explicit dark theme');
    await tab.emulateMedia({ colorScheme: 'light' });
    check(await tab.locator('html').getAttribute('data-theme') === 'dark', 'Explicit dark ignores system appearance');
    await tab.selectOption('#uiTheme', 'system');
    check(await tab.locator('html').getAttribute('data-theme') === 'light', 'System light');
    await tab.emulateMedia({ colorScheme: 'dark' });
    await tab.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
    await tab.selectOption('#uiLanguage', 'es');
    check(await tab.locator('#datasetBarMeta').innerText() === 'completo · 32 hilos de inicio', 'Completed dataset switches back to Spanish');
    check(await tab.evaluate(() => JSON.stringify(window.uiProbe)) === before, 'Theme/language changes must not recreate, stop, close or send to engine/socket');
    await tab.selectOption('#uiTheme', 'dark');
    await tab.selectOption('#uiLanguage', 'en');
    await tab.reload();
    check(await tab.locator('html').getAttribute('lang') === 'en', 'Language restored after navigation');
    check(await tab.locator('html').getAttribute('data-theme') === 'dark', 'Theme restored after navigation');
    check((await tab.locator('#toggle').textContent()).trim() === 'Start', 'No new mining session started by preferences');
    for (const width of [1280, 360]) {
      await tab.setViewportSize({ width, height: 900 });
      check(await tab.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No horizontal page overflow at ${width}px`);
    }
    await tab.selectOption('#uiLanguage', 'es');
    check(errors.length === 0, `No runtime page errors: ${errors.join('; ')}`);
    return { status: 'PASS', checks: ['Spanish default', 'live ES/EN mining state and retained logs', 'completed dataset translation', 'no worker/socket interruption', 'light/dark/system and OS changes', 'preferences restored', '1280px and 360px without page overflow'], errors };
  } finally { await context.close(); }
}
