const { createHash, randomInt, randomUUID } = require('crypto');

function supabaseUrl() {
  return String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
}

function supabaseKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

function hasClientStore() {
  return Boolean(supabaseUrl() && supabaseKey());
}

function pepper() {
  return process.env.STAFF_INBOX_TOKEN || supabaseKey() || 'dev';
}

function hashValue(value) {
  return createHash('sha256').update(`${value}:${pepper()}`).digest('hex');
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function eqFilter(column, value) {
  return `${column}=eq.${encodeURIComponent(value)}`;
}

function ilikeFilter(column, value) {
  return `${column}=ilike.${encodeURIComponent(value)}`;
}

function restHeaders(extra = {}) {
  const key = supabaseKey();
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

async function rest(path, options = {}) {
  const resp = await fetch(`${supabaseUrl()}/rest/v1/${path}`, {
    ...options,
    headers: restHeaders(options.headers || {}),
  });
  if (!resp.ok) {
    throw new Error(`Supabase ${resp.status} ${await resp.text()}`);
  }
  const text = await resp.text();
  return text ? JSON.parse(text) : null;
}

async function requestOtp(email) {
  const normalized = normalizeEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error('Enter a valid email address');
  }

  const recent = await rest(
    `client_otps?${eqFilter('email', normalized)}&order=created_at.desc&limit=1`,
    { headers: { Prefer: 'return=representation' } }
  );
  if (Array.isArray(recent) && recent[0]) {
    const ageMs = Date.now() - new Date(recent[0].created_at).getTime();
    if (ageMs < 60 * 1000) {
      const err = new Error('Wait a minute before requesting another code');
      err.status = 429;
      throw err;
    }
  }

  const code = String(randomInt(100000, 1000000));
  await rest('client_otps', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      email: normalized,
      code_hash: hashValue(`${normalized}:${code}`),
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    }),
  });
  return { email: normalized, code };
}

async function verifyOtp(email, code) {
  const normalized = normalizeEmail(email);
  const cleaned = String(code || '').replace(/\D/g, '');
  const rows = await rest(
    `client_otps?${eqFilter('email', normalized)}&order=created_at.desc&limit=5`,
    { headers: { Prefer: 'return=representation' } }
  );
  const now = Date.now();
  const match = (rows || []).find(
    (row) =>
      row.code_hash === hashValue(`${normalized}:${cleaned}`) &&
      new Date(row.expires_at).getTime() > now
  );
  if (!match) {
    const err = new Error('That code is invalid or expired');
    err.status = 401;
    throw err;
  }

  const token = randomUUID();
  await rest('client_sessions', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      email: normalized,
      token_hash: hashValue(token),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }),
  });
  await fetch(
    `${supabaseUrl()}/rest/v1/client_otps?${eqFilter('email', normalized)}`,
    { method: 'DELETE', headers: restHeaders({ Prefer: 'return=minimal' }) }
  );
  return { email: normalized, token };
}

async function sessionFromToken(token) {
  if (!token) return null;
  const rows = await rest(
    `client_sessions?${eqFilter('token_hash', hashValue(token))}&limit=1`,
    { headers: { Prefer: 'return=representation' } }
  );
  const session = Array.isArray(rows) ? rows[0] : null;
  if (!session) return null;
  if (new Date(session.expires_at).getTime() <= Date.now()) return null;
  return session;
}

async function leadsForEmail(email) {
  const normalized = normalizeEmail(email);
  const rows = await rest(
    `leads?${ilikeFilter('email', normalized)}&select=*&order=created_at.desc&limit=100`,
    { headers: { Prefer: 'return=representation' } }
  );
  return (rows || []).map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    type: row.type,
    status: row.status,
    name: row.name,
    email: row.email,
    phone: row.phone,
    subject: row.subject,
    message: row.message,
  }));
}

module.exports = {
  hasClientStore,
  requestOtp,
  verifyOtp,
  sessionFromToken,
  leadsForEmail,
  normalizeEmail,
};
