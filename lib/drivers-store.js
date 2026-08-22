const fs = require('fs');
const path = require('path');
const { createHash, randomUUID } = require('crypto');

const FILE = path.join(process.cwd(), 'data', 'drivers.json');
const SESSION_FILE = path.join(process.cwd(), 'data', 'driver-sessions.json');

function hasSupabase() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function supabaseUrl() {
  return String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
}

function restHeaders(extra = {}) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

function pepper() {
  return process.env.STAFF_INBOX_TOKEN || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dev';
}

function hashValue(value) {
  return createHash('sha256').update(`${value}:${pepper()}`).digest('hex');
}

function hashPin(pin) {
  return hashValue(String(pin || '').trim());
}

function publicDriver(row) {
  if (!row) return null;
  return {
    id: row.id,
    createdAt: row.createdAt || row.created_at,
    name: row.name,
    phone: row.phone,
    email: row.email || '',
    vehicle: row.vehicle || '',
    licenseNo: row.licenseNo || row.license_no || '',
    active: row.active !== false,
    notes: row.notes || '',
  };
}

function ensureFile(file, fallback) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(file)) fs.writeFileSync(file, fallback);
}

function readLocalDrivers() {
  try {
    ensureFile(FILE, '[]');
    const parsed = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalDrivers(rows) {
  ensureFile(FILE, '[]');
  fs.writeFileSync(FILE, JSON.stringify(rows, null, 2));
}

function readLocalSessions() {
  try {
    ensureFile(SESSION_FILE, '[]');
    const parsed = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalSessions(rows) {
  ensureFile(SESSION_FILE, '[]');
  fs.writeFileSync(SESSION_FILE, JSON.stringify(rows, null, 2));
}

function digits(phone) {
  return String(phone || '').replace(/\D/g, '');
}

async function supabaseRest(pathPart, options = {}) {
  const resp = await fetch(`${supabaseUrl()}/rest/v1/${pathPart}`, {
    ...options,
    headers: restHeaders(options.headers || {}),
  });
  if (!resp.ok) {
    const text = await resp.text();
    const err = new Error(text || `Supabase ${resp.status}`);
    err.status = resp.status;
    throw err;
  }
  if (resp.status === 204) return null;
  return resp.json();
}

async function listDrivers() {
  if (hasSupabase()) {
    try {
      const rows = await supabaseRest('drivers?select=*&order=created_at.desc');
      return (rows || []).map((row) => publicDriver({
        id: row.id,
        createdAt: row.created_at,
        name: row.name,
        phone: row.phone,
        email: row.email,
        vehicle: row.vehicle,
        licenseNo: row.license_no,
        active: row.active,
        notes: row.notes,
      }));
    } catch (err) {
      if (err.status === 404 || /does not exist|schema cache/i.test(err.message || '')) {
        throw new Error('Run supabase/driver-ops.sql in the Supabase SQL editor so chauffeurs can be saved.');
      }
    }
  }
  return readLocalDrivers().map(publicDriver);
}

async function getDriver(id) {
  const list = await listDrivers();
  return list.find((row) => row.id === id) || null;
}

async function upsertDriver(input) {
  const name = String(input.name || '').trim();
  const phone = String(input.phone || '').trim();
  if (!name || digits(phone).length < 10) {
    throw new Error('Driver name and a 10-digit phone are required');
  }
  const pin = String(input.pin || '').trim();
  const id = input.id || randomUUID();
  const existing = input.id ? await getDriverInternal(input.id) : null;
  if (!existing && !/^\d{4,6}$/.test(pin)) {
    throw new Error('Set a 4–6 digit PIN the chauffeur will use to sign in');
  }
  const row = {
    id,
    createdAt: existing?.createdAt || new Date().toISOString(),
    name,
    phone,
    email: String(input.email || '').trim().toLowerCase(),
    vehicle: String(input.vehicle || '').trim(),
    licenseNo: String(input.licenseNo || '').trim(),
    notes: String(input.notes || '').trim(),
    active: input.active !== false,
    pinHash: pin ? hashPin(pin) : existing?.pinHash,
  };
  if (hasSupabase()) {
    try {
      await supabaseRest('drivers?on_conflict=id', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({
          id: row.id,
          name: row.name,
          phone: row.phone,
          email: row.email,
          vehicle: row.vehicle,
          license_no: row.licenseNo,
          notes: row.notes,
          active: row.active,
          pin_hash: row.pinHash,
        }),
      });
    } catch (err) {
      if (err.status === 404 || /does not exist|schema cache/i.test(err.message || '')) {
        throw new Error('Run supabase/driver-ops.sql in the Supabase SQL editor so chauffeurs can be saved.');
      }
      throw err;
    }
  }
  const local = readLocalDrivers().filter((item) => item.id !== row.id);
  local.unshift(row);
  writeLocalDrivers(local);
  return publicDriver(row);
}

async function getDriverInternal(id) {
  if (hasSupabase()) {
    try {
      const rows = await supabaseRest(`drivers?id=eq.${encodeURIComponent(id)}&select=*&limit=1`);
      if (rows && rows[0]) {
        return {
          id: rows[0].id,
          createdAt: rows[0].created_at,
          name: rows[0].name,
          phone: rows[0].phone,
          email: rows[0].email,
          vehicle: rows[0].vehicle,
          licenseNo: rows[0].license_no,
          notes: rows[0].notes,
          active: rows[0].active,
          pinHash: rows[0].pin_hash,
        };
      }
    } catch {
      // local
    }
  }
  return readLocalDrivers().find((row) => row.id === id) || null;
}

async function findDriverByPhone(phone) {
  const needle = digits(phone);
  if (hasSupabase()) {
    try {
      const rows = await supabaseRest('drivers?select=*&limit=50');
      const match = (rows || []).find((row) => digits(row.phone) === needle || digits(row.phone).endsWith(needle.slice(-10)));
      if (match) {
        return {
          id: match.id,
          name: match.name,
          phone: match.phone,
          email: match.email,
          vehicle: match.vehicle,
          active: match.active,
          pinHash: match.pin_hash,
        };
      }
    } catch {
      // local
    }
  }
  return readLocalDrivers().find((row) => digits(row.phone) === needle || digits(row.phone).endsWith(needle.slice(-10))) || null;
}

async function createDriverSession(driver) {
  const token = randomUUID();
  const tokenHash = hashValue(token);
  const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
  if (hasSupabase()) {
    try {
      await supabaseRest('driver_sessions', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({
          token_hash: tokenHash,
          driver_id: driver.id,
          expires_at: expiresAt,
        }),
      });
    } catch {
      // local
    }
  }
  const sessions = readLocalSessions().filter((row) => row.driverId !== driver.id);
  sessions.push({ tokenHash, driverId: driver.id, expiresAt });
  writeLocalSessions(sessions);
  return { token, expiresAt, driver: publicDriver(driver) };
}

async function sessionFromToken(token) {
  const tokenHash = hashValue(String(token || ''));
  if (!token) return null;
  if (hasSupabase()) {
    try {
      const rows = await supabaseRest(
        `driver_sessions?token_hash=eq.${encodeURIComponent(tokenHash)}&select=*&limit=1`
      );
      const row = rows && rows[0];
      if (row && new Date(row.expires_at).getTime() > Date.now()) {
        const driver = await getDriverInternal(row.driver_id);
        if (driver && driver.active !== false) return { driver: publicDriver(driver), driverId: driver.id };
      }
    } catch {
      // local
    }
  }
  const local = readLocalSessions().find((row) => row.tokenHash === tokenHash);
  if (!local || new Date(local.expiresAt).getTime() < Date.now()) return null;
  const driver = await getDriverInternal(local.driverId);
  if (!driver || driver.active === false) return null;
  return { driver: publicDriver(driver), driverId: driver.id };
}

async function loginDriver(phone, pin) {
  const driver = await findDriverByPhone(phone);
  if (!driver || driver.active === false) {
    throw new Error('No chauffeur found for that phone');
  }
  if (driver.pinHash !== hashPin(pin)) {
    throw new Error('PIN did not match');
  }
  return createDriverSession(driver);
}

module.exports = {
  listDrivers,
  getDriver,
  upsertDriver,
  loginDriver,
  sessionFromToken,
  publicDriver,
};
