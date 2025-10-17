const SENDGRID_URL = 'https://api.sendgrid.com/v3/mail/send';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const payload = req.body || {};
    console.log('api/send-email received payload:', payload);

    if (process.env.SENDGRID_API_KEY) {
      // forward to SendGrid
      const body = {
        personalizations: [
          { to: [{ email: process.env.CONTACT_TO_EMAIL || 'awesomeluxuryservices@gmail.com' }], subject: `Contact: ${payload.subject || 'No subject'}` }
        ],
        from: { email: process.env.FROM_EMAIL || 'no-reply@localhost', name: payload.name || 'Website Visitor' },
        content: [{ type: 'text/plain', value: `Name: ${payload.name || ''}\nEmail: ${payload.email || ''}\nPhone: ${payload.phone || ''}\n\nMessage:\n${payload.message || ''}` }]
      };

      const resp = await fetch(SENDGRID_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const txt = await resp.text();
        console.error('SendGrid error:', txt);
        res.status(502).json({ error: 'SendGrid error', detail: txt });
        return;
      }

      res.status(200).json({ ok: true, provider: 'sendgrid' });
      return;
    }

    // No provider configured — log and return success (for local/dev)
    res.status(200).json({ ok: true, note: 'Logged only (no provider configured)' });
  } catch (err) {
    console.error('api/send-email failed:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
// Vercel / serverless endpoint to handle contact form submissions.
// Behavior:
// - Accepts POST JSON payload { name, email, phone, subject, message }
// - If SENDGRID_API_KEY is set in environment, attempts to send via SendGrid
// - Otherwise logs payload and returns 200 so the frontend UX completes
// Replace or extend this with your preferred mail provider (SMTP, SES, Mailgun, etc.)

const SENDGRID_URL = 'https://api.sendgrid.com/v3/mail/send';

async function sendViaSendGrid(payload) {
  const body = {
    personalizations: [
      {
        to: [{ email: process.env.CONTACT_TO_EMAIL || 'awesomeluxuryservices@gmail.com' }],
        subject: `Contact form: ${payload.subject || 'No subject'}`,
      },
    ],
    from: { email: process.env.FROM_EMAIL || 'no-reply@yourdomain.com', name: payload.name || 'Website Visitor' },
    content: [
      {
        type: 'text/plain',
        value: `Name: ${payload.name || ''}\nEmail: ${payload.email || ''}\nPhone: ${payload.phone || ''}\n\nMessage:\n${payload.message || ''}`,
      },
    ],
  };

  const res = await fetch(SENDGRID_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SendGrid error: ${res.status} ${text}`);
  }

  return true;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body;

    // Basic validation
    if (!payload || !payload.email || !payload.message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Log for debugging (make sure logs are secure in production)
    console.log('Contact form payload:', JSON.stringify(payload));

    // If a SendGrid API key is configured, forward the message
    if (process.env.SENDGRID_API_KEY) {
      try {
        await sendViaSendGrid(payload);
        return res.status(200).json({ ok: true, provider: 'sendgrid' });
      } catch (err) {
        console.error('SendGrid send failed:', err);
        // fallthrough to success-with-warning so site UX isn't blocked
        return res.status(502).json({ error: 'SendGrid send failed', details: String(err) });
      }
    }
    // No provider configured: either return a success (logged-only) or an error
    // based on REQUIRE_EMAIL_PROVIDER. By default, REQUIRE_EMAIL_PROVIDER is falsy
    // so we return success for UX continuity.
    if (process.env.REQUIRE_EMAIL_PROVIDER && process.env.REQUIRE_EMAIL_PROVIDER !== 'false') {
      console.warn('No email provider configured but REQUIRE_EMAIL_PROVIDER is set; returning error');
      return res.status(500).json({ error: 'No email provider configured' });
    }

    return res.status(200).json({ ok: true, note: 'Logged only (no email provider configured)' });
  } catch (err) {
    console.error('send-email error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
