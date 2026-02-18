/*
  Email endpoint: supports Brevo (recommended) and SendGrid as fallback.
  Environment variables accepted:
    - BREVO_API_KEY : API key for Brevo (Sendinblue)
    - SENDGRID_API_KEY : API key for SendGrid (optional fallback)
    - CONTACT_TO_EMAIL : recipient address
    - FROM_EMAIL : sender address (must be verified with provider)
    - REQUIRE_EMAIL_PROVIDER : if truthy, return error when no provider configured

  This endpoint accepts POST JSON: { name, email, phone, subject, message }
*/

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';
const SENDGRID_URL = 'https://api.sendgrid.com/v3/mail/send';

async function sendViaBrevo(payload) {
  const body = {
    sender: { email: process.env.FROM_EMAIL || 'no-reply@localhost', name: payload.name || 'Website Visitor' },
    to: [{ email: process.env.CONTACT_TO_EMAIL || 'awesomeluxuryservices@gmail.com' }],
    subject: payload.subject || 'Website Contact',
    textContent: `Name: ${payload.name || ''}\nEmail: ${payload.email || ''}\nPhone: ${payload.phone || ''}\n\nMessage:\n${payload.message || ''}`,
  };

  const resp = await fetch(BREVO_URL, {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Brevo error: ${resp.status} ${txt}`);
  }

  return true;
}

async function sendViaSendGrid(payload) {
  const body = {
    personalizations: [
      { to: [{ email: process.env.CONTACT_TO_EMAIL || 'awesomeluxuryservices@gmail.com' }], subject: payload.subject || 'Website Contact' }],
    from: { email: process.env.FROM_EMAIL || 'no-reply@yourdomain.com', name: payload.name || 'Website Visitor' },
    content: [{ type: 'text/plain', value: `Name: ${payload.name || ''}\nEmail: ${payload.email || ''}\nPhone: ${payload.phone || ''}\n\nMessage:\n${payload.message || ''}` }]
  };

  const resp = await fetch(SENDGRID_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`SendGrid error: ${resp.status} ${txt}`);
  }

  return true;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body || {};

    // Basic validation
    if (!payload || !payload.email || !payload.message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Contact form payload:', JSON.stringify(payload));

    // Prefer Brevo if configured
    if (process.env.BREVO_API_KEY) {
      try {
        await sendViaBrevo(payload);
        return res.status(200).json({ ok: true, provider: 'brevo' });
      } catch (err) {
        console.error('Brevo send failed:', err);
        return res.status(502).json({ error: 'Brevo send failed', details: String(err) });
      }
    }

    // Fallback to SendGrid
    if (process.env.SENDGRID_API_KEY) {
      try {
        await sendViaSendGrid(payload);
        return res.status(200).json({ ok: true, provider: 'sendgrid' });
      } catch (err) {
        console.error('SendGrid send failed:', err);
        return res.status(502).json({ error: 'SendGrid send failed', details: String(err) });
      }
    }

    // No provider configured
    if (process.env.REQUIRE_EMAIL_PROVIDER && process.env.REQUIRE_EMAIL_PROVIDER !== 'false') {
      console.warn('No email provider configured but REQUIRE_EMAIL_PROVIDER is set; returning error');
      return res.status(500).json({ error: 'No email provider configured' });
    }

    // Log the payload and return success for UX continuity in dev
    console.log('No email provider configured - logged payload only');
    return res.status(200).json({ ok: true, note: 'Logged only (no email provider configured)' });
  } catch (err) {
    console.error('send-email error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
