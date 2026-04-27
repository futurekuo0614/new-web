export default async function handler(req, res) {
  const GAS = 'https://script.google.com/macros/s/AKfycbwRe2j2PePE1DMSDxFlYpRS-6FiLzednK3mdcQyIluKLZ3SqSBVJE7eesApoYbpZdJicg/exec';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    const qs = new URLSearchParams(req.query).toString();
    const url = qs ? GAS + '?' + qs : GAS;

    const headers = {
      'User-Agent': 'Mozilla/5.0 (compatible; Vercel/1.0)',
      'Accept': 'application/json',
    };

    let opts = { method: req.method, headers, redirect: 'manual' };

    if (req.method === 'POST') {
      opts.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      opts.body = new URLSearchParams(req.body).toString();
    }

    let r = await fetch(url, opts);

    // Apps Script 回傳 302，手動跟隨到最終 URL
    let hops = 0;
    while ((r.status === 301 || r.status === 302 || r.status === 303 || r.status === 307) && hops < 5) {
      const location = r.headers.get('location');
      if (!location) break;
      r = await fetch(location, { method: 'GET', headers, redirect: 'manual' });
      hops++;
    }

    const text = await r.text();

    if (text.trim().startsWith('<')) {
      res.status(502).json({
        status: 'error',
        message: 'Apps Script 仍回傳 HTML，redirect 跟隨失敗',
        hops,
        preview: text.substring(0, 300),
      });
      return;
    }

    res.status(200).json(JSON.parse(text));
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  }
}
