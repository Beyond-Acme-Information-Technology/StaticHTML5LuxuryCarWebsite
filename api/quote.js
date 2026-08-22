const { applyCors } = require('../lib/cors');
const { tripDistance } = require('../lib/distance');
const { rateFor, computeQuote, CATEGORIES } = require('../lib/pricing');

module.exports = async (req, res) => {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const pickup = String(body.pickup || '').trim();
    const dropoff = String(body.dropoff || '').trim();
    const stops = Array.isArray(body.stops) ? body.stops : [];
    const rideCategory = CATEGORIES.includes(body.rideCategory) ? body.rideCategory : 'regular';
    if (!pickup || !dropoff) {
      return res.status(400).json({ error: 'Pickup and drop-off are required' });
    }

    const distance = await tripDistance({ pickup, dropoff, stops });
    const rate = await rateFor(distance.country, rideCategory);
    const quote = computeQuote({
      miles: distance.miles,
      stopCount: distance.stopCount,
      rate,
    });

    return res.status(200).json({
      ok: true,
      pickup,
      dropoff,
      stops: stops.map((item) => String(item || '').trim()).filter(Boolean),
      durationMinutes: distance.durationMinutes,
      country: distance.country,
      resolved: distance.resolved,
      quote,
    });
  } catch (err) {
    console.error('quote:', err.message);
    return res.status(err.status || 400).json({ error: err.message || 'Could not price this trip' });
  }
};
