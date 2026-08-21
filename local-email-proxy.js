const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

function loadEnvFile(fileName) {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), fileName), 'utf8');
    raw.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eq = trimmed.indexOf('=');
      if (eq < 1) return;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) process.env[key] = value;
    });
  } catch {
    // optional
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env');

const sendEmail = require('./api/send-email');
const leads = require('./api/leads');
const health = require('./api/health');

const PORT = process.env.EMAIL_PROXY_PORT || 5001;

function parseJSONBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function vercelRes(res) {
  return {
    setHeader(key, value) {
      res.setHeader(key, value);
    },
    status(code) {
      return {
        json(obj) {
          if (res.headersSent) return;
          res.writeHead(code, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(obj));
        },
      };
    },
  };
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url || '', true);
  const proxyRes = vercelRes(res);

  try {
    if (parsed.pathname === '/api/send-email' && req.method === 'POST') {
      const payload = await parseJSONBody(req);
      await sendEmail({ method: 'POST', body: payload, headers: req.headers }, proxyRes);
      return;
    }

    if (parsed.pathname === '/api/leads') {
      const body = req.method === 'GET' ? {} : await parseJSONBody(req);
      await leads({ method: req.method, body, headers: req.headers }, proxyRes);
      return;
    }

    if (parsed.pathname === '/api/health' || parsed.pathname === '/health') {
      await health({ method: req.method, body: {}, headers: req.headers }, proxyRes);
      return;
    }
  } catch (err) {
    console.error('Proxy error:', err);
    if (!res.headersSent) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid request' }));
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Local API proxy listening at http://localhost:${PORT}/api/send-email`);
  console.log('Set BREVO_API_KEY or BREVO_SMTP_KEY, FROM_EMAIL, CONTACT_TO_EMAIL, and STAFF_INBOX_TOKEN.');
});
