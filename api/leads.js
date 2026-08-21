const { listLeads, updateLeadStatus } = require('../lib/leads-store');

function readToken(req) {
  const header = req.headers.authorization || req.headers.Authorization || '';
  return String(header).replace(/^Bearer\s+/i, '').trim();
}

function authorized(req) {
  const expected = process.env.STAFF_INBOX_TOKEN;
  if (!expected) return false;
  return readToken(req) === expected;
}

module.exports = async (req, res) => {
  if (!process.env.STAFF_INBOX_TOKEN) {
    return res.status(503).json({ error: 'Staff inbox is not configured' });
  }

  if (!authorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      const leads = await listLeads();
      return res.status(200).json({ leads });
    }

    if (req.method === 'PATCH') {
      const body = req.body || {};
      if (!body.id || !body.status) {
        return res.status(400).json({ error: 'id and status are required' });
      }
      const lead = await updateLeadStatus(body.id, body.status);
      return res.status(200).json({ lead });
    }

    res.setHeader('Allow', 'GET, PATCH');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('leads api error:', err.message);
    return res.status(500).json({ error: 'Inbox unavailable' });
  }
};
