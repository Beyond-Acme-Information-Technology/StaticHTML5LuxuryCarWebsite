const { getLead, patchLead } = require('./leads-store');
const { formatUsd } = require('./stripe');
const { sendMail } = require('./mail');

function paymentIntentId(session) {
  const value = session?.payment_intent;
  if (!value) return '';
  return typeof value === 'string' ? value : value.id || '';
}

function alreadyRecorded(lead, sessionId) {
  const meta = lead.meta || {};
  if (meta.checkoutSessionId === sessionId && meta.paymentStatus === 'paid') return true;
  return (meta.surcharges || []).some((item) => item.checkoutSessionId === sessionId && item.status === 'paid');
}

async function sendPaidEmails(lead, session, kind) {
  const amount = formatUsd(session.amount_total || lead.meta?.quoteCents || 0);
  const when = [lead.meta?.date, lead.meta?.time].filter(Boolean).join(' ');
  const extra = kind === 'surcharge' ? 'extra charge' : 'trip';
  try {
    if (lead.email) {
      await sendMail({
        to: lead.email,
        subject: kind === 'surcharge' ? 'Extra charge paid' : 'Your trip is confirmed',
        text: `Thank you. We received ${amount} for your ${extra}.

Pickup: ${lead.meta?.pickup || 'See booking'}
Drop-off: ${lead.meta?.dropoff || 'See booking'}
When: ${when || 'See booking'}

Sign in anytime: ${process.env.PUBLIC_SITE_URL || 'https://www.awesomeservicesgroups.com'}/#/account

— Awesome Luxury Services Group LLC`,
      });
    }
  } catch (err) {
    console.error('paid customer mail:', err.message);
  }

  const staff = process.env.CONTACT_TO_EMAIL;
  if (!staff) return;
  try {
    await sendMail({
      to: staff,
      subject: `Payment received — ${lead.name || lead.email || lead.id}`,
      text: `${amount} paid for ${extra}.

Guest: ${lead.name || ''} ${lead.email || ''} ${lead.phone || ''}
Pickup: ${lead.meta?.pickup || ''}
Drop-off: ${lead.meta?.dropoff || ''}
When: ${when || ''}
Lead: ${lead.id}
Stripe session: ${session.id}`,
    });
  } catch (err) {
    console.error('paid staff mail:', err.message);
  }
}

async function applyPaidCheckout(session) {
  if (!session || session.payment_status !== 'paid') {
    const err = new Error('Payment is not complete');
    err.status = 400;
    throw err;
  }

  const leadId = session.metadata?.leadId || session.client_reference_id;
  if (!leadId) {
    const err = new Error('Checkout is missing the booking id');
    err.status = 400;
    throw err;
  }

  const lead = await getLead(leadId);
  if (!lead) {
    const err = new Error('Trip not found');
    err.status = 404;
    throw err;
  }

  if (alreadyRecorded(lead, session.id)) {
    return { lead, alreadyPaid: true };
  }

  const kind = session.metadata?.kind || 'booking';
  const meta = { ...(lead.meta || {}) };
  if (kind === 'surcharge') {
    meta.surcharges = (meta.surcharges || []).map((item) =>
      item.status === 'due' ? { ...item, status: 'paid', checkoutSessionId: session.id } : item
    );
    meta.paymentStatus = 'paid';
  } else {
    meta.paymentStatus = 'paid';
    meta.paidAt = new Date().toISOString();
    meta.checkoutSessionId = session.id;
    meta.paymentIntentId = paymentIntentId(session);
  }

  const updated = await patchLead(lead.id, {
    status: kind === 'surcharge' ? lead.status : 'confirmed',
    meta,
  });

  await sendPaidEmails(updated, session, kind);
  return { lead: updated, alreadyPaid: false };
}

module.exports = { applyPaidCheckout };
