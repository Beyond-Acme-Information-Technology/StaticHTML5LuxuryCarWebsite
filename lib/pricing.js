const { randomUUID } = require('crypto');

const CATEGORIES = ['regular', 'medical_non_urgent', 'patient_equipment'];

const DEFAULTS = {
  US: {
    regular: {
      baseCents: 4500,
      perMileCents: 450,
      perStopCents: 1500,
      waitPerMinuteCents: 150,
      currency: 'usd',
    },
    medical_non_urgent: {
      baseCents: 6500,
      perMileCents: 525,
      perStopCents: 2000,
      waitPerMinuteCents: 200,
      currency: 'usd',
    },
    patient_equipment: {
      baseCents: 8500,
      perMileCents: 650,
      perStopCents: 2500,
      waitPerMinuteCents: 250,
      currency: 'usd',
    },
  },
};

function supabaseUrl() {
  return String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
}

function supabaseKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || '';
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

function defaultRate(country, category) {
  const cc = String(country || 'US').toUpperCase();
  const cat = CATEGORIES.includes(category) ? category : 'regular';
  return {
    country: DEFAULTS[cc] ? cc : 'US',
    rideCategory: cat,
    ...(DEFAULTS[cc] || DEFAULTS.US)[cat],
  };
}

async function listRates() {
  if (supabaseUrl() && supabaseKey()) {
    const resp = await fetch(`${supabaseUrl()}/rest/v1/pricing_rates?select=*&order=country,ride_category`, {
      headers: restHeaders(),
    });
    if (resp.ok) {
      const rows = await resp.json();
      if (Array.isArray(rows) && rows.length) {
        return rows.map((row) => ({
          country: row.country,
          rideCategory: row.ride_category,
          currency: row.currency || 'usd',
          baseCents: row.base_cents,
          perMileCents: row.per_mile_cents,
          perStopCents: row.per_stop_cents,
          waitPerMinuteCents: row.wait_per_minute_cents,
        }));
      }
    }
  }
  return Object.entries(DEFAULTS).flatMap(([country, cats]) =>
    Object.entries(cats).map(([rideCategory, rate]) => ({ country, rideCategory, ...rate }))
  );
}

async function upsertRate(rate) {
  const country = String(rate.country || 'US').toUpperCase().slice(0, 2);
  const rideCategory = CATEGORIES.includes(rate.rideCategory) ? rate.rideCategory : 'regular';
  const row = {
    country,
    ride_category: rideCategory,
    currency: 'usd',
    base_cents: Math.max(0, Math.round(Number(rate.baseCents) || 0)),
    per_mile_cents: Math.max(0, Math.round(Number(rate.perMileCents) || 0)),
    per_stop_cents: Math.max(0, Math.round(Number(rate.perStopCents) || 0)),
    wait_per_minute_cents: Math.max(0, Math.round(Number(rate.waitPerMinuteCents) || 0)),
    updated_at: new Date().toISOString(),
  };
  if (!supabaseUrl() || !supabaseKey()) {
    return {
      country,
      rideCategory,
      currency: 'usd',
      baseCents: row.base_cents,
      perMileCents: row.per_mile_cents,
      perStopCents: row.per_stop_cents,
      waitPerMinuteCents: row.wait_per_minute_cents,
    };
  }
  const resp = await fetch(`${supabaseUrl()}/rest/v1/pricing_rates?on_conflict=country,ride_category`, {
    method: 'POST',
    headers: restHeaders({ Prefer: 'resolution=merge-duplicates,return=representation' }),
    body: JSON.stringify(row),
  });
  if (!resp.ok) {
    throw new Error(`Could not save rate: ${resp.status} ${await resp.text()}`);
  }
  return {
    country,
    rideCategory,
    currency: 'usd',
    baseCents: row.base_cents,
    perMileCents: row.per_mile_cents,
    perStopCents: row.per_stop_cents,
    waitPerMinuteCents: row.wait_per_minute_cents,
  };
}

async function rateFor(country, category) {
  const rates = await listRates();
  const cc = String(country || 'US').toUpperCase();
  const cat = CATEGORIES.includes(category) ? category : 'regular';
  return (
    rates.find((row) => row.country === cc && row.rideCategory === cat) ||
    rates.find((row) => row.country === 'US' && row.rideCategory === cat) ||
    defaultRate(cc, cat)
  );
}

function computeQuote({ miles, stopCount, rate }) {
  const mileageCents = Math.round(Number(miles || 0) * rate.perMileCents);
  const stopCents = Math.max(0, Number(stopCount || 0)) * rate.perStopCents;
  const lineItems = [
    { label: 'Base fare', cents: rate.baseCents },
    { label: `${miles} miles × ${(rate.perMileCents / 100).toFixed(2)}`, cents: mileageCents },
  ];
  if (stopCents) {
    lineItems.push({ label: `${stopCount} extra stop${stopCount === 1 ? '' : 's'}`, cents: stopCents });
  }
  const totalCents = lineItems.reduce((sum, item) => sum + item.cents, 0);
  return {
    quoteId: randomUUID(),
    currency: rate.currency || 'usd',
    country: rate.country,
    rideCategory: rate.rideCategory,
    miles,
    stopCount,
    lineItems,
    totalCents,
    waitPerMinuteCents: rate.waitPerMinuteCents,
  };
}

module.exports = {
  CATEGORIES,
  DEFAULTS,
  listRates,
  upsertRate,
  rateFor,
  computeQuote,
  defaultRate,
};
