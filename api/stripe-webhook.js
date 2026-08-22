const { getStripe } = require('../lib/stripe');
const { applyPaidCheckout } = require('../lib/booking-pay');

module.exports.config = {
  api: {
    bodyParser: false,
  },
};

async function readRawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body, 'utf8');
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (chunks.length) return Buffer.concat(chunks);
  const err = new Error('Stripe webhook body was empty');
  err.status = 400;
  throw err;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('stripe-webhook: STRIPE_WEBHOOK_SECRET is not set');
    return res.status(503).json({ error: 'Stripe webhook is not configured' });
  }

  try {
    const stripe = getStripe();
    const rawBody = await readRawBody(req);
    const signature = req.headers['stripe-signature'];
    if (!signature) {
      return res.status(400).json({ error: 'Missing Stripe-Signature header' });
    }

    const event = stripe.webhooks.constructEvent(rawBody, signature, secret);
    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded'
    ) {
      const session = event.data.object;
      if (session.payment_status === 'paid') {
        await applyPaidCheckout(session);
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('stripe-webhook:', err.message);
    return res.status(err.status || 400).json({ error: err.message || 'Webhook failed' });
  }
};
