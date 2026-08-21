const { applyCors } = require('../lib/cors');
const { sendMail } = require('../lib/mail');
const {
  hasClientStore,
  requestOtp,
  verifyOtp,
} = require('../lib/client-auth');

module.exports = async (req, res) => {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!hasClientStore()) {
    return res.status(503).json({ error: 'Client portal is not configured' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    if (body.action === 'request') {
      const { email, code } = await requestOtp(body.email);
      await sendMail({
        to: email,
        subject: 'Your Awesome Luxury Services login code',
        text: `Your client portal code is ${code}. It expires in 10 minutes.\n\nIf you did not request this, ignore this email.\n\n— Awesome Luxury Services Group LLC`,
      });
      return res.status(200).json({ ok: true });
    }

    if (body.action === 'verify') {
      const session = await verifyOtp(body.email, body.code);
      return res.status(200).json({ ok: true, token: session.token, email: session.email });
    }

    return res.status(400).json({ error: 'action must be request or verify' });
  } catch (err) {
    const status = err.status || 400;
    console.error('client-auth:', err.message);
    return res.status(status).json({ error: err.message || 'Login failed' });
  }
};
