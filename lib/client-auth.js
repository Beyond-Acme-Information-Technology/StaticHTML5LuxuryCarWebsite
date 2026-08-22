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
  return { email: normalized, token, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() };
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

async function touchSession(session) {
  if (!session?.id) return session;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  try {
    await rest(`client_sessions?${eqFilter('id', session.id)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ expires_at: expiresAt }),
    });
    return { ...session, expires_at: expiresAt };
  } catch {
    return session;
  }
}

async function logoutSession(token) {
  if (!token) return;
  await fetch(`${supabaseUrl()}/rest/v1/client_sessions?${eqFilter('token_hash', hashValue(token))}`, {
    method: 'DELETE',
    headers: restHeaders({ Prefer: 'return=minimal' }),
  });
}

function fieldFromMessage(message, label) {
  const match = String(message || '').match(new RegExp(`^${label}:\\s*(.*)$`, 'mi'));
  return match ? match[1].trim() : '';
}

function asRide(row) {
  const meta = row.meta && typeof row.meta === 'object' ? row.meta : {};
  const message = row.message || '';
  const pickup = meta.pickup || fieldFromMessage(message, 'Pickup');
  const dropoff = meta.dropoff || fieldFromMessage(message, 'Dropoff');
  const date = meta.date || fieldFromMessage(message, 'Date');
  const time = meta.time || fieldFromMessage(message, 'Time');
  const service = meta.service || fieldFromMessage(message, 'Service');
  const vehicle = meta.vehicle || fieldFromMessage(message, 'Vehicle');
  const when = date && time && time !== 'N/A' ? `${date} ${time}` : date || '';
  let past = row.status === 'closed';
  if (!past && date && date !== 'N/A') {
    const parsed = new Date(`${date}T${/^\d{1,2}:\d{2}/.test(time) ? time : '23:59'}`);
    if (!Number.isNaN(parsed.getTime())) past = parsed.getTime() < Date.now();
  }
  return {
    id: row.id,
    createdAt: row.created_at,
    type: row.type,
    status: row.status,
    subject: row.subject,
    message,
    pickup,
    dropoff,
    date,
    time,
    when,
    service,
    vehicle,
    passengers: meta.passengers || fieldFromMessage(message, 'Passengers'),
    airport: meta.airport || fieldFromMessage(message, 'Airport'),
    flight: meta.flight || fieldFromMessage(message, 'Flight'),
    miles: meta.miles,
    quoteCents: meta.quoteCents,
    paymentStatus: meta.paymentStatus || '',
    rideCategory: meta.rideCategory || '',
    stops: meta.stops || [],
    trackToken: meta.trip?.trackToken || '',
    tripStatus: meta.trip?.status || '',
    tripLive: ['on_my_way', 'on_location', 'on_board'].includes(meta.trip?.status),
    driverName: meta.trip?.driverName || '',
    lastPing: meta.trip?.lastPing || null,
    tripMessages: meta.trip?.messages || [],
    past: row.status === 'cancelled' || row.status === 'closed' || past,
  };
}

async function leadsForEmail(email) {
  const normalized = normalizeEmail(email);
  const rows = await rest(
    `leads?${ilikeFilter('email', normalized)}&select=*&order=created_at.desc&limit=100`,
    { headers: { Prefer: 'return=representation' } }
  );
  return rows || [];
}

async function profileForEmail(email) {
  const normalized = normalizeEmail(email);
  try {
    const rows = await rest(
      `client_profiles?${eqFilter('email', normalized)}&limit=1`,
      { headers: { Prefer: 'return=representation' } }
    );
    return Array.isArray(rows) ? rows[0] : null;
  } catch {
    return null;
  }
}

function profileFromLeads(rows) {
  const named = (rows || []).find((row) => row.name);
  const phoned = (rows || []).find((row) => row.phone);
  return {
    name: named?.name || '',
    phone: phoned?.phone || '',
    notes: '',
  };
}

async function accountForEmail(email) {
  const rows = await leadsForEmail(email);
  const stored = await profileForEmail(email);
  const derived = profileFromLeads(rows);
  const profile = {
    email,
    name: stored?.name || derived.name,
    phone: stored?.phone || derived.phone,
    notes: stored?.notes || '',
  };
  const rides = rows
    .filter((row) => row.type === 'booking' || (row.meta && row.meta.pickup))
    .map(asRide);
  const rideIds = new Set(rides.map((ride) => ride.id));
  const messages = rows
    .filter((row) => !rideIds.has(row.id))
    .map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      type: row.type,
      status: row.status,
      subject: row.subject,
      message: row.message,
    }));
  return { profile, rides, messages };
}

async function saveProfile(email, updates) {
  const normalized = normalizeEmail(email);
  const name = String(updates.name || '').trim().slice(0, 120);
  const phone = String(updates.phone || '').trim().slice(0, 40);
  const notes = String(updates.notes || '').trim().slice(0, 1000);
  await rest('client_profiles?on_conflict=email', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify({
      email: normalized,
      name,
      phone,
      notes,
      updated_at: new Date().toISOString(),
    }),
  });
  return { email: normalized, name, phone, notes };
}

module.exports = {
  hasClientStore,
  requestOtp,
  verifyOtp,
  sessionFromToken,
  touchSession,
  logoutSession,
  leadsForEmail,
  accountForEmail,
  saveProfile,
  normalizeEmail,
};
