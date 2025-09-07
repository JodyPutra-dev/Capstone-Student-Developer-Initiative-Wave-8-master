// Vercel Serverless Function: /api/exo
export default async function handler(req, res) {
  const origin = req.headers.origin || '*';
  const cors = {
    'Access-Control-Allow-Origin': origin, // for production, set to your domain
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
  if (req.method === 'OPTIONS') return res.status(200).set(cors).send(null);

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
    LIMIT ${limit}
  `.replace(/\s+/g, ' ').trim();

  const tapUrl =
    'https://exoplanetarchive.ipac.caltech.edu/TAP/sync' +
    `?request=doQuery&lang=adql&format=json&query=${encodeURIComponent(adql)}`;

  try {
    const r = await fetch(tapUrl);
    const text = await r.text();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
    res.status(r.status).send(text);
  } catch (e) {
    Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
    res.status(500).json({ error: 'Proxy failed', details: String(e) });
  }
}
