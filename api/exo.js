export default async function handler(req, res) {
  try {
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Vary', 'Origin');

    if (req.method === 'OPTIONS') return res.status(200).send(null);

    const max_pc = Math.min(Number(req.query.max_pc ?? 20), 5000);
    const min_p  = Math.max(Number(req.query.min_p ?? 1), 1);
    const limit  = Math.min(Number(req.query.limit ?? 200), 500);

    const adql = `
      SELECT pl_name, hostname, sy_pnum, sy_snum, sy_dist, disc_year, disc_method
      FROM pscomppars
      WHERE sy_dist IS NOT NULL
        AND sy_dist <= ${max_pc}
        AND sy_pnum >= ${min_p}
      ORDER BY sy_dist ASC, hostname ASC
      FETCH FIRST ${limit} ROWS ONLY
    `.replace(/\s+/g, ' ').trim(); // 🚨 use FETCH FIRST ... ROWS ONLY (ADQL compliant)

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
    res.setHeader('Content-Type', 'application/json');
    return res.status(r.status).send(text);
  } catch (e) {
    console.error('EXO proxy error:', e);
    return res.status(500).json({ error: 'Proxy failed', details: String(e) });
  }
}
