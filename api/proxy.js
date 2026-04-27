export default async function handler(req, res) {
  const GAS = 'https://script.google.com/macros/s/AKfycbwRe2j2PePE1DMSDxFlYpRS-6FiLzednK3mdcQyIluKLZ3SqSBVJE7eesApoYbpZdJicg/exec';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    const qs = new URLSearchParams(req.query).toString();
    const url = qs ? GAS + '?' + qs : GAS;

    let opts = { method: req.method };
    if (req.method === 'POST') {
      opts.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
      opts.body = new URLSearchParams(req.body).toString();
    }

    const r = await fetch(url, opts);
    const data = await r.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  }
}
