// Defaults for the local demo proxy. The webui lets the user override
// wallet + pool at runtime; these are just the fallback values used when
// the user hasn't customised anything.
module.exports = {
  // Default donation wallet. Replace with your own monero address if you
  // want this demo to mine to your own payout.
  WALLET:    '48bXUQRtnpeQdzdih1UVW9jTHhT1TvPwnhz5VNHu3W5T5eVkavZEpoJHThWiQbEiKp1wfeeNUj4oA7WfV15CBrSg2zDMJuE',
  POOL_HOST: 'pool.supportxmr.com',
  POOL_PORT: 3333,
  WORKER_NAME: 'gh-distro',

  // Local HTTP + WebSocket port for the webui.
  WS_PORT: 8080,
  // Raw TCP stratum port for xmrig and other standard stratum clients.
  STRATUM_TCP_PORT: 8081,
};