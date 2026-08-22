const { applyCors } = require('../lib/cors');
const { staffAuthorized, expectedStaffToken } = require('../lib/staff-auth');
const { listDrivers, upsertDriver } = require('../lib/drivers-store');
const { assignDriver } = require('../lib/trip-ops');

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
  if (!expectedStaffToken()) {
    return res.status(503).json({ error: 'Staff inbox is not configured' });
  }
  if (!staffAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      return res.status(200).json({ drivers: await listDrivers() });
    }
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }
    const body = readBody(req);
    if (body.action === 'assign') {
      const lead = await assignDriver(body.leadId || body.id, body.driverId);
      return res.status(200).json({ ok: true, lead });
    }
    const driver = await upsertDriver(body);
    return res.status(200).json({ ok: true, driver, drivers: await listDrivers() });
  } catch (err) {
    console.error('drivers:', err.message);
    return res.status(err.status || 400).json({ error: err.message || 'Could not save chauffeur' });
  }
};
