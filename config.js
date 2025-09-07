// config.js
// --- App configuration (loaded before script.js) ---
window.APP_CONFIG = {
  // NASA NeoWs (asteroids) base URL
  NASA_NEO_BASE_URL: 'https://api.nasa.gov/neo/rest/v1',

  // Serverless proxy for Exoplanet Archive (e.g., Vercel function at /api/exo)
  // On Vercel, keep this as '/api/exo'. If you use Cloudflare Worker, put the full URL.
  EXO_PROXY_BASE: '/api/exo',

  // Your NASA API key for NeoWs (asteroids). Use 'DEMO_KEY' for testing.
  NASA_API_KEY: 'ieKWA6eB6PvJzDGWeV15Cy8W2RB6Sw3g6oJxwZwk'
};
