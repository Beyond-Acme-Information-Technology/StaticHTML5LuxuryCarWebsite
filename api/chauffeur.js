const { applyCors } = require('../lib/cors');
const { staffAuthorized, expectedStaffToken, readBearer } = require('../lib/staff-auth');
const { listDrivers, upsertDriver, loginDriver, sessionFromToken } = require('../lib/drivers-store');
const { assignDriver, driverAction, tripsForDriver, publicTrip, tripByTrackToken } = require('../lib/trip-ops');

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

function routeOf(req) {
  if (req.query && req.query.route) return String(req.query.route);
  const raw = String(req.url || '');
  if (raw.includes('/api/driver-auth')) return 'auth';
  if (raw.includes('/api/driver-trip')) return 'trip';
  if (raw.includes('/api/trip-track')) return 'track';
  if (raw.includes('/api/drivers')) return 'drivers';
  return '';
}

function readTrackToken(req) {
  if (req.query && req.query.t) return String(req.query.t);
  const raw = String(req.url || '');
  const search = raw.includes('?') ? raw.slice(raw.indexOf('?') + 1) : '';
  return new URLSearchParams(search).get('t') || new URLSearchParams(search).get('token') || '';
}

async function handleDrivers(req, res) {
  if (!expectedStaffToken()) {
    return res.status(503).json({ error: 'Staff inbox is not configured' });
  }
  if (!staffAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
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
}

async function handleAuth(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const body = readBody(req);
  const result = await loginDriver(body.phone, body.pin);
  return res.status(200).json({ ok: true, ...result });
}

async function handleTrip(req, res) {
  const session = await sessionFromToken(readBearer(req));
  if (!session) {
    return res.status(401).json({ error: 'Sign in as chauffeur' });
  }
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
}

async function handleTrack(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const token = readTrackToken(req).trim();
  if (!token) {
    return res.status(400).json({ error: 'Missing track token' });
  }
  const lead = await tripByTrackToken(token);
  if (!lead) {
    return res.status(404).json({ error: 'Trip not found' });
  }
  const trip = publicTrip(lead);
  return res.status(200).json({
    ok: true,
    trip: {
      ...trip,
      luggagePhoto: undefined,
    },
  });
}

module.exports = async (req, res) => {
  if (applyCors(req, res)) return;
  const route = routeOf(req);
  try {
    if (route === 'auth') return handleAuth(req, res);
    if (route === 'trip') return handleTrip(req, res);
    if (route === 'track') return handleTrack(req, res);
    return handleDrivers(req, res);
  } catch (err) {
    const code = route === 'auth' ? 401 : err.status || 400;
    console.error('chauffeur:', err.message);
    return res.status(code).json({ error: err.message || 'Chauffeur request failed' });
  }
};
