export default async function handler(req, res) {
  const GAS = 'https://script.google.com/macros/s/AKfycbwRe2j2PePE1DMSDxFlYpRS-6FiLzednK3mdcQyIluKLZ3SqSBVJE7eesApoYbpZdJicg/exec';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    const qs = new URLSearchParams(req.query).toString();
    const url = qs ? GAS + '?' + qs : GAS;

    let opts = { method: req.method, redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0' } };

    if (req.method === 'POST') {
      // 讀取 body（支援 urlencoded）
      const body = await new Promise((resolve) => {
        let data = '';
        req.on('data', chunk => { data += chunk; });
        req.on('end', () => resolve(data));
      });
      opts.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      opts.body = body;
    }

    const r = await fetch(url, opts);
    const text = await r.text();

    if (text.trim().startsWith('<')) {
      console.error('GAS returned HTML:', text.substring(0, 200));
      return res.status(502).json({ status: 'error', message: 'Apps Script 回傳 HTML，請確認部署權限設為「所有人」' });
    }

    return res.status(200).json(JSON.parse(text));
  } catch (e) {
    return res.status(500).json({ status: 'error', message: e.message });
  }
}
