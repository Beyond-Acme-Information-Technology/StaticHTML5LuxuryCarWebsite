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

const required = [
  'BREVO_SMTP_HOST',
  'BREVO_SMTP_PORT',
  'BREVO_SMTP_USER',
  'BREVO_SMTP_KEY',
  'FROM_EMAIL',
  'CONTACT_TO_EMAIL',
  'STAFF_INBOX_TOKEN',
];
const missing = required.filter((key) => !env[key]);
if (missing.length) {
  console.log('MISSING=' + missing.join(','));
  process.exit(1);
}

console.log('FIELDS_OK=true');
console.log('SMTP_USER=' + env.BREVO_SMTP_USER);
console.log('SMTP_HOST=' + env.BREVO_SMTP_HOST + ':' + env.BREVO_SMTP_PORT);
console.log('FROM=' + env.FROM_EMAIL);
console.log('TO=' + env.CONTACT_TO_EMAIL);
console.log('KEY_PREFIX=' + env.BREVO_SMTP_KEY.slice(0, 9));
console.log('KEY_LEN=' + env.BREVO_SMTP_KEY.length);

const transporter = nodemailer.createTransport({
  host: env.BREVO_SMTP_HOST,
  port: Number(env.BREVO_SMTP_PORT),
  secure: false,
  requireTLS: true,
  auth: { user: env.BREVO_SMTP_USER, pass: env.BREVO_SMTP_KEY },
});

transporter
  .verify()
  .then(() => {
    console.log('SMTP_VERIFY=OK');
  })
  .catch((err) => {
    console.log('SMTP_VERIFY=FAIL');
    console.log('ERROR=' + (err && err.message ? err.message : String(err)));
    process.exit(2);
  });
