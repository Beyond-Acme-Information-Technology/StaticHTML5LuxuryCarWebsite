const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const FILE = path.join(process.cwd(), 'data', 'leads.json');

function hasSupabase() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function ensureLocalFile() {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, '[]');
}

function readLocal() {
  try {
    ensureLocalFile();
    const parsed = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(leads) {
  ensureLocalFile();
  fs.writeFileSync(FILE, JSON.stringify(leads.slice(0, 500), null, 2));
}

function toRow(record) {
  return {
    id: record.id,
    created_at: record.createdAt,
    type: record.type,
    status: record.status,
    name: record.name,
    email: record.email,
    phone: record.phone,
    subject: record.subject,
    message: record.message,
    meta: record.meta || {},
  };
}

function fromRow(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    type: row.type,
    status: row.status,
    name: row.name,
    email: row.email,
    phone: row.phone,
    subject: row.subject,
    message: row.message,
    meta: row.meta || {},
  };
}

async function supabaseInsert(record) {
  const url = process.env.SUPABASE_URL.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resp = await fetch(`${url}/rest/v1/leads`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(toRow(record)),
  });
  if (!resp.ok) {
    throw new Error(`Supabase insert failed: ${resp.status} ${await resp.text()}`);
  }
}

async function supabaseList() {
  const url = process.env.SUPABASE_URL.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resp = await fetch(`${url}/rest/v1/leads?select=*&order=created_at.desc&limit=200`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });
  if (!resp.ok) {
    throw new Error(`Supabase list failed: ${resp.status}`);
  }
  const rows = await resp.json();
  return rows.map(fromRow);
}

async function supabaseUpdate(id, status) {
  const url = process.env.SUPABASE_URL.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resp = await fetch(`${url}/rest/v1/leads?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ status }),
  });
  if (!resp.ok) {
    throw new Error(`Supabase update failed: ${resp.status}`);
  }
}

function storeKind() {
  if (hasSupabase()) return 'supabase';
  return 'local';
}

async function saveLead(payload) {
  const record = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    status: 'new',
    type: payload.type || 'contact',
    name: payload.name || '',
    email: payload.email || '',
    phone: payload.phone || '',
    subject: payload.subject || '',
    message: payload.message || '',
    meta: payload.meta || {},
  };

  if (hasSupabase()) {
    await supabaseInsert(record);
  }

  try {
    const leads = readLocal();
    leads.unshift(record);
    writeLocal(leads);
  } catch (err) {
    console.error('Local lead save failed:', err.message);
  }

  return record;
}

async function listLeads() {
  if (hasSupabase()) {
    try {
      return await supabaseList();
    } catch (err) {
      console.error('Supabase list failed, falling back to local:', err.message);
    }
  }
  return readLocal();
}

async function updateLeadStatus(id, status) {
  const allowed = ['new', 'contacted', 'confirmed', 'closed'];
  if (!allowed.includes(status)) {
    throw new Error('Invalid status');
  }

  if (hasSupabase()) {
    try {
      await supabaseUpdate(id, status);
    } catch (err) {
      console.error('Supabase update failed:', err.message);
    }
  }

  const leads = readLocal();
  const next = leads.map((lead) => (lead.id === id ? { ...lead, status } : lead));
  writeLocal(next);
  return next.find((lead) => lead.id === id) || { id, status };
}

module.exports = {
  saveLead,
  listLeads,
  updateLeadStatus,
  storeKind,
  hasSupabase,
};
