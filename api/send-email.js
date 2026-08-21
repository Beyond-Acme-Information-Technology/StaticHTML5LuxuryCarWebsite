/*
  Email endpoint: Brevo REST API (preferred), Brevo SMTP, then SendGrid.
  Env: BREVO_API_KEY, BREVO_SMTP_KEY, BREVO_SMTP_USER, SENDGRID_API_KEY,
       CONTACT_TO_EMAIL, FROM_EMAIL, REQUIRE_EMAIL_PROVIDER
*/

const { saveLead } = require('../lib/leads-store');
const { applyCors } = require('../lib/cors');

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';
const SENDGRID_URL = 'https://api.sendgrid.com/v3/mail/send';

const CONTACT_SUBJECT_LABELS = {
  booking: 'Booking Inquiry',
  general: 'General Question',
  corporate: 'Corporate Services',
  feedback: 'Feedback',
  other: 'Other',
};

function salesInbox() {
  return process.env.CONTACT_TO_EMAIL || 'awesomeluxuryservices@gmail.com';
}

function fromAddress() {
  return process.env.FROM_EMAIL || 'awesomeluxuryservices@gmail.com';
}

function isHoneypot(payload) {
  return Boolean(payload?.honeypot || payload?.website);
}

function buildBodies(payload) {
  const type = payload.type || 'contact';
  const name = payload.name || 'Website visitor';
  const contactSubject = CONTACT_SUBJECT_LABELS[payload.subject] || payload.subject;
  const subjectMap = {
    booking: `Booking request — ${name}`,
    job: `Job application — ${payload.position || payload.subject || name}`,
    contact: contactSubject ? `Website contact — ${contactSubject}` : `Website contact — ${name}`,
  };
  const subject = subjectMap[type] || payload.subject || 'Website Contact';
  const text =
    payload.message ||
    `Name: ${payload.name || ''}\nEmail: ${payload.email || ''}\nPhone: ${payload.phone || ''}`;
  const html = `<pre style="font-family:Georgia,serif;font-size:15px;line-height:1.5;white-space:pre-wrap">${escapeHtml(text)}</pre>`;
  return { subject, text, html, type, name };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function confirmationCopy(type, name) {
  const greet = name ? `Dear ${name},` : 'Hello,';
  if (type === 'booking') {
    return `${greet}\n\nThank you for requesting a reservation with Awesome Luxury Services Group. Our team will confirm availability and contact you shortly, usually within two hours during business hours.\n\nIf your travel is imminent, please call +1 (408) 805-4386.\n\n— Awesome Luxury Services Group LLC`;
  }
  if (type === 'job') {
    return `${greet}\n\nWe received your application. Our team will review it and contact you if there is a match.\n\n— Awesome Luxury Services Group LLC`;
  }
  return `${greet}\n\nThank you for contacting Awesome Luxury Services Group. We will reply as soon as possible.\n\n— Awesome Luxury Services Group LLC`;
}

async function sendViaBrevoApi({ to, replyTo, subject, text, html, name }) {
  const body = {
    sender: { email: fromAddress(), name: 'Awesome Luxury Services' },
    to: [{ email: to }],
    replyTo: replyTo ? { email: replyTo, name: name || undefined } : undefined,
    subject,
    textContent: text,
    htmlContent: html,
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
    throw new Error(`Brevo API error: ${resp.status} ${await resp.text()}`);
  }
}

async function sendViaBrevoSmtp({ to, replyTo, subject, text, html, name }) {
  let nodemailer;
  try {
    nodemailer = require('nodemailer');
  } catch {
    throw new Error('nodemailer is not installed');
  }
  const transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
    port: Number(process.env.BREVO_SMTP_PORT || 587),
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.BREVO_SMTP_USER || 'a2a92f001@smtp-brevo.com',
      pass: process.env.BREVO_SMTP_KEY,
    },
  });
  await transporter.sendMail({
    from: `"Awesome Luxury Services" <${fromAddress()}>`,
    to,
    replyTo: replyTo ? `"${name || 'Website visitor'}" <${replyTo}>` : undefined,
    subject,
    text,
    html,
  });
}

async function sendViaSendGrid({ to, replyTo, subject, text, name }) {
  const body = {
    personalizations: [{ to: [{ email: to }], subject }],
    from: { email: fromAddress(), name: 'Awesome Luxury Services' },
    reply_to: replyTo ? { email: replyTo, name: name || 'Website visitor' } : undefined,
    content: [{ type: 'text/plain', value: text }],
  };
  const resp = await fetch(SENDGRID_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    throw new Error(`SendGrid error: ${resp.status} ${await resp.text()}`);
  }
}

async function deliver(message) {
  if (process.env.BREVO_SMTP_KEY) {
    await sendViaBrevoSmtp(message);
    return 'brevo-smtp';
  }
  if (process.env.BREVO_API_KEY) {
    await sendViaBrevoApi(message);
    return 'brevo';
  }
  if (process.env.SENDGRID_API_KEY) {
    await sendViaSendGrid(message);
    return 'sendgrid';
  }
  return null;
}

module.exports = async (req, res) => {
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body || {};

    if (isHoneypot(payload)) {
      return res.status(200).json({ ok: true });
    }

    if (!payload.email || !payload.message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { subject, text, html, type, name } = buildBodies(payload);

    try {
      await saveLead({
        type,
        name,
        email: payload.email,
        phone: payload.phone || '',
        subject,
        message: text,
      });
    } catch (storeErr) {
      console.error('Lead store failed:', storeErr.message);
    }

    const message = {
      to: salesInbox(),
      replyTo: payload.email,
      subject,
      text,
      html,
      name,
    };

    const provider = await deliver(message);

    if (!provider) {
      if (process.env.REQUIRE_EMAIL_PROVIDER && process.env.REQUIRE_EMAIL_PROVIDER !== 'false') {
        return res.status(500).json({ error: 'No email provider configured' });
      }
      console.log('No email provider configured — lead accepted without send', { type });
      return res.status(200).json({ ok: true, note: 'Logged only (no email provider configured)' });
    }

    try {
      const confirm = confirmationCopy(type, name);
      await deliver({
        to: payload.email,
        subject: type === 'booking' ? 'We received your booking request' : 'We received your message',
        text: confirm,
        html: `<pre style="font-family:Georgia,serif;font-size:15px;line-height:1.5;white-space:pre-wrap">${escapeHtml(confirm)}</pre>`,
        name: 'Awesome Luxury Services',
      });
    } catch (confirmErr) {
      console.error('Confirmation email failed');
    }

    return res.status(200).json({ ok: true, provider });
  } catch (err) {
    console.error('send-email error:', err?.message || err);
    return res.status(502).json({ error: 'Email send failed' });
  }
};
