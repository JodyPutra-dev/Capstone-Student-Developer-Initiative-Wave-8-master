// api/exo.js
// Vercel serverless function that queries NASA Exoplanet Archive TAP as JSON via POST (ADQL).
export default async function handler(req, res) {
  try {
    // CORS (safe default for same-origin frontend)
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Vary', 'Origin');
    if (req.method === 'OPTIONS') return res.status(200).send(null);

    // sanitize inputs
    const max_pc = Math.min(Math.max(Number(req.query.max_pc ?? 20), 1), 5000);
    const min_p  = Math.min(Math.max(Number(req.query.min_p ?? 1), 1), 50);
    const limit  = Math.min(Math.max(Number(req.query.limit ?? 200), 1), 500);

    // ADQL: use TOP (ADQL-compliant); no trailing semicolon
    // Ordered by distance asc then host
    const adql = `
      SELECT TOP ${limit}
        pl_name, hostname, sy_pnum, sy_snum, sy_dist, disc_year, disc_method
      FROM pscomppars
      WHERE sy_dist IS NOT NULL
        AND sy_dist <= ${max_pc}
        AND sy_pnum >= ${min_p}
      ORDER BY sy_dist ASC, hostname ASC
    `.replace(/\s+/g, ' ').trim();

    const tapUrl = 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync';

    const r = await fetch(tapUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        request: 'doQuery',
        lang: 'ADQL',
        format: 'json',
        query: adql
      }).toString()
    });

    const text = await r.text();

    // NASA can return VOTable XML on error; just pass it through with same status
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    // try to detect json; otherwise return as text/xml
    try {
      const json = JSON.parse(text);
      res.setHeader('Content-Type', 'application/json');
      return res.status(r.status).send(JSON.stringify(json));
    } catch {
      // not JSON (probably VOTABLE error), pass raw
      res.setHeader('Content-Type', r.headers.get('content-type') || 'text/xml');
      return res.status(r.status).send(text);
    }
  } catch (e) {
    console.error('EXO proxy error:', e);
    return res.status(500).json({ error: 'Proxy failed', details: String(e) });
  }
}
