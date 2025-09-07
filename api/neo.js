// api/neo.js
// Proxy to NASA NeoWs so your frontend doesn't hit api.nasa.gov directly.
const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';

export default async function handler(req, res) {
  try {
    // Basic CORS for your site
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Vary', 'Origin');
    if (req.method === 'OPTIONS') return res.status(200).send(null);

    // path example: "neo/browse", "feed", "neo/3542519"
    const path = (req.query.path || 'neo/browse').toString().replace(/^\/+/, '');

    // Forward all query params except 'path'
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(req.query)) if (k !== 'path') params.set(k, String(v));
    params.set('api_key', NASA_API_KEY);

    const url = `https://api.nasa.gov/neo/rest/v1/${path}?${params.toString()}`;

    const r = await fetch(url);
    const text = await r.text();

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 's-maxage=30');
    return res.status(r.status).send(text);
  } catch (e) {
    console.error('Neo proxy error:', e);
    return res.status(500).json({ error: 'Proxy failed', details: String(e) });
  }
}
