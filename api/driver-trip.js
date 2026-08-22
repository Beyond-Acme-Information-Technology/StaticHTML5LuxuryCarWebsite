const { applyCors } = require('../lib/cors');
const { readBearer } = require('../lib/staff-auth');
const { sessionFromToken } = require('../lib/drivers-store');
const { driverAction, tripsForDriver, publicTrip } = require('../lib/trip-ops');

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
  const session = await sessionFromToken(readBearer(req));
  if (!session) {
    return res.status(401).json({ error: 'Sign in as chauffeur' });
  }

  try {
    if (req.method === 'GET') {
      const trips = await tripsForDriver(session.driverId);
      return res.status(200).json({
        driver: session.driver,
        trips: trips.map((lead) => ({
          id: lead.id,
          name: lead.name,
          phone: lead.phone,
          email: lead.email,
          pickup: lead.meta?.pickup,
          dropoff: lead.meta?.dropoff,
          date: lead.meta?.date,
          time: lead.meta?.time,
          trip: publicTrip(lead),
        })),
      });
    }
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }
    const body = readBody(req);
    const lead = await driverAction(body.leadId || body.id, session.driverId, body);
    return res.status(200).json({ ok: true, trip: publicTrip(lead) });
  } catch (err) {
    console.error('driver-trip:', err.message);
    return res.status(400).json({ error: err.message || 'Could not update trip' });
  }
};
