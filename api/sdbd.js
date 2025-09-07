// api/sbdb.js
// Proxy to JPL Small-Body Database API (avoids CORS/DNS hiccups)
// Usage: /api/sbdb?spk=3542519  OR  /api/sbdb?des=433
export default async function handler(req, res) {
  try {
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Vary', 'Origin');
    if (req.method === 'OPTIONS') return res.status(200).send(null);

    const { spk, des } = req.query;
    if (!spk && !des) {
      return res.status(400).json({ error: "Missing 'spk' or 'des' query param" });
    }

    const qp = new URLSearchParams();
    if (spk) qp.set('spk', String(spk));
    if (des) qp.set('des', String(des));
    // optional: add 'phys-par=true' to include physical params table
    qp.set('phys-par', 'true');

    const url = `https://ssd-api.jpl.nasa.gov/sbdb.api?${qp.toString()}`;
    const r = await fetch(url);
    const text = await r.text();

    res.setHeader('Content-Type', 'application/json');
    return res.status(r.status).send(text);
  } catch (e) {
    console.error('SBDB proxy error:', e);
    return res.status(500).json({ error: 'Proxy failed', details: String(e) });
  }
}
