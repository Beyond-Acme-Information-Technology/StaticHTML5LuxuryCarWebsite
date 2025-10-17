const http = require('http');
const https = require('https');
const { URL } = require('url');

const endpoint = process.env.EMAIL_TEST_ENDPOINT || 'http://localhost:5001/api/send-email';

const payload = {
  name: 'Test User',
  email: 'test@example.com',
  phone: '+1-555-555-5555',
  subject: 'general',
  message: 'This is a test message from test-contact-proxy.js',
};

function postJson(urlStr, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const body = JSON.stringify(data);
    const opts = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const lib = url.protocol === 'https:' ? https : http;

    const req = lib.request(opts, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });

    req.on('error', (err) => reject(err));
    req.write(body);
    req.end();
  });
}

(async () => {
  try {
    const res = await postJson(endpoint, payload);
    console.log('Status:', res.status);
    console.log('Response:', res.body);
  } catch (err) {
    console.error('Error sending test payload:', err.message || err);
    process.exitCode = 1;
  }
})();
