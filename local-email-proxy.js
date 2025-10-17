const http = require('http');
const url = require('url');
const path = require('path');

const PORT = process.env.EMAIL_PROXY_PORT || 5001;
const SENDGRID_URL = 'https://api.sendgrid.com/v3/mail/send';

function parseJSONBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => (data += chunk));
    req.on('end', () => {
      try {
        const json = data ? JSON.parse(data) : {};
        resolve(json);
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

async function sendViaSendGrid(payload) {
  const body = {
    personalizations: [
      {
        to: [{ email: process.env.CONTACT_TO_EMAIL || 'awesomeluxuryservices@gmail.com' }],
        subject: `Contact form: ${payload.subject || 'No subject'}`,
      },
    ],
    from: { email: process.env.FROM_EMAIL || 'no-reply@localhost', name: payload.name || 'Website Visitor' },
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
    const txt = await res.text();
    throw new Error(`SendGrid error ${res.status}: ${txt}`);
  }
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url || '', true);
  if (req.method === 'POST' && parsed.pathname === '/api/send-email') {
    try {
      const payload = await parseJSONBody(req);
      console.log('Local email proxy received payload:', payload);

      if (process.env.SENDGRID_API_KEY) {
        try {
          await sendViaSendGrid(payload);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, provider: 'sendgrid' }));
          return;
        } catch (err) {
          console.error('SendGrid send failed:', err);
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: String(err) }));
          return;
        }
      }

      // No provider configured: log and return success note
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, note: 'Logged only (no provider configured)' }));
    } catch (err) {
      console.error('Proxy error:', err);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
    }
    return;
  }

  // Simple health
  if (req.method === 'GET' && parsed.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Local email proxy listening at http://localhost:${PORT}/api/send-email`);
  console.log('Set SENDGRID_API_KEY, FROM_EMAIL and CONTACT_TO_EMAIL env vars to enable real sending.');
});
