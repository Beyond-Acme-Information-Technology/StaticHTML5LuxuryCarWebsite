const nodemailer = require('nodemailer');

function fromAddress() {
  return process.env.FROM_EMAIL || 'awesomeluxuryservices@gmail.com';
}

async function sendMail({ to, subject, text }) {
  if (process.env.BREVO_SMTP_KEY) {
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
      subject,
      text,
    });
    return 'brevo-smtp';
  }

  if (process.env.BREVO_API_KEY) {
    const resp = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { email: fromAddress(), name: 'Awesome Luxury Services' },
        to: [{ email: to }],
        subject,
        textContent: text,
      }),
    });
    if (!resp.ok) {
      throw new Error(`Brevo API error: ${resp.status}`);
    }
    return 'brevo';
  }

  throw new Error('No email provider configured');
}

module.exports = { sendMail, fromAddress };
