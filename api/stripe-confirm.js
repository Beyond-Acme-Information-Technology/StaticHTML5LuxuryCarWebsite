const { applyCors } = require('../lib/cors');
const { retrieveCheckout } = require('../lib/stripe');
const { getLead, patchLead } = require('../lib/leads-store');

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
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment is not complete' });
    }
    const leadId = session.metadata?.leadId || session.client_reference_id;
    const lead = await getLead(leadId);
    if (!lead) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const kind = session.metadata?.kind || 'booking';
    const meta = { ...(lead.meta || {}) };
    if (kind === 'surcharge') {
      meta.surcharges = (meta.surcharges || []).map((item) =>
        item.status === 'due' ? { ...item, status: 'paid', checkoutSessionId: sessionId } : item
      );
      meta.paymentStatus = 'paid';
    } else {
      meta.paymentStatus = 'paid';
      meta.paidAt = new Date().toISOString();
      meta.checkoutSessionId = sessionId;
      meta.paymentIntentId = session.payment_intent;
    }

    const updated = await patchLead(lead.id, {
      status: kind === 'surcharge' ? lead.status : 'confirmed',
      meta,
    });
    return res.status(200).json({ ok: true, lead: updated });
  } catch (err) {
    console.error('stripe-confirm:', err.message);
    return res.status(err.status || 500).json({ error: err.message || 'Could not confirm payment' });
  }
};
