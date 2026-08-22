module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { storeKind, hasSupabase } = require('../lib/leads-store');

  return res.status(200).json({
    ok: true,
    emailConfigured: Boolean(
      process.env.BREVO_API_KEY || process.env.BREVO_SMTP_KEY || process.env.SENDGRID_API_KEY
    ),
    staffInboxConfigured: Boolean(process.env.STAFF_INBOX_TOKEN),
    clientPortalConfigured: Boolean(
      process.env.SUPABASE_URL &&
        process.env.SUPABASE_SERVICE_ROLE_KEY &&
        (process.env.BREVO_API_KEY || process.env.BREVO_SMTP_KEY)
    ),
    stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
    leadsStore: hasSupabase() ? 'supabase' : storeKind(),
  });
};
