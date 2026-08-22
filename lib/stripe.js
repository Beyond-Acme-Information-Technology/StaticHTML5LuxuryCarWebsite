const { randomBytes } = require('crypto');

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    const err = new Error('Stripe is not configured');
    err.status = 503;
    throw err;
  }
  const Stripe = require('stripe');
  return new Stripe(key);
}

function integrationIdentifier(kind) {
  return `als-${kind || 'booking'}-${randomBytes(4).toString('hex')}`;
}

function siteOrigin() {
  return process.env.PUBLIC_SITE_URL || 'https://www.awesomeservicesgroups.com';
}

function formatUsd(cents) {
  return `$${(Number(cents || 0) / 100).toFixed(2)}`;
}

async function createCheckout({ amountCents, email, name, leadId, kind, reason }) {
  const stripe = getStripe();
  const payload = {
    mode: 'payment',
    customer_email: email,
    client_reference_id: leadId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(amountCents),
          product_data: {
            name: name || 'Awesome Luxury Services trip',
            description: reason || undefined,
          },
        },
      },
    ],
    metadata: { leadId, kind: kind || 'booking' },
    integration_identifier: integrationIdentifier(kind),
    success_url: `${siteOrigin()}/#/paid?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteOrigin()}/#/paid?pay=cancelled`,
  };
  try {
    return await stripe.checkout.sessions.create(payload);
  } catch (err) {
    if (!String(err.message || '').includes('integration_identifier')) throw err;
    delete payload.integration_identifier;
    return stripe.checkout.sessions.create(payload);
  }
}

async function retrieveCheckout(sessionId) {
  const stripe = getStripe();
  return stripe.checkout.sessions.retrieve(sessionId);
}

async function refundPayment(paymentIntentId) {
  const stripe = getStripe();
  return stripe.refunds.create({ payment_intent: paymentIntentId });
}

module.exports = {
  getStripe,
  siteOrigin,
  formatUsd,
  createCheckout,
  retrieveCheckout,
  refundPayment,
};
