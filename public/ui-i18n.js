(function () {
  'use strict';

  // English source strings are deliberately kept as the lookup keys. Unknown
  // diagnostics pass through verbatim rather than risking a damaged payload.
  const es = {
    'collapse / expand': 'contraer / expandir',
    'show / hide wallet setup': 'mostrar / ocultar configuración de cartera',
    'Language': 'Idioma', 'Appearance': 'Apariencia', 'Theme': 'Tema',
    'Expand': 'Expandir', 'Minimize': 'Minimizar',
    'Automatic mining preferences': 'Preferencias de minería automática',
    'I authorize automatic mining on this device when I open this page.': 'Autorizo la minería automática en este dispositivo al abrir esta página.',
    'Mining uses CPU and electricity. This permission is saved only in this browser for this site, including production. Uncheck to disable future automatic starts; use Stop to end the current session.': 'La minería consume CPU y electricidad. El permiso se guarda solo en este navegador para este sitio, también en producción. Desmarca para desactivar futuros inicios automáticos; usa Detener para terminar la sesión actual.',
    'Automatic start could not be saved. Use Start for this session.': 'No se pudo guardar el inicio automático. Usa Iniciar para esta sesión.',
    'Automatic start could not be disabled. Clear this site’s storage to revoke it.': 'No se pudo desactivar el inicio automático. Borra los datos de este sitio para revocar el permiso.',
    'Automatic start disabled. Stop ends the current mining session.': 'Inicio automático desactivado. Detener termina la sesión de minería actual.',
    'Automatic start authorized on this browser. You can disable it here.': 'Inicio automático autorizado en este navegador. Puedes desactivarlo aquí.',
    'Automatic start was disabled. Check to resume auto-start on this page.': 'El inicio automático está desactivado. Marca la casilla para reanudarlo en esta página.',
    'Automatic start disabled. Check to resume.': 'Inicio automático desactivado. Marca la casilla para reanudarlo.',
    'Automatic start restored on this browser.': 'Inicio automático reanudado en este navegador.',
    "Automatic start could not be disabled. Clear this site's storage to revoke it.": "No se pudo desactivar el inicio automático. Borra los datos de este sitio para revocar el permiso.",
    'Interface preferences': 'Preferencias de interfaz',
    'Light': 'Claro', 'Dark': 'Oscuro', 'System': 'Sistema',
    'English': 'Inglés', 'Spanish': 'Español',
    'Choose the interface language.': 'Elige el idioma de la interfaz.',
    'Choose the color theme.': 'Elige el tema de color.',
    'Next share ETA': 'Tiempo estimado para el próximo share',
    'Start': 'Iniciar', 'Stop': 'Detener', 'Rebuild': 'Reconstruir',
    'Shares': 'Shares', 'accepted / rejected': 'aceptados / rechazados',
    'Mode': 'Modo', 'Status': 'Estado', 'Hashrate': 'Tasa de hash',
    'no samples yet': 'aún no hay muestras', 'Dataset build': 'Construcción del dataset',
    'not started': 'sin iniciar', 'not mining': 'minería inactiva',
    'Wallet setup': 'Configuración de cartera', 'Wallet': 'Cartera',
    'monero address': 'dirección de Monero', 'Set': 'Configurar',
    'payout destination · Set tests pool handshake': 'Destino de pago · Configurar comprueba la conexión con el pool',
    'Worker': 'Worker', 'worker name': 'nombre del worker',
    'identifier for this miner (Stratum pass field)': 'identificador de este minero (campo pass de Stratum)',
    'Preset': 'Preconfiguración', 'fills host + port (wallet unchanged)': 'completa host y puerto (la cartera no cambia)',
    'Pool': 'Pool', 'HOST': 'HOST', 'PORT': 'PUERTO', 'Donate': 'Donar',
    'set donate address macro': 'configurar dirección de donación',
    'apply on next Start (or Rebuild)': 'se aplica al iniciar (o reconstruir)',
    'Thread count': 'Cantidad de hilos', 'Threads': 'Hilos',
    'rebuild to adjust thread count': 'reconstruye para ajustar los hilos',
    'Embed script builder': 'Constructor de script insertable',
    'Embed configuration': 'Configuración de inserción',
    'Monero wallet': 'Cartera de Monero', 'TCP port': 'Puerto TCP',
    'WebSocket proxy': 'Proxy WebSocket', 'CPU %': 'CPU %', 'Interface': 'Interfaz',
    'Widget': 'Widget', 'Headless API': 'API sin interfaz', 'Quickstart': 'Inicio rápido',
    'Request consent on first interaction': 'Solicitar consentimiento en la primera interacción',
    'Advanced': 'Avanzado', 'Memory': 'Memoria', 'Full · 2.5 GiB': 'Completa · 2,5 GiB',
    'Light · ~300 MB per worker': 'Ligera · ~300 MB por worker',
    'Proxy routing': 'Enrutamiento del proxy', 'Add pool / port query': 'Añadir parámetros pool / port',
    'Fixed endpoint': 'Endpoint fijo', 'Nonce mode': 'Modo nonce', 'Negotiated': 'Negociado',
    'NiceHash': 'NiceHash', 'Keepalive': 'Keepalive', 'Required · every 15 s': 'Obligatorio · cada 15 s',
    'Script URL': 'URL del script', 'Deployment / CORS': 'Despliegue / CORS',
    'Endpoint': 'Endpoint', 'Configuration': 'Configuración', 'Host page': 'Página anfitriona',
    'Static assets': 'Recursos estáticos', 'Pool proxy': 'Proxy del pool',
    'HTML response headers': 'Cabeceras de respuesta HTML',
    'Cross-origin static asset response headers': 'Cabeceras para recursos estáticos de otro origen',
    'Verify in the embedding page’s console:': 'Verifica en la consola de la página que integra el script:',
    'Script': 'Script', 'Generate': 'Generar', 'Copy': 'Copiar', 'Preview': 'Vista previa', 'Clear': 'Limpiar',
    '- H/s': '- H/s', '- s': '- s',
    'supportxmr': 'supportxmr', 'moneroocean': 'moneroocean', 'Generated embed script': 'Script insertable generado',
    'HTTPS. Set COOP and COEP on the HTML response. These headers enable the shared memory used by WASM threads.': 'HTTPS. Configura COOP y COEP en la respuesta HTML. Estas cabeceras habilitan la memoria compartida que usan los hilos de WASM.',
    'Publish the complete': 'Publica el directorio completo',
    'directory to the script URL’s pinned release. For your own asset server, send the CORS and CORP headers below on JavaScript and WASM responses, including redirects.': 'en la versión fijada de la URL del script. Si usas tu propio servidor de recursos, envía las cabeceras CORS y CORP siguientes en las respuestas de JavaScript y WASM, incluidos los redireccionamientos.',
    'Use': 'Usa', 'on HTTPS pages. Forward WebSocket upgrades to the bridge. This bridge uses a': 'en páginas HTTPS. Reenvía las actualizaciones de WebSocket al bridge. Este bridge usa una consulta URL',
    'URL query; choose Fixed endpoint for proxies that select their pool internally. Match the disclosed pool to that endpoint. Message frames carry XMRig-shaped': '; elige Endpoint fijo para proxies que seleccionan el pool internamente. Asegúrate de que el pool declarado coincida con ese endpoint. Las tramas de mensajes llevan JSON-RPC compatible con XMRig:',
    'and': 'y', 'JSON-RPC. Native WebSocket ping/pong checks the transport.': 'JSON-RPC. El ping/pong nativo de WebSocket comprueba el transporte.',
    'Generated scripts use': 'Los scripts generados usan',
    '; asset requests omit cross-origin credentials. CORS belongs on the asset server. Adding it to the host page alone does not grant access to another server’s files.': '; las solicitudes de recursos omiten credenciales de otros orígenes. CORS debe configurarse en el servidor de recursos. Añadirlo solo a la página anfitriona no da acceso a los archivos de otro servidor.',
    'For an existing Content Security Policy, allow the asset origin in': 'Si ya tienes una política de seguridad de contenido, permite el origen de los recursos en',
    ', the proxy in': ', el proxy en', ', and': ', y', 'workers. Example for jsDelivr:': 'para los workers. Ejemplo con jsDelivr:',
    'Authorize inline initialization with your site’s script nonce or hash. For the widget stylesheet, pass a matching': 'Autoriza la inicialización en línea con el nonce o hash de script de tu sitio. Para la hoja de estilo del widget, pasa un',
    'and allow it in': 'y permítelo en', '. Keep your existing CSP directives. Browsers needing the broader WASM permission may require': '. Conserva las directivas CSP existentes. Algunos navegadores pueden requerir este permiso WASM más amplio:',
    'COEP also applies to other resources on the page: external scripts, fonts and images must support CORS or an appropriate CORP policy. WebSockets use an': 'COEP también se aplica a otros recursos de la página: scripts externos, fuentes e imágenes deben admitir CORS o una política CORP adecuada. WebSockets usan una cabecera',
    'header rather than CORS preflight; allow the embedding site in your proxy’s origin policy.': 'en lugar de una solicitud previa CORS; permite el sitio que integra el script en la política de orígenes del proxy.',
    'If isolation is false, check the HTML response headers and any': 'Si el aislamiento es falso, revisa las cabeceras de respuesta HTML y cualquier',
    'restriction on': 'restricción de',
    '. If assets fail, inspect their CORS/CORP headers and CSP errors. If the proxy fails, check TLS, its Origin policy, and the HTTP': '. Si fallan los recursos, revisa sus cabeceras CORS/CORP y los errores CSP. Si falla el proxy, comprueba TLS, su política de origen y la respuesta HTTP',
    'upgrade response. Safari’s local demo needs HTTPS; a CDN script cannot supply isolation headers for its host page.': 'de actualización. La demostración local en Safari requiere HTTPS; un script CDN no puede proporcionar cabeceras de aislamiento para la página anfitriona.',
    'Custom DOM · headless API': 'DOM personalizado · API sin interfaz',
    'I agree to use my device for this session.': 'Acepto que se use mi dispositivo durante esta sesión.',
    'Start mining': 'Iniciar minería', 'Stop mining': 'Detener minería',
    'Allow this session': 'Permitir esta sesión', 'Decline': 'Rechazar',
    'standby': 'en espera', 'disconnected': 'desconectado', 'Disconnected': 'Desconectado', 'connected to proxy': 'conectado al proxy',
    'error': 'error', 'worker error': 'error del worker', 'wasm ready': 'WASM listo',
    'stopped': 'detenido', 'starting…': 'iniciando…', 'building dataset': 'construyendo dataset',
    'nonce range exhausted; waiting for a new job': 'rango de nonce agotado; esperando un nuevo trabajo',
    'Mining stopped': 'Minería detenida', 'Connected to proxy': 'Conectado al proxy',
    'Threads changed to ': 'Hilos cambiados a ', 'terminating stale worker': 'se termina el worker anterior',
    'Hard rebuild: starting miner with ': 'Reconstrucción completa: iniciando minero con ',
    'Hard rebuild: no job cached yet, will pick up first job from pool': 'Reconstrucción completa: aún no hay trabajo guardado; se tomará el primero del pool',
    'Hard rebuild: respawning worker with ': 'Reconstrucción completa: reiniciando worker con ',
    'Donation defaults loaded — Hard rebuild (or Stop/Start) to apply': 'Valores de donación cargados — reconstruye (o detén e inicia) para aplicarlos',
    'Disconnected from proxy': 'Desconectado del proxy', 'New job received': 'Nuevo trabajo recibido',
    'Logged in, received first job': 'Sesión iniciada; se recibió el primer trabajo',
    'Share accepted! Total: ': '¡Share aceptado! Total: ',
    'Share rejected: ': 'Share rechazado: ', 'Error: ': 'Error: ',
    'Mining mode: ': 'Modo de minería: ', 'Found share! Nonce: ': '¡Share encontrado! Nonce: ',
    ', share diff ': ', dificultad del share ', ' / job diff ': ' / dificultad del trabajo ',
    'Dropped stale share for old job ': 'Share descartado por pertenecer al trabajo anterior ',
    'Dropped stale share for old job sequence ': 'Share descartado por pertenecer a la secuencia anterior ',
    'Share not submitted: pool connection is not open': 'Share no enviado: la conexión con el pool no está abierta',
    'WASM module loaded': 'Módulo WASM cargado', 'Replaying last job into fresh worker': 'Reenviando el último trabajo al worker nuevo',
    'Share rejected': 'Share rechazado', 'Pool connection error': 'Error de conexión con el pool',
    'WebSocket error': 'Error de WebSocket', 'Worker message error': 'Error de mensaje del worker',
    'Ready to mine': 'Listo para minar', 'Initializing cache...': 'Inicializando caché…',
    'Allocating full dataset...': 'Reservando el dataset completo…',
    'Released cache after full dataset init': 'Caché liberada tras inicializar el dataset completo',
    'Mining context ready': 'Contexto de minería listo',
    'Script generated': 'Script generado', 'Script copied': 'Script copiado',
    'Select and copy the script': 'Selecciona y copia el script', 'Preview ready': 'Vista previa lista',
    'Preview cleared': 'Vista previa limpiada', 'Consent required': 'Se requiere consentimiento',
    'Use an HTTP(S) embed script URL': 'Usa una URL HTTP(S) para el script insertable',
    'Handshake FAILED: WebSocket error': 'Conexión fallida: error de WebSocket',
    'Handshake TIMEOUT (no pool response in 6 s)': 'Tiempo agotado: el pool no respondió en 6 s',
    'Handshake FAILED: ': 'Conexión fallida: ',
    'Set: wallet, host, and port are all required': 'Configurar: se requieren cartera, host y puerto',
    'Testing…': 'Probando…', 'Testing handshake → ': 'Probando conexión → ',
    'Preset → ': 'Preconfiguración → ',
    'build=': 'compilación=', ' (cside-jit split)': ' (cside-jit dividido)',
    'No SharedArrayBuffer': 'Sin SharedArrayBuffer', ' (forced by ?sab=0)': ' (forzado por ?sab=0)',
    ' single-thread light-mode workers (randomx_st, ~300 MB each)': ' workers de modo ligero y un hilo (randomx_st, ~300 MB cada uno)',
    'JIT disabled by URL param.': 'JIT desactivado por parámetro de URL.',
    'crossOriginIsolated=': 'crossOriginIsolated=', 'true': 'true', 'false': 'false',
    'mining threads=': 'hilos de minería=', ', init threads=': ', hilos de inicio=',
    'threads': 'hilos', 'full': 'completo', 'light': 'ligero',
    'awaiting hashrate': 'esperando tasa de hash', 'complete': 'completo',
    'starting': 'iniciando', 'elapsed': 'transcurrido', 'mean': 'promedio', 'over': 'excedido', 'to go': 'restantes',
    'max': 'máx.', 'session': 'sesión', 'mining with': 'minando con',
    'Initializing full dataset (': 'Inicializando dataset completo (', ' items)...': ' elementos)…',
    'Mining context ready (': 'Contexto de minería listo (', ' VMs)': ' VM)',
    'init_dataset_start failed; falling back to chunked path': 'falló init_dataset_start; se usará inicialización por bloques',
    'Failed to allocate cache': 'No se pudo reservar la caché',
    'Failed to allocate full dataset': 'No se pudo reservar el dataset completo',
    'Failed to create VM': 'No se pudo crear la VM',
    'Failed to create mining thread VMs': 'No se pudieron crear las VM de minería',
    'Parallel mining batch failed': 'Falló el lote de minería paralela',
    'wasm': 'WASM',
  };

  const rules = [
    [/^mining with (\d+) threads?$/, (_, n) => `minando con ${n} ${n === '1' ? 'hilo' : 'hilos'}`],
    [/^light \(no SAB, (\d+) workers\)$/, (_, n) => `ligero (sin SAB, ${n} workers)`],
    [/^(\d+) full \+ (\d+) light(?: \(no SAB\))?$/, (_, full, light) => `${full} completos + ${light} ligeros`],
    [/^rebuilding with (\d+) threads?…$/, (_, n) => `reconstruyendo con ${n} ${n === '1' ? 'hilo' : 'hilos'}…`],
    [/^Mining mode: (.+)$/, (_, mode) => `Modo de minería: ${translate(mode)}`],
    [/^Threads changed to (\d+); terminating stale worker$/, (_, n) => `Hilos cambiados a ${n}; se termina el worker anterior`],
    [/^Hard rebuild: starting miner with (\d+) threads$/, (_, n) => `Reconstrucción completa: iniciando minero con ${n} hilos`],
    [/^Hard rebuild: respawning worker with (\d+) threads$/, (_, n) => `Reconstrucción completa: reiniciando worker con ${n} hilos`],
    [/^ in full mode \((\d+) threads\)$/, (_, n) => ` en modo completo (${n} hilos)`],
    [/^ in light mode$/, () => ' en modo ligero'],
    [/^ with core profile$/, () => ' con perfil del núcleo'],
    [/^ without JIT$/, () => ' sin JIT'],
    [/^ (\d+) of them build and mine on a full dataset replica \(~2.3 GB each\)$/, (_, n) => `${n} de ellos construyen y minan sobre una réplica completa del dataset (~2,3 GB cada una)`],
    [/^fb_full=(\d+): fb_full.js not loaded, staying in light mode$/, (_, n) => `fb_full=${n}: fb_full.js no está cargado; se mantiene el modo ligero`],
    [/^fb_full: (\d+)\/(\d+) replica\(s\) mining in full mode$/, (_, ready, total) => `fb_full: ${ready}/${total} réplica(s) minando en modo completo`],
    [/^fb_full: dataset replica complete, released cache$/, () => 'fb_full: réplica del dataset completa; caché liberada'],
    [/^Initializing full dataset \((\d+) items\)\.\.\.$/, (_, items) => `Inicializando dataset completo (${items} elementos)…`],
    [/^Mining context ready \((\d+) VMs\)$/, (_, count) => `Contexto de minería listo (${count} VM)`],
    [/^coi: (.+)$/, (_, detail) => `coi: ${detail}`],
    [/^No SharedArrayBuffer( \(forced by \?sab=0\))?: (\d+) single-thread light-mode workers \(randomx_st, ~([\d.]+) MB each\)$/, (_, forced, count, memory) => `Sin SharedArrayBuffer${forced ? ' (forzado por ?sab=0)' : ''}: ${count} workers de modo ligero y un hilo (randomx_st, ~${memory} MB cada uno)`],
    [/^navigator\.hardwareConcurrency=(.+), mining threads=(\d+), init threads=(\d+)$/, (_, hardware, mining, init) => `navigator.hardwareConcurrency=${hardware}, hilos de minería=${mining}, hilos de inicio=${init}`],
    [/^Starting miner(.*) in full mode \((\d+) threads\)(.*)\.\.\.$/, (_, jit, threads, profile) => `Iniciando minero${translate(jit)} en modo completo (${threads} hilos)${translate(profile)}…`],
    [/^Starting miner(.*) in light mode(.*)\.\.\.$/, (_, jit, profile) => `Iniciando minero${translate(jit)} en modo ligero${translate(profile)}…`],
    [/^Core profile (\d+) hashes: init ([\d.]+)%, bytecode ([\d.]+)%, run-other ([\d.]+)%, final ([\d.]+)%$/, (_, hashes, init, bytecode, other, final) => `Perfil del núcleo ${hashes} hashes: inicio ${init}%, bytecode ${bytecode}%, ejecución-resto ${other}%, final ${final}%`],
    [/^JIT fallback: (.+)$/, (_, detail) => `Alternativa de JIT: ${detail}`],
    [/^JIT experiment mode active: (.+) \(hashes will be WRONG; use only for timing analysis\)$/, (_, mode) => `Modo experimental de JIT activo: ${mode} (los hashes serán INCORRECTOS; úsalo solo para medir tiempos)`],
    [/^JIT experiment mode active: (.+) \(hashes are correct\)$/, (_, mode) => `Modo experimental de JIT activo: ${mode} (los hashes son correctos)`],
    [/^Pool target → ([^,]+), wallet (.+)$/, (_, target, wallet) => `Destino del pool → ${target}, cartera ${wallet}`],
    [/^Found share! Nonce: (.+), share diff (.+) \/ job diff (.+)$/, (_, nonce, share, job) => `¡Share encontrado! Nonce: ${nonce}, dificultad del share ${share} / dificultad del trabajo ${job}`],
    [/^Share accepted! Total: (\d+)$/, (_, total) => `¡Share aceptado! Total: ${total}`],
    [/^Share rejected: (.+)$/, (_, message) => `Share rechazado: ${message}`],
    [/^Error: (.+)$/, (_, message) => `Error: ${message}`],
    [/^Job diff (.+), est share ([\d.]+)s$/, (_, diff, eta) => `Dificultad del trabajo ${diff}, share estimado en ${eta} s`],
    [/^Job diff (.+)$/, (_, detail) => `Dificultad del trabajo ${detail}`],
    [/^\[worker (\d+)\] (.+)$/, (_, worker, message) => `[worker ${worker}] ${translate(message)}`],
    [/^Handshake OK — pool accepted login \(job (.+)\)$/, (_, job) => `Conexión correcta: el pool aceptó el inicio de sesión (trabajo ${job})`],
    [/^Handshake FAILED: (.+)$/, (_, message) => `Conexión fallida: ${translate(message)}`],
    [/^Testing handshake → (.+), wallet (.+)$/, (_, target, wallet) => `Probando conexión → ${target}, cartera ${wallet}`],
    [/^Preset → (.+)$/, (_, preset) => `Preconfiguración → ${preset}`],
    [/^(.+); reconnecting in (\d+)s(?:…|\.\.\.)$/, (_, reason, seconds) => `${translate(reason)}; reconectando en ${seconds} s…`],
    [/^(\d+) init threads$/, (_, n) => `${n} hilos de inicio`],
    [/^Automatic start (?:was )?disabled\.( Check to resume\.?| Stop ends the current mining session\.)$/, (_, tail) => `Inicio automático desactivado.${translate(tail)}`],
    [/^Automatic start (?:was )?(?:disabled|authorized|restored|not)(?:[a-z .]*)?$/i, (_, text) => translate(text)],
    [/^~(\d+)s remaining · (.+)$/, (_, seconds, threads) => `~${seconds} s restantes · ${translate(threads)}`],
    [/^complete · (.+)$/, (_, threads) => `completo · ${translate(threads)}`],
    [/^([\d.]+)s elapsed · ~([\d.]+)s mean · ([\d.]+)s over$/, (_, e, m, o) => `${e} s transcurridos · ~${m} s promedio · ${o} s excedidos`],
    [/^([\d.]+)s elapsed · ~([\d.]+)s mean · ([\d.]+)s to go$/, (_, e, m, r) => `${e} s transcurridos · ~${m} s promedio · ${r} s restantes`],
    [/^max ([\d.]+) H\/s · session$/, (_, n) => `máx. ${n} H/s · sesión`],
  ];

  let localLanguage = 'es';
  const preferences = () => window.RandomXPreferences;
  function language() {
    const pref = preferences();
    const value = pref && pref.language;
    return value === 'en' || value === 'es' ? value : localLanguage;
  }
  function translate(text) {
    const source = String(text);
    if (language() !== 'es') return source;
    if (Object.prototype.hasOwnProperty.call(es, source)) return es[source];
    for (const [pattern, render] of rules) {
      const match = source.match(pattern);
      if (match) return render(...match);
    }
    return source;
  }
  function apply(root) {
    root = root || document;
    const query = (selector) => root.querySelectorAll ? Array.from(root.querySelectorAll(selector)) : [];
    for (const node of query('[data-i18n]')) {
      const source = node.getAttribute('data-i18n');
      node.textContent = translate(source);
    }
    for (const [attribute, marker] of [['title', 'data-i18n-title'], ['aria-label', 'data-i18n-aria-label'], ['placeholder', 'data-i18n-placeholder']]) {
      for (const node of query(`[${marker}]`)) node.setAttribute(attribute, translate(node.getAttribute(marker)));
    }
    for (const node of query('[data-i18n-log-source]')) {
      const time = node.dataset.i18nLogTime || '';
      node.textContent = `${time}${time ? ' ' : ''}${translate(node.dataset.i18nLogSource)}`;
    }
  }
  function setLanguage(value) {
    if (value !== 'es' && value !== 'en') return;
    const pref = preferences();
    if (pref && typeof pref.setLanguage === 'function') pref.setLanguage(value);
    else { localLanguage = value; apply(); }
  }
  window.RandomXI18n = { t: translate, apply, setLanguage, get language() { return language(); } };
  window.addEventListener('randomx:languagechange', () => apply());
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => apply());
  else apply();
})();
