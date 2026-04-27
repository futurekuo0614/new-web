export default async function handler(req, res) {
  const GAS = 'https://script.google.com/macros/s/AKfycbwRe2j2PePE1DMSDxFlYpRS-6FiLzednK3mdcQyIluKLZ3SqSBVJE7eesApoYbpZdJicg/exec';

  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    const qs = new URLSearchParams(req.query).toString();
    const url = qs ? GAS + '?' + qs : GAS;

    // 用 node-fetch 相容的方式，讓 Google 自己處理 redirect
    const r = await fetch(url, {
      method: req.method,
      headers: { 'User-Agent': 'Mozilla/5.0' },
      ...(req.method === 'POST' ? {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(req.body).toString()
      } : {})
    });

    const text = await r.text();
    
    // debug 用：先回傳原始文字看看
    res.setHeader('Content-Type', 'application/json');
    if (text.trim().startsWith('<')) {
      return res.status(200).json({ 
        status: 'error', 
        message: 'got HTML', 
        url: url,
        httpStatus: r.status,
        preview: text.substring(0, 500) 
      });
    }
    
    return res.status(200).json(JSON.parse(text));
  } catch (e) {
    return res.status(500).json({ status: 'error', message: e.message });
  }
}
