const { applyCors } = require('../lib/cors');
const { hasClientStore, sessionFromToken, leadsForEmail } = require('../lib/client-auth');

function readToken(req) {
  const header = req.headers.authorization || req.headers.Authorization || '';
  return String(header).replace(/^Bearer\s+/i, '').trim();
}

module.exports = async (req, res) => {
  if (applyCors(req, res)) return;
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
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
    const leads = await leadsForEmail(session.email);
    return res.status(200).json({ email: session.email, leads });
  } catch (err) {
    console.error('client-leads:', err.message);
    return res.status(500).json({ error: 'Could not load your requests' });
  }
};
