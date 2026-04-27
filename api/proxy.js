export default async function handler(req, res) {
  const GAS = 'https://script.google.com/macros/s/AKfycbzZx1BM0x7__C2SZzDbDFittEg3NOJmQG0zU-jCk6ZB6L9lWv8BkYc3ECFBkkiiJTIbzA/exec';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    const qs = new URLSearchParams(req.query).toString();
    const url = qs ? GAS + '?' + qs : GAS;

    const headers = {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/json, text/plain, */*',
    };

    let opts = {
      method: req.method,
      headers,
      redirect: 'follow',
    };

    if (req.method === 'POST') {
      opts.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      opts.body = new URLSearchParams(req.body).toString();
    }

    const r = await fetch(url, opts);
    const text = await r.text();

    console.log('GAS response status:', r.status);
    console.log('GAS response preview:', text.substring(0, 100));

    if (text.trim().startsWith('<')) {
      res.status(502).json({
        status: 'error',
        message: 'Apps Script 回傳 HTML（可能是 redirect 問題）',
        preview: text.substring(0, 200),
      });
      return;
    }

    res.status(200).json(JSON.parse(text));
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  }
}
