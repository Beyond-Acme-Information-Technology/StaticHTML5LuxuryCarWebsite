const { applyCors } = require('../lib/cors');
const { readBearer } = require('../lib/staff-auth');
const { sessionFromToken } = require('../lib/client-auth');
const { getLead, patchLead } = require('../lib/leads-store');
const { createCheckout, formatUsd } = require('../lib/stripe');

module.exports = async (req, res) => {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await sessionFromToken(readBearer(req));
    if (!session) {
      return res.status(401).json({ error: 'Sign in to pay' });
    }
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const lead = await getLead(body.leadId);
    if (!lead || String(lead.email || '').toLowerCase() !== session.email) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    if (lead.status !== 'accepted' && lead.meta?.paymentStatus !== 'extra_due') {
      return res.status(400).json({ error: 'This trip is not ready for payment yet. Wait for staff to accept the quote.' });
    }

    const extra = (lead.meta?.surcharges || []).find((item) => item.status === 'due');
    const amountCents = extra ? extra.cents : lead.meta?.quoteCents;
    if (!amountCents) {
      return res.status(400).json({ error: 'No amount due' });
    }

    const checkout = await createCheckout({
      amountCents,
      email: lead.email,
      name: extra
        ? `Extra charge — ${extra.reason || extra.kind}`
        : `Trip ${lead.meta?.pickup || ''} to ${lead.meta?.dropoff || ''}`.slice(0, 120),
      leadId: lead.id,
      kind: extra ? 'surcharge' : 'booking',
      reason: extra ? extra.reason : `Quoted ${formatUsd(amountCents)}`,
    });

    await patchLead(lead.id, {
      meta: {
        ...lead.meta,
        checkoutUrl: checkout.url,
        checkoutSessionId: checkout.id,
      },
    });

    return res.status(200).json({ url: checkout.url });
  } catch (err) {
    console.error('pay:', err.message);
    return res.status(err.status || 500).json({ error: err.message || 'Could not start Stripe Checkout' });
  }
};
