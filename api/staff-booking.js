const { applyCors } = require('../lib/cors');
const { staffAuthorized, expectedStaffToken } = require('../lib/staff-auth');
const { getLead, patchLead } = require('../lib/leads-store');
const { listRates, upsertRate } = require('../lib/pricing');
const { createCheckout, refundPayment, formatUsd, siteOrigin } = require('../lib/stripe');
const { sendMail } = require('../lib/mail');

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
      return res.status(200).json({ rates: await listRates() });
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const body = readBody(req);

    if (body.action === 'save-rate') {
      const rate = await upsertRate(body);
      return res.status(200).json({ ok: true, rate, rates: await listRates() });
    }

    const lead = await getLead(body.id);
    if (!lead) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (body.action === 'accept') {
      if (!lead.meta?.quoteCents) {
        return res.status(400).json({ error: 'This request has no mileage quote to accept' });
      }
      const checkout = await createCheckout({
        amountCents: lead.meta.quoteCents,
        email: lead.email,
        name: `Trip ${lead.meta.pickup || ''} to ${lead.meta.dropoff || ''}`.slice(0, 120),
        leadId: lead.id,
        kind: 'booking',
        reason: `${lead.meta.miles || 0} miles`,
      });
      const updated = await patchLead(lead.id, {
        status: 'accepted',
        meta: {
          ...lead.meta,
          paymentStatus: 'unpaid',
          checkoutUrl: checkout.url,
          checkoutSessionId: checkout.id,
          acceptedAt: new Date().toISOString(),
        },
      });
      try {
        await sendMail({
          to: lead.email,
          subject: 'Your trip was accepted — complete payment',
          text: `Your quote of ${formatUsd(lead.meta.quoteCents)} was accepted.\n\nPay here to confirm the booking:\n${checkout.url}\n\nOr sign in at ${siteOrigin()}/#/account\n\n— Awesome Luxury Services Group LLC`,
        });
      } catch (mailErr) {
        console.error('accept mail:', mailErr.message);
      }
      return res.status(200).json({ ok: true, lead: updated });
    }

    if (body.action === 'refund') {
      const intent = lead.meta?.paymentIntentId;
      if (!intent) {
        return res.status(400).json({ error: 'No Stripe payment to refund' });
      }
      await refundPayment(intent);
      const updated = await patchLead(lead.id, {
        status: 'cancelled',
        meta: {
          ...lead.meta,
          paymentStatus: 'refunded',
          refundedAt: new Date().toISOString(),
        },
      });
      try {
        await sendMail({
          to: lead.email,
          subject: 'Your trip payment was refunded',
          text: `Your booking was cancelled and the Stripe payment was refunded.\n\n— Awesome Luxury Services Group LLC`,
        });
      } catch (mailErr) {
        console.error('refund mail:', mailErr.message);
      }
      return res.status(200).json({ ok: true, lead: updated });
    }

    if (body.action === 'surcharge') {
      const kind = body.kind === 'damage' ? 'damage' : 'wait';
      let cents = Math.round(Number(body.amountCents) || 0);
      if (kind === 'wait' && !cents) {
        const minutes = Math.max(1, Math.round(Number(body.minutes) || 0));
        const perMin = Number(lead.meta?.waitPerMinuteCents || 150);
        cents = minutes * perMin;
      }
      if (cents < 50) {
        return res.status(400).json({ error: 'Extra charge must be at least $0.50' });
      }
      const reason = String(body.reason || (kind === 'damage' ? 'Vehicle damage' : 'Wait time')).slice(0, 200);
      const surcharge = {
        id: `${Date.now()}`,
        kind,
        cents,
        reason,
        status: 'due',
        createdAt: new Date().toISOString(),
      };
      const checkout = await createCheckout({
        amountCents: cents,
        email: lead.email,
        name: `Extra charge — ${reason}`.slice(0, 120),
        leadId: lead.id,
        kind: 'surcharge',
        reason,
      });
      surcharge.checkoutUrl = checkout.url;
      const updated = await patchLead(lead.id, {
        meta: {
          ...lead.meta,
          paymentStatus: 'extra_due',
          checkoutUrl: checkout.url,
          surcharges: [...(lead.meta?.surcharges || []), surcharge],
        },
      });
      try {
        await sendMail({
          to: lead.email,
          subject: `Additional charge: ${formatUsd(cents)}`,
          text: `${reason}\nAmount due: ${formatUsd(cents)}\n\nPay here:\n${checkout.url}\n\n— Awesome Luxury Services Group LLC`,
        });
      } catch (mailErr) {
        console.error('surcharge mail:', mailErr.message);
      }
      return res.status(200).json({ ok: true, lead: updated });
    }

    return res.status(400).json({ error: 'action must be accept, refund, surcharge, or save-rate' });
  } catch (err) {
    console.error('staff-booking:', err.message);
    return res.status(err.status || 500).json({ error: err.message || 'Staff action failed' });
  }
};
