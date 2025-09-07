// api/neo.js
// One function, two targets:
//  - NeoWs (default): /api/neo?path=... (&other query params)
//  - JPL SBDB:        /api/neo?target=jpl&spk=... | &des=... | &sstr=...
const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';

export default async function handler(req, res) {
  try {
    // CORS
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Vary', 'Origin');
    if (req.method === 'OPTIONS') return res.status(200).send(null);

    const { target } = req.query;

    // === JPL SBDB branch =====================================================
    if (String(target || '') === 'jpl') {
      const { spk, des, sstr } = req.query;
      if (!spk && !des && !sstr) {
        return res.status(400).json({ error: "Missing 'spk' or 'des' or 'sstr' query param" });
      }
      const qp = new URLSearchParams();
      if (spk)  qp.set('spk', String(spk));
      if (des)  qp.set('des', String(des));
      if (sstr) qp.set('sstr', String(sstr));
      qp.set('phys-par', 'true'); // include physical parameters if available

      const upstream = `https://ssd-api.jpl.nasa.gov/sbdb.api?${qp.toString()}`;
      const r = await fetch(upstream);
      const text = await r.text();

      const ct = r.headers.get('content-type') || 'application/json';
      res.setHeader('Content-Type', ct.includes('json') ? 'application/json' : ct);
      res.setHeader('Cache-Control', 's-maxage=300');
      return res.status(r.status).send(text);
    }

    // === NeoWs branch (default) ==============================================
    const path = (req.query.path || 'neo/browse').toString().replace(/^\/+/, '');
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(req.query)) {
      if (k === 'path' || k === 'target') continue;
      params.set(k, String(v));
    }
    params.set('api_key', NASA_API_KEY);

    const url = `https://api.nasa.gov/neo/rest/v1/${path}?${params.toString()}`;
    const r = await fetch(url);
    const text = await r.text();

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 's-maxage=30');
    return res.status(r.status).send(text);
  } catch (e) {
    console.error('Proxy error:', e);
    return res.status(500).json({ error: 'Proxy failed', details: String(e) });
  }
}
