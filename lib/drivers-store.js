const fs = require('fs');
const path = require('path');
const { createHash, randomUUID } = require('crypto');

const FILE = path.join(process.cwd(), 'data', 'drivers.json');
const SESSION_FILE = path.join(process.cwd(), 'data', 'driver-sessions.json');
const ROSTER_ID = '11111111-1111-4111-8111-111111111111';
const ROSTER_TYPE = 'chauffeur_roster';

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

function tableMissing(err) {
  const msg = String((err && err.message) || '');
  return Boolean(
    err &&
      (err.status === 404 ||
        /does not exist|schema cache|PGRST205|Could not find the table/i.test(msg))
  );
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

function fromDriversTable(row) {
  return {
    id: row.id,
    createdAt: row.created_at || row.createdAt,
    name: row.name,
    phone: row.phone,
    email: row.email || '',
    vehicle: row.vehicle || '',
    licenseNo: row.license_no || row.licenseNo || '',
    notes: row.notes || '',
    active: row.active !== false,
    pinHash: row.pin_hash || row.pinHash,
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
  try {
    ensureFile(FILE, '[]');
    fs.writeFileSync(FILE, JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error('local driver save skipped:', err.message);
  }
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
  try {
    ensureFile(SESSION_FILE, '[]');
    fs.writeFileSync(SESSION_FILE, JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error('local driver session save skipped:', err.message);
  }
}

function digits(phone) {
  return String(phone || '').replace(/\D/g, '');
}

function phoneMatch(stored, needle) {
  const have = digits(stored);
  if (!have || !needle) return false;
  return have === needle || have.endsWith(needle.slice(-10)) || needle.endsWith(have.slice(-10));
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
  const ct = String(resp.headers.get('content-type') || '');
  if (!ct.includes('json')) return null;
  return resp.json();
}

async function readLeadRoster() {
  const rows = await supabaseRest(`leads?id=eq.${ROSTER_ID}&select=*&limit=1`);
  const row = Array.isArray(rows) && rows[0] ? rows[0] : null;
  const meta = row && row.meta ? row.meta : {};
  return {
    drivers: Array.isArray(meta.drivers) ? meta.drivers : [],
    sessions: Array.isArray(meta.sessions) ? meta.sessions : [],
  };
}

async function writeLeadRoster(roster) {
  const now = Date.now();
  const sessions = (roster.sessions || []).filter(
    (row) => row && row.expiresAt && new Date(row.expiresAt).getTime() > now
  );
  await supabaseRest('leads?on_conflict=id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({
      id: ROSTER_ID,
      type: ROSTER_TYPE,
      status: 'closed',
      name: 'Chauffeur roster',
      email: '',
      phone: '',
      subject: 'Internal chauffeur roster',
      message: '',
      meta: {
        drivers: roster.drivers || [],
        sessions,
      },
    }),
  });
}

async function loadInternalDrivers() {
  const byId = new Map();
  const add = (rows) => {
    (rows || []).forEach((row) => {
      if (row && row.id && !byId.has(row.id)) byId.set(row.id, row);
    });
  };
  if (hasSupabase()) {
    try {
      const rows = await supabaseRest('drivers?select=*&order=created_at.desc');
      add((rows || []).map(fromDriversTable));
    } catch (err) {
      console.error('drivers table list:', err.message);
    }
    try {
      add((await readLeadRoster()).drivers);
    } catch (err) {
      console.error('chauffeur roster list:', err.message);
    }
  }
  add(readLocalDrivers());
  return Array.from(byId.values()).sort((a, b) =>
    String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
  );
}

async function saveInternalDrivers(rows) {
  if (hasSupabase()) {
    try {
      const roster = await readLeadRoster().catch(() => ({ sessions: [] }));
      await writeLeadRoster({
        ...roster,
        drivers: rows,
      });
    } catch (err) {
      console.error('chauffeur roster save:', err.message);
      throw new Error('Could not save chauffeur. Confirm the staff inbox database is available.');
    }
  }
  writeLocalDrivers(rows);
}

async function listDrivers() {
  return (await loadInternalDrivers()).map(publicDriver);
}

async function getDriver(id) {
  const list = await listDrivers();
  return list.find((row) => row.id === id) || null;
}

async function getDriverInternal(id) {
  return (await loadInternalDrivers()).find((row) => row.id === id) || null;
}

async function findDriverByPhone(phone) {
  const needle = digits(phone);
  if (needle.length < 10) return null;
  return (await loadInternalDrivers()).find((row) => phoneMatch(row.phone, needle)) || null;
}

async function upsertDriver(input) {
  const name = String(input.name || '').trim();
  const phone = String(input.phone || '').trim();
  if (!name || digits(phone).length < 10) {
    throw new Error('Driver name and a 10-digit phone are required');
  }
  const pin = String(input.pin || '').trim();
  const existing = input.id
    ? await getDriverInternal(input.id)
    : await findDriverByPhone(phone);
  if (!existing && !/^\d{4,6}$/.test(pin)) {
    throw new Error('Set a 4–6 digit PIN the chauffeur will use to sign in');
  }
  if (pin && !/^\d{4,6}$/.test(pin)) {
    throw new Error('PIN must be 4–6 digits');
  }
  const row = {
    id: existing?.id || input.id || randomUUID(),
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
  if (!row.pinHash) {
    throw new Error('Set a 4–6 digit PIN the chauffeur will use to sign in');
  }

  if (hasSupabase()) {
    try {
      await supabaseRest('drivers?on_conflict=id', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({
          id: row.id,
          created_at: row.createdAt,
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
      console.error('drivers table save:', err.message);
    }
  }

  const local = (await loadInternalDrivers()).filter((item) => item.id !== row.id);
  local.unshift(row);
  await saveInternalDrivers(local);
  return publicDriver(row);
}

async function createDriverSession(driver) {
  const token = randomUUID();
  const tokenHash = hashValue(token);
  const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
  const session = { tokenHash, driverId: driver.id, expiresAt };

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
    } catch (err) {
      console.error('driver session:', err.message);
    }
    try {
      const roster = await readLeadRoster();
      const already = (roster.sessions || []).some(
        (row) => row.tokenHash === tokenHash && new Date(row.expiresAt).getTime() > Date.now()
      );
      if (!already) {
        await writeLeadRoster({
          ...roster,
          sessions: (roster.sessions || [])
            .filter((row) => row.driverId !== driver.id)
            .concat(session),
        });
      }
    } catch (rosterErr) {
      console.error('driver session roster:', rosterErr.message);
    }
  }
  const sessions = readLocalSessions().filter((row) => row.driverId !== driver.id);
  sessions.push(session);
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
    } catch (err) {
      console.error('driver session lookup:', err.message);
    }
    try {
      const roster = await readLeadRoster();
      const row = (roster.sessions || []).find((item) => item.tokenHash === tokenHash);
      if (row && new Date(row.expiresAt).getTime() > Date.now()) {
        const driver = await getDriverInternal(row.driverId);
        if (driver && driver.active !== false) {
          return { driver: publicDriver(driver), driverId: driver.id };
        }
      }
    } catch (rosterErr) {
      console.error('chauffeur session roster:', rosterErr.message);
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
  ROSTER_TYPE,
};
