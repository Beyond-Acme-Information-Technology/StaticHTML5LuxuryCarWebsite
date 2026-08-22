const { applyCors } = require('../lib/cors');
const {
  hasClientStore,
  sessionFromToken,
  touchSession,
  accountForEmail,
  saveProfile,
} = require('../lib/client-auth');

function readToken(req) {
  const header = req.headers.authorization || req.headers.Authorization || '';
  return String(header).replace(/^Bearer\s+/i, '').trim();
}

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
  if (req.method !== 'GET' && req.method !== 'PATCH') {
    res.setHeader('Allow', 'GET, PATCH');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!hasClientStore()) {
    return res.status(503).json({ error: 'Client portal is not configured' });
  }

  try {
    const session = await sessionFromToken(readToken(req));
    if (!session) {
      return res.status(401).json({ error: 'Sign in again' });
    }
    const fresh = await touchSession(session);

    if (req.method === 'PATCH') {
      const profile = await saveProfile(session.email, readBody(req));
      return res.status(200).json({ ok: true, profile });
    }

    const account = await accountForEmail(session.email);
    return res.status(200).json({
      email: session.email,
      expiresAt: fresh.expires_at,
      ...account,
    });
  } catch (err) {
    console.error('client-leads:', err.message);
    return res.status(500).json({ error: 'Could not load your account' });
  }
};
