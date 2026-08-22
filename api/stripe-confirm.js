const { applyCors } = require('../lib/cors');
const { retrieveCheckout } = require('../lib/stripe');
const { applyPaidCheckout } = require('../lib/booking-pay');

module.exports = async (req, res) => {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const sessionId = String(body.sessionId || '').trim();
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }
    const session = await retrieveCheckout(sessionId);
    const result = await applyPaidCheckout(session);
    return res.status(200).json({ ok: true, alreadyPaid: result.alreadyPaid, lead: result.lead });
  } catch (err) {
    console.error('stripe-confirm:', err.message);
    return res.status(err.status || 500).json({ error: err.message || 'Could not confirm payment' });
  }
};
