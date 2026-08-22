const { applyCors } = require('../lib/cors');
const { loginDriver } = require('../lib/drivers-store');

function readBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body || '{}');
    } catch {
      return {};
    }
  }
  return req.body;
}

module.exports = async (req, res) => {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const body = readBody(req);
    const result = await loginDriver(body.phone, body.pin);
    return res.status(200).json({ ok: true, ...result });
  } catch (err) {
    return res.status(401).json({ error: err.message || 'Could not sign in' });
  }
};
