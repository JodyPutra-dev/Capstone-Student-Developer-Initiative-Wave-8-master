// api/sbdb.js
export default async function handler(req, res) {
  try {
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Vary', 'Origin');
    if (req.method === 'OPTIONS') return res.status(200).send(null);

    const { spk, des, sstr } = req.query;
    if (!spk && !des && !sstr) {
      return res.status(400).json({ error: "Missing 'spk' or 'des' or 'sstr' query param" });
    }

    const qp = new URLSearchParams();
    if (spk) qp.set('spk', String(spk));
    if (des) qp.set('des', String(des));
    if (sstr) qp.set('sstr', String(sstr));
    qp.set('phys-par', 'true');

    const upstream = `https://ssd-api.jpl.nasa.gov/sbdb.api?${qp.toString()}`;
    const r = await fetch(upstream);
    const text = await r.text();

    const ct = r.headers.get('content-type') || 'application/json';
    res.setHeader('Content-Type', ct.includes('json') ? 'application/json' : ct);
    res.setHeader('Cache-Control', 's-maxage=300');
    return res.status(r.status).send(text);
  } catch (e) {
    console.error('SBDB proxy error:', e);
    return res.status(500).json({ error: 'Proxy failed', details: String(e) });
  }
}
