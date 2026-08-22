const { applyCors } = require('../lib/cors');
const { tripByTrackToken, publicTrip } = require('../lib/trip-ops');

function readQuery(req) {
  if (req.query && req.query.t) return String(req.query.t);
  const raw = String(req.url || '');
  const search = raw.includes('?') ? raw.slice(raw.indexOf('?') + 1) : '';
  return new URLSearchParams(search).get('t') || new URLSearchParams(search).get('token') || '';
}

module.exports = async (req, res) => {
  if (applyCors(req, res)) return;
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const token = readQuery(req).trim();
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
};
