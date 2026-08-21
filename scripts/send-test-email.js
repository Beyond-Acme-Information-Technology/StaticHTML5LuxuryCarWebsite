const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const raw = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const env = {};
raw.split(/\r?\n/).forEach((line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const eq = trimmed.indexOf('=');
  if (eq < 1) return;
  env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
});

const transporter = nodemailer.createTransport({
  host: env.BREVO_SMTP_HOST,
  port: Number(env.BREVO_SMTP_PORT),
  secure: false,
  requireTLS: true,
  auth: { user: env.BREVO_SMTP_USER, pass: env.BREVO_SMTP_KEY },
});

transporter
  .sendMail({
    from: `"Awesome Luxury Services" <${env.FROM_EMAIL}>`,
    to: env.CONTACT_TO_EMAIL,
    subject: 'Website mail test — Awesome Luxury Services',
    text: 'This is a one-time test from the website SMTP setup. If you received this, Brevo delivery is working.',
  })
  .then((info) => {
    console.log('SEND=OK');
    console.log('MESSAGE_ID=' + (info.messageId || ''));
    console.log('RESPONSE=' + (info.response || ''));
  })
  .catch((err) => {
    console.log('SEND=FAIL');
    console.log('ERROR=' + (err && err.message ? err.message : String(err)));
    process.exit(2);
  });
